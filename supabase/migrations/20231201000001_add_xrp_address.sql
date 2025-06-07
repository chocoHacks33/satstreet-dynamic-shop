
-- Add XRP address column to seller_shops table
ALTER TABLE public.seller_shops 
ADD COLUMN IF NOT EXISTS public_xrp_address TEXT;

-- Update any existing Bitcoin addresses to XRP format (placeholder)
UPDATE public.seller_shops 
SET public_xrp_address = 'rDNz3Q9gxjmVQKmysQwLofwKqmZUzjTKkX' 
WHERE public_xrp_address IS NULL;
