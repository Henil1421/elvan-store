import { useState, useRef, useCallback } from "react";
import { Save, Plus, Trash2, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getStoreConfig, saveStoreConfig, StoreConfig } from "@/lib/storeConfig";

/* ── tiny helpers ─────────────────────────────────────── */

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section-card mb-5">
      <h3 className="text-base font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({
  placeholder, value, onChange,
}: { placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center border border-border rounded-lg overflow-hidden h-9">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-full border-0 bg-transparent cursor-pointer p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-2 text-sm bg-transparent border-0 focus:outline-none font-mono"
      />
    </div>
  );
}

function SelectInput({
  options, value, onChange,
}: { options: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/* ── Image upload box with real file picking ───────────── */
function ImageUploadBox({
  label,
  hint,
  value,
  onChange,
  aspectClass = "w-36 h-24",
  round = false,
  storagePath = "misc",
}: {
  label: string;
  hint?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  aspectClass?: string;
  round?: boolean;
  storagePath?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `${storagePath}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error("Upload error:", error);
        // Fallback to base64 for very small files
        const reader = new FileReader();
        reader.onload = (e) => onChange(e.target?.result as string);
        reader.readAsDataURL(file);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      onChange(urlData.publicUrl);
    } catch (err) {
      console.error("Upload exception:", err);
    } finally {
      setUploading(false);
    }
  }, [onChange, storagePath]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div className="mb-1">
      {hint && <p className="text-xs text-muted-foreground mb-2">{hint}</p>}
      <div className="flex items-start gap-4 flex-wrap">
        {/* Preview box */}
        <div
          className={`relative border-2 border-dashed border-border rounded-xl overflow-hidden bg-secondary/40 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors ${aspectClass} ${round ? "rounded-full" : ""}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-[10px]">Uploading…</span>
            </div>
          ) : value ? (
            <img src={value} alt={label} className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground p-3">
              <ImageIcon className="w-6 h-6" />
              <span className="text-[10px] text-center leading-tight">Click or drag to upload</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 justify-center">
          <button
            onClick={() => !uploading && inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            {value ? "Replace" : "Upload"} Image
          </button>
          {value && (
            <button
              onClick={() => onChange(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-sm hover:bg-destructive/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function SaveButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [saved, setSaved] = useState(false);
  const handle = () => {
    onClick();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mt-4"
    >
      <Save className="w-3.5 h-3.5" />
      {saved ? "✓ Saved!" : label}
    </button>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function HomePage() {
  const [cfg, setCfg] = useState<StoreConfig>(getStoreConfig);
  const set = (patch: Partial<StoreConfig>) => setCfg((c) => ({ ...c, ...patch }));

  const [menuItems, setMenuItems] = useState([{ label: "Home", url: "/" }]);
  const addMenuItem = () => setMenuItems((p) => [...p, { label: "", url: "/" }]);
  const removeMenuItem = (i: number) => setMenuItems((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-3xl">
      <h2 className="page-header">Homepage</h2>
      <p className="page-sub">Configure your store's homepage layout and content.</p>

      {/* ── Header Configuration ───────────────────────── */}
      <SectionCard title="Header Configuration">
        <FormField label="Store Name (Meta Title)" hint='Appears in browser tabs and as the text logo.'>
          <TextInput value={cfg.storeName} onChange={(v) => set({ storeName: v })} placeholder="My Store" />
        </FormField>

        {/* Logo Type */}
        <FormField label="Logo Type">
          <div className="flex items-center gap-6">
            {(["text", "image"] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="logoType"
                  value={type}
                  checked={cfg.logoType === type}
                  onChange={() => set({ logoType: type })}
                  className="accent-primary"
                />
                {type === "text" ? "Text Logo" : "Image Logo"}
              </label>
            ))}
          </div>
        </FormField>

        {/* Image logo uploads */}
        {cfg.logoType === "image" && (
          <FormField label="Logo Image" hint="Displayed in the navbar. PNG with transparent background recommended.">
            <ImageUploadBox
              label="Logo Image"
              value={cfg.logoImage}
              onChange={(v) => set({ logoImage: v })}
              aspectClass="w-40 h-20"
              storagePath="logo"
            />
          </FormField>
        )}

        {/* Favicon — always visible regardless of logo type */}
        <FormField
          label="Favicon"
          hint="Small icon shown in browser tabs. Use a square image (32×32 or 64×64 px). Visible even when using Text Logo."
        >
          <ImageUploadBox
            label="Favicon"
            value={cfg.favicon}
            onChange={(v) => set({ favicon: v })}
            aspectClass="w-16 h-16"
            round
            storagePath="favicon"
          />
        </FormField>

        {/* Logo height slider */}
        <FormField label={`Logo Height: ${cfg.logoHeight ?? 40}px`} hint="Controls the logo image / favicon height in the navbar.">
          <input
            type="range"
            min={20}
            max={80}
            value={cfg.logoHeight ?? 40}
            onChange={(e) => set({ logoHeight: Number(e.target.value) })}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>20px</span><span>80px</span>
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Navbar Background">
            <ColorInput value={cfg.navBgColor} onChange={(v) => set({ navBgColor: v })} />
          </FormField>
          <FormField label="Navbar Text Color">
            <ColorInput value={cfg.navTextColor} onChange={(v) => set({ navTextColor: v })} />
          </FormField>
        </div>

        <SaveButton label="Save Header" onClick={() => saveStoreConfig({
          storeName: cfg.storeName,
          logoType: cfg.logoType,
          logoImage: cfg.logoImage,
          favicon: cfg.favicon,
          navBgColor: cfg.navBgColor,
          navTextColor: cfg.navTextColor,
          logoHeight: cfg.logoHeight ?? 40,
        })} />
      </SectionCard>

      {/* ── Menu Items ─────────────────────────────────── */}
      <SectionCard title="Menu Items">
        <div className="flex flex-col gap-2 mb-3">
          {menuItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={item.label}
                placeholder="Label"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                defaultValue={item.url}
                placeholder="URL"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <input type="checkbox" defaultChecked className="accent-primary" />
                Active
              </label>
              <button
                onClick={() => removeMenuItem(i)}
                className="p-2 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addMenuItem}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </SectionCard>

      {/* ── Hero Section ───────────────────────────────── */}
      <SectionCard title="Hero Section">
        <label className="flex items-center gap-2 cursor-pointer mb-4 text-sm font-medium">
          <input
            type="checkbox"
            checked={cfg.heroEnabled}
            onChange={(e) => set({ heroEnabled: e.target.checked })}
            className="accent-primary w-4 h-4"
          />
          Show Hero Section
        </label>

        {cfg.heroEnabled && (
          <>
            <FormField label="Headline">
              <TextInput value={cfg.heroHeadline} onChange={(v) => set({ heroHeadline: v })} placeholder="Welcome to Our Store" />
            </FormField>

            <FormField label="Subheadline">
              <textarea
                value={cfg.heroSubheadline}
                onChange={(e) => set({ heroSubheadline: e.target.value })}
                placeholder="Discover amazing products..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Text Color">
                <ColorInput value={cfg.heroTextColor} onChange={(v) => set({ heroTextColor: v })} />
              </FormField>
              <FormField label="Text Alignment">
                <SelectInput
                  value={cfg.heroTextAlign}
                  onChange={(v) => set({ heroTextAlign: v as any })}
                  options={[
                    { label: "Left", value: "left" },
                    { label: "Center", value: "center" },
                    { label: "Right", value: "right" },
                  ]}
                />
              </FormField>
            </div>

            <FormField label="Background Type">
              <SelectInput
                value={cfg.heroBgType}
                onChange={(v) => set({ heroBgType: v as any })}
                options={[
                  { label: "Gradient (default)", value: "gradient" },
                  { label: "Image", value: "image" },
                  { label: "Solid Color", value: "color" },
                ]}
              />
            </FormField>

            {cfg.heroBgType === "image" && (
              <FormField label="Hero Background Image" hint="Full-width banner image. Recommended: 1920×600 px or larger.">
                <ImageUploadBox
                  label="Hero Background Image"
                  value={cfg.heroBgImage}
                  onChange={(v) => set({ heroBgImage: v })}
                  aspectClass="w-full h-32"
                  storagePath="hero"
                />
              </FormField>
            )}

            {cfg.heroBgType === "color" && (
              <FormField label="Background Color">
                <ColorInput value={cfg.heroBgColor} onChange={(v) => set({ heroBgColor: v })} />
              </FormField>
            )}

            <FormField label={`Overlay Opacity: ${cfg.heroOverlayOpacity}%`}>
              <input
                type="range"
                min={0}
                max={90}
                value={cfg.heroOverlayOpacity}
                onChange={(e) => set({ heroOverlayOpacity: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </FormField>

            <FormField label="Height">
              <SelectInput
                value={cfg.heroHeight}
                onChange={(v) => set({ heroHeight: v as any })}
                options={[
                  { label: "Small (400px)", value: "small" },
                  { label: "Medium (500px)", value: "medium" },
                  { label: "Large (600px)", value: "large" },
                  { label: "Full Screen", value: "full" },
                ]}
              />
            </FormField>

            {/* Primary CTA */}
            <div className="border border-border rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold mb-3">Primary Button</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Button Text">
                  <TextInput value={cfg.heroPrimaryText} onChange={(v) => set({ heroPrimaryText: v })} placeholder="Shop Now" />
                </FormField>
                <FormField label="URL">
                  <TextInput value={cfg.heroPrimaryUrl} onChange={(v) => set({ heroPrimaryUrl: v })} placeholder="/" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Background">
                  <ColorInput value={cfg.heroPrimaryBg} onChange={(v) => set({ heroPrimaryBg: v })} />
                </FormField>
                <FormField label="Text Color">
                  <ColorInput value={cfg.heroPrimaryColor} onChange={(v) => set({ heroPrimaryColor: v })} />
                </FormField>
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="border border-border rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3">Secondary Button (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Button Text">
                  <TextInput value={cfg.heroSecondaryText} onChange={(v) => set({ heroSecondaryText: v })} placeholder="Learn More" />
                </FormField>
                <FormField label="URL">
                  <TextInput value={cfg.heroSecondaryUrl} onChange={(v) => set({ heroSecondaryUrl: v })} placeholder="/" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Background">
                  <ColorInput value={cfg.heroSecondaryBg} onChange={(v) => set({ heroSecondaryBg: v })} />
                </FormField>
                <FormField label="Text Color">
                  <ColorInput value={cfg.heroSecondaryColor} onChange={(v) => set({ heroSecondaryColor: v })} />
                </FormField>
              </div>
            </div>
          </>
        )}

        <SaveButton
          label="Save Hero Section"
          onClick={() => saveStoreConfig({
            heroEnabled: cfg.heroEnabled,
            heroHeadline: cfg.heroHeadline,
            heroSubheadline: cfg.heroSubheadline,
            heroBgType: cfg.heroBgType,
            heroBgImage: cfg.heroBgImage,
            heroBgColor: cfg.heroBgColor,
            heroTextColor: cfg.heroTextColor,
            heroTextAlign: cfg.heroTextAlign,
            heroHeight: cfg.heroHeight,
            heroOverlayOpacity: cfg.heroOverlayOpacity,
            heroPrimaryText: cfg.heroPrimaryText,
            heroPrimaryUrl: cfg.heroPrimaryUrl,
            heroPrimaryBg: cfg.heroPrimaryBg,
            heroPrimaryColor: cfg.heroPrimaryColor,
            heroSecondaryText: cfg.heroSecondaryText,
            heroSecondaryUrl: cfg.heroSecondaryUrl,
            heroSecondaryBg: cfg.heroSecondaryBg,
            heroSecondaryColor: cfg.heroSecondaryColor,
          })}
        />
      </SectionCard>
    </div>
  );
}
