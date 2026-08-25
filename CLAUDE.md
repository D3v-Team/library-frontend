# CLAUDE.md

Guidance for Claude Code when working in this repository. Read this before
touching code — it captures the invariants and traps that are not obvious from
any single file.

---

## 1. What this project is

Frontend SPA for **Chinoz Axborot-Kutubxona Markazi** (a public library in
Uzbekistan). One React app serves two audiences:

- **Public site** — multilingual (uz-latin / uz-cyrillic / ru): home page, book
  catalog, authors, news, events, media albums, documents, contact.
- **Admin panel** at `/admin/*` — CRUD over every content type, Uzbek-only UI,
  gated by role.

- Repo: `https://github.com/D3v-Team/library-frontend`, branch `main`.
- Backend: `https://book.udsgroup.uz/api` — REST, JWT Bearer, **hardcoded** in
  `src/store/api.js` (`BASE_URL`). No `.env` file exists in the repo.
  **Live OpenAPI spec: `https://book.udsgroup.uz/api/docs-json`** (Swagger UI at
  `/api/docs`) — use it to check any endpoint contract instead of guessing.
  Note it documents request DTOs but almost no response schemas.
- Deploy: Netlify (`netlify.toml`, SPA fallback to `index.html`).
- Docs: `README.md` (full documentation), `Recommendations.md` (security +
  optimization backlog). Keep all three in sync when architecture changes.

## 2. Stack

React 18.3 · Vite 5.4 · react-router-dom 6 · Redux Toolkit + **RTK Query** ·
axios · js-cookie · Tailwind CSS 3.4 · framer-motion · lucide-react ·
react-hot-toast · i18next/react-i18next · react-helmet-async · **dompurify** ·
ESLint 9 flat config.

JavaScript only — **no TypeScript**, no test framework, no CI.

## 3. Commands

```bash
npm run dev        # Vite dev server (5173)
npm run build      # → dist/
npm run preview    # serve dist/
npm run lint       # ESLint (currently 206 errors / 4 warnings — pre-existing)
```

Lint baseline (do not treat as regressions you caused): 143 `react/prop-types`,
36 `no-unused-vars`, 21 `react/no-unescaped-entities`, 4
`react-hooks/exhaustive-deps`, 4 `no-dupe-keys`, 2 `no-undef`.
When touching a file, avoid *adding* new lint errors.

## 4. Directory map

```
src/
  main.jsx            StrictMode → HelmetProvider → <App/> + <Toaster/>
  App.jsx             redux Provider → BrowserRouter → AppRouter
  app/
    router/           AppRouter.jsx, routes.config.js, RoleGuard.jsx
    layout/           PublicLayout.jsx (header/footer/animation), MainLayout.jsx (admin shell)
    navigation/       adminMenu.config.js  ← LIVE.  sidebar.config.js ← DEAD
    permissions/      roles.js ← DEAD (lowercase roles, unused)
  store/
    index.js          configureStore: auth slice + 16 RTK Query APIs (all eager)
    api.js            BASE_URL + axios instance + interceptors + refresh flow
    authCookies.js    cookie names/options + token helpers (single source of truth)
    baseQuary/axiosBaseQuery.js   (note the typo in the folder name — keep it)
    slices/auth.slice.js
    services/*.js     one createApi per resource
  Pages/
    Home/ Books/ News/ Events/ Documents/ About/ Contact/ Services/ NotFound/ Forbidden/
    Admin/            17 pages + components/ + utils/validators.js
  Components/
    Common/           Login/, Login/Header/Header.jsx (public header), Login/Footer/, BackToTop, Messag
    Other/            Sidebar/, Header/AdminHeader, UI/(Loading, EmptyData, Icons, Alert)
  I18n/               index.js + locales/{uz,ru,cyrl}.json (210 keys each, all complete)
  seo/                SEO.jsx, seoConfig.js, seoUtils.js
  utils/              sanitize.js (DOMPurify), url.js (safeHref) — security helpers
  hooks/useLazySection.js
  Images/logo.png     (180 kB)
```

