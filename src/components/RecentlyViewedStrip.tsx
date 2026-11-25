import type { GambleRecord, MangaSeriesId, MangaSeriesInfo } from '../types/gamble';

interface RecentlyViewedStripProps {
  recentGambles: readonly GambleRecord[];
  liveSeriesLookup: Record<MangaSeriesId, MangaSeriesInfo>;
  onSelectGamble: (gambleId: string) => void;
  onClearRecent: () => void;
}

/**
 * Compact editorial index row placed inside the homepage content column,
 * directly beneath the top cover shelf with balanced breathing room and
 * clear Gestalt grouping between each viewed game and its manga series.
 */
export function RecentlyViewedStrip({
  recentGambles,
  liveSeriesLookup,
  onSelectGamble,
  onClearRecent,
}: RecentlyViewedStripProps) {
  if (recentGambles.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="最近查看的游戏"
      data-testid="recently-viewed-strip"
      className="banner-reveal pt-4 sm:pt-5 pb-3.5 sm:pb-4 border-b border-[var(--border-hairline)]"
    >
      <div className="flex items-center gap-3.5 sm:gap-5">
        <span className="text-[12px] tracking-[0.06em] text-[var(--brass)] whitespace-nowrap shrink-0">
          最近查看
        </span>

        <span
          aria-hidden="true"
          className="w-px h-3.5 bg-[var(--border-subtle)] shrink-0"
        />

        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-x-5 sm:gap-x-7 overflow-x-auto no-scrollbar pr-8">
            {recentGambles.map((gamble) => {
              const series = liveSeriesLookup[gamble.seriesId];
              return (
                <button
                  key={gamble.id}
                  type="button"
                  data-testid={`recent-item-${gamble.id}`}
                  onClick={() => onSelectGamble(gamble.id)}
                  title={`${gamble.title}（《${series.title}》）`}
                  className="group relative inline-flex items-baseline gap-2 min-h-[38px] sm:min-h-[34px] py-1.5 text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
                >
                  <span className="text-[13px] sm:text-[13.5px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {gamble.title}
                  </span>
                  <span className="hidden sm:inline text-[13px] sm:text-[13.5px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                    {series.title}
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0.5 h-[1.5px] bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200"
                  />
                </button>
              );
            })}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[var(--bg-page)] to-transparent"
          />
        </div>

        <button
          type="button"
          data-testid="clear-recent-btn"
          onClick={onClearRecent}
          aria-label="清空最近查看记录"
          className="inline-flex items-center justify-center min-h-[38px] sm:min-h-[34px] pl-2 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
        >
          清空
        </button>
      </div>
    </nav>
  );
}
