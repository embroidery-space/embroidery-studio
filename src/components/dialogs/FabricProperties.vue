<template>
  <div class="grid grid-flow-col grid-cols-2 grid-rows-2 gap-x-2">
    <Fieldset legend="Count" pt:content:class="grid grid-flow-col grid-cols-2 grid-rows-2 gap-4">
      <FloatLabel variant="on">
        <InputNumber
          id="stitches-horizontally"
          v-model="fabric.spi[0]"
          :show-buttons="true"
          :allow-empty="false"
          :min="1"
          :input-style="{ background }"
          @value-change="
            (value) => {
              if (squareStitches) fabric.spi[1] = value;
            }
          "
        />
        <label for="stitches-horizontally" :style="{ background }">Horizontally</label>
      </FloatLabel>

      <FloatLabel variant="on">
        <InputNumber
          id="stitches-vertically"
          v-model="fabric.spi[1]"
          :disabled="squareStitches"
          :show-buttons="true"
          :allow-empty="false"
          :min="1"
          :input-style="{ background }"
        />
        <label for="stitches-vertically" :style="{ background }">Vertically</label>
      </FloatLabel>

      <label class="flex items-center gap-2">
        <!-- TODO: add support for non-square stitches. -->
        <!-- Currently, we are not supporting non-square stitches. -->
        <Checkbox v-model="squareStitches" binary :disabled="true" />
        Square stitches
      </label>
    </Fieldset>

    <Fieldset legend="Size">
      <div class="mx-8 my-4 flex items-center gap-2">
        <FloatLabel variant="on">
          <InputNumber
            id="size-width"
            v-model="fabricSizeFinal.width"
            :allow-empty="false"
            :min="0.1"
            :step="fabricSizeMeasurement === 'inches' ? 0.1 : 1"
            :input-style="{ background }"
          />
          <label for="size-width" :style="{ background }">Width</label>
        </FloatLabel>

        by

        <FloatLabel variant="on">
          <InputNumber
            id="size-height"
            v-model="fabricSizeFinal.height"
            :allow-empty="false"
            :min="0.1"
            :step="fabricSizeMeasurement === 'inches' ? 0.1 : 1"
            :input-style="{ background }"
          />
          <label for="size-height" :style="{ background }">Height</label>
        </FloatLabel>

        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2">
            <RadioButton v-model="fabricSizeMeasurement" value="stitches" />
            stitches
          </label>

          <label class="flex items-center gap-2">
            <RadioButton v-model="fabricSizeMeasurement" value="inches" />
            inches
          </label>

          <label class="flex items-center gap-2">
            <RadioButton v-model="fabricSizeMeasurement" value="mm" />
            mm
          </label>
        </div>
      </div>

      <p>
        Size (WxH):
        {{ fabric.width }}x{{ fabric.height }} stitches, {{ stitches2inches(fabric.width, fabric.spi[0]) }}x{{
          stitches2inches(fabric.height, fabric.spi[1])
        }}
        inches ({{ stitches2mm(fabric.width, fabric.spi[0]) }}x{{ stitches2mm(fabric.height, fabric.spi[1]) }}
        mm)
      </p>
    </Fieldset>

    <Fieldset legend="Color">
      <Listbox
        :model-value="{ name: fabric.name, color: fabric.color }"
        :options="fabricColors"
        scroll-height="100%"
        empty-message="No fabric colors found"
        :dt="{ list: { header: { padding: '4px 8px' } } }"
        pt:root:class="flex flex-col h-full rounded-none border-0"
        :pt:root:style="{ background }"
        pt:list-container:class="grow"
        pt:list:class="grid gap-1"
        :pt:list:style="{ gridTemplateColumns: `repeat(8, minmax(0px, 1fr))` }"
        pt:option:class="p-0"
        @value-change="
          ({ name, color }) => {
            fabric.name = name;
            fabric.color = color;
          }
        "
      >
        <template #option="{ option, selected }">
          <div
            v-tooltip="{ value: option.name, showDelay: 200 }"
            class="h-8 w-full"
            :style="{
              backgroundColor: `#${option.color}`,
              boxShadow: selected
                ? `inset 0 0 0 2px #${option.color}, inset 0 0 0 4px ${contrastColor(new Color(option.color))}`
                : '',
            }"
          ></div>
        </template>
      </Listbox>

      <p>Selected color: {{ fabric.name }}</p>
    </Fieldset>

    <Fieldset legend="Kind">
      <Select v-model="fabric.kind" editable :options="fabricKinds" :pt:root:style="{ background }" />
    </Fieldset>
  </div>

  <DialogFooter :save="() => dialogRef.close({ fabric })" class="mt-5" />
