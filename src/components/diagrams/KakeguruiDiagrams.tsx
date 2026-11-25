import { useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  Circle,
  Coins,
  Crosshair,
  Crown,
  DoorClosed,
  DoorOpen,
  Eye,
  EyeOff,
  Gavel,
  Hand,
  HandFist,
  HelpCircle,
  Lock,
  Moon,
  Plus,
  RotateCcw,
  Scissors,
  Shuffle,
  Skull,
  Square,
  Star,
  Sun,
  Sword,
  Swords,
  Trophy,
  Vote,
  Waves,
} from 'lucide-react';

// ============================================================================
// 工具函数
// ============================================================================

function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Suit = '♠' | '♥' | '♣' | '♦';

function isRedSuit(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}

// ============================================================================
// 1. kakegurui-vote-rps | 投票猜拳
// ============================================================================

type RpsMove = 'rock' | 'scissors' | 'paper';

interface RpsPreset {
  id: string;
  label: string;
  counts: Record<RpsMove, number>;
}

const RPS_PRESETS: RpsPreset[] = [
  { id: 'balanced', label: '均衡箱 10/10/10', counts: { rock: 10, scissors: 10, paper: 10 } },
  { id: 'rock-heavy', label: '偏石头 17/7/6', counts: { rock: 17, scissors: 7, paper: 6 } },
  { id: 'paper-heavy', label: '偏布 6/7/17', counts: { rock: 6, scissors: 7, paper: 17 } },
];

const RPS_META: Record<RpsMove, { name: string; Icon: ComponentType<{ className?: string }> }> = {
  rock: { name: '石头', Icon: HandFist },
  scissors: { name: '剪刀', Icon: Scissors },
  paper: { name: '布', Icon: Hand },
};

function drawHandsFromBox(counts: Record<RpsMove, number>): {
  player: RpsMove[];
  rival: RpsMove[];
} {
  const pool: RpsMove[] = [
    ...Array<RpsMove>(counts.rock).fill('rock'),
    ...Array<RpsMove>(counts.scissors).fill('scissors'),
    ...Array<RpsMove>(counts.paper).fill('paper'),
  ];
  const shuffled = shuffleArray(pool);
  return {
    player: shuffled.slice(0, 3),
    rival: shuffled.slice(3, 6),
  };
}

function judgeRps(a: RpsMove, b: RpsMove): 'win' | 'lose' | 'tie' {
  if (a === b) return 'tie';
  if (
    (a === 'rock' && b === 'scissors') ||
    (a === 'scissors' && b === 'paper') ||
    (a === 'paper' && b === 'rock')
  ) {
    return 'win';
  }
  return 'lose';
}

