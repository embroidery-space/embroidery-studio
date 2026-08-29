import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import ToolSelect from "./ToolSelect.vue";
import type { ToolSelectItem } from "./ToolSelect.vue";

const sizes = ["sm", "md", "lg"] as const;

const singleItem: ToolSelectItem[] = [{ label: "Pencil", icon: "lucide:pencil", value: "pencil" }];
const multipleItems: ToolSelectItem[] = [
  { label: "Pencil", icon: "lucide:pencil", value: "pencil", shortcut: "P" },
  { label: "Eraser", icon: "lucide:eraser", value: "eraser", shortcut: "E" },
  { label: "Brush", icon: "lucide:brush", value: "brush", shortcut: "B" },
];

const meta = {
  title: "Toolbar/ToolSelect",
  // @ts-expect-error `ToolSelect` is a generic component.
  component: ToolSelect,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof ToolSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: "pencil",
    items: multipleItems,
    size: "lg",
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { ToolSelect },
      setup: () => ({ args, multipleItems, updateArgs }),
      template: `
        <ToolSelect
          v-bind="args"
          :items="multipleItems"
          @update:model-value="(value) => updateArgs({ modelValue: value })"
        />
      `,
    };
  },
};

export const SingleItem: Story = {
  args: { modelValue: "pencil", items: singleItem },
  render: (args) => ({
    components: { ToolSelect },
    setup: () => ({ args, singleItem }),
    template: `<ToolSelect v-bind="args" :items="singleItem" />`,
  }),
};

export const CustomSelectionColor: Story = {
  args: { modelValue: "pencil", items: multipleItems },
  render: (args) => ({
    components: { ToolSelect },
    setup: () => ({ args, multipleItems }),
    template: `<ToolSelect v-bind="args" :items="multipleItems" selection-color="var(--color-error)" />`,
  }),
};

export const Sizes: Story = {
  args: { items: multipleItems },
  render: () => ({
    components: { ToolSelect },
    setup: () => ({ sizes, multipleItems }),
    template: `
      <div class="flex items-start gap-4">
        <template v-for="size in sizes" :key="size">
          <ToolSelect model-value="pencil" :items="multipleItems" :size="size" />
        </template>
      </div>
    `,
  }),
};

export const States: Story = {
  args: { items: multipleItems },
  render: () => ({
    components: { ToolSelect },
    setup: () => ({ multipleItems }),
    template: `
      <div class="flex items-start gap-4">
        <ToolSelect model-value="pencil" :items="multipleItems" />
        <ToolSelect model-value="pencil" :items="multipleItems" disabled />
      </div>
    `,
  }),
};

export const Open: Story = {
  args: { ...Demo.args, defaultOpen: true, portal: false },
  render: (args) => ({
    components: { ToolSelect },
    setup: () => ({ args, multipleItems }),
    template: `
      <div class="size-48">
        <ToolSelect v-bind="args" :items="multipleItems" />
      </div>
    `,
  }),
};

export const Selected: Story = {
  args: { items: multipleItems, portal: false, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => ({
    components: { ToolSelect },
    setup: () => ({ args, multipleItems }),
    template: `<ToolSelect v-bind="args" :items="multipleItems" />`,
  }),
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByTestId("tool-selector-dropdown-button"));
    await userEvent.click(canvas.getAllByRole("menuitem")[1]!);
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("eraser");
  },
};

export const ShortcutSelected: Story = {
  args: { items: multipleItems, "onUpdate:modelValue": fn() },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => ({
    components: { ToolSelect },
    setup: () => ({ args, multipleItems }),
    template: `<ToolSelect v-bind="args" :items="multipleItems" />`,
  }),
  async play({ userEvent, args }) {
    await userEvent.keyboard("b");
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("brush");
  },
};
