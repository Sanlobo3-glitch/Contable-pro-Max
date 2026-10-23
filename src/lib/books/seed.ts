import {
  emptyBooks,
  postCollection,
  postExpense,
  postIncome,
  postPurchase,
  postQuote,
  postSale,
  postSupplierPayment,
  setOpening,
  imbalance,
} from "./model";
import type { Books, PaymentMethod } from "./types";

function at(now: Date, daysAgo: number, hour = 10, minute = 0): string {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSeed(now = new Date()): Books {
  let b = emptyBooks(
    {
      name: "Mercado Andino S.A.S.",
      nit: "901.448.220-3",
      address: "Cra 13 # 63-42, Chapinero",
      city: "Bogotá",
      phone: "+57 601 555 0142",
      email: "hola@mercadoandino.co",
      currency: "COP",
      taxRate: 0.19,
      invoicePrefix: "FE",
      regime: "Responsable de IVA",
    },
    at(now, 46, 8),
  );

  const cats = [
    ["cat-aba", "Abarrotes"],
    ["cat-caf", "Café"],
    ["cat-lac", "Lácteos"],
    ["cat-lim", "Limpieza"],
  ] as const;
  b.categories = cats.map(([id, name]) => ({ id, name }));

  const catalog: [string, string, string, string, number, number, number][] = [
    ["p-cafe", "CAF-250", "Café de origen 250g", "cat-caf", 28000, 14200, 12],
    ["p-mol", "CAF-500", "Café molido 500g", "cat-caf", 42000, 22100, 8],
    ["p-pan", "PAN-500", "Panela orgánica 500g", "cat-aba", 8500, 4100, 20],
    ["p-arr", "ARR-1K", "Arroz premium 1kg", "cat-aba", 6200, 3400, 24],
    ["p-ace", "ACE-500", "Aceite de oliva 500ml", "cat-aba", 36000, 21400, 6],
    ["p-lec", "LEC-1L", "Leche entera 1L", "cat-lac", 4800, 3100, 16],
    ["p-que", "QUE-250", "Queso campesino 250g", "cat-lac", 12500, 7900, 8],
    ["p-jab", "JAB-LAV", "Jabón lavanda", "cat-lim", 6900, 3200, 10],
    ["p-mie", "MIE-500", "Miel de abejas 500g", "cat-aba", 24000, 12800, 5],
    ["p-cho", "CHO-70", "Chocolate 70% 80g", "cat-caf", 9800, 4500, 14],
    ["p-ave", "AVE-1K", "Avena en hojuelas 1kg", "cat-aba", 8900, 5100, 10],
    ["p-det", "DET-1L", "Detergente cítrico 1L", "cat-lim", 11200, 6400, 8],
  ];
  b.products = catalog.map(([id, sku, name, categoryId, price, cost, minStock]) => ({
    id,
    sku,
    name,
    categoryId,
    price,
    cost,
    stock: 0,
    minStock,
    unit: "und",
    active: true,
  }));

  b.parties = [
    { id: "cli-ana", kind: "customer", name: "Ana Ríos", document: "CC 52.441.908", email: "ana.rios@correo.co", phone: "310 555 0191", address: "Chapinero Alto", termsDays: 15 },
    { id: "cli-lib", kind: "customer", name: "Café Librería Norte", document: "NIT 900.112.334", email: "compras@librerianorte.co", phone: "601 555 2210", address: "Calle 72 # 10-18", termsDays: 30 },
    { id: "cli-hot", kind: "customer", name: "Hotel Casa Quebrada", document: "NIT 900.883.120", email: "contabilidad@casaquebrada.co", phone: "601 555 7781", address: "La Candelaria", termsDays: 8 },
    { id: "cli-tie", kind: "customer", name: "Tienda La Esquina", document: "CC 79.220.114", email: "esquina@correo.co", phone: "320 555 0144", address: "Teusaquillo", termsDays: 0 },
    { id: "cli-die", kind: "customer", name: "Diego Pulido", document: "CC 1.020.884.331", email: "diegop@correo.co", phone: "315 555 6620", address: "Usaquén", termsDays: 8 },
    { id: "prv-caf", kind: "supplier", name: "Cooperativa Cafetera del Huila", document: "NIT 891.220.009", email: "pedidos@cafhuila.co", phone: "608 555 0100", address: "Pitalito, Huila", termsDays: 20 },
    { id: "prv-ali", kind: "supplier", name: "Alimentos del Valle", document: "NIT 805.331.902", email: "ventas@alivalle.co", phone: "602 555 4411", address: "Cali", termsDays: 15 },
    { id: "prv-hig", kind: "supplier", name: "Higiene Andina", document: "NIT 830.220.441", email: "hola@higieneandina.co", phone: "601 555 9090", address: "Bogotá", termsDays: 15 },
  ];
  b.seq = 40;

  const openingQty: Record<string, number> = {
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
    "p-det": 34,
  };
  b = setOpening(b, {
    at: at(now, 46, 8),
    cash: 12_400_000,
    bank: 3_250_000,
    lines: b.products.map((p) => ({
      productId: p.id,
      name: p.name,
      qty: openingQty[p.id] ?? 0,
      unitCost: p.cost,
    })),
  });

  const rand = rng(20261022);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const customers = ["cli-ana", "cli-lib", "cli-tie", "cli-die", null] as const;
  const payCycle: PaymentMethod[] = ["efectivo", "efectivo", "transferencia", "efectivo", "tarjeta", "efectivo"];

  const trySale = (daysAgo: number, productId: string, qty: number, customerId: string | null, payment: PaymentMethod, hour: number) => {
    const product = b.products.find((p) => p.id === productId);
    if (!product || product.stock < qty) return;
    try {
      b = postSale(b, {
        at: at(now, daysAgo, hour, Math.floor(rand() * 50)),
        customerId,
        payment: payment === "credito" && !customerId ? "efectivo" : payment,
        lines: [{ productId, qty }],
      }).books;
    } catch {
      /* el día sigue */
    }
  };

  for (let day = 40; day >= 1; day--) {
    if (day === 26) {
      b = postPurchase(b, {
        at: at(now, day, 9),
        supplierId: "prv-caf",
        payment: "credito",
        lines: [
          { productId: "p-cafe", qty: 40 },
          { productId: "p-mol", qty: 18 },
        ],
      }).books;
    }
    if (day === 20) {
      b = postPurchase(b, {
        at: at(now, day, 9, 10),
        supplierId: "prv-ali",
        payment: "credito",
        lines: [
          { productId: "p-que", qty: 24 },
          { productId: "p-lec", qty: 36 },
        ],
      }).books;
    }
    if (day === 18) {
      b = postSale(b, {
        at: at(now, day, 11, 20),
        customerId: "cli-hot",
        payment: "credito",
        lines: [
          { productId: "p-ace", qty: 8 },
          { productId: "p-cafe", qty: 10 },
          { productId: "p-mie", qty: 6 },
          { productId: "p-cho", qty: 12 },
        ],
      }).books;
    }
    if (day === 15) {
      b = postIncome(b, { at: at(now, day, 16), amount: 86000, memo: "Rendimiento cuenta de ahorros", via: "banco" });
    }
    if (day === 12) {
      b = postPurchase(b, {
        at: at(now, day, 9, 30),
        supplierId: "prv-ali",
        payment: "efectivo",
        lines: [
          { productId: "p-arr", qty: 60 },
          { productId: "p-pan", qty: 40 },
          { productId: "p-ave", qty: 24 },
          { productId: "p-ace", qty: 10 },
        ],
      }).books;
    }
    if (day === 9) {
      b = postSale(b, {
        at: at(now, day, 15),
        customerId: "cli-ana",
        payment: "credito",
        lines: [
          { productId: "p-cafe", qty: 4 },
          { productId: "p-que", qty: 3 },
          { productId: "p-mie", qty: 2 },
        ],
      }).books;
    }
    if (day === 7) {
      b = postPurchase(b, {
        at: at(now, day, 10),
        supplierId: "prv-hig",
        payment: "credito",
        lines: [
          { productId: "p-jab", qty: 24 },
          { productId: "p-det", qty: 16 },
        ],
      }).books;
    }
    if (day === 5) {
      b = postCollection(b, { at: at(now, day, 17), customerId: "cli-ana", amount: 80000, via: "banco" });
      b = postSale(b, {
        at: at(now, day, 12),
        customerId: "cli-lib",
        payment: "credito",
        lines: [
          { productId: "p-cho", qty: 20 },
          { productId: "p-mol", qty: 6 },
          { productId: "p-cafe", qty: 8 },
        ],
      }).books;
    }
    if (day === 3) {
      b = postExpense(b, { at: at(now, day, 8), amount: 2_450_000, memo: "Arriendo del local", via: "banco" });
    }
    if (day === 2) {
      b = postExpense(b, { at: at(now, day, 9), amount: 386000, memo: "Energía y agua", via: "caja" });
      b = postSupplierPayment(b, { at: at(now, day, 11), supplierId: "prv-caf", amount: 900000, via: "banco" });
    }

    const salesToday = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < salesToday; i++) {
      const weighted = rand() < 0.12 ? "p-ace" : rand() < 0.22 ? "p-que" : pick(b.products).id;
      const qty = weighted === "p-ace" || weighted === "p-mie" ? 1 : 1 + Math.floor(rand() * 3);
      const customerId = rand() < 0.55 ? null : pick([...customers]);
      trySale(day, weighted, qty, customerId, pick(payCycle), 9 + i * 2);
    }
  }

  b = postQuote(b, {
    at: at(now, 1, 16),
    validDays: 12,
    customerId: "cli-lib",
    lines: [
      { productId: "p-mol", qty: 12 },
      { productId: "p-cho", qty: 24 },
    ],
  }).books;

  const gap = imbalance(b);
  if (Math.abs(gap) > 1) throw new Error(`Libros de demostración descuadrados (${gap})`);
  return b;
}
