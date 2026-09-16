-- =========================================================
-- CONTACTA — Migration 00: Extensions & types de base
-- =========================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm"; -- recherche texte floue (ILIKE performant)
create extension if not exists "unaccent"; -- recherche insensible aux accents

-- Rôles applicatifs
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('user', 'admin');
  end if;
end $$;

-- Statuts d'annonce
do $$
begin
  if not exists (select 1 from pg_type where typname = 'listing_status') then
    create type listing_status as enum ('draft', 'pending', 'active', 'sold', 'hidden', 'deleted');
  end if;
end $$;

-- État du produit
do $$
begin
  if not exists (select 1 from pg_type where typname = 'listing_condition') then
    create type listing_condition as enum ('new', 'like_new', 'good', 'fair', 'for_parts');
  end if;
end $$;

-- Raisons de signalement
do $$
begin
  if not exists (select 1 from pg_type where typname = 'report_reason') then
    create type report_reason as enum (
      'scam', 'fake_product', 'prohibited_content', 'wrong_category',
      'spam', 'already_sold', 'other'
    );
  end if;
end $$;

-- Statut de signalement
do $$
begin
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type report_status as enum ('pending', 'reviewing', 'resolved', 'dismissed');
  end if;
end $$;

-- Types d'événements sur une annonce (analytics légers)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'listing_event_type') then
    create type listing_event_type as enum ('view', 'call_click', 'whatsapp_click', 'email_click', 'favorite');
  end if;
end $$;

-- Statut d'abonnement CONTACTA+
do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type subscription_status as enum ('inactive', 'active', 'past_due', 'canceled');
  end if;
end $$;

-- Fonction générique : met à jour updated_at automatiquement
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
