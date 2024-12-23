import { getCurrentWindow } from "@tauri-apps/api/window";
import { open, save } from "@tauri-apps/plugin-dialog";
import { defineAsyncComponent, ref, shallowRef, triggerRef } from "vue";
import { useMagicKeys, whenever } from "@vueuse/core";
import { useDialog } from "primevue";
import { defineStore } from "pinia";
import { dequal } from "dequal/lite";
import { useAppStateStore } from "./state";
import { FabricApi, HistoryApi, PathApi, PatternApi, StitchesApi } from "#/api";
import type { PatternProject, PaletteItem, Symbols, Formats, Stitch, Fabric } from "#/schemas/pattern";

export const usePatternProjectStore = defineStore("pattern-project", ({ action }) => {
  const appWindow = getCurrentWindow();

  const dialog = useDialog();
  const FabricProperties = defineAsyncComponent(() => import("#/components/dialogs/FabricProperties.vue"));

  const appStateStore = useAppStateStore();

  const loading = ref(false);
  const patproj = shallowRef<PatternProject>();

  async function loadPattern() {
    const path = await open({
      defaultPath: await PathApi.getAppDocumentDir(),
      multiple: false,
      filters: [
        {
          name: "Cross-Stitch Pattern",
          extensions: ["xsd", "oxs", "xml", "embproj"],
        },
      ],
    });
    if (path === null || Array.isArray(path)) return;
    await openPattern(path);
  }

  async function openPattern(pathOrKey: string) {
    try {
      loading.value = true;
      patproj.value = await PatternApi.loadPattern(pathOrKey);
      appStateStore.addOpenedPattern(patproj.value.pattern.info.title, patproj.value.key);
    } finally {
      loading.value = false;
    }
  }

  function createPattern() {
    dialog.open(FabricProperties, {
      props: {
        header: "Fabric Properties",
        modal: true,
      },
      onClose: async (options) => {
        if (!options?.data) return;
        const { fabric } = options.data;
        try {
          loading.value = true;
          patproj.value = await PatternApi.createPattern(fabric);
          appStateStore.addOpenedPattern(patproj.value.pattern.info.title, patproj.value.key);
        } finally {
          loading.value = false;
        }
      },
    });
  }

  async function savePattern() {
    if (!patproj.value) return;
    try {
      const path = await save({
        defaultPath: await PatternApi.getPatternFilePath(patproj.value.key),
        filters: [
          {
            name: "Cross-Stitch Pattern",
            extensions: ["oxs", "embproj"],
          },
        ],
      });
      if (path === null) return;
      loading.value = true;
      await PatternApi.savePattern(patproj.value.key, path);
    } finally {
      loading.value = false;
    }
  }

  async function closePattern() {
    if (!patproj.value) return;
    try {
      loading.value = true;
      await PatternApi.closePattern(patproj.value.key);
      appStateStore.removeCurrentPattern();
      if (!appStateStore.state.currentPattern) patproj.value = undefined;
      else await openPattern(appStateStore.state.currentPattern.key);
    } finally {
      loading.value = false;
    }
  }

  function updateFabric() {
    if (!patproj.value) return;
    dialog.open(FabricProperties, {
      props: {
        header: "Fabric Properties",
        modal: true,
      },
      data: { fabric: patproj.value.pattern.fabric },
      onClose: async (options) => {
        if (!options?.data) return;
        const { fabric } = options.data;
        await FabricApi.updateFabric(patproj.value!.key, fabric);
      },
    });
  }
  appWindow.listen<Fabric>("fabric:update", ({ payload }) => {
    if (!patproj.value) return;
    patproj.value.pattern.fabric = payload;
    triggerRef(patproj);
  });

  async function addPaletteItem(palitem: PaletteItem) {
    if (!patproj.value) return;
    await PatternApi.addPaletteItem(patproj.value.key, palitem);
  }
  appWindow.listen<{
    paletteItem: PaletteItem;
    palindex: number;
    symbols: Symbols;
    formats: Formats;
  }>("palette:add_palette_item", ({ payload }) => {
    if (!patproj.value) return;
    const { paletteItem, palindex, symbols, formats } = payload;
    patproj.value.pattern.palette.splice(palindex, 0, paletteItem);
    patproj.value.displaySettings.symbols.splice(palindex, 0, symbols);
    patproj.value.displaySettings.formats.splice(palindex, 0, formats);
    triggerRef(patproj);
  });

  async function removePaletteItem(palitem: PaletteItem) {
    if (!patproj.value) return;
    await PatternApi.removePaletteItem(patproj.value.key, palitem);
  }
  appWindow.listen<number>("palette:remove_palette_item", ({ payload }) => {
    if (!patproj.value) return;
    const palindex = payload;
    patproj.value.pattern.palette.splice(palindex, 1);
    patproj.value.displaySettings.symbols.splice(palindex, 1);
    patproj.value.displaySettings.formats.splice(palindex, 1);
    triggerRef(patproj);
  });

  // These are special actions that are tracked to using `store.$onAction`.
  // We use the `action`, which is probably the internal feature, to make the call visible to the hook.
  // If you declare and call these action as normal functions, they will not be tracked if the called inside the store.
  const addStitch = action(async (stitch: Stitch, local: boolean = false) => {
    if (!patproj.value) return;
    if (local) {
      if ("full" in stitch) patproj.value.pattern.fullstitches.push(stitch.full);
      if ("part" in stitch) patproj.value.pattern.partstitches.push(stitch.part);
      if ("line" in stitch) patproj.value.pattern.lines.push(stitch.line);
      if ("node" in stitch) patproj.value.pattern.nodes.push(stitch.node);
    } else await StitchesApi.addStitch(patproj.value.key, stitch);
  });
  const removeStitch = action(async (stitch: Stitch, local: boolean = false) => {
    if (!patproj.value) return;
    if (local) {
      if ("full" in stitch) {
        const index = patproj.value.pattern.fullstitches.findIndex((fs) => dequal(fs, stitch.full));
        patproj.value.pattern.fullstitches.splice(index, 1);
      }
      if ("part" in stitch) {
        const index = patproj.value.pattern.partstitches.findIndex((ps) => dequal(ps, stitch.part));
        patproj.value.pattern.partstitches.splice(index, 1);
      }
      if ("line" in stitch) {
        const index = patproj.value.pattern.lines.findIndex((line) => dequal(line, stitch.line));
        patproj.value.pattern.lines.splice(index, 1);
      }
      if ("node" in stitch) {
        const index = patproj.value.pattern.nodes.findIndex((node) => dequal(node, stitch.node));
        patproj.value.pattern.nodes.splice(index, 1);
      }
    } else await StitchesApi.removeStitch(patproj.value.key, stitch);
  });
  appWindow.listen<Stitch>("stitches:add_one", ({ payload }) => addStitch(payload, true));
  appWindow.listen<Stitch[]>("stitches:add_many", ({ payload }) => {
    for (const stitch of payload) addStitch(stitch, true);
  });
  appWindow.listen<Stitch>("stitches:remove_one", ({ payload }) => removeStitch(payload, true));
  appWindow.listen<Stitch[]>("stitches:remove_many", ({ payload }) => {
    for (const stitch of payload) removeStitch(stitch, true);
  });

  const keys = useMagicKeys();
  whenever(keys.ctrl_z!, async () => {
    if (!patproj.value) return;
    await HistoryApi.undo(patproj.value.key);
  });
  whenever(keys.ctrl_y!, async () => {
    if (!patproj.value) return;
    await HistoryApi.redo(patproj.value.key);
  });

  return {
    loading,
    patproj,
    loadPattern,
    openPattern,
    createPattern,
    savePattern,
    closePattern,
    updateFabric,
    addPaletteItem,
    removePaletteItem,
    addStitch,
    removeStitch,
  };
});
