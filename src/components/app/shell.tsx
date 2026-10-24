import {
  BookOpen,
  Building2,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useBooks } from "@/lib/books/store";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "./ui";

export type ViewId =
  | "pulso"
  | "vender"
  | "operaciones"
  | "inventario"
  | "cobranza"
  | "libros"
  | "copiloto"
  | "empresa";

const NAV: { id: ViewId; label: string; group: string; icon: typeof LayoutDashboard }[] = [
  { id: "pulso", label: "Pulso", group: "Operar", icon: LayoutDashboard },
  { id: "vender", label: "Vender", group: "Operar", icon: ShoppingBag },
  { id: "operaciones", label: "Operaciones", group: "Operar", icon: Receipt },
  { id: "inventario", label: "Inventario", group: "Control", icon: Package },
  { id: "cobranza", label: "Cobranza", group: "Control", icon: Wallet },
  { id: "libros", label: "Libros", group: "Control", icon: BookOpen },
  { id: "copiloto", label: "Copiloto", group: "Criterio", icon: Sparkles },
  { id: "empresa", label: "Empresa", group: "Criterio", icon: Building2 },
];

export function Shell({
  view,
  onView,
  children,
}: {
  view: ViewId;
  onView: (view: ViewId) => void;
  children: ReactNode;
}) {
  const command = useBooks((s) => s.command);
  const company = useBooks((s) => s.books.company.name);
  const workspace = useBooks((s) => s.workspace);
  const cloud = useBooks((s) => s.cloud);
  const beginSetup = useBooks((s) => s.beginSetup);
  const cloudLabel = cloud === "saving" ? "Guardando en tu cuenta…" : cloud === "saved" ? "Guardado en tu cuenta" : cloud === "error" ? "No se pudo guardar en la cuenta" : "En tu cuenta";
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    if (!note) return;
    const timer = window.setTimeout(() => setNote(null), 4200);
    return () => window.clearTimeout(timer);
  }, [note]);

  function submit(value: string) {
    const clean = value.trim();
    if (!clean) return;
    const res = command(clean);
    setNote(res.message);
    if (res.ok) setText("");
  }

  const groups = ["Operar", "Control", "Criterio"];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card md:flex">
          <div className="px-5 pb-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-ink font-display text-lg text-card">Cp</div>
              <div>
                <p className="font-display text-lg leading-none">Contable Pro</p>
                <p className="mt-1 text-xs text-muted">Libros que se escriben solos</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
            {groups.map((group) => (
              <div key={group}>
                <p className="px-3 pb-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">{group}</p>
                <div className="space-y-1">
                  {NAV.filter((item) => item.group === group).map((item) => {
                    const Icon = item.icon;
                    const active = view === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onView(item.id)}
                        className={cn(
                          "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium",
                          active ? "bg-ink text-card" : "text-ink-soft hover:bg-sand",
                        )}
                      >
                        <Icon className="size-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-line px-5 py-4">
            <p className="truncate text-sm font-medium">{company || "Sin empresa"}</p>
            <p className="mt-1 text-xs text-muted">{workspace === "sample" ? "Empresa de ejemplo" : cloudLabel}</p>
            <div className="mt-3">
              <UserButton />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Desarrollado por <span className="font-medium text-ink-soft">Richard J. Lobo S.</span>
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="no-print sticky top-0 z-20 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-3 md:hidden">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-ink font-display text-card">Cp</div>
                <div className="min-w-0">
                  <p className="font-display text-lg leading-none">Contable Pro</p>
                  <p className="truncate text-xs text-muted">{company}</p>
                </div>
              </div>
              <UserButton />
            </div>
            <form
              className="mt-3 md:mt-0"
              onSubmit={(event) => {
                event.preventDefault();
                submit(text);
              }}
            >
              <label className="sr-only" htmlFor="orden">
                Orden en español
              </label>
              <input
                id="orden"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Ordena en español: gastar 85000 en arriendo por banco"
                className="h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-ink outline-none placeholder:text-muted focus:border-copper"
              />
            </form>
            {note && (
              <p className="mt-2 text-sm text-ink-soft" role="status">
                {note}
              </p>
            )}
            {workspace === "sample" && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sand px-3 py-2">
                <p className="text-sm text-ink-soft">Estás en Mercado Andino, una empresa ficticia. Estos movimientos no son tus libros.</p>
                <button
                  type="button"
                  className="min-h-10 shrink-0 text-sm font-medium text-copper-deep"
                  onClick={() => {
                    if (window.confirm("Sales del ejemplo y abres el alta de tu empresa. Lo de Mercado Andino se descarta.")) beginSetup();
                  }}
                >
                  Crear mi empresa
                </button>
              </div>
            )}
          </header>
          <main className="px-4 pt-5 pb-28 md:px-8 md:pt-7 md:pb-12">{children}</main>
        </div>
      </div>

      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] md:hidden">
        <div className="grid grid-cols-4">
          {(
            [
              ["pulso", "Pulso", LayoutDashboard],
              ["vender", "Vender", ShoppingBag],
              ["libros", "Libros", BookOpen],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => onView(id)}
              className={cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium", view === id ? "text-copper-deep" : "text-muted")}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
          <button type="button" onClick={() => setMore(true)} className="flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted">
            <Sparkles className="size-5" />
            Más
          </button>
        </div>
      </nav>

      {more && (
        <div className="fixed inset-0 z-40 bg-ink/45 md:hidden" onClick={() => setMore(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-card p-4 pb-8" onClick={(event) => event.stopPropagation()}>
            <p className="px-2 pb-2 font-display text-2xl">Ir a</p>
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onView(item.id);
                      setMore(false);
                    }}
                    className={cn("flex min-h-14 items-center gap-3 rounded-2xl px-3 text-sm font-medium", view === item.id ? "bg-ink text-card" : "bg-sand text-ink")}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
