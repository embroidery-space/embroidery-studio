export const button = {
  root: {
    iconOnlyWidth: "2.5rem",
    borderRadius: "{form.field.border.radius}",
    roundedBorderRadius: "2rem",
    gap: "0.5rem",
    paddingX: "{form.field.padding.x}",
    paddingY: "{form.field.padding.y}",
    sm: {
      fontSize: "{form.field.sm.font.size}",
      paddingX: "{form.field.sm.padding.x}",
      paddingY: "{form.field.sm.padding.y}",
    },
    lg: {
      fontSize: "{form.field.lg.font.size}",
      paddingX: "{form.field.lg.padding.x}",
      paddingY: "{form.field.lg.padding.y}",
    },
    label: { fontWeight: "400" },
    raisedShadow: "0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)",
    focusRing: {
      width: "{focus.ring.width}",
      style: "{focus.ring.style}",
      offset: "{focus.ring.offset}",
    },
    badgeSize: "1rem",
    transitionDuration: "{form.field.transition.duration}",
  },
  colorScheme: {
    light: {
      root: {
        primary: {
          background: "{primary.color}",
          hoverBackground: "{primary.hover.color}",
          activeBackground: "{primary.active.color}",
          borderColor: "{primary.color}",
          hoverBorderColor: "{primary.hover.color}",
          activeBorderColor: "{primary.active.color}",
          color: "{text.color}",
          hoverColor: "{text.color}",
          activeColor: "{text.color}",
          focusRing: { color: "{primary.color}", shadow: "none" },
        },
        secondary: {
          background: "{surface.600}",
          hoverBackground: "{surface.700}",
          activeBackground: "{surface.800}",
          borderColor: "{surface.600}",
          hoverBorderColor: "{surface.700}",
          activeBorderColor: "{surface.800}",
          color: "{text.color}",
          hoverColor: "{text.color}",
          activeColor: "{text.color}",
          focusRing: { color: "{surface.600}", shadow: "none" },
        },
      },
      outlined: {
        primary: {
          color: "{primary.700}",
          borderColor: "{primary.700}",
          hoverBackground: "color-mix(in srgb, {primary.color}, transparent 92%)",
          activeBackground: "color-mix(in srgb, {primary.color}, transparent 84%)",
        },
        secondary: {
          color: "{text.color}",
          borderColor: "{text.color}",
          hoverBackground: "color-mix(in srgb, {text.color}, transparent 92%)",
          activeBackground: "color-mix(in srgb, {text.color}, transparent 84%)",
        },
      },
      text: {
        primary: {
          color: "{primary.700}",
          hoverBackground: "color-mix(in srgb, {primary.color}, transparent 92%)",
          activeBackground: "color-mix(in srgb, {primary.color}, transparent 84%)",
        },
        secondary: {
          color: "{text.color}",
          hoverBackground: "color-mix(in srgb, {text.color}, transparent 92%)",
          activeBackground: "color-mix(in srgb, {text.color}, transparent 84%)",
        },
      },
      link: {
        color: "{primary.700}",
        hoverColor: "{primary.800}",
        activeColor: "{primary.900}",
      },
    },
    dark: {
      root: {
        primary: {
          background: "{primary.color}",
          hoverBackground: "{primary.hover.color}",
          activeBackground: "{primary.active.color}",
          borderColor: "{primary.color}",
          hoverBorderColor: "{primary.hover.color}",
          activeBorderColor: "{primary.active.color}",
          color: "{text.contrast.color}",
          hoverColor: "{text.contrast.color}",
          activeColor: "{text.contrast.color}",
          focusRing: { color: "{primary.color}", shadow: "none" },
        },
        secondary: {
          background: "{surface.600}",
          hoverBackground: "{surface.500}",
          activeBackground: "{surface.400}",
          borderColor: "{surface.600}",
          hoverBorderColor: "{surface.500}",
          activeBorderColor: "{surface.400}",
          color: "{text.color}",
          hoverColor: "{text.color}",
          activeColor: "{text.color}",
          focusRing: { color: "{surface.600}", shadow: "none" },
        },
      },
      outlined: {
        primary: {
          color: "{primary.color}",
          borderColor: "{primary.color}",
          hoverBackground: "color-mix(in srgb, {primary.color}, transparent 92%)",
          activeBackground: "color-mix(in srgb, {primary.color}, transparent 84%)",
        },
        secondary: {
          color: "{text.color}",
          borderColor: "{text.color}",
          hoverBackground: "color-mix(in srgb, {text.color}, transparent 92%)",
          activeBackground: "color-mix(in srgb, {text.color}, transparent 84%)",
        },
      },
      text: {
        primary: {
          color: "{primary.color}",
          hoverBackground: "color-mix(in srgb, {primary.color}, transparent 92%)",
          activeBackground: "color-mix(in srgb, {primary.color}, transparent 84%)",
        },
        secondary: {
          color: "{text.color}",
          hoverBackground: "color-mix(in srgb, {text.color}, transparent 92%)",
          activeBackground: "color-mix(in srgb, {text.color}, transparent 84%)",
        },
      },
      link: {
        color: "{primary.color}",
        hoverColor: "{primary.hover.color}",
        activeColor: "{primary.active.color}",
      },
    },
  },
};
