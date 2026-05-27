import { useState, useRef } from "react";
import { Lock } from "lucide-react";
import { CartItem } from "@/pages/CartPage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar", "Chandigarh", "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

interface CheckoutPageProps {
  items: CartItem[];
  discountAmount: number;
  discountLabel: string;
  onOrderPlaced: (orderNumber: string, firstName: string, shippingAddress?: { firstName: string; lastName: string; address: string; apartment?: string; city: string; state: string; pinCode: string; country: string }) => void;
  onBack: () => void;
}

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

function loadCheckoutConfig(): CheckoutConfig {
  try {
    const raw = localStorage.getItem("checkout_settings");
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
    payment: { cod: false, payuEnabled: true, payuMerchantKey: "", payuSaltKey: "", payuMode: "live" },
  };
}

export default function CheckoutPage({ items, discountAmount, discountLabel, onOrderPlaced, onBack }: CheckoutPageProps) {
  const { toast } = useToast();
  const [placing, setPlacing] = useState(false);
  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuData, setPayuData] = useState<{ url: string; params: Record<string, string> } | null>(null);
  const cfg = loadCheckoutConfig();

  const activeShippingMethods = cfg.shipping.enabled
    ? cfg.shipping.methods.filter(m => m.active)
    : [];
  const defaultShipping = activeShippingMethods.find(m => m.isDefault) || activeShippingMethods[0];

  // Determine default payment method
  const defaultPayment = cfg.payment.payuEnabled ? "payu" : cfg.payment.cod ? "cod" : "payu";

  const [form, setForm] = useState({
    email: "", phone: "", firstName: "", lastName: "", address: "", apartment: "",
    landmark: "", pinCode: "", city: "", state: "", country: "India", saveInfo: false,
    shippingMethod: defaultShipping?.id || "free",
    paymentMethod: defaultPayment,
  });

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  const selectedShipping = activeShippingMethods.find(m => m.id === form.shippingMethod) || defaultShipping;
  const shippingCost = selectedShipping?.price || 0;

  const subtotal = items.reduce((s, i) => s + (i.product.variants[0]?.price ?? 0) * i.qty, 0);
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  // Dynamic required validation based on config
  const isValid = (() => {
    if (cfg.contact.enabled) {
      if (cfg.contact.emailRequired && !form.email) return false;
      if (cfg.contact.phoneRequired && !form.phone) return false;
    }
    if (cfg.delivery.enabled) {
      if (cfg.delivery.firstName && !form.firstName) return false;
      if (cfg.delivery.lastName && !form.lastName) return false;
      if (cfg.delivery.address1 && !form.address) return false;
      if (cfg.delivery.city && !form.city) return false;
      if (cfg.delivery.state && !form.state) return false;
      if (cfg.delivery.pincode && !form.pinCode) return false;
    }
    return true;
  })();

  const placeOrder = async () => {
    if (!isValid || placing) return;
    setPlacing(true);
    try {
      const { data, error } = await supabase.from("orders").insert({
        email: form.email,
        phone: form.phone,
        first_name: form.firstName,
        last_name: form.lastName,
        address: form.address,
        apartment: form.apartment,
        city: form.city,
        state: form.state,
        pin_code: form.pinCode,
        country: form.country,
        save_info: form.saveInfo,
        shipping_method: selectedShipping?.name || form.shippingMethod,
        payment_method: form.paymentMethod,
        items: items.map(i => ({ productId: i.product.id, title: i.product.title, handle: i.product.handle, image: i.product.images.split(",")[0]?.trim() || "", qty: i.qty, price: i.product.variants[0]?.price ?? 0, compareAtPrice: i.product.variants[0]?.compareAtPrice || "", sku: i.product.variants[0]?.sku || "", selectedSize: i.selectedSize || "", selectedColor: i.selectedColor || "", vendor: i.product.vendor, productType: i.product.productType })) as any,
        subtotal,
        discount: discountAmount,
        discount_label: discountLabel,
        shipping_cost: shippingCost,
        total,
        status: "pending",
      } as any).select("id, order_number").single();

      if (error) throw error;
      const orderId = (data as any)?.id || "";
      const orderNum = (data as any)?.order_number || "";

      if (form.paymentMethod === "cod") {
        toast({ title: "Order placed!", description: `Order ${orderNum} submitted successfully.` });
        onOrderPlaced(orderNum, form.firstName, {
          firstName: form.firstName, lastName: form.lastName,
          address: form.address, apartment: form.apartment,
          city: form.city, state: form.state, pinCode: form.pinCode, country: form.country,
        });
        return;
      }

      const paymentCfg = cfg.payment;
      if (!paymentCfg.payuMerchantKey || !paymentCfg.payuSaltKey) {
        toast({ title: "Error", description: "PayU payment gateway not configured. Please contact admin.", variant: "destructive" });
        setPlacing(false);
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const fnUrl = `https://${projectId}.supabase.co/functions/v1/payu-payment?action=initiate`;

      const resp = await fetch(fnUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISH_KEY },
        body: JSON.stringify({
          orderId, orderNumber: orderNum, amount: total,
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phone: form.phone,
          productInfo: `Order ${orderNum}`,
          merchantKey: paymentCfg.payuMerchantKey, saltKey: paymentCfg.payuSaltKey,
          payuMode: paymentCfg.payuMode || "live",
          surl: `https://${projectId}.supabase.co/functions/v1/payu-payment?action=success`,
          furl: `https://${projectId}.supabase.co/functions/v1/payu-payment?action=failure`,
        }),
      });

      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Payment initiation failed");

      setPayuData({ url: result.payuUrl, params: result.payuParams });
      setTimeout(() => payuFormRef.current?.submit(), 100);

    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to place order", variant: "destructive" });
      setPlacing(false);
    }
  };

  const inp = "w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";
  const req = (label: string) => `${label} *`;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {payuData && (
        <form ref={payuFormRef} method="POST" action={payuData.url} style={{ display: "none" }}>
          {Object.entries(payuData.params).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-6">
          {/* Contact Section */}
          {cfg.contact.enabled && (
            <div>
              <h2 className="text-base font-bold text-foreground mb-3">Contact</h2>
              <div className="space-y-3">
                {cfg.contact.emailRequired && (
                  <input className={inp} placeholder={req("Email")} value={form.email} onChange={e => set("email", e.target.value)} />
                )}
                {cfg.contact.phoneRequired && (
                  <input className={inp} placeholder={req("Phone Number")} value={form.phone} onChange={e => set("phone", e.target.value)} />
                )}
              </div>
            </div>
          )}

          {/* Delivery Section */}
          {cfg.delivery.enabled && (
            <div>
              <h2 className="text-base font-bold text-foreground mb-3">Delivery</h2>
              <div className="space-y-3">
                <div>
                  <select className={inp} value={form.country} onChange={e => set("country", e.target.value)}>
                    <option value="India">India</option>
                  </select>
                  <label className="text-xs text-muted-foreground mt-1 block">Country/Region <span className="text-destructive">*</span></label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {cfg.delivery.firstName && (
                    <input className={inp} placeholder={req("First Name")} value={form.firstName} onChange={e => set("firstName", e.target.value)} />
                  )}
                  {cfg.delivery.lastName && (
                    <input className={inp} placeholder={req("Last Name")} value={form.lastName} onChange={e => set("lastName", e.target.value)} />
                  )}
                </div>
                {cfg.delivery.address1 && (
                  <input className={inp} placeholder={req("Address")} value={form.address} onChange={e => set("address", e.target.value)} />
                )}
                {cfg.delivery.address2 && (
                  <input className={inp} placeholder="Apartment, suite, etc." value={form.apartment} onChange={e => set("apartment", e.target.value)} />
                )}
                {cfg.delivery.landmark && (
                  <input className={inp} placeholder="Landmark" value={form.landmark} onChange={e => set("landmark", e.target.value)} />
                )}
                {cfg.delivery.pincode && (
                  <input className={inp} placeholder={req("PIN Code")} value={form.pinCode} onChange={e => set("pinCode", e.target.value)} />
                )}
                {cfg.delivery.city && (
                  <input className={inp} placeholder={req("City")} value={form.city} onChange={e => set("city", e.target.value)} />
                )}
                {cfg.delivery.state && (
                  <select className={inp} value={form.state} onChange={e => set("state", e.target.value)}>
                    <option value="">{req("State")}</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.saveInfo} onChange={e => set("saveInfo", e.target.checked)} className="accent-primary" />
                  <span className="text-sm text-foreground">Save this information for next time</span>
                </label>
              </div>

              {/* Address Map Preview */}
              {form.address && form.city && form.state && form.pinCode && (() => {
                try {
                  const tyConfig = JSON.parse(localStorage.getItem("thankyou-page-config") || "{}");
                  if (!tyConfig.showMapBlock) return null;
                } catch { return null; }
                return (
                  <div className="mt-4 border border-border rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-secondary/50 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground">📍 Delivery Location Preview</p>
                    </div>
                    <div className="w-full h-48">
                      <iframe
                        title="Delivery location"
                        width="100%" height="100%"
                        style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          `${form.address}, ${form.city}, ${form.state} ${form.pinCode}, ${form.country}`
                        )}&output=embed`}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Shipping Methods */}
          {cfg.shipping.enabled && activeShippingMethods.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-foreground mb-3">Shipping Method</h2>
              <div className="space-y-2">
                {activeShippingMethods.map(m => (
                  <div
                    key={m.id}
                    className={`border-2 rounded-lg p-4 flex items-center justify-between cursor-pointer ${form.shippingMethod === m.id ? "border-primary bg-primary/5" : "border-border"}`}
                    onClick={() => set("shippingMethod", m.id)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {m.price === 0 ? "Free" : `₹${m.price.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div>
            <h2 className="text-base font-bold text-foreground mb-3">Payment</h2>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Lock className="w-4 h-4" />
              <span className="text-xs">All transactions are secure and encrypted</span>
            </div>
            <div className="space-y-2">
              {cfg.payment.payuEnabled && (
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer ${form.paymentMethod === "payu" ? "border-primary bg-primary/5" : "border-border"}`}
                  onClick={() => set("paymentMethod", "payu")}
                >
                  <p className="text-sm font-semibold text-foreground">PayU Payment Gateway</p>
                  <p className="text-xs text-muted-foreground">Pay securely with PayU</p>
                </div>
              )}
              {cfg.payment.cod && (
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer ${form.paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}
                  onClick={() => set("paymentMethod", "cod")}
                >
                  <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when you receive</p>
                </div>
              )}
            </div>
          </div>

          {/* Pay Now */}
          <button
            onClick={placeOrder}
            disabled={!isValid || placing}
            className="w-full py-3.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-wider disabled:opacity-50"
          >
            {placing ? "Processing..." : form.paymentMethod === "cod" ? "Place Order" : "Pay Now"}
          </button>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-xl p-5 bg-card sticky top-24">
            <h2 className="text-base font-bold text-foreground mb-4">Order Summary</h2>
            <div className="space-y-4 mb-4">
              {items.map(({ product, qty, selectedSize }) => {
                const imgSrc = product.images.split(",")[0]?.trim() || "";
                const price = product.variants[0]?.price ?? 0;
                return (
                  <div key={product.id} className="flex items-start gap-3">
                    <div className="relative w-14 h-14 rounded-lg bg-secondary overflow-hidden shrink-0">
                      {imgSrc ? <img src={imgSrc} alt={product.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">📦</div>}
                      <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-muted-foreground text-background text-[10px] font-bold rounded-full flex items-center justify-center px-1">{qty}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">{product.title}</p>
                      {selectedSize && <p className="text-xs text-muted-foreground">As shown / {selectedSize}</p>}
                    </div>
                    <span className="text-sm font-medium text-foreground shrink-0">₹{(price * qty).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{discountLabel}</span>
                  <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">
                  {shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t border-border mt-3 pt-3 flex justify-between text-base font-bold text-foreground">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
