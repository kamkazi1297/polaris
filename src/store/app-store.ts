import { create } from "zustand";
import { persist } from "zustand/middleware";
import { diagnose } from "@/lib/config/analyze";
import { sampleConfigs } from "@/lib/config/samples";
import {
  DEFAULT_SETTINGS,
  emptyConfig,
  type ClientSettings,
  type HealthStatus,
  type ProbeResult,
  type ProxyConfig,
} from "@/lib/config/types";

export interface ConfigEntry {
  config: ProxyConfig;
  probe?: ProbeResult | null;
  health: HealthStatus;
  testedAt?: number;
}

interface AppState {
  hydrated: boolean;
  entries: ConfigEntry[];
  selectedId: string | null;
  activeId: string | null;
  settings: ClientSettings;
  query: string;
  protocolFilter: string;
  healthFilter: "all" | "broken" | "ok" | "untested" | "dead";
  sortMode: "default" | "delay" | "name";
  setHydrated: (v: boolean) => void;
  select: (id: string | null) => void;
  setQuery: (q: string) => void;
  setProtocolFilter: (p: string) => void;
  setHealthFilter: (h: AppState["healthFilter"]) => void;
  setSortMode: (m: AppState["sortMode"]) => void;
  addConfigs: (configs: ProxyConfig[]) => number;
  addBlank: () => string;
  duplicate: (id: string) => string | null;
  updateConfig: (id: string, patch: Partial<ProxyConfig>) => void;
  remove: (id: string) => void;
  clear: () => void;
  setProbe: (id: string, probe: ProbeResult) => void;
  setActive: (id: string | null) => void;
  updateSettings: (patch: Partial<ClientSettings>) => void;
  loadSamples: () => void;
}

function withHealth(config: ProxyConfig, probe?: ProbeResult | null): ConfigEntry {
  return { config, probe, health: diagnose(config, probe).status, testedAt: probe ? Date.now() : undefined };
}

const INITIAL_ENTRIES: ConfigEntry[] = sampleConfigs().map((c) => withHealth(c));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: true,
      entries: INITIAL_ENTRIES,
      selectedId: INITIAL_ENTRIES[0]?.config.id ?? null,
      activeId: null,
      settings: DEFAULT_SETTINGS,
      query: "",
      protocolFilter: "all",
      healthFilter: "all",
      sortMode: "default",
      setHydrated: (v) => set({ hydrated: v }),
      select: (id) => set({ selectedId: id }),
      setQuery: (query) => set({ query }),
      setProtocolFilter: (protocolFilter) => set({ protocolFilter }),
      setHealthFilter: (healthFilter) => set({ healthFilter }),
      setSortMode: (sortMode) => set({ sortMode }),
      addConfigs: (configs) => {
        const existing = new Set(
          get().entries.map(
            (e) => `${e.config.protocol}|${e.config.address}|${e.config.port}|${e.config.uuid}|${e.config.password}`,
          ),
        );
        const fresh: ConfigEntry[] = [];
        for (const c of configs) {
          const key = `${c.protocol}|${c.address}|${c.port}|${c.uuid}|${c.password}`;
          if (existing.has(key)) continue;
          existing.add(key);
          fresh.push(withHealth(c));
        }
        if (!fresh.length) return 0;
        set((s) => ({
          entries: [...fresh, ...s.entries],
          selectedId: fresh[0].config.id,
        }));
        return fresh.length;
      },
      addBlank: () => {
        const cfg = emptyConfig({ remark: "کانفیگ جدید", source: "uri" });
        set((s) => ({
          entries: [withHealth(cfg), ...s.entries],
          selectedId: cfg.id,
        }));
        return cfg.id;
      },
      duplicate: (id) => {
        const src = get().entries.find((e) => e.config.id === id);
        if (!src) return null;
        const copy = {
          ...src.config,
          id: crypto.randomUUID(),
          extra: { ...src.config.extra },
          remark: `${src.config.remark || src.config.address} (کپی)`,
        };
        set((s) => ({
          entries: [withHealth(copy), ...s.entries],
          selectedId: copy.id,
        }));
        return copy.id;
      },
      updateConfig: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.config.id === id ? withHealth({ ...e.config, ...patch }, e.probe) : e,
          ),
        })),
      remove: (id) =>
        set((s) => ({
          entries: s.entries.filter((e) => e.config.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
          activeId: s.activeId === id ? null : s.activeId,
        })),
      clear: () => set({ entries: [], selectedId: null, activeId: null }),
      setProbe: (id, probe) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.config.id === id ? withHealth(e.config, probe) : e)),
        })),
      setActive: (id) => set({ activeId: id, selectedId: id ?? get().selectedId }),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      loadSamples: () =>
        set({
          entries: sampleConfigs().map((c) => withHealth(c)),
          selectedId: null,
          activeId: null,
        }),
    }),
    {
      name: "polaris-client",
      partialize: (s) => ({
        entries: s.entries,
        selectedId: s.selectedId,
        activeId: s.activeId,
        settings: s.settings,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        return {
          ...current,
          ...p,
          settings: { ...DEFAULT_SETTINGS, ...p.settings },
          entries: Array.isArray(p.entries) ? p.entries : current.entries,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
