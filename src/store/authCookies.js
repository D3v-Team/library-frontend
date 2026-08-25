// Auth cookie'lari uchun yagona manba.
//
// Nomlar va sozlamalar ikki joyda kerak bo'ladi: auth.slice.js (login/logout)
// va api.js (token yangilash interceptori). Ikki joyda alohida yozilsa,
// biri o'zgarganda ikkinchisi eskirib qoladi — shuning uchun shu fayl.
//
// user_id — refresh uchun majburiy: backend POST /auth/refresh dan
// { userId, refreshToken } kutadi, ya'ni refresh token yolg'iz o'zi yetmaydi.
// Sahifa yangilanganda Redux state tozalanadi, shuning uchun userId ham
// cookie'da saqlanishi shart.

import Cookies from "js-cookie";

export const COOKIE_KEYS = {
  accessToken: "token",
  refreshToken: "refresh_token",
  role: "role",
  userId: "user_id",
};

export const cookieOptions = {
  expires: 7,
  sameSite: "strict",
  secure: import.meta.env.PROD,
  path: "/",
};

export const getAccessToken = () => Cookies.get(COOKIE_KEYS.accessToken) || null;

export const getRefreshToken = () => Cookies.get(COOKIE_KEYS.refreshToken) || null;

export const getRole = () => Cookies.get(COOKIE_KEYS.role) || null;

/**
 * Access token (JWT) ichidagi foydalanuvchi ID sini o'qiydi.
 *
 * Zaxira yo'l: login javobidagi `user` obyektida ID maydoni kutilganidan
 * boshqacha nomlangan bo'lsa (`user.id` yo'q), refresh ishlamay qolmasin.
 * JWT payload'i odatda `sub` da foydalanuvchi ID sini saqlaydi.
 */
function readUserIdFromToken() {
  const token = getAccessToken();

  if (!token) return null;

  const payloadPart = token.split(".")[1];

  if (!payloadPart) return null;

  try {
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");

    const payload = JSON.parse(atob(normalized));

    return payload.sub ?? payload.userId ?? payload.user_id ?? payload.id ?? null;
  } catch {
    return null;
  }
}

export const getUserId = () =>
  Cookies.get(COOKIE_KEYS.userId) || readUserIdFromToken();

/**
 * Login javobidan keyin barcha auth cookie'larini yozadi.
 * Bo'sh (undefined/null) qiymatlar yozilmaydi — mavjudini o'chirib
 * yubormaslik uchun.
 */
export function setAuthCookies({ accessToken, refreshToken, role, userId }) {
  if (accessToken) Cookies.set(COOKIE_KEYS.accessToken, accessToken, cookieOptions);

  if (refreshToken) Cookies.set(COOKIE_KEYS.refreshToken, refreshToken, cookieOptions);

  if (role) Cookies.set(COOKIE_KEYS.role, role, cookieOptions);

  if (userId) Cookies.set(COOKIE_KEYS.userId, userId, cookieOptions);
}

/**
 * Token yangilangandan keyin faqat tokenlarni almashtiradi.
 * Backend rotation qilib yangi refresh token qaytarsa, u ham saqlanadi;
 * qaytarmasa — eskisi o'z joyida qoladi.
 */
export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) Cookies.set(COOKIE_KEYS.accessToken, accessToken, cookieOptions);

  if (refreshToken) Cookies.set(COOKIE_KEYS.refreshToken, refreshToken, cookieOptions);
}

export function clearAuthCookies() {
  Object.values(COOKIE_KEYS).forEach((key) => {
    Cookies.remove(key, { path: cookieOptions.path });

    // Eski sessiyalarda cookie path siz yozilgan bo'lishi mumkin —
    // ularni ham tozalaymiz, aks holda o'chmagan token qolib ketadi.
    Cookies.remove(key);
  });
}

/** Refresh qilish uchun kerakli ma'lumot bormi. */
export function canRefresh() {
  return Boolean(getRefreshToken() && getUserId());
}
