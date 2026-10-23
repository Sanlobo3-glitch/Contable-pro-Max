import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Sparkles, c as Plus, d as LayoutDashboard, f as Building2, i as Trash2, l as Package, n as Wallet, o as ShoppingBag, p as BookOpen, s as Receipt, t as X, u as Minus } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BihIox6k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	books: buildSeed(/* @__PURE__ */ new Date()),
	ready: false,
	setReady: (ready) => set({ ready }),
	reset: () => set({ books: buildSeed(/* @__PURE__ */ new Date()) }),
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
	replaceBooks: (books) => set({ books })
}), {
	name: "contable-pro-libros-v2",
	skipHydration: true,
	partialize: (state) => ({ books: state.books })
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
var BUCKETS = [
	{
		id: "al_dia",
		label: "Al día"
	},
	{
		id: "d1_30",
		label: "1–30"
	},
	{
		id: "d31_60",
		label: "31–60"
	},
	{
		id: "d61_90",
		label: "61–90"
	},
	{
		id: "d90",
		label: "+90"
	}
];
function Cobranza({ notify }) {
	const books = useBooks((s) => s.books);
	const collect = useBooks((s) => s.collect);
	const pay = useBooks((s) => s.paySupplier);
	const saveParty = useBooks((s) => s.saveParty);
	const [tab, setTab] = (0, import_react.useState)("cobrar");
	const money = useMoney();
	const now = /* @__PURE__ */ new Date();
	const rows = tab === "pagar" ? agingPayable(books, now) : agingReceivable(books, now);
	const total = rows.reduce((s, r) => s + r.open, 0);
	const max = Math.max(1, ...BUCKETS.map((b) => rows.filter((r) => r.bucket === b.id).reduce((s, r) => s + r.open, 0)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
			children: "Cartera"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 text-4xl",
			children: "Cobranza"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 max-w-xl text-sm text-muted",
			children: "Una venta a crédito no es caja. Aquí se ve quién debe, desde cuándo, y se registra el abono contra el saldo real."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-2",
			children: [
				["cobrar", "Por cobrar"],
				["pagar", "Por pagar"],
				["directorio", "Directorio"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(id),
				className: `min-h-10 rounded-full px-4 text-sm ${tab === id ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
				children: label
			}, id))
		}),
		tab !== "directorio" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-display text-3xl tabular",
				children: money(total)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-5 gap-2",
				children: BUCKETS.map((bucket) => {
					const amount = rows.filter((r) => r.bucket === bucket.id).reduce((s, r) => s + r.open, 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-24 items-end rounded-xl bg-sand",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full rounded-xl bg-copper",
								style: { height: `${Math.max(6, amount / max * 100)}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-muted",
							children: bucket.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tabular",
							children: money(amount)
						})
					] }, bucket.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-4 divide-y divide-line rounded-3xl border border-line bg-card px-4",
				children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-8 text-center text-sm text-muted",
					children: "No hay saldos abiertos."
				}), rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center justify-between gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: row.party
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							row.number,
							" · vence ",
							formatDay(row.dueAt)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "tabular font-medium",
								children: money(row.open)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: row.daysLate > 0 ? "wine" : "forest",
								children: row.daysLate > 0 ? `${row.daysLate} días tarde` : "Al día"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								const res = tab === "pagar" ? pay(row.partyId, row.open, "banco") : collect(row.partyId, row.open, "caja");
								notify(res.ok ? "Saldo aplicado" : res.error || "No se pudo");
							},
							children: tab === "pagar" ? "Pagar" : "Cobrar"
						})]
					})]
				}, row.id))]
			})
		] }),
		tab === "directorio" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Directorio, { onCreate: (input) => {
			const res = saveParty(input);
			notify(res.ok ? "Contacto guardado" : res.error || "No se pudo");
			return res.ok;
		} })
	] });
}
function Directorio({ onCreate }) {
	const parties = useBooks((s) => s.books.parties);
	const [kind, setKind] = (0, import_react.useState)("customer");
	const [name, setName] = (0, import_react.useState)("");
	const [document, setDocument] = (0, import_react.useState)("");
	const [terms, setTerms] = (0, import_react.useState)("15");
	const list = parties.filter((p) => p.kind === kind);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 grid gap-4 lg:grid-cols-[280px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3 rounded-3xl border border-line bg-card p-4",
			onSubmit: (event) => {
				event.preventDefault();
				if (onCreate({
					kind,
					name,
					document,
					email: "",
					phone: "",
					address: "",
					termsDays: Number(terms) || 0
				})) {
					setName("");
					setDocument("");
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					label: "Tipo",
					value: kind,
					onChange: (e) => setKind(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "customer",
						children: "Cliente"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "supplier",
						children: "Proveedor"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nombre",
					value: name,
					onChange: (e) => setName(e.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Documento",
					value: document,
					onChange: (e) => setDocument(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Plazo en días",
					value: terms,
					onChange: (e) => setTerms(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					children: "Guardar"
				})
			]
		}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
			title: "Sin contactos",
			text: "Agrega el primero para venderle a crédito."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-line rounded-3xl border border-line bg-card px-4",
			children: list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: p.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						p.document || "Sin documento",
						" · plazo ",
						p.termsDays,
						" días"
					]
				})]
			}, p.id))
		})]
	});
}
var EXAMPLES = [
	"vender 2 café de origen a ana efectivo",
	"vender 1 miel tarjeta",
	"compra 12 panela a alimentos credito",
	"gasto 180000 domicilio del día",
	"cobrar 50000 a ana ríos"
];
function Copiloto({ onJump }) {
	const books = useBooks((s) => s.books);
	const command = useBooks((s) => s.command);
	const money = useMoney();
	const [text, setText] = (0, import_react.useState)("");
	const [log, setLog] = (0, import_react.useState)([]);
	const [price, setPrice] = (0, import_react.useState)(8);
	const [volume, setVolume] = (0, import_react.useState)(-3);
	const now = /* @__PURE__ */ new Date();
	const health = healthReport(books, now);
	const sim = simulate(books, now, price, volume);
	function run(value) {
		const clean = value.trim();
		if (!clean) return;
		const res = command(clean);
		setLog((prev) => [{
			ok: res.ok,
			text: clean,
			reply: res.message
		}, ...prev].slice(0, 8));
		if (res.ok) setText("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 xl:grid-cols-[1fr_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
				children: "En este dispositivo"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-4xl",
				children: "Copiloto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm text-pretty text-muted",
				children: "No inventa cifras. Lee los libros y ejecuta órdenes en español: venta, compra, gasto o abono. Si no entiende, no toca nada."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4",
				onSubmit: (event) => {
					event.preventDefault();
					run(text);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: text,
					onChange: (event) => setText(event.target.value),
					rows: 3,
					placeholder: "vender 2 café de origen a ana efectivo",
					className: "w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-copper"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "mt-2 min-h-11 rounded-xl bg-copper px-4 text-sm font-medium text-on-copper",
					children: "Ejecutar"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: EXAMPLES.map((example) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => run(example),
					className: "min-h-10 rounded-full bg-sand px-3 text-left text-xs text-ink-soft",
					children: example
				}, example))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: log.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-line bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: item.text
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-1 text-sm ${item.ok ? "text-ink" : "text-wine"}`,
						children: item.reply
					})]
				}, `${item.text}-${index}`))
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Lectura de hoy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-3",
						children: health.insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: insight.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: insight.detail
						})] }, insight.title))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onJump("cobranza"),
						className: "mt-3 text-sm font-medium text-copper-deep",
						children: "Ir a cobranza"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Simulador de precio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Qué pasa con el margen de los últimos 30 días si cambias precio y volumen. No altera los libros."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-4 block text-sm",
						children: [
							"Precio ",
							price > 0 ? "+" : "",
							price,
							"%",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -20,
								max: 30,
								value: price,
								onChange: (e) => setPrice(Number(e.target.value)),
								className: "mt-2 w-full accent-copper"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block text-sm",
						children: [
							"Volumen ",
							volume > 0 ? "+" : "",
							volume,
							"%",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -30,
								max: 30,
								value: volume,
								onChange: (e) => setVolume(Number(e.target.value)),
								className: "mt-2 w-full accent-copper"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Venta neta actual" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "tabular",
									children: money(sim.base.ventas)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Venta neta simulada" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "tabular",
									children: money(sim.projectedNet)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Margen actual" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "tabular",
									children: [Math.round(sim.base.margen * 100), "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Margen simulado" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "tabular",
									children: [Math.round(sim.projectedMargin * 100), "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `flex justify-between ${sim.delta >= 0 ? "text-forest" : "text-wine"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Utilidad bruta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "tabular",
									children: [sim.delta >= 0 ? "+" : "", money(sim.delta)]
								})]
							})
						]
					})
				]
			})]
		})]
	});
}
function Empresa({ notify }) {
	const books = useBooks((s) => s.books);
	const patch = useBooks((s) => s.patchCompany);
	const reset = useBooks((s) => s.reset);
	const replace = useBooks((s) => s.replaceBooks);
	const [form, setForm] = (0, import_react.useState)(books.company);
	const gap = imbalance(books);
	function save(event) {
		event.preventDefault();
		const res = patch({
			...form,
			taxRate: Number(form.taxRate)
		});
		notify(res.ok ? "Empresa actualizada. Los documentos viejos conservan su impuesto." : res.error || "No se pudo");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-[1.1fr_0.9fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			className: "space-y-3 rounded-3xl border border-line bg-card p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
					children: "Razón social"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl",
					children: "Empresa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nombre",
					value: form.name,
					onChange: (e) => setForm({
						...form,
						name: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "NIT o documento",
					value: form.nit,
					onChange: (e) => setForm({
						...form,
						nit: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Dirección",
					value: form.address,
					onChange: (e) => setForm({
						...form,
						address: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ciudad",
						value: form.city,
						onChange: (e) => setForm({
							...form,
							city: e.target.value
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Teléfono",
						value: form.phone,
						onChange: (e) => setForm({
							...form,
							phone: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Correo",
					value: form.email,
					onChange: (e) => setForm({
						...form,
						email: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1.5 block text-xs font-medium text-muted",
						children: "Moneda de los libros"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: form.currency,
						onChange: (e) => setForm({
							...form,
							currency: e.target.value
						}),
						className: "h-11 w-full rounded-xl border border-line bg-card px-3 text-base",
						children: CURRENCIES.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: code }, code))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Cambiar la moneda solo cambia el formato. Los montos no se convierten."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mb-1.5 block text-xs font-medium text-muted",
						children: [
							"Impuesto de las próximas operaciones (",
							Math.round(Number(form.taxRate) * 100),
							"%)"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: .27,
						step: .01,
						value: form.taxRate,
						onChange: (e) => setForm({
							...form,
							taxRate: Number(e.target.value)
						}),
						className: "w-full accent-copper"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: TAX_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setForm({
							...form,
							taxRate: preset.rate,
							regime: preset.regime
						}),
						className: "min-h-10 rounded-full bg-sand px-3 text-xs text-ink-soft",
						children: preset.label
					}, preset.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Régimen",
					value: form.regime,
					onChange: (e) => setForm({
						...form,
						regime: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Prefijo de comprobante",
					value: form.invoicePrefix,
					onChange: (e) => setForm({
						...form,
						invoicePrefix: e.target.value.toUpperCase()
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Guardar empresa"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl bg-ink p-5 text-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl text-card",
					children: "Por qué esto compite"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-3 text-sm text-sand",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Partida doble automática. Una tienda no debería aprender débitos para tener un balance que cuadra." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Cartera con edad, no una lista de ventas. El crédito deja de disfrazarse de caja." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Reposición por ritmo de venta y clase ABC por margen, como un inventario de verdad." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Copiloto local en español. La orden se ejecuta o se rechaza; no hay cifras inventadas." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Impuesto por país y moneda latinoamericana, sin prometer factura DIAN que no existe." })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Tus datos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: ["Viven en este navegador. ", Math.abs(gap) < 1 ? "Los libros están cuadrados." : `Hay un descuadre de ${gap}.`]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => {
									const blob = new Blob([JSON.stringify(books, null, 2)], { type: "application/json" });
									const url = URL.createObjectURL(blob);
									const a = document.createElement("a");
									a.href = url;
									a.download = "contable-pro-libros.json";
									a.click();
									URL.revokeObjectURL(url);
								},
								children: "Exportar JSON"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-card px-4 text-sm font-medium",
								children: ["Importar", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "application/json",
									className: "sr-only",
									onChange: async (event) => {
										const file = event.target.files?.[0];
										if (!file) return;
										try {
											const data = JSON.parse(await file.text());
											if (data.version !== 1 || !data.company || !Array.isArray(data.sales)) throw new Error("formato");
											replace(data);
											notify("Libros importados");
										} catch {
											notify("Ese archivo no es un libro de Contable Pro");
										}
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								onClick: () => {
									if (window.confirm("¿Volver a los datos de demostración? Se pierde lo que registraste aquí.")) reset();
								},
								children: "Restaurar demo"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-xs leading-relaxed text-muted",
						children: "Contable Pro · desarrollado por Richard J. Lobo S. La representación gráfica no sustituye la factura electrónica de la DIAN ni de otra autoridad fiscal."
					})
				]
			})]
		})]
	});
}
function Inventario({ notify }) {
	const books = useBooks((s) => s.books);
	const save = useBooks((s) => s.saveProduct);
	const saveCategory = useBooks((s) => s.saveCategory);
	const adjust = useBooks((s) => s.adjust);
	const buy = useBooks((s) => s.buy);
	const money = useMoney();
	const intel = (0, import_react.useMemo)(() => productIntel(books), [books]);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [focus, setFocus] = (0, import_react.useState)(null);
	const [cat, setCat] = (0, import_react.useState)("");
	const [supplierId, setSupplierId] = (0, import_react.useState)(books.parties.find((p) => p.kind === "supplier")?.id ?? "");
	const [buyQty, setBuyQty] = (0, import_react.useState)("12");
	const suppliers = books.parties.filter((p) => p.kind === "supplier");
	const focused = intel.find((i) => i.product.id === focus);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
					children: "Existencias"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-4xl",
					children: "Inventario"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Clase ABC por margen de 30 días. La reposición usa el ritmo real, no una corazonada."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => setEditing({
					unit: "und",
					minStock: 5,
					price: 0,
					cost: 0,
					categoryId: books.categories[0]?.id
				}),
				children: "Nuevo producto"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: cat,
				onChange: (e) => setCat(e.target.value),
				placeholder: "Nueva categoría",
				className: "h-11 flex-1 rounded-xl border border-line bg-card px-3 text-base"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => {
					const res = saveCategory(cat);
					notify(res.ok ? "Categoría creada" : res.error || "No se pudo");
					if (res.ok) setCat("");
				},
				children: "Añadir"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 overflow-x-auto rounded-3xl border border-line bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[720px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-left text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"Producto",
						"Stock",
						"Precio",
						"Margen 30d",
						"Cobertura",
						"ABC",
						""
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: intel.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "text-left",
								onClick: () => setFocus(row.product.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: row.product.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs text-muted",
									children: row.product.sku
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 tabular",
							children: [
								row.product.stock,
								" ",
								row.product.unit
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 tabular",
							children: money(row.product.price)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 tabular",
							children: money(row.margin)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4",
							children: row.coverDays == null ? "Sin ritmo" : `${Math.round(row.coverDays)} días`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: row.abc === "A" ? "forest" : row.abc === "B" ? "copper" : "sand",
								children: row.abc
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-sm font-medium text-copper-deep",
								onClick: () => setEditing(row.product),
								children: "Editar"
							})
						})
					]
				}, row.product.id)) })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: !!editing,
			title: editing?.id ? "Editar producto" : "Nuevo producto",
			onClose: () => setEditing(null),
			children: editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					const res = save({
						id: editing.id,
						sku: editing.sku || "",
						name: editing.name || "",
						categoryId: editing.categoryId || books.categories[0]?.id || "",
						price: Number(editing.price) || 0,
						cost: Number(editing.cost) || 0,
						minStock: Number(editing.minStock) || 0,
						unit: editing.unit || "und"
					});
					notify(res.ok ? "Producto guardado. El stock entra por compras o ajustes." : res.error || "No se pudo");
					if (res.ok) setEditing(null);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nombre",
						value: editing.name || "",
						onChange: (e) => setEditing({
							...editing,
							name: e.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "SKU",
						value: editing.sku || "",
						onChange: (e) => setEditing({
							...editing,
							sku: e.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						label: "Categoría",
						value: editing.categoryId || "",
						onChange: (e) => setEditing({
							...editing,
							categoryId: e.target.value
						}),
						children: books.categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Precio con impuesto",
								inputMode: "numeric",
								value: editing.price ?? "",
								onChange: (e) => setEditing({
									...editing,
									price: Number(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Costo sin impuesto",
								inputMode: "numeric",
								value: editing.cost ?? "",
								onChange: (e) => setEditing({
									...editing,
									cost: Number(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Mínimo",
								inputMode: "numeric",
								value: editing.minStock ?? "",
								onChange: (e) => setEditing({
									...editing,
									minStock: Number(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Unidad",
								value: editing.unit || "und",
								onChange: (e) => setEditing({
									...editing,
									unit: e.target.value
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						children: "Guardar"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: !!focused,
			title: focused?.product.name || "Producto",
			onClose: () => setFocus(null),
			wide: true,
			children: focused && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Stock ",
							focused.product.stock,
							". Ritmo ",
							focused.velocity.toFixed(2),
							" al día.",
							focused.reorder > 0 ? ` Conviene comprar ${focused.reorder}.` : " No hace falta reponer."
						]
					}),
					focused.reorder > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-[1fr_100px_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Proveedor",
								value: supplierId,
								onChange: (e) => setSupplierId(e.target.value),
								children: suppliers.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.name
								}, s.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Cantidad",
								value: buyQty,
								onChange: (e) => setBuyQty(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:pt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => {
										const res = buy({
											supplierId,
											payment: "credito",
											lines: [{
												productId: focused.product.id,
												qty: Number(buyQty) || focused.reorder
											}]
										});
										notify(res.ok ? `${res.number} a crédito` : res.error);
										if (res.ok) setFocus(null);
									},
									children: "Comprar"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-wrap items-end gap-2",
						onSubmit: (event) => {
							event.preventDefault();
							const data = new FormData(event.currentTarget);
							const res = adjust(focused.product.id, Number(data.get("delta")), String(data.get("memo") || ""));
							notify(res.ok ? "Ajuste en el diario" : res.error || "No se pudo");
							if (res.ok) setFocus(null);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								name: "delta",
								label: "Ajuste (+ entra, − sale)",
								defaultValue: "-1",
								className: "w-36"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								name: "memo",
								label: "Motivo",
								defaultValue: "Conteo físico",
								className: "min-w-40 flex-1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "ghost",
								children: "Ajustar"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xl",
						children: "Kardex"
					}), kardexOf(books, focused.product.id).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						title: "Sin movimientos",
						text: "Este producto todavía no entra al kardex."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 divide-y divide-line text-sm",
						children: kardexOf(books, focused.product.id).slice(-12).map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								row.label,
								" · ",
								row.ref,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs text-muted",
									children: formatWhen(row.at)
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular",
								children: [
									row.qty > 0 ? "+" : "",
									row.qty,
									" → ",
									row.balance
								]
							})]
						}, `${row.ref}-${index}`))
					})] })
				]
			})
		})
	] });
}
function Libros() {
	const books = useBooks((s) => s.books);
	const money = useMoney();
	const [period, setPeriod] = (0, import_react.useState)("30d");
	const [tab, setTab] = (0, import_react.useState)("diario");
	const range = rangeFrom(/* @__PURE__ */ new Date(), period);
	const journal = buildJournal(books).filter((e) => {
		const t = new Date(e.at).getTime();
		if (range.from && t < new Date(range.from).getTime()) return false;
		if (range.to && t >= new Date(range.to).getTime()) return false;
		return true;
	});
	const pnl = statement(books, range.from, range.to);
	const sheet = balanceSheet(books, range.to);
	const flow = cashFlow(books, range.from, range.to);
	const gap = sheet.assetTotal - sheet.liabilityTotal - sheet.equityTotal;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
					children: "Contabilidad"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-4xl",
					children: "Libros"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "El diario no se digita: nace de ventas, compras, abonos y gastos. El balance tiene que cuadrar solo."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => window.print(),
				className: "no-print min-h-11 rounded-xl border border-line bg-card px-4 text-sm font-medium",
				children: "Imprimir"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "no-print mt-4 flex gap-2 overflow-x-auto",
			children: [
				["7d", "7 días"],
				["30d", "30 días"],
				["mes", "Este mes"],
				["anio", "Año"],
				["todo", "Todo"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setPeriod(id),
				className: `min-h-10 shrink-0 rounded-full px-4 text-sm ${period === id ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "no-print mt-3 flex gap-2 overflow-x-auto",
			children: [
				["diario", "Diario"],
				["resultados", "Resultados"],
				["balance", "Balance"],
				["flujo", "Flujo de caja"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(id),
				className: `min-h-10 shrink-0 rounded-full px-4 text-sm ${tab === id ? "bg-copper text-on-copper" : "bg-card text-ink-soft border border-line"}`,
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "mt-4 rounded-3xl border border-line bg-card p-4 md:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: books.company.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							"NIT ",
							books.company.nit,
							" · ",
							books.company.city
						]
					})]
				}),
				tab === "diario" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-4",
					children: [journal.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "Sin asientos en este periodo."
					}), journal.slice().reverse().slice(0, 60).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								entry.ref,
								" · ",
								entry.memo
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: formatWhen(entry.at)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
						className: "mt-1 w-full text-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: entry.lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-0.5 text-ink-soft",
								children: ACCOUNTS[line.account]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "w-28 text-right tabular",
								children: line.debit ? money(line.debit) : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "w-28 text-right tabular",
								children: line.credit ? money(line.credit) : ""
							})
						] }, `${entry.id}-${index}`)) })
					})] }, entry.id))]
				}),
				tab === "resultados" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mx-auto max-w-md space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Ingresos por ventas",
							v: money(pnl.ventas)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Costo de ventas",
							v: money(-pnl.costo)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Utilidad bruta",
							v: money(pnl.bruto),
							strong: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Otros ingresos",
							v: money(pnl.otros)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Gastos operativos",
							v: money(-pnl.gastos)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Resultado",
							v: money(pnl.resultado),
							strong: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "pt-2 text-xs text-muted",
							children: [
								"Margen bruto ",
								Math.round(pnl.margen * 100),
								"%. El impuesto no es gasto: vive en el balance."
							]
						})
					]
				}),
				tab === "balance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, {
						title: "Activo",
						rows: sheet.assets.map((a) => [a.label, money(a.amount)]),
						total: money(sheet.assetTotal)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, {
							title: "Pasivo",
							rows: sheet.liabilities.map((a) => [a.label, money(a.amount)]),
							total: money(sheet.liabilityTotal)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, {
								title: "Patrimonio",
								rows: sheet.equity.map((a) => [a.label, money(a.amount)]),
								total: money(sheet.equityTotal)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-3 text-xs ${Math.abs(gap) > 1 ? "text-wine" : "text-forest"}`,
							children: Math.abs(gap) > 1 ? `Descuadre ${money(gap)}` : "Activo = pasivo + patrimonio"
						})
					] })]
				}),
				tab === "flujo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mx-auto max-w-md space-y-2 text-sm",
					children: [
						flow.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: row.label,
							v: money(row.amount)
						}, row.label)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Variación de caja y bancos",
							v: money(flow.net),
							strong: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pt-2 text-xs text-muted",
							children: "Método directo, solo efectivo. La venta a crédito aparece cuando se cobra, no cuando se factura."
						})
					]
				})
			]
		})
	] });
}
function Line({ k, v, strong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex justify-between gap-4 border-t border-line py-2 ${strong ? "font-medium" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "tabular",
			children: v
		})]
	});
}
function Column({ title, rows, total }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "text-2xl",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "mt-2 text-sm",
		children: [rows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex justify-between border-t border-line py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular",
				children: v
			})]
		}, k)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex justify-between border-t border-line py-2 font-medium",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular",
				children: total
			})]
		})]
	})] });
}
function Operaciones({ notify }) {
	const books = useBooks((s) => s.books);
	const [tab, setTab] = (0, import_react.useState)("ventas");
	const [sale, setSale] = (0, import_react.useState)(null);
	const [buying, setBuying] = (0, import_react.useState)(false);
	const [quoting, setQuoting] = (0, import_react.useState)(false);
	const money = useMoney();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
			children: "Documentos"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl",
				children: "Operaciones"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [tab === "compras" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setBuying(true),
					children: "Nueva compra"
				}), tab === "cotizaciones" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setQuoting(true),
					children: "Nueva cotización"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-2 overflow-x-auto",
			children: [
				["ventas", "Ventas"],
				["compras", "Compras"],
				["cotizaciones", "Cotizaciones"],
				["gastos", "Gastos"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(id),
				className: `min-h-10 shrink-0 rounded-full px-4 text-sm ${tab === id ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [
				tab === "ventas" && (books.sales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "Sin ventas",
					text: "La primera venta puede salir de la caja rápida o de una orden en la barra."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-line rounded-3xl border border-line bg-card px-4",
					children: books.sales.slice(0, 40).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSale(item),
						className: "flex w-full items-center justify-between gap-3 py-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-medium",
								children: [
									item.number,
									" · ",
									item.customerName
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									formatWhen(item.at),
									" · ",
									PAYMENT_LABEL[item.payment]
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "tabular font-medium",
								children: money(item.gross)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: item.status === "anulada" ? "wine" : openSale(item) > 0 ? "copper" : "forest",
								children: item.status === "anulada" ? "Anulada" : openSale(item) > 0 ? "Por cobrar" : "Cerrada"
							})]
						})]
					}) }, item.id))
				})),
				tab === "compras" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurchaseList, { onNotify: notify }),
				tab === "cotizaciones" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteList, { onNotify: notify }),
				tab === "gastos" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expenses, { onNotify: notify })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaleSheet, {
			sale,
			onClose: () => setSale(null),
			notify
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurchaseForm, {
			open: buying,
			onClose: () => setBuying(false),
			notify
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteForm, {
			open: quoting,
			onClose: () => setQuoting(false),
			notify
		})
	] });
}
function PurchaseList({ onNotify }) {
	const books = useBooks((s) => s.books);
	const voidPurchase = useBooks((s) => s.voidPurchase);
	const money = useMoney();
	if (books.purchases.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "Sin compras",
		text: "Reponer inventario crea la cuenta por pagar o sale de caja, con IVA descontable."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y divide-line rounded-3xl border border-line bg-card px-4",
		children: books.purchases.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center justify-between gap-3 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-medium",
				children: [
					item.number,
					" · ",
					item.supplierName
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					formatWhen(item.at),
					" · ",
					item.payment === "credito" ? "Crédito" : "Contado"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-right",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tabular font-medium",
						children: money(item.gross)
					}),
					item.status === "recibida" && item.paid === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs font-medium text-wine",
						onClick: () => {
							const res = voidPurchase(item.id);
							onNotify(res.ok ? `${item.number} anulada` : res.error || "No se pudo anular");
						},
						children: "Anular"
					}),
					item.status === "anulada" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: "wine",
						children: "Anulada"
					})
				]
			})]
		}, item.id))
	});
}
function QuoteList({ onNotify }) {
	const books = useBooks((s) => s.books);
	const accept = useBooks((s) => s.acceptQuote);
	const reject = useBooks((s) => s.rejectQuote);
	const money = useMoney();
	const [pay, setPay] = (0, import_react.useState)("efectivo");
	if (books.quotes.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "Sin cotizaciones",
		text: "Una cotización no mueve inventario hasta que el cliente acepta."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-3",
		children: books.quotes.map((quote) => {
			const expired = quote.status === "enviada" && new Date(quote.validUntil) < /* @__PURE__ */ new Date();
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-3xl border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								quote.number,
								" · ",
								quote.customerName
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: ["Vence ", formatWhen(quote.validUntil)]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "tabular font-medium",
							children: money(quote.gross)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: quote.lines.map((l) => `${l.qty} ${l.name}`).join(" · ")
					}),
					quote.status === "enviada" && !expired ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: pay,
								onChange: (e) => setPay(e.target.value),
								className: "h-11 rounded-xl border border-line bg-card px-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "efectivo",
										children: "Efectivo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "transferencia",
										children: "Transferencia"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "tarjeta",
										children: "Tarjeta"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "credito",
										children: "Crédito"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									const res = accept(quote.id, pay);
									onNotify(res.ok ? `${quote.number} convertida en venta` : res.error || "No se pudo");
								},
								children: "Convertir en venta"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => reject(quote.id),
								children: "Rechazar"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: quote.status === "aceptada" ? "forest" : "sand",
							children: expired ? "Vencida" : quote.status
						})
					})
				]
			}, quote.id);
		})
	});
}
function Expenses({ onNotify }) {
	const books = useBooks((s) => s.books);
	const expense = useBooks((s) => s.expense);
	const money = useMoney();
	const [amount, setAmount] = (0, import_react.useState)("");
	const [memo, setMemo] = (0, import_react.useState)("");
	const [via, setVia] = (0, import_react.useState)("caja");
	const rows = books.moves.filter((m) => m.kind === "gasto" || m.kind === "ingreso");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[280px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3 rounded-3xl border border-line bg-card p-4",
			onSubmit: (event) => {
				event.preventDefault();
				const value = Number(amount.replace(/\./g, ""));
				const res = expense(value, memo, via);
				if (!res.ok) onNotify(res.error || "No se pudo");
				else {
					onNotify("Gasto registrado en el diario");
					setAmount("");
					setMemo("");
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Salida de caja"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Monto",
					inputMode: "numeric",
					value: amount,
					onChange: (e) => setAmount(e.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Concepto",
					value: memo,
					onChange: (e) => setMemo(e.target.value),
					placeholder: "Arriendo, nómina, domicilio",
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					label: "Sale de",
					value: via,
					onChange: (e) => setVia(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "caja",
						children: "Caja"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "banco",
						children: "Bancos"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					children: "Registrar gasto"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-line rounded-3xl border border-line bg-card px-4",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: row.memo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						formatWhen(row.at),
						" · ",
						row.via
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `tabular font-medium ${row.kind === "gasto" ? "text-wine" : "text-forest"}`,
					children: [row.kind === "gasto" ? "−" : "+", money(row.amount)]
				})]
			}, row.id))
		})]
	});
}
function SaleSheet({ sale, onClose, notify }) {
	const books = useBooks((s) => s.books);
	const voidSale = useBooks((s) => s.voidSale);
	const ret = useBooks((s) => s.ret);
	const money = useMoney();
	const [qty, setQty] = (0, import_react.useState)({});
	if (!sale) return null;
	const code = representationCode(`${books.company.nit}|${sale.number}|${sale.gross}`);
	const returned = /* @__PURE__ */ new Map();
	for (const doc of books.returns.filter((r) => r.saleId === sale.id)) for (const line of doc.lines) returned.set(line.productId, (returned.get(line.productId) ?? 0) + line.qty);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		open: !!sale,
		title: sale.number,
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: books.company.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"NIT ",
							books.company.nit,
							" · ",
							books.company.regime
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-medium",
						children: sale.customerName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							formatWhen(sale.at),
							" · ",
							PAYMENT_LABEL[sale.payment]
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { code })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "mt-4 w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-left text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 font-medium",
							children: "Producto"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Cant." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right",
							children: "Total"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sale.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2",
							children: line.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "tabular",
							children: line.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "text-right tabular",
							children: money(line.gross)
						})
					]
				}, line.productId)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 space-y-1 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Base" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular",
							children: money(sale.net)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Impuesto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular",
							children: money(sale.tax)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular",
							children: money(sale.gross)
						})]
					}),
					openSale(sale) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-wine",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Saldo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular",
							children: money(openSale(sale))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted",
				children: [
					"Código de representación ",
					code,
					". Borrador gráfico: no es factura electrónica DIAN ni documento fiscal."
				]
			}),
			sale.status === "emitida" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3 border-t border-line pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Devolver"
					}),
					sale.lines.map((line) => {
						const left = line.qty - (returned.get(line.productId) ?? 0);
						if (left <= 0) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								line.name,
								" · máx ",
								left
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								inputMode: "numeric",
								value: qty[line.productId] ?? "",
								onChange: (e) => setQty((prev) => ({
									...prev,
									[line.productId]: e.target.value
								})),
								className: "h-11 w-24 rounded-xl border border-line px-3 text-base"
							})]
						}, line.productId);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								const lines = sale.lines.map((line) => ({
									productId: line.productId,
									qty: Number(qty[line.productId] || 0)
								})).filter((line) => line.qty > 0);
								const res = ret(sale.id, lines);
								notify(res.ok ? "Devolución registrada" : res.error || "No se pudo");
								if (res.ok) onClose();
							},
							children: "Registrar devolución"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => {
								const res = voidSale(sale.id);
								notify(res.ok ? "Venta anulada" : res.error || "No se pudo anular");
								if (res.ok) onClose();
							},
							children: "Anular venta"
						})]
					})
				]
			})
		]
	});
}
function Mark({ code }) {
	const bits = code.split("").map((char) => Number.parseInt(char, 16));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-8 gap-0.5",
		"aria-hidden": true,
		children: Array.from({ length: 64 }, (_, i) => {
			const on = (bits[i % bits.length] ?? 0) >> i % 4 & 1;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: on ? "size-2 bg-ink" : "size-2 bg-sand" }, i);
		})
	});
}
function LineEditor({ mode, onClose, onSave }) {
	const books = useBooks((s) => s.books);
	const [productId, setProductId] = (0, import_react.useState)(books.products[0]?.id ?? "");
	const [qty, setQty] = (0, import_react.useState)("1");
	const [lines, setLines] = (0, import_react.useState)([]);
	const [partyId, setPartyId] = (0, import_react.useState)("");
	const [payment, setPayment] = (0, import_react.useState)("efectivo");
	const parties = books.parties.filter((p) => mode === "compra" ? p.kind === "supplier" : p.kind === "customer");
	const money = useMoney();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				label: mode === "compra" ? "Proveedor" : "Cliente",
				value: partyId,
				onChange: (e) => setPartyId(e.target.value),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: mode === "compra" ? "Elige proveedor" : "Mostrador"
				}), parties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: p.id,
					children: p.name
				}, p.id))]
			}),
			mode === "compra" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPayment("efectivo"),
					className: `min-h-11 rounded-xl text-sm ${payment === "efectivo" ? "bg-ink text-card" : "bg-sand"}`,
					children: "Contado"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPayment("credito"),
					className: `min-h-11 rounded-xl text-sm ${payment === "credito" ? "bg-ink text-card" : "bg-sand"}`,
					children: "Crédito"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: productId,
						onChange: (e) => setProductId(e.target.value),
						className: "h-11 min-w-0 flex-1 rounded-xl border border-line px-3 text-sm",
						children: books.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: qty,
						onChange: (e) => setQty(e.target.value),
						className: "h-11 w-20 rounded-xl border border-line px-3 text-base"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => {
							const product = books.products.find((p) => p.id === productId);
							const n = Number(qty);
							if (!product || !(n > 0)) return;
							setLines((prev) => [...prev, {
								productId,
								qty: n,
								unitNet: mode === "compra" ? product.cost : void 0
							}]);
						},
						children: "Añadir"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "text-sm",
				children: lines.map((line, index) => {
					const product = books.products.find((p) => p.id === line.productId);
					const gross = mode === "compra" ? taxOnNet(Math.round((line.unitNet ?? 0) * line.qty), books.company.taxRate).gross : taxFromGross(Math.round((product?.price ?? 0) * line.qty), books.company.taxRate).net + taxFromGross(Math.round((product?.price ?? 0) * line.qty), books.company.taxRate).tax;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between border-t border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							line.qty,
							" ",
							product?.name
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular",
							children: money(gross)
						})]
					}, `${line.productId}-${index}`);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: onClose,
					children: "Cancelar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: lines.length === 0 || mode === "compra" && !partyId,
					onClick: () => onSave(lines, {
						partyId,
						payment
					}),
					children: "Guardar"
				})]
			})
		]
	});
}
function PurchaseForm({ open, onClose, notify }) {
	const buy = useBooks((s) => s.buy);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		title: "Compra",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineEditor, {
			mode: "compra",
			onClose,
			onSave: (lines, extra) => {
				const res = buy({
					supplierId: extra.partyId,
					payment: extra.payment,
					lines
				});
				notify(res.ok ? `${res.number} recibida. Stock y libros actualizados.` : res.error);
				if (res.ok) onClose();
			}
		})
	});
}
function QuoteForm({ open, onClose, notify }) {
	const quote = useBooks((s) => s.quote);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		title: "Cotización",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineEditor, {
			mode: "cotizacion",
			onClose,
			onSave: (lines, extra) => {
				const res = quote({
					customerId: extra.partyId || null,
					validDays: 15,
					lines
				});
				notify(res.ok ? `${res.number} enviada. Aún no mueve stock.` : res.error);
				if (res.ok) onClose();
			}
		})
	});
}
function Pulso({ onJump }) {
	const books = useBooks((s) => s.books);
	const money = useMoney();
	const now = /* @__PURE__ */ new Date();
	const range = rangeFrom(now, "30d");
	const health = healthReport(books, now);
	const pnl = statement(books, range.from, range.to);
	const sheet = balanceSheet(books);
	const series = dailySeries(books, now, 14);
	const ar = sheet.assets.find((a) => a.id === "cxc")?.amount ?? 0;
	const [showIntro, setShowIntro] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setShowIntro(localStorage.getItem("contable-pro-intro") !== "off");
	}, []);
	const parts = [
		["Liquidez", health.liquidity],
		["Margen", health.margin],
		["Cobranza", health.collections],
		["Inventario", health.inventory]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
						children: "Pulso"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-4xl text-ink",
						children: "Cómo está el negocio hoy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 max-w-xl text-sm text-pretty text-muted",
						children: [
							books.company.name,
							" · ",
							books.company.city,
							". Cada venta ya dejó su asiento, su IVA y su costo."
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onJump("vender"),
					className: "min-h-11 rounded-xl bg-copper px-4 text-sm font-medium text-on-copper",
					children: "Nueva venta"
				})]
			}),
			showIntro && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Taller con datos de un mercado en Chapinero"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-pretty text-muted",
						children: "Lo que InventarioPro registraba como movimiento, aquí cierra libros: partida doble, cartera vencida y un copiloto que ejecuta órdenes en español. Todo queda en este navegador."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-3 text-sm font-medium text-copper-deep",
						onClick: () => {
							localStorage.setItem("contable-pro-intro", "off");
							setShowIntro(false);
						},
						children: "Entendido"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[220px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl bg-ink p-5 text-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tracking-[0.14em] text-sand uppercase",
							children: "Salud"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-6xl tabular leading-none",
							children: health.score
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-sand",
							children: "de 100, con los libros de los últimos 30 días"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2",
							children: parts.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sand",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular",
									children: [value, "/25"]
								})]
							}, label))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Caja y bancos",
							value: money(health.cash),
							hint: health.runwayDays == null ? "Sin gastos recientes" : `Cubre ${Math.round(health.runwayDays)} días de gastos`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Ventas netas 30d",
							value: money(pnl.ventas),
							hint: `Margen ${Math.round(pnl.margen * 100)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Resultado 30d",
							value: money(pnl.resultado),
							hint: "Después de costo y gastos",
							warn: pnl.resultado < 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Por cobrar",
							value: money(ar),
							hint: "Saldo de crédito vivo"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 xl:grid-cols-[1.4fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-line bg-card p-4 md:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: "14 días de venta neta"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Verde venta · cobre costo"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56 min-w-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: series,
								margin: {
									top: 8,
									right: 8,
									left: 0,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--color-line)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tick: {
											fill: "var(--color-muted)",
											fontSize: 11
										},
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tickFormatter: compactMoney,
										width: 42,
										tick: {
											fill: "var(--color-muted)",
											fontSize: 11
										},
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (value, name) => [money(Number(value ?? 0)), name === "net" ? "Venta neta" : "Costo"],
										contentStyle: {
											background: "var(--color-card)",
											border: "1px solid var(--color-line)",
											borderRadius: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "net",
										stroke: "var(--color-forest)",
										fill: "var(--color-forest)",
										fillOpacity: .16,
										strokeWidth: 2
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "cost",
										stroke: "var(--color-copper)",
										fill: "var(--color-copper)",
										fillOpacity: .08,
										strokeWidth: 2
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-line bg-card p-4 md:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: "Lo que el libro está diciendo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-3",
							children: health.insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-2xl bg-paper px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: insight.tone === "alert" ? "font-medium text-wine" : insight.tone === "good" ? "font-medium text-forest" : "font-medium text-ink",
									children: insight.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-pretty text-muted",
									children: insight.detail
								})]
							}, insight.title))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onJump("copiloto"),
							className: "mt-4 text-sm font-medium text-copper-deep",
							children: "Hablar con el copiloto"
						})
					]
				})]
			})
		]
	});
}
function Metric({ label, value, hint, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-3xl border border-line bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-2 font-display text-3xl tabular leading-none ${warn ? "text-wine" : "text-ink"}`,
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: hint
			})
		]
	});
}
var NAV = [
	{
		id: "pulso",
		label: "Pulso",
		group: "Operar",
		icon: LayoutDashboard
	},
	{
		id: "vender",
		label: "Vender",
		group: "Operar",
		icon: ShoppingBag
	},
	{
		id: "operaciones",
		label: "Operaciones",
		group: "Operar",
		icon: Receipt
	},
	{
		id: "inventario",
		label: "Inventario",
		group: "Control",
		icon: Package
	},
	{
		id: "cobranza",
		label: "Cobranza",
		group: "Control",
		icon: Wallet
	},
	{
		id: "libros",
		label: "Libros",
		group: "Control",
		icon: BookOpen
	},
	{
		id: "copiloto",
		label: "Copiloto",
		group: "Criterio",
		icon: Sparkles
	},
	{
		id: "empresa",
		label: "Empresa",
		group: "Criterio",
		icon: Building2
	}
];
function Shell({ view, onView, children }) {
	const command = useBooks((s) => s.command);
	const company = useBooks((s) => s.books.company.name);
	const [text, setText] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)(null);
	const [more, setMore] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!note) return;
		const timer = window.setTimeout(() => setNote(null), 4200);
		return () => window.clearTimeout(timer);
	}, [note]);
	function submit(value) {
		const clean = value.trim();
		if (!clean) return;
		const res = command(clean);
		setNote(res.message);
		if (res.ok) setText("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex min-h-screen max-w-[1440px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-5 pb-4 pt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 place-items-center rounded-xl bg-ink font-display text-lg text-card",
									children: "Cp"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg leading-none",
									children: "Contable Pro"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: "Libros que se escriben solos"
								})] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "flex-1 space-y-5 overflow-y-auto px-3 pb-4",
							children: [
								"Operar",
								"Control",
								"Criterio"
							].map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 pb-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase",
								children: group
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-1",
								children: NAV.filter((item) => item.group === group).map((item) => {
									const Icon = item.icon;
									const active = view === item.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onView(item.id),
										className: cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium", active ? "bg-ink text-card" : "text-ink-soft hover:bg-sand"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
									}, item.id);
								})
							})] }, group))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-line px-5 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: company
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-[11px] leading-relaxed text-muted",
								children: ["Desarrollado por ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-ink-soft",
									children: "Richard J. Lobo S."
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "no-print sticky top-0 z-20 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:px-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 md:hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-9 place-items-center rounded-lg bg-ink font-display text-card",
									children: "Cp"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-lg leading-none",
										children: "Contable Pro"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs text-muted",
										children: company
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 md:mt-0",
								onSubmit: (event) => {
									event.preventDefault();
									submit(text);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "sr-only",
									htmlFor: "orden",
									children: "Orden en español"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "orden",
									value: text,
									onChange: (event) => setText(event.target.value),
									placeholder: "Ordena en español: vender 2 café de origen a ana efectivo",
									className: "h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-ink outline-none placeholder:text-muted focus:border-copper"
								})]
							}),
							note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-ink-soft",
								role: "status",
								children: note
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "px-4 pt-5 pb-28 md:px-8 md:pt-7 md:pb-12",
						children
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-4",
					children: [[
						[
							"pulso",
							"Pulso",
							LayoutDashboard
						],
						[
							"vender",
							"Vender",
							ShoppingBag
						],
						[
							"libros",
							"Libros",
							BookOpen
						]
					].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onView(id),
						className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium", view === id ? "text-copper-deep" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), label]
					}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setMore(true),
						className: "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" }), "Más"]
					})]
				})
			}),
			more && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 bg-ink/45 md:hidden",
				onClick: () => setMore(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 rounded-t-3xl bg-card p-4 pb-8",
					onClick: (event) => event.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 pb-2 font-display text-2xl",
						children: "Ir a"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: NAV.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									onView(item.id);
									setMore(false);
								},
								className: cn("flex min-h-14 items-center gap-3 rounded-2xl px-3 text-sm font-medium", view === item.id ? "bg-ink text-card" : "bg-sand text-ink"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
							}, item.id);
						})
					})]
				})
			})
		]
	});
}
function Vender({ notify }) {
	const books = useBooks((s) => s.books);
	const sell = useBooks((s) => s.sell);
	const money = useMoney();
	const [query, setQuery] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("todas");
	const [cart, setCart] = (0, import_react.useState)([]);
	const [customerId, setCustomerId] = (0, import_react.useState)("");
	const [payment, setPayment] = (0, import_react.useState)("efectivo");
	const [discount, setDiscount] = (0, import_react.useState)(0);
	const [error, setError] = (0, import_react.useState)("");
	const customers = books.parties.filter((p) => p.kind === "customer");
	const visible = (0, import_react.useMemo)(() => {
		const q = fold(query);
		return books.products.filter((p) => {
			if (!p.active) return false;
			if (category !== "todas" && p.categoryId !== category) return false;
			if (!q) return true;
			return fold(`${p.name} ${p.sku}`).includes(q);
		});
	}, [
		books.products,
		query,
		category
	]);
	function add(productId) {
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
			if (!current) return [...prev, {
				productId,
				qty: 1
			}];
			return prev.map((l) => l.productId === productId ? {
				...l,
				qty: nextQty
			} : l);
		});
	}
	const factor = 1 - discount / 100;
	const lines = cart.map((line) => {
		const product = books.products.find((p) => p.id === line.productId);
		const unitGross = Math.round(product.price * factor);
		const gross = unitGross * line.qty;
		const split = taxFromGross(gross, books.company.taxRate);
		return {
			...line,
			product,
			unitGross,
			gross,
			...split
		};
	});
	const gross = lines.reduce((s, l) => s + l.gross, 0);
	const tax = lines.reduce((s, l) => s + l.tax, 0);
	const net = lines.reduce((s, l) => s + l.net, 0);
	function checkout() {
		if (lines.length === 0) return;
		const res = sell({
			customerId: customerId || null,
			payment,
			lines: lines.map((l) => ({
				productId: l.productId,
				qty: l.qty,
				unitGross: l.unitGross
			}))
		});
		if (!res.ok) {
			setError(res.error);
			return;
		}
		setCart([]);
		setError("");
		notify(`${res.number} lista · ${money(gross)}. El diario, el IVA y el inventario ya se movieron.`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-[1fr_340px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
				children: "Caja rápida"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-4xl",
				children: "Vender"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-col gap-3 sm:flex-row",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Busca por nombre o SKU",
					className: "h-12 flex-1 rounded-2xl border border-line bg-card px-4 text-base outline-none focus:border-copper"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2 overflow-x-auto pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: category === "todas",
					onClick: () => setCategory("todas"),
					children: "Todo"
				}), books.categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: category === cat.id,
					onClick: () => setCategory(cat.id),
					children: cat.name
				}, cat.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: visible.map((product) => {
					const margin = product.price > 0 ? 1 - product.cost / (product.price / (1 + books.company.taxRate)) : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => add(product.id),
						disabled: product.stock <= 0,
						className: "min-h-28 rounded-2xl border border-line bg-card p-3 text-left disabled:opacity-40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium leading-snug",
								children: product.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-xl tabular",
								children: money(product.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [
										product.stock,
										" ",
										product.unit
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
									tone: margin < .2 ? "wine" : "forest",
									children: [Math.round(margin * 100), "%"]
								})]
							})
						]
					}, product.id);
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "h-fit rounded-3xl border border-line bg-card p-4 lg:sticky lg:top-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Ticket"
				}),
				lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "Toca un producto para armar la venta."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-line",
					children: lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: line.product.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tabular text-muted",
									children: money(line.unitGross)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center rounded-full bg-sand",
								onClick: () => setCart((prev) => prev.flatMap((l) => l.productId === line.productId ? l.qty > 1 ? [{
									...l,
									qty: l.qty - 1
								}] : [] : [l])),
								"aria-label": "Quitar uno",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 text-center text-sm tabular",
								children: line.qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center rounded-full bg-sand",
								onClick: () => add(line.productId),
								"aria-label": "Sumar uno",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center rounded-full text-wine",
								onClick: () => setCart((prev) => prev.filter((l) => l.productId !== line.productId)),
								"aria-label": "Quitar línea",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, line.productId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-xs font-medium text-muted",
					children: [
						"Descuento ",
						discount,
						"%",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 30,
							value: discount,
							onChange: (event) => setDiscount(Number(event.target.value)),
							className: "mt-2 w-full accent-copper"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid grid-cols-2 gap-2",
					children: [
						"efectivo",
						"transferencia",
						"tarjeta",
						"credito"
					].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setPayment(item),
						className: `min-h-11 rounded-xl text-sm font-medium ${payment === item ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
						children: PAYMENT_LABEL[item]
					}, item))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-xs font-medium text-muted",
					children: ["Cliente", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: customerId,
						onChange: (event) => setCustomerId(event.target.value),
						className: "mt-1.5 h-11 w-full rounded-xl border border-line bg-card px-3 text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Mostrador"
						}), customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))]
					})]
				}),
				payment === "credito" && !customerId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-wine",
					children: "Elige un cliente para vender a crédito."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 space-y-1 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Base",
							v: money(net)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: `Impuesto ${Math.round(books.company.taxRate * 100)}%`,
							v: money(tax)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Total",
							v: money(gross),
							strong: true
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-wine",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-4 w-full",
					disabled: lines.length === 0 || payment === "credito" && !customerId,
					onClick: checkout,
					children: ["Cobrar ", lines.length > 0 ? money(gross) : ""]
				})
			]
		})]
	});
}
function Chip({ active, children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `min-h-10 shrink-0 rounded-full px-3 text-sm ${active ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
		children
	});
}
function Row({ k, v, strong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex justify-between ${strong ? "pt-1 font-medium text-ink" : "text-muted"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "tabular",
			children: v
		})]
	});
}
function ContableApp() {
	const [view, setView] = (0, import_react.useState)("pulso");
	const [toast, setToast] = (0, import_react.useState)(null);
	function notify(message) {
		setToast(message);
		window.setTimeout(() => setToast(null), 3800);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		view,
		onView: setView,
		children: [
			view === "pulso" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pulso, { onJump: setView }),
			view === "vender" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Vender, { notify }),
			view === "operaciones" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Operaciones, { notify }),
			view === "inventario" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inventario, { notify }),
			view === "cobranza" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cobranza, { notify }),
			view === "libros" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Libros, {}),
			view === "copiloto" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copiloto, { onJump: setView }),
			view === "empresa" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empresa, { notify }),
			toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "no-print fixed bottom-20 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-sm text-card shadow-lg md:bottom-6",
				role: "status",
				children: toast
			})
		]
	});
}
function Home() {
	const ready = useBooks((s) => s.ready);
	(0, import_react.useEffect)(() => {
		let alive = true;
		const pending = useBooks.persist.rehydrate();
		Promise.resolve(pending).finally(() => {
			if (alive) useBooks.getState().setReady(true);
		});
		return () => {
			alive = false;
		};
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper px-6 text-center text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-5xl",
			children: "Contable Pro"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Abriendo los libros de Mercado Andino…"
		})] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContableApp, {});
}
//#endregion
export { Home as component };
