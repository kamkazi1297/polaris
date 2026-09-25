import 'dart:convert';

import 'models.dart';

String xrayFullConfig(ProxyConfig c, [ClientSettings? settings]) {
  final s = settings ?? ClientSettings();
  final outbound = _outbound(c, s);
  final rules = <Map<String, dynamic>>[];
  if (s.bypassLan) {
    rules.add({
      "type": "field",
      "ip": ["geoip:private"],
      "outboundTag": "direct",
    });
  }
  if (s.bypassIran) {
    rules.add({
      "type": "field",
      "domain": ["geosite:ir"],
      "outboundTag": "direct",
    });
    rules.add({
      "type": "field",
      "ip": ["geoip:ir"],
      "outboundTag": "direct",
    });
  }
  if (s.blockAds) {
    rules.add({
      "type": "field",
      "domain": ["geosite:category-ads-all"],
      "outboundTag": "block",
    });
  }
  rules.add({
    "type": "field",
    "inboundTag": ["socks"],
    "outboundTag": "proxy",
  });

  return const JsonEncoder.withIndent("  ").convert({
    "log": {"loglevel": "warning"},
    "dns": {
      "servers": [
        if (s.dnsPrimary.isNotEmpty) s.dnsPrimary,
        if (s.dnsSecondary.isNotEmpty) s.dnsSecondary,
      ],
    },
    "inbounds": [
      {
        "tag": "socks",
        "port": 10808,
        "listen": "127.0.0.1",
        "protocol": "socks",
        "settings": {"udp": true, "auth": "noauth"},
        "sniffing": {
          "enabled": true,
          "destOverride": ["http", "tls", "quic"],
        },
      },
    ],
    "outbounds": [
      outbound,
      {"tag": "direct", "protocol": "freedom"},
      {"tag": "block", "protocol": "blackhole"},
    ],
    "routing": {
      "domainStrategy": "IPIfNonMatch",
      "rules": rules,
    },
  });
}

Map<String, dynamic> _outbound(ProxyConfig c, ClientSettings s) {
  late Map<String, dynamic> settings;
  late String proto;
  if (c.protocol == "ss") {
    proto = "shadowsocks";
    settings = {
      "servers": [
        {
          "address": c.address,
          "port": c.port,
          "method": c.method.isEmpty ? "aes-256-gcm" : c.method,
          "password": c.password,
        }
      ]
    };
  } else if (c.protocol == "trojan") {
    proto = "trojan";
    settings = {
      "servers": [
        {"address": c.address, "port": c.port, "password": c.password}
      ]
    };
  } else if (c.protocol == "socks" || c.protocol == "http") {
    proto = c.protocol;
    settings = {
      "servers": [
        {
          "address": c.address,
          "port": c.port,
          if (c.password.isNotEmpty)
            "users": [
              {"user": c.uuid, "pass": c.password}
            ]
        }
      ]
    };
  } else if (c.protocol == "vmess") {
    proto = "vmess";
    settings = {
      "vnext": [
        {
          "address": c.address,
          "port": c.port,
          "users": [
            {
              "id": c.uuid.isEmpty ? c.password : c.uuid,
              "alterId": c.alterId,
              "security": c.method.isEmpty ? "auto" : c.method,
            }
          ]
        }
      ]
    };
  } else {
    proto = "vless";
    settings = {
      "vnext": [
        {
          "address": c.address,
          "port": c.port,
          "users": [
            {
              "id": c.uuid.isEmpty ? c.password : c.uuid,
              "encryption": c.encryption.isEmpty ? "none" : c.encryption,
              if (c.flow.isNotEmpty) "flow": c.flow,
            }
          ]
        }
      ]
    };
  }

  final fp = c.fingerprint.isEmpty ? s.fingerprint : c.fingerprint;
  final stream = <String, dynamic>{
    "network": c.network.isEmpty ? "tcp" : c.network,
    "security": c.tls == "none" ? "none" : c.tls,
  };
  if (c.tls == "tls" || c.tls == "xtls") {
    stream["tlsSettings"] = {
      "serverName": c.sni,
      "allowInsecure": c.allowInsecure,
      if (fp.isNotEmpty) "fingerprint": fp,
      if (c.alpn.isNotEmpty) "alpn": c.alpn.split(","),
    };
  }
  if (c.tls == "reality") {
    stream["realitySettings"] = {
      "serverName": c.sni,
      "fingerprint": fp.isEmpty ? "chrome" : fp,
      "publicKey": c.publicKey,
      "shortId": c.shortId,
      "spiderX": c.spiderX.isEmpty ? "/" : c.spiderX,
    };
  }
  if (c.network == "ws") {
    stream["wsSettings"] = {
      "path": c.path.isEmpty ? "/" : c.path,
      if (c.host.isNotEmpty) "headers": {"Host": c.host},
    };
  }
  if (c.network == "grpc") {
    stream["grpcSettings"] = {
      "serviceName": c.serviceName,
      "multiMode": c.grpcMode == "multi",
    };
  }
  if (c.network == "h2" || c.network == "http") {
    stream["httpSettings"] = {
      "path": c.path.isEmpty ? "/" : c.path,
      "host": c.host.isEmpty ? <String>[] : [c.host],
    };
  }
  if (c.network == "xhttp" || c.network == "splithttp") {
    stream["xhttpSettings"] = {
      "path": c.path.isEmpty ? "/" : c.path,
      "host": c.host,
      "mode": c.extra["xhttpMode"] ?? "auto",
    };
  }
  if (c.network == "httpupgrade") {
    stream["httpupgradeSettings"] = {
      "path": c.path.isEmpty ? "/" : c.path,
      "host": c.host,
    };
  }
  if (s.fragmentEnabled) {
    stream["sockopt"] = {
      "dialerProxy": "",
      "tcpNoDelay": true,
    };
  }

  final out = <String, dynamic>{
    "tag": "proxy",
    "protocol": proto,
    "settings": settings,
    "streamSettings": stream,
  };
  if (s.muxEnabled && c.flow.isEmpty) {
    out["mux"] = {"enabled": true, "concurrency": s.muxConcurrency};
  }
  return out;
}

