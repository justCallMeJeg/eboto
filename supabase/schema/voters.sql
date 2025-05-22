create table public.voters (
  id uuid not null default gen_random_uuid (),
  election_id uuid null,
  group_id uuid null,
  email text null,
  voted boolean null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint voters_pkey primary key (id),
  constraint voters_election_id_fkey foreign KEY (election_id) references elections (id),
  constraint voters_group_id_fkey foreign KEY (group_id) references usergroups (id)
) TABLESPACE pg_default;