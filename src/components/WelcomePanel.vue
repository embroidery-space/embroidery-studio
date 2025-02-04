<template>
  <div class="flex flex-col items-center justify-between">
    <!-- This div is needed to correctly justify containers. -->
    <div></div>

    <div class="max-size-full flex min-w-1/2 flex-col gap-6 overflow-auto p-8">
      <span class="text-4xl">{{ $t("app-welcome-title") }}</span>

      <i18n tag="span" path="app-welcome-get-started">
        <template #button-open="{ buttonOpenLabel }">
          <Button variant="link" :label="buttonOpenLabel" class="p-0" @click="patternsStore.loadPattern" />
        </template>
        <template #button-create="{ buttonCreateLabel }">
          <Button variant="link" :label="buttonCreateLabel" class="p-0" @click="patternsStore.createPattern" />
        </template>
      </i18n>

      <div class="flex flex-wrap justify-between gap-4">
        <div class="flex flex-col gap-y-1">
          <span class="text-lg">{{ $t("app-welcome-start") }}</span>
          <div class="flex max-w-max flex-col gap-y-1">
            <Button
              text
              icon="pi pi-file-plus"
              :label="$t('app-welcome-start-create')"
              pt:root:class="justify-start"
              @click="patternsStore.createPattern"
            />
            <Button
              text
              icon="pi pi-file-arrow-up"
              :label="$t('app-welcome-start-open')"
              pt:root:class="justify-start"
              @click="patternsStore.loadPattern"
            />
          </div>
        </div>

        <div class="flex flex-col gap-y-5">
          <div v-for="section in infoSections" :key="section.title" class="flex flex-col gap-1">
            <span class="text-lg">{{ section.title }}</span>
            <div
              v-for="item in section.items"
              :key="item.title"
              tabindex="0"
              class="info-item"
              @click="handleInfoItemClick(item)"
            >
              <span class="flex items-center gap-2" :style="{ color: dt('primary.700') }">
                {{ item.title }}
                <i v-if="item.url" class="pi pi-external-link"></i>
              </span>
              <span v-if="item.text">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full py-2 text-center text-xs">
      {{ $t("app-welcome-credits") }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { computed } from "vue";
  import { dt } from "@primevue/themes";
  import { Button } from "primevue";
  import { useFluent } from "fluent-vue";
  import { usePreferencesStore } from "#/stores/preferences";
  import { usePatternsStore } from "#/stores/patterns";

  const preferencesStore = usePreferencesStore();
  const patternsStore = usePatternsStore();

  const fluent = useFluent();

  const infoSections = computed<InfoSection[]>(() => [
    {
      title: fluent.$t("app-welcome-customize"),
      items: [
        {
          title: fluent.$t("app-welcome-customize-settings-title"),
          text: fluent.$t("app-welcome-customize-settings-text"),
          command: () => preferencesStore.openPreferences(),
        },
      ],
    },
    {
      title: fluent.$t("app-welcome-learn-more"),
      items: [
        {
          title: fluent.$t("app-welcome-learn-more-documentation-title"),
          text: fluent.$t("app-welcome-learn-more-documentation-text"),
          url: "https://embroidery-studio.niusia.me",
        },
      ],
    },
    {
      title: fluent.$t("app-welcome-get-help"),
      items: [
        {
          title: fluent.$t("app-welcome-get-help-telegram"),
          url: "https://t.me/embroidery_space",
        },
      ],
    },
  ]);

  function handleInfoItemClick(item: InfoItemOptions) {
    if (item.url) openUrl(item.url);
    if (item.command) item.command();
  }

  interface InfoSection {
    title: string;
    items: InfoItemOptions[];
  }

  interface InfoItemOptions {
    title: string;
    text?: string;
    url?: string;
    command?: () => void;
  }
</script>

<style scoped>
  .info-item {
    border-radius: var(--p-content-border-radius);
    padding-inline: calc(var(--spacing) * 2.5); /* .px-2.5 */
    padding-block: calc(var(--spacing) * 2); /* .py-2 */
    transition: background-color var(--p-transition-duration);
  }

  .info-item:hover {
    cursor: pointer;
    background-color: var(--p-content-hover-background);
  }

  .info-item:focus-visible {
    box-shadow: var(--p-focus-ring-shadow);
    outline: var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-primary-color);
    outline-offset: var(--p-focus-ring-offset);
  }
</style>
