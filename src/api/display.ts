import { invoke } from "@tauri-apps/api/core";
import type { PatternKey, DisplayMode } from "#/schemas/pattern";

export function setDisplayMode(patternKey: PatternKey, mode: DisplayMode) {
  return invoke<void>("set_display_mode", { mode, patternKey });
}

export function showSymbols(patternKey: PatternKey, value: boolean) {
  return invoke<void>("show_symbols", { value, patternKey });
}
