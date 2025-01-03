import { Color } from "pixi.js";

export function contrastColor(color: Color) {
  const [r, g, b] = color.toUint8RgbArray() as [number, number, number];
  const brightness = r * 0.299 + g * 0.587 + b * 0.114;
  return brightness > 128 ? "black" : "white";
}
