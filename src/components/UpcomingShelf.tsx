import { ArrowUp } from 'lucide-react';
import type { UpcomingMangaSeries } from '../types/gamble';
import { getUpcomingVoteCount } from '../utils/gambleFilters';

interface UpcomingShelfProps {
  upcomingSeries: readonly UpcomingMangaSeries[];
  votedSeriesIds: readonly string[];
  onToggleVote: (seriesId: string) => void;
  onSelectUpcoming?: (upcomingId: string) => void;
}

export function UpcomingShelf({
  upcomingSeries,
  votedSeriesIds,
  onToggleVote,
  onSelectUpcoming,
}: UpcomingShelfProps) {
  if (upcomingSeries.length === 0) {
    return null;
  }

  return (
    <section
      id="upcoming"
      aria-labelledby="upcoming-heading"
      className="pt-16 pb-24 border-t border-[var(--border-subtle)]"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-9">
        <div>
          <p className="text-[11px] tracking-[0.14em] text-[var(--brass)] mb-2">
            排期典藏 · 敬请期待
          </p>
          <h2
            id="upcoming-heading"
            className="font-display font-normal text-[36px] sm:text-[44px] text-[var(--text-primary)] tracking-[0.04em] leading-none"
          >
            待收录作品书架
          </h2>
        </div>
        <p className="text-[13.5px] text-[var(--text-muted)] max-w-xl leading-[1.82]">
          当前优先整理了《噬谎者》《欺诈游戏》《赌博默示录》共 40 场核心对局；以下斗智名作已列入排期，可投票决定下一部优先收录的作品。
        </p>
      </div>

      {/* Collector Cards with Verified Vol.1 Covers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingSeries.map((item) => {
          const isVoted = votedSeriesIds.includes(item.id);
          const voteCount = getUpcomingVoteCount(
            item.initialVotes,
            votedSeriesIds,
            item.id
          );

          return (
            <article
              key={item.id}
              className="collector-card flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] overflow-hidden"
            >
              <div className="p-6">
                {/* Top Row: Mini Accurate Vol.1 Cover + Book Identity */}
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => onSelectUpcoming?.(item.id)}
                    aria-label={`查看待收录作品《${item.title}》详情`}
                    className="w-[76px] shrink-0 aspect-[128/182] overflow-hidden bg-[var(--bg-img)] cover-plate-shadow ring-1 ring-[var(--img-ring)] cursor-pointer group"
                  >
                    <img
                      src={item.coverUrl}
                      alt={`《${item.title}》漫画封面`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover block group-hover:scale-[1.04] transition-transform duration-300"
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-sans text-[var(--text-muted)] truncate">
                        {item.author}
                      </span>
                      <span className="text-[var(--brass)] shrink-0">
                        {item.statusLabel}
                      </span>
                    </div>

                    <h3 className="mt-1.5 -ml-[0.35em] font-mincho font-normal text-[20px] leading-snug text-[var(--text-primary)]">
                      《{item.title}》
                    </h3>
                    <p className="text-[11.5px] font-mincho tracking-[0.04em] text-[var(--text-muted)] mt-1 truncate">
                      {item.japaneseTitle}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-[13.5px] font-mincho text-[var(--text-primary)] leading-relaxed py-3 border-y border-[var(--border-hairline)]">
                  {item.signatureQuote}
                </p>

                <p className="mt-3.5 text-[13px] leading-[1.82] text-[var(--text-secondary)]">
                  {item.note}
                </p>

                <div className="mt-4 pt-3.5 border-t border-[var(--border-hairline)]">
                  <p className="text-[11px] tracking-[0.08em] text-[var(--brass)]">
                    拟收录赌局
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[12.5px] text-[var(--text-secondary)]">
                    {item.plannedGambles.map((gambleTitle) => (
                      <li key={gambleTitle} className="flex items-start gap-2">
                        <span
                          className="text-[var(--text-muted)] text-xs mt-0.5 select-none"
                          aria-hidden="true"
                        >
                          ·
                        </span>
                        <span>{gambleTitle}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-6 py-4 bg-[var(--bg-inset)]/55 border-t border-[var(--border-hairline)] flex items-center justify-between gap-3">
                <span className="tabular-nums text-xs text-[var(--text-muted)]">
                  票数{' '}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {voteCount}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onToggleVote(item.id)}
                  aria-pressed={isVoted}
                  aria-label={`${isVoted ? '取消投票' : '投票催更'}《${item.title}》`}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] ${
                    isVoted
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] hover:bg-[var(--accent-hover)]'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{isVoted ? '已投票' : '催更 +1'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
