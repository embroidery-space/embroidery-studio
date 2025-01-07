use std::io;

use anyhow::{bail, Result};
use quick_xml::events::{BytesDecl, Event};
use quick_xml::{Reader, Writer};

use super::utils::{process_attributes, OxsVersion, Software};
use super::v1;
use crate::core::pattern::PatternProject;
use crate::display::*;
use crate::print::PrintSettings;

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

  let pattern = v1::parse_pattern(file_path.clone(), software)?;
  Ok(PatternProject {
    file_path,
    display_settings: DisplaySettings::new(pattern.palette.len()),
    print_settings: PrintSettings::default(),
    pattern,
  })
}

pub fn save_pattern(patproj: &PatternProject, package_info: &tauri::PackageInfo) -> Result<()> {
  log::info!("Saving the OXS pattern");
  v1::save_pattern(patproj.file_path.clone(), &patproj.pattern, package_info)
}

pub fn parse_display_settings(file_path: std::path::PathBuf, palette_size: usize) -> Result<DisplaySettings> {
  let mut reader = Reader::from_file(&file_path)?;
  reader.config_mut().expand_empty_elements = true;
  reader.config_mut().check_end_names = true;
  reader.config_mut().trim_text(true);

  let mut display_settings = DisplaySettings::new(palette_size);

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf) {
      Ok(Event::Start(ref e)) => {
        log::trace!("Parsing {:?}", String::from_utf8(e.name().as_ref().to_vec())?);
        #[allow(clippy::single_match)]
        match e.name().as_ref() {
          b"grid" => {
            let attributes = process_attributes(e.attributes())?;
            display_settings.grid = Grid {
              major_line_every_stitches: attributes.get("major_line_every_stitches").unwrap().parse()?,
              ..read_grid(&mut reader)?
            }
          }
          _ => {}
        }
      }
      Ok(Event::End(ref e)) if e.name().as_ref() == b"display_settings" => break,
      // We don't expect to receive EOF here, because we should have found the end of the `display_settings` tag.
      Ok(Event::Eof) => anyhow::bail!("Unexpected EOF"),
      Err(e) => anyhow::bail!("Error at position {}: {e:?}", reader.error_position()),
      _ => {}
    }
    buf.clear();
  }

  Ok(display_settings)
}

pub fn save_display_settings_to_vec(display_settings: &DisplaySettings) -> Result<Vec<u8>> {
  let buf = Vec::new();
  // In the development mode, we want to have a pretty-printed XML file for easy debugging.
  #[cfg(debug_assertions)]
  let mut writer = Writer::new_with_indent(buf, b' ', 2);
  #[cfg(not(debug_assertions))]
  let mut writer = Writer::new(buf);

  writer.write_event(Event::Decl(BytesDecl::new("1.0", Some("UTF-8"), None)))?;
  writer
    .create_element("display_settings")
    .write_inner_content(|writer| {
      write_grid(writer, &display_settings.grid)?;
      Ok(())
    })?;

  Ok(writer.into_inner())
}

fn read_grid<R: io::BufRead>(reader: &mut Reader<R>) -> Result<Grid> {
  let mut buf = Vec::new();
  let mut grid = Grid::default();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) => match e.name().as_ref() {
        b"minor_screen_lines" => {
          let attributes = process_attributes(e.attributes())?;
          grid.minor_screen_lines = GridLineStyle {
            color: attributes.get("color").unwrap().as_str().to_string(),
            thickness: attributes.get("thickness").unwrap().as_str().parse()?,
          }
        }
        b"major_screen_lines" => {
          let attributes = process_attributes(e.attributes())?;
          grid.major_screen_lines = GridLineStyle {
            color: attributes.get("color").unwrap().as_str().to_string(),
            thickness: attributes.get("thickness").unwrap().as_str().parse()?,
          }
        }
        b"minor_printer_lines" => {
          let attributes = process_attributes(e.attributes())?;
          grid.minor_printer_lines = GridLineStyle {
            color: attributes.get("color").unwrap().as_str().to_string(),
            thickness: attributes.get("thickness").unwrap().as_str().parse()?,
          }
        }
        b"major_printer_lines" => {
          let attributes = process_attributes(e.attributes())?;
          grid.major_printer_lines = GridLineStyle {
            color: attributes.get("color").unwrap().as_str().to_string(),
            thickness: attributes.get("thickness").unwrap().as_str().parse()?,
          }
        }
        _ => {}
      },
      Event::End(ref e) if e.name().as_ref() == b"grid" => break,
      _ => {}
    }
    buf.clear();
  }
  Ok(grid)
}

fn write_grid<W: io::Write>(writer: &mut Writer<W>, grid: &Grid) -> io::Result<()> {
  writer
    .create_element("grid")
    .with_attributes([(
      "major_line_every_stitches",
      grid.major_line_every_stitches.to_string().as_str(),
    )])
    .write_inner_content(|writer| {
      writer
        .create_element("minor_screen_lines")
        .with_attributes([
          ("color", grid.minor_screen_lines.color.as_str()),
          ("thickness", grid.minor_screen_lines.thickness.to_string().as_str()),
        ])
        .write_empty()?;
      writer
        .create_element("major_screen_lines")
        .with_attributes([
          ("color", grid.major_screen_lines.color.as_str()),
          ("thickness", grid.major_screen_lines.thickness.to_string().as_str()),
        ])
        .write_empty()?;
      writer
        .create_element("minor_printer_lines")
        .with_attributes([
          ("color", grid.minor_printer_lines.color.as_str()),
          ("thickness", grid.minor_printer_lines.thickness.to_string().as_str()),
        ])
        .write_empty()?;
      writer
        .create_element("major_printer_lines")
        .with_attributes([
          ("color", grid.major_printer_lines.color.as_str()),
          ("thickness", grid.major_printer_lines.thickness.to_string().as_str()),
        ])
        .write_empty()?;
      Ok(())
    })?;
  Ok(())
}
