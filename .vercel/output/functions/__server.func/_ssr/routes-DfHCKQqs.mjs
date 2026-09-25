import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay, c as DialogTrigger$1, i as DialogDescription, l as Slot, n as DialogClose, o as DialogPortal, r as DialogContent$1, s as DialogTitle, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { _ as Download, a as Trash2, b as ClipboardPaste, c as Settings, d as LoaderCircle, f as Link2, g as Earth, h as FilePlus2, l as Search, m as Files, n as X, o as Timer, p as Gauge, r as Unplug, s as Shield, t as Zap, u as RotateCcw, v as Copy, x as Activity, y as Compass } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DfHCKQqs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide", {
	variants: { tone: {
		neutral: "bg-surface-2 text-muted border border-border",
		ok: "bg-ok/15 text-ok",
		warn: "bg-warn/15 text-warn",
		bad: "bg-bad/15 text-bad",
		info: "bg-info/15 text-info",
		accent: "bg-accent text-accent-fg"
	} },
	defaultVariants: { tone: "neutral" }
});
function Badge({ className, tone, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ tone }), className),
		...props
	});
}
function HealthBadge({ status }) {
	const v = {
		ok: {
			tone: "ok",
			label: "سالم"
		},
		broken: {
			tone: "bad",
			label: "مشکل‌دار"
		},
		invalid: {
			tone: "bad",
			label: "نامعتبر"
		},
		dead: {
			tone: "warn",
			label: "بدون پاسخ"
		},
		warn: {
			tone: "warn",
			label: "هشدار مکان"
		},
		unknown: {
			tone: "neutral",
			label: "تست نشده"
		}
	}[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: v.tone,
		children: v.label
	});
}
function SecurityBadge({ level, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: level === "high" ? "ok" : level === "medium" ? "info" : level === "low" ? "warn" : "bad",
		children: label
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-surface-2 text-fg border border-border hover:bg-surface",
			ghost: "text-muted hover:text-fg hover:bg-surface-2",
			danger: "bg-bad/15 text-bad hover:bg-bad/25",
			outline: "border border-border bg-transparent text-fg hover:bg-surface-2"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11",
			"icon-sm": "size-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	className: cn("flex h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg placeholder:text-subtle", "transition-[border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", "disabled:opacity-40", className),
	...props
}));
Input.displayName = "Input";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	ref,
	className: cn("flex min-h-40 w-full rounded-md border border-border bg-surface px-3 py-3 text-sm text-fg placeholder:text-subtle", "transition-[border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40", "resize-y disabled:opacity-40 font-mono leading-relaxed", className),
	...props
}));
Textarea.displayName = "Textarea";
var COUNTRY_FA = {
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
	LB: "لبنان"
};
var REMARK_HINTS = [
	{
		code: "IR",
		needles: [
			"ایران",
			"iran",
			"tehran",
			"تهران"
		]
	},
	{
		code: "DE",
		needles: [
			"آلمان",
			"germany",
			"deutschland",
			"frankfurt",
			"berlin"
		]
	},
	{
		code: "NL",
		needles: [
			"هلند",
			"netherlands",
			"amsterdam"
		]
	},
	{
		code: "US",
		needles: [
			"آمریکا",
			"america",
			"usa",
			"united states"
		]
	},
	{
		code: "GB",
		needles: [
			"انگلیس",
			"بریتانیا",
			"london",
			"britain"
		]
	},
	{
		code: "FR",
		needles: [
			"فرانسه",
			"france",
			"paris"
		]
	},
	{
		code: "TR",
		needles: [
			"ترکیه",
			"turkey",
			"istanbul"
		]
	},
	{
		code: "AE",
		needles: [
			"امارات",
			"dubai",
			"uae"
		]
	},
	{
		code: "FI",
		needles: ["فنلاند", "finland"]
	},
	{
		code: "SE",
		needles: ["سوئد", "sweden"]
	},
	{
		code: "PL",
		needles: [
			"لهستان",
			"poland",
			"warsaw"
		]
	},
	{
		code: "CA",
		needles: ["کانادا", "canada"]
	},
	{
		code: "JP",
		needles: [
			"ژاپن",
			"japan",
			"tokyo"
		]
	},
	{
		code: "SG",
		needles: ["سنگاپور", "singapore"]
	},
	{
		code: "AU",
		needles: ["استرالیا", "australia"]
	},
	{
		code: "AT",
		needles: [
			"اتریش",
			"austria",
			"vienna"
		]
	},
	{
		code: "CH",
		needles: ["سوئیس", "switzerland"]
	},
	{
		code: "IT",
		needles: ["ایتالیا", "italy"]
	},
	{
		code: "ES",
		needles: ["اسپانیا", "spain"]
	},
	{
		code: "RU",
		needles: [
			"روسیه",
			"russia",
			"moscow"
		]
	},
	{
		code: "HK",
		needles: [
			"هنگ کنگ",
			"هنگ‌کنگ",
			"hong kong",
			"hongkong"
		]
	},
	{
		code: "TW",
		needles: ["تایوان", "taiwan"]
	},
	{
		code: "KR",
		needles: [
			"کره جنوبی",
			"south korea",
			"korea"
		]
	},
	{
		code: "IN",
		needles: ["هند", "india"]
	},
	{
		code: "UA",
		needles: ["اوکراین", "ukraine"]
	}
];
function escapeRe(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function remarkHas(text, needle) {
	const n = needle.toLowerCase();
	const t = text.toLowerCase();
	if (n.length <= 3) return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(n)}([^\\p{L}\\p{N}]|$)`, "iu").test(text);
	return t.includes(n);
}
function countryName(code) {
	if (!code) return "نامشخص";
	return COUNTRY_FA[code.toUpperCase()] ?? code.toUpperCase();
}
function claimedCountry(remark) {
	for (const { code, needles } of REMARK_HINTS) if (needles.some((n) => remarkHas(remark, n))) return code;
	if (remarkHas(remark, "uk") && !remarkHas(remark, "ukraine")) return "GB";
	const iso = remark.match(/(^|[^A-Za-z])([A-Z]{2})([^A-Za-z]|$)/);
	if (iso && COUNTRY_FA[iso[2]]) return iso[2];
	return null;
}
var WEAK_SS = /* @__PURE__ */ new Set([
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
	"none"
]);
function analyzeSecurity(cfg) {
	const reasons = [];
	let level = "none";
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
	if (cfg.protocol === "vmess" && cfg.alterId > 0) reasons.push("AlterID غیرصفر قدیمی است؛ بهتر است صفر باشد");
	if (!cfg.uuid && !cfg.password && cfg.protocol !== "http") {
		level = "none";
		reasons.push("شناسه یا رمز خالی است");
	}
	return {
		level,
		label: level === "high" ? "امنیت بالا" : level === "medium" ? "امنیت متوسط" : level === "low" ? "امنیت پایین" : "بدون رمز کافی",
		reasons
	};
}
function diagnose(cfg, probe) {
	if (!cfg.address || !cfg.port || cfg.port < 1 || cfg.port > 65535) return {
		status: "invalid",
		title: "کانفیگ نامعتبر",
		detail: "آدرس یا پورت درست نیست."
	};
	const needsId = cfg.protocol === "vless" || cfg.protocol === "vmess";
	const needsPass = cfg.protocol === "trojan" || cfg.protocol === "ss" || cfg.protocol === "hysteria2" || cfg.protocol === "hysteria";
	if (needsId && !cfg.uuid) return {
		status: "invalid",
		title: "کانفیگ نامعتبر",
		detail: "UUID خالی است؛ این لینک قابل استفاده نیست."
	};
	if (needsPass && !cfg.password && !cfg.uuid) return {
		status: "invalid",
		title: "کانفیگ نامعتبر",
		detail: "رمز عبور خالی است."
	};
	if (cfg.tls === "reality" && !cfg.publicKey) return {
		status: "invalid",
		title: "Reality ناقص",
		detail: "کلید عمومی (pbk) Reality موجود نیست."
	};
	if (probe) {
		if (isIranLocation(probe)) return {
			status: "broken",
			title: "کانفیگ مشکل‌دار",
			detail: `سرور در ایران است${probe.city ? `، ${probe.city}` : ""}. ممکن است از فیلتر رد شوید ولی مکان نمایش‌داده‌شده عوض نمی‌شود.`
		};
		if (!probe.ok) return {
			status: "dead",
			title: "پاسخ نمی‌دهد",
			detail: probe.error || "تست دیلی به سرور نرسید."
		};
		const claimed = claimedCountry(cfg.remark);
		if (claimed && probe.countryCode && claimed !== probe.countryCode) {
			if (claimed === "IR") return {
				status: "ok",
				title: "سالم",
				detail: `نام کانفیگ ایران را نشان می‌دهد ولی مکان واقعی ${countryName(probe.countryCode)} است.`
			};
			return {
				status: "warn",
				title: "عدم تطابق مکان",
				detail: `در نام کانفیگ ${countryName(claimed)} آمده، ولی مکان واقعی ${countryName(probe.countryCode)} است.`
			};
		}
		return {
			status: "ok",
			title: "سالم",
			detail: probe.countryCode ? `مکان سرور: ${countryName(probe.countryCode)}${probe.city ? ` — ${probe.city}` : ""}.` : "سرور پاسخ داد."
		};
	}
	if (claimedCountry(cfg.remark) === "IR") return {
		status: "broken",
		title: "کانفیگ مشکل‌دار",
		detail: "از روی نام مشخص است که سرور ایران است؛ مکان عوض نخواهد شد. برای اطمینان تست دیلی بگیرید."
	};
	return {
		status: "unknown",
		title: "تست نشده",
		detail: "برای تشخیص مکان و سلامت، تست دیلی را اجرا کنید."
	};
}
function delayTone(ms) {
	if (ms == null) return "none";
	if (ms < 180) return "ok";
	if (ms < 450) return "warn";
	return "bad";
}
var IRAN_ISP = /irancell|mci\b|tci\b|shatel|pars.?online|afranet|asiatech|respina|shecan|hiweb|fanap|mobinnet|rightel|mokhaberat|iran telecommunication|datak|pishgaman|arvan(?:cloud)?|cloud\.ir|ir-?nic|telecommunication company of iran/i;
function isIranLocation(probe) {
	if (probe.countryCode === "IR") return true;
	const blob = `${probe.isp ?? ""} ${probe.org ?? ""} ${probe.country ?? ""}`;
	return IRAN_ISP.test(blob);
}
function enc(v) {
	return encodeURIComponent(v);
}
function b64(s) {
	if (typeof Buffer !== "undefined") return Buffer.from(s, "utf8").toString("base64");
	const bytes = new TextEncoder().encode(s);
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin);
}
function num$1(v, fallback) {
	const n = Number(v);
	return Number.isFinite(n) ? n : fallback;
}
var SINGBOX_NATIVE = /* @__PURE__ */ new Set([
	"hysteria2",
	"hysteria",
	"tuic",
	"wireguard",
	"anytls"
]);
function needsSingbox(cfg) {
	return SINGBOX_NATIVE.has(cfg.protocol);
}
function toUri(cfg) {
	const remark = cfg.remark ? `#${enc(cfg.remark)}` : "";
	if (cfg.protocol === "vmess") {
		const obj = {
			v: "2",
			ps: cfg.remark,
			add: cfg.address,
			port: String(cfg.port),
			id: cfg.uuid,
			aid: String(cfg.alterId ?? 0),
			scy: cfg.method || "auto",
			net: cfg.network,
			type: cfg.headerType || "none",
			host: cfg.host,
			path: cfg.path,
			tls: cfg.tls === "none" ? "" : cfg.tls,
			sni: cfg.sni,
			alpn: cfg.alpn,
			fp: cfg.fingerprint,
			pbk: cfg.publicKey,
			sid: cfg.shortId,
			spx: cfg.spiderX,
			flow: cfg.flow
		};
		return `vmess://${b64(JSON.stringify(obj))}`;
	}
	if (cfg.protocol === "ss") return `ss://${b64(`${cfg.method || "aes-256-gcm"}:${cfg.password}`)}@${cfg.address}:${cfg.port}${remark}`;
	const q = new URLSearchParams();
	if (cfg.network) q.set("type", cfg.network);
	if (cfg.tls && cfg.tls !== "none") q.set("security", cfg.tls);
	else q.set("security", "none");
	if (cfg.sni) q.set("sni", cfg.sni);
	if (cfg.host) q.set("host", cfg.host);
	if (cfg.path) q.set("path", cfg.path);
	if (cfg.flow) q.set("flow", cfg.flow);
	if (cfg.fingerprint) q.set("fp", cfg.fingerprint);
	if (cfg.alpn) q.set("alpn", cfg.alpn);
	if (cfg.publicKey) q.set("pbk", cfg.publicKey);
	if (cfg.shortId) q.set("sid", cfg.shortId);
	if (cfg.spiderX) q.set("spx", cfg.spiderX);
	if (cfg.serviceName) q.set("serviceName", cfg.serviceName);
	if (cfg.encryption && cfg.encryption !== "none") q.set("encryption", cfg.encryption);
	if (cfg.headerType && cfg.headerType !== "none") q.set("headerType", cfg.headerType);
	if (cfg.allowInsecure) q.set("allowInsecure", "1");
	if (cfg.grpcMode) q.set("mode", cfg.grpcMode);
	if (cfg.extra.obfs) q.set("obfs", cfg.extra.obfs);
	if (cfg.extra["obfs-password"]) q.set("obfs-password", cfg.extra["obfs-password"]);
	if (cfg.extra.congestion) q.set("congestion_control", cfg.extra.congestion);
	if (cfg.extra.packetEncoding) q.set("packetEncoding", cfg.extra.packetEncoding);
	if (cfg.extra.seed) q.set("seed", cfg.extra.seed);
	if (cfg.extra.xhttpMode) q.set("mode", cfg.extra.xhttpMode);
	if (cfg.protocol === "wireguard") {
		if (cfg.extra.peerPublicKey) q.set("publickey", cfg.extra.peerPublicKey);
		if (cfg.extra.mtu) q.set("mtu", cfg.extra.mtu);
		if (cfg.extra.reserved) q.set("reserved", cfg.extra.reserved);
		if (cfg.extra.localAddress) q.set("address", cfg.extra.localAddress);
	}
	const user = cfg.protocol === "vless" ? cfg.uuid : cfg.protocol === "tuic" ? `${cfg.uuid}:${cfg.password}` : enc(cfg.password || cfg.uuid);
	const host = cfg.address.includes(":") ? `[${cfg.address}]` : cfg.address;
	const scheme = cfg.protocol === "hysteria2" ? "hy2" : cfg.protocol === "hysteria" ? "hysteria" : cfg.protocol;
	const qs = q.toString();
	return `${scheme}://${user}@${host}:${cfg.port}${qs ? `?${qs}` : ""}${remark}`;
}
function toNapsternet(cfg) {
	const obj = {
		v: "2",
		ps: cfg.remark,
		add: cfg.address,
		port: String(cfg.port),
		id: cfg.uuid || cfg.password,
		aid: String(cfg.alterId ?? 0),
		scy: cfg.method || (cfg.protocol === "vmess" ? "auto" : "none"),
		net: cfg.network,
		type: cfg.headerType || "none",
		host: cfg.host,
		path: cfg.path,
		tls: cfg.tls === "none" ? "" : cfg.tls,
		sni: cfg.sni,
		alpn: cfg.alpn,
		fp: cfg.fingerprint,
		pbk: cfg.publicKey,
		sid: cfg.shortId,
		spx: cfg.spiderX,
		flow: cfg.flow,
		protocol: cfg.protocol,
		configType: cfg.protocol,
		coreType: needsSingbox(cfg) ? "singbox" : "xray",
		remarks: cfg.remark,
		server: cfg.address,
		server_port: cfg.port,
		uuid: cfg.uuid,
		password: cfg.password,
		method: cfg.method,
		fingerprint: cfg.fingerprint,
		publicKey: cfg.publicKey,
		shortId: cfg.shortId,
		serviceName: cfg.serviceName,
		allowInsecure: cfg.allowInsecure,
		obfs: cfg.extra.obfs || void 0,
		"obfs-password": cfg.extra["obfs-password"] || void 0,
		congestion: cfg.extra.congestion || void 0
	};
	return JSON.stringify(obj, null, 2);
}
function streamSettings(cfg) {
	const stream = {
		network: cfg.network,
		security: cfg.tls === "none" ? "none" : cfg.tls
	};
	if (cfg.tls === "tls" || cfg.tls === "xtls") stream.tlsSettings = {
		serverName: cfg.sni,
		allowInsecure: cfg.allowInsecure,
		fingerprint: cfg.fingerprint || void 0,
		alpn: cfg.alpn ? cfg.alpn.split(",").map((s) => s.trim()) : void 0
	};
	if (cfg.tls === "reality") stream.realitySettings = {
		serverName: cfg.sni,
		fingerprint: cfg.fingerprint || "chrome",
		publicKey: cfg.publicKey,
		shortId: cfg.shortId,
		spiderX: cfg.spiderX || "/"
	};
	if (cfg.network === "ws") stream.wsSettings = {
		path: cfg.path || "/",
		headers: cfg.host ? { Host: cfg.host } : void 0
	};
	if (cfg.network === "grpc") stream.grpcSettings = {
		serviceName: cfg.serviceName,
		multiMode: cfg.grpcMode === "multi"
	};
	if (cfg.network === "httpupgrade") stream.httpupgradeSettings = {
		path: cfg.path || "/",
		host: cfg.host || void 0
	};
	if (cfg.network === "xhttp" || cfg.network === "splithttp") stream.xhttpSettings = {
		path: cfg.path || "/",
		host: cfg.host || void 0,
		mode: cfg.extra.xhttpMode || "auto"
	};
	if (cfg.network === "kcp") stream.kcpSettings = {
		mtu: num$1(cfg.extra.kcpMtu, 1350),
		tti: num$1(cfg.extra.kcpTti, 50),
		uplinkCapacity: num$1(cfg.extra.uplinkCapacity, 12),
		downlinkCapacity: num$1(cfg.extra.downlinkCapacity, 100),
		congestion: false,
		header: { type: cfg.headerType || "none" },
		seed: cfg.extra.seed || void 0
	};
	if (cfg.network === "h2" || cfg.network === "http") stream.httpSettings = {
		path: cfg.path || "/",
		host: cfg.host ? [cfg.host] : void 0
	};
	if (cfg.network === "quic") stream.quicSettings = {
		security: cfg.method || "none",
		key: cfg.password || void 0,
		header: { type: cfg.headerType || "none" }
	};
	if (cfg.network === "tcp" && cfg.headerType && cfg.headerType !== "none") stream.tcpSettings = { header: {
		type: cfg.headerType,
		request: cfg.headerType === "http" ? {
			path: cfg.path ? [cfg.path] : ["/"],
			headers: cfg.host ? { Host: [cfg.host] } : void 0
		} : void 0
	} };
	if (cfg.extra.packetEncoding) stream.sockopt = {
		...stream.sockopt,
		domainStrategy: "UseIP"
	};
	return stream;
}
function toXrayOutbound(cfg) {
	const users = [{
		id: cfg.uuid || cfg.password,
		encryption: cfg.encryption || "none",
		flow: cfg.flow || void 0,
		security: cfg.method || void 0,
		alterId: cfg.protocol === "vmess" ? cfg.alterId : void 0,
		password: cfg.password || void 0
	}];
	const protocol = cfg.protocol === "ss" ? "shadowsocks" : cfg.protocol;
	let settings;
	if (cfg.protocol === "ss") settings = { servers: [{
		address: cfg.address,
		port: cfg.port,
		method: cfg.method || "aes-256-gcm",
		password: cfg.password
	}] };
	else if (cfg.protocol === "trojan" || cfg.protocol === "socks" || cfg.protocol === "http") settings = { servers: [{
		address: cfg.address,
		port: cfg.port,
		password: cfg.password || void 0,
		users: cfg.uuid ? [{
			user: cfg.uuid,
			pass: cfg.password
		}] : void 0
	}] };
	else settings = { vnext: [{
		address: cfg.address,
		port: cfg.port,
		users
	}] };
	const outbound = {
		tag: cfg.remark || "proxy",
		protocol,
		settings,
		streamSettings: streamSettings(cfg)
	};
	return JSON.stringify({ outbounds: [outbound] }, null, 2);
}
function toClash(cfg) {
	const proxy = {
		name: cfg.remark || `${cfg.protocol}-${cfg.address}`,
		type: cfg.protocol === "ss" ? "ss" : cfg.protocol,
		server: cfg.address,
		port: cfg.port
	};
	if (cfg.uuid) proxy.uuid = cfg.uuid;
	if (cfg.password) proxy.password = cfg.password;
	if (cfg.method) proxy.cipher = cfg.method;
	if (cfg.alterId) proxy.alterId = cfg.alterId;
	if (cfg.network && cfg.network !== "tcp") proxy.network = cfg.network;
	if (cfg.tls === "tls" || cfg.tls === "reality") proxy.tls = true;
	if (cfg.sni) proxy.servername = cfg.sni;
	if (cfg.fingerprint) proxy["client-fingerprint"] = cfg.fingerprint;
	if (cfg.alpn) proxy.alpn = cfg.alpn.split(",").map((s) => s.trim());
	if (cfg.flow) proxy.flow = cfg.flow;
	if (cfg.encryption && cfg.encryption !== "none") proxy.encryption = cfg.encryption;
	if (cfg.tls === "reality") proxy["reality-opts"] = {
		"public-key": cfg.publicKey,
		"short-id": cfg.shortId
	};
	if (cfg.network === "ws") proxy["ws-opts"] = {
		path: cfg.path || "/",
		headers: cfg.host ? { Host: cfg.host } : void 0
	};
	if (cfg.network === "grpc") proxy["grpc-opts"] = { "grpc-service-name": cfg.serviceName };
	if (cfg.network === "httpupgrade" || cfg.network === "h2" || cfg.network === "http") proxy["http-opts"] = {
		path: cfg.path ? [cfg.path] : void 0,
		headers: cfg.host ? { Host: [cfg.host] } : void 0
	};
	if (cfg.extra.obfs) proxy.obfs = cfg.extra.obfs;
	if (cfg.extra["obfs-password"]) proxy["obfs-password"] = cfg.extra["obfs-password"];
	if (cfg.allowInsecure) proxy["skip-cert-verify"] = true;
	return JSON.stringify(proxy, null, 2);
}
function toSingboxOutbound(cfg) {
	const tls = cfg.tls === "tls" || cfg.tls === "reality" || cfg.tls === "xtls" ? {
		enabled: true,
		server_name: cfg.sni || void 0,
		insecure: cfg.allowInsecure || void 0,
		alpn: cfg.alpn ? cfg.alpn.split(",").map((s) => s.trim()) : void 0,
		utls: cfg.fingerprint ? {
			enabled: true,
			fingerprint: cfg.fingerprint
		} : void 0,
		reality: cfg.tls === "reality" ? {
			enabled: true,
			public_key: cfg.publicKey,
			short_id: cfg.shortId
		} : void 0
	} : void 0;
	const transport = cfg.network && cfg.network !== "tcp" && cfg.network !== "raw" ? {
		type: cfg.network === "h2" ? "http" : cfg.network === "httpupgrade" ? "httpupgrade" : cfg.network === "xhttp" || cfg.network === "splithttp" ? "http" : cfg.network,
		path: cfg.path || void 0,
		host: cfg.host || void 0,
		service_name: cfg.serviceName || void 0,
		headers: cfg.host ? { Host: cfg.host } : void 0
	} : void 0;
	const base = {
		tag: cfg.remark || "proxy",
		type: cfg.protocol === "ss" ? "shadowsocks" : cfg.protocol === "hysteria" ? "hysteria" : cfg.protocol,
		server: cfg.address,
		server_port: cfg.port
	};
	if (cfg.protocol === "vless" || cfg.protocol === "vmess") {
		base.uuid = cfg.uuid;
		if (cfg.flow) base.flow = cfg.flow;
		if (cfg.protocol === "vmess" && cfg.alterId) base.alter_id = cfg.alterId;
		if (cfg.protocol === "vmess") base.security = cfg.method || "auto";
		if (cfg.encryption && cfg.encryption !== "none") base.packet_encoding = cfg.extra.packetEncoding || "xudp";
	} else if (cfg.protocol === "trojan" || cfg.protocol === "anytls") base.password = cfg.password;
	else if (cfg.protocol === "ss") {
		base.method = cfg.method || "aes-256-gcm";
		base.password = cfg.password;
	} else if (cfg.protocol === "hysteria2" || cfg.protocol === "hysteria") {
		base.password = cfg.password;
		if (cfg.extra.obfs) base.obfs = {
			type: cfg.extra.obfs,
			password: cfg.extra["obfs-password"] || void 0
		};
	} else if (cfg.protocol === "tuic") {
		base.uuid = cfg.uuid;
		base.password = cfg.password;
		if (cfg.extra.congestion) base.congestion_control = cfg.extra.congestion;
	} else if (cfg.protocol === "wireguard") {
		base.private_key = cfg.password;
		base.peer_public_key = cfg.extra.peerPublicKey || cfg.publicKey;
		if (cfg.extra.localAddress) base.local_address = cfg.extra.localAddress.split(",");
		if (cfg.extra.mtu) base.mtu = num$1(cfg.extra.mtu, 1280);
		if (cfg.extra.reserved) base.reserved = cfg.extra.reserved.split(",").map((n) => Number(n));
	} else if (cfg.protocol === "socks" || cfg.protocol === "http") {
		if (cfg.uuid) base.username = cfg.uuid;
		if (cfg.password) base.password = cfg.password;
	}
	if (tls) base.tls = tls;
	if (transport && !needsSingbox(cfg)) base.transport = transport;
	return base;
}
function toSingbox(cfg) {
	return JSON.stringify({ outbounds: [toSingboxOutbound(cfg)] }, null, 2);
}
function toShareList(configs) {
	return configs.map((c) => toUri(c)).join("\n");
}
function toShareListB64(configs) {
	const text = toShareList(configs);
	if (typeof Buffer !== "undefined") return Buffer.from(text, "utf8").toString("base64");
	const bytes = new TextEncoder().encode(text);
	let bin = "";
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin);
}
function toFullClientConfig(cfg, settings) {
	if (settings.core === "sing-box" || needsSingbox(cfg)) return toFullSingboxConfig(cfg, settings);
	return toFullXrayConfig(cfg, settings);
}
function toFullXrayConfig(cfg, settings) {
	const proxy = JSON.parse(toXrayOutbound(cfg)).outbounds[0] ?? {};
	const proxyTag = String(proxy.tag || "proxy");
	const inbounds = [{
		tag: "socks",
		port: settings.socksPort,
		listen: "127.0.0.1",
		protocol: "socks",
		settings: {
			udp: settings.udp,
			auth: "noauth"
		},
		sniffing: settings.sniffing ? {
			enabled: true,
			destOverride: [
				"http",
				"tls",
				"quic"
			],
			routeOnly: false
		} : void 0
	}, {
		tag: "http",
		port: settings.httpPort,
		listen: "127.0.0.1",
		protocol: "http",
		sniffing: settings.sniffing ? {
			enabled: true,
			destOverride: ["http", "tls"]
		} : void 0
	}];
	if (settings.tunEnabled) inbounds.push({
		tag: "tun",
		protocol: "tun",
		settings: {
			mtu: 1500,
			name: "tun0",
			strictRoute: settings.tunStrictRoute
		},
		sniffing: settings.sniffing ? {
			enabled: true,
			destOverride: [
				"http",
				"tls",
				"quic"
			]
		} : void 0
	});
	const routingRules = [];
	if (settings.bypassLan) routingRules.push({
		type: "field",
		ip: ["geoip:private"],
		outboundTag: "direct"
	});
	if (settings.bypassIran) {
		routingRules.push({
			type: "field",
			domain: ["geosite:ir"],
			outboundTag: "direct"
		});
		routingRules.push({
			type: "field",
			ip: ["geoip:ir"],
			outboundTag: "direct"
		});
	}
	if (settings.blockAds) routingRules.push({
		type: "field",
		domain: ["geosite:category-ads-all"],
		outboundTag: "block"
	});
	const outbounds = [proxy];
	if (settings.fragmentEnabled) {
		const stream = proxy.streamSettings ?? {};
		stream.sockopt = {
			...stream.sockopt,
			dialerProxy: "fragment"
		};
		proxy.streamSettings = stream;
		outbounds.push({
			tag: "fragment",
			protocol: "freedom",
			settings: { fragment: {
				packets: settings.fragmentPackets,
				length: settings.fragmentLength,
				interval: settings.fragmentInterval
			} }
		});
	}
	if (settings.muxEnabled) proxy.mux = {
		enabled: true,
		concurrency: settings.muxConcurrency,
		xudpConcurrency: settings.muxXudp ? settings.muxConcurrency : 0,
		xudpProxyUDP443: "reject"
	};
	outbounds.push({
		tag: "direct",
		protocol: "freedom"
	}, {
		tag: "block",
		protocol: "blackhole"
	});
	const dnsServers = [
		settings.dnsDoh || "https://1.1.1.1/dns-query",
		settings.dnsPrimary,
		settings.dnsSecondary
	].filter(Boolean);
	return JSON.stringify({
		log: { loglevel: settings.logLevel },
		dns: {
			servers: dnsServers,
			queryStrategy: "UseIP",
			...settings.fakeDns ? { fakeDns: [{
				ipPool: "198.18.0.0/15",
				poolSize: 65535
			}] } : {}
		},
		inbounds,
		outbounds,
		routing: {
			domainStrategy: settings.domainStrategy || "IPIfNonMatch",
			rules: [...routingRules, {
				type: "field",
				inboundTag: settings.tunEnabled ? [
					"socks",
					"http",
					"tun"
				] : ["socks", "http"],
				outboundTag: proxyTag
			}]
		}
	}, null, 2);
}
function toFullSingboxConfig(cfg, settings) {
	const proxy = toSingboxOutbound(cfg);
	const inbounds = [{
		type: "socks",
		tag: "socks-in",
		listen: "127.0.0.1",
		listen_port: settings.socksPort,
		sniff: settings.sniffing
	}, {
		type: "http",
		tag: "http-in",
		listen: "127.0.0.1",
		listen_port: settings.httpPort,
		sniff: settings.sniffing
	}];
	if (settings.tunEnabled) inbounds.push({
		type: "tun",
		tag: "tun-in",
		address: ["172.19.0.1/30"],
		auto_route: true,
		strict_route: settings.tunStrictRoute,
		stack: "system",
		sniff: settings.sniffing
	});
	const rules = [];
	if (settings.bypassLan) rules.push({
		ip_is_private: true,
		outbound: "direct"
	});
	if (settings.bypassIran) {
		rules.push({
			geosite: "ir",
			outbound: "direct"
		});
		rules.push({
			geoip: "ir",
			outbound: "direct"
		});
	}
	if (settings.blockAds) rules.push({
		geosite: "category-ads-all",
		outbound: "block"
	});
	return JSON.stringify({
		log: { level: settings.logLevel === "none" ? "panic" : settings.logLevel },
		dns: {
			servers: [
				{
					tag: "doh",
					address: settings.dnsDoh || "https://1.1.1.1/dns-query"
				},
				{
					tag: "primary",
					address: settings.dnsPrimary
				},
				{
					tag: "secondary",
					address: settings.dnsSecondary
				}
			],
			strategy: "prefer_ipv4"
		},
		inbounds,
		outbounds: [
			proxy,
			{
				type: "direct",
				tag: "direct"
			},
			{
				type: "block",
				tag: "block"
			}
		],
		route: {
			rules,
			final: String(proxy.tag || "proxy")
		}
	}, null, 2);
}
var PROTOCOLS = [
	"vless",
	"vmess",
	"trojan",
	"ss",
	"ssr",
	"hysteria2",
	"hysteria",
	"tuic",
	"wireguard",
	"socks",
	"http",
	"anytls",
	"unknown"
];
var NETWORKS = [
	"tcp",
	"kcp",
	"ws",
	"h2",
	"http",
	"quic",
	"grpc",
	"httpupgrade",
	"splithttp",
	"xhttp",
	"raw"
];
var DEFAULT_SETTINGS = {
	socksPort: 10808,
	httpPort: 10809,
	muxEnabled: false,
	muxConcurrency: 8,
	muxXudp: true,
	fingerprint: "chrome",
	fragmentEnabled: false,
	fragmentPackets: "tlshello",
	fragmentLength: "100-200",
	fragmentInterval: "10-20",
	dnsPrimary: "1.1.1.1",
	dnsSecondary: "8.8.8.8",
	dnsDoh: "https://1.1.1.1/dns-query",
	bypassLan: true,
	bypassIran: true,
	blockAds: false,
	sniffing: true,
	allowInsecure: false,
	udp: true,
	logLevel: "warning",
	core: "xray",
	domainStrategy: "IPIfNonMatch",
	fakeDns: false,
	tunEnabled: false,
	tunStrictRoute: true
};
function emptyConfig(partial) {
	return {
		id: crypto.randomUUID(),
		remark: "",
		protocol: "vless",
		address: "",
		port: 443,
		uuid: "",
		password: "",
		alterId: 0,
		method: "",
		flow: "",
		encryption: "none",
		network: "tcp",
		headerType: "none",
		host: "",
		path: "",
		serviceName: "",
		grpcMode: "gun",
		tls: "none",
		sni: "",
		alpn: "",
		fingerprint: "",
		allowInsecure: false,
		publicKey: "",
		shortId: "",
		spiderX: "",
		extra: {},
		source: "uri",
		raw: "",
		group: "",
		...partial
	};
}
function newId() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return `cfg-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}
function decodeB64(input) {
	const raw = input.trim().replace(/\s+/g, "");
	if (!raw) return null;
	const norm = raw.replace(/-/g, "+").replace(/_/g, "/");
	const pad = norm + "=".repeat((4 - norm.length % 4) % 4);
	try {
		if (typeof atob === "function") {
			const bin = atob(pad);
			const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
			try {
				return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
			} catch {
				return bin;
			}
		}
	} catch {}
	try {
		if (typeof Buffer !== "undefined") return Buffer.from(pad, "base64").toString("utf8");
	} catch {
		return null;
	}
	return null;
}
function str(v, fallback = "") {
	if (v == null) return fallback;
	return String(v).trim();
}
function num(v, fallback = 0) {
	const n = Number(v);
	return Number.isFinite(n) ? n : fallback;
}
function rec(v) {
	return v && typeof v === "object" && !Array.isArray(v) ? v : null;
}
function pick(obj, keys, fallback = "") {
	for (const k of keys) if (obj[k] != null && obj[k] !== "") return str(obj[k]);
	return fallback;
}
function pickNum(obj, keys, fallback = 0) {
	for (const k of keys) if (obj[k] != null && obj[k] !== "") return num(obj[k], fallback);
	return fallback;
}
function asProtocol(v) {
	const t = v.toLowerCase().replace(/[^a-z0-9]/g, "");
	if (t === "shadowsocks" || t === "shadowsocks2022") return "ss";
	if (t === "hysteria2" || t === "hy2") return "hysteria2";
	if (t === "hysteria" || t === "hy") return "hysteria";
	if (t === "wireguard" || t === "wg") return "wireguard";
	if (t === "socks5" || t === "socks4") return "socks";
	if (t === "https") return "http";
	if (t === "vmess") return "vmess";
	if (t === "vless") return "vless";
	if (t === "trojan") return "trojan";
	if (t === "ssr" || t === "shadowsocksr") return "ssr";
	if (t === "tuic" || t === "tuicv5") return "tuic";
	if (t === "anytls") return "anytls";
	if (t === "ss") return "ss";
	return "unknown";
}
function asNetwork(v) {
	const t = v.toLowerCase();
	if (t === "websocket") return "ws";
	if (t === "httpupgrade" || t === "http_upgrade") return "httpupgrade";
	if (t === "splithttp" || t === "split-http") return "splithttp";
	if (t === "xhttp" || t === "splithttpv2") return "xhttp";
	if (t === "h2" || t === "http2") return "h2";
	if (t === "grpc" || t === "gun") return "grpc";
	if (t === "kcp" || t === "mkcp") return "kcp";
	if (t === "quic") return "quic";
	if (t === "http" || t === "h1" || t === "tcphttp") return "http";
	if (t === "raw") return "raw";
	if (t === "tcp" || t === "none" || t === "") return "tcp";
	if (NETWORK_SET.has(t)) return t;
	return "tcp";
}
var NETWORK_SET = /* @__PURE__ */ new Set([
	"tcp",
	"kcp",
	"ws",
	"h2",
	"http",
	"quic",
	"grpc",
	"httpupgrade",
	"splithttp",
	"xhttp",
	"raw"
]);
function asTls(v) {
	const t = v.toLowerCase();
	if (t === "reality") return "reality";
	if (t === "xtls") return "xtls";
	if (t === "tls" || t === "true" || t === "1") return "tls";
	return "none";
}
function queryMap(search) {
	const out = {};
	const q = search.startsWith("?") ? search.slice(1) : search;
	for (const part of q.split("&")) {
		if (!part) continue;
		const eq = part.indexOf("=");
		const k = decodeURIComponent(eq >= 0 ? part.slice(0, eq) : part);
		out[k] = decodeURIComponent(eq >= 0 ? part.slice(eq + 1) : "");
	}
	return out;
}
function hashRemark(hash) {
	if (!hash) return "";
	try {
		return decodeURIComponent(hash.replace(/^\u0000/, ""));
	} catch {
		return hash;
	}
}
function applyStreamQuery(cfg, q) {
	const type = q.type || q.net || q.network || "";
	if (type) cfg.network = asNetwork(type);
	const sec = q.security || q.tls || "";
	if (sec) cfg.tls = asTls(sec);
	cfg.sni = q.sni || q.serverName || (cfg.protocol === "wireguard" ? cfg.sni : q.peer) || cfg.sni;
	cfg.host = q.host || q.authority || cfg.host;
	cfg.path = q.path || q.serviceName || cfg.path;
	cfg.flow = q.flow || cfg.flow;
	cfg.fingerprint = q.fp || q.fingerprint || cfg.fingerprint;
	cfg.alpn = q.alpn || cfg.alpn;
	cfg.publicKey = q.pbk || q.publicKey || q["public-key"] || cfg.publicKey;
	cfg.shortId = q.sid || q.shortId || q["short-id"] || cfg.shortId;
	cfg.spiderX = q.spx || q.spiderX || cfg.spiderX;
	cfg.headerType = q.headerType || q.headertype || q.header || cfg.headerType;
	cfg.serviceName = q.serviceName || q.servicename || cfg.serviceName;
	cfg.encryption = q.encryption || cfg.encryption;
	cfg.method = q.method || q.scy || cfg.method;
	if (q.insecure === "1" || q.allowInsecure === "1" || q.allowinsecure === "1") cfg.allowInsecure = true;
	if (q.mode) cfg.grpcMode = q.mode;
	if (q.alpn) cfg.alpn = q.alpn;
	if (q.obfs) cfg.extra.obfs = q.obfs;
	if (q["obfs-password"] || q.obfsPassword) cfg.extra["obfs-password"] = q["obfs-password"] || q.obfsPassword;
	if (q.congestion_control || q.congestion) cfg.extra.congestion = q.congestion_control || q.congestion;
	if (cfg.protocol === "wireguard") {
		if (q.publickey || q.peer) cfg.extra.peerPublicKey = q.publickey || q.peer;
		if (q.mtu) cfg.extra.mtu = q.mtu;
		if (q.reserved) cfg.extra.reserved = q.reserved;
		if (q.address) cfg.extra.localAddress = q.address;
	}
	if (q.packetEncoding || q.packetencoding) cfg.extra.packetEncoding = q.packetEncoding || q.packetencoding;
	if (q.seed) cfg.extra.seed = q.seed;
	for (const [k, v] of Object.entries(q)) if (!(k in cfg) && v) cfg.extra[k] = v;
	if (cfg.publicKey && cfg.tls === "none") cfg.tls = "reality";
	if ((q.security || "").toLowerCase() === "reality") cfg.tls = "reality";
}
function parseUri(line) {
	const trimmed = line.trim();
	if (!trimmed) return null;
	const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
	if (!schemeMatch) return null;
	const scheme = schemeMatch[1].toLowerCase();
	if (scheme === "vmess") return parseVmess(trimmed);
	if (scheme === "ss" || scheme === "shadowsocks") return parseSs(trimmed);
	if (scheme === "ssr") return parseSsr(trimmed);
	const proto = asProtocol(scheme === "hy2" ? "hysteria2" : scheme);
	const rest = trimmed.slice(schemeMatch[0].length);
	const hashIdx = rest.lastIndexOf("#");
	const remark = hashIdx >= 0 ? hashRemark(rest.slice(hashIdx + 1)) : "";
	const body = hashIdx >= 0 ? rest.slice(0, hashIdx) : rest;
	const qIdx = body.indexOf("?");
	const main = qIdx >= 0 ? body.slice(0, qIdx) : body;
	const q = qIdx >= 0 ? queryMap(body.slice(qIdx)) : {};
	let user = "";
	let hostport = main;
	const at = splitUserHost(main);
	if (at) {
		user = at.user;
		hostport = at.hostport;
	}
	const hp = splitHostPort(hostport);
	if (!hp) return null;
	const cfg = emptyConfig({
		id: newId(),
		remark: remark || `${proto} ${hp.host}`,
		protocol: proto === "unknown" ? scheme : proto,
		address: hp.host,
		port: hp.port,
		source: "uri",
		raw: trimmed
	});
	if (proto === "vless" || proto === "vmess" || proto === "tuic") {
		if (user.includes(":")) {
			const [a, b] = user.split(":");
			cfg.uuid = a;
			cfg.password = b ?? "";
		} else {
			cfg.uuid = user;
			if (proto === "tuic") cfg.password = user;
		}
	} else {
		cfg.password = decodeURIComponent(user);
		if (proto === "socks" || proto === "http") {
			const [u, p] = user.split(":");
			cfg.uuid = u ?? "";
			cfg.password = p ?? "";
		}
	}
	applyStreamQuery(cfg, q);
	if (!cfg.sni && cfg.host) cfg.sni = cfg.host;
	return cfg;
}
function splitUserHost(main) {
	const at = main.lastIndexOf("@");
	if (at < 0) return null;
	return {
		user: decodeURIComponent(main.slice(0, at)),
		hostport: main.slice(at + 1)
	};
}
function splitHostPort(hostport) {
	let host = hostport.trim();
	let port = 443;
	if (host.startsWith("[")) {
		const end = host.indexOf("]");
		if (end < 0) return null;
		const inside = host.slice(1, end);
		const rest = host.slice(end + 1);
		host = inside;
		if (rest.startsWith(":")) port = num(rest.slice(1), 443);
	} else {
		const colon = host.lastIndexOf(":");
		if (colon > 0) {
			port = num(host.slice(colon + 1), 443);
			host = host.slice(0, colon);
		}
	}
	if (!host) return null;
	return {
		host,
		port
	};
}
function parseVmess(uri) {
	const decoded = decodeB64(uri.slice(8));
	if (!decoded) return null;
	try {
		const obj = rec(JSON.parse(decoded));
		if (!obj) return null;
		return fromVmessObject(obj, uri);
	} catch {
		return parseLooseVmess(uri);
	}
}
function parseLooseVmess(uri) {
	const cfg = parseUri(uri.replace(/^vmess:\/\//i, "vless://"));
	if (!cfg) return null;
	cfg.protocol = "vmess";
	cfg.raw = uri;
	return cfg;
}
function fromVmessObject(obj, raw) {
	const tlsRaw = str(obj.tls || obj.security);
	const cfg = emptyConfig({
		id: newId(),
		remark: pick(obj, [
			"ps",
			"remarks",
			"name",
			"remark"
		], "VMess"),
		protocol: "vmess",
		address: pick(obj, [
			"add",
			"server",
			"address",
			"host"
		]),
		port: pickNum(obj, [
			"port",
			"server_port",
			"serverPort"
		], 443),
		uuid: pick(obj, [
			"id",
			"uuid",
			"user"
		]),
		alterId: pickNum(obj, [
			"aid",
			"alterId",
			"alterid"
		], 0),
		method: pick(obj, [
			"scy",
			"security",
			"method"
		], "auto"),
		network: asNetwork(pick(obj, ["net", "network"], "tcp")),
		headerType: pick(obj, ["type", "headerType"], "none"),
		host: pick(obj, ["host", "authority"]),
		path: pick(obj, ["path"]),
		tls: asTls(tlsRaw),
		sni: pick(obj, [
			"sni",
			"serverName",
			"peer"
		]),
		alpn: pick(obj, ["alpn"]),
		fingerprint: pick(obj, ["fp", "fingerprint"]),
		flow: pick(obj, ["flow"]),
		publicKey: pick(obj, [
			"pbk",
			"publicKey",
			"public_key"
		]),
		shortId: pick(obj, [
			"sid",
			"shortId",
			"short_id"
		]),
		spiderX: pick(obj, ["spx", "spiderX"]),
		serviceName: pick(obj, ["serviceName", "service_name"]),
		source: looksNapsternet(obj) ? "napsternet" : "uri",
		raw,
		allowInsecure: obj.allowInsecure === true || obj.insecure === true
	});
	if (cfg.network === "grpc" && !cfg.serviceName && cfg.path) cfg.serviceName = cfg.path;
	if (cfg.publicKey) cfg.tls = "reality";
	if (tlsRaw.toLowerCase() === "reality") cfg.tls = "reality";
	if (!cfg.sni && cfg.host) cfg.sni = cfg.host;
	return cfg;
}
function parseSs(uri) {
	const payload = uri.slice(uri.indexOf("://") + 3);
	const hashIdx = payload.lastIndexOf("#");
	const remark = hashIdx >= 0 ? hashRemark(payload.slice(hashIdx + 1)) : "";
	let body = hashIdx >= 0 ? payload.slice(0, hashIdx) : payload;
	const qIdx = body.indexOf("?");
	const q = qIdx >= 0 ? queryMap(body.slice(qIdx)) : {};
	if (qIdx >= 0) body = body.slice(0, qIdx);
	let userinfo = "";
	let hostport = body;
	if (body.includes("@")) {
		const at = body.lastIndexOf("@");
		userinfo = body.slice(0, at);
		hostport = body.slice(at + 1);
		const decoded = decodeB64(userinfo);
		if (decoded && decoded.includes(":")) userinfo = decoded;
		else try {
			userinfo = decodeURIComponent(userinfo);
		} catch {}
	} else {
		const decoded = decodeB64(body);
		if (decoded && decoded.includes("@")) {
			const at = decoded.lastIndexOf("@");
			userinfo = decoded.slice(0, at);
			hostport = decoded.slice(at + 1);
		}
	}
	const hp = splitHostPort(hostport);
	if (!hp) return null;
	const colon = userinfo.indexOf(":");
	const method = colon >= 0 ? userinfo.slice(0, colon) : "aes-256-gcm";
	const password = colon >= 0 ? userinfo.slice(colon + 1) : userinfo;
	const cfg = emptyConfig({
		id: newId(),
		remark: remark || `SS ${hp.host}`,
		protocol: "ss",
		address: hp.host,
		port: hp.port,
		method,
		password,
		source: "uri",
		raw: uri
	});
	applyStreamQuery(cfg, q);
	return cfg;
}
function parseSsr(uri) {
	const decoded = decodeB64(uri.slice(6));
	if (!decoded) return null;
	const [main, qs] = decoded.split("/?");
	const parts = (main ?? "").split(":");
	if (parts.length < 6) return null;
	const [host, port, protocol, method, obfs, pwdB64] = parts;
	const password = decodeB64(pwdB64) ?? pwdB64;
	const q = qs ? queryMap(qs) : {};
	const remark = decodeB64(q.remarks || q.remark || "") ?? q.remarks ?? "";
	return emptyConfig({
		id: newId(),
		remark: remark || `SSR ${host}`,
		protocol: "ssr",
		address: host,
		port: num(port, 443),
		method,
		password,
		extra: {
			protocol,
			obfs,
			obfsparam: q.obfsparam ?? "",
			protoparam: q.protoparam ?? ""
		},
		source: "uri",
		raw: uri
	});
}
function looksNapsternet(obj) {
	if (obj.npv != null || obj.vpnType != null || obj.configType != null || obj.coreType != null) return true;
	const keys = Object.keys(obj);
	if (obj.v != null && obj.add != null && (obj.id != null || obj.uuid != null) && obj.configType == null) return false;
	const hasServer = keys.includes("server") && keys.includes("remarks");
	const npvHints = [
		"pbk",
		"sid",
		"spx",
		"fp",
		"scy"
	].filter((k) => keys.includes(k)).length >= 2;
	return Boolean(hasServer && npvHints);
}
function pickHeader(obj) {
	const raw = pick(obj, [
		"headerType",
		"header",
		"headertype"
	]);
	if (raw) return raw;
	const t = pick(obj, ["type"]).toLowerCase();
	if ((/* @__PURE__ */ new Set([
		"none",
		"http",
		"srtp",
		"utp",
		"wechat-video",
		"dtls",
		"wireguard"
	])).has(t)) return t;
	return "none";
}
function fromGenericObject(obj, raw, source) {
	const protocol = asProtocol(pick(obj, [
		"protocol",
		"type",
		"configType",
		"vpnType",
		"coreType"
	], "vless"));
	const tlsRaw = pick(obj, [
		"tls",
		"security",
		"streamSecurity"
	]);
	const cfg = emptyConfig({
		id: newId(),
		remark: pick(obj, [
			"ps",
			"remarks",
			"name",
			"remark",
			"label"
		], protocol.toUpperCase()),
		protocol: protocol === "unknown" ? "vless" : protocol,
		address: pick(obj, [
			"add",
			"server",
			"address",
			"hostname",
			"ip",
			"host"
		]),
		port: pickNum(obj, [
			"port",
			"server_port",
			"serverPort"
		], 443),
		uuid: pick(obj, [
			"id",
			"uuid",
			"user",
			"username"
		]),
		password: pick(obj, [
			"password",
			"passwd",
			"pass"
		]),
		alterId: pickNum(obj, ["aid", "alterId"], 0),
		method: pick(obj, [
			"scy",
			"method",
			"cipher",
			"encryption"
		], ""),
		network: asNetwork(pick(obj, [
			"net",
			"network",
			"transport"
		], "tcp")),
		headerType: pickHeader(obj),
		host: pick(obj, [
			"host",
			"wsHost",
			"authority"
		]),
		path: pick(obj, ["path", "wsPath"]),
		tls: asTls(tlsRaw),
		sni: pick(obj, [
			"sni",
			"serverName",
			"peer",
			"server_name",
			"servername"
		]),
		alpn: pick(obj, ["alpn"]),
		fingerprint: pick(obj, [
			"fp",
			"fingerprint",
			"client-fingerprint"
		]),
		flow: pick(obj, ["flow"]),
		publicKey: pick(obj, [
			"pbk",
			"publicKey",
			"public_key",
			"public-key"
		]),
		shortId: pick(obj, [
			"sid",
			"shortId",
			"short_id",
			"short-id"
		]),
		spiderX: pick(obj, [
			"spx",
			"spiderX",
			"spider-x"
		]),
		serviceName: pick(obj, [
			"serviceName",
			"service_name",
			"grpc-service-name"
		]),
		encryption: pick(obj, ["encryption"], "none"),
		source,
		raw,
		allowInsecure: obj.allowInsecure === true || obj.insecure === true || obj.skipCertVerify === true || obj["skip-cert-verify"] === true,
		group: pick(obj, ["group", "subscription"])
	});
	const reality = rec(obj["reality-opts"]) ?? rec(obj.realityOpts) ?? rec(obj.realitySettings);
	if (reality) {
		cfg.tls = "reality";
		cfg.publicKey = pick(reality, [
			"public-key",
			"publicKey",
			"pbk"
		], cfg.publicKey);
		cfg.shortId = pick(reality, [
			"short-id",
			"shortId",
			"sid"
		], cfg.shortId);
		cfg.spiderX = pick(reality, ["spider-x", "spiderX"], cfg.spiderX);
	}
	const ws = rec(obj["ws-opts"]) ?? rec(obj.wsSettings) ?? rec(obj.wsopts);
	if (ws) {
		cfg.network = "ws";
		cfg.path = pick(ws, ["path"], cfg.path);
		const headers = rec(ws.headers);
		if (headers) cfg.host = pick(headers, ["Host", "host"], cfg.host);
	}
	const grpc = rec(obj["grpc-opts"]) ?? rec(obj.grpcSettings);
	if (grpc) {
		cfg.network = "grpc";
		cfg.serviceName = pick(grpc, ["grpc-service-name", "serviceName"], cfg.serviceName);
	}
	if (obj.tls === true || obj.tls === "true") cfg.tls = cfg.publicKey ? "reality" : "tls";
	if (cfg.publicKey && cfg.tls === "none") cfg.tls = "reality";
	if (!cfg.sni && cfg.host) cfg.sni = cfg.host;
	if (looksNapsternet(obj)) cfg.source = "napsternet";
	return cfg;
}
function fromXrayOutbound(ob, raw) {
	const protocol = asProtocol(str(ob.protocol || ob.tag));
	if (["unknown"].includes(protocol) && !ob.settings) return null;
	const protoName = str(ob.protocol);
	if ([
		"freedom",
		"blackhole",
		"dns",
		"block",
		"direct"
	].includes(protoName)) return null;
	const settings = rec(ob.settings) ?? {};
	const stream = rec(ob.streamSettings) ?? rec(ob.stream_settings) ?? {};
	const vnext = Array.isArray(settings.vnext) ? rec(settings.vnext[0]) : rec(settings.vnext);
	const servers = Array.isArray(settings.servers) ? rec(settings.servers[0]) : rec(settings.servers);
	const usersFromVnext = vnext && Array.isArray(vnext.users) ? rec(vnext.users[0]) : rec(vnext?.users);
	const usersFromSrv = servers && Array.isArray(servers.users) ? rec(servers.users[0]) : rec(servers?.users);
	const user = usersFromVnext ?? usersFromSrv ?? rec(settings);
	const address = str(vnext?.address ?? servers?.address ?? settings.address ?? settings.server);
	const port = num(vnext?.port ?? servers?.port ?? settings.port, 443);
	if (!address) return null;
	const tlsMode = asTls(str(stream.security));
	const tlsSet = rec(stream.tlsSettings) ?? rec(stream.realitySettings) ?? {};
	const cfg = emptyConfig({
		id: newId(),
		remark: str(ob.tag || ob.remarks || address),
		protocol: asProtocol(protoName || "vless"),
		address,
		port,
		uuid: str(user?.id ?? user?.uuid),
		password: str(user?.password ?? settings.password),
		alterId: num(user?.alterId, 0),
		method: str(user?.security ?? user?.method ?? settings.method),
		flow: str(user?.flow),
		encryption: str(user?.encryption, "none"),
		network: asNetwork(str(stream.network, "tcp")),
		tls: tlsMode,
		sni: str(tlsSet.serverName ?? tlsSet.server_name),
		fingerprint: str(tlsSet.fingerprint),
		alpn: Array.isArray(tlsSet.alpn) ? tlsSet.alpn.map(String).join(",") : str(tlsSet.alpn),
		publicKey: str(tlsSet.publicKey ?? tlsSet.public_key),
		shortId: Array.isArray(tlsSet.shortIds) ? str(tlsSet.shortIds[0]) : str(tlsSet.shortId ?? tlsSet.short_id),
		spiderX: str(tlsSet.spiderX ?? tlsSet.spider_x),
		allowInsecure: tlsSet.allowInsecure === true,
		source: "xray-json",
		raw
	});
	const ws = rec(stream.wsSettings);
	if (ws) {
		cfg.path = str(ws.path);
		const headers = rec(ws.headers);
		if (headers) cfg.host = str(headers.Host ?? headers.host);
	}
	const grpc = rec(stream.grpcSettings);
	if (grpc) cfg.serviceName = str(grpc.serviceName);
	const httpupgrade = rec(stream.httpupgradeSettings) ?? rec(stream.httpUpgradeSettings);
	if (httpupgrade) {
		cfg.path = str(httpupgrade.path, cfg.path);
		cfg.host = str(httpupgrade.host, cfg.host);
	}
	if (cfg.publicKey) cfg.tls = "reality";
	return cfg;
}
function fromSingbox(ob, raw) {
	const type = str(ob.type);
	if (!type || [
		"direct",
		"block",
		"dns",
		"selector",
		"urltest"
	].includes(type)) return null;
	const tls = rec(ob.tls) ?? {};
	const reality = rec(tls.reality) ?? {};
	const transport = rec(ob.transport) ?? {};
	const cfg = emptyConfig({
		id: newId(),
		remark: str(ob.tag || ob.name || type),
		protocol: asProtocol(type),
		address: str(ob.server),
		port: num(ob.server_port ?? ob.port, 443),
		uuid: str(ob.uuid),
		password: str(ob.password),
		flow: str(ob.flow),
		method: str(ob.method ?? ob.cipher),
		network: asNetwork(str(transport.type, "tcp")),
		path: str(transport.path),
		host: str(transport.host) || (Array.isArray(transport.headers) ? "" : str(rec(transport.headers)?.Host)),
		serviceName: str(transport.service_name),
		tls: tls.enabled === false ? "none" : reality.public_key ? "reality" : tls.enabled ? "tls" : "none",
		sni: str(tls.server_name),
		alpn: Array.isArray(tls.alpn) ? tls.alpn.map(String).join(",") : str(tls.alpn),
		fingerprint: str(tls.utls ? rec(tls.utls)?.fingerprint : tls.fingerprint),
		publicKey: str(reality.public_key),
		shortId: str(reality.short_id),
		allowInsecure: tls.insecure === true,
		source: "singbox",
		raw
	});
	if (cfg.publicKey) cfg.tls = "reality";
	return cfg;
}
function collectFromJson(data, raw) {
	const out = [];
	if (Array.isArray(data)) {
		for (const item of data) {
			const r = rec(item);
			if (!r) continue;
			if (r.protocol && r.settings) {
				const x = fromXrayOutbound(r, raw);
				if (x) out.push(x);
				continue;
			}
			if (r.type && r.server) {
				const s = fromSingbox(r, raw) ?? fromGenericObject(r, raw, "clash");
				out.push(s);
				continue;
			}
			out.push(fromGenericObject(r, raw, looksNapsternet(r) ? "napsternet" : "xray-json"));
		}
		return out;
	}
	const obj = rec(data);
	if (!obj) return out;
	if (Array.isArray(obj.outbounds)) {
		const isSing = obj.outbounds.some((o) => rec(o)?.server && rec(o)?.type);
		for (const ob of obj.outbounds) {
			const r = rec(ob);
			if (!r) continue;
			const parsed = isSing ? fromSingbox(r, raw) : fromXrayOutbound(r, raw);
			if (parsed) out.push(parsed);
		}
		if (out.length) return out;
	}
	if (Array.isArray(obj.proxies)) {
		for (const p of obj.proxies) {
			const r = rec(p);
			if (r) out.push(fromGenericObject(r, raw, "clash"));
		}
		if (out.length) return out;
	}
	if (Array.isArray(obj.servers)) {
		for (const p of obj.servers) {
			const r = rec(p);
			if (r) out.push(fromGenericObject(r, raw, looksNapsternet(r) ? "napsternet" : "xray-json"));
		}
		if (out.length) return out;
	}
	const nested = rec(obj.config) ?? rec(obj.vpnConfig) ?? rec(obj.data);
	if (nested) {
		const inner = collectFromJson(nested, raw);
		if (inner.length) return inner;
	}
	if (obj.vmess || obj.vless || obj.trojan) {
		for (const key of [
			"vmess",
			"vless",
			"trojan",
			"ss"
		]) {
			const arr = obj[key];
			if (Array.isArray(arr)) for (const item of arr) {
				const r = rec(item);
				if (r) {
					r.protocol = r.protocol ?? key;
					out.push(fromGenericObject(r, raw, "napsternet"));
				}
			}
		}
		if (out.length) return out;
	}
	out.push(fromGenericObject(obj, raw, looksNapsternet(obj) ? "napsternet" : "xray-json"));
	return out;
}
function parseClashYaml(text) {
	const out = [];
	const lines = text.replace(/\t/g, "  ").split(/\r?\n/);
	let inProxies = false;
	let current = null;
	const stack = [];
	const flush = () => {
		if (current && (current.server || current.add || current.name || current.type)) out.push(fromGenericObject(current, text, "clash"));
		current = null;
		stack.length = 0;
	};
	const indentOf = (line) => line.match(/^ */)?.[0].length ?? 0;
	for (const line of lines) {
		if (!line.trim() || /^\s*#/.test(line)) continue;
		if (/^\s*proxies\s*:/.test(line)) {
			inProxies = true;
			continue;
		}
		const indent = indentOf(line);
		if (inProxies && indent === 0 && !line.trim().startsWith("-")) {
			flush();
			inProxies = false;
			continue;
		}
		if (!inProxies) continue;
		const trimmed = line.trim();
		if (trimmed.startsWith("-")) {
			const rest = trimmed.replace(/^-\s*/, "");
			const topIndent = stack[0]?.indent ?? indent;
			if (!current || indent <= topIndent) {
				flush();
				current = {};
				stack.push({
					indent,
					obj: current
				});
				if (rest.startsWith("{")) try {
					const jsonish = rest.replace(/([A-Za-z0-9_-]+)\s*:/g, "\"$1\":").replace(/'/g, "\"");
					const obj = rec(JSON.parse(jsonish));
					if (obj) {
						current = obj;
						stack[0] = {
							indent,
							obj: current
						};
					}
				} catch {
					parseYamlPair(current, rest);
				}
				else if (rest) parseYamlPair(current, rest);
			}
			continue;
		}
		const m = trimmed.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
		if (!m || !current) continue;
		const key = m[1];
		const rawVal = m[2];
		while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
		const parent = stack[stack.length - 1]?.obj ?? current;
		if (rawVal === "" || rawVal === "|" || rawVal === ">") {
			const child = {};
			parent[key] = child;
			stack.push({
				indent,
				obj: child
			});
		} else parseYamlPair(parent, `${key}: ${rawVal}`);
	}
	flush();
	return out;
}
function parseYamlPair(obj, line) {
	const m = line.match(/^\s*(?:-\s+)?([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
	if (!m) return;
	let val = m[2].trim();
	if (val === "true") val = true;
	else if (val === "false") val = false;
	else if (typeof val === "string" && /^".*"$/.test(val)) val = val.slice(1, -1);
	else if (typeof val === "string" && /^'.*'$/.test(val)) val = val.slice(1, -1);
	obj[m[1]] = val;
}
function parseInput(text) {
	const trimmed = text.trim();
	if (!trimmed) return [];
	const collected = [];
	const seen = /* @__PURE__ */ new Set();
	const add = (cfg) => {
		if (!cfg || !cfg.address) return;
		const key = `${cfg.protocol}|${cfg.address}|${cfg.port}|${cfg.uuid}|${cfg.password}|${cfg.path}|${cfg.sni}`;
		if (seen.has(key)) return;
		seen.add(key);
		if (!cfg.remark) cfg.remark = `${cfg.protocol} ${cfg.address}`;
		collected.push(cfg);
	};
	const tryJson = (s) => {
		try {
			collectFromJson(JSON.parse(s), s).forEach(add);
			return collected.length > 0;
		} catch {
			return false;
		}
	};
	if (tryJson(trimmed)) return collected;
	const b64 = decodeB64(trimmed.replace(/\s+/g, ""));
	if (b64 && b64 !== trimmed) {
		if (tryJson(b64)) return collected;
		const inner = parseInput(b64);
		if (inner.length) return inner;
	}
	if (/^\s*proxies\s*:/m.test(trimmed) || /^\s*port\s*:/m.test(trimmed)) {
		parseClashYaml(trimmed).forEach(add);
		if (collected.length) return collected;
	}
	const lines = trimmed.split(/\r?\n/);
	for (const line of lines) {
		const t = line.trim();
		if (!t || t.startsWith("#") || t.startsWith("//")) continue;
		if (t.startsWith("{") || t.startsWith("[")) {
			tryJson(t);
			continue;
		}
		add(parseUri(t));
	}
	if (!collected.length && trimmed.includes("://")) {
		const matches = trimmed.match(/[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s]+/g) ?? [];
		for (const m of matches) add(parseUri(m));
	}
	return collected;
}
function protocolLabel(p) {
	return {
		vless: "VLESS",
		vmess: "VMess",
		trojan: "Trojan",
		ss: "Shadowsocks",
		ssr: "ShadowsocksR",
		hysteria2: "Hysteria2",
		hysteria: "Hysteria",
		tuic: "TUIC",
		wireguard: "WireGuard",
		socks: "SOCKS",
		http: "HTTP",
		anytls: "AnyTLS",
		unknown: "نامشخص"
	}[p] ?? p;
}
function sourceLabel(s) {
	return {
		uri: "لینک استاندارد",
		"xray-json": "Xray JSON",
		napsternet: "NapsternetV",
		clash: "Clash",
		singbox: "sing-box",
		subscription: "سابسکریپشن"
	}[s];
}
function typeLabel(cfg) {
	return [
		protocolLabel(cfg.protocol),
		cfg.network && cfg.network !== "tcp" ? cfg.network.toUpperCase() : "",
		cfg.tls === "reality" ? "Reality" : cfg.tls === "tls" ? "TLS" : cfg.tls === "xtls" ? "XTLS" : ""
	].filter(Boolean).join(" · ");
}
function sample(partial) {
	const cfg = emptyConfig(partial);
	cfg.raw = toUri(cfg);
	return cfg;
}
function sampleConfigs() {
	const vless = sample({
		id: "sample-vless-reality",
		remark: "نمونه · VLESS Reality",
		protocol: "vless",
		address: "1.1.1.1",
		port: 443,
		uuid: "11111111-2222-4333-8444-555555555555",
		encryption: "none",
		flow: "xtls-rprx-vision",
		network: "tcp",
		tls: "reality",
		sni: "www.microsoft.com",
		fingerprint: "chrome",
		publicKey: "YlKezM8V6cK0bYqK8oF9v3n1pQ2rS3tU4vW5xY6zA7B",
		shortId: "a1b2c3d4",
		spiderX: "/",
		source: "uri"
	});
	const trojan = sample({
		id: "sample-trojan-tls",
		remark: "نمونه · Trojan TLS",
		protocol: "trojan",
		address: "8.8.8.8",
		port: 443,
		password: "demo-trojan-pass",
		network: "ws",
		path: "/trojan",
		host: "www.cloudflare.com",
		tls: "tls",
		sni: "www.cloudflare.com",
		fingerprint: "chrome",
		alpn: "h2,http/1.1",
		source: "uri"
	});
	const hy2 = sample({
		id: "sample-hysteria2",
		remark: "نمونه · Hysteria2",
		protocol: "hysteria2",
		address: "9.9.9.9",
		port: 443,
		password: "hy2-demo",
		tls: "tls",
		sni: "www.google.com",
		source: "uri"
	});
	const ss = sample({
		id: "sample-ss",
		remark: "نمونه · Shadowsocks",
		protocol: "ss",
		address: "1.0.0.1",
		port: 443,
		method: "chacha20-ietf-poly1305",
		password: "ss-demo-key",
		source: "uri"
	});
	const iran = sample({
		id: "sample-vmess-ws",
		remark: "نمونه · آلمان · VMess WS",
		protocol: "vmess",
		address: "178.22.122.100",
		port: 443,
		uuid: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
		alterId: 0,
		method: "auto",
		network: "ws",
		path: "/ray",
		host: "www.example.com",
		tls: "tls",
		sni: "www.example.com",
		fingerprint: "chrome",
		source: "uri"
	});
	const npv = emptyConfig({
		id: "sample-napsternet",
		remark: "نمونه · NapsternetV",
		protocol: "vless",
		address: "8.8.4.4",
		port: 443,
		uuid: "99999999-aaaa-4bbb-8ccc-dddddddddddd",
		encryption: "none",
		network: "grpc",
		serviceName: "gun",
		tls: "tls",
		sni: "www.gstatic.com",
		fingerprint: "safari",
		alpn: "h2",
		source: "napsternet"
	});
	npv.raw = JSON.stringify({
		v: "2",
		ps: npv.remark,
		add: npv.address,
		port: String(npv.port),
		id: npv.uuid,
		net: "grpc",
		tls: "tls",
		sni: npv.sni,
		fp: npv.fingerprint,
		protocol: "vless",
		configType: "vless",
		coreType: "xray",
		serviceName: "gun"
	}, null, 2);
	const invalid = sample({
		id: "sample-invalid",
		remark: "نمونه · ناقص",
		protocol: "vless",
		address: "example.invalid",
		port: 443,
		uuid: "",
		tls: "reality",
		sni: "www.microsoft.com",
		source: "uri"
	});
	return [
		vless,
		trojan,
		hy2,
		ss,
		iran,
		npv,
		sample({
			id: "sample-http-iran",
			remark: "نمونه · ایران · HTTP",
			protocol: "http",
			address: "example.ir",
			port: 80,
			source: "uri"
		}),
		invalid
	];
}
function withHealth(config, probe) {
	return {
		config,
		probe,
		health: diagnose(config, probe).status,
		testedAt: probe ? Date.now() : void 0
	};
}
var INITIAL_ENTRIES = sampleConfigs().map((c) => withHealth(c));
var useAppStore = create()(persist((set, get) => ({
	hydrated: true,
	entries: INITIAL_ENTRIES,
	selectedId: INITIAL_ENTRIES[0]?.config.id ?? null,
	activeId: null,
	settings: DEFAULT_SETTINGS,
	query: "",
	protocolFilter: "all",
	healthFilter: "all",
	sortMode: "default",
	setHydrated: (v) => set({ hydrated: v }),
	select: (id) => set({ selectedId: id }),
	setQuery: (query) => set({ query }),
	setProtocolFilter: (protocolFilter) => set({ protocolFilter }),
	setHealthFilter: (healthFilter) => set({ healthFilter }),
	setSortMode: (sortMode) => set({ sortMode }),
	addConfigs: (configs) => {
		const existing = new Set(get().entries.map((e) => `${e.config.protocol}|${e.config.address}|${e.config.port}|${e.config.uuid}|${e.config.password}`));
		const fresh = [];
		for (const c of configs) {
			const key = `${c.protocol}|${c.address}|${c.port}|${c.uuid}|${c.password}`;
			if (existing.has(key)) continue;
			existing.add(key);
			fresh.push(withHealth(c));
		}
		if (!fresh.length) return 0;
		set((s) => ({
			entries: [...fresh, ...s.entries],
			selectedId: fresh[0].config.id
		}));
		return fresh.length;
	},
	addBlank: () => {
		const cfg = emptyConfig({
			remark: "کانفیگ جدید",
			source: "uri"
		});
		set((s) => ({
			entries: [withHealth(cfg), ...s.entries],
			selectedId: cfg.id
		}));
		return cfg.id;
	},
	duplicate: (id) => {
		const src = get().entries.find((e) => e.config.id === id);
		if (!src) return null;
		const copy = {
			...src.config,
			id: crypto.randomUUID(),
			extra: { ...src.config.extra },
			remark: `${src.config.remark || src.config.address} (کپی)`
		};
		set((s) => ({
			entries: [withHealth(copy), ...s.entries],
			selectedId: copy.id
		}));
		return copy.id;
	},
	updateConfig: (id, patch) => set((s) => ({ entries: s.entries.map((e) => e.config.id === id ? withHealth({
		...e.config,
		...patch
	}, e.probe) : e) })),
	remove: (id) => set((s) => ({
		entries: s.entries.filter((e) => e.config.id !== id),
		selectedId: s.selectedId === id ? null : s.selectedId,
		activeId: s.activeId === id ? null : s.activeId
	})),
	clear: () => set({
		entries: [],
		selectedId: null,
		activeId: null
	}),
	setProbe: (id, probe) => set((s) => ({ entries: s.entries.map((e) => e.config.id === id ? withHealth(e.config, probe) : e) })),
	setActive: (id) => set({
		activeId: id,
		selectedId: id ?? get().selectedId
	}),
	updateSettings: (patch) => set((s) => ({ settings: {
		...s.settings,
		...patch
	} })),
	loadSamples: () => set({
		entries: sampleConfigs().map((c) => withHealth(c)),
		selectedId: null,
		activeId: null
	})
}), {
	name: "polaris-client",
	partialize: (s) => ({
		entries: s.entries,
		selectedId: s.selectedId,
		activeId: s.activeId,
		settings: s.settings
	}),
	merge: (persisted, current) => {
		const p = persisted ?? {};
		return {
			...current,
			...p,
			settings: {
				...DEFAULT_SETTINGS,
				...p.settings
			},
			entries: Array.isArray(p.entries) ? p.entries : current.entries
		};
	},
	onRehydrateStorage: () => (state) => {
		state?.setHydrated(true);
	}
}));
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium text-muted",
			children: label
		}), children]
	});
}
function Select({ value, onChange, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: "h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg",
		value,
		onChange: (e) => onChange(e.target.value),
		children
	});
}
function ConfigDetail({ entry, testing, onTest, onBack }) {
	const updateConfig = useAppStore((s) => s.updateConfig);
	const remove = useAppStore((s) => s.remove);
	const setActive = useAppStore((s) => s.setActive);
	const duplicate = useAppStore((s) => s.duplicate);
	const settings = useAppStore((s) => s.settings);
	const activeId = useAppStore((s) => s.activeId);
	const [tab, setTab] = (0, import_react.useState)("summary");
	const { config, probe } = entry;
	const report = (0, import_react.useMemo)(() => analyzeSecurity(config), [config]);
	const diag = (0, import_react.useMemo)(() => diagnose(config, probe), [config, probe]);
	const isActive = activeId === config.id;
	const tone = delayTone(probe?.delayMs ?? null);
	function patch(key, value) {
		updateConfig(config.id, { [key]: value });
	}
	async function copy(text, ok) {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(ok);
		} catch {
			toast.error("کپی نشد");
		}
	}
	function download(filename, text) {
		const blob = new Blob([text], { type: "application/json;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
		toast.success("فایل ذخیره شد");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-border px-4 py-4",
				children: [
					onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onBack,
						className: "mb-3 text-sm text-muted hover:text-fg md:hidden",
						children: "بازگشت به لیست"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "truncate text-lg font-semibold text-fg",
								children: config.remark || "بدون نام"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-xs text-muted",
								dir: "ltr",
								children: [
									config.address,
									":",
									config.port
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthBadge, { status: diag.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecurityBadge, {
								level: report.level,
								label: report.label
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => {
									if (isActive) {
										setActive(null);
										return;
									}
									if (diag.status === "broken" || diag.status === "invalid") toast.error(diag.title);
									setActive(config.id);
									toast.message("فقط انتخاب شد — این اپ تونل ویندوز نمی‌سازد. JSON را در v2rayN واقعی وارد کنید.");
									if (!probe) onTest();
								},
								disabled: diag.status === "invalid",
								children: [isActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unplug, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {}), isActive ? "قطع انتخاب" : "انتخاب برای خروجی"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: onTest,
								disabled: testing,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {}), testing ? "در حال تست…" : "تست دیلی"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => copy(toUri(config), "لینک کپی شد"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "کپی لینک"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => {
									duplicate(config.id);
									toast.success("کپی ساخته شد");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Files, {}), "کپی"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "danger",
								onClick: () => {
									remove(config.id);
									toast.message("حذف شد");
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "حذف"]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 border-b border-border px-4",
				children: [
					["summary", "خلاصه"],
					["edit", "فیلدها"],
					["export", "خروجی"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: cn("h-11 px-3 text-sm transition-colors", tab === id ? "border-b-2 border-accent text-fg" : "text-muted hover:text-fg"),
					children: label
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto p-4",
				children: [
					tab === "summary" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("rounded-lg border p-4", diag.status === "broken" || diag.status === "invalid" ? "border-bad/40 bg-bad/10" : diag.status === "warn" || diag.status === "dead" ? "border-warn/40 bg-warn/10" : diag.status === "ok" ? "border-ok/30 bg-ok/10" : "border-border bg-surface"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-fg",
									children: diag.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm leading-relaxed text-muted",
									children: diag.detail
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
										label: "نوع",
										value: typeLabel(config)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
										label: "منبع",
										value: config.group ? `${sourceLabel(config.source)} · ${config.group}` : sourceLabel(config.source)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
										label: "دیلی",
										value: probe?.delayMs != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("font-mono tabular-nums", tone === "ok" && "text-ok", tone === "warn" && "text-warn", tone === "bad" && "text-bad"),
											children: [probe.delayMs, " ms"]
										}) : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
										label: "مکان",
										value: probe?.countryCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Earth, { className: "size-3.5" }),
												countryName(probe.countryCode),
												probe.city ? ` — ${probe.city}` : ""
											]
										}) : "نامشخص"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
										label: "IP",
										value: probe?.ip ?? "—",
										mono: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
										label: "ISP",
										value: probe?.isp || probe?.org || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
										label: "شبکه",
										value: config.network.toUpperCase()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
										label: "امنیت لایه",
										value: config.tls === "none" ? "خاموش" : config.tls.toUpperCase()
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "rounded-lg border border-border bg-surface p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "mb-2 flex items-center gap-2 text-sm font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4 text-muted" }), "گزارش امنیت"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "grid gap-1.5 text-sm text-muted",
									children: report.reasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "leading-relaxed",
										children: r
									}, r))
								})]
							})
						]
					}) : null,
					tab === "edit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "نام",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: config.remark,
									onChange: (e) => patch("remark", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "پروتکل",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: config.protocol,
										onChange: (v) => patch("protocol", v),
										children: PROTOCOLS.filter((p) => p !== "unknown").map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: p,
											children: protocolLabel(p)
										}, p))
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "شبکه (Transport)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
										value: config.network,
										onChange: (v) => patch("network", v),
										children: NETWORKS.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: n,
											children: n
										}, n))
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-[1fr_7rem]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "آدرس",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.address,
										onChange: (e) => patch("address", e.target.value)
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "پورت",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono",
										type: "number",
										value: config.port,
										onChange: (e) => patch("port", Number(e.target.value))
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "UUID",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									dir: "ltr",
									className: "font-mono text-xs",
									value: config.uuid,
									onChange: (e) => patch("uuid", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "رمز / Password",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									dir: "ltr",
									className: "font-mono text-xs",
									value: config.password,
									onChange: (e) => patch("password", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Encryption / Method",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.method || config.encryption,
										onChange: (e) => {
											patch("method", e.target.value);
											patch("encryption", e.target.value);
										}
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Flow",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.flow,
										onChange: (e) => patch("flow", e.target.value),
										placeholder: "xtls-rprx-vision"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "AlterID",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										type: "number",
										value: config.alterId,
										onChange: (e) => patch("alterId", Number(e.target.value))
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Header Type",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										value: config.headerType,
										onChange: (e) => patch("headerType", e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "TLS / Reality",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: config.tls,
										onChange: (v) => patch("tls", v),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "none",
												children: "none"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "tls",
												children: "tls"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "reality",
												children: "reality"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "xtls",
												children: "xtls"
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Fingerprint",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										value: config.fingerprint,
										onChange: (e) => patch("fingerprint", e.target.value),
										placeholder: "chrome"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "SNI",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.sni,
										onChange: (e) => patch("sni", e.target.value)
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "ALPN",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.alpn,
										onChange: (e) => patch("alpn", e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Host / Header",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.host,
										onChange: (e) => patch("host", e.target.value)
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Path",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.path,
										onChange: (e) => patch("path", e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "gRPC ServiceName",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.serviceName,
										onChange: (e) => patch("serviceName", e.target.value)
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "gRPC Mode",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										value: config.grpcMode,
										onChange: (e) => patch("grpcMode", e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Reality Public Key (pbk)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									dir: "ltr",
									className: "font-mono text-xs",
									value: config.publicKey,
									onChange: (e) => patch("publicKey", e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Short ID (sid)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.shortId,
										onChange: (e) => patch("shortId", e.target.value)
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "SpiderX",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.spiderX,
										onChange: (e) => patch("spiderX", e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between rounded-md border border-border bg-surface px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: "AllowInsecure"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: config.allowInsecure,
									onChange: (e) => patch("allowInsecure", e.target.checked),
									className: "size-4"
								})]
							}),
							config.protocol === "hysteria2" || config.protocol === "hysteria" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Obfs",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.extra.obfs ?? "",
										onChange: (e) => patch("extra", {
											...config.extra,
											obfs: e.target.value
										}),
										placeholder: "salamander"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Obfs Password",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.extra["obfs-password"] ?? "",
										onChange: (e) => patch("extra", {
											...config.extra,
											"obfs-password": e.target.value
										})
									})
								})]
							}) : null,
							config.protocol === "tuic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Congestion Control",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									dir: "ltr",
									className: "font-mono text-xs",
									value: config.extra.congestion ?? "",
									onChange: (e) => patch("extra", {
										...config.extra,
										congestion: e.target.value
									}),
									placeholder: "bbr"
								})
							}) : null,
							config.protocol === "wireguard" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Peer Public Key",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											dir: "ltr",
											className: "font-mono text-xs",
											value: config.extra.peerPublicKey ?? config.publicKey,
											onChange: (e) => patch("extra", {
												...config.extra,
												peerPublicKey: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "MTU",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											dir: "ltr",
											className: "font-mono text-xs",
											value: config.extra.mtu ?? "",
											onChange: (e) => patch("extra", {
												...config.extra,
												mtu: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Local Address",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											dir: "ltr",
											className: "font-mono text-xs",
											value: config.extra.localAddress ?? "",
											onChange: (e) => patch("extra", {
												...config.extra,
												localAddress: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Reserved",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											dir: "ltr",
											className: "font-mono text-xs",
											value: config.extra.reserved ?? "",
											onChange: (e) => patch("extra", {
												...config.extra,
												reserved: e.target.value
											})
										})
									})
								]
							}) : null,
							config.network === "kcp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "KCP MTU",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											dir: "ltr",
											className: "font-mono text-xs",
											value: config.extra.kcpMtu ?? "",
											onChange: (e) => patch("extra", {
												...config.extra,
												kcpMtu: e.target.value
											}),
											placeholder: "1350"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "KCP TTI",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											dir: "ltr",
											className: "font-mono text-xs",
											value: config.extra.kcpTti ?? "",
											onChange: (e) => patch("extra", {
												...config.extra,
												kcpTti: e.target.value
											}),
											placeholder: "50"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Uplink Capacity",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											dir: "ltr",
											className: "font-mono text-xs",
											value: config.extra.uplinkCapacity ?? "",
											onChange: (e) => patch("extra", {
												...config.extra,
												uplinkCapacity: e.target.value
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Downlink Capacity",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											dir: "ltr",
											className: "font-mono text-xs",
											value: config.extra.downlinkCapacity ?? "",
											onChange: (e) => patch("extra", {
												...config.extra,
												downlinkCapacity: e.target.value
											})
										})
									})
								]
							}) : null,
							config.network === "xhttp" || config.network === "splithttp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "XHTTP Mode",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.extra.xhttpMode ?? config.extra.mode ?? "",
										onChange: (e) => patch("extra", {
											...config.extra,
											xhttpMode: e.target.value
										}),
										placeholder: "auto / packet-up / stream-up"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "XHTTP Extra",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.extra.xhttpExtra ?? "",
										onChange: (e) => patch("extra", {
											...config.extra,
											xhttpExtra: e.target.value
										})
									})
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Packet Encoding",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.extra.packetEncoding ?? "",
										onChange: (e) => patch("extra", {
											...config.extra,
											packetEncoding: e.target.value
										}),
										placeholder: "xudp"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "KCP Seed",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										dir: "ltr",
										className: "font-mono text-xs",
										value: config.extra.seed ?? "",
										onChange: (e) => patch("extra", {
											...config.extra,
											seed: e.target.value
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExtraEditor, {
								extra: config.extra,
								onChange: (extra) => patch("extra", extra)
							})
						]
					}) : null,
					tab === "export" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportBlock, {
								title: "لینک اشتراک",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4" }),
								value: toUri(config),
								onCopy: () => copy(toUri(config), "لینک کپی شد")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportBlock, {
								title: "NapsternetV JSON",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }),
								value: toNapsternet(config),
								onCopy: () => copy(toNapsternet(config), "JSON نپسترنت کپی شد")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportBlock, {
								title: "Xray outbound",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }),
								value: toXrayOutbound(config),
								onCopy: () => copy(toXrayOutbound(config), "Xray JSON کپی شد")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportBlock, {
								title: "Clash proxy",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }),
								value: toClash(config),
								onCopy: () => copy(toClash(config), "Clash JSON کپی شد")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportBlock, {
								title: "sing-box outbound",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }),
								value: toSingbox(config),
								onCopy: () => copy(toSingbox(config), "sing-box JSON کپی شد")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportBlock, {
								title: "پیکربندی کامل کلاینت (با تنظیمات)",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }),
								value: toFullClientConfig(config, settings),
								onCopy: () => copy(toFullClientConfig(config, settings), "config.json کپی شد")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => download(`${(config.remark || config.protocol).replace(/[^\w\u0600-\u06FF-]+/g, "_")}.json`, toFullClientConfig(config, settings)),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "دانلود config.json"]
							})
						]
					}) : null
				]
			})
		]
	});
}
function ExtraEditor({ extra, onChange }) {
	const entries = Object.entries(extra);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-2 rounded-lg border border-border bg-surface p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium",
				children: "پارامترهای اضافه"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => onChange({
					...extra,
					[`key${entries.length + 1}`]: ""
				}),
				children: "افزودن"
			})]
		}), entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: "پارامتر اضافه‌ای نیست. از کوئری لینک پر می‌شود."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2",
			children: entries.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[7rem_1fr_auto] gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						dir: "ltr",
						className: "font-mono text-xs",
						value: k,
						onChange: (e) => {
							const next = { ...extra };
							delete next[k];
							next[e.target.value] = v;
							onChange(next);
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						dir: "ltr",
						className: "font-mono text-xs",
						value: v,
						onChange: (e) => onChange({
							...extra,
							[k]: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "حذف پارامتر",
						onClick: () => {
							const next = { ...extra };
							delete next[k];
							onChange(next);
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
					})
				]
			}, k))
		})]
	});
}
function Info({ label, value, mono }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: cn("mt-1 text-sm text-fg", mono && "font-mono text-xs"),
			dir: mono ? "ltr" : void 0,
			children: value
		})]
	});
}
function ExportBlock({ title, icon, value, onCopy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg border border-border bg-surface p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				className: "flex items-center gap-2 text-sm font-medium",
				children: [icon, title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: onCopy,
				children: "کپی"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			dir: "ltr",
			readOnly: true,
			value,
			className: "min-h-32 text-xs"
		})]
	});
}
var HEALTH_FILTERS = [
	{
		id: "all",
		label: "همه"
	},
	{
		id: "broken",
		label: "مشکل‌دار"
	},
	{
		id: "ok",
		label: "سالم"
	},
	{
		id: "untested",
		label: "تست‌نشده"
	},
	{
		id: "dead",
		label: "بدون پاسخ"
	}
];
function ConfigList({ testingId, onTest, onSelect }) {
	const entries = useAppStore((s) => s.entries);
	const selectedId = useAppStore((s) => s.selectedId);
	const activeId = useAppStore((s) => s.activeId);
	const query = useAppStore((s) => s.query);
	const protocolFilter = useAppStore((s) => s.protocolFilter);
	const healthFilter = useAppStore((s) => s.healthFilter);
	const sortMode = useAppStore((s) => s.sortMode);
	const select = useAppStore((s) => s.select);
	const setQuery = useAppStore((s) => s.setQuery);
	const setProtocolFilter = useAppStore((s) => s.setProtocolFilter);
	const setHealthFilter = useAppStore((s) => s.setHealthFilter);
	const setSortMode = useAppStore((s) => s.setSortMode);
	const filtered = entries.filter((e) => {
		if (protocolFilter !== "all" && e.config.protocol !== protocolFilter) return false;
		const health = diagnose(e.config, e.probe).status;
		if (healthFilter === "broken" && health !== "broken" && health !== "invalid") return false;
		if (healthFilter === "ok" && health !== "ok") return false;
		if (healthFilter === "untested" && health !== "unknown") return false;
		if (healthFilter === "dead" && health !== "dead") return false;
		const q = query.trim().toLowerCase();
		if (!q) return true;
		const c = e.config;
		return `${c.remark} ${c.address} ${c.protocol} ${c.sni} ${c.network} ${typeLabel(c)} ${sourceLabel(c.source)}`.toLowerCase().includes(q);
	}).slice().sort((a, b) => {
		if (sortMode === "delay") return (a.probe?.delayMs ?? Number.POSITIVE_INFINITY) - (b.probe?.delayMs ?? Number.POSITIVE_INFINITY);
		if (sortMode === "name") return (a.config.remark || a.config.address).localeCompare(b.config.remark || b.config.address, "fa");
		return 0;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2 p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "جستجو در نام، آدرس، پروتکل…",
						className: "pr-10"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg",
						value: protocolFilter,
						onChange: (e) => setProtocolFilter(e.target.value),
						"aria-label": "فیلتر پروتکل",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "همه پروتکل‌ها"
						}), PROTOCOLS.filter((p) => p !== "unknown").map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p,
							children: protocolLabel(p)
						}, p))]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg",
						value: sortMode,
						onChange: (e) => setSortMode(e.target.value),
						"aria-label": "مرتب‌سازی",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "default",
								children: "ترتیب ورود"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "delay",
								children: "دیلی (کم به زیاد)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "name",
								children: "نام"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: HEALTH_FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setHealthFilter(f.id),
						className: cn("h-9 rounded-full border px-3 text-xs transition-colors", healthFilter === f.id ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface text-muted hover:text-fg"),
						children: f.label
					}, f.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-y-auto px-2 pb-3",
			children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-8 text-center text-sm text-muted",
				children: "کانفیگی مطابق فیلتر نیست."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-1",
				children: filtered.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfigRow, {
					entry: e,
					selected: e.config.id === selectedId,
					active: e.config.id === activeId,
					testing: testingId === e.config.id,
					onSelect: () => {
						if (onSelect) onSelect(e.config.id);
						else select(e.config.id);
					},
					onTest: onTest ? () => onTest(e.config.id) : void 0
				}) }, e.config.id))
			})
		})]
	});
}
function ConfigRow({ entry, selected, active, testing, onSelect, onTest }) {
	const { config, probe } = entry;
	const health = diagnose(config, probe).status;
	const tone = delayTone(probe?.delayMs ?? null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex w-full items-stretch rounded-md border transition-colors duration-150", selected ? "border-accent/40 bg-surface-2" : "border-transparent bg-transparent hover:bg-surface-2"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onSelect,
			className: "min-w-0 flex-1 px-3 py-3 text-right",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium text-fg",
							children: config.remark || config.address
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 truncate text-xs text-muted",
							children: typeLabel(config)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 truncate font-mono text-xs text-subtle",
							dir: "ltr",
							children: [
								config.address,
								":",
								config.port
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-col items-end gap-1",
					children: [active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-ok/15 px-2 py-0.5 text-xs text-ok",
						children: "فعال"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthBadge, { status: health }), testing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }), "تست"]
					}) : probe?.delayMs != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("font-mono text-xs tabular-nums", tone === "ok" && "text-ok", tone === "warn" && "text-warn", tone === "bad" && "text-bad"),
						children: [probe.delayMs, " ms"]
					}) : null]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex flex-wrap items-center gap-2 text-xs text-subtle",
				children: [config.source === "napsternet" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full border border-border px-2 py-0.5",
					children: sourceLabel(config.source)
				}) : null, probe?.countryCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [countryName(probe.countryCode), probe.city ? ` — ${probe.city}` : ""] }) : null]
			})]
		}), onTest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "تست دیلی",
			disabled: testing,
			onClick: (e) => {
				e.stopPropagation();
				onTest();
			},
			className: "grid w-11 shrink-0 place-items-center border-r border-border text-muted hover:text-fg disabled:opacity-40",
			children: testing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "size-4" })
		}) : null]
	});
}
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
function DialogContent({ className, children, title, description, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed left-1/2 top-1/2 z-50 w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2", "rounded-xl border border-border bg-surface p-5 shadow-xl", "max-h-[min(90dvh,44rem)] overflow-y-auto", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "text-lg font-semibold text-fg",
				children: title
			}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
				className: "mt-1 text-sm text-muted",
				children: description
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
				className: "sr-only",
				children: title
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "بستن",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})
			})]
		}), children]
	})] });
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var probeHost = createServerFn({ method: "POST" }).validator((d) => {
	if (!d || typeof d.host !== "string") throw new Error("host");
	const port = Number(d.port);
	if (!Number.isFinite(port)) throw new Error("port");
	return {
		host: d.host.slice(0, 253),
		port
	};
}).handler(createSsrRpc("eca45b1c9bff7623ddd5b3aa222446424ec0cb75ae5c9b1513dce81b839530c7"));
var fetchSubscription = createServerFn({ method: "POST" }).validator((d) => {
	if (!d || typeof d.url !== "string") throw new Error("url");
	return { url: d.url.slice(0, 2e3) };
}).handler(createSsrRpc("15423f72a9ed5c84bc0543616804475c209db796a218ff07194ded8074999301"));
function ImportDialog() {
	const addConfigs = useAppStore((s) => s.addConfigs);
	const addBlank = useAppStore((s) => s.addBlank);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [text, setText] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	async function importText(raw) {
		const parsed = parseInput(raw);
		if (!parsed.length) {
			toast.error("هیچ کانفیگ معتبری پیدا نشد");
			return;
		}
		const n = addConfigs(parsed);
		if (!n) {
			toast.message("این کانفیگ‌ها از قبل در لیست هستند");
			return;
		}
		toast.success(`${n} کانفیگ اضافه شد`);
		setText("");
		setOpen(false);
	}
	async function importUrl() {
		if (!url.trim()) return;
		setBusy(true);
		try {
			const { text: body } = await fetchSubscription({ data: { url: url.trim() } });
			const parsed = parseInput(body);
			if (!parsed.length) {
				toast.error("هیچ کانفیگ معتبری پیدا نشد");
				return;
			}
			let group = "";
			try {
				group = new URL(url.trim()).hostname;
			} catch {
				group = "subscription";
			}
			const tagged = parsed.map((c) => ({
				...c,
				source: "subscription",
				group: c.group || group
			}));
			const n = addConfigs(tagged);
			if (!n) {
				toast.message("این کانفیگ‌ها از قبل در لیست هستند");
				return;
			}
			toast.success(`${n} کانفیگ از سابسکریپشن اضافه شد`);
			setUrl("");
			setOpen(false);
		} catch {
			toast.error("دریافت سابسکریپشن ناموفق بود");
		} finally {
			setBusy(false);
		}
	}
	async function fromClipboard() {
		try {
			const clip = await navigator.clipboard.readText();
			if (!clip.trim()) {
				toast.error("کلیپ‌بورد خالی است");
				return;
			}
			setText(clip);
			await importText(clip);
		} catch {
			toast.error("دسترسی به کلیپ‌بورد ممکن نشد؛ متن را بچسبانید");
		}
	}
	function onFile(file) {
		const reader = new FileReader();
		reader.onload = () => {
			const raw = String(reader.result ?? "");
			setText(raw);
			importText(raw);
		};
		reader.readAsText(file);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePlus2, {}), "ورود کانفیگ"] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "ورود کانفیگ",
			description: "لینک VLESS / VMess / Trojan / SS / Hysteria2 / TUIC / WireGuard، جیسون Xray، Clash، sing-box یا NapsternetV را بچسبانید.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4",
				onDragOver: (e) => {
					e.preventDefault();
				},
				onDrop: (e) => {
					e.preventDefault();
					const file = e.dataTransfer.files[0];
					if (file) onFile(file);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						dir: "ltr",
						placeholder: "vless://...\nvmess://...\n{ \"ps\": \"npv\", \"add\": \"...\", \"configType\": \"vless\" }",
						value: text,
						onChange: (e) => setText(e.target.value),
						className: "min-h-48"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "flex-1",
								onClick: () => importText(text),
								disabled: !text.trim(),
								children: "افزودن"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: fromClipboard,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardPaste, {}), "کلیپ‌بورد"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									addBlank();
									setOpen(false);
									toast.message("کانفیگ خالی اضافه شد — فیلدها را پر کنید");
								},
								children: "دستی"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: ".txt,.json,.yaml,.yml,.npv,text/plain,application/json",
								className: "hidden",
								onChange: (e) => {
									const file = e.target.files?.[0];
									if (file) onFile(file);
									e.target.value = "";
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								className: "flex-1",
								onClick: () => fileRef.current?.click(),
								children: "انتخاب فایل"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => {
									setText("");
								},
								children: "پاک کردن"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 border-t border-border pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted",
							children: "سابسکریپشن (آدرس https)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								dir: "ltr",
								className: "font-mono text-xs",
								placeholder: "https://example.com/sub",
								value: url,
								onChange: (e) => setUrl(e.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: importUrl,
								disabled: busy || !url.trim(),
								children: busy ? "در حال دریافت…" : "دریافت"
							})]
						})]
					})
				]
			})
		})]
	});
}
function Toggle({ checked, onChange, label, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onChange(!checked),
		className: "flex w-full items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-3 text-right",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-sm font-medium text-fg",
			children: label
		}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 block text-xs text-muted",
			children: hint
		}) : null] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-surface-2"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-0.5 size-5 rounded-full bg-fg transition-transform ${checked ? "right-0.5" : "right-5"}` })
		})]
	});
}
function NumField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			dir: "ltr",
			type: "number",
			className: "font-mono",
			value,
			onChange: (e) => onChange(Number(e.target.value))
		})]
	});
}
function TextField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			dir: "ltr",
			className: "font-mono text-xs",
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
function SettingsSheet() {
	const settings = useAppStore((s) => s.settings);
	const update = useAppStore((s) => s.updateSettings);
	const entries = useAppStore((s) => s.entries);
	const clear = useAppStore((s) => s.clear);
	const loadSamples = useAppStore((s) => s.loadSamples);
	const set = (patch) => update(patch);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "secondary",
			size: "icon",
			"aria-label": "تنظیمات",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {})
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
		title: "تنظیمات هسته",
		description: "گزینه‌های رایج v2rayN / Xray. روی همین دستگاه ذخیره می‌شوند.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-fg",
							children: "ورودی محلی"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "پورت SOCKS",
								value: settings.socksPort,
								onChange: (n) => set({ socksPort: n })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "پورت HTTP",
								value: settings.httpPort,
								onChange: (n) => set({ httpPort: n })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.udp,
							onChange: (v) => set({ udp: v }),
							label: "UDP",
							hint: "برای تماس و گیم"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.sniffing,
							onChange: (v) => set({ sniffing: v }),
							label: "Sniffing",
							hint: "تشخیص دامنه از ترافیک"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.tunEnabled,
							onChange: (v) => set({ tunEnabled: v }),
							label: "TUN",
							hint: "فقط در فایل خروجی؛ این اپ خودش TUN ویندوز را روشن نمی‌کند"
						}),
						settings.tunEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.tunStrictRoute,
							onChange: (v) => set({ tunStrictRoute: v }),
							label: "Strict Route",
							hint: "همه ترافیک از تونل برود"
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-fg",
							children: "Mux"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.muxEnabled,
							onChange: (v) => set({ muxEnabled: v }),
							label: "فعال‌سازی Mux"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "Concurrency",
								value: settings.muxConcurrency,
								onChange: (n) => set({ muxConcurrency: n })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: settings.muxXudp,
								onChange: (v) => set({ muxXudp: v }),
								label: "XUDP"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-fg",
							children: "Fragment"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.fragmentEnabled,
							onChange: (v) => set({ fragmentEnabled: v }),
							label: "تکه کردن TLS Hello",
							hint: "برای عبور از فیلتر SNI"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Packets",
									value: settings.fragmentPackets,
									onChange: (v) => set({ fragmentPackets: v })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Length",
									value: settings.fragmentLength,
									onChange: (v) => set({ fragmentLength: v })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
									label: "Interval",
									value: settings.fragmentInterval,
									onChange: (v) => set({ fragmentInterval: v })
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-fg",
							children: "DNS و مسیریابی"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
								label: "DNS اصلی",
								value: settings.dnsPrimary,
								onChange: (v) => set({ dnsPrimary: v })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
								label: "DNS دوم",
								value: settings.dnsSecondary,
								onChange: (v) => set({ dnsSecondary: v })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, {
							label: "DoH",
							value: settings.dnsDoh,
							onChange: (v) => set({ dnsDoh: v })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.bypassLan,
							onChange: (v) => set({ bypassLan: v }),
							label: "دور زدن شبکه محلی"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.bypassIran,
							onChange: (v) => set({ bypassIran: v }),
							label: "سایت‌های ایران مستقیم"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.blockAds,
							onChange: (v) => set({ blockAds: v }),
							label: "مسدودسازی تبلیغات"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: Boolean(settings.fakeDns),
							onChange: (v) => set({ fakeDns: v }),
							label: "FakeDNS",
							hint: "برای دامنه‌هایی که DNSشان سانسور می‌شود"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium text-muted",
								children: "Domain Strategy"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg",
								value: settings.domainStrategy ?? "IPIfNonMatch",
								onChange: (e) => set({ domainStrategy: e.target.value }),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "AsIs",
										children: "AsIs"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "IPIfNonMatch",
										children: "IPIfNonMatch"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "IPOnDemand",
										children: "IPOnDemand"
									})
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold text-fg",
							children: "TLS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium text-muted",
								children: "Fingerprint پیش‌فرض"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg",
								value: settings.fingerprint,
								onChange: (e) => set({ fingerprint: e.target.value }),
								children: [
									"chrome",
									"firefox",
									"safari",
									"ios",
									"android",
									"edge",
									"random"
								].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: f,
									children: f
								}, f))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: settings.allowInsecure,
							onChange: (v) => set({ allowInsecure: v }),
							label: "AllowInsecure",
							hint: "غیرفعال کردن بررسی گواهی — توصیه نمی‌شود"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-medium text-muted",
									children: "هسته"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg",
									value: settings.core,
									onChange: (e) => set({ core: e.target.value }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "xray",
										children: "Xray"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "sing-box",
										children: "sing-box"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-medium text-muted",
									children: "لاگ"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg",
									value: settings.logLevel,
									onChange: (e) => set({ logLevel: e.target.value }),
									children: [
										"none",
										"warning",
										"info",
										"debug"
									].map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: l,
										children: l
									}, l))
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold text-fg",
						children: "لیست کانفیگ‌ها"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "flex-1",
								onClick: async () => {
									const text = toShareList(entries.map((e) => e.config));
									if (!text) {
										toast.error("لیست خالی است");
										return;
									}
									try {
										await navigator.clipboard.writeText(text);
										toast.success("همه لینک‌ها کپی شد");
									} catch {
										toast.error("کپی نشد");
									}
								},
								children: "کپی همه لینک‌ها"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "flex-1",
								onClick: async () => {
									const text = toShareListB64(entries.map((e) => e.config));
									if (!text) {
										toast.error("لیست خالی است");
										return;
									}
									try {
										await navigator.clipboard.writeText(text);
										toast.success("سابسکریپشن Base64 کپی شد");
									} catch {
										toast.error("کپی نشد");
									}
								},
								children: "کپی Base64"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									loadSamples();
									toast.message("نمونه‌ها بارگذاری شدند");
								},
								children: "نمونه‌ها"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								onClick: () => {
									clear();
									toast.message("لیست پاک شد");
								},
								children: "پاک کردن لیست"
							})
						]
					})]
				})
			]
		})
	})] });
}
function PolarisApp() {
	const entries = useAppStore((s) => s.entries);
	const selectedId = useAppStore((s) => s.selectedId);
	const activeId = useAppStore((s) => s.activeId);
	const select = useAppStore((s) => s.select);
	const setProbe = useAppStore((s) => s.setProbe);
	const loadSamples = useAppStore((s) => s.loadSamples);
	const [testingId, setTestingId] = (0, import_react.useState)(null);
	const [testingAll, setTestingAll] = (0, import_react.useState)(false);
	const [mobilePanel, setMobilePanel] = (0, import_react.useState)("list");
	const skipFirstSelect = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		const pick = () => {
			const s = useAppStore.getState();
			if (s.selectedId && s.entries.some((e) => e.config.id === s.selectedId)) return;
			const first = s.entries[0];
			if (first) s.select(first.config.id);
		};
		pick();
		const unsub = useAppStore.persist.onFinishHydration(pick);
		return () => {
			unsub();
		};
	}, []);
	const selected = (0, import_react.useMemo)(() => entries.find((e) => e.config.id === selectedId) ?? null, [entries, selectedId]);
	const active = (0, import_react.useMemo)(() => entries.find((e) => e.config.id === activeId) ?? null, [entries, activeId]);
	(0, import_react.useEffect)(() => {
		if (!selectedId) return;
		if (skipFirstSelect.current) {
			skipFirstSelect.current = false;
			return;
		}
		setMobilePanel("detail");
	}, [selectedId]);
	async function testOne(id) {
		const entry = useAppStore.getState().entries.find((e) => e.config.id === id);
		if (!entry) return;
		setTestingId(id);
		try {
			const probe = await probeHost({ data: {
				host: entry.config.address,
				port: entry.config.port
			} });
			setProbe(id, probe);
			if (isIranLocation(probe)) toast.error("کانفیگ مشکل‌دار: مکان عوض نمی‌شود (ایران)");
			else if (!probe.ok) toast.message(probe.country ? `پاسخ نداد · ${probe.country}` : "سرور پاسخ نداد");
			else {
				const loc = [probe.city, probe.country].filter(Boolean).join("، ");
				toast.success(`${probe.delayMs} ms${loc ? ` · ${loc}` : ""}`);
			}
		} catch {
			toast.error("تست دیلی ناموفق بود");
		} finally {
			setTestingId(null);
		}
	}
	async function testAll() {
		const list = useAppStore.getState().entries;
		if (!list.length) return;
		setTestingAll(true);
		for (const e of list) {
			setTestingId(e.config.id);
			try {
				const probe = await probeHost({ data: {
					host: e.config.address,
					port: e.config.port
				} });
				setProbe(e.config.id, probe);
			} catch {}
		}
		setTestingId(null);
		setTestingAll(false);
		toast.success("تست دیلی همه کانفیگ‌ها تمام شد");
	}
	const broken = entries.filter((e) => diagnose(e.config, e.probe).status === "broken").length;
	const ok = entries.filter((e) => diagnose(e.config, e.probe).status === "ok").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "border-b border-border bg-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-10 place-items-center rounded-md border border-border bg-surface-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-5 text-accent" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-base font-semibold leading-tight",
							children: "پولاریس"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "بازرس کانفیگ · تست دیلی · تشخیص مکان"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDialog, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: testAll,
								disabled: testingAll || !entries.length,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, {}), testingAll ? "در حال تست…" : "تست همه"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "بارگذاری نمونه",
								onClick: () => {
									loadSamples();
									toast.message("نمونه‌ها بارگذاری شدند");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSheet, {})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "border-t border-border px-4 py-2 text-xs leading-relaxed text-subtle",
					children: "این نسخه مرورگر است و فایل ویندوز (.exe) نیست: ترافیک سیستم را تونل نمی‌کند و جایگزین v2rayN نمی‌شود. لینک، JSON نپسترنت، Clash و Xray را می‌خواند؛ نوع، امنیت و مکان را نشان می‌دهد؛ فقط تست دیلی می‌گیرد و کانفیگ‌هایی که سرورشان ایران است (مکان عوض نمی‌شود) را «مشکل‌دار» می‌زند. خروجی را در کلاینت واقعی ویندوز وارد کنید."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: `w-full shrink-0 border-l border-border bg-surface md:w-80 lg:w-96 ${mobilePanel === "detail" ? "hidden md:flex md:flex-col" : "flex flex-col"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfigList, {
						testingId,
						onTest: (id) => {
							testOne(id);
						},
						onSelect: (id) => {
							select(id);
							setMobilePanel("detail");
						}
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: `min-w-0 flex-1 bg-bg ${mobilePanel === "list" ? "hidden md:block" : "block"}`,
					children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfigDetail, {
						entry: selected,
						testing: testingId === selected.config.id,
						onTest: () => testOne(selected.config.id),
						onBack: () => {
							setMobilePanel("list");
						}
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface px-4 py-2 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums",
					children: [
						entries.length,
						" کانفیگ · ",
						ok,
						" سالم · ",
						broken,
						" مشکل‌دار",
						testingAll && testingId ? " · در حال تست…" : ""
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-3.5" }), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"فعال: ",
						active.config.remark,
						active.probe?.countryCode ? ` · ${active.probe.countryCode}` : ""
					] }) : "هیچ کانفیگی انتخاب نشده"]
				})]
			})
		]
	});
}
function EmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid h-full place-items-center px-6 py-16 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "mx-auto size-10 text-subtle" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-lg font-semibold",
					children: "یک کانفیگ را انتخاب کنید"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "از لیست سمت راست یک سرور بردارید یا با «ورود کانفیگ» لینک، JSON نپسترنت یا سابسکریپشن را اضافه کنید."
				})
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolarisApp, {});
}
//#endregion
export { Home as component };
