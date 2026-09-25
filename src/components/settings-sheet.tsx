import { Settings } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import type { ClientSettings } from "@/lib/config/types";
import { toShareList, toShareListB64 } from "@/lib/config/export-client";

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-3 text-right"
    >
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-surface-2"}`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-fg transition-transform ${checked ? "right-0.5" : "right-5"}`}
        />
      </span>
    </button>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <Input
        dir="ltr"
        type="number"
        className="font-mono"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <Input dir="ltr" className="font-mono text-xs" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function SettingsSheet() {
  const settings = useAppStore((s) => s.settings);
  const update = useAppStore((s) => s.updateSettings);
  const entries = useAppStore((s) => s.entries);
  const clear = useAppStore((s) => s.clear);
  const loadSamples = useAppStore((s) => s.loadSamples);
  const set = (patch: Partial<ClientSettings>) => update(patch);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" aria-label="تنظیمات">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent title="تنظیمات هسته" description="گزینه‌های رایج v2rayN / Xray. روی همین دستگاه ذخیره می‌شوند.">
        <div className="grid gap-5">
          <section className="grid gap-3">
            <h3 className="text-sm font-semibold text-fg">ورودی محلی</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumField label="پورت SOCKS" value={settings.socksPort} onChange={(n) => set({ socksPort: n })} />
              <NumField label="پورت HTTP" value={settings.httpPort} onChange={(n) => set({ httpPort: n })} />
            </div>
            <Toggle checked={settings.udp} onChange={(v) => set({ udp: v })} label="UDP" hint="برای تماس و گیم" />
            <Toggle
              checked={settings.sniffing}
              onChange={(v) => set({ sniffing: v })}
              label="Sniffing"
              hint="تشخیص دامنه از ترافیک"
            />
            <Toggle
              checked={settings.tunEnabled}
              onChange={(v) => set({ tunEnabled: v })}
              label="TUN"
              hint="فقط در فایل خروجی؛ این اپ خودش TUN ویندوز را روشن نمی‌کند"
            />
            {settings.tunEnabled ? (
              <Toggle
                checked={settings.tunStrictRoute}
                onChange={(v) => set({ tunStrictRoute: v })}
                label="Strict Route"
                hint="همه ترافیک از تونل برود"
              />
            ) : null}
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold text-fg">Mux</h3>
            <Toggle checked={settings.muxEnabled} onChange={(v) => set({ muxEnabled: v })} label="فعال‌سازی Mux" />
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="Concurrency"
                value={settings.muxConcurrency}
                onChange={(n) => set({ muxConcurrency: n })}
              />
              <Toggle checked={settings.muxXudp} onChange={(v) => set({ muxXudp: v })} label="XUDP" />
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold text-fg">Fragment</h3>
            <Toggle
              checked={settings.fragmentEnabled}
              onChange={(v) => set({ fragmentEnabled: v })}
              label="تکه کردن TLS Hello"
              hint="برای عبور از فیلتر SNI"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <TextField
                label="Packets"
                value={settings.fragmentPackets}
                onChange={(v) => set({ fragmentPackets: v })}
              />
              <TextField
                label="Length"
                value={settings.fragmentLength}
                onChange={(v) => set({ fragmentLength: v })}
              />
              <TextField
                label="Interval"
                value={settings.fragmentInterval}
                onChange={(v) => set({ fragmentInterval: v })}
              />
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold text-fg">DNS و مسیریابی</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="DNS اصلی" value={settings.dnsPrimary} onChange={(v) => set({ dnsPrimary: v })} />
              <TextField
                label="DNS دوم"
                value={settings.dnsSecondary}
                onChange={(v) => set({ dnsSecondary: v })}
              />
            </div>
            <TextField label="DoH" value={settings.dnsDoh} onChange={(v) => set({ dnsDoh: v })} />
            <Toggle
              checked={settings.bypassLan}
              onChange={(v) => set({ bypassLan: v })}
              label="دور زدن شبکه محلی"
            />
            <Toggle
              checked={settings.bypassIran}
              onChange={(v) => set({ bypassIran: v })}
              label="سایت‌های ایران مستقیم"
            />
            <Toggle checked={settings.blockAds} onChange={(v) => set({ blockAds: v })} label="مسدودسازی تبلیغات" />
            <Toggle
              checked={Boolean(settings.fakeDns)}
              onChange={(v) => set({ fakeDns: v })}
              label="FakeDNS"
              hint="برای دامنه‌هایی که DNSشان سانسور می‌شود"
            />
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted">Domain Strategy</span>
              <select
                className="h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg"
                value={settings.domainStrategy ?? "IPIfNonMatch"}
                onChange={(e) => set({ domainStrategy: e.target.value as ClientSettings["domainStrategy"] })}
              >
                <option value="AsIs">AsIs</option>
                <option value="IPIfNonMatch">IPIfNonMatch</option>
                <option value="IPOnDemand">IPOnDemand</option>
              </select>
            </label>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold text-fg">TLS</h3>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted">Fingerprint پیش‌فرض</span>
              <select
                className="h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg"
                value={settings.fingerprint}
                onChange={(e) => set({ fingerprint: e.target.value })}
              >
                {["chrome", "firefox", "safari", "ios", "android", "edge", "random"].map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <Toggle
              checked={settings.allowInsecure}
              onChange={(v) => set({ allowInsecure: v })}
              label="AllowInsecure"
              hint="غیرفعال کردن بررسی گواهی — توصیه نمی‌شود"
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted">هسته</span>
                <select
                  className="h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg"
                  value={settings.core}
                  onChange={(e) => set({ core: e.target.value as ClientSettings["core"] })}
                >
                  <option value="xray">Xray</option>
                  <option value="sing-box">sing-box</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-medium text-muted">لاگ</span>
                <select
                  className="h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg"
                  value={settings.logLevel}
                  onChange={(e) => set({ logLevel: e.target.value as ClientSettings["logLevel"] })}
                >
                  {["none", "warning", "info", "debug"].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold text-fg">لیست کانفیگ‌ها</h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={async () => {
                  const text = toShareList(entries.map((e) => e.config));
                  if (!text) {
                    toast.error("لیست خالی است");
                    return;
                  }
                  try {
                    await navigator.clipboard.writeText(text);
                    toast.success("همه لینک‌ها کپی شد");
                  } catch {
                    toast.error("کپی نشد");
                  }
                }}
              >
                کپی همه لینک‌ها
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={async () => {
                  const text = toShareListB64(entries.map((e) => e.config));
                  if (!text) {
                    toast.error("لیست خالی است");
                    return;
                  }
                  try {
                    await navigator.clipboard.writeText(text);
                    toast.success("سابسکریپشن Base64 کپی شد");
                  } catch {
                    toast.error("کپی نشد");
                  }
                }}
              >
                کپی Base64
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  loadSamples();
                  toast.message("نمونه‌ها بارگذاری شدند");
                }}
              >
                نمونه‌ها
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  clear();
                  toast.message("لیست پاک شد");
                }}
              >
                پاک کردن لیست
              </Button>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
