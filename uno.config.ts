import { readFileSync } from "node:fs";
import { defineConfig, presetIcons, presetUno } from "unocss";

export default defineConfig({
  presets: [
    presetUno({ dark: "media" }),
    presetIcons({
      scale: 1.5,
      unit: "rem",
    }),
  ],
  preflights: [
    // Import custom CSS files here to include them into the optimization process.
    { getCSS: () => readFileSync("src/assets/reset.css", "utf-8"), layer: "base" },
    { getCSS: () => readFileSync("src/assets/utilities.css", "utf-8"), layer: "utilities" },
  ],
  outputToCssLayers: {
    cssLayerName(layer) {
      switch (layer) {
        case "preflights": {
          return "base";
        }
        case "default": {
          return "utilities";
        }
        default: {
          return layer;
        }
      }
    },
  },
});
