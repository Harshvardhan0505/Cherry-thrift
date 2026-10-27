import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PieceForm } from "@/components/admin/PieceForm";
import { SanityKeyNotice } from "@/components/admin/SanityKeyNotice";
import { requireStaff } from "@/lib/admin-auth";
import { getAdminPiece } from "@/lib/admin-pieces";
import { hasSanityWriteToken } from "@/lib/sanity-write";

export const metadata: Metadata = {
  title: "Edit piece",
};

export default function EditPiecePage({ params }: PageProps<"/admin/pieces/[id]">) {
  return (
    <main className="px-4 py-5 sm:px-8 sm:py-7">
      <Link href="/admin/pieces" className="text-sm text-rose hover:text-cherry">
        ← Pieces
      </Link>
      <Suspense fallback={<p className="py-20 text-center text-rose">Loading piece…</p>}>
        <EditPiece params={params} />
      </Suspense>
    </main>
  );
}

async function EditPiece({ params }: { params: PageProps<"/admin/pieces/[id]">["params"] }) {
  await requireStaff();
  const { id } = await params;
  const piece = await getAdminPiece(id);
  if (!piece) notFound();
  const canSave = hasSanityWriteToken();
  return (
    <>
      <h1 className="mt-2 font-serif text-[38px] leading-none">{piece.name}</h1>
      {!canSave && <SanityKeyNotice />}
      <div className="mt-5">
        <PieceForm piece={piece} canSave={canSave} />
      </div>
    </>
  );
}
