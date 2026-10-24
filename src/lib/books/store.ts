import { create } from "zustand";
import { persist } from "zustand/middleware";
import { runCommand } from "./command";
import {
  BookError,
  acceptQuote,
  emptyBooks,
  postAdjust,
  postCollection,
  postExpense,
  postPurchase,
  postQuote,
  postReturn,
  postSale,
  postSupplierPayment,
  saveCategory,
  saveParty,
  saveProduct,
  setOpening,
  setQuoteStatus,
  updateCompany,
  voidPurchase,
  voidSale,
} from "./model";
import { buildSeed } from "./seed";
import type { Books, CashVia, Company, PaymentMethod } from "./types";

export type Workspace = "setup" | "live" | "sample";

const BLANK: Company = {
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
};

function freshBooks(): Books {
  return emptyBooks(BLANK, new Date().toISOString());
}

function guard(run: () => Books): { ok: true } | { ok: false; error: string } {
  try {
    useBooks.setState({ books: run() });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof BookError ? error.message : "No se pudo guardar" };
  }
}

interface Store {
  books: Books;
  workspace: Workspace;
  ready: boolean;
  ownerId: string | null;
  cloud: "local" | "saving" | "saved" | "error";
  setReady: (ready: boolean) => void;
  setCloud: (cloud: Store["cloud"]) => void;
  claim: (ownerId: string) => void;
  applyRemote: (books: Books, workspace: Workspace, ownerId: string) => void;
  openLive: (company: Company, opening: { cash: number; bank: number }) => { ok: true } | { ok: false; error: string };
  loadSample: () => void;
  beginSetup: () => void;
  command: (text: string) => { ok: boolean; message: string };
  sell: (input: { customerId: string | null; payment: PaymentMethod; lines: { productId: string; qty: number; unitGross?: number }[] }) => { ok: true; number: string } | { ok: false; error: string };
  buy: (input: { supplierId: string; payment: "efectivo" | "credito"; lines: { productId: string; qty: number; unitNet?: number }[] }) => { ok: true; number: string } | { ok: false; error: string };
  quote: (input: { customerId: string | null; validDays: number; lines: { productId: string; qty: number }[] }) => { ok: true; number: string } | { ok: false; error: string };
  voidSale: (id: string) => { ok: boolean; error?: string };
  voidPurchase: (id: string) => { ok: boolean; error?: string };
  ret: (saleId: string, lines: { productId: string; qty: number }[]) => { ok: boolean; error?: string };
  collect: (customerId: string, amount: number, via: CashVia) => { ok: boolean; error?: string };
  paySupplier: (supplierId: string, amount: number, via: CashVia) => { ok: boolean; error?: string };
  expense: (amount: number, memo: string, via: CashVia) => { ok: boolean; error?: string };
  adjust: (productId: string, qtyDelta: number, memo: string) => { ok: boolean; error?: string };
  saveProduct: (input: Parameters<typeof saveProduct>[1]) => { ok: boolean; error?: string };
  saveParty: (input: Parameters<typeof saveParty>[1]) => { ok: boolean; error?: string };
  saveCategory: (name: string) => { ok: boolean; error?: string };
  patchCompany: (patch: Partial<Books["company"]>) => { ok: boolean; error?: string };
  acceptQuote: (id: string, payment: PaymentMethod) => { ok: boolean; error?: string };
  rejectQuote: (id: string) => { ok: boolean; error?: string };
  replaceBooks: (books: Books) => void;
}

