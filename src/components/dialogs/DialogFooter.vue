<template>
  <div class="flex w-full items-center justify-end gap-2">
    <Button severity="secondary" size="small" :label="$t('cancel')" @click="() => dialogRef.close()" />
    <Button severity="success" size="small" :label="$t('save')" @click="() => props.save()" />
  </div>
</template>

<script setup lang="ts">
  import { inject, type Ref } from "vue";
  import { Button } from "primevue";
  import type { DynamicDialogInstance } from "primevue/dynamicdialogoptions";

  const dialogRef = inject<Ref<DynamicDialogInstance>>("dialogRef")!;

  interface DialogFooterProps {
    save: () => void;
  }

  const props = defineProps<DialogFooterProps>();
</script>
