import 'dart:convert';

import 'models.dart';

List<ProxyConfig> parseConfigs(String text) {
  final trimmed = text.trim();
  if (trimmed.isEmpty) return [];
  final out = <ProxyConfig>[];
  final seen = <String>{};

  void add(ProxyConfig? c) {
    if (c == null || c.address.trim().isEmpty) return;
    final key = "${c.protocol}|${c.address}|${c.port}|${c.uuid}|${c.password}";
    if (!seen.add(key)) return;
    if (c.remark.trim().isEmpty) c.remark = "${c.protocol} ${c.address}";
    out.add(c);
  }

  if (_tryJson(trimmed, add) && out.isNotEmpty) return out;

  final b64 = decodeB64(trimmed.replaceAll(RegExp(r"\s+"), ""));
  if (b64 != null && b64 != trimmed) {
    final inner = parseConfigs(b64);
    if (inner.isNotEmpty) return inner;
  }

  for (final line in trimmed.split(RegExp(r"[\r\n]+"))) {
    final t = line.trim();
    if (t.isEmpty || t.startsWith("#") || t.startsWith("//")) continue;
    if (t.startsWith("{") || t.startsWith("[")) {
      _tryJson(t, add);
      continue;
    }
    add(parseUri(t));
  }

  if (out.isEmpty) {
    for (final m in RegExp(r"[a-zA-Z][a-zA-Z0-9+.-]*://[^\s]+").allMatches(trimmed)) {
      add(parseUri(m.group(0)!));
    }
  }
  return out;
}

String? decodeB64(String raw) {
  var s = raw.trim().replaceAll("-", "+").replaceAll("_", "/");
  if (s.isEmpty) return null;
  s += "=" * ((4 - s.length % 4) % 4);
  try {
    return utf8.decode(base64.decode(s), allowMalformed: true);
  } catch (_) {
    return null;
  }
}

bool _tryJson(String s, void Function(ProxyConfig?) add) {
  try {
    final decoded = jsonDecode(s);
    _collectJson(decoded, s, add);
    return true;
  } catch (_) {
    return false;
  }
}

void _collectJson(dynamic el, String raw, void Function(ProxyConfig?) add) {
  if (el is List) {
    for (final item in el) {
      if (item is Map) add(_fromGeneric(Map<String, dynamic>.from(item), raw, _looksNap(item) ? "napsternet" : "xray-json"));
    }
    return;
  }
  if (el is! Map) return;
  final o = Map<String, dynamic>.from(el);
  if (o["outbounds"] is List) {
    for (final ob in o["outbounds"] as List) {
      if (ob is! Map) continue;
      final m = Map<String, dynamic>.from(ob);
      add(_fromXrayOutbound(m, raw) ?? _fromSingbox(m, raw));
    }
    return;
  }
  if (o["proxies"] is List) {
    for (final p in o["proxies"] as List) {
      if (p is Map) add(_fromGeneric(Map<String, dynamic>.from(p), raw, "clash"));
    }
    return;
  }
  if (o["servers"] is List) {
    for (final p in o["servers"] as List) {
      if (p is Map) add(_fromGeneric(Map<String, dynamic>.from(p), raw, _looksNap(p) ? "napsternet" : "xray-json"));
    }
    return;
  }
  add(_fromGeneric(o, raw, _looksNap(o) ? "napsternet" : "xray-json"));
}

bool _looksNap(dynamic o) {
  if (o is! Map) return false;
  return o.containsKey("npv") || o.containsKey("vpnType") || o.containsKey("configType") || o.containsKey("coreType");
}

