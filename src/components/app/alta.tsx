import { useState, type FormEvent } from "react";
import { CURRENCIES, TAX_PRESETS } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import type { Company } from "@/lib/books/types";
import { Button, Field } from "./ui";

function openingAmount(raw: string): number | null {
  const s = raw.trim();
  if (!s) return 0;
  const normalized = s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export function Alta() {
  const openLive = useBooks((s) => s.openLive);
  const loadSample = useBooks((s) => s.loadSample);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Company & { cash: string; bank: string }>({
    name: "",
    nit: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    currency: "COP",
    taxRate: 0.19,
    invoicePrefix: "FE",
    regime: "Responsable de IVA",
    cash: "",
    bank: "",
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const cash = openingAmount(form.cash);
    const bank = openingAmount(form.bank);
    if (cash == null || bank == null) {
      setError("Revisa caja y banco. Usa solo números, o déjalos vacíos.");
      return;
    }
    const res = openLive(form, { cash, bank });
    if (!res.ok) setError(res.error);
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto grid min-h-screen max-w-5xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-between bg-ink px-6 py-10 text-card md:px-10 md:py-14">
          <div>
            <div className="grid size-12 place-items-center rounded-xl bg-card font-display text-xl text-ink">Cp</div>
            <p className="mt-8 text-xs font-medium tracking-[0.16em] text-sand uppercase">Contable Pro</p>
            <h1 className="mt-3 max-w-md text-4xl text-card md:text-5xl">Tus libros. No los de una empresa inventada.</h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand">
              Das de alta tu razón social y arrancas en cero. Cada venta, compra y cobro escribe la partida doble, el impuesto y el inventario.
            </p>
            <ol className="mt-8 space-y-3 text-sm text-sand">
              <li>1. Empresa, moneda e impuesto</li>
              <li>2. Productos con precio y existencia</li>
              <li>3. La primera venta ya queda en el diario</li>
            </ol>
          </div>
          <p className="mt-10 text-xs leading-relaxed text-sand">
            Desarrollado por Richard J. Lobo S. Los libros quedan en tu cuenta. Desde Empresa puedes exportar un respaldo.
          </p>
        </section>

        <form onSubmit={submit} className="space-y-3 px-5 py-8 md:px-10 md:py-12">
          <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Alta</p>
          <h2 className="text-3xl">Abrir una empresa</h2>
          <Field label="Razón social" value={form.name} required placeholder="Panadería Luna S.A.S." onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label="NIT o documento" value={form.nit} placeholder="900.000.000-1" onChange={(e) => setForm({ ...form, nit: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Ciudad" value={form.city} placeholder="Bogotá" onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Field label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Field label="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Field label="Correo" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Moneda</span>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="h-11 w-full rounded-xl border border-line bg-card px-3 text-base"
            >
              {CURRENCIES.map((code) => (
                <option key={code}>{code}</option>
              ))}
            </select>
          </label>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Impuesto de las próximas operaciones ({Math.round(form.taxRate * 100)}%)</p>
            <div className="flex flex-wrap gap-2">
              {TAX_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setForm({ ...form, taxRate: preset.rate, regime: preset.regime })}
                  className={form.regime === preset.regime && form.taxRate === preset.rate ? "min-h-10 rounded-full bg-ink px-3 text-xs text-card" : "min-h-10 rounded-full bg-sand px-3 text-xs text-ink-soft"}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Prefijo de comprobante" value={form.invoicePrefix} onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value.toUpperCase() })} />
            <Field label="Régimen" value={form.regime} onChange={(e) => setForm({ ...form, regime: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Caja al abrir (opcional)" inputMode="decimal" value={form.cash} placeholder="0" onChange={(e) => setForm({ ...form, cash: e.target.value })} />
            <Field label="Banco al abrir (opcional)" inputMode="decimal" value={form.bank} placeholder="0" onChange={(e) => setForm({ ...form, bank: e.target.value })} />
          </div>
          {error && <p className="text-sm text-wine">{error}</p>}
          <Button type="submit" className="w-full">
            Abrir mis libros
          </Button>
          <button
            type="button"
            className="block min-h-11 w-full text-center text-sm font-medium text-copper-deep"
            onClick={() => {
              if (window.confirm("Entras a Mercado Andino, una empresa ficticia para recorrer el producto. No se mezcla con tus libros.")) {
                loadSample();
              }
            }}
          >
            Recorrer una empresa de ejemplo
          </button>
        </form>
      </div>
    </main>
  );
}
