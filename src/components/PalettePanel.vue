<template>
  <div class="flex h-full">
    <!-- Main Palette -->
    <PaletteList
      v-model="appStateStore.selectedPaletteItemIndices"
      :options="patternsStore.pattern?.palette.map((pi) => pi.palitem)"
      :option-value="(pi) => patternsStore.pattern?.palette.findIndex((cmp) => dequal(cmp.palitem, pi))"
      :display-options="DEFAULT_PALETTE_DISPLAY_OPTIONS"
      mulitple
      meta-key-selection
      fluid-options
      empty-message="No palette items found"
      class="h-full flex-grow rounded-none border-0"
      :class="{ 'border-r': showPaletteCatalog }"
      @contextmenu="(e: PointerEvent) => paletteContextMenu!.show(e)"
    >
      <template #header>
        <div class="flex gap-x-2" @contextmenu.stop.prevent>
          <ToolSelector v-model="appStateStore.selectedStitchTool" :options="fullstitches" />
          <ToolSelector v-model="appStateStore.selectedStitchTool" :options="partstitches" />
          <ToolSelector v-model="appStateStore.selectedStitchTool" :options="lines" />
          <ToolSelector v-model="appStateStore.selectedStitchTool" :options="nodes" />
        </div>
      </template>
    </PaletteList>
    <ContextMenu ref="palette-context-menu" :model="paletteContextMenuOptions" />

    <!-- Palette Catalog -->
    <PaletteList
      v-show="showPaletteCatalog"
      :model-value="patternsStore.pattern?.palette.map((pi) => ({ brand: pi.brand, number: pi.number }))"
      :options="selectedPalette"
      :option-value="(pi) => ({ brand: pi.brand, number: pi.number })"
      :display-options="paletteCatalogDisplayOptions"
      multiple
      empty-message="No palette items found"
      class="min-w-min rounded-none border-0"
      @option-dblclick="
        ({ value: palitem }) => {
          if (
            !patternsStore.pattern?.palette.find((pi) => pi.brand === palitem.brand && pi.number === palitem.number)
          ) {
            patternsStore.addPaletteItem(palitem);
          }
        }
      "
    >
      <template #header>
        <Select
          v-model="selectedPaletteCatalogItem"
          :options="[...paletteCatalog.keys()]"
          :loading="loadingPalette"
          placeholder="Select a Palette"
          size="small"
          class="w-full"
        />
      </template>

      <template #option="{ option, displayOptions }">
        <PaletteItemComponent
          :palette-item="option"
          :selected="
            patternsStore.pattern?.palette.find((pi) => pi.brand === option.brand && pi.number === option.number) !==
            undefined
          "
          :display-options="displayOptions"
        />
      </template>
    </PaletteList>
  </div>
</template>

<script setup lang="ts">
  import { join, resolveResource } from "@tauri-apps/api/path";
  import { readDir, readTextFile } from "@tauri-apps/plugin-fs";
  import { computed, onMounted, ref, useTemplateRef } from "vue";
  import { computedAsync } from "@vueuse/core";
  import { useFluent } from "fluent-vue";
  import { ContextMenu, Select } from "primevue";
  import type { MenuItem } from "primevue/menuitem";
  import { dequal } from "dequal";
  import { Color } from "pixi.js";
  import { usePatternsStore } from "#/stores/patterns";
  import { useAppStateStore } from "#/stores/state";
  import { FullStitchKind, LineStitchKind, NodeStitchKind, PaletteItem, PartStitchKind } from "#/schemas/pattern";
  import { DEFAULT_PALETTE_DISPLAY_OPTIONS, type PaletteDisplayOptions } from "#/utils/paletteItem";
  import PaletteList from "./palette/PaletteList.vue";
  import PaletteItemComponent from "./palette/PaletteItem.vue";
  import ToolSelector from "./toolbar/ToolSelector.vue";

  import FullStitchIcon from "#/assets/icons/stitches/full-stitch.svg?raw";
  import PetiteStitchIcon from "#/assets/icons/stitches/petite-stitch.svg?raw";
  import HalfStitchIcon from "#/assets/icons/stitches/half-stitch.svg?raw";
  import QuarterStitchIcon from "#/assets/icons/stitches/quarter-stitch.svg?raw";
  import BackStitchIcon from "#/assets/icons/stitches/back-stitch.svg?raw";
  import StraightStitchIcon from "#/assets/icons/stitches/straight-stitch.svg?raw";
  import FrenchKnotIcon from "#/assets/icons/stitches/french-knot.svg?raw";
  import BeadIcon from "#/assets/icons/stitches/bead.svg?raw";

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

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

  const paletteContextMenu = useTemplateRef("palette-context-menu");
  const paletteContextMenuOptions = computed<MenuItem[]>(() => [
    { label: "Colors", command: () => (showPaletteCatalog.value = !showPaletteCatalog.value) },
    { separator: true },
    {
      label: "Delete",
      disabled: !patternsStore.pattern?.palette.length || !appStateStore.selectedPaletteItemIndices.length,
      command: () => {
        const palitems = appStateStore.selectedPaletteItemIndices.map(
          (i) => patternsStore.pattern!.palette[i]!.palitem,
        );
        for (const palitem of palitems) patternsStore.removePaletteItem(palitem);
      },
    },
    { separator: true },
    {
      label: "Select All",
      disabled: !patternsStore.pattern?.palette.length,
      command: () => (appStateStore.selectedPaletteItemIndices = patternsStore.pattern!.palette.map((_, i) => i)),
    },
  ]);

  const paletteCatalogDirPath = await resolveResource("resources/palettes");
  const showPaletteCatalog = ref(false);
  const paletteCatalog = ref<Map<string, PaletteItem[] | undefined>>(new Map());
  const selectedPaletteCatalogItem = ref("DMC");
  const paletteCatalogDisplayOptions: PaletteDisplayOptions = {
    colorOnly: false,
    showBrand: false,
    showNumber: true,
    showName: false,
    columnsNumber: 4,
  };

  const loadingPalette = ref(false);
  const selectedPalette = computedAsync<PaletteItem[]>(
    async () => {
      loadingPalette.value = true;
      const brand = selectedPaletteCatalogItem.value;
      let palette = paletteCatalog.value.get(brand);
      if (palette === undefined) {
        const content = await readTextFile(await join(paletteCatalogDirPath, `${brand}.json`));
        palette = JSON.parse(content).map((pi: PaletteItem) => new PaletteItem({ ...pi, color: new Color(pi.color) }));
        paletteCatalog.value.set(brand, palette);
      }
      loadingPalette.value = false;
      return palette as PaletteItem[];
    },
    [],
    { lazy: true },
  );

  onMounted(async () => {
    for (const entry of await readDir(paletteCatalogDirPath)) {
      // TODO: allow users to create custom palettes and put them under resources/palettes/<subfolder> or via symlinks.
      if (entry.isFile) {
        // The file name is the brand name.
        const brand = entry.name.split(".")[0]!;
        paletteCatalog.value.set(brand, undefined);
      }
    }
  });
</script>
