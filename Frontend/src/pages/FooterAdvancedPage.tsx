import { useState } from "react";
import { Save } from "lucide-react";
import { getFooterConfig, saveFooterConfig } from "@/lib/footerConfig";

function CB({ checked, onChange, label, indent = false }: { checked: boolean; onChange: (v: boolean) => void; label: string; indent?: boolean }) {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer ${indent ? "ml-6" : ""}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-primary" />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

export default function FooterAdvancedPage() {
  const cfg = getFooterConfig();
  const [hasChanges, setHasChanges] = useState(false);
  const [stickyFooter, setStickyFooter] = useState(cfg.stickyFooter);
  const [mobileAccordion, setMobileAccordion] = useState(cfg.mobileAccordion);
  const [openByDefault, setOpenByDefault] = useState(cfg.accordionOpenByDefault);
  const [showOnCheckout, setShowOnCheckout] = useState(cfg.showOnCheckout);
  const [showOnThankYou, setShowOnThankYou] = useState(cfg.showOnThankYou);

  const track = (fn: () => void) => { fn(); setHasChanges(true); };

  const handleSave = () => {
    saveFooterConfig({
      stickyFooter,
      mobileAccordion,
      accordionOpenByDefault: openByDefault,
      showOnCheckout,
      showOnThankYou,
    });
    setHasChanges(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Footer Settings - Advanced</h2>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${hasChanges ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : "bg-secondary text-muted-foreground border-border cursor-default"}`}
        >
          <Save className="w-3.5 h-3.5" />
          {hasChanges ? "Save Changes" : "No Changes"}
        </button>
      </div>

      <div className="section-card mb-5">
        <h3 className="text-base font-bold text-foreground mb-5">Advanced Settings</h3>
        <div className="flex flex-col gap-4">
          <CB checked={stickyFooter} onChange={(v) => track(() => setStickyFooter(v))} label="Sticky Footer (fixed to bottom of page)" />
          <div className="flex flex-col gap-3">
            <CB checked={mobileAccordion} onChange={(v) => track(() => setMobileAccordion(v))} label="Mobile Accordion (collapsible columns on mobile)" />
            {mobileAccordion && (
              <CB checked={openByDefault} onChange={(v) => track(() => setOpenByDefault(v))} label="Open by default" indent />
            )}
          </div>
        </div>

        <div className="h-px bg-border my-5" />

        <h3 className="text-base font-bold text-foreground mb-4">Page Visibility</h3>
        <div className="flex flex-col gap-4">
          <CB checked={showOnCheckout} onChange={(v) => track(() => setShowOnCheckout(v))} label="Show on Checkout Page" />
          <CB checked={showOnThankYou} onChange={(v) => track(() => setShowOnThankYou(v))} label="Show on Thank You Page" />
        </div>
      </div>
    </div>
  );
}
