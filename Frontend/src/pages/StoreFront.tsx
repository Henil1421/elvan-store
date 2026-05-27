import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, Search, Star, Heart, ChevronRight, Truck, Shield, RotateCcw, Headphones, Menu, X, Instagram, Twitter, Facebook, Youtube, MessageCircle, Linkedin, Send, ChevronDown, Package, ArrowLeft, Percent, Lock, Award, Gift, Clock, Zap, CheckCircle, Users, TrendingUp } from "lucide-react";
import { getStoreConfig, fetchStoreConfig, StoreConfig } from "@/lib/storeConfig";
import { getFooterConfig, fetchFooterConfig, FooterConfig, Policy } from "@/lib/footerConfig";
import { getProducts, Product, syncProductsToLocal } from "@/lib/productStore";
import { fetchCollections, fetchFeaturedSettings, Collection } from "@/lib/collectionsStore";
import { getRotatingFeaturesConfig, fetchRotatingFeaturesConfig, RotatingFeaturesConfig, getScrollingAnnouncementConfig, fetchScrollingAnnouncementConfig, ScrollingAnnouncementConfig, GoogleReviewsConfig } from "@/lib/widgetsStore";
import { fetchDiscounts } from "@/lib/discountStore";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage, { CartItem } from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ThankYouView from "@/pages/ThankYouView";
import TrackOrderView from "@/pages/TrackOrderView";
import { findBestDiscount } from "@/lib/discountStore";
import { supabase } from "@/integrations/supabase/client";
import { getProductColors, getColorHex } from "@/lib/colorUtils";
import { apiService } from "@/services/api.service";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = [
  { name: "Electronics", emoji: "💻", count: 240 },
  { name: "Clothing", emoji: "👗", count: 580 },
  { name: "Home & Garden", emoji: "🏡", count: 320 },
  { name: "Sports", emoji: "⚽", count: 180 },
  { name: "Beauty", emoji: "💄", count: 430 },
  { name: "Books", emoji: "📚", count: 860 },
];

