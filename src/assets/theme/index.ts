// TODO: remove `definePreset` once we fully customize the theme.
import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

import { semantic } from "./semantic";
import { button } from "./button";
import { checkbox } from "./checkbox";
import { colorpicker } from "./colorpicker";
import { radiobutton } from "./radiobutton";
import { dialog } from "./dialog";
import { fieldset } from "./fieldset";
import { floatlabel } from "./floatlabel";
import { inputtext } from "./inputtext";
import { inputnumber } from "./inputnumber";
import { menu } from "./menu";
import { menubar } from "./menubar";
import { select } from "./select";
import { splitter } from "./splitter";
import { toolbar } from "./toolbar";
import { listbox } from "./listbox";

/**
 * A Nord Theme based on the [Nord Palette] and [Aura Theme] with customizations.
 *
 * [Nord Palette]: https://nordtheme.com/docs/colors-and-palettes
 * [Aura Theme]: https://github.com/primefaces/primevue/tree/master/packages/themes/src/presets/aura
 */
export const NordTheme = definePreset(Aura, {
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
    checkbox,
    colorpicker,
    radiobutton,
    dialog,
    fieldset,
    floatlabel,
    inputtext,
    inputnumber,
    menu,
    menubar,
    select,
    splitter,
    toolbar,
    listbox,
  },
});
