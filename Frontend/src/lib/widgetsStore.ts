// ── Widget Store — persisted in DB with localStorage cache ──

import { getSetting, saveSetting } from "./siteSettingsDB";

// ── Rotating Features ─────────────────────────────────────
export interface RotatingFeature {
  id: string; icon: string; title: string; description: string; visible: boolean;
}
export interface RotatingFeaturesConfig {
  enabled: boolean; rotationSpeed: number; animationType: "fade" | "slide";
  bgColor: string; textColor: string; features: RotatingFeature[];
}

const RF_KEY = "widget_rotating_features";
const RF_DEFAULTS: RotatingFeaturesConfig = {
  enabled: true, rotationSpeed: 3, animationType: "fade",
  bgColor: "#0b0a0a", textColor: "#ffffff",
  features: [
    { id: "1", icon: "Truck", title: "Free Shipping", description: "Free shipping with Prepaid Order", visible: true },
    { id: "2", icon: "RotateCcw", title: "Easy Returns", description: "Returns Made Easy & Free", visible: true },
    { id: "3", icon: "Percent", title: "Best Discount", description: "Limited-Time Best Discount", visible: true },
    { id: "4", icon: "Lock", title: "Payment Safety", description: "100% Safe & Secure Shopping", visible: true },
  ],
};

export function getRotatingFeaturesConfig(): RotatingFeaturesConfig {
  try { const raw = localStorage.getItem(RF_KEY); if (raw) return JSON.parse(raw); } catch {}
  return RF_DEFAULTS;
}
export async function fetchRotatingFeaturesConfig(): Promise<RotatingFeaturesConfig> {
  const cfg = await getSetting<RotatingFeaturesConfig>(RF_KEY, RF_DEFAULTS);
  localStorage.setItem(RF_KEY, JSON.stringify(cfg)); return cfg;
}
export async function saveRotatingFeaturesConfig(cfg: RotatingFeaturesConfig): Promise<void> {
  localStorage.setItem(RF_KEY, JSON.stringify(cfg));
  await saveSetting(RF_KEY, cfg);
  window.dispatchEvent(new Event("rotatingFeaturesUpdated"));
}

// ── Scrolling Announcement Bar ────────────────────────────
export interface AnnouncementItem { id: string; icon: string; text: string; visible: boolean; }
export interface ScrollingAnnouncementConfig {
  enabled: boolean; bgColor: string; textColor: string; speed: number; items: AnnouncementItem[];
}

const SA_KEY = "widget_scrolling_announcement";
const SA_DEFAULTS: ScrollingAnnouncementConfig = {
  enabled: true, bgColor: "#ffffff", textColor: "#000000", speed: 20,
  items: [
    { id: "1", icon: "Star", text: "15 Days Return", visible: true },
    { id: "2", icon: "Truck", text: "Free Shipping on orders over ₹499", visible: true },
    { id: "3", icon: "Shield", text: "100% Secure Payments", visible: true },
  ],
};

export function getScrollingAnnouncementConfig(): ScrollingAnnouncementConfig {
  try { const raw = localStorage.getItem(SA_KEY); if (raw) return JSON.parse(raw); } catch {}
  return SA_DEFAULTS;
}
export async function fetchScrollingAnnouncementConfig(): Promise<ScrollingAnnouncementConfig> {
  const cfg = await getSetting<ScrollingAnnouncementConfig>(SA_KEY, SA_DEFAULTS);
  localStorage.setItem(SA_KEY, JSON.stringify(cfg)); return cfg;
}
export async function saveScrollingAnnouncementConfig(cfg: ScrollingAnnouncementConfig): Promise<void> {
  localStorage.setItem(SA_KEY, JSON.stringify(cfg));
  await saveSetting(SA_KEY, cfg);
  window.dispatchEvent(new Event("scrollingAnnouncementUpdated"));
}