function VoteRpsDiagram() {
  const [presetIdx, setPresetIdx] = useState<number>(1);
  const [hands, setHands] = useState<{ player: RpsMove[]; rival: RpsMove[] }>(() =>
    drawHandsFromBox(RPS_PRESETS[1].counts)
  );
  const [usedIdx, setUsedIdx] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [bet, setBet] = useState<number>(50);
  const [netChips, setNetChips] = useState<number>(0);
  const [clash, setClash] = useState<{
    player: RpsMove;
    rival: RpsMove;
    outcome: 'win' | 'lose' | 'tie';
    bet: number;
  } | null>(null);

  const preset = RPS_PRESETS[presetIdx];

  const switchPreset = (idx: number) => {
    setPresetIdx(idx);
    const next = drawHandsFromBox(RPS_PRESETS[idx].counts);
    setHands(next);
    setUsedIdx([]);
    setSelectedIdx(0);
    setClash(null);
  };

  const redraw = () => {
    const next = drawHandsFromBox(preset.counts);
    setHands(next);
    setUsedIdx([]);
    setSelectedIdx(0);
    setClash(null);
  };

  const playClash = () => {
    if (usedIdx.includes(selectedIdx) || usedIdx.length >= 3) return;
    const pMove = hands.player[selectedIdx];
    const rMove = hands.rival[usedIdx.length];
    const outcome = judgeRps(pMove, rMove);
    const nextUsed = [...usedIdx, selectedIdx];
    setUsedIdx(nextUsed);
    setClash({ player: pMove, rival: rMove, outcome, bet });
    if (outcome === 'win') setNetChips((v) => v + bet);
    if (outcome === 'lose') setNetChips((v) => v - bet);
    const nextAvail = [0, 1, 2].find((i) => !nextUsed.includes(i));
    if (nextAvail !== undefined) setSelectedIdx(nextAvail);
  };

  const allUsed = usedIdx.length >= 3;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：30 张投票箱分布选择 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <Vote className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            <span className="text-[var(--text-secondary)]">30 人投票箱：</span>
            {RPS_PRESETS.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => switchPreset(idx)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                  presetIdx === idx
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)] hover:text-[var(--text-primary)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={redraw}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重抽手牌
          </button>
        </div>

        {/* 30 张卡池比例条 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
          <div className="flex items-center justify-between text-[11.5px] tabular-nums">
            <span className="text-[var(--diagram-brass)] font-semibold">
              石头 {preset.counts.rock} 张（{Math.round((preset.counts.rock / 30) * 100)}%）
            </span>
            <span className="text-[var(--text-primary)] font-semibold">
              剪刀 {preset.counts.scissors} 张（{Math.round((preset.counts.scissors / 30) * 100)}%）
            </span>
            <span className="text-[var(--diagram-accent)] font-semibold">
              布 {preset.counts.paper} 张（{Math.round((preset.counts.paper / 30) * 100)}%）
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full overflow-hidden flex border border-[var(--border-hairline)]">
            <div
              className="h-full bg-[var(--diagram-brass)] transition-all"
              style={{ width: `${(preset.counts.rock / 30) * 100}%` }}
            />
            <div
              className="h-full bg-[var(--text-secondary)] transition-all"
              style={{ width: `${(preset.counts.scissors / 30) * 100}%` }}
            />
            <div
              className="h-full bg-[var(--diagram-accent)] transition-all"
              style={{ width: `${(preset.counts.paper / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* 双方 3 张手牌与中央对撞 */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* 你的 3 张手牌 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-brass)]">你的盲抽手牌</span>
              <span className="text-[var(--text-secondary)] tabular-nums">
                余 {3 - usedIdx.length} 张
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {hands.player.map((move, idx) => {
                const used = usedIdx.includes(idx);
                const selected = !used && selectedIdx === idx;
                const { name, Icon } = RPS_META[move];
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={used}
                    onClick={() => setSelectedIdx(idx)}
                    className={`h-[66px] rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                      used
                        ? 'border-[var(--border-hairline)] bg-[var(--bg-page)]/45 text-[var(--text-muted)] opacity-45 line-through cursor-not-allowed'
                        : selected
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--diagram-brass)] ring-2 ring-[var(--text-primary)] -translate-y-0.5 cursor-pointer'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] cursor-pointer'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="text-[11.5px] font-semibold">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 中央加注与亮牌 */}
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[var(--text-secondary)]">加注：</span>
              {[10, 50, 100, 300].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBet(v)}
                  className={`px-2 py-0.5 rounded-full font-semibold tabular-nums cursor-pointer transition-colors ${
                    bet === v
                      ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                      : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
                  }`}
                >
                  {v}万
                </button>
              ))}
            </div>

            {allUsed ? (
              <button
                type="button"
                onClick={redraw}
                className="px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                手牌已空 · 再抽 3 张
              </button>
            ) : (
              <button
                type="button"
                onClick={playClash}
                className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                盖牌对撞（押 {bet} 万）
              </button>
            )}

            <span className="text-[11.5px] text-[var(--text-secondary)] tabular-nums">
              累计盈亏：
              <strong
                className={
                  netChips > 0
                    ? 'text-[var(--diagram-brass)]'
                    : netChips < 0
                      ? 'text-[var(--diagram-accent)]'
                      : 'text-[var(--text-primary)]'
                }
              >
                {netChips > 0 ? `+${netChips}` : netChips} 万
              </strong>
            </span>
          </div>

          {/* 对手的 3 张暗牌 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-accent)]">对手盲抽手牌</span>
              <span className="text-[var(--text-secondary)] tabular-nums">
                已翻 {usedIdx.length} / 3
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {hands.rival.map((move, idx) => {
                const revealed = idx < usedIdx.length;
                const { name, Icon } = RPS_META[move];
                return (
                  <div
                    key={idx}
                    className={`h-[66px] rounded-lg border flex flex-col items-center justify-center gap-1 select-none ${
                      revealed
                        ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-muted)]'
                    }`}
                  >
                    {revealed ? (
                      <>
                        <Icon className="w-4 h-4" aria-hidden="true" />
                        <span className="text-[11.5px] font-semibold">{name}</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4" aria-hidden="true" />
                        <span className="text-[11px]">暗牌</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 结算横幅 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] font-semibold text-center border ${
            clash?.outcome === 'win'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : clash?.outcome === 'lose'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {clash
            ? `你出「${RPS_META[clash.player].name}」 VS 对手「${RPS_META[clash.rival].name}」 · ${
                clash.outcome === 'win'
                  ? `克制胜出，赢走 +${clash.bet} 万筹码`
                  : clash.outcome === 'lose'
                    ? `遭对手克制，赔付 -${clash.bet} 万筹码`
                    : '同拳平局，筹码退回'
              }`
            : '挑选 1 张手牌并设定筹码注额，点击「盖牌对撞」同时翻牌结算。'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        全班匿名投箱决定了牌池的拳型偏斜，摸清箱内分布并据此选牌与加注，比盲目猜拳更具胜算。
      </p>
    </div>
  );
}

// ============================================================================
// 2. kakegurui-double-concentration | 双重神经衰弱
// ============================================================================

interface ConcCard {
  uid: number;
  suit: Suit;
  rank: string;
  pairKey: string;
  matchedBy: 'player' | 'rival' | null;
}

function buildConcentrationDeck(): ConcCard[] {
  const specs: Array<{ suit: Suit; rank: string }> = [
    { suit: '♠', rank: 'A' },
    { suit: '♥', rank: 'A' },
    { suit: '♣', rank: 'K' },
    { suit: '♦', rank: 'K' },
    { suit: '♠', rank: 'Q' },
    { suit: '♥', rank: 'Q' },
  ];
  const doubled: Array<{ suit: Suit; rank: string; pairKey: string }> = [];
  specs.forEach((s) => {
    const key = `${s.suit}${s.rank}`;
    doubled.push({ ...s, pairKey: key });
    doubled.push({ ...s, pairKey: key });
  });
  return shuffleArray(doubled).map((c, idx) => ({
    uid: idx,
    suit: c.suit,
    rank: c.rank,
    pairKey: c.pairKey,
    matchedBy: null,
  }));
}

function DoubleConcentrationDiagram() {
  const [deck, setDeck] = useState<ConcCard[]>(() => buildConcentrationDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [turn, setTurn] = useState<'player' | 'rival'>('player');
  const [awaitCover, setAwaitCover] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(
    '翻开任意 2 张牌：必须「花色 + 点数完全一致」才得分并继续翻牌。'
  );

  const playerScore = deck.filter((c) => c.matchedBy === 'player').length / 2;
  const rivalScore = deck.filter((c) => c.matchedBy === 'rival').length / 2;
  const remaining = deck.filter((c) => c.matchedBy === null).length;
  const finished = remaining === 0;

  const reset = () => {
    setDeck(buildConcentrationDeck());
    setFlipped([]);
    setTurn('player');
    setAwaitCover(false);
    setMessage('已重新洗混 12 张双副牌阵，请先翻开第 1 张牌。');
  };

  const evaluatePair = (
    firstIdx: number,
    secondIdx: number,
    actor: 'player' | 'rival',
    currentDeck: ConcCard[]
  ) => {
    const c1 = currentDeck[firstIdx];
    const c2 = currentDeck[secondIdx];
    const actorName = actor === 'player' ? '你' : '对手';

    if (c1.pairKey === c2.pairKey) {
      const nextDeck = currentDeck.map((c, idx) =>
        idx === firstIdx || idx === secondIdx ? { ...c, matchedBy: actor } : c
      );
      setDeck(nextDeck);
      setFlipped([]);
      setAwaitCover(false);
      const left = nextDeck.filter((c) => c.matchedBy === null).length;
      if (left === 0) {
        const pS = nextDeck.filter((c) => c.matchedBy === 'player').length / 2;
        const rS = nextDeck.filter((c) => c.matchedBy === 'rival').length / 2;
        setMessage(
          `全部 6 对已清空！最终比分：你 ${pS} 对 vs 对手 ${rS} 对（${
            pS > rS ? '你胜出' : pS < rS ? '对手胜出' : '平局'
          }）。`
        );
      } else {
        setMessage(
          `${actorName}翻出完全相同的「${c1.suit}${c1.rank} + ${c2.suit}${c2.rank}」！得分 +1，保留续翻权。`
        );
      }
      return;
    }

    setAwaitCover(true);
    if (c1.rank === c2.rank && c1.suit !== c2.suit) {
      setMessage(
        `${actorName}翻出「${c1.suit}${c1.rank}」与「${c2.suit}${c2.rank}」：点数相同但花色不同，不构成配对！须盖回换手。`
      );
    } else {
      setMessage(
        `${actorName}翻出「${c1.suit}${c1.rank}」与「${c2.suit}${c2.rank}」：未能配对，须盖回换手。`
      );
    }
  };

  const handleFlip = (idx: number) => {
    if (finished || awaitCover || turn !== 'player') return;
    if (deck[idx].matchedBy !== null || flipped.includes(idx)) return;

    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);
    if (nextFlipped.length === 1) {
      setMessage(`已翻开「${deck[idx].suit}${deck[idx].rank}」，请再翻第 2 张寻找同花同点牌。`);
    } else if (nextFlipped.length === 2) {
      evaluatePair(nextFlipped[0], nextFlipped[1], 'player', deck);
    }
  };

  const handleCoverAndSwitch = () => {
    if (!awaitCover) return;
    setFlipped([]);
    setAwaitCover(false);
    const nextTurn = turn === 'player' ? 'rival' : 'player';
    setTurn(nextTurn);
    if (nextTurn === 'player') {
      setMessage('两张牌已盖回原位，现在轮到你翻牌。');
    } else {
      setMessage('两张牌已盖回原位，点击「对手翻牌」观看对手行动。');
    }
  };

  const runRivalMove = () => {
    if (finished || awaitCover || turn !== 'rival') return;
    const avail = deck
      .map((c, idx) => (c.matchedBy === null ? idx : -1))
      .filter((idx) => idx !== -1);
    if (avail.length < 2) return;
    const picked = shuffleArray(avail).slice(0, 2);
    setFlipped(picked);
    evaluatePair(picked[0], picked[1], 'rival', deck);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span className="text-[var(--diagram-brass)] font-semibold">你：{playerScore} 对</span>
            <span className="text-[var(--diagram-accent)] font-semibold">对手：{rivalScore} 对</span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--text-primary)]">
              {finished ? '本局结束' : turn === 'player' ? '当前：轮到你翻牌' : '当前：对手回合'}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            洗牌重开
          </button>
        </div>

        {/* 4x3 翻牌阵 */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-w-[480px] mx-auto">
          {deck.map((card, idx) => {
            const isFaceUp = card.matchedBy !== null || flipped.includes(idx);
            const red = isRedSuit(card.suit);
            const matchedPlayer = card.matchedBy === 'player';
            const matchedRival = card.matchedBy === 'rival';

            return (
              <button
                key={card.uid}
                type="button"
                disabled={finished || awaitCover || turn !== 'player' || isFaceUp}
                onClick={() => handleFlip(idx)}
                className={`h-[70px] rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all select-none ${
                  matchedPlayer
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] opacity-80'
                    : matchedRival
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] opacity-80'
                      : isFaceUp
                        ? 'border-[var(--text-primary)] bg-[var(--diagram-panel)] ring-2 ring-[var(--diagram-brass)]/50'
                        : 'border-[var(--diagram-border)] bg-[color-mix(in_srgb,var(--diagram-border)_35%,var(--diagram-panel))] hover:border-[var(--diagram-brass)] hover:-translate-y-0.5'
                } ${
                  !isFaceUp && turn === 'player' && !awaitCover && !finished
                    ? 'cursor-pointer'
                    : 'cursor-default'
                }`}
              >
                {isFaceUp ? (
                  <>
                    <span
                      className={`text-[18px] font-bold leading-none ${
                        red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {card.suit}
                      {card.rank}
                    </span>
                    <span className="text-[9.5px] text-[var(--text-secondary)]">
                      {matchedPlayer ? '你得分' : matchedRival ? '对手得' : '已翻开'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] tabular-nums">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">双副暗牌</span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* 操作按钮区 */}
        {(awaitCover || (turn === 'rival' && !finished)) && (
          <div className="flex justify-center">
            {awaitCover ? (
              <button
                type="button"
                onClick={handleCoverAndSwitch}
                className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                盖回原位 · {turn === 'player' ? '换对手行动' : '轮回你的回合'}
              </button>
            ) : (
              <button
                type="button"
                onClick={runRivalMove}
                className="px-4 py-1.5 rounded-full bg-[var(--diagram-accent)] text-[var(--accent-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                对手翻 2 张牌
              </button>
            )}
          </div>
        )}

        {/* 状态反馈 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] font-medium text-center border ${
            awaitCover
              ? 'border-[var(--diagram-accent)]/55 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {message}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        双副 104 张牌要求花色与点数完全一致才算配对；此 12 张精简牌阵混入同点异花干扰牌，可直接体验记位与续翻节奏。
      </p>
    </div>
  );
}

// ============================================================================
// 3. kakegurui-life-or-death | 生或死
// ============================================================================

interface SwordLanding {
  hole: number;
  fate: 'life' | 'death';
}

function dropTenSwords(): SwordLanding[] {
  const holes = shuffleArray(Array.from({ length: 30 }, (_, i) => i + 1)).slice(0, 10);
  return holes.map((hole) => ({
    hole,
    fate: Math.random() < 0.5 ? 'life' : 'death',
  }));
}

function LifeOrDeathDiagram() {
  const [bets, setBets] = useState<number[]>([7, 19]);
  const [landings, setLandings] = useState<SwordLanding[] | null>(null);
  const [balance, setBalance] = useState<number>(50);
  const [lastDelta, setLastDelta] = useState<number | null>(null);

  const toggleHole = (hole: number) => {
    setBets((prev) => {
      if (prev.includes(hole)) {
        return prev.length > 1 ? prev.filter((h) => h !== hole) : prev;
      }
      if (prev.length >= 5) return prev;
      return [...prev, hole].sort((a, b) => a - b);
    });
    setLandings(null);
    setLastDelta(null);
  };

  const handleDrop = () => {
    const result = dropTenSwords();
    setLandings(result);
    const map = new Map<number, 'life' | 'death'>(result.map((s) => [s.hole, s.fate]));
    let delta = 0;
    bets.forEach((h) => {
      const hit = map.get(h);
      if (hit === 'life') delta += 30;
      else if (hit === 'death') delta -= 30;
      else delta -= 1;
    });
    setLastDelta(delta);
    setBalance((v) => v + delta);
  };

  const reset = () => {
    setBets([7, 19]);
    setLandings(null);
    setBalance(50);
    setLastDelta(null);
  };

  const landingMap = new Map<number, 'life' | 'death'>(
    (landings ?? []).map((s) => [s.hole, s.fate])
  );

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span className="text-[var(--text-primary)]">
              当前资产：
              <strong
                className={
                  balance < 0
                    ? 'text-[var(--diagram-accent)] text-[14px]'
                    : 'text-[var(--diagram-brass)] text-[14px]'
                }
              >
                {balance} 枚
              </strong>
            </span>
            <span className="text-[var(--text-secondary)]">
              已押孔位（最多 5 孔，每孔 1 枚）：{bets.map((h) => `#${h}`).join(' ')}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置资产
          </button>
        </div>

        {/* 主体：30 孔圆盘 SVG + 操作明细 */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-center">
          {/* 30 孔圆盘 */}
          <div className="mx-auto w-[236px] h-[236px] relative">
            <svg viewBox="0 0 240 240" className="w-full h-full select-none">
              <circle
                cx="120"
                cy="120"
                r="112"
                fill="var(--diagram-panel)"
                stroke="var(--diagram-border)"
                strokeWidth="2"
              />
              <circle
                cx="120"
                cy="120"
                r="66"
                fill="var(--diagram-surface)"
                stroke="var(--border-hairline)"
                strokeWidth="1.5"
              />
              {Array.from({ length: 30 }, (_, idx) => {
                const hole = idx + 1;
                const angle = (idx / 30) * Math.PI * 2 - Math.PI / 2;
                const cx = 120 + Math.cos(angle) * 92;
                const cy = 120 + Math.sin(angle) * 92;
                const isBet = bets.includes(hole);
                const fate = landingMap.get(hole);

                const fill =
                  fate === 'life'
                    ? 'var(--diagram-brass)'
                    : fate === 'death'
                      ? 'var(--diagram-accent)'
                      : isBet
                        ? 'color-mix(in srgb, var(--diagram-brass) 28%, var(--diagram-panel))'
                        : 'var(--diagram-surface)';

                const stroke = isBet
                  ? 'var(--text-primary)'
                  : fate === 'life'
                    ? 'var(--diagram-brass)'
                    : fate === 'death'
                      ? 'var(--diagram-accent)'
                      : 'var(--diagram-border)';

                const textFill =
                  fate === 'life'
                    ? 'var(--btn-primary-fg)'
                    : fate === 'death'
                      ? 'var(--accent-fg)'
                      : 'var(--text-primary)';

                return (
                  <g
                    key={hole}
                    onClick={() => toggleHole(hole)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isBet ? 9.5 : 8}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isBet ? 2 : 1}
                    />
                    <text
                      x={cx}
                      y={cy + 3}
                      textAnchor="middle"
                      fontSize="7.5"
                      fontWeight={isBet || fate ? '700' : '500'}
                      fill={textFill}
                    >
                      {hole}
                    </text>
                  </g>
                );
              })}

              {/* 圆心读数 */}
              <text
                x="120"
                y="112"
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-secondary)"
              >
                {landings ? '本轮净赔付' : '点击孔位押注'}
              </text>
              <text
                x="120"
                y="134"
                textAnchor="middle"
                fontSize="20"
                fontWeight="700"
                fill={
                  lastDelta === null
                    ? 'var(--text-primary)'
                    : lastDelta >= 0
                      ? 'var(--diagram-brass)'
                      : 'var(--diagram-accent)'
                }
              >
                {lastDelta === null
                  ? `${bets.length} 孔`
                  : lastDelta > 0
                    ? `+${lastDelta}`
                    : `${lastDelta}`}
              </text>
            </svg>
          </div>

          {/* 右侧控制与 10 剑结果 */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <div className="rounded-lg border border-[var(--diagram-brass)]/50 bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))] p-2.5 space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--diagram-brass)]">
                  <Sword className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>剑尖朝下 · 生</span>
                </div>
                <p className="text-[var(--text-secondary)]">命中押注孔：+30 倍彩金</p>
              </div>
              <div className="rounded-lg border border-[var(--diagram-accent)]/50 bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))] p-2.5 space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--diagram-accent)]">
                  <Skull className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>剑柄朝下 · 死</span>
                </div>
                <p className="text-[var(--text-secondary)]">命中押注孔：-30 倍倒赔</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDrop}
              className="w-full py-2 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12.5px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              扣筒落剑（10 把短剑随机落孔）
            </button>

            <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-1.5 text-[12px]">
              <div className="text-[11px] text-[var(--text-secondary)]">
                {landings ? '本轮押注孔位判定明细' : '开筒后显示各押注孔位判定'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {bets.map((h) => {
                  const fate = landingMap.get(h);
                  return (
                    <span
                      key={h}
                      className={`px-2 py-1 rounded-md text-[11.5px] font-semibold tabular-nums border ${
                        fate === 'life'
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                          : fate === 'death'
                            ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                            : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      #{h}{' '}
                      {landings
                        ? fate === 'life'
                          ? '生 +30'
                          : fate === 'death'
                            ? '死 -30'
                            : '空 -1'
                        : '待开筒'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        在圆盘上点选 1–5 个孔位后点击「扣筒落剑」：命中剑尖朝下的「生」赢 30 倍，撞上剑柄朝下的「死」则立刻倒赔 30 倍。
      </p>
    </div>
  );
}

// ============================================================================
// 4. kakegurui-indian-poker | 债务整理·印第安扑克
// ============================================================================

interface TwoCard {
  suit: Suit;
  rank: number; // 2..14 (14=A)
}

interface IndianSeat {
  id: string;
  name: string;
  isSelf: boolean;
  cards: [TwoCard, TwoCard];
}

const RANK_LABELS: Record<number, string> = {
  14: 'A',
  13: 'K',
  12: 'Q',
  11: 'J',
  10: '10',
  9: '9',
  8: '8',
  7: '7',
  6: '6',
  5: '5',
  4: '4',
  3: '3',
  2: '2',
};

const DEBT_SLOTS = [
  { rank: 1, label: '第 1 名', debt: '¥1,200 万', note: '最小债务（脱身）' },
  { rank: 2, label: '第 2 名', debt: '¥4,800 万', note: '次低债务' },
  { rank: 3, label: '第 3 名', debt: '¥1.6 亿', note: '沉重债务' },
  { rank: 4, label: '第 4 名', debt: '¥3.1 亿', note: '最大债务（接盘）' },
];

function scoreIndianHand(cards: [TwoCard, TwoCard]): { score: number; label: string } {
  const [a, b] = cards;
  const hi = Math.max(a.rank, b.rank);
  const lo = Math.min(a.rank, b.rank);
  const sameSuit = a.suit === b.suit;
  const sameRank = a.rank === b.rank;

  if (sameSuit && sameRank) {
    return { score: 40000 + hi * 100, label: `同花对子 ${RANK_LABELS[hi]}` };
  }
  if (sameRank) {
    return { score: 30000 + hi * 100, label: `对子 ${RANK_LABELS[hi]}` };
  }
  if (sameSuit) {
    return { score: 20000 + hi * 100 + lo, label: `同花 ${RANK_LABELS[hi]}-${RANK_LABELS[lo]}` };
  }
  return { score: 10000 + hi * 100 + lo, label: `散牌 ${RANK_LABELS[hi]}-${RANK_LABELS[lo]}` };
}

const INDIAN_DEALS: IndianSeat[][] = [
  [
    { id: 'self', name: '你（暗牌）', isSelf: true, cards: [{ suit: '♠', rank: 13 }, { suit: '♠', rank: 13 }] },
    { id: 'p1', name: '玩家甲', isSelf: false, cards: [{ suit: '♥', rank: 14 }, { suit: '♣', rank: 14 }] },
    { id: 'p2', name: '玩家乙', isSelf: false, cards: [{ suit: '♦', rank: 12 }, { suit: '♦', rank: 9 }] },
    { id: 'p3', name: '玩家丙', isSelf: false, cards: [{ suit: '♠', rank: 11 }, { suit: '♣', rank: 7 }] },
  ],
  [
    { id: 'self', name: '你（暗牌）', isSelf: true, cards: [{ suit: '♣', rank: 9 }, { suit: '♦', rank: 6 }] },
    { id: 'p1', name: '玩家甲', isSelf: false, cards: [{ suit: '♠', rank: 10 }, { suit: '♥', rank: 10 }] },
    { id: 'p2', name: '玩家乙', isSelf: false, cards: [{ suit: '♥', rank: 13 }, { suit: '♥', rank: 8 }] },
    { id: 'p3', name: '玩家丙', isSelf: false, cards: [{ suit: '♠', rank: 14 }, { suit: '♦', rank: 5 }] },
  ],
  [
    { id: 'self', name: '你（暗牌）', isSelf: true, cards: [{ suit: '♥', rank: 11 }, { suit: '♥', rank: 10 }] },
    { id: 'p1', name: '玩家甲', isSelf: false, cards: [{ suit: '♣', rank: 12 }, { suit: '♦', rank: 12 }] },
    { id: 'p2', name: '玩家乙', isSelf: false, cards: [{ suit: '♠', rank: 14 }, { suit: '♣', rank: 9 }] },
    { id: 'p3', name: '玩家丙', isSelf: false, cards: [{ suit: '♦', rank: 8 }, { suit: '♠', rank: 4 }] },
  ],
];

function IndianPokerDiagram() {
  const [dealIdx, setDealIdx] = useState<number>(0);
  const [revealSelf, setRevealSelf] = useState<boolean>(false);

  const seats = INDIAN_DEALS[dealIdx];
  const ranked = [...seats]
    .map((s) => ({ ...s, eval: scoreIndianHand(s.cards) }))
    .sort((a, b) => b.eval.score - a.eval.score);

  const selfRank = ranked.findIndex((s) => s.isSelf) + 1;

  const nextDeal = () => {
    setDealIdx((i) => (i + 1) % INDIAN_DEALS.length);
    setRevealSelf(false);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--text-secondary)]">
            牌型强弱：同花对子 &gt; 对子 &gt; 同花 &gt; 散牌
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRevealSelf((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold cursor-pointer transition-colors ${
                revealSelf
                  ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'bg-[var(--text-primary)] text-[var(--bg-page)]'
              }`}
            >
              {revealSelf ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  盖回自己底牌
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  看自己底牌
                </>
              )}
            </button>
            <button
              type="button"
              onClick={nextDeal}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
              换一组牌面
            </button>
          </div>
        </div>

        {/* 4 人额前双牌桌 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {seats.map((seat) => {
            const hidden = seat.isSelf && !revealSelf;
            const evalRes = scoreIndianHand(seat.cards);
            const rankPos = ranked.findIndex((r) => r.id === seat.id) + 1;
            const highlightSelf = seat.isSelf;

            return (
              <div
                key={seat.id}
                className={`rounded-xl border p-2.5 space-y-2 flex flex-col items-center ${
                  highlightSelf
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                }`}
              >
                <div className="w-full flex items-center justify-between text-[11.5px]">
                  <span
                    className={`font-semibold ${
                      highlightSelf ? 'text-[var(--diagram-brass)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {seat.isSelf ? '你' : seat.name}
                  </span>
                  {revealSelf && (
                    <span className="px-1.5 py-0.5 rounded bg-[var(--diagram-surface)] text-[10px] font-bold text-[var(--text-secondary)] tabular-nums">
                      第 {rankPos} 名
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {seat.cards.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-[44px] h-[58px] rounded-lg border flex flex-col items-center justify-center font-bold select-none ${
                        hidden
                          ? 'border-[var(--diagram-brass)]/70 bg-[var(--diagram-surface)] text-[var(--diagram-brass)]'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)]'
                      }`}
                    >
                      {hidden ? (
                        <HelpCircle className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <span
                          className={`text-[15px] ${
                            isRedSuit(c.suit)
                              ? 'text-[var(--diagram-accent)]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {c.suit}
                          {RANK_LABELS[c.rank]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <span className="text-[11px] text-[var(--text-secondary)] text-center">
                  {hidden ? '自己不可见' : evalRes.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 密闭债务表实时映射 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="font-semibold text-[var(--text-primary)]">密闭债务表 · 按最终名次重新分配</span>
            <span className="text-[var(--text-secondary)]">
              {revealSelf
                ? `你排第 ${selfRank} 名 → 接手 ${DEBT_SLOTS[selfRank - 1].debt}`
                : '未揭晓己方底牌，名次归属待定'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DEBT_SLOTS.map((slot, idx) => {
              const assignee = ranked[idx];
              const isSelfHere = revealSelf && assignee.isSelf;
              return (
                <div
                  key={slot.rank}
                  className={`rounded-lg border px-2.5 py-2 text-[11.5px] space-y-0.5 transition-all ${
                    isSelfHere
                      ? slot.rank <= 2
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))]'
                        : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-surface))]'
                      : 'border-[var(--border-hairline)] bg-[var(--diagram-surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--text-primary)]">{slot.label}</span>
                    <span className="text-[10.5px] text-[var(--text-secondary)]">
                      {revealSelf ? (assignee.isSelf ? '你' : assignee.name) : '？'}
                    </span>
                  </div>
                  <div
                    className={`font-bold tabular-nums ${
                      slot.rank === 1
                        ? 'text-[var(--diagram-brass)]'
                        : slot.rank === 4
                          ? 'text-[var(--diagram-accent)]'
                          : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {slot.debt}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        其余三人额前的双牌一览无余，唯独自己头顶是两张暗牌；点击「看自己底牌」即可对比牌型并映射到密闭债务表。
      </p>
    </div>
  );
}

// ============================================================================
// 5. kakegurui-esp-game | ESP 卡片游戏
// ============================================================================

type EspSymbol = 'circle' | 'cross' | 'waves' | 'square' | 'star';

const ESP_SYMBOLS: EspSymbol[] = ['circle', 'cross', 'waves', 'square', 'star'];

const ESP_META: Record<
  EspSymbol,
  { name: string; Icon: ComponentType<{ className?: string }> }
> = {
  circle: { name: '圆', Icon: Circle },
  cross: { name: '十字', Icon: Plus },
  waves: { name: '波浪', Icon: Waves },
  square: { name: '方', Icon: Square },
  star: { name: '星', Icon: Star },
};

function countMatches(a: EspSymbol[], b: EspSymbol[]): number {
  return a.reduce((acc, sym, i) => acc + (sym === b[i] ? 1 : 0), 0);
}

function CylinderVisual({ bullets, tone }: { bullets: number; tone: 'brass' | 'accent' }) {
  return (
    <div className="flex items-center gap-1" aria-label={`装弹 ${bullets} 发`}>
      {Array.from({ length: 6 }, (_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full border ${
            i < bullets
              ? tone === 'brass'
                ? 'bg-[var(--diagram-brass)] border-[var(--diagram-brass)]'
                : 'bg-[var(--diagram-accent)] border-[var(--diagram-accent)]'
              : 'bg-[var(--diagram-surface)] border-[var(--diagram-border)]'
          }`}
        />
      ))}
    </div>
  );
}

function EspGameDiagram() {
  const [dealerOrder, setDealerOrder] = useState<EspSymbol[]>([
    'star',
    'circle',
    'waves',
    'cross',
    'square',
  ]);
  const [playerOrder, setPlayerOrder] = useState<EspSymbol[]>([
    'star',
    'waves',
    'circle',
    'cross',
    'square',
  ]);
  const [rivalOrder, setRivalOrder] = useState<EspSymbol[]>([
    'star',
    'circle',
    'square',
    'cross',
    'waves',
  ]);
  const [swapFrom, setSwapFrom] = useState<number | null>(null);
  const [myBullets, setMyBullets] = useState<number>(3);
  const [rivalBullets, setRivalBullets] = useState<number>(6);
  const [revealed, setRevealed] = useState<boolean>(false);

  const playerHits = countMatches(playerOrder, dealerOrder);
  const rivalHits = countMatches(rivalOrder, dealerOrder);

  const handleCardClick = (idx: number) => {
    setRevealed(false);
    if (swapFrom === null) {
      setSwapFrom(idx);
      return;
    }
    if (swapFrom === idx) {
      setSwapFrom(null);
      return;
    }
    setPlayerOrder((prev) => {
      const next = [...prev];
      [next[swapFrom], next[idx]] = [next[idx], next[swapFrom]];
      return next;
    });
    setSwapFrom(null);
  };

  const reshuffleRound = () => {
    setDealerOrder(shuffleArray(ESP_SYMBOLS));
    setRivalOrder(shuffleArray(ESP_SYMBOLS));
    setSwapFrom(null);
    setRevealed(false);
  };

  const forceTieDemo = () => {
    // 调整玩家排序使其命中数等于对手命中数，方便直接体验「平局不开枪」
    setPlayerOrder([...rivalOrder]);
    setSwapFrom(null);
    setRevealed(true);
  };

  const winner =
    playerHits > rivalHits ? 'player' : rivalHits > playerHits ? 'rival' : 'tie';

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="text-[var(--text-secondary)]">
            点选己方任意 2 张符号交换顺序，再秘密设定装弹数
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={forceTieDemo}
              className="px-2.5 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-brass)] hover:border-[var(--diagram-brass)] cursor-pointer"
            >
              演示平局
            </button>
            <button
              type="button"
              onClick={reshuffleRound}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              新荷官序列
            </button>
          </div>
        </div>

        {/* 三排符号对比：荷官 / 你 / 对手 */}
        <div className="space-y-2.5">
          {/* 荷官顺序 */}
          <div className="grid grid-cols-[64px_1fr] items-center gap-2">
            <span className="text-[11.5px] font-semibold text-[var(--text-secondary)]">荷官答案</span>
            <div className="grid grid-cols-5 gap-1.5">
              {dealerOrder.map((sym, i) => {
                const { name, Icon } = ESP_META[sym];
                return (
                  <div
                    key={i}
                    className="h-[46px] rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] flex flex-col items-center justify-center gap-0.5"
                  >
                    {revealed ? (
                      <>
                        <Icon className="w-3.5 h-3.5 text-[var(--text-primary)]" aria-hidden="true" />
                        <span className="text-[10px] text-[var(--text-secondary)]">{name}</span>
                      </>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 你的排列（可点击交换） */}
          <div className="grid grid-cols-[64px_1fr] items-center gap-2">
            <span className="text-[11.5px] font-semibold text-[var(--diagram-brass)]">
              你的排序
              {revealed && (
                <span className="block text-[10.5px] tabular-nums">{playerHits}/5 命中</span>
              )}
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {playerOrder.map((sym, i) => {
                const { name, Icon } = ESP_META[sym];
                const isSelected = swapFrom === i;
                const isHit = revealed && sym === dealerOrder[i];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleCardClick(i)}
                    className={`h-[52px] rounded-lg border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_22%,var(--diagram-panel))] ring-2 ring-[var(--text-primary)] -translate-y-0.5'
                        : isHit
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="text-[10.5px] font-semibold">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 对手排列 */}
          <div className="grid grid-cols-[64px_1fr] items-center gap-2">
            <span className="text-[11.5px] font-semibold text-[var(--diagram-accent)]">
              对手排序
              {revealed && (
                <span className="block text-[10.5px] tabular-nums">{rivalHits}/5 命中</span>
              )}
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {rivalOrder.map((sym, i) => {
                const { name, Icon } = ESP_META[sym];
                const isHit = revealed && sym === dealerOrder[i];
                return (
                  <div
                    key={i}
                    className={`h-[46px] rounded-lg border flex flex-col items-center justify-center gap-0.5 ${
                      isHit
                        ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {revealed ? (
                      <>
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="text-[10px]">{name}</span>
                      </>
                    ) : (
                      <HelpCircle className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 双方秘密装弹滑块 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-brass)]">你装填子弹：{myBullets} / 6 发</span>
              <CylinderVisual bullets={myBullets} tone="brass" />
            </div>
            <input
              type="range"
              min={0}
              max={6}
              value={myBullets}
              onChange={(e) => setMyBullets(Number(e.target.value))}
              className="w-full accent-[var(--diagram-brass)] cursor-pointer"
            />
          </div>

          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-accent)]">对手装填子弹：{rivalBullets} / 6 发</span>
              <CylinderVisual bullets={rivalBullets} tone="accent" />
            </div>
            <input
              type="range"
              min={0}
              max={6}
              value={rivalBullets}
              onChange={(e) => setRivalBullets(Number(e.target.value))}
              className="w-full accent-[var(--diagram-accent)] cursor-pointer"
            />
          </div>
        </div>

        {/* 揭晓按钮与开枪结算 */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
            揭晓排序并判定开枪权
          </button>

          <div
            className={`w-full rounded-lg px-3 py-2 text-[12px] font-semibold border text-center ${
              !revealed
                ? 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                : winner === 'tie'
                  ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                  : winner === 'player'
                    ? 'border-[var(--diagram-brass)]/50 bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))] text-[var(--text-primary)]'
                    : 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
            }`}
          >
            {!revealed
              ? '排好 5 张符号并设定双方装弹数后，点击揭晓结果。'
              : winner === 'tie'
                ? `双方同为 ${playerHits} 命中 · 平局！本轮无人开枪（即使满膛 6 发亦零伤亡）`
                : winner === 'player'
                  ? `你 ${playerHits} : ${rivalHits} 胜出 · 由你持枪向对手射击（实弹命中率 ${Math.round((myBullets / 6) * 100)}%）`
                  : `对手 ${rivalHits} : ${playerHits} 胜出 · 对手向你扣动扳机（实弹命中率 ${Math.round((rivalBullets / 6) * 100)}%）`}
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        与隔间荷官的 5 符号序列比对命中数，命中多者持己方左轮向败者射击；只有命中数相等时才无人开枪。
      </p>
    </div>
  );
}

// ============================================================================
// 6. kakegurui-choice-poker | 选择扑克
// ============================================================================

interface PokerCardItem {
  suit: Suit;
  rank: string;
}

interface ChoicePreset {
  id: string;
  label: string;
  strongName: string;
  strongCards: PokerCardItem[];
  weakName: string;
  weakCards: PokerCardItem[];
}

const CHOICE_PRESETS: ChoicePreset[] = [
  {
    id: 'fullhouse-vs-7high',
    label: '葫芦 vs 7高散牌',
    strongName: '葫芦（K 带 9）',
    strongCards: [
      { suit: '♠', rank: 'K' },
      { suit: '♥', rank: 'K' },
      { suit: '♦', rank: 'K' },
      { suit: '♣', rank: '9' },
      { suit: '♠', rank: '9' },
    ],
    weakName: '最弱散牌（7-5-4-3-2）',
    weakCards: [
      { suit: '♣', rank: '7' },
      { suit: '♦', rank: '5' },
      { suit: '♠', rank: '4' },
      { suit: '♥', rank: '3' },
      { suit: '♣', rank: '2' },
    ],
  },
  {
    id: 'flush-vs-pair',
    label: '同花 vs 8高散牌',
    strongName: '红桃同花（A 高）',
    strongCards: [
      { suit: '♥', rank: 'A' },
      { suit: '♥', rank: 'J' },
      { suit: '♥', rank: '8' },
      { suit: '♥', rank: '6' },
      { suit: '♥', rank: '3' },
    ],
    weakName: '弱散牌（8-6-4-3-2）',
    weakCards: [
      { suit: '♠', rank: '8' },
      { suit: '♣', rank: '6' },
      { suit: '♦', rank: '4' },
      { suit: '♠', rank: '3' },
      { suit: '♥', rank: '2' },
    ],
  },
];

function ChoicePokerDiagram() {
  const [presetIdx, setPresetIdx] = useState<number>(0);
  const [mode, setMode] = useState<'strong' | 'weak'>('strong');

  const preset = CHOICE_PRESETS[presetIdx];
  const strongWins = mode === 'strong';

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：场景切换 + 末手加注选择权开关 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-[12px]">
          <div className="flex items-center gap-1.5">
            {CHOICE_PRESETS.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPresetIdx(idx)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                  presetIdx === idx
                    ? 'bg-[var(--diagram-panel)] border border-[var(--diagram-brass)] text-[var(--diagram-brass)]'
                    : 'bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[var(--text-secondary)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center rounded-full p-0.5 bg-[var(--diagram-panel)] border border-[var(--diagram-border)]">
            <button
              type="button"
              onClick={() => setMode('strong')}
              className={`px-3 py-1 rounded-full text-[11.5px] font-semibold cursor-pointer transition-colors ${
                mode === 'strong'
                  ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              比最强（强牌胜）
            </button>
            <button
              type="button"
              onClick={() => setMode('weak')}
              className={`px-3 py-1 rounded-full text-[11.5px] font-semibold cursor-pointer transition-colors ${
                mode === 'weak'
                  ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              比最弱（弱牌胜）
            </button>
          </div>
        </div>

        {/* 两手 5 张牌对比 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 强牌侧 */}
          <div
            className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${
              strongWins
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_15%,var(--diagram-panel))] ring-1 ring-[var(--diagram-brass)]/50'
                : 'border-[var(--border-hairline)] bg-[var(--diagram-panel)] opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-[var(--text-primary)]">
                甲方 · {preset.strongName}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  strongWins
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[var(--diagram-surface)] text-[var(--text-muted)]'
                }`}
              >
                {strongWins ? (
                  <>
                    <Crown className="w-3 h-3" aria-hidden="true" />
                    胜出
                  </>
                ) : (
                  '惨败'
                )}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {preset.strongCards.map((c, idx) => (
                <div
                  key={idx}
                  className="h-[62px] rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] flex flex-col items-center justify-center font-bold select-none"
                >
                  <span
                    className={`text-[15px] ${
                      isRedSuit(c.suit)
                        ? 'text-[var(--diagram-accent)]'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {c.suit}
                    {c.rank}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 极弱散牌侧 */}
          <div
            className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${
              !strongWins
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_15%,var(--diagram-panel))] ring-1 ring-[var(--diagram-accent)]/50'
                : 'border-[var(--border-hairline)] bg-[var(--diagram-panel)] opacity-70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-[var(--text-primary)]">
                乙方 · {preset.weakName}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  !strongWins
                    ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                    : 'bg-[var(--diagram-surface)] text-[var(--text-muted)]'
                }`}
              >
                {!strongWins ? (
                  <>
                    <Crown className="w-3 h-3" aria-hidden="true" />
                    逆转胜出
                  </>
                ) : (
                  '落败'
                )}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {preset.weakCards.map((c, idx) => (
                <div
                  key={idx}
                  className="h-[62px] rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] flex flex-col items-center justify-center font-bold select-none"
                >
                  <span
                    className={`text-[15px] ${
                      isRedSuit(c.suit)
                        ? 'text-[var(--diagram-accent)]'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {c.suit}
                    {c.rank}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 反转提示条 */}
        <div className="rounded-lg px-3.5 py-2.5 bg-[var(--diagram-panel)] border border-[var(--diagram-border)] flex items-center justify-center gap-2 text-[12px] font-semibold text-[var(--text-primary)]">
          <ArrowUpDown className="w-4 h-4 text-[var(--diagram-brass)] shrink-0" aria-hidden="true" />
          <span>
            {strongWins
              ? '末手加注方指定「比最强」：牌型顺位照常，大牌甲方拿走全部彩池。'
              : '末手加注方指定「比最弱」：胜负瞬间倒转！极弱无对散牌反而碾压强牌。'}
          </span>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        最后一次主动加注并被跟注的玩家握有「选择权」，开牌前点击切换比强或比弱，整局胜负立刻反转。
      </p>
    </div>
  );
}

// ============================================================================
// 7. kakegurui-finger-guillotine | 断指台
// ============================================================================

function FingerGuillotineDiagram() {
  const [bladeRope, setBladeRope] = useState<number>(() => Math.floor(Math.random() * 20));
  const [cutRopes, setCutRopes] = useState<number[]>([]);
  const [fingerOwner, setFingerOwner] = useState<'player' | 'rival'>('player');
  const [outcome, setOutcome] = useState<'playing' | 'dropped' | 'withdrew'>('playing');

  const remaining = 20 - cutRopes.length;
  const riskPct = ((1 / Math.max(1, remaining)) * 100).toFixed(1);

  const cutRope = (idx: number) => {
    if (outcome !== 'playing' || cutRopes.includes(idx)) return;
    const nextCut = [...cutRopes, idx];
    setCutRopes(nextCut);
    if (idx === bladeRope) {
      setOutcome('dropped');
    } else {
      setFingerOwner((o) => (o === 'player' ? 'rival' : 'player'));
    }
  };

  const withdraw = () => {
    if (outcome !== 'playing') return;
    setOutcome('withdrew');
  };

  const reset = () => {
    setBladeRope(Math.floor(Math.random() * 20));
    setCutRopes([]);
    setFingerOwner('player');
    setOutcome('playing');
  };

  const highRisk = remaining <= 5;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：剩余绳索与实时落刃概率 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span className="text-[var(--text-primary)]">
              剩余绳索：<strong className="text-[14px] text-[var(--diagram-brass)]">{remaining}</strong> / 20
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-bold border ${
                highRisk || outcome === 'dropped'
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
              }`}
            >
              下刀落刃概率：1/{remaining}（{riskPct}%）
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置 20 根绳
          </button>
        </div>

        {/* 悬刃横梁 */}
        <div
          className={`rounded-lg border px-3 py-2 flex items-center justify-between text-[12px] font-semibold transition-all ${
            outcome === 'dropped'
              ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_22%,var(--diagram-panel))] text-[var(--diagram-accent)] translate-y-1'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[var(--diagram-accent)]" aria-hidden="true" />
            {outcome === 'dropped' ? '悬刃已坠落！' : '上方重钢刃（仅 1 根真绳固定）'}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)]">
            {outcome === 'playing'
              ? `槽内手指：${fingerOwner === 'player' ? '你的手指（由对手剪）' : '对手手指（由你剪）'}`
              : `真绳位置：#${bladeRope + 1}`}
          </span>
        </div>

        {/* 20 根可剪绳索阵列 */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {Array.from({ length: 20 }, (_, idx) => {
            const isCut = cutRopes.includes(idx);
            const isTrueBlade = idx === bladeRope;
            const revealBlade = outcome !== 'playing' && isTrueBlade;

            return (
              <button
                key={idx}
                type="button"
                disabled={isCut || outcome !== 'playing'}
                onClick={() => cutRope(idx)}
                className={`h-[64px] rounded-lg border flex flex-col items-center justify-between py-1.5 transition-all select-none ${
                  revealBlade
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                    : isCut
                      ? 'border-[var(--border-hairline)] bg-[var(--bg-page)]/45 text-[var(--text-muted)] opacity-45 cursor-not-allowed'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                <span className="text-[10px] font-semibold tabular-nums">#{idx + 1}</span>
                {isCut ? (
                  <Scissors className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <span
                    className={`w-[2px] h-5 rounded-full ${
                      revealBlade ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                    }`}
                  />
                )}
                <span className="text-[9.5px]">
                  {revealBlade ? '真绳' : isCut ? '已断' : '剪断'}
                </span>
              </button>
            );
          })}
        </div>

        {/* 底部操作与结果 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div
            className={`w-full rounded-lg px-3 py-2 text-[12px] font-semibold border text-center ${
              outcome === 'dropped'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : outcome === 'withdrew'
                  ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
            }`}
          >
            {outcome === 'playing'
              ? `已安全剪断 ${cutRopes.length} 根假绳，点击任意未剪绳索继续（或点抽手认输）。`
              : outcome === 'dropped'
                ? `第 #${bladeRope + 1} 根正是系刃真绳！钢刃坠落，槽内放手指的${
                    fingerOwner === 'player' ? '你' : '对手'
                  }落败。`
                : `${
                    fingerOwner === 'player' ? '你' : '对手'
                  }在 1/${remaining}（${riskPct}%）压力下临阵抽手认输！真绳实际藏在 #${bladeRope + 1}。`}
          </div>

          {outcome === 'playing' && (
            <button
              type="button"
              onClick={withdraw}
              className="shrink-0 px-4 py-2 rounded-full bg-[var(--diagram-accent)] text-[var(--accent-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
            >
              抽手认输
            </button>
          )}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        20 根外观相同的绳索中只有 1 根固定着钢刃，每次剪断假绳都会推高下刀落刃概率，逼迫放手者心理崩盘。
      </p>
    </div>
  );
}

// ============================================================================
// 8. kakegurui-nim-type-zero | 尼姆零式
// ============================================================================

function createNimDeck(): number[] {
  const cards: number[] = [];
  for (let v = 0; v <= 3; v += 1) {
    for (let k = 0; k < 10; k += 1) {
      cards.push(v);
    }
  }
  return shuffleArray(cards);
}

interface NimState {
  deck: number[];
  playerHand: number[];
  total: number;
  playedZeros: number;
  log: string;
  ended: 'none' | 'player-bust' | 'rival-bust';
  loserName: string | null;
}

function initNimState(): NimState {
  const deck = createNimDeck();
  const playerHand = deck.slice(0, 4);
  return {
    deck: deck.slice(4),
    playerHand,
    total: 0,
    playedZeros: 0,
    log: '公共总和为 0。请打出一张手牌（0–3），切忌将总和顶超过 9！',
    ended: 'none',
    loserName: null,
  };
}

function NimTypeZeroDiagram() {
  const [state, setState] = useState<NimState>(() => initNimState());

  const playCard = (handIdx: number) => {
    if (state.ended !== 'none') return;

    const val = state.playerHand[handIdx];
    const deckCopy = [...state.deck];
    const nextHand = [...state.playerHand];
    const drawn = deckCopy.shift();
    if (drawn !== undefined) {
      nextHand[handIdx] = drawn;
    } else {
      nextHand.splice(handIdx, 1);
    }

    let total = state.total + val;
    let playedZeros = state.playedZeros + (val === 0 ? 1 : 0);
    const steps: string[] = [`你出 ${val}（→${total}）`];

    if (total > 9) {
      setState({
        deck: deckCopy,
        playerHand: nextHand,
        total,
        playedZeros,
        log: `${steps.join(' → ')} · 总和超过 9，你爆点出局！`,
        ended: 'player-bust',
        loserName: '你',
      });
      return;
    }

    // 顺时针其余 3 名玩家依次出牌
    const rivals = ['玩家 B', '玩家 C', '玩家 D'];
    for (const rName of rivals) {
      const candidate = deckCopy.shift() ?? Math.floor(Math.random() * 4);
      // 尽量让 AI 在 <=9 时优先保守出小牌，逼近 9 时模拟真实博弈压力
      const room = 9 - total;
      let rPlay = candidate;
      if (rPlay > room && Math.random() < 0.65 && room >= 0) {
        rPlay = Math.min(room, candidate);
      }
      total += rPlay;
      if (rPlay === 0) playedZeros += 1;
      steps.push(`${rName}出 ${rPlay}（→${total}）`);

      if (total > 9) {
        setState({
          deck: deckCopy,
          playerHand: nextHand,
          total,
          playedZeros,
          log: `${steps.join(' → ')} · ${rName}将总和顶破 9 点爆局！你成功存活。`,
          ended: 'rival-bust',
          loserName: rName,
        });
        return;
      }
    }

    setState({
      deck: deckCopy,
      playerHand: nextHand,
      total,
      playedZeros,
      log: `${steps.join(' → ')} · 轮回你出牌（当前距爆点还差 ${9 - total}）。`,
      ended: 'none',
      loserName: null,
    });
  };

  const reset = () => setState(initNimState());

  const atLimit = state.total === 9 && state.ended === 'none';

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span className="text-[var(--text-secondary)]">
              已出「0」牌：<strong className="text-[var(--diagram-brass)]">{state.playedZeros}</strong> / 10
            </span>
            <span className="text-[var(--text-secondary)]">
              剩余牌库：<strong className="text-[var(--text-primary)]">{state.deck.length}</strong> 张
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            新开一轮
          </button>
        </div>

        {/* 公共总和 0~9 进度槽 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
              当前公共总和（上限 9）
            </span>
            <span
              className={`text-[24px] font-bold tabular-nums leading-none ${
                state.total > 9
                  ? 'text-[var(--diagram-accent)]'
                  : state.total >= 7
                    ? 'text-[var(--diagram-brass)]'
                    : 'text-[var(--text-primary)]'
              }`}
            >
              {state.total}
              <span className="text-[13px] font-normal text-[var(--text-secondary)]"> / 9</span>
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, idx) => {
              const num = idx + 1;
              const filled = state.total >= num;
              const isBustSlot = num === 10;
              return (
                <div
                  key={num}
                  className={`h-7 rounded-md border flex items-center justify-center text-[11px] font-bold tabular-nums transition-all ${
                    isBustSlot
                      ? filled
                        ? 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                        : 'border-[var(--diagram-accent)]/50 bg-[color-mix(in_srgb,var(--diagram-accent)_10%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                      : filled
                        ? num >= 8
                          ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                          : 'border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-page)]'
                        : 'border-[var(--border-hairline)] bg-[var(--diagram-surface)] text-[var(--text-muted)]'
                  }`}
                >
                  {isBustSlot ? '爆' : num}
                </div>
              );
            })}
          </div>
        </div>

        {/* 你的 4 张 0–3 手牌 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[var(--diagram-brass)]">你的 4 张手牌（点击出牌）</span>
            {atLimit && (
              <span className="text-[11px] font-semibold text-[var(--diagram-accent)]">
                总和已达 9！唯有出「0」可免爆
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 max-w-[360px] mx-auto">
            {state.playerHand.map((val, idx) => {
              const wouldBust = state.total + val > 9;
              return (
                <button
                  key={`${idx}-${val}`}
                  type="button"
                  disabled={state.ended !== 'none'}
                  onClick={() => playCard(idx)}
                  className={`h-[72px] rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all select-none ${
                    state.ended !== 'none'
                      ? 'border-[var(--border-hairline)] bg-[var(--bg-page)]/45 text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                      : wouldBust
                        ? 'border-[var(--diagram-accent)]/70 bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))] text-[var(--diagram-accent)] hover:-translate-y-0.5 cursor-pointer'
                        : val === 0
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] hover:-translate-y-0.5 cursor-pointer'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  <span className="text-[22px] font-bold tabular-nums leading-none">{val}</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {wouldBust ? `→${state.total + val} 爆` : `→${state.total + val}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 回合记录 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 text-[12px] font-medium text-center border ${
            state.ended === 'player-bust'
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : state.ended === 'rival-bust'
                ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {state.log}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        四人轮流出 0–3 数字牌叠加总和，出完立即补牌；谁将数字顶超过 9 即负分出局，保住「0」牌是卡 9 绝境的救命稻草。
      </p>
    </div>
  );
}

// ============================================================================
// 9. kakegurui-tower-of-doors | 扉之塔
// ============================================================================

type DoorSymbol = 'sun' | 'moon' | 'star';

const DOOR_SYMBOLS: DoorSymbol[] = ['sun', 'moon', 'star'];

const DOOR_META: Record<
  DoorSymbol,
  { name: string; Icon: ComponentType<{ className?: string }> }
> = {
  sun: { name: '日之门', Icon: Sun },
  moon: { name: '月之门', Icon: Moon },
  star: { name: '星之门', Icon: Star },
};

interface TowerPuzzle {
  // 1F -> 2F, 2F -> 3F, 3F -> 4F, 4F -> 5F 的正确门符号
  correctDoors: [DoorSymbol, DoorSymbol, DoorSymbol, DoorSymbol];
  // 5F 顶层 4 扇门中唯一生还阳台索引（0..3）
  trueBalcony: number;
  // 顶层 4 扇门标签（唯一与前四层出现最多次/特定序列吻合者为生还门）
  topClue: string;
}

const TOWER_PUZZLES: TowerPuzzle[] = [
  {
    correctDoors: ['moon', 'star', 'sun', 'moon'],
    trueBalcony: 2,
    topClue: '线索：生还阳台门牌 = 前四层「月」门出现次数（2 次）对应的 3 号对称门',
  },
  {
    correctDoors: ['sun', 'sun', 'moon', 'star'],
    trueBalcony: 1,
    topClue: '线索：生还阳台位于塔顶内侧对称位（2 号门，呼应 1F–2F 连贯之日）',
  },
];

function TowerOfDoorsDiagram() {
  const [puzzleIdx, setPuzzleIdx] = useState<number>(0);
  const [floor, setFloor] = useState<number>(1); // 1..5
  const [steps, setSteps] = useState<number>(0);
  const [triedWrong, setTriedWrong] = useState<Record<string, boolean>>({});
  const [topPicked, setTopPicked] = useState<number | null>(null);
  const [status, setStatus] = useState<string>(
    '你在 1F 起点，点击日/月/星门扉试探通往上一层的真门（对称侧对手同步攀登）。'
  );

  const puzzle = TOWER_PUZZLES[puzzleIdx];
  const rivalFloor = Math.min(5, 1 + Math.floor(steps / 2));

  const tryFloorDoor = (targetFloor: number, sym: DoorSymbol) => {
    if (targetFloor !== floor || floor >= 5 || topPicked !== null) return;
    const key = `${targetFloor}-${sym}`;
    const expected = puzzle.correctDoors[targetFloor - 1];
    setSteps((s) => s + 1);

    if (sym === expected) {
      const nextFloor = targetFloor + 1;
      setFloor(nextFloor);
      if (nextFloor === 5) {
        setStatus(
          `成功穿过 ${DOOR_META[sym].name} 登上 5F 塔顶！请依据线索从 4 扇大门中推开唯一生还阳台。`
        );
      } else {
        setStatus(
          `${targetFloor}F「${DOOR_META[sym].name}」通向暗梯！顺利升至 ${nextFloor}F。`
        );
      }
    } else {
      setTriedWrong((prev) => ({ ...prev, [key]: true }));
      setStatus(
        `${targetFloor}F「${DOOR_META[sym].name}」是封闭暗室，已做标记，请试探本层其余门扉。`
      );
    }
  };

  const openTopDoor = (doorIdx: number) => {
    if (floor !== 5 || topPicked !== null) return;
    setTopPicked(doorIdx);
    if (doorIdx === puzzle.trueBalcony) {
      setStatus(`推开顶层 #${doorIdx + 1} 大门——眼前是真正的生还阳台！共用 ${steps + 1} 步率先登顶胜出。`);
    } else {
      setStatus(`推开顶层 #${doorIdx + 1} 大门——门后是高空坠落陷阱！真正的生还门是 #${puzzle.trueBalcony + 1}。`);
    }
  };

  const reset = (switchPuzzle = false) => {
    if (switchPuzzle) {
      setPuzzleIdx((i) => (i + 1) % TOWER_PUZZLES.length);
    }
    setFloor(1);
    setSteps(0);
    setTriedWrong({});
    setTopPicked(null);
    setStatus('你在 1F 起点，点击日/月/星门扉试探通往上一层的真门（对称侧对手同步攀登）。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span className="font-semibold text-[var(--diagram-brass)]">你：{floor}F</span>
            <span className="font-semibold text-[var(--diagram-accent)]">对称侧对手：{rivalFloor}F</span>
            <span className="text-[var(--text-secondary)]">已试探 {steps} 步</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => reset(true)}
              className="px-2.5 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              换塔型
            </button>
            <button
              type="button"
              onClick={() => reset(false)}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重登
            </button>
          </div>
        </div>

        {/* 5 层对称高塔剖面（5F 在上，1F 在下） */}
        <div className="space-y-2 max-w-[520px] mx-auto">
          {/* 5F 顶层多门阳台 */}
          <div
            className={`rounded-xl border p-2.5 space-y-2 transition-all ${
              floor === 5
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] opacity-75'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
              <span className="font-bold text-[var(--diagram-brass)]">5F 顶层 · 唯一生还阳台</span>
              <span className="text-[var(--text-secondary)]">
                {floor === 5 ? puzzle.topClue : '登至 5F 解锁顶层 4 门'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((dIdx) => {
                const picked = topPicked === dIdx;
                const isTrue = dIdx === puzzle.trueBalcony;
                const reveal = topPicked !== null;
                return (
                  <button
                    key={dIdx}
                    type="button"
                    disabled={floor !== 5 || reveal}
                    onClick={() => openTopDoor(dIdx)}
                    className={`h-[44px] rounded-lg border flex items-center justify-center gap-1 text-[11.5px] font-semibold transition-all ${
                      reveal && isTrue
                        ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                        : reveal && picked && !isTrue
                          ? 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                          : floor === 5
                            ? 'border-[var(--diagram-brass)]/70 bg-[var(--diagram-surface)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] cursor-pointer'
                            : 'border-[var(--border-hairline)] bg-[var(--diagram-surface)] text-[var(--text-muted)] cursor-not-allowed'
                    }`}
                  >
                    {reveal && isTrue ? (
                      <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : reveal && picked ? (
                      <Skull className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <DoorClosed className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>#{dIdx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4F → 1F 每层对称剖面 */}
          {[4, 3, 2, 1].map((f) => {
            const isCurrent = floor === f;
            const passed = floor > f;
            const correctSym = puzzle.correctDoors[f - 1];
            const rivalHere = rivalFloor === f;

            return (
              <div
                key={f}
                className={`grid grid-cols-[44px_1fr_54px] items-center gap-2 rounded-lg border px-2.5 py-2 transition-all ${
                  isCurrent
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                    : passed
                      ? 'border-[var(--border-hairline)] bg-[var(--diagram-panel)]'
                      : 'border-[var(--border-hairline)] bg-[var(--diagram-panel)] opacity-60'
                }`}
              >
                <div className="text-center">
                  <span
                    className={`text-[12px] font-bold tabular-nums ${
                      isCurrent ? 'text-[var(--diagram-brass)]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {f}F
                  </span>
                </div>

                {/* 日 / 月 / 星 三扇门 */}
                <div className="grid grid-cols-3 gap-1.5">
                  {DOOR_SYMBOLS.map((sym) => {
                    const { name, Icon } = DOOR_META[sym];
                    const wrongKey = `${f}-${sym}`;
                    const isWrong = Boolean(triedWrong[wrongKey]);
                    const isRightPassed = passed && sym === correctSym;

                    return (
                      <button
                        key={sym}
                        type="button"
                        disabled={!isCurrent || isWrong}
                        onClick={() => tryFloorDoor(f, sym)}
                        className={`h-[38px] rounded-md border flex items-center justify-center gap-1 text-[11px] font-semibold transition-all ${
                          isRightPassed
                            ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                            : isWrong
                              ? 'border-[var(--diagram-accent)]/50 bg-[var(--bg-page)]/45 text-[var(--text-muted)] line-through cursor-not-allowed'
                              : isCurrent
                                ? 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] cursor-pointer'
                                : 'border-[var(--border-hairline)] bg-[var(--diagram-surface)] text-[var(--text-muted)] cursor-not-allowed'
                        }`}
                      >
                        {isRightPassed ? (
                          <DoorOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 对称侧对手高度指示 */}
                <div className="text-right text-[10.5px]">
                  {rivalHere ? (
                    <span className="px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-surface))] text-[var(--diagram-accent)] font-semibold">
                      对手
                    </span>
                  ) : (
                    <span className="text-[var(--text-muted)]">对称侧</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 状态条 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 text-[12px] font-semibold text-center border ${
            topPicked === puzzle.trueBalcony
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : topPicked !== null
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        两位选手在结构对称的五层高塔中同步向上破解日、月、星门扉；率先登顶并推开唯一生还阳台大门者获胜。
      </p>
    </div>
  );
}

// ============================================================================
// 10. kakegurui-public-goods | 公共财游戏
// ============================================================================

interface PublicScenario {
  id: string;
  label: string;
  others: Array<{ name: string; contrib: number }>;
}

const PUBLIC_SCENARIOS: PublicScenario[] = [
  {
    id: 'coop',
    label: '全员高投入（诱发搭便车）',
    others: [
      { name: '玩家甲', contrib: 10 },
      { name: '玩家乙', contrib: 9 },
      { name: '玩家丙', contrib: 8 },
      { name: '玩家丁', contrib: 10 },
    ],
  },
  {
    id: 'mixed',
    label: '混入白嫖者',
    others: [
      { name: '玩家甲', contrib: 10 },
      { name: '玩家乙', contrib: 10 },
      { name: '玩家丙', contrib: 0 },
      { name: '玩家丁', contrib: 3 },
    ],
  },
  {
    id: 'distrust',
    label: '全员猜忌缩水',
    others: [
      { name: '玩家甲', contrib: 2 },
      { name: '玩家乙', contrib: 1 },
      { name: '玩家丙', contrib: 0 },
      { name: '玩家丁', contrib: 3 },
    ],
  },
];

function PublicGoodsDiagram() {
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [myContrib, setMyContrib] = useState<number>(0);

  const scenario = PUBLIC_SCENARIOS[scenarioIdx];
  const allPlayers = [{ name: '你', contrib: myContrib, isSelf: true }].concat(
    scenario.others.map((o) => ({ ...o, isSelf: false }))
  );

  const poolTotal = allPlayers.reduce((sum, p) => sum + p.contrib, 0);
  const doubled = poolTotal * 2;
  const share = doubled / 5;

  const standings = allPlayers
    .map((p) => {
      const kept = 10 - p.contrib;
      const finalCoins = kept + share;
      return { ...p, kept, finalCoins };
    })
    .sort((a, b) => b.finalCoins - a.finalCoins);

  const myRow = standings.find((s) => s.isSelf)!;
  const myRank = standings.findIndex((s) => s.isSelf) + 1;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 场景预设 */}
        <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
          <span className="text-[var(--text-secondary)]">其余 4 人策略：</span>
          {PUBLIC_SCENARIOS.map((sc, idx) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => setScenarioIdx(idx)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                scenarioIdx === idx
                  ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)] hover:text-[var(--text-primary)]'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* 你的投币滑块 + 公共宝箱公式 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[12px] tabular-nums">
              <span className="font-semibold text-[var(--diagram-brass)] inline-flex items-center gap-1.5">
                <Coins className="w-4 h-4" aria-hidden="true" />
                你投入公箱：{myContrib} 枚
              </span>
              <span className="text-[var(--text-secondary)]">自留 {10 - myContrib} 枚</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={myContrib}
              onChange={(e) => setMyContrib(Number(e.target.value))}
              className="w-full accent-[var(--diagram-brass)] cursor-pointer"
            />
            <div className="flex justify-between text-[10.5px] text-[var(--text-muted)] tabular-nums">
              <span>0 枚（纯搭便车）</span>
              <span>5 枚</span>
              <span>10 枚（全额奉献）</span>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 flex flex-col justify-center space-y-1.5 text-[12px] tabular-nums">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">5 人公箱总额</span>
              <strong className="text-[var(--text-primary)]">{poolTotal} 枚</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">庄家翻倍（×2）</span>
              <strong className="text-[var(--diagram-brass)]">{doubled} 枚</strong>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-hairline)]">
              <span className="text-[var(--text-secondary)]">每人平分红利（÷5）</span>
              <strong className="text-[14px] text-[var(--diagram-brass)]">
                +{share.toFixed(1)} 枚
              </strong>
            </div>
          </div>
        </div>

        {/* 5 人结余实时排名 */}
        <div className="space-y-1.5">
          {standings.map((p, idx) => (
            <div
              key={p.name}
              className={`grid grid-cols-[36px_64px_1fr_auto] items-center gap-2 rounded-lg border px-3 py-2 text-[12px] tabular-nums ${
                p.isSelf
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                  : 'border-[var(--border-hairline)] bg-[var(--diagram-panel)]'
              }`}
            >
              <span
                className={`font-bold ${
                  idx === 0 ? 'text-[var(--diagram-brass)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                #{idx + 1}
              </span>
              <span className="font-semibold text-[var(--text-primary)]">{p.name}</span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                投 {p.contrib} · 留 {p.kept} + 分 {share.toFixed(1)}
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                {p.finalCoins.toFixed(1)} 枚
              </span>
            </div>
          ))}
        </div>

        {/* 搭便车洞见条 */}
        <div className="rounded-lg px-3.5 py-2 text-[12px] font-medium text-center border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]">
          你目前排第 <strong className="text-[var(--diagram-brass)]">{myRank}</strong> 名（结余{' '}
          <strong className="tabular-nums">{myRow.finalCoins.toFixed(1)}</strong> 枚）：
          {myContrib === 0
            ? ' 零投入照领公箱红利，单轮个人排名最大化，却拉低了全员总收益。'
            : myContrib === 10
              ? ' 全额投入把总蛋糕做到最大，但若有人零投入搭便车，你反而容易垫底。'
              : ' 每少投 1 枚，个人净赚 +0.6 枚，却让其余四人合计少分 1.6 枚。'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        公箱翻倍后按人头平分，不投币也能领红利；拖动滑块即可直观看见集体合作与个人「搭便车」的残酷张力。
      </p>
    </div>
  );
}

// ============================================================================
// 11. kakegurui-war | 百票战争
// ============================================================================

interface WarCard {
  id: number;
  suit: Suit;
  rank: number; // 10..14
}

const WAR_RANKS = [10, 11, 12, 13, 14] as const;

function buildWarHands(): {
  playerHand: WarCard[];
  rivalDeck: WarCard[];
  playerReserve: WarCard[];
} {
  const suits: Suit[] = ['♠', '♥', '♣', '♦'];
  const full: WarCard[] = [];
  let id = 0;
  WAR_RANKS.forEach((rank) => {
    suits.forEach((suit) => {
      full.push({ id, suit, rank });
      id += 1;
    });
  });
  const shuffled = shuffleArray(full);
  return {
    playerHand: shuffled.slice(0, 4),
    playerReserve: shuffled.slice(4, 10),
    rivalDeck: shuffled.slice(10, 20),
  };
}

function WarDiagram() {
  const [hands, setHands] = useState(() => buildWarHands());
  const [playedCards, setPlayedCards] = useState<WarCard[]>([]);
  const [pot, setPot] = useState<number>(4);
  const [isWar, setIsWar] = useState<boolean>(false);
  const [playerVotes, setPlayerVotes] = useState<number>(20);
  const [rivalVotes, setRivalVotes] = useState<number>(20);
  const [lastDuel, setLastDuel] = useState<{
    p: WarCard;
    r: WarCard;
    result: 'win' | 'lose' | 'war';
    potWon: number;
  } | null>(null);

  const reset = () => {
    setHands(buildWarHands());
    setPlayedCards([]);
    setPot(4);
    setIsWar(false);
    setPlayerVotes(20);
    setRivalVotes(20);
    setLastDuel(null);
  };

  const playCard = (idx: number, forceTie = false) => {
    if (hands.playerHand.length === 0 || hands.rivalDeck.length === 0) return;

    const pCard = hands.playerHand[idx];
    const nextRivalDeck = [...hands.rivalDeck];

    // 若点击「模拟平局再战」且对手库里有同点数，则抽出同点数演示 WAR
    let rIndex = 0;
    if (forceTie) {
      const sameIdx = nextRivalDeck.findIndex((c) => c.rank === pCard.rank);
      if (sameIdx !== -1) rIndex = sameIdx;
    }
    const [rCard] = nextRivalDeck.splice(rIndex, 1);

    const nextPlayerHand = [...hands.playerHand];
    const nextReserve = [...hands.playerReserve];
    const drawn = nextReserve.shift();
    if (drawn) {
      nextPlayerHand[idx] = drawn;
    } else {
      nextPlayerHand.splice(idx, 1);
    }

    setHands({
      playerHand: nextPlayerHand,
      playerReserve: nextReserve,
      rivalDeck: nextRivalDeck,
    });
    setPlayedCards((prev) => [...prev, pCard, rCard]);

    if (pCard.rank === rCard.rank) {
      // 平局触发加注再战
      const addedPot = pot + 6;
      setPot(addedPot);
      setIsWar(true);
      setLastDuel({ p: pCard, r: rCard, result: 'war', potWon: addedPot });
      return;
    }

    const stake = pot;
    if (pCard.rank > rCard.rank) {
      setPlayerVotes((v) => v + stake / 2);
      setRivalVotes((v) => v - stake / 2);
      setLastDuel({ p: pCard, r: rCard, result: 'win', potWon: stake });
    } else {
      setPlayerVotes((v) => v - stake / 2);
      setRivalVotes((v) => v + stake / 2);
      setLastDuel({ p: pCard, r: rCard, result: 'lose', potWon: stake });
    }
    setPot(4);
    setIsWar(false);
  };

  const canForceTie = hands.playerHand.some((pc) =>
    hands.rivalDeck.some((rc) => rc.rank === pc.rank)
  );

  const triggerTieDemo = () => {
    const idx = hands.playerHand.findIndex((pc) =>
      hands.rivalDeck.some((rc) => rc.rank === pc.rank)
    );
    if (idx !== -1) playCard(idx, true);
  };

  const outOfCards = hands.playerHand.length === 0 || hands.rivalDeck.length === 0;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span className="font-semibold text-[var(--diagram-brass)]">你：{playerVotes} 票</span>
            <span className="font-semibold text-[var(--diagram-accent)]">对手：{rivalVotes} 票</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                isWar
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
              }`}
            >
              当前彩池：{pot} 票{isWar ? '（平局加注中！）' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canForceTie && !outOfCards && (
              <button
                type="button"
                onClick={triggerTieDemo}
                className="px-2.5 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-accent)]/60 text-[11px] font-semibold text-[var(--diagram-accent)] cursor-pointer"
              >
                触发平局再战
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重新洗牌
            </button>
          </div>
        </div>

        {/* 中央亮牌交锋 + 你的手牌 */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--text-primary)]">
                挑选 1 张手牌翻开比大小
              </span>
              <span className="text-[var(--text-secondary)] tabular-nums">
                余牌 {hands.playerHand.length + hands.playerReserve.length} 张
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {hands.playerHand.map((card, idx) => (
                <button
                  key={card.id}
                  type="button"
                  disabled={outOfCards}
                  onClick={() => playCard(idx)}
                  className="h-[68px] rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] hover:-translate-y-0.5 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all select-none"
                >
                  <span
                    className={`text-[18px] font-bold leading-none ${
                      isRedSuit(card.suit)
                        ? 'text-[var(--diagram-accent)]'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {card.suit}
                    {RANK_LABELS[card.rank]}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">点击出战</span>
                </button>
              ))}
              {outOfCards && (
                <button
                  type="button"
                  onClick={reset}
                  className="col-span-4 py-3 rounded-xl bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12.5px] font-semibold cursor-pointer"
                >
                  本轮 20 张牌已全部打完 · 点击重新开局
                </button>
              )}
            </div>
          </div>

          {/* 交锋亮牌展示 */}
          <div className="flex items-center justify-center gap-3 rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-4 py-3">
            <div className="text-center space-y-1">
              <div className="text-[10.5px] text-[var(--diagram-brass)] font-semibold">你出</div>
              <div className="w-[54px] h-[68px] rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] flex items-center justify-center font-bold text-[17px]">
                {lastDuel ? (
                  <span
                    className={
                      isRedSuit(lastDuel.p.suit)
                        ? 'text-[var(--diagram-accent)]'
                        : 'text-[var(--text-primary)]'
                    }
                  >
                    {lastDuel.p.suit}
                    {RANK_LABELS[lastDuel.p.rank]}
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)]">?</span>
                )}
              </div>
            </div>

            <Swords className="w-5 h-5 text-[var(--text-secondary)]" aria-hidden="true" />

            <div className="text-center space-y-1">
              <div className="text-[10.5px] text-[var(--diagram-accent)] font-semibold">对手</div>
              <div className="w-[54px] h-[68px] rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] flex items-center justify-center font-bold text-[17px]">
                {lastDuel ? (
                  <span
                    className={
                      isRedSuit(lastDuel.r.suit)
                        ? 'text-[var(--diagram-accent)]'
                        : 'text-[var(--text-primary)]'
                    }
                  >
                    {lastDuel.r.suit}
                    {RANK_LABELS[lastDuel.r.rank]}
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)]">?</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 结算横幅 */}
        <div
          className={`rounded-lg px-3.5 py-2 text-[12px] font-semibold text-center border ${
            lastDuel?.result === 'war'
              ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : lastDuel?.result === 'win'
                ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : lastDuel?.result === 'lose'
                  ? 'border-[var(--diagram-accent)]/50 bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {!lastDuel
            ? '选定 1 张牌与对手同时亮牌比大小（10 < J < Q < K < A）。'
            : lastDuel.result === 'war'
              ? `同为 ${RANK_LABELS[lastDuel.p.rank]}！触发「平局加注再战」，彩池飙升至 ${lastDuel.potWon} 票，下一张牌赢家通吃！`
              : lastDuel.result === 'win'
                ? `${RANK_LABELS[lastDuel.p.rank]} 压制 ${RANK_LABELS[lastDuel.r.rank]}！你通吃桌面 ${lastDuel.potWon} 票彩池。`
                : `${RANK_LABELS[lastDuel.p.rank]} 不敌 ${RANK_LABELS[lastDuel.r.rank]}！对手收走桌面 ${lastDuel.potWon} 票彩池。`}
        </div>

        {/* 已出牌库公开计数 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>已公开弃牌计数（共 20 张牌库，各点数 4 张）</span>
            <span className="tabular-nums">已亮 {playedCards.length} / 20</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {WAR_RANKS.map((rank) => {
              const count = playedCards.filter((c) => c.rank === rank).length;
              const left = 4 - count;
              return (
                <div
                  key={rank}
                  className={`rounded-md border px-2 py-1 text-center tabular-nums ${
                    left === 0
                      ? 'border-[var(--border-hairline)] bg-[var(--bg-page)]/45 text-[var(--text-muted)] opacity-55'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="text-[12px] font-bold">{RANK_LABELS[rank]}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    已出 {count}/4
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        单张翻牌比点数大小，同点数会触发加注再战累积彩池；随着弃牌公开计数推进，剩余大牌分布愈发透明。
      </p>
    </div>
  );
}

// ============================================================================
// 12. kakegurui-auction | 百票拍卖
// ============================================================================

interface AuctionOpponentSet {
  id: string;
  label: string;
  hint: string;
  rivalA: { name: string; bid: number };
  rivalB: { name: string; bid: number };
}

const AUCTION_SCENARIOS: AuctionOpponentSet[] = [
  {
    id: 'overheated',
    label: '竞价狂热局',
    hint: '传闻某阵营急需百票翻盘，疑似准备不计成本抬价。',
    rivalA: { name: '激进阵营 A', bid: 170 },
    rivalB: { name: '观望阵营 B', bid: 95 },
  },
  {
    id: 'rational',
    label: '理性估价局',
    hint: '各方资金池均偏紧，估价集中在 0.9–1.2 亿区间。',
    rivalA: { name: '稳健阵营 A', bid: 110 },
    rivalB: { name: '稳健阵营 B', bid: 90 },
  },
  {
    id: 'bluff',
    label: '虚张声势局',
    hint: '对手嘴上喊得凶，实际可用现金流可能远低于 1 亿。',
    rivalA: { name: '强硬阵营 A', bid: 75 },
    rivalB: { name: '保守阵营 B', bid: 65 },
  },
];

function formatYi(million: number): string {
  return `${(million / 100).toFixed(2)} 亿`;
}

function AuctionDiagram() {
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [myBid, setMyBid] = useState<number>(105); // 单位：百万（105 = 1.05 亿）
  const [opened, setOpened] = useState<boolean>(false);

  const cashLimit = 200; // 2.00 亿现金池
  const fairValue = 100; // 1.00 亿合理估值参考
  const scenario = AUCTION_SCENARIOS[scenarioIdx];

  const switchScenario = (idx: number) => {
    setScenarioIdx(idx);
    setOpened(false);
  };

  const bids = [
    { name: '你的暗标', bid: myBid, isSelf: true },
    { name: scenario.rivalA.name, bid: scenario.rivalA.bid, isSelf: false },
    { name: scenario.rivalB.name, bid: scenario.rivalB.bid, isSelf: false },
  ].sort((a, b) => b.bid - a.bid);

  const winner = bids[0];
  const youWin = winner.isSelf;
  const remainingCashIfWin = cashLimit - myBid;
  const overpaid = youWin && myBid >= 150;
  const smartPass = !youWin && winner.bid >= 150 && myBid <= 120;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：标的 + 场况切换 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--diagram-brass)]">
            <Gavel className="w-4 h-4" aria-hidden="true" />
            <span>标的：100 张选举选票（参考估值 1.00 亿）</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {AUCTION_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => switchScenario(idx)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                  scenarioIdx === idx
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* 情报提示 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--border-hairline)] px-3 py-2 text-[11.5px] text-[var(--text-secondary)]">
          场内风声：{scenario.hint}
        </div>

        {/* 出价滑块与现金流预览 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 tabular-nums">
            <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">
              你的暗标出价：
              <strong className="text-[18px] text-[var(--diagram-brass)] ml-1">
                {formatYi(myBid)}
              </strong>
            </span>
            <span className="text-[11.5px] text-[var(--text-secondary)]">
              单票成本 {myBid} 万 · 中标后余款{' '}
              <strong
                className={
                  remainingCashIfWin <= 50
                    ? 'text-[var(--diagram-accent)]'
                    : 'text-[var(--text-primary)]'
                }
              >
                {formatYi(remainingCashIfWin)}
              </strong>
              （总现金 {formatYi(cashLimit)}）
            </span>
          </div>

          <input
            type="range"
            min={20}
            max={200}
            step={5}
            value={myBid}
            onChange={(e) => {
              setMyBid(Number(e.target.value));
              setOpened(false);
            }}
            className="w-full accent-[var(--diagram-brass)] cursor-pointer"
          />

          <div className="flex justify-between text-[10.5px] text-[var(--text-muted)] tabular-nums">
            <span>0.20 亿（试探放手）</span>
            <span>1.00 亿（合理估值）</span>
            <span>2.00 亿（梭哈清仓）</span>
          </div>

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setOpened(true)}
              className="px-5 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
            >
              投入暗标并开标
            </button>
          </div>
        </div>

        {/* 开标对比栏 */}
        {opened && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {bids.map((item, idx) => {
                const isWinner = idx === 0;
                const pct = Math.min(100, Math.round((item.bid / cashLimit) * 100));
                return (
                  <div
                    key={item.name}
                    className={`rounded-lg border p-2.5 space-y-1.5 tabular-nums ${
                      isWinner
                        ? item.isSelf
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                          : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
                        : 'border-[var(--border-hairline)] bg-[var(--diagram-panel)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="font-semibold text-[var(--text-primary)]">{item.name}</span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-[var(--diagram-brass)]">
                          <Check className="w-3 h-3" aria-hidden="true" />
                          中标
                        </span>
                      )}
                    </div>
                    <div className="text-[16px] font-bold text-[var(--text-primary)]">
                      {formatYi(item.bid)}
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--diagram-surface)] overflow-hidden">
                      <div
                        className={`h-full ${
                          item.bid >= 150
                            ? 'bg-[var(--diagram-accent)]'
                            : 'bg-[var(--diagram-brass)]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`rounded-lg px-3.5 py-2.5 text-[12px] font-semibold text-center border ${
                overpaid
                  ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                  : smartPass || (youWin && myBid <= fairValue + 20)
                    ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
              }`}
            >
              {overpaid
                ? `你以 ${formatYi(myBid)} 高价强拿 100 票，但现金流仅剩 ${formatYi(remainingCashIfWin)}，陷入后续乏力陷阱！`
                : smartPass
                  ? `理性放手！你完整保住 ${formatYi(cashLimit)} 现金流，成功诱使${winner.name}以 ${formatYi(winner.bid)} 溢价接盘耗尽弹药。`
                  : youWin
                    ? `精准拿票！你以 ${formatYi(myBid)} 合理成本拿下 100 票，仍保留 ${formatYi(remainingCashIfWin)} 现金流。`
                    : `${winner.name}以 ${formatYi(winner.bid)} 拿走百票；你的资金池完好无损，可静待下一拍。`}
            </div>
          </div>
        )}
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        百票暗标竞拍既拼出价也拼现金流耐力：高价强拿可能耗尽弹药，理性放手则能让对手在溢价接盘中失血。
      </p>
    </div>
  );
}

// ============================================================================
// 统一导出表（精确覆盖全部 12 场《狂赌之渊》赌局）
// ============================================================================

export const KAKEGURUI_DIAGRAMS: Record<string, ComponentType> = {
  'kakegurui-vote-rps': VoteRpsDiagram,
  'kakegurui-double-concentration': DoubleConcentrationDiagram,
  'kakegurui-life-or-death': LifeOrDeathDiagram,
  'kakegurui-indian-poker': IndianPokerDiagram,
  'kakegurui-esp-game': EspGameDiagram,
  'kakegurui-choice-poker': ChoicePokerDiagram,
  'kakegurui-finger-guillotine': FingerGuillotineDiagram,
  'kakegurui-nim-type-zero': NimTypeZeroDiagram,
  'kakegurui-tower-of-doors': TowerOfDoorsDiagram,
  'kakegurui-public-goods': PublicGoodsDiagram,
  'kakegurui-war': WarDiagram,
  'kakegurui-auction': AuctionDiagram,
};
