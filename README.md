# BIP Teste Integrado — Gestão de Benefícios

Solução fullstack completa em camadas para gestão de benefícios, com CRUD e transferência de valores entre benefícios.

## 📐 Arquitetura

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐     ┌────────────┐
│  Frontend   │────▶│  Backend (REST)  │────▶│  EJB Module  │────▶│ PostgreSQL │
│  Angular 19 │     │  Spring Boot 3.2 │     │  Jakarta EE  │     │    16      │
└─────────────┘     └──────────────────┘     └──────────────┘     └────────────┘
    :4200               :8085                   (embutido)          :5432
```

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| **Database** | PostgreSQL 16 | Banco de dados relacional com schema e dados iniciais |
| **EJB Module** | Jakarta EE (Stateless EJB) | Lógica de negócio de transferência com locking pessimista |
| **Backend** | Spring Boot 3.2 + JPA | API REST com CRUD, validações e integração com EJB |
| **Frontend** | Angular 19 + Module Federation | Interface de usuário SPA com micro-frontend |

## 🚀 Como Executar

### Pré-requisitos

- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+** e **npm**
- **Docker** e **Docker Compose**
- **Angular CLI** (`npm install -g @angular/cli`)

### 1. Banco de Dados

```bash
# Subir o PostgreSQL via Docker
docker-compose up -d

# (Opcional) Executar scripts manualmente
psql -h localhost -U admin -d backend_db -f db/schema.sql
psql -h localhost -U admin -d backend_db -f db/seed.sql
```

> O Spring Boot está configurado com `ddl-auto=update`, então as tabelas serão criadas automaticamente ao iniciar o backend.

### 2. Backend (Spring Boot)

```bash
cd backend-module

# Compilar e rodar os testes
mvn clean install

# Executar a aplicação
mvn spring-boot:run
```

O backend estará disponível em: `http://localhost:8085`

### 3. Frontend (Angular)

```bash
cd frontend

# Instalar dependências
npm install

# Compilar a biblioteca shared
ng build shared

# Executar o app principal
ng serve
```

O frontend estará disponível em: `http://localhost:4200`

Para o micro-frontend de benefícios:

```bash
ng serve mfe-beneficios --port 4201
```

## 📚 Documentação da API (Swagger)

Com o backend em execução, acesse:

| Recurso | URL |
|---------|-----|
| **Swagger UI** | [http://localhost:8085/swagger-ui.html](http://localhost:8085/swagger-ui.html) |
| **OpenAPI JSON** | [http://localhost:8085/v3/api-docs](http://localhost:8085/v3/api-docs) |

### Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/beneficios` | Listar todos os benefícios ativos |
| `GET` | `/api/v1/beneficios/{id}` | Buscar benefício por ID |
| `POST` | `/api/v1/beneficios` | Criar novo benefício |
| `PUT` | `/api/v1/beneficios/{id}` | Atualizar benefício existente |
| `DELETE` | `/api/v1/beneficios/{id}` | Deletar (soft delete) benefício |
| `POST` | `/api/v1/beneficios/transferir` | Transferir valor entre benefícios |

### Exemplos de Requisição

**Criar benefício:**
```json
POST /api/v1/beneficios
{
  "nome": "Vale Alimentação",
  "descricao": "Benefício de vale alimentação mensal",
  "valor": 1500.00,
  "ativo": true
}
```

**Transferir valor:**
```json
POST /api/v1/beneficios/transferir
{
  "fromId": 1,
  "toId": 2,
  "valor": 250.00
}
```

## 🐞 Correção do Bug EJB

O `BeneficioEjbService` original possuía as seguintes vulnerabilidades:

1. **Sem verificação de saldo** — permitia transferências com saldo insuficiente
2. **Sem locking** — possível race condition em acessos concorrentes
3. **Sem rollback** — inconsistência de dados em caso de falha

### Correções aplicadas:

- ✅ Validação de valor positivo (`amount > 0`)
- ✅ Lock pessimista (`LockModeType.PESSIMISTIC_WRITE`) para evitar race conditions
- ✅ Verificação de saldo antes da transferência
- ✅ Rollback automático via `@TransactionAttribute(REQUIRED)`
- ✅ Validação de existência dos benefícios origem e destino

No backend Spring Boot, a mesma lógica é replicada com:
- Lock pessimista via `@Lock(PESSIMISTIC_WRITE)` no repository
- Ordenação de locks por ID para evitar deadlocks
- `@Transactional` para rollback automático

## 🧪 Testes

### Backend

```bash
cd backend-module
mvn test
```

Os testes incluem:
- Testes unitários do controller (`BeneficioControllerTest`)
- Testes de integração usando H2 em memória
- Validação de cenários de erro (saldo insuficiente, IDs inválidos, etc.)

### Frontend

```bash
cd frontend
ng test
ng test mfe-beneficios
```

## 🗂️ Estrutura do Projeto

```
bip-teste-integrado/
├── db/                          # Scripts SQL
│   ├── schema.sql               # Criação da tabela BENEFICIO
│   └── seed.sql                 # Dados iniciais
├── ejb-module/                  # Módulo EJB (lógica de transferência)
│   └── src/main/java/.../BeneficioEjbService.java
├── backend-module/              # Backend Spring Boot
│   ├── src/main/java/.../
│   │   ├── config/              # Swagger, CORS
│   │   ├── controller/          # REST controllers
│   │   ├── dto/                 # DTOs com validação
│   │   ├── model/               # Entidades JPA
│   │   ├── repository/          # Repositórios Spring Data
│   │   └── service/             # Lógica de negócio
│   └── src/test/                # Testes
├── frontend/                    # Frontend Angular
│   ├── src/app/                 # App shell principal
│   └── projects/
│       ├── mfe-beneficios/      # Micro-frontend de benefícios
│       └── shared/              # Biblioteca compartilhada
├── docs/                        # Documentação do desafio
├── docker-compose.yml           # PostgreSQL via Docker
└── README.md                    # Este arquivo
```

## ⚙️ Configuração

### Variáveis de Ambiente / Propriedades

| Propriedade | Valor Padrão | Descrição |
|-------------|-------------|-----------|
| `server.port` | `8085` | Porta do backend |
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/backend_db` | URL do banco |
| `spring.datasource.username` | `admin` | Usuário do banco |
| `spring.datasource.password` | `admin123` | Senha do banco |
| `spring.jpa.hibernate.ddl-auto` | `update` | Estratégia de DDL |

### Docker Compose

O `docker-compose.yml` sobe o PostgreSQL:

```bash
docker-compose up -d     # Iniciar
docker-compose down       # Parar
docker-compose down -v    # Parar e remover volumes
```
