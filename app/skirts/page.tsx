import { CategoryView, categoryMetadata } from "@/components/CategoryView";

export const metadata = categoryMetadata("skirts");

export default function Page() {
  return <CategoryView slug="skirts" />;
}
