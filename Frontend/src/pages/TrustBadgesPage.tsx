import { useState } from "react";
import { getTrustBadgesConfig, saveTrustBadgesConfig, TrustBadgesConfig, TrustBadge } from "@/lib/widgetsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Eye, Plus, Trash2, GripVertical } from "lucide-react";

export default function TrustBadgesPage() {
  const [cfg, setCfg] = useState<TrustBadgesConfig>(getTrustBadgesConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveTrustBadgesConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateBadge = (id: string, patch: Partial<TrustBadge>) => {
    setCfg((p) => ({ ...p, badges: p.badges.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  };

  const addBadge = () => {
    setCfg((p) => ({
      ...p,
      badges: [...p.badges, { id: Date.now().toString(), active: true, imageUrl: "", text: "NEW<br>BADGE", altText: "New Badge" }],
    }));
  };

  const removeBadge = (id: string) => {
    setCfg((p) => ({ ...p, badges: p.badges.filter((b) => b.id !== id) }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="page-header">Trust Badges / USP</h2>
          <p className="page-sub">Display trust badges to build credibility on product pages</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6">
          <div className="section-card">
            <h3 className="font-semibold text-foreground text-base mb-4">Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">Enable Trust Badges</p>
                <p className="text-xs text-muted-foreground">Show trust badges on product pages</p>
              </div>
              <Switch checked={cfg.enabled} onCheckedChange={(v) => setCfg((p) => ({ ...p, enabled: v }))} />
            </div>
          </div>

          <div className="section-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-base">Badges</h3>
              <Button size="sm" onClick={addBadge}><Plus className="w-4 h-4 mr-1" /> Add Badge</Button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {cfg.badges.map((badge) => (
                <div key={badge.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Checkbox checked={badge.active} onCheckedChange={(v) => updateBadge(badge.id, { active: !!v })} />
                        Active
                      </label>
                    </div>
                    <button onClick={() => removeBadge(badge.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Image URL</Label>
                    <Input value={badge.imageUrl} onChange={(e) => updateBadge(badge.id, { imageUrl: e.target.value })} className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Text (use &lt;br&gt; for line breaks)</Label>
                    <Input value={badge.text} onChange={(e) => updateBadge(badge.id, { text: e.target.value })} className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Alt Text</Label>
                    <Input value={badge.altText} onChange={(e) => updateBadge(badge.id, { altText: e.target.value })} className="text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="section-card">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-base">Live Preview</h3>
          </div>
          <div className="rounded-lg border-2 border-dashed p-6">
            <h4 className="text-xl font-bold text-foreground">Product Name</h4>
            <p className="text-lg text-foreground mt-1">₹1,299</p>
            <hr className="my-4" />
            <div className="flex justify-center gap-6 flex-wrap">
              {cfg.badges.filter((b) => b.active).map((badge) => (
                <div key={badge.id} className="flex flex-col items-center gap-2 w-20">
                  {badge.imageUrl ? (
                    <img src={badge.imageUrl} alt={badge.altText} className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">IMG</div>
                  )}
                  <p className="text-[10px] font-semibold text-center text-foreground uppercase leading-tight" dangerouslySetInnerHTML={{ __html: badge.text }} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> Drag badges to reorder them. Use &lt;br&gt; in text to create line breaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
