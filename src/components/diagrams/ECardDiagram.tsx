import { useState } from 'react';
import { Crown, RotateCcw, Shield, Skull } from 'lucide-react';

type CardKind = 'emperor' | 'citizen' | 'slave';

interface HandCard {
  id: number;
  kind: CardKind;
}

const EMPEROR_DECK: HandCard[] = [
  { id: 0, kind: 'emperor' },
  { id: 1, kind: 'citizen' },
  { id: 2, kind: 'citizen' },
  { id: 3, kind: 'citizen' },
  { id: 4, kind: 'citizen' },
];

const SLAVE_DECK: HandCard[] = [
  { id: 0, kind: 'slave' },
  { id: 1, kind: 'citizen' },
  { id: 2, kind: 'citizen' },
  { id: 3, kind: 'citizen' },
  { id: 4, kind: 'citizen' },
];

function judgeClash(emp: CardKind, slv: CardKind) {
  if (emp === 'citizen' && slv === 'citizen') {
    return {
      winner: 'tie' as const,
      label: '平局 · 双方消耗平民，继续下一手',
    };
  }
  if (emp === 'emperor' && slv === 'citizen') {
    return {
      winner: 'emperor' as const,
      label: '皇帝压制平民 · 皇帝方胜（1×）',
    };
  }
  if (emp === 'citizen' && slv === 'slave') {
    return {
      winner: 'emperor' as const,
      label: '平民压制奴隶 · 皇帝方胜（1×）',
    };
  }
  return {
    winner: 'slave' as const,
    label: '奴隶反杀皇帝 · 奴隶方胜（5× 奖金）',
  };
}

function CardTile({
  kind,
  selected,
  used,
  size = 'sm',
}: {
  kind: CardKind;
  selected?: boolean;
  used?: boolean;
  size?: 'sm' | 'lg';
}) {
  const isLg = size === 'lg';
  const Icon = kind === 'emperor' ? Crown : kind === 'slave' ? Skull : Shield;
  const label = kind === 'emperor' ? '皇帝' : kind === 'slave' ? '奴隶' : '平民';

  const tone = used
    ? 'border-[var(--border-hairline)] bg-[var(--bg-page)]/45 text-[var(--text-muted)] opacity-45 line-through'
    : kind === 'emperor'
      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
      : kind === 'slave'
        ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]';

  return (
    <div
      className={`flex flex-col items-center justify-center border transition-all select-none ${tone} ${
        isLg ? 'w-[76px] h-[102px] rounded-xl gap-1.5' : 'w-full h-[58px] rounded-lg gap-1'
      } ${selected && !used ? 'ring-2 ring-[var(--text-primary)] -translate-y-0.5' : ''}`}
    >
      <Icon className={isLg ? 'w-6 h-6' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span className={isLg ? 'text-[13px] font-bold' : 'text-[11px] font-semibold'}>
        {label}
      </span>
    </div>
  );
}

