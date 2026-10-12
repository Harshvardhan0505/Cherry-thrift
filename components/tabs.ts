// Shared look for the category tabs on the home page and the category pages.
export function tabClass(active: boolean): string {
  return [
    "cursor-pointer rounded-full border px-5 py-2 text-[1.02rem] transition-colors",
    active
      ? "border-cherry bg-cherry text-white"
      : "border-petal bg-white text-wine hover:border-cherry hover:text-cherry",
  ].join(" ");
}
