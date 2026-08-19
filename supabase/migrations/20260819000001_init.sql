-- Eduways Academy — initial schema
-- All translatable text columns are jsonb {"fa": "...", "en": "..."} (room for "tr" later).

create extension if not exists "pgcrypto";

-- ───────────────────────── enums ─────────────────────────
do $$ begin
  create type university_type as enum ('public', 'foundation');
  exception when duplicate_object then null; end $$;
do $$ begin
  create type program_level as enum ('associate', 'bachelor', 'master', 'phd');
  exception when duplicate_object then null; end $$;
do $$ begin
  create type district_side as enum ('european', 'asian');
  exception when duplicate_object then null; end $$;
do $$ begin
  create type ranking_source as enum ('urap', 'the', 'qs', 'eduways');
  exception when duplicate_object then null; end $$;
do $$ begin
  create type scholarship_type as enum ('university', 'eduways', 'government');
  exception when duplicate_object then null; end $$;
do $$ begin
  create type content_status as enum ('published', 'draft');
  exception when duplicate_object then null; end $$;
do $$ begin
  create type lead_status as enum ('new', 'contacted', 'closed');
  exception when duplicate_object then null; end $$;
do $$ begin
  create type user_role as enum ('admin', 'editor');
  exception when duplicate_object then null; end $$;

-- ───────────────────────── helpers ─────────────────────────
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ───────────────────────── profiles (admin roles) ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role user_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid());
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- Auto-create a profile row when a user signs up (role editor by default; promote to admin manually).
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ───────────────────────── content tables ─────────────────────────
create table if not exists public.categories (
  id text primary key,
  slug text not null unique,
  name jsonb not null,
  icon text
);

