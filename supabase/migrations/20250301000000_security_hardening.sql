-- Fonctions utilisées uniquement par des triggers : jamais appelables via /rest/v1/rpc
revoke execute on function public.handle_new_message() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_confirmed() from public, anon, authenticated;

alter function public.set_updated_at() set search_path = public;
alter function public.generate_listing_slug(text) set search_path = public;
alter function public.set_listing_slug() set search_path = public;
alter function public.handle_listing_status_change() set search_path = public;
alter function public.enforce_single_primary_image() set search_path = public;
alter function public.handle_favorite_change() set search_path = public;
alter function public.handle_new_review() set search_path = public;
