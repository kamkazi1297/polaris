class ProxyConfig {
  String id;
  String remark;
  String protocol;
  String address;
  int port;
  String uuid;
  String password;
  int alterId;
  String method;
  String flow;
  String encryption;
  String network;
  String headerType;
  String host;
  String path;
  String serviceName;
  String grpcMode;
  String tls;
  String sni;
  String alpn;
  String fingerprint;
  bool allowInsecure;
  String publicKey;
  String shortId;
  String spiderX;
  Map<String, String> extra;
  String source;
  String raw;
  String group;

  ProxyConfig({
    String? id,
    this.remark = "",
    this.protocol = "vless",
    this.address = "",
    this.port = 443,
    this.uuid = "",
    this.password = "",
    this.alterId = 0,
    this.method = "",
    this.flow = "",
    this.encryption = "none",
    this.network = "tcp",
    this.headerType = "none",
    this.host = "",
    this.path = "",
    this.serviceName = "",
    this.grpcMode = "gun",
    this.tls = "none",
    this.sni = "",
    this.alpn = "",
    this.fingerprint = "",
    this.allowInsecure = false,
    this.publicKey = "",
    this.shortId = "",
    this.spiderX = "",
    Map<String, String>? extra,
    this.source = "uri",
    this.raw = "",
    this.group = "",
  })  : id = id ?? DateTime.now().microsecondsSinceEpoch.toString(),
        extra = extra ?? {};

  Map<String, dynamic> toJson() => {
        "id": id,
        "remark": remark,
        "protocol": protocol,
        "address": address,
        "port": port,
        "uuid": uuid,
        "password": password,
        "alterId": alterId,
        "method": method,
        "flow": flow,
        "encryption": encryption,
        "network": network,
        "headerType": headerType,
        "host": host,
        "path": path,
        "serviceName": serviceName,
        "grpcMode": grpcMode,
        "tls": tls,
        "sni": sni,
        "alpn": alpn,
        "fingerprint": fingerprint,
        "allowInsecure": allowInsecure,
        "publicKey": publicKey,
        "shortId": shortId,
        "spiderX": spiderX,
        "extra": extra,
        "source": source,
        "raw": raw,
        "group": group,
      };

  factory ProxyConfig.fromJson(Map<String, dynamic> j) {
    final extraRaw = j["extra"];
    return ProxyConfig(
      id: "${j["id"] ?? ""}",
      remark: "${j["remark"] ?? ""}",
      protocol: "${j["protocol"] ?? "vless"}",
      address: "${j["address"] ?? ""}",
      port: int.tryParse("${j["port"]}") ?? 443,
      uuid: "${j["uuid"] ?? ""}",
      password: "${j["password"] ?? ""}",
      alterId: int.tryParse("${j["alterId"]}") ?? 0,
      method: "${j["method"] ?? ""}",
      flow: "${j["flow"] ?? ""}",
      encryption: "${j["encryption"] ?? "none"}",
      network: "${j["network"] ?? "tcp"}",
      headerType: "${j["headerType"] ?? "none"}",
      host: "${j["host"] ?? ""}",
      path: "${j["path"] ?? ""}",
      serviceName: "${j["serviceName"] ?? ""}",
      grpcMode: "${j["grpcMode"] ?? "gun"}",
      tls: "${j["tls"] ?? "none"}",
      sni: "${j["sni"] ?? ""}",
      alpn: "${j["alpn"] ?? ""}",
      fingerprint: "${j["fingerprint"] ?? ""}",
      allowInsecure: j["allowInsecure"] == true,
      publicKey: "${j["publicKey"] ?? ""}",
      shortId: "${j["shortId"] ?? ""}",
      spiderX: "${j["spiderX"] ?? ""}",
      extra: extraRaw is Map ? extraRaw.map((k, v) => MapEntry("$k", "$v")) : {},
      source: "${j["source"] ?? "uri"}",
      raw: "${j["raw"] ?? ""}",
      group: "${j["group"] ?? ""}",
    );
  }
}

class ProbeResult {
  bool ok;
  int? delayMs;
  String? error;
  String? ip;
  String? country;
  String? countryCode;
  String? city;
  String? isp;
  String? org;

  ProbeResult({
    this.ok = false,
    this.delayMs,
    this.error,
    this.ip,
    this.country,
    this.countryCode,
    this.city,
    this.isp,
    this.org,
  });

  Map<String, dynamic> toJson() => {
        "ok": ok,
        "delayMs": delayMs,
        "error": error,
        "ip": ip,
        "country": country,
        "countryCode": countryCode,
        "city": city,
        "isp": isp,
        "org": org,
      };

  factory ProbeResult.fromJson(Map<String, dynamic> j) => ProbeResult(
        ok: j["ok"] == true,
        delayMs: j["delayMs"] is int ? j["delayMs"] as int : int.tryParse("${j["delayMs"] ?? ""}"),
        error: j["error"]?.toString(),
        ip: j["ip"]?.toString(),
        country: j["country"]?.toString(),
        countryCode: j["countryCode"]?.toString(),
        city: j["city"]?.toString(),
        isp: j["isp"]?.toString(),
        org: j["org"]?.toString(),
      );
}

