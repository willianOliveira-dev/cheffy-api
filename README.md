<div align="center">
  <img src="src/public/cheffy-presentation.svg"
       alt="Cheffy API" width="220" />

  <h1>Cheffy API</h1>
  <p>Backend RESTful para uma plataforma de receitas culinárias — construído com autenticação, nutrição, favoritos, upload de imagens e assistente gastronômico com IA</p>

  ![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=nodedotjs)
  ![Hono](https://img.shields.io/badge/Hono-4.x-E36002?style=flat-square)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
  ![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma)
  ![Better Auth](https://img.shields.io/badge/Better_Auth-Sessions-FF6B6B?style=flat-square)
  ![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=flat-square&logo=cloudinary)
  ![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square)
</div>

---

### 2. Visão Geral

A **Cheffy API** é um projeto desenvolvido para faculdade, com foco em tecnologia aplicada à alimentação consciente, saúde e organização culinária.

A **Cheffy API** é o backend central de uma aplicação de receitas, projetado para gerenciar catálogo culinário, categorias, tags, ingredientes, informações nutricionais, favoritos de usuário, autenticação via Better Auth, assinatura de upload no Cloudinary e um assistente gastronômico integrado à Groq.

O projeto possui maior aderência ao **ODS 3 — Saúde e Bem-Estar**, contribuindo para a promoção de hábitos alimentares mais conscientes ao organizar receitas, ingredientes, etapas de preparo e informações nutricionais. Também se relaciona ao **ODS 12 — Consumo e Produção Responsáveis**, ao permitir melhor aproveitamento de ingredientes e adaptação de receitas por meio de um assistente gastronômico com inteligência artificial. Como apoio tecnológico, o Cheffy ainda dialoga com o **ODS 9 — Indústria, Inovação e Infraestrutura**, por utilizar uma arquitetura digital moderna, documentada e escalável.

O serviço expõe uma API HTTP com documentação OpenAPI gerada por schemas Zod e renderizada via Scalar. A aplicação foi pensada para sustentar uma experiência frontend/mobile onde a Home, listagens, detalhes de receita e favoritos já chegam com payloads prontos para renderização.
<br/>
[🔗 Acessar API Reference local (http://localhost:8000/docs)](http://localhost:8000/docs)

---

### 3. Decisões Técnicas

- **Por que Hono e não Express ou NestJS?**
  **Escolha:** Hono com `@hono/node-server` e `@hono/zod-openapi`.
  **Motivo:** Hono entrega uma camada HTTP enxuta, rápida e direta, com boa ergonomia para middlewares, cookies, SSE e OpenAPI. Express exigiria mais composição manual para validação e documentação. NestJS adicionaria uma estrutura pesada para o tamanho e objetivo do projeto, com decorators e abstrações que aumentariam o custo de manutenção.

- **Por que Prisma e não SQL manual?**
  **Escolha:** Prisma 7 com PostgreSQL e `@prisma/adapter-pg`.
  **Motivo:** O domínio possui muitas relações: receitas, seções, ingredientes, passos, tags, favoritos, views, nutrição e tabelas do Better Auth. Prisma mantém essas relações legíveis, tipadas e seguras, reduzindo risco em updates transacionais como favoritar/desfavoritar e recalcular `totalFavorites`.

- **Por que Better Auth e não JWT manual?**
  **Escolha:** Better Auth com adapter Prisma e provider Google.
  **Motivo:** Sessão stateful, integração OAuth e geração de OpenAPI de autenticação ficam isoladas em uma lib framework-agnostic. JWT manual exigiria revogação, rotação, cookies e OAuth callbacks implementados na mão.

- **Por que Groq para IA e não IA local?**
  **Escolha:** Groq SDK com modelo configurável via `GROQ_MODEL`.
  **Motivo:** O deploy fica leve, sem depender de Ollama ou GPU local. A API consegue usar streaming SSE e respostas rápidas para o assistente gastronômico, mantendo o mesmo endpoint consumido pelo frontend.

- **Por que Cloudinary e não upload pass-through pelo Node?**
  **Escolha:** Assinatura de upload gerada pelo backend e envio direto do frontend ao Cloudinary.
  **Motivo:** O backend não precisa receber arquivos pesados. Ele assina parâmetros seguros, restringe os diretórios (`cheffy/recipes`, `cheffy/ingredients`, `cheffy/categories`) e deixa processamento/CDN/transformação com o Cloudinary.

- **Por que arquitetura modular e não MVC global?**
  **Escolha:** Módulos verticais em `src/modules`.
  **Motivo:** Cada domínio mantém suas rotas, controllers, services, repositories, DTOs e responses próximos. Isso reduz acoplamento e facilita evoluir receitas, ingredientes, IA, usuários e storage sem um diretório global de controllers gigantes.

- **Por que Zod em todos os contratos?**
  **Escolha:** DTOs e responses com Zod/OpenAPI.
  **Motivo:** A mesma definição valida entrada, parseia query params, documenta a API e ajuda o Orval/frontend a gerar tipos coerentes com o backend.

---

### 4. Arquitetura

```text
src/
├── app.ts                 # Bootstrap do Hono, middlewares globais, CORS e erros
├── server.ts              # Inicialização do servidor HTTP
├── config/                # Validação de ambiente via Zod
├── global/                # Error handler global
├── hooks/                 # Validation hook padrão do OpenAPIHono
├── lib/
│   ├── auth/              # Instância Better Auth e provider Google
│   └── db/                # Prisma Client com adapter pg
├── middlewares/           # Autenticação e variáveis de sessão
├── shared/                # Errors, types e utils reutilizáveis
└── modules/               # Verticais de negócio
    ├── auth               # Proxy Better Auth
    ├── home               # Home, categorias de destaque e seções de receita
    ├── recipes            # CRUD, favoritos, views e nutrição por receita
    ├── ingredients        # Ingredientes e tabela nutricional por 100g
    ├── categories         # Categorias culinárias
    ├── tags               # Tags culinárias
    ├── users              # Perfil e favoritos do usuário
    ├── storage            # Assinatura Cloudinary
    ├── ai                 # Assistente gastronômico via Groq
    └── swagger            # OpenAPI / Scalar docs
```

**Fluxo end-to-end de uma requisição API:**
1. **Request** → Chega no Hono e passa por logger, timing, secure headers e CORS.
2. **Route** → `@hono/zod-openapi` valida `params`, `query` e `body`.
3. **Middleware** → Rotas privadas usam `authenticateMiddleware`, que resolve sessão pelo Better Auth.
4. **Controller** → Camada fina que delega a regra para o service.
5. **Service** → Aplica regra de negócio, paginação, cálculo de favoritos e validações de domínio.
6. **Repository** → Executa consultas Prisma e transações no PostgreSQL.
7. **Response** → Zod parseia o payload final antes de responder.

**Fluxo de favoritos:**
1. Usuário chama `POST /api/v1/recipes/{id}/favorite`.
2. Backend valida sessão, garante que a receita existe e cria registro em `favorites`.
3. Em transação, recalcula `totalFavorites` usando `favorite.count`.
4. Listagens como Home, Receitas e Meus Favoritos calculam `isFavorited` consultando a tabela `favorites`, sem valor hardcoded.

**Fluxo do assistente gastronômico:**
1. Frontend chama `POST /api/v1/ai/recipes/{recipeId}/assistant` ou `/stream`.
2. Backend carrega o contexto completo da receita e o usuário autenticado.
3. Prompt service monta mensagens em português com restrições culinárias e contexto da receita atual.
4. Groq responde em texto normal ou tokens SSE para streaming.

**Fluxo de upload no Cloudinary:**
1. Frontend chama `POST /api/v1/storage/sign`.
2. Backend gera assinatura SHA-1 com timestamp, folder e `public_id`.
3. Frontend envia a imagem direto ao Cloudinary.
4. Backend mantém apenas `imageUrl` e `imagePublicId` nas entidades.

---

### 5. Módulos da API

*(Rotas de negócio utilizam o prefixo `/api/v1`; autenticação fica em `/api/auth`.)*

#### Módulo: Auth
Gerenciamento de sessão delegado ao Better Auth.
**Prefixo:** `/api/auth`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| ALL | `/*` | ❌ | Proxy dos endpoints internos do Better Auth |
| GET | `/open-api/generate-schema` | ❌ | Schema OpenAPI gerado pelo Better Auth |

#### Módulo: Home
**Prefixo:** `/api/v1/home`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/home` | Opcional | Retorna categorias do header, destaques semanais, mais acessadas, featured e sabores favoritos |
| GET | `/home/categories/{slug}/recipes` | Opcional | Lista receitas publicadas por categoria com filtros, paginação e `isFavorited` quando houver sessão |

#### Módulo: Recipes
**Prefixo:** `/api/v1/recipes`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/recipes` | Opcional | Lista receitas com busca, filtros, paginação e marcação de favorito |
| GET | `/recipes/{id}` | Opcional | Detalhe completo da receita por UUID, registra view com controle de janela |
| GET | `/recipes/slug/{slug}` | Opcional | Detalhe completo da receita por slug |
| POST | `/recipes` | ✅ | Cria receita com seções, ingredientes, passos, tags e nutrição calculada |
| PUT | `/recipes/{id}` | ✅ | Atualiza receita e recalcula nutrição quando necessário |
| DELETE | `/recipes/{id}` | ✅ | Soft delete da receita e remoção do asset anterior no Cloudinary |
| POST | `/recipes/{id}/favorite` | ✅ | Favorita receita e recalcula `totalFavorites` |
| DELETE | `/recipes/{id}/favorite` | ✅ | Remove favorito e recalcula `totalFavorites` |

#### Módulo: Categories
**Prefixo:** `/api/v1/categories`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/categories` | ❌ | Lista categorias com busca, paginação e ordenação |
| GET | `/categories/{id}` | ❌ | Busca categoria por UUID |
| GET | `/categories/slug/{slug}` | ❌ | Busca categoria por slug |
| POST | `/categories` | ✅ | Cria categoria com slug único |
| PATCH | `/categories/{id}` | ✅ | Atualiza categoria e remove imagem substituída |
| DELETE | `/categories/{id}` | ✅ | Remove categoria sem receitas associadas |

#### Módulo: Tags
**Prefixo:** `/api/v1/tags`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/tags` | ❌ | Lista tags com busca e paginação |
| GET | `/tags/{id}` | ❌ | Busca tag por UUID |
| GET | `/tags/slug/{slug}` | ❌ | Busca tag por slug |
| POST | `/tags` | ✅ | Cria tag com slug único |
| PATCH | `/tags/{id}` | ✅ | Atualiza tag |
| DELETE | `/tags/{id}` | ✅ | Remove tag |

#### Módulo: Ingredients
**Prefixo:** `/api/v1/ingredients`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/ingredients` | ❌ | Lista ingredientes com busca, categoria e paginação |
| GET | `/ingredients/{id}` | ❌ | Busca ingrediente por UUID |
| POST | `/ingredients` | ✅ | Cria ingrediente e nutrição padrão quando ausente |
| PATCH | `/ingredients/{id}` | ✅ | Atualiza ingrediente e imagem |
| DELETE | `/ingredients/{id}` | ✅ | Remove ingrediente |
| GET | `/ingredients/{id}/nutrition` | ❌ | Retorna valores nutricionais por 100g |
| PUT | `/ingredients/{id}/nutrition` | ✅ | Cria ou substitui nutrição do ingrediente |
| PATCH | `/ingredients/{id}/nutrition` | ✅ | Atualiza parcialmente a nutrição |

#### Módulo: Users
**Prefixo:** `/api/v1/me`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/me` | ✅ | Retorna usuário autenticado |
| GET | `/me/favorites` | ✅ | Lista receitas favoritas com busca, paginação, ordenação e `isFavorited` vindo do banco |

#### Módulo: Storage
**Prefixo:** `/api/v1/storage`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/storage/sign` | ✅ | Gera assinatura segura para upload direto no Cloudinary |

#### Módulo: AI
**Prefixo:** `/api/v1/ai`

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/ai/recipes/{recipeId}/assistant` | ✅ | Resposta JSON do assistente gastronômico da receita atual |
| POST | `/ai/recipes/{recipeId}/assistant/stream` | ✅ | Resposta em SSE tokenizada para experiência em tempo real |

---

### 6. Schema do Banco de Dados

`Prisma ORM via PostgreSQL`

#### `recipes`
Entidade central do domínio culinário.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Primary key da receita |
| `title` | varchar | Nome da receita |
| `slug` | string unique | Identificador amigável para URL |
| `description` | varchar | Resumo da receita |
| `prepTime` / `cookTime` / `totalTime` | integer | Tempos em minutos |
| `yieldAmount` / `yieldUnit` | enum | Rendimento e unidade de porção |
| `difficulty` | enum | Nível de dificuldade |
| `isPublished` / `isFeatured` | boolean | Controle de exibição |
| `views` / `totalFavorites` | integer | Métricas mantidas pelo backend |

#### `recipe_sections`, `recipe_section_ingredients`, `preparation_steps`
Modelam a receita em blocos estruturados.

| Tabela | Papel |
|--------|------|
| `recipe_sections` | Agrupa ingredientes e passos por seção |
| `recipe_section_ingredients` | Liga ingredientes à seção com quantidade, gramas, unidade e notas |
| `preparation_steps` | Mantém modo de preparo ordenado |

#### `ingredients` & `ingredient_nutritions`
Base nutricional reutilizável para cálculo de receitas.

| Tabela | Papel |
|--------|------|
| `ingredients` | Cadastro de ingredientes, categoria e imagem |
| `ingredient_nutritions` | Valores por 100g: kcal, carboidratos, açúcares, proteína, gorduras, fibra e sódio |

#### `recipe_nutrition_labels`
Tabela nutricional calculada por receita.

| Campo | Descrição |
|-------|-----------|
| `totalWeightInGrams` | Peso total aproximado da receita |
| `servingWeightInGrams` | Peso por porção |
| `energyKcalPer100g` / `energyKcalPerServing` | Calorias por 100g e por porção |
| `dailyValuePercent` fields | Percentuais aproximados de valor diário |
| `isApproximate` | Indica ausência parcial de dados nutricionais |

#### `favorites` & `recipe_views`
Entidades de interação do usuário.

| Tabela | Papel |
|--------|------|
| `favorites` | Relação única `userId + recipeId`, usada para `isFavorited` e contagem |
| `recipe_views` | Registra visualizações por usuário ou visitante, com janela de 24h |

#### Better Auth
Tabelas de autenticação geridas pelo Better Auth:

```text
user
session
account
verification
```

Essas tabelas armazenam usuários, sessões, contas OAuth e verificações. O domínio Cheffy referencia `user.id` como autor da receita e proprietário de favoritos/views.

---

### 7. Variáveis de Ambiente

As variáveis são validadas em `src/config/env.ts` com Zod. Use o `.env.example` como base e nunca versione segredos reais.

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NODE_ENV` | ❌ | Ambiente da aplicação: `development`, `test` ou `production` |
| `BASE_URL` | ✅ | URL pública da API, usada também na documentação OpenAPI |
| `API_VERSION` | ✅ | Versão exibida no schema OpenAPI |
| `PORT` | ❌ | Porta do servidor. Default: `8000` |
| `ALLOWED_ORIGINS` | ❌ | Lista CSV de origens liberadas no CORS e Better Auth |
| `DATABASE_USER` | ❌ | Usuário do Postgres local via Docker Compose |
| `DATABASE_PASSWORD` | ❌ | Senha do Postgres local via Docker Compose |
| `DATABASE_DB` | ❌ | Nome do banco local via Docker Compose |
| `DATABASE_URL` | ✅ | Connection URI do PostgreSQL local, Neon ou outro provider |
| `GOOGLE_CLIENT_ID` | ✅ | Client ID do Google OAuth |
| `GOOGLE_CLIENT_SECRET` | ✅ | Secret do Google OAuth |
| `BETTER_AUTH_URL` | ✅ | URL base do Better Auth para callbacks e cookies |
| `BETTER_AUTH_SECRET` | ✅ | Secret para assinatura/cripto de sessão |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloud name do Cloudinary |
| `CLOUDINARY_API_KEY` | ✅ | API key do Cloudinary |
| `CLOUDINARY_API_SECRET` | ✅ | API secret usado para assinar uploads |
| `GROQ_API_KEY` | ✅ | Chave da API Groq |
| `GROQ_MODEL` | ❌ | Modelo usado pelo assistente. Default: `llama-3.3-70b-versatile` |
| `GROQ_TIMEOUT_MS` | ❌ | Timeout das chamadas Groq. Default: `30000` |
| `FRONTEND_URL` | ✅ | URL pública do frontend |

---

### 8. Como Rodar Localmente

#### Pré-requisitos

- Node.js 24+
- pnpm 10+
- PostgreSQL local ou Neon
- Conta Google Cloud OAuth
- Conta Cloudinary
- Chave Groq

#### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/willianOliveira-dev/cheffy-api.git
cd cheffy-api

# 2. Instale dependências
pnpm install

# 3. Crie seu arquivo de ambiente
cp .env.example .env

# 4. Suba o Postgres local, se for usar docker-compose
docker compose up -d db

# 5. Rode as migrations locais
pnpm db:migrate

# 6. Popule o banco com categorias, ingredientes, nutrição e receitas
pnpm db:seed

# 7. Inicie em modo desenvolvimento
pnpm dev
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

#### Rodar build local

```bash
pnpm build
pnpm start:local
```

> `pnpm start` é o comando de produção e espera variáveis já injetadas pelo ambiente. Para rodar localmente com `.env`, use `pnpm start:local`.

---

### 9. Como Rodar em Produção (Docker / Render)

O projeto possui um `Dockerfile` multi-stage baseado em `node:24-slim`. O build gera o Prisma Client, compila TypeScript para `dist/` e a imagem final executa:

```bash
pnpm render:start
```

Esse comando aplica migrations de produção, roda seed e inicia a API:

```bash
pnpm db:deploy && pnpm db:seed:deploy && pnpm start
```

#### Render

Ao criar o serviço no Render:

- **Environment:** Docker
- **Dockerfile:** `Dockerfile`
- **Port:** `8000`
- **Environment Variables:** configure todas as variáveis do `.env.example`

Variáveis críticas no Render:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
BASE_URL=https://sua-api.onrender.com
BETTER_AUTH_URL=https://sua-api.onrender.com
ALLOWED_ORIGINS=https://seu-frontend.vercel.app
FRONTEND_URL=https://seu-frontend.vercel.app
```

> Não coloque `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `CLOUDINARY_API_SECRET` ou `GROQ_API_KEY` no código. Use sempre o painel de variáveis do Render.

---

### 10. Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor em TypeScript com watch e `.env` |
| `pnpm build` | Compila TypeScript para `dist/` e resolve aliases ESM |
| `pnpm start` | Executa build em modo produção, sem carregar `.env` |
| `pnpm start:local` | Executa build local carregando `.env` |
| `pnpm typecheck` | Valida TypeScript sem emitir arquivos |
| `pnpm lint` | Executa Biome lint |
| `pnpm format` | Formata arquivos em `src/` |
| `pnpm check` | Aplica check/fix do Biome em `src/` |
| `pnpm db:generate` | Gera Prisma Client usando `.env` local |
| `pnpm db:migrate` | Cria/aplica migration em desenvolvimento |
| `pnpm db:deploy` | Aplica migrations em produção |
| `pnpm db:seed` | Popula banco local |
| `pnpm db:seed:deploy` | Popula banco em produção |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm db:reset` | Reseta banco local e reaplica migrations |
| `pnpm render:start` | Migration + seed + start para Render/Docker |

---

### 11. Testes com cURL

#### Listar receitas publicadas

```bash
curl "http://localhost:8000/api/v1/recipes?page=1&limit=10&search=bolo"
```

#### Buscar dados da Home

```bash
curl "http://localhost:8000/api/v1/home"
```

#### Listar favoritos do usuário autenticado

```bash
curl "http://localhost:8000/api/v1/me/favorites?page=1&limit=10&search=frango" \
  -H "Cookie: better-auth.session_token=..."
```

#### Assinar upload no Cloudinary

```bash
curl -X POST "http://localhost:8000/api/v1/storage/sign" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=..." \
  -d '{"target":"recipes","entityId":"550e8400-e29b-41d4-a716-446655440000"}'
```

#### Perguntar ao assistente gastronômico

```bash
curl -X POST "http://localhost:8000/api/v1/ai/recipes/RECIPE_UUID/assistant" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=..." \
  -d '{"message":"Como deixo essa receita mais leve?","measurePreference":"grams"}'
```

---

### 12. Dados de Seed

O seed em `prisma/seed.ts` cria uma base inicial rica para demonstração:

- autor demo `chef.demo@cheffy.local`
- categorias culinárias
- tags como Brasileira, Fitness, Vegana, Italiana e outras
- ingredientes com informações nutricionais aproximadas por 100g
- receitas brasileiras e internacionais publicadas
- tabelas nutricionais calculadas por receita

Não há credenciais de login com senha no seed, porque a autenticação está configurada via Better Auth e Google OAuth.

---

### 13. Licença e Autor

## Autor

**Willian Oliveira**

[![GitHub](https://img.shields.io/badge/GitHub-willianOliveira--dev-181717?style=flat-square&logo=github)](https://github.com/willianOliveira-dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Willian_Oliveira-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/willian-oliveira-66a230353/)