Note the unusual casing: `Pages/`, `Components/`, `I18n/`, `Images/` are
capitalized; `app/`, `store/`, `seo/`, `hooks/` are not. Match whatever the
surrounding folder already does.

`@` → `src` alias exists in `vite.config.js` but most code uses relative
imports. Follow the local file's style.

## 5. Data flow (the one pattern that matters)

```
component → useGetXQuery / useXMutation
          → RTK Query endpoint (store/services/*.js)
          → axiosBaseQuery({url, method, data, params})
          → $api (axios): request adds `Authorization: Bearer <cookie token>`
                          response 401 → clear cookie + window.location = "/login"
          → https://book.udsgroup.uz/api
```

Rules that hold everywhere:

- **No manual `refetch()`, no thunks for data.** Cache invalidation is via
  `tagTypes` / `providesTags` / `invalidatesTags`. List tag id is the literal
  string `"LIST"`.
- **Redux holds only `auth`.** Everything else is RTK Query cache + local
  `useState`. Do not introduce new slices for server data.
- **List responses** are `{ data: [...], meta: { total, totalPages, ... } }`.
  Components read `data?.data ?? []` and `data?.meta?.totalPages ?? 1`.
- **List query args**: `{ page = 1, limit = 10, search = "", sortBy, sortOrder, ...filters }`.
- **Errors** are normalized to `{ status, data }`; user-facing message is always
  `err?.data?.message || "<uzbek fallback>"` inside a `toast.error`.
- **FormData** is auto-detected in `axiosBaseQuery` (it unsets `Content-Type`).
  Each service that uploads has its own local `toFormData(fields)` helper.
- **Critical upload rule**: image fields (`cover_image`, `icon_image`) are only
  appended when `value instanceof File`. Appending anything else on update
  wipes the existing image server-side. Preserve this check when editing
  service files.

## 6. Auth & roles — exact strings matter

- Login: `POST /auth/login` with `{ phone_number, password }` →
  `{ user, tokens: { access_token, refresh_token } }`.
- Allowed admin roles are the **uppercase** strings `"ADMIN"` and
  `"SUPER_ADMIN"`, defined in two places that must stay in sync:
  `ALLOWED_ROLES` in `Components/Common/Login/index.jsx` and `ADMIN_ROLES` in
  `app/router/routes.config.js`, plus the literal array in `AppRouter.jsx`
  (`<RoleGuard allow={["ADMIN","SUPER_ADMIN"]} />`).
- `app/permissions/roles.js` exports lowercase `admin/manager/user` and is
  **not used** — do not wire it in without also changing the backend contract.
- Cookies are owned by `store/authCookies.js` — the **only** place that knows
  cookie names and options (`token`, `refresh_token`, `role`, `user_id`;
  7 days, `sameSite: strict`, `path: /`, `secure` only in prod). Both
  `auth.slice.js` and `api.js` go through it. Never write these cookies
  directly with `js-cookie` again.
- **`user_id` is load-bearing**: `POST /auth/refresh` takes
  `{ userId, refreshToken }` (camelCase!), so the refresh flow cannot work
  without the user id. `setAuth` derives it from `user.id` (falling back to
  `user_id` / `userId`), and `getUserId()` falls back to decoding the JWT
  `sub` claim if the cookie is absent.
