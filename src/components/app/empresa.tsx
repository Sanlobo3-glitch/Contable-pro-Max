import { useState, type FormEvent } from "react";
import { imbalance } from "@/lib/books/model";
import { CURRENCIES, TAX_PRESETS } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import type { Books } from "@/lib/books/types";
import { Button, Field } from "./ui";

export function Empresa({ notify }: { notify: (message: string) => void }) {
  const books = useBooks((s) => s.books);
  const patch = useBooks((s) => s.patchCompany);
  const reset = useBooks((s) => s.reset);
  const replace = useBooks((s) => s.replaceBooks);
  const [form, setForm] = useState(books.company);
  const gap = imbalance(books);

  function save(event: FormEvent) {
    event.preventDefault();
    const res = patch({
      ...form,
      taxRate: Number(form.taxRate),
    });
    notify(res.ok ? "Empresa actualizada. Los documentos viejos conservan su impuesto." : res.error || "No se pudo");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={save} className="space-y-3 rounded-3xl border border-line bg-card p-5">
        <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Razón social</p>
        <h1 className="text-4xl">Empresa</h1>
        <Field label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Field label="NIT o documento" value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} />
        <Field label="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Field label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <Field label="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Moneda de los libros</span>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="h-11 w-full rounded-xl border border-line bg-card px-3 text-base"
          >
            {CURRENCIES.map((code) => <option key={code}>{code}</option>)}
          </select>
        </label>
        <p className="text-xs text-muted">Cambiar la moneda solo cambia el formato. Los montos no se convierten.</p>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Impuesto de las próximas operaciones ({Math.round(Number(form.taxRate) * 100)}%)</span>
          <input
            type="range"
            min={0}
            max={0.27}
            step={0.01}
            value={form.taxRate}
            onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
            className="w-full accent-copper"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {TAX_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setForm({ ...form, taxRate: preset.rate, regime: preset.regime })}
              className="min-h-10 rounded-full bg-sand px-3 text-xs text-ink-soft"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <Field label="Régimen" value={form.regime} onChange={(e) => setForm({ ...form, regime: e.target.value })} />
        <Field label="Prefijo de comprobante" value={form.invoicePrefix} onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value.toUpperCase() })} />
        <Button type="submit">Guardar empresa</Button>
      </form>

      <div className="space-y-4">
        <section className="rounded-3xl bg-ink p-5 text-card">
          <h2 className="text-2xl text-card">Por qué esto compite</h2>
          <ul className="mt-3 space-y-3 text-sm text-sand">
            <li>Partida doble automática. Una tienda no debería aprender débitos para tener un balance que cuadra.</li>
            <li>Cartera con edad, no una lista de ventas. El crédito deja de disfrazarse de caja.</li>
            <li>Reposición por ritmo de venta y clase ABC por margen, como un inventario de verdad.</li>
            <li>Copiloto local en español. La orden se ejecuta o se rechaza; no hay cifras inventadas.</li>
            <li>Impuesto por país y moneda latinoamericana, sin prometer factura DIAN que no existe.</li>
          </ul>
        </section>
        <section className="rounded-3xl border border-line bg-card p-5">
          <h2 className="text-2xl">Tus datos</h2>
          <p className="mt-1 text-sm text-muted">
            Viven en este navegador. {Math.abs(gap) < 1 ? "Los libros están cuadrados." : `Hay un descuadre de ${gap}.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                const blob = new Blob([JSON.stringify(books, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "contable-pro-libros.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Exportar JSON
            </Button>
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-card px-4 text-sm font-medium">
              Importar
              <input
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const data = JSON.parse(await file.text()) as Books;
                    if (data.version !== 1 || !data.company || !Array.isArray(data.sales)) throw new Error("formato");
                    replace(data);
                    notify("Libros importados");
                  } catch {
                    notify("Ese archivo no es un libro de Contable Pro");
                  }
                }}
              />
            </label>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm("¿Volver a los datos de demostración? Se pierde lo que registraste aquí.")) reset();
              }}
            >
              Restaurar demo
            </Button>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted">
            Contable Pro · desarrollado por Richard J. Lobo S. La representación gráfica no sustituye la factura electrónica de la DIAN ni de otra autoridad fiscal.
          </p>
        </section>
      </div>
    </div>
  );
}
