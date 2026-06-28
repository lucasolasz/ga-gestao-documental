create table public.clientes_tipos_documentos (
  client_id uuid not null references public.clients (id) on delete cascade,
  tipo_documento_id uuid not null references public.tipos_documentos (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint clientes_tipos_documentos_pkey primary key (client_id, tipo_documento_id)
) TABLESPACE pg_default;