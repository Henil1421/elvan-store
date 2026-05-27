import { useState, useEffect } from "react";
import { Plus, Pencil, Copy, Trash2, X } from "lucide-react";
import { Discount, fetchDiscounts, addDiscountDB, updateDiscountDB, deleteDiscountDB } from "@/lib/discountStore";

type DiscountValue = "free" | "percentage" | "amount";

const emptyForm = (): Omit<Discount, "id" | "uses"> => ({
  name: "", title: "", buyQty: 2, getQty: 1,
  collections: "All collections", status: "Active",
  discountValue: "free", canCombine: false,
  maxPerOrder: "", maxTotal: "", priority: 0,
});

function genId() {
  return Math.random().toString(16).slice(2, 10);
}

interface ModalProps {
  initial?: Discount;
  onSave: (d: Discount) => void;
  onClose: () => void;
}

function DiscountModal({ initial, onSave, onClose }: ModalProps) {
  const [form, setForm] = useState<Omit<Discount, "id" | "uses">>(
    initial ? { name: initial.name, title: initial.title, buyQty: initial.buyQty, getQty: initial.getQty, collections: initial.collections, status: initial.status, discountValue: initial.discountValue, canCombine: initial.canCombine, maxPerOrder: initial.maxPerOrder, maxTotal: initial.maxTotal, priority: initial.priority }
    : emptyForm()
  );

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const ruleLabel = `Buy ${form.buyQty} Get ${form.getQty} ${form.discountValue === "free" ? "Free" : form.discountValue === "percentage" ? "% Off" : "Amount Off"}`;

  const handleSave = () => {
    if (!form.name.trim() || !form.title.trim()) return;
    onSave({ ...form, id: initial?.id ?? genId(), uses: initial?.uses ?? 0 });
  };

  const inp = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-semibold text-foreground">
            {initial ? "Edit Buy X Get Y Discount" : "Create Buy X Get Y Discount"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-5">
            {/* Left */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Buy X get Y */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Buy X get Y</h3>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-foreground mb-1">Discount Name <span className="text-destructive">*</span></label>
                  <input className={inp} placeholder="e.g., Summer Sale B2G1" value={form.name} onChange={(e) => set("name", e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Internal name for this discount (not shown to customers).</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Title <span className="text-destructive">*</span></label>
                  <input className={inp} placeholder="e.g., Buy 2 Get 1 Free" value={form.title} onChange={(e) => set("title", e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Customers will see this in their cart and at checkout.</p>
                </div>
              </div>

              {/* Customer buys */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Customer buys</h3>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-foreground mb-1">Quantity</label>
                  <input type="number" min={1} className={inp} value={form.buyQty} onChange={(e) => set("buyQty", Math.max(1, parseInt(e.target.value) || 1))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Any items from</label>
                  <select className={inp} value={form.collections} onChange={(e) => set("collections", e.target.value)}>
                    <option>All collections</option>
                    <option>Featured collection</option>
                    <option>Sale items</option>
                  </select>
                </div>
              </div>

              {/* Customer gets */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Customer gets</h3>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-foreground mb-1">Quantity</label>
                  <input type="number" min={1} className={inp} value={form.getQty} onChange={(e) => set("getQty", Math.max(1, parseInt(e.target.value) || 1))} />
                  <p className="text-xs text-muted-foreground mt-1">Customers must add the quantity of items specified below to their cart.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Any items from</label>
                  <p className="text-xs text-muted-foreground">Same collections as "Customer buys"</p>
                </div>
              </div>

              {/* At a discounted value */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">At a discounted value</h3>
                {(["free", "percentage", "amount"] as DiscountValue[]).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 py-2 cursor-pointer border-b border-border last:border-0">
                    <input type="radio" name="discountValue" value={opt} checked={form.discountValue === opt} onChange={() => set("discountValue", opt)} className="accent-primary" />
                    <span className="text-sm capitalize text-foreground">{opt === "free" ? "Free" : opt === "percentage" ? "Percentage" : "Amount off each"}</span>
                  </label>
                ))}
              </div>

              {/* Additional options */}
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Additional options</h3>
                <label className="flex items-start gap-2 cursor-pointer mb-4">
                  <input type="checkbox" checked={form.canCombine} onChange={(e) => set("canCombine", e.target.checked)} className="mt-0.5 accent-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Can combine with other discounts</p>
                    <p className="text-xs text-muted-foreground">Allow this discount to work with other active discounts</p>
                  </div>
                </label>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-foreground mb-1">Maximum uses per order</label>
                  <input className={inp} placeholder="Unlimited" value={form.maxPerOrder} onChange={(e) => set("maxPerOrder", e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-foreground mb-1">Maximum total uses</label>
                  <input className={inp} placeholder="Unlimited" value={form.maxTotal} onChange={(e) => set("maxTotal", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Priority</label>
                  <input type="number" min={0} className={inp} value={form.priority} onChange={(e) => set("priority", Math.max(0, parseInt(e.target.value) || 0))} />
                  <p className="text-xs text-muted-foreground mt-1">Higher priority rules are preferred when multiple rules match</p>
                </div>
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="w-56 shrink-0">
              <div className="border border-border rounded-lg p-4 sticky top-0">
                <h3 className="text-sm font-semibold text-foreground mb-3">Summary</h3>
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <select className={inp} value={form.status} onChange={(e) => set("status", e.target.value as "Active" | "Draft")}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Type</p>
                  <p className="text-sm text-foreground">Buy X get Y</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Details</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside flex flex-col gap-0.5">
                    <li>All customers</li>
                    <li>Buy {form.buyQty} items</li>
                    <li>Get {form.getQty} item {form.discountValue === "free" ? "free" : form.discountValue === "percentage" ? "% off" : "amount off"}</li>
                    <li>{form.canCombine ? "Can combine" : "Can't combine"} with other discounts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Save discount</button>
        </div>
      </div>
    </div>
  );
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | undefined>();

  // Load from DB on mount
  useEffect(() => {
    fetchDiscounts().then(setDiscounts);
  }, []);

  const reload = async () => {
    const d = await fetchDiscounts();
    setDiscounts(d);
  };

  const openCreate = () => { setEditing(undefined); setModalOpen(true); };
  const openEdit = (d: Discount) => { setEditing(d); setModalOpen(true); };

  const handleSave = async (d: Discount) => {
    if (editing) {
      await updateDiscountDB(d);
    } else {
      await addDiscountDB(d);
    }
    await reload();
    setModalOpen(false);
  };

  const duplicate = async (d: Discount) => {
    await addDiscountDB({ ...d, id: genId(), name: d.name + " (Copy)", uses: 0 });
    await reload();
  };

  const remove = async (id: string) => {
    await deleteDiscountDB(id);
    await reload();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="page-header">Buy X Get Y Discounts</h2>
          <p className="page-sub">Create and manage automatic Buy X Get Y discount rules</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create discount
        </button>
      </div>

      {/* Table */}
      <div className="section-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {["NAME / TITLE", "RULE", "COLLECTIONS", "USES", "STATUS", "ACTIONS"].map((h) => (
                <th key={h} className={`text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide ${h === "ACTIONS" ? "text-right" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-4">
                  <p className="font-semibold text-foreground">{d.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Discount ID: {d.id}</p>
                </td>
                <td className="px-4 py-4 text-foreground">{d.title}</td>
                <td className="px-4 py-4 text-foreground">{d.collections}</td>
                <td className="px-4 py-4 text-foreground">{d.uses}</td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${d.status === "Active" ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(d)} className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => duplicate(d)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded transition-colors"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => remove(d.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {discounts.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">No discounts yet. Click "Create discount" to add one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <DiscountModal initial={editing} onSave={handleSave} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
