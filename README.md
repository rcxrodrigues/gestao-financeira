# 💰 Dashboard Financeiro

Aplicação SaaS completa de gestão financeira pessoal com sistema de aprovação de usuários.

**Stack**: Next.js 14 (App Router) + Supabase (Auth + Postgres) + Recharts
**Deploy**: Vercel (frontend) + Supabase (backend)

---

## ✨ Funcionalidades

- 🔐 **Autenticação completa** (login, signup, logout) via Supabase Auth
- ✅ **Sistema de aprovação** — todo novo cadastro fica pendente até o admin aprovar
- 👑 **Painel Admin** — aprovar, recusar, suspender, reativar usuários e definir plano
- 📊 **Dashboard financeiro** com KPIs, gráficos interativos e múltiplas seções
- 💵 Cadastro de receitas, despesas fixas, variáveis e cartões
- ✓ Marcação de pagamento por ocorrência (status sincronizado em todo o app)
- 📅 Status de vencimento automático (Pago / Vencido / Em N dias)
- 🎯 Calculadora 50/30/20 ajustável
- 🔒 **Row Level Security** — cada usuário só vê seus próprios dados (garantido no banco)

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [Vercel](https://vercel.com) (gratuita) e/ou GitHub
- Git instalado (opcional, mas recomendado)

---

## 🚀 PARTE 1 — Configurar o Supabase

### 1.1 — Criar o projeto

1. Acesse https://supabase.com → **New project**
2. Preencha:
   - **Name**: `dash-financeiro`
   - **Database Password**: anote esta senha em um lugar seguro
   - **Region**: `South America (São Paulo)` (mais próximo do Brasil)
3. Clique em **Create new project** e aguarde ~2 minutos

### 1.2 — Executar o schema SQL

1. No menu lateral do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo `supabase/schema.sql` deste projeto, copie TUDO e cole no editor
4. Clique em **Run** (canto inferior direito)
5. Deve aparecer "Success. No rows returned" — isso significa que tudo foi criado

### 1.3 — Pegar as chaves de API

1. No menu lateral, vá em **Project Settings** → **API**
2. Copie estes três valores (vai usar no próximo passo):
   - **Project URL** → vai virar `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → vai virar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → vai virar `SUPABASE_SERVICE_ROLE_KEY` (⚠️ NUNCA exponha publicamente)

### 1.4 — Configurar autenticação por email

1. No menu lateral, vá em **Authentication** → **Providers**
2. Em **Email**, garanta que está habilitado
3. (Recomendado para testes) Em **Email** → desmarque temporariamente "Confirm email" para criar contas mais rápido sem precisar confirmar email
   - Em produção, deixe ativado e configure SMTP em **Authentication → SMTP Settings**

### 1.5 — Configurar URLs de redirect (importante depois do deploy)

1. Vá em **Authentication** → **URL Configuration**
2. Em **Site URL**, coloque temporariamente `http://localhost:3000` (vamos alterar quando publicar)
3. Em **Redirect URLs**, adicione:
   - `http://localhost:3000/auth/callback`
   - Mais tarde adicione também `https://SEU-DOMINIO.vercel.app/auth/callback`

---

## 💻 PARTE 2 — Rodar localmente

### 2.1 — Instalar dependências

Abra um terminal na pasta do projeto e rode:

```bash
npm install
```

### 2.2 — Criar arquivo `.env.local`

Na raiz do projeto, copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e cole as chaves do Supabase (passo 1.3):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...sua-chave-service
```

### 2.3 — Iniciar o servidor

```bash
npm run dev
```

Acesse http://localhost:3000 — você será redirecionado pra tela de login.

### 2.4 — Criar a primeira conta (que será admin)

1. Clique em **Cadastre-se**
2. Crie sua conta com seu email e senha
3. Você será redirecionado para a tela "Aguardando aprovação"

### 2.5 — Promover sua conta a admin (passo manual, uma única vez)

Como ainda não tem nenhum admin, você precisa se promover via SQL:

1. Volte ao **SQL Editor** do Supabase
2. Rode (substituindo seu email):

```sql
update public.profiles
set role = 'admin', status = 'approved', approved_at = now()
where email = 'seu-email@exemplo.com';
```

3. Recarregue o dashboard. Você verá o badge **👑 Admin** no topo direito.

A partir daqui, todos os próximos cadastros você aprova pelo painel `/admin`.

---

## ☁️ PARTE 3 — Deploy na Vercel

### 3.1 — Subir o código pro GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Crie um repositório novo no GitHub (privado!) e siga as instruções pra push.

### 3.2 — Conectar à Vercel

1. Acesse https://vercel.com → **Add New** → **Project**
2. Importe o repositório do GitHub que você acabou de criar
3. **Framework Preset**: Next.js (detectado automaticamente)
4. Em **Environment Variables**, adicione as TRÊS variáveis:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | (mesma do .env.local) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (mesma do .env.local) |
| `SUPABASE_SERVICE_ROLE_KEY` | (mesma do .env.local) |

5. Clique em **Deploy**. Em ~2 minutos seu app estará no ar com uma URL tipo `https://dash-financeiro-xxx.vercel.app`

### 3.3 — Atualizar URLs no Supabase

Agora que tem URL pública, volte ao **Supabase → Authentication → URL Configuration**:

1. Em **Site URL**, troque para `https://SEU-DOMINIO.vercel.app`
2. Em **Redirect URLs**, adicione:
   - `https://SEU-DOMINIO.vercel.app/auth/callback`
   - `https://SEU-DOMINIO.vercel.app/**` (curinga para qualquer rota)

### 3.4 — (Opcional) Domínio próprio

Na Vercel → **Project Settings** → **Domains** → adicione seu domínio. A Vercel mostra os registros DNS que você precisa configurar no seu provedor (Registro.br, Hostinger, etc.). Depois é só atualizar as URLs no Supabase pro novo domínio.

---

## 🧭 Estrutura do projeto

```
dash-financeiro/
├─ app/
│  ├─ admin/             → Painel admin (gerenciar usuários)
│  ├─ api/admin/users/   → API REST do admin (GET/PATCH)
│  ├─ auth/callback/     → Callback de confirmação de email
│  ├─ dashboard/         → Dashboard principal
│  ├─ login/             → Tela de login
│  ├─ pending/           → "Aguardando aprovação"
│  ├─ signup/            → Cadastro
│  ├─ globals.css        → Estilos globais
│  ├─ layout.js          → Layout raiz
│  └─ page.js            → Raiz (redireciona pra dashboard)
├─ components/
│  ├─ AdminClient.js     → UI do painel admin
│  ├─ AuthLayout.js      → Layout das telas de auth
│  ├─ DashboardClient.js → UI do dashboard
│  ├─ LogoutButton.js
│  └─ ui.js              → Field, Button, Error/Success msgs
├─ lib/
│  ├─ supabase-browser.js → Cliente Supabase (browser)
│  ├─ supabase-server.js  → Cliente Supabase (server components)
│  ├─ supabase-admin.js   → Cliente admin (service role)
│  └─ use-dashboard-data.js → Hook que carrega dados do user
├─ supabase/
│  └─ schema.sql         → Schema completo do banco
├─ middleware.js         → Protege rotas e renova sessão
├─ .env.example
├─ jsconfig.json
├─ next.config.js
└─ package.json
```

---

## 🔒 Segurança

- **Row Level Security (RLS)** habilitada em todas as tabelas — cada usuário só consegue ler/escrever seus próprios dados, garantido no nível do banco.
- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) usada APENAS em route handlers no servidor (`app/api/admin/*`) e nunca exposta ao browser.
- **Middleware** valida a cada requisição se o usuário está autenticado, aprovado e (no caso de `/admin`) é admin.
- **Senhas** são gerenciadas pelo Supabase Auth (bcrypt + outras proteções).

