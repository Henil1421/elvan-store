import { useState } from "react";
import {
  LayoutDashboard, Home, Users, Package, ShoppingCart,
  Settings, ChevronDown, ChevronRight, BarChart3, Tag,
  FileText, X, Menu, PanelBottom, Palette, CheckSquare, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionId =
  | "live-view"
  | "homepage"
  | "collections" | "collections-featured"
  | "products" | "products-recommendation"
  | "orders" | "orders-tracking"
  | "widgets-countdown" | "widgets-live-viewer" | "widgets-announcement" | "widgets-trust-badges" | "widgets-google-reviews" | "widgets-rotating-features"
  | "discounts"
  | "checkout-cart-offer" | "checkout-settings" | "checkout-payment-failure"
  | "footer-general" | "footer-columns" | "footer-social" | "footer-payment" | "footer-policies" | "footer-advanced"
  | "design-card-border" | "design-throbber"
  | "thank-you" | "description-settings"
  | "settings"
  | "settings-pixels" | "settings-performance" | "settings-domain" | "settings-credentials";

interface NavItem {
  label: string;
  id?: SectionId;
  icon: React.ElementType;
  children?: { label: string; id: SectionId }[];
}

const navItems: NavItem[] = [
  { label: "Live View", icon: LayoutDashboard, id: "live-view" },
  { label: "Homepage", icon: Home, id: "homepage" },
  { label: "Collections", icon: Users, children: [
    { label: "Collections", id: "collections" },
    { label: "Featured Collections", id: "collections-featured" },
  ]},
  { label: "Products", icon: Package, children: [
    { label: "All Products", id: "products" },
    { label: "Product Recommendation", id: "products-recommendation" },
  ]},
  { label: "Orders", icon: ShoppingCart, children: [
    { label: "All Orders", id: "orders" },
    { label: "Order Tracking", id: "orders-tracking" },
  ]},
  { label: "Widgets", icon: BarChart3, children: [
    { label: "Countdown Timer", id: "widgets-countdown" },
    { label: "Live Viewer Count", id: "widgets-live-viewer" },
    { label: "Scrolling Announcement Bar", id: "widgets-announcement" },
    { label: "Trust Badges / USP", id: "widgets-trust-badges" },
    { label: "Google Reviews", id: "widgets-google-reviews" },
    { label: "Rotating Features", id: "widgets-rotating-features" },
  ]},
  { label: "Discounts", icon: Tag, id: "discounts" },
  { label: "Checkout", icon: ShoppingCart, children: [
    { label: "Cart Offer Banner", id: "checkout-cart-offer" },
    { label: "Checkout Settings", id: "checkout-settings" },
    { label: "Payment Failure", id: "checkout-payment-failure" },
  ]},
  { label: "Footer", icon: PanelBottom, children: [
    { label: "General", id: "footer-general" },
    { label: "Columns", id: "footer-columns" },
    { label: "Social", id: "footer-social" },
    { label: "Payment", id: "footer-payment" },
    { label: "Policies", id: "footer-policies" },
    { label: "Advanced", id: "footer-advanced" },
  ]},
  { label: "Design", icon: Palette, children: [
    { label: "Card Border", id: "design-card-border" },
    { label: "Throbber", id: "design-throbber" },
  ]},
  { label: "Thank You Page", icon: CheckSquare, id: "thank-you" },
  { label: "Description Settings", icon: FileText, id: "description-settings" },
  { label: "Settings", icon: Settings, children: [
    { label: "General", id: "settings" },
    { label: "Pixels", id: "settings-pixels" },
    { label: "Performance Mode", id: "settings-performance" },
    { label: "Domain", id: "settings-domain" },
    { label: "Admin URL & Credentials", id: "settings-credentials" },
  ]},
];

interface Props {
  active: SectionId;
  onSelect: (id: SectionId) => void;
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

function NavGroup({ item, active, onSelect, collapsed }: {
  item: NavItem;
  active: SectionId;
  onSelect: (id: SectionId) => void;
  collapsed: boolean;
}) {
  const isChildActive = item.children?.some((c) => c.id === active);
  const [open, setOpen] = useState(isChildActive ?? false);

  if (!item.children) {
    const isActive = item.id === active;
    return (
      <button
        onClick={() => item.id && onSelect(item.id)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isChildActive
            ? "text-foreground"
            : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {open
              ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            }
          </>
        )}
      </button>
      {open && !collapsed && (
        <div className="ml-7 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
          {item.children.map((child) => (
            <button
              key={child.id}
              onClick={() => onSelect(child.id)}
              className={cn(
                "py-2 px-2 rounded-md text-sm transition-colors text-left w-full",
                child.id === active
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar({ active, onSelect, collapsed, onToggle, onLogout }: Props) {
  return (
    <aside className={cn(
      "flex flex-col bg-card border-r border-border transition-all duration-300 shrink-0 h-full",
      collapsed ? "w-14" : "w-[260px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        {!collapsed && (
          <span className="font-bold text-base text-foreground tracking-tight">Admin Panel</span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors ml-auto"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavGroup key={item.label} item={item} active={active} onSelect={onSelect} collapsed={collapsed} />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-border">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">A</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">admin</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
