<template>
  <div
    v-tooltip="{ value: paletteItemTitle(paletteItem), showDelay: 200 }"
    class="h-8 w-full px-2 py-1"
    :style="{
      backgroundColor,
      color: `${foregroundColor} !important`,
      boxShadow: selected ? `inset 0 0 0 2px ${backgroundColor}, inset 0 0 0 4px ${foregroundColor}` : '',
    }"
  >
    <p v-show="!displayOptions.colorOnly" class="overflow-hidden text-ellipsis whitespace-nowrap">
      {{ paletteItemTitle(paletteItem, displayOptions) }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { contrastColor } from "#/utils/color";
  import { paletteItemTitle, type PaletteDisplayOptions } from "#/utils/paletteItem";
  import type { PaletteItem } from "#/schemas/pattern";

  interface PaletteItemProps {
    paletteItem: PaletteItem;
    displayOptions: PaletteDisplayOptions;
    selected: boolean;
  }

  const { paletteItem, displayOptions, selected } = defineProps<PaletteItemProps>();

  const backgroundColor = computed(() => paletteItem.color.toHex());
  const foregroundColor = computed(() => contrastColor(paletteItem.color));
</script>
