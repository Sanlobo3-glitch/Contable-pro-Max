import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Acceso } from "@/components/app/acceso";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink">
        <p className="font-display text-4xl">Contable Pro</p>
      </main>
    );
  }
  if (user) return <Navigate to="/" />;
  return <Acceso />;
}
