<!-- eslint-disable vue/no-v-html -->

<template>
  <div class="flex h-full items-center justify-center">
    <button
      class="inline-flex h-full items-center justify-center text-black hover:cursor-pointer hover:bg-black/[.06] focus-visible:bg-black/[.06] active:bg-black/[.12] dark:text-white dark:hover:bg-white/[.06] dark:active:bg-white/[.12]"
      :style="{ width: dt('button.icon.only.width') }"
      @click="appWindow.minimize()"
    >
      <span class="inline-flex size-3 items-center justify-center" v-html="WindowMinimizeIcon"></span>
    </button>

    <button
      class="inline-flex h-full items-center justify-center text-black hover:cursor-pointer hover:bg-black/[.06] focus-visible:bg-black/[.06] active:bg-black/[.12] dark:text-white dark:hover:bg-white/[.06] dark:active:bg-white/[.12]"
      :style="{ width: dt('button.icon.only.width') }"
      @click="appWindow.toggleMaximize()"
    >
      <span v-if="isMaximized" class="inline-flex size-3 items-center justify-center" v-html="WindowRestoreIcon"></span>
      <span v-else class="inline-flex size-3 items-center justify-center" v-html="WindowMaximizeIcon"></span>
    </button>

    <button
      class="inline-flex h-full w-8 items-center justify-center text-black hover:cursor-pointer hover:bg-red-600 hover:text-white focus-visible:bg-red-600 focus-visible:text-white active:bg-red-700 dark:text-white"
      :style="{ width: dt('button.icon.only.width') }"
      @click="appWindow.close()"
    >
      <span class="inline-flex size-3 items-center justify-center" v-html="WindowCloseIcon"></span>
    </button>
  </div>
</template>

<script setup lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { dt } from "@primevue/themes";
  import { onUnmounted, ref } from "vue";

  import WindowMinimizeIcon from "#/assets/icons/window-controls/minimize.svg?raw";
  import WindowMaximizeIcon from "#/assets/icons/window-controls/maximize.svg?raw";
  import WindowRestoreIcon from "#/assets/icons/window-controls/restore.svg?raw";
  import WindowCloseIcon from "#/assets/icons/window-controls/close.svg?raw";

  // New window is maximized by default.
  const isMaximized = ref(true);

  const appWindow = getCurrentWindow();
  const maxWindowSize = await appWindow.innerSize();

  const unlistenResized = await appWindow.onResized(({ payload }) => {
    // For some reason, the event is fired twice on Linux.
    // This is a workaround to prevent the icon from flickering.
    isMaximized.value = maxWindowSize.width === payload.width && maxWindowSize.height === payload.height;
  });

  onUnmounted(() => {
    unlistenResized();
  });
</script>
