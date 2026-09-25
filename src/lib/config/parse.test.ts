import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toSingbox, toUri } from "./encode.ts";
import { parseInput, typeLabel } from "./parse.ts";

describe("parseInput", () => {
  it("parses VLESS Reality URI", () => {
    const uri =
      "vless://11111111-2222-4333-8444-555555555555@1.1.1.1:443?type=tcp&security=reality&sni=www.microsoft.com&fp=chrome&pbk=YlKezM8V6cK0bYqK8oF9v3n1pQ2rS3tU4vW5xY6zA7B&sid=a1b2c3d4&flow=xtls-rprx-vision#demo";
    const [cfg] = parseInput(uri);
    assert.equal(cfg.protocol, "vless");
    assert.equal(cfg.address, "1.1.1.1");
    assert.equal(cfg.port, 443);
    assert.equal(cfg.tls, "reality");
    assert.equal(cfg.sni, "www.microsoft.com");
    assert.equal(cfg.publicKey.length > 10, true);
    assert.equal(cfg.flow, "xtls-rprx-vision");
    assert.match(typeLabel(cfg), /VLESS/);
    assert.match(typeLabel(cfg), /Reality/);
  });

  it("parses VMess share JSON and does not tag it as Napsternet", () => {
    const obj = {
      v: "2",
      ps: "vmess-demo",
      add: "8.8.8.8",
      port: "443",
      id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      aid: "0",
      net: "ws",
      type: "none",
      host: "www.example.com",
      path: "/ray",
      tls: "tls",
      sni: "www.example.com",
    };
    const uri = "vmess://" + Buffer.from(JSON.stringify(obj), "utf8").toString("base64");
    const [cfg] = parseInput(uri);
    assert.equal(cfg.protocol, "vmess");
    assert.equal(cfg.network, "ws");
    assert.equal(cfg.path, "/ray");
    assert.equal(cfg.source, "uri");
  });

  it("parses NapsternetV JSON via configType", () => {
    const raw = JSON.stringify({
      ps: "npv-node",
      add: "9.9.9.9",
      port: "443",
      id: "99999999-aaaa-4bbb-8ccc-dddddddddddd",
      net: "grpc",
      tls: "tls",
      sni: "www.gstatic.com",
      fp: "safari",
      protocol: "vless",
      configType: "vless",
      coreType: "xray",
      serviceName: "gun",
    });
    const [cfg] = parseInput(raw);
    assert.equal(cfg.protocol, "vless");
    assert.equal(cfg.source, "napsternet");
    assert.equal(cfg.network, "grpc");
    assert.equal(cfg.serviceName, "gun");
  });

  it("parses Trojan, SS, Hysteria2, TUIC, WireGuard", () => {
    const blob = [
      "trojan://secret@10.0.0.1:443?security=tls&sni=www.cloudflare.com&type=ws&path=/t#tr",
      "ss://YWVzLTI1Ni1nY206cGFzcw@1.0.0.1:8388#ssnode",
      "hy2://pw@2.2.2.2:443?sni=www.google.com&obfs=salamander&obfs-password=ob#hy",
      "tuic://uuid:pass@3.3.3.3:443?sni=www.apple.com&congestion_control=bbr#tu",
      "wireguard://privkey@4.4.4.4:51820?publickey=pubkey&mtu=1280&address=10.0.0.2/32#wg",
    ].join("\n");
    const list = parseInput(blob);
    assert.equal(list.length, 5);
    assert.equal(list[0].protocol, "trojan");
    assert.equal(list[0].tls, "tls");
    assert.equal(list[1].protocol, "ss");
    assert.equal(list[1].method, "aes-256-gcm");
    assert.equal(list[2].protocol, "hysteria2");
    assert.equal(list[2].extra.obfs, "salamander");
    assert.equal(list[3].protocol, "tuic");
    assert.equal(list[4].protocol, "wireguard");
    assert.equal(list[4].extra.peerPublicKey, "pubkey");
    assert.equal(list[4].extra.mtu, "1280");
  });

  it("parses Clash YAML proxies", () => {
    const yaml = `
proxies:
  - name: clash-vless
    type: vless
    server: 5.5.5.5
    port: 443
    uuid: 11111111-2222-4333-8444-555555555555
    tls: true
    servername: www.microsoft.com
    network: ws
    ws-opts:
      path: /vless
`;
    const list = parseInput(yaml);
    assert.equal(list.length >= 1, true);
    assert.equal(list[0].protocol, "vless");
    assert.equal(list[0].address, "5.5.5.5");
    assert.equal(list[0].source, "clash");
    assert.equal(list[0].network, "ws");
    assert.equal(list[0].path, "/vless");
    assert.equal(list[0].headerType, "none");
  });

  it("parses Xray outbound JSON", () => {
    const raw = JSON.stringify({
      outbounds: [
        {
          tag: "proxy",
          protocol: "vless",
          settings: {
            vnext: [
              {
                address: "6.6.6.6",
                port: 443,
                users: [{ id: "11111111-2222-4333-8444-555555555555", encryption: "none" }],
              },
            ],
          },
          streamSettings: {
            network: "tcp",
            security: "reality",
            realitySettings: {
              serverName: "www.microsoft.com",
              publicKey: "abc",
              shortId: "11",
              fingerprint: "chrome",
            },
          },
        },
        { protocol: "freedom", tag: "direct" },
      ],
    });
    const list = parseInput(raw);
    assert.equal(list.length, 1);
    assert.equal(list[0].protocol, "vless");
    assert.equal(list[0].tls, "reality");
    assert.equal(list[0].publicKey, "abc");
    assert.equal(list[0].source, "xray-json");
  });

  it("parses sing-box outbound", () => {
    const raw = JSON.stringify({
      outbounds: [
        {
          type: "hysteria2",
          tag: "hy",
          server: "7.7.7.7",
          server_port: 443,
          password: "x",
          tls: { enabled: true, server_name: "www.google.com" },
        },
      ],
    });
    const list = parseInput(raw);
    assert.equal(list.length, 1);
    assert.equal(list[0].protocol, "hysteria2");
    assert.equal(list[0].source, "singbox");
  });

  it("parses nested Napsternet servers array", () => {
    const raw = JSON.stringify({
      servers: [
        {
          remarks: "npv2",
          server: "8.8.4.4",
          server_port: 443,
          uuid: "11111111-2222-4333-8444-555555555555",
          protocol: "vless",
          configType: "vless",
          tls: "tls",
        },
      ],
    });
    const list = parseInput(raw);
    assert.equal(list.length, 1);
    assert.equal(list[0].source, "napsternet");
    assert.equal(list[0].address, "8.8.4.4");
  });

  it("parses base64 subscription of URIs", () => {
    const inner = "vless://11111111-2222-4333-8444-555555555555@1.2.3.4:443?security=tls&sni=a.com#one";
    const b64 = Buffer.from(inner, "utf8").toString("base64");
    const list = parseInput(b64);
    assert.equal(list.length, 1);
    assert.equal(list[0].address, "1.2.3.4");
  });

  it("round-trips a VLESS URI through toUri", () => {
    const uri =
      "vless://11111111-2222-4333-8444-555555555555@1.1.1.1:443?type=tcp&security=tls&sni=www.example.com&fp=chrome#round";
    const [cfg] = parseInput(uri);
    const again = parseInput(toUri(cfg));
    assert.equal(again[0].protocol, "vless");
    assert.equal(again[0].address, "1.1.1.1");
    assert.equal(again[0].sni, "www.example.com");
  });

  it("round-trips Hysteria2 obfs query", () => {
    const uri = "hy2://pw@2.2.2.2:443?sni=www.google.com&obfs=salamander&obfs-password=ob#hy";
    const [cfg] = parseInput(uri);
    const again = parseInput(toUri(cfg))[0];
    assert.equal(again.protocol, "hysteria2");
    assert.equal(again.extra.obfs, "salamander");
    assert.equal(again.extra["obfs-password"], "ob");
  });

  it("exports Hysteria2 as sing-box outbound not vnext", () => {
    const uri = "hy2://pw@2.2.2.2:443?sni=www.google.com#hy";
    const [cfg] = parseInput(uri);
    const json = JSON.parse(toSingbox(cfg)) as { outbounds: Array<{ type: string; password: string }> };
    assert.equal(json.outbounds[0].type, "hysteria2");
    assert.equal(json.outbounds[0].password, "pw");
  });
});
