use crate::core::actions::{Action, AddStitchAction, RemoveStitchAction};
use crate::core::pattern::Stitch;
use crate::error::CommandResult;
use crate::state::{HistoryState, PatternKey, PatternsState};

#[tauri::command]
pub fn add_stitch<R: tauri::Runtime>(
  pattern_key: PatternKey,
  stitch: Stitch,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<bool> {
  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut(&pattern_key).unwrap();
  if !patproj.pattern.contains_stitch(&stitch) {
    let mut history = history.write().unwrap();
    let action = AddStitchAction::new(stitch);
    action.perform(&window, patproj)?;
    history.get_mut(&pattern_key).push(Box::new(action));
    Ok(true)
  } else {
    Ok(false)
  }
}

#[tauri::command]
pub fn remove_stitch<R: tauri::Runtime>(
  pattern_key: PatternKey,
  stitch: Stitch,
  window: tauri::WebviewWindow<R>,
  history: tauri::State<HistoryState<R>>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<bool> {
  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut(&pattern_key).unwrap();

  // This command may accept the stitches which doesn't contain all the properties of the stitch.
  // So we need to get the actual stitch from the pattern.
  if let Some(stitch) = patproj.pattern.get_stitch(&stitch) {
    let mut history = history.write().unwrap();
    let action = RemoveStitchAction::new(stitch);
    action.perform(&window, patproj)?;
    history.get_mut(&pattern_key).push(Box::new(action));
    Ok(true)
  } else {
    Ok(false)
  }
}
