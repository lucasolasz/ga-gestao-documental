create table pops (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  familia_pop_id uuid not null references familias_pop(id),
  created_at timestamptz default now()
);

alter table "public"."pops" enable row level security;

create policy "authenticated users can select pops"
on "public"."pops"
to authenticated
using (true);

create policy "authenticated users can insert pops"
on "public"."pops"
to authenticated
with check (true);

create policy "authenticated users can update pops"
on "public"."pops"
to authenticated
using (true)
with check (true);

create policy "authenticated users can delete pops"
on "public"."pops"
to authenticated
using (true);
