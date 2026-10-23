import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ContableApp } from "@/components/app/app";
import { useBooks } from "@/lib/books/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const ready = useBooks((s) => s.ready);
  useEffect(() => {
    let alive = true;
    const pending = useBooks.persist.rehydrate();
    void Promise.resolve(pending).finally(() => {
      if (alive) useBooks.getState().setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
        <div>
          <p className="font-display text-5xl">Contable Pro</p>
          <p className="mt-2 text-sm text-muted">Abriendo los libros de Mercado Andino…</p>
        </div>
      </main>
    );
  }
  return <ContableApp />;
}
