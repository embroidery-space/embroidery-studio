use anyhow::{bail, Result};
use quick_xml::events::Event;

use super::utils::{process_attributes, OxsVersion, Software};
use super::v1;
use crate::core::pattern::PatternProject;

pub fn parse_pattern(file_path: std::path::PathBuf) -> Result<PatternProject> {
  log::info!("Parsing the OXS pattern");

  let mut reader = quick_xml::Reader::from_file(&file_path)?;
  let mut buf = Vec::new();
  let (oxs_version, software) = loop {
    match reader.read_event_into(&mut buf) {
      Ok(Event::Empty(ref e)) => {
        if e.name().as_ref() == b"properties" {
          let attributes = process_attributes(e.attributes())?;
          let oxs_version: OxsVersion = attributes.get("oxsversion").unwrap().as_str().into();
          let software: Software = attributes.get("software").unwrap().as_str().into();
          break (oxs_version, software);
        }
      }
      // We don't expect to receive EOF here,
      // because we should have found the properties tag,
      // which is at the beginning of the file.
      Ok(Event::Eof) => bail!("Unexpected EOF"),
      Err(e) => bail!("Error at position {}: {e:?}", reader.error_position()),
      _ => {}
    }
    buf.clear();
  };

  if let OxsVersion::Unknown(uv) = oxs_version {
    log::warn!("Unknown OXS version: {uv}");
  }

  v1::parse_pattern(file_path, software)
}

pub fn save_pattern(patproj: &PatternProject, package_info: &tauri::PackageInfo) -> Result<()> {
  log::info!("Saving the OXS pattern");
  v1::save_pattern(patproj, package_info)
}
