import { Badge } from "@/components/ui/badge";
import type { HealthStatus, SecurityLevel } from "@/lib/config/types";

export function HealthBadge({ status }: { status: HealthStatus }) {
  const map = {
    ok: { tone: "ok" as const, label: "سالم" },
    broken: { tone: "bad" as const, label: "مشکل‌دار" },
    invalid: { tone: "bad" as const, label: "نامعتبر" },
    dead: { tone: "warn" as const, label: "بدون پاسخ" },
    warn: { tone: "warn" as const, label: "هشدار مکان" },
    unknown: { tone: "neutral" as const, label: "تست نشده" },
  };
  const v = map[status];
  return <Badge tone={v.tone}>{v.label}</Badge>;
}

export function SecurityBadge({ level, label }: { level: SecurityLevel; label: string }) {
  const tone = level === "high" ? "ok" : level === "medium" ? "info" : level === "low" ? "warn" : "bad";
  return <Badge tone={tone}>{label}</Badge>;
}
