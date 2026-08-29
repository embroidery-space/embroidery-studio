import type { Meta, StoryObj } from "@storybook/vue3-vite";

import ScrollArea from "./ScrollArea.vue";

const orientations = ["vertical", "horizontal"] as const;
const types = ["auto", "always", "scroll", "hover", "glimpse"] as const;
const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Layout/ScrollArea",
  component: ScrollArea,
  argTypes: {
    orientation: { control: "select", options: orientations },
    type: { control: "select", options: types },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    orientation: "vertical",
    type: "always",
    size: "lg",
  },
  render: (args) => ({
    components: { ScrollArea },
    setup: () => ({ args }),
    template: `
      <ScrollArea v-bind="args" class="size-64 rounded-sm border border-default">
        <div v-if="args.orientation === 'vertical'" class="space-y-4 p-4 pr-2">
          <div v-for="i in 20" :key="i" class="rounded-sm bg-accented p-3">Item {{ i }}</div>
        </div>
        <div v-else class="flex gap-4 p-4 py-2">
          <div v-for="i in 20" :key="i" class="shrink-0 rounded-sm bg-accented p-3">Item {{ i }}</div>
        </div>
      </ScrollArea>
    `,
  }),
};

export const Horizontal: Story = {
  render: () => ({
    components: { ScrollArea },
    template: `
      <ScrollArea type="always" orientation="horizontal" class="w-64 rounded-sm border border-default">
        <div class="flex gap-4 p-4 py-2">
          <div v-for="i in 20" :key="i" class="shrink-0 rounded-sm bg-accented p-3">Item {{ i }}</div>
        </div>
      </ScrollArea>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { ScrollArea },
    setup: () => ({ sizes }),
    template: `
      <div class="space-y-4">
        <ScrollArea v-for="size in sizes" :key="size" type="always" orientation="horizontal" :size="size" class="w-64 rounded-sm border border-default">
          <div class="flex gap-4 p-4 py-2">
            <div v-for="i in 20" :key="i" class="shrink-0 rounded-sm bg-accented p-3">Item {{ i }}</div>
          </div>
        </ScrollArea>
      </div>
    `,
  }),
};
