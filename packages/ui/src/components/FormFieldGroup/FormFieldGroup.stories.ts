import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Button from "../Button/Button.vue";
import Input from "../Input/Input.vue";
import InputNumber from "../InputNumber/InputNumber.vue";

import FormFieldGroup from "./FormFieldGroup.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/FormFieldGroup",
  component: FormFieldGroup,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof FormFieldGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    size: "md",
  },
  render: (args) => ({
    components: { FormFieldGroup, Input, Button },
    setup: () => ({ args }),
    template: `
      <FormFieldGroup v-bind="args">
        <Input />
        <Button label="Submit" />
      </FormFieldGroup>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { FormFieldGroup, Input, Button },
    setup: () => ({ sizes }),
    template: `
      <div class="flex flex-col gap-4">
        <template v-for="size in sizes" :key="size">
          <FormFieldGroup :size="size">
            <Input :model-value="\`Size: \${size}\`" />
            <Button label="Submit" />
          </FormFieldGroup>
        </template>
      </div>
    `,
  }),
};

export const WithButtons: Story = {
  render: () => ({
    components: { FormFieldGroup, Button },
    template: `
      <FormFieldGroup>
        <Button label="First" variant="outline" color="neutral" />
        <Button label="Second" variant="outline" color="neutral" />
        <Button label="Third" variant="outline" color="neutral" />
      </FormFieldGroup>
    `,
  }),
};

export const WithInput: Story = {
  render: () => ({
    components: { FormFieldGroup, Input, Button },
    template: `
      <FormFieldGroup>
        <Input model-value="john.doe@example.com" />
        <Button label="Submit" />
      </FormFieldGroup>
    `,
  }),
};

export const WithInputNumber: Story = {
  render: () => ({
    components: { FormFieldGroup, InputNumber, Button },
    template: `
      <FormFieldGroup>
        <InputNumber :model-value="42" :increment="false" :decrement="false" />
        <Button label="Apply" />
      </FormFieldGroup>
    `,
  }),
};