// ── Countdown Timer ───────────────────────────────────────
export interface CountdownTimerConfig {
  enabled: boolean; paused: boolean; hours: number; minutes: number; seconds: number;
  showOnHomepage: boolean; showOnProduct: boolean;
  positionOnProduct: "above-add-to-bag" | "below-add-to-bag" | "above-price" | "below-price";
  showTextAbove: boolean; textAbove: string; textAboveFontSize: string; textAboveFontWeight: string;
  textAboveColor: string; textAboveAlignment: string;
  showTextInside: boolean; textInside: string; textInsideFontSize: string; textInsideFontWeight: string;
  textInsideColor: string; textInsideAlignment: string;
  showTextBelow: boolean; textBelow: string; textBelowFontSize: string; textBelowFontWeight: string;
  textBelowColor: string; textBelowAlignment: string;
  fontFamily: string; numberFontSize: string; numberColor: string; bgColor: string;
  borderRadius: string; cardSpacing: string;
  enableGradient: boolean; gradientColors: string; borderThickness: string;
  glowStrength: string; animationSpeed: string;
}

const CT_KEY = "widget_countdown_timer";
const CT_DEFAULTS: CountdownTimerConfig = {
  enabled: true, paused: false, hours: 0, minutes: 55, seconds: 0,
  showOnHomepage: false, showOnProduct: true, positionOnProduct: "above-add-to-bag",
  showTextAbove: true, textAbove: "Buy 10 T-Shirt @ 1245/- | Buy 7 T-Shirt @ 996/-",
  textAboveFontSize: "18px", textAboveFontWeight: "Normal", textAboveColor: "#333333", textAboveAlignment: "Center",
  showTextInside: false, textInside: "", textInsideFontSize: "14px", textInsideFontWeight: "Normal",
  textInsideColor: "#333333", textInsideAlignment: "Center",
  showTextBelow: true, textBelow: "Buy 5 T-Shirt @ 747/- | Buy 3 T-Shirt @ 498/-",
  textBelowFontSize: "16px", textBelowFontWeight: "Normal", textBelowColor: "#333333", textBelowAlignment: "Center",
  fontFamily: "system-ui, -apple-system, sans-serif", numberFontSize: "48px", numberColor: "#000000",
  bgColor: "#ffffff", borderRadius: "12px", cardSpacing: "6px",
  enableGradient: true, gradientColors: "#a855f7, #ec4899, #f97316",
  borderThickness: "3px", glowStrength: "20px", animationSpeed: "3s",
};

export function getCountdownTimerConfig(): CountdownTimerConfig {
  try { const raw = localStorage.getItem(CT_KEY); if (raw) return JSON.parse(raw); } catch {}
  return CT_DEFAULTS;
}
export async function fetchCountdownTimerConfig(): Promise<CountdownTimerConfig> {
  const cfg = await getSetting<CountdownTimerConfig>(CT_KEY, CT_DEFAULTS);
  localStorage.setItem(CT_KEY, JSON.stringify(cfg)); return cfg;
}
export async function saveCountdownTimerConfig(cfg: CountdownTimerConfig): Promise<void> {
  localStorage.setItem(CT_KEY, JSON.stringify(cfg));
  await saveSetting(CT_KEY, cfg);
  window.dispatchEvent(new Event("countdownTimerUpdated"));
}

// ── Live Viewer Count ─────────────────────────────────────
export interface LiveViewerCountConfig {
  enabled: boolean; minCount: number; maxCount: number; updateInterval: number;
  displayText: string; dotColor: string; textColor: string;
}

const LV_KEY = "widget_live_viewer_count";
const LV_DEFAULTS: LiveViewerCountConfig = {
  enabled: true, minCount: 153, maxCount: 300, updateInterval: 4,
  displayText: "{count} people are currently looking at this", dotColor: "#132452", textColor: "#000000",
};

