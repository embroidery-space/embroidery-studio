use crate::core::actions::{Action, SetDisplayModeAction};
use crate::display::DisplayMode;
use crate::error::CommandResult;
use crate::state::{HistoryState, PatternKey, PatternsState};

#[tauri::command]
pub fn set_display_mode<R: tauri::Runtime>(
  mode: String,
  pattern_key: PatternKey,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut(&pattern_key).unwrap();

  let mode = mode.parse::<DisplayMode>().map_err(|e| anyhow::anyhow!(e))?;
  let action = SetDisplayModeAction::new(mode);
  action.perform(&window, patproj)?;

  let mut history = history.write().unwrap();
  history.get_mut(&pattern_key).push(Box::new(action));

  Ok(())
}
