import { Container, Graphics, Particle, ParticleContainer } from "pixi.js";
import { TextureManager, StitchGraphics, StitchSprite, STITCH_SCALE_FACTOR } from "#/plugins/pixi";
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
  Pattern,
  PatternInfo,
  PatternKey,
  PatternProject,
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

  // Simple stitches (full, petite, half, quarter) are rendered using particles.
  // It allows us to render a large number of stitches very efficiently.
  // This is especially important because they are the most common stitches.
  #fullstitches = new ObjectedMap<FullStitch, Particle>();
  #partstitches = new ObjectedMap<PartStitch, Particle>();

  // Complex stitches (back and straight stitches, french knots, beads and special stitches) are rendered using graphics and sprites.
  // They are more complex and require more control over their rendering.
  #lines = new ObjectedMap<LineStitch, StitchGraphics>();
  #nodes = new ObjectedMap<NodeStitch, StitchSprite>();

  #stages = {
    // lowest
    fabric: new Graphics(),
    fullstitches: new ParticleContainer(),
    petites: new ParticleContainer(),
    halfstitches: new ParticleContainer(),
    quarters: new ParticleContainer(),
    grid: new Graphics(),
    lines: new Container(),
    nodes: new Container(),
    specialstitches: new Container(),
    // highest
  };

  #pattern: Pattern;
  #tm!: TextureManager;

  constructor({ key, pattern, displaySettings }: PatternProject) {
    this.#key = key;
    this.#info = pattern.info;
    this.#pattern = pattern;

    // Create a palette with symbols and formats.
    this.#palette = pattern.palette.map((palitem, idx) => {
      const symbols = displaySettings.symbols[idx]!;
      const formats = displaySettings.formats[idx]!;
      return Object.assign(palitem, { symbols, formats });
    });

    // Set the fabric and grid.
    this.setFabric(pattern.fabric);
    this.setGrid(displaySettings.grid);
  }

  init(tm: TextureManager) {
    this.#tm = tm;

    // Add stitches to the view.
    for (const fullstitch of this.#pattern.fullstitches) this.addFullStitch(fullstitch);
    for (const partstitch of this.#pattern.partstitches) this.addPartStitch(partstitch);
    for (const line of this.#pattern.lines) this.addLineStitch(line);
    for (const node of this.#pattern.nodes) this.addNodeStitch(node);
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
      texture: this.#tm.getFullStitchTexture(kind),
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
      texture: this.#tm.getPartStitchTexture(kind),
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
    const sprite = new StitchSprite({ node }, this.#tm.getNodeTexture(kind, palitem.bead));
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
}

export interface PaletteItemData {
  paletteItem: PaletteItem;
  palindex: number;
  symbols: Symbols;
  formats: Formats;
}
