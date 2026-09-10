import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
/* Dizayn stansiyasi — tartib muhim:
   tokenlar Tailwind dan oldin, asos qatlami esa keyin yuklanadi,
   shunda u preflight ustidan yozadi. */
import "./design/tokens.css";
import "./index.css";
import "./design/base.css";
import "./design/motion.css";
import "./design/prose.css";

import "./I18n";

import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <App />
      <Toaster position="top-right" reverseOrder={false} />
    </HelmetProvider>
  </StrictMode>
);
