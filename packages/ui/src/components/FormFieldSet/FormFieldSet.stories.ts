import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import Input from "../Input/Input.vue";

import FormFieldSet from "./FormFieldSet.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/FormFieldSet",
  component: FormFieldSet,
  argTypes: {
    legend: { control: "text" },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof FormFieldSet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    legend: "Legend",
    size: "lg",
    collapsible: false,
  },
  render: (args) => ({
    components: { FormFieldSet, Input },
    setup: () => ({ args }),
    template: `
      <FormFieldSet v-bind="args" class="w-sm">
        <div class="grid grid-cols-2 gap-4">
          <Input placeholder="Enter value" class="w-full" />
          <Input placeholder="Enter value" class="w-full" />
          <Input placeholder="Enter value" class="w-full" />
          <Input placeholder="Enter value" class="w-full" />
        </div>
      </FormFieldSet>
    `,
  }),
};

export const Sizes: Story = {
  args: { legend: "Legend" },
  render: () => ({
    components: { FormFieldSet, Input },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-4">
        <FormFieldSet v-for="size in sizes" :key="size" :legend="\`Size: \${size}\`" :size="size">
          <Input placeholder="Input" class="w-full" />
        </FormFieldSet>
      </div>
    `,
  }),
};

export const Collapsed: Story = {
  args: { legend: "Legend", collapsible: true, open: false },
  render: (args) => ({
    components: { FormFieldSet, Input },
    setup: () => ({ args }),
    template: `
      <FormFieldSet v-bind="args" class="w-sm">
        <Input placeholder="Enter value" class="w-full" />
      </FormFieldSet>
    `,
  }),
};

export const Collapsible: Story = {
  args: { legend: "Legend", collapsible: true },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => ({
    components: { FormFieldSet, Input },
    setup: () => ({ args }),
    template: `
      <FormFieldSet v-bind="args" class="w-sm">
        <Input placeholder="Enter value" class="w-full" />
      </FormFieldSet>
    `,
  }),
  async play({ canvas, userEvent }) {
    const trigger = canvas.getByRole("button");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};
