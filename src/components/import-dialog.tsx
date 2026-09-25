import { useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { parseInput } from "@/lib/config/parse";
import { fetchSubscription } from "@/lib/probe";
import { useAppStore } from "@/store/app-store";
import { ClipboardPaste, FilePlus2 } from "lucide-react";

export function ImportDialog() {
  const addConfigs = useAppStore((s) => s.addConfigs);
  const addBlank = useAppStore((s) => s.addBlank);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function importText(raw: string) {
    const parsed = parseInput(raw);
    if (!parsed.length) {
      toast.error("هیچ کانفیگ معتبری پیدا نشد");
      return;
    }
    const n = addConfigs(parsed);
    if (!n) {
      toast.message("این کانفیگ‌ها از قبل در لیست هستند");
      return;
    }
    toast.success(`${n} کانفیگ اضافه شد`);
    setText("");
    setOpen(false);
  }

  async function importUrl() {
    if (!url.trim()) return;
    setBusy(true);
    try {
      const { text: body } = await fetchSubscription({ data: { url: url.trim() } });
      const parsed = parseInput(body);
      if (!parsed.length) {
        toast.error("هیچ کانفیگ معتبری پیدا نشد");
        return;
      }
      let group = "";
      try {
        group = new URL(url.trim()).hostname;
      } catch {
        group = "subscription";
      }
      const tagged = parsed.map((c) => ({ ...c, source: "subscription" as const, group: c.group || group }));
      const n = addConfigs(tagged);
      if (!n) {
        toast.message("این کانفیگ‌ها از قبل در لیست هستند");
        return;
      }
      toast.success(`${n} کانفیگ از سابسکریپشن اضافه شد`);
      setUrl("");
      setOpen(false);
    } catch {
      toast.error("دریافت سابسکریپشن ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function fromClipboard() {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip.trim()) {
        toast.error("کلیپ‌بورد خالی است");
        return;
      }
      setText(clip);
      await importText(clip);
    } catch {
      toast.error("دسترسی به کلیپ‌بورد ممکن نشد؛ متن را بچسبانید");
    }
  }

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? "");
      setText(raw);
      void importText(raw);
    };
    reader.readAsText(file);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FilePlus2 />
          ورود کانفیگ
        </Button>
      </DialogTrigger>
      <DialogContent
        title="ورود کانفیگ"
        description="لینک VLESS / VMess / Trojan / SS / Hysteria2 / TUIC / WireGuard، جیسون Xray، Clash، sing-box یا NapsternetV را بچسبانید."
      >
        <div
          className="grid gap-4"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) onFile(file);
          }}
        >
          <Textarea
            dir="ltr"
            placeholder={"vless://...\nvmess://...\n{ \"ps\": \"npv\", \"add\": \"...\", \"configType\": \"vless\" }"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-48"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={() => importText(text)} disabled={!text.trim()}>
              افزودن
            </Button>
            <Button variant="secondary" onClick={fromClipboard}>
              <ClipboardPaste />
              کلیپ‌بورد
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                addBlank();
                setOpen(false);
                toast.message("کانفیگ خالی اضافه شد — فیلدها را پر کنید");
              }}
            >
              دستی
            </Button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.json,.yaml,.yml,.npv,text/plain,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
                e.target.value = "";
              }}
            />
            <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
              انتخاب فایل
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setText("");
              }}
            >
              پاک کردن
            </Button>
          </div>
          <div className="grid gap-2 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted">سابسکریپشن (آدرس https)</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                dir="ltr"
                className="font-mono text-xs"
                placeholder="https://example.com/sub"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button variant="secondary" onClick={importUrl} disabled={busy || !url.trim()}>
                {busy ? "در حال دریافت…" : "دریافت"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
