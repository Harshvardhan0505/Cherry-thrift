import { CategoryView, categoryMetadata } from "@/components/CategoryView";

export const metadata = categoryMetadata("purses");

export default function Page() {
  return <CategoryView slug="purses" />;
}
