import { invoke } from "@tauri-apps/api/core";
import { serialize } from "@dao-xyz/borsh";
import { type PatternKey, Fabric, deserializePatternProject } from "#/schemas/pattern";

export async function loadPattern(filePath: string) {
  const bytes = await invoke<number[]>("load_pattern", undefined, { headers: { filePath } });
  return deserializePatternProject(new Uint8Array(bytes));
}

export async function createPattern(fabric: Fabric) {
  const bytes = await invoke<number[]>("create_pattern", serialize(fabric));
  return deserializePatternProject(new Uint8Array(bytes));
}

export function savePattern(patternKey: PatternKey, filePath: string) {
  return invoke<void>("save_pattern", undefined, { headers: { patternKey, filePath } });
}

export function closePattern(patternKey: PatternKey) {
  return invoke<void>("close_pattern", undefined, { headers: { patternKey } });
}

export function getPatternFilePath(patternKey: PatternKey) {
  return invoke<string>("get_pattern_file_path", { patternKey });
}
