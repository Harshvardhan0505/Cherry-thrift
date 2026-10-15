import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

// The home page: the header sits on top of the hero photo.
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader overlay />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
