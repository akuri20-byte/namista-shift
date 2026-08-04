insert into public.staff (id, name, role, job_title, is_new, hourly_wage, skills) values
  ('10000000-0000-0000-0000-000000000001', 'スティン', 'manager', '店長', false, 1200, '{"kitchen":3,"hall":3,"drink":3}'),
  ('10000000-0000-0000-0000-000000000002', 'のりぴ', 'staff', 'ホール', false, 1200, '{"kitchen":1,"hall":3,"drink":2}'),
  ('10000000-0000-0000-0000-000000000003', 'かりん', 'staff', 'ホール', false, 1200, '{"kitchen":1,"hall":3,"drink":2}'),
  ('10000000-0000-0000-0000-000000000004', 'ピョーくん', 'staff', 'リーダー', false, 1300, '{"kitchen":3,"hall":3,"drink":3}')
on conflict (id) do nothing;

insert into public.business_settings (monthly_sales_target, target_labor_rate) values (3000000, 22.00);

insert into public.staffing_requirements (target_date, required_count)
select day::date, case extract(isodow from day) when 5 then 3 when 6 then 4 else 2 end
from generate_series(current_date + 1, current_date + 21, interval '1 day') day
on conflict (target_date) do update set required_count = excluded.required_count;

insert into public.reservations (staff_id, reservation_date, start_time, customer_name, menu_name, price)
select
  ('10000000-0000-0000-0000-00000000000' || ((n % 4) + 1))::uuid,
  current_date + ((n % 7) + 7),
  ('09:00'::time + ((n % 8) * interval '1 hour'))::time,
  'デモ顧客' || n,
  case when n % 2 = 0 then 'カット＆カラー' else '整体60分' end,
  case when n % 2 = 0 then 12000 else 7000 end
from generate_series(1, 28) n;
