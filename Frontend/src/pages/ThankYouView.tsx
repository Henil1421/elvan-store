import { CheckCircle, Package, MapPin } from "lucide-react";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

interface ThankYouViewProps {
  orderNumber: string;
  customerName: string;
  items: { title: string; image?: string; qty: number; price: number; selectedSize?: string; selectedColor?: string }[];
  total: number;
  shippingAddress?: ShippingAddress;
  onContinueShopping: () => void;
  onTrackOrder: () => void;
}

export default function ThankYouView({ orderNumber, customerName, items, total, shippingAddress, onContinueShopping, onTrackOrder }: ThankYouViewProps) {
  const cfg = (() => {
    try {
      return {
        thankYouMessage: "Thank you, {customer_name}!",
        confirmationTitle: "Your order is confirmed",
        confirmationSubtitle: "You'll receive a confirmation email with your order number shortly.",
        continueButtonText: "Continue shopping",
        ...JSON.parse(localStorage.getItem("thankyou-page-config") || "{}"),
      };
    } catch {
      return {
        thankYouMessage: "Thank you, {customer_name}!",
        confirmationTitle: "Your order is confirmed",
        confirmationSubtitle: "You'll receive a confirmation email with your order number shortly.",
        continueButtonText: "Continue shopping",
      };
    }
  })();

  const thankYouMsg = cfg.thankYouMessage.replace("{customer_name}", customerName);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-secondary/20 py-12">
      <div className="max-w-lg w-full mx-auto px-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-foreground mb-1">{thankYouMsg}</h1>
        <p className="text-base font-semibold text-foreground mb-1">{cfg.confirmationTitle}</p>
        <p className="text-sm text-muted-foreground mb-4">{cfg.confirmationSubtitle}</p>

        <div className="bg-card border border-border rounded-xl p-5 text-left mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="text-base font-bold text-primary">{orderNumber}</p>
            </div>
            <p className="text-sm font-bold text-foreground">₹{total.toFixed(2)}</p>
          </div>

          <div className="space-y-3 border-t border-border pt-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
                  <div className="text-xs text-muted-foreground">
                    {item.selectedSize && <span>Size: {item.selectedSize} </span>}
                    {item.selectedColor && <span>· Color: {item.selectedColor} </span>}
                    <span>· Qty: {item.qty}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-foreground shrink-0">₹{(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address + Map Block */}
        {cfg.showMapBlock && shippingAddress && (
          <div className="bg-card border border-border rounded-xl p-5 text-left mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Shipping Address</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {shippingAddress.firstName} {shippingAddress.lastName}<br />
              {shippingAddress.address}
              {shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ""}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pinCode}<br />
              {shippingAddress.country}
            </p>
            <div className="w-full h-48 rounded-lg overflow-hidden border border-border">
              <iframe
                title="Shipping location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pinCode}, ${shippingAddress.country}`
                )}&output=embed`}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onTrackOrder}
            className="w-full py-3 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            Track Your Order
          </button>
          <button
            onClick={onContinueShopping}
            className="w-full py-3 text-sm font-medium border border-border rounded-xl text-foreground hover:bg-secondary transition-colors"
          >
            {cfg.continueButtonText}
          </button>
        </div>
      </div>
    </main>
  );
}
