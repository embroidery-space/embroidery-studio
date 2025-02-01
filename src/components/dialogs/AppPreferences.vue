<template>
  <Fluid>
    <div class="grid grid-flow-row grid-cols-2 gap-x-3 gap-y-6">
      <FloatLabel variant="over">
        <Select
          id="font-family"
          v-model="preferencesStore.font.family"
          show-clear
          :loading="fontFamiliesLoading"
          :options="fontFamiliesOptions"
          pt:option:class="py-1"
        >
          <template #option="{ option: fontFamily }">
            <span :style="{ fontFamily }">{{ fontFamily }}</span>
          </template>
        </Select>
        <label for="font-family">{{ $t("preferences-font-family") }}</label>
      </FloatLabel>

      <FloatLabel variant="over">
        <Select
          id="font-size"
          v-model="preferencesStore.font.size"
          :options="fontSizeOptions"
          :option-label="(value) => $t(`preferences-font-size-${value}`)"
        />
        <label for="font-size">{{ $t("preferences-font-size") }}</label>
      </FloatLabel>

      <FloatLabel variant="over">
        <Select id="theme" v-model="selectedTheme" :options="themeOptions">
          <template #value="{ value }">
            <div v-if="value" class="flex items-center">
              <i class="mr-4" :class="value.icon" />
              <span>{{ $t(`preferences-theme-${value.theme}`) }}</span>
            </div>
          </template>

          <template #option="{ option }">
            <div class="flex items-center">
              <i class="mr-4" :class="option.icon" />
              <span>{{ $t(`preferences-theme-${option.theme}`) }}</span>
            </div>
          </template>
        </Select>
        <label for="theme">{{ $t("preferences-theme") }}</label>
      </FloatLabel>

      <FloatLabel variant="over">
        <Select
          id="language"
          v-model="preferencesStore.language"
          option-label="label"
          option-value="code"
          :options="languageOptions"
        />
        <label for="language">{{ $t("preferences-language") }}</label>
      </FloatLabel>
    </div>
  </Fluid>

  <Fieldset :legend="$t('preferences-other')" toggleable>
    <label class="flex items-center gap-2">
      <Checkbox v-model="preferencesStore.usePaletteItemColorForStitchTools" binary />
      <span>{{ $t("preferences-use-palitem-color-for-stitch-tools") }}</span>
    </label>
  </Fieldset>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from "vue";
  import { Checkbox, Fieldset, FloatLabel, Fluid, Select } from "primevue";
  import { FontsApi } from "#/api";
  import { usePreferencesStore } from "#/stores/preferences";
  import type { Theme, Language, FontSizeOption } from "#/stores/preferences";

  const preferencesStore = usePreferencesStore();

  type ThemeOption = { theme: Theme; icon: string };
  const themeOptions: ThemeOption[] = [
    { theme: "dark", icon: "pi pi-moon" },
    { theme: "light", icon: "pi pi-sun" },
    { theme: "system", icon: "pi pi-desktop" },
  ];
  const selectedTheme = computed({
    get: () => themeOptions.find((option) => option.theme === preferencesStore.theme)!,
    set: (option) => preferencesStore.setTheme(option.theme),
  });

  type LanguageOption = { label: string; code: Language };
  const languageOptions: LanguageOption[] = [
    { label: "English", code: "en" },
    { label: "Українська", code: "uk" },
  ];

  const fontFamiliesLoading = ref(false);
  const fontFamiliesOptions = ref<string[]>([]);
  const fontSizeOptions: FontSizeOption[] = ["xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large"];

  onMounted(async () => {
    try {
      fontFamiliesLoading.value = true;
      fontFamiliesOptions.value = await FontsApi.getAllTextFontFamilies();
    } finally {
      fontFamiliesLoading.value = false;
    }
  });
</script>