---

## 🛠️ Comandos úteis

```bash
npm run dev      # rodar local
npm run build    # build de produção
npm run start    # iniciar build de produção localmente
```

---

## ❓ Troubleshooting

### "Auth session missing" no console
Você não está logado. Acesse `/login`.

### Após cadastro vai pra `/pending` e fica preso lá
Comportamento esperado — alguém com role admin precisa aprovar. Promova a si mesmo como admin (passo 2.5).

### Erro "Email not confirmed" ao tentar login
Você ativou "Confirm email" no Supabase mas não confirmou pelo link no email. Confirme o email OU desative temporariamente em Authentication → Providers.

### Painel admin retorna 403
Sua conta não está com `role='admin'` no banco. Rode o SQL do passo 2.5.

### Após deploy, login não funciona em produção
Verifique se as URLs em Supabase → Authentication → URL Configuration apontam pro seu domínio Vercel, e se as 3 env vars estão configuradas na Vercel.

---

## 📝 Próximos passos sugeridos

- [ ] Configurar SMTP custom no Supabase pra ter emails de confirmação com sua marca
- [ ] Integrar Stripe ou Mercado Pago pra cobrar planos automaticamente
- [ ] Adicionar exportação de relatórios em PDF/Excel
- [ ] Notificações de vencimento por email
- [ ] App mobile via PWA

