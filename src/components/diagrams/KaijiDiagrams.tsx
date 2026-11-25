import { useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Banknote,
  CheckCircle2,
  Coins,
  Dices,
  DoorOpen,
  EyeOff,
  Footprints,
  Hand,
  HandFist,
  Lightbulb,
  RotateCcw,
  Scissors,
  Shield,
  Skull,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Wind,
  Zap,
} from 'lucide-react';

/* ============================================================================
 * 1. restricted-rps · 限定猜拳
 * ========================================================================== */

type RpsMove = 'rock' | 'scissors' | 'paper';

const RPS_META: Record<
  RpsMove,
  { label: string; Icon: typeof HandFist }
> = {
  rock: { label: '石头', Icon: HandFist },
  scissors: { label: '剪刀', Icon: Scissors },
  paper: { label: '布', Icon: Hand },
};

const RPS_MOVES: RpsMove[] = ['rock', 'scissors', 'paper'];

function judgeRps(mine: RpsMove, opp: RpsMove): 'win' | 'lose' | 'tie' {
  if (mine === opp) return 'tie';
  if (
    (mine === 'rock' && opp === 'scissors') ||
    (mine === 'scissors' && opp === 'paper') ||
    (mine === 'paper' && opp === 'rock')
  ) {
    return 'win';
  }
  return 'lose';
}

