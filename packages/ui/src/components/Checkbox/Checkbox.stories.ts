import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import FormField from "../FormField/FormField.vue";

import Checkbox from "./Checkbox.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/Checkbox",
  component: Checkbox,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    label: "Checkbox",
    description: "Description",

    size: "md",
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { FormField, Checkbox },
      setup: () => ({ args, updateArgs }),
      template: `
        <FormField>
          <Checkbox v-bind="args" @update:model-value="(value) => updateArgs({ modelValue: value })" />
        </FormField>
      `,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { Checkbox },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Checkbox :size="size" :label="\`Size: \${size}\`" />
        </template>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { Checkbox },
    template: `
      <div class="flex flex-col gap-2">
        <Checkbox label="Default" />
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Checked" :model-value="true" />
        <Checkbox label="Checked disabled" :model-value="true" disabled />
      </div>
    `,
  }),
};

export const Checked: Story = {
  args: { label: "Checkbox", "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("checkbox"));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(true);
  },
};
