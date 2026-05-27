// Shared store config — persisted in DB with localStorage cache

import { getSetting, saveSetting } from "./siteSettingsDB";

export interface StoreConfig {
  storeName: string;
  logoType: "text" | "image";
  logoImage: string | null;
  favicon: string | null;
  heroEnabled: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  heroBgType: "image" | "color" | "gradient";
  heroBgImage: string | null;
  heroBgColor: string;
  heroTextColor: string;
  heroTextAlign: "left" | "center" | "right";
  heroHeight: "small" | "medium" | "large" | "full";
  heroOverlayOpacity: number;
  heroPrimaryText: string;
  heroPrimaryUrl: string;
  heroPrimaryBg: string;
  heroPrimaryColor: string;
  heroSecondaryText: string;
  heroSecondaryUrl: string;
  heroSecondaryBg: string;
  heroSecondaryColor: string;
  navBgColor: string;
  navTextColor: string;
  logoHeight: number;
}

const DEFAULTS: StoreConfig = {
  storeName: "My Store",
  logoType: "text",
  logoImage: null,
  favicon: null,
  heroEnabled: true,
  heroHeadline: "Welcome to Our Store",
  heroSubheadline: "Discover amazing products at unbeatable prices.",
  heroBgType: "gradient",
  heroBgImage: null,
  heroBgColor: "#1e1b4b",
  heroTextColor: "#ffffff",
  heroTextAlign: "center",
  heroHeight: "full",
  heroOverlayOpacity: 30,
  heroPrimaryText: "Shop Now",
  heroPrimaryUrl: "/",
  heroPrimaryBg: "#ffffff",
  heroPrimaryColor: "#000000",
  heroSecondaryText: "Learn More",
  heroSecondaryUrl: "/",
  heroSecondaryBg: "transparent",
  heroSecondaryColor: "#ffffff",
  navBgColor: "#000000",
  navTextColor: "#ffffff",
  logoHeight: 40,
};

const KEY = "store_config";

/** Sync read from localStorage cache (instant, for initial render) */
export function getStoreConfig(): StoreConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}

/** Async read from DB (authoritative) */
export async function fetchStoreConfig(): Promise<StoreConfig> {
  const cfg = await getSetting<StoreConfig>(KEY, DEFAULTS);
  // Update localStorage cache
  localStorage.setItem(KEY, JSON.stringify(cfg));
  return cfg;
}

/** Save to both DB and localStorage */
export async function saveStoreConfig(config: Partial<StoreConfig>) {
  const current = getStoreConfig();
  const merged = { ...current, ...config };
  localStorage.setItem(KEY, JSON.stringify(merged));
  await saveSetting(KEY, merged);
  window.dispatchEvent(new CustomEvent("store_config_updated"));
}
