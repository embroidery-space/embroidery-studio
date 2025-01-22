use crate::error::CommandResult;

#[tauri::command]
pub fn get_all_text_font_families() -> CommandResult<Vec<String>> {
  let source = font_kit::source::SystemSource::new();
  Ok(source.all_families()?)
}
