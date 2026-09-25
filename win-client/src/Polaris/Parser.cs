using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Polaris;

static class Parser
{
    public static List<ProxyConfig> Parse(string text)
    {
        var trimmed = text.Trim();
        if (string.IsNullOrEmpty(trimmed)) return new();
        var outList = new List<ProxyConfig>();
        var seen = new HashSet<string>();

        void Add(ProxyConfig? c)
        {
            if (c == null || string.IsNullOrWhiteSpace(c.Address)) return;
            var key = $"{c.Protocol}|{c.Address}|{c.Port}|{c.Uuid}|{c.Password}";
            if (!seen.Add(key)) return;
            if (string.IsNullOrWhiteSpace(c.Remark)) c.Remark = $"{c.Protocol} {c.Address}";
            outList.Add(c);
        }

        if (TryJson(trimmed, Add) && outList.Count > 0) return outList;

        var b64 = DecodeB64(Regex.Replace(trimmed, @"\s+", ""));
        if (!string.IsNullOrEmpty(b64) && b64 != trimmed)
        {
            var inner = Parse(b64);
            if (inner.Count > 0) return inner;
        }

        foreach (var line in trimmed.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries))
        {
            var t = line.Trim();
            if (t.StartsWith("#") || t.StartsWith("//")) continue;
            if (t.StartsWith("{") || t.StartsWith("[")) { TryJson(t, Add); continue; }
            Add(ParseUri(t));
        }

