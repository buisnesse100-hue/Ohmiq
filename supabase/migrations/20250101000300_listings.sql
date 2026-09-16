-- =========================================================
-- CONTACTA — Migration 03: Annonces (listings)
-- =========================================================

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,

  slug text not null unique, -- ex: canape-3-places-cuir-abc123
  title text not null,
  description text not null,
  price numeric(12,2) not null check (price >= 0),
  is_negotiable boolean not null default false,

  category_id uuid not null references categories(id) on delete restrict,
  subcategory_id uuid references subcategories(id) on delete set null,

  city text not null,
  postal_code text,
  -- coordonnées optionnelles, préparées pour une recherche géographique future
  latitude double precision,
  longitude double precision,

  condition listing_condition not null default 'good',
  delivery_available boolean not null default false,

  -- Coordonnées de contact : stockées, mais l'affichage public dépend des flags *_public
  contact_phone text,
  contact_phone_public boolean not null default false,
  contact_whatsapp text,
  contact_whatsapp_public boolean not null default false,
  contact_email text,
  contact_email_public boolean not null default false,

  status listing_status not null default 'draft',

  -- Préparation CONTACTA+ (mise en avant) — non facturé en V1
  is_promoted boolean not null default false,
  promotion_started_at timestamptz,
  promotion_expires_at timestamptz,

  view_count integer not null default 0,
  call_click_count integer not null default 0,
  whatsapp_click_count integer not null default 0,
  email_click_count integer not null default 0,
  favorite_count integer not null default 0,

  published_at timestamptz,
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint at_least_one_contact_method check (
    contact_phone is not null or contact_whatsapp is not null or contact_email is not null
  )
);

create index if not exists idx_listings_seller on listings (seller_id);
create index if not exists idx_listings_category on listings (category_id);
create index if not exists idx_listings_subcategory on listings (subcategory_id);
create index if not exists idx_listings_city on listings (city);
create index if not exists idx_listings_price on listings (price);
create index if not exists idx_listings_status on listings (status);
create index if not exists idx_listings_created_at on listings (created_at desc);
create index if not exists idx_listings_published_at on listings (published_at desc);
create index if not exists idx_listings_promoted on listings (is_promoted, promotion_expires_at);
create index if not exists idx_listings_status_city_category on listings (status, city, category_id);

-- Recherche texte performante (titre + description) via trigram
create index if not exists idx_listings_title_trgm on listings using gin (title gin_trgm_ops);
create index if not exists idx_listings_description_trgm on listings using gin (description gin_trgm_ops);

drop trigger if exists trg_listings_updated_at on listings;
create trigger trg_listings_updated_at
  before update on listings
  for each row execute function set_updated_at();

-- Génère un slug unique à partir du titre + un suffixe court aléatoire
create or replace function generate_listing_slug(p_title text)
returns text
language plpgsql
as $$
declare
  base text;
  candidate text;
begin
  base := lower(unaccent(p_title));
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := regexp_replace(base, '(^-+|-+$)', '', 'g');
  base := substr(base, 1, 60);
  if base = '' or base is null then
    base := 'annonce';
  end if;
  candidate := base || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  return candidate;
end;
$$;

create or replace function set_listing_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := generate_listing_slug(new.title);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_listings_set_slug on listings;
create trigger trg_listings_set_slug
  before insert on listings
  for each row execute function set_listing_slug();

-- Maintient listing_count sur profiles et published_at / sold_at sur listings
create or replace function handle_listing_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'active' then
      update profiles set listing_count = listing_count + 1 where id = new.seller_id;
      new.published_at := coalesce(new.published_at, now());
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status <> 'active' and new.status = 'active' then
      update profiles set listing_count = listing_count + 1 where id = new.seller_id;
      new.published_at := coalesce(new.published_at, now());
    elsif old.status = 'active' and new.status <> 'active' then
      update profiles set listing_count = greatest(listing_count - 1, 0) where id = new.seller_id;
    end if;

    if old.status <> 'sold' and new.status = 'sold' then
      new.sold_at := now();
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_listings_status_change on listings;
create trigger trg_listings_status_change
  before insert or update of status on listings
  for each row execute function handle_listing_status_change();
