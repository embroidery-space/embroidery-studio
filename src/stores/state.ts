import { ref } from "vue";
import { defineStore } from "pinia";
import { FullStitchKind, type StitchKind, type PatternKey } from "#/schemas/pattern";

interface OpenedPattern {
  title: string;
  key: PatternKey;
}

export const useAppStateStore = defineStore(
  "embroidery-studio-state",
  () => {
    const selectedStitchTool = ref<StitchKind>(FullStitchKind.Full);
    const selectedPaletteItemIndices = ref<number[]>([]);
    const openedPatterns = ref<OpenedPattern[]>([]);
    const currentPattern = ref<OpenedPattern | undefined>(undefined);

    /**
     * Adds the opened pattern to the app
     * If the pattern is already opened, it will not be added again.
     *
     * @param title The title of the pattern.
     * @param key The key of the pattern. Actually, the key is the file path of the pattern.
     */
    function addOpenedPattern(title: string, key: PatternKey) {
      const openedPattern: OpenedPattern = { title, key };
      if (openedPatterns.value.findIndex((p) => p.key === key) < 0) openedPatterns.value.push(openedPattern);
      currentPattern.value = openedPattern;
    }

    function removeCurrentPattern() {
      if (!openedPatterns.value || !currentPattern.value) return;
      const index = openedPatterns.value.findIndex((p) => p.key === currentPattern.value!.key);
      if (index >= 0) openedPatterns.value.splice(index, 1);
      if (openedPatterns.value.length) currentPattern.value = openedPatterns.value[0];
      else currentPattern.value = undefined;
    }

    return {
      selectedStitchTool,
      selectedPaletteItemIndices,
      openedPatterns,
      currentPattern,
      addOpenedPattern,
      removeCurrentPattern,
    };
  },
  { persist: { storage: sessionStorage } },
);
