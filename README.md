# 🎨 Kala — Live Creative Learning Marketplace

> A full-stack marketplace that connects students with verified instructors for structured, slot-based creative sessions — from music and art to dance and photography.

Kala transforms informal creative learning into a secure, organized, and transaction-safe digital platform. Instructors manage their availability, students discover and book sessions, and admins oversee the entire ecosystem — all backed by real-time chat, Razorpay payments, and production-grade observability.

---

## ✨ Key Features

| Area | Highlights |
|---|---|
| **Authentication** | Email/password with OTP verification, Google OAuth, JWT access + refresh tokens (HTTP-only cookies) |
| **Role-Based Access** | Three roles — Student, Instructor, Admin — with guarded routes on both client and server |
| **Instructor Onboarding** | Multi-step application → admin review → approval/rejection workflow with change-request support |
| **Offerings & Media** | Instructors create offerings (title, hourly rate, description) with image/video uploads via S3 pre-signed URLs |
| **Availability Engine** | Recurring weekly rules + one-off exceptions → automatic slot generation with timezone support |
| **Booking Lifecycle** | `AVAILABLE → HELD → BOOKED` slot flow with idempotency keys, hold expiry, and concurrency-safe locking |
| **Payments** | Razorpay integration: order creation, webhook verification, refund handling |
| **Real-Time Chat** | Socket.IO per-booking chat rooms with Redis adapter for horizontal scaling |
| **Admin Dashboard** | User management, application review, booking monitoring, payment oversight |
| **Observability** | Prometheus metrics, Grafana dashboards (API, DB, Redis, Logs), Loki + Alloy log aggregation |

---

## 🏗️ Architecture

```
kala/
├── apps/
│   ├── api/          # NestJS backend (REST + WebSockets)
│   └── web/          # React SPA (Vite + Tailwind CSS)
├── docs/             # OpenAPI spec + Swagger UI
├── infra/
│   ├── terraform/    # AWS IaC (VPC, ECS, RDS, ElastiCache, S3, CloudFront, ALB)
│   ├── grafana/      # Dashboards & datasource provisioning
│   ├── prometheus/   # Scrape config
│   ├── loki/         # Log aggregation config
│   └── alloy/        # Grafana Alloy log collector config
├── .github/workflows/
│   ├── ci.yml        # Lint → Typecheck → Test → Build
│   └── deploy-api.yml# CD: Docker → ECR → ECS rolling deploy
├── docker-compose.yaml              # Local dev stack
├── docker-compose.observability.yaml # Observability stack
└── pnpm-workspace.yaml
```

### Backend Modules (`apps/api/src/modules/`)

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, OTP, Google OAuth, JWT, password reset |
| `user` | Profile management, account settings |
| `admin` | Application review, user management, category/subcategory CRUD |
| `instructor` | Onboarding, offerings, portfolio, availability rules |
| `category` | Skill categories & subcategories |
| `slot` | Availability rule → slot generation, hold/release logic |
| `booking` | Booking creation, status transitions, cancellation, hold expiry |
| `payment` | Razorpay order creation, webhook processing, refund flow |
| `chat` | Socket.IO gateway, chat rooms per booking, message persistence |
| `notification` | Email notifications via Nodemailer/SMTP |
| `video-call` | Video call session management |

---

## 🛠️ Tech Stack

### Frontend — `apps/web`

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Server State | TanStack React Query |
| Routing | React Router v6 |
| HTTP Client | Axios (auto-generated from OpenAPI) |
| Charts | Recharts |
| Icons | Lucide React |
| Real-Time | Socket.IO Client |
| OAuth | `@react-oauth/google` |
| Validation | Zod |

### Backend — `apps/api`

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript |
| ORM | Prisma (PostgreSQL) |
| Auth | JWT (`@nestjs/jwt`) + bcrypt |
| Validation | class-validator + class-transformer |
| Queue | BullMQ + Redis |
| WebSockets | Socket.IO (`@nestjs/websockets`) |
| Rate Limiting | `@nestjs/throttler` + Redis storage |
| File Storage | AWS S3 (pre-signed URLs) |
| Payments | Razorpay |
| Email | Nodemailer |
| Metrics | Prometheus (`prom-client`) |
| Logging | Winston |
| API Docs | Swagger (`@nestjs/swagger`) |
| Events | `@nestjs/event-emitter` + Outbox pattern |

### Infrastructure

| Concern | Technology |
|---|---|
| IaC | Terraform (AWS provider ~5.0) |
| Compute | ECS Fargate |
| Database | RDS PostgreSQL |
| Cache / Queue | ElastiCache Redis |
| Object Storage | S3 |
| CDN | CloudFront |
| Load Balancer | ALB |
| Container Registry | ECR |
| DNS / TLS | ACM + CloudFront |
| Frontend Hosting | AWS Amplify |
| Secrets | Doppler |
| CI/CD | GitHub Actions |

### Observability Stack (Docker Compose)

| Component | Purpose |
|---|---|
| Prometheus | Metrics collection (API, PostgreSQL exporter, Redis exporter) |
| Grafana | Dashboards — API overview, database, Redis, logs |
| Loki | Log aggregation |
| Grafana Alloy | Log collector (Docker container logs → Loki) |

