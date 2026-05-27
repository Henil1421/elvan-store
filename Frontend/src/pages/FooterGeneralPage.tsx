import { useState, useEffect } from "react";
import {
  Save, Code, Bold, Italic, List, ListOrdered,
  Link, Image, Undo, Redo, Copy,
} from "lucide-react";
import { getFooterConfig, saveFooterConfig } from "@/lib/footerConfig";

/* ── helpers ──────────────────────────────────────────── */
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="mt-8 mb-5">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="h-px bg-border mt-2" />
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center border border-border rounded-lg overflow-hidden h-10">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-full border-0 bg-transparent cursor-pointer p-1 shrink-0"
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

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-primary"
      />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </label>
  );
}

/* ── Rich text mini-toolbar ───────────────────────────── */
const editorTools = [
  { icon: Code, title: "Code" },
  { icon: Bold, title: "Bold" },
  { icon: Italic, title: "Italic" },
  { icon: List, title: "Bullet List" },
  { icon: ListOrdered, title: "Numbered List" },
  { icon: Link, title: "Link" },
  { icon: Image, title: "Image" },
  { icon: Undo, title: "Undo" },
  { icon: Redo, title: "Redo" },
  { icon: Copy, title: "Copy" },
];

function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-secondary/40 flex-wrap">
        {editorTools.map(({ icon: Icon, title }, i) => (
          <button
            key={i}
            title={title}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full px-4 py-3 text-sm bg-background text-foreground focus:outline-none resize-none"
      />
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
const stylePresets = ["Light", "Dark", "Minimal", "Modern", "Premium", "Branded"];

export default function FooterGeneralPage() {
  const cfg = getFooterConfig();
  const [hasChanges, setHasChanges] = useState(false);
  const [showFooter, setShowFooter] = useState(cfg.showFooter);
  const [layoutColumns, setLayoutColumns] = useState("4 Columns");
  const [stylePreset, setStylePreset] = useState("Light");
  const [bgColor, setBgColor] = useState(cfg.bgColor);
  const [textColor, setTextColor] = useState(cfg.textColor);
  const [linkColor, setLinkColor] = useState(cfg.linkColor);
  const [linkHoverColor, setLinkHoverColor] = useState("#2563eb");
  const [fontSize, setFontSize] = useState("Small");
  const [showTopBar, setShowTopBar] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(cfg.showAboutUs);
  const [aboutContent, setAboutContent] = useState(cfg.aboutContent);
  const [copyrightText, setCopyrightText] = useState(cfg.copyrightText);
  const [showLogoBottom, setShowLogoBottom] = useState(cfg.showLogoBottom);
  const [bottomTextColor, setBottomTextColor] = useState("#ffffff");
  const [showLegalLinks, setShowLegalLinks] = useState(false);

  const track = (fn: () => void) => { fn(); setHasChanges(true); };

  const handleSave = () => {
    saveFooterConfig({
      showFooter,
      bgColor,
      textColor,
      linkColor,
      showAboutUs,
      aboutContent,
      copyrightText,
      showLogoBottom,
    });
    setHasChanges(false);
  };

  return (
    <div className="max-w-3xl">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Footer Settings - General</h2>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            hasChanges
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              : "bg-secondary text-muted-foreground border-border cursor-default"
          }`}
        >
          <Save className="w-3.5 h-3.5" />
          {hasChanges ? "Save Changes" : "No Changes"}
        </button>
      </div>

      {/* Show Footer */}
      <div className="section-card mb-5">
        <Checkbox
          checked={showFooter}
          onChange={(v) => track(() => setShowFooter(v))}
          label="Show Footer"
        />
      </div>

      {/* Layout & Style */}
      <div className="section-card mb-5">
        <FormField label="Layout Columns">
          <select
            value={layoutColumns}
            onChange={(e) => track(() => setLayoutColumns(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            {["1 Column", "2 Columns", "3 Columns", "4 Columns", "5 Columns"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Style Preset">
          <div className="grid grid-cols-3 gap-2">
            {stylePresets.map((p) => (
              <button
                key={p}
                onClick={() => track(() => setStylePreset(p))}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  stylePreset === p
                    ? "bg-primary/10 text-primary border-primary"
                    : "bg-background text-foreground border-border hover:bg-secondary"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Background Color">
            <ColorRow value={bgColor} onChange={(v) => track(() => setBgColor(v))} />
          </FormField>
          <FormField label="Text Color">
            <ColorRow value={textColor} onChange={(v) => track(() => setTextColor(v))} />
          </FormField>
          <FormField label="Link Color">
            <ColorRow value={linkColor} onChange={(v) => track(() => setLinkColor(v))} />
          </FormField>
          <FormField label="Link Hover Color">
            <ColorRow value={linkHoverColor} onChange={(v) => track(() => setLinkHoverColor(v))} />
          </FormField>
        </div>

        <FormField label="Font Size">
          <select
            value={fontSize}
            onChange={(e) => track(() => setFontSize(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            {["Small", "Medium", "Large"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </FormField>
      </div>

      {/* Top Bar Promo */}
      <div className="section-card mb-5">
        <SectionDivider title="Top Bar Promo" />
        <Checkbox
          checked={showTopBar}
          onChange={(v) => track(() => setShowTopBar(v))}
          label="Show Top Bar"
        />
      </div>

      {/* About Us Section */}
      <div className="section-card mb-5">
        <SectionDivider title="About Us Section" />
        <div className="mb-4">
          <Checkbox
            checked={showAboutUs}
            onChange={(v) => track(() => setShowAboutUs(v))}
            label="Show About Us Section"
          />
        </div>
        {showAboutUs && (
          <FormField label="About Us Content" hint="This section will appear at the top of your footer">
            <RichEditor value={aboutContent} onChange={(v) => { setAboutContent(v); setHasChanges(true); }} />
          </FormField>
        )}
      </div>

      {/* Copyright & Legal */}
      <div className="section-card mb-5">
        <SectionDivider title="Copyright & Legal" />

        <FormField label="Copyright Text" hint="Use {{year}} for current year">
          <input
            type="text"
            value={copyrightText}
            onChange={(e) => track(() => setCopyrightText(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </FormField>

        <div className="mb-4">
          <Checkbox
            checked={showLogoBottom}
            onChange={(v) => track(() => setShowLogoBottom(v))}
            label="Show Logo in Footer Bottom"
          />
        </div>

        <FormField label="Bottom Section Text Color" hint="Color for copyright text in footer bottom section">
          <ColorRow value={bottomTextColor} onChange={(v) => track(() => setBottomTextColor(v))} />
        </FormField>

        <div className="mb-3">
          <Checkbox
            checked={showLegalLinks}
            onChange={(v) => track(() => setShowLegalLinks(v))}
            label="Show Legal Links"
          />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Note: Legal links are managed from the <strong className="text-foreground">Policies</strong> section in the admin panel.
          Links will appear here if they have "Show in Footer" enabled.
        </p>
      </div>
    </div>
  );
}
