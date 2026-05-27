import { useState, useEffect } from "react";
import { Minus, Plus, Star, Package, Truck, RotateCcw, Percent, Lock, Award, Gift, Clock, Zap, CheckCircle, Users, TrendingUp, Shield, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/productStore";
import {
  getCountdownTimerConfig, CountdownTimerConfig,
  getLiveViewerCountConfig, LiveViewerCountConfig,
  getTrustBadgesConfig, TrustBadgesConfig,
  GoogleReviewsConfig,
} from "@/lib/widgetsStore";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getProductColors, getColorHex } from "@/lib/colorUtils";
import { supabase } from "@/integrations/supabase/client";

const DESC_KEY = "description-settings-config";
function getDescConfig() {
  try { return { enabled: true, readMoreThreshold: 500, allowInlineImages: true, exchangeReturnPolicy: "", showGlobalImage: false, globalImageDataUrl: "", showInsideDescImage: true, insideDescImageDataUrl: "", ...JSON.parse(localStorage.getItem(DESC_KEY) || "{}") }; }
  catch { return { enabled: true, readMoreThreshold: 500, allowInlineImages: true, exchangeReturnPolicy: "", showGlobalImage: false, globalImageDataUrl: "", showInsideDescImage: false, insideDescImageDataUrl: "" }; }
}

const WIDGET_ICONS: Record<string, React.ElementType> = { Truck, RotateCcw, Percent, Lock, Star, Heart, Shield, Award, Gift, Clock, Zap, CheckCircle, Users, TrendingUp };

const PAYMENT_METHODS = ["AMEX", "Apple Pay", "G Pay", "Mastercard", "Shop Pay", "VISA"];

