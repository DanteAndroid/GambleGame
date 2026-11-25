import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, Eye, EyeOff, Search, X } from 'lucide-react';
import type {
  GambleCategory,
  GambleFilterState,
  GambleRecord,
  MangaSeriesId,
  MangaSeriesInfo,
  UpcomingMangaSeries,
} from '../types/gamble';
import { GAMBLE_CATEGORIES } from '../data/gambles';
import { getCardParticipants, getUpcomingVoteCount } from '../utils/gambleFilters';
import { getDisplayImageUrl, getThumbImageUrl, hasLocalAsset } from '../utils/imageUrl';
import { MangaSilhouette } from './MangaSilhouette';

const PAGE_BATCH_SIZE = 24;

interface GambleCatalogProps {
  filteredGambles: GambleRecord[];
  selectedGambleId: string | null;
  selectedUpcoming: UpcomingMangaSeries | null;
  liveSeriesLookup: Record<MangaSeriesId, MangaSeriesInfo>;
  filterState: GambleFilterState;
  seriesCounts: Record<MangaSeriesId | 'all', number>;
  spoilerShieldEnabled: boolean;
  revealedIds: ReadonlySet<string>;
  votedSeriesIds: readonly string[];
  onSelectGamble: (gambleId: string) => void;
  onToggleCardReveal: (gambleId: string) => void;
  onToggleVote: (seriesId: string) => void;
  onChangeCategory: (category: GambleCategory) => void;
  onChangeQuery: (query: string) => void;
  onResetFilters: () => void;
}

