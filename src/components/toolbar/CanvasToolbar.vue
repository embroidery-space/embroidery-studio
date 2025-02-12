<template>
  <div class="bg-content flex flex-col">
    <div class="flex flex-col gap-1 p-2">
      <ToolSelector
        v-for="option in patternViewModeOptions"
        :key="option.value"
        v-model="patternsStore.patternViewMode"
        :options="[option]"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import { usePatternsStore } from "#/stores/patterns";
  import ToolSelector from "./ToolSelector.vue";

  const patternsStore = usePatternsStore();

  const disabled = computed(() => patternsStore.pattern === undefined);

  const patternViewModeOptions = ref([
    { icon: "i-stitches:square", label: "View As Solid", value: "solid" },
    { icon: "i-stitches:full", label: "View As Stitches", value: "stitches" },
  ]);
</script>
