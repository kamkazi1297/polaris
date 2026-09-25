import { claimedCountry, countryName } from "./countries.ts";
import type { Diagnosis, ProbeResult, ProxyConfig, SecurityReport } from "./types.ts";

const WEAK_SS = new Set([
  "rc4",
  "rc4-md5",
  "des-cfb",
  "des-ofb",
  "bf-cfb",
  "chacha20",
  "salsa20",
  "aes-128-cfb",
  "aes-192-cfb",
  "aes-256-cfb",
  "table",
  "none",
]);

export function analyzeSecurity(cfg: ProxyConfig): SecurityReport {
  const reasons: string[] = [];
  let level: SecurityReport["level"] = "none";

  if (cfg.tls === "reality" && cfg.publicKey) {
    level = "high";
    reasons.push("Reality هویت TLS جعلی را پنهان می‌کند");
    if (cfg.fingerprint) reasons.push(`اثر انگشت کلاینت: ${cfg.fingerprint}`);
    if (cfg.flow.includes("vision")) reasons.push("XTLS Vision فعال است");
  } else if (cfg.protocol === "hysteria2" || cfg.protocol === "hysteria") {
    level = "high";
    reasons.push("Hysteria روی QUIC با احراز هویت رمزنگاری‌شده کار می‌کند");
  } else if (cfg.protocol === "tuic") {
    level = "high";
    reasons.push("TUIC بر بستر QUIC/TLS1.3 است");
  } else if (cfg.protocol === "wireguard") {
    level = "high";
    reasons.push("WireGuard رمزنگاری مدرن Noise دارد");
  } else if (cfg.tls === "tls" || cfg.tls === "xtls") {
    level = "medium";
    reasons.push("TLS فعال است");
    if (cfg.fingerprint) reasons.push(`uTLS / fingerprint: ${cfg.fingerprint}`);
    if (cfg.allowInsecure) {
      level = "low";
      reasons.push("تأیید گواهی خاموش است (AllowInsecure)");
    }
  } else if (cfg.protocol === "ss") {
    const method = (cfg.method || "").toLowerCase();
    if (method.includes("2022") || method.includes("blake3")) {
      level = "high";
      reasons.push(`رمز ${cfg.method} از خانواده 2022 است`);
    } else if (WEAK_SS.has(method) || !method) {
      level = "low";
      reasons.push(method ? `رمز ضعیف: ${cfg.method}` : "روش رمز مشخص نیست");
    } else {
      level = "medium";
      reasons.push(`رمز ${cfg.method || "AEAD"} بدون پوشش TLS`);
    }
  } else if (cfg.protocol === "vmess" && cfg.tls === "none") {
    level = "low";
    reasons.push("VMess بدون TLS به‌راحتی قابل شناسایی است");
  } else if (cfg.protocol === "http") {
    level = "none";
    reasons.push("HTTP پروکسی رمزنگاری ندارد");
  } else if (cfg.protocol === "socks") {
    level = "none";
    reasons.push("SOCKS به‌تنهایی ترافیک را رمز نمی‌کند");
  } else {
    level = "low";
    reasons.push("رمزنگاری لایه انتقال فعال نیست");
  }

  if (cfg.protocol === "ssr") {
    level = "low";
    reasons.push("ShadowsocksR منسوخ و ضعیف است");
  }
  if (cfg.protocol === "vmess" && cfg.alterId > 0) {
    reasons.push("AlterID غیرصفر قدیمی است؛ بهتر است صفر باشد");
  }
  if (!cfg.uuid && !cfg.password && cfg.protocol !== "http") {
    level = "none";
    reasons.push("شناسه یا رمز خالی است");
  }

  const label =
    level === "high"
      ? "امنیت بالا"
      : level === "medium"
        ? "امنیت متوسط"
        : level === "low"
          ? "امنیت پایین"
          : "بدون رمز کافی";

  return { level, label, reasons };
}

