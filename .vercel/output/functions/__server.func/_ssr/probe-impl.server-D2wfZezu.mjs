import { lookup } from "node:dns/promises";
import net, { isIP } from "node:net";
//#region node_modules/.nitro/vite/services/ssr/assets/probe-impl.server-D2wfZezu.js
var TIMEOUT_MS = 4500;
var geoCache = /* @__PURE__ */ new Map();
var GEO_TTL = 6e5;
function ipv4ToInt(ip) {
	const p = ip.split(".").map(Number);
	if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return -1;
	return (p[0] << 24 | p[1] << 16 | p[2] << 8 | p[3]) >>> 0;
}
function isPrivateHost(host, ip) {
	const h = host.toLowerCase();
	if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
	if (ip === "0.0.0.0" || ip === "::" || ip === "::1") return true;
	if (ip.includes(":")) {
		const n = ip.toLowerCase();
		return n.startsWith("fc") || n.startsWith("fd") || n.startsWith("fe80") || n === "::1";
	}
	const n = ipv4ToInt(ip);
	if (n < 0) return true;
	const inRange = (start, prefix) => {
		const s = ipv4ToInt(start);
		const mask = prefix === 0 ? 0 : -1 << 32 - prefix >>> 0;
		return (n & mask) === (s & mask);
	};
	return inRange("10.0.0.0", 8) || inRange("127.0.0.0", 8) || inRange("169.254.0.0", 16) || inRange("172.16.0.0", 12) || inRange("192.168.0.0", 16) || inRange("0.0.0.0", 8) || inRange("100.64.0.0", 10);
}
async function resolveHost(host) {
	if (isIP(host)) return host;
	return (await lookup(host, { all: false })).address;
}
function tcpPing(host, port, timeoutMs) {
	return new Promise((resolve, reject) => {
		const started = Date.now();
		const socket = net.connect({
			host,
			port,
			family: 0
		});
		const fail = (err) => {
			socket.destroy();
			reject(err);
		};
		const timer = setTimeout(() => fail(/* @__PURE__ */ new Error("timeout")), timeoutMs);
		socket.setNoDelay(true);
		socket.once("connect", () => {
			const ms = Date.now() - started;
			clearTimeout(timer);
			socket.end();
			socket.destroy();
			resolve(ms);
		});
		socket.once("error", (err) => {
			clearTimeout(timer);
			fail(err);
		});
	});
}
async function lookupGeo(ip) {
	const cached = geoCache.get(ip);
	if (cached && Date.now() - cached.at < GEO_TTL) return cached.data;
	const data = await fetchGeo(ip);
	geoCache.set(ip, {
		at: Date.now(),
		data
	});
	return data;
}
async function fetchGeo(ip) {
	try {
		const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
			signal: AbortSignal.timeout(4e3),
			headers: { accept: "application/json" }
		});
		if (res.ok) {
			const j = await res.json();
			if (j.success !== false) {
				const conn = j.connection ?? {};
				return {
					ip,
					country: String(j.country ?? ""),
					countryCode: String(j.country_code ?? "").toUpperCase(),
					city: String(j.city ?? ""),
					isp: String(conn.isp ?? j.isp ?? ""),
					org: String(conn.org ?? j.org ?? "")
				};
			}
		}
	} catch {}
	try {
		const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city,isp,org,query`, { signal: AbortSignal.timeout(4e3) });
		if (res.ok) {
			const j = await res.json();
			if (j.status === "success") return {
				ip: j.query || ip,
				country: j.country,
				countryCode: (j.countryCode || "").toUpperCase(),
				city: j.city,
				isp: j.isp,
				org: j.org
			};
		}
	} catch {}
	return { ip };
}
async function runProbe(host, port) {
	const cleanHost = host.trim().replace(/^\[/, "").replace(/]$/, "");
	if (!cleanHost) return {
		ok: false,
		delayMs: null,
		error: "host empty"
	};
	if (!Number.isInteger(port) || port < 1 || port > 65535) return {
		ok: false,
		delayMs: null,
		error: "port invalid"
	};
	let ip;
	try {
		ip = await resolveHost(cleanHost);
	} catch {
		return {
			ok: false,
			delayMs: null,
			error: "dns"
		};
	}
	if (isPrivateHost(cleanHost, ip)) return {
		ok: false,
		delayMs: null,
		error: "private",
		ip
	};
	const geo = await lookupGeo(ip);
	try {
		return {
			ok: true,
			delayMs: await tcpPing(cleanHost, port, TIMEOUT_MS),
			...geo,
			ip: geo.ip || ip
		};
	} catch (err) {
		return {
			ok: false,
			delayMs: null,
			error: err instanceof Error && err.message === "timeout" ? "timeout" : "connect",
			...geo,
			ip: geo.ip || ip
		};
	}
}
async function fetchRemoteList(url) {
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error("url");
	}
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("protocol");
	const ip = await resolveHost(parsed.hostname);
	if (isPrivateHost(parsed.hostname, ip)) throw new Error("private");
	const res = await fetch(parsed.toString(), {
		signal: AbortSignal.timeout(12e3),
		headers: {
			"user-agent": "Polaris/1.0",
			accept: "text/plain, application/json, */*"
		},
		redirect: "follow"
	});
	if (!res.ok) throw new Error(`http ${res.status}`);
	const buf = await res.arrayBuffer();
	if (buf.byteLength > 1e6) throw new Error("too large");
	return new TextDecoder().decode(buf);
}
//#endregion
export { fetchRemoteList, runProbe };