function RestrictedRpsDiagram() {
  const [counts, setCounts] = useState<Record<RpsMove, number>>({
    rock: 4,
    scissors: 4,
    paper: 4,
  });
  const [stars, setStars] = useState<number>(3);
  const [myPick, setMyPick] = useState<RpsMove>('rock');
  const [oppPick, setOppPick] = useState<RpsMove>('scissors');
  const [lastLog, setLastLog] = useState<{
    outcome: 'win' | 'lose' | 'tie' | 'idle';
    text: string;
  }>({
    outcome: 'idle',
    text: '选定己方与对手出牌后点「出牌交锋」，出过的牌立即作废',
  });

  const remainingCards = counts.rock + counts.scissors + counts.paper;
  const isBankrupt = stars <= 0;
  const isCleared = remainingCards === 0 && stars >= 3;
  const isFailedEmpty = remainingCards === 0 && stars < 3;
  const isEnded = isBankrupt || isCleared || isFailedEmpty;

  const handleClash = () => {
    if (isEnded || counts[myPick] <= 0) return;
    const outcome = judgeRps(myPick, oppPick);
    const nextCounts: Record<RpsMove, number> = {
      ...counts,
      [myPick]: counts[myPick] - 1,
    };
    const nextStars =
      outcome === 'win' ? stars + 1 : outcome === 'lose' ? Math.max(0, stars - 1) : stars;

    setCounts(nextCounts);
    setStars(nextStars);

    const myName = RPS_META[myPick].label;
    const oppName = RPS_META[oppPick].label;
    if (outcome === 'win') {
      setLastLog({
        outcome: 'win',
        text: `${myName}胜${oppName} · 销掉 1 张${myName}，夺得 1 颗生存之星`,
      });
    } else if (outcome === 'lose') {
      setLastLog({
        outcome: 'lose',
        text: `${myName}负${oppName} · 销掉 1 张${myName}，失去 1 颗生存之星`,
      });
    } else {
      setLastLog({
        outcome: 'tie',
        text: `双方同出${myName} · 平局销牌，星数不变`,
      });
    }

    if (nextCounts[myPick] === 0) {
      const fallback = RPS_MOVES.find((m) => nextCounts[m] > 0);
      if (fallback) setMyPick(fallback);
    }
  };

  const reset = () => {
    setCounts({ rock: 4, scissors: 4, paper: 4 });
    setStars(3);
    setMyPick('rock');
    setOppPick('scissors');
    setLastLog({
      outcome: 'idle',
      text: '选定己方与对手出牌后点「出牌交锋」，出过的牌立即作废',
    });
  };

  const starSlots = Math.max(3, stars);

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：生存之星与余牌数 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1" aria-label={`当前 ${stars} 颗星`}>
              {Array.from({ length: starSlots }).map((_, idx) => {
                const filled = idx < stars;
                return (
                  <Star
                    key={idx}
                    className={`w-4 h-4 transition-all ${
                      filled
                        ? 'text-[var(--diagram-brass)] fill-[var(--diagram-brass)]'
                        : 'text-[var(--text-muted)] opacity-45'
                    }`}
                    aria-hidden="true"
                  />
                );
              })}
              <span className="ml-1 font-semibold text-[var(--text-primary)] tabular-nums">
                {stars} 颗星
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--text-secondary)] tabular-nums">
              余牌 {remainingCards} / 12
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新发牌
          </button>
        </div>

        {/* 主交互区：己方 12 张牌堆 vs 对手出牌 */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* 己方手牌 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-brass)]">己方手牌（各 4 张）</span>
              <span className="text-[var(--text-secondary)] tabular-nums">需全部清空</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {RPS_MOVES.map((move) => {
                const { label, Icon } = RPS_META[move];
                const left = counts[move];
                const disabled = left === 0 || isEnded;
                const selected = myPick === move && left > 0;
                return (
                  <button
                    key={move}
                    type="button"
                    disabled={disabled}
                    aria-pressed={selected}
                    onClick={() => setMyPick(move)}
                    className={`rounded-xl border p-2.5 flex flex-col items-center gap-1.5 transition-all ${
                      disabled
                        ? 'border-[var(--border-hairline)] bg-[var(--bg-page)]/40 text-[var(--text-muted)] opacity-45 cursor-not-allowed'
                        : selected
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--text-primary)] ring-2 ring-[var(--text-primary)] -translate-y-0.5 cursor-pointer'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="text-[12px] font-semibold">{label}</span>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3].map((pip) => (
                        <span
                          key={pip}
                          className={`w-2 h-2.5 rounded-[2px] border ${
                            pip < left
                              ? 'bg-[var(--diagram-brass)] border-[var(--diagram-brass)]'
                              : 'bg-transparent border-[var(--border-hairline)] opacity-40'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 中央交锋区 */}
          <div className="flex flex-col items-center justify-center gap-2.5 py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))] flex items-center justify-center text-[var(--diagram-brass)]">
                {(() => {
                  const Icon = RPS_META[myPick].Icon;
                  return <Icon className="w-5 h-5" aria-hidden="true" />;
                })()}
              </div>
              <span className="font-mincho text-xs text-[var(--text-secondary)] select-none">VS</span>
              <div className="w-12 h-12 rounded-xl border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] flex items-center justify-center text-[var(--diagram-accent)]">
                {(() => {
                  const Icon = RPS_META[oppPick].Icon;
                  return <Icon className="w-5 h-5" aria-hidden="true" />;
                })()}
              </div>
            </div>

            <button
              type="button"
              disabled={isEnded || counts[myPick] === 0}
              onClick={handleClash}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-opacity ${
                isEnded || counts[myPick] === 0
                  ? 'bg-[var(--diagram-panel)] text-[var(--text-muted)] border border-[var(--border-hairline)] cursor-not-allowed'
                  : 'bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90 cursor-pointer'
              }`}
            >
              出牌交锋
            </button>
          </div>

          {/* 对手出牌选择 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-accent)]">对手本手出牌</span>
              <span className="text-[var(--text-secondary)]">自由配对单挑</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {RPS_MOVES.map((move) => {
                const { label, Icon } = RPS_META[move];
                const selected = oppPick === move;
                return (
                  <button
                    key={move}
                    type="button"
                    disabled={isEnded}
                    aria-pressed={selected}
                    onClick={() => setOppPick(move)}
                    className={`rounded-xl border p-2.5 flex flex-col items-center gap-1.5 transition-all ${
                      isEnded
                        ? 'border-[var(--border-hairline)] bg-[var(--bg-page)]/40 text-[var(--text-muted)] opacity-45 cursor-not-allowed'
                        : selected
                          ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] ring-2 ring-[var(--text-primary)] -translate-y-0.5 cursor-pointer'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="text-[12px] font-semibold">{label}</span>
                    <span className="text-[10.5px] text-[var(--text-muted)]">指定</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 实时过关条件判定栏 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
            isCleared
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : isBankrupt || isFailedEmpty
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          <span className="font-semibold">
            {isCleared
              ? `过关！手牌清空且保有 ${stars} 颗星${stars > 3 ? `（多余 ${stars - 3} 颗可折现）` : ''}`
              : isBankrupt
                ? '淘汰！生存之星归零，立刻出局'
                : isFailedEmpty
                  ? `淘汰！手牌已清空，但仅剩 ${stars} 颗星（不足 3 颗）`
                  : lastLog.text}
          </span>
          <div className="flex items-center gap-2 shrink-0 text-[11px] tabular-nums">
            <span
              className={`px-2 py-0.5 rounded-full border ${
                remainingCards === 0
                  ? 'border-[var(--diagram-brass)] text-[var(--diagram-brass)]'
                  : 'border-[var(--border-hairline)] text-[var(--text-secondary)]'
              }`}
            >
              清牌 {12 - remainingCards}/12
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border ${
                stars >= 3
                  ? 'border-[var(--diagram-brass)] text-[var(--diagram-brass)]'
                  : 'border-[var(--diagram-accent)] text-[var(--diagram-accent)]'
              }`}
            >
              星数 {stars}/3+
            </span>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        单靠凑齐 3 颗星不够，还必须把 12 张牌彻底打光——平局虽不丢星，却是消掉多余手牌的关键手段。
      </p>
    </div>
  );
}

/* ============================================================================
 * 2. kaiji-steel-beam · 高空走铁骨
 * ========================================================================== */

type BeamStage = 'race' | 'brave';

const BEAM_TOTAL_STEPS = 6;

function SteelBeamDiagram() {
  const [stage, setStage] = useState<BeamStage>('brave');
  const [step, setStep] = useState<number>(2);
  const [windowOpened, setWindowOpened] = useState<boolean>(false);
  const [rivalPushed, setRivalPushed] = useState<boolean>(false);
  const [shockAlert, setShockAlert] = useState<boolean>(false);

  const isBrave = stage === 'brave';
  const atWindow = step >= BEAM_TOTAL_STEPS;
  const distanceMeters = Math.round((step / BEAM_TOTAL_STEPS) * (isBrave ? 74 : 25));

  const switchStage = (next: BeamStage) => {
    setStage(next);
    setStep(1);
    setWindowOpened(false);
    setRivalPushed(false);
    setShockAlert(false);
  };

  const handleStepForward = () => {
    if (windowOpened) return;
    setShockAlert(false);
    if (step < BEAM_TOTAL_STEPS) {
      setStep((prev) => prev + 1);
    } else {
      setWindowOpened(true);
    }
  };

  const handleSecondaryAction = () => {
    if (windowOpened) return;
    if (isBrave) {
      setShockAlert(true);
    } else {
      setRivalPushed(true);
    }
  };

  const reset = () => {
    setStep(0);
    setWindowOpened(false);
    setRivalPushed(false);
    setShockAlert(false);
  };

  // Walker x position on the beam (from x=104 to x=444)
  const walkerX = 104 + (step / BEAM_TOTAL_STEPS) * 340;
  const rivalX = Math.min(430, walkerX + (rivalPushed ? 34 : 26));

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：两段赛程切换 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-0.5">
            <button
              type="button"
              aria-pressed={!isBrave}
              onClick={() => switchStage('race')}
              className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold transition-colors cursor-pointer ${
                !isBrave
                  ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              第一段 · 人类赛马
            </button>
            <button
              type="button"
              aria-pressed={isBrave}
              onClick={() => switchStage('brave')}
              className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold transition-colors cursor-pointer ${
                isBrave
                  ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              第二段 · 74 米高压铁骨
            </button>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            回到起点
          </button>
        </div>

        {/* 高空两楼间狭窄铁骨纵剖面 SVG */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-2.5 sm:p-3 overflow-hidden">
          <svg
            viewBox="0 0 560 196"
            className="w-full h-auto block select-none"
            role="img"
            aria-label={isBrave ? '74 米高空通电铁骨剖面图' : '人类赛马高空铁骨剖面图'}
          >
            {/* 强风线 */}
            <g stroke="var(--text-muted)" strokeOpacity={0.35} strokeWidth="1.2" fill="none">
              <path d="M165 30 Q 210 22, 255 30" strokeDasharray="4 4" />
              <path d="M290 46 Q 340 38, 392 46" strokeDasharray="5 4" />
              <path d="M210 156 Q 275 148, 340 156" strokeDasharray="3 5" />
            </g>

            {/* 左侧摩天大楼 */}
            <rect
              x="16"
              y="56"
              width="78"
              height="132"
              rx="4"
              fill="var(--diagram-surface)"
              stroke="var(--diagram-border)"
              strokeWidth="1.5"
            />
            {[74, 98, 122, 146].map((wy) => (
              <g key={wy} fill="var(--diagram-border)" fillOpacity={0.45}>
                <rect x="28" y={wy} width="16" height="12" rx="1.5" />
                <rect x="52" y={wy} width="16" height="12" rx="1.5" />
              </g>
            ))}
            <text
              x="55"
              y="46"
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize="11"
              fontWeight="600"
            >
              起点平台
            </text>

            {/* 右侧对岸大楼 + 玻璃窗口 */}
            <rect
              x="466"
              y="40"
              width="78"
              height="148"
              rx="4"
              fill="var(--diagram-surface)"
              stroke="var(--diagram-border)"
              strokeWidth="1.5"
            />
            {/* 目标窗口 */}
            <rect
              x="466"
              y="62"
              width="24"
              height="48"
              rx="2"
              fill={windowOpened ? 'var(--diagram-brass)' : 'var(--bg-page)'}
              fillOpacity={windowOpened ? 0.25 : 0.7}
              stroke={windowOpened ? 'var(--diagram-brass)' : 'var(--text-secondary)'}
              strokeWidth="1.8"
            />
            {windowOpened && (
              <line
                x1="466"
                y1="62"
                x2="486"
                y2="52"
                stroke="var(--diagram-brass)"
                strokeWidth="2"
              />
            )}
            <text
              x="507"
              y="84"
              textAnchor="middle"
              fill="var(--diagram-brass)"
              fontSize="10.5"
              fontWeight="700"
            >
              {isBrave ? '2000万' : '兑换券'}
            </text>
            <text
              x="507"
              y="99"
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize="9.5"
            >
              {windowOpened ? '已推开' : '推窗兑现'}
            </text>

            {/* 高度标尺 */}
            <line
              x1="126"
              y1="116"
              x2="126"
              y2="184"
              stroke="var(--text-muted)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x="134"
              y="162"
              fill={isBrave ? 'var(--diagram-accent)' : 'var(--text-secondary)'}
              fontSize="11"
              fontWeight="700"
            >
              {isBrave ? '高空 74m（22 层）· 无安全绳' : '高空 15m · 多梁竞速（可推挤）'}
            </text>

            {/* 狭窄铁骨梁 */}
            <rect
              x="94"
              y="108"
              width="372"
              height="8"
              rx="1.5"
              fill={isBrave ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
              fillOpacity={isBrave ? 0.28 : 0.32}
              stroke={isBrave ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
              strokeWidth="1.6"
            />

            {/* 第二段：高压电流脉冲 */}
            {isBrave && (
              <g
                stroke="var(--diagram-accent)"
                strokeWidth="1.5"
                fill="none"
                strokeOpacity={shockAlert ? 1 : 0.72}
              >
                <polyline points="140,108 148,101 154,108 162,100 168,108" />
                <polyline points="248,108 256,100 262,108 270,101 276,108" />
                <polyline points="356,108 364,101 370,108 378,100 384,108" />
              </g>
            )}

            {/* 步进刻度点 */}
            {Array.from({ length: BEAM_TOTAL_STEPS + 1 }).map((_, idx) => {
              const tx = 104 + (idx / BEAM_TOTAL_STEPS) * 340;
              const passed = idx <= step;
              return (
                <circle
                  key={idx}
                  cx={tx}
                  cy="112"
                  r="2.5"
                  fill={passed ? 'var(--text-primary)' : 'var(--diagram-border)'}
                />
              );
            })}

            {/* 第一段：同梁对手剪影 */}
            {!isBrave && (
              <g
                transform={
                  rivalPushed
                    ? `translate(${rivalX}, 148) rotate(35)`
                    : `translate(${rivalX}, 84)`
                }
                opacity={rivalPushed ? 0.55 : 0.85}
              >
                <circle cx="0" cy="0" r="5" fill="var(--text-secondary)" />
                <line x1="0" y1="5" x2="0" y2="17" stroke="var(--text-secondary)" strokeWidth="2.4" />
                <line x1="0" y1="17" x2="-4" y2="24" stroke="var(--text-secondary)" strokeWidth="2" />
                <line x1="0" y1="17" x2="4" y2="24" stroke="var(--text-secondary)" strokeWidth="2" />
              </g>
            )}

            {/* 参赛者剪影（赤脚沿铁骨前进） */}
            <g transform={`translate(${windowOpened ? 480 : walkerX}, 82)`}>
              {shockAlert && (
                <circle
                  cx="0"
                  cy="12"
                  r="16"
                  fill="var(--diagram-accent)"
                  fillOpacity={0.22}
                  stroke="var(--diagram-accent)"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
              )}
              <circle cx="0" cy="0" r="5.5" fill="var(--diagram-brass)" />
              <line x1="0" y1="6" x2="0" y2="18" stroke="var(--diagram-brass)" strokeWidth="2.6" />
              {/* 张开双臂保持平衡 */}
              <line x1="-10" y1="10" x2="10" y2="10" stroke="var(--diagram-brass)" strokeWidth="2" />
              <line x1="0" y1="18" x2="-4" y2="26" stroke="var(--diagram-brass)" strokeWidth="2.2" />
              <line x1="0" y1="18" x2="4" y2="26" stroke="var(--diagram-brass)" strokeWidth="2.2" />
            </g>
          </svg>
        </div>

        {/* 操作按钮组 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              已行进 {distanceMeters} / {isBrave ? 74 : 25} 米
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--text-secondary)]">
              {isBrave ? (
                <>
                  <Zap className="w-3 h-3 text-[var(--diagram-accent)]" aria-hidden="true" />
                  铁骨通电 · 禁手抱禁拉扯
                </>
              ) : (
                <>
                  <Wind className="w-3 h-3 text-[var(--diagram-brass)]" aria-hidden="true" />
                  允许推挤 · 前两名拿兑换券
                </>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={windowOpened}
              onClick={handleSecondaryAction}
              className={`px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-colors ${
                windowOpened
                  ? 'border-[var(--border-hairline)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
              }`}
            >
              {isBrave ? '试探手抱铁骨' : rivalPushed ? '已推开前方对手' : '推挤前方对手'}
            </button>
            <button
              type="button"
              disabled={windowOpened}
              onClick={handleStepForward}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-opacity ${
                windowOpened
                  ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] opacity-75 cursor-default'
                  : atWindow
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] hover:opacity-90 cursor-pointer'
                    : 'bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90 cursor-pointer'
              }`}
            >
              {windowOpened ? (
                <>
                  <Banknote className="w-3.5 h-3.5" aria-hidden="true" />
                  已兑现支票
                </>
              ) : atWindow ? (
                <>
                  <DoorOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  推开对岸窗口
                </>
              ) : (
                <>
                  <Footprints className="w-3.5 h-3.5" aria-hidden="true" />
                  向前迈步
                </>
              )}
            </button>
          </div>
        </div>

        {/* 实时反馈条 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] font-medium ${
            windowOpened
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : shockAlert
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {windowOpened
            ? isBrave
              ? '亲手推开对岸大楼玻璃窗踏入室内！2000 万日元现金支票正式生效。'
              : '冲线抵达对岸平台！拿到进入第二段「勇者之路」的现金兑换券。'
            : shockAlert
              ? '铁骨表面通有微弱高压电流！一旦俯身抱梁就会触电失衡，只能赤脚直立迈步。'
              : !isBrave && rivalPushed
                ? '第一段规则允许互相推挤，扫清前方阻碍后继续冲向对岸窗口。'
                : atWindow
                  ? '已走到铁骨尽头！必须亲手推开对岸窗口踏入室内，支票才会生效。'
                  : '点击「向前迈步」沿狭窄铁骨推进，体会高空无护具步行的步步惊心。'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        第一段允许推挤抢前两名，第二段升至 74 米且通电禁抱梁；即使走到终点，也必须亲手推窗入室才能兑现 2000 万支票。
      </p>
    </div>
  );
}

/* ============================================================================
 * 3. kaiji-tissue-box · 纸巾盒抽签
 * ========================================================================== */

type TissuePlayer = 'hyodo' | 'kaiji';

function pickWinningSlot() {
  return Math.floor(Math.random() * 100);
}

function TissueBoxDiagram() {
  const [winSlot, setWinSlot] = useState<number>(() => 27);
  const [drawn, setDrawn] = useState<Array<{ slot: number; by: TissuePlayer; hit: boolean }>>([]);
  const [turn, setTurn] = useState<TissuePlayer>('hyodo');
  const [winner, setWinner] = useState<TissuePlayer | null>(null);

  const remaining = 100 - drawn.length;
  const hitRate = remaining > 0 ? ((1 / remaining) * 100).toFixed(remaining <= 10 ? 1 : 2) : '0.00';
  const lastDraw = drawn.length > 0 ? drawn[drawn.length - 1] : null;
  const hyodoCount = drawn.filter((d) => d.by === 'hyodo').length;
  const kaijiCount = drawn.filter((d) => d.by === 'kaiji').length;

  const drawBatch = (count: number) => {
    if (winner || remaining <= 0) return;

    const usedSlots = new Set(drawn.map((d) => d.slot));
    const available: number[] = [];
    for (let i = 0; i < 100; i += 1) {
      if (!usedSlots.has(i)) available.push(i);
    }

    const nextEntries: Array<{ slot: number; by: TissuePlayer; hit: boolean }> = [];
    let currentTurn: TissuePlayer = turn;
    let foundWinner: TissuePlayer | null = null;

    for (let step = 0; step < count && available.length > 0; step += 1) {
      const randIdx = Math.floor(Math.random() * available.length);
      const pickedSlot = available.splice(randIdx, 1)[0];
      if (pickedSlot === undefined) break;
      const hit = pickedSlot === winSlot;
      nextEntries.push({ slot: pickedSlot, by: currentTurn, hit });
      if (hit) {
        foundWinner = currentTurn;
        break;
      }
      currentTurn = currentTurn === 'hyodo' ? 'kaiji' : 'hyodo';
    }

    setDrawn((prev) => [...prev, ...nextEntries]);
    setTurn(currentTurn);
    if (foundWinner) setWinner(foundWinner);
  };

  const reset = () => {
    setWinSlot(pickWinningSlot());
    setDrawn([]);
    setTurn('hyodo');
    setWinner(null);
  };

  const drawnBySlot = new Map(drawn.map((d) => [d.slot, d]));

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：轮次、余签与实时中奖率 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              余签 {remaining} / 100
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] border border-[var(--diagram-accent)]/40 text-[11px] font-semibold text-[var(--diagram-accent)] tabular-nums">
              下一签命中率 {winner ? '已开出' : `${hitRate}%`}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重装 100 签
          </button>
        </div>

        {/* 主体：纸巾盒剖面 + 100 签消耗矩阵 */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
          {/* 纸巾盒与展开纸签 */}
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 flex flex-col items-center gap-2.5">
            <svg viewBox="0 0 180 124" className="w-full max-w-[180px] h-auto" aria-hidden="true">
              {/* 抽出的纸签 */}
              <g transform="translate(68, 6)">
                <rect
                  x="0"
                  y="0"
                  width="44"
                  height="38"
                  rx="3"
                  fill={
                    lastDraw?.hit
                      ? 'var(--diagram-accent)'
                      : 'var(--diagram-surface)'
                  }
                  fillOpacity={lastDraw?.hit ? 0.22 : 1}
                  stroke={lastDraw?.hit ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
                  strokeWidth="1.6"
                />
                <text
                  x="22"
                  y="23"
                  textAnchor="middle"
                  fill={lastDraw?.hit ? 'var(--diagram-accent)' : 'var(--text-secondary)'}
                  fontSize="11"
                  fontWeight="700"
                >
                  {lastDraw ? (lastDraw.hit ? '中奖◎' : '空白') : '待抽'}
                </text>
              </g>
              {/* 纸巾盒顶面 */}
              <polygon
                points="20,54 44,40 160,40 136,54"
                fill="var(--diagram-surface)"
                stroke="var(--diagram-border)"
                strokeWidth="1.5"
              />
              {/* 顶口狭缝 */}
              <ellipse
                cx="90"
                cy="47"
                rx="26"
                ry="4.5"
                fill="var(--bg-page)"
                stroke="var(--diagram-brass)"
                strokeWidth="1.2"
              />
              {/* 盒身正面 */}
              <rect
                x="20"
                y="54"
                width="116"
                height="58"
                rx="3"
                fill="var(--diagram-surface)"
                stroke="var(--diagram-border)"
                strokeWidth="1.5"
              />
              {/* 盒身右侧透视面 */}
              <polygon
                points="136,54 160,40 160,98 136,112"
                fill="var(--bg-page)"
                fillOpacity={0.55}
                stroke="var(--diagram-border)"
                strokeWidth="1.5"
              />
              {/* 内部剩余纸签高度条 */}
              <rect
                x="30"
                y={64 + Math.round((1 - remaining / 100) * 36)}
                width="96"
                height={Math.max(2, Math.round((remaining / 100) * 38))}
                rx="2"
                fill="var(--diagram-brass)"
                fillOpacity={0.28}
              />
              <text
                x="78"
                y="88"
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize="12"
                fontWeight="700"
              >
                1 中 / 99 空
              </text>
            </svg>

            <div className="w-full flex items-center justify-between text-[11px] text-[var(--text-secondary)] px-1 tabular-nums">
              <span>兵藤 {hyodoCount} 签</span>
              <span>开司 {kaijiCount} 签</span>
            </div>
          </div>

          {/* 右侧：100 签实时消耗网格 + 轮流抽签按钮 */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
              <span className="font-semibold text-[var(--text-primary)]">
                {winner
                  ? `${winner === 'hyodo' ? '兵藤和尊' : '开司'}抽出唯一中奖签！`
                  : `当前轮到：${turn === 'hyodo' ? '兵藤和尊（先手）' : '开司'}`}
              </span>
              <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--diagram-brass)]/55 inline-block" />
                  兵藤空签
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--text-secondary)]/45 inline-block" />
                  开司空签
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--diagram-accent)] inline-block" />
                  中奖签
                </span>
              </div>
            </div>

            {/* 10x10 纸签矩阵 */}
            <div
              className="grid grid-cols-10 gap-1 p-2 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)]"
              aria-label="100 张纸签抽取进度"
            >
              {Array.from({ length: 100 }).map((_, idx) => {
                const entry = drawnBySlot.get(idx);
                return (
                  <span
                    key={idx}
                    className={`h-3.5 sm:h-4 rounded-[3px] transition-colors ${
                      entry?.hit
                        ? 'bg-[var(--diagram-accent)] ring-1 ring-[var(--text-primary)]'
                        : entry?.by === 'hyodo'
                          ? 'bg-[color-mix(in_srgb,var(--diagram-brass)_45%,var(--bg-page))]'
                          : entry?.by === 'kaiji'
                            ? 'bg-[color-mix(in_srgb,var(--text-secondary)_38%,var(--bg-page))]'
                            : 'bg-[var(--diagram-surface)] border border-[var(--border-hairline)]'
                    }`}
                  />
                );
              })}
            </div>

            {/* 操作区 */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={Boolean(winner)}
                onClick={() => drawBatch(1)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-opacity ${
                  winner
                    ? 'bg-[var(--diagram-panel)] text-[var(--text-muted)] border border-[var(--border-hairline)] cursor-not-allowed'
                    : 'bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90 cursor-pointer'
                }`}
              >
                {turn === 'hyodo' ? '兵藤抽 1 签' : '开司抽 1 签'}
              </button>
              <button
                type="button"
                disabled={Boolean(winner)}
                onClick={() => drawBatch(10)}
                className={`px-3.5 py-1.5 rounded-full border text-[12px] font-semibold transition-colors ${
                  winner
                    ? 'border-[var(--border-hairline)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer'
                }`}
              >
                连抽 10 签加速
              </button>
            </div>
          </div>
        </div>

        {/* 赌注与结算栏 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] font-semibold text-center ${
            winner
              ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
          }`}
        >
          {winner
            ? `第 ${drawn.length} 签揭晓！${winner === 'hyodo' ? '兵藤和尊' : '开司'}抽中唯一中奖签，赢得 1 亿日元赌局。`
            : '兵藤押出 1 亿日元先抽，开司押上 2000 万与左耳四指；每抽走一张空签，下一签的中奖概率都在陡增。'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        100 张签里只有 1 张中奖签，双方轮流盲抽并当场展开；越往后余签越少，每一抽的命悬一线感成倍放大。
      </p>
    </div>
  );
}

/* ============================================================================
 * 4. kaiji-chinchirorin · 地下掷骰
 * ========================================================================== */

interface ChinchirorinResult {
  title: string;
  multiplier: number; // 对掷骰者自身相对倍率（负值表示反赔）
  detail: string;
  tone: 'brass' | 'accent' | 'neutral';
}

function evaluateChinchirorin(dice: [number, number, number], outOfBowl: boolean): ChinchirorinResult {
  if (outOfBowl) {
    return {
      title: '出碗 / 无目',
      multiplier: -1,
      detail: '骰子飞出瓷碗或三次无目，直接判负（赔 1×）',
      tone: 'accent',
    };
  }
  const sorted = [...dice].sort((a, b) => a - b) as [number, number, number];
  const [a, b, c] = sorted;

  if (a === 1 && b === 1 && c === 1) {
    return {
      title: '1-1-1 三一豹子（5×）',
      multiplier: 5,
      detail: '最高牌型！立即通吃或获赔五倍佩利卡',
      tone: 'brass',
    };
  }
  if (a === b && b === c) {
    return {
      title: `${a}-${b}-${c} 豹子（3×）`,
      multiplier: 3,
      detail: '三颗同点豹子，按三倍倍率结算',
      tone: 'brass',
    };
  }
  if (a === 4 && b === 5 && c === 6) {
    return {
      title: '4-5-6 顺子（2×）',
      multiplier: 2,
      detail: '四五六大顺，立即按两倍结算',
      tone: 'brass',
    };
  }
  if (a === 1 && b === 2 && c === 3) {
    return {
      title: '1-2-3 顺子（反赔 2×）',
      multiplier: -2,
      detail: '一二三小顺，直接反赔对手两倍佩利卡',
      tone: 'accent',
    };
  }
  if (a === b || b === c) {
    const point = a === b ? c : a;
    return {
      title: `两同一单 · ${point} 点（1×）`,
      multiplier: 1,
      detail: `以单点「${point}」与对手比大小，按一倍结算`,
      tone: 'neutral',
    };
  }
  return {
    title: '无目（未凑出对子）',
    multiplier: -1,
    detail: '三颗点数互不相同且非顺子；三次无目则判负（赔 1×）',
    tone: 'accent',
  };
}

const DIE_PIPS: Record<number, Array<[number, number]>> = {
  1: [[20, 20]],
  2: [
    [11, 11],
    [29, 29],
  ],
  3: [
    [11, 11],
    [20, 20],
    [29, 29],
  ],
  4: [
    [11, 11],
    [29, 11],
    [11, 29],
    [29, 29],
  ],
  5: [
    [11, 11],
    [29, 11],
    [20, 20],
    [11, 29],
    [29, 29],
  ],
  6: [
    [11, 10],
    [29, 10],
    [11, 20],
    [29, 20],
    [11, 30],
    [29, 30],
  ],
};

function DieFaceSvg({
  value,
  x,
  y,
  rotate = 0,
  highlight,
}: {
  value: number;
  x: number;
  y: number;
  rotate?: number;
  highlight?: boolean;
}) {
  const pips = DIE_PIPS[value] ?? DIE_PIPS[1];
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate} 20 20)`}>
      <rect
        x="0"
        y="0"
        width="40"
        height="40"
        rx="8"
        fill="var(--diagram-surface)"
        stroke={highlight ? 'var(--diagram-brass)' : 'var(--diagram-border)'}
        strokeWidth={highlight ? '2' : '1.5'}
      />
      {pips.map(([cx, cy], idx) => (
        <circle
          key={idx}
          cx={cx}
          cy={cy}
          r={value === 1 ? 4.8 : 3.2}
          fill={value === 1 ? 'var(--diagram-accent)' : 'var(--text-primary)'}
        />
      ))}
    </g>
  );
}

const CHINCHI_PRESETS: Array<{
  id: string;
  label: string;
  dice: [number, number, number];
  out?: boolean;
}> = [
  { id: 'pinzoro', label: '1-1-1 五倍', dice: [1, 1, 1] },
  { id: 'triple', label: '豹子三倍', dice: [5, 5, 5] },
  { id: 'shigoro', label: '4-5-6 两倍', dice: [4, 5, 6] },
  { id: 'hifumi', label: '1-2-3 反赔两倍', dice: [1, 2, 3] },
  { id: 'point', label: '两同一单点', dice: [3, 3, 5] },
  { id: 'out', label: '出碗 / 无目', dice: [2, 4, 6], out: true },
];

function ChinchirorinDiagram() {
  const [dice, setDice] = useState<[number, number, number]>([4, 5, 6]);
  const [outOfBowl, setOutOfBowl] = useState<boolean>(false);
  const [role, setRole] = useState<'dealer' | 'player'>('dealer');
  const [bet, setBet] = useState<number>(50000);

  const res = evaluateChinchirorin(dice, outOfBowl);
  const totalPerica = bet * Math.abs(res.multiplier);

  const rollRandom = () => {
    const isOut = Math.random() < 0.08;
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2, d3]);
    setOutOfBowl(isOut);
  };

  const applyPreset = (p: (typeof CHINCHI_PRESETS)[number]) => {
    setDice(p.dice);
    setOutOfBowl(Boolean(p.out));
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：身份与押注佩利卡 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-0.5">
            <button
              type="button"
              aria-pressed={role === 'dealer'}
              onClick={() => setRole('dealer')}
              className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold cursor-pointer ${
                role === 'dealer'
                  ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              庄家掷骰（最多连庄 2 局）
            </button>
            <button
              type="button"
              aria-pressed={role === 'player'}
              onClick={() => setRole('player')}
              className={`px-2.5 py-1 rounded-md text-[11.5px] font-semibold cursor-pointer ${
                role === 'player'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-page)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              闲家掷骰
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
            <Coins className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            {[10000, 50000, 100000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setBet(v)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums cursor-pointer ${
                  bet === v
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[var(--text-secondary)]'
                }`}
              >
                {v / 10000}万
              </button>
            ))}
          </div>
        </div>

        {/* 瓷碗与三颗真实点数骰子 */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-center">
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 flex flex-col items-center gap-2.5">
            <svg viewBox="0 0 230 144" className="w-full max-w-[230px] h-auto" aria-hidden="true">
              {/* 大瓷碗外缘 */}
              <ellipse
                cx="112"
                cy="78"
                rx="88"
                ry="54"
                fill="var(--diagram-surface)"
                stroke="var(--diagram-border)"
                strokeWidth="2.5"
              />
              {/* 碗内凹底 */}
              <ellipse
                cx="112"
                cy="80"
                rx="74"
                ry="42"
                fill="var(--bg-page)"
                fillOpacity={0.55}
                stroke="var(--border-hairline)"
                strokeWidth="1.2"
              />
              {/* 碗内 3 颗骰子 */}
              <DieFaceSvg
                value={dice[0]}
                x={54}
                y={56}
                rotate={-8}
                highlight={res.tone === 'brass'}
              />
              <DieFaceSvg
                value={dice[1]}
                x={100}
                y={64}
                rotate={5}
                highlight={res.tone === 'brass'}
              />
              <DieFaceSvg
                value={dice[2]}
                x={outOfBowl ? 182 : 138}
                y={outOfBowl ? 18 : 50}
                rotate={outOfBowl ? 24 : 11}
                highlight={res.tone === 'brass'}
              />
              {outOfBowl && (
                <text
                  x="196"
                  y="74"
                  textAnchor="middle"
                  fill="var(--diagram-accent)"
                  fontSize="10"
                  fontWeight="700"
                >
                  出碗!
                </text>
              )}
            </svg>

            <button
              type="button"
              onClick={rollRandom}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5" aria-hidden="true" />
              向瓷碗掷骰
            </button>
          </div>

          {/* 预设牌型切换 + 佩利卡倍率结算 */}
          <div className="space-y-3">
            <div className="text-[11.5px] font-semibold text-[var(--text-secondary)]">
              切换预设牌型查看佩利卡倍率：
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CHINCHI_PRESETS.map((p) => {
                const isSelected =
                  Boolean(p.out) === outOfBowl &&
                  !p.out &&
                  p.dice[0] === dice[0] &&
                  p.dice[1] === dice[1] &&
                  p.dice[2] === dice[2];
                const isOutSelected = Boolean(p.out) && outOfBowl;
                const active = isSelected || isOutSelected;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => applyPreset(p)}
                    className={`rounded-lg px-2.5 py-2 text-[11.5px] font-semibold border transition-colors cursor-pointer ${
                      active
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--text-primary)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* 结算单 */}
            <div
              className={`rounded-lg px-3.5 py-2.5 border space-y-1 ${
                res.tone === 'brass'
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                  : res.tone === 'accent'
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] font-bold">
                <span
                  className={
                    res.tone === 'brass'
                      ? 'text-[var(--diagram-brass)]'
                      : res.tone === 'accent'
                        ? 'text-[var(--diagram-accent)]'
                        : 'text-[var(--text-primary)]'
                  }
                >
                  {res.title}
                </span>
                <span className="tabular-nums text-[var(--text-primary)]">
                  {res.multiplier > 0 ? '+' : '-'}
                  {totalPerica.toLocaleString()} 佩利卡
                </span>
              </div>
              <p className="text-[11.5px] text-[var(--text-secondary)]">
                {role === 'dealer' ? '庄家视角：' : '闲家视角：'}
                {res.detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        庄家先掷定型，闲家再依次比点；三一豹子赔五倍、普通豹子三倍、4-5-6 两倍，掷出 1-2-3 则反赔两倍。
      </p>
    </div>
  );
}

/* ============================================================================
 * 5. the-bog-pachinko · 食人沼泽
 * ========================================================================== */

type BogOutcome = 'idle' | 'nails' | 'layer1' | 'layer2' | 'layer3' | 'jackpot';

const BOG_STAGE_INDEX: Record<BogOutcome, number> = {
  idle: -1,
  nails: 0,
  layer1: 1,
  layer2: 2,
  layer3: 3,
  jackpot: 4,
};

function simulateSingleBall(): BogOutcome {
  // 钉之森 + 守门人（通过率约 45%）
  if (Math.random() > 0.45) return 'nails';
  // 一层 3 孔（1 进 2 死）
  if (Math.floor(Math.random() * 3) !== 0) return 'layer1';
  // 二层 4 孔（1 进 3 死）
  if (Math.floor(Math.random() * 4) !== 0) return 'layer2';
  // 三层 5 孔（1 红洞 4 死洞）
  if (Math.floor(Math.random() * 5) !== 0) return 'layer3';
  return 'jackpot';
}

function TheBogPachinkoDiagram() {
  const [ballsFired, setBallsFired] = useState<number>(0);
  const [lastOutcome, setLastOutcome] = useState<BogOutcome>('idle');
  const [bestStage, setBestStage] = useState<number>(-1);
  const [jackpotHit, setJackpotHit] = useState<boolean>(false);
  const [lastHoleIdx, setLastHoleIdx] = useState<number>(0);

  const totalCost = ballsFired * 4000;

  const fireBalls = (count: number) => {
    let bestInBatch = -1;
    let finalOutcome: BogOutcome = 'nails';
    let hit = jackpotHit;
    let firedInBatch = 0;

    for (let i = 0; i < count; i += 1) {
      firedInBatch += 1;
      const outcome = simulateSingleBall();
      const idx = BOG_STAGE_INDEX[outcome];
      if (idx >= bestInBatch) {
        bestInBatch = idx;
        finalOutcome = outcome;
      }
      if (outcome === 'jackpot') {
        hit = true;
        finalOutcome = 'jackpot';
        break;
      }
    }

    setBallsFired((prev) => prev + firedInBatch);
    setLastOutcome(finalOutcome);
    setBestStage((prev) => Math.max(prev, bestInBatch));
    setJackpotHit(hit);
    setLastHoleIdx(
      finalOutcome === 'layer1'
        ? Math.floor(Math.random() * 2) + 1
        : finalOutcome === 'layer2'
          ? Math.floor(Math.random() * 3) + 1
          : finalOutcome === 'layer3'
            ? Math.floor(Math.random() * 4) + 1
            : 0,
    );
  };

  const triggerJackpotDemo = () => {
    setBallsFired((prev) => prev + 1);
    setLastOutcome('jackpot');
    setBestStage(4);
    setJackpotHit(true);
    setLastHoleIdx(0);
  };

  const reset = () => {
    setBallsFired(0);
    setLastOutcome('idle');
    setBestStage(-1);
    setJackpotHit(false);
    setLastHoleIdx(0);
  };

  const reached = BOG_STAGE_INDEX[lastOutcome];

  const outcomeMessage: Record<BogOutcome, string> = {
    idle: '每颗专用钢珠 4,000 日元，点击发射观察钢珠闯过四道死亡关卡。',
    nails: '钢珠卡在入口「钉之森 / 守门人」被弹飞，未能进入转盘区。',
    layer1: '闯过入口！但在第一层 3 孔转盘落入死洞（1 进 2 死）。',
    layer2: '突破第一层！但在第二层 4 孔转盘落入死洞（1 进 3 死）。',
    layer3: '杀进第三层！距红洞仅一步之遥，落入 4 个死洞之一。',
    jackpot: '奇迹贯穿全部四关！钢珠稳稳掉入三层唯一红洞，独吞七亿多奖池！',
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：发射颗数与累计投入 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2.5 tabular-nums">
            <span className="font-semibold text-[var(--text-primary)]">
              已发射 {ballsFired} 颗
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-brass)]">
              累计投入 ¥{totalCost.toLocaleString()}
            </span>
            {jackpotHit && (
              <span className="px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] border border-[var(--diagram-accent)]/50 text-[11px] font-semibold text-[var(--diagram-accent)]">
                已贯通红洞
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            清空计数
          </button>
        </div>

        {/* 四关纵剖面 SVG */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-2.5 sm:p-3">
          <svg
            viewBox="0 0 520 250"
            className="w-full h-auto block select-none"
            role="img"
            aria-label="食人沼泽四关纵剖面图"
          >
            {/* 机台外框 */}
            <rect
              x="128"
              y="8"
              width="264"
              height="234"
              rx="12"
              fill="var(--diagram-surface)"
              stroke="var(--diagram-border)"
              strokeWidth="1.6"
            />

            {/* 左侧 4 层关卡标签 */}
            {[
              { y: 36, title: '入口关', sub: '钉之森 + 守门人', idx: 0 },
              { y: 94, title: '一层转盘', sub: '3 孔（1 进 2 死）', idx: 1 },
              { y: 152, title: '二层转盘', sub: '4 孔（1 进 3 死）', idx: 2 },
              { y: 210, title: '三层转盘', sub: '5 孔（1 红 4 死）', idx: 3 },
            ].map((row) => {
              const active = reached >= row.idx && lastOutcome !== 'idle';
              return (
                <g key={row.title}>
                  <text
                    x="116"
                    y={row.y - 2}
                    textAnchor="end"
                    fill={active ? 'var(--diagram-brass)' : 'var(--text-primary)'}
                    fontSize="11.5"
                    fontWeight="700"
                  >
                    {row.title}
                  </text>
                  <text
                    x="116"
                    y={row.y + 12}
                    textAnchor="end"
                    fill="var(--text-secondary)"
                    fontSize="10"
                  >
                    {row.sub}
                  </text>
                </g>
              );
            })}

            {/* 入口：钉之森（密集钉点）+ 守门人挡板 */}
            <g fill="var(--text-muted)">
              {[180, 200, 220, 240, 260, 280, 300, 320, 340].map((px) => (
                <circle key={`r1-${px}`} cx={px} cy={22} r="2.2" />
              ))}
              {[190, 210, 230, 250, 270, 290, 310, 330].map((px) => (
                <circle key={`r2-${px}`} cx={px} cy={34} r="2.2" />
              ))}
            </g>
            {/* 守门人机械挡板 */}
            <line
              x1="210"
              y1="48"
              x2="248"
              y2="52"
              stroke="var(--diagram-brass)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="310"
              y1="48"
              x2="272"
              y2="52"
              stroke="var(--diagram-brass)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* 一层转盘：3 孔（中间 1 进，两侧 2 死） */}
            <ellipse
              cx="260"
              cy="94"
              rx="104"
              ry="19"
              fill="var(--bg-page)"
              fillOpacity={0.55}
              stroke={reached >= 1 ? 'var(--diagram-brass)' : 'var(--diagram-border)'}
              strokeWidth="1.4"
            />
            {[
              { cx: 260, win: true, idx: 0 },
              { cx: 204, win: false, idx: 1 },
              { cx: 316, win: false, idx: 2 },
            ].map((h) => (
              <circle
                key={`l1-${h.idx}`}
                cx={h.cx}
                cy={94}
                r="8"
                fill={
                  h.win
                    ? 'var(--diagram-brass)'
                    : lastOutcome === 'layer1' && lastHoleIdx === h.idx
                      ? 'var(--text-primary)'
                      : 'var(--diagram-surface)'
                }
                fillOpacity={h.win ? 0.35 : 0.9}
                stroke={h.win ? 'var(--diagram-brass)' : 'var(--border-hairline)'}
                strokeWidth="1.5"
              />
            ))}

            {/* 二层转盘：4 孔（1 进 3 死） */}
            <ellipse
              cx="260"
              cy="152"
              rx="110"
              ry="19"
              fill="var(--bg-page)"
              fillOpacity={0.55}
              stroke={reached >= 2 ? 'var(--diagram-brass)' : 'var(--diagram-border)'}
              strokeWidth="1.4"
            />
            {[
              { cx: 260, win: true, idx: 0 },
              { cx: 186, win: false, idx: 1 },
              { cx: 223, win: false, idx: 2 },
              { cx: 318, win: false, idx: 3 },
            ].map((h) => (
              <circle
                key={`l2-${h.idx}`}
                cx={h.cx}
                cy={152}
                r="7.5"
                fill={
                  h.win
                    ? 'var(--diagram-brass)'
                    : lastOutcome === 'layer2' && lastHoleIdx === h.idx
                      ? 'var(--text-primary)'
                      : 'var(--diagram-surface)'
                }
                fillOpacity={h.win ? 0.35 : 0.9}
                stroke={h.win ? 'var(--diagram-brass)' : 'var(--border-hairline)'}
                strokeWidth="1.5"
              />
            ))}

            {/* 三层转盘：5 孔（1 红洞 4 死洞） */}
            <ellipse
              cx="260"
              cy="210"
              rx="116"
              ry="20"
              fill="var(--bg-page)"
              fillOpacity={0.55}
              stroke={
                lastOutcome === 'jackpot'
                  ? 'var(--diagram-accent)'
                  : reached >= 3
                    ? 'var(--diagram-brass)'
                    : 'var(--diagram-border)'
              }
              strokeWidth="1.6"
            />
            {[
              { cx: 260, win: true, idx: 0 },
              { cx: 176, win: false, idx: 1 },
              { cx: 218, win: false, idx: 2 },
              { cx: 302, win: false, idx: 3 },
              { cx: 344, win: false, idx: 4 },
            ].map((h) => (
              <circle
                key={`l3-${h.idx}`}
                cx={h.cx}
                cy={210}
                r={h.win ? 9 : 7}
                fill={
                  h.win
                    ? 'var(--diagram-accent)'
                    : lastOutcome === 'layer3' && lastHoleIdx === h.idx
                      ? 'var(--text-primary)'
                      : 'var(--diagram-surface)'
                }
                fillOpacity={h.win ? (lastOutcome === 'jackpot' ? 0.9 : 0.38) : 0.9}
                stroke={h.win ? 'var(--diagram-accent)' : 'var(--border-hairline)'}
                strokeWidth="1.8"
              />
            ))}

            {/* 钢珠垂直落轨演示 */}
            {lastOutcome !== 'idle' && (
              <g>
                <line
                  x1="260"
                  y1="14"
                  x2="260"
                  y2={
                    lastOutcome === 'nails'
                      ? 44
                      : lastOutcome === 'layer1'
                        ? 94
                        : lastOutcome === 'layer2'
                          ? 152
                          : 210
                  }
                  stroke={lastOutcome === 'jackpot' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
                  strokeWidth="2.2"
                  strokeDasharray="4 3"
                />
                <circle
                  cx={
                    lastOutcome === 'nails'
                      ? 234
                      : lastOutcome === 'jackpot'
                        ? 260
                        : lastOutcome === 'layer1'
                          ? lastHoleIdx === 1
                            ? 204
                            : 316
                          : lastOutcome === 'layer2'
                            ? [260, 186, 223, 318][lastHoleIdx] ?? 186
                            : [260, 176, 218, 302, 344][lastHoleIdx] ?? 176
                  }
                  cy={
                    lastOutcome === 'nails'
                      ? 44
                      : lastOutcome === 'layer1'
                        ? 94
                        : lastOutcome === 'layer2'
                          ? 152
                          : 210
                  }
                  r="5.5"
                  fill="var(--text-primary)"
                  stroke="var(--bg-page)"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* 右侧红洞奖池标注 */}
            <text
              x="404"
              y="206"
              fill="var(--diagram-accent)"
              fontSize="11.5"
              fontWeight="700"
            >
              唯一红洞
            </text>
            <text x="404" y="220" fill="var(--text-secondary)" fontSize="10">
              吞下 7 亿+ 奖池
            </text>
            {bestStage >= 0 && (
              <text x="404" y="42" fill="var(--text-secondary)" fontSize="10.5">
                最深记录：{['入口关', '一层', '二层', '三层', '命中红洞'][bestStage]}
              </text>
            )}
          </svg>
        </div>

        {/* 发射操作按钮 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => fireBalls(1)}
            className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            发射 4000 日元钢珠
          </button>
          <button
            type="button"
            onClick={() => fireBalls(20)}
            className="px-3.5 py-1.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[12px] font-semibold text-[var(--text-primary)] hover:border-[var(--diagram-brass)] transition-colors cursor-pointer"
          >
            连发 20 颗（8 万日元）
          </button>
          <button
            type="button"
            onClick={triggerJackpotDemo}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[12px] font-semibold text-[var(--diagram-accent)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            演示红洞通关
          </button>
        </div>

        {/* 结果反馈 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] font-semibold text-center ${
            lastOutcome === 'jackpot'
              ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {outcomeMessage[lastOutcome]}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        单看每层转盘似乎都有 1/3、1/4、1/5 的机会，叠加入口钉阵与机械挡板后，单颗钢珠一路贯通红洞的几率极其惨烈。
      </p>
    </div>
  );
}

/* ============================================================================
 * 6. minefield-mahjong-17-steps · 17步地雷麻将
 * ========================================================================== */

interface MahjongTile {
  id: string;
  label: string;
  suit: 'man' | 'pin' | 'sou' | 'honor';
}

// 13 张满贯听牌（混一色 + 一气通贯 + 役牌中 = 倍满/满贯以上，听「发」）
const MY_TENPAI_HAND: MahjongTile[] = [
  { id: 'h1', label: '一万', suit: 'man' },
  { id: 'h2', label: '二万', suit: 'man' },
  { id: 'h3', label: '三万', suit: 'man' },
  { id: 'h4', label: '四万', suit: 'man' },
  { id: 'h5', label: '五万', suit: 'man' },
  { id: 'h6', label: '六万', suit: 'man' },
  { id: 'h7', label: '七万', suit: 'man' },
  { id: 'h8', label: '八万', suit: 'man' },
  { id: 'h9', label: '九万', suit: 'man' },
  { id: 'h10', label: '中', suit: 'honor' },
  { id: 'h11', label: '中', suit: 'honor' },
  { id: 'h12', label: '中', suit: 'honor' },
  { id: 'h13', label: '发', suit: 'honor' },
];

// 剩余 21 张舍牌库（34 - 13 = 21）
const DISCARD_POOL: MahjongTile[] = [
  { id: 'p1', label: '一筒', suit: 'pin' },
  { id: 'p2', label: '二筒', suit: 'pin' },
  { id: 'p3', label: '三筒', suit: 'pin' },
  { id: 'p4', label: '四筒', suit: 'pin' },
  { id: 'p5', label: '五筒', suit: 'pin' },
  { id: 'p6', label: '六筒', suit: 'pin' },
  { id: 'p7', label: '七筒', suit: 'pin' },
  { id: 'p8', label: '八筒', suit: 'pin' },
  { id: 'p9', label: '九筒', suit: 'pin' },
  { id: 's1', label: '一索', suit: 'sou' },
  { id: 's2', label: '二索', suit: 'sou' },
  { id: 's3', label: '三索', suit: 'sou' },
  { id: 's4', label: '四索', suit: 'sou' },
  { id: 's5', label: '五索', suit: 'sou' },
  { id: 's6', label: '六索', suit: 'sou' },
  { id: 's7', label: '七索', suit: 'sou' },
  { id: 's8', label: '八索', suit: 'sou' },
  { id: 's9', label: '九索', suit: 'sou' },
  { id: 'z1', label: '东', suit: 'honor' },
  { id: 'z2', label: '南', suit: 'honor' },
  { id: 'z3', label: '白', suit: 'honor' },
];

function pickMineIds(): string[] {
  const ids = DISCARD_POOL.map((t) => t.id);
  const mines: string[] = [];
  while (mines.length < 2) {
    const candidate = ids[Math.floor(Math.random() * ids.length)];
    if (candidate && !mines.includes(candidate)) mines.push(candidate);
  }
  return mines;
}

function MinefieldMahjongDiagram() {
  const [mineIds, setMineIds] = useState<string[]>(() => ['p5', 's8']);
  const [discardedIds, setDiscardedIds] = useState<string[]>([]);
  const [triggeredMine, setTriggeredMine] = useState<string | null>(null);

  const step = discardedIds.length;
  const isDraw = !triggeredMine && step >= 17;
  const isFinished = Boolean(triggeredMine) || isDraw;
  const unplayedTiles = DISCARD_POOL.filter((t) => !discardedIds.includes(t.id));
  const mineChance =
    unplayedTiles.length > 0 ? Math.round((mineIds.length / unplayedTiles.length) * 100) : 0;

  const discardTile = (tileId: string) => {
    if (isFinished || discardedIds.includes(tileId)) return;
    setDiscardedIds((prev) => [...prev, tileId]);
    if (mineIds.includes(tileId)) {
      setTriggeredMine(tileId);
    }
  };

  const discardQuickSafeAttempt = () => {
    if (isFinished || unplayedTiles.length === 0) return;
    const pick = unplayedTiles[Math.floor(Math.random() * unplayedTiles.length)];
    if (pick) discardTile(pick.id);
  };

  const reset = () => {
    setMineIds(pickMineIds());
    setDiscardedIds([]);
    setTriggeredMine(null);
  };

  const triggeredTile = DISCARD_POOL.find((t) => t.id === triggeredMine);

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：步数进度与不可自摸规则 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              第 {step} / 17 步
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-brass)]">
              不摸牌 · 不可自摸 · 仅抓放铳荣和
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新配牌
          </button>
        </div>

        {/* 13 张满贯听牌展示 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="font-semibold text-[var(--diagram-brass)]">
              已配好的 13 张满贯听牌（混一色 · 一气通贯 · 中）
            </span>
            <span className="text-[var(--text-secondary)]">
              听牌：<strong className="text-[var(--text-primary)]">发</strong>（仅能等对手点炮）
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {MY_TENPAI_HAND.map((tile) => (
              <span
                key={tile.id}
                className={`px-1.5 py-1.5 rounded-md border text-[11px] font-bold leading-none select-none ${
                  tile.suit === 'honor'
                    ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_15%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)]'
                }`}
              >
                {tile.label}
              </span>
            ))}
          </div>
        </div>

        {/* 21 张余牌舍牌库（藏有 2 张对手满贯听牌地雷） */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="font-semibold text-[var(--text-primary)]">
              余牌舍牌库（余 {unplayedTiles.length} / 21 张 · 暗藏 2 张对手听牌）
            </span>
            <span className="text-[11px] text-[var(--diagram-accent)] font-semibold tabular-nums">
              {isFinished ? '本局已定' : `单步踩雷率约 ${mineChance}%`}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DISCARD_POOL.map((tile) => {
              const isPlayed = discardedIds.includes(tile.id);
              const isMine = mineIds.includes(tile.id);
              const revealMine = (isFinished && isMine) || triggeredMine === tile.id;
              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={isPlayed || isFinished}
                  onClick={() => discardTile(tile.id)}
                  className={`py-2 rounded-lg border text-[11.5px] font-semibold transition-all ${
                    revealMine
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                      : isPlayed
                        ? 'border-[var(--border-hairline)] bg-[var(--bg-page)]/40 text-[var(--text-muted)] opacity-45 line-through cursor-not-allowed'
                        : isFinished
                          ? 'border-[var(--border-hairline)] bg-[var(--diagram-panel)] text-[var(--text-muted)] opacity-60 cursor-not-allowed'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {tile.label}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center pt-1">
            <button
              type="button"
              disabled={isFinished}
              onClick={discardQuickSafeAttempt}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-opacity ${
                isFinished
                  ? 'bg-[var(--diagram-panel)] text-[var(--text-muted)] border border-[var(--border-hairline)] cursor-not-allowed'
                  : 'bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90 cursor-pointer'
              }`}
            >
              打出一张安全牌（推进第 {Math.min(17, step + 1)} / 17 步）
            </button>
          </div>
        </div>

        {/* 结算状态 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] font-semibold text-center ${
            triggeredMine
              ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : isDraw
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
          }`}
        >
          {triggeredMine && triggeredTile
            ? `第 ${step} 步放铳！打出的「${triggeredTile.label}」踩中对手满贯听牌，对手荣和胜出！`
            : isDraw
              ? '成功撑满 17 步流局！全部地雷已标红揭晓，无人点炮。'
              : '点击上方任意余牌或点按钮推进步数；每打出一张安全牌，剩余牌库里的地雷密度都会升高。'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        从 34 张牌挑 13 张配好满贯听牌后不再摸牌，剩余 21 张里必须硬着头皮打出 17 张——一步踏错就是满贯放铳。
      </p>
    </div>
  );
}

