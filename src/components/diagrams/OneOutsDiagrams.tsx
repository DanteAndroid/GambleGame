import { useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CloudRain,
  Coins,
  Droplets,
  Drum,
  Eye,
  EyeOff,
  Footprints,
  Gavel,
  Radio,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Target,
  Trophy,
  Tv,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 1. 冲绳街头 ONE OUTS：单打席好坏球计数器与攻心投球模拟                       */
/* -------------------------------------------------------------------------- */
type StreetPitchType = 'slow-bait' | 'inside-chase' | 'fast-middle';

function StreetGameDiagram() {
  const [strikes, setStrikes] = useState<number>(0);
  const [balls, setBalls] = useState<number>(0);
  const [pitchCount, setPitchCount] = useState<number>(0);
  const [lastPitch, setLastPitch] = useState<StreetPitchType | null>(null);
  const [outcome, setOutcome] = useState<'pitcher' | 'batter' | null>(null);
  const [log, setLog] = useState<string>('选择球路向打者投球，体验「1 个出局数 vs 1 支安打/保送」的街头单挑。');

  const handlePitch = (type: StreetPitchType) => {
    if (outcome) return;
    setLastPitch(type);
    setPitchCount((n) => n + 1);

    if (type === 'fast-middle') {
      setOutcome('batter');
      setLog('常规直球进红中！打者精准咬中球心轰出安打，打者胜并赢走全部赌金。');
      return;
    }

    if (type === 'slow-bait') {
      if (balls >= 3 && strikes < 2) {
        setOutcome('batter');
        setLog('坏球数落后（3 坏球），打者稳守好球带看穿慢球节奏敲出安打，打者胜！');
        return;
      }
      const nextStrikes = strikes + 1;
      setStrikes(nextStrikes);
      if (nextStrikes >= 3) {
        setOutcome('pitcher');
        setLog('慢速直球骗出提前挥棒，累计 3 好球三振出局！投手取得出局数获胜。');
      } else {
        setLog(`慢速直球打乱挥棒节奏，打者挥空记 1 好球（当前 ${nextStrikes} 好 ${balls} 坏）。`);
      }
      return;
    }

    // inside-chase：内角吊球
    if (strikes >= 2) {
      setOutcome('pitcher');
      setLog('两好球后打者被迫扩大挥棒范围，追打内角吊球敲出软弱界内滚地球出局！投手胜。');
      return;
    }

    const nextBalls = balls + 1;
    setBalls(nextBalls);
    if (nextBalls >= 4) {
      setOutcome('batter');
      setLog('打者忍住未追打内角坏球，累计 4 坏球获保送！规则判打者胜。');
    } else {
      setLog(`内角吊球偏出好球带，打者选掉记 1 坏球（当前 ${strikes} 好 ${nextBalls} 坏）。`);
    }
  };

  const reset = () => {
    setStrikes(0);
    setBalls(0);
    setPitchCount(0);
    setLastPitch(null);
    setOutcome(null);
    setLog('选择球路向打者投球，体验「1 个出局数 vs 1 支安打/保送」的街头单挑。');
  };

  const trajectoryPath =
    lastPitch === 'inside-chase'
      ? 'M 92 60 Q 210 24 324 38'
      : lastPitch === 'fast-middle'
        ? 'M 92 60 L 324 62'
        : 'M 92 60 Q 210 48 324 66';

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：BSO 好坏球计数器 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5">
              <span className="font-bold text-[var(--diagram-brass)]">S 好球</span>
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`w-3 h-3 rounded-full border transition-colors ${
                    idx < strikes
                      ? 'bg-[var(--diagram-brass)] border-[var(--diagram-brass)]'
                      : 'bg-[var(--diagram-panel)] border-[var(--diagram-border)]'
                  }`}
                />
              ))}
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="font-bold text-[var(--diagram-accent)]">B 坏球</span>
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className={`w-3 h-3 rounded-full border transition-colors ${
                    idx < balls
                      ? 'bg-[var(--diagram-accent)] border-[var(--diagram-accent)]'
                      : 'bg-[var(--diagram-panel)] border-[var(--diagram-border)]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] tabular-nums text-[var(--text-muted)]">第 {pitchCount} 球</span>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重开打席
          </button>
        </div>

        {/* 冲绳街头投手丘至本垒侧视图 SVG */}
        <svg
          viewBox="0 0 420 116"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="冲绳街头投手与打者一对一球路轨迹示意图"
        >
          <line x1="20" y1="96" x2="400" y2="96" stroke="var(--diagram-border)" strokeWidth="1.5" />
          {/* 投手丘 */}
          <path
            d="M 38 96 Q 72 82 106 96 Z"
            fill="color-mix(in srgb, var(--diagram-brass) 18%, var(--diagram-panel))"
            stroke="var(--diagram-border)"
            strokeWidth="1.2"
          />
          <circle cx="72" cy="40" r="8" fill="none" stroke="var(--diagram-brass)" strokeWidth="2" />
          <path
            d="M 64 52 L 80 52 L 84 86 L 60 86 Z"
            fill="color-mix(in srgb, var(--diagram-brass) 20%, var(--diagram-panel))"
            stroke="var(--diagram-brass)"
            strokeWidth="1.5"
          />
          <text x="72" y="110" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--diagram-brass)">
            投手
          </text>

          {/* 球路轨迹 */}
          {lastPitch && (
            <>
              <path
                d={trajectoryPath}
                fill="none"
                stroke={outcome === 'batter' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
                strokeWidth="2"
                strokeDasharray={lastPitch === 'slow-bait' ? '5 4' : lastPitch === 'inside-chase' ? '3 3' : 'none'}
              />
              <circle
                cx={324}
                cy={lastPitch === 'inside-chase' ? 38 : lastPitch === 'fast-middle' ? 62 : 66}
                r="5"
                fill={outcome === 'batter' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
              />
            </>
          )}

          {/* 好球带方框 */}
          <rect
            x="312"
            y="46"
            width="24"
            height="36"
            rx="3"
            fill="color-mix(in srgb, var(--diagram-panel) 80%, transparent)"
            stroke="var(--diagram-border)"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <text x="324" y="40" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">
            好球带
          </text>

          {/* 打者 */}
          <circle cx="364" cy="40" r="8" fill="none" stroke="var(--text-primary)" strokeWidth="2" />
          <path
            d="M 356 52 L 372 52 L 374 92 L 354 92 Z"
            fill="var(--diagram-panel)"
            stroke="var(--text-secondary)"
            strokeWidth="1.5"
          />
          <line x1="354" y1="58" x2="338" y2="34" stroke="var(--text-primary)" strokeWidth="2.4" strokeLinecap="round" />
          <text x="364" y="110" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-primary)">
            打者
          </text>

          {/* 结果徽章 */}
          {outcome && (
            <g transform="translate(210, 20)">
              <rect
                x="-68"
                y="-12"
                width="136"
                height="24"
                rx="12"
                fill={
                  outcome === 'pitcher'
                    ? 'color-mix(in srgb, var(--diagram-brass) 22%, var(--diagram-panel))'
                    : 'color-mix(in srgb, var(--diagram-accent) 22%, var(--diagram-panel))'
                }
                stroke={outcome === 'pitcher' ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
                strokeWidth="1.4"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="700"
                fill={outcome === 'pitcher' ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
              >
                {outcome === 'pitcher' ? '投手胜 · 抓下出局数' : '打者胜 · 安打/保送'}
              </text>
            </g>
          )}
        </svg>

        {/* 投球策略按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={Boolean(outcome)}
            onClick={() => handlePitch('slow-bait')}
            className="rounded-lg px-3 py-2.5 text-left border border-[var(--diagram-brass)]/70 bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))] hover:bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] disabled:opacity-45 transition-colors cursor-pointer"
          >
            <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">慢速直球诱挥</div>
            <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">靠节奏落差骗挥空拿好球</div>
          </button>

          <button
            type="button"
            disabled={Boolean(outcome)}
            onClick={() => handlePitch('inside-chase')}
            className="rounded-lg px-3 py-2.5 text-left border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] disabled:opacity-45 transition-colors cursor-pointer"
          >
            <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">内角高吊球</div>
            <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">两好球后诱挥成界内出局，早投易坏球</div>
          </button>

          <button
            type="button"
            disabled={Boolean(outcome)}
            onClick={() => handlePitch('fast-middle')}
            className="rounded-lg px-3 py-2.5 text-left border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-accent)] disabled:opacity-45 transition-colors cursor-pointer"
          >
            <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">常规红中直球</div>
            <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">硬拼球速进甜点，极易遭安打反杀</div>
          </button>
        </div>

        <p
          className={`text-[12px] text-center font-medium ${
            outcome === 'batter'
              ? 'text-[var(--diagram-accent)]'
              : outcome === 'pitcher'
                ? 'text-[var(--diagram-brass)]'
                : 'text-[var(--text-secondary)]'
          }`}
        >
          {log}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        一打席定生死的单挑里，投手必须靠好坏球计数和挥棒心理拿满 3 好球或诱出界内出局，任何安打或四坏保送都会立刻输掉赌金。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. 一局胜负亿元契约：+500万 vs -5000万 实时盈亏账本                         */
/* -------------------------------------------------------------------------- */
function ContractDiagram() {
  const [outs, setOuts] = useState<number>(3);
  const [runsAllowed, setRunsAllowed] = useState<number>(0);
  const [bossTrap, setBossTrap] = useState<boolean>(false);

  const income = outs * 500;
  const penalty = runsAllowed * 5000;
  const net = income - penalty;
  const outsNeededToRecover = net < 0 ? Math.ceil(Math.abs(net) / 500) : 0;

  // 展示最新 1 分失分需要 10 个出局数填平的可视化格
  const recoveredInBlock = runsAllowed > 0 ? Math.min(10, outs % 10 === 0 && net >= 0 ? 10 : Math.max(0, outs - (runsAllowed - 1) * 10)) : 0;

  const reset = () => {
    setOuts(3);
    setRunsAllowed(0);
    setBossTrap(false);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：总计与重置 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Coins className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
            <span>ONE OUTS 实时账本 · 零底薪纯绩效</span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            清空账本
          </button>
        </div>

        {/* 净盈亏大数字面板 */}
        <div
          className={`rounded-xl px-4 py-3.5 border text-center transition-colors ${
            net < 0
              ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
              : 'border-[var(--diagram-brass)]/70 bg-[color-mix(in_srgb,var(--diagram-brass)_10%,var(--diagram-panel))]'
          }`}
        >
          <div className="text-[11.5px] text-[var(--text-secondary)]">当前净结算余额（日元）</div>
          <div
            className={`mt-1 text-[24px] sm:text-[28px] font-bold tabular-nums leading-tight ${
              net < 0 ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
            }`}
          >
            {net >= 0 ? `+${net.toLocaleString()}` : net.toLocaleString()} 万
          </div>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11.5px] tabular-nums text-[var(--text-secondary)]">
            <span>出局收益：{outs} 次 × 500 万 = +{income.toLocaleString()} 万</span>
            <span>失分罚金：{runsAllowed} 分 × 5000 万 = -{penalty.toLocaleString()} 万</span>
          </div>
        </div>

        {/* 核心双按钮：1:10 赔率悬殊亲手体验 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setOuts((v) => v + 1)}
            className="rounded-lg px-3.5 py-3 border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_15%,var(--diagram-panel))] hover:bg-[color-mix(in_srgb,var(--diagram-brass)_24%,var(--diagram-panel))] text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">抓 1 个出局数</span>
              <span className="text-[13px] font-bold tabular-nums text-[var(--diagram-brass)]">+500 万</span>
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-secondary)]">稳健收割，每局最多抓 3 个（+1500 万）</div>
          </button>

          <button
            type="button"
            onClick={() => setRunsAllowed((v) => v + 1)}
            className="rounded-lg px-3.5 py-3 border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] hover:bg-[color-mix(in_srgb,var(--diagram-accent)_22%,var(--diagram-panel))] text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">被对手得 1 分</span>
              <span className="text-[13px] font-bold tabular-nums text-[var(--diagram-accent)]">-5000 万</span>
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-secondary)]">相当于立刻赔掉整整 10 个出局数（3 局以上心血）</div>
          </button>
        </div>

        {/* 1:10 填坑进度可视化 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="font-semibold text-[var(--text-primary)]">1:10 赔率悬殊刻度（失 1 分需 10 出局填平）</span>
            <span
              className={`font-semibold tabular-nums ${
                net < 0 ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
              }`}
            >
              {net < 0 ? `还欠 ${Math.abs(net).toLocaleString()} 万 · 需连抓 ${outsNeededToRecover} 出局` : '目前处于正收益区间'}
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }).map((_, idx) => {
              const filled = runsAllowed === 0 ? idx < Math.min(10, outs) : idx < Math.min(10, recoveredInBlock);
              return (
                <div
                  key={idx}
                  className={`h-3.5 rounded-sm border transition-colors ${
                    filled
                      ? 'bg-[var(--diagram-brass)] border-[var(--diagram-brass)]'
                      : runsAllowed > 0
                        ? 'bg-[color-mix(in_srgb,var(--diagram-accent)_24%,var(--diagram-surface))] border-[var(--diagram-accent)]/60'
                        : 'bg-[var(--diagram-surface)] border-[var(--diagram-border)]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* 老板暗中挖坑权限提示开关 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2 text-[11.5px]">
            <AlertTriangle className="w-4 h-4 text-[var(--diagram-accent)] shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-[var(--text-secondary)] leading-relaxed">
              {bossTrap
                ? '老板已动用人事权：授意教练换下主力野手、强令死守或保留疲惫投打线，在不违规前提下刻意放任对手得分以榨取 5000 万罚金。'
                : '老板掌握球队人事与战术调度权：就算投手本人零失误，也可能遭自家阵营暗算丢分。'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBossTrap((v) => !v)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 cursor-pointer border transition-colors ${
              bossTrap
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {bossTrap ? '收起暗算预警' : '模拟老板暗中挖坑'}
          </button>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        一分倒扣五千万、一出局仅进五百万，极其不对等的赔率逼迫投手必须维持近乎零失分，还要提防自家老板借换人制造失分陷阱。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. 高见树动态视力对决：视力追踪剖面 vs 转速盲点误判                         */
/* -------------------------------------------------------------------------- */
type TakamiStrategy = 'speed-gap' | 'curve-drop' | 'spin-illusion';

const TAKAMI_STRATEGIES: Record<
  TakamiStrategy,
  {
    label: string;
    shortDesc: string;
    speedText: string;
    spinText: string;
    visionRead: string;
    realPath: string;
    predictedPath: string;
    realEndY: number;
    predictedEndY: number;
    success: boolean;
    verdict: string;
    detail: string;
  }
> = {
  'speed-gap': {
    label: '常规球速差直球',
    shortDesc: '快慢交替，试图骗挥棒时机',
    speedText: '132 km/h（常规变速）',
    spinText: '转速与球速正常匹配',
    visionRead: '出手后 0.1 秒即看清球速衰减',
    realPath: 'M 72 68 Q 205 64 334 74',
    predictedPath: 'M 72 68 Q 205 64 334 74',
    realEndY: 74,
    predictedEndY: 74,
    success: false,
    verdict: '动态视力完全看穿 · 轰出长打',
    detail: '高见树不靠提前猜球，而是靠肉眼直接追踪来球速度，常规变速反而成为最好打的红中球。',
  },
  'curve-drop': {
    label: '常规变化球下坠',
    shortDesc: '用大弧度变化球压低进垒点',
    speedText: '118 km/h（曲球/滑球）',
    spinText: '缝线旋转方向清晰暴露',
    visionRead: '从缝线转轴瞬间锁定下坠轨迹',
    realPath: 'M 72 68 Q 215 44 334 94',
    predictedPath: 'M 72 68 Q 215 44 334 94',
    realEndY: 94,
    predictedEndY: 94,
    success: false,
    verdict: '缝线轨迹被锁定 · 精准拉打安打',
    detail: '出手刹那的缝线旋转暴露了变化球种类，超人动态视力顺着弧线等球到位再挥棒，毫无盲区。',
  },
  'spin-illusion': {
    label: '转速与出手视觉盲点',
    shortDesc: '打破「转速 = 球速」的视觉先验',
    speedText: '124 km/h（出手姿势完全一致）',
    spinText: '异常高转 / 无旋错觉制造浮沉差',
    visionRead: '肉眼误按常态经验推演落点，出现致命偏移',
    realPath: 'M 72 68 Q 210 56 334 54',
    predictedPath: 'M 72 68 Q 210 70 334 86',
    realEndY: 54,
    predictedEndY: 86,
    success: true,
    verdict: '视觉信任反成陷阱 · 挥空三振',
    detail: '越是依赖动态视力根据旋转推演落点，就越会落入「反常态转速」的认知盲区，棒头从球下方挥空。',
  },
};

function TakamiDuelDiagram() {
  const [strategy, setStrategy] = useState<TakamiStrategy>('speed-gap');
  const current = TAKAMI_STRATEGIES[strategy];

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 策略切换 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(Object.keys(TAKAMI_STRATEGIES) as TakamiStrategy[]).map((key) => {
            const item = TAKAMI_STRATEGIES[key];
            const active = strategy === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setStrategy(key)}
                className={`rounded-lg px-3 py-2 text-left border transition-colors cursor-pointer ${
                  active
                    ? item.success
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                      : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--text-secondary)]'
                }`}
              >
                <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">{item.label}</div>
                <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{item.shortDesc}</div>
              </button>
            );
          })}
        </div>

        {/* 动态视力追踪剖面 SVG */}
        <svg
          viewBox="0 0 420 138"
          className="w-full max-w-[450px] mx-auto h-auto block select-none"
          role="img"
          aria-label="打者动态视力追踪来球真实轨迹与预判落点的剖面对比"
        >
          {/* 打者动态视力扫描锥区 */}
          <path
            d="M 378 52 L 135 22 L 135 112 Z"
            fill="color-mix(in srgb, var(--diagram-brass) 9%, transparent)"
            stroke="var(--diagram-border)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text x="196" y="22" textAnchor="middle" fontSize="10" fill="var(--text-muted)">
            动态视力实时追踪视野
          </text>

          {/* 投手出手点 */}
          <circle cx="72" cy="68" r="10" fill="var(--diagram-panel)" stroke="var(--diagram-brass)" strokeWidth="1.8" />
          <text x="72" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--diagram-brass)">
            投
          </text>
          <text x="72" y="95" textAnchor="middle" fontSize="10.5" fill="var(--text-secondary)">
            出手点
          </text>

          {/* 打者预判轨迹（虚线） */}
          <path
            d={current.predictedPath}
            fill="none"
            stroke="var(--diagram-accent)"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          {/* 实际球路轨迹（实线） */}
          <path
            d={current.realPath}
            fill="none"
            stroke="var(--diagram-brass)"
            strokeWidth="2.4"
          />

          {/* 本垒板切面线 */}
          <line x1="334" y1="30" x2="334" y2="112" stroke="var(--diagram-border)" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="334" y="126" textAnchor="middle" fontSize="10" fill="var(--text-muted)">
            本垒击球面
          </text>

          {/* 落点标记 */}
          <circle cx="334" cy={current.predictedEndY} r="6.5" fill="none" stroke="var(--diagram-accent)" strokeWidth="2" />
          <circle cx="334" cy={current.realEndY} r="4.5" fill="var(--diagram-brass)" />

          {/* 落点差标注 */}
          {current.success ? (
            <>
              <line x1="348" y1={current.realEndY} x2="348" y2={current.predictedEndY} stroke="var(--diagram-brass)" strokeWidth="1.8" />
              <text x="355" y="74" fontSize="10.5" fontWeight="700" fill="var(--diagram-brass)">
                错位!
              </text>
            </>
          ) : (
            <text x="346" y={current.realEndY + 4} fontSize="10.5" fontWeight="700" fill="var(--diagram-accent)">
              重合
            </text>
          )}

          {/* 打者眼睛 */}
          <circle cx="384" cy="52" r="10" fill="var(--diagram-panel)" stroke="var(--text-primary)" strokeWidth="1.6" />
          <circle cx="381" cy="52" r="3" fill="var(--diagram-accent)" />
          <text x="384" y="76" textAnchor="middle" fontSize="10.5" fill="var(--text-primary)">
            高见树
          </text>

          {/* 图例 */}
          <g transform="translate(22, 122)">
            <line x1="0" y1="0" x2="18" y2="0" stroke="var(--diagram-brass)" strokeWidth="2.4" />
            <text x="24" y="3.5" fontSize="10" fill="var(--text-secondary)">
              真实球路
            </text>
            <line x1="86" y1="0" x2="104" y2="0" stroke="var(--diagram-accent)" strokeWidth="2" strokeDasharray="4 3" />
            <text x="110" y="3.5" fontSize="10" fill="var(--text-secondary)">
              动态视力预判轨迹
            </text>
          </g>
        </svg>

        {/* 数据对照与结果 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12px]">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Eye className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              <span>球路与转速特征</span>
            </div>
            <div className="text-[11.5px] text-[var(--text-secondary)]">球速：{current.speedText}</div>
            <div className="text-[11.5px] text-[var(--text-secondary)]">旋转：{current.spinText}</div>
            <div className="text-[11.5px] text-[var(--text-secondary)]">视力读数：{current.visionRead}</div>
          </div>

          <div
            className={`rounded-lg px-3 py-2.5 border space-y-1 ${
              current.success
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))]'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 font-semibold ${
                current.success ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
              }`}
            >
              {current.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{current.verdict}</span>
            </div>
            <div className="text-[11.5px] text-[var(--text-secondary)]">{current.detail}</div>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        面对不吃情绪套路、只信双眼的天才打者，常规球速差毫无意义；唯有针对视觉经验的底层假设制造转速盲点，才能让他自己判断失误。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. 雨天控局心理战：9 局记分板 + 暴雨积水进度条与满 5 局裁定模拟             */
/* -------------------------------------------------------------------------- */
function RainDelayDiagram() {
  const [inning, setInning] = useState<3 | 4 | 5 | 6>(5);
  const [ourRuns, setOurRuns] = useState<number>(3);
  const [oppRuns, setOppRuns] = useState<number>(2);
  const [waterLevel, setWaterLevel] = useState<number>(85);

  const isHalted = waterLevel >= 80;
  const isOfficialGame = inning >= 5;

  const getRuling = () => {
    if (!isHalted) {
      return {
        tone: 'neutral' as const,
        title: `积水 ${waterLevel}% · 暴雨中继续比赛`,
        desc: isOfficialGame
          ? '已跨过第 5 局有效线！领先方正设法拖慢节奏等雨叫停，落后方则急于反超。'
          : '尚未满 5 局！落后方巴不得立刻下大雨作废重赛，领先方必须咬牙抢进度撑进第 5 局。',
      };
    }
    if (!isOfficialGame) {
      return {
        tone: 'danger' as const,
        title: `第 ${inning} 局暴雨中断 · 未满 5 局，比分作废重赛！`,
        desc: `当前 ${ourRuns}:${oppRuns} 的比分全部清零无效，两队择日从第 1 局 0:0 重新开打。`,
      };
    }
    if (ourRuns > oppRuns) {
      return {
        tone: 'win' as const,
        title: `第 ${inning} 局暴雨中断 · 已满 5 局，正式裁定我方 ${ourRuns}:${oppRuns} 获胜！`,
        desc: '比赛立刻结束且成绩正式有效，无需再打剩余局数，领先优势直接锁定胜局。',
      };
    }
    if (ourRuns < oppRuns) {
      return {
        tone: 'danger' as const,
        title: `第 ${inning} 局暴雨中断 · 已满 5 局，正式裁定对手 ${oppRuns}:${ourRuns} 获胜！`,
        desc: '满 5 局后在落后状态被暴雨叫停，连后半段反攻机会都会瞬间丧失。',
      };
    }
    return {
      tone: 'neutral' as const,
      title: `第 ${inning} 局暴雨中断 · 已满 5 局平手（${ourRuns}:${oppRuns}）`,
      desc: '比分持平无法直接带走胜利，需按联盟雨天和局或补赛规章处理。',
    };
  };

  const ruling = getRuling();

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 9 局记分板 */}
        <div className="overflow-x-auto">
          <div className="min-w-[340px] rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-2.5 space-y-1.5 text-[11.5px] tabular-nums">
            <div className="grid grid-cols-11 gap-1 text-center text-[var(--text-muted)] font-semibold">
              <div className="text-left pl-1">局数</div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div
                  key={i}
                  className={`py-0.5 rounded ${
                    i === inning
                      ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : i === 5
                        ? 'text-[var(--diagram-brass)] border border-dashed border-[var(--diagram-brass)]/70'
                        : ''
                  }`}
                >
                  {i}
                </div>
              ))}
              <div className="text-[var(--text-primary)]">总分</div>
            </div>

            <div className="grid grid-cols-11 gap-1 text-center items-center">
              <div className="text-left pl-1 font-semibold text-[var(--text-primary)]">我方</div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div
                  key={i}
                  className={`py-1 rounded border ${
                    i <= inning
                      ? 'bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-surface))] border-[var(--diagram-border)] text-[var(--text-primary)]'
                      : 'bg-[var(--diagram-surface)]/50 border-transparent text-[var(--text-muted)]'
                  }`}
                >
                  {i <= inning ? (i === inning ? ourRuns : '·') : '-'}
                </div>
              ))}
              <div className="font-bold text-[13px] text-[var(--diagram-brass)]">{ourRuns}</div>
            </div>

            <div className="grid grid-cols-11 gap-1 text-center items-center">
              <div className="text-left pl-1 font-semibold text-[var(--text-secondary)]">敌方</div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div
                  key={i}
                  className={`py-1 rounded border ${
                    i <= inning
                      ? 'bg-[var(--diagram-surface)] border-[var(--diagram-border)] text-[var(--text-secondary)]'
                      : 'bg-[var(--diagram-surface)]/50 border-transparent text-[var(--text-muted)]'
                  }`}
                >
                  {i <= inning ? (i === inning ? oppRuns : '·') : '-'}
                </div>
              ))}
              <div className="font-bold text-[13px] text-[var(--text-primary)]">{oppRuns}</div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10.5px] text-[var(--text-muted)]">
              <span>1–4 局中断 = 比赛作废重赛</span>
              <span className="text-[var(--diagram-brass)] font-medium">虚线框：第 5 局正式裁定门槛</span>
            </div>
          </div>
        </div>

        {/* 局数与比分控制 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <div className="font-semibold text-[var(--text-primary)]">切换当前进行局数</div>
            <div className="grid grid-cols-4 gap-1.5">
              {([3, 4, 5, 6] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={inning === n}
                  onClick={() => setInning(n)}
                  className={`py-1.5 rounded-md font-semibold tabular-nums border cursor-pointer transition-colors ${
                    inning === n
                      ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  第 {n} 局
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <div className="font-semibold text-[var(--text-primary)]">调节主客队比分</div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--diagram-brass)] font-semibold">我方</span>
                <button
                  type="button"
                  onClick={() => setOurRuns((r) => Math.max(0, r - 1))}
                  className="w-6 h-6 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold tabular-nums text-[var(--text-primary)]">{ourRuns}</span>
                <button
                  type="button"
                  onClick={() => setOurRuns((r) => Math.min(9, r + 1))}
                  className="w-6 h-6 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] cursor-pointer"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-secondary)] font-semibold">敌方</span>
                <button
                  type="button"
                  onClick={() => setOppRuns((r) => Math.max(0, r - 1))}
                  className="w-6 h-6 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold tabular-nums text-[var(--text-primary)]">{oppRuns}</span>
                <button
                  type="button"
                  onClick={() => setOppRuns((r) => Math.min(9, r + 1))}
                  className="w-6 h-6 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 暴雨积水进度条 */}
        <label className="block rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5 space-y-2 text-[12px]">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <CloudRain className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
              球场暴雨积水进度（≥ 80% 主审强制叫停）
            </span>
            <span
              className={`font-bold tabular-nums ${
                isHalted ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
              }`}
            >
              {waterLevel}% {isHalted ? '· 已叫停' : '· 可续战'}
            </span>
          </div>
          <div className="relative h-2.5 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
            <div
              style={{ width: `${waterLevel}%` }}
              className={`h-full transition-all ${
                isHalted ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
              }`}
            />
            <div style={{ left: '80%' }} className="absolute inset-y-0 w-0.5 bg-[var(--text-primary)]" />
          </div>
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={waterLevel}
            onChange={(e) => setWaterLevel(Number(e.target.value))}
            className="w-full accent-[var(--diagram-brass)] cursor-pointer"
          />
        </label>

        {/* 裁定结果卡 */}
        <div
          className={`rounded-lg px-3.5 py-3 border text-[12px] space-y-1 ${
            ruling.tone === 'win'
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))]'
              : ruling.tone === 'danger'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
          }`}
        >
          <div
            className={`font-semibold ${
              ruling.tone === 'win'
                ? 'text-[var(--diagram-brass)]'
                : ruling.tone === 'danger'
                  ? 'text-[var(--diagram-accent)]'
                  : 'text-[var(--text-primary)]'
            }`}
          >
            {ruling.title}
          </div>
          <div className="text-[var(--text-secondary)]">{ruling.desc}</div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        暴雨来袭时，胜负不只看比分，更看谁能借合法节奏控制把比赛精确停在「满 5 局成立」或「未满 5 局作废」的临界点上。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. 替补陷阱·二军反击战：首发阵容板与「硬守漏洞 vs 弱点当诱饵」             */
