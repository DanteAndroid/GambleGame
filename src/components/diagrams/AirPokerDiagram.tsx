import { useState } from 'react';
import { AlertTriangle, RotateCcw, Wind } from 'lucide-react';

interface CardItem {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  rank: string;
  value: number;
  red?: boolean;
}

interface SumPlay {
  sum: number;
  cards: CardItem[];
  handName: string;
  minNeededNote?: string;
}

// 模拟真实共享 52 张牌库中互相冲突的小牌/大牌消耗：
// 当 18（用掉 4张2 + 1张10）和 15（用掉 4张A + 1张11? 不，A=1，4张A+1张J=15? 或者 4张3+1张3不行，4张3+1张3=5张）
// 设 A=1, 2..10, J=11, Q=12, K=13：
// 牌 12 = A+A+A+A+8 (用光全部4张A!)
// 牌 18 = 2+2+2+2+10 (用光全部4张2!)
// 如果玩家把 12 和 18 都打掉了，52 张牌库里所有 A(1) 和 2 全部永久消失，最小 5 张牌之和 = 3+3+3+3+4 = 16!
// 此时如果再打出数字牌 14，海面搭档无论怎么凑都无法拼出总和 14 → 真实触发「灾厄」！
const PLAY_OPTIONS: Array<{
  sum: number;
  defaultCards: CardItem[];
  defaultHand: string;
  blockedBy?: number[];
  blockedReason?: string;
}> = [
  {
    sum: 36,
    defaultCards: [
      { id: 's10', suit: '♠', rank: '10', value: 10 },
      { id: 'h10', suit: '♥', rank: '10', value: 10, red: true },
      { id: 'd10', suit: '♦', rank: '10', value: 10, red: true },
      { id: 'c3', suit: '♣', rank: '3', value: 3 },
      { id: 's3', suit: '♠', rank: '3', value: 3 },
    ],
    defaultHand: '葫芦（10+10+10+3+3 = 36）',
  },
  {
    sum: 12,
    defaultCards: [
      { id: 'sA', suit: '♠', rank: 'A', value: 1 },
      { id: 'hA', suit: '♥', rank: 'A', value: 1, red: true },
      { id: 'dA', suit: '♦', rank: 'A', value: 1, red: true },
      { id: 'cA', suit: '♣', rank: 'A', value: 1 },
      { id: 's8', suit: '♠', rank: '8', value: 8 },
    ],
    defaultHand: '四条 A（1×4 + 8 = 12 · 耗尽全部 A）',
  },
  {
    sum: 18,
    defaultCards: [
      { id: 's2', suit: '♠', rank: '2', value: 2 },
      { id: 'h2', suit: '♥', rank: '2', value: 2, red: true },
      { id: 'd2', suit: '♦', rank: '2', value: 2, red: true },
      { id: 'c2', suit: '♣', rank: '2', value: 2 },
      { id: 'c10', suit: '♣', rank: '10', value: 10 },
    ],
    defaultHand: '四条 2（2×4 + 10 = 18 · 耗尽全部 2）',
  },
  {
    sum: 14,
    defaultCards: [
      { id: 'h2b', suit: '♥', rank: '2', value: 2, red: true },
      { id: 'd2b', suit: '♦', rank: '2', value: 2, red: true },
      { id: 'c3b', suit: '♣', rank: '3', value: 3 },
      { id: 'd3b', suit: '♦', rank: '3', value: 3, red: true },
      { id: 'h4b', suit: '♥', rank: '4', value: 4, red: true },
    ],
    defaultHand: '两对（2+2+3+3+4 = 14）',
    blockedBy: [12, 18],
    blockedReason: '所有 A 和 2 已被前几轮消耗，剩牌最小 5 张和为 16 → 凑不出 14，触发「灾厄」直接判负！',
  },
];

