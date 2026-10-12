import { CategoryView, categoryMetadata } from "@/components/CategoryView";

export const metadata = categoryMetadata("tops");

export default function Page() {
  return <CategoryView slug="tops" />;
}
