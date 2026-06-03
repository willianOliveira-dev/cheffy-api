<div align="center">
  <img src="src/public/cheffy-presentation.svg" alt="Cheffy API" width="220" />

  <h1>Cheffy API</h1>
  <p>Backend REST para uma plataforma de receitas com autenticação, favoritos, nutrição, upload de imagens e assistente gastronômico com IA.</p>

  ![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=nodedotjs)
  ![Hono](https://img.shields.io/badge/Hono-4.x-E36002?style=flat-square)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql)
  ![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma)
</div>

## Sobre

A Cheffy API centraliza o catálogo de receitas, ingredientes, categorias, tags, favoritos, uploads e recursos de IA da aplicação.

O serviço usa contratos Zod/OpenAPI para validar entrada e saída, além de manter a documentação em `/docs` para consumo humano e geração de clients no frontend.

Links locais:

- API: `http://localhost:8000`
- Health: `http://localhost:8000/api/v1/health`
- OpenAPI JSON: `http://localhost:8000/doc`
- API Reference: `http://localhost:8000/docs`

## Stack

- **Runtime:** Node.js 24
- **HTTP:** Hono
- **Contratos:** Zod + OpenAPI
- **Banco:** PostgreSQL 18
- **ORM:** Prisma 7
- **Auth:** Better Auth
- **Storage:** Cloudinary
- **IA:** Groq

## Como Rodar

Pré-requisitos:

- Node.js 22 ou superior
- pnpm 9 ou superior
- Docker, caso use o banco local via `docker-compose`

```bash
pnpm install
cp .env.example .env
docker compose up -d db
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Para rodar a versão compilada:

```bash
pnpm build
pnpm start:local
```

O `docker-compose.yml` usa PostgreSQL 18 e monta o volume em `/var/lib/postgresql`, que é o layout esperado pelas imagens atuais do Postgres.

## Variáveis de Ambiente

Use `.env.example` como base. As principais variáveis são:

- `DATABASE_URL`
- `BASE_URL`
- `PORT`
- `ALLOWED_ORIGINS`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `FRONTEND_URL`

## Organização

```text
src/
├── app.ts                 # App Hono, middlewares globais e rotas
├── server.ts              # Inicialização HTTP
├── config/                # Ambiente
├── global/                # Tratamento global de erros
├── hooks/                 # Hook de validação
├── lib/                   # Auth e Prisma
├── middlewares/           # Middlewares da aplicação
├── shared/                # Erros, tipos e utilitários
└── modules/               # Módulos de negócio
```

Cada módulo segue a ideia:

```text
routes -> controllers -> services -> repositories
schemas/dtos -> entrada
schemas/responses -> saída
```

## Módulos da API

Rotas de negócio usam o prefixo `/api/v1`. A autenticação do Better Auth fica em `/api/auth`.

| Módulo | Rotas principais | Descrição |
|--------|------------------|-----------|
| Auth | `/api/auth/*` | Sessão, OAuth e endpoints internos do Better Auth |
| Home | `/api/v1/home` | Dados prontos para a tela inicial |
| Recipes | `/api/v1/recipes` | Catálogo público de receitas publicadas |
| My Recipes | `/api/v1/me/recipes` | Receitas criadas pelo usuário autenticado |
| Users | `/api/v1/me`, `/api/v1/me/favorites` | Perfil e favoritos |
| Ingredients | `/api/v1/ingredients` | Ingredientes e dados nutricionais |
| Categories | `/api/v1/categories` | Categorias culinárias |
| Tags | `/api/v1/tags` | Tags culinárias |
| Storage | `/api/v1/storage/sign` | Assinatura para upload direto no Cloudinary |
| AI | `/api/v1/ai/recipes/{recipeId}/assistant` | Assistente gastronômico |

## Receitas

O catálogo público retorna apenas receitas com:

- `deletedAt = null`
- `isPublished = true`

Endpoints públicos:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/recipes` | Lista receitas publicadas |
| GET | `/api/v1/recipes/{id}` | Detalhe público por ID |
| GET | `/api/v1/recipes/slug/{slug}` | Detalhe público por slug |
| POST | `/api/v1/recipes/{id}/favorite` | Favorita uma receita publicada |
| DELETE | `/api/v1/recipes/{id}/favorite` | Remove uma receita dos favoritos |

## Receitas do Usuário

Usuários autenticados podem criar e gerenciar as próprias receitas em `/api/v1/me/recipes`.

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/me/recipes` | Lista minhas receitas com paginação e filtros |
| GET | `/api/v1/me/recipes/{id}` | Busca uma receita minha |
| POST | `/api/v1/me/recipes` | Cria uma receita minha |
| PUT | `/api/v1/me/recipes/{id}` | Atualiza uma receita minha |
| DELETE | `/api/v1/me/recipes/{id}` | Remove uma receita minha com soft delete |

Receitas criadas por usuário nascem como rascunho:

- `isPublished = false`
- `authorId` vem da sessão
- o usuário não define `views`, `totalFavorites`, `isFeatured` ou `isPublished`

## Upload de Imagens

O backend não recebe arquivos diretamente. Ele assina o upload e o frontend envia a imagem ao Cloudinary.

Fluxo básico:

1. Chamar `POST /api/v1/storage/sign`.
2. Enviar a imagem direto para o `uploadUrl` retornado.
3. Salvar `secure_url` como `imageUrl`.
4. Salvar `public_id` como `imagePublicId`.

Targets aceitos:

- `recipes`
- `ingredients`
- `categories`

## Nutrição

Ingredientes possuem dados nutricionais por 100g. Ao criar ou editar uma receita, a API calcula a tabela nutricional com base nos ingredientes, quantidades em gramas e rendimento informado.

O frontend pode exibir uma prévia durante o preenchimento, mas a `nutritionLabel` retornada pela API após salvar é a fonte oficial.

## IA

O assistente gastronômico responde perguntas sobre uma receita existente. Há resposta JSON comum e resposta em streaming por SSE.

Rotas:

- `POST /api/v1/ai/recipes/{recipeId}/assistant`
- `POST /api/v1/ai/recipes/{recipeId}/assistant/stream`

## Comandos

```bash
pnpm dev          # desenvolvimento
pnpm build        # build TypeScript
pnpm start:local  # roda dist com .env local
pnpm typecheck    # checagem de tipos
pnpm lint         # lint com Biome
pnpm format       # formata src
pnpm db:generate  # gera Prisma Client
pnpm db:migrate   # migrations locais
pnpm db:seed      # dados iniciais
pnpm db:studio    # Prisma Studio
```

## Seed

O seed cria uma base inicial com autor, categorias, tags, ingredientes com nutrição e receitas publicadas para uso local.

```bash
pnpm db:seed
```

## Produção

O Dockerfile compila a aplicação, aplica migrations, roda seed de deploy e inicia o servidor:

```bash
pnpm render:start
```

## Autor

Desenvolvido por **Willian Oliveira**.
