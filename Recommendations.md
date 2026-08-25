# Recommendations.md — Xavfsizlik va optimizatsiya takliflari

Loyihaning `main` branchidagi holati bo'yicha tahlil (audit sanasi: 2026-08-23,
oxirgi yangilanish: 2026-08-24).

> **Holat:** S1, S2, S3 bandlari **bajarildi** (quyida ✅ bilan belgilangan).
> S8 tekshiruvda **xato topilma** bo'lib chiqdi va olib tashlandi.
Har bir band **tekshirilgan fakt** asosida yozilgan: fayl va satr ko'rsatilgan,
ta'siri va aniq yechimi berilgan.

**Ustuvorlik belgilari**
- 🔴 **P0** — tezda bajarilishi kerak (xavfsizlik yoki buzilgan xatti-harakat)
- 🟠 **P1** — yaqin sprintda (sezilarli xavf yoki katta yutuq)
- 🟡 **P2** — rejalashtirilgan yaxshilash / texnik qarz

---

## Qisqa xulosa

| # | Muammo | Ustuvorlik | Turi |
|---|---|---|---|
| S1 | ✅ **Bajarildi** — API HTML DOMPurify bilan sanitizatsiya qilinadi | 🔴 P0 | XSS |
| S2 | ✅ **Bajarildi** — `isValidUrl` tiklandi + `safeHref` render himoyasi | 🔴 P0 | XSS |
| S3 | ✅ **Bajarildi** — 13 → 2 moderate (qolgani v7 upgrade talab qiladi) | 🔴 P0 | Dependency |
| S4 | Token JS o'qiy oladigan cookie'da (`js-cookie`) | 🟠 P1 | Token o'g'irlash |
| S5 | ✅ **Bajarildi** — refresh oqimi ishlaydi (single-flight, rotation) | 🟠 P1 | Sessiya |
| S6 | `RoleGuard` cookie'dagi `role` ga ishonadi | 🟠 P1 | Authz |
| S7 | Security headerlar / CSP yo'q (Netlify) | 🟠 P1 | Header |
| ~~S8~~ | ❌ **Xato topilma** — 10 ta havolaning hammasida `rel` mavjud | — | — |
| S9 | `BASE_URL` kodda qat'iy yozilgan | 🟠 P1 | Konfiguratsiya |
| S10 | Ommaviy formalarda spam himoyasi yo'q | 🟡 P2 | Abuse |
| S11 | Fayl validatsiyasi faqat clientda | 🟡 P2 | Upload |
| S12 | `createUser` da `role: "ADMIN"` clientda belgilanadi | 🟡 P2 | Authz |
| O1 | Store 16 ta API'ni eager import qiladi (entry ~191 kB) | 🟠 P1 | Bundle |
| O2 | Ishlatilmaydigan 18+ paket (MUI, GSAP, charts, swiper...) | 🟠 P1 | Bundle |
| O3 | `framer-motion` to'liq yuklanadi (gzip ~44 kB) | 🟠 P1 | Bundle |
| O4 | `logo.png` 180 kB, favicon/og-image yo'q | 🟠 P1 | Assets |
| O5 | `documents.api.js` da takroriy kalit (seoConfig ✅ tuzatildi) | 🔴 P0 | Bug |
| O6 | Bitta resurs uchun 3 marta bir xil so'rov (`/books/:id`) | 🟡 P2 | Network |
| O7 | Error boundary yo'q — oq ekran xavfi | 🟠 P1 | Barqarorlik |
| O8 | Navigatsiyada scroll tepaga qaytmaydi | 🟡 P2 | UX |
| O9 | i18n `supportedLngs` yo'q — `uz-UZ` mos kelmaydi | 🟡 P2 | Bug |
| O10 | Statistika raqamlari qat'iy yozilgan | 🟡 P2 | Kontent |
| O11 | ESLint'da 206 xato, test yo'q | 🟡 P2 | Sifat |
| O12 | Netlify'da cache header'lar sozlanmagan | 🟡 P2 | Perf |
| O13 | Rasmlar uchun `width/height`, `decoding` yo'q | 🟡 P2 | CLS |
| O14 | SPA — SEO meta teglar botlar uchun ko'rinmaydi | 🟡 P2 | SEO |

---

# 1-qism. Xavfsizlik

## S1 ✅ ~~API'dan kelgan HTML sanitizatsiyasiz render qilinadi~~ — BAJARILDI

**Qayerda:** `src/Pages/About/About.jsx:108`, `src/Pages/Services/FAQ.jsx:104`,
`src/Pages/Services/Policy.jsx:104` — uchtasi ham
`dangerouslySetInnerHTML={{ __html: content }}`.

**Xavf:** kontent `/pages/:slug` endpointidan keladi va admin panelda yoziladi.
Agar admin hisobi buzilsa yoki backend kirish nazorati yetarli bo'lmasa, saytning
bosh sahifasiga `<script>` / `<img onerror=...>` joylash mumkin. Token
JS-o'qiladigan cookie'da bo'lgani uchun (S4) bu to'g'ridan-to'g'ri sessiya
o'g'irlashga olib boradi.

**Yechim:**

```bash
npm i dompurify
```

```jsx
// src/seo/../utils/sanitize.js (yangi fayl, masalan src/utils/sanitize.js)
import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p","br","strong","em","u","s","ul","ol","li","a",
  "h1","h2","h3","h4","blockquote","table","thead","tbody","tr","th","td","img",
];

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt"],
    FORBID_ATTR: ["style", "onerror", "onload"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
  });
}
```

```jsx
// About.jsx / FAQ.jsx / Policy.jsx
import { sanitizeHtml } from "../../utils/sanitize";
...
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
```

