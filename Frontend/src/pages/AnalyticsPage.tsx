import { BarChart3, TrendingUp, Users, ShoppingCart } from "lucide-react";

const metrics = [
  { label: "Page Views", value: "128,430", period: "Last 30 days", icon: BarChart3 },
  { label: "Conversion Rate", value: "3.6%", period: "Last 30 days", icon: TrendingUp },
  { label: "New Users", value: "842", period: "Last 30 days", icon: Users },
  { label: "Avg. Order Value", value: "$66.30", period: "Last 30 days", icon: ShoppingCart },
];

export default function AnalyticsPage() {
  return (
    <div>
      <h2 className="page-header">Analytics</h2>
      <p className="page-sub">Track your growth and performance metrics.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{m.label}</span>
              <div className="p-2 rounded-lg bg-accent">
                <m.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">{m.value}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{m.period}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-card">
        <h3 className="text-base font-semibold mb-4">Traffic Overview</h3>
        <div className="flex items-center justify-center h-48 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
          Chart visualization will go here
        </div>
      </div>
    </div>
  );
}