export const useBooks = create<Store>()(
  persist(
    (set, get) => ({
      books: freshBooks(),
      workspace: "setup",
      ready: false,
      ownerId: null,
      cloud: "local",
      setReady: (ready) => set({ ready }),
      setCloud: (cloud) => set({ cloud }),
      claim: (ownerId) => set({ ownerId }),
      applyRemote: (books, workspace, ownerId) => set({ books, workspace, ownerId }),
      openLive: (company, opening) => {
        const name = company.name.trim();
        if (name.length < 2) return { ok: false, error: "Escribe la razón social" };
        const rate = Number(company.taxRate);
        if (!Number.isFinite(rate) || rate < 0 || rate > 0.4) return { ok: false, error: "Impuesto inválido" };
        if (opening.cash < 0 || opening.bank < 0 || !Number.isFinite(opening.cash) || !Number.isFinite(opening.bank)) {
          return { ok: false, error: "Los saldos de arranque no pueden ser negativos" };
        }
        const at = new Date().toISOString();
        const clean: Company = {
          name,
          nit: company.nit.trim(),
          city: company.city.trim(),
          address: company.address.trim(),
          phone: company.phone.trim(),
          email: company.email.trim(),
          currency: company.currency || "COP",
          taxRate: rate,
          regime: company.regime.trim() || "Responsable de IVA",
          invoicePrefix: (company.invoicePrefix || "FE").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || "FE",
        };
        let books = emptyBooks(clean, at);
        if (opening.cash > 0 || opening.bank > 0) {
          books = setOpening(books, { at, cash: Math.round(opening.cash), bank: Math.round(opening.bank), lines: [] });
        }
        set({ books, workspace: "live" });
        return { ok: true };
      },
      loadSample: () => set({ books: buildSeed(new Date()), workspace: "sample" }),
      beginSetup: () => set({ books: freshBooks(), workspace: "setup" }),
      command: (text) => {
        const res = runCommand(get().books, text, new Date());
        if (res.books) set({ books: res.books });
        return { ok: res.ok, message: res.message };
      },
      sell: (input) => {
        try {
          const { books, sale } = postSale(get().books, { ...input, at: new Date().toISOString() });
          set({ books });
          return { ok: true, number: sale.number };
        } catch (error) {
          return { ok: false, error: error instanceof BookError ? error.message : "No se pudo vender" };
        }
      },
      buy: (input) => {
        try {
          const { books, purchase } = postPurchase(get().books, { ...input, at: new Date().toISOString() });
          set({ books });
          return { ok: true, number: purchase.number };
        } catch (error) {
          return { ok: false, error: error instanceof BookError ? error.message : "No se pudo comprar" };
        }
      },
      quote: (input) => {
        try {
          const { books, quote } = postQuote(get().books, { ...input, at: new Date().toISOString() });
          set({ books });
          return { ok: true, number: quote.number };
        } catch (error) {
          return { ok: false, error: error instanceof BookError ? error.message : "No se pudo cotizar" };
        }
      },
      voidSale: (id) => {
        const r = guard(() => voidSale(get().books, id));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      voidPurchase: (id) => {
        const r = guard(() => voidPurchase(get().books, id));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      ret: (saleId, lines) => {
        try {
          const { books } = postReturn(get().books, { at: new Date().toISOString(), saleId, lines });
          set({ books });
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error instanceof BookError ? error.message : "No se pudo devolver" };
        }
      },
      collect: (customerId, amount, via) => {
        const r = guard(() => postCollection(get().books, { at: new Date().toISOString(), customerId, amount, via }));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      paySupplier: (supplierId, amount, via) => {
        const r = guard(() => postSupplierPayment(get().books, { at: new Date().toISOString(), supplierId, amount, via }));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      expense: (amount, memo, via) => {
        const r = guard(() => postExpense(get().books, { at: new Date().toISOString(), amount, memo, via }));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      adjust: (productId, qtyDelta, memo) => {
        const r = guard(() => postAdjust(get().books, { at: new Date().toISOString(), productId, qtyDelta, memo }));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      saveProduct: (input) => {
        const r = guard(() => saveProduct(get().books, input));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      saveParty: (input) => {
        const r = guard(() => saveParty(get().books, input));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      saveCategory: (name) => {
        const r = guard(() => saveCategory(get().books, name));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      patchCompany: (patch) => {
        const r = guard(() => updateCompany(get().books, patch));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      acceptQuote: (id, payment) => {
        const r = guard(() => acceptQuote(get().books, id, payment, new Date().toISOString()));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      rejectQuote: (id) => {
        const r = guard(() => setQuoteStatus(get().books, id, "rechazada"));
        return r.ok ? { ok: true } : { ok: false, error: r.error };
      },
      replaceBooks: (books) => set({ books, workspace: "live" }),
    }),
    {
      name: "contable-pro-libros-v3",
      skipHydration: true,
      partialize: (state) => ({ books: state.books, workspace: state.workspace, ownerId: state.ownerId }),
    },
  ),
);
