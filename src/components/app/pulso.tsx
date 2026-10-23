import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { balanceSheet, dailySeries, healthReport, rangeFrom, statement } from "@/lib/books/model";
import { compactMoney } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import type { ViewId } from "./shell";
import { useMoney } from "./ui";

export function Pulso({ onJump }: { onJump: (view: ViewId) => void }) {
  const books = useBooks((s) => s.books);
  const money = useMoney();
  const now = new Date();
  const range = rangeFrom(now, "30d");
  const health = healthReport(books, now);
  const pnl = statement(books, range.from, range.to);
  const sheet = balanceSheet(books);
  const series = dailySeries(books, now, 14);
  const ar = sheet.assets.find((a) => a.id === "cxc")?.amount ?? 0;
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    setShowIntro(localStorage.getItem("contable-pro-intro") !== "off");
  }, []);

  const parts = [
    ["Liquidez", health.liquidity],
    ["Margen", health.margin],
    ["Cobranza", health.collections],
    ["Inventario", health.inventory],
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Pulso</p>
          <h1 className="mt-1 text-4xl text-ink">Cómo está el negocio hoy</h1>
          <p className="mt-1 max-w-xl text-sm text-pretty text-muted">
            {books.company.name} · {books.company.city}. Cada venta ya dejó su asiento, su IVA y su costo.
          </p>
        </div>
        <button type="button" onClick={() => onJump("vender")} className="min-h-11 rounded-xl bg-copper px-4 text-sm font-medium text-on-copper">
          Nueva venta
        </button>
      </div>

      {showIntro && (
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="font-medium">Taller con datos de un mercado en Chapinero</p>
          <p className="mt-1 text-sm text-pretty text-muted">
            Lo que InventarioPro registraba como movimiento, aquí cierra libros: partida doble, cartera vencida y un copiloto que ejecuta órdenes en español. Todo queda en este navegador.
          </p>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-copper-deep"
            onClick={() => {
              localStorage.setItem("contable-pro-intro", "off");
              setShowIntro(false);
            }}
          >
            Entendido
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <section className="rounded-3xl bg-ink p-5 text-card">
          <p className="text-xs tracking-[0.14em] text-sand uppercase">Salud</p>
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
