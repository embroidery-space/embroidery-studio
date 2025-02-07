<template>
  <div
    class="h-full flex"
    :class="{ 'border-primary border-2': paletteIsBeingEdited }"
    @keydown="
      ({ key }) => {
        if (key === 'Escape') paletteIsBeingEdited = false;
      }
    "
  >
    <PaletteList
      :model-value="appStateStore.selectedPaletteItemIndexes"
      :options="patternsStore.pattern?.palette.map((pi) => pi.palitem)"
      :option-value="(pi) => patternsStore.pattern?.palette.findIndex((cmp) => dequal(cmp.palitem, pi))"
      :display-options="paletteDisplayOptions"
      :disabled="paletteIsDisabled"
      :meta-key-selection="paletteIsBeingEdited"
      fluid-options
      mulitple
      class="flex-grow border-0 rounded-none"
      :class="{ 'border-r': paletteIsBeingEdited }"
      :style="{ backgroundColor: dt('content.background') }"
      :list-style="`border-top: 1px solid ${dt('content.border.color')}; border-bottom: 1px solid ${dt('content.border.color')}`"
      @update:model-value="handlePaletteItemsSelection"
      @contextmenu="(e: PointerEvent) => paletteContextMenu!.show(e)"
    >
      <template #header>
        <div v-if="paletteIsBeingEdited" class="flex gap-x-1" @contextmenu.stop.prevent>
          <Button
            fluid
            size="small"
            icon="pi pi-check"
            :label="$t('label-save-changes')"
            class="text-nowrap"
            @click="paletteIsBeingEdited = false"
          />
          <Button size="small" icon="pi pi-bars" @click="(e) => PaletteSectionsMenu!.toggle(e)" />
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
        <div class="flex items-center justify-between" @contextmenu.stop.prevent>
          <span class="text-nowrap">{{
            $t("label-palette-size", { size: patternsStore.pattern?.palette.length ?? 0 })
          }}</span>
          <Button
            v-tooltip="{
              value: paletteIsBeingEdited ? $t('label-save-changes') : $t('label-palette-edit'),
              showDelay: 200,
            }"
            text
            rounded
            :disabled="paletteIsDisabled"
            :icon="`pi pi-${paletteIsBeingEdited ? 'check' : 'pencil'}`"
            size="small"
            severity="secondary"
            @click="
              () => {
                paletteIsBeingEdited = !paletteIsBeingEdited;
                showPaletteCatalog = true;
              }
            "
            @contextmenu="
              (e) => {
                if (!paletteIsBeingEdited) PaletteSectionsMenu!.show(e);
              }
            "
          />
        </div>
      </template>
    </PaletteList>
    <ContextMenu
      ref="palette-context-menu"
      :model="paletteIsBeingEdited ? paletteEditingContextMenuOptions : paletteContextMenuOptions"
    />
    <Menu ref="palette-panels-menu" popup :model="PaletteSectionsMenuOptions" />

    <PaletteCatalog
      v-if="patternsStore.pattern?.palette && showPaletteCatalog"
      :palette="patternsStore.pattern.palette"
      class="border-content min-w-3xs border-r"
      @close="showPaletteCatalog = false"
      @add-palette-item="patternsStore.addPaletteItem"
      @remove-palette-item="patternsStore.removePaletteItem"
    />

    <PaletteDisplayOptions
      v-if="showPaletteDisplayOptions"
      v-model:options="paletteDisplayOptions"
      @close="showPaletteDisplayOptions = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, defineAsyncComponent, nextTick, ref, useTemplateRef, watch } from "vue";
  import { useFluent } from "fluent-vue";
  import { dt } from "@primevue/themes";
  import { Button, ContextMenu, Menu } from "primevue";
  import type { MenuItem } from "primevue/menuitem";
  import { dequal } from "dequal";
  import { usePatternsStore } from "#/stores/patterns";
  import { useAppStateStore } from "#/stores/state";
  import { FullStitchKind, LineStitchKind, NodeStitchKind, PartStitchKind } from "#/schemas/pattern";
  import { DEFAULT_PALETTE_DISPLAY_OPTIONS } from "#/utils/paletteItem";
  import PaletteList from "./palette/PaletteList.vue";
  import ToolSelector from "./toolbar/ToolSelector.vue";

  import FullStitchIcon from "#/assets/icons/stitches/full-stitch.svg?raw";
  import PetiteStitchIcon from "#/assets/icons/stitches/petite-stitch.svg?raw";
  import HalfStitchIcon from "#/assets/icons/stitches/half-stitch.svg?raw";
  import QuarterStitchIcon from "#/assets/icons/stitches/quarter-stitch.svg?raw";
  import BackStitchIcon from "#/assets/icons/stitches/back-stitch.svg?raw";
  import StraightStitchIcon from "#/assets/icons/stitches/straight-stitch.svg?raw";
  import FrenchKnotIcon from "#/assets/icons/stitches/french-knot.svg?raw";
  import BeadIcon from "#/assets/icons/stitches/bead.svg?raw";

  const PaletteCatalog = defineAsyncComponent(() => import("./palette/PaletteCatalog.vue"));
  const PaletteDisplayOptions = defineAsyncComponent(() => import("./palette/PaletteDisplayOptions.vue"));

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

  const fluent = useFluent();

  const fullstitches = ref([
    { icon: FullStitchIcon, label: () => fluent.$t("label-stitch-full"), value: FullStitchKind.Full },
    { icon: PetiteStitchIcon, label: () => fluent.$t("label-stitch-petite"), value: FullStitchKind.Petite },
  ]);
  const partstitches = ref([
    { icon: HalfStitchIcon, label: () => fluent.$t("label-stitch-half"), value: PartStitchKind.Half },
    { icon: QuarterStitchIcon, label: () => fluent.$t("label-stitch-quarter"), value: PartStitchKind.Quarter },
  ]);
  const linestitches = ref([
    { icon: BackStitchIcon, label: () => fluent.$t("label-stitch-back"), value: LineStitchKind.Back },
    { icon: StraightStitchIcon, label: () => fluent.$t("label-stitch-straight"), value: LineStitchKind.Straight },
  ]);
  const nodestitches = ref([
    { icon: FrenchKnotIcon, label: () => fluent.$t("label-stitch-french-knot"), value: NodeStitchKind.FrenchKnot },
    { icon: BeadIcon, label: () => fluent.$t("label-stitch-bead"), value: NodeStitchKind.Bead },
  ]);

  const paletteIsDisabled = computed(() => !patternsStore.pattern);
  const paletteIsBeingEdited = ref(false);

  const showPaletteCatalog = ref(false);
  const showPaletteDisplayOptions = ref(false);

  const paletteDisplayOptions = ref({ ...DEFAULT_PALETTE_DISPLAY_OPTIONS });

  const PaletteSectionsMenu = useTemplateRef("palette-panels-menu");
  const PaletteSectionsMenuOptions = computed<MenuItem[]>(() => [
    {
      label: fluent.$t("label-palette-colors"),
      command: () => {
        paletteIsBeingEdited.value = true;
        showPaletteCatalog.value = !showPaletteCatalog.value;
      },
    },
    {
      label: fluent.$t("label-palette-display-options"),
      command: () => {
        paletteIsBeingEdited.value = true;
        showPaletteDisplayOptions.value = !showPaletteDisplayOptions.value;
      },
    },
  ]);

  const paletteContextMenu = useTemplateRef("palette-context-menu");
  const paletteContextMenuOptions = computed<MenuItem[]>(() => [
    {
      label: fluent.$t("label-palette-edit"),
      command: ({ originalEvent }) => {
        paletteIsBeingEdited.value = true;
        nextTick(() => paletteContextMenu.value!.show(originalEvent));
      },
    },
  ]);
  const paletteEditingContextMenuOptions = computed<MenuItem[]>(() => [
    ...PaletteSectionsMenuOptions.value,
    { separator: true },
    {
      label: fluent.$t("label-palette-delete-selected", {
        selected: appStateStore.selectedPaletteItemIndexes.length,
      }),
      disabled: !patternsStore.pattern?.palette.length || !appStateStore.selectedPaletteItemIndexes.length,
      command: () => patternsStore.removePaletteItem(...appStateStore.selectedPaletteItemIndexes),
    },
    { separator: true },
    {
      label: fluent.$t("label-palette-select-all"),
      disabled: !patternsStore.pattern?.palette.length,
      command: ({ originalEvent }) => {
        appStateStore.selectedPaletteItemIndexes = patternsStore.pattern!.palette.map((_, i) => i);
        nextTick(() => paletteContextMenu.value!.show(originalEvent));
      },
    },
    { separator: true },
    { label: fluent.$t("label-save-changes"), command: () => (paletteIsBeingEdited.value = false) },
  ]);

  watch(paletteIsBeingEdited, (value) => {
    patternsStore.blocked = value;
    if (!value) {
      showPaletteCatalog.value = false;
      showPaletteDisplayOptions.value = false;
      handlePaletteItemsSelection(appStateStore.selectedPaletteItemIndexes);
    }
  });

  function handlePaletteItemsSelection(palindexes: number[]) {
    if (palindexes.length > 1 && !paletteIsBeingEdited.value) {
      appStateStore.selectedPaletteItemIndexes = palindexes.slice(-1);
    } else appStateStore.selectedPaletteItemIndexes = palindexes;
  }
</script>
