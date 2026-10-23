import { useState } from "react";
import { openSale, taxFromGross, taxOnNet } from "@/lib/books/model";
import { formatWhen, PAYMENT_LABEL, representationCode } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";
import type { PaymentMethod, Sale } from "@/lib/books/types";
import { Button, Empty, Field, Modal, Pill, Select, useMoney } from "./ui";

type Tab = "ventas" | "compras" | "cotizaciones" | "gastos";

export function Operaciones({ notify }: { notify: (message: string) => void }) {
  const books = useBooks((s) => s.books);
  const [tab, setTab] = useState<Tab>("ventas");
  const [sale, setSale] = useState<Sale | null>(null);
  const [buying, setBuying] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const money = useMoney();

  return (
    <div>
      <p className="text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Documentos</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-4xl">Operaciones</h1>
        <div className="flex gap-2">
          {tab === "compras" && <Button onClick={() => setBuying(true)}>Nueva compra</Button>}
          {tab === "cotizaciones" && <Button onClick={() => setQuoting(true)}>Nueva cotización</Button>}
        </div>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {(
          [
            ["ventas", "Ventas"],
            ["compras", "Compras"],
            ["cotizaciones", "Cotizaciones"],
            ["gastos", "Gastos"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm ${tab === id ? "bg-ink text-card" : "bg-sand text-ink-soft"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "ventas" && (
          books.sales.length === 0 ? <Empty title="Sin ventas" text="La primera venta puede salir de la caja rápida o de una orden en la barra." /> : (
            <ul className="divide-y divide-line rounded-3xl border border-line bg-card px-4">
              {books.sales.slice(0, 40).map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => setSale(item)} className="flex w-full items-center justify-between gap-3 py-3 text-left">
                    <div className="min-w-0">
                      <p className="font-medium">{item.number} · {item.customerName}</p>
                      <p className="text-xs text-muted">{formatWhen(item.at)} · {PAYMENT_LABEL[item.payment]}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular font-medium">{money(item.gross)}</p>
                      <Pill tone={item.status === "anulada" ? "wine" : openSale(item) > 0 ? "copper" : "forest"}>
                        {item.status === "anulada" ? "Anulada" : openSale(item) > 0 ? "Por cobrar" : "Cerrada"}
                      </Pill>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
        {tab === "compras" && <PurchaseList onNotify={notify} />}
        {tab === "cotizaciones" && <QuoteList onNotify={notify} />}
        {tab === "gastos" && <Expenses onNotify={notify} />}
      </div>

      <SaleSheet sale={sale} onClose={() => setSale(null)} notify={notify} />
      <PurchaseForm open={buying} onClose={() => setBuying(false)} notify={notify} />
      <QuoteForm open={quoting} onClose={() => setQuoting(false)} notify={notify} />
    </div>
  );
}

function PurchaseList({ onNotify }: { onNotify: (m: string) => void }) {
  const books = useBooks((s) => s.books);
  const voidPurchase = useBooks((s) => s.voidPurchase);
  const money = useMoney();
  if (books.purchases.length === 0) return <Empty title="Sin compras" text="Reponer inventario crea la cuenta por pagar o sale de caja, con IVA descontable." />;
  return (
    <ul className="divide-y divide-line rounded-3xl border border-line bg-card px-4">
      {books.purchases.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 py-3">
          <div>
            <p className="font-medium">{item.number} · {item.supplierName}</p>
            <p className="text-xs text-muted">{formatWhen(item.at)} · {item.payment === "credito" ? "Crédito" : "Contado"}</p>
          </div>
          <div className="text-right">
            <p className="tabular font-medium">{money(item.gross)}</p>
            {item.status === "recibida" && item.paid === 0 && (
              <button
                type="button"
                className="text-xs font-medium text-wine"
                onClick={() => {
                  const res = voidPurchase(item.id);
                  onNotify(res.ok ? `${item.number} anulada` : res.error || "No se pudo anular");
                }}
              >
                Anular
              </button>
            )}
            {item.status === "anulada" && <Pill tone="wine">Anulada</Pill>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function QuoteList({ onNotify }: { onNotify: (m: string) => void }) {
  const books = useBooks((s) => s.books);
  const accept = useBooks((s) => s.acceptQuote);
  const reject = useBooks((s) => s.rejectQuote);
  const money = useMoney();
  const [pay, setPay] = useState<PaymentMethod>("efectivo");
  if (books.quotes.length === 0) return <Empty title="Sin cotizaciones" text="Una cotización no mueve inventario hasta que el cliente acepta." />;
  return (
    <ul className="space-y-3">
      {books.quotes.map((quote) => {
        const expired = quote.status === "enviada" && new Date(quote.validUntil) < new Date();
        return (
          <li key={quote.id} className="rounded-3xl border border-line bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{quote.number} · {quote.customerName}</p>
                <p className="text-xs text-muted">Vence {formatWhen(quote.validUntil)}</p>
              </div>
              <p className="tabular font-medium">{money(quote.gross)}</p>
            </div>
            <p className="mt-2 text-sm text-muted">{quote.lines.map((l) => `${l.qty} ${l.name}`).join(" · ")}</p>
            {quote.status === "enviada" && !expired ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select value={pay} onChange={(e) => setPay(e.target.value as PaymentMethod)} className="h-11 rounded-xl border border-line bg-card px-3 text-sm">
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="credito">Crédito</option>
                </select>
                <Button
                  onClick={() => {
                    const res = accept(quote.id, pay);
                    onNotify(res.ok ? `${quote.number} convertida en venta` : res.error || "No se pudo");
                  }}
                >
                  Convertir en venta
                </Button>
                <Button variant="ghost" onClick={() => reject(quote.id)}>Rechazar</Button>
              </div>
            ) : (
              <div className="mt-3"><Pill tone={quote.status === "aceptada" ? "forest" : "sand"}>{expired ? "Vencida" : quote.status}</Pill></div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Expenses({ onNotify }: { onNotify: (m: string) => void }) {
  const books = useBooks((s) => s.books);
  const expense = useBooks((s) => s.expense);
  const money = useMoney();
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [via, setVia] = useState<"caja" | "banco">("caja");
  const rows = books.moves.filter((m) => m.kind === "gasto" || m.kind === "ingreso");
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <form
        className="space-y-3 rounded-3xl border border-line bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const value = Number(amount.replace(/\./g, ""));
          const res = expense(value, memo, via);
          if (!res.ok) onNotify(res.error || "No se pudo");
          else {
            onNotify("Gasto registrado en el diario");
            setAmount("");
            setMemo("");
          }
        }}
      >
        <h2 className="text-2xl">Salida de caja</h2>
        <Field label="Monto" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Field label="Concepto" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Arriendo, nómina, domicilio" required />
        <Select label="Sale de" value={via} onChange={(e) => setVia(e.target.value as "caja" | "banco")}>
          <option value="caja">Caja</option>
          <option value="banco">Bancos</option>
        </Select>
        <Button type="submit" className="w-full">Registrar gasto</Button>
      </form>
      <ul className="divide-y divide-line rounded-3xl border border-line bg-card px-4">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{row.memo}</p>
              <p className="text-xs text-muted">{formatWhen(row.at)} · {row.via}</p>
            </div>
            <p className={`tabular font-medium ${row.kind === "gasto" ? "text-wine" : "text-forest"}`}>
              {row.kind === "gasto" ? "−" : "+"}{money(row.amount)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SaleSheet({ sale, onClose, notify }: { sale: Sale | null; onClose: () => void; notify: (m: string) => void }) {
  const books = useBooks((s) => s.books);
  const voidSale = useBooks((s) => s.voidSale);
  const ret = useBooks((s) => s.ret);
  const money = useMoney();
  const [qty, setQty] = useState<Record<string, string>>({});
  if (!sale) return null;
  const code = representationCode(`${books.company.nit}|${sale.number}|${sale.gross}`);
  const returned = new Map<string, number>();
  for (const doc of books.returns.filter((r) => r.saleId === sale.id)) {
    for (const line of doc.lines) returned.set(line.productId, (returned.get(line.productId) ?? 0) + line.qty);
  }
  return (
    <Modal open={!!sale} title={sale.number} onClose={onClose} wide>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{books.company.name}</p>
          <p className="text-sm text-muted">NIT {books.company.nit} · {books.company.regime}</p>
          <p className="mt-2 font-medium">{sale.customerName}</p>
          <p className="text-xs text-muted">{formatWhen(sale.at)} · {PAYMENT_LABEL[sale.payment]}</p>
        </div>
        <Mark code={code} />
      </div>
      <table className="mt-4 w-full text-sm">
        <thead className="text-left text-xs text-muted">
          <tr><th className="py-2 font-medium">Producto</th><th>Cant.</th><th className="text-right">Total</th></tr>
        </thead>
        <tbody>
          {sale.lines.map((line) => (
            <tr key={line.productId} className="border-t border-line">
              <td className="py-2">{line.name}</td>
              <td className="tabular">{line.qty}</td>
              <td className="text-right tabular">{money(line.gross)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between text-muted"><dt>Base</dt><dd className="tabular">{money(sale.net)}</dd></div>
        <div className="flex justify-between text-muted"><dt>Impuesto</dt><dd className="tabular">{money(sale.tax)}</dd></div>
        <div className="flex justify-between font-medium"><dt>Total</dt><dd className="tabular">{money(sale.gross)}</dd></div>
        {openSale(sale) > 0 && <div className="flex justify-between text-wine"><dt>Saldo</dt><dd className="tabular">{money(openSale(sale))}</dd></div>}
      </dl>
      <p className="mt-3 text-xs text-muted">Código de representación {code}. Borrador gráfico: no es factura electrónica DIAN ni documento fiscal.</p>
      {sale.status === "emitida" && (
        <div className="mt-4 space-y-3 border-t border-line pt-4">
          <p className="text-sm font-medium">Devolver</p>
          {sale.lines.map((line) => {
            const left = line.qty - (returned.get(line.productId) ?? 0);
            if (left <= 0) return null;
            return (
              <label key={line.productId} className="flex items-center justify-between gap-3 text-sm">
                <span>{line.name} · máx {left}</span>
                <input
                  inputMode="numeric"
                  value={qty[line.productId] ?? ""}
                  onChange={(e) => setQty((prev) => ({ ...prev, [line.productId]: e.target.value }))}
                  className="h-11 w-24 rounded-xl border border-line px-3 text-base"
                />
              </label>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                const lines = sale.lines
                  .map((line) => ({ productId: line.productId, qty: Number(qty[line.productId] || 0) }))
                  .filter((line) => line.qty > 0);
                const res = ret(sale.id, lines);
                notify(res.ok ? "Devolución registrada" : res.error || "No se pudo");
                if (res.ok) onClose();
              }}
            >
              Registrar devolución
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const res = voidSale(sale.id);
                notify(res.ok ? "Venta anulada" : res.error || "No se pudo anular");
                if (res.ok) onClose();
              }}
            >
              Anular venta
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Mark({ code }: { code: string }) {
  const bits = code.split("").map((char) => Number.parseInt(char, 16));
  return (
    <div className="grid grid-cols-8 gap-0.5" aria-hidden>
      {Array.from({ length: 64 }, (_, i) => {
        const on = ((bits[i % bits.length] ?? 0) >> (i % 4)) & 1;
        return <span key={i} className={on ? "size-2 bg-ink" : "size-2 bg-sand"} />;
      })}
    </div>
  );
}

function LineEditor({
  mode,
  onClose,
  onSave,
}: {
  mode: "compra" | "cotizacion";
  onClose: () => void;
  onSave: (lines: { productId: string; qty: number; unitNet?: number }[], extra: { partyId: string; payment: "efectivo" | "credito" }) => void;
}) {
  const books = useBooks((s) => s.books);
  const [productId, setProductId] = useState(books.products[0]?.id ?? "");
  const [qty, setQty] = useState("1");
  const [lines, setLines] = useState<{ productId: string; qty: number; unitNet?: number }[]>([]);
  const [partyId, setPartyId] = useState("");
  const [payment, setPayment] = useState<"efectivo" | "credito">("efectivo");
  const parties = books.parties.filter((p) => (mode === "compra" ? p.kind === "supplier" : p.kind === "customer"));
  const money = useMoney();
  return (
    <div className="space-y-3">
      <Select label={mode === "compra" ? "Proveedor" : "Cliente"} value={partyId} onChange={(e) => setPartyId(e.target.value)}>
        <option value="">{mode === "compra" ? "Elige proveedor" : "Mostrador"}</option>
        {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </Select>
      {mode === "compra" && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setPayment("efectivo")} className={`min-h-11 rounded-xl text-sm ${payment === "efectivo" ? "bg-ink text-card" : "bg-sand"}`}>Contado</button>
          <button type="button" onClick={() => setPayment("credito")} className={`min-h-11 rounded-xl text-sm ${payment === "credito" ? "bg-ink text-card" : "bg-sand"}`}>Crédito</button>
        </div>
      )}
      <div className="flex gap-2">
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="h-11 min-w-0 flex-1 rounded-xl border border-line px-3 text-sm">
          {books.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input value={qty} onChange={(e) => setQty(e.target.value)} className="h-11 w-20 rounded-xl border border-line px-3 text-base" />
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            const product = books.products.find((p) => p.id === productId);
            const n = Number(qty);
            if (!product || !(n > 0)) return;
            setLines((prev) => [...prev, { productId, qty: n, unitNet: mode === "compra" ? product.cost : undefined }]);
          }}
        >
          Añadir
        </Button>
      </div>
      <ul className="text-sm">
        {lines.map((line, index) => {
          const product = books.products.find((p) => p.id === line.productId);
          const gross = mode === "compra" ? taxOnNet(Math.round((line.unitNet ?? 0) * line.qty), books.company.taxRate).gross : taxFromGross(Math.round((product?.price ?? 0) * line.qty), books.company.taxRate).net + taxFromGross(Math.round((product?.price ?? 0) * line.qty), books.company.taxRate).tax;
          return (
            <li key={`${line.productId}-${index}`} className="flex justify-between border-t border-line py-2">
              <span>{line.qty} {product?.name}</span>
              <span className="tabular">{money(gross)}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button
          disabled={lines.length === 0 || (mode === "compra" && !partyId)}
          onClick={() => onSave(lines, { partyId, payment })}
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}

function PurchaseForm({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: (m: string) => void }) {
  const buy = useBooks((s) => s.buy);
  return (
    <Modal open={open} title="Compra" onClose={onClose}>
      <LineEditor
        mode="compra"
        onClose={onClose}
        onSave={(lines, extra) => {
          const res = buy({ supplierId: extra.partyId, payment: extra.payment, lines });
          notify(res.ok ? `${res.number} recibida. Stock y libros actualizados.` : res.error);
          if (res.ok) onClose();
        }}
      />
    </Modal>
  );
}

function QuoteForm({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: (m: string) => void }) {
  const quote = useBooks((s) => s.quote);
  return (
    <Modal open={open} title="Cotización" onClose={onClose}>
      <LineEditor
        mode="cotizacion"
        onClose={onClose}
        onSave={(lines, extra) => {
          const res = quote({ customerId: extra.partyId || null, validDays: 15, lines });
          notify(res.ok ? `${res.number} enviada. Aún no mueve stock.` : res.error);
          if (res.ok) onClose();
        }}
      />
    </Modal>
  );
}
