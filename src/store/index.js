// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { authApi } from "./services/auth.api";
import { booksApi } from "./services/books.api";
import { authorsApi } from "./services/avtors.api";
import { announcementsApi } from "./services/announcements.api";
import { bannersApi } from "./services/banners.api";
import { genresApi } from "./services/genres";
import { departmentsApi } from "./services/departament";
import { documentsApi } from "./services/documents.api";
import { eventsApi } from "./services/events";
import { usefulLinksApi } from "./services/links";
import { contactInfoApi } from "./services/contact.info";
import { mediaApi } from "./services/media";
import { contactMessageApi } from "./services/message";
import { usersApi } from "./services/users";
import { onlineRequestsApi } from "./services/requests";
import { pagesApi } from "./services/pages"; 

import authReducer from "./slices/auth.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    [authApi.reducerPath]: authApi.reducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [authorsApi.reducerPath]: authorsApi.reducer,
    [announcementsApi.reducerPath]: announcementsApi.reducer,
    [bannersApi.reducerPath]: bannersApi.reducer,
    [genresApi.reducerPath]: genresApi.reducer,
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [documentsApi.reducerPath]: documentsApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [usefulLinksApi.reducerPath]: usefulLinksApi.reducer,
    [contactInfoApi.reducerPath]: contactInfoApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [contactMessageApi.reducerPath]: contactMessageApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [onlineRequestsApi.reducerPath]: onlineRequestsApi.reducer,
    [pagesApi.reducerPath]: pagesApi.reducer, // <- QO'SHILDI
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      booksApi.middleware,
      authorsApi.middleware,
      announcementsApi.middleware,
      bannersApi.middleware,
      genresApi.middleware,
      departmentsApi.middleware,
      documentsApi.middleware,
      eventsApi.middleware,
      usefulLinksApi.middleware,
      contactInfoApi.middleware,
      mediaApi.middleware,
      contactMessageApi.middleware,
      usersApi.middleware,
      onlineRequestsApi.middleware,
      pagesApi.middleware, 
    ),
});

setupListeners(store.dispatch);

export default store;