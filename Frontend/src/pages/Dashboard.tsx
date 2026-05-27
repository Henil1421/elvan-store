import { useState, useEffect } from "react";
import { TrendingUp, Package, ShoppingCart, ArrowUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("id"),
    ]).then(([ordersRes, productsRes]) => {
      console.log("[Dashboard] Data fetch:", { orders: ordersRes.data?.length ?? 0, products: productsRes.data?.length ?? 0, ordersError: ordersRes.error?.message ?? null, productsError: productsRes.error?.message ?? null });
      if (ordersRes.data) setOrders(ordersRes.data);
      if (productsRes.data) setProducts(productsRes.data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const recentOrders = orders.slice(0, 5);

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toFixed(0)}`, icon: TrendingUp, colorClass: "text-green-600", bgClass: "bg-green-50" },
    { label: "Products", value: String(totalProducts), icon: Package, colorClass: "text-orange-500", bgClass: "bg-orange-50" },
    { label: "Total Orders", value: String(totalOrders), icon: ShoppingCart, colorClass: "text-purple-600", bgClass: "bg-purple-50" },
    { label: "Delivered", value: String(deliveredOrders), icon: ArrowUp, colorClass: "text-blue-600", bgClass: "bg-blue-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-header">Dashboard</h2>
      <p className="page-sub">Welcome back! Here's what's happening today.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.bgClass}`}>
                <s.icon className={`w-4 h-4 ${s.colorClass}`} />
              </div>
            </div>
            <span className="text-2xl font-bold text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Recent Orders</h3>
          <a href="/admin/orders" className="text-sm text-primary hover:underline">View all</a>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 pr-4 text-muted-foreground font-medium">Order ID</th>
                  <th className="text-left py-2.5 pr-4 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left py-2.5 pr-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-2.5 pr-4 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2.5 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                    <td className="py-3 pr-4 font-medium text-primary">{o.order_number}</td>
                    <td className="py-3 pr-4">{o.first_name} {o.last_name}</td>
                    <td className="py-3 pr-4 font-medium">₹{Number(o.total).toFixed(2)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[o.status] || "bg-secondary text-foreground"}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
