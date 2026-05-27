import { useState } from "react";
import { getCountdownTimerConfig, saveCountdownTimerConfig, CountdownTimerConfig } from "@/lib/widgetsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

export default function CountdownTimerPage() {
  const [cfg, setCfg] = useState<CountdownTimerConfig>(getCountdownTimerConfig);
  const [saved, setSaved] = useState(false);

  const update = (patch: Partial<CountdownTimerConfig>) => setCfg((p) => ({ ...p, ...patch }));

  const handleSave = () => {
    saveCountdownTimerConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    update({ hours: 0, minutes: 55, seconds: 0 });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="page-header">Countdown Timer Widget</h2>
        <Button onClick={handleSave} className="bg-foreground text-background hover:bg-foreground/90">
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Timer Settings */}
          <div className="section-card space-y-4">
            <h3 className="font-semibold text-foreground">Timer Settings</h3>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={cfg.enabled} onCheckedChange={(v) => update({ enabled: !!v })} /> Enable Widget
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={cfg.paused} onCheckedChange={(v) => update({ paused: !!v })} /> Pause Timer
              </label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Hours</Label><Input type="number" value={cfg.hours} onChange={(e) => update({ hours: +e.target.value })} /></div>
              <div><Label className="text-xs">Minutes</Label><Input type="number" value={cfg.minutes} onChange={(e) => update({ minutes: +e.target.value })} /></div>
              <div><Label className="text-xs">Seconds</Label><Input type="number" value={cfg.seconds} onChange={(e) => update({ seconds: +e.target.value })} /></div>
            </div>
            <Button variant="destructive" className="w-full" onClick={handleReset}>Reset Timer</Button>
          </div>

          {/* Display Settings */}
          <div className="section-card space-y-4">
            <h3 className="font-semibold text-foreground">Display Settings</h3>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={cfg.showOnHomepage} onCheckedChange={(v) => update({ showOnHomepage: !!v })} /> Show on Homepage
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={cfg.showOnProduct} onCheckedChange={(v) => update({ showOnProduct: !!v })} /> Show on Product Pages
            </label>
            <div>
              <Label className="text-xs font-medium">Position on Product Page</Label>
              <Select value={cfg.positionOnProduct} onValueChange={(v: any) => update({ positionOnProduct: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="above-add-to-bag">Above Add to Bag Button</SelectItem>
                  <SelectItem value="below-add-to-bag">Below Add to Bag Button</SelectItem>
                  <SelectItem value="above-price">Above Price</SelectItem>
                  <SelectItem value="below-price">Below Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text Above Timer */}
          <TextSection
            title="Text Above Timer"
            show={cfg.showTextAbove}
            onShowChange={(v) => update({ showTextAbove: v })}
            text={cfg.textAbove}
            onTextChange={(v) => update({ textAbove: v })}
            fontSize={cfg.textAboveFontSize}
            onFontSizeChange={(v) => update({ textAboveFontSize: v })}
            fontWeight={cfg.textAboveFontWeight}
            onFontWeightChange={(v) => update({ textAboveFontWeight: v })}
            color={cfg.textAboveColor}
            onColorChange={(v) => update({ textAboveColor: v })}
            alignment={cfg.textAboveAlignment}
            onAlignmentChange={(v) => update({ textAboveAlignment: v })}
            label="Show Text Above"
          />

          {/* Text Inside Border */}
          <TextSection
            title="Text Inside Border"
            show={cfg.showTextInside}
            onShowChange={(v) => update({ showTextInside: v })}
            text={cfg.textInside}
            onTextChange={(v) => update({ textInside: v })}
            fontSize={cfg.textInsideFontSize}
            onFontSizeChange={(v) => update({ textInsideFontSize: v })}
            fontWeight={cfg.textInsideFontWeight}
            onFontWeightChange={(v) => update({ textInsideFontWeight: v })}
            color={cfg.textInsideColor}
            onColorChange={(v) => update({ textInsideColor: v })}
            alignment={cfg.textInsideAlignment}
            onAlignmentChange={(v) => update({ textInsideAlignment: v })}
            label="Show Text Inside Border"
          />

          {/* Text Below Timer */}
          <TextSection
            title="Text Below Timer"
            show={cfg.showTextBelow}
            onShowChange={(v) => update({ showTextBelow: v })}
            text={cfg.textBelow}
            onTextChange={(v) => update({ textBelow: v })}
            fontSize={cfg.textBelowFontSize}
            onFontSizeChange={(v) => update({ textBelowFontSize: v })}
            fontWeight={cfg.textBelowFontWeight}
            onFontWeightChange={(v) => update({ textBelowFontWeight: v })}
            color={cfg.textBelowColor}
            onColorChange={(v) => update({ textBelowColor: v })}
            alignment={cfg.textBelowAlignment}
            onAlignmentChange={(v) => update({ textBelowAlignment: v })}
            label="Show Text Below"
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Style Settings */}
          <div className="section-card space-y-4">
            <h3 className="font-semibold text-foreground">Style Settings</h3>
            <div><Label className="text-xs">Font Family</Label><Input value={cfg.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Number Font Size</Label><Input value={cfg.numberFontSize} onChange={(e) => update({ numberFontSize: e.target.value })} /></div>
              <div>
                <Label className="text-xs">Number Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={cfg.numberColor} onChange={(e) => update({ numberColor: e.target.value })} className="w-full h-10 rounded border cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Background Color</Label><Input value={cfg.bgColor} onChange={(e) => update({ bgColor: e.target.value })} /></div>
              <div><Label className="text-xs">Border Radius</Label><Input value={cfg.borderRadius} onChange={(e) => update({ borderRadius: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Card Spacing</Label><Input value={cfg.cardSpacing} onChange={(e) => update({ cardSpacing: e.target.value })} /></div>
          </div>

          {/* Gradient Border Settings */}
          <div className="section-card space-y-4">
            <h3 className="font-semibold text-foreground">Gradient Border Settings</h3>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={cfg.enableGradient} onCheckedChange={(v) => update({ enableGradient: !!v })} /> Enable Gradient Animation
            </label>
            <div>
              <Label className="text-xs">Gradient Colors (comma-separated)</Label>
              <Input value={cfg.gradientColors} onChange={(e) => update({ gradientColors: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Enter hex colors separated by commas</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Border Thickness</Label><Input value={cfg.borderThickness} onChange={(e) => update({ borderThickness: e.target.value })} /></div>
              <div><Label className="text-xs">Glow Strength</Label><Input value={cfg.glowStrength} onChange={(e) => update({ glowStrength: e.target.value })} /></div>
              <div><Label className="text-xs">Animation Speed</Label><Input value={cfg.animationSpeed} onChange={(e) => update({ animationSpeed: e.target.value })} /></div>
            </div>
          </div>

          {/* Preview */}
          <div className="section-card">
            <h3 className="font-semibold text-foreground mb-4">Preview</h3>
            <div className="rounded-lg bg-muted/50 p-6 flex items-center justify-center min-h-[80px]">
              <p className="text-sm text-muted-foreground">Timer will appear on the frontend based on your settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Text Section */
function TextSection({ title, label, show, onShowChange, text, onTextChange, fontSize, onFontSizeChange, fontWeight, onFontWeightChange, color, onColorChange, alignment, onAlignmentChange }: {
  title: string; label: string; show: boolean; onShowChange: (v: boolean) => void;
  text: string; onTextChange: (v: string) => void;
  fontSize: string; onFontSizeChange: (v: string) => void;
  fontWeight: string; onFontWeightChange: (v: string) => void;
  color: string; onColorChange: (v: string) => void;
  alignment: string; onAlignmentChange: (v: string) => void;
}) {
  return (
    <div className="section-card space-y-4">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={show} onCheckedChange={(v) => onShowChange(!!v)} /> {label}
      </label>
      {show && (
        <>
          <div><Label className="text-xs">Text</Label><Input value={text} onChange={(e) => onTextChange(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Font Size</Label><Input value={fontSize} onChange={(e) => onFontSizeChange(e.target.value)} /></div>
            <div>
              <Label className="text-xs">Font Weight</Label>
              <Select value={fontWeight} onValueChange={onFontWeightChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Bold">Bold</SelectItem>
                  <SelectItem value="Semi-Bold">Semi-Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Color</Label>
              <input type="color" value={color} onChange={(e) => onColorChange(e.target.value)} className="w-full h-10 rounded border cursor-pointer" />
            </div>
            <div>
              <Label className="text-xs">Alignment</Label>
              <Select value={alignment} onValueChange={onAlignmentChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Left">Left</SelectItem>
                  <SelectItem value="Center">Center</SelectItem>
                  <SelectItem value="Right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
