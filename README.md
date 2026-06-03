<div align="center">
  <img src="src/public/cheffy-presentation.svg"
       alt="Cheffy API" width="220" />

  <h1>Cheffy API</h1>
  <p>Backend RESTful para uma plataforma de receitas culinárias — construído com autenticação, nutrição, favoritos, upload de imagens e assistente gastronômico com IA.</p>

  ![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=nodedotjs)
  ![Hono](https://img.shields.io/badge/Hono-4.x-E36002?style=flat-square)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql)
  ![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma)
  ![Better Auth](https://img.shields.io/badge/Better_Auth-Sessions-FF6B6B?style=flat-square)
  ![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?style=flat-square&logo=cloudinary)
  ![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square)
</div>

---

### 1. Visão Geral

A **Cheffy API** é um projeto desenvolvido com foco em tecnologia aplicada à alimentação consciente, saúde e organização culinária. É o backend central de uma aplicação de receitas, projetado para gerenciar o catálogo culinário, categorias, tags, ingredientes, informações nutricionais, favoritos de usuários, autenticação via Better Auth, uploads no Cloudinary e um assistente gastronômico integrado via Groq.

O projeto possui aderência ao **ODS 3 (Saúde e Bem-Estar)**, ajudando a promover hábitos alimentares mais conscientes ao organizar receitas e informações nutricionais. Também apoia o **ODS 12 (Consumo e Produção Responsáveis)**, permitindo melhor aproveitamento de ingredientes através do assistente com IA, e se baseia no **ODS 9 (Indústria, Inovação e Infraestrutura)** ao utilizar uma arquitetura escalável e documentada.

O serviço expõe uma API HTTP documentada via OpenAPI, utilizando schemas Zod e renderizada via Scalar. As respostas da API foram otimizadas para que o frontend já receba payloads prontos para renderização.

<br/>
[🔗 Acessar API Reference local (http://localhost:8000/docs)](http://localhost:8000/docs)

---

### 2. Decisões Técnicas

- **Hono (ao invés de Express/NestJS):** Entrega uma camada HTTP extremamente rápida e direta, com excelente suporte a middlewares, cookies e OpenAPI via `@hono/zod-openapi`. Frameworks maiores adicionariam um overhead desnecessário para o tamanho do projeto.
- **Prisma com PostgreSQL:** O domínio tem muitas relações (receitas, ingredientes, passos, favoritos, tabelas do Better Auth). O Prisma garante tipagem segura ponta a ponta e transações confiáveis, especialmente ao gerenciar métricas calculadas como `totalFavorites`.
- **Better Auth:** Abstrai totalmente a gestão de sessões stateful e a integração com Google OAuth. É framework-agnostic e isola a complexidade de tokens, rotação e cookies do domínio da aplicação.
- **Groq para IA:** Mantém a infraestrutura do backend leve. A API Groq permite respostas extremamente rápidas e suporte nativo a streaming via SSE para o assistente gastronômico, utilizando o modelo `llama-3.3-70b-versatile`.
- **Upload via Cloudinary (Assinaturas Seguras):** O backend não processa binários pesados. Ele gera uma assinatura segura e permite que o frontend envie a imagem diretamente para o Cloudinary, armazenando apenas o `imageUrl` e o `imagePublicId` no banco.
- **Zod em todos os contratos:** A mesma definição Zod valida a entrada (body/query), gera a especificação OpenAPI e formata os dados de saída, mantendo uma fonte única de verdade para tipagens e documentação.

---

### 3. Arquitetura e Organização

A arquitetura é modular por domínio, reduzindo o acoplamento global.

```text
src/
├── app.ts                 # Bootstrap do Hono, middlewares globais, CORS e error handler
├── server.ts              # Inicialização do servidor HTTP no Node
├── config/                # Validação de ambiente via Zod
├── global/                # Erros customizados
├── hooks/                 # Hook de validação OpenAPIHono
├── lib/
│   ├── auth/              # Better Auth config e providers
│   └── db/                # Prisma Client (adapter-pg)
├── middlewares/           # Middlewares (autenticação, timing)
├── shared/                # Tipos e utilitários reutilizáveis
└── modules/               # Verticais de negócio
    ├── auth               # Proxy do Better Auth
    ├── home               # Endpoints consolidados para a página inicial
    ├── recipes            # CRUD de receitas, views e nutrição
    ├── ingredients        # Tabela base e informações nutricionais por 100g
    ├── categories         # Categorias
    ├── tags               # Tags culinárias
    ├── users              # Perfil autenticado e favoritos
    ├── storage            # Assinaturas Cloudinary
    ├── ai                 # Assistente gastronômico (Groq)
    ├── health             # Endpoints de status
    └── swagger            # Documentação Scalar/OpenAPI
```

---

### 4. Principais Módulos

*(As rotas de negócio ficam em `/api/v1` e a autenticação em `/api/auth`)*

| Módulo | Endpoint Principal | Descrição |
|--------|--------------------|-----------|
| **Auth** | `/api/auth/*` | Gerenciamento de sessão pelo Better Auth. |
| **Home** | `/api/v1/home` | Retorna categorias em destaque e listas de receitas paginadas. |
| **Recipes** | `/api/v1/recipes` | Listagem pública, detalhes e controle de favoritos (`/api/v1/recipes/:id/favorite`). |
| **My Recipes** | `/api/v1/me/recipes` | Receitas criadas e gerenciadas pelo usuário. |
| **Users** | `/api/v1/me/favorites` | Receitas salvas pelo usuário autenticado. |
| **Ingredients** | `/api/v1/ingredients` | Cadastro base de ingredientes e seus dados nutricionais. |
| **Categories** | `/api/v1/categories` | Categorias culinárias. |
| **Tags** | `/api/v1/tags` | Tags para marcação de receitas. |
| **Storage** | `/api/v1/storage/sign` | Geração de assinatura para envio de imagens ao Cloudinary. |
| **AI** | `/api/v1/ai/recipes/:id/assistant` | Assistente via IA, com suporte a polling ou streaming (SSE). |

---

### 5. Lógica de Nutrição e Favoritos

- **Nutrição:** Os ingredientes possuem dados nutricionais por 100g. Quando uma receita é salva, a API calcula e gera uma `nutritionLabel` (calorias, carboidratos, proteínas, etc.) com base nas quantidades fornecidas e no rendimento total.
- **Favoritos:** Ao invés de recalcular em runtime, a tabela `favorites` atualiza um contador em batch (ou via transação) na tabela de receitas (`totalFavorites`), mantendo as consultas de listagem mais rápidas.

---

### 6. Como Rodar Localmente

#### Pré-requisitos
- Node.js 24+
- pnpm 9+
- Docker (opcional, para o banco local via `docker-compose`)

#### Configuração
```bash
# 1. Instale as dependências
pnpm install

# 2. Configure o ambiente
cp .env.example .env
# Preencha .env com credenciais do Google, Cloudinary e Groq

# 3. Suba o banco de dados via Docker (PostgreSQL 18)
docker compose up -d db

# 4. Aplique as migrations e popule o banco
pnpm db:migrate
pnpm db:seed

# 5. Inicie em modo desenvolvimento
pnpm dev
```

> **Sobre o Seed:** O banco será inicializado com um usuário de demonstração, tags, categorias, ingredientes e algumas receitas com valores nutricionais, facilitando testes locais.

#### Build e Produção (Local)
```bash
pnpm build
pnpm start:local
```

---

### 7. Variáveis de Ambiente

As configurações são validadas com Zod no arquivo `src/config/env.ts`.

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URI do PostgreSQL |
| `BASE_URL` | URL do backend (ex: `http://localhost:8000`) |
| `FRONTEND_URL` | URL permitida no CORS |
| `BETTER_AUTH_SECRET` | Chave de criptografia da sessão |
| `GOOGLE_CLIENT_ID` | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `CLOUDINARY_*` | Chaves do Cloudinary (`CLOUD_NAME`, `API_KEY`, `API_SECRET`) |
| `GROQ_API_KEY` | Chave da IA |
| `GROQ_MODEL` | Modelo Groq (default: `llama-3.3-70b-versatile`) |

---

### 8. Comandos Úteis

| Comando | Ação |
|---------|------|
| `pnpm dev` | Inicia servidor com recarregamento |
| `pnpm build` | Compila o projeto em `/dist` |
| `pnpm typecheck` | Checa erros de TypeScript |
| `pnpm lint` / `format` | Executa o Biome |
| `pnpm db:migrate` | Roda as migrations do Prisma |
| `pnpm db:studio` | Abre o painel do Prisma Studio |
| `pnpm db:reset` | Zera o banco e reaplica as migrations |

---

### 9. Deploy (Docker / Render)

O projeto usa um `Dockerfile` multi-stage focado em produção. No ambiente da Render, o serviço é iniciado usando o script de boot:

```bash
pnpm render:start
# O script executa: db:deploy -> db:seed:deploy -> start
```

---

### 10. Licença e Autor

## Autor

**Willian Oliveira**

[![GitHub](https://img.shields.io/badge/GitHub-willianOliveira--dev-181717?style=flat-square&logo=github)](https://github.com/willianOliveira-dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Willian_Oliveira-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/willian-oliveira-66a230353/)
