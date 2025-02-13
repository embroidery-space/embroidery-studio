import { Container, Graphics, Matrix, RenderTexture } from "pixi.js";
import type { Renderer, RenderOptions, TextureSourceOptions } from "pixi.js";
import { TEXTURE_STROKE } from "./constants";
import { ObjectedMap } from "#/utils/map";
import { mm2px } from "#/utils/measurement";
import { Bead, FullStitchKind, NodeStitchKind, PartStitchKind, View } from "#/schemas/pattern";

const DEFAULT_TEXTURE_SOURCE_OPTIONS: Partial<TextureSourceOptions> = {
  resolution: window.devicePixelRatio,
  antialias: true,
};

/**
 * Manages the textures used to render stitches.
 * This class is responsible for creating and caching the textures.
 */
export class TextureManager {
  static shared = new TextureManager();

  #renderer!: Renderer;
  #textureSourceOptions!: TextureSourceOptions;

  #fullstitches = new Map<View, Record<FullStitchKind, RenderTexture>>();
  #partstitches = new Map<View, Record<PartStitchKind, RenderTexture>>();

  #frenchKnot?: RenderTexture;
  #beads = new ObjectedMap<Bead, RenderTexture>();

  view = View.Solid;

  init(renderer: Renderer, textureSourceOptions?: TextureSourceOptions) {
    this.#renderer = renderer;
    this.#textureSourceOptions = Object.assign({}, DEFAULT_TEXTURE_SOURCE_OPTIONS, textureSourceOptions);
  }

  getFullStitchTexture(kind: FullStitchKind) {
    let textures = this.#fullstitches.get(this.view);
    if (!textures) {
      textures = this.#createFullStitchTextures();
      this.#fullstitches.set(this.view, textures);
    }
    return textures[kind];
  }

  #createFullStitchTextures() {
    if (this.view === View.Solid) {
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
    } else {
      return {
        [FullStitchKind.Full]: (() => {
          const shape = new Graphics()
            .poly([
              { x: 0, y: 0 },
              { x: 30, y: 0 },
              { x: 50, y: 20 },
              { x: 70, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 30 },
              { x: 80, y: 50 },
              { x: 100, y: 70 },
              { x: 100, y: 100 },
              { x: 70, y: 100 },
              { x: 50, y: 80 },
              { x: 30, y: 100 },
              { x: 0, y: 100 },
              { x: 0, y: 70 },
              { x: 20, y: 50 },
              { x: 0, y: 30 },
            ])
            .fill(0xffffff);
          return this.#createTexture(shape, { width: 100, height: 100 });
        })(),
        [FullStitchKind.Petite]: (() => {
          const shape = new Graphics()
            .poly([
              { x: 0, y: 0 },
              { x: 15, y: 0 },
              { x: 25, y: 10 },
              { x: 35, y: 0 },
              { x: 50, y: 0 },
              { x: 50, y: 15 },
              { x: 40, y: 25 },
              { x: 50, y: 35 },
              { x: 50, y: 50 },
              { x: 35, y: 50 },
              { x: 25, y: 40 },
              { x: 15, y: 50 },
              { x: 0, y: 50 },
              { x: 0, y: 35 },
              { x: 10, y: 25 },
              { x: 0, y: 15 },
            ])
            // .stroke(TEXTURE_STROKE)
            .fill(0xffffff);
          return this.#createTexture(shape, { width: 50, height: 50 });
        })(),
      };
    }
  }

  getPartStitchTexture(kind: PartStitchKind) {
    let textures = this.#partstitches.get(this.view);
    if (!textures) {
      textures = this.#createPartStitchTextures();
      this.#partstitches.set(this.view, textures);
    }
    return textures[kind];
  }

  #createPartStitchTextures() {
    if (this.view === View.Solid) {
      return {
        [PartStitchKind.Half]: (() => {
          const shape = new Graphics().rect(1, 51, 48, 48).rect(51, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
          return this.#createTexture(shape, { width: 100, height: 100 });
        })(),
        [PartStitchKind.Quarter]: (() => {
          const shape = new Graphics().rect(1, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
          return this.#createTexture(shape, { width: 50, height: 50 });
        })(),
      };
    } else {
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
  }

  getNodeTexture(kind: NodeStitchKind, bead = Bead.default()) {
    if (kind === NodeStitchKind.FrenchKnot) {
      return (this.#frenchKnot ??= this.#createFrenchKnotTexture());
    }
    return this.#beads.get(bead) ?? this.#beads.set(bead, this.#createBeadTexture(bead));
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
