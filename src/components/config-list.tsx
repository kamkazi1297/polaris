import { Loader2, Search, Timer } from "lucide-react";
import { HealthBadge } from "@/components/health-badge";
import { Input } from "@/components/ui/input";
import { countryName } from "@/lib/config/countries";
import { protocolLabel, sourceLabel, typeLabel } from "@/lib/config/parse";
import { delayTone, diagnose } from "@/lib/config/analyze";
import { PROTOCOLS } from "@/lib/config/types";
import { cn } from "@/lib/utils";
import { useAppStore, type ConfigEntry } from "@/store/app-store";

const HEALTH_FILTERS = [
  { id: "all", label: "همه" },
  { id: "broken", label: "مشکل‌دار" },
  { id: "ok", label: "سالم" },
  { id: "untested", label: "تست‌نشده" },
  { id: "dead", label: "بدون پاسخ" },
] as const;

export function ConfigList({
  testingId,
  onTest,
  onSelect,
}: {
  testingId?: string | null;
  onTest?: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  const entries = useAppStore((s) => s.entries);
  const selectedId = useAppStore((s) => s.selectedId);
  const activeId = useAppStore((s) => s.activeId);
  const query = useAppStore((s) => s.query);
  const protocolFilter = useAppStore((s) => s.protocolFilter);
  const healthFilter = useAppStore((s) => s.healthFilter);
  const sortMode = useAppStore((s) => s.sortMode);
  const select = useAppStore((s) => s.select);
  const setQuery = useAppStore((s) => s.setQuery);
  const setProtocolFilter = useAppStore((s) => s.setProtocolFilter);
  const setHealthFilter = useAppStore((s) => s.setHealthFilter);
  const setSortMode = useAppStore((s) => s.setSortMode);

  const filtered = entries
    .filter((e) => {
      if (protocolFilter !== "all" && e.config.protocol !== protocolFilter) return false;
      const health = diagnose(e.config, e.probe).status;
      if (healthFilter === "broken" && health !== "broken" && health !== "invalid") return false;
      if (healthFilter === "ok" && health !== "ok") return false;
      if (healthFilter === "untested" && health !== "unknown") return false;
      if (healthFilter === "dead" && health !== "dead") return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const c = e.config;
      const hay = `${c.remark} ${c.address} ${c.protocol} ${c.sni} ${c.network} ${typeLabel(c)} ${sourceLabel(c.source)}`.toLowerCase();
      return hay.includes(q);
    })
    .slice()
    .sort((a, b) => {
      if (sortMode === "delay") {
        const da = a.probe?.delayMs ?? Number.POSITIVE_INFINITY;
        const db = b.probe?.delayMs ?? Number.POSITIVE_INFINITY;
        return da - db;
      }
      if (sortMode === "name") {
        return (a.config.remark || a.config.address).localeCompare(
          b.config.remark || b.config.address,
          "fa",
        );
      }
      return 0;
    });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid gap-2 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در نام، آدرس، پروتکل…"
            className="pr-10"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg"
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            aria-label="فیلتر پروتکل"
          >
            <option value="all">همه پروتکل‌ها</option>
            {PROTOCOLS.filter((p) => p !== "unknown").map((p) => (
              <option key={p} value={p}>
                {protocolLabel(p)}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-sm border border-border bg-surface px-3 text-sm text-fg"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
            aria-label="مرتب‌سازی"
          >
            <option value="default">ترتیب ورود</option>
            <option value="delay">دیلی (کم به زیاد)</option>
            <option value="name">نام</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-1">
          {HEALTH_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setHealthFilter(f.id)}
              className={cn(
                "h-9 rounded-full border px-3 text-xs transition-colors",
                healthFilter === f.id
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border bg-surface text-muted hover:text-fg",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted">کانفیگی مطابق فیلتر نیست.</p>
        ) : (
          <ul className="grid gap-1">
            {filtered.map((e) => (
              <li key={e.config.id}>
                <ConfigRow
                  entry={e}
                  selected={e.config.id === selectedId}
                  active={e.config.id === activeId}
                  testing={testingId === e.config.id}
                  onSelect={() => {
                    if (onSelect) onSelect(e.config.id);
                    else select(e.config.id);
                  }}
                  onTest={onTest ? () => onTest(e.config.id) : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ConfigRow({
  entry,
  selected,
  active,
  testing,
  onSelect,
  onTest,
}: {
  entry: ConfigEntry;
  selected: boolean;
  active: boolean;
  testing?: boolean;
  onSelect: () => void;
  onTest?: () => void;
}) {
  const { config, probe } = entry;
  const health = diagnose(config, probe).status;
  const tone = delayTone(probe?.delayMs ?? null);
  return (
    <div
      className={cn(
        "flex w-full items-stretch rounded-md border transition-colors duration-150",
        selected ? "border-accent/40 bg-surface-2" : "border-transparent bg-transparent hover:bg-surface-2",
      )}
    >
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 px-3 py-3 text-right">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-fg">{config.remark || config.address}</p>
            <p className="mt-0.5 truncate text-xs text-muted">{typeLabel(config)}</p>
            <p className="mt-0.5 truncate font-mono text-xs text-subtle" dir="ltr">
              {config.address}:{config.port}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {active ? (
              <span className="rounded-full bg-ok/15 px-2 py-0.5 text-xs text-ok">فعال</span>
            ) : (
              <HealthBadge status={health} />
            )}
            {testing ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <Loader2 className="size-3 animate-spin" />
                تست
              </span>
            ) : probe?.delayMs != null ? (
              <span
                className={cn(
                  "font-mono text-xs tabular-nums",
                  tone === "ok" && "text-ok",
                  tone === "warn" && "text-warn",
                  tone === "bad" && "text-bad",
                )}
              >
                {probe.delayMs} ms
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-subtle">
          {config.source === "napsternet" ? (
            <span className="rounded-full border border-border px-2 py-0.5">{sourceLabel(config.source)}</span>
          ) : null}
          {probe?.countryCode ? (
            <span>
              {countryName(probe.countryCode)}
              {probe.city ? ` — ${probe.city}` : ""}
            </span>
          ) : null}
        </div>
      </button>
      {onTest ? (
        <button
          type="button"
          aria-label="تست دیلی"
          disabled={testing}
          onClick={(e) => {
            e.stopPropagation();
            onTest();
          }}
          className="grid w-11 shrink-0 place-items-center border-r border-border text-muted hover:text-fg disabled:opacity-40"
        >
          {testing ? <Loader2 className="size-4 animate-spin" /> : <Timer className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}