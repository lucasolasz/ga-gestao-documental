create table public.familias_documentos (
  id uuid not null default gen_random_uuid (),
  descricao text not null,
  created_at timestamp with time zone null default now(),
  constraint familias_pop_pkey primary key (id)
) TABLESPACE pg_default;


-- SELECT
create policy "Usuários autenticados podem visualizar"
on public.familias_documentos
as permissive
for select
to authenticated
using (true);

-- INSERT
create policy "Usuários autenticados podem inserir"
on public.familias_documentos
as permissive
for insert
to authenticated
with check (true);

-- UPDATE
create policy "Usuários autenticados podem atualizar"
on public.familias_documentos
as permissive
for update
to authenticated
using (true)
with check (true);

-- DELETE
create policy "Usuários autenticados podem excluir"
on public.familias_documentos
as permissive
for delete
to authenticated
using (true);