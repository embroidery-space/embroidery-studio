import { Container, Graphics, GraphicsContext, type StrokeInput } from "pixi.js";
import { StitchGraphics } from "#/plugins/pixi/graphics";
import { mm2px } from "#/utils/measurement";
import { ObjectedMap } from "#/utils/map";
import { FullStitchKind, NodeStitchKind, PartStitchDirection, PartStitchKind } from "#/schemas/pattern";
import type {
  Fabric,
  Formats,
  FullStitch,
  Grid,
  LineStitch,
  NodeStitch,
  PaletteItem,
  PartStitch,
  PatternProject,
  Symbols,
} from "#/schemas/pattern";

const SCALE_FACTOR = 10;
const STITCH_STROKE: StrokeInput = { pixelLine: true, alignment: 1, color: 0x000000 };
const FULL_STITCH_CONTEXT = {
  [FullStitchKind.Full]: new GraphicsContext().rect(0, 0, 1, 1).fill(0xffffff),
  [FullStitchKind.Petite]: new GraphicsContext().rect(0, 0, 0.5, 0.5).stroke(STITCH_STROKE).fill(0xffffff),
};
const PART_STITCH_CONTEXT = {
  [PartStitchKind.Half]: {
    [PartStitchDirection.Forward]: new GraphicsContext()
      .poly([1, 0, 1, 0.25, 0.25, 1, 0, 1, 0, 0.75, 0.75, 0])
      .stroke(STITCH_STROKE)
      .fill(0xffffff),
    [PartStitchDirection.Backward]: new GraphicsContext()
      .poly([0, 0, 0.25, 0, 1, 0.75, 1, 1, 0.75, 1, 0, 0.25])
      .stroke(STITCH_STROKE)
      .fill(0xffffff),
  },
  [PartStitchKind.Quarter]: {
    [PartStitchDirection.Forward]: new GraphicsContext()
      .poly([0.5, 0, 0.5, 0.25, 0.25, 0.5, 0, 0.5, 0, 0.25, 0.25, 0])
      .stroke(STITCH_STROKE)
      .fill(0xffffff),
    [PartStitchDirection.Backward]: new GraphicsContext()
      .poly([0, 0, 0.25, 0, 0.5, 0.25, 0.5, 0.5, 0.25, 0.5, 0, 0.25])
      .stroke(STITCH_STROKE)
      .fill(0xffffff),
  },
};

/**
 * Represents the view of a pattern.
 * It contains all the pattern data along with the graphics objects to display them.
 */
export class PatternView {
  #palette: (PaletteItem & { symbols: Symbols; formats: Formats })[];

  #fabric!: Fabric;
  #grid!: Grid;

  #fullstitches = new ObjectedMap<FullStitch, StitchGraphics>();
  #partstitches = new ObjectedMap<PartStitch, StitchGraphics>();
  #lines = new ObjectedMap<LineStitch, StitchGraphics>();
  #nodes = new ObjectedMap<NodeStitch, StitchGraphics>();

