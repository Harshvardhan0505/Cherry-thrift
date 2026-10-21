import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false },
};

// Log in and first-time setup: a small card on cream paper.
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-cream px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center text-[15px] font-medium uppercase tracking-[0.2em] text-cherry">Cherry Thrifts</p>
        <p className="mt-1.5 text-center">
          <span className="rounded-full bg-blush px-2.5 py-0.5 text-[11px] uppercase tracking-[0.12em] text-rose">Admin</span>
        </p>
        <div className="mt-8 rounded-[24px] border border-seam bg-white p-7">{children}</div>
      </div>
    </main>
  );
}
