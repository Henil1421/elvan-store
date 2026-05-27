import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Trash2, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GoogleReview {
  id: string;
  name: string;
  rating: number;
  review_text: string;
  sort_order: number;
  is_active: boolean;
}

interface Settings {
  id: string;
  show_on_homepage: boolean;
  show_on_product: boolean;
  average_rating: number;
  total_review_count: number;
  max_reviews_to_show: number;
}

export default function GoogleReviewsPage() {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, settingsRes] = await Promise.all([
        supabase.from("google_reviews").select("*").order("sort_order"),
        supabase.from("google_reviews_settings").select("*").limit(1).maybeSingle(),
      ]);
      console.log("[GoogleReviews] Data fetch:", { reviews: reviewsRes.data?.length ?? 0, settingsFound: !!settingsRes.data, reviewsError: reviewsRes.error, settingsError: settingsRes.error });
      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
      if (reviewsRes.error) console.error("[GoogleReviews] Reviews fetch error:", reviewsRes.error);
      if (settingsRes.error) console.error("[GoogleReviews] Settings fetch error:", settingsRes.error);
    } catch (err) {
      console.error("[GoogleReviews] Network error:", err);
      toast.error("Failed to load Google Reviews data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("google_reviews_settings")
      .update({
        show_on_homepage: settings.show_on_homepage,
        show_on_product: settings.show_on_product,
        average_rating: settings.average_rating,
        total_review_count: settings.total_review_count,
        max_reviews_to_show: settings.max_reviews_to_show,
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) { toast.error("Failed to save settings"); return; }
    toast.success("Settings saved!");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map((r) => r.id)));
    }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("google_reviews").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("google_reviews").delete().in("id", ids);
    if (error) { toast.error("Failed to delete"); return; }
    setReviews((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
    toast.success(`Deleted ${ids.length} reviews`);
  };

  const updateReviewField = async (id: string, field: string, value: any) => {
    const { error } = await supabase.from("google_reviews").update({ [field]: value }).eq("id", id);
    if (!error) setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      const newRows: any[] = [];
      const startOrder = reviews.length + 1;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 3) continue;
        newRows.push({
          name: cols[0],
          rating: parseFloat(cols[1]) || 4,
          review_text: cols[2],
          sort_order: cols[3] ? parseInt(cols[3]) : startOrder + i - 1,
          is_active: cols[4] ? cols[4].toUpperCase() === "TRUE" : true,
        });
      }
      if (newRows.length === 0) { toast.error("No valid rows found"); return; }
      const { data, error } = await supabase.from("google_reviews").insert(newRows).select();
      if (error) { toast.error("Import failed: " + error.message); return; }
      if (data) setReviews((prev) => [...prev, ...data]);

      // Update total count in settings
      if (settings) {
        const newCount = reviews.length + newRows.length;
        await supabase.from("google_reviews_settings").update({ total_review_count: newCount }).eq("id", settings.id);
        setSettings((s) => s ? { ...s, total_review_count: newCount } : s);
      }
      toast.success(`Imported ${newRows.length} reviews`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="page-header">Google Reviews</h2>
        <p className="page-sub">Manage Google-style reviews. Upload from CSV. Data is stored in the database.</p>
      </div>

      {/* Widget Settings */}
      {settings && (
        <div className="section-card space-y-4">
          <h3 className="font-semibold text-foreground text-base">Widget Settings</h3>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Show on Homepage</p>
              <p className="text-xs text-muted-foreground">Display reviews on the main homepage</p>
            </div>
            <Switch checked={settings.show_on_homepage} onCheckedChange={(v) => setSettings((s) => s ? { ...s, show_on_homepage: v } : s)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Show on Product Pages</p>
              <p className="text-xs text-muted-foreground">Display reviews on all product pages</p>
            </div>
            <Switch checked={settings.show_on_product} onCheckedChange={(v) => setSettings((s) => s ? { ...s, show_on_product: v } : s)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Average Rating (1-5)</Label>
            <Input type="number" min={1} max={5} step={0.1} value={settings.average_rating} onChange={(e) => setSettings((s) => s ? { ...s, average_rating: parseFloat(e.target.value) || 0 } : s)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Total Review Count (for display)</Label>
            <Input type="number" value={settings.total_review_count} onChange={(e) => setSettings((s) => s ? { ...s, total_review_count: parseInt(e.target.value) || 0 } : s)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Max Reviews to Show (on storefront)</Label>
            <Input type="number" min={1} max={100} value={settings.max_reviews_to_show} onChange={(e) => setSettings((s) => s ? { ...s, max_reviews_to_show: parseInt(e.target.value) || 10 } : s)} />
            <p className="text-xs text-muted-foreground">Limit the number of reviews displayed on homepage & product pages</p>
          </div>

          <Button onClick={handleSaveSettings} className="w-full" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      )}

      {/* Import CSV */}
      <div className="section-card space-y-4">
        <h3 className="font-semibold text-foreground text-base">Import Reviews from CSV</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary">CSV Format:</p>
              <code className="text-xs text-foreground">name,rating,review_text,sort_order,is_active</code>
              <p className="text-xs text-muted-foreground mt-1">
                Export from Excel as CSV. Required: name, rating (1-5), review_text. Optional: sort_order (default 1000), is_active (TRUE/FALSE, default TRUE).
              </p>
            </div>
          </div>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>Choose CSV File</Button>
        </div>
      </div>

      {/* Existing Reviews Table */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-base">Reviews ({reviews.length})</h3>
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={deleteSelected}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete {selectedIds.size}
            </Button>
          )}
        </div>
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                <th className="p-2 w-8">
                  <Checkbox checked={selectedIds.size === reviews.length && reviews.length > 0} onCheckedChange={toggleSelectAll} />
                </th>
                <th className="p-2">Name</th>
                <th className="p-2 w-20">Rating</th>
                <th className="p-2">Review</th>
                <th className="p-2 w-24">Sort Order</th>
                <th className="p-2 w-20">Active</th>
                <th className="p-2 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">
                    <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} />
                  </td>
                  <td className="p-2 font-medium whitespace-nowrap">{r.name}</td>
                  <td className="p-2 text-center">{r.rating}</td>
                  <td className="p-2 text-muted-foreground text-xs max-w-xs truncate">{r.review_text}</td>
                  <td className="p-2">
                    <Input type="number" value={r.sort_order} onChange={(e) => updateReviewField(r.id, "sort_order", +e.target.value)} className="h-8 w-20 text-xs" />
                  </td>
                  <td className="p-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {r.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-2">
                    <button onClick={() => deleteReview(r.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No reviews yet. Import a CSV to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
