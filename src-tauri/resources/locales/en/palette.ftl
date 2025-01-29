palette-title = Palette: { $size ->
    [0] empty
    [one] { $size } color
    *[other] { $size } colors
  }
palette-empty-message = The palette is empty

palette-menu-option-edit-palette = Edit Palette

palette-menu-option-colors = Colors
palette-menu-option-delete-selected =
  { $selected ->
    [0] Delete Selected
    *[other] Delete { $selected } Selected
  }
palette-menu-option-select-all = Select All
