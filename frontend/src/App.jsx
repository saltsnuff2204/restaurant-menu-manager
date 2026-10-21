import { useEffect, useMemo, useState } from "react";

const CATEGORIES = [
    { value: "STARTER", label: "Starter" },
    { value: "MAIN_DISH", label: "Main Dish" },
    { value: "DESSERT", label: "Dessert" },
    { value: "DRINK", label: "Drink" },
];

async function fetchMenu() {
    const response = await fetch("/api/menu");
    if (!response.ok) throw new Error();

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

function Stat({ label, value }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-xl font-semibold text-slate-100">{value}</div>
        </div>
    );
}

function TabButton({ active, children, ...props }) {
    return (
        <button
            {...props}
            className={[
                "rounded-xl px-3 py-2 text-sm border transition",
                active
                    ? "bg-slate-100 text-slate-900 border-slate-100"
                    : "bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-900",
            ].join(" ")}
            type="button"
        >
            {children}
        </button>
    );
}

function Field({ label, children }) {
    return (
        <label className="grid gap-1 text-sm text-slate-300">
            <span className="text-slate-400">{label}</span>
            {children}
        </label>
    );
}

export default function App() {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [tab, setTab] = useState("DISH");
    const [query, setQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    const [form, setForm] = useState({
        name: "",
        price: "",
        category: "MAIN_DISH",
        isVegetarian: false,
        hasIce: false,
    });

    function loadMenu() {
        setLoading(true);
        setError("");
        fetchMenu()
            .then((data) => {
                setMenu(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load menu");
                setLoading(false);
            });
    }

    useEffect(() => {
        let active = true;

        fetchMenu()
            .then((data) => {
                if (!active) return;
                setMenu(data);
                setLoading(false);
            })
            .catch(() => {
                if (!active) return;
                setError("Failed to load menu");
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    function handleDelete(id) {
        const ok = confirm(`Delete item with ID ${id}?`);
        if (!ok) return;

        fetch(`/api/menu/${id}`, { method: "DELETE" })
            .then((res) => {
                if (!res.ok) throw new Error();
                loadMenu();
            })
            .catch(() => setError("Failed to delete item"));
    }

    function validateForm() {
        if (!form.name.trim()) return "Name is required";
        const p = Number(form.price);
        if (!Number.isFinite(p) || p <= 0) return "Price must be a number > 0";
        return "";
    }

    function handleAdd(e) {
        e.preventDefault();
        setError("");

        const msg = validateForm();
        if (msg) return setError(msg);

        const payload = {
            name: form.name.trim(),
            price: Number(form.price),
            category: form.category,
        };

        let url = "";
        if (tab === "DISH") {
            url = "/api/menu/dish";
            payload.isVegetarian = !!form.isVegetarian;
        } else {
            url = "/api/menu/drink";
            payload.hasIce = !!form.hasIce;
        }

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) throw new Error();
                setForm((f) => ({ ...f, name: "", price: "" }));
                loadMenu();
            })
            .catch(() => setError("Failed to add item"));
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return menu
            .filter((x) => (categoryFilter === "ALL" ? true : x.category === categoryFilter))
            .filter((x) => (q ? String(x.name || "").toLowerCase().includes(q) : true))
            .sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    }, [menu, query, categoryFilter]);

    const stats = useMemo(() => {
        const total = menu.length;
        const dishes = menu.filter((x) => "isVegetarian" in x).length;
        const drinks = menu.filter((x) => "hasIce" in x).length;
        return { total, dishes, drinks };
    }, [menu]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            aria-hidden="true"
                            className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-400 text-2xl text-slate-950"
                        >
                            🍽
                        </div>

                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight">
                                Restaurant Menu Manager
                            </h1>
                            <p className="text-slate-400">
                                Java REST API · React dashboard · PostgreSQL
                            </p>
                        </div>
                    </div>


                    <div className="grid grid-cols-3 gap-3">
                        <Stat label="Total items" value={stats.total} />
                        <Stat label="Dishes" value={stats.dishes} />
                        <Stat label="Drinks" value={stats.drinks} />
                    </div>
                </div>

                {error && (
                    <div className="mt-5 rounded-2xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-rose-200">
                        {error}
                    </div>
                )}

                <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Add new item</h2>
                            <button
                                onClick={loadMenu}
                                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm hover:bg-slate-900"
                                type="button"
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <TabButton
                                active={tab === "DISH"}
                                onClick={() => {
                                    setTab("DISH");
                                    setForm((current) => ({
                                        ...current,
                                        category: current.category === "DRINK" ? "MAIN_DISH" : current.category,
                                    }));
                                }}
                            >
                                Dish
                            </TabButton>
                            <TabButton
                                active={tab === "DRINK"}
                                onClick={() => {
                                    setTab("DRINK");
                                    setForm((current) => ({ ...current, category: "DRINK" }));
                                }}
                            >
                                Drink
                            </TabButton>
                        </div>

                        <form onSubmit={handleAdd} className="mt-4 grid gap-3">
                            <Field label="Name">
                                <input
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-600"
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder={tab === "DISH" ? "Mushroom risotto" : "Iced tea"}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Price">
                                    <input
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-600"
                                        value={form.price}
                                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                        placeholder="12.50"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                    />
                                </Field>

                                <Field label="Category">
                                    <select
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 outline-none focus:border-slate-600"
                                        value={form.category}
                                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                    >
                                        {CATEGORIES
                                            .filter((category) => tab === "DRINK"
                                                ? category.value === "DRINK"
                                                : category.value !== "DRINK")
                                            .map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                            ))}
                                    </select>
                                </Field>
                            </div>

                            {tab === "DISH" ? (
                                <label className="flex items-center gap-2 text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={form.isVegetarian}
                                        onChange={(e) => setForm((f) => ({ ...f, isVegetarian: e.target.checked }))}
                                    />
                                    Vegetarian
                                </label>
                            ) : (
                                <label className="flex items-center gap-2 text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={form.hasIce}
                                        onChange={(e) => setForm((f) => ({ ...f, hasIce: e.target.checked }))}
                                    />
                                    Has ice
                                </label>
                            )}

                            <button
                                type="submit"
                                className="mt-1 rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-900 hover:bg-white"
                            >
                                Add
                            </button>

                            <p className="text-xs text-slate-500">
                                Tip: use search & filter on the right to quickly find items.
                            </p>
                        </form>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <h2 className="text-lg font-semibold">Menu items</h2>

                            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                <input
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-600 md:w-64"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by name..."
                                />

                                <select
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-slate-600 md:w-48"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="ALL">All categories</option>
                                    {CATEGORIES.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 overflow-auto rounded-2xl border border-slate-800">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-950/60 text-slate-300">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Price</th>
                                    <th className="px-4 py-3">Details</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td className="px-4 py-6 text-slate-400" colSpan={6}>
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td className="px-4 py-6 text-slate-400" colSpan={6}>
                                            No items found.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-950/40">
                                            <td className="px-4 py-3 text-slate-300">{item.id}</td>
                                            <td className="px-4 py-3 font-medium">{item.name}</td>
                                            <td className="px-4 py-3 text-slate-300">{item.category}</td>
                                            <td className="px-4 py-3 text-slate-300">
                                                ${Number(item.price).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {"isVegetarian" in item
                                                    ? item.isVegetarian
                                                        ? "Vegetarian"
                                                        : "Not vegetarian"
                                                    : item.hasIce
                                                        ? "With ice"
                                                        : "No ice"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    className="rounded-lg border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-xs text-rose-200 hover:bg-rose-950/70"
                                                    onClick={() => handleDelete(item.id)}
                                                    type="button"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                            Showing {filtered.length} of {menu.length} items.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
