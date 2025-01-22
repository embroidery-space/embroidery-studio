import { createApp } from "vue";
import { createFluentVue } from "fluent-vue";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { PrimeVue } from "@primevue/core";
import { Tooltip, ConfirmationService, DialogService } from "primevue";

import "primeicons/primeicons.css";
import "./assets/styles.css";
import { NordTheme } from "./assets/theme";

import App from "./App.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

// Use empty bundles as we will load them in the preferences store dynamically.
const fluent = createFluentVue({ bundles: [], componentTag: false });

const app = createApp(App);
app.use(pinia);
app.use(fluent);
app.use(PrimeVue, {
  theme: {
    preset: NordTheme,
    options: {
      cssLayer: {
        name: "primevue",
        order: "tailwind-base, primevue, tailwind-utilities",
      },
    },
  },
});
app.use(ConfirmationService);
app.use(DialogService);
app.directive("tooltip", Tooltip);

app.mount("#app");
