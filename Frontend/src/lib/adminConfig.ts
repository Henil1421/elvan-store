// Admin configuration — persisted in DB with localStorage cache

import { getSetting, saveSetting } from "./siteSettingsDB";

export interface AdminConfig {
  email: string;
  passwordHash: string;
  adminPath: string;
  domain: string;
  performanceMode: "smart" | "ultra-aggressive" | "balanced";
  pixelFacebook: { enabled: boolean; code: string };
  pixelGoogle: { enabled: boolean; code: string };
  pixelCustom: { enabled: boolean; scripts: string };
}

const DEFAULTS: AdminConfig = {
  email: "krishna.sb.o3o2@gmail.com",
  passwordHash: btoa("KrishnaSB@18"),
  adminPath: "/admin",
  domain: "",
  performanceMode: "smart",
  pixelFacebook: { enabled: false, code: "" },
  pixelGoogle: { enabled: false, code: "" },
  pixelCustom: { enabled: false, scripts: "" },
};

const KEY = "admin_config";

export function getAdminConfig(): AdminConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
  return { ...DEFAULTS };
}

export async function fetchAdminConfig(): Promise<AdminConfig> {
  const cfg = await getSetting<AdminConfig>(KEY, DEFAULTS);
  localStorage.setItem(KEY, JSON.stringify(cfg));
  return cfg;
}

export async function saveAdminConfig(patch: Partial<AdminConfig>) {
  const current = getAdminConfig();
  const merged = { ...current, ...patch };
  localStorage.setItem(KEY, JSON.stringify(merged));
  await saveSetting(KEY, merged);
}

export function verifyCredentials(email: string, password: string): boolean {
  const config = getAdminConfig();
  return config.email === email && config.passwordHash === btoa(password);
}

export async function updateCredentials(email: string, password: string) {
  await saveAdminConfig({ email, passwordHash: btoa(password) });
}

// Session helpers
export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem("admin_session") === "true";
}

export function setAdminSession(val: boolean) {
  if (val) sessionStorage.setItem("admin_session", "true");
  else sessionStorage.removeItem("admin_session");
}
