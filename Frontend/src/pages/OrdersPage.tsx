import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OrderRow {
  id: string;
  order_number: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pin_code: string;
  country: string;
  items: any[];
  subtotal: number;
  discount: number;
  discount_label: string;
  shipping_cost: number;
  total: number;
  status: string;
  payment_method: string;
  shipping_method: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOrders(data as any);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status } as any).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const filtered = orders.filter((o) => {
    const matchesFilter = filter === "All" || o.status === filter.toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.first_name.toLowerCase().includes(q) ||
      o.last_name.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <h2 className="page-header">Orders</h2>
      <p className="page-sub">Track and manage all customer orders.</p>

      <div className="section-card">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone, order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-72"
            />
          </div>
          <div className="flex items-center gap-2">
            {["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${f === filter ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading orders...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No orders found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => {
              const expanded = expandedId === o.id;
              const items = Array.isArray(o.items) ? o.items : [];
              return (
                <div key={o.id} className="border border-border rounded-xl bg-card overflow-hidden">
                  {/* Summary row */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : o.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Order</p>
                        <p className="font-medium text-primary">{o.order_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Customer</p>
                        <p className="font-medium text-foreground">{o.first_name} {o.last_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-bold text-foreground">₹{o.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[o.status] || "bg-secondary text-foreground"}`}>{o.status}</span>
                      </div>
                    </div>
                    {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="border-t border-border p-4 bg-secondary/20 space-y-4">
                      {/* Customer Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Customer Info</h4>
                          <p className="text-sm text-foreground">{o.first_name} {o.last_name}</p>
                          <p className="text-sm text-muted-foreground">{o.email}</p>
                          {o.phone && <p className="text-sm text-muted-foreground">{o.phone}</p>}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Shipping Address</h4>
                          <p className="text-sm text-foreground">{o.address}{o.apartment ? `, ${o.apartment}` : ""}</p>
                          <p className="text-sm text-foreground">{o.city}, {o.state} - {o.pin_code}</p>
                          <p className="text-sm text-muted-foreground">{o.country}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Products ({items.length})</h4>
                        <div className="space-y-2">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-2 bg-card rounded-lg border border-border">
                              <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                                {item.image ? (
                                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                  {item.selectedColor && (
                                    <span className="flex items-center gap-1">
                                      Color: {item.selectedColor}
                                    </span>
                                  )}
                                  <span>Qty: {item.qty}</span>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-foreground shrink-0">₹{(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="flex flex-col items-end gap-1 text-sm">
                        <div className="flex gap-8"><span className="text-muted-foreground">Subtotal</span><span className="font-medium text-foreground">₹{o.subtotal.toFixed(2)}</span></div>
                        {o.discount > 0 && <div className="flex gap-8"><span className="text-green-600">{o.discount_label || "Discount"}</span><span className="font-medium text-green-600">-₹{o.discount.toFixed(2)}</span></div>}
                        <div className="flex gap-8"><span className="text-muted-foreground">Shipping</span><span className="font-medium text-foreground">{o.shipping_cost > 0 ? `₹${o.shipping_cost.toFixed(2)}` : "Free"}</span></div>
                        <div className="flex gap-8 text-base font-bold"><span className="text-foreground">Total</span><span className="text-foreground">₹{o.total.toFixed(2)}</span></div>
                      </div>

                      {/* Payment & Status controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Payment: <span className="font-medium text-foreground capitalize">{o.payment_method}</span> · Shipping: <span className="font-medium text-foreground capitalize">{o.shipping_method}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-muted-foreground">Update Status:</label>
                          <select
                            value={o.status}
                            onChange={(e) => updateStatus(o.id, e.target.value)}
                            className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
