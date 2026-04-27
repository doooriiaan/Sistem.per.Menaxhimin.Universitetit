# Sistemi i Menaxhimit te Universitetit

Platforme full-stack per menaxhimin e te dhenave universitare me tri role kryesore:

- `Admin` per CRUD te plote mbi entitetet akademike
- `Profesor` per lendet, provimet, notimin dhe orarin personal
- `Student` per profilin, notat, regjistrimet, provimet dhe orarin

## Stack-u Teknik

- `Backend`: Node.js + Express
- `Frontend`: React + Vite + Tailwind CSS
- `Databaza`: MySQL
- `Siguria`: JWT access tokens + refresh tokens me cookie `httpOnly`

## Cfare eshte implementuar

- CRUD per entitetet kryesore: `studentet`, `profesoret`, `lendet`, `drejtimet`, `fakultetet`, `departamentet`, `regjistrimet`, `provimet`, `notat`, `oraret`
- Dashboard i dedikuar per secilin rol
- Autentifikim me role dhe autorizim ne API
- Refresh-token flow me rotacion sesioni dhe `logout`
- Ndryshim fjalekalimi me revokim te refresh token-eve
- Lazy loading dhe code splitting per faqet e frontend-it
- Kerkim, filtrim dhe paginim ne modulet kryesore administrative

## Struktura e Projektit

```text
backend/
  controllers/
  middleware/
  routes/
  utils/
  universitydb.sql
  .env.example

frontend/
  src/
    components/
    context/
    hooks/
    pages/
    services/
    utils/
  .env.example
```

## Setup Lokal

### 1. Backend

Krijo `backend/.env` duke u bazuar ne `backend/.env.example`.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=universitydb
PORT=5001
JWT_SECRET=vendos-nje-sekret-te-forte
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=7
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ADMIN_EMAIL=admin@universiteti.local
ADMIN_PASSWORD=Admin123!
ADMIN_FIRST_NAME=Dorian
ADMIN_LAST_NAME=Rinor
```

Importo databazen:

```bash
mysql -u root -p < backend/universitydb.sql
```

Nis backend-in:

```bash
cd backend
npm install
npm start
```

### 2. Frontend

Krijo `frontend/.env` duke u bazuar ne `frontend/.env.example`.

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Nis frontend-in:

```bash
cd frontend
npm install
npm run dev
```

## Kredenciale Demo

Pas importit te `backend/universitydb.sql`, mund te perdoresh:

- `Admin`: `admin@universiteti.local` / `Admin123!`
- `Profesor`: `dorian.rinor1@universiteti.local` / `Profesor123!`
- `Student`: `dorian.rinor1@student.uni.local` / `Student123!`

## Rrjedha e Autentikimit

- Access token ruhet ne `sessionStorage`
- Refresh token ruhet ne cookie `httpOnly`
- Kur access token skadon, frontend ben `POST /api/auth/refresh`
- Refresh token rrotullohet ne cdo rifreskim te sesionit
- `POST /api/auth/logout` e revokon sesionin aktiv
- Ndryshimi i fjalekalimit revokon refresh token-et ekzistuese dhe kerkon login te ri

## API Overview

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/dashboard`
- `PUT /api/auth/password`

### Admin CRUD

- `GET|POST /api/studentet`
- `GET|PUT|DELETE /api/studentet/:id`
- `GET|POST /api/profesoret`
- `GET|PUT|DELETE /api/profesoret/:id`
- `GET|POST /api/lendet`
- `GET|PUT|DELETE /api/lendet/:id`
- `GET|POST /api/drejtimet`
- `GET|PUT|DELETE /api/drejtimet/:id`
- `GET|POST /api/fakultetet`
- `GET|PUT|DELETE /api/fakultetet/:id`
- `GET|POST /api/departamentet`
- `GET|PUT|DELETE /api/departamentet/:id`
- `GET|POST /api/regjistrimet`
- `GET|PUT|DELETE /api/regjistrimet/:id`
- `GET|POST /api/provimet`
- `GET|PUT|DELETE /api/provimet/:id`
- `GET|POST /api/notat`
- `GET|PUT|DELETE /api/notat/:id`
- `GET|POST /api/oraret`
- `GET|PUT|DELETE /api/oraret/:id`

### Profesor Portal

- `GET /api/profesor/profili`
- `GET /api/profesor/lendet`
- `GET /api/profesor/lendet/:id/studentet`
- `GET|POST /api/profesor/provimet`
- `PUT|DELETE /api/profesor/provimet/:id`
- `GET /api/profesor/provimet/:id/studentet`
- `GET /api/profesor/orari`
- `POST /api/profesor/notat`
- `PUT /api/profesor/notat/:id`

### Student Portal

- `GET /api/student/profili`
- `GET /api/student/notat`
- `GET /api/student/regjistrimet`
- `GET /api/student/provimet`
- `GET /api/student/orari`

## Shenime

- Backend lejon qasje nga origjinat e listuara ne `FRONTEND_ORIGINS`
- `backend/utils/authSetup.js` krijon automatikisht tabelat e autentikimit qe mungojne
- `frontend/vite.config.js` perdor code splitting per chunk-et kryesore
