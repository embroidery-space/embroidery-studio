use std::sync::OnceLock;

use anyhow::Result;
use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use tauri::{Emitter, WebviewWindow};

use super::Action;
use crate::core::pattern::display::{Formats, Symbols};
use crate::core::pattern::{PaletteItem, PatternProject, Stitch};

#[cfg(test)]
#[path = "palette.test.rs"]
mod tests;

#[derive(Clone)]
pub struct AddPaletteItemAction {
  palitem: PaletteItem,
  symbols: Symbols,
  formats: Formats,
}

impl AddPaletteItemAction {
  pub fn new(palitem: PaletteItem) -> Self {
    Self {
      palitem,
      symbols: Symbols::default(),
      formats: Formats::default(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for AddPaletteItemAction {
  /// Add the palette item to the pattern.
  ///
  /// **Emits:**
  /// - `palette:add_palette_item` with the added palette item and its related types.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    patproj.pattern.palette.push(self.palitem.clone());
    patproj.display_settings.symbols.push(self.symbols.clone());
    patproj.display_settings.formats.push(self.formats.clone());
    window.emit(
      "palette:add_palette_item",
      STANDARD.encode(borsh::to_vec(&AddedPaletteItemData {
        palitem: self.palitem.clone(),
        palindex: (patproj.pattern.palette.len() - 1) as u8,
        symbols: self.symbols.clone(),
        formats: self.formats.clone(),
      })?),
    )?;
    Ok(())
  }

  /// Remove the added palette item from the pattern.
  ///
  /// **Emits:**
  /// - `palette:remove_palette_item` with the palette item index.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    patproj.pattern.palette.pop();
    patproj.display_settings.symbols.pop();
    patproj.display_settings.formats.pop();
    window.emit("palette:remove_palette_item", patproj.pattern.palette.len())?;
    Ok(())
  }
}

#[derive(Clone)]
pub struct RemovePaletteItemsAction {
  palindexes: Vec<u8>,
  metadata: OnceLock<RemovePaletteItemActionMetadata>,
}

#[derive(Debug, Clone)]
struct RemovePaletteItemActionMetadata {
  palitems: Vec<PaletteItem>,
  symbols: Vec<Symbols>,
  formats: Vec<Formats>,
  conflicts: Vec<Stitch>,
}

impl RemovePaletteItemsAction {
  pub fn new(palindexes: Vec<u8>) -> Self {
    let mut palindexes = palindexes.clone();
    palindexes.sort();
    Self {
      palindexes,
      metadata: OnceLock::new(),
    }
  }
}

impl<R: tauri::Runtime> Action<R> for RemovePaletteItemsAction {
  /// Remove the palette item from the pattern.
  ///
  /// **Emits:**
  /// - `palette:remove_palette_item` with the palette item index.
  /// - `stitches:remove_many` with the stitches that should be removed.
  fn perform(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let capacity = self.palindexes.len();
    let mut palitems = Vec::with_capacity(capacity);
    let mut symbols = Vec::with_capacity(capacity);
    let mut formats = Vec::with_capacity(capacity);
    for &palindex in self.palindexes.iter().rev() {
      let palindex = palindex as usize;
      palitems.push(patproj.pattern.palette.remove(palindex));
      symbols.push(patproj.display_settings.symbols.remove(palindex));
      formats.push(patproj.display_settings.formats.remove(palindex));
    }
    window.emit("palette:remove_palette_items", &self.palindexes)?;

    // Reverse the vectors to restore the in the order of `palindexes`.
    palitems.reverse();
    symbols.reverse();
    formats.reverse();

    let conflicts = patproj.pattern.remove_stitches_by_palindexes(&self.palindexes);
    window.emit("stitches:remove_many", STANDARD.encode(borsh::to_vec(&conflicts)?))?;

    if self.metadata.get().is_none() {
      self
        .metadata
        .set(RemovePaletteItemActionMetadata {
          palitems,
          symbols,
          formats,
          conflicts,
        })
        .unwrap();
    }

    Ok(())
  }

  /// Add the removed palette item back to the pattern.
  ///
  /// **Emits:**
  /// - `palette:add_palette_item` with the added palette item and its related types.
  /// - `stitches:add_many` with the stitches that should be restored.
  fn revoke(&self, window: &WebviewWindow<R>, patproj: &mut PatternProject) -> Result<()> {
    let metadata = self.metadata.get().unwrap();
    for (index, &palindex) in self.palindexes.iter().enumerate() {
      let palindex = palindex as usize;

      let palitem = metadata.palitems.get(index).unwrap().clone();
      patproj.pattern.palette.insert(palindex, palitem.clone());

      let symbols = metadata.symbols.get(index).unwrap().clone();
      patproj.display_settings.symbols.insert(palindex, symbols.clone());

      let formats = metadata.formats.get(index).unwrap().clone();
      patproj.display_settings.formats.insert(palindex, formats.clone());

      window.emit(
        "palette:add_palette_item",
        STANDARD.encode(borsh::to_vec(&AddedPaletteItemData {
          palindex: palindex as u8,
          palitem,
          symbols,
          formats,
        })?),
      )?;
    }

    patproj.pattern.restore_stitches(
      metadata.conflicts.clone(),
      &self.palindexes,
      patproj.pattern.palette.len() as u8,
    );
    window.emit(
      "stitches:add_many",
      STANDARD.encode(borsh::to_vec(&metadata.conflicts)?),
    )?;

    Ok(())
  }
}

#[derive(Debug, Clone, borsh::BorshSerialize)]
#[cfg_attr(test, derive(PartialEq, borsh::BorshDeserialize))]
struct AddedPaletteItemData {
  palitem: PaletteItem,
  palindex: u8,
  symbols: Symbols,
  formats: Formats,
}
