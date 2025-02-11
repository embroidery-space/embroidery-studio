<template>
  <PaletteSection :title="$t('label-palette-display-options')" @close="emit('close')">
    <div class="flex flex-col gap-y-2 p-2 pt-6">
      <FloatLabel variant="over">
        <InputNumber
          id="columns-number"
          :model-value="props.options.columnsNumber"
          show-buttons
          :allow-empty="false"
          :min="1"
          :max="8"
          @update:model-value="(value) => updateOptions('columnsNumber', value)"
        />
        <label for="columns-number">{{ $t("label-display-options-columns-number") }}</label>
      </FloatLabel>

      <label class="flex items-center gap-x-2">
        <ToggleSwitch
          :model-value="props.options.colorOnly"
          @update:model-value="(value) => updateOptions('colorOnly', value)"
        />
        <span>{{ $t("label-display-options-color-only") }}</span>
      </label>

      <div class="flex flex-col gap-y-1">
        <label class="flex items-start gap-x-2">
          <Checkbox
            :model-value="props.options.showBrand"
            :disabled="props.options.colorOnly"
            binary
            @update:model-value="(value) => updateOptions('showBrand', value)"
          />
          <span>{{ $t("label-display-options-show-brand") }}</span>
        </label>

        <label class="flex items-start gap-x-2">
          <Checkbox
            :model-value="props.options.showNumber"
            :disabled="props.options.colorOnly"
            binary
            @update:model-value="(value) => updateOptions('showNumber', value)"
          />
          <span>{{ $t("label-display-options-show-number") }}</span>
        </label>

        <label class="flex items-start gap-x-2">
          <Checkbox
            :model-value="props.options.showName"
            :disabled="props.options.colorOnly"
            binary
            @update:model-value="(value) => updateOptions('showName', value)"
          />
          <span>{{ $t("label-display-options-show-name") }}</span>
        </label>
      </div>
    </div>
  </PaletteSection>
</template>

<script setup lang="ts">
  import { Checkbox, FloatLabel, InputNumber, ToggleSwitch } from "primevue";
  import type { PaletteDisplayOptions } from "#/utils/paletteItem";
  import PaletteSection from "./PaletteSection.vue";

  const props = defineProps<{ options: PaletteDisplayOptions }>();
  const emit = defineEmits<{ (event: "close"): void; (event: "update:options", data: PaletteDisplayOptions): void }>();

  function updateOptions<K extends keyof PaletteDisplayOptions>(key: K, value: PaletteDisplayOptions[K]) {
    emit("update:options", { ...props.options, [key]: value });
  }
</script>
