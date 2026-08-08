import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import Input from "../Input/Input.vue";

import FormField from "./FormField.vue";
import type { FormFieldProps } from "./FormField.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/FormField",
  component: FormField,
  argTypes: {
    size: { control: "select", options: sizes },
    label: { control: "text" },
    description: { control: "text" },
    hint: { control: "text" },
    help: { control: "text" },
  },
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: StoryObj<FormFieldProps> = {
  args: {
    size: "lg",
    label: "Email address",
    description: "",
    hint: "",
    help: "",
  },
  render: (args) => ({
    components: { FormField, Input },
    setup: () => ({ args }),
    template: `
      <FormField v-bind="args">
        <Input placeholder="you@example.com" class="w-full" />
      </FormField>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { FormField, Input },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-4">
        <FormField v-for="size in sizes" :key="size" :label="\`Size: \${size}\`" :size="size">
          <Input placeholder="Input" class="w-full" />
        </FormField>
      </div>
    `,
  }),
};

export const Accessibility: Story = {
  args: {
    label: "Label",
    description: "Description",
    hint: "Hint",
    help: "Help",
  },
  render: (args) => ({
    components: { FormField, Input },
    setup: () => ({ args }),
    template: `
      <FormField v-bind="args">
        <Input class="w-full" />
      </FormField>
    `,
  }),
  async play({ canvas }) {
    const input = canvas.getByRole("textbox");
    const inputId = input.getAttribute("id");
    await expect(inputId).not.toBeNull();

    await expect(canvas.getByText("Label")).toHaveAttribute("for", inputId);
    await expect(canvas.getByText("Description")).toHaveAttribute("id", `${inputId}-description`);
    await expect(canvas.getByText("Hint")).toHaveAttribute("id", `${inputId}-hint`);
    await expect(canvas.getByText("Help")).toHaveAttribute("id", `${inputId}-help`);
  },
};
