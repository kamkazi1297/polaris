import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Copy,
  Download,
  Files,
  Globe2,
  Link2,
  Shield,
  Trash2,
  Unplug,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { HealthBadge, SecurityBadge } from "@/components/health-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { analyzeSecurity, diagnose, delayTone } from "@/lib/config/analyze";
import { countryName } from "@/lib/config/countries";
import { toNapsternet, toUri, toXrayOutbound, toClash, toSingbox } from "@/lib/config/encode";
import { toFullClientConfig } from "@/lib/config/export-client";
import { protocolLabel, sourceLabel, typeLabel } from "@/lib/config/parse";
import { NETWORKS, PROTOCOLS, type Network, type Protocol, type TlsMode } from "@/lib/config/types";
import { cn } from "@/lib/utils";
import { useAppStore, type ConfigEntry } from "@/store/app-store";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      className="h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );
}

export function ConfigDetail({
  entry,
  testing,
  onTest,
  onBack,
}: {
  entry: ConfigEntry;
  testing: boolean;
  onTest: () => void;
  onBack?: () => void;
}) {
  const updateConfig = useAppStore((s) => s.updateConfig);
  const remove = useAppStore((s) => s.remove);
  const setActive = useAppStore((s) => s.setActive);
  const duplicate = useAppStore((s) => s.duplicate);
  const settings = useAppStore((s) => s.settings);
  const activeId = useAppStore((s) => s.activeId);
  const [tab, setTab] = useState<"summary" | "edit" | "export">("summary");
  const { config, probe } = entry;
  const report = useMemo(() => analyzeSecurity(config), [config]);
  const diag = useMemo(() => diagnose(config, probe), [config, probe]);
  const isActive = activeId === config.id;
  const tone = delayTone(probe?.delayMs ?? null);

  function patch<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    updateConfig(config.id, { [key]: value });
  }

  async function copy(text: string, ok: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(ok);
    } catch {
      toast.error("کپی نشد");
    }
  }

  function download(filename: string, text: string) {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("فایل ذخیره شد");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="border-b border-border px-4 py-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 text-sm text-muted hover:text-fg md:hidden"
          >
            بازگشت به لیست
          </button>
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-fg">{config.remark || "بدون نام"}</h2>
            <p className="mt-1 font-mono text-xs text-muted" dir="ltr">
              {config.address}:{config.port}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <HealthBadge status={diag.status} />
            <SecurityBadge level={report.level} label={report.label} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (isActive) {
                setActive(null);
                return;
              }
              if (diag.status === "broken" || diag.status === "invalid") {
                toast.error(diag.title);
              }
              setActive(config.id);
              toast.message("فقط انتخاب شد — این اپ تونل ویندوز نمی‌سازد. JSON را در v2rayN واقعی وارد کنید.");
              if (!probe) onTest();
            }}
            disabled={diag.status === "invalid"}
          >
            {isActive ? <Unplug /> : <Zap />}
            {isActive ? "قطع انتخاب" : "انتخاب برای خروجی"}
          </Button>
          <Button variant="secondary" onClick={onTest} disabled={testing}>
            <Activity />
            {testing ? "در حال تست…" : "تست دیلی"}
          </Button>
          <Button variant="secondary" onClick={() => copy(toUri(config), "لینک کپی شد")}>
            <Copy />
            کپی لینک
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              duplicate(config.id);
              toast.success("کپی ساخته شد");
            }}
          >
            <Files />
            کپی
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              remove(config.id);
              toast.message("حذف شد");
            }}
          >
            <Trash2 />
            حذف
          </Button>
        </div>
      </header>

      <div className="flex gap-1 border-b border-border px-4">
        {(
          [
            ["summary", "خلاصه"],
            ["edit", "فیلدها"],
            ["export", "خروجی"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-11 px-3 text-sm transition-colors",
              tab === id ? "border-b-2 border-accent text-fg" : "text-muted hover:text-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "summary" ? (
          <div className="grid gap-3">
            <div
              className={cn(
                "rounded-lg border p-4",
                diag.status === "broken" || diag.status === "invalid"
                  ? "border-bad/40 bg-bad/10"
                  : diag.status === "warn" || diag.status === "dead"
                    ? "border-warn/40 bg-warn/10"
                    : diag.status === "ok"
                      ? "border-ok/30 bg-ok/10"
                      : "border-border bg-surface",
              )}
            >
              <p className="text-sm font-semibold text-fg">{diag.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{diag.detail}</p>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <Info label="نوع" value={typeLabel(config)} />
              <Info label="منبع" value={config.group ? `${sourceLabel(config.source)} · ${config.group}` : sourceLabel(config.source)} />
              <Info
                label="دیلی"
                value={
                  probe?.delayMs != null ? (
                    <span
                      className={cn(
                        "font-mono tabular-nums",
                        tone === "ok" && "text-ok",
                        tone === "warn" && "text-warn",
                        tone === "bad" && "text-bad",
                      )}
                    >
                      {probe.delayMs} ms
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <Info
                label="مکان"
                value={
                  probe?.countryCode ? (
                    <span className="inline-flex items-center gap-1">
                      <Globe2 className="size-3.5" />
                      {countryName(probe.countryCode)}
                      {probe.city ? ` — ${probe.city}` : ""}
                    </span>
                  ) : (
                    "نامشخص"
                  )
                }
              />
              <Info label="IP" value={probe?.ip ?? "—"} mono />
              <Info label="ISP" value={probe?.isp || probe?.org || "—"} />
              <Info label="شبکه" value={config.network.toUpperCase()} />
              <Info
                label="امنیت لایه"
                value={config.tls === "none" ? "خاموش" : config.tls.toUpperCase()}
              />
            </dl>

            <section className="rounded-lg border border-border bg-surface p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Shield className="size-4 text-muted" />
                گزارش امنیت
              </h3>
              <ul className="grid gap-1.5 text-sm text-muted">
                {report.reasons.map((r) => (
                  <li key={r} className="leading-relaxed">
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}

        {tab === "edit" ? (
          <div className="grid gap-4">
            <Field label="نام">
              <Input value={config.remark} onChange={(e) => patch("remark", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="پروتکل">
                <Select value={config.protocol} onChange={(v) => patch("protocol", v as Protocol)}>
                  {PROTOCOLS.filter((p) => p !== "unknown").map((p) => (
                    <option key={p} value={p}>
                      {protocolLabel(p)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="شبکه (Transport)">
                <Select value={config.network} onChange={(v) => patch("network", v as Network)}>
                  {NETWORKS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_7rem]">
              <Field label="آدرس">
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  value={config.address}
                  onChange={(e) => patch("address", e.target.value)}
                />
              </Field>
              <Field label="پورت">
                <Input
                  dir="ltr"
                  className="font-mono"
                  type="number"
                  value={config.port}
                  onChange={(e) => patch("port", Number(e.target.value))}
                />
              </Field>
            </div>
            <Field label="UUID">
              <Input
                dir="ltr"
                className="font-mono text-xs"
                value={config.uuid}
                onChange={(e) => patch("uuid", e.target.value)}
              />
            </Field>
            <Field label="رمز / Password">
              <Input
                dir="ltr"
                className="font-mono text-xs"
                value={config.password}
                onChange={(e) => patch("password", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Encryption / Method">
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  value={config.method || config.encryption}
                  onChange={(e) => {
                    patch("method", e.target.value);
                    patch("encryption", e.target.value);
                  }}
                />
              </Field>
              <Field label="Flow">
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  value={config.flow}
                  onChange={(e) => patch("flow", e.target.value)}
                  placeholder="xtls-rprx-vision"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="AlterID">
                <Input
                  dir="ltr"
                  type="number"
                  value={config.alterId}
                  onChange={(e) => patch("alterId", Number(e.target.value))}
                />
              </Field>
              <Field label="Header Type">
                <Input
                  dir="ltr"
                  value={config.headerType}
                  onChange={(e) => patch("headerType", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="TLS / Reality">
                <Select value={config.tls} onChange={(v) => patch("tls", v as TlsMode)}>
                  <option value="none">none</option>
                  <option value="tls">tls</option>
                  <option value="reality">reality</option>
                  <option value="xtls">xtls</option>
                </Select>
              </Field>
              <Field label="Fingerprint">
                <Input
                  dir="ltr"
                  value={config.fingerprint}
                  onChange={(e) => patch("fingerprint", e.target.value)}
                  placeholder="chrome"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SNI">
                <Input dir="ltr" className="font-mono text-xs" value={config.sni} onChange={(e) => patch("sni", e.target.value)} />
              </Field>
              <Field label="ALPN">
                <Input dir="ltr" className="font-mono text-xs" value={config.alpn} onChange={(e) => patch("alpn", e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Host / Header">
                <Input dir="ltr" className="font-mono text-xs" value={config.host} onChange={(e) => patch("host", e.target.value)} />
              </Field>
              <Field label="Path">
                <Input dir="ltr" className="font-mono text-xs" value={config.path} onChange={(e) => patch("path", e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="gRPC ServiceName">
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  value={config.serviceName}
                  onChange={(e) => patch("serviceName", e.target.value)}
                />
              </Field>
              <Field label="gRPC Mode">
                <Input
                  dir="ltr"
                  value={config.grpcMode}
                  onChange={(e) => patch("grpcMode", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Reality Public Key (pbk)">
              <Input
                dir="ltr"
                className="font-mono text-xs"
                value={config.publicKey}
                onChange={(e) => patch("publicKey", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Short ID (sid)">
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  value={config.shortId}
                  onChange={(e) => patch("shortId", e.target.value)}
                />
              </Field>
              <Field label="SpiderX">
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  value={config.spiderX}
                  onChange={(e) => patch("spiderX", e.target.value)}
                />
              </Field>
            </div>
            <label className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-3">
              <span className="text-sm">AllowInsecure</span>
              <input
                type="checkbox"
                checked={config.allowInsecure}
                onChange={(e) => patch("allowInsecure", e.target.checked)}
                className="size-4"
              />
            </label>
            {config.protocol === "hysteria2" || config.protocol === "hysteria" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Obfs">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.obfs ?? ""}
                    onChange={(e) => patch("extra", { ...config.extra, obfs: e.target.value })}
                    placeholder="salamander"
                  />
                </Field>
                <Field label="Obfs Password">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra["obfs-password"] ?? ""}
                    onChange={(e) =>
                      patch("extra", { ...config.extra, "obfs-password": e.target.value })
                    }
                  />
                </Field>
              </div>
            ) : null}
            {config.protocol === "tuic" ? (
              <Field label="Congestion Control">
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  value={config.extra.congestion ?? ""}
                  onChange={(e) => patch("extra", { ...config.extra, congestion: e.target.value })}
                  placeholder="bbr"
                />
              </Field>
            ) : null}
            {config.protocol === "wireguard" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Peer Public Key">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.peerPublicKey ?? config.publicKey}
                    onChange={(e) => patch("extra", { ...config.extra, peerPublicKey: e.target.value })}
                  />
                </Field>
                <Field label="MTU">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.mtu ?? ""}
                    onChange={(e) => patch("extra", { ...config.extra, mtu: e.target.value })}
                  />
                </Field>
                <Field label="Local Address">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.localAddress ?? ""}
                    onChange={(e) =>
                      patch("extra", { ...config.extra, localAddress: e.target.value })
                    }
                  />
                </Field>
                <Field label="Reserved">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.reserved ?? ""}
                    onChange={(e) => patch("extra", { ...config.extra, reserved: e.target.value })}
                  />
                </Field>
              </div>
            ) : null}
            {config.network === "kcp" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="KCP MTU">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.kcpMtu ?? ""}
                    onChange={(e) => patch("extra", { ...config.extra, kcpMtu: e.target.value })}
                    placeholder="1350"
                  />
                </Field>
                <Field label="KCP TTI">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.kcpTti ?? ""}
                    onChange={(e) => patch("extra", { ...config.extra, kcpTti: e.target.value })}
                    placeholder="50"
                  />
                </Field>
                <Field label="Uplink Capacity">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.uplinkCapacity ?? ""}
                    onChange={(e) =>
                      patch("extra", { ...config.extra, uplinkCapacity: e.target.value })
                    }
                  />
                </Field>
                <Field label="Downlink Capacity">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.downlinkCapacity ?? ""}
                    onChange={(e) =>
                      patch("extra", { ...config.extra, downlinkCapacity: e.target.value })
                    }
                  />
                </Field>
              </div>
            ) : null}
            {config.network === "xhttp" || config.network === "splithttp" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="XHTTP Mode">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.xhttpMode ?? config.extra.mode ?? ""}
                    onChange={(e) => patch("extra", { ...config.extra, xhttpMode: e.target.value })}
                    placeholder="auto / packet-up / stream-up"
                  />
                </Field>
                <Field label="XHTTP Extra">
                  <Input
                    dir="ltr"
                    className="font-mono text-xs"
                    value={config.extra.xhttpExtra ?? ""}
                    onChange={(e) => patch("extra", { ...config.extra, xhttpExtra: e.target.value })}
                  />
                </Field>
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Packet Encoding">
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  value={config.extra.packetEncoding ?? ""}
                  onChange={(e) =>
                    patch("extra", { ...config.extra, packetEncoding: e.target.value })
                  }
                  placeholder="xudp"
                />
              </Field>
              <Field label="KCP Seed">
                <Input
                  dir="ltr"
                  className="font-mono text-xs"
                  value={config.extra.seed ?? ""}
                  onChange={(e) => patch("extra", { ...config.extra, seed: e.target.value })}
                />
              </Field>
            </div>
            <ExtraEditor
              extra={config.extra}
              onChange={(extra) => patch("extra", extra)}
            />
          </div>
        ) : null}

        {tab === "export" ? (
          <div className="grid gap-4">
            <ExportBlock
              title="لینک اشتراک"
              icon={<Link2 className="size-4" />}
              value={toUri(config)}
              onCopy={() => copy(toUri(config), "لینک کپی شد")}
            />
            <ExportBlock
              title="NapsternetV JSON"
              icon={<Copy className="size-4" />}
              value={toNapsternet(config)}
              onCopy={() => copy(toNapsternet(config), "JSON نپسترنت کپی شد")}
            />
            <ExportBlock
              title="Xray outbound"
              icon={<Copy className="size-4" />}
              value={toXrayOutbound(config)}
              onCopy={() => copy(toXrayOutbound(config), "Xray JSON کپی شد")}
            />
            <ExportBlock
              title="Clash proxy"
              icon={<Copy className="size-4" />}
              value={toClash(config)}
              onCopy={() => copy(toClash(config), "Clash JSON کپی شد")}
            />
            <ExportBlock
              title="sing-box outbound"
              icon={<Copy className="size-4" />}
              value={toSingbox(config)}
              onCopy={() => copy(toSingbox(config), "sing-box JSON کپی شد")}
            />
            <ExportBlock
              title="پیکربندی کامل کلاینت (با تنظیمات)"
              icon={<Copy className="size-4" />}
              value={toFullClientConfig(config, settings)}
              onCopy={() => copy(toFullClientConfig(config, settings), "config.json کپی شد")}
            />
            <Button
              variant="secondary"
              onClick={() =>
                download(
                  `${(config.remark || config.protocol).replace(/[^\w\u0600-\u06FF-]+/g, "_")}.json`,
                  toFullClientConfig(config, settings),
                )
              }
            >
              <Download />
              دانلود config.json
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ExtraEditor({
  extra,
  onChange,
}: {
  extra: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const entries = Object.entries(extra);
  return (
    <section className="grid gap-2 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">پارامترهای اضافه</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ ...extra, [`key${entries.length + 1}`]: "" })}
        >
          افزودن
        </Button>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-muted">پارامتر اضافه‌ای نیست. از کوئری لینک پر می‌شود.</p>
      ) : (
        <div className="grid gap-2">
          {entries.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7rem_1fr_auto] gap-2">
              <Input
                dir="ltr"
                className="font-mono text-xs"
                value={k}
                onChange={(e) => {
                  const next = { ...extra };
                  delete next[k];
                  next[e.target.value] = v;
                  onChange(next);
                }}
              />
              <Input
                dir="ltr"
                className="font-mono text-xs"
                value={v}
                onChange={(e) => onChange({ ...extra, [k]: e.target.value })}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="حذف پارامتر"
                onClick={() => {
                  const next = { ...extra };
                  delete next[k];
                  onChange(next);
                }}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Info({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={cn("mt-1 text-sm text-fg", mono && "font-mono text-xs")} dir={mono ? "ltr" : undefined}>
        {value}
      </dd>
    </div>
  );
}

function ExportBlock({
  title,
  icon,
  value,
  onCopy,
}: {
  title: string;
  icon: ReactNode;
  value: string;
  onCopy: () => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          {icon}
          {title}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          کپی
        </Button>
      </div>
      <Textarea dir="ltr" readOnly value={value} className="min-h-32 text-xs" />
    </section>
  );
}
