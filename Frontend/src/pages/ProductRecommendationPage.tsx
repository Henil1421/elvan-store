import { useState } from "react";
import { Save } from "lucide-react";

const STORAGE_KEY = "product-recommendation-config";

const defaultConfig = {
  enabled: true,
  count: 8,
  layout: "carousel" as "grid" | "carousel",
  showPrice: true,
  showComparePrice: true,
};

function load() {
  try { return { ...defaultConfig, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return defaultConfig; }
}

export default function ProductRecommendationPage() {
  const [cfg, setCfg] = useState(load);

  const update = (key: string, value: unknown) =>
    setCfg((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    const el = document.createElement("div");
    el.className = "fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm shadow-lg";
    el.textContent = "Changes saved!";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-header mb-0">Product Recommendations</h2>
        <button
          onClick={save}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="section-card mb-4">
        {/* Enable */}
        <label className="flex items-center gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm font-semibold text-foreground">Enable Product Recommendations</span>
        </label>

        {/* Count */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1">Number of Products to Display</label>
          <input
            type="number"
            min={1}
            max={20}
            value={cfg.count}
            onChange={(e) => update("count", Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">Choose between 1–20 products to show in the recommendation section</p>
        </div>

        {/* Layout */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-2">Layout Style</p>
          <div className="flex items-center gap-6">
            {(["grid", "carousel"] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="layout"
                  value={opt}
                  checked={cfg.layout === opt}
                  onChange={() => update("layout", opt)}
                  className="accent-primary"
                />
                <span className="text-sm capitalize text-foreground">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price checkboxes */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cfg.showPrice}
              onChange={(e) => update("showPrice", e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm font-semibold text-foreground">Show Price</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cfg.showComparePrice}
              onChange={(e) => update("showComparePrice", e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm font-semibold text-foreground">Show Compare At Price</span>
          </label>
        </div>
      </div>

      {/* How it works */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">How it works</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground flex flex-col gap-1.5">
          <li>Shows products from the same collection as the current product</li>
          <li>Automatically excludes the current product from recommendations</li>
          <li>If fewer products exist than selected, shows only available products</li>
          <li>If the product has no collection, the section is hidden</li>
          <li>Only published products are displayed</li>
        </ul>
      </div>
    </div>
  );
}