</template>

<script setup lang="ts">
  import { path } from "@tauri-apps/api";
  import { readTextFile } from "@tauri-apps/plugin-fs";
  import { inject, onMounted, reactive, ref, watch, type Ref } from "vue";
  import { dt } from "@primevue/themes";
  import { Checkbox, Fieldset, FloatLabel, InputNumber, Listbox, RadioButton, Select } from "primevue";
  import type { DynamicDialogInstance } from "primevue/dynamicdialogoptions";
  import { Color } from "pixi.js";
  import DialogFooter from "./DialogFooter.vue";
  import { inches2mm, mm2inches, size2stitches, stitches2inches, stitches2mm } from "#/utils/measurement";
  import { contrastColor } from "#/utils/color";
  import { Fabric } from "#/schemas/pattern";

  // Is used to set the background color of the input fields.
  const background = dt("dialog.background");

  const dialogRef = inject<Ref<DynamicDialogInstance>>("dialogRef")!;

  const DEFAULT_FABRIC: Fabric = { width: 60, height: 80, name: "White", color: "FFFFFF", kind: "Aida", spi: [14, 14] };

  // Copy the data from the dialog reference to a reactive object.
  const fabric = reactive<Fabric>(new Fabric(Object.assign({}, DEFAULT_FABRIC, dialogRef.value.data?.fabric)));

  const squareStitches = ref(true);

  const fabricSizeMeasurement = ref<"stitches" | "inches" | "mm">("stitches");
  const fabricSizeFinal = reactive({ width: fabric.width, height: fabric.height });

  watch(fabricSizeMeasurement, (newMeasurement, oldMeasurement) => {
    const { width, height } = fabricSizeFinal;
    switch (newMeasurement) {
      case "stitches": {
        if (oldMeasurement === "inches") {
          fabricSizeFinal.width = size2stitches(width, fabric.spi[0]);
          fabricSizeFinal.height = size2stitches(height, fabric.spi[1]);
        } else {
          fabricSizeFinal.width = size2stitches(mm2inches(width), fabric.spi[0]);
          fabricSizeFinal.height = size2stitches(mm2inches(height), fabric.spi[1]);
        }
        break;
      }
      case "inches": {
        if (oldMeasurement === "stitches") {
          fabricSizeFinal.width = stitches2inches(width, fabric.spi[0]);
          fabricSizeFinal.height = stitches2inches(height, fabric.spi[1]);
        } else {
          fabricSizeFinal.width = mm2inches(width);
          fabricSizeFinal.height = mm2inches(height);
        }
        break;
      }
      case "mm": {
        if (oldMeasurement === "stitches") {
          fabricSizeFinal.width = stitches2mm(width, fabric.spi[0]);
          fabricSizeFinal.height = stitches2mm(height, fabric.spi[1]);
        } else {
          fabricSizeFinal.width = inches2mm(width);
          fabricSizeFinal.height = inches2mm(height);
        }
        break;
      }
    }
  });

  watch(fabricSizeFinal, (size) => {
    const { width, height } = size;
    switch (fabricSizeMeasurement.value) {
      case "stitches": {
        fabric.width = width;
        fabric.height = height;
        break;
      }
      case "inches": {
        fabric.width = size2stitches(width, fabric.spi[0]);
        fabric.height = size2stitches(height, fabric.spi[1]);
        break;
      }
      case "mm": {
        fabric.width = size2stitches(mm2inches(width), fabric.spi[0]);
        fabric.height = size2stitches(mm2inches(height), fabric.spi[1]);
        break;
      }
    }
  });

  const fabricColors = ref<{ name: string; color: string }[]>([]);
  const fabricKinds = ref(["Aida", "Evenweave", "Linen"]);

  onMounted(async () => {
    fabricColors.value = JSON.parse(await readTextFile(await path.resolveResource("resources/fabric-colors.json")));
  });
</script>
