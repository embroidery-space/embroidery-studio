use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use tauri::test::{mock_builder, MockRuntime};
use tauri::{generate_context, App, Listener, WebviewUrl, WebviewWindowBuilder};

use super::{Action, UpdateGridPropertiesAction};
use crate::core::pattern::display::Grid;
use crate::core::pattern::PatternProject;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

#[test]
fn test_update_fabric() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();
  let grid = Grid {
    major_lines_interval: 15,
    ..Grid::default()
  };
  let action = UpdateGridPropertiesAction::new(grid.clone());

  // Test executing the command.
  {
    let event_id = window.listen("grid:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: Grid = borsh::from_slice(&STANDARD.decode(base64).unwrap()).unwrap();
      assert_eq!(expected, grid);
    });

    action.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the command.
  {
    window.listen("fabric:update", move |e| {
      let base64: &str = serde_json::from_str(e.payload()).unwrap();
      let expected: Grid = borsh::from_slice(&STANDARD.decode(base64).unwrap()).unwrap();
      assert_eq!(expected, Grid::default());
    });

    action.revoke(&window, &mut patproj).unwrap();
  }
}
