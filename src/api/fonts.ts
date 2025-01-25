import { invoke } from "@tauri-apps/api/core";

export function getAllTextFontFamilies() {
  return invoke<string[]>("get_all_text_font_families");
}
