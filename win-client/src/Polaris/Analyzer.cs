using System.Text.RegularExpressions;

namespace Polaris;

static class Analyzer
{
    static readonly HashSet<string> WeakSs = new(StringComparer.OrdinalIgnoreCase)
    {
        "rc4", "rc4-md5", "des-cfb", "bf-cfb", "chacha20", "salsa20",
        "aes-128-cfb", "aes-192-cfb", "aes-256-cfb", "table", "none",
    };

    static readonly Dictionary<string, string> Countries = new()
    {
        ["IR"] = "ایران", ["DE"] = "آلمان", ["US"] = "آمریکا", ["GB"] = "بریتانیا",
        ["NL"] = "هلند", ["FR"] = "فرانسه", ["TR"] = "ترکیه", ["AE"] = "امارات",
        ["FI"] = "فنلاند", ["SE"] = "سوئد", ["PL"] = "لهستان", ["CA"] = "کانادا",
        ["JP"] = "ژاپن", ["SG"] = "سنگاپور", ["AU"] = "استرالیا", ["AT"] = "اتریش",
        ["CH"] = "سوئیس", ["IT"] = "ایتالیا", ["ES"] = "اسپانیا", ["RU"] = "روسیه",
        ["UA"] = "اوکراین", ["IN"] = "هند", ["HK"] = "هنگ‌کنگ", ["TW"] = "تایوان",
        ["KR"] = "کره جنوبی", ["CN"] = "چین",
    };

    static readonly (string Code, string[] Needles)[] Hints =
    {
        ("IR", new[] { "ایران", "iran", "tehran", "تهران" }),
        ("DE", new[] { "آلمان", "germany", "frankfurt", "berlin" }),
        ("NL", new[] { "هلند", "netherlands", "amsterdam" }),
        ("US", new[] { "آمریکا", "america", "usa" }),
        ("GB", new[] { "انگلیس", "بریتانیا", "london", "britain" }),
        ("FR", new[] { "فرانسه", "france", "paris" }),
        ("TR", new[] { "ترکیه", "turkey", "istanbul" }),
        ("AE", new[] { "امارات", "dubai", "uae" }),
        ("UA", new[] { "اوکراین", "ukraine" }),
    };