- **Refresh flow lives in the `$api` response interceptor** (`store/api.js`):
  401 → refresh → retry the original request transparently. Properties that
  must be preserved when touching that file:
  - the refresh call uses a **separate axios instance** (`refreshClient`,
    15s timeout) — using `$api` would attach the dead token and recurse;
  - **single-flight**: concurrent 401s share one `refreshPromise`, so the
    backend sees exactly one refresh even when 5 queries fail at once
    (important: refresh-token rotation would invalidate parallel calls);
  - `config._isRetry` guards against a second attempt on the same request;
  - `/auth/login`, `/auth/refresh`, `/auth/logout` are excluded — a 401 there
    is a real failure, not an expired token;
  - the response parser accepts `{tokens:{access_token}}`, `{access_token}`,
    `{accessToken}` and `{data:{tokens:…}}` (the backend's refresh response
    shape is undocumented in OpenAPI);
  - a new `refresh_token` in the response is stored (rotation-safe);
  - failure (backend answers **403** `"Ruxsat yo'q!"`) or a token-less 200 →
    `forceLogout()`: clear cookies + `window.location.href = "/login"`, but
    never when already on `/login` (loop) and never for a visitor who had no
    token cookie (public pages must not bounce to login).
- Backend status codes worth remembering: expired/invalid access token →
  **401** `"Token noto'g'ri yoki muddati tugagan!"`; rejected refresh →
  **403** `"Ruxsat yo'q!"`; malformed refresh body → **400** with validation
  messages.
- `RoleGuard` trusts the `role` cookie (client-side gate only). Real
  authorization is the backend's job; never present the guard as a security
  control.
- `users.js` `createUser` hardcodes `role: "ADMIN"` in the request body.

## 7. Routing

`app/router/routes.config.js` is the single source of truth: `ROUTES` (public,
rendered inside `PublicLayout`) and `ADMIN_ROUTES` (inside `RoleGuard` →
`MainLayout`). Every page is `React.lazy`.

Quirks to know:
- `/login` appears **both** in `ROUTES` and as a separate `<Route>` in
  `AppRouter.jsx` (which does an inline `ROUTES.find(...)` lookup). Duplicated
  on purpose-ish; don't be surprised.
- The catch-all `{ path: "*" }` must stay **last** in `ROUTES`.
- Public routes use `<Suspense fallback={null}>`, admin routes use
  `<Suspense fallback={<Loading />}>`.

**Adding an admin section = 5 edits** (missing any one silently breaks it):
1. `store/services/<resource>.js` — `createApi` with tags;
2. `store/index.js` — add reducer **and** middleware;
3. `Pages/Admin/<Resource>.jsx` — CRUD page (pattern below);
4. `app/router/routes.config.js` → `ADMIN_ROUTES`;
5. `app/navigation/adminMenu.config.js` → `ADMIN_MENU` (sidebar + Dashboard grid
   both derive from this array).

## 8. Content model — trilingual suffixes

Every text field exists three times: `*_latin` (uz latin), `*_cyril` (uz
cyrillic), `*_ru`. Note the spelling: **`_cyril`** in API payloads, while the
i18n language code is **`cyrl`**. Do not conflate them.

Language pick in public components:

```js
const lang = i18n.language;                 // "uz" | "ru" | "cyrl"
if (lang === "ru")   return item.title_ru;
if (lang === "cyrl") return item.title_cyril;
return item.title_latin;
```

Enums used by the UI:
- Document `category`: `LAW | DECISION | ORDER | REPORT`
- Media `type`: `PHOTO | VIDEO`
- Page `slug`: `ABOUT | PRIVACY_POLICY | FAQ` (others commented out)
- OnlineRequest `type`: `BOOK_ORDER | INQUIRY | QUESTION_ANSWER | VIRTUAL_REFERENCE`
- OnlineRequest `status`: `NEW | IN_PROGRESS | ANSWERED | DONE`
- Social `platform`: lowercase (`telegram`, `instagram`, ...) — it is also the
  path parameter for social-link endpoints.
- Book `grade_level`: 1–11.

Media URLs from the API are relative; resolve with
`Pages/Books/bookHelpers.js` → `resolveMediaUrl()` / `getBookCoverUrl()`, or
`seo/seoUtils.js` → `resolveSeoImage()`. Several admin pages also inline their
own `getImageUrl(url)` doing `BASE_URL + url` — prefer the shared helper in new
code.

## 9. Admin CRUD page pattern