### Tooling

| Tool | Purpose |
|---|---|
| pnpm Workspaces | Monorepo package management |
| Biome | Linting + formatting (replaces ESLint + Prettier) |
| OpenAPI Generator | Auto-generate TypeScript API client from spec |

---

## 🗄️ Data Model

The Prisma schema defines **14 models** with full referential integrity:

```
User ──┬── InstructorProfile ──┬── InstructorApplication
       │                       ├── InstructorOffering ── OfferingMedia
       │                       ├── AvailabilityRule
       │                       ├── AvailabilityException
       │                       └── AvailabilitySlot
       ├── Booking ── Payment
       │          └── ChatRoom ── ChatMessage
       └── (roles: STUDENT | INSTRUCTOR | ADMIN)

OutboxEvent  (transactional outbox for reliable event processing)
```

### State Machines

**Slot:** `AVAILABLE` → `HELD` → `BOOKED` / `CANCELLED`

**Booking:** `PAYMENT_PENDING` → `CONFIRMED` → `COMPLETED` / `CANCELLED` / `EXPIRED` → `REFUND_PENDING` → `REFUNDED`

**Payment:** `PENDING` → `PROCESSING` → `SUCCEEDED` / `FAILED` → `REFUND_PENDING` → `REFUNDED` / `PARTIALLY_REFUNDED`

**Instructor Profile:** `DRAFT` → `PENDING` → `APPROVED` / `REJECTED` / `CHANGES_REQUESTED` / `SUSPENDED`

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** ≥ 24
- **pnpm** (latest via corepack)
- **Docker** & Docker Compose
- **Doppler CLI** (for secrets) — or create a manual `.env` file

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/kala.git
cd kala
corepack enable
pnpm install
```

### 2. Set Up Environment Variables

Copy the example env file and fill in your secrets:

```bash
cp apps/api/.env.example apps/api/.env
```

Or configure [Doppler](https://doppler.com) for secret management:

```bash
doppler setup    # selects project: kala, config: dev
```

### 3. Start Infrastructure

```bash
docker compose up -d          # PostgreSQL + Redis
```

### 4. Run Database Migrations & Seed

```bash
pnpm prisma:migrate           # applies all migrations
# or without Doppler:
cd apps/api && npx prisma migrate dev
```

### 5. Start Development Servers

```bash
# With Doppler (recommended):
pnpm dev          # starts both API (port 4000) and Web (port 5173) in parallel

# Individual apps:
pnpm dev:api      # NestJS on http://localhost:4000
pnpm dev:web      # Vite on http://localhost:5173

# Or fully containerized:
pnpm dev:docker   # docker compose up with Doppler secrets
```

### 6. Explore

| URL | Description |
|---|---|
| http://localhost:5173 | Web app |
| http://localhost:4000/api | API base |
| http://localhost:4000/api/docs | Swagger UI |

---

## 🔭 Observability (Optional)

Spin up the full observability stack alongside the dev services:

```bash
docker compose -f docker-compose.yaml -f docker-compose.observability.yaml up -d
```

| URL | Service |
|---|---|
| http://localhost:3000 | Grafana (admin/admin) |
| http://localhost:9090 | Prometheus |
| http://localhost:3100 | Loki |
| http://localhost:12345 | Grafana Alloy UI |

Pre-provisioned Grafana dashboards: **API Overview**, **Database**, **Redis**, **Logs**.

---

## 🚀 CI/CD Pipeline

### CI (every push/PR to `main` or `dev`)

```
Lint (Biome) ─┬─ Typecheck (tsc) ── Build (API + Web)
              └─ Test API (Jest)
```

### CD (push to `main` on `apps/api/**` changes)

```
Checkout → AWS Credentials → ECR Login → Docker Build (multi-stage) → Push to ECR → ECS Rolling Deploy
```

Frontend is deployed automatically via **AWS Amplify** on push.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in parallel (via Doppler) |
| `pnpm dev:api` | Start API only |
| `pnpm dev:web` | Start Web only |
| `pnpm dev:docker` | Start via Docker Compose (with Doppler) |
| `pnpm prisma:studio` | Open Prisma Studio |
| `pnpm prisma:migrate` | Run Prisma migrations |
| `pnpm lint` | Lint entire monorepo (Biome) |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Format all files (Biome) |
| `pnpm check` | Run Biome check (lint + format) |

---

## 🧠 Engineering Highlights

- **Concurrency-safe booking** — slot holds with TTL, database-enforced unique constraints, idempotency keys
- **Transactional outbox** — reliable event processing without distributed transactions
- **Modular NestJS architecture** — each domain is a self-contained module with its own controllers, services, and DTOs
- **Type-safe end-to-end** — Prisma generates TypeScript types; OpenAPI spec generates the frontend API client
- **Multi-stage Docker builds** — optimized production images with `pnpm prune --prod`
- **Infrastructure as Code** — entire AWS stack (VPC, ECS, RDS, ElastiCache, S3, CloudFront, ALB) defined in Terraform
- **Observability-first** — metrics, structured logging, and pre-built dashboards from day one

---

## 📄 License

ISC

---

## 👩‍💻 Author

**Fathima**
