import { toUri } from "./encode.ts";
import { emptyConfig, type ProxyConfig } from "./types.ts";

function sample(partial: Partial<ProxyConfig>): ProxyConfig {
  const cfg = emptyConfig(partial);
  cfg.raw = toUri(cfg);
  return cfg;
}

export function sampleConfigs(): ProxyConfig[] {
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
    source: "uri",
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
    source: "uri",
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
    source: "uri",
  });

  const ss = sample({
    id: "sample-ss",
    remark: "نمونه · Shadowsocks",
    protocol: "ss",
    address: "1.0.0.1",
    port: 443,
    method: "chacha20-ietf-poly1305",
    password: "ss-demo-key",
    source: "uri",
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
    source: "uri",
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
    source: "napsternet",
  });
  npv.raw = JSON.stringify(
    {
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
      serviceName: "gun",
    },
    null,
    2,
  );

  const invalid = sample({
    id: "sample-invalid",
    remark: "نمونه · ناقص",
    protocol: "vless",
    address: "example.invalid",
    port: 443,
    uuid: "",
    tls: "reality",
    sni: "www.microsoft.com",
    source: "uri",
  });

  const namedIran = sample({
    id: "sample-http-iran",
    remark: "نمونه · ایران · HTTP",
    protocol: "http",
    address: "example.ir",
    port: 80,
    source: "uri",
  });

  return [vless, trojan, hy2, ss, iran, npv, namedIran, invalid];
}
