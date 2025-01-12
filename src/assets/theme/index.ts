import { semantic } from "./semantic";
import { button } from "./button";
import { splitter } from "./splitter";
import { toolbar } from "./toolbar";
import { tieredmenu } from "./tieredmenu";

/**
 * A Nord Theme based on the [Nord Palette] and [Aura Theme] with customizations.
 *
 * [Nord Palette]: https://nordtheme.com/docs/colors-and-palettes
 * [Aura Theme]: https://github.com/primefaces/primevue/tree/master/packages/themes/src/presets/aura
 */
export const NordTheme = {
  primitive: {
    borderRadius: {
      none: "0",
      xs: "2px",
      sm: "4px",
      md: "6px",
      lg: "8px",
      xl: "12px",
    },
    // Color palettes are omitted because they are not intended to be used.
  },
  semantic,
  components: {
    button,
    splitter,
    toolbar,
    tieredmenu,
  },
};
