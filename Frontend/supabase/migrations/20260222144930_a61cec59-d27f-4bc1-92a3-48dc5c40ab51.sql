
-- Payments table linked to orders
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL DEFAULT '',
  txn_id TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'payu',
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payu_mihpayid TEXT DEFAULT '',
  payu_mode TEXT DEFAULT '',
  payu_status TEXT DEFAULT '',
  payu_unmappedstatus TEXT DEFAULT '',
  payu_error TEXT DEFAULT '',
  payu_bank_ref TEXT DEFAULT '',
  payu_bankcode TEXT DEFAULT '',
  response_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments are publicly readable"
ON public.payments FOR SELECT USING (true);

CREATE POLICY "Payments can be inserted by anyone"
ON public.payments FOR INSERT WITH CHECK (true);

CREATE POLICY "Payments can be updated by anyone"
ON public.payments FOR UPDATE USING (true);

-- Payment logs table
CREATE TABLE public.payment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL DEFAULT '',
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  event TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  method TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  error_message TEXT DEFAULT '',
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payment logs are publicly readable"
ON public.payment_logs FOR SELECT USING (true);

CREATE POLICY "Payment logs can be inserted by anyone"
ON public.payment_logs FOR INSERT WITH CHECK (true);
