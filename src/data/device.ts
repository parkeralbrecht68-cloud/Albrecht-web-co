const key = (label: string, width = 1) => ({ label, width });

/** Shared by the physical scene and the HTML portfolio presentation. */
export const macbookKeyboard = [
  [key("esc", 1.3), ...Array.from({ length: 12 }, (_, i) => key(`F${i + 1}`)), key("⏻", 1.2)],
  [key("`"), ..."1234567890".split("").map((label) => key(label)), key("−"), key("="), key("delete", 1.6)],
  [key("tab", 1.5), ..."QWERTYUIOP".split("").map((label) => key(label)), key("["), key("]"), key("\\", 1.1)],
  [key("caps lock", 1.8), ..."ASDFGHJKL".split("").map((label) => key(label)), key(";"), key("’"), key("return", 1.8)],
  [key("shift", 2.2), ..."ZXCVBNM".split("").map((label) => key(label)), key(","), key("."), key("/"), key("shift", 2.4)],
  [key("fn"), key("control", 1.1), key("option", 1.1), key("⌘", 1.35), key("", 4.8), key("⌘", 1.35), key("option", 1.1), key("←"), key("↑↓"), key("→")],
];
