use std::sync::OnceLock;

use anyhow::Result;
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::core::pattern::{PatternProject, Stitch};
use crate::utils::base64;

#[cfg(test)]
#[path = "stitches.test.rs"]
mod tests;

#[derive(Clone)]
pub struct AddStitchAction {
  stitch: Stitch,
  conflicts: OnceLock<Vec<Stitch>>,
}

impl AddStitchAction {
  pub fn new(stitch: Stitch) -> Self {
    Self {
      stitch,
      conflicts: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for AddStitchAction {
  /// Add the stitch to the pattern.
  ///
  /// **Emits:**
  /// - `stitches:add_one` with the added stitch
  /// - `stitches:remove_many` with the removed stitches that conflict with the new stitch
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let conflicts = patproj.pattern.add_stitch(self.stitch);
    window.emit("stitches:add_one", base64::encode(borsh::to_vec(&self.stitch)?))?;
    window.emit("stitches:remove_many", base64::encode(borsh::to_vec(&conflicts)?))?;
    if self.conflicts.get().is_none() {
      self.conflicts.set(conflicts).unwrap();
    }
    Ok(())
  }

  /// Remove the added stitch from the pattern.
  ///
  /// **Emits:**
  /// - `stitches:remove_one` with the removed stitch
  /// - `stitches:add_many` with the added stitches that were removed when the stitch was added
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let conflicts = self.conflicts.get().unwrap();
    patproj.pattern.remove_stitch(self.stitch);
    patproj.pattern.add_stitches(conflicts.clone());
    window.emit("stitches:remove_one", base64::encode(borsh::to_vec(&self.stitch)?))?;
    window.emit("stitches:add_many", base64::encode(borsh::to_vec(&conflicts)?))?;
    Ok(())
  }
}

#[derive(Clone)]
pub struct RemoveStitchAction {
  // Actual stitch contains only the necessary stitch properties ...
  target_stitch: Stitch,
  // ... while the actual stitch contains all properties.
  actual_stitch: OnceLock<Stitch>,
}

impl RemoveStitchAction {
  pub fn new(stitch: Stitch) -> Self {
    Self {
      target_stitch: stitch,
      actual_stitch: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for RemoveStitchAction {
  /// Remove the stitch from the pattern.
  ///
  /// **Emits:**
  /// - `stitches:remove_one` with the removed stitch
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let stitch = patproj.pattern.remove_stitch(self.target_stitch).unwrap();
    if self.actual_stitch.get().is_none() {
      self.actual_stitch.set(stitch).unwrap();
    }
    window.emit("stitches:remove_one", base64::encode(borsh::to_vec(&stitch)?))?;
    Ok(())
  }

  /// Add the removed stitch back to the pattern.
  ///
  /// **Emits:**
  /// - `stitches:add_one` with the added stitch
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let stitch = self.actual_stitch.get().unwrap();
    patproj.pattern.add_stitch(*stitch);
    window.emit("stitches:add_one", base64::encode(borsh::to_vec(&stitch)?))?;
    Ok(())
  }
}
