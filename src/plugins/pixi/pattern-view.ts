import { Container, Graphics, Particle } from "pixi.js";
import {
  TextureManager,
  StitchGraphics,
  StitchSprite,
  STITCH_SCALE_FACTOR,
  StitchParticleContainer,
} from "#/plugins/pixi";
import { ObjectedMap } from "#/utils/map";
import { FullStitchKind, PartStitchDirection, PartStitchKind } from "#/schemas/pattern";
import type {
  Fabric,
  Formats,
  FullStitch,
  Grid,
  LineStitch,
  NodeStitch,
  PaletteItem,
  PartStitch,
  PatternInfo,
  PatternKey,
  PatternProject,
  SpecialStitch,
  SpecialStitchModel,
  Stitch,
  Symbols,
} from "#/schemas/pattern";

/**
 * Represents the view of a pattern.
 * It contains all the pattern data along with the graphics objects to display them.
 */
export class PatternView {
  #key: PatternKey;
  #info: PatternInfo;
  #palette: (PaletteItem & { symbols: Symbols; formats: Formats })[];

  #fabric!: Fabric;
  #grid!: Grid;

  // Simple stitches (fulls, petites, halves and quarters) are rendered using particles.
  // It allows us to render a large number of stitches very efficiently.
  // This is especially important because they are the most common stitches.
  #fullstitches = new ObjectedMap<FullStitch, Particle | undefined>();
  #partstitches = new ObjectedMap<PartStitch, Particle | undefined>();

  // Complex stitches (back and straight stitches, french knots, beads and special stitches) are rendered using graphics and sprites.
  // They are more complex and require more control over their rendering.
  #lines = new ObjectedMap<LineStitch, StitchGraphics | undefined>();
  #nodes = new ObjectedMap<NodeStitch, StitchSprite | undefined>();

  #specialstitches: SpecialStitch[];
  #specialStitchModels: SpecialStitchModel[];

  #textureManager!: TextureManager;
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
      return Object.assign(palitem, { symbols, formats });
    });

    // Set the fabric and grid.
    this.setFabric(pattern.fabric);
    this.setGrid(displaySettings.grid);

    // Save stitches in the state.
    // They will be replaced with the actual display objects when the view is initialized.
    for (const fullstitch of pattern.fullstitches) this.#fullstitches.set(fullstitch, undefined);
    for (const partstitch of pattern.partstitches) this.#partstitches.set(partstitch, undefined);
    for (const line of pattern.lines) this.#lines.set(line, undefined);
    for (const node of pattern.nodes) this.#nodes.set(node, undefined);

    this.#specialstitches = pattern.specialstitches;
    this.#specialStitchModels = pattern.specialStitchModels;
  }

  init(textureManager: TextureManager) {
    this.#textureManager = textureManager;

    // Add actual stitches to the view.
    for (const fullstitch of this.#fullstitches.extract().map((entry) => entry.key)) this.addFullStitch(fullstitch);
    for (const partstitch of this.#partstitches.extract().map((entry) => entry.key)) this.addPartStitch(partstitch);
    for (const line of this.#lines.extract().map((entry) => entry.key)) this.addLineStitch(line);
    for (const node of this.#nodes.extract().map((entry) => entry.key)) this.addNodeStitch(node);
    for (const specialstitch of this.#specialstitches) this.addSpecialStitch(specialstitch);
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
      const interval = this.grid.majorLineEveryStitches;

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

  addPaletteItem(data: PaletteItemData) {
    const { paletteItem, palindex, symbols, formats } = data;
    this.#palette.splice(palindex, 0, Object.assign(paletteItem, { symbols, formats }));
  }

  removePaletteItem(palindex: number) {
    this.#palette.splice(palindex, 1);
  }

  addStitch(stitch: Stitch) {
    if ("full" in stitch) this.addFullStitch(stitch.full);
    if ("part" in stitch) this.addPartStitch(stitch.part);
    if ("line" in stitch) this.addLineStitch(stitch.line);
    if ("node" in stitch) this.addNodeStitch(stitch.node);
  }

  removeStitch(stitch: Stitch) {
    if ("full" in stitch) this.removeFullStitch(stitch.full);
    if ("part" in stitch) this.removePartStitch(stitch.part);
    if ("line" in stitch) this.removeLineStitch(stitch.line);
    if ("node" in stitch) this.removeNodeStitch(stitch.node);
  }

  addFullStitch(full: FullStitch) {
    const { x, y, palindex, kind } = full;
    const particle = new Particle({
      texture: this.#textureManager.getFullStitchTexture(kind),
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
      texture: this.#textureManager.getPartStitchTexture(kind),
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
    const graphics = new StitchGraphics({ line })
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
    const sprite = new StitchSprite({ node }, this.#textureManager.getNodeTexture(kind, palitem.bead));
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

export interface PaletteItemData {
  paletteItem: PaletteItem;
  palindex: number;
  symbols: Symbols;
  formats: Formats;
}