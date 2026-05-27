import { Minus, Plus, Trash2, ShoppingBag, Package } from "lucide-react";
import { Product } from "@/lib/productStore";
import { getColorHex } from "@/lib/colorUtils";

export interface CartItem {
  product: Product;
  qty: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartPageProps {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
  discountAmount: number;
  discountLabel: string;
}

export default function CartPage({ items, onUpdateQty, onRemove, onContinueShopping, onCheckout, discountAmount, discountLabel }: CartPageProps) {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.variants[0]?.price ?? 0;
    return sum + price * item.qty;
  }, 0);

  const totalCompare = items.reduce((sum, item) => {
    const compare = parseFloat(item.product.variants[0]?.compareAtPrice || "0");
    const price = item.product.variants[0]?.price ?? 0;
    return sum + (compare > price ? compare : price) * item.qty;
  }, 0);

  const totalSavings = totalCompare - subtotal;

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-foreground mb-2">Your Bag is Empty</h1>
        <p className="text-sm text-muted-foreground mb-6">Looks like you haven't added anything to your bag yet.</p>
        <button
          onClick={onContinueShopping}
          className="px-8 py-3 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity uppercase tracking-wider"
        >
          Continue Shopping
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-black text-foreground mb-6">Shopping Bag ({items.reduce((s, i) => s + i.qty, 0)})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, qty, selectedSize, selectedColor }) => {
            const imgSrc = product.images.split(",")[0]?.trim() || "";
            const price = product.variants[0]?.price ?? 0;
            const compareAt = parseFloat(product.variants[0]?.compareAtPrice || "0");
            return (
              <div key={product.id} className="flex gap-4 p-4 border border-border rounded-xl bg-card">
                <div className="w-24 h-24 rounded-lg bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                  {imgSrc ? (
                    <img src={imgSrc} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">{product.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedSize && (
                      <span className="text-xs text-muted-foreground">Size: {selectedSize}</span>
                    )}
                    {selectedColor && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Color: <span className="w-3.5 h-3.5 rounded-full border border-border inline-block" style={{ background: getColorHex(selectedColor) || "#ccc" }} /> {selectedColor}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-foreground">₹{price}</span>
                    {compareAt > price && (
                      <span className="text-xs text-muted-foreground line-through">₹{compareAt}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border rounded-lg">
                      <button onClick={() => onUpdateQty(product.id, Math.max(1, qty - 1))} className="px-2.5 py-1.5 text-foreground hover:bg-secondary transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium text-foreground min-w-[32px] text-center">{qty}</span>
                      <button onClick={() => onUpdateQty(product.id, qty + 1)} className="px-2.5 py-1.5 text-foreground hover:bg-secondary transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => onRemove(product.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-foreground">₹{(price * qty).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="border border-border rounded-xl p-5 bg-card sticky top-24">
            <h2 className="text-base font-bold text-foreground mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>You Save</span>
                  <span className="font-medium">-₹{totalSavings.toFixed(2)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{discountLabel}</span>
                  <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between text-base font-bold text-foreground">
              <span>Total</span>
              <span>₹{Math.max(0, subtotal - discountAmount).toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full mt-4 py-3 text-sm font-bold bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity uppercase tracking-wider"
            >
              Checkout
            </button>
            <button
              onClick={onContinueShopping}
              className="w-full mt-2 py-2.5 text-sm font-medium text-foreground hover:underline"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
