import type {
  AccountId,
  Books,
  CashVia,
  JEntry,
  JLine,
  JournalKind,
  Opening,
  Party,
  PaymentMethod,
  Product,
  Purchase,
  Quote,
  ReturnDoc,
  Sale,
} from "./types";

export class BookError extends Error {}

export const ACCOUNTS: Record<AccountId, string> = {
  caja: "Caja",
  banco: "Bancos",
  cxc: "Cuentas por cobrar",
  inventario: "Inventario",
  ivaDesc: "IVA descontable",
  cxp: "Cuentas por pagar",
  ivaGen: "IVA generado",
  capital: "Capital",
  ventas: "Ingresos por ventas",
  costo: "Costo de ventas",
  gastos: "Gastos operativos",
  otros: "Otros ingresos",
};

const DEBIT_NORMAL = new Set<AccountId>(["caja", "banco", "cxc", "inventario", "ivaDesc", "costo", "gastos"]);

export function present(account: AccountId, raw: number): number {
  return DEBIT_NORMAL.has(account) ? raw : -raw;
}

export function taxFromGross(gross: number, rate: number): { tax: number; net: number } {
  const tax = Math.round((gross * rate) / (1 + rate));
  return { tax, net: gross - tax };
}

export function taxOnNet(net: number, rate: number): { tax: number; gross: number } {
  const tax = Math.round(net * rate);
  return { tax, gross: net + tax };
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function clone(b: Books): Books {
  return structuredClone(b);
}

function nextId(b: Books, prefix: string): string {
  b.seq += 1;
  return `${prefix}${b.seq}`;
}

function pushLine(lines: JLine[], account: AccountId, debit: number, credit: number) {
  const d = Math.round(debit);
  const c = Math.round(credit);
  if (d === 0 && c === 0) return;
  lines.push({ account, debit: d, credit: c });
}

function viaAccount(via: string): AccountId {
  return via === "caja" ? "caja" : "banco";
}

function cashAccount(method: PaymentMethod | CashVia): AccountId {
  if (method === "efectivo" || method === "caja") return "caja";
  if (method === "credito") return "cxc";
  return "banco";
}

export function emptyBooks(company: Books["company"], openingAt: string): Books {
  return {
    version: 1,
    company,
    categories: [],
    products: [],
    parties: [],
    sales: [],
    purchases: [],
    quotes: [],
    moves: [],
    returns: [],
    opening: { at: openingAt, cash: 0, bank: 0, lines: [] },
    seq: 0,
  };
}

export function setOpening(b0: Books, opening: Opening): Books {
  const b = clone(b0);
  b.opening = opening;
  for (const line of opening.lines) {
    const p = b.products.find((x) => x.id === line.productId);
    if (!p) throw new BookError("Producto de apertura inexistente");
    p.stock = line.qty;
  }
  return b;
}

export function findProduct(b: Books, id: string): Product {
  const p = b.products.find((x) => x.id === id);
  if (!p) throw new BookError("Producto no encontrado");
  return p;
}

export function openSale(sale: Sale): number {
  if (sale.status !== "emitida" || sale.payment !== "credito") return 0;
  return Math.max(0, sale.gross - sale.returnedGross - sale.paid);
}

export function openPurchase(p: Purchase): number {
  if (p.status !== "recibida" || p.payment !== "credito") return 0;
  return Math.max(0, p.gross - p.paid);
}

export interface SaleInput {
  at: string;
  customerId: string | null;
  payment: PaymentMethod;
  lines: { productId: string; qty: number; unitGross?: number }[];
}

export function postSale(b0: Books, input: SaleInput): { books: Books; sale: Sale } {
  if (input.lines.length === 0) throw new BookError("La venta no tiene productos");
  if (input.payment === "credito" && !input.customerId) {
    throw new BookError("El crédito exige un cliente");
  }
  const b = clone(b0);
  const rate = b.company.taxRate;
  const customer = input.customerId ? b.parties.find((p) => p.id === input.customerId && p.kind === "customer") : null;
  if (input.customerId && !customer) throw new BookError("Cliente no encontrado");

  const merged = new Map<string, { productId: string; qty: number; unitGross?: number }>();
  for (const line of input.lines) {
    if (!Number.isFinite(line.qty) || line.qty <= 0) throw new BookError("Cantidad inválida");
    const prev = merged.get(line.productId);
    if (prev) prev.qty += line.qty;
    else merged.set(line.productId, { ...line });
  }

  const lines: Sale["lines"] = [];
  for (const line of merged.values()) {
    const qty = Math.round(line.qty * 1000) / 1000;
    const p = findProduct(b, line.productId);
    if (!p.active) throw new BookError(`${p.name} está inactivo`);
    if (p.stock + 1e-9 < qty) throw new BookError(`Stock insuficiente de ${p.name} (${p.stock} ${p.unit})`);
    const unitGross = Math.round(line.unitGross ?? p.price);
    if (unitGross < 0) throw new BookError("Precio inválido");
    const gross = Math.round(unitGross * qty);
    const { tax, net } = taxFromGross(gross, rate);
    const cost = Math.round(p.cost * qty);
    p.stock = Math.round((p.stock - qty) * 1000) / 1000;
    lines.push({
      productId: p.id,
      name: p.name,
      qty,
      unitGross,
      unitCost: p.cost,
      gross,
      tax,
      net,
      cost,
    });
  }

  const gross = lines.reduce((s, l) => s + l.gross, 0);
  const tax = lines.reduce((s, l) => s + l.tax, 0);
  const net = lines.reduce((s, l) => s + l.net, 0);
  const cost = lines.reduce((s, l) => s + l.cost, 0);
  const sale: Sale = {
    id: nextId(b, "s"),
    number: `${b.company.invoicePrefix}-${String(b.sales.length + 1).padStart(4, "0")}`,
    at: input.at,
    customerId: customer?.id ?? null,
    customerName: customer?.name ?? "Mostrador",
    payment: input.payment,
    status: "emitida",
    dueAt: input.payment === "credito" ? addDays(input.at, customer?.termsDays ?? 0) : null,
    lines,
    gross,
    tax,
    net,
    cost,
    paid: input.payment === "credito" ? 0 : gross,
    returnedGross: 0,
  };
  b.sales.unshift(sale);
  return { books: b, sale };
}

export function voidSale(b0: Books, saleId: string): Books {
  const b = clone(b0);
  const sale = b.sales.find((s) => s.id === saleId);
  if (!sale || sale.status !== "emitida") throw new BookError("Venta no encontrada");
  if (b.returns.some((r) => r.saleId === sale.id)) throw new BookError("Tiene devoluciones. No se puede anular.");
  if (sale.payment === "credito" && sale.paid > 0) throw new BookError("Tiene abonos. Registra una devolución.");
  for (const line of sale.lines) {
    const p = findProduct(b, line.productId);
    p.stock = Math.round((p.stock + line.qty) * 1000) / 1000;
  }
  sale.status = "anulada";
  return b;
}

export interface PurchaseInput {
  at: string;
  supplierId: string;
  payment: "efectivo" | "credito";
  lines: { productId: string; qty: number; unitNet?: number }[];
}

export function postPurchase(b0: Books, input: PurchaseInput): { books: Books; purchase: Purchase } {
  if (input.lines.length === 0) throw new BookError("La compra no tiene productos");
  const b = clone(b0);
  const supplier = b.parties.find((p) => p.id === input.supplierId && p.kind === "supplier");
  if (!supplier) throw new BookError("Proveedor no encontrado");
  const rate = b.company.taxRate;
  const lines: Purchase["lines"] = [];
  for (const line of input.lines) {
    const qty = Math.round(line.qty * 1000) / 1000;
    if (qty <= 0) throw new BookError("Cantidad inválida");
    const p = findProduct(b, line.productId);
    const unitNet = Math.round(line.unitNet ?? p.cost);
    if (unitNet < 0) throw new BookError("Costo inválido");
    const net = Math.round(unitNet * qty);
    const taxed = taxOnNet(net, rate);
    p.stock = Math.round((p.stock + qty) * 1000) / 1000;
    p.cost = unitNet;
    lines.push({ productId: p.id, name: p.name, qty, unitNet, net, tax: taxed.tax, gross: taxed.gross });
  }
  const purchase: Purchase = {
    id: nextId(b, "c"),
    number: `OC-${String(b.purchases.length + 1).padStart(4, "0")}`,
    at: input.at,
    supplierId: supplier.id,
    supplierName: supplier.name,
    payment: input.payment,
    status: "recibida",
    dueAt: input.payment === "credito" ? addDays(input.at, supplier.termsDays) : null,
    lines,
    gross: lines.reduce((s, l) => s + l.gross, 0),
    tax: lines.reduce((s, l) => s + l.tax, 0),
    net: lines.reduce((s, l) => s + l.net, 0),
    paid: input.payment === "credito" ? 0 : lines.reduce((s, l) => s + l.gross, 0),
  };
  b.purchases.unshift(purchase);
  return { books: b, purchase };
}

export function voidPurchase(b0: Books, purchaseId: string): Books {
  const b = clone(b0);
  const purchase = b.purchases.find((p) => p.id === purchaseId);
  if (!purchase || purchase.status !== "recibida") throw new BookError("Compra no encontrada");
  if (purchase.payment === "credito" && purchase.paid > 0) throw new BookError("Tiene pagos aplicados");
  for (const line of purchase.lines) {
    const p = findProduct(b, line.productId);
    if (p.stock + 1e-9 < line.qty) throw new BookError(`Stock insuficiente para reversar ${p.name}`);
    p.stock = Math.round((p.stock - line.qty) * 1000) / 1000;
  }
  purchase.status = "anulada";
  return b;
}

export function postExpense(b0: Books, input: { at: string; amount: number; memo: string; via: CashVia }): Books {
  const amount = Math.round(input.amount);
  if (amount <= 0) throw new BookError("Monto inválido");
  const b = clone(b0);
  b.moves.unshift({
    id: nextId(b, "m"),
    at: input.at,
    kind: "gasto",
    amount,
    via: input.via,
    memo: input.memo.trim() || "Gasto",
    partyId: null,
    docId: null,
    productId: null,
    qty: 0,
  });
  return b;
}

export function postIncome(b0: Books, input: { at: string; amount: number; memo: string; via: CashVia }): Books {
  const amount = Math.round(input.amount);
  if (amount <= 0) throw new BookError("Monto inválido");
  const b = clone(b0);
  b.moves.unshift({
    id: nextId(b, "m"),
    at: input.at,
    kind: "ingreso",
    amount,
    via: input.via,
    memo: input.memo.trim() || "Ingreso",
    partyId: null,
    docId: null,
    productId: null,
    qty: 0,
  });
  return b;
}

export function postCollection(
  b0: Books,
  input: { at: string; customerId: string; amount: number; via: CashVia },
): Books {
  const b = clone(b0);
  const customer = b.parties.find((p) => p.id === input.customerId && p.kind === "customer");
  if (!customer) throw new BookError("Cliente no encontrado");
  let left = Math.round(input.amount);
  if (left <= 0) throw new BookError("Monto inválido");
  const open = b.sales
    .filter((s) => s.customerId === customer.id && openSale(s) > 0)
    .sort((a, c) => a.at.localeCompare(c.at));
  const total = open.reduce((s, sale) => s + openSale(sale), 0);
  if (total <= 0) throw new BookError(`${customer.name} no tiene cartera pendiente`);
  if (left > total) throw new BookError(`El saldo de ${customer.name} es menor que ese abono`);
  for (const sale of open) {
    if (left <= 0) break;
    const room = openSale(sale);
    const take = Math.min(room, left);
    sale.paid += take;
    left -= take;
  }
  b.moves.unshift({
    id: nextId(b, "m"),
    at: input.at,
    kind: "cobro",
    amount: Math.round(input.amount),
    via: input.via,
    memo: `Cobro a ${customer.name}`,
    partyId: customer.id,
    docId: null,
    productId: null,
    qty: 0,
  });
  return b;
}

export function postSupplierPayment(
  b0: Books,
  input: { at: string; supplierId: string; amount: number; via: CashVia },
): Books {
  const b = clone(b0);
  const supplier = b.parties.find((p) => p.id === input.supplierId && p.kind === "supplier");
  if (!supplier) throw new BookError("Proveedor no encontrado");
  let left = Math.round(input.amount);
  if (left <= 0) throw new BookError("Monto inválido");
  const open = b.purchases
    .filter((p) => p.supplierId === supplier.id && openPurchase(p) > 0)
    .sort((a, c) => a.at.localeCompare(c.at));
  const total = open.reduce((s, p) => s + openPurchase(p), 0);
  if (total <= 0) throw new BookError(`${supplier.name} no tiene saldo`);
  if (left > total) throw new BookError(`El saldo con ${supplier.name} es menor`);
  for (const p of open) {
    if (left <= 0) break;
    const room = openPurchase(p);
    const take = Math.min(room, left);
    p.paid += take;
    left -= take;
  }
  b.moves.unshift({
    id: nextId(b, "m"),
    at: input.at,
    kind: "pago",
    amount: Math.round(input.amount),
    via: input.via,
    memo: `Pago a ${supplier.name}`,
    partyId: supplier.id,
    docId: null,
    productId: null,
    qty: 0,
  });
  return b;
}

export function postReturn(
  b0: Books,
  input: { at: string; saleId: string; lines: { productId: string; qty: number }[] },
): { books: Books; doc: ReturnDoc } {
  const b = clone(b0);
  const sale = b.sales.find((s) => s.id === input.saleId && s.status === "emitida");
  if (!sale) throw new BookError("Venta no encontrada");
  const returned = new Map<string, number>();
  for (const r of b.returns.filter((r) => r.saleId === sale.id)) {
    for (const line of r.lines) returned.set(line.productId, (returned.get(line.productId) ?? 0) + line.qty);
  }
  const lines: ReturnDoc["lines"] = [];
  for (const req of input.lines) {
    const qty = Math.round(req.qty * 1000) / 1000;
    if (qty <= 0) continue;
    const originals = sale.lines.filter((l) => l.productId === req.productId);
    if (originals.length === 0) throw new BookError("Ese producto no está en la venta");
    const sold = originals.reduce((s, l) => s + l.qty, 0);
    const already = returned.get(req.productId) ?? 0;
    if (already + qty > sold + 1e-9) throw new BookError(`Cantidad a devolver supera lo vendido de ${originals[0].name}`);
    const base = originals[0];
    const gross = Math.round(base.unitGross * qty);
    const { tax, net } = taxFromGross(gross, b.company.taxRate);
    const cost = Math.round(base.unitCost * qty);
    const p = findProduct(b, req.productId);
    p.stock = Math.round((p.stock + qty) * 1000) / 1000;
    lines.push({ productId: p.id, name: base.name, qty, gross, tax, net, cost });
  }
  if (lines.length === 0) throw new BookError("Nada para devolver");
  const gross = lines.reduce((s, l) => s + l.gross, 0);
  const open = Math.max(0, sale.gross - sale.returnedGross - sale.paid);
  const toAr = sale.payment === "credito" ? Math.min(gross, open) : 0;
  const toCash = gross - toAr;
  sale.returnedGross += gross;
  if (toCash > 0 && sale.payment === "credito") sale.paid = Math.max(0, sale.paid - toCash);
  if (sale.payment !== "credito") sale.paid = Math.max(0, sale.paid - toCash);
  const via: CashVia = sale.payment === "transferencia" || sale.payment === "tarjeta" ? "banco" : "caja";
  const doc: ReturnDoc = {
    id: nextId(b, "d"),
    number: `DEV-${String(b.returns.length + 1).padStart(4, "0")}`,
    at: input.at,
    saleId: sale.id,
    saleNumber: sale.number,
    lines,
    gross,
    tax: lines.reduce((s, l) => s + l.tax, 0),
    net: lines.reduce((s, l) => s + l.net, 0),
    cost: lines.reduce((s, l) => s + l.cost, 0),
    toAr,
    toCash,
    via,
  };
  b.returns.unshift(doc);
  return { books: b, doc };
}

export function postAdjust(
  b0: Books,
  input: { at: string; productId: string; qtyDelta: number; memo: string },
): Books {
  const b = clone(b0);
  const p = findProduct(b, input.productId);
  const qty = Math.round(input.qtyDelta * 1000) / 1000;
  if (qty === 0) throw new BookError("El ajuste es cero");
  if (p.stock + qty < -1e-9) throw new BookError("El ajuste dejaría el stock en negativo");
  const amount = Math.round(Math.abs(qty) * p.cost);
  p.stock = Math.round((p.stock + qty) * 1000) / 1000;
  b.moves.unshift({
    id: nextId(b, "m"),
    at: input.at,
    kind: "ajuste",
    amount,
    via: "caja",
    memo: input.memo.trim() || (qty > 0 ? "Sobrante de inventario" : "Faltante de inventario"),
    partyId: null,
    docId: null,
    productId: p.id,
    qty,
  });
  return b;
}

export interface QuoteInput {
  at: string;
  validDays: number;
  customerId: string | null;
  lines: { productId: string; qty: number; unitGross?: number }[];
}

export function postQuote(b0: Books, input: QuoteInput): { books: Books; quote: Quote } {
  if (input.lines.length === 0) throw new BookError("La cotización está vacía");
  const b = clone(b0);
  const customer = input.customerId ? b.parties.find((p) => p.id === input.customerId) : null;
  const rate = b.company.taxRate;
  const lines: Quote["lines"] = input.lines.map((line) => {
    const p = findProduct(b, line.productId);
    const qty = Math.round(line.qty * 1000) / 1000;
    if (qty <= 0) throw new BookError("Cantidad inválida");
    const unitGross = Math.round(line.unitGross ?? p.price);
    const gross = Math.round(unitGross * qty);
    const { tax, net } = taxFromGross(gross, rate);
    return { productId: p.id, name: p.name, qty, unitGross, gross, tax, net };
  });
  const quote: Quote = {
    id: nextId(b, "q"),
    number: `COT-${String(b.quotes.length + 1).padStart(4, "0")}`,
    at: input.at,
    validUntil: addDays(input.at, input.validDays || 15),
    customerId: customer?.id ?? null,
    customerName: customer?.name ?? "Mostrador",
    status: "enviada",
    lines,
    gross: lines.reduce((s, l) => s + l.gross, 0),
    tax: lines.reduce((s, l) => s + l.tax, 0),
    net: lines.reduce((s, l) => s + l.net, 0),
  };
  b.quotes.unshift(quote);
  return { books: b, quote };
}

export function setQuoteStatus(b0: Books, quoteId: string, status: "aceptada" | "rechazada"): Books {
  const b = clone(b0);
  const q = b.quotes.find((x) => x.id === quoteId);
  if (!q) throw new BookError("Cotización no encontrada");
  q.status = status;
  return b;
}

export function acceptQuote(b0: Books, quoteId: string, payment: PaymentMethod, at: string): Books {
  const q = b0.quotes.find((x) => x.id === quoteId);
  if (!q || q.status !== "enviada") throw new BookError("Esa cotización ya no está vigente");
  const { books } = postSale(b0, {
    at,
    customerId: q.customerId,
    payment,
    lines: q.lines.map((l) => ({ productId: l.productId, qty: l.qty, unitGross: l.unitGross })),
  });
  const quote = books.quotes.find((x) => x.id === quoteId);
  if (quote) quote.status = "aceptada";
  return books;
}

export function saveProduct(
  b0: Books,
  input: {
    id?: string;
    sku: string;
    name: string;
    categoryId: string;
    price: number;
    cost: number;
    minStock: number;
    unit: string;
  },
): Books {
  const b = clone(b0);
  const name = input.name.trim();
  const sku = input.sku.trim().toUpperCase();
  if (!name || !sku) throw new BookError("Nombre y SKU son obligatorios");
  if (input.price < 0 || input.cost < 0) throw new BookError("Precio o costo inválido");
  if (input.id) {
    const p = findProduct(b, input.id);
    p.name = name;
    p.sku = sku;
    p.categoryId = input.categoryId;
    p.price = Math.round(input.price);
    p.cost = Math.round(input.cost);
    p.minStock = Math.max(0, Math.round(input.minStock));
    p.unit = input.unit.trim() || "und";
  } else {
    b.products.push({
      id: nextId(b, "p"),
      sku,
      name,
      categoryId: input.categoryId,
      price: Math.round(input.price),
      cost: Math.round(input.cost),
      stock: 0,
      minStock: Math.max(0, Math.round(input.minStock)),
      unit: input.unit.trim() || "und",
      active: true,
    });
  }
  return b;
}

export function saveParty(
  b0: Books,
  input: {
    id?: string;
    kind: Party["kind"];
    name: string;
    document: string;
    email: string;
    phone: string;
    address: string;
    termsDays: number;
  },
): Books {
  const b = clone(b0);
  const name = input.name.trim();
  if (!name) throw new BookError("El nombre es obligatorio");
  if (input.id) {
    const p = b.parties.find((x) => x.id === input.id);
    if (!p) throw new BookError("Contacto no encontrado");
    Object.assign(p, {
      name,
      document: input.document.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      termsDays: Math.max(0, Math.round(input.termsDays)),
    });
  } else {
    b.parties.push({
      id: nextId(b, input.kind === "customer" ? "cli" : "prv"),
      kind: input.kind,
      name,
      document: input.document.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      termsDays: Math.max(0, Math.round(input.termsDays)),
    });
  }
  return b;
}

export function saveCategory(b0: Books, name: string): Books {
  const b = clone(b0);
  const clean = name.trim();
  if (!clean) throw new BookError("Nombre vacío");
  b.categories.push({ id: nextId(b, "cat"), name: clean });
  return b;
}

export function updateCompany(b0: Books, patch: Partial<Books["company"]>): Books {
  const b = clone(b0);
  b.company = { ...b.company, ...patch };
  if (b.company.taxRate < 0 || b.company.taxRate > 0.5) throw new BookError("Tasa de impuesto fuera de rango");
  b.company.currency = b.company.currency.toUpperCase();
  return b;
}

function entry(id: string, at: string, ref: string, memo: string, kind: JournalKind, lines: JLine[]): JEntry {
  return { id, at, ref, memo, kind, lines };
}

export function buildJournal(b: Books): JEntry[] {
  const out: JEntry[] = [];
  const openLines: JLine[] = [];
  const inv = b.opening.lines.reduce((s, l) => s + Math.round(l.qty * l.unitCost), 0);
  pushLine(openLines, "caja", b.opening.cash, 0);
  pushLine(openLines, "banco", b.opening.bank, 0);
  pushLine(openLines, "inventario", inv, 0);
  pushLine(openLines, "capital", 0, b.opening.cash + b.opening.bank + inv);
  out.push(entry("opening", b.opening.at, "APERTURA", "Saldos iniciales", "apertura", openLines));

  const sales = [...b.sales].sort((a, c) => a.at.localeCompare(c.at));
  for (const sale of sales) {
    if (sale.status !== "emitida") continue;
    const lines: JLine[] = [];
    pushLine(lines, cashAccount(sale.payment), sale.gross, 0);
    pushLine(lines, "ventas", 0, sale.net);
    pushLine(lines, "ivaGen", 0, sale.tax);
    pushLine(lines, "costo", sale.cost, 0);
    pushLine(lines, "inventario", 0, sale.cost);
    out.push(entry(sale.id, sale.at, sale.number, `Venta · ${sale.customerName}`, "venta", lines));
  }

  for (const purchase of [...b.purchases].sort((a, c) => a.at.localeCompare(c.at))) {
    if (purchase.status !== "recibida") continue;
    const lines: JLine[] = [];
    pushLine(lines, "inventario", purchase.net, 0);
    pushLine(lines, "ivaDesc", purchase.tax, 0);
    pushLine(lines, purchase.payment === "credito" ? "cxp" : cashAccount(purchase.payment), 0, purchase.gross);
    out.push(entry(purchase.id, purchase.at, purchase.number, `Compra · ${purchase.supplierName}`, "compra", lines));
  }

  for (const ret of [...b.returns].sort((a, c) => a.at.localeCompare(c.at))) {
    const lines: JLine[] = [];
    pushLine(lines, "ventas", ret.net, 0);
    pushLine(lines, "ivaGen", ret.tax, 0);
    pushLine(lines, "cxc", 0, ret.toAr);
    pushLine(lines, ret.via, 0, ret.toCash);
    pushLine(lines, "inventario", ret.cost, 0);
    pushLine(lines, "costo", 0, ret.cost);
    out.push(entry(ret.id, ret.at, ret.number, `Devolución · ${ret.saleNumber}`, "devolucion", lines));
  }

  for (const move of [...b.moves].sort((a, c) => a.at.localeCompare(c.at))) {
    const lines: JLine[] = [];
    if (move.kind === "gasto") {
      pushLine(lines, "gastos", move.amount, 0);
      pushLine(lines, viaAccount(move.via), 0, move.amount);
    } else if (move.kind === "ingreso") {
      pushLine(lines, viaAccount(move.via), move.amount, 0);
      pushLine(lines, "otros", 0, move.amount);
    } else if (move.kind === "cobro") {
      pushLine(lines, viaAccount(move.via), move.amount, 0);
      pushLine(lines, "cxc", 0, move.amount);
    } else if (move.kind === "pago") {
      pushLine(lines, "cxp", move.amount, 0);
      pushLine(lines, viaAccount(move.via), 0, move.amount);
    } else if (move.kind === "ajuste") {
      if (move.qty >= 0) {
        pushLine(lines, "inventario", move.amount, 0);
        pushLine(lines, "otros", 0, move.amount);
      } else {
        pushLine(lines, "gastos", move.amount, 0);
        pushLine(lines, "inventario", 0, move.amount);
      }
    }
    out.push(entry(move.id, move.at, move.kind.toUpperCase(), move.memo, move.kind, lines));
  }

  out.sort((a, c) => a.at.localeCompare(c.at) || a.ref.localeCompare(c.ref));
  return out;
}

export function inRange(at: string, from?: string, to?: string): boolean {
  const t = new Date(at).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to && t >= new Date(to).getTime()) return false;
  return true;
}