Reference implementation: `Pages/Admin/Books.jsx`. Every page repeats it:

- module-level `emptyForm` object and `formSchema` array of
  `{ field, validators: [...] }` using `utils/validators.js`;
- local state: `page`, `search`, filters, `modalOpen`, `editing`, `form`,
  `errors`, `deleteTarget`, and `activeLang` (`"latin" | "cyril" | "ru"`) for
  the language tabs;
- one `Modal` used for both create and edit (`editing === null` ⇒ create);
- `handleSubmit`: `validateForm` → on failure `toast.error("Formada xatolar bor")`;
  on success `await mutation(...).unwrap()` → `toast.success(...)` → close modal;
- delete via `deleteTarget` state + `<ConfirmDialog />`.

Shared components live in `Pages/Admin/components/`: `AdminPageHeader`, `Modal`,
`ConfirmDialog`, `FormField` (`as="textarea"|"select"`), `MultiSelect`,
`ImageUploadField`, `FileUploadField`/`FileListItem`, `ListControls`
(`SearchInput`, `FilterSelect`, `StatusBadge`), `Pagination`.
`AdminTablePlaceholder` is dead sample markup — don't build on it.

Reuse these instead of hand-rolling; the modal owns scroll-lock and ESC
handling, and `Pagination` renders nothing when `totalPages <= 1`.

## 10. Styling

Tailwind utilities inline, no CSS modules. `src/index.css` has the Tailwind
directives, the `Plus Jakarta Sans` base font (loaded from Google Fonts in
`index.html`) and a `.Container` helper (max 1430px). Palette: `slate-*`
neutral, `blue-600` admin accent, `red-*` destructive, `green-*` success.
Mobile-first; the admin sidebar is fixed at `md:` and a drawer below it.
Several files write multi-line className strings — keep the local formatting.

## 11. i18n

`src/I18n/index.js`: resources `uz`, `ru`, `cyrl`; `fallbackLng: "uz"`;
detection order `localStorage` → `navigator`, cached in `localStorage`.
All three locale files have the same 210 keys — **when adding a key, add it to
all three**. `supportedLngs: ["uz","ru","cyrl"]`, `nonExplicitSupportedLngs`,
`load: "languageOnly"` and `detection.convertDetectedLanguage` are set, so
`i18n.language` is guaranteed to be exactly `uz` | `ru` | `cyrl` — the
`i18n.language === "uz"` comparisons scattered through the components rely on
that. Do not remove those options: a browser reporting `en-GB` / `uz-UZ` would
otherwise leak straight into `i18n.language`.

Admin panel strings are hardcoded Uzbek, not translated. Keep new admin copy in
Uzbek to match.

## 12. SEO

`seo/SEO.jsx` accepts `{ title, description, keywords, image, path, type,
noIndex, publishedTime, modifiedTime, jsonLd }` — nothing else. It writes title,
description, keywords, robots, canonical, OG, Twitter and optional JSON-LD.
Static copy lives in `seoConfig.js` (`SEO_CONFIG.<page>`); dynamic pages build
props from the API response with `truncateForMeta` / `resolveSeoImage`.
`getSiteUrl()` = `VITE_SITE_URL` → `window.location.origin` → `DEFAULT_SITE_URL`.

Note: `SEO_CONFIG` previously had duplicate `books` / `contact` / `faq` keys —
fixed. If you add page config, remember `SEO.jsx` ignores `openGraph` /
`twitter` / `canonical` shapes: use flat `image` / `path` instead.

## 13. Known landmines (verified, not hypothetical)

- `store/services/documents.api.js`: `getAdminDocuments` is declared **twice**;
  the first (tag-less) declaration is silently overwritten.
- `seo/seoConfig.js`: the duplicate `books`/`contact`/`faq` keys were fixed by
  the repo owner on 2026-08-24 — each key now appears once and every
  `SEO_CONFIG.<key>` referenced in the pages resolves. Do not re-add duplicates.
