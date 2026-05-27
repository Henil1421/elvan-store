import { useState } from "react";
import {
  Truck, RotateCcw, Percent, Lock, Star, Heart, Shield, Award, Gift, Clock, Zap,
  CheckCircle, Users, TrendingUp, Eye, EyeOff, Trash2, GripVertical, Plus,
} from "lucide-react";
import { getScrollingAnnouncementConfig, saveScrollingAnnouncementConfig, AnnouncementItem } from "@/lib/widgetsStore";
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

export default function ScrollingAnnouncementPage() {
  const [cfg, setCfg] = useState(getScrollingAnnouncementConfig);
  const [addingItem, setAddingItem] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ icon: "Star", text: "" });
  const { toast } = useToast();

  const handleSave = () => {
    saveScrollingAnnouncementConfig(cfg);
    toast({ title: "Saved", description: "Scrolling Announcement Bar settings saved." });
  };

  const startAdd = () => {
    setForm({ icon: "Star", text: "" });
    setEditingId(null);
    setAddingItem(true);
  };

  const startEdit = (item: AnnouncementItem) => {
    setForm({ icon: item.icon, text: item.text });
    setEditingId(item.id);
    setAddingItem(true);
  };

  const cancelForm = () => { setAddingItem(false); setEditingId(null); };

  const saveItem = () => {
    if (!form.text.trim()) return;
    if (editingId) {
      setCfg((prev) => ({
        ...prev,
        items: prev.items.map((it) =>
          it.id === editingId ? { ...it, icon: form.icon, text: form.text } : it
        ),
      }));
    } else {
      const newItem: AnnouncementItem = {
        id: Date.now().toString(),
        icon: form.icon,
        text: form.text,
        visible: true,
      };
      setCfg((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    }
    cancelForm();
  };

  const toggleVisible = (id: string) => {
    setCfg((prev) => ({
      ...prev,
      items: prev.items.map((it) => it.id === id ? { ...it, visible: !it.visible } : it),
    }));
  };

  const deleteItem = (id: string) => {
    setCfg((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }));
  };

  return (
    <div>
      <h2 className="page-header">Scrolling Announcement Bar</h2>
      <p className="page-sub">Manage the scrolling bar shown between the header and hero section</p>

      {/* Section Settings */}
      <div className="section-card mb-6">
        <h3 className="text-base font-semibold mb-4">Bar Settings</h3>
        <label className="flex items-center gap-2 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => setCfg((p) => ({ ...p, enabled: e.target.checked }))}
            className="w-4 h-4 accent-primary rounded"
          />
          <span className="text-sm font-medium text-foreground">Enable Scrolling Announcement Bar</span>
        </label>

        <div className="mb-5">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Scroll Speed (seconds)</label>
          <input
            type="number"
            min={5}
            max={60}
            value={cfg.speed}
            onChange={(e) => setCfg((p) => ({ ...p, speed: Number(e.target.value) }))}
            className="w-full md:w-1/2 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
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

        {/* Live Preview */}
        <div className="mt-5">
          <label className="block text-xs font-medium text-muted-foreground mb-2">Preview</label>
          <div
            className="overflow-hidden rounded-lg py-2 px-4"
            style={{ backgroundColor: cfg.bgColor }}
          >
            <div className="flex items-center gap-8 whitespace-nowrap text-sm font-medium">
              {cfg.items.filter((it) => it.visible).map((it) => (
                <span key={it.id} className="flex items-center gap-1.5" style={{ color: cfg.textColor }}>
                  <IconDisplay name={it.icon} className="w-4 h-4" />
                  {it.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="section-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Announcement Items</h3>
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Inline Add/Edit Form */}
        {addingItem && (
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
            <div className="mb-5">
              <label className="block text-sm font-semibold text-foreground mb-2">Text</label>
              <input
                type="text"
                placeholder="e.g., Free Shipping on orders over ₹499"
                value={form.text}
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveItem}
                className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Item
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

        <div className="flex flex-col gap-3">
          {cfg.items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 border border-border rounded-xl px-4 py-3.5 bg-background">
              <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <IconDisplay name={it.icon} className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{it.text}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleVisible(it.id)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  {it.visible
                    ? <Eye className="w-4 h-4 text-green-600" />
                    : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </button>
                <button onClick={() => startEdit(it)} className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                  Edit
                </button>
                <button onClick={() => deleteItem(it.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
          {cfg.items.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">No items yet. Click "+ Add Item" to get started.</div>
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
