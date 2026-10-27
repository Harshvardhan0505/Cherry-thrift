import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { HideToggle } from "@/components/admin/PieceForm";
import { SanityKeyNotice } from "@/components/admin/SanityKeyNotice";
import { panel, primaryButton } from "@/components/admin/styles";
import { requireStaff } from "@/lib/admin-auth";
import { listAdminPieces, type AdminPieceRow } from "@/lib/admin-pieces";
import { categories, formatPrice } from "@/lib/products";
import { SANITY_STUDIO_URL } from "@/lib/sanity";
import { hasSanityWriteToken } from "@/lib/sanity-write";

export const metadata: Metadata = {
  title: "Admin pieces",
};

const FILTERS = {
  all: "All",
  available: "Available",
  sold: "Sold",
  hidden: "Hidden",
} as const;
type Filter = keyof typeof FILTERS;

const matches = (piece: AdminPieceRow, filter: Filter) =>
  filter === "all" ||
  (filter === "hidden" && piece.hidden) ||
  (filter === "sold" && piece.sold !== null) ||
  (filter === "available" && !piece.hidden && piece.sold === null);

export default function AdminPiecesPage({ searchParams }: PageProps<"/admin/pieces">) {
  return (
    <main className="px-4 py-5 sm:px-8 sm:py-7">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <h1 className="mr-auto font-serif text-[38px] leading-none">Pieces</h1>
        <a href={SANITY_STUDIO_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-rose hover:text-cherry">
          Sanity Studio ↗
        </a>
        <Link href="/admin/pieces/new" className={primaryButton}>
          + Add piece
        </Link>
      </div>
      <Suspense fallback={<p className="py-20 text-center text-rose">Loading pieces…</p>}>
        <Pieces searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Pieces({ searchParams }: { searchParams: PageProps<"/admin/pieces">["searchParams"] }) {
  await requireStaff();
  const params = await searchParams;
  const filter: Filter = typeof params.show === "string" && params.show in FILTERS ? (params.show as Filter) : "all";
  const saved = typeof params.saved === "string" ? params.saved.slice(0, 80) : null;
  const pieces = await listAdminPieces();
  const shown = pieces.filter((piece) => matches(piece, filter));
  const canSave = hasSanityWriteToken();

  return (
    <>
      {!canSave && <SanityKeyNotice />}
      {saved && (
        <p role="status" className="mt-4 rounded-2xl bg-[#e8f2e4] px-4 py-3 text-sm text-sage-deep">
          Saved “{saved}” ✓ It&apos;s in the shop within a moment.
        </p>
      )}

      <nav aria-label="Show" className="-mx-4 mt-5 overflow-x-auto border-b border-seam px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-1.5">
          {(Object.keys(FILTERS) as Filter[]).map((key) => {
            const on = key === filter;
            const count = pieces.filter((piece) => matches(piece, key)).length;
            return (
              <Link
                key={key}
                href={key === "all" ? "/admin/pieces" : `/admin/pieces?show=${key}`}
                aria-current={on ? "page" : undefined}
                className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 pb-3 pt-2 ${
                  on ? "border-cherry font-medium text-cherry" : "border-transparent text-rose hover:text-wine"
                }`}
              >
                {FILTERS[key]}
                <span className={`rounded-full px-1.5 text-[11px] font-medium ${on ? "bg-cherry text-white" : "bg-seam text-wine"}`}>
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {shown.length === 0 ? (
        <div className={`${panel} mt-4 px-6 py-14 text-center text-rose`}>
          {filter === "all" ? "No pieces yet. Add your first one!" : `No ${FILTERS[filter].toLowerCase()} pieces.`}
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((piece) => (
            <li key={piece.id} className={`${panel} flex flex-col overflow-hidden`}>
              <Link href={`/admin/pieces/${piece.id}`} className="group block">
                <div className="relative aspect-[4/5] bg-petal">
                  {piece.photos[0] && (
                    <Image
                      src={piece.photos[0].preview}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                      className={`object-cover ${piece.hidden || piece.sold ? "opacity-60" : ""}`}
                    />
                  )}
                  <StatusBadge piece={piece} />
                </div>
                <div className="px-3 pt-2.5">
                  <p className="truncate font-medium group-hover:text-cherry">{piece.name}</p>
                  <p className="text-[13px] text-rose">
                    {formatPrice(piece.price)} · {categories.find((category) => category.slug === piece.category)?.label}
                  </p>
                </div>
              </Link>
              <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 px-3 pb-3 pt-2">
                <Link href={`/admin/pieces/${piece.id}`} className="text-[13px] font-medium text-wine hover:text-cherry">
                  Edit
                </Link>
                {piece.sold ? (
                  <Link href={`/admin/orders?order=${piece.sold.orderId}`} className="text-[13px] text-rose hover:text-cherry">
                    Order #{piece.sold.number}
                  </Link>
                ) : (
                  <HideToggle id={piece.id} hidden={piece.hidden} canSave={canSave} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function StatusBadge({ piece }: { piece: AdminPieceRow }) {
  const [label, className] = piece.sold
    ? ["Sold", "bg-cherry text-white"]
    : piece.hidden
      ? ["Hidden", "bg-white/90 text-rose"]
      : ["Available", "bg-white/90 text-sage-deep"];
  return (
    <span className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}
