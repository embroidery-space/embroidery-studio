<template>
  <Button
    text
    type="button"
    severity="secondary"
    icon="pi pi-bars"
    aria-haspopup="true"
    aria-controls="main_menu"
    class="rounded-none"
    @click="(e) => menu!.toggle(e)"
  />
  <TieredMenu id="main_menu" ref="menu" :model="menuOptions" popup />
</template>

<script setup lang="ts">
  import { ref, useTemplateRef } from "vue";
  import { Button, TieredMenu } from "primevue";
  import type { MenuItem } from "primevue/menuitem";
  import { usePreferencesStore } from "#/stores/preferences";
  import { usePatternsStore } from "#/stores/patterns";
  import { storeToRefs } from "pinia";

  const preferencesStore = usePreferencesStore();
  const patternProjectStore = usePatternsStore();
  const { pattern } = storeToRefs(patternProjectStore);

  const menu = useTemplateRef("menu");

  const fileOptions: MenuItem = {
    label: "File",
    icon: "pi pi-file",
    items: [
      {
        label: "Open",
        icon: "pi pi-file",
        command: patternProjectStore.loadPattern,
      },
      {
        label: "Create",
        icon: "pi pi-file-plus",
        command: patternProjectStore.createPattern,
      },
      {
        label: "Save As",
        icon: "pi pi-copy",
        command: patternProjectStore.savePattern,
      },
      {
        label: "Close",
        icon: "pi pi-times",
        command: patternProjectStore.closePattern,
      },
    ],
  };
  const editOptions: MenuItem = {
    label: "Edit",
    icon: "pi pi-pencil",
    visible: () => pattern.value !== undefined,
    items: [
      {
        label: "Fabric Properties",
        command: patternProjectStore.updateFabric,
      },
      {
        label: "Grid Properties",
        command: patternProjectStore.updateGrid,
      },
    ],
  };
  const preferencesOptions: MenuItem = {
    label: "Preferences",
    icon: "pi pi-cog",
    command: preferencesStore.openPreferences,
  };
  const menuOptions = ref<MenuItem[]>([fileOptions, editOptions, preferencesOptions]);
</script>
