use std::io;

use anyhow::Result;
use quick_xml::events::{BytesDecl, BytesStart, Event};
use quick_xml::{Reader, Writer};
use xsp_parsers::oxs::{self, AttributesMap, process_attributes};

use crate::core::pattern::*;

pub fn parse_pattern<P: AsRef<std::path::Path>>(file_path: P) -> Result<PatternProject> {
  let file_path = file_path.as_ref();
  let oxs_pattern = oxs::parse_oxs_pattern(file_path)?;
  let (fabric, palette) = oxs_pattern.palette;

  let display_settings = DisplaySettings::default();
  Ok(PatternProject {
    file_path: file_path.to_owned(),
    pattern: Pattern {
      fabric: Fabric {
        width: oxs_pattern.properties.width,
        height: oxs_pattern.properties.height,
        spi: oxs_pattern.properties.stitches_per_inch,
        name: fabric.name,
        color: fabric.color,
        ..Default::default()
      },
      info: oxs_pattern.properties.into(),
      palette: palette.into_iter().map(PaletteItem::from).collect(),
      fullstitches: Stitches::from_iter(
        oxs_pattern
          .fullstitches
          .into_iter()
          .map(|stitch| stitch.try_into())
          .collect::<Result<Vec<_>, _>>()?,
      ),
      partstitches: Stitches::from_iter(
        oxs_pattern
          .partstitches
          .into_iter()
          .map(|stitch| stitch.try_into())
          .collect::<Result<Vec<_>, _>>()?,
      ),
      linestitches: Stitches::from_iter(
        oxs_pattern
          .linestitches
          .into_iter()
          .map(|stitch| stitch.try_into())
          .collect::<Result<Vec<_>, _>>()?,
      ),
      nodestitches: Stitches::from_iter(
        oxs_pattern
          .nodestitches
          .into_iter()
          .map(|stitch| stitch.try_into())
          .collect::<Result<Vec<_>, _>>()?,
      ),
      ..Default::default()
    },
    display_settings,
  })
}

pub fn save_pattern(patproj: &PatternProject, package_info: &tauri::PackageInfo) -> Result<()> {
  let file_path = &patproj.file_path;
  let pattern = &patproj.pattern;

  let oxs_pattern = oxs::Pattern {
    properties: oxs::PatternProperties {
      software: package_info.name.clone(),
      software_version: package_info.version.to_string(),
      height: pattern.fabric.height,
      width: pattern.fabric.width,
      title: pattern.info.title.clone(),
      author: pattern.info.author.clone(),
      copyright: pattern.info.copyright.clone(),
      instructions: pattern.info.description.clone(),
      stitches_per_inch: pattern.fabric.spi,
    },
    palette: (
      oxs::PaletteItem {
        number: format!("{} {}", pattern.fabric.name, pattern.fabric.color),
        name: pattern.fabric.name.clone(),
        color: pattern.fabric.color.clone(),
        symbol: None,
      },
      pattern.palette.iter().map(oxs::PaletteItem::from).collect(),
    ),
    fullstitches: pattern.fullstitches.iter().map(oxs::FullStitch::from).collect(),
    partstitches: pattern.partstitches.iter().map(oxs::PartStitch::from).collect(),
    linestitches: pattern.linestitches.iter().map(oxs::LineStitch::from).collect(),
    nodestitches: pattern.nodestitches.iter().map(oxs::NodeStitch::from).collect(),
  };

  Ok(oxs::save_oxs_pattern(file_path, &oxs_pattern)?)
}

pub fn save_pattern_to_vec(patproj: &PatternProject, package_info: &tauri::PackageInfo) -> Result<Vec<u8>> {
  let pattern = &patproj.pattern;

  let oxs_pattern = oxs::Pattern {
    properties: oxs::PatternProperties {
      software: package_info.name.clone(),
      software_version: package_info.version.to_string(),
      height: pattern.fabric.height,
      width: pattern.fabric.width,
      title: pattern.info.title.clone(),
      author: pattern.info.author.clone(),
      copyright: pattern.info.copyright.clone(),
      instructions: pattern.info.description.clone(),
      stitches_per_inch: pattern.fabric.spi,
    },
    palette: (
      oxs::PaletteItem {
        number: format!("{} {}", pattern.fabric.name, pattern.fabric.color),
        name: pattern.fabric.name.clone(),
        color: pattern.fabric.color.clone(),
        symbol: None,
      },
      pattern.palette.iter().map(oxs::PaletteItem::from).collect(),
    ),
    fullstitches: pattern.fullstitches.iter().map(oxs::FullStitch::from).collect(),
    partstitches: pattern.partstitches.iter().map(oxs::PartStitch::from).collect(),
    linestitches: pattern.linestitches.iter().map(oxs::LineStitch::from).collect(),
    nodestitches: pattern.nodestitches.iter().map(oxs::NodeStitch::from).collect(),
  };

  oxs::save_oxs_pattern_to_vec(&oxs_pattern)
}

