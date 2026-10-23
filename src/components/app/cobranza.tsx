import { useState } from "react";
import { agingPayable, agingReceivable, type AgingDoc } from "@/lib/books/model";
import { formatDay } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import { Button, Empty, Field, Pill, Select, useMoney } from "./ui";

const BUCKETS: { id: AgingDoc["bucket"]; label: string }[] = [
  { id: "al_dia", label: "Al día" },
  { id: "d1_30", label: "1–30" },
  { id: "d31_60", label: "31–60" },
  { id: "d61_90", label: "61–90" },
  { id: "d90", label: "+90" },
];

export function Cobranza({ notify }: { notify: (message: string) => void }) {
  const books = useBooks((s) => s.books);
  const collect = useBooks((s) => s.collect);
  const pay = useBooks((s) => s.paySupplier);
  const saveParty = useBooks((s) => s.saveParty);
  const [tab, setTab] = useState<"cobrar" | "pagar" | "directorio">("cobrar");
  const money = useMoney();
  const now = new Date();
  const rows = tab === "pagar" ? agingPayable(books, now) : agingReceivable(books, now);
  const total = rows.reduce((s, r) => s + r.open, 0);
  const max = Math.max(1, ...BUCKETS.map((b) => rows.filter((r) => r.bucket === b.id).reduce((s, r) => s + r.open, 0)));

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Cartera</p>
      <h1 className="mt-1 text-4xl">Cobranza</h1>
      <p className="mt-1 max-w-xl text-sm text-muted">Una venta a crédito no es caja. Aquí se ve quién debe, desde cuándo, y se registra el abono contra el saldo real.</p>
      <div className="mt-4 flex gap-2">
        {(
          [
            ["cobrar", "Por cobrar"],
            ["pagar", "Por pagar"],
            ["directorio", "Directorio"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`min-h-10 rounded-full px-4 text-sm ${tab === id ? "bg-ink text-card" : "bg-sand text-ink-soft"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab !== "directorio" && (
        <>
          <p className="mt-4 font-display text-3xl tabular">{money(total)}</p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {BUCKETS.map((bucket) => {
              const amount = rows.filter((r) => r.bucket === bucket.id).reduce((s, r) => s + r.open, 0);
              return (
                <div key={bucket.id}>
                  <div className="flex h-24 items-end rounded-xl bg-sand">
                    <div className="w-full rounded-xl bg-copper" style={{ height: `${Math.max(6, (amount / max) * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{bucket.label}</p>
                  <p className="text-xs tabular">{money(amount)}</p>
                </div>
              );
            })}
          </div>
          <ul className="mt-4 divide-y divide-line rounded-3xl border border-line bg-card px-4">
            {rows.length === 0 && (
              <li className="py-8 text-center text-sm text-muted">No hay saldos abiertos.</li>
            )}
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{row.party}</p>
                  <p className="text-xs text-muted">{row.number} · vence {formatDay(row.dueAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="tabular font-medium">{money(row.open)}</p>
                    <Pill tone={row.daysLate > 0 ? "wine" : "forest"}>{row.daysLate > 0 ? `${row.daysLate} días tarde` : "Al día"}</Pill>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const res = tab === "pagar"
                        ? pay(row.partyId, row.open, "banco")
                        : collect(row.partyId, row.open, "caja");
                      notify(res.ok ? "Saldo aplicado" : res.error || "No se pudo");
                    }}
                  >
                    {tab === "pagar" ? "Pagar" : "Cobrar"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === "directorio" && (
        <Directorio
          onCreate={(input) => {
            const res = saveParty(input);
            notify(res.ok ? "Contacto guardado" : res.error || "No se pudo");
            return res.ok;
          }}
        />
      )}
    </div>
  );
}

function Directorio({
  onCreate,
}: {
  onCreate: (input: { kind: "customer" | "supplier"; name: string; document: string; email: string; phone: string; address: string; termsDays: number }) => boolean;
}) {
  const parties = useBooks((s) => s.books.parties);
  const [kind, setKind] = useState<"customer" | "supplier">("customer");
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [terms, setTerms] = useState("15");
  const list = parties.filter((p) => p.kind === kind);
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
      <form
        className="space-y-3 rounded-3xl border border-line bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const ok = onCreate({ kind, name, document, email: "", phone: "", address: "", termsDays: Number(terms) || 0 });
          if (ok) {
            setName("");
            setDocument("");
          }
        }}
      >
        <Select label="Tipo" value={kind} onChange={(e) => setKind(e.target.value as "customer" | "supplier")}>
          <option value="customer">Cliente</option>
          <option value="supplier">Proveedor</option>
        </Select>
        <Field label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
        <Field label="Documento" value={document} onChange={(e) => setDocument(e.target.value)} />
        <Field label="Plazo en días" value={terms} onChange={(e) => setTerms(e.target.value)} />
        <Button type="submit" className="w-full">Guardar</Button>
      </form>
      {list.length === 0 ? <Empty title="Sin contactos" text="Agrega el primero para venderle a crédito." /> : (
        <ul className="divide-y divide-line rounded-3xl border border-line bg-card px-4">
          {list.map((p) => (
            <li key={p.id} className="py-3">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted">{p.document || "Sin documento"} · plazo {p.termsDays} días</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
