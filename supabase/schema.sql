-- Database Schema: Shattered Saga Energy Economy & Subscriptions

-- 1. Create Custom Types for Subscriptions
create type subscription_tier_type as enum ('free', 'adventurer', 'legend');
create type subscription_status_type as enum ('active', 'trialing', 'canceled', 'past_due', 'none');

-- 2. Create User Profiles Table
-- Linked directly to Supabase auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  energy_balance integer default 100 not null check (energy_balance >= 0),
  subscription_tier subscription_tier_type default 'free' not null,
  subscription_status subscription_status_type default 'none' not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- RLS Policy: Users can read their own profile, but cannot update or delete it directly
create policy "Users can read own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

-- 3. Create Transactions Log Table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount_usd numeric(10, 2) not null,
  turns_credited integer not null,
  processor text not null, -- 'stripe', 'apple', 'google'
  processor_order_id text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Transactions
alter table public.transactions enable row level security;

-- RLS Policy: Users can only view their own transactions
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

-- 4. Atomic Database Functions

-- Function: Increment User Energy
-- Runs securely on the server (definer context) to bypass client RLS rules.
create or replace function public.increment_user_energy(target_user_id uuid, amount integer)
returns void as $$
begin
  update public.profiles
  set energy_balance = energy_balance + amount,
      updated_at = timezone('utc'::text, now())
  where id = target_user_id;
end;
$$ language plpgsql security definer;

-- Function: Decrement User Energy
-- Runs securely on the server, verifies the user has enough energy, and decrements atomically by 1.
create or replace function public.decrement_user_energy(target_user_id uuid, amount integer)
returns void as $$
begin
  update public.profiles
  set energy_balance = energy_balance - amount,
      updated_at = timezone('utc'::text, now())
  where id = target_user_id and energy_balance >= amount;
end;
$$ language plpgsql security definer;

-- 5. Trigger profile creation on Auth User signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, energy_balance)
  values (new.id, new.email, 100); -- Start with 100 welcome energy
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
