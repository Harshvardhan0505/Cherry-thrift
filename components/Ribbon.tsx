const WORDS = ["one of a kind", "pre-loved", "hand-picked", "thrifted, not basic", "tops · skirts · purses"];

// A cherry strip of words sliding sideways, along the top of the shop sheet.
// The list is drawn twice so the loop has no gap; the copy is hidden from
// screen readers, and it holds still for people who turn off animations.
export function Ribbon() {
  const run = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {WORDS.map((word) => (
        <li key={word} className="flex items-center whitespace-nowrap">
          <span className="px-5">{word}</span>
          <span aria-hidden="true" className="text-petal">
            ♡
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="overflow-hidden bg-cherry py-3 text-[0.8rem] font-medium uppercase tracking-[0.28em] text-blush md:py-3.5 md:text-sm">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
