import 'models.dart';

const _countries = {
  "IR": "ایران",
  "DE": "آلمان",
  "US": "آمریکا",
  "GB": "بریتانیا",
  "NL": "هلند",
  "FR": "فرانسه",
  "TR": "ترکیه",
  "AE": "امارات",
  "FI": "فنلاند",
  "SE": "سوئد",
  "PL": "لهستان",
  "CA": "کانادا",
  "JP": "ژاپن",
  "SG": "سنگاپور",
  "AU": "استرالیا",
  "AT": "اتریش",
  "CH": "سوئیس",
  "IT": "ایتالیا",
  "ES": "اسپانیا",
  "RU": "روسیه",
  "UA": "اوکراین",
  "IN": "هند",
  "HK": "هنگ‌کنگ",
  "TW": "تایوان",
  "KR": "کره جنوبی",
  "CN": "چین",
};

const _hints = <String, List<String>>{
  "IR": ["ایران", "iran", "tehran", "تهران"],
  "DE": ["آلمان", "germany", "frankfurt", "berlin"],
  "NL": ["هلند", "netherlands", "amsterdam"],
  "US": ["آمریکا", "america", "usa"],
  "GB": ["انگلیس", "بریتانیا", "london", "britain"],
  "FR": ["فرانسه", "france", "paris"],
  "TR": ["ترکیه", "turkey", "istanbul"],
  "AE": ["امارات", "dubai", "uae"],
  "UA": ["اوکراین", "ukraine"],
};

final _iranIsp = RegExp(
  r"irancell|mci\b|shatel|pars.?online|asiatech|shecan|hiweb|rightel|arvan|telecommunication company of iran|mokhaberat",
  caseSensitive: false,
);

const _weakSs = {
  "rc4",
  "rc4-md5",
  "des-cfb",
  "bf-cfb",
  "chacha20",
  "salsa20",
  "aes-128-cfb",
  "aes-192-cfb",
  "aes-256-cfb",
  "table",
  "none",
};

String countryName(String? code) {
  if (code == null || code.isEmpty) return "نامشخص";
  return _countries[code.toUpperCase()] ?? code.toUpperCase();
}

String? claimedCountry(String remark) {
  final t = remark.toLowerCase();
  for (final e in _hints.entries) {
    for (final n in e.value) {
      if (t.contains(n.toLowerCase())) return e.key;
    }
  }
  final uk = RegExp(r"(^|[^A-Za-z])UK([^A-Za-z]|$)");
  if (uk.hasMatch(remark) && !t.contains("ukraine")) return "GB";
  final m = RegExp(r"(^|[^A-Za-z])([A-Z]{2})([^A-Za-z]|$)").firstMatch(remark);
  if (m != null && _countries.containsKey(m.group(2))) return m.group(2);
  return null;
}

bool isIran(ProbeResult p) {
  if (p.countryCode == "IR") return true;
  final blob = "${p.isp ?? ""} ${p.org ?? ""} ${p.country ?? ""}";
  return _iranIsp.hasMatch(blob);
}

SecurityReport analyzeSecurity(ProxyConfig c) {
  final reasons = <String>[];
  var level = "none";
  if (c.tls == "reality" && c.publicKey.isNotEmpty) {
    level = "high";
    reasons.add("Reality هویت TLS جعلی را پنهان می‌کند");
    if (c.fingerprint.isNotEmpty) reasons.add("اثر انگشت: ${c.fingerprint}");
    if (c.flow.contains("vision")) reasons.add("XTLS Vision فعال است");
  } else if (c.protocol == "hysteria2" || c.protocol == "hysteria") {
    level = "high";
    reasons.add("Hysteria روی QUIC رمزنگاری‌شده است");
  } else if (c.protocol == "tuic") {
    level = "high";
    reasons.add("TUIC بر بستر QUIC/TLS1.3 است");
  } else if (c.protocol == "wireguard") {
    level = "high";
    reasons.add("WireGuard رمزنگاری Noise دارد");
  } else if (c.tls == "tls" || c.tls == "xtls") {
    level = "medium";
    reasons.add("TLS فعال است");
    if (c.allowInsecure) {
      level = "low";
      reasons.add("تأیید گواهی خاموش است");
    }
  } else if (c.protocol == "ss") {
    final m = c.method.toLowerCase();
    if (m.contains("2022") || m.contains("blake3")) {
      level = "high";
      reasons.add("رمز خانواده 2022");
    } else if (_weakSs.contains(m) || m.isEmpty) {
      level = "low";
      reasons.add("رمز ضعیف یا نامشخص");
    } else {
      level = "medium";
      reasons.add("رمز ${c.method} بدون پوشش TLS");
    }
  } else if (c.protocol == "vmess" && c.tls == "none") {
    level = "low";
    reasons.add("VMess بدون TLS قابل شناسایی است");
  } else if (c.protocol == "http" || c.protocol == "socks") {
    level = "none";
    reasons.add("این پروکسی ترافیک را رمز نمی‌کند");
  } else {
    level = "low";
    reasons.add("رمزنگاری لایه انتقال فعال نیست");
  }
  if (c.protocol == "ssr") {
    level = "low";
    reasons.add("ShadowsocksR منسوخ است");
  }
  final label = switch (level) {
    "high" => "امنیت بالا",
    "medium" => "امنیت متوسط",
    "low" => "امنیت پایین",
    _ => "بدون رمز کافی",
  };
  return SecurityReport(level: level, label: label, reasons: reasons);
}

