-- =========================================================
-- CONTACTA — Migration 05: Vues/événements, Abonnements, Admin
-- =========================================================

-- ---------- Événements sur les annonces (vues, clics contacts, favoris) ----------
-- Table brute d'événements — permet plus tard des statistiques vendeur détaillées.
create table if not exists listing_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  event_type listing_event_type not null,
  viewer_id uuid references profiles(id) on delete set null, -- null si visiteur anonyme
  session_id text not null, -- id de session anonyme côté client (cookie), pour dédupliquer
  created_at timestamptz not null default now()
);

create index if not exists idx_listing_events_listing on listing_events (listing_id, event_type, created_at desc);
create index if not exists idx_listing_events_session on listing_events (listing_id, session_id, event_type);

-- Alias demandé dans le brief : "listing_views" est une vue au-dessus de listing_events
-- filtrée sur les événements de type 'view' (garde une seule table source de vérité).
create or replace view listing_views as
  select id, listing_id, viewer_id, session_id, created_at
  from listing_events
  where event_type = 'view';

-- Incrémente les compteurs dénormalisés sur listings à chaque nouvel événement,
-- en évitant les incréments abusifs (même session + même annonce + même type dans les 30 dernières minutes).
create or replace function record_listing_event(
  p_listing_id uuid,
  p_event_type listing_event_type,
  p_viewer_id uuid,
  p_session_id text
)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  recent_exists boolean;
begin
  select exists (
    select 1 from listing_events
    where listing_id = p_listing_id
      and event_type = p_event_type
      and session_id = p_session_id
      and created_at > now() - interval '30 minutes'
  ) into recent_exists;

  if recent_exists then
    return false;
  end if;

  insert into listing_events (listing_id, event_type, viewer_id, session_id)
  values (p_listing_id, p_event_type, p_viewer_id, p_session_id);

  if p_event_type = 'view' then
    update listings set view_count = view_count + 1 where id = p_listing_id;
  elsif p_event_type = 'call_click' then
    update listings set call_click_count = call_click_count + 1 where id = p_listing_id;
  elsif p_event_type = 'whatsapp_click' then
    update listings set whatsapp_click_count = whatsapp_click_count + 1 where id = p_listing_id;
  elsif p_event_type = 'email_click' then
    update listings set email_click_count = email_click_count + 1 where id = p_listing_id;
  end if;

  return true;
end;
$$;

-- ---------- Abonnements CONTACTA+ (architecture prête, Stripe non branché en V1) ----------
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  status subscription_status not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  price_cents integer not null default 599, -- 5,99 €
  currency text not null default 'eur',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id)
);

create index if not exists idx_subscriptions_status on subscriptions (status);
create index if not exists idx_subscriptions_stripe_customer on subscriptions (stripe_customer_id);

drop trigger if exists trg_subscriptions_updated_at on subscriptions;
create trigger trg_subscriptions_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();

-- ---------- Actions d'administration (audit trail) ----------
create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id) on delete set null,
  action_type text not null, -- ex: 'hide_listing', 'ban_user', 'resolve_report'
  target_type text not null, -- ex: 'listing', 'user', 'report'
  target_id uuid not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_actions_admin on admin_actions (admin_id, created_at desc);
create index if not exists idx_admin_actions_target on admin_actions (target_type, target_id);
