// Shared footer config — persisted in DB with localStorage cache

import { getSetting, saveSetting } from "./siteSettingsDB";

export interface FooterLink { id: number; label: string; url: string }
export interface FooterContentBlock { id: number; type: string; visible: boolean; links: FooterLink[] }
export interface FooterColumn { id: number; title: string; visible: boolean; blocks: FooterContentBlock[] }
export interface SocialItem { id: number; platform: string; url: string; visible: boolean }
export interface PaymentItem { id: number; method: string; visible: boolean }
export interface Policy { id: number; name: string; content: string; showInFooter: boolean }

export interface FooterConfig {
  showFooter: boolean;
  bgColor: string;
  textColor: string;
  linkColor: string;
  copyrightText: string;
  showLogoBottom: boolean;
  showAboutUs: boolean;
  aboutContent: string;
  columns: FooterColumn[];
  social: SocialItem[];
  payment: PaymentItem[];
  policies: Policy[];
  stickyFooter: boolean;
  mobileAccordion: boolean;
  accordionOpenByDefault: boolean;
  showOnCheckout: boolean;
  showOnThankYou: boolean;
}

const FOOTER_KEY = "footer_config";

const DEFAULTS: FooterConfig = {
  showFooter: true,
  bgColor: "#000000",
  textColor: "#ffffff",
  linkColor: "#ffffff",
  copyrightText: "© {{year}} My Store. All rights reserved.",
  showLogoBottom: true,
  showAboutUs: true,
  aboutContent: "About Us\n\nWe are a passionate company that truly believes that great products should be accessible to everyone. Our goal is to deliver the coolest, most unique products and the greatest services to our valued customers.",
  columns: [
    {
      id: 1,
      title: "Main Menu",
      visible: true,
      blocks: [
        {
          id: 2,
          type: "Link List",
          visible: true,
          links: [
            { id: 3, label: "Home", url: "/" },
            { id: 4, label: "Shop", url: "/shop" },
            { id: 5, label: "Track Your Order", url: "/track-order" },
          ],
        },
      ],
    },
  ],
  social: [
    { id: 101, platform: "Facebook", url: "", visible: true },
  ],
  payment: [],
  policies: [
    { id: 301, name: "Privacy Policy", showInFooter: true, content: "Privacy Policy\n\nLast updated: January 1, 2026\n\nThis Privacy Policy describes how we collect, use, and share information about you when you use our services." },
    { id: 302, name: "Refund Policy", showInFooter: true, content: "Refund Policy\n\nWe offer a 30-day return policy for all items in original condition." },
    { id: 303, name: "Shipping Policy", showInFooter: true, content: "Shipping Policy\n\nWe ship to all major countries. Standard shipping takes 5-7 business days." },
    { id: 304, name: "Terms of Service", showInFooter: true, content: "Terms of Service\n\nBy using our service you agree to these terms and conditions." },
    { id: 305, name: "Contact Information", showInFooter: true, content: "Contact Us\n\nEmail: support@example.com\nPhone: +1 (555) 000-0000" },
    { id: 306, name: "Return & Exchange Policy", showInFooter: true, content: "Return & Exchange Policy\n\nItems can be returned within 30 days with original receipt and packaging." },
  ],
  stickyFooter: false,
  mobileAccordion: true,
  accordionOpenByDefault: false,
  showOnCheckout: false,
  showOnThankYou: false,
};

/** Sync read from localStorage cache */
export function getFooterConfig(): FooterConfig {
  try {
    const raw = localStorage.getItem(FOOTER_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULTS };
}

/** Async read from DB */
export async function fetchFooterConfig(): Promise<FooterConfig> {
  const cfg = await getSetting<FooterConfig>(FOOTER_KEY, DEFAULTS);
  localStorage.setItem(FOOTER_KEY, JSON.stringify(cfg));
  return cfg;
}

/** Save to both DB and localStorage */
export async function saveFooterConfig(patch: Partial<FooterConfig>) {
  const current = getFooterConfig();
  const merged = { ...current, ...patch };
  localStorage.setItem(FOOTER_KEY, JSON.stringify(merged));
  await saveSetting(FOOTER_KEY, merged);
  window.dispatchEvent(new CustomEvent("footer_config_updated"));
}
