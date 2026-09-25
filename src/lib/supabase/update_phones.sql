-- Migration to standardize phone numbers in the database
-- Run this in your Supabase SQL Editor.
-- Note: It is highly recommended to take a backup of your data before running this script.

-- 1. Standardize 'phone' in dynamic_registrations
UPDATE public.dynamic_registrations
SET phone = 
  CASE
    -- If 10 digits exactly, prepend +91
    WHEN length(regexp_replace(phone, '\D', '', 'g')) = 10 
      THEN '+91' || regexp_replace(phone, '\D', '', 'g')
    
    -- If 11 digits and starts with 0, replace 0 with +91
    WHEN length(regexp_replace(phone, '\D', '', 'g')) = 11 AND regexp_replace(phone, '\D', '', 'g') LIKE '0%'
      THEN '+91' || substring(regexp_replace(phone, '\D', '', 'g') from 2)
      
    -- If starts with + already, keep + and remove spaces/dashes
    WHEN phone LIKE '+%' 
      THEN '+' || regexp_replace(phone, '\D', '', 'g')
      
    -- Otherwise, assume it's missing the + sign
    ELSE '+' || regexp_replace(phone, '\D', '', 'g')
  END
WHERE phone IS NOT NULL AND phone != '';

-- 2. Standardize 'whatsapp_number' in dynamic_registrations
UPDATE public.dynamic_registrations
SET whatsapp_number = 
  CASE
    WHEN length(regexp_replace(whatsapp_number, '\D', '', 'g')) = 10 
      THEN '+91' || regexp_replace(whatsapp_number, '\D', '', 'g')
      
    WHEN length(regexp_replace(whatsapp_number, '\D', '', 'g')) = 11 AND regexp_replace(whatsapp_number, '\D', '', 'g') LIKE '0%'
      THEN '+91' || substring(regexp_replace(whatsapp_number, '\D', '', 'g') from 2)
      
    WHEN whatsapp_number LIKE '+%' 
      THEN '+' || regexp_replace(whatsapp_number, '\D', '', 'g')
      
    ELSE '+' || regexp_replace(whatsapp_number, '\D', '', 'g')
  END
WHERE whatsapp_number IS NOT NULL AND whatsapp_number != '';

-- 3. Standardize 'phone' in registrations_grand_assembly
UPDATE public.registrations_grand_assembly
SET phone = 
  CASE
    WHEN length(regexp_replace(phone, '\D', '', 'g')) = 10 
      THEN '+91' || regexp_replace(phone, '\D', '', 'g')
      
    WHEN length(regexp_replace(phone, '\D', '', 'g')) = 11 AND regexp_replace(phone, '\D', '', 'g') LIKE '0%'
      THEN '+91' || substring(regexp_replace(phone, '\D', '', 'g') from 2)
      
    WHEN phone LIKE '+%' 
      THEN '+' || regexp_replace(phone, '\D', '', 'g')
      
    ELSE '+' || regexp_replace(phone, '\D', '', 'g')
  END
WHERE phone IS NOT NULL AND phone != '';
