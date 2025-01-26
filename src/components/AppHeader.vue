<template>
  <Toolbar data-tauri-drag-region class="rounded-none border-0 border-b p-0">
    <template #start>
      <Menubar :model="menuOptions" class="rounded-none border-0" />
    </template>

    <template v-if="appStateStore.openedPatterns?.length" #center>
      <PatternSelector
        @switch="
          (patternPath) => {
            patternsStore.openPattern(patternPath);
            appStateStore.selectedPaletteItemIndices = [];
          }
        "
      />
    </template>

    <template #end>
      <Suspense> <WindowControls /> </Suspense>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useFluent } from "fluent-vue";
  import { Menubar, Toolbar } from "primevue";
  import type { MenuItem } from "primevue/menuitem";
  import PatternSelector from "./toolbar/PatternSelector.vue";
  import WindowControls from "./toolbar/WindowControls.vue";
  import { useAppStateStore } from "#/stores/state";
  import { usePatternsStore } from "#/stores/patterns";
  import { usePreferencesStore } from "#/stores/preferences";

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();
  const preferencesStore = usePreferencesStore();

  const fluent = useFluent();

  const menuOptions = ref<MenuItem[]>([
    {
      label: () => fluent.$t("file"),
      items: [
        {
          label: () => fluent.$t("open"),
          command: patternsStore.loadPattern,
        },
        {
          label: () => fluent.$t("create"),
          command: patternsStore.createPattern,
        },
        { separator: true },
        {
          label: () => fluent.$t("save"),
          command: () => patternsStore.savePattern(),
          disabled: () => !patternsStore.pattern,
        },
        {
          label: () => fluent.$t("save-as"),
          command: () => patternsStore.savePattern(true),
          disabled: () => !patternsStore.pattern,
        },
        { separator: true },
        {
          label: () => fluent.$t("export"),
          disabled: () => !patternsStore.pattern,
          items: [{ label: "OXS", command: () => patternsStore.exportPattern("oxs") }],
        },
        { separator: true },
        {
          label: () => fluent.$t("close"),
          command: patternsStore.closePattern,
          disabled: () => !patternsStore.pattern,
        },
      ],
    },
    {
      label: () => fluent.$t("pattern"),
      visible: () => patternsStore.pattern !== undefined,
      items: [
        {
          label: () => fluent.$t("fabric-properties-title"),
          command: patternsStore.updateFabric,
        },
        {
          label: () => fluent.$t("grid-properties-title"),
          command: patternsStore.updateGrid,
        },
      ],
    },
    {
      label: () => fluent.$t("preferences-title"),
      command: preferencesStore.openPreferences,
    },
  ]);
</script>
