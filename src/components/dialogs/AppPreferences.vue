<template>
  <div class="flex gap-2 pt-4">
    <FloatLabel variant="over">
      <label for="theme">{{ $t("preferences-theme") }}</label>
      <Select id="theme" v-model="selectedTheme" option-label="label" :options="themeOptions">
        <template #value="{ value }">
          <div v-if="value" class="flex items-center">
            <i class="mr-4" :class="value.icon" />
            <span>{{ $t(value.label) }}</span>
          </div>
        </template>

        <template #option="{ option }">
          <div class="flex items-center">
            <i class="mr-4" :class="option.icon" />
            <span>{{ $t(option.label) }}</span>
          </div>
        </template>
      </Select>
    </FloatLabel>

    <FloatLabel variant="over">
      <label for="language">{{ $t("preferences-language") }}</label>
      <Select
        id="language"
        v-model="preferencesStore.language"
        option-label="label"
        option-value="code"
        :options="languageOptions"
      />
    </FloatLabel>
  </div>

  <Fieldset :legend="$t('preferences-other')" toggleable>
    <label class="flex items-center gap-2">
      <Checkbox v-model="preferencesStore.usePaletteItemColorForStitchTools" binary size="small" />
      <span>{{ $t("preferences-use-palitem-color-for-stitch-tools") }}</span>
    </label>
  </Fieldset>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { Checkbox, Fieldset, FloatLabel, Select } from "primevue";
  import { usePreferencesStore, type Theme, type Language } from "#/stores/preferences";

  const preferencesStore = usePreferencesStore();

  type ThemeOption = { label: string; value: Theme; icon: string };
  const themeOptions: ThemeOption[] = [
    { label: "preferences-theme-dark", value: "dark", icon: "pi pi-moon" },
    { label: "preferences-theme-light", value: "light", icon: "pi pi-sun" },
    { label: "preferences-theme-system", value: "system", icon: "pi pi-desktop" },
  ];
  const selectedTheme = computed({
    get: () => themeOptions.find((option) => option.value === preferencesStore.theme)!,
    set: (option) => preferencesStore.setTheme(option.value),
  });

  type LanguageOption = { label: string; code: Language };
  const languageOptions: LanguageOption[] = [
    { label: "English", code: "en" },
    { label: "Українська", code: "uk" },
  ];
</script>
