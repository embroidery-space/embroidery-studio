import type { ToolSelectItem } from "@embroiderly/ui";

import { computed } from "vue";

import {
  IconCursor,
  IconEraser,
  IconStitchBack,
  IconStitchBead,
  IconStitchFrenchKnot,
  IconStitchFull,
  IconStitchHalf,
  IconStitchHalfBackward,
  IconStitchHalfForward,
  IconStitchPetite,
  IconStitchPetiteBL,
  IconStitchPetiteBR,
  IconStitchPetiteTL,
  IconStitchPetiteTR,
  IconStitchQuarter,
  IconStitchQuarterBL,
  IconStitchQuarterBR,
  IconStitchQuarterTL,
  IconStitchQuarterTR,
  IconStitchStraight,
} from "~/assets/icons/";
import { tools } from "~/lib/tools/";

import { useI18n } from "./useI18n.ts";

/** Shared tool items definition. */
export function useToolItems() {
  const { fluent } = useI18n();

  const fullstitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.FullStitch,
      label: fluent.$t("stitch-full"),
      icon: IconStitchFull,
      shortcut: "F",
    },
  ]);

  const petitestitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.PetiteStitch,
      label: fluent.$t("stitch-petite"),
      icon: IconStitchPetite,
      shortcut: "P",
    },
    {
      value: tools.PetiteStitchTL,
      label: fluent.$t("stitch-petite-tl"),
      icon: IconStitchPetiteTL,
      shortcut: "P-T-L",
    },
    {
      value: tools.PetiteStitchTR,
      label: fluent.$t("stitch-petite-tr"),
      icon: IconStitchPetiteTR,
      shortcut: "P-T-R",
    },
    {
      value: tools.PetiteStitchBR,
      label: fluent.$t("stitch-petite-br"),
      icon: IconStitchPetiteBR,
      shortcut: "P-B-R",
    },
    {
      value: tools.PetiteStitchBL,
      label: fluent.$t("stitch-petite-bl"),
      icon: IconStitchPetiteBL,
      shortcut: "P-B-L",
    },
  ]);

  const halfstitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.HalfStitch,
      label: fluent.$t("stitch-half"),
      icon: IconStitchHalf,
      shortcut: "H",
    },
    {
      value: tools.HalfStitchForward,
      label: fluent.$t("stitch-half-forward"),
      icon: IconStitchHalfForward,
      shortcut: "H-F",
    },
    {
      value: tools.HalfStitchBackward,
      label: fluent.$t("stitch-half-backward"),
      icon: IconStitchHalfBackward,
      shortcut: "H-B",
    },
  ]);

  const quarterstitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.QuarterStitch,
      label: fluent.$t("stitch-quarter"),
      icon: IconStitchQuarter,
      shortcut: "Q",
    },
    {
      value: tools.QuarterStitchTL,
      label: fluent.$t("stitch-quarter-tl"),
      icon: IconStitchQuarterTL,
      shortcut: "Q-T-L",
    },
    {
      value: tools.QuarterStitchTR,
      label: fluent.$t("stitch-quarter-tr"),
      icon: IconStitchQuarterTR,
      shortcut: "Q-T-R",
    },
    {
      value: tools.QuarterStitchBR,
      label: fluent.$t("stitch-quarter-br"),
      icon: IconStitchQuarterBR,
      shortcut: "Q-B-R",
    },
    {
      value: tools.QuarterStitchBL,
      label: fluent.$t("stitch-quarter-bl"),
      icon: IconStitchQuarterBL,
      shortcut: "Q-B-L",
    },
  ]);

  const linestitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.BackStitch,
      label: fluent.$t("stitch-back"),
      icon: IconStitchBack,
      shortcut: "S",
    },
    {
      value: tools.StraightStitch,
      label: fluent.$t("stitch-straight"),
      icon: IconStitchStraight,
      shortcut: "S-S",
    },
  ]);

  const nodestitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.FrenchKnot,
      label: fluent.$t("stitch-french-knot"),
      icon: IconStitchFrenchKnot,
      shortcut: "K",
    },
    {
      value: tools.Bead,
      label: fluent.$t("stitch-bead"),
      icon: IconStitchBead,
      shortcut: "J",
    },
  ]);

  const eraser = computed<ToolSelectItem[]>(() => [
    {
      value: tools.Eraser,
      label: fluent.$t("palette-toolbar-eraser"),
      icon: IconEraser,
      shortcut: "E",
    },
  ]);

  const cursor = computed<ToolSelectItem[]>(() => [
    {
      value: tools.Cursor,
      label: fluent.$t("palette-toolbar-cursor"),
      icon: IconCursor,
      shortcut: "C",
    },
  ]);

  return { fullstitches, petitestitches, halfstitches, quarterstitches, linestitches, nodestitches, eraser, cursor };
}
