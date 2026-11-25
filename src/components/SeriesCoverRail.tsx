import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  MangaSeriesId,
  MangaSeriesInfo,
  UpcomingMangaSeries,
} from '../types/gamble';
import { getThumbImageUrl } from '../utils/imageUrl';

export type ShelfSelectionId = 'all' | MangaSeriesId | string;

interface SeriesCoverRailProps {
  selectedId: ShelfSelectionId | null;
  liveSeries: readonly MangaSeriesInfo[];
  upcomingSeries: readonly UpcomingMangaSeries[];
  seriesCounts: Record<MangaSeriesId | 'all', number>;
  onSelectAll: () => void;
  onSelectLiveSeries: (seriesId: MangaSeriesId) => void;
  onSelectUpcomingSeries: (upcomingId: string) => void;
}

/**
 * Horizontal scrollable manga volume cover showcase (2x enlarged HD covers).
 * Hovering any cover scales the entire item (cover + title) smoothly in place
 * with generous internal track padding so neither the scaled item, its active
 * ring, nor its shadow is ever clipped, and surrounding layout never shifts.
 */
export function SeriesCoverRail({
  selectedId,
  liveSeries,
  upcomingSeries,
  seriesCounts,
  onSelectAll,
  onSelectLiveSeries,
  onSelectUpcomingSeries,
}: SeriesCoverRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    updateScrollEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollEdges, { passive: true });
    window.addEventListener('resize', updateScrollEdges);
    return () => {
      el.removeEventListener('scroll', updateScrollEdges);
      window.removeEventListener('resize', updateScrollEdges);
    };
  }, [updateScrollEdges, liveSeries.length, upcomingSeries.length]);

  const scrollByAmount = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 520, behavior: 'smooth' });
  };

  // Crisp HD B6 cover plates scaled across viewports (2.6x mobile, 5+ desktop)
  const itemBaseClass =
    'group cover-rail-item shrink-0 w-[122px] min-[400px]:w-[132px] sm:w-[168px] lg:w-[202px] xl:w-[214px] snap-start text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]';

  const mosaicSeries = liveSeries.slice(0, 9);

  return (
    <section
      aria-label="作品封面导航"
      data-testid="series-cover-rail"
      className="relative border-b border-[var(--border-subtle)] bg-[var(--bg-shelf)]/75"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2 relative">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="向左滚动作品列表"
            data-testid="rail-scroll-left"
            className="hidden md:inline-flex items-center justify-center absolute left-2 top-[42%] -translate-y-1/2 z-30 w-10 h-10 bg-[var(--bg-page)]/94 text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="向右滚动作品列表"
            data-testid="rail-scroll-right"
            className="hidden md:inline-flex items-center justify-center absolute right-2 top-[42%] -translate-y-1/2 z-30 w-10 h-10 bg-[var(--bg-page)]/94 text-[var(--text-primary)] border border-[var(--border-strong)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}

        {/* Left fade hint when scrolled right */}
        {canScrollLeft && (
          <div
            aria-hidden="true"
            className="pointer-events-none hidden sm:block absolute left-0 top-0 bottom-0 w-12 lg:w-14 bg-gradient-to-r from-[var(--bg-shelf)] to-transparent z-10"
          />
        )}

        {/* Right fade hint when overflow exists */}
        {canScrollRight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-14 bg-gradient-to-l from-[var(--bg-shelf)] to-transparent z-10"
          />
        )}

        {/* Horizontally Scrollable Cover Strip with Negative Margin Alignment & Safe Hover Padding */}
        <div
          ref={trackRef}
          data-testid="series-cover-track"
          className="flex items-start gap-3.5 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-proximity -mx-4 px-4 sm:-mx-4 sm:px-4 py-4 sm:py-5 lg:py-6"
        >
          {/* 0. All Works Collector Plate (3x3 9-Volume Mosaic) */}
          <button
            type="button"
            data-testid="series-cover-all"
            onClick={onSelectAll}
            aria-pressed={selectedId === 'all'}
            className={itemBaseClass}
          >
            <div
              className={`relative w-full aspect-[128/182] rounded-md overflow-hidden bg-[#101015] cover-plate-shadow transition-shadow duration-200 ${
                selectedId === 'all'
                  ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-shelf)]'
                  : 'ring-1 ring-[var(--border-subtle)] group-hover:ring-[var(--border-strong)]'
              }`}
            >
              <div className="grid grid-cols-3 grid-rows-3 w-full h-full opacity-45 group-hover:opacity-60 transition-opacity">
                {mosaicSeries.map((s) => (
                  <img
                    key={s.id}
                    src={getThumbImageUrl(s.coverUrl)}
                    alt=""
                    aria-hidden="true"
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover block"
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/58 to-black/35 flex flex-col items-center justify-center p-2.5 sm:p-3 text-center">
                <span className="font-display text-[28px] min-[400px]:text-[32px] sm:text-[40px] lg:text-[44px] leading-none text-[#F4F0E8] tracking-[0.14em] pl-[0.14em]">
                  全部
                </span>
                <span className="mt-2 sm:mt-3 w-6 sm:w-8 h-[1px] bg-[var(--brass)]" />
                <span className="mt-2 sm:mt-2.5 tabular-nums text-[10px] min-[400px]:text-[10.5px] sm:text-[11.5px] font-medium tracking-[0.04em] text-[#C8A66E] whitespace-nowrap">
                  {liveSeries.length}部作品 · {seriesCounts.all}个赌局
                </span>
              </div>
            </div>

            <div className="mt-2 sm:mt-2.5 px-0.5">
              <p
                className={`text-[13px] sm:text-[14.5px] font-medium truncate transition-colors ${
                  selectedId === 'all'
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                }`}
              >
                全部作品
              </p>
              <p className="mt-0.5 text-[11px] sm:text-[12px] tabular-nums text-[var(--brass)] truncate">
                {seriesCounts.all}个赌局
              </p>
            </div>
          </button>

          {/* 1–9. Canonical Live Manga Works (HD Vol.1 Covers) */}
          {liveSeries.map((series, idx) => {
            const active = selectedId === series.id;
            return (
              <button
                key={series.id}
                type="button"
                data-testid={`series-cover-${series.id}`}
                onClick={() => onSelectLiveSeries(series.id)}
                aria-pressed={active}
                className={itemBaseClass}
              >
                <div
                  className={`relative w-full aspect-[128/182] rounded-md overflow-hidden bg-[var(--bg-img)] cover-plate-shadow transition-shadow duration-200 ${
                    active
                      ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-shelf)]'
                      : 'ring-1 ring-[var(--img-ring)] group-hover:ring-[var(--border-strong)]'
                  }`}
                >
                  <img
                    src={getThumbImageUrl(series.coverUrl)}
                    alt={`《${series.title}》单行本封面`}
                    loading={idx < 5 ? 'eager' : 'lazy'}
                    fetchPriority={idx < 3 ? 'high' : 'auto'}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover block"
                  />
                </div>

                <div className="mt-2 sm:mt-2.5 px-0.5">
                  <p
                    title={series.title}
                    className={`text-[13px] sm:text-[14.5px] font-medium truncate transition-colors ${
                      active
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--text-primary)] group-hover:text-[var(--accent)]'
                    }`}
                  >
                    {series.title}
                  </p>
                  <p className="mt-0.5 text-[11px] sm:text-[12px] tabular-nums text-[var(--text-muted)] truncate">
                    {seriesCounts[series.id]}个赌局 · {series.author}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Optional Upcoming Manga Works (Rendered Only When Non-Empty) */}
          {upcomingSeries.length > 0 && (
            <>
              <div
                aria-hidden="true"
                className="shrink-0 self-stretch my-2 w-[1px] bg-[var(--border-subtle)]"
              />
              {upcomingSeries.map((item) => {
                const active = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`series-cover-${item.id}`}
                    onClick={() => onSelectUpcomingSeries(item.id)}
                    aria-pressed={active}
                    className={itemBaseClass}
                  >
                    <div
                      className={`relative w-full aspect-[128/182] rounded-md overflow-hidden bg-[var(--bg-img)] cover-plate-shadow transition-shadow duration-200 ${
                        active
                          ? 'ring-2 ring-[var(--brass)] ring-offset-2 ring-offset-[var(--bg-shelf)]'
                          : 'ring-1 ring-[var(--img-ring)] group-hover:ring-[var(--border-strong)]'
                      }`}
                    >
                      <img
                        src={getThumbImageUrl(item.coverUrl)}
                        alt={`《${item.title}》单行本封面`}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover block transition-[filter,opacity] duration-200 ${
                          active
                            ? 'saturate-100 opacity-100'
                            : 'saturate-[0.55] opacity-80 group-hover:saturate-100 group-hover:opacity-100'
                        }`}
                      />
                    </div>

                    <div className="mt-3.5 px-0.5">
                      <p
                        title={item.title}
                        className={`text-[15.5px] font-medium truncate transition-colors ${
                          active
                            ? 'text-[var(--brass)]'
                            : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-[var(--text-muted)]">
                        待收录
                      </p>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