class Diagnosis {
  final String status;
  final String title;
  final String detail;
  Diagnosis({required this.status, required this.title, required this.detail});
}

class SecurityReport {
  final String level;
  final String label;
  final List<String> reasons;
  SecurityReport({required this.level, required this.label, required this.reasons});
}

class ConfigEntry {
  ProxyConfig config;
  ProbeResult? probe;
  String health;
  ConfigEntry({required this.config, this.probe, this.health = "unknown"});

  Map<String, dynamic> toJson() => {
        "config": config.toJson(),
        "probe": probe?.toJson(),
        "health": health,
      };

  factory ConfigEntry.fromJson(Map<String, dynamic> j) => ConfigEntry(
        config: ProxyConfig.fromJson(Map<String, dynamic>.from(j["config"] as Map)),
        probe: j["probe"] is Map ? ProbeResult.fromJson(Map<String, dynamic>.from(j["probe"] as Map)) : null,
        health: "${j["health"] ?? "unknown"}",
      );
}

class Subscription {
  String id;
  String name;
  String url;
  String? lastUpdate;

  Subscription({String? id, this.name = "", this.url = "", this.lastUpdate})
      : id = id ?? DateTime.now().microsecondsSinceEpoch.toString();

  Map<String, dynamic> toJson() => {
        "id": id,
        "name": name,
        "url": url,
        "lastUpdate": lastUpdate,
      };

  factory Subscription.fromJson(Map<String, dynamic> j) => Subscription(
        id: "${j["id"] ?? ""}",
        name: "${j["name"] ?? ""}",
        url: "${j["url"] ?? ""}",
        lastUpdate: j["lastUpdate"]?.toString(),
      );
}

class ClientSettings {
  bool muxEnabled;
  int muxConcurrency;
  bool fragmentEnabled;
  String dnsPrimary;
  String dnsSecondary;
  bool bypassLan;
  bool bypassIran;
  bool blockAds;
  String fingerprint;

  ClientSettings({
    this.muxEnabled = false,
    this.muxConcurrency = 8,
    this.fragmentEnabled = false,
    this.dnsPrimary = "1.1.1.1",
    this.dnsSecondary = "8.8.8.8",
    this.bypassLan = true,
    this.bypassIran = true,
    this.blockAds = false,
    this.fingerprint = "chrome",
  });

  Map<String, dynamic> toJson() => {
        "muxEnabled": muxEnabled,
        "muxConcurrency": muxConcurrency,
        "fragmentEnabled": fragmentEnabled,
        "dnsPrimary": dnsPrimary,
        "dnsSecondary": dnsSecondary,
        "bypassLan": bypassLan,
        "bypassIran": bypassIran,
        "blockAds": blockAds,
        "fingerprint": fingerprint,
      };

  factory ClientSettings.fromJson(Map<String, dynamic> j) => ClientSettings(
        muxEnabled: j["muxEnabled"] == true,
        muxConcurrency: int.tryParse("${j["muxConcurrency"]}") ?? 8,
        fragmentEnabled: j["fragmentEnabled"] == true,
        dnsPrimary: "${j["dnsPrimary"] ?? "1.1.1.1"}",
        dnsSecondary: "${j["dnsSecondary"] ?? "8.8.8.8"}",
        bypassLan: j["bypassLan"] != false,
        bypassIran: j["bypassIran"] != false,
        blockAds: j["blockAds"] == true,
        fingerprint: "${j["fingerprint"] ?? "chrome"}",
      );
}

String protocolLabel(String p) {
  switch (p) {
    case "vless":
      return "VLESS";
    case "vmess":
      return "VMess";
    case "trojan":
      return "Trojan";
    case "ss":
      return "Shadowsocks";
    case "ssr":
      return "ShadowsocksR";
    case "hysteria2":
      return "Hysteria2";
    case "hysteria":
      return "Hysteria";
    case "tuic":
      return "TUIC";
    case "wireguard":
      return "WireGuard";
    case "socks":
      return "SOCKS";
    case "http":
      return "HTTP";
    case "anytls":
      return "AnyTLS";
    default:
      return p;
  }
}

String typeLabel(ProxyConfig c) {
  final parts = <String>[protocolLabel(c.protocol)];
  if (c.network.isNotEmpty && c.network != "tcp") parts.add(c.network.toUpperCase());
  if (c.tls == "reality") {
    parts.add("Reality");
  } else if (c.tls == "tls") {
    parts.add("TLS");
  } else if (c.tls == "xtls") {
    parts.add("XTLS");
  }
  return parts.join(" · ");
}

bool needsSingbox(ProxyConfig c) =>
    const {"hysteria2", "hysteria", "tuic", "wireguard", "anytls"}.contains(c.protocol);

bool canVpn(ProxyConfig c) =>
    const {"vless", "vmess", "trojan", "ss", "socks", "http"}.contains(c.protocol);
