import type { Meta, StoryObj } from "@storybook/vue3-vite";

import BlockUI from "./BlockUI.vue";

const meta = {
  title: "Overlay/BlockUI",
  component: BlockUI,
} satisfies Meta<typeof BlockUI>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    blocked: false,
  },
  render: (args) => ({
    components: { BlockUI },
    setup: () => ({ args }),
    template: `
      <BlockUI v-bind="args" :ui="{ base: 'p-2', mask: 'rounded-lg' }">
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Architecto nemo consequatur dolor.
          Officia aut perspiciatis iure accusamus dolor sit alias autem.
          Odio et aut qui consequatur, laboriosam hic porro at!
      </BlockUI>
    `,
  }),
};

export const Blocked: Story = {
  args: { ...Demo.args, blocked: true },
  render: Demo.render,
};
