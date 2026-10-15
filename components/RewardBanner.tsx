import { RECOMMENDATION_DISCOUNT } from "@/lib/cart";
import { HeartIcon } from "./HeartIcon";

// The offer at the top of the cart. Before the recommended piece is added it
// explains the deal; afterwards it confirms it, fading the message in while
// the cart celebrates.
export function RewardBanner({
  unlocked,
  celebrating,
}: {
  unlocked: boolean;
  celebrating: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-petal/60 px-14 py-5 text-center">
      <HeartIcon className="absolute left-4 top-6 size-6 -rotate-12 text-cherry/60" />
      <HeartIcon className="absolute left-7 top-14 size-4 rotate-12 text-cherry/50" />
      <HeartIcon className="absolute right-4 top-5 size-6 rotate-12 text-cherry/60" />
      <HeartIcon className="absolute right-8 top-12 size-4 -rotate-12 text-cherry/50" />

      <p className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.25em] text-cherry/80">
        {unlocked ? "A little treat unlocked" : "A little treat for you"}
        <HeartIcon className="size-3.5" />
      </p>

      {unlocked ? (
        <div className={`mt-2 ${celebrating ? "offer-appear" : ""}`}>
          <p className="text-lg leading-snug">
            Yay, it&apos;s yours!
            <br />
            <strong className="font-semibold text-cherry">
              Your {RECOMMENDATION_DISCOUNT}% off is unlocked
            </strong>
          </p>
        </div>
      ) : (
        <p className="mt-2 text-lg leading-snug">
          Add the piece we picked for you and get
          <br />
          <strong className="font-semibold text-cherry">
            {RECOMMENDATION_DISCOUNT}% off your entire order!
          </strong>
        </p>
      )}

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/70">
        <div
          className={`h-full rounded-full bg-cherry transition-[width] duration-700 ${unlocked ? "w-full" : "w-1/2"}`}
        />
      </div>
    </div>
  );
}
