-- Run this once in the Supabase SQL Editor.
create table if not exists public.contact_requests (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  email text not null check (char_length(btrim(email)) between 3 and 254),
  service text not null check (service in (
    'সোশ্যাল মিডিয়া মার্কেটিং',
    'পেইড অ্যাড ক্যাম্পেইন',
    'SEO ও কনটেন্ট',
    'অন্যান্য'
  )),
  message text not null check (char_length(btrim(message)) between 1 and 3000),
  created_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;

-- Public visitors can submit a request, but cannot read, edit, or delete submissions.
revoke all on table public.contact_requests from anon, authenticated;
grant insert on table public.contact_requests to anon;

drop policy if exists "Anyone can submit a valid contact request" on public.contact_requests;
create policy "Anyone can submit a valid contact request"
  on public.contact_requests
  for insert
  to anon
  with check (
    char_length(btrim(name)) between 1 and 100
    and char_length(btrim(email)) between 3 and 254
    and service in (
      'সোশ্যাল মিডিয়া মার্কেটিং',
      'পেইড অ্যাড ক্যাম্পেইন',
      'SEO ও কনটেন্ট',
      'অন্যান্য'
    )
    and char_length(btrim(message)) between 1 and 3000
  );

-- The identity sequence must also allow anonymous inserts.
grant usage on sequence public.contact_requests_id_seq to anon;
