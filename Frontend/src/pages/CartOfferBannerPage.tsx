import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "cart_offer_banner";

interface BannerConfig {
  enabled: boolean;
  primaryText: string;
  secondaryText: string;
  bgColor: string;
  textColor: string;
}

function loadConfig(): BannerConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    enabled: false,
    primaryText: "Buy 2 Get 1 Free",
    secondaryText: "B2G1",
    bgColor: "#542b2b",
    textColor: "#FFFFFF",
  };
}

export default function CartOfferBannerPage() {
  const { toast } = useToast();
  const [cfg, setCfg] = useState<BannerConfig>(loadConfig);

  const set = (patch: Partial<BannerConfig>) => setCfg((c) => ({ ...c, ...patch }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    toast({ title: "Saved", description: "Cart Offer Banner settings saved." });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h1 className="text-xl font-bold text-foreground">Cart Offer Banner</h1>
        <p className="text-sm text-muted-foreground mt-1">Display promotional messages in the cart page</p>
      </div>

      {/* Settings card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Enable Offer Banner</p>
            <p className="text-xs text-muted-foreground mt-0.5">Show the offer banner on cart page</p>
          </div>
          <Switch checked={cfg.enabled} onCheckedChange={(v) => set({ enabled: v })} />
        </div>

        {/* Primary Text */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Primary Text</Label>
          <Input
            value={cfg.primaryText}
            onChange={(e) => set({ primaryText: e.target.value })}
            placeholder="Buy 2 Get 1 Free"
          />
        </div>

        {/* Secondary Text */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Secondary Text (Optional)</Label>
          <Input
            value={cfg.secondaryText}
            onChange={(e) => set({ secondaryText: e.target.value })}
            placeholder="B2G1"
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Background Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cfg.bgColor}
                onChange={(e) => set({ bgColor: e.target.value })}
                className="w-10 h-10 rounded border border-border cursor-pointer p-0.5 bg-background"
              />
              <Input
                value={cfg.bgColor}
                onChange={(e) => set({ bgColor: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cfg.textColor}
                onChange={(e) => set({ textColor: e.target.value })}
                className="w-10 h-10 rounded border border-border cursor-pointer p-0.5 bg-background"
              />
              <Input
                value={cfg.textColor}
                onChange={(e) => set({ textColor: e.target.value })}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <div
            className="w-full rounded-lg py-5 text-center"
            style={{ backgroundColor: cfg.bgColor, color: cfg.textColor }}
          >
            <p className="font-bold text-base">{cfg.primaryText || "Primary Text"}</p>
            {cfg.secondaryText && (
              <p className="text-sm mt-1 opacity-90">{cfg.secondaryText}</p>
            )}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
