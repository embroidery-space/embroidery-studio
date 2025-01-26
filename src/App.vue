<template>
  <ConfirmDialog />
  <DynamicDialog />
  <BlockUI :blocked="loading" full-screen />
  <div class="flex h-full flex-col">
    <AppHeader />
    <Splitter :gutter-size="2" class="grow overflow-y-auto rounded-none border-0" pt:gutter:class="z-auto">
      <SplitterPanel :size="15" pt:root:class="overflow-y-clip overflow-x-visible">
        <Suspense><PalettePanel /></Suspense>
      </SplitterPanel>

      <SplitterPanel :size="85">
        <ProgressSpinner v-if="loading" class="absolute left-1/2 top-1/2" />
        <Suspense v-if="pattern"><CanvasPanel /></Suspense>
        <div v-else class="relative flex h-full w-full items-center justify-center">
          <Panel header="No pattern loaded" class="w-3/12 border-0">
            <p class="m-0">Open a pattern or create a new one to get started.</p>
          </Panel>

          <!-- Credits -->
          <div class="absolute bottom-0 w-full">
            <p class="my-2 text-center text-xs">
              Developed with love in Ukraine | GNU General Public License v3.0 or later
            </p>
          </div>
        </div>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<script lang="ts" setup>
  import { defineAsyncComponent, onMounted } from "vue";
  import { storeToRefs } from "pinia";
  import { BlockUI, Panel, ConfirmDialog, ProgressSpinner, Splitter, SplitterPanel, DynamicDialog } from "primevue";

  import { useAppStateStore } from "./stores/state";
  import { usePreferencesStore } from "./stores/preferences";
  import { usePatternsStore } from "./stores/patterns";
  import CanvasPanel from "./components/CanvasPanel.vue";

  const AppHeader = defineAsyncComponent(() => import("./components/AppHeader.vue"));
  const PalettePanel = defineAsyncComponent(() => import("./components/PalettePanel.vue"));

  const appStateStore = useAppStateStore();
  const preferencesStore = usePreferencesStore();
  const patternsStore = usePatternsStore();
  const { pattern, loading } = storeToRefs(patternsStore);

  onMounted(async () => {
    await preferencesStore.setTheme(preferencesStore.theme);
    const currentPattern = appStateStore.currentPattern;
    if (currentPattern) await patternsStore.openPattern(currentPattern.key);
  });
</script>
