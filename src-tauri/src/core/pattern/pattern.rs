use borsh::{BorshDeserialize, BorshSerialize};

use super::stitches::*;

#[derive(Debug, Default, Clone, BorshSerialize, BorshDeserialize)]
pub struct Pattern {
  pub info: PatternInfo,
  pub fabric: Fabric,
  pub palette: Vec<PaletteItem>,
  pub fullstitches: Stitches<FullStitch>,
  pub partstitches: Stitches<PartStitch>,
  pub linestitches: Stitches<LineStitch>,
  pub nodestitches: Stitches<NodeStitch>,
  pub specialstitches: Stitches<SpecialStitch>,
  pub special_stitch_models: Vec<SpecialStitchModel>,
}

impl Pattern {
  pub fn new(fabric: Fabric) -> Self {
    Pattern { fabric, ..Pattern::default() }
  }

  /// Get a stitch from the pattern.
  pub fn get_stitch(&self, stitch: &Stitch) -> Option<Stitch> {
    // This method accepts a reference stitch which may not contain all the stitch properties.
    // We use this method to find the actual stitch.

    match stitch {
      Stitch::Full(fullstitch) => {
        if let Some(&fullstitch) = self.fullstitches.get(fullstitch) {
          Some(Stitch::Full(fullstitch))
        } else {
          None
        }
      }
      Stitch::Part(partstitch) => {
        if let Some(&partstitch) = self.partstitches.get(partstitch) {
          Some(Stitch::Part(partstitch))
        } else {
          None
        }
      }
      Stitch::Node(node) => {
        if let Some(&node) = self.nodestitches.get(node) {
          Some(Stitch::Node(node))
        } else {
          None
        }
      }
      Stitch::Line(line) => {
        if let Some(&line) = self.linestitches.get(line) {
          Some(Stitch::Line(line))
        } else {
          None
        }
      }
    }
  }

  /// Check if the pattern contains a stitch.
  pub fn contains_stitch(&self, stitch: &Stitch) -> bool {
    match stitch {
      Stitch::Full(fullstitch) => self.fullstitches.contains(fullstitch),
      Stitch::Part(partstitch) => self.partstitches.contains(partstitch),
      Stitch::Node(node) => self.nodestitches.contains(node),
      Stitch::Line(line) => self.linestitches.contains(line),
    }
  }

  /// Adds many stitches to the pattern.
  pub fn add_stitches(&mut self, stitches: Vec<Stitch>) {
    for stitch in stitches {
      self.add_stitch(stitch);
    }
  }

  /// Adds a stitch to the pattern and returns any conflicts that may have arisen.
  pub fn add_stitch(&mut self, stitch: Stitch) -> Vec<Stitch> {
    log::trace!("Adding stitch");
    let mut conflicts = Vec::new();
    match stitch {
      Stitch::Full(fullstitch) => {
        match fullstitch.kind {
          FullStitchKind::Full => {
            conflicts.extend(
              self
                .fullstitches
                .remove_conflicts_with_full_stitch(&fullstitch)
                .into_iter()
                .map(Stitch::Full),
            );
            conflicts.extend(
              self
                .partstitches
                .remove_conflicts_with_full_stitch(&fullstitch)
                .into_iter()
                .map(Stitch::Part),
            );
          }
          FullStitchKind::Petite => {
            conflicts.extend(
              self
                .fullstitches
                .remove_conflicts_with_petite_stitch(&fullstitch)
                .into_iter()
                .map(Stitch::Full),
            );
            conflicts.extend(
              self
                .partstitches
                .remove_conflicts_with_petite_stitch(&fullstitch)
                .into_iter()
                .map(Stitch::Part),
            );
          }
        };
        if let Some(fullstitch) = self.fullstitches.insert(fullstitch) {
          conflicts.push(Stitch::Full(fullstitch));
        }
      }
      Stitch::Part(partstitch) => {
        match partstitch.kind {
          PartStitchKind::Half => {
            conflicts.extend(
              self
                .fullstitches
                .remove_conflicts_with_half_stitch(&partstitch)
                .into_iter()
                .map(Stitch::Full),
            );
            conflicts.extend(
              self
                .partstitches
                .remove_conflicts_with_half_stitch(&partstitch)
                .into_iter()
                .map(Stitch::Part),
            );
          }
          PartStitchKind::Quarter => {
            conflicts.extend(
              self
                .fullstitches
                .remove_conflicts_with_quarter_stitch(&partstitch)
                .into_iter()
                .map(Stitch::Full),
            );
            conflicts.extend(
              self
                .partstitches
                .remove_conflicts_with_quarter_stitch(&partstitch)
                .into_iter()
                .map(Stitch::Part),
            );
          }
        };
        if let Some(partstitch) = self.partstitches.insert(partstitch) {
          conflicts.push(Stitch::Part(partstitch));
        }
      }
      Stitch::Node(node) => {
        if let Some(node) = self.nodestitches.insert(node) {
          conflicts.push(Stitch::Node(node));
        }
      }
      Stitch::Line(line) => {
        if let Some(line) = self.linestitches.insert(line) {
          conflicts.push(Stitch::Line(line));
        }
      }
    };
    conflicts
  }

  /// Removes many stitches from the pattern.
  pub fn remove_stitches(&mut self, stitches: Vec<Stitch>) {
    for stitch in stitches {
      self.remove_stitch(stitch);
    }
  }

