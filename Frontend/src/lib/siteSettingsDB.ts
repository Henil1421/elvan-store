/* ── Generic site_settings DB helper ──────────────────────── */
import { supabase } from "@/integrations/supabase/client";

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) { console.error(`getSetting(${key}) error:`, error); return fallback; }
    if (data?.value) return { ...fallback, ...(data.value as object) } as T;
  } catch (e) { console.error(`getSetting(${key}) exception:`, e); }
  return fallback;
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("site_settings")
      .select("key")
      .eq("key", key)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("site_settings")
        .update({ value: value as any, updated_at: new Date().toISOString() })
        .eq("key", key);
    } else {
      await supabase
        .from("site_settings")
        .insert({ key, value: value as any });
    }
  } catch (e) {
    console.error(`saveSetting(${key}) error:`, e);
  }
}