export function accountBalances(entries: JEntry[]): Record<AccountId, number> {
  const acc = Object.fromEntries((Object.keys(ACCOUNTS) as AccountId[]).map((k) => [k, 0])) as Record<AccountId, number>;
  for (const e of entries) {
    for (const line of e.lines) acc[line.account] += line.debit - line.credit;
  }
  return acc;
}

export function imbalance(b: Books): number {
  const entries = buildJournal(b);
  return entries.reduce((s, e) => s + e.lines.reduce((a, l) => a + l.debit - l.credit, 0), 0);
}

export interface Statement {
  ventas: number;
  costo: number;
  bruto: number;
  gastos: number;
  otros: number;
  resultado: number;
  margen: number;
}

export function statement(b: Books, from?: string, to?: string): Statement {
  const entries = buildJournal(b).filter((e) => e.kind !== "apertura" && inRange(e.at, from, to));
  const raw = accountBalances(entries);
  const ventas = present("ventas", raw.ventas);
  const costo = present("costo", raw.costo);
  const gastos = present("gastos", raw.gastos);
  const otros = present("otros", raw.otros);
  const bruto = ventas - costo;
  const resultado = bruto + otros - gastos;
  return { ventas, costo, bruto, gastos, otros, resultado, margen: ventas > 0 ? bruto / ventas : 0 };
}

