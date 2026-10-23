import { fold, parseAmount } from "./money";
import {
  BookError,
  postCollection,
  postExpense,
  postIncome,
  postPurchase,
  postSale,
  postSupplierPayment,
  voidSale,
} from "./model";
import type { Books, Party, PaymentMethod, Product } from "./types";

export interface CommandResult {
  ok: boolean;
  message: string;
  books: Books | null;
}

function scoreName(query: string, name: string): number {
  const q = fold(query).trim();
  const n = fold(name);
  if (!q || !n) return 0;
  if (n === q) return 120;
  if (n.startsWith(q)) return 100;
  if (n.includes(q)) return 80 + Math.min(q.length, 20);
  const tokens = q.split(/\s+/).filter((t) => t.length > 1);
  if (tokens.length === 0) return 0;
  const hits = tokens.filter((t) => n.includes(t)).length;
  if (hits === 0) return 0;
  return (hits / tokens.length) * 70;
}

function best<T>(items: T[], query: string, name: (t: T) => string): T | null {
  let top: T | null = null;
  let s = 0;
  for (const item of items) {
    const sc = scoreName(query, name(item));
    if (sc > s) {
      s = sc;
      top = item;
    }
  }
  return s >= 48 ? top : null;
}

function moneyTail(n: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

export function runCommand(b: Books, raw: string, now = new Date()): CommandResult {
  const text = fold(raw).replace(/\s+/g, " ").trim();
  if (!text) return { ok: false, message: "Escribe una orden.", books: null };

  const fail = (message: string): CommandResult => ({ ok: false, message, books: null });
  const done = (books: Books, message: string): CommandResult => ({ ok: true, message, books });

  try {
    const anular = text.match(/^anular\s+([a-z0-9-]+)$/);
    if (anular) {
      const sale = b.sales.find((s) => fold(s.number) === anular[1]);
      if (!sale) return fail("No encuentro esa venta.");
      return done(voidSale(b, sale.id), `${sale.number} anulada. El stock volvió y el asiento desapareció del diario.`);
    }

    const gasto = text.match(/^(gasto|egreso)\s+([0-9.,]+)\s+(.+)$/);
    if (gasto) {
      const amount = parseAmount(gasto[2]);
      if (!amount) return fail("No entendí el monto.");
      return done(
        postExpense(b, { at: now.toISOString(), amount, memo: gasto[3], via: "caja" }),
        `Gasto de ${moneyTail(amount)} en caja · ${gasto[3]}.`,
      );
    }

    const ingreso = text.match(/^(ingreso)\s+([0-9.,]+)\s+(.+)$/);
    if (ingreso) {
      const amount = parseAmount(ingreso[2]);
      if (!amount) return fail("No entendí el monto.");
      return done(
        postIncome(b, { at: now.toISOString(), amount, memo: ingreso[3], via: "caja" }),
        `Ingreso de ${moneyTail(amount)} · ${ingreso[3]}.`,
      );
    }

    const cobrar =
      text.match(/^cobrar\s+([0-9.,]+)\s+a\s+(.+)$/) || text.match(/^cobrar\s+a\s+(.+?)\s+([0-9.,]+)$/);
    if (cobrar) {
      const amountRaw = /^\d/.test(cobrar[1]) ? cobrar[1] : cobrar[2];
      const who = /^\d/.test(cobrar[1]) ? cobrar[2] : cobrar[1];
      const amount = parseAmount(amountRaw);
      const customer = best(
        b.parties.filter((p) => p.kind === "customer"),
        who,
        (p) => p.name,
      );
      if (!amount) return fail("No entendí el monto.");
      if (!customer) return fail(`No encuentro al cliente “${who}”.`);
      return done(
        postCollection(b, { at: now.toISOString(), customerId: customer.id, amount, via: "caja" }),
        `Abono de ${moneyTail(amount)} de ${customer.name}. La cartera y la caja ya cuadran.`,
      );
    }

    const pagar = text.match(/^pagar\s+([0-9.,]+)\s+a\s+(.+)$/) || text.match(/^pagar\s+a\s+(.+?)\s+([0-9.,]+)$/);
    if (pagar) {
      const amountRaw = /^\d/.test(pagar[1]) ? pagar[1] : pagar[2];
      const who = /^\d/.test(pagar[1]) ? pagar[2] : pagar[1];
      const amount = parseAmount(amountRaw);
      const supplier = best(
        b.parties.filter((p) => p.kind === "supplier"),
        who,
        (p) => p.name,
      );
      if (!amount) return fail("No entendí el monto.");
      if (!supplier) return fail(`No encuentro al proveedor “${who}”.`);
      return done(
        postSupplierPayment(b, { at: now.toISOString(), supplierId: supplier.id, amount, via: "banco" }),
        `Pago de ${moneyTail(amount)} a ${supplier.name}, desde bancos.`,
      );
    }

    const trade = text.match(/^(venta|vender|vende|facturar|compra|comprar)\s+(.+)$/);
    if (trade) {
      const kind = trade[1].startsWith("comp") ? "compra" : "venta";
      let rest = trade[2];
      let payment: PaymentMethod = kind === "compra" ? "efectivo" : "efectivo";
      const pay = rest.match(/\b(efectivo|transferencia|tarjeta|credito)\b/);
      if (pay) {
        payment = pay[1] as PaymentMethod;
        rest = rest.replace(pay[0], " ").replace(/\s+/g, " ").trim();
      }
      let partyQuery: string | null = null;
      const split = rest.match(/^(.*?)\s+a\s+(.+)$/);
      if (split) {
        rest = split[1].trim();
        partyQuery = split[2].trim();
      }
      const qtyMatch = rest.match(/^([0-9]+(?:[.,][0-9]+)?)\s+(.+)$/);
      if (!qtyMatch) {
        return fail(kind === "venta" ? "Prueba: vender 2 café de origen a ana efectivo" : "Prueba: compra 20 panela a alimentos credito");
      }
      const qty = Number(qtyMatch[1].replace(",", "."));
      if (!Number.isFinite(qty) || qty <= 0) return fail("Cantidad inválida.");
      const product = best(
        b.products.filter((p) => p.active),
        qtyMatch[2],
        (p) => `${p.name} ${p.sku}`,
      );
      if (!product) return fail(`No encuentro “${qtyMatch[2]}” en el inventario.`);
      if (kind === "venta") {
        const customer = partyQuery
          ? best(
              b.parties.filter((p) => p.kind === "customer"),
              partyQuery,
              (p) => p.name,
            )
          : null;
        if (partyQuery && !customer) return fail(`No encuentro al cliente “${partyQuery}”.`);
        if (payment === "credito" && !customer) return fail("El crédito necesita un cliente: vender 2 miel a ana credito");
        const { books, sale } = postSale(b, {
          at: now.toISOString(),
          customerId: customer?.id ?? null,
          payment,
          lines: [{ productId: product.id, qty }],
        });
        return done(
          books,
          `${sale.number} · ${qty} ${product.name} · ${sale.customerName} · ${moneyTail(sale.gross)} ${payment}.`,
        );
      }
      const supplier = partyQuery
        ? best(
            b.parties.filter((p) => p.kind === "supplier"),
            partyQuery,
            (p) => p.name,
          )
        : b.parties.find((p) => p.kind === "supplier");
      if (!supplier) return fail("Necesito un proveedor.");
      if (payment === "tarjeta" || payment === "transferencia") payment = "efectivo";
      const payPurchase = payment === "credito" ? "credito" : "efectivo";
      const { books, purchase } = postPurchase(b, {
        at: now.toISOString(),
        supplierId: supplier.id,
        payment: payPurchase,
        lines: [{ productId: product.id, qty }],
      });
      return done(
        books,
        `${purchase.number} · ${qty} ${product.name} de ${supplier.name} · ${moneyTail(purchase.gross)}.`,
      );
    }
  } catch (error) {
    if (error instanceof BookError) return fail(error.message);
    return fail("No pude registrar esa orden.");
  }

  return fail("No la reconocí. Prueba “vender 2 café de origen a ana efectivo”.");
}

export function hintParties(b: Books, kind: Party["kind"]): string[] {
  return b.parties.filter((p) => p.kind === kind).map((p) => p.name);
}

export function hintProducts(b: Books): Product[] {
  return b.products.filter((p) => p.active);
}
