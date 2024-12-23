use crate::core::actions::{Action, UpdateGridPropertiesAction};
use crate::core::pattern::display::Grid;
use crate::error::CommandResult;
use crate::state::{HistoryState, PatternKey, PatternsState};

#[tauri::command]
pub fn update_grid<R: tauri::Runtime>(
  pattern_key: PatternKey,
  grid: Grid,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  let mut patterns = patterns.write().unwrap();
  let mut history = history.write().unwrap();
  let patproj = patterns.get_mut(&pattern_key).unwrap();
  let action = UpdateGridPropertiesAction::new(grid);
  action.perform(&window, patproj)?;
  history.get_mut(&pattern_key).push(Box::new(action));
  Ok(())
}
