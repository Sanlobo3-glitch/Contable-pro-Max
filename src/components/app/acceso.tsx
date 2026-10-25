import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, signIn } from "@/lib/auth/client";
import { setDeviceMode } from "@/lib/books/device";
import { Button, Field } from "./ui";

export function Acceso() {
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
      if (result.error) {
        setError(
          result.error.message ||
            "No se pudo crear la sesión. En Vercel todavía no hay base de datos: usa “Probar en este equipo”.",
        );
      }
    } catch {
      setError("No se pudo crear la sesión. Prueba en este equipo mientras conectas la base.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6 py-10 text-ink">
      <div className="w-full max-w-sm">
        <div className="grid size-12 place-items-center rounded-xl bg-ink font-display text-xl text-card">Cp</div>
        <p className="mt-8 text-xs font-medium tracking-[0.16em] text-copper-deep uppercase">Contable Pro</p>
        <h1 className="mt-3 text-4xl">{mode === "crear" ? "Crea tu cuenta" : "Entra a tus libros"}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          La empresa queda en tu cuenta. El mismo negocio abre en el teléfono y en el computador.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "crear" && <Field label="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required />}
          <Field label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Field label="Clave" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "crear" ? "new-password" : "current-password"} />
          {error && <p className="text-sm text-wine">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando…" : mode === "crear" ? "Crear cuenta" : "Entrar"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-3 min-h-11 w-full text-sm font-medium text-copper-deep"
          onClick={() => {
            setMode(mode === "crear" ? "entrar" : "crear");
            setError("");
          }}
        >
          {mode === "crear" ? "Ya tengo cuenta" : "Crear una cuenta nueva"}
        </button>
        <div className="mt-6 space-y-2">
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
        <button
          type="button"
          className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-copper px-4 text-sm font-medium text-on-copper"
          onClick={() => setDeviceMode(true)}
        >
          Probar en este equipo
        </button>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          No necesita Supabase ni servidor. Los libros quedan en este navegador para que puedas usar la app ya. La cuenta con correo se enciende cuando la publicación trae su base de datos.
        </p>
        <p className="mt-6 text-xs leading-relaxed text-muted">Desarrollado por Richard J. Lobo S.</p>
      </div>
    </main>
  );
}