export interface BalanceSheet {
  assets: { id: AccountId; label: string; amount: number }[];
  liabilities: { id: AccountId; label: string; amount: number }[];
  equity: { id: string; label: string; amount: number }[];
  assetTotal: number;
  liabilityTotal: number;
  equityTotal: number;
}

export function balanceSheet(b: Books, to?: string): BalanceSheet {
  const entries = buildJournal(b).filter((e) => inRange(e.at, undefined, to));
  const raw = accountBalances(entries);
  const line = (id: AccountId) => ({ id, label: ACCOUNTS[id], amount: present(id, raw[id]) });
  const assets = [line("caja"), line("banco"), line("cxc"), line("inventario"), line("ivaDesc")];
  const liabilities = [line("cxp"), line("ivaGen")];
  const capital = present("capital", raw.capital);
  const resultado = present("ventas", raw.ventas) + present("otros", raw.otros) - present("costo", raw.costo) - present("gastos", raw.gastos);
  const equity = [
    { id: "capital", label: "Capital", amount: capital },
    { id: "resultado", label: "Resultado del ejercicio", amount: resultado },
  ];
  return {
    assets,
    liabilities,
    equity,
    assetTotal: assets.reduce((s, a) => s + a.amount, 0),
    liabilityTotal: liabilities.reduce((s, a) => s + a.amount, 0),
    equityTotal: equity.reduce((s, a) => s + a.amount, 0),
  };
}

