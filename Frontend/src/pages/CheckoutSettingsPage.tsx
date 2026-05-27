import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "checkout_settings";

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  isDefault: boolean;
  active: boolean;
}

interface CheckoutConfig {
  contact: { enabled: boolean; emailRequired: boolean; phoneRequired: boolean };
  delivery: {
    enabled: boolean;
    firstName: boolean; lastName: boolean;
    address1: boolean; address2: boolean;
    landmark: boolean; city: boolean;
    state: boolean; pincode: boolean;
    addressValidation: boolean;
  };
  shipping: { enabled: boolean; methods: ShippingMethod[] };
  payment: {
    cod: boolean;
    payuEnabled: boolean;
    payuMerchantKey: string;
    payuSaltKey: string;
    payuMode: "live" | "test";
  };
}

function loadConfig(): CheckoutConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    contact: { enabled: true, emailRequired: true, phoneRequired: true },
    delivery: {
      enabled: true,
      firstName: true, lastName: true,
      address1: true, address2: false,
      landmark: false, city: true,
      state: true, pincode: true,
      addressValidation: true,
    },
    shipping: {
      enabled: true,
      methods: [
        { id: "1", name: "Free Shipping", description: "Delivery within 5-7 business days", price: 0, isDefault: true, active: true },
      ],
    },
    payment: {
      cod: false,
      payuEnabled: true,
      payuMerchantKey: "",
      payuSaltKey: "",
      payuMode: "live",
    },
  };
}

function CB({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} />
      {label}
    </label>
  );
}

