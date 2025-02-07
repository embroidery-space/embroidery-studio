<template>
  <div class="grid grid-rows-[auto_1fr]">
    <div ref="header" class="border-content flex flex-none items-center justify-between border-b px-2 py-1">
      <span class="text-nowrap">{{ props.title }}</span>
      <Button
        rounded
        text
        icon="pi pi-times"
        severity="secondary"
        size="small"
        class="flex size-8.5"
        @click="emit('close')"
      />
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  import { Button } from "primevue";

  const props = defineProps<{ title: string }>();
  const emit = defineEmits<{ (event: "close"): void }>();
</script>
