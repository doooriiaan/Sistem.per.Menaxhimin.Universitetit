# AGENTS

Purpose: concise instructions to help AI coding agents work productively on this repository.

Quick pointers
- **Backend start**: See [backend/package.json](backend/package.json). Typical commands:

```
cd backend
npm install
npm start
```

- **Frontend start**: See [frontend/package.json](frontend/package.json). Typical commands:

```
cd frontend
npm install
npm run dev
```

- **Master startup**: [start-system.cmd](start-system.cmd) runs backend + frontend in separate terminals.

Where to look (high-value files)
- **Server entry**: [backend/server.js](backend/server.js)
- **Controllers**: [backend/controllers](backend/controllers) — business logic per resource
- **Routes**: [backend/routes](backend/routes) — API endpoints and route naming
- **DB / schema**: [backend/universitydb.sql](backend/universitydb.sql), [backend/db.js](backend/db.js)
- **Auth & config**: [backend/utils/authConfig.js](backend/utils/authConfig.js), [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js)
- **Frontend app**: [frontend/src/main.jsx](frontend/src/main.jsx), [frontend/src/pages](frontend/src/pages), [frontend/src/services/api.js](frontend/src/services/api.js)
- **Docs**: [README.md](README.md) — setup and environment notes

Conventions and guidance for agents
- **Minimal edits first**: Prefer small, incremental PRs; avoid schema changes without confirmation.
- **Link, don't duplicate**: When adding docs, link to existing README or SQL schema instead of copying.
- **Run local starts**: Use the backend and frontend start scripts to verify behavior before making API changes.
- **Auth-aware changes**: Be careful touching auth, JWT, refresh token flows—tests or manual verification required.
- **Ask when unsure**: If a change touches DB schema, migrations, or production secrets, ask the human.

Environment notes
- Backend expects `.env` variables (DB credentials, `JWT_SECRET`, `PORT`, `FRONTEND_ORIGINS`). See [backend/utils/authConfig.js](backend/utils/authConfig.js) and `README.md` for details.
- Frontend uses `VITE_API_BASE_URL` in [frontend/.env.example](frontend/.env.example).

Typical agent tasks
- Small bug fixes in controllers/routes with unit or manual verification
- Frontend UI fixes and component refactors within `frontend/src/components`
- Add or update API clients in `frontend/src/services/api.js` and adjust axios interceptors accordingly

If more automation is desired
- Consider adding targeted skills/files: `AGENTS-frontend.md`, `AGENTS-backend.md`, or a repo-level `.github/copilot-instructions.md` for GitHub-specific guidance.

Links
- README: [README.md](README.md)