/* ============================================================================
 * 7. kaiji-salvation · 救出游戏
 * ========================================================================== */

type SalvationOutcome = 'pending' | 'early' | 'saved' | 'late' | 'betrayed';

function SalvationDiagram() {
  const [pressSecond, setPressSecond] = useState<number>(56);
  const [outcome, setOutcome] = useState<SalvationOutcome>('pending');

  const isBlackout = pressSecond >= 30;
  const hostagesDropped = outcome === 'early' || outcome === 'late' || outcome === 'betrayed';
  const hostagesSaved = outcome === 'saved';

  const handlePressRelease = () => {
    if (pressSecond < 54) {
      setOutcome('early');
    } else if (pressSecond <= 59) {
      setOutcome('saved');
    } else {
      setOutcome('late');
    }
  };

  const handleBetray = () => {
    setOutcome('betrayed');
  };

  const reset = () => {
    setPressSecond(56);
    setOutcome('pending');
  };

  const statusText: Record<SalvationOutcome, string> = {
    pending:
      pressSecond < 30
        ? `当前停在 ${pressSecond} 秒（计时提示仍亮着），拖动滑杆决定默数后按下「解除键」的时机。`
        : `当前默数至 ${pressSecond} 秒（30 秒后计时灯已熄灭），选择按下「解除键」救人或按「背叛键」独吞。`,
    early: `按得太早（第 ${pressSecond} 秒）！未进入最后 54–59 秒安全窗口，锁扣误触发导致人质坠落。`,
    saved: `精准卡点（第 ${pressSecond} 秒）！在最后安全窗口按下解除键，两名同伴成功脱险，全员晋级下轮。`,
    late: `超时（第 ${pressSecond} 秒）！默数偏慢错过 60 秒底线，头顶卡扣自动松开，人质坠入深渊。`,
    betrayed: '按下扶手旁的「背叛键」：救人者独吞累计奖金安全离场，两名同伴当场松扣坠落。',
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：角色分配与熄灯状态 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">
              1 救人者 · 2 待救人质
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${
                isBlackout
                  ? 'border-[var(--diagram-accent)]/50 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                  : 'border-[var(--diagram-brass)]/50 bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              }`}
            >
              {isBlackout ? (
                <>
                  <EyeOff className="w-3 h-3" aria-hidden="true" />
                  30s 后计时熄灯 · 盲目默数
                </>
              ) : (
                <>
                  <Timer className="w-3 h-3" aria-hidden="true" />
                  计时提示亮灯中（0–30s）
                </>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置本轮
          </button>
        </div>

        {/* 三把高空悬吊椅 SVG */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-2.5 sm:p-3">
          <svg
            viewBox="0 0 520 172"
            className="w-full h-auto block select-none"
            role="img"
            aria-label="三把高空悬吊椅与安全卡扣示意图"
          >
            {/* 顶部横梁 */}
            <rect
              x="24"
              y="12"
              width="472"
              height="10"
              rx="3"
              fill="var(--diagram-surface)"
              stroke="var(--diagram-border)"
              strokeWidth="1.5"
            />

            {/* 左侧：救人者座椅 */}
            <g transform="translate(106, 22)">
              <line x1="0" y1="0" x2="0" y2="54" stroke="var(--diagram-brass)" strokeWidth="2.2" />
              <rect
                x="-34"
                y="54"
                width="68"
                height="48"
                rx="7"
                fill="var(--diagram-surface)"
                stroke="var(--diagram-brass)"
                strokeWidth="1.8"
              />
              {/* 扶手背叛键 */}
              <circle
                cx="34"
                cy="82"
                r="6"
                fill="var(--diagram-accent)"
                fillOpacity={outcome === 'betrayed' ? 1 : 0.35}
                stroke="var(--diagram-accent)"
                strokeWidth="1.5"
              />
              <text
                x="0"
                y="76"
                textAnchor="middle"
                fill="var(--diagram-brass)"
                fontSize="11.5"
                fontWeight="700"
              >
                救人者
              </text>
              <text
                x="0"
                y="92"
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="9.5"
              >
                {outcome === 'betrayed' ? '已独吞离场' : '扶手有背叛键'}
              </text>
            </g>

            {/* 中间 & 右侧：两个人质悬吊椅 */}
            {[
              { x: 280, label: '人质 A' },
              { x: 416, label: '人质 B' },
            ].map((seat) => (
              <g key={seat.label} transform={`translate(${seat.x}, 22)`}>
                {/* 头顶致命卡扣 */}
                <rect
                  x="-12"
                  y="0"
                  width="24"
                  height="12"
                  rx="3"
                  fill={
                    hostagesDropped
                      ? 'var(--diagram-accent)'
                      : hostagesSaved
                        ? 'var(--diagram-brass)'
                        : 'var(--diagram-surface)'
                  }
                  fillOpacity={hostagesDropped || hostagesSaved ? 0.3 : 1}
                  stroke={hostagesDropped ? 'var(--diagram-accent)' : 'var(--diagram-border)'}
                  strokeWidth="1.4"
                />
                {/* 悬吊索（松扣则断开） */}
                {!hostagesDropped ? (
                  <line
                    x1="0"
                    y1="12"
                    x2="0"
                    y2="54"
                    stroke={hostagesSaved ? 'var(--diagram-brass)' : 'var(--text-secondary)'}
                    strokeWidth="2"
                  />
                ) : (
                  <line
                    x1="0"
                    y1="12"
                    x2="0"
                    y2="28"
                    stroke="var(--diagram-accent)"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* 座椅本体 */}
                <g transform={hostagesDropped ? 'translate(0, 42) rotate(12)' : 'translate(0, 0)'}>
                  <rect
                    x="-32"
                    y="54"
                    width="64"
                    height="46"
                    rx="7"
                    fill="var(--diagram-surface)"
                    stroke={
                      hostagesDropped
                        ? 'var(--diagram-accent)'
                        : hostagesSaved
                          ? 'var(--diagram-brass)'
                          : 'var(--diagram-border)'
                    }
                    strokeWidth="1.7"
                  />
                  <text
                    x="0"
                    y="74"
                    textAnchor="middle"
                    fill={
                      hostagesDropped
                        ? 'var(--diagram-accent)'
                        : hostagesSaved
                          ? 'var(--diagram-brass)'
                          : 'var(--text-primary)'
                    }
                    fontSize="11.5"
                    fontWeight="700"
                  >
                    {seat.label}
                  </text>
                  <text
                    x="0"
                    y="90"
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize="9.5"
                  >
                    {hostagesDropped ? '卡扣松脱坠落' : hostagesSaved ? '已解除获救' : '悬空待救'}
                  </text>
                </g>
              </g>
            ))}

            {/* 底部深渊警示线 */}
            <line
              x1="196"
              y1="158"
              x2="486"
              y2="158"
              stroke="var(--diagram-accent)"
              strokeOpacity={0.45}
              strokeWidth="1.2"
              strokeDasharray="5 4"
            />
            <text
              x="341"
              y="152"
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="10"
            >
              高空深渊 · 按错 / 超时 / 背叛均会直接松扣
            </text>
          </svg>
        </div>

        {/* 60 秒倒计时默数轴 */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <label
              htmlFor="salvation-timer-range"
              className="font-semibold text-[var(--text-primary)] tabular-nums"
            >
              按下「解除键」时机：第 {pressSecond} / 60 秒
            </label>
            <div className="flex items-center gap-1.5">
              {[
                { label: '45s（过早）', sec: 45 },
                { label: '57s（安全窗）', sec: 57 },
                { label: '60s（超时）', sec: 60 },
              ].map((preset) => (
                <button
                  key={preset.sec}
                  type="button"
                  onClick={() => {
                    setPressSecond(preset.sec);
                    setOutcome('pending');
                  }}
                  className={`px-2 py-0.5 rounded-full text-[11px] border cursor-pointer ${
                    pressSecond === preset.sec
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--text-primary)] font-semibold'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 区间可视化条 */}
          <div className="relative h-2.5 rounded-full overflow-hidden bg-[var(--diagram-panel)] border border-[var(--diagram-border)] flex">
            <div className="w-1/2 h-full bg-[color-mix(in_srgb,var(--diagram-brass)_28%,transparent)]" />
            <div className="w-[40%] h-full bg-[color-mix(in_srgb,var(--text-muted)_20%,transparent)]" />
            <div className="w-[8.5%] h-full bg-[var(--diagram-brass)]" />
            <div className="w-[1.5%] h-full bg-[var(--diagram-accent)]" />
          </div>

          <input
            id="salvation-timer-range"
            type="range"
            min={0}
            max={60}
            value={pressSecond}
            onChange={(e) => {
              setPressSecond(Number(e.target.value));
              setOutcome('pending');
            }}
            className="w-full accent-[var(--diagram-brass)] cursor-pointer"
          />
          <div className="flex justify-between text-[10.5px] text-[var(--text-muted)] tabular-nums">
            <span>0s 亮灯计时</span>
            <span>30s 熄灯默数</span>
            <span className="text-[var(--diagram-brass)] font-semibold">54–59s 安全窗</span>
            <span className="text-[var(--diagram-accent)]">60s</span>
          </div>
        </div>

        {/* 两个抉择按钮 */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handlePressRelease}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            按下解除键（第 {pressSecond} 秒）
          </button>
          <button
            type="button"
            onClick={handleBetray}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Skull className="w-3.5 h-3.5" aria-hidden="true" />
            按下扶手背叛键（独吞离场）
          </button>
        </div>

        {/* 结果提示 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] font-semibold text-center ${
            outcome === 'saved'
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : hostagesDropped
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {statusText[outcome]}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        计时灯在中途熄灭，救人者必须在黑暗默数里卡准最后数秒按下解除键，同时还要抵御一键独吞奖金的背叛诱惑。
      </p>
    </div>
  );
}

/* ============================================================================
 * 8. kaiji-one-poker · 单张扑克
 * ========================================================================== */

interface OnePokerCard {
  rank: number; // 2..14 (14 = A)
  label: string;
  suit: '♠' | '♥' | '♦' | '♣';
  red?: boolean;
}

const ONE_POKER_RANKS: Array<{ rank: number; label: string }> = [
  { rank: 2, label: '2' },
  { rank: 3, label: '3' },
  { rank: 4, label: '4' },
  { rank: 5, label: '5' },
  { rank: 6, label: '6' },
  { rank: 7, label: '7' },
  { rank: 8, label: '8' },
  { rank: 9, label: '9' },
  { rank: 10, label: '10' },
  { rank: 11, label: 'J' },
  { rank: 12, label: 'Q' },
  { rank: 13, label: 'K' },
  { rank: 14, label: 'A' },
];

const ONE_POKER_SUITS: Array<{ suit: '♠' | '♥' | '♦' | '♣'; red?: boolean }> = [
  { suit: '♠' },
  { suit: '♥', red: true },
  { suit: '♦', red: true },
  { suit: '♣' },
];

function isUpCard(card: OnePokerCard): boolean {
  return card.rank >= 8;
}

function drawRandomOnePokerCard(): OnePokerCard {
  const r = ONE_POKER_RANKS[Math.floor(Math.random() * ONE_POKER_RANKS.length)] ?? ONE_POKER_RANKS[0];
  const s = ONE_POKER_SUITS[Math.floor(Math.random() * ONE_POKER_SUITS.length)] ?? ONE_POKER_SUITS[0];
  return { rank: r.rank, label: r.label, suit: s.suit, red: s.red };
}

function judgeOnePoker(
  mine: OnePokerCard,
  opp: OnePokerCard,
): { winner: 'mine' | 'opp' | 'tie'; label: string; isTwoKillsAce: boolean } {
  if (mine.rank === opp.rank) {
    return {
      winner: 'tie',
      label: `双方同为 ${mine.label} · 平局退回本手筹码`,
      isTwoKillsAce: false,
    };
  }
  if (mine.rank === 2 && opp.rank === 14) {
    return {
      winner: 'mine',
      label: '特例逆转！最小的 2 直接反杀最大的 A，赢走桌上生命筹码！',
      isTwoKillsAce: true,
    };
  }
  if (opp.rank === 2 && mine.rank === 14) {
    return {
      winner: 'opp',
      label: '遭到反杀！对手以最小的 2 击穿你的 A，痛失生命筹码！',
      isTwoKillsAce: true,
    };
  }
  if (mine.rank > opp.rank) {
    return {
      winner: 'mine',
      label: `${mine.label} 大于 ${opp.label} · 己方胜出，收下生命筹码`,
      isTwoKillsAce: false,
    };
  }
  return {
    winner: 'opp',
    label: `${opp.label} 压制 ${mine.label} · 对手胜出，己方失去生命筹码`,
    isTwoKillsAce: false,
  };
}

function LampBadge({ up }: { up: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10.5px] font-bold border whitespace-nowrap ${
        up
          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--diagram-brass)]'
          : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
      }`}
    >
      {up ? (
        <ArrowUp className="w-3 h-3 shrink-0" aria-hidden="true" />
      ) : (
        <ArrowDown className="w-3 h-3 shrink-0" aria-hidden="true" />
      )}
      {up ? 'UP 8–A' : 'DOWN 2–7'}
    </span>
  );
}

const DEFAULT_MY_HAND: [OnePokerCard, OnePokerCard] = [
  { rank: 2, label: '2', suit: '♠' },
  { rank: 12, label: 'Q', suit: '♦', red: true },
];

const DEFAULT_OPP_HAND: [OnePokerCard, OnePokerCard] = [
  { rank: 14, label: 'A', suit: '♣' },
  { rank: 6, label: '6', suit: '♥', red: true },
];

function OnePokerDiagram() {
  const [myHand, setMyHand] = useState<[OnePokerCard, OnePokerCard]>(DEFAULT_MY_HAND);
  const [oppHand, setOppHand] = useState<[OnePokerCard, OnePokerCard]>(DEFAULT_OPP_HAND);
  const [myPickIdx, setMyPickIdx] = useState<0 | 1>(0);
  const [oppPickIdx, setOppPickIdx] = useState<0 | 1>(0);
  const [stake, setStake] = useState<number>(1);
  const [myChips, setMyChips] = useState<number>(2);
  const [oppChips, setOppChips] = useState<number>(10);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [resultText, setResultText] = useState<string>(
    '观察双方 UP / DOWN 灯色后选一张牌，点击「翻牌比大小」（可试着用 2 反杀对手的 UP 牌！）',
  );
  const [resultTone, setResultTone] = useState<'mine' | 'opp' | 'tie'>('tie');

  const handleShowdown = () => {
    if (revealed) return;
    const mine = myHand[myPickIdx];
    const opp = oppHand[oppPickIdx];
    const res = judgeOnePoker(mine, opp);
    setRevealed(true);
    setResultText(res.label);
    setResultTone(res.winner);

    if (res.winner === 'mine') {
      const gain = Math.min(stake, oppChips);
      setMyChips((c) => c + gain);
      setOppChips((c) => Math.max(0, c - gain));
    } else if (res.winner === 'opp') {
      const loss = Math.min(stake, myChips);
      setMyChips((c) => Math.max(0, c - loss));
      setOppChips((c) => c + loss);
    }
  };

  const dealNextRound = () => {
    // 用掉已出牌后各补 1 张维持两张手牌
    const nextMy: [OnePokerCard, OnePokerCard] =
      myPickIdx === 0
        ? [drawRandomOnePokerCard(), myHand[1]]
        : [myHand[0], drawRandomOnePokerCard()];
    const nextOpp: [OnePokerCard, OnePokerCard] =
      oppPickIdx === 0
        ? [drawRandomOnePokerCard(), oppHand[1]]
        : [oppHand[0], drawRandomOnePokerCard()];

    setMyHand(nextMy);
    setOppHand(nextOpp);
    setMyPickIdx(0);
    setOppPickIdx(Math.random() < 0.5 ? 0 : 1);
    setRevealed(false);
    setResultTone('tie');
    setResultText('已各自补摸 1 张新牌！根据桌面 UP / DOWN 灯色决定本回合出牌。');
  };

  const loadTwoKillsAcePreset = () => {
    setMyHand(DEFAULT_MY_HAND);
    setOppHand(DEFAULT_OPP_HAND);
    setMyPickIdx(0);
    setOppPickIdx(0);
    setRevealed(false);
    setResultTone('tie');
    setResultText('已摆好经典「2 狙击 A」牌局：己方选 DOWN 牌 2，对手亮 UP 灯，点「翻牌比大小」验证！');
  };

  const resetAll = () => {
    setMyHand(DEFAULT_MY_HAND);
    setOppHand(DEFAULT_OPP_HAND);
    setMyPickIdx(0);
    setOppPickIdx(0);
    setStake(1);
    setMyChips(2);
    setOppChips(10);
    setRevealed(false);
    setResultTone('tie');
    setResultText('观察双方 UP / DOWN 灯色后选一张牌，点击「翻牌比大小」');
  };

  const chosenMine = myHand[myPickIdx];
  const chosenOpp = oppHand[oppPickIdx];

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：生命筹码对比 + 经典预设 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2.5 tabular-nums">
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--diagram-brass)]">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              己方 {myChips} 枚
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--diagram-accent)]">
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              对手 {oppChips} 枚
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">（1 枚 = 2 亿日元）</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadTwoKillsAcePreset}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[var(--diagram-accent)] hover:opacity-80 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              预设 2 反杀 A
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重置
            </button>
          </div>
        </div>

        {/* 牌桌主体：己方 2 张（明牌+灯色） vs 中央翻牌区 vs 对手 2 张（暗牌仅亮灯色） */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* 己方 2 张手牌 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-brass)]">己方手牌（选 1 张）</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                <Lightbulb className="w-3 h-3 text-[var(--diagram-brass)]" aria-hidden="true" />
                灯色公开给对手
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {myHand.map((card, idx) => {
                const i = idx as 0 | 1;
                const selected = myPickIdx === i;
                return (
                  <button
                    key={`my-${i}`}
                    type="button"
                    disabled={revealed}
                    aria-pressed={selected}
                    onClick={() => setMyPickIdx(i)}
                    className={`rounded-xl border p-2.5 flex flex-col items-center gap-2 transition-all ${
                      revealed
                        ? 'border-[var(--border-hairline)] bg-[var(--diagram-panel)] opacity-75 cursor-not-allowed'
                        : selected
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] ring-2 ring-[var(--text-primary)] -translate-y-0.5 cursor-pointer'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] cursor-pointer'
                    }`}
                  >
                    <LampBadge up={isUpCard(card)} />
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-[20px] font-bold leading-none ${
                          card.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {card.label}
                      </span>
                      <span
                        className={`text-[15px] leading-none ${
                          card.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {card.suit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 中央出牌与押注区 */}
          <div className="flex flex-col items-center justify-center gap-2.5 py-1">
            <div className="flex items-center gap-3">
              {/* 己方出牌槽 */}
              <div className="w-[70px] h-[94px] rounded-xl border border-[var(--diagram-brass)] bg-[var(--diagram-panel)] flex flex-col items-center justify-center gap-1">
                <span className="text-[10px] font-bold text-[var(--diagram-brass)]">
                  {isUpCard(chosenMine) ? 'UP' : 'DOWN'}
                </span>
                <span
                  className={`text-[20px] font-bold leading-none ${
                    chosenMine.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {chosenMine.label}
                  {chosenMine.suit}
                </span>
              </div>

              <span className="font-mincho text-xs text-[var(--text-secondary)] select-none">VS</span>

              {/* 对手出牌槽（翻牌前只见灯色） */}
              <div className="w-[70px] h-[94px] rounded-xl border border-[var(--diagram-accent)] bg-[var(--diagram-panel)] flex flex-col items-center justify-center gap-1">
                <span className="text-[10px] font-bold text-[var(--diagram-accent)]">
                  {isUpCard(chosenOpp) ? 'UP' : 'DOWN'}
                </span>
                {revealed ? (
                  <span
                    className={`text-[20px] font-bold leading-none ${
                      chosenOpp.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {chosenOpp.label}
                    {chosenOpp.suit}
                  </span>
                ) : (
                  <span className="text-[20px] font-bold text-[var(--text-muted)]">?</span>
                )}
              </div>
            </div>

            {/* 押注筹码选择 */}
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
              <span>本手押注：</span>
              {[1, 2].map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={revealed}
                  onClick={() => setStake(v)}
                  className={`px-2 py-0.5 rounded-full font-semibold tabular-nums ${
                    revealed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  } ${
                    stake === v
                      ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[var(--text-secondary)]'
                  }`}
                >
                  {v} 枚
                </button>
              ))}
            </div>

            {revealed ? (
              <button
                type="button"
                onClick={dealNextRound}
                className="px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                补牌进入下一手
              </button>
            ) : (
              <button
                type="button"
                onClick={handleShowdown}
                className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                翻牌比大小
              </button>
            )}
          </div>

          {/* 对手 2 张手牌（仅亮 UP / DOWN 灯色，翻牌后才揭晓） */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-accent)]">对手手牌（仅见灯色）</span>
              <span className="text-[11px] text-[var(--text-secondary)]">可切换对手出牌</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {oppHand.map((card, idx) => {
                const i = idx as 0 | 1;
                const selected = oppPickIdx === i;
                const showFace = revealed && selected;
                return (
                  <button
                    key={`opp-${i}`}
                    type="button"
                    disabled={revealed}
                    aria-pressed={selected}
                    onClick={() => setOppPickIdx(i)}
                    className={`rounded-xl border p-2.5 flex flex-col items-center gap-2 transition-all ${
                      revealed
                        ? 'border-[var(--border-hairline)] bg-[var(--diagram-panel)] opacity-75 cursor-not-allowed'
                        : selected
                          ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] ring-2 ring-[var(--text-primary)] -translate-y-0.5 cursor-pointer'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-accent)] cursor-pointer'
                    }`}
                  >
                    <LampBadge up={isUpCard(card)} />
                    <div className="text-[18px] font-bold leading-none">
                      {showFace ? (
                        <span
                          className={
                            card.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                          }
                        >
                          {card.label}
                          {card.suit}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">暗牌 ?</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 结算条 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] font-semibold text-center ${
            resultTone === 'mine'
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : resultTone === 'opp'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {resultText}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        桌面灯色只暴露每张牌是 UP（8–A）还是 DOWN（2–7）；正常大牌压小牌，唯独最小的 2 能直接反杀最大的 A。
      </p>
    </div>
  );
}

/* ============================================================================
 * 统一导出表（严格覆盖《赌博默示录》其余 8 场赌局）
 * ========================================================================== */

export const KAIJI_DIAGRAMS: Record<string, ComponentType> = {
  'restricted-rps': RestrictedRpsDiagram,
  'kaiji-steel-beam': SteelBeamDiagram,
  'kaiji-tissue-box': TissueBoxDiagram,
  'kaiji-chinchirorin': ChinchirorinDiagram,
  'the-bog-pachinko': TheBogPachinkoDiagram,
  'minefield-mahjong-17-steps': MinefieldMahjongDiagram,
  'kaiji-salvation': SalvationDiagram,
  'kaiji-one-poker': OnePokerDiagram,
};
