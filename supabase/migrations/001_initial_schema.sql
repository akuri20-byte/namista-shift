create extension if not exists "pgcrypto";

create type public.staff_role as enum ('staff', 'manager');
create type public.shift_status as enum ('draft', 'confirmed');
create type public.reservation_status as enum ('booked', 'completed', 'cancelled');

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  role public.staff_role not null default 'staff',
  job_title text not null default 'スタッフ',
  is_new boolean not null default false,
  skills jsonb not null default '{"kitchen":0,"hall":0,"drink":0}'::jsonb,
  hourly_wage integer not null check (hourly_wage >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.shift_requests (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  request_date date not null,
  request_type text not null default 'day_off' check (request_type = 'day_off'),
  created_at timestamptz not null default now(),
  unique (staff_id, request_date)
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  shift_date date not null,
  start_time time not null default '09:00',
  end_time time not null default '18:00',
  status public.shift_status not null default 'draft',
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  unique (staff_id, shift_date)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  reservation_date date not null,
  start_time time not null,
  customer_name text not null,
  menu_name text not null,
  price integer not null check (price >= 0),
  status public.reservation_status not null default 'booked',
  created_at timestamptz not null default now()
);

create table public.staffing_requirements (
  id uuid primary key default gen_random_uuid(),
  target_date date not null unique,
  required_count integer not null check (required_count >= 1),
  created_at timestamptz not null default now()
);

create table public.time_requirements (
  id uuid primary key default gen_random_uuid(),
  target_date date not null,
  start_time time not null,
  position text not null check (position in ('kitchen', 'hall', 'drink')),
  required_count integer not null check (required_count >= 0),
  unique (target_date, start_time, position)
);

create table public.business_settings (
  id uuid primary key default gen_random_uuid(),
  monthly_sales_target integer not null default 3000000,
  target_labor_rate numeric(5,2) not null default 22.00,
  updated_at timestamptz not null default now()
);

create index shift_requests_date_idx on public.shift_requests(request_date);
create index shifts_date_idx on public.shifts(shift_date);
create index reservations_date_idx on public.reservations(reservation_date);

create or replace function public.is_manager()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.staff where auth_user_id = auth.uid() and role = 'manager');
$$;

alter table public.staff enable row level security;
alter table public.shift_requests enable row level security;
alter table public.shifts enable row level security;
alter table public.reservations enable row level security;
alter table public.staffing_requirements enable row level security;
alter table public.time_requirements enable row level security;
alter table public.business_settings enable row level security;

create policy "staff profile read" on public.staff for select using (auth_user_id = auth.uid() or public.is_manager());
create policy "requests read" on public.shift_requests for select using (staff_id in (select id from public.staff where auth_user_id = auth.uid()) or public.is_manager());
create policy "own requests insert" on public.shift_requests for insert with check (staff_id in (select id from public.staff where auth_user_id = auth.uid()));
create policy "own requests delete" on public.shift_requests for delete using (staff_id in (select id from public.staff where auth_user_id = auth.uid()) or public.is_manager());
create policy "shifts read" on public.shifts for select using (staff_id in (select id from public.staff where auth_user_id = auth.uid()) or public.is_manager());
create policy "manager shifts write" on public.shifts for all using (public.is_manager()) with check (public.is_manager());
create policy "reservations read" on public.reservations for select using (staff_id in (select id from public.staff where auth_user_id = auth.uid()) or public.is_manager());
create policy "manager reservations write" on public.reservations for all using (public.is_manager()) with check (public.is_manager());
create policy "requirements read" on public.staffing_requirements for select using (auth.uid() is not null);
create policy "manager requirements write" on public.staffing_requirements for all using (public.is_manager()) with check (public.is_manager());
create policy "time requirements read" on public.time_requirements for select using (auth.uid() is not null);
create policy "manager time requirements write" on public.time_requirements for all using (public.is_manager()) with check (public.is_manager());
create policy "business settings read" on public.business_settings for select using (auth.uid() is not null);
create policy "manager business settings write" on public.business_settings for all using (public.is_manager()) with check (public.is_manager());
