import { invoke } from "@tauri-apps/api/core";
import { serialize } from "@dao-xyz/borsh";
import { type PatternKey, PaletteItem, PaletteSettings } from "#/schemas/pattern";

export function addPaletteItem(patternKey: PatternKey, paletteItem: PaletteItem) {
  return invoke<void>("add_palette_item", serialize(paletteItem), { headers: { patternKey } });
}

export function removePaletteItems(patternKey: PatternKey, paletteItemIndexes: number[]) {
  return invoke<void>("remove_palette_items", { paletteItemIndexes }, { headers: { patternKey } });
}

export function updatePaletteDisplaySettings(patternKey: PatternKey, displaySettings: PaletteSettings) {
  return invoke<void>("update_palette_display_settings", serialize(displaySettings), { headers: { patternKey } });
}
