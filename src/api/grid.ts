import { invoke } from "@tauri-apps/api/core";
import { serialize } from "@dao-xyz/borsh";
import type { PatternKey, Grid } from "#/schemas/pattern";

export function updateGrid(patternKey: PatternKey, grid: Grid) {
  return invoke<void>("update_grid", serialize(grid), { headers: { patternKey } });
}
