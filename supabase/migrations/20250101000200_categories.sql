-- =========================================================
-- CONTACTA — Migration 02: Catégories & sous-catégories
-- =========================================================

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text, -- nom de l'icône lucide-react
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_categories_slug on categories (slug);
create index if not exists idx_categories_active_order on categories (is_active, display_order);

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  slug text not null,
  name text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (category_id, slug)
);

create index if not exists idx_subcategories_category on subcategories (category_id);

drop trigger if exists trg_subcategories_updated_at on subcategories;
create trigger trg_subcategories_updated_at
  before update on subcategories
  for each row execute function set_updated_at();
