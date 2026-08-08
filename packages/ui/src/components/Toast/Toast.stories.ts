import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { useToast } from "../../composables/useToast.ts";
import Button from "../Button/Button.vue";

import Toast from "./Toast.vue";
import Toaster from "./Toaster.vue";

const colors = ["primary", "error", "warning", "success", "info", "help", "neutral"] as const;

const meta = {
  title: "Overlay/Toast",
  component: Toast,
  argTypes: {
    color: { control: "select", options: colors },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    title: "Toast Title",
    description: "This is a description of the toast.",

    color: "primary",
    open: true,
  },
  render: (args) => ({
    components: { Toast, Toaster },
    setup: () => ({ args }),
    template: `
      <Toaster :portal="false" :duration="Infinity">
        <Toast v-bind="args" class="w-2xs" />
      </Toaster>
    `,
  }),
};

export const Colors: Story = {
  args: { title: "Toast" },
  render: () => ({
    components: { Toast, Toaster },
    setup: () => ({ colors }),
    template: `
      <Toaster :portal="false" :duration="Infinity">
        <div class="flex flex-col gap-4">
          <Toast v-for="color in colors" :key="color" :color="color" :title="color" open class="w-2xs" />
        </div>
      </Toaster>
    `,
  }),
};

export const Dynamic: Story = {
  args: { title: "Dynamic Toast" },
  tags: ["!snapshot"],
  render: () => ({
    components: { Button, Toaster },
    setup() {
      const toast = useToast();
      let counter = 0;

      function addToast() {
        counter++;
        toast.add({
          title: `Toast #${counter}`,
          description: `This is toast number ${counter}.`,
          color: colors[counter % colors.length],
        });
      }

      function addToastWithActions() {
        counter++;
        toast.add({
          title: "Something went wrong",
          description: "There was a problem with your request.",
          color: "error",
          actions: [{ label: "Retry", color: "neutral", variant: "outline" }],
        });
      }

      return { addToast, addToastWithActions, clear: toast.clear };
    },
    template: `
      <Toaster>
        <div class="flex items-start gap-4">
          <Button label="Add Toast" @click="addToast" />
          <Button label="Add Toast with Actions" color="neutral" variant="outline" @click="addToastWithActions" />
          <Button label="Clear All" color="neutral" variant="ghost" @click="clear" />
        </div>
      </Toaster>
    `,
  }),
};
