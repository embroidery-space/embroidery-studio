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
  import { useMagicKeys, whenever } from "@vueuse/core";
  import { Button, TieredMenu } from "primevue";
  import type { MenuItem } from "primevue/menuitem";
  import { usePreferencesStore } from "#/stores/preferences";
  import { usePatternProjectStore } from "#/stores/patproj";
  import { storeToRefs } from "pinia";

  const preferencesStore = usePreferencesStore();
  const patternProjectStore = usePatternProjectStore();
  const { patproj } = storeToRefs(patternProjectStore);

  const menu = useTemplateRef("menu");

  const keys = useMagicKeys();
  whenever(keys.ctrl_o!, patternProjectStore.loadPattern);
  whenever(keys.ctrl_n!, patternProjectStore.createPattern);
  whenever(keys.ctrl_s!, patternProjectStore.savePattern);
  whenever(keys.ctrl_w!, patternProjectStore.closePattern);

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
    visible: () => patproj.value !== undefined,
    items: [
      {
        label: "Fabric Properties",
        command: patternProjectStore.updateFabric,
      },
    ],
  };
  const preferencesOptions: MenuItem = {
    label: "Preferences",
    icon: "pi pi-cog",
    items: [
      {
        label: "Theme",
        icon: "pi pi-palette",
        items: [
          {
            label: "Light",
            icon: "pi pi-sun",
            command: () => preferencesStore.setTheme("light"),
          },
          {
            label: "Dark",
            icon: "pi pi-moon",
            command: () => preferencesStore.setTheme("dark"),
          },
          {
            label: "System",
            icon: "pi pi-desktop",
            command: () => preferencesStore.setTheme("system"),
          },
        ],
      },
    ],
  };
  const menuOptions = ref<MenuItem[]>([fileOptions, editOptions, preferencesOptions]);
</script>
