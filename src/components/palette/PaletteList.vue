<template>
  <Listbox
    :model-value="modelValue"
    :options="options"
    :option-value="optionValue"
    :multiple="mulitple"
    :meta-key-selection="metaKeySelection"
    :empty-message="emptyMessage"
    scroll-height="100%"
    :pt="listboxPassThrough"
    :dt="{ list: { header: { padding: '0.25rem' } } }"
    @update:model-value="(v) => emit('update:modelValue', v)"
    @option-dblclick="(e) => emit('option-dblclick', e)"
  >
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>

    <template #option="{ option, selected }">
      <slot name="option" v-bind="{ option, selected, displayOptions }">
        <PaletteItem :palette-item="option" :selected="selected" :display-options="displayOptions" />
      </slot>
    </template>
  </Listbox>
</template>

<script setup lang="ts" generic="T, V">
  import { computed } from "vue";
  import type { PassThrough } from "@primevue/core";
  import { Listbox, type ListboxOptionDblClickEvent, type ListboxPassThroughOptions } from "primevue";
  import { dt } from "@primevue/themes";
  import type { PaletteDisplayOptions } from "#/utils/paletteItem";
  import PaletteItem from "./PaletteItem.vue";

  const props = defineProps<{
    modelValue: V;
    options?: T[];
    optionValue?: (option: T) => unknown;
    mulitple?: boolean;
    metaKeySelection?: boolean;
    emptyMessage?: string;
    displayOptions: PaletteDisplayOptions;
    fluidOptions?: boolean;
  }>();

  const emit = defineEmits<{
    (event: "update:modelValue", value: V): void;
    (event: "option-dblclick", data: ListboxOptionDblClickEvent): void;
  }>();

  const listboxPassThrough: PassThrough<ListboxPassThroughOptions> = computed(() => ({
    root: { class: "flex flex-col h-full", style: { background: dt("content.background") } },
    listContainer: { class: "border-t grow", style: { borderColor: dt("content.border.color") } },
    list: {
      class: "grid gap-1 overflow-x-hidden",
      style: {
        gridTemplateColumns: `repeat(${props.options?.length ? props.displayOptions.columnsNumber : 1}, ${props.fluidOptions ? "minmax(0px, 1fr)" : "min-content"})`,
      },
    },
    option: { class: "p-0" },
  }));
</script>
