import { useState } from "react";
import { Save, Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { getFooterConfig, saveFooterConfig, SocialItem } from "@/lib/footerConfig";

const PLATFORMS = ["Facebook","Instagram","Twitter / X","YouTube","TikTok","Pinterest","LinkedIn","Snapchat","WhatsApp","Telegram"];

let uid = 1000;

export default function FooterSocialPage() {
  const [items, setItems] = useState<SocialItem[]>(() => getFooterConfig().social);
  const [hasChanges, setHasChanges] = useState(false);

  const add = () => { setItems((p) => [...p, { id: ++uid, platform: "Instagram", url: "", visible: true }]); setHasChanges(true); };
  const update = (item: SocialItem) => { setItems((p) => p.map((x) => x.id === item.id ? item : x)); setHasChanges(true); };
  const remove = (id: number) => { setItems((p) => p.filter((x) => x.id !== id)); setHasChanges(true); };

  const handleSave = () => {
    saveFooterConfig({ social: items });
    setHasChanges(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Footer Settings - Social</h2>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${hasChanges ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : "bg-secondary text-muted-foreground border-border cursor-default"}`}
        >
          <Save className="w-3.5 h-3.5" />
          {hasChanges ? "Save Changes" : "No Changes"}
        </button>
      </div>

      <div className="section-card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-foreground">Social Media Icons</h3>
          <button onClick={add} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Social Icon
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <select
                value={item.platform}
                onChange={(e) => update({ ...item, platform: e.target.value })}
                className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none w-44 shrink-0"
              >
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
              <input
                type="text"
                value={item.url}
                onChange={(e) => update({ ...item, url: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={() => update({ ...item, visible: !item.visible })} className="p-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shrink-0">
                {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => remove(item.id)} className="p-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No social icons yet. Click "Add Social Icon" to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
}
