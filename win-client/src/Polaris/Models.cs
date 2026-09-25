using System.Text.Json.Serialization;

namespace Polaris;

public sealed class ProxyConfig
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Remark { get; set; } = "";
    public string Protocol { get; set; } = "vless";
    public string Address { get; set; } = "";
    public int Port { get; set; } = 443;
    public string Uuid { get; set; } = "";
    public string Password { get; set; } = "";
    public int AlterId { get; set; }
    public string Method { get; set; } = "";
    public string Flow { get; set; } = "";
    public string Encryption { get; set; } = "none";
    public string Network { get; set; } = "tcp";
    public string HeaderType { get; set; } = "none";
    public string Host { get; set; } = "";
    public string Path { get; set; } = "";
    public string ServiceName { get; set; } = "";
    public string GrpcMode { get; set; } = "gun";
    public string Tls { get; set; } = "none";
    public string Sni { get; set; } = "";
    public string Alpn { get; set; } = "";
    public string Fingerprint { get; set; } = "";
    public bool AllowInsecure { get; set; }
    public string PublicKey { get; set; } = "";
    public string ShortId { get; set; } = "";
    public string SpiderX { get; set; } = "";
    public Dictionary<string, string> Extra { get; set; } = new();
    public string Source { get; set; } = "uri";
    public string Raw { get; set; } = "";
    public string Group { get; set; } = "";
}

public sealed class ProbeResult
{
    public bool Ok { get; set; }
    public int? DelayMs { get; set; }
    public string? Error { get; set; }
    public string? Ip { get; set; }
    public string? Country { get; set; }
    public string? CountryCode { get; set; }
    public string? City { get; set; }
    public string? Isp { get; set; }
    public string? Org { get; set; }
}

public sealed class Diagnosis
{
    public string Status { get; set; } = "unknown";
    public string Title { get; set; } = "";
    public string Detail { get; set; } = "";
}

public sealed class SecurityReport
{
    public string Level { get; set; } = "none";
    public string Label { get; set; } = "";
    public List<string> Reasons { get; set; } = new();
}

public sealed class ClientSettings
{
    public int SocksPort { get; set; } = 10808;
    public int HttpPort { get; set; } = 10809;
    public bool MuxEnabled { get; set; }
    public int MuxConcurrency { get; set; } = 8;
    public bool FragmentEnabled { get; set; }
    public string FragmentPackets { get; set; } = "tlshello";
    public string FragmentLength { get; set; } = "100-200";
    public string FragmentInterval { get; set; } = "10-20";
    public string DnsPrimary { get; set; } = "1.1.1.1";
    public string DnsSecondary { get; set; } = "8.8.8.8";
    public string DnsDoh { get; set; } = "https://1.1.1.1/dns-query";
    public bool BypassLan { get; set; } = true;
    public bool BypassIran { get; set; } = true;
    public bool BlockAds { get; set; }
    public bool Sniffing { get; set; } = true;
    public bool Udp { get; set; } = true;
    public string Fingerprint { get; set; } = "chrome";
    public string Core { get; set; } = "xray";
    public string DomainStrategy { get; set; } = "IPIfNonMatch";
}

public sealed class Subscription
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = "";
    public string Url { get; set; } = "";
    public string? LastUpdate { get; set; }
}

public sealed class ConfigEntry
{
    public ProxyConfig Config { get; set; } = new();
    public ProbeResult? Probe { get; set; }
    public string Health { get; set; } = "unknown";
}

public sealed class AppState
{
    public List<ConfigEntry> Entries { get; set; } = new();
    public ClientSettings Settings { get; set; } = new();
    public List<Subscription> Subscriptions { get; set; } = new();
    public string SortMode { get; set; } = "valid";
}

static class ProtocolUi
{
    public static string Label(string p) => p switch
    {
        "vless" => "VLESS",
        "vmess" => "VMess",
        "trojan" => "Trojan",
        "ss" => "Shadowsocks",
        "ssr" => "ShadowsocksR",
        "hysteria2" => "Hysteria2",
        "hysteria" => "Hysteria",
        "tuic" => "TUIC",
        "wireguard" => "WireGuard",
        "socks" => "SOCKS",
        "http" => "HTTP",
        "anytls" => "AnyTLS",
        _ => p,
    };

    public static string TypeLabel(ProxyConfig c)
    {
        var parts = new List<string> { Label(c.Protocol) };
        if (!string.IsNullOrEmpty(c.Network) && c.Network != "tcp")
            parts.Add(c.Network.ToUpperInvariant());
        if (c.Tls == "reality") parts.Add("Reality");
        else if (c.Tls == "tls") parts.Add("TLS");
        else if (c.Tls == "xtls") parts.Add("XTLS");
        return string.Join(" · ", parts);
    }

    public static bool NeedsSingbox(ProxyConfig c) =>
        c.Protocol is "hysteria2" or "hysteria" or "tuic" or "wireguard" or "anytls";
}
