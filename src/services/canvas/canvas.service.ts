import { Application, Container, Graphics } from "pixi.js";
import type { ApplicationOptions, FederatedPointerEvent, Point } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { SpatialHash as Culler } from "pixi-cull";
import type { PatternView } from "../pattern-view";
import { AddStitchEventStage, EventType, type AddStitchData, type RemoveStitchData } from "./events.types";
import { StitchGraphics } from "#/plugins/pixi/graphics";

const SCALE_FACTOR = 10;

const DEFAULT_INIT_OPTIONS: Partial<ApplicationOptions> = {
  eventMode: "passive",
  eventFeatures: { globalMove: false },
  antialias: true,
  backgroundAlpha: 0,
};

export class CanvasService extends EventTarget {
  #pixi = new Application();
  #viewport!: Viewport;
  #culler = new Culler();

  #startPoint: Point | undefined = undefined;
  #hint = new Graphics();

  constructor() {
    super();
  }

  async init(options?: Partial<ApplicationOptions>) {
    await this.#pixi.init(Object.assign({}, DEFAULT_INIT_OPTIONS, options));
    this.#viewport = this.#pixi.stage.addChild(new Viewport({ events: this.#pixi.renderer.events }));

    // Configure the viewport.
    this.#viewport.scale.set(SCALE_FACTOR);
    this.#viewport
      .drag({ keyToPress: ["ShiftLeft"], factor: 2 })
      .wheel()
      .clampZoom({ minScale: 1, maxScale: 100 });

    // Initialize the culler.
    this.#pixi.ticker.add(() => {
      if (this.#viewport.dirty) {
        this.#culler.cull(this.#viewport.getVisibleBounds());
        this.#viewport.dirty = false;
      }
    });

    // Set up event listeners.
    this.#viewport.on("pointerdown", this.#onPointerDown, this);
    this.#viewport.on("pointermove", this.#onPointerMove, this);
    this.#viewport.on("pointerup", this.#onPointerUp, this);
    this.#viewport.on("rightclick", this.#onRightClick, this);
  }

  setPatternView(view: PatternView) {
    this.clear();
    for (const stage of Object.values(view.stages)) {
      this.#viewport.addChild(stage);
      if (stage instanceof Container) this.#culler.addContainer(stage, true);
    }
    this.#viewport.addChild(this.#hint);
  }

  clear() {
    for (const container of this.#viewport.removeChildren()) {
      this.#culler.removeContainer(container);
    }
  }

  resize({ width, height }: CanvasSize) {
    this.#pixi.renderer.resize(width, height);
    this.#viewport.resize(width, height);
  }

  #clearHint() {
    const hint = this.#hint.clear().restore();
    hint.angle = 0;
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
    if (e.target instanceof StitchGraphics) {
      const detail: RemoveStitchData = e.target.stitch;
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
