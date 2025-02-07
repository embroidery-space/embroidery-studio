import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import unocss from "@unocss/eslint-config/flat";

export default defineConfigWithVueTs(
  js.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.vue"],
    languageOptions: { ecmaVersion: "latest" },
  },
  vue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  skipFormatting,
  unocss,
);
