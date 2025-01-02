use std::sync::OnceLock;

use anyhow::Result;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::core::pattern::{Fabric, PatternProject};

#[cfg(test)]
#[path = "fabric.test.rs"]
mod tests;

#[derive(Clone)]
pub struct UpdateFabricPropertiesAction {
  fabric: Fabric,
  old_fabric: OnceLock<Fabric>,
}

impl UpdateFabricPropertiesAction {
  pub fn new(fabric: Fabric) -> Self {
    Self {
      fabric,
      old_fabric: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for UpdateFabricPropertiesAction {
  /// Updates the fabric properties.
  ///
  /// **Emits:**
  /// - `fabric:update` with the updated fabric properties.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    window.emit("fabric:update", STANDARD.encode(borsh::to_vec(&self.fabric)?))?;
    let old_fabric = std::mem::replace(&mut patproj.pattern.fabric, self.fabric.clone());
    if self.old_fabric.get().is_none() {
      self.old_fabric.set(old_fabric).unwrap();
    }
    Ok(())
  }

  /// Restore the the previous fabric properties.
  ///
  /// **Emits:**
  /// - `fabric:update` with the previous fabric properties.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let old_fabric = self.old_fabric.get().unwrap();
    window.emit("fabric:update", STANDARD.encode(borsh::to_vec(&old_fabric)?))?;
    patproj.pattern.fabric = old_fabric.clone();
    Ok(())
  }
}
