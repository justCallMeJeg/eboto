create table public.ballot (
  id uuid not null default gen_random_uuid (),
  election_id uuid null,
  voter_id uuid null,
  votes json[] null,
  created_at timestamp with time zone not null default now(),
  constraint ballot_pkey primary key (id),
  constraint ballot_election_id_fkey foreign KEY (election_id) references elections (id),
  constraint ballot_voter_id_fkey foreign KEY (voter_id) references voters (id)
) TABLESPACE pg_default;