import { useState } from "react";
import {
  Truck, RotateCcw, Percent, Lock, Star, Heart, Shield, Award, Gift, Clock, Zap,
  CheckCircle, Users, TrendingUp, Eye, EyeOff, Trash2, GripVertical, Plus,
} from "lucide-react";
import { getRotatingFeaturesConfig, saveRotatingFeaturesConfig, RotatingFeature } from "@/lib/widgetsStore";
import { useToast } from "@/hooks/use-toast";

const ICON_LIST = [
  "Truck", "RotateCcw", "Percent", "Lock", "Star", "Heart", "Shield",
  "Award", "Gift", "Clock", "Zap", "CheckCircle", "Users", "TrendingUp",
];

const ICON_MAP: Record<string, React.ElementType> = {
  Truck, RotateCcw, Percent, Lock, Star, Heart, Shield,
  Award, Gift, Clock, Zap, CheckCircle, Users, TrendingUp,
};

function IconDisplay({ name, className }: { name: string; className?: string }) {
  const I = ICON_MAP[name] ?? Star;
  return <I className={className ?? "w-5 h-5"} />;
}

export default function RotatingFeaturesPage() {
  const [cfg, setCfg] = useState(getRotatingFeaturesConfig);
  const [addingFeature, setAddingFeature] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ icon: "Star", title: "", description: "" });
  const { toast } = useToast();

  const handleSave = () => {
    saveRotatingFeaturesConfig(cfg);
    toast({ title: "Saved", description: "Rotating Features settings saved." });
  };

  const startAdd = () => {
    setForm({ icon: "Star", title: "", description: "" });
    setEditingId(null);
    setAddingFeature(true);
  };

  const startEdit = (f: RotatingFeature) => {
    setForm({ icon: f.icon, title: f.title, description: f.description });
    setEditingId(f.id);
    setAddingFeature(true);
  };

  const cancelForm = () => { setAddingFeature(false); setEditingId(null); };

  const saveFeature = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      setCfg((prev) => ({
        ...prev,
        features: prev.features.map((f) =>
          f.id === editingId ? { ...f, icon: form.icon, title: form.title, description: form.description } : f
        ),
      }));
    } else {
      const newF: RotatingFeature = {
        id: Date.now().toString(),
        icon: form.icon,
        title: form.title,
        description: form.description,
        visible: true,
      };
      setCfg((prev) => ({ ...prev, features: [...prev.features, newF] }));
    }
    cancelForm();
  };

  const toggleVisible = (id: string) => {
    setCfg((prev) => ({
      ...prev,
      features: prev.features.map((f) => f.id === id ? { ...f, visible: !f.visible } : f),
    }));
  };

  const deleteFeature = (id: string) => {
    setCfg((prev) => ({ ...prev, features: prev.features.filter((f) => f.id !== id) }));
  };

  return (
    <div>
      <h2 className="page-header">Rotating Features</h2>
      <p className="page-sub">Manage rotating features section above footer</p>

      {/* Section Settings */}
      <div className="section-card mb-6">
        <h3 className="text-base font-semibold mb-4">Section Settings</h3>
        <label className="flex items-center gap-2 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => setCfg((p) => ({ ...p, enabled: e.target.checked }))}
            className="w-4 h-4 accent-primary rounded"
          />
          <span className="text-sm font-medium text-foreground">Enable Rotating Features Section</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rotation Speed (seconds)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={cfg.rotationSpeed}
              onChange={(e) => setCfg((p) => ({ ...p, rotationSpeed: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Animation Type</label>
            <select
              value={cfg.animationType}
              onChange={(e) => setCfg((p) => ({ ...p, animationType: e.target.value as "fade" | "slide" }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cfg.bgColor}
                onChange={(e) => setCfg((p) => ({ ...p, bgColor: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={cfg.bgColor}
                onChange={(e) => setCfg((p) => ({ ...p, bgColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cfg.textColor}
                onChange={(e) => setCfg((p) => ({ ...p, textColor: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={cfg.textColor}
                onChange={(e) => setCfg((p) => ({ ...p, textColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="section-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Features List</h3>
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Feature
          </button>
        </div>

        {/* Inline Add/Edit Form */}
        {addingFeature && (
          <div className="border border-border rounded-xl p-5 mb-4 bg-secondary/30">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-foreground mb-2">Icon</label>
              <select
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ICON_LIST.map((ic) => (
                  <option key={ic} value={ic}>{ic}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
              <input
                type="text"
                placeholder="e.g., Free Shipping"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
              <input
                type="text"
                placeholder="e.g., Enjoy free shipping with prepaid and COD Orders"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveFeature}
                className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Feature
              </button>
              <button
                onClick={cancelForm}
                className="px-5 py-2 bg-secondary text-foreground text-sm font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Feature Items */}
        <div className="flex flex-col gap-3">
          {cfg.features.map((f) => (
            <div key={f.id} className="flex items-center gap-3 border border-border rounded-xl px-4 py-3.5 bg-background">
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <IconDisplay name={f.icon} className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.description}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleVisible(f.id)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  {f.visible
                    ? <Eye className="w-4 h-4 text-green-600" />
                    : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => startEdit(f)} className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                  Edit
                </button>
                <button onClick={() => deleteFeature(f.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
          {cfg.features.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">No features yet. Click "+ Add Feature" to get started.</div>
          )}
        </div>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
