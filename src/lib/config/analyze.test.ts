import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeSecurity, diagnose, isIranLocation } from "./analyze.ts";
import { claimedCountry } from "./countries.ts";
import { emptyConfig } from "./types.ts";

describe("diagnose", () => {
  it("flags missing UUID as invalid", () => {
    const cfg = emptyConfig({ protocol: "vless", address: "1.1.1.1", port: 443, uuid: "" });
    const d = diagnose(cfg);
    assert.equal(d.status, "invalid");
  });

  it("flags Iran in the remark as broken before a probe", () => {
    const cfg = emptyConfig({
      protocol: "http",
      address: "example.ir",
      port: 80,
      remark: "نمونه · ایران",
    });
    const d = diagnose(cfg);
    assert.equal(d.status, "broken");
    assert.match(d.title, /مشکل/);
  });

  it("flags an IR geo result as broken even if the name says Germany", () => {
    const cfg = emptyConfig({
      protocol: "vmess",
      address: "1.2.3.4",
      port: 443,
      uuid: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      remark: "آلمان",
    });
    const d = diagnose(cfg, {
      ok: true,
      delayMs: 40,
      countryCode: "IR",
      country: "Iran",
      city: "Tehran",
    });
    assert.equal(d.status, "broken");
  });

  it("warns when claimed country does not match probe", () => {
    const cfg = emptyConfig({
      protocol: "vless",
      address: "1.1.1.1",
      port: 443,
      uuid: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      remark: "Germany DE",
      tls: "tls",
    });
    const d = diagnose(cfg, {
      ok: true,
      delayMs: 80,
      countryCode: "US",
      country: "United States",
    });
    assert.equal(d.status, "warn");
  });

  it("returns ok with location when probe matches", () => {
    const cfg = emptyConfig({
      protocol: "vless",
      address: "1.1.1.1",
      port: 443,
      uuid: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
      remark: "CF",
      tls: "reality",
      publicKey: "abc",
    });
    const d = diagnose(cfg, { ok: true, delayMs: 30, countryCode: "AU", country: "Australia" });
    assert.equal(d.status, "ok");
  });
});

describe("isIranLocation", () => {
  it("detects IR country code and Iranian ISPs", () => {
    assert.equal(isIranLocation({ ok: true, delayMs: 10, countryCode: "IR" }), true);
    assert.equal(
      isIranLocation({ ok: true, delayMs: 10, countryCode: "DE", isp: "Shatel Information Corporation" }),
      true,
    );
    assert.equal(isIranLocation({ ok: true, delayMs: 10, countryCode: "NL", isp: "Cloudflare" }), false);
  });
});

describe("analyzeSecurity", () => {
  it("rates Reality as high", () => {
    const r = analyzeSecurity(
      emptyConfig({
        protocol: "vless",
        tls: "reality",
        publicKey: "pk",
        uuid: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        fingerprint: "chrome",
        flow: "xtls-rprx-vision",
      }),
    );
    assert.equal(r.level, "high");
    assert.match(r.label, /بالا/);
  });

  it("rates weak Shadowsocks as low", () => {
    const r = analyzeSecurity(
      emptyConfig({ protocol: "ss", method: "rc4-md5", password: "x", address: "1.1.1.1" }),
    );
    assert.equal(r.level, "low");
  });

  it("rates HTTP as none", () => {
    const r = analyzeSecurity(emptyConfig({ protocol: "http", address: "1.1.1.1", port: 80 }));
    assert.equal(r.level, "none");
  });
});

describe("claimedCountry", () => {
  it("does not treat Ukraine as UK", () => {
    assert.equal(claimedCountry("Ukraine node"), "UA");
    assert.equal(claimedCountry("UK London"), "GB");
  });
});