  /// Removes and returns a stitch from the pattern.
  pub fn remove_stitch(&mut self, stitch: Stitch) -> Option<Stitch> {
    log::trace!("Removing stitch");
    match stitch {
      Stitch::Full(fullstitch) => self.fullstitches.remove(&fullstitch).map(|fs| fs.into()),
      Stitch::Part(partstitch) => self.partstitches.remove(&partstitch).map(|ps| ps.into()),
      Stitch::Node(node) => self.nodestitches.remove(&node).map(|node| node.into()),
      Stitch::Line(line) => self.linestitches.remove(&line).map(|line| line.into()),
    }
  }

  /// Removes and returns all stitches with a given palette index from the pattern.
  pub fn remove_stitches_by_palindexes(&mut self, palindexes: &[u32]) -> Vec<Stitch> {
    log::trace!("Removing stitches by palette index");
    let mut conflicts = Vec::new();
    conflicts.extend(
      self
        .fullstitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Full),
    );
    conflicts.extend(
      self
        .partstitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Part),
    );
    conflicts.extend(
      self
        .linestitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Line),
    );
    conflicts.extend(
      self
        .nodestitches
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Node),
    );
    conflicts
  }

  /// Removes all stitches that are outside the bounds of the pattern.
  pub fn remove_stitches_outside_bounds(&mut self, x: u16, y: u16, width: u16, height: u16) -> Vec<Stitch> {
    log::trace!("Removing stitches outside bounds");
    let mut conflicts = Vec::new();
    conflicts.extend(
      self
        .fullstitches
        .remove_stitches_outside_bounds(x, y, width, height)
        .into_iter()
        .map(Stitch::Full),
    );
    conflicts.extend(
      self
        .partstitches
        .remove_stitches_outside_bounds(x, y, width, height)
        .into_iter()
        .map(Stitch::Part),
    );
    conflicts.extend(
      self
        .linestitches
        .remove_stitches_outside_bounds(x, y, width, height)
        .into_iter()
        .map(Stitch::Line),
    );
    conflicts.extend(
      self
        .nodestitches
        .remove_stitches_outside_bounds(x, y, width, height)
        .into_iter()
        .map(Stitch::Node),
    );
    conflicts
  }

  pub fn restore_stitches(&mut self, stitches: Vec<Stitch>, palindexes: &[u32], palsize: u32) {
    let mut fullstitches = Vec::new();
    let mut partstitches = Vec::new();
    let mut linestitches = Vec::new();
    let mut nodestitches = Vec::new();
    for stitch in stitches.into_iter() {
      match stitch {
        Stitch::Full(fullstitch) => fullstitches.push(fullstitch),
        Stitch::Part(partstitch) => partstitches.push(partstitch),
        Stitch::Line(line) => linestitches.push(line),
        Stitch::Node(node) => nodestitches.push(node),
      }
    }

    self.fullstitches.restore_stitches(fullstitches, palindexes, palsize);
    self.partstitches.restore_stitches(partstitches, palindexes, palsize);
    self.linestitches.restore_stitches(linestitches, palindexes, palsize);
    self.nodestitches.restore_stitches(nodestitches, palindexes, palsize);
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct PatternInfo {
  pub title: String,
  pub author: String,
  pub copyright: String,
  pub description: String,
}

impl Default for PatternInfo {
  fn default() -> Self {
    Self {
      title: String::from("Untitled"),
      author: String::new(),
      copyright: String::new(),
      description: String::new(),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct PaletteItem {
  pub brand: String,
  pub number: String,
  pub name: String,
  pub color: String,
  pub blends: Option<Vec<Blend>>,
  pub bead: Option<Bead>,
  pub symbol_font: Option<String>,
  pub symbol: Option<Symbol>,
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Blend {
  pub brand: String,
  pub number: String,
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Bead {
  pub length: f32,
  pub diameter: f32,
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub enum Symbol {
  Code(u16),
  Char(String),
}

impl std::fmt::Display for Symbol {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    match self {
      Symbol::Code(code) => write!(f, "{}", code),
      Symbol::Char(ch) => write!(f, "{}", ch),
    }
  }
}

impl std::str::FromStr for Symbol {
  type Err = anyhow::Error;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    if let Ok(code) = s.parse::<u16>() {
      return Ok(Symbol::Code(code));
    }

    if s.len() == 1 {
      return Ok(Symbol::Char(s.to_string()));
    }

    Err(anyhow::anyhow!(
      "Invalid symbol: {s}. Must be a single character or a number"
    ))
  }
}

pub type StitchesPerInch = (u8, u8);

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Fabric {
  pub width: u16,
  pub height: u16,
  pub spi: StitchesPerInch,
  pub kind: String,
  pub name: String,
  pub color: String,
}

impl Fabric {
  pub const DEFAULT_WIDTH: u16 = 100;
  pub const DEFAULT_HEIGHT: u16 = 100;
  pub const DEFAULT_SPI: u8 = 14;
  pub const DEFAULT_KIND: &'static str = "Aida";
  pub const DEFAULT_NAME: &'static str = "White";
  pub const DEFAULT_COLOR: &'static str = "FFFFFF";
}

impl Default for Fabric {
  fn default() -> Self {
    Self {
      width: Fabric::DEFAULT_WIDTH,
      height: Fabric::DEFAULT_HEIGHT,
      spi: (Fabric::DEFAULT_SPI, Fabric::DEFAULT_SPI),
      kind: String::from(Fabric::DEFAULT_KIND),
      name: String::from(Fabric::DEFAULT_NAME),
      color: String::from(Fabric::DEFAULT_COLOR),
    }
  }
}
