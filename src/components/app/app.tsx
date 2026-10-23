import { useState } from "react";
import { Cobranza } from "./cobranza";
import { Copiloto } from "./copiloto";
import { Empresa } from "./empresa";
import { Inventario } from "./inventario";
import { Libros } from "./libros";
import { Operaciones } from "./operaciones";
import { Pulso } from "./pulso";
import { Shell, type ViewId } from "./shell";
import { Vender } from "./vender";

export function ContableApp() {
  const [view, setView] = useState<ViewId>("pulso");
  const [toast, setToast] = useState<string | null>(null);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3800);
  }

  return (
    <Shell view={view} onView={setView}>
      {view === "pulso" && <Pulso onJump={setView} />}
      {view === "vender" && <Vender notify={notify} />}
      {view === "operaciones" && <Operaciones notify={notify} />}
      {view === "inventario" && <Inventario notify={notify} />}
      {view === "cobranza" && <Cobranza notify={notify} />}
      {view === "libros" && <Libros />}
      {view === "copiloto" && <Copiloto onJump={setView} />}
      {view === "empresa" && <Empresa notify={notify} />}
      {toast && (
        <div className="no-print fixed bottom-20 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-sm text-card shadow-lg md:bottom-6" role="status">
          {toast}
        </div>
      )}
    </Shell>
  );
}