pub fn parse_display_settings(file_path: std::path::PathBuf) -> Result<DisplaySettings> {
  let mut reader = Reader::from_file(&file_path)?;
  reader.config_mut().expand_empty_elements = true;
  reader.config_mut().check_end_names = true;
  reader.config_mut().trim_text(true);

  let mut display_settings = DisplaySettings::default();

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
  fn parse_grid_line(event: &BytesStart<'_>) -> Result<GridLine> {
    let attributes = process_attributes(event.attributes())?;
    Ok(GridLine {
      color: attributes.get("color").unwrap().as_str().to_string(),
      thickness: attributes.get("thickness").unwrap().as_str().parse()?,
    })
  }

  let mut grid = Grid::default();

  let mut buf = Vec::new();
  loop {
    match reader.read_event_into(&mut buf)? {
      Event::Start(ref e) => match e.name().as_ref() {
        b"minor_screen_lines" => grid.minor_lines = parse_grid_line(e)?,
        b"major_screen_lines" => grid.major_lines = parse_grid_line(e)?,
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
  fn write_grid_line<W: io::Write>(writer: &mut Writer<W>, element: &str, line: &GridLine) -> io::Result<()> {
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
      write_grid_line(writer, "minor_screen_lines", &grid.minor_lines)?;
      write_grid_line(writer, "major_screen_lines", &grid.major_lines)?;
      Ok(())
    })?;

  Ok(())
}

fn read_palette_settings(attributes: &AttributesMap) -> Result<PaletteSettings> {
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

impl From<oxs::PatternProperties> for PatternInfo {
  fn from(pattern_properties: oxs::PatternProperties) -> Self {
    Self {
      title: pattern_properties.title,
      author: pattern_properties.author,
      copyright: pattern_properties.copyright,
      description: pattern_properties.instructions,
    }
  }
}

impl From<oxs::PaletteItem> for PaletteItem {
  fn from(palette_item: oxs::PaletteItem) -> Self {
    let data = palette_item.number.split(' ').collect::<Vec<_>>();
    let brand = data[0..(data.len() - 1)].join(" ").trim_end().to_string();
    let number = data.last().unwrap().to_string();

    Self {
      brand,
      number,
      name: palette_item.name,
      color: palette_item.color,
      blends: None,
      bead: None,
      symbol_font: None,
      symbol: palette_item.symbol.map(Symbol::from),
    }
  }
}

impl From<oxs::Symbol> for Symbol {
  fn from(symbol: oxs::Symbol) -> Self {
    match symbol {
      oxs::Symbol::Code(code) => Self::Code(code),
      oxs::Symbol::Char(ch) => Self::Char(ch.to_string()),
    }
  }
}

impl From<&PaletteItem> for oxs::PaletteItem {
  fn from(palette_item: &PaletteItem) -> Self {
    Self {
      number: format!("{} {}", palette_item.brand, palette_item.number),
      name: palette_item.name.clone(),
      color: palette_item.color.clone(),
      symbol: palette_item.symbol.as_ref().map(|s| s.clone().into()),
    }
  }
}

impl From<Symbol> for oxs::Symbol {
  fn from(symbol: Symbol) -> Self {
    match symbol {
      Symbol::Code(code) => Self::Code(code),
      Symbol::Char(ch) => Self::Char(ch.chars().next().unwrap_or(' ')),
    }
  }
}

impl TryFrom<oxs::FullStitch> for FullStitch {
  type Error = anyhow::Error;

  fn try_from(fullstitch: oxs::FullStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      x: Coord::new(fullstitch.x)?,
      y: Coord::new(fullstitch.y)?,
      palindex: fullstitch.palindex,
      kind: fullstitch.kind.into(),
    })
  }
}

impl From<oxs::FullStitchKind> for FullStitchKind {
  fn from(kind: oxs::FullStitchKind) -> Self {
    match kind {
      oxs::FullStitchKind::Full => FullStitchKind::Full,
      oxs::FullStitchKind::Petite => FullStitchKind::Petite,
    }
  }
}

impl From<&FullStitch> for oxs::FullStitch {
  fn from(fullstitch: &FullStitch) -> Self {
    Self {
      x: fullstitch.x.into_inner(),
      y: fullstitch.y.into_inner(),
      palindex: fullstitch.palindex,
      kind: fullstitch.kind.into(),
    }
  }
}

impl From<FullStitchKind> for oxs::FullStitchKind {
  fn from(kind: FullStitchKind) -> Self {
    match kind {
      FullStitchKind::Full => oxs::FullStitchKind::Full,
      FullStitchKind::Petite => oxs::FullStitchKind::Petite,
    }
  }
}

impl TryFrom<oxs::PartStitch> for PartStitch {
  type Error = anyhow::Error;

  fn try_from(partstitch: oxs::PartStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      x: Coord::new(partstitch.x)?,
      y: Coord::new(partstitch.y)?,
      palindex: partstitch.palindex,
      direction: partstitch.direction.into(),
      kind: partstitch.kind.into(),
    })
  }
}

