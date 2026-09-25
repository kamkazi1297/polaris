import { createServerFn } from "@tanstack/react-start";
import type { ProbeResult } from "./config/types";

export const probeHost = createServerFn({ method: "POST" })
  .validator((d: { host: string; port: number }) => {
    if (!d || typeof d.host !== "string") throw new Error("host");
    const port = Number(d.port);
    if (!Number.isFinite(port)) throw new Error("port");
    return { host: d.host.slice(0, 253), port };
  })
  .handler(async ({ data }): Promise<ProbeResult> => {
    const { runProbe } = await import("./probe-impl.server.ts");
    return runProbe(data.host, data.port);
  });

export const fetchSubscription = createServerFn({ method: "POST" })
  .validator((d: { url: string }) => {
    if (!d || typeof d.url !== "string") throw new Error("url");
    return { url: d.url.slice(0, 2000) };
  })
  .handler(async ({ data }): Promise<{ text: string }> => {
    const { fetchRemoteList } = await import("./probe-impl.server.ts");
    const text = await fetchRemoteList(data.url);
    return { text };
  });
