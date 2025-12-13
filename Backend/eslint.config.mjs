import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: {
      react: pluginReact, 
    },
    languageOptions: {
      globals: globals.browser,
      node: true,
    },
    extends: [
      js.configs.recommended,
      pluginReact.configs.flat.recommended,
    ],
  },
]);
