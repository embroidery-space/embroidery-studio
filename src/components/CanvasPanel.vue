<template>
  <canvas
    ref="canvas"
    v-element-size="useThrottleFn((size: CanvasSize) => canvasService.resize(size), 500)"
    class="size-full"
  ></canvas>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";
  import { useThrottleFn } from "@vueuse/core";
  import { vElementSize } from "@vueuse/components";
  import { Point } from "pixi.js";
  import { CanvasService, type CanvasSize } from "#/services/canvas/canvas.service";
  import { AddStitchEventStage, EventType } from "#/services/canvas/events.types";
  import type { AddStitchData, RemoveStitchData } from "#/services/canvas/events.types";
  import { useAppStateStore } from "#/stores/state";
  import { usePatternProjectStore } from "#/stores/patproj";
  import {
    FullStitchKind,
    PartStitchKind,
    PartStitchDirection,
    LineStitchKind,
    NodeStitchKind,
  } from "#/schemas/pattern";
  import type { Stitch, StitchKind, FullStitch, LineStitch, NodeStitch, PartStitch } from "#/schemas/pattern";
  import { storeToRefs } from "pinia";

  const appStateStore = useAppStateStore();
  const patternProjectStore = usePatternProjectStore();
  const { patproj } = storeToRefs(patternProjectStore);

  const canvas = useTemplateRef("canvas");
  const canvasService = new CanvasService();

  // Triggers on the entire pattern project change (e.g. opening of the new pattern).
  watch(patproj, (patproj) => canvasService.drawPattern(patproj!));

  // Triggers on the change of the fabric of the pattern project.
  watch(
    () => patproj.value?.pattern.fabric,
    (fabric) => {
      if (!patproj.value || !fabric) return;
      canvasService.drawFabric(fabric);
      canvasService.drawGrid(fabric.width, fabric.height, patproj.value.displaySettings.grid);
    },
  );

  let prevStitchState: Stitch | undefined;
  canvasService.addEventListener(EventType.AddStitch, async (e) => {
    const palindex = appStateStore.state.selectedPaletteItemIndex;
    if (palindex === undefined) return;
    const tool = appStateStore.state.selectedStitchTool;

    // A start point is needed to draw the lines.
    // An end point is needed to draw all the other kinds of stitches (in addition to lines).
    const { stage, start, end, alt, fixed }: AddStitchData = (e as CustomEvent).detail;
    const { x, y } = adjustStitchCoordinate(end, tool);

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
        else canvasService.drawLine(line, patproj.value!.pattern.palette[palindex]!, true);
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
        else canvasService.drawNode(node, patproj.value!.pattern.palette[palindex]!, true);
        break;
      }
    }

    if (stage === AddStitchEventStage.End) prevStitchState = undefined;
  });

  canvasService.addEventListener(EventType.RemoveStitch, async (e) => {
    const stitch: RemoveStitchData = (e as CustomEvent).detail;
    await patternProjectStore.removeStitch(stitch);
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

  patternProjectStore.$onAction(async ({ name, args }) => {
    if (name === "addStitch") {
      const [stitch, isLocal] = args;
      if (!isLocal) return;
      const palette = patproj.value!.pattern.palette;
      if ("full" in stitch) canvasService.drawFullStitch(stitch.full, palette[stitch.full.palindex]!);
      if ("part" in stitch) canvasService.drawPartStitch(stitch.part, palette[stitch.part.palindex]!);
      if ("line" in stitch) canvasService.drawLine(stitch.line, palette[stitch.line.palindex]!);
      if ("node" in stitch) canvasService.drawNode(stitch.node, palette[stitch.node.palindex]!);
    }

    if (name === "removeStitch") {
      const [stitch, isLocal] = args;
      if (!isLocal) return;
      if ("full" in stitch) canvasService.removeFullStitch(stitch.full);
      if ("part" in stitch) canvasService.removePartStitch(stitch.part);
      if ("line" in stitch) canvasService.removeLine(stitch.line);
      if ("node" in stitch) canvasService.removeNode(stitch.node);
    }
  });

  onMounted(async () => {
    const { width, height } = canvas.value!.getBoundingClientRect();
    await canvasService.init({ width, height, canvas: canvas.value! });
    canvasService.drawPattern(patproj.value!);

    window.addEventListener(
      "resize",
      useThrottleFn(() => {
        if (!canvas.value) return;
        canvasService.resize(canvas.value.getBoundingClientRect());
      }, 500),
    );
  });

  onUnmounted(() => {
    canvasService.clearPattern();
  });
</script>
