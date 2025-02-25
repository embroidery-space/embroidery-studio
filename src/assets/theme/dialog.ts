export const dialog = {
  root: {
    background: "{overlay.modal.background}",
    borderColor: "{overlay.modal.border.color}",
    color: "{overlay.modal.color}",
    borderRadius: "{overlay.modal.border.radius}",
    shadow: "{overlay.modal.shadow}",
  },
  header: { padding: "{overlay.modal.padding} {overlay.modal.padding} 0 {overlay.modal.padding}", gap: "0.5rem" },
  title: { fontSize: "1.25rem", fontWeight: "600" },
  content: { padding: "{overlay.modal.padding}" },
  footer: { padding: "0 {overlay.modal.padding} {overlay.modal.padding} {overlay.modal.padding}", gap: "0.5rem" },
};