/* ── Countdown Timer Widget (Flip-Clock Style) ── */
function CountdownWidget({ cfg }: { cfg: CountdownTimerConfig }) {
  const [time, setTime] = useState({ h: cfg.hours, m: cfg.minutes, s: cfg.seconds });

  useEffect(() => {
    if (cfg.paused) return;
    let total = cfg.hours * 3600 + cfg.minutes * 60 + cfg.seconds;
    const id = setInterval(() => {
      total = Math.max(0, total - 1);
      setTime({ h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 });
      if (total <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cfg.hours, cfg.minutes, cfg.seconds, cfg.paused]);

  const pad = (n: number) => String(n).padStart(2, "0").split("");
  const hd = pad(time.h), md = pad(time.m), sd = pad(time.s);

  const gradientBorder = cfg.enableGradient ? {
    background: `linear-gradient(135deg, ${cfg.gradientColors})`,
    padding: cfg.borderThickness,
    borderRadius: cfg.borderRadius,
    boxShadow: cfg.enableGradient ? `0 0 ${cfg.glowStrength} rgba(168,85,247,0.4)` : undefined,
  } : {};

  const innerStyle: React.CSSProperties = {
    backgroundColor: cfg.bgColor,
    borderRadius: cfg.enableGradient ? `calc(${cfg.borderRadius} - ${cfg.borderThickness})` : cfg.borderRadius,
    border: cfg.enableGradient ? "none" : "2px solid hsl(var(--border))",
  };

  const DigitBox = ({ digit }: { digit: string }) => (
    <div
      className="relative flex items-center justify-center bg-card border border-border rounded-lg shadow-sm overflow-hidden"
      style={{ width: "clamp(40px, 10vw, 64px)", height: "clamp(52px, 13vw, 80px)" }}
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-border/40" />
      <span
        style={{ fontFamily: cfg.fontFamily || "inherit", color: cfg.numberColor, fontWeight: 800, fontSize: "clamp(28px, 7vw, 48px)", lineHeight: 1 }}
      >
        {digit}
      </span>
    </div>
  );

  const Separator = () => (
    <div className="flex flex-col items-center justify-center gap-2 mx-1">
      <div className="w-2 h-2 rounded-full bg-foreground/60" />
      <div className="w-2 h-2 rounded-full bg-foreground/60" />
    </div>
  );

  return (
    <div className="my-4">
      <div style={cfg.enableGradient ? gradientBorder : {}}>
        <div style={innerStyle} className="py-6 px-6">
          {cfg.showTextAbove && cfg.textAbove && (
            <p style={{ fontSize: cfg.textAboveFontSize, fontWeight: cfg.textAboveFontWeight === "Bold" ? 700 : 400, color: cfg.textAboveColor, textAlign: (cfg.textAboveAlignment?.toLowerCase() || "center") as any }} className="mb-4">{cfg.textAbove}</p>
          )}
          {cfg.showTextInside && cfg.textInside && (
            <p style={{ fontSize: cfg.textInsideFontSize, fontWeight: cfg.textInsideFontWeight === "Bold" ? 700 : 400, color: cfg.textInsideColor, textAlign: (cfg.textInsideAlignment?.toLowerCase() || "center") as any }} className="mb-4">{cfg.textInside}</p>
          )}
          <div className="flex items-center justify-center gap-1.5">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex gap-1.5">
                <DigitBox digit={hd[0]} />
                <DigitBox digit={hd[1]} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Hours</span>
            </div>
            <Separator />
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex gap-1.5">
                <DigitBox digit={md[0]} />
                <DigitBox digit={md[1]} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Minutes</span>
            </div>
            <Separator />
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex gap-1.5">
                <DigitBox digit={sd[0]} />
                <DigitBox digit={sd[1]} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Seconds</span>
            </div>
          </div>
          {cfg.showTextBelow && cfg.textBelow && (
            <p style={{ fontSize: cfg.textBelowFontSize, fontWeight: cfg.textBelowFontWeight === "Bold" ? 700 : 400, color: cfg.textBelowColor, textAlign: (cfg.textBelowAlignment?.toLowerCase() || "center") as any }} className="mt-4">{cfg.textBelow}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Live Viewer Count Widget ── */
function LiveViewerWidget({ cfg }: { cfg: LiveViewerCountConfig }) {
  const [count, setCount] = useState(Math.floor(Math.random() * (cfg.maxCount - cfg.minCount + 1)) + cfg.minCount);
  useEffect(() => {
    const id = setInterval(() => setCount(Math.floor(Math.random() * (cfg.maxCount - cfg.minCount + 1)) + cfg.minCount), cfg.updateInterval * 1000);
    return () => clearInterval(id);
  }, [cfg.minCount, cfg.maxCount, cfg.updateInterval]);

  return (
    <div className="flex items-center gap-2 py-2 border-b" style={{ color: cfg.textColor }}>
      <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: cfg.dotColor }} />
      <span className="text-sm font-medium">{cfg.displayText.replace("{count}", String(count))}</span>
    </div>
  );
}

/* ── Trust Badges Widget ── */
function TrustBadgesWidget({ cfg }: { cfg: TrustBadgesConfig }) {
  const active = cfg.badges.filter(b => b.active);
  if (active.length === 0) return null;
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      {active.map(badge => (
        <div key={badge.id} className="flex flex-col items-center gap-1.5 text-center">
          <img src={badge.imageUrl} alt={badge.altText} className="w-10 h-10 object-contain" />
          <span className="text-[10px] font-bold text-foreground uppercase leading-tight" dangerouslySetInnerHTML={{ __html: badge.text }} />
        </div>
      ))}
    </div>
  );
}

/* ── Google Reviews Widget (Horizontal Scroll) ── */
function GoogleReviewsWidget({ cfg, maxToShow }: { cfg: GoogleReviewsConfig; maxToShow?: number }) {
  const allActive = cfg.reviews.filter(r => r.isActive);
  const activeReviews = maxToShow ? allActive.slice(0, maxToShow) : allActive;
  if (activeReviews.length === 0) return null;

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-foreground">{cfg.averageRating}</div>
        <div className="flex items-center justify-center gap-0.5 my-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-5 h-5 ${i < Math.floor(cfg.averageRating) ? "text-amber-400 fill-amber-400" : "text-border"}`} />
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Reviews on <span className="font-semibold">
            <span className="text-blue-500">G</span>
            <span className="text-red-500">o</span>
            <span className="text-yellow-500">o</span>
            <span className="text-blue-500">g</span>
            <span className="text-green-500">l</span>
            <span className="text-red-500">e</span>
          </span>
        </div>
      </div>

      {/* Horizontal scrollable reviews */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 px-1">
          {activeReviews.map(review => (
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
  );
}

/* ── Description Section ── */
function DescriptionSection({ product, descCfg }: { product: Product; descCfg: any }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "policy">("description");

  if (!descCfg.enabled) return null;

  const desc = product.description || "";
  const isLong = desc.length > descCfg.readMoreThreshold;
  const displayDesc = isLong && !expanded ? desc.slice(0, descCfg.readMoreThreshold) + "…" : desc;
  const isHtml = /<[a-z][\s\S]*>/i.test(desc);

  return (
    <div className="border-t mt-6">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("description")}
          className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "description" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Description
        </button>
        {descCfg.exchangeReturnPolicy && (
          <button
            onClick={() => setActiveTab("policy")}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "policy" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Exchange & Return
          </button>
        )}
      </div>

      {activeTab === "description" ? (
        <div className="py-4">
          {isHtml ? (
            <div className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: displayDesc }} />
          ) : (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{displayDesc}</p>
          )}
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-sm text-primary font-medium mt-2 hover:underline">
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
          {descCfg.showInsideDescImage && descCfg.insideDescImageDataUrl && (
            <img src={descCfg.insideDescImageDataUrl} alt="Product info" className="mt-4 max-w-full rounded-lg" />
          )}
        </div>
      ) : (
        <div className="py-4">
          <div className="text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: descCfg.exchangeReturnPolicy }} />
        </div>
      )}

      {descCfg.showGlobalImage && descCfg.globalImageDataUrl && (
        <img src={descCfg.globalImageDataUrl} alt="Product details" className="mt-2 max-w-full rounded-lg" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ── MAIN Product Detail Page (content only, no nav/footer) */
/* ═══════════════════════════════════════════════════════════ */

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (id: string, selectedSize?: string, selectedColor?: string) => void;
  onBuyNow: (id: string, qty: number, selectedSize?: string, selectedColor?: string) => void;
  allProducts?: Product[];
  onProductClick?: (product: Product) => void;
}

export default function ProductDetailPage({
  product, onAddToCart, onBuyNow, allProducts = [], onProductClick,
}: ProductDetailPageProps) {
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [countdownCfg, setCountdownCfg] = useState<CountdownTimerConfig>(getCountdownTimerConfig);
  const [liveViewCfg, setLiveViewCfg] = useState<LiveViewerCountConfig>(getLiveViewerCountConfig);
  const [trustCfg, setTrustCfg] = useState<TrustBadgesConfig>(getTrustBadgesConfig);
  const [reviewsCfg, setReviewsCfg] = useState<GoogleReviewsConfig>({ showOnHomepage: false, showOnProduct: false, averageRating: 4.7, totalReviewCount: 0, maxReviewsToShow: 10, reviews: [] });
  const [descCfg, setDescCfg] = useState(getDescConfig);

  useEffect(() => {
    const refresh = () => {
      setCountdownCfg(getCountdownTimerConfig());
      setLiveViewCfg(getLiveViewerCountConfig());
      setTrustCfg(getTrustBadgesConfig());
      setDescCfg(getDescConfig());
    };
    // Fetch Google reviews from Supabase
    const fetchReviews = async () => {
      const [settingsRes, reviewsRes] = await Promise.all([
        supabase.from("google_reviews_settings").select("*").limit(1).single(),
        supabase.from("google_reviews").select("*").eq("is_active", true).order("sort_order"),
      ]);
      const s = settingsRes.data;
      const r = reviewsRes.data || [];
      setReviewsCfg({
        showOnHomepage: s?.show_on_homepage ?? false,
        showOnProduct: s?.show_on_product ?? true,
        averageRating: s?.average_rating ?? 4.7,
        totalReviewCount: s?.total_review_count ?? 0,
        maxReviewsToShow: s?.max_reviews_to_show ?? 10,
        reviews: r.map((rev: any) => ({ ...rev, isActive: rev.is_active, reviewText: rev.review_text })),
      });
    };
    fetchReviews();
    window.addEventListener("countdownTimerUpdated", refresh);
    window.addEventListener("liveViewerCountUpdated", refresh);
    window.addEventListener("trustBadgesUpdated", refresh);
    window.addEventListener("focus", () => { refresh(); fetchReviews(); });
    return () => {
      window.removeEventListener("countdownTimerUpdated", refresh);
      window.removeEventListener("liveViewerCountUpdated", refresh);
      window.removeEventListener("trustBadgesUpdated", refresh);
      window.removeEventListener("focus", () => {});
    };
  }, []);

  const images = product.images.split(",").map(s => s.trim()).filter(Boolean);
  const price = product.variants[0]?.price ?? 0;
  const compareAt = parseFloat(product.variants[0]?.compareAtPrice || "0");
  const discount = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  const ALL_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  const sizeOption = product.options.find(o => o.name.toLowerCase() === "size");
  const sizes = sizeOption ? sizeOption.values.split(",").map(s => s.trim()) : ALL_SIZES;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Images */}
        <div>
          <div className="bg-secondary rounded-xl overflow-hidden aspect-square flex items-center justify-center">
            {images.length > 0 ? (
              <img src={images[selectedImage] || images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-24 h-24 text-muted-foreground" />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === selectedImage ? "border-foreground" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div>
          <h1 className="text-lg font-bold text-foreground uppercase leading-snug">{product.title}</h1>

          {/* Price */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl font-bold text-foreground">₹{price}</span>
            {compareAt > price && (
              <>
                <span className="text-base text-muted-foreground line-through">₹{compareAt}</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Live viewer */}
          {liveViewCfg.enabled && <LiveViewerWidget cfg={liveViewCfg} />}

          {/* Color swatches */}
          {(() => {
            const colors = getProductColors(product.options);
            if (colors.length === 0) return null;
            const MAX_SHOW = 8;
            const visible = colors.slice(0, MAX_SHOW);
            const extra = colors.length - MAX_SHOW;
            return (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Color: {selectedColor || `${colors.length} available`}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {visible.map((c, i) => {
                    const hex = getColorHex(c);
                    const isSelected = selectedColor === c;
                    return (
                      <div
                        key={i}
                        title={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform ${isSelected ? "ring-2 ring-primary ring-offset-2" : "border-2 border-border"}`}
                        style={{ background: hex || "#ccc" }}
                      />
                    );
                  })}
                  {extra > 0 && (
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">+{extra}</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${selectedSize === size ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border hover:border-foreground"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          {/* Countdown Timer */}
          {countdownCfg.enabled && countdownCfg.showOnProduct && <CountdownWidget cfg={countdownCfg} />}

          {/* Quantity + Add to Bag */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 text-foreground hover:bg-secondary transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="px-4 py-2.5 text-sm font-medium text-foreground min-w-[40px] text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-2.5 text-foreground hover:bg-secondary transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
            <button
              onClick={() => { for (let i = 0; i < qty; i++) onAddToCart(product.id, selectedSize || undefined, selectedColor || undefined); }}
              className="flex-1 py-3 text-sm font-semibold border border-foreground text-foreground rounded-lg hover:bg-secondary transition-colors uppercase tracking-wider"
            >
              Add to Bag
            </button>
          </div>

          {/* Buy Now */}
          <button
            onClick={() => onBuyNow(product.id, qty, selectedSize || undefined, selectedColor || undefined)}
            className="w-full mt-3 py-3 text-sm font-bold bg-[#5a3825] text-white rounded-lg hover:bg-[#4a2d1e] transition-colors uppercase tracking-wider"
          >
            Buy Now
          </button>

          {/* Trust Badges */}
          {trustCfg.enabled && <TrustBadgesWidget cfg={trustCfg} />}

          {/* Payment methods */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {PAYMENT_METHODS.map(m => (
              <span key={m} className="px-3 py-1.5 rounded text-[11px] font-bold border border-border bg-card text-foreground">{m}</span>
            ))}
          </div>

          {/* Description */}
          <DescriptionSection product={product} descCfg={descCfg} />
        </div>
      </div>

      {/* Google Reviews */}
      {reviewsCfg.showOnProduct && <GoogleReviewsWidget cfg={reviewsCfg} maxToShow={reviewsCfg.maxReviewsToShow} />}

      {/* Product Recommendations */}
      {(() => {
        const REC_KEY = "product-recommendation-config";
        let recCfg = { enabled: true, count: 8, layout: "carousel" as "grid" | "carousel", showPrice: true, showComparePrice: true };
        try { recCfg = { ...recCfg, ...JSON.parse(localStorage.getItem(REC_KEY) || "{}") }; } catch {}

        if (!recCfg.enabled || !product.collection) return null;

        const recommended = allProducts.filter(
          (p) =>
            p.id !== product.id &&
            (p.published || p.status === "Active") &&
            (p.collection === product.collection ||
              p.collection?.toLowerCase() === product.collection?.toLowerCase())
        ).slice(0, recCfg.count);

        if (recommended.length === 0) return null;

        const isCarousel = recCfg.layout === "carousel";

        return (
          <div className="py-8 border-t mt-4">
            <h2 className="text-lg font-bold text-foreground mb-4">You May Also Like</h2>
            {isCarousel ? (
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4 px-1">
                  {recommended.map((rec) => {
                    const img = rec.images.split(",")[0]?.trim() || "";
                    const rPrice = rec.variants[0]?.price ?? 0;
                    const rCompare = parseFloat(rec.variants[0]?.compareAtPrice || "0");
                    const colors = getProductColors(rec.options);
                    const MAX_DOTS = 6;
                    return (
                      <div
                        key={rec.id}
                        className="flex-shrink-0 w-[180px] cursor-pointer group"
                        onClick={() => onProductClick?.(rec)}
                      >
                        <div className="bg-secondary rounded-xl h-44 overflow-hidden mb-2">
                          {img ? (
                            <img src={img} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-muted-foreground" /></div>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug mb-1">{rec.title}</h3>
                        {recCfg.showPrice && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-foreground">₹{rPrice.toFixed(2)}</span>
                            {recCfg.showComparePrice && rCompare > rPrice && (
                              <span className="text-xs text-muted-foreground line-through">₹{rCompare.toFixed(2)}</span>
                            )}
                          </div>
                        )}
                        {colors.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {colors.slice(0, MAX_DOTS).map((c, i) => (
                              <div key={i} className="w-4 h-4 rounded-full border border-border" style={{ background: getColorHex(c) || "#ccc" }} title={c} />
                            ))}
                            {colors.length > MAX_DOTS && <span className="text-[10px] text-muted-foreground">+{colors.length - MAX_DOTS}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommended.map((rec) => {
                  const img = rec.images.split(",")[0]?.trim() || "";
                  const rPrice = rec.variants[0]?.price ?? 0;
                  const rCompare = parseFloat(rec.variants[0]?.compareAtPrice || "0");
                  const colors = getProductColors(rec.options);
                  const MAX_DOTS = 6;
                  return (
                    <div
                      key={rec.id}
                      className="cursor-pointer group"
                      onClick={() => onProductClick?.(rec)}
                    >
                      <div className="bg-secondary rounded-xl h-40 overflow-hidden mb-2">
                        {img ? (
                          <img src={img} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-muted-foreground" /></div>
                        )}
                      </div>
                      <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug mb-1">{rec.title}</h3>
                      {recCfg.showPrice && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-foreground">₹{rPrice.toFixed(2)}</span>
                          {recCfg.showComparePrice && rCompare > rPrice && (
                            <span className="text-xs text-muted-foreground line-through">₹{rCompare.toFixed(2)}</span>
                          )}
                        </div>
                      )}
                      {colors.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          {colors.slice(0, MAX_DOTS).map((c, i) => (
                            <div key={i} className="w-4 h-4 rounded-full border border-border" style={{ background: getColorHex(c) || "#ccc" }} title={c} />
                          ))}
                          {colors.length > MAX_DOTS && <span className="text-[10px] text-muted-foreground">+{colors.length - MAX_DOTS}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </main>
  );
}
