import { useMemo, useState } from "react";
import { kardexOf, productIntel } from "@/lib/books/model";
import { formatWhen } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import type { Product } from "@/lib/books/types";
import { Button, Empty, Field, Modal, Pill, Select, useMoney } from "./ui";

export function Inventario({ notify }: { notify: (message: string) => void }) {
  const books = useBooks((s) => s.books);
  const save = useBooks((s) => s.saveProduct);
  const saveCategory = useBooks((s) => s.saveCategory);
  const adjust = useBooks((s) => s.adjust);
  const buy = useBooks((s) => s.buy);
  const money = useMoney();
  const intel = useMemo(() => productIntel(books), [books]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [cat, setCat] = useState("");
  const [supplierId, setSupplierId] = useState(books.parties.find((p) => p.kind === "supplier")?.id ?? "");
  const [buyQty, setBuyQty] = useState("12");
  const suppliers = books.parties.filter((p) => p.kind === "supplier");
  const focused = intel.find((i) => i.product.id === focus);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Existencias</p>
          <h1 className="mt-1 text-4xl">Inventario</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">Clase ABC por margen de 30 días. La reposición usa el ritmo real, no una corazonada.</p>
        </div>
        <Button onClick={() => setEditing({ unit: "und", minStock: 5, price: 0, cost: 0, categoryId: books.categories[0]?.id })}>Nuevo producto</Button>
      </div>

      <div className="mt-4 flex gap-2">
        <input value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Nueva categoría" className="h-11 flex-1 rounded-xl border border-line bg-card px-3 text-base" />
        <Button
          variant="ghost"
          onClick={() => {
            const res = saveCategory(cat);
            notify(res.ok ? "Categoría creada" : res.error || "No se pudo");
            if (res.ok) setCat("");
          }}
        >
          Añadir
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-3xl border border-line bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              {["Producto", "Stock", "Precio", "Margen 30d", "Cobertura", "ABC", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {intel.map((row) => (
              <tr key={row.product.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <button type="button" className="text-left" onClick={() => setFocus(row.product.id)}>
                    <span className="font-medium">{row.product.name}</span>
                    <span className="mt-0.5 block text-xs text-muted">{row.product.sku}</span>
                  </button>
                </td>
                <td className="px-4 tabular">{row.product.stock} {row.product.unit}</td>
                <td className="px-4 tabular">{money(row.product.price)}</td>
                <td className="px-4 tabular">{money(row.margin)}</td>
                <td className="px-4">{row.coverDays == null ? "Sin ritmo" : `${Math.round(row.coverDays)} días`}</td>
                <td className="px-4"><Pill tone={row.abc === "A" ? "forest" : row.abc === "B" ? "copper" : "sand"}>{row.abc}</Pill></td>
                <td className="px-4 text-right">
                  <button type="button" className="text-sm font-medium text-copper-deep" onClick={() => setEditing(row.product)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} title={editing?.id ? "Editar producto" : "Nuevo producto"} onClose={() => setEditing(null)}>
        {editing && (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              const res = save({
                id: editing.id,
                sku: editing.sku || "",
                name: editing.name || "",
                categoryId: editing.categoryId || books.categories[0]?.id || "",
                price: Number(editing.price) || 0,
                cost: Number(editing.cost) || 0,
                minStock: Number(editing.minStock) || 0,
                unit: editing.unit || "und",
              });
              notify(res.ok ? "Producto guardado. El stock entra por compras o ajustes." : res.error || "No se pudo");
              if (res.ok) setEditing(null);
            }}
          >
            <Field label="Nombre" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            <Field label="SKU" value={editing.sku || ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} required />
            <Select label="Categoría" value={editing.categoryId || ""} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}>
              {books.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio con impuesto" inputMode="numeric" value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              <Field label="Costo sin impuesto" inputMode="numeric" value={editing.cost ?? ""} onChange={(e) => setEditing({ ...editing, cost: Number(e.target.value) })} />
              <Field label="Mínimo" inputMode="numeric" value={editing.minStock ?? ""} onChange={(e) => setEditing({ ...editing, minStock: Number(e.target.value) })} />
              <Field label="Unidad" value={editing.unit || "und"} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        )}
      </Modal>

      <Modal open={!!focused} title={focused?.product.name || "Producto"} onClose={() => setFocus(null)} wide>
        {focused && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Stock {focused.product.stock}. Ritmo {focused.velocity.toFixed(2)} al día.
              {focused.reorder > 0 ? ` Conviene comprar ${focused.reorder}.` : " No hace falta reponer."}
            </p>
            {focused.reorder > 0 && (
              <div className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
                <Select label="Proveedor" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                <Field label="Cantidad" value={buyQty} onChange={(e) => setBuyQty(e.target.value)} />
                <div className="sm:pt-6">
                  <Button
                    onClick={() => {
                      const res = buy({
                        supplierId,
                        payment: "credito",
                        lines: [{ productId: focused.product.id, qty: Number(buyQty) || focused.reorder }],
                      });
                      notify(res.ok ? `${res.number} a crédito` : res.error);
                      if (res.ok) setFocus(null);
                    }}
                  >
                    Comprar
                  </Button>
                </div>
              </div>
            )}
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const res = adjust(focused.product.id, Number(data.get("delta")), String(data.get("memo") || ""));
                notify(res.ok ? "Ajuste en el diario" : res.error || "No se pudo");
                if (res.ok) setFocus(null);
              }}
            >
              <Field name="delta" label="Ajuste (+ entra, − sale)" defaultValue="-1" className="w-36" />
              <Field name="memo" label="Motivo" defaultValue="Conteo físico" className="min-w-40 flex-1" />
              <Button type="submit" variant="ghost">Ajustar</Button>
            </form>
            <div>
              <h3 className="text-xl">Kardex</h3>
              {kardexOf(books, focused.product.id).length === 0 ? (
                <Empty title="Sin movimientos" text="Este producto todavía no entra al kardex." />
              ) : (
                <ul className="mt-2 divide-y divide-line text-sm">
                  {kardexOf(books, focused.product.id).slice(-12).map((row, index) => (
                    <li key={`${row.ref}-${index}`} className="flex justify-between py-2">
                      <span>{row.label} · {row.ref}<span className="block text-xs text-muted">{formatWhen(row.at)}</span></span>
                      <span className="tabular">{row.qty > 0 ? "+" : ""}{row.qty} → {row.balance}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
