import Image from "next/image";
import { findProduct, getCatalog } from "@/lib/catalog";
import { CherryIcon } from "./CherryIcon";
import { RibbonBow } from "./RibbonBow";

// The log in and sign up pages: a scrapbook of real pieces from the shop,
// taped down like polaroids, beside the form. Everything around the form is
// decoration, so it's hidden from screen readers.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper flex-1 overflow-x-clip">
      <div className="relative mx-auto grid max-w-[1180px] items-center gap-6 px-5 pb-16 pt-6 sm:px-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pt-12">
        <PhoneBoard />
        <DesktopBoard />

        <div className="relative z-10 mx-auto w-full max-w-[420px]">
          <CardDecor />
          <div className="relative rounded-[28px] bg-white px-6 pb-7 pt-8 shadow-[0_1px_2px_rgb(74_20_32/0.05),0_30px_60px_-36px_rgb(74_20_32/0.4)] sm:px-10 sm:pb-9 sm:pt-10">
            {children}
          </div>
          {/* Tied on the card's corner. */}
          <RibbonBow
            id="card-bow"
            className="absolute -right-3.5 -top-6 z-20 w-[50px] rotate-[16deg] drop-shadow-[0_8px_10px_rgb(74_20_32/0.18)] lg:-right-7 lg:-top-8 lg:w-[82px]"
          />
        </div>
      </div>
    </div>
  );
}

async function Polaroid({
  id,
  caption,
  className,
  photoClass,
  position = "center",
  sizes,
  eager = false,
  children,
}: {
  id: string;
  caption: string;
  className: string;
  photoClass: string;
  position?: string;
  sizes: string;
  // The biggest photo, seen first: load it straight away.
  eager?: boolean;
  children?: React.ReactNode;
}) {
  // If the piece is ever removed from the shop, its polaroid just isn't shown.
  const product = findProduct(await getCatalog(), id);
  if (!product) return null;
  return (
    <figure
      className={`absolute bg-white px-2.5 pt-2.5 shadow-[0_1px_2px_rgb(74_20_32/0.08),0_14px_30px_-14px_rgb(74_20_32/0.35)] ${className}`}
    >
      {children}
      <div className={`relative overflow-hidden bg-petal ${photoClass}`}>
        <Image
          src={product.image}
          alt=""
          fill
          sizes={sizes}
          loading={eager ? "eager" : undefined}
          className="object-cover"
          style={{ objectPosition: position }}
        />
      </div>
      <figcaption className="py-1.5 pb-2.5 text-center font-hand font-medium text-wine">{caption}</figcaption>
    </figure>
  );
}

function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`absolute ${className ?? ""}`} style={style}>
      <path d="M12 0c.8 6.6 5.4 11.2 12 12-6.6.8-11.2 5.4-12 12-.8-6.6-5.4-11.2-12-12C6.6 11.2 11.2 6.6 12 0Z" />
    </svg>
  );
}

function CherrySticker({ className }: { className: string }) {
  return (
    <div
      className={`absolute z-[5] grid -rotate-12 place-items-center rounded-full bg-white shadow-[0_0_0_3px_#fff,0_10px_20px_-10px_rgb(74_20_32/0.45)] ${className}`}
    >
      <CherryIcon className="w-3/5" />
    </div>
  );
}

// Laptops and up: three polaroids, stickers and notes.
function DesktopBoard() {
  return (
    <div
      aria-hidden="true"
      className="board-in relative hidden h-[610px] w-[600px] origin-top-left scale-[0.85] lg:block xl:scale-100"
    >
      <Polaroid
        id="top-cherry-corset"
        caption="the satin corset"
        className="left-1.5 top-[150px] z-[1] w-[212px] -rotate-8 text-[23px]"
        photoClass="h-[250px]"
        position="center 45%"
        sizes="200px"
      >
        <span className="absolute -left-5.5 -top-2.5 z-[4] h-[26px] w-[92px] -rotate-[38deg] bg-cherry/15 opacity-80" />
      </Polaroid>
      <Polaroid
        id="skirt-pink-floral"
        caption="pink floral maxi ♡"
        className="left-[170px] top-[26px] z-[2] w-[260px] rotate-3 text-[23px]"
        photoClass="h-[300px]"
        position="center 30%"
        sizes="250px"
        eager
      >
        <span className="washi absolute -top-3.5 left-1/2 z-[4] h-[26px] w-[92px] -translate-x-1/2 -rotate-4 opacity-80" />
      </Polaroid>
      <Polaroid
        id="purse-tan-tote"
        caption="tan tote era"
        className="left-[372px] top-[300px] z-[3] w-[196px] rotate-7 text-[23px]"
        photoClass="h-[220px]"
        position="center 70%"
        sizes="190px"
      >
        <span className="washi absolute -right-6.5 -top-3 z-[4] h-[26px] w-[92px] rotate-40 opacity-80" />
      </Polaroid>

      <CherrySticker className="left-[400px] top-1 size-[84px]" />
      <span className="absolute left-[26px] top-[492px] z-[5] -rotate-6 rounded-full bg-cherry px-[18px] py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white shadow-[0_10px_20px_-10px_rgb(181_18_62/0.7)]">
        One of a kind
      </span>
      <p className="absolute left-[30px] top-[552px] -rotate-3 whitespace-nowrap font-hand text-[31px] font-medium text-cherry">
        fresh finds, just for you
      </p>
      <svg
        viewBox="52 22 20 18"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        className="absolute left-[238px] top-[470px] h-[26px] w-[30px] text-cherry"
      >
        <path d="M58 32c-3-5 3-9 6-5 3-4 9 0 6 5l-6 6-6-6Z" />
      </svg>
      <RibbonBow
        id="board-bow"
        tone="cherry"
        className="absolute -left-4 top-[508px] z-[6] w-[50px] -rotate-16 drop-shadow-[0_8px_10px_rgb(74_20_32/0.18)]"
      />
      <Sparkle className="size-[18px] text-cherry" style={{ left: 120, top: 40 }} />
      <Sparkle className="size-3 text-[#e7a7b6]" style={{ left: 28, top: 96 }} />
      <Sparkle className="size-3.5 text-[#e7a7b6]" style={{ left: 548, top: 250 }} />
    </div>
  );
}

