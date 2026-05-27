import { useState, useEffect } from "react";
import { getLiveViewerCountConfig, saveLiveViewerCountConfig, LiveViewerCountConfig } from "@/lib/widgetsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Eye } from "lucide-react";

export default function LiveViewerCountPage() {
  const [cfg, setCfg] = useState<LiveViewerCountConfig>(getLiveViewerCountConfig);
  const [saved, setSaved] = useState(false);
  const [liveCount, setLiveCount] = useState(0);

  const update = (patch: Partial<LiveViewerCountConfig>) => setCfg((p) => ({ ...p, ...patch }));

  useEffect(() => {
    const rand = () => Math.floor(Math.random() * (cfg.maxCount - cfg.minCount + 1)) + cfg.minCount;
    setLiveCount(rand());
    const id = setInterval(() => setLiveCount(rand()), cfg.updateInterval * 1000);
    return () => clearInterval(id);
  }, [cfg.minCount, cfg.maxCount, cfg.updateInterval]);

  const handleSave = () => {
    saveLiveViewerCountConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="page-header">Live Viewer Count</h2>
          <p className="page-sub">Display social proof to create urgency on product pages</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />{saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="section-card space-y-5">
          <h3 className="font-semibold text-foreground text-base">Settings</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-foreground">Enable Live Viewer Count</p>
              <p className="text-xs text-muted-foreground">Show viewer count on product pages</p>
            </div>
            <Switch checked={cfg.enabled} onCheckedChange={(v) => update({ enabled: v })} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Minimum Count</Label>
            <Input type="number" value={cfg.minCount} onChange={(e) => update({ minCount: +e.target.value })} />
            <p className="text-xs text-muted-foreground">Lowest number of viewers to display</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Maximum Count</Label>
            <Input type="number" value={cfg.maxCount} onChange={(e) => update({ maxCount: +e.target.value })} />
            <p className="text-xs text-muted-foreground">Highest number of viewers to display</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Update Interval (seconds)</Label>
            <Input type="number" value={cfg.updateInterval} onChange={(e) => update({ updateInterval: +e.target.value })} />
            <p className="text-xs text-muted-foreground">How often the count updates</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Display Text</Label>
            <Input value={cfg.displayText} onChange={(e) => update({ displayText: e.target.value })} />
            <p className="text-xs text-muted-foreground">Use {"{count}"} as placeholder for the number</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Dot Color</Label>
            <div className="flex gap-2">
              <input type="color" value={cfg.dotColor} onChange={(e) => update({ dotColor: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
              <Input value={cfg.dotColor} onChange={(e) => update({ dotColor: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Text Color</Label>
            <div className="flex gap-2">
              <input type="color" value={cfg.textColor} onChange={(e) => update({ textColor: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
              <Input value={cfg.textColor} onChange={(e) => update({ textColor: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="section-card">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground text-base">Live Preview</h3>
          </div>
          <div className="rounded-lg border-2 border-dashed p-6">
            <h4 className="text-xl font-bold text-foreground">Product Name</h4>
            <p className="text-lg text-foreground mt-1">₹1,299</p>
            <hr className="my-4" />
            <div className="flex items-center gap-2" style={{ color: cfg.textColor }}>
              <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: cfg.dotColor }} />
              <span className="text-sm font-medium">
                {cfg.displayText.replace("{count}", String(liveCount))}
              </span>
            </div>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This creates social proof using a dynamic counter. The number fluctuates between your min/max range to appear realistic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
