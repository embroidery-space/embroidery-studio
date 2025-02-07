import { FluentBundle, FluentResource } from "@fluent/bundle";
import { createFluentVue } from "fluent-vue";

import enContent from "#/locales/en.ftl?raw";
import ukContent from "#/locales/uk.ftl?raw";

const en = new FluentBundle("en");
en.addResource(new FluentResource(enContent));

const uk = new FluentBundle("uk");
uk.addResource(new FluentResource(ukContent));

export const LOCALES = { en, uk } as const;

// Use empty bundles as we will load them in the preferences store dynamically.
export const fluent = createFluentVue({ bundles: [], componentTag: false });
