import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { defineAsyncComponent, ref } from "vue";
import { defineStore } from "pinia";
import { useDialog } from "primevue";

export type Theme = "light" | "dark" | "system";

export const usePreferencesStore = defineStore(
  "embroidery-studio-preferences",
  () => {
    const dialog = useDialog();
    const AppPreferences = defineAsyncComponent(() => import("#/components/dialogs/AppPreferences.vue"));

    const theme = ref<Theme>("system");
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
          header: "Preferences",
          modal: true,
          dismissableMask: true,
        },
      });
    }

    return { theme, setTheme, usePaletteItemColorForStitchTools, openPreferences };
  },
  { persist: { storage: localStorage } },
);
