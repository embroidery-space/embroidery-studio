<template>
  <Button
    v-tooltip="{
      value: typeof props.option.label === 'function' ? props.option.label() : props.option.label,
      showDelay: 200,
      disabled: props.disabled,
    }"
    :text="!selected"
    :disabled="props.disabled"
    severity="secondary"
    :icon="props.option.icon"
    class="size-[var(--p-button-icon-only-width)] border-none p-1.5"
    :style="{ color: dt('text.muted.color') }"
    @click="onChange"
  />
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { Button } from "primevue";
  import type { MenuItem } from "primevue/menuitem";
  import { dt } from "@primeuix/themes";

  type ToolOption = Omit<MenuItem, "command" | "value">;

  const props = defineProps<{ modelValue: unknown; option: ToolOption; disabled?: boolean }>();
  const emit = defineEmits(["update:modelValue"]);

  const selected = computed(() => props.modelValue && !props.disabled);

  function onChange() {
    if (props.disabled) return;
    emit("update:modelValue", !props.modelValue);
  }
</script>
