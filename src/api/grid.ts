import { invoke } from "@tauri-apps/api/core";
import type { PatternKey, Grid } from "#/schemas/pattern";

export const updateGrid = (patternKey: PatternKey, grid: Grid) => invoke<void>("update_grid", { patternKey, grid });
