import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PieceForm } from "@/components/admin/PieceForm";
import { SanityKeyNotice } from "@/components/admin/SanityKeyNotice";
import { requireStaff } from "@/lib/admin-auth";
import { hasSanityWriteToken } from "@/lib/sanity-write";

export const metadata: Metadata = {
  title: "Add a piece",
};

export default function NewPiecePage() {
  return (
    <main className="px-4 py-5 sm:px-8 sm:py-7">
      <Link href="/admin/pieces" className="text-sm text-rose hover:text-cherry">
        ← Pieces
      </Link>
      <h1 className="mt-2 font-serif text-[38px] leading-none">Add a piece</h1>
      <Suspense>
        <NewPiece />
      </Suspense>
    </main>
  );
}

async function NewPiece() {
  await requireStaff();
  const canSave = hasSanityWriteToken();
  return (
    <>
      {!canSave && <SanityKeyNotice />}
      <div className="mt-5">
        <PieceForm canSave={canSave} />
      </div>
    </>
  );
}
