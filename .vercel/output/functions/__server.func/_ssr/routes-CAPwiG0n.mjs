import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { i as signOut } from "./client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker } from "./server-IIRv8oG_.mjs";
import { a as Sparkles, c as Plus, d as LayoutDashboard, f as Building2, i as Trash2, l as Package, n as Wallet, o as ShoppingBag, p as BookOpen, s as Receipt, u as Minus } from "../_libs/lucide-react.mjs";
import { A as simulate, C as healthReport, D as productIntel, E as openSale, F as useCurrentUser, I as useCurrentUserState, L as useMoney, M as taxFromGross, N as taxOnNet, O as rangeFrom, P as useBooks, S as formatWhen, T as kardexOf, _ as cn, a as Empty, b as fold, c as PAYMENT_LABEL, d as TAX_PRESETS, f as agingPayable, g as cashFlow, h as buildJournal, i as CURRENCIES, j as statement, k as representationCode, l as Pill, m as balanceSheet, n as Acceso, o as Field, p as agingReceivable, r as Button, s as Modal, t as ACCOUNTS, u as Select, v as compactMoney, w as imbalance, x as formatDay, y as dailySeries } from "./use-current-user-O7Ub1g3y.mjs";
import { t as authMiddleware } from "./middleware-ChJJIyFD.mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CAPwiG0n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asBooks(payload) {
	const books = JSON.parse(payload);
	if (books?.version !== 1 || typeof books.company?.name !== "string" || !Array.isArray(books.sales) || !Array.isArray(books.products)) throw new Error("Libros inválidos");
	return books;
}
function asWorkspace(value) {
	if (value === "setup" || value === "live" || value === "sample") return value;
	throw new Error("Espacio inválido");
}
var loadLedger = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2885188afc0d03ea801b01868ed12f0f28716bbeafa088dc57311e9dc27d64ce"));
var saveLedger = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (typeof input?.payload !== "string" || input.payload.length > 2e6) throw new Error("Respaldo demasiado grande");
	const workspace = asWorkspace(input.workspace);
	const books = asBooks(input.payload);
	return {
		payload: JSON.stringify(books),
		workspace
	};
}).handler(createSsrRpc("deadfdef1d4f5d54dbcd4a26c436513d56ccc146390006b42f4c88bb8aab1c31"));
function openingAmount(raw) {
	const s = raw.trim();
	if (!s) return 0;
	const normalized = s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
	const n = Number(normalized);
	if (!Number.isFinite(n) || n < 0) return null;
	return Math.round(n);
}
function Alta() {
	const openLive = useBooks((s) => s.openLive);
	const loadSample = useBooks((s) => s.loadSample);
	const [error, setError] = (0, import_react.useState)("");
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		nit: "",
		address: "",
		city: "",
		phone: "",
		email: "",
		currency: "COP",
		taxRate: .19,
		invoicePrefix: "FE",
		regime: "Responsable de IVA",
		cash: "",
		bank: ""
	});
	function submit(event) {
		event.preventDefault();
		const cash = openingAmount(form.cash);
		const bank = openingAmount(form.bank);
		if (cash == null || bank == null) {
			setError("Revisa caja y banco. Usa solo números, o déjalos vacíos.");
			return;
		}
		const res = openLive(form, {
			cash,
			bank
		});
		if (!res.ok) setError(res.error);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-paper text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid min-h-screen max-w-5xl lg:grid-cols-[0.9fr_1.1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col justify-between bg-ink px-6 py-10 text-card md:px-10 md:py-14",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-12 place-items-center rounded-xl bg-card font-display text-xl text-ink",
						children: "Cp"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-xs font-medium tracking-[0.16em] text-sand uppercase",
						children: "Contable Pro"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 max-w-md text-4xl text-card md:text-5xl",
						children: "Tus libros. No los de una empresa inventada."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-sm text-sm leading-relaxed text-sand",
						children: "Das de alta tu razón social y arrancas en cero. Cada venta, compra y cobro escribe la partida doble, el impuesto y el inventario."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-8 space-y-3 text-sm text-sand",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "1. Empresa, moneda e impuesto" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "2. Productos con precio y existencia" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3. La primera venta ya queda en el diario" })
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-10 text-xs leading-relaxed text-sand",
					children: "Desarrollado por Richard J. Lobo S. Los libros quedan en tu cuenta. Desde Empresa puedes exportar un respaldo."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-3 px-5 py-8 md:px-10 md:py-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
						children: "Alta"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl",
						children: "Abrir una empresa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Razón social",
						value: form.name,
						required: true,
						placeholder: "Panadería Luna S.A.S.",
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "NIT o documento",
						value: form.nit,
						placeholder: "900.000.000-1",
						onChange: (e) => setForm({
							...form,
							nit: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ciudad",
							value: form.city,
							placeholder: "Bogotá",
							onChange: (e) => setForm({
								...form,
								city: e.target.value
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Teléfono",
							value: form.phone,
							onChange: (e) => setForm({
								...form,
								phone: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Dirección",
						value: form.address,
						onChange: (e) => setForm({
							...form,
							address: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Correo",
						type: "email",
						value: form.email,
						onChange: (e) => setForm({
							...form,
							email: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-xs font-medium text-muted",
							children: "Moneda"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: form.currency,
							onChange: (e) => setForm({
								...form,
								currency: e.target.value
							}),
							className: "h-11 w-full rounded-xl border border-line bg-card px-3 text-base",
							children: CURRENCIES.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: code }, code))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-1.5 text-xs font-medium text-muted",
						children: [
							"Impuesto de las próximas operaciones (",
							Math.round(form.taxRate * 100),
							"%)"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: TAX_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setForm({
								...form,
								taxRate: preset.rate,
								regime: preset.regime
							}),
							className: form.regime === preset.regime && form.taxRate === preset.rate ? "min-h-10 rounded-full bg-ink px-3 text-xs text-card" : "min-h-10 rounded-full bg-sand px-3 text-xs text-ink-soft",
							children: preset.label
						}, preset.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Prefijo de comprobante",
							value: form.invoicePrefix,
							onChange: (e) => setForm({
								...form,
								invoicePrefix: e.target.value.toUpperCase()
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Régimen",
							value: form.regime,
							onChange: (e) => setForm({
								...form,
								regime: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Caja al abrir (opcional)",
							inputMode: "decimal",
							value: form.cash,
							placeholder: "0",
							onChange: (e) => setForm({
								...form,
								cash: e.target.value
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Banco al abrir (opcional)",
							inputMode: "decimal",
							value: form.bank,
							placeholder: "0",
							onChange: (e) => setForm({
								...form,
								bank: e.target.value
							})
						})]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-wine",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						children: "Abrir mis libros"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "block min-h-11 w-full text-center text-sm font-medium text-copper-deep",
						onClick: () => {
							if (window.confirm("Entras a Mercado Andino, una empresa ficticia para recorrer el producto. No se mezcla con tus libros.")) loadSample();
						},
						children: "Recorrer una empresa de ejemplo"
					})
				]
			})]
		})
	});
}
var BUCKETS = [
	{
		id: "al_dia",
		label: "Al día"
	},
	{
		id: "d1_30",
		label: "1–30"
	},
	{
		id: "d31_60",
		label: "31–60"
	},
	{
		id: "d61_90",
		label: "61–90"
	},
	{
		id: "d90",
		label: "+90"
	}
];
function Cobranza({ notify }) {
	const books = useBooks((s) => s.books);
	const collect = useBooks((s) => s.collect);
	const pay = useBooks((s) => s.paySupplier);
	const saveParty = useBooks((s) => s.saveParty);
	const [tab, setTab] = (0, import_react.useState)("cobrar");
	const money = useMoney();
	const now = /* @__PURE__ */ new Date();
	const rows = tab === "pagar" ? agingPayable(books, now) : agingReceivable(books, now);
	const total = rows.reduce((s, r) => s + r.open, 0);
	const max = Math.max(1, ...BUCKETS.map((b) => rows.filter((r) => r.bucket === b.id).reduce((s, r) => s + r.open, 0)));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
			children: "Cartera"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 text-4xl",
			children: "Cobranza"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 max-w-xl text-sm text-muted",
			children: "Una venta a crédito no es caja. Aquí se ve quién debe, desde cuándo, y se registra el abono contra el saldo real."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-2",
			children: [
				["cobrar", "Por cobrar"],
				["pagar", "Por pagar"],
				["directorio", "Directorio"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(id),
				className: `min-h-10 rounded-full px-4 text-sm ${tab === id ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
				children: label
			}, id))
		}),
		tab !== "directorio" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-display text-3xl tabular",
				children: money(total)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-5 gap-2",
				children: BUCKETS.map((bucket) => {
					const amount = rows.filter((r) => r.bucket === bucket.id).reduce((s, r) => s + r.open, 0);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-24 items-end rounded-xl bg-sand",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full rounded-xl bg-copper",
								style: { height: `${Math.max(6, amount / max * 100)}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-muted",
							children: bucket.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tabular",
							children: money(amount)
						})
					] }, bucket.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-4 divide-y divide-line rounded-3xl border border-line bg-card px-4",
				children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-8 text-center text-sm text-muted",
					children: "No hay saldos abiertos."
				}), rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center justify-between gap-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: row.party
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							row.number,
							" · vence ",
							formatDay(row.dueAt)
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "tabular font-medium",
								children: money(row.open)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: row.daysLate > 0 ? "wine" : "forest",
								children: row.daysLate > 0 ? `${row.daysLate} días tarde` : "Al día"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								const res = tab === "pagar" ? pay(row.partyId, row.open, "banco") : collect(row.partyId, row.open, "caja");
								notify(res.ok ? "Saldo aplicado" : res.error || "No se pudo");
							},
							children: tab === "pagar" ? "Pagar" : "Cobrar"
						})]
					})]
				}, row.id))]
			})
		] }),
		tab === "directorio" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Directorio, { onCreate: (input) => {
			const res = saveParty(input);
			notify(res.ok ? "Contacto guardado" : res.error || "No se pudo");
			return res.ok;
		} })
	] });
}
function Directorio({ onCreate }) {
	const parties = useBooks((s) => s.books.parties);
	const [kind, setKind] = (0, import_react.useState)("customer");
	const [name, setName] = (0, import_react.useState)("");
	const [document, setDocument] = (0, import_react.useState)("");
	const [terms, setTerms] = (0, import_react.useState)("15");
	const list = parties.filter((p) => p.kind === kind);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 grid gap-4 lg:grid-cols-[280px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3 rounded-3xl border border-line bg-card p-4",
			onSubmit: (event) => {
				event.preventDefault();
				if (onCreate({
					kind,
					name,
					document,
					email: "",
					phone: "",
					address: "",
					termsDays: Number(terms) || 0
				})) {
					setName("");
					setDocument("");
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					label: "Tipo",
					value: kind,
					onChange: (e) => setKind(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "customer",
						children: "Cliente"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "supplier",
						children: "Proveedor"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nombre",
					value: name,
					onChange: (e) => setName(e.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Documento",
					value: document,
					onChange: (e) => setDocument(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Plazo en días",
					value: terms,
					onChange: (e) => setTerms(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					children: "Guardar"
				})
			]
		}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
			title: "Sin contactos",
			text: "Agrega el primero para venderle a crédito."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-line rounded-3xl border border-line bg-card px-4",
			children: list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: p.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						p.document || "Sin documento",
						" · plazo ",
						p.termsDays,
						" días"
					]
				})]
			}, p.id))
		})]
	});
}
var EXAMPLES = [
	"vender 2 café de origen a ana efectivo",
	"vender 1 miel tarjeta",
	"compra 12 panela a alimentos credito",
	"gasto 180000 domicilio del día",
	"cobrar 50000 a ana ríos"
];
function Copiloto({ onJump }) {
	const books = useBooks((s) => s.books);
	const command = useBooks((s) => s.command);
	const money = useMoney();
	const [text, setText] = (0, import_react.useState)("");
	const [log, setLog] = (0, import_react.useState)([]);
	const [price, setPrice] = (0, import_react.useState)(8);
	const [volume, setVolume] = (0, import_react.useState)(-3);
	const now = /* @__PURE__ */ new Date();
	const health = healthReport(books, now);
	const sim = simulate(books, now, price, volume);
	function run(value) {
		const clean = value.trim();
		if (!clean) return;
		const res = command(clean);
		setLog((prev) => [{
			ok: res.ok,
			text: clean,
			reply: res.message
		}, ...prev].slice(0, 8));
		if (res.ok) setText("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 xl:grid-cols-[1fr_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
				children: "En este dispositivo"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-4xl",
				children: "Copiloto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm text-pretty text-muted",
				children: "No inventa cifras. Lee los libros y ejecuta órdenes en español: venta, compra, gasto o abono. Si no entiende, no toca nada."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4",
				onSubmit: (event) => {
					event.preventDefault();
					run(text);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: text,
					onChange: (event) => setText(event.target.value),
					rows: 3,
					placeholder: "vender 2 café de origen a ana efectivo",
					className: "w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-copper"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "mt-2 min-h-11 rounded-xl bg-copper px-4 text-sm font-medium text-on-copper",
					children: "Ejecutar"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: EXAMPLES.map((example) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => run(example),
					className: "min-h-10 rounded-full bg-sand px-3 text-left text-xs text-ink-soft",
					children: example
				}, example))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: log.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-2xl border border-line bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: item.text
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-1 text-sm ${item.ok ? "text-ink" : "text-wine"}`,
						children: item.reply
					})]
				}, `${item.text}-${index}`))
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Lectura de hoy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-3",
						children: health.insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: insight.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: insight.detail
						})] }, insight.title))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onJump("cobranza"),
						className: "mt-3 text-sm font-medium text-copper-deep",
						children: "Ir a cobranza"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Simulador de precio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Qué pasa con el margen de los últimos 30 días si cambias precio y volumen. No altera los libros."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-4 block text-sm",
						children: [
							"Precio ",
							price > 0 ? "+" : "",
							price,
							"%",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -20,
								max: 30,
								value: price,
								onChange: (e) => setPrice(Number(e.target.value)),
								className: "mt-2 w-full accent-copper"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block text-sm",
						children: [
							"Volumen ",
							volume > 0 ? "+" : "",
							volume,
							"%",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -30,
								max: 30,
								value: volume,
								onChange: (e) => setVolume(Number(e.target.value)),
								className: "mt-2 w-full accent-copper"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Venta neta actual" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "tabular",
									children: money(sim.base.ventas)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Venta neta simulada" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "tabular",
									children: money(sim.projectedNet)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Margen actual" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "tabular",
									children: [Math.round(sim.base.margen * 100), "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Margen simulado" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "tabular",
									children: [Math.round(sim.projectedMargin * 100), "%"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `flex justify-between ${sim.delta >= 0 ? "text-forest" : "text-wine"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Utilidad bruta" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "tabular",
									children: [sim.delta >= 0 ? "+" : "", money(sim.delta)]
								})]
							})
						]
					})
				]
			})]
		})]
	});
}
function Empresa({ notify }) {
	const books = useBooks((s) => s.books);
	const workspace = useBooks((s) => s.workspace);
	const patch = useBooks((s) => s.patchCompany);
	const loadSample = useBooks((s) => s.loadSample);
	const beginSetup = useBooks((s) => s.beginSetup);
	const replace = useBooks((s) => s.replaceBooks);
	const [form, setForm] = (0, import_react.useState)(books.company);
	const gap = imbalance(books);
	function save(event) {
		event.preventDefault();
		const res = patch({
			...form,
			taxRate: Number(form.taxRate)
		});
		notify(res.ok ? "Empresa actualizada. Los documentos viejos conservan su impuesto." : res.error || "No se pudo");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-[1.1fr_0.9fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			className: "space-y-3 rounded-3xl border border-line bg-card p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
					children: "Razón social"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-4xl",
					children: "Empresa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Nombre",
					value: form.name,
					onChange: (e) => setForm({
						...form,
						name: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "NIT o documento",
					value: form.nit,
					onChange: (e) => setForm({
						...form,
						nit: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Dirección",
					value: form.address,
					onChange: (e) => setForm({
						...form,
						address: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ciudad",
						value: form.city,
						onChange: (e) => setForm({
							...form,
							city: e.target.value
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Teléfono",
						value: form.phone,
						onChange: (e) => setForm({
							...form,
							phone: e.target.value
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Correo",
					value: form.email,
					onChange: (e) => setForm({
						...form,
						email: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1.5 block text-xs font-medium text-muted",
						children: "Moneda de los libros"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: form.currency,
						onChange: (e) => setForm({
							...form,
							currency: e.target.value
						}),
						className: "h-11 w-full rounded-xl border border-line bg-card px-3 text-base",
						children: CURRENCIES.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: code }, code))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Cambiar la moneda solo cambia el formato. Los montos no se convierten."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mb-1.5 block text-xs font-medium text-muted",
						children: [
							"Impuesto de las próximas operaciones (",
							Math.round(Number(form.taxRate) * 100),
							"%)"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: .27,
						step: .01,
						value: form.taxRate,
						onChange: (e) => setForm({
							...form,
							taxRate: Number(e.target.value)
						}),
						className: "w-full accent-copper"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: TAX_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setForm({
							...form,
							taxRate: preset.rate,
							regime: preset.regime
						}),
						className: "min-h-10 rounded-full bg-sand px-3 text-xs text-ink-soft",
						children: preset.label
					}, preset.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Régimen",
					value: form.regime,
					onChange: (e) => setForm({
						...form,
						regime: e.target.value
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Prefijo de comprobante",
					value: form.invoicePrefix,
					onChange: (e) => setForm({
						...form,
						invoicePrefix: e.target.value.toUpperCase()
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Guardar empresa"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Respaldo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							workspace === "sample" ? "Estás recorriendo la empresa de ejemplo. Créala tuya antes de registrar clientes reales." : "Estos libros son de tu empresa y se guardan en tu cuenta.",
							" ",
							Math.abs(gap) < 1 ? "Están cuadrados." : `Hay un descuadre de ${gap}.`,
							" Exporta una copia antes de cambiar de equipo."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								const blob = new Blob([JSON.stringify(books, null, 2)], { type: "application/json" });
								const url = URL.createObjectURL(blob);
								const a = document.createElement("a");
								a.href = url;
								a.download = `${books.company.name || "contable-pro"}-libros.json`.replace(/\s+/g, "-").toLowerCase();
								a.click();
								URL.revokeObjectURL(url);
							},
							children: "Exportar respaldo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-card px-4 text-sm font-medium",
							children: ["Importar respaldo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "application/json",
								className: "sr-only",
								onChange: async (event) => {
									const file = event.target.files?.[0];
									event.target.value = "";
									if (!file) return;
									try {
										const data = JSON.parse(await file.text());
										if (data.version !== 1 || !data.company?.name || !Array.isArray(data.sales)) throw new Error("formato");
										replace(data);
										setForm(data.company);
										notify("Libros de tu empresa restaurados");
									} catch {
										notify("Ese archivo no es un respaldo de Contable Pro");
									}
								}
							})]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Empresa"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Cerrar vuelve al alta, en blanco. El ejemplo de Mercado Andino es aparte y no se mezcla con tus comprobantes."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => {
								if (window.confirm("¿Cerrar esta empresa y abrir otra? Se pierde lo que no hayas exportado.")) beginSetup();
							},
							children: "Nueva empresa"
						}), workspace !== "sample" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								if (window.confirm("¿Cargar Mercado Andino? Reemplaza los libros actuales por la empresa de ejemplo.")) loadSample();
							},
							children: "Ver empresa de ejemplo"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-xs leading-relaxed text-muted",
						children: "Contable Pro · desarrollado por Richard J. Lobo S. El comprobante es una representación interna. No sustituye la factura electrónica de la DIAN ni de otra autoridad fiscal."
					})
				]
			})]
		})]
	});
}
function Inventario({ notify }) {
	const books = useBooks((s) => s.books);
	const save = useBooks((s) => s.saveProduct);
	const saveCategory = useBooks((s) => s.saveCategory);
	const adjust = useBooks((s) => s.adjust);
	const buy = useBooks((s) => s.buy);
	const money = useMoney();
	const intel = (0, import_react.useMemo)(() => productIntel(books), [books]);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [focus, setFocus] = (0, import_react.useState)(null);
	const [cat, setCat] = (0, import_react.useState)("");
	const [supplierId, setSupplierId] = (0, import_react.useState)(books.parties.find((p) => p.kind === "supplier")?.id ?? "");
	const [buyQty, setBuyQty] = (0, import_react.useState)("12");
	const suppliers = books.parties.filter((p) => p.kind === "supplier");
	const focused = intel.find((i) => i.product.id === focus);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
					children: "Existencias"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-4xl",
					children: "Inventario"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Clase ABC por margen de 30 días. La reposición usa el ritmo real, no una corazonada."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => setEditing({
					unit: "und",
					minStock: 5,
					price: 0,
					cost: 0,
					categoryId: books.categories[0]?.id
				}),
				children: "Nuevo producto"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: cat,
				onChange: (e) => setCat(e.target.value),
				placeholder: "Nueva categoría",
				className: "h-11 flex-1 rounded-xl border border-line bg-card px-3 text-base"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => {
					const res = saveCategory(cat);
					notify(res.ok ? "Categoría creada" : res.error || "No se pudo");
					if (res.ok) setCat("");
				},
				children: "Añadir"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 overflow-x-auto rounded-3xl border border-line bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[720px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-left text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
						"Producto",
						"Stock",
						"Precio",
						"Margen 30d",
						"Cobertura",
						"ABC",
						""
					].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-4 py-3 font-medium",
						children: h
					}, h)) })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [intel.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 7,
					className: "px-4 py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						title: "Sin productos",
						text: "Crea el primero con precio de venta y costo. Después compra o ajusta la existencia para poder vender."
					})
				}) }), intel.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "text-left",
								onClick: () => setFocus(row.product.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: row.product.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs text-muted",
									children: row.product.sku
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 tabular",
							children: [
								row.product.stock,
								" ",
								row.product.unit
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 tabular",
							children: money(row.product.price)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 tabular",
							children: money(row.margin)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4",
							children: row.coverDays == null ? "Sin ritmo" : `${Math.round(row.coverDays)} días`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: row.abc === "A" ? "forest" : row.abc === "B" ? "copper" : "sand",
								children: row.abc
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-sm font-medium text-copper-deep",
								onClick: () => setEditing(row.product),
								children: "Editar"
							})
						})
					]
				}, row.product.id))] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: !!editing,
			title: editing?.id ? "Editar producto" : "Nuevo producto",
			onClose: () => setEditing(null),
			children: editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					const res = save({
						id: editing.id,
						sku: editing.sku || "",
						name: editing.name || "",
						categoryId: editing.categoryId || books.categories[0]?.id || "",
						price: Number(editing.price) || 0,
						cost: Number(editing.cost) || 0,
						minStock: Number(editing.minStock) || 0,
						unit: editing.unit || "und"
					});
					notify(res.ok ? "Producto guardado. El stock entra por compras o ajustes." : res.error || "No se pudo");
					if (res.ok) setEditing(null);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nombre",
						value: editing.name || "",
						onChange: (e) => setEditing({
							...editing,
							name: e.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "SKU",
						value: editing.sku || "",
						onChange: (e) => setEditing({
							...editing,
							sku: e.target.value
						}),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						label: "Categoría",
						value: editing.categoryId || "",
						onChange: (e) => setEditing({
							...editing,
							categoryId: e.target.value
						}),
						children: books.categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Precio con impuesto",
								inputMode: "numeric",
								value: editing.price ?? "",
								onChange: (e) => setEditing({
									...editing,
									price: Number(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Costo sin impuesto",
								inputMode: "numeric",
								value: editing.cost ?? "",
								onChange: (e) => setEditing({
									...editing,
									cost: Number(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Mínimo",
								inputMode: "numeric",
								value: editing.minStock ?? "",
								onChange: (e) => setEditing({
									...editing,
									minStock: Number(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Unidad",
								value: editing.unit || "und",
								onChange: (e) => setEditing({
									...editing,
									unit: e.target.value
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						children: "Guardar"
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
			open: !!focused,
			title: focused?.product.name || "Producto",
			onClose: () => setFocus(null),
			wide: true,
			children: focused && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Stock ",
							focused.product.stock,
							". Ritmo ",
							focused.velocity.toFixed(2),
							" al día.",
							focused.reorder > 0 ? ` Conviene comprar ${focused.reorder}.` : " No hace falta reponer."
						]
					}),
					focused.reorder > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2 sm:grid-cols-[1fr_100px_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
								label: "Proveedor",
								value: supplierId,
								onChange: (e) => setSupplierId(e.target.value),
								children: suppliers.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: s.id,
									children: s.name
								}, s.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Cantidad",
								value: buyQty,
								onChange: (e) => setBuyQty(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:pt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => {
										const res = buy({
											supplierId,
											payment: "credito",
											lines: [{
												productId: focused.product.id,
												qty: Number(buyQty) || focused.reorder
											}]
										});
										notify(res.ok ? `${res.number} a crédito` : res.error);
										if (res.ok) setFocus(null);
									},
									children: "Comprar"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-wrap items-end gap-2",
						onSubmit: (event) => {
							event.preventDefault();
							const data = new FormData(event.currentTarget);
							const res = adjust(focused.product.id, Number(data.get("delta")), String(data.get("memo") || ""));
							notify(res.ok ? "Ajuste en el diario" : res.error || "No se pudo");
							if (res.ok) setFocus(null);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								name: "delta",
								label: "Ajuste (+ entra, − sale)",
								defaultValue: "-1",
								className: "w-36"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								name: "memo",
								label: "Motivo",
								defaultValue: "Conteo físico",
								className: "min-w-40 flex-1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "ghost",
								children: "Ajustar"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xl",
						children: "Kardex"
					}), kardexOf(books, focused.product.id).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						title: "Sin movimientos",
						text: "Este producto todavía no entra al kardex."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 divide-y divide-line text-sm",
						children: kardexOf(books, focused.product.id).slice(-12).map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								row.label,
								" · ",
								row.ref,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs text-muted",
									children: formatWhen(row.at)
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular",
								children: [
									row.qty > 0 ? "+" : "",
									row.qty,
									" → ",
									row.balance
								]
							})]
						}, `${row.ref}-${index}`))
					})] })
				]
			})
		})
	] });
}
function Libros() {
	const books = useBooks((s) => s.books);
	const money = useMoney();
	const [period, setPeriod] = (0, import_react.useState)("30d");
	const [tab, setTab] = (0, import_react.useState)("diario");
	const range = rangeFrom(/* @__PURE__ */ new Date(), period);
	const journal = buildJournal(books).filter((e) => {
		const t = new Date(e.at).getTime();
		if (range.from && t < new Date(range.from).getTime()) return false;
		if (range.to && t >= new Date(range.to).getTime()) return false;
		return true;
	});
	const pnl = statement(books, range.from, range.to);
	const sheet = balanceSheet(books, range.to);
	const flow = cashFlow(books, range.from, range.to);
	const gap = sheet.assetTotal - sheet.liabilityTotal - sheet.equityTotal;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
					children: "Contabilidad"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-4xl",
					children: "Libros"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "El diario no se digita: nace de ventas, compras, abonos y gastos. El balance tiene que cuadrar solo."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => window.print(),
				className: "no-print min-h-11 rounded-xl border border-line bg-card px-4 text-sm font-medium",
				children: "Imprimir"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "no-print mt-4 flex gap-2 overflow-x-auto",
			children: [
				["7d", "7 días"],
				["30d", "30 días"],
				["mes", "Este mes"],
				["anio", "Año"],
				["todo", "Todo"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setPeriod(id),
				className: `min-h-10 shrink-0 rounded-full px-4 text-sm ${period === id ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "no-print mt-3 flex gap-2 overflow-x-auto",
			children: [
				["diario", "Diario"],
				["resultados", "Resultados"],
				["balance", "Balance"],
				["flujo", "Flujo de caja"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(id),
				className: `min-h-10 shrink-0 rounded-full px-4 text-sm ${tab === id ? "bg-copper text-on-copper" : "bg-card text-ink-soft border border-line"}`,
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "mt-4 rounded-3xl border border-line bg-card p-4 md:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: books.company.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							"NIT ",
							books.company.nit,
							" · ",
							books.company.city
						]
					})]
				}),
				tab === "diario" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-4",
					children: [journal.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "Sin asientos en este periodo."
					}), journal.slice().reverse().slice(0, 60).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								entry.ref,
								" · ",
								entry.memo
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: formatWhen(entry.at)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
						className: "mt-1 w-full text-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: entry.lines.map((line, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-0.5 text-ink-soft",
								children: ACCOUNTS[line.account]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "w-28 text-right tabular",
								children: line.debit ? money(line.debit) : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "w-28 text-right tabular",
								children: line.credit ? money(line.credit) : ""
							})
						] }, `${entry.id}-${index}`)) })
					})] }, entry.id))]
				}),
				tab === "resultados" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mx-auto max-w-md space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Ingresos por ventas",
							v: money(pnl.ventas)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Costo de ventas",
							v: money(-pnl.costo)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Utilidad bruta",
							v: money(pnl.bruto),
							strong: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Otros ingresos",
							v: money(pnl.otros)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Gastos operativos",
							v: money(-pnl.gastos)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Resultado",
							v: money(pnl.resultado),
							strong: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "pt-2 text-xs text-muted",
							children: [
								"Margen bruto ",
								Math.round(pnl.margen * 100),
								"%. El impuesto no es gasto: vive en el balance."
							]
						})
					]
				}),
				tab === "balance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, {
						title: "Activo",
						rows: sheet.assets.map((a) => [a.label, money(a.amount)]),
						total: money(sheet.assetTotal)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, {
							title: "Pasivo",
							rows: sheet.liabilities.map((a) => [a.label, money(a.amount)]),
							total: money(sheet.liabilityTotal)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Column, {
								title: "Patrimonio",
								rows: sheet.equity.map((a) => [a.label, money(a.amount)]),
								total: money(sheet.equityTotal)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-3 text-xs ${Math.abs(gap) > 1 ? "text-wine" : "text-forest"}`,
							children: Math.abs(gap) > 1 ? `Descuadre ${money(gap)}` : "Activo = pasivo + patrimonio"
						})
					] })]
				}),
				tab === "flujo" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mx-auto max-w-md space-y-2 text-sm",
					children: [
						flow.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: row.label,
							v: money(row.amount)
						}, row.label)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							k: "Variación de caja y bancos",
							v: money(flow.net),
							strong: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pt-2 text-xs text-muted",
							children: "Método directo, solo efectivo. La venta a crédito aparece cuando se cobra, no cuando se factura."
						})
					]
				})
			]
		})
	] });
}
function Line({ k, v, strong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex justify-between gap-4 border-t border-line py-2 ${strong ? "font-medium" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "tabular",
			children: v
		})]
	});
}
function Column({ title, rows, total }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "text-2xl",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "mt-2 text-sm",
		children: [rows.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex justify-between border-t border-line py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular",
				children: v
			})]
		}, k)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex justify-between border-t border-line py-2 font-medium",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular",
				children: total
			})]
		})]
	})] });
}
function Operaciones({ notify }) {
	const books = useBooks((s) => s.books);
	const [tab, setTab] = (0, import_react.useState)("ventas");
	const [sale, setSale] = (0, import_react.useState)(null);
	const [buying, setBuying] = (0, import_react.useState)(false);
	const [quoting, setQuoting] = (0, import_react.useState)(false);
	const money = useMoney();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
			children: "Documentos"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl",
				children: "Operaciones"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [tab === "compras" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setBuying(true),
					children: "Nueva compra"
				}), tab === "cotizaciones" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setQuoting(true),
					children: "Nueva cotización"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex gap-2 overflow-x-auto",
			children: [
				["ventas", "Ventas"],
				["compras", "Compras"],
				["cotizaciones", "Cotizaciones"],
				["gastos", "Gastos"]
			].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(id),
				className: `min-h-10 shrink-0 rounded-full px-4 text-sm ${tab === id ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
				children: label
			}, id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [
				tab === "ventas" && (books.sales.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "Sin ventas",
					text: "La primera venta puede salir de la caja rápida o de una orden en la barra."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-line rounded-3xl border border-line bg-card px-4",
					children: books.sales.slice(0, 40).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSale(item),
						className: "flex w-full items-center justify-between gap-3 py-3 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-medium",
								children: [
									item.number,
									" · ",
									item.customerName
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									formatWhen(item.at),
									" · ",
									PAYMENT_LABEL[item.payment]
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "tabular font-medium",
								children: money(item.gross)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: item.status === "anulada" ? "wine" : openSale(item) > 0 ? "copper" : "forest",
								children: item.status === "anulada" ? "Anulada" : openSale(item) > 0 ? "Por cobrar" : "Cerrada"
							})]
						})]
					}) }, item.id))
				})),
				tab === "compras" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurchaseList, { onNotify: notify }),
				tab === "cotizaciones" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteList, { onNotify: notify }),
				tab === "gastos" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expenses, { onNotify: notify })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaleSheet, {
			sale,
			onClose: () => setSale(null),
			notify
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurchaseForm, {
			open: buying,
			onClose: () => setBuying(false),
			notify
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteForm, {
			open: quoting,
			onClose: () => setQuoting(false),
			notify
		})
	] });
}
function PurchaseList({ onNotify }) {
	const books = useBooks((s) => s.books);
	const voidPurchase = useBooks((s) => s.voidPurchase);
	const money = useMoney();
	if (books.purchases.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "Sin compras",
		text: "Reponer inventario crea la cuenta por pagar o sale de caja, con IVA descontable."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y divide-line rounded-3xl border border-line bg-card px-4",
		children: books.purchases.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center justify-between gap-3 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-medium",
				children: [
					item.number,
					" · ",
					item.supplierName
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					formatWhen(item.at),
					" · ",
					item.payment === "credito" ? "Crédito" : "Contado"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-right",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tabular font-medium",
						children: money(item.gross)
					}),
					item.status === "recibida" && item.paid === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs font-medium text-wine",
						onClick: () => {
							const res = voidPurchase(item.id);
							onNotify(res.ok ? `${item.number} anulada` : res.error || "No se pudo anular");
						},
						children: "Anular"
					}),
					item.status === "anulada" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: "wine",
						children: "Anulada"
					})
				]
			})]
		}, item.id))
	});
}
function QuoteList({ onNotify }) {
	const books = useBooks((s) => s.books);
	const accept = useBooks((s) => s.acceptQuote);
	const reject = useBooks((s) => s.rejectQuote);
	const money = useMoney();
	const [pay, setPay] = (0, import_react.useState)("efectivo");
	if (books.quotes.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "Sin cotizaciones",
		text: "Una cotización no mueve inventario hasta que el cliente acepta."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-3",
		children: books.quotes.map((quote) => {
			const expired = quote.status === "enviada" && new Date(quote.validUntil) < /* @__PURE__ */ new Date();
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-3xl border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								quote.number,
								" · ",
								quote.customerName
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: ["Vence ", formatWhen(quote.validUntil)]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "tabular font-medium",
							children: money(quote.gross)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: quote.lines.map((l) => `${l.qty} ${l.name}`).join(" · ")
					}),
					quote.status === "enviada" && !expired ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: pay,
								onChange: (e) => setPay(e.target.value),
								className: "h-11 rounded-xl border border-line bg-card px-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "efectivo",
										children: "Efectivo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "transferencia",
										children: "Transferencia"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "tarjeta",
										children: "Tarjeta"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "credito",
										children: "Crédito"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => {
									const res = accept(quote.id, pay);
									onNotify(res.ok ? `${quote.number} convertida en venta` : res.error || "No se pudo");
								},
								children: "Convertir en venta"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => reject(quote.id),
								children: "Rechazar"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: quote.status === "aceptada" ? "forest" : "sand",
							children: expired ? "Vencida" : quote.status
						})
					})
				]
			}, quote.id);
		})
	});
}
function Expenses({ onNotify }) {
	const books = useBooks((s) => s.books);
	const expense = useBooks((s) => s.expense);
	const money = useMoney();
	const [amount, setAmount] = (0, import_react.useState)("");
	const [memo, setMemo] = (0, import_react.useState)("");
	const [via, setVia] = (0, import_react.useState)("caja");
	const rows = books.moves.filter((m) => m.kind === "gasto" || m.kind === "ingreso");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[280px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-3 rounded-3xl border border-line bg-card p-4",
			onSubmit: (event) => {
				event.preventDefault();
				const value = Number(amount.replace(/\./g, ""));
				const res = expense(value, memo, via);
				if (!res.ok) onNotify(res.error || "No se pudo");
				else {
					onNotify("Gasto registrado en el diario");
					setAmount("");
					setMemo("");
				}
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Salida de caja"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Monto",
					inputMode: "numeric",
					value: amount,
					onChange: (e) => setAmount(e.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Concepto",
					value: memo,
					onChange: (e) => setMemo(e.target.value),
					placeholder: "Arriendo, nómina, domicilio",
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					label: "Sale de",
					value: via,
					onChange: (e) => setVia(e.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "caja",
						children: "Caja"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "banco",
						children: "Bancos"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "w-full",
					children: "Registrar gasto"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-line rounded-3xl border border-line bg-card px-4",
			children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: row.memo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						formatWhen(row.at),
						" · ",
						row.via
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `tabular font-medium ${row.kind === "gasto" ? "text-wine" : "text-forest"}`,
					children: [row.kind === "gasto" ? "−" : "+", money(row.amount)]
				})]
			}, row.id))
		})]
	});
}
function SaleSheet({ sale, onClose, notify }) {
	const books = useBooks((s) => s.books);
	const voidSale = useBooks((s) => s.voidSale);
	const ret = useBooks((s) => s.ret);
	const money = useMoney();
	const [qty, setQty] = (0, import_react.useState)({});
	if (!sale) return null;
	const code = representationCode(`${books.company.nit}|${sale.number}|${sale.gross}`);
	const returned = /* @__PURE__ */ new Map();
	for (const doc of books.returns.filter((r) => r.saleId === sale.id)) for (const line of doc.lines) returned.set(line.productId, (returned.get(line.productId) ?? 0) + line.qty);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		open: !!sale,
		title: sale.number,
		onClose,
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: books.company.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"NIT ",
							books.company.nit,
							" · ",
							books.company.regime
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-medium",
						children: sale.customerName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							formatWhen(sale.at),
							" · ",
							PAYMENT_LABEL[sale.payment]
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { code })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "mt-4 w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-left text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 font-medium",
							children: "Producto"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Cant." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-right",
							children: "Total"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: sale.lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2",
							children: line.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "tabular",
							children: line.qty
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "text-right tabular",
							children: money(line.gross)
						})
					]
				}, line.productId)) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 space-y-1 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Base" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular",
							children: money(sale.net)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Impuesto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular",
							children: money(sale.tax)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular",
							children: money(sale.gross)
						})]
					}),
					openSale(sale) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-wine",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Saldo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "tabular",
							children: money(openSale(sale))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted",
				children: [
					"Código de representación ",
					code,
					". Borrador gráfico: no es factura electrónica DIAN ni documento fiscal."
				]
			}),
			sale.status === "emitida" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3 border-t border-line pt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Devolver"
					}),
					sale.lines.map((line) => {
						const left = line.qty - (returned.get(line.productId) ?? 0);
						if (left <= 0) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								line.name,
								" · máx ",
								left
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								inputMode: "numeric",
								value: qty[line.productId] ?? "",
								onChange: (e) => setQty((prev) => ({
									...prev,
									[line.productId]: e.target.value
								})),
								className: "h-11 w-24 rounded-xl border border-line px-3 text-base"
							})]
						}, line.productId);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => {
								const lines = sale.lines.map((line) => ({
									productId: line.productId,
									qty: Number(qty[line.productId] || 0)
								})).filter((line) => line.qty > 0);
								const res = ret(sale.id, lines);
								notify(res.ok ? "Devolución registrada" : res.error || "No se pudo");
								if (res.ok) onClose();
							},
							children: "Registrar devolución"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => {
								const res = voidSale(sale.id);
								notify(res.ok ? "Venta anulada" : res.error || "No se pudo anular");
								if (res.ok) onClose();
							},
							children: "Anular venta"
						})]
					})
				]
			})
		]
	});
}
function Mark({ code }) {
	const bits = code.split("").map((char) => Number.parseInt(char, 16));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-8 gap-0.5",
		"aria-hidden": true,
		children: Array.from({ length: 64 }, (_, i) => {
			const on = (bits[i % bits.length] ?? 0) >> i % 4 & 1;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: on ? "size-2 bg-ink" : "size-2 bg-sand" }, i);
		})
	});
}
function LineEditor({ mode, onClose, onSave }) {
	const books = useBooks((s) => s.books);
	const [productId, setProductId] = (0, import_react.useState)(books.products[0]?.id ?? "");
	const [qty, setQty] = (0, import_react.useState)("1");
	const [lines, setLines] = (0, import_react.useState)([]);
	const [partyId, setPartyId] = (0, import_react.useState)("");
	const [payment, setPayment] = (0, import_react.useState)("efectivo");
	const parties = books.parties.filter((p) => mode === "compra" ? p.kind === "supplier" : p.kind === "customer");
	const money = useMoney();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				label: mode === "compra" ? "Proveedor" : "Cliente",
				value: partyId,
				onChange: (e) => setPartyId(e.target.value),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: mode === "compra" ? "Elige proveedor" : "Mostrador"
				}), parties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: p.id,
					children: p.name
				}, p.id))]
			}),
			mode === "compra" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPayment("efectivo"),
					className: `min-h-11 rounded-xl text-sm ${payment === "efectivo" ? "bg-ink text-card" : "bg-sand"}`,
					children: "Contado"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPayment("credito"),
					className: `min-h-11 rounded-xl text-sm ${payment === "credito" ? "bg-ink text-card" : "bg-sand"}`,
					children: "Crédito"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: productId,
						onChange: (e) => setProductId(e.target.value),
						className: "h-11 min-w-0 flex-1 rounded-xl border border-line px-3 text-sm",
						children: books.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: qty,
						onChange: (e) => setQty(e.target.value),
						className: "h-11 w-20 rounded-xl border border-line px-3 text-base"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => {
							const product = books.products.find((p) => p.id === productId);
							const n = Number(qty);
							if (!product || !(n > 0)) return;
							setLines((prev) => [...prev, {
								productId,
								qty: n,
								unitNet: mode === "compra" ? product.cost : void 0
							}]);
						},
						children: "Añadir"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "text-sm",
				children: lines.map((line, index) => {
					const product = books.products.find((p) => p.id === line.productId);
					const gross = mode === "compra" ? taxOnNet(Math.round((line.unitNet ?? 0) * line.qty), books.company.taxRate).gross : taxFromGross(Math.round((product?.price ?? 0) * line.qty), books.company.taxRate).net + taxFromGross(Math.round((product?.price ?? 0) * line.qty), books.company.taxRate).tax;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between border-t border-line py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							line.qty,
							" ",
							product?.name
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular",
							children: money(gross)
						})]
					}, `${line.productId}-${index}`);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: onClose,
					children: "Cancelar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: lines.length === 0 || mode === "compra" && !partyId,
					onClick: () => onSave(lines, {
						partyId,
						payment
					}),
					children: "Guardar"
				})]
			})
		]
	});
}
function PurchaseForm({ open, onClose, notify }) {
	const buy = useBooks((s) => s.buy);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		title: "Compra",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineEditor, {
			mode: "compra",
			onClose,
			onSave: (lines, extra) => {
				const res = buy({
					supplierId: extra.partyId,
					payment: extra.payment,
					lines
				});
				notify(res.ok ? `${res.number} recibida. Stock y libros actualizados.` : res.error);
				if (res.ok) onClose();
			}
		})
	});
}
function QuoteForm({ open, onClose, notify }) {
	const quote = useBooks((s) => s.quote);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		title: "Cotización",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineEditor, {
			mode: "cotizacion",
			onClose,
			onSave: (lines, extra) => {
				const res = quote({
					customerId: extra.partyId || null,
					validDays: 15,
					lines
				});
				notify(res.ok ? `${res.number} enviada. Aún no mueve stock.` : res.error);
				if (res.ok) onClose();
			}
		})
	});
}
function Pulso({ onJump }) {
	const books = useBooks((s) => s.books);
	const workspace = useBooks((s) => s.workspace);
	const money = useMoney();
	const now = /* @__PURE__ */ new Date();
	const range = rangeFrom(now, "30d");
	const health = healthReport(books, now);
	const pnl = statement(books, range.from, range.to);
	const sheet = balanceSheet(books);
	const series = dailySeries(books, now, 14);
	const ar = sheet.assets.find((a) => a.id === "cxc")?.amount ?? 0;
	const fresh = workspace === "live" && books.sales.length === 0 && books.purchases.length === 0;
	const parts = [
		["Liquidez", health.liquidity],
		["Margen", health.margin],
		["Cobranza", health.collections],
		["Inventario", health.inventory]
	];
	const steps = [
		{
			done: books.products.length > 0,
			title: "Carga el catálogo",
			detail: "Precio, costo y unidad. Sin producto no hay venta.",
			go: "inventario",
			cta: "Ir a inventario"
		},
		{
			done: books.products.some((p) => p.stock > 0),
			title: "Pon existencia",
			detail: "Compra a un proveedor o ajusta el stock inicial.",
			go: "inventario",
			cta: "Registrar stock"
		},
		{
			done: books.parties.some((p) => p.kind === "customer"),
			title: "Cliente, si vendes a crédito",
			detail: "El mostrador no exige cliente. El crédito sí.",
			go: "cobranza",
			cta: "Añadir cliente"
		},
		{
			done: false,
			title: "Primera venta",
			detail: "El diario, el impuesto y el costo se escriben solos.",
			go: "vender",
			cta: "Abrir caja"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
						children: "Pulso"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-4xl text-ink",
						children: fresh ? "Empresa abierta. Aún sin movimiento." : "Cómo está el negocio hoy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 max-w-xl text-sm text-pretty text-muted",
						children: [
							books.company.name,
							books.company.city ? ` · ${books.company.city}` : "",
							". ",
							fresh ? "Los libros están en cero hasta que registres la operación real." : "Cada venta ya dejó su asiento, su impuesto y su costo."
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onJump("vender"),
					className: "min-h-11 rounded-xl bg-copper px-4 text-sm font-medium text-on-copper",
					children: "Nueva venta"
				})]
			}),
			fresh && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-3xl border border-line bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Para empezar a operar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 grid gap-3 md:grid-cols-2",
					children: steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl bg-paper px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-muted",
								children: step.done ? "Listo" : `Paso ${index + 1}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-medium",
								children: step.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: step.detail
							}),
							!step.done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onJump(step.go),
								className: "mt-2 min-h-10 text-sm font-medium text-copper-deep",
								children: step.cta
							})
						]
					}, step.title))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[220px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl bg-ink p-5 text-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-[0.14em] text-sand uppercase",
						children: "Salud"
					}), fresh ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-4xl leading-none",
						children: "Aún no"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-sand",
						children: "El puntaje sale de ventas, caja y cartera reales. En cero no hay nada que calificar."
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-6xl tabular leading-none",
							children: health.score
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-sand",
							children: "de 100, con los libros de los últimos 30 días"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2",
							children: parts.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sand",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular",
									children: [value, "/25"]
								})]
							}, label))
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Caja y bancos",
							value: money(health.cash),
							hint: health.runwayDays == null ? "Sin gastos recientes" : `Cubre ${Math.round(health.runwayDays)} días de gastos`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Ventas netas 30d",
							value: money(pnl.ventas),
							hint: `Margen ${Math.round(pnl.margen * 100)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Resultado 30d",
							value: money(pnl.resultado),
							hint: "Después de costo y gastos",
							warn: pnl.resultado < 0
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Por cobrar",
							value: money(ar),
							hint: "Saldo de crédito vivo"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 xl:grid-cols-[1.4fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-line bg-card p-4 md:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: "14 días de venta neta"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Verde venta · cobre costo"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56 min-w-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: series,
								margin: {
									top: 8,
									right: 8,
									left: 0,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--color-line)",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tick: {
											fill: "var(--color-muted)",
											fontSize: 11
										},
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tickFormatter: compactMoney,
										width: 42,
										tick: {
											fill: "var(--color-muted)",
											fontSize: 11
										},
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										formatter: (value, name) => [money(Number(value ?? 0)), name === "net" ? "Venta neta" : "Costo"],
										contentStyle: {
											background: "var(--color-card)",
											border: "1px solid var(--color-line)",
											borderRadius: 12
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "net",
										stroke: "var(--color-forest)",
										fill: "var(--color-forest)",
										fillOpacity: .16,
										strokeWidth: 2
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "cost",
										stroke: "var(--color-copper)",
										fill: "var(--color-copper)",
										fillOpacity: .08,
										strokeWidth: 2
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl border border-line bg-card p-4 md:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: "Lo que el libro está diciendo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-3 space-y-3",
							children: [health.insights.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rounded-2xl bg-paper px-3 py-3 text-sm text-muted",
								children: fresh ? "Cuando haya ventas, aquí aparecen quiebres de stock, cartera vencida y margen." : "Nada urgente en los libros de este periodo."
							}), health.insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-2xl bg-paper px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: insight.tone === "alert" ? "font-medium text-wine" : insight.tone === "good" ? "font-medium text-forest" : "font-medium text-ink",
									children: insight.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-pretty text-muted",
									children: insight.detail
								})]
							}, insight.title))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onJump("copiloto"),
							className: "mt-4 text-sm font-medium text-copper-deep",
							children: "Hablar con el copiloto"
						})
					]
				})]
			})
		]
	});
}
function Metric({ label, value, hint, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-3xl border border-line bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-2 font-display text-3xl tabular leading-none ${warn ? "text-wine" : "text-ink"}`,
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted",
				children: hint
			})
		]
	});
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var NAV = [
	{
		id: "pulso",
		label: "Pulso",
		group: "Operar",
		icon: LayoutDashboard
	},
	{
		id: "vender",
		label: "Vender",
		group: "Operar",
		icon: ShoppingBag
	},
	{
		id: "operaciones",
		label: "Operaciones",
		group: "Operar",
		icon: Receipt
	},
	{
		id: "inventario",
		label: "Inventario",
		group: "Control",
		icon: Package
	},
	{
		id: "cobranza",
		label: "Cobranza",
		group: "Control",
		icon: Wallet
	},
	{
		id: "libros",
		label: "Libros",
		group: "Control",
		icon: BookOpen
	},
	{
		id: "copiloto",
		label: "Copiloto",
		group: "Criterio",
		icon: Sparkles
	},
	{
		id: "empresa",
		label: "Empresa",
		group: "Criterio",
		icon: Building2
	}
];
function Shell({ view, onView, children }) {
	const command = useBooks((s) => s.command);
	const company = useBooks((s) => s.books.company.name);
	const workspace = useBooks((s) => s.workspace);
	const cloud = useBooks((s) => s.cloud);
	const beginSetup = useBooks((s) => s.beginSetup);
	const cloudLabel = cloud === "saving" ? "Guardando en tu cuenta…" : cloud === "saved" ? "Guardado en tu cuenta" : cloud === "error" ? "No se pudo guardar en la cuenta" : "En tu cuenta";
	const [text, setText] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)(null);
	const [more, setMore] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!note) return;
		const timer = window.setTimeout(() => setNote(null), 4200);
		return () => window.clearTimeout(timer);
	}, [note]);
	function submit(value) {
		const clean = value.trim();
		if (!clean) return;
		const res = command(clean);
		setNote(res.message);
		if (res.ok) setText("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex min-h-screen max-w-[1440px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-card md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-5 pb-4 pt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 place-items-center rounded-xl bg-ink font-display text-lg text-card",
									children: "Cp"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-lg leading-none",
									children: "Contable Pro"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: "Libros que se escriben solos"
								})] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "flex-1 space-y-5 overflow-y-auto px-3 pb-4",
							children: [
								"Operar",
								"Control",
								"Criterio"
							].map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 pb-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase",
								children: group
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-1",
								children: NAV.filter((item) => item.group === group).map((item) => {
									const Icon = item.icon;
									const active = view === item.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onView(item.id),
										className: cn("flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium", active ? "bg-ink text-card" : "text-ink-soft hover:bg-sand"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
									}, item.id);
								})
							})] }, group))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-line px-5 py-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: company || "Sin empresa"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: workspace === "sample" ? "Empresa de ejemplo" : cloudLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-[11px] leading-relaxed text-muted",
									children: ["Desarrollado por ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-ink-soft",
										children: "Richard J. Lobo S."
									})]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "no-print sticky top-0 z-20 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:px-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 md:hidden",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex min-w-0 items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid size-9 place-items-center rounded-lg bg-ink font-display text-card",
										children: "Cp"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-lg leading-none",
											children: "Contable Pro"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs text-muted",
											children: company
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 md:mt-0",
								onSubmit: (event) => {
									event.preventDefault();
									submit(text);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "sr-only",
									htmlFor: "orden",
									children: "Orden en español"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "orden",
									value: text,
									onChange: (event) => setText(event.target.value),
									placeholder: "Ordena en español: gastar 85000 en arriendo por banco",
									className: "h-12 w-full rounded-2xl border border-line bg-card px-4 text-base text-ink outline-none placeholder:text-muted focus:border-copper"
								})]
							}),
							note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-ink-soft",
								role: "status",
								children: note
							}),
							workspace === "sample" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sand px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-ink-soft",
									children: "Estás en Mercado Andino, una empresa ficticia. Estos movimientos no son tus libros."
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-10 shrink-0 text-sm font-medium text-copper-deep",
									onClick: () => {
										if (window.confirm("Sales del ejemplo y abres el alta de tu empresa. Lo de Mercado Andino se descarta.")) beginSetup();
									},
									children: "Crear mi empresa"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "px-4 pt-5 pb-28 md:px-8 md:pt-7 md:pb-12",
						children
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-4",
					children: [[
						[
							"pulso",
							"Pulso",
							LayoutDashboard
						],
						[
							"vender",
							"Vender",
							ShoppingBag
						],
						[
							"libros",
							"Libros",
							BookOpen
						]
					].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onView(id),
						className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium", view === id ? "text-copper-deep" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), label]
					}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setMore(true),
						className: "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" }), "Más"]
					})]
				})
			}),
			more && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 bg-ink/45 md:hidden",
				onClick: () => setMore(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 rounded-t-3xl bg-card p-4 pb-8",
					onClick: (event) => event.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 pb-2 font-display text-2xl",
						children: "Ir a"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: NAV.map((item) => {
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									onView(item.id);
									setMore(false);
								},
								className: cn("flex min-h-14 items-center gap-3 rounded-2xl px-3 text-sm font-medium", view === item.id ? "bg-ink text-card" : "bg-sand text-ink"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
							}, item.id);
						})
					})]
				})
			})
		]
	});
}
function Vender({ notify }) {
	const books = useBooks((s) => s.books);
	const sell = useBooks((s) => s.sell);
	const money = useMoney();
	const [query, setQuery] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("todas");
	const [cart, setCart] = (0, import_react.useState)([]);
	const [customerId, setCustomerId] = (0, import_react.useState)("");
	const [payment, setPayment] = (0, import_react.useState)("efectivo");
	const [discount, setDiscount] = (0, import_react.useState)(0);
	const [error, setError] = (0, import_react.useState)("");
	const customers = books.parties.filter((p) => p.kind === "customer");
	const visible = (0, import_react.useMemo)(() => {
		const q = fold(query);
		return books.products.filter((p) => {
			if (!p.active) return false;
			if (category !== "todas" && p.categoryId !== category) return false;
			if (!q) return true;
			return fold(`${p.name} ${p.sku}`).includes(q);
		});
	}, [
		books.products,
		query,
		category
	]);
	function add(productId) {
		const product = books.products.find((p) => p.id === productId);
		if (!product) return;
		setCart((prev) => {
			const current = prev.find((l) => l.productId === productId);
			const nextQty = (current?.qty ?? 0) + 1;
			if (nextQty > product.stock) {
				setError(`Solo hay ${product.stock} de ${product.name}`);
				return prev;
			}
			setError("");
			if (!current) return [...prev, {
				productId,
				qty: 1
			}];
			return prev.map((l) => l.productId === productId ? {
				...l,
				qty: nextQty
			} : l);
		});
	}
	const factor = 1 - discount / 100;
	const lines = cart.map((line) => {
		const product = books.products.find((p) => p.id === line.productId);
		const unitGross = Math.round(product.price * factor);
		const gross = unitGross * line.qty;
		const split = taxFromGross(gross, books.company.taxRate);
		return {
			...line,
			product,
			unitGross,
			gross,
			...split
		};
	});
	const gross = lines.reduce((s, l) => s + l.gross, 0);
	const tax = lines.reduce((s, l) => s + l.tax, 0);
	const net = lines.reduce((s, l) => s + l.net, 0);
	function checkout() {
		if (lines.length === 0) return;
		const res = sell({
			customerId: customerId || null,
			payment,
			lines: lines.map((l) => ({
				productId: l.productId,
				qty: l.qty,
				unitGross: l.unitGross
			}))
		});
		if (!res.ok) {
			setError(res.error);
			return;
		}
		setCart([]);
		setError("");
		notify(`${res.number} lista · ${money(gross)}. El diario, el IVA y el inventario ya se movieron.`);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-[1fr_340px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.16em] text-copper-deep uppercase",
				children: "Caja rápida"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-4xl",
				children: "Vender"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-col gap-3 sm:flex-row",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Busca por nombre o SKU",
					className: "h-12 flex-1 rounded-2xl border border-line bg-card px-4 text-base outline-none focus:border-copper"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2 overflow-x-auto pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: category === "todas",
					onClick: () => setCategory("todas"),
					children: "Todo"
				}), books.categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: category === cat.id,
					onClick: () => setCategory(cat.id),
					children: cat.name
				}, cat.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: [visible.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "col-span-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						title: books.products.length === 0 ? "Catálogo vacío" : "Nada coincide",
						text: books.products.length === 0 ? "Crea productos en Inventario y dales existencia. La caja no inventa mercancía." : "Prueba otro nombre o quita el filtro."
					})
				}), visible.map((product) => {
					const margin = product.price > 0 ? 1 - product.cost / (product.price / (1 + books.company.taxRate)) : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => add(product.id),
						disabled: product.stock <= 0,
						className: "min-h-28 rounded-2xl border border-line bg-card p-3 text-left disabled:opacity-40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium leading-snug",
								children: product.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-xl tabular",
								children: money(product.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [
										product.stock,
										" ",
										product.unit
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
									tone: margin < .2 ? "wine" : "forest",
									children: [Math.round(margin * 100), "%"]
								})]
							})
						]
					}, product.id);
				})]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "h-fit rounded-3xl border border-line bg-card p-4 lg:sticky lg:top-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Ticket"
				}),
				lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "Toca un producto para armar la venta."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-line",
					children: lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: line.product.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tabular text-muted",
									children: money(line.unitGross)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center rounded-full bg-sand",
								onClick: () => setCart((prev) => prev.flatMap((l) => l.productId === line.productId ? l.qty > 1 ? [{
									...l,
									qty: l.qty - 1
								}] : [] : [l])),
								"aria-label": "Quitar uno",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 text-center text-sm tabular",
								children: line.qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center rounded-full bg-sand",
								onClick: () => add(line.productId),
								"aria-label": "Sumar uno",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-10 place-items-center rounded-full text-wine",
								onClick: () => setCart((prev) => prev.filter((l) => l.productId !== line.productId)),
								"aria-label": "Quitar línea",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, line.productId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-xs font-medium text-muted",
					children: [
						"Descuento ",
						discount,
						"%",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 30,
							value: discount,
							onChange: (event) => setDiscount(Number(event.target.value)),
							className: "mt-2 w-full accent-copper"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid grid-cols-2 gap-2",
					children: [
						"efectivo",
						"transferencia",
						"tarjeta",
						"credito"
					].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setPayment(item),
						className: `min-h-11 rounded-xl text-sm font-medium ${payment === item ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
						children: PAYMENT_LABEL[item]
					}, item))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-xs font-medium text-muted",
					children: ["Cliente", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: customerId,
						onChange: (event) => setCustomerId(event.target.value),
						className: "mt-1.5 h-11 w-full rounded-xl border border-line bg-card px-3 text-base",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Mostrador"
						}), customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))]
					})]
				}),
				payment === "credito" && !customerId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-wine",
					children: "Elige un cliente para vender a crédito."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 space-y-1 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Base",
							v: money(net)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: `Impuesto ${Math.round(books.company.taxRate * 100)}%`,
							v: money(tax)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: "Total",
							v: money(gross),
							strong: true
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-wine",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "mt-4 w-full",
					disabled: lines.length === 0 || payment === "credito" && !customerId,
					onClick: checkout,
					children: ["Cobrar ", lines.length > 0 ? money(gross) : ""]
				})
			]
		})]
	});
}
function Chip({ active, children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `min-h-10 shrink-0 rounded-full px-3 text-sm ${active ? "bg-ink text-card" : "bg-sand text-ink-soft"}`,
		children
	});
}
function Row({ k, v, strong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex justify-between ${strong ? "pt-1 font-medium text-ink" : "text-muted"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: k }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "tabular",
			children: v
		})]
	});
}
function ContableApp() {
	const workspace = useBooks((s) => s.workspace);
	const [view, setView] = (0, import_react.useState)("pulso");
	const [toast, setToast] = (0, import_react.useState)(null);
	function notify(message) {
		setToast(message);
		window.setTimeout(() => setToast(null), 3800);
	}
	if (workspace === "setup") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alta, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		view,
		onView: setView,
		children: [
			view === "pulso" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pulso, { onJump: setView }),
			view === "vender" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Vender, { notify }),
			view === "operaciones" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Operaciones, { notify }),
			view === "inventario" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inventario, { notify }),
			view === "cobranza" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cobranza, { notify }),
			view === "libros" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Libros, {}),
			view === "copiloto" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copiloto, { onJump: setView }),
			view === "empresa" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empresa, { notify }),
			toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "no-print fixed bottom-20 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-sm text-card shadow-lg md:bottom-6",
				role: "status",
				children: toast
			})
		]
	});
}
function Cuenta() {
	const user = useCurrentUser();
	const [ready, setReady] = (0, import_react.useState)(false);
	const [failed, setFailed] = (0, import_react.useState)(false);
	const armed = (0, import_react.useRef)(false);
	const books = useBooks((s) => s.books);
	const workspace = useBooks((s) => s.workspace);
	(0, import_react.useEffect)(() => {
		const userId = user?.id;
		if (!userId) return;
		let alive = true;
		armed.current = false;
		setReady(false);
		loadLedger().then(async (row) => {
			if (!alive) return;
			const local = useBooks.getState();
			if (row) local.applyRemote(row.books, row.workspace, userId);
			else if (local.ownerId === userId || local.ownerId == null && local.workspace === "live") {
				local.claim(userId);
				await saveLedger({ data: {
					payload: JSON.stringify(useBooks.getState().books),
					workspace: useBooks.getState().workspace
				} });
			} else {
				local.beginSetup();
				local.claim(userId);
			}
			if (alive) setReady(true);
		}).catch(() => {
			if (alive) setFailed(true);
		});
		return () => {
			alive = false;
		};
	}, [user?.id]);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		if (!armed.current) {
			armed.current = true;
			return;
		}
		const handle = window.setTimeout(() => {
			useBooks.getState().setCloud("saving");
			saveLedger({ data: {
				payload: JSON.stringify(books),
				workspace
			} }).then(() => useBooks.getState().setCloud("saved")).catch(() => useBooks.getState().setCloud("error"));
		}, 700);
		return () => window.clearTimeout(handle);
	}, [
		books,
		workspace,
		ready
	]);
	if (failed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper px-6 text-center text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-4xl",
			children: "No pude abrir tu cuenta"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Revisa la conexión y vuelve a entrar."
		})] })
	});
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper px-6 text-center text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-5xl",
			children: "Contable Pro"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Abriendo los libros de tu cuenta…"
		})] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContableApp, {});
}
function Splash() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-paper px-6 text-center text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-5xl",
			children: "Contable Pro"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Abriendo tus libros…"
		})] })
	});
}
function Home() {
	const ready = useBooks((s) => s.ready);
	const { user, isPending } = useCurrentUserState();
	(0, import_react.useEffect)(() => {
		let alive = true;
		const pending = useBooks.persist.rehydrate();
		Promise.resolve(pending).finally(() => {
			if (alive) useBooks.getState().setReady(true);
		});
		return () => {
			alive = false;
		};
	}, []);
	if (!ready || isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Acceso, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cuenta, {});
}
//#endregion
export { Home as component };
