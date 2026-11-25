import { useState, type ComponentType } from 'react';
import {
  CheckCircle2,
  Coins,
  Droplets,
  Eye,
  EyeOff,
  Footprints,
  Gavel,
  Lock,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Timer,
  XCircle,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 1. 真伪心眼 (acma-true-or-false)                                             */
/* -------------------------------------------------------------------------- */
interface StatementCase {
  id: string;
  speaker: '对手' | '己方';
  claim: string;
  detail: string;
  truth: boolean;
  reason: string;
}

const TOF_CASES: StatementCase[] = [
  {
    id: 'c1',
    speaker: '对手',
    claim: '我刚才让这间密室突然结霜，是因为拥有操纵寒气的恶魔之力。',
    detail: '观察室内冰霜凝结与呼吸白雾，却未听见冷气出风口风声。',
    truth: false,
    reason: '真正起效的能力是把整座闭锁空间转移到了极地寒境，所谓「操气冷却」只是心理障眼法。',
  },
  {
    id: 'c2',
    speaker: '对手',
    claim: '我的左胸口袋里此刻放着一枚带齿痕的古老硬币。',
    detail: '对手回答前左手拇指下意识轻按了西装内袋边缘。',
    truth: true,
    reason: '口袋轮廓确实凸起且细微按压反暴露了保护物件的本能，这段陈述为「真」。',
  },
  {
    id: 'c3',
    speaker: '对手',
    claim: '在进这间屋子之前，我今天已经在另一栋大楼里赢下过一把钥匙。',
    detail: '注意对手手背钥匙印记亮度与刚刚召唤加多时的疲惫程度。',
    truth: false,
    reason: '恶魔刚刚才完整讲解他的能力细节，按铁则他此前从未发动过这张牌，此言为「伪」。',
  },
  {
    id: 'c4',
    speaker: '对手',
    claim: '如果我下一步放水认输，场外盯着我们的人也绝对不会善罢甘休。',
    detail: '提到场外人质与监控压力时，对方眼角余光扫向正门方向。',
    truth: true,
    reason: '语气虽带有谈判施压意味，但所陈述的身后处境符合客观事实，判定为「真」。',
  },
];

function TrueOrFalseDiagram() {
  const [role, setRole] = useState<'solver' | 'questioner'>('solver');
  const [arcticMode, setArcticMode] = useState<boolean>(false);
  const [caseIdx, setCaseIdx] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [judge, setJudge] = useState<{ guess: boolean; ok: boolean; msg: string } | null>(null);

  const cur = TOF_CASES[caseIdx];
  const finished = myScore >= 3 || oppScore >= 3;

  const handleJudge = (guess: boolean) => {
    if (finished || judge) return;
    const ok = guess === cur.truth;
    if (ok) {
      setMyScore((s) => Math.min(3, s + 1));
    } else {
      setOppScore((s) => Math.min(3, s + 1));
    }
    setJudge({
      guess,
      ok,
      msg: `${ok ? '识破成功！+1 分' : '判断失误！出题方 +1 分'} — ${cur.reason}`,
    });
  };

  const nextQuestion = () => {
    setCaseIdx((i) => (i + 1) % TOF_CASES.length);
    setRole((r) => (r === 'solver' ? 'questioner' : 'solver'));
    setJudge(null);
  };

  const reset = () => {
    setMyScore(0);
    setOppScore(0);
    setCaseIdx(0);
    setRole('solver');
    setJudge(null);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--diagram-brass)] tabular-nums">
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              己方 {myScore} / 3
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--diagram-accent)] tabular-nums">
              <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
              对手 {oppScore} / 3
            </span>
            <button
              type="button"
              onClick={() => setArcticMode((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                arcticMode
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {arcticMode ? '环境：极寒干扰 (-25°C)' : '环境：常温密室'}
            </button>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重开 3 分局
          </button>
        </div>

        {/* 回合攻防席位 */}
        <div className="grid grid-cols-2 gap-2.5 text-[12px]">
          <button
            type="button"
            onClick={() => setRole('solver')}
            className={`rounded-xl border px-3 py-2 text-left transition-colors cursor-pointer ${
              role === 'solver'
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] opacity-75'
            }`}
          >
            <div className="text-[11px] text-[var(--text-secondary)]">当前席位</div>
            <div className="font-bold text-[var(--text-primary)]">答题方 · 听言辨真伪</div>
          </button>
          <button
            type="button"
            onClick={() => setRole('questioner')}
            className={`rounded-xl border px-3 py-2 text-left transition-colors cursor-pointer ${
              role === 'questioner'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] opacity-75'
            }`}
          >
            <div className="text-[11px] text-[var(--text-secondary)]">攻守交替</div>
            <div className="font-bold text-[var(--text-primary)]">出题方 · 设言误导对方</div>
          </button>
        </div>

        {/* 陈述区与真伪裁决 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-secondary)]">
            <span>第 {caseIdx + 1} 题 · 陈述核验台</span>
            <span>{arcticMode ? '低温导致判断压迫加剧，需抓紧物理细节' : '恶魔加多实时校验真伪'}</span>
          </div>
          <p className="text-[13.5px] font-semibold text-[var(--text-primary)] leading-relaxed">
            「{cur.claim}」
          </p>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            线索：{cur.detail}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              disabled={finished || !!judge}
              onClick={() => handleJudge(true)}
              className="flex-1 min-w-[110px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-surface))] px-3 py-2 text-[12.5px] font-bold text-[var(--diagram-brass)] whitespace-nowrap cursor-pointer disabled:opacity-45"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              判定为真 (True)
            </button>
            <button
              type="button"
              disabled={finished || !!judge}
              onClick={() => handleJudge(false)}
              className="flex-1 min-w-[110px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-surface))] px-3 py-2 text-[12.5px] font-bold text-[var(--diagram-accent)] whitespace-nowrap cursor-pointer disabled:opacity-45"
            >
              <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              判定为伪 (False)
            </button>
            {judge && !finished && (
              <button
                type="button"
                onClick={nextQuestion}
                className="px-3.5 py-2 rounded-lg bg-[var(--text-primary)] text-[var(--bg-page)] text-[12px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                交替攻守 →
              </button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {finished
            ? `${myScore >= 3 ? '你先夺得 3 分胜出' : '对手积满 3 分获胜'}！点击右上角「重开 3 分局」再试一次。`
            : judge
              ? judge.msg
              : '结合现场物理破绽判断陈述为真或为伪，猜错时分直接归出题人。'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        看似对半猜真伪，核心在于拿已知的物理迹象、说话细节与刚公开的能力设定相互印证，拆穿掩人耳目的假陈述。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. 映影头踏 (acma-shadow-step)                                             */
/* -------------------------------------------------------------------------- */
function ShadowStepDiagram() {
  const [lampX, setLampX] = useState<number>(36); // 15..85 %
  const [locked, setLocked] = useState<boolean>(false);
  const [usedLock, setUsedLock] = useState<boolean>(false);
  const [myScore, setMyScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [note, setNote] = useState<string>('拖动光球改变投影方向，光球越靠左，右侧强敌头影拉得越长。');

  // 双方站在场地坐标：照朝 x=26%, y=56%; 兵头 x=72%, y=52%
  const shadowDir = lampX < 55 ? 1 : -1;
  const shadowStretch = Math.min(36, Math.max(12, Math.abs(lampX - 72) * 0.65));
  const headShadowX = Math.max(12, Math.min(90, 72 + (72 - lampX) * 0.42));
  const canStepOppHead = headShadowX < 88 && (locked || lampX <= 46);

  const handleLock = () => {
    if (usedLock) return;
    setUsedLock(true);
    setLocked(true);
    setNote('已发动「一分钟绝对固定」！悬浮光球与现场方位角被牢牢定死在半空。');
  };

  const handleStep = (target: 'opp' | 'self') => {
    if (myScore >= 2 || oppScore >= 2) return;
    if (target === 'opp') {
      if (!canStepOppHead) {
        setOppScore((s) => Math.min(2, s + 1));
        setNote('光球太靠近对手，他的头影又短又缩在脚边——扑空反被强力拳王贴身踩中 +1 分！');
        return;
      }
      const next = myScore + 1;
      setMyScore(next);
      setNote(
        next >= 2
          ? '连续 2 次踏碎对手颈部以上头影（本影与半影均有效），先得 2 分获胜！'
          : '踩中伸出的头影 +1 分！趁锁定结束前再来一记决胜。'
      );
    } else {
      setOppScore((s) => Math.min(2, s + 1));
      setNote('强敌贴身反踩你的头影得 1 分！');
    }
  };

  const reset = () => {
    setLampX(36);
    setLocked(false);
    setUsedLock(false);
    setMyScore(0);
    setOppScore(0);
    setNote('拖动光球改变投影方向，光球越靠左，右侧强敌头影拉得越长。');
  };

  const lampSvgX = 32 + (lampX / 100) * 336;
  const headTipX = 285 + (lampX < 72 ? 1 : -1) * shadowStretch;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--diagram-brass)] tabular-nums">
              挑战方 {myScore} / 2
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="font-semibold text-[var(--diagram-accent)] tabular-nums">
              强敌 {oppScore} / 2
            </span>
            <button
              type="button"
              disabled={usedLock}
              onClick={handleLock}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 ${
                locked
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
              }`}
            >
              <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />
              {locked ? '光球已绝对固定 (1分钟)' : '发动：一分钟绝对固定'}
            </button>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重置暗室
          </button>
        </div>

        {/* SVG 光球投影场地 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3">
          <svg viewBox="0 0 400 132" className="w-full h-auto" aria-hidden="true">
            <rect x="8" y="8" width="384" height="116" rx="10" fill="var(--bg-page)" stroke="var(--diagram-border)" />
            {/* 地面线 */}
            <line x1="24" y1="98" x2="376" y2="98" stroke="var(--diagram-border)" strokeWidth="1.5" />
            {/* 光锥 */}
            <polygon
              points={`${lampSvgX},28 245,98 355,98`}
              fill="var(--diagram-brass)"
              fillOpacity="0.10"
            />
            {/* 悬浮光球 */}
            <circle
              cx={lampSvgX}
              cy="28"
              r="11"
              fill="var(--diagram-brass)"
              fillOpacity={locked ? 0.95 : 0.72}
              stroke={locked ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
              strokeWidth={locked ? '2.5' : '1.5'}
            />
            <text x={lampSvgX} y="32" textAnchor="middle" fill="var(--bg-page)" fontSize="9" fontWeight="700">
              光
            </text>

            {/* 挑战方（左） */}
            <circle cx="110" cy="64" r="8" fill="var(--diagram-brass)" fillOpacity="0.3" stroke="var(--diagram-brass)" strokeWidth="1.6" />
            <rect x="103" y="74" width="14" height="24" rx="4" fill="var(--diagram-brass)" fillOpacity="0.25" stroke="var(--diagram-brass)" strokeWidth="1.5" />
            <text x="110" y="116" textAnchor="middle" fill="var(--diagram-brass)" fontSize="10" fontWeight="600">
              己方站位
            </text>

            {/* 强敌与投射出的头影（右） */}
            <line
              x1="285"
              y1="98"
              x2={headTipX}
              y2="98"
              stroke="var(--diagram-accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeOpacity="0.55"
            />
            <circle cx={headTipX} cy="98" r="7" fill="var(--diagram-accent)" />
            <circle cx="285" cy="62" r="8" fill="var(--diagram-accent)" fillOpacity="0.28" stroke="var(--diagram-accent)" strokeWidth="1.6" />
            <rect x="278" y="72" width="14" height="26" rx="4" fill="var(--diagram-accent)" fillOpacity="0.22" stroke="var(--diagram-accent)" strokeWidth="1.5" />
            <text x={headTipX} y="116" textAnchor="middle" fill="var(--diagram-accent)" fontSize="10" fontWeight="600">
              {shadowDir > 0 ? '长头影（可踏目标）' : '缩回脚边'}
            </text>
          </svg>
        </div>

        {/* 光球滑块 + 踩影操作 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11.5px] text-[var(--text-secondary)]">
            <span>调整悬浮光球横坐标（若未固定会缓慢偏移）</span>
            <span className="font-semibold text-[var(--diagram-brass)] tabular-nums">
              {canStepOppHead ? '头影充分拉长 · 命中窗口开启' : '头影贴脚过短 · 难以踩中'}
            </span>
          </div>
          <input
            type="range"
            min={16}
            max={84}
            value={lampX}
            disabled={locked}
            onChange={(e) => setLampX(Number(e.target.value))}
            aria-label="光球水平位置"
            className="w-full accent-[var(--diagram-brass)] cursor-pointer disabled:opacity-50"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={myScore >= 2 || oppScore >= 2}
              onClick={() => handleStep('opp')}
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-page)] px-3 py-2 text-[12px] font-bold whitespace-nowrap cursor-pointer disabled:opacity-45"
            >
              <Footprints className="w-4 h-4 shrink-0" aria-hidden="true" />
              抢步踩对手头影
            </button>
            <button
              type="button"
              disabled={myScore >= 2 || oppScore >= 2}
              onClick={() => handleStep('self')}
              className="px-3.5 py-2 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] text-[12px] whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-45"
            >
              模拟被强敌贴身踩影
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {note}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        硬拼身体反应绝不是前拳王的对手，必须看准半影也算命中的条款并锁定光源角度，让对方头影乖乖落在自己脚边。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. 五印一当 (acma-five-one)                                                */
/* -------------------------------------------------------------------------- */
type MarkKey = 'sun' | 'moon' | 'star' | 'cross' | 'crown';

interface FiveOneMark {
  key: MarkKey;
  label: string;
  symbol: string;
}

const MARKS: FiveOneMark[] = [
  { key: 'sun', label: '太阳', symbol: '☀' },
  { key: 'moon', label: '新月', symbol: '☽' },
  { key: 'star', label: '星辰', symbol: '★' },
  { key: 'cross', label: '圣印', symbol: '✚' },
  { key: 'crown', label: '王冠', symbol: '♛' },
];

function FiveOneDiagram() {
  // 真实谜底预设：星辰被扣走，共3张星辰里场上仅剩2张
  const [hiddenKey] = useState<MarkKey>('star');
  const [myHand, setMyHand] = useState<MarkKey[]>(['sun', 'sun', 'moon']);
  const [oppShown, setOppShown] = useState<MarkKey[]>(['cross', 'crown']);
  const [exchanged, setExchanged] = useState<boolean>(false);
  const [selectedSwap, setSelectedSwap] = useState<number[]>([0, 1]);
  const [verdict, setVerdict] = useState<string>(
    '首回合可公开部分手牌等量重抓；勾选手牌点「公开换牌」，再根据每种印记出现次数指认中央缺失那张。'
  );
  const [won, setWon] = useState<boolean | null>(null);

  const visibleCounts: Record<MarkKey, number> = {
    sun: 0,
    moon: 0,
    star: 0,
    cross: 0,
    crown: 0,
  };
  for (const m of [...myHand, ...oppShown]) visibleCounts[m] += 1;

  const toggleSwap = (idx: number) => {
    if (exchanged || won !== null) return;
    setSelectedSwap((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleExchange = () => {
    if (exchanged || won !== null) return;
    const drawPool: MarkKey[] = ['crown', 'cross', 'sun', 'moon', 'star'];
    const nextHand = myHand.map((card, idx) =>
      selectedSwap.includes(idx) ? drawPool[idx % drawPool.length] : card
    );
    setMyHand(nextHand);
    setOppShown(['cross', 'crown', 'moon']);
    setExchanged(true);
    setVerdict(
      `已公开 ${selectedSwap.length} 张牌并从牌库换回新牌！注意：星辰仍 0 现身而圣印/王冠几乎满员，可准备指认缺失印记。`
    );
  };

  const handleGuess = (guess: MarkKey) => {
    if (won !== null) return;
    const isHit = guess === hiddenKey;
    setWon(isHit);
    const label = MARKS.find((m) => m.key === guess)?.label ?? guess;
    setVerdict(
      isHit
        ? `猜中谜底「${label}」！整副 15 张牌里唯独它被预先抽进中央底座。`
        : `指认「${label}」失误！场上已经亮出过的印记暴露了真缺失项其实是「星辰」。`
    );
  };

  const reset = () => {
    setMyHand(['sun', 'sun', 'moon']);
    setOppShown(['cross', 'crown']);
    setExchanged(false);
    setSelectedSwap([0, 1]);
    setWon(null);
    setVerdict(
      '首回合可公开部分手牌等量重抓；勾选手牌点「公开换牌」，再根据每种印记出现次数指认中央缺失那张。'
    );
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            牌池：5 印记 × 3 张 = 15 张（暗扣 1 张）
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重洗 15 张牌
          </button>
        </div>

        {/* 5 种印记已知频次条 */}
        <div className="grid grid-cols-5 gap-2">
          {MARKS.map((m) => {
            const count = visibleCounts[m.key];
            return (
              <div
                key={m.key}
                className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-2 text-center space-y-1"
              >
                <div className="text-[16px] leading-none text-[var(--diagram-brass)]">{m.symbol}</div>
                <div className="text-[11px] font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-[10.5px] text-[var(--text-secondary)] tabular-nums">
                  已见 {count} / 3
                </div>
              </div>
            );
          })}
        </div>

        {/* 双方手牌与换牌区 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-[var(--diagram-brass)]">己方手牌（共 3 张）</span>
              {!exchanged && (
                <span className="text-[var(--text-secondary)]">点牌勾选公开重抓</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {myHand.map((k, idx) => {
                const info = MARKS.find((m) => m.key === k)!;
                const active = !exchanged && selectedSwap.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={exchanged || won !== null}
                    onClick={() => toggleSwap(idx)}
                    className={`rounded-lg border py-2.5 text-center transition-colors cursor-pointer disabled:cursor-default ${
                      active
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)]'
                    }`}
                  >
                    <div className="text-[17px] leading-none text-[var(--text-primary)]">
                      {info.symbol}
                    </div>
                    <div className="text-[11px] mt-1 font-medium text-[var(--text-secondary)]">
                      {info.label}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={exchanged || selectedSwap.length === 0 || won !== null}
              onClick={handleExchange}
              className="w-full rounded-lg bg-[var(--text-primary)] text-[var(--bg-page)] py-1.5 text-[12px] font-bold whitespace-nowrap cursor-pointer disabled:opacity-40"
            >
              {exchanged ? '已完成首回合公开换牌' : `公开换牌（换 ${selectedSwap.length} 张）`}
            </button>
          </div>

          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-[var(--diagram-accent)]">对手已亮出信息</span>
              <span className="text-[var(--text-secondary)]">暗底 1 张：{won === null ? '？' : '★ 星辰'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {oppShown.map((k, idx) => {
                const info = MARKS.find((m) => m.key === k)!;
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] py-2.5 text-center"
                  >
                    <div className="text-[17px] leading-none text-[var(--diagram-accent)]">
                      {info.symbol}
                    </div>
                    <div className="text-[11px] mt-1 text-[var(--text-secondary)]">{info.label}</div>
                  </div>
                );
              })}
              {oppShown.length < 3 && (
                <div className="rounded-lg border border-dashed border-[var(--diagram-border)] bg-[var(--diagram-surface)] py-2.5 flex flex-col items-center justify-center text-[var(--text-muted)]">
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                  <span className="text-[10px] mt-1">未公开</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {MARKS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  disabled={won !== null}
                  onClick={() => handleGuess(m.key)}
                  className="flex-1 min-w-[52px] rounded-md border border-[var(--diagram-border)] bg-[var(--diagram-surface)] hover:border-[var(--diagram-brass)] px-1.5 py-1 text-[11px] font-semibold text-[var(--text-primary)] whitespace-nowrap cursor-pointer disabled:opacity-45"
                >
                  猜{m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {verdict}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        看似越公开手牌越吃亏，其实换牌能多看过一轮牌面，同时迫使对手在算概率与防诈唬之间自己露底。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. 百金争夺 (acma-hundred-contest)                                         */
/* -------------------------------------------------------------------------- */
type ChessRankId = 'king' | 'general' | 'knight' | 'soldier' | 'commoner';

interface ChessPiece {
  id: ChessRankId;
  name: string;
  tier: number;
}

const CHESS_PIECES: ChessPiece[] = [
  { id: 'king', name: '国王', tier: 5 },
  { id: 'general', name: '将军', tier: 4 },
  { id: 'knight', name: '骑士', tier: 3 },
  { id: 'soldier', name: '兵卒', tier: 2 },
  { id: 'commoner', name: '平民', tier: 1 },
];

const ROUND_POTS = [10, 15, 20, 25, 30]; // 共 100 枚金币

function resolveContest(my: ChessRankId, opp: ChessRankId): 'win' | 'lose' | 'draw' {
  if (my === opp) return 'draw';
  if (my === 'commoner' && opp === 'king') return 'win';
  if (my === 'king' && opp === 'commoner') return 'lose';
  const myTier = CHESS_PIECES.find((p) => p.id === my)!.tier;
  const oppTier = CHESS_PIECES.find((p) => p.id === opp)!.tier;
  return myTier > oppTier ? 'win' : 'lose';
}

function HundredContestDiagram() {
  const [round, setRound] = useState<number>(0);
  const [usedMine, setUsedMine] = useState<ChessRankId[]>([]);
  const [oppOrder] = useState<ChessRankId[]>(['soldier', 'knight', 'general', 'commoner', 'king']);
  const [myGold, setMyGold] = useState<number>(0);
  const [oppGold, setOppGold] = useState<number>(0);
  const [log, setLog] = useState<string>(
    '第 1 轮（争夺 10 枚金币）：5 枚棋子各只能用一次，平民可专门留着反杀对手的国王！'
  );

  const finished = round >= 5;
  const currentPot = finished ? 0 : ROUND_POTS[round];

  const handlePlay = (pieceId: ChessRankId) => {
    if (finished || usedMine.includes(pieceId)) return;
    const oppId = oppOrder[round];
    const res = resolveContest(pieceId, oppId);
    const myName = CHESS_PIECES.find((p) => p.id === pieceId)!.name;
    const oppName = CHESS_PIECES.find((p) => p.id === oppId)!.name;

    setUsedMine((prev) => [...prev, pieceId]);
    if (res === 'win') {
      setMyGold((g) => g + currentPot);
      setLog(`第 ${round + 1} 轮：己方「${myName}」击败对手「${oppName}」，拿下 ${currentPot} 枚金币！`);
    } else if (res === 'lose') {
      setOppGold((g) => g + currentPot);
      setLog(`第 ${round + 1} 轮：己方「${myName}」不敌对手「${oppName}」，对手卷走 ${currentPot} 枚金币。`);
    } else {
      const half = Math.floor(currentPot / 2);
      setMyGold((g) => g + half);
      setOppGold((g) => g + (currentPot - half));
      setLog(`第 ${round + 1} 轮：双方同出「${myName}」打成平手，平分本轮金币。`);
    }
    setRound((r) => r + 1);
  };

  const reset = () => {
    setRound(0);
    setUsedMine([]);
    setMyGold(0);
    setOppGold(0);
    setLog('第 1 轮（争夺 10 枚金币）：5 枚棋子各只能用一次，平民可专门留着反杀对手的国王！');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span className="inline-flex items-center gap-1 font-bold text-[var(--diagram-brass)]">
              <Coins className="w-4 h-4 shrink-0" aria-hidden="true" />
              己方 {myGold} 金
            </span>
            <span className="font-bold text-[var(--diagram-accent)]">对手 {oppGold} 金</span>
            <span className="text-[var(--text-secondary)]">
              {finished ? '100 金结算完成' : `本轮底池 ${currentPot} 金`}
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重分 100 金
          </button>
        </div>

        {/* 5 轮金币权重刻度条 */}
        <div className="grid grid-cols-5 gap-1.5 text-center text-[11px]">
          {ROUND_POTS.map((pot, idx) => {
            const state = idx < round ? 'done' : idx === round ? 'now' : 'wait';
            return (
              <div
                key={idx}
                className={`rounded-lg border py-1.5 tabular-nums ${
                  state === 'now'
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)] font-bold'
                    : state === 'done'
                      ? 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-muted)] line-through'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                }`}
              >
                R{idx + 1} · {pot}金
              </div>
            );
          })}
        </div>

        {/* 棋子强弱环与出牌按钮 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[var(--text-secondary)]">
            <span>国王 &gt; 将军 &gt; 骑士 &gt; 兵卒 &gt; 平民（平民唯独反杀国王）</span>
            <span className="text-[var(--text-primary)] font-semibold">
              {finished ? `最终 ${myGold} : ${oppGold}` : `请选第 ${round + 1} 轮出战棋子`}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {CHESS_PIECES.map((p) => {
              const used = usedMine.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={finished || used}
                  onClick={() => handlePlay(p.id)}
                  className={`rounded-lg border py-2.5 px-1 text-center transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                    p.id === 'commoner'
                      ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-surface))]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] hover:border-[var(--diagram-brass)]'
                  }`}
                >
                  <div className="text-[12.5px] font-bold text-[var(--text-primary)] whitespace-nowrap">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 whitespace-nowrap">
                    {p.id === 'king' ? '最上位' : p.id === 'commoner' ? '反杀国王' : `战力 ${p.tier}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {finished
            ? `${myGold > oppGold ? '你赢得更多金币胜出' : myGold < oppGold ? '对手金币领先获胜' : '双方恰好 50 平分'}！高额底池轮必须牢记对手还捏着哪些未使用过的棋子。`
            : log}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        比单纯比大小多一层「金币配重」和「一次性消耗」：低分轮诱出对手大棋子，再留好底牌在最后高分轮一锤定音。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. 隐蔽看破 (acma-hide-and-see)                                            */
/* -------------------------------------------------------------------------- */
const TABLES = [
  { id: 1, x: 70, y: 38, label: '1号圆桌' },
  { id: 2, x: 200, y: 38, label: '2号窗桌' },
  { id: 3, x: 330, y: 38, label: '3号角桌' },
  { id: 4, x: 70, y: 102, label: '4号墙桌' },
  { id: 5, x: 200, y: 102, label: '5号中桌' },
  { id: 6, x: 330, y: 102, label: '6号门桌' },
];

type CoinSpot = 'table2' | 'table5' | 'wall-near-4';

function HideAndSeeDiagram() {
  const [coinSpot, setCoinSpot] = useState<CoinSpot>('wall-near-4');
  const [decoyTable, setDecoyTable] = useState<number>(2);
  const [pickedTable, setPickedTable] = useState<number | null>(null);

  const trueNearestTable = coinSpot === 'table2' ? 2 : coinSpot === 'table5' ? 5 : 4;
  const coinCoords =
    coinSpot === 'table2'
      ? { x: 200, y: 38 }
      : coinSpot === 'table5'
        ? { x: 200, y: 102 }
        : { x: 26, y: 106 };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">藏币点预设：</span>
            {(
              [
                ['wall-near-4', '墙角地板（非桌下）'],
                ['table2', '2号桌抽屉'],
                ['table5', '5号桌布下'],
              ] as Array<[CoinSpot, string]>
            ).map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setCoinSpot(k);
                  setPickedTable(null);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] border whitespace-nowrap shrink-0 cursor-pointer ${
                  coinSpot === k
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDecoyTable((t) => (t % 6) + 1)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--diagram-accent)]/50 bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))] text-[11px] font-semibold text-[var(--diagram-accent)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            假声闹钟干扰：{decoyTable}号桌
          </button>
        </div>

        {/* SVG 6桌室内俯视图 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3">
          <svg viewBox="0 0 400 140" className="w-full h-auto" role="img" aria-label="六张桌子与硬币位置平面图">
            <rect x="8" y="8" width="384" height="124" rx="10" fill="var(--bg-page)" stroke="var(--diagram-border)" />
            {/* 定时假声光环 */}
            {(() => {
              const dt = TABLES.find((t) => t.id === decoyTable)!;
              return (
                <circle
                  cx={dt.x}
                  cy={dt.y}
                  r="30"
                  fill="none"
                  stroke="var(--diagram-accent)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.7"
                />
              );
            })()}
            {/* 判定结果真实连线 */}
            {pickedTable !== null && (
              <>
                <circle cx={coinCoords.x} cy={coinCoords.y} r="6" fill="var(--diagram-brass)" />
                <text x={coinCoords.x} y={coinCoords.y - 10} textAnchor="middle" fill="var(--diagram-brass)" fontSize="9.5" fontWeight="700">
                  真硬币
                </text>
              </>
            )}
            {TABLES.map((t) => {
              const isPicked = pickedTable === t.id;
              const isTrue = pickedTable !== null && t.id === trueNearestTable;
              return (
                <g
                  key={t.id}
                  onClick={() => setPickedTable(t.id)}
                  className="cursor-pointer"
                >
                  <rect
                    x={t.x - 36}
                    y={t.y - 18}
                    width="72"
                    height="36"
                    rx="7"
                    fill={
                      isTrue
                        ? 'var(--diagram-brass)'
                        : isPicked
                          ? 'var(--diagram-accent)'
                          : 'var(--diagram-surface)'
                    }
                    fillOpacity={isTrue || isPicked ? 0.25 : 1}
                    stroke={
                      isTrue
                        ? 'var(--diagram-brass)'
                        : isPicked
                          ? 'var(--diagram-accent)'
                          : 'var(--diagram-border)'
                    }
                    strokeWidth={isTrue || isPicked ? '2' : '1.4'}
                  />
                  <text x={t.x} y={t.y + 4} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="600">
                    {t.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {pickedTable === null
            ? `点击上方任意一张桌子进行「最近桌位」指认（警惕：${decoyTable} 号桌响起的可疑金属音可能是「万物闹钟」预设假响！）。`
            : pickedTable === trueNearestTable
              ? `看破成功！硬币虽未必藏在桌子底下，但空间距离上确实离 ${trueNearestTable} 号桌最近。`
              : `失手中计！你被演戏与 ${decoyTable} 号桌定时声引偏，真正离硬币最近的其实是 ${trueNearestTable} 号桌。`}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        裁判算的是「哪张桌子离硬币最近」，因此硬币哪怕贴在墙角或身上，也能配合声响时机把找的人牵进思维盲区。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. 入水限度 (acma-pour-to-limit)                                           */
/* -------------------------------------------------------------------------- */
const CUPS = [
  { id: 'c1', ml: 180, label: '180ml' },
  { id: 'c2', ml: 240, label: '240ml' },
  { id: 'c3', ml: 150, label: '150ml' },
  { id: 'c4', ml: 310, label: '310ml' },
  { id: 'c5', ml: 120, label: '120ml' },
  { id: 'c6', ml: 95, label: '95ml' },
];

const BOTTLE_MAX = 1000;

function PourToLimitDiagram() {
  const [waterMl, setWaterMl] = useState<number>(640);
  const [usedCups, setUsedCups] = useState<string[]>([]);
  const [frozenTrap, setFrozenTrap] = useState<boolean>(false);
  const [stateMsg, setStateMsg] = useState<string>(
    '巨瓶总容积 1000ml，目前已有 640ml。挑一个水杯全部倒入（注：不得满溢，且单杯需倒净 ≥ 99%）。'
  );
  const [ended, setEnded] = useState<'overflow' | 'frozen' | 'safe' | null>(null);

  const pct = Math.min(100, Math.round((waterMl / BOTTLE_MAX) * 100));

  const pourCup = (cup: (typeof CUPS)[number]) => {
    if (ended || usedCups.includes(cup.id)) return;
    if (frozenTrap) {
      setEnded('frozen');
      setStateMsg(
        `容器「${cup.label}」受冷气结冰挂壁，实际倒出不足 99%（残留 ≥ 1%）——触发违规直接判负！`
      );
      return;
    }
    const next = waterMl + cup.ml;
    setUsedCups((p) => [...p, cup.id]);
    setWaterMl(next);
    if (next > BOTTLE_MAX) {
      setEnded('overflow');
      setStateMsg(`总水量升至 ${next}ml > 1000ml，巨瓶漫水溢出接水盘，倒水者直接落败！`);
    } else if (next >= 960) {
      setStateMsg(
        `已倒至 ${next}ml（仅剩 ${BOTTLE_MAX - next}ml 空间）！几乎所有大杯倒下去都会直接溢出，对手无路可退。`
      );
    } else {
      setStateMsg(`倒入 ${cup.label}，当前液位升至 ${next} / 1000ml（还差 ${BOTTLE_MAX - next}ml 满溢）。`);
    }
  };

  const reset = () => {
    setWaterMl(640);
    setUsedCups([]);
    setFrozenTrap(false);
    setEnded(null);
    setStateMsg('巨瓶总容积 1000ml，目前已有 640ml。挑一个水杯全部倒入（注：不得满溢，且单杯需倒净 ≥ 99%）。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-[var(--diagram-brass)] tabular-nums">
              <Droplets className="w-4 h-4 shrink-0" aria-hidden="true" />
              巨瓶液位：{waterMl} / 1000 ml ({pct}%)
            </span>
            <button
              type="button"
              onClick={() => setFrozenTrap((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border whitespace-nowrap shrink-0 cursor-pointer ${
                frozenTrap
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {frozenTrap ? '对手已偷冻下个水杯 (残留≥1%陷阱)' : '模拟：对手冷气冻住杯底'}
            </button>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重装水位
          </button>
        </div>

        {/* 巨瓶水位条 + 待选水杯 */}
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3.5 items-center">
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 flex flex-col items-center">
            <svg viewBox="0 0 120 116" className="w-28 h-auto" aria-hidden="true">
              {/* 接水盘 */}
              <path
                d="M14,104 L106,104 L98,112 L22,112 Z"
                fill={ended === 'overflow' ? 'var(--diagram-accent)' : 'var(--diagram-surface)'}
                fillOpacity={ended === 'overflow' ? 0.45 : 1}
                stroke={ended === 'overflow' ? 'var(--diagram-accent)' : 'var(--diagram-border)'}
                strokeWidth="1.5"
              />
              {/* 瓶身 */}
              <rect x="34" y="20" width="52" height="82" rx="6" fill="var(--bg-page)" stroke="var(--diagram-border)" strokeWidth="1.6" />
              <rect
                x="36"
                y={22 + Math.round((1 - Math.min(1, waterMl / BOTTLE_MAX)) * 78)}
                width="48"
                height={Math.round(Math.min(1, waterMl / BOTTLE_MAX) * 78)}
                rx="3"
                fill={ended === 'overflow' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
                fillOpacity="0.45"
              />
              <line x1="30" y1="22" x2="90" y2="22" stroke="var(--diagram-accent)" strokeWidth="1.2" strokeDasharray="3 2" />
              <text x="60" y="13" textAnchor="middle" fill="var(--diagram-accent)" fontSize="9.5" fontWeight="700">
                1000ml 满溢线
              </text>
            </svg>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11.5px] text-[var(--text-secondary)]">
              剩余空间仅 <span className="font-bold text-[var(--text-primary)] tabular-nums">{Math.max(0, BOTTLE_MAX - waterMl)} ml</span>，点击一只器皿倾倒：
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CUPS.map((c) => {
                const used = usedCups.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={used || !!ended}
                    onClick={() => pourCup(c)}
                    className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] py-2 px-2 text-center transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <div className="text-[12.5px] font-bold text-[var(--text-primary)] tabular-nums whitespace-nowrap">
                      {c.label}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] whitespace-nowrap">
                      {used ? '已倒空' : '倒入巨瓶'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {stateMsg}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        看似按容器体积倒水卡满溢，实则「不能留超过 1% 水渍」让结冰、吸附或任何阻滞流尽的手段一击致命。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. 善恶射击 (acma-judge-and-fire)                                          */
/* -------------------------------------------------------------------------- */
type RoleChoice = 'good' | 'evil';
type FireChoice = 'shoot' | 'hold';

function JudgeAndFireDiagram() {
  const [myRole, setMyRole] = useState<RoleChoice>('evil');
  const [myFire, setMyFire] = useState<FireChoice>('hold');
  const [oppRole, setOppRole] = useState<RoleChoice>('evil');
  const [oppFire, setOppFire] = useState<FireChoice>('shoot');
  const pot = 5000;

  let myDelta = 0;
  let oppDelta = 0;
  let outcomeText = '';

  if (myRole === 'good' && oppRole === 'good') {
    if (myFire === 'shoot') myDelta -= 3000;
    if (oppFire === 'shoot') oppDelta -= 3000;
    outcomeText =
      myFire === 'hold' && oppFire === 'hold'
        ? '双方都按「善」且收枪，谁也不抢金库也无人误伤（全盘平稳）。'
        : '竟把枪口瞄向选择「善」的平民！误射方倒扣 3,000G 罚金。';
  } else if (myRole === 'evil' && oppRole === 'evil') {
    if (myFire === 'hold' && oppFire === 'hold') {
      myDelta = pot / 2;
      oppDelta = pot / 2;
      outcomeText = '双「恶」保持默契未开枪：金库 5,000G 由两人和平平分！';
    } else if (myFire === 'shoot' && oppFire === 'hold') {
      myDelta = pot;
      outcomeText = '黑吃黑得手！你抢先射杀同谋的「恶」，独吞全部 5,000G。';
    } else if (myFire === 'hold' && oppFire === 'shoot') {
      oppDelta = pot;
      outcomeText = '失策！对手在你收枪信任的瞬间偷袭射杀同谋「恶」，独吞 5,000G。';
    } else {
      outcomeText = '双方互射两败俱伤，双双遭拦截清零，本轮 0 收益。';
    }
  } else if (myRole === 'evil' && oppRole === 'good') {
    if (oppFire === 'shoot') {
      outcomeText = '你的「恶」撞上「善」的拦截开枪！抢劫失败，本轮收益归 0。';
    } else if (myFire === 'shoot') {
      myDelta = -3000;
      outcomeText = '强盗误杀守门「善」！非但抢不到一分，还得倒扣 3,000G 巨额罚金。';
    } else {
      myDelta = pot;
      outcomeText = '漂亮看透对手走「善」且不开枪，你安然搬空 5,000G 金库！';
    }
  } else {
    if (myFire === 'shoot') {
      outcomeText = '你的「善」成功当场击毙入室行劫的「恶」，强行断掉对手财路！';
    } else if (oppFire === 'shoot') {
      oppDelta = -3000;
      outcomeText = '你安坐「善」位诱出强盗朝你开枪——对手误射善人遭重罚 -3,000G！';
    } else {
      oppDelta = pot;
      outcomeText = '对手选「恶」偷渡成功，在你选「善」没开枪之际顺手拿走 5,000G。';
    }
  }

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            金库金额：5,000 G · 双重暗选推演
          </span>
          <span className="text-[var(--diagram-brass)] font-semibold tabular-nums">
            本轮净结：己方 {myDelta >= 0 ? `+${myDelta}` : myDelta}G / 对手{' '}
            {oppDelta >= 0 ? `+${oppDelta}` : oppDelta}G
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 己方决定 */}
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
            <div className="text-[12px] font-bold text-[var(--diagram-brass)]">己方抉择</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMyRole('good')}
                className={`flex-1 py-1.5 rounded-lg border text-[12px] font-semibold whitespace-nowrap cursor-pointer ${
                  myRole === 'good'
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                按「善（市民）」
              </button>
              <button
                type="button"
                onClick={() => setMyRole('evil')}
                className={`flex-1 py-1.5 rounded-lg border text-[12px] font-semibold whitespace-nowrap cursor-pointer ${
                  myRole === 'evil'
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                按「恶（强盗）」
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMyFire('shoot')}
                className={`flex-1 py-1.5 rounded-lg border text-[12px] whitespace-nowrap cursor-pointer ${
                  myFire === 'shoot'
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-transparent font-bold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                开枪拦截
              </button>
              <button
                type="button"
                onClick={() => setMyFire('hold')}
                className={`flex-1 py-1.5 rounded-lg border text-[12px] whitespace-nowrap cursor-pointer ${
                  myFire === 'hold'
                    ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-transparent font-bold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                收枪不动
              </button>
            </div>
          </div>

          {/* 对手假设 */}
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
            <div className="text-[12px] font-bold text-[var(--diagram-accent)]">对手行动设定</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOppRole('good')}
                className={`flex-1 py-1.5 rounded-lg border text-[12px] font-semibold whitespace-nowrap cursor-pointer ${
                  oppRole === 'good'
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                对手选「善」
              </button>
              <button
                type="button"
                onClick={() => setOppRole('evil')}
                className={`flex-1 py-1.5 rounded-lg border text-[12px] font-semibold whitespace-nowrap cursor-pointer ${
                  oppRole === 'evil'
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                对手选「恶」
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOppFire('shoot')}
                className={`flex-1 py-1.5 rounded-lg border text-[12px] whitespace-nowrap cursor-pointer ${
                  oppFire === 'shoot'
                    ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)] border-transparent font-bold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                对手开枪
              </button>
              <button
                type="button"
                onClick={() => setOppFire('hold')}
                className={`flex-1 py-1.5 rounded-lg border text-[12px] whitespace-nowrap cursor-pointer ${
                  oppFire === 'hold'
                    ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)] border-transparent font-bold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                对手不开枪
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {outcomeText}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        双恶共抢虽能平分但总让人提防背后放冷枪，而「善」虽不产钱却能专杀乱开枪的贪心强盗。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 8. 笼球果实 (acma-basket-fruits)                                           */
/* -------------------------------------------------------------------------- */
type FruitId = 'fig' | 'zucchini' | 'mikan' | 'pear' | 'apple';

const FRUITS: Array<{ id: FruitId; name: string; basePts: number }> = [
  { id: 'fig', name: '无花果', basePts: 3 },
  { id: 'zucchini', name: '西葫芦', basePts: 2 },
  { id: 'mikan', name: '蜜柑', basePts: 2 },
  { id: 'pear', name: '雪梨', basePts: 1 },
  { id: 'apple', name: '苹果', basePts: 1 },
];

function BasketFruitsDiagram() {
  const [myPick, setMyPick] = useState<Record<FruitId, number>>({
    fig: 2,
    zucchini: 2,
    mikan: 1,
    pear: 0,
    apple: 0,
  });
  // 另外3人总投入15颗（可模拟真假分布）
  const [otherPick] = useState<Record<FruitId, number>>({
    fig: 3,
    zucchini: 3,
    mikan: 4,
    pear: 3,
    apple: 2,
  });
  const [callFruit, setCallFruit] = useState<FruitId>('fig');
  const [callCount, setCallCount] = useState<number>(6);
  const [scoreMe, setScoreMe] = useState<number>(4);
  const [scoreOpp, setScoreOpp] = useState<number>(6);
  const [opened, setOpened] = useState<string | null>(null);

  const totalSelected = Object.values(myPick).reduce((a, b) => a + b, 0);

  const adjustFruit = (id: FruitId, delta: number) => {
    setOpened(null);
    setMyPick((prev) => {
      const nextVal = prev[id] + delta;
      if (nextVal < 0 || nextVal > 3) return prev;
      const nextSum = totalSelected + delta;
      if (nextSum > 5) return prev;
      return { ...prev, [id]: nextVal };
    });
  };

  const handleDoubt = () => {
    if (totalSelected !== 5) {
      setOpened('请先凑齐己方恰好 5 颗投入大笼再开笼查验！');
      return;
    }
    const trueTotal = myPick[callFruit] + otherPick[callFruit];
    const fruitInfo = FRUITS.find((f) => f.id === callFruit)!;
    const isBluff = trueTotal < callCount;
    if (isBluff) {
      setScoreMe((s) => s + fruitInfo.basePts);
      setOpened(
        `抓谎成功！笼里实际仅有 ${trueTotal} 颗${fruitInfo.name}（低于报数 ${callCount} 颗），己方 +${fruitInfo.basePts} 分。`
      );
    } else {
      setScoreOpp((s) => s + fruitInfo.basePts);
      setOpened(
        `质疑失败！笼里实际共 ${trueTotal} 颗${fruitInfo.name}（≥ 报数 ${callCount} 颗），报数方稳收 +${fruitInfo.basePts} 分。`
      );
    }
  };

  const reset = () => {
    setMyPick({ fig: 2, zucchini: 2, mikan: 1, pear: 0, apple: 0 });
    setCallFruit('fig');
    setCallCount(6);
    setScoreMe(4);
    setScoreOpp(6);
    setOpened(null);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3 tabular-nums">
            <span className="font-bold text-[var(--diagram-brass)]">己方搭档 {scoreMe} / 10 分</span>
            <span className="font-bold text-[var(--diagram-accent)]">敌方搭档 {scoreOpp} / 10 分</span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重置 20 球笼
          </button>
        </div>

        {/* 己方秘选 5 颗（每种<=3） */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="font-semibold text-[var(--text-primary)]">
              步骤① 配置己方投入笼中的 5 颗球（同种限 ≤ 3 颗）
            </span>
            <span className="font-bold text-[var(--diagram-brass)] tabular-nums">
              已选 {totalSelected} / 5 颗
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {FRUITS.map((f) => (
              <div
                key={f.id}
                className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] p-2 flex flex-col items-center gap-1.5"
              >
                <div className="text-[12px] font-semibold text-[var(--text-primary)]">{f.name}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustFruit(f.id, -1)}
                    className="w-6 h-6 rounded border border-[var(--diagram-border)] text-[12px] font-bold text-[var(--text-primary)] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-[13px] font-bold text-[var(--diagram-brass)] tabular-nums">
                    {myPick[f.id]}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustFruit(f.id, 1)}
                    className="w-6 h-6 rounded border border-[var(--diagram-border)] text-[12px] font-bold text-[var(--text-primary)] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 报数与质疑开笼 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="text-[var(--text-secondary)]">
              步骤② 上家报号全场至少有：
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {FRUITS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setCallFruit(f.id);
                    setOpened(null);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[11px] border whitespace-nowrap cursor-pointer ${
                    callFruit === f.id
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))] text-[var(--diagram-brass)] font-semibold'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--text-secondary)]">宣言颗数 ≥</span>
              <button
                type="button"
                onClick={() => {
                  setCallCount((c) => Math.max(1, c - 1));
                  setOpened(null);
                }}
                className="w-7 h-7 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] font-bold cursor-pointer"
              >
                -
              </button>
              <span className="text-[16px] font-bold text-[var(--diagram-brass)] tabular-nums w-6 text-center">
                {callCount}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCallCount((c) => Math.min(12, c + 1));
                  setOpened(null);
                }}
                className="w-7 h-7 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] font-bold cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleDoubt}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--diagram-accent)] text-[var(--accent-fg)] px-3.5 py-1.5 text-[12px] font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Gavel className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              喊「质疑 (Doubt)」开笼清点
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {opened ??
            '20 颗球中若两队友提前互通手牌选球构成，己方开局便能稳握一半底数，让对手喊的假号无所遁形。'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        单看表面是盲球叫点，但 2 对 2 搭档能否真心配合互通己方那 10 颗球的信息，才是反抓对方虚报的根基。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 9. 粘土问答 (acma-clay-dialogue)                                           */
/* -------------------------------------------------------------------------- */
type SabotageMode = 'none' | 'flatten' | 'split';

function ClayDialogueDiagram() {
  const [sabotage, setSabotage] = useState<SabotageMode>('flatten');
  const [picked, setPicked] = useState<string | null>(null);

  const trueAnswer = '金字塔';
  const options = ['金字塔', '高脚杯', '三角饭团', '账篷灯塔'];

  const handleGuess = (opt: string) => {
    setPicked(opt);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            四步流程：出题 → 塑形 → 敌方破坏 → 残件推理
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['none', '原件对比'],
                ['flatten', '敌方压扁'],
                ['split', '敌方切半误导'],
              ] as Array<[SabotageMode, string]>
            ).map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setSabotage(k);
                  setPicked(null);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] border whitespace-nowrap cursor-pointer ${
                  sabotage === k
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* SVG 粘土形态演变 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3">
            <svg viewBox="0 0 280 118" className="w-full h-auto" aria-hidden="true">
              <rect x="6" y="6" width="268" height="106" rx="8" fill="var(--bg-page)" stroke="var(--diagram-border)" />
              {sabotage === 'none' && (
                <>
                  <polygon points="140,22 86,92 194,92" fill="var(--diagram-brass)" fillOpacity="0.35" stroke="var(--diagram-brass)" strokeWidth="2" />
                  <line x1="140" y1="22" x2="155" y2="92" stroke="var(--diagram-brass)" strokeWidth="1.2" />
                </>
              )}
              {sabotage === 'flatten' && (
                <>
                  <ellipse cx="140" cy="82" rx="68" ry="14" fill="var(--diagram-accent)" fillOpacity="0.28" stroke="var(--diagram-accent)" strokeWidth="1.8" />
                  <text x="140" y="54" textAnchor="middle" fill="var(--text-secondary)" fontSize="10.5">
                    表面被整个压成扁圆饼（底面体积仍在）
                  </text>
                </>
              )}
              {sabotage === 'split' && (
                <>
                  <polygon points="96,44 64,90 128,90" fill="var(--diagram-accent)" fillOpacity="0.25" stroke="var(--diagram-accent)" strokeWidth="1.6" />
                  <rect x="160" y="52" width="52" height="38" rx="4" fill="var(--diagram-accent)" fillOpacity="0.25" stroke="var(--diagram-accent)" strokeWidth="1.6" />
                  <text x="140" y="30" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">
                    被切开重塑成两块，但总粘土克重不变
                  </text>
                </>
              )}
            </svg>
          </div>

          <div className="space-y-2">
            <div className="text-[11.5px] text-[var(--text-secondary)]">
              {sabotage === 'none'
                ? '原件完整形态一目了然，但在实际对战前会先交由敌队进行「妨害改造」。'
                : '己方答题者在密室隔离后进屋：单看被毁坏的残件与总量猜原词：'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleGuess(opt)}
                  className={`rounded-lg border py-2 px-2.5 text-[12px] font-semibold whitespace-nowrap cursor-pointer ${
                    picked === opt
                      ? opt === trueAnswer
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                        : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
                  }`}
                >
                  猜：{opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {picked === null
            ? '切换上方的「敌方压扁 / 切半」查看干扰后果：塑形时必须靠残余份量比例或结构特征绕开外形破坏。'
            : picked === trueAnswer
              ? `推演命中「${trueAnswer}」！高手在捏泥之初就留好了哪怕捏碎也不改变的体积与核心棱线暗示。`
              : `遗憾误判！你顺着对手故意改出的假轮廓猜偏了，原题其实是「${trueAnswer}」。`}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        不能只追求雕得像真品——中间隔着敌队一轮「恶意破坏」，只有能看透彼此思路习惯的搭档才能把原题捞回来。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 10. 接龙绘画 (acma-shiritori-drawing)                                      */
/* -------------------------------------------------------------------------- */
function ShiritoriDrawingDiagram() {
  const [styleMode, setStyleMode] = useState<'precise' | 'abstract'>('abstract');
  const [myTime, setMyTime] = useState<number>(180);
  const [oppTime, setOppTime] = useState<number>(180);
  const [wordIdx, setWordIdx] = useState<number>(0);
  const [status, setStatus] = useState<string>(
    '对比「画得精致却耗时 / 抽象特征快认」，观察自己队伍与敌队的剩余计时差距。'
  );

  const chain = ['りんご (苹果)', 'ゴリラ (大猩猩)', 'ラッパ (喇叭)', 'パンダ (熊猫)'];

  const playTurn = (action: 'pass' | 'write-letter' | 'skip') => {
    if (myTime <= 0 || oppTime <= 0) return;
    if (action === 'pass') {
      const myCost = styleMode === 'precise' ? 18 : 11;
      const oppCost = styleMode === 'precise' ? 12 : 24;
      setMyTime((t) => Math.max(0, t - myCost));
      setOppTime((t) => Math.max(0, t - oppCost));
      setWordIdx((i) => (i + 1) % chain.length);
      setStatus(
        styleMode === 'abstract'
          ? `用「直觉特征简笔画」省下大量构图秒数（己方仅耗 ${myCost}s），反倒让迷信精致解谜的对手连连卡壳（耗 ${oppCost}s）！`
          : `耗费高精力描摹细节（己方耗时 ${myCost}s），若队友半天猜不出反而白白失血。`
      );
    } else if (action === 'write-letter') {
      setMyTime((t) => Math.max(0, t - 35));
      setStatus('画面夹带文字/数字触发违规罚时：直接扣除 35 秒！');
    } else {
      setMyTime((t) => Math.max(0, t - 25));
      setStatus('临阵请求更换接龙词题：按规则额外罚扣 25 秒！');
    }
  };

  const reset = () => {
    setMyTime(180);
    setOppTime(180);
    setWordIdx(0);
    setStatus('对比「画得精致却耗时 / 抽象特征快认」，观察自己队伍与敌队的剩余计时差距。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setStyleMode('abstract')}
              className={`px-2.5 py-1 rounded-full text-[11px] border whitespace-nowrap cursor-pointer ${
                styleMode === 'abstract'
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
              }`}
            >
              策略：特征抽象速画
            </button>
            <button
              type="button"
              onClick={() => setStyleMode('precise')}
              className={`px-2.5 py-1 rounded-full text-[11px] border whitespace-nowrap cursor-pointer ${
                styleMode === 'precise'
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
              }`}
            >
              策略：精雕细琢画风
            </button>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重置 180 秒
          </button>
        </div>

        {/* 双队剩余时间条 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--diagram-brass)]">己方剩余总时间</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{myTime} 秒</span>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                className="h-full bg-[var(--diagram-brass)] transition-all"
                style={{ width: `${(myTime / 180) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--diagram-accent)]">敌队剩余总时间</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{oppTime} 秒</span>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                className="h-full bg-[var(--diagram-accent)] transition-all"
                style={{ width: `${(oppTime / 180) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 画板模拟与动作 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[11px] text-[var(--text-secondary)]">当前词链轮次</div>
            <div className="text-[13.5px] font-bold text-[var(--text-primary)]">
              题目：{chain[wordIdx]}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={myTime <= 0 || oppTime <= 0}
              onClick={() => playTurn('pass')}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--text-primary)] text-[var(--bg-page)] px-3 py-1.5 text-[12px] font-bold whitespace-nowrap cursor-pointer disabled:opacity-40"
            >
              <Timer className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              画完并让队友猜中
            </button>
            <button
              type="button"
              disabled={myTime <= 0 || oppTime <= 0}
              onClick={() => playTurn('write-letter')}
              className="rounded-lg border border-[var(--diagram-accent)]/60 px-2.5 py-1.5 text-[11.5px] text-[var(--diagram-accent)] whitespace-nowrap cursor-pointer disabled:opacity-40"
            >
              偷写文字 (-35s)
            </button>
            <button
              type="button"
              disabled={myTime <= 0 || oppTime <= 0}
              onClick={() => playTurn('skip')}
              className="rounded-lg border border-[var(--diagram-border)] px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] whitespace-nowrap cursor-pointer disabled:opacity-40"
            >
              强制换题 (-25s)
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {oppTime <= 0
            ? '敌队倒计时率先耗尽归零，己方大获全胜！'
            : myTime <= 0
              ? '己方剩余秒数耗尽，本局判负！'
              : status}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        比拼的不是谁像科班画家，而是谁选的词能让己方队友秒懂并接上词尾；把精力花错地方反而先熬干己方倒计时。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 11. 玩偶捉迷藏 (acma-mascot-hide-seek)                                     */
/* -------------------------------------------------------------------------- */
interface MascotSlot {
  id: string;
  costume: string;
  clue: string;
  realIdentity: string;
  candidates: string[];
}

const MASCOT_SLOTS: MascotSlot[] = [
  {
    id: 'm1',
    costume: '企鹅皮套',
    clue: '被叫名字时故意装作左右慢晃，却保持单脚重心微翘的习惯。',
    realIdentity: '潜夜（主将）',
    candidates: ['潜夜（主将）', '悠季', '岛津'],
  },
  {
    id: 'm2',
    costume: '大熊皮套',
    clue: '厚重手套下转弯幅度极大，跃过走廊台阶却落地悄无声息。',
    realIdentity: '岛津凉',
    candidates: ['岛津凉', '毛利明', '潜夜（主将）'],
  },
  {
    id: 'm3',
    costume: '灰兔皮套',
    clue: '总顺着墙边直线走位并停在岔路计算秒数，对他人假动作毫无反应。',
    realIdentity: '毛利明',
    candidates: ['毛利明', '齐藤初', '式部紫'],
  },
  {
    id: 'm4',
    costume: '小猪皮套',
    clue: '每逢对视便轻轻仰高下巴站直，明显在刻意掩饰身形矮小。',
    realIdentity: '式部紫',
    candidates: ['式部紫', '悠季', '伊达（主将）'],
  },
];

function MascotHideSeekDiagram() {
  const [scanned, setScanned] = useState<string[]>(['m1']);
  const [guesses, setGuesses] = useState<Record<string, string>>({});

  const correctCount = MASCOT_SLOTS.filter((s) => guesses[s.id] === s.realIdentity).length;
  const completed = correctCount >= 4;

  const inspect = (id: string) => {
    setScanned((p) => (p.includes(id) ? p : [...p, id]));
  };

  const pickIdentity = (slotId: string, name: string) => {
    setGuesses((prev) => ({ ...prev, [slotId]: name }));
  };

  const reset = () => {
    setScanned(['m1']);
    setGuesses({});
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-[var(--diagram-brass)] tabular-nums">
              <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
              正确拆穿：{correctCount} / 4 人即可获胜
            </span>
            <span className="text-[var(--text-secondary)]">（助攻全程禁声 · 主将变声）</span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重置指认
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MASCOT_SLOTS.map((slot) => {
            const isSeen = scanned.includes(slot.id);
            const picked = guesses[slot.id];
            const isCorrect = picked === slot.realIdentity;
            return (
              <div
                key={slot.id}
                className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[12.5px] text-[var(--text-primary)]">
                    {slot.costume}
                  </span>
                  <button
                    type="button"
                    onClick={() => inspect(slot.id)}
                    className="px-2 py-0.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[10.5px] text-[var(--diagram-brass)] whitespace-nowrap cursor-pointer"
                  >
                    {isSeen ? '已取证动作线索' : '观察步态线索'}
                  </button>
                </div>

                <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed min-h-[34px]">
                  {isSeen ? slot.clue : '点击「观察步态线索」捕捉皮套底下的细微身体习惯。'}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {slot.candidates.map((c) => {
                    const active = picked === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => pickIdentity(slot.id, c)}
                        className={`px-2 py-1 rounded-md border text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                          active
                            ? isCorrect
                              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                              : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                            : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {completed
            ? '准确识破全部 4 只布偶皮套背后的真实选手，抢先达标拿下本局！'
            : '注意：声纹与外表皆已被掩盖，甚至有时全队还会故意交换步态习惯来诱使对手一次猜错。'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        长相与嗓音全部抹消后，人只能靠惯性动作认人；可一旦对手反过来联手「演同一种习惯」，观察家反而会被精准反杀。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 12. 无声瞪眼 (acma-silent-staring)                                         */
/* -------------------------------------------------------------------------- */
function SilentStaringDiagram() {
  const [myDb, setMyDb] = useState<number>(12);
  const [oppDb, setOppDb] = useState<number>(14);
  const [note, setNote] = useState<string>(
    '主将发出达到 30 分贝的声音立即判负；点击下方策略观察场边助阵声响与对视心理攻防。'
  );

  const loser = myDb >= 30 ? 'me' : oppDb >= 30 ? 'opp' : null;

  const triggerTactic = (kind: 'shout' | 'pain-bluff' | 'silly-face') => {
    if (loser) return;
    if (kind === 'shout') {
      // 助攻贴耳狂喊（副将不限分贝，主要冲击双方定力）
      setMyDb((v) => Math.min(29, v + 7));
      setOppDb((v) => Math.min(29, v + 4));
      setNote('助攻队员零距离狂喊造势（助攻不受 30dB 限制！），但定力稳健的主将依然紧闭双唇死守警戒线。');
    } else if (kind === 'pain-bluff') {
      setMyDb((v) => Math.min(29, v + 9));
      setNote('敌方甚至祭出自残苦肉戏码施压，试图诱骗你开口喊停——切忌心慌出声！');
    } else {
      setOppDb(33);
      setNote('防不胜防的纯正搞怪颜艺！向来面无表情的强敌没忍住轻笑出声（33 dB ≥ 30 dB 线），直接落败！');
    }
  };

  const reset = () => {
    setMyDb(12);
    setOppDb(14);
    setNote('主将发出达到 30 分贝的声音立即判负；点击下方策略观察场边助阵声响与对视心理攻防。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--diagram-accent)]">
            淘汰红线：主将声压 ≥ 30 dB（极轻耳语水平）
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重新对视
          </button>
        </div>

        {/* 双人分贝计 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-[var(--diagram-brass)]">己方主将 · 声压计</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{myDb} / 30 dB</span>
            </div>
            <div className="relative h-3 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                className={`h-full transition-all ${
                  myDb >= 30 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                }`}
                style={{ width: `${Math.min(100, (myDb / 40) * 100)}%` }}
              />
              <div className="absolute top-0 bottom-0 w-0.5 bg-[var(--diagram-accent)]" style={{ left: '75%' }} />
            </div>
          </div>

          <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-[var(--diagram-accent)]">敌方主将 · 声压计</span>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">{oppDb} / 30 dB</span>
            </div>
            <div className="relative h-3 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                className={`h-full transition-all ${
                  oppDb >= 30 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                }`}
                style={{ width: `${Math.min(100, (oppDb / 40) * 100)}%` }}
              />
              <div className="absolute top-0 bottom-0 w-0.5 bg-[var(--diagram-accent)]" style={{ left: '75%' }} />
            </div>
          </div>
        </div>

        {/* 施压策略按钮 */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!!loser}
            onClick={() => triggerTactic('shout')}
            className="flex-1 min-w-[125px] rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] px-3 py-2 text-[12px] font-semibold text-[var(--text-primary)] whitespace-nowrap cursor-pointer disabled:opacity-45"
          >
            助攻贴耳喧哗干扰
          </button>
          <button
            type="button"
            disabled={!!loser}
            onClick={() => triggerTactic('pain-bluff')}
            className="flex-1 min-w-[125px] rounded-lg border border-[var(--diagram-accent)]/60 bg-[var(--diagram-panel)] px-3 py-2 text-[12px] font-semibold text-[var(--diagram-accent)] whitespace-nowrap cursor-pointer disabled:opacity-45"
          >
            模拟自残苦肉施压
          </button>
          <button
            type="button"
            disabled={!!loser}
            onClick={() => triggerTactic('silly-face')}
            className="flex-1 min-w-[125px] rounded-lg bg-[var(--text-primary)] text-[var(--bg-page)] px-3 py-2 text-[12px] font-bold whitespace-nowrap cursor-pointer disabled:opacity-45"
          >
            直球王道颜艺破防
          </button>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {note}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        双方主将死扛恐怖压迫、神经紧绷到极点之时，反倒是回归本源的一记反差逗笑最能令人失声出局。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 13. 五字咒语生存战 (acma-five-spell-survival)                              */
/* -------------------------------------------------------------------------- */
interface SpellPreset {
  text: string;
  meaning: string;
}

const MY_SPELL_OPTIONS: SpellPreset[] = [
  { text: '五文字可視', meaning: '令敌方设定的五字咒语在视野中显形' },
  { text: '照朝の大技', meaning: '常用汉字较多，极易与对手设词撞字！' },
  { text: 'どこでも扉', meaning: '生成穿梭两点之间的空间门' },
  { text: '絶対無敵強', meaning: '内心愈发确信无敌，体能愈发暴涨' },
];

const ENEMY_SPELLS = [
  { owner: '敌人 A（主将）', text: '狙われない', meaning: '自动闪避所有带有瞄准敌意的攻击' },
  { owner: '敌人 B', text: '大将身代り', meaning: '大将遇险时自动上前替死退场' },
  { owner: '敌人 C', text: '涼増殖隷属', meaning: '复制出多名强力体能分身助战' },
];

function FiveSpellSurvivalDiagram() {
  const [spellIdx, setSpellIdx] = useState<number>(0);
  const [sealedEnemies, setSealedEnemies] = useState<string[]>([]);
  const [status, setStatus] = useState<string>(
    '切换己方「五字咒语」观察是否与敌队任意一字撞车失效，并可尝试直接喊出敌方咒语原文将其硬直并永久封印。'
  );

  const curSpell = MY_SPELL_OPTIONS[spellIdx];
  const enemyAllChars = new Set(ENEMY_SPELLS.flatMap((e) => [...e.text]));
  const myChars = [...curSpell.text];
  const collidedChars = myChars.filter((ch) => enemyAllChars.has(ch));
  const isInvalid = collidedChars.length > 0;

  const handleSeal = (owner: string, text: string) => {
    if (sealedEnemies.includes(owner)) return;
    setSealedEnemies((p) => [...p, owner]);
    setStatus(`成功大声喊出「${text}」原文！${owner} 原地全身硬直 10 秒，且该技能本局永久封印！`);
  };

  const reset = () => {
    setSpellIdx(0);
    setSealedEnemies([]);
    setStatus(
      '切换己方「五字咒语」观察是否与敌队任意一字撞车失效，并可尝试直接喊出敌方咒语原文将其硬直并永久封印。'
    );
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            自创 5 字咒语 · 撞字校验与原文封印
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重置战场
          </button>
        </div>

        {/* 选择己方 5 Spell */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {MY_SPELL_OPTIONS.map((sp, i) => (
              <button
                key={sp.text}
                type="button"
                onClick={() => setSpellIdx(i)}
                className={`px-2.5 py-1 rounded-full text-[11.5px] border whitespace-nowrap cursor-pointer ${
                  spellIdx === i
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))] text-[var(--diagram-brass)] font-bold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                {sp.text}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {myChars.map((ch, idx) => {
                const hit = enemyAllChars.has(ch);
                return (
                  <span
                    key={idx}
                    className={`w-9 h-10 rounded-lg border flex items-center justify-center text-[15px] font-bold ${
                      hit
                        ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_22%,var(--diagram-surface))] text-[var(--diagram-accent)] line-through'
                        : 'border-[var(--diagram-brass)] bg-[var(--diagram-surface)] text-[var(--text-primary)]'
                    }`}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
            <div className="text-[11.5px]">
              {isInvalid ? (
                <span className="font-bold text-[var(--diagram-accent)]">
                  与敌方重叠字符「{collidedChars.join('、')}」——咒语直接失效！
                </span>
              ) : (
                <span className="font-bold text-[var(--diagram-brass)]">
                  五字全无撞字！效果：{curSpell.meaning}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 敌队 5 Spell 揭穿封印区 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ENEMY_SPELLS.map((e) => {
            const sealed = sealedEnemies.includes(e.owner);
            return (
              <div
                key={e.owner}
                className={`rounded-xl border p-3 space-y-2 ${
                  sealed
                    ? 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] opacity-55'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-[var(--diagram-accent)]">{e.owner}</span>
                  <span className="font-bold text-[var(--text-primary)]">{e.text}</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{e.meaning}</p>
                <button
                  type="button"
                  disabled={sealed}
                  onClick={() => handleSeal(e.owner, e.text)}
                  className="w-full rounded-md bg-[var(--text-primary)] text-[var(--bg-page)] py-1 text-[11px] font-bold whitespace-nowrap cursor-pointer disabled:opacity-45"
                >
                  {sealed ? '已触发 10s 硬直并永久封印' : `喊破「${e.text}」封印`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {status}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        挑常用字容易和敌方撞字直接报废，设词还得时刻捂严实；甚至像「不被瞄准」这般棘手的护身技也能从规则字义里找盲区。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 14. 三单究明 (acma-word-investigation)                                     */
/* -------------------------------------------------------------------------- */
interface QuestionStep {
  id: string;
  q: string;
  verdict: '○ 是' | '× 否' | '△ 难言';
  note: string;
}

const WI_QUESTIONS: QuestionStep[] = [
  {
    id: 'q1',
    q: '那三块石板上的词里有具体的人名吗？',
    verdict: '○ 是',
    note: '加多判「○ 是」，说明石板内容涵盖特定人物名称（至少 1 块以上是人名）。',
  },
  {
    id: 'q2',
    q: '石板上的三个词全都是现实中彼此不相干的独立物体吗？',
    verdict: '× 否',
    note: '加多判「× 否」，暗指词汇之间存在紧密关联甚至同指一物。',
  },
  {
    id: 'q3',
    q: '如果把某种物体的日常别名或一个人「过去用过的旧姓」说出来算正答吗？',
    verdict: '○ 是',
    note: '裁判确认核心死角：「同义词 / 指向同一对象即使称呼读音不同」同样算拆毁石板！',
  },
  {
    id: 'q4',
    q: '对于毫无感情记忆波动的「全知」来说，能仅靠客观档案直接锁定这个人的两个名字吗？',
    verdict: '△ 难言',
    note: '加多竖起「△ 难言」——事实在档案上存在，可对方此刻脑子里的关联逻辑能否对得上却很难说！',
  },
];

function WordInvestigationDiagram() {
  const [asked, setAsked] = useState<string[]>(['q1']);
  const [brokenSlates, setBrokenSlates] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string>(
    '点击向恶魔加多提「是/否/难言」问题缩小石板词汇范围，再尝试点击上方石板猜词验证「同义判对」规则。'
  );

  const slates = [
    { id: 1, label: '赤石板 · 词 1', reveal: '织田丽华（婚后随夫姓）', guessLabel: '试答：妈妈现用姓名' },
    { id: 2, label: '青石板 · 词 2', reveal: '山本丽华（婚前旧姓 — 同人不同名）', guessLabel: '试答：同义旧姓陷阱' },
    { id: 3, label: '白石板 · 词 3', reveal: 'Mogu 巧克力（童年约定物件）', guessLabel: '试答：日常约定零食' },
  ];

  const handleAsk = (step: QuestionStep) => {
    setAsked((p) => (p.includes(step.id) ? p : [...p, step.id]));
    setFeedback(`${step.verdict} — ${step.note}`);
  };

  const breakSlate = (s: (typeof slates)[number]) => {
    if (brokenSlates.includes(s.id)) return;
    const next = [...brokenSlates, s.id];
    setBrokenSlates(next);
    setFeedback(
      next.length >= 3
        ? `全部三块石板粉碎！核心胜负手在于利用规则允许「不同称呼但指向同一存在」制造全知推理盲区。`
        : `击碎「${s.label}」→ 原词揭晓：${s.reveal}（已碎 ${next.length} / 3 块）。`
    );
  };

  const reset = () => {
    setAsked(['q1']);
    setBrokenSlates([]);
    setFeedback('点击向恶魔加多提「是/否/难言」问题缩小石板词汇范围，再尝试点击上方石板猜词验证「同义判对」规则。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-brass)] tabular-nums">
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
            已击碎石板：{brokenSlates.length} / 3 块
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            重立三石板
          </button>
        </div>

        {/* 背后三块彩色石板 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {slates.map((s) => {
            const broken = brokenSlates.includes(s.id);
            return (
              <div
                key={s.id}
                className={`rounded-xl border p-3 space-y-2 text-center transition-colors ${
                  broken
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                }`}
              >
                <div className="text-[11px] font-semibold text-[var(--text-secondary)]">{s.label}</div>
                <div className="text-[13px] font-bold text-[var(--text-primary)] min-h-[36px] flex items-center justify-center">
                  {broken ? s.reveal : '？ 未知具体名词 ？'}
                </div>
                <button
                  type="button"
                  disabled={broken}
                  onClick={() => breakSlate(s)}
                  className="w-full rounded-md bg-[var(--text-primary)] text-[var(--bg-page)] py-1 text-[11px] font-bold whitespace-nowrap cursor-pointer disabled:opacity-45"
                >
                  {broken ? '已答中碎裂' : s.guessLabel}
                </button>
              </div>
            );
          })}
        </div>

        {/* 提问与恶魔加多 ○/×/△ 裁定 */}
        <div className="space-y-2">
          <div className="text-[11.5px] font-semibold text-[var(--text-secondary)]">
            向恶魔加多提问（只做「是 ○ / 否 × / 难言 △」三档裁决）：
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WI_QUESTIONS.map((q) => {
              const seen = asked.includes(q.id);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleAsk(q)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                    seen
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11.5px] font-semibold text-[var(--text-primary)]">
                      {q.q}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[var(--diagram-surface)] text-[10.5px] font-bold text-[var(--diagram-brass)] whitespace-nowrap shrink-0">
                      {seen ? q.verdict : '发问'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
          {feedback}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        面对几乎算尽所有客观履历的对手，最极简的三词问答反而能把「同义称呼与遗忘的人心记忆」化作反败为胜的利刃。
      </p>
    </div>
  );
}

export const ACMA_GAME_DIAGRAMS: Record<string, ComponentType> = {
  'acma-true-or-false': TrueOrFalseDiagram,
  'acma-shadow-step': ShadowStepDiagram,
  'acma-five-one': FiveOneDiagram,
  'acma-hundred-contest': HundredContestDiagram,
  'acma-hide-and-see': HideAndSeeDiagram,
  'acma-pour-to-limit': PourToLimitDiagram,
  'acma-judge-and-fire': JudgeAndFireDiagram,
  'acma-basket-fruits': BasketFruitsDiagram,
  'acma-clay-dialogue': ClayDialogueDiagram,
  'acma-shiritori-drawing': ShiritoriDrawingDiagram,
  'acma-mascot-hide-seek': MascotHideSeekDiagram,
  'acma-silent-staring': SilentStaringDiagram,
  'acma-five-spell-survival': FiveSpellSurvivalDiagram,
  'acma-word-investigation': WordInvestigationDiagram,
};
