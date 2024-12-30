import { invoke } from "@tauri-apps/api/core";
import type { PatternKey, Stitch } from "#/schemas/pattern";

export const addStitch = (patternKey: PatternKey, stitch: Stitch) =>
  invoke<boolean>("add_stitch", { patternKey, stitch });
export const removeStitch = (patternKey: PatternKey, stitch: Stitch) =>
  invoke<boolean>("remove_stitch", { patternKey, stitch });
