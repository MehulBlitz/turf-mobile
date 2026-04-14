-- SQL Schema for Turf Booking App (Updated)
-- Run this in your Supabase SQL Editor

-- Create profiles table first to handle roles
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  avatar_url text,
  phone text,
  preferred_city text,
  favorite_turfs text[] default '{}',
  role text check (role in ('customer', 'owner', 'admin')) default 'customer',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create turfs table with owner relationship
create table if not exists turfs (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  location text not null,
  price_per_hour numeric not null,
  image_url text, -- Main display image
  media_urls text[], -- Additional images/videos/gifs
  rating numeric default 0,
  description text,
  amenities text[],
  games text[], -- Added games column
  time_slots jsonb default '[]'::jsonb, -- Added time_slots column
  blocked_slots jsonb default '[]'::jsonb, -- Added ability for owners to hide slots on specific dates with reason
  type text check (type in ('Football', 'Cricket', 'Tennis', 'Badminton', 'Multi-sport')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bookings table
create table if not exists bookings (
  id uuid default gen_random_uuid() primary key,
  turf_id uuid references turfs(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade, -- Changed to reference profiles(id) for easier joining
  qr_token text unique not null default gen_random_uuid(),
  booking_status text check (booking_status in ('booked', 'time is gone', 'cancelled')) default 'booked',
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  total_price numeric not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'rejected')) default 'pending', -- Added 'rejected'
  cancellation_reason text,
  cancellation_notes text,
  cancelled_by text check (cancelled_by in ('customer', 'owner')),
  refund_amount numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cancellation log table for audit and ownership tracking
create table if not exists booking_cancellations (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references bookings(id) on delete cascade,
  cancelled_by text check (cancelled_by in ('customer', 'owner')) not null,
  actor_id uuid references profiles(id),
  cancellation_reason text,
  cancellation_notes text,
  refund_amount numeric default 0,
  cancelled_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications table for customers and owners
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  recipient_id uuid references profiles(id) on delete cascade,
  sender_id uuid references profiles(id),
  booking_id uuid references bookings(id) on delete set null,
  title text not null,
  message text not null,
  type text check (type in ('booking', 'cancel', 'reminder', 'info', 'success', 'warning')) default 'info',
  read boolean default false,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turf feedback and comments tables
create table if not exists turf_feedback (
  id uuid default gen_random_uuid() primary key,
  turf_id uuid references turfs(id) on delete cascade,
  author_id uuid references profiles(id),
  author_name text,
  avatar_url text,
  rating int check (rating >= 1 and rating <= 5),
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists turf_comments (
  id uuid default gen_random_uuid() primary key,
  turf_id uuid references turfs(id) on delete cascade,
  author_id uuid references profiles(id),
  author_name text,
  avatar_url text,
  text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table turfs enable row level security;
alter table bookings enable row level security;
alter table booking_cancellations enable row level security;
alter table notifications enable row level security;
alter table turf_feedback enable row level security;
alter table turf_comments enable row level security;

-- Policies for profiles
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Policies for turfs
drop policy if exists "Turfs are viewable by everyone" on turfs;
create policy "Turfs are viewable by everyone" on turfs for select using (true);

drop policy if exists "Owners can insert their own turfs" on turfs;
create policy "Owners can insert their own turfs" on turfs for insert with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their own turfs" on turfs;
create policy "Owners can update their own turfs" on turfs for update using (auth.uid() = owner_id);

drop policy if exists "Owners can delete their own turfs" on turfs;
create policy "Owners can delete their own turfs" on turfs for delete using (auth.uid() = owner_id);

drop policy if exists "Admins can do anything with turfs" on turfs;
create policy "Admins can do anything with turfs" on turfs for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Policies for bookings
drop policy if exists "Users can view own bookings" on bookings;
create policy "Users can view own bookings" on bookings for select using (auth.uid() = user_id);

drop policy if exists "Owners can view bookings for their turfs" on bookings;
create policy "Owners can view bookings for their turfs" on bookings for select using (
  exists (select 1 from turfs where id = turf_id and owner_id = auth.uid())
);

drop policy if exists "Users can create own bookings" on bookings;
create policy "Users can create own bookings" on bookings for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own bookings" on bookings;
create policy "Users can update own bookings" on bookings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Owners can update bookings for their turfs" on bookings;
create policy "Owners can update bookings for their turfs" on bookings for update using (
  exists (select 1 from turfs where id = turf_id and owner_id = auth.uid())
) with check (
  exists (select 1 from turfs where id = turf_id and owner_id = auth.uid())
);

drop policy if exists "Admins can view all bookings" on bookings;
create policy "Admins can view all bookings" on bookings for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Admins can update all bookings" on bookings;
create policy "Admins can update all bookings" on bookings for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Policies for booking cancellations audit
drop policy if exists "Users can view related booking cancellations" on booking_cancellations;
create policy "Users can view related booking cancellations" on booking_cancellations for select using (
  exists (
    select 1 from bookings b
    where b.id = booking_id and (
      b.user_id = auth.uid() or
      exists (select 1 from turfs t where t.id = b.turf_id and t.owner_id = auth.uid())
    )
  )
);

drop policy if exists "Users can insert related booking cancellations" on booking_cancellations;
create policy "Users can insert related booking cancellations" on booking_cancellations for insert with check (
  exists (
    select 1 from bookings b
    where b.id = booking_id and (
      b.user_id = auth.uid() or
      exists (select 1 from turfs t where t.id = b.turf_id and t.owner_id = auth.uid())
    )
  )
);

-- Policies for notifications
drop policy if exists "Users can view their notifications" on notifications;
create policy "Users can view their notifications" on notifications for select using (auth.uid() = recipient_id);
drop policy if exists "Send notifications to yourself or your recipients" on notifications;
create policy "Send notifications to yourself or your recipients" on notifications for insert with check (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
drop policy if exists "Users can mark own notifications read" on notifications;
create policy "Users can mark own notifications read" on notifications for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- Policies for turf feedback
drop policy if exists "Feedback is viewable by everyone" on turf_feedback;
create policy "Feedback is viewable by everyone" on turf_feedback for select using (true);
drop policy if exists "Users can add feedback" on turf_feedback;
create policy "Users can add feedback" on turf_feedback for insert with check (auth.uid() = author_id);

-- Policies for turf comments
drop policy if exists "Comments are viewable by everyone" on turf_comments;
create policy "Comments are viewable by everyone" on turf_comments for select using (true);
drop policy if exists "Users can add comments" on turf_comments;
create policy "Users can add comments" on turf_comments for insert with check (auth.uid() = author_id);

-- Function to handle new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', coalesce(new.raw_user_meta_data->>'role', 'customer'));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Ensure missing columns exist (for existing tables)
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name='turfs' and column_name='games') then
    alter table turfs add column games text[] default '{}';
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='preferred_city') then
    alter table profiles add column preferred_city text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='favorite_turfs') then
    alter table profiles add column favorite_turfs text[] default '{}';
  end if;

  if not exists (select 1 from information_schema.columns where table_name='turfs' and column_name='time_slots') then
    alter table turfs add column time_slots jsonb default '[]'::jsonb;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='turfs' and column_name='blocked_slots') then
    alter table turfs add column blocked_slots jsonb default '[]'::jsonb;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='turfs' and column_name='amenities') then
    alter table turfs add column amenities text[] default '{}';
  end if;

  if not exists (select 1 from information_schema.columns where table_name='bookings' and column_name='cancellation_reason') then
    alter table bookings add column cancellation_reason text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='bookings' and column_name='cancellation_notes') then
    alter table bookings add column cancellation_notes text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='bookings' and column_name='cancelled_by') then
    alter table bookings add column cancelled_by text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='bookings' and column_name='refund_amount') then
    alter table bookings add column refund_amount numeric default 0;
  end if;

  if not exists (select 1 from information_schema.columns where table_name='bookings' and column_name='qr_token') then
    alter table bookings add column qr_token text unique not null default gen_random_uuid();
  end if;

  if not exists (select 1 from information_schema.columns where table_name='bookings' and column_name='booking_status') then
    alter table bookings add column booking_status text default 'booked';
  end if;

  -- Update turfs type constraint
  alter table turfs drop constraint if exists turfs_type_check;
  alter table turfs add constraint turfs_type_check check (type in ('Football', 'Cricket', 'Tennis', 'Badminton', 'Multi-sport'));

  -- Update bookings status constraint if needed
  alter table bookings drop constraint if exists bookings_status_check;
  alter table bookings add constraint bookings_status_check check (status in ('pending', 'confirmed', 'cancelled', 'rejected'));

  alter table bookings drop constraint if exists bookings_booking_status_check;
  alter table bookings add constraint bookings_booking_status_check check (booking_status in ('booked', 'time is gone', 'cancelled'));

  alter table bookings drop constraint if exists bookings_cancelled_by_check;
  alter table bookings add constraint bookings_cancelled_by_check check (cancelled_by in ('customer', 'owner'));

  -- Fix user_id foreign key to reference profiles(id)
  alter table bookings drop constraint if exists bookings_user_id_fkey;
  alter table bookings add constraint bookings_user_id_fkey foreign key (user_id) references profiles(id) on delete cascade;
end $$;
