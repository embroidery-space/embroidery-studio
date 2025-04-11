use std::str::FromStr as _;

use tauri_plugin_log::{Target, TargetKind};

pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
  log_panics::init();

  let log_level = std::env::var("RUST_LOG").unwrap_or(String::from("INFO"));
  let log_level = log::Level::from_str(&log_level).unwrap();

  tauri_plugin_log::Builder::default()
    .clear_targets()
    .targets([
      // In debug mode, log to `stderr` and to `src-tauri/logs/debug.log` file.
      #[cfg(debug_assertions)]
      Target::new(TargetKind::Stderr),
      #[cfg(debug_assertions)]
      Target::new(TargetKind::Folder {
        path: std::path::PathBuf::from("logs"),
        file_name: Some(String::from("debug")),
      }),
      // In release mode, log to an application log dir.
      #[cfg(not(debug_assertions))]
      Target::new(TargetKind::LogDir { file_name: None }),
    ])
    .level(log_level.to_level_filter())
    .build()
}
