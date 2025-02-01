import { resolveResource, sep } from "@tauri-apps/api/path";
import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { defineAsyncComponent, reactive, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useFluent } from "fluent-vue";
import { useDialog } from "primevue";
import { FluentBundle, FluentResource } from "@fluent/bundle";

export type Theme = "light" | "dark" | "system";
export type Language = "en" | "uk";

export type FontSizeOption = "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large";
export interface FontOptions {
  family: string | null;
  size: FontSizeOption;
}

export const usePreferencesStore = defineStore(
  "embroidery-studio-preferences",
  () => {
    const dialog = useDialog();
    const AppPreferences = defineAsyncComponent(() => import("#/components/dialogs/AppPreferences.vue"));

    const font = reactive<FontOptions>({ family: null, size: "medium" });
    watch(
      font,
      ({ family, size }) => {
        // If the font family is null, clear the property, so the font family from the CSS is used.
        // Otherwise, set the property to the selected font family and the default one from Tailwind CSS as a fallback.
        document.documentElement.style.fontFamily = family === null ? "" : `'${family}', var(--default-font-family)`;
        document.documentElement.style.fontSize = size;
      },
      { immediate: true },
    );

    const theme = ref<Theme>("system");

    const fluent = useFluent();
    const language = ref<Language>("en");
    watch(
      language,
      async (code) => {
        const bundle = new FluentBundle(code);

        const localesDirPath = await resolveResource(`resources/locales/${code}`);
        for (const entry of await readDir(localesDirPath)) {
          if (entry.isFile && entry.name.endsWith(".ftl")) {
            const resourceFilePath = [localesDirPath, entry.name].join(sep());
            const content = await readTextFile(resourceFilePath);
            bundle.addResource(new FluentResource(content));
          }
        }

        fluent.bundles.value = [bundle];
      },
      { immediate: true },
    );

    const usePaletteItemColorForStitchTools = ref(true);

    /**
     * Sets the application theme.
     *
     * @param newTheme - The new theme to be applied.
     * @returns A promise that resolves when the theme has been set.
     */
    async function setTheme(newTheme: Theme) {
      await setAppTheme(newTheme === "system" ? null : newTheme);
      theme.value = newTheme;
    }

    function openPreferences() {
      dialog.open(AppPreferences, {
        props: {
          header: fluent.$t("preferences-title"),
          modal: true,
          dismissableMask: true,
        },
      });
    }

    return { font, theme, setTheme, language, usePaletteItemColorForStitchTools, openPreferences };
  },
  { persist: { storage: localStorage } },
);
