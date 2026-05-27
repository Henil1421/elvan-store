/* ── Shared product store (localStorage) ────────────────────── */

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice: string;
  barcode: string;
  weight: string;
  weightUnit: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string; // comma-separated
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string;
  collection: string;
  images: string; // comma-separated URLs
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  status: "Active" | "Draft" | "Archived";
  options: ProductOption[];
  variants: ProductVariant[];
  createdAt: string;
}

const KEY = "admin_products";

/* ── localStorage helpers ────────────────────────────────── */
export function getProducts(): Product[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProductsLocal(products: Product[]): void {
  localStorage.setItem(KEY, JSON.stringify(products));
  window.dispatchEvent(new Event("productsUpdated"));
}

export function addProductLocal(product: Product): void {
  saveProductsLocal([product, ...getProducts()]);
}

export function updateProductLocal(updated: Product): void {
  saveProductsLocal(getProducts().map((p) => (p.id === updated.id ? updated : p)));
}

export function deleteProductLocal(id: string): void {
  saveProductsLocal(getProducts().filter((p) => p.id !== id));
}

/* ── Sync all DB products into localStorage ──────────────── */
export function syncProductsToLocal(products: Product[]): void {
  localStorage.setItem(KEY, JSON.stringify(products));
}

export function makeHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ── CSV import ──────────────────────────────────────────────── */

/** Parse full CSV text into rows, correctly handling multi-line quoted fields */
function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  const len = text.length;

  // Skip BOM
  if (text.charCodeAt(0) === 0xFEFF) i = 1;

  while (i < len) {
    const row: string[] = [];
    // parse one row (may span multiple lines due to quoted fields)
    while (i < len) {
      let cell = "";
      if (text[i] === '"') {
        // quoted field
        i++; // skip opening quote
        while (i < len) {
          if (text[i] === '"') {
            if (i + 1 < len && text[i + 1] === '"') {
              cell += '"';
              i += 2;
            } else {
              i++; // skip closing quote
              break;
            }
          } else {
            cell += text[i];
            i++;
          }
        }
        // skip to comma or newline
        while (i < len && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') i++;
      } else {
        // unquoted field
        while (i < len && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
          cell += text[i];
          i++;
        }
      }
      row.push(cell);
      if (i < len && text[i] === ',') {
        i++; // skip comma, continue to next field
      } else {
        break; // end of row
      }
    }
    // skip newline(s)
    while (i < len && (text[i] === '\n' || text[i] === '\r')) i++;
    // skip completely empty rows
    if (row.length === 1 && row[0] === '') continue;
    rows.push(row);
  }
  return rows;
}

export function parseProductCSV(csvText: string): Product[] {
  const allRows = parseCSVRows(csvText);
  if (allRows.length < 2) return [];

  const headers = allRows[0].map((h) => h.trim().toLowerCase());

  const colIdx = (name: string) => headers.indexOf(name);
  const col = (row: string[], name: string) => {
    const idx = colIdx(name);
    return idx >= 0 ? (row[idx] ?? "").trim() : "";
  };
  const colAny = (row: string[], ...names: string[]) => {
    for (const n of names) { const v = col(row, n); if (v) return v; }
    return "";
  };

  const rows = allRows.slice(1);

  // Group rows by handle — collect ALL images & variants
  const map = new Map<string, Product>();
  const imageMap = new Map<string, Set<string>>(); // handle → unique image URLs

  for (const row of rows) {
    const title = colAny(row, "title", "name");
    const handle = col(row, "handle") || makeHandle(title) || makeId();
    if (!title && !handle) continue;

    // Collect images from multiple possible columns
    const imgSrc = colAny(row, "image src", "images") || "";
    const variantImg = colAny(row, "variant image") || "";

    if (!imageMap.has(handle)) imageMap.set(handle, new Set());
    const imgSet = imageMap.get(handle)!;
    if (imgSrc) imgSet.add(imgSrc);
    if (variantImg && variantImg !== imgSrc) imgSet.add(variantImg);

    if (!map.has(handle)) {
      const status = (col(row, "status") as Product["status"]) || (colAny(row, "published") === "true" ? "Active" : "Draft");
      const productCategory = colAny(row, "product category");
      // Extract options from Option1 Name, Option2 Name, Option3 Name
      const options: ProductOption[] = [];
      for (let n = 1; n <= 3; n++) {
        const optName = col(row, `option${n} name`);
        if (optName) {
          options.push({ id: makeId(), name: optName, values: "" });
        }
      }

      map.set(handle, {
        id: makeId(),
        title,
        handle,
        description: colAny(row, "body (html)", "description") || "",
        vendor: col(row, "vendor") || "",
        productType: colAny(row, "type", "product type") || productCategory || "",
        tags: col(row, "tags") || "",
        collection: col(row, "collection") || "",
        images: "", // filled later from imageMap
        seoTitle: colAny(row, "seo title") || title,
        seoDescription: colAny(row, "seo description") || "",
        published: status === "Active" || status.toLowerCase() === "active" || colAny(row, "published") === "true",
        status: (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) as Product["status"],
        options,
        variants: [],
        createdAt: new Date().toISOString(),
      });
    }

    // Collect option values
    const product = map.get(handle)!;
    for (let n = 0; n < product.options.length; n++) {
      const optVal = col(row, `option${n + 1} value`);
      if (optVal) {
        const existing = product.options[n].values
          .split(",")
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean);
        if (!existing.includes(optVal.toLowerCase())) {
          product.options[n].values = product.options[n].values
            ? product.options[n].values + ", " + optVal
            : optVal;
        }
      }
    }

    // Add variant
    const price = parseFloat(colAny(row, "variant price", "price") || "0");
    const sku = colAny(row, "variant sku", "sku") || "";
    const weight = colAny(row, "variant grams", "weight") || "";
    const compareAt = colAny(row, "variant compare at price", "compare at price") || "";
    product.variants.push({
      id: makeId(),
      sku,
      price: isNaN(price) ? 0 : price,
      compareAtPrice: compareAt,
      barcode: colAny(row, "variant barcode", "barcode") || "",
      weight,
      weightUnit: col(row, "variant weight unit") || "kg",
    });
  }

  // Assign collected images to products
  for (const [handle, product] of map) {
    const imgs = imageMap.get(handle);
    if (imgs && imgs.size > 0) {
      product.images = Array.from(imgs).join(", ");
    }
  }

  return Array.from(map.values());
}