// Phones and tablets: two polaroids and a cherry, above the form.
function PhoneBoard() {
  return (
    <div aria-hidden="true" className="board-in relative mx-auto h-[284px] w-[340px] lg:hidden">
      <Polaroid
        id="top-cherry-corset"
        caption="the satin corset"
        className="left-3.5 top-14 w-[150px] -rotate-8 text-[15px]"
        photoClass="h-[160px]"
        position="center 45%"
        sizes="140px"
      >
        <span className="absolute -left-2 -top-2.5 z-[4] h-[22px] w-[70px] -rotate-[38deg] bg-cherry/15 opacity-80" />
      </Polaroid>
      <Polaroid
        id="skirt-pink-floral"
        caption="pink floral maxi ♡"
        className="left-[150px] top-5 z-[2] w-[164px] rotate-3 text-[19px]"
        photoClass="h-[186px]"
        position="center 30%"
        sizes="160px"
        eager
      >
        <span className="washi absolute -top-3 left-1/2 z-[4] h-[22px] w-[70px] -translate-x-1/2 -rotate-4 opacity-80" />
      </Polaroid>
      <CherrySticker className="left-[280px] top-0 size-16" />
    </div>
  );
}

// Laptops and up: a love letter tucked behind the card, a puffy heart and a
// signed-off "xoxo".
function CardDecor() {
  return (
    <div aria-hidden="true" className="hidden lg:block">
      <svg
        viewBox="0 0 150 104"
        className="absolute -left-[122px] top-[30px] w-[150px] -rotate-11 drop-shadow-[0_8px_10px_rgb(74_20_32/0.18)]"
      >
        <rect x="4" y="4" width="142" height="96" rx="6" fill="#fffaf6" stroke="#f0d3da" strokeWidth="1.5" />
        <path d="M6 8l69 50 69-50" fill="none" stroke="#efcdd5" strokeWidth="1.5" />
        <path d="M6 98l52-38M144 98L92 60" fill="none" stroke="#f3dbe0" strokeWidth="1.2" />
        <circle cx="75" cy="58" r="17" fill="#b5123e" />
        <circle cx="75" cy="58" r="13" fill="none" stroke="#8e0c33" strokeWidth="1.2" opacity=".6" />
        <path d="M75 66s-7-4.4-7-9a3.6 3.6 0 0 1 7-1.6A3.6 3.6 0 0 1 82 57c0 4.6-7 9-7 9Z" fill="#fff" opacity=".9" />
      </svg>
      <svg
        viewBox="0 0 74 68"
        className="absolute -left-[84px] top-[466px] z-20 w-[74px] rotate-10 drop-shadow-[0_8px_10px_rgb(74_20_32/0.18)]"
      >
        <defs>
          <radialGradient id="puffy-heart" cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#ffd6e0" />
            <stop offset=".6" stopColor="#f48aa6" />
            <stop offset="1" stopColor="#d9476e" />
          </radialGradient>
        </defs>
        <path
          d="M37 62S5 43 5 22A15 15 0 0 1 37 15a15 15 0 0 1 32 7c0 21-32 40-32 40Z"
          fill="url(#puffy-heart)"
          stroke="#fff"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <ellipse cx="22" cy="22" rx="6" ry="4" fill="#fff" opacity=".6" transform="rotate(-30 22 22)" />
      </svg>
      <p className="absolute -bottom-9 -right-9 -rotate-8 font-hand text-[34px] font-semibold text-cherry">xoxo</p>
      <Sparkle className="size-4 text-cherry" style={{ left: -30, top: 284 }} />
      <Sparkle className="size-5 text-[#e7a7b6]" style={{ right: -58, top: 256 }} />
      <Sparkle className="size-3 text-cherry" style={{ left: 318, bottom: -46 }} />
    </div>
  );
}