**Bajarilgan holat:** `src/utils/sanitize.js` yaratildi (DOMPurify, teg/atribut
allowlist, `afterSanitizeAttributes` hooki bilan `target="_blank"` havolalarga
`rel="noopener noreferrer"` avtomatik qo'shiladi). `About.jsx`, `FAQ.jsx`,
`Policy.jsx` dagi `dangerouslySetInnerHTML` shu funksiyadan o'tadi.
Sinov natijasi: `<script>`, `<iframe>`, `<form>`, `<style>`, `<svg onload>`,
`onerror`/`onclick` atributlari va `javascript:` href'lar olib tashlandi;
qonuniy kontent (2275 / 1878 / 3719 belgi) o'zgarishsiz render bo'ldi.

---

## S2 ✅ ~~`isValidUrl` ishlamaydi — `javascript:` havolalar filtrlanmaydi~~ — BAJARILDI

**Qayerda:** `src/Pages/Admin/utils/validators.js` — funksiya tanasi to'liq
izohga olingan, ya'ni har qanday qiymat uchun `undefined` qaytaradi:

```js
export function isValidUrl(value) {
  // if (!value) return null;
  // try { new URL(value); return null; } catch { ... }
}
```

Shu bilan birga admin kiritgan URL'lar bevosita `href` ga qo'yiladi:
`Pages/Admin/Links.jsx:332`, `Pages/Admin/ContactInfo.jsx:534`,
`Pages/Home/UseFullLinks/UseFullLinks.jsx:155`, `Pages/Documents/Documents.jsx:187`,
`Pages/Home/components/Hero.jsx:193` (banner `link_url`).

**Xavf:** `javascript:alert(document.cookie)` ko'rinishidagi havola saqlanib,
foydalanuvchi ustiga bosganda ishga tushadi (stored XSS). Bundan tashqari `data:` URL'lar
orqali fishing sahifasi ochish mumkin.

**Yechim — validatorni protokol allowlist bilan tiklash:**

```js
const ALLOWED_URL_PROTOCOLS = ["http:", "https:"];

export function isValidUrl(value) {
  if (!value) return null;
  let parsed;
  try {
    parsed = new URL(String(value).trim());
  } catch {
    return "Havola (URL) formati noto‘g‘ri";
  }
  if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
    return "Faqat http:// yoki https:// havolalar ruxsat etilgan";
  }
  return null;
}
```

**Va render vaqtida ham himoya** (backendda eski yozuvlar qolgan bo'lishi mumkin):

```js
// src/utils/url.js
export function safeHref(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)
      ? parsed.href
      : "#";
  } catch {
    return "#";
  }
}
```

**Bajarilgan holat:**
- `validators.js` → `isValidUrl` tiklandi (`ALLOWED_URL_PROTOCOLS` = http/https).
- `src/utils/url.js` → `safeHref()` / `isSafeHref()` yaratildi.
- 8 ta render joyi `safeHref` dan o'tadi: `UseFullLinks`, `Hero`, `Footer`,
  `ContactHome`, `Contact`, `Media`, admin `Links`, admin `ContactInfo`.
- `Links.jsx` ga to'liq forma validatsiyasi qo'shildi (avval hech qanday
  tekshiruv yo'q edi): `formSchema`, `errors` holati, `validateForm`.
- `ContactInfo.jsx` ijtimoiy havola formasiga URL validatsiyasi qo'shildi.
- Sinov: `javascript:`, `JaVaScRiPt:`, `data:text/html`, `vbscript:` → `null`;
  `https://lex.uz`, `lex.uz`, `/books`, `mailto:`, `tel:` → to'g'ri ishlaydi.

---

## S3 ✅ ~~Paket zaifliklari (13 ta advisory)~~ — BAJARILDI (2 ta qoldi)

`npm audit --omit=dev` natijasi: **9 high, 3 moderate, 1 low**.

| Paket | Muammo |
|---|---|
| `react-router-dom` 6.28 → `@remix-run/router` | **XSS via open redirect** (GHSA-2w69-qvjg-hvjx), `//` bilan boshlanadigan protocol-relative redirect (GHSA-2j2x-hqr9-3h42) |
| `axios` 1.13 | 20+ advisory: prototype pollution → header injection / request hijacking, SSRF (`NO_PROXY` bypass), ReDoS |
| `sweetalert2` | GHSA-mrr8-v49w-3333 (o'lik kod orqali kelgan — S/O2 ga qarang) |
| `postcss` (`styled-components` orqali) | sourceMappingURL orqali arbitrary `.map` faylni o'qish |
| `yaml` (`cosmiconfig` orqali) | Stack overflow (DoS) |

**Yechim:**

```bash
npm audit fix
npm i react-router-dom@^6.30.3 axios@latest
npm uninstall styled-components @mui/styled-engine-sc react-sweetalert2
npm run build && npm run lint
```

**Bajarilgan holat:** `npm audit fix` ishga tushirildi (breaking o'zgarishsiz).
- `axios` 1.13.2 → **1.19.0** (barcha prototype pollution / SSRF advisorylari yopildi)
- `react-router-dom` 6.28.0 → **6.30.6** (high darajadagi open-redirect XSS yopildi)
- `postcss`, `yaml`, `sweetalert2` tranzitiv zaifliklari yopildi
- `package.json` da minimal versiyalar ko'tarildi (`^6.30.6`, `^1.19.0`), shunda
  qayta o'rnatishda zaif versiya tushmaydi

**Natija: 13 → 2 advisory** (9 high yopildi). Qolgan 2 tasi moderate darajada,
`react-router` da: faqat **react-router-dom v7** ga breaking upgrade bilan
yopiladi — bu alohida qaror va alohida test talab qiladi, shuning uchun
qilinmadi.

Doimiy nazorat uchun GitHub Dependabot yoki oddiy CI qadamini qo'shish:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm audit --omit=dev --audit-level=high
```

---

## S4 🟠 Access token JavaScript o'qiy oladigan cookie'da

**Qayerda:** `src/store/slices/auth.slice.js` (`Cookies.set("token", ...)`),
`src/store/api.js` (`Cookies.get("token")`).

Hozirgi sozlama: `expires: 7`, `sameSite: "strict"`, `secure: import.meta.env.PROD`.
`httpOnly` **qo'yilmagan** (js-cookie printsipial ravishda qo'ya olmaydi).

**Xavf:** istalgan XSS (S1/S2) darhol 7 kunlik admin tokenini o'g'irlaydi.

**Yechim (tavsiya etilgan tartibda):**

1. **Eng to'g'ri yo'l — backend bilan birga:** `access_token` va `refresh_token`
   ni backend `Set-Cookie: HttpOnly; Secure; SameSite=Strict; Path=/` bilan
   qaytarsin; frontend `withCredentials: true` bilan ishlaydi va tokenni umuman
   ko'rmaydi.

   ```js
   // src/store/api.js
   export const $api = axios.create({
     baseURL: `${BASE_URL}/api`,
     withCredentials: true,               // cookie'lar avtomatik yuboriladi
     headers: { "Content-Type": "application/json" },
   });
   // request interceptor'dagi Authorization qo'shish olib tashlanadi
   ```

2. **Backendni o'zgartirish imkoni bo'lmasa:** access tokenni **faqat xotirada**
   (Redux `auth.token`) saqlash, cookie'da esa faqat `refresh_token` qolishi;
   sahifa yangilanganda refresh orqali qayta olish (S5 bilan birga bajariladi).

3. **Minimal yaxshilash (bugun bajarish mumkin):** muddatni qisqartirish va
   `path` belgilash:

   ```js
   const cookieOptions = {
     expires: 1,                 // 7 kun → 1 kun
     sameSite: "strict",
     secure: import.meta.env.PROD,
     path: "/",
   };
   ```

---

## S5 ✅ ~~Refresh token saqlanadi, lekin ishlatilmaydi~~ — BAJARILDI

**Qayerda:** `auth.slice.js` `refresh_token` ni cookie'ga yozadi, ammo hech qayerda
o'qilmaydi. `src/store/api.js` esa har qanday `401` da:

```js
Cookies.remove("token");
window.location.href = "/login";
```

**Muammo:** (a) admin ish o'rtasida to'ldirilmagan forma bilan chiqib ketadi;
(b) `window.location.href` SPA'ni to'liq qayta yuklaydi; (c) ommaviy sahifadagi
tasodifiy 401 ham tashrifchini `/login` ga uloqtiradi.

**Yechim — interceptorda navbat (queue) bilan refresh:**

```js
// src/store/api.js
let isRefreshing = false;
let queue = [];

const flush = (error, token) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
};

$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthCall = config?.url?.includes("/auth/");

    if (response?.status !== 401 || config?._retried || isAuthCall) {
      return Promise.reject(error);
    }

    config._retried = true;

    if (isRefreshing) {
      const token = await new Promise((resolve, reject) => queue.push({ resolve, reject }));
      config.headers.Authorization = `Bearer ${token}`;
      return $api(config);
    }

    isRefreshing = true;
    try {
      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) throw error;

      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
        refresh_token: refreshToken,
      });

      Cookies.set("token", data.access_token, cookieOptions);
      flush(null, data.access_token);

      config.headers.Authorization = `Bearer ${data.access_token}`;
      return $api(config);
    } catch (refreshError) {
      flush(refreshError);
      store.dispatch(logout());          // window.location.href o'rniga
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
```

**Bajarilgan holat.** Backendda `POST /api/auth/refresh` **mavjud** ekan
(OpenAPI: `https://book.udsgroup.uz/api/docs-json`) va u
`{ userId, refreshToken }` (camelCase) kutadi.

Amalga oshirilgani:
- `src/store/authCookies.js` (yangi) — cookie nomlari/sozlamalari uchun yagona
  manba + `user_id` cookie'si (refresh uchun majburiy) + JWT `sub` dan
  zaxira o'qish.
- `src/store/api.js` — 401 → refresh → asl so'rovni qayta yuborish oqimi;
  alohida `refreshClient` (15s timeout), single-flight navbat, `_isRetry`
  himoyasi, auth endpointlarini chetlab o'tish, 4 xil javob shaklini qabul
  qilish, rotation, `forceLogout` (tsikl va ommaviy tashrifchi himoyasi).
- `src/store/slices/auth.slice.js` — `userId` ni saqlaydi va tiklaydi.

Sinov natijalari (brauzerda, tarmoq stub qilingan holda):
`401 → refresh → 200` ✔ | 5 parallel 401 → **1** refresh ✔ | 403 → cookie
tozalash + `/login` ✔ | login 401 da refresh urinishi yo'q ✔ | tokensiz
tashrifchi redirect qilinmaydi ✔ | 4 javob shakli ✔ | `user_id` cookie
bo'lmasa JWT `sub` dan olinadi ✔

**Qolgan yagona tekshiruv:** haqiqiy login bilan `user_id` cookie'si
yozilishini ko'rish (login javobidagi `user` obyektida ID maydoni nomi
OpenAPI'da hujjatlashtirilmagan). Agar u yozilmasa ham JWT `sub` zaxirasi
ishlaydi.

---

## S6 🟠 `RoleGuard` cookie'dagi rolga ishonadi

**Qayerda:** `src/app/router/RoleGuard.jsx` → `state.auth.role`, u esa
`Cookies.get("role")` dan initsializatsiya qilinadi.

**Xavf:** foydalanuvchi DevTools'da `role=ADMIN` cookie yozib admin UI'ni ocha
oladi. Ma'lumot ko'rinmaydi (backend 401/403 beradi), lekin bu:
- axborot chiqishi (menyu tuzilishi, endpoint nomlari),
- xato holatlari bilan to'lgan buzilgan UI,
- backendda biror endpoint himoyalanmagan bo'lsa — haqiqiy huquq oshirish.

**Yechim:**

1. Rolni har safar serverdan olish: `GET /auth/me` (yoki `/users/me`) endpointi
   qo'shilsa, `RoleGuard` uni `useGetMeQuery()` bilan tekshiradi va cookie'dagi
   qiymatga ishonmaydi:

   ```jsx
   export default function RoleGuard({ allow }) {
     const { data: me, isLoading, isError } = useGetMeQuery();
     if (isLoading) return <Loading />;
     if (isError || !me) return <Navigate to="/login" replace />;
     if (allow?.length && !allow.includes(me.role)) return <Navigate to="/403" replace />;
     return <Outlet />;
   }
   ```

2. Backendda har bir `/admin` doirasidagi endpoint uchun rol tekshiruvi majburiy
   (frontend guard — faqat UX, xavfsizlik chorasi emas).
3. `RoleGuard` dagi `if (!allow || allow.length === 0) return <Outlet />` — bu
   "ruxsat hammaga" yo'lini ochadi; admin uchun ishlatilganda `allow` doim
   berilishiga e'tibor berish kerak (hozir `AppRouter.jsx` da berilgan).

---

## S7 🟠 Security header'lar va CSP yo'q

`netlify.toml` da faqat build va redirect bor.

**Yechim:**

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), camera=(), microphone=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://book.udsgroup.uz; connect-src 'self' https://book.udsgroup.uz; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
```

Izoh: Tailwind ishlab chiqargan CSS statik fayl, `style-src` da `'unsafe-inline'`
faqat inline `style={{}}` atributlari uchun kerak (`framer-motion` ishlatadi).
Agar xarita (iframe) yoki YouTube embed qo'shilsa, `frame-src` ni kengaytirish
kerak. CSP ni joylashdan oldin `Report-Only` rejimida sinab ko'rish tavsiya etiladi.

---

## ~~S8~~ ❌ XATO TOPILMA — `rel` allaqachon hamma joyda mavjud

Dastlabki auditda "10 ta havolada `rel` yo'q" deb yozilgan edi. Bu **xato**:
tekshiruv qatorlar bo'yicha `grep` bilan qilingan, `rel` atributi esa boshqa
qatorda yozilgani uchun ko'rinmagan.

Qayta tekshiruv (`grep -A4 'target="_blank"'`): **10 ta havolaning hammasida
`rel` mavjud** — 9 tasida `rel="noopener noreferrer"`, `Hero.jsx` da
`rel="noreferrer"` (u ham xavfsiz, chunki `noreferrer` `noopener` ni o'z ichiga
oladi).

Ixtiyoriy yaxshilash: `eslint.config.js` da `'react/jsx-no-target-blank': 'off'`
turibdi — qoidani yoqish kelajakda yangi havolalar uchun himoya bo'ladi.

---

## S9 🟠 `BASE_URL` kodda qat'iy yozilgan

**Qayerda:** `src/store/api.js:4` — `export const BASE_URL = "https://book.udsgroup.uz";`
Shuningdek `seoConfig.js` da bir necha joyda `https://book.udsgroup.uz/...` OG
rasm manzillari (aslida sayt domeni `chinozkutubxona.uz` bo'lishi kerak).

**Muammo:** dev/staging/prod muhitlarini ajratish imkoni yo'q; lokal backendga
ulanish uchun kodni o'zgartirish kerak; noto'g'ri domenli OG rasmlar.

**Yechim:**

```js
// src/store/api.js
export const BASE_URL = import.meta.env.VITE_API_URL ?? "https://book.udsgroup.uz";
```

```bash
# .env.example (repoga qo'shiladi)
VITE_API_URL=https://book.udsgroup.uz
VITE_SITE_URL=https://chinozkutubxona.uz
```

`.env` `.gitignore` da (`*.local` bor, `.env` ni ham qo'shish kerak). Netlify'da
environment variable sifatida beriladi. `seoConfig.js` dagi `book.udsgroup.uz`
manzillarini `getSiteUrl()` asosida qurish kerak.

---

## S10 🟡 Ommaviy formalarda spam/abuse himoyasi yo'q

`Components/Common/Messag.jsx` (`POST /contact/messages`) va public
`Header.jsx` dagi kitob buyurtmasi formasi (`POST /online-requests`) —
cheklovsiz, captcha va rate limitsiz. Faqat `full_name/email/message`
bo'shligi tekshiriladi.

**Yechim:**
- Backendda IP + endpoint bo'yicha rate limit (masalan 5 so'rov / 10 daqiqa).
- Frontendda: yuborilgandan keyin tugmani bloklash (`isLoading` bor, lekin
  ketma-ket yuborishga qarshi qo'shimcha cooldown foydali), honeypot maydon,
  yoki Cloudflare Turnstile / hCaptcha.
- Email/telefon formatini tekshirish (hozir `Messag.jsx` da email regex yo'q,
  faqat `trim()`), `Login/index.jsx` dagi `PHONE_REGEX` ni umumiy validatorga
  chiqarish.

---

## S11 🟡 Fayl validatsiyasi faqat clientda

`validators.js` da kengaytma + MIME allowlist va 5 MB limit bor — bu yaxshi,
lekin `validateDocumentFile` da `!file.type` bo'lsa MIME tekshiruvi o'tkazib
yuboriladi (`mimeAllowed = !file.type || ...`), ya'ni MIME'ni bo'sh qilib
yuborish mumkin. Har qanday holatda ham bu faqat UX qatlami.

**Yechim:** backendda majburiy tekshiruv (magic bytes / `file` utilitasi orqali
haqiqiy tur, hajm limiti, nomni normallashtirish, uploads papkasida
`Content-Disposition: attachment` va skript bajarilishini o'chirish).
Frontendda `!file.type` holatida kengaytmaga qat'iy tayanish kifoya, lekin
`BLOCKED_DOCUMENT_EXTENSIONS` ro'yxatiga `svg`, `xht`, `xhtml`, `svgz`
qo'shish tavsiya etiladi (SVG orqali XSS).

---

## S12 🟡 Foydalanuvchi roli clientda belgilanadi

`src/store/services/users.js` → `createUser` payloadiga `role: "ADMIN"`
qo'shiladi. Ya'ni admin panel orqali yaratilgan har bir hisob avtomatik ADMIN.

**Yechim:** rolni backend belgilashi (yoki `SUPER_ADMIN` uchun formada tanlov
qo'yish + backend tekshiruvi). Kamida `Users.jsx` da rol ko'rinadigan/tanlanadigan
maydon bo'lishi kerak — hozir formada `role` umuman yo'q, lekin ro'yxatda
`ShieldCheck` ikonkasi bilan ko'rsatiladi.

---

# 2-qism. Optimizatsiya va barqarorlik

## O5 🔴 Takroriy obyekt kalitlari (jim yo'qoladigan kod)

**a) `src/store/services/documents.api.js`** — `getAdminDocuments` ikki marta
e'lon qilingan (satr ~57 va ~80). JS'da keyingi kalit oldingisini bosadi;
birinchi variantda `providesTags` yo'q, ikkinchisida bor — omadga
ishlayotgan holat. Birinchi nusxani o'chirish kerak.

**b) `src/seo/seoConfig.js`** — ✅ **tuzatildi** (2026-08-24, loyiha egasi
tomonidan). Ilgari `books` (45 va 238), `contact` (107 va 267), `faq`
(164 va 280) takrorlangan edi. Keyingi nusxalar `openGraph`, `twitter`,
`canonical` maydonlaridan foydalanadi, lekin `SEO.jsx` faqat
`title/description/keywords/image/path/type/noIndex/publishedTime/modifiedTime/jsonLd`
ni o'qiydi → bu sahifalar uchun **OG rasm va canonical yo'qoladi**.

**Yechim:** takroriy kalitlarni birlashtirish va `SEO.jsx` qabul qiladigan
shaklga keltirish (`openGraph.image` → `image`, `canonical` → `path`).
`no-dupe-keys` allaqachon lint xatosi sifatida chiqadi — CI'da bloklovchi qilish
kerak.

---

## O1 🟠 Store barcha 16 API'ni eager import qiladi

**Qayerda:** `src/store/index.js` — 16 ta `createApi` reducer va middleware.
Natijada `dist/assets/index-*.js` = **191 kB (gzip 59 kB)** va bu **har bir
tashrifchiga** yuklanadi, hatto u faqat bosh sahifani ochsa ham (admin
endpointlari, `users`, `requests`, `message` ta'riflari ham ichida).

**Yechim variantlari:**

1. **Eng yaxshisi — bitta `createApi` + `injectEndpoints`.** RTK Query rasmiy
   tavsiyasi: bir `baseApi` yaratib, har bir feature o'z endpointlarini
   `baseApi.injectEndpoints({...})` bilan qo'shadi. Endi feature fayli faqat u
   ishlatilgan sahifa chunkida bo'ladi va store'da bitta reducer/middleware
   qoladi:

   ```js
   // src/store/baseApi.js
   import { createApi } from "@reduxjs/toolkit/query/react";
   import { axiosBaseQuery } from "./baseQuary/axiosBaseQuery";

   export const baseApi = createApi({
     reducerPath: "api",
     baseQuery: axiosBaseQuery(),
     tagTypes: ["Books", "Authors", "Genres", "Events", /* ... */],
     endpoints: () => ({}),
   });
   ```

   ```js
   // src/store/services/books.api.js
   import { baseApi } from "../baseApi";

   export const booksApi = baseApi.injectEndpoints({
     endpoints: (builder) => ({ /* xuddi shu endpointlar */ }),
   });
   export const { useGetBooksQuery, /* ... */ } = booksApi;
   ```

   ```js
   // src/store/index.js
   export const store = configureStore({
     reducer: { auth: authReducer, [baseApi.reducerPath]: baseApi.reducer },
     middleware: (gDM) => gDM().concat(baseApi.middleware),
   });
   ```

   Qo'shimcha foyda: bitta kesh maydoni, tag'lar API'lar orasida ham ishlaydi
   (masalan kitob o'zgarganda muallif ro'yxatini invalidatsiya qilish mumkin).

2. **Tezkor (yarim) yechim:** `manualChunks` ga qo'lda `vendor-api` guruh
   qo'shish — bundle o'lchamini kamaytirmaydi, faqat keshni yaxshilaydi.
   Uzoq muddatda 1-variant tavsiya etiladi.

---

## O2 🟠 Ishlatilmaydigan paketlar

`src/` bo'ylab import qilinmaydigan dependency'lar:

```
@mui/material  @mui/styled-engine-sc  @emotion/react  @emotion/styled
styled-components  gsap  gsap-trial  @gsap/react
apexcharts  react-apexcharts  recharts
swiper  react-select  react-loading  react-icons  @heroicons/react
qrcode.react  react-qr-code  dayjs  react-sweetalert2
```

Isbot: build'da `vendor-mui-*.js` = **0.07 kB**, `vendor-charts-*.js` = **0.04 kB**
(bo'sh chunklar, `vite.config.js` `manualChunks` ular uchun guruh e'lon qilgan).
`Components/Other/UI/Alert/Alert.js` — `sweetalert2` ni import qiladi, lekin
hech qayerda ishlatilmaydi (o'lik kod, `npm audit` da zaiflik keltiradi).

**Yechim:**

```bash
npm uninstall @mui/material @mui/styled-engine-sc @emotion/react @emotion/styled \
  styled-components gsap gsap-trial @gsap/react apexcharts react-apexcharts \
  recharts swiper react-select react-loading react-icons @heroicons/react \
  qrcode.react react-qr-code dayjs react-sweetalert2
rm src/Components/Other/UI/Alert/Alert.js
```

```js
// vite.config.js — bo'sh guruhlarni olib tashlash
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
  'vendor-motion': ['framer-motion'],
  'vendor-misc': ['react-hot-toast', 'react-helmet-async', 'react-i18next', 'i18next'],
},
```

Natija: `node_modules` va `package-lock.json` sezilarli kichrayadi,
`npm install` / CI tezlashadi, audit shovqini kamayadi.
(Kelajakda grafik kerak bo'lsa — bitta kutubxona tanlanadi, uchtasi emas.)

---

## O3 🟠 `framer-motion` faqat sahifa o'tishi uchun to'liq yuklanadi

`vendor-motion` = **131 kB (gzip 43.6 kB)** — eng katta vendor chunklardan biri.
Ishlatilishi: `PublicLayout.jsx` sahifa animatsiyasi va yana 2 fayl.

**Variantlar:**

1. **`LazyMotion` + `m`** (framer-motion API'sini saqlab, ~60% kichraytiradi):

   ```jsx
   import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";

   <LazyMotion features={domAnimation} strict>
     <AnimatePresence mode="wait" initial={false}>
       <m.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
         <Outlet />
       </m.div>
     </AnimatePresence>
   </LazyMotion>
   ```

2. **CSS bilan almashtirish** (paketni butunlay olib tashlash):

   ```css
   @keyframes pageIn { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
   .page-enter { animation: pageIn .38s cubic-bezier(.25,.1,.25,1) both; }
   ```

   `AnimatePresence` ning `exit` animatsiyasidan voz kechish kerak bo'ladi —
   ammo `mode="wait"` allaqachon o'tishni sekinlashtiradi (0.22s kutish), shuning
   uchun UX yutuq ham bo'lishi mumkin.

---

## O4 🟠 Rasm/asset gigiyenasi

- `src/Images/logo.png` = **180 kB** va build'da o'zgarmasdan ko'chiriladi.
  Logotip uchun SVG (~2–5 kB) yoki 2x WebP (~15 kB) yetarli.
- `index.html` da `<link rel="icon" type="image/svg+xml" href="" />` — **bo'sh
  `href`**, brauzer sahifaning o'zini favicon deb so'raydi (keraksiz so'rov +
  konsol xatosi).
- `public/` papkasi yo'q → `seoConfig.js` dagi `DEFAULT_OG_IMAGE = "/og-image.jpg"`
  va `/og-image-books.jpg`, `/og-image-faq.jpg` **404** qaytaradi, ijtimoiy
  tarmoqlarda ulashishda rasm ko'rinmaydi.
- 32 ta `<img>` dan 16 tasida `loading="lazy"` bor; `width`/`height` yoki
  `aspect-ratio` hech qayerda yo'q → layout shift (CLS).
- Google Fonts: 8 ta og'irlik yuklanadi (`300..800` + italic). Amalda 3–4 tasi
  yetadi.

**Yechim:**

```
public/
  favicon.svg
  favicon-32.png
  apple-touch-icon.png
  og-image.jpg          (1200×630)
  robots.txt
  sitemap.xml
```

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```jsx
<img src={cover} alt={title} width={300} height={420} loading="lazy" decoding="async" />
```

---

## O6 🟡 Bir resurs uchun uch xil bir xil so'rov

`src/store/services/books.api.js`: `getBookById`, `getBookFiles` va
`getBookImages` — **uchtasi ham** `GET /books/:id` ga boradi, faqat tag'lari
farq qiladi. `Pages/Admin/BookDetail.jsx` da bir necha marta bir xil so'rov
ketishi mumkin.

**Yechim:** bitta `getBookById` query'ni qoldirib, fayl/rasmlarni
`selectFromResult` bilan olish:

```js
const { files } = useGetBookByIdQuery(id, {
  selectFromResult: ({ data, ...rest }) => ({ ...rest, files: data?.files ?? [] }),
});
```

Yoki backendda alohida `/books/:id/files` GET endpointi bo'lsa, to'g'ri URL'ni
ishlatish. Mutatsiyalar `Books`, `BookFiles`, `BookImages` tag'larini
invalidatsiya qilishi kerak.

---

## O7 🟠 Error boundary yo'q

Bitta render xatosi (masalan `book.images.find` — `images` `undefined` bo'lsa)
butun sahifani oq ekranga aylantiradi. `Components/Other/ErrorPage/ErrorPage.jsx`
tayyor, lekin **hech qayerda ishlatilmaydi**.

**Yechim:**

```jsx
// src/app/ErrorBoundary.jsx
import { Component } from "react";
import ErrorPage from "../Components/Other/ErrorPage/ErrorPage";

export default class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    // keyinchalik Sentry/monitoring shu joyga ulanadi
    if (import.meta.env.DEV) console.error(error, info);
  }
  render() { return this.state.hasError ? <ErrorPage /> : this.props.children; }
}
```

```jsx
// App.jsx
<Provider store={store}>
  <BrowserRouter>
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  </BrowserRouter>
</Provider>
```

Qo'shimcha: `Pages/*` ichidagi `data?.x ?? []` uslubi yaxshi — yangi kodda ham
optional chaining va default qiymatlarni saqlash kerak.

---

## O8 🟡 Navigatsiyada scroll tepaga qaytmaydi

`ScrollRestoration` yoki `window.scrollTo(0, 0)` hech qayerda yo'q. Uzun
kitoblar ro'yxatidan detalga o'tganda foydalanuvchi sahifa o'rtasida qoladi.

```jsx
// src/app/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}
```

`App.jsx` da `<BrowserRouter>` ichiga qo'shiladi.

---

## O9 🟡 i18n til kodlari mustahkam emas

`I18n/index.js` da `supportedLngs` va `load` sozlamalari yo'q. Brauzer
`uz-UZ` yoki `en-US` bergan holatda `i18n.language` shu qiymat bo'lib qoladi va
komponentlardagi `i18n.language === "uz"` taqqoslashlari **mos kelmaydi**
(natijada `title_latin` fallback ishlaydi, lekin `Header.jsx:330` da
`i18n.language.toUpperCase()` → `"EN-US"` chiqadi).

```js
i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "uz",
  supportedLngs: ["uz", "ru", "cyrl"],
  nonExplicitSupportedLngs: true,   // uz-UZ → uz
  load: "languageOnly",
  interpolation: { escapeValue: false },
  detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
});
```

Bundan tashqari: `lang` atributi `index.html` da doimo `"en"` — til
o'zgarganda yangilash kerak (`useEffect` da `document.documentElement.lang`).
Til tanlash logikasi 15+ komponentda takrorlanadi — bitta yordamchi funksiya
foydali bo'ladi:

```js
// src/I18n/pickLang.js
export function pick(entity, field, lang) {
  const suffix = lang === "ru" ? "_ru" : lang === "cyrl" ? "_cyril" : "_latin";
  return entity?.[`${field}${suffix}`] || entity?.[`${field}_latin`] || "";
}
```

---

## O10 🟡 Qat'iy yozilgan kontent

- `Pages/Home/Statistics/Statistics.jsx` — "25 000+ kitob", "8 500+ o'quvchi"
  va h.k. konstanta massivda. Backendda statistika endpointi bo'lsa ulash, aks
  holda `pages` yoki `contact-info` orqali boshqarish imkonini berish kerak
  (hozir admin bu raqamlarni o'zgartira olmaydi).
- `Pages/Admin/Dashboard.jsx` — "Backend ulangach, har bir bo'lim real
  ma'lumotlar bilan ishlaydi" matni eskirgan (backend ulangan). Dashboard'ga
  haqiqiy ko'rsatkichlar (kitoblar soni, yangi buyurtmalar, o'qilmagan xabarlar)
  qo'yish katta qiymat beradi — ma'lumot allaqachon `meta.total` orqali
  mavjud.
- `Pages/Admin/components/AdminTablePlaceholder.jsx` — ishlatilmaydigan namuna
  jadval, o'chirish mumkin.

---

## O11 🟡 Kod sifati: lint va testlar

`npm run lint` → **206 xato, 4 ogohlantirish**:

| Qoida | Soni | Izoh |
|---|---|---|
| `react/prop-types` | 143 | JS loyihada shovqin — qoidani o'chirish yoki TS'ga o'tish |
| `no-unused-vars` | 36 | haqiqiy tozalash kerak (ishlatilmagan importlar) |
| `react/no-unescaped-entities` | 21 | o'zbek apostroflari (`'`) — `&apos;` yoki qoidani sozlash |
| `react-hooks/exhaustive-deps` | 4 | **tekshirish kerak** — real bug bo'lishi mumkin |
| `no-dupe-keys` | 4 | O5 da tasvirlangan haqiqiy buglar |
| `no-undef` | 2 | `vite.config.js` / `tailwind.config.js` — Node globallari |

**Yechim:**

```js
// eslint.config.js
{
  rules: {
    'react/prop-types': 'off',                 // JS loyiha, TS'ga o'tilsa qayta ko'riladi
    'react/jsx-no-target-blank': 'error',      // S8
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
},
// Node kontekstidagi config fayllar uchun alohida blok
{
  files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.js', 'eslint.config.js'],
  languageOptions: { globals: globals.node },
},
```

`tailwind.config.js` — `module.exports` ishlatadi, lekin loyiha `"type": "module"`;
`export default` ga o'tkazish to'g'ri bo'ladi.

Testlar umuman yo'q. Minimal to'plam katta qiymat beradi:

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Birinchi navbatda: `utils/validators.js` (sof funksiyalar), `bookHelpers.js`,
`RoleGuard` (redirect logikasi), `axiosBaseQuery` xato normalizatsiyasi.

---

## O12 🟡 Netlify keshi va build sozlamalari

Hozir `netlify.toml` da faqat build + SPA redirect. Vite fayl nomlariga hash
qo'yadi, shuning uchun assetlarni "immutable" qilib keshlash xavfsiz:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

Qo'shimcha:
- `[build.environment] NODE_VERSION = "20"` — build muhitini qat'iylashtirish.
- SPA redirect `/*` → `index.html` **eng oxirida** turishi kerak (hozir yolg'iz,
  muammo yo'q), ammo kelajakda proxy qo'shilsa tartibga e'tibor berish lozim.

---

## O13 🟡 Render va UX mayda yaxshilanishlar

- **`Suspense fallback={null}`** (public routelar, `AppRouter.jsx`) — sahifa
  almashganda bo'sh ekran ko'rinadi. Yengil skeleton yoki yuqorida progress
  chizig'i qo'yish yaxshiroq.
- **`document.body.style.overflow`** to'rt joyda qo'lda boshqariladi
  (`Modal.jsx`, `MainLayout.jsx`, `Loading.jsx`, `Header.jsx`) — bir vaqtda
  ikkitasi ochilsa (mobil menyu + modal) bir-birining qiymatini bosadi. Bitta
  `useScrollLock()` hooki bilan hisoblagich (counter) asosida boshqarish kerak.
- **`Modal.jsx`** da `aria-labelledby="modal-title"` id'si har bir modalda bir
  xil (`id="modal-title"`) — bir sahifada bir nechta modal bo'lsa dublikat id.
  `useId()` ishlatish tavsiya etiladi. Fokus tuzog'i (focus trap) ham yo'q —
  klaviatura bilan modal ortidagi elementlarga o'tib ketish mumkin.
- **`Pagination`** faqat oldingi/keyingi — 50+ sahifada navigatsiya qiyin;
  sahifa raqamlari yoki "ketish" maydoni qo'shish.
- **Qidiruvda debounce yo'q**: `SearchInput` har bosilgan harfda RTK Query
  so'rovini yuboradi (`Books.jsx`, `Users.jsx` va boshqalar). 300–400 ms
  debounce serverga yukni bir necha barobar kamaytiradi:

  ```js
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);
  ```

- **`FileUploadField`** dagi progress — sun'iy interval. Haqiqiy progress uchun
  `axiosBaseQuery` ga `onUploadProgress` ni o'tkazish mumkin:

  ```js
  export const axiosBaseQuery = () => async ({ url, method, data, params, onUploadProgress }) => {
    const result = await $api({ url, method, data, params, onUploadProgress, /* ... */ });
  };
  ```

---

## O14 🟡 SEO: SPA cheklovi

`react-helmet-async` meta teglarni **JS ishlaganidan keyin** qo'yadi. Google
odatda render qiladi, lekin Telegram/Facebook/Twitter botlari qilmaydi — ulashish
kartochkalari bo'sh chiqadi.

**Variantlar (kuch tartibida):**
1. **Netlify Prerendering** yoqish (eng arzon yechim, statik sahifalar uchun yetarli).
2. **`vite-plugin-ssg` / prerender** — ommaviy statik routelarni build vaqtida HTML'ga aylantirish.
3. **Next.js / Remix'ga migratsiya** — katta ish, faqat SEO strategik muhim bo'lsa.

Shuningdek: `public/robots.txt` va `sitemap.xml` yo'q; kanonik domen
noaniqlik (`chinozkutubxona.uz` va `book.udsgroup.uz` ikkisi ham kodda uchraydi) —
bittasini tanlab, ikkinchisidan 301 redirect qo'yish kerak.

---

# 3-qism. Bajarish tartibi (tavsiya)

**1-qadam — bir kunlik ish, eng katta ta'sir**
1. ✅ `npm audit fix` + `react-router-dom` / `axios` yangilash (S3) — **bajarildi**
2. ✅ `isValidUrl` ni tiklash + `safeHref` (S2) — **bajarildi**
3. ✅ DOMPurify bilan sanitizatsiya (S1) — **bajarildi**
4. Takroriy kalitlarni tuzatish: `documents.api.js`, `seoConfig.js` (O5)
5. ~~`rel="noopener noreferrer"`~~ (S8) — xato topilma, `rel` allaqachon bor.
   Ixtiyoriy: ESLint `jsx-no-target-blank` qoidasini yoqish
6. Netlify security headerlari (S7) — **keyingi navbatdagi eng muhim band**

**2-qadam — bir hafta**
7. Ishlatilmaydigan paketlarni olib tashlash + `manualChunks` tozalash (O2)
8. `BASE_URL` ni env'ga chiqarish + `.env.example` (S9)
9. Error boundary (O7) va `ScrollToTop` (O8)
10. favicon / og-image / logotipni optimallashtirish (O4)
11. i18n `supportedLngs` (O9)
12. Qidiruvga debounce (O13)

**3-qadam — arxitektura (sprint hajmida)**
13. `injectEndpoints` bilan yagona `baseApi` (O1)
14. ✅ Refresh-token oqimi (S5) — **bajarildi**
15. `GET /auth/me` orqali rolni serverdan tekshirish (S6) — backend bilan birga
16. Tokenni `httpOnly` cookie'ga o'tkazish (S4) — backend bilan birga
17. `framer-motion` ni `LazyMotion` ga yoki CSS'ga o'tkazish (O3)
18. ESLint konfiguratsiyasini tozalash + Vitest bilan birinchi testlar (O11)
19. Dashboard'ga real ko'rsatkichlar, `Statistics` ni API'ga ulash (O10)
20. Prerender/SSG bilan SEO'ni mustahkamlash (O14)

---

## Backend bilan kelishish kerak bo'lgan bandlar

Quyidagilar faqat frontendda hal bo'lmaydi:

| Band | Backenddan nima kerak |
|---|---|
| S4 | `Set-Cookie: HttpOnly; Secure; SameSite=Strict` + `withCredentials` qo'llab-quvvatlash |
| ~~S5~~ | ✅ `POST /auth/refresh` allaqachon mavjud — frontend tomoni ulandi |
| S6 | `GET /auth/me` (yoki `/users/me`) va har bir admin endpointda rol tekshiruvi |
| S10 | Rate limiting / captcha tekshiruvi |
| S11 | Fayl turini magic-bytes bilan tekshirish, uploads papkasida skript bajarilishini bloklash |
| S12 | Rolni server tomonda belgilash |
| O6 | `/books/:id/files` va `/books/:id/images` uchun alohida GET endpointlar (yoki hujjatlashtirish) |
| O10 | Statistika endpointi |
