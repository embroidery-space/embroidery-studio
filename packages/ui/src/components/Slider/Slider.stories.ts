import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";

import FormField from "../FormField/FormField.vue";

import Slider from "./Slider.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/Slider",
  component: Slider,
  argTypes: {
    size: { control: "select", options: sizes },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: 50,

    min: 0,
    max: 100,
    step: 1,

    size: "md",
    tooltip: false,
    disabled: false,
  },
  render: (args) => ({
    components: { FormField, Slider },
    setup: () => ({ args }),
    template: `
      <FormField>
        <div class="w-64">
          <Slider v-bind="args" />
        </div>
      </FormField>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Slider },
    setup: () => ({ sizes }),
    template: `
      <div class="flex w-64 flex-col gap-4">
        <template v-for="size in sizes" :key="size">
          <div class="space-y-2">
            <span class="block text-xs text-dimmed">Size: {{ size }}</span>
            <Slider :size="size" />
          </div>
        </template>
      </div>
    `,
  }),
};

export const Changed: Story = {
  args: { modelValue: 50, "onUpdate:modelValue": fn() },
  render: (args) => ({
    components: { Slider },
    setup: () => ({ args }),
    template: `
      <div class="w-64">
        <Slider v-bind="args" />
      </div>
    `,
  }),
  async play({ canvas, userEvent, args }) {
    // Focus the thumb directly: clicking the slider triggers `setPointerCapture` with an invalid pointer id in the test browser.
    canvas.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(51);
  },
};
