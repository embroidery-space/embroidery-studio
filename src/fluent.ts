import type { FluentBundle } from "@fluent/bundle";
import { createFluentVue } from "fluent-vue";

// Use empty bundles as we will load them in the preferences store dynamically.
export const fluent = createFluentVue({ bundles: [], warnMissing, componentTag: false });

function warnMissing(key: string) {
  // Suppress warnings if no bundles are loaded.
  if ((fluent.bundles as FluentBundle[]).length === 0) return;
  console.warn(`Missing translation for key: ${key}`);
}
