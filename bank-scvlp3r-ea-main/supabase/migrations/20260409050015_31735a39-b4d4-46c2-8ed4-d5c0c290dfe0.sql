
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Service role can manage license keys" ON public.license_keys;
DROP POLICY IF EXISTS "Service role can manage admin settings" ON public.admin_settings;
