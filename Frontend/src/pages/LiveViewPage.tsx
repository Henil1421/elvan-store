import { useState, useEffect } from "react";
import { Activity, Calendar, ChevronDown, Circle, ArrowLeft, Eye, Clock, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const periods = ["Today", "Yesterday", "Last 7 days", "Last 30 days"];

function getDateRange(period: string) {
  const now = new Date();
  const startOfDay = (d: Date) => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c; };
  switch (period) {
    case "Today": return { from: startOfDay(now).toISOString(), to: now.toISOString() };
    case "Yesterday": {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return { from: startOfDay(y).toISOString(), to: startOfDay(now).toISOString() };
    }
    case "Last 7 days": {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      return { from: startOfDay(d).toISOString(), to: now.toISOString() };
    }
    case "Last 30 days": {
      const d = new Date(now); d.setDate(d.getDate() - 30);
      return { from: startOfDay(d).toISOString(), to: now.toISOString() };
    }
    default: return { from: startOfDay(now).toISOString(), to: now.toISOString() };
  }
}

interface VisitorSession {
  id: string;
  session_id: string;
  page_url: string;
  referrer: string;
  user_agent: string;
  created_at: string;
  last_seen_at: string;
}

export default function LiveViewPage() {
  const [period, setPeriod] = useState("Today");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeNow, setActiveNow] = useState(0);
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [periodSessions, setPeriodSessions] = useState<VisitorSession[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showVisitorList, setShowVisitorList] = useState(false);
  const [historyDate, setHistoryDate] = useState<string | null>(null);

  // Fetch active visitors (seen in last 5 minutes)
  const fetchActive = async () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data, count } = await supabase
      .from("visitor_sessions")
      .select("*", { count: "exact" })
      .gte("last_seen_at", fiveMinAgo);
    setActiveNow(count ?? 0);
    if (data) setSessions(data as VisitorSession[]);
  };

  // Fetch period sessions
  const fetchPeriodSessions = async () => {
    const { from, to } = getDateRange(period);
    const { data } = await supabase
      .from("visitor_sessions")
      .select("*")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: false });
    if (data) setPeriodSessions(data as VisitorSession[]);
  };

  // Fetch orders for sales data
  const fetchOrders = async () => {
    const { from, to } = getDateRange(period);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", from)
      .lte("created_at", to);
    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchPeriodSessions();
    fetchOrders();
  }, [period]);

  const confirmedSales = orders.filter(o => o.status === "delivered" || o.status === "confirmed" || o.status === "shipped").reduce((s, o) => s + Number(o.total || 0), 0);
  const abandonedOrders = orders.filter(o => o.status === "pending").length;
  const abandonedValue = orders.filter(o => o.status === "pending").reduce((s, o) => s + Number(o.total || 0), 0);
  const successfulOrders = orders.filter(o => o.status !== "pending" && o.status !== "cancelled").length;

  const stats = [
    { label: "Visitors right now", value: String(activeNow), clickable: true },
    { label: "Confirmed Order Sales", value: `₹${confirmedSales.toFixed(2)}`, clickable: false },
    { label: "Abandoned Orders", value: String(abandonedOrders), clickable: false },
    { label: "Abandoned Order Value", value: `₹${abandonedValue.toFixed(2)}`, clickable: false },
  ];

  // Group period sessions by date for history view
  const sessionsByDate: Record<string, VisitorSession[]> = {};
  periodSessions.forEach((s) => {
    const dateKey = new Date(s.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
    if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = [];
    sessionsByDate[dateKey].push(s);
  });
  const sortedDates = Object.keys(sessionsByDate);

  // Visitors for a specific date
  const historyVisitors = historyDate ? sessionsByDate[historyDate] || [] : [];

  if (showVisitorList) {
    return (
      <div>
        <button onClick={() => setShowVisitorList(false)} className="flex items-center gap-2 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Live View
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">Active Visitors ({activeNow})</h2>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">(last 5 min)</span>
        </div>
        {sessions.length === 0 ? (
          <div className="section-card text-center text-muted-foreground py-8">No active visitors right now.</div>
        ) : (
          <div className="section-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 pr-4 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2.5 pr-4 text-muted-foreground font-medium">Page</th>
                  <th className="text-left py-2.5 pr-4 text-muted-foreground font-medium">First Visit</th>
                  <th className="text-left py-2.5 text-muted-foreground font-medium">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                    <td className="py-3 pr-4 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 pr-4 font-medium text-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      {s.page_url}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{new Date(s.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="py-3 text-muted-foreground">{new Date(s.last_seen_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Date-wise visitor history */}
        <div className="mt-6">
          <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Visitor History ({period})
          </h3>
          {sortedDates.length === 0 ? (
            <div className="section-card text-center text-muted-foreground py-6">No visitor data for this period.</div>
          ) : (
            <div className="space-y-2">
              {sortedDates.map((date) => (
                <div key={date}>
                  <button
                    onClick={() => setHistoryDate(historyDate === date ? null : date)}
                    className="w-full section-card flex items-center justify-between hover:bg-secondary/40 transition-colors"
                  >
                    <span className="font-medium text-foreground">{date}</span>
                    <span className="text-sm text-muted-foreground">{sessionsByDate[date].length} visitors</span>
                  </button>
                  {historyDate === date && (
                    <div className="section-card mt-1 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">#</th>
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Page</th>
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Time</th>
                            <th className="text-left py-2 text-muted-foreground font-medium">Last Seen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyVisitors.map((v, i) => (
                            <tr key={v.id} className="border-b border-border last:border-0">
                              <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                              <td className="py-2 pr-4 text-foreground">{v.page_url}</td>
                              <td className="py-2 pr-4 text-muted-foreground">{new Date(v.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
                              <td className="py-2 text-muted-foreground">{new Date(v.last_seen_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">Live View</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground hover:bg-secondary transition-colors"
            >
              <Calendar className="w-4 h-4 text-muted-foreground" />
              {period}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
                {periods.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg ${period === p ? "text-primary font-medium" : "text-foreground"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Circle className="w-2.5 h-2.5 fill-primary text-primary" />
            Live
          </div>
        </div>
      </div>

      {/* Top 4 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`section-card ${s.clickable ? "cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" : ""}`}
            onClick={s.clickable ? () => setShowVisitorList(true) : undefined}
          >
            <p className="text-sm text-muted-foreground mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-foreground">{s.value}</p>
            {s.clickable && <p className="text-xs text-primary mt-1">Click to view details →</p>}
          </div>
        ))}
      </div>

      {/* Sessions + Successful Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="section-card">
          <p className="text-sm text-muted-foreground mb-2">Sessions ({period})</p>
          <p className="text-3xl font-bold text-foreground">{periodSessions.length}</p>
        </div>
        <div className="section-card">
          <p className="text-sm text-muted-foreground mb-2">Successful Orders</p>
          <p className="text-3xl font-bold text-foreground">{successfulOrders}</p>
        </div>
      </div>

      {/* Total sales by product */}
      <div className="section-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Total sales by product</h3>
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          No sales data available
        </div>
      </div>
    </div>
  );
}
