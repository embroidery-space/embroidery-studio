import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";
import { ref } from "vue";

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

/**
 * Storybook never writes `update:modelValue` back into `args`.
 * A story that passes both `modelValue` and an `onUpdate:modelValue` spy renders a fully controlled input that never changes.
 * Therefpre, its visual baseline would capture the state *before* the interaction.
 * Binding a local model on top keeps the spy (handlers are merged, not overwritten) while letting the rendered value follow the interaction.
 */
const renderWithLocalModel: Story["render"] = (args) => ({
  components: { InputNumberSlider },
  setup: () => ({ args, value: ref(args.modelValue) }),
  template: `<InputNumberSlider v-bind="args" v-model="value" class="w-96" />`,
});

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
  render: (args) => ({
    components: { FormField, InputNumberSlider },
    setup: () => ({ args }),
    template: `
      <FormField>
        <InputNumberSlider v-bind="args" class="w-96" />
      </FormField>
    `,
  }),
};

export const Filled: Story = {
  args: { modelValue: 50, min: 0, max: 100, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  render: renderWithLocalModel,
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
  render: renderWithLocalModel,
  async play({ canvas, userEvent, args }) {
    canvas.getByRole("slider").focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(51);
  },
};
