const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(value: number, currency = "COP"): string {
  const code = /^[A-Z]{3}$/.test(currency) ? currency : "COP";
  const key = `es-CO|${code}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    const digits = code === "COP" || code === "CLP" || code === "PYG" ? 0 : 2;
    try {
      fmt = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: code,
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      });
    } catch {
      fmt = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
    }
    formatters.set(key, fmt);
  }
  const n = Number.isFinite(value) ? value : 0;
  return fmt.format(n);
}

export function compactMoney(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${sign}${(a / 1_000_000).toFixed(1)}M`;
  if (a >= 10_000) return `${sign}${Math.round(a / 1000)}k`;
  return `${sign}${Math.round(a)}`;
}

export function parseAmount(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  let n: number;
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) n = Number(s.replace(/\./g, ""));
  else if (/^\d{1,3}(,\d{3})+$/.test(s)) n = Number(s.replace(/,/g, ""));
  else if (s.includes(",") && s.includes(".")) {
    n =
      s.lastIndexOf(",") > s.lastIndexOf(".")
        ? Number(s.replace(/\./g, "").replace(",", "."))
        : Number(s.replace(/,/g, ""));
  } else if (s.includes(",")) n = Number(s.replace(",", "."));
  else n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export const PAYMENT_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  credito: "Crédito",
};

export const TAX_PRESETS: { id: string; label: string; rate: number; regime: string }[] = [
  { id: "co", label: "Colombia · IVA 19%", rate: 0.19, regime: "Responsable de IVA" },
  { id: "mx", label: "México · IVA 16%", rate: 0.16, regime: "Régimen general" },
  { id: "ar", label: "Argentina · IVA 21%", rate: 0.21, regime: "Responsable inscripto" },
  { id: "cl", label: "Chile · IVA 19%", rate: 0.19, regime: "Régimen general" },
  { id: "pe", label: "Perú · IGV 18%", rate: 0.18, regime: "Régimen general" },
  { id: "es", label: "España · IVA 21%", rate: 0.21, regime: "Régimen general" },
  { id: "us", label: "EE.UU. · sin impuesto", rate: 0, regime: "Sales tax no incluido" },
  { id: "cero", label: "Sin impuesto", rate: 0, regime: "No responsable" },
];

export const CURRENCIES = ["COP", "USD", "MXN", "ARS", "CLP", "PEN", "BRL", "EUR", "VES"] as const;

export function representationCode(parts: string): string {
  let h = 2166136261;
  for (let i = 0; i < parts.length; i++) {
    h ^= parts.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
}
