import { Graphics, GraphicsContext, Sprite, Texture } from "pixi.js";
import type { Stitch } from "#/schemas/pattern";

/** A `Graphics` object that contains a reference to the `Stitch` object it represents. */
export class StitchGraphics extends Graphics {
  #stitch: Stitch;

  constructor(stitch: Stitch, context?: GraphicsContext) {
    super(context);
    this.#stitch = stitch;
  }

  get stitch() {
    return this.#stitch;
  }
}

/** A `Sprite` object that contains a reference to the `Stitch` object it represents. */
export class StitchSprite extends Sprite {
  #stitch: Stitch;

  constructor(stitch: Stitch, texture: Texture) {
    super(texture);
    this.#stitch = stitch;
  }

  get stitch() {
    return this.#stitch;
  }
}