/* -------------------------------------------------------------------------- */
type SubTactic = 'force-defend' | 'bait-shift';
type FieldZone = 'infield' | 'outfield' | 'battery';

const ZONE_INFO: Record<
  FieldZone,
  {
    name: string;
    rookieFlaw: string;
    forceResult: string;
    baitResult: string;
  }
> = {
  infield: {
    name: '内野二游防线（二军菜鸟）',
    rookieFlaw: '横向扑救范围极窄，急传一垒容易暴传',
    forceResult: '强求扩大守备范围，结果频频漏接穿越安打并伴随传球失误丢分。',
    baitResult: '干脆故意收缩站位露出边线诱饵，诱导对手打向指定方向，让菜鸟只接正对胸口的软弱滚地球。',
  },
  outfield: {
    name: '外野三席（板凳替补）',
    rookieFlaw: '判断高飞球落点迟钝、回传臂力不足',
    forceResult: '强敌专打外野空档，一记深远安打就能让垒上跑者连冲本垒得分。',
    baitResult: '用外野站位视觉假象诱使敌方改打拉打高飞球，球落点反而直奔提前埋伏好的轻松接杀区。',
  },
  battery: {
    name: '本垒捕手与投手节奏',
    rookieFlaw: '菜鸟被老板当弃子，士气崩盘极度紧张',
    forceResult: '队友越怕失误手脚越僵，一旦漏接丢 1 分照样算在投手头上倒扣 5000 万。',
    baitResult: '明确告诉替补只需完成唯一简单动作，把压力全部转嫁给急于痛打弱旅的敌方打者。',
  },
};

