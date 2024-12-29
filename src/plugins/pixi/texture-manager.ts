import { Graphics, Matrix, RenderTexture, type Renderer, type TextureSourceOptions } from "pixi.js";
import { TEXTURE_STROKE } from "./constants";
import { ObjectedMap } from "#/utils/map";
import { mm2px } from "#/utils/measurement";
import { FullStitchKind, NodeStitchKind, PartStitchKind, type Bead } from "#/schemas/pattern";

const DEFAULT_RENDER_TEXTURE_OPTIONS: Partial<TextureSourceOptions> = {
  resolution: window.devicePixelRatio,
  antialias: true,
};

/**
 * Manages the textures used to render stitches.
 * This class is responsible for creating and caching the textures.
 */
export class TextureManager {
  #renderer: Renderer;
  #textureSourceOptions: TextureSourceOptions;

  #fullstitches: Record<FullStitchKind, RenderTexture>;
  #partstitches: Record<PartStitchKind, RenderTexture>;

  #frenchKnot: RenderTexture;
  #nodes = new ObjectedMap<Bead, RenderTexture>(); // Bead textures are created based on the bead's properties.

  constructor(renderer: Renderer, rtOptions?: TextureSourceOptions) {
    this.#renderer = renderer;
    this.#textureSourceOptions = Object.assign({}, DEFAULT_RENDER_TEXTURE_OPTIONS, rtOptions);

    this.#fullstitches = this.#createFullStitchTextures();
    this.#partstitches = this.#createPartStitchTextures();
    this.#frenchKnot = this.#createFrenchKnotTexture();
  }

  getFullStitchTexture(kind: FullStitchKind) {
    return this.#fullstitches[kind];
  }

  #createFullStitchTextures() {
    return {
      [FullStitchKind.Full]: (() => {
        const rt = RenderTexture.create(Object.assign({ width: 100, height: 100 }, this.#textureSourceOptions));
        const shape = new Graphics().rect(0, 0, 100, 100).fill(0xffffff);
        this.#renderer.render({ container: shape, target: rt });
        shape.destroy(true);
        return rt;
      })(),
      [FullStitchKind.Petite]: (() => {
        const rt = RenderTexture.create(Object.assign({ width: 50, height: 50 }, this.#textureSourceOptions));
        const shape = new Graphics().rect(1, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
        this.#renderer.render({ container: shape, target: rt });
        shape.destroy(true);
        return rt;
      })(),
    };
  }

  getPartStitchTexture(kind: PartStitchKind) {
    return this.#partstitches[kind];
  }

  #createPartStitchTextures() {
    return {
      [PartStitchKind.Half]: (() => {
        const rt = RenderTexture.create(Object.assign({ width: 100, height: 100 }, this.#textureSourceOptions));
        const shape = new Graphics()
          .poly([99, 1, 99, 35, 35, 99, 1, 99, 1, 65, 65, 1])
          .stroke(TEXTURE_STROKE)
          .fill(0xffffff);
        this.#renderer.render({ container: shape, target: rt });
        shape.destroy(true);
        return rt;
      })(),
      [PartStitchKind.Quarter]: (() => {
        const rt = RenderTexture.create(Object.assign({ width: 50, height: 50 }, this.#textureSourceOptions));
        const shape = new Graphics()
          .poly([49, 1, 49, 25, 25, 49, 1, 49, 1, 25, 25, 1])
          .stroke(TEXTURE_STROKE)
          .fill(0xffffff);
        this.#renderer.render({ container: shape, target: rt });
        shape.destroy(true);
        return rt;
      })(),
    };
  }

  getNodeTexture(kind: NodeStitchKind, bead: Bead = { length: 1.5, diameter: 2.5 }) {
    if (kind === NodeStitchKind.FrenchKnot) return this.#frenchKnot;
    else return this.#nodes.get(bead!) ?? this.#createBeadTexture(bead!);
  }

  #createFrenchKnotTexture() {
    const rt = RenderTexture.create(Object.assign({ width: 50, height: 50 }, this.#textureSourceOptions));
    const shape = new Graphics().circle(0, 0, 24).stroke(TEXTURE_STROKE).fill(0xffffff);
    this.#renderer.render({ container: shape, target: rt, transform: new Matrix(1, 0, 0, 1, 25, 25) });
    shape.destroy(true);
    return rt;
  }

  #createBeadTexture(bead: Bead) {
    const width = mm2px(bead.length) * 10;
    const height = mm2px(bead.diameter) * 10;
    const rt = RenderTexture.create(Object.assign({ width, height }, this.#textureSourceOptions));
    const shape = new Graphics()
      .roundRect(1, 2, width - 2, height - 4, (width - 2) * 0.4)
      .stroke(TEXTURE_STROKE)
      .fill(0xffffff);
    this.#renderer.render({ container: shape, target: rt });
    shape.destroy(true);
    return rt;
  }
}
