use std::str::FromStr as _;

use tauri_plugin_log::{Target, TargetKind};

const LOGGING_ENV_VAR_NAME: &str = "EMBROIDERY_STUDIO_LOG";
const LOGGING_ENV_VAR_DEFAULT: &str = "INFO";

const DEFAULT_LOG_LEVEL: log::Level = log::Level::Info;

pub fn init<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
  log_panics::init();

  let app_log_level = {
    let log_level = std::env::var(LOGGING_ENV_VAR_NAME).unwrap_or(LOGGING_ENV_VAR_DEFAULT.to_string());
    log::Level::from_str(&log_level).unwrap()
  };

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
    .level(DEFAULT_LOG_LEVEL.to_level_filter())
    .level_for("embroidery_studio", app_log_level.to_level_filter())
    .build()
}
