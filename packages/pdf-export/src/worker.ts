import * as Comlink from "comlink";

import init, { export_pdf, PdfVariant } from "../src-wasm/pkg/";

import type { ExportInput } from "./types.ts";

const api = {
  async export(input: ExportInput): Promise<Uint8Array> {
    await init();

    const { pattern, options, symbolFonts } = input;
    const variant = input.variant === "color" ? PdfVariant.Color : PdfVariant.Monochrome;

    const textFonts = await Promise.all(
      ["/fonts/FixelVariable.ttf", "/fonts/FixelVariableItalic.ttf"].map(
        async (url) => new Uint8Array((await fetch(url).then((r) => r.arrayBuffer())) as ArrayBuffer),
      ),
    );

    const pdfBytes = export_pdf(pattern, options, variant, [...textFonts, ...symbolFonts]);
    return Comlink.transfer(pdfBytes, [pdfBytes.buffer]);
  },
};
Comlink.expose(api);
