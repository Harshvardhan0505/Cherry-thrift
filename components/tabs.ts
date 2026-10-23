// Shared look for the category tabs on the home page and the category pages:
// pills sitting in one frosted white track.
export const tabListClass =
  "inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/80 bg-white/70 p-1.5 shadow-[var(--shadow-rest)] backdrop-blur";

export function tabClass(active: boolean): string {
  return [
    "cursor-pointer whitespace-nowrap rounded-full px-5 py-2 text-[0.98rem] transition-[background-color,color,box-shadow] duration-300 sm:px-7",
    active
      ? "bg-cherry text-white shadow-[0_8px_18px_-10px_rgb(181_18_62/0.8)]"
      : "text-wine hover:bg-blush hover:text-cherry",
  ].join(" ");
}
