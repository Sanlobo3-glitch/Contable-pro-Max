import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { setDeviceMode } from "@/lib/books/device";
import { Button, Field } from "./ui";

export function Acceso() {
  const [account, setAccount] = useState(false);
  const [mode, setMode] = useState<"entrar" | "crear">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result =
        mode === "crear"
          ? await authClient.signUp.email({ email, password, name: name.trim() || email, callbackURL: "/" })
          : await authClient.signIn.email({ email, password, callbackURL: "/" });
      if (result.error) setError(result.error.message || "No se pudo entrar");
    } catch {
      setError("No se pudo entrar");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 py-10 text-ink">
      <div className="w-full max-w-sm">
        <div className="grid size-14 place-items-center rounded-2xl bg-ink font-display text-2xl text-card">Cp</div>
        <p className="mt-8 text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Contable Pro</p>
        <h1 className="mt-3 text-4xl">Tus libros</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Entra sin cuenta. Lo que registres queda en este teléfono hasta que conectes la base.
        </p>
        <Button type="button" className="mt-6 w-full" onClick={() => setDeviceMode(true)}>
          Acceder
        </Button>
        <button
          type="button"
          className="mt-3 min-h-11 w-full text-sm font-medium text-copper-deep"
          onClick={() => setAccount((open) => !open)}
        >
          {account ? "Seguir sin cuenta" : "Entrar con cuenta"}
        </button>
        {account && (
          <form onSubmit={submit} className="mt-4 space-y-3">
            {mode === "crear" && <Field label="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required />}
            <Field label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <Field label="Clave" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "crear" ? "new-password" : "current-password"} />
            {error && <p className="text-sm text-wine">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Entrando…" : mode === "crear" ? "Crear cuenta" : "Entrar"}
            </Button>
            <button
              type="button"
              className="min-h-11 w-full text-sm font-medium text-copper-deep"
              onClick={() => {
                setMode(mode === "crear" ? "entrar" : "crear");
                setError("");
              }}
            >
              {mode === "crear" ? "Ya tengo cuenta" : "Crear una cuenta nueva"}
            </button>
            <div className="space-y-2">
              {GROK_PROVIDERS.map((provider) => (
                <button
                  key={provider.providerId}
                  type="button"
                  onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
                  className="flex min-h-12 w-full items-center justify-center rounded-xl border border-line bg-card px-4 text-sm font-medium text-ink"
                >
                  Continuar con {provider.label}
                </button>
              ))}
            </div>
          </form>
        )}
        <p className="mt-8 text-xs leading-relaxed text-muted">Desarrollado por Richard J. Lobo S.</p>
      </div>
    </main>
  );
}
