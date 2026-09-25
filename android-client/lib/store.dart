import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'models.dart';

class AppStore {
  static const _key = "polaris.entries.v1";
  List<ConfigEntry> entries = [];

  Future<void> load() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_key);
    if (raw == null || raw.isEmpty) return;
    try {
      final list = jsonDecode(raw) as List;
      entries = list
          .whereType<Map>()
          .map((e) => ConfigEntry.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } catch (_) {
      entries = [];
    }
  }

  Future<void> save() async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_key, jsonEncode(entries.map((e) => e.toJson()).toList()));
  }
}
