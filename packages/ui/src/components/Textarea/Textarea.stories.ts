import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import FormField from "../FormField/FormField.vue";

import Textarea from "./Textarea.vue";

const sizes = ["sm", "md", "lg"] as const;
const variants = ["subtle", "outline"] as const;

const meta = {
  title: "Form/Textarea",
  component: Textarea,
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: sizes },
    rows: { control: "number" },
    maxrows: { control: "number" },
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    variant: "subtle",
    size: "md",

    rows: 3,
    maxrows: 0,

    autoresize: false,
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { FormField, Textarea },
      setup: () => ({ args, updateArgs }),
      template: `
        <FormField>
          <Textarea v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />
        </FormField>
      `,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { Textarea },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Textarea :size="size" :model-value="\`Size: \${size}\`" />
        </template>
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { Textarea },
    setup: () => ({ variants }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="variant in variants" :key="variant">
          <Textarea :model-value="\`Variant: \${variant}\`" :variant="variant" />
        </template>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { Textarea },
    template: `
      <div class="flex flex-col gap-2">
        <Textarea model-value="Default" />
        <Textarea model-value="Disabled" disabled />
      </div>
    `,
  }),
};

export const Filled: Story = {
  args: { "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.type(canvas.getByRole("textbox"), "Hello, World!");
    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith("Hello, World!");
  },
};
