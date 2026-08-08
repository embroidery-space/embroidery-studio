import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";
import { computed, ref } from "vue";

import Listbox from "./Listbox.vue";
import type { ListboxItem } from "./Listbox.vue";

const sizes = ["sm", "md", "lg"] as const;
const colors = ["primary", "neutral"] as const;

const flatItems: ListboxItem[] = ["Backlog", "Todo", "In Progress", "Done", "Cancelled"];

const groupedItems: ListboxItem[][] = [
  [{ type: "label", label: "Active" }, { label: "Backlog" }, { label: "Todo" }, { label: "In Progress" }],
  [{ type: "separator" }, { label: "Done" }, { label: "Cancelled", disabled: true }],
];

const meta = {
  title: "Form/Listbox",
  // @ts-expect-error `Listbox` is a generic component.
  component: Listbox,
  argTypes: {
    color: { control: "select", options: colors },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Listbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    multiple: false,
    disabled: false,
    highlightOnHover: true,
    filterInput: false,
    size: "md",
    color: "primary",
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { Listbox },
      setup: () => ({ args, flatItems, updateArgs }),
      template: `
        <Listbox
          v-bind="args"
          :items="flatItems"
          class="w-56"
          @update:model-value="(value) => updateArgs({ modelValue: value })"
        />
      `,
    };
  },
};

export const Grouped: Story = {
  render: () => ({
    components: { Listbox },
    setup: () => ({ groupedItems }),
    template: `<Listbox :items="groupedItems" class="w-56" />`,
  }),
};

export const Filtering: Story = {
  render: () => ({
    components: { Listbox },
    setup() {
      const filterValue = ref("");
      const filteredItems = computed(() =>
        flatItems.filter((item) =>
          typeof item === "object" && item.label
            ? item.label.toLowerCase().includes(filterValue.value.toLowerCase())
            : String(item).toLowerCase().includes(filterValue.value.toLowerCase()),
        ),
      );
      return { filterValue, filteredItems };
    },
    template: `<Listbox v-model:filter-value="filterValue" :items="filteredItems" filter-input class="w-56" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Listbox },
    setup: () => ({ sizes, flatItems }),
    template: `
      <div class="flex gap-4">
        <Listbox v-for="size in sizes" :key="size" :items="flatItems" :size="size" class="w-40" />
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { Listbox },
    setup: () => ({ flatItems }),
    template: `
      <div class="flex gap-4">
        <Listbox :items="flatItems" class="w-40" />
        <Listbox :items="flatItems" disabled class="w-40" />
        <Listbox :items="[]" class="w-40" />
      </div>
    `,
  }),
};

export const Selected: Story = {
  args: { items: flatItems, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getAllByRole("option")[0]!);
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("Backlog");
  },
};

export const DoubleClicked: Story = {
  args: { items: flatItems, onOptionDblclick: fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.dblClick(canvas.getAllByRole("option")[0]!);
    await expect(args.onOptionDblclick).toHaveBeenCalled();
  },
};

export const Filtered: Story = {
  args: { items: flatItems, filterInput: true, "onUpdate:filterValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.type(canvas.getByRole("textbox"), "Back");
    await expect(args["onUpdate:filterValue"]).toHaveBeenLastCalledWith("Back");
  },
};