export interface CashFlowRow {
  label: string;
  amount: number;
}

export function cashFlow(b: Books, from?: string, to?: string): { rows: CashFlowRow[]; net: number } {
  const entries = buildJournal(b).filter((e) => inRange(e.at, from, to));
  const sum = (kind: JournalKind, dir: "in" | "out") =>
    entries
      .filter((e) => e.kind === kind)
      .reduce((s, e) => {
        const hit = e.lines.filter((l) => l.account === "caja" || l.account === "banco");
        const inn = hit.reduce((a, l) => a + l.debit, 0);
        const out = hit.reduce((a, l) => a + l.credit, 0);
        return s + (dir === "in" ? inn : out);
      }, 0);
  const rows: CashFlowRow[] = [
    { label: "Ventas de contado", amount: sum("venta", "in") },
    { label: "Cobros de cartera", amount: sum("cobro", "in") },
    { label: "Otros ingresos", amount: sum("ingreso", "in") },
    { label: "Compras de contado", amount: -sum("compra", "out") },
    { label: "Pagos a proveedores", amount: -sum("pago", "out") },
    { label: "Gastos", amount: -sum("gasto", "out") },
    { label: "Devoluciones reembolsadas", amount: -sum("devolucion", "out") },
  ];
  return { rows, net: rows.reduce((s, r) => s + r.amount, 0) };
}

