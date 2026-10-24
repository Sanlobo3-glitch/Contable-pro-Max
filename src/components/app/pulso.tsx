import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { balanceSheet, dailySeries, healthReport, rangeFrom, statement } from "@/lib/books/model";
import { compactMoney } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import type { ViewId } from "./shell";
import { useMoney } from "./ui";

export function Pulso({ onJump }: { onJump: (view: ViewId) => void }) {
  const books = useBooks((s) => s.books);
  const workspace = useBooks((s) => s.workspace);
  const money = useMoney();
  const now = new Date();
  const range = rangeFrom(now, "30d");
  const health = healthReport(books, now);
  const pnl = statement(books, range.from, range.to);
  const sheet = balanceSheet(books);
  const series = dailySeries(books, now, 14);
  const ar = sheet.assets.find((a) => a.id === "cxc")?.amount ?? 0;
  const fresh = workspace === "live" && books.sales.length === 0 && books.purchases.length === 0;

  const parts = [
    ["Liquidez", health.liquidity],
    ["Margen", health.margin],
    ["Cobranza", health.collections],
    ["Inventario", health.inventory],
  ] as const;

  const steps = [
    { done: books.products.length > 0, title: "Carga el catálogo", detail: "Precio, costo y unidad. Sin producto no hay venta.", go: "inventario" as const, cta: "Ir a inventario" },
    { done: books.products.some((p) => p.stock > 0), title: "Pon existencia", detail: "Compra a un proveedor o ajusta el stock inicial.", go: "inventario" as const, cta: "Registrar stock" },
    { done: books.parties.some((p) => p.kind === "customer"), title: "Cliente, si vendes a crédito", detail: "El mostrador no exige cliente. El crédito sí.", go: "cobranza" as const, cta: "Añadir cliente" },
    { done: false, title: "Primera venta", detail: "El diario, el impuesto y el costo se escriben solos.", go: "vender" as const, cta: "Abrir caja" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Pulso</p>
          <h1 className="mt-1 text-4xl text-ink">{fresh ? "Empresa abierta. Aún sin movimiento." : "Cómo está el negocio hoy"}</h1>
          <p className="mt-1 max-w-xl text-sm text-pretty text-muted">
            {books.company.name}
            {books.company.city ? ` · ${books.company.city}` : ""}. {fresh ? "Los libros están en cero hasta que registres la operación real." : "Cada venta ya dejó su asiento, su impuesto y su costo."}
          </p>
        </div>
        <button type="button" onClick={() => onJump("vender")} className="min-h-11 rounded-xl bg-copper px-4 text-sm font-medium text-on-copper">
          Nueva venta
        </button>
      </div>

      {fresh && (
        <section className="rounded-3xl border border-line bg-card p-5">
          <h2 className="text-2xl">Para empezar a operar</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl bg-paper px-4 py-3">
                <p className="text-xs font-medium text-muted">{step.done ? "Listo" : `Paso ${index + 1}`}</p>
                <p className="mt-1 font-medium">{step.title}</p>
                <p className="mt-1 text-sm text-muted">{step.detail}</p>
                {!step.done && (
                  <button type="button" onClick={() => onJump(step.go)} className="mt-2 min-h-10 text-sm font-medium text-copper-deep">
                    {step.cta}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <section className="rounded-3xl bg-ink p-5 text-card">
          <p className="text-xs tracking-[0.14em] text-sand uppercase">Salud</p>
          {fresh ? (
            <>
              <p className="mt-2 font-display text-4xl leading-none">Aún no</p>
              <p className="mt-3 text-sm text-sand">El puntaje sale de ventas, caja y cartera reales. En cero no hay nada que calificar.</p>
            </>
          ) : (
            <>
              <p className="mt-2 font-display text-6xl tabular leading-none">{health.score}</p>
              <p className="mt-2 text-sm text-sand">de 100, con los libros de los últimos 30 días</p>
              <ul className="mt-4 space-y-2">
                {parts.map(([label, value]) => (
                  <li key={label} className="flex items-center justify-between text-sm">
                    <span className="text-sand">{label}</span>
                    <span className="tabular">{value}/25</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Caja y bancos" value={money(health.cash)} hint={health.runwayDays == null ? "Sin gastos recientes" : `Cubre ${Math.round(health.runwayDays)} días de gastos`} />
          <Metric label="Ventas netas 30d" value={money(pnl.ventas)} hint={`Margen ${Math.round(pnl.margen * 100)}%`} />
          <Metric label="Resultado 30d" value={money(pnl.resultado)} hint="Después de costo y gastos" warn={pnl.resultado < 0} />
          <Metric label="Por cobrar" value={money(ar)} hint="Saldo de crédito vivo" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-3xl border border-line bg-card p-4 md:p-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl">14 días de venta neta</h2>
            <p className="text-xs text-muted">Verde venta · cobre costo</p>
          </div>
          <div className="h-56 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={compactMoney} width={42} tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value, name) => [money(Number(value ?? 0)), name === "net" ? "Venta neta" : "Costo"]}
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-line)", borderRadius: 12 }}
                />
                <Area type="monotone" dataKey="net" stroke="var(--color-forest)" fill="var(--color-forest)" fillOpacity={0.16} strokeWidth={2} />
                <Area type="monotone" dataKey="cost" stroke="var(--color-copper)" fill="var(--color-copper)" fillOpacity={0.08} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-3xl border border-line bg-card p-4 md:p-5">
          <h2 className="text-2xl">Lo que el libro está diciendo</h2>
          <ul className="mt-3 space-y-3">
            {health.insights.length === 0 && (
              <li className="rounded-2xl bg-paper px-3 py-3 text-sm text-muted">
                {fresh ? "Cuando haya ventas, aquí aparecen quiebres de stock, cartera vencida y margen." : "Nada urgente en los libros de este periodo."}
              </li>
            )}
            {health.insights.map((insight) => (
              <li key={insight.title} className="rounded-2xl bg-paper px-3 py-3">
                <p className={insight.tone === "alert" ? "font-medium text-wine" : insight.tone === "good" ? "font-medium text-forest" : "font-medium text-ink"}>
                  {insight.title}
                </p>
                <p className="mt-1 text-sm text-pretty text-muted">{insight.detail}</p>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => onJump("copiloto")} className="mt-4 text-sm font-medium text-copper-deep">
            Hablar con el copiloto
          </button>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, hint, warn }: { label: string; value: string; hint: string; warn?: boolean }) {
  return (
    <article className="rounded-3xl border border-line bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-2 font-display text-3xl tabular leading-none ${warn ? "text-wine" : "text-ink"}`}>{value}</p>
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </article>
  );
}
