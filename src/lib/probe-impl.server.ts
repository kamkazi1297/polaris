import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import net from "node:net";
import type { ProbeResult } from "./config/types";

const TIMEOUT_MS = 4500;
const geoCache = new Map<string, { at: number; data: Geo }>();
const GEO_TTL = 10 * 60 * 1000;

interface Geo {
  ip: string;
  country?: string;
  countryCode?: string;
  city?: string;
  isp?: string;
  org?: string;
}

function ipv4ToInt(ip: string): number {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return -1;
  return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
}

function isPrivateHost(host: string, ip: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (ip === "0.0.0.0" || ip === "::" || ip === "::1") return true;
  if (ip.includes(":")) {
    const n = ip.toLowerCase();
    return n.startsWith("fc") || n.startsWith("fd") || n.startsWith("fe80") || n === "::1";
  }
  const n = ipv4ToInt(ip);
  if (n < 0) return true;
  const inRange = (start: string, prefix: number) => {
    const s = ipv4ToInt(start);
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    return (n & mask) === (s & mask);
  };
  return (
    inRange("10.0.0.0", 8) ||
    inRange("127.0.0.0", 8) ||
    inRange("169.254.0.0", 16) ||
    inRange("172.16.0.0", 12) ||
    inRange("192.168.0.0", 16) ||
    inRange("0.0.0.0", 8) ||
    inRange("100.64.0.0", 10)
  );
}

async function resolveHost(host: string): Promise<string> {
  if (isIP(host)) return host;
  const r = await lookup(host, { all: false });
  return r.address;
}

function tcpPing(host: string, port: number, timeoutMs: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const socket = net.connect({ host, port, family: 0 });
    const fail = (err: Error) => {
      socket.destroy();
      reject(err);
    };
    const timer = setTimeout(() => fail(new Error("timeout")), timeoutMs);
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

async function lookupGeo(ip: string): Promise<Geo> {
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.at < GEO_TTL) return cached.data;
  const data = await fetchGeo(ip);
  geoCache.set(ip, { at: Date.now(), data });
  return data;
}

async function fetchGeo(ip: string): Promise<Geo> {
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(4000),
      headers: { accept: "application/json" },
    });
    if (res.ok) {
      const j = (await res.json()) as Record<string, unknown>;
      if (j.success !== false) {
        const conn = (j.connection as Record<string, unknown> | undefined) ?? {};
        return {
          ip,
          country: String(j.country ?? ""),
          countryCode: String(j.country_code ?? "").toUpperCase(),
          city: String(j.city ?? ""),
          isp: String(conn.isp ?? j.isp ?? ""),
          org: String(conn.org ?? j.org ?? ""),
        };
      }
    }
  } catch {
    /* fallback */
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city,isp,org,query`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (res.ok) {
      const j = (await res.json()) as Record<string, string>;
      if (j.status === "success") {
        return {
          ip: j.query || ip,
          country: j.country,
          countryCode: (j.countryCode || "").toUpperCase(),
          city: j.city,
          isp: j.isp,
          org: j.org,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { ip };
}

export async function runProbe(host: string, port: number): Promise<ProbeResult> {
  const cleanHost = host.trim().replace(/^\[/, "").replace(/]$/, "");
  if (!cleanHost) return { ok: false, delayMs: null, error: "host empty" };
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, delayMs: null, error: "port invalid" };
  }
  let ip: string;
  try {
    ip = await resolveHost(cleanHost);
  } catch {
    return { ok: false, delayMs: null, error: "dns" };
  }
  if (isPrivateHost(cleanHost, ip)) {
    return { ok: false, delayMs: null, error: "private", ip };
  }
  const geo = await lookupGeo(ip);
  try {
    const delayMs = await tcpPing(cleanHost, port, TIMEOUT_MS);
    return { ok: true, delayMs, ...geo, ip: geo.ip || ip };
  } catch (err) {
    const msg = err instanceof Error && err.message === "timeout" ? "timeout" : "connect";
    return { ok: false, delayMs: null, error: msg, ...geo, ip: geo.ip || ip };
  }
}

export async function fetchRemoteList(url: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("url");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("protocol");
  const ip = await resolveHost(parsed.hostname);
  if (isPrivateHost(parsed.hostname, ip)) throw new Error("private");
  const res = await fetch(parsed.toString(), {
    signal: AbortSignal.timeout(12000),
    headers: { "user-agent": "Polaris/1.0", accept: "text/plain, application/json, */*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`http ${res.status}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength > 1_000_000) throw new Error("too large");
  return new TextDecoder().decode(buf);
}
