export const semantic = {
  primary:  { 50: "#e5f2f5", 100: "#daecf1", 200: "#c8e2e9", 300: "#b2d7e1", 400: "#a0cdd9", 500: "#88c0d0", 600: "#69b0c4", 700: "#479cb3", 800: "#3b8296", 900: "#2a5c6a", 950: "#1e434d" }, // prettier-ignore
  danger:   { 50: "#f6e9eb", 100: "#f2dee0", 200: "#e7c5c8", 300: "#ddacb1", 400: "#d18f95", 500: "#bf616a", 600: "#b8515b", 700: "#a3424c", 800: "#86363e", 900: "#5e262c", 950: "#411a1e" }, // prettier-ignore
  warn:     { 50: "#f9efdc", 100: "#f8ecd3", 200: "#f5e4c2", 300: "#f2dcb1", 400: "#efd49f", 500: "#ebcb8b", 600: "#e3b55a", 700: "#d59a25", 800: "#b2811f", 900: "#7e5b16", 950: "#5b4210" }, // prettier-ignore
  succsess: { 50: "#eaf0e5", 100: "#e2ebdb", 200: "#d5e2cb", 300: "#c6d6b7", 400: "#b6cba4", 500: "#a3be8c", 600: "#8dae70", 700: "#789c58", 800: "#64824a", 900: "#465b34", 950: "#354427" }, // prettier-ignore
  info:     { 50: "#e7edf3", 100: "#dae2ec", 200: "#c2d0e0", 300: "#a7bbd2", 400: "#89a3c2", 500: "#5e81ac", 600: "#51749e", 700: "#49688d", 800: "#39516f", 900: "#28394d", 950: "#1c2736" }, // prettier-ignore
  help:     { 50: "#f1eaef", 100: "#ede3eb", 200: "#e0d1de", 300: "#d4bfd0", 400: "#c6a9c1", 500: "#b48ead", 600: "#aa7ea2", 700: "#9b6992", 800: "#84587c", 900: "#593b53", 950: "#3d293a" }, // prettier-ignore
  transitionDuration: "0.2s",
  focusRing: {
    width: "1px",
    style: "solid",
    color: "{primary.color}",
    offset: "2px",
    shadow: "none",
  },
  disabledOpacity: "0.6",
  iconSize: "1rem",
  anchorGutter: "2px",
  formField: {
    paddingX: "0.625rem",
    paddingY: "0.5rem",
    sm: {
      fontSize: "0.875rem",
      paddingX: "0.5rem",
      paddingY: "0.375rem",
    },
    lg: {
      fontSize: "1.125rem",
      paddingX: "0.75rem",
      paddingY: "0.625rem",
    },
    borderRadius: "{border.radius.md}",
    focusRing: {
      width: "0",
      style: "none",
      color: "transparent",
      offset: "0",
      shadow: "none",
    },
    transitionDuration: "{transition.duration}",
  },
  list: {
    padding: "0.25rem 0.25rem",
    gap: "2px",
    header: {
      padding: "0.5rem 1rem 0.25rem 1rem",
    },
    option: {
      padding: "0.5rem 0.75rem",
      borderRadius: "{border.radius.sm}",
    },
    optionGroup: {
      padding: "0.5rem 0.75rem",
      fontWeight: "600",
    },
  },
  content: {
    borderRadius: "{border.radius.md}",
  },
  mask: {
    transitionDuration: "0.15s",
  },
  navigation: {
    list: {
      padding: "0.25rem 0.25rem",
      gap: "2px",
    },
    item: {
      padding: "0.5rem 0.75rem",
      borderRadius: "{border.radius.sm}",
      gap: "0.5rem",
    },
    submenuLabel: {
      padding: "0.5rem 0.75rem",
      fontWeight: "600",
    },
    submenuIcon: {
      size: "0.875rem",
    },
  },
  overlay: {
    select: {
      borderRadius: "{border.radius.md}",
      shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    },
    popover: {
      borderRadius: "{border.radius.md}",
      padding: "0.75rem",
      shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    },
    modal: {
      borderRadius: "{border.radius.xl}",
      padding: "1.25rem",
      shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    },
    navigation: {
      shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    },
  },
  colorScheme: {
    light: {
      surface: {
        0: "#ffffff",
        50: "{slate.50}",
        100: "{slate.100}",
        200: "{slate.200}",
        300: "{slate.300}",
        400: "{slate.400}",
        500: "{slate.500}",
        600: "{slate.600}",
        700: "{slate.700}",
        800: "{slate.800}",
        900: "{slate.900}",
        950: "{slate.950}",
      },
      primary: {
        color: "{primary.500}",
        contrastColor: "#ffffff",
        hoverColor: "{primary.600}",
        activeColor: "{primary.700}",
      },
      highlight: {
        background: "{primary.50}",
        focusBackground: "{primary.100}",
        color: "{primary.700}",
        focusColor: "{primary.800}",
      },
      mask: {
        background: "rgba(0,0,0,0.4)",
        color: "{surface.200}",
      },
      formField: {
        background: "{surface.0}",
        disabledBackground: "{surface.200}",
        filledBackground: "{surface.50}",
        filledHoverBackground: "{surface.50}",
        filledFocusBackground: "{surface.50}",
        borderColor: "{surface.300}",
        hoverBorderColor: "{surface.400}",
        focusBorderColor: "{primary.color}",
        invalidBorderColor: "{red.400}",
        color: "{surface.700}",
        disabledColor: "{surface.500}",
        placeholderColor: "{surface.500}",
        invalidPlaceholderColor: "{red.600}",
        floatLabelColor: "{surface.500}",
        floatLabelFocusColor: "{primary.600}",
        floatLabelActiveColor: "{surface.500}",
        floatLabelInvalidColor: "{form.field.invalid.placeholder.color}",
        iconColor: "{surface.400}",
        shadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgba(18, 18, 23, 0.05)",
      },
      text: {
        color: "{surface.700}",
        hoverColor: "{surface.800}",
        mutedColor: "{surface.500}",
        hoverMutedColor: "{surface.600}",
      },
      content: {
        background: "{surface.0}",
        hoverBackground: "{surface.100}",
        borderColor: "{surface.200}",
        color: "{text.color}",
        hoverColor: "{text.hover.color}",
      },
      overlay: {
        select: {
          background: "{surface.0}",
          borderColor: "{surface.200}",
          color: "{text.color}",
        },
        popover: {
          background: "{surface.0}",
          borderColor: "{surface.200}",
          color: "{text.color}",
        },
        modal: {
          background: "{surface.0}",
          borderColor: "{surface.200}",
          color: "{text.color}",
        },
      },
      list: {
        option: {
          focusBackground: "{surface.100}",
          selectedBackground: "{highlight.background}",
          selectedFocusBackground: "{highlight.focus.background}",
          color: "{text.color}",
          focusColor: "{text.hover.color}",
          selectedColor: "{highlight.color}",
          selectedFocusColor: "{highlight.focus.color}",
          icon: {
            color: "{surface.400}",
            focusColor: "{surface.500}",
          },
        },
        optionGroup: {
          background: "transparent",
          color: "{text.muted.color}",
        },
      },
      navigation: {
        item: {
          focusBackground: "{surface.100}",
          activeBackground: "{surface.100}",
          color: "{text.color}",
          focusColor: "{text.hover.color}",
          activeColor: "{text.hover.color}",
          icon: {
            color: "{surface.400}",
            focusColor: "{surface.500}",
            activeColor: "{surface.500}",
          },
        },
        submenuLabel: {
          background: "transparent",
          color: "{text.muted.color}",
        },
        submenuIcon: {
          color: "{surface.400}",
          focusColor: "{surface.500}",
          activeColor: "{surface.500}",
        },
      },
    },
    dark: {
      surface: { 50: "#e4e7ec", 100: "#d5d9e1", 200: "#b5bcca", 300: "#8893aa", 400: "#4c566a", 500: "#434c5e", 600: "#3b4252", 700: "#2e3440", 800: "#2b303b", 900: "#22272f", 950: "#171b21" }, // prettier-ignore
      primary: {
        color: "{primary.500}",
        contrastColor: "{surface.700}",
        hoverColor: "{primary.400}",
        activeColor: "{primary.300}",
      },
      danger: {
        color: "{danger.500}",
        contrastColor: "{surface.700}",
        hoverColor: "{danger.400}",
        activeColor: "{danger.300}",
      },
      warn: {
        color: "{warn.500}",
        contrastColor: "{surface.700}",
        hoverColor: "{warn.400}",
        activeColor: "{warn.300}",
      },
      success: {
        color: "{success.500}",
        contrastColor: "{surface.700}",
        hoverColor: "{success.400}",
        activeColor: "{success.300}",
      },
      info: {
        color: "{info.500}",
        contrastColor: "{surface.700}",
        hoverColor: "{info.400}",
        activeColor: "{info.300}",
      },
      help: {
        color: "{help.500}",
        contrastColor: "{surface.700}",
        hoverColor: "{help.400}",
        activeColor: "{help.300}",
      },
      highlight: {
        background: "color-mix(in srgb, {primary.500}, transparent 84%)",
        focusBackground: "color-mix(in srgb, {primary.500}, transparent 76%)",
        color: "rgba(236, 239, 244, 0.87)", // {text.color}
        focusColor: "rgba(236, 239, 244, 0.87)", // {text.color}
      },
      mask: {
        background: "rgba(0,0,0,0.6)",
        color: "{surface.200}",
      },
      formField: {
        background: "{surface.950}",
        disabledBackground: "{surface.700}",
        filledBackground: "{surface.800}",
        filledHoverBackground: "{surface.800}",
        filledFocusBackground: "{surface.800}",
        borderColor: "{surface.600}",
        hoverBorderColor: "{surface.500}",
        focusBorderColor: "{primary.color}",
        invalidBorderColor: "{red.300}",
        color: "{text.color}",
        disabledColor: "{surface.400}",
        placeholderColor: "{surface.400}",
        invalidPlaceholderColor: "{red.400}",
        floatLabelColor: "{surface.400}",
        floatLabelFocusColor: "{primary.color}",
        floatLabelActiveColor: "{surface.400}",
        floatLabelInvalidColor: "{form.field.invalid.placeholder.color}",
        iconColor: "{surface.400}",
        shadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgba(18, 18, 23, 0.05)",
      },
      text: {
        color: "#eceff4",
        contrastColor: "{surface.700}",
        hoverColor: "#e5e9f0",
        activeColor: "#d8dee9",
        mutedColor: "{surface.400}",
        hoverMutedColor: "{surface.300}",
      },
      content: {
        background: "{surface.700}",
        hoverBackground: "{surface.600}",
        borderColor: "{surface.500}",
        color: "{text.color}",
        hoverColor: "{text.hover.color}",
      },
      overlay: {
        select: {
          background: "{surface.900}",
          borderColor: "{surface.700}",
          color: "{text.color}",
        },
        popover: {
          background: "{surface.900}",
          borderColor: "{surface.700}",
          color: "{text.color}",
        },
        modal: {
          background: "{surface.900}",
          borderColor: "{surface.700}",
          color: "{text.color}",
        },
      },
      list: {
        option: {
          focusBackground: "{surface.800}",
          selectedBackground: "{highlight.background}",
          selectedFocusBackground: "{highlight.focus.background}",
          color: "{text.color}",
          focusColor: "{text.hover.color}",
          selectedColor: "{highlight.color}",
          selectedFocusColor: "{highlight.focus.color}",
          icon: {
            color: "{surface.500}",
            focusColor: "{surface.400}",
          },
        },
        optionGroup: {
          background: "transparent",
          color: "{text.muted.color}",
        },
      },
      navigation: {
        item: {
          focusBackground: "{primary.color}",
          activeBackground: "{primary.color}",
          color: "{text.color}",
          focusColor: "{text.contrast.color}",
          activeColor: "{text.contrast.color}",
          icon: {
            color: "{text.color}",
            focusColor: "{text.contrast.color}",
            activeColor: "{text.contrast.color}",
          },
        },
        submenuLabel: {
          background: "transparent",
          color: "{text.muted.color}",
        },
        submenuIcon: {
          color: "{text.color}",
          focusColor: "{text.contrast.color}",
          activeColor: "{text.contrast.color}",
        },
      },
    },
  },
};
