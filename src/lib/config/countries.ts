export const COUNTRY_FA: Record<string, string> = {
  IR: "ایران",
  DE: "آلمان",
  US: "آمریکا",
  GB: "بریتانیا",
  NL: "هلند",
  FR: "فرانسه",
  TR: "ترکیه",
  AE: "امارات",
  FI: "فنلاند",
  SE: "سوئد",
  PL: "لهستان",
  CA: "کانادا",
  JP: "ژاپن",
  SG: "سنگاپور",
  AU: "استرالیا",
  AT: "اتریش",
  CH: "سوئیس",
  IT: "ایتالیا",
  ES: "اسپانیا",
  RU: "روسیه",
  UA: "اوکراین",
  IN: "هند",
  BR: "برزیل",
  KR: "کره جنوبی",
  HK: "هنگ‌کنگ",
  TW: "تایوان",
  CN: "چین",
  CZ: "چک",
  RO: "رومانی",
  BG: "بلغارستان",
  LT: "لیتوانی",
  LV: "لتونی",
  EE: "استونی",
  NO: "نروژ",
  DK: "دانمارک",
  BE: "بلژیک",
  IE: "ایرلند",
  PT: "پرتغال",
  GR: "یونان",
  IL: "اسرائیل",
  QA: "قطر",
  SA: "عربستان",
  IQ: "عراق",
  AM: "ارمنستان",
  GE: "گرجستان",
  AZ: "آذربایجان",
  KZ: "قزاقستان",
  UZ: "ازبکستان",
  MY: "مالزی",
  ID: "اندونزی",
  TH: "تایلند",
  VN: "ویتنام",
  PH: "فیلیپین",
  MX: "مکزیک",
  NZ: "نیوزیلند",
  LU: "لوکزامبورگ",
  MD: "مولداوی",
  RS: "صربستان",
  HU: "مجارستان",
  CY: "قبرس",
  AF: "افغانستان",
  PK: "پاکستان",
  EG: "مصر",
  MA: "مراکش",
  KW: "کویت",
  BH: "بحرین",
  OM: "عمان",
  JO: "اردن",
  LB: "لبنان",
};

const REMARK_HINTS: Array<{ code: string; needles: string[] }> = [
  { code: "IR", needles: ["ایران", "iran", "tehran", "تهران"] },
  { code: "DE", needles: ["آلمان", "germany", "deutschland", "frankfurt", "berlin"] },
  { code: "NL", needles: ["هلند", "netherlands", "amsterdam"] },
  { code: "US", needles: ["آمریکا", "america", "usa", "united states"] },
  { code: "GB", needles: ["انگلیس", "بریتانیا", "london", "britain"] },
  { code: "FR", needles: ["فرانسه", "france", "paris"] },
  { code: "TR", needles: ["ترکیه", "turkey", "istanbul"] },
  { code: "AE", needles: ["امارات", "dubai", "uae"] },
  { code: "FI", needles: ["فنلاند", "finland"] },
  { code: "SE", needles: ["سوئد", "sweden"] },
  { code: "PL", needles: ["لهستان", "poland", "warsaw"] },
  { code: "CA", needles: ["کانادا", "canada"] },
  { code: "JP", needles: ["ژاپن", "japan", "tokyo"] },
  { code: "SG", needles: ["سنگاپور", "singapore"] },
  { code: "AU", needles: ["استرالیا", "australia"] },
  { code: "AT", needles: ["اتریش", "austria", "vienna"] },
  { code: "CH", needles: ["سوئیس", "switzerland"] },
  { code: "IT", needles: ["ایتالیا", "italy"] },
  { code: "ES", needles: ["اسپانیا", "spain"] },
  { code: "RU", needles: ["روسیه", "russia", "moscow"] },
  { code: "HK", needles: ["هنگ کنگ", "هنگ‌کنگ", "hong kong", "hongkong"] },
  { code: "TW", needles: ["تایوان", "taiwan"] },
  { code: "KR", needles: ["کره جنوبی", "south korea", "korea"] },
  { code: "IN", needles: ["هند", "india"] },
  { code: "UA", needles: ["اوکراین", "ukraine"] },
];

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function remarkHas(text: string, needle: string): boolean {
  const n = needle.toLowerCase();
  const t = text.toLowerCase();
  if (n.length <= 3) {
    const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(n)}([^\\p{L}\\p{N}]|$)`, "iu");
    return re.test(text);
  }
  return t.includes(n);
}

export function countryName(code?: string): string {
  if (!code) return "نامشخص";
  return COUNTRY_FA[code.toUpperCase()] ?? code.toUpperCase();
}

export function claimedCountry(remark: string): string | null {
  for (const { code, needles } of REMARK_HINTS) {
    if (needles.some((n) => remarkHas(remark, n))) return code;
  }
  if (remarkHas(remark, "uk") && !remarkHas(remark, "ukraine")) return "GB";
  const iso = remark.match(/(^|[^A-Za-z])([A-Z]{2})([^A-Za-z]|$)/);
  if (iso && COUNTRY_FA[iso[2]]) return iso[2];
  return null;
}
