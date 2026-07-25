# PDF Export

This package provides a functionality for compiling cross-stitch patterns to PDF documents entirely in the browser — no server or native binary required.

The core module is implemented in Rust and shipped as a Wasm module.
This package provides a single `exportPatternAsPdf` function which

It has two layers: a Rust core (`src-wasm/`) compiled to Wasm, and a thin TypeScript facade (`src/`) that wraps it in a one-shot Web Worker.
The worker is spawned per call and terminated after execution, so memory usage stays predictable across multiple exports.

The document processing pipeline is served by [Typst](https://typst.app) under the hood.

No fonts are bundled in the Wasm module.
The [Fixel](https://fixel.macpaw.com/) variable font used by the document template is fetched by the Web Worker at runtime from the app's static resources (`/fonts/FixelVariable.ttf`).
The caller must additionally provide the raw bytes of every symbol font referenced by the pattern palette, since those cannot be known ahead of time.
