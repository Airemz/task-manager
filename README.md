# Task Manager (MERN)

Small task app with full CRUD, dark UI, and MongoDB persistence.

## Stack
- **Backend:** Node + Express + MongoDB (Mongoose, TypeScript)
- **Frontend:** React (Vite, TypeScript)

## Brief Project Explanation (Process, Decisions, Challenges)

### Approach
- Started from the requirements and designed the smallest MERN scaffold that meets them.
- Single-file backend (`server.ts`) with Express + Mongoose and full CRUD routes.
- Minimal, readable React frontend with two components (`TaskForm`, `TaskItem`) and a tiny `api.ts`.
- Styling in a single `index.css`: dark app shell, light/tan cards for form & tasks.

### Key Decisions
- **Condensed backend:** Co-located most logic in `server.ts` to keep the file count low and speed up review.
- **Validation:** Light runtime checks with Zod (plus Mongoose `required`/`enum`) for clean errors without heavy boilerplate.
- **Optimistic UI updates:** Edits/status/deletes update immediately; list refresh is “silent” to avoid flicker.
- **Fetch over axios:** Fewer dependencies, very small API wrapper.
- **Docker (dev only):** Simple Compose file runs Mongo + API with one command; skipped production Docker to keep scope tight.

### Challenges & How They Were Addressed
- **TypeScript + Node interop:** Settled on CommonJS with `esModuleInterop` for smooth `ts-node` dev.
- **CORS & local dev UX:** Enabled `cors()` globally for dev; note to restrict origins in production.
- **UI flicker on refresh:** Added a separate `refreshing` state to keep the list visible and a subtle fade/stagger animation.
- **Consistent status values:** Enforced via Zod enum and Mongoose enum to avoid invalid data.

### What I’d Improve with More Time
- Sorting & pagination (e.g., by `createdAt`, `status`)
- JWT auth + protected endpoints
- Unit tests (Jest/Vitest + Supertest) and simple E2E (Playwright)
- CI (GitHub Actions) for build/test on PRs
- Production Dockerfile + CD pipeline

## Setup & Run (Local)

### 1) Environment Variables
Create the env files from examples (no secrets included):
```bash
cp backend/.env.backend/.env
cp frontend/.env frontend/.env
```

### 2) Start the Backend
```
cd backend
npm i
npm run dev
# API: http://localhost:4000  (health: /health)
```

### 3) Start the Frontend
```
cd frontend
npm i
npm run dev
# open the printed URL (e.g., http://localhost:5173)
```

### (Optional) Run Backend with Docker

From backend/:
```
docker compose up
# spins up Mongo (27017) + API (4000)
```

Then start the frontend as above (npm run dev in frontend).

API Reference

Base URL: http://localhost:4000

```
POST   /tasks
GET    /tasks
GET    /tasks/:id
PUT    /tasks/:id
DELETE /tasks/:id


Task JSON

{
  "_id": "64f...",
  "title": "My task",
  "description": "Optional",
  "status": "To Do",
  "createdAt": "2025-10-03T01:39:50.000Z"
}
```

Quick cURL tests
```
# health
curl -s http://localhost:4000/health

# create
curl -s -X POST http://localhost:4000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"First task","description":"hello","status":"To Do"}'

# list
curl -s http://localhost:4000/tasks

# update
curl -s -X PUT http://localhost:4000/tasks/<id> \
  -H 'Content-Type: application/json' \
  -d '{"status":"In Progress"}'

# delete
curl -i -X DELETE http://localhost:4000/tasks/<id>
