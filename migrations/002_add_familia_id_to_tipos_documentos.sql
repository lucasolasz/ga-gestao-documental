alter table public.tipos_documentos
  add column familia_id uuid null
    constraint tipos_documentos_familia_id_fkey
      references public.familias_documentos (id) on delete set null;
