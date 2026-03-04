# Frontend — BIP Teste Integrado

Aplicação Angular 21 com arquitetura de **Micro-Frontends** via [Module Federation](https://webpack.js.org/concepts/module-federation/) para gestão de benefícios.

## Estrutura

```
frontend/
├── src/app/                     # App shell (host)
│   └── beneficios/pages/        # Páginas de benefícios no host
├── projects/
│   ├── mfe-beneficios/          # Micro-frontend remoto de benefícios
│   │   └── src/app/beneficios/  # Listagem, formulário, transferência
│   └── shared/                  # Biblioteca compartilhada (componentes, serviços, models)
└── webpack.config.js            # Configuração Module Federation
```

## Pré-requisitos

- **Node.js 18+**
- **Angular CLI** (`npm install -g @angular/cli`)
- Backend rodando em `http://localhost:8085`

## Como Executar

```bash
# Instalar dependências
npm install

# Compilar biblioteca compartilhada
ng build shared

# Executar app shell (host)
ng serve
# Acesse: http://localhost:4200

# Executar micro-frontend de benefícios (em outro terminal)
ng serve mfe-beneficios --port 4201
# Acesse: http://localhost:4201

> Para apontar o host para outro endereço do remote, defina `MFE_BENEFICIOS_REMOTE` (ex.: `http://meu-host/remoteEntry.js`).
```

## Funcionalidades

- **Listagem de benefícios** — tabela com todos os benefícios ativos
- **Criação/Edição** — formulário com validações reativas
- **Exclusão** — soft delete com confirmação
- **Transferência** — transferência de valores entre benefícios

## Testes

```bash
# Testes unitários do app shell
ng test

# Testes do micro-frontend
ng test mfe-beneficios

# Testes da biblioteca compartilhada
ng test shared
```

## Build para Produção

```bash
ng build --configuration production
ng build mfe-beneficios --configuration production
```

Os artefatos são gerados no diretório `dist/`.
