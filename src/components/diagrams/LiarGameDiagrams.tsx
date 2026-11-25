import { useState, type ComponentType } from 'react';
import {
  Armchair,
  ArrowLeftRight,
  Banknote,
  Biohazard,
  Briefcase,
  Castle,
  Coins,
  CreditCard,
  Crosshair,
  Crown,
  Eye,
  EyeOff,
  Gavel,
  HeartPulse,
  RotateCcw,
  Search,
  Shield,
  Shuffle,
  SkipForward,
  Skull,
  Sparkles,
  Swords,
  Vote,
} from 'lucide-react';

// ============================================================================
// 1. liar-round-one · 一亿日元争夺战
// ============================================================================

function formatYenWan(wan: number): string {
  const abs = Math.abs(wan);
  const sign = wan < 0 ? '-' : '';
  if (abs === 0) return '0 日元';
  if (abs % 10000 === 0) return `${sign}${abs / 10000} 亿`;
  if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(1)} 亿`;
  return `${sign}${abs.toLocaleString('zh-CN')} 万`;
}

function LiarRoundOneDiagram() {
  // 正数表示玩家 A 从 B 处夺取金额（单位：万日元），负数表示 B 夺取 A
  const [transferWan, setTransferWan] = useState<number>(4000);

  const aCash = 10000 + transferWan;
  const bCash = 10000 - transferWan;
  const aNet = aCash - 10000;
  const bNet = bCash - 10000;

  const presets = [
    { label: 'B 夺走 8000 万', value: -8000 },
    { label: '双方持平', value: 0 },
    { label: 'A 夺走 4000 万', value: 4000 },
    { label: 'A 全数夺走', value: 10000 },
  ];

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            第 30 天 17:00 回收结算 · 每箱固定收回{' '}
            <strong className="text-[var(--diagram-brass)] tabular-nums">1 亿</strong> 本金
          </span>
          <button
            type="button"
            onClick={() => setTransferWan(0)}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            恢复各持 1 亿
          </button>
        </div>

        {/* 双金属手提箱 */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
          {/* 玩家 A 手提箱 */}
          <div
            className={`rounded-xl border p-3.5 space-y-2.5 transition-colors ${
              aNet > 0
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                : aNet < 0
                  ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_10%,var(--diagram-panel))]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <Briefcase className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
                玩家 A 金属箱
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">初始 1 亿</span>
            </div>

            {/* 现金堆叠条 */}
            <div className="h-3 rounded-full bg-[var(--diagram-surface)] border border-[var(--border-hairline)] overflow-hidden">
              <div
                className="h-full transition-all duration-200 rounded-full"
                style={{
                  width: `${(aCash / 20000) * 100}%`,
                  backgroundColor: aNet < 0 ? 'var(--diagram-accent)' : 'var(--diagram-brass)',
                }}
              />
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11.5px] text-[var(--text-secondary)]">箱内现有</span>
              <span className="text-[15px] font-bold text-[var(--text-primary)] tabular-nums">
                {formatYenWan(aCash)}
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between text-[12px]">
              <span className="text-[var(--text-secondary)]">扣 1 亿本金后</span>
              <span
                className={`font-bold tabular-nums ${
                  aNet > 0
                    ? 'text-[var(--diagram-brass)]'
                    : aNet < 0
                      ? 'text-[var(--diagram-accent)]'
                      : 'text-[var(--text-primary)]'
                }`}
              >
                {aNet > 0
                  ? `净赚 +${formatYenWan(aNet)}`
                  : aNet < 0
                    ? `负债 ${formatYenWan(aNet)}`
                    : '不盈不亏'}
              </span>
            </div>
          </div>

          {/* 中间流向指示 */}
          <div className="flex sm:flex-col items-center justify-center gap-1.5 px-2 py-1 text-center">
            <ArrowLeftRight className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
            <span className="text-[11px] font-semibold text-[var(--text-primary)] tabular-nums whitespace-nowrap">
              {transferWan === 0
                ? '未发生转移'
                : transferWan > 0
                  ? `A 夺得 ${formatYenWan(transferWan)}`
                  : `B 夺得 ${formatYenWan(-transferWan)}`}
            </span>
          </div>

          {/* 玩家 B 手提箱 */}
          <div
            className={`rounded-xl border p-3.5 space-y-2.5 transition-colors ${
              bNet > 0
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                : bNet < 0
                  ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_10%,var(--diagram-panel))]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                <Briefcase className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
                玩家 B 金属箱
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">初始 1 亿</span>
            </div>

            <div className="h-3 rounded-full bg-[var(--diagram-surface)] border border-[var(--border-hairline)] overflow-hidden">
              <div
                className="h-full transition-all duration-200 rounded-full"
                style={{
                  width: `${(bCash / 20000) * 100}%`,
                  backgroundColor: bNet < 0 ? 'var(--diagram-accent)' : 'var(--diagram-brass)',
                }}
              />
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11.5px] text-[var(--text-secondary)]">箱内现有</span>
              <span className="text-[15px] font-bold text-[var(--text-primary)] tabular-nums">
                {formatYenWan(bCash)}
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between text-[12px]">
              <span className="text-[var(--text-secondary)]">扣 1 亿本金后</span>
              <span
                className={`font-bold tabular-nums ${
                  bNet > 0
                    ? 'text-[var(--diagram-brass)]'
                    : bNet < 0
                      ? 'text-[var(--diagram-accent)]'
                      : 'text-[var(--text-primary)]'
                }`}
              >
                {bNet > 0
                  ? `净赚 +${formatYenWan(bNet)}`
                  : bNet < 0
                    ? `负债 ${formatYenWan(bNet)}`
                    : '不盈不亏'}
              </span>
            </div>
          </div>
        </div>

        {/* 30 天夺取金额调节 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11.5px] text-[var(--text-secondary)]">
            <span>← B 骗走 A 全部 1 亿</span>
            <span className="font-semibold text-[var(--text-primary)]">30 天内现金流向</span>
            <span>A 骗走 B 全部 1 亿 →</span>
          </div>
          <input
            type="range"
            min={-10000}
            max={10000}
            step={1000}
            value={transferWan}
            onChange={(e) => setTransferWan(Number(e.target.value))}
            aria-label="调节 30 天内双方互相夺取的金额"
            className="w-full accent-[var(--diagram-brass)] cursor-pointer"
          />
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setTransferWan(p.value)}
                className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors cursor-pointer ${
                  transferWan === p.value
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        到期无论箱内剩多少，事务所都向每人固定收回 1 亿本金；多出的现金归胜者所有，缺口则化为对手背上的等额债务。
      </p>
    </div>
  );
}

// ============================================================================
// 2. liar-downsizing · 裁员游戏
// ============================================================================

const DOWNSIZING_PLAYERS = ['你', '2号', '3号', '4号', '5号', '6号', '7号', '8号', '9号'];
const DOWNSIZING_INIT_VOTES = [5, 7, 6, 4, 6, 5, 3, 6, 5];
const VOTES_PER_ROUND = 3;
const TOTAL_DOWNSIZING_ROUNDS = 3;

function LiarDownsizingDiagram() {
  const [round, setRound] = useState<number>(2);
  const [votes, setVotes] = useState<number[]>(DOWNSIZING_INIT_VOTES);
  const [draft, setDraft] = useState<number[]>(Array(9).fill(0));
  const [finished, setFinished] = useState<boolean>(false);
  const [note, setNote] = useState<string>(
    '点击任意其他玩家（2–9 号）分配本轮 3 张选票，投满后点「本轮开票」公开累计票数。'
  );

  const usedVotes = draft.reduce((sum, v) => sum + v, 0);
  const remainVotes = VOTES_PER_ROUND - usedVotes;

  const handleSelectPlayer = (idx: number) => {
    if (finished) return;
    if (idx === 0) {
      setNote('规则禁止把票投给自己，只能写其他玩家的姓名。');
      return;
    }
    if (remainVotes <= 0) {
      setNote('本轮 3 张选票已分配完毕，可点击「本轮开票」推进，或点击「清空本轮选票」重选。');
      return;
    }
    setDraft((prev) => {
      const next = [...prev];
      next[idx] += 1;
      return next;
    });
    setNote(`已给 ${DOWNSIZING_PLAYERS[idx]} 投出 1 票，本轮还剩 ${remainVotes - 1} 票。`);
  };

  const clearDraft = () => {
    if (finished) return;
    setDraft(Array(9).fill(0));
    setNote('已清空本轮待投选票，请重新点击 2–9 号分配。');
  };

  const commitRound = () => {
    if (finished) return;
    if (usedVotes < VOTES_PER_ROUND) {
      setNote(`本轮还剩 ${remainVotes} 票未投出，请先将 3 票全部投给他人。`);
      return;
    }

    const nextVotes = votes.map((v, i) => v + draft[i]);

    // 其余 8 名玩家各自秘密投出 3 票（均不投自己）
    for (let voter = 1; voter < 9; voter++) {
      for (let k = 0; k < VOTES_PER_ROUND; k++) {
        // 偏向互相拉帮抱团，同时保留随机波动
        const candidatePool: number[] = [];
        for (let target = 0; target < 9; target++) {
          if (target !== voter) candidatePool.push(target);
        }
        const pick = candidatePool[(voter * 3 + k * 2 + round * 5) % candidatePool.length];
        nextVotes[pick] += 1;
      }
    }

    const isLast = round >= TOTAL_DOWNSIZING_ROUNDS;
    if (isLast) {
      // 确保终局有唯一的最低票垫底者以便清晰呈现淘汰规则
      const minVal = Math.min(...nextVotes);
      const minIndices = nextVotes
        .map((v, idx) => (v === minVal ? idx : -1))
        .filter((idx) => idx >= 0);
      if (minIndices.length > 1) {
        for (let i = 1; i < minIndices.length; i++) {
          nextVotes[minIndices[i]] += 1;
        }
      }
      const loserIdx = nextVotes.indexOf(Math.min(...nextVotes));
      setVotes(nextVotes);
      setDraft(Array(9).fill(0));
      setFinished(true);
      setNote(
        `第 ${round} 轮终局开票！${DOWNSIZING_PLAYERS[loserIdx]}以 ${nextVotes[loserIdx]} 票独居末位遭淘汰，背负 1 亿日元债务，其余 8 人复活晋级。`
      );
    } else {
      const minVal = Math.min(...nextVotes);
      const lowNames = nextVotes
        .map((v, idx) => (v === minVal ? DOWNSIZING_PLAYERS[idx] : null))
        .filter(Boolean)
        .join('、');
      setVotes(nextVotes);
      setDraft(Array(9).fill(0));
      setRound((r) => r + 1);
      setNote(
        `第 ${round} 轮开票完成！当前垫底：${lowNames}（${minVal} 票）。进入第 ${round + 1} 轮，请继续分配 3 票。`
      );
    }
  };

  const reset = () => {
    setRound(2);
    setVotes(DOWNSIZING_INIT_VOTES);
    setDraft(Array(9).fill(0));
    setFinished(false);
    setNote('点击任意其他玩家（2–9 号）分配本轮 3 张选票，投满后点「本轮开票」公开累计票数。');
  };

  const displayVotes = votes.map((v, i) => v + draft[i]);
  const maxVote = Math.max(...displayVotes, 12);
  const minCommitted = Math.min(...votes);
  const loserIndex = finished ? votes.indexOf(minCommitted) : -1;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              {finished ? '最终开票结算' : `第 ${round} / ${TOTAL_DOWNSIZING_ROUNDS} 轮投票`}
            </span>
            {!finished && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-brass)] tabular-nums">
                余 {remainVotes} / {VOTES_PER_ROUND} 票（禁投自己）
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新开局
          </button>
        </div>

        {/* 9 人得票柱状图 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-9 gap-1.5 sm:gap-2 items-end h-[168px] pt-5">
            {DOWNSIZING_PLAYERS.map((name, idx) => {
              const total = displayVotes[idx];
              const added = draft[idx];
              const isSelf = idx === 0;
              const isLoser = finished && idx === loserIndex;
              const isCurrentLowest = !finished && votes[idx] === minCommitted;
              const pct = Math.max(12, Math.round((total / maxVote) * 100));

              return (
                <button
                  key={name}
                  type="button"
                  disabled={finished}
                  onClick={() => handleSelectPlayer(idx)}
                  aria-label={`给 ${name} 投票，当前 ${total} 票`}
                  className={`group flex flex-col items-center justify-end h-full gap-1.5 rounded-lg px-0.5 py-1 transition-colors ${
                    finished
                      ? 'cursor-default'
                      : isSelf
                        ? 'cursor-not-allowed opacity-85'
                        : 'cursor-pointer hover:bg-[var(--diagram-surface)]'
                  }`}
                >
                  {/* 顶部票数与加票提示 */}
                  <div className="flex flex-col items-center leading-none gap-0.5">
                    {added > 0 && (
                      <span className="text-[10px] font-bold text-[var(--diagram-brass)] tabular-nums">
                        +{added}
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-bold tabular-nums ${
                        isLoser
                          ? 'text-[var(--diagram-accent)]'
                          : isCurrentLowest
                            ? 'text-[var(--diagram-accent)]'
                            : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {total}
                    </span>
                  </div>

                  {/* 柱体 */}
                  <div className="w-full max-w-[30px] flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-200 border ${
                        isLoser
                          ? 'bg-[var(--diagram-accent)] border-[var(--diagram-accent)]'
                          : added > 0
                            ? 'bg-[var(--diagram-brass)] border-[var(--diagram-brass)]'
                            : isCurrentLowest
                              ? 'bg-[color-mix(in_srgb,var(--diagram-accent)_32%,var(--diagram-surface))] border-[var(--diagram-accent)]'
                              : isSelf
                                ? 'bg-[color-mix(in_srgb,var(--text-primary)_26%,var(--diagram-surface))] border-[var(--diagram-border)]'
                                : 'bg-[color-mix(in_srgb,var(--diagram-brass)_42%,var(--diagram-surface))] border-[var(--diagram-border)]'
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>

                  {/* 玩家标签 */}
                  <span
                    className={`text-[10.5px] font-semibold truncate w-full text-center ${
                      isLoser
                        ? 'text-[var(--diagram-accent)]'
                        : isSelf
                          ? 'text-[var(--text-secondary)]'
                          : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 末位淘汰状态条或操作栏 */}
          <div className="pt-2.5 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-2">
            {finished ? (
              <div className="w-full flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[var(--diagram-accent)]">
                  <Skull className="w-4 h-4" aria-hidden="true" />
                  淘汰：{DOWNSIZING_PLAYERS[loserIndex]}（背负 1 亿债） · 其余 8 人晋级
                </span>
                <button
                  type="button"
                  onClick={reset}
                  className="px-3.5 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
                >
                  再来一局
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={clearDraft}
                  disabled={usedVotes === 0}
                  className="px-3 py-1.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-45 cursor-pointer"
                >
                  清空本轮选票
                </button>
                <button
                  type="button"
                  onClick={commitRound}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
                >
                  <Vote className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{round === TOTAL_DOWNSIZING_ROUNDS ? '终局开票' : '本轮开票'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-[12.5px] text-[var(--text-primary)] leading-relaxed text-center">{note}</p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        9 人互相投票且不能投给自己，每轮只公布总票数不公开投票人；终局票数最低的唯一一人惨遭淘汰并背负 1 亿日元债务。
      </p>
    </div>
  );
}

// ============================================================================
// 3. contraband-game · 走私游戏
// ============================================================================

type InspectorAction = 'pass' | 'inspect';

function ContrabandGameDiagram() {
  const [packedWan, setPackedWan] = useState<number>(7000);
  const [action, setAction] = useState<InspectorAction>('inspect');
  const [doubtWan, setDoubtWan] = useState<number>(6000);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
  const [smugglerVault, setSmugglerVault] = useState<number>(0);
  const [inspectorVault, setInspectorVault] = useState<number>(0);

  // 计算当前组合的实时结果
  let outcomeType: 'pass' | 'confiscate' | 'compensate' = 'pass';
  let smugglerGain = 0;
  let inspectorGain = 0;
  let penaltyWan = 0;
  let summary = '';

  if (action === 'pass') {
    outcomeType = 'pass';
    smugglerGain = packedWan;
    inspectorGain = 0;
    summary =
      packedWan === 0
        ? '检查官直接放行了空箱，双方本回合均无盈亏。'
        : `检查官直接放行！走私犯无伤带回 ${formatYenWan(packedWan)}，检查官 0 收益。`;
  } else if (doubtWan >= packedWan) {
    outcomeType = 'confiscate';
    smugglerGain = 0;
    inspectorGain = packedWan;
    summary =
      packedWan === 0
        ? `喊价 ${formatYenWan(doubtWan)} 开箱查获空箱，无需赔偿但也未缴获现金。`
        : `喊价 ${formatYenWan(doubtWan)} ≥ 真钱 ${formatYenWan(packedWan)}！怀疑成立，检查官没收全部 ${formatYenWan(packedWan)}。`;
  } else {
    outcomeType = 'compensate';
    penaltyWan = Math.round(doubtWan / 2);
    smugglerGain = packedWan + penaltyWan;
    inspectorGain = -penaltyWan;
    summary = `喊价 ${formatYenWan(doubtWan)} < 真钱 ${formatYenWan(packedWan)}！放行 ${formatYenWan(packedWan)} 外加检查官倒赔半价精神赔偿金 ${formatYenWan(penaltyWan)}。`;
  }

  const recordTurn = () => {
    setRoundsPlayed((r) => r + 1);
    setSmugglerVault((v) => v + smugglerGain);
    setInspectorVault((v) => v + inspectorGain);
  };

  const reset = () => {
    setPackedWan(7000);
    setAction('inspect');
    setDoubtWan(6000);
    setRoundsPlayed(0);
    setSmugglerVault(0);
    setInspectorVault(0);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">海关安检推演台</span>
            {roundsPlayed > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--text-secondary)] tabular-nums">
                已记 {roundsPlayed} 关 · 攻方 {formatYenWan(smugglerVault)} / 守方{' '}
                {formatYenWan(inspectorVault)}
              </span>
            )}
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

        {/* 双栏控制：走私犯 vs 检查官 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 走私犯 */}
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-brass)]">
                <Briefcase className="w-4 h-4" aria-hidden="true" />
                攻方 · 走私犯装箱
              </span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">
                {formatYenWan(packedWan)}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={10000}
              step={1000}
              value={packedWan}
              onChange={(e) => setPackedWan(Number(e.target.value))}
              aria-label="走私犯手提箱装箱金额"
              className="w-full accent-[var(--diagram-brass)] cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] tabular-nums">
              <span>空箱 0</span>
              <span>5000 万</span>
              <span>满箱 1 亿</span>
            </div>
          </div>

          {/* 检查官 */}
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-accent)] whitespace-nowrap">
                <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                守方 · 检查官决断
              </span>
              <div className="inline-flex shrink-0 rounded-full bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAction('pass')}
                  className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    action === 'pass'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-page)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  直接放行
                </button>
                <button
                  type="button"
                  onClick={() => setAction('inspect')}
                  className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    action === 'inspect'
                      ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  喊价开箱
                </button>
              </div>
            </div>

            {action === 'inspect' ? (
              <>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-[var(--text-secondary)]">喊出怀疑金额</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-nums">
                    {formatYenWan(doubtWan)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={1000}
                  value={doubtWan}
                  onChange={(e) => setDoubtWan(Number(e.target.value))}
                  aria-label="检查官喊出怀疑金额"
                  className="w-full accent-[var(--diagram-accent)] cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] tabular-nums">
                  <span>0</span>
                  <span>倒赔上限 {formatYenWan(Math.round(doubtWan / 2))}</span>
                  <span>1 亿</span>
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-[var(--diagram-surface)] border border-[var(--border-hairline)] px-3 py-3 text-[11.5px] text-[var(--text-secondary)] text-center">
                放弃检查，不支付精神赔偿金，箱内现金由走私犯直接带走。
              </div>
            )}
          </div>
        </div>

        {/* 实时结算结果卡 */}
        <div
          className={`rounded-xl border p-3.5 space-y-2.5 ${
            outcomeType === 'confiscate'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
              : outcomeType === 'compensate'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
          }`}
        >
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-[var(--diagram-surface)]/80 border border-[var(--border-hairline)] px-3 py-2">
              <div className="text-[11px] text-[var(--text-secondary)]">走私犯本关净得</div>
              <div className="text-[14px] font-bold text-[var(--diagram-brass)] tabular-nums">
                +{formatYenWan(smugglerGain)}
              </div>
            </div>
            <div className="rounded-lg bg-[var(--diagram-surface)]/80 border border-[var(--border-hairline)] px-3 py-2">
              <div className="text-[11px] text-[var(--text-secondary)]">检查官本关净得</div>
              <div
                className={`text-[14px] font-bold tabular-nums ${
                  inspectorGain < 0
                    ? 'text-[var(--diagram-accent)]'
                    : inspectorGain > 0
                      ? 'text-[var(--diagram-brass)]'
                      : 'text-[var(--text-primary)]'
                }`}
              >
                {inspectorGain > 0
                  ? `+${formatYenWan(inspectorGain)}`
                  : inspectorGain < 0
                    ? formatYenWan(inspectorGain)
                    : '0 日元'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="text-[12px] text-[var(--text-primary)] leading-relaxed flex-1">
              {summary}
            </p>
            <button
              type="button"
              onClick={recordTurn}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[11.5px] font-semibold hover:opacity-90 cursor-pointer"
            >
              <Banknote className="w-3.5 h-3.5" aria-hidden="true" />
              计入双方金库
            </button>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        喊价大于等于真钱就全额没收，哪怕只低了一千万也会放行并倒赔半价精神赔偿金，真假虚实全压在这一声喊价上。
      </p>
    </div>
  );
}

