-- ============================================================
-- ga-gestao-documental — full schema
-- Run in Supabase SQL editor (top to bottom)
-- ============================================================

-- Trigger function used by clients + documents
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------

create table public.familias_documentos (
  id uuid not null default gen_random_uuid(),
  descricao text not null,
  created_at timestamp with time zone null default now(),
  constraint familias_pop_pkey primary key (id)
) tablespace pg_default;

-- ------------------------------------------------------------

create table public.tipos_documentos (
  id          uuid not null default gen_random_uuid(),
  descricao   text not null,
  familia_id  uuid null,
  created_at  timestamp with time zone not null default timezone('utc'::text, now()),
  constraint tipos_documentos_pkey primary key (id),
  constraint tipos_documentos_familia_id_fkey
    foreign key (familia_id) references public.familias_documentos (id) on delete set null
) tablespace pg_default;

-- ------------------------------------------------------------

create table public.categorias (
  id          uuid not null default gen_random_uuid(),
  descricao   text not null,
  created_at  timestamp with time zone not null default timezone('utc'::text, now()),
  constraint categorias_pkey primary key (id)
) tablespace pg_default;

-- ------------------------------------------------------------

create table public.clients (
  id              uuid not null default gen_random_uuid(),
  nome            text not null,
  cnpj            text not null,
  telefone        text null,
  drive_folder_id text null,
  categoria_id    uuid null,
  created_at      timestamp with time zone null default now(),
  updated_at      timestamp with time zone null default now(),
  constraint clients_pkey primary key (id),
  constraint clients_cnpj_key unique (cnpj),
  constraint clients_categoria_id_fkey
    foreign key (categoria_id) references categorias (id)
) tablespace pg_default;

create trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

-- ------------------------------------------------------------

create table public.clientes_tipos_documentos (
  client_id      uuid not null,
  tipo_documento_id uuid not null,
  created_at        timestamp with time zone not null default timezone('utc'::text, now()),
  constraint clientes_tipos_documentos_pkey
    primary key (client_id, tipo_documento_id),
  constraint clientes_tipos_documentos_client_id_fkey
    foreign key (client_id) references clients (id) on delete cascade,
  constraint clientes_tipos_documentos_tipo_documento_id_fkey
    foreign key (tipo_documento_id) references tipos_documentos (id) on delete cascade
) tablespace pg_default;

alter table public.clientes_tipos_documentos enable row level security;

create policy "Usuários autenticados podem visualizar"
  on public.clientes_tipos_documentos as permissive
  for select to authenticated using (true);

create policy "Usuários autenticados podem inserir"
  on public.clientes_tipos_documentos as permissive
  for insert to authenticated with check (true);

create policy "Usuários autenticados podem atualizar"
  on public.clientes_tipos_documentos as permissive
  for update to authenticated using (true) with check (true);

create policy "Usuários autenticados podem excluir"
  on public.clientes_tipos_documentos as permissive
  for delete to authenticated using (true);

-- ------------------------------------------------------------

create table public.documents (
  id             uuid not null default gen_random_uuid(),
  client_id      uuid not null,
  numero         text not null,
  tipo           uuid null,
  data_emissao   date null,
  data_validade  date null,
  file_url       text null,
  file_name      text null,
  created_at     timestamp with time zone null default now(),
  updated_at     timestamp with time zone null default now(),
  constraint documents_pkey primary key (id),
  constraint documents_client_id_fkey
    foreign key (client_id) references clients (id) on delete cascade,
  constraint documents_tipo_fkey
    foreign key (tipo) references tipos_documentos (id) on delete set null
) tablespace pg_default;

create trigger documents_updated_at
  before update on documents
  for each row execute function update_updated_at();

-- ------------------------------------------------------------

create table public.profiles (
  id         uuid not null,
  perfil     text not null,
  nome       text null,
  created_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey
    foreign key (id) references auth.users (id) on delete cascade,
  constraint profiles_perfil_check check (
    perfil = any (array['desenvolvedor'::text, 'admin'::text, 'viewer'::text])
  )
) tablespace pg_default;