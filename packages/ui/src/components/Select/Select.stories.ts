import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import FormField from "../FormField/FormField.vue";

import Select from "./Select.vue";
import type { SelectItem } from "./Select.vue";

const sizes = ["sm", "md", "lg"] as const;
const variants = ["subtle", "outline"] as const;

const items: SelectItem[] = [
  { label: "Backlog", value: "backlog" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Done", value: "done" },
  { label: "Cancelled", value: "cancelled" },
];

const richItems: SelectItem[][] = [
  [
    { type: "label", label: "Active" },
    { label: "Backlog", value: "backlog", icon: "lucide:circle-dashed" },
    { label: "Todo", value: "todo", icon: "lucide:circle" },
    { label: "In Progress", value: "in-progress", icon: "lucide:circle-half" },
  ],
  [
    { type: "label", label: "Closed" },
    { label: "Done", value: "done", icon: "lucide:circle-check" },
    { label: "Cancelled", value: "cancelled", icon: "lucide:circle-x", disabled: true },
  ],
];

const meta = {
  title: "Form/Select",
  // @ts-expect-error `Select` is a generic component.
  component: Select,
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    variant: "subtle",
    size: "md",

    disabled: false,
    loading: false,
    searchInput: false,
    placeholder: "Select a status...",
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { FormField, Select },
      setup: () => ({ args, richItems, updateArgs }),
      template: `
        <FormField>
          <Select
            v-bind="args"
            :items="richItems"
            class="w-48"
            @update:model-value="(value) => updateArgs({ modelValue: value })"
          />
        </FormField>
      `,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { Select },
    setup: () => ({ sizes, items }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Select :items="items" :size="size" :model-value="'todo'" class="w-40" />
        </template>
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { Select },
    setup: () => ({ variants, items }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="variant in variants" :key="variant">
          <Select :items="items" :variant="variant" :model-value="'todo'" class="w-40" />
        </template>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { Select },
    setup: () => ({ items }),
    template: `
      <div class="flex flex-col gap-2">
        <Select :items="items" placeholder="Default" class="w-40" />
        <Select :items="items" placeholder="Loading" loading class="w-40" />
        <Select :items="items" placeholder="Disabled" disabled class="w-40" />
      </div>
    `,
  }),
};

export const Open: Story = {
  args: {
    ...Demo.args,
    defaultOpen: true,
    portal: false, // `portal` must be disabled here so the opened content stays inside the captured snapshot subject.
  },
  render: (args) => ({
    components: { FormField, Select },
    setup: () => ({ args, richItems }),
    template: `
      <div class="min-h-96 min-w-64">
        <FormField>
          <Select v-bind="args" :items="richItems" class="w-48" />
        </FormField>
      </div>
    `,
  }),
  async play({ canvas }) {
    await expect(canvas.getByRole("option", { name: "Backlog" })).toBeVisible();
  },
};

export const Selected: Story = {
  args: { items, portal: false, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(canvas.getAllByRole("option")[0]!);
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("backlog");
  },
};
