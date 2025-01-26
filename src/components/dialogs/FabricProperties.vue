<template>
  <div class="grid grid-flow-col grid-cols-2 grid-rows-2 gap-x-2">
    <Fieldset :legend="$t('fabric-properties-count-and-kind')" pt:content:class="flex flex-col gap-6 pt-3">
      <FloatLabel variant="over">
        <Select
          id="count"
          v-model="fabric.spi[0]"
          editable
          :options="fabricCounts"
          @value-change="(value) => (fabric.spi[1] = value)"
        />
        <label for="count">{{ $t("fabric-properties-count") }}</label>
      </FloatLabel>

      <FloatLabel variant="over">
        <Select
          id="kind"
          v-model="fabric.kind"
          editable
          option-label="label"
          option-value="value"
          :options="fabricKinds"
        />
        <label for="kind">{{ $t("fabric-properties-kind") }}</label>
      </FloatLabel>
    </Fieldset>

    <Fieldset :legend="$t('size')">
      <div class="flex gap-4 py-3">
        <div class="flex flex-col gap-6">
          <FloatLabel variant="over">
            <InputNumber
              id="size-width"
              v-model="fabricSizeFinal.width"
              :allow-empty="false"
              :min="0.1"
              :step="fabricSizeMeasurement === 'inches' ? 0.1 : 1"
            />
            <label for="size-width">{{ $t("width") }}</label>
          </FloatLabel>

          <FloatLabel variant="over">
            <InputNumber
              id="size-height"
              v-model="fabricSizeFinal.height"
              :allow-empty="false"
              :min="0.1"
              :step="fabricSizeMeasurement === 'inches' ? 0.1 : 1"
            />
            <label for="size-height">{{ $t("height") }}</label>
          </FloatLabel>
        </div>

        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2">
            <RadioButton v-model="fabricSizeMeasurement" value="stitches" />
            {{ $t("measurement-stitches") }}
          </label>

          <label class="flex items-center gap-2">
            <RadioButton v-model="fabricSizeMeasurement" value="inches" />
            {{ $t("measurement-inches") }}
          </label>

          <label class="flex items-center gap-2">
            <RadioButton v-model="fabricSizeMeasurement" value="mm" />
            {{ $t("measurement-mm") }}
          </label>
        </div>
      </div>

      <p>
        {{
          $t("fabric-properties-total-size", {
            width: fabricSizeFinal.width,
            height: fabricSizeFinal.height,
            widthInches: stitches2inches(fabricSizeFinal.width, fabric.spi[0]),
            heightInches: stitches2inches(fabricSizeFinal.height, fabric.spi[1]),
            widthMm: stitches2mm(fabricSizeFinal.width, fabric.spi[0]),
            heightMm: stitches2mm(fabricSizeFinal.height, fabric.spi[1]),
          })
        }}
      </p>
    </Fieldset>

    <Fieldset :legend="$t('color')" class="row-start-1 row-end-3">
      <PaletteList
        :model-value="{ name: fabric.name, color: fabric.color.toHex().substring(1).toUpperCase() }"
        :options="fabricColors"
        :display-options="fabricColorsDisplayOptions"
        fluid-options
        @update:model-value="
          ({ name, color }) => {
            fabric.name = name;
            fabric.color = new Color(color);
          }
        "
      />
      <p class="mt-2">{{ $t("fabric-properties-selected-color", { color: fabric.name }) }}</p>
    </Fieldset>
  </div>

  <DialogFooter :save="() => dialogRef.close({ fabric })" class="mt-5" />
</template>

<script setup lang="ts">
  import { path } from "@tauri-apps/api";
  import { readTextFile } from "@tauri-apps/plugin-fs";
  import { inject, onMounted, reactive, ref, watch, type Ref } from "vue";
  import { useFluent } from "fluent-vue";
  import { Fieldset, FloatLabel, InputNumber, RadioButton, Select } from "primevue";
  import type { DynamicDialogInstance } from "primevue/dynamicdialogoptions";
  import { Color } from "pixi.js";
  import DialogFooter from "./DialogFooter.vue";
  import { inches2mm, mm2inches, size2stitches, stitches2inches, stitches2mm } from "#/utils/measurement";
  import { Fabric } from "#/schemas/pattern";
  import PaletteList from "../palette/PaletteList.vue";
  import type { PaletteDisplayOptions } from "#/utils/paletteItem";

  const dialogRef = inject<Ref<DynamicDialogInstance>>("dialogRef")!;
  const fluent = useFluent();

  // Copy the data from the dialog reference to a reactive object.
  const fabric = reactive<Fabric>(new Fabric(Object.assign({}, Fabric.default(), dialogRef.value.data?.fabric)));

  const fabricCounts = ref([14, 16, 18, 20]);

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

  const fabricKinds = ref([
    { label: fluent.$t("fabric-properties-kind-aida"), value: "Aida" },
    { label: fluent.$t("fabric-properties-kind-evenweave"), value: "Evenweave" },
    { label: fluent.$t("fabric-properties-kind-linen"), value: "Linen" },
  ]);
  const fabricColors = ref<{ name: string; color: string }[]>([]);
  const fabricColorsDisplayOptions: PaletteDisplayOptions = {
    colorOnly: true,
    showBrand: false,
    showNumber: false,
    showName: false,
    columnsNumber: 8,
  };

  onMounted(async () => {
    const fabricColorsPath = await path.resolveResource("resources/fabric-colors.json");
    const content = await readTextFile(fabricColorsPath);
    fabricColors.value = JSON.parse(content);
  });
</script>
