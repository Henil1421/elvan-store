import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Info, Save, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "payment_failure_settings";

interface PaymentLog {
  id: number;
  time: string;
  method: string;
  error: string;
  amount: string;
}

const MOCK_LOGS: PaymentLog[] = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  time: new Date(Date.now() - i * 3600000).toLocaleString(),
  method: i % 3 === 0 ? "Cash on Delivery" : "PayU Online",
  error: i % 5 === 0 ? "Gateway Timeout" : i % 3 === 0 ? "User Cancelled" : "Insufficient Funds",
  amount: `₹${(Math.random() * 5000 + 100).toFixed(2)}`,
}));

interface FailureConfig {
  enabled: boolean;
  popupTitle: string;
  popupMessage: string;
  primaryLabel: string;
  secondaryLabel: string;
  autoRedirect: boolean;
  forCOD: boolean;
  forPayU: boolean;
}

function loadConfig(): FailureConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    enabled: true,
    popupTitle: "Payment Failed",
    popupMessage: "Your payment could not be processed. Please try again or choose a different payment method.",
    primaryLabel: "Try Again",
    secondaryLabel: "Edit Payment Method",
    autoRedirect: false,
    forCOD: false,
    forPayU: true,
  };
}

export default function PaymentFailurePage() {
  const { toast } = useToast();
  const [cfg, setCfg] = useState<FailureConfig>(loadConfig);
  const [showPreview, setShowPreview] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const set = (patch: Partial<FailureConfig>) => setCfg((c) => ({ ...c, ...patch }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    toast({ title: "Saved", description: "Payment Failure settings saved." });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payment Failure Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure the popup and behavior when a payment fails.</p>
      </div>

      {/* Main config card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Enable Payment Failure Popup</p>
            <p className="text-xs text-muted-foreground mt-0.5">Show a popup when payment fails instead of a separate page</p>
          </div>
          <Switch checked={cfg.enabled} onCheckedChange={(v) => set({ enabled: v })} />
        </div>

        {/* Popup Title */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Popup Title</Label>
          <Input value={cfg.popupTitle} onChange={(e) => set({ popupTitle: e.target.value })} />
        </div>

        {/* Popup Message */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Popup Message</Label>
          <Textarea
            rows={4}
            value={cfg.popupMessage}
            onChange={(e) => set({ popupMessage: e.target.value })}
            className="resize-y"
          />
          <p className="text-xs text-muted-foreground">Supports simple HTML tags like &lt;strong&gt;, &lt;em&gt;, and &lt;br&gt;</p>
        </div>

        {/* Button labels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Primary Button Label</Label>
            <Input value={cfg.primaryLabel} onChange={(e) => set({ primaryLabel: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Secondary Button Label</Label>
            <Input value={cfg.secondaryLabel} onChange={(e) => set({ secondaryLabel: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Auto-Redirect */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Auto-Redirect</p>
          <p className="text-xs text-muted-foreground mt-0.5">Automatically retry payment after a delay</p>
        </div>
        <Switch checked={cfg.autoRedirect} onCheckedChange={(v) => set({ autoRedirect: v })} />
      </div>

      {/* Enable for Payment Methods */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <p className="text-sm font-semibold text-foreground">Enable for Payment Methods</p>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
          <Checkbox checked={cfg.forCOD} onCheckedChange={(v) => set({ forCOD: !!v })} />
          Cash on Delivery (COD)
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
          <Checkbox checked={cfg.forPayU} onCheckedChange={(v) => set({ forPayU: !!v })} />
          PayU Online Payment
        </label>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pb-6 flex-wrap">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
        <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
          <Eye className="w-4 h-4" /> Preview Popup
        </Button>
        <Button variant="outline" onClick={() => setShowLogs(true)} className="gap-2">
          <Info className="w-4 h-4" /> View Debug Log ({MOCK_LOGS.length})
        </Button>
      </div>

      {/* Preview Popup Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{cfg.popupTitle}</h2>
              <p
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: cfg.popupMessage }}
              />
              <div className="flex gap-3 w-full mt-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  {cfg.primaryLabel}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowPreview(false)}>
                  {cfg.secondaryLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Log Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-bold text-foreground">Payment Debug Log</h2>
                <p className="text-xs text-muted-foreground">{MOCK_LOGS.length} entries</p>
              </div>
              <button onClick={() => setShowLogs(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted text-muted-foreground text-xs">
                  <tr>
                    <th className="text-left px-4 py-2">#</th>
                    <th className="text-left px-4 py-2">Time</th>
                    <th className="text-left px-4 py-2">Method</th>
                    <th className="text-left px-4 py-2">Error</th>
                    <th className="text-left px-4 py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_LOGS.map((log) => (
                    <tr key={log.id} className="border-t border-border hover:bg-muted/50">
                      <td className="px-4 py-2 text-muted-foreground">{log.id}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{log.time}</td>
                      <td className="px-4 py-2">{log.method}</td>
                      <td className="px-4 py-2 text-destructive">{log.error}</td>
                      <td className="px-4 py-2 font-mono">{log.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
