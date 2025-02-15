import { Container, Graphics, Particle } from "pixi.js";
import {
  TextureManager,
  StitchGraphics,
  StitchSprite,
  STITCH_SCALE_FACTOR,
  StitchParticleContainer,
} from "#/plugins/pixi";
import { ObjectedMap } from "#/utils/map";
import { AddedPaletteItemData, FullStitchKind, PartStitchDirection, PartStitchKind } from "#/schemas/pattern";
import { CompletePaletteItem, FullStitch, LineStitch, PartStitch, DisplayMode } from "#/schemas/pattern";
import type {
  Fabric,
  Grid,
  NodeStitch,
  PatternInfo,
  PatternKey,
  PatternProject,
  SpecialStitch,
  SpecialStitchModel,
  Stitch,
} from "#/schemas/pattern";

/**
 * Represents the view of a pattern.
 * It contains all the pattern data along with the graphics objects to display them.
 */
export class PatternView {
  #key: PatternKey;
  #info: PatternInfo;
  #palette: CompletePaletteItem[];

  #fabric: Fabric;
  #grid: Grid;

  displayMode: DisplayMode;

  // Simple stitches (fulls, petites, halves and quarters) are rendered using particles.
  // It allows us to render a large number of stitches very efficiently.
  // This is especially important because they are the most common stitches.
  #fullstitches: ObjectedMap<FullStitch, Particle | undefined>;
  #partstitches: ObjectedMap<PartStitch, Particle | undefined>;

  // Complex stitches (back and straight stitches, french knots, beads and special stitches) are rendered using graphics and sprites.
  // They are more complex and require more control over their rendering.
  #lines: ObjectedMap<LineStitch, StitchGraphics | undefined>;
  #nodes: ObjectedMap<NodeStitch, StitchSprite | undefined>;

  #specialstitches: SpecialStitch[];
  #specialStitchModels: SpecialStitchModel[];

