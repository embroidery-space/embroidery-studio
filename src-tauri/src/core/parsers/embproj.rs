use std::io::Write;

use anyhow::Result;

use crate::core::parsers::oxs;
use crate::core::pattern::{DisplaySettings, PatternProject};

pub fn parse_pattern(file_path: std::path::PathBuf) -> Result<PatternProject> {
  log::info!("Parsing the EMBPROJ pattern file");

  let temp = tempfile::Builder::new().tempdir()?;
  let temp = temp.path();

  // `quick-xml` doesn't support reading from a `ZipFile`'s directly because it doesn't implement `std::io::BufRead` trait,
  // so we extract all the files to a temporary directory to read them as regular files.
  zip_extract::extract(std::fs::File::open(&file_path)?, temp, true)?;

  let mut patproj = oxs::parse_pattern(temp.join("pattern.oxs"))?;
  let DisplaySettings {
    display_mode,
    palette_settings,
    grid,
    ..
  } = oxs::parse_display_settings(temp.join("display_settings.xml"))?;

  patproj.display_settings.display_mode = display_mode;
  patproj.display_settings.palette_settings = palette_settings;
  patproj.display_settings.grid = grid;

  Ok(patproj)
}

pub fn save_pattern(patproj: &PatternProject, package_info: &tauri::PackageInfo) -> Result<()> {
  log::info!("Saving the EMBPROJ pattern file");
  let file = std::fs::OpenOptions::new()
    .create(true)
    .write(true)
    .truncate(true)
    .open(&patproj.file_path)?;
  let mut zip = zip::ZipWriter::new(file);
  let options = zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Zstd);

  zip.start_file("pattern.oxs", options)?;
  zip.write_all(&oxs::save_pattern_to_vec(patproj, package_info)?)?;

  zip.start_file("display_settings.xml", options)?;
  zip.write_all(&oxs::save_display_settings_to_vec(&patproj.display_settings)?)?;

  zip.finish()?;
  Ok(())
}
