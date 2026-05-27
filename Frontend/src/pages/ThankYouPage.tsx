import { useState } from "react";
import { Save, RotateCcw, Eye, EyeOff } from "lucide-react";
import ThankYouView from "./ThankYouView";

const defaultConfig = {
  showOrderSummary: true,
  showMapBlock: false,
  showConfirmationMessage: true,
  showOrderDetails: true,
  showContinueShopping: true,
  thankYouMessage: "Thank you, {customer_name}!",
  confirmationTitle: "Your order is confirmed",
  confirmationSubtitle: "You'll receive a confirmation email with your order number shortly.",
  continueButtonText: "Continue shopping",
  containerWidth: "large",
  borderRadius: "medium",
  spacing: "normal",
  fontSize: "base",
  fontFamily: "",
};

const STORAGE_KEY = "thankyou-page-config";

function load() {
  try { return { ...defaultConfig, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return defaultConfig; }
}

export default function ThankYouPage() {
  const [cfg, setCfg] = useState(load);
  const [showPreview, setShowPreview] = useState(false);

  const update = (key: string, value: unknown) =>
    setCfg((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    const el = document.createElement("div");
    el.className = "fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm shadow-lg";
    el.textContent = "Configuration saved!";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };

  const reset = () => {
    setCfg(defaultConfig);
    localStorage.removeItem(STORAGE_KEY);
  };

  const Checkbox = ({ field, label, desc }: { field: string; label: string; desc: string }) => (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={cfg[field as keyof typeof cfg] as boolean}
        onChange={(e) => update(field, e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border text-primary accent-primary"
      />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </label>
  );

  const sampleItems = [
    { title: "Classic Polo T-Shirt", image: "", qty: 2, price: 599, selectedSize: "M", selectedColor: "Navy" },
    { title: "Premium Cotton Shorts", image: "", qty: 1, price: 899, selectedSize: "L", selectedColor: "Black" },
  ];

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="page-header">Thank You Page Settings</h2>
          <p className="page-sub">Configure the Thank You page that customers see after completing their order.</p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {showPreview && (
        <div className="section-card mb-4 p-0 overflow-hidden">
          <div className="bg-secondary/50 px-4 py-2 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground">LIVE PREVIEW</p>
          </div>
          <div className="scale-[0.85] origin-top">
            <ThankYouView
              orderNumber="ORD-2026-00123"
              customerName="John"
              items={sampleItems}
              total={2097}
              shippingAddress={{
                firstName: "John",
                lastName: "Doe",
                address: "123 MG Road",
                apartment: "Apt 4B",
                city: "Mumbai",
                state: "Maharashtra",
                pinCode: "400001",
                country: "India",
              }}
              onContinueShopping={() => {}}
              onTrackOrder={() => {}}
            />
          </div>
        </div>
      )}

      {/* Page Elements */}
      <div className="section-card mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Page Elements</h3>
        <div className="flex flex-col gap-4">
          <Checkbox field="showOrderSummary" label="Show Order Summary Dropdown" desc="Display expandable order summary in header with product list" />
          <Checkbox field="showMapBlock" label="Show Map Block" desc="Display Google Maps with shipping address pin location" />
          <Checkbox field="showConfirmationMessage" label="Show Order Confirmation Message" desc="Display confirmation card with custom text" />
          <Checkbox field="showOrderDetails" label="Show Order Details Block" desc="Display shipping address, billing address, payment method" />
          <Checkbox field="showContinueShopping" label="Show Continue Shopping Button" desc="Display button linking back to homepage" />
        </div>
      </div>

      {/* Custom Text */}
      <div className="section-card mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Custom Text</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Thank You Message</label>
            <input
              type="text"
              value={cfg.thankYouMessage}
              onChange={(e) => update("thankYouMessage", e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Use {"{customer_name}"} to insert the customer's first name</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Confirmation Title</label>
            <input
              type="text"
              value={cfg.confirmationTitle}
              onChange={(e) => update("confirmationTitle", e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Confirmation Subtitle</label>
            <textarea
              value={cfg.confirmationSubtitle}
              onChange={(e) => update("confirmationSubtitle", e.target.value)}
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Continue Button Text</label>
            <input
              type="text"
              value={cfg.continueButtonText}
              onChange={(e) => update("continueButtonText", e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Layout & Styling */}
      <div className="section-card mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Layout & Styling</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Container Width</label>
            <select
              value={cfg.containerWidth}
              onChange={(e) => update("containerWidth", e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="small">Small (768px)</option>
              <option value="medium">Medium (896px)</option>
              <option value="large">Large (1024px)</option>
              <option value="full">Full Width</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Border Radius</label>
            <select
              value={cfg.borderRadius}
              onChange={(e) => update("borderRadius", e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="none">None</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Spacing</label>
            <select
              value={cfg.spacing}
              onChange={(e) => update("spacing", e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Font Size</label>
            <select
              value={cfg.fontSize}
              onChange={(e) => update("fontSize", e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="sm">Small</option>
              <option value="base">Base</option>
              <option value="lg">Large</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">Font Family (Optional)</label>
            <input
              type="text"
              value={cfg.fontFamily}
              onChange={(e) => update("fontFamily", e.target.value)}
              placeholder="e.g., Inter, system-ui, sans-serif"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Leave empty to use the default font family</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={save}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Configuration
        </button>
      </div>
    </div>
  );
}