export function rangeFrom(now: Date, key: "7d" | "30d" | "mes" | "anio" | "todo"): { from?: string; to?: string } {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const to = new Date(end.getTime() + 1).toISOString();
  if (key === "todo") return { to };
  if (key === "mes") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return { from, to };
  }
  if (key === "anio") {
    const from = new Date(now.getFullYear(), 0, 1).toISOString();
    return { from, to };
  }
  const days = key === "7d" ? 7 : 30;
  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  return { from: from.toISOString(), to };
}

export interface AgingDoc {
  id: string;
  number: string;
  partyId: string;
  party: string;
  at: string;
  dueAt: string;
  open: number;
  daysLate: number;
  bucket: "al_dia" | "d1_30" | "d31_60" | "d61_90" | "d90";
}

function bucketOf(daysLate: number): AgingDoc["bucket"] {
  if (daysLate <= 0) return "al_dia";
  if (daysLate <= 30) return "d1_30";
  if (daysLate <= 60) return "d31_60";
  if (daysLate <= 90) return "d61_90";
  return "d90";
}

export function agingReceivable(b: Books, now = new Date()): AgingDoc[] {
  return b.sales
    .filter((s) => openSale(s) > 0 && s.dueAt)
    .map((s) => {
      const daysLate = Math.floor((now.getTime() - new Date(s.dueAt!).getTime()) / 86_400_000);
      return {
        id: s.id,
        number: s.number,
        partyId: s.customerId || "",
        party: s.customerName,
        at: s.at,
        dueAt: s.dueAt!,
        open: openSale(s),
        daysLate,
        bucket: bucketOf(daysLate),
      };
    })
    .sort((a, c) => c.daysLate - a.daysLate);
}

