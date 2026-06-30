create table public.familias_documentos (
  id uuid not null default gen_random_uuid (),
  descricao text not null,
  created_at timestamp with time zone null default now(),
  constraint familias_pop_pkey primary key (id)
) TABLESPACE pg_default;
