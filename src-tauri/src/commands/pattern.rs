use crate::core::parser::{self, PatternFormat};
use crate::core::pattern::display::DisplaySettings;
use crate::core::pattern::print::PrintSettings;
use crate::core::pattern::{Fabric, Pattern, PatternProject};
use crate::error::CommandResult;
use crate::state::{PatternKey, PatternsState};
use crate::utils::path::app_document_dir;

#[tauri::command]
pub fn load_pattern(request: tauri::ipc::Request<'_>, patterns: tauri::State<PatternsState>) -> CommandResult<Vec<u8>> {
  log::trace!("Loading pattern");
  let file_path: std::path::PathBuf = request.headers().get("filePath").unwrap().to_str().unwrap().into();

  let mut patterns = patterns.write().unwrap();
  let pattern_key = PatternKey::from(&file_path);
  if let Some(pattern) = patterns.get(&pattern_key) {
    log::trace!("Pattern loaded");
    return Ok(borsh::to_vec(&(pattern_key, pattern))?);
  }

  // Change the original file path with the path to `.embproj` file.
  let mut new_file_path = file_path.clone();
  new_file_path.set_extension(PatternFormat::default().to_string());

  let mut pattern = match PatternFormat::try_from(file_path.extension())? {
    PatternFormat::Xsd => parser::xsd::parse_pattern(file_path)?,
    PatternFormat::Oxs => parser::oxs::parse_pattern(file_path)?,
    PatternFormat::EmbProj => parser::embproj::parse_pattern(file_path)?,
  };
  pattern.file_path = new_file_path;

  let result = borsh::to_vec(&(&pattern_key, &pattern))?;
  patterns.insert(pattern_key, pattern);

  log::trace!("Pattern loaded");
  Ok(result)
}

#[tauri::command]
pub fn create_pattern<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  app_handle: tauri::AppHandle<R>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<Vec<u8>> {
  // println!("Name {}", app_handle.package_info().name);
  // println!("Version {}", app_handle.package_info().version.to_string());
  if let tauri::ipc::InvokeBody::Raw(data) = request.body() {
    log::trace!("Creating new pattern");

    let fabric: Fabric = borsh::from_slice(data)?;
    let pattern = Pattern::new(fabric);
    let patproj = PatternProject {
      file_path: app_document_dir(&app_handle)?.join(format!("{}.{}", pattern.info.title, PatternFormat::default())),
      pattern,
      display_settings: DisplaySettings::new(2),
      print_settings: PrintSettings::default(),
    };

    let pattern_key = PatternKey::from(&patproj.file_path);
    let result = borsh::to_vec(&(&pattern_key, &patproj))?;

    let mut patterns = patterns.write().unwrap();
    patterns.insert(pattern_key, patproj);

    log::trace!("Pattern has been created");
    Ok(result)
  } else {
    Err(anyhow::anyhow!("Invalid request body").into())
  }
}

#[tauri::command]
pub fn save_pattern<R: tauri::Runtime>(
  request: tauri::ipc::Request<'_>,
  app_handle: tauri::AppHandle<R>,
  patterns: tauri::State<PatternsState>,
) -> CommandResult<()> {
  log::trace!("Saving pattern");

  let pattern_key = request.headers().get("patternKey").unwrap().to_str().unwrap().into();
  let file_path = request.headers().get("filePath").unwrap().to_str().unwrap().into();

  let mut patterns = patterns.write().unwrap();
  let patproj = patterns.get_mut(&pattern_key).unwrap();
  patproj.file_path = file_path;
  match PatternFormat::try_from(patproj.file_path.extension())? {
    PatternFormat::Xsd => Err(anyhow::anyhow!("The XSD format is not supported for saving.")),
    PatternFormat::Oxs => parser::oxs::save_pattern(patproj, app_handle.package_info()),
    PatternFormat::EmbProj => parser::embproj::save_pattern(patproj, app_handle.package_info()),
  }?;

  log::trace!("Pattern saved");
  Ok(())
}

#[tauri::command]
pub fn close_pattern(request: tauri::ipc::Request<'_>, patterns: tauri::State<PatternsState>) {
  log::trace!("Closing pattern");
  let pattern_key = request.headers().get("patternKey").unwrap().to_str().unwrap().into();
  patterns.write().unwrap().remove(&pattern_key);
  log::trace!("Pattern closed");
}

#[tauri::command]
pub fn get_pattern_file_path(pattern_key: PatternKey, patterns: tauri::State<PatternsState>) -> String {
  let patterns = patterns.read().unwrap();
  let patproj = patterns.get(&pattern_key).unwrap();
  patproj.file_path.to_string_lossy().to_string()
}
