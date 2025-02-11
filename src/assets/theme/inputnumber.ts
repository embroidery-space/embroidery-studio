export const inputnumber = {
  root: { transitionDuration: "{transition.duration}" },
  button: {
    background: "transparent",
    width: "{button.icon.only.width}",
    borderRadius: "{form.field.border.radius}",
    verticalPadding: "{form.field.padding.y}",
    borderColor: "{form.field.border.color}",
    hoverBorderColor: "{form.field.border.color}",
    activeBorderColor: "{form.field.border.color}",
    color: "{text.muted.color}",
    hoverColor: "{text.muted.color}",
    activeColor: "{text.muted.color}",
  },
  colorScheme: {
    light: { button: { hoverBackground: "{surface.500}", activeBackground: "{surface.600}" } },
    dark: { button: { hoverBackground: "{surface.800}", activeBackground: "{surface.900}" } },
  },
};
