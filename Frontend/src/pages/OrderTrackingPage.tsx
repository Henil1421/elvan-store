import { useState } from "react";
import { Save, RotateCcw, Eye } from "lucide-react";

const STORAGE_KEY = "order-tracking-config";

const defaultSteps = [
  { title: "Order Received", description: "Your order has been received and is being prepared" },
  { title: "Order Confirmed", description: "Your order has been confirmed and verified" },
  { title: "Order Processing", description: "Your order is being processed and prepared for shipment" },
  { title: "Shipped at courier office", description: "Your order has been handed over to the courier partner" },
  { title: "In Transit", description: "Your order is on the way to your delivery location" },
  { title: "Out for Delivery", description: "Your order is out for delivery and will reach you soon" },
  { title: "Delivered", description: "Your order has been delivered successfully" },
];

const defaultDays = { step1: 1, step2: 1, step3: 2, step4: 3, step5start: 4, step5end: 6, step6start: 7, step6end: 8 };

const defaultConfig = {
  enabled: true,
  demoMode: false,
  maskAddress: true,
  rateLimit: 10,
  days: defaultDays,
  steps: defaultSteps,
};

function load() {
  try { return { ...defaultConfig, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return defaultConfig; }
}

const inp = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

export default function OrderTrackingPage() {
  const [cfg, setCfg] = useState(load);

  const set = (key: string, value: unknown) => setCfg((p) => ({ ...p, [key]: value }));
  const setDay = (key: string, value: number) => setCfg((p) => ({ ...p, days: { ...p.days, [key]: value } }));
  const setStep = (idx: number, field: "title" | "description", value: string) =>
    setCfg((p) => {
      const steps = [...p.steps];
      steps[idx] = { ...steps[idx], [field]: value };
      return { ...p, steps };
    });

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    const el = document.createElement("div");
    el.className = "fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm shadow-lg";
    el.textContent = "Changes saved!";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const revert = () => {
    setCfg(defaultConfig);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h2 className="page-header mb-0">Order Tracking Settings</h2>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg text-foreground hover:bg-secondary transition-colors">
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>
      <p className="page-sub mb-5">Configure order tracking feature for customers</p>

      {/* Top toggles + rate limit */}
      <div className="section-card mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={cfg.enabled} onChange={(e) => set("enabled", e.target.checked)} className="mt-0.5 accent-primary h-4 w-4" />
            <div>
              <p className="text-sm font-medium text-foreground">Enable Order Tracking</p>
              <p className="text-xs text-muted-foreground">Allow customers to track their orders</p>
            </div>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={cfg.demoMode} onChange={(e) => set("demoMode", e.target.checked)} className="mt-0.5 accent-primary h-4 w-4" />
            <div>
              <p className="text-sm font-medium text-foreground">Demo Mode</p>
              <p className="text-xs text-muted-foreground">Show demo data for testing</p>
            </div>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={cfg.maskAddress} onChange={(e) => set("maskAddress", e.target.checked)} className="mt-0.5 accent-primary h-4 w-4" />
            <div>
              <p className="text-sm font-medium text-foreground">Mask Full Address</p>
              <p className="text-xs text-muted-foreground">Hide sensitive address details</p>
            </div>
          </label>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Rate Limit (requests/min)</label>
            <input type="number" min={1} max={100} className={inp} value={cfg.rateLimit} onChange={(e) => set("rateLimit", parseInt(e.target.value) || 10)} />
          </div>
        </div>
      </div>

      {/* Timeline Day Mapping */}
      <div className="section-card mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Timeline Day Mapping</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Step 1 - Order Received (Day)", key: "step1" },
            { label: "Step 2 - Order Confirmed (Day)", key: "step2" },
            { label: "Step 3 - Order Processing (Day)", key: "step3" },
            { label: "Step 4 - Shipped at Courier (Day)", key: "step4" },
            { label: "Step 5 - In Transit (Start Day)", key: "step5start" },
            { label: "Step 5 - In Transit (End Day)", key: "step5end" },
            { label: "Step 6 - Out for Delivery (Start Day)", key: "step6start" },
            { label: "Step 6 - Out for Delivery (End Day)", key: "step6end" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
              <input
                type="number"
                min={0}
                className={inp}
                value={cfg.days[key as keyof typeof cfg.days]}
                onChange={(e) => setDay(key, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Note: Day 9 and beyond will remain at "Out for Delivery" status. "Delivered" is never shown as completed.
        </p>
      </div>

      {/* Step Text Customization */}
      <div className="section-card mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Step Text Customization</h3>
        <div className="flex flex-col gap-6">
          {cfg.steps.map((step, idx) => (
            <div key={idx}>
              <p className="text-sm font-semibold text-foreground mb-2">Step {idx + 1}</p>
              <div className="mb-2">
                <label className="block text-xs font-medium text-foreground mb-1">Title</label>
                <input
                  className={inp}
                  value={step.title}
                  onChange={(e) => setStep(idx, "title", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                <textarea
                  className={`${inp} resize-none`}
                  rows={2}
                  value={step.description}
                  onChange={(e) => setStep(idx, "description", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button
          onClick={revert}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Revert
        </button>
      </div>
    </div>
  );
}
