import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Books } from "./types";

function asBooks(payload: string): Books {
  const books = JSON.parse(payload) as Books;
  if (books?.version !== 1 || typeof books.company?.name !== "string" || !Array.isArray(books.sales) || !Array.isArray(books.products)) {
    throw new Error("Libros inválidos");
  }
  return books;
}

function asWorkspace(value: string): "setup" | "live" | "sample" {
  if (value === "setup" || value === "live" || value === "sample") return value;
  throw new Error("Espacio inválido");
}

export const loadLedger = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ payload: string; workspace: string }>`
      select payload, workspace from ledgers where user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) return null;
    return { books: asBooks(row.payload), workspace: asWorkspace(row.workspace) };
  });

export const saveLedger = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { payload: string; workspace: string }) => {
    if (typeof input?.payload !== "string" || input.payload.length > 2_000_000) {
      throw new Error("Respaldo demasiado grande");
    }
    const workspace = asWorkspace(input.workspace);
    const books = asBooks(input.payload);
    return { payload: JSON.stringify(books), workspace };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into ledgers (user_id, payload, workspace, updated_at)
      values (${context.userId}, ${data.payload}, ${data.workspace}, now())
      on conflict (user_id) do update
      set payload = excluded.payload,
          workspace = excluded.workspace,
          updated_at = now()
    `;
    return { ok: true as const };
  });
