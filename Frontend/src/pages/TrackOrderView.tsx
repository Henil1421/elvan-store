import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Package, Search, CheckCircle, Circle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TRACKING_KEY = "order-tracking-config";
function getTrackingConfig() {
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
  try {
    const raw = localStorage.getItem(TRACKING_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      steps: parsed.steps || defaultSteps,
      days: { ...defaultDays, ...(parsed.days || {}) },
    };
  } catch {
    return { steps: defaultSteps, days: defaultDays };
  }
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

interface OrderData {
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
  items: any[];
  total: number;
}

export default function TrackOrderView() {
  const location = useLocation();
  const passedOrderNumber = (location.state as any)?.orderNumber || "";
  const [tab, setTab] = useState<"orderId" | "emailPhone">("orderId");
  const [orderId, setOrderId] = useState(passedOrderNumber);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [error, setError] = useState("");

  // Auto-search when order number is passed from thank-you page
  useEffect(() => {
    if (passedOrderNumber) {
      trackOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trackOrder = async () => {
    setLoading(true);
    setError("");
    setOrder(null);
    setOrders([]);

    let query = supabase.from("orders").select("*");

    if (tab === "orderId") {
      if (!orderId.trim()) { setError("Please enter an Order ID"); setLoading(false); return; }
      query = query.eq("order_number", orderId.trim());
      const { data, error: dbError } = await query.limit(1).maybeSingle();
      if (dbError || !data) {
        setError("Order not found. Please check your details and try again.");
      } else {
        setOrder(data as any);
      }
    } else {
      if (!email.trim() && !phone.trim()) { setError("Please enter email or phone number"); setLoading(false); return; }
      if (email.trim()) query = query.eq("email", email.trim());
      if (phone.trim()) query = query.eq("phone", phone.trim());
      const { data, error: dbError } = await query.order("created_at", { ascending: false });
      if (dbError || !data || data.length === 0) {
        setError("No orders found. Please check your details and try again.");
      } else if (data.length === 1) {
        setOrder(data[0] as any);
      } else {
        setOrders(data as any[]);
      }
    }
    setLoading(false);
  };

  const cfg = getTrackingConfig();

  // Calculate which step the order is at based on days since order
  const getCurrentStep = () => {
    if (!order) return -1;
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceOrder < cfg.days.step1) return 0;
    if (daysSinceOrder < cfg.days.step2) return 1;
    if (daysSinceOrder < cfg.days.step3) return 2;
    if (daysSinceOrder < cfg.days.step4) return 3;
    if (daysSinceOrder < cfg.days.step5end) return 4;
    if (daysSinceOrder < cfg.days.step6end) return 5;
    // Never auto-show Delivered
    return 5;
  };

  const getEstimatedDate = (stepIdx: number) => {
    if (!order) return "";
    const orderDate = new Date(order.created_at);
    const dayMap: Record<number, number | [number, number]> = {
      0: cfg.days.step1,
      1: cfg.days.step2,
      2: cfg.days.step3,
      3: cfg.days.step4,
      4: [cfg.days.step5start, cfg.days.step5end],
      5: [cfg.days.step6start, cfg.days.step6end],
      6: cfg.days.step6end + 1,
    };
    const val = dayMap[stepIdx];
    if (Array.isArray(val)) {
      return `${formatDate(addDays(orderDate, val[0]))} - ${formatDate(addDays(orderDate, val[1]))}`;
    }
    return formatDate(addDays(orderDate, val as number));
  };

  const currentStep = getCurrentStep();

  return (
    <main className="min-h-[60vh] bg-secondary/20 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-foreground">Track Your Order</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your order details to check the delivery status</p>
        </div>

        {!order && orders.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setTab("orderId")}
                className={`py-3 text-sm font-semibold rounded-xl transition-colors ${tab === "orderId" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                Track by Order ID
              </button>
              <button
                onClick={() => setTab("emailPhone")}
                className={`py-3 text-sm font-semibold rounded-xl transition-colors ${tab === "emailPhone" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              >
                Track by Email/Phone
              </button>
            </div>

            {tab === "orderId" ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Order ID</label>
                <input
                  type="text"
                  placeholder="Enter your order ID (e.g., ORD-a1b2c3d4)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive mt-3">{error}</p>}

            <button
              onClick={trackOrder}
              disabled={loading}
              className="w-full mt-5 py-3.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? "Searching..." : "Track Order"}
            </button>
          </div>
        )}

        {/* Order Results */}
        {order && (
          <div className="space-y-6">
            {/* Order info */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">{order.order_number}</h3>
                <span className="text-xs text-muted-foreground">Ordered on {formatDate(new Date(order.created_at))}</span>
              </div>
              <p className="text-sm text-muted-foreground">{order.first_name} {order.last_name} · ₹{order.total.toFixed(2)}</p>
            </div>

            {/* Timeline */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-5">Delivery Progress</h3>
              <div className="space-y-0">
                {cfg.steps.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  const isLast = idx === cfg.steps.length - 1;
                  return (
                    <div key={idx} className="flex gap-4">
                      {/* Left: icon + line */}
                      <div className="flex flex-col items-center">
                        {isCompleted ? (
                          <CheckCircle className={`w-6 h-6 shrink-0 ${isCurrent ? "text-primary" : "text-green-500"}`} />
                        ) : (
                          <Circle className="w-6 h-6 shrink-0 text-border" />
                        )}
                        {!isLast && (
                          <div className={`w-0.5 flex-1 min-h-[32px] ${isCompleted ? "bg-green-500" : "bg-border"}`} />
                        )}
                      </div>
                      {/* Right: text */}
                      <div className="pb-6">
                        <p className={`text-sm font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {isCompleted ? (isCurrent ? "Current status" : "Completed") : `Est: ${getEstimatedDate(idx)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => { setOrder(null); setOrders([]); setOrderId(""); setEmail(""); setPhone(""); }}
              className="w-full py-3 text-sm font-medium border border-border rounded-xl text-foreground hover:bg-secondary transition-colors"
            >
              Track Another Order
            </button>
          </div>
        )}

        {/* Multiple Orders List */}
        {orders.length > 0 && !order && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">{orders.length} orders found</p>
            {orders.map((o) => (
              <button
                key={o.order_number}
                onClick={() => setOrder(o)}
                className="w-full bg-card border border-border rounded-2xl p-5 text-left hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-foreground">{o.order_number}</h3>
                  <span className="text-xs text-muted-foreground">{formatDate(new Date(o.created_at))}</span>
                </div>
                <p className="text-sm text-muted-foreground">{o.first_name} {o.last_name} · ₹{o.total.toFixed(2)}</p>
              </button>
            ))}
            <button
              onClick={() => { setOrders([]); setEmail(""); setPhone(""); }}
              className="w-full py-3 text-sm font-medium border border-border rounded-xl text-foreground hover:bg-secondary transition-colors"
            >
              Search Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
