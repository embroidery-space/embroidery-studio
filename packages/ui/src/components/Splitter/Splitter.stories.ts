import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Splitter from "./Splitter.vue";
import SplitterPanel from "./SplitterPanel.vue";

const directions = ["horizontal", "vertical"] as const;

const meta = {
  title: "Layout/Splitter",
  component: Splitter,
  argTypes: {
    direction: { control: "select", options: directions },
  },
} satisfies Meta<typeof Splitter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    direction: "horizontal",
  },
  render: (args) => ({
    components: { Splitter, SplitterPanel },
    setup: () => ({ args }),
    template: `
      <div class="size-96">
        <Splitter v-bind="args" class="rounded-sm border border-default">
          <SplitterPanel :min-size="20" class="flex items-center justify-center">Panel 1</SplitterPanel>
          <SplitterPanel :min-size="20" class="flex items-center justify-center">Panel 2</SplitterPanel>
        </Splitter>
      </div>
    `,
  }),
};

export const Nested: Story = {
  args: { direction: "horizontal" },
  render: () => ({
    components: { Splitter, SplitterPanel },
    template: `
      <div class="size-96">
        <Splitter direction="horizontal" class="rounded-sm border border-default">
          <SplitterPanel :min-size="20" class="flex items-center justify-center">Panel 1</SplitterPanel>
          <SplitterPanel :min-size="30">
            <Splitter direction="vertical">
              <SplitterPanel :min-size="20" class="flex items-center justify-center">Panel 2</SplitterPanel>
              <SplitterPanel :min-size="15" class="flex items-center justify-center">Panel 3</SplitterPanel>
            </Splitter>
          </SplitterPanel>
        </Splitter>
      </div>
    `,
  }),
};

export const Collapsible: Story = {
  args: { direction: "horizontal" },
  render: () => ({
    components: { Splitter, SplitterPanel },
    template: `
      <div class="size-96">
        <Splitter direction="horizontal" class="rounded-sm border border-default">
          <SplitterPanel :min-size="15" :collapsed-size="5" collapsible class="flex items-center justify-center">
            Panel 1
          </SplitterPanel>
          <SplitterPanel :min-size="30" class="flex items-center justify-center">Panel 2</SplitterPanel>
        </Splitter>
      </div>
    `,
  }),
};
