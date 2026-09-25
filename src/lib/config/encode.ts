import type { ProxyConfig } from "./types.ts";

function enc(v: string): string {
  return encodeURIComponent(v);
}

function b64(s: string): string {
  if (typeof Buffer !== "undefined") return Buffer.from(s, "utf8").toString("base64");
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function num(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const SINGBOX_NATIVE = new Set(["hysteria2", "hysteria", "tuic", "wireguard", "anytls"]);

export function needsSingbox(cfg: ProxyConfig): boolean {
  return SINGBOX_NATIVE.has(cfg.protocol);
}

export function toUri(cfg: ProxyConfig): string {
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
      flow: cfg.flow,
    };
    return `vmess://${b64(JSON.stringify(obj))}`;
  }
  if (cfg.protocol === "ss") {
    const user = b64(`${cfg.method || "aes-256-gcm"}:${cfg.password}`);
    return `ss://${user}@${cfg.address}:${cfg.port}${remark}`;
  }

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

  const user =
    cfg.protocol === "vless"
      ? cfg.uuid
      : cfg.protocol === "tuic"
        ? `${cfg.uuid}:${cfg.password}`
        : enc(cfg.password || cfg.uuid);
  const host = cfg.address.includes(":") ? `[${cfg.address}]` : cfg.address;
  const scheme =
    cfg.protocol === "hysteria2" ? "hy2" : cfg.protocol === "hysteria" ? "hysteria" : cfg.protocol;
  const qs = q.toString();
  return `${scheme}://${user}@${host}:${cfg.port}${qs ? `?${qs}` : ""}${remark}`;
}

export function toNapsternet(cfg: ProxyConfig): string {
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
    obfs: cfg.extra.obfs || undefined,
    "obfs-password": cfg.extra["obfs-password"] || undefined,
    congestion: cfg.extra.congestion || undefined,
  };
  return JSON.stringify(obj, null, 2);
}

function streamSettings(cfg: ProxyConfig): Record<string, unknown> {
  const stream: Record<string, unknown> = {
    network: cfg.network,
    security: cfg.tls === "none" ? "none" : cfg.tls,
  };
  if (cfg.tls === "tls" || cfg.tls === "xtls") {
    stream.tlsSettings = {
      serverName: cfg.sni,
      allowInsecure: cfg.allowInsecure,
      fingerprint: cfg.fingerprint || undefined,
      alpn: cfg.alpn ? cfg.alpn.split(",").map((s) => s.trim()) : undefined,
    };
  }
  if (cfg.tls === "reality") {
    stream.realitySettings = {
      serverName: cfg.sni,
      fingerprint: cfg.fingerprint || "chrome",
      publicKey: cfg.publicKey,
      shortId: cfg.shortId,
      spiderX: cfg.spiderX || "/",
    };
  }
  if (cfg.network === "ws") {
    stream.wsSettings = {
      path: cfg.path || "/",
      headers: cfg.host ? { Host: cfg.host } : undefined,
    };
  }
  if (cfg.network === "grpc") {
    stream.grpcSettings = {
      serviceName: cfg.serviceName,
      multiMode: cfg.grpcMode === "multi",
    };
  }
  if (cfg.network === "httpupgrade") {
    stream.httpupgradeSettings = { path: cfg.path || "/", host: cfg.host || undefined };
  }
  if (cfg.network === "xhttp" || cfg.network === "splithttp") {
    stream.xhttpSettings = {
      path: cfg.path || "/",
      host: cfg.host || undefined,
      mode: cfg.extra.xhttpMode || "auto",
    };
  }
  if (cfg.network === "kcp") {
    stream.kcpSettings = {
      mtu: num(cfg.extra.kcpMtu, 1350),
      tti: num(cfg.extra.kcpTti, 50),
      uplinkCapacity: num(cfg.extra.uplinkCapacity, 12),
      downlinkCapacity: num(cfg.extra.downlinkCapacity, 100),
      congestion: false,
      header: { type: cfg.headerType || "none" },
      seed: cfg.extra.seed || undefined,
    };
  }
  if (cfg.network === "h2" || cfg.network === "http") {
    stream.httpSettings = {
      path: cfg.path || "/",
      host: cfg.host ? [cfg.host] : undefined,
    };
  }
  if (cfg.network === "quic") {
    stream.quicSettings = {
      security: cfg.method || "none",
      key: cfg.password || undefined,
      header: { type: cfg.headerType || "none" },
    };
  }
  if (cfg.network === "tcp" && cfg.headerType && cfg.headerType !== "none") {
    stream.tcpSettings = {
      header: {
        type: cfg.headerType,
        request:
          cfg.headerType === "http"
            ? {
                path: cfg.path ? [cfg.path] : ["/"],
                headers: cfg.host ? { Host: [cfg.host] } : undefined,
              }
            : undefined,
      },
    };
  }
  if (cfg.extra.packetEncoding) {
    stream.sockopt = { ...(stream.sockopt as object), domainStrategy: "UseIP" };
  }
  return stream;
}

