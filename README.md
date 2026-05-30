# Deeper Insight

A premium, state-of-the-art management system for mobile shops and service providers, powered by a TypeScript/Node.js backend and a React/Vite dashboard, organized as a high-performance **pnpm monorepo workspace**.

---

## 📂 Project Structure

This project is fully modular and structured for scale. All business logic, packages, and assets are divided into two main, self-contained directories:

### 1. ⚙️ [Backend](./backend)
A production-grade backend service built with Node.js, Express, and Drizzle ORM.
* **Source Code (`backend/src/`):** Contains all API endpoints, routes, middlewares, schema models, and helpers.
* **Libraries (`backend/lib/`):**
  * `db`: Database schemas, connections, and migrations.
  * `api-zod`: Automated Zod schemas matching our api spec models.
  * `api-spec`: OpenAPI specifications and configurations (`orval.config.ts`).

### 2. 📊 [Dashboard](./dashboard)
A premium, animation-rich, glassmorphic UI built using React, Vite, TailwindCSS, and Shadcn UI.
* **Source Code (`dashboard/src/`):** Contains all interactive dashboards, sales calculators, inventory forms, and pages.
* **Libraries (`dashboard/lib/`):**
  * `api-client-react`: High-performance React Query clients auto-generated from backend routes.

---

## 📖 Documentation

All detailed project documents, structural refactoring logs, and historical design plans have been organized under the central [docs](./docs) directory to keep the root directory completely clean:

* [Implementation Plan](./docs/implementation_plan.md) — The detailed roadmap for restructuring and Replit cleanup.
* [Walkthrough Log](./docs/walkthrough.md) — Step-by-step documentation of completed improvements and migration verification.

---

## 🚀 Running the Project Locally

This project uses **pnpm workspaces**. Ensure you have `pnpm` installed globally:

### 1. Install dependencies
From the root directory:
```bash
pnpm install
```

### 2. Run the development servers
To boot both the backend API server and Vite dashboard simultaneously:
```bash
pnpm run dev
```

### 3. Verify TypeScript consistency
To run type validation across all workspace packages:
```bash
pnpm run typecheck
```
