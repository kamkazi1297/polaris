using System.Diagnostics;
using System.IO.Compression;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using Microsoft.Win32;

namespace Polaris;

static class Paths
{
    public static string Root => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Polaris");
    public static string CoreDir => Path.Combine(Root, "core");
    public static string Xray => Path.Combine(CoreDir, "xray.exe");
    public static string SingBox => Path.Combine(CoreDir, "sing-box.exe");
    public static string ConfigJson => Path.Combine(Root, "config.json");
    public static string StateFile => Path.Combine(Root, "state.json");
    public static void Ensure() => Directory.CreateDirectory(CoreDir);
}

static class Store
{
    public static AppState Load()
    {
        try
        {
            if (File.Exists(Paths.StateFile))
                return JsonSerializer.Deserialize<AppState>(File.ReadAllText(Paths.StateFile)) ?? new AppState();
        }
        catch { /* ignore */ }
        return new AppState();
    }

    public static void Save(AppState s)
    {
        Paths.Ensure();
        File.WriteAllText(Paths.StateFile, JsonSerializer.Serialize(s, new JsonSerializerOptions { WriteIndented = true }));
    }
}

static class Probe
{
    static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(6) };

    public static async Task<ProbeResult> RunAsync(string host, int port, CancellationToken ct)
    {
        host = host.Trim().Trim('[', ']');
        if (string.IsNullOrEmpty(host) || port is < 1 or > 65535)
            return new ProbeResult { Ok = false, Error = "invalid" };
        string? ip = null;
        try
        {
            var addrs = await System.Net.Dns.GetHostAddressesAsync(host, ct);
            ip = addrs.FirstOrDefault()?.ToString();
        }
        catch { return new ProbeResult { Ok = false, Error = "dns" }; }

        var geo = await LookupGeo(ip ?? host, ct);
        try
        {
            var sw = Stopwatch.StartNew();
            using var tcp = new TcpClient();
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(4500);
            await tcp.ConnectAsync(host, port, cts.Token);
            sw.Stop();
            geo.Ok = true;
            geo.DelayMs = (int)sw.ElapsedMilliseconds;
            return geo;
        }
        catch (OperationCanceledException)
        {
            geo.Ok = false; geo.Error = "timeout"; return geo;
        }
        catch
        {
            geo.Ok = false; geo.Error = "connect"; return geo;
        }
    }

    static async Task<ProbeResult> LookupGeo(string ip, CancellationToken ct)
    {
        var r = new ProbeResult { Ip = ip };
        try
        {
            using var res = await Http.GetAsync("https://ipwho.is/" + Uri.EscapeDataString(ip), ct);
            if (!res.IsSuccessStatusCode) return r;
            using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync(ct));
            var o = doc.RootElement;
            if (o.TryGetProperty("success", out var ok) && ok.ValueKind == JsonValueKind.False) return r;
            r.Country = o.TryGetProperty("country", out var c) ? c.GetString() : null;
            r.CountryCode = o.TryGetProperty("country_code", out var cc) ? cc.GetString()?.ToUpperInvariant() : null;
            r.City = o.TryGetProperty("city", out var city) ? city.GetString() : null;
            if (o.TryGetProperty("connection", out var conn))
            {
                r.Isp = conn.TryGetProperty("isp", out var isp) ? isp.GetString() : null;
                r.Org = conn.TryGetProperty("org", out var org) ? org.GetString() : null;
            }
        }
        catch { /* ignore */ }
        return r;
    }
}

static class SystemProxy
{
    const int INTERNET_OPTION_SETTINGS_CHANGED = 39;
    const int INTERNET_OPTION_REFRESH = 37;

    [DllImport("wininet.dll", SetLastError = true)]
    static extern bool InternetSetOption(IntPtr hInternet, int dwOption, IntPtr lpBuffer, int dwBufferLength);

    public static void Enable(int httpPort)
    {
        using var key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings", true)
            ?? throw new InvalidOperationException("registry");
        key.SetValue("ProxyEnable", 1, RegistryValueKind.DWord);
        key.SetValue("ProxyServer", $"127.0.0.1:{httpPort}", RegistryValueKind.String);
        key.SetValue("ProxyOverride", "localhost;127.*;10.*;192.168.*;<local>", RegistryValueKind.String);
        Flush();
    }

