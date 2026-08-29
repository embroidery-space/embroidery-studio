import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import Button from "../Button/Button.vue";

import Dialog from "./Dialog.vue";

const meta = {
  title: "Overlay/Dialog",
  component: Dialog,
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    title: "Dialog Title",
    description: "This is a description of the dialog.",
  },
  render: (args) => ({
    components: { Dialog, Button },
    setup: () => ({ args }),
    template: `
      <Dialog v-bind="args">
        <Button label="Open Dialog" />

        <template #body>
          <Placeholder class="inline-flex h-48 w-full" />
        </template>

        <template #footer="{ close }">
          <Button label="Cancel" color="neutral" variant="outline" @click="close" />
          <Button label="Confirm" @click="close" />
        </template>
      </Dialog>
    `,
  }),
};

export const Open: Story = {
  args: { ...Demo.args, open: true, portal: false },
  tags: ["!autodocs"],
  render: (args) => ({
    components: { Dialog, Button },
    setup: () => ({ args }),
    template: `
      <div class="h-screen w-screen">
        <Dialog v-bind="args">
          <Button label="Open Dialog" />

          <template #body>
            <Placeholder class="inline-flex h-48 w-full" />
          </template>

          <template #footer="{ close }">
            <Button label="Cancel" color="neutral" variant="outline" @click="close" />
            <Button label="Confirm" @click="close" />
          </template>
        </Dialog>
      </div>
    `,
  }),
  async play({ canvas, args }) {
    await expect(canvas.getByText(args.title!)).toBeVisible();
  },
};
