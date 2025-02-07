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
    {
      getCSS: () => readFileSync("node_modules/@unocss/reset/tailwind.css", "utf-8"),
      layer: "base",
    },
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