    public static void Disable()
    {
        using var key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Internet Settings", true);
        key?.SetValue("ProxyEnable", 0, RegistryValueKind.DWord);
        Flush();
    }

    static void Flush()
    {
        InternetSetOption(IntPtr.Zero, INTERNET_OPTION_SETTINGS_CHANGED, IntPtr.Zero, 0);
        InternetSetOption(IntPtr.Zero, INTERNET_OPTION_REFRESH, IntPtr.Zero, 0);
    }
}

static class CoreRuntime
{
    static Process? _proc;
    static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(60) };

    public static bool Running => _proc is { HasExited: false };

    public static async Task EnsureCoreAsync(bool singbox, IProgress<string>? log, CancellationToken ct)
    {
        Paths.Ensure();
        if (singbox)
        {
            if (File.Exists(Paths.SingBox)) return;
            log?.Report("در حال دریافت sing-box…");
            await DownloadLatest("SagerNet", "sing-box", "windows-amd64", Paths.SingBox, log, ct);
        }
        else
        {
            if (File.Exists(Paths.Xray)) return;
            log?.Report("در حال دریافت Xray-core…");
            await DownloadLatest("XTLS", "Xray-core", "windows-64", Paths.Xray, log, ct);
        }
    }

    static async Task DownloadLatest(string owner, string repo, string assetHint, string destExe, IProgress<string>? log, CancellationToken ct)
    {
        Http.DefaultRequestHeaders.UserAgent.ParseAdd("Polaris/1.0");
        using var res = await Http.GetAsync($"https://api.github.com/repos/{owner}/{repo}/releases/latest", ct);
        res.EnsureSuccessStatusCode();
        using var doc = JsonDocument.Parse(await res.Content.ReadAsStringAsync(ct));
        string? url = null;
        foreach (var a in doc.RootElement.GetProperty("assets").EnumerateArray())
        {
            var name = a.GetProperty("name").GetString() ?? "";
            if (name.Contains(assetHint, StringComparison.OrdinalIgnoreCase) && name.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
            {
                url = a.GetProperty("browser_download_url").GetString();
                break;
            }
        }
        if (url == null) throw new InvalidOperationException("asset not found");
        var zipPath = Path.Combine(Paths.CoreDir, "core.zip");
        await using (var fs = File.Create(zipPath))
            await (await Http.GetStreamAsync(url, ct)).CopyToAsync(fs, ct);
        var extract = Path.Combine(Paths.CoreDir, "extract");
        if (Directory.Exists(extract)) Directory.Delete(extract, true);
        ZipFile.ExtractToDirectory(zipPath, extract);
        File.Delete(zipPath);
        var exe = Directory.GetFiles(extract, "*.exe", SearchOption.AllDirectories)
            .FirstOrDefault(p => Path.GetFileName(p).Contains(Path.GetFileNameWithoutExtension(destExe), StringComparison.OrdinalIgnoreCase))
            ?? Directory.GetFiles(extract, "*.exe", SearchOption.AllDirectories).FirstOrDefault();
        if (exe == null) throw new InvalidOperationException("exe missing");
        File.Copy(exe, destExe, true);
        Directory.Delete(extract, true);
        log?.Report("هسته آماده شد.");
    }

    public static void Start(ProxyConfig cfg, ClientSettings settings)
    {
        Stop();
        var sing = ProtocolUi.NeedsSingbox(cfg) || settings.Core == "sing-box";
        var exe = sing ? Paths.SingBox : Paths.Xray;
        if (!File.Exists(exe)) throw new FileNotFoundException(exe);
        var json = sing ? Exporter.SingboxFull(cfg, settings) : Exporter.XrayFull(cfg, settings);
        File.WriteAllText(Paths.ConfigJson, json, Encoding.UTF8);
        var args = $"run -c \"{Paths.ConfigJson}\"";
        _proc = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = exe,
                Arguments = args,
                WorkingDirectory = Paths.CoreDir,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardError = true,
                RedirectStandardOutput = true,
            },
        };
        if (!_proc.Start()) throw new InvalidOperationException("هسته اجرا نشد.");
        Thread.Sleep(500);
        if (_proc.HasExited)
        {
            var err = "";
            try { err = _proc.StandardError.ReadToEnd(); } catch { /* ignore */ }
            throw new InvalidOperationException(string.IsNullOrWhiteSpace(err) ? "هسته بلافاصله بسته شد." : err);
        }
        SystemProxy.Enable(settings.HttpPort);
    }

    public static void Stop()
    {
        try { SystemProxy.Disable(); } catch { /* ignore */ }
        if (_proc == null) return;
        try
        {
            if (!_proc.HasExited)
            {
                _proc.Kill(true);
                _proc.WaitForExit(2000);
            }
        }
        catch { /* ignore */ }
        finally { _proc.Dispose(); _proc = null; }
    }
}

