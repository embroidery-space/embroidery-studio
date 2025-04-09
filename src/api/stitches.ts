import { invoke } from "@tauri-apps/api/core";
import { serializeStitch, type PatternKey, type Stitch } from "#/schemas/index.ts";

export function addStitch(patternKey: PatternKey, stitch: Stitch) {
  return invoke<boolean>("add_stitch", serializeStitch(stitch), { headers: { patternKey } });
}

export function removeStitch(patternKey: PatternKey, stitch: Stitch) {
  return invoke<boolean>("remove_stitch", serializeStitch(stitch), { headers: { patternKey } });
}
