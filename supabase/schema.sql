-- ════════════════════════════════════════════════════════════════════════
-- DASHBOARD FINANCEIRO - Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase (uma vez só)
-- ════════════════════════════════════════════════════════════════════════

-- ─── PROFILES (extensão do auth.users) ──────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nome text,
  role text not null default 'user' check (role in ('user','admin')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','suspended')),
  plano text not null default 'free' check (plano in ('free','mensal','anual')),
  created_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users
);

alter table public.profiles enable row level security;

-- Cada user vê e edita só seu próprio profile; admins veem todos
create policy "users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "admins can read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "users can update own profile (limited)" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "admins can update any profile" on public.profiles
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Trigger: ao criar um auth.user, cria automaticamente um profile pendente
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nome, status, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    'pending',
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── TABELAS DO DASHBOARD ───────────────────────────────────────────────

create table public.receitas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  nome text not null,
  valor numeric(12,2) not null,
  mes int not null check (mes between 0 and 11),
  ano int not null,
  created_at timestamptz default now()
);
create index on public.receitas (user_id, ano, mes);

create table public.despesas_fixas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  nome text not null,
  valor numeric(12,2) not null,
  vencimento int check (vencimento between 1 and 31),
  ativa boolean not null default true,
  created_at timestamptz default now()
);
create index on public.despesas_fixas (user_id);

create table public.despesas_variaveis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  nome text not null,
  valor numeric(12,2) not null,
  categoria text,
  mes int not null check (mes between 0 and 11),
  ano int not null,
  vencimento int check (vencimento between 1 and 31),
  created_at timestamptz default now()
);
create index on public.despesas_variaveis (user_id, ano, mes);

create table public.despesas_cartoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  nome text not null,
  valor numeric(12,2) not null,
  mes int not null check (mes between 0 and 11),
  ano int not null,
  vencimento int check (vencimento between 1 and 31),
  created_at timestamptz default now()
);
create index on public.despesas_cartoes (user_id, ano, mes);

-- Pagamentos: rastreia ocorrências quitadas
-- tipo: 'fixa' | 'variavel' | 'cartao'
-- ref_id: id da despesa
-- mes/ano: ocorrência específica (fixa repete todo mês)
create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  tipo text not null check (tipo in ('fixa','variavel','cartao')),
  ref_id uuid not null,
  mes int not null check (mes between 0 and 11),
  ano int not null,
  pago_em timestamptz default now(),
  unique (user_id, tipo, ref_id, mes, ano)
);
create index on public.pagamentos (user_id, ano, mes);

-- ─── RLS (Row Level Security) ───────────────────────────────────────────
alter table public.receitas enable row level security;
alter table public.despesas_fixas enable row level security;
alter table public.despesas_variaveis enable row level security;
alter table public.despesas_cartoes enable row level security;
alter table public.pagamentos enable row level security;

-- Helper: usuário aprovado pode operar
create or replace function public.is_approved()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$ language sql stable security definer;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- Política genérica: cada usuário só vê/manipula os próprios dados, desde que aprovado
do $$
declare t text;
begin
  foreach t in array array['receitas','despesas_fixas','despesas_variaveis','despesas_cartoes','pagamentos']
  loop
    execute format('create policy "%s select own" on public.%s for select using (auth.uid() = user_id and public.is_approved())', t, t);
    execute format('create policy "%s insert own" on public.%s for insert with check (auth.uid() = user_id and public.is_approved())', t, t);
    execute format('create policy "%s update own" on public.%s for update using (auth.uid() = user_id and public.is_approved())', t, t);
    execute format('create policy "%s delete own" on public.%s for delete using (auth.uid() = user_id and public.is_approved())', t, t);
  end loop;
end $$;
