use tauri::test::{mock_builder, MockRuntime};
use tauri::{generate_context, App, Listener, WebviewUrl, WebviewWindowBuilder};

use super::{Action, SetDisplayModeAction};
use crate::display::DisplayMode;
use crate::PatternProject;

fn setup_app() -> App<MockRuntime> {
  mock_builder().build(generate_context!()).unwrap()
}

#[test]
fn test_set_display_mode() {
  let app = setup_app();
  let window = WebviewWindowBuilder::new(&app, "main", WebviewUrl::default())
    .build()
    .unwrap();

  let mut patproj = PatternProject::default();

  let old_mode = patproj.display_settings.display_mode.clone();
  let mode = DisplayMode::Stitches;
  let action = SetDisplayModeAction::new(mode.clone());

  // Test executing the command.
  {
    let event_id = window.listen("display:set_mode", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: DisplayMode = str.parse().unwrap();
      assert_eq!(expected, mode);
    });

    action.perform(&window, &mut patproj).unwrap();
    window.unlisten(event_id);
  }

  // Test revoking the command.
  {
    window.listen("display:set_mode", move |e| {
      let str: String = serde_json::from_str(e.payload()).unwrap();
      let expected: DisplayMode = str.parse().unwrap();
      assert_eq!(expected, old_mode);
    });

    action.revoke(&window, &mut patproj).unwrap();
  }
}
