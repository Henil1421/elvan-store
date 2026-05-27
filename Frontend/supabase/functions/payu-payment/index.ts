import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function sha512(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  return crypto.subtle.digest("SHA-512", buf).then((h) =>
    Array.from(new Uint8Array(h))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    // Note: In production, use a properly secured service role key. SUPABASE_PUBLISH_KEY is used here for simplicity.
    Deno.env.get("SUPABASE_PUBLISH_KEY")!
  );

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // ── ACTION: initiate ──────────────────────────────
  if (req.method === "POST" && action === "initiate") {
    try {
      const body = await req.json();
      const {
        orderId,
        orderNumber,
        amount,
        firstName,
        lastName,
        email,
        phone,
        productInfo,
        merchantKey,
        saltKey,
        payuMode,
        surl,
        furl,
      } = body;

      if (!merchantKey || !saltKey) {
        return new Response(
          JSON.stringify({ error: "PayU merchant key or salt not configured" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const txnId = `TXN_${orderNumber}_${Date.now()}`;

      // Create payment record
      const { data: payment, error: payErr } = await supabase
        .from("payments")
        .insert({
          order_id: orderId,
          order_number: orderNumber,
          txn_id: txnId,
          payment_method: "payu",
          amount,
          status: "initiated",
          payu_mode: payuMode || "live",
        })
        .select("id")
        .single();

      if (payErr) throw payErr;

      // Log initiation
      await supabase.from("payment_logs").insert({
        order_id: orderId,
        order_number: orderNumber,
        payment_id: payment.id,
        event: "payment_initiated",
        status: "initiated",
        method: "payu",
        amount,
      });

      // Generate PayU hash
      // hash = sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
      const amountStr = parseFloat(amount).toFixed(2);
      const hashString = `${merchantKey}|${txnId}|${amountStr}|${productInfo || "Order"}|${firstName}|${email}|||||||||||${saltKey}`;
      const hash = await sha512(hashString);

      const payuBaseUrl =
        payuMode === "test"
          ? "https://test.payu.in/_payment"
          : "https://secure.payu.in/_payment";

      const payuParams = {
        key: merchantKey,
        txnid: txnId,
        amount: amountStr,
        productinfo: productInfo || "Order",
        firstname: firstName,
        lastname: lastName || "",
        email,
        phone: phone || "",
        surl,
        furl,
        hash,
      };

      return new Response(
        JSON.stringify({
          paymentId: payment.id,
          txnId,
          payuUrl: payuBaseUrl,
          payuParams,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (e: any) {
      return new Response(
        JSON.stringify({ error: e.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // ── ACTION: callback (PayU POST response) ─────────
  if (req.method === "POST" && (action === "success" || action === "failure")) {
    try {
      const formData = await req.formData();
      const data: Record<string, string> = {};
      formData.forEach((v, k) => (data[k] = v.toString()));

      const txnId = data.txnid || "";
      const status = data.status || action;
      const mihpayid = data.mihpayid || "";
      const bankRef = data.bank_ref_num || "";
      const bankcode = data.bankcode || "";
      const errorMsg = data.error_Message || data.error || "";
      const unmappedstatus = data.unmappedstatus || "";

      // Update payment record
      const { data: paymentRow } = await supabase
        .from("payments")
        .select("id, order_id, order_number")
        .eq("txn_id", txnId)
        .single();

      if (paymentRow) {
        await supabase
          .from("payments")
          .update({
            status: status === "success" ? "success" : "failed",
            payu_mihpayid: mihpayid,
            payu_status: status,
            payu_unmappedstatus: unmappedstatus,
            payu_error: errorMsg,
            payu_bank_ref: bankRef,
            payu_bankcode: bankcode,
            response_data: data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentRow.id);

        // Update order status
        if (status === "success") {
          await supabase
            .from("orders")
            .update({ status: "confirmed", payment_method: "payu" })
            .eq("id", paymentRow.order_id);
        }

        // Log
        await supabase.from("payment_logs").insert({
          order_id: paymentRow.order_id,
          order_number: paymentRow.order_number,
          payment_id: paymentRow.id,
          event: `payu_${action}`,
          status,
          method: "payu",
          amount: parseFloat(data.amount || "0"),
          error_message: errorMsg,
          raw_data: data,
        });
      }

      // Redirect back to storefront
      const origin = data.surl?.replace(/\/payment-response.*/, "") || url.origin;
      const redirectUrl = `${origin}/payment-response?status=${action}&txnid=${txnId}&orderNumber=${paymentRow?.order_number || ""}`;

      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    } catch (e: any) {
      const origin = url.origin;
      return new Response(null, {
        status: 302,
        headers: { Location: `${origin}/payment-response?status=failure&error=${encodeURIComponent(e.message)}` },
      });
    }
  }

  return new Response(
    JSON.stringify({ error: "Invalid action" }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
