use borsh::{BorshDeserialize, BorshSerialize};

use super::PaletteIndex;
use crate::core::pattern::Coord;

#[derive(Debug, Clone, Copy, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub struct NodeStitch {
  pub x: Coord,
  pub y: Coord,
  pub rotated: bool,
  pub palindex: u8,
  pub kind: NodeStitchKind,
}

impl PartialOrd for NodeStitch {
  fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
    Some(self.cmp(other))
  }
}

impl Ord for NodeStitch {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering {
    self.y.cmp(&other.y).then(self.x.cmp(&other.x))
  }
}

impl PaletteIndex for NodeStitch {
  fn palindex(&self) -> u8 {
    self.palindex
  }

  fn set_palindex(&mut self, palindex: u8) {
    self.palindex = palindex;
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, BorshSerialize, BorshDeserialize)]
pub enum NodeStitchKind {
  FrenchKnot,
  Bead,
}
