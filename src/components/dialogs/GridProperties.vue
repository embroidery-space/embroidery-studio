<template>
  <div class="flex items-center gap-2">
    Show major stitches every
    <InputNumber
      v-model="grid.majorLineEveryStitches"
      show-buttons
      :allow-empty="false"
      :min="1"
      :input-style="{ background }"
    />
    stitches.
  </div>

  <Fieldset legend="Minor Lines" pt:content:class="flex items-center gap-4">
    <FloatLabel variant="on">
      <InputNumber
        id="minor-thickness"
        v-model="grid.minorScreenLines.thickness"
        suffix=" pt"
        :allow-empty="false"
        :min="0.001"
        :step="0.01"
        :input-style="{ background }"
      />
      <label for="minor-thickness" :style="{ background }">Thickness</label>
    </FloatLabel>

    <label class="flex items-center gap-2">
      Color:
      <ColorPicker v-model="grid.minorScreenLines.color" format="hex" />
    </label>
  </Fieldset>

  <Fieldset legend="Major Lines" pt:content:class="flex items-center gap-4">
    <FloatLabel variant="on">
      <InputNumber
        id="major-thickness"
        v-model="grid.majorScreenLines.thickness"
        suffix=" pt"
        :allow-empty="false"
        :min="0.001"
        :step="0.01"
        :input-style="{ background }"
      />
      <label for="major-thickness" :style="{ background }">Thickness</label>
    </FloatLabel>

    <label class="flex items-center gap-2">
      Color:
      <ColorPicker v-model="grid.majorScreenLines.color" format="hex" />
    </label>
  </Fieldset>

  <DialogFooter :save="() => dialogRef.close({ grid })" class="mt-5" />
</template>

<script setup lang="ts">
  import { inject, reactive, type Ref } from "vue";
  import { dt } from "@primevue/themes";
  import { ColorPicker, Fieldset, FloatLabel, InputNumber } from "primevue";
  import type { DynamicDialogInstance } from "primevue/dynamicdialogoptions";
  import DialogFooter from "./DialogFooter.vue";
  import type { Grid } from "#/schemas/pattern";

  // Is used to set the background color of the input fields.
  const background = dt("dialog.background");

  const dialogRef = inject<Ref<DynamicDialogInstance>>("dialogRef")!;

  // Copy the data from the dialog reference to a reactive object.
  const grid = reactive<Grid>(Object.assign({}, dialogRef.value.data!.grid));
</script>
