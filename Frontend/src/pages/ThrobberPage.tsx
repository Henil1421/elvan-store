import { useState, useRef } from "react";
import { Save, Eye, X } from "lucide-react";

const STORAGE_KEY = "throbber-config";

const defaultConfig = { enabled: false, imageDataUrl: "" };

function load() {
  try { return { ...defaultConfig, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return defaultConfig; }
}

export default function ThrobberPage() {
  const [cfg, setCfg] = useState(load);
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: string, value: unknown) =>
    setCfg((prev) => ({ ...prev, [key]: value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update("imageDataUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new Event("throbberUpdated"));
    const el = document.createElement("div");
    el.className = "fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm shadow-lg";
    el.textContent = "Settings saved!";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="page-header">Throbber Settings</h2>
      <p className="page-sub">Configure the global loading screen that appears when pages are loading.</p>

      {/* Main card */}
      <div className="section-card mb-4">
        {/* Enable */}
        <label className="flex items-start gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">Enable Global Throbber</p>
            <p className="text-xs text-muted-foreground">Show animated loading screen on all pages</p>
          </div>
        </label>

        {/* Upload */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-foreground mb-1">Throbber Image/Animation</p>
          <p className="text-xs text-muted-foreground mb-3">Upload an animated GIF, PNG, WebP, or static image to use as your loading animation.</p>

          <p className="text-sm font-medium text-foreground mb-2">Throbber Animation</p>
          {cfg.imageDataUrl ? (
            <div className="relative inline-block">
              <div className="w-36 h-36 border border-border rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                <img src={cfg.imageDataUrl} alt="Throbber" className="max-w-full max-h-full object-contain" />
              </div>
              <button
                onClick={() => { update("imageDataUrl", ""); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="w-36 h-36 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-secondary transition-colors text-muted-foreground"
            >
              <span className="text-xs text-center px-2">Click to upload image or GIF</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*,.gif" className="hidden" onChange={handleFile} />
        </div>

        {/* Show Preview button */}
        {cfg.imageDataUrl && (
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-secondary transition-colors mb-4"
          >
            <Eye className="w-4 h-4" />
            Show Preview
          </button>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={save}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="section-card border border-primary/20 bg-primary/5">
        <h3 className="text-sm font-semibold text-primary mb-3">How it works</h3>
        <ul className="list-disc list-inside text-sm text-primary/80 flex flex-col gap-1.5">
          <li>When enabled, the throbber appears on all pages during initial load</li>
          <li>The loading screen fades out smoothly once the page is ready</li>
          <li>The image is centered and scales responsively</li>
          <li>Best results with animated GIFs or transparent PNGs</li>
          <li>Recommended size: 200×200px to 400×400px</li>
        </ul>
      </div>

      {/* Preview overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {cfg.imageDataUrl && (
            <img src={cfg.imageDataUrl} alt="Throbber preview" className="max-w-xs max-h-xs object-contain" />
          )}
        </div>
      )}
    </div>
  );
}
