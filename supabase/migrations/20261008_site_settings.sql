-- Configuração pública do site para recursos sazonais.
-- Execute este script no SQL Editor do projeto Supabase antes de usar o controle do admin.

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.site_settings enable row level security;

create policy "Configurações públicas podem ser lidas"
on public.site_settings
for select
using (true);

create policy "Administradores podem inserir configurações"
on public.site_settings
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Administradores podem atualizar configurações"
on public.site_settings
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

insert into public.site_settings (setting_key, setting_value)
values ('halloween', '{"enabled": true}'::jsonb)
on conflict (setting_key) do nothing;