ProxyConfig? parseUri(String uri) {
  uri = uri.trim();
  final schemeEnd = uri.indexOf("://");
  if (schemeEnd < 0) return null;
  var scheme = uri.substring(0, schemeEnd).toLowerCase();
  if (scheme == "vmess") return _parseVmess(uri);
  if (scheme == "ss" || scheme == "shadowsocks") return _parseSs(uri);

  final proto = _normProto(scheme == "hy2" ? "hysteria2" : scheme);
  var rest = uri.substring(schemeEnd + 3);
  final hash = rest.lastIndexOf("#");
  var remark = "";
  if (hash >= 0) {
    remark = Uri.decodeComponent(rest.substring(hash + 1));
    rest = rest.substring(0, hash);
  }
  final qIdx = rest.indexOf("?");
  final main = qIdx >= 0 ? rest.substring(0, qIdx) : rest;
  final q = qIdx >= 0 ? _query(rest.substring(qIdx)) : <String, String>{};

  var user = "";
  var hostport = main;
  final at = main.lastIndexOf("@");
  if (at >= 0) {
    user = Uri.decodeComponent(main.substring(0, at));
    hostport = main.substring(at + 1);
  }
  final hp = _splitHostPort(hostport);
  if (hp == null) return null;

  final cfg = ProxyConfig(
    remark: remark.isEmpty ? "$proto ${hp.$1}" : remark,
    protocol: proto,
    address: hp.$1,
    port: hp.$2,
    raw: uri,
    source: "uri",
  );
  if (proto == "vless" || proto == "vmess" || proto == "tuic") {
    final colon = user.indexOf(":");
    if (colon >= 0) {
      cfg.uuid = user.substring(0, colon);
      cfg.password = user.substring(colon + 1);
    } else {
      cfg.uuid = user;
      if (proto == "tuic") cfg.password = user;
    }
  } else {
    cfg.password = user;
    if (proto == "socks" || proto == "http") {
      final colon = user.indexOf(":");
      if (colon >= 0) {
        cfg.uuid = user.substring(0, colon);
        cfg.password = user.substring(colon + 1);
      }
    }
  }
  _applyQuery(cfg, q);
  if (cfg.sni.isEmpty && cfg.host.isNotEmpty) cfg.sni = cfg.host;
  return cfg;
}

ProxyConfig? _parseVmess(String uri) {
  final payload = uri.substring("vmess://".length);
  final decoded = decodeB64(payload);
  if (decoded == null) return null;
  try {
    final o = jsonDecode(decoded);
    if (o is Map) {
      final cfg = _fromGeneric(Map<String, dynamic>.from(o), uri, "uri");
      if (cfg != null) cfg.protocol = "vmess";
      return cfg;
    }
  } catch (_) {}
  return parseUri(uri.replaceFirst(RegExp(r"^vmess://", caseSensitive: false), "vless://"))
    ?..protocol = "vmess"
    ..raw = uri;
}

ProxyConfig? _parseSs(String uri) {
  var payload = uri.substring(uri.indexOf("://") + 3);
  final hash = payload.lastIndexOf("#");
  var remark = "";
  if (hash >= 0) {
    remark = Uri.decodeComponent(payload.substring(hash + 1));
    payload = payload.substring(0, hash);
  }
  final qIdx = payload.indexOf("?");
  Map<String, String>? q;
  if (qIdx >= 0) {
    q = _query(payload.substring(qIdx));
    payload = payload.substring(0, qIdx);
  }
  var userinfo = "";
  var hostport = payload;
  if (payload.contains("@")) {
    final at = payload.lastIndexOf("@");
    userinfo = payload.substring(0, at);
    hostport = payload.substring(at + 1);
    final dec = decodeB64(userinfo);
    if (dec != null && dec.contains(":")) {
      userinfo = dec;
    } else {
      userinfo = Uri.decodeComponent(userinfo);
    }
  } else {
    final dec = decodeB64(payload);
    if (dec != null && dec.contains("@")) {
      final at = dec.lastIndexOf("@");
      userinfo = dec.substring(0, at);
      hostport = dec.substring(at + 1);
    }
  }
  final hp = _splitHostPort(hostport);
  if (hp == null) return null;
  final colon = userinfo.indexOf(":");
  final cfg = ProxyConfig(
    remark: remark.isEmpty ? "SS ${hp.$1}" : remark,
    protocol: "ss",
    address: hp.$1,
    port: hp.$2,
    method: colon >= 0 ? userinfo.substring(0, colon) : "aes-256-gcm",
    password: colon >= 0 ? userinfo.substring(colon + 1) : userinfo,
    source: "uri",
    raw: uri,
  );
  if (q != null) _applyQuery(cfg, q);
  return cfg;
}

