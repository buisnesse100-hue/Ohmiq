-- 1) Droits d'accès de base (RLS décide ensuite ligne par ligne).
-- Nécessaire : Supabase n'accorde plus automatiquement ces droits aux nouvelles tables.
grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant insert on public.reports to anon;

alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;

revoke all on public.listing_events from anon;
revoke all on public.listing_views from anon, authenticated;
alter view public.listing_views set (security_invoker = true);

-- 2) Colonnes sensibles non lisibles via l'API (même avec la clé publique).
-- ⚠️ Si tu ajoutes une colonne à listings/profiles, accorde-lui aussi le SELECT :
--    grant select (ma_colonne) on public.listings to anon, authenticated;
do $$
declare cols text;
begin
  revoke select on public.listings from anon, authenticated;
  select string_agg(quote_ident(column_name), ',') into cols
  from information_schema.columns
  where table_schema='public' and table_name='listings'
    and column_name not in ('contact_phone','contact_whatsapp','contact_email','serial_number');
  execute format('grant select (%s) on public.listings to anon, authenticated', cols);

  revoke select on public.profiles from anon, authenticated;
  select string_agg(quote_ident(column_name), ',') into cols
  from information_schema.columns
  where table_schema='public' and table_name='profiles'
    and column_name not in ('phone','ban_reason','banned_until');
  execute format('grant select (%s) on public.profiles to anon, authenticated', cols);
end $$;

-- 3) Accès contrôlé : seules les infos autorisées sont renvoyées
create or replace function public.get_listing_contacts(p_listing_id uuid)
returns table (contact_phone text, contact_whatsapp text, contact_email text, serial_number text)
language sql stable security definer set search_path = public
as $$
  select
    case when l.seller_id = auth.uid() or public.is_admin() or l.contact_phone_public then l.contact_phone end,
    case when l.seller_id = auth.uid() or public.is_admin() or l.contact_whatsapp_public then l.contact_whatsapp end,
    case when l.seller_id = auth.uid() or public.is_admin() or l.contact_email_public then l.contact_email end,
    case when l.seller_id = auth.uid() or public.is_admin() then l.serial_number end
  from public.listings l
  where l.id = p_listing_id
    and (l.status in ('active','sold') or l.seller_id = auth.uid() or public.is_admin());
$$;
revoke all on function public.get_listing_contacts(uuid) from public;
grant execute on function public.get_listing_contacts(uuid) to anon, authenticated;

create or replace function public.get_my_phone()
returns text
language sql stable security definer set search_path = public
as $$ select phone from public.profiles where id = auth.uid(); $$;
revoke all on function public.get_my_phone() from public;
grant execute on function public.get_my_phone() to authenticated;
