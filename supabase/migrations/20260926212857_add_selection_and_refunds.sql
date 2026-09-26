-- Drop selection_status if it was added
ALTER TABLE public.dynamic_registrations 
DROP COLUMN IF EXISTS selection_status;

-- Add refund tracking columns to dynamic_registrations table
ALTER TABLE public.dynamic_registrations 
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50) DEFAULT 'none';

ALTER TABLE public.dynamic_registrations 
ADD COLUMN IF NOT EXISTS refund_transaction_id VARCHAR(255);

ALTER TABLE public.dynamic_registrations 
ADD COLUMN IF NOT EXISTS refund_notes TEXT;
