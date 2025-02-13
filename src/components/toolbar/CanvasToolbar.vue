<template>
  <div class="bg-content flex flex-col">
    <div class="flex flex-col gap-1 p-2">
      <ToolSelector
        v-for="option in patternViewOptions"
        :key="option.value"
        v-model="patternsStore.patternView"
        :options="[option]"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import { View } from "#/schemas/pattern";
  import { usePatternsStore } from "#/stores/patterns";
  import ToolSelector from "./ToolSelector.vue";
  import { useFluent } from "fluent-vue";

  const fluent = useFluent();

  const patternsStore = usePatternsStore();

  const disabled = computed(() => patternsStore.pattern === undefined);

  const patternViewOptions = ref([
    { icon: "i-stitches:square", label: () => fluent.$t("label-view-as-solid"), value: View.Solid },
    { icon: "i-stitches:full", label: () => fluent.$t("label-view-as-stitches"), value: View.Stitches },
  ]);
</script>
