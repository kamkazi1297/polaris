import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/probe-B3LVYQu-.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var probeHost_createServerFn_handler = createServerRpc({
	id: "eca45b1c9bff7623ddd5b3aa222446424ec0cb75ae5c9b1513dce81b839530c7",
	name: "probeHost",
	filename: "src/lib/probe.ts"
}, (opts) => probeHost.__executeServer(opts));
var probeHost = createServerFn({ method: "POST" }).validator((d) => {
	if (!d || typeof d.host !== "string") throw new Error("host");
	const port = Number(d.port);
	if (!Number.isFinite(port)) throw new Error("port");
	return {
		host: d.host.slice(0, 253),
		port
	};
}).handler(probeHost_createServerFn_handler, async ({ data }) => {
	const { runProbe } = await import("./probe-impl.server-D2wfZezu.mjs");
	return runProbe(data.host, data.port);
});
var fetchSubscription_createServerFn_handler = createServerRpc({
	id: "15423f72a9ed5c84bc0543616804475c209db796a218ff07194ded8074999301",
	name: "fetchSubscription",
	filename: "src/lib/probe.ts"
}, (opts) => fetchSubscription.__executeServer(opts));
var fetchSubscription = createServerFn({ method: "POST" }).validator((d) => {
	if (!d || typeof d.url !== "string") throw new Error("url");
	return { url: d.url.slice(0, 2e3) };
}).handler(fetchSubscription_createServerFn_handler, async ({ data }) => {
	const { fetchRemoteList } = await import("./probe-impl.server-D2wfZezu.mjs");
	return { text: await fetchRemoteList(data.url) };
});
//#endregion
export { fetchSubscription_createServerFn_handler, probeHost_createServerFn_handler };
