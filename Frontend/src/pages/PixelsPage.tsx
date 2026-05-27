import { useState } from "react";
import { getAdminConfig, saveAdminConfig } from "@/lib/adminConfig";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Code2, CheckCircle2 } from "lucide-react";

type PixelTab = "facebook" | "google" | "custom";

export default function PixelsPage() {
  const cfg = getAdminConfig();
  const [tab, setTab] = useState<PixelTab>("facebook");

  const [fb, setFb] = useState(cfg.pixelFacebook);
  const [gp, setGp] = useState(cfg.pixelGoogle);
  const [custom, setCustom] = useState(cfg.pixelCustom);
  const [saved, setSaved] = useState<PixelTab | null>(null);

  const save = (which: PixelTab) => {
    if (which === "facebook") saveAdminConfig({ pixelFacebook: fb });
    if (which === "google") saveAdminConfig({ pixelGoogle: gp });
    if (which === "custom") saveAdminConfig({ pixelCustom: custom });
    setSaved(which);
    setTimeout(() => setSaved(null), 2000);
  };

  const tabs: { id: PixelTab; label: string }[] = [
    { id: "facebook", label: "Facebook Pixel" },
    { id: "google", label: "Google Pixel" },
    { id: "custom", label: "Custom Scripts" },
  ];

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Left sidebar */}
      <div className="w-48 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm text-foreground">Pixels</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                tab === t.id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {tab === "facebook" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Facebook Pixel</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Add your Facebook Pixel code to track page views and events across your store.</p>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${fb.enabled && fb.code ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${fb.enabled && fb.code ? "bg-green-500" : "bg-muted-foreground"}`} />
                {fb.enabled && fb.code ? "Loaded" : "Not Active"}
              </span>
            </div>

            <div className="section-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Enable Facebook Pixel</p>
                  <p className="text-xs text-muted-foreground">Load the Facebook Pixel script on all pages</p>
                </div>
                <Switch checked={fb.enabled} onCheckedChange={(v) => setFb({ ...fb, enabled: v })} />
              </div>

              <div className="space-y-2">
                <Label>Facebook Pixel Code</Label>
                <textarea
                  className="w-full h-40 p-3 rounded-lg border border-border bg-muted font-mono text-xs resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={`<!-- Meta Pixel Code -->\n<script>\n  !function(f,b,e,v,n,t,s)...\n</script>`}
                  value={fb.code}
                  onChange={(e) => setFb({ ...fb, code: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Paste the complete Facebook Pixel code from your Facebook Events Manager. You can paste either:<br />
                  • The full HTML code with &lt;script&gt; tags (recommended)<br />
                  • Just the JavaScript code
                </p>
              </div>

              {fb.enabled && fb.code && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-400">Pixel Loaded: Facebook Pixel is active and ready to track events.</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => save("facebook")}>
                  {saved === "facebook" ? "Saved!" : "Save"}
                </Button>
                <Button variant="outline">Test Pixel</Button>
              </div>
            </div>

            {/* Catalog Feed section */}
            <div className="section-card space-y-3">
              <div>
                <p className="font-medium">Facebook Catalog Feed URL</p>
                <p className="text-xs text-muted-foreground mt-0.5">Use this live product feed URL in Facebook Commerce Manager for Dynamic Ads and Catalog campaigns.</p>
              </div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`${getAdminConfig().domain || window.location.origin}/api/facebook-catalog-feed`}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-sm text-muted-foreground"
                />
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`${getAdminConfig().domain || window.location.origin}/api/facebook-catalog-feed`)}>Copy URL</Button>
              </div>
              <p className="text-xs text-muted-foreground">Feed Format: CSV with UTF-8 encoding</p>
            </div>
          </div>
        )}

        {tab === "google" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Google Pixel</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Add your Google Tag / Analytics code to track conversions and events.</p>
            </div>
            <div className="section-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Enable Google Pixel</p>
                  <p className="text-xs text-muted-foreground">Load the Google Tag script on all pages</p>
                </div>
                <Switch checked={gp.enabled} onCheckedChange={(v) => setGp({ ...gp, enabled: v })} />
              </div>
              <div className="space-y-2">
                <Label>Google Tag / GA4 Code</Label>
                <textarea
                  className="w-full h-40 p-3 rounded-lg border border-border bg-muted font-mono text-xs resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={`<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>`}
                  value={gp.code}
                  onChange={(e) => setGp({ ...gp, code: e.target.value })}
                />
              </div>
              <Button onClick={() => save("google")}>{saved === "google" ? "Saved!" : "Save"}</Button>
            </div>
          </div>
        )}

        {tab === "custom" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Custom Scripts</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Add any custom JavaScript or HTML scripts to load on every page.</p>
            </div>
            <div className="section-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Enable Custom Scripts</p>
                  <p className="text-xs text-muted-foreground">Inject custom scripts on all pages</p>
                </div>
                <Switch checked={custom.enabled} onCheckedChange={(v) => setCustom({ ...custom, enabled: v })} />
              </div>
              <div className="space-y-2">
                <Label>Custom Script Code</Label>
                <textarea
                  className="w-full h-52 p-3 rounded-lg border border-border bg-muted font-mono text-xs resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Paste any custom <script> tags or JavaScript here..."
                  value={custom.scripts}
                  onChange={(e) => setCustom({ ...custom, scripts: e.target.value })}
                />
              </div>
              <Button onClick={() => save("custom")}>{saved === "custom" ? "Saved!" : "Save"}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
