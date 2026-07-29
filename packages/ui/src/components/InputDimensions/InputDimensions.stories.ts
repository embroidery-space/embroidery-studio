import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect } from "storybook/test";

import InputDimensions from "./InputDimensions.vue";

const sizes = ["sm", "md", "lg"] as const;
const orientations = ["horizontal", "vertical"] as const;

const meta = {
  title: "Form/InputDimensions",
  component: InputDimensions,
  argTypes: {
    size: { control: "select", options: sizes },
    orientation: { control: "select", options: orientations },
    aspectRatio: { control: "number" },
  },
} satisfies Meta<typeof InputDimensions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    width: 800,
    height: 600,

    size: "md",
    orientation: "horizontal",
    aspectRatio: undefined,

    disabled: false,

    widthFieldOptions: { label: "Width" },
    heightFieldOptions: { label: "Height" },
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { InputDimensions },
      setup: () => ({ args, updateArgs }),
      template: `
        <InputDimensions
          v-bind="args"
          @update:width="(value) => updateArgs({ width: value })"
          @update:height="(value) => updateArgs({ height: value })"
        />
      `,
    };
  },
};

export const Sizes: Story = {
  args: { width: 800, height: 600 },
  render: (args) => ({
    components: { InputDimensions },
    setup: () => ({ args, sizes }),
    template: `
      <div class="flex flex-col gap-4">
        <InputDimensions
          v-for="size in sizes"
          :key="size"
          v-bind="args"
          :size="size"
          :width-field-options="{ label: 'Width' }"
          :height-field-options="{ label: 'Height' }"
        />
      </div>
    `,
  }),
};

export const WidthChanged: Story = {
  args: { width: 100, height: 50 },
  tags: ["!autodocs"],
  async play({ canvas, userEvent }) {
    const widthInput = canvas.getAllByRole("spinbutton")[0]!;
    const heightInput = canvas.getAllByRole("spinbutton")[1]!;

    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, "200");
    await userEvent.keyboard("{Enter}");

    await expect(widthInput).toHaveValue("200");
    // The lock is inactive without `aspectRatio`, so the height must stay untouched.
    await expect(heightInput).toHaveValue("50");
  },
};

export const AspectRatioLocked: Story = {
  args: { width: 100, height: 50, aspectRatio: 2 },
  tags: ["!autodocs"],
  async play({ canvas, userEvent }) {
    const widthInput = canvas.getAllByRole("spinbutton")[0]!;
    const heightInput = canvas.getAllByRole("spinbutton")[1]!;

    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, "200");
    await userEvent.keyboard("{Enter}");

    await expect(heightInput).toHaveValue("100");

    // The propagation works the other way around too.
    await userEvent.clear(heightInput);
    await userEvent.type(heightInput, "200");
    await userEvent.keyboard("{Enter}");

    await expect(widthInput).toHaveValue("400");
  },
};

export const AspectRatioLockToggled: Story = {
  args: { width: 100, height: 50 },
  tags: ["!autodocs"],
  async play({ canvas, userEvent }) {
    const lockButton = canvas.getByRole("button", { name: "Lock aspect ratio" });
    await expect(lockButton).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(lockButton);

    const unlockButton = canvas.getByRole("button", { name: "Unlock aspect ratio" });
    await expect(unlockButton).toHaveAttribute("aria-pressed", "true");

    // Locking stores the current 100/50 ratio, so the height now follows the width.
    const widthInput = canvas.getAllByRole("spinbutton")[0]!;
    const heightInput = canvas.getAllByRole("spinbutton")[1]!;

    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, "200");
    await userEvent.keyboard("{Enter}");

    await expect(heightInput).toHaveValue("100");
  },
};
