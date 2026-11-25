import { useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Cctv,
  Check,
  Clock,
  Coins,
  Crosshair,
  Crown,
  DoorOpen,
  Droplet,
  Eye,
  EyeOff,
  Flame,
  Footprints,
  Gavel,
  Hand,
  Heart,
  HeartCrack,
  HeartPulse,
  KeyRound,
  Lock,
  Radio,
  RotateCcw,
  Shield,
  Ship,
  Skull,
  Sword,
  Swords,
  Tv,
  Unlock,
  Zap,
} from 'lucide-react';

// ============================================================================
// 1. usogui-oneshot-whip | 筹码猜数
// ============================================================================

function OneshotWhipDiagram() {
  const [round, setRound] = useState<number>(1);
  const [attacker, setAttacker] = useState<'self' | 'rival'>('self');
  const [selfChips, setSelfChips] = useState<number>(3);
  const [rivalChips, setRivalChips] = useState<number>(2);
  const [hideRival, setHideRival] = useState<boolean>(true);
  const [guess, setGuess] = useState<number>(5);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [whipCount, setWhipCount] = useState<[number, number]>([0, 0]);
  const [verdict, setVerdict] = useState<{
    hit: boolean;
    loser: 'self' | 'rival' | null;
    lashes: number;
    text: string;
  }>({
    hit: false,
    loser: null,
    lashes: 0,
    text: '双方各自暗握 0～5 枚筹码，先攻报出总数后点「同时摊手」。',
  });

  const actualTotal = selfChips + rivalChips;

  const handleReveal = () => {
    const hit = guess === actualTotal;
    setRevealed(true);
    if (hit) {
      const loser: 'self' | 'rival' = attacker === 'self' ? 'rival' : 'self';
      const lashes = loser === 'rival' ? rivalChips : selfChips;
      setWhipCount((prev) =>
        loser === 'self' ? [prev[0] + lashes, prev[1]] : [prev[0], prev[1] + lashes]
      );
      setVerdict({
        hit: true,
        loser,
        lashes,
        text: `报数 ${guess} 命中实际总数 ${actualTotal}！${
          attacker === 'self' ? '我方' : '对手'
        }胜出，${loser === 'rival' ? '对手' : '我方'}按所握 ${lashes} 枚筹码承受 ${lashes} 下鞭刑。`,
      });
    } else {
      setVerdict({
        hit: false,
        loser: null,
        lashes: 0,
        text: `报数 ${guess} 未中（实际 ${selfChips} + ${rivalChips} = ${actualTotal}），攻守互换进入下一回合。`,
      });
    }
  };

  const handleNextRound = () => {
    const nextRound = round + 1;
    const nextAttacker: 'self' | 'rival' = attacker === 'self' ? 'rival' : 'self';
    const nextRival = (rivalChips * 3 + nextRound + 1) % 6;
    setRound(nextRound);
    setAttacker(nextAttacker);
    setRivalChips(nextRival);
    setRevealed(false);
    setGuess(nextAttacker === 'self' ? Math.min(10, selfChips + 2) : (selfChips + nextRival + (nextRound % 2)) % 11);
    setVerdict({
      hit: false,
      loser: null,
      lashes: 0,
      text: `第 ${nextRound} 回合：换由${nextAttacker === 'self' ? '我方' : '对手'}先攻报总数。`,
    });
  };

  const handleReset = () => {
    setRound(1);
    setAttacker('self');
    setSelfChips(3);
    setRivalChips(2);
    setHideRival(true);
    setGuess(5);
    setRevealed(false);
    setWhipCount([0, 0]);
    setVerdict({
      hit: false,
      loser: null,
      lashes: 0,
      text: '双方各自暗握 0～5 枚筹码，先攻报出总数后点「同时摊手」。',
    });
  };

  const showRivalCount = !hideRival || revealed;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              第 {round} 回合
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-brass)] font-semibold">
              先攻报数：{attacker === 'self' ? '我方' : '对手'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHideRival((v) => !v)}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {hideRival ? <Eye className="w-3.5 h-3.5" aria-hidden="true" /> : <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />}
              {hideRival ? '透视对手' : '暗握遮蔽'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重置
            </button>
          </div>
        </div>

        {/* 双方暗握区 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-brass)]">
                <Hand className="w-3.5 h-3.5" aria-hidden="true" />
                我方暗握筹码
              </span>
              <span className="tabular-nums font-bold text-[var(--text-primary)]">{selfChips} 枚</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelfChips(n)}
                  className={`py-1.5 rounded-md text-[12px] font-semibold tabular-nums border transition-colors ${
                    selfChips === n
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--text-primary)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  } ${revealed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <span>若落败将挨鞭：{selfChips} 下</span>
              <span className="tabular-nums">累计受鞭：{whipCount[0]}</span>
            </div>
          </div>

          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-accent)]">
                <Hand className="w-3.5 h-3.5" aria-hidden="true" />
                对手暗握筹码
              </span>
              <span className="tabular-nums font-bold text-[var(--text-primary)]">
                {showRivalCount ? `${rivalChips} 枚` : '? 枚（暗握中）'}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={revealed || hideRival}
                  onClick={() => setRivalChips(n)}
                  className={`py-1.5 rounded-md text-[12px] font-semibold tabular-nums border transition-colors ${
                    showRivalCount && rivalChips === n
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                  } ${revealed || hideRival ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-[var(--text-primary)]'}`}
                >
                  {showRivalCount ? n : '?'}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <span>{showRivalCount ? `若落败将挨鞭：${rivalChips} 下` : '摊手后按所握枚数结算鞭刑'}</span>
              <span className="tabular-nums">累计受鞭：{whipCount[1]}</span>
            </div>
          </div>
        </div>

        {/* 先攻报总数 + 摊手动作 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="font-semibold text-[var(--text-primary)]">
              {attacker === 'self' ? '我方申报总数' : '对手申报总数'}
            </span>
            <span className="tabular-nums text-[13px] font-bold text-[var(--diagram-brass)]">
              报 {guess} 枚
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={guess}
            disabled={revealed}
            onChange={(e) => setGuess(Number(e.target.value))}
            className="w-full accent-[var(--diagram-brass)] cursor-pointer disabled:opacity-50"
          />
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] tabular-nums">
            <span>0 枚</span>
            <span>5 枚</span>
            <span>10 枚</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
              <Coins className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              <span>
                {revealed
                  ? `摊手核对：${selfChips} + ${rivalChips} = ${actualTotal}`
                  : '握得越多越难猜中，但一旦落败挨鞭越重'}
              </span>
            </div>
            {revealed ? (
              <button
                type="button"
                onClick={handleNextRound}
                className="px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                换边进入下一回合
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReveal}
                className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                同时摊手验证
              </button>
            )}
          </div>
        </div>

        {/* 结算与鞭刑刻度 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] space-y-2 ${
            verdict.hit
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          <p className="text-center">{verdict.text}</p>
          {verdict.hit && (
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[11px] text-[var(--text-secondary)]">鞭刑数：</span>
              {verdict.lashes === 0 ? (
                <span className="text-[11.5px] font-semibold text-[var(--diagram-brass)]">
                  0 枚空握 · 免受抽打
                </span>
              ) : (
                Array.from({ length: verdict.lashes }).map((_, i) => (
                  <span
                    key={i}
                    className="w-5 h-2 rounded-full bg-[var(--diagram-accent)] inline-block"
                    aria-hidden="true"
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        握 0 枚最安全却容易暴露范围，握满 5 枚能拓宽猜数空间，可一旦被猜中就得承受对应枚数的皮鞭抽打。
      </p>
    </div>
  );
}

// ============================================================================
// 2. usogui-prologue-roulette | 黑市轮盘赌
// ============================================================================

const ROULETTE_WHEEL = [
  { num: 0, color: 'zero' as const },
  { num: 32, color: 'red' as const },
  { num: 15, color: 'black' as const },
  { num: 19, color: 'red' as const },
  { num: 4, color: 'black' as const },
  { num: 21, color: 'red' as const },
  { num: 2, color: 'black' as const },
  { num: 25, color: 'red' as const },
  { num: 17, color: 'black' as const },
  { num: 34, color: 'red' as const },
  { num: 6, color: 'black' as const },
  { num: 27, color: 'red' as const },
  { num: 13, color: 'black' as const },
  { num: 36, color: 'red' as const },
  { num: 11, color: 'black' as const },
  { num: 30, color: 'red' as const },
  { num: 8, color: 'black' as const },
  { num: 23, color: 'red' as const },
];

type RouletteBetType = 'straight' | 'red' | 'black' | 'odd' | 'even';

function PrologueRouletteDiagram() {
  const [betType, setBetType] = useState<RouletteBetType>('straight');
  const [straightNum, setStraightNum] = useState<number>(17);
  const [stake, setStake] = useState<number>(100);
  const [bankroll, setBankroll] = useState<number>(2000);
  const [spinIdx, setSpinIdx] = useState<number>(8);
  const [spinCount, setSpinCount] = useState<number>(0);
  const [status, setStatus] = useState<string>('选择单号或外围区域后，点击「转动轮盘」落槽结算。');

  const landed = ROULETTE_WHEEL[spinIdx] ?? ROULETTE_WHEEL[0];
  const multiplier = betType === 'straight' ? 35 : 1;

  const spin = (forceHit = false) => {
    const nextCount = spinCount + 1;
    let nextIdx: number;
    if (forceHit) {
      const targetIdx = ROULETTE_WHEEL.findIndex((p) => {
        if (betType === 'straight') return p.num === straightNum;
        if (betType === 'red') return p.color === 'red';
        if (betType === 'black') return p.color === 'black';
        if (betType === 'odd') return p.num > 0 && p.num % 2 === 1;
        return p.num > 0 && p.num % 2 === 0;
      });
      nextIdx = targetIdx >= 0 ? targetIdx : 0;
    } else {
      nextIdx = (spinIdx + 5 + nextCount * 3) % ROULETTE_WHEEL.length;
    }

    const slot = ROULETTE_WHEEL[nextIdx] ?? ROULETTE_WHEEL[0];
    const won =
      betType === 'straight'
        ? slot.num === straightNum
        : betType === 'red'
          ? slot.color === 'red'
          : betType === 'black'
            ? slot.color === 'black'
            : betType === 'odd'
              ? slot.num > 0 && slot.num % 2 === 1
              : slot.num > 0 && slot.num % 2 === 0;

    const delta = won ? stake * multiplier : -stake;
    setSpinIdx(nextIdx);
    setSpinCount(nextCount);
    setBankroll((b) => Math.max(0, b + delta));
    const colorText = slot.color === 'zero' ? '零位' : slot.color === 'red' ? '红' : '黑';
    setStatus(
      won
        ? `小球落入 ${slot.num}（${colorText}）！按 ${multiplier}:1 赔付，赢得 +${(stake * multiplier).toLocaleString()} 筹码。`
        : `小球落入 ${slot.num}（${colorText}），未押中所选区域，损失 ${stake.toLocaleString()} 筹码。`
    );
  };

  const reset = () => {
    setBetType('straight');
    setStraightNum(17);
    setStake(100);
    setBankroll(2000);
    setSpinIdx(8);
    setSpinCount(0);
    setStatus('选择单号或外围区域后，点击「转动轮盘」落槽结算。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              持有筹码：{bankroll.toLocaleString()}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-brass)] tabular-nums">
              当前赔率 {multiplier}:1
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-center">
          {/* SVG 轮盘示意图 */}
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 180 180" className="w-[172px] h-[172px] select-none" role="img" aria-label="黑市轮盘转盘">
              <circle cx="90" cy="90" r="82" fill="var(--diagram-panel)" stroke="var(--diagram-brass)" strokeWidth="2.5" />
              <circle cx="90" cy="90" r="56" fill="var(--diagram-surface)" stroke="var(--diagram-border)" strokeWidth="1.5" />
              {ROULETTE_WHEEL.map((slot, i) => {
                const angle = (i / ROULETTE_WHEEL.length) * Math.PI * 2 - Math.PI / 2;
                const x = 90 + Math.cos(angle) * 69;
                const y = 90 + Math.sin(angle) * 69;
                const active = i === spinIdx;
                return (
                  <g key={slot.num}>
                    <circle
                      cx={x}
                      cy={y}
                      r={active ? 10 : 7.5}
                      fill={
                        slot.color === 'zero'
                          ? 'var(--diagram-brass)'
                          : slot.color === 'red'
                            ? 'var(--diagram-accent)'
                            : 'var(--diagram-surface)'
                      }
                      stroke={active ? 'var(--text-primary)' : 'var(--diagram-border)'}
                      strokeWidth={active ? 2 : 1}
                    />
                    <text
                      x={x}
                      y={y + 3.5}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="700"
                      fill={
                        slot.color === 'black'
                          ? 'var(--text-primary)'
                          : slot.color === 'zero'
                            ? 'var(--btn-primary-fg)'
                            : 'var(--accent-fg)'
                      }
                    >
                      {slot.num}
                    </text>
                  </g>
                );
              })}
              <text x="90" y="86" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text-primary)">
                {landed.num}
              </text>
              <text x="90" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--diagram-brass)">
                {landed.color === 'zero' ? '0 零位' : landed.color === 'red' ? '红槽' : '黑槽'}
              </text>
            </svg>
          </div>

          {/* 押注区 */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {(
                [
                  { id: 'straight', label: `单号 ${straightNum}`, odds: '35:1' },
                  { id: 'red', label: '红区', odds: '1:1' },
                  { id: 'black', label: '黑区', odds: '1:1' },
                  { id: 'odd', label: '单数', odds: '1:1' },
                  { id: 'even', label: '双数', odds: '1:1' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBetType(item.id)}
                  className={`rounded-lg px-2.5 py-2 border text-center transition-colors cursor-pointer ${
                    betType === item.id
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--text-primary)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="text-[12px] font-semibold">{item.label}</div>
                  <div className="text-[10.5px] text-[var(--diagram-brass)] tabular-nums">{item.odds}</div>
                </button>
              ))}
            </div>

            {betType === 'straight' && (
              <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-2.5 space-y-1.5">
                <div className="text-[11px] text-[var(--text-secondary)]">点选要直押的精确单号（35 倍赔付）</div>
                <div className="flex flex-wrap gap-1.5">
                  {[0, 17, 23, 32, 8, 36].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setStraightNum(num)}
                      className={`px-2.5 py-1 rounded-md text-[12px] font-bold tabular-nums border cursor-pointer ${
                        straightNum === num
                          ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
                <span>下注：</span>
                {[100, 300, 500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setStake(v)}
                    className={`px-2 py-0.5 rounded-full tabular-nums font-semibold cursor-pointer ${
                      stake === v
                        ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                        : 'bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => spin(false)}
                  className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
                >
                  转动轮盘
                </button>
                <button
                  type="button"
                  onClick={() => spin(true)}
                  className="px-3 py-1.5 rounded-full border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))] text-[var(--diagram-brass)] text-[11.5px] font-semibold hover:opacity-90 cursor-pointer"
                >
                  演示命中
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg px-3.5 py-2.5 border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[12.5px] text-[var(--text-primary)] text-center">
          {status}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        外围红黑单双赔率低但命中面广，精确单号赔率高达 35:1；落入 0 号零位时所有外围红黑单双均判庄家通吃。
      </p>
    </div>
  );
}

// ============================================================================
// 3. abandoned-building | 废弃大厦逃出
// ============================================================================

interface BuildingRoom {
  id: string;
  floor: number;
  col: number;
  name: string;
  hasCctv?: boolean;
  isExit?: boolean;
  isMonitorRoom?: boolean;
  neighbors: string[];
}

const BUILDING_ROOMS: BuildingRoom[] = [
  { id: '3-0', floor: 3, col: 0, name: '3F 入口', neighbors: ['3-1', '2-0'] },
  { id: '3-1', floor: 3, col: 1, name: '3F 东走廊', hasCctv: true, neighbors: ['3-0', '3-2'] },
  { id: '3-2', floor: 3, col: 2, name: '3F 管道井', neighbors: ['3-1', '2-2'] },
  { id: '3-3', floor: 3, col: 3, name: '3F 监控室', isMonitorRoom: true, neighbors: ['2-3'] },
  { id: '2-0', floor: 2, col: 0, name: '2F 破旧楼梯', neighbors: ['3-0', '2-1', '1-0'] },
  { id: '2-1', floor: 2, col: 1, name: '2F 会议厅', hasCctv: true, neighbors: ['2-0', '2-2', '1-1'] },
  { id: '2-2', floor: 2, col: 2, name: '2F 盲区夹道', neighbors: ['3-2', '2-1', '2-3', '1-2'] },
  { id: '2-3', floor: 2, col: 3, name: '2F 货梯厅', hasCctv: true, neighbors: ['2-2', '1-3'] },
  { id: '1-0', floor: 1, col: 0, name: '1F 杂物间', neighbors: ['2-0', '1-1'] },
  { id: '1-1', floor: 1, col: 1, name: '1F 主走廊', hasCctv: true, neighbors: ['2-1', '1-0', '1-2'] },
  { id: '1-2', floor: 1, col: 2, name: '1F 侧门暗廊', neighbors: ['2-2', '1-1', '1-3'] },
  { id: '1-3', floor: 1, col: 3, name: '1F 大楼出口', isExit: true, neighbors: ['2-3', '1-2'] },
];

function AbandonedBuildingDiagram() {
  const [pos, setPos] = useState<string>('3-0');
  const [guardPos, setGuardPos] = useState<string>('1-1');
  const [path, setPath] = useState<string[]>(['3-0']);
  const [spotted, setSpotted] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<'playing' | 'escaped' | 'caught'>('playing');
  const [log, setLog] = useState<string>('点击相邻高亮房间移动，绕开闭路电视监控与无线电调度的追兵，逃至 1F 大楼出口。');

  const currentRoom = BUILDING_ROOMS.find((r) => r.id === pos) ?? BUILDING_ROOMS[0];

  const moveTo = (targetId: string) => {
    if (outcome !== 'playing') return;
    if (!currentRoom.neighbors.includes(targetId)) return;

    const target = BUILDING_ROOMS.find((r) => r.id === targetId);
    if (!target) return;

    const nextPath = [...path, targetId];
    setPos(targetId);
    setPath(nextPath);

    if (targetId === guardPos) {
      setOutcome('caught');
      setLog(`闯入「${target.name}」撞上巡逻打手！挑战方被拦截，防守方胜出。`);
      return;
    }

    if (target.isExit) {
      setOutcome('escaped');
      setLog(`成功穿过「${target.name}」逃出废弃大厦！挑战方存活脱身获胜。`);
      return;
    }

    // 监控室判断与无线电指挥拦截
    const isCamera = Boolean(target.hasCctv);
    setSpotted(isCamera);

    const guardRoom = BUILDING_ROOMS.find((r) => r.id === guardPos);
    let nextGuard = guardPos;
    if (guardRoom) {
      if (isCamera) {
        // 监控发现位置，打手朝向玩家当前坐标逼近一步
        let bestId = guardPos;
        let bestDist = Infinity;
        for (const nbId of guardRoom.neighbors) {
          const nb = BUILDING_ROOMS.find((r) => r.id === nbId);
          if (!nb || nb.isMonitorRoom) continue;
          const dist = Math.abs(nb.floor - target.floor) + Math.abs(nb.col - target.col);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = nbId;
          }
        }
        nextGuard = bestId;
      } else {
        // 未被监控拍到，打手只在 1F-2F 固定巡逻
        const patrol = ['1-1', '2-1', '1-2', '1-1'];
        const curIdx = patrol.indexOf(guardPos);
        nextGuard = patrol[(curIdx + 1) % patrol.length] ?? '1-1';
      }
    }

    setGuardPos(nextGuard);

    if (nextGuard === targetId) {
      setOutcome('caught');
      setLog(`「${target.name}」的闭路电视锁定行踪，防守方经无线电调兵完成包夹拦截！`);
      return;
    }

    const guardNextRoom = BUILDING_ROOMS.find((r) => r.id === nextGuard);
    setLog(
      isCamera
        ? `进入「${target.name}」触发监控画面！监控室无线电指挥打手移至「${guardNextRoom?.name ?? ''}」。`
        : `潜入监控盲区「${target.name}」，监控室失去实时画面，打手移至「${guardNextRoom?.name ?? ''}」。`
    );
  };

  const reset = () => {
    setPos('3-0');
    setGuardPos('1-1');
    setPath(['3-0']);
    setSpotted(false);
    setOutcome('playing');
    setLog('点击相邻高亮房间移动，绕开闭路电视监控与无线电调度的追兵，逃至 1F 大楼出口。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">
              当前：{currentRoom.name}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                spotted
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--diagram-brass)]'
              }`}
            >
              <Radio className="w-3 h-3" aria-hidden="true" />
              {spotted ? '闭路电视已锁定 · 无线电调兵中' : '处于监控盲区'}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置路线
          </button>
        </div>

        {/* 3 层楼面平面图 */}
        <div className="space-y-2">
          {[3, 2, 1].map((floor) => (
            <div key={floor} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BUILDING_ROOMS.filter((r) => r.floor === floor).map((room) => {
                const isHere = pos === room.id;
                const isGuard = guardPos === room.id;
                const reachable = outcome === 'playing' && currentRoom.neighbors.includes(room.id) && !room.isMonitorRoom;
                const visited = path.includes(room.id);

                return (
                  <button
                    key={room.id}
                    type="button"
                    disabled={!reachable}
                    onClick={() => moveTo(room.id)}
                    className={`rounded-lg p-2.5 border text-left transition-all ${
                      isHere
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_22%,var(--diagram-panel))] ring-1 ring-[var(--diagram-brass)]'
                        : isGuard
                          ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))]'
                          : room.isExit
                            ? 'border-[var(--diagram-brass)]/70 bg-[color-mix(in_srgb,var(--diagram-brass)_10%,var(--diagram-panel))]'
                            : reachable
                              ? 'border-[var(--text-primary)]/45 bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)]'
                              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]/75'
                    } ${reachable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11.5px] font-semibold text-[var(--text-primary)] truncate">
                        {room.name}
                      </span>
                      {room.hasCctv && (
                        <Cctv className="w-3.5 h-3.5 shrink-0 text-[var(--diagram-accent)]" aria-hidden="true" />
                      )}
                      {room.isExit && (
                        <DoorOpen className="w-3.5 h-3.5 shrink-0 text-[var(--diagram-brass)]" aria-hidden="true" />
                      )}
                      {room.isMonitorRoom && (
                        <Tv className="w-3.5 h-3.5 shrink-0 text-[var(--text-secondary)]" aria-hidden="true" />
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
                      {isHere ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[var(--diagram-brass)]">
                          <Footprints className="w-3 h-3" aria-hidden="true" />
                          挑战方在此
                        </span>
                      ) : isGuard ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[var(--diagram-accent)]">
                          <Skull className="w-3 h-3" aria-hidden="true" />
                          追兵拦截
                        </span>
                      ) : room.isMonitorRoom ? (
                        <span className="text-[var(--text-secondary)]">防守方坐镇</span>
                      ) : reachable ? (
                        <span className="text-[var(--text-primary)] font-medium">可移动至此 →</span>
                      ) : visited ? (
                        <span className="text-[var(--text-muted)]">已途经</span>
                      ) : (
                        <span className="text-[var(--text-secondary)]">
                          {room.hasCctv ? '监控覆盖' : '监控盲区'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] text-center ${
            outcome === 'escaped'
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
              : outcome === 'caught'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        防守方靠监控室与无线电指挥围堵；挑战方避开闭路电视视野、利用盲区与垂直通道脱出大楼即可获胜。
      </p>
    </div>
  );
}

// ============================================================================
// 4. usogui-poker-shark | 七张梭哈
// ============================================================================

interface StudCard {
  id: number;
  rank: string;
  suit: '♠' | '♥' | '♦' | '♣';
  red?: boolean;
  val: number;
}

const STUD_LINE: StudCard[] = [
  { id: 1, rank: 'A', suit: '♠', val: 14 },
  { id: 2, rank: 'K', suit: '♥', red: true, val: 13 },
  { id: 3, rank: '9', suit: '♣', val: 9 },
  { id: 4, rank: 'A', suit: '♦', red: true, val: 14 },
  { id: 5, rank: 'J', suit: '♠', val: 11 },
  { id: 6, rank: 'K', suit: '♣', val: 13 },
  { id: 7, rank: '7', suit: '♥', red: true, val: 7 },
  { id: 8, rank: 'Q', suit: '♠', val: 12 },
  { id: 9, rank: 'A', suit: '♣', val: 14 },
  { id: 10, rank: '10', suit: '♦', red: true, val: 10 },
  { id: 11, rank: 'K', suit: '♠', val: 13 },
  { id: 12, rank: 'J', suit: '♥', red: true, val: 11 },
  { id: 13, rank: 'Q', suit: '♦', red: true, val: 12 },
  { id: 14, rank: '8', suit: '♠', val: 8 },
];

function evaluateStudHand(cards: StudCard[]): string {
  if (cards.length < 2) return '继续从两端取牌';
  const counts = new Map<number, number>();
  for (const c of cards) {
    counts.set(c.val, (counts.get(c.val) ?? 0) + 1);
  }
  const freq = Array.from(counts.values()).sort((a, b) => b - a);
  if ((freq[0] ?? 0) >= 4) return '四条';
  if ((freq[0] ?? 0) === 3 && (freq[1] ?? 0) >= 2) return '葫芦';
  if ((freq[0] ?? 0) === 3) return '三条';
  if ((freq[0] ?? 0) === 2 && (freq[1] ?? 0) >= 2) return '两对';
  if ((freq[0] ?? 0) === 2) return '一对';
  return '高牌';
}

function PokerSharkDiagram() {
  const [leftIdx, setLeftIdx] = useState<number>(0);
  const [rightIdx, setRightIdx] = useState<number>(STUD_LINE.length - 1);
  const [myHand, setMyHand] = useState<StudCard[]>([]);
  const [rivalHand, setRivalHand] = useState<StudCard[]>([]);
  const [exposeCheat, setExposeCheat] = useState<boolean>(false);

  const canDraw = myHand.length < 7 && leftIdx <= rightIdx && !exposeCheat;
  const remainingTotal = Math.max(0, 52 - myHand.length - rivalHand.length);

  const drawFrom = (side: 'left' | 'right') => {
    if (!canDraw) return;
    let l = leftIdx;
    let r = rightIdx;
    const myCard = side === 'left' ? STUD_LINE[l++] : STUD_LINE[r--];
    const rivalCard = side === 'left' ? STUD_LINE[r--] : STUD_LINE[l++];
    if (myCard) setMyHand((prev) => [...prev, myCard]);
    if (rivalCard) setRivalHand((prev) => [...prev, rivalCard]);
    setLeftIdx(l);
    setRightIdx(r);
  };

  const reset = () => {
    setLeftIdx(0);
    setRightIdx(STUD_LINE.length - 1);
    setMyHand([]);
    setRivalHand([]);
    setExposeCheat(false);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">
            桌面 52 张排成一列 · 余 {remainingTotal} 张（取消荷官发牌）
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setExposeCheat((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-semibold border cursor-pointer transition-colors ${
                exposeCheat
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Gavel className="w-3.5 h-3.5" aria-hidden="true" />
              {exposeCheat ? '取消抓千演示' : '揭发抓千制裁'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重排
            </button>
          </div>
        </div>

        {/* 52 张一列牌阵示意 + 两端取牌按钮 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={!canDraw}
              onClick={() => drawFrom('left')}
              className="px-3 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[11.5px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer shrink-0"
            >
              ← 从左端取牌
            </button>

            <div className="flex-1 flex items-center justify-center gap-0.5 overflow-hidden px-1" aria-hidden="true">
              {Array.from({ length: 24 }).map((_, i) => {
                const takenLeft = i < leftIdx;
                const takenRight = i >= 24 - (STUD_LINE.length - 1 - rightIdx);
                const gone = takenLeft || takenRight;
                const isEdge = !gone && (i === leftIdx || i === 24 - (STUD_LINE.length - 1 - rightIdx) - 1);
                return (
                  <span
                    key={i}
                    className={`h-8 flex-1 max-w-[10px] rounded-[2px] border transition-all ${
                      gone
                        ? 'border-transparent bg-transparent'
                        : isEdge
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_30%,var(--diagram-surface))]'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)]'
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              disabled={!canDraw}
              onClick={() => drawFrom('right')}
              className="px-3 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[11.5px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer shrink-0"
            >
              从右端取牌 →
            </button>
          </div>
          <div className="text-center text-[11px] text-[var(--text-secondary)]">
            双方按顺序轮流从牌列最左或最右端自行抓牌，凑齐 7 张取最优 5 张比牌型
          </div>
        </div>

        {/* 抓千揭发态 or 双方七张手牌 */}
        {exposeCheat ? (
          <div className="rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] p-4 space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--diagram-accent)]">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              立会人介入 · 当场查获出千铁证
            </div>
            <p className="text-[12px] text-[var(--text-primary)] leading-relaxed">
              牌局虽不设「禁止出千」条文，但在赌郎立会人监督下，一旦作弊手法被对手掌握铁证当场揭发，作弊方立即失去胜负资格并承受立会人制裁。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(
              [
                { title: '我方手牌', hand: myHand, tone: 'text-[var(--diagram-brass)]' },
                { title: '对手手牌', hand: rivalHand, tone: 'text-[var(--diagram-accent)]' },
              ] as const
            ).map((side) => (
              <div key={side.title} className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className={`font-semibold ${side.tone}`}>{side.title}（{side.hand.length}/7）</span>
                  <span className="text-[11.5px] font-semibold text-[var(--text-primary)]">
                    {evaluateStudHand(side.hand)}
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1 min-h-[48px]">
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const c = side.hand[idx];
                    return c ? (
                      <div
                        key={c.id}
                        className="h-12 rounded-md border border-[var(--diagram-border)] bg-[var(--diagram-surface)] flex flex-col items-center justify-center"
                      >
                        <span className={`text-[12px] font-bold leading-none ${c.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'}`}>
                          {c.rank}
                        </span>
                        <span className={`text-[11px] leading-none mt-0.5 ${c.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-secondary)]'}`}>
                          {c.suit}
                        </span>
                      </div>
                    ) : (
                      <div
                        key={idx}
                        className="h-12 rounded-md border border-dashed border-[var(--diagram-border)] bg-[var(--bg-page)]/35"
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        取消荷官发牌后，牌列两端皆由玩家亲手抓取；既要比七张梭哈的牌型与加注，也要防范并在铁证确凿时揭发暗手。
      </p>
    </div>
  );
}

// ============================================================================
// 5. hangman-old-maid | 抽鬼牌
// ============================================================================

interface OldMaidCard {
  id: string;
  rank: string;
  isJoker?: boolean;
}

const INITIAL_MY_MAID: OldMaidCard[] = [
  { id: 'm-q', rank: 'Q♠' },
  { id: 'm-9', rank: '9♦' },
  { id: 'm-4', rank: '4♣' },
];

const INITIAL_RIVAL_MAID: OldMaidCard[] = [
  { id: 'r-q', rank: 'Q♥' },
  { id: 'r-joker', rank: '鬼牌', isJoker: true },
  { id: 'r-9', rank: '9♠' },
  { id: 'r-4', rank: '4♥' },
];

function rankKey(rank: string) {
  return rank === '鬼牌' ? 'JOKER' : rank.slice(0, -1);
}

function HangmanOldMaidDiagram() {
  const [myCards, setMyCards] = useState<OldMaidCard[]>(INITIAL_MY_MAID);
  const [rivalCards, setRivalCards] = useState<OldMaidCard[]>(INITIAL_RIVAL_MAID);
  const [myNoose, setMyNoose] = useState<number>(1);
  const [rivalNoose, setRivalNoose] = useState<number>(1);
  const [log, setLog] = useState<string>('点击上方对手的背面手牌抽取 1 张：凑对即弃牌并拉紧对手绞索一档。');

  const finished = myCards.length === 0 || rivalCards.length === 0;
  const playerWon = myCards.length === 0 && rivalCards.length === 1 && Boolean(rivalCards[0]?.isJoker);
  const rivalWon = rivalCards.length === 0 && myCards.length === 1 && Boolean(myCards[0]?.isJoker);

  const drawFromRival = (idx: number) => {
    if (finished) return;
    const picked = rivalCards[idx];
    if (!picked) return;

    let nextRival = rivalCards.filter((_, i) => i !== idx);
    let nextMy = [...myCards];
    let nextMyNoose = myNoose;
    let nextRivalNoose = rivalNoose;
    let msg = '';

    // 我方抽取判定
    const matchIdx = picked.isJoker
      ? -1
      : nextMy.findIndex((c) => !c.isJoker && rankKey(c.rank) === rankKey(picked.rank));

    if (matchIdx >= 0) {
      const matched = nextMy[matchIdx];
      nextMy = nextMy.filter((_, i) => i !== matchIdx);
      nextRivalNoose = Math.min(4, nextRivalNoose + 1);
      msg = `你抽到 ${picked.rank}，与 ${matched?.rank ?? ''} 凑成一对弃掉！对手绞索收紧至 ${nextRivalNoose}/4 档。`;
    } else {
      nextMy = [...nextMy, picked];
      msg = picked.isJoker
        ? '你抽中了「鬼牌」！无法配对，只能留在手中。'
        : `你抽到 ${picked.rank}，暂未凑成对子。`;
    }

    // 检查是否已分胜负
    if (nextMy.length === 0 || nextRival.length === 0) {
      if (nextMy.length === 0) nextRivalNoose = 4;
      if (nextRival.length === 0) nextMyNoose = 4;
      setMyCards(nextMy);
      setRivalCards(nextRival);
      setMyNoose(nextMyNoose);
      setRivalNoose(nextRivalNoose);
      setLog(
        nextMy.length === 0
          ? `${msg} 我方清空手牌，对手独留鬼牌触发最终绞刑！`
          : `${msg} 对手清空手牌，我方独留鬼牌触发最终绞刑！`
      );
      return;
    }

    // 对手反抽我方 1 张（确定性选择索引，优先避开或按位置轮抽）
    const rivalPickIdx = (nextMy.length + nextRival.length) % nextMy.length;
    const rivalPicked = nextMy[rivalPickIdx];
    if (rivalPicked) {
      nextMy = nextMy.filter((_, i) => i !== rivalPickIdx);
      const rivalMatchIdx = rivalPicked.isJoker
        ? -1
        : nextRival.findIndex((c) => !c.isJoker && rankKey(c.rank) === rankKey(rivalPicked.rank));

      if (rivalMatchIdx >= 0) {
        nextRival = nextRival.filter((_, i) => i !== rivalMatchIdx);
        nextMyNoose = Math.min(4, nextMyNoose + 1);
        msg += ` 对手随后反抽并凑成一对，我方绞索收紧至 ${nextMyNoose}/4 档。`;
      } else {
        nextRival = [...nextRival, rivalPicked];
        msg += rivalPicked.isJoker
          ? ' 对手随后反抽，抽走了你手中的鬼牌！'
          : ' 对手随后反抽 1 张，未凑成对子。';
      }
    }

    if (nextMy.length === 0) nextRivalNoose = 4;
    if (nextRival.length === 0) nextMyNoose = 4;

    setMyCards(nextMy);
    setRivalCards(nextRival);
    setMyNoose(nextMyNoose);
    setRivalNoose(nextRivalNoose);
    setLog(msg);
  };

  const reset = () => {
    setMyCards(INITIAL_MY_MAID);
    setRivalCards(INITIAL_RIVAL_MAID);
    setMyNoose(1);
    setRivalNoose(1);
    setLog('点击上方对手的背面手牌抽取 1 张：凑对即弃牌并拉紧对手绞索一档。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            残局演练 · 剩余 {myCards.length + rivalCards.length} 张牌（含 1 张鬼牌）
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新发牌
          </button>
        </div>

        {/* 双方绞索进度 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              { label: '对手绞索松紧', level: rivalNoose, danger: playerWon || rivalNoose >= 4 },
              { label: '我方绞索松紧', level: myNoose, danger: rivalWon || myNoose >= 4 },
            ] as const
          ).map((item) => (
            <div key={item.label} className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[var(--text-primary)]">{item.label}</span>
                <span className={`tabular-nums font-bold ${item.danger ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'}`}>
                  {item.level >= 4 ? '4 / 4 · 触发绞刑' : `${item.level} / 4 档`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-colors ${
                      step <= item.level
                        ? step === 4 || item.danger
                          ? 'bg-[var(--diagram-accent)]'
                          : 'bg-[var(--diagram-brass)]'
                        : 'bg-[var(--diagram-surface)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 对手背面手牌（点击抽取） */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[var(--diagram-accent)]">对手手牌（点击背面抽取）</span>
            <span className="text-[var(--text-secondary)] tabular-nums">余 {rivalCards.length} 张</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {rivalCards.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                disabled={finished}
                onClick={() => drawFromRival(idx)}
                className={`w-[58px] h-[78px] rounded-lg border flex flex-col items-center justify-center transition-all ${
                  finished && c.isJoker
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:border-[var(--diagram-brass)] hover:-translate-y-0.5'
                } ${finished ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="text-[14px] font-bold">{finished ? c.rank : '?'}</span>
                <span className="text-[10px] mt-1">{finished ? '留鬼判负' : `第 ${idx + 1} 张`}</span>
              </button>
            ))}
            {rivalCards.length === 0 && (
              <div className="text-[12px] text-[var(--diagram-accent)] font-semibold py-4">对手手牌已清空</div>
            )}
          </div>
        </div>

        {/* 我方手牌 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[var(--diagram-brass)]">我方当前手牌</span>
            <span className="text-[var(--text-secondary)] tabular-nums">余 {myCards.length} 张</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {myCards.map((c) => (
              <div
                key={c.id}
                className={`w-[58px] h-[78px] rounded-lg border flex flex-col items-center justify-center ${
                  c.isJoker
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                    : 'border-[var(--diagram-brass)]/55 bg-[var(--diagram-panel)] text-[var(--text-primary)]'
                }`}
              >
                <span className="text-[13px] font-bold">{c.rank}</span>
                {c.isJoker && <Skull className="w-3.5 h-3.5 mt-1" aria-hidden="true" />}
              </div>
            ))}
            {myCards.length === 0 && (
              <div className="text-[12px] text-[var(--diagram-brass)] font-semibold py-4">我方已清空全部手牌！</div>
            )}
          </div>
        </div>

        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] text-center ${
            playerWon
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
              : rivalWon
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        每次凑成对子不仅减少手牌，还会立刻拉紧对手一档绞索；最后手里独留鬼牌的一方立即触发绞刑。
      </p>
    </div>
  );
}

// ============================================================================
// 6. labyrinth-zero | 纸迷宫
// ============================================================================

// 5×5 纸迷宫（演示 6×6 暗墙机制的紧凑可玩版）：用 "r,c-r2,c2" 表示相邻两格间的隐藏暗墙
const LABYRINTH_WALLS = new Set<string>([
  '0,1-0,2', '0,2-0,1',
  '1,0-1,1', '1,1-1,0',
  '1,1-2,1', '2,1-1,1',
  '1,3-1,4', '1,4-1,3',
  '2,2-2,3', '2,3-2,2',
  '2,3-3,3', '3,3-2,3',
  '3,1-3,2', '3,2-3,1',
  '3,4-4,4', '4,4-3,4',
  '4,2-4,3', '4,3-4,2',
]);

function wallKey(r1: number, c1: number, r2: number, c2: number) {
  return `${r1},${c1}-${r2},${c2}`;
}

function LabyrinthZeroDiagram() {
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [mpPool, setMpPool] = useState<number>(18);
  const [wager, setWager] = useState<number>(2);
  const [foundWalls, setFoundWalls] = useState<string[]>([]);
  const [collisions, setCollisions] = useState<number>(0);
  const [peekWalls, setPeekWalls] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [log, setLog] = useState<string>('先选投入 MP（含 0 点特例），再选方向试探走格；撞到隐藏暗墙会立刻停步受罚。');

  const moveDir = (dr: number, dc: number, dirLabel: string) => {
    if (won) return;
    if (wager > mpPool) {
      setLog('剩余 MP 不足，请调低本回合投入点数。');
      return;
    }

    if (wager === 0) {
      setLog('投入 0 MP 触发特例：原地停留不移动，让出先手以试探对手消耗并避免盲撞暗墙。');
      return;
    }

    let [r, c] = pos;
    let moved = 0;
    let hitWallKey: string | null = null;

    for (let step = 0; step < wager; step++) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= 5 || nc < 0 || nc >= 5) {
        hitWallKey = 'BOUNDARY';
        break;
      }
      const wk = wallKey(r, c, nr, nc);
      if (LABYRINTH_WALLS.has(wk)) {
        hitWallKey = wk;
        break;
      }
      r = nr;
      c = nc;
      moved++;
      if (r === 4 && c === 4) break;
    }

    setMpPool((m) => Math.max(0, m - wager));
    setPos([r, c]);

    if (r === 4 && c === 4) {
      setWon(true);
      setLog(`投入 ${wager} MP 向${dirLabel}推进 ${moved} 格，成功抵达迷宫终点获胜！`);
      return;
    }

    if (hitWallKey && hitWallKey !== 'BOUNDARY') {
      setCollisions((k) => k + 1);
      setFoundWalls((prev) => (prev.includes(hitWallKey!) ? prev : [...prev, hitWallKey!]));
      setLog(`投入 ${wager} MP 向${dirLabel}走 ${moved} 格后撞上隐藏暗墙！立即停步并记 1 次撞墙罚则。`);
    } else if (hitWallKey === 'BOUNDARY') {
      setCollisions((k) => k + 1);
      setLog(`向${dirLabel}触碰棋盘外缘，走 ${moved} 格后停步。`);
    } else {
      setLog(`投入 ${wager} MP 向${dirLabel}畅通推进 ${moved} 格，当前位于 (${r + 1}, ${c + 1})。`);
    }
  };

  const reset = () => {
    setPos([0, 0]);
    setMpPool(18);
    setWager(2);
    setFoundWalls([]);
    setCollisions(0);
    setPeekWalls(false);
    setWon(false);
    setLog('先选投入 MP（含 0 点特例），再选方向试探走格；撞到隐藏暗墙会立刻停步受罚。');
  };

  const hasVisibleWall = (r1: number, c1: number, r2: number, c2: number) => {
    const k = wallKey(r1, c1, r2, c2);
    const rk = wallKey(r2, c2, r1, c1);
    return (peekWalls && LABYRINTH_WALLS.has(k)) || foundWalls.includes(k) || foundWalls.includes(rk);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              剩余 MP：{mpPool}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-accent)] tabular-nums">
              撞墙受罚：{collisions} 次
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPeekWalls((v) => !v)}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {peekWalls ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
              {peekWalls ? '隐藏暗墙' : '透视暗墙'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重置
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-center">
          {/* 暗墙纸迷宫网格 */}
          <div className="grid grid-cols-5 border-2 border-[var(--diagram-border)] rounded-lg overflow-hidden bg-[var(--diagram-panel)] max-w-[220px] mx-auto w-full">
            {Array.from({ length: 25 }).map((_, idx) => {
              const r = Math.floor(idx / 5);
              const c = idx % 5;
              const isHere = pos[0] === r && pos[1] === c;
              const isGoal = r === 4 && c === 4;
              const wallRight = c < 4 && hasVisibleWall(r, c, r, c + 1);
              const wallBottom = r < 4 && hasVisibleWall(r, c, r + 1, c);

              return (
                <div
                  key={idx}
                  className={`h-[42px] flex items-center justify-center text-[11px] font-bold border-r border-b border-[var(--border-hairline)] relative ${
                    isHere
                      ? 'bg-[color-mix(in_srgb,var(--diagram-brass)_26%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                      : isGoal
                        ? 'bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                        : 'text-[var(--text-muted)]'
                  }`}
                  style={{
                    borderRightColor: wallRight ? 'var(--diagram-accent)' : undefined,
                    borderRightWidth: wallRight ? '3px' : undefined,
                    borderBottomColor: wallBottom ? 'var(--diagram-accent)' : undefined,
                    borderBottomWidth: wallBottom ? '3px' : undefined,
                  }}
                >
                  {isHere ? '棋' : isGoal ? '终' : r === 0 && c === 0 ? '起' : ''}
                </div>
              );
            })}
          </div>

          {/* 投入 MP 与方向控制 */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="text-[12px] font-semibold text-[var(--text-primary)]">
                1. 秘密投入行动点数（MP）
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setWager(v)}
                    className={`py-2 rounded-lg border text-[12px] font-semibold tabular-nums cursor-pointer transition-colors ${
                      wager === v
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--text-primary)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {v === 0 ? '0 (特例)' : `${v} MP`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[12px] font-semibold text-[var(--text-primary)]">
                2. 选择前进方向（最多走 {wager} 格）
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    { dr: -1, dc: 0, label: '上', Icon: ArrowUp },
                    { dr: 1, dc: 0, label: '下', Icon: ArrowDown },
                    { dr: 0, dc: -1, label: '左', Icon: ArrowLeft },
                    { dr: 0, dc: 1, label: '右', Icon: ArrowRight },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    disabled={won}
                    onClick={() => moveDir(d.dr, d.dc, d.label)}
                    className="inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[12px] font-semibold text-[var(--text-primary)] hover:border-[var(--diagram-brass)] disabled:opacity-45 cursor-pointer"
                  >
                    <d.Icon className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] text-center ${
            won
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        对手在格线间暗藏墙壁，投入高 MP 虽能夺先手并多走格数，但一旦撞墙便会白耗步数并触发罚则；0 MP 则是改变节奏的特例条款。
      </p>
    </div>
  );
}

// ============================================================================
// 7. bulls-womb | 公牛子宫
// ============================================================================

const BULL_SECRETS = [63, 27, 84, 41];

function BullsWombDiagram() {
  const [seedIdx, setSeedIdx] = useState<number>(0);
  const [guess, setGuess] = useState<number>(50);
  const [minBound, setMinBound] = useState<number>(0);
  const [maxBound, setMaxBound] = useState<number>(99);
  const [temp, setTemp] = useState<number>(55);
  const [chips, setChips] = useState<number>(1000);
  const [bet, setBet] = useState<number>(200);
  const [status, setStatus] = useState<'playing' | 'rescued' | 'overheat'>('playing');
  const [log, setLog] = useState<string>('调整密码并下注提交猜测：系统反馈高低提示，猜错或弃牌都会让铜牛持续升温。');

  const secret = BULL_SECRETS[seedIdx % BULL_SECRETS.length] ?? 63;

  const submitGuess = () => {
    if (status !== 'playing') return;
    if (guess === secret) {
      setStatus('rescued');
      setChips((c) => c + bet);
      setLog(`准确命中对手秘密密码 ${String(secret).padStart(2, '0')}！立即解除铜牛锁具并救出人质，赢得 +${bet} 筹码。`);
      return;
    }

    const nextTemp = Math.min(200, temp + 30);
    const nextChips = Math.max(0, chips - bet);
    setTemp(nextTemp);
    setChips(nextChips);

    if (guess < secret) {
      setMinBound((m) => Math.max(m, guess + 1));
    } else {
      setMaxBound((m) => Math.min(m, guess - 1));
    }

    if (nextTemp >= 200) {
      setStatus('overheat');
      setLog(`猜测 ${guess} 未中（目标${guess < secret ? '更高 ↑' : '更低 ↓'}），铜牛温度飙升至 200°C 临界线，营救失败！`);
    } else {
      setLog(
        `猜测 ${guess} 偏${guess < secret ? '低 ↑（目标更大）' : '高 ↓（目标更小）'}！损失 ${bet} 筹码，铜牛升温至 ${nextTemp}°C。`
      );
    }
  };

  const foldTurn = () => {
    if (status !== 'playing') return;
    const nextTemp = Math.min(200, temp + 40);
    const nextChips = Math.max(0, chips - Math.floor(bet / 2));
    setTemp(nextTemp);
    setChips(nextChips);
    if (nextTemp >= 200) {
      setStatus('overheat');
      setLog('选择弃牌触发加剧烘烤罚则，铜牛温度冲破 200°C 临界线！');
    } else {
      setLog(`本轮弃牌虽少损一半筹码（-${Math.floor(bet / 2)}），但触发加剧加热罚则，铜牛升温至 ${nextTemp}°C。`);
    }
  };

  const reset = () => {
    setSeedIdx((i) => (i + 1) % BULL_SECRETS.length);
    setGuess(50);
    setMinBound(0);
    setMaxBound(99);
    setTemp(55);
    setChips(1000);
    setBet(200);
    setStatus('playing');
    setLog('已封存新的秘密密码，调整数值并提交猜测来缩小范围、抢先打开铜牛。');
  };

  const heatPct = Math.min(100, Math.max(0, ((temp - 40) / 160) * 100));

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              剩余筹码：{chips}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-brass)] tabular-nums">
              锁定区间：{String(minBound).padStart(2, '0')} ～ {String(maxBound).padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            换一组密码
          </button>
        </div>

        {/* 铜牛温度与人质仓状态 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
          <div className="flex items-center justify-between text-[12px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-accent)]">
              <Flame className="w-4 h-4" aria-hidden="true" />
              空心铜牛内腔温度
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold tabular-nums text-[var(--text-primary)]">
              {status === 'rescued' ? (
                <Unlock className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
              )}
              {temp}°C / 200°C
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
            <div
              style={{ width: `${heatPct}%` }}
              className={`h-full rounded-full transition-all ${
                temp >= 145 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
              }`}
            />
          </div>
          {/* 缩小范围可视化条 */}
          <div className="relative h-4 rounded bg-[var(--diagram-surface)] border border-[var(--border-hairline)] overflow-hidden">
            <div
              style={{
                left: `${minBound}%`,
                width: `${Math.max(2, maxBound - minBound + 1)}%`,
              }}
              className="absolute inset-y-0 bg-[color-mix(in_srgb,var(--diagram-brass)_34%,transparent)] border-x border-[var(--diagram-brass)]"
            />
            <div
              style={{ left: `${guess}%` }}
              className="absolute inset-y-0 w-0.5 bg-[var(--diagram-accent)]"
            />
          </div>
        </div>

        {/* 猜数与下注操作区 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[var(--text-primary)]">申报猜测密码（00～99）</span>
            <span className="text-[16px] font-bold tabular-nums text-[var(--diagram-brass)]">
              {String(guess).padStart(2, '0')}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={99}
            value={guess}
            disabled={status !== 'playing'}
            onChange={(e) => setGuess(Number(e.target.value))}
            className="w-full accent-[var(--diagram-brass)] cursor-pointer disabled:opacity-50"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
              <span>押注：</span>
              {[100, 200, 400].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBet(v)}
                  className={`px-2 py-0.5 rounded-full tabular-nums font-semibold cursor-pointer ${
                    bet === v
                      ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'bg-[var(--diagram-surface)] border border-[var(--diagram-border)] text-[var(--text-secondary)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={status !== 'playing'}
                onClick={foldTurn}
                className="px-3 py-1.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[11.5px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-45 cursor-pointer"
              >
                弃牌（+40°C）
              </button>
              <button
                type="button"
                disabled={status !== 'playing'}
                onClick={submitGuess}
                className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
              >
                提交猜测
              </button>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] text-center ${
            status === 'rescued'
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
              : status === 'overheat'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        猜数反馈虽能快速二分逼近密码，但每次失误或弃牌都会抬升铜牛火势，逼迫双方在筹码与人质安危之间做极限抉择。
      </p>
    </div>
  );
}

// ============================================================================
// 8. ky-declaration | KY宣言
// ============================================================================

interface BroadcastSegment {
  id: number;
  timeLeft: string;
  speaker: string;
  statement: string;
  truth: boolean;
  revealNote: string;
}

const KY_SEGMENTS: BroadcastSegment[] = [
  {
    id: 1,
    timeLeft: '45:00',
    speaker: '开场嘉宾 · 匿名线人',
    statement: '「十年前的旧案关键证物仍在警方封存库内。」',
    truth: false,
    revealNote: '直播调档核实：该证物已于三年前离奇移交，发言为伪。',
  },
  {
    id: 2,
    timeLeft: '30:00',
    speaker: '特邀评论员 · 传媒高管',
    statement: '「今晚节目的原始台本并未事先交给任何一位嘉宾。」',
    truth: true,
    revealNote: '导播室公证录像确认：直播前无人接触终稿，表态为真。',
  },
  {
    id: 3,
    timeLeft: '15:00',
    speaker: '连线证人 · 前调查官',
    statement: '「当时签署结案报告的负责人曾收受第三方汇款。」',
    truth: true,
    revealNote: '演播厅大屏出示银行流水核验吻合，证词为真。',
  },
  {
    id: 4,
    timeLeft: '03:00',
    speaker: '压轴当事者 · 现场表态',
    statement: '「我愿在镜头前签字否认与本案存在任何关联。」',
    truth: false,
    revealNote: '关键物证当场入画，当事者在镜头前当场改口，表态为伪。',
  },
];

function KyDeclarationDiagram() {
  const [segIdx, setSegIdx] = useState<number>(0);
  const [pick, setPick] = useState<'true' | 'false'>('true');
  const [stake, setStake] = useState<number>(1000);
  const [myChips, setMyChips] = useState<number>(3000);
  const [rivalChips, setRivalChips] = useState<number>(3000);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<string>('押注本段嘉宾表态的真伪，点击「直播开播核验」实时结算筹码。');

  const segment = KY_SEGMENTS[segIdx] ?? KY_SEGMENTS[0];
  const isFinal = segIdx === KY_SEGMENTS.length - 1 && revealed;

  const broadcastReveal = () => {
    if (revealed) return;
    const myHit = (pick === 'true') === segment.truth;
    setRevealed(true);
    if (myHit) {
      setMyChips((c) => c + stake);
      setRivalChips((c) => Math.max(0, c - stake));
      setVerdict(`押中！${segment.revealNote} 我方赢得 +${stake} 万筹码。`);
    } else {
      setMyChips((c) => Math.max(0, c - stake));
      setRivalChips((c) => c + stake);
      setVerdict(`落空！${segment.revealNote} 对手赢得 +${stake} 万筹码。`);
    }
  };

  const nextSegment = () => {
    if (segIdx < KY_SEGMENTS.length - 1) {
      setSegIdx((i) => i + 1);
      setRevealed(false);
      setVerdict('进入下一直播分段，请在倒计时结束前选定押注方向。');
    }
  };

  const reset = () => {
    setSegIdx(0);
    setPick('true');
    setStake(1000);
    setMyChips(3000);
    setRivalChips(3000);
    setRevealed(false);
    setVerdict('押注本段嘉宾表态的真伪，点击「直播开播核验」实时结算筹码。');
  };

  const progressPct = ((segIdx + (revealed ? 1 : 0.35)) / KY_SEGMENTS.length) * 100;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 直播顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-panel))] border border-[var(--diagram-accent)] text-[11px] font-bold text-[var(--diagram-accent)]">
              <Tv className="w-3 h-3" aria-hidden="true" />
              ON AIR · 第 {segment.id} / {KY_SEGMENTS.length} 段
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--text-primary)] font-semibold tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              距停播 {isFinal ? '00:00' : segment.timeLeft}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重播整场
          </button>
        </div>

        {/* 直播时长进度条 */}
        <div className="space-y-1">
          <div className="h-2 rounded-full bg-[var(--diagram-panel)] overflow-hidden">
            <div
              style={{ width: `${Math.min(100, progressPct)}%` }}
              className="h-full rounded-full bg-[var(--diagram-accent)] transition-all"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] tabular-nums">
            <span>我方筹码：{myChips.toLocaleString()} 万</span>
            <span>对手筹码：{rivalChips.toLocaleString()} 万</span>
          </div>
        </div>

        {/* 演播厅证词卡片 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-2">
          <div className="text-[11px] font-semibold text-[var(--diagram-brass)]">{segment.speaker}</div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-relaxed">
            {segment.statement}
          </p>
        </div>

        {/* 押注真/伪 + 筹码 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={revealed}
            onClick={() => setPick('true')}
            className={`py-2.5 rounded-lg border text-[12.5px] font-semibold transition-colors ${
              pick === 'true'
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
            } ${revealed ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            押：表态为真
          </button>
          <button
            type="button"
            disabled={revealed}
            onClick={() => setPick('false')}
            className={`py-2.5 rounded-lg border text-[12.5px] font-semibold transition-colors ${
              pick === 'false'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
            } ${revealed ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            押：表态为伪
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
            <span>押注额：</span>
            {[500, 1000, 2000].map((v) => (
              <button
                key={v}
                type="button"
                disabled={revealed}
                onClick={() => setStake(v)}
                className={`px-2 py-0.5 rounded-full tabular-nums font-semibold ${
                  stake === v
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[var(--text-secondary)]'
                } ${revealed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {v}万
              </button>
            ))}
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={broadcastReveal}
              className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
            >
              直播开播核验
            </button>
          ) : !isFinal ? (
            <button
              type="button"
              onClick={nextSegment}
              className="px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
            >
              进入下一分段
            </button>
          ) : (
            <button
              type="button"
              onClick={reset}
              className="px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
            >
              直播结束 · 重开一局
            </button>
          )}
        </div>

        <div className="rounded-lg px-3.5 py-2.5 border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[12.5px] text-[var(--text-primary)] text-center">
          {isFinal
            ? `${verdict} 最终比分：我方 ${myChips} 万 vs 对手 ${rivalChips} 万。`
            : verdict}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        全国电视直播无法倒带重来，每一段都必须在倒计时结束前押定嘉宾表态走向，并按镜头播出的事实当场清算。
      </p>
    </div>
  );
}

// ============================================================================
// 9. tower-of-karma | 帝王塔
// ============================================================================

const TOWER_FLOORS = [
  { level: 3, label: '塔顶密钥室 · 500 亿终端' },
  { level: 2, label: '高空电梯段 · 权限 2/3' },
  { level: 1, label: '中层电梯段 · 权限 1/3' },
  { level: 0, label: '底层 Dotty 密室 · 0/3' },
];

const TOWER_RIVAL_BEADS = [2, 3, 1, 4, 2, 0];

function TowerOfKarmaDiagram() {
  const [round, setRound] = useState<number>(0);
  const [myBeads, setMyBeads] = useState<number>(2);
  const [guessTotal, setGuessTotal] = useState<number>(4);
  const [floor, setFloor] = useState<number>(0);
  const [bloodLoss, setBloodLoss] = useState<number>(0);
  const [keyUnlocked, setKeyUnlocked] = useState<boolean>(false);
  const [log, setLog] = useState<string>('底层 Dotty：藏好圆珠并猜双方总数，猜对升一层电梯，猜错强制抽血 300 mL。');

  const rivalBeads = TOWER_RIVAL_BEADS[round % TOWER_RIVAL_BEADS.length] ?? 2;
  const bledOut = bloodLoss >= 1200;
  const atTop = floor >= 3;

  const playDotty = () => {
    if (bledOut || keyUnlocked || atTop) return;
    const total = myBeads + rivalBeads;
    if (guessTotal === total) {
      const nextFloor = Math.min(3, floor + 1);
      setFloor(nextFloor);
      setRound((r) => r + 1);
      setLog(
        nextFloor >= 3
          ? `猜中总数 ${total}（我方 ${myBeads} + 对手 ${rivalBeads}）！电梯直达塔顶，请立即输入五百亿密钥！`
          : `猜中总数 ${total}（我方 ${myBeads} + 对手 ${rivalBeads}）！获得上行权限，电梯升至第 ${nextFloor}/3 档。`
      );
    } else {
      const nextBlood = Math.min(1200, bloodLoss + 300);
      setBloodLoss(nextBlood);
      setRound((r) => r + 1);
      setLog(
        nextBlood >= 1200
          ? `猜 ${guessTotal} 失误（实际 ${myBeads} + ${rivalBeads} = ${total}），累计失血达 1200 mL 安全上限，失去比赛资格！`
          : `猜 ${guessTotal} 失误（实际 ${myBeads} + ${rivalBeads} = ${total}），强制抽血 +300 mL（现 ${nextBlood}/1200 mL）。`
      );
    }
  };

  const reset = () => {
    setRound(0);
    setMyBeads(2);
    setGuessTotal(4);
    setFloor(0);
    setBloodLoss(0);
    setKeyUnlocked(false);
    setLog('底层 Dotty：藏好圆珠并猜双方总数，猜对升一层电梯，猜错强制抽血 300 mL。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">
            电梯进度：{floor} / 3 档 · 累计抽血 {bloodLoss} / 1200 mL
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 items-stretch">
          {/* 左侧：帝王塔垂直层位 */}
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 flex flex-col justify-between gap-1.5">
            {TOWER_FLOORS.map((f) => {
              const active = floor === f.level;
              const passed = floor > f.level;
              return (
                <div
                  key={f.level}
                  className={`rounded-md px-2.5 py-2 border text-[11.5px] flex items-center justify-between gap-1.5 transition-colors ${
                    active
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] text-[var(--text-primary)] font-bold'
                      : passed
                        ? 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--diagram-brass)]'
                        : 'border-[var(--border-hairline)] bg-[var(--diagram-surface)]/70 text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="truncate">{f.label}</span>
                  {active && (
                    <span className="px-1.5 py-0.5 rounded bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[10px] shrink-0">
                      电梯
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 右侧：Dotty 藏珠猜数 + 抽血槽 */}
          <div className="space-y-3">
            {/* 抽血进度条 */}
            <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-accent)]">
                  <Droplet className="w-3.5 h-3.5" aria-hidden="true" />
                  强制抽血槽
                </span>
                <span className="tabular-nums font-bold text-[var(--text-primary)]">
                  {bloodLoss} / 1200 mL
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
                <div
                  style={{ width: `${(bloodLoss / 1200) * 100}%` }}
                  className="h-full rounded-full bg-[var(--diagram-accent)] transition-all"
                />
              </div>
            </div>

            {atTop ? (
              <div className="rounded-lg bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] border border-[var(--diagram-brass)] p-4 text-center space-y-2.5">
                <div className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--diagram-brass)]">
                  <KeyRound className="w-4 h-4" aria-hidden="true" />
                  已抵达塔顶密钥终端
                </div>
                {keyUnlocked ? (
                  <p className="text-[12.5px] font-semibold text-[var(--text-primary)]">
                    密钥验证通过！五百亿日元转移指令已执行。
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setKeyUnlocked(true);
                      setLog('密钥输入正确！成功在时限内完成五百亿日元转移，赢得帝王塔对局！');
                    }}
                    className="px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
                  >
                    输入五百亿密钥
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--text-secondary)]">我方暗握圆珠（0～4 颗）</span>
                    <span className="tabular-nums font-bold text-[var(--diagram-brass)]">{myBeads} 颗</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[0, 1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        type="button"
                        disabled={bledOut}
                        onClick={() => setMyBeads(n)}
                        className={`py-1.5 rounded-md border text-[12px] font-semibold tabular-nums cursor-pointer ${
                          myBeads === n
                            ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] text-[var(--text-primary)]'
                            : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[var(--text-secondary)]">猜测双方圆珠总和（0～8）</span>
                    <span className="tabular-nums font-bold text-[var(--text-primary)]">猜 {guessTotal} 颗</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={8}
                    value={guessTotal}
                    disabled={bledOut}
                    onChange={(e) => setGuessTotal(Number(e.target.value))}
                    className="w-full accent-[var(--diagram-brass)] cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  disabled={bledOut}
                  onClick={playDotty}
                  className="w-full py-2 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
                >
                  亮珠比对总数
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] text-center ${
            keyUnlocked
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
              : bledOut
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        底层 Dotty 猜珠直接决定电梯上行权限与抽血惩罚，必须在失血触顶与总时限耗尽前登顶输入五百亿密钥。
      </p>
    </div>
  );
}

// ============================================================================
// 10. usogui-coin-push | 推硬币
// ============================================================================

const CREAMER_PODS = [
  { id: 'c1', steps: 1 },
  { id: 'c2', steps: 1 },
  { id: 'c3', steps: 2 },
  { id: 'c4', steps: 2 },
  { id: 'c5', steps: 3 },
  { id: 'c6', steps: 3 },
  { id: 'c7', steps: 4 },
  { id: 'c8', steps: 5 },
  { id: 'c9', steps: 6 },
];

function CoinPushDiagram() {
  // 10 格列索引 0..9：我方起于 0，对手起于 9；5 格列索引 0..4：我方起于 0，对手起于 4
  const [pA, setPA] = useState<number>(0);
  const [rA, setRA] = useState<number>(9);
  const [pB, setPB] = useState<number>(0);
  const [rB, setRB] = useState<number>(4);
  const [creamerMode, setCreamerMode] = useState<boolean>(false);
  const [selectedPod, setSelectedPod] = useState<string | null>(null);
  const [usedPods, setUsedPods] = useState<string[]>([]);
  const [winner, setWinner] = useState<'none' | 'player' | 'rival'>('none');
  const [log, setLog] = useState<string>('点击任一列两枚硬币之间的空格推进我方硬币（提示：让两列剩余空隙相等即可掌握必胜对称）。');

  const gapA = rA - pA - 1;
  const gapB = rB - pB - 1;

  const pushLane = (lane: 'A' | 'B', targetIdx: number) => {
    if (winner !== 'none') return;

    const currentPos = lane === 'A' ? pA : pB;
    const rivalPos = lane === 'A' ? rA : rB;
    if (targetIdx <= currentPos || targetIdx >= rivalPos) return;

    const stepMoved = targetIdx - currentPos;
    let nextUsedPods = usedPods;

    if (creamerMode) {
      const pod = CREAMER_PODS.find((p) => p.id === selectedPod && !usedPods.includes(p.id));
      if (!pod) {
        setLog('第二回合奶精模式：请先点选一颗未使用的编号咖啡奶精，再点目标列推进对应格数。');
        return;
      }
      if (stepMoved !== pod.steps) {
        setLog(`当前选中 ${pod.steps} 格奶精，只能向对手方向推进恰好 ${pod.steps} 格。`);
        return;
      }
      nextUsedPods = [...usedPods, pod.id];
      setUsedPods(nextUsedPods);
      setSelectedPod(null);
    }

    const nextPA = lane === 'A' ? targetIdx : pA;
    const nextPB = lane === 'B' ? targetIdx : pB;
    const nextGapA = rA - nextPA - 1;
    const nextGapB = rB - nextPB - 1;

    if (nextGapA === 0 && nextGapB === 0) {
      setPA(nextPA);
      setPB(nextPB);
      setWinner('player');
      setLog(`你将${lane === 'A' ? ' 10 格列' : ' 5 格列'}推进 ${stepMoved} 格，彻底封死对手全部空隙！对手无格可退，我方获胜。`);
      return;
    }

    // 对手回应：若空隙不等则尽量拉平（经典对称策略），若已被玩家拉平则只能走 1 格破防
    let nextRA = rA;
    let nextRB = rB;
    let rivalNote = '';

    if (nextGapA > nextGapB) {
      const diff = nextGapA - nextGapB;
      nextRA = rA - diff;
      rivalNote = `对手将 10 格列推进 ${diff} 格`;
    } else if (nextGapB > nextGapA) {
      const diff = nextGapB - nextGapA;
      nextRB = rB - diff;
      rivalNote = `对手将 5 格列推进 ${diff} 格`;
    } else if (nextGapA > 0) {
      nextRA = rA - 1;
      rivalNote = '对手被迫将 10 格列推进 1 格';
    } else {
      nextRB = rB - 1;
      rivalNote = '对手被迫将 5 格列推进 1 格';
    }

    const finalGapA = nextRA - nextPA - 1;
    const finalGapB = nextRB - nextPB - 1;

    setPA(nextPA);
    setPB(nextPB);
    setRA(nextRA);
    setRB(nextRB);

    if (finalGapA === 0 && finalGapB === 0) {
      setWinner('rival');
      setLog(`你推进 ${stepMoved} 格后，${rivalNote}并将两列空隙全部封死！我方无格可移，判负。`);
    } else {
      setLog(
        `你将${lane === 'A' ? ' 10 格列' : ' 5 格列'}推进 ${stepMoved} 格；${rivalNote}。当前剩余空隙：${finalGapA} 格 vs ${finalGapB} 格。`
      );
    }
  };

  const reset = (keepMode = true) => {
    setPA(0);
    setRA(9);
    setPB(0);
    setRB(4);
    setUsedPods([]);
    setSelectedPod(null);
    setWinner('none');
    if (!keepMode) setCreamerMode(false);
    setLog('点击任一列两枚硬币之间的空格推进我方硬币（提示：让两列剩余空隙相等即可掌握必胜对称）。');
  };

  const renderLane = (
    lane: 'A' | 'B',
    size: number,
    playerIdx: number,
    rivalIdx: number,
    coinLabel: string
  ) => {
    const activePod = CREAMER_PODS.find((p) => p.id === selectedPod && !usedPods.includes(p.id));
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            {size} 格列（{coinLabel}）
          </span>
          <span className="text-[11.5px] text-[var(--text-secondary)] tabular-nums">
            剩余空隙：{rivalIdx - playerIdx - 1} 格
          </span>
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: size }).map((_, idx) => {
            const isPlayer = idx === playerIdx;
            const isRival = idx === rivalIdx;
            const inGap = idx > playerIdx && idx < rivalIdx;
            const validStep =
              winner === 'none' &&
              inGap &&
              (!creamerMode || (activePod !== undefined && idx - playerIdx === activePod.steps));

            return (
              <button
                key={idx}
                type="button"
                disabled={!validStep}
                onClick={() => pushLane(lane, idx)}
                className={`h-11 rounded-md border flex flex-col items-center justify-center transition-all text-[11px] font-bold ${
                  isPlayer
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_24%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : isRival
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                      : validStep
                        ? 'border-[var(--diagram-brass)]/55 bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] cursor-pointer'
                        : 'border-[var(--border-hairline)] bg-[var(--diagram-surface)] text-[var(--text-muted)]'
                }`}
              >
                {isPlayer ? (
                  <span>我</span>
                ) : isRival ? (
                  <span>敌</span>
                ) : validStep ? (
                  <span className="tabular-nums">+{idx - playerIdx}</span>
                ) : (
                  <span className="tabular-nums opacity-60">{idx + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              空隙差：{gapA} vs {gapB}
            </span>
            <button
              type="button"
              onClick={() => {
                setCreamerMode((v) => !v);
                setSelectedPod(null);
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-colors ${
                creamerMode
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
              }`}
            >
              {creamerMode ? `第二回合奶精模式（已耗 ${usedPods.length} 颗）` : '切换：第二回合编号奶精'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => reset(true)}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置棋盘
          </button>
        </div>

        {/* 双列棋盘 */}
        <div className="space-y-3.5">
          {renderLane('A', 10, pA, rA, '500 日元')}
          {renderLane('B', 5, pB, rB, '100 日元')}
        </div>

        {/* 第二回合：9 颗编号奶精 */}
        {creamerMode && (
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-[var(--diagram-brass)]">
                点选编号咖啡奶精（底部数字 = 推进格数）
              </span>
              <span className="text-[var(--text-secondary)] tabular-nums">
                当前奖金倍率：{usedPods.length + 1}×
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CREAMER_PODS.map((pod) => {
                const used = usedPods.includes(pod.id);
                const active = selectedPod === pod.id;
                return (
                  <button
                    key={pod.id}
                    type="button"
                    disabled={used || winner !== 'none'}
                    onClick={() => setSelectedPod(pod.id)}
                    className={`px-2.5 py-1 rounded-md border text-[11.5px] font-bold tabular-nums transition-colors ${
                      used
                        ? 'border-[var(--border-hairline)] bg-[var(--diagram-surface)] text-[var(--text-muted)] opacity-45 line-through cursor-not-allowed'
                        : active
                          ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] cursor-pointer'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] cursor-pointer'
                    }`}
                  >
                    {pod.steps} 格
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] text-center ${
            winner === 'player'
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
              : winner === 'rival'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        本质是双堆尼姆博弈：只要始终让两列剩余空隙保持相等，无论对手怎么推都能镜像跟进，最终将其逼至两列贴死无格可退。
      </p>
    </div>
  );
}

// ============================================================================
// 11. battleship | 战舰胜负
// ============================================================================

interface ShipSpec {
  id: string;
  name: string;
  cells: number[];
}

const FLEET_PRESETS: ShipSpec[][] = [
  [
    { id: 'bb', name: '主力舰（3格）', cells: [1, 2, 3] },
    { id: 'cr', name: '巡洋舰（2格）', cells: [8, 12] },
    { id: 'dd', name: '护卫艇（1格）', cells: [14] },
  ],
  [
    { id: 'bb', name: '主力舰（3格）', cells: [0, 4, 8] },
    { id: 'cr', name: '巡洋舰（2格）', cells: [6, 7] },
    { id: 'dd', name: '护卫艇（1格）', cells: [15] },
  ],
  [
    { id: 'bb', name: '主力舰（3格）', cells: [12, 13, 14] },
    { id: 'cr', name: '巡洋舰（2格）', cells: [2, 6] },
    { id: 'dd', name: '护卫艇（1格）', cells: [4] },
  ],
];

const ROW_LABELS = ['A', 'B', 'C', 'D'];

function BattleshipDiagram() {
  const [presetIdx, setPresetIdx] = useState<number>(0);
  const [fired, setFired] = useState<number[]>([]);
  const [log, setLog] = useState<string>('点击盲区海域坐标实施炮击：对手须如实回报「落空」「命中」或「击沉」。');

  const fleet = FLEET_PRESETS[presetIdx % FLEET_PRESETS.length] ?? FLEET_PRESETS[0];
  const allShipCells = fleet.flatMap((s) => s.cells);
  const sunkShips = fleet.filter((s) => s.cells.every((c) => fired.includes(c)));
  const allSunk = sunkShips.length === fleet.length;

  const fireAt = (idx: number) => {
    if (fired.includes(idx) || allSunk) return;
    const nextFired = [...fired, idx];
    setFired(nextFired);

    const coord = `${ROW_LABELS[Math.floor(idx / 4)]}${(idx % 4) + 1}`;
    const hitShip = fleet.find((s) => s.cells.includes(idx));
    if (!hitShip) {
      setLog(`炮击坐标 ${coord} → 对手回应「落空」。`);
      return;
    }

    const nowSunk = hitShip.cells.every((c) => nextFired.includes(c));
    const totalSunkNow = fleet.filter((s) => s.cells.every((c) => nextFired.includes(c))).length;
    if (nowSunk) {
      setLog(
        totalSunkNow === fleet.length
          ? `炮击 ${coord} 击沉敌方最后战舰「${hitShip.name}」！全歼对手舰队获胜。`
          : `炮击 ${coord} → 命中并击沉「${hitShip.name}」！船上赌注与惩罚风险升至 ${totalSunkNow} / 3 级。`
      );
    } else {
      setLog(`炮击坐标 ${coord} → 对手回应「命中」！顺着邻格继续锁定位点。`);
    }
  };

  const reset = () => {
    setPresetIdx((i) => (i + 1) % FLEET_PRESETS.length);
    setFired([]);
    setLog('已更换对手秘密布阵，点击 4×4 盲区海域坐标重新开始炮击。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              已炮击 {fired.length} 发 · 击沉 {sunkShips.length} / {fleet.length} 艘
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] border border-[var(--diagram-accent)]/50 text-[11px] font-semibold text-[var(--diagram-accent)] tabular-nums">
              船上惩罚风险：{sunkShips.length} / 3 级
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新布阵
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[224px_1fr] gap-4 items-center">
          {/* 4×4 盲区海域网格 */}
          <div className="max-w-[224px] mx-auto w-full space-y-1">
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 16 }).map((_, idx) => {
                const isFired = fired.includes(idx);
                const isHit = isFired && allShipCells.includes(idx);
                const ship = fleet.find((s) => s.cells.includes(idx));
                const isSunk = Boolean(ship && ship.cells.every((c) => fired.includes(c)));
                const coord = `${ROW_LABELS[Math.floor(idx / 4)]}${(idx % 4) + 1}`;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isFired || allSunk}
                    onClick={() => fireAt(idx)}
                    className={`h-[48px] rounded-lg border flex flex-col items-center justify-center transition-all text-[11px] font-semibold ${
                      isSunk
                        ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_24%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                        : isHit
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_22%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                          : isFired
                            ? 'border-[var(--border-hairline)] bg-[var(--diagram-surface)] text-[var(--text-muted)] opacity-55'
                            : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] cursor-pointer'
                    }`}
                  >
                    {isSunk ? (
                      <>
                        <Ship className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="text-[10px]">击沉</span>
                      </>
                    ) : isHit ? (
                      <>
                        <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="text-[10px]">命中</span>
                      </>
                    ) : isFired ? (
                      <span className="text-[10px]">落空</span>
                    ) : (
                      <span className="tabular-nums">{coord}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 舰队清单与风险升级条 */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              {fleet.map((ship) => {
                const hits = ship.cells.filter((c) => fired.includes(c)).length;
                const sunk = hits === ship.cells.length;
                return (
                  <div
                    key={ship.id}
                    className={`rounded-lg px-3 py-2 border flex items-center justify-between text-[12px] ${
                      sunk
                        ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Ship className="w-3.5 h-3.5" aria-hidden="true" />
                      {ship.name}
                    </span>
                    <span className="text-[11px] font-semibold tabular-nums">
                      {sunk ? '已击沉' : `受损 ${hits}/${ship.cells.length}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="font-semibold text-[var(--text-secondary)]">沉船惩罚升级进度</span>
                <span className="font-bold text-[var(--diagram-accent)] tabular-nums">
                  {sunkShips.length} / 3 档
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-2 rounded-full ${
                      lvl <= sunkShips.length ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-surface)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] text-center ${
            allSunk
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        双方全程看不到对手盘面，只能凭报坐标后对方的回应推理船身走向；若被立会人抓到私改布阵或谎报，则直接判负。
      </p>
    </div>
  );
}

// ============================================================================
// 12. usogui-bookstore | 选书对决
// ============================================================================

interface OldBookItem {
  id: string;
  title: string;
  shelfLook: string;
  clue: string;
  valueYen: number;
  appraisal: string;
}

const OLD_BOOKS: OldBookItem[] = [
  {
    id: 'poem',
    title: '《精装抒情诗集》',
    shelfLook: '烫金布面崭新，摆在显眼上层',
    clue: '版权页标注「昭和五十七年第六刷重印」，流通量极大。',
    valueYen: 18000,
    appraisal: '品相极佳但属普通重印本，估价约 1.8 万日元。',
  },
  {
    id: 'broken',
    title: '《无封残页古本》',
    shelfLook: '书脊脱线、藏在最底层积灰角落',
    clue: '扉页夹着绝版初刷藏书票与原作者亲笔勘误签印！',
    valueYen: 1200000,
    appraisal: '罕见初刷签名孤本，虽缺封面仍具极高收藏价值，估价约 120 万日元！',
  },
  {
    id: 'atlas',
    title: '《欧陆博物图鉴》',
    shelfLook: '大开本皮面精装，厚重气派',
    clue: '插图页有两幅彩版被前藏家裁走，影响完整度。',
    valueYen: 95000,
    appraisal: '原本值钱，但关键彩版缺失拉低估价，估价约 9.5 万日元。',
  },
  {
    id: 'math',
    title: '《和算手抄注本》',
    shelfLook: '线装宣纸发黄，夹在旧账簿间',
    clue: '确为江户末期手抄稿，但非名家题跋且虫蛀严重。',
    valueYen: 340000,
    appraisal: '具备史料价值的古抄本，估价约 34 万日元。',
  },
];

function BookstoreDiagram() {
  const [secondsLeft, setSecondsLeft] = useState<number>(300);
  const [inspected, setInspected] = useState<string[]>([]);
  const [pickedId, setPickedId] = useState<string>('poem');
  const [judged, setJudged] = useState<boolean>(false);

  const rivalValue = 340000;
  const pickedBook = OLD_BOOKS.find((b) => b.id === pickedId) ?? OLD_BOOKS[0];
  const won = judged && pickedBook.valueYen > rivalValue;
  const tie = judged && pickedBook.valueYen === rivalValue;

  const inspectBook = (id: string) => {
    if (judged || inspected.includes(id)) return;
    if (secondsLeft < 60) return;
    setInspected((prev) => [...prev, id]);
    setSecondsLeft((s) => Math.max(0, s - 60));
  };

  const reset = () => {
    setSecondsLeft(300);
    setInspected([]);
    setPickedId('poem');
    setJudged(false);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 5 分钟倒计时条 */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)] tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              寻书限时倒计时：{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} / 05:00
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重新计时
            </button>
          </div>
          <div className="h-2 rounded-full bg-[var(--diagram-panel)] overflow-hidden">
            <div
              style={{ width: `${(secondsLeft / 300) * 100}%` }}
              className={`h-full rounded-full transition-all ${
                secondsLeft <= 60 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
              }`}
            />
          </div>
        </div>

        {/* 旧书店书架 4 本候选藏书 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {OLD_BOOKS.map((book) => {
            const selected = pickedId === book.id;
            const checked = inspected.includes(book.id);
            return (
              <div
                key={book.id}
                onClick={() => {
                  if (!judged) setPickedId(book.id);
                }}
                className={`rounded-lg p-3 border transition-all space-y-2 ${
                  selected
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                } ${judged ? 'cursor-default' : 'cursor-pointer hover:border-[var(--diagram-brass)]/70'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--text-primary)]">
                    <BookOpen className="w-3.5 h-3.5 shrink-0 text-[var(--diagram-brass)]" aria-hidden="true" />
                    <span>{book.title}</span>
                  </div>
                  {selected && (
                    <span className="px-1.5 py-0.5 rounded bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[10px] font-bold shrink-0">
                      已选定
                    </span>
                  )}
                </div>
                <p className="text-[11.5px] text-[var(--text-secondary)]">{book.shelfLook}</p>

                {checked || judged ? (
                  <p className="text-[11.5px] text-[var(--text-primary)] bg-[var(--diagram-surface)] rounded px-2 py-1.5 border border-[var(--border-hairline)]">
                    {judged ? book.appraisal : `翻检线索：${book.clue}`}
                  </p>
                ) : (
                  <button
                    type="button"
                    disabled={secondsLeft < 60}
                    onClick={(e) => {
                      e.stopPropagation();
                      inspectBook(book.id);
                    }}
                    className="text-[11px] font-semibold text-[var(--diagram-brass)] hover:underline disabled:opacity-45 cursor-pointer"
                  >
                    翻检版权页与内页线索（耗时 1 分钟）
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 店主估价动作条 */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5">
          <div className="text-[12px] text-[var(--text-primary)]">
            当前提交：<strong className="text-[var(--diagram-brass)]">{pickedBook.title}</strong>
          </div>
          <button
            type="button"
            disabled={judged}
            onClick={() => setJudged(true)}
            className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
          >
            {judged ? '店主已裁定' : '交予店主估价'}
          </button>
        </div>

        {judged && (
          <div
            className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] text-center font-semibold ${
              won
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : tie
                  ? 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
                  : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
            }`}
          >
            {won
              ? `店主估价 ${(pickedBook.valueYen / 10000).toFixed(1)} 万日元 > 对手 34.0 万日元！赢得 100 万日元与《蜜蜂王子》购买权。`
              : tie
                ? '店主估价与对手所选相当（34.0 万日元），难分高下！'
                : `店主估价 ${(pickedBook.valueYen / 10000).toFixed(1)} 万日元 < 对手 34.0 万日元，高价鉴定落败。`}
          </div>
        )}
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        旧书店里装帧华丽未必最值钱；5 分钟内分配时间翻检线索、挑出真正高估值的藏书交由店主亲口裁定才是胜负关键。
      </p>
    </div>
  );
}

// ============================================================================
// 13. usogui-four-gods | 四神包围
// ============================================================================

type FourDir = 'up' | 'down' | 'left' | 'right';

const DIR_LIST: Array<{ id: FourDir; label: string }> = [
  { id: 'up', label: '上' },
  { id: 'down', label: '下' },
  { id: 'left', label: '左' },
  { id: 'right', label: '右' },
];

const DEALER_SEQUENCE: FourDir[] = ['right', 'up', 'left', 'down'];

function FourGodsDiagram() {
  const [step, setStep] = useState<number>(0);
  const [bet, setBet] = useState<number>(20);
  const [status, setStatus] = useState<'playing' | 'win' | 'lose'>('playing');
  const [lastPick, setLastPick] = useState<{ player: FourDir; dealer: FourDir } | null>(null);

  const pickDirection = (dir: FourDir) => {
    if (status !== 'playing') return;
    const dealerDir = DEALER_SEQUENCE[(step + bet) % DEALER_SEQUENCE.length];
    setLastPick({ player: dir, dealer: dealerDir });

    if (dir === dealerDir) {
      setStatus('lose');
    } else if (step + 1 >= 3) {
      setStep(3);
      setStatus('win');
    } else {
      setStep((s) => s + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setStatus('playing');
    setLastPick(null);
  };

  const renderDirIcon = (dir: FourDir) => {
    if (dir === 'up') return <ArrowUp className="w-4 h-4" aria-hidden="true" />;
    if (dir === 'down') return <ArrowDown className="w-4 h-4" aria-hidden="true" />;
    if (dir === 'left') return <ArrowLeft className="w-4 h-4" aria-hidden="true" />;
    return <ArrowRight className="w-4 h-4" aria-hidden="true" />;
  };

  const dirLabel = (dir: FourDir) => DIR_LIST.find((d) => d.id === dir)?.label ?? '';

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              已连续避开 {step} / 3 次
            </span>
            <div className="inline-flex items-center gap-1">
              {[10, 20, 50].map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={step > 0 || status !== 'playing'}
                  onClick={() => setBet(v)}
                  className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums font-semibold cursor-pointer disabled:opacity-50 ${
                    bet === v
                      ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
                  }`}
                >
                  {v} BIOS
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重开本局
          </button>
        </div>

        {/* 3 格连续躲避灯 */}
        <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`rounded-lg py-1.5 text-center text-[11.5px] font-semibold border ${
                step >= n
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                  : status === 'lose' && step + 1 === n
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
              }`}
            >
              第 {n} 关 {step >= n ? '✓' : status === 'lose' && step + 1 === n ? '✗' : ''}
            </div>
          ))}
        </div>

        {/* 四向转头控制 */}
        <div className="grid grid-cols-4 gap-2 max-w-[360px] mx-auto">
          {DIR_LIST.map((d) => (
            <button
              key={d.id}
              type="button"
              disabled={status !== 'playing'}
              onClick={() => pickDirection(d.id)}
              className="rounded-xl py-3 border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] hover:text-[var(--diagram-brass)] disabled:opacity-45 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              {renderDirIcon(d.id)}
              <span className="text-[12px] font-semibold">转向{d.label}</span>
            </button>
          ))}
        </div>

        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] text-center font-medium ${
            status === 'win'
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : status === 'lose'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status === 'win'
            ? `连避三次成功！闲家从庄家处赢回 +${bet * 2} BIOS 赔付，随后轮换坐庄。`
            : status === 'lose' && lastPick
              ? `方向重合！你转向「${dirLabel(lastPick.player)}」，庄家正指「${dirLabel(lastPick.dealer)}」——立刻出局，${bet} BIOS 归庄家。`
              : lastPick
                ? `躲过一劫！你转向「${dirLabel(lastPick.player)}」，庄家指向「${dirLabel(lastPick.dealer)}」，继续下一轮。`
                : '选择闲家转头方向，连续三次避开庄家手势即可赢走赔付。'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        闲家只要在三次判定中被庄家指中一次即刻出局没收赌注，全部连避三次才赢钱；庄家身份轮流坐庄。
      </p>
    </div>
  );
}

// ============================================================================
// 14. usogui-colosseum | 奴隶角斗押注
// ============================================================================

const FIGHTERS = [
  { id: 0, name: '重装冠军', odds: 1.8, tag: '热门强手' },
  { id: 1, name: '双刃斗士', odds: 4.5, tag: '中游好手' },
  { id: 2, name: '伤痕老兵', odds: 18, tag: '冷门悍将' },
  { id: 3, name: '无名奴隶', odds: 120, tag: '极冷赔率' },
];

function ColosseumDiagram() {
  const [selected, setSelected] = useState<number>(3);
  const [stake, setStake] = useState<number>(10);
  const [stage, setStage] = useState<'bet' | 'brawl' | 'settled'>('bet');
  const [survivorId, setSurvivorId] = useState<number | null>(null);

  const runFight = (forcedWinner?: number) => {
    const winner = forcedWinner ?? (selected === 3 ? 3 : (selected + 1) % FIGHTERS.length);
    setStage('settled');
    setSurvivorId(winner);
  };

  const reset = () => {
    setStage('bet');
    setSurvivorId(null);
  };

  const picked = FIGHTERS[selected];
  const won = stage === 'settled' && survivorId === selected;
  const payout = Math.round(stake * picked.odds);

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">赛前锁定赔率押注券</span>
            <div className="inline-flex items-center gap-1">
              {[10, 50, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={stage !== 'bet'}
                  onClick={() => setStake(v)}
                  className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums font-semibold cursor-pointer disabled:opacity-50 ${
                    stake === v
                      ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
                  }`}
                >
                  押 {v}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新押注
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {FIGHTERS.map((f) => {
            const isPicked = selected === f.id;
            const isElim = stage === 'settled' && survivorId !== f.id;
            const isChamp = stage === 'settled' && survivorId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                disabled={stage !== 'bet'}
                onClick={() => setSelected(f.id)}
                className={`rounded-xl p-3 border text-left transition-all cursor-pointer disabled:cursor-default ${
                  isChamp
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))]'
                    : isElim
                      ? 'border-[var(--border-hairline)] bg-[var(--diagram-panel)]/50 opacity-50'
                      : isPicked
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)]/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">{f.name}</span>
                  {isChamp && <Crown className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />}
                  {isElim && <Skull className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />}
                </div>
                <div className="mt-1.5 text-[16px] font-bold tabular-nums text-[var(--diagram-brass)]">
                  {f.odds}×
                </div>
                <div className="mt-0.5 text-[10.5px] text-[var(--text-secondary)]">
                  {isChamp ? '唯一幸存者' : isElim ? '混战倒地' : f.tag}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5">
          <div className="text-[12px] text-[var(--text-secondary)]">
            已锁定 <strong className="text-[var(--text-primary)]">{picked.name}</strong>（{picked.odds}×）· 预期兑付{' '}
            <strong className="text-[var(--diagram-brass)] tabular-nums">{payout} BIOS</strong>
          </div>
          <div className="flex items-center gap-2">
            {stage === 'bet' ? (
              <>
                <button
                  type="button"
                  onClick={() => runFight(selected)}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold cursor-pointer"
                >
                  模拟押中爆冷
                </button>
                <button
                  type="button"
                  onClick={() => runFight((selected + 1) % FIGHTERS.length)}
                  className="px-3 py-1.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  模拟押错
                </button>
              </>
            ) : (
              <span
                className={`text-[12px] font-semibold ${
                  won ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
                }`}
              >
                {won ? `全额派彩 +${payout} BIOS（锁赔不下调）` : `所押战士倒地，损失 ${stake} BIOS`}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        赔率在开战前即永久锁定，即使后续出现大额押注也不得下调；唯有站到最后的斗士才兑现票面全额倍数。
      </p>
    </div>
  );
}

// ============================================================================
// 15. usogui-contradiction | 矛盾游戏
// ============================================================================

type WeaponId = 'katana' | 'gun' | 'taser';
type ShieldId = 'wood' | 'iron' | 'rubber';

const WEAPONS: Array<{ id: WeaponId; name: string; hint: string }> = [
  { id: 'katana', name: '日本刀', hint: '斩断木盾/胶盾' },
  { id: 'gun', name: '手枪', hint: '穿透木盾/胶盾' },
  { id: 'taser', name: '电击枪', hint: '导电击穿铁盾' },
];

const SHIELDS: Array<{ id: ShieldId; name: string; hint: string }> = [
  { id: 'iron', name: '铁盾', hint: '防刀枪 · 但导电' },
  { id: 'wood', name: '木盾', hint: '绝缘防电 · 难挡刀枪' },
  { id: 'rubber', name: '橡胶盾', hint: '绝缘防电 · 难挡刀枪' },
];

function resolveContradiction(weapon: WeaponId, shield: ShieldId, steppedBack: boolean) {
  if (steppedBack) {
    return {
      winner: 'spear' as const,
      text: '守方双脚退过禁退线犯规！无论盾牌是否克制，直接判矛方胜。',
    };
  }
  if (weapon === 'taser') {
    if (shield === 'iron') {
      return {
        winner: 'spear' as const,
        text: '电击枪遇铁盾导电击穿！守方遭电击丧失战力，矛方胜。',
      };
    }
    return {
      winner: 'shield' as const,
      text: `${shield === 'wood' ? '木盾' : '橡胶盾'}成功绝缘挡下电击枪！盾方防住一击。`,
    };
  }
  if (shield === 'iron') {
    return {
      winner: 'shield' as const,
      text: `铁盾硬抗${weapon === 'katana' ? '日本刀' : '手枪'}进攻！盾方安然无恙。`,
    };
  }
  return {
    winner: 'spear' as const,
    text: `${weapon === 'katana' ? '日本刀' : '手枪'}轻松击破${shield === 'wood' ? '木盾' : '橡胶盾'}！矛方胜。`,
  };
}

function ContradictionDiagram() {
  const [myBid, setMyBid] = useState<number>(30);
  const [rivalBid] = useState<number>(20);
  const [weapon, setWeapon] = useState<WeaponId>('taser');
  const [shield, setShield] = useState<ShieldId>('iron');
  const [steppedBack, setSteppedBack] = useState<boolean>(false);

  const role = myBid > rivalBid ? '矛（攻方）' : myBid < rivalBid ? '盾（守方）' : '同价重投';
  const verdict = resolveContradiction(weapon, shield, steppedBack);

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 第一步：暗投 BIOS 竞价争矛/盾 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <Coins className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            <span className="text-[var(--text-secondary)]">暗投竞价：我方</span>
            {[10, 20, 30].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setMyBid(b)}
                className={`px-2 py-0.5 rounded-full text-[11px] tabular-nums font-semibold cursor-pointer ${
                  myBid === b
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[var(--diagram-surface)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
                }`}
              >
                {b}
              </button>
            ))}
            <span className="text-[var(--text-muted)]">vs 对手 {rivalBid}</span>
          </div>
          <span className="font-semibold text-[var(--diagram-brass)]">本回合身份：{role}</span>
        </div>

        {/* 第二步：2 秒内盲抓武器与盾牌对撞 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--diagram-accent)]">
              <Sword className="w-3.5 h-3.5" aria-hidden="true" />
              <span>矛方兵器（揭布后 2 秒内抓起）</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {WEAPONS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWeapon(w.id)}
                  className={`rounded-lg px-2 py-2 border text-center cursor-pointer transition-all ${
                    weapon === w.id
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="text-[12px] font-semibold">{w.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{w.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--diagram-brass)]">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <span>盾方防具（限双脚禁退线内）</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {SHIELDS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShield(s.id)}
                  className={`rounded-lg px-2 py-2 border text-center cursor-pointer transition-all ${
                    shield === s.id
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="text-[12px] font-semibold">{s.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{s.hint}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <label className="inline-flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={steppedBack}
              onChange={(e) => setSteppedBack(e.target.checked)}
              className="accent-[var(--diagram-accent)] cursor-pointer"
            />
            <span>模拟守方受击时双脚踩出禁退线</span>
          </label>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--diagram-brass)]">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            三回合一组交替推进
          </span>
        </div>

        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] font-semibold text-center ${
            verdict.winner === 'spear'
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))] text-[var(--diagram-brass)]'
          }`}
        >
          {verdict.text}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        先以比奥斯币竞价抢夺进攻权，再凭盖布下的触觉记忆在两秒内抓起克制对方的兵器或盾牌一击定胜负。
      </p>
    </div>
  );
}

// ============================================================================
// 16. protoporos | 原豚岛
// ============================================================================

const KINGDOMS = [
  { id: 'tipper', name: '提珀王国', control: '可经商扩充 BIOS 与雇佣战力' },
  { id: 'azura', name: '阿兹拉王国', control: '借斗技场与武装冲突夺取统治权' },
  { id: 'shaka', name: '夏卡王国', control: '通过外交结盟与情报暗战左右大局' },
];

const RANKS = ['奴隶', '平民', '贵族', '一国之王', '唯一认证皇帝'];

function ProtoporosDiagram() {
  const [rankIdx, setRankIdx] = useState<number>(1);
  const [kingdomIdx, setKingdomIdx] = useState<number>(0);
  const [bios, setBios] = useState<number>(1200);

  const promote = () => {
    if (rankIdx >= RANKS.length - 1) return;
    setRankIdx((r) => r + 1);
    setBios((b) => b + 1500);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 阶层晋升轴 */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="font-semibold text-[var(--text-primary)]">
              当前阶层：<strong className="text-[var(--diagram-brass)]">{RANKS[rankIdx]}</strong>
            </span>
            <span className="tabular-nums text-[var(--diagram-brass)] font-semibold">
              持有 {bios.toLocaleString()} BIOS
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {RANKS.map((rk, i) => (
              <button
                key={rk}
                type="button"
                onClick={() => setRankIdx(i)}
                className={`rounded-lg py-2 px-1 text-center text-[11px] font-semibold border cursor-pointer transition-all ${
                  i === rankIdx
                    ? i === RANKS.length - 1
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                      : 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : i < rankIdx
                      ? 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
                      : 'border-[var(--border-hairline)] bg-[var(--diagram-panel)]/55 text-[var(--text-secondary)]'
                }`}
              >
                {rk}
              </button>
            ))}
          </div>
        </div>

        {/* 三国版图 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {KINGDOMS.map((k, i) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKingdomIdx(i)}
              className={`rounded-xl p-3 border text-left cursor-pointer transition-all ${
                kingdomIdx === i
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[12.5px] font-semibold text-[var(--text-primary)]">
                <span>{k.name}</span>
                {kingdomIdx === i && <Crown className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />}
              </div>
              <p className="mt-1 text-[11.5px] text-[var(--text-secondary)] leading-relaxed">{k.control}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5 text-[12px]">
          <span className="text-[var(--text-primary)]">
            {rankIdx === RANKS.length - 1
              ? '在截止日成为全岛唯一系统认证「皇帝」即判胜；若生僵局则入立会人加赛。'
              : `依托${KINGDOMS[kingdomIdx].name}积攒 BIOS 与兵力，向唯一皇帝宝座推进。`}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {rankIdx < RANKS.length - 1 ? (
              <button
                type="button"
                onClick={promote}
                className="px-3 py-1 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[11.5px] font-semibold cursor-pointer"
              >
                晋升阶层
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRankIdx(1);
                  setBios(1200);
                }}
                className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                重置
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        全岛一切物资、情报与身份晋升皆以 BIOS 结算；两位外来挑战者须在截止日前争夺全岛唯一的「皇帝」认证。
      </p>
    </div>
  );
}

// ============================================================================
// 17. hand-chopper | 断手台
// ============================================================================

function HandChopperDiagram() {
  const [raises, setRaises] = useState<number>(1);
  const [state, setState] = useState<'active' | 'pulled' | 'chopped'>('active');

  const multiplier = Math.pow(2, raises);
  const pot = 50 * multiplier;
  const riskPct = Math.min(95, 18 + raises * 22);

  const raiseMore = () => {
    if (state !== 'active') return;
    if (raises >= 4) {
      setState('chopped');
    } else {
      setRaises((r) => r + 1);
    }
  };

  const reset = () => {
    setRaises(1);
    setState('active');
  };

  const bladeY = state === 'chopped' ? 54 : 10 + raises * 7;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">
            当前奖池：<strong className="text-[var(--diagram-brass)]">{pot} BIOS</strong>（{multiplier}× 倍率）
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置木台
          </button>
        </div>

        {/* 悬刃木台纵剖面 SVG */}
        <svg
          viewBox="0 0 360 110"
          className="w-full max-w-[360px] mx-auto h-auto block select-none"
          role="img"
          aria-label="悬刃断手台装置示意"
        >
          {/* 木台支架 */}
          <rect x="86" y="10" width="12" height="90" fill="var(--diagram-panel)" stroke="var(--diagram-border)" strokeWidth="1.5" />
          <rect x="262" y="10" width="12" height="90" fill="var(--diagram-panel)" stroke="var(--diagram-border)" strokeWidth="1.5" />
          <rect x="70" y="84" width="220" height="16" rx="4" fill="var(--diagram-panel)" stroke="var(--diagram-border)" strokeWidth="1.5" />

          {/* 钢刃 */}
          <polygon
            points={`102,${bladeY} 258,${bladeY} 258,${bladeY + 18} 102,${bladeY + 26}`}
            fill="color-mix(in srgb, var(--diagram-accent) 32%, var(--diagram-panel))"
            stroke="var(--diagram-accent)"
            strokeWidth="1.8"
          />

          {/* 手腕示意 */}
          {state !== 'pulled' && (
            <rect
              x="148"
              y="70"
              width="64"
              height="14"
              rx="6"
              fill={
                state === 'chopped'
                  ? 'color-mix(in srgb, var(--diagram-accent) 45%, var(--diagram-panel))'
                  : 'color-mix(in srgb, var(--diagram-brass) 30%, var(--diagram-panel))'
              }
              stroke={state === 'chopped' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
              strokeWidth="1.6"
            />
          )}
          <text x="180" y="96" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-secondary)">
            {state === 'pulled' ? '已主动抽手离开锁具' : state === 'chopped' ? '机关触发 · 钢刃落下' : '手腕锁定于断手台内'}
          </text>
        </svg>

        {/* 落刃压力条 + 操作按钮 */}
        <div className="space-y-3">
          <div className="space-y-1 text-[11.5px]">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">悬刃触发压迫度</span>
              <span className="tabular-nums font-semibold text-[var(--diagram-accent)]">{riskPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--diagram-panel)] overflow-hidden">
              <div
                style={{ width: `${riskPct}%` }}
                className="h-full rounded-full bg-[var(--diagram-accent)] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={state !== 'active'}
              onClick={raiseMore}
              className="rounded-xl py-2.5 px-3 bg-[var(--diagram-accent)] text-[var(--accent-fg)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>继续加注跟进（×2）</span>
            </button>
            <button
              type="button"
              disabled={state !== 'active'}
              onClick={() => setState('pulled')}
              className="rounded-xl py-2.5 px-3 border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] text-[12px] font-semibold hover:border-[var(--diagram-brass)] disabled:opacity-45 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Hand className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              <span>抽手认输保腕</span>
            </button>
          </div>
        </div>

        {state !== 'active' && (
          <div
            className={`rounded-lg px-3.5 py-2.5 border text-[12.5px] font-semibold text-center ${
              state === 'chopped'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
            }`}
          >
            {state === 'chopped'
              ? '触发机关落刃！不仅痛失手腕，也丢掉全部筹码。'
              : `抢在落刃前抽手脱身！保住了手腕，但赔掉已投入的 ${pot} BIOS 奖池。`}
          </div>
        )}
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        每轮加注都会成倍放大奖池与落刃风险，胜负核心在于顶住恐惧逼迫对手先行抽手认输。
      </p>
    </div>
  );
}

// ============================================================================
// 18. usogui-gonen | 葛农与维扎戈内对局
// ============================================================================

function GonenDiagram() {
  const [phase, setPhase] = useState<'table' | 'joker' | 'donor'>('table');

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'table' as const, label: '暗场常规牌局' },
            { id: 'joker' as const, label: '鬼牌压境王牌 A' },
            { id: 'donor' as const, label: '捐赠者心脏赌约' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPhase(tab.id)}
              className={`rounded-lg py-2 px-2 text-[12px] font-semibold border transition-colors cursor-pointer ${
                phase === tab.id
                  ? tab.id === 'donor'
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                    : 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {phase === 'donor' ? (
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-accent)]/60 p-4 space-y-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <div className="rounded-lg bg-[var(--diagram-surface)] border border-[var(--diagram-brass)]/60 p-3 space-y-1">
                <HeartPulse className="w-6 h-6 text-[var(--diagram-brass)] mx-auto" aria-hidden="true" />
                <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">健康心脏</div>
                <div className="text-[11px] text-[var(--text-secondary)]">胜方阵营移植夺走</div>
              </div>
              <Swords className="w-5 h-5 text-[var(--diagram-accent)]" aria-hidden="true" />
              <div className="rounded-lg bg-[var(--diagram-surface)] border border-[var(--diagram-accent)]/60 p-3 space-y-1">
                <HeartCrack className="w-6 h-6 text-[var(--diagram-accent)] mx-auto" aria-hidden="true" />
                <div className="text-[12.5px] font-semibold text-[var(--diagram-accent)]">患病心脏</div>
                <div className="text-[11px] text-[var(--text-secondary)]">败方被迫换入续命</div>
              </div>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] text-center leading-relaxed">
              以自身健康器官直接作为赌注：落败者交出健康心脏并换入病心，埋下漫长复仇与夺回心脏的伏笔。
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-5">
              <div className="w-[74px] h-[102px] rounded-xl border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-surface))] flex flex-col items-center justify-center gap-1">
                <span className="text-[20px] font-bold text-[var(--text-primary)]">A</span>
                <span className="text-[16px] text-[var(--diagram-brass)]">♠</span>
              </div>
              <span className="font-mincho text-sm text-[var(--text-secondary)]">VS</span>
              {phase === 'table' ? (
                <div className="w-[74px] h-[102px] rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-surface)] flex flex-col items-center justify-center gap-1">
                  <span className="text-[20px] font-bold text-[var(--text-secondary)]">K</span>
                  <span className="text-[16px] text-[var(--text-secondary)]">♦</span>
                </div>
              ) : (
                <div className="w-[74px] h-[102px] rounded-xl border-2 border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-surface))] flex flex-col items-center justify-center gap-1">
                  <Crown className="w-5 h-5 text-[var(--diagram-accent)]" aria-hidden="true" />
                  <span className="text-[13px] font-bold text-[var(--diagram-accent)]">JOKER</span>
                </div>
              )}
            </div>
            <p className="text-[12.5px] text-[var(--text-primary)] text-center">
              {phase === 'table'
                ? '常规扑克对局中，王牌 A 稳稳压制黑手党代表的 K 赢得桌面彩池。'
                : '幕后首魁葛农现身翻出凌驾规则之上的鬼牌压过 A，将赌局拉向更残酷的器官旧账。'}
            </p>
          </div>
        )}
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        牌桌明面以点数比大小决胜负，而在面对幕后首魁时，赌注已直指当年以健康心脏抵押的「捐赠者游戏」。
      </p>
    </div>
  );
}

export const USOGUI_DIAGRAMS: Record<string, ComponentType> = {
  'usogui-oneshot-whip': OneshotWhipDiagram,
  'usogui-prologue-roulette': PrologueRouletteDiagram,
  'abandoned-building': AbandonedBuildingDiagram,
  'usogui-poker-shark': PokerSharkDiagram,
  'hangman-old-maid': HangmanOldMaidDiagram,
  'labyrinth-zero': LabyrinthZeroDiagram,
  'bulls-womb': BullsWombDiagram,
  'ky-declaration': KyDeclarationDiagram,
  'tower-of-karma': TowerOfKarmaDiagram,
  'usogui-coin-push': CoinPushDiagram,
  battleship: BattleshipDiagram,
  'usogui-bookstore': BookstoreDiagram,
  'usogui-four-gods': FourGodsDiagram,
  'usogui-colosseum': ColosseumDiagram,
  'usogui-contradiction': ContradictionDiagram,
  protoporos: ProtoporosDiagram,
  'hand-chopper': HandChopperDiagram,
  'usogui-gonen': GonenDiagram,
};
