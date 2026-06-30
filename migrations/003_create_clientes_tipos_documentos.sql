create table public.clientes_tipos_documentos (
  client_id uuid not null references public.clients (id) on delete cascade,
  tipo_documento_id uuid not null references public.tipos_documentos (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint clientes_tipos_documentos_pkey primary key (client_id, tipo_documento_id)
) TABLESPACE pg_default;

-- SELECT
create policy "Usuários autenticados podem visualizar"
on public.clientes_tipos_documentos
as permissive
for select
to authenticated
using (true);

-- INSERT
create policy "Usuários autenticados podem inserir"
on public.clientes_tipos_documentos
as permissive
for insert
to authenticated
with check (true);

-- UPDATE
create policy "Usuários autenticados podem atualizar"
on public.clientes_tipos_documentos
as permissive
for update
to authenticated
using (true)
with check (true);

-- DELETE
create policy "Usuários autenticados podem excluir"
on public.clientes_tipos_documentos
as permissive
for delete
to authenticated
using (true);