create table familias_pop (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  created_at timestamptz default now()
);

alter table "public"."familias_pop" enable row level security;

create policy "authenticated users can select familias_pop"
on "public"."familias_pop"
to authenticated
using (true);

create policy "authenticated users can insert familias_pop"
on "public"."familias_pop"
to authenticated
with check (true);

create policy "authenticated users can update familias_pop"
on "public"."familias_pop"
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete familias_pop"
on "public"."familias_pop"
to authenticated
using (true);
