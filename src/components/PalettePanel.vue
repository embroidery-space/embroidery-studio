<template>
  <div
    class="flex h-full"
    :class="{ 'border-2 border-primary': paletteIsBeingEdited }"
    @keydown="
      ({ key }) => {
        if (key === 'Escape') paletteIsBeingEdited = false;
      }
    "
  >
    <!-- Main Palette -->
    <PaletteList
      :model-value="appStateStore.selectedPaletteItemIndexes"
      :options="patternsStore.pattern?.palette.map((pi) => pi.palitem)"
      :option-value="(pi) => patternsStore.pattern?.palette.findIndex((cmp) => dequal(cmp.palitem, pi))"
      :display-options="DEFAULT_PALETTE_DISPLAY_OPTIONS"
      :disabled="paletteIsDisabled"
      mulitple
      meta-key-selection
      fluid-options
      class="flex-grow rounded-none border-0"
      :class="{ 'border-r': showPaletteCatalog }"
      :style="{ backgroundColor: dt('content.background') }"
      :list-style="`border-top: 1px solid ${dt('content.border.color')}; border-bottom: 1px solid ${dt('content.border.color')}`"
      @update:model-value="handlePaletteItemsSelection"
      @contextmenu="(e: PointerEvent) => paletteContextMenu!.show(e)"
    >
      <template #header>
        <div v-if="paletteIsBeingEdited" class="min-w-60">
          <Button fluid size="small" :label="$t('save-changes')" @click="paletteIsBeingEdited = false" />
        </div>
        <div v-else class="flex gap-x-2" @contextmenu.stop.prevent>
          <ToolSelector
            v-model="appStateStore.selectedStitchTool"
            :options="fullstitches"
            :disabled="paletteIsDisabled"
          />
          <ToolSelector
            v-model="appStateStore.selectedStitchTool"
            :options="partstitches"
            :disabled="paletteIsDisabled"
          />
          <ToolSelector
            v-model="appStateStore.selectedStitchTool"
            :options="linestitches"
            :disabled="paletteIsDisabled"
          />
          <ToolSelector
            v-model="appStateStore.selectedStitchTool"
            :options="nodestitches"
            :disabled="paletteIsDisabled"
          />
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-between">
          <span> {{ $t("palette-title", { size: patternsStore.pattern?.palette.length ?? 0 }) }}</span>
          <Button
            v-tooltip="{
              value: paletteIsBeingEdited ? $t('save-changes') : $t('palette-menu-option-edit-palette'),
              showDelay: 200,
            }"
            text
            :disabled="paletteIsDisabled"
            :icon="`pi pi-${paletteIsBeingEdited ? 'check' : 'pencil'}`"
            size="small"
            severity="secondary"
            @click="paletteIsBeingEdited = !paletteIsBeingEdited"
          />
        </div>
      </template>
    </PaletteList>
    <ContextMenu
      ref="palette-context-menu"
      :model="paletteIsBeingEdited ? paletteEditingContextMenuOptions : paletteContextMenuOptions"
    />

    <!-- Palette Catalog -->
    <PaletteList
      v-show="showPaletteCatalog"
      :model-value="patternsStore.pattern?.palette.map((pi) => ({ brand: pi.brand, number: pi.number }))"
      :options="selectedPalette"
      :option-value="(pi) => ({ brand: pi.brand, number: pi.number })"
      :display-options="paletteCatalogDisplayOptions"
      multiple
      class="min-w-min rounded-none border-0"
      :style="{ backgroundColor: dt('content.background') }"
      :list-style="`border-top: 1px solid ${dt('content.border.color')}`"
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
  import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";
  import { computedAsync } from "@vueuse/core";
  import { useFluent } from "fluent-vue";
  import { dt } from "@primevue/themes";
  import { Button, ContextMenu, Select } from "primevue";
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
  const linestitches = ref([
    { icon: BackStitchIcon, label: () => fluent.$t("back-stitch"), value: LineStitchKind.Back },
    { icon: StraightStitchIcon, label: () => fluent.$t("straight-stitch"), value: LineStitchKind.Straight },
  ]);
  const nodestitches = ref([
    { icon: FrenchKnotIcon, label: () => fluent.$t("french-knot"), value: NodeStitchKind.FrenchKnot },
    { icon: BeadIcon, label: () => fluent.$t("bead"), value: NodeStitchKind.Bead },
  ]);

  const paletteIsDisabled = computed(() => !patternsStore.pattern);
  const paletteIsBeingEdited = ref(false);
  const paletteContextMenu = useTemplateRef("palette-context-menu");
  const paletteContextMenuOptions = computed<MenuItem[]>(() => [
    {
      label: fluent.$t("palette-menu-option-edit-palette"),
      command: ({ originalEvent }) => {
        paletteIsBeingEdited.value = true;
        nextTick(() => paletteContextMenu.value!.show(originalEvent));
      },
    },
  ]);
  const paletteEditingContextMenuOptions = computed<MenuItem[]>(() => [
    {
      label: fluent.$t("palette-menu-option-colors"),
      command: () => (showPaletteCatalog.value = !showPaletteCatalog.value),
    },
    { separator: true },
    {
      label: fluent.$t("palette-menu-option-delete-selected", {
        selected: appStateStore.selectedPaletteItemIndexes.length,
      }),
      disabled: !patternsStore.pattern?.palette.length || !appStateStore.selectedPaletteItemIndexes.length,
      command: () => patternsStore.removePaletteItem(appStateStore.selectedPaletteItemIndexes),
    },
    { separator: true },
    {
      label: fluent.$t("palette-menu-option-select-all"),
      disabled: !patternsStore.pattern?.palette.length,
      command: ({ originalEvent }) => {
        appStateStore.selectedPaletteItemIndexes = patternsStore.pattern!.palette.map((_, i) => i);
        nextTick(() => paletteContextMenu.value!.show(originalEvent));
      },
    },
    { separator: true },
    { label: fluent.$t("save-changes"), command: () => (paletteIsBeingEdited.value = false) },
  ]);

  watch(paletteIsBeingEdited, (value) => {
    patternsStore.blocked = value;
    if (!value) {
      handlePaletteItemsSelection(appStateStore.selectedPaletteItemIndexes);
      showPaletteCatalog.value = false;
    }
  });

  function handlePaletteItemsSelection(palindexes: number[]) {
    if (palindexes.length > 1 && !paletteIsBeingEdited.value) {
      appStateStore.selectedPaletteItemIndexes = palindexes.slice(-1);
    } else appStateStore.selectedPaletteItemIndexes = palindexes;
  }

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
      if (entry.isFile) {
        // The file name is the brand name.
        const brand = entry.name.split(".")[0]!;
        paletteCatalog.value.set(brand, undefined);
      }
    }
  });
</script>
