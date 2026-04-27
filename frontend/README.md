# Frontend

Ky frontend eshte ndertuar me `React + Vite + Tailwind CSS`.

## Komanda

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Konfigurimi

Krijo `frontend/.env` duke u bazuar ne `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

## Shenime

- Routat kryesore perdorin `lazy loading`
- API klienti perdor `withCredentials` per refresh token cookie
- Dokumentimi i plote i projektit dhe API-se gjendet ne `../README.md`

## Ku te editosh UI-ne

Ky projekt nuk perdor faqe HTML statike per secilen pamje. HTML-ja qe shfaqet ne shfletues gjenerohet nga komponentet `React` ne `frontend/src`.

- `frontend/dist/` eshte output i gjeneruar nga build-i. Mos e edito manualisht sepse do te mbishkruhet.
- `frontend/index.html` mban vetem shell-in baze (`<div id="root"></div>`) dhe metadata si titulli ose favicon.
- `frontend/src/main.jsx` nis aplikacionin React dhe e mount-on te `#root`.
- `frontend/src/App.jsx` kontrollon layout-in kryesor dhe routat. Nese do te shtosh/heqesh nje page ose te ndryshosh strukturen baze, nis ketu.
- `frontend/src/components/Navbar.jsx` kontrollon sidebar-in e majte.
- `frontend/src/components/Topbar.jsx` kontrollon header-in e siperme.
- `frontend/src/utils/navigation.js` kontrollon etiketat, ikonat dhe link-et e navigimit.
- `frontend/src/pages/*.jsx` kontrollojne permbajtjen reale te cdo faqeje. Shembuj:
  - `frontend/src/pages/Dashboard.jsx` per dashboard-in
  - `frontend/src/pages/studentsPage.jsx` per faqen e studenteve
  - `frontend/src/pages/profesoretPage.jsx` per faqen e profesoreve
- `frontend/src/index.css` mban stilimet globale.

## Rregull i thjeshte

Nese do te ndryshosh:

- tekstin ose cards ne nje faqe: edito `frontend/src/pages/...`
- sidebar-in: edito `frontend/src/components/Navbar.jsx` ose `frontend/src/utils/navigation.js`
- header/topbar: edito `frontend/src/components/Topbar.jsx`
- ngjyrat, spacing ose stile globale: edito `frontend/src/index.css`

Per te pare ndryshimet live gjate editimit:

```bash
cd frontend
npm run dev
```
