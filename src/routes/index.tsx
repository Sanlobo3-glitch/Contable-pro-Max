import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Acceso } from "@/components/app/acceso";
import { Cuenta } from "@/components/app/sync";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useBooks } from "@/lib/books/store";

export const Route = createFileRoute("/")({ component: Home });

function Splash() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
      <div>
        <p className="font-display text-5xl">Contable Pro</p>
        <p className="mt-2 text-sm text-muted">Abriendo tus libros…</p>
      </div>
    </main>
  );
}

function Home() {
  const ready = useBooks((s) => s.ready);
  const { user, isPending } = useCurrentUserState();
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

  if (!ready || isPending) return <Splash />;
  if (!user) return <Acceso />;
  return <Cuenta />;
}
