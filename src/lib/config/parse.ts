import { emptyConfig, type Network, type Protocol, type ProxyConfig, type TlsMode } from "./types.ts";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `cfg-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function decodeB64(input: string): string | null {
  const raw = input.trim().replace(/\s+/g, "");
  if (!raw) return null;
  const norm = raw.replace(/-/g, "+").replace(/_/g, "/");
  const pad = norm + "=".repeat((4 - (norm.length % 4)) % 4);
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
  } catch {
    /* fall through */
  }
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(pad, "base64").toString("utf8");
    }
  } catch {
    return null;
  }
  return null;
}

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v).trim();
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function rec(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pick(obj: Record<string, unknown>, keys: string[], fallback = ""): string {
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== "") return str(obj[k]);
  }
  return fallback;
}

function pickNum(obj: Record<string, unknown>, keys: string[], fallback = 0): number {
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== "") return num(obj[k], fallback);
  }
  return fallback;
}

function asProtocol(v: string): Protocol {
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

function asNetwork(v: string): Network {
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
  if ((NETWORK_SET as Set<string>).has(t)) return t as Network;
  return "tcp";
}

const NETWORK_SET = new Set([
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
  "raw",
]);

function asTls(v: string): TlsMode {
  const t = v.toLowerCase();
  if (t === "reality") return "reality";
  if (t === "xtls") return "xtls";
  if (t === "tls" || t === "true" || t === "1") return "tls";
  return "none";
}

function queryMap(search: string): Record<string, string> {
  const out: Record<string, string> = {};
  const q = search.startsWith("?") ? search.slice(1) : search;
  for (const part of q.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const k = decodeURIComponent(eq >= 0 ? part.slice(0, eq) : part);
    const val = decodeURIComponent(eq >= 0 ? part.slice(eq + 1) : "");
    out[k] = val;
  }
  return out;
}

function hashRemark(hash: string): string {
  if (!hash) return "";
  try {
    return decodeURIComponent(hash.replace(/^\u0000/, ""));
  } catch {
    return hash;
  }
}

function applyStreamQuery(cfg: ProxyConfig, q: Record<string, string>) {
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
  if (q.insecure === "1" || q.allowInsecure === "1" || q.allowinsecure === "1") {
    cfg.allowInsecure = true;
  }
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

  for (const [k, v] of Object.entries(q)) {
    if (!(k in cfg) && v) cfg.extra[k] = v;
  }
  if (cfg.publicKey && cfg.tls === "none") cfg.tls = "reality";
  if ((q.security || "").toLowerCase() === "reality") cfg.tls = "reality";
}

function parseUri(line: string): ProxyConfig | null {
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
    protocol: proto === "unknown" ? (scheme as Protocol) : proto,
    address: hp.host,
    port: hp.port,
    source: "uri",
    raw: trimmed,
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

function splitUserHost(main: string): { user: string; hostport: string } | null {
  const at = main.lastIndexOf("@");
  if (at < 0) return null;
  return { user: decodeURIComponent(main.slice(0, at)), hostport: main.slice(at + 1) };
}

function splitHostPort(hostport: string): { host: string; port: number } | null {
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
  return { host, port };
}

function parseVmess(uri: string): ProxyConfig | null {
  const payload = uri.slice("vmess://".length);
  const decoded = decodeB64(payload);
  if (!decoded) return null;
  try {
    const obj = rec(JSON.parse(decoded));
    if (!obj) return null;
    return fromVmessObject(obj, uri);
  } catch {
    // some share as vmess://uuid@host:port?...
    return parseLooseVmess(uri);

  }
}

function parseLooseVmess(uri: string): ProxyConfig | null {
  const fake = uri.replace(/^vmess:\/\//i, "vless://");
  const cfg = parseUri(fake);
  if (!cfg) return null;
  cfg.protocol = "vmess";
  cfg.raw = uri;
  return cfg;
}

function fromVmessObject(obj: Record<string, unknown>, raw: string): ProxyConfig {
  const tlsRaw = str(obj.tls || obj.security);
  const cfg = emptyConfig({
    id: newId(),
    remark: pick(obj, ["ps", "remarks", "name", "remark"], "VMess"),
    protocol: "vmess",
    address: pick(obj, ["add", "server", "address", "host"]),
    port: pickNum(obj, ["port", "server_port", "serverPort"], 443),
    uuid: pick(obj, ["id", "uuid", "user"]),
    alterId: pickNum(obj, ["aid", "alterId", "alterid"], 0),
    method: pick(obj, ["scy", "security", "method"], "auto"),
    network: asNetwork(pick(obj, ["net", "network"], "tcp")),
    headerType: pick(obj, ["type", "headerType"], "none"),
    host: pick(obj, ["host", "authority"]),
    path: pick(obj, ["path"]),
    tls: asTls(tlsRaw),
    sni: pick(obj, ["sni", "serverName", "peer"]),
    alpn: pick(obj, ["alpn"]),
    fingerprint: pick(obj, ["fp", "fingerprint"]),
    flow: pick(obj, ["flow"]),
    publicKey: pick(obj, ["pbk", "publicKey", "public_key"]),
    shortId: pick(obj, ["sid", "shortId", "short_id"]),
    spiderX: pick(obj, ["spx", "spiderX"]),
    serviceName: pick(obj, ["serviceName", "service_name"]),
    source: looksNapsternet(obj) ? "napsternet" : "uri",
    raw,
    allowInsecure: obj.allowInsecure === true || obj.insecure === true,
  });
  if (cfg.network === "grpc" && !cfg.serviceName && cfg.path) cfg.serviceName = cfg.path;
  if (cfg.publicKey) cfg.tls = "reality";
  if (tlsRaw.toLowerCase() === "reality") cfg.tls = "reality";
  if (!cfg.sni && cfg.host) cfg.sni = cfg.host;
  return cfg;
}

function parseSs(uri: string): ProxyConfig | null {
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
    else {
      try {
        userinfo = decodeURIComponent(userinfo);
      } catch {
        /* keep */
      }
    }
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
    raw: uri,
  });
  applyStreamQuery(cfg, q);
  return cfg;
}

function parseSsr(uri: string): ProxyConfig | null {
  const payload = uri.slice("ssr://".length);
  const decoded = decodeB64(payload);
  if (!decoded) return null;
  // host:port:protocol:method:obfs:password_b64/?params
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
    extra: { protocol, obfs, obfsparam: q.obfsparam ?? "", protoparam: q.protoparam ?? "" },
    source: "uri",
    raw: uri,
  });
}

function looksNapsternet(obj: Record<string, unknown>): boolean {
  if (obj.npv != null || obj.vpnType != null || obj.configType != null || obj.coreType != null) {
    return true;
  }
  const keys = Object.keys(obj);
  // Standard VMess share JSON always has v + add + id + ps — that is not Napsternet.
  if (obj.v != null && obj.add != null && (obj.id != null || obj.uuid != null) && obj.configType == null) {
    return false;
  }
  const hasServer = keys.includes("server") && keys.includes("remarks");
  const npvHints = ["pbk", "sid", "spx", "fp", "scy"].filter((k) => keys.includes(k)).length >= 2;
  return Boolean(hasServer && npvHints);
}

function pickHeader(obj: Record<string, unknown>): string {
  const raw = pick(obj, ["headerType", "header", "headertype"]);
  if (raw) return raw;
  const t = pick(obj, ["type"]).toLowerCase();
  const headers = new Set(["none", "http", "srtp", "utp", "wechat-video", "dtls", "wireguard"]);
  if (headers.has(t)) return t;
  return "none";
}

function fromGenericObject(obj: Record<string, unknown>, raw: string, source: ProxyConfig["source"]): ProxyConfig {
  const protocol = asProtocol(
    pick(obj, ["protocol", "type", "configType", "vpnType", "coreType"], "vless"),
  );
  const tlsRaw = pick(obj, ["tls", "security", "streamSecurity"]);
  const cfg = emptyConfig({
    id: newId(),
    remark: pick(obj, ["ps", "remarks", "name", "remark", "label"], protocol.toUpperCase()),
    protocol: protocol === "unknown" ? "vless" : protocol,
    address: pick(obj, ["add", "server", "address", "hostname", "ip", "host"]),
    port: pickNum(obj, ["port", "server_port", "serverPort"], 443),
    uuid: pick(obj, ["id", "uuid", "user", "username"]),
    password: pick(obj, ["password", "passwd", "pass"]),
    alterId: pickNum(obj, ["aid", "alterId"], 0),
    method: pick(obj, ["scy", "method", "cipher", "encryption"], ""),
    network: asNetwork(pick(obj, ["net", "network", "transport"], "tcp")),
    headerType: pickHeader(obj),
    host: pick(obj, ["host", "wsHost", "authority"]),
    path: pick(obj, ["path", "wsPath"]),
    tls: asTls(tlsRaw),
    sni: pick(obj, ["sni", "serverName", "peer", "server_name", "servername"]),
    alpn: pick(obj, ["alpn"]),
    fingerprint: pick(obj, ["fp", "fingerprint", "client-fingerprint"]),
    flow: pick(obj, ["flow"]),
    publicKey: pick(obj, ["pbk", "publicKey", "public_key", "public-key"]),
    shortId: pick(obj, ["sid", "shortId", "short_id", "short-id"]),
    spiderX: pick(obj, ["spx", "spiderX", "spider-x"]),
    serviceName: pick(obj, ["serviceName", "service_name", "grpc-service-name"]),
    encryption: pick(obj, ["encryption"], "none"),
    source,
    raw,
    allowInsecure:
      obj.allowInsecure === true ||
      obj.insecure === true ||
      obj.skipCertVerify === true ||
      obj["skip-cert-verify"] === true,
    group: pick(obj, ["group", "subscription"]),
  });

  const reality = rec(obj["reality-opts"]) ?? rec(obj.realityOpts) ?? rec(obj.realitySettings);
  if (reality) {
    cfg.tls = "reality";
    cfg.publicKey = pick(reality, ["public-key", "publicKey", "pbk"], cfg.publicKey);
    cfg.shortId = pick(reality, ["short-id", "shortId", "sid"], cfg.shortId);
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

function fromXrayOutbound(ob: Record<string, unknown>, raw: string): ProxyConfig | null {
  const protocol = asProtocol(str(ob.protocol || ob.tag));
  if (["unknown"].includes(protocol) && !ob.settings) return null;
  const protoName = str(ob.protocol);
  if (["freedom", "blackhole", "dns", "block", "direct"].includes(protoName)) return null;
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
    raw,
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

function fromSingbox(ob: Record<string, unknown>, raw: string): ProxyConfig | null {
  const type = str(ob.type);
  if (!type || ["direct", "block", "dns", "selector", "urltest"].includes(type)) return null;
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
    raw,
  });
  if (cfg.publicKey) cfg.tls = "reality";
  return cfg;
}

function collectFromJson(data: unknown, raw: string): ProxyConfig[] {
  const out: ProxyConfig[] = [];
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
    for (const key of ["vmess", "vless", "trojan", "ss"]) {
      const arr = obj[key];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          const r = rec(item);
          if (r) {
            r.protocol = r.protocol ?? key;
            out.push(fromGenericObject(r, raw, "napsternet"));
          }
        }
      }
    }
    if (out.length) return out;
  }
  out.push(fromGenericObject(obj, raw, looksNapsternet(obj) ? "napsternet" : "xray-json"));
  return out;
}

function parseClashYaml(text: string): ProxyConfig[] {
  const out: ProxyConfig[] = [];
  const lines = text.replace(/\t/g, "  ").split(/\r?\n/);
  let inProxies = false;
  let current: Record<string, unknown> | null = null;
  const stack: Array<{ indent: number; obj: Record<string, unknown> }> = [];

  const flush = () => {
    if (current && (current.server || current.add || current.name || current.type)) {
      out.push(fromGenericObject(current, text, "clash"));
    }
    current = null;
    stack.length = 0;
  };

  const indentOf = (line: string) => line.match(/^ */)?.[0].length ?? 0;

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
        stack.push({ indent, obj: current });
        if (rest.startsWith("{")) {
          try {
            const jsonish = rest.replace(/([A-Za-z0-9_-]+)\s*:/g, '"$1":').replace(/'/g, '"');
            const obj = rec(JSON.parse(jsonish));
            if (obj) {
              current = obj;
              stack[0] = { indent, obj: current };
            }
          } catch {
            parseYamlPair(current, rest);
          }
        } else if (rest) {
          parseYamlPair(current, rest);
        }
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
      const child: Record<string, unknown> = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      parseYamlPair(parent, `${key}: ${rawVal}`);
    }
  }
  flush();
  return out;
}

function parseYamlPair(obj: Record<string, unknown>, line: string) {
  const m = line.match(/^\s*(?:-\s+)?([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
  if (!m) return;
  let val: unknown = m[2].trim();
  if (val === "true") val = true;
  else if (val === "false") val = false;
  else if (typeof val === "string" && /^".*"$/.test(val)) val = val.slice(1, -1);
  else if (typeof val === "string" && /^'.*'$/.test(val)) val = val.slice(1, -1);
  obj[m[1]] = val;
}

export function parseInput(text: string): ProxyConfig[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const collected: ProxyConfig[] = [];
  const seen = new Set<string>();
  const add = (cfg: ProxyConfig | null) => {
    if (!cfg || !cfg.address) return;
    const key = `${cfg.protocol}|${cfg.address}|${cfg.port}|${cfg.uuid}|${cfg.password}|${cfg.path}|${cfg.sni}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (!cfg.remark) cfg.remark = `${cfg.protocol} ${cfg.address}`;
    collected.push(cfg);
  };

  const tryJson = (s: string): boolean => {
    try {
      const data = JSON.parse(s);
      collectFromJson(data, s).forEach(add);
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

export function protocolLabel(p: Protocol): string {
  const map: Record<Protocol, string> = {
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
    unknown: "نامشخص",
  };
  return map[p] ?? p;
}

export function sourceLabel(s: ProxyConfig["source"]): string {
  const map = {
    uri: "لینک استاندارد",
    "xray-json": "Xray JSON",
    napsternet: "NapsternetV",
    clash: "Clash",
    singbox: "sing-box",
    subscription: "سابسکریپشن",
  };
  return map[s];
}

export function typeLabel(cfg: ProxyConfig): string {
  const proto = protocolLabel(cfg.protocol);
  const net = cfg.network && cfg.network !== "tcp" ? cfg.network.toUpperCase() : "";
  const sec =
    cfg.tls === "reality" ? "Reality" : cfg.tls === "tls" ? "TLS" : cfg.tls === "xtls" ? "XTLS" : "";
  return [proto, net, sec].filter(Boolean).join(" · ");
}
