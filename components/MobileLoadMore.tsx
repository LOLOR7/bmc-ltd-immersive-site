"use client";

import { useCallback, useState } from "react";

type MobileLoadMoreProps = {
  /** How many residences are about to be revealed by this click. */
  remaining: number;
  onLoadMore: () => void;
};

/**
 * Premium, sober "Load more" CTA shown between mobile project batches.
 * Matches the BMC visual language (cream stroke, uppercase tracking).
 *
 * Renders only on mobile via the parent's `useIsMobileViewport` gate; no
 * desktop branch ever mounts this component.
 *
 * Click is single-shot guarded (`isLoading`) so a double-tap cannot fire
 * `onLoadMore` twice before React commits the new `visibleCount`.
 */
export default function MobileLoadMore({
  remaining,
  onLoadMore,
}: MobileLoadMoreProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    onLoadMore();
    // Re-arm after the next paint so a fast user can click the next
    // "load more" batch without artificial wait, but the same click
    // cannot fire twice within a single frame.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsLoading(false));
    });
  }, [isLoading, onLoadMore]);

  return (
    <section
      className="mobile-load-more"
      data-mobile-load-more
      aria-label="Reveal more residences"
    >
      <div className="mobile-load-more__inner">
        <p className="mobile-load-more__eyebrow">More residences</p>
        <button
          type="button"
          className="mobile-load-more__btn"
          onClick={handleClick}
          disabled={isLoading}
        >
          Explore more residences
        </button>
        <p className="mobile-load-more__hint">
          {remaining === 1 ? "1 residence left" : `${remaining} residences left`}
        </p>
      </div>
    </section>
  );
}
