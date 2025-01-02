import { field, validate } from "@dao-xyz/borsh";
import { PaletteItem, Pattern } from "./pattern";
import { DisplaySettings, Formats, Symbols } from "./display";
import { PrintSettings } from "./print";

export type PatternKey = string;
export class PatternProject {
  key!: PatternKey;

  @field({ type: Pattern })
  pattern: Pattern;

  @field({ type: DisplaySettings })
  displaySettings: DisplaySettings;

  @field({ type: PrintSettings })
  printSettings: PrintSettings;

  constructor(data: PatternProject) {
    this.pattern = data.pattern;
    this.displaySettings = data.displaySettings;
    this.printSettings = data.printSettings;
  }
}

export class CompletePaletteItem {
  #palitem: PaletteItem;
  #symbols: Symbols;
  #formats: Formats;

  constructor(palitem: PaletteItem, symbols: Symbols, formats: Formats) {
    this.#palitem = palitem;
    this.#symbols = symbols;
    this.#formats = formats;
  }

  get brand() {
    return this.#palitem.brand;
  }

  get number() {
    return this.#palitem.number;
  }

  get name() {
    return this.#palitem.name;
  }

  get color() {
    return this.#palitem.color;
  }

  get blends() {
    return this.#palitem.blends;
  }

  get bead() {
    return this.#palitem.bead;
  }

  get strands() {
    return this.#palitem.strands;
  }

  get palitem() {
    return this.#palitem;
  }

  get symbols() {
    return this.#symbols;
  }

  get formats() {
    return this.#formats;
  }
}

if (import.meta.env.DEV) validate(PatternProject);
