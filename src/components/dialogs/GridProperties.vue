<template>
  <div class="flex items-center gap-2">
    <FloatLabel variant="over">
      <InputNumber
        id="major-lines-interval"
        v-model="grid.majorLinesInterval"
        show-buttons
        :allow-empty="false"
        :min="1"
      />
      <label for="major-lines-interval">{{ $t("grid-properties-major-lines-interval") }}</label>
    </FloatLabel>
  </div>

  <Fieldset :legend="$t('grid-properties-minor-lines')" pt:content:class="flex items-center gap-4 pt-3">
    <FloatLabel variant="over">
      <InputNumber
        id="minor-thickness"
        v-model="grid.minorScreenLines.thickness"
        suffix=" pt"
        :allow-empty="false"
        :min="0.001"
        :step="0.01"
      />
      <label for="minor-thickness">{{ $t("thickness") }}</label>
    </FloatLabel>

    <label class="flex items-center gap-2">
      {{ $t("color") }}:
      <ColorPicker v-model="grid.minorScreenLines.color" format="hex" />
    </label>
  </Fieldset>

  <Fieldset :legend="$t('grid-properties-major-lines')" pt:content:class="flex items-center gap-4 pt-3">
    <FloatLabel variant="over">
      <InputNumber
        id="major-thickness"
        v-model="grid.majorScreenLines.thickness"
        suffix=" pt"
        :allow-empty="false"
        :min="0.001"
        :step="0.01"
      />
      <label for="major-thickness">{{ $t("thickness") }}</label>
    </FloatLabel>

    <label class="flex items-center gap-2">
      {{ $t("color") }}:
      <ColorPicker v-model="grid.majorScreenLines.color" format="hex" />
    </label>
  </Fieldset>

  <DialogFooter :save="() => dialogRef.close({ grid })" class="mt-5" />
</template>

<script setup lang="ts">
  import { inject, reactive, type Ref } from "vue";
  import { ColorPicker, Fieldset, FloatLabel, InputNumber } from "primevue";
  import type { DynamicDialogInstance } from "primevue/dynamicdialogoptions";
  import DialogFooter from "./DialogFooter.vue";
  import { Grid } from "#/schemas/pattern";

  const dialogRef = inject<Ref<DynamicDialogInstance>>("dialogRef")!;

  // Copy the data from the dialog reference to a reactive object.
  const grid = reactive<Grid>(new Grid(Object.assign({}, dialogRef.value.data!.grid)));
</script>
