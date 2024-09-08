use tauri::{AppHandle, Manager, Window};

use serde::{Deserialize, Serialize};

use super::{FullStitch, FullStitchKind, Line, Node, PartStitch, PartStitchKind};
use crate::state::AppStateType;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
enum EventStitchPayload {
  FullStitch(FullStitch),
  PartStitch(PartStitch),
  Line(Line),
  Node(Node),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
enum EventStitchRemovePayload {
  FullStitches(Vec<FullStitch>),
  PartStitches(Vec<PartStitch>),
  Line(Line),
  Node(Node),
}

static EVENT_STITCH_CREATE: &str = "pattern:stitch:create";
static EVENT_STITCH_REMOVE: &str = "pattern:stitch:remove";

pub fn setup_pattern_event_handlers(window: Window, app_handle: AppHandle) {
  window.clone().listen(EVENT_STITCH_CREATE, move |e| {
    let state = app_handle.state::<AppStateType>();
    let mut state = state.write().unwrap();
    let pattern = state.pattern.as_mut().unwrap();

    let payload = serde_json::from_str::<EventStitchPayload>(e.payload().unwrap()).unwrap();
    match payload {
      EventStitchPayload::FullStitch(fullstitch) => match fullstitch.kind {
        FullStitchKind::Full => {
          emit_remove_partstitches(
            &window,
            pattern
              .partstitches
              .find_conflicts_with_full_stitch(&fullstitch),
          );

          let mut conflicting_fullstitches = pattern
            .fullstitches
            .find_conflicts_with_full_stitch(&fullstitch);
          if let Some(fullstitch) = pattern.fullstitches.insert(fullstitch) {
            if fullstitch.kind == FullStitchKind::Full {
              conflicting_fullstitches.push(fullstitch);
            }
          }
          emit_remove_fullstitches(&window, conflicting_fullstitches);
        }
        FullStitchKind::Petite => {
          emit_remove_partstitches(
            &window,
            pattern
              .partstitches
              .find_conflicts_with_petite_stitch(&fullstitch),
          );

          let mut conflicting_fullstitches = Vec::new();
          if let Some(fullstitch) = pattern
            .fullstitches
            .find_conflicts_with_petite_stitch(&fullstitch)
          {
            conflicting_fullstitches.push(fullstitch);
          }
          if let Some(fullstitch) = pattern.fullstitches.insert(fullstitch) {
            conflicting_fullstitches.push(fullstitch);
          }
          emit_remove_fullstitches(&window, conflicting_fullstitches);
        }
      },
      EventStitchPayload::PartStitch(partstitch) => match partstitch.kind {
        PartStitchKind::Half => {
          emit_remove_fullstitches(
            &window,
            pattern
              .fullstitches
              .find_conflicts_with_half_stitch(&partstitch),
          );

          let mut conflicting_partstitches = pattern
            .partstitches
            .find_conflicts_with_half_stitch(&partstitch);
          if let Some(partstitch) = pattern.partstitches.insert(partstitch) {
            conflicting_partstitches.push(partstitch);
          }
          emit_remove_partstitches(&window, conflicting_partstitches);
        }
        PartStitchKind::Quarter => {
          emit_remove_fullstitches(
            &window,
            pattern
              .fullstitches
              .find_conflicts_with_quarter_stitch(&partstitch),
          );

          let mut conflicting_partstitches = Vec::new();
          if let Some(partstitch) = pattern
            .partstitches
            .find_conflicts_with_quarter_stitch(&partstitch)
          {
            conflicting_partstitches.push(partstitch);
          }
          if let Some(partstitch) = pattern.partstitches.insert(partstitch) {
            conflicting_partstitches.push(partstitch);
          }
          emit_remove_partstitches(&window, conflicting_partstitches);
        }
      },
      EventStitchPayload::Line(line) => emit_remove_line(&window, pattern.lines.insert(line)),
      EventStitchPayload::Node(node) => emit_remove_node(&window, pattern.nodes.insert(node)),
    };
  });
}

fn emit_remove_fullstitches(window: &Window, fullstitches: Vec<FullStitch>) {
  if fullstitches.is_empty() {
    return;
  }
  let payload = EventStitchRemovePayload::FullStitches(fullstitches);
  window.emit(EVENT_STITCH_REMOVE, payload).unwrap();
}

fn emit_remove_partstitches(window: &Window, partstitches: Vec<PartStitch>) {
  if partstitches.is_empty() {
    return;
  }
  let payload = EventStitchRemovePayload::PartStitches(partstitches);
  window.emit(EVENT_STITCH_REMOVE, payload).unwrap();
}

fn emit_remove_line(window: &Window, line: Option<Line>) {
  if let Some(line) = line {
    let payload = EventStitchRemovePayload::Line(line);
    window.emit(EVENT_STITCH_REMOVE, payload).unwrap();
  }
}

fn emit_remove_node(window: &Window, node: Option<Node>) {
  if let Some(node) = node {
    let payload = EventStitchRemovePayload::Node(node);
    window.emit(EVENT_STITCH_REMOVE, payload).unwrap();
  }
}