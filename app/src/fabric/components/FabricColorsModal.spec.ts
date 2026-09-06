import { App } from "@embroiderly/ui";

import { describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent, ref } from "vue";

import { deserializeFabricColors, FabricColor } from "~/lib/pattern/";
import { createMockEditorContext } from "~test-utils/mock-editor-context.ts";
import type { MockEditorContext } from "~test-utils/mock-editor-context.ts";
import { renderComponent } from "~test-utils/render-component.ts";
import type { ComponentRenderOptions } from "~test-utils/render-component.ts";

import FabricColorsModal from "./FabricColorsModal.vue";

const SEED_COLORS = [
  new FabricColor(0, { name: "White", color: "FFFFFF" }),
  new FabricColor(1, { name: "Cream", color: "F1E3D1" }),
];

describe("FabricColorsModal", () => {
  const FabricColorsModalWrapper = defineComponent({
    components: { App, FabricColorsModal },
    inheritAttrs: false,
    setup() {
      return { open: ref(true) };
    },
    template: `<App><FabricColorsModal v-model:open="open" v-bind="$attrs" /></App>`,
  });

  function setupTest(
    options: {
      editorContext?: MockEditorContext;
      colors?: FabricColor[];
    } & Omit<ComponentRenderOptions, "editorContext" | "props"> = {},
  ) {
    const { editorContext = createMockEditorContext(), colors = SEED_COLORS, ...rest } = options;

    return renderComponent(FabricColorsModalWrapper, {
      ...rest,
      pinia: options.pinia ?? true,
      editorContext,
      props: { colors },
    });
  }

  test("renders every color as an editable row", async () => {
    const screen = await setupTest();

    await expect.element(screen.getByRole("dialog", { name: "Fabric Colors" })).toBeVisible();

    await expect.element(screen.getByRole("textbox", { name: "Name" }).nth(0)).toHaveValue("White");
    await expect.element(screen.getByRole("textbox", { name: "Name" }).nth(1)).toHaveValue("Cream");
  });

  test("Save is disabled until a change is made", async () => {
    const screen = await setupTest();

    await expect.element(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    await userEvent.fill(screen.getByRole("textbox", { name: "Name" }).nth(0), "Snow");

    await expect.element(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  test("adding a color appends and focuses a new row", async () => {
    const screen = await setupTest();

    await userEvent.click(screen.getByRole("button", { name: "Add color" }));

    const nameInputs = screen.getByRole("textbox", { name: "Name" });
    await expect.element(nameInputs.nth(2)).toHaveValue("New Color");
    await expect.element(nameInputs.nth(2)).toHaveFocus();
  });

  test("deleting a color removes its row", async () => {
    const screen = await setupTest();

    await userEvent.click(screen.getByRole("button", { name: "Delete color" }).nth(0));

    const nameInputs = screen.getByRole("textbox", { name: "Name" });
    await expect.element(nameInputs.nth(0)).toHaveValue("Cream");
  });

  describe("validation", () => {
    test("an empty (whitespace-only) name is flagged and blocks Save", async () => {
      const screen = await setupTest();

      await userEvent.fill(screen.getByRole("textbox", { name: "Name" }).nth(0), "   ");

      await expect.element(screen.getByText("Every color must have a unique, non-empty name.")).toBeVisible();
      await expect.element(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    test("a duplicate name is flagged on both rows and blocks Save", async () => {
      const screen = await setupTest();

      await userEvent.fill(screen.getByRole("textbox", { name: "Name" }).nth(0), "Cream");

      const nameInputs = screen.getByRole("textbox", { name: "Name" });
      await expect.element(nameInputs.nth(0)).toHaveAttribute("aria-invalid", "true");
      await expect.element(nameInputs.nth(1)).toHaveAttribute("aria-invalid", "true");
      await expect.element(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });

    test("fixing the duplicate re-enables Save", async () => {
      const screen = await setupTest();

      const nameInputs = screen.getByRole("textbox", { name: "Name" });
      await userEvent.fill(nameInputs.nth(0), "Cream");
      await userEvent.fill(nameInputs.nth(0), "Snow");

      await expect.element(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    });
  });

  describe("undo/redo", () => {
    test("Control+Z / Control+Y revert and reapply a committed change", async () => {
      const screen = await setupTest();

      const nameInput = screen.getByRole("textbox", { name: "Name" }).nth(0);
      await userEvent.fill(nameInput, "Snow");
      await userEvent.keyboard("{/Enter}");
      await userEvent.tab();

      await userEvent.keyboard("{Control>}z{/Control}");
      await expect.element(nameInput).toHaveValue("White");

      await userEvent.keyboard("{Control>}y{/Control}");
      await expect.element(nameInput).toHaveValue("Snow");
    });
  });

  describe("restore defaults", () => {
    test("opens a confirm dialog", async () => {
      const screen = await setupTest();

      await userEvent.click(screen.getByRole("button", { name: "Restore default set" }));

      await expect.element(screen.getByRole("alertdialog", { name: "Restore Default Fabric Colors" })).toBeVisible();
    });

    test("rejecting the confirm dialog keeps the current list", async () => {
      const screen = await setupTest();

      await userEvent.click(screen.getByRole("button", { name: "Restore default set" }));
      await userEvent.click(screen.getByRole("button", { name: "No" }));

      await expect.element(screen.getByRole("textbox", { name: "Name" }).nth(0)).toHaveValue("White");
    });

    test("accepting the confirm dialog replaces the list with the built-in defaults", async () => {
      const defaults = [
        { name: "Aida 14", color: "F5F5DC" },
        { name: "Aida 16", color: "FFFFFF" },
      ];
      vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(defaults)));

      const screen = await setupTest();

      await userEvent.click(screen.getByRole("button", { name: "Restore default set" }));
      await userEvent.click(screen.getByRole("button", { name: "Yes" }));

      const nameInputs = screen.getByRole("textbox", { name: "Name" });
      await expect.element(nameInputs.nth(0)).toHaveValue("Aida 14");
      await expect.element(nameInputs.nth(1)).toHaveValue("Aida 16");

      // Replacing the list is itself a change that marks the modal dirty.
      await expect.element(screen.getByRole("button", { name: "Save" })).toBeEnabled();

      vi.restoreAllMocks();
    });
  });

  describe("closing with unsaved changes", () => {
    test("Cancel opens a discard-confirmation dialog", async () => {
      const screen = await setupTest();

      await userEvent.fill(screen.getByRole("textbox", { name: "Name" }).nth(0), "Snow");
      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await expect.element(screen.getByRole("alertdialog", { name: "Discard Changes" })).toBeVisible();
    });

    test("Cancel closes immediately when there are no changes", async () => {
      const screen = await setupTest();

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      await expect.element(screen.getByRole("dialog", { name: "Fabric Colors" })).not.toBeInTheDocument();
    });

    test("the header close button opens a discard-confirmation dialog if there are unsaved changes", async () => {
      const screen = await setupTest();

      await userEvent.fill(screen.getByRole("textbox", { name: "Name" }).nth(0), "Snow");
      await userEvent.click(screen.getByRole("button", { name: "Close" }));

      await expect.element(screen.getByRole("alertdialog", { name: "Discard Changes" })).toBeVisible();
      expect(screen.baseElement.querySelector('[data-slot="content"][role="dialog"]')).not.toBeNull();
    });

    test("accepting the discard confirmation from the header close button closes the modal", async () => {
      const screen = await setupTest();

      await userEvent.fill(screen.getByRole("textbox", { name: "Name" }).nth(0), "Snow");
      await userEvent.click(screen.getByRole("button", { name: "Close" }));
      await userEvent.click(screen.getByRole("button", { name: "Yes" }));

      await expect.element(screen.getByRole("dialog", { name: "Fabric Colors" })).not.toBeInTheDocument();
    });
  });

  test("Save writes the current list, in order, to OPFS", async () => {
    const editorContext = createMockEditorContext();
    const screen = await setupTest({ editorContext });

    await userEvent.fill(screen.getByRole("textbox", { name: "Name" }).nth(0), "Snow");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(editorContext.files.saveFabricColors).toHaveBeenCalledTimes(1);

    const written = deserializeFabricColors(editorContext.files.saveFabricColors.mock.calls[0]![0]);
    expect(written.map((c) => ({ name: c.name, color: c.hex.slice(1) }))).toEqual([
      { name: "Snow", color: "FFFFFF" },
      { name: "Cream", color: "F1E3D1" },
    ]);
  });
});
