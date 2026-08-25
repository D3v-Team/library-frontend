// store/slices/auth.slice.js

import { createSlice } from "@reduxjs/toolkit";

import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  getRole,
  getUserId,
  setAuthCookies,
} from "../authCookies";

const initialState = {
  token: getAccessToken(),
  refreshToken: getRefreshToken(),
  role: getRole(),

  // Sahifa yangilanganda `user` obyekti yo'qoladi, lekin userId
  // token yangilash uchun kerak — shuning uchun u cookie'dan tiklanadi.
  userId: getUserId(),

  user: null,
  isAuthenticated: Boolean(getAccessToken()),
};

// Login javobidagi user obyektida ID maydoni turlicha nomlanishi mumkin.
function pickUserId(user) {
  return user?.id ?? user?.user_id ?? user?.userId ?? null;
}

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setAuth(state, action) {
      const { access_token, refresh_token, role, user } = action.payload;

      if (!access_token || !role) return;

      const userId = pickUserId(user);

      state.token = access_token;
      state.refreshToken = refresh_token;
      state.role = role;
      state.userId = userId;
      state.user = user;
      state.isAuthenticated = true;

      setAuthCookies({
        accessToken: access_token,
        refreshToken: refresh_token,
        role,
        userId,
      });
    },

    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.userId = null;
      state.user = null;
      state.isAuthenticated = false;

      clearAuthCookies();
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;