// ============================================================================
// 4. seventeen-poker · 17张扑克
// ============================================================================

type Suit = '♠' | '♥' | '♣' | '♦';
type FaceRank = 'J' | 'Q' | 'K' | 'A';

interface SeventeenCard {
  id: string;
  rank: FaceRank | 'JOKER';
  suit: Suit | '★';
}

const SEVENTEEN_DECK: SeventeenCard[] = [
  ...(['♠', '♥', '♣', '♦'] as Suit[]).flatMap((suit) =>
    (['A', 'K', 'Q', 'J'] as FaceRank[]).map((rank) => ({
      id: `${suit}${rank}`,
      rank,
      suit,
    }))
  ),
  { id: 'JOKER', rank: 'JOKER', suit: '★' },
];

const SEVENTEEN_HAND_TIERS = [
  '五条',
  '皇家同花顺',
  '四条',
  '葫芦',
  '顺子',
  '三条',
  '两对',
  '一对',
] as const;

type SeventeenTier = (typeof SEVENTEEN_HAND_TIERS)[number];

function evaluateSeventeenHand(cards: SeventeenCard[]): { tier: SeventeenTier; detail: string } {
  const hasJoker = cards.some((c) => c.rank === 'JOKER');
  const normals = cards.filter((c) => c.rank !== 'JOKER');

  const counts = new Map<string, number>();
  for (const c of normals) {
    counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
  }
  const freq = Array.from(counts.values()).sort((a, b) => b - a);
  const allSameSuit = normals.length > 0 && normals.every((c) => c.suit === normals[0].suit);

  if (hasJoker) {
    if (freq[0] === 4) {
      return { tier: '五条', detail: '4 张同点数 + 万能鬼牌组成最强五条' };
    }
    if (freq.length === 4 && allSameSuit) {
      return { tier: '皇家同花顺', detail: '同花色 J-Q-K-A 配合鬼牌补 10 成皇家同花顺' };
    }
    if (freq[0] === 3) {
      return { tier: '四条', detail: '3 张同点数借鬼牌升格为四条' };
    }
    if (freq[0] === 2 && freq[1] === 2) {
      return { tier: '葫芦', detail: '两对借鬼牌补齐为三带二葫芦' };
    }
    if (freq.length === 4) {
      return { tier: '顺子', detail: 'J-Q-K-A 配鬼牌充当 10 连成顺子' };
    }
    return { tier: '三条', detail: '一对借鬼牌升格为三条' };
  }

  if (freq[0] === 4) {
    return { tier: '四条', detail: '四花色同点数全齐，稳压葫芦以下牌型' };
  }
  if (freq[0] === 3 && freq[1] === 2) {
    return { tier: '葫芦', detail: '三张同点数加一对构成满堂红' };
  }
  if (freq[0] === 3) {
    return { tier: '三条', detail: '三张同点数带两张散牌' };
  }
  if (freq[0] === 2 && freq[1] === 2) {
    return { tier: '两对', detail: '两组对子组合' };
  }
  return { tier: '一对', detail: '16 张四点牌抽 5 张必含至少一对' };
}

