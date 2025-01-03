import { field } from "@dao-xyz/borsh";
import { PaletteItem } from "../pattern";
import { Formats, Symbols } from "../display";

export class AddedPaletteItemData {
  @field({ type: PaletteItem })
  palitem: PaletteItem;

  @field({ type: "u8" })
  palindex: number;

  @field({ type: Symbols })
  symbols: Symbols;

  @field({ type: Formats })
  formats: Formats;

  constructor(data: AddedPaletteItemData) {
    this.palitem = data.palitem;
    this.palindex = data.palindex;
    this.symbols = data.symbols;
    this.formats = data.formats;
  }
}
