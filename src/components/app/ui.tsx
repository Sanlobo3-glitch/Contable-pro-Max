import { clsx, type ClassValue } from "clsx";
import { X } from "lucide-react";
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { formatMoney } from "@/lib/books/money";
import { useBooks } from "@/lib/books/store";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useMoney() {
  const currency = useBooks((s) => s.books.company.currency);
  return (value: number) => formatMoney(value, currency);
}

const buttonStyles = {
  primary: "bg-copper text-on-copper hover:bg-copper-deep",
  ink: "bg-ink text-card hover:opacity-90",
  ghost: "border border-line bg-card text-ink hover:bg-sand",
  danger: "bg-wine-soft text-wine hover:bg-wine hover:text-on-copper",
  quiet: "text-ink-soft hover:bg-sand",
} as const;

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input
        className={cn("h-11 w-full rounded-xl border border-line bg-card px-3 text-base text-ink outline-none focus:border-copper", className)}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <select
        className="h-11 w-full rounded-xl border border-line bg-card px-3 text-base text-ink outline-none focus:border-copper"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-ink/45 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn("max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-lg")}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-2xl text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full text-ink hover:bg-sand" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Pill({ children, tone = "sand" }: { children: ReactNode; tone?: "sand" | "forest" | "wine" | "copper" }) {
  const tones = {
    sand: "bg-sand text-ink-soft",
    forest: "bg-forest-soft text-forest",
    wine: "bg-wine-soft text-wine",
    copper: "bg-sand text-copper-deep",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-4 py-10 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-pretty text-muted">{text}</p>
    </div>
  );
}