export function AirPokerDiagram() {
  const [playedSums, setPlayedSums] = useState<number[]>([36]);
  const [activeSum, setActiveSum] = useState<number>(36);
  const [bet, setBet] = useState<number>(1);
  const [calamityTriggered, setCalamityTriggered] = useState<boolean>(false);

  const usedCardsCount = playedSums.length * 5;
  const remainingDeck = Math.max(0, 52 - usedCardsCount);
  const option = PLAY_OPTIONS.find((o) => o.sum === activeSum) ?? PLAY_OPTIONS[0];

  const isOptionBlocked = (opt: (typeof PLAY_OPTIONS)[number], played: number[]) =>
    Boolean(opt.blockedBy && opt.blockedBy.every((req) => played.includes(req)));

  const handlePlaySum = (sum: number) => {
    const opt = PLAY_OPTIONS.find((o) => o.sum === sum);
    if (!opt) return;

    setActiveSum(sum);
    if (isOptionBlocked(opt, playedSums)) {
      setCalamityTriggered(true);
      return;
    }

    setCalamityTriggered(false);
    if (!playedSums.includes(sum)) {
      setPlayedSums((prev) => [...prev, sum]);
    }
  };

  const resetDeck = () => {
    setPlayedSums([36]);
    setActiveSum(36);
    setBet(1);
    setCalamityTriggered(false);
  };

  const showCalamity = calamityTriggered || isOptionBlocked(option, playedSums);

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] overflow-hidden">
        {/* 海面层：唯一 52 张共享牌库拆牌 */}
        <div className="p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="font-semibold text-[var(--diagram-brass)]">
              海面搭档 · 剩余牌库{' '}
              <strong data-testid="airpoker-deck-count" className="tabular-nums text-[var(--text-primary)]">
                {remainingDeck} / 52
              </strong>{' '}
              张
            </span>
            <button
              type="button"
              data-testid="airpoker-reset-btn"
              onClick={resetDeck}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重置牌库
            </button>
          </div>

          {showCalamity ? (
            <div
              data-testid="airpoker-hand-result"
              className="rounded-xl bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] border border-[var(--diagram-accent)] px-4 py-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-[var(--diagram-accent)] text-center"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{option.blockedReason}</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-5 gap-2 max-w-[360px] mx-auto">
                {option.defaultCards.map((c) => (
                  <div
                    key={c.id}
                    className="h-[66px] sm:h-[74px] rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] flex flex-col items-center justify-center"
                  >
                    <span
                      className={`text-[15px] sm:text-[16px] font-bold leading-none ${
                        c.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {c.rank}
                    </span>
                    <span
                      className={`text-[14px] mt-1 leading-none ${
                        c.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {c.suit}
                    </span>
                  </div>
                ))}
              </div>
              <p
                data-testid="airpoker-hand-result"
                className="text-center text-[12.5px] font-medium text-[var(--text-primary)]"
              >
                拆出牌型：<span className="text-[var(--diagram-brass)]">{option.defaultHand}</span>
              </p>
            </div>
          )}

          {/* 耗尽提示 */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[var(--text-secondary)]">
            <span>已打出数字牌：{playedSums.join('、')}</span>
            {playedSums.includes(12) && (
              <span className="px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]">
                4 张 A 已用尽
              </span>
            )}
            {playedSums.includes(18) && (
              <span className="px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]">
                4 张 2 已用尽
              </span>
            )}
          </div>
        </div>

        {/* 海平面波浪隔绝线 */}
        <div className="relative flex items-center justify-center py-1.5 bg-[color-mix(in_srgb,var(--diagram-brass)_8%,transparent)]">
          <svg
            viewBox="0 0 400 18"
            preserveAspectRatio="none"
            className="w-full h-4 text-[var(--diagram-brass)]/55"
            aria-hidden="true"
          >
            <path
              d="M0 9 Q 25 2, 50 9 T 100 9 T 150 9 T 200 9 T 250 9 T 300 9 T 350 9 T 400 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
          <span className="absolute px-3 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-accent)] font-semibold">
            海面隔绝 · 仅传总和数字，不可通讯
          </span>
        </div>

        {/* 海底层：下注呼吸胶囊 + 依次打出数字牌 */}
        <div className="p-3.5 sm:p-4 bg-[color-mix(in_srgb,var(--bg-page)_28%,transparent)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="font-semibold text-[var(--text-primary)]">
              海底主桌 · 依次点击打出金属牌（试试先打 12 与 18，再打 14）
            </span>
            <div className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
              <Wind className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              <span>押空气：</span>
              {[1, 2, 3].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBet(v)}
                  className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums font-semibold cursor-pointer transition-colors ${
                    bet === v
                      ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
                  }`}
                >
                  {v} 枚
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PLAY_OPTIONS.map((opt) => {
              const active = activeSum === opt.sum;
              const played = playedSums.includes(opt.sum);
              const blocked = isOptionBlocked(opt, playedSums);
              return (
                <button
                  key={opt.sum}
                  type="button"
                  data-testid={`airpoker-sum-${opt.sum}`}
                  aria-pressed={active}
                  onClick={() => handlePlaySum(opt.sum)}
                  className={`rounded-lg px-3 py-2.5 text-center border transition-all cursor-pointer ${
                    blocked
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                      : active
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--text-primary)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="text-[17px] font-bold tabular-nums leading-none">
                    {opt.sum}
                  </div>
                  <div className="mt-1 text-[11px]">
                    {blocked ? '将触发灾厄' : played ? '已打出' : '点击打出'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        每人共 5 枚呼吸胶囊打 5 轮；两方共用同一副 52 张牌，前轮耗光关键点数会让后续数字牌无牌可拆而直接判负。
      </p>
    </div>
  );
}
