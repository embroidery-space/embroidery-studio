<!-- eslint-disable vue/no-v-html -->

<template>
  <div class="relative">
    <Button
      ref="button"
      :text="!selected"
      severity="secondary"
      class="border-none p-1.5"
      :style="{ color: selected && color ? color.toHex() : dt('text.muted.color') }"
    >
      <div class="size-6" v-html="currentOption.icon"></div>
    </Button>

    <Button
      text
      severity="contrast"
      class="absolute bottom-0 right-0 z-auto rounded-sm border-none p-0"
      @click.stop="toggleMenu"
    >
      <i class="pi pi-angle-down translate-x-0.5 translate-y-0.5 -rotate-45 text-xs"></i>
    </Button>
  </div>

  <Menu
    ref="menu"
    :model="
      options.map((option) => ({
        ...option,
        command: () => {
          currentOption = option;
          emit('update:modelValue', option.value);
        },
      }))
    "
    pt:root:class="min-w-fit"
    popup
  >
    <template #item="{ item }">
      <a
        class="flex items-center p-1"
        @pointerup="
          () => {
            currentOption = item as ToolOption;
            emit('update:modelValue', item.value);
            menu!.hide();
          }
        "
      >
        <span class="mr-2 size-6" v-html="item.icon" />
        <span>{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>

<script setup lang="ts">
  import { ref, computed, useTemplateRef, type MaybeRefOrGetter } from "vue";
  import { Button, Menu } from "primevue";
  import { dt } from "@primevue/themes";
  import { useAppStateStore } from "#/stores/state";
  import { usePreferencesStore } from "#/stores/preferences";
  import { usePatternsStore } from "#/stores/patterns";
  import { unrefElement, useEventListener } from "@vueuse/core";

  interface ToolOption {
    icon: string;
    label: string;
    value: unknown;
  }

  const props = defineProps<{ modelValue: unknown; options: ToolOption[] }>();
  const emit = defineEmits(["update:modelValue"]);

  const appStateStore = useAppStateStore();
  const preferencesStore = usePreferencesStore();
  const patternsStore = usePatternsStore();

  const currentOption = ref<ToolOption>(props.options[0]!);
  const selected = computed(() => props.modelValue === currentOption.value.value);

  const color = computed(() => {
    const palindex = appStateStore.state.selectedPaletteItemIndex;
    if (!preferencesStore.usePaletteItemColorForStitchTools || !patternsStore.pattern || palindex === null) return;
    return patternsStore.pattern.palette[palindex]!.color;
  });

  const menu = useTemplateRef("menu");
  const buttonRef = useTemplateRef("button") as MaybeRefOrGetter; // Suppress the error by casting to `MaybeRefOrGetter`.
  const buttonElement = computed(() => unrefElement(buttonRef));

  let timeout: ReturnType<typeof setTimeout> | undefined;
  let hasLongPressed = false;

  useEventListener(buttonRef, "pointerdown", (e) => {
    clearLongPress();
    timeout = setTimeout(() => {
      hasLongPressed = true;
      longPressHandler(e, hasLongPressed);
    }, 500);
  });
  useEventListener(buttonRef, "pointerup", (e) => {
    longPressHandler(e, hasLongPressed);
    clearLongPress();
  });

  function clearLongPress() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    hasLongPressed = false;
  }

  function longPressHandler(e: PointerEvent, isLongPress: boolean) {
    if ((e.button === 0 && isLongPress) || e.button === 2) toggleMenu(e);
    else emit("update:modelValue", currentOption.value.value);
  }

  function toggleMenu(e: Event) {
    // This is a workaround to attach the menu to the right element (the main button element)
    // and to avoid issues that the `event.currentTarget` is `null` because it is used outside the event handler.
    const event = { ...e, currentTarget: buttonElement.value };
    menu.value!.toggle(event);
  }
</script>
