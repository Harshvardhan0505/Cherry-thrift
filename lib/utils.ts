// Joins class names, skipping empty ones. (shadcn components import `cn` from here.)
export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");
