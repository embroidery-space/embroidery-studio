<template>
  <div class="bg-content flex flex-col">
    <div class="flex flex-col gap-1 p-2">
      <ToolSelector
        v-for="option in patternViewOptions"
        :key="option.value"
        v-model="displayMode"
        :options="[option]"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import { useFluent } from "fluent-vue";
  import { DisplayMode } from "#/schemas/pattern";
  import { usePatternsStore } from "#/stores/patterns";
  import ToolSelector from "./ToolSelector.vue";

  const fluent = useFluent();

  const patternsStore = usePatternsStore();

  const disabled = computed(() => patternsStore.pattern === undefined);
  const displayMode = computed({
    get: () => patternsStore.pattern?.displayMode ?? DisplayMode.Solid,
    set: async (mode) => {
      if (patternsStore.pattern?.displayMode !== mode) await patternsStore.setDisplayMode(mode);
    },
  });

  const patternViewOptions = ref([
    { icon: "i-stitches:square", label: () => fluent.$t("label-view-as-solid"), value: DisplayMode.Solid },
    { icon: "i-stitches:full", label: () => fluent.$t("label-view-as-stitches"), value: DisplayMode.Stitches },
  ]);
</script>
