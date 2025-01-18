export const inputnumber = {
  root: { transitionDuration: "{transition.duration}" },
  button: {
    width: "{button.icon.only.width}",
    borderRadius: "{form.field.border.radius}",
    verticalPadding: "{form.field.padding.y}",
  },
  colorScheme: {
    light: {
      button: {
        background: "transparent",
        hoverBackground: "{surface.100}",
        activeBackground: "{surface.200}",
        borderColor: "{form.field.border.color}",
        hoverBorderColor: "{form.field.border.color}",
        activeBorderColor: "{form.field.border.color}",
        color: "{surface.400}",
        hoverColor: "{surface.500}",
        activeColor: "{surface.600}",
      },
    },
    dark: {
      button: {
        background: "transparent",
        hoverBackground: "{surface.800}",
        activeBackground: "{surface.900}",
        borderColor: "{form.field.border.color}",
        hoverBorderColor: "{form.field.border.color}",
        activeBorderColor: "{form.field.border.color}",
        color: "{text.muted.color}",
        hoverColor: "{text.muted.color}",
        activeColor: "{text.muted.color}",
      },
    },
  },
};
