import { invoke } from "@tauri-apps/api/core";
import type { PatternKey, Fabric } from "#/schemas/pattern";

export const updateFabric = (patternKey: PatternKey, fabric: Fabric) =>
  invoke<void>("update_fabric", { patternKey, fabric });
