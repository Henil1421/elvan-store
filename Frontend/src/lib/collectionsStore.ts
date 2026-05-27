/* ── Collections store (Supabase-backed) ─────────────────── */

import { supabase } from "@/integrations/supabase/client";

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  productCount: number;
  productCondition: string;
  sortOrder: number;
  createdAt: string;
}

export interface FeaturedCollectionConfig {
  collectionId: string;
  featured: boolean;
  productsToShow: number;
  order: number;
}

export interface FeaturedCollectionsSettings {
  visible: boolean;
  collections: FeaturedCollectionConfig[];
}

/* ── Collections CRUD (async, Supabase) ───────────────────── */

export async function fetchCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) { console.error("fetchCollections error:", error); return []; }
  return (data || []).map(mapRow);
}

export async function addCollectionDB(c: Omit<Collection, "id">): Promise<Collection | null> {
  const { data, error } = await supabase
    .from("collections")
    .insert({
      title: c.title,
      handle: c.handle,
      description: c.description,
      product_condition: c.productCondition,
      sort_order: c.sortOrder ?? 0,
    })
    .select()
    .single();
  if (error) { console.error("addCollection error:", error); return null; }
  window.dispatchEvent(new Event("collectionsUpdated"));
  return mapRow(data);
}

export async function updateCollectionDB(id: string, patch: Partial<Collection>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.handle !== undefined) dbPatch.handle = patch.handle;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.productCondition !== undefined) dbPatch.product_condition = patch.productCondition;
  if (patch.sortOrder !== undefined) dbPatch.sort_order = patch.sortOrder;
  await supabase.from("collections").update(dbPatch).eq("id", id);
  window.dispatchEvent(new Event("collectionsUpdated"));
}

export async function deleteCollectionDB(id: string): Promise<void> {
  await supabase.from("collections").delete().eq("id", id);
  window.dispatchEvent(new Event("collectionsUpdated"));
}

export async function bulkDeleteCollectionsDB(ids: string[]): Promise<void> {
  await supabase.from("collections").delete().in("id", ids);
  window.dispatchEvent(new Event("collectionsUpdated"));
}

export async function reorderCollectionsDB(orderedIds: string[]): Promise<void> {
  // Update sort_order for each collection
  const updates = orderedIds.map((id, i) =>
    supabase.from("collections").update({ sort_order: i }).eq("id", id)
  );
  await Promise.all(updates);
  window.dispatchEvent(new Event("collectionsUpdated"));
}

/* ── Featured Collections (async, Supabase) ───────────────── */

export async function fetchFeaturedSettings(): Promise<FeaturedCollectionsSettings> {
  const [settingsRes, fcRes] = await Promise.all([
    supabase.from("featured_collections_settings").select("*").limit(1).maybeSingle(),
    supabase.from("featured_collections").select("*").order("sort_order"),
  ]);
  const visible = settingsRes.data?.visible ?? true;
  const collections: FeaturedCollectionConfig[] = (fcRes.data || []).map((r: any) => ({
    collectionId: r.collection_id,
    featured: r.featured,
    productsToShow: r.products_to_show,
    order: r.sort_order,
  }));
  return { visible, collections };
}

export async function saveFeaturedSettingsDB(settings: FeaturedCollectionsSettings): Promise<void> {
  // Upsert visibility
  const { data: existing } = await supabase.from("featured_collections_settings").select("id").limit(1).maybeSingle();
  if (existing) {
    await supabase.from("featured_collections_settings").update({ visible: settings.visible }).eq("id", existing.id);
  } else {
    await supabase.from("featured_collections_settings").insert({ visible: settings.visible });
  }

  // Delete all featured_collections then re-insert
  await supabase.from("featured_collections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (settings.collections.length > 0) {
    await supabase.from("featured_collections").insert(
      settings.collections.map((fc) => ({
        collection_id: fc.collectionId,
        featured: fc.featured,
        products_to_show: fc.productsToShow,
        sort_order: fc.order,
      }))
    );
  }
  window.dispatchEvent(new Event("featuredCollectionsUpdated"));
}

/* ── Helpers ──────────────────────────────────────────────── */

function mapRow(r: any): Collection {
  return {
    id: r.id,
    title: r.title || "",
    handle: r.handle || "",
    description: r.description || "",
    productCount: 0, // computed from products table
    productCondition: r.product_condition || "Manual",
    sortOrder: r.sort_order ?? 0,
    createdAt: r.created_at || new Date().toISOString(),
  };
}

export function makeCollectionHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Keep for backward compat but no longer primary
export function getCollections(): Collection[] { return []; }
export function getFeaturedSettings(): FeaturedCollectionsSettings { return { visible: true, collections: [] }; }
