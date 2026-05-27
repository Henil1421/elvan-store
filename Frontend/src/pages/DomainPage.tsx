import { useState } from "react";
import { getAdminConfig, saveAdminConfig } from "@/lib/adminConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Globe } from "lucide-react";

export default function DomainPage() {
  const [domain, setDomain] = useState(getAdminConfig().domain || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");
    if (domain && !domain.startsWith("https://") && !domain.startsWith("http://")) {
      setError("Domain must start with https:// or http://");
      return;
    }
    if (domain.endsWith("/")) {
      setError("Do not include a trailing slash");
      return;
    }
    saveAdminConfig({ domain });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-5">
      {/* Info box */}
      <div className="flex gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <p className="font-semibold">Domain Configuration</p>
          <ul className="space-y-0.5 text-blue-700 dark:text-blue-400">
            <li>• This domain will be used for all product links, order tracking, and feed URLs</li>
            <li>• Enter your full domain URL including https:// (e.g., https://elvan.online)</li>
            <li>• Do not include a trailing slash</li>
            <li>• Changes take effect immediately across the entire site</li>
          </ul>
        </div>
      </div>

      {/* Domain settings */}
      <div className="section-card space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold">Domain Settings</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain-url">Website Domain URL</Label>
          <Input
            id="domain-url"
            type="url"
            placeholder="https://yourdomain.com"
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setError(""); }}
          />
          <p className="text-xs text-muted-foreground">
            Enter the full URL of your website (e.g., https://yourdomain.com). This will be used for generating all links, feeds, and tracking URLs.
          </p>
          {error && <p className="text-xs text-destructive font-medium">{error}</p>}
        </div>

        <Button onClick={handleSave} className="flex items-center gap-2">
          {saved ? "Domain Saved!" : "Save Domain"}
        </Button>
      </div>

      {/* CORS note */}
      <div className="section-card space-y-2">
        <h3 className="font-semibold text-sm">CORS & Data Access</h3>
        <p className="text-xs text-muted-foreground">
          Your storefront at the domain above is automatically allowed to fetch data from the backend. If you need to allow additional origins to access your API, add them below (one per line).
        </p>
        <textarea
          className="w-full h-24 p-3 rounded-lg border border-border bg-muted font-mono text-xs resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder={"https://allowed-origin.com\nhttps://another-origin.com"}
          readOnly
          value={domain ? `${domain}\nhttps://id-preview--03dfa9c5-3714-4711-beca-56cf58167d55.lovable.app` : ""}
        />
        <p className="text-xs text-muted-foreground">These origins are automatically allowed based on your domain setting.</p>
      </div>
    </div>
  );
}