impl From<oxs::PartStitchDirection> for PartStitchDirection {
  fn from(direction: oxs::PartStitchDirection) -> Self {
    match direction {
      oxs::PartStitchDirection::Forward => PartStitchDirection::Forward,
      oxs::PartStitchDirection::Backward => PartStitchDirection::Backward,
    }
  }
}

impl From<oxs::PartStitchKind> for PartStitchKind {
  fn from(kind: oxs::PartStitchKind) -> Self {
    match kind {
      oxs::PartStitchKind::Half => PartStitchKind::Half,
      oxs::PartStitchKind::Quarter => PartStitchKind::Quarter,
    }
  }
}

impl From<&PartStitch> for oxs::PartStitch {
  fn from(partstitch: &PartStitch) -> Self {
    Self {
      x: partstitch.x.into_inner(),
      y: partstitch.y.into_inner(),
      palindex: partstitch.palindex,
      direction: partstitch.direction.into(),
      kind: partstitch.kind.into(),
    }
  }
}

impl From<PartStitchDirection> for oxs::PartStitchDirection {
  fn from(direction: PartStitchDirection) -> Self {
    match direction {
      PartStitchDirection::Forward => oxs::PartStitchDirection::Forward,
      PartStitchDirection::Backward => oxs::PartStitchDirection::Backward,
    }
  }
}

impl From<PartStitchKind> for oxs::PartStitchKind {
  fn from(kind: PartStitchKind) -> Self {
    match kind {
      PartStitchKind::Half => oxs::PartStitchKind::Half,
      PartStitchKind::Quarter => oxs::PartStitchKind::Quarter,
    }
  }
}

impl TryFrom<oxs::LineStitch> for LineStitch {
  type Error = anyhow::Error;

  fn try_from(linestitch: oxs::LineStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      x: (Coord::new(linestitch.x.0)?, Coord::new(linestitch.x.1)?),
      y: (Coord::new(linestitch.y.0)?, Coord::new(linestitch.y.1)?),
      palindex: linestitch.palindex,
      kind: linestitch.kind.into(),
    })
  }
}

impl From<oxs::LineStitchKind> for LineStitchKind {
  fn from(kind: oxs::LineStitchKind) -> Self {
    match kind {
      oxs::LineStitchKind::Back => LineStitchKind::Back,
      oxs::LineStitchKind::Straight => LineStitchKind::Straight,
    }
  }
}

impl From<&LineStitch> for oxs::LineStitch {
  fn from(linestitch: &LineStitch) -> Self {
    Self {
      x: (linestitch.x.0.into_inner(), linestitch.x.1.into_inner()),
      y: (linestitch.y.0.into_inner(), linestitch.y.1.into_inner()),
      palindex: linestitch.palindex,
      kind: linestitch.kind.into(),
    }
  }
}

impl From<LineStitchKind> for oxs::LineStitchKind {
  fn from(kind: LineStitchKind) -> Self {
    match kind {
      LineStitchKind::Back => oxs::LineStitchKind::Back,
      LineStitchKind::Straight => oxs::LineStitchKind::Straight,
    }
  }
}

impl TryFrom<oxs::NodeStitch> for NodeStitch {
  type Error = anyhow::Error;

  fn try_from(nodestitch: oxs::NodeStitch) -> Result<Self, Self::Error> {
    Ok(Self {
      x: Coord::new(nodestitch.x)?,
      y: Coord::new(nodestitch.y)?,
      palindex: nodestitch.palindex,
      kind: nodestitch.kind.into(),
      rotated: false,
    })
  }
}

impl From<oxs::NodeStitchKind> for NodeStitchKind {
  fn from(kind: oxs::NodeStitchKind) -> Self {
    match kind {
      oxs::NodeStitchKind::FrenchKnot => NodeStitchKind::FrenchKnot,
      oxs::NodeStitchKind::Bead => NodeStitchKind::Bead,
    }
  }
}

impl From<&NodeStitch> for oxs::NodeStitch {
  fn from(nodestitch: &NodeStitch) -> Self {
    Self {
      x: nodestitch.x.into_inner(),
      y: nodestitch.y.into_inner(),
      palindex: nodestitch.palindex,
      kind: nodestitch.kind.into(),
    }
  }
}

impl From<NodeStitchKind> for oxs::NodeStitchKind {
  fn from(kind: NodeStitchKind) -> Self {
    match kind {
      NodeStitchKind::FrenchKnot => oxs::NodeStitchKind::FrenchKnot,
      NodeStitchKind::Bead => oxs::NodeStitchKind::Bead,
    }
  }
}
