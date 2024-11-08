<template>
  <ConfirmDialog />
  <BlockUI :blocked="loading" full-screen />
  <div class="flex h-full flex-col">
    <Toolbar data-tauri-drag-region class="rounded-none border-0 border-b p-0">
      <template #start>
        <DropdownTieredMenu id="general_menu" :button="{ icon: 'pi pi-bars' }" :tiered-menu="{ model: menuOptions }" />
        <StitchToolSelector />
      </template>

      <template v-if="appStateStore.state.openedPatterns?.length" #center>
        <PatternSelector
          @switch="
            (patternPath) => {
              loadPattern(patternPath);
              // TODO: Store the selected palette item per opened pattern.
              appStateStore.state.selectedPaletteItem = undefined;
            }
          "
        />
      </template>

      <template #end>
        <Suspense>
          <WindowControls />
        </Suspense>
      </template>
    </Toolbar>

    <Splitter :gutter-size="2" class="h-full rounded-none border-0">
      <SplitterPanel :min-size="5" :size="15">
        <PalettePanel :palette="patproj?.pattern?.palette" />
      </SplitterPanel>

      <SplitterPanel :min-size="85" :size="85">
        <ProgressSpinner v-if="loading" class="absolute left-1/2 top-1/2" />
        <Suspense v-if="patproj?.pattern"><CanvasPanel :patproj="patproj" /></Suspense>
        <div v-else class="relative flex h-full w-full items-center justify-center">
          <Panel header="No pattern loaded" class="w-3/12 border-0">
            <p class="m-0">Open a pattern or create a new one to get started.</p>
          </Panel>

          <!-- Credits -->
          <div class="absolute bottom-0 w-full">
            <p class="my-2 text-center text-xs">
              Developed with love in Ukraine | GNU General Public License v3.0 or later
            </p>
          </div>
        </div>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from "vue";
  import BlockUI from "primevue/blockui";
  import Panel from "primevue/panel";
  import ConfirmDialog from "primevue/confirmdialog";
  import ProgressSpinner from "primevue/progressspinner";
  import Splitter from "primevue/splitter";
  import SplitterPanel from "primevue/splitterpanel";
  import Toolbar from "primevue/toolbar";
  import { useConfirm } from "primevue/useconfirm";
  import type { MenuItem } from "primevue/menuitem";
  import { open, save } from "@tauri-apps/plugin-dialog";
  import CanvasPanel from "./components/CanvasPanel.vue";
  import PalettePanel from "./components/PalettePanel.vue";
  import DropdownTieredMenu from "./components/toolbar/DropdownTieredMenu.vue";
  import PatternSelector from "./components/toolbar/PatternSelector.vue";
  import StitchToolSelector from "./components/toolbar/StitchToolSelector.vue";
  import WindowControls from "./components/toolbar/WindowControls.vue";
  import { useAppStateStore } from "./stores/state";
  import { usePreferencesStore } from "./stores/preferences";
  import * as patternApi from "./api/pattern";
  import type { PatternProject } from "./types/pattern/project";
  import * as pathApi from "./api/path";

  const appStateStore = useAppStateStore();
  const preferencesStore = usePreferencesStore();

  const loading = ref(false);
  const patproj = ref<PatternProject>();

  const confirm = useConfirm();

  const fileOptions: MenuItem = {
    label: "File",
    icon: "pi pi-file",
    items: [
      {
        label: "Open",
        icon: "pi pi-file",
        command: async () => {
          const path = await open({
            defaultPath: await pathApi.getAppDocumentDir(),
            multiple: false,
            filters: [
              {
                name: "Cross-Stitch Pattern",
                extensions: ["xsd", "oxs", "xml", "embproj"],
              },
            ],
          });
          if (path === null || Array.isArray(path)) return;
          await loadPattern(path);
        },
      },
      {
        label: "Create",
        icon: "pi pi-file-plus",
        command: createPattern,
      },
      {
        label: "Save As",
        icon: "pi pi-copy",
        command: async () => {
          const currentPattern = appStateStore.state.currentPattern;
          if (!currentPattern) return;
          const path = await save({
            defaultPath: await patternApi.getPatternFilePath(currentPattern.key),
            filters: [
              {
                name: "Cross-Stitch Pattern",
                extensions: ["oxs", "embproj"],
              },
            ],
          });
          if (path === null) return;
          await savePattern(currentPattern.key, path);
        },
      },
      {
        label: "Close",
        icon: "pi pi-times",
        command: async () => {
          // TODO: Implement a confirmation dialog.
          if (!appStateStore.state.currentPattern) return;
          await patternApi.closePattern(appStateStore.state.currentPattern.key);
          appStateStore.removeCurrentPattern();
          if (!appStateStore.state.currentPattern) patproj.value = undefined;
          else await loadPattern(appStateStore.state.currentPattern.key);
        },
      },
    ],
  };
  const preferencesOptions: MenuItem = {
    label: "Preferences",
    icon: "pi pi-cog",
    items: [
      {
        label: "Theme",
        icon: "pi pi-palette",
        items: [
          {
            label: "Light",
            icon: "pi pi-sun",
            command: () => preferencesStore.setTheme("light"),
          },
          {
            label: "Dark",
            icon: "pi pi-moon",
            command: () => preferencesStore.setTheme("dark"),
          },
          {
            label: "System",
            icon: "pi pi-desktop",
            command: () => preferencesStore.setTheme("system"),
          },
        ],
      },
    ],
  };
  const menuOptions = ref<MenuItem[]>([fileOptions, preferencesOptions]);

  onMounted(async () => {
    await preferencesStore.setTheme(preferencesStore.theme);
    const currentPattern = appStateStore.state.currentPattern;
    if (currentPattern) await loadPattern(currentPattern.key);
  });

  async function loadPattern(path: string) {
    try {
      loading.value = true;
      patproj.value = await patternApi.loadPattern(path);
      appStateStore.addOpenedPattern(patproj.value!.pattern.info.title, path);
    } catch (err) {
      confirm.require({
        header: "Error",
        message: err as string,
        icon: "pi pi-info-circle",
        acceptLabel: "OK",
        acceptProps: { outlined: true },
        rejectLabel: "Cancel",
        rejectProps: { severity: "secondary", outlined: true },
      });
    } finally {
      loading.value = false;
    }
  }

  // TODO: Create a new pattern with a user defined data (properties, info, fabric, etc.).
  async function createPattern() {
    loading.value = true;
    const { key, pattern: pat } = await patternApi.createPattern();
    patproj.value = pat;
    appStateStore.addOpenedPattern(patproj.value!.pattern.info.title, key);
    loading.value = false;
  }

  async function savePattern(key: string, path: string) {
    try {
      loading.value = true;
      await patternApi.savePattern(key, path);
    } catch (err) {
      confirm.require({
        header: "Error",
        message: err as string,
        icon: "pi pi-info-circle",
        acceptLabel: "OK",
        acceptProps: { outlined: true },
        rejectLabel: "Cancel",
        rejectProps: { severity: "secondary", outlined: true },
      });
    } finally {
      loading.value = false;
    }
  }
</script>
