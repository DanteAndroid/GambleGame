import { useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  Anchor,
  Ban,
  Beer,
  CheckCircle2,
  CircleDot,
  Coins,
  Crown,
  Droplets,
  Eye,
  Flag,
  Flame,
  Gauge,
  Hand,
  Layers,
  Lock,
  LockOpen,
  MessageSquare,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  Skull,
  Spade,
  Timer,
  TrendingUp,
  Trophy,
  UserSearch,
  Wind,
  XCircle,
  Zap,
} from 'lucide-react';

/* ============================================================================
 * 1. zero-ring-drop · 勇者之环
 * 梦想王国生死机关关卡 + 「王之环」收集进度槽（集齐 3 枚晋级）
 * ========================================================================== */

interface RingStage {
  id: number;
  name: string;
  mechanism: string;
  calmNote: string;
  panicNote: string;
}

const RING_STAGES: RingStage[] = [
  {
    id: 0,
    name: '高空悬笼',
    mechanism: '底部活板门受重心偏移触发',
    calmNote: '观察锁扣结构，沿承重梁平移卸力，稳稳摘下第 1 枚王之环。',
    panicNote: '急于扑向出口重心失衡，底部闸门瞬间弹开，触发高空淘汰！',
  },
  {
    id: 1,
    name: '离心转盘',
    mechanism: '外圈转速骤增、内轴存在盲区停顿',
    calmNote: '盯紧齿轮咬合节拍，借内轴减速窗口越过卡口，取得第 2 枚王之环。',
    panicNote: '盲目顺边缘狂奔被离心力甩向护栏外侧，当场淘汰出局！',
  },
  {
    id: 2,
    name: '断桥铁索',
    mechanism: '桥面配重块联动对岸解锁栓',
    calmNote: '算清配重杠杆比例，同步释放卡销通过断桥，集齐第 3 枚王之环！',
    panicNote: '慌乱硬拉铁索触发反向崩塌锁，整段桥板倾斜，坠落淘汰！',
  },
];

