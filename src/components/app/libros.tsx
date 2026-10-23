import { useState } from "react";
import { ACCOUNTS, balanceSheet, buildJournal, cashFlow, rangeFrom, statement } from "@/lib/books/model";
import { formatWhen } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import { useMoney } from "./ui";

type Period = "7d" | "30d" | "mes" | "anio" | "todo";
type Tab = "diario" | "resultados" | "balance" | "flujo";

export function Libros() {
  const books = useBooks((s) => s.books);
  const money = useMoney();
  const [period, setPeriod] = useState<Period>("30d");
  const [tab, setTab] = useState<Tab>("diario");
  const now = new Date();
  const range = rangeFrom(now, period);
  const journal = buildJournal(books).filter((e) => {
    const t = new Date(e.at).getTime();
    if (range.from && t < new Date(range.from).getTime()) return false;
    if (range.to && t >= new Date(range.to).getTime()) return false;
    return true;
  });
  const pnl = statement(books, range.from, range.to);
  const sheet = balanceSheet(books, range.to);
  const flow = cashFlow(books, range.from, range.to);
  const gap = sheet.assetTotal - sheet.liabilityTotal - sheet.equityTotal;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Contabilidad</p>
          <h1 className="mt-1 text-4xl">Libros</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">El diario no se digita: nace de ventas, compras, abonos y gastos. El balance tiene que cuadrar solo.</p>
        </div>
        <button type="button" onClick={() => window.print()} className="no-print min-h-11 rounded-xl border border-line bg-card px-4 text-sm font-medium">
          Imprimir
        </button>
      </div>
      <div className="no-print mt-4 flex gap-2 overflow-x-auto">
        {(
          [
            ["7d", "7 días"],
            ["30d", "30 días"],
            ["mes", "Este mes"],
            ["anio", "Año"],
            ["todo", "Todo"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setPeriod(id)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm ${period === id ? "bg-ink text-card" : "bg-sand text-ink-soft"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="no-print mt-3 flex gap-2 overflow-x-auto">
        {(
          [
            ["diario", "Diario"],
            ["resultados", "Resultados"],
            ["balance", "Balance"],
            ["flujo", "Flujo de caja"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm ${tab === id ? "bg-copper text-on-copper" : "bg-card text-ink-soft border border-line"}`}>
            {label}
          </button>
        ))}
      </div>

      <article className="mt-4 rounded-3xl border border-line bg-card p-4 md:p-6">
        <header className="mb-4">
          <p className="font-medium">{books.company.name}</p>
          <p className="text-xs text-muted">NIT {books.company.nit} · {books.company.city}</p>
        </header>

        {tab === "diario" && (
          <ul className="space-y-4">
            {journal.length === 0 && <li className="text-sm text-muted">Sin asientos en este periodo.</li>}
            {journal.slice().reverse().slice(0, 60).map((entry) => (
              <li key={entry.id}>
                <div className="flex justify-between gap-3 text-sm">
                  <p className="font-medium">{entry.ref} · {entry.memo}</p>
                  <p className="text-xs text-muted">{formatWhen(entry.at)}</p>
                </div>
                <table className="mt-1 w-full text-sm">
                  <tbody>
                    {entry.lines.map((line, index) => (
                      <tr key={`${entry.id}-${index}`}>
                        <td className="py-0.5 text-ink-soft">{ACCOUNTS[line.account]}</td>
                        <td className="w-28 text-right tabular">{line.debit ? money(line.debit) : ""}</td>
                        <td className="w-28 text-right tabular">{line.credit ? money(line.credit) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </li>
            ))}
          </ul>
        )}

        {tab === "resultados" && (
          <dl className="mx-auto max-w-md space-y-2 text-sm">
            <Line k="Ingresos por ventas" v={money(pnl.ventas)} />
            <Line k="Costo de ventas" v={money(-pnl.costo)} />
            <Line k="Utilidad bruta" v={money(pnl.bruto)} strong />
            <Line k="Otros ingresos" v={money(pnl.otros)} />
            <Line k="Gastos operativos" v={money(-pnl.gastos)} />
            <Line k="Resultado" v={money(pnl.resultado)} strong />
            <p className="pt-2 text-xs text-muted">Margen bruto {Math.round(pnl.margen * 100)}%. El impuesto no es gasto: vive en el balance.</p>
          </dl>
        )}

        {tab === "balance" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Column title="Activo" rows={sheet.assets.map((a) => [a.label, money(a.amount)])} total={money(sheet.assetTotal)} />
            <div>
              <Column title="Pasivo" rows={sheet.liabilities.map((a) => [a.label, money(a.amount)])} total={money(sheet.liabilityTotal)} />
              <div className="mt-4">
                <Column title="Patrimonio" rows={sheet.equity.map((a) => [a.label, money(a.amount)])} total={money(sheet.equityTotal)} />
              </div>
              <p className={`mt-3 text-xs ${Math.abs(gap) > 1 ? "text-wine" : "text-forest"}`}>
                {Math.abs(gap) > 1 ? `Descuadre ${money(gap)}` : "Activo = pasivo + patrimonio"}
              </p>
            </div>
          </div>
        )}

        {tab === "flujo" && (
          <dl className="mx-auto max-w-md space-y-2 text-sm">
            {flow.rows.map((row) => (
              <Line key={row.label} k={row.label} v={money(row.amount)} />
            ))}
            <Line k="Variación de caja y bancos" v={money(flow.net)} strong />
            <p className="pt-2 text-xs text-muted">Método directo, solo efectivo. La venta a crédito aparece cuando se cobra, no cuando se factura.</p>
          </dl>
        )}
      </article>
    </div>
  );
}

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 border-t border-line py-2 ${strong ? "font-medium" : ""}`}>
      <dt>{k}</dt>
      <dd className="tabular">{v}</dd>
    </div>
  );
}

function Column({ title, rows, total }: { title: string; rows: [string, string][]; total: string }) {
  return (
    <div>
      <h2 className="text-2xl">{title}</h2>
      <ul className="mt-2 text-sm">
        {rows.map(([k, v]) => (
          <li key={k} className="flex justify-between border-t border-line py-2">
            <span>{k}</span>
            <span className="tabular">{v}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-line py-2 font-medium">
          <span>Total</span>
          <span className="tabular">{total}</span>
        </li>
      </ul>
    </div>
  );
}
