drop table public.categorias_tipos_documentos;

--Confirmar que a tabela foi removida:
select exists (
  select from information_schema.tables
  where table_schema = 'public' and table_name = 'categorias_tipos_documentos'
);
-- deve retornar false

--Confirmar que clientes_tipos_documentos continua com os mesmos dados (backfill preservado):
select count(*) from public.clientes_tipos_documentos;
