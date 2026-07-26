<script lang="ts" setup>
import { Checkbox, FormField, FormFieldSet, InputDimensions, InputNumber } from "@embroiderly/ui";

import type { PdfExportOptions } from "~/lib/pattern/";

const options = defineModel<PdfExportOptions>({ required: true });
const props = defineProps<{
  fabricWidth: number;
  fabricHeight: number;
}>();
</script>

<template>
  <div>
    <FormFieldSet :legend="$t('publish-settings-frame-options')" class="m-0! space-y-2">
      <p class="text-sm whitespace-pre-line text-dimmed">{{ $t("publish-settings-frame-definition") }}</p>

      <InputDimensions
        v-model:width="options.frameSize[0]"
        v-model:height="options.frameSize[1]"
        :width-field-options="{ label: $t('publish-settings-frame-width') }"
        :height-field-options="{ label: $t('publish-settings-frame-height') }"
        :width-input-options="{ min: 1, max: props.fabricWidth }"
        :height-input-options="{ min: 1, max: props.fabricHeight }"
        :aspect-ratio="options.frameSize[0] / options.frameSize[1]"
      />

      <FormField v-bind="$ta('publish-settings-frame-preserved-overlap')" class="w-full">
        <InputNumber v-model="options.preservedOverlap" :min="0" orientation="vertical" class="w-full" />
      </FormField>

      <Checkbox v-model="options.showGridLineNumbers" :label="$t('publish-settings-frame-show-grid-line-numbers')" />
      <Checkbox v-model="options.showCenteringMarks" :label="$t('publish-settings-frame-show-centering-marks')" />
    </FormFieldSet>
  </div>
</template>