export function diagnose(cfg: ProxyConfig, probe?: ProbeResult | null): Diagnosis {
  if (!cfg.address || !cfg.port || cfg.port < 1 || cfg.port > 65535) {
    return {
      status: "invalid",
      title: "کانفیگ نامعتبر",
      detail: "آدرس یا پورت درست نیست.",
    };
  }
  const needsId = cfg.protocol === "vless" || cfg.protocol === "vmess";
  const needsPass =
    cfg.protocol === "trojan" ||
    cfg.protocol === "ss" ||
    cfg.protocol === "hysteria2" ||
    cfg.protocol === "hysteria";
  if (needsId && !cfg.uuid) {
    return {
      status: "invalid",
      title: "کانفیگ نامعتبر",
      detail: "UUID خالی است؛ این لینک قابل استفاده نیست.",
    };
  }
  if (needsPass && !cfg.password && !cfg.uuid) {
    return {
      status: "invalid",
      title: "کانفیگ نامعتبر",
      detail: "رمز عبور خالی است.",
    };
  }
  if (cfg.tls === "reality" && !cfg.publicKey) {
    return {
      status: "invalid",
      title: "Reality ناقص",
      detail: "کلید عمومی (pbk) Reality موجود نیست.",
    };
  }

  if (probe) {
    if (isIranLocation(probe)) {
      const city = probe.city ? `، ${probe.city}` : "";
      return {
        status: "broken",
        title: "کانفیگ مشکل‌دار",
        detail: `سرور در ایران است${city}. ممکن است از فیلتر رد شوید ولی مکان نمایش‌داده‌شده عوض نمی‌شود.`,
      };
    }
    if (!probe.ok) {
      return {
        status: "dead",
        title: "پاسخ نمی‌دهد",
        detail: probe.error || "تست دیلی به سرور نرسید.",
      };
    }
    const claimed = claimedCountry(cfg.remark);
    if (claimed && probe.countryCode && claimed !== probe.countryCode) {
      if (claimed === "IR") {
        return {
          status: "ok",
          title: "سالم",
          detail: `نام کانفیگ ایران را نشان می‌دهد ولی مکان واقعی ${countryName(probe.countryCode)} است.`,
        };
      }
      return {
        status: "warn",
        title: "عدم تطابق مکان",
        detail: `در نام کانفیگ ${countryName(claimed)} آمده، ولی مکان واقعی ${countryName(probe.countryCode)} است.`,
      };
    }
    return {
      status: "ok",
      title: "سالم",
      detail: probe.countryCode
        ? `مکان سرور: ${countryName(probe.countryCode)}${probe.city ? ` — ${probe.city}` : ""}.`
        : "سرور پاسخ داد.",
    };
  }

  const claimed = claimedCountry(cfg.remark);
  if (claimed === "IR") {
    return {
      status: "broken",
      title: "کانفیگ مشکل‌دار",
      detail: "از روی نام مشخص است که سرور ایران است؛ مکان عوض نخواهد شد. برای اطمینان تست دیلی بگیرید.",
    };
  }
  return {
    status: "unknown",
    title: "تست نشده",
    detail: "برای تشخیص مکان و سلامت، تست دیلی را اجرا کنید.",
  };
}

export function delayTone(ms: number | null | undefined): "ok" | "warn" | "bad" | "none" {
  if (ms == null) return "none";
  if (ms < 180) return "ok";
  if (ms < 450) return "warn";
  return "bad";
}

const IRAN_ISP =
  /irancell|mci\b|tci\b|shatel|pars.?online|afranet|asiatech|respina|shecan|hiweb|fanap|mobinnet|rightel|mokhaberat|iran telecommunication|datak|pishgaman|arvan(?:cloud)?|cloud\.ir|ir-?nic|telecommunication company of iran/i;

export function isIranLocation(probe: ProbeResult): boolean {
  if (probe.countryCode === "IR") return true;
  const blob = `${probe.isp ?? ""} ${probe.org ?? ""} ${probe.country ?? ""}`;
  return IRAN_ISP.test(blob);
}
