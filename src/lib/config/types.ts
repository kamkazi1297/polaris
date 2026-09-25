export const PROTOCOLS = [
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
  "unknown",
] as const;

export type Protocol = (typeof PROTOCOLS)[number];

export const NETWORKS = [
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
] as const;

export type Network = (typeof NETWORKS)[number];

export type TlsMode = "none" | "tls" | "reality" | "xtls";

export type ConfigSource =
  | "uri"
  | "xray-json"
  | "napsternet"
  | "clash"
  | "singbox"
  | "subscription";

export type HealthStatus = "unknown" | "ok" | "broken" | "invalid" | "dead" | "warn";

export type SecurityLevel = "high" | "medium" | "low" | "none";

export interface ProxyConfig {
  id: string;
  remark: string;
  protocol: Protocol;
  address: string;
  port: number;
  uuid: string;
  password: string;
  alterId: number;
  method: string;
  flow: string;
  encryption: string;
  network: Network;
  headerType: string;
  host: string;
  path: string;
  serviceName: string;
  grpcMode: string;
  tls: TlsMode;
  sni: string;
  alpn: string;
  fingerprint: string;
  allowInsecure: boolean;
  publicKey: string;
  shortId: string;
  spiderX: string;
  extra: Record<string, string>;
  source: ConfigSource;
  raw: string;
  group: string;
}

export interface ProbeResult {
  delayMs: number | null;
  ok: boolean;
  error?: string;
  ip?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  isp?: string;
  org?: string;
}

export interface Diagnosis {
  status: HealthStatus;
  title: string;
  detail: string;
}

export interface SecurityReport {
  level: SecurityLevel;
  label: string;
  reasons: string[];
}

export interface ClientSettings {
  socksPort: number;
  httpPort: number;
  muxEnabled: boolean;
  muxConcurrency: number;
  muxXudp: boolean;
  fingerprint: string;
  fragmentEnabled: boolean;
  fragmentPackets: string;
  fragmentLength: string;
  fragmentInterval: string;
  dnsPrimary: string;
  dnsSecondary: string;
  dnsDoh: string;
  bypassLan: boolean;
  bypassIran: boolean;
  blockAds: boolean;
  sniffing: boolean;
  allowInsecure: boolean;
  udp: boolean;
  logLevel: "none" | "warning" | "info" | "debug";
  core: "xray" | "sing-box";
  domainStrategy: "AsIs" | "IPIfNonMatch" | "IPOnDemand";
  fakeDns: boolean;
  tunEnabled: boolean;
  tunStrictRoute: boolean;
}

export const DEFAULT_SETTINGS: ClientSettings = {
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
  tunStrictRoute: true,
};

export function emptyConfig(partial?: Partial<ProxyConfig>): ProxyConfig {
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
    ...partial,
  };
}
