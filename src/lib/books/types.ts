export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta" | "credito";
export type CashVia = "caja" | "banco";
export type DocStatus = "emitida" | "anulada";
export type PurchaseStatus = "recibida" | "anulada";
export type QuoteStatus = "enviada" | "aceptada" | "rechazada";

export interface Company {
  name: string;
  nit: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  regime: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  active: boolean;
}

export interface Party {
  id: string;
  kind: "customer" | "supplier";
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  termsDays: number;
}

export interface SaleLine {
  productId: string;
  name: string;
  qty: number;
  unitGross: number;
  unitCost: number;
  gross: number;
  tax: number;
  net: number;
  cost: number;
}

export interface Sale {
  id: string;
  number: string;
  at: string;
  customerId: string | null;
  customerName: string;
  payment: PaymentMethod;
  status: DocStatus;
  dueAt: string | null;
  lines: SaleLine[];
  gross: number;
  tax: number;
  net: number;
  cost: number;
  paid: number;
  returnedGross: number;
}

export interface PurchaseLine {
  productId: string;
  name: string;
  qty: number;
  unitNet: number;
  net: number;
  tax: number;
  gross: number;
}

export interface Purchase {
  id: string;
  number: string;
  at: string;
  supplierId: string;
  supplierName: string;
  payment: "efectivo" | "credito";
  status: PurchaseStatus;
  dueAt: string | null;
  lines: PurchaseLine[];
  gross: number;
  tax: number;
  net: number;
  paid: number;
}

export interface QuoteLine {
  productId: string;
  name: string;
  qty: number;
  unitGross: number;
  gross: number;
  tax: number;
  net: number;
}

export interface Quote {
  id: string;
  number: string;
  at: string;
  validUntil: string;
  customerId: string | null;
  customerName: string;
  status: QuoteStatus;
  lines: QuoteLine[];
  gross: number;
  tax: number;
  net: number;
}

export interface Move {
  id: string;
  at: string;
  kind: "gasto" | "ingreso" | "cobro" | "pago" | "ajuste";
  amount: number;
  via: CashVia;
  memo: string;
  partyId: string | null;
  docId: string | null;
  productId: string | null;
  qty: number;
}

export interface ReturnLine {
  productId: string;
  name: string;
  qty: number;
  gross: number;
  tax: number;
  net: number;
  cost: number;
}

export interface ReturnDoc {
  id: string;
  number: string;
  at: string;
  saleId: string;
  saleNumber: string;
  lines: ReturnLine[];
  gross: number;
  tax: number;
  net: number;
  cost: number;
  toAr: number;
  toCash: number;
  via: CashVia;
}

export interface Opening {
  at: string;
  cash: number;
  bank: number;
  lines: { productId: string; name: string; qty: number; unitCost: number }[];
}

export interface Books {
  version: 1;
  company: Company;
  categories: Category[];
  products: Product[];
  parties: Party[];
  sales: Sale[];
  purchases: Purchase[];
  quotes: Quote[];
  moves: Move[];
  returns: ReturnDoc[];
  opening: Opening;
  seq: number;
}

export type AccountId =
  | "caja"
  | "banco"
  | "cxc"
  | "inventario"
  | "ivaDesc"
  | "cxp"
  | "ivaGen"
  | "capital"
  | "ventas"
  | "costo"
  | "gastos"
  | "otros";

export interface JLine {
  account: AccountId;
  debit: number;
  credit: number;
}

export type JournalKind =
  | "apertura"
  | "venta"
  | "compra"
  | "gasto"
  | "ingreso"
  | "cobro"
  | "pago"
  | "devolucion"
  | "ajuste";

export interface JEntry {
  id: string;
  at: string;
  ref: string;
  memo: string;
  kind: JournalKind;
  lines: JLine[];
}