void _applyQuery(ProxyConfig cfg, Map<String, String> q) {
  String g(List<String> keys) {
    for (final k in keys) {
      final v = q[k];
      if (v != null && v.isNotEmpty) return v;
    }
    return "";
  }

  final type = g(["type", "net", "network"]);
  if (type.isNotEmpty) cfg.network = _normNet(type);
  final sec = g(["security", "tls"]);
  if (sec.isNotEmpty) cfg.tls = _normTls(sec);
  cfg.sni = _first(g(["sni", "serverName"]), cfg.sni);
  cfg.host = _first(g(["host", "authority"]), cfg.host);
  cfg.path = _first(g(["path"]), cfg.path);
  cfg.flow = _first(g(["flow"]), cfg.flow);
  cfg.fingerprint = _first(g(["fp", "fingerprint"]), cfg.fingerprint);
  cfg.alpn = _first(g(["alpn"]), cfg.alpn);
  cfg.publicKey = _first(g(["pbk", "publicKey", "public-key"]), cfg.publicKey);
  cfg.shortId = _first(g(["sid", "shortId", "short-id"]), cfg.shortId);
  cfg.spiderX = _first(g(["spx", "spiderX"]), cfg.spiderX);
  cfg.serviceName = _first(g(["serviceName", "servicename"]), cfg.serviceName);
  cfg.headerType = _first(g(["headerType", "headertype", "header"]), cfg.headerType);
  cfg.encryption = _first(g(["encryption"]), cfg.encryption);
  cfg.method = _first(g(["method", "scy"]), cfg.method);
  final insecure = g(["insecure", "allowInsecure", "allowinsecure"]);
  if (insecure == "1" || insecure == "true") cfg.allowInsecure = true;
  if (g(["mode"]).isNotEmpty) cfg.grpcMode = g(["mode"]);
  final obfs = g(["obfs"]);
  if (obfs.isNotEmpty) cfg.extra["obfs"] = obfs;
  if (cfg.publicKey.isNotEmpty && cfg.tls == "none") cfg.tls = "reality";
  if (g(["security"]).toLowerCase() == "reality") cfg.tls = "reality";
}

ProxyConfig? _fromGeneric(Map<String, dynamic> o, String raw, String source) {
  String p(List<String> keys) {
    for (final k in keys) {
      if (o[k] != null && "${o[k]}".isNotEmpty) return "${o[k]}".trim();
    }
    return "";
  }

  int n(List<String> keys, [int fb = 443]) {
    for (final k in keys) {
      final v = int.tryParse("${o[k] ?? ""}");
      if (v != null) return v;
    }
    return fb;
  }

  var proto = _normProto(p(["protocol", "type", "configType", "vpnType", "coreType"]));
  if (proto.isEmpty || proto == "unknown") proto = "vless";
  final cfg = ProxyConfig(
    remark: _first(p(["ps", "remarks", "name", "remark", "label"]), proto.toUpperCase()),
    protocol: proto,
    address: p(["add", "server", "address", "hostname", "ip", "host"]),
    port: n(["port", "server_port", "serverPort"]),
    uuid: p(["id", "uuid", "user", "username"]),
    password: p(["password", "passwd", "pass"]),
    alterId: n(["aid", "alterId"], 0),
    method: p(["scy", "method", "cipher", "encryption"]),
    network: _normNet(_first(p(["net", "network", "transport"]), "tcp")),
    host: p(["host", "wsHost", "authority"]),
    path: p(["path", "wsPath"]),
    tls: _normTls(p(["tls", "security", "streamSecurity"])),
    sni: p(["sni", "serverName", "peer", "server_name", "servername"]),
    alpn: p(["alpn"]),
    fingerprint: p(["fp", "fingerprint", "client-fingerprint"]),
    flow: p(["flow"]),
    publicKey: p(["pbk", "publicKey", "public_key", "public-key"]),
    shortId: p(["sid", "shortId", "short_id", "short-id"]),
    spiderX: p(["spx", "spiderX"]),
    serviceName: p(["serviceName", "service_name", "grpc-service-name"]),
    source: _looksNap(o) ? "napsternet" : source,
    raw: raw,
    allowInsecure: o["allowInsecure"] == true || o["insecure"] == true || o["skipCertVerify"] == true,
  );
  if (o["tls"] == true) cfg.tls = cfg.publicKey.isEmpty ? "tls" : "reality";
  if (cfg.publicKey.isNotEmpty && cfg.tls == "none") cfg.tls = "reality";
  if (cfg.sni.isEmpty && cfg.host.isNotEmpty) cfg.sni = cfg.host;
  if (cfg.network == "grpc" && cfg.serviceName.isEmpty && cfg.path.isNotEmpty) cfg.serviceName = cfg.path;
  return cfg.address.isEmpty ? null : cfg;
}