function SubstituteTrapDiagram() {
  const [tactic, setTactic] = useState<SubTactic>('force-defend');
  const [zone, setZone] = useState<FieldZone>('infield');

  const isBait = tactic === 'bait-shift';
  const activeZone = ZONE_INFO[zone];

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏警告 + 策略切换 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-accent)]">
            <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
            老板雪藏主力 · 首发 8 名野手全为二军替补（队友漏接照扣投手 5000 万/分）
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            aria-pressed={!isBait}
            onClick={() => setTactic('force-defend')}
            className={`rounded-lg px-3 py-2.5 text-left border cursor-pointer transition-colors ${
              !isBait
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_15%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">强求二军硬守常规阵型</div>
            <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">试图掩盖短板，漏洞百出遭狂轰</div>
          </button>

          <button
            type="button"
            aria-pressed={isBait}
            onClick={() => setTactic('bait-shift')}
            className={`rounded-lg px-3 py-2.5 text-left border cursor-pointer transition-colors ${
              isBait
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_15%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">把弱点当诱饵诱导打错位</div>
            <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">故意亮出破绽引敌入瓮，零失分反杀</div>
          </button>
        </div>

        {/* 棒球守备阵位 SVG */}
        <svg
          viewBox="0 0 420 168"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="二军替补守备阵位与诱饵陷阱示意图"
        >
          {/* 扇形球场轮廓 */}
          <path
            d="M 210 152 L 56 54 A 185 185 0 0 1 364 54 Z"
            fill="color-mix(in srgb, var(--diagram-panel) 80%, transparent)"
            stroke="var(--diagram-border)"
            strokeWidth="1.5"
          />
          {/* 内野菱形 */}
          <polygon
            points="210,148 268,108 210,68 152,108"
            fill="color-mix(in srgb, var(--diagram-brass) 9%, var(--diagram-surface))"
            stroke="var(--diagram-border)"
            strokeWidth="1.3"
          />

          {/* 击球落点区：硬守模式显示多个红色破洞，诱饵模式显示诱导虚线与正面抓捕圈 */}
          {!isBait ? (
            <>
              <ellipse
                cx="126"
                cy="74"
                rx="26"
                ry="14"
                fill="color-mix(in srgb, var(--diagram-accent) 24%, transparent)"
                stroke="var(--diagram-accent)"
                strokeWidth="1.4"
                strokeDasharray="3 2"
              />
              <ellipse
                cx="294"
                cy="74"
                rx="26"
                ry="14"
                fill="color-mix(in srgb, var(--diagram-accent) 24%, transparent)"
                stroke="var(--diagram-accent)"
                strokeWidth="1.4"
                strokeDasharray="3 2"
              />
              <text x="126" y="77" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--diagram-accent)">
                漏接空档
              </text>
              <text x="294" y="77" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--diagram-accent)">
                漏接空档
              </text>
            </>
          ) : (
            <>
              {/* 故意露出的视觉诱饵区 */}
              <ellipse
                cx="298"
                cy="70"
                rx="24"
                ry="13"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1.4"
                strokeDasharray="4 3"
              />
              <text x="298" y="73" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">
                故意露空诱饵
              </text>
              {/* 诱导敌方击球到布防陷阱 */}
              <path
                d="M 210 144 Q 180 105 164 82"
                fill="none"
                stroke="var(--diagram-brass)"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <circle
                cx="164"
                cy="82"
                r="18"
                fill="color-mix(in srgb, var(--diagram-brass) 22%, transparent)"
                stroke="var(--diagram-brass)"
                strokeWidth="1.6"
              />
              <text x="164" y="59" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--diagram-brass)">
                轻松接杀陷阱
              </text>
            </>
          )}

          {/* 外野 3 替补 */}
          {[
            { x: isBait ? 148 : 112, y: 42, label: '左外·替' },
            { x: 210, y: 30, label: '中外·替' },
            { x: isBait ? 258 : 308, y: 42, label: '右外·替' },
          ].map((p) => (
            <g key={p.label} transform={`translate(${p.x}, ${p.y})`}>
              <circle
                r="8"
                fill="var(--diagram-panel)"
                stroke={isBait ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
                strokeWidth="1.6"
              />
              <text y="19" textAnchor="middle" fontSize="9.5" fill="var(--text-secondary)">
                {p.label}
              </text>
            </g>
          ))}

          {/* 内野 4 替补 */}
          {[
            { x: 152, y: 108, label: '三垒·替' },
            { x: isBait ? 166 : 182, y: 80, label: '游击·替' },
            { x: isBait ? 228 : 238, y: 80, label: '二垒·替' },
            { x: 268, y: 108, label: '一垒·替' },
          ].map((p) => (
            <g key={p.label} transform={`translate(${p.x}, ${p.y})`}>
              <circle
                r="7.5"
                fill="var(--diagram-panel)"
                stroke={isBait ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
                strokeWidth="1.5"
              />
              <text y="17" textAnchor="middle" fontSize="9" fill="var(--text-secondary)">
                {p.label}
              </text>
            </g>
          ))}

          {/* 投手 */}
          <circle cx="210" cy="110" r="9" fill="var(--diagram-brass)" />
          <text x="210" y="113.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--btn-primary-fg)">
            投
          </text>
        </svg>

        {/* 分区查看二军改造细节 */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(ZONE_INFO) as FieldZone[]).map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZone(z)}
                className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium border cursor-pointer transition-colors ${
                  zone === z
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--text-primary)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                }`}
              >
                {ZONE_INFO[z].name}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5 text-[12px] space-y-1">
            <div className="text-[var(--text-muted)] text-[11px]">菜鸟短板：{activeZone.rookieFlaw}</div>
            <div className={isBait ? 'text-[var(--diagram-brass)] font-medium' : 'text-[var(--diagram-accent)] font-medium'}>
              {isBait ? activeZone.baitResult : activeZone.forceResult}
            </div>
          </div>
        </div>

        {/* 契约账面预计结果 */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2 text-[12px]">
          <span className="text-[var(--text-secondary)]">本场契约走势预估：</span>
          <span className={`font-bold tabular-nums ${isBait ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'}`}>
            {isBait ? '零失分封锁（0 罚金 · 老板挖坑反亏）' : '守备连环失误丢 3 分（投手倒扣 -1.5 亿）'}
          </span>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        既然无法在一夜之间把二军菜鸟变成全明星，不如直接把他们的守备弱点摆上台面当诱饵，反过来操纵强敌的击球选择。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. 暗号窃听反制战：捕手暗号 → 外野暗哨 → 打者提前 1 秒预判链路图            */
/* -------------------------------------------------------------------------- */
type SignResponse = 'normal' | 'protest' | 'reverse-bait';
type FakeSignType = 'outside-slow' | 'high-fast';

function SignStealingDiagram() {
  const [mode, setMode] = useState<SignResponse>('normal');
  const [fakeSign, setFakeSign] = useState<FakeSignType>('outside-slow');

  const signLabel = fakeSign === 'outside-slow' ? '外角慢球' : '内角高球';
  const actualPitchLabel = fakeSign === 'outside-slow' ? '内角紧逼直球' : '外角低位诱球';

  const chainMeta = {
    normal: {
      badge: '窃听链路畅通 · 遭提前 1 秒预判狂轰',
      tone: 'danger' as const,
      catcherText: `真暗号：${signLabel}`,
      scoutText: '外野暗哨清晰拍下',
      batterText: `提前 1 秒锁定「${signLabel}」轰出安打`,
      summary: '打者比球出手早 1 秒就知道落点，普通配球完全暴露，投什么打什么。',
    },
    protest: {
      badge: '抗议无铁证 · 暗哨瞬时隐匿后卷土重来',
      tone: 'neutral' as const,
      catcherText: '暂停向裁判举报',
      scoutText: '外野暗哨立刻收设备装观众',
      batterText: '查无实据驳回，换套手势继续偷窥',
      summary: '外野看台鱼龙混杂，正面抗议拿不到确凿证据，反而会打草惊蛇让对方更换隐藏方式。',
    },
    'reverse-bait': {
      badge: '不拆穿暗哨 · 反向喂假暗号惨遭三振',
      tone: 'win' as const,
      catcherText: `假暗号：${signLabel}`,
      scoutText: '暗哨信以为真秒传场内',
      batterText: `死等「${signLabel}」，实来「${actualPitchLabel}」挥空三振`,
      summary: '保留对方偷窥渠道并故意喂出相反暗号，利用打者提前 1 秒的绝对信任，让其主动挥向完全相反的区域。',
    },
  }[mode];

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 策略切换 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(
            [
              { id: 'normal', title: '照常配球', sub: '未察觉窃听，惨遭狂轰' },
              { id: 'protest', title: '直接抗议', sub: '暗哨隐蔽，拿不到铁证' },
              { id: 'reverse-bait', title: '反向喂假暗号', sub: '顺着窃听链路喂毒反杀' },
            ] as const
          ).map((item) => {
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setMode(item.id)}
                className={`rounded-lg px-3 py-2 text-left border cursor-pointer transition-colors ${
                  active
                    ? item.id === 'reverse-bait'
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                      : item.id === 'normal'
                        ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
                        : 'border-[var(--text-secondary)] bg-[var(--diagram-panel)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--text-secondary)]'
                }`}
              >
                <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">{item.title}</div>
                <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{item.sub}</div>
              </button>
            );
          })}
        </div>

        {/* 反向喂假暗号时的球种选择 */}
        {mode === 'reverse-bait' && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 text-[11.5px]">
            <span className="text-[var(--text-secondary)]">选择喂给暗哨的假暗号：</span>
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'outside-slow', label: '喂「外角慢球」→ 实投内角直球' },
                  { id: 'high-fast', label: '喂「内角高球」→ 实投外角低球' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFakeSign(opt.id)}
                  className={`px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                    fakeSign === opt.id
                      ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] font-semibold'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 三段窃听链路可视化卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-stretch">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--diagram-brass)]">
              <span>① 捕手双腿间手势</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:block text-[var(--text-muted)]" aria-hidden="true" />
            </div>
            <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">{chainMeta.catcherText}</div>
            <div className="text-[11px] text-[var(--text-muted)]">决定下一球球种与内外角</div>
          </div>

          <div
            className={`rounded-lg p-3 border flex flex-col justify-between gap-1.5 ${
              mode === 'protest'
                ? 'border-dashed border-[var(--diagram-border)] bg-[var(--diagram-surface)]'
                : 'border-[var(--diagram-accent)]/65 bg-[color-mix(in_srgb,var(--diagram-accent)_9%,var(--diagram-panel))]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--diagram-accent)]">
              <span className="inline-flex items-center gap-1">
                {mode === 'protest' ? (
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Radio className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                ② 外野暗哨窃听
              </span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:block text-[var(--text-muted)]" aria-hidden="true" />
            </div>
            <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">{chainMeta.scoutText}</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              {mode === 'protest' ? '瞬间藏匿，无法取证' : '实时传讯，延迟不足 0.3 秒'}
            </div>
          </div>

          <div
            className={`rounded-lg p-3 border flex flex-col justify-between gap-1.5 ${
              mode === 'reverse-bait'
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_13%,var(--diagram-panel))]'
                : mode === 'normal'
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_13%,var(--diagram-panel))]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="text-[11px] font-semibold text-[var(--text-secondary)]">③ 打者提前 1 秒预判</div>
            <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">{chainMeta.batterText}</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              {mode === 'reverse-bait' ? '越信任暗哨，挥棒错位越彻底' : '掌握先机占据绝对主动'}
            </div>
          </div>
        </div>

        {/* 状态总结 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] space-y-1 ${
            chainMeta.tone === 'win'
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
              : chainMeta.tone === 'danger'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
          }`}
        >
          <div
            className={`font-semibold ${
              chainMeta.tone === 'win'
                ? 'text-[var(--diagram-brass)]'
                : chainMeta.tone === 'danger'
                  ? 'text-[var(--diagram-accent)]'
                  : 'text-[var(--text-primary)]'
            }`}
          >
            {chainMeta.badge}
          </div>
          <div className="text-[var(--text-secondary)]">{chainMeta.summary}</div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        当对手高度依赖偷来的暗号提前挥棒，拆穿它只能止损，把假暗号顺着原链路喂进去才能彻底击溃对方的打击节奏。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. 盗垒王封杀战：一垒至二垒垒道图 · 离垒距离 vs 牵制出局 vs Balk 犯规       */
/* -------------------------------------------------------------------------- */
type PickoffAction = 'normal-pitch' | 'pickoff' | 'balk';

function JohnsonStealDiagram() {
  const [leadMeters, setLeadMeters] = useState<number>(3.6);
  const [action, setAction] = useState<PickoffAction>('pickoff');

  // 垒道总长约 27.4m；跑者短跑极速，常规投球只要离垒 >= 2.2m 几乎必盗上二垒
  // 突然转身牵制时，离垒 >= 3.2m 来不及扑回一垒会被直接触杀出局
  const pickoffCaught = leadMeters >= 3.2;
  const stealTimeSec = (3.45 - leadMeters * 0.16).toFixed(2);
  const runnerX = 64 + ((leadMeters - 1.5) / 3.0) * 115;

  const result =
    action === 'balk'
      ? {
          tone: 'danger' as const,
          title: '动作露馅触发投手犯规（Balk）· 白送二垒！',
          desc: '投手轴心脚未合法退板或做出欺骗停顿，主审直接判犯规，跑者无需起跑免费进占二垒。',
          runnerTargetX: 344,
        }
      : action === 'normal-pitch'
        ? {
            tone: 'danger' as const,
            title: `常规投球 · 跑者 ${stealTimeSec} 秒冲刺轻松盗上二垒！`,
            desc: '面对短跑级快腿，投手一旦面向本垒启动投球动作，等捕手接球再传二垒根本来不及触杀。',
            runnerTargetX: 344,
          }
        : pickoffCaught
          ? {
              tone: 'win' as const,
              title: `突然转身牵制 · 离垒 ${leadMeters.toFixed(1)}m 过远，触杀出局！`,
              desc: '精准抓到跑者提前启动重心偏右的瞬间转身甩向一垒，来不及回垒直接牵制出局！',
              runnerTargetX: runnerX,
            }
          : {
              tone: 'neutral' as const,
              title: `突然转身牵制 · 离垒 ${leadMeters.toFixed(1)}m 较谨慎，跑者勉强扑回一垒`,
              desc: '虽未立刻抓出局，但反复打乱其起跑节奏已大幅压缩离垒距离，让快腿不敢贸然盗垒。',
              runnerTargetX: 74,
            };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 离垒滑块 */}
        <label className="block rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5 space-y-1.5 text-[12px]">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Footprints className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
              快腿跑者一垒离垒距离
            </span>
            <span className="font-bold tabular-nums text-[var(--diagram-brass)]">
              {leadMeters.toFixed(1)} m {leadMeters >= 3.2 ? '（贪进危险区）' : '（保守回垒区）'}
            </span>
          </div>
          <input
            type="range"
            min={1.8}
            max={4.5}
            step={0.1}
            value={leadMeters}
            onChange={(e) => setLeadMeters(Number(e.target.value))}
            className="w-full accent-[var(--diagram-brass)] cursor-pointer"
          />
        </label>

        {/* 一垒至二垒垒道 SVG */}
        <svg
          viewBox="0 0 420 132"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="棒球一垒至二垒垒道牵制与盗垒示意图"
        >
          {/* 投手丘 */}
          <circle cx="195" cy="24" r="11" fill="var(--diagram-panel)" stroke="var(--diagram-brass)" strokeWidth="1.8" />
          <text x="195" y="28" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--diagram-brass)">
            投
          </text>

          {/* 垒道基线 */}
          <line x1="64" y1="92" x2="356" y2="92" stroke="var(--diagram-border)" strokeWidth="3" />
          {/* 牵制危险界线（3.2m） */}
          <line x1="129" y1="74" x2="129" y2="110" stroke="var(--diagram-accent)" strokeWidth="1.4" strokeDasharray="3 2" />
          <text x="129" y="124" textAnchor="middle" fontSize="9.5" fill="var(--diagram-accent)">
            回垒临界线 (3.2m)
          </text>

          {/* 一垒包与二垒包 */}
          <rect
            x="54"
            y="82"
            width="20"
            height="20"
            transform="rotate(45 64 92)"
            fill="var(--diagram-panel)"
            stroke="var(--text-primary)"
            strokeWidth="1.8"
          />
          <text x="64" y="124" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-primary)">
            一垒
          </text>

          <rect
            x="346"
            y="82"
            width="20"
            height="20"
            transform="rotate(45 356 92)"
            fill="var(--diagram-panel)"
            stroke="var(--text-primary)"
            strokeWidth="1.8"
          />
          <text x="356" y="124" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-primary)">
            二垒
          </text>

          {/* 动作矢量箭头 */}
          {action === 'pickoff' && (
            <path
              d="M 186 30 L 76 82"
              fill="none"
              stroke="var(--diagram-brass)"
              strokeWidth="2.2"
              strokeDasharray="4 3"
            />
          )}
          {action === 'normal-pitch' && (
            <path
              d={`M ${runnerX} 80 Q 240 52 342 80`}
              fill="none"
              stroke="var(--diagram-accent)"
              strokeWidth="2.2"
              strokeDasharray="5 3"
            />
          )}
          {action === 'balk' && (
            <path
              d={`M ${runnerX} 80 L 342 80`}
              fill="none"
              stroke="var(--diagram-accent)"
              strokeWidth="2.2"
            />
          )}

          {/* 跑者起跑点（淡影）与终态位置 */}
          <circle
            cx={runnerX}
            cy="92"
            r="7"
            fill="color-mix(in srgb, var(--diagram-panel) 85%, transparent)"
            stroke="var(--text-muted)"
            strokeWidth="1.4"
            strokeDasharray="2 2"
          />
          <circle
            cx={result.runnerTargetX}
            cy="92"
            r="9"
            fill={
              result.tone === 'win'
                ? 'var(--diagram-brass)'
                : result.tone === 'danger'
                  ? 'var(--diagram-accent)'
                  : 'var(--text-secondary)'
            }
          />
          <text
            x={result.runnerTargetX}
            y="95.5"
            textAnchor="middle"
            fontSize="9.5"
            fontWeight="700"
            fill="var(--btn-primary-fg)"
          >
            跑
          </text>

          {/* 动作标注 */}
          <text
            x="295"
            y="28"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="600"
            fill={result.tone === 'win' ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
          >
            {action === 'pickoff'
              ? pickoffCaught
                ? '闪电牵制 · 抓出局!'
                : '牵制逼退回垒'
              : action === 'balk'
                ? 'Balk 犯规 · 免费进垒'
                : `极速盗垒 ${stealTimeSec}s`}
          </text>
        </svg>

        {/* 三大交互选择 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(
            [
              { id: 'normal-pitch', title: '常规投球', sub: '面向本垒出手，快腿直冲二垒' },
              { id: 'pickoff', title: '突然转身牵制', sub: '合法动作甩一垒抓离垒过远' },
              { id: 'balk', title: '假动作露馅 (Balk)', sub: '触发投手犯规，直接白送二垒' },
            ] as const
          ).map((item) => {
            const active = action === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setAction(item.id)}
                className={`rounded-lg px-3 py-2 text-left border cursor-pointer transition-colors ${
                  active
                    ? item.id === 'pickoff'
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                      : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--text-secondary)]'
                }`}
              >
                <div className="text-[12.5px] font-semibold text-[var(--text-primary)]">{item.title}</div>
                <div className="mt-0.5 text-[11px] text-[var(--text-secondary)]">{item.sub}</div>
              </button>
            );
          })}
        </div>

        {/* 判定结果框 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] space-y-1 ${
            result.tone === 'win'
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
              : result.tone === 'danger'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
          }`}
        >
          <div
            className={`font-semibold ${
              result.tone === 'win'
                ? 'text-[var(--diagram-brass)]'
                : result.tone === 'danger'
                  ? 'text-[var(--diagram-accent)]'
                  : 'text-[var(--text-primary)]'
            }`}
          >
            {result.title}
          </div>
          <div className="text-[var(--text-secondary)]">{result.desc}</div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        封杀短跑级盗垒王的关键不是拼捕手传球速度，而是在绝不踩踏 Balk 犯规红线的前提下，用牵制时机把跑者的离垒心理彻底锁死。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 8. 蓝海火星队主场暗箱战：三大主场作弊黑幕逐一拆解链路                       */
/* -------------------------------------------------------------------------- */
type CheatKey = 'drum' | 'ball' | 'umpire';

const BLUEMARS_CHEATS: Array<{
  key: CheatKey;
  title: string;
  cheatDesc: string;
  counterTitle: string;
  counterDesc: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    key: 'drum',
    title: '看台鼓点传暗号',
    cheatDesc: '主场应援团借外野暗哨偷窥暗号，以鼓点轻重节奏提前告知打者球路。',
    counterTitle: '已反制：反向喂假节奏',
    counterDesc: '故意放出假手势诱使看台敲错鼓点，在全场转播镜头下让主队打者按自家鼓声挥空出丑。',
    icon: Drum,
  },
  {
    key: 'ball',
    title: '棒球暗抹异物',
    cheatDesc: '对方投手隐蔽涂抹粘性/磨损物破坏球面气流，投出违背常理的诡异急坠球。',
    counterTitle: '已反制：高频验球锁镜头',
    counterDesc: '紧盯对方手套动作并合法频繁要求换球验球，在电视特写镜头前彻底断绝动手脚的空间。',
    icon: Droplets,
  },
  {
    key: 'umpire',
    title: '偏袒好球带主审',
    cheatDesc: '主审对客队极度压缩好球带、对主队放宽边角判定，直接抗议只会被驱逐。',
    counterTitle: '已反制：绕过主审直接出局',
    counterDesc: '不再纠缠边缘好坏球判罚，直接诱使打者挥棒把球打进场内完成接杀，让黑哨根本插不上手。',
    icon: Gavel,
  },
];

function BlueMarsCheatDiagram() {
  const [dismantled, setDismantled] = useState<Record<CheatKey, boolean>>({
    drum: false,
    ball: false,
    umpire: false,
  });

  const count = Object.values(dismantled).filter(Boolean).length;

  const toggleCheat = (key: CheatKey) => {
    setDismantled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const reset = () => {
    setDismantled({ drum: false, ball: false, umpire: false });
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：镜头监控与拆解进度 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex items-center gap-2">
            <Tv className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
            <span className="font-semibold text-[var(--text-primary)]">
              主场黑幕拆解进度：
              <strong
                className={`ml-1 tabular-nums ${
                  count === 3 ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
                }`}
              >
                {count} / 3
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            恢复暗箱
          </button>
        </div>

        {/* 进度条 */}
        <div className="h-2 rounded-full bg-[var(--diagram-panel)] overflow-hidden">
          <div
            style={{ width: `${(count / 3) * 100}%` }}
            className="h-full bg-[var(--diagram-brass)] transition-all"
          />
        </div>

        {/* 三道黑幕卡片 */}
        <div className="grid grid-cols-1 gap-2.5">
          {BLUEMARS_CHEATS.map((item) => {
            const broken = dismantled[item.key];
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={broken}
                onClick={() => toggleCheat(item.key)}
                className={`w-full rounded-lg p-3 text-left border transition-all cursor-pointer ${
                  broken
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_13%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-accent)]/70 bg-[color-mix(in_srgb,var(--diagram-accent)_9%,var(--diagram-panel))] hover:border-[var(--diagram-accent)]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 font-semibold text-[13px] text-[var(--text-primary)]">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        broken ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
                      }`}
                    />
                    <span>{item.title}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      broken
                        ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                        : 'bg-[var(--diagram-panel)] border border-[var(--diagram-accent)] text-[var(--diagram-accent)]'
                    }`}
                  >
                    {broken ? (
                      <>
                        <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                        暗箱已废除
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3 h-3" aria-hidden="true" />
                        点击拆解
                      </>
                    )}
                  </span>
                </div>
                <p className="mt-1.5 text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
                  {broken ? `${item.counterTitle}——${item.counterDesc}` : item.cheatDesc}
                </p>
              </button>
            );
          })}
        </div>

        {/* 球场态势总结 */}
        <div
          className={`rounded-lg px-3.5 py-2.5 border text-[12px] font-medium text-center ${
            count === 3
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_15%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
          }`}
        >
          {count === 0 && '三道主场作弊机关同时运转，单靠向联盟申诉无法取证，客队处处挨打。'}
          {count === 1 && '已撬开第一道黑幕，但剩余暗箱仍在联动作祟，需继续逐层废除。'}
          {count === 2 && '还剩最后一道暗箱！拆掉它就能在万众镜头前彻底夺回公平赛场。'}
          {count === 3 && '三道主场黑幕悉数在规则与直播镜头前瓦解，对手被迫回归正面野球决胜！'}
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        面对整座球场改造成的精密作弊机器，单靠抗议毫无用处；必须在规则框架与观众镜头前把每道暗箱逐一废成摆设。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 9. 球团收购终局契约战：9 局冠军赛模拟与整支球队股权终极天平                 */
/* -------------------------------------------------------------------------- */
function OwnershipFinaleDiagram() {
  const [ourScore, setOurScore] = useState<number>(3);
  const [oppScore, setOppScore] = useState<number>(3);
  const [inning, setInning] = useState<7 | 8 | 9>(9);

  const diff = ourScore - oppScore;
  const state: 'win' | 'tie' | 'lose' = diff > 0 ? 'win' : diff < 0 ? 'lose' : 'tie';
  // 天平倾角：我方领先向左（股权筹码压重）倾斜，我方落后向右（归零反噬压重）倾斜
  const tiltDeg = state === 'win' ? -10 : state === 'lose' ? 10 : 0;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：冠军赛局数与快捷情景 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Scale className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
            <span>终极夺冠对赌 · 第 {inning} 局实时账面</span>
          </div>
          <div className="inline-flex items-center gap-1">
            {([7, 8, 9] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setInning(n)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums border cursor-pointer ${
                  inning === n
                    ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                }`}
              >
                {n} 局
              </button>
            ))}
          </div>
        </div>

        {/* 终极股权对赌天平 SVG */}
        <svg
          viewBox="0 0 420 132"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="夺冠赢下球队股权与失利债款一夜归零的终极对赌天平"
        >
          {/* 底座与中轴 */}
          <polygon
            points="188,120 232,120 218,108 202,108"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="1.5"
          />
          <line x1="210" y1="34" x2="210" y2="108" stroke="var(--diagram-border)" strokeWidth="2.5" />
          <circle cx="210" cy="34" r="5" fill="var(--diagram-brass)" />

          {/* 倾斜横梁组 */}
          <g transform={`rotate(${tiltDeg} 210 34)`}>
            <line x1="78" y1="34" x2="342" y2="34" stroke="var(--text-primary)" strokeWidth="2.4" />

            {/* 左盘：夺冠（股权 + 天价赔款） */}
            <line x1="92" y1="34" x2="72" y2="72" stroke="var(--diagram-brass)" strokeWidth="1.3" />
            <line x1="92" y1="34" x2="112" y2="72" stroke="var(--diagram-brass)" strokeWidth="1.3" />
            <path
              d="M 54 72 L 130 72 Q 92 88 54 72 Z"
              fill={
                state === 'win'
                  ? 'color-mix(in srgb, var(--diagram-brass) 30%, var(--diagram-panel))'
                  : 'var(--diagram-panel)'
              }
              stroke="var(--diagram-brass)"
              strokeWidth="1.6"
            />
            <text x="92" y="64" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--diagram-brass)">
              夺冠：球队股权
            </text>

            {/* 右盘：失利（整季债款归零） */}
            <line x1="328" y1="34" x2="308" y2="72" stroke="var(--diagram-accent)" strokeWidth="1.3" />
            <line x1="328" y1="34" x2="348" y2="72" stroke="var(--diagram-accent)" strokeWidth="1.3" />
            <path
              d="M 290 72 L 366 72 Q 328 88 290 72 Z"
              fill={
                state === 'lose'
                  ? 'color-mix(in srgb, var(--diagram-accent) 28%, var(--diagram-panel))'
                  : 'var(--diagram-panel)'
              }
              stroke="var(--diagram-accent)"
              strokeWidth="1.6"
            />
            <text x="328" y="64" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--diagram-accent)">
              失利：债款归零
            </text>
          </g>

          {/* 中央比分悬浮牌 */}
          <rect
            x="164"
            y="84"
            width="92"
            height="22"
            rx="11"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="1.3"
          />
          <text x="210" y="99" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-primary)">
            {ourScore} : {oppScore}
          </text>
        </svg>

        {/* 比分调节器 + 快速情景按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5 text-[12px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[var(--diagram-brass)]">利卡昂斯</span>
              <button
                type="button"
                onClick={() => setOurScore((v) => Math.max(0, v - 1))}
                className="w-6 h-6 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] cursor-pointer"
              >
                -
              </button>
              <span className="w-5 text-center font-bold tabular-nums text-[var(--text-primary)]">{ourScore}</span>
              <button
                type="button"
                onClick={() => setOurScore((v) => Math.min(9, v + 1))}
                className="w-6 h-6 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] cursor-pointer"
              >
                +
              </button>
            </div>

            <span className="text-[var(--text-muted)]">vs</span>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[var(--text-secondary)]">榜首强敌</span>
              <button
                type="button"
                onClick={() => setOppScore((v) => Math.max(0, v - 1))}
                className="w-6 h-6 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] cursor-pointer"
              >
                -
              </button>
              <span className="w-5 text-center font-bold tabular-nums text-[var(--text-primary)]">{oppScore}</span>
              <button
                type="button"
                onClick={() => setOppScore((v) => Math.min(9, v + 1))}
                className="w-6 h-6 rounded border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setOurScore(4);
                setOppScore(3);
              }}
              className="px-2 py-0.5 rounded-full border border-[var(--diagram-brass)]/70 bg-[var(--diagram-surface)] text-[var(--diagram-brass)] cursor-pointer"
            >
              领先 1 分
            </button>
            <button
              type="button"
              onClick={() => {
                setOurScore(3);
                setOppScore(3);
              }}
              className="px-2 py-0.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] cursor-pointer"
            >
              平局僵持
            </button>
            <button
              type="button"
              onClick={() => {
                setOurScore(2);
                setOppScore(3);
              }}
              className="px-2 py-0.5 rounded-full border border-[var(--diagram-accent)]/70 bg-[var(--diagram-surface)] text-[var(--diagram-accent)] cursor-pointer"
            >
              落后 1 分
            </button>
          </div>
        </div>

        {/* 双边终局账面对照 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12px]">
          <div
            className={`rounded-lg p-3 border transition-colors space-y-1 ${
              state === 'win'
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_15%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]/70'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-brass)]">
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>夺冠触发条款</span>
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
              老板必须全额兑付天价赔款，并交出利卡昂斯球团全部控制权与股权。
            </p>
          </div>

          <div
            className={`rounded-lg p-3 border transition-colors space-y-1 ${
              state === 'lose'
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_15%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]/70'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-accent)]">
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              <span>失利反噬条款</span>
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
              此前整个赛季冒着负资产风险赢下的全部巨额欠款一夜勾销，瞬间归零。
            </p>
          </div>
        </div>

        {/* 当前局势提示 */}
        <div className="flex items-center justify-center gap-1.5 text-[12px] font-medium">
          <Target
            className={`w-3.5 h-3.5 shrink-0 ${
              state === 'win'
                ? 'text-[var(--diagram-brass)]'
                : state === 'lose'
                  ? 'text-[var(--diagram-accent)]'
                  : 'text-[var(--text-secondary)]'
            }`}
            aria-hidden="true"
          />
          <span
            className={
              state === 'win'
                ? 'text-[var(--diagram-brass)]'
                : state === 'lose'
                  ? 'text-[var(--diagram-accent)]'
                  : 'text-[var(--text-secondary)]'
            }
          >
            {state === 'win' && `第 ${inning} 局领先 ${diff} 分：守住当下比分即可买断整支球队。`}
            {state === 'tie' && `第 ${inning} 局 ${ourScore}:${oppScore} 僵持：任意 1 分得失都将决定整支球团归属。`}
            {state === 'lose' && `第 ${inning} 局落后 ${Math.abs(diff)} 分：若无法在 9 局结束前反超，整季心血将彻底归零。`}
          </span>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        终极赌约把整季累积的巨额筹码全部推上台面：要么夺冠直接买断整支球团，要么功亏一篑让此前所有收益一夜归零。
      </p>
    </div>
  );
}

export const ONE_OUTS_DIAGRAMS: Record<string, ComponentType> = {
  'oneouts-street-game': StreetGameDiagram,
  'oneouts-contract': ContractDiagram,
  'oneouts-takami-duel': TakamiDuelDiagram,
  'oneouts-rain-delay': RainDelayDiagram,
  'oneouts-substitute-trap': SubstituteTrapDiagram,
  'oneouts-sign-stealing': SignStealingDiagram,
  'oneouts-johnson-steal': JohnsonStealDiagram,
  'oneouts-bluemars-cheat': BlueMarsCheatDiagram,
  'oneouts-ownership-finale': OwnershipFinaleDiagram,
};
