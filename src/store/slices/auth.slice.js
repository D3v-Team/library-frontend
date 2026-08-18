// store/slices/auth.slice.js

import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const cookieOptions = {
  expires: 7,
  sameSite: "strict",
  secure: import.meta.env.PROD,
};

const initialState = {
  token: Cookies.get("token") || null,
  refreshToken: Cookies.get("refresh_token") || null,
  role: Cookies.get("role") || null,
  user: null,
  isAuthenticated: Boolean(Cookies.get("token")),
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setAuth(state, action) {
      const { access_token, refresh_token, role, user } = action.payload;

      if (!access_token || !role) return;

      state.token = access_token;
      state.refreshToken = refresh_token;
      state.role = role;
      state.user = user;
      state.isAuthenticated = true;

      Cookies.set("token", access_token, cookieOptions);

      Cookies.set("refresh_token", refresh_token, cookieOptions);

      Cookies.set("role", role, cookieOptions);
    },

    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.user = null;
      state.isAuthenticated = false;

      Cookies.remove("token");
      Cookies.remove("refresh_token");
      Cookies.remove("role");
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;
