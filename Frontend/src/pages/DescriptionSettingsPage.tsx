import { useState, useRef } from "react";
import { Save, X } from "lucide-react";

const STORAGE_KEY = "description-settings-config";

const defaultConfig = {
  enabled: true,
  readMoreThreshold: 500,
  allowInlineImages: true,
  exchangeReturnPolicy: "",
  showGlobalImage: false,
  globalImageDataUrl: "",
  showInsideDescImage: true,
  insideDescImageDataUrl: "",
};

function load() {
  try { return { ...defaultConfig, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return defaultConfig; }
}

const inp = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

interface ImageUploadProps {
  dataUrl: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  label: string;
}

function ImageUpload({ dataUrl, onUpload, onRemove, label }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpload(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {dataUrl ? (
        <div className="relative inline-block">
          <div className="border border-border rounded-lg overflow-hidden bg-secondary max-w-xs">
            <img src={dataUrl} alt={label} className="max-w-full object-contain" />
          </div>
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center h-28 w-full max-w-xs cursor-pointer hover:bg-secondary transition-colors text-muted-foreground"
        >
          <span className="text-xs text-center px-4">Click to upload image</span>
          <span className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, GIF, WebP</span>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function DescriptionSettingsPage() {
  const [cfg, setCfg] = useState(load);

  const set = (key: string, value: unknown) => setCfg((p) => ({ ...p, [key]: value }));

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-header mb-0">Description Settings</h2>
        <button
          onClick={save}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Enable + Threshold + Allow Inline */}
      <div className="section-card mb-5">
        <label className="flex items-center gap-2 cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm font-medium text-foreground">Enable Product Descriptions</span>
        </label>

        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1">
            Read More Threshold (characters)
          </label>
          <input
            type="number"
            min={0}
            className={inp}
            value={cfg.readMoreThreshold}
            onChange={(e) => set("readMoreThreshold", Math.max(0, parseInt(e.target.value) || 0))}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Show "Read more" button when description exceeds this character count
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={cfg.allowInlineImages}
            onChange={(e) => set("allowInlineImages", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm font-medium text-foreground">Allow Inline Images in Descriptions</span>
        </label>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Exchange &amp; Return Policy
          </label>
          <textarea
            className={`${inp} resize-y`}
            rows={5}
            value={cfg.exchangeReturnPolicy}
            onChange={(e) => set("exchangeReturnPolicy", e.target.value)}
            placeholder="Enter a short exchange and return policy to display on product pages..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            This policy will appear in a separate tab on product pages. You can use HTML formatting.
          </p>
        </div>
      </div>

      {/* Global Product Image */}
      <div className="section-card mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Global Product Image</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Upload an image that will appear below the description on ALL product pages
        </p>
        <ImageUpload
          dataUrl={cfg.globalImageDataUrl}
          onUpload={(url) => set("globalImageDataUrl", url)}
          onRemove={() => set("globalImageDataUrl", "")}
          label="Global product image"
        />
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={cfg.showGlobalImage}
            onChange={(e) => set("showGlobalImage", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-foreground">Show this image on all product pages</span>
        </label>
      </div>

      {/* Global Image Inside Product Description */}
      <div className="section-card mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Global Image Inside Product Description</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Upload an image that will appear inside the description section, right after the description text on ALL product pages
        </p>
        <ImageUpload
          dataUrl={cfg.insideDescImageDataUrl}
          onUpload={(url) => set("insideDescImageDataUrl", url)}
          onRemove={() => set("insideDescImageDataUrl", "")}
          label="Inside description image"
        />
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={cfg.showInsideDescImage}
            onChange={(e) => set("showInsideDescImage", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-foreground">Show this image inside description on all product pages</span>
        </label>
      </div>

      {/* Description Features */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-foreground mb-3">Description Features</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground flex flex-col gap-1.5">
          <li>Automatic HTML sanitization for security</li>
          <li>Support for rich text formatting (bold, italic, lists, links)</li>
          <li>Emoji and UTF-8 character support</li>
          <li>Responsive image display with proper sizing</li>
          <li>Auto-generated SEO descriptions from content</li>
          <li>Plain text and HTML input detection</li>
        </ul>
      </div>
    </div>
  );
}
