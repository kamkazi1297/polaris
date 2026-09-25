import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import 'models.dart';

Future<ProbeResult> probeDelay(String host, int port) async {
  host = host.trim().replaceAll("[", "").replaceAll("]", "");
  if (host.isEmpty || port < 1 || port > 65535) {
    return ProbeResult(ok: false, error: "invalid");
  }
  String? ip;
  try {
    final list = await InternetAddress.lookup(host);
    ip = list.isNotEmpty ? list.first.address : null;
  } catch (_) {
    return ProbeResult(ok: false, error: "dns");
  }
  final geo = await _lookupGeo(ip ?? host);
  try {
    final sw = Stopwatch()..start();
    final socket = await Socket.connect(host, port, timeout: const Duration(milliseconds: 4500));
    sw.stop();
    socket.destroy();
    geo.ok = true;
    geo.delayMs = sw.elapsedMilliseconds;
    return geo;
  } on SocketException {
    geo.ok = false;
    geo.error = "connect";
    return geo;
  } catch (_) {
    geo.ok = false;
    geo.error = "timeout";
    return geo;
  }
}

Future<ProbeResult> _lookupGeo(String ip) async {
  final r = ProbeResult(ip: ip);
  try {
    final res = await http.get(Uri.parse("https://ipwho.is/${Uri.encodeComponent(ip)}")).timeout(const Duration(seconds: 6));
    if (res.statusCode != 200) return r;
    final o = jsonDecode(res.body);
    if (o is! Map) return r;
    if (o["success"] == false) return r;
    r.country = o["country"]?.toString();
    r.countryCode = o["country_code"]?.toString().toUpperCase();
    r.city = o["city"]?.toString();
    if (o["connection"] is Map) {
      final c = Map<String, dynamic>.from(o["connection"] as Map);
      r.isp = c["isp"]?.toString();
      r.org = c["org"]?.toString();
    }
  } catch (_) {}
  return r;
}
