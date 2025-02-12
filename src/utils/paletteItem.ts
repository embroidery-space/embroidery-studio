import type { Blend, PaletteItem } from "#/schemas/pattern/pattern";

/** Interface representing display options for a palette panel. */
export interface PaletteDisplayOptions {
  /** Whether to show only the item color. */
  colorOnly: boolean;
  /** If true, the item vendor/brand will be displayed. */
  showBrand: boolean;
  /** If true, the item number will be displayed. */
  showNumber: boolean;
  /** If true, the item name will be displayed. */
  showName: boolean;
  /** The number of columns in the panel grid */
  columnsNumber: number;
}

export const DEFAULT_PALETTE_DISPLAY_OPTIONS: PaletteDisplayOptions = {
  colorOnly: false,
  showBrand: true,
  showNumber: true,
  showName: true,
  columnsNumber: 1,
};

/**
 * Composes a title for a palette item based on the provided display options.
 *
 * @param palitem The palette item for which the title is composed.
 * @param options The display options to customize the title.
 * @returns The composed title for the palette item.
 */
export function paletteItemTitle(
  palitem: Partial<Pick<PaletteItem, "brand" | "blends" | "number" | "name">>,
  options: PaletteDisplayOptions = DEFAULT_PALETTE_DISPLAY_OPTIONS,
): string {
  const components = [];
  if (options.showBrand && palitem.brand) components.push(palitem.brand);
  if (palitem.blends?.length) {
    components.push(
      palitem.blends
        .map((blend) => blendTitle(blend, options))
        // Remove empty strings.
        .filter((v) => v.length)
        .join(", "),
    );
    return components.join(": ");
  }
  if (options.showNumber && palitem.number) components.push(palitem.number);
  // The name can be an empty string. For example, if the palette item is blend.
  if (options.showName && palitem.name?.length) {
    if (!components.length) return palitem.name;
    return [components.join(" "), palitem.name].join(", ");
  }
  return components.join(" ");
}

/**
 * Composes a title for a blend based on the provided display options.
 *
 * @param blend - The blend for which the title is composed.
 * @param options - The display options to customize the title.
 * @returns The composed title for the blend.
 */
export function blendTitle({ brand, number }: Blend, options: PaletteDisplayOptions): string {
  const components = [];
  if (options.showBrand) components.push(brand);
  if (options.showNumber) components.push(number);
  return components.join(" ");
}
