import { CategoryView, categoryMetadata } from "@/components/CategoryView";

export const metadata = categoryMetadata("jeans");

export default function Page() {
  return <CategoryView slug="jeans" />;
}