export function agingPayable(b: Books, now = new Date()): AgingDoc[] {
  return b.purchases
    .filter((s) => openPurchase(s) > 0 && s.dueAt)
    .map((s) => {
      const daysLate = Math.floor((now.getTime() - new Date(s.dueAt!).getTime()) / 86_400_000);
      return {
        id: s.id,
        number: s.number,
        partyId: s.supplierId,
        party: s.supplierName,
        at: s.at,
        dueAt: s.dueAt!,
        open: openPurchase(s),
        daysLate,
        bucket: bucketOf(daysLate),
      };
    })
    .sort((a, c) => c.daysLate - a.daysLate);
}

export function dailySeries(b: Books, now: Date, days: number): { label: string; net: number; cost: number }[] {
  const rows: { label: string; net: number; cost: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const from = start.toISOString();
    const to = end.toISOString();
    let net = 0;
    let cost = 0;
    for (const sale of b.sales) {
      if (sale.status !== "emitida" || !inRange(sale.at, from, to)) continue;
      net += sale.net;
      cost += sale.cost;
    }
    for (const ret of b.returns) {
      if (!inRange(ret.at, from, to)) continue;
      net -= ret.net;
      cost -= ret.cost;
    }
    rows.push({
      label: new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" }).format(start),
      net,
      cost,
    });
  }
  return rows;
}

