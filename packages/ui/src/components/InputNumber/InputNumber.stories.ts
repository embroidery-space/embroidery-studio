import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";
import { ref } from "vue";

import Button from "../Button/Button.vue";
import FormField from "../FormField/FormField.vue";
import FormFieldGroup from "../FormFieldGroup/FormFieldGroup.vue";

import InputNumber from "./InputNumber.vue";

const sizes = ["sm", "md", "lg"] as const;
const variants = ["subtle", "outline"] as const;

const meta = {
  title: "Form/InputNumber",
  component: InputNumber,
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: sizes },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
} satisfies Meta<typeof InputNumber>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Storybook never writes `update:modelValue` back into `args`.
 * A story that passes both `modelValue` and an `onUpdate:modelValue` spy renders a fully controlled input that never changes.
 * Therefpre, its visual baseline would capture the state *before* the interaction.
 * Binding a local model on top keeps the spy (handlers are merged, not overwritten) while letting the rendered value follow the interaction.
 */
const renderWithLocalModel: Story["render"] = (args) => ({
  components: { InputNumber },
  setup: () => ({ args, value: ref(args.modelValue) }),
  template: `<InputNumber v-bind="args" v-model="value" />`,
});

export const Demo: Story = {
  args: {
    modelValue: 5,

    variant: "subtle",
    size: "md",

    min: 0,
    max: 10,
    step: 1,

    increment: true,
    decrement: true,

    disabled: false,
  },
  render: (args) => ({
    components: { FormField, InputNumber },
    setup: () => ({ args }),
    template: `
      <FormField>
        <InputNumber v-bind="args" />
      </FormField>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { InputNumber },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <InputNumber :size="size" :placeholder="\`Size: \${size}\`" />
        </template>
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { InputNumber },
    setup: () => ({ variants }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="variant in variants" :key="variant">
          <InputNumber :variant="variant" :placeholder="\`Variant: \${variant}\`" />
        </template>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { InputNumber },
    template: `
      <div class="flex flex-col gap-2">
        <InputNumber placeholder="Default" />
        <InputNumber placeholder="Disabled" disabled />
      </div>
    `,
  }),
};

export const FieldGroup: Story = {
  render: () => ({
    components: { InputNumber, Button, FormFieldGroup },
    template: `
      <FormFieldGroup>
        <InputNumber :increment="false" :decrement="false" />
        <Button label="Apply" />
      </FormFieldGroup>
    `,
  }),
};

export const Filled: Story = {
  args: { "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  render: renderWithLocalModel,
  async play({ canvas, userEvent, args }) {
    const input = canvas.getByRole("spinbutton");

    await userEvent.clear(input);
    await userEvent.type(input, "42");
    await userEvent.keyboard("{Enter}");

    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith(42);
  },
};

export const Incremented: Story = {
  args: { modelValue: 5, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  render: renderWithLocalModel,
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("button", { name: "Increment" }));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(6);
  },
};

export const Decremented: Story = {
  args: { modelValue: 5, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  render: renderWithLocalModel,
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("button", { name: "Decrement" }));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(4);
  },
};
