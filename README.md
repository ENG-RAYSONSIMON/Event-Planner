# Event Planner Monorepo

This repository is organized into:

- `backend/` → Express + TypeScript API
- `frontend/` → Vite + React + TypeScript app consuming the API

## Quick start

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `frontend/.env` using `frontend/.env.example` so the frontend can call the API.

## Frontend stack

The frontend now uses:

- React + TypeScript (Vite)
- React Router for page navigation
- Axios for HTTP calls
- Zustand for authentication state persistence
- React Hook Form for form handling and validation
- Tailwind CSS for styling
- React Icons for modern iconography
