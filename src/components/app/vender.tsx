import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { taxFromGross } from "@/lib/books/model";
import { fold, PAYMENT_LABEL } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import type { PaymentMethod } from "@/lib/books/types";
import { Button, Pill, useMoney } from "./ui";

interface CartLine {
  productId: string;
  qty: number;
}

export function Vender({ notify }: { notify: (message: string) => void }) {
  const books = useBooks((s) => s.books);
  const sell = useBooks((s) => s.sell);
  const money = useMoney();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todas");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("efectivo");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState("");

  const customers = books.parties.filter((p) => p.kind === "customer");
  const visible = useMemo(() => {
    const q = fold(query);
    return books.products.filter((p) => {
      if (!p.active) return false;
      if (category !== "todas" && p.categoryId !== category) return false;
      if (!q) return true;
      return fold(`${p.name} ${p.sku}`).includes(q);
    });
  }, [books.products, query, category]);

  function add(productId: string) {
    const product = books.products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const current = prev.find((l) => l.productId === productId);
      const nextQty = (current?.qty ?? 0) + 1;
      if (nextQty > product.stock) {
        setError(`Solo hay ${product.stock} de ${product.name}`);
        return prev;
      }
      setError("");
      if (!current) return [...prev, { productId, qty: 1 }];
      return prev.map((l) => (l.productId === productId ? { ...l, qty: nextQty } : l));
    });
  }

  const factor = 1 - discount / 100;
  const lines = cart.map((line) => {
    const product = books.products.find((p) => p.id === line.productId)!;
    const unitGross = Math.round(product.price * factor);
    const gross = unitGross * line.qty;
    const split = taxFromGross(gross, books.company.taxRate);
    return { ...line, product, unitGross, gross, ...split };
  });
  const gross = lines.reduce((s, l) => s + l.gross, 0);
  const tax = lines.reduce((s, l) => s + l.tax, 0);
  const net = lines.reduce((s, l) => s + l.net, 0);

  function checkout() {
    if (lines.length === 0) return;
    const res = sell({
      customerId: customerId || null,
      payment,
      lines: lines.map((l) => ({ productId: l.productId, qty: l.qty, unitGross: l.unitGross })),
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCart([]);
    setError("");
    notify(`${res.number} lista · ${money(gross)}. El diario, el IVA y el inventario ya se movieron.`);
  }

  const payments: PaymentMethod[] = ["efectivo", "transferencia", "tarjeta", "credito"];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section>
        <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Caja rápida</p>
        <h1 className="mt-1 text-4xl">Vender</h1>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por nombre o SKU"
            className="h-12 flex-1 rounded-2xl border border-line bg-card px-4 text-base outline-none focus:border-copper"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip active={category === "todas"} onClick={() => setCategory("todas")}>Todo</Chip>
          {books.categories.map((cat) => (
            <Chip key={cat.id} active={category === cat.id} onClick={() => setCategory(cat.id)}>
              {cat.name}
            </Chip>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visible.map((product) => {
            const margin = product.price > 0 ? 1 - product.cost / (product.price / (1 + books.company.taxRate)) : 0;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => add(product.id)}
                disabled={product.stock <= 0}
                className="min-h-28 rounded-2xl border border-line bg-card p-3 text-left disabled:opacity-40"
              >
                <p className="text-sm font-medium leading-snug">{product.name}</p>
                <p className="mt-2 font-display text-xl tabular">{money(product.price)}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted">{product.stock} {product.unit}</span>
                  <Pill tone={margin < 0.2 ? "wine" : "forest"}>{Math.round(margin * 100)}%</Pill>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="h-fit rounded-3xl border border-line bg-card p-4 lg:sticky lg:top-24">
        <h2 className="text-2xl">Ticket</h2>
        {lines.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Toca un producto para armar la venta.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {lines.map((line) => (
              <li key={line.productId} className="flex items-center gap-2 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{line.product.name}</p>
                  <p className="text-xs tabular text-muted">{money(line.unitGross)}</p>
                </div>
                <button type="button" className="grid size-10 place-items-center rounded-full bg-sand" onClick={() => setCart((prev) => prev.flatMap((l) => l.productId === line.productId ? l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : [] : [l]))} aria-label="Quitar uno">
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center text-sm tabular">{line.qty}</span>
                <button type="button" className="grid size-10 place-items-center rounded-full bg-sand" onClick={() => add(line.productId)} aria-label="Sumar uno">
                  <Plus className="size-4" />
                </button>
                <button type="button" className="grid size-10 place-items-center rounded-full text-wine" onClick={() => setCart((prev) => prev.filter((l) => l.productId !== line.productId))} aria-label="Quitar línea">
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="mt-4 block text-xs font-medium text-muted">
          Descuento {discount}%
          <input type="range" min={0} max={30} value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="mt-2 w-full accent-copper" />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {payments.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPayment(item)}
              className={`min-h-11 rounded-xl text-sm font-medium ${payment === item ? "bg-ink text-card" : "bg-sand text-ink-soft"}`}
            >
              {PAYMENT_LABEL[item]}
            </button>
          ))}
        </div>
        <label className="mt-3 block text-xs font-medium text-muted">
          Cliente
          <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-line bg-card px-3 text-base">
            <option value="">Mostrador</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        {payment === "credito" && !customerId && <p className="mt-2 text-xs text-wine">Elige un cliente para vender a crédito.</p>}

        <dl className="mt-4 space-y-1 text-sm">
          <Row k="Base" v={money(net)} />
          <Row k={`Impuesto ${Math.round(books.company.taxRate * 100)}%`} v={money(tax)} />
          <Row k="Total" v={money(gross)} strong />
        </dl>
        {error && <p className="mt-3 text-sm text-wine">{error}</p>}
        <Button className="mt-4 w-full" disabled={lines.length === 0 || (payment === "credito" && !customerId)} onClick={checkout}>
          Cobrar {lines.length > 0 ? money(gross) : ""}
        </Button>
      </aside>
    </div>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-10 shrink-0 rounded-full px-3 text-sm ${active ? "bg-ink text-card" : "bg-sand text-ink-soft"}`}>
      {children}
    </button>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "pt-1 font-medium text-ink" : "text-muted"}`}>
      <dt>{k}</dt>
      <dd className="tabular">{v}</dd>
    </div>
  );
}