  #stages = {
    // lowest
    fabric: new Graphics(),
    fullstitches: new Container(),
    partstitches: new Container(),
    grid: new Graphics(),
    specialstitches: new Container(),
    lines: new Container(),
    nodes: new Container(),
    // highest
  };

  constructor({ pattern, displaySettings }: PatternProject) {
    // Disable events for the fabric and grid stages.
    this.#stages.fabric.eventMode = this.#stages.grid.eventMode = "none";

    // Create a palette with symbols and formats.
    this.#palette = pattern.palette.map((palitem, idx) => {
      const symbols = displaySettings.symbols[idx]!;
      const formats = displaySettings.formats[idx]!;
      return Object.assign(palitem, { symbols, formats });
    });

    // Set the fabric and grid.
    this.fabric = pattern.fabric;
    this.grid = displaySettings.grid;

    // Add stitches to the view.
    for (const fullstitch of pattern.fullstitches) this.addFullStitch(fullstitch);
    for (const partstitch of pattern.partstitches) this.addPartStitch(partstitch);
    for (const line of pattern.lines) this.addLineStitch(line);
    for (const node of pattern.nodes) this.addNodeStitch(node);
  }

  get stages() {
    return Object.values(this.#stages);
  }

  get fabric() {
    return this.#fabric;
  }

  set fabric(fabric: Fabric) {
    this.#fabric = fabric;
    this.#stages.fabric.clear();
    this.#stages.fabric.rect(0, 0, this.fabric.width, this.fabric.height).fill(this.fabric.color);
  }

  get grid() {
    return this.#grid;
  }

  set grid(grid: Grid) {
    this.#grid = grid;
    const { width, height } = this.fabric;
    this.#stages.grid.clear();
    {
      // Draw horizontal lines.
      for (let i = 1; i < width; i++) {
        this.#stages.grid.moveTo(i, 0);
        this.#stages.grid.lineTo(i, height);
      }

      // Draw vertical lines.
      for (let i = 1; i < height; i++) {
        this.#stages.grid.moveTo(0, i);
        this.#stages.grid.lineTo(width, i);
      }

      const { thickness, color } = this.grid.minorScreenLines;
      this.#stages.grid.stroke({ width: thickness, color: color });
    }
    {
      const interval = this.grid.majorLineEveryStitches;

      // Draw horizontal lines.
      for (let i = 0; i <= Math.ceil(height / interval); i++) {
        const point = Math.min(i * interval, height);
        this.#stages.grid.moveTo(0, point);
        this.#stages.grid.lineTo(width, point);
      }

      // Draw vertical lines.
      for (let i = 0; i <= Math.ceil(width / interval); i++) {
        const point = Math.min(i * interval, width);
        this.#stages.grid.moveTo(point, 0);
        this.#stages.grid.lineTo(point, height);
      }

      const { thickness, color } = this.grid.majorScreenLines;
      this.#stages.grid.stroke({ width: thickness, color: color });
    }
  }

  addFullStitch(full: FullStitch) {
    const { x, y, palindex, kind } = full;
    const graphics = new StitchGraphics({ full }, FULL_STITCH_CONTEXT[kind]);
    graphics.eventMode = "static";
    graphics.tint = this.#palette[palindex]!.color;
    graphics.position.set(x, y);
    this.#fullstitches.set(full, graphics);
    this.#stages.fullstitches.addChild(graphics);
  }

  removeFullStitch(fullstitch: FullStitch) {
    const graphics = this.#fullstitches.delete(fullstitch)!;
    this.#stages.fullstitches.removeChild(graphics);
  }

  addPartStitch(part: PartStitch) {
    const { x, y, palindex, kind, direction } = part;
    const graphics = new StitchGraphics({ part }, PART_STITCH_CONTEXT[kind][direction]);
    graphics.eventMode = "static";
    graphics.tint = this.#palette[palindex]!.color;
    graphics.position.set(x, y);
    this.#partstitches.set(part, graphics);
    this.#stages.partstitches.addChild(graphics);
  }

  removePartStitch(partstitch: PartStitch) {
    const graphics = this.#partstitches.delete(partstitch)!;
    this.#stages.partstitches.removeChild(graphics);
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
    const graphics = new StitchGraphics({ node });
    if (kind === NodeStitchKind.FrenchKnot) graphics.circle(0, 0, 3);
    else {
      const width = mm2px(palitem.bead?.length ?? 1.5);
      const height = mm2px(palitem.bead?.diameter ?? 2.5);
      graphics.roundRect(0, 0, width, height, 2);
      graphics.pivot.set(width / 2, height / 2);
    }
    graphics.stroke(STITCH_STROKE).fill(palitem.color);
    graphics.eventMode = "static";
    // Actually, we create node graphics in a larger size so that they have more points.
    // We need to divide the size by the `SCALE_FACTOR` to display them in the correct size.
    // This is a workaround to display the graphics in the good quality.
    graphics.scale.set(1 / SCALE_FACTOR);
    graphics.position.set(x, y);
    if (rotated) graphics.angle = 90;
    this.#nodes.set(node, graphics);
    this.#stages.nodes.addChild(graphics);
  }

  removeNodeStitch(node: NodeStitch) {
    const graphics = this.#nodes.delete(node)!;
    this.#stages.nodes.removeChild(graphics);
  }
}
