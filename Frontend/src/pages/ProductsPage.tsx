import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Upload, Eye, EyeOff, ExternalLink,
  Pencil, Trash2, Package, ChevronDown, X, AlertTriangle,
  Save, RotateCcw, Link,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

/* ── Types matching new DB schema ───────────────────────── */
interface DbProduct {
  id: string;
  handle: string;
  title: string;
  body_html: string;
  vendor: string;
  product_category: string;
  product_type: string;
  tags: string[];
  published: boolean;
  gift_card: boolean;
  status: string;
  created_at: string;
}

/* ── CSV Parser ──────────────────────────────────────────── */
function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  const len = text.length;
  if (text.charCodeAt(0) === 0xFEFF) i = 1;
  while (i < len) {
    const row: string[] = [];
    while (i < len) {
      let cell = "";
      if (text[i] === '"') {
        i++;
        while (i < len) {
          if (text[i] === '"') {
            if (i + 1 < len && text[i + 1] === '"') { cell += '"'; i += 2; }
            else { i++; break; }
          } else { cell += text[i]; i++; }
        }
        while (i < len && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') i++;
      } else {
        while (i < len && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') { cell += text[i]; i++; }
      }
      row.push(cell);
      if (i < len && text[i] === ',') { i++; } else { break; }
    }
    while (i < len && (text[i] === '\n' || text[i] === '\r')) i++;
    if (row.length === 1 && row[0] === '') continue;
    rows.push(row);
  }
  return rows;
}

/* ── Status badge ─────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls =
    s === "active"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : s === "draft"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-secondary text-muted-foreground";
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

/* ── Delete confirmation ─────────────────────────────────── */
function DeleteConfirmDialog({ title, message, onConfirm, onCancel }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">{title}</h3>
            <p className="text-xs text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ── Import CSV Tab (NEW SCHEMA) ──────────────────────────── */
/* ═══════════════════════════════════════════════════════════ */
interface ParsedProduct {
  handle: string;
  title: string;
  body_html: string;
  vendor: string;
  product_category: string;
  product_type: string;
  tags: string[];
  published: boolean;
  gift_card: boolean;
  status: string;
  // options (first row only)
  option1_name: string;
  option1_linked_to: string;
  option2_name: string;
  option2_linked_to: string;
  option3_name: string;
  option3_linked_to: string;
  // seo
  seo_title: string;
  seo_description: string;
  // metafields
  age_group: string;
  clothing_features: string;
  color_pattern: string;
  fabric: string;
  size: string;
  sleeve_length_type: string;
  target_gender: string;
  top_length_type: string;
  // collected across rows
  variants: {
    sku: string;
    grams: number;
    inventory_tracker: string;
    inventory_quantity: number;
    inventory_policy: string;
    fulfillment_service: string;
    price: number;
    compare_at_price: number;
    requires_shipping: boolean;
    taxable: boolean;
    unit_price_total_measure: number | null;
    unit_price_total_measure_unit: string;
    unit_price_base_measure: number | null;
    unit_price_base_measure_unit: string;
    barcode: string;
    variant_image: string;
    weight_unit: string;
    tax_code: string;
    cost_per_item: number;
    option1_value: string;
    option2_value: string;
    option3_value: string;
  }[];
  images: { src: string; position: number; alt_text: string }[];
}

function parseShopifyCSV(csvText: string): ParsedProduct[] {
  const allRows = parseCSVRows(csvText);
  if (allRows.length < 2) return [];
  const headers = allRows[0].map(h => h.trim().toLowerCase());
  const ci = (name: string) => headers.indexOf(name);
  const col = (row: string[], name: string) => { const idx = ci(name); return idx >= 0 ? (row[idx] ?? "").trim() : ""; };

  const map = new Map<string, ParsedProduct>();

  for (let r = 1; r < allRows.length; r++) {
    const row = allRows[r];
    const handle = col(row, "handle");
    if (!handle) continue;

    if (!map.has(handle)) {
      const tagsRaw = col(row, "tags");
      map.set(handle, {
        handle,
        title: col(row, "title"),
        body_html: col(row, "body (html)"),
        vendor: col(row, "vendor"),
        product_category: col(row, "product category"),
        product_type: col(row, "type"),
        tags: tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [],
        published: col(row, "published").toLowerCase() === "true",
        gift_card: col(row, "gift card").toLowerCase() === "true",
        status: col(row, "status") || "active",
        option1_name: col(row, "option1 name"),
        option1_linked_to: col(row, "option1 linked to"),
        option2_name: col(row, "option2 name"),
        option2_linked_to: col(row, "option2 linked to"),
        option3_name: col(row, "option3 name"),
        option3_linked_to: col(row, "option3 linked to"),
        seo_title: col(row, "seo title"),
        seo_description: col(row, "seo description"),
        age_group: col(row, "age group (product.metafields.shopify.age-group)"),
        clothing_features: col(row, "clothing features (product.metafields.shopify.clothing-features)"),
        color_pattern: col(row, "color (product.metafields.shopify.color-pattern)"),
        fabric: col(row, "fabric (product.metafields.shopify.fabric)"),
        size: col(row, "size (product.metafields.shopify.size)"),
        sleeve_length_type: col(row, "sleeve length type (product.metafields.shopify.sleeve-length-type)"),
        target_gender: col(row, "target gender (product.metafields.shopify.target-gender)"),
        top_length_type: col(row, "top length type (product.metafields.shopify.top-length-type)"),
        variants: [],
        images: [],
      });
    }

    const product = map.get(handle)!;

    // Variant
    const price = parseFloat(col(row, "variant price")) || 0;
    const compareAt = parseFloat(col(row, "variant compare at price")) || 0;
    product.variants.push({
      sku: col(row, "variant sku"),
      grams: parseInt(col(row, "variant grams")) || 0,
      inventory_tracker: col(row, "variant inventory tracker"),
      inventory_quantity: parseInt(col(row, "variant inventory qty")) || 0,
      inventory_policy: col(row, "variant inventory policy") || "deny",
      fulfillment_service: col(row, "variant fulfillment service") || "manual",
      price,
      compare_at_price: compareAt,
      requires_shipping: col(row, "variant requires shipping").toLowerCase() !== "false",
      taxable: col(row, "variant taxable").toLowerCase() !== "false",
      unit_price_total_measure: parseFloat(col(row, "unit price total measure")) || null,
      unit_price_total_measure_unit: col(row, "unit price total measure unit"),
      unit_price_base_measure: parseFloat(col(row, "unit price base measure")) || null,
      unit_price_base_measure_unit: col(row, "unit price base measure unit"),
      barcode: col(row, "variant barcode"),
      variant_image: col(row, "variant image"),
      weight_unit: col(row, "variant weight unit") || "kg",
      tax_code: col(row, "variant tax code"),
      cost_per_item: parseFloat(col(row, "cost per item")) || 0,
      option1_value: col(row, "option1 value"),
      option2_value: col(row, "option2 value"),
      option3_value: col(row, "option3 value"),
    });

    // Image
    const imgSrc = col(row, "image src");
    if (imgSrc) {
      const pos = parseInt(col(row, "image position")) || product.images.length + 1;
      const alt = col(row, "image alt text");
      // Avoid duplicate images
      if (!product.images.some(img => img.src === imgSrc)) {
        product.images.push({ src: imgSrc, position: pos, alt_text: alt });
      }
    }
  }

  return Array.from(map.values());
}

function ImportCSVTab() {
  const [preview, setPreview] = useState<ParsedProduct[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [importLog, setImportLog] = useState<string[]>([]);
  const [imported, setImported] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collections, setCollections] = useState<{ id: string; title: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load collections from DB
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from("collections").select("*").order("sort_order", { ascending: true });
        setCollections(data || []);
      } catch { setCollections([]); }
    };
    load();
    window.addEventListener("collectionsUpdated", load);
    return () => window.removeEventListener("collectionsUpdated", load);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImported(false);
    setImportLog([]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setPreview(parseShopifyCSV(text));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setImporting(true);
    setProgress(0);
    const logs: string[] = [];
    const total = preview.length;
    let successCount = 0;
    let failedCount = 0;
    const errors: { handle: string; error: string }[] = [];

    try {
      logs.push(`⚡ Importing ${total} products into 7 tables...`);
      setImportLog([...logs]);
      setProgress(5);

      // Delete existing products with same handles
      const handles = preview.map(p => p.handle);
      logs.push(`🔄 Checking for existing products...`);
      setImportLog([...logs]);

      for (let h = 0; h < handles.length; h += 20) {
        const batch = handles.slice(h, h + 20);
        const { data: existing } = await supabase.from("products").select("id").in("handle", batch);
        if (existing && existing.length > 0) {
          const ids = existing.map(e => e.id);
          await supabase.from("products").delete().in("id", ids);
        }
      }
      setProgress(10);

      // Insert products one by one, then related data
      for (let i = 0; i < preview.length; i++) {
        const p = preview[i];
        try {
          // 1. Insert product
          const { data: productData, error: productError } = await supabase
            .from("products")
            .insert({
              handle: p.handle,
              title: p.title,
              body_html: (p.body_html || "").slice(0, 10000),
              vendor: p.vendor,
              product_category: p.product_category,
              product_type: p.product_type,
              tags: p.tags,
              published: p.published,
              gift_card: p.gift_card,
              status: p.status,
              collection_name: selectedCollection,
            } as any)
            .select("id")
            .single();

          if (productError || !productData) {
            throw new Error(productError?.message || "Insert failed");
          }

          const productId = productData.id;

          // 2-6. Insert related data in parallel
          const relatedInserts: Promise<any>[] = [];

          // Variants
          if (p.variants.length > 0) {
            const variantRows = p.variants.map((v, vi) => ({
              product_id: productId,
              sku: v.sku,
              grams: v.grams,
              inventory_tracker: v.inventory_tracker,
              inventory_quantity: v.inventory_quantity,
              inventory_policy: v.inventory_policy,
              fulfillment_service: v.fulfillment_service,
              price: v.price,
              compare_at_price: v.compare_at_price,
              requires_shipping: v.requires_shipping,
              taxable: v.taxable,
              unit_price_total_measure: v.unit_price_total_measure,
              unit_price_total_measure_unit: v.unit_price_total_measure_unit,
              unit_price_base_measure: v.unit_price_base_measure,
              unit_price_base_measure_unit: v.unit_price_base_measure_unit,
              barcode: v.barcode,
              variant_image: v.variant_image,
              weight_unit: v.weight_unit,
              tax_code: v.tax_code,
              cost_per_item: v.cost_per_item,
              option1_value: v.option1_value,
              option2_value: v.option2_value,
              option3_value: v.option3_value,
            }));
            // Insert in batches of 50
            for (let b = 0; b < variantRows.length; b += 50) {
              relatedInserts.push(supabase.from("product_variants").insert(variantRows.slice(b, b + 50) as any).select() as any);
            }
          }

          // Options
          relatedInserts.push(supabase.from("product_options").insert({
            product_id: productId,
            option1_name: p.option1_name,
            option1_linked_to: p.option1_linked_to,
            option2_name: p.option2_name,
            option2_linked_to: p.option2_linked_to,
            option3_name: p.option3_name,
            option3_linked_to: p.option3_linked_to,
          } as any).select() as any);

          // Images
          if (p.images.length > 0) {
            const imgRows = p.images.map(img => ({
              product_id: productId,
              src: img.src,
              position: img.position,
              alt_text: img.alt_text,
            }));
            for (let b = 0; b < imgRows.length; b += 50) {
              relatedInserts.push(supabase.from("product_images").insert(imgRows.slice(b, b + 50) as any).select() as any);
            }
          }

          // SEO
          if (p.seo_title || p.seo_description) {
            relatedInserts.push((supabase as any).from("product_seo").insert({
              product_id: productId,
              seo_title: p.seo_title,
              seo_description: p.seo_description,
            }).select());
          }

          // Metafields
          if (p.age_group || p.clothing_features || p.color_pattern || p.fabric || p.size || p.sleeve_length_type || p.target_gender || p.top_length_type) {
            relatedInserts.push((supabase as any).from("product_metafields").insert({
              product_id: productId,
              age_group: p.age_group,
              clothing_features: p.clothing_features,
              color_pattern: p.color_pattern,
              fabric: p.fabric,
              size: p.size,
              sleeve_length_type: p.sleeve_length_type,
              target_gender: p.target_gender,
              top_length_type: p.top_length_type,
            }).select());
          }

          await Promise.all(relatedInserts);
          successCount++;
        } catch (err: any) {
          failedCount++;
          errors.push({ handle: p.handle, error: err.message });
          logs.push(`⚠️ "${p.title?.slice(0, 30)}" error: ${err.message}`);
        }

        const pct = 10 + Math.round(((i + 1) / total) * 85);
        setProgress(pct);
        if ((i + 1) % 5 === 0 || i === preview.length - 1) {
          logs.push(`✓ Products: ${i + 1}/${total} (${pct}%)`);
          setImportLog([...logs]);
        }
      }

      // Save import log
      await (supabase as any).from("import_logs").insert({
        file_name: fileName,
        total_rows: total,
        success_rows: successCount,
        failed_rows: failedCount,
        errors: errors.length > 0 ? JSON.stringify(errors) : "[]",
      });

      setProgress(100);
      logs.push(`🎉 Done! ${successCount} products imported, ${failedCount} failed.`);
      setImportLog([...logs]);
      setImported(true);
      setPreview([]);
      setFileName("");
      window.dispatchEvent(new Event("productsUpdated"));
    } catch (err: any) {
      logs.push(`❌ Error: ${err.message}`);
      setImportLog([...logs]);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="section-card">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-foreground">Import Shopify CSV</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload a Shopify-format CSV — data is stored across 7 normalized tables
          </p>
        </div>

        {imported && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            ✓ All products imported successfully!
          </div>
        )}

        {/* File picker */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Select CSV File <span className="text-destructive">*</span>
          </label>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload CSV File
            </button>
            {fileName && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Package className="w-4 h-4" />
                {fileName}
              </span>
            )}
          </div>
        </div>

        {/* Collection selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Assign to Collection
          </label>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="">— No Collection —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.title}>{c.title}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">Products will be grouped under this collection on the storefront.</p>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">{preview.length} product(s) ready to import:</p>
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-secondary/50">
                  <tr>
                    {["Photo", "Title", "Handle", "Status", "Variants", "Images"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((p) => {
                    const imgUrl = p.images[0]?.src || "";
                    return (
                      <tr key={p.handle} className="border-t border-border">
                        <td className="px-3 py-2">
                          <div className="w-9 h-9 rounded-lg border border-border bg-secondary/50 overflow-hidden flex items-center justify-center shrink-0">
                            {imgUrl ? (
                              <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <Package className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 font-medium text-foreground max-w-[120px] truncate">{p.title}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.handle}</td>
                        <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                        <td className="px-3 py-2 text-muted-foreground">{p.variants.length}</td>
                        <td className="px-3 py-2 text-muted-foreground">{p.images.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {preview.length > 10 && <p className="text-xs text-muted-foreground px-3 py-2">…and {preview.length - 10} more</p>}
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="mt-3 flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Upload className="w-4 h-4" />
              {importing ? "Importing…" : `Import ${preview.length} Product${preview.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        )}

        {/* Progress bar */}
        {importing && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-foreground">Importing...</span>
              <span className="text-xs font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        {/* Import log */}
        {importLog.length > 0 && (
          <div className="mt-3 border border-border rounded-xl p-3 bg-secondary/20 max-h-40 overflow-y-auto space-y-1">
            {importLog.map((log, i) => (
              <p key={i} className="text-xs font-mono text-foreground">{log}</p>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="section-card border border-primary/20 bg-primary/5">
        <h4 className="text-sm font-bold text-primary mb-3">CSV Import — 7 Table Structure</h4>
        <ul className="space-y-1.5 text-xs text-primary/80">
          {[
            "products → Handle, Title, Body HTML, Vendor, Category, Type, Tags, Status",
            "product_variants → SKU, Price, Compare At Price, Grams, Inventory, Barcode, Options",
            "product_options → Option names and linked-to fields",
            "product_images → Image URLs with position and alt text",
            "product_seo → SEO Title and Description",
            "product_metafields → Age group, Color, Fabric, Size, Gender, etc.",
            "import_logs → Import history with success/failure counts",
          ].map((line) => (
            <li key={line} className="flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0">·</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ── All Products List ────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════ */
type StatusFilter = "All" | "active" | "draft" | "archived";
type SortKey = "date-desc" | "date-asc" | "title-asc" | "price-desc";

interface ListProduct {
  id: string;
  handle: string;
  title: string;
  status: string;
  published: boolean;
  vendor: string;
  product_type: string;
  collection_name: string;
  created_at: string;
  first_image: string;
  variant_count: number;
  price: number;
}

function AllProductsList() {
  const [products, setProducts] = useState<ListProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<ListProduct | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState("");

  const fetchFromDb = async () => {
    setLoading(true);
    try {
      const [productsRes, imagesRes] = await Promise.all([
        supabase.from("products").select("id, handle, title, status, published, vendor, product_type, collection_name, created_at").order("created_at", { ascending: false }),
        supabase.from("product_images").select("product_id, src, position").order("position"),
      ]);

      // Fetch first variant price per product using RPC or manual approach
      const productIds = (productsRes.data || []).map(p => p.id);
      const variantPrices: Record<string, { price: number; count: number }> = {};
      // Fetch variants in batches to avoid 1000-row limit
      for (let b = 0; b < productIds.length; b += 50) {
        const batch = productIds.slice(b, b + 50);
        const { data: batchVariants } = await supabase
          .from("product_variants")
          .select("product_id, price")
          .in("product_id", batch);
        if (batchVariants) {
          for (const v of batchVariants) {
            if (!variantPrices[v.product_id]) {
              variantPrices[v.product_id] = { price: Number(v.price) || 0, count: 0 };
            }
            variantPrices[v.product_id].count++;
          }
        }
      }

      if (productsRes.data) {
        const images = imagesRes.data || [];

        const mapped: ListProduct[] = (productsRes.data as any[]).map((r: any) => {
          const pi = images.filter(img => img.product_id === r.id);
          const vp = variantPrices[r.id];
          return {
            id: r.id,
            handle: r.handle || "",
            title: r.title || "",
            status: r.status || "draft",
            published: r.published || false,
            vendor: r.vendor || "",
            product_type: r.product_type || "",
            collection_name: r.collection_name || "",
            created_at: r.created_at || "",
            first_image: pi[0]?.src || "",
            variant_count: vp?.count || 0,
            price: vp?.price || 0,
          };
        });
        setProducts(mapped);
      }
    } catch (err) {
      console.error("[ProductsPage] Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFromDb();
    const refresh = () => fetchFromDb();
    window.addEventListener("productsUpdated", refresh);
    return () => window.removeEventListener("productsUpdated", refresh);
  }, []);

  // Derive unique collection names for filter
  const collectionNames = Array.from(new Set(products.map(p => p.collection_name).filter(Boolean))).sort();

  const filtered = products
    .filter((p) => {
      if (statusFilter !== "All" && p.status.toLowerCase() !== statusFilter) return false;
      if (collectionFilter && p.collection_name !== collectionFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.product_type.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "title-asc") return a.title.localeCompare(b.title);
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "date-asc") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map((p) => p.id)));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("products").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    fetchFromDb();
  };

  const handleTogglePublished = async (p: ListProduct) => {
    const next = !p.published;
    await supabase.from("products").update({ published: next, status: next ? "active" : "draft" }).eq("id", p.id);
    fetchFromDb();
  };

  const handleBulkDelete = async () => {
    for (const id of selected) {
      await supabase.from("products").delete().eq("id", id);
    }
    setSelected(new Set());
    setShowBulkDeleteConfirm(false);
    fetchFromDb();
  };

  const handleBulkTogglePublished = async (publish: boolean) => {
    for (const id of selected) {
      await supabase.from("products").update({ published: publish, status: publish ? "active" : "draft" }).eq("id", id);
    }
    setSelected(new Set());
    fetchFromDb();
  };

  return (
    <div>
      {deleteTarget && (
        <DeleteConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.title || "Untitled"}"? It will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showBulkDeleteConfirm && (
        <DeleteConfirmDialog
          title={`Delete ${selected.size} Products`}
          message={`Are you sure you want to permanently delete ${selected.size} selected product${selected.size !== 1 ? "s" : ""}?`}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDeleteConfirm(false)}
        />
      )}

      <div className="section-card">
        {/* Status filter tabs */}
        <div className="flex items-center gap-0.5 mb-5 border-b border-border pb-0 -mt-1">
          {(["All", "active", "draft", "archived"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px capitalize ${
                statusFilter === s
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search products"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="px-3 py-2 pr-8 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="date-desc">Date (newest first)</option>
              <option value="date-asc">Date (oldest first)</option>
              <option value="title-asc">Title A–Z</option>
              <option value="price-desc">Price (high to low)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <div className="relative">
            <select
              className="px-3 py-2 pr-8 rounded-lg border border-border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
            >
              <option value="">All Collections</option>
              {collectionNames.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={() => handleBulkTogglePublished(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                <Eye className="w-3.5 h-3.5" /> Show {selected.size}
              </button>
              <button onClick={() => handleBulkTogglePublished(false)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                <EyeOff className="w-3.5 h-3.5" /> Hide {selected.size}
              </button>
              <button onClick={() => setShowBulkDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete {selected.size}
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-36 py-2.5 pl-4 pr-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-primary rounded" checked={allSelected} onChange={toggleAll} />
                    <span className="text-[10px]">Select All</span>
                  </label>
                </th>
                <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product</th>
                <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Collection</th>
                <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variants</th>
                <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vendor</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">Loading products…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
                  {products.length === 0 ? "No products yet. Use Import CSV to add products." : "No products match your search."}
                </td></tr>
              )}
              {!loading && filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-1">
                      <input type="checkbox" className="w-4 h-4 accent-primary rounded mr-0.5" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                      <button title={p.published ? "Hide" : "Show"} onClick={() => handleTogglePublished(p)} className={`p-1 rounded transition-colors ${p.published ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-secondary"}`}>
                        {p.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <a href={`/product/${p.handle}`} target="_blank" rel="noopener noreferrer" title="View" className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button title="Delete" onClick={() => setDeleteTarget(p)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg border border-border bg-secondary/50 shrink-0 overflow-hidden flex items-center justify-center">
                        {p.first_image ? (
                          <img src={p.first_image} alt={p.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <Package className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate max-w-[200px]">{p.title || "Untitled"}</div>
                        <div className="text-xs text-muted-foreground">₹{p.price.toFixed(2)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                  <td className="py-3 pr-4 text-muted-foreground text-xs">{p.collection_name || "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{p.variant_count} variant{p.variant_count !== 1 ? "s" : ""}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{p.vendor || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ── Main ProductsPage ────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════ */
type View = "list" | "import";

export default function ProductsPage() {
  const [view, setView] = useState<View>("list");

  return (
    <div>
      <h2 className="page-header">Products</h2>
      <p className="page-sub">Manage your product catalog.</p>

      <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            view === "list"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Package className="w-4 h-4" />
          All Products
        </button>
        <button
          onClick={() => setView("import")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            view === "import"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
      </div>

      {view === "list" && <AllProductsList />}
      {view === "import" && <ImportCSVTab />}
    </div>
  );
}
