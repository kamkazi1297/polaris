using System.Drawing.Drawing2D;

using System.Drawing.Drawing2D;

namespace Polaris;

sealed class MainForm : Form
{
    readonly AppState _state;
    readonly ListView _list;
    readonly TextBox _detail;
    readonly Label _status;
    readonly Button _connectBtn;
    string? _activeId;
    bool _busy;

    static readonly Color Bg = Color.FromArgb(11, 12, 14);
    static readonly Color Surface = Color.FromArgb(20, 22, 26);
    static readonly Color Fg = Color.FromArgb(232, 234, 237);
    static readonly Color Muted = Color.FromArgb(139, 144, 154);
    static readonly Color Accent = Color.FromArgb(197, 204, 214);
    static readonly Color Bad = Color.FromArgb(209, 122, 122);
    static readonly Color Ok = Color.FromArgb(125, 186, 154);

    public MainForm()
    {
        Paths.Ensure();
        _state = Store.Load();
        RightToLeft = RightToLeft.Yes;
        RightToLeftLayout = true;
        Text = "پولاریس";
        Width = 1100;
        Height = 720;
        MinimumSize = new Size(860, 560);
        BackColor = Bg;
        ForeColor = Fg;
        Font = new Font("Segoe UI", 9.5f);
        DoubleBuffered = true;
        FormClosing += (_, e) =>
        {
            CoreRuntime.Stop();
            Store.Save(_state);
        };

        var top = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 52,
            Padding = new Padding(10, 8, 10, 8),
            BackColor = Surface,
            WrapContents = false,
        };
        _connectBtn = MkBtn("وصل شو", true);
        _connectBtn.Click += async (_, _) => await ConnectAsync();
        var disc = MkBtn("قطع", false); disc.Click += (_, _) => Disconnect();
        var imp = MkBtn("ورود کانفیگ", false); imp.Click += async (_, _) => await ImportAsync();
        var test = MkBtn("تست دیلی", false); test.Click += async (_, _) => await TestSelectedAsync();
        var testAll = MkBtn("تست همه", false); testAll.Click += async (_, _) => await TestAllAsync();
        var copy = MkBtn("کپی لینک", false); copy.Click += (_, _) => CopyUri();
        var del = MkBtn("حذف", false); del.Click += (_, _) => DeleteSelected();
        var clip = MkBtn("کلیپ‌بورد", false); clip.Click += async (_, _) => await ImportClipboardAsync();
        var set = MkBtn("تنظیمات", false); set.Click += (_, _) => OpenSettings();
        top.Controls.AddRange(new Control[] { imp, clip, test, testAll, _connectBtn, disc, copy, del, set });

        var hint = new Label
        {
            Dock = DockStyle.Top,
            Height = 36,
            Padding = new Padding(12, 8, 12, 8),
            Text = "کلاینت ویندوز: هسته Xray را اجرا می‌کند و پروکسی سیستم را می‌گذارد. تست دیلی فقط پینگ TCP است. کانفیگ ایران = مشکل‌دار.",
            ForeColor = Muted,
            BackColor = Bg,
        };

        _list = new ListView
        {
            Dock = DockStyle.Fill,
            View = View.Details,
            FullRowSelect = true,
            MultiSelect = false,
            OwnerDraw = true,
            BackColor = Surface,
            ForeColor = Fg,
            BorderStyle = BorderStyle.None,
            HeaderStyle = ColumnHeaderStyle.Nonclickable,
        };
        _list.Columns.Add("نام", 220);
        _list.Columns.Add("نوع", 160);
        _list.Columns.Add("وضعیت", 110);
        _list.Columns.Add("دیلی", 80);
        _list.Columns.Add("مکان", 160);
        _list.Columns.Add("امنیت", 110);
        _list.SelectedIndexChanged += (_, _) => ShowDetail();
        _list.DoubleClick += async (_, _) => await ConnectAsync();
        _list.DrawColumnHeader += (_, e) =>
        {
            e.Graphics.FillRectangle(new SolidBrush(Surface), e.Bounds);
            TextRenderer.DrawText(e.Graphics, e.Header!.Text, Font, e.Bounds, Muted, TextFormatFlags.Right | TextFormatFlags.VerticalCenter);
        };
        _list.DrawItem += (_, e) => { };
        _list.DrawSubItem += ListDrawSubItem;