  #stages = {
    // lowest
    fabric: new Graphics(),
    fullstitches: new StitchParticleContainer(FullStitchKind.Full),
    petites: new StitchParticleContainer(FullStitchKind.Petite),
    halfstitches: new StitchParticleContainer(PartStitchKind.Half),
    quarters: new StitchParticleContainer(PartStitchKind.Quarter),
    grid: new Graphics(),
    specialstitches: new Container(),
    lines: new Container(),
    nodes: new Container(),
    // highest
  };

  constructor({ key, pattern, displaySettings }: PatternProject) {
    this.#key = key;
    this.#info = pattern.info;

    // Create a palette with symbols and formats.
    this.#palette = pattern.palette.map((palitem, idx) => {
      const symbols = displaySettings.symbols[idx]!;
      const formats = displaySettings.formats[idx]!;
      return new CompletePaletteItem(palitem, symbols, formats);
    });

    this.#fabric = pattern.fabric;
    this.#grid = displaySettings.grid;

    this.displayMode = displaySettings.displayMode === 0 ? DisplayMode.Solid : DisplayMode.Stitches;

    // Save stitches in the state.
    // They will be replaced with the actual display objects when the view is initialized.
    this.#fullstitches = ObjectedMap.withKeys(pattern.fullstitches);
    this.#partstitches = ObjectedMap.withKeys(pattern.partstitches);
    this.#lines = ObjectedMap.withKeys(pattern.lines);
    this.#nodes = ObjectedMap.withKeys(pattern.nodes);

    this.#specialstitches = pattern.specialstitches;
    this.#specialStitchModels = pattern.specialStitchModels;
  }

  render() {
    // Set the fabric and grid.
    this.setFabric(this.#fabric);
    this.setGrid(this.#grid);

    // Add actual stitches to the view.
    for (const fullstitch of this.#fullstitches.keys()) this.addFullStitch(fullstitch);
    for (const partstitch of this.#partstitches.keys()) this.addPartStitch(partstitch);
    for (const line of this.#lines.keys()) this.addLineStitch(line);
    for (const node of this.#nodes.keys()) this.addNodeStitch(node);
    for (const specialstitch of this.#specialstitches) this.addSpecialStitch(specialstitch);
  }

  setDisplayMode(displayMode: DisplayMode) {
    this.displayMode = displayMode;
    this.#stages.fullstitches.texture = TextureManager.shared.getFullStitchTexture(displayMode, FullStitchKind.Full);
    this.#stages.petites.texture = TextureManager.shared.getFullStitchTexture(displayMode, FullStitchKind.Petite);
    this.#stages.halfstitches.texture = TextureManager.shared.getPartStitchTexture(displayMode, PartStitchKind.Half);
    this.#stages.quarters.texture = TextureManager.shared.getPartStitchTexture(displayMode, PartStitchKind.Quarter);
  }

  get key() {
    return this.#key;
  }

  get info() {
    return this.#info;
  }

  get stages() {
    return Object.values(this.#stages);
  }

  get fabric() {
    return this.#fabric;
  }

  setFabric(fabric: Fabric) {
    this.#fabric = fabric;
    this.#stages.fabric.clear();
    this.#stages.fabric.rect(0, 0, this.fabric.width, this.fabric.height).fill(this.fabric.color);

    // If the grid is set, adjust it to the new fabric.
    if (this.#grid) this.setGrid(this.#grid);
  }

  get grid() {
    return this.#grid;
  }

  setGrid(grid: Grid) {
    this.#grid = grid;
    const { width, height } = this.fabric;
    this.#stages.grid.clear();
    {
      // Draw horizontal minor lines.
      for (let i = 1; i < width; i++) {
        this.#stages.grid.moveTo(i, 0);
        this.#stages.grid.lineTo(i, height);
      }

      // Draw vertical minor lines.
      for (let i = 1; i < height; i++) {
        this.#stages.grid.moveTo(0, i);
        this.#stages.grid.lineTo(width, i);
      }

      const { thickness, color } = this.grid.minorScreenLines;
      this.#stages.grid.stroke({ width: thickness, color });
    }
    {
      const interval = this.grid.majorLinesInterval;

      // Draw horizontal major lines.
      for (let i = 0; i <= Math.ceil(height / interval); i++) {
        const point = Math.min(i * interval, height);
        this.#stages.grid.moveTo(0, point);
        this.#stages.grid.lineTo(width, point);
      }

      // Draw vertical major lines.
      for (let i = 0; i <= Math.ceil(width / interval); i++) {
        const point = Math.min(i * interval, width);
        this.#stages.grid.moveTo(point, 0);
        this.#stages.grid.lineTo(point, height);
      }

      const { thickness, color } = this.grid.majorScreenLines;
      this.#stages.grid.stroke({ width: thickness, color });
    }
  }

  get palette() {
    return this.#palette;
  }

  addPaletteItem(data: AddedPaletteItemData) {
    const { palitem, palindex, symbols, formats } = data;
    this.#palette.splice(palindex, 0, new CompletePaletteItem(palitem, symbols, formats));
  }

  removePaletteItem(palindex: number) {
    this.#palette.splice(palindex, 1);
  }

  addStitch(stitch: Stitch) {
    if (stitch instanceof FullStitch) this.addFullStitch(stitch);
    else if (stitch instanceof PartStitch) this.addPartStitch(stitch);
    else if (stitch instanceof LineStitch) this.addLineStitch(stitch);
    else this.addNodeStitch(stitch);
  }

  removeStitch(stitch: Stitch) {
    if (stitch instanceof FullStitch) this.removeFullStitch(stitch);
    else if (stitch instanceof PartStitch) this.removePartStitch(stitch);
    else if (stitch instanceof LineStitch) this.removeLineStitch(stitch);
    else this.removeNodeStitch(stitch);
  }

  addFullStitch(full: FullStitch) {
    const { x, y, palindex, kind } = full;
    const particle = new Particle({
      texture: TextureManager.shared.getFullStitchTexture(this.displayMode, kind),
      x,
      y,
      tint: this.#palette[palindex]!.color,
      scaleX: STITCH_SCALE_FACTOR,
      scaleY: STITCH_SCALE_FACTOR,
    });
    this.#fullstitches.set(full, particle);
    if (kind === FullStitchKind.Full) this.#stages.fullstitches.addParticle(particle);
    else this.#stages.petites.addParticle(particle);
  }

  removeFullStitch(fullstitch: FullStitch) {
    const particle = this.#fullstitches.delete(fullstitch)!;
    if (fullstitch.kind === FullStitchKind.Full) this.#stages.fullstitches.removeParticle(particle);
    else this.#stages.petites.removeParticle(particle);
  }

  addPartStitch(part: PartStitch) {
    const { x, y, palindex, kind, direction } = part;
    const particle = new Particle({
      texture: TextureManager.shared.getPartStitchTexture(this.displayMode, kind),
      x,
      y,
      tint: this.#palette[palindex]!.color,
      scaleX: direction === PartStitchDirection.Forward ? STITCH_SCALE_FACTOR : -STITCH_SCALE_FACTOR,
      scaleY: STITCH_SCALE_FACTOR,
      anchorX: direction === PartStitchDirection.Forward ? 0 : 1,
    });
    this.#partstitches.set(part, particle);
    if (part.kind === PartStitchKind.Half) this.#stages.halfstitches.addParticle(particle);
    else this.#stages.quarters.addParticle(particle);
  }

  removePartStitch(partstitch: PartStitch) {
    const particle = this.#partstitches.delete(partstitch)!;
    if (partstitch.kind === PartStitchKind.Half) this.#stages.halfstitches.removeParticle(particle);
    else this.#stages.quarters.removeParticle(particle);
  }

  addLineStitch(line: LineStitch) {
    const { x, y, palindex } = line;
    const start = { x: x[0], y: y[0] };
    const end = { x: x[1], y: y[1] };
    const graphics = new StitchGraphics(line)
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a larger width to make it look like a border.
      .stroke({ width: 0.225, color: 0x000000, cap: "round" })
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a smaller width to make it look like a fill.
      .stroke({ width: 0.2, color: this.#palette[palindex]!.color, cap: "round" });
    graphics.eventMode = "static";
    this.#lines.set(line, graphics);
    this.#stages.lines.addChild(graphics);
  }

  removeLineStitch(line: LineStitch) {
    const graphics = this.#lines.delete(line)!;
    this.#stages.lines.removeChild(graphics);
  }

  addNodeStitch(node: NodeStitch) {
    const { x, y, palindex, kind, rotated } = node;
    const palitem = this.#palette[palindex]!;
    const sprite = new StitchSprite(node, TextureManager.shared.getNodeTexture(kind, palitem.bead));
    sprite.eventMode = "static";
    sprite.tint = palitem.color;
    sprite.pivot.set(sprite.width / 2, sprite.height / 2);
    sprite.scale.set(STITCH_SCALE_FACTOR);
    sprite.position.set(x, y);
    if (rotated) sprite.angle = 90;
    this.#nodes.set(node, sprite);
    this.#stages.nodes.addChild(sprite);
  }

  removeNodeStitch(node: NodeStitch) {
    const graphics = this.#nodes.delete(node)!;
    this.#stages.nodes.removeChild(graphics);
  }

  addSpecialStitch(specialStitch: SpecialStitch) {
    const { x, y, rotation, flip, palindex, modindex } = specialStitch;
    const model = this.#specialStitchModels[modindex]!;

    // Special stitches are very rare and complex so it is easier to draw them using graphics.
    const graphics = new Graphics();

    for (const { points } of model.curves) {
      // Draw a polyline with a larger width to make it look like a border.
      graphics.poly(points.flat(), false).stroke({ width: 0.225, color: 0x000000, cap: "round", join: "round" });
      // Draw a polyline with a smaller width to make it look like a fill.
      graphics.poly(points.flat(), false).stroke({ width: 0.2, cap: "round", join: "round" });
    }

    for (const { x, y } of model.lines) {
      const start = { x: x[0], y: y[0] };
      const end = { x: x[1], y: y[1] };
      graphics
        // Draw a line with a larger width to make it look like a border.
        .moveTo(start.x, start.y)
        .lineTo(end.x, end.y)
        .stroke({ width: 0.225, color: 0x000000, cap: "round" })
        // Draw a line with a smaller width to make it look like a fill.
        .moveTo(start.x, start.y)
        .lineTo(end.x, end.y)
        .stroke({ width: 0.2, cap: "round" });
    }

    // Decrease the scale factor to draw the nodes with more points.
    graphics.scale.set(0.1);
    for (const { x, y } of model.nodes) {
      // All nodes are french knotes there.
      graphics
        .circle(x * 10, y * 10, 5)
        .stroke({ pixelLine: true, color: 0x000000, cap: "round" })
        .fill(0xffffff);
    }
    graphics.scale.set(1);

    graphics.tint = this.palette[palindex]!.color;
    graphics.position.set(x, y);
    graphics.angle = rotation;
    if (flip[0]) graphics.scale.x = -1;
    if (flip[1]) graphics.scale.y = -1;

    this.#stages.specialstitches.addChild(graphics);
  }
}
