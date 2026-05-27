import { useState } from "react";
import { getAdminConfig, saveAdminConfig } from "@/lib/adminConfig";
import { Button } from "@/components/ui/button";
import { Zap, Activity, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "smart" | "ultra-aggressive" | "balanced";

interface ModeConfig {
  id: Mode;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  bullets: string[];
  pros: string[];
  cons: string[];
}

const modes: ModeConfig[] = [
  {
    id: "smart",
    label: "Smart (Recommended)",
    subtitle: "Intelligent prioritization for optimal LCP",
    icon: Zap,
    bullets: [
      "Loads hero/LCP images first (critical path)",
      "Then loads first 6 products (above fold)",
      "Respects browser connection limits (6-8 parallel)",
      "Lazy loads everything else progressively",
      "Best for: Everyone – fastest LCP score",
    ],
    pros: ["Fastest LCP", "Zero network congestion", "Optimal Core Web Vitals", "Works on all connections"],
    cons: ["None – this is the optimal mode"],
  },
  {
    id: "ultra-aggressive",
    label: "Ultra Aggressive",
    subtitle: "Loads all images in sequential batches",
    icon: Activity,
    bullets: [
      "Loads ALL images in batches of 6",
      "Sequential loading (no congestion)",
      "Inlines first 10 products in HTML",
      "Respects browser connection limits",
      "Best for: Small catalogs (<50 products)",
    ],
    pros: ["All images preloaded", "No lazy loading needed", "Good for small catalogs"],
    cons: ["Higher bandwidth", "Takes longer to complete all loads"],
  },
  {
    id: "balanced",
    label: "Balanced",
    subtitle: "Smart loading, good for medium catalogs",
    icon: RefreshCw,
    bullets: [
      "Loads first 12 images in 2 batches of 6",
      "Defers next 18 images after 1 second",
      "Lazy loads remaining as you scroll",
      "Best for: Medium catalogs (50-200 products)",
    ],
    pros: ["Good initial load", "Balanced bandwidth", "Works on all devices"],
    cons: ["Slightly slower LCP than Smart mode"],
  },
];

export default function PerformanceModePage() {
  const [selected, setSelected] = useState<Mode>(getAdminConfig().performanceMode);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveAdminConfig({ performanceMode: selected });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="page-header">Performance Mode</h2>
        <p className="page-sub">Choose how aggressively to load images and optimize performance</p>
      </div>

      <div className="flex flex-col gap-4">
        {modes.map((mode) => {
          const isActive = selected === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelected(mode.id)}
              className={cn(
                "text-left p-5 rounded-xl border-2 transition-all",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  <mode.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{mode.label}</span>
                    {isActive && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{mode.subtitle}</p>
                  <ul className="space-y-1 mb-4">
                    {mode.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1.5">Pros:</p>
                      <ul className="space-y-1">
                        {mode.pros.map((p, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-orange-500 mb-1.5">Cons:</p>
                      <ul className="space-y-1">
                        {mode.cons.map((c, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 text-orange-400 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>{saved ? "Applied!" : "Save & Apply"}</Button>
      </div>
    </div>
  );
}