export function toXrayOutbound(cfg: ProxyConfig): string {
  const users = [
    {
      id: cfg.uuid || cfg.password,
      encryption: cfg.encryption || "none",
      flow: cfg.flow || undefined,
      security: cfg.method || undefined,
      alterId: cfg.protocol === "vmess" ? cfg.alterId : undefined,
      password: cfg.password || undefined,
    },
  ];
  const protocol = cfg.protocol === "ss" ? "shadowsocks" : cfg.protocol;
  let settings: Record<string, unknown>;
  if (cfg.protocol === "ss") {
    settings = {
      servers: [
        {
          address: cfg.address,
          port: cfg.port,
          method: cfg.method || "aes-256-gcm",
          password: cfg.password,
        },
      ],
    };
  } else if (cfg.protocol === "trojan" || cfg.protocol === "socks" || cfg.protocol === "http") {
    settings = {
      servers: [
        {
          address: cfg.address,
          port: cfg.port,
          password: cfg.password || undefined,
          users: cfg.uuid ? [{ user: cfg.uuid, pass: cfg.password }] : undefined,
        },
      ],
    };
  } else {
    settings = {
      vnext: [
        {
          address: cfg.address,
          port: cfg.port,
          users,
        },
      ],
    };
  }
  const outbound: Record<string, unknown> = {
    tag: cfg.remark || "proxy",
    protocol,
    settings,
    streamSettings: streamSettings(cfg),
  };
  return JSON.stringify({ outbounds: [outbound] }, null, 2);
}

