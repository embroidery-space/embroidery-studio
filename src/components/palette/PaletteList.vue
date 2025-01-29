<template>
  <Listbox
    :model-value="modelValue"
    :options="options"
    :option-value="optionValue"
    :disabled="disabled"
    :multiple="mulitple"
    :meta-key-selection="metaKeySelection"
    :empty-message="$t('palette-empty-message')"
    scroll-height="100%"
    :list-style="listStyle"
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

    <template v-if="$slots.footer" #footer>
      <div class="px-2 py-1">
        <slot name="footer"></slot>
      </div>
    </template>
  </Listbox>
</template>

<script setup lang="ts" generic="T, V">
  import { computed } from "vue";
  import { type PassThrough } from "@primevue/core";
  import { Listbox, type ListboxOptionDblClickEvent, type ListboxPassThroughOptions } from "primevue";
  import type { PaletteDisplayOptions } from "#/utils/paletteItem";
  import PaletteItem from "./PaletteItem.vue";

  const props = defineProps<{
    modelValue: V;
    options?: T[];
    optionValue?: (option: T) => unknown;
    disabled?: boolean;
    mulitple?: boolean;
    metaKeySelection?: boolean;
    displayOptions: PaletteDisplayOptions;
    fluidOptions?: boolean;
    listStyle?: string;
  }>();

  const emit = defineEmits<{
    (event: "update:modelValue", value: V): void;
    (event: "option-dblclick", data: ListboxOptionDblClickEvent): void;
  }>();

  const listboxPassThrough: PassThrough<ListboxPassThroughOptions> = computed(() => ({
    root: { class: "flex flex-col" },
    listContainer: { class: "grow" },
    list: {
      class: "grid gap-1 overflow-x-hidden",
      style: {
        gridTemplateColumns: `repeat(${props.options?.length ? props.displayOptions.columnsNumber : 1}, ${props.fluidOptions ? "minmax(0px, 1fr)" : "min-content"})`,
      },
    },
    option: { class: "p-0" },
  }));
</script>
