// Shared look for the category tabs on the home page and the category pages.
export function tabClass(active: boolean): string {
  return [
    "cursor-pointer border-b-2 pb-2 text-[1.05rem] transition-colors",
    active
      ? "border-cherry-deep text-cherry-deep"
      : "border-transparent text-rosewood hover:text-cherry",
  ].join(" ");
}