function shuffleCards<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dealSeventeenInitial(): { hand: SeventeenCard[]; deck: SeventeenCard[] } {
  // 初始示范手牌（含鬼牌与 3 张 A，一眼看出鬼牌冲五条的诱惑）
  const initIds = ['♠A', '♥A', '♣A', 'JOKER', '♦K'];
  const hand = initIds.map((id) => SEVENTEEN_DECK.find((c) => c.id === id)!);
  const deck = shuffleCards(SEVENTEEN_DECK.filter((c) => !initIds.includes(c.id)));
  return { hand, deck };
}

function SeventeenPokerDiagram() {
  const [state, setState] = useState<{
    hand: SeventeenCard[];
    deck: SeventeenCard[];
    selected: number[];
    exchanged: boolean;
    discardCount: number;
  }>(() => {
    const { hand, deck } = dealSeventeenInitial();
    return { hand, deck, selected: [4], exchanged: false, discardCount: 0 };
  });

  const evalResult = evaluateSeventeenHand(state.hand);

  const toggleSelect = (index: number) => {
    if (state.exchanged) return;
    setState((prev) => ({
      ...prev,
      selected: prev.selected.includes(index)
        ? prev.selected.filter((i) => i !== index)
        : [...prev.selected, index],
    }));
  };

  const doExchange = () => {
    if (state.exchanged) return;
    const count = state.selected.length;
    if (count === 0) {
      setState((prev) => ({ ...prev, exchanged: true }));
      return;
    }
    const draw = state.deck.slice(0, count);
    const remainDeck = state.deck.slice(count);
    let drawPtr = 0;
    const nextHand = state.hand.map((card, idx) =>
      state.selected.includes(idx) ? draw[drawPtr++] : card
    );
    setState({
      hand: nextHand,
      deck: remainDeck,
      selected: [],
      exchanged: true,
      discardCount: count,
    });
  };

  const dealNewHand = () => {
    const shuffled = shuffleCards(SEVENTEEN_DECK);
    setState({
      hand: shuffled.slice(0, 5),
      deck: shuffled.slice(5),
      selected: [],
      exchanged: false,
      discardCount: 0,
    });
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              牌库余 {state.deck.length} / 17 张
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-brass)]">
              {state.exchanged
                ? state.discardCount === 0
                  ? '本局选择不换牌 · 摊牌判定'
                  : `已换 ${state.discardCount} 张 · 摊牌判定`
                : '点选要弃掉的手牌后点「换牌」'}
            </span>
          </div>
          <button
            type="button"
            onClick={dealNewHand}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新发牌
          </button>
        </div>

        {/* 5 张真实扑克牌面 */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {state.hand.map((card, idx) => {
            const isSelected = state.selected.includes(idx);
            const isJoker = card.rank === 'JOKER';
            const isRedSuit = card.suit === '♥' || card.suit === '♦';

            return (
              <button
                key={`${card.id}-${idx}`}
                type="button"
                disabled={state.exchanged}
                onClick={() => toggleSelect(idx)}
                aria-pressed={isSelected}
                className={`relative flex flex-col items-center justify-between rounded-xl border py-2.5 px-1.5 h-[96px] sm:h-[110px] transition-all select-none ${
                  state.exchanged ? 'cursor-default' : 'cursor-pointer'
                } ${
                  isJoker
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                } ${
                  isSelected
                    ? 'ring-2 ring-[var(--diagram-accent)] -translate-y-1.5'
                    : !state.exchanged
                      ? 'hover:-translate-y-0.5'
                      : ''
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[var(--diagram-accent)] text-[var(--accent-fg)] text-[9.5px] font-bold whitespace-nowrap">
                    换掉
                  </span>
                )}
                <span
                  className={`self-start text-[11px] font-bold leading-none ${
                    isJoker
                      ? 'text-[var(--diagram-brass)]'
                      : isRedSuit
                        ? 'text-[var(--diagram-accent)]'
                        : 'text-[var(--text-primary)]'
                  }`}
                >
                  {isJoker ? '★' : card.rank}
                </span>

                <div className="flex flex-col items-center leading-none">
                  {isJoker ? (
                    <>
                      <Sparkles className="w-5 h-5 text-[var(--diagram-brass)]" aria-hidden="true" />
                      <span className="text-[10px] font-bold mt-1 tracking-wide">JOKER</span>
                    </>
                  ) : (
                    <>
                      <span
                        className={`text-[22px] sm:text-[26px] leading-none ${
                          isRedSuit ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {card.suit}
                      </span>
                      <span className="text-[12px] font-bold text-[var(--text-primary)] mt-1">
                        {card.rank}
                      </span>
                    </>
                  )}
                </div>

                <span className="self-end text-[10px] text-[var(--text-muted)] leading-none">
                  {isJoker ? '万能' : card.suit}
                </span>
              </button>
            );
          })}
        </div>

        {/* 操作按钮与当前牌型识别 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-[var(--text-secondary)]">当前牌型</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] border border-[var(--diagram-brass)] text-[12.5px] font-bold text-[var(--diagram-brass)]">
                  {evalResult.tier}
                </span>
              </div>
              <p className="text-[11.5px] text-[var(--text-secondary)]">{evalResult.detail}</p>
            </div>

            {state.exchanged ? (
              <button
                type="button"
                onClick={dealNewHand}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
                发下一手
              </button>
            ) : (
              <button
                type="button"
                onClick={doExchange}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
                {state.selected.length > 0 ? `换掉所选 ${state.selected.length} 张` : '保留原牌摊牌'}
              </button>
            )}
          </div>

          {/* 牌型强弱梯次 */}
          <div className="pt-2 border-t border-[var(--border-hairline)] flex flex-wrap gap-1.5">
            {SEVENTEEN_HAND_TIERS.map((tier) => {
              const active = evalResult.tier === tier;
              return (
                <span
                  key={tier}
                  className={`px-2 py-0.5 rounded-md text-[10.5px] border transition-colors ${
                    active
                      ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] font-bold'
                      : 'border-[var(--border-hairline)] bg-[var(--diagram-surface)] text-[var(--text-muted)]'
                  }`}
                >
                  {tier}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        整副牌只有 4 种花色的 J/Q/K/A 外加 1 张万能鬼牌，强牌极易成手；点选要弃的牌执行唯一一次换牌，体会小牌库的高压概率。
      </p>
    </div>
  );
}

// ============================================================================
// 5. liar-russian-roulette · 24连发俄罗斯轮盘
// ============================================================================

const TOTAL_CHAMBERS = 24;
const LOADED_BULLETS = 3;

function pickThreeChambers(): number[] {
  const pool = Array.from({ length: TOTAL_CHAMBERS }, (_, i) => i);
  const shuffled = shuffleCards(pool);
  return shuffled.slice(0, LOADED_BULLETS).sort((a, b) => a - b);
}

function LiarRussianRouletteDiagram() {
  const [bullets, setBullets] = useState<number[]>(() => [4, 11, 19]);
  const [cursor, setCursor] = useState<number>(0);
  const [pot, setPot] = useState<number>(20);
  const [fired, setFired] = useState<boolean>(false);
  const [hitChamber, setHitChamber] = useState<number | null>(null);

  const currentActor = cursor % 2 === 0 ? '先手方' : '后手方';
  const remaining = TOTAL_CHAMBERS - cursor;
  const hitProb = fired ? 100 : (LOADED_BULLETS / Math.max(1, remaining)) * 100;

  const pullTrigger = () => {
    if (fired) return;
    const nextPot = pot + 10;
    setPot(nextPot);

    if (bullets.includes(cursor)) {
      setFired(true);
      setHitChamber(cursor);
    } else {
      setCursor((c) => c + 1);
    }
  };

  const reset = () => {
    setBullets(pickThreeChambers());
    setCursor(0);
    setPot(20);
    setFired(false);
    setHitChamber(null);
  };

  const cx = 120;
  const cy = 120;
  const ringR = 86;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">
            24 孔特制左轮 · 暗装 <strong className="text-[var(--diagram-accent)]">3 发</strong>空包弹
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            随机重装 3 弹
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 items-center">
          {/* 24 孔左轮环形 SVG */}
          <div className="flex justify-center">
            <svg
              viewBox="0 0 240 240"
              className="w-[224px] h-[224px] select-none"
              role="img"
              aria-label={`24 孔左轮弹巢，当前第 ${cursor + 1} 孔，已安全扣响 ${cursor} 发`}
            >
              {/* 外弹巢金属盘 */}
              <circle
                cx={cx}
                cy={cy}
                r={104}
                fill="var(--diagram-panel)"
                stroke="var(--diagram-border)"
                strokeWidth={2}
              />
              <circle
                cx={cx}
                cy={cy}
                r={58}
                fill="var(--diagram-surface)"
                stroke="var(--border-hairline)"
                strokeWidth={1.5}
              />

              {/* 指向当前孔位的指针线 */}
              {(() => {
                const activeIdx = fired && hitChamber !== null ? hitChamber : cursor;
                const angle = (activeIdx / TOTAL_CHAMBERS) * Math.PI * 2 - Math.PI / 2;
                const px = cx + Math.cos(angle) * 66;
                const py = cy + Math.sin(angle) * 66;
                return (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={px}
                    y2={py}
                    stroke={fired ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                );
              })()}

              {/* 24 个弹膛孔 */}
              {Array.from({ length: TOTAL_CHAMBERS }).map((_, i) => {
                const angle = (i / TOTAL_CHAMBERS) * Math.PI * 2 - Math.PI / 2;
                const x = cx + Math.cos(angle) * ringR;
                const y = cy + Math.sin(angle) * ringR;
                const isSpentSafe = i < cursor;
                const isCurrent = !fired && i === cursor;
                const isHit = fired && i === hitChamber;
                const isRevealedBullet = fired && bullets.includes(i) && !isHit;

                let fill = 'var(--diagram-surface)';
                let stroke = 'var(--diagram-border)';
                let strokeWidth = 1.5;

                if (isHit) {
                  fill = 'var(--diagram-accent)';
                  stroke = 'var(--diagram-accent)';
                  strokeWidth = 2.5;
                } else if (isRevealedBullet) {
                  fill = 'color-mix(in srgb, var(--diagram-accent) 45%, var(--diagram-panel))';
                  stroke = 'var(--diagram-accent)';
                  strokeWidth = 1.5;
                } else if (isCurrent) {
                  fill = 'color-mix(in srgb, var(--diagram-brass) 28%, var(--diagram-panel))';
                  stroke = 'var(--diagram-brass)';
                  strokeWidth = 2.5;
                } else if (isSpentSafe) {
                  fill = 'color-mix(in srgb, var(--text-muted) 22%, var(--diagram-surface))';
                  stroke = 'var(--border-hairline)';
                }

                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isCurrent || isHit ? 8.5 : 7}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                    />
                    {isSpentSafe && (
                      <line
                        x1={x - 2.5}
                        y1={y - 2.5}
                        x2={x + 2.5}
                        y2={y + 2.5}
                        stroke="var(--text-muted)"
                        strokeWidth={1.2}
                      />
                    )}
                  </g>
                );
              })}

              {/* 中心读数 */}
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                fill={fired ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
                fontSize="20"
                fontWeight="700"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {fired ? '击发！' : `${hitProb.toFixed(1)}%`}
              </text>
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="11"
              >
                {fired ? `第 ${cursor + 1} 孔中弹` : `余 ${remaining} 孔`}
              </text>
            </svg>
          </div>

          {/* 右侧仪表与控制 */}
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-[var(--diagram-surface)] border border-[var(--border-hairline)] p-2.5">
                <div className="text-[11px] text-[var(--text-secondary)]">当前彩池</div>
                <div className="text-[16px] font-bold text-[var(--diagram-brass)] tabular-nums">
                  {pot} 筹码
                </div>
              </div>
              <div className="rounded-lg bg-[var(--diagram-surface)] border border-[var(--border-hairline)] p-2.5">
                <div className="text-[11px] text-[var(--text-secondary)]">下一发中弹率</div>
                <div
                  className={`text-[16px] font-bold tabular-nums ${
                    hitProb >= 25 ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {fired ? '已击发' : `${LOADED_BULLETS} / ${remaining} (${hitProb.toFixed(1)}%)`}
                </div>
              </div>
            </div>

            {/* 概率飙升条 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[var(--text-secondary)] tabular-nums">
                <span>已安全连扣 {cursor} 发空膛</span>
                <span>{fired ? '已揭示全部 3 发弹位' : `轮到：${currentActor}`}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--diagram-surface)] border border-[var(--border-hairline)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.min(100, hitProb)}%`,
                    backgroundColor: hitProb >= 25 ? 'var(--diagram-accent)' : 'var(--diagram-brass)',
                  }}
                />
              </div>
            </div>

            {fired ? (
              <div className="rounded-lg border border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-surface))] p-3 space-y-2">
                <p className="text-[12px] font-semibold text-[var(--diagram-accent)]">
                  {currentActor}在第 {cursor + 1} 孔扣响空包弹，输掉全部 {pot} 筹码！
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="w-full py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
                >
                  重装 3 弹再开一局
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={pullTrigger}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full bg-[var(--diagram-accent)] text-[var(--accent-fg)] text-[12.5px] font-semibold hover:opacity-90 cursor-pointer"
              >
                <Crosshair className="w-4 h-4" aria-hidden="true" />
                <span>{currentActor} · 加注 +10 并扣扳机</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        24 个弹膛暗藏 3 发空包弹，每扣响一次空膛底池随之增长，剩余孔数越少击发概率越陡，扣中者痛失整池筹码。
      </p>
    </div>
  );
}

// ============================================================================
// 6. liar-pandemic · 感染游戏
// ============================================================================

interface PandemicPlayer {
  id: number;
  infected: boolean;
  revealedInfected: boolean;
  vaccines: number;
}

const VACCINE_TARGET = 4;

function createInitialPandemicPlayers(): PandemicPlayer[] {
  const pool = shuffleCards(Array.from({ length: 12 }, (_, i) => i));
  const initialInfected = new Set(pool.slice(0, 2));
  return Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    infected: initialInfected.has(i),
    revealedInfected: false,
    vaccines: 0,
  }));
}

