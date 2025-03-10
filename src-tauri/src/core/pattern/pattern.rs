use borsh::{BorshDeserialize, BorshSerialize};

use super::stitches::*;

#[derive(Debug, Default, Clone, BorshSerialize, BorshDeserialize)]
pub struct Pattern {
  pub info: PatternInfo,
  pub fabric: Fabric,
  pub palette: Vec<PaletteItem>,
  pub fullstitches: Stitches<FullStitch>,
  pub partstitches: Stitches<PartStitch>,
  pub nodes: Stitches<Node>,
  pub lines: Stitches<Line>,
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
        if let Some(&node) = self.nodes.get(node) {
          Some(Stitch::Node(node))
        } else {
          None
        }
      }
      Stitch::Line(line) => {
        if let Some(&line) = self.lines.get(line) {
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
      Stitch::Node(node) => self.nodes.contains(node),
      Stitch::Line(line) => self.lines.contains(line),
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
        if let Some(node) = self.nodes.insert(node) {
          conflicts.push(Stitch::Node(node));
        }
      }
      Stitch::Line(line) => {
        if let Some(line) = self.lines.insert(line) {
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
      Stitch::Node(node) => self.nodes.remove(&node).map(|node| node.into()),
      Stitch::Line(line) => self.lines.remove(&line).map(|line| line.into()),
    }
  }

  /// Removes and returns all stitches with a given palette index from the pattern.
  pub fn remove_stitches_by_palindexes(&mut self, palindexes: &[u8]) -> Vec<Stitch> {
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
        .lines
        .remove_stitches_by_palindexes(palindexes)
        .into_iter()
        .map(Stitch::Line),
    );
    conflicts.extend(
      self
        .nodes
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
        .lines
        .remove_stitches_outside_bounds(x, y, width, height)
        .into_iter()
        .map(Stitch::Line),
    );
    conflicts.extend(
      self
        .nodes
        .remove_stitches_outside_bounds(x, y, width, height)
        .into_iter()
        .map(Stitch::Node),
    );
    conflicts
  }

  pub fn restore_stitches(&mut self, stitches: Vec<Stitch>, palindexes: &[u8], palsize: u8) {
    let mut fullstitches = Vec::new();
    let mut partstitches = Vec::new();
    let mut lines = Vec::new();
    let mut nodes = Vec::new();
    for stitch in stitches.into_iter() {
      match stitch {
        Stitch::Full(fullstitch) => fullstitches.push(fullstitch),
        Stitch::Part(partstitch) => partstitches.push(partstitch),
        Stitch::Line(line) => lines.push(line),
        Stitch::Node(node) => nodes.push(node),
      }
    }

    self.fullstitches.restore_stitches(fullstitches, palindexes, palsize);
    self.partstitches.restore_stitches(partstitches, palindexes, palsize);
    self.lines.restore_stitches(lines, palindexes, palsize);
    self.nodes.restore_stitches(nodes, palindexes, palsize);
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct PatternInfo {
  pub title: String,
  pub author: String,
  pub company: String,
  pub copyright: String,
  pub description: String,
}

impl Default for PatternInfo {
  fn default() -> Self {
    Self {
      title: String::from("Untitled"),
      author: String::new(),
      company: String::new(),
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
  pub strands: Option<PaletteItemStitchStrands>,
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Blend {
  pub brand: String,
  pub number: String,
  pub strands: BlendStrands,
}

#[nutype::nutype(
  sanitize(with = |raw| raw.clamp(1, 6)),
  derive(Debug, Clone, Copy, PartialEq, BorshSerialize, BorshDeserialize)
)]
pub struct BlendStrands(u8);

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Bead {
  pub length: f32,
  pub diameter: f32,
}

#[derive(Debug, Default, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct StitchStrandsStruct<T> {
  pub full: T,
  pub petite: T,
  pub half: T,
  pub quarter: T,
  pub back: T,
  pub straight: T,
  pub french_knot: T,
  pub special: T,
}

#[nutype::nutype(
  sanitize(with = |raw| raw.clamp(1, 12)),
  derive(Debug, Clone, Copy, PartialEq, BorshSerialize, BorshDeserialize)
)]
pub struct StitchStrands(u8);

pub type PaletteItemStitchStrands = StitchStrandsStruct<Option<StitchStrands>>;
pub type DefaultStitchStrands = StitchStrandsStruct<StitchStrands>;

impl Default for DefaultStitchStrands {
  fn default() -> Self {
    Self {
      full: StitchStrands::new(2),
      petite: StitchStrands::new(2),
      half: StitchStrands::new(2),
      quarter: StitchStrands::new(2),
      back: StitchStrands::new(1),
      straight: StitchStrands::new(1),
      french_knot: StitchStrands::new(2),
      special: StitchStrands::new(2),
    }
  }
}

#[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
pub struct Fabric {
  pub width: u16,
  pub height: u16,
  pub spi: StitchesPerInch,
  pub kind: String,
  pub name: String,
  pub color: String,
}

impl Default for Fabric {
  fn default() -> Self {
    Self {
      width: 60,
      height: 80,
      spi: (14, 14),
      kind: String::from("Aida"),
      name: String::from("White"),
      color: String::from("FFFFFF"),
    }
  }
}

pub type StitchesPerInch = (u16, u16);
