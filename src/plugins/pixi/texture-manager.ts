import { Container, Graphics, Matrix, RenderTexture } from "pixi.js";
import type { Renderer, RenderOptions, TextureSourceOptions } from "pixi.js";
import { TEXTURE_STROKE } from "./constants";
import { ObjectedMap } from "#/utils/map";
import { mm2px } from "#/utils/measurement";
import { Bead, FullStitchKind, NodeStitchKind, PartStitchKind } from "#/schemas/pattern";

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
  #beads = new ObjectedMap<Bead, RenderTexture>(); // Bead textures are created based on the bead's properties.

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
        const shape = new Graphics().rect(0, 0, 100, 100).fill(0xffffff);
        return this.#createTexture(shape, { width: 100, height: 100 });
      })(),
      [FullStitchKind.Petite]: (() => {
        const shape = new Graphics().rect(1, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
        return this.#createTexture(shape, { width: 50, height: 50 });
      })(),
    };
  }

  getPartStitchTexture(kind: PartStitchKind) {
    return this.#partstitches[kind];
  }

  #createPartStitchTextures() {
    return {
      [PartStitchKind.Half]: (() => {
        const shape = new Graphics()
          .poly([99, 1, 99, 35, 35, 99, 1, 99, 1, 65, 65, 1])
          .stroke(TEXTURE_STROKE)
          .fill(0xffffff);
        return this.#createTexture(shape, { width: 100, height: 100 });
      })(),
      [PartStitchKind.Quarter]: (() => {
        const shape = new Graphics()
          .poly([49, 1, 49, 25, 25, 49, 1, 49, 1, 25, 25, 1])
          .stroke(TEXTURE_STROKE)
          .fill(0xffffff);
        return this.#createTexture(shape, { width: 50, height: 50 });
      })(),
    };
  }

  getNodeTexture(kind: NodeStitchKind, bead = Bead.default()) {
    if (kind === NodeStitchKind.FrenchKnot) return this.#frenchKnot;
    const texture = this.#beads.get(bead);
    if (texture) return texture;
    return this.#beads.set(bead, this.#createBeadTexture(bead));
  }

  #createFrenchKnotTexture() {
    const shape = new Graphics().circle(0, 0, 24).stroke(TEXTURE_STROKE).fill(0xffffff);
    return this.#createTexture(shape, { width: 50, height: 50 }, { transform: new Matrix(1, 0, 0, 1, 25, 25) });
  }

  #createBeadTexture(bead: Bead) {
    const width = mm2px(bead.diameter) * 10;
    const height = mm2px(bead.length) * 10;
    const shape = new Graphics()
      .roundRect(1, 2, width - 2, height - 4, (width - 2) * 0.4)
      .stroke(TEXTURE_STROKE)
      .fill(0xffffff);
    return this.#createTexture(shape, { width, height });
  }

  #createTexture(
    container: Container,
    textureSourceOptions?: Partial<TextureSourceOptions>,
    renderOptions?: Omit<RenderOptions, "container" | "target">,
  ) {
    const rt = RenderTexture.create(Object.assign({}, this.#textureSourceOptions, textureSourceOptions));
    this.#renderer.render({ container, target: rt, ...renderOptions });
    container.destroy(true);
    return rt;
  }
}
