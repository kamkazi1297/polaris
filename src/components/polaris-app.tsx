import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Download, Gauge, RotateCcw, Timer } from "lucide-react";
import { toast } from "sonner";
import { ConfigDetail } from "@/components/config-detail";
import { ConfigList } from "@/components/config-list";
import { ImportDialog } from "@/components/import-dialog";
import { SettingsSheet } from "@/components/settings-sheet";
import { Button } from "@/components/ui/button";
import { probeHost } from "@/lib/probe";
import { diagnose, isIranLocation } from "@/lib/config/analyze";
import { useAppStore } from "@/store/app-store";

export function PolarisApp() {
  const entries = useAppStore((s) => s.entries);
  const selectedId = useAppStore((s) => s.selectedId);
  const activeId = useAppStore((s) => s.activeId);
  const select = useAppStore((s) => s.select);
  const setProbe = useAppStore((s) => s.setProbe);
  const loadSamples = useAppStore((s) => s.loadSamples);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"list" | "detail">("list");
  const skipFirstSelect = useRef(true);

  useEffect(() => {
    const pick = () => {
      const s = useAppStore.getState();
      if (s.selectedId && s.entries.some((e) => e.config.id === s.selectedId)) return;
      const first = s.entries[0];
      if (first) s.select(first.config.id);
    };
    pick();
    const unsub = useAppStore.persist.onFinishHydration(pick);
    return () => {
      unsub();
    };
  }, []);

  const selected = useMemo(
    () => entries.find((e) => e.config.id === selectedId) ?? null,
    [entries, selectedId],
  );
  const active = useMemo(
    () => entries.find((e) => e.config.id === activeId) ?? null,
    [entries, activeId],
  );

  useEffect(() => {
    if (!selectedId) return;
    if (skipFirstSelect.current) {
      skipFirstSelect.current = false;
      return;
    }
    setMobilePanel("detail");
  }, [selectedId]);

  async function testOne(id: string) {
    const entry = useAppStore.getState().entries.find((e) => e.config.id === id);
    if (!entry) return;
    setTestingId(id);
    try {
      const probe = await probeHost({
        data: { host: entry.config.address, port: entry.config.port },
      });
      setProbe(id, probe);
      if (isIranLocation(probe)) {
        toast.error("کانفیگ مشکل‌دار: مکان عوض نمی‌شود (ایران)");
      } else if (!probe.ok) {
        toast.message(probe.country ? `پاسخ نداد · ${probe.country}` : "سرور پاسخ نداد");
      } else {
        const loc = [probe.city, probe.country].filter(Boolean).join("، ");
        toast.success(`${probe.delayMs} ms${loc ? ` · ${loc}` : ""}`);
      }
    } catch {
      toast.error("تست دیلی ناموفق بود");
    } finally {
      setTestingId(null);
    }
  }

  async function testAll() {
    const list = useAppStore.getState().entries;
    if (!list.length) return;
    setTestingAll(true);
    for (const e of list) {
      setTestingId(e.config.id);
      try {
        const probe = await probeHost({
          data: { host: e.config.address, port: e.config.port },
        });
        setProbe(e.config.id, probe);
      } catch {
        /* continue */
      }
    }
    setTestingId(null);
    setTestingAll(false);
    toast.success("تست دیلی همه کانفیگ‌ها تمام شد");
  }

  const broken = entries.filter((e) => diagnose(e.config, e.probe).status === "broken").length;
  const ok = entries.filter((e) => diagnose(e.config, e.probe).status === "ok").length;

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="border-b border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md border border-border bg-surface-2">
              <Compass className="size-5 text-accent" />
            </span>
            <div>
              <h1 className="text-base font-semibold leading-tight">پولاریس</h1>
              <p className="text-xs text-muted">بازرس کانفیگ · تست دیلی · تشخیص مکان</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="default" size="sm">
              <a
                href="https://github.com/kamkazi1297/polaris/releases/latest"
                target="_blank"
                rel="noreferrer"
              >
                <Download />
                دانلود ویندوز
              </a>
            </Button>
            <ImportDialog />
            <Button variant="secondary" onClick={testAll} disabled={testingAll || !entries.length}>
              <Timer />
              {testingAll ? "در حال تست…" : "تست همه"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="بارگذاری نمونه"
              onClick={() => {
                loadSamples();
                toast.message("نمونه‌ها بارگذاری شدند");
              }}
            >
              <RotateCcw />
            </Button>
            <SettingsSheet />
          </div>
        </div>
        <p className="border-t border-border px-4 py-2 text-xs leading-relaxed text-subtle">
          پیش‌نمایش مرورگر ترافیک ویندوز را تونل نمی‌کند. برای وصل شدن واقعی، دکمهٔ «دانلود ویندوز» را بزنید
          و <code className="font-mono text-fg">Polaris.exe</code> را اجرا کنید. اینجا لینک / JSON نپسترنت /
          Clash را می‌چسبانید؛ نوع، امنیت و مکان را می‌بینید؛ فقط تست دیلی می‌گیرد و اگر سرور ایران باشد
          «مشکل‌دار» می‌زند.
        </p>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`w-full shrink-0 border-l border-border bg-surface md:w-80 lg:w-96 ${
            mobilePanel === "detail" ? "hidden md:flex md:flex-col" : "flex flex-col"
          }`}
        >
          <ConfigList
            testingId={testingId}
            onTest={(id) => {
              void testOne(id);
            }}
            onSelect={(id) => {
              select(id);
              setMobilePanel("detail");
            }}
          />
        </aside>
        <main
          className={`min-w-0 flex-1 bg-bg ${mobilePanel === "list" ? "hidden md:block" : "block"}`}
        >
          {selected ? (
            <ConfigDetail
              entry={selected}
              testing={testingId === selected.config.id}
              onTest={() => testOne(selected.config.id)}
              onBack={() => {
                setMobilePanel("list");
              }}
            />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface px-4 py-2 text-xs text-muted">
        <span className="tabular-nums">
          {entries.length} کانفیگ · {ok} سالم · {broken} مشکل‌دار
          {testingAll && testingId ? " · در حال تست…" : ""}
        </span>
        <span className="inline-flex items-center gap-2">
          <Gauge className="size-3.5" />
          {active ? (
            <span>
              فعال: {active.config.remark}
              {active.probe?.countryCode ? ` · ${active.probe.countryCode}` : ""}
            </span>
          ) : (
            "هیچ کانفیگی انتخاب نشده"
          )}
        </span>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full place-items-center px-6 py-16 text-center">
      <div className="max-w-sm">
        <Compass className="mx-auto size-10 text-subtle" />
        <h2 className="mt-4 text-lg font-semibold">یک کانفیگ را انتخاب کنید</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          از لیست سمت راست یک سرور بردارید یا با «ورود کانفیگ» لینک، JSON نپسترنت یا سابسکریپشن را اضافه
          کنید.
        </p>
      </div>
    </div>
  );
}