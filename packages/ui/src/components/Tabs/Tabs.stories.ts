import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import Tabs from "./Tabs.vue";
import type { TabsItem } from "./Tabs.vue";

const sizes = ["sm", "md", "lg"] as const;
const orientations = ["horizontal", "vertical"] as const;

const items: TabsItem[] = [
  { label: "Tab 1", content: "Lorem ipsum" },
  { label: "Tab 2", content: "dolor sit amet" },
  { label: "Tab 3", content: "consectetur adipiscing elit" },
];

const meta = {
  title: "Navigation/Tabs",
  // @ts-expect-error `Tabs` is a generic component.
  component: Tabs,
  argTypes: {
    orientation: { control: "select", options: orientations },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    orientation: "horizontal",
    size: "md",
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { Tabs },
      setup: () => ({ args, items, updateArgs }),
      template: `
        <Tabs
          v-bind="args"
          :items="items"
          @update:model-value="(value) => updateArgs({ modelValue: value })"
        />
      `,
    };
  },
};

export const Vertical: Story = {
  render: () => ({
    components: { Tabs },
    setup: () => ({ items }),
    template: `<Tabs :items="items" orientation="vertical" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Tabs },
    setup: () => ({ sizes, items }),
    template: `
      <div class="flex flex-col gap-4">
        <Tabs v-for="size in sizes" :key="size" :items="items" :size="size" />
      </div>
    `,
  }),
};

export const Selected: Story = {
  args: { items, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("tab", { name: "Tab 2" }));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("1");
  },
};
