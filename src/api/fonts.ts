import { invoke } from "@tauri-apps/api/core";

export function getAllTextFontFamilies() {
  return invoke<string[]>("get_all_text_font_families");
}

export function loadStitchFont(fontFamily: string) {
  return invoke<ArrayBuffer>("load_stitch_font", { fontFamily });
}
