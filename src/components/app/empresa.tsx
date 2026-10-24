import { useState, type FormEvent } from "react";
import { imbalance } from "@/lib/books/model";
import { CURRENCIES, TAX_PRESETS } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import type { Books } from "@/lib/books/types";
import { Button, Field } from "./ui";

export function Empresa({ notify }: { notify: (message: string) => void }) {
  const books = useBooks((s) => s.books);
  const workspace = useBooks((s) => s.workspace);
  const patch = useBooks((s) => s.patchCompany);
  const loadSample = useBooks((s) => s.loadSample);
  const beginSetup = useBooks((s) => s.beginSetup);
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
        <section className="rounded-3xl border border-line bg-card p-5">
          <h2 className="text-2xl">Respaldo</h2>
          <p className="mt-1 text-sm text-muted">
            {workspace === "sample"
              ? "Estás recorriendo la empresa de ejemplo. Créala tuya antes de registrar clientes reales."
              : "Estos libros son de tu empresa y se guardan en tu cuenta."}{" "}
            {Math.abs(gap) < 1 ? "Están cuadrados." : `Hay un descuadre de ${gap}.`} Exporta una copia antes de cambiar de equipo.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                const blob = new Blob([JSON.stringify(books, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${books.company.name || "contable-pro"}-libros.json`.replace(/\s+/g, "-").toLowerCase();
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Exportar respaldo
            </Button>
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-card px-4 text-sm font-medium">
              Importar respaldo
              <input
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  try {
                    const data = JSON.parse(await file.text()) as Books;
                    if (data.version !== 1 || !data.company?.name || !Array.isArray(data.sales)) throw new Error("formato");
                    replace(data);
                    setForm(data.company);
                    notify("Libros de tu empresa restaurados");
                  } catch {
                    notify("Ese archivo no es un respaldo de Contable Pro");
                  }
                }}
              />
            </label>
          </div>
        </section>
        <section className="rounded-3xl border border-line bg-card p-5">
          <h2 className="text-2xl">Empresa</h2>
          <p className="mt-1 text-sm text-muted">
            Cerrar vuelve al alta, en blanco. El ejemplo de Mercado Andino es aparte y no se mezcla con tus comprobantes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm("¿Cerrar esta empresa y abrir otra? Se pierde lo que no hayas exportado.")) beginSetup();
              }}
            >
              Nueva empresa
            </Button>
            {workspace !== "sample" && (
              <Button
                variant="ghost"
                onClick={() => {
                  if (window.confirm("¿Cargar Mercado Andino? Reemplaza los libros actuales por la empresa de ejemplo.")) loadSample();
                }}
              >
                Ver empresa de ejemplo
              </Button>
            )}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted">
            Contable Pro · desarrollado por Richard J. Lobo S. El comprobante es una representación interna. No sustituye la factura electrónica de la DIAN ni de otra autoridad fiscal.
          </p>
        </section>
      </div>
    </div>
  );
}
