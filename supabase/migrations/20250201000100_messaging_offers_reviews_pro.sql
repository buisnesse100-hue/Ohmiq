-- =========================================================
-- OHMIQ — Migration 09 : Messagerie, offres, avis, mode pro
-- =========================================================

-- ---------- Extension profils : mode professionnel ----------
alter table profiles add column if not exists is_professional boolean not null default false;
alter table profiles add column if not exists company_name text;
alter table profiles add column if not exists siret text;
alter table profiles add column if not exists professional_verified boolean not null default false;
alter table profiles add column if not exists sales_count integer not null default 0;
alter table profiles add column if not exists rating_average numeric(3,2);
alter table profiles add column if not exists rating_count integer not null default 0;

-- ---------- Statuts ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'offer_status') then
    create type offer_status as enum ('pending', 'accepted', 'declined', 'expired', 'withdrawn');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
  end if;
end $$;

-- ---------- Conversations ----------
-- Une conversation lie un acheteur, un vendeur et une annonce.
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  buyer_unread_count integer not null default 0,
  seller_unread_count integer not null default 0,
  created_at timestamptz not null default now(),

  unique (listing_id, buyer_id)
);

create index if not exists idx_conversations_buyer on conversations (buyer_id, last_message_at desc);
create index if not exists idx_conversations_seller on conversations (seller_id, last_message_at desc);

-- ---------- Messages ----------
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on messages (conversation_id, created_at);

create or replace function handle_new_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  conv conversations%rowtype;
begin
  select * into conv from conversations where id = new.conversation_id;

  update conversations
    set last_message_at = new.created_at,
        buyer_unread_count = case when new.sender_id = conv.seller_id then buyer_unread_count + 1 else buyer_unread_count end,
        seller_unread_count = case when new.sender_id = conv.buyer_id then seller_unread_count + 1 else seller_unread_count end
    where id = new.conversation_id;

  return new;
end;
$$;

drop trigger if exists trg_new_message on messages;
create trigger trg_new_message
  after insert on messages
  for each row execute function handle_new_message();

-- ---------- Offres ----------
-- Une offre est toujours rattachée à une conversation (elle nait d'un échange).
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  status offer_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '48 hours'),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_offers_conversation on offers (conversation_id, created_at desc);
create index if not exists idx_offers_listing on offers (listing_id, status);

-- ---------- Commandes (trace d'une vente conclue, que le paiement soit géré ou non par la plateforme) ----------
-- V1 : la transaction financière reste hors plateforme (comme CONTACTA à l'origine),
-- mais on trace la conclusion de la vente pour les stats vendeur et les avis.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete restrict,
  buyer_id uuid not null references profiles(id) on delete restrict,
  seller_id uuid not null references profiles(id) on delete restrict,
  amount numeric(12,2) not null,
  status order_status not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_buyer on orders (buyer_id, created_at desc);
create index if not exists idx_orders_seller on orders (seller_id, created_at desc);

-- ---------- Avis ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  reviewee_id uuid not null references profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),

  unique (order_id, reviewer_id)
);

create index if not exists idx_reviews_reviewee on reviews (reviewee_id, created_at desc);

create or replace function handle_new_review()
returns trigger
language plpgsql
as $$
begin
  update profiles p
    set rating_count = rating_count + 1,
        rating_average = (
          select round(avg(rating)::numeric, 2) from reviews where reviewee_id = new.reviewee_id
        )
    where p.id = new.reviewee_id;
  return new;
end;
$$;

drop trigger if exists trg_new_review on reviews;
create trigger trg_new_review
  after insert on reviews
  for each row execute function handle_new_review();

-- ---------- Alertes de recherche (acheteurs) ----------
create table if not exists search_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  query text,
  category_id uuid references categories(id) on delete cascade,
  brand_id uuid references brands(id) on delete cascade,
  price_max numeric(12,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_search_alerts_user on search_alerts (user_id);

-- ---------- Estimation de prix ("Bonne affaire") ----------
-- Architecture prête pour connecter une vraie source de données de marché plus tard
-- (ex: API de comparateur de prix). En attendant, ce cache reste vide et le badge
-- "Bonne affaire" ne s'affiche que si une estimation existe réellement.
create table if not exists price_estimates (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references models(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  condition listing_condition not null,
  estimated_price numeric(12,2) not null,
  sample_size integer not null default 0,
  source text not null default 'manual', -- 'manual' | 'external_api' (préparé pour plus tard)
  computed_at timestamptz not null default now(),

  unique (model_id, condition)
);

create index if not exists idx_price_estimates_model on price_estimates (model_id, condition);

-- ---------- RLS ----------
alter table conversations enable row level security;
alter table messages enable row level security;
alter table offers enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table search_alerts enable row level security;
alter table price_estimates enable row level security;

create policy "conversations_select_participant"
  on conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id or is_admin());

create policy "conversations_insert_buyer"
  on conversations for insert
  with check (auth.uid() = buyer_id and not is_banned());

create policy "conversations_update_participant"
  on conversations for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "messages_select_participant"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
    or is_admin()
  );

create policy "messages_insert_participant"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and not is_banned()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "offers_select_participant"
  on offers for select
  using (
    exists (
      select 1 from conversations c
      where c.id = offers.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
    or is_admin()
  );

create policy "offers_insert_buyer"
  on offers for insert
  with check (auth.uid() = buyer_id and not is_banned());

create policy "offers_update_participant"
  on offers for update
  using (
    exists (
      select 1 from conversations c
      where c.id = offers.conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "orders_select_participant"
  on orders for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id or is_admin());

create policy "orders_admin_write" on orders for insert with check (is_admin() or auth.uid() = seller_id);
create policy "orders_update_participant" on orders for update using (auth.uid() = seller_id or is_admin());

create policy "reviews_select_all" on reviews for select using (true);

create policy "reviews_insert_own"
  on reviews for insert
  with check (
    auth.uid() = reviewer_id
    and not is_banned()
    and exists (
      select 1 from orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
        and o.status = 'completed'
    )
  );

create policy "search_alerts_select_own" on search_alerts for select using (auth.uid() = user_id);
create policy "search_alerts_insert_own" on search_alerts for insert with check (auth.uid() = user_id and not is_banned());
create policy "search_alerts_update_own" on search_alerts for update using (auth.uid() = user_id);
create policy "search_alerts_delete_own" on search_alerts for delete using (auth.uid() = user_id);

create policy "price_estimates_select_all" on price_estimates for select using (true);
create policy "price_estimates_admin_write" on price_estimates for insert with check (is_admin());
create policy "price_estimates_admin_update" on price_estimates for update using (is_admin()) with check (is_admin());
