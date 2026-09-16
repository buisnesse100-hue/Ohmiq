-- =========================================================
-- OHMIQ — Migration 08 : Marques, modèles, attributs dynamiques
-- =========================================================
-- Objectif : permettre d'ajouter une catégorie/marque/modèle/caractéristique
-- SANS toucher au code applicatif. Tout est piloté depuis ces tables.

-- ---------- Marques ----------
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_brands_slug on brands (slug);

-- Association marque <-> catégories dans lesquelles elle apparaît (une marque peut être
-- transverse : "Apple" dans Téléphones, Informatique et Objets connectés).
create table if not exists brand_categories (
  brand_id uuid not null references brands(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (brand_id, category_id)
);

-- ---------- Modèles ----------
-- Un modèle appartient à une marque et (généralement) à une sous-catégorie précise.
-- Ex: marque "Nvidia", sous-catégorie "Cartes graphiques", modèle "RTX 4070".
create table if not exists models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete set null,
  slug text not null,
  name text not null,
  release_year integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  unique (brand_id, slug)
);

create index if not exists idx_models_brand on models (brand_id);
create index if not exists idx_models_subcategory on models (subcategory_id);
create index if not exists idx_models_name_trgm on models using gin (name gin_trgm_ops);

-- ---------- Système d'attributs dynamiques ----------
-- Définit, PAR CATÉGORIE (ou sous-catégorie), quels champs techniques afficher/demander.
-- Exemple : catégorie "Composants PC" > sous-catégorie "Cartes graphiques" définit
-- les attributs "VRAM", "Connectique", "Consommation (W)"...
do $$
begin
  if not exists (select 1 from pg_type where typname = 'attribute_input_type') then
    create type attribute_input_type as enum ('text', 'number', 'select', 'boolean');
  end if;
end $$;

create table if not exists category_attributes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete cascade,
  key text not null, -- identifiant stable, ex: "vram_gb", "battery_health_percent"
  label text not null, -- libellé affiché, ex: "Mémoire vidéo (VRAM)"
  input_type attribute_input_type not null default 'text',
  unit text, -- ex: "Go", "W", "%"
  options jsonb, -- pour input_type = 'select' : ["8 Go", "12 Go", "16 Go", ...]
  is_required boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),

  -- une clé donnée est unique pour une catégorie+sous-catégorie donnée
  unique (category_id, subcategory_id, key)
);

create index if not exists idx_category_attributes_category on category_attributes (category_id, subcategory_id, display_order);

comment on table category_attributes is
  'Pilote dynamiquement les champs techniques du formulaire de dépôt d''annonce, sans code en dur.';

-- ---------- Valeurs d'attributs pour chaque annonce ----------
create table if not exists listing_attribute_values (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  attribute_id uuid not null references category_attributes(id) on delete cascade,
  value text not null, -- stocké en texte, interprété côté app selon input_type de l'attribut
  created_at timestamptz not null default now(),

  unique (listing_id, attribute_id)
);

create index if not exists idx_listing_attribute_values_listing on listing_attribute_values (listing_id);
create index if not exists idx_listing_attribute_values_attribute on listing_attribute_values (attribute_id, value);

-- ---------- Extension de la table listings : marque, modèle, infos produit occasion ----------
alter table listings add column if not exists brand_id uuid references brands(id) on delete set null;
alter table listings add column if not exists model_id uuid references models(id) on delete set null;
alter table listings add column if not exists has_invoice boolean not null default false;
alter table listings add column if not exists has_warranty boolean not null default false;
alter table listings add column if not exists warranty_until date;
alter table listings add column if not exists purchase_date date;
alter table listings add column if not exists known_defects text;
alter table listings add column if not exists serial_number text; -- jamais exposé publiquement (voir RLS/vue publique)
alter table listings add column if not exists accessories_included text;
alter table listings add column if not exists is_professional_listing boolean not null default false;

create index if not exists idx_listings_brand on listings (brand_id);
create index if not exists idx_listings_model on listings (model_id);

-- RLS sur les nouvelles tables
alter table brands enable row level security;
alter table brand_categories enable row level security;
alter table models enable row level security;
alter table category_attributes enable row level security;
alter table listing_attribute_values enable row level security;

create policy "brands_select_all" on brands for select using (true);
create policy "brands_admin_write" on brands for insert with check (is_admin());
create policy "brands_admin_update" on brands for update using (is_admin()) with check (is_admin());
create policy "brands_admin_delete" on brands for delete using (is_admin());

create policy "brand_categories_select_all" on brand_categories for select using (true);
create policy "brand_categories_admin_write" on brand_categories for insert with check (is_admin());
create policy "brand_categories_admin_delete" on brand_categories for delete using (is_admin());

create policy "models_select_all" on models for select using (true);
create policy "models_admin_write" on models for insert with check (is_admin());
create policy "models_admin_update" on models for update using (is_admin()) with check (is_admin());
create policy "models_admin_delete" on models for delete using (is_admin());

create policy "category_attributes_select_all" on category_attributes for select using (true);
create policy "category_attributes_admin_write" on category_attributes for insert with check (is_admin());
create policy "category_attributes_admin_update" on category_attributes for update using (is_admin()) with check (is_admin());
create policy "category_attributes_admin_delete" on category_attributes for delete using (is_admin());

-- Les valeurs d'attributs suivent la visibilité de l'annonce parente
create policy "listing_attribute_values_select_public"
  on listing_attribute_values for select
  using (
    exists (
      select 1 from listings l
      where l.id = listing_attribute_values.listing_id
        and (l.status in ('active', 'sold') or l.seller_id = auth.uid())
    )
    or is_admin()
  );

create policy "listing_attribute_values_insert_own"
  on listing_attribute_values for insert
  with check (
    exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

create policy "listing_attribute_values_update_own"
  on listing_attribute_values for update
  using (
    exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
  );

create policy "listing_attribute_values_delete_own"
  on listing_attribute_values for delete
  using (
    exists (select 1 from listings l where l.id = listing_id and l.seller_id = auth.uid())
    or is_admin()
  );
