namespace Polaris;

sealed class SettingsForm : Form
{
    readonly NumericUpDown _socks;
    readonly NumericUpDown _http;
    readonly CheckBox _mux;
    readonly NumericUpDown _muxN;
    readonly CheckBox _frag;
    readonly TextBox _dns1;
    readonly TextBox _dns2;
    readonly TextBox _doh;
    readonly CheckBox _lan;
    readonly CheckBox _iran;
    readonly CheckBox _ads;
    readonly CheckBox _sniff;
    readonly CheckBox _udp;
    readonly ComboBox _fp;
    readonly ComboBox _core;
    readonly ComboBox _ds;
    readonly ClientSettings _s;

    public SettingsForm(ClientSettings s)
    {
        _s = s;
        Text = "تنظیمات هسته";
        Width = 460;
        Height = 620;
        RightToLeft = RightToLeft.Yes;
        StartPosition = FormStartPosition.CenterParent;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        MinimizeBox = false;
        BackColor = Color.FromArgb(20, 22, 26);
        ForeColor = Color.FromArgb(232, 234, 237);
        Font = new Font("Segoe UI", 9.5f);

        var y = 16;
        Control L(string t)
        {
            var l = new Label { Text = t, Left = 24, Top = y, Width = 180, ForeColor = Color.FromArgb(139, 144, 154) };
            Controls.Add(l);
            return l;
        }
        NumericUpDown AddNum(string label, int value, int min, int max)
        {
            L(label);
            var n = new NumericUpDown { Left = 220, Top = y - 2, Width = 180, Minimum = min, Maximum = max, Value = Math.Clamp(value, min, max) };
            Controls.Add(n);
            y += 36;
            return n;
        }
        CheckBox AddChk(string label, bool on)
        {
            var c = new CheckBox { Text = label, Left = 24, Top = y, Width = 380, Checked = on, ForeColor = ForeColor };
            Controls.Add(c);
            y += 32;
            return c;
        }
        TextBox AddTxt(string label, string value)
        {
            L(label);
            var t = new TextBox { Left = 220, Top = y - 2, Width = 180, Text = value, BackColor = Color.FromArgb(11, 12, 14), ForeColor = ForeColor, BorderStyle = BorderStyle.FixedSingle };
            Controls.Add(t);
            y += 36;
            return t;
        }
        ComboBox AddCbo(string label, string[] items, string value)
        {
            L(label);
            var c = new ComboBox { Left = 220, Top = y - 2, Width = 180, DropDownStyle = ComboBoxStyle.DropDownList };
            c.Items.AddRange(items);
            c.SelectedItem = items.Contains(value) ? value : items[0];
            Controls.Add(c);
            y += 36;
            return c;
        }

        _socks = AddNum("پورت SOCKS", s.SocksPort, 1024, 65535);
        _http = AddNum("پورت HTTP", s.HttpPort, 1024, 65535);
        _mux = AddChk("Mux", s.MuxEnabled);
        _muxN = AddNum("همزمانی Mux", s.MuxConcurrency, 1, 128);
        _frag = AddChk("Fragment (tlshello)", s.FragmentEnabled);
        _dns1 = AddTxt("DNS اصلی", s.DnsPrimary);
        _dns2 = AddTxt("DNS دوم", s.DnsSecondary);
        _doh = AddTxt("DoH", s.DnsDoh);
        _lan = AddChk("دور زدن شبکه محلی", s.BypassLan);
        _iran = AddChk("سایت‌های ایران مستقیم", s.BypassIran);
        _ads = AddChk("مسدود کردن تبلیغات", s.BlockAds);
        _sniff = AddChk("Sniffing", s.Sniffing);
        _udp = AddChk("UDP", s.Udp);
        _fp = AddCbo("اثر انگشت", new[] { "chrome", "firefox", "safari", "ios", "android", "edge", "random" }, s.Fingerprint);
        _core = AddCbo("هسته", new[] { "xray", "sing-box" }, s.Core);
        _ds = AddCbo("Domain strategy", new[] { "AsIs", "IPIfNonMatch", "IPOnDemand" }, s.DomainStrategy);

        var ok = new Button
        {
            Text = "ذخیره",
            Left = 220,
            Top = y + 8,
            Width = 180,
            Height = 36,
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.FromArgb(197, 204, 214),
            ForeColor = Color.FromArgb(11, 12, 14),
            DialogResult = DialogResult.OK,
        };
        ok.Click += (_, _) => Apply();
        Controls.Add(ok);
        AcceptButton = ok;
    }

    void Apply()
    {
        _s.SocksPort = (int)_socks.Value;
        _s.HttpPort = (int)_http.Value;
        _s.MuxEnabled = _mux.Checked;
        _s.MuxConcurrency = (int)_muxN.Value;
        _s.FragmentEnabled = _frag.Checked;
        _s.DnsPrimary = _dns1.Text.Trim();
        _s.DnsSecondary = _dns2.Text.Trim();
        _s.DnsDoh = _doh.Text.Trim();
        _s.BypassLan = _lan.Checked;
        _s.BypassIran = _iran.Checked;
        _s.BlockAds = _ads.Checked;
        _s.Sniffing = _sniff.Checked;
        _s.Udp = _udp.Checked;
        _s.Fingerprint = _fp.SelectedItem?.ToString() ?? "chrome";
        _s.Core = _core.SelectedItem?.ToString() ?? "xray";
        _s.DomainStrategy = _ds.SelectedItem?.ToString() ?? "IPIfNonMatch";
    }
}