export interface ProductIntel {
  product: Product;
  soldQty: number;
  revenue: number;
  margin: number;
  velocity: number;
  coverDays: number | null;
  abc: "A" | "B" | "C";
  reorder: number;
}

export function productIntel(b: Books, now = new Date()): ProductIntel[] {
  const from = new Date(now);
  from.setDate(from.getDate() - 29);
  from.setHours(0, 0, 0, 0);
  const fromIso = from.toISOString();
  const stats = new Map<string, { qty: number; revenue: number; margin: number }>();
  for (const p of b.products) stats.set(p.id, { qty: 0, revenue: 0, margin: 0 });
  for (const sale of b.sales) {
    if (sale.status !== "emitida" || sale.at < fromIso) continue;
    for (const line of sale.lines) {
      const s = stats.get(line.productId);
      if (!s) continue;
      s.qty += line.qty;
      s.revenue += line.net;
      s.margin += line.net - line.cost;
    }
  }
  for (const ret of b.returns) {
    if (ret.at < fromIso) continue;
    for (const line of ret.lines) {
      const s = stats.get(line.productId);
      if (!s) continue;
      s.qty -= line.qty;
      s.revenue -= line.net;
      s.margin -= line.net - line.cost;
    }
  }
  const ranked = [...stats.entries()].sort((a, c) => c[1].margin - a[1].margin);
  const totalMargin = ranked.reduce((s, [, v]) => s + Math.max(0, v.margin), 0);
  let cum = 0;
  const abc = new Map<string, "A" | "B" | "C">();
  for (const [id, v] of ranked) {
    const share = totalMargin > 0 ? Math.max(0, v.margin) / totalMargin : 0;
    cum += share;
    abc.set(id, cum <= 0.8 || share >= 0.8 ? "A" : cum <= 0.95 ? "B" : "C");
    if (v.margin <= 0 && share === 0) abc.set(id, "C");
  }
  const lead = 12;
  return b.products
    .filter((p) => p.active)
    .map((product) => {
      const s = stats.get(product.id)!;
      const velocity = s.qty / 30;
      const coverDays = velocity > 0.01 ? product.stock / velocity : null;
      const target = velocity * lead + product.minStock;
      const reorder = Math.max(0, Math.ceil(target - product.stock));
      return {
        product,
        soldQty: s.qty,
        revenue: s.revenue,
        margin: s.margin,
        velocity,
        coverDays,
        abc: abc.get(product.id) ?? "C",
        reorder,
      };
    })
    .sort((a, c) => c.margin - a.margin);
}

export interface Insight {
  tone: "alert" | "good" | "info";
  title: string;
  detail: string;
}

export interface Health {
  score: number;
  liquidity: number;
  margin: number;
  collections: number;
  inventory: number;
  cash: number;
  runwayDays: number | null;
  insights: Insight[];
}

