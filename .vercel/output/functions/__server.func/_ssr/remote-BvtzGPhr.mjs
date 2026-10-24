import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-D1MBmCYG.mjs";
import { t as authMiddleware } from "./middleware-ChJJIyFD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/remote-BvtzGPhr.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asBooks(payload) {
	const books = JSON.parse(payload);
	if (books?.version !== 1 || typeof books.company?.name !== "string" || !Array.isArray(books.sales) || !Array.isArray(books.products)) throw new Error("Libros inválidos");
	return books;
}
function asWorkspace(value) {
	if (value === "setup" || value === "live" || value === "sample") return value;
	throw new Error("Espacio inválido");
}
var loadLedger_createServerFn_handler = createServerRpc({
	id: "2885188afc0d03ea801b01868ed12f0f28716bbeafa088dc57311e9dc27d64ce",
	name: "loadLedger",
	filename: "src/lib/books/remote.ts"
}, (opts) => loadLedger.__executeServer(opts));
var loadLedger = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadLedger_createServerFn_handler, async ({ context }) => {
	const row = (await (await getSql())`
      select payload, workspace from ledgers where user_id = ${context.userId}
    `)[0];
	if (!row) return null;
	return {
		books: asBooks(row.payload),
		workspace: asWorkspace(row.workspace)
	};
});
var saveLedger_createServerFn_handler = createServerRpc({
	id: "deadfdef1d4f5d54dbcd4a26c436513d56ccc146390006b42f4c88bb8aab1c31",
	name: "saveLedger",
	filename: "src/lib/books/remote.ts"
}, (opts) => saveLedger.__executeServer(opts));
var saveLedger = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (typeof input?.payload !== "string" || input.payload.length > 2e6) throw new Error("Respaldo demasiado grande");
	const workspace = asWorkspace(input.workspace);
	const books = asBooks(input.payload);
	return {
		payload: JSON.stringify(books),
		workspace
	};
}).handler(saveLedger_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      insert into ledgers (user_id, payload, workspace, updated_at)
      values (${context.userId}, ${data.payload}, ${data.workspace}, now())
      on conflict (user_id) do update
      set payload = excluded.payload,
          workspace = excluded.workspace,
          updated_at = now()
    `;
	return { ok: true };
});
//#endregion
export { loadLedger_createServerFn_handler, saveLedger_createServerFn_handler };
