import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";

import FormField from "../FormField/FormField.vue";

import InputColor from "./InputColor.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/InputColor",
  component: InputColor,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof InputColor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: "FF0000",
    size: "md",
    disabled: false,
  },
  render: (args) => ({
    components: { FormField, InputColor },
    setup: () => ({ args }),
    template: `
      <FormField>
        <InputColor v-bind="args" />
      </FormField>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { InputColor },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <InputColor :size="size" />
        </template>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { InputColor },
    template: `
      <div class="flex flex-col gap-2">
        <InputColor />
        <InputColor disabled />
      </div>
    `,
  }),
};

export const Updated: Story = {
  args: { modelValue: "FF0000", "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    const input = canvas.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "#00FF00");
    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith("00FF00");
  },
};
