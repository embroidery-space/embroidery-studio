use std::sync::OnceLock;

use anyhow::Result;
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::core::pattern::{Fabric, PatternProject};

#[cfg(test)]
#[path = "fabric.test.rs"]
mod tests;

#[derive(Clone)]
pub struct UpdateFabricPropertiesAction {
  fabric: Fabric,
  conflicts: OnceLock<Fabric>,
}

impl UpdateFabricPropertiesAction {
  pub fn new(fabric: Fabric) -> Self {
    Self {
      fabric,
      conflicts: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdateFabricPropertiesAction {
  /// Updates the fabric properties.
  ///
  /// **Emits:**
  /// - `fabric:update` with the updated fabric properties.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit("fabric:update", &self.fabric)?;
    let conflicts = std::mem::replace(&mut patproj.pattern.fabric, self.fabric.clone());
    if self.conflicts.get().is_none() {
      self.conflicts.set(conflicts).unwrap();
    }
    Ok(())
  }

  /// Restore the the previous fabric properties.
  ///
  /// **Emits:**
  /// - `fabric:update` with the previous fabric properties.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let conflicts = self.conflicts.get().unwrap();
    window.emit("fabric:update", &conflicts)?;
    patproj.pattern.fabric = conflicts.clone();
    Ok(())
  }
}
