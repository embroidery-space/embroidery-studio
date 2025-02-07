import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { PrimeVue } from "@primevue/core";
import { Tooltip, ConfirmationService, DialogService } from "primevue";

import "uno.css";
import "primeicons/primeicons.css";

import "#/assets/styles.css";
import { NordTheme } from "./assets/theme";

import { fluent } from "./fluent";
import App from "./App.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

const app = createApp(App);
app.use(pinia);
app.use(fluent);
app.use(PrimeVue, {
  theme: {
    preset: NordTheme,
    options: {
      cssLayer: {
        // The name of the CSS layer where the Primevue styles should be injected.
        name: "components",
        // The order of the CSS layers injected by Tailwind CSS.
        order: "base, shortcuts, components, utilities",
      },
    },
  },
});
app.use(ConfirmationService);
app.use(DialogService);
app.directive("tooltip", Tooltip);

app.mount("#app");