        if (outList.Count == 0)
        {
            foreach (Match m in Regex.Matches(trimmed, @"[a-zA-Z][a-zA-Z0-9+.-]*://[^\s]+"))
                Add(ParseUri(m.Value));
        }
        return outList;
    }

    static bool TryJson(string s, Action<ProxyConfig?> add)
    {
        try
        {
            using var doc = JsonDocument.Parse(s);
            CollectJson(doc.RootElement, s, add);
            return true;
        }
        catch { return false; }
    }

    static void CollectJson(JsonElement el, string raw, Action<ProxyConfig?> add)
    {
        if (el.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in el.EnumerateArray())
                add(FromGeneric(item, raw, LooksNapsternet(item) ? "napsternet" : "xray-json"));
            return;
        }
        if (el.ValueKind != JsonValueKind.Object) return;
        if (el.TryGetProperty("outbounds", out var obs) && obs.ValueKind == JsonValueKind.Array)
        {
            foreach (var ob in obs.EnumerateArray())
            {
                var parsed = FromXrayOutbound(ob, raw) ?? FromSingbox(ob, raw);
                if (parsed != null) add(parsed);
            }
            return;
        }
        if (el.TryGetProperty("proxies", out var px) && px.ValueKind == JsonValueKind.Array)
        {
            foreach (var p in px.EnumerateArray()) add(FromGeneric(p, raw, "clash"));
            return;
        }
        if (el.TryGetProperty("servers", out var sv) && sv.ValueKind == JsonValueKind.Array)
        {
            foreach (var p in sv.EnumerateArray())
                add(FromGeneric(p, raw, LooksNapsternet(p) ? "napsternet" : "xray-json"));
            return;
        }
        add(FromGeneric(el, raw, LooksNapsternet(el) ? "napsternet" : "xray-json"));
    }

    static ProxyConfig? ParseUri(string uri)
    {
        uri = uri.Trim();
        var schemeEnd = uri.IndexOf("://", StringComparison.Ordinal);
        if (schemeEnd < 0) return null;
        var scheme = uri[..schemeEnd].ToLowerInvariant();
        if (scheme == "vmess") return ParseVmess(uri);
        if (scheme is "ss" or "shadowsocks") return ParseSs(uri);

        var proto = NormalizeProto(scheme == "hy2" ? "hysteria2" : scheme);
        var rest = uri[(schemeEnd + 3)..];
        var hash = rest.LastIndexOf('#');
        var remark = hash >= 0 ? Uri.UnescapeDataString(rest[(hash + 1)..]) : "";
        var body = hash >= 0 ? rest[..hash] : rest;
        var qIdx = body.IndexOf('?');
        var main = qIdx >= 0 ? body[..qIdx] : body;
        var q = qIdx >= 0 ? ParseQuery(body[qIdx..]) : null;

        string user = "", hostport = main;
        var at = main.LastIndexOf('@');
        if (at >= 0)
        {
            user = Uri.UnescapeDataString(main[..at]);
            hostport = main[(at + 1)..];
        }
        if (!SplitHostPort(hostport, out var host, out var port)) return null;

        var cfg = new ProxyConfig
        {
            Remark = string.IsNullOrEmpty(remark) ? $"{proto} {host}" : remark,
            Protocol = proto,
            Address = host,
            Port = port,
            Raw = uri,
            Source = "uri",
        };
        if (proto is "vless" or "vmess" or "tuic")
        {
            var colon = user.IndexOf(':');
            if (colon >= 0) { cfg.Uuid = user[..colon]; cfg.Password = user[(colon + 1)..]; }
            else { cfg.Uuid = user; if (proto == "tuic") cfg.Password = user; }
        }
        else
        {
            cfg.Password = user;
            if (proto is "socks" or "http")
            {
                var colon = user.IndexOf(':');
                if (colon >= 0) { cfg.Uuid = user[..colon]; cfg.Password = user[(colon + 1)..]; }
            }
        }
        ApplyQuery(cfg, q);
        if (string.IsNullOrEmpty(cfg.Sni) && !string.IsNullOrEmpty(cfg.Host)) cfg.Sni = cfg.Host;
        return cfg;
    }

    static ProxyConfig? ParseVmess(string uri)
    {
        var payload = uri["vmess://".Length..];
        var decoded = DecodeB64(payload);
        if (decoded == null) return null;
        try
        {
            using var doc = JsonDocument.Parse(decoded);
            var o = doc.RootElement;
            var cfg = FromGeneric(o, uri, "uri");
            if (cfg != null) cfg.Protocol = "vmess";
            return cfg;
        }
        catch { return ParseUri(uri.Replace("vmess://", "vless://", StringComparison.OrdinalIgnoreCase)); }
    }

    static ProxyConfig? ParseSs(string uri)
    {
        var payload = uri[(uri.IndexOf("://", StringComparison.Ordinal) + 3)..];
        var hash = payload.LastIndexOf('#');
        var remark = hash >= 0 ? Uri.UnescapeDataString(payload[(hash + 1)..]) : "";
        var body = hash >= 0 ? payload[..hash] : payload;
        var qIdx = body.IndexOf('?');
        var q = qIdx >= 0 ? ParseQuery(body[qIdx..]) : null;
        if (qIdx >= 0) body = body[..qIdx];

        string userinfo = "", hostport = body;
        if (body.Contains('@'))
        {
            var at = body.LastIndexOf('@');
            userinfo = body[..at];
            hostport = body[(at + 1)..];
            var dec = DecodeB64(userinfo);
            if (dec != null && dec.Contains(':')) userinfo = dec;
            else userinfo = Uri.UnescapeDataString(userinfo);
        }
        else
        {
            var dec = DecodeB64(body);
            if (dec != null && dec.Contains('@'))
            {
                var at = dec.LastIndexOf('@');
                userinfo = dec[..at];
                hostport = dec[(at + 1)..];
            }
        }
        if (!SplitHostPort(hostport, out var host, out var port)) return null;
        var colon = userinfo.IndexOf(':');
        var cfg = new ProxyConfig
        {
            Remark = string.IsNullOrEmpty(remark) ? $"SS {host}" : remark,
            Protocol = "ss",
            Address = host,
            Port = port,
            Method = colon >= 0 ? userinfo[..colon] : "aes-256-gcm",
            Password = colon >= 0 ? userinfo[(colon + 1)..] : userinfo,
            Source = "uri",
            Raw = uri,
        };
        ApplyQuery(cfg, q);
        return cfg;
    }

    static void ApplyQuery(ProxyConfig cfg, Dictionary<string, string>? q)
    {
        if (q == null) return;
        string G(params string[] keys)
        {
            foreach (var k in keys)
                if (q.TryGetValue(k, out var v) && !string.IsNullOrEmpty(v)) return v;
            return "";
        }
        var type = G("type", "net", "network");
        if (!string.IsNullOrEmpty(type)) cfg.Network = NormalizeNet(type);
        var sec = G("security", "tls");
        if (!string.IsNullOrEmpty(sec)) cfg.Tls = NormalizeTls(sec);
        cfg.Sni = First(G("sni", "serverName"), cfg.Sni);
        cfg.Host = First(G("host", "authority"), cfg.Host);
        cfg.Path = First(G("path"), cfg.Path);
        cfg.Flow = First(G("flow"), cfg.Flow);
        cfg.Fingerprint = First(G("fp", "fingerprint"), cfg.Fingerprint);
        cfg.Alpn = First(G("alpn"), cfg.Alpn);
        cfg.PublicKey = First(G("pbk", "publicKey", "public-key"), cfg.PublicKey);
        cfg.ShortId = First(G("sid", "shortId", "short-id"), cfg.ShortId);
        cfg.SpiderX = First(G("spx", "spiderX"), cfg.SpiderX);
        cfg.ServiceName = First(G("serviceName", "servicename"), cfg.ServiceName);
        cfg.HeaderType = First(G("headerType", "headertype", "header"), cfg.HeaderType);
        cfg.Encryption = First(G("encryption"), cfg.Encryption);
        cfg.Method = First(G("method", "scy"), cfg.Method);
        if (G("insecure", "allowInsecure", "allowinsecure") is "1" or "true") cfg.AllowInsecure = true;
        if (!string.IsNullOrEmpty(G("mode"))) cfg.GrpcMode = G("mode");
        var obfs = G("obfs"); if (!string.IsNullOrEmpty(obfs)) cfg.Extra["obfs"] = obfs;
        var obfsPw = G("obfs-password", "obfsPassword"); if (!string.IsNullOrEmpty(obfsPw)) cfg.Extra["obfs-password"] = obfsPw;
        var cc = G("congestion_control", "congestion"); if (!string.IsNullOrEmpty(cc)) cfg.Extra["congestion"] = cc;
        if (cfg.Protocol == "wireguard")
        {
            var pk = G("publickey", "peer"); if (!string.IsNullOrEmpty(pk)) cfg.Extra["peerPublicKey"] = pk;
            var mtu = G("mtu"); if (!string.IsNullOrEmpty(mtu)) cfg.Extra["mtu"] = mtu;
        }
        if (!string.IsNullOrEmpty(cfg.PublicKey) && cfg.Tls == "none") cfg.Tls = "reality";
        if (G("security").Equals("reality", StringComparison.OrdinalIgnoreCase)) cfg.Tls = "reality";
    }

    static ProxyConfig FromGeneric(JsonElement o, string raw, string source)
    {
        string P(params string[] keys)
        {
            foreach (var k in keys)
                if (o.TryGetProperty(k, out var v) && v.ValueKind != JsonValueKind.Null)
                    return v.ValueKind == JsonValueKind.String ? v.GetString() ?? "" : v.ToString();
            return "";
        }
        int N(params string[] keys)
        {
            foreach (var k in keys)
                if (o.TryGetProperty(k, out var v) && v.TryGetInt32(out var n)) return n;
                else if (o.TryGetProperty(k, out var s) && int.TryParse(s.ToString(), out var n2)) return n2;
            return 443;
        }
        var proto = NormalizeProto(P("protocol", "type", "configType", "vpnType", "coreType"));
        if (string.IsNullOrEmpty(proto) || proto == "unknown") proto = "vless";
        var cfg = new ProxyConfig
        {
            Remark = First(P("ps", "remarks", "name", "remark", "label"), proto.ToUpperInvariant()),
            Protocol = proto,
            Address = P("add", "server", "address", "hostname", "ip", "host"),
            Port = N("port", "server_port", "serverPort"),
            Uuid = P("id", "uuid", "user", "username"),
            Password = P("password", "passwd", "pass"),
            AlterId = IntOr(o, 0, "aid", "alterId"),
            Method = P("scy", "method", "cipher", "encryption"),
            Network = NormalizeNet(First(P("net", "network", "transport"), "tcp")),
            Host = P("host", "wsHost", "authority"),
            Path = P("path", "wsPath"),
            Tls = NormalizeTls(P("tls", "security", "streamSecurity")),
            Sni = P("sni", "serverName", "peer", "server_name", "servername"),
            Alpn = P("alpn"),
            Fingerprint = P("fp", "fingerprint", "client-fingerprint"),
            Flow = P("flow"),
            PublicKey = P("pbk", "publicKey", "public_key", "public-key"),
            ShortId = P("sid", "shortId", "short_id", "short-id"),
            SpiderX = P("spx", "spiderX"),
            ServiceName = P("serviceName", "service_name", "grpc-service-name"),
            Source = LooksNapsternet(o) ? "napsternet" : source,
            Raw = raw,
            AllowInsecure = Truthy(o, "allowInsecure", "insecure", "skipCertVerify", "skip-cert-verify"),
        };
        if (o.TryGetProperty("tls", out var tlsEl) && (tlsEl.ValueKind == JsonValueKind.True || tlsEl.ToString() == "true"))
            cfg.Tls = string.IsNullOrEmpty(cfg.PublicKey) ? "tls" : "reality";
        if (!string.IsNullOrEmpty(cfg.PublicKey) && cfg.Tls == "none") cfg.Tls = "reality";
        if (string.IsNullOrEmpty(cfg.Sni) && !string.IsNullOrEmpty(cfg.Host)) cfg.Sni = cfg.Host;
        if (cfg.Network == "grpc" && string.IsNullOrEmpty(cfg.ServiceName) && !string.IsNullOrEmpty(cfg.Path))
            cfg.ServiceName = cfg.Path;
        return cfg;
    }

    static ProxyConfig? FromXrayOutbound(JsonElement ob, string raw)
    {
        var proto = Str(ob, "protocol");
        if (proto is "freedom" or "blackhole" or "dns" or "block" or "direct") return null;
        var settings = Obj(ob, "settings");
        var stream = Obj(ob, "streamSettings");
        JsonElement? vnext = null, servers = null, user = null;
        if (settings.HasValue)
        {
            if (Arr0(settings.Value, "vnext", out var vn)) vnext = vn;
            if (Arr0(settings.Value, "servers", out var sv)) servers = sv;
        }
        if (vnext.HasValue && Arr0(vnext.Value, "users", out var u1)) user = u1;
        else if (servers.HasValue && Arr0(servers.Value, "users", out var u2)) user = u2;
        var address = vnext.HasValue ? Str(vnext.Value, "address") : servers.HasValue ? Str(servers.Value, "address") : "";
        if (string.IsNullOrEmpty(address)) return null;
        var port = vnext.HasValue ? Num(vnext.Value, "port", 443) : servers.HasValue ? Num(servers.Value, "port", 443) : 443;
        var tlsSet = stream.HasValue ? Obj(stream.Value, "tlsSettings") ?? Obj(stream.Value, "realitySettings") : null;
        var cfg = new ProxyConfig
        {
            Remark = First(Str(ob, "tag"), address),
            Protocol = NormalizeProto(proto),
            Address = address,
            Port = port,
            Uuid = user.HasValue ? First(Str(user.Value, "id"), Str(user.Value, "uuid")) : "",
            Password = user.HasValue ? Str(user.Value, "password") : settings.HasValue ? Str(settings.Value, "password") : "",
            Flow = user.HasValue ? Str(user.Value, "flow") : "",
            Encryption = user.HasValue ? First(Str(user.Value, "encryption"), "none") : "none",
            Network = stream.HasValue ? NormalizeNet(First(Str(stream.Value, "network"), "tcp")) : "tcp",
            Tls = stream.HasValue ? NormalizeTls(Str(stream.Value, "security")) : "none",
            Source = "xray-json",
            Raw = raw,
        };
        if (tlsSet.HasValue)
        {
            cfg.Sni = First(Str(tlsSet.Value, "serverName"), Str(tlsSet.Value, "server_name"));
            cfg.Fingerprint = Str(tlsSet.Value, "fingerprint");
            cfg.PublicKey = First(Str(tlsSet.Value, "publicKey"), Str(tlsSet.Value, "public_key"));
            cfg.ShortId = First(Str(tlsSet.Value, "shortId"), Str(tlsSet.Value, "short_id"));
            cfg.AllowInsecure = Truthy(tlsSet.Value, "allowInsecure");
        }
        if (stream.HasValue && Obj(stream.Value, "wsSettings") is { } ws)
        {
            cfg.Path = Str(ws, "path");
            if (Obj(ws, "headers") is { } hd) cfg.Host = First(Str(hd, "Host"), Str(hd, "host"));
        }
        if (stream.HasValue && Obj(stream.Value, "grpcSettings") is { } grpc)
            cfg.ServiceName = Str(grpc, "serviceName");
        if (!string.IsNullOrEmpty(cfg.PublicKey)) cfg.Tls = "reality";
        return cfg;
    }

    static ProxyConfig? FromSingbox(JsonElement ob, string raw)
    {
        var type = Str(ob, "type");
        if (type is "" or "direct" or "block" or "dns" or "selector" or "urltest") return null;
        if (string.IsNullOrEmpty(Str(ob, "server"))) return null;
        var tls = Obj(ob, "tls");
        var reality = tls.HasValue ? Obj(tls.Value, "reality") : null;
        var transport = Obj(ob, "transport");
        var cfg = new ProxyConfig
        {
            Remark = First(Str(ob, "tag"), Str(ob, "name"), type),
            Protocol = NormalizeProto(type),
            Address = Str(ob, "server"),
            Port = Num(ob, "server_port", Num(ob, "port", 443)),
            Uuid = Str(ob, "uuid"),
            Password = Str(ob, "password"),
            Flow = Str(ob, "flow"),
            Method = First(Str(ob, "method"), Str(ob, "cipher")),
            Network = transport.HasValue ? NormalizeNet(First(Str(transport.Value, "type"), "tcp")) : "tcp",
            Path = transport.HasValue ? Str(transport.Value, "path") : "",
            ServiceName = transport.HasValue ? Str(transport.Value, "service_name") : "",
            Source = "singbox",
            Raw = raw,
        };
        if (tls.HasValue)
        {
            cfg.Sni = Str(tls.Value, "server_name");
            cfg.AllowInsecure = Truthy(tls.Value, "insecure");
            cfg.Tls = reality.HasValue && !string.IsNullOrEmpty(Str(reality.Value, "public_key")) ? "reality"
                : Truthy(tls.Value, "enabled") ? "tls" : "none";
            if (reality.HasValue)
            {
                cfg.PublicKey = Str(reality.Value, "public_key");
                cfg.ShortId = Str(reality.Value, "short_id");
            }
        }
        return cfg;
    }

    static bool LooksNapsternet(JsonElement o) =>
        Has(o, "npv") || Has(o, "vpnType") || Has(o, "configType") || Has(o, "coreType");

    static bool Has(JsonElement o, string k) => o.ValueKind == JsonValueKind.Object && o.TryGetProperty(k, out _);
    static bool Truthy(JsonElement o, params string[] keys)
    {
        foreach (var k in keys)
            if (o.TryGetProperty(k, out var v) && (v.ValueKind == JsonValueKind.True || v.ToString() is "true" or "1"))
                return true;
        return false;
    }
    static string Str(JsonElement o, string k) =>
        o.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() ?? "" :
        o.TryGetProperty(k, out var n) && n.ValueKind != JsonValueKind.Null ? n.ToString() : "";
    static int Num(JsonElement o, string k, int fb) =>
        o.TryGetProperty(k, out var v) && v.TryGetInt32(out var n) ? n :
        o.TryGetProperty(k, out var s) && int.TryParse(s.ToString(), out var n2) ? n2 : fb;
    static int IntOr(JsonElement o, int fb, params string[] keys)
    {
        foreach (var k in keys)
        {
            if (o.TryGetProperty(k, out var v) && v.TryGetInt32(out var n)) return n;
            if (o.TryGetProperty(k, out var s) && int.TryParse(s.ToString(), out var n2)) return n2;
        }
        return fb;
    }
    static Dictionary<string, string> ParseQuery(string qs)
    {
        var d = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (string.IsNullOrEmpty(qs)) return d;
        if (qs.StartsWith('?')) qs = qs[1..];
        foreach (var part in qs.Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var eq = part.IndexOf('=');
            var key = Uri.UnescapeDataString((eq < 0 ? part : part[..eq]).Replace('+', ' '));
            var val = eq < 0 ? "" : Uri.UnescapeDataString(part[(eq + 1)..].Replace('+', ' '));
            d[key] = val;
        }
        return d;
    }
    static JsonElement? Obj(JsonElement o, string k) =>
        o.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Object ? v : null;
    static bool Arr0(JsonElement o, string k, out JsonElement first)
    {
        first = default;
        if (!o.TryGetProperty(k, out var a) || a.ValueKind != JsonValueKind.Array) return false;
        foreach (var x in a.EnumerateArray()) { first = x; return true; }
        return false;
    }
    static string First(params string[] xs)
    {
        foreach (var x in xs) if (!string.IsNullOrEmpty(x)) return x;
        return "";
    }
    static string NormalizeProto(string v)
    {
        v = Regex.Replace(v.ToLowerInvariant(), "[^a-z0-9]", "");
        return v switch
        {
            "shadowsocks" or "shadowsocks2022" or "ss" => "ss",
            "hy2" or "hysteria2" => "hysteria2",
            "hy" or "hysteria" => "hysteria",
            "wg" or "wireguard" => "wireguard",
            "socks5" or "socks4" or "socks" => "socks",
            "https" or "http" => v == "https" ? "http" : "http",
            "ssr" or "shadowsocksr" => "ssr",
            "tuic" or "tuicv5" => "tuic",
            "vmess" => "vmess",
            "vless" => "vless",
            "trojan" => "trojan",
            "anytls" => "anytls",
            _ => string.IsNullOrEmpty(v) ? "unknown" : v,
        };
    }
    static string NormalizeNet(string v)
    {
        v = v.ToLowerInvariant();
        return v switch
        {
            "websocket" => "ws",
            "httpupgrade" or "http_upgrade" => "httpupgrade",
            "h2" or "http2" => "h2",
            "grpc" or "gun" => "grpc",
            "kcp" or "mkcp" => "kcp",
            "xhttp" or "splithttp" => v == "xhttp" ? "xhttp" : "splithttp",
            _ => string.IsNullOrEmpty(v) ? "tcp" : v,
        };
    }
    static string NormalizeTls(string v)
    {
        v = v.ToLowerInvariant();
        if (v == "reality") return "reality";
        if (v == "xtls") return "xtls";
        if (v is "tls" or "true" or "1") return "tls";
        return "none";
    }
    static bool SplitHostPort(string hostport, out string host, out int port)
    {
        host = hostport.Trim(); port = 443;
        if (host.StartsWith('['))
        {
            var end = host.IndexOf(']');
            if (end < 0) return false;
            var inside = host[1..end];
            var rest = host[(end + 1)..];
            host = inside;
            if (rest.StartsWith(':')) int.TryParse(rest[1..], out port);
        }
        else
        {
            var colon = host.LastIndexOf(':');
            if (colon > 0)
            {
                int.TryParse(host[(colon + 1)..], out port);
                host = host[..colon];
            }
        }
        return !string.IsNullOrEmpty(host);
    }
    public static string? DecodeB64(string raw)
    {
        raw = raw.Trim().Replace('-', '+').Replace('_', '/');
        if (raw.Length == 0) return null;
        raw += new string('=', (4 - raw.Length % 4) % 4);
        try { return Encoding.UTF8.GetString(Convert.FromBase64String(raw)); }
        catch { return null; }
    }
}