ProxyConfig? _fromXrayOutbound(Map<String, dynamic> ob, String raw) {
  final proto = "${ob["protocol"] ?? ""}";
  if (const {"freedom", "blackhole", "dns", "block", "direct"}.contains(proto)) return null;
  final settings = ob["settings"] is Map ? Map<String, dynamic>.from(ob["settings"] as Map) : <String, dynamic>{};
  final stream = ob["streamSettings"] is Map ? Map<String, dynamic>.from(ob["streamSettings"] as Map) : <String, dynamic>{};
  Map<String, dynamic>? vnext;
  Map<String, dynamic>? servers;
  if (settings["vnext"] is List && (settings["vnext"] as List).isNotEmpty) {
    vnext = Map<String, dynamic>.from((settings["vnext"] as List).first as Map);
  }
  if (settings["servers"] is List && (settings["servers"] as List).isNotEmpty) {
    servers = Map<String, dynamic>.from((settings["servers"] as List).first as Map);
  }
  Map<String, dynamic>? user;
  final usersSrc = vnext?["users"] ?? servers?["users"];
  if (usersSrc is List && usersSrc.isNotEmpty) user = Map<String, dynamic>.from(usersSrc.first as Map);
  final address = "${vnext?["address"] ?? servers?["address"] ?? ""}";
  if (address.isEmpty) return null;
  final port = int.tryParse("${vnext?["port"] ?? servers?["port"] ?? 443}") ?? 443;
  final tlsSet = stream["tlsSettings"] is Map
      ? Map<String, dynamic>.from(stream["tlsSettings"] as Map)
      : stream["realitySettings"] is Map
          ? Map<String, dynamic>.from(stream["realitySettings"] as Map)
          : <String, dynamic>{};
  final cfg = ProxyConfig(
    remark: _first("${ob["tag"] ?? ""}", address),
    protocol: _normProto(proto),
    address: address,
    port: port,
    uuid: _first("${user?["id"] ?? ""}", "${user?["uuid"] ?? ""}"),
    password: _first("${user?["password"] ?? ""}", "${settings["password"] ?? ""}"),
    flow: "${user?["flow"] ?? ""}",
    encryption: _first("${user?["encryption"] ?? ""}", "none"),
    network: _normNet(_first("${stream["network"] ?? ""}", "tcp")),
    tls: _normTls("${stream["security"] ?? ""}"),
    source: "xray-json",
    raw: raw,
  );
  cfg.sni = _first("${tlsSet["serverName"] ?? ""}", "${tlsSet["server_name"] ?? ""}");
  cfg.fingerprint = "${tlsSet["fingerprint"] ?? ""}";
  cfg.publicKey = _first("${tlsSet["publicKey"] ?? ""}", "${tlsSet["public_key"] ?? ""}");
  cfg.shortId = _first("${tlsSet["shortId"] ?? ""}", "${tlsSet["short_id"] ?? ""}");
  if (stream["wsSettings"] is Map) {
    final ws = Map<String, dynamic>.from(stream["wsSettings"] as Map);
    cfg.path = "${ws["path"] ?? ""}";
    if (ws["headers"] is Map) {
      final hd = Map<String, dynamic>.from(ws["headers"] as Map);
      cfg.host = _first("${hd["Host"] ?? ""}", "${hd["host"] ?? ""}");
    }
  }
  if (stream["grpcSettings"] is Map) {
    cfg.serviceName = "${(stream["grpcSettings"] as Map)["serviceName"] ?? ""}";
  }
  if (cfg.publicKey.isNotEmpty) cfg.tls = "reality";
  return cfg;
}