create table if not exists public.districts (
  id text primary key,
  slug text not null unique,
  name jsonb not null,
  side district_side not null,
  description jsonb not null default '{}'::jsonb,
  avg_rent_usd numeric,
  lat double precision,
  lng double precision,
  cover_url text,
  highlights jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.universities (
  id text primary key,
  slug text not null unique,
  name jsonb not null,
  short_name text,
  type university_type not null,
  city text not null default 'istanbul',
  district_id text references public.districts(id) on delete set null,
  founded int,
  website text,
  logo_url text,
  cover_url text,
  description jsonb not null default '{}'::jsonb,
  languages text[] not null default '{}',
  avg_tuition_min numeric,
  avg_tuition_max numeric,
  currency text not null default 'USD',
  student_count int,
  intl_student_pct numeric,
  has_dorm boolean not null default false,
  lat double precision,
  lng double precision,
  editorial_score int not null default 50 check (editorial_score between 0 and 100),
  is_featured boolean not null default false,
  status content_status not null default 'published',
  highlights jsonb not null default '[]'::jsonb,
  eduways_discount_pct numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists universities_city_idx on public.universities(city);
create index if not exists universities_district_idx on public.universities(district_id);
create index if not exists universities_type_idx on public.universities(type);

create table if not exists public.programs (
  id text primary key,
  university_id text not null references public.universities(id) on delete cascade,
  slug text not null,
  name jsonb not null,
  level program_level not null,
  faculty jsonb not null default '{}'::jsonb,
  language text not null,
  duration_years numeric,
  tuition_usd numeric,
  tuition_note jsonb,
  category_id text references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (university_id, slug)
);
create index if not exists programs_university_idx on public.programs(university_id);
create index if not exists programs_category_idx on public.programs(category_id);
create index if not exists programs_level_idx on public.programs(level);

create table if not exists public.admission_requirements (
  id text primary key,
  university_id text not null references public.universities(id) on delete cascade,
  level program_level not null,
  documents jsonb not null default '[]'::jsonb,
  exams jsonb not null default '[]'::jsonb,
  deadlines jsonb not null default '[]'::jsonb,
  notes jsonb,
  updated_at timestamptz not null default now(),
  unique (university_id, level)
);

create table if not exists public.scholarships (
  id text primary key,
  university_id text references public.universities(id) on delete cascade,
  title jsonb not null,
  discount_pct numeric not null default 0,
  type scholarship_type not null,
  conditions jsonb not null default '{}'::jsonb,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rankings (
  id text primary key,
  university_id text not null references public.universities(id) on delete cascade,
  source ranking_source not null,
  year int not null,
  rank_world int,
  rank_national int,
  score numeric,
  category_id text references public.categories(id) on delete set null,
  source_url text,
  unique (university_id, source, year, category_id)
);

create table if not exists public.services (
  id text primary key,
  slug text not null unique,
  title jsonb not null,
  summary jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  icon text,
  price_note jsonb,
  "order" int not null default 0,
  steps jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id text primary key,
  slug text not null unique,
  student_name text not null,
  university_id text references public.universities(id) on delete set null,
  program jsonb not null default '{}'::jsonb,
  photo_url text,
  quote jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  country text,
  year_enrolled int,
  published_at date not null default current_date,
  status content_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  slug text not null unique,
  title jsonb not null,
  excerpt jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  cover_url text,
  tags text[] not null default '{}',
  published_at date not null default current_date,
  author text,
  reading_minutes int,
  status content_status not null default 'published',
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id text primary key,
  question jsonb not null,
  answer jsonb not null,
  category text not null default 'general',
  "order" int not null default 0
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  country text,
  interest_level program_level,
  desired_major text,
  budget_usd numeric,
  message text,
  source_page text,
  locale text,
  status lead_status not null default 'new',
  created_at timestamptz not null default now()
);
create index if not exists leads_created_idx on public.leads(created_at desc);

-- updated_at triggers
do $$ declare t text; begin
  foreach t in array array['districts','universities','programs','admission_requirements','scholarships','services','stories','posts','site_settings'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ───────────────────────── views ─────────────────────────
create or replace view public.v_university_best_rank as
select u.id as university_id, min(r.rank_national) as best_rank
from public.universities u left join public.rankings r on r.university_id = u.id
group by u.id;

-- ───────────────────────── RLS ─────────────────────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.districts enable row level security;
alter table public.universities enable row level security;
alter table public.programs enable row level security;
alter table public.admission_requirements enable row level security;
alter table public.scholarships enable row level security;
alter table public.rankings enable row level security;
alter table public.services enable row level security;
alter table public.stories enable row level security;
alter table public.posts enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;
alter table public.leads enable row level security;

-- profiles: a user sees their own row; admins see all.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- public read of content
drop policy if exists categories_read on public.categories;    create policy categories_read on public.categories for select using (true);
drop policy if exists districts_read on public.districts;      create policy districts_read on public.districts for select using (true);
drop policy if exists universities_read on public.universities; create policy universities_read on public.universities for select using (status = 'published' or public.is_staff());
drop policy if exists programs_read on public.programs;        create policy programs_read on public.programs for select using (true);
drop policy if exists reqs_read on public.admission_requirements; create policy reqs_read on public.admission_requirements for select using (true);
drop policy if exists scholarships_read on public.scholarships; create policy scholarships_read on public.scholarships for select using (true);
drop policy if exists rankings_read on public.rankings;        create policy rankings_read on public.rankings for select using (true);
drop policy if exists services_read on public.services;        create policy services_read on public.services for select using (true);
drop policy if exists stories_read on public.stories;          create policy stories_read on public.stories for select using (status = 'published' or public.is_staff());
drop policy if exists posts_read on public.posts;              create policy posts_read on public.posts for select using (status = 'published' or public.is_staff());
drop policy if exists faqs_read on public.faqs;                create policy faqs_read on public.faqs for select using (true);
drop policy if exists settings_read on public.site_settings;   create policy settings_read on public.site_settings for select using (true);

-- staff write on content
do $$ declare t text; begin
  foreach t in array array['categories','districts','universities','programs','admission_requirements','scholarships','rankings','services','stories','posts','faqs','site_settings'] loop
    execute format('drop policy if exists %I_staff_write on public.%I', t, t);
    execute format('create policy %I_staff_write on public.%I for all using (public.is_staff()) with check (public.is_staff())', t, t);
  end loop;
end $$;

-- leads: anyone can insert (through the API with service role, but anon insert is also allowed for resilience);
-- only staff can read/update; only admins delete.
drop policy if exists leads_insert on public.leads;  create policy leads_insert on public.leads for insert with check (true);
drop policy if exists leads_staff_read on public.leads; create policy leads_staff_read on public.leads for select using (public.is_staff());
drop policy if exists leads_staff_update on public.leads; create policy leads_staff_update on public.leads for update using (public.is_staff()) with check (public.is_staff());
drop policy if exists leads_admin_delete on public.leads; create policy leads_admin_delete on public.leads for delete using (public.is_admin());

-- ───────────────────────── storage bucket for media ─────────────────────────
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_staff_write on storage.objects;
create policy media_staff_write on storage.objects for all using (bucket_id = 'media' and public.is_staff()) with check (bucket_id = 'media' and public.is_staff());