static class Exporter
{
    public static string XrayFull(ProxyConfig c, ClientSettings s)
    {
        var outbound = XrayOutbound(c, s);
        var inbounds = new object[]
        {
            new Dictionary<string, object?>
            {
                ["tag"] = "socks", ["port"] = s.SocksPort, ["listen"] = "127.0.0.1", ["protocol"] = "socks",
                ["settings"] = new { udp = s.Udp, auth = "noauth" },
                ["sniffing"] = s.Sniffing ? new { enabled = true, destOverride = new[] { "http", "tls", "quic" } } : null,
            },
            new Dictionary<string, object?>
            {
                ["tag"] = "http", ["port"] = s.HttpPort, ["listen"] = "127.0.0.1", ["protocol"] = "http",
                ["sniffing"] = s.Sniffing ? new { enabled = true, destOverride = new[] { "http", "tls" } } : null,
            },
        };
        var rules = new List<object>();
        if (s.BypassLan) rules.Add(new { type = "field", ip = new[] { "geoip:private" }, outboundTag = "direct" });
        if (s.BypassIran)
        {
            rules.Add(new { type = "field", domain = new[] { "geosite:ir" }, outboundTag = "direct" });
            rules.Add(new { type = "field", ip = new[] { "geoip:ir" }, outboundTag = "direct" });
        }
        if (s.BlockAds) rules.Add(new { type = "field", domain = new[] { "geosite:category-ads-all" }, outboundTag = "block" });
        rules.Add(new { type = "field", inboundTag = new[] { "socks", "http" }, outboundTag = "proxy" });

        var outs = new List<object> { outbound };
        if (s.FragmentEnabled)
        {
            outs.Add(new
            {
                tag = "fragment",
                protocol = "freedom",
                settings = new { fragment = new { packets = s.FragmentPackets, length = s.FragmentLength, interval = s.FragmentInterval } },
            });
        }
        outs.Add(new { tag = "direct", protocol = "freedom" });
        outs.Add(new { tag = "block", protocol = "blackhole" });

        return JsonSerializer.Serialize(new
        {
            log = new { loglevel = "warning" },
            dns = new { servers = new[] { s.DnsDoh, s.DnsPrimary, s.DnsSecondary } },
            inbounds,
            outbounds = outs,
            routing = new { domainStrategy = s.DomainStrategy, rules },
        }, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });
    }

    static Dictionary<string, object?> XrayOutbound(ProxyConfig c, ClientSettings s)
    {
        object settings;
        string proto;
        if (c.Protocol == "ss")
        {
            proto = "shadowsocks";
            settings = new { servers = new[] { new { address = c.Address, port = c.Port, method = string.IsNullOrEmpty(c.Method) ? "aes-256-gcm" : c.Method, password = c.Password } } };
        }
        else if (c.Protocol == "trojan")
        {
            proto = "trojan";
            settings = new { servers = new[] { new { address = c.Address, port = c.Port, password = c.Password } } };
        }
        else if (c.Protocol is "socks" or "http")
        {
            proto = c.Protocol;
            object? users = string.IsNullOrEmpty(c.Password) ? null : new[] { new { user = c.Uuid, pass = c.Password } };
            settings = new { servers = new[] { new { address = c.Address, port = c.Port, users } } };
        }
        else if (c.Protocol == "vmess")
        {
            proto = "vmess";
            settings = new
            {
                vnext = new[]
                {
                    new
                    {
                        address = c.Address, port = c.Port,
                        users = new[] { new { id = string.IsNullOrEmpty(c.Uuid) ? c.Password : c.Uuid, alterId = c.AlterId, security = string.IsNullOrEmpty(c.Method) ? "auto" : c.Method } },
                    },
                },
            };
        }
        else
        {
            proto = "vless";
            settings = new
            {
                vnext = new[]
                {
                    new
                    {
                        address = c.Address, port = c.Port,
                        users = new[] { new { id = string.IsNullOrEmpty(c.Uuid) ? c.Password : c.Uuid, encryption = string.IsNullOrEmpty(c.Encryption) ? "none" : c.Encryption, flow = string.IsNullOrEmpty(c.Flow) ? null : c.Flow } },
                    },
                },
            };
        }

        var stream = new Dictionary<string, object?>
        {
            ["network"] = string.IsNullOrEmpty(c.Network) ? "tcp" : c.Network,
            ["security"] = c.Tls == "none" ? "none" : c.Tls,
        };
        if (c.Tls is "tls" or "xtls")
            stream["tlsSettings"] = new { serverName = c.Sni, allowInsecure = c.AllowInsecure, fingerprint = string.IsNullOrEmpty(c.Fingerprint) ? null : c.Fingerprint, alpn = string.IsNullOrEmpty(c.Alpn) ? null : c.Alpn.Split(',') };
        if (c.Tls == "reality")
            stream["realitySettings"] = new { serverName = c.Sni, fingerprint = string.IsNullOrEmpty(c.Fingerprint) ? "chrome" : c.Fingerprint, publicKey = c.PublicKey, shortId = c.ShortId, spiderX = string.IsNullOrEmpty(c.SpiderX) ? "/" : c.SpiderX };
        if (c.Network == "ws")
            stream["wsSettings"] = new { path = string.IsNullOrEmpty(c.Path) ? "/" : c.Path, headers = string.IsNullOrEmpty(c.Host) ? null : new { Host = c.Host } };
        if (c.Network == "grpc")
            stream["grpcSettings"] = new { serviceName = c.ServiceName, multiMode = c.GrpcMode == "multi" };
        if (c.Network is "h2" or "http")
            stream["httpSettings"] = new { path = string.IsNullOrEmpty(c.Path) ? "/" : c.Path, host = string.IsNullOrEmpty(c.Host) ? Array.Empty<string>() : new[] { c.Host } };
        if (c.Network is "xhttp" or "splithttp")
            stream["xhttpSettings"] = new { path = string.IsNullOrEmpty(c.Path) ? "/" : c.Path, host = c.Host, mode = c.Extra.GetValueOrDefault("xhttpMode", "auto") };
        if (c.Network == "httpupgrade")
            stream["httpupgradeSettings"] = new { path = string.IsNullOrEmpty(c.Path) ? "/" : c.Path, host = c.Host };
        if (s.FragmentEnabled)
            stream["sockopt"] = new { dialerProxy = "fragment" };

        var result = new Dictionary<string, object?>
        {
            ["tag"] = "proxy",
            ["protocol"] = proto,
            ["settings"] = settings,
            ["streamSettings"] = stream,
        };
        if (s.MuxEnabled && proto is "vmess" or "vless" or "trojan")
            result["mux"] = new { enabled = true, concurrency = s.MuxConcurrency };
        return result;
    }

    public static string SingboxFull(ProxyConfig c, ClientSettings s)
    {
        var proxy = new Dictionary<string, object?>
        {
            ["tag"] = "proxy",
            ["type"] = c.Protocol == "ss" ? "shadowsocks" : c.Protocol,
            ["server"] = c.Address,
            ["server_port"] = c.Port,
        };
        if (!string.IsNullOrEmpty(c.Uuid)) proxy["uuid"] = c.Uuid;
        if (!string.IsNullOrEmpty(c.Password)) proxy["password"] = c.Password;
        if (!string.IsNullOrEmpty(c.Method)) proxy["method"] = c.Method;
        if (!string.IsNullOrEmpty(c.Flow)) proxy["flow"] = c.Flow;
        if (c.Extra.TryGetValue("obfs", out var obfs) && !string.IsNullOrEmpty(obfs))
            proxy["obfs"] = new { type = obfs, password = c.Extra.GetValueOrDefault("obfs-password", "") };
        if (c.Tls is "tls" or "reality")
        {
            proxy["tls"] = new Dictionary<string, object?>
            {
                ["enabled"] = true,
                ["server_name"] = c.Sni,
                ["insecure"] = c.AllowInsecure,
                ["utls"] = string.IsNullOrEmpty(c.Fingerprint) ? null : new { enabled = true, fingerprint = c.Fingerprint },
                ["reality"] = c.Tls == "reality" ? new { enabled = true, public_key = c.PublicKey, short_id = c.ShortId } : null,
            };
        }
        return JsonSerializer.Serialize(new
        {
            log = new { level = "warn" },
            inbounds = new object[]
            {
                new { type = "socks", tag = "socks-in", listen = "127.0.0.1", listen_port = s.SocksPort },
                new { type = "http", tag = "http-in", listen = "127.0.0.1", listen_port = s.HttpPort },
            },
            outbounds = new object[] { proxy, new { type = "direct", tag = "direct" }, new { type = "block", tag = "block" } },
            route = new { final = "proxy" },
        }, new JsonSerializerOptions { WriteIndented = true, DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });
    }

    public static string ToUri(ProxyConfig c)
    {
        var remark = string.IsNullOrEmpty(c.Remark) ? "" : "#" + Uri.EscapeDataString(c.Remark);
        if (c.Protocol == "vmess")
        {
            var obj = new Dictionary<string, object?>
            {
                ["v"] = "2", ["ps"] = c.Remark, ["add"] = c.Address, ["port"] = c.Port.ToString(),
                ["id"] = c.Uuid, ["aid"] = c.AlterId.ToString(), ["scy"] = string.IsNullOrEmpty(c.Method) ? "auto" : c.Method,
                ["net"] = c.Network, ["type"] = string.IsNullOrEmpty(c.HeaderType) ? "none" : c.HeaderType,
                ["host"] = c.Host, ["path"] = c.Path, ["tls"] = c.Tls == "none" ? "" : c.Tls,
                ["sni"] = c.Sni, ["alpn"] = c.Alpn, ["fp"] = c.Fingerprint, ["pbk"] = c.PublicKey,
                ["sid"] = c.ShortId, ["spx"] = c.SpiderX, ["flow"] = c.Flow,
            };
            return "vmess://" + Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(obj))) + remark;
        }
        if (c.Protocol == "ss")
        {
            var user = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{(string.IsNullOrEmpty(c.Method) ? "aes-256-gcm" : c.Method)}:{c.Password}"));
            return $"ss://{user}@{c.Address}:{c.Port}{remark}";
        }
        var q = new List<string>();
        void Q(string k, string v) { if (!string.IsNullOrEmpty(v)) q.Add(k + "=" + Uri.EscapeDataString(v)); }
        Q("type", c.Network);
        Q("security", string.IsNullOrEmpty(c.Tls) ? "none" : c.Tls);
        Q("sni", c.Sni); Q("host", c.Host); Q("path", c.Path); Q("flow", c.Flow);
        Q("fp", c.Fingerprint); Q("alpn", c.Alpn); Q("pbk", c.PublicKey); Q("sid", c.ShortId);
        Q("spx", c.SpiderX); Q("serviceName", c.ServiceName); Q("encryption", c.Encryption == "none" ? "" : c.Encryption);
        Q("headerType", c.HeaderType == "none" ? "" : c.HeaderType);
        if (c.AllowInsecure) Q("allowInsecure", "1");
        var userinfo = c.Protocol is "vless" or "tuic" ? c.Uuid : c.Password;
        if (c.Protocol == "tuic" && !string.IsNullOrEmpty(c.Password)) userinfo = c.Uuid + ":" + c.Password;
        var qs = q.Count == 0 ? "" : "?" + string.Join("&", q);
        var scheme = c.Protocol == "hysteria2" ? "hy2" : c.Protocol;
        return $"{scheme}://{userinfo}@{c.Address}:{c.Port}{qs}{remark}";
    }
}
