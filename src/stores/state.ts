import { reactive } from "vue";
import { defineStore } from "pinia";
import { StitchKind, type PaletteItem } from "#/types/pattern/pattern";

interface OpenedPattern {
  title: string;
  key: string;
}

export interface AppState {
  selectedStitchTool: StitchKind;
  selectedPaletteItem?: PaletteItem;
  openedPatterns?: OpenedPattern[];
  currentPattern?: OpenedPattern;
}

export const useAppStateStore = defineStore("embroidery-studio-state", () => {
  const state = reactive<AppState>({
    selectedStitchTool: StitchKind.Full,
  });

  /**
   * Adds the opened pattern to the app state.
   * If the pattern is already opened, it will not be added again.
   *
   * @param title The title of the pattern.
   * @param key The key of the pattern. Actually, the key is the file path of the pattern.
   */
  function addOpenedPattern(title: string, key: string) {
    if (!state.openedPatterns) state.openedPatterns = [];
    const openedPattern: OpenedPattern = { title, key };
    if (state.openedPatterns.findIndex((p) => p.key === key) < 0) state.openedPatterns.push(openedPattern);
    state.currentPattern = openedPattern;
  }

  function removeCurrentPattern() {
    if (!state.openedPatterns || !state.currentPattern) return;
    const index = state.openedPatterns.findIndex((p) => p.key === state.currentPattern!.key);
    if (index >= 0) state.openedPatterns.splice(index, 1);
    if (state.openedPatterns.length) state.currentPattern = state.openedPatterns[0];
    else state.currentPattern = undefined;
  }

  return { state, addOpenedPattern, removeCurrentPattern };
});
