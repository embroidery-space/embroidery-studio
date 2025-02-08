<!-- eslint-disable vue/no-v-html -->

<template>
  <div class="h-full flex items-center justify-center">
    <button
      class="h-full inline-flex items-center justify-center text-black hover:cursor-pointer active:bg-black/[.12] focus-visible:bg-black/[.06] hover:bg-black/[.06] dark:text-white dark:active:bg-white/[.12] dark:hover:bg-white/[.06]"
      :style="{ width: dt('button.icon.only.width') }"
      @click="appWindow.minimize()"
    >
      <span class="size-3 inline-flex items-center justify-center" v-html="WindowMinimizeIcon"></span>
    </button>

    <button
      class="h-full inline-flex items-center justify-center text-black hover:cursor-pointer active:bg-black/[.12] focus-visible:bg-black/[.06] hover:bg-black/[.06] dark:text-white dark:active:bg-white/[.12] dark:hover:bg-white/[.06]"
      :style="{ width: dt('button.icon.only.width') }"
      @click="appWindow.toggleMaximize()"
    >
      <span v-if="isMaximized" class="size-3 inline-flex items-center justify-center" v-html="WindowRestoreIcon"></span>
      <span v-else class="size-3 inline-flex items-center justify-center" v-html="WindowMaximizeIcon"></span>
    </button>

    <button
      class="h-full w-8 inline-flex items-center justify-center text-black hover:cursor-pointer active:bg-red-700 focus-visible:bg-red-600 hover:bg-red-600 dark:text-white focus-visible:text-white hover:text-white"
      :style="{ width: dt('button.icon.only.width') }"
      @click="appWindow.close()"
    >
      <span class="size-3 inline-flex items-center justify-center" v-html="WindowCloseIcon"></span>
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
