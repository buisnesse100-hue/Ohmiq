-- =========================================================
-- CONTACTA — Migration 06: Row Level Security (RLS)
-- =========================================================
-- Principe : le frontend n'est JAMAIS la source de vérité des permissions.
-- Tout est vérifié côté base de données via ces politiques.

-- Fonction utilitaire : l'utilisateur courant est-il admin ?
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin' and coalesce(is_banned, false) = false
  );
$$;

-- Fonction utilitaire : l'utilisateur courant est-il banni ?
create or replace function is_banned()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and is_banned = true
      and (banned_until is null or banned_until > now())
  );
$$;

-- =========================
-- PROFILES
-- =========================
alter table profiles enable row level security;

create policy "profiles_select_public"
  on profiles for select
  using (true); -- profils publics (username, ville, date d'inscription, etc.) lisibles par tous

create policy "profiles_insert_self"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_self"
  on profiles for update
  using (auth.uid() = id and not is_banned())
  with check (
    auth.uid() = id
    -- un utilisateur ne peut jamais changer son propre rôle ou son statut de ban
    and role = (select role from profiles p where p.id = auth.uid())
    and is_banned = (select is_banned from profiles p where p.id = auth.uid())
  );

create policy "profiles_admin_all"
  on profiles for all
  using (is_admin())
  with check (is_admin());

-- =========================
-- CATEGORIES / SUBCATEGORIES
-- =========================
alter table categories enable row level security;
alter table subcategories enable row level security;

create policy "categories_select_all"
  on categories for select using (true);

create policy "categories_admin_write"
  on categories for insert with check (is_admin());
create policy "categories_admin_update"
  on categories for update using (is_admin()) with check (is_admin());
create policy "categories_admin_delete"
  on categories for delete using (is_admin());

create policy "subcategories_select_all"
  on subcategories for select using (true);

create policy "subcategories_admin_write"
  on subcategories for insert with check (is_admin());
create policy "subcategories_admin_update"
  on subcategories for update using (is_admin()) with check (is_admin());
create policy "subcategories_admin_delete"
  on subcategories for delete using (is_admin());

-- =========================
-- LISTINGS
-- =========================
alter table listings enable row level security;

-- Lecture publique : uniquement les annonces actives ou vendues (visibles publiquement)
create policy "listings_select_public"
  on listings for select
  using (status in ('active', 'sold'));

-- Le vendeur voit toujours ses propres annonces, quel que soit le statut
create policy "listings_select_own"
  on listings for select
  using (auth.uid() = seller_id);

-- Les admins voient tout
create policy "listings_select_admin"
  on listings for select
  using (is_admin());

-- Création : uniquement pour soi-même, et pas si banni
create policy "listings_insert_own"
  on listings for insert
  with check (auth.uid() = seller_id and not is_banned());

-- Mise à jour : le vendeur peut modifier sa propre annonce (sauf champs sensibles gérés par trigger/serveur)
create policy "listings_update_own"
  on listings for update
  using (auth.uid() = seller_id and not is_banned())
  with check (auth.uid() = seller_id);

create policy "listings_update_admin"
  on listings for update
  using (is_admin())
  with check (is_admin());

-- Suppression : le vendeur peut supprimer sa propre annonce (soft-delete recommandé côté app)
create policy "listings_delete_own"
  on listings for delete
  using (auth.uid() = seller_id);

create policy "listings_delete_admin"
  on listings for delete
  using (is_admin());

-- =========================
-- LISTING_IMAGES
-- =========================
alter table listing_images enable row level security;

create policy "listing_images_select_public"
  on listing_images for select
  using (
    exists (
      select 1 from listings l
      where l.id = listing_images.listing_id
        and (l.status in ('active', 'sold') or l.seller_id = auth.uid())
    )
    or is_admin()
  );

create policy "listing_images_insert_own"
  on listing_images for insert
  with check (
    exists (
      select 1 from listings l
      where l.id = listing_images.listing_id and l.seller_id = auth.uid()
    )
  );

create policy "listing_images_update_own"
  on listing_images for update
  using (
    exists (
      select 1 from listings l
      where l.id = listing_images.listing_id and l.seller_id = auth.uid()
    )
  );

create policy "listing_images_delete_own"
  on listing_images for delete
  using (
    exists (
      select 1 from listings l
      where l.id = listing_images.listing_id and l.seller_id = auth.uid()
    )
    or is_admin()
  );

-- =========================
-- FAVORITES
-- =========================
alter table favorites enable row level security;

create policy "favorites_select_own"
  on favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on favorites for insert
  with check (auth.uid() = user_id and not is_banned());

create policy "favorites_delete_own"
  on favorites for delete
  using (auth.uid() = user_id);

-- =========================
-- REPORTS
-- =========================
alter table reports enable row level security;

-- Un utilisateur voit uniquement les signalements qu'il a créés ; les admins voient tout
create policy "reports_select_own_or_admin"
  on reports for select
  using (auth.uid() = reporter_id or is_admin());

create policy "reports_insert_authenticated"
  on reports for insert
  with check (
    (reporter_id is null or auth.uid() = reporter_id)
    and not is_banned()
  );

create policy "reports_update_admin"
  on reports for update
  using (is_admin())
  with check (is_admin());

create policy "reports_delete_admin"
  on reports for delete
  using (is_admin());

-- =========================
-- LISTING_EVENTS
-- =========================
alter table listing_events enable row level security;

-- Aucun accès direct en lecture/écriture : tout passe par la fonction record_listing_event() (security definer)
create policy "listing_events_select_admin"
  on listing_events for select
  using (is_admin());

create policy "listing_events_select_own_seller"
  on listing_events for select
  using (
    exists (
      select 1 from listings l
      where l.id = listing_events.listing_id and l.seller_id = auth.uid()
    )
  );

-- =========================
-- SUBSCRIPTIONS (CONTACTA+)
-- =========================
alter table subscriptions enable row level security;

create policy "subscriptions_select_own"
  on subscriptions for select
  using (auth.uid() = user_id or is_admin());

create policy "subscriptions_admin_write"
  on subscriptions for insert with check (is_admin());
create policy "subscriptions_admin_update"
  on subscriptions for update using (is_admin()) with check (is_admin());

-- =========================
-- ADMIN_ACTIONS
-- =========================
alter table admin_actions enable row level security;

create policy "admin_actions_select_admin"
  on admin_actions for select
  using (is_admin());

create policy "admin_actions_insert_admin"
  on admin_actions for insert
  with check (is_admin() and admin_id = auth.uid());
