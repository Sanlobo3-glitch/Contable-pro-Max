import { create } from "zustand";
import { persist } from "zustand/middleware";
import { runCommand } from "./command";
import {
  BookError,
  acceptQuote,
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
  setQuoteStatus,
  updateCompany,
  voidPurchase,
  voidSale,
} from "./model";
import { buildSeed } from "./seed";
import type { Books, CashVia, PaymentMethod } from "./types";

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
  ready: boolean;
  setReady: (ready: boolean) => void;
  reset: () => void;
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
      books: buildSeed(new Date()),
      ready: false,
      setReady: (ready) => set({ ready }),
      reset: () => set({ books: buildSeed(new Date()) }),
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
      replaceBooks: (books) => set({ books }),
    }),
    { name: "contable-pro-libros-v2", skipHydration: true, partialize: (state) => ({ books: state.books }) },
  ),
);
