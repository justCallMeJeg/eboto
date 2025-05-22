create table public.elections (
  id uuid not null default gen_random_uuid (),
  name text null default ''::text,
  description text null,
  status numeric null,
  start_date date null,
  end_date date null,
  owner_id uuid null,
  voter_count numeric null,
  updated_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  constraint elections_pkey primary key (id),
  constraint elections_ownerid_fkey foreign KEY (owner_id) references auth.users (id)
) TABLESPACE pg_default;