export default function CheckoutSettingsPage() {
  const { toast } = useToast();
  const [cfg, setCfg] = useState<CheckoutConfig>(loadConfig);
  const [newShip, setNewShip] = useState({ name: "", description: "", price: "0" });

  const setContact = (patch: Partial<CheckoutConfig["contact"]>) =>
    setCfg((c) => ({ ...c, contact: { ...c.contact, ...patch } }));
  const setDelivery = (patch: Partial<CheckoutConfig["delivery"]>) =>
    setCfg((c) => ({ ...c, delivery: { ...c.delivery, ...patch } }));
  const setShipping = (patch: Partial<CheckoutConfig["shipping"]>) =>
    setCfg((c) => ({ ...c, shipping: { ...c.shipping, ...patch } }));
  const setPayment = (patch: Partial<CheckoutConfig["payment"]>) =>
    setCfg((c) => ({ ...c, payment: { ...c.payment, ...patch } }));

  const addShippingMethod = () => {
    if (!newShip.name.trim()) return;
    const method: ShippingMethod = {
      id: Date.now().toString(),
      name: newShip.name,
      description: newShip.description,
      price: parseFloat(newShip.price) || 0,
      isDefault: false,
      active: true,
    };
    setShipping({ methods: [...cfg.shipping.methods, method] });
    setNewShip({ name: "", description: "", price: "0" });
  };

  const removeShippingMethod = (id: string) =>
    setShipping({ methods: cfg.shipping.methods.filter((m) => m.id !== id) });

  const toggleShippingActive = (id: string) =>
    setShipping({ methods: cfg.shipping.methods.map((m) => m.id === id ? { ...m, active: !m.active } : m) });

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    toast({ title: "Saved", description: "Checkout settings saved successfully." });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Checkout Settings</h1>

      {/* Contact Section */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-foreground">Contact Section</h2>
        <CB checked={cfg.contact.enabled} onCheckedChange={(v) => setContact({ enabled: v })} label="Enable Contact Section" />
        {cfg.contact.enabled && (
          <div className="ml-6 space-y-2">
            <CB checked={cfg.contact.emailRequired} onCheckedChange={(v) => setContact({ emailRequired: v })} label="Email Required" />
            <CB checked={cfg.contact.phoneRequired} onCheckedChange={(v) => setContact({ phoneRequired: v })} label="Phone Required" />
          </div>
        )}
      </div>

      {/* Delivery Address Section */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-foreground">Delivery Address Section</h2>
        <CB checked={cfg.delivery.enabled} onCheckedChange={(v) => setDelivery({ enabled: v })} label="Enable Delivery Section" />
        {cfg.delivery.enabled && (
          <div className="ml-6 grid grid-cols-2 gap-x-8 gap-y-2">
            <CB checked={cfg.delivery.firstName} onCheckedChange={(v) => setDelivery({ firstName: v })} label="First Name Required" />
            <CB checked={cfg.delivery.lastName} onCheckedChange={(v) => setDelivery({ lastName: v })} label="Last Name Required" />
            <CB checked={cfg.delivery.address1} onCheckedChange={(v) => setDelivery({ address1: v })} label="Address Line 1 Required" />
            <CB checked={cfg.delivery.address2} onCheckedChange={(v) => setDelivery({ address2: v })} label="Address Line 2 Required" />
            <CB checked={cfg.delivery.landmark} onCheckedChange={(v) => setDelivery({ landmark: v })} label="Landmark Required" />
            <CB checked={cfg.delivery.city} onCheckedChange={(v) => setDelivery({ city: v })} label="City Required" />
            <CB checked={cfg.delivery.state} onCheckedChange={(v) => setDelivery({ state: v })} label="State Required" />
            <CB checked={cfg.delivery.pincode} onCheckedChange={(v) => setDelivery({ pincode: v })} label="Pincode Required" />
            <div className="col-span-2">
              <CB checked={cfg.delivery.addressValidation} onCheckedChange={(v) => setDelivery({ addressValidation: v })} label="Enable Address Validation (Pincode/State/City Match)" />
            </div>
          </div>
        )}
      </div>

      {/* Shipping Methods */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Shipping Methods</h2>
        <CB checked={cfg.shipping.enabled} onCheckedChange={(v) => setShipping({ enabled: v })} label="Enable Shipping Section" />
        {cfg.shipping.enabled && (
          <div className="space-y-3">
            {cfg.shipping.methods.map((m) => (
              <div key={m.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.name} — ₹{m.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                  {m.isDefault && (
                    <span className="inline-block mt-1 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">Default</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                    <Checkbox checked={m.active} onCheckedChange={() => toggleShippingActive(m.id)} />
                    Active
                  </label>
                  <button className="text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => removeShippingMethod(m.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}

            {/* Add new */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Add New Shipping Method</p>
              <div className="flex gap-2">
                <Input placeholder="Name" value={newShip.name} onChange={(e) => setNewShip((s) => ({ ...s, name: e.target.value }))} className="flex-1" />
                <Input placeholder="Description" value={newShip.description} onChange={(e) => setNewShip((s) => ({ ...s, description: e.target.value }))} className="flex-1" />
                <Input type="number" placeholder="0" value={newShip.price} onChange={(e) => setNewShip((s) => ({ ...s, price: e.target.value }))} className="w-24" />
                <Button onClick={addShippingMethod} className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Payment Methods</h2>
        <CB checked={cfg.payment.cod} onCheckedChange={(v) => setPayment({ cod: v })} label="Enable Cash on Delivery (COD)" />
        <CB checked={cfg.payment.payuEnabled} onCheckedChange={(v) => setPayment({ payuEnabled: v })} label="Enable PayU Payment Gateway" />
        {cfg.payment.payuEnabled && (
          <div className="ml-6 space-y-3">
            <div className="space-y-1">
              <Label className="text-sm">PayU Merchant Key</Label>
              <Input value={cfg.payment.payuMerchantKey} onChange={(e) => setPayment({ payuMerchantKey: e.target.value })} placeholder="Merchant Key" />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">PayU Salt Key</Label>
              <Input type="password" value={cfg.payment.payuSaltKey} onChange={(e) => setPayment({ payuSaltKey: e.target.value })} placeholder="Salt Key" />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">PayU Mode</Label>
              <Select value={cfg.payment.payuMode} onValueChange={(v: "live" | "test") => setPayment({ payuMode: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="live">Live Mode</SelectItem>
                  <SelectItem value="test">Test Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
