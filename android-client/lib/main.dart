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
  final searchCtrl = TextEditingController();
  bool ready = false;
  bool busy = false;
  bool connected = false;
  String? activeId;
  String status = "آماده";
  ConfigEntry? selected;
  String filter = "all";
  String query = "";

  @override
  void initState() {
    super.initState();
    _boot();
  }

  @override
  void dispose() {
    searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _boot() async {
    await store.load();
    try {
      await v2ray.initialize(
        notificationIconResourceType: "mipmap",
        notificationIconResourceName: "ic_launcher",
      );
    } catch (_) {}
    store.sortEntries();
    if (store.entries.isNotEmpty) selected = store.entries.first;
    setState(() {
      ready = true;
      status = "${store.entries.length} کانفیگ";
    });
  }

  Future<void> _persist() async {
    store.sortEntries();
    await store.save();
    if (selected != null && store.entries.every((e) => e.config.id != selected!.config.id)) {
      selected = store.entries.isEmpty ? null : store.entries.first;
    }
    setState(() {});
  }

  Future<String> _fetch(String url) async {
    final res = await http.get(Uri.parse(url.trim()), headers: {
      "User-Agent": "Polaris/1.3",
    }).timeout(const Duration(seconds: 25));
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw Exception("HTTP ${res.statusCode}");
    }
    return res.body;
  }

  Future<void> _importText(String raw, {String group = "", bool saveSub = true}) async {
    raw = raw.trim();
    if (raw.isEmpty) return;
    setState(() => busy = true);
    try {
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        final url = raw.split(RegExp(r"\s+")).first.trim();
        setState(() => status = "در حال دریافت سابسکریپشن…");
        if (saveSub && store.subs.every((s) => s.url != url)) {
          store.subs.add(Subscription(
            name: group.isEmpty ? Uri.parse(url).host : group,
            url: url,
          ));
        }
        raw = await _fetch(url);
        group = group.isEmpty ? (Uri.parse(url).host) : group;
      }
      final parsed = parseConfigs(raw);
      if (parsed.isEmpty) {
        _toast("هیچ کانفیگ معتبری پیدا نشد.");
        return;
      }
      final n = store.upsertParsed(parsed, group: group);
      selected = store.entries.isEmpty ? null : store.entries.first;
      await _persist();
      _toast(n == 0 ? "تکراری بودند و اضافه نشدند." : "$n کانفیگ اضافه شد.");
    } catch (e) {
      _toast("ورود ناموفق: $e");
    } finally {
      setState(() => busy = false);
    }
  }

  Future<void> _refreshSub(Subscription sub) async {
    setState(() {
      busy = true;
      status = "به‌روزرسانی ${sub.name}…";
    });
    try {
      final raw = await _fetch(sub.url);
      final parsed = parseConfigs(raw);
      store.replaceGroup(sub.name.isEmpty ? sub.url : sub.name, parsed);
      sub.lastUpdate = DateTime.now().toIso8601String();
      await _persist();
      _toast("${parsed.length} کانفیگ از ${sub.name} به‌روز شد.");
    } catch (e) {
      _toast("ساب به‌روز نشد: $e");
    } finally {
      setState(() => busy = false);
    }
  }

  Future<void> _refreshAllSubs() async {
    if (store.subs.isEmpty) {
      _toast("سابسکریپشنی ذخیره نشده. لینک https را در ورود کانفیگ بچسبانید.");
      return;
    }
    for (final s in store.subs.toList()) {
      await _refreshSub(s);
    }
  }

  Future<void> _importDialog() async {
    final ctrl = TextEditingController();
    final okBtn = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: surface,
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: SizedBox(
            height: 440,
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Text("ورود کانفیگ / ساب‌لینک", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    "لینک VLESS / VMess / Trojan / SS، JSON نپسترنت، Clash، یا آدرس سابسکریپشن (https).",
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
                        hintText: "vless://…  یا  https://…/sub",
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
    if (okBtn == true) await _importText(ctrl.text);
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
      store.sortEntries();
      setState(() {});
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
      store.sortMode = "valid";
      store.sortEntries();
      await store.save();
      setState(() => status = "مرتب شد: سالم‌ها بالا");
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
      _toast("این پروتکل روی اندروید با هسته Xray وصل نمی‌شود. از نسخه ویندوز استفاده کنید.");
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
          config = xrayFullConfig(e.config, store.settings);
        }
      } catch (_) {
        config = xrayFullConfig(e.config, store.settings);
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

  Future<void> _copy(ConfigEntry e) async {
    await Clipboard.setData(ClipboardData(text: toUri(e.config)));
    _toast("لینک کپی شد");
  }

  List<ConfigEntry> get visible {
    var list = store.entries.toList();
    if (filter == "broken") list = list.where((e) => e.health == "broken").toList();
    if (filter == "ok") list = list.where((e) => e.health == "ok").toList();
    if (filter == "dead") list = list.where((e) => e.health == "dead" || e.health == "invalid").toList();
    final q = query.trim().toLowerCase();
    if (q.isNotEmpty) {
      list = list
          .where((e) =>
              e.config.remark.toLowerCase().contains(q) ||
              e.config.address.toLowerCase().contains(q) ||
              e.config.protocol.contains(q) ||
              e.config.group.toLowerCase().contains(q))
          .toList();
    }
    return list;
  }

  Future<void> _openSubs() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SubsPage(
          store: store,
          onRefresh: _refreshSub,
          onChanged: _persist,
        ),
      ),
    );
    setState(() {});
  }

  Future<void> _openSettings() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => SettingsPage(store: store)),
    );
    await store.save();
    setState(() {});
  }

  void _setSort(String mode) {
    store.sortMode = mode;
    store.sortEntries();
    store.save();
    setState(() {});
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
          PopupMenuButton<String>(
            onSelected: (v) async {
              switch (v) {
                case "subs":
                  await _openSubs();
                  break;
                case "refresh":
                  await _refreshAllSubs();
                  break;
                case "dup":
                  final n = store.removeDuplicates();
                  await _persist();
                  _toast(n == 0 ? "تکراری نبود." : "$n کانفیگ تکراری حذف شد.");
                  break;
                case "dead":
                  final n = store.removeDead();
                  await _persist();
                  _toast(n == 0 ? "مورد مرده‌ای نبود." : "$n کانفیگ نامعتبر/بدون‌پاسخ حذف شد.");
                  break;
                case "sort_valid":
                  _setSort("valid");
                  _toast("مرتب شد: معتبرها بالا");
                  break;
                case "sort_delay":
                  _setSort("delay");
                  _toast("مرتب شد: کم‌ترین دیلی");
                  break;
                case "sort_name":
                  _setSort("name");
                  _toast("مرتب شد: نام");
                  break;
                case "settings":
                  await _openSettings();
                  break;
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: "subs", child: Text("ساب‌لینک‌ها")),
              PopupMenuItem(value: "refresh", child: Text("به‌روزرسانی ساب‌ها")),
              PopupMenuItem(value: "dup", child: Text("حذف کانفیگ تکراری")),
              PopupMenuItem(value: "dead", child: Text("حذف بدون‌پاسخ / نامعتبر")),
              PopupMenuDivider(),
              PopupMenuItem(value: "sort_valid", child: Text("مرتب‌سازی: معتبرها")),
              PopupMenuItem(value: "sort_delay", child: Text("مرتب‌سازی: دیلی")),
              PopupMenuItem(value: "sort_name", child: Text("مرتب‌سازی: نام")),
              PopupMenuDivider(),
              PopupMenuItem(value: "settings", child: Text("تنظیمات")),
            ],
          ),
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
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 0),
            child: TextField(
              controller: searchCtrl,
              onChanged: (v) => setState(() => query = v),
              decoration: InputDecoration(
                hintText: "جستجو در نام، آدرس، پروتکل…",
                hintStyle: const TextStyle(color: muted, fontSize: 13),
                prefixIcon: const Icon(Icons.search, color: muted, size: 20),
                filled: true,
                fillColor: surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
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
                _chip("بدون پاسخ", "dead"),
              ],
            ),
          ),
          Expanded(
            child: visible.isEmpty
                ? const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text(
                        "کانفیگی نیست.\nبا + لینک، JSON نپسترنت یا ساب‌لینک را وارد کنید.",
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
                          onLongPress: () => _showDetail(e),
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
                                Text(
                                  e.config.group.isEmpty ? sec.label : "${sec.label}  ·  ${e.config.group}",
                                  style: const TextStyle(color: muted, fontSize: 12),
                                ),
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

  void _showDetail(ConfigEntry e) {
    final d = diagnose(e.config, e.probe);
    final sec = analyzeSecurity(e.config);
    showModalBottomSheet(
      context: context,
      backgroundColor: surface,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(e.config.remark, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text("${typeLabel(e.config)}\n${d.title} — ${d.detail}\n${sec.label}\n${e.config.address}:${e.config.port}",
                style: const TextStyle(color: muted, height: 1.5)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilledButton(onPressed: () { Navigator.pop(ctx); setState(() => selected = e); _connect(); }, child: const Text("وصل شو")),
                OutlinedButton(onPressed: () { Navigator.pop(ctx); _copy(e); }, child: const Text("کپی لینک")),
                OutlinedButton(onPressed: () { Navigator.pop(ctx); _delete(e); }, child: const Text("حذف")),
              ],
            ),
          ],
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

class SubsPage extends StatefulWidget {
  final AppStore store;
  final Future<void> Function(Subscription) onRefresh;
  final Future<void> Function() onChanged;
  const SubsPage({super.key, required this.store, required this.onRefresh, required this.onChanged});
  @override
  State<SubsPage> createState() => _SubsPageState();
}

class _SubsPageState extends State<SubsPage> {
  Future<void> _add() async {
    final name = TextEditingController();
    final url = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: surface,
        title: const Text("ساب‌لینک جدید"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: name, decoration: const InputDecoration(labelText: "نام")),
            TextField(controller: url, decoration: const InputDecoration(labelText: "آدرس https")),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("لغو")),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text("ذخیره")),
        ],
      ),
    );
    if (ok == true && url.text.trim().isNotEmpty) {
      widget.store.subs.add(Subscription(
        name: name.text.trim().isEmpty ? Uri.tryParse(url.text)?.host ?? "ساب" : name.text.trim(),
        url: url.text.trim(),
      ));
      await widget.onChanged();
      setState(() {});
    }
    name.dispose();
    url.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: surface,
        title: const Text("ساب‌لینک‌ها"),
        actions: [IconButton(onPressed: _add, icon: const Icon(Icons.add))],
      ),
      body: widget.store.subs.isEmpty
          ? const Center(child: Text("سابی نیست. لینک https را اینجا یا در ورود کانفیگ اضافه کنید.", style: TextStyle(color: muted)))
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: widget.store.subs.length,
              itemBuilder: (ctx, i) {
                final s = widget.store.subs[i];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: surface, borderRadius: BorderRadius.circular(14)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(s.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 4),
                      Text(s.url, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: muted, fontSize: 12)),
                      if (s.lastUpdate != null)
                        Text("آخرین به‌روزرسانی: ${s.lastUpdate}", style: const TextStyle(color: muted, fontSize: 11)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          OutlinedButton(onPressed: () async { await widget.onRefresh(s); setState(() {}); }, child: const Text("به‌روزرسانی")),
                          const SizedBox(width: 8),
                          TextButton(
                            onPressed: () async {
                              widget.store.entries.removeWhere((e) => e.config.group == s.name);
                              widget.store.subs.remove(s);
                              await widget.onChanged();
                              setState(() {});
                            },
                            child: const Text("حذف"),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}

class SettingsPage extends StatefulWidget {
  final AppStore store;
  const SettingsPage({super.key, required this.store});
  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  late final dns1 = TextEditingController(text: widget.store.settings.dnsPrimary);
  late final dns2 = TextEditingController(text: widget.store.settings.dnsSecondary);

  @override
  void dispose() {
    dns1.dispose();
    dns2.dispose();
    super.dispose();
  }

  ClientSettings get s => widget.store.settings;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(backgroundColor: surface, title: const Text("تنظیمات")),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SwitchListTile(
            title: const Text("Mux"),
            subtitle: const Text("چند اتصال روی یک تونل (با Reality Vision خاموش بماند)"),
            value: s.muxEnabled,
            onChanged: (v) => setState(() => s.muxEnabled = v),
          ),
          SwitchListTile(
            title: const Text("Fragment"),
            subtitle: const Text("کمک به عبور از برخی فیلترها"),
            value: s.fragmentEnabled,
            onChanged: (v) => setState(() => s.fragmentEnabled = v),
          ),
          SwitchListTile(
            title: const Text("دور زدن LAN"),
            value: s.bypassLan,
            onChanged: (v) => setState(() => s.bypassLan = v),
          ),
          SwitchListTile(
            title: const Text("دور زدن سایت‌های ایران"),
            value: s.bypassIran,
            onChanged: (v) => setState(() => s.bypassIran = v),
          ),
          SwitchListTile(
            title: const Text("مسدود کردن تبلیغات"),
            value: s.blockAds,
            onChanged: (v) => setState(() => s.blockAds = v),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: dns1,
            decoration: const InputDecoration(labelText: "DNS اصلی"),
            onChanged: (v) => s.dnsPrimary = v,
          ),
          const SizedBox(height: 8),
          TextField(
            controller: dns2,
            decoration: const InputDecoration(labelText: "DNS دوم"),
            onChanged: (v) => s.dnsSecondary = v,
          ),
          const SizedBox(height: 16),
          const Text("اثر انگشت TLS", style: TextStyle(color: muted)),
          DropdownButton<String>(
            value: s.fingerprint,
            isExpanded: true,
            items: const [
              DropdownMenuItem(value: "chrome", child: Text("chrome")),
              DropdownMenuItem(value: "firefox", child: Text("firefox")),
              DropdownMenuItem(value: "safari", child: Text("safari")),
              DropdownMenuItem(value: "ios", child: Text("ios")),
              DropdownMenuItem(value: "android", child: Text("android")),
              DropdownMenuItem(value: "edge", child: Text("edge")),
              DropdownMenuItem(value: "random", child: Text("random")),
            ],
            onChanged: (v) => setState(() => s.fingerprint = v ?? "chrome"),
          ),
          const SizedBox(height: 24),
          const Text(
            "فقط تست دیلی انجام می‌شود. اگر سرور ایران باشد کانفیگ مشکل‌دار علامت می‌خورد — ممکن است از فیلتر رد شوید ولی مکان عوض نشود.",
            style: TextStyle(color: muted, height: 1.5),
          ),
        ],
      ),
    );
  }
}
