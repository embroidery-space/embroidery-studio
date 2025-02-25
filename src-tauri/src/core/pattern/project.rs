use borsh::{BorshDeserialize, BorshSerialize};

use super::Pattern;
use super::display::DisplaySettings;
use super::print::PrintSettings;

#[derive(Debug, Default, Clone, BorshSerialize, BorshDeserialize)]
pub struct PatternProject {
  #[borsh(skip)]
  pub file_path: std::path::PathBuf,
  pub pattern: Pattern,
  pub display_settings: DisplaySettings,
  pub print_settings: PrintSettings,
}
