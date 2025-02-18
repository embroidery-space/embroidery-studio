import { Graphics, GraphicsContext, ParticleContainer } from "pixi.js";
import type { FullStitchKind, PartStitchKind, Stitch } from "#/schemas/pattern";

/** A `Graphics` object that contains a reference to the `Stitch` object it represents. */
export class StitchGraphics extends Graphics {
  readonly stitch: Stitch;

  constructor(stitch: Stitch, context?: GraphicsContext) {
    super(context);
    this.stitch = stitch;
  }
}

/** A wrapper around `ParticleContainer` that contains a kind of the stitches it holds. */
export class StitchParticleContainer extends ParticleContainer {
  readonly kind: FullStitchKind | PartStitchKind;

  constructor(kind: FullStitchKind | PartStitchKind) {
    super();
    this.kind = kind;
  }
}
