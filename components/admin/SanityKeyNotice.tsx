// Shown on the Pieces pages until the Sanity write key is set up.
export function SanityKeyNotice() {
  return (
    <div role="status" className="mt-4 rounded-2xl border border-petal bg-white p-4 text-sm leading-relaxed">
      <p className="font-medium text-cherry">One step left: the Sanity write key</p>
      <p className="mt-1 text-rose">
        Adding and editing pieces here needs a key that lets the site save to Sanity. Until it&apos;s added, you can
        still see your pieces, and add them in the Sanity Studio.
      </p>
    </div>
  );
}
