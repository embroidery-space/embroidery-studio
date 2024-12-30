<template>
  <canvas
    ref="canvas"
    v-element-size="useThrottleFn((size: CanvasSize) => patternCanvas.resize(size), 500)"
    class="size-full"
  ></canvas>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";
  import { useThrottleFn } from "@vueuse/core";
  import { vElementSize } from "@vueuse/components";
  import { storeToRefs } from "pinia";
  import { Point } from "pixi.js";
  import { AddStitchEventStage, PatternCanvas, EventType } from "#/plugins/pixi";
  import type { AddStitchData, CanvasSize, RemoveStitchData } from "#/plugins/pixi";
  import { useAppStateStore } from "#/stores/state";
  import { usePatternsStore } from "#/stores/patterns";
  import {
    FullStitchKind,
    PartStitchKind,
    PartStitchDirection,
    LineStitchKind,
    NodeStitchKind,
  } from "#/schemas/pattern";
  import { type Stitch, type StitchKind, FullStitch, LineStitch, NodeStitch, PartStitch } from "#/schemas/pattern";

  const appStateStore = useAppStateStore();
  const patternProjectStore = usePatternsStore();
  const { pattern } = storeToRefs(patternProjectStore);

  const canvas = useTemplateRef("canvas");
  const patternCanvas = new PatternCanvas();

  watch(pattern, (view) => {
    if (!view) return;
    patternCanvas.setPatternView(view);
  });

  let prevStitchState: Stitch | undefined;
  patternCanvas.addEventListener(EventType.AddStitch, async (e) => {
    const tool = appStateStore.state.selectedStitchTool;
    const palindex = appStateStore.state.selectedPaletteItemIndex;
    if (palindex === undefined || palindex === null) return;

    // A start point is needed to draw the lines.
    // An end point is needed to draw all the other kinds of stitches (in addition to lines).
    const { stage, start, end, alt, fixed }: AddStitchData = (e as CustomEvent).detail;
    const { x, y } = adjustStitchCoordinate(end, tool);

    if (stage === AddStitchEventStage.Start) prevStitchState = undefined;
    switch (tool) {
      case FullStitchKind.Full:
      case FullStitchKind.Petite: {
        const full: FullStitch = { x, y, palindex, kind: tool };
        prevStitchState ??= { full };
        if (fixed && "full" in prevStitchState) {
          full.x = Math.trunc(x) + (prevStitchState.full.x - Math.trunc(prevStitchState.full.x));
          full.y = Math.trunc(y) + (prevStitchState.full.y - Math.trunc(prevStitchState.full.y));
        }
        await patternProjectStore.addStitch({ full });
        break;
      }

      case PartStitchKind.Half:
      case PartStitchKind.Quarter: {
        const [fracX, fracY] = [end.x % 1, end.y % 1];
        const direction =
          (fracX < 0.5 && fracY > 0.5) || (fracX > 0.5 && fracY < 0.5)
            ? PartStitchDirection.Forward
            : PartStitchDirection.Backward;
        const part: PartStitch = { x, y, palindex, kind: tool, direction };
        prevStitchState ??= { part };
        if (fixed && "part" in prevStitchState) {
          part.direction = prevStitchState.part.direction;
          if (tool === PartStitchKind.Quarter) {
            part.x = Math.trunc(x) + (prevStitchState.part.x - Math.trunc(prevStitchState.part.x));
            part.y = Math.trunc(y) + (prevStitchState.part.y - Math.trunc(prevStitchState.part.y));
          }
        }
        await patternProjectStore.addStitch({ part });
        break;
      }

      case LineStitchKind.Back: {
        const [_start, _end] = [adjustStitchCoordinate(start, tool), adjustStitchCoordinate(end, tool)];
        if (_start.equals(new Point()) || _end.equals(new Point())) return;
        const line: LineStitch = { x: [_start.x, _end.x], y: [_start.y, _end.y], palindex, kind: tool };
        if (stage === AddStitchEventStage.Continue && prevStitchState && "line" in prevStitchState) {
          line.x[0] = prevStitchState.line.x[1];
          line.y[0] = prevStitchState.line.y[1];
        }
        if (line.x[0] === line.x[1] && line.y[0] === line.y[1]) return;
        const lineLength = Math.sqrt(Math.pow(line.x[1] - line.x[0], 2) + Math.pow(line.y[1] - line.y[0], 2));
        // Check that the line is not longer than 1 horizontally and vertically, or it is diagonal.
        if (lineLength > 1 && lineLength !== Math.sqrt(2)) return;
        prevStitchState = { line };
        if (stage === AddStitchEventStage.Continue) await patternProjectStore.addStitch({ line });
        break;
      }

      case LineStitchKind.Straight: {
        const [_start, _end] = orderPoints(start, end);
        const { x: x1, y: y1 } = adjustStitchCoordinate(_start, tool);
        const { x: x2, y: y2 } = adjustStitchCoordinate(_end, tool);
        const line: LineStitch = { x: [x1, x2], y: [y1, y2], palindex, kind: tool };
        if (stage === AddStitchEventStage.End) await patternProjectStore.addStitch({ line });
        else patternCanvas.drawLineHint(line, pattern.value!.palette[palindex]!.color);
        break;
      }

      case NodeStitchKind.FrenchKnot:
      case NodeStitchKind.Bead: {
        const node: NodeStitch = {
          x,
          y,
          palindex,
          kind: tool,
          rotated: alt,
        };
        if (stage === AddStitchEventStage.End) await patternProjectStore.addStitch({ node });
        else {
          const palitem = pattern.value!.palette[palindex]!;
          patternCanvas.drawNodeHint(node, palitem.color, palitem.bead);
        }
        break;
      }
    }
  });

  patternCanvas.addEventListener(EventType.RemoveStitch, async (e) => {
    const detail: RemoveStitchData = (e as CustomEvent).detail;
    if ("stitch" in detail) await patternProjectStore.removeStitch(detail.stitch);
    else {
      // In this case we need to determine the stitch based on the point.
      // The simplest (but not so optimized) way is to try to remove all the possible simple stitches.
      // This is not the best way but we okay with it for now.
      const kind = detail.kind;
      const { x, y } = adjustStitchCoordinate(detail.point, kind);
      if (kind === FullStitchKind.Full || kind === FullStitchKind.Petite) {
        await patternProjectStore.removeStitch({ full: { x, y, kind, palindex: 0 } });
      } else if (kind === PartStitchKind.Half || kind === PartStitchKind.Quarter) {
        const [fractX, fractY] = [detail.point.x - Math.trunc(x), detail.point.y - Math.trunc(y)];
        const direction =
          (fractX < 0.5 && fractY > 0.5) || (fractX > 0.5 && fractY < 0.5)
            ? PartStitchDirection.Forward
            : PartStitchDirection.Backward;
        await patternProjectStore.removeStitch({ part: { x, y, kind, direction, palindex: 0 } });
      }
    }
  });

  function adjustStitchCoordinate({ x, y }: Point, tool: StitchKind): Point {
    const [intX, intY] = [Math.trunc(x), Math.trunc(y)];
    const [fracX, fracY] = [x - intX, y - intY];
    switch (tool) {
      case FullStitchKind.Full:
      case PartStitchKind.Half: {
        return new Point(intX, intY);
      }
      case FullStitchKind.Petite:
      case PartStitchKind.Quarter: {
        return new Point(fracX > 0.5 ? intX + 0.5 : intX, fracY > 0.5 ? intY + 0.5 : intY);
      }
      case LineStitchKind.Back: {
        if (fracX <= 0.25 && fracY <= 0.25) return new Point(intX, intY); // top-left
        if (fracX >= 0.75 && fracY <= 0.25) return new Point(intX + 1, intY); // top-right
        if (fracX <= 0.25 && fracY >= 0.75) return new Point(intX, intY + 1); // bottom-left
        if (fracX >= 0.75 && fracY >= 0.75) return new Point(intX + 1, intY + 1); // bottom-right
        return new Point(); // to not handle it
      }
      case LineStitchKind.Straight:
      case NodeStitchKind.FrenchKnot:
      case NodeStitchKind.Bead: {
        return new Point(
          fracX > 0.5 ? intX + 1 : fracX > 0.25 ? intX + 0.5 : intX,
          fracY > 0.5 ? intY + 1 : fracY > 0.25 ? intY + 0.5 : intY,
        );
      }
    }
  }

  /** Orders points so that is no way to draw two lines with the same coordinates. */
  function orderPoints(start: Point, end: Point): [Point, Point] {
    if (start.y < end.y || (start.y === end.y && start.x < end.x)) return [start, end];
    else return [end, start];
  }

  onMounted(async () => {
    await patternCanvas.init(canvas.value!.getBoundingClientRect(), { canvas: canvas.value! });
    patternCanvas.setPatternView(pattern.value!);
  });

  onUnmounted(() => {
    patternCanvas.clear();
  });
</script>
