-- =========================================================
-- CONTACTA — Migration 04: Photos, Favoris, Signalements
-- =========================================================

-- ---------- Photos d'annonces ----------
create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  storage_path text not null, -- chemin dans le bucket 'listing-images'
  display_order integer not null default 0,
  is_primary boolean not null default false,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_listing_images_listing on listing_images (listing_id, display_order);

-- Garantit qu'une seule image est "principale" par annonce
create or replace function enforce_single_primary_image()
returns trigger
language plpgsql
as $$
begin
  if new.is_primary then
    update listing_images
      set is_primary = false
      where listing_id = new.listing_id and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_listing_images_single_primary on listing_images;
create trigger trg_listing_images_single_primary
  after insert or update of is_primary on listing_images
  for each row when (new.is_primary) execute function enforce_single_primary_image();

-- ---------- Favoris ----------
create table if not exists favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (user_id, listing_id)
);

create index if not exists idx_favorites_user on favorites (user_id, created_at desc);
create index if not exists idx_favorites_listing on favorites (listing_id);

create or replace function handle_favorite_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update listings set favorite_count = favorite_count + 1 where id = new.listing_id;
    return new;
  elsif tg_op = 'DELETE' then
    update listings set favorite_count = greatest(favorite_count - 1, 0) where id = old.listing_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_favorites_change on favorites;
create trigger trg_favorites_change
  after insert or delete on favorites
  for each row execute function handle_favorite_change();

-- ---------- Signalements ----------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  reporter_id uuid references profiles(id) on delete set null, -- null si signalement anonyme
  reason report_reason not null,
  message text,
  status report_status not null default 'pending',
  handled_by uuid references profiles(id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default now(),

  -- anti-spam : un utilisateur connecté ne peut signaler qu'une seule fois la même annonce
  unique (listing_id, reporter_id)
);

create index if not exists idx_reports_listing on reports (listing_id);
create index if not exists idx_reports_status on reports (status, created_at desc);
