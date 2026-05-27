/* ── Discount store (Supabase-backed) ────────────────────── */

import { supabase } from "@/integrations/supabase/client";

export interface Discount {
  id: string;
  name: string;
  title: string;
  buyQty: number;
  getQty: number;
  collections: string;
  uses: number;
  status: "Active" | "Draft";
  discountValue: "free" | "percentage" | "amount";
  canCombine: boolean;
  maxPerOrder: string;
  maxTotal: string;
  priority: number;
}

const CACHE_KEY = "admin_discounts";

// ── Cached sync read (for cart logic that needs instant access) ──
export function getDiscounts(): Discount[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ── Async fetch from DB ──
export async function fetchDiscounts(): Promise<Discount[]> {
  const { data, error } = await supabase
    .from("discounts")
    .select("*")
    .order("priority", { ascending: false });
  if (error) { console.error("fetchDiscounts error:", error); return getDiscounts(); }
  const mapped = (data || []).map(mapRow);
  localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
  return mapped;
}

// ── Save all discounts (replace) ──
export async function saveDiscounts(discounts: Discount[]): Promise<void> {
  localStorage.setItem(CACHE_KEY, JSON.stringify(discounts));
  window.dispatchEvent(new Event("discountsUpdated"));
}

// ── Add single discount ──
export async function addDiscountDB(d: Discount): Promise<void> {
  await supabase.from("discounts").insert(toRow(d));
  window.dispatchEvent(new Event("discountsUpdated"));
}

// ── Update single discount ──
export async function updateDiscountDB(d: Discount): Promise<void> {
  await supabase.from("discounts").update(toRow(d)).eq("id", d.id);
  window.dispatchEvent(new Event("discountsUpdated"));
}

// ── Delete single discount ──
export async function deleteDiscountDB(id: string): Promise<void> {
  await supabase.from("discounts").delete().eq("id", id);
  window.dispatchEvent(new Event("discountsUpdated"));
}

/** Find the best applicable discount for a given total item count */
export function findBestDiscount(totalItems: number): Discount | null {
  const discounts = getDiscounts().filter(d => d.status === "Active");
  if (discounts.length === 0 || totalItems < 2) return null;
  const applicable = discounts.filter(d => totalItems >= d.buyQty + d.getQty);
  if (applicable.length === 0) return null;
  applicable.sort((a, b) => b.priority - a.priority || b.getQty - a.getQty);
  return applicable[0];
}

// ── Helpers ──
function mapRow(r: any): Discount {
  return {
    id: r.id,
    name: r.name || "",
    title: r.title || "",
    buyQty: r.buy_qty || 0,
    getQty: r.get_qty || 0,
    collections: r.collections || "All collections",
    uses: r.uses || 0,
    status: r.status === "Draft" ? "Draft" : "Active",
    discountValue: r.discount_value || "free",
    canCombine: r.can_combine || false,
    maxPerOrder: r.max_per_order || "",
    maxTotal: r.max_total || "",
    priority: r.priority || 0,
  };
}

function toRow(d: Discount) {
  return {
    id: d.id,
    name: d.name,
    title: d.title,
    buy_qty: d.buyQty,
    get_qty: d.getQty,
    collections: d.collections,
    uses: d.uses,
    status: d.status,
    discount_value: d.discountValue,
    can_combine: d.canCombine,
    max_per_order: d.maxPerOrder,
    max_total: d.maxTotal,
    priority: d.priority,
  };
}
