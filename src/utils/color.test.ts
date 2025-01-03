import { describe, expect, test } from "vitest";
import { Color } from "pixi.js";
import { contrastColor } from "./color";

describe("color utils", () => {
  test("returns the contrast color", () => {
    expect(contrastColor(new Color("000000"))).toBe("white"); // Black
    expect(contrastColor(new Color("2C3225"))).toBe("white"); // DMC 310
    expect(contrastColor(new Color("7A5577"))).toBe("white"); // DMC 327
    expect(contrastColor(new Color("973E3B"))).toBe("white"); // DMC 816
    expect(contrastColor(new Color("50442B"))).toBe("white"); // DMC 938
    expect(contrastColor(new Color("FFFFFF"))).toBe("black"); // White
    expect(contrastColor(new Color("F6E311"))).toBe("black"); // DMC 307
    expect(contrastColor(new Color("91B1DB"))).toBe("black"); // DMC 809
    expect(contrastColor(new Color("ECEDC5"))).toBe("black"); // DMC 3823
    expect(contrastColor(new Color("F5A7B6"))).toBe("black"); // DMC 3708
  });
});
