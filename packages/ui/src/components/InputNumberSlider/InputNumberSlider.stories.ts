import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import { renderWithLocalModel } from "~storybook-utils/render-with-local-model";

import FormField from "../FormField/FormField.vue";

import InputNumberSlider from "./InputNumberSlider.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/InputNumberSlider",
  component: InputNumberSlider,
  argTypes: {
    size: { control: "select", options: sizes },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
} satisfies Meta<typeof InputNumberSlider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: 50,

    size: "md",

    min: 0,
    max: 100,
    step: 1,

    increment: false,
    decrement: false,

    tooltip: false,

    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { FormField, InputNumberSlider },
      setup: () => ({ args, updateArgs }),
      template: `
        <FormField>
          <InputNumberSlider
            v-bind="args"
            class="w-96"
            @update:model-value="(value) => updateArgs({ modelValue: value })"
          />
        </FormField>
      `,
    };
  },
};

export const Filled: Story = {
  args: { modelValue: 50, min: 0, max: 100, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  render: renderWithLocalModel(InputNumberSlider, "InputNumberSlider", { attrs: 'class="w-96"' }),
  async play({ canvas, userEvent, args }) {
    const input = canvas.getByRole("spinbutton");

    await userEvent.clear(input);
    await userEvent.type(input, "75");
    await userEvent.keyboard("{Enter}");

    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith(75);
  },
};

export const Changed: Story = {
  args: { modelValue: 50, min: 0, max: 100, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  render: renderWithLocalModel(InputNumberSlider, "InputNumberSlider", { attrs: 'class="w-96"' }),
  async play({ canvas, userEvent, args }) {
    canvas.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(51);
  },
};
