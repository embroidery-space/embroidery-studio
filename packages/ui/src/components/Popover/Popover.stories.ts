import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import Button from "../Button/Button.vue";

import Popover from "./Popover.vue";

const sides = ["top", "right", "bottom", "left"] as const;
const aligns = ["start", "center", "end"] as const;

const meta = {
  title: "Overlay/Popover",
  component: Popover,
  argTypes: {
    side: { control: "select", options: sides },
    align: { control: "select", options: aligns },
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    side: "bottom",
    align: "center",
    modal: false,
  },
  render: (args) => ({
    components: { Popover, Button },
    setup: () => ({ args }),
    template: `
      <Popover v-bind="args">
        <Button label="Open Popover" />
        <template #content>
          <Placeholder class="m-4 inline-flex size-48" />
        </template>
      </Popover>
    `,
  }),
};

export const Open: Story = {
  args: { ...Demo.args, open: true, portal: false },
  render: (args) => ({
    components: { Popover, Button },
    setup: () => ({ args }),
    template: `
      <div class="min-h-64 min-w-64">
        <Popover v-bind="args">
          <Button label="Open Popover" />
          <template #content>
            <Placeholder class="m-4 inline-flex size-48" />
          </template>
        </Popover>
      </div>
    `,
  }),
};

export const ClosesOnOutsideClick: Story = {
  args: { portal: false },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => ({
    components: { Popover, Button },
    setup: () => ({ args }),
    template: `
      <div class="min-h-64 min-w-64">
        <Popover v-bind="args">
          <Button label="Open Popover" />
          <template #content>Popover content</template>
        </Popover>
      </div>
    `,
  }),
  async play({ canvas, userEvent }) {
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByText("Popover content")).toBeVisible();

    await userEvent.click(document.body);
    await expect(canvas.queryByText("Popover content")).not.toBeInTheDocument();
  },
};

export const PinnedStaysOpenOnOutsideClick: Story = {
  args: { portal: false, pinned: true },
  tags: ["!autodocs", "!snapshot"],
  render: (args) => ({
    components: { Popover, Button },
    setup: () => ({ args }),
    template: `
      <div class="min-h-64 min-w-64">
        <Popover v-bind="args">
          <Button label="Open Popover" />
          <template #content>Popover content</template>
        </Popover>
      </div>
    `,
  }),
  async play({ canvas, userEvent }) {
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getByText("Popover content")).toBeVisible();

    await userEvent.click(document.body);
    await expect(canvas.getByText("Popover content")).toBeVisible();
  },
};
