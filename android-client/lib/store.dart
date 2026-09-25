import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

class AppStore {
  static const _key = "polaris.state.v2";
  List<ConfigEntry> entries = [];
  List<Subscription> subs = [];
  ClientSettings settings = ClientSettings();
  String sortMode = "valid";

  static String dupKey(ProxyConfig c) =>
      "${c.protocol}|${c.address}|${c.port}|${c.uuid}|${c.password}";

  Future<void> load() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_key) ?? p.getString("polaris.entries.v1");
    if (raw == null || raw.isEmpty) return;
    try {
      final data = jsonDecode(raw);
      if (data is List) {
        entries = data
            .whereType<Map>()
            .map((e) => ConfigEntry.fromJson(Map<String, dynamic>.from(e)))
            .toList();
        return;
      }
      if (data is Map) {
        final list = data["entries"];
        if (list is List) {
          entries = list
              .whereType<Map>()
              .map((e) => ConfigEntry.fromJson(Map<String, dynamic>.from(e)))
              .toList();
        }
        final sl = data["subs"];
        if (sl is List) {
          subs = sl
              .whereType<Map>()
              .map((e) => Subscription.fromJson(Map<String, dynamic>.from(e)))
              .toList();
        }
        if (data["settings"] is Map) {
          settings = ClientSettings.fromJson(Map<String, dynamic>.from(data["settings"] as Map));
        }
        sortMode = "${data["sortMode"] ?? "valid"}";
      }
    } catch (_) {
      entries = [];
    }
  }

  Future<void> save() async {
    final p = await SharedPreferences.getInstance();
    await p.setString(
      _key,
      jsonEncode({
        "entries": entries.map((e) => e.toJson()).toList(),
        "subs": subs.map((e) => e.toJson()).toList(),
        "settings": settings.toJson(),
        "sortMode": sortMode,
      }),
    );
  }

  int removeDuplicates() {
    final seen = <String>{};
    final keep = <ConfigEntry>[];
    for (final e in entries) {
      if (seen.add(dupKey(e.config))) keep.add(e);
    }
    final n = entries.length - keep.length;
    entries = keep;
    return n;
  }

  int removeDead() {
    final n = entries.where((e) => e.health == "dead" || e.health == "invalid").length;
    entries.removeWhere((e) => e.health == "dead" || e.health == "invalid");
    return n;
  }

  void sortEntries() {
    int rank(String h) => switch (h) {
          "ok" => 0,
          "warn" => 1,
          "unknown" => 2,
          "dead" => 3,
          "broken" => 4,
          "invalid" => 5,
          _ => 6,
        };
    entries.sort((a, b) {
      if (sortMode == "delay") {
        return (a.probe?.delayMs ?? 1 << 30).compareTo(b.probe?.delayMs ?? 1 << 30);
      }
      if (sortMode == "name") {
        return a.config.remark.toLowerCase().compareTo(b.config.remark.toLowerCase());
      }
      final r = rank(a.health).compareTo(rank(b.health));
      if (r != 0) return r;
      return (a.probe?.delayMs ?? 1 << 30).compareTo(b.probe?.delayMs ?? 1 << 30);
    });
  }

  int upsertParsed(List<ProxyConfig> parsed, {String group = ""}) {
    final existing = entries.map((e) => dupKey(e.config)).toSet();
    var n = 0;
    for (final c in parsed) {
      if (group.isNotEmpty) c.group = group;
      if (!existing.add(dupKey(c))) continue;
      entries.insert(0, ConfigEntry(config: c, health: "unknown"));
      n++;
    }
    return n;
  }

  void replaceGroup(String group, List<ProxyConfig> parsed) {
    entries.removeWhere((e) => e.config.group == group);
    final existing = entries.map((e) => dupKey(e.config)).toSet();
    for (final c in parsed) {
      c.group = group;
      if (!existing.add(dupKey(c))) continue;
      entries.add(ConfigEntry(config: c, health: "unknown"));
    }
  }
}
