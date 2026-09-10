import peshtoq from "./src/design/tailwind.preset.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [peshtoq],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
};