export function getLiveViewerCountConfig(): LiveViewerCountConfig {
  try { const raw = localStorage.getItem(LV_KEY); if (raw) return JSON.parse(raw); } catch {}
  return LV_DEFAULTS;
}
export async function fetchLiveViewerCountConfig(): Promise<LiveViewerCountConfig> {
  const cfg = await getSetting<LiveViewerCountConfig>(LV_KEY, LV_DEFAULTS);
  localStorage.setItem(LV_KEY, JSON.stringify(cfg)); return cfg;
}
export async function saveLiveViewerCountConfig(cfg: LiveViewerCountConfig): Promise<void> {
  localStorage.setItem(LV_KEY, JSON.stringify(cfg));
  await saveSetting(LV_KEY, cfg);
  window.dispatchEvent(new Event("liveViewerCountUpdated"));
}

// ── Trust Badges ──────────────────────────────────────────
export interface TrustBadge { id: string; active: boolean; imageUrl: string; text: string; altText: string; }
export interface TrustBadgesConfig { enabled: boolean; badges: TrustBadge[]; }

const TB_KEY = "widget_trust_badges";
const TB_DEFAULTS: TrustBadgesConfig = {
  enabled: true,
  badges: [
    { id: "1", active: true, imageUrl: "https://cdn.shopify.com/s/files/1/0738/2882/7359/files/DIAMOND.png", text: "PREMIUM<br>QUALITY", altText: "Premium Quality" },
    { id: "2", active: true, imageUrl: "https://cdn.shopify.com/s/files/1/0738/2882/7359/files/SHIPPING.png", text: "SHIPPING<br>FREE", altText: "Shipping Free" },
    { id: "3", active: true, imageUrl: "https://cdn.shopify.com/s/files/1/0738/2882/7359/files/BEST_PRICE.png", text: "BEST<br>PRICE", altText: "Best Price" },
    { id: "4", active: true, imageUrl: "https://cdn.shopify.com/s/files/1/0738/2882/7359/files/VERIFIED.png", text: "VERIFIED AND<br>SECURED", altText: "Verified and Secured" },
  ],
};

export function getTrustBadgesConfig(): TrustBadgesConfig {
  try { const raw = localStorage.getItem(TB_KEY); if (raw) return JSON.parse(raw); } catch {}
  return TB_DEFAULTS;
}
export async function fetchTrustBadgesConfig(): Promise<TrustBadgesConfig> {
  const cfg = await getSetting<TrustBadgesConfig>(TB_KEY, TB_DEFAULTS);
  localStorage.setItem(TB_KEY, JSON.stringify(cfg)); return cfg;
}
export async function saveTrustBadgesConfig(cfg: TrustBadgesConfig): Promise<void> {
  localStorage.setItem(TB_KEY, JSON.stringify(cfg));
  await saveSetting(TB_KEY, cfg);
  window.dispatchEvent(new Event("trustBadgesUpdated"));
}

// ── Google Reviews (config only — reviews stored in google_reviews table) ──
export interface GoogleReview {
  id: string; name: string; rating: number; reviewText: string; sortOrder: number; isActive: boolean;
}
export interface GoogleReviewsConfig {
  showOnHomepage: boolean; showOnProduct: boolean; averageRating: number;
  totalReviewCount: number; maxReviewsToShow: number; reviews: GoogleReview[];
}

const GR_KEY = "widget_google_reviews";

export function getGoogleReviewsConfig(): GoogleReviewsConfig {
  try { const raw = localStorage.getItem(GR_KEY); if (raw) return JSON.parse(raw); } catch {}
  return {
    showOnHomepage: false, showOnProduct: true, averageRating: 4.7,
    totalReviewCount: 17, maxReviewsToShow: 10, reviews: [],
  };
}

export function saveGoogleReviewsConfig(cfg: GoogleReviewsConfig): void {
  localStorage.setItem(GR_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event("googleReviewsUpdated"));
}
