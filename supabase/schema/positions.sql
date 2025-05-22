create table public.positions (
  id uuid not null default gen_random_uuid (),
  election_id uuid null,
  name text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint positions_pkey primary key (id),
  constraint positions_election_id_fkey foreign KEY (election_id) references elections (id)
) TABLESPACE pg_default;