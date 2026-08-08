# Testing

A story is the test.
`ComponentName.stories.ts`, next to `ComponentName.vue`, is the only test file a component gets --- every story it exports automatically produces light + dark visual-snapshot baselines, and behavior is asserted with a `play` function on the same story.
There are no `ComponentName.spec.ts` files.

Composables and utils (`src/composables/**/*.spec.ts`, `src/utils/**/*.test.ts`) are the exception: plain Vitest specs, no story involved.

## Writing a story

```ts
import type { Meta, StoryObj } from "@storybook/vue3-vite";

import Progress from "./Progress.vue";

const sizes = ["xs", "sm", "md", "lg", "xl"];

const meta = {
  title: "Element/Progress",
  component: Progress,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: { size: "md" },
};

export const Sizes: Story = {
  render: () => ({
    components: { Progress },
    setup: () => ({ sizes }),
    template: `
      <div class="flex w-96 flex-col gap-4">
        <Progress v-for="size in sizes" :key="size" :size="size" />
      </div>
    `,
  }),
};
```

- `meta.title`'s group prefix (`Element/...`) must match one of the groups sorted in `.storybook/preview.ts`.
- `Demo` renders exactly **one** instance, fully driven by `args` --- it's what the docs controls table edits live.
  Never loop a hardcoded array inside `Demo`; promote the looped prop to an arg and give the loop its own story (`Sizes`, `Colors`, ...) instead.
- Every component used in a `render` template goes in that story's `components: {}` --- except `Placeholder`, registered globally in `preview.ts`.
- A component with a required prop needs `args` on **every** story, `render`-only ones included --- `satisfies Meta<typeof X>` makes `args` mandatory on `StoryObj<typeof meta>` even when the render ignores it.
- Stories are docs-only (sidebar shows one `Docs` entry per component, no standalone story canvas), so `parameters: { controls: { disable: true } }` has nothing to disable --- never add it.

### Multi-state components

A component with a meaningful closed _and_ open rendering (Select, Dialog, Popover, Tooltip, ...) gets one story per state --- `Demo` always stays closed:

```ts
export const Open: Story = {
  args: { ...Demo.args, defaultOpen: true },
};
```

Check the component's props before using `defaultOpen` --- some Reka UI roots forward `open` instead.
If neither is forwarded, open it from a `play` function that clicks the trigger; the snapshot is captured after `play` finishes.

## Asserting behavior (`play` functions)

```ts
import { expect, fn, waitFor } from "storybook/test";

export const Checked: Story = {
  args: { "onUpdate:modelValue": fn() },
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getByRole("checkbox"));
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith(true);
  },
};
```

- An emit `update:modelValue` becomes the arg key `"onUpdate:modelValue": fn()`.
- Query through `canvas` (scoped to the story root); wrap async assertions in `waitFor`.
- Assert the payload (`toHaveBeenCalledWith(...)`), not just that the spy fired.
- A `play`-only story with no meaningful rendered state (e.g. one that spawns a toast on click) gets `tags: ["!snapshot"]` to skip visual baselines.

See `Button.stories.ts` for a full `play` example with a `fn()` spy.

## Visual snapshots

Every story is captured in both Firefox and Edge, headless, on every platform --- baselines are scoped per browser, not per OS, so a contributor on any OS produces the same files CI checks against.
Baselines live at `packages/ui/__vis__/<firefox|edge>/__baselines__/<Component>/<story-kebab>-{light,dark}.png` and are committed; `__results__`/`__diffs__` are gitignored.

```bash
# A story with no baseline fails with "has no baseline image" instead of comparing.
pnpm --filter @embroiderly/ui test

# Write missing/changed baselines, then re-run without -u to confirm they now pass.
pnpm --filter @embroiderly/ui test -u
```

Both browsers run headless, even locally --- headed vs. headless rendering of the same browser produces slightly different anti-aliasing, so headless is used everywhere to keep local and CI captures identical.

## Unit tests (composables & utils)

Ordinary Vitest, no story, no browser:

```ts
import { describe, expect, test } from "vitest";

import { useShortcuts } from "./useShortcuts.ts";

describe("useShortcuts", () => {
  test("registers a handler", () => {
    // ...
  });
});
```

`pnpm --filter @embroiderly/ui test` runs these alongside the story-driven tests.
