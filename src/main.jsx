import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";

import App from "./App.jsx";
import { ThemeProvider } from "@material-tailwind/react";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>

        <App />

        <Toaster
          position="top-right"
          reverseOrder={false}
        />

      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);