export function healthReport(b: Books, now = new Date()): Health {
  const sheet = balanceSheet(b);
  const cash = (sheet.assets.find((a) => a.id === "caja")?.amount ?? 0) + (sheet.assets.find((a) => a.id === "banco")?.amount ?? 0);
  const last = rangeFrom(now, "30d");
  const pnl = statement(b, last.from, last.to);
  const dailyOpex = pnl.gastos / 30;
  const runwayDays = dailyOpex > 0 ? cash / dailyOpex : null;
  let liquidity = 18;
  if (runwayDays == null) liquidity = 22;
  else if (runwayDays >= 45) liquidity = 25;
  else if (runwayDays >= 21) liquidity = 18;
  else if (runwayDays >= 10) liquidity = 10;
  else liquidity = 4;

  let margin = 8;
  if (pnl.ventas <= 0) margin = 12;
  else if (pnl.margen >= 0.4) margin = 25;
  else if (pnl.margen >= 0.28) margin = 18;
  else if (pnl.margen >= 0.15) margin = 11;
  else margin = 4;

  const ar = agingReceivable(b, now);
  const arTotal = ar.reduce((s, d) => s + d.open, 0);
  const overdue = ar.filter((d) => d.daysLate > 0).reduce((s, d) => s + d.open, 0);
  const ratio = arTotal > 0 ? overdue / arTotal : 0;
  let collections = 25;
  if (arTotal === 0) collections = 25;
  else if (ratio === 0) collections = 25;
  else if (ratio < 0.15) collections = 18;
  else if (ratio < 0.4) collections = 11;
  else collections = 4;

  const intel = productIntel(b, now);
  const watched = intel.filter((i) => i.product.stock > 0 || i.soldQty > 0);
  const healthySku = watched.filter((i) => i.product.stock >= i.product.minStock && (i.coverDays == null || i.coverDays > 10)).length;
  const invRatio = watched.length ? healthySku / watched.length : 1;
  const inventory = invRatio >= 0.8 ? 25 : invRatio >= 0.6 ? 18 : invRatio >= 0.4 ? 11 : 5;

  const insights: Insight[] = [];
  const risky = intel.filter((i) => i.coverDays != null && i.coverDays < 8 && i.velocity > 0).sort((a, c) => a.coverDays! - c.coverDays!);
  if (risky[0]) {
    insights.push({
      tone: "alert",
      title: `${risky[0].product.name} se agota en ${Math.max(1, Math.round(risky[0].coverDays!))} días`,
      detail: `Ritmo ${risky[0].velocity.toFixed(1)} ${risky[0].product.unit}/día · sugerido comprar ${risky[0].reorder} ${risky[0].product.unit}.`,
    });
  }
  const low = intel.filter((i) => i.product.stock < i.product.minStock);
  if (low.length) {
    insights.push({
      tone: "alert",
      title: `${low.length} producto${low.length === 1 ? "" : "s"} bajo mínimo`,
      detail: low.slice(0, 3).map((i) => `${i.product.name} (${i.product.stock})`).join(" · "),
    });
  }
  const late = ar.filter((d) => d.daysLate > 0);
  if (late[0]) {
    insights.push({
      tone: "alert",
      title: `${late[0].party} debe hace ${late[0].daysLate} días`,
      detail: `${late[0].number} sigue abierto. La cartera vencida debilita la caja aunque la venta ya esté registrada.`,
    });
  }
  const thin = intel.filter((i) => i.revenue > 0 && i.margin / i.revenue < 0.15);
  if (thin[0]) {
    insights.push({
      tone: "info",
      title: `Margen fino en ${thin[0].product.name}`,
      detail: "El precio casi no cubre el costo. Súbelo o renegocia la compra antes de empujar volumen.",
    });
  }
  const byCustomer = new Map<string, number>();
  for (const sale of b.sales) {
    if (sale.status !== "emitida" || !inRange(sale.at, last.from, last.to)) continue;
    byCustomer.set(sale.customerName, (byCustomer.get(sale.customerName) ?? 0) + sale.net);
  }
  const top = [...byCustomer.entries()].sort((a, c) => c[1] - a[1])[0];
  if (top && pnl.ventas > 0 && top[1] / pnl.ventas > 0.45 && top[0] !== "Mostrador") {
    insights.push({
      tone: "info",
      title: `${top[0]} concentra las ventas`,
      detail: "Más del 45% del mes depende de un solo cliente. Diversifica o asegura ese contrato.",
    });
  }
  if (pnl.margen >= 0.32 && pnl.ventas > 0) {
    insights.push({
      tone: "good",
      title: "El margen bruto está sano",
      detail: `${Math.round(pnl.margen * 100)}% en los últimos 30 días. Hay espacio para invertir en reposición sin ahogar la caja.`,
    });
  }
  if (runwayDays != null && runwayDays < 21) {
    insights.push({
      tone: "alert",
      title: `Caja para ${Math.max(0, Math.round(runwayDays))} días de gastos`,
      detail: "Cobra lo vencido o aplaza compras que no sean de productos clase A.",
    });
  }
  const dead = intel.filter((i) => i.soldQty <= 0 && i.product.stock > i.product.minStock);
  if (dead[0]) {
    insights.push({
      tone: "info",
      title: `${dead[0].product.name} no rota`,
      detail: "Treinta días sin salida y stock por encima del mínimo. Es candidato a promoción, no a recompra.",
    });
  }

  return {
    score: liquidity + margin + collections + inventory,
    liquidity,
    margin,
    collections,
    inventory,
    cash,
    runwayDays,
    insights: insights.slice(0, 5),
  };
}

export interface KardexRow {
  at: string;
  label: string;
  qty: number;
  balance: number;
  ref: string;
}

export function kardexOf(b: Books, productId: string): KardexRow[] {
  const rows: { at: string; label: string; qty: number; ref: string }[] = [];
  const open = b.opening.lines.find((l) => l.productId === productId);
  if (open) rows.push({ at: b.opening.at, label: "Saldo inicial", qty: open.qty, ref: "APERTURA" });
  for (const sale of b.sales) {
    if (sale.status !== "emitida") continue;
    for (const line of sale.lines) {
      if (line.productId === productId) rows.push({ at: sale.at, label: "Venta", qty: -line.qty, ref: sale.number });
    }
  }
  for (const purchase of b.purchases) {
    if (purchase.status !== "recibida") continue;
    for (const line of purchase.lines) {
      if (line.productId === productId) rows.push({ at: purchase.at, label: "Compra", qty: line.qty, ref: purchase.number });
    }
  }
  for (const ret of b.returns) {
    for (const line of ret.lines) {
      if (line.productId === productId) rows.push({ at: ret.at, label: "Devolución", qty: line.qty, ref: ret.number });
    }
  }
  for (const move of b.moves) {
    if (move.kind === "ajuste" && move.productId === productId) {
      rows.push({ at: move.at, label: move.memo, qty: move.qty, ref: "AJUSTE" });
    }
  }
  rows.sort((a, c) => a.at.localeCompare(c.at));
  let balance = 0;
  return rows.map((r) => {
    balance = Math.round((balance + r.qty) * 1000) / 1000;
    return { ...r, balance };
  });
}

export function simulate(
  b: Books,
  now: Date,
  pricePct: number,
  volumePct: number,
): { base: Statement; projectedNet: number; projectedCost: number; projectedMargin: number; delta: number } {
  const range = rangeFrom(now, "30d");
  const base = statement(b, range.from, range.to);
  const projectedNet = Math.round(base.ventas * (1 + pricePct / 100) * (1 + volumePct / 100));
  const projectedCost = Math.round(base.costo * (1 + volumePct / 100));
  const projectedProfit = projectedNet - projectedCost;
  const projectedMargin = projectedNet > 0 ? projectedProfit / projectedNet : 0;
  return { base, projectedNet, projectedCost, projectedMargin, delta: projectedProfit - base.bruto };
}
