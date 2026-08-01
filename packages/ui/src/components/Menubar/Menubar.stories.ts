import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn } from "storybook/test";

import Menubar from "./Menubar.vue";
import type { MenubarMenu } from "./Menubar.vue";

const sizes = ["sm", "md", "lg"] as const;

const demoMenus: MenubarMenu[] = [
  {
    label: "File",
    items: [
      [
        { label: "New", shortcut: "Ctrl+N" },
        { label: "Open", shortcut: "Ctrl+O" },
      ],
      [
        { label: "Save", shortcut: "Ctrl+S" },
        { label: "Save As", shortcut: "Ctrl+Shift+S" },
      ],
      [{ label: "Exit" }],
    ],
  },
  {
    label: "Edit",
    items: [
      [
        { label: "Undo", shortcut: "Ctrl+Z" },
        { label: "Redo", shortcut: "Ctrl+Shift+Z" },
      ],
      [
        { icon: "lucide:scissors", label: "Cut", shortcut: "Ctrl+X" },
        { icon: "lucide:copy", label: "Copy", shortcut: "Ctrl+C" },
        { icon: "lucide:clipboard", label: "Paste", shortcut: "Ctrl+V" },
      ],
    ],
  },
  {
    label: "View",
    items: [
      { type: "label", label: "Display" },
      { type: "separator" },
      { type: "checkbox", label: "Show Grid", checked: true },
      { type: "checkbox", label: "Show Rulers", checked: false },
    ],
  },
  {
    label: "Help",
    items: [
      {
        label: "Documentation",
        children: [{ label: "Getting Started" }, { label: "API Reference" }],
      },
      { type: "separator" },
      { label: "About" },
      { type: "separator" },
      { type: "link", label: "Internal Page", href: "/about" },
      { type: "link", label: "External Site", href: "https://example.com", target: "_blank" },
      { type: "link", label: "Disabled Link", href: "https://example.com", disabled: true },
    ],
  },
];

const meta = {
  title: "Navigation/Menubar",
  // @ts-expect-error `Menubar` is a generic component.
  component: Menubar,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Menubar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    size: "md",
  },
  render: (args) => ({
    components: { Menubar },
    setup: () => ({ args, menus: demoMenus }),
    template: `<Menubar v-bind="args" :menus="menus" />`,
  }),
};

export const Open: Story = {
  args: {
    ...Demo.args,
    defaultValue: "File",
    portal: false, // `portal` must be disabled here so the opened content stays inside the captured snapshot subject.
  },
  render: (args) => ({
    components: { Menubar },
    setup: () => ({ args, menus: demoMenus }),
    template: `
      <div class="min-h-56 min-w-xs">
        <Menubar v-bind="args" :menus="menus" />
      </div>
    `,
  }),
  async play({ canvas }) {
    await expect(canvas.getByRole("menuitem", { name: /New/u })).toBeVisible();
  },
};

export const DisabledMenu: Story = {
  args: { size: "md", portal: false },
  render: (args) => ({
    components: { Menubar },
    // oxlint-disable-next-line oxc/no-map-spread
    setup: () => ({ args, menus: demoMenus.map((menu) => ({ ...menu, disabled: true })) }),
    template: `<Menubar v-bind="args" :menus="menus" />`,
  }),
};

export const ShortcutTriggered: Story = {
  args: { onSelect: fn() },
  tags: ["!autodocs"],
  render: (args) => {
    const menus: MenubarMenu[] = [
      {
        label: "Edit",
        items: [{ label: "Undo", shortcut: "Control+Z", onSelect: args.onSelect as (event: Event) => void }],
      },
    ];
    return {
      components: { Menubar },
      setup: () => ({ menus }),
      template: `<Menubar :menus="menus" :portal="false" />`,
    };
  },
  async play({ userEvent, args }) {
    await userEvent.keyboard("{Control>}z{/Control}");
    await expect(args.onSelect).toHaveBeenCalled();
  },
};
