import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { t as GROK_PROVIDERS } from "./server-IIRv8oG_.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-current-user-O7Ub1g3y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var formatters = /* @__PURE__ */ new Map();
function formatMoney(value, currency = "COP") {
	const code = /^[A-Z]{3}$/.test(currency) ? currency : "COP";
	const key = `es-CO|${code}`;
	let fmt = formatters.get(key);
	if (!fmt) {
		const digits = code === "COP" || code === "CLP" || code === "PYG" ? 0 : 2;
		try {
			fmt = new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: code,
				maximumFractionDigits: digits,
				minimumFractionDigits: digits
			});
		} catch {
			fmt = new Intl.NumberFormat("es-CO", {
				style: "currency",
				currency: "COP",
				maximumFractionDigits: 0
			});
		}
		formatters.set(key, fmt);
	}
	const n = Number.isFinite(value) ? value : 0;
	return fmt.format(n);
}
function compactMoney(value) {
	const n = Number.isFinite(value) ? value : 0;
	const sign = n < 0 ? "-" : "";
	const a = Math.abs(n);
	if (a >= 1e6) return `${sign}${(a / 1e6).toFixed(1)}M`;
	if (a >= 1e4) return `${sign}${Math.round(a / 1e3)}k`;
	return `${sign}${Math.round(a)}`;
}
function parseAmount(raw) {
	const s = raw.trim();
	if (!s) return null;
	let n;
	if (/^\d{1,3}(\.\d{3})+$/.test(s)) n = Number(s.replace(/\./g, ""));
	else if (/^\d{1,3}(,\d{3})+$/.test(s)) n = Number(s.replace(/,/g, ""));
	else if (s.includes(",") && s.includes(".")) n = s.lastIndexOf(",") > s.lastIndexOf(".") ? Number(s.replace(/\./g, "").replace(",", ".")) : Number(s.replace(/,/g, ""));
	else if (s.includes(",")) n = Number(s.replace(",", "."));
	else n = Number(s);
	if (!Number.isFinite(n) || n <= 0) return null;
	return Math.round(n);
}
function fold(s) {
	return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function formatWhen(iso) {
	return new Intl.DateTimeFormat("es-CO", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	}).format(new Date(iso));
}
function formatDay(iso) {
	return new Intl.DateTimeFormat("es-CO", {
		day: "2-digit",
		month: "short"
	}).format(new Date(iso));
}
var PAYMENT_LABEL = {
	efectivo: "Efectivo",
	transferencia: "Transferencia",
	tarjeta: "Tarjeta",
	credito: "Crédito"
};
var TAX_PRESETS = [
	{
		id: "co",
		label: "Colombia · IVA 19%",
		rate: .19,
		regime: "Responsable de IVA"
	},
	{
		id: "mx",
		label: "México · IVA 16%",
		rate: .16,
		regime: "Régimen general"
	},
	{
		id: "ar",
		label: "Argentina · IVA 21%",
		rate: .21,
		regime: "Responsable inscripto"
	},
	{
		id: "cl",
		label: "Chile · IVA 19%",
		rate: .19,
		regime: "Régimen general"
	},
	{
		id: "pe",
		label: "Perú · IGV 18%",
		rate: .18,
		regime: "Régimen general"
	},
	{
		id: "es",
		label: "España · IVA 21%",
		rate: .21,
		regime: "Régimen general"
	},
	{
		id: "us",
		label: "EE.UU. · sin impuesto",
		rate: 0,
		regime: "Sales tax no incluido"
	},
	{
		id: "cero",
		label: "Sin impuesto",
		rate: 0,
		regime: "No responsable"
	}
];
var CURRENCIES = [
	"COP",
	"USD",
	"MXN",
	"ARS",
	"CLP",
	"PEN",
	"BRL",
	"EUR",
	"VES"
];
function representationCode(parts) {
	let h = 2166136261;
	for (let i = 0; i < parts.length; i++) {
		h ^= parts.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
}
var BookError = class extends Error {};
var ACCOUNTS = {
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
	otros: "Otros ingresos"
};
var DEBIT_NORMAL = /* @__PURE__ */ new Set([
	"caja",
	"banco",
	"cxc",
	"inventario",
	"ivaDesc",
	"costo",
	"gastos"
]);
function present(account, raw) {
	return DEBIT_NORMAL.has(account) ? raw : -raw;
}
function taxFromGross(gross, rate) {
	const tax = Math.round(gross * rate / (1 + rate));
	return {
		tax,
		net: gross - tax
	};
}
function taxOnNet(net, rate) {
	const tax = Math.round(net * rate);
	return {
		tax,
		gross: net + tax
	};
}
function addDays(iso, days) {
	const d = new Date(iso);
	d.setDate(d.getDate() + days);
	return d.toISOString();
}
function clone(b) {
	return structuredClone(b);
}
function nextId(b, prefix) {
	b.seq += 1;
	return `${prefix}${b.seq}`;
}
function pushLine(lines, account, debit, credit) {
	const d = Math.round(debit);
	const c = Math.round(credit);
	if (d === 0 && c === 0) return;
	lines.push({
		account,
		debit: d,
		credit: c
	});
}
function viaAccount(via) {
	return via === "caja" ? "caja" : "banco";
}
function cashAccount(method) {
	if (method === "efectivo" || method === "caja") return "caja";
	if (method === "credito") return "cxc";
	return "banco";
}
function emptyBooks(company, openingAt) {
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
		opening: {
			at: openingAt,
			cash: 0,
			bank: 0,
			lines: []
		},
		seq: 0
	};
}
function setOpening(b0, opening) {
	const b = clone(b0);
	b.opening = opening;
	for (const line of opening.lines) {
		const p = b.products.find((x) => x.id === line.productId);
		if (!p) throw new BookError("Producto de apertura inexistente");
		p.stock = line.qty;
	}
	return b;
}
function findProduct(b, id) {
	const p = b.products.find((x) => x.id === id);
	if (!p) throw new BookError("Producto no encontrado");
	return p;
}
function openSale(sale) {
	if (sale.status !== "emitida" || sale.payment !== "credito") return 0;
	return Math.max(0, sale.gross - sale.returnedGross - sale.paid);
}
function openPurchase(p) {
	if (p.status !== "recibida" || p.payment !== "credito") return 0;
	return Math.max(0, p.gross - p.paid);
}
function postSale(b0, input) {
	if (input.lines.length === 0) throw new BookError("La venta no tiene productos");
	if (input.payment === "credito" && !input.customerId) throw new BookError("El crédito exige un cliente");
	const b = clone(b0);
	const rate = b.company.taxRate;
	const customer = input.customerId ? b.parties.find((p) => p.id === input.customerId && p.kind === "customer") : null;
	if (input.customerId && !customer) throw new BookError("Cliente no encontrado");
	const merged = /* @__PURE__ */ new Map();
	for (const line of input.lines) {
		if (!Number.isFinite(line.qty) || line.qty <= 0) throw new BookError("Cantidad inválida");
		const prev = merged.get(line.productId);
		if (prev) prev.qty += line.qty;
		else merged.set(line.productId, { ...line });
	}
	const lines = [];
	for (const line of merged.values()) {
		const qty = Math.round(line.qty * 1e3) / 1e3;
		const p = findProduct(b, line.productId);
		if (!p.active) throw new BookError(`${p.name} está inactivo`);
		if (p.stock + 1e-9 < qty) throw new BookError(`Stock insuficiente de ${p.name} (${p.stock} ${p.unit})`);
		const unitGross = Math.round(line.unitGross ?? p.price);
		if (unitGross < 0) throw new BookError("Precio inválido");
		const gross = Math.round(unitGross * qty);
		const { tax, net } = taxFromGross(gross, rate);
		const cost = Math.round(p.cost * qty);
		p.stock = Math.round((p.stock - qty) * 1e3) / 1e3;
		lines.push({
			productId: p.id,
			name: p.name,
			qty,
			unitGross,
			unitCost: p.cost,
			gross,
			tax,
			net,
			cost
		});
	}
	const gross = lines.reduce((s, l) => s + l.gross, 0);
	const tax = lines.reduce((s, l) => s + l.tax, 0);
	const net = lines.reduce((s, l) => s + l.net, 0);
	const cost = lines.reduce((s, l) => s + l.cost, 0);
	const sale = {
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
		returnedGross: 0
	};
	b.sales.unshift(sale);
	return {
		books: b,
		sale
	};
}
function voidSale(b0, saleId) {
	const b = clone(b0);
	const sale = b.sales.find((s) => s.id === saleId);
	if (!sale || sale.status !== "emitida") throw new BookError("Venta no encontrada");
	if (b.returns.some((r) => r.saleId === sale.id)) throw new BookError("Tiene devoluciones. No se puede anular.");
	if (sale.payment === "credito" && sale.paid > 0) throw new BookError("Tiene abonos. Registra una devolución.");
	for (const line of sale.lines) {
		const p = findProduct(b, line.productId);
		p.stock = Math.round((p.stock + line.qty) * 1e3) / 1e3;
	}
	sale.status = "anulada";
	return b;
}
function postPurchase(b0, input) {
	if (input.lines.length === 0) throw new BookError("La compra no tiene productos");
	const b = clone(b0);
	const supplier = b.parties.find((p) => p.id === input.supplierId && p.kind === "supplier");
	if (!supplier) throw new BookError("Proveedor no encontrado");
	const rate = b.company.taxRate;
	const lines = [];
	for (const line of input.lines) {
		const qty = Math.round(line.qty * 1e3) / 1e3;
		if (qty <= 0) throw new BookError("Cantidad inválida");
		const p = findProduct(b, line.productId);
		const unitNet = Math.round(line.unitNet ?? p.cost);
		if (unitNet < 0) throw new BookError("Costo inválido");
		const net = Math.round(unitNet * qty);
		const taxed = taxOnNet(net, rate);
		p.stock = Math.round((p.stock + qty) * 1e3) / 1e3;
		p.cost = unitNet;
		lines.push({
			productId: p.id,
			name: p.name,
			qty,
			unitNet,
			net,
			tax: taxed.tax,
			gross: taxed.gross
		});
	}
	const purchase = {
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
		paid: input.payment === "credito" ? 0 : lines.reduce((s, l) => s + l.gross, 0)
	};
	b.purchases.unshift(purchase);
	return {
		books: b,
		purchase
	};
}
function voidPurchase(b0, purchaseId) {
	const b = clone(b0);
	const purchase = b.purchases.find((p) => p.id === purchaseId);
	if (!purchase || purchase.status !== "recibida") throw new BookError("Compra no encontrada");
	if (purchase.payment === "credito" && purchase.paid > 0) throw new BookError("Tiene pagos aplicados");
	for (const line of purchase.lines) {
		const p = findProduct(b, line.productId);
		if (p.stock + 1e-9 < line.qty) throw new BookError(`Stock insuficiente para reversar ${p.name}`);
		p.stock = Math.round((p.stock - line.qty) * 1e3) / 1e3;
	}
	purchase.status = "anulada";
	return b;
}
function postExpense(b0, input) {
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
		qty: 0
	});
	return b;
}
function postIncome(b0, input) {
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
		qty: 0
	});
	return b;
}
function postCollection(b0, input) {
	const b = clone(b0);
	const customer = b.parties.find((p) => p.id === input.customerId && p.kind === "customer");
	if (!customer) throw new BookError("Cliente no encontrado");
	let left = Math.round(input.amount);
	if (left <= 0) throw new BookError("Monto inválido");
	const open = b.sales.filter((s) => s.customerId === customer.id && openSale(s) > 0).sort((a, c) => a.at.localeCompare(c.at));
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
		qty: 0
	});
	return b;
}
function postSupplierPayment(b0, input) {
	const b = clone(b0);
	const supplier = b.parties.find((p) => p.id === input.supplierId && p.kind === "supplier");
	if (!supplier) throw new BookError("Proveedor no encontrado");
	let left = Math.round(input.amount);
	if (left <= 0) throw new BookError("Monto inválido");
	const open = b.purchases.filter((p) => p.supplierId === supplier.id && openPurchase(p) > 0).sort((a, c) => a.at.localeCompare(c.at));
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
		qty: 0
	});
	return b;
}
function postReturn(b0, input) {
	const b = clone(b0);
	const sale = b.sales.find((s) => s.id === input.saleId && s.status === "emitida");
	if (!sale) throw new BookError("Venta no encontrada");
	const returned = /* @__PURE__ */ new Map();
	for (const r of b.returns.filter((r) => r.saleId === sale.id)) for (const line of r.lines) returned.set(line.productId, (returned.get(line.productId) ?? 0) + line.qty);
	const lines = [];
	for (const req of input.lines) {
		const qty = Math.round(req.qty * 1e3) / 1e3;
		if (qty <= 0) continue;
		const originals = sale.lines.filter((l) => l.productId === req.productId);
		if (originals.length === 0) throw new BookError("Ese producto no está en la venta");
		const sold = originals.reduce((s, l) => s + l.qty, 0);
		if ((returned.get(req.productId) ?? 0) + qty > sold + 1e-9) throw new BookError(`Cantidad a devolver supera lo vendido de ${originals[0].name}`);
		const base = originals[0];
		const gross = Math.round(base.unitGross * qty);
		const { tax, net } = taxFromGross(gross, b.company.taxRate);
		const cost = Math.round(base.unitCost * qty);
		const p = findProduct(b, req.productId);
		p.stock = Math.round((p.stock + qty) * 1e3) / 1e3;
		lines.push({
			productId: p.id,
			name: base.name,
			qty,
			gross,
			tax,
			net,
			cost
		});
	}
	if (lines.length === 0) throw new BookError("Nada para devolver");
	const gross = lines.reduce((s, l) => s + l.gross, 0);
	const open = Math.max(0, sale.gross - sale.returnedGross - sale.paid);
	const toAr = sale.payment === "credito" ? Math.min(gross, open) : 0;
	const toCash = gross - toAr;
	sale.returnedGross += gross;
	if (toCash > 0 && sale.payment === "credito") sale.paid = Math.max(0, sale.paid - toCash);
	if (sale.payment !== "credito") sale.paid = Math.max(0, sale.paid - toCash);
	const via = sale.payment === "transferencia" || sale.payment === "tarjeta" ? "banco" : "caja";
	const doc = {
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
		via
	};
	b.returns.unshift(doc);
	return {
		books: b,
		doc
	};
}
function postAdjust(b0, input) {
	const b = clone(b0);
	const p = findProduct(b, input.productId);
	const qty = Math.round(input.qtyDelta * 1e3) / 1e3;
	if (qty === 0) throw new BookError("El ajuste es cero");
	if (p.stock + qty < -1e-9) throw new BookError("El ajuste dejaría el stock en negativo");
	const amount = Math.round(Math.abs(qty) * p.cost);
	p.stock = Math.round((p.stock + qty) * 1e3) / 1e3;
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
		qty
	});
	return b;
}
function postQuote(b0, input) {
	if (input.lines.length === 0) throw new BookError("La cotización está vacía");
	const b = clone(b0);
	const customer = input.customerId ? b.parties.find((p) => p.id === input.customerId) : null;
	const rate = b.company.taxRate;
	const lines = input.lines.map((line) => {
		const p = findProduct(b, line.productId);
		const qty = Math.round(line.qty * 1e3) / 1e3;
		if (qty <= 0) throw new BookError("Cantidad inválida");
		const unitGross = Math.round(line.unitGross ?? p.price);
		const gross = Math.round(unitGross * qty);
		const { tax, net } = taxFromGross(gross, rate);
		return {
			productId: p.id,
			name: p.name,
			qty,
			unitGross,
			gross,
			tax,
			net
		};
	});
	const quote = {
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
		net: lines.reduce((s, l) => s + l.net, 0)
	};
	b.quotes.unshift(quote);
	return {
		books: b,
		quote
	};
}
function setQuoteStatus(b0, quoteId, status) {
	const b = clone(b0);
	const q = b.quotes.find((x) => x.id === quoteId);
	if (!q) throw new BookError("Cotización no encontrada");
	q.status = status;
	return b;
}
function acceptQuote(b0, quoteId, payment, at) {
	const q = b0.quotes.find((x) => x.id === quoteId);
	if (!q || q.status !== "enviada") throw new BookError("Esa cotización ya no está vigente");
	const { books } = postSale(b0, {
		at,
		customerId: q.customerId,
		payment,
		lines: q.lines.map((l) => ({
			productId: l.productId,
			qty: l.qty,
			unitGross: l.unitGross
		}))
	});
	const quote = books.quotes.find((x) => x.id === quoteId);
	if (quote) quote.status = "aceptada";
	return books;
}
function saveProduct(b0, input) {
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
	} else b.products.push({
		id: nextId(b, "p"),
		sku,
		name,
		categoryId: input.categoryId,
		price: Math.round(input.price),
		cost: Math.round(input.cost),
		stock: 0,
		minStock: Math.max(0, Math.round(input.minStock)),
		unit: input.unit.trim() || "und",
		active: true
	});
	return b;
}
function saveParty(b0, input) {
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
			termsDays: Math.max(0, Math.round(input.termsDays))
		});
	} else b.parties.push({
		id: nextId(b, input.kind === "customer" ? "cli" : "prv"),
		kind: input.kind,
		name,
		document: input.document.trim(),
		email: input.email.trim(),
		phone: input.phone.trim(),
		address: input.address.trim(),
		termsDays: Math.max(0, Math.round(input.termsDays))
	});
	return b;
}
function saveCategory(b0, name) {
	const b = clone(b0);
	const clean = name.trim();
	if (!clean) throw new BookError("Nombre vacío");
	b.categories.push({
		id: nextId(b, "cat"),
		name: clean
	});
	return b;
}
function updateCompany(b0, patch) {
	const b = clone(b0);
	b.company = {
		...b.company,
		...patch
	};
	if (b.company.taxRate < 0 || b.company.taxRate > .5) throw new BookError("Tasa de impuesto fuera de rango");
	b.company.currency = b.company.currency.toUpperCase();
	return b;
}
function entry(id, at, ref, memo, kind, lines) {
	return {
		id,
		at,
		ref,
		memo,
		kind,
		lines
	};
}
function buildJournal(b) {
	const out = [];
	const openLines = [];
	const inv = b.opening.lines.reduce((s, l) => s + Math.round(l.qty * l.unitCost), 0);
	pushLine(openLines, "caja", b.opening.cash, 0);
	pushLine(openLines, "banco", b.opening.bank, 0);
	pushLine(openLines, "inventario", inv, 0);
	pushLine(openLines, "capital", 0, b.opening.cash + b.opening.bank + inv);
	out.push(entry("opening", b.opening.at, "APERTURA", "Saldos iniciales", "apertura", openLines));
	const sales = [...b.sales].sort((a, c) => a.at.localeCompare(c.at));
	for (const sale of sales) {
		if (sale.status !== "emitida") continue;
		const lines = [];
		pushLine(lines, cashAccount(sale.payment), sale.gross, 0);
		pushLine(lines, "ventas", 0, sale.net);
		pushLine(lines, "ivaGen", 0, sale.tax);
		pushLine(lines, "costo", sale.cost, 0);
		pushLine(lines, "inventario", 0, sale.cost);
		out.push(entry(sale.id, sale.at, sale.number, `Venta · ${sale.customerName}`, "venta", lines));
	}
	for (const purchase of [...b.purchases].sort((a, c) => a.at.localeCompare(c.at))) {
		if (purchase.status !== "recibida") continue;
		const lines = [];
		pushLine(lines, "inventario", purchase.net, 0);
		pushLine(lines, "ivaDesc", purchase.tax, 0);
		pushLine(lines, purchase.payment === "credito" ? "cxp" : cashAccount(purchase.payment), 0, purchase.gross);
		out.push(entry(purchase.id, purchase.at, purchase.number, `Compra · ${purchase.supplierName}`, "compra", lines));
	}
	for (const ret of [...b.returns].sort((a, c) => a.at.localeCompare(c.at))) {
		const lines = [];
		pushLine(lines, "ventas", ret.net, 0);
		pushLine(lines, "ivaGen", ret.tax, 0);
		pushLine(lines, "cxc", 0, ret.toAr);
		pushLine(lines, ret.via, 0, ret.toCash);
		pushLine(lines, "inventario", ret.cost, 0);
		pushLine(lines, "costo", 0, ret.cost);
		out.push(entry(ret.id, ret.at, ret.number, `Devolución · ${ret.saleNumber}`, "devolucion", lines));
	}
	for (const move of [...b.moves].sort((a, c) => a.at.localeCompare(c.at))) {
		const lines = [];
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
function inRange(at, from, to) {
	const t = new Date(at).getTime();
	if (from && t < new Date(from).getTime()) return false;
	if (to && t >= new Date(to).getTime()) return false;
	return true;
}
function accountBalances(entries) {
	const acc = Object.fromEntries(Object.keys(ACCOUNTS).map((k) => [k, 0]));
	for (const e of entries) for (const line of e.lines) acc[line.account] += line.debit - line.credit;
	return acc;
}
function imbalance(b) {
	return buildJournal(b).reduce((s, e) => s + e.lines.reduce((a, l) => a + l.debit - l.credit, 0), 0);
}
function statement(b, from, to) {
	const raw = accountBalances(buildJournal(b).filter((e) => e.kind !== "apertura" && inRange(e.at, from, to)));
	const ventas = present("ventas", raw.ventas);
	const costo = present("costo", raw.costo);
	const gastos = present("gastos", raw.gastos);
	const otros = present("otros", raw.otros);
	const bruto = ventas - costo;
	return {
		ventas,
		costo,
		bruto,
		gastos,
		otros,
		resultado: bruto + otros - gastos,
		margen: ventas > 0 ? bruto / ventas : 0
	};
}
function balanceSheet(b, to) {
	const raw = accountBalances(buildJournal(b).filter((e) => inRange(e.at, void 0, to)));
	const line = (id) => ({
		id,
		label: ACCOUNTS[id],
		amount: present(id, raw[id])
	});
	const assets = [
		line("caja"),
		line("banco"),
		line("cxc"),
		line("inventario"),
		line("ivaDesc")
	];
	const liabilities = [line("cxp"), line("ivaGen")];
	const capital = present("capital", raw.capital);
	const resultado = present("ventas", raw.ventas) + present("otros", raw.otros) - present("costo", raw.costo) - present("gastos", raw.gastos);
	const equity = [{
		id: "capital",
		label: "Capital",
		amount: capital
	}, {
		id: "resultado",
		label: "Resultado del ejercicio",
		amount: resultado
	}];
	return {
		assets,
		liabilities,
		equity,
		assetTotal: assets.reduce((s, a) => s + a.amount, 0),
		liabilityTotal: liabilities.reduce((s, a) => s + a.amount, 0),
		equityTotal: equity.reduce((s, a) => s + a.amount, 0)
	};
}
function cashFlow(b, from, to) {
	const entries = buildJournal(b).filter((e) => inRange(e.at, from, to));
	const sum = (kind, dir) => entries.filter((e) => e.kind === kind).reduce((s, e) => {
		const hit = e.lines.filter((l) => l.account === "caja" || l.account === "banco");
		const inn = hit.reduce((a, l) => a + l.debit, 0);
		const out = hit.reduce((a, l) => a + l.credit, 0);
		return s + (dir === "in" ? inn : out);
	}, 0);
	const rows = [
		{
			label: "Ventas de contado",
			amount: sum("venta", "in")
		},
		{
			label: "Cobros de cartera",
			amount: sum("cobro", "in")
		},
		{
			label: "Otros ingresos",
			amount: sum("ingreso", "in")
		},
		{
			label: "Compras de contado",
			amount: -sum("compra", "out")
		},
		{
			label: "Pagos a proveedores",
			amount: -sum("pago", "out")
		},
		{
			label: "Gastos",
			amount: -sum("gasto", "out")
		},
		{
			label: "Devoluciones reembolsadas",
			amount: -sum("devolucion", "out")
		}
	];
	return {
		rows,
		net: rows.reduce((s, r) => s + r.amount, 0)
	};
}
function rangeFrom(now, key) {
	const end = new Date(now);
	end.setHours(23, 59, 59, 999);
	const to = new Date(end.getTime() + 1).toISOString();
	if (key === "todo") return { to };
	if (key === "mes") return {
		from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
		to
	};
	if (key === "anio") return {
		from: new Date(now.getFullYear(), 0, 1).toISOString(),
		to
	};
	const days = key === "7d" ? 7 : 30;
	const from = new Date(now);
	from.setDate(from.getDate() - (days - 1));
	from.setHours(0, 0, 0, 0);
	return {
		from: from.toISOString(),
		to
	};
}
function bucketOf(daysLate) {
	if (daysLate <= 0) return "al_dia";
	if (daysLate <= 30) return "d1_30";
	if (daysLate <= 60) return "d31_60";
	if (daysLate <= 90) return "d61_90";
	return "d90";
}
function agingReceivable(b, now = /* @__PURE__ */ new Date()) {
	return b.sales.filter((s) => openSale(s) > 0 && s.dueAt).map((s) => {
		const daysLate = Math.floor((now.getTime() - new Date(s.dueAt).getTime()) / 864e5);
		return {
			id: s.id,
			number: s.number,
			partyId: s.customerId || "",
			party: s.customerName,
			at: s.at,
			dueAt: s.dueAt,
			open: openSale(s),
			daysLate,
			bucket: bucketOf(daysLate)
		};
	}).sort((a, c) => c.daysLate - a.daysLate);
}
function agingPayable(b, now = /* @__PURE__ */ new Date()) {
	return b.purchases.filter((s) => openPurchase(s) > 0 && s.dueAt).map((s) => {
		const daysLate = Math.floor((now.getTime() - new Date(s.dueAt).getTime()) / 864e5);
		return {
			id: s.id,
			number: s.number,
			partyId: s.supplierId,
			party: s.supplierName,
			at: s.at,
			dueAt: s.dueAt,
			open: openPurchase(s),
			daysLate,
			bucket: bucketOf(daysLate)
		};
	}).sort((a, c) => c.daysLate - a.daysLate);
}
function dailySeries(b, now, days) {
	const rows = [];
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
			label: new Intl.DateTimeFormat("es-CO", {
				day: "numeric",
				month: "short"
			}).format(start),
			net,
			cost
		});
	}
	return rows;
}
function productIntel(b, now = /* @__PURE__ */ new Date()) {
	const from = new Date(now);
	from.setDate(from.getDate() - 29);
	from.setHours(0, 0, 0, 0);
	const fromIso = from.toISOString();
	const stats = /* @__PURE__ */ new Map();
	for (const p of b.products) stats.set(p.id, {
		qty: 0,
		revenue: 0,
		margin: 0
	});
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
	const abc = /* @__PURE__ */ new Map();
	for (const [id, v] of ranked) {
		const share = totalMargin > 0 ? Math.max(0, v.margin) / totalMargin : 0;
		cum += share;
		abc.set(id, cum <= .8 || share >= .8 ? "A" : cum <= .95 ? "B" : "C");
		if (v.margin <= 0 && share === 0) abc.set(id, "C");
	}
	const lead = 12;
	return b.products.filter((p) => p.active).map((product) => {
		const s = stats.get(product.id);
		const velocity = s.qty / 30;
		const coverDays = velocity > .01 ? product.stock / velocity : null;
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
			reorder
		};
	}).sort((a, c) => c.margin - a.margin);
}
function healthReport(b, now = /* @__PURE__ */ new Date()) {
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
	else if (pnl.margen >= .4) margin = 25;
	else if (pnl.margen >= .28) margin = 18;
	else if (pnl.margen >= .15) margin = 11;
	else margin = 4;
	const ar = agingReceivable(b, now);
	const arTotal = ar.reduce((s, d) => s + d.open, 0);
	const overdue = ar.filter((d) => d.daysLate > 0).reduce((s, d) => s + d.open, 0);
	const ratio = arTotal > 0 ? overdue / arTotal : 0;
	let collections = 25;
	if (arTotal === 0) collections = 25;
	else if (ratio === 0) collections = 25;
	else if (ratio < .15) collections = 18;
	else if (ratio < .4) collections = 11;
	else collections = 4;
	const intel = productIntel(b, now);
	const watched = intel.filter((i) => i.product.stock > 0 || i.soldQty > 0);
	const healthySku = watched.filter((i) => i.product.stock >= i.product.minStock && (i.coverDays == null || i.coverDays > 10)).length;
	const invRatio = watched.length ? healthySku / watched.length : 1;
	const inventory = invRatio >= .8 ? 25 : invRatio >= .6 ? 18 : invRatio >= .4 ? 11 : 5;
	const insights = [];
	const risky = intel.filter((i) => i.coverDays != null && i.coverDays < 8 && i.velocity > 0).sort((a, c) => a.coverDays - c.coverDays);
	if (risky[0]) insights.push({
		tone: "alert",
		title: `${risky[0].product.name} se agota en ${Math.max(1, Math.round(risky[0].coverDays))} días`,
		detail: `Ritmo ${risky[0].velocity.toFixed(1)} ${risky[0].product.unit}/día · sugerido comprar ${risky[0].reorder} ${risky[0].product.unit}.`
	});
	const low = intel.filter((i) => i.product.stock < i.product.minStock);
	if (low.length) insights.push({
		tone: "alert",
		title: `${low.length} producto${low.length === 1 ? "" : "s"} bajo mínimo`,
		detail: low.slice(0, 3).map((i) => `${i.product.name} (${i.product.stock})`).join(" · ")
	});
	const late = ar.filter((d) => d.daysLate > 0);
	if (late[0]) insights.push({
		tone: "alert",
		title: `${late[0].party} debe hace ${late[0].daysLate} días`,
		detail: `${late[0].number} sigue abierto. La cartera vencida debilita la caja aunque la venta ya esté registrada.`
	});
	const thin = intel.filter((i) => i.revenue > 0 && i.margin / i.revenue < .15);
	if (thin[0]) insights.push({
		tone: "info",
		title: `Margen fino en ${thin[0].product.name}`,
		detail: "El precio casi no cubre el costo. Súbelo o renegocia la compra antes de empujar volumen."
	});
	const byCustomer = /* @__PURE__ */ new Map();
	for (const sale of b.sales) {
		if (sale.status !== "emitida" || !inRange(sale.at, last.from, last.to)) continue;
		byCustomer.set(sale.customerName, (byCustomer.get(sale.customerName) ?? 0) + sale.net);
	}
	const top = [...byCustomer.entries()].sort((a, c) => c[1] - a[1])[0];
	if (top && pnl.ventas > 0 && top[1] / pnl.ventas > .45 && top[0] !== "Mostrador") insights.push({
		tone: "info",
		title: `${top[0]} concentra las ventas`,
		detail: "Más del 45% del mes depende de un solo cliente. Diversifica o asegura ese contrato."
	});
	if (pnl.margen >= .32 && pnl.ventas > 0) insights.push({
		tone: "good",
		title: "El margen bruto está sano",
		detail: `${Math.round(pnl.margen * 100)}% en los últimos 30 días. Hay espacio para invertir en reposición sin ahogar la caja.`
	});
	if (runwayDays != null && runwayDays < 21) insights.push({
		tone: "alert",
		title: `Caja para ${Math.max(0, Math.round(runwayDays))} días de gastos`,
		detail: "Cobra lo vencido o aplaza compras que no sean de productos clase A."
	});
	const dead = intel.filter((i) => i.soldQty <= 0 && i.product.stock > i.product.minStock);
	if (dead[0]) insights.push({
		tone: "info",
		title: `${dead[0].product.name} no rota`,
		detail: "Treinta días sin salida y stock por encima del mínimo. Es candidato a promoción, no a recompra."
	});
	return {
		score: liquidity + margin + collections + inventory,
		liquidity,
		margin,
		collections,
		inventory,
		cash,
		runwayDays,
		insights: insights.slice(0, 5)
	};
}
function kardexOf(b, productId) {
	const rows = [];
	const open = b.opening.lines.find((l) => l.productId === productId);
	if (open) rows.push({
		at: b.opening.at,
		label: "Saldo inicial",
		qty: open.qty,
		ref: "APERTURA"
	});
	for (const sale of b.sales) {
		if (sale.status !== "emitida") continue;
		for (const line of sale.lines) if (line.productId === productId) rows.push({
			at: sale.at,
			label: "Venta",
			qty: -line.qty,
			ref: sale.number
		});
	}
	for (const purchase of b.purchases) {
		if (purchase.status !== "recibida") continue;
		for (const line of purchase.lines) if (line.productId === productId) rows.push({
			at: purchase.at,
			label: "Compra",
			qty: line.qty,
			ref: purchase.number
		});
	}
	for (const ret of b.returns) for (const line of ret.lines) if (line.productId === productId) rows.push({
		at: ret.at,
		label: "Devolución",
		qty: line.qty,
		ref: ret.number
	});
	for (const move of b.moves) if (move.kind === "ajuste" && move.productId === productId) rows.push({
		at: move.at,
		label: move.memo,
		qty: move.qty,
		ref: "AJUSTE"
	});
	rows.sort((a, c) => a.at.localeCompare(c.at));
	let balance = 0;
	return rows.map((r) => {
		balance = Math.round((balance + r.qty) * 1e3) / 1e3;
		return {
			...r,
			balance
		};
	});
}
function simulate(b, now, pricePct, volumePct) {
	const range = rangeFrom(now, "30d");
	const base = statement(b, range.from, range.to);
	const projectedNet = Math.round(base.ventas * (1 + pricePct / 100) * (1 + volumePct / 100));
	const projectedCost = Math.round(base.costo * (1 + volumePct / 100));
	const projectedProfit = projectedNet - projectedCost;
	return {
		base,
		projectedNet,
		projectedCost,
		projectedMargin: projectedNet > 0 ? projectedProfit / projectedNet : 0,
		delta: projectedProfit - base.bruto
	};
}
function scoreName(query, name) {
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
	return hits / tokens.length * 70;
}
function best(items, query, name) {
	let top = null;
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
function moneyTail(n) {
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0
	}).format(n);
}
function runCommand(b, raw, now = /* @__PURE__ */ new Date()) {
	const text = fold(raw).replace(/\s+/g, " ").trim();
	if (!text) return {
		ok: false,
		message: "Escribe una orden.",
		books: null
	};
	const fail = (message) => ({
		ok: false,
		message,
		books: null
	});
	const done = (books, message) => ({
		ok: true,
		message,
		books
	});
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
			return done(postExpense(b, {
				at: now.toISOString(),
				amount,
				memo: gasto[3],
				via: "caja"
			}), `Gasto de ${moneyTail(amount)} en caja · ${gasto[3]}.`);
		}
		const ingreso = text.match(/^(ingreso)\s+([0-9.,]+)\s+(.+)$/);
		if (ingreso) {
			const amount = parseAmount(ingreso[2]);
			if (!amount) return fail("No entendí el monto.");
			return done(postIncome(b, {
				at: now.toISOString(),
				amount,
				memo: ingreso[3],
				via: "caja"
			}), `Ingreso de ${moneyTail(amount)} · ${ingreso[3]}.`);
		}
		const cobrar = text.match(/^cobrar\s+([0-9.,]+)\s+a\s+(.+)$/) || text.match(/^cobrar\s+a\s+(.+?)\s+([0-9.,]+)$/);
		if (cobrar) {
			const amountRaw = /^\d/.test(cobrar[1]) ? cobrar[1] : cobrar[2];
			const who = /^\d/.test(cobrar[1]) ? cobrar[2] : cobrar[1];
			const amount = parseAmount(amountRaw);
			const customer = best(b.parties.filter((p) => p.kind === "customer"), who, (p) => p.name);
			if (!amount) return fail("No entendí el monto.");
			if (!customer) return fail(`No encuentro al cliente “${who}”.`);
			return done(postCollection(b, {
				at: now.toISOString(),
				customerId: customer.id,
				amount,
				via: "caja"
			}), `Abono de ${moneyTail(amount)} de ${customer.name}. La cartera y la caja ya cuadran.`);
		}
		const pagar = text.match(/^pagar\s+([0-9.,]+)\s+a\s+(.+)$/) || text.match(/^pagar\s+a\s+(.+?)\s+([0-9.,]+)$/);
		if (pagar) {
			const amountRaw = /^\d/.test(pagar[1]) ? pagar[1] : pagar[2];
			const who = /^\d/.test(pagar[1]) ? pagar[2] : pagar[1];
			const amount = parseAmount(amountRaw);
			const supplier = best(b.parties.filter((p) => p.kind === "supplier"), who, (p) => p.name);
			if (!amount) return fail("No entendí el monto.");
			if (!supplier) return fail(`No encuentro al proveedor “${who}”.`);
			return done(postSupplierPayment(b, {
				at: now.toISOString(),
				supplierId: supplier.id,
				amount,
				via: "banco"
			}), `Pago de ${moneyTail(amount)} a ${supplier.name}, desde bancos.`);
		}
		const trade = text.match(/^(venta|vender|vende|facturar|compra|comprar)\s+(.+)$/);
		if (trade) {
			const kind = trade[1].startsWith("comp") ? "compra" : "venta";
			let rest = trade[2];
			let payment = kind === "compra" ? "efectivo" : "efectivo";
			const pay = rest.match(/\b(efectivo|transferencia|tarjeta|credito)\b/);
			if (pay) {
				payment = pay[1];
				rest = rest.replace(pay[0], " ").replace(/\s+/g, " ").trim();
			}
			let partyQuery = null;
			const split = rest.match(/^(.*?)\s+a\s+(.+)$/);
			if (split) {
				rest = split[1].trim();
				partyQuery = split[2].trim();
			}
			const qtyMatch = rest.match(/^([0-9]+(?:[.,][0-9]+)?)\s+(.+)$/);
			if (!qtyMatch) return fail(kind === "venta" ? "Prueba: vender 2 café de origen a ana efectivo" : "Prueba: compra 20 panela a alimentos credito");
			const qty = Number(qtyMatch[1].replace(",", "."));
			if (!Number.isFinite(qty) || qty <= 0) return fail("Cantidad inválida.");
			const product = best(b.products.filter((p) => p.active), qtyMatch[2], (p) => `${p.name} ${p.sku}`);
			if (!product) return fail(`No encuentro “${qtyMatch[2]}” en el inventario.`);
			if (kind === "venta") {
				const customer = partyQuery ? best(b.parties.filter((p) => p.kind === "customer"), partyQuery, (p) => p.name) : null;
				if (partyQuery && !customer) return fail(`No encuentro al cliente “${partyQuery}”.`);
				if (payment === "credito" && !customer) return fail("El crédito necesita un cliente: vender 2 miel a ana credito");
				const { books, sale } = postSale(b, {
					at: now.toISOString(),
					customerId: customer?.id ?? null,
					payment,
					lines: [{
						productId: product.id,
						qty
					}]
				});
				return done(books, `${sale.number} · ${qty} ${product.name} · ${sale.customerName} · ${moneyTail(sale.gross)} ${payment}.`);
			}
			const supplier = partyQuery ? best(b.parties.filter((p) => p.kind === "supplier"), partyQuery, (p) => p.name) : b.parties.find((p) => p.kind === "supplier");
			if (!supplier) return fail("Necesito un proveedor.");
			if (payment === "tarjeta" || payment === "transferencia") payment = "efectivo";
			const payPurchase = payment === "credito" ? "credito" : "efectivo";
			const { books, purchase } = postPurchase(b, {
				at: now.toISOString(),
				supplierId: supplier.id,
				payment: payPurchase,
				lines: [{
					productId: product.id,
					qty
				}]
			});
			return done(books, `${purchase.number} · ${qty} ${product.name} de ${supplier.name} · ${moneyTail(purchase.gross)}.`);
		}
	} catch (error) {
		if (error instanceof BookError) return fail(error.message);
		return fail("No pude registrar esa orden.");
	}
	return fail("No la reconocí. Prueba “vender 2 café de origen a ana efectivo”.");
}
function at(now, daysAgo, hour = 10, minute = 0) {
	const d = new Date(now);
	d.setDate(d.getDate() - daysAgo);
	d.setHours(hour, minute, 0, 0);
	return d.toISOString();
}
function rng(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function buildSeed(now = /* @__PURE__ */ new Date()) {
	let b = emptyBooks({
		name: "Mercado Andino S.A.S.",
		nit: "901.448.220-3",
		address: "Cra 13 # 63-42, Chapinero",
		city: "Bogotá",
		phone: "+57 601 555 0142",
		email: "hola@mercadoandino.co",
		currency: "COP",
		taxRate: .19,
		invoicePrefix: "FE",
		regime: "Responsable de IVA"
	}, at(now, 46, 8));
	b.categories = [
		["cat-aba", "Abarrotes"],
		["cat-caf", "Café"],
		["cat-lac", "Lácteos"],
		["cat-lim", "Limpieza"]
	].map(([id, name]) => ({
		id,
		name
	}));
	b.products = [
		[
			"p-cafe",
			"CAF-250",
			"Café de origen 250g",
			"cat-caf",
			28e3,
			14200,
			12
		],
		[
			"p-mol",
			"CAF-500",
			"Café molido 500g",
			"cat-caf",
			42e3,
			22100,
			8
		],
		[
			"p-pan",
			"PAN-500",
			"Panela orgánica 500g",
			"cat-aba",
			8500,
			4100,
			20
		],
		[
			"p-arr",
			"ARR-1K",
			"Arroz premium 1kg",
			"cat-aba",
			6200,
			3400,
			24
		],
		[
			"p-ace",
			"ACE-500",
			"Aceite de oliva 500ml",
			"cat-aba",
			36e3,
			21400,
			6
		],
		[
			"p-lec",
			"LEC-1L",
			"Leche entera 1L",
			"cat-lac",
			4800,
			3100,
			16
		],
		[
			"p-que",
			"QUE-250",
			"Queso campesino 250g",
			"cat-lac",
			12500,
			7900,
			8
		],
		[
			"p-jab",
			"JAB-LAV",
			"Jabón lavanda",
			"cat-lim",
			6900,
			3200,
			10
		],
		[
			"p-mie",
			"MIE-500",
			"Miel de abejas 500g",
			"cat-aba",
			24e3,
			12800,
			5
		],
		[
			"p-cho",
			"CHO-70",
			"Chocolate 70% 80g",
			"cat-caf",
			9800,
			4500,
			14
		],
		[
			"p-ave",
			"AVE-1K",
			"Avena en hojuelas 1kg",
			"cat-aba",
			8900,
			5100,
			10
		],
		[
			"p-det",
			"DET-1L",
			"Detergente cítrico 1L",
			"cat-lim",
			11200,
			6400,
			8
		]
	].map(([id, sku, name, categoryId, price, cost, minStock]) => ({
		id,
		sku,
		name,
		categoryId,
		price,
		cost,
		stock: 0,
		minStock,
		unit: "und",
		active: true
	}));
	b.parties = [
		{
			id: "cli-ana",
			kind: "customer",
			name: "Ana Ríos",
			document: "CC 52.441.908",
			email: "ana.rios@correo.co",
			phone: "310 555 0191",
			address: "Chapinero Alto",
			termsDays: 15
		},
		{
			id: "cli-lib",
			kind: "customer",
			name: "Café Librería Norte",
			document: "NIT 900.112.334",
			email: "compras@librerianorte.co",
			phone: "601 555 2210",
			address: "Calle 72 # 10-18",
			termsDays: 30
		},
		{
			id: "cli-hot",
			kind: "customer",
			name: "Hotel Casa Quebrada",
			document: "NIT 900.883.120",
			email: "contabilidad@casaquebrada.co",
			phone: "601 555 7781",
			address: "La Candelaria",
			termsDays: 8
		},
		{
			id: "cli-tie",
			kind: "customer",
			name: "Tienda La Esquina",
			document: "CC 79.220.114",
			email: "esquina@correo.co",
			phone: "320 555 0144",
			address: "Teusaquillo",
			termsDays: 0
		},
		{
			id: "cli-die",
			kind: "customer",
			name: "Diego Pulido",
			document: "CC 1.020.884.331",
			email: "diegop@correo.co",
			phone: "315 555 6620",
			address: "Usaquén",
			termsDays: 8
		},
		{
			id: "prv-caf",
			kind: "supplier",
			name: "Cooperativa Cafetera del Huila",
			document: "NIT 891.220.009",
			email: "pedidos@cafhuila.co",
			phone: "608 555 0100",
			address: "Pitalito, Huila",
			termsDays: 20
		},
		{
			id: "prv-ali",
			kind: "supplier",
			name: "Alimentos del Valle",
			document: "NIT 805.331.902",
			email: "ventas@alivalle.co",
			phone: "602 555 4411",
			address: "Cali",
			termsDays: 15
		},
		{
			id: "prv-hig",
			kind: "supplier",
			name: "Higiene Andina",
			document: "NIT 830.220.441",
			email: "hola@higieneandina.co",
			phone: "601 555 9090",
			address: "Bogotá",
			termsDays: 15
		}
	];
	b.seq = 40;
	const openingQty = {
		"p-cafe": 70,
		"p-mol": 36,
		"p-pan": 90,
		"p-arr": 140,
		"p-ace": 42,
		"p-lec": 70,
		"p-que": 48,
		"p-jab": 60,
		"p-mie": 22,
		"p-cho": 80,
		"p-ave": 40,
		"p-det": 34
	};
	b = setOpening(b, {
		at: at(now, 46, 8),
		cash: 124e5,
		bank: 325e4,
		lines: b.products.map((p) => ({
			productId: p.id,
			name: p.name,
			qty: openingQty[p.id] ?? 0,
			unitCost: p.cost
		}))
	});
	const rand = rng(20261022);
	const pick = (arr) => arr[Math.floor(rand() * arr.length)];
	const customers = [
		"cli-ana",
		"cli-lib",
		"cli-tie",
		"cli-die",
		null
	];
	const payCycle = [
		"efectivo",
		"efectivo",
		"transferencia",
		"efectivo",
		"tarjeta",
		"efectivo"
	];
	const trySale = (daysAgo, productId, qty, customerId, payment, hour) => {
		const product = b.products.find((p) => p.id === productId);
		if (!product || product.stock < qty) return;
		try {
			b = postSale(b, {
				at: at(now, daysAgo, hour, Math.floor(rand() * 50)),
				customerId,
				payment: payment === "credito" && !customerId ? "efectivo" : payment,
				lines: [{
					productId,
					qty
				}]
			}).books;
		} catch {}
	};
	for (let day = 40; day >= 1; day--) {
		if (day === 26) b = postPurchase(b, {
			at: at(now, day, 9),
			supplierId: "prv-caf",
			payment: "credito",
			lines: [{
				productId: "p-cafe",
				qty: 40
			}, {
				productId: "p-mol",
				qty: 18
			}]
		}).books;
		if (day === 20) b = postPurchase(b, {
			at: at(now, day, 9, 10),
			supplierId: "prv-ali",
			payment: "credito",
			lines: [{
				productId: "p-que",
				qty: 24
			}, {
				productId: "p-lec",
				qty: 36
			}]
		}).books;
		if (day === 18) b = postSale(b, {
			at: at(now, day, 11, 20),
			customerId: "cli-hot",
			payment: "credito",
			lines: [
				{
					productId: "p-ace",
					qty: 8
				},
				{
					productId: "p-cafe",
					qty: 10
				},
				{
					productId: "p-mie",
					qty: 6
				},
				{
					productId: "p-cho",
					qty: 12
				}
			]
		}).books;
		if (day === 15) b = postIncome(b, {
			at: at(now, day, 16),
			amount: 86e3,
			memo: "Rendimiento cuenta de ahorros",
			via: "banco"
		});
		if (day === 12) b = postPurchase(b, {
			at: at(now, day, 9, 30),
			supplierId: "prv-ali",
			payment: "efectivo",
			lines: [
				{
					productId: "p-arr",
					qty: 60
				},
				{
					productId: "p-pan",
					qty: 40
				},
				{
					productId: "p-ave",
					qty: 24
				},
				{
					productId: "p-ace",
					qty: 10
				}
			]
		}).books;
		if (day === 9) b = postSale(b, {
			at: at(now, day, 15),
			customerId: "cli-ana",
			payment: "credito",
			lines: [
				{
					productId: "p-cafe",
					qty: 4
				},
				{
					productId: "p-que",
					qty: 3
				},
				{
					productId: "p-mie",
					qty: 2
				}
			]
		}).books;
		if (day === 7) b = postPurchase(b, {
			at: at(now, day, 10),
			supplierId: "prv-hig",
			payment: "credito",
			lines: [{
				productId: "p-jab",
				qty: 24
			}, {
				productId: "p-det",
				qty: 16
			}]
		}).books;
		if (day === 5) {
			b = postCollection(b, {
				at: at(now, day, 17),
				customerId: "cli-ana",
				amount: 8e4,
				via: "banco"
			});
			b = postSale(b, {
				at: at(now, day, 12),
				customerId: "cli-lib",
				payment: "credito",
				lines: [
					{
						productId: "p-cho",
						qty: 20
					},
					{
						productId: "p-mol",
						qty: 6
					},
					{
						productId: "p-cafe",
						qty: 8
					}
				]
			}).books;
		}
		if (day === 3) b = postExpense(b, {
			at: at(now, day, 8),
			amount: 245e4,
			memo: "Arriendo del local",
			via: "banco"
		});
		if (day === 2) {
			b = postExpense(b, {
				at: at(now, day, 9),
				amount: 386e3,
				memo: "Energía y agua",
				via: "caja"
			});
			b = postSupplierPayment(b, {
				at: at(now, day, 11),
				supplierId: "prv-caf",
				amount: 9e5,
				via: "banco"
			});
		}
		const salesToday = 2 + Math.floor(rand() * 3);
		for (let i = 0; i < salesToday; i++) {
			const weighted = rand() < .12 ? "p-ace" : rand() < .22 ? "p-que" : pick(b.products).id;
			const qty = weighted === "p-ace" || weighted === "p-mie" ? 1 : 1 + Math.floor(rand() * 3);
			const customerId = rand() < .55 ? null : pick([...customers]);
			trySale(day, weighted, qty, customerId, pick(payCycle), 9 + i * 2);
		}
	}
	b = postQuote(b, {
		at: at(now, 1, 16),
		validDays: 12,
		customerId: "cli-lib",
		lines: [{
			productId: "p-mol",
			qty: 12
		}, {
			productId: "p-cho",
			qty: 24
		}]
	}).books;
	const gap = imbalance(b);
	if (Math.abs(gap) > 1) throw new Error(`Libros de demostración descuadrados (${gap})`);
	return b;
}
var BLANK = {
	name: "",
	nit: "",
	address: "",
	city: "",
	phone: "",
	email: "",
	currency: "COP",
	taxRate: .19,
	invoicePrefix: "FE",
	regime: "Responsable de IVA"
};
function freshBooks() {
	return emptyBooks(BLANK, (/* @__PURE__ */ new Date()).toISOString());
}
function guard(run) {
	try {
		useBooks.setState({ books: run() });
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof BookError ? error.message : "No se pudo guardar"
		};
	}
}
var useBooks = create()(persist((set, get) => ({
	books: freshBooks(),
	workspace: "setup",
	ready: false,
	ownerId: null,
	cloud: "local",
	setReady: (ready) => set({ ready }),
	setCloud: (cloud) => set({ cloud }),
	claim: (ownerId) => set({ ownerId }),
	applyRemote: (books, workspace, ownerId) => set({
		books,
		workspace,
		ownerId
	}),
	openLive: (company, opening) => {
		const name = company.name.trim();
		if (name.length < 2) return {
			ok: false,
			error: "Escribe la razón social"
		};
		const rate = Number(company.taxRate);
		if (!Number.isFinite(rate) || rate < 0 || rate > .4) return {
			ok: false,
			error: "Impuesto inválido"
		};
		if (opening.cash < 0 || opening.bank < 0 || !Number.isFinite(opening.cash) || !Number.isFinite(opening.bank)) return {
			ok: false,
			error: "Los saldos de arranque no pueden ser negativos"
		};
		const at = (/* @__PURE__ */ new Date()).toISOString();
		let books = emptyBooks({
			name,
			nit: company.nit.trim(),
			city: company.city.trim(),
			address: company.address.trim(),
			phone: company.phone.trim(),
			email: company.email.trim(),
			currency: company.currency || "COP",
			taxRate: rate,
			regime: company.regime.trim() || "Responsable de IVA",
			invoicePrefix: (company.invoicePrefix || "FE").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "FE"
		}, at);
		if (opening.cash > 0 || opening.bank > 0) books = setOpening(books, {
			at,
			cash: Math.round(opening.cash),
			bank: Math.round(opening.bank),
			lines: []
		});
		set({
			books,
			workspace: "live"
		});
		return { ok: true };
	},
	loadSample: () => set({
		books: buildSeed(/* @__PURE__ */ new Date()),
		workspace: "sample"
	}),
	beginSetup: () => set({
		books: freshBooks(),
		workspace: "setup"
	}),
	command: (text) => {
		const res = runCommand(get().books, text, /* @__PURE__ */ new Date());
		if (res.books) set({ books: res.books });
		return {
			ok: res.ok,
			message: res.message
		};
	},
	sell: (input) => {
		try {
			const { books, sale } = postSale(get().books, {
				...input,
				at: (/* @__PURE__ */ new Date()).toISOString()
			});
			set({ books });
			return {
				ok: true,
				number: sale.number
			};
		} catch (error) {
			return {
				ok: false,
				error: error instanceof BookError ? error.message : "No se pudo vender"
			};
		}
	},
	buy: (input) => {
		try {
			const { books, purchase } = postPurchase(get().books, {
				...input,
				at: (/* @__PURE__ */ new Date()).toISOString()
			});
			set({ books });
			return {
				ok: true,
				number: purchase.number
			};
		} catch (error) {
			return {
				ok: false,
				error: error instanceof BookError ? error.message : "No se pudo comprar"
			};
		}
	},
	quote: (input) => {
		try {
			const { books, quote } = postQuote(get().books, {
				...input,
				at: (/* @__PURE__ */ new Date()).toISOString()
			});
			set({ books });
			return {
				ok: true,
				number: quote.number
			};
		} catch (error) {
			return {
				ok: false,
				error: error instanceof BookError ? error.message : "No se pudo cotizar"
			};
		}
	},
	voidSale: (id) => {
		const r = guard(() => voidSale(get().books, id));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	voidPurchase: (id) => {
		const r = guard(() => voidPurchase(get().books, id));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	ret: (saleId, lines) => {
		try {
			const { books } = postReturn(get().books, {
				at: (/* @__PURE__ */ new Date()).toISOString(),
				saleId,
				lines
			});
			set({ books });
			return { ok: true };
		} catch (error) {
			return {
				ok: false,
				error: error instanceof BookError ? error.message : "No se pudo devolver"
			};
		}
	},
	collect: (customerId, amount, via) => {
		const r = guard(() => postCollection(get().books, {
			at: (/* @__PURE__ */ new Date()).toISOString(),
			customerId,
			amount,
			via
		}));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	paySupplier: (supplierId, amount, via) => {
		const r = guard(() => postSupplierPayment(get().books, {
			at: (/* @__PURE__ */ new Date()).toISOString(),
			supplierId,
			amount,
			via
		}));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	expense: (amount, memo, via) => {
		const r = guard(() => postExpense(get().books, {
			at: (/* @__PURE__ */ new Date()).toISOString(),
			amount,
			memo,
			via
		}));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	adjust: (productId, qtyDelta, memo) => {
		const r = guard(() => postAdjust(get().books, {
			at: (/* @__PURE__ */ new Date()).toISOString(),
			productId,
			qtyDelta,
			memo
		}));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	saveProduct: (input) => {
		const r = guard(() => saveProduct(get().books, input));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	saveParty: (input) => {
		const r = guard(() => saveParty(get().books, input));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	saveCategory: (name) => {
		const r = guard(() => saveCategory(get().books, name));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	patchCompany: (patch) => {
		const r = guard(() => updateCompany(get().books, patch));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	acceptQuote: (id, payment) => {
		const r = guard(() => acceptQuote(get().books, id, payment, (/* @__PURE__ */ new Date()).toISOString()));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	rejectQuote: (id) => {
		const r = guard(() => setQuoteStatus(get().books, id, "rechazada"));
		return r.ok ? { ok: true } : {
			ok: false,
			error: r.error
		};
	},
	replaceBooks: (books) => set({
		books,
		workspace: "live"
	})
}), {
	name: "contable-pro-libros-v3",
	skipHydration: true,
	partialize: (state) => ({
		books: state.books,
		workspace: state.workspace,
		ownerId: state.ownerId
	})
}));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function useMoney() {
	const currency = useBooks((s) => s.books.company.currency);
	return (value) => formatMoney(value, currency);
}
var buttonStyles = {
	primary: "bg-copper text-on-copper hover:bg-copper-deep",
	ink: "bg-ink text-card hover:opacity-90",
	ghost: "border border-line bg-card text-ink hover:bg-sand",
	danger: "bg-wine-soft text-wine hover:bg-wine hover:text-on-copper",
	quiet: "text-ink-soft hover:bg-sand"
};
function Button({ variant = "primary", className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40", buttonStyles[variant], className),
		...props
	});
}
function Field({ label, className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1.5 block text-xs font-medium text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: cn("h-11 w-full rounded-xl border border-line bg-card px-3 text-base text-ink outline-none focus:border-copper", className),
			...props
		})]
	});
}
function Select({ label, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1.5 block text-xs font-medium text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
			className: "h-11 w-full rounded-xl border border-line bg-card px-3 text-base text-ink outline-none focus:border-copper",
			...props,
			children
		})]
	});
}
function Modal({ open, title, onClose, children, wide }) {
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "no-print fixed inset-0 z-50 flex items-end justify-center bg-ink/45 sm:items-center sm:p-6",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			className: cn("max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-lg"),
			onClick: (event) => event.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl text-ink",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "grid size-11 place-items-center rounded-full text-ink hover:bg-sand",
					"aria-label": "Cerrar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}), children]
		})
	});
}
function Pill({ children, tone = "sand" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", {
			sand: "bg-sand text-ink-soft",
			forest: "bg-forest-soft text-forest",
			wine: "bg-wine-soft text-wine",
			copper: "bg-sand text-copper-deep"
		}[tone]),
		children
	});
}
function Empty({ title, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-dashed border-line px-4 py-10 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xl text-ink",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mx-auto mt-1 max-w-sm text-sm text-pretty text-muted",
			children: text
		})]
	});
}
function Acceso() {
	const [mode, setMode] = (0, import_react.useState)("entrar");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	async function submit(event) {
		event.preventDefault();
		setError("");
		setPending(true);
		try {
			const result = mode === "crear" ? await authClient.signUp.email({
				email,
				password,
				name: name.trim() || email,
				callbackURL: "/"
			}) : await authClient.signIn.email({
				email,
				password,
				callbackURL: "/"
			});
			if (result.error) setError(result.error.message || "No se pudo entrar");
		} catch {
			setError("No se pudo entrar");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper px-6 py-10 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-12 place-items-center rounded-xl bg-ink font-display text-xl text-card",
					children: "Cp"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
					children: "Contable Pro"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 text-4xl",
					children: mode === "crear" ? "Crea tu cuenta" : "Entra a tus libros"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: "La empresa queda en tu cuenta. El mismo negocio abre en el teléfono y en el computador."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "mt-6 space-y-3",
					children: [
						mode === "crear" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Tu nombre",
							value: name,
							onChange: (e) => setName(e.target.value),
							required: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Correo",
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							required: true,
							autoComplete: "email"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Clave",
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							required: true,
							minLength: 8,
							autoComplete: mode === "crear" ? "new-password" : "current-password"
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-wine",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: pending,
							children: pending ? "Entrando…" : mode === "crear" ? "Crear cuenta" : "Entrar"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 min-h-11 w-full text-sm font-medium text-copper-deep",
					onClick: () => {
						setMode(mode === "crear" ? "entrar" : "crear");
						setError("");
					},
					children: mode === "crear" ? "Ya tengo cuenta" : "Crear una cuenta nueva"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-2",
					children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
						className: "flex min-h-12 w-full items-center justify-center rounded-xl border border-line bg-card px-4 text-sm font-medium text-ink",
						children: ["Continuar con ", provider.label]
					}, provider.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-xs leading-relaxed text-muted",
					children: "Desarrollado por Richard J. Lobo S."
				})
			]
		})
	});
}
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
//#endregion
export { simulate as A, healthReport as C, productIntel as D, openSale as E, useCurrentUser as F, useCurrentUserState as I, useMoney as L, taxFromGross as M, taxOnNet as N, rangeFrom as O, useBooks as P, formatWhen as S, kardexOf as T, cn as _, Empty as a, fold as b, PAYMENT_LABEL as c, TAX_PRESETS as d, agingPayable as f, cashFlow as g, buildJournal as h, CURRENCIES as i, statement as j, representationCode as k, Pill as l, balanceSheet as m, Acceso as n, Field as o, agingReceivable as p, Button as r, Modal as s, ACCOUNTS as t, Select as u, compactMoney as v, imbalance as w, formatDay as x, dailySeries as y };