    static readonly Regex IranIsp = new(
        @"irancell|mci\b|shatel|pars.?online|asiatech|shecan|hiweb|rightel|arvan|telecommunication company of iran|mokhaberat",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public static string CountryName(string? code)
    {
        if (string.IsNullOrEmpty(code)) return "نامشخص";
        code = code.ToUpperInvariant();
        return Countries.TryGetValue(code, out var n) ? n : code;
    }

    public static string? ClaimedCountry(string remark)
    {
        var t = remark.ToLowerInvariant();
        foreach (var (code, needles) in Hints)
            foreach (var n in needles)
                if (t.Contains(n, StringComparison.OrdinalIgnoreCase)) return code;
        if (Regex.IsMatch(remark, @"(^|[^A-Za-z])UK([^A-Za-z]|$)", RegexOptions.IgnoreCase)
            && !t.Contains("ukraine")) return "GB";
        var m = Regex.Match(remark, @"(^|[^A-Za-z])([A-Z]{2})([^A-Za-z]|$)");
        if (m.Success && Countries.ContainsKey(m.Groups[2].Value)) return m.Groups[2].Value;
        return null;
    }

    public static bool IsIran(ProbeResult p)
    {
        if (p.CountryCode == "IR") return true;
        var blob = $"{p.Isp} {p.Org} {p.Country}";
        return IranIsp.IsMatch(blob);
    }

    public static SecurityReport AnalyzeSecurity(ProxyConfig c)
    {
        var reasons = new List<string>();
        var level = "none";
        if (c.Tls == "reality" && !string.IsNullOrEmpty(c.PublicKey))
        {
            level = "high";
            reasons.Add("Reality هویت TLS جعلی را پنهان می‌کند");
            if (!string.IsNullOrEmpty(c.Fingerprint)) reasons.Add("اثر انگشت: " + c.Fingerprint);
            if (c.Flow.Contains("vision")) reasons.Add("XTLS Vision فعال است");
        }
        else if (c.Protocol is "hysteria2" or "hysteria")
        {
            level = "high"; reasons.Add("Hysteria روی QUIC رمزنگاری‌شده است");
        }
        else if (c.Protocol is "tuic")
        {
            level = "high"; reasons.Add("TUIC بر بستر QUIC/TLS1.3 است");
        }
        else if (c.Protocol == "wireguard")
        {
            level = "high"; reasons.Add("WireGuard رمزنگاری Noise دارد");
        }
        else if (c.Tls is "tls" or "xtls")
        {
            level = "medium"; reasons.Add("TLS فعال است");
            if (c.AllowInsecure) { level = "low"; reasons.Add("تأیید گواهی خاموش است"); }
        }
        else if (c.Protocol == "ss")
        {
            var m = c.Method.ToLowerInvariant();
            if (m.Contains("2022") || m.Contains("blake3")) { level = "high"; reasons.Add("رمز خانواده 2022"); }
            else if (WeakSs.Contains(m) || string.IsNullOrEmpty(m)) { level = "low"; reasons.Add("رمز ضعیف یا نامشخص"); }
            else { level = "medium"; reasons.Add("رمز " + c.Method + " بدون پوشش TLS"); }
        }
        else if (c.Protocol == "vmess" && c.Tls == "none")
        {
            level = "low"; reasons.Add("VMess بدون TLS قابل شناسایی است");
        }
        else if (c.Protocol is "http" or "socks")
        {
            level = "none"; reasons.Add("این پروکسی ترافیک را رمز نمی‌کند");
        }
        else
        {
            level = "low"; reasons.Add("رمزنگاری لایه انتقال فعال نیست");
        }
        if (c.Protocol == "ssr") { level = "low"; reasons.Add("ShadowsocksR منسوخ است"); }
        var label = level switch { "high" => "امنیت بالا", "medium" => "امنیت متوسط", "low" => "امنیت پایین", _ => "بدون رمز کافی" };
        return new SecurityReport { Level = level, Label = label, Reasons = reasons };
    }

    public static Diagnosis Diagnose(ProxyConfig c, ProbeResult? probe)
    {
        if (string.IsNullOrWhiteSpace(c.Address) || c.Port is < 1 or > 65535)
            return new Diagnosis { Status = "invalid", Title = "کانفیگ نامعتبر", Detail = "آدرس یا پورت درست نیست." };
        if (c.Protocol is "vless" or "vmess" && string.IsNullOrEmpty(c.Uuid))
            return new Diagnosis { Status = "invalid", Title = "کانفیگ نامعتبر", Detail = "UUID خالی است." };
        if (c.Protocol is "trojan" or "ss" or "hysteria2" or "hysteria" && string.IsNullOrEmpty(c.Password) && string.IsNullOrEmpty(c.Uuid))
            return new Diagnosis { Status = "invalid", Title = "کانفیگ نامعتبر", Detail = "رمز عبور خالی است." };
        if (c.Tls == "reality" && string.IsNullOrEmpty(c.PublicKey))
            return new Diagnosis { Status = "invalid", Title = "Reality ناقص", Detail = "کلید عمومی (pbk) موجود نیست." };

        if (probe != null)
        {
            if (IsIran(probe))
            {
                var city = string.IsNullOrEmpty(probe.City) ? "" : "، " + probe.City;
                return new Diagnosis
                {
                    Status = "broken",
                    Title = "کانفیگ مشکل‌دار",
                    Detail = $"سرور در ایران است{city}. ممکن است از فیلتر رد شوید ولی مکان عوض نمی‌شود.",
                };
            }
            if (!probe.Ok)
                return new Diagnosis { Status = "dead", Title = "پاسخ نمی‌دهد", Detail = probe.Error ?? "تست دیلی نرسید." };
            var claimed = ClaimedCountry(c.Remark);
            if (!string.IsNullOrEmpty(claimed) && !string.IsNullOrEmpty(probe.CountryCode) && claimed != probe.CountryCode && claimed != "IR")
                return new Diagnosis
                {
                    Status = "warn",
                    Title = "عدم تطابق مکان",
                    Detail = $"در نام {CountryName(claimed)} آمده، مکان واقعی {CountryName(probe.CountryCode)} است.",
                };
            return new Diagnosis
            {
                Status = "ok",
                Title = "سالم",
                Detail = string.IsNullOrEmpty(probe.CountryCode)
                    ? "سرور پاسخ داد."
                    : $"مکان سرور: {CountryName(probe.CountryCode)}" + (string.IsNullOrEmpty(probe.City) ? "" : " — " + probe.City),
            };
        }

        if (ClaimedCountry(c.Remark) == "IR")
            return new Diagnosis
            {
                Status = "broken",
                Title = "کانفیگ مشکل‌دار",
                Detail = "از روی نام مشخص است سرور ایران است؛ مکان عوض نخواهد شد.",
            };
        return new Diagnosis { Status = "unknown", Title = "تست نشده", Detail = "برای تشخیص مکان، تست دیلی را اجرا کنید." };
    }
}
