# 🔥 FundiVR Training Simulator

![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-purple?style=for-the-badge&logo=vite)
![Fastify](https://img.shields.io/badge/Fastify-5.0-black?style=for-the-badge&logo=fastify)
![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

> Simulador web interativo para treinamento imersivo e seguro de operadores de fornos de fusão de alumínio.

O **FundiVR** emula a cabine e os procedimentos de um forno de fusão, focando no desenvolvimento da tomada de decisão e agilidade de reação sob pressão. O sistema registra cada ação do usuário, processando acertos e falhas através de um motor de regras inteligente.

---

## 🎭 Modo Demo (Apresentações Offline)

Pensando em estabilidade para palestras, bancas ou reuniões sem depender de conexão com banco de dados, o projeto possui um **Modo Demo**.
Quando ativado, o Frontend é capaz de rodar **100% isolado**, simulando delays de rede e forjando todas as respostas da API dinamicamente.

Para ativar no seu ambiente local ou em produção, basta definir a seguinte variável de ambiente no frontend:

```env
VITE_DEMO_MODE=true
```

_(Um discreto aviso visual será exibido no canto inferior direito da HUD confirmando que a telemetria é simulada)._

---

## 🚀 Deploy Rápido no Vercel (Frontend)

O FundiVR foi arquitetado para ter o frontend facilmente publicado no Vercel, ideal para demonstrações do Modo Demo.

### Passo a passo para o Deploy:

1. Faça o commit e push do seu código para o GitHub.
2. Acesse o [Vercel](https://vercel.com/) e clique em **Add New > Project**.
3. Importe o repositório `fundivr-training-simulator`.
4. Em **Root Directory**, clique em `Edit` e selecione a pasta `apps/web`.
5. Abra a aba **Environment Variables** e adicione:
   - Name: `VITE_DEMO_MODE`
   - Value: `true`
6. Clique em **Deploy**! 🚀

Em menos de 1 minuto, você terá uma URL pública e funcional do seu simulador para rodar de qualquer tablet ou notebook.

---

## 📐 Arquitetura

```
fundivr-training-simulator/
│
├── apps/
│   ├── web/          → Frontend (React + Vite + TailwindCSS)
│   └── api/          → Backend (Fastify + Prisma + PostgreSQL)
│
├── packages/
│   ├── shared-types/   → Interfaces TypeScript compartilhadas
│   ├── shared-schemas/ → Schemas Zod de validação
│   └── config/         → Constantes e configuração compartilhada
│
├── docker/           → Configurações Docker auxiliares
├── docs/             → Documentação do projeto
└── docker-compose.yml
```

O projeto utiliza **pnpm workspaces** como monorepo, permitindo compartilhar tipos, schemas e configuração entre frontend e backend.

---

## 🛠 Stack Tecnológica

### Frontend

| Tecnologia             | Uso                                |
| ---------------------- | ---------------------------------- |
| React 18               | UI Library                         |
| TypeScript             | Tipagem estática                   |
| Vite                   | Build tool                         |
| TailwindCSS 3          | Estilização                        |
| Zustand                | Estado global                      |
| React Query (TanStack) | Gerenciamento de dados assíncronos |
| Axios                  | HTTP client                        |
| React Router DOM       | Roteamento                         |
| Framer Motion          | Animações                          |
| Recharts               | Gráficos                           |
| Zod                    | Validação                          |

### Backend

| Tecnologia    | Uso                       |
| ------------- | ------------------------- |
| Node.js 20    | Runtime                   |
| TypeScript    | Tipagem estática          |
| Fastify 5     | HTTP Framework            |
| Prisma 6      | ORM                       |
| PostgreSQL 15 | Banco de dados            |
| Zod           | Validação de schemas      |
| WebSocket     | Comunicação em tempo real |

### Testes

| Tecnologia | Uso             |
| ---------- | --------------- |
| Vitest     | Test runner     |
| Supertest  | HTTP assertions |

### Infra

| Tecnologia     | Uso                |
| -------------- | ------------------ |
| Docker         | Containerização    |
| Docker Compose | Orquestração local |
| pnpm           | Package manager    |
| Husky          | Git hooks          |
| lint-staged    | Linting pre-commit |
| ESLint         | Linter             |
| Prettier       | Formatador         |

---

## 🚀 Instalação

### Pré-requisitos

- Node.js ≥ 20
- pnpm ≥ 9
- Docker e Docker Compose (para execução com containers)

### Setup local

```bash
# 1. Clone o repositório
git clone <url-do-repositório>
cd fundivr-training-simulator

# 2. Instale as dependências
pnpm install

# 3. Copie o arquivo de ambiente da API
cp apps/api/.env.example apps/api/.env

# 4. Gere o Prisma Client
pnpm db:generate

# 5. Inicie o PostgreSQL (via Docker)
docker compose up postgres -d

# 6. Execute as migrations
pnpm db:migrate

# 7. Inicie o projeto (frontend + backend)
pnpm dev
```

### Portas padrão

| Serviço           | Porta  |
| ----------------- | ------ |
| Frontend (Vite)   | `5173` |
| Backend (Fastify) | `3001` |
| PostgreSQL        | `5432` |

---

## 🐳 Docker

Suba todos os serviços com um único comando:

```bash
docker compose up
```

Isso irá iniciar:

- **PostgreSQL** na porta 5432
- **API** na porta 3001
- **Web** na porta 5173

Para rebuild completo:

```bash
docker compose up --build
```

Para parar:

```bash
docker compose down
```

Para remover volumes (dados do banco):

```bash
docker compose down -v
```

---

## 📝 Scripts Disponíveis

### Raiz do monorepo

| Comando            | Descrição                             |
| ------------------ | ------------------------------------- |
| `pnpm dev`         | Inicia frontend e backend em paralelo |
| `pnpm build`       | Build de produção (packages + apps)   |
| `pnpm lint`        | Executa ESLint em todos os projetos   |
| `pnpm format`      | Formata código com Prettier           |
| `pnpm test`        | Executa testes em todos os projetos   |
| `pnpm db:generate` | Gera o Prisma Client                  |
| `pnpm db:migrate`  | Executa migrations do Prisma          |
| `pnpm db:studio`   | Abre o Prisma Studio                  |
| `pnpm clean`       | Remove node_modules e dist            |

### API (`apps/api`)

| Comando                | Descrição                                  |
| ---------------------- | ------------------------------------------ |
| `pnpm dev`             | Inicia servidor com hot-reload (tsx watch) |
| `pnpm build`           | Compila TypeScript                         |
| `pnpm test`            | Executa testes com Vitest                  |
| `pnpm prisma:generate` | Gera Prisma Client                         |
| `pnpm prisma:migrate`  | Executa migrations                         |
| `pnpm prisma:studio`   | Abre Prisma Studio                         |

### Web (`apps/web`)

| Comando        | Descrição              |
| -------------- | ---------------------- |
| `pnpm dev`     | Inicia Vite dev server |
| `pnpm build`   | Build de produção      |
| `pnpm preview` | Preview do build       |
| `pnpm lint`    | ESLint                 |

---

## 📂 Estrutura de Pastas

```
fundivr-training-simulator/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Modelos do banco
│   │   ├── src/
│   │   │   ├── config/               # Variáveis de ambiente
│   │   │   ├── database/             # Prisma client
│   │   │   ├── middlewares/           # Middlewares Fastify
│   │   │   ├── modules/              # Módulos de domínio
│   │   │   ├── routes/               # Rotas HTTP
│   │   │   ├── schemas/              # Schemas de validação
│   │   │   ├── services/             # Serviços de negócio
│   │   │   ├── tests/                # Testes automatizados
│   │   │   ├── utils/                # Utilitários
│   │   │   ├── websocket/            # WebSocket handlers
│   │   │   ├── app.ts                # Fastify app factory
│   │   │   └── server.ts             # Entrypoint
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── assets/               # Imagens e recursos
│       │   ├── components/           # Componentes reutilizáveis
│       │   ├── features/             # Features do domínio
│       │   ├── hooks/                # Custom hooks
│       │   ├── layouts/              # Layouts de página
│       │   ├── pages/                # Páginas/views
│       │   ├── routes/               # Configuração de rotas
│       │   ├── schemas/              # Schemas locais
│       │   ├── services/             # API client (Axios)
│       │   ├── stores/               # Zustand stores
│       │   ├── types/                # Tipos locais
│       │   ├── App.tsx               # Root component
│       │   ├── main.tsx              # Entrypoint
│       │   └── index.css             # Estilos globais + Tailwind
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared-types/                 # Interfaces TypeScript
│   ├── shared-schemas/               # Schemas Zod
│   └── config/                       # Constantes compartilhadas
│
├── docker/
│   └── .env.example                  # Template de env para Docker
│
├── docs/                             # Documentação
├── .editorconfig
├── .eslintrc.cjs
├── .gitignore
├── .husky/
├── .prettierrc
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

## 🗄 Modelos do Banco (Prisma)

| Model             | Descrição                            |
| ----------------- | ------------------------------------ |
| `Student`         | Aluno/operador cadastrado            |
| `TrainingSession` | Sessão de treinamento                |
| `Event`           | Evento registrado durante a sessão   |
| `Occurrence`      | Ocorrência (info, warning, critical) |

---

## 🔗 Endpoints

### REST API

| Método | Rota      | Descrição    |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

### WebSocket

| Rota            | Descrição                |
| --------------- | ------------------------ |
| `/ws/telemetry` | Telemetria em tempo real |

---

## ✅ Status do Projeto (Sprint 1 Concluída)

- [x] Arquitetura de Monorepo configurada
- [x] Banco de dados e ORM integrados
- [x] API RESTful e persistência de dados
- [x] Sistema de pontuação / scoring dinâmico
- [x] Simulador Interativo (Vestiário, Inspeção, Fusão, Escumação, Emergência)
- [x] Dashboards de Debriefing e Gráfico Radar
- [x] Modo Demo / Mock Offline (Para Apresentações em Vercel)

---

## 👥 Equipe

Projeto acadêmico — FundiVR Training Simulator

---

## 📄 Licença

Este projeto é de uso acadêmico.
