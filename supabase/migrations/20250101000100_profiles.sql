-- =========================================================
-- CONTACTA — Migration 01: Profils utilisateurs
-- =========================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  city text,
  bio text,
  phone text,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  role app_role not null default 'user',
  is_banned boolean not null default false,
  banned_until timestamptz, -- null + is_banned = true => banni définitivement
  ban_reason text,
  listing_count integer not null default 0,
  rating numeric(3,2), -- préparé pour plus tard, non utilisé en V1
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint username_format check (username ~ '^[a-z0-9_.-]{3,30}$')
);

comment on table profiles is 'Profil public/privé d''un utilisateur, 1-1 avec auth.users';

create index if not exists idx_profiles_username on profiles (username);
create index if not exists idx_profiles_city on profiles (city);
create index if not exists idx_profiles_role on profiles (role);

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Création automatique du profil à l'inscription (auth.users -> profiles)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-z0-9_.-]', '', 'g'));
  if base_username is null or length(base_username) < 3 then
    base_username := 'user' || substr(new.id::text, 1, 8);
  end if;
  final_username := base_username;

  loop
    begin
      insert into profiles (id, username, display_name, email_verified)
      values (
        new.id,
        final_username,
        coalesce(new.raw_user_meta_data->>'display_name', base_username),
        new.email_confirmed_at is not null
      );
      exit;
    exception when unique_violation then
      suffix := suffix + 1;
      final_username := base_username || suffix::text;
    end;
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Garde l'email_verified synchronisé
create or replace function handle_user_email_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and (old.email_confirmed_at is null) then
    update profiles set email_verified = true where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_confirmed on auth.users;
create trigger trg_on_auth_user_confirmed
  after update on auth.users
  for each row execute function handle_user_email_confirmed();
