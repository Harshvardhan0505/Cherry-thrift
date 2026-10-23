import Image from "next/image";
import mark from "@/public/brand/logo-mark.png";
import wordmark from "@/public/brand/logo-wordmark.png";
import { site } from "@/lib/site";

// The logo side by side: the CT cherry monogram, then CHERRY / THRIFT.
// Cut from the stacked logo (public/brand/logo.png) for headers. The images
// are wine on transparent; add `brightness-0 invert` for a white version.
export function Logo({ className = "", imageClass = "" }: { className?: string; imageClass?: string }) {
  return (
    <span role="img" aria-label={site.name} className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <Image
        src={mark}
        alt=""
        loading="eager"
        sizes="80px"
        className={`h-10 w-auto transition-[filter,rotate] duration-500 group-hover:-rotate-3 md:h-12 ${imageClass}`}
      />
      <Image
        src={wordmark}
        alt=""
        loading="eager"
        sizes="200px"
        className={`h-[30px] w-auto transition-[filter] duration-500 md:h-9 ${imageClass}`}
      />
    </span>
  );
}
