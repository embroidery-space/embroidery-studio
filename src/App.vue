<template>
  <div class="flex h-full flex-col">
    <AppHeader />
    <Splitter class="grow overflow-y-auto rounded-none border-0">
      <SplitterPanel :size="15" class="overflow-x-visible overflow-y-clip">
        <Suspense><PalettePanel /></Suspense>
      </SplitterPanel>

      <SplitterPanel :size="85">
        <Suspense v-if="patternsStore.pattern"><CanvasPanel /></Suspense>
        <WelcomePanel v-else class="size-full" />
      </SplitterPanel>
    </Splitter>
  </div>
  <DynamicDialog />
  <ConfirmDialog />
</template>

<script lang="ts" setup>
  import { defineAsyncComponent, onMounted } from "vue";
  import { ConfirmDialog, Splitter, SplitterPanel, DynamicDialog } from "primevue";
  import { useAppStateStore } from "./stores/state";
  import { usePreferencesStore } from "./stores/preferences";
  import { usePatternsStore } from "./stores/patterns";

  const AppHeader = defineAsyncComponent(() => import("./components/AppHeader.vue"));
  const WelcomePanel = defineAsyncComponent(() => import("./components/WelcomePanel.vue"));
  const PalettePanel = defineAsyncComponent(() => import("./components/PalettePanel.vue"));
  const CanvasPanel = defineAsyncComponent(() => import("./components/CanvasPanel.vue"));

  const appStateStore = useAppStateStore();
  const preferencesStore = usePreferencesStore();
  const patternsStore = usePatternsStore();

  onMounted(async () => {
    await preferencesStore.setTheme(preferencesStore.theme);
    const currentPattern = appStateStore.currentPattern;
    if (currentPattern) await patternsStore.openPattern(currentPattern.key);
  });
</script>
