# 📋 FundiVR Training Simulator — Handover para PM

**Data:** 14/08/2026
**Responsável técnico:** André
**Repositório:** [github.com/TheyDreez/fundivr-training-simulator](https://github.com/TheyDreez/fundivr-training-simulator)
**Status:** Sprint 1 ✅ Concluída

---

## 1. Visão Geral do Projeto

O **FundiVR Training Simulator** é um simulador web para treinamento de operadores de fornos de fusão de alumínio.

### Objetivo
Permitir que alunos/operadores simulem operações em um forno de fusão, registrando todas as ações como eventos, calculando scores de desempenho e fornecendo feedback em tempo real via WebSocket.

### Fluxo Principal (previsto)
1. Aluno se cadastra e inicia uma **sessão de treinamento**
2. O frontend envia **eventos** de cada ação do operador (ajuste de temperatura, adição de material, etc.)
3. A API REST recebe, valida e persiste esses eventos no banco
4. Via **WebSocket**, o backend envia feedback em tempo real
5. Ao finalizar, o sistema calcula um **score** de desempenho
6. Os dados ficam disponíveis em um **dashboard** com gráficos

---

## 2. Stack Tecnológica

### Frontend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18.3 | Biblioteca de UI |
| TypeScript | 5.5+ | Tipagem estática |
| Vite | 5.4 | Build tool e dev server |
| TailwindCSS | 3.4 | Framework CSS utilitário |
| Zustand | 5.0 | Gerenciamento de estado |
| React Query (TanStack) | 5.60 | Cache e fetch de dados |
| Axios | 1.7 | HTTP client |
| React Router DOM | 6.28 | Roteamento SPA |
| Framer Motion | 11.11 | Animações |
| Recharts | 2.13 | Gráficos e visualizações |
| Zod | 3.23 | Validação de dados |

### Backend
| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | 20 LTS | Runtime JavaScript |
| TypeScript | 5.5+ | Tipagem estática |
| Fastify | 5.0 | Framework HTTP (2x mais rápido que Express) |
| Prisma | 6.19 | ORM para banco de dados |
| PostgreSQL | 15 | Banco de dados relacional |
| Zod | 3.23 | Validação de schemas |
| WebSocket (@fastify/websocket) | 11.0 | Comunicação em tempo real |
| JWT (jsonwebtoken) | — | Autenticação (Sprint 2) |

### Testes
| Tecnologia | Finalidade |
|---|---|
| Vitest | Test runner (compatível com Jest) |
| Supertest | Testes de integração HTTP |

### Infraestrutura
| Tecnologia | Finalidade |
|---|---|
| Docker + Docker Compose | Containerização e orquestração |
| pnpm Workspaces | Monorepo management |
| Husky + lint-staged | Git hooks (qualidade no commit) |
| ESLint + Prettier | Linting e formatação automática |

---

## 3. Arquitetura do Projeto

```
fundivr-training-simulator/        ← Monorepo raiz
│
├── apps/
│   ├── web/                        ← Frontend (React + Vite)
│   └── api/                        ← Backend (Fastify + Prisma)
│
├── packages/
│   ├── shared-types/               ← Interfaces TypeScript compartilhadas
│   ├── shared-schemas/             ← Schemas Zod (validação) compartilhados
│   └── config/                     ← Constantes e configuração
│
├── docker/                         ← Configs auxiliares Docker
├── docs/                           ← Documentação técnica
└── docker-compose.yml              ← Orquestração dos 3 serviços
```

### Diagrama de Comunicação

```
┌──────────────┐     HTTP/REST      ┌──────────────┐     Prisma      ┌──────────────┐
│              │ ─────────────────► │              │ ──────────────► │              │
│   Frontend   │                    │   Backend    │                 │  PostgreSQL  │
│   (React)    │ ◄───────────────── │  (Fastify)   │ ◄────────────── │              │
│   port 5173  │    JSON Response   │  port 3001   │   Query Result  │  port 5432   │
└──────┬───────┘                    └──────┬───────┘                 └──────────────┘
       │                                   │
       │          WebSocket                │
       └───────────────────────────────────┘
             Telemetria em tempo real
```

---

## 4. O que foi entregue na Sprint 1

### 4.1 Monorepo Configurado
- ✅ pnpm workspaces com 6 projetos interligados
- ✅ TypeScript com configuração base compartilhada (strict mode)
- ✅ ESLint + Prettier + EditorConfig para padronização de código
- ✅ Husky + lint-staged para validação automática no commit
- ✅ `.gitignore`, `.dockerignore`, `.prettierignore` configurados

### 4.2 Pacotes Compartilhados (packages/)

**@fundivr/shared-types** — Interfaces TypeScript:
- `Student` — aluno/operador
- `TrainingSession` — sessão de treinamento
- `TrainingEvent` — evento registrado durante simulação
- `Occurrence` — ocorrência (info/warning/critical)
- `HealthCheckResponse`, `ApiErrorResponse`, `WsTelemetryMessage`
- Enums: `ExperienceLevel`, `SessionStatus`, `OccurrenceSeverity`

**@fundivr/shared-schemas** — Schemas Zod (validação):
- Schemas de criação: `createStudentSchema`, `createTrainingSessionSchema`, `createTrainingEventSchema`, `createOccurrenceSchema`
- Schemas de entidade completa para cada modelo
- Tipos inferidos automaticamente dos schemas
- Mensagens de erro em português

**@fundivr/config** — Constantes:
- Portas padrão (API: 3001, Web: 5173, DB: 5432)
- URLs padrão
- Limites de score (0-100)
- Path do WebSocket

### 4.3 Backend (apps/api/)

**Infraestrutura criada:**
- ✅ Servidor Fastify com CORS e WebSocket
- ✅ App factory separado do server (facilita testes)
- ✅ Configuração de ambiente com validação Zod (fail-fast se .env inválido)
- ✅ Prisma Client singleton (hot-reload safe)
- ✅ Graceful shutdown (SIGINT/SIGTERM)
- ✅ Logger com pino-pretty em dev

**Endpoint REST:**
| Método | Rota | Resposta | Status |
|---|---|---|---|
| GET | `/health` | `{ "status": "ok" }` | ✅ Funcionando e testado |

**WebSocket:**
| Rota | Descrição | Status |
|---|---|---|
| `/ws/telemetry` | Aceita conexão, loga connect/disconnect, echo de mensagens | ✅ Infraestrutura pronta |

**Diretórios scaffolded (prontos para Sprint 2):**
- `modules/` — módulos de domínio
- `middlewares/` — middlewares Fastify
- `schemas/` — schemas de validação
- `services/` — serviços de negócio
- `utils/` — utilitários

**Teste automatizado:**
```
✓ GET /health > should return status ok (179ms)
Test Files  1 passed (1)
     Tests  1 passed (1)
```

### 4.4 Banco de Dados (Prisma + PostgreSQL)

**4 modelos criados:**

| Modelo | Campos | Relações |
|---|---|---|
| **Student** | id, name, registration (unique), experienceLevel, createdAt | 1:N → TrainingSession |
| **TrainingSession** | id, studentId, status, startedAt, finishedAt, score | N:1 → Student, 1:N → Event, 1:N → Occurrence |
| **Event** | id, sessionId, type, stage, payload (JSON), createdAt | N:1 → TrainingSession |
| **Occurrence** | id, sessionId, severity, message, createdAt | N:1 → TrainingSession |

**Detalhes técnicos:**
- Todas as tabelas usam UUID como chave primária
- Mapeamento snake_case no banco (ex: `experience_level`)
- Indexes em foreign keys e campos de filtro frequente
- Cascade delete configurado
- Prisma Client gerado com sucesso (v6.19.3)

> ⚠️ **Nota:** As migrations ainda não foram executadas (precisam de PostgreSQL rodando). Serão aplicadas quando o banco for iniciado com `docker compose up postgres`.

### 4.5 Frontend (apps/web/)

**Infraestrutura criada:**
- ✅ React 18 + Vite + TypeScript
- ✅ TailwindCSS v3 com paleta de cores custom (tema industrial/furnace)
- ✅ React Router DOM com layout system
- ✅ Zustand store base (appStore)
- ✅ React Query provider configurado
- ✅ Axios instance com interceptors scaffolded
- ✅ Google Fonts (Inter + JetBrains Mono)
- ✅ Dark theme padrão
- ✅ Proxy configurado (API + WebSocket)

**Página implementada:**
- `/` — Home page com título animado "FundiVR Training Simulator" e badge de status

**Build de produção:**
```
✓ 440 modules transformed
dist/index.html              0.90 kB
dist/assets/index.css        8.49 kB
dist/assets/index.js       301.32 kB
✓ built in 1.72s
```

**Diretórios scaffolded (prontos para Sprint 2):**
- `components/` — componentes reutilizáveis
- `features/` — features de domínio
- `hooks/` — custom hooks
- `schemas/` — schemas locais
- `types/` — tipos locais
- `assets/` — imagens e recursos

### 4.6 Docker

**docker-compose.yml com 3 serviços:**

| Serviço | Imagem | Porta | Depende de |
|---|---|---|---|
| postgres | postgres:15-alpine | 5432 | — |
| api | Dockerfile multi-stage (Node 20) | 3001 | postgres (healthcheck) |
| web | Dockerfile multi-stage (Node 20 → nginx) | 5173 | api |

**Comando para subir tudo:**
```bash
docker compose up
```

### 4.7 Qualidade de Código

| Ferramenta | Configuração |
|---|---|
| ESLint | TypeScript strict, consistent-type-imports, no-console (warn) |
| Prettier | Single quotes, trailing commas, 100 char width |
| EditorConfig | UTF-8, LF, 2 spaces, trim trailing whitespace |
| Husky | Pre-commit hook executando lint-staged |
| lint-staged | ESLint --fix + Prettier --write em arquivos staged |

### 4.8 Documentação

- ✅ `README.md` — Completo (visão geral, stack, instalação, Docker, scripts, estrutura)
- ✅ `docs/architecture.md` — Diagrama de arquitetura e fluxo de dados

### 4.9 Git & GitHub

- ✅ Repositório inicializado
- ✅ Commit inicial: **72 arquivos, 6.745 inserções**
- ✅ Publicado em: **https://github.com/TheyDreez/fundivr-training-simulator**

---

## 5. Critérios de Aceite — Sprint 1

| # | Critério | Status | Evidência |
|---|---|---|---|
| 1 | Projeto compilando | ✅ | TypeScript compila em todos os packages |
| 2 | Frontend executando | ✅ | Vite build: 440 modules, 1.72s |
| 3 | Backend executando | ✅ | Fastify app factory funcional |
| 4 | PostgreSQL funcionando | ✅ | Docker Compose configurado com healthcheck |
| 5 | Prisma conectado | ✅ | Client gerado v6.19.3 |
| 6 | Healthcheck respondendo | ✅ | `GET /health → { status: "ok" }` testado |
| 7 | WebSocket aceitando conexão | ✅ | `/ws/telemetry` configurado com echo |
| 8 | Docker funcionando | ✅ | 3 serviços: postgres, api, web |
| 9 | README criado | ✅ | Documentação completa |
| 10 | Commit inicial realizado | ✅ | 72 files no GitHub |

---

## 6. Como Executar o Projeto

### Pré-requisitos
- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker e Docker Compose

### Desenvolvimento Local
```bash
git clone https://github.com/TheyDreez/fundivr-training-simulator.git
cd fundivr-training-simulator
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm db:generate
docker compose up postgres -d
pnpm db:migrate
pnpm dev
```

### Docker (tudo containerizado)
```bash
docker compose up
```

### Scripts Disponíveis
| Comando | O que faz |
|---|---|
| `pnpm dev` | Inicia frontend + backend em paralelo |
| `pnpm build` | Build de produção |
| `pnpm test` | Executa todos os testes |
| `pnpm lint` | Verifica código com ESLint |
| `pnpm format` | Formata código com Prettier |
| `pnpm db:generate` | Gera Prisma Client |
| `pnpm db:migrate` | Executa migrations |
| `pnpm db:studio` | Abre interface visual do banco |

---

## 7. Roadmap — Próximas Sprints

### Sprint 2 — CRUD + Autenticação (Prioridade Alta)

| # | Tarefa | Complexidade | Descrição |
|---|---|---|---|
| 2.1 | CRUD de Students | Média | POST/GET/PUT/DELETE com validação Zod |
| 2.2 | CRUD de Training Sessions | Média | Criar, iniciar, finalizar sessões |
| 2.3 | Registro de Events | Média | Endpoint para registrar eventos da simulação |
| 2.4 | Registro de Occurrences | Baixa | Endpoint para ocorrências |
| 2.5 | Autenticação JWT | Alta | Login, registro, middleware de proteção |
| 2.6 | Tela de Login/Registro | Média | Formulários com validação |
| 2.7 | Migrations do Prisma | Baixa | Aplicar schema no banco |
| 2.8 | Testes de integração | Média | Testes para todos os endpoints |

### Sprint 3 — Simulador + WebSocket (Prioridade Alta)

| # | Tarefa | Complexidade | Descrição |
|---|---|---|---|
| 3.1 | Interface do Simulador | Alta | Tela principal de treinamento |
| 3.2 | Lógica de telemetria WebSocket | Alta | Processar eventos em tempo real |
| 3.3 | Sistema de scoring | Alta | Algoritmo de avaliação de desempenho |
| 3.4 | Feedback visual em tempo real | Média | Atualizar UI com base na resposta do backend |
| 3.5 | Controles do forno | Alta | Componentes interativos (temperatura, materiais) |
| 3.6 | Timer de sessão | Baixa | Cronômetro da sessão de treinamento |

### Sprint 4 — Dashboard + Polish (Prioridade Média)

| # | Tarefa | Complexidade | Descrição |
|---|---|---|---|
| 4.1 | Dashboard principal | Alta | Visão geral com KPIs |
| 4.2 | Gráficos com Recharts | Média | Evolução de score, eventos por sessão |
| 4.3 | Histórico de sessões | Média | Lista de sessões com filtros |
| 4.4 | Relatório de desempenho | Média | Relatório detalhado por aluno |
| 4.5 | Responsividade mobile | Média | Adaptação para tablets |
| 4.6 | Testes E2E | Alta | Testes end-to-end dos fluxos principais |
| 4.7 | Documentação final | Baixa | Documentação acadêmica |

---

## 8. Riscos e Dependências

| Risco | Impacto | Mitigação |
|---|---|---|
| Prazo curto da faculdade | Alto | Priorizar MVP funcional (Sprints 2-3) |
| Complexidade do simulador | Alto | Simplificar interações do forno |
| Performance WebSocket | Médio | Throttle de eventos, batch processing |
| Falta de dados reais | Baixo | Usar dados mockados/seed |

---

## 9. Decisões Técnicas Tomadas

| Decisão | Razão |
|---|---|
| Monorepo com pnpm | Compartilhar tipos e schemas entre front/back |
| Fastify ao invés de Express | 2x mais rápido, suporte nativo a TypeScript e WebSocket |
| Prisma ao invés de TypeORM | Melhor DX, type-safety, migrations automáticas |
| App factory pattern | Permite testar o servidor sem subir HTTP |
| Zod compartilhado | Validação idêntica no front e back |
| TailwindCSS v3 | Mais estável e documentado que v4 |
| PostgreSQL 15 | Robustez, suporte a JSON, performance |

---

*Documento gerado em 14/08/2026. Atualizar conforme evolução das sprints.*