- URL handling is now hardened — keep it that way: `validators.js` `isValidUrl`
  enforces an `http:`/`https:` allowlist (form side), and `utils/url.js`
  `safeHref()` sanitizes every admin-entered URL at render time (returns `null`
  for `javascript:` / `data:` / garbage). All 8 render sites go through
  `safeHref`. Never put a raw API/admin URL straight into `href`.
- `Pages/About/About.jsx`, `Services/FAQ.jsx`, `Services/Policy.jsx` render API
  HTML through `dangerouslySetInnerHTML` — always wrapped in
  `sanitizeHtml()` from `utils/sanitize.js` (DOMPurify, tag/attr allowlist,
  `script`/`iframe`/`form`/inline handlers stripped). Any new
  `dangerouslySetInnerHTML` must use it too.
- `Pages/Home/Statistics/Statistics.jsx` numbers are hardcoded constants.
- `Pages/Admin/Dashboard.jsx` is a link grid; its copy still says
  "Backend ulangach…" although the backend is wired.
- `store/index.js` imports all 16 API slices eagerly → they land in the entry
  chunk (~191 kB raw), so public visitors download admin endpoint definitions.
- `books.api.js`: `getBookFiles` and `getBookImages` both GET `/books/:id` —
  the same URL as `getBookById` (three cache entries for one resource).
- `vite.config.js` `manualChunks` lists `@mui/*`, `apexcharts`, `recharts`
  which nothing imports → empty `vendor-mui` / `vendor-charts` chunks.
- Unused dependencies still in `package.json`: MUI + emotion +
  `@mui/styled-engine-sc`, styled-components, gsap / gsap-trial / @gsap/react,
  apexcharts + react-apexcharts, recharts, swiper, react-select, react-loading,
  qrcode.react, react-qr-code, react-icons, @heroicons/react, dayjs,
  react-sweetalert2. `Components/Other/UI/Alert/Alert.js` (sweetalert2) is dead code.
- `index.html` has `<link rel="icon" href="">` (empty) and there is **no
  `public/` folder**, so `DEFAULT_OG_IMAGE` (`/og-image.jpg`) 404s.
- No error boundary anywhere; `Components/Other/ErrorPage/ErrorPage.jsx` is unused.
- No scroll-reset on navigation.
- `npm audit`: 2 moderate advisories left (was 13). Both are `react-router`
  open-redirect / SSR-hydration issues fixable only by the breaking upgrade to
  react-router-dom v7 — deliberately not taken. `package.json` pins
  `react-router-dom ^6.30.6` and `axios ^1.19.0`; do not lower those ranges.
- `Pages/Home/NewBooks` marquee is **CSS keyframes** (`newBooksMarquee` in
  `src/index.css` + per-column inline `animationDuration`), not framer-motion.
  It was converted because `AnimatePresence initial={false}` in `PublicLayout`
  blocked the initial animation on first load, leaving the tracks frozen at
  `translateY(-50%)`. `initial={false}` has since been removed, so the page
  wrapper now plays its entrance animation on first load too.
- Dead config: `app/navigation/sidebar.config.js`, `app/permissions/roles.js`.

Do not "fix" these opportunistically in unrelated work — they are tracked in
`Recommendations.md`. Fix them when asked, or mention them if the current task
touches the same file.

## 14. Conventions to follow

- Functional components, hooks, `export default` per page/component.
- `PascalCase.jsx` for components, `camelCase.js` for helpers, `*.config.js` for
  config, `*.api.js` or plain `*.js` for services (both spellings exist).
- User-visible strings in Uzbek (public site strings go through `t()`; admin
  strings are literal).
- Toasts for every mutation outcome; no `console.log` (there are currently zero
  in `src/`, keep it that way).
- No new dependency without a clear need — the project already carries many
  unused ones.
- Don't commit or push unless asked. `dist/` is git-ignored build output —
  never edit it by hand.