ProxyConfig? _fromSingbox(Map<String, dynamic> ob, String raw) {
  final type = "${ob["type"] ?? ""}";
  if (const {"", "direct", "block", "dns", "selector", "urltest"}.contains(type)) return null;
  final server = "${ob["server"] ?? ""}";
  if (server.isEmpty) return null;
  final tls = ob["tls"] is Map ? Map<String, dynamic>.from(ob["tls"] as Map) : <String, dynamic>{};
  final reality = tls["reality"] is Map ? Map<String, dynamic>.from(tls["reality"] as Map) : <String, dynamic>{};
  final transport = ob["transport"] is Map ? Map<String, dynamic>.from(ob["transport"] as Map) : <String, dynamic>{};
  final cfg = ProxyConfig(
    remark: _first("${ob["tag"] ?? ""}", "${ob["name"] ?? ""}", type),
    protocol: _normProto(type),
    address: server,
    port: int.tryParse("${ob["server_port"] ?? ob["port"] ?? 443}") ?? 443,
    uuid: "${ob["uuid"] ?? ""}",
    password: "${ob["password"] ?? ""}",
    flow: "${ob["flow"] ?? ""}",
    method: _first("${ob["method"] ?? ""}", "${ob["cipher"] ?? ""}"),
    network: _normNet(_first("${transport["type"] ?? ""}", "tcp")),
    path: "${transport["path"] ?? ""}",
    serviceName: "${transport["service_name"] ?? ""}",
    source: "singbox",
    raw: raw,
  );
  if (tls.isNotEmpty) {
    cfg.sni = "${tls["server_name"] ?? ""}";
    cfg.allowInsecure = tls["insecure"] == true;
    cfg.tls = reality["public_key"] != null && "${reality["public_key"]}".isNotEmpty
        ? "reality"
        : tls["enabled"] == true
            ? "tls"
            : "none";
    cfg.publicKey = "${reality["public_key"] ?? ""}";
    cfg.shortId = "${reality["short_id"] ?? ""}";
  }
  return cfg;
}

Map<String, String> _query(String qs) {
  final d = <String, String>{};
  var s = qs.startsWith("?") ? qs.substring(1) : qs;
  for (final part in s.split("&")) {
    if (part.isEmpty) continue;
    final eq = part.indexOf("=");
    final key = Uri.decodeQueryComponent(eq < 0 ? part : part.substring(0, eq));
    final val = eq < 0 ? "" : Uri.decodeQueryComponent(part.substring(eq + 1));
    d[key] = val;
  }
  return d;
}

(String, int)? _splitHostPort(String hostport) {
  var host = hostport.trim();
  var port = 443;
  if (host.startsWith("[")) {
    final end = host.indexOf("]");
    if (end < 0) return null;
    final inside = host.substring(1, end);
    final rest = host.substring(end + 1);
    host = inside;
    if (rest.startsWith(":")) port = int.tryParse(rest.substring(1)) ?? 443;
  } else {
    final colon = host.lastIndexOf(":");
    if (colon > 0) {
      port = int.tryParse(host.substring(colon + 1)) ?? 443;
      host = host.substring(0, colon);
    }
  }
  if (host.isEmpty) return null;
  return (host, port);
}

String _first(String a, [String b = "", String c = ""]) {
  if (a.isNotEmpty) return a;
  if (b.isNotEmpty) return b;
  return c;
}

