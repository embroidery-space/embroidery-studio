use std::collections::HashMap;
use std::sync::RwLock;

use state::HistoryStateInner;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

pub mod commands;
pub mod state;

mod core;
pub use core::pattern::*;

mod error;
mod logger;
mod utils;

pub fn setup_app<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::App<R> {
  builder
    .setup(|app| {
      #[allow(unused_mut)]
      let mut webview_window_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
        .title(app.package_info().name.clone())
        .min_inner_size(640.0, 480.0)
        .maximized(true)
        .decorations(false)
        .additional_browser_args("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,ElasticOverscroll");

      // We are using a custom `debug` feature to enable browser extensions only for development and not in debug builds.
      #[cfg(all(target_os = "windows", feature = "debug"))]
      {
        // Enable and setup browser extensions for development.
        webview_window_builder = webview_window_builder
          .browser_extensions_enabled(true)
          // Load the browser extensions from the `src-tauri/extensions/` directory.
          .extensions_path(std::env::current_dir()?.join("extensions"));
      }

      let webview_window = webview_window_builder.build()?;

      #[cfg(debug_assertions)]
      webview_window.open_devtools();

      let app_document_dir = utils::path::app_document_dir(app.handle())?;
      if !cfg!(test) && !app_document_dir.exists() {
        // Create the Embroidery Studio directory in the user's document directory
        // and copy the sample patterns there if it doesn't exist.
        log::debug!("Creating an app document directory",);
        std::fs::create_dir(&app_document_dir)?;
        log::debug!("Copying sample patterns to the app document directory");
        let resource_path = app.path().resource_dir()?;
        for pattern in std::fs::read_dir(resource_path)? {
          let pattern = pattern?.path();
          std::fs::copy(pattern.clone(), app_document_dir.join(pattern.file_name().unwrap()))?;
        }
      }

      Ok(())
    })
    .manage(RwLock::new(
      HashMap::<state::PatternKey, core::pattern::PatternProject>::new(),
    ))
    .manage(RwLock::new(HistoryStateInner::<R>::default()))
    .plugin(logger::setup_logger().build())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
      commands::path::get_app_document_dir,
      commands::pattern::load_pattern,
      commands::pattern::create_pattern,
      commands::pattern::save_pattern,
      commands::pattern::close_pattern,
      commands::pattern::get_pattern_file_path,
      commands::fabric::update_fabric,
      commands::grid::update_grid,
      commands::palette::add_palette_item,
      commands::palette::remove_palette_item,
      commands::stitches::add_stitch,
      commands::stitches::remove_stitch,
      commands::history::undo,
      commands::history::redo,
    ])
    .build(tauri::generate_context!())
    .expect("Failed to build Embroidery Studio")
}