export function toClash(cfg: ProxyConfig): string {
  const proxy: Record<string, unknown> = {
    name: cfg.remark || `${cfg.protocol}-${cfg.address}`,
    type: cfg.protocol === "ss" ? "ss" : cfg.protocol,
    server: cfg.address,
    port: cfg.port,
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
  if (cfg.tls === "reality") {
    proxy["reality-opts"] = {
      "public-key": cfg.publicKey,
      "short-id": cfg.shortId,
    };
  }
  if (cfg.network === "ws") {
    proxy["ws-opts"] = {
      path: cfg.path || "/",
      headers: cfg.host ? { Host: cfg.host } : undefined,
    };
  }
  if (cfg.network === "grpc") {
    proxy["grpc-opts"] = { "grpc-service-name": cfg.serviceName };
  }
  if (cfg.network === "httpupgrade" || cfg.network === "h2" || cfg.network === "http") {
    proxy["http-opts"] = {
      path: cfg.path ? [cfg.path] : undefined,
      headers: cfg.host ? { Host: [cfg.host] } : undefined,
    };
  }
  if (cfg.extra.obfs) proxy.obfs = cfg.extra.obfs;
  if (cfg.extra["obfs-password"]) proxy["obfs-password"] = cfg.extra["obfs-password"];
  if (cfg.allowInsecure) proxy["skip-cert-verify"] = true;
  return JSON.stringify(proxy, null, 2);
}

export function toSingboxOutbound(cfg: ProxyConfig): Record<string, unknown> {
  const tlsEnabled = cfg.tls === "tls" || cfg.tls === "reality" || cfg.tls === "xtls";
  const tls: Record<string, unknown> | undefined = tlsEnabled
    ? {
        enabled: true,
        server_name: cfg.sni || undefined,
        insecure: cfg.allowInsecure || undefined,
        alpn: cfg.alpn ? cfg.alpn.split(",").map((s) => s.trim()) : undefined,
        utls: cfg.fingerprint ? { enabled: true, fingerprint: cfg.fingerprint } : undefined,
        reality:
          cfg.tls === "reality"
            ? { enabled: true, public_key: cfg.publicKey, short_id: cfg.shortId }
            : undefined,
      }
    : undefined;

  const transport: Record<string, unknown> | undefined =
    cfg.network && cfg.network !== "tcp" && cfg.network !== "raw"
      ? {
          type:
            cfg.network === "h2"
              ? "http"
              : cfg.network === "httpupgrade"
                ? "httpupgrade"
                : cfg.network === "xhttp" || cfg.network === "splithttp"
                  ? "http"
                  : cfg.network,
          path: cfg.path || undefined,
          host: cfg.host || undefined,
          service_name: cfg.serviceName || undefined,
          headers: cfg.host ? { Host: cfg.host } : undefined,
        }
      : undefined;

  const base: Record<string, unknown> = {
    tag: cfg.remark || "proxy",
    type:
      cfg.protocol === "ss"
        ? "shadowsocks"
        : cfg.protocol === "hysteria"
          ? "hysteria"
          : cfg.protocol,
    server: cfg.address,
    server_port: cfg.port,
  };

  if (cfg.protocol === "vless" || cfg.protocol === "vmess") {
    base.uuid = cfg.uuid;
    if (cfg.flow) base.flow = cfg.flow;
    if (cfg.protocol === "vmess" && cfg.alterId) base.alter_id = cfg.alterId;
    if (cfg.protocol === "vmess") base.security = cfg.method || "auto";
    if (cfg.encryption && cfg.encryption !== "none") base.packet_encoding = cfg.extra.packetEncoding || "xudp";
  } else if (cfg.protocol === "trojan" || cfg.protocol === "anytls") {
    base.password = cfg.password;
  } else if (cfg.protocol === "ss") {
    base.method = cfg.method || "aes-256-gcm";
    base.password = cfg.password;
  } else if (cfg.protocol === "hysteria2" || cfg.protocol === "hysteria") {
    base.password = cfg.password;
    if (cfg.extra.obfs) {
      base.obfs = { type: cfg.extra.obfs, password: cfg.extra["obfs-password"] || undefined };
    }
  } else if (cfg.protocol === "tuic") {
    base.uuid = cfg.uuid;
    base.password = cfg.password;
    if (cfg.extra.congestion) base.congestion_control = cfg.extra.congestion;
  } else if (cfg.protocol === "wireguard") {
    base.private_key = cfg.password;
    base.peer_public_key = cfg.extra.peerPublicKey || cfg.publicKey;
    if (cfg.extra.localAddress) base.local_address = cfg.extra.localAddress.split(",");
    if (cfg.extra.mtu) base.mtu = num(cfg.extra.mtu, 1280);
    if (cfg.extra.reserved) base.reserved = cfg.extra.reserved.split(",").map((n) => Number(n));
  } else if (cfg.protocol === "socks" || cfg.protocol === "http") {
    if (cfg.uuid) base.username = cfg.uuid;
    if (cfg.password) base.password = cfg.password;
  }

  if (tls) base.tls = tls;
  if (transport && !needsSingbox(cfg)) base.transport = transport;
  return base;
}

export function toSingbox(cfg: ProxyConfig): string {
  return JSON.stringify({ outbounds: [toSingboxOutbound(cfg)] }, null, 2);
}
