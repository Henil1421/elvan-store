import { useState } from "react";
import { Save } from "lucide-react";

const STORAGE_KEY = "card-border-config";

const defaultConfig = { borderWidth: 0, borderColor: "#007027" };

function load() {
  try { return { ...defaultConfig, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return defaultConfig; }
}

export default function CardBorderPage() {
  const [cfg, setCfg] = useState(load);

  const update = (key: string, value: unknown) =>
    setCfg((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new Event("cardBorderUpdated"));
    const el = document.createElement("div");
    el.className = "fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm shadow-lg";
    el.textContent = "Settings saved!";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  return (
    <div className="max-w-3xl">
      <h2 className="page-header">Card Border Settings</h2>
      <p className="page-sub">Configure the border style for all product and collection cards across the site.</p>

      <div className="section-card mb-6">
        {/* Border Width */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1">Border Width (px)</label>
          <input
            type="number"
            min={0}
            max={5}
            value={cfg.borderWidth}
            onChange={(e) => update("borderWidth", Math.min(5, Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">Range: 0–5 pixels (0 = no border)</p>
        </div>

        {/* Border Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Border Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cfg.borderColor}
              onChange={(e) => update("borderColor", e.target.value)}
              className="h-10 w-16 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={cfg.borderColor}
              onChange={(e) => update("borderColor", e.target.value)}
              placeholder="#000000"
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Enter hex color code (e.g., #000000)</p>
        </div>

        {/* Preview */}
        <div className="border border-border rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-3">Preview</p>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 rounded-lg bg-secondary flex items-center justify-center h-28 text-xs text-muted-foreground"
                style={{
                  borderWidth: cfg.borderWidth,
                  borderStyle: cfg.borderWidth > 0 ? "solid" : "none",
                  borderColor: cfg.borderColor,
                }}
              >
                Card Preview
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={save}
        className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Save className="w-4 h-4" />
        Save Settings
      </button>
    </div>
  );
}