String _normProto(String v) {
  v = v.toLowerCase().replaceAll(RegExp(r"[^a-z0-9]"), "");
  switch (v) {
    case "shadowsocks":
    case "shadowsocks2022":
    case "ss":
      return "ss";
    case "hy2":
    case "hysteria2":
      return "hysteria2";
    case "hy":
    case "hysteria":
      return "hysteria";
    case "wg":
    case "wireguard":
      return "wireguard";
    case "socks5":
    case "socks4":
    case "socks":
      return "socks";
    case "https":
    case "http":
      return "http";
    case "ssr":
    case "shadowsocksr":
      return "ssr";
    case "tuic":
    case "tuicv5":
      return "tuic";
    case "vmess":
      return "vmess";
    case "vless":
      return "vless";
    case "trojan":
      return "trojan";
    case "anytls":
      return "anytls";
    default:
      return v.isEmpty ? "unknown" : v;
  }
}

String _normNet(String v) {
  v = v.toLowerCase();
  switch (v) {
    case "websocket":
      return "ws";
    case "httpupgrade":
    case "http_upgrade":
      return "httpupgrade";
    case "h2":
    case "http2":
      return "h2";
    case "grpc":
    case "gun":
      return "grpc";
    case "kcp":
    case "mkcp":
      return "kcp";
    default:
      return v.isEmpty ? "tcp" : v;
  }
}

String _normTls(String v) {
  v = v.toLowerCase();
  if (v == "reality") return "reality";
  if (v == "xtls") return "xtls";
  if (v == "tls" || v == "true" || v == "1") return "tls";
  return "none";
}

String toUri(ProxyConfig c) {
  final remark = c.remark.isEmpty ? "" : "#${Uri.encodeComponent(c.remark)}";
  if (c.protocol == "vmess") {
    final obj = {
      "v": "2",
      "ps": c.remark,
      "add": c.address,
      "port": "${c.port}",
      "id": c.uuid,
      "aid": "${c.alterId}",
      "scy": c.method.isEmpty ? "auto" : c.method,
      "net": c.network,
      "type": c.headerType.isEmpty ? "none" : c.headerType,
      "host": c.host,
      "path": c.path,
      "tls": c.tls == "none" ? "" : c.tls,
      "sni": c.sni,
      "alpn": c.alpn,
      "fp": c.fingerprint,
      "pbk": c.publicKey,
      "sid": c.shortId,
      "spx": c.spiderX,
      "flow": c.flow,
    };
    return "vmess://${base64.encode(utf8.encode(jsonEncode(obj)))}$remark";
  }
  if (c.protocol == "ss") {
    final user = base64.encode(utf8.encode("${c.method.isEmpty ? "aes-256-gcm" : c.method}:${c.password}"));
    return "ss://$user@${c.address}:${c.port}$remark";
  }
  final q = <String>[];
  void add(String k, String v) {
    if (v.isNotEmpty) q.add("$k=${Uri.encodeComponent(v)}");
  }

  add("type", c.network);
  add("security", c.tls.isEmpty ? "none" : c.tls);
  add("sni", c.sni);
  add("host", c.host);
  add("path", c.path);
  add("flow", c.flow);
  add("fp", c.fingerprint);
  add("alpn", c.alpn);
  add("pbk", c.publicKey);
  add("sid", c.shortId);
  add("spx", c.spiderX);
  add("serviceName", c.serviceName);
  if (c.encryption.isNotEmpty && c.encryption != "none") add("encryption", c.encryption);
  if (c.allowInsecure) add("allowInsecure", "1");
  var userinfo = (c.protocol == "vless" || c.protocol == "tuic") ? c.uuid : c.password;
  if (c.protocol == "tuic" && c.password.isNotEmpty) userinfo = "${c.uuid}:${c.password}";
  final qs = q.isEmpty ? "" : "?${q.join("&")}";
  final scheme = c.protocol == "hysteria2" ? "hy2" : c.protocol;
  return "$scheme://$userinfo@${c.address}:${c.port}$qs$remark";
}
