import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import StoreFront from "./pages/StoreFront";
import PaymentResponsePage from "./pages/PaymentResponsePage";
import NotFound from "./pages/NotFound";
import { getAdminConfig } from "@/lib/adminConfig";

const queryClient = new QueryClient();

// Read the custom admin path from localStorage at app startup
const adminPath = getAdminConfig().adminPath || "/admin";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StoreFront />} />
          <Route path="/track-order" element={<StoreFront />} />
          <Route path="/collection/:handle" element={<StoreFront />} />
          <Route path="/product/:id" element={<StoreFront />} />
          <Route path="/cart" element={<StoreFront />} />
          <Route path="/checkout" element={<StoreFront />} />
          <Route path="/thank-you" element={<StoreFront />} />
          <Route path="/payment-response" element={<PaymentResponsePage />} />
          <Route path="/policy/:name" element={<StoreFront />} />
          {/* Dynamic admin route — uses saved custom path */}
          <Route path={adminPath} element={<AdminPage />} />
          {/* If path was changed, redirect old /admin to new path */}
          {adminPath !== "/admin" && (
            <Route path="/admin" element={<Navigate to={adminPath} replace />} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

