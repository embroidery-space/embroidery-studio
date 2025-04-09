use borsh::{BorshDeserialize, BorshSerialize};

use super::fullstitch::*;
use crate::core::pattern::Coord;

#[derive(Debug, Clone, Copy, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub struct PartStitch {
  pub x: Coord,
  pub y: Coord,
  pub palindex: u32,
  pub direction: PartStitchDirection,
  pub kind: PartStitchKind,
}

impl PartStitch {
  pub fn is_on_top_left(&self) -> bool {
    self.x.fract() < 0.5 && self.y.fract() < 0.5
  }

  pub fn is_on_top_right(&self) -> bool {
    self.x.fract() >= 0.5 && self.y.fract() < 0.5
  }

  pub fn is_on_bottom_right(&self) -> bool {
    self.x.fract() >= 0.5 && self.y.fract() >= 0.5
  }

  pub fn is_on_bottom_left(&self) -> bool {
    self.x.fract() < 0.5 && self.y.fract() >= 0.5
  }
}

impl PartialOrd for PartStitch {
  fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
    Some(self.cmp(other))
  }
}

impl Ord for PartStitch {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering {
    self
      .y
      .cmp(&other.y)
      .then(self.x.cmp(&other.x))
      .then(self.kind.cmp(&other.kind))
      .then(self.direction.cmp(&other.direction))
  }
}

impl From<FullStitch> for PartStitch {
  fn from(fullstitch: FullStitch) -> Self {
    Self {
      x: fullstitch.x,
      y: fullstitch.y,
      palindex: fullstitch.palindex,
      direction: PartStitchDirection::from((fullstitch.x, fullstitch.y)),
      kind: fullstitch.kind.into(),
    }
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, BorshSerialize, BorshDeserialize)]
pub enum PartStitchDirection {
  Forward,
  Backward,
}

impl From<(Coord, Coord)> for PartStitchDirection {
  fn from((x, y): (Coord, Coord)) -> Self {
    if (x.fract() < 0.5 && y.fract() < 0.5) || (x.fract() >= 0.5 && y.fract() >= 0.5) {
      PartStitchDirection::Backward
    } else {
      PartStitchDirection::Forward
    }
  }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, BorshSerialize, BorshDeserialize)]
pub enum PartStitchKind {
  Half,
  Quarter,
}

impl From<FullStitchKind> for PartStitchKind {
  fn from(kind: FullStitchKind) -> Self {
    match kind {
      FullStitchKind::Full => PartStitchKind::Half,
      FullStitchKind::Petite => PartStitchKind::Quarter,
    }
  }
}
