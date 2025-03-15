use std::io;

use anyhow::{Result, bail};
use quick_xml::events::{BytesDecl, BytesStart, Event};
use quick_xml::{Reader, Writer};

use super::utils::{MapAttributes, OxsVersion, Software, process_attributes};
use super::v1;
use crate::core::pattern::PatternProject;
use crate::display::*;

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

  let patproj = v1::parse_pattern(file_path.clone(), software)?;
  Ok(patproj)
}

pub fn save_pattern(patproj: &PatternProject, package_info: &tauri::PackageInfo) -> Result<()> {
  log::info!("Saving the OXS pattern");
  v1::save_pattern(patproj.file_path.clone(), patproj, package_info)
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
        match e.name().as_ref() {
          b"display_settings" => {
            let attributes = process_attributes(e.attributes())?;
            display_settings.display_mode = attributes
              .get("display_mode")
              .unwrap()
              .parse::<DisplayMode>()
              .map_err(|e| anyhow::anyhow!(e))?;
          }
          b"palette_settings" => {
            let attributes = process_attributes(e.attributes())?;
            display_settings.palette_settings = read_palette_settings(&attributes)?;
          }
          b"grid" => {
            let attributes = process_attributes(e.attributes())?;
            display_settings.grid = Grid {
              major_lines_interval: attributes.get("major_lines_interval").unwrap().parse()?,
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
  // In the development mode, we want to have a pretty-printed XML file for easy debugging.
  #[cfg(debug_assertions)]
  let mut writer = Writer::new_with_indent(Vec::new(), b' ', 2);
  #[cfg(not(debug_assertions))]
  let mut writer = Writer::new(Vec::new());

  writer.write_event(Event::Decl(BytesDecl::new("1.0", Some("UTF-8"), None)))?;
  writer
    .create_element("display_settings")
    .with_attributes([("display_mode", display_settings.display_mode.to_string().as_str())])
    .write_inner_content(|writer| {
      write_palette_settings(writer, &display_settings.palette_settings)?;
      write_grid(writer, &display_settings.grid)?;
      Ok(())
    })?;

  Ok(writer.into_inner())
}

fn read_grid<R: io::BufRead>(reader: &mut Reader<R>) -> Result<Grid> {
  fn parse_grid_line(event: &BytesStart<'_>) -> Result<GridLineStyle> {
    let attributes = process_attributes(event.attributes())?;
    Ok(GridLineStyle {
      color: attributes.get("color").unwrap().as_str().to_string(),
      thickness: attributes.get("thickness").unwrap().as_str().parse()?,
    })
  }

  let mut grid = Grid::default();

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) => match e.name().as_ref() {
        b"minor_screen_lines" => grid.minor_screen_lines = parse_grid_line(e)?,
        b"major_screen_lines" => grid.major_screen_lines = parse_grid_line(e)?,
        b"minor_printer_lines" => grid.minor_printer_lines = parse_grid_line(e)?,
        b"major_printer_lines" => grid.major_printer_lines = parse_grid_line(e)?,
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
  fn write_grid_line<W: io::Write>(writer: &mut Writer<W>, element: &str, line: &GridLineStyle) -> io::Result<()> {
    writer
      .create_element(element)
      .with_attributes([
        ("color", line.color.as_str()),
        ("thickness", line.thickness.to_string().as_str()),
      ])
      .write_empty()?;
    Ok(())
  }

  writer
    .create_element("grid")
    .with_attributes([("major_lines_interval", grid.major_lines_interval.to_string().as_str())])
    .write_inner_content(|writer| {
      write_grid_line(writer, "minor_screen_lines", &grid.minor_screen_lines)?;
      write_grid_line(writer, "major_screen_lines", &grid.major_screen_lines)?;
      write_grid_line(writer, "minor_printer_lines", &grid.minor_printer_lines)?;
      write_grid_line(writer, "major_printer_lines", &grid.major_printer_lines)?;
      Ok(())
    })?;

  Ok(())
}

fn read_palette_settings(attributes: &MapAttributes) -> Result<PaletteSettings> {
  Ok(PaletteSettings {
    columns_number: attributes.get("columns_number").unwrap().parse()?,
    color_only: attributes.get("color_only").unwrap().parse()?,
    show_color_brands: attributes.get("show_color_brands").unwrap().parse()?,
    show_color_numbers: attributes.get("show_color_names").unwrap().parse()?,
    show_color_names: attributes.get("show_color_numbers").unwrap().parse()?,
  })
}

fn write_palette_settings<W: io::Write>(writer: &mut Writer<W>, palette_settings: &PaletteSettings) -> io::Result<()> {
  writer
    .create_element("palette_settings")
    .with_attributes([
      ("columns_number", palette_settings.columns_number.to_string().as_str()),
      ("color_only", palette_settings.color_only.to_string().as_str()),
      (
        "show_color_brands",
        palette_settings.show_color_brands.to_string().as_str(),
      ),
      (
        "show_color_names",
        palette_settings.show_color_names.to_string().as_str(),
      ),
      (
        "show_color_numbers",
        palette_settings.show_color_numbers.to_string().as_str(),
      ),
    ])
    .write_empty()?;
  Ok(())
}
