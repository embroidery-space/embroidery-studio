import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";

import Button from "../Button/Button.vue";
import FormField from "../FormField/FormField.vue";
import FormFieldGroup from "../FormFieldGroup/FormFieldGroup.vue";
import Icon from "../Icon/Icon.vue";

import Input from "./Input.vue";

const sizes = ["sm", "md", "lg"] as const;
const variants = ["subtle", "outline", "none"] as const;

const meta = {
  title: "Form/Input",
  component: Input,
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "select", options: sizes },
    leadingIcon: { control: "text" },
    trailingIcon: { control: "text" },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    modelValue: "Lorem ipsum",

    variant: "subtle",
    size: "md",

    leadingIcon: "",
    trailingIcon: "",
    loading: false,
    disabled: false,
  },
  render: (args) => ({
    components: { FormField, Input },
    setup: () => ({ args }),
    template: `
      <FormField>
        <Input v-bind="args" />
      </FormField>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Input },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Input :model-value="\`Size: \${size}\`" :size="size" />
        </template>
      </div>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { Input },
    setup: () => ({ variants }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="variant in variants" :key="variant">
          <Input :model-value="\`Variant: \${variant}\`" :variant="variant" />
        </template>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div class="flex flex-col gap-2">
        <Input model-value="Default" />
        <Input model-value="Disabled" disabled />
      </div>
    `,
  }),
};

export const WithSlots: Story = {
  render: () => ({
    components: { Input, Icon },
    template: `
      <div class="flex flex-col gap-2">
        <Input model-value="With leading slot">
          <template #leading>
            <Icon name="lucide:rocket" />
          </template>
        </Input>

        <Input model-value="With trailing slot">
          <template #trailing>
            <Icon name="lucide:rocket" />
          </template>
        </Input>

        <Input model-value="With both slots">
          <template #leading>
            <Icon name="lucide:rocket" />
          </template>
          <template #trailing>
            <Icon name="lucide:rocket" />
          </template>
        </Input>
      </div>
    `,
  }),
};

export const FieldGroup: Story = {
  render: () => ({
    components: { Input, Button, FormFieldGroup },
    template: `
      <FormFieldGroup>
        <Input />
        <Button label="Submit" />
      </FormFieldGroup>
    `,
  }),
};

export const Filled: Story = {
  args: { "onUpdate:modelValue": fn() },
  async play({ canvas, userEvent, args }) {
    await userEvent.type(canvas.getByRole("textbox"), "qwerty");
    await expect(args["onUpdate:modelValue"]).toHaveBeenLastCalledWith("qwerty");
  },
};