export function GambleCatalog({
  filteredGambles,
  selectedGambleId,
  selectedUpcoming,
  liveSeriesLookup,
  filterState,
  seriesCounts,
  spoilerShieldEnabled,
  revealedIds,
  votedSeriesIds,
  onSelectGamble,
  onToggleCardReveal,
  onToggleVote,
  onChangeCategory,
  onChangeQuery,
  onResetFilters,
}: GambleCatalogProps) {
  const activeSeriesInfo =
    !selectedUpcoming && filterState.seriesId !== 'all'
      ? liveSeriesLookup[filterState.seriesId]
      : null;

  const [visibleCount, setVisibleCount] = useState(PAGE_BATCH_SIZE);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(PAGE_BATCH_SIZE);
  }, [filterState.seriesId, filterState.category, filterState.query]);

  useEffect(() => {
    if (visibleCount >= filteredGambles.length) return;
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((prev) =>
            Math.min(prev + PAGE_BATCH_SIZE, filteredGambles.length)
          );
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, filteredGambles.length]);

  /* ==================== FOCUSED UPCOMING WORK PLACEHOLDER VIEW ==================== */
  if (selectedUpcoming) {
    const isVoted = votedSeriesIds.includes(selectedUpcoming.id);
    const voteCount = getUpcomingVoteCount(
      selectedUpcoming.initialVotes,
      votedSeriesIds,
      selectedUpcoming.id
    );

    return (
      <section
        id="catalog"
        aria-labelledby="upcoming-focus-heading"
        data-testid="upcoming-focus-panel"
        className="pt-10 sm:pt-14 pb-20"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onResetFilters}
            className="group inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft
              className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
              aria-hidden="true"
            />
            <span>返回全部已收录赌局</span>
          </button>
          <span className="text-xs tracking-[0.1em] text-[var(--brass)]">
            {selectedUpcoming.statusLabel}
          </span>
        </div>

        <div className="collector-card bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 sm:p-10">
          <div className="flex flex-col md:flex-row items-start gap-8 sm:gap-10">
            <div className="w-44 sm:w-[210px] shrink-0 aspect-[128/182] overflow-hidden bg-[var(--bg-img)] cover-plate-shadow ring-1 ring-[var(--img-ring)]">
              <img
                src={getDisplayImageUrl(selectedUpcoming.coverUrl)}
                alt={`《${selectedUpcoming.title}》单行本封面`}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover block"
              />
            </div>

            <div className="min-w-0 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                  <span
                    lang="ja"
                    translate="no"
                    className="font-mincho text-sm text-[var(--brass)]"
                  >
                    {selectedUpcoming.japaneseTitle}
                  </span>
                  <span aria-hidden="true" className="opacity-35">
                    /
                  </span>
                  <span className="font-sans font-medium text-[var(--text-secondary)]">
                    作者 {selectedUpcoming.author}
                  </span>
                </div>

                <h1
                  id="upcoming-focus-heading"
                  className="mt-3 font-display font-normal text-[40px] sm:text-[52px] leading-[1.08] tracking-[0.04em] text-[var(--text-primary)]"
                >
                  {selectedUpcoming.title}
                </h1>

                <p className="mt-4 font-mincho text-[17px] text-[var(--text-primary)] py-3 border-y border-[var(--border-hairline)]">
                  {selectedUpcoming.signatureQuote}
                </p>

                <p className="mt-4 font-sans text-[14.5px] leading-[1.88] text-[var(--text-secondary)] max-w-[64ch]">
                  {selectedUpcoming.note}
                </p>

                <div className="mt-6">
                  <p className="text-xs tracking-[0.1em] text-[var(--brass)]">
                    拟收录赌局排期（敬请期待）
                  </p>
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13.5px] text-[var(--text-secondary)]">
                    {selectedUpcoming.plannedGambles.map((title, idx) => (
                      <li key={title} className="flex items-baseline gap-2.5">
                        <span className="tabular-nums text-[11px] text-[var(--text-muted)]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span>{title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onToggleVote(selectedUpcoming.id)}
                    aria-pressed={isVoted}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-medium border transition-colors cursor-pointer ${
                      isVoted
                        ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] hover:bg-[var(--accent-hover)]'
                        : 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] border-[var(--btn-primary-bg)] hover:opacity-90'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isVoted ? '已投票催更' : '催更收录 +1'}</span>
                  </button>
                  <span className="tabular-nums text-xs text-[var(--text-muted)]">
                    当前票数{' '}
                    <strong className="font-semibold text-[var(--text-primary)]">
                      {voteCount}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-4 cursor-pointer"
                >
                  浏览已收录的 {seriesCounts.all} 场赌局
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="catalog"
      aria-labelledby="catalog-heading"
      className="pt-7 sm:pt-10 lg:pt-12 pb-16 sm:pb-20"
    >
      {/* Editorial Exhibition Masthead */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3 sm:gap-4 flex-wrap">
            <h1
              id="catalog-heading"
              className="font-display font-normal text-[32px] min-[400px]:text-[36px] sm:text-[46px] lg:text-[52px] text-[var(--text-primary)] tracking-[0.04em] leading-none"
            >
              {activeSeriesInfo ? activeSeriesInfo.title : '全部赌局'}
            </h1>
            <span
              data-testid="catalog-result-count"
              className="tabular-nums text-xs sm:text-[13px] tracking-[0.06em] text-[var(--brass)] shrink-0"
            >
              {filteredGambles.length}个赌局
            </span>
          </div>
        </div>

        {/* Sculpted Archival Search Box */}
        <div className="w-full lg:w-80">
          <label htmlFor="gamble-search" className="sr-only">
            搜索赌局名称、角色或规则
          </label>
          <div className="relative flex items-center bg-[var(--bg-input)] border border-[var(--border-subtle)] focus-within:border-[var(--brass)] transition-colors px-3.5 min-h-[42px] sm:min-h-[40px]">
            <Search
              className="w-4 h-4 text-[var(--text-muted)] shrink-0"
              aria-hidden="true"
            />
            <input
              id="gamble-search"
              type="search"
              value={filterState.query}
              onChange={(e) => onChangeQuery(e.target.value)}
              placeholder="搜索赌局、角色或规则..."
              className="w-full pl-2.5 pr-8 py-2 text-[16px] sm:text-[13.5px] bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            {filterState.query && (
              <button
                type="button"
                onClick={() => onChangeQuery('')}
                aria-label="清空搜索词"
                className="absolute right-1 w-9 h-9 inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Focused Series Monograph Banner When Filtered to One Live Series */}
      {activeSeriesInfo && (
        <div className="mt-5 sm:mt-6 collector-card bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-6 grid grid-cols-[68px_1fr] sm:flex sm:items-start gap-x-4 gap-y-3 sm:gap-6">
          <div className="w-[68px] sm:w-[92px] shrink-0 aspect-[128/182] overflow-hidden bg-[var(--bg-img)] cover-plate-shadow ring-1 ring-[var(--img-ring)]">
            <img
              src={getThumbImageUrl(activeSeriesInfo.coverUrl)}
              alt={`《${activeSeriesInfo.title}》封面`}
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover block"
            />
          </div>
          <div className="min-w-0 self-center sm:hidden">
            <p
              lang="ja"
              translate="no"
              className="font-mincho text-sm text-[var(--brass)] truncate"
            >
              {activeSeriesInfo.japaneseTitle}
            </p>
            <p className="mt-1 text-xs font-medium text-[var(--text-primary)]">
              作者 {activeSeriesInfo.author}
            </p>
            <p className="mt-0.5 text-[11.5px] text-[var(--text-muted)] tabular-nums">
              {activeSeriesInfo.era} · {activeSeriesInfo.organization}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 min-w-0 flex-1">
            <div className="hidden sm:flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
              <span
                lang="ja"
                translate="no"
                className="font-mincho text-sm text-[var(--brass)]"
              >
                {activeSeriesInfo.japaneseTitle}
              </span>
              <span aria-hidden="true" className="opacity-35">
                /
              </span>
              <span className="font-medium text-[var(--text-primary)]">
                作者 {activeSeriesInfo.author}
              </span>
              <span aria-hidden="true" className="opacity-35">
                /
              </span>
              <span className="tabular-nums">{activeSeriesInfo.era}</span>
              <span aria-hidden="true" className="opacity-35">
                /
              </span>
              <span>{activeSeriesInfo.organization}</span>
            </div>
            <p className="sm:mt-2.5 font-sans text-[13px] sm:text-[13.5px] text-[var(--text-secondary)] max-w-[74ch] leading-[1.78] sm:leading-[1.82]">
              {activeSeriesInfo.summary}
            </p>
            <p className="mt-2 font-mincho text-[12.5px] sm:text-[13px] text-[var(--text-muted)]">
              {activeSeriesInfo.signatureLine}
            </p>
          </div>
        </div>
      )}

      {/* Clean Category Filter Rail */}
      <div className="mt-4 sm:mt-5 pb-4 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div
          aria-label="按赌局类型筛选"
          className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center gap-1.5 sm:flex-wrap w-max sm:w-auto">
            {GAMBLE_CATEGORIES.map((category) => {
              const active = filterState.category === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onChangeCategory(category)}
                  aria-pressed={active}
                  className={`min-h-[36px] sm:min-h-[32px] px-3.5 py-1.5 text-xs sm:text-[12.5px] transition-colors whitespace-nowrap shrink-0 cursor-pointer border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] ${
                    active
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] border-[var(--btn-primary-bg)] font-semibold'
                      : 'bg-transparent text-[var(--text-muted)] border-[var(--border-hairline)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {(filterState.seriesId !== 'all' ||
          filterState.category !== '全部类型' ||
          filterState.query.trim() !== '') && (
          <button
            type="button"
            onClick={onResetFilters}
            className="min-h-[36px] inline-flex items-center self-start sm:self-auto text-xs font-medium text-[var(--brass)] hover:text-[var(--text-primary)] underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            重置筛选
          </button>
        )}
      </div>

      {/* Elevated Collector Cards Grid (Left Full-Bleed B6 Artwork + Right Editorial Ledger) */}
      {filteredGambles.length === 0 ? (
        <div
          data-testid="catalog-empty-state"
          className="mt-6 py-20 px-6 text-center collector-card bg-[var(--bg-card)] border border-[var(--border-subtle)]"
        >
          <p className="font-mincho text-xl text-[var(--text-primary)]">
            未找到符合条件的赌局
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            可以更换关键词重新检索，或点击顶部作品封面切换其他斗智漫画。
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-6 px-5 py-2.5 text-xs font-medium bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            显示全部收录赌局
          </button>
        </div>
      ) : (
        <>
          <div
            data-testid="catalog-grid"
            className="mt-5 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 xl:gap-6"
          >
            {filteredGambles.slice(0, visibleCount).map((gamble, idx) => {
              const isSelected = gamble.id === selectedGambleId;
              const series = liveSeriesLookup[gamble.seriesId];
              const isTemporarilyRevealed = revealedIds.has(gamble.id);
              const hidden = spoilerShieldEnabled && !isTemporarilyRevealed;
              const cardImage = gamble.artworkUrl;
              const [firstSide, secondSide] = getCardParticipants(gamble, hidden);

              return (
                <article
                  key={gamble.id}
                  data-testid={`gamble-card-${gamble.id}`}
                  className={`collector-card-interactive group bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border overflow-hidden ${
                    isSelected
                      ? 'border-[var(--accent)]'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {/* Top animated architectural hairline accent on hover */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200 z-10"
                  />

                  <a
                    href={`#gamble/${encodeURIComponent(gamble.id)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectGamble(gamble.id);
                    }}
                    aria-label={`查看《${series.title}》${gamble.title}详情`}
                    className="flex flex-row items-stretch h-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
                  >
                    {/* Left: Full-Bleed Japanese Manga B6 Ratio (128×182mm) — Zero Text Overlaid */}
                    <div className="w-[106px] min-[400px]:w-[116px] sm:w-[152px] lg:w-[156px] xl:w-[164px] shrink-0 aspect-[128/182] sm:aspect-auto sm:min-h-[212px] overflow-hidden bg-[var(--bg-img)] border-r border-[var(--border-subtle)] flex items-center justify-center">
                      {hasLocalAsset(cardImage) ? (
                        <img
                          src={getThumbImageUrl(cardImage)}
                          alt={gamble.title}
                          loading={idx < 4 ? 'eager' : 'lazy'}
                          fetchPriority={idx < 2 ? 'high' : 'auto'}
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover block ${
                            gamble.cardImagePosition ?? 'object-center'
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#0d0d11] flex items-center justify-center p-3">
                          <MangaSilhouette motif={gamble.motif} className="w-16 sm:w-20 h-auto opacity-80" />
                        </div>
                      )}
                    </div>

                  {/* Right: Indexed Dossier Plate */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="p-3.5 sm:px-5 sm:pt-4.5 sm:pb-3.5">
                      {/* Row 1: Gamble Title (Primary Anchor) + Top-Right Category */}
                      <div className="flex items-baseline justify-between gap-2 sm:gap-3">
                        <h3 className="font-mincho font-normal text-[17px] min-[400px]:text-[18.5px] sm:text-[21.5px] leading-[1.28] tracking-[0.01em] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                          {gamble.title}
                        </h3>
                        <span
                          data-testid={`card-category-${gamble.id}`}
                          className="text-[10.5px] sm:text-[11.5px] tracking-[0.05em] text-[var(--brass)] shrink-0 whitespace-nowrap"
                        >
                          {gamble.category}
                        </span>
                      </div>

                      {/* Row 2: Series Title + Chapter Range */}
                      <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] text-[var(--text-muted)]">
                        <span className="truncate text-[var(--text-secondary)]">
                          《{series.title}》
                        </span>
                        <span aria-hidden="true" className="opacity-35 shrink-0">
                          ·
                        </span>
                        <span className="tabular-nums truncate shrink-0">
                          {gamble.chapterRange}
                        </span>
                      </div>

                      {/* 一句话规则：黑体 */}
                      <p className="mt-2 sm:mt-3 font-sans text-[12.5px] sm:text-[13.5px] leading-[1.68] sm:leading-[1.8] text-[var(--text-secondary)] line-clamp-2 sm:line-clamp-3">
                        {gamble.oneLineRule}
                      </p>
                    </div>

                    {/* Bottom Matchup Strip: Participants on Left, Sequence Number on Bottom-Right */}
                    <div
                      className={`px-3.5 sm:px-5 py-2.5 sm:py-3 bg-[var(--bg-inset)]/55 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2 sm:gap-3 font-sans text-[12px] sm:text-[13px] text-[var(--text-primary)] ${
                        spoilerShieldEnabled ? 'pr-12 sm:pr-14' : ''
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-2.5 gap-y-1 min-w-0">
                        <span className="inline-flex items-center gap-1 sm:gap-1.5 min-w-0">
                          <span className="font-medium truncate max-w-[5.25rem] min-[400px]:max-w-[6.75rem] sm:max-w-[9.5rem]">
                            {firstSide.name}
                          </span>
                          {firstSide.outcome === 'win' && (
                            <span className="px-1.5 py-[2px] sm:py-[3px] text-[10px] sm:text-[10.5px] font-bold leading-none bg-[var(--win-bg)] text-[var(--win-fg)] border border-[var(--win-border)] shrink-0">
                              胜
                            </span>
                          )}
                          {firstSide.outcome === 'lose' && (
                            <span className="px-1.5 py-[2px] sm:py-[3px] text-[10px] sm:text-[10.5px] font-medium leading-none bg-[var(--lose-bg)] text-[var(--lose-fg)] border border-[var(--lose-border)] shrink-0">
                              败
                            </span>
                          )}
                        </span>

                        <span className="text-[10.5px] sm:text-[11px] font-mincho text-[var(--brass)] shrink-0">
                          vs
                        </span>

                        <span className="inline-flex items-center gap-1 sm:gap-1.5 min-w-0">
                          <span className="font-medium truncate max-w-[5.25rem] min-[400px]:max-w-[6.75rem] sm:max-w-[9.5rem]">
                            {secondSide.name}
                          </span>
                          {secondSide.outcome === 'win' && (
                            <span className="px-1.5 py-[2px] sm:py-[3px] text-[10px] sm:text-[10.5px] font-bold leading-none bg-[var(--win-bg)] text-[var(--win-fg)] border border-[var(--win-border)] shrink-0">
                              胜
                            </span>
                          )}
                          {secondSide.outcome === 'lose' && (
                            <span className="px-1.5 py-[2px] sm:py-[3px] text-[10px] sm:text-[10.5px] font-medium leading-none bg-[var(--lose-bg)] text-[var(--lose-fg)] border border-[var(--lose-border)] shrink-0">
                              败
                            </span>
                          )}
                        </span>
                      </div>

                      <span
                        data-testid={`card-index-${gamble.id}`}
                        className={`tabular-nums text-[11px] sm:text-[12px] font-medium tracking-[0.06em] text-[var(--text-muted)] group-hover:text-[var(--brass)] transition-colors shrink-0 ${
                          spoilerShieldEnabled ? 'hidden sm:inline' : ''
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </a>

                {/* Bottom-Right Per-Card Temporary Spoiler Reveal Icon (Monochrome Solid/Hollow Only) */}
                {spoilerShieldEnabled && (
                  <button
                    type="button"
                    data-testid={`card-spoiler-toggle-${gamble.id}`}
                    onClick={() => onToggleCardReveal(gamble.id)}
                    aria-pressed={isTemporarilyRevealed}
                    aria-label={
                      isTemporarilyRevealed
                        ? `重新隐藏《${gamble.title}》胜负剧透`
                        : `临时开启《${gamble.title}》胜负剧透`
                    }
                    title={
                      isTemporarilyRevealed
                        ? '重新隐藏本局胜负'
                        : '临时开启本局剧透'
                    }
                    className={`absolute right-2.5 bottom-1.5 sm:right-3.5 sm:bottom-2 z-10 inline-flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] ${
                      isTemporarilyRevealed
                        ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)] hover:opacity-90'
                        : 'bg-transparent text-[var(--text-muted)] border-[var(--border-strong)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)]'
                    }`}
                  >
                    {isTemporarilyRevealed ? (
                      <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                )}
              </article>
            );
          })}
          </div>

          {visibleCount < filteredGambles.length && (
            <div ref={loadMoreSentinelRef} className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + PAGE_BATCH_SIZE, filteredGambles.length)
                  )
                }
                className="min-h-[40px] px-5 py-2 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                继续加载剩余 {filteredGambles.length - visibleCount} 场赌局
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