        _detail = new TextBox
        {
            Dock = DockStyle.Fill,
            Multiline = true,
            ReadOnly = true,
            ScrollBars = ScrollBars.Vertical,
            BorderStyle = BorderStyle.None,
            BackColor = Bg,
            ForeColor = Fg,
            Font = new Font("Cascadia Mono", 9f),
        };

        var split = new SplitContainer
        {
            Dock = DockStyle.Fill,
            SplitterDistance = 620,
            BackColor = Color.FromArgb(42, 46, 54),
            Panel1MinSize = 360,
            Panel2MinSize = 240,
        };
        split.Panel1.Controls.Add(_list);
        split.Panel2.Controls.Add(_detail);

        _status = new Label
        {
            Dock = DockStyle.Bottom,
            Height = 28,
            Padding = new Padding(12, 6, 12, 6),
            BackColor = Surface,
            ForeColor = Muted,
            Text = "آماده",
        };

        Controls.Add(split);
        Controls.Add(hint);
        Controls.Add(top);
        Controls.Add(_status);

        RefreshList();
        if (_list.Items.Count > 0) _list.Items[0].Selected = true;
    }

    Button MkBtn(string text, bool primary)
    {
        var b = new Button
        {
            Text = text,
            AutoSize = true,
            Height = 34,
            MinimumSize = new Size(88, 34),
            FlatStyle = FlatStyle.Flat,
            BackColor = primary ? Accent : Color.FromArgb(27, 30, 36),
            ForeColor = primary ? Bg : Fg,
            Margin = new Padding(4, 2, 4, 2),
            Cursor = Cursors.Hand,
        };
        b.FlatAppearance.BorderColor = Color.FromArgb(42, 46, 54);
        return b;
    }

    void ListDrawSubItem(object? sender, DrawListViewSubItemEventArgs e)
    {
        var selected = e.Item!.Selected;
        e.Graphics.FillRectangle(new SolidBrush(selected ? Color.FromArgb(32, 36, 42) : Surface), e.Bounds);
        var color = Fg;
        if (e.ColumnIndex == 2)
        {
            var st = e.SubItem!.Text;
            color = st.Contains("مشکل") || st.Contains("نامعتبر") ? Bad : st.Contains("سالم") ? Ok : Muted;
        }
        TextRenderer.DrawText(e.Graphics, e.SubItem!.Text, Font, e.Bounds, color,
            TextFormatFlags.Right | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);
    }

    ConfigEntry? Selected()
    {
        if (_list.SelectedItems.Count == 0) return null;
        var id = _list.SelectedItems[0].Tag as string;
        return _state.Entries.FirstOrDefault(e => e.Config.Id == id);
    }

    void RefreshList()
    {
        var sel = Selected()?.Config.Id;
        _list.BeginUpdate();
        _list.Items.Clear();
        foreach (var e in _state.Entries)
        {
            var d = Analyzer.Diagnose(e.Config, e.Probe);
            e.Health = d.Status;
            var loc = e.Probe?.CountryCode == null ? "—" : Analyzer.CountryName(e.Probe.CountryCode) + (string.IsNullOrEmpty(e.Probe.City) ? "" : " — " + e.Probe.City);
            var delay = e.Probe?.DelayMs is int ms ? $"{ms} ms" : "—";
            var sec = Analyzer.AnalyzeSecurity(e.Config).Label;
            var health = d.Status switch
            {
                "ok" => "سالم",
                "broken" => "مشکل‌دار",
                "invalid" => "نامعتبر",
                "dead" => "بدون پاسخ",
                "warn" => "هشدار مکان",
                _ => "تست نشده",
            };
            var name = e.Config.Id == _activeId ? "● " + e.Config.Remark : e.Config.Remark;
            var item = new ListViewItem(new[]
            {
                name,
                ProtocolUi.TypeLabel(e.Config),
                health,
                delay,
                loc,
                sec,
            })
            { Tag = e.Config.Id };
            _list.Items.Add(item);
            if (e.Config.Id == sel) item.Selected = true;
        }
        _list.EndUpdate();
        _status.Text = $"{_state.Entries.Count} کانفیگ · {_state.Entries.Count(x => x.Health == "ok")} سالم · {_state.Entries.Count(x => x.Health == "broken")} مشکل‌دار"
            + (CoreRuntime.Running ? " · وصل" : "");
        Store.Save(_state);
    }

    void ShowDetail()
    {
        var e = Selected();
        if (e == null) { _detail.Text = ""; return; }
        var d = Analyzer.Diagnose(e.Config, e.Probe);
        var s = Analyzer.AnalyzeSecurity(e.Config);
        var lines = new List<string>
        {
            d.Title,
            d.Detail,
            "",
            "نوع: " + ProtocolUi.TypeLabel(e.Config),
            "منبع: " + e.Config.Source,
            $"{e.Config.Address}:{e.Config.Port}",
            "امنیت: " + s.Label,
        };
        lines.AddRange(s.Reasons.Select(r => "  • " + r));
        if (e.Probe != null)
        {
            lines.Add("");
            lines.Add("IP: " + (e.Probe.Ip ?? "—"));
            lines.Add("ISP: " + (e.Probe.Isp ?? e.Probe.Org ?? "—"));
        }
        lines.Add("");
        lines.Add(Exporter.ToUri(e.Config));
        _detail.Text = string.Join(Environment.NewLine, lines);
    }

    void OpenSettings()
    {
        using var dlg = new SettingsForm(_state.Settings);
        if (dlg.ShowDialog(this) == DialogResult.OK)
            Store.Save(_state);
    }

    void CopyUri()
    {
        var e = Selected();
        if (e == null) return;
        try
        {
            Clipboard.SetText(Exporter.ToUri(e.Config));
            _status.Text = "لینک کپی شد";
        }
        catch { MessageBox.Show(this, "کپی نشد.", "پولاریس"); }
    }

    async Task ImportAsync()
    {
        using var dlg = new Form
        {
            Text = "ورود کانفیگ",
            Width = 640,
            Height = 480,
            RightToLeft = RightToLeft.Yes,
            RightToLeftLayout = true,
            StartPosition = FormStartPosition.CenterParent,
            BackColor = Surface,
            ForeColor = Fg,
            Font = Font,
        };
        var box = new TextBox { Multiline = true, Dock = DockStyle.Fill, ScrollBars = ScrollBars.Both, Font = new Font("Cascadia Mono", 9f), BackColor = Bg, ForeColor = Fg, BorderStyle = BorderStyle.FixedSingle };
        var ok = MkBtn("افزودن", true);
        ok.Dock = DockStyle.Bottom;
        ok.Height = 40;
        ok.Click += (_, _) => { dlg.Tag = box.Text; dlg.DialogResult = DialogResult.OK; };
        dlg.Controls.Add(box);
        dlg.Controls.Add(ok);
        if (dlg.ShowDialog(this) != DialogResult.OK) return;
        await AddParsedAsync(dlg.Tag as string ?? "");
    }

    async Task ImportClipboardAsync()
    {
        try { await AddParsedAsync(Clipboard.GetText()); }
        catch { MessageBox.Show(this, "کلیپ‌بورد خوانده نشد.", "پولاریس"); }
    }

    async Task AddParsedAsync(string raw)
    {
        raw = raw.Trim();
        if (raw.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || raw.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            _status.Text = "در حال دریافت سابسکریپشن…";
            try
            {
                using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
                http.DefaultRequestHeaders.UserAgent.ParseAdd("Polaris/1.0");
                raw = await http.GetStringAsync(raw.Split('\n')[0].Trim());
            }
            catch (Exception ex)
            {
                MessageBox.Show(this, "سابسکریپشن گرفته نشد:\n" + ex.Message, "پولاریس");
                return;
            }
        }
        var parsed = Parser.Parse(raw);
        if (parsed.Count == 0)
        {
            MessageBox.Show(this, "هیچ کانفیگ معتبری پیدا نشد.", "پولاریس");
            return;
        }
        var existing = _state.Entries.Select(e => $"{e.Config.Protocol}|{e.Config.Address}|{e.Config.Port}|{e.Config.Uuid}|{e.Config.Password}").ToHashSet();
        var n = 0;
        foreach (var c in parsed)
        {
            var key = $"{c.Protocol}|{c.Address}|{c.Port}|{c.Uuid}|{c.Password}";
            if (!existing.Add(key)) continue;
            _state.Entries.Insert(0, new ConfigEntry { Config = c, Health = Analyzer.Diagnose(c, null).Status });
            n++;
        }
        RefreshList();
        MessageBox.Show(this, n == 0 ? "این کانفیگ‌ها از قبل در لیست هستند." : $"{n} کانفیگ اضافه شد.", "پولاریس");
    }

    void DeleteSelected()
    {
        var e = Selected();
        if (e == null) return;
        if (e.Config.Id == _activeId) Disconnect();
        _state.Entries.Remove(e);
        RefreshList();
    }

    async Task TestSelectedAsync()
    {
        var e = Selected();
        if (e == null) return;
        await TestOne(e);
        RefreshList();
        ShowDetail();
    }

    async Task TestAllAsync()
    {
        if (_busy) return;
        _busy = true;
        try
        {
            foreach (var e in _state.Entries.ToList())
            {
                _status.Text = "تست " + e.Config.Remark + "…";
                await TestOne(e);
                RefreshList();
            }
        }
        finally { _busy = false; }
    }

    async Task TestOne(ConfigEntry e)
    {
        _status.Text = "در حال تست دیلی…";
        try
        {
            e.Probe = await Probe.RunAsync(e.Config.Address, e.Config.Port, CancellationToken.None);
            var d = Analyzer.Diagnose(e.Config, e.Probe);
            e.Health = d.Status;
            _status.Text = d.Title + " — " + d.Detail;
        }
        catch (Exception ex) { _status.Text = "تست ناموفق: " + ex.Message; }
    }

    async Task ConnectAsync()
    {
        var e = Selected();
        if (e == null) { MessageBox.Show(this, "یک کانفیگ انتخاب کنید.", "پولاریس"); return; }
        var d = Analyzer.Diagnose(e.Config, e.Probe);
        if (d.Status == "invalid") { MessageBox.Show(this, d.Detail, d.Title); return; }
        if (d.Status == "broken" && MessageBox.Show(this, d.Detail + "\n\nباز هم وصل شوم؟", "کانفیگ مشکل‌دار", MessageBoxButtons.YesNo) != DialogResult.Yes)
            return;
        if (_busy) return;
        _busy = true;
        _connectBtn.Enabled = false;
        try
        {
            var log = new Progress<string>(m => _status.Text = m);
            var sing = ProtocolUi.NeedsSingbox(e.Config);
            await CoreRuntime.EnsureCoreAsync(sing, log, CancellationToken.None);
            CoreRuntime.Start(e.Config, _state.Settings);
            _activeId = e.Config.Id;
            RefreshList();
            _status.Text = "وصل شد · پروکسی سیستم روی 127.0.0.1:" + _state.Settings.HttpPort;
        }
        catch (Exception ex)
        {
            CoreRuntime.Stop();
            _activeId = null;
            MessageBox.Show(this, "اتصال ناموفق:\n" + ex.Message, "پولاریس");
        }
        finally
        {
            _busy = false;
            _connectBtn.Enabled = true;
        }
    }

    void Disconnect()
    {
        CoreRuntime.Stop();
        _activeId = null;
        RefreshList();
        _status.Text = "قطع شد";
    }
}
