import { useState, useEffect, useCallback } from "react";
import { Plus, Search, GripVertical, Trash2, Pencil, X, Check, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import {
  fetchCollections, addCollectionDB, deleteCollectionDB, updateCollectionDB,
  bulkDeleteCollectionsDB, reorderCollectionsDB,
  Collection, makeCollectionHandle,
} from "@/lib/collectionsStore";

function showToast(msg: string) {
  const el = document.createElement("div");
  el.className = "fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm shadow-lg";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

function AddCollectionModal({ onClose, onSave }: { onClose: () => void; onSave: (c: Omit<Collection, "id">) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("Manual");

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      handle: makeCollectionHandle(title.trim()),
      description: description.trim(),
      productCount: 0,
      productCondition: condition,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Add collection</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Collection"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Optional description"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Product condition</label>
            <div className="flex gap-4">
              {["Manual", "Automated"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="condition" value={opt} checked={condition === opt} onChange={() => setCondition(opt)} className="accent-primary" />
                  <span className="text-sm text-foreground">{opt}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {condition === "Manual" ? "Manually add products to this collection." : "Automatically include products matching conditions."}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border bg-background hover:bg-secondary text-foreground transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!title.trim()} className="px-4 py-2 text-sm rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-40">
            Save collection
          </button>
        </div>
      </div>
    </div>
  );
}

function EditInlineRow({ col, onSave, onCancel }: { col: Collection; onSave: (c: Collection) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(col.title);
  return (
    <tr className="border-b border-border bg-accent/10">
      <td className="py-3 pl-4 w-10"><input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" /></td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-48" autoFocus />
        </div>
      </td>
      <td className="py-3 pr-4 text-sm text-foreground">{col.productCount}</td>
      <td className="py-3 pr-4 text-sm text-muted-foreground">{col.productCondition}</td>
      <td className="py-3 pr-4">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onSave({ ...col, title: title.trim(), handle: makeCollectionHandle(title.trim()) })} className="p-1.5 rounded hover:bg-secondary text-primary"><Check className="w-4 h-4" /></button>
          <button onClick={onCancel} className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
      </td>
      <td className="py-3 pr-4" />
    </tr>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const cols = await fetchCollections();
    setCollections(cols);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const refresh = () => { load(); };
    window.addEventListener("collectionsUpdated", refresh);
    return () => window.removeEventListener("collectionsUpdated", refresh);
  }, [load]);

  const handleAdd = async (col: Omit<Collection, "id">) => {
    await addCollectionDB({ ...col, sortOrder: collections.length });
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteCollectionDB(id);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    await load();
  };

  const handleBulkDelete = async () => {
    await bulkDeleteCollectionsDB([...selected]);
    setSelected(new Set());
    await load();
  };

  const handleEditSave = async (updated: Collection) => {
    await updateCollectionDB(updated.id, { title: updated.title, handle: updated.handle });
    setEditingId(null);
    await load();
  };

  const moveRow = async (id: string, dir: "up" | "down") => {
    const idx = collections.findIndex(c => c.id === id);
    if (dir === "up" && idx <= 0) return;
    if (dir === "down" && idx >= collections.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const newOrder = [...collections];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setCollections(newOrder);
    await reorderCollectionsDB(newOrder.map(c => c.id));
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((c) => c.id)));

  const filtered = collections.filter((c) =>
    search.trim() === "" || c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {showAdd && <AddCollectionModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold text-foreground">Collections</h2>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add collection
        </button>
      </div>

      <div className="section-card p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-foreground bg-background hover:bg-secondary transition-colors">All</button>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search collections..."
              className="pl-9 pr-4 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary w-52" />
          </div>
          {selected.size > 0 && (
            <button onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete ({selected.size})
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pl-4 w-10">
                  <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} className="h-4 w-4 rounded border-border accent-primary" />
                </th>
                <th className="py-3 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
                <th className="py-3 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Products</th>
                <th className="py-3 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product Conditions</th>
                <th className="py-3 pr-4 w-24" />
                <th className="py-3 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Order</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">Loading collections…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                  {collections.length === 0 ? 'No collections yet. Click "Add collection" to get started.' : "No collections match your search."}
                </td></tr>
              )}
              {filtered.map((col, idx) =>
                editingId === col.id ? (
                  <EditInlineRow key={col.id} col={col} onSave={handleEditSave} onCancel={() => setEditingId(null)} />
                ) : (
                  <tr key={col.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors group">
                    <td className="py-3 pl-4 w-10">
                      <input type="checkbox" checked={selected.has(col.id)} onChange={() => toggleSelect(col.id)} className="h-4 w-4 rounded border-border accent-primary" />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground">{col.title}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-foreground">{col.productCount}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{col.productCondition || "—"}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(col.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(col.id)} className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveRow(col.id, "up")} disabled={idx === 0}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors" title="Move up">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveRow(col.id, "down")} disabled={idx === filtered.length - 1}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors" title="Move down">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
