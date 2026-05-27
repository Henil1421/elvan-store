import { useState } from "react";
import AdminSidebar, { SectionId } from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import AdminLoginPage from "./AdminLoginPage";
import LiveViewPage from "./LiveViewPage";
import HomePage from "./HomePage";
import CollectionsPage from "./CollectionsPage";
import FeaturedCollectionsPage from "./FeaturedCollectionsPage";
import ProductsPage from "./ProductsPage";
import ProductRecommendationPage from "./ProductRecommendationPage";
import OrdersPage from "./OrdersPage";
import OrderTrackingPage from "./OrderTrackingPage";
import DiscountsPage from "./DiscountsPage";
import CartOfferBannerPage from "./CartOfferBannerPage";
import CheckoutSettingsPage from "./CheckoutSettingsPage";
import PaymentFailurePage from "./PaymentFailurePage";
import SettingsPage from "./SettingsPage";
import FooterGeneralPage from "./FooterGeneralPage";
import FooterColumnsPage from "./FooterColumnsPage";
import FooterSocialPage from "./FooterSocialPage";
import FooterPaymentPage from "./FooterPaymentPage";
import FooterPoliciesPage from "./FooterPoliciesPage";
import FooterAdvancedPage from "./FooterAdvancedPage";
import CardBorderPage from "./CardBorderPage";
import ThrobberPage from "./ThrobberPage";
import ThankYouPage from "./ThankYouPage";
import DescriptionSettingsPage from "./DescriptionSettingsPage";
import RotatingFeaturesPage from "./RotatingFeaturesPage";
import ScrollingAnnouncementPage from "./ScrollingAnnouncementPage";
import CountdownTimerPage from "./CountdownTimerPage";
import LiveViewerCountPage from "./LiveViewerCountPage";
import TrustBadgesPage from "./TrustBadgesPage";
import GoogleReviewsPage from "./GoogleReviewsPage";
import PixelsPage from "./PixelsPage";
import PerformanceModePage from "./PerformanceModePage";
import DomainPage from "./DomainPage";
import AdminCredentialsPage from "./AdminCredentialsPage";
import { isAdminLoggedIn, setAdminSession } from "@/lib/adminConfig";

function SectionContent({ active }: { active: SectionId }) {
  switch (active) {
    case "live-view":               return <LiveViewPage />;
    case "homepage":                return <HomePage />;
    case "collections":             return <CollectionsPage />;
    case "collections-featured":    return <FeaturedCollectionsPage />;
    case "products":                return <ProductsPage />;
    case "products-recommendation": return <ProductRecommendationPage />;
    case "orders":                  return <OrdersPage />;
    case "orders-tracking":         return <OrderTrackingPage />;
    case "widgets-countdown":       return <CountdownTimerPage />;
    case "widgets-live-viewer":     return <LiveViewerCountPage />;
    case "widgets-announcement":    return <ScrollingAnnouncementPage />;
    case "widgets-trust-badges":    return <TrustBadgesPage />;
    case "widgets-google-reviews":  return <GoogleReviewsPage />;
    case "widgets-rotating-features": return <RotatingFeaturesPage />;
    case "discounts":               return <DiscountsPage />;
    case "checkout-cart-offer":     return <CartOfferBannerPage />;
    case "checkout-settings":       return <CheckoutSettingsPage />;
    case "checkout-payment-failure": return <PaymentFailurePage />;
    case "footer-general":          return <FooterGeneralPage />;
    case "footer-columns":          return <FooterColumnsPage />;
    case "footer-social":           return <FooterSocialPage />;
    case "footer-payment":          return <FooterPaymentPage />;
    case "footer-policies":         return <FooterPoliciesPage />;
    case "footer-advanced":         return <FooterAdvancedPage />;
    case "design-card-border":      return <CardBorderPage />;
    case "design-throbber":         return <ThrobberPage />;
    case "thank-you":               return <ThankYouPage />;
    case "description-settings":    return <DescriptionSettingsPage />;
    case "settings":                return <SettingsPage />;
    case "settings-pixels":         return <PixelsPage />;
    case "settings-performance":    return <PerformanceModePage />;
    case "settings-domain":         return <DomainPage />;
    case "settings-credentials":    return <AdminCredentialsPage />;
    default:                        return <LiveViewPage />;
  }
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());
  const [active, setActive] = useState<SectionId>("live-view");
  const [collapsed, setCollapsed] = useState(false);

  if (!loggedIn) {
    return <AdminLoginPage onLogin={() => setLoggedIn(true)} />;
  }

  const handleLogout = () => {
    setAdminSession(false);
    setLoggedIn(false);
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <AdminSidebar
        active={active}
        onSelect={setActive}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onLogout={handleLogout}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader active={active} />
        <main className="flex-1 p-6 overflow-y-auto">
          <SectionContent active={active} />
        </main>
      </div>
    </div>
  );
}
