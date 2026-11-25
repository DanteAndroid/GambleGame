import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Shuffle } from 'lucide-react';
import type { GambleRecord, MangaSeriesId, MangaSeriesInfo } from '../types/gamble';
import { getCrossSeriesRecommendations } from '../utils/gambleRecommendations';
import { getThumbImageUrl, hasLocalAsset } from '../utils/imageUrl';
import { MangaSilhouette } from './MangaSilhouette';

interface CrossSeriesSectionProps {
  currentGamble: GambleRecord;
  allGambles: readonly GambleRecord[];
  liveSeriesLookup: Record<MangaSeriesId, MangaSeriesInfo>;
  onSelectGamble: (gambleId: string) => void;
  onOpenRandomGamble: () => void;
}

const BATCH_SIZE = 4;

/**
 * Cross-series editorial recommendation shelf on the detail page.
 * Bridges readers from the current game to mechanic-related games in other manga series.
 */
export function CrossSeriesSection({
  currentGamble,
  allGambles,
  liveSeriesLookup,
  onSelectGamble,
  onOpenRandomGamble,
}: CrossSeriesSectionProps) {
  const [batchIndex, setBatchIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    setBatchIndex(0);
  }, [currentGamble.id]);

  const recommendations = useMemo(
    () =>
      getCrossSeriesRecommendations(currentGamble, allGambles, {
        limit: BATCH_SIZE,
        offset: batchIndex * BATCH_SIZE,
      }),
    [currentGamble, allGambles, batchIndex]
  );

  if (recommendations.length === 0) {
    return null;
  }

  const markImageFailed = (key: string) => {
    setFailedImages((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  return (
    <section
      aria-labelledby="cross-series-heading"
      data-testid="cross-series-section"
      className="border-t border-[var(--border-subtle)] bg-[var(--bg-page)]"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-10 sm:py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 border-b border-[var(--border-hairline)]">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2
              id="cross-series-heading"
              className="font-mincho font-normal text-[21px] sm:text-[23px] text-[var(--text-primary)] tracking-[0.02em]"
            >
              其他作品里的同类玩法
            </h2>
            <span className="text-[12.5px] text-[var(--text-muted)]">
              按规则机制跨作品关联，方便换部漫画继续看
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              data-testid="cross-series-refresh-btn"
              onClick={() => setBatchIndex((prev) => (prev + 1) % 3)}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>换一批</span>
            </button>

            <span
              aria-hidden="true"
              className="w-px h-3 bg-[var(--border-subtle)]"
            />

            <button
              type="button"
              data-testid="cross-series-random-btn"
              onClick={onOpenRandomGamble}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brass)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
            >
              <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>随机一局</span>
            </button>
          </div>
        </div>

        <div
          key={`${currentGamble.id}-batch-${batchIndex}`}
          data-testid="cross-series-grid"
          className="disclosure-reveal mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {recommendations.map(({ gamble, reason }) => {
            const series = liveSeriesLookup[gamble.seriesId];
            const imgKey = `${gamble.id}:${gamble.artworkUrl}`;
            const imageBroken = failedImages.has(imgKey) || !hasLocalAsset(gamble.artworkUrl);

            return (
              <a
                key={gamble.id}
                href={`#gamble/${encodeURIComponent(gamble.id)}`}
                data-testid={`cross-series-card-${gamble.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectGamble(gamble.id);
                }}
                className="collector-card-interactive group flex items-stretch bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
              >
                <div className="w-[74px] sm:w-[78px] shrink-0 aspect-[128/182] sm:aspect-auto bg-[var(--bg-img)] border-r border-[var(--border-hairline)] overflow-hidden">
                  {imageBroken ? (
                    <div
                      className="w-full h-full bg-[#09090B] flex items-center justify-center p-2.5"
                      aria-hidden="true"
                    >
                      <MangaSilhouette motif={gamble.motif} className="w-12 h-auto" />
                    </div>
                  ) : (
                    <img
                      src={getThumbImageUrl(gamble.artworkUrl)}
                      alt={gamble.title}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => markImageFailed(imgKey)}
                      className={`w-full h-full object-cover block ${
                        gamble.cardImagePosition ?? 'object-center'
                      }`}
                    />
                  )}
                </div>

                <div className="p-3.5 min-w-0 flex-1 flex flex-col justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-[var(--brass)] truncate">
                      {reason}
                    </p>
                    <h3 className="mt-1 font-mincho font-normal text-[16.5px] leading-[1.32] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {gamble.title}
                    </h3>
                    <p className="mt-1.5 font-sans text-[12px] leading-[1.65] text-[var(--text-secondary)] line-clamp-2">
                      {gamble.oneLineRule}
                    </p>
                  </div>

                  <p className="pt-2 border-t border-[var(--border-hairline)] text-[11px] text-[var(--text-muted)] truncate">
                    《{series.title}》 · {gamble.category}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
