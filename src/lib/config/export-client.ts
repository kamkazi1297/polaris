import type { ClientSettings, ProxyConfig } from "./types.ts";
import { needsSingbox, toSingboxOutbound, toUri, toXrayOutbound } from "./encode.ts";

export function toShareList(configs: ProxyConfig[]): string {
  return configs.map((c) => toUri(c)).join("\n");
}

export function toShareListB64(configs: ProxyConfig[]): string {
  const text = toShareList(configs);
  if (typeof Buffer !== "undefined") return Buffer.from(text, "utf8").toString("base64");
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function toFullClientConfig(cfg: ProxyConfig, settings: ClientSettings): string {
  if (settings.core === "sing-box" || needsSingbox(cfg)) {
    return toFullSingboxConfig(cfg, settings);
  }
  return toFullXrayConfig(cfg, settings);
}

export function toFullXrayConfig(cfg: ProxyConfig, settings: ClientSettings): string {
  const outbound = JSON.parse(toXrayOutbound(cfg)) as {
    outbounds: Array<Record<string, unknown>>;
  };
  const proxy = outbound.outbounds[0] ?? {};
  const proxyTag = String(proxy.tag || "proxy");

  const inbounds: Array<Record<string, unknown>> = [
    {
      tag: "socks",
      port: settings.socksPort,
      listen: "127.0.0.1",
      protocol: "socks",
      settings: { udp: settings.udp, auth: "noauth" },
      sniffing: settings.sniffing
        ? { enabled: true, destOverride: ["http", "tls", "quic"], routeOnly: false }
        : undefined,
    },
    {
      tag: "http",
      port: settings.httpPort,
      listen: "127.0.0.1",
      protocol: "http",
      sniffing: settings.sniffing
        ? { enabled: true, destOverride: ["http", "tls"] }
        : undefined,
    },
  ];

  if (settings.tunEnabled) {
    inbounds.push({
      tag: "tun",
      protocol: "tun",
      settings: {
        mtu: 1500,
        name: "tun0",
        strictRoute: settings.tunStrictRoute,
      },
      sniffing: settings.sniffing
        ? { enabled: true, destOverride: ["http", "tls", "quic"] }
        : undefined,
    });
  }

  const routingRules: Array<Record<string, unknown>> = [];
  if (settings.bypassLan) {
    routingRules.push({ type: "field", ip: ["geoip:private"], outboundTag: "direct" });
  }
  if (settings.bypassIran) {
    routingRules.push({
      type: "field",
      domain: ["geosite:ir"],
      outboundTag: "direct",
    });
    routingRules.push({ type: "field", ip: ["geoip:ir"], outboundTag: "direct" });
  }
  if (settings.blockAds) {
    routingRules.push({
      type: "field",
      domain: ["geosite:category-ads-all"],
      outboundTag: "block",
    });
  }

  const outbounds: Array<Record<string, unknown>> = [proxy];

  if (settings.fragmentEnabled) {
    const stream = (proxy.streamSettings ?? {}) as Record<string, unknown>;
    stream.sockopt = { ...(stream.sockopt as object), dialerProxy: "fragment" };
    proxy.streamSettings = stream;
    outbounds.push({
      tag: "fragment",
      protocol: "freedom",
      settings: {
        fragment: {
          packets: settings.fragmentPackets,
          length: settings.fragmentLength,
          interval: settings.fragmentInterval,
        },
      },
    });
  }

  if (settings.muxEnabled) {
    proxy.mux = {
      enabled: true,
      concurrency: settings.muxConcurrency,
      xudpConcurrency: settings.muxXudp ? settings.muxConcurrency : 0,
      xudpProxyUDP443: "reject",
    };
  }

  outbounds.push(
    { tag: "direct", protocol: "freedom" },
    { tag: "block", protocol: "blackhole" },
  );

  const dnsServers: Array<string | Record<string, unknown>> = [
    settings.dnsDoh || "https://1.1.1.1/dns-query",
    settings.dnsPrimary,
    settings.dnsSecondary,
  ].filter(Boolean);

  return JSON.stringify(
    {
      log: { loglevel: settings.logLevel },
      dns: {
        servers: dnsServers,
        queryStrategy: "UseIP",
        ...(settings.fakeDns
          ? { fakeDns: [{ ipPool: "198.18.0.0/15", poolSize: 65535 }] }
          : {}),
      },
      inbounds,
      outbounds,
      routing: {
        domainStrategy: settings.domainStrategy || "IPIfNonMatch",
        rules: [
          ...routingRules,
          {
            type: "field",
            inboundTag: settings.tunEnabled ? ["socks", "http", "tun"] : ["socks", "http"],
            outboundTag: proxyTag,
          },
        ],
      },
    },
    null,
    2,
  );
}

export function toFullSingboxConfig(cfg: ProxyConfig, settings: ClientSettings): string {
  const proxy = toSingboxOutbound(cfg);
  const inbounds: Array<Record<string, unknown>> = [
    {
      type: "socks",
      tag: "socks-in",
      listen: "127.0.0.1",
      listen_port: settings.socksPort,
      sniff: settings.sniffing,
    },
    {
      type: "http",
      tag: "http-in",
      listen: "127.0.0.1",
      listen_port: settings.httpPort,
      sniff: settings.sniffing,
    },
  ];
  if (settings.tunEnabled) {
    inbounds.push({
      type: "tun",
      tag: "tun-in",
      address: ["172.19.0.1/30"],
      auto_route: true,
      strict_route: settings.tunStrictRoute,
      stack: "system",
      sniff: settings.sniffing,
    });
  }

  const rules: Array<Record<string, unknown>> = [];
  if (settings.bypassLan) rules.push({ ip_is_private: true, outbound: "direct" });
  if (settings.bypassIran) {
    rules.push({ geosite: "ir", outbound: "direct" });
    rules.push({ geoip: "ir", outbound: "direct" });
  }
  if (settings.blockAds) rules.push({ geosite: "category-ads-all", outbound: "block" });

  return JSON.stringify(
    {
      log: { level: settings.logLevel === "none" ? "panic" : settings.logLevel },
      dns: {
        servers: [
          { tag: "doh", address: settings.dnsDoh || "https://1.1.1.1/dns-query" },
          { tag: "primary", address: settings.dnsPrimary },
          { tag: "secondary", address: settings.dnsSecondary },
        ],
        strategy: "prefer_ipv4",
      },
      inbounds,
      outbounds: [proxy, { type: "direct", tag: "direct" }, { type: "block", tag: "block" }],
      route: {
        rules,
        final: String(proxy.tag || "proxy"),
      },
    },
    null,
    2,
  );
}