function LiarPandemicDiagram() {
  const [players, setPlayers] = useState<PandemicPlayer[]>(() => {
    // 固定初始暗藏 3 号与 9 号为初始感染者，点重置后随机洗牌
    return Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      infected: i === 2 || i === 8,
      revealedInfected: false,
      vaccines: 0,
    }));
  });
  const [picked, setPicked] = useState<number[]>([0, 1]);
  const [xray, setXray] = useState<boolean>(false);
  const [contacts, setContacts] = useState<number>(0);
  const [log, setLog] = useState<string>(
    '圆阵 12 人中暗藏 2 名初始感染者；点击选中 2 人后点「刷卡接触」观察疫苗生成与病毒传染。'
  );

  const togglePick = (idx: number) => {
    setPicked((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= 2) return [prev[1], idx];
      return [...prev, idx];
    });
  };

  const doContact = () => {
    if (picked.length !== 2) return;
    const [aIdx, bIdx] = picked;
    const a = players[aIdx];
    const b = players[bIdx];
    setContacts((c) => c + 1);

    if (!a.infected && !b.infected) {
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === aIdx || idx === bIdx ? { ...p, vaccines: p.vaccines + 1 } : p
        )
      );
      setLog(`安全接触！${a.id} 号与 ${b.id} 号均为正常人，各自获得 +1 份疫苗。`);
    } else if (a.infected && b.infected) {
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === aIdx || idx === bIdx ? { ...p, revealedInfected: true } : p
        )
      );
      setLog(`${a.id} 号与 ${b.id} 号均已感染，本次接触不产生疫苗。`);
    } else {
      const victim = a.infected ? b : a;
      const carrier = a.infected ? a : b;
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === aIdx || idx === bIdx
            ? { ...p, infected: true, revealedInfected: true }
            : p
        )
      );
      setLog(`病毒传染！${carrier.id} 号为感染者，${victim.id} 号刷卡后立刻变红感染！`);
    }
  };

  const healEligible = (idx: number) => {
    const target = players[idx];
    if (!target || !target.infected || target.vaccines < VACCINE_TARGET) return;
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
              ...p,
              infected: false,
              revealedInfected: false,
              vaccines: p.vaccines - VACCINE_TARGET,
            }
          : p
      )
    );
    setLog(`治疗机生效！${target.id} 号消耗 ${VACCINE_TARGET} 份疫苗，已恢复为正常人。`);
  };

  const reset = () => {
    setPlayers(createInitialPandemicPlayers());
    setPicked([0, 1]);
    setContacts(0);
    setLog('已重新随机潜伏 2 名感染者，点击任意两人进行「刷卡接触」。');
  };

  const healableList = players.filter((p) => p.infected && p.vaccines >= VACCINE_TARGET);
  const qualifiedCount = players.filter((p) => !p.infected && p.vaccines >= VACCINE_TARGET).length;
  const visibleInfectedCount = players.filter((p) => p.revealedInfected || (xray && p.infected)).length;

  // 计算 12 个节点坐标（viewBox 320 x 260）
  const cx = 160;
  const cy = 130;
  const rx = 114;
  const ry = 98;
  const coords = players.map((_, i) => {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
  });

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              已接触 {contacts} 次 · 达标正常人{' '}
              <strong className="text-[var(--diagram-brass)]">{qualifiedCount}</strong> / 12
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-accent)] tabular-nums">
              已显红感染 {visibleInfectedCount} 人
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setXray((v) => !v)}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {xray ? (
                <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {xray ? '隐藏暗感染' : '透视病毒源'}
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

        {/* 12 人圆阵 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-3">
          <div className="relative mx-auto w-full max-w-[340px] aspect-[320/260]">
            {/* 轨道与选中连线 SVG */}
            <svg viewBox="0 0 320 260" className="absolute inset-0 w-full h-full pointer-events-none">
              <ellipse
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                fill="none"
                stroke="var(--border-hairline)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              {picked.length === 2 && (
                <line
                  x1={coords[picked[0]].x}
                  y1={coords[picked[0]].y}
                  x2={coords[picked[1]].x}
                  y2={coords[picked[1]].y}
                  stroke="var(--diagram-brass)"
                  strokeWidth={2.5}
                  strokeDasharray="5 3"
                />
              )}
            </svg>

            {/* 中心刷卡按钮 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                type="button"
                disabled={picked.length !== 2}
                onClick={doContact}
                className="pointer-events-auto inline-flex flex-col items-center justify-center gap-0.5 w-[88px] h-[88px] rounded-full border-2 border-[var(--diagram-brass)] bg-[var(--diagram-surface)] text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-surface))] disabled:opacity-45 transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
                <span className="text-[11.5px] font-bold">刷卡接触</span>
                <span className="text-[10px] text-[var(--text-secondary)] tabular-nums">
                  {picked.length === 2 ? `${picked[0] + 1} ↔ ${picked[1] + 1}` : '选两人'}
                </span>
              </button>
            </div>

            {/* 12 名玩家圆点 */}
            {players.map((p, idx) => {
              const isSelected = picked.includes(idx);
              const showRed = p.revealedInfected || (xray && p.infected);
              const isQualified = !p.infected && p.vaccines >= VACCINE_TARGET;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePick(idx)}
                  style={{
                    left: `${(coords[idx].x / 320) * 100}%`,
                    top: `${(coords[idx].y / 260) * 100}%`,
                  }}
                  aria-pressed={isSelected}
                  aria-label={`${p.id}号，疫苗 ${p.vaccines} 份`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-[42px] h-[42px] rounded-full border flex flex-col items-center justify-center leading-none transition-all cursor-pointer ${
                    showRed
                      ? 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                      : isQualified
                        ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)]'
                  } ${isSelected ? 'ring-2 ring-[var(--text-primary)] scale-110 z-10' : 'hover:scale-105'}`}
                >
                  <span className="text-[11px] font-bold tabular-nums flex items-center gap-0.5">
                    {showRed && <Biohazard className="w-2.5 h-2.5" aria-hidden="true" />}
                    {p.id}
                  </span>
                  <span className="text-[9.5px] opacity-90 tabular-nums mt-0.5">
                    苗{p.vaccines}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 治疗机面板（当有感染者攒够疫苗时出现快捷按钮） */}
          {healableList.length > 0 && (
            <div className="pt-2.5 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-center gap-2">
              {healableList.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => healEligible(p.id - 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[11.5px] font-semibold hover:opacity-90 cursor-pointer"
                >
                  <HeartPulse className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{p.id} 号进治疗机恢复正常（消耗 {VACCINE_TARGET} 疫苗）</span>
                </button>
              ))}
            </div>
          )}

          <p className="text-[12px] text-[var(--text-primary)] text-center leading-relaxed pt-1 border-t border-[var(--border-hairline)]">
            {log}
          </p>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        两位正常人刷卡各自生成 1 份疫苗，只要一方带毒便立刻传染变红；攒满 {VACCINE_TARGET} 份疫苗的感染者可借治疗机洗白恢复正常。
      </p>
    </div>
  );
}

// ============================================================================
// 7. musical-chairs · 抢椅子游戏
// ============================================================================

interface ChairState {
  id: number;
  status: 'open' | 'removed' | 'won' | 'destroyed';
  occupants: number[];
}

function createChairList(count: number): ChairState[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    status: 'open',
    occupants: [],
  }));
}

function MusicalChairsDiagram() {
  const [survivors, setSurvivors] = useState<number[]>(() =>
    Array.from({ length: 15 }, (_, i) => i + 1)
  );
  const [round, setRound] = useState<number>(1);
  const [chairs, setChairs] = useState<ChairState[]>(() => createChairList(14));
  const [removedChairId, setRemovedChairId] = useState<number | null>(7);
  const [phase, setPhase] = useState<'remove' | 'resolved' | 'finished'>('remove');
  const [champion, setChampion] = useState<number | null>(null);
  const [log, setLog] = useState<string>(
    '点击一把椅子由本轮「庄家」秘密撤走（已预选 7 号椅），再点「音乐停 · 模拟抢座」。'
  );

  // 演示 3 位持币者手中刻名盖亚金币分布（玩家编号 -> 持有枚数）
  const winnerId = champion ?? survivors[0] ?? 1;

  const selectChairToRemove = (chairId: number) => {
    if (phase !== 'remove') return;
    setRemovedChairId(chairId);
    setLog(`庄家已暗中指定撤走 ${chairId} 号椅；点击「音乐停 · 模拟抢座」结算本轮淘汰。`);
  };

  const runScramble = () => {
    if (phase !== 'remove' || removedChairId === null) return;

    const totalChairs = survivors.length - 1;
    const activeChairIds = Array.from({ length: totalChairs }, (_, i) => i + 1).filter(
      (id) => id !== removedChairId
    );

    // 模拟幸存者抢座：确保至少出现 1 处双人撞椅作废或误冲撤走椅位，呈现真实淘汰
    const map = new Map<number, number[]>();
    for (let i = 1; i <= totalChairs; i++) map.set(i, []);

    const shuffledPlayers = shuffleCards(survivors);
    if (totalChairs === 1) {
      // 仅剩 2 人抢最后 1 把椅时，不撤椅或决定唯一坐定者
      map.get(1)!.push(shuffledPlayers[0]);
    } else {
      // 1 名玩家误冲庄家撤走的空位
      map.get(removedChairId)!.push(shuffledPlayers[0]);
      // 其余玩家抢剩余完好椅子，制造 1-2 组两人撞椅
      const restPlayers = shuffledPlayers.slice(1);
      const shuffledChairs = shuffleCards(activeChairIds);
      restPlayers.forEach((pid, idx) => {
        if (idx < shuffledChairs.length) {
          map.get(shuffledChairs[idx])!.push(pid);
        } else {
          // 多出的人去撞某把椅，触发「两人同抢椅废双淘汰」
          const clashChair = shuffledChairs[idx % shuffledChairs.length];
          map.get(clashChair)!.push(pid);
        }
      });
    }

    const nextChairs: ChairState[] = [];
    const nextSurvivors: number[] = [];
    let clashCount = 0;
    let voidedCount = 0;

    for (let id = 1; id <= totalChairs; id++) {
      const occ = map.get(id) ?? [];
      if (id === removedChairId && totalChairs > 1) {
        nextChairs.push({ id, status: 'removed', occupants: occ });
        voidedCount += occ.length;
      } else if (occ.length === 1) {
        nextChairs.push({ id, status: 'won', occupants: occ });
        nextSurvivors.push(occ[0]);
      } else if (occ.length >= 2) {
        nextChairs.push({ id, status: 'destroyed', occupants: occ });
        clashCount += 1;
      } else {
        nextChairs.push({ id, status: 'open', occupants: [] });
      }
    }

    // 防止极端情况下全员撞死导致 0 幸存
    if (nextSurvivors.length === 0) {
      const rescue = shuffledPlayers[shuffledPlayers.length - 1];
      nextSurvivors.push(rescue);
      const firstOpen = nextChairs.find((c) => c.status !== 'removed');
      if (firstOpen) {
        firstOpen.status = 'won';
        firstOpen.occupants = [rescue];
      }
    }

    setChairs(nextChairs);
    const eliminated = survivors.length - nextSurvivors.length;

    if (nextSurvivors.length === 1) {
      setSurvivors(nextSurvivors);
      setChampion(nextSurvivors[0]);
      setPhase('finished');
      setLog(
        `终局定音！${nextSurvivors[0]} 号玩家独自坐稳最后一把椅子，唯有刻着「${nextSurvivors[0]}号」的盖亚金币可兑换 1 亿/枚！`
      );
    } else {
      setSurvivors(nextSurvivors);
      setPhase('resolved');
      setLog(
        `第 ${round} 轮结束：${clashCount} 把椅因撞座作废，${voidedCount} 人扑空被撤椅位，共淘汰 ${eliminated} 人，余 ${nextSurvivors.length} 人晋级。`
      );
    }
  };

  const advanceNextRound = () => {
    if (phase !== 'resolved') return;
    const nextChairCount = Math.max(1, survivors.length - 1);
    setRound((r) => r + 1);
    setChairs(createChairList(nextChairCount));
    setRemovedChairId(nextChairCount === 1 ? 1 : Math.ceil(nextChairCount / 2));
    setPhase('remove');
    setLog(
      nextChairCount === 1
        ? '最终决战仅剩最后 1 把椅子！点击「音乐停 · 模拟抢座」揭晓唯一坐定者。'
        : `第 ${round + 1} 轮：场上 ${survivors.length} 人抢 ${nextChairCount} 把椅，请庄家选 1 把椅子秘密撤走。`
    );
  };

  const reset = () => {
    setSurvivors(Array.from({ length: 15 }, (_, i) => i + 1));
    setRound(1);
    setChairs(createChairList(14));
    setRemovedChairId(7);
    setPhase('remove');
    setChampion(null);
    setLog('点击一把椅子由本轮「庄家」秘密撤走（已预选 7 号椅），再点「音乐停 · 模拟抢座」。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              {phase === 'finished'
                ? `终局胜者：${champion} 号`
                : `第 ${round} 轮 · 幸存 ${survivors.length} 人抢 ${chairs.length} 椅`}
            </span>
            {phase === 'remove' && chairs.length > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--diagram-accent)]">
                庄家秘密撤椅：{removedChairId} 号
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置 15 人
          </button>
        </div>

        {/* 孤岛编号椅子阵列 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
            {chairs.map((chair) => {
              const isPickedRemove = phase === 'remove' && removedChairId === chair.id && chairs.length > 1;
              const isRemoved = chair.status === 'removed' || isPickedRemove;
              const isDestroyed = chair.status === 'destroyed';
              const isWon = chair.status === 'won';

              return (
                <button
                  key={chair.id}
                  type="button"
                  disabled={phase !== 'remove' || chairs.length === 1}
                  onClick={() => selectChairToRemove(chair.id)}
                  className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 gap-1 transition-all ${
                    phase === 'remove' && chairs.length > 1 ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isDestroyed
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                      : isRemoved
                        ? 'border-dashed border-[var(--diagram-accent)]/70 bg-[var(--diagram-surface)]/50 text-[var(--text-muted)]'
                        : isWon
                          ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)]'
                  }`}
                >
                  <Armchair className="w-4 h-4" aria-hidden="true" />
                  <span className="text-[11px] font-bold tabular-nums">{chair.id}号椅</span>
                  <span className="text-[9.5px] leading-none tabular-nums">
                    {isDestroyed
                      ? `${chair.occupants.length}人撞废`
                      : isRemoved
                        ? '已撤走'
                        : isWon
                          ? `${chair.occupants[0]}号坐稳`
                          : '待抢'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 阶段动作按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-hairline)]">
            <p className="text-[12px] text-[var(--text-primary)] leading-relaxed flex-1">{log}</p>
            {phase === 'remove' && (
              <button
                type="button"
                onClick={runScramble}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                音乐停 · 模拟抢座
              </button>
            )}
            {phase === 'resolved' && (
              <button
                type="button"
                onClick={advanceNextRound}
                className="shrink-0 px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                进入第 {round + 1} 轮（余 {survivors.length} 人）
              </button>
            )}
          </div>
        </div>

        {/* 盖亚金币终局归属条 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex items-center gap-1.5 text-[var(--diagram-brass)] font-semibold">
            <Coins className="w-4 h-4" aria-hidden="true" />
            <span>
              盖亚金币兑现规则：
              {phase === 'finished'
                ? `仅刻「${winnerId}号」的金币值 1 亿/枚`
                : '终局仅最后 1 椅胜者刻名币有效'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] tabular-nums">
            <span className="px-2 py-0.5 rounded-full border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-surface))] text-[var(--diagram-brass)] font-semibold">
              「{winnerId}号」币 = 1 亿/枚
            </span>
            <span className="px-2 py-0.5 rounded-full border border-[var(--border-hairline)] bg-[var(--diagram-surface)] text-[var(--text-muted)] line-through">
              其余 14 人刻名币 = 作废
            </span>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        每轮先由庄家暗撤一把椅子再抢座，两人同抢则椅废双双出局；纵使被淘汰，只要手里攥着最后胜者的刻名盖亚金币仍可按枚领走 1 亿。
      </p>
    </div>
  );
}

// ============================================================================
// 8. liar-bid-poker · 投标扑克
// ============================================================================

type StdRank = '10' | 'J' | 'Q' | 'K' | 'A';

interface BidCard {
  id: string;
  suit: Suit;
  rank: StdRank;
  rivalBid: number;
}

const BID_RANK_VAL: Record<StdRank, number> = {
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

function buildAuctionLot(): BidCard[] {
  const suits: Suit[] = ['♠', '♥', '♣', '♦'];
  const ranks: StdRank[] = ['A', 'K', 'Q', 'J', '10'];
  const all: BidCard[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      const base = rank === 'A' ? 45 : rank === 'K' ? 35 : rank === 'Q' ? 30 : 25;
      all.push({
        id: `${suit}${rank}`,
        suit,
        rank,
        rivalBid: base + ((suit.charCodeAt(0) + rank.charCodeAt(0)) % 4) * 5,
      });
    }
  }
  return shuffleCards(all);
}

function evalBidPokerHand(hand: BidCard[]): { name: string; bonus: number } {
  if (hand.length < 5) {
    return { name: `还差 ${5 - hand.length} 张成手`, bonus: 0 };
  }
  const counts = new Map<StdRank, number>();
  for (const c of hand) counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
  const freq = Array.from(counts.values()).sort((a, b) => b - a);
  const sameSuit = hand.every((c) => c.suit === hand[0].suit);
  const vals = Array.from(new Set(hand.map((c) => BID_RANK_VAL[c.rank]))).sort((a, b) => a - b);
  const isStraight = vals.length === 5 && vals[4] - vals[0] === 4;

  if (sameSuit && isStraight) return { name: '皇家同花顺', bonus: 320 };
  if (freq[0] === 4) return { name: '四条', bonus: 260 };
  if (freq[0] === 3 && freq[1] === 2) return { name: '葫芦', bonus: 200 };
  if (sameSuit) return { name: '同花', bonus: 160 };
  if (isStraight) return { name: '顺子', bonus: 140 };
  if (freq[0] === 3) return { name: '三条', bonus: 100 };
  if (freq[0] === 2 && freq[1] === 2) return { name: '两对', bonus: 60 };
  if (freq[0] === 2) return { name: '一对', bonus: 30 };
  return { name: '高牌', bonus: 0 };
}

const INITIAL_BID_COINS = 300;
const QUALIFY_LINE = 340;

function LiarBidPokerDiagram() {
  const [lot, setLot] = useState<BidCard[]>(() => buildAuctionLot());
  const [lotIdx, setLotIdx] = useState<number>(0);
  const [coins, setCoins] = useState<number>(INITIAL_BID_COINS);
  const [hand, setHand] = useState<Array<{ card: BidCard; cost: number }>>([]);
  const [bidAmount, setBidAmount] = useState<number>(() =>
    Math.min(INITIAL_BID_COINS, lot[0].rivalBid + 5)
  );
  const [log, setLog] = useState<string>(
    '面对亮相扑克选择「出价买进」或「跳过」，凑齐 5 张牌后按「剩余金币 + 牌型奖金」结算总资产。'
  );

  const done = hand.length >= 5 || lotIdx >= lot.length;
  const currentCard = !done ? lot[lotIdx] : null;
  const minWinBid = currentCard ? currentCard.rivalBid + 5 : 0;

  const evalRes = evalBidPokerHand(hand.map((h) => h.card));
  const totalAsset = coins + evalRes.bonus;

  const syncNextCardBid = (nextIndex: number, currentCoins: number) => {
    if (nextIndex < lot.length) {
      const suggested = Math.min(currentCoins, lot[nextIndex].rivalBid + 5);
      setBidAmount(Math.max(5, suggested));
    }
  };

  const buyCard = () => {
    if (!currentCard || done) return;
    if (bidAmount > coins) {
      setLog('剩余金币不足，请调低出价或点击「跳过」。');
      return;
    }
    if (bidAmount < minWinBid) {
      setLog(`对手已喊至 ${currentCard.rivalBid} 币，至少出价 ${minWinBid} 币才能拍下此牌。`);
      return;
    }
    const nextCoins = coins - bidAmount;
    const nextHand = [...hand, { card: currentCard, cost: bidAmount }];
    const nextIdx = lotIdx + 1;
    setCoins(nextCoins);
    setHand(nextHand);
    setLotIdx(nextIdx);
    syncNextCardBid(nextIdx, nextCoins);

    if (nextHand.length >= 5) {
      const finalEval = evalBidPokerHand(nextHand.map((h) => h.card));
      const finalTotal = nextCoins + finalEval.bonus;
      setLog(
        `凑齐 5 张！成牌「${finalEval.name}」获奖励 +${finalEval.bonus} 币，总资产 ${finalTotal} 币（${
          finalTotal >= QUALIFY_LINE ? '达到晋级线' : '低于晋级参考线'
        }）。`
      );
    } else {
      setLog(`以 ${bidAmount} 币拍下 ${currentCard.suit}${currentCard.rank}，还差 ${5 - nextHand.length} 张牌。`);
    }
  };

  const skipCard = () => {
    if (!currentCard || done) return;
    const remainLotsAfter = lot.length - (lotIdx + 1);
    const needCards = 5 - hand.length;
    if (remainLotsAfter < needCards && coins >= minWinBid) {
      setLog('剩余待拍牌数刚好等于所需手牌，不能再跳过！');
      return;
    }
    const nextIdx = lotIdx + 1;
    setLotIdx(nextIdx);
    syncNextCardBid(nextIdx, coins);
    setLog(`跳过 ${currentCard.suit}${currentCard.rank}，保留 ${coins} 币等待下一张亮相牌。`);
  };

  const reset = () => {
    const nextLot = buildAuctionLot();
    setLot(nextLot);
    setLotIdx(0);
    setCoins(INITIAL_BID_COINS);
    setHand([]);
    setBidAmount(Math.min(INITIAL_BID_COINS, nextLot[0].rivalBid + 5));
    setLog('面对亮相扑克选择「出价买进」或「跳过」，凑齐 5 张牌后按「剩余金币 + 牌型奖金」结算总资产。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--diagram-brass)] tabular-nums">
              <Coins className="w-4 h-4" aria-hidden="true" />
              余币 {coins}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--text-secondary)] tabular-nums">
              手牌 {hand.length} / 5 · 晋级参考线 {QUALIFY_LINE} 币
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新竞拍
          </button>
        </div>

        {/* 拍卖展台 / 终局核算 */}
        {currentCard ? (
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-center">
            {/* 亮相牌面 */}
            <div className="flex justify-center">
              {(() => {
                const isRed = currentCard.suit === '♥' || currentCard.suit === '♦';
                return (
                  <div className="w-[82px] h-[112px] rounded-xl border-2 border-[var(--diagram-brass)] bg-[var(--diagram-surface)] flex flex-col items-center justify-between p-2 select-none">
                    <span
                      className={`self-start text-[12px] font-bold leading-none ${
                        isRed ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {currentCard.rank}
                    </span>
                    <span
                      className={`text-[30px] leading-none ${
                        isRed ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {currentCard.suit}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] tabular-nums">
                      第 {lotIdx + 1} 号拍品
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* 出价控制区 */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <span className="text-[var(--text-secondary)]">
                  场内对手最高喊价：
                  <strong className="text-[var(--text-primary)] tabular-nums">
                    {currentCard.rivalBid} 币
                  </strong>
                </span>
                <span className="font-bold text-[var(--diagram-brass)] tabular-nums">
                  你的出价：{bidAmount} 币
                </span>
              </div>

              <input
                type="range"
                min={5}
                max={Math.max(5, coins)}
                step={5}
                value={Math.min(bidAmount, Math.max(5, coins))}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                aria-label="调节竞拍出价金币"
                className="w-full accent-[var(--diagram-brass)] cursor-pointer"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={buyCard}
                  disabled={coins < minWinBid}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  <Gavel className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>出价买进（≥{minWinBid} 币）</span>
                </button>
                <button
                  type="button"
                  onClick={skipCard}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>跳过此牌</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-xl border p-4 text-center space-y-2 ${
              totalAsset >= QUALIFY_LINE
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))]'
                : 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))]'
            }`}
          >
            <div className="text-[12px] text-[var(--text-secondary)]">
              剩余金币 {coins} + {evalRes.name}奖金 {evalRes.bonus}
            </div>
            <div className="text-[20px] font-bold text-[var(--text-primary)] tabular-nums">
              总资产 {totalAsset} 币 ·{' '}
              <span
                className={
                  totalAsset >= QUALIFY_LINE
                    ? 'text-[var(--diagram-brass)]'
                    : 'text-[var(--diagram-accent)]'
                }
              >
                {totalAsset >= QUALIFY_LINE ? '晋级决赛' : '未达晋级线'}
              </span>
            </div>
          </div>
        )}

        {/* 5 个手牌槽 */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, idx) => {
            const item = hand[idx];
            if (!item) {
              return (
                <div
                  key={idx}
                  className="h-[70px] rounded-lg border border-dashed border-[var(--diagram-border)] bg-[var(--diagram-panel)]/50 flex items-center justify-center text-[11px] text-[var(--text-muted)]"
                >
                  空槽 {idx + 1}
                </div>
              );
            }
            const isRed = item.card.suit === '♥' || item.card.suit === '♦';
            return (
              <div
                key={item.card.id}
                className="h-[70px] rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] flex flex-col items-center justify-center gap-0.5"
              >
                <span
                  className={`text-[15px] font-bold leading-none ${
                    isRed ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {item.card.suit}
                  {item.card.rank}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] tabular-nums">
                  -{item.cost}币
                </span>
              </div>
            );
          })}
        </div>

        {/* 实时资产条 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--border-hairline)] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="text-[var(--text-secondary)] tabular-nums">
            余币 <strong className="text-[var(--text-primary)]">{coins}</strong> + 牌型奖金{' '}
            <strong className="text-[var(--diagram-brass)]">{evalRes.bonus}</strong> = 总资产{' '}
            <strong className="text-[var(--text-primary)]">{totalAsset}</strong>
          </span>
          <span className="text-[11.5px] text-[var(--text-secondary)]">{log}</span>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        花大价钱抢好牌可能掏空本金，只省钱又拿不到高档派彩；平衡出价与凑型，让「剩余金币 + 牌型奖金」冲进前列。
      </p>
    </div>
  );
}

// ============================================================================
// 9. liar-four-kingdoms · 四国志游戏
// ============================================================================

type KingdomId = 'wei' | 'shu' | 'wu' | 'ai';
type KingdomOrder = 'defend' | KingdomId;

interface KingdomState {
  id: KingdomId;
  name: string;
  troops: number;
  territory: number;
  lastOrder: KingdomOrder | null;
  lastDelta: number;
}

const INITIAL_KINGDOMS: KingdomState[] = [
  { id: 'wei', name: '魏国（你）', troops: 10, territory: 1, lastOrder: null, lastDelta: 0 },
  { id: 'shu', name: '蜀国', troops: 10, territory: 1, lastOrder: null, lastDelta: 0 },
  { id: 'wu', name: '吴国', troops: 10, territory: 1, lastOrder: null, lastDelta: 0 },
  { id: 'ai', name: '电脑国', troops: 10, territory: 1, lastOrder: null, lastDelta: 0 },
];

function orderLabel(order: KingdomOrder | null, kingdoms: KingdomState[]): string {
  if (!order) return '待命';
  if (order === 'defend') return '留守防御';
  const target = kingdoms.find((k) => k.id === order);
  return `攻打${target ? target.name.replace('（你）', '') : order}`;
}

function LiarFourKingdomsDiagram() {
  const [kingdoms, setKingdoms] = useState<KingdomState[]>(INITIAL_KINGDOMS);
  const [round, setRound] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<KingdomOrder>('shu');
  const [log, setLog] = useState<string>(
    '选择本轮魏国指令（出兵攻打邻国或留守本国），点击「同步提交指令」结算四国攻防。'
  );

  const aliveKingdoms = kingdoms.filter((k) => k.troops > 0);
  const weiAlive = (kingdoms.find((k) => k.id === 'wei')?.troops ?? 0) > 0;
  const gameOver = aliveKingdoms.length <= 1 || !weiAlive;

  const resolveTurn = () => {
    if (gameOver) return;

    // 确定四国本轮秘密指令
    const orders: Record<KingdomId, KingdomOrder> = {
      wei: selectedOrder,
      shu: 'defend',
      wu: 'defend',
      ai: 'defend',
    };

    const aliveIds = aliveKingdoms.map((k) => k.id);

    for (const k of aliveKingdoms) {
      if (k.id === 'wei') continue;
      const targets = aliveIds.filter((id) => id !== k.id);
      if (targets.length === 0) {
        orders[k.id] = 'defend';
        continue;
      }
      // 交替采取出兵与留守，让空城吞并与撞盾重创都有明显体现
      const seed = (round * 7 + k.name.charCodeAt(0)) % 3;
      if (seed === 0) {
        orders[k.id] = 'defend';
      } else {
        orders[k.id] = targets[(round + k.troops) % targets.length];
      }
    }

    const deltas: Record<KingdomId, number> = { wei: 0, shu: 0, wu: 0, ai: 0 };
    const territoryDeltas: Record<KingdomId, number> = { wei: 0, shu: 0, wu: 0, ai: 0 };
    const notes: string[] = [];

    // 同步结算每条进攻指令
    for (const attacker of aliveKingdoms) {
      const ord = orders[attacker.id];
      if (ord === 'defend') continue;
      const defender = kingdoms.find((k) => k.id === ord);
      if (!defender || defender.troops <= 0) continue;

      const defenderOrder = orders[defender.id];
      if (defenderOrder === 'defend') {
        // 撞上留守军：进攻方反遭重创
        deltas[attacker.id] -= 5;
        notes.push(
          `${attacker.name.replace('（你）', '')}攻${defender.name.replace('（你）', '')}撞上留守军，折损 5 兵力`
        );
      } else {
        // 敌国倾巢而出成空城：直接吞并领土与兵力
        const stolen = Math.min(5, defender.troops);
        deltas[attacker.id] += stolen;
        deltas[defender.id] -= stolen;
        territoryDeltas[attacker.id] += 1;
        territoryDeltas[defender.id] -= 1;
        notes.push(
          `${attacker.name.replace('（你）', '')}直捣${defender.name.replace('（你）', '')}空城，吞并 ${stolen} 兵力与领土`
        );
      }
    }

    const nextKingdoms = kingdoms.map((k) => {
      if (k.troops <= 0) return { ...k, lastOrder: null, lastDelta: 0 };
      const nextTroops = Math.max(0, k.troops + deltas[k.id]);
      const nextTerr = nextTroops === 0 ? 0 : Math.max(1, k.territory + territoryDeltas[k.id]);
      return {
        ...k,
        troops: nextTroops,
        territory: nextTerr,
        lastOrder: orders[k.id],
        lastDelta: nextTroops - k.troops,
      };
    });

    setKingdoms(nextKingdoms);
    setRound((r) => r + 1);

    // 若之前选中的攻击目标灭亡，切回留守
    const targetAfter = nextKingdoms.find((k) => k.id === selectedOrder);
    if (selectedOrder !== 'defend' && (!targetAfter || targetAfter.troops <= 0)) {
      setSelectedOrder('defend');
    }

    const survivorsAfter = nextKingdoms.filter((k) => k.troops > 0);
    const weiAfter = nextKingdoms.find((k) => k.id === 'wei')!;
    if (survivorsAfter.length === 1) {
      setLog(`终局！${survivorsAfter[0].name}吞并全场，成为唯一霸主。`);
    } else if (weiAfter.troops <= 0) {
      setLog(`第 ${round} 轮战报：魏国兵力归零灭亡！点击重置可重新布局。`);
    } else if (notes.length === 0) {
      setLog(`第 ${round} 轮：四国全员留守本国，兵力领土均无变化，局势陷入均衡。`);
    } else {
      setLog(`第 ${round} 轮战报：${notes.join('；')}。`);
    }
  };

  const reset = () => {
    setKingdoms(INITIAL_KINGDOMS);
    setRound(1);
    setSelectedOrder('shu');
    setLog('选择本轮魏国指令（出兵攻打邻国或留守本国），点击「同步提交指令」结算四国攻防。');
  };

  const maxTroops = Math.max(20, ...kingdoms.map((k) => k.troops));

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">
            {gameOver ? '战局结束' : `第 ${round} 回合密室布阵`} · 存活{' '}
            <strong className="text-[var(--diagram-brass)]">{aliveKingdoms.length}</strong> / 4 国
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置四国
          </button>
        </div>

        {/* 四国版图 2x2 */}
        <div className="grid grid-cols-2 gap-2.5">
          {kingdoms.map((k) => {
            const dead = k.troops <= 0;
            const isPlayer = k.id === 'wei';
            const isTargeted = !gameOver && selectedOrder === k.id;

            return (
              <div
                key={k.id}
                className={`rounded-xl border p-3 space-y-2 transition-colors ${
                  dead
                    ? 'border-[var(--border-hairline)] bg-[var(--diagram-panel)]/45 opacity-50'
                    : isTargeted
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))]'
                      : isPlayer
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[12px]">
                  <span className="inline-flex items-center gap-1 font-bold text-[var(--text-primary)]">
                    <Castle
                      className={`w-3.5 h-3.5 ${
                        isPlayer ? 'text-[var(--diagram-brass)]' : 'text-[var(--text-secondary)]'
                      }`}
                      aria-hidden="true"
                    />
                    {k.name}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">
                    {dead ? '已灭亡' : `领土 ${k.territory}`}
                  </span>
                </div>

                {/* 兵力条 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11.5px] tabular-nums">
                    <span className="text-[var(--text-secondary)]">兵力</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {k.troops}
                      {k.lastDelta !== 0 && (
                        <span
                          className={`ml-1 text-[11px] ${
                            k.lastDelta > 0
                              ? 'text-[var(--diagram-brass)]'
                              : 'text-[var(--diagram-accent)]'
                          }`}
                        >
                          ({k.lastDelta > 0 ? `+${k.lastDelta}` : k.lastDelta})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--diagram-surface)] border border-[var(--border-hairline)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{
                        width: `${(k.troops / maxTroops) * 100}%`,
                        backgroundColor: isPlayer
                          ? 'var(--diagram-brass)'
                          : 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div className="text-[10.5px] text-[var(--text-secondary)] truncate">
                  上轮：{dead ? '兵力归零' : orderLabel(k.lastOrder, kingdoms)}
                </div>
              </div>
            );
          })}
        </div>

        {/* 魏国指令选择栏 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          {!gameOver && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedOrder('defend')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] border transition-colors cursor-pointer ${
                    selectedOrder === 'defend'
                      ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] font-semibold'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                  留守本国
                </button>

                {kingdoms
                  .filter((k) => k.id !== 'wei' && k.troops > 0)
                  .map((enemy) => (
                    <button
                      key={enemy.id}
                      type="button"
                      onClick={() => setSelectedOrder(enemy.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] border transition-colors cursor-pointer ${
                        selectedOrder === enemy.id
                          ? 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)] font-semibold'
                          : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Swords className="w-3.5 h-3.5" aria-hidden="true" />
                      攻打{enemy.name}
                    </button>
                  ))}
              </div>

              <button
                type="button"
                onClick={resolveTurn}
                className="px-4 py-1.5 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
              >
                同步提交指令
              </button>
            </div>
          )}

          <p className="text-[12px] text-[var(--text-primary)] leading-relaxed">{log}</p>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        四国每轮同时秘密下达进攻或留守指令：攻打外出出征的空城可直接吞并兵力领土，撞上留守军则会反遭重创，兵力归零即刻灭亡。
      </p>
    </div>
  );
}

// ============================================================================
// 统一导出表（精确覆盖其余 9 场《欺诈游戏》赌局）
// ============================================================================

export const LIAR_GAME_DIAGRAMS: Record<string, ComponentType> = {
  'liar-round-one': LiarRoundOneDiagram,
  'liar-downsizing': LiarDownsizingDiagram,
  'contraband-game': ContrabandGameDiagram,
  'seventeen-poker': SeventeenPokerDiagram,
  'liar-russian-roulette': LiarRussianRouletteDiagram,
  'liar-pandemic': LiarPandemicDiagram,
  'musical-chairs': MusicalChairsDiagram,
  'liar-bid-poker': LiarBidPokerDiagram,
  'liar-four-kingdoms': LiarFourKingdomsDiagram,
};
