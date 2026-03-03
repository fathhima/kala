# 🎨 Kala — Live Creative Learning Marketplace

Kala is a full-stack live creative learning marketplace that connects students with verified instructors for structured, slot-based creative sessions.

It transforms informal creative learning into a secure, organized, and transaction-safe digital platform.

---

## 🚀 Tech Stack

**Frontend**
- React
- TypeScript

**Backend**
- NestJS
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Role-Based Access Control (RBAC)

**Monorepo Setup**
- pnpm workspaces
- apps/web (frontend)
- apps/api (backend)

---

## 🧠 Engineering Focus

Kala is designed as an interview-grade backend system demonstrating:

- Relational data modeling (3NF)
- Foreign key enforcement
- Unique constraints to prevent double booking
- Slot reservation concurrency control
- Transaction-safe booking lifecycle
- Modular NestJS architecture
- Type-safe development using Prisma
- Clean separation of concerns

---

## 🧩 Core Features (MVP)

- Role-based authentication (Student / Instructor / Admin)
- Instructor onboarding & admin approval workflow
- Slot-based availability management
- Conflict-safe booking system
- Payment lifecycle integration (planned)
- Review and rating system
- Secure relational integrity with PostgreSQL

---

## 📊 Lifecycle Design

### Slot States
AVAILABLE → RESERVED → BOOKED

### Booking States
PAYMENT_PENDING → CONFIRMED → COMPLETED → CANCELLED

- Slots are reserved before payment.
- Each slot can have only one booking (database enforced).
- Each booking has exactly one payment record.
- Reviews are allowed only after booking completion.

---

## 🗂️ Project Structure

kala/
├── apps/
│   ├── web/   → React frontend
│   └── api/   → NestJS backend
├── pnpm-workspace.yaml
└── package.json

---

## ⚙️ Getting Started

### 1️⃣ Install Dependencies
pnpm install

### 2️⃣ Setup Environment (apps/api/.env)
DATABASE_URL="postgresql://user:password@localhost:5432/kala"
JWT_SECRET="your-secret"

### 3️⃣ Run Database Migration
cd apps/api
pnpm prisma migrate dev

### 4️⃣ Start Backend
pnpm --filter api dev

### 5️⃣ Start Frontend
pnpm --filter web dev

---

## 🎯 Project Goal

Kala is built as a structured learning and portfolio project to demonstrate:

- Clean backend architecture
- Concurrency-aware system design
- Secure booking lifecycle handling
- Strong relational database modeling
- Scalable modular NestJS development

---

## 👩‍💻 Author

Fathima