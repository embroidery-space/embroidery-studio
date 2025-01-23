<template>
  <ConfirmDialog />
  <DynamicDialog />
  <BlockUI :blocked="loading" full-screen />
  <div class="flex h-full flex-col">
    <AppHeader />
    <Splitter :gutter-size="2" class="grow overflow-y-auto rounded-none border-0">
      <SplitterPanel :min-size="6" :size="15" pt:root:class="overflow-y-clip overflow-x-visible">
        <div class="flex h-full flex-col">
          <div class="flex gap-x-2 border-b px-2 py-1" :style="{ borderColor: dt('content.border.color') }">
            <ToolSelector v-model="appStateStore.state.selectedStitchTool" :options="fullstitches" />
            <ToolSelector v-model="appStateStore.state.selectedStitchTool" :options="partstitches" />
            <ToolSelector v-model="appStateStore.state.selectedStitchTool" :options="lines" />
            <ToolSelector v-model="appStateStore.state.selectedStitchTool" :options="nodes" />
          </div>
          <Suspense>
            <PalettePanel
              @add-palette-item="patternProjectStore.addPaletteItem"
              @remove-palette-item="patternProjectStore.removePaletteItem"
            />
          </Suspense>
        </div>
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
  import { defineAsyncComponent, onMounted, ref } from "vue";
  import { useFluent } from "fluent-vue";
  import { storeToRefs } from "pinia";
  import { BlockUI, Panel, ConfirmDialog, ProgressSpinner, Splitter, SplitterPanel, DynamicDialog } from "primevue";
  import { dt } from "@primevue/themes";
  import CanvasPanel from "./components/CanvasPanel.vue";
  import PalettePanel from "./components/palette/PalettePanel.vue";
  import ToolSelector from "./components/toolbar/ToolSelector.vue";
  import { useAppStateStore } from "./stores/state";
  import { usePreferencesStore } from "./stores/preferences";
  import { usePatternsStore } from "./stores/patterns";
  import { FullStitchKind, LineStitchKind, NodeStitchKind, PartStitchKind } from "./schemas/pattern";

  import FullStitchIcon from "./assets/icons/stitches/full-stitch.svg?raw";
  import PetiteStitchIcon from "./assets/icons/stitches/petite-stitch.svg?raw";
  import HalfStitchIcon from "./assets/icons/stitches/half-stitch.svg?raw";
  import QuarterStitchIcon from "./assets/icons/stitches/quarter-stitch.svg?raw";
  import BackStitchIcon from "./assets/icons/stitches/back-stitch.svg?raw";
  import StraightStitchIcon from "./assets/icons/stitches/straight-stitch.svg?raw";
  import FrenchKnotIcon from "./assets/icons/stitches/french-knot.svg?raw";
  import BeadIcon from "./assets/icons/stitches/bead.svg?raw";

  const AppHeader = defineAsyncComponent(() => import("./components/AppHeader.vue"));

  const appStateStore = useAppStateStore();
  const preferencesStore = usePreferencesStore();
  const patternProjectStore = usePatternsStore();
  const { pattern, loading } = storeToRefs(patternProjectStore);

  const fluent = useFluent();

  const fullstitches = ref([
    { icon: FullStitchIcon, label: () => fluent.$t("full-stitch"), value: FullStitchKind.Full },
    { icon: PetiteStitchIcon, label: () => fluent.$t("petite-stitch"), value: FullStitchKind.Petite },
  ]);
  const partstitches = ref([
    { icon: HalfStitchIcon, label: () => fluent.$t("half-stitch"), value: PartStitchKind.Half },
    { icon: QuarterStitchIcon, label: () => fluent.$t("quarter-stitch"), value: PartStitchKind.Quarter },
  ]);
  const lines = ref([
    { icon: BackStitchIcon, label: () => fluent.$t("back-stitch"), value: LineStitchKind.Back },
    { icon: StraightStitchIcon, label: () => fluent.$t("straight-stitch"), value: LineStitchKind.Straight },
  ]);
  const nodes = ref([
    { icon: FrenchKnotIcon, label: () => fluent.$t("french-knot"), value: NodeStitchKind.FrenchKnot },
    { icon: BeadIcon, label: () => fluent.$t("bead"), value: NodeStitchKind.Bead },
  ]);

  onMounted(async () => {
    await preferencesStore.setTheme(preferencesStore.theme);
    const currentPattern = appStateStore.state.currentPattern;
    if (currentPattern) await patternProjectStore.openPattern(currentPattern.key);
  });
</script>
