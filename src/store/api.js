import axios from "axios";

import {
  canRefresh,
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  getUserId,
  setTokens,
} from "./authCookies";

export const BASE_URL = "https://dev.chinozakm.uz";

export const $api = axios.create({
  baseURL: `${BASE_URL}/api`,

  headers: {
    "Content-Type": "application/json",
  },
});

// Token yangilash uchun ALOHIDA instansiya.
// $api ishlatilsa: refresh so'roviga ham eski (muddati o'tgan) token
// qo'shiladi, 401 qaytadi, interceptor yana refresh chaqiradi — cheksiz tsikl.
const refreshClient = axios.create({
  baseURL: `${BASE_URL}/api`,

  // Timeout majburiy: refresh so'rovi osilib qolsa, uni kutayotgan barcha
  // so'rovlar ham cheksiz muzlab turadi (navbat bitta promise'ga bog'langan).
  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

// Bu yo'llarda 401 bo'lsa refresh qilish mantiqsiz:
// login — parol xato, refresh — token o'lgan, logout — sessiya allaqachon tugagan.
const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];

function isAuthRequest(url) {
  if (!url) return false;

  return AUTH_PATHS.some((path) => url.includes(path));
}

/**
 * Backend refresh javobining shakli hujjatlashtirilmagan (OpenAPI'da
 * response schema bo'sh). Login `{ tokens: { access_token, refresh_token } }`
 * qaytaradi, refresh so'rovi esa camelCase (`userId`, `refreshToken`) kutadi —
 * ya'ni javob ham camelCase bo'lishi mumkin. Shuning uchun ikkala shaklni
 * ham qabul qilamiz.
 */
function extractTokens(payload) {
  const box =
    payload?.tokens ??
    payload?.data?.tokens ??
    payload?.data ??
    payload ??
    {};

  return {
    accessToken: box.access_token ?? box.accessToken ?? null,
    refreshToken: box.refresh_token ?? box.refreshToken ?? null,
  };
}

// Bir vaqtda ketgan bir necha so'rov birdan 401 olishi mumkin (admin
// sahifalari bir necha query yuboradi). Shunda refresh FAQAT BIR MARTA
// chaqiriladi, qolganlari shu promise'ni kutadi — aks holda backendga
// bir necha refresh so'rovi ketib, rotation tufayli token yaroqsiz bo'ladi.
let refreshPromise = null;

async function requestNewAccessToken() {
  const refreshToken = getRefreshToken();
  const userId = getUserId();

  if (!refreshToken || !userId) {
    throw new Error("REFRESH_CREDENTIALS_MISSING");
  }

  const { data } = await refreshClient.post("/auth/refresh", {
    userId,
    refreshToken,
  });

  const tokens = extractTokens(data);

  if (!tokens.accessToken) {
    throw new Error("REFRESH_RESPONSE_INVALID");
  }

  setTokens(tokens);

  return tokens.accessToken;
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function forceLogout() {
  clearAuthCookies();

  if (typeof window === "undefined") return;

  // Login sahifasining o'zida redirect qilsak — tsikl bo'ladi.
  if (window.location.pathname.startsWith("/login")) return;

  window.location.href = "/login";
}

// REQUEST
$api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error),
);

// RESPONSE
$api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const config = error.config;
    const status = error.response?.status;

    // 401 bo'lmasa, config yo'q bo'lsa, allaqachon qayta urinilgan bo'lsa
    // yoki auth endpointining o'zi bo'lsa — hech narsa qilmaymiz.
    if (status !== 401 || !config || config._isRetry || isAuthRequest(config.url)) {
      return Promise.reject(error);
    }

    // Refresh uchun ma'lumot yo'q.
    if (!canRefresh()) {
      // Sessiya bor edi (token cookie'si mavjud), lekin tiklab bo'lmaydi —
      // demak chiqarish kerak. Tokeni yo'q (ommaviy) tashrifchi esa
      // /login ga uloqtirilmasligi kerak.
      if (getAccessToken()) forceLogout();

      return Promise.reject(error);
    }

    config._isRetry = true;

    try {
      const accessToken = await refreshAccessToken();

      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };

      // Yangi token bilan asl so'rovni qaytadan yuboramiz — chaqiruvchi
      // (RTK Query yoki komponent) buni sezmaydi ham.
      return $api(config);
    } catch {
      // Refresh ham rad etildi (backend 403 "Ruxsat yo'q!" qaytaradi)
      // yoki javob shakli buzuq — sessiyani tugatamiz.
      forceLogout();

      return Promise.reject(error);
    }
  },
);

export default $api;
