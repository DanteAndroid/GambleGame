import { ArrowRight } from 'lucide-react';
import type { GambleRecord, MangaSeriesInfo } from '../types/gamble';

interface SeriesBookSectionProps {
  series: MangaSeriesInfo;
  seriesGambles: GambleRecord[];
  currentGambleId: string;
  onSelectGamble: (gambleId: string) => void;
  onBrowseSeriesOnHome: (seriesId: MangaSeriesInfo['id']) => void;
}

/**
 * Bottom (~30%) section of the Gamble Detail Page:
 * Deep obsidian colophon band where the B6 manga volume cover
 * and its adjacent right-side book info share identical height flush top-to-bottom.
 */
export function SeriesBookSection({
  series,
  seriesGambles,
  currentGambleId,
  onSelectGamble,
  onBrowseSeriesOnHome,
}: SeriesBookSectionProps) {
  return (
    <section
      aria-labelledby="series-book-heading"
      data-testid="series-book-section"
      className="w-full bg-[var(--bg-colophon)] text-[#F4F0E8] border-t border-[var(--border-subtle)] py-14 sm:py-16"
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12 items-start">
          {/* Left: Equal-Height Full-Bleed B6 Manga Cover + Book Info */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row sm:items-stretch gap-6 sm:gap-7">
            <div
              data-testid="series-book-cover"
              className="w-44 sm:w-[196px] shrink-0 aspect-[128/182] sm:aspect-auto sm:min-h-[278px] bg-[#141418] overflow-hidden ring-1 ring-white/15 cover-plate-shadow"
            >
              <img
                src={series.coverUrl}
                alt={`《${series.title}》漫画封面`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover block"
              />
            </div>

            <div
              data-testid="series-book-info"
              className="min-w-0 flex-1 flex flex-col justify-between py-0.5"
            >
              <div>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-[#C8A66E]">
                  <span className="tabular-nums tracking-[0.06em]">
                    {series.era}
                  </span>
                  <span aria-hidden="true" className="text-white/25">
                    /
                  </span>
                  <span className="text-[#9A9690]">{series.organization}</span>
                </div>

                <h2
                  id="series-book-heading"
                  className="mt-2 -ml-[0.38em] font-display font-normal text-[32px] sm:text-[38px] leading-[1.12] text-white tracking-[0.03em]"
                >
                  《{series.title}》
                </h2>

                <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
                  <span className="font-mincho tracking-[0.06em] text-[#9A9690]">
                    {series.japaneseTitle}
                  </span>
                  <span aria-hidden="true" className="text-white/20">
                    /
                  </span>
                  <span className="font-sans text-[#CECDC9]">
                    <span className="text-[#8E8A84]">作者 </span>
                    <span className="font-semibold text-white">
                      {series.author}
                    </span>
                  </span>
                </div>

                <p className="mt-4 font-sans text-[13.5px] leading-[1.82] text-[#C2BEB7]">
                  {series.summary}
                </p>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => onBrowseSeriesOnHome(series.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C8A66E] hover:text-white underline underline-offset-4 decoration-[#C8A66E]/40 hover:decoration-white transition-colors cursor-pointer"
                >
                  <span>查看《{series.title}》全部赌局</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Hairline-Ruled Print Table of Contents */}
          <div className="lg:col-span-6 lg:border-l lg:border-white/12 lg:pl-10 xl:pl-12">
            <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-white/25">
              <h3 className="font-mincho font-normal text-lg text-white">
                赌局目录
              </h3>
              <span className="text-xs tabular-nums text-[#C8A66E]">
                共 {String(seriesGambles.length).padStart(2, '0')} 局
              </span>
            </div>

            <div
              data-testid="chapter-gamble-selector"
              className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-7"
            >
              {seriesGambles.map((item, idx) => {
                const isCurrent = item.id === currentGambleId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectGamble(item.id)}
                    aria-current={isCurrent ? 'page' : undefined}
                    className={`group text-left py-2.5 border-b transition-colors flex items-baseline justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                      isCurrent
                        ? 'bg-[#F4F0E8] text-[#09090C] border-transparent px-2.5 -mx-2.5'
                        : 'border-white/10 text-[#D8D4CC] hover:text-white hover:border-white/40'
                    }`}
                  >
                    <span className="flex items-baseline gap-2.5 min-w-0">
                      <span
                        className={`tabular-nums text-[11px] shrink-0 ${
                          isCurrent
                            ? 'text-[#09090C]/75 font-semibold'
                            : 'text-[#C8A66E]/80 group-hover:text-[#C8A66E]'
                        }`}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-medium text-[13.5px] truncate">
                        {item.title}
                      </span>
                    </span>
                    <span
                      className={`tabular-nums text-[11px] shrink-0 max-w-[6.75rem] truncate ${
                        isCurrent ? 'opacity-75' : 'text-[#84807A]'
                      }`}
                    >
                      {item.chapterRange}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
