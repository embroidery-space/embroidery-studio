import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { PrimeVue } from "@primevue/core";
import { Tooltip, ConfirmationService, DialogService } from "primevue";

import "uno.css";

import { fluent } from "./fluent";
import App from "./App.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

const app = createApp(App);
app.use(pinia);
app.use(fluent);
app.use(PrimeVue, { theme: "none" });
app.use(ConfirmationService);
app.use(DialogService);
app.directive("tooltip", Tooltip);

app.mount("#app");
