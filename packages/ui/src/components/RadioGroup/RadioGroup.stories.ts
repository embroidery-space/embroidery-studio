import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import FormField from "../FormField/FormField.vue";

import RadioGroup from "./RadioGroup.vue";
import type { RadioGroupItem } from "./RadioGroup.vue";

const sizes = ["sm", "md", "lg"] as const;

const items: RadioGroupItem[] = [
  { value: 1, label: "Option 1", description: "Description 1" },
  { value: 2, label: "Option 2", description: "Description 2" },
  { value: 3, label: "Option 3", description: "Description 3" },
];

const meta = {
  title: "Form/RadioGroup",
  // @ts-expect-error `RadioGroup` is a generic component.
  component: RadioGroup,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    size: "md",
    disabled: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { FormField, RadioGroup },
      setup: () => ({ args, items, updateArgs }),
      template: `
        <FormField>
          <RadioGroup v-bind="args" :items="items" @update:model-value="(value) => updateArgs({ modelValue: value })" />
        </FormField>
      `,
    };
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { RadioGroup },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <RadioGroup :size="size" :items="[\`Size: \${size}\`]" />
        </template>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { RadioGroup },
    template: `
      <div class="flex flex-col gap-2">
        <RadioGroup :items="['Default']" />
        <RadioGroup :items="['Disabled']" disabled />
        <RadioGroup :items="['Selected']" :model-value="'Selected'" />
        <RadioGroup :items="['Selected disabled']" :model-value="'Selected disabled'" disabled />
      </div>
    `,
  }),
};

export const Selected: Story = {
  args: {
    items: ["Option 1", "Option 2"],
    "onUpdate:modelValue": fn(),
  },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getAllByRole("radio")[0]!);
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("Option 1");
  },
};
