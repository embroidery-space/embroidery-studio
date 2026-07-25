import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";

import FormField from "../FormField/FormField.vue";

import Switch from "./Switch.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/Switch",
  component: Switch,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    label: "Switch",
    description: "Description",

    size: "md",
    disabled: false,
  },
  render: (args) => ({
    components: { FormField, Switch },
    setup: () => ({ args }),
    template: `
      <FormField>
        <Switch v-bind="args" />
      </FormField>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Switch :size="size" :label="\`Size: \${size}\`" />
        </template>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { Switch },
    template: `
      <div class="flex flex-col gap-2">
        <Switch label="Default" />
        <Switch label="Disabled" disabled />
        <Switch label="Checked" :model-value="true" />
        <Switch label="Checked disabled" :model-value="true" disabled />
      </div>
    `,
  }),
};

export const Checked: Story = {
  args: {
    label: "Switch",
    "onUpdate:modelValue": fn(),
  },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("switch"));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(true);
  },
};
