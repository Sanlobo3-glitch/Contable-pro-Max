import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { loadLedger, saveLedger } from "@/lib/books/remote";
import { useBooks } from "@/lib/books/store";
import { ContableApp } from "./app";

export function Cuenta() {
  const user = useCurrentUser();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const armed = useRef(false);
  const books = useBooks((s) => s.books);
  const workspace = useBooks((s) => s.workspace);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    let alive = true;
    armed.current = false;
    setReady(false);
    void loadLedger()
      .then(async (row) => {
        if (!alive) return;
        const local = useBooks.getState();
        if (row) {
          local.applyRemote(row.books, row.workspace, userId);
        } else if (local.ownerId === userId || (local.ownerId == null && local.workspace === "live")) {
          local.claim(userId);
          await saveLedger({
            data: { payload: JSON.stringify(useBooks.getState().books), workspace: useBooks.getState().workspace },
          });
        } else {
          local.beginSetup();
          local.claim(userId);
        }
        if (alive) setReady(true);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!ready) return;
    if (!armed.current) {
      armed.current = true;
      return;
    }
    const handle = window.setTimeout(() => {
      useBooks.getState().setCloud("saving");
      void saveLedger({ data: { payload: JSON.stringify(books), workspace } })
        .then(() => useBooks.getState().setCloud("saved"))
        .catch(() => useBooks.getState().setCloud("error"));
    }, 700);
    return () => window.clearTimeout(handle);
  }, [books, workspace, ready]);

  if (failed) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
        <div>
          <p className="font-display text-4xl">No pude abrir tu cuenta</p>
          <p className="mt-2 text-sm text-muted">Revisa la conexión y vuelve a entrar.</p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
        <div>
          <p className="font-display text-5xl">Contable Pro</p>
          <p className="mt-2 text-sm text-muted">Abriendo los libros de tu cuenta…</p>
        </div>
      </main>
    );
  }

  return <ContableApp />;
}