Diagnosis diagnose(ProxyConfig c, ProbeResult? probe) {
  if (c.address.trim().isEmpty || c.port < 1 || c.port > 65535) {
    return Diagnosis(status: "invalid", title: "کانفیگ نامعتبر", detail: "آدرس یا پورت درست نیست.");
  }
  if ((c.protocol == "vless" || c.protocol == "vmess") && c.uuid.isEmpty) {
    return Diagnosis(status: "invalid", title: "کانفیگ نامعتبر", detail: "UUID خالی است.");
  }
  if (const {"trojan", "ss", "hysteria2", "hysteria"}.contains(c.protocol) &&
      c.password.isEmpty &&
      c.uuid.isEmpty) {
    return Diagnosis(status: "invalid", title: "کانفیگ نامعتبر", detail: "رمز عبور خالی است.");
  }
  if (c.tls == "reality" && c.publicKey.isEmpty) {
    return Diagnosis(status: "invalid", title: "Reality ناقص", detail: "کلید عمومی (pbk) موجود نیست.");
  }
  if (probe != null) {
    if (isIran(probe)) {
      final city = (probe.city == null || probe.city!.isEmpty) ? "" : "، ${probe.city}";
      return Diagnosis(
        status: "broken",
        title: "کانفیگ مشکل‌دار",
        detail: "سرور در ایران است$city. ممکن است از فیلتر رد شوید ولی مکان عوض نمی‌شود.",
      );
    }
    if (!probe.ok) {
      return Diagnosis(status: "dead", title: "پاسخ نمی‌دهد", detail: probe.error ?? "تست دیلی نرسید.");
    }
    final claimed = claimedCountry(c.remark);
    if (claimed != null &&
        probe.countryCode != null &&
        claimed != probe.countryCode &&
        claimed != "IR") {
      return Diagnosis(
        status: "warn",
        title: "عدم تطابق مکان",
        detail: "در نام ${countryName(claimed)} آمده، مکان واقعی ${countryName(probe.countryCode)} است.",
      );
    }
    return Diagnosis(
      status: "ok",
      title: "سالم",
      detail: probe.countryCode == null || probe.countryCode!.isEmpty
          ? "سرور پاسخ داد."
          : "مکان سرور: ${countryName(probe.countryCode)}${probe.city == null || probe.city!.isEmpty ? "" : " — ${probe.city}"}",
    );
  }
  if (claimedCountry(c.remark) == "IR") {
    return Diagnosis(
      status: "broken",
      title: "کانفیگ مشکل‌دار",
      detail: "از روی نام مشخص است سرور ایران است؛ مکان عوض نخواهد شد.",
    );
  }
  return Diagnosis(status: "unknown", title: "تست نشده", detail: "برای تشخیص مکان، تست دیلی را اجرا کنید.");
}

String healthFa(String status) => switch (status) {
      "ok" => "سالم",
      "broken" => "مشکل‌دار",
      "invalid" => "نامعتبر",
      "dead" => "بدون پاسخ",
      "warn" => "هشدار مکان",
      _ => "تست نشده",
    };
