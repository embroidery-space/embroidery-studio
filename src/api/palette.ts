import { invoke } from "@tauri-apps/api/core";
import { serialize } from "@dao-xyz/borsh";
import { type PatternKey, PaletteItem } from "#/schemas/pattern";

export function addPaletteItem(patternKey: PatternKey, paletteItem: PaletteItem) {
  return invoke<void>("add_palette_item", serialize(paletteItem), { headers: { patternKey } });
}

export function removePaletteItem(patternKey: PatternKey, paletteItem: PaletteItem) {
  return invoke<void>("remove_palette_item", serialize(paletteItem), { headers: { patternKey } });
}