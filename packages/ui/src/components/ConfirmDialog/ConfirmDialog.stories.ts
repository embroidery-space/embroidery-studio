import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import Button from "../Button/Button.vue";

import ConfirmDialog from "./ConfirmDialog.vue";

const meta = {
  title: "Overlay/ConfirmDialog",
  component: ConfirmDialog,
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    title: "Save changes",
    description: "Do you want to save your changes before closing?",
  },
  render: (args) => ({
    components: { ConfirmDialog, Button },
    setup: () => ({ args }),
    template: `
      <ConfirmDialog v-bind="args">
        <Button label="Open Confirm Dialog" />
      </ConfirmDialog>
    `,
  }),
};

export const Open: Story = {
  args: { ...Demo.args, open: true, portal: false },
  tags: ["!autodocs"],
  render: (args) => ({
    components: { ConfirmDialog, Button },
    setup: () => ({ args }),
    template: `
      <div class="h-screen w-screen">
        <ConfirmDialog v-bind="args">
          <Button label="Open Confirm Dialog" />
        </ConfirmDialog>
      </div>
    `,
  }),
  async play({ canvas, args }) {
    await expect(canvas.getByText(args.title!)).toBeVisible();
  },
};
