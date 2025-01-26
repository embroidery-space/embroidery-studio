// TODO: remove `definePreset` once we fully customize the theme.
import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";

// Common options.
import { semantic } from "./semantic";

// Form components.
import { checkbox } from "./checkbox";
import { colorpicker } from "./colorpicker";
import { floatlabel } from "./floatlabel";
import { inputnumber } from "./inputnumber";
import { inputtext } from "./inputtext";
import { listbox } from "./listbox";
import { radiobutton } from "./radiobutton";
import { select } from "./select";

// Button components.
import { button } from "./button";

// Panel components.
import { fieldset } from "./fieldset";
import { splitter } from "./splitter";
import { toolbar } from "./toolbar";

// Overlay components.
import { dialog } from "./dialog";
import { tooltip } from "./tooltip";

// Menu components.
import { contextmenu } from "./contextmenu";
import { menu } from "./menu";
import { menubar } from "./menubar";

/**
 * A Nord Theme based on the [Nord Palette] and [Aura Theme] with customizations.
 *
 * [Nord Palette]: https://nordtheme.com/docs/colors-and-palettes
 * [Aura Theme]: https://github.com/primefaces/primevue/tree/master/packages/themes/src/presets/aura
 */
export const NordTheme = definePreset(Aura, {
  // Color palettes are omitted because they are not intended to be used.
  primitive: { borderRadius: { none: "0", xs: "2px", sm: "4px", md: "6px", lg: "8px", xl: "12px" } },
  semantic,
  directives: { tooltip },
  components: {
    // Form components.
    checkbox,
    colorpicker,
    floatlabel,
    inputnumber,
    inputtext,
    listbox,
    radiobutton,
    select,

    // Button components.
    button,

    // Panel components.
    fieldset,
    splitter,
    toolbar,

    // Overlay components.
    dialog,

    // Menu components.
    contextmenu,
    menu,
    menubar,
  },
});
