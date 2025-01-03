import { invoke } from "@tauri-apps/api/core";
import { serialize } from "@dao-xyz/borsh";
import { type PatternKey, Fabric } from "#/schemas/pattern";

export function updateFabric(patternKey: PatternKey, fabric: Fabric) {
  return invoke<void>("update_fabric", serialize(fabric), { headers: { patternKey } });
}
