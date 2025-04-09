use borsh::{BorshDeserialize, BorshSerialize};

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct DisplaySettings {
  pub default_symbol_font: String,
  pub grid: Grid,
  pub display_mode: DisplayMode,
  pub show_symbols: bool,
  pub palette_settings: PaletteSettings,
}

impl Default for DisplaySettings {
  fn default() -> Self {
    Self {
      default_symbol_font: String::from("Ursasoftware"),
      grid: Grid::default(),
      display_mode: DisplayMode::Solid,
      show_symbols: false,
      palette_settings: PaletteSettings::default(),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Grid {
  pub major_lines_interval: u16,
  pub minor_lines: GridLine,
  pub major_lines: GridLine,
}

impl Default for Grid {
  fn default() -> Self {
    Self {
      major_lines_interval: 10,
      minor_lines: GridLine {
        color: String::from("C8C8C8"),
        thickness: 0.072,
      },
      major_lines: GridLine {
        color: String::from("646464"),
        thickness: 0.072,
      },
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct GridLine {
  pub color: String,

  /// Counts in points.
  pub thickness: f32,
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub enum DisplayMode {
  Solid,
  Stitches,
  Mixed,
}

impl DisplayMode {
  pub fn from_pattern_maker(value: u16) -> Self {
    match value {
      0 => DisplayMode::Stitches,
      2 => DisplayMode::Solid,
      _ => DisplayMode::Mixed,
    }
  }
}

impl std::fmt::Display for DisplayMode {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    match self {
      DisplayMode::Solid => write!(f, "Solid"),
      DisplayMode::Stitches => write!(f, "Stitches"),
      DisplayMode::Mixed => write!(f, "Mixed"),
    }
  }
}

impl std::str::FromStr for DisplayMode {
  type Err = &'static str;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s {
      "Solid" => Ok(DisplayMode::Solid),
      "Stitches" => Ok(DisplayMode::Stitches),
      "Mixed" => Ok(DisplayMode::Mixed),
      _ => Ok(DisplayMode::Mixed),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct PaletteSettings {
  pub columns_number: u8,
  pub color_only: bool,
  pub show_color_brands: bool,
  pub show_color_numbers: bool,
  pub show_color_names: bool,
}

impl PaletteSettings {
  pub const DEFAULT_COLUMNS_NUMBER: u8 = 1;
  pub const DEFAULT_COLOR_ONLY: bool = false;
  pub const DEFAULT_SHOW_COLOR_BRANDS: bool = true;
  pub const DEFAULT_SHOW_COLOR_NUMBERS: bool = true;
  pub const DEFAULT_SHOW_COLOR_NAMES: bool = true;
}

impl Default for PaletteSettings {
  fn default() -> Self {
    Self {
      columns_number: PaletteSettings::DEFAULT_COLUMNS_NUMBER,
      color_only: PaletteSettings::DEFAULT_COLOR_ONLY,
      show_color_brands: PaletteSettings::DEFAULT_SHOW_COLOR_BRANDS,
      show_color_numbers: PaletteSettings::DEFAULT_SHOW_COLOR_NUMBERS,
      show_color_names: PaletteSettings::DEFAULT_SHOW_COLOR_NAMES,
    }
  }
}
