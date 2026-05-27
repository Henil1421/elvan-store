import { Bell, Search } from "lucide-react";
import type { SectionId } from "./AdminSidebar";

const sectionTitles: Record<SectionId, string> = {
  "live-view": "Live View",
  "homepage": "Homepage",
  "collections": "Collections",
  "collections-featured": "Featured Collections",
  "products": "Products",
  "products-recommendation": "Product Recommendation",
  "orders": "Orders",
  "orders-tracking": "Order Tracking",
  "widgets-countdown": "Countdown Timer",
  "widgets-live-viewer": "Live Viewer Count",
  "widgets-announcement": "Scrolling Announcement Bar",
  "widgets-trust-badges": "Trust Badges / USP",
  "widgets-google-reviews": "Google Reviews",
  "widgets-rotating-features": "Rotating Features",
  "discounts": "Discounts",
  "checkout-cart-offer": "Cart Offer Banner",
  "checkout-settings": "Checkout Settings",
  "checkout-payment-failure": "Payment Failure",
  "footer-general": "Footer — General",
  "footer-columns": "Footer — Columns",
  "footer-social": "Footer — Social",
  "footer-payment": "Footer — Payment",
  "footer-policies": "Footer — Policies",
  "footer-advanced": "Footer — Advanced",
  "design-card-border": "Card Border Settings",
  "design-throbber": "Throbber Settings",
  "thank-you": "Thank You Page",
  "description-settings": "Description Settings",
  "settings": "Settings",
  "settings-pixels": "Pixels",
  "settings-performance": "Performance Mode",
  "settings-domain": "Domain",
  "settings-credentials": "Admin URL & Credentials",
};

export default function AdminHeader({ active }: { active: SectionId }) {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-6 gap-4 shrink-0">
      <h1 className="text-base font-semibold text-foreground">{sectionTitles[active]}</h1>
      <div className="flex-1" />
      <div className="relative hidden sm:flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          className="pl-9 pr-4 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52"
        />
      </div>
      <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
      </button>
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">A</div>
    </header>
  );
}
