import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentResponsePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const status = params.get("status");
  const orderNumber = params.get("orderNumber") || "";
  const [countdown, setCountdown] = useState(5);

  const isSuccess = status === "success";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (isSuccess) {
            navigate("/thank-you", { state: { orderNumber } });
          } else {
            navigate("/checkout");
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSuccess, navigate, orderNumber]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {isSuccess ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground">Order <span className="font-semibold">{orderNumber}</span> confirmed.</p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
            <p className="text-muted-foreground">Something went wrong. Please try again.</p>
          </>
        )}
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Redirecting in {countdown}s...
        </p>
        <button
          onClick={() => isSuccess ? navigate("/") : navigate("/checkout")}
          className="px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          {isSuccess ? "Go to Home" : "Try Again"}
        </button>
      </div>
    </main>
  );
}
