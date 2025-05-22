create table public.candidates (
  id uuid not null default gen_random_uuid (),
  election_id uuid null,
  position_id uuid null,
  group_id uuid null,
  party text null,
  display_name text null,
  image_url text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint candidates_pkey primary key (id),
  constraint candidates_election_id_fkey foreign KEY (election_id) references elections (id),
  constraint candidates_position_id_fkey foreign KEY (position_id) references positions (id),
  constraint candidates_group_id_fkey foreign KEY (group_id) references usergroups (id)
) TABLESPACE pg_default;