---

## 📱 Otimização Mobile (Mobile-First)

O projeto foi desenhado **mobile-first**:

### Recursos mobile
- ✅ **Viewport correto** (`width=device-width, initial-scale=1`) — sem zoom indesejado
- ✅ **Inputs com font-size 16px+** — evita zoom automático no iOS ao focar campos
- ✅ **Botões e toques com mínimo 44px de altura** — padrão Apple HIG e Material Design
- ✅ **Listagens em cards verticais** no lugar de tabelas — sem scroll horizontal feio
- ✅ **Tabs e meses com scroll horizontal touch** — fluido com `-webkit-overflow-scrolling`
- ✅ **Safe area insets** — respeita notch de iPhone e barra de navegação Android
- ✅ **Formulários adaptados** — campos em coluna única, validação visível
- ✅ **Gráficos responsivos** — Recharts redimensiona automaticamente
- ✅ **`inputMode="decimal"` e `"numeric"`** — abre teclado correto pra valores

### Instalar como app (PWA)

O dashboard é instalável como **app na tela inicial** do celular:

**No iPhone (Safari):**
1. Acesse o site
2. Toque no botão de compartilhar (□↑)
3. "Adicionar à Tela de Início"
4. O app aparece com ícone próprio, abre sem barra do navegador

**No Android (Chrome):**
1. Acesse o site
2. Toque no menu (⋮) → "Instalar app" ou "Adicionar à tela inicial"
3. O app vira um atalho com ícone próprio

Quando aberto via PWA, o app:
- Inicia direto em `/dashboard` (pula a tela do navegador)
- Tem barra de status escura combinando com o tema dark
- Funciona em tela cheia (`display: standalone`)
- Tem ícone próprio (em `public/icon-192.png` e `icon-512.png`)

### Personalizar os ícones (opcional)

Os ícones gerados são básicos (símbolo $ em gradiente). Para usar logo própria:

1. Crie/edite duas imagens PNG quadradas:
   - `public/icon-192.png` (192×192)
   - `public/icon-512.png` (512×512)
2. Recomendado: use [maskable.app](https://maskable.app) para garantir compatibilidade com Android adaptive icons
3. Faça novo deploy

### Breakpoints

| Largura | Layout |
|---------|--------|
| < 768px | Mobile: 1-2 colunas, scroll horizontal em tabs/meses, cards no lugar de tabelas |
| ≥ 768px | Tablet/Desktop: layout completo com tabela, múltiplas colunas, hovers |
