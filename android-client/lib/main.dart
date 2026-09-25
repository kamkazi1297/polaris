import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_v2ray_client/flutter_v2ray.dart';
import 'package:http/http.dart' as http;

import 'analyzer.dart';
import 'models.dart';
import 'parser.dart';
import 'probe.dart';
import 'store.dart';
import 'xray.dart';

const bg = Color(0xFF0B0C0E);
const surface = Color(0xFF14161A);
const fg = Color(0xFFE8EAED);
const muted = Color(0xFF8B909A);
const accent = Color(0xFFC5CCD6);
const bad = Color(0xFFD17A7A);
const ok = Color(0xFF7DBA9A);

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const PolarisApp());
}

class PolarisApp extends StatelessWidget {
  const PolarisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "پولاریس",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: bg,
        colorScheme: const ColorScheme.dark(
          surface: surface,
          primary: accent,
          onPrimary: bg,
          onSurface: fg,
        ),
        fontFamily: "sans-serif",
        useMaterial3: true,
      ),
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final store = AppStore();
  final v2ray = V2ray(onStatusChanged: (_) {});
  bool ready = false;
  bool busy = false;
  bool connected = false;
  String? activeId;
  String status = "آماده";
  ConfigEntry? selected;
  String filter = "all";

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    await store.load();
    try {
      await v2ray.initialize(
        notificationIconResourceType: "mipmap",
        notificationIconResourceName: "ic_launcher",
      );
    } catch (_) {}
    if (store.entries.isNotEmpty) selected = store.entries.first;
    setState(() {
      ready = true;
      status = "${store.entries.length} کانفیگ";
    });
  }

  Future<void> _persist() async {
    await store.save();
    setState(() {});
  }

  Future<void> _importText(String raw) async {
    raw = raw.trim();
    if (raw.isEmpty) return;
    setState(() => busy = true);
    try {
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        setState(() => status = "در حال دریافت سابسکریپشن…");
        final res = await http.get(Uri.parse(raw.split("\n").first.trim()), headers: {
          "User-Agent": "Polaris/1.2",
        }).timeout(const Duration(seconds: 20));
        raw = res.body;
      }
      final parsed = parseConfigs(raw);
      if (parsed.isEmpty) {
        _toast("هیچ کانفیگ معتبری پیدا نشد.");
        return;
      }
      final existing = store.entries
          .map((e) => "${e.config.protocol}|${e.config.address}|${e.config.port}|${e.config.uuid}|${e.config.password}")
          .toSet();
      var n = 0;
      for (final c in parsed) {
        final key = "${c.protocol}|${c.address}|${c.port}|${c.uuid}|${c.password}";
        if (!existing.add(key)) continue;
        store.entries.insert(0, ConfigEntry(config: c, health: diagnose(c, null).status));
        n++;
      }
      selected = store.entries.first;
      await _persist();
      _toast(n == 0 ? "این کانفیگ‌ها از قبل در لیست هستند." : "$n کانفیگ اضافه شد.");
    } catch (e) {
      _toast("ورود ناموفق: $e");
    } finally {
      setState(() => busy = false);
    }
  }

  Future<void> _importDialog() async {
    final ctrl = TextEditingController();
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: surface,
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: SizedBox(
            height: 420,
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Text("ورود کانفیگ", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    "لینک VLESS / VMess / Trojan / SS، JSON نپسترنت، Clash یا آدرس سابسکریپشن را بچسبانید.",
                    style: TextStyle(color: muted, fontSize: 13),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: TextField(
                      controller: ctrl,
                      maxLines: null,
                      expands: true,
                      style: const TextStyle(fontFamily: "monospace", fontSize: 13),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: bg,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        hintText: "vless://…  یا JSON",
                        hintStyle: const TextStyle(color: muted),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 16),
                  child: SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FilledButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text("افزودن"),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
    if (ok == true) await _importText(ctrl.text);
    ctrl.dispose();
  }

  Future<void> _fromClipboard() async {
    final data = await Clipboard.getData("text/plain");
    await _importText(data?.text ?? "");
  }

  Future<void> _testOne(ConfigEntry e) async {
    setState(() => status = "در حال تست دیلی…");
    e.probe = await probeDelay(e.config.address, e.config.port);
    final d = diagnose(e.config, e.probe);
    e.health = d.status;
    setState(() => status = "${d.title} — ${d.detail}");
    await store.save();
  }

  Future<void> _testSelected() async {
    if (selected == null) return;
    setState(() => busy = true);
    try {
      await _testOne(selected!);
    } finally {
      setState(() => busy = false);
    }
  }

  Future<void> _testAll() async {
    setState(() => busy = true);
    try {
      for (final e in store.entries.toList()) {
        setState(() => status = "تست ${e.config.remark}…");
        await _testOne(e);
      }
    } finally {
      setState(() => busy = false);
    }
  }

  Future<void> _connect() async {
    final e = selected;
    if (e == null) {
      _toast("یک کانفیگ انتخاب کنید.");
      return;
    }
    final d = diagnose(e.config, e.probe);
    if (d.status == "invalid") {
      _toast(d.detail);
      return;
    }
    if (d.status == "broken") {
      final go = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: surface,
          title: const Text("کانفیگ مشکل‌دار"),
          content: Text("${d.detail}\n\nباز هم وصل شوم؟"),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("نه")),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text("وصل شو")),
          ],
        ),
      );
      if (go != true) return;
    }
    if (!canVpn(e.config)) {
      _toast("این پروتکل روی اندروید با هسته Xray وصل نمی‌شود. از نسخه ویندوز یا Hiddify استفاده کنید.");
      return;
    }
    setState(() {
      busy = true;
      status = "درخواست دسترسی VPN…";
    });
    try {
      final allowed = await v2ray.requestPermission();
      if (allowed != true) {
        _toast("دسترسی VPN داده نشد.");
        return;
      }
      String config;
      try {
        if (e.config.raw.contains("://")) {
          final parsed = V2ray.parseFromURL(toUri(e.config));
          config = parsed.getFullConfiguration();
        } else {
          config = xrayFullConfig(e.config);
        }
      } catch (_) {
        config = xrayFullConfig(e.config);
      }
      await v2ray.startV2Ray(
        remark: e.config.remark,
        config: config,
        proxyOnly: false,
      );
      setState(() {
        connected = true;
        activeId = e.config.id;
        status = "وصل شد — ترافیک از تونل VPN می‌رود";
      });
    } catch (err) {
      setState(() {
        connected = false;
        activeId = null;
      });
      _toast("اتصال ناموفق: $err");
    } finally {
      setState(() => busy = false);
    }
  }

  Future<void> _disconnect() async {
    try {
      v2ray.stopV2Ray();
    } catch (_) {}
    setState(() {
      connected = false;
      activeId = null;
      status = "قطع شد";
    });
  }

  void _delete(ConfigEntry e) {
    if (e.config.id == activeId) _disconnect();
    store.entries.remove(e);
    if (selected?.config.id == e.config.id) {
      selected = store.entries.isEmpty ? null : store.entries.first;
    }
    _persist();
  }

  void _toast(String m) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m), backgroundColor: surface));
    setState(() => status = m);
  }

  List<ConfigEntry> get visible {
    if (filter == "broken") return store.entries.where((e) => e.health == "broken").toList();
    if (filter == "ok") return store.entries.where((e) => e.health == "ok").toList();
    return store.entries;
  }

  @override
  Widget build(BuildContext context) {
    if (!ready) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return Scaffold(
      appBar: AppBar(
        backgroundColor: surface,
        title: const Text("پولاریس"),
        actions: [
          IconButton(onPressed: busy ? null : _fromClipboard, icon: const Icon(Icons.content_paste), tooltip: "کلیپ‌بورد"),
          IconButton(onPressed: busy ? null : _importDialog, icon: const Icon(Icons.add), tooltip: "ورود کانفیگ"),
        ],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            color: connected ? const Color(0xFF1A2A22) : surface,
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
            child: Text(
              connected ? "وضعیت: وصل" : "وضعیت: قطع",
              style: TextStyle(color: connected ? ok : muted, fontWeight: FontWeight.w600),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
            child: Row(
              children: [
                _chip("همه", "all"),
                _chip("سالم", "ok"),
                _chip("مشکل‌دار", "broken"),
              ],
            ),
          ),
          Expanded(
            child: visible.isEmpty
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text(
                        "کانفیگی نیست.\nبا + لینک یا JSON نپسترنت را وارد کنید.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: muted, height: 1.6),
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 120),
                    itemCount: visible.length,
                    itemBuilder: (ctx, i) {
                      final e = visible[i];
                      final d = diagnose(e.config, e.probe);
                      e.health = d.status;
                      final loc = e.probe?.countryCode == null
                          ? "—"
                          : "${countryName(e.probe!.countryCode)}${e.probe!.city == null || e.probe!.city!.isEmpty ? "" : " — ${e.probe!.city}"}";
                      final delay = e.probe?.delayMs != null ? "${e.probe!.delayMs} ms" : "—";
                      final sec = analyzeSecurity(e.config);
                      final selectedRow = selected?.config.id == e.config.id;
                      final color = d.status == "broken" || d.status == "invalid"
                          ? bad
                          : d.status == "ok"
                              ? ok
                              : muted;
                      return Dismissible(
                        key: ValueKey(e.config.id),
                        direction: DismissDirection.startToEnd,
                        background: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(color: bad, borderRadius: BorderRadius.circular(14)),
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          child: const Icon(Icons.delete, color: bg),
                        ),
                        onDismissed: (_) => _delete(e),
                        child: GestureDetector(
                          onTap: () => setState(() => selected = e),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: selectedRow ? const Color(0xFF20242C) : surface,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: selectedRow ? accent.withValues(alpha: 0.35) : const Color(0xFF2A2E36)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    if (e.config.id == activeId)
                                      const Padding(
                                        padding: EdgeInsets.only(left: 8),
                                        child: Icon(Icons.circle, size: 8, color: ok),
                                      ),
                                    Expanded(
                                      child: Text(
                                        e.config.remark,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                                      ),
                                    ),
                                    Text(healthFa(d.status), style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  "${typeLabel(e.config)}  ·  $delay  ·  $loc",
                                  style: const TextStyle(color: muted, fontSize: 12),
                                ),
                                const SizedBox(height: 4),
                                Text(sec.label, style: const TextStyle(color: muted, fontSize: 12)),
                                if (d.status == "broken")
                                  Padding(
                                    padding: const EdgeInsets.only(top: 6),
                                    child: Text(d.detail, style: const TextStyle(color: bad, fontSize: 12, height: 1.4)),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          Container(
            width: double.infinity,
            color: surface,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Text(status, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: muted, fontSize: 12)),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: busy ? null : _testSelected,
                  child: const Text("تست دیلی"),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                  onPressed: busy ? null : _testAll,
                  child: const Text("تست همه"),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 2,
                child: FilledButton(
                  onPressed: busy ? null : (connected ? _disconnect : _connect),
                  style: FilledButton.styleFrom(backgroundColor: connected ? bad : accent, foregroundColor: connected ? fg : bg),
                  child: Text(connected ? "قطع" : "وصل شو"),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _chip(String label, String value) {
    final on = filter == value;
    return Padding(
      padding: const EdgeInsets.only(left: 8),
      child: FilterChip(
        label: Text(label),
        selected: on,
        onSelected: (_) => setState(() => filter = value),
        selectedColor: accent.withValues(alpha: 0.2),
        labelStyle: TextStyle(color: on ? accent : muted, fontSize: 13),
        backgroundColor: surface,
        side: BorderSide(color: on ? accent : const Color(0xFF2A2E36)),
      ),
    );
  }
}
