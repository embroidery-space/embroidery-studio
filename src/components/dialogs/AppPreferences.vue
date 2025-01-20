<template>
  <div class="pt-4">
    <FloatLabel variant="over">
      <label for="theme">Theme</label>
      <Select id="theme" v-model="selectedTheme" option-label="label" :options="themeOptions">
        <template #value="{ value }">
          <div v-if="value" class="flex items-center">
            <i class="mr-4" :class="value.icon" />
            <span>{{ value.label }}</span>
          </div>
        </template>

        <template #option="{ option }">
          <div class="flex items-center">
            <i class="mr-4" :class="option.icon" />
            <span>{{ option.label }}</span>
          </div>
        </template>
      </Select>
    </FloatLabel>

    <Fieldset legend="Other" toggleable>
      <label class="flex items-center gap-2">
        <Checkbox v-model="preferencesStore.usePaletteItemColorForStitchTools" binary size="small" />
        <span>Use palette item color for stitch tools</span>
      </label>
    </Fieldset>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { Checkbox, Fieldset, FloatLabel, Select } from "primevue";
  import { usePreferencesStore, type Theme } from "#/stores/preferences";

  const preferencesStore = usePreferencesStore();

  type ThemeOption = { label: string; value: Theme; icon: string };
  const themeOptions: Array<ThemeOption> = [
    { label: "Light", value: "light", icon: "pi pi-sun" },
    { label: "Dark", value: "dark", icon: "pi pi-moon" },
    { label: "System", value: "system", icon: "pi pi-desktop" },
  ] as const;
  const selectedTheme = computed<ThemeOption>({
    get: () => themeOptions.find((option) => option.value === preferencesStore.theme)!,
    set: (option: ThemeOption) => preferencesStore.setTheme(option.value),
  });
</script>
