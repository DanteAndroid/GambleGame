import { useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  Camera,
  Check,
  Coins,
  Crosshair,
  Eye,
  FileText,
  Flag,
  Flame,
  Gavel,
  Hand,
  KeyRound,
  Layers,
  Lock,
  Moon,
  Package,
  Play,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  Ship,
  Skull,
  Snowflake,
  Spade,
  Users,
  Vote,
  X,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 1. 笔仙游戏 (tomodachi-kokkuri)                                             */
/* -------------------------------------------------------------------------- */

type KokkuriAction = 'agree' | 'sabotage' | 'lift';

const KOKKURI_PLAYERS = [
  { id: 'A', label: '成员 A', x: 82, y: 34 },
  { id: 'B', label: '成员 B', x: 210, y: 24 },
  { id: 'C', label: '成员 C', x: 338, y: 34 },
  { id: 'D', label: '成员 D', x: 118, y: 158 },
  { id: 'E', label: '成员 E', x: 302, y: 158 },
] as const;

const KOKKURI_META: Record<
  KokkuriAction,
  {
    label: string;
    coinX: number;
    coinY: number;
    debtDelta: number;
    trustDelta: number;
    note: string;
  }
> = {
  agree: {
    label: '五人合力向「是」',
    coinX: 98,
    coinY: 92,
    debtDelta: -40,
    trustDelta: 4,
    note: '五指施力方向一致，硬币平稳滑向「是」，本轮答对并小幅削减总债务，信任链稳固。',
  },
  sabotage: {
    label: '暗中有人推向「否」',
    coinX: 322,
    coinY: 92,
    debtDelta: 200,
    trustDelta: -32,
    note: '全程禁言下有人暗中发力把硬币推偏至「否」，不仅答错加债 200 万，队内立刻爆发相互猜疑。',
  },
  lift: {
    label: '中途移开手指',
    coinX: 210,
    coinY: 92,
    debtDelta: 400,
    trustDelta: -45,
    note: '有成员中途擅自抬离十日元硬币，直接触发重额罚金 +400 万，默契与信任大幅崩塌。',
  },
};

function KokkuriDiagram() {
  const [round, setRound] = useState<number>(1);
  const [action, setAction] = useState<KokkuriAction>('agree');
  const [committedDebt, setCommittedDebt] = useState<number>(2000);
  const [committedTrust, setCommittedTrust] = useState<number>(92);
  const [history, setHistory] = useState<KokkuriAction[]>([]);

  const finished = history.length >= 3;
  const activeMeta = KOKKURI_META[action];
  const liveDebt = finished ? committedDebt : Math.max(0, committedDebt + activeMeta.debtDelta);
  const liveTrust = finished
    ? committedTrust
    : Math.max(5, Math.min(100, committedTrust + activeMeta.trustDelta));

  const commitRound = () => {
    if (finished) return;
    const nextDebt = Math.max(0, committedDebt + activeMeta.debtDelta);
    const nextTrust = Math.max(5, Math.min(100, committedTrust + activeMeta.trustDelta));
    setCommittedDebt(nextDebt);
    setCommittedTrust(nextTrust);
    setHistory((prev) => [...prev, action]);
    setRound((r) => Math.min(3, r + 1));
  };

  const reset = () => {
    setRound(1);
    setAction('agree');
    setCommittedDebt(2000);
    setCommittedTrust(92);
    setHistory([]);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            {finished ? '三轮作答已结束' : `第 ${round} / 3 题推演`} · 禁言触币作答
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置三轮
          </button>
        </div>

        {/* 桌面 SVG */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 sm:p-4 space-y-3">
          <svg
            viewBox="0 0 420 184"
            className="w-full max-w-[440px] mx-auto h-auto block select-none"
            role="img"
            aria-label="五名玩家指尖同按十日元硬币桌面示意图"
          >
            {/* 桌面纸面 */}
            <rect
              x="24"
              y="14"
              width="372"
              height="156"
              rx="14"
              fill="var(--diagram-surface)"
              stroke="var(--diagram-border)"
              strokeWidth="1.5"
            />

            {/* 「是」区域 */}
            <circle
              cx="98"
              cy="92"
              r="30"
              fill={
                action === 'agree'
                  ? 'color-mix(in srgb, var(--diagram-brass) 24%, var(--diagram-panel))'
                  : 'var(--diagram-panel)'
              }
              stroke={action === 'agree' ? 'var(--diagram-brass)' : 'var(--diagram-border)'}
              strokeWidth={action === 'agree' ? '2' : '1.4'}
            />
            <text
              x="98"
              y="97"
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              fill={action === 'agree' ? 'var(--diagram-brass)' : 'var(--text-secondary)'}
            >
              是
            </text>

            {/* 中心起始环 */}
            <circle
              cx="210"
              cy="92"
              r="22"
              fill="none"
              stroke="var(--diagram-border)"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* 「否」区域 */}
            <circle
              cx="322"
              cy="92"
              r="30"
              fill={
                action === 'sabotage'
                  ? 'color-mix(in srgb, var(--diagram-accent) 24%, var(--diagram-panel))'
                  : 'var(--diagram-panel)'
              }
              stroke={action === 'sabotage' ? 'var(--diagram-accent)' : 'var(--diagram-border)'}
              strokeWidth={action === 'sabotage' ? '2' : '1.4'}
            />
            <text
              x="322"
              y="97"
              textAnchor="middle"
              fontSize="16"
              fontWeight="700"
              fill={action === 'sabotage' ? 'var(--diagram-accent)' : 'var(--text-secondary)'}
            >
              否
            </text>

            {/* 滑动轨迹虚线 */}
            {action !== 'lift' && (
              <line
                x1="210"
                y1="92"
                x2={activeMeta.coinX}
                y2={activeMeta.coinY}
                stroke={action === 'agree' ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
                strokeWidth="2"
                strokeDasharray="5 3"
              />
            )}

            {/* 五人手指连线与席位 */}
            {KOKKURI_PLAYERS.map((p, idx) => {
              const isSaboteur = action === 'sabotage' && idx === 4;
              const isLifter = action === 'lift' && idx === 2;
              const targetX = isLifter ? p.x - 16 : activeMeta.coinX;
              const targetY = isLifter ? p.y + 18 : activeMeta.coinY;
              return (
                <g key={p.id}>
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={targetX}
                    y2={targetY}
                    stroke={
                      isSaboteur || isLifter
                        ? 'var(--diagram-accent)'
                        : action === 'agree'
                          ? 'var(--diagram-brass)'
                          : 'var(--text-secondary)'
                    }
                    strokeWidth={isSaboteur ? '2.6' : '1.6'}
                    strokeDasharray={isLifter ? '3 3' : undefined}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="11"
                    fill={
                      isSaboteur || isLifter
                        ? 'color-mix(in srgb, var(--diagram-accent) 26%, var(--diagram-panel))'
                        : 'var(--diagram-panel)'
                    }
                    stroke={isSaboteur || isLifter ? 'var(--diagram-accent)' : 'var(--diagram-border)'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="700"
                    fill={isSaboteur || isLifter ? 'var(--diagram-accent)' : 'var(--text-primary)'}
                  >
                    {p.id}
                  </text>
                </g>
              );
            })}

            {/* 十日元硬币 */}
            <g>
              {action === 'lift' && (
                <circle
                  cx={activeMeta.coinX}
                  cy={activeMeta.coinY}
                  r="24"
                  fill="none"
                  stroke="var(--diagram-accent)"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                />
              )}
              <circle
                cx={activeMeta.coinX}
                cy={activeMeta.coinY}
                r="16"
                fill="color-mix(in srgb, var(--diagram-brass) 34%, var(--diagram-panel))"
                stroke={action === 'agree' ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
                strokeWidth="2.2"
              />
              <text
                x={activeMeta.coinX}
                y={activeMeta.coinY + 4}
                textAnchor="middle"
                fontSize="10.5"
                fontWeight="700"
                fill="var(--text-primary)"
              >
                10円
              </text>
            </g>
          </svg>

          {/* 三种施力切换按钮 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(['agree', 'sabotage', 'lift'] as const).map((mode) => {
              const selected = action === mode;
              const isDanger = mode !== 'agree';
              return (
                <button
                  key={mode}
                  type="button"
                  disabled={finished}
                  onClick={() => setAction(mode)}
                  className={`px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5 ${
                    selected
                      ? isDanger
                        ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                        : 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Hand className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{KOKKURI_META[mode].label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 债务与队内信任面板 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--text-secondary)] font-medium">团队总债务</span>
              <span
                className={`tabular-nums font-bold text-[14px] ${
                  liveDebt > 2000 ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                }`}
              >
                {liveDebt} 万日元
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (liveDebt / 3200) * 100)}%` }}
                className={`h-full rounded-full transition-all ${
                  liveDebt > 2000 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                }`}
              />
            </div>
          </div>

          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-[var(--text-secondary)] font-medium">队内信任度</span>
              <span
                className={`tabular-nums font-bold text-[14px] ${
                  liveTrust < 55 ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                }`}
              >
                {liveTrust}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                style={{ width: `${liveTrust}%` }}
                className={`h-full rounded-full transition-all ${
                  liveTrust < 55 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 确认本轮 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5">
          <p className="text-[12px] text-[var(--text-primary)] leading-relaxed flex-1 min-w-[200px]">
            {finished
              ? `三轮结算完毕：最终总债务 ${committedDebt} 万日元，队内信任剩 ${committedTrust}%。`
              : activeMeta.note}
          </p>
          <button
            type="button"
            disabled={finished}
            onClick={commitRound}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer shrink-0"
          >
            <Play className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{finished ? '已完成三轮' : `落定第 ${round} 题`}</span>
          </button>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        五人指尖同压一枚硬币且全程不得交谈，只要有人暗中发力推偏，全队既背罚金又无从当场抓出推手。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. 说坏话双六 (tomodachi-badmouth-sugoroku)                                */
/* -------------------------------------------------------------------------- */

const SUGOROKU_NAMES = ['玩家甲', '玩家乙', '玩家丙', '玩家丁', '玩家戊'] as const;
const SECRET_SURGE_ORDER = [1, 3, 0, 2, 1, 3, 0, 2] as const;

function BadmouthSugorokuDiagram() {
  const [positions, setPositions] = useState<number[]>([0, 0, 0, 0, 0]);
  const [turn, setTurn] = useState<number>(1);
  const [secretCount, setSecretCount] = useState<number>(0);
  const [log, setLog] = useState<string>(
    '选择「全员交白卷」或「匿名写劲爆秘密」，观察 60 格赛道如何被瞬间拉爆。'
  );

  const finishedCount = positions.filter((p) => p >= 60).length;
  const isOver = finishedCount >= 4;
  const allClearedTogether = finishedCount === 5;
  const minPos = Math.min(...positions);
  const maxPos = Math.max(...positions);
  const hasGap = maxPos - minPos > 0;

  const submitBlank = () => {
    if (isOver) return;
    const next = positions.map((p) => (p >= 60 ? 60 : Math.min(60, p + 12)));
    setPositions(next);
    setTurn((t) => t + 1);
    const nextFinished = next.filter((p) => p >= 60).length;
    if (nextFinished === 5) {
      setLog('全员坚持交白卷，五人同步抵达 60 格终点，无人落后，债务平摊且无额外伤疤！');
    } else if (nextFinished >= 4) {
      const loserIdx = next.findIndex((p) => p < 60);
      setLog(
        `已有 4 人脱身，${SUGOROKU_NAMES[loserIdx]} 成为唯一落单者，被迫独自扛下全队 2000 万巨债！`
      );
    } else {
      setLog(`第 ${turn} 回合：全员交白卷，未到终点者统一平稳前进 +12 格，队形保持稳定。`);
    }
  };

  const submitSecret = () => {
    if (isOver) return;
    const activeIndices = positions
      .map((p, idx) => ({ p, idx }))
      .filter((item) => item.p < 60);
    // 优先推进非垫底的活跃角色，直观呈现“被写劲爆秘密者猛冲脱身、留最后一人独扛”
    const preferred = SECRET_SURGE_ORDER[secretCount % SECRET_SURGE_ORDER.length];
    const targetIdx =
      positions[preferred] < 60
        ? preferred
        : activeIndices[0]?.idx ?? 0;

    const surge = 18;
    const next = positions.map((p, idx) => {
      if (p >= 60) return 60;
      if (idx === targetIdx) return Math.min(60, p + surge);
      return p;
    });
    setPositions(next);
    setTurn((t) => t + 1);
    setSecretCount((c) => c + 1);

    const nextFinished = next.filter((p) => p >= 60).length;
    if (nextFinished >= 4 && nextFinished < 5) {
      const loserIdx = next.findIndex((p) => p < 60);
      setLog(
        `匿名秘密曝光！${SUGOROKU_NAMES[targetIdx]} 猛冲 +${surge} 格率先脱身，仅剩 ${SUGOROKU_NAMES[loserIdx]} 垫底独扛全队 2000 万巨债！`
      );
    } else {
      setLog(
        `第 ${turn} 回合：匿名劲爆秘密被抽中！${SUGOROKU_NAMES[targetIdx]} 猛冲 +${surge} 格（达 ${next[targetIdx]}/60），差距骤然拉大。`
      );
    }
  };

  const reset = () => {
    setPositions([0, 0, 0, 0, 0]);
    setTurn(1);
    setSecretCount(0);
    setLog('选择「全员交白卷」或「匿名写劲爆秘密」，观察 60 格赛道如何被瞬间拉爆。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            {isOver ? '赛道结算完成' : `第 ${turn} 回合`} · 终点 60 格（已脱身{' '}
            <strong className="tabular-nums text-[var(--diagram-brass)]">{finishedCount}</strong> / 5 人）
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置棋盘
          </button>
        </div>

        {/* 60 格双六赛道 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          {/* 刻度标尺 */}
          <div className="flex items-center justify-between text-[10.5px] tabular-nums text-[var(--text-muted)] pl-[66px] pr-[52px]">
            <span>0 格</span>
            <span>20 格</span>
            <span>40 格</span>
            <span>60 终点</span>
          </div>

          <div className="space-y-2.5">
            {SUGOROKU_NAMES.map((name, idx) => {
              const pos = positions[idx];
              const pct = (pos / 60) * 100;
              const escaped = pos >= 60;
              const isLastDanger = !allClearedTogether && hasGap && pos === minPos && !escaped;
              return (
                <div key={name} className="flex items-center gap-2.5 text-[12px]">
                  <span
                    className={`w-[56px] shrink-0 font-semibold ${
                      isLastDanger
                        ? 'text-[var(--diagram-accent)]'
                        : escaped
                          ? 'text-[var(--diagram-brass)]'
                          : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {name}
                  </span>
                  <div className="relative flex-1 h-5 rounded-full bg-[var(--diagram-surface)] border border-[var(--diagram-border)] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isLastDanger
                          ? 'bg-[color-mix(in_srgb,var(--diagram-accent)_48%,transparent)]'
                          : escaped
                            ? 'bg-[var(--diagram-brass)]'
                            : 'bg-[color-mix(in_srgb,var(--diagram-brass)_65%,var(--diagram-panel))]'
                      }`}
                    />
                    <div
                      style={{ left: `calc(${Math.min(96, Math.max(4, pct))}% - 8px)` }}
                      className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all duration-300 ${
                        isLastDanger
                          ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)] border-[var(--diagram-accent)]'
                          : 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] border-[var(--diagram-surface)]'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  </div>
                  <span
                    className={`w-[44px] text-right tabular-nums text-[11px] font-semibold shrink-0 ${
                      isLastDanger
                        ? 'text-[var(--diagram-accent)]'
                        : escaped
                          ? 'text-[var(--diagram-brass)]'
                          : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {escaped ? '脱身' : `${pos}/60`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 垫底警示条 */}
          <div className="pt-2 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="text-[var(--text-secondary)]">
              当前差距：<strong className="tabular-nums text-[var(--text-primary)]">{maxPos - minPos} 格</strong>
            </span>
            <span
              className={`font-semibold ${
                allClearedTogether
                  ? 'text-[var(--diagram-brass)]'
                  : hasGap
                    ? 'text-[var(--diagram-accent)]'
                    : 'text-[var(--diagram-brass)]'
              }`}
            >
              {allClearedTogether
                ? '全员同步过关 · 平摊 400 万/人'
                : isOver
                  ? '垫底者独扛全队 2000 万巨债'
                  : hasGap
                    ? '队形已撕裂 · 末位面临独扛全债风险'
                    : '步调完全一致 · 暂无人落后'}
            </span>
          </div>
        </div>

        {/* 双策略按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={isOver}
            onClick={submitBlank}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>全员交白卷（平稳共同前进）</span>
          </button>
          <button
            type="button"
            disabled={isOver}
            onClick={submitSecret}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>匿名写劲爆秘密（被写者猛冲）</span>
          </button>
        </div>

        <p className="text-[12px] text-[var(--text-primary)] text-center leading-relaxed">{log}</p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        全员交白卷本可齐头并进零伤过关，但只要有人偷写劲爆秘密拉大差距，末尾者就会独自背负原本五人平摊的全部债务。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. 友情躲猫猫 (tomodachi-hide-and-seek)                                    */
/* -------------------------------------------------------------------------- */

type HideSeekMode = 'supply' | 'capture' | 'forfeit';

const HIDE_SEEK_DATA: Record<
  HideSeekMode,
  {
    label: string;
    stamina: number;
    exposure: number;
    verdict: string;
    isWin: boolean;
    isLose: boolean;
    note: string;
  }
> = {
  supply: {
    label: '秘密送水粮补给',
    stamina: 82,
    exposure: 78,
    verdict: '持续拉锯 · 暴露风险飙升',
    isWin: false,
    isLose: false,
    note: '搜寻队员潜入山林送水送粮，虽替绝粮藏匿者续命，但往返足迹极易引来敌方尾随锁定藏身点。',
  },
  capture: {
    label: '搜寻拍照喊名认证',
    stamina: 56,
    exposure: 25,
    verdict: '己方当场获胜',
    isWin: true,
    isLose: false,
    note: '外围搜寻队在密林中发现敌方藏匿者，高喊其姓名并完成拍照认证，瞬间终结七日赛程拿下胜利。',
  },
  forfeit: {
    label: '藏匿者按弃权键',
    stamina: 8,
    exposure: 15,
    verdict: '己方直接判负',
    isWin: false,
    isLose: true,
    note: '断水断粮数日且迟迟等不到补给，己方藏匿者因饥渴崩溃按下弃权按钮，全队立刻落败。',
  },
};

function HideAndSeekDiagram() {
  const [mode, setMode] = useState<HideSeekMode>('supply');
  const current = HIDE_SEEK_DATA[mode];

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            深山双队对抗地图 · 赛程上限 7 天
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              current.isWin
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : current.isLose
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
            }`}
          >
            {current.verdict}
          </span>
        </div>

        {/* 深山双队地形 SVG */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 sm:p-4">
          <svg
            viewBox="0 0 420 176"
            className="w-full max-w-[440px] mx-auto h-auto block select-none"
            role="img"
            aria-label="深山双队藏匿者与外围搜寻队地图"
          >
            {/* 等高线与山脊轮廓 */}
            <path
              d="M 16 146 L 78 68 L 138 122 L 210 52 L 288 120 L 346 64 L 404 146 Z"
              fill="color-mix(in srgb, var(--diagram-surface) 80%, transparent)"
              stroke="var(--diagram-border)"
              strokeWidth="1.3"
            />
            <line
              x1="210"
              y1="14"
              x2="210"
              y2="162"
              stroke="var(--diagram-border)"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />
            <text x="108" y="24" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--diagram-brass)">
              己方山林区
            </text>
            <text x="314" y="24" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-secondary)">
              敌方山林区
            </text>

            {/* 己方绝粮藏匿者 */}
            <g transform="translate(76, 108)">
              {mode === 'forfeit' && (
                <circle
                  cx="0"
                  cy="0"
                  r="25"
                  fill="color-mix(in srgb, var(--diagram-accent) 22%, transparent)"
                  stroke="var(--diagram-accent)"
                  strokeWidth="1.8"
                  strokeDasharray="4 2"
                />
              )}
              <circle
                cx="0"
                cy="0"
                r="15"
                fill="color-mix(in srgb, var(--diagram-brass) 24%, var(--diagram-surface))"
                stroke={mode === 'forfeit' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
                strokeWidth="2"
              />
              <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-primary)">
                藏
              </text>
              <text x="0" y="30" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-primary)">
                己方藏匿者
              </text>
              {mode === 'forfeit' && (
                <text x="0" y="-29" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--diagram-accent)">
                  按下弃权键！
                </text>
              )}
            </g>

            {/* 己方搜寻队 */}
            <g transform={mode === 'capture' ? 'translate(292, 92)' : 'translate(158, 70)'}>
              <rect
                x="-18"
                y="-12"
                width="36"
                height="24"
                rx="6"
                fill="var(--diagram-brass)"
              />
              <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--btn-primary-fg)">
                己方搜
              </text>
            </g>

            {/* 补给线与敌方侦测弧 */}
            {mode === 'supply' && (
              <>
                <path
                  d="M 142 78 Q 108 82 90 100"
                  fill="none"
                  stroke="var(--diagram-brass)"
                  strokeWidth="2.2"
                  strokeDasharray="4 3"
                />
                <text x="116" y="64" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--diagram-brass)">
                  偷送水粮
                </text>
                <path
                  d="M 248 74 Q 204 54 176 68"
                  fill="none"
                  stroke="var(--diagram-accent)"
                  strokeWidth="1.8"
                  strokeDasharray="3 3"
                />
                <text x="220" y="48" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--diagram-accent)">
                  行踪易暴露
                </text>
              </>
            )}

            {/* 敌方搜寻队 */}
            <g transform="translate(262, 74)">
              <rect
                x="-18"
                y="-12"
                width="36"
                height="24"
                rx="6"
                fill="var(--diagram-surface)"
                stroke="var(--diagram-border)"
                strokeWidth="1.6"
              />
              <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-secondary)">
                敌方搜
              </text>
            </g>

            {/* 敌方藏匿者 */}
            <g transform="translate(346, 108)">
              {mode === 'capture' && (
                <>
                  <rect
                    x="-24"
                    y="-24"
                    width="48"
                    height="48"
                    rx="6"
                    fill="color-mix(in srgb, var(--diagram-brass) 18%, transparent)"
                    stroke="var(--diagram-brass)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                  <text x="0" y="-30" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--diagram-brass)">
                    喊名 + 拍照认证！
                  </text>
                </>
              )}
              <circle
                cx="0"
                cy="0"
                r="15"
                fill="var(--diagram-surface)"
                stroke={mode === 'capture' ? 'var(--diagram-brass)' : 'var(--text-secondary)'}
                strokeWidth="2"
              />
              <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-primary)">
                敌藏
              </text>
              <text x="0" y="30" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-secondary)">
                敌方藏匿者
              </text>
            </g>
          </svg>
        </div>

        {/* 三大机制切换按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(
            [
              { key: 'supply', icon: Package, label: '秘密送水粮补给' },
              { key: 'capture', icon: Camera, label: '拍照喊名认证（即胜）' },
              { key: 'forfeit', icon: Flag, label: '撑不住按弃权（即负）' },
            ] as const
          ).map(({ key, icon: Icon, label }) => {
            const active = mode === key;
            const danger = key === 'forfeit';
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                  active
                    ? danger
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                      : 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* 体能与暴露风险条 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">己方藏匿者体能</span>
              <span className="tabular-nums font-semibold text-[var(--text-primary)]">{current.stamina}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                style={{ width: `${current.stamina}%` }}
                className={`h-full rounded-full transition-all ${
                  current.stamina < 25 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                }`}
              />
            </div>
          </div>

          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">藏身点暴露风险</span>
              <span className="tabular-nums font-semibold text-[var(--text-primary)]">{current.exposure}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                style={{ width: `${current.exposure}%` }}
                className={`h-full rounded-full transition-all ${
                  current.exposure > 60 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                }`}
              />
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[var(--text-primary)] text-center leading-relaxed">{current.note}</p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        藏匿者断水断粮，队友送补给容易暴露位置，不送又怕藏匿者撑不住按弃权，攻守节奏全压在补给与搜寻的取舍上。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. 假朋友游戏·拷问房 (tomodachi-fake-game)                                  */
/* -------------------------------------------------------------------------- */

type FakeStrategy = 'beg' | 'bluff';

const FAKE_STAGES = ['开场威吓', '施加剧痛', '极限对峙'] as const;

function FakeGameDiagram() {
  const [strategy, setStrategy] = useState<FakeStrategy>('beg');
  const [stage, setStage] = useState<number>(2);

  const isBluff = strategy === 'bluff';
  const hostageDanger = isBluff ? [48, 36, 18][stage] : [55, 82, 98][stage];
  const kidnapperMorale = isBluff ? [72, 38, 8][stage] : [88, 94, 98][stage];

  const statusText = isBluff
    ? stage === 2
      ? '反客为主的疯劲与冷静反制彻底击穿绑匪心理防线，对方慌乱退缩并被迫放人。'
      : '人质毫不求饶，反而用反常举动步步逼问绑匪底线，局势开始逆转。'
    : stage === 2
      ? '即便咬牙忍痛不发一声，绑匪根本无意履约放人，只顾继续加码施暴。'
      : '顺着伪造规则忍痛求饶，主动权完全握在毫无底线的绑匪手里。';

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <ShieldAlert className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
            无官方规则 · 密室拷问心理对峙
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isBluff && stage === 2
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
            }`}
          >
            {isBluff && stage === 2 ? '绑匪崩溃 · 被迫放人' : isBluff ? '反向施压中' : '绑匪绝不放人'}
          </span>
        </div>

        {/* 对峙示意图 SVG */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3">
          <svg
            viewBox="0 0 420 110"
            className="w-full max-w-[440px] mx-auto h-auto block select-none"
            role="img"
            aria-label="拷问房内受绑人质与绑匪心理博弈示意图"
          >
            <line x1="20" y1="88" x2="400" y2="88" stroke="var(--diagram-border)" strokeWidth="1.5" />

            {/* 受绑人质 */}
            <g transform="translate(88, 22)">
              <circle
                cx="0"
                cy="12"
                r="10"
                fill="none"
                stroke={isBluff ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
                strokeWidth="2"
              />
              <rect
                x="-14"
                y="26"
                width="28"
                height="34"
                rx="5"
                fill={
                  isBluff
                    ? 'color-mix(in srgb, var(--diagram-brass) 20%, var(--diagram-surface))'
                    : 'color-mix(in srgb, var(--diagram-accent) 18%, var(--diagram-surface))'
                }
                stroke={isBluff ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
                strokeWidth="1.6"
              />
              {/* 绳索示意线 */}
              <line x1="-15" y1="38" x2="15" y2="38" stroke="var(--text-muted)" strokeWidth="1.8" />
              <line x1="-15" y1="48" x2="15" y2="48" stroke="var(--text-muted)" strokeWidth="1.8" />
              <text x="0" y="79" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-primary)">
                受绑人质
              </text>
            </g>

            {/* 心理压迫流向箭头 */}
            {isBluff ? (
              <g>
                <line x1="126" y1="50" x2="286" y2="50" stroke="var(--diagram-brass)" strokeWidth="2.4" />
                <polygon points="294,50 282,43 282,57" fill="var(--diagram-brass)" />
                <text x="210" y="38" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--diagram-brass)">
                  反手心理震慑 →
                </text>
                <text x="210" y="68" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
                  以疯狂姿态反击绑匪软肋
                </text>
              </g>
            ) : (
              <g>
                <line x1="294" y1="50" x2="134" y2="50" stroke="var(--diagram-accent)" strokeWidth="2.4" />
                <polygon points="126,50 138,43 138,57" fill="var(--diagram-accent)" />
                <text x="210" y="38" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--diagram-accent)">
                  ← 单方面拷问施暴
                </text>
                <text x="210" y="68" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
                  伪造规则毫无约束力
                </text>
              </g>
            )}

            {/* 绑匪 */}
            <g transform="translate(332, 20)">
              <circle
                cx="0"
                cy="12"
                r="10"
                fill="none"
                stroke={isBluff ? 'var(--text-muted)' : 'var(--diagram-accent)'}
                strokeWidth="2"
              />
              <path
                d="M -13 28 L 13 28 L 16 66 L -16 66 Z"
                fill="var(--diagram-surface)"
                stroke={isBluff ? 'var(--diagram-border)' : 'var(--diagram-accent)'}
                strokeWidth="1.6"
                strokeDasharray={isBluff && stage === 2 ? '3 2' : undefined}
              />
              <text x="0" y="81" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-primary)">
                绑匪团伙
              </text>
            </g>
          </svg>
        </div>

        {/* 策略切换 + 阶段步进 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setStrategy('beg')}
            className={`px-3.5 py-2.5 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              strategy === 'beg'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>忍痛求饶（绑匪不放人）</span>
          </button>
          <button
            type="button"
            onClick={() => setStrategy('bluff')}
            className={`px-3.5 py-2.5 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              strategy === 'bluff'
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" aria-hidden="true" />
            <span>反手心理震慑（逼对方放人）</span>
          </button>
        </div>

        {/* 冲突阶段选择 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
          <span className="text-[var(--text-secondary)]">对峙阶段：</span>
          <div className="flex items-center gap-1.5">
            {FAKE_STAGES.map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => setStage(idx)}
                className={`px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                  stage === idx
                    ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] font-semibold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 双压力表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">人质受创风险</span>
              <span
                className={`tabular-nums font-bold ${
                  hostageDanger >= 70 ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                }`}
              >
                {hostageDanger}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                style={{ width: `${hostageDanger}%` }}
                className={`h-full rounded-full transition-all ${
                  hostageDanger >= 70 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                }`}
              />
            </div>
          </div>

          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">绑匪心理防线</span>
              <span
                className={`tabular-nums font-bold ${
                  kidnapperMorale <= 25 ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
                }`}
              >
                {kidnapperMorale}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                style={{ width: `${kidnapperMorale}%` }}
                className={`h-full rounded-full transition-all ${
                  kidnapperMorale <= 25 ? 'bg-[var(--diagram-brass)]' : 'bg-[var(--diagram-accent)]'
                }`}
              />
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[var(--text-primary)] text-center leading-relaxed">{statusText}</p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        绑匪编造的“忍痛通关”本就是骗局，没有官方规则兜底时，唯有反过来震慑施暴者才能撬开逃生缺口。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. 罪恶审判 (tomodachi-sin-trial)                                           */
/* -------------------------------------------------------------------------- */

const TRIAL_ACTIONS = [
  {
    id: 'witness',
    label: '传唤证人交叉质证',
    desc: '拆穿控方证词前后矛盾，翻回 3 票',
    targets: [1, 2, 3],
  },
  {
    id: 'evidence',
    label: '呈现现场关键物证',
    desc: '推翻作案时间指控，再翻回 3 票',
    targets: [4, 5, 6],
  },
  {
    id: 'motive',
    label: '攻心击破最后顽固席',
    desc: '瓦解最后一票偏见，拿下全票无罪',
    targets: [7],
  },
] as const;

function SinTrialDiagram() {
  // true = 无罪，false = 有罪；初始仅 1 票无罪，7 票有罪
  const [votes, setVotes] = useState<boolean[]>([true, false, false, false, false, false, false, false]);
  const [usedActions, setUsedActions] = useState<string[]>([]);

  const innocentCount = votes.filter(Boolean).length;
  const guiltyCount = votes.length - innocentCount;
  const unanimousPass = guiltyCount === 0;

  const applyAction = (id: string, targets: readonly number[]) => {
    setVotes((prev) => prev.map((v, idx) => (targets.includes(idx) ? true : v)));
    setUsedActions((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const toggleJuror = (index: number) => {
    setVotes((prev) => prev.map((v, idx) => (idx === index ? !v : v)));
  };

  const reset = () => {
    setVotes([true, false, false, false, false, false, false, false]);
    setUsedActions([]);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Scale className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            陪审团终审票数板 · 无罪{' '}
            <strong
              className={`tabular-nums text-[14px] ${
                unanimousPass ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
              }`}
            >
              {innocentCount} / 8
            </strong>
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置开庭
          </button>
        </div>

        {/* 陪审团 8 席票板 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {votes.map((isInnocent, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleJuror(idx)}
                className={`rounded-lg border px-2 py-2.5 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isInnocent
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                }`}
              >
                <span className="text-[10.5px] text-[var(--text-secondary)] tabular-nums">陪审 {idx + 1}</span>
                <span className="inline-flex items-center gap-1 text-[12px] font-bold">
                  {isInnocent ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      无罪
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                      有罪
                    </>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* 100% 严苛门槛横幅 */}
          <div
            className={`rounded-lg border px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[12px] ${
              unanimousPass
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-surface))]'
                : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-surface))]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Gavel
                className={`w-3.5 h-3.5 ${
                  unanimousPass ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
                }`}
                aria-hidden="true"
              />
              {unanimousPass
                ? '全员 100% 一致裁定「无罪」· 成功救下同伴！'
                : guiltyCount === 1
                  ? '仅差 1 票！仍有 1 票「有罪」→ 依旧触发全员重罚！'
                  : `尚有 ${guiltyCount} 票「有罪」→ 未达全票无罪门槛，当前判负。`}
            </span>
            <span className="tabular-nums text-[11px] font-semibold text-[var(--text-secondary)]">
              门槛：8 / 8
            </span>
          </div>
        </div>

        {/* 质证与物证翻票按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {TRIAL_ACTIONS.map((item) => {
            const done = usedActions.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => applyAction(item.id, item.targets)}
                className={`rounded-lg border px-3 py-2 text-left transition-all cursor-pointer space-y-0.5 ${
                  done
                    ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)]'
                }`}
              >
                <div className="flex items-center justify-between text-[12px] font-semibold text-[var(--text-primary)]">
                  <span>{item.label}</span>
                  {done && <Check className="w-3.5 h-3.5 text-[var(--diagram-brass)] shrink-0" aria-hidden="true" />}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        点击质证按钮或任意陪审席位即可体验：哪怕赢下 7 票无罪，只要留有 1 票有罪仍算败诉并承受惨重罚则。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. 朋友监狱 (tomodachi-prison-game)                                         */
/* -------------------------------------------------------------------------- */

const PRISON_SUSPECTS = [
  { id: 'p2', label: '囚犯 2 号', isCulprit: false },
  { id: 'p5', label: '囚犯 5 号', isCulprit: false },
  { id: 'p8', label: '囚犯 8 号', isCulprit: true },
  { id: 'p11', label: '囚犯 11 号', isCulprit: false },
] as const;

function PrisonGameDiagram() {
  const [dominoes, setDominoes] = useState<number>(350000);
  const [sabotagedCount, setSabotagedCount] = useState<number>(0);
  const [reportResult, setReportResult] = useState<'none' | 'hit' | 'miss'>('none');
  const [accusedLabel, setAccusedLabel] = useState<string>('');
  const [log, setLog] = useState<string>(
    '白天码放积攒进度、熄灯后可能遭破坏倒退；也可随时向狱警「密告真凶」博取提前出狱。'
  );

  const clearedByDomino = dominoes >= 1000000;
  const pct = Math.min(100, Math.round((dominoes / 1000000) * 100));
  const standingTiles = Math.round((dominoes / 1000000) * 20);

  const stackDominoes = () => {
    if (reportResult !== 'none' || clearedByDomino) return;
    const next = Math.min(1000000, dominoes + 150000);
    setDominoes(next);
    setLog(
      next >= 1000000
        ? '100 万块多米诺终于码齐并顺利推倒，全员靠苦力达成出狱指标！'
        : `十二名囚犯合力码放一天，进度推进 +15 万块（现 ${(next / 10000).toFixed(0)} 万 / 100 万）。`
    );
  };

  const nightSabotage = () => {
    if (reportResult !== 'none' || clearedByDomino) return;
    const next = Math.max(0, dominoes - 250000);
    setDominoes(next);
    setSabotagedCount((c) => c + 1);
    setLog(
      `昨夜熄灯后骨牌惨遭人为推倒！进度暴跌 -25 万块（现 ${(next / 10000).toFixed(0)} 万），线索指向曾靠近堆放区的「囚犯 8 号」。`
    );
  };

  const reportSuspect = (suspect: (typeof PRISON_SUSPECTS)[number]) => {
    setAccusedLabel(suspect.label);
    if (suspect.isCulprit) {
      setReportResult('hit');
      setLog(`密告命中！${suspect.label} 正是夜间破坏者，举报者立刻通关释放并独揽赏金，真凶独担重罚。`);
    } else {
      setReportResult('miss');
      setLog(`密告失误！${suspect.label} 并非真凶，举报者当场受罚出局，破坏者继续隐匿在狱中。`);
    }
  };

  const reset = () => {
    setDominoes(350000);
    setSabotagedCount(0);
    setReportResult('none');
    setAccusedLabel('');
    setLog('白天码放积攒进度、熄灯后可能遭破坏倒退；也可随时向狱警「密告真凶」博取提前出狱。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            100 万块多米诺指标 · 进度{' '}
            <strong className="tabular-nums text-[var(--diagram-brass)]">{pct}%</strong>
            <span className="text-[var(--text-secondary)]">（{(dominoes / 10000).toFixed(0)} 万块）</span>
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置监狱
          </button>
        </div>

        {/* 骨牌阵列 + 进度条 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="flex items-end justify-between gap-1 h-10 px-1" aria-label={`已码放 ${pct}% 多米诺`}>
            {Array.from({ length: 20 }).map((_, i) => {
              const standing = i < standingTiles;
              const justFallen = !standing && sabotagedCount > 0 && i < standingTiles + 5;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    standing
                      ? 'h-9 bg-[var(--diagram-brass)]'
                      : justFallen
                        ? 'h-3 bg-[var(--diagram-accent)] rotate-45 origin-bottom'
                        : 'h-9 border border-dashed border-[var(--diagram-border)] bg-[var(--diagram-surface)]'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={reportResult !== 'none' || clearedByDomino}
              onClick={stackDominoes}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-surface))] text-[var(--diagram-brass)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>白天合力码放（+15 万）</span>
            </button>
            <button
              type="button"
              disabled={reportResult !== 'none' || clearedByDomino}
              onClick={nightSabotage}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-surface))] text-[var(--diagram-accent)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>夜间遭破坏（-25 万）</span>
            </button>
          </div>
        </div>

        {/* 密告真凶面板 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Search className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              秘密向狱警举报破坏者
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              {sabotagedCount > 0 ? '线索：8 号衣袖沾有骨牌漆粉' : '指对独揽赏金 · 指错当场出局'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRISON_SUSPECTS.map((suspect) => {
              const isPicked = accusedLabel === suspect.label;
              const isHit = isPicked && reportResult === 'hit';
              const isMiss = isPicked && reportResult === 'miss';
              return (
                <button
                  key={suspect.id}
                  type="button"
                  onClick={() => reportSuspect(suspect)}
                  className={`px-2.5 py-2 rounded-lg border text-[12px] font-semibold transition-all cursor-pointer ${
                    isHit
                      ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : isMiss
                        ? 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)]'
                  }`}
                >
                  {suspect.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[12px] text-[var(--text-primary)] text-center leading-relaxed">{log}</p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        多米诺耗时漫长且随时会被夜间推倒，密告虽能一键出狱独享赏金，但一旦指错人便会反噬举报者当场受罚。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. 游轮二十一点·弱点博弈 (tomodachi-blackjack)                              */
/* -------------------------------------------------------------------------- */

type DeckPresetId = 'trap' | 'save';

const BLACKJACK_PRESETS: Record<
  DeckPresetId,
  {
    title: string;
    card1: { label: string; value: number };
    card2: { label: string; value: number };
  }
> = {
  trap: {
    title: '牌序一：顶牌 10♠，次牌 6♦',
    card1: { label: '10♠', value: 10 },
    card2: { label: '6♦', value: 6 },
  },
  save: {
    title: '牌序二：顶牌 4♥，次牌 10♣',
    card1: { label: '4♥', value: 4 },
    card2: { label: '10♣', value: 10 },
  },
};

function BlackjackDiagram() {
  const [preset, setPreset] = useState<DeckPresetId>('trap');
  const [seat3Hit, setSeat3Hit] = useState<boolean>(false);

  const deck = BLACKJACK_PRESETS[preset];
  const seat1Total = 19; // 10♥ + 9♣
  const seat2Total = 18; // 8♦ + 10♣
  const seat3Base = 13; // 7♠ + 6♥
  const dealerBase = 15; // K♦ + 5♠（≤16 必补牌）

  const seat3Drawn = seat3Hit ? deck.card1 : null;
  const seat3Total = seat3Base + (seat3Drawn ? seat3Drawn.value : 0);
  const seat3Bust = seat3Total > 21;

  const dealerDrawn = seat3Hit ? deck.card2 : deck.card1;
  const dealerTotal = dealerBase + dealerDrawn.value;
  const dealerBust = dealerTotal > 21;

  const judgePlayer = (total: number, bust: boolean) => {
    if (bust) return { text: '爆牌判负', win: false };
    if (dealerBust) return { text: '庄家爆牌 · 胜', win: true };
    if (total > dealerTotal) return { text: '点数压制 · 胜', win: true };
    if (total === dealerTotal) return { text: '平局退注', win: true };
    return { text: '不敌庄家 · 负', win: false };
  };

  const s1Outcome = judgePlayer(seat1Total, false);
  const s2Outcome = judgePlayer(seat2Total, false);
  const s3Outcome = judgePlayer(seat3Total, seat3Bust);

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Spade className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            同桌牌序模拟器（庄家 ≤16 必补、≥17 必停）
          </span>
          <div className="flex items-center gap-1.5">
            {(['trap', 'save'] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreset(id)}
                className={`px-2.5 py-1 rounded-full border text-[11px] cursor-pointer transition-all ${
                  preset === id
                    ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] font-semibold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {id === 'trap' ? '牌序一' : '牌序二'}
              </button>
            ))}
          </div>
        </div>

        {/* 牌堆顶序 + 庄家区 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 牌堆顶两张 */}
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <div className="text-[11.5px] font-semibold text-[var(--text-secondary)]">{deck.title}</div>
            <div className="flex items-center gap-2.5">
              {[
                {
                  card: deck.card1,
                  badge: seat3Hit ? '→ 3 号拿走' : '→ 庄家补走',
                  highlightBrass: !seat3Hit && dealerBust,
                },
                {
                  card: deck.card2,
                  badge: seat3Hit ? '→ 庄家补走' : '留在牌堆',
                  highlightBrass: seat3Hit && dealerBust,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-lg border px-2.5 py-2 text-center ${
                    item.highlightBrass
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)]'
                  }`}
                >
                  <div className="text-[15px] font-bold tabular-nums text-[var(--text-primary)]">
                    {item.card.label}
                  </div>
                  <div className="text-[10.5px] font-semibold text-[var(--diagram-brass)] mt-0.5">
                    {item.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 庄家手牌 */}
          <div
            className={`rounded-xl border p-3 space-y-2 ${
              dealerBust
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))]'
                : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))]'
            }`}
          >
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[var(--text-primary)]">庄家手牌</span>
              <span
                className={`tabular-nums font-bold ${
                  dealerBust ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
                }`}
              >
                {dealerTotal} 点{dealerBust ? '（爆牌！）' : dealerTotal === 21 ? '（21 点！）' : '（停牌）'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {['K♦', '5♠', dealerDrawn.label].map((c, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1.5 rounded-md border text-[13px] font-bold tabular-nums ${
                    idx === 2
                      ? dealerBust
                        ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                        : 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)]'
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 尾家关键开关 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-[12px] text-[var(--text-primary)]">
            <strong>3 号闲家（尾家 · 起手 7♠ + 6♥ = 13 点）</strong>决策：
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSeat3Hit(false)}
              className={`px-3.5 py-1.5 rounded-full border text-[12px] font-semibold cursor-pointer transition-all ${
                !seat3Hit
                  ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              停牌（Stand）
            </button>
            <button
              type="button"
              onClick={() => setSeat3Hit(true)}
              className={`px-3.5 py-1.5 rounded-full border text-[12px] font-semibold cursor-pointer transition-all ${
                seat3Hit
                  ? 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              要牌（Hit）
            </button>
          </div>
        </div>

        {/* 同桌三名闲家结算 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12px]">
          {[
            { name: '1 号闲家', cards: '10♥ + 9♣', total: seat1Total, outcome: s1Outcome },
            { name: '2 号闲家', cards: '8♦ + 10♣', total: seat2Total, outcome: s2Outcome },
            {
              name: '3 号闲家（尾家）',
              cards: seat3Drawn ? `7♠ + 6♥ + ${seat3Drawn.label}` : '7♠ + 6♥',
              total: seat3Total,
              outcome: s3Outcome,
            },
          ].map((seat) => (
            <div
              key={seat.name}
              className={`rounded-lg border px-3 py-2.5 space-y-1 ${
                seat.outcome.win
                  ? 'border-[var(--diagram-brass)]/70 bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                  : 'border-[var(--diagram-accent)]/70 bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))]'
              }`}
            >
              <div className="flex items-center justify-between font-semibold text-[var(--text-primary)]">
                <span>{seat.name}</span>
                <span className="tabular-nums">{seat.total} 点</span>
              </div>
              <div className="text-[11px] text-[var(--text-secondary)] tabular-nums">{seat.cards}</div>
              <div
                className={`text-[11.5px] font-bold ${
                  seat.outcome.win ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
                }`}
              >
                {seat.outcome.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        同桌尾家多拿或少拿一张牌，会直接改写发给庄家的下一张牌；逼迫或引导同桌要停牌，比单人算牌更能左右全局胜负。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 8. 赌船全押战 (tomodachi-all-bet)                                           */
/* -------------------------------------------------------------------------- */

const ALL_BET_ALLIES = [
  { id: 'a1', name: '同伴甲', value: 5000 },
  { id: 'a2', name: '同伴乙', value: 5000 },
  { id: 'a3', name: '同伴丙', value: 5000 },
] as const;

function AllBetDiagram() {
  const [mortgaged, setMortgaged] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<'playing' | 'win' | 'lose'>('playing');

  const baseChips = 3000;
  const loanChips = mortgaged.length * 5000;
  const myStack = outcome === 'lose' ? 0 : outcome === 'win' ? baseChips + loanChips + 15000 : baseChips + loanChips;
  const enemyStack = outcome === 'win' ? 0 : outcome === 'lose' ? 15000 + baseChips + loanChips : 15000;
  const canMatchEnemy = baseChips + loanChips >= 15000;

  const toggleMortgage = (id: string) => {
    if (outcome !== 'playing') return;
    setMortgaged((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const reset = () => {
    setMortgaged([]);
    setOutcome('playing');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Ship className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            公海赌船终局桌 · 人身可折价上桌
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置赌桌
          </button>
        </div>

        {/* 双方筹码池对比 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <Coins className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                己方可用筹码
              </span>
              <span
                className={`tabular-nums text-[15px] font-bold ${
                  outcome === 'lose' ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                }`}
              >
                {myStack.toLocaleString()} 万
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              自有本金 {baseChips} 万 + 人身贷款 {loanChips} 万（已押 {mortgaged.length} 人）
            </div>
          </div>

          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <Users className="w-3.5 h-3.5 text-[var(--text-secondary)]" aria-hidden="true" />
                敌方阵营筹码
              </span>
              <span className="tabular-nums text-[15px] font-bold text-[var(--text-primary)]">
                {enemyStack.toLocaleString()} 万
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              {outcome === 'win'
                ? '敌方筹码清零，全盘溃败'
                : outcome === 'lose'
                  ? `敌方吞并全池，并夺走己方 ${mortgaged.length} 名抵押同伴支配权`
                  : canMatchEnemy
                    ? '己方已凑齐跟注终局全押的筹码门槛'
                    : '资金严重不足，须抵押同伴人身换取贷款'}
            </div>
          </div>
        </div>

        {/* 抵押同伴人身换贷款 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-[var(--text-primary)]">抵押同伴人身换取贷款（每人 +5,000 万）</span>
            <span className="text-[11px] text-[var(--text-secondary)]">点击切换抵押</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ALL_BET_ALLIES.map((ally) => {
              const pledged = mortgaged.includes(ally.id);
              const lostToEnemy = pledged && outcome === 'lose';
              return (
                <button
                  key={ally.id}
                  type="button"
                  disabled={outcome !== 'playing'}
                  onClick={() => toggleMortgage(ally.id)}
                  className={`rounded-lg border px-2.5 py-2 text-center transition-all cursor-pointer disabled:cursor-default space-y-0.5 ${
                    lostToEnemy
                      ? 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                      : pledged
                        ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)]'
                  }`}
                >
                  <div className="text-[12px] font-bold inline-flex items-center gap-1">
                    {pledged && <Lock className="w-3 h-3" aria-hidden="true" />}
                    <span>{ally.name}</span>
                  </div>
                  <div className="text-[10.5px] opacity-90">
                    {lostToEnemy ? '已归赢家支配' : pledged ? '已押 +5000 万' : '未抵押'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 终局全押结算按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setOutcome('win')}
            className="px-3.5 py-2 rounded-lg border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
          >
            终局全押 · 模拟胜出结算
          </button>
          <button
            type="button"
            onClick={() => setOutcome('lose')}
            className="px-3.5 py-2 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
          >
            终局全押 · 模拟落败结算
          </button>
        </div>

        <p className="text-[12px] text-[var(--text-primary)] text-center leading-relaxed">
          {outcome === 'win'
            ? `终局全押胜出！己方揽获 ${myStack.toLocaleString()} 万筹码，顺利赎回全部抵押同伴并击垮敌方。`
            : outcome === 'lose'
              ? mortgaged.length > 0
                ? `终局全押落败！不仅本金归零，已抵押的 ${mortgaged.length} 名同伴人身支配权也彻底落入敌手！`
                : '终局全押落败！本金彻底清零；若曾抵押同伴换贷款，连同伴的人生都会一并输掉。'
              : '筹码落后时可用同伴人身借贷续命，但也意味着把金钱胜负直接绑定在了同伴的自由之上。'}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        赌船允许将同伴人身折价抵押上桌，筹码越压越重，一旦终局全押失手便会钱人两空。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 9. 孤岛大逃杀·僵尸名牌战 (tomodachi-zombie-island)                           */
/* -------------------------------------------------------------------------- */

const ISLAND_TOTAL = 12;

function ZombieIslandDiagram() {
  // true = 幸存者，false = 僵尸；初始 11 幸存者 + 1 僵尸
  const [aliveList, setAliveList] = useState<boolean[]>([
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
  ]);

  const survivors = aliveList.filter(Boolean).length;
  const zombies = ISLAND_TOTAL - survivors;
  const pressurePct = Math.round((zombies / ISLAND_TOTAL) * 100);
  const reachedQuota = survivors > 0 && survivors <= 3;

  const eliminateCount = (count: number) => {
    setAliveList((prev) => {
      let left = count;
      return prev.map((isAlive) => {
        if (isAlive && left > 0) {
          left -= 1;
          return false;
        }
        return isAlive;
      });
    });
  };

  const toggleOne = (idx: number) => {
    setAliveList((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const reset = () => {
    setAliveList([true, true, true, true, true, true, true, true, true, true, true, false]);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            幸存者 <strong className="tabular-nums text-[var(--diagram-brass)]">{survivors}</strong> 人
            <span className="mx-1.5 text-[var(--text-muted)]">vs</span>
            追猎僵尸 <strong className="tabular-nums text-[var(--diagram-accent)]">{zombies}</strong> 人
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置荒岛
          </button>
        </div>

        {/* 12 人阵营格 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {aliveList.map((isSurvivor, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleOne(idx)}
                className={`rounded-lg border px-2 py-2 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isSurvivor
                    ? 'border-[var(--diagram-brass)]/75 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                }`}
              >
                {isSurvivor ? (
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Skull className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span className="text-[11px] font-bold tabular-nums">
                  {isSurvivor ? `幸存 ${idx + 1}` : `僵尸 ${idx + 1}`}
                </span>
              </button>
            ))}
          </div>

          {/* 围堵压力条 */}
          <div className="space-y-1.5 pt-1 border-t border-[var(--border-hairline)] text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">僵尸反扑围堵压力</span>
              <span
                className={`tabular-nums font-bold ${
                  pressurePct >= 50 ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                }`}
              >
                {pressurePct}%（每淘汰 1 人即增 1 名猎手）
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--diagram-surface)] overflow-hidden flex">
              <div
                style={{ width: `${100 - pressurePct}%` }}
                className="h-full bg-[var(--diagram-brass)] transition-all duration-300"
              />
              <div
                style={{ width: `${pressurePct}%` }}
                className="h-full bg-[var(--diagram-accent)] transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* 淘汰操作 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={survivors === 0}
            onClick={() => eliminateCount(1)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
          >
            <Hand className="w-3.5 h-3.5" aria-hidden="true" />
            <span>撕下名牌淘汰（+1 僵尸）</span>
          </button>
          <button
            type="button"
            disabled={survivors === 0}
            onClick={() => eliminateCount(2)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] text-[12px] font-semibold hover:border-[var(--diagram-accent)] disabled:opacity-45 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
            <span>实弹开枪清场（+2 僵尸）</span>
          </button>
        </div>

        <p className="text-[12px] text-[var(--text-primary)] text-center leading-relaxed">
          {survivors === 0
            ? '岛上幸存者已全部沦为僵尸，无人能撑到晋级结算。'
            : reachedQuota
              ? `幸存者已压至 ${survivors} 人达晋级名额，但场外足足 ${zombies} 名红标僵尸正反过来围堵合围！`
              : `点击任意卡片或上方按钮淘汰对手：出局者不会离场，而是立刻化作僵尸加入围猎阵营。`}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        荒岛中淘汰竞争对手虽能收窄名额，但每个出局者都会立刻转为僵尸反扑幸存者，清场过猛反而会把自己逼入绝境。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 10. 无友游戏 (tomodachi-snow-cabin)                                         */
/* -------------------------------------------------------------------------- */

function SnowCabinDiagram() {
  const [food, setFood] = useState<number>(65);
  const [fuel, setFuel] = useState<number>(70);
  const [passwordLeaked, setPasswordLeaked] = useState<boolean>(false);
  const [banishVotes, setBanishVotes] = useState<number>(1);
  const [nightCount, setNightCount] = useState<number>(1);

  const frozenOut = banishVotes >= 3;
  const supplyDepleted = food <= 0 || fuel <= 0;
  const eliminated = passwordLeaked || frozenOut || supplyDepleted;

  const passNight = () => {
    if (eliminated) return;
    setFood((f) => Math.max(0, f - 20));
    setFuel((f) => Math.max(0, f - 25));
    setNightCount((n) => n + 1);
  };

  const tradeSupply = () => {
    if (eliminated) return;
    setFood((f) => Math.min(100, f + 25));
    setFuel((f) => Math.min(100, f + 25));
  };

  const reset = () => {
    setFood(65);
    setFuel(70);
    setPasswordLeaked(false);
    setBanishVotes(1);
    setNightCount(1);
  };

  const eliminationReason = passwordLeaked
    ? '秘密口令已遭他人探知 → 即刻淘汰！'
    : frozenOut
      ? `收到 ${banishVotes}/5 多数驱逐票 → 被逐出木屋陷入风雪！`
      : supplyDepleted
        ? '食物或取暖燃料耗尽 → 难以在暴雪孤屋存活！'
        : `第 ${nightCount} 夜：木屋暂保温暖，口令与席位尚未失守。`;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Snowflake className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            暴雪断网木屋 · 屋外 -28°C · 第 {nightCount} 夜
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置木屋
          </button>
        </div>

        {/* 物资条：食物 & 燃料 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">木屋食物储备</span>
                <span
                  className={`tabular-nums font-bold ${
                    food <= 20 ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                  }`}
                >
                  {food}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
                <div
                  style={{ width: `${food}%` }}
                  className={`h-full rounded-full transition-all ${
                    food <= 20 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">取暖燃料余量</span>
                <span
                  className={`tabular-nums font-bold ${
                    fuel <= 25 ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                  }`}
                >
                  {fuel}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
                <div
                  style={{ width: `${fuel}%` }}
                  className={`h-full rounded-full transition-all ${
                    fuel <= 25 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={eliminated}
              onClick={passNight}
              className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[12px] font-semibold text-[var(--text-primary)] hover:border-[var(--diagram-accent)] disabled:opacity-45 cursor-pointer"
            >
              熬过暴雪夜（食物 -20 / 燃料 -25）
            </button>
            <button
              type="button"
              disabled={eliminated}
              onClick={tradeSupply}
              className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-surface))] text-[12px] font-semibold text-[var(--diagram-brass)] hover:opacity-90 disabled:opacity-45 cursor-pointer"
            >
              完成隐藏任务换物资（+25%）
            </button>
          </div>
        </div>

        {/* 秘密口令状态 + 多数票驱逐 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 秘密口令 */}
          <div
            className={`rounded-xl border p-3.5 space-y-2.5 ${
              passwordLeaked
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <KeyRound className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                个人秘密口令
              </span>
              <span
                className={`text-[11px] font-bold ${
                  passwordLeaked ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                }`}
              >
                {passwordLeaked ? '已泄露' : '严密保密'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPasswordLeaked((v) => !v)}
              className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold cursor-pointer transition-all ${
                passwordLeaked
                  ? 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)]'
                  : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-surface))] text-[var(--diagram-accent)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{passwordLeaked ? '恢复口令保密状态' : '模拟口令遭探知泄露'}</span>
            </button>
          </div>

          {/* 多数票驱逐 */}
          <div
            className={`rounded-xl border p-3.5 space-y-2.5 ${
              frozenOut
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <Vote className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                木屋驱逐投票
              </span>
              <span
                className={`tabular-nums text-[11px] font-bold ${
                  frozenOut ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {banishVotes} / 5 票（满 3 票驱逐）
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBanishVotes(v)}
                  className={`flex-1 py-1.5 rounded-md border text-[11.5px] font-bold tabular-nums cursor-pointer transition-all ${
                    banishVotes === v
                      ? v >= 3
                        ? 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                        : 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 最终生存判定栏 */}
        <div
          className={`rounded-lg border px-3.5 py-2 text-center text-[12px] font-semibold ${
            eliminated
              ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : 'border-[var(--diagram-brass)]/60 bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {eliminationReason}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        无信号暴雪孤屋中，断粮断暖、口令泄露或被多数票驱逐出屋三条红线只要触发其一，就会立刻陷入淘汰绝境。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 统一映射导出                                                                */
/* -------------------------------------------------------------------------- */

export const TOMODACHI_DIAGRAMS: Record<string, ComponentType> = {
  'tomodachi-kokkuri': KokkuriDiagram,
  'tomodachi-badmouth-sugoroku': BadmouthSugorokuDiagram,
  'tomodachi-hide-and-seek': HideAndSeekDiagram,
  'tomodachi-fake-game': FakeGameDiagram,
  'tomodachi-sin-trial': SinTrialDiagram,
  'tomodachi-prison-game': PrisonGameDiagram,
  'tomodachi-blackjack': BlackjackDiagram,
  'tomodachi-all-bet': AllBetDiagram,
  'tomodachi-zombie-island': ZombieIslandDiagram,
  'tomodachi-snow-cabin': SnowCabinDiagram,
};
