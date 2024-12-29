import { Application, Graphics } from "pixi.js";
import type { ApplicationOptions, ColorSource, FederatedPointerEvent, Point } from "pixi.js";
import { Viewport } from "pixi-viewport";
import type { PatternView } from "../pattern-view";
import { AddStitchEventStage, EventType, type AddStitchData, type RemoveStitchData } from "./events.types";
import { TextureManager, StitchGraphics, StitchSprite, STITCH_SCALE_FACTOR } from "#/plugins/pixi";
import { Bead, type LineStitch, type NodeStitch } from "#/schemas/pattern";

const DEFAULT_INIT_OPTIONS: Partial<ApplicationOptions> = {
  eventMode: "passive",
  eventFeatures: { globalMove: false },
  antialias: true,
  backgroundAlpha: 0,
};

export class CanvasService extends EventTarget {
  #pixi = new Application();
  #tm!: TextureManager;
  #viewport!: Viewport;

  #startPoint: Point | undefined = undefined;
  #hint = new Graphics();

  constructor() {
    super();
  }

  async init({ width, height }: CanvasSize, options?: Partial<Omit<ApplicationOptions, "width" | "height">>) {
    await this.#pixi.init(Object.assign({ width, height }, DEFAULT_INIT_OPTIONS, options));
    this.#tm = new TextureManager(this.#pixi.renderer);
    this.#viewport = this.#pixi.stage.addChild(
      new Viewport({
        screenWidth: width,
        screenHeight: height,
        events: this.#pixi.renderer.events,
      }),
    );

    // Configure the viewport.
    this.#viewport
      .drag({ keyToPress: ["ShiftLeft", "ShiftRight"], mouseButtons: "right", factor: 2 })
      .pinch({ factor: 2 })
      .wheel({ smooth: 2, trackpadPinch: true, wheelZoom: false })
      .clampZoom({ minScale: 1, maxScale: 100 });

    // Set up event listeners.
    this.#viewport.on("pointerdown", this.#onPointerDown, this);
    this.#viewport.on("pointermove", this.#onPointerMove, this);
    this.#viewport.on("pointerup", this.#onPointerUp, this);
    this.#viewport.on("rightclick", this.#onRightClick, this);
  }

  setPatternView(view: PatternView) {
    this.clear();

    view.init(this.#tm);
    for (const stage of Object.values(view.stages)) this.#viewport.addChild(stage);
    this.#viewport.addChild(this.#hint);

    const { width, height } = view.fabric;
    this.#viewport.worldWidth = width;
    this.#viewport.worldHeight = height;

    this.#viewport.fitHeight();
    this.#viewport.moveCenter(width / 2, height / 2);
  }

  clear() {
    this.#viewport.removeChildren();
  }

  resize({ width, height }: CanvasSize) {
    this.#pixi.renderer.resize(width, height);
    this.#viewport.resize(width, height);
  }

  drawLineHint(line: LineStitch, color: ColorSource) {
    const { x, y } = line;
    const start = { x: x[0], y: y[0] };
    const end = { x: x[1], y: y[1] };
    this.#clearHint()
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a larger width to make it look like a border.
      .stroke({ width: 0.225, color: 0x000000, cap: "round" })
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a smaller width to make it look like a fill.
      .stroke({ width: 0.2, color, cap: "round" });
  }

  drawNodeHint(node: NodeStitch, color: ColorSource, bead?: Bead) {
    const { x, y, kind, rotated } = node;
    const graphics = this.#clearHint();
    graphics.texture(this.#tm.getNodeTexture(kind, bead), color);
    graphics.pivot.set(graphics.width / 2, graphics.height / 2);
    graphics.scale.set(STITCH_SCALE_FACTOR);
    graphics.position.set(x, y);
    if (rotated) graphics.angle = 90;
  }

  #clearHint() {
    const hint = this.#hint.clear().restore();
    hint.angle = 0;
    hint.alpha = 0.5;
    hint.pivot.set(0, 0);
    hint.scale.set(1, 1);
    hint.position.set(0, 0);
    return hint;
  }

  #fireAddStitchEvent(e: FederatedPointerEvent, stage: AddStitchEventStage) {
    const point = this.#viewport.toWorld(e.global);
    if (this.#pointIsOutside(point)) return;
    const detail: AddStitchData = {
      stage,
      start: this.#startPoint!,
      end: point,
      alt: e.ctrlKey,
      fixed: e.ctrlKey,
    };
    this.dispatchEvent(new CustomEvent(EventType.AddStitch, { detail }));
  }

  #onPointerDown(e: FederatedPointerEvent) {
    if (e.shiftKey) return;
    const point = this.#viewport.toWorld(e.global);
    this.#startPoint = this.#pointIsOutside(point) ? undefined : point;
    if (this.#startPoint === undefined) {
      this.#clearHint();
      return;
    }
    this.#fireAddStitchEvent(e, AddStitchEventStage.Start);
  }

  #onPointerUp(e: FederatedPointerEvent) {
    // If the start point is not set or the shift key is pressed, do nothing.
    // Shift key is used to pan the viewport.
    if (e.shiftKey || this.#startPoint === undefined) {
      this.#clearHint();
      return;
    }
    this.#fireAddStitchEvent(e, AddStitchEventStage.End);
    this.#startPoint = undefined;
    this.#clearHint();
  }

  #onPointerMove(e: FederatedPointerEvent) {
    if (e.shiftKey || this.#startPoint === undefined) {
      this.#clearHint();
      return;
    }
    this.#fireAddStitchEvent(e, AddStitchEventStage.Continue);
  }

  #onRightClick(e: FederatedPointerEvent) {
    if (e.shiftKey) return; // Shift key is used to pan the viewport.
    if (e.target instanceof StitchGraphics || e.target instanceof StitchSprite) {
      const detail: RemoveStitchData = { stitch: e.target.stitch };
      this.dispatchEvent(new CustomEvent(EventType.RemoveStitch, { detail }));
    } else {
      // If the target is not a stitch graphics or sprite, then it is a particle which is not interactive.
      // We handle such elements by dispatching an event with the point where the right click occurred.
      const detail: RemoveStitchData = { point: this.#viewport.toWorld(e.global) };
      this.dispatchEvent(new CustomEvent(EventType.RemoveStitch, { detail }));
    }
  }

  #pointIsOutside({ x, y }: Point) {
    return x <= 0 || y <= 0 || x >= this.#viewport.worldWidth || y >= this.#viewport.worldHeight;
  }
}

export interface CanvasSize {
  width: number;
  height: number;
}