function ZeroRingDropDiagram() {
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [rings, setRings] = useState<number>(0);
  const [mode, setMode] = useState<'ready' | 'calm' | 'panic' | 'cleared'>('ready');
  const [log, setLog] = useState<string>('观察当前生死机关构造，在限时内选择冷静拆解或盲目冲关。');

  const current = RING_STAGES[Math.min(stageIdx, RING_STAGES.length - 1)];

  const actCalm = () => {
    if (mode === 'panic' || mode === 'cleared') return;
    const nextRings = rings + 1;
    setRings(nextRings);
    if (nextRings >= RING_STAGES.length) {
      setMode('cleared');
      setLog(`${current.calmNote} 已集齐 3 枚王之环，获得后续高额对决晋级资格！`);
    } else {
      setMode('calm');
      setStageIdx((i) => i + 1);
      setLog(current.calmNote);
    }
  };

  const actPanic = () => {
    if (mode === 'panic' || mode === 'cleared') return;
    setMode('panic');
    setLog(current.panicNote);
  };

  const reset = () => {
    setStageIdx(0);
    setRings(0);
    setMode('ready');
    setLog('观察当前生死机关构造，在限时内选择冷静拆解或盲目冲关。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">
              第 {Math.min(stageIdx + 1, 3)} / 3 关 · {current.name}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[10.5px] text-[var(--text-secondary)]">
              <Ban className="w-3 h-3 text-[var(--diagram-accent)]" aria-hidden="true" />
              禁止外援
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

        {/* 王之环收集进度槽 */}
        <div className="grid grid-cols-3 gap-2.5">
          {RING_STAGES.map((st, idx) => {
            const earned = idx < rings;
            const active = idx === stageIdx && mode !== 'cleared' && mode !== 'panic';
            const failedHere = idx === stageIdx && mode === 'panic';
            return (
              <div
                key={st.id}
                className={`rounded-lg px-2.5 py-2 border flex items-center justify-between gap-1.5 transition-colors ${
                  failedHere
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))]'
                    : earned
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))]'
                      : active
                        ? 'border-[var(--diagram-brass)]/70 bg-[var(--diagram-panel)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]/65'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-[var(--text-primary)] truncate">{st.name}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">
                    {failedHere ? '触发淘汰' : earned ? '已获环' : active ? '进行中' : '待解锁'}
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    failedHere
                      ? 'border-[var(--diagram-accent)] text-[var(--diagram-accent)]'
                      : earned
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_24%,transparent)] text-[var(--diagram-brass)]'
                        : 'border-[var(--diagram-border)] text-[var(--text-muted)]'
                  }`}
                >
                  {failedHere ? (
                    <Skull className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : earned ? (
                    <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <CircleDot className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 梦想王国高空机关剖面 SVG */}
        <svg
          viewBox="0 0 420 128"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="高空生死机关结构与王之环解锁示意图"
        >
          {/* 顶部支架与吊索 */}
          <line x1="20" y1="16" x2="400" y2="16" stroke="var(--diagram-border)" strokeWidth="2.5" />
          <line x1="120" y1="16" x2="120" y2="42" stroke="var(--text-secondary)" strokeWidth="1.6" strokeDasharray="3 2" />
          <line x1="300" y1="16" x2="300" y2="42" stroke="var(--text-secondary)" strokeWidth="1.6" strokeDasharray="3 2" />

          {/* 机关主舱 */}
          <rect
            x="96"
            y="42"
            width="228"
            height="54"
            rx="8"
            fill="var(--diagram-panel)"
            stroke={
              mode === 'panic'
                ? 'var(--diagram-accent)'
                : mode === 'cleared'
                  ? 'var(--diagram-brass)'
                  : 'var(--diagram-border)'
            }
            strokeWidth="1.8"
          />

          {/* 舱内隐藏连杆 */}
          <path
            d="M 118 68 L 190 68 L 210 56 L 268 56"
            fill="none"
            stroke="var(--diagram-brass)"
            strokeWidth="1.6"
            strokeDasharray={mode === 'panic' ? '2 3' : 'none'}
          />
          <circle cx="190" cy="68" r="4.5" fill="var(--diagram-brass)" />
          <circle cx="268" cy="56" r="5" fill="none" stroke="var(--diagram-brass)" strokeWidth="2" />

          {/* 挑战者标记 */}
          <g transform={`translate(${mode === 'panic' ? 210 : mode === 'cleared' ? 292 : 146}, ${mode === 'panic' ? 96 : 62})`}>
            <circle
              cx="0"
              cy="0"
              r="7.5"
              fill={mode === 'panic' ? 'color-mix(in srgb, var(--diagram-accent) 28%, var(--diagram-panel))' : 'color-mix(in srgb, var(--diagram-brass) 24%, var(--diagram-panel))'}
              stroke={mode === 'panic' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
              strokeWidth="1.8"
            />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill={mode === 'panic' ? 'var(--diagram-accent)' : 'var(--text-primary)'}
            >
              零
            </text>
          </g>

          {/* 底部陷阱闸门 */}
          {mode === 'panic' ? (
            <>
              <line x1="150" y1="96" x2="180" y2="118" stroke="var(--diagram-accent)" strokeWidth="2.5" />
              <line x1="270" y1="96" x2="240" y2="118" stroke="var(--diagram-accent)" strokeWidth="2.5" />
              <text x="210" y="122" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--diagram-accent)">
                闸门失控打开 · 触发淘汰
              </text>
            </>
          ) : (
            <>
              <line x1="150" y1="96" x2="270" y2="96" stroke="var(--diagram-brass)" strokeWidth="2.5" />
              <text x="210" y="114" textAnchor="middle" fontSize="10.5" fontWeight="500" fill="var(--text-secondary)">
                {mode === 'cleared' ? '三道生死机关全数破解 · 晋级成功' : `隐藏机制：${current.mechanism}`}
              </text>
            </>
          )}

          {/* 右侧王之环挂台 */}
          <circle
            cx="352"
            cy="69"
            r="14"
            fill={mode === 'cleared' ? 'color-mix(in srgb, var(--diagram-brass) 24%, var(--diagram-panel))' : 'var(--diagram-panel)'}
            stroke="var(--diagram-brass)"
            strokeWidth="2"
          />
          <text x="352" y="73" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--diagram-brass)">
            {rings}/3
          </text>
        </svg>

        {/* 操作决策 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={mode === 'panic' || mode === 'cleared'}
            onClick={actCalm}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>观察构造・拆解取环</span>
          </button>
          <button
            type="button"
            disabled={mode === 'panic' || mode === 'cleared'}
            onClick={actPanic}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>慌乱硬闯（触发淘汰）</span>
          </button>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12px] text-center font-medium border ${
            mode === 'panic'
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_15%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : mode === 'cleared'
                ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        无外援的高空机关里，恐慌只会触发预设死门；逐关看穿结构并集满王之环才能跨入高额淘汰赛。
      </p>
    </div>
  );
}

/* ============================================================================
 * 2. zero-jack-room · 杰克房间
 * 悬刃铡刀铁匣剖面 SVG + 读秒压迫滑块 + 死守识破 vs 中途抽手
 * ========================================================================== */

function ZeroJackRoomDiagram() {
  const [sec, setSec] = useState<number>(4);
  const [outcome, setOutcome] = useState<'holding' | 'pulled' | 'cleared'>('holding');

  // 刀刃随秒数从 y=18 逼近手腕 y=104（10 秒时由暗藏限位销卡在安全距 y=94）
  const bladeBottomY = 26 + (sec / 10) * 68;
  const gapMm = Math.max(4, Math.round(72 - (sec / 10) * 68));
  const taunt =
    sec <= 3
      ? '考官冷笑：倒计时刚起步，现在抽手还来得及保住手指。'
      : sec <= 7
        ? '金属齿轮刺耳加速！铡刀不断逼近腕部，心理压迫陡增。'
        : sec < 10
          ? '刀锋几乎贴近皮肤！只差最后读秒，抽手还是硬扛？'
          : '读秒归零！暗藏限位止动销自动咬合，钢刃悬停在安全距。';

  const pullHand = () => {
    setOutcome('pulled');
  };

  const holdToEnd = () => {
    setSec(10);
    setOutcome('cleared');
  };

  const reset = () => {
    setSec(4);
    setOutcome('holding');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Timer className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
            读秒压迫：<span className="tabular-nums text-[var(--diagram-accent)]">{sec}.0 / 10.0s</span>
            <span className="text-[var(--text-secondary)] font-normal">· 距手腕 {gapMm} mm</span>
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

        {/* 断指铁匣纵剖面 SVG */}
        <svg
          viewBox="0 0 420 146"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="杰克房间悬刃铡刀断指铁匣剖面示意图"
        >
          {/* 外铁匣框体 */}
          <rect
            x="104"
            y="14"
            width="212"
            height="118"
            rx="8"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="2"
          />
          {/* 左侧伸手入口 */}
          <rect x="98" y="92" width="12" height="26" fill="var(--diagram-surface)" />
          <line x1="104" y1="92" x2="104" y2="118" stroke="var(--diagram-brass)" strokeWidth="2" strokeDasharray="3 2" />

          {/* 滑轨 */}
          <line x1="146" y1="20" x2="146" y2="96" stroke="var(--border-hairline)" strokeWidth="2" />
          <line x1="214" y1="20" x2="214" y2="96" stroke="var(--border-hairline)" strokeWidth="2" />

          {/* 暗藏限位止动销（识破机关后高亮） */}
          <rect
            x="138"
            y="94"
            width="14"
            height="5"
            rx="1.5"
            fill={outcome === 'cleared' || sec === 10 ? 'var(--diagram-brass)' : 'var(--diagram-border)'}
          />
          <rect
            x="208"
            y="94"
            width="14"
            height="5"
            rx="1.5"
            fill={outcome === 'cleared' || sec === 10 ? 'var(--diagram-brass)' : 'var(--diagram-border)'}
          />

          {/* 悬刃铡刀 */}
          <g>
            <line x1="180" y1="14" x2="180" y2={bladeBottomY - 22} stroke="var(--text-secondary)" strokeWidth="2" />
            <path
              d={`M 148 ${bladeBottomY - 22} L 212 ${bladeBottomY - 22} L 212 ${bladeBottomY - 6} L 180 ${bladeBottomY} L 148 ${bladeBottomY - 6} Z`}
              fill="color-mix(in srgb, var(--diagram-accent) 30%, var(--diagram-panel))"
              stroke="var(--diagram-accent)"
              strokeWidth="1.8"
            />
            <text
              x="180"
              y={bladeBottomY - 10}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="700"
              fill="var(--diagram-accent)"
            >
              铡刀
            </text>
          </g>

          {/* 伸入的手臂与手掌 */}
          {outcome === 'pulled' ? (
            <g>
              <rect
                x="24"
                y="98"
                width="62"
                height="16"
                rx="8"
                fill="color-mix(in srgb, var(--diagram-accent) 22%, var(--diagram-panel))"
                stroke="var(--diagram-accent)"
                strokeWidth="1.6"
                strokeDasharray="3 2"
              />
              <text x="55" y="90" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--diagram-accent)">
                已抽手失格
              </text>
            </g>
          ) : (
            <g>
              <rect
                x="38"
                y="98"
                width="196"
                height="16"
                rx="8"
                fill="color-mix(in srgb, var(--diagram-brass) 22%, var(--diagram-panel))"
                stroke={outcome === 'cleared' ? 'var(--diagram-brass)' : 'var(--text-primary)'}
                strokeWidth="1.6"
              />
              <text x="128" y="109.5" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--text-primary)">
                手腕伸入匣内（不可抽回）
              </text>
            </g>
          )}

          {/* 匣底王之环 */}
          <circle
            cx="276"
            cy="106"
            r="12"
            fill={outcome === 'cleared' ? 'color-mix(in srgb, var(--diagram-brass) 32%, var(--diagram-panel))' : 'var(--diagram-surface)'}
            stroke="var(--diagram-brass)"
            strokeWidth="2.2"
          />
          <text x="276" y="109.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--diagram-brass)">
            环
          </text>
          <text x="276" y="84" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
            {outcome === 'cleared' ? '成功取环' : '匣内王之环'}
          </text>

          {/* 右侧距腕标注 */}
          <text x="364" y="62" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-primary)">
            安全止动线
          </text>
          <line x1="316" y1="96" x2="394" y2="96" stroke="var(--diagram-brass)" strokeWidth="1.4" strokeDasharray="3 2" />
          <text x="364" y="112" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
            {outcome === 'cleared' ? '已卡止保腕' : '真实触发条件'}
          </text>
        </svg>

        {/* 读秒滑块 */}
        <label className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 flex flex-col gap-1.5 text-[12px]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--text-primary)]">拖动体验倒计时逼近压迫</span>
            <span className="tabular-nums font-semibold text-[var(--diagram-accent)]">{sec} 秒</span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={sec}
            disabled={outcome !== 'holding'}
            onChange={(e) => setSec(Number(e.target.value))}
            className="w-full accent-[var(--diagram-accent)] cursor-pointer"
          />
        </label>

        {/* 抉择按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={holdToEnd}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>死守不抽手・识破机关拿环</span>
          </button>
          <button
            type="button"
            onClick={pullHand}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
          >
            <Hand className="w-3.5 h-3.5" aria-hidden="true" />
            <span>扛不住恐惧・中途抽手</span>
          </button>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12px] text-center font-medium border ${
            outcome === 'pulled'
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_15%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : outcome === 'cleared'
                ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {outcome === 'pulled'
            ? `你在第 ${sec} 秒恐惧抽手！匣口感应立刻锁闭，直接丧失本关「王之环」资格。`
            : outcome === 'cleared'
              ? '坚持到最后一秒！看破铡刀真实限位条件，毫发无伤取走匣内「王之环」。'
              : taunt}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        声响与下压钢刃专攻心理防线；只要中途抽手便立刻失格，看懂装置触发机制并顶住恐惧才能拿环。
      </p>
    </div>
  );
}

/* ============================================================================
 * 3. zero-quarter-jump · 四分之一跳台
 * 1–4 号高空窄跳板（暗幕遮挡、禁抛重物）+ 检查板身细节 + 纵身跃下验证
 * ========================================================================== */

const SAFE_LANE_ROTATION = [3, 2, 4, 1];

function ZeroQuarterJumpDiagram() {
  const [roundSeed, setRoundSeed] = useState<number>(0);
  const [inspected, setInspected] = useState<number[]>([]);
  const [jumpedLane, setJumpedLane] = useState<number | null>(null);

  const safeLane = SAFE_LANE_ROTATION[roundSeed % SAFE_LANE_ROTATION.length];
  const lanes = [1, 2, 3, 4];

  const getClue = (lane: number) => {
    if (lane === safeLane) {
      return `${lane} 号板：尾部微有新装缓冲气流回响，且板沿压痕与其余三条不同（疑似下方藏有软垫）。`;
    }
    const decoys = [
      '板下回声空旷直透底渊，敲击护栏时毫无吸音反馈。',
      '螺栓锈迹均匀，下方穿堂风笔直上涌，无遮挡物回流。',
      '踏板共振清脆尖锐，黑暗深处没有任何气囊受压微响。',
    ];
    return `${lane} 号板：${decoys[(lane + roundSeed) % decoys.length]}`;
  };

  const inspectLane = (lane: number) => {
    if (jumpedLane !== null) return;
    if (!inspected.includes(lane)) {
      setInspected((prev) => [...prev, lane]);
    }
  };

  const jumpFrom = (lane: number) => {
    if (jumpedLane !== null) return;
    setJumpedLane(lane);
  };

  const reset = () => {
    setRoundSeed((s) => s + 1);
    setInspected([]);
    setJumpedLane(null);
  };

  const won = jumpedLane === safeLane;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">4 选 1 高空跳台</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[10.5px] text-[var(--text-secondary)]">
              <Ban className="w-3 h-3 text-[var(--diagram-accent)]" aria-hidden="true" />
              禁抛重物试探
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            换一局分布
          </button>
        </div>

        {/* 高空四条跳板与下方黑暗遮挡区 SVG */}
        <svg
          viewBox="0 0 420 148"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="四条高空窄跳板与黑暗遮挡下的唯一救生软垫"
        >
          {/* 顶部高台 */}
          <rect x="24" y="10" width="372" height="16" rx="4" fill="var(--diagram-panel)" stroke="var(--diagram-border)" strokeWidth="1.5" />

          {/* 下方黑暗遮挡区 */}
          <rect
            x="24"
            y="68"
            width="372"
            height="70"
            rx="8"
            fill={jumpedLane === null ? 'color-mix(in srgb, var(--bg-page) 82%, var(--diagram-panel))' : 'var(--diagram-panel)'}
            stroke="var(--diagram-border)"
            strokeWidth="1.5"
            strokeDasharray={jumpedLane === null ? '4 3' : 'none'}
          />

          {lanes.map((lane, idx) => {
            const cx = 74 + idx * 90;
            const isInspected = inspected.includes(lane);
            const isJumped = jumpedLane === lane;
            const isSafe = lane === safeLane;

            return (
              <g key={lane}>
                {/* 窄跳板 */}
                <rect
                  x={cx - 18}
                  y="26"
                  width="36"
                  height="36"
                  rx="4"
                  fill={
                    isJumped
                      ? isSafe
                        ? 'color-mix(in srgb, var(--diagram-brass) 28%, var(--diagram-panel))'
                        : 'color-mix(in srgb, var(--diagram-accent) 26%, var(--diagram-panel))'
                      : isInspected
                        ? 'color-mix(in srgb, var(--diagram-brass) 16%, var(--diagram-panel))'
                        : 'var(--diagram-panel)'
                  }
                  stroke={
                    isJumped
                      ? isSafe
                        ? 'var(--diagram-brass)'
                        : 'var(--diagram-accent)'
                      : isInspected
                        ? 'var(--diagram-brass)'
                        : 'var(--diagram-border)'
                  }
                  strokeWidth="1.8"
                />
                <text x={cx} y="48" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text-primary)">
                  {lane} 号
                </text>

                {/* 跃下轨迹与软垫显形 */}
                {jumpedLane !== null && (
                  <>
                    {isSafe ? (
                      <g>
                        <rect
                          x={cx - 32}
                          y="108"
                          width="64"
                          height="20"
                          rx="6"
                          fill="color-mix(in srgb, var(--diagram-brass) 32%, var(--diagram-panel))"
                          stroke="var(--diagram-brass)"
                          strokeWidth="1.8"
                        />
                        <text x={cx} y="121.5" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--diagram-brass)">
                          唯一软垫
                        </text>
                      </g>
                    ) : (
                      <text x={cx} y="121" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">
                        无垫重摔
                      </text>
                    )}

                    {isJumped && (
                      <>
                        <line
                          x1={cx}
                          y1="62"
                          x2={cx}
                          y2={isSafe ? 104 : 124}
                          stroke={isSafe ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
                          strokeWidth="2"
                          strokeDasharray="3 2"
                        />
                        <circle
                          cx={cx}
                          cy={isSafe ? 102 : 124}
                          r="6"
                          fill={isSafe ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
                        />
                      </>
                    )}
                  </>
                )}
              </g>
            );
          })}

          {jumpedLane === null && (
            <text x="210" y="107" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--text-secondary)">
              下方被黑暗与遮挡物完全掩盖（仅 1 条下方藏有救生软垫）
            </text>
          )}
        </svg>

        {/* 四条跳板检查与跃下按钮 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {lanes.map((lane) => {
            const seen = inspected.includes(lane);
            return (
              <div
                key={lane}
                className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-2 flex flex-col gap-1.5"
              >
                <div className="text-[11.5px] font-semibold text-center text-[var(--text-primary)]">{lane} 号跳板</div>
                <button
                  type="button"
                  disabled={jumpedLane !== null}
                  onClick={() => inspectLane(lane)}
                  className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[11px] border cursor-pointer disabled:opacity-45 ${
                    seen
                      ? 'border-[var(--diagram-brass)] text-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))] font-medium'
                      : 'border-[var(--diagram-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Search className="w-3 h-3" aria-hidden="true" />
                  <span>{seen ? '已查细节' : '查板身'}</span>
                </button>
                <button
                  type="button"
                  disabled={jumpedLane !== null}
                  onClick={() => jumpFrom(lane)}
                  className="px-2 py-1 rounded-md bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[11px] font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
                >
                  纵身跃下
                </button>
              </div>
            );
          })}
        </div>

        {/* 细节观察笔记或跳跃结果 */}
        {jumpedLane !== null ? (
          <p
            className={`rounded-lg px-3.5 py-2.5 text-[12px] text-center font-medium border ${
              won
                ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
            }`}
          >
            {won
              ? `你从 ${jumpedLane} 号跳板纵身跃下，精准落上唯一救生软垫，安全过关！`
              : `你跳下了 ${jumpedLane} 号跳板，下方空无一物触发重摔淘汰！（本局安全软垫在 ${safeLane} 号）`}
          </p>
        ) : inspected.length > 0 ? (
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-1.5 text-[11.5px] text-[var(--text-primary)]">
            {inspected.map((lane) => (
              <div key={lane} className="flex items-start gap-1.5">
                <span className="text-[var(--diagram-brass)] font-semibold shrink-0">•</span>
                <span>{getClue(lane)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[var(--text-secondary)] text-center">
            禁止投掷重物，但可以先点击「查板身」观察结构与气流细节，再决定从哪条跳板跃下。
          </p>
        )}
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        盲跳胜率只有 25%；利用规则未禁止的板身与环境细节排查，才能把四选一变成确定解。
      </p>
    </div>
  );
}

/* ============================================================================
 * 4. zero-triangle-room · 魔鬼三角
 * 正三角形三面墙持续向内合拢的动态 SVG + 答错收缩 + 三墙一地联立解四字密码
 * ========================================================================== */

interface TriangleClue {
  id: 'left' | 'right' | 'bottom' | 'floor';
  label: string;
  content: string;
}

const TRIANGLE_CLUES: TriangleClue[] = [
  { id: 'left', label: '左墙刻纹', content: '几何三角刻着「▲ = 生」，其余字符残缺，单独无法成词。' },
  { id: 'right', label: '右墙刻纹', content: '方形石纹标出「■ = 门」，旁注半句顺序提示。' },
  { id: 'bottom', label: '底墙刻纹', content: '圆形凹槽刻着「● = 归」，指向中央终端底座。' },
  { id: 'floor', label: '地面星图', content: '地面连线给出唯一读取序：● → ▲ → 之 → ■（四墙合一）。' },
];

const TRIANGLE_PASSWORDS = [
  { code: '生门归之', hint: '仅凭左右墙顺序直觉拼凑' },
  { code: '归生之门', hint: '结合三墙符号与地面读取序' },
  { code: '之门生归', hint: '漏看地面起始标记' },
];

function ZeroTriangleRoomDiagram() {
  const [shrinkStep, setShrinkStep] = useState<number>(0); // 0..4 (4=压碎)
  const [activeClue, setActiveClue] = useState<TriangleClue['id']>('left');
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('三面墙体随时会向中心合拢：切换查看「三墙一地」联立线索，输入正确四字密码开门。');

  const crushed = shrinkStep >= 4 && !unlocked;
  const maxStep = 4;
  // 正三角形中心约 (210, 102)，初始外顶点：(210, 18), (94, 152), (326, 152)
  const cx = 210;
  const cy = 104;
  const scale = Math.max(0.24, 1 - shrinkStep * 0.19);
  const lerp = (v: number, center: number) => center + (v - center) * scale;
  const pTop = `${lerp(210, cx).toFixed(1)},${lerp(18, cy).toFixed(1)}`;
  const pLeft = `${lerp(92, cx).toFixed(1)},${lerp(154, cy).toFixed(1)}`;
  const pRight = `${lerp(328, cx).toFixed(1)},${lerp(154, cy).toFixed(1)}`;
  const spacePct = Math.max(0, Math.round((1 - shrinkStep / maxStep) * 100));

  const triggerWrong = (reason: string) => {
    if (crushed || unlocked) return;
    const next = Math.min(maxStep, shrinkStep + 1);
    setShrinkStep(next);
    if (next >= maxStep) {
      setStatus(`${reason} 三面墙体彻底闭合压碎密室，逃生失败！`);
    } else {
      setStatus(`${reason} 三面墙猛然向中心收缩一圈！（剩余安全空间 ${Math.round((1 - next / maxStep) * 100)}%）`);
    }
  };

  const submitPassword = (code: string) => {
    if (crushed || unlocked) return;
    if (code === '归生之门') {
      setUnlocked(true);
      setStatus('中央终端校验通过！四字密码「归生之门」停住三面压墙，逃生大门开启！');
    } else {
      triggerWrong(`密码「${code}」错误！`);
    }
  };

  const reset = () => {
    setShrinkStep(0);
    setActiveClue('left');
    setUnlocked(false);
    setStatus('三面墙体随时会向中心合拢：切换查看「三墙一地」联立线索，输入正确四字密码开门。');
  };

  const selectedClueObj = TRIANGLE_CLUES.find((c) => c.id === activeClue) ?? TRIANGLE_CLUES[0];

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex flex-wrap items-center gap-2.5">
            <span className="font-semibold text-[var(--text-primary)]">
              剩余安全空间：
              <strong className={`tabular-nums ${spacePct <= 25 ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'}`}>
                {spacePct}%
              </strong>
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">失误次数：{shrinkStep} / {maxStep}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={crushed || unlocked}
              onClick={() => triggerWrong('模拟答错一次！')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)] disabled:opacity-40 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              答错一次（合拢）
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

        {/* 正三角形动态合拢密室 SVG */}
        <svg
          viewBox="0 0 420 174"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="正三角形三面墙向中心不断收缩的密室俯视图"
        >
          {/* 原始外框虚线 */}
          <polygon
            points="210,18 92,154 328,154"
            fill="color-mix(in srgb, var(--diagram-accent) 7%, var(--diagram-panel))"
            stroke="var(--diagram-border)"
            strokeWidth="1.4"
            strokeDasharray="4 3"
          />

          {/* 正在合拢的活动三角形密室 */}
          <polygon
            points={`${pTop} ${pLeft} ${pRight}`}
            fill={
              unlocked
                ? 'color-mix(in srgb, var(--diagram-brass) 16%, var(--diagram-panel))'
                : crushed
                  ? 'color-mix(in srgb, var(--diagram-accent) 28%, var(--diagram-panel))'
                  : 'var(--diagram-panel)'
            }
            stroke={unlocked ? 'var(--diagram-brass)' : shrinkStep > 0 ? 'var(--diagram-accent)' : 'var(--text-primary)'}
            strokeWidth="2.8"
          />

          {/* 高亮当前查看的墙面或地面 */}
          {activeClue === 'left' && (
            <line x1={lerp(210, cx)} y1={lerp(18, cy)} x2={lerp(92, cx)} y2={lerp(154, cy)} stroke="var(--diagram-brass)" strokeWidth="4" />
          )}
          {activeClue === 'right' && (
            <line x1={lerp(210, cx)} y1={lerp(18, cy)} x2={lerp(328, cx)} y2={lerp(154, cy)} stroke="var(--diagram-brass)" strokeWidth="4" />
          )}
          {activeClue === 'bottom' && (
            <line x1={lerp(92, cx)} y1={lerp(154, cy)} x2={lerp(328, cx)} y2={lerp(154, cy)} stroke="var(--diagram-brass)" strokeWidth="4" />
          )}
          {activeClue === 'floor' && (
            <circle cx={cx} cy={cy} r={Math.max(12, 26 * scale)} fill="color-mix(in srgb, var(--diagram-brass) 24%, transparent)" stroke="var(--diagram-brass)" strokeWidth="1.6" strokeDasharray="3 2" />
          )}

          {/* 向内合拢压力箭头 */}
          <path d="M 118 68 L 146 82" stroke="var(--diagram-accent)" strokeWidth="1.6" />
          <path d="M 302 68 L 274 82" stroke="var(--diagram-accent)" strokeWidth="1.6" />
          <path d="M 210 166 L 210 144" stroke="var(--diagram-accent)" strokeWidth="1.6" />

          {/* 墙面符号标注 */}
          <text x="80" y="84" textAnchor="end" fontSize="10.5" fontWeight="600" fill={activeClue === 'left' ? 'var(--diagram-brass)' : 'var(--text-secondary)'}>
            左墙 ▲
          </text>
          <text x="340" y="84" textAnchor="start" fontSize="10.5" fontWeight="600" fill={activeClue === 'right' ? 'var(--diagram-brass)' : 'var(--text-secondary)'}>
            右墙 ■
          </text>
          <text x="210" y="170" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={activeClue === 'bottom' ? 'var(--diagram-brass)' : 'var(--text-secondary)'}>
            底墙 ●
          </text>

          {/* 中央密码终端 */}
          <rect
            x={cx - 22}
            y={cy - 12}
            width="44"
            height="24"
            rx="5"
            fill="var(--diagram-surface)"
            stroke={unlocked ? 'var(--diagram-brass)' : 'var(--diagram-border)'}
            strokeWidth="1.5"
          />
          <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={unlocked ? 'var(--diagram-brass)' : crushed ? 'var(--diagram-accent)' : 'var(--text-primary)'}>
            {unlocked ? '已开门' : crushed ? '已闭合' : '终端'}
          </text>
        </svg>

        {/* 三墙一地线索切换 */}
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            {TRIANGLE_CLUES.map((clue) => (
              <button
                key={clue.id}
                type="button"
                onClick={() => setActiveClue(clue.id)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                  activeClue === clue.id
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {clue.label}
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 text-[12px] text-[var(--text-primary)]">
            <span className="font-semibold text-[var(--diagram-brass)]">{selectedClueObj.label}：</span>
            {selectedClueObj.content}
          </div>
        </div>

        {/* 四字密码终端输入 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {TRIANGLE_PASSWORDS.map((item) => (
            <button
              key={item.code}
              type="button"
              disabled={crushed || unlocked}
              onClick={() => submitPassword(item.code)}
              className="rounded-lg px-3 py-2 border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] disabled:opacity-45 cursor-pointer text-left transition-colors"
            >
              <div className="flex items-center justify-between text-[12.5px] font-semibold text-[var(--text-primary)]">
                <span>「{item.code}」</span>
                {unlocked && item.code === '归生之门' ? (
                  <LockOpen className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                )}
              </div>
              <div className="text-[10.5px] text-[var(--text-secondary)] mt-0.5">{item.hint}</div>
            </button>
          ))}
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12px] text-center font-medium border ${
            crushed
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : unlocked
                ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        单看任何一面墙都拼不出真相；每次猜错都会让正三角形三墙加速合拢，必须联立三墙一地解出四字密码。
      </p>
    </div>
  );
}

/* ============================================================================
 * 5. zero-anchor-room · 锚之房间
 * 半空巨型铁锚悬于同伴头顶纵剖面 + 逻辑锁解谜 vs 答错猛坠 vs 邪恶背叛键
 * ========================================================================== */

const ANCHOR_LOCKS = ['数字序列锁', '暗码破译锁', '真假陈述锁'];

function ZeroAnchorRoomDiagram() {
  const [locksCleared, setLocksCleared] = useState<number>(0);
  const [dropPct, setDropPct] = useState<number>(20); // 0..100
  const [outcome, setOutcome] = useState<'active' | 'saved' | 'crushed' | 'betrayed'>('active');
  const [log, setLog] = useState<string>('巨型铁锚正缓缓下沉：连续解开 3 道逻辑锁才能停住绞盘，救下被缚同伴。');

  const solveOne = () => {
    if (outcome !== 'active') return;
    const nextLocks = locksCleared + 1;
    setLocksCleared(nextLocks);
    if (nextLocks >= 3) {
      setOutcome('saved');
      setLog('3 道连环逻辑锁全部破解！铁锚制动栓彻底卡死，同伴安全获救！');
    } else {
      setLog(`成功解开「${ANCHOR_LOCKS[nextLocks - 1]}」！铁锚短暂停稳，下一道题难度升级。`);
    }
  };

  const missOne = () => {
    if (outcome !== 'active') return;
    const nextDrop = Math.min(100, dropPct + 30);
    setDropPct(nextDrop);
    if (nextDrop >= 100) {
      setOutcome('crushed');
      setLog('答题失误导致钢索脱扣，巨型铁锚坠落到底，未能救下同伴！');
    } else {
      setLog(`答题失误！绞盘急松，巨型铁锚猛坠一截（下坠深度已达 ${nextDrop}%）！`);
    }
  };

  const betray = () => {
    if (outcome !== 'active') return;
    setDropPct(100);
    setOutcome('betrayed');
    setLog('你按下了邪恶诱惑键：牺牲被缚同伴，机关吐出本关王之环供你独吞。');
  };

  const reset = () => {
    setLocksCleared(0);
    setDropPct(20);
    setOutcome('active');
    setLog('巨型铁锚正缓缓下沉：连续解开 3 道逻辑锁才能停住绞盘，救下被缚同伴。');
  };

  // 铁锚顶部 y 随 dropPct 从 22 下沉至 88
  const anchorY = 20 + (dropPct / 100) * 68;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            {ANCHOR_LOCKS.map((name, idx) => {
              const done = idx < locksCleared;
              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${
                    done
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                  }`}
                >
                  {done ? <LockOpen className="w-3 h-3" aria-hidden="true" /> : <Lock className="w-3 h-3" aria-hidden="true" />}
                  {name}
                </span>
              );
            })}
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

        {/* 巨型铁锚纵剖面 SVG */}
        <svg
          viewBox="0 0 420 156"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="巨型铁锚悬于被缚同伴头顶的纵剖面示意图"
        >
          {/* 顶部横梁与绞盘 */}
          <line x1="36" y1="14" x2="384" y2="14" stroke="var(--diagram-border)" strokeWidth="3" />
          <rect x="190" y="8" width="40" height="12" rx="3" fill="var(--diagram-panel)" stroke="var(--diagram-brass)" strokeWidth="1.5" />

          {/* 钢索 */}
          <line
            x1="210"
            y1="20"
            x2="210"
            y2={anchorY}
            stroke={outcome === 'saved' ? 'var(--diagram-brass)' : 'var(--text-secondary)'}
            strokeWidth="2.2"
          />

          {/* 巨型铁锚 */}
          <g transform={`translate(210, ${anchorY})`}>
            <circle cx="0" cy="4" r="5" fill="none" stroke="var(--text-primary)" strokeWidth="2" />
            <line x1="0" y1="9" x2="0" y2="34" stroke="var(--text-primary)" strokeWidth="4" />
            <line x1="-18" y1="15" x2="18" y2="15" stroke="var(--text-primary)" strokeWidth="3" />
            <path
              d="M -28 24 Q 0 46 28 24 L 22 36 Q 0 50 -22 36 Z"
              fill={
                outcome === 'crushed' || outcome === 'betrayed'
                  ? 'color-mix(in srgb, var(--diagram-accent) 40%, var(--diagram-panel))'
                  : 'color-mix(in srgb, var(--text-primary) 22%, var(--diagram-panel))'
              }
              stroke={outcome === 'crushed' || outcome === 'betrayed' ? 'var(--diagram-accent)' : 'var(--text-primary)'}
              strokeWidth="1.8"
            />
          </g>

          {/* 底部地面与被缚同伴 */}
          <line x1="36" y1="142" x2="384" y2="142" stroke="var(--diagram-border)" strokeWidth="2" />
          <g transform="translate(210, 128)">
            <circle
              cx="0"
              cy="-8"
              r="7.5"
              fill="var(--diagram-panel)"
              stroke={outcome === 'saved' ? 'var(--diagram-brass)' : outcome === 'active' ? 'var(--text-primary)' : 'var(--diagram-accent)'}
              strokeWidth="1.8"
            />
            <rect
              x="-12"
              y="1"
              width="24"
              height="13"
              rx="4"
              fill="var(--diagram-panel)"
              stroke={outcome === 'saved' ? 'var(--diagram-brass)' : outcome === 'active' ? 'var(--text-secondary)' : 'var(--diagram-accent)'}
              strokeWidth="1.6"
            />
            <text x="38" y="8" fontSize="10.5" fontWeight="600" fill="var(--text-secondary)">
              被缚同伴
            </text>
          </g>

          {/* 右侧邪恶背叛键与王之环提示 */}
          <rect
            x="312"
            y="50"
            width="78"
            height="54"
            rx="8"
            fill={outcome === 'betrayed' ? 'color-mix(in srgb, var(--diagram-accent) 22%, var(--diagram-panel))' : 'var(--diagram-panel)'}
            stroke={outcome === 'betrayed' ? 'var(--diagram-accent)' : 'var(--diagram-border)'}
            strokeWidth="1.5"
          />
          <circle cx="351" cy="70" r="9" fill="color-mix(in srgb, var(--diagram-accent) 30%, var(--diagram-panel))" stroke="var(--diagram-accent)" strokeWidth="1.6" />
          <text x="351" y="94" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--diagram-accent)">
            邪恶背叛键
          </text>

          {/* 左侧深度标尺 */}
          <text x="64" y="72" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
            下坠深度
          </text>
          <text
            x="64"
            y="88"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill={dropPct >= 80 ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
          >
            {dropPct}%
          </text>
        </svg>

        {/* 三大机制按钮 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={outcome !== 'active'}
            onClick={solveOne}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            <Anchor className="w-3.5 h-3.5" aria-hidden="true" />
            <span>答对逻辑锁（稳锚）</span>
          </button>
          <button
            type="button"
            disabled={outcome !== 'active'}
            onClick={missOne}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-accent)] text-[12px] font-semibold disabled:opacity-40 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
            <span>答错（猛坠一截）</span>
          </button>
          <button
            type="button"
            disabled={outcome !== 'active'}
            onClick={betray}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            <span>按背叛键（独吞环）</span>
          </button>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12px] text-center font-medium border ${
            outcome === 'saved'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : outcome === 'crushed' || outcome === 'betrayed'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        除了解开步步升级的连环逻辑题外，场内更设有「弃友独吞王之环」的诱惑键，同时拷问智力与人性。
      </p>
    </div>
  );
}

/* ============================================================================
 * 6. zero-witch-mansion · 魔女之馆
 * 真假证词排查板 + 双方「王之环」筹码槽 + 排除干扰避开逻辑死循环扣环
 * ========================================================================== */

interface WitchStatement {
  id: string;
  role: string;
  claim: string;
  isDecoy: boolean;
  reason: string;
}

const WITCH_STATEMENTS: WitchStatement[] = [
  {
    id: 'butler',
    role: '大厅执事',
    claim: '「钟楼钥匙只交给不进花园的人」',
    isDecoy: false,
    reason: '与公开门禁记录一致，为有效基础约束。',
  },
  {
    id: 'painter',
    role: '阁楼画师',
    claim: '「若执事说真话，则女仆必在撒谎」',
    isDecoy: true,
    reason: '对手故意抛出的循环干扰命题，顺着推会陷入逻辑死循环。',
  },
  {
    id: 'guard',
    role: '钟楼守卫',
    claim: '「子夜时阁楼灯未亮，真正魔女握有双门禁卡」',
    isDecoy: false,
    reason: '与对手试探动作相互印证，可反推隐藏身份限制。',
  },
  {
    id: 'maid',
    role: '花园女仆',
    claim: '「所有在场者中至少有两句证词互相否定」',
    isDecoy: true,
    reason: '模棱两可的烟雾弹条件，易诱发误判扣环。',
  },
];

function ZeroWitchMansionDiagram() {
  const [myRings, setMyRings] = useState<number>(4);
  const [rivalRings, setRivalRings] = useState<number>(4);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [solved, setSolved] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('点击证词卡「标记排除干扰」，剔除 2 条逻辑陷阱后再锁定核心真相。');

  const outOfRings = myRings <= 0;

  const toggleExclude = (id: string) => {
    if (solved || outOfRings) return;
    setExcludedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const verifyDeduction = () => {
    if (solved || outOfRings) return;
    const decoyIds = WITCH_STATEMENTS.filter((s) => s.isDecoy).map((s) => s.id);
    const exactMatch =
      excludedIds.length === decoyIds.length && decoyIds.every((id) => excludedIds.includes(id));

    if (exactMatch) {
      setSolved(true);
      setRivalRings((r) => Math.max(0, r - 2));
      setStatus('精准剔除对手烟雾弹并避开逻辑死循环！率先解出魔女之馆核心真相，保住晋级权！');
    } else {
      const nextMy = Math.max(0, myRings - 1);
      setMyRings(nextMy);
      setRivalRings((r) => Math.min(6, r + 1));
      setStatus(
        nextMy === 0
          ? '陷入逻辑死循环误判条件！手中的「王之环」全部损毁，直接出局。'
          : '排查有误，踩入逻辑死循环陷阱！立刻损失 1 枚「王之环」，请重新核对证词间的制约关系。'
      );
    }
  };

  const reset = () => {
    setMyRings(4);
    setRivalRings(4);
    setExcludedIds([]);
    setSolved(false);
    setStatus('点击证词卡「标记排除干扰」，剔除 2 条逻辑陷阱后再锁定核心真相。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 双方王之环筹码槽 */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: '我方智将阵营', count: myRings, accent: false },
            { label: '对手智将阵营', count: rivalRings, accent: true },
          ].map((side) => (
            <div
              key={side.label}
              className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 flex items-center justify-between gap-2"
            >
              <span className="text-[11.5px] font-semibold text-[var(--text-primary)]">{side.label}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full border-2 ${
                      i < side.count
                        ? side.accent
                          ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_32%,transparent)]'
                          : 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_32%,transparent)]'
                        : 'border-[var(--diagram-border)]'
                    }`}
                  />
                ))}
                <span className="ml-1 text-[11px] font-bold tabular-nums text-[var(--text-secondary)]">
                  {side.count}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 真假证词排查板 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {WITCH_STATEMENTS.map((st) => {
            const isExcluded = excludedIds.includes(st.id);
            return (
              <button
                key={st.id}
                type="button"
                disabled={solved || outOfRings}
                onClick={() => toggleExclude(st.id)}
                className={`rounded-xl p-3 border text-left transition-all cursor-pointer disabled:cursor-default ${
                  isExcluded
                    ? 'border-[var(--diagram-accent)]/75 bg-[color-mix(in_srgb,var(--diagram-accent)_10%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[12px] font-semibold text-[var(--text-primary)]">{st.role}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isExcluded
                        ? 'bg-[color-mix(in_srgb,var(--diagram-accent)_22%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                        : 'bg-[var(--diagram-surface)] text-[var(--diagram-brass)]'
                    }`}
                  >
                    {isExcluded ? (
                      <>
                        <XCircle className="w-3 h-3" aria-hidden="true" />
                        已排为干扰
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        保留核验
                      </>
                    )}
                  </span>
                </div>
                <p className={`text-[11.5px] leading-snug ${isExcluded ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                  {st.claim}
                </p>
                <p className="text-[10.5px] text-[var(--text-secondary)] mt-1.5">{st.reason}</p>
              </button>
            );
          })}
        </div>

        {/* 核验提交与重置 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            disabled={solved || outOfRings}
            onClick={verifyDeduction}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" aria-hidden="true" />
            <span>提交推演・锁定魔女真相</span>
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置牌局
          </button>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12px] text-center font-medium border ${
            solved
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : outOfRings
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        双方阵营可在馆内彼此放烟雾弹干扰；一旦踩入逻辑死循环误判条件，手中的王之环就会被直接扣除。
      </p>
    </div>
  );
}

/* ============================================================================
 * 7. zero-lost-ring · 失落的指环
 * 休息室 4 名嫌疑人问话排查台（严禁搜身）+ 观察破绽 + 唯一一次公开指认
 * ========================================================================== */

interface Suspect {
  id: number;
  name: string;
  tag: string;
  alibi: string;
  tell: string;
  isCulprit: boolean;
}

const SUSPECTS: Suspect[] = [
  {
    id: 0,
    name: '嫌疑人 A',
    tag: '焦躁选手',
    alibi: '「我一直在喝水，根本没靠近过你的储物格！」',
    tell: '语气激愤但目光坦然，提到储物格时下意识看错了方向，并不知道环原本放在哪。',
    isCulprit: false,
  },
  {
    id: 1,
    name: '嫌疑人 B',
    tag: '冷面眼镜男',
    alibi: '「那种小指环随便塞进茶杯垫下谁找得到？我没碰过。」',
    tell: '话术破绽：无人提及指环藏匿方式，他却顺口说出了「茶杯垫下」并瞬间僵住咽口水。',
    isCulprit: true,
  },
  {
    id: 2,
    name: '嫌疑人 C',
    tag: '沉默新人',
    alibi: '「熄灯那十秒我一直靠墙坐着，没听到金属声。」',
    tell: '双手始终平放桌面，呼吸平稳，对环的去向毫无多余反应。',
    isCulprit: false,
  },
  {
    id: 3,
    name: '嫌疑人 D',
    tag: '浮夸富少',
    alibi: '「谁稀罕偷你一枚环？我自己早就攒够了！」',
    tell: '习惯性炫耀但全程未涉及任何隐藏细节，只是虚张声势。',
    isCulprit: false,
  },
];

function ZeroLostRingDiagram() {
  const [selectedId, setSelectedId] = useState<number>(0);
  const [questionedIds, setQuestionedIds] = useState<number[]>([0]);
  const [accusedId, setAccusedId] = useState<number | null>(null);
  const [patDownWarn, setPatDownWarn] = useState<boolean>(false);

  const selected = SUSPECTS[selectedId];
  const accused = accusedId !== null ? SUSPECTS[accusedId] : null;

  const questionSuspect = (id: number) => {
    setSelectedId(id);
    setPatDownWarn(false);
    if (!questionedIds.includes(id)) {
      setQuestionedIds((prev) => [...prev, id]);
    }
  };

  const accuseCurrent = () => {
    if (accusedId !== null) return;
    setAccusedId(selectedId);
  };

  const reset = () => {
    setSelectedId(0);
    setQuestionedIds([0]);
    setAccusedId(null);
    setPatDownWarn(false);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">休息室问话排查台</span>
            <button
              type="button"
              onClick={() => setPatDownWarn(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))] border border-[var(--diagram-accent)]/60 text-[10.5px] text-[var(--diagram-accent)] cursor-pointer"
            >
              <Ban className="w-3 h-3" aria-hidden="true" />
              严禁搜身
            </button>
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

        {/* 4 名嫌疑人问话席 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SUSPECTS.map((s) => {
            const isSelected = selectedId === s.id;
            const seen = questionedIds.includes(s.id);
            const isAccused = accusedId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => questionSuspect(s.id)}
                className={`rounded-xl p-2.5 border text-left transition-all cursor-pointer ${
                  isAccused
                    ? s.isCulprit
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))]'
                      : 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))]'
                    : isSelected
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)]/70'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <UserSearch
                    className={`w-4 h-4 ${isSelected ? 'text-[var(--diagram-brass)]' : 'text-[var(--text-secondary)]'}`}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] text-[var(--text-secondary)]">{seen ? '已盘问' : '未盘问'}</span>
                </div>
                <div className="text-[12px] font-semibold text-[var(--text-primary)]">{s.name}</div>
                <div className="text-[10.5px] text-[var(--text-secondary)]">{s.tag}</div>
              </button>
            );
          })}
        </div>

        {/* 供词与微表情观察面板 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-primary)]">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              正在盘问：{selected.name}（{selected.tag}）
            </span>
            <button
              type="button"
              disabled={accusedId !== null}
              onClick={accuseCurrent}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[11.5px] font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>公开指认此人</span>
            </button>
          </div>
          <p className="text-[12px] text-[var(--text-primary)] leading-relaxed">{selected.alibi}</p>
          <div className="rounded-lg bg-[var(--diagram-surface)] border border-[var(--border-hairline)] px-3 py-2 text-[11.5px] text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--diagram-brass)]">微表情与话术观察：</span>
            {selected.tell}
          </div>
        </div>

        {patDownWarn && accused === null && (
          <p className="rounded-lg px-3 py-2 text-[11.5px] text-center font-medium border border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)]">
            规则禁止强行翻包搜身或胁迫！必须靠语言试探诱使真凶暴露隐秘信息后再公开指认。
          </p>
        )}

        {accused && (
          <p
            className={`rounded-lg px-3.5 py-2.5 text-[12px] text-center font-medium border ${
              accused.isCulprit
                ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
            }`}
          >
            {accused.isCulprit
              ? `精准指认 ${accused.name}！对方无法解释为何知晓藏匿细节，被迫当场交出失落的「王之环」。`
              : `指认 ${accused.name} 失败！对方并非真凶，不仅找不回指环，你还立刻失去了最终晋级资格。`}
          </p>
        )}
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        不能搜身且只有一次公开指认机会；唯有真正藏环者才会对隐秘细节产生不自觉的话术与微表情破绽。
      </p>
    </div>
  );
}

/* ============================================================================
 * 8. zero-morning-golf · 清晨高尔夫
 * 比洞赛倍率协商（1×/2×/4× + 让杆/限杆盘口）+ 露水/风向/坡度三滑块推杆轨迹
 * ========================================================================== */

type HandicapMode = 'even' | 'give1' | 'ironOnly';

const HANDICAP_LABELS: Record<HandicapMode, { name: string; desc: string; tolerance: number }> = {
  even: { name: '平手对决', desc: '标准容差，同发球位', tolerance: 12 },
  give1: { name: '对手让 1 杆', desc: '容错略宽，盘口平衡', tolerance: 16 },
  ironOnly: { name: '限定单铁杆', desc: '控球极难，容差收紧', tolerance: 9 },
};

function ZeroMorningGolfDiagram() {
  const [multiplier, setMultiplier] = useState<1 | 2 | 4>(2);
  const [handicap, setHandicap] = useState<HandicapMode>('even');
  const [dew, setDew] = useState<number>(45); // 清晨露水阻力 0..100
  const [wind, setWind] = useState<number>(30); // 侧风 -50..50
  const [slope, setSlope] = useState<number>(-20); // 果岭坡度 -50..50
  const [aimOffset, setAimOffset] = useState<number>(-10); // 瞄准修正 -50..50
  const [puttResult, setPuttResult] = useState<'idle' | 'in' | 'miss'>('idle');

  const stakeMillion = 1000 * multiplier;
  const hConfig = HANDICAP_LABELS[handicap];

  // 小球最终坐标计算：起点 (54, 78)，洞口 (352, 78)
  const reachRatio = Math.max(0.55, Math.min(1.12, 1.08 - dew * 0.0022));
  const endX = 54 + (352 - 54) * reachRatio;
  const lateralDrift = (wind * 0.48 + slope * 0.52 + aimOffset * 0.9) * 0.65;
  const endY = Math.max(22, Math.min(134, 78 + lateralDrift));
  const distToHole = Math.hypot(endX - 352, endY - 78);
  const willSink = distToHole <= hConfig.tolerance;

  const ctrlX = (54 + endX) / 2;
  const ctrlY = 78 + lateralDrift * 0.35;

  const executePutt = () => {
    setPuttResult(willSink ? 'in' : 'miss');
  };

  const reset = () => {
    setMultiplier(2);
    setHandicap('even');
    setDew(45);
    setWind(30);
    setSlope(-20);
    setAimOffset(-10);
    setPuttResult('idle');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 倍率与盘口协商条 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--text-secondary)]">协商倍率：</span>
            {([1, 2, 4] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMultiplier(m);
                  setPuttResult('idle');
                }}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tabular-nums cursor-pointer ${
                  multiplier === m
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
                }`}
              >
                {m}×
              </button>
            ))}
            <span className="text-[11.5px] font-semibold text-[var(--diagram-brass)] tabular-nums">
              本洞赌注 {stakeMillion.toLocaleString()} 万
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

        {/* 盘口平衡条件 */}
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(HANDICAP_LABELS) as HandicapMode[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setHandicap(key);
                setPuttResult('idle');
              }}
              className={`rounded-lg px-2.5 py-1.5 border text-left cursor-pointer transition-colors ${
                handicap === key
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
              }`}
            >
              <div className="text-[11.5px] font-semibold text-[var(--text-primary)]">{HANDICAP_LABELS[key].name}</div>
              <div className="text-[10px] text-[var(--text-secondary)]">{HANDICAP_LABELS[key].desc}</div>
            </button>
          ))}
        </div>

        {/* 果岭推杆轨迹 SVG */}
        <svg
          viewBox="0 0 420 150"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="清晨果岭受露水、风向与坡度影响的推杆轨迹示意图"
        >
          {/* 果岭区域 */}
          <rect
            x="18"
            y="14"
            width="384"
            height="122"
            rx="16"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="1.5"
          />
          {/* 坡度等高参考线 */}
          <path d="M 110 20 Q 130 75 110 130" fill="none" stroke="var(--border-hairline)" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 220 20 Q 240 75 220 130" fill="none" stroke="var(--border-hairline)" strokeWidth="1" strokeDasharray="3 3" />

          {/* 理想基准直线 */}
          <line x1="54" y1="78" x2="352" y2="78" stroke="var(--border-hairline)" strokeWidth="1.2" strokeDasharray="4 4" />

          {/* 球洞容差圈与球洞 */}
          <circle
            cx="352"
            cy="78"
            r={hConfig.tolerance}
            fill="color-mix(in srgb, var(--diagram-brass) 14%, transparent)"
            stroke="var(--diagram-brass)"
            strokeWidth="1.2"
            strokeDasharray="3 2"
          />
          <circle cx="352" cy="78" r="6" fill="var(--bg-page)" stroke="var(--text-primary)" strokeWidth="1.5" />
          {/* 洞旗 */}
          <line x1="352" y1="78" x2="352" y2="34" stroke="var(--diagram-brass)" strokeWidth="1.6" />
          <path d="M 352 34 L 374 42 L 352 50 Z" fill="var(--diagram-brass)" />

          {/* 实际滚动曲线 */}
          <path
            d={`M 54 78 Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`}
            fill="none"
            stroke={willSink ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
            strokeWidth="2.4"
          />

          {/* 起点球与落点球 */}
          <circle cx="54" cy="78" r="5" fill="var(--text-primary)" />
          <circle
            cx={endX}
            cy={endY}
            r="5.5"
            fill={willSink ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
          />
          <text x="54" y="100" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
            推杆位
          </text>
          <text x="352" y="114" textAnchor="middle" fontSize="10" fontWeight="600" fill={willSink ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}>
            {willSink ? '线路贴合进洞' : '线路偏出洞口'}
          </text>
        </svg>

        {/* 清晨露水 / 风向 / 坡度 + 瞄准修正 滑块 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11.5px]">
          <label className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[var(--text-primary)] font-medium">
                <Droplets className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                清晨露水阻力
              </span>
              <span className="tabular-nums text-[var(--text-secondary)]">{dew}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={dew}
              onChange={(e) => {
                setDew(Number(e.target.value));
                setPuttResult('idle');
              }}
              className="w-full accent-[var(--diagram-brass)] cursor-pointer"
            />
          </label>

          <label className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[var(--text-primary)] font-medium">
                <Wind className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                清晨侧风偏移
              </span>
              <span className="tabular-nums text-[var(--text-secondary)]">{wind > 0 ? `+${wind}` : wind}</span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={wind}
              onChange={(e) => {
                setWind(Number(e.target.value));
                setPuttResult('idle');
              }}
              className="w-full accent-[var(--diagram-brass)] cursor-pointer"
            />
          </label>

          <label className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[var(--text-primary)] font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
                果岭暗坡侧倾
              </span>
              <span className="tabular-nums text-[var(--text-secondary)]">{slope > 0 ? `+${slope}` : slope}</span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={slope}
              onChange={(e) => {
                setSlope(Number(e.target.value));
                setPuttResult('idle');
              }}
              className="w-full accent-[var(--diagram-accent)] cursor-pointer"
            />
          </label>

          <label className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[var(--text-primary)] font-medium">
                <Flag className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                击球瞄准修正
              </span>
              <span className="tabular-nums text-[var(--text-secondary)]">{aimOffset > 0 ? `+${aimOffset}` : aimOffset}</span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={aimOffset}
              onChange={(e) => {
                setAimOffset(Number(e.target.value));
                setPuttResult('idle');
              }}
              className="w-full accent-[var(--diagram-brass)] cursor-pointer"
            />
          </label>
        </div>

        {/* 关键一推结算 */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5">
          <div className="text-[12px] text-[var(--text-primary)]">
            {puttResult === 'idle' && (
              <span>调节环境与瞄准修正，点击体验 {multiplier}× 倍率下的关键推杆结算。</span>
            )}
            {puttResult === 'in' && (
              <span className="text-[var(--diagram-brass)] font-semibold">
                一推进洞！按 {multiplier}× 倍率赢下 {stakeMillion.toLocaleString()} 万高额筹码！
              </span>
            )}
            {puttResult === 'miss' && (
              <span className="text-[var(--diagram-accent)] font-semibold">
                擦边偏出！受环境偏移影响，{multiplier}× 高倍率洞瞬间倒赔 {stakeMillion.toLocaleString()} 万！
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={executePutt}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 cursor-pointer shrink-0"
          >
            <Flag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>关键推杆</span>
          </button>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        比洞赛可在关键击球前翻倍加码；露水、侧风与暗坡叠加下，哪怕一杆细微抖动都会令高倍率赌金满盘皆输。
      </p>
    </div>
  );
}

/* ============================================================================
 * 9. zero-100-poker · 100枚扑克
 * 100 张扩容牌堆（含重牌与特牌，铁支/五条概率飙升）+ 现金耗尽抵押真牙续命
 * ========================================================================== */

interface PokerHandPreset {
  label: string;
  cards: string[];
  highlight: string;
  rivalLabel: string;
  playerWins: boolean;
}

const POKER_100_HANDS: PokerHandPreset[] = [
  {
    label: '五条 A（100 张牌堆特产）',
    cards: ['♠A', '♠A', '♥A', '♦A', '★王'],
    highlight: '同花同点重牌 + 王牌，常规 52 张牌绝无此型',
    rivalLabel: '对手亮出：铁支 K（四条）',
    playerWins: true,
  },
  {
    label: '铁支 Q（高发大牌）',
    cards: ['♣Q', '♣Q', '♦Q', '♥Q', '♠9'],
    highlight: '扩容重牌令四条成为常见对攻牌力',
    rivalLabel: '对手亮出：五条 10（反压）',
    playerWins: false,
  },
  {
    label: '双同花重牌葫芦',
    cards: ['♥K', '♥K', '♥K', '♠7', '♠7'],
    highlight: '三张一模一样的 ♥K 组成非常规强牌',
    rivalLabel: '对手亮出：同花顺（反压）',
    playerWins: false,
  },
  {
    label: '王牌同花大顺',
    cards: ['♠10', '♠J', '♠Q', '♠K', '★王'],
    highlight: '特殊王牌补齐顶级同花大顺',
    rivalLabel: '对手亮出：五条 J',
    playerWins: true,
  },
];

function Zero100PokerDiagram() {
  const [cash, setCash] = useState<number>(2000); // 单位：万
  const [teethLeft, setTeethLeft] = useState<number>(28);
  const [pledgedTeeth, setPledgedTeeth] = useState<number>(0);
  const [handIdx, setHandIdx] = useState<number>(0);
  const [betActive, setBetActive] = useState<boolean>(false);
  const [log, setLog] = useState<string>('100 张扩容牌堆含多张重牌与特牌，大牌频出；现金打光后只能抵押真牙续命。');

  const hand = POKER_100_HANDS[handIdx % POKER_100_HANDS.length];
  const needTooth = cash <= 0;

  const dealAndShowdown = () => {
    if (needTooth) return;
    const nextIdx = (handIdx + 1) % POKER_100_HANDS.length;
    const nextHand = POKER_100_HANDS[nextIdx];
    setHandIdx(nextIdx);
    setBetActive(true);
    if (nextHand.playerWins) {
      setCash((c) => c + 1000);
      setLog(`亮牌「${nextHand.label}」力压${nextHand.rivalLabel}！赢得 1,000 万筹码。`);
    } else {
      const nextCash = Math.max(0, cash - 1000);
      setCash(nextCash);
      if (pledgedTeeth > 0 && nextCash === 0) {
        setLog(`亮牌「${nextHand.label}」遭${nextHand.rivalLabel}！抵押牙局败北，触发当场拔牙惩罚！`);
      } else if (nextCash === 0) {
        setLog(`亮牌「${nextHand.label}」不敌${nextHand.rivalLabel}！现金筹码彻底耗尽，必须抵押真牙才能续命。`);
      } else {
        setLog(`亮牌「${nextHand.label}」不敌${nextHand.rivalLabel}，损失 1,000 万筹码。`);
      }
    }
  };

  const drainCashToDemo = () => {
    setCash(0);
    setLog('现金筹码已归零！若不认输，只能点击「抵押 1 颗真牙」换取续命筹码继续梭哈。');
  };

  const pledgeTooth = () => {
    if (teethLeft <= 0) return;
    setTeethLeft((t) => t - 1);
    setPledgedTeeth((p) => p + 1);
    setCash((c) => c + 1000);
    setLog('你签下抵押契约：押上 1 颗真牙换回 1,000 万续命筹码，若再输须当场拔牙！');
  };

  const reset = () => {
    setCash(2000);
    setTeethLeft(28);
    setPledgedTeeth(0);
    setHandIdx(0);
    setBetActive(false);
    setLog('100 张扩容牌堆含多张重牌与特牌，大牌频出；现金打光后只能抵押真牙续命。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：牌堆规格 + 筹码与真牙状态 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)]">
              <Coins className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              现金：<strong className={`tabular-nums ${needTooth ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'}`}>{cash.toLocaleString()} 万</strong>
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)]">
              <Flame className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
              保住真牙：<strong className="tabular-nums">{teethLeft} 颗</strong>
              {pledgedTeeth > 0 && (
                <span className="text-[11px] text-[var(--diagram-accent)]">（已押 {pledgedTeeth} 颗）</span>
              )}
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

        {/* 52 张 vs 100 张扩容牌堆大牌概率对比 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Layers className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              100 张扩容牌堆（含同花重牌 + 王牌）大牌膨胀对比
            </span>
            <span className="text-[10.5px] text-[var(--diagram-brass)] font-semibold">铁支 / 五条高频出现</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div>
              <div className="flex justify-between text-[var(--text-secondary)] mb-0.5">
                <span>常规 52 张牌堆（铁支极罕见，无五条）</span>
                <span className="tabular-nums">约 0.02%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
                <div className="h-full w-[4%] rounded-full bg-[var(--text-muted)]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[var(--text-primary)] mb-0.5">
                <span>100 枚特殊牌堆（重牌叠加，铁支/五条常态对攻）</span>
                <span className="tabular-nums text-[var(--diagram-brass)] font-semibold">大幅飙升</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
                <div className="h-full w-[76%] rounded-full bg-[var(--diagram-brass)]" />
              </div>
            </div>
          </div>
        </div>

        {/* 梭哈手牌桌 */}
        <div className="rounded-xl bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="font-semibold text-[var(--diagram-brass)]">{hand.label}</span>
            <span className="text-[var(--text-secondary)]">{betActive ? hand.rivalLabel : hand.highlight}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {hand.cards.map((card, i) => {
              const isSpecial = card.includes('★') || card.includes('♥') || card.includes('♦');
              return (
                <div
                  key={`${card}-${i}`}
                  className={`h-14 rounded-lg border flex flex-col items-center justify-center font-bold text-[13px] tabular-nums ${
                    card.includes('★')
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)]'
                  }`}
                >
                  <span className={isSpecial ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'}>
                    {card}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 操作区：梭哈开牌 / 现金归零演示 / 抵押真牙续命 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={needTooth}
            onClick={dealAndShowdown}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            <Spade className="w-3.5 h-3.5" aria-hidden="true" />
            <span>换牌梭哈（±1000 万）</span>
          </button>

          {!needTooth ? (
            <button
              type="button"
              onClick={drainCashToDemo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[11.5px] cursor-pointer"
            >
              模拟现金耗尽
            </button>
          ) : (
            <button
              type="button"
              onClick={pledgeTooth}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[12px] font-semibold hover:opacity-90 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>抵押 1 颗真牙换 1,000 万续命</span>
            </button>
          )}
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12px] text-center font-medium border ${
            needTooth
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {log}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        100 张牌堆彻底改写了牌型概率结构；当现金筹码耗尽，赌桌还允许押上真牙续命，输掉便须当场拔牙。
      </p>
    </div>
  );
}

/* ============================================================================
 * 10. zero-beer-pour · 五秒倒啤酒
 * 5 秒倒啤酒刻度杯模拟器：倾斜急倒 / 控速收口 + 实时液面与泡沫高度 SVG
 * ========================================================================== */

const BEER_MIN_WIN = 82;
const BEER_TARGET = 85;
const BEER_MAX_WIN = 88;

function ZeroBeerPourDiagram() {
  const [elapsed, setElapsed] = useState<number>(0); // 0..5.0s (步进 0.5s)
  const [liquid, setLiquid] = useState<number>(0); // 酒液占比 %
  const [foam, setFoam] = useState<number>(0); // 泡沫占比 %
  const [tiltAngle, setTiltAngle] = useState<number>(52); // 瓶身倾角 20..85
  const [settled, setSettled] = useState<boolean>(false);

  const totalHeight = liquid + foam;
  const overflow = totalHeight > 100;
  const finished = settled || overflow || elapsed >= 5;
  const inWinZone = !overflow && totalHeight >= BEER_MIN_WIN && totalHeight <= BEER_MAX_WIN;

  const pourStep = (mode: 'fast' | 'steady' | 'fine') => {
    if (finished) return;
    const nextTime = Math.min(5, Number((elapsed + 0.5).toFixed(1)));
    // 急倒流速快但疯狂起泡；微倾收口几乎不起新泡
    const deltaLiquid = mode === 'fast' ? 14 : mode === 'steady' ? 9 : 4;
    const deltaFoam = mode === 'fast' ? 11 : mode === 'steady' ? 3.5 : 0.8;
    const nextAngle = mode === 'fast' ? 78 : mode === 'steady' ? 52 : 28;

    setTiltAngle(nextAngle);
    setElapsed(nextTime);
    setLiquid((l) => Number((l + deltaLiquid).toFixed(1)));
    setFoam((f) => Number((f + deltaFoam).toFixed(1)));
    if (nextTime >= 5) {
      setSettled(true);
    }
  };

  // 允许滑块直接体验倾角/总注量与泡沫比例关系
  const applyTiltPreview = (angle: number) => {
    setTiltAngle(angle);
    // 模拟 5 秒整瓶匀速倒完的效果：倾角越大，流速越大且起泡越多
    const factor = (angle - 20) / 65; // 0..1
    const simLiquid = Number((42 + factor * 38).toFixed(1));
    const simFoam = Number((4 + factor * factor * 36).toFixed(1));
    setElapsed(5);
    setLiquid(simLiquid);
    setFoam(simFoam);
    setSettled(true);
  };

  const reset = () => {
    setElapsed(0);
    setLiquid(0);
    setFoam(0);
    setTiltAngle(52);
    setSettled(false);
  };

  // SVG 玻璃杯内部坐标：顶部 y=24 (100%)，底部 y=154 (0%)，高度 130px
  const cupTop = 24;
  const cupHeight = 130;
  const cupBottom = cupTop + cupHeight;
  const pctToY = (pct: number) => cupBottom - (Math.min(104, Math.max(0, pct)) / 100) * cupHeight;

  const liquidTopY = pctToY(liquid);
  const totalTopY = pctToY(totalHeight);
  const winTopY = pctToY(BEER_MAX_WIN);
  const winBottomY = pctToY(BEER_MIN_WIN);
  const targetY = pctToY(BEER_TARGET);

  const resultMessage = overflow
    ? `泡沫冲破杯口（${totalHeight.toFixed(1)}% > 100%）！溢出杯口直接判定淘汰！`
    : finished
      ? inWinZone
        ? `精准卡入生死窄区间！最终总高度 ${totalHeight.toFixed(1)}%（距 85% 仅差 ${Math.abs(totalHeight - BEER_TARGET).toFixed(1)}%），稳稳压过对手！`
        : totalHeight < BEER_MIN_WIN
          ? `停手过早或流速太慢（仅 ${totalHeight.toFixed(1)}%），未达 ${BEER_MIN_WIN}% 下限判负！`
          : `总高度 ${totalHeight.toFixed(1)}% 超过 ${BEER_MAX_WIN}% 上限，偏离生死目标区间判负！`
      : `剩余 ${(5 - elapsed).toFixed(1)} 秒：点击「倾斜急倒」抢进度，临近刻度线改用「控速收口」防起泡溢出。`;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：5 秒读表与当前高度 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)]">
              <Timer className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              计时：<strong className="tabular-nums">{elapsed.toFixed(1)} / 5.0s</strong>
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)]">
              <Gauge className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              总高度：
              <strong
                className={`tabular-nums ${
                  overflow ? 'text-[var(--diagram-accent)]' : inWinZone ? 'text-[var(--diagram-brass)]' : 'text-[var(--text-primary)]'
                }`}
              >
                {totalHeight.toFixed(1)}%
              </strong>
              <span className="text-[11px] font-normal text-[var(--text-secondary)]">
                （酒 {liquid.toFixed(0)}% + 泡 {foam.toFixed(0)}%）
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重新倒酒
          </button>
        </div>

        {/* 透明刻度玻璃杯 + 瓶身倾倒 SVG */}
        <svg
          viewBox="0 0 420 174"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="五秒倒啤酒透明刻度杯与生死窄区间模拟器"
        >
          {/* 倾斜酒瓶 */}
          <g transform={`translate(108, 40) rotate(${tiltAngle - 45})`}>
            <rect
              x="-44"
              y="-12"
              width="52"
              height="24"
              rx="6"
              fill="color-mix(in srgb, var(--diagram-brass) 24%, var(--diagram-panel))"
              stroke="var(--diagram-brass)"
              strokeWidth="1.6"
            />
            <rect
              x="8"
              y="-6"
              width="20"
              height="12"
              rx="2"
              fill="var(--diagram-panel)"
              stroke="var(--diagram-brass)"
              strokeWidth="1.6"
            />
          </g>

          {/* 倒酒水流 */}
          {elapsed > 0 && !settled && !overflow && (
            <path
              d={`M 136 42 Q 168 48 188 ${Math.max(36, totalTopY)}`}
              fill="none"
              stroke="var(--diagram-brass)"
              strokeWidth={tiltAngle > 65 ? '4' : '2.2'}
              strokeDasharray="5 3"
            />
          )}

          {/* 透明玻璃杯主体 */}
          <path
            d="M 156 24 L 164 154 L 256 154 L 264 24"
            fill="var(--diagram-panel)"
            stroke="var(--text-secondary)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* 泡沫层（在酒液上方） */}
          {foam > 0 && (
            <rect
              x="164"
              y={totalTopY}
              width="92"
              height={Math.max(0, liquidTopY - totalTopY)}
              fill="color-mix(in srgb, var(--text-primary) 26%, var(--diagram-surface))"
              stroke="var(--border-hairline)"
              strokeWidth="0.8"
            />
          )}

          {/* 酒液层 */}
          {liquid > 0 && (
            <rect
              x="164"
              y={liquidTopY}
              width="92"
              height={Math.max(0, cupBottom - liquidTopY)}
              fill="color-mix(in srgb, var(--diagram-brass) 52%, var(--diagram-panel))"
            />
          )}

          {/* 溢出液滴警示 */}
          {overflow && (
            <g>
              <path
                d="M 156 24 Q 148 34 150 62"
                fill="none"
                stroke="var(--diagram-accent)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 264 24 Q 272 34 270 58"
                fill="none"
                stroke="var(--diagram-accent)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <text x="210" y="15" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--diagram-accent)">
                溢出杯口 · 立即淘汰
              </text>
            </g>
          )}

          {/* 生死目标窄区间 (82% - 88%) */}
          <rect
            x="160"
            y={winTopY}
            width="100"
            height={winBottomY - winTopY}
            fill="color-mix(in srgb, var(--diagram-brass) 22%, transparent)"
            stroke="var(--diagram-brass)"
            strokeWidth="1.2"
          />
          <line x1="154" y1={targetY} x2="274" y2={targetY} stroke="var(--diagram-brass)" strokeWidth="1.6" strokeDasharray="3 2" />

          {/* 100% 溢出红线 */}
          <line x1="152" y1={cupTop} x2="274" y2={cupTop} stroke="var(--diagram-accent)" strokeWidth="1.4" strokeDasharray="3 2" />

          {/* 右侧刻度说明 */}
          <text x="280" y={cupTop + 4} fontSize="10" fontWeight="600" fill="var(--diagram-accent)">
            100% 溢出出局
          </text>
          <text x="280" y={targetY + 3.5} fontSize="10.5" fontWeight="700" fill="var(--diagram-brass)">
            82–88% 生死获胜区
          </text>
          <text x="280" y={pctToY(50) + 3.5} fontSize="10" fill="var(--text-secondary)">
            50% 刻度线
          </text>

          {/* 左侧倾角标注 */}
          <text x="86" y="102" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
            瓶身倾角
          </text>
          <text x="86" y="118" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--diagram-brass)">
            {tiltAngle}°
          </text>
        </svg>

        {/* 分步控速按钮（每次 0.5 秒） */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            disabled={finished}
            onClick={() => pourStep('fast')}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[11.5px] font-semibold disabled:opacity-40 cursor-pointer"
          >
            <Beer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>倾斜急倒</span>
          </button>
          <button
            type="button"
            disabled={finished}
            onClick={() => pourStep('steady')}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[11.5px] font-semibold disabled:opacity-40 cursor-pointer"
          >
            <span>中速稳倒</span>
          </button>
          <button
            type="button"
            disabled={finished}
            onClick={() => pourStep('fine')}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))] text-[var(--diagram-brass)] text-[11.5px] font-semibold disabled:opacity-40 cursor-pointer"
          >
            <span>控速收口</span>
          </button>
          <button
            type="button"
            disabled={finished || elapsed === 0}
            onClick={() => setSettled(true)}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] text-[11.5px] font-semibold disabled:opacity-40 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            <span>停手测量</span>
          </button>
        </div>

        {/* 倾倒速度对比滑块 */}
        <label className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2 flex flex-col gap-1 text-[11.5px]">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[var(--text-primary)]">或直接拖动 5 秒倾倒角度预演起泡曲线</span>
            <span className="tabular-nums font-semibold text-[var(--diagram-brass)]">{tiltAngle}°</span>
          </div>
          <input
            type="range"
            min={20}
            max={85}
            value={tiltAngle}
            onChange={(e) => applyTiltPreview(Number(e.target.value))}
            className="w-full accent-[var(--diagram-brass)] cursor-pointer"
          />
        </label>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12px] text-center font-medium border ${
            overflow || (finished && !inWinZone)
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : inWinZone && finished
                ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {resultMessage}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        限时极短且泡沫随倾倒速度非线性膨胀；前段急倒抢时间、末段收口压泡沫，才能把总高度卡进生死窄线。
      </p>
    </div>
  );
}

/* ============================================================================
 * 统一映射导出（覆盖《赌博霸王传 零》全部 10 场赌局）
 * ========================================================================== */

export const ZERO_DIAGRAMS: Record<string, ComponentType> = {
  'zero-ring-drop': ZeroRingDropDiagram,
  'zero-jack-room': ZeroJackRoomDiagram,
  'zero-quarter-jump': ZeroQuarterJumpDiagram,
  'zero-triangle-room': ZeroTriangleRoomDiagram,
  'zero-anchor-room': ZeroAnchorRoomDiagram,
  'zero-witch-mansion': ZeroWitchMansionDiagram,
  'zero-lost-ring': ZeroLostRingDiagram,
  'zero-morning-golf': ZeroMorningGolfDiagram,
  'zero-100-poker': Zero100PokerDiagram,
  'zero-beer-pour': ZeroBeerPourDiagram,
};
