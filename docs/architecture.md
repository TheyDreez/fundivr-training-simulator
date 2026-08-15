# Arquitetura — FundiVR Training Simulator

## Visão Geral

O FundiVR Training Simulator é uma aplicação web para treinamento de operadores de fornos de fusão de alumínio. A arquitetura segue o padrão de monorepo com separação clara entre frontend, backend e pacotes compartilhados.

## Diagrama de Fluxo

```
┌─────────────┐     HTTP/REST      ┌─────────────┐     Prisma ORM     ┌──────────────┐
│             │ ──────────────────► │             │ ──────────────────► │              │
│   Frontend  │                    │   Backend   │                    │  PostgreSQL  │
│  (React)    │ ◄────────────────── │  (Fastify)  │ ◄────────────────── │              │
│             │     JSON Response  │             │     Query Result   │              │
└──────┬──────┘                    └──────┬──────┘                    └──────────────┘
       │                                  │
       │         WebSocket                │
       └──────────────────────────────────┘
              Telemetria em tempo real
```

## Pacotes Compartilhados

```
packages/
├── shared-types/     → Interfaces TypeScript (Student, TrainingSession, etc.)
├── shared-schemas/   → Schemas Zod para validação (createStudentSchema, etc.)
└── config/           → Constantes (portas, URLs, limites)
```

Ambos frontend e backend importam destes pacotes, garantindo:
- **Contratos únicos** entre API e UI
- **Validação consistente** com Zod
- **Reutilização** de tipos sem duplicação

## Fluxo de Dados (Sprint 2+)

1. Operador inicia sessão de treinamento
2. Frontend envia eventos via WebSocket (`/ws/telemetry`)
3. Backend processa e persiste no PostgreSQL
4. Backend calcula score e envia feedback
5. Frontend atualiza simulação em tempo real
6. Ao finalizar, dados são consolidados em `TrainingSession`

## Princípios

- **Separation of Concerns**: UI, lógica de negócio e dados isolados
- **Type Safety**: TypeScript em toda a stack
- **Contract First**: Schemas Zod definem contratos antes da implementação
- **Testability**: App factory separado do server para facilitar testes
