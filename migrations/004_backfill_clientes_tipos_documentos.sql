insert into public.clientes_tipos_documentos (client_id, tipo_documento_id, created_at)
select distinct c.id, ct.tipo_documento_id, now()
from public.clients c
join public.categorias_tipos_documentos ct on ct.categoria_id = c.categoria_id
on conflict (client_id, tipo_documento_id) do nothing;