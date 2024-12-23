use std::sync::OnceLock;

use anyhow::Result;
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::core::pattern::display::Grid;
use crate::core::pattern::PatternProject;

#[cfg(test)]
#[path = "grid.test.rs"]
mod tests;

#[derive(Clone)]
pub struct UpdateGridPropertiesAction {
  grid: Grid,
  conflicts: OnceLock<Grid>,
}

impl UpdateGridPropertiesAction {
  pub fn new(grid: Grid) -> Self {
    Self { grid, conflicts: OnceLock::new() }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdateGridPropertiesAction {
  /// Updates the grid properties.
  ///
  /// **Emits:**
  /// - `grid:update` with the updated grid properties.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit("grid:update", &self.grid)?;
    let conflicts = std::mem::replace(&mut patproj.display_settings.grid, self.grid.clone());
    if self.conflicts.get().is_none() {
      self.conflicts.set(conflicts).unwrap();
    }
    Ok(())
  }

  /// Restore the the previous grid properties.
  ///
  /// **Emits:**
  /// - `grid:update` with the previous grid properties.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let conflicts = self.conflicts.get().unwrap();
    window.emit("grid:update", &conflicts)?;
    patproj.display_settings.grid = conflicts.clone();
    Ok(())
  }
}
