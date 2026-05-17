# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Scrum project management app ("OPM") for Oracle. Spring Boot backend + React (Vite) frontend, deployed on Oracle Kubernetes Engine. Oracle Autonomous Database (ATP) via mTLS wallet.

---

## Commands

### Frontend (React + Vite)
Working directory: `MtdrSpring/backend/src/main/frontend`

```bash
npm run dev      # Dev server (hot reload, no build needed)
npm run build    # Compile to ../../../resources/static — required before running Spring Boot locally
npm run lint     # ESLint
```

**Important:** Spring Boot serves the frontend from `src/main/resources/static`. After any frontend change, run `npm run build` for the full-stack server to reflect changes. `npm run dev` is only for frontend-only development (no backend needed).

### Backend (Spring Boot + Maven)
Working directory: `MtdrSpring/backend`

```bash
mvn spring-boot:run          # Run locally (reads application.properties)
mvn clean package -DskipTests  # Build JAR
mvn test                     # Run all tests
```

No test runner for a single test — use `mvn test -Dtest=ClassName#methodName`.

---

## Architecture

### Database — Oracle ATP (Cloud)
- Schema: `ADMIN`
- Connected via mTLS wallet at `MtdrSpring/backend/wallet/`
- **Local config:** `application.properties` → `spring.datasource.tns-admin` must point to the absolute path of the `wallet/` folder on the current machine. Each developer must update this path.
- **Production/K8s:** connection params come from environment variables (`db_url`, `db_user`, `dbpassword`, `driver_class_name`) — `application.properties` is ignored when `db_url` env var is set (see `OracleConfiguration.java`).
- `spring.jpa.hibernate.ddl-auto=update` — Hibernate auto-updates schema on startup. This causes a slow startup while it introspects Oracle metadata.

### Backend (Spring Boot 3.5, Java 11)
Package: `com.springboot.MyTodoList`

**Layer structure:** `controller → service → repository (JpaRepository) → Oracle`

**Key domain models** (all in `ADMIN` schema):
- `USUARIOS` — team members with `ROL` field: `'Admin'`, `'Scrum Master'`, `'Developer'`, `'Product Owner'`
- `PROYECTOS` → `SPRINTS` → `TAREAS` — core hierarchy
- `TAREAS.SPRINT_ID` + `TAREAS.ASIGNADO_A` — the only link between Sprint and Developer (no direct join table)
- `CREDENCIALES` — BCrypt-hashed passwords, separate from `USUARIOS`
- `KPIS` — manually populated strategic indicators (not auto-calculated from tasks)

**Auth:** Stateless, no JWT. `POST /auth/login` returns `{ userId, email, rol, fullName }`. Spring Security is configured to `permitAll()` — all API routes are open; access control is enforced client-side by role.

**Telegram bot:** `ToDoItemBotController` + `BotActions` — developers can view/update tasks via Telegram. Bot reads `TAREAS` and `KPIS` but does not write KPIs.

**AI endpoints:** `/ai/chat` proxies to Anthropic API (key in `anthropic.api.key`). `/rag/*` uses ORDS + Groq for retrieval-augmented generation.

**`TareaController` PUT:** Sets `actualizadoEn = new Date()` on every update — this timestamp is used as a proxy for task completion date in analytics.

### Frontend (React 19 + Vite 8)
Entry: `src/main/frontend/src/`

**Auth state:** Stored in `localStorage` as `opm_user` JSON. `useAuth()` hook (from `App.jsx`) provides `{ user, login, logout }` throughout the app.

**Role-based routing** (`AppRouter.jsx`):
- `Admin` → full access (Dashboard, KPIs, Desempeño, Tareas, Analítica, Sprints, Proyectos)
- `Scrum Master` → Tareas, Analítica, Sprints, Carga del Equipo (CargaDev)
- `Developer` → DevDashboard, MisTareas only

**Developer restrictions (enforced in frontend):**
- `TaskCard` shows "Editar tarea" / "Eliminar tarea" in the three-dot menu **only when `onEdit`/`onDelete` props are passed**. Do not pass these in `DevDashboard` or `MisTareas`.
- Developers can only change task status — use `StatusModal` (defined inline in `DevDashboard.jsx` and `MisTareas.jsx`), not `TaskForm`.
- `CargaDev.jsx` filters `DEV_ROLES = ['Developer']` — only Developers appear, not Scrum Masters.

**API layer:** `src/services/api.js` — all calls go to `BASE_URL` (env var `VITE_API_URL` or `http://localhost:8080`). Returns JSON; 401 redirects to `/login`.

**Analytics (`Analitica.jsx`):** All charts are calculated client-side from raw task data fetched at load time — no dedicated analytics endpoint. Scoped by `proyectoId` filter; sprint↔developer relationship is always indirect through `TAREAS`.

**KPIs (`Kpis.jsx`):** Pure read-only display of `ADMIN.KPIS` table records. Values are **not** auto-calculated from tasks — they must be inserted into Oracle manually or via API.

**Design system:** CSS variables in `src/index.css`. Key colors: `--oracle-red: #C74634`, `--navy: #1B1F3B`, `--accent: #374151`. Semantic colors hardcoded in components: `#7A8C5A` (Completado/green), `#A85550` (Bloqueado/red), `#94A3B8` (Backlog/grey).
