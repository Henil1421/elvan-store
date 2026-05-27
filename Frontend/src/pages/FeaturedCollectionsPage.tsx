import { useState, useEffect, useCallback } from "react";
import { Save, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { fetchCollections, Collection } from "@/lib/collectionsStore";
import { fetchFeaturedSettings, saveFeaturedSettingsDB, FeaturedCollectionConfig, FeaturedCollectionsSettings } from "@/lib/collectionsStore";

function showToast(msg: string) {
  const el = document.createElement("div");
  el.className = "fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm shadow-lg";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

export default function FeaturedCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [settings, setSettings] = useState<FeaturedCollectionsSettings>({ visible: true, collections: [] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [cols, feat] = await Promise.all([fetchCollections(), fetchFeaturedSettings()]);
    setCollections(cols);
    // Sync any new collections into featured settings
    const existingIds = new Set(feat.collections.map(fc => fc.collectionId));
    const newEntries: FeaturedCollectionConfig[] = cols
      .filter(c => !existingIds.has(c.id))
      .map((c, i) => ({ collectionId: c.id, featured: false, productsToShow: 8, order: feat.collections.length + i }));
    setSettings({ ...feat, collections: [...feat.collections, ...newEntries] });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const refresh = () => { load(); };
    window.addEventListener("collectionsUpdated", refresh);
    return () => window.removeEventListener("collectionsUpdated", refresh);
  }, [load]);

  const updateRow = (collectionId: string, patch: Partial<FeaturedCollectionConfig>) =>
    setSettings(prev => ({
      ...prev,
      collections: prev.collections.map(fc => fc.collectionId === collectionId ? { ...fc, ...patch } : fc),
    }));

  const moveRow = (collectionId: string, dir: "up" | "down") => {
    setSettings(prev => {
      const sorted = [...prev.collections].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(fc => fc.collectionId === collectionId);
      if (dir === "up" && idx === 0) return prev;
      if (dir === "down" && idx === sorted.length - 1) return prev;
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      [sorted[idx].order, sorted[swapIdx].order] = [sorted[swapIdx].order, sorted[idx].order];
      return { ...prev, collections: sorted };
    });
  };

  const save = async () => {
    await saveFeaturedSettingsDB(settings);
    showToast("Featured collections saved!");
  };

  const colMap = new Map(collections.map(c => [c.id, c]));
  const rows = settings.collections.filter(fc => colMap.has(fc.collectionId)).sort((a, b) => a.order - b.order);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading…</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Featured Collections</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage which collections appear on the homepage with their products</p>
        </div>
        <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="section-card mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Section Visibility</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Show or hide the entire featured collections section</p>
        </div>
        <button onClick={() => setSettings(prev => ({ ...prev, visible: !prev.visible }))}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            settings.visible ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
          }`}>
          {settings.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {settings.visible ? "Visible" : "Hidden"}
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="section-card flex items-center justify-center h-36 text-muted-foreground text-sm border-dashed">
          No collections yet. Go to Collections → Add collection first.
        </div>
      ) : (
        <div className="section-card p-0 overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pl-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Order</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Featured</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Collection Name</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40">Products to Show</th>
                <th className="py-3 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((fc, idx) => {
                const col = colMap.get(fc.collectionId)!;
                return (
                  <tr key={fc.collectionId} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 pl-4 text-muted-foreground font-mono text-sm">#{String(idx + 1).padStart(3, "0")}</td>
                    <td className="py-4 px-3">
                      <input type="checkbox" checked={fc.featured} onChange={e => updateRow(fc.collectionId, { featured: e.target.checked })} className="h-4 w-4 rounded border-border accent-primary" />
                    </td>
                    <td className="py-4 px-3">
                      <div className="font-medium text-foreground">{col.title}</div>
                      <div className="text-xs text-muted-foreground">{col.handle}</div>
                    </td>
                    <td className="py-4 px-3">
                      <input type="number" min={1} max={100} value={fc.productsToShow}
                        onChange={e => updateRow(fc.collectionId, { productsToShow: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)) })}
                        className="w-20 border border-border rounded-lg px-2.5 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center" />
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveRow(fc.collectionId, "up")} disabled={idx === 0}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors" title="Move up">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveRow(fc.collectionId, "down")} disabled={idx === rows.length - 1}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30 transition-colors" title="Move down">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-3">How it works:</h3>
        <ul className="flex flex-col gap-1.5">
          {[
            'Check the "Featured" box to show a collection on the homepage',
            "Set how many products to display (1-100)",
            "Use arrows to reorder featured collections",
            "Only active products will be shown",
            'A "View All" button will link to the full collection page',
          ].map(tip => (
            <li key={tip} className="text-sm text-blue-700 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">·</span>{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