const testimonials = [
  { name: "Sarah M.", rating: 5, text: "Amazing quality products and super fast shipping. Will definitely order again!", avatar: "S" },
  { name: "James R.", rating: 5, text: "The best online store I've shopped at. Customer service is top-notch.", avatar: "J" },
  { name: "Priya K.", rating: 5, text: "Great prices and the packaging was so eco-friendly. Love this brand!", avatar: "P" },
];

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
  { icon: Shield, title: "Secure Payment", desc: "100% protected transactions" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

const heroHeightMap: Record<string, string> = {
  small: "min-h-[400px]",
  medium: "min-h-[500px]",
  large: "min-h-[600px]",
  full: "min-h-screen",
};

const alignMap: Record<string, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

/* ── Widget icon map ──────────────────────────────────── */
const WIDGET_ICONS: Record<string, React.ElementType> = {
  Truck, RotateCcw, Percent, Lock, Star, Heart, Shield,
  Award, Gift, Clock, Zap, CheckCircle, Users, TrendingUp,
};
function WidgetIcon({ name, className }: { name: string; className?: string }) {
  const I = WIDGET_ICONS[name] ?? Star;
  return <I className={className ?? "w-5 h-5"} />;
}

/* ── Social platform icon map ─────────────────────────── */
const SOCIAL_ICONS: Record<string, React.ElementType> = {
  "Facebook": Facebook,
  "Instagram": Instagram,
  "Twitter / X": Twitter,
  "YouTube": Youtube,
  "LinkedIn": Linkedin,
  "WhatsApp": MessageCircle,
  "Telegram": Send,
  "TikTok": Send,
  "Pinterest": Heart,
  "Snapchat": MessageCircle,
  "Venmo": MessageCircle,
};

/* ── Scrolling Announcement Bar ────────────────────────── */
function ScrollingAnnouncementBar({ cfg }: { cfg: ScrollingAnnouncementConfig }) {
  const visibleItems = cfg.items.filter((it) => it.visible);
  if (!cfg.enabled || visibleItems.length === 0) return null;
  // Duplicate items for seamless loop
  const repeated = [...visibleItems, ...visibleItems, ...visibleItems];
  return (
    <div
      className="overflow-hidden py-2.5 border-b"
      style={{ backgroundColor: cfg.bgColor, borderColor: `${cfg.textColor}20` }}
    >
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .marquee-inner {
          display: flex;
          width: max-content;
          animation: marquee ${cfg.speed}s linear infinite;
        }
        .marquee-inner:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-inner">
        {repeated.map((it, i) => (
          <span
            key={i}
            className="flex items-center gap-2 mx-8 text-xs font-medium whitespace-nowrap"
            style={{ color: cfg.textColor }}
          >
            <WidgetIcon name={it.icon} className="w-3.5 h-3.5 shrink-0" />
            {it.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Rotating Features Section ─────────────────────────── */
function RotatingFeaturesSection({ cfg }: { cfg: RotatingFeaturesConfig }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const visibleFeatures = cfg.features.filter((f) => f.visible);

  useEffect(() => {
    if (!cfg.enabled || visibleFeatures.length <= 1) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % visibleFeatures.length);
        setFading(false);
      }, 300);
    }, cfg.rotationSpeed * 1000);
    return () => clearInterval(interval);
  }, [cfg.enabled, cfg.rotationSpeed, visibleFeatures.length]);

  if (!cfg.enabled || visibleFeatures.length === 0) return null;
  const current = visibleFeatures[activeIdx] ?? visibleFeatures[0];

  return (
    <section style={{ backgroundColor: cfg.bgColor }}>
      <div
        className="py-10 flex flex-col items-center justify-center text-center transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1, color: cfg.textColor }}
      >
        <div className="mb-3 opacity-80">
          <WidgetIcon name={current.icon} className="w-10 h-10 mx-auto" />
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ color: cfg.textColor }}>{current.title}</h3>
        <p className="text-sm opacity-70" style={{ color: cfg.textColor }}>{current.description}</p>
        {/* Dots */}
        {visibleFeatures.length > 1 && (
          <div className="flex items-center gap-2 mt-5">
            {visibleFeatures.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeIdx ? "24px" : "8px",
                  height: "8px",
                  backgroundColor: i === activeIdx ? cfg.textColor : `${cfg.textColor}50`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Policy Page Viewer ────────────────────────────────── */
function PolicyPage({ policy, onBack, navBgColor, navTextColor, storeName, logoImage, logoType }: {
  policy: Policy;
  onBack: () => void;
  navBgColor: string;
  navTextColor: string;
  storeName: string;
  logoImage: string | null;
  logoType: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple nav */}
      <nav className="border-b border-border" style={{ backgroundColor: navBgColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14 gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100 transition-opacity" style={{ color: navTextColor }}>
            <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <a href="/" className="font-black text-base" style={{ color: navTextColor }}>
            {logoType === "image" && logoImage ? (
              <img src={logoImage} alt={storeName} className="h-7 w-auto object-contain" />
            ) : storeName}
          </a>
        </div>
      </nav>

      {/* Policy content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-black text-foreground mb-8">{policy.name}</h1>
        <div className="space-y-1">
          {policy.content.split("\n").map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-4" />;
            const isHeading = line === line.toUpperCase() && line.trim().length > 3 && line.trim().length < 80;
            if (isHeading) {
              return <h2 key={i} className="text-sm font-bold text-foreground mt-6 mb-2 uppercase tracking-wide">{line}</h2>;
            }
            return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>;
          })}
        </div>
      </main>
    </div>
  );
}

/* ── Dynamic Footer ────────────────────────────────────── */
function StoreFrontFooter({
  storeName, logoImage, logoType,
  onPolicyClick,
  onCollectionClick,
  onTrackOrderClick,
  collections,
}: {
  storeName: string;
  logoImage: string | null;
  logoType: string;
  onPolicyClick: (policy: Policy) => void;
  onCollectionClick: (col: Collection) => void;
  onTrackOrderClick: () => void;
  collections: Collection[];
}) {
  const [footer, setFooter] = useState<FooterConfig>(getFooterConfig);
  const [openColumns, setOpenColumns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Fetch from DB on mount
    fetchFooterConfig().then(setFooter);
    const reload = () => fetchFooterConfig().then(setFooter);
    window.addEventListener("focus", reload);
    window.addEventListener("storage", reload);
    window.addEventListener("footer_config_updated", reload);
    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("storage", reload);
      window.removeEventListener("footer_config_updated", reload);
    };
  }, []);

  if (!footer.showFooter) return null;

  const year = new Date().getFullYear();
  const copyright = footer.copyrightText.replace("{{year}}", String(year));

  const aboutLines = footer.aboutContent.split("\n");
  const aboutHeading = aboutLines[0];
  const aboutBody = aboutLines.slice(1).join("\n").trim();

  const visibleColumns = footer.columns.filter((c) => c.visible);
  const footerPolicies = footer.policies.filter((p) => p.showInFooter);
  const visibleSocial = footer.social.filter((s) => s.visible && s.url);
  const visiblePayment = footer.payment.filter((p) => p.visible);

  const toggleColumn = (key: string) =>
    setOpenColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  const isOpen = (key: string) =>
    key in openColumns ? openColumns[key] : (footer.accordionOpenByDefault ?? false);

  // All column sections (link columns + policies)
  const allSections: { key: string; title: string; content: React.ReactNode }[] = [
    ...visibleColumns.map((col) => ({
      key: String(col.id),
      title: col.title,
      content: (
        <ul className="space-y-2">
          {col.blocks.filter((b) => b.visible && b.type === "Link List").flatMap((block) =>
            block.links.map((link) => {
              const isInternal = link.url?.startsWith("/");
              return (
                <li key={link.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: `${footer.textColor}80` }} />
                  {isInternal ? (
                    <button
                      onClick={() => {
                        if (link.url === "/track-order") onTrackOrderClick();
                        else window.location.href = link.url;
                      }}
                      className="text-sm transition-opacity hover:opacity-100 opacity-75 text-left hover:underline"
                      style={{ color: footer.linkColor }}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a href={link.url || "#"} className="text-sm transition-opacity hover:opacity-100 opacity-75" style={{ color: footer.linkColor }}>
                      {link.label}
                    </a>
                  )}
                </li>
              );
            })
          )}
          {/* Inject collections into Main Menu column */}
          {col.title.toLowerCase().includes("main menu") && collections.map((c) => (
            <li key={`col-${c.id}`} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: `${footer.textColor}80` }} />
              <button
                onClick={() => onCollectionClick(c)}
                className="text-sm transition-opacity hover:opacity-100 opacity-75 text-left hover:underline"
                style={{ color: footer.linkColor }}
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      ),
    })),
    ...(footerPolicies.length > 0 ? [{
      key: "policies",
      title: "Our Store Policies",
      content: (
        <ul className="space-y-2">
          {footerPolicies.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: `${footer.textColor}80` }} />
              <button
                onClick={() => onPolicyClick(p)}
                className="text-sm transition-opacity hover:opacity-100 opacity-75 text-left hover:underline"
                style={{ color: footer.linkColor }}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      ),
    }] : []),
  ];

  return (
    <footer
      style={{
        backgroundColor: footer.bgColor,
        color: footer.textColor,
        ...(footer.stickyFooter ? { position: "sticky", bottom: 0, zIndex: 40 } : {}),
      }}
    >
      {/* ── About Us ───────────────────────────────────── */}
      {footer.showAboutUs && (
        <div className="border-b" style={{ borderColor: `${footer.textColor}20` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h3 className="text-base font-bold mb-3" style={{ color: footer.textColor }}>{aboutHeading}</h3>
            <p className="text-sm leading-relaxed max-w-4xl" style={{ color: `${footer.textColor}cc` }}>{aboutBody}</p>
          </div>
        </div>
      )}

      {/* ── Columns + Policies ─────────────────────────── */}
      {allSections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Desktop: grid */}
          <div
            className="hidden md:grid gap-8"
            style={{ gridTemplateColumns: `repeat(${allSections.length}, minmax(0,1fr))` }}
          >
            {allSections.map((sec) => (
              <div key={sec.key}>
                <h4 className="text-sm font-bold mb-4" style={{ color: footer.textColor }}>{sec.title}</h4>
                {sec.content}
              </div>
            ))}
          </div>

          {/* Mobile: accordion or plain list */}
          <div className="flex flex-col md:hidden">
            {allSections.map((sec) =>
              footer.mobileAccordion ? (
                <div key={sec.key} className="border-b" style={{ borderColor: `${footer.textColor}20` }}>
                  <button
                    className="w-full flex items-center justify-between py-3.5 text-sm font-bold text-left"
                    style={{ color: footer.textColor }}
                    onClick={() => toggleColumn(sec.key)}
                  >
                    {sec.title}
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-200 shrink-0"
                      style={{
                        transform: isOpen(sec.key) ? "rotate(180deg)" : "rotate(0deg)",
                        color: footer.textColor,
                        opacity: 0.7,
                      }}
                    />
                  </button>
                  {isOpen(sec.key) && (
                    <div className="pb-4">{sec.content}</div>
                  )}
                </div>
              ) : (
                <div key={sec.key} className="mb-6">
                  <h4 className="text-sm font-bold mb-4" style={{ color: footer.textColor }}>{sec.title}</h4>
                  {sec.content}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ── Bottom bar ─────────────────────────────────── */}
      <div className="border-t" style={{ borderColor: `${footer.textColor}20` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo + copyright */}
          <div className="flex items-center gap-3">
            {footer.showLogoBottom && (
              logoType === "image" && logoImage
                ? <img src={logoImage} alt={storeName} className="h-7 w-auto object-contain opacity-80" />
                : <span className="text-sm font-black opacity-80" style={{ color: footer.textColor }}>{storeName}</span>
            )}
            <span className="text-xs opacity-60" style={{ color: footer.textColor }}>{copyright}</span>
          </div>

          {/* Social icons */}
          {visibleSocial.length > 0 && (
            <div className="flex items-center gap-2">
              {visibleSocial.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform] ?? MessageCircle;
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.platform}
                    className="p-2 rounded-lg transition-opacity opacity-60 hover:opacity-100"
                    style={{ color: footer.textColor }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Payment icons */}
          {visiblePayment.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {visiblePayment.map((p) => (
                <span
                  key={p.id}
                  className="px-2.5 py-1 rounded text-[11px] font-bold border"
                  style={{
                    borderColor: `${footer.textColor}25`,
                    backgroundColor: `${footer.textColor}12`,
                    color: footer.textColor,
                  }}
                >
                  {p.method}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

/* ── Collection Page (inline view) ──────────────────────── */
function CollectionPage({
  collection,
  products,
  onBack,
  navBgColor,
  navTextColor,
  storeName,
  logoImage,
  logoType,
  logoH,
  cartCount,
  wishlist,
  addedId,
  onAddToCart,
  onToggleWishlist,
  onProductClick,
}: {
  collection: Collection;
  products: Product[];
  onBack: () => void;
  navBgColor: string;
  navTextColor: string;
  storeName: string;
  logoImage: string | null;
  logoType: string;
  logoH: number;
  cartCount: number;
  wishlist: string[];
  addedId: string | null;
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onProductClick: (product: Product) => void;
}) {
  const colProducts = products.filter(
    (p) =>
      (p.published || p.status === "Active") &&
      (p.collection === collection.id ||
        p.collection?.toLowerCase() === collection.title.toLowerCase() ||
        p.collection?.toLowerCase() === collection.handle.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border shadow-sm" style={{ backgroundColor: navBgColor }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4" style={{ height: `${Math.max(logoH + 20, 56)}px` }}>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: navTextColor }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <a href="/" className="font-black text-base" style={{ color: navTextColor }}>
            {logoType === "image" && logoImage ? (
              <img src={logoImage} alt={storeName} style={{ height: `${logoH}px` }} className="w-auto object-contain" />
            ) : storeName}
          </a>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ShoppingCart className="w-5 h-5" style={{ color: navTextColor }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">{collection.title}</h1>
          {collection.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{collection.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">{colProducts.length} product{colProducts.length !== 1 ? "s" : ""}</p>
        </div>

        {colProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Package className="w-16 h-16 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground">No products in this collection yet</h3>
            <p className="text-sm text-muted-foreground">Products assigned to "{collection.title}" will appear here.</p>
            <button onClick={onBack} className="mt-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
              ← Back to Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {colProducts.map((product) => {
              const imgSrc = product.images.split(",")[0]?.trim() || "";
              const price = product.variants[0]?.price ?? 0;
              const compareAt = parseFloat(product.variants[0]?.compareAtPrice || "0");
              return (
                <div key={product.id} className="group cursor-pointer bg-background" onClick={() => onProductClick(product)}>
                  <div className="relative bg-secondary aspect-[3/4] flex items-center justify-center overflow-hidden">
                    {imgSrc ? (
                      <img src={imgSrc} alt={product.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="pt-3 pb-2">
                    <h3 className="text-xs font-medium text-foreground uppercase tracking-wide leading-snug line-clamp-2 mb-2">{product.title}</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-sm font-bold text-foreground">₹{price.toFixed(2)}</span>
                      {compareAt > price && (
                        <span className="text-xs text-muted-foreground line-through">₹{compareAt.toFixed(2)}</span>
                      )}
                    </div>
                    {(() => {
                      const colors = getProductColors(product.options);
                      if (colors.length === 0) return null;
                      const MAX = 6;
                      return (
                        <div className="flex items-center gap-1.5">
                          {colors.slice(0, MAX).map((c, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border border-border" style={{ background: getColorHex(c) || "#ccc" }} title={c} />
                          ))}
                          {colors.length > MAX && <span className="text-[10px] text-muted-foreground">+{colors.length - MAX}</span>}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

const FALLBACK_PRODUCTS = [
  { id: 1, name: "Wireless Pro Headphones", category: "Electronics", price: 129, originalPrice: 199, rating: 4.8, reviews: 2841, badge: "Best Seller", image: "🎧" },
  { id: 2, name: "Premium Leather Jacket", category: "Clothing", price: 249, originalPrice: 349, rating: 4.7, reviews: 1204, badge: "New", image: "🧥" },
  { id: 3, name: "Smart Watch Series X", category: "Electronics", price: 299, originalPrice: 399, rating: 4.9, reviews: 5672, badge: "Top Rated", image: "⌚" },
  { id: 4, name: "Running Sneakers Ultra", category: "Sports", price: 89, originalPrice: 139, rating: 4.6, reviews: 3210, badge: "Sale", image: "👟" },
  { id: 5, name: "Ceramic Coffee Set", category: "Home & Garden", price: 59, originalPrice: 89, rating: 4.5, reviews: 892, badge: null, image: "☕" },
  { id: 6, name: "Skincare Glow Bundle", category: "Beauty", price: 78, originalPrice: 110, rating: 4.8, reviews: 4231, badge: "Popular", image: "✨" },
  { id: 7, name: "Yoga Mat Pro", category: "Sports", price: 45, originalPrice: 65, rating: 4.4, reviews: 1890, badge: null, image: "🧘" },
  { id: 8, name: "Mechanical Keyboard", category: "Electronics", price: 159, originalPrice: 229, rating: 4.7, reviews: 3401, badge: "Sale", image: "⌨️" },
];

/* ── Collection-wise Products with 20-at-a-time pagination ── */
function CollectionWiseProducts({
  displayProducts, adminCollections, useFallback, goToProduct, goToCollection, getProductColors,
}: {
  displayProducts: Product[];
  adminCollections: Collection[];
  useFallback: boolean;
  goToProduct: (p: Product) => void;
  goToCollection: (c: Collection) => void;
  getProductColors: (options: any) => string[];
}) {
  const [expandedCols, setExpandedCols] = useState<Record<string, number>>({});

  if (useFallback || displayProducts.length === 0) return null;

  const collectionMap = new Map<string, Product[]>();
  displayProducts.forEach((p) => {
    const colName = p.collection?.trim() || "Other";
    if (!collectionMap.has(colName)) collectionMap.set(colName, []);
    collectionMap.get(colName)!.push(p);
  });

  const colLookup = new Map(adminCollections.map((c) => [c.title.toLowerCase(), c]));
  const colHandleLookup = new Map(adminCollections.map((c) => [c.handle.toLowerCase(), c]));
  const colIdLookup = new Map(adminCollections.map((c) => [c.id, c]));

  return (
    <>
      {Array.from(collectionMap.entries()).map(([colName, products], idx) => {
        const matchedCol = colLookup.get(colName.toLowerCase()) || colHandleLookup.get(colName.toLowerCase()) || colIdLookup.get(colName);
        const PAGE = 20;
        const visibleCount = expandedCols[colName] || PAGE;
        const visibleProducts = products.slice(0, visibleCount);
        const hasMore = products.length > visibleCount;

        return (
          <section key={colName} className={`py-16 ${idx % 2 === 0 ? "bg-secondary/30" : ""}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground">{matchedCol?.title || colName}</h2>
                  {matchedCol?.description && <p className="text-muted-foreground text-sm mt-1">{matchedCol.description}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {visibleProducts.map((product) => {
                  const imgSrc = product.images.split(",")[0]?.trim() || "";
                  const price = product.variants[0]?.price ?? 0;
                  const compareAt = parseFloat(product.variants[0]?.compareAtPrice || "0");
                  return (
                    <div key={product.id} className="group cursor-pointer bg-background" onClick={() => goToProduct(product)}>
                      <div className="relative bg-secondary aspect-[3/4] flex items-center justify-center overflow-hidden">
                        {imgSrc ? (
                          <img src={imgSrc} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <Package className="w-12 h-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="pt-3 pb-2">
                        <h3 className="text-xs font-medium text-foreground uppercase tracking-wide leading-snug line-clamp-2 mb-2">{product.title}</h3>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-sm font-bold text-foreground">₹{price.toFixed(2)}</span>
                          {compareAt > price && (
                            <span className="text-xs text-muted-foreground line-through">₹{compareAt.toFixed(2)}</span>
                          )}
                        </div>
                        {(() => {
                          const colors = getProductColors(product.options);
                          if (colors.length === 0) return null;
                          const MAX = 6;
                          return (
                            <div className="flex items-center gap-1.5">
                              {colors.slice(0, MAX).map((c, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border border-border" style={{ background: getColorHex(c) || "#ccc" }} title={c} />
                              ))}
                              {colors.length > MAX && <span className="text-[10px] text-muted-foreground">+{colors.length - MAX}</span>}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* View All button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => {
                      if (matchedCol) {
                        goToCollection(matchedCol);
                      } else {
                        setExpandedCols((prev) => ({ ...prev, [colName]: visibleCount + PAGE }));
                      }
                    }}
                    className="px-6 py-2.5 border border-foreground/20 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}

export default function StoreFront() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cfg, setCfg] = useState<StoreConfig>(getStoreConfig);
  const [adminProducts, setAdminProducts] = useState<Product[]>(getProducts);
  const [featuredSettings, setFeaturedSettings] = useState({ visible: true, collections: [] as any[] });
  const [adminCollections, setAdminCollections] = useState<Collection[]>([]);
  const [rotatingFeaturesCfg, setRotatingFeaturesCfg] = useState(getRotatingFeaturesConfig);
  const [announcementCfg, setAnnouncementCfg] = useState(getScrollingAnnouncementConfig);
  const [googleReviewsCfg, setGoogleReviewsCfg] = useState<GoogleReviewsConfig>({ showOnHomepage: false, showOnProduct: false, averageRating: 4.7, totalReviewCount: 0, maxReviewsToShow: 10, reviews: [] });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Thank-you page data (stored temporarily after checkout)
  const [thankYouData, setThankYouData] = useState<{ orderNumber: string; firstName: string; items: any[]; total: number; shippingAddress?: any } | null>(null);

  // Derive active views from URL path
  const path = location.pathname;
  const activeTrackOrder = path === "/track-order";
  const activeCartPage = path === "/cart";
  const activeCheckout = path === "/checkout";
  const showThankYou = path === "/thank-you" && thankYouData !== null;

  // Derive active collection from URL
  const activeCollection = (() => {
    const match = path.match(/^\/collection\/(.+)$/);
    if (!match) return null;
    return adminCollections.find(c => c.handle === match[1]) || null;
  })();

  // Derive active product from URL
  const activeProduct = (() => {
    const match = path.match(/^\/product\/(.+)$/);
    if (!match) return null;
    return adminProducts.find(p => p.id === match[1] || p.handle === match[1]) || null;
  })();

  // Derive active policy from URL
  const activePolicyPage = (() => {
    const match = path.match(/^\/policy\/(.+)$/);
    if (!match) return null;
    const footer = getFooterConfig();
    const decoded = decodeURIComponent(match[1]);
    return footer.policies.find(p => p.name.toLowerCase().replace(/\s+/g, "-") === decoded) || null;
  })();

  // Navigation helpers
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  const goHome = () => { navigate("/"); scrollTop(); };
  const goToProduct = (product: Product) => { navigate(`/product/${product.handle || product.id}`); scrollTop(); };
  const goToCollection = (col: Collection) => { navigate(`/collection/${col.handle}`); scrollTop(); };
  const goToCart = () => { navigate("/cart"); scrollTop(); };
  const goToCheckout = () => { navigate("/checkout"); scrollTop(); };
  const goToTrackOrder = () => { navigate("/track-order"); scrollTop(); };
  const goToPolicy = (policy: Policy) => navigate(`/policy/${policy.name.toLowerCase().replace(/\s+/g, "-")}`);
  const goBack = () => navigate(-1);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // Discount logic
  const totalItemCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const bestDiscount = findBestDiscount(totalItemCount);
  const discountAmount = (() => {
    if (!bestDiscount) return 0;
    if (bestDiscount.discountValue === "free") {
      // Sort items by price ascending, cheapest items are free
      const allPrices: number[] = [];
      cartItems.forEach(i => {
        const p = i.product.variants[0]?.price ?? 0;
        for (let x = 0; x < i.qty; x++) allPrices.push(p);
      });
      allPrices.sort((a, b) => a - b);
      const freeCount = Math.min(bestDiscount.getQty, allPrices.length);
      return allPrices.slice(0, freeCount).reduce((s, p) => s + p, 0);
    }
    return 0;
  })();
  const discountLabel = bestDiscount ? bestDiscount.title : "";
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await apiService.getProducts() as any;
        console.log("[StoreFront] Products fetch:", { count: result.products?.length ?? 0, source: result.meta?.source });

        if (result.products) {
          const mapped: Product[] = (result.products as any[]).map((r: any) => ({
            id: r.id,
            title: r.title || "",
            handle: r.handle || "",
            description: r.description || "",
            vendor: r.vendor || "",
            productType: r.productType || "",
            tags: Array.isArray(r.tags) ? r.tags.join(", ") : (r.tags || ""),
            collection: r.collection || "",
            images: r.images || "",
            seoTitle: r.title || "",
            seoDescription: "",
            published: r.status === "active",
            status: ((r.status || "draft").charAt(0).toUpperCase() + (r.status || "draft").slice(1)) as Product["status"],
            options: r.options || [],
            variants: r.variants?.length > 0 ? r.variants : [{ id: "default", sku: "", price: 0, compareAtPrice: "", barcode: "", weight: "", weightUnit: "kg" }],
            createdAt: r.createdAt || new Date().toISOString(),
          }));
          setAdminProducts(mapped);
          syncProductsToLocal(mapped);
        }
      } catch (err) {
        console.warn("[StoreFront] API unavailable, falling back to Supabase:", err);
        // Fallback: fetch directly from Supabase
        const [productsRes, imagesRes, optionsRes] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("product_images").select("*").order("position"),
          supabase.from("product_options").select("*"),
        ]);
        if (productsRes.data) {
          const images = imagesRes.data || [];
          const options = (optionsRes.data || []) as any[];
          const productIds = productsRes.data.map((r: any) => r.id);
          const allVariants: any[] = [];
          for (let b = 0; b < productIds.length; b += 50) {
            const batch = productIds.slice(b, b + 50);
            const { data: batchVariants } = await supabase.from("product_variants").select("*").in("product_id", batch);
            if (batchVariants) allVariants.push(...batchVariants);
          }
          const mapped: Product[] = (productsRes.data as any[]).map((r: any) => {
            const prodVariants = allVariants.filter(v => v.product_id === r.id);
            const prodImages = images.filter(img => img.product_id === r.id);
            const prodOpts = options.filter(o => o.product_id === r.id);
            const mappedVariants = prodVariants.map(v => ({
              id: v.id, sku: v.sku || "", price: Number(v.price) || 0,
              compareAtPrice: String(v.compare_at_price || ""), barcode: v.barcode || "",
              weight: String(v.grams || ""), weightUnit: v.weight_unit || "kg",
            }));
            const mappedImages = prodImages.map(img => img.src).join(", ");
            const mappedOptions: { id: string; name: string; values: string }[] = [];
            if (prodOpts.length > 0) {
              const opt = prodOpts[0];
              if (opt.option1_name) mappedOptions.push({ id: opt.id + "_1", name: opt.option1_name, values: [...new Set(prodVariants.map(v => v.option1_value).filter(Boolean))].join(", ") });
              if (opt.option2_name) mappedOptions.push({ id: opt.id + "_2", name: opt.option2_name, values: [...new Set(prodVariants.map(v => v.option2_value).filter(Boolean))].join(", ") });
              if (opt.option3_name) mappedOptions.push({ id: opt.id + "_3", name: opt.option3_name, values: [...new Set(prodVariants.map(v => v.option3_value).filter(Boolean))].join(", ") });
            }
            return {
              id: r.id, title: r.title || "", handle: r.handle || "", description: r.body_html || "",
              vendor: r.vendor || "", productType: r.product_type || "",
              tags: Array.isArray(r.tags) ? r.tags.join(", ") : (r.tags || ""),
              collection: (r as any).collection_name || r.product_category || "",
              images: mappedImages, seoTitle: r.title || "", seoDescription: "",
              published: r.published || false,
              status: ((r.status || "draft").charAt(0).toUpperCase() + (r.status || "draft").slice(1)) as Product["status"],
              options: mappedOptions,
              variants: mappedVariants.length > 0 ? mappedVariants : [{ id: "default", sku: "", price: 0, compareAtPrice: "", barcode: "", weight: "", weightUnit: "kg" }],
              createdAt: r.created_at || new Date().toISOString(),
            };
          });
          setAdminProducts(mapped);
          syncProductsToLocal(mapped);
        }
      }
    };
    fetchProducts();
  }, []);

  // Fetch collections and all configs from database
  useEffect(() => {
    const loadAll = async () => {
      const [cols, feat, storeCfg, rotCfg, annCfg] = await Promise.all([
        fetchCollections(),
        fetchFeaturedSettings(),
        fetchStoreConfig(),
        fetchRotatingFeaturesConfig(),
        fetchScrollingAnnouncementConfig(),
      ]);
      setAdminCollections(cols);
      setFeaturedSettings(feat);
      setCfg(storeCfg);
      setRotatingFeaturesCfg(rotCfg);
      setAnnouncementCfg(annCfg);
      // Also fetch discounts into cache
      await fetchDiscounts();
    };
    loadAll();
  }, []);

  // ── Visitor tracking ──
  useEffect(() => {
    const sessionId = (() => {
      let id = sessionStorage.getItem("visitor_sid");
      if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("visitor_sid", id); }
      return id;
    })();
    const track = async () => {
      const { data: existing } = await supabase
        .from("visitor_sessions")
        .select("id")
        .eq("session_id", sessionId)
        .maybeSingle();
      if (existing) {
        await supabase.from("visitor_sessions").update({ last_seen_at: new Date().toISOString(), page_url: location.pathname }).eq("id", existing.id);
      } else {
        await supabase.from("visitor_sessions").insert({
          session_id: sessionId,
          page_url: location.pathname,
          referrer: document.referrer || "",
          user_agent: navigator.userAgent || "",
        });
      }
    };
    track();
    const interval = setInterval(() => {
      supabase.from("visitor_sessions").update({ last_seen_at: new Date().toISOString(), page_url: location.pathname }).eq("session_id", sessionId).then(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Fetch Google Reviews from database
  useEffect(() => {
    const fetchGoogleReviews = async () => {
      const [settingsRes, reviewsRes] = await Promise.all([
        supabase.from("google_reviews_settings").select("*").limit(1).maybeSingle(),
        supabase.from("google_reviews").select("*").eq("is_active", true).order("sort_order"),
      ]);
      console.log("[StoreFront] Google Reviews fetch:", { settingsFound: !!settingsRes.data, reviewsCount: reviewsRes.data?.length ?? 0 });
      const s = settingsRes.data;
      const r = reviewsRes.data || [];
      setGoogleReviewsCfg({
        showOnHomepage: s?.show_on_homepage ?? false,
        showOnProduct: s?.show_on_product ?? true,
        averageRating: s?.average_rating ?? 4.7,
        totalReviewCount: s?.total_review_count ?? 0,
        maxReviewsToShow: s?.max_reviews_to_show ?? 10,
        reviews: r.map((rev: any) => ({ ...rev, isActive: rev.is_active, reviewText: rev.review_text })),
      });
    };
    fetchGoogleReviews();
  }, []);

  // Re-read config whenever the tab gains focus or admin saves changes
  useEffect(() => {
    const onFocus = async () => {
      const [storeCfg, rotCfg, annCfg, cols, feat] = await Promise.all([
        fetchStoreConfig(),
        fetchRotatingFeaturesConfig(),
        fetchScrollingAnnouncementConfig(),
        fetchCollections(),
        fetchFeaturedSettings(),
      ]);
      setCfg(storeCfg);
      setRotatingFeaturesCfg(rotCfg);
      setAnnouncementCfg(annCfg);
      setAdminCollections(cols);
      setFeaturedSettings(feat);
      setAdminProducts(getProducts());
      await fetchDiscounts();
    };
    const onStoreConfigUpdated = () => { fetchStoreConfig().then(setCfg); };
    const onFooterUpdated = () => { /* footer reads from localStorage cache, which is already updated */ };
    const onProductsUpdated = () => setAdminProducts(getProducts());
    const onRotatingUpdated = () => setRotatingFeaturesCfg(getRotatingFeaturesConfig());
    const onAnnouncementUpdated = () => setAnnouncementCfg(getScrollingAnnouncementConfig());
    const onCollectionsUpdated = async () => {
      const [cols, feat] = await Promise.all([fetchCollections(), fetchFeaturedSettings()]);
      setAdminCollections(cols);
      setFeaturedSettings(feat);
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("store_config_updated", onStoreConfigUpdated);
    window.addEventListener("footer_config_updated", onFooterUpdated);
    window.addEventListener("productsUpdated", onProductsUpdated);
    window.addEventListener("collectionsUpdated", onCollectionsUpdated);
    window.addEventListener("featuredCollectionsUpdated", onCollectionsUpdated);
    window.addEventListener("rotatingFeaturesUpdated", onRotatingUpdated);
    window.addEventListener("scrollingAnnouncementUpdated", onAnnouncementUpdated);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("store_config_updated", onStoreConfigUpdated);
      window.removeEventListener("footer_config_updated", onFooterUpdated);
      window.removeEventListener("productsUpdated", onProductsUpdated);
      window.removeEventListener("collectionsUpdated", onCollectionsUpdated);
      window.removeEventListener("featuredCollectionsUpdated", onCollectionsUpdated);
      window.removeEventListener("rotatingFeaturesUpdated", onRotatingUpdated);
      window.removeEventListener("scrollingAnnouncementUpdated", onAnnouncementUpdated);
    };
  }, []);

  // Apply favicon dynamically
  useEffect(() => {
    if (cfg.favicon) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = cfg.favicon;
    }
  }, [cfg.favicon]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const openSearch = () => { setSearchQuery(""); setSearchOpen(true); };
  const closeSearch = () => setSearchOpen(false);

  // Use admin products if available, else fallback
  const displayProducts = adminProducts.filter((p) => p.published || p.status === "Active");
  const useFallback = displayProducts.length === 0;

  // Filtered products for search
  const searchResults = searchQuery.trim().length > 0
    ? (useFallback
        ? FALLBACK_PRODUCTS.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : displayProducts.filter((p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.productType.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : [];

  const addToCart = (id: string | number, selectedSize?: string, selectedColor?: string) => {
    const pid = String(id);
    const product = adminProducts.find(p => p.id === pid);
    if (!product) {
      setAddedId(pid);
      setTimeout(() => setAddedId(null), 1200);
      return;
    }
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === pid);
      if (existing) return prev.map(i => i.product.id === pid ? { ...i, qty: i.qty + 1, selectedSize: selectedSize || i.selectedSize, selectedColor: selectedColor || i.selectedColor } : i);
      return [...prev, { product, qty: 1, selectedSize, selectedColor }];
    });
    setAddedId(pid);
    setTimeout(() => setAddedId(null), 1200);
  };

  const buyNow = (id: string, qty: number, selectedSize?: string, selectedColor?: string) => {
    const product = adminProducts.find(p => p.id === id);
    if (!product) return;
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === id);
      if (existing) return prev.map(i => i.product.id === id ? { ...i, qty: i.qty + qty, selectedSize: selectedSize || i.selectedSize, selectedColor: selectedColor || i.selectedColor } : i);
      return [...prev, { product, qty, selectedSize, selectedColor }];
    });
    goToCart();
  };

  const toggleWishlist = (id: string | number) =>
    setWishlist((w) => { const sid = String(id); return w.includes(sid) ? w.filter((x) => x !== sid) : [...w, sid]; });

  /* ── Hero background style ────────────────────────── */
  const heroBgStyle = (): React.CSSProperties => {
    if (cfg.heroBgType === "image" && cfg.heroBgImage) {
      return {
        backgroundImage: `url(${cfg.heroBgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    if (cfg.heroBgType === "color") {
      return { backgroundColor: cfg.heroBgColor };
    }
    // gradient (default)
    return {
      background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #7c3aed 80%, #4c1d95 100%)",
    };
  };

  const overlayBg = `rgba(0,0,0,${cfg.heroOverlayOpacity / 100})`;

  // Show policy page
  if (activePolicyPage) {
    return (
      <PolicyPage
        policy={activePolicyPage}
        onBack={() => goHome()}
        navBgColor={cfg.navBgColor}
        navTextColor={cfg.navTextColor}
        storeName={cfg.storeName}
        logoImage={cfg.logoImage}
        logoType={cfg.logoType}
      />
    );
  }

  const logoH = cfg.logoHeight ?? 40;

  const showTrackOrder = activeTrackOrder && !showThankYou;
  const showProductDetail = activeProduct !== null && !activeCollection && !activePolicyPage && !activeCheckout && !showThankYou && !showTrackOrder;
  const showCartPage = activeCartPage && !showProductDetail && !activeCollection && !activePolicyPage && !activeCheckout && !showThankYou && !showTrackOrder;
  const showCheckout = activeCheckout && !showProductDetail && !activeCollection && !activePolicyPage && !showThankYou && !showTrackOrder;

  // Show collection page
  if (activeCollection) {
    return (
      <CollectionPage
        collection={activeCollection}
        products={adminProducts}
        onBack={() => goHome()}
        navBgColor={cfg.navBgColor}
        navTextColor={cfg.navTextColor}
        storeName={cfg.storeName}
        logoImage={cfg.logoImage}
        logoType={cfg.logoType}
        logoH={logoH}
        cartCount={cartCount}
        wishlist={wishlist}
        addedId={addedId}
        onAddToCart={(id) => addToCart(id)}
        onToggleWishlist={(id) => toggleWishlist(id)}
        onProductClick={(product) => goToProduct(product)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ── Search Overlay ─────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="bg-card border-b border-border shadow-xl">
            <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-foreground text-base outline-none placeholder:text-muted-foreground"
              />
              <button onClick={closeSearch} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto px-4 py-4">
            {searchQuery.trim() === "" ? (
              <p className="text-sm text-center text-white/60 mt-8">Start typing to search products…</p>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-center text-white/60 mt-8">No products found for "<strong>{searchQuery}</strong>"</p>
            ) : (
              <div className="flex flex-col gap-3">
                {searchResults.map((p) => (
                  <div key={p.id} className="bg-card rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className={`${p.color} rounded-xl w-14 h-14 flex items-center justify-center text-2xl shrink-0`}>{p.image}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground">{p.category}</div>
                      <div className="text-sm font-semibold text-foreground truncate">{p.name}</div>
                      <div className="text-sm font-black text-foreground">${p.price} <span className="text-xs text-muted-foreground line-through font-normal">${p.originalPrice}</span></div>
                    </div>
                    <button
                      onClick={() => { addToCart(p.id); closeSearch(); }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shrink-0"
                    >
                      + Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Announcement Bar ───────────────────────────── */}
      <div className="text-center py-2.5 text-xs font-medium tracking-wide" style={{ backgroundColor: cfg.navBgColor === "#000000" ? "#1d4ed8" : cfg.navBgColor, color: cfg.navTextColor }}>
        🚀 Free shipping on orders over $50 &nbsp;·&nbsp; Use code <strong>WELCOME10</strong> for 10% off!
      </div>

      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 shadow-lg" style={{ backgroundColor: cfg.navBgColor }}>

        {/* ── Desktop Navbar (md+) ─── left: links | center: logo | right: search+cart */}
        <div className="hidden md:grid grid-cols-3 items-center max-w-7xl mx-auto px-6 lg:px-8" style={{ height: `${Math.max(logoH + 20, 56)}px` }}>
          {/* Left: page links */}
          <div className="flex items-center gap-7">
            {(showProductDetail || showCartPage || showCheckout || showThankYou || showTrackOrder) && (
              <button onClick={() => goBack()} className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity" style={{ color: cfg.navTextColor }}>
                ← Back
              </button>
            )}
            <button onClick={() => goHome()} className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity" style={{ color: cfg.navTextColor }}>
              Home
            </button>
            {adminCollections.map((col) => (
              <button key={col.id} onClick={() => { goToCollection(col); setMobileMenuOpen(false); }} className="text-sm font-medium opacity-80 hover:opacity-100 transition-opacity" style={{ color: cfg.navTextColor }}>
                {col.title}
              </button>
            ))}
          </div>

          {/* Center: logo */}
          <div className="flex items-center justify-center">
            <a href="/" className="flex items-center gap-2">
              {cfg.logoType === "image" && cfg.logoImage ? (
                <img src={cfg.logoImage} alt={cfg.storeName} style={{ height: `${logoH}px` }} className="w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  {cfg.favicon && (
                    <img src={cfg.favicon} alt="favicon" style={{ height: `${Math.min(logoH, 36)}px` }} className="w-auto rounded object-contain" />
                  )}
                  <span className="font-black text-xl" style={{ color: cfg.navTextColor, fontSize: `${Math.max(14, Math.round(logoH * 0.45))}px` }}>{cfg.storeName}</span>
                </div>
              )}
            </a>
          </div>

          {/* Right: search + cart + admin */}
          <div className="flex items-center justify-end gap-2">
            <button onClick={openSearch} className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100" style={{ color: cfg.navTextColor }}>
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => goToCart()} className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ShoppingCart className="w-5 h-5" style={{ color: cfg.navTextColor }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Navbar (< md) ─── hamburger | logo center | search+cart */}
        <div className="flex md:hidden items-center px-4" style={{ height: `${Math.max(logoH + 16, 52)}px` }}>
          {/* Left: hamburger */}
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen
              ? <X className="w-5 h-5" style={{ color: cfg.navTextColor }} />
              : <Menu className="w-5 h-5" style={{ color: cfg.navTextColor }} />}
          </button>

          {/* Center: logo */}
          <div className="flex-1 flex items-center justify-center">
            <a href="/" className="flex items-center gap-2">
              {cfg.logoType === "image" && cfg.logoImage ? (
                <img src={cfg.logoImage} alt={cfg.storeName} style={{ height: `${logoH}px` }} className="w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-1.5">
                  {cfg.favicon && (
                    <img src={cfg.favicon} alt="favicon" style={{ height: `${Math.min(logoH, 30)}px` }} className="w-auto rounded object-contain" />
                  )}
                  <span className="font-black" style={{ color: cfg.navTextColor, fontSize: `${Math.max(14, Math.round(logoH * 0.4))}px` }}>{cfg.storeName}</span>
                </div>
              )}
            </a>
          </div>

          {/* Right: search + cart */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={openSearch} className="p-2 hover:bg-white/10 rounded-lg transition-colors" style={{ color: cfg.navTextColor }}>
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => goToCart()} className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ShoppingCart className="w-5 h-5" style={{ color: cfg.navTextColor }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="flex md:hidden flex-col border-t border-white/10 px-4 py-3 gap-1" style={{ backgroundColor: cfg.navBgColor }}>
            <button onClick={() => { goHome(); setMobileMenuOpen(false); }} className="text-sm font-medium py-2 px-2 rounded-lg hover:bg-white/10 transition-colors text-left" style={{ color: cfg.navTextColor }}>Home</button>
            {adminCollections.map((col) => (
              <button key={col.id} onClick={() => { goToCollection(col); setMobileMenuOpen(false); }} className="text-sm font-medium py-2 px-2 rounded-lg hover:bg-white/10 transition-colors text-left" style={{ color: cfg.navTextColor }}>{col.title}</button>
            ))}
            
          </div>
        )}
      </nav>

      {/* ── Scrolling Announcement Bar ─────────────────── */}
      <ScrollingAnnouncementBar cfg={announcementCfg} />

      {/* ── Thank You View ── */}
      {showThankYou && thankYouData && (
        <ThankYouView
          orderNumber={thankYouData.orderNumber}
          customerName={thankYouData.firstName}
          items={thankYouData.items}
          total={thankYouData.total}
          shippingAddress={thankYouData.shippingAddress}
          onContinueShopping={() => { setThankYouData(null); goHome(); }}
          onTrackOrder={() => { const on = thankYouData?.orderNumber; setThankYouData(null); navigate("/track-order", { state: { orderNumber: on } }); }}
        />
      )}

      {/* ── Track Order View ── */}
      {showTrackOrder && <TrackOrderView />}

      {/* ── Product Detail Page (replaces homepage content) ── */}
      {showProductDetail && activeProduct && (
        <ProductDetailPage
          product={activeProduct}
          onAddToCart={(id, size, color) => addToCart(id, size, color)}
          onBuyNow={(id, qty, size, color) => buyNow(id, qty, size, color)}
          allProducts={adminProducts}
          onProductClick={(p) => goToProduct(p)}
        />
      )}

      {/* ── Cart Page ── */}
      {showCartPage && (
        <CartPage
          items={cartItems}
          onUpdateQty={(id, qty) => setCartItems(prev => prev.map(i => i.product.id === id ? { ...i, qty } : i))}
          onRemove={(id) => setCartItems(prev => prev.filter(i => i.product.id !== id))}
          onContinueShopping={() => goHome()}
          onCheckout={() => goToCheckout()}
          discountAmount={discountAmount}
          discountLabel={discountLabel}
        />
      )}

      {/* ── Checkout Page ── */}
      {showCheckout && (
        <CheckoutPage
          items={cartItems}
          discountAmount={discountAmount}
          discountLabel={discountLabel}
          onOrderPlaced={(orderNum, firstName, shippingAddress) => {
            const orderItems = cartItems.map(i => ({
              title: i.product.title,
              image: i.product.images.split(",")[0]?.trim() || "",
              qty: i.qty,
              price: i.product.variants[0]?.price ?? 0,
              selectedSize: i.selectedSize,
              selectedColor: i.selectedColor,
            }));
            const total = Math.max(0, cartItems.reduce((s, i) => s + (i.product.variants[0]?.price ?? 0) * i.qty, 0) - discountAmount);
            setCartItems([]);
            setThankYouData({ orderNumber: orderNum, firstName, items: orderItems, total, shippingAddress });
            navigate("/thank-you");
          }}
          onBack={() => goToCart()}
        />
      )}

      {/* ── Homepage content (only when not showing product/cart/checkout) ── */}
      {!showProductDetail && !showCartPage && !showCheckout && !showThankYou && !showTrackOrder && (<>


      {/* ── Hero ───────────────────────────────────────── */}
      {cfg.heroEnabled && (
        <section className={`relative flex ${heroHeightMap[cfg.heroHeight] ?? "min-h-screen"}`} style={heroBgStyle()}>
          {/* Overlay */}
          <div className="absolute inset-0" style={{ backgroundColor: overlayBg }} />
          <div className={`relative z-10 flex flex-col justify-center px-6 py-20 w-full max-w-7xl mx-auto ${alignMap[cfg.heroTextAlign]}`}>
          </div>
        </section>
      )}


      {/* ── Collection-wise Products ──────────────────── */}
      <CollectionWiseProducts
        displayProducts={displayProducts}
        adminCollections={adminCollections}
        useFallback={useFallback}
        goToProduct={goToProduct}
        goToCollection={goToCollection}
        getProductColors={getProductColors}
      />

      {/* ── Featured Collections ────────────────────────── */}
      {featuredSettings.visible && (() => {
        const colMap = new Map(adminCollections.map((c) => [c.id, c]));
        const activeProducts = adminProducts.filter((p) => p.published || p.status === "Active");
        const featuredRows = featuredSettings.collections
          .filter((fc) => fc.featured && colMap.has(fc.collectionId))
          .sort((a, b) => a.order - b.order);
        if (featuredRows.length === 0) return null;
        return featuredRows.map((fc) => {
          const col = colMap.get(fc.collectionId)!;
          // Get products in this collection (by collection ID, title, or handle)
          let colProducts = activeProducts.filter(
            (p) => p.collection === col.id ||
                   p.collection?.toLowerCase() === col.title.toLowerCase() ||
                   p.collection?.toLowerCase() === col.handle.toLowerCase()
          );
          // If no products matched by collection field, use all active products (demo)
          if (colProducts.length === 0) colProducts = activeProducts;
          // Shuffle
          const shuffled = [...colProducts].sort(() => Math.random() - 0.5);
          const limited = shuffled.slice(0, fc.productsToShow);
          return (
            <section key={fc.collectionId} className="py-16 bg-secondary/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-foreground">{col.title}</h2>
                    {col.description && <p className="text-muted-foreground text-sm mt-1">{col.description}</p>}
                  </div>
                  <button onClick={() => goToCollection(col)} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {limited.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products found in this collection.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {limited.map((product) => {
                      const imgSrc = product.images.split(",")[0]?.trim() || "";
                      const price = product.variants[0]?.price ?? 0;
                      const compareAt = parseFloat(product.variants[0]?.compareAtPrice || "0");
                      return (
                        <div key={product.id} className="group cursor-pointer bg-background" onClick={() => goToProduct(product)}>
                          <div className="relative bg-secondary aspect-[3/4] flex items-center justify-center overflow-hidden">
                            {imgSrc ? (
                              <img src={imgSrc} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            ) : (
                              <Package className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                          <div className="pt-3 pb-2">
                            <h3 className="text-xs font-medium text-foreground uppercase tracking-wide leading-snug line-clamp-2 mb-2">{product.title}</h3>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-sm font-bold text-foreground">₹{price.toFixed(2)}</span>
                              {compareAt > price && (
                                <span className="text-xs text-muted-foreground line-through">₹{compareAt.toFixed(2)}</span>
                              )}
                            </div>
                            {(() => {
                              const colors = getProductColors(product.options);
                              if (colors.length === 0) return null;
                              const MAX = 6;
                              return (
                                <div className="flex items-center gap-1.5">
                                  {colors.slice(0, MAX).map((c, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full border border-border" style={{ background: getColorHex(c) || "#ccc" }} title={c} />
                                  ))}
                                  {colors.length > MAX && <span className="text-[10px] text-muted-foreground">+{colors.length - MAX}</span>}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        });
      })()}

      {/* ── Promo Banner ───────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="store-promo-banner">
            <div className="relative z-10">
              <span className="store-badge-pill mb-4 inline-block bg-white/20 text-white border-white/30">Limited Time Offer</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Up to 50% Off<br />Summer Sale</h2>
              <p className="text-white/80 mb-6 max-w-sm">Don't miss out on our biggest sale of the year. Shop now before items sell out!</p>
              <button className="px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-colors text-sm">
                Shop the Sale
              </button>
            </div>
            <div className="hidden md:flex items-center justify-center text-9xl opacity-30 absolute right-16 top-1/2 -translate-y-1/2">
              🛒
            </div>
          </div>
        </div>
      </section>

      {/* ── Google Reviews on Homepage ─────────────────── */}
      {googleReviewsCfg.showOnHomepage && googleReviewsCfg.reviews.filter(r => r.isActive).length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-foreground">{googleReviewsCfg.averageRating}</div>
              <div className="flex items-center justify-center gap-0.5 my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-6 h-6 ${i < Math.floor(googleReviewsCfg.averageRating) ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {googleReviewsCfg.totalReviewCount} Reviews on{" "}
                <span className="font-semibold">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </span>
              </div>
            </div>
            {/* Horizontal scrollable reviews */}
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4 px-1">
                {googleReviewsCfg.reviews.filter(r => r.isActive).slice(0, googleReviewsCfg.maxReviewsToShow).map(review => (
                  <div key={review.id} className="flex-shrink-0 w-[280px] bg-card border border-border rounded-xl p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-sm font-bold text-foreground mb-2">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">{review.name}</div>
                    <div className="flex items-center justify-center gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(review.rating) ? "text-amber-400 fill-amber-400" : "text-border"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic line-clamp-4">{review.reviewText}</p>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </section>
      )}


      </>)}

      {/* ── Rotating Features (above footer) ───────────── */}
      <RotatingFeaturesSection cfg={rotatingFeaturesCfg} />

      {/* ── Footer ─────────────────────────────────────── */}
      <StoreFrontFooter
        storeName={cfg.storeName}
        logoImage={cfg.logoImage}
        logoType={cfg.logoType}
        onPolicyClick={(policy) => goToPolicy(policy)}
        onCollectionClick={(col) => goToCollection(col)}
        onTrackOrderClick={() => goToTrackOrder()}
        collections={adminCollections}
      />
    </div>
  );
}
