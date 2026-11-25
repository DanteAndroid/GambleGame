import { useState } from 'react';
import { RotateCcw, Vote } from 'lucide-react';

export function MinorityRuleDiagram() {
  const [alive, setAlive] = useState<number>(22);
  const [round, setRound] = useState<number>(1);
  const [yesVotes, setYesVotes] = useState<number>(9);
  const [log, setLog] = useState<string>('拖动或选择本轮 Yes 票数后点击「开票」，观察少数晋级如何迅速清场。');
  const [finished, setFinished] = useState<boolean>(false);

  const noVotes = alive - yesVotes;

  const castVotes = () => {
    if (finished) return;

    if (yesVotes === noVotes || yesVotes === 0 || noVotes === 0) {
      setLog(
        `第 ${round} 轮：Yes ${yesVotes} 票 vs No ${noVotes} 票 —— ${
          yesVotes === noVotes ? '票数打平' : '全员投了同一选项'
        }，本轮作废重投，无人淘汰！`
      );
      return;
    }

    const minority = Math.min(yesVotes, noVotes);
    const majority = Math.max(yesVotes, noVotes);
    const winningSide = yesVotes < noVotes ? 'Yes' : 'No';

    setAlive(minority);
    if (minority <= 2) {
      setFinished(true);
      setYesVotes(Math.floor(minority / 2));
      setLog(
        `第 ${round} 轮：投 ${winningSide} 的 ${minority} 人晋级，${majority} 人淘汰！场上仅剩 ${minority} 人，立刻结束并${
          minority === 1 ? '独得' : '平分'
        } 22 亿日元。`
      );
    } else {
      setRound((r) => r + 1);
      setYesVotes(Math.max(1, Math.floor(minority * 0.4)));
      setLog(
        `第 ${round} 轮：投 ${winningSide} 的 ${minority} 人（少数）晋级；${majority} 人淘汰并每人背负 1 亿债务。`
      );
    }
  };

  const reset = () => {
    setAlive(22);
    setRound(1);
    setYesVotes(9);
    setFinished(false);
    setLog('拖动或选择本轮 Yes 票数后点击「开票」，观察少数晋级如何迅速清场。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：轮次与在场人数 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="text-[var(--text-primary)] font-semibold">
            {finished ? '投票结束' : `第 ${round} 轮匿名投票`} · 在场{' '}
            <strong
              data-testid="minority-alive-count"
              className={`tabular-nums text-[15px] ${
                finished ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
              }`}
            >
              {alive}
            </strong>
            <span className="text-[var(--text-secondary)]"> / 22 人</span>
          </span>
          <button
            type="button"
            data-testid="minority-reset-btn"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置 22 人
          </button>
        </div>

        {/* 22 人实心圆点阵 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 sm:p-4 space-y-3">
          <div
            className="grid grid-cols-11 gap-2 max-w-[430px] mx-auto"
            aria-label={`当前在场 ${alive} 人，已淘汰 ${22 - alive} 人`}
          >
            {Array.from({ length: 22 }).map((_, i) => {
              const isAlive = i < alive;
              const isYes = isAlive && i < yesVotes;
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-full flex items-center justify-center text-[10.5px] tabular-nums transition-all ${
                    isAlive
                      ? finished
                        ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)] font-bold scale-105'
                        : isYes
                          ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] font-bold'
                          : 'bg-[var(--text-primary)]/85 text-[var(--bg-page)] font-semibold'
                      : 'bg-[var(--diagram-surface)] text-[var(--text-muted)] border border-[var(--diagram-border)]'
                  }`}
                >
                  {isAlive ? i + 1 : '×'}
                </div>
              );
            })}
          </div>

          {/* 票数图例与分布调节 */}
          {!finished && (
            <div className="pt-2 border-t border-[var(--border-hairline)] space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <span className="inline-flex items-center gap-1.5 text-[var(--diagram-brass)] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--diagram-brass)] inline-block" />
                  Yes：{yesVotes} 票
                </span>
                <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-primary)]/85 inline-block" />
                  No：{noVotes} 票
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <input
                  type="range"
                  min={0}
                  max={alive}
                  value={yesVotes}
                  data-testid="minority-yes-slider"
                  onChange={(e) => setYesVotes(Number(e.target.value))}
                  aria-label="调整本轮投 Yes 的人数"
                  className="flex-1 accent-[var(--diagram-brass)] cursor-pointer"
                />
                <div className="flex items-center gap-2 shrink-0">
                  {alive % 2 === 0 && (
                    <button
                      type="button"
                      data-testid="minority-tie-preset"
                      onClick={() => setYesVotes(alive / 2)}
                      className="px-2.5 py-1.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      试平票
                    </button>
                  )}
                  <button
                    type="button"
                    data-testid="minority-cast-btn"
                    onClick={castVotes}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
                  >
                    <Vote className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>开票</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <p
            data-testid="minority-round-note"
            className="text-center text-[12.5px] text-[var(--text-primary)] leading-relaxed pt-1"
          >
            {log}
          </p>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        金色为投 Yes、浅白为投 No、灰叉为淘汰；因为每轮只留不足半数，通常 3–4 轮便剩 1–2 人瓜分 22 亿。
      </p>
    </div>
  );
}