export function ECardDiagram() {
  // 默认先演示已消耗 1 对平民后的胶着状态，并预选皇帝 vs 奴隶供直接观察
  const [usedEmp, setUsedEmp] = useState<number[]>([4]);
  const [usedSlv, setUsedSlv] = useState<number[]>([4]);
  const [empPick, setEmpPick] = useState<number>(0);
  const [slvPick, setSlvPick] = useState<number>(0);
  const [lastClash, setLastClash] = useState<{
    emp: CardKind;
    slv: CardKind;
    winner: 'tie' | 'emperor' | 'slave';
    label: string;
  }>({
    emp: 'emperor',
    slv: 'slave',
    winner: 'slave',
    label: '奴隶反杀皇帝 · 奴隶方胜（5× 奖金）',
  });
  const [matchNo, setMatchNo] = useState<number>(1);
  const [finished, setFinished] = useState<boolean>(false);

  const playTurn = () => {
    if (finished) return;
    if (usedEmp.includes(empPick) || usedSlv.includes(slvPick)) return;

    const eCard = EMPEROR_DECK[empPick].kind;
    const sCard = SLAVE_DECK[slvPick].kind;
    const res = judgeClash(eCard, sCard);

    const nextUsedEmp = [...usedEmp, empPick];
    const nextUsedSlv = [...usedSlv, slvPick];
    setUsedEmp(nextUsedEmp);
    setUsedSlv(nextUsedSlv);
    setLastClash({ emp: eCard, slv: sCard, ...res });

    if (res.winner === 'tie') {
      const nextEmpAvail = EMPEROR_DECK.find((c) => !nextUsedEmp.includes(c.id));
      const nextSlvAvail = SLAVE_DECK.find((c) => !nextUsedSlv.includes(c.id));
      if (nextEmpAvail) setEmpPick(nextEmpAvail.id);
      if (nextSlvAvail) setSlvPick(nextSlvAvail.id);
    } else {
      setFinished(true);
    }
  };

  const nextMatch = (resetAll = false) => {
    setUsedEmp([]);
    setUsedSlv([]);
    setEmpPick(1);
    setSlvPick(1);
    setFinished(false);
    const nextNum = resetAll ? 1 : (matchNo % 12) + 1;
    setMatchNo(nextNum);
    setLastClash({
      emp: 'citizen',
      slv: 'citizen',
      winner: 'tie',
      label: '选定双方手牌后点击「亮牌」',
    });
  };

  const swappedPhase = Math.floor((matchNo - 1) / 3) % 2 === 1;
  const handNumber = usedEmp.length + (finished ? 0 : 1);

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：局数与 3 局换边状态 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              第 {matchNo} / 12 局 · 第 {Math.min(5, handNumber)} 手
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-brass)]">
              {swappedPhase ? '已互换身份（每 3 局换边）' : '每 3 局双方互换皇帝 / 奴隶'}
            </span>
          </div>
          <button
            type="button"
            data-testid="ecard-reset-btn"
            onClick={() => nextMatch(true)}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            新开一局
          </button>
        </div>

        {/* 牌桌主体 */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* 皇帝方手牌 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-brass)]">皇帝方</span>
              <span className="text-[var(--text-secondary)] tabular-nums">
                余 {5 - usedEmp.length} 张
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {EMPEROR_DECK.map((card) => {
                const used = usedEmp.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    disabled={used || finished}
                    data-testid={`ecard-emp-${card.id}`}
                    aria-pressed={empPick === card.id && !used}
                    onClick={() => setEmpPick(card.id)}
                    className={`rounded-lg ${
                      used || finished ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <CardTile kind={card.kind} selected={empPick === card.id} used={used} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 中央出牌结算区 */}
          <div className="flex flex-col items-center justify-center gap-2.5 py-1">
            <div className="flex items-center gap-3">
              <CardTile
                kind={finished ? lastClash.emp : EMPEROR_DECK[empPick].kind}
                size="lg"
              />
              <span className="font-mincho text-sm text-[var(--text-secondary)] select-none">VS</span>
              <CardTile
                kind={finished ? lastClash.slv : SLAVE_DECK[slvPick].kind}
                size="lg"
              />
            </div>

            {finished ? (
              <button
                type="button"
                data-testid="ecard-next-match-btn"
                onClick={() => nextMatch(false)}
                className="px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                进入第 {(matchNo % 12) + 1} 局
              </button>
            ) : (
              <button
                type="button"
                data-testid="ecard-clash-btn"
                onClick={playTurn}
                className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                亮牌交手
              </button>
            )}
          </div>

          {/* 奴隶方手牌 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--diagram-accent)]">奴隶方（5×）</span>
              <span className="text-[var(--text-secondary)] tabular-nums">
                余 {5 - usedSlv.length} 张
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {SLAVE_DECK.map((card) => {
                const used = usedSlv.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    disabled={used || finished}
                    data-testid={`ecard-slv-${card.id}`}
                    aria-pressed={slvPick === card.id && !used}
                    onClick={() => setSlvPick(card.id)}
                    className={`rounded-lg ${
                      used || finished ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <CardTile kind={card.kind} selected={slvPick === card.id} used={used} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 当前结算提示 */}
        <div
          data-testid="ecard-verdict"
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] font-semibold text-center border ${
            lastClash.winner === 'slave'
              ? 'border-[var(--diagram-accent)]/50 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : lastClash.winner === 'emperor'
                ? 'border-[var(--diagram-brass)]/50 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {lastClash.label}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        平民对平民会消耗手牌继续出下一张，手牌越少心理压迫越强；选双方牌点「亮牌交手」可体验整局推进。
      </p>
    </div>
  );
}
