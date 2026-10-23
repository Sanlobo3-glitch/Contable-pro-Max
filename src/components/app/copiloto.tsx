import { useState } from "react";
import { healthReport, simulate } from "@/lib/books/model";
import { useBooks } from "@/lib/books/store";
import type { ViewId } from "./shell";
import { useMoney } from "./ui";

const EXAMPLES = [
  "vender 2 café de origen a ana efectivo",
  "vender 1 miel tarjeta",
  "compra 12 panela a alimentos credito",
  "gasto 180000 domicilio del día",
  "cobrar 50000 a ana ríos",
];

export function Copiloto({ onJump }: { onJump: (view: ViewId) => void }) {
  const books = useBooks((s) => s.books);
  const command = useBooks((s) => s.command);
  const money = useMoney();
  const [text, setText] = useState("");
  const [log, setLog] = useState<{ ok: boolean; text: string; reply: string }[]>([]);
  const [price, setPrice] = useState(8);
  const [volume, setVolume] = useState(-3);
  const now = new Date();
  const health = healthReport(books, now);
  const sim = simulate(books, now, price, volume);

  function run(value: string) {
    const clean = value.trim();
    if (!clean) return;
    const res = command(clean);
    setLog((prev) => [{ ok: res.ok, text: clean, reply: res.message }, ...prev].slice(0, 8));
    if (res.ok) setText("");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <section>
        <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">En este dispositivo</p>
        <h1 className="mt-1 text-4xl">Copiloto</h1>
        <p className="mt-2 max-w-xl text-sm text-pretty text-muted">
          No inventa cifras. Lee los libros y ejecuta órdenes en español: venta, compra, gasto o abono. Si no entiende, no toca nada.
        </p>
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            run(text);
          }}
        >
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder="vender 2 café de origen a ana efectivo"
            className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-copper"
          />
          <button type="submit" className="mt-2 min-h-11 rounded-xl bg-copper px-4 text-sm font-medium text-on-copper">
            Ejecutar
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button key={example} type="button" onClick={() => run(example)} className="min-h-10 rounded-full bg-sand px-3 text-left text-xs text-ink-soft">
              {example}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {log.map((item, index) => (
            <li key={`${item.text}-${index}`} className="rounded-2xl border border-line bg-card px-4 py-3">
              <p className="text-xs text-muted">{item.text}</p>
              <p className={`mt-1 text-sm ${item.ok ? "text-ink" : "text-wine"}`}>{item.reply}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-4">
        <section className="rounded-3xl border border-line bg-card p-4">
          <h2 className="text-2xl">Lectura de hoy</h2>
          <ul className="mt-3 space-y-3">
            {health.insights.map((insight) => (
              <li key={insight.title}>
                <p className="font-medium">{insight.title}</p>
                <p className="text-sm text-muted">{insight.detail}</p>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => onJump("cobranza")} className="mt-3 text-sm font-medium text-copper-deep">
            Ir a cobranza
          </button>
        </section>

        <section className="rounded-3xl border border-line bg-card p-4">
          <h2 className="text-2xl">Simulador de precio</h2>
          <p className="mt-1 text-sm text-muted">Qué pasa con el margen de los últimos 30 días si cambias precio y volumen. No altera los libros.</p>
          <label className="mt-4 block text-sm">
            Precio {price > 0 ? "+" : ""}{price}%
            <input type="range" min={-20} max={30} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-2 w-full accent-copper" />
          </label>
          <label className="mt-3 block text-sm">
            Volumen {volume > 0 ? "+" : ""}{volume}%
            <input type="range" min={-30} max={30} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="mt-2 w-full accent-copper" />
          </label>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Venta neta actual</dt><dd className="tabular">{money(sim.base.ventas)}</dd></div>
            <div className="flex justify-between"><dt>Venta neta simulada</dt><dd className="tabular">{money(sim.projectedNet)}</dd></div>
            <div className="flex justify-between"><dt>Margen actual</dt><dd className="tabular">{Math.round(sim.base.margen * 100)}%</dd></div>
            <div className="flex justify-between font-medium"><dt>Margen simulado</dt><dd className="tabular">{Math.round(sim.projectedMargin * 100)}%</dd></div>
            <div className={`flex justify-between ${sim.delta >= 0 ? "text-forest" : "text-wine"}`}>
              <dt>Utilidad bruta</dt>
              <dd className="tabular">{sim.delta >= 0 ? "+" : ""}{money(sim.delta)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
