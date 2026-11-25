import { useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  Banknote,
  Box,
  Car,
  Droplet,
  Ear,
  Eye,
  EyeOff,
  Gauge,
  Hand,
  RotateCcw,
  Shield,
  Skull,
  Swords,
  Syringe,
  TrendingUp,
  Volume2,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 1. akagi-chicken-run · 悬崖飞车试胆                                         */
/* -------------------------------------------------------------------------- */

function ChickenRunDiagram() {
  // distance: 离悬崖边缘米数 (100m -> 0m)
  const [distance, setDistance] = useState<number>(62);
  const [playerAction, setPlayerAction] = useState<'driving' | 'braked' | 'jumped'>('driving');

  // 对手心理底线设在 14m：当己方持续死踩油门逼近至 <= 14m 且未减速时，对手率先踩刹认输
  const OPPONENT_BAIL_AT = 14;

  const isFallen = playerAction === 'driving' && distance === 0;
  const opponentBailed = playerAction === 'driving' && distance <= OPPONENT_BAIL_AT && distance > 0;
  const playerLost = playerAction === 'braked' || playerAction === 'jumped';

  // 将距离 (100m..0m) 映射为 SVG x 坐标 (44..326，崖边在 334)
  const mapDistToX = (d: number) => 44 + ((100 - d) / 100) * 282;
  const playerX = isFallen ? 356 : mapDistToX(distance);
  const opponentDist = opponentBailed ? OPPONENT_BAIL_AT : Math.max(distance, OPPONENT_BAIL_AT);
  const opponentX = mapDistToX(opponentDist);
  const speedKmh = playerLost ? 0 : Math.min(130, 58 + Math.round(((100 - distance) / 100) * 72));

  const pushForward = () => {
    if (playerLost || isFallen) return;
    setDistance((prev) => Math.max(0, prev - 14));
  };

  const handleBrake = () => {
    if (isFallen || opponentBailed) return;
    setPlayerAction('braked');
  };

  const handleJump = () => {
    if (isFallen || opponentBailed) return;
    setPlayerAction('jumped');
  };

  const reset = () => {
    setDistance(62);
    setPlayerAction('driving');
  };

  const statusMessage = isFallen
    ? '离崖 0m 仍未减速！车辆冲出绝壁坠入深海。'
    : playerAction === 'braked'
      ? `己方在距崖 ${distance}m 处率先踩下刹车，胆量试探即刻判负！`
      : playerAction === 'jumped'
        ? `己方在距崖 ${distance}m 处拉门跳车逃生，即刻判负！`
        : opponentBailed
          ? `死踩油门压至 ${distance}m！对手在 ${OPPONENT_BAIL_AT}m 处率先踩刹认输，但前方已是绝壁边缘。`
          : distance <= 30
            ? `距绝壁仅剩 ${distance}m，刹车安全区已极度收窄，双方仍在死拼心理极限！`
            : '两车并排全速逼近海边悬崖：拖动滑块或死踩油门压低距离，也可随时踩刹/跳车。';

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <Gauge className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            <span>
              距绝壁{' '}
              <strong
                className={`tabular-nums ${
                  distance <= 20 || isFallen ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                }`}
              >
                {distance} m
              </strong>
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="tabular-nums text-[var(--text-secondary)]">时速 {speedKmh} km/h</span>
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置起点
          </button>
        </div>

        {/* 双车直道与海边绝壁剖面 SVG */}
        <svg
          viewBox="0 0 420 132"
          className="w-full max-w-[460px] mx-auto h-auto block select-none"
          role="img"
          aria-label="两车并排沿直道冲向海边悬崖"
        >
          {/* 悬崖危险红区 */}
          <rect
            x={mapDistToX(25)}
            y="18"
            width={334 - mapDistToX(25)}
            height="72"
            fill="color-mix(in srgb, var(--diagram-accent) 12%, transparent)"
          />

          {/* 直道与绝壁地形 */}
          <path
            d="M 16 90 L 334 90 L 344 122 L 16 122 Z"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="1.5"
          />
          {/* 车道分隔虚线 */}
          <line
            x1="22"
            y1="54"
            x2="332"
            y2="54"
            stroke="var(--diagram-border)"
            strokeWidth="1.2"
            strokeDasharray="6 5"
          />
          {/* 崖边警戒竖线 */}
          <line
            x1="334"
            y1="14"
            x2="334"
            y2="92"
            stroke="var(--diagram-accent)"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <text x="334" y="11" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--diagram-accent)">
            0m 绝壁
          </text>

          {/* 距离标尺 */}
          {[100, 60, 30].map((m) => (
            <g key={m} transform={`translate(${mapDistToX(m)}, 90)`}>
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--text-muted)" strokeWidth="1.2" />
              <text x="0" y="18" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
                {m}m
              </text>
            </g>
          ))}

          {/* 海浪 */}
          <path
            d="M 340 112 Q 352 106 364 112 T 388 112 T 412 112"
            fill="none"
            stroke="var(--diagram-brass)"
            strokeWidth="1.5"
            opacity="0.7"
          />
          <path
            d="M 344 120 Q 356 115 368 120 T 392 120 T 414 120"
            fill="none"
            stroke="var(--diagram-border)"
            strokeWidth="1.3"
          />
          <text x="380" y="102" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
            深海
          </text>

          {/* 上车道：对手车辆 */}
          <g transform={`translate(${opponentX}, 34)`}>
            {opponentBailed ? (
              <line x1="-42" y1="9" x2="-16" y2="9" stroke="var(--diagram-accent)" strokeWidth="2" strokeDasharray="3 2" />
            ) : (
              <line x1="-34" y1="3" x2="-18" y2="3" stroke="var(--diagram-brass)" strokeWidth="1.4" opacity="0.6" />
            )}
            <rect
              x="-16"
              y="-6"
              width="32"
              height="14"
              rx="3.5"
              fill="color-mix(in srgb, var(--diagram-brass) 24%, var(--diagram-panel))"
              stroke="var(--diagram-brass)"
              strokeWidth="1.6"
            />
            <circle cx="-9" cy="9" r="3" fill="var(--diagram-surface)" stroke="var(--diagram-brass)" strokeWidth="1.4" />
            <circle cx="9" cy="9" r="3" fill="var(--diagram-surface)" stroke="var(--diagram-brass)" strokeWidth="1.4" />
            <text x="0" y="-10" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--diagram-brass)">
              {opponentBailed ? '对手急刹认输' : '对手车'}
            </text>
          </g>

          {/* 下车道：己方车辆 */}
          <g
            transform={
              isFallen
                ? `translate(${playerX}, 84) rotate(38)`
                : `translate(${playerX}, 72)`
            }
          >
            {playerAction === 'braked' && (
              <line x1="-46" y1="9" x2="-16" y2="9" stroke="var(--diagram-accent)" strokeWidth="2.2" />
            )}
            {playerAction === 'driving' && !isFallen && (
              <>
                <line x1="-38" y1="0" x2="-20" y2="0" stroke="var(--diagram-accent)" strokeWidth="1.5" opacity="0.7" />
                <line x1="-30" y1="6" x2="-18" y2="6" stroke="var(--diagram-accent)" strokeWidth="1.2" opacity="0.5" />
              </>
            )}
            <rect
              x="-16"
              y="-6"
              width="32"
              height="14"
              rx="3.5"
              fill="color-mix(in srgb, var(--diagram-accent) 24%, var(--diagram-panel))"
              stroke="var(--diagram-accent)"
              strokeWidth="1.6"
            />
            <circle cx="-9" cy="9" r="3" fill="var(--diagram-surface)" stroke="var(--diagram-accent)" strokeWidth="1.4" />
            <circle cx="9" cy="9" r="3" fill="var(--diagram-surface)" stroke="var(--diagram-accent)" strokeWidth="1.4" />
            {playerAction === 'jumped' && (
              <text x="-22" y="-10" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--diagram-accent)">
                跳车!
              </text>
            )}
            {playerAction !== 'jumped' && (
              <text x="0" y="-10" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-primary)">
                {isFallen ? '坠海' : playerAction === 'braked' ? '急刹判负' : '己方车'}
              </text>
            )}
          </g>
        </svg>

        {/* 距离滑块（向右拖动逼近悬崖） */}
        <label className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5 flex flex-col gap-1.5 text-[12px]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--text-primary)]">推进离崖距离（100m → 0m）</span>
            <span className="tabular-nums font-semibold text-[var(--diagram-accent)]">剩余 {distance} m</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={100 - distance}
            onChange={(e) => {
              setPlayerAction('driving');
              setDistance(100 - Number(e.target.value));
            }}
            className="w-full accent-[var(--diagram-accent)] cursor-pointer"
          />
        </label>

        {/* 操控按钮组 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={playerLost || isFallen}
            onClick={pushForward}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] hover:opacity-90 disabled:opacity-45 cursor-pointer"
          >
            <Car className="w-3.5 h-3.5" aria-hidden="true" />
            死踩油门（逼近 14m）
          </button>
          <button
            type="button"
            disabled={playerLost || isFallen || opponentBailed}
            onClick={handleBrake}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)] hover:opacity-90 disabled:opacity-45 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            踩刹车（即刻判负）
          </button>
          <button
            type="button"
            disabled={playerLost || isFallen || opponentBailed}
            onClick={handleJump}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-accent)] disabled:opacity-45 cursor-pointer"
          >
            拉门跳车（即刻判负）
          </button>
        </div>

        <p
          className={`text-[12px] text-center font-medium ${
            isFallen || playerLost
              ? 'text-[var(--diagram-accent)]'
              : opponentBailed
                ? 'text-[var(--diagram-brass)]'
                : 'text-[var(--text-secondary)]'
          }`}
        >
          {statusMessage}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        两车沿通往绝壁的直道并排全速冲刺，中途不得变道，先踩刹车或先跳车逃生的一方直接落败。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. akagi-ryuzaki · 龙崎初战                                                 */
/* -------------------------------------------------------------------------- */

type RyuzakiStrategy = 'conservative' | 'disrupt';

const RYUZAKI_STEPS: Record<
  RyuzakiStrategy,
  Array<{
    turnLabel: string;
    discardTile: string;
    discardNote: string;
    feedIntact: boolean;
    heroPoints: number;
    ryuzakiPoints: number;
    summary: string;
  }>
> = {
  conservative: [
    {
      turnLabel: '接手残局',
      discardTile: '北',
      discardNote: '只切熟张安全牌',
      feedIntact: true,
      heroPoints: 4200,
      ryuzakiPoints: 41800,
      summary: '南乡点棒见底并押上性命；龙崎两名亲信一左一右就位，准备连续喂牌封杀。',
    },
    {
      turnLabel: '第 1 局推进',
      discardTile: '西',
      discardNote: '缩手防守，任由上家喂牌',
      feedIntact: true,
      heroPoints: 2200,
      ryuzakiPoints: 47800,
      summary: '亲信甲精准切出龙崎急需的搭子，龙崎轻松鸣牌听张，代打席被连庄压榨点棒。',
    },
    {
      turnLabel: '第 2 局推进',
      discardTile: '九万',
      discardNote: '被彻底锁死进张',
      feedIntact: true,
      heroPoints: 0,
      ryuzakiPoints: 55800,
      summary: '敌方三人合谋节奏丝毫未乱，南乡残余点棒被清零击飞，局面彻底失守。',
    },
  ],
  disrupt: [
    {
      turnLabel: '接手残局',
      discardTile: '五万',
      discardNote: '反常识直切生张中筋',
      feedIntact: false,
      heroPoints: 4200,
      ryuzakiPoints: 41800,
      summary: '放弃常规保守打法，主动打出令人费解的危险中张，迫使龙崎重新评估手牌深浅。',
    },
    {
      turnLabel: '第 1 局推进',
      discardTile: '红中',
      discardNote: '打乱鸣牌与喂牌顺位',
      feedIntact: false,
      heroPoints: 22200,
      ryuzakiPoints: 31800,
      summary: '亲信甲的喂牌链被中途截断，龙崎误判大牌听口不敢轻举妄动，代打席趁势直击满贯。',
    },
    {
      turnLabel: '第 2 局推进',
      discardTile: '四索',
      discardNote: '孤注一掷逆向听牌',
      feedIntact: false,
      heroPoints: 44200,
      ryuzakiPoints: 23800,
      summary: '敌方合谋阵型瓦解，代打席连续反攻，点棒一举反超龙崎稳住危局。',
    },
  ],
};

function RyuzakiDiagram() {
  const [strategy, setStrategy] = useState<RyuzakiStrategy>('conservative');
  const [step, setStep] = useState<number>(1);

  const steps = RYUZAKI_STEPS[strategy];
  const current = steps[step];
  const heroLeading = current.heroPoints > current.ryuzakiPoints;

  const switchStrategy = (next: RyuzakiStrategy) => {
    setStrategy(next);
    setStep(1);
  };

  const maxPoints = 60000;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 策略切换与巡目推进 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-0.5 text-[12px]">
            <button
              type="button"
              aria-pressed={strategy === 'conservative'}
              onClick={() => switchStrategy('conservative')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
                strategy === 'conservative'
                  ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              保守防守
            </button>
            <button
              type="button"
              aria-pressed={strategy === 'disrupt'}
              onClick={() => switchStrategy('disrupt')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
                strategy === 'disrupt'
                  ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Swords className="w-3.5 h-3.5" aria-hidden="true" />
              逆向舍牌破局
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 text-[11.5px]">
            {steps.map((item, idx) => (
              <button
                key={item.turnLabel}
                type="button"
                aria-pressed={step === idx}
                onClick={() => setStep(idx)}
                className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer border transition-colors ${
                  step === idx
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--text-primary)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.turnLabel}
              </button>
            ))}
          </div>
        </div>

        {/* 牌桌合谋喂牌与破局示意图 SVG */}
        <svg
          viewBox="0 0 420 154"
          className="w-full max-w-[450px] mx-auto h-auto block select-none"
          role="img"
          aria-label="四人麻将桌：龙崎与两名亲信暗中喂牌示意"
        >
          {/* 麻将桌面 */}
          <rect
            x="92"
            y="34"
            width="236"
            height="86"
            rx="10"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="1.5"
          />

          {/* 顶部：龙崎（组长） */}
          <rect
            x="156"
            y="6"
            width="108"
            height="24"
            rx="6"
            fill="color-mix(in srgb, var(--diagram-accent) 16%, var(--diagram-panel))"
            stroke="var(--diagram-accent)"
            strokeWidth="1.4"
          />
          <text x="210" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">
            龙崎（对家）
          </text>

          {/* 左侧：亲信甲 */}
          <rect
            x="8"
            y="58"
            width="74"
            height="38"
            rx="6"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="1.4"
          />
          <text x="45" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-primary)">
            亲信甲
          </text>
          <text x="45" y="89" textAnchor="middle" fontSize="9.5" fill="var(--text-secondary)">
            暗中喂牌
          </text>

          {/* 右侧：亲信乙 */}
          <rect
            x="338"
            y="58"
            width="74"
            height="38"
            rx="6"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="1.4"
          />
          <text x="375" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-primary)">
            亲信乙
          </text>
          <text x="375" y="89" textAnchor="middle" fontSize="9.5" fill="var(--text-secondary)">
            控张掩护
          </text>

          {/* 底部：代打席（接手南乡） */}
          <rect
            x="148"
            y="124"
            width="124"
            height="24"
            rx="6"
            fill="color-mix(in srgb, var(--diagram-brass) 20%, var(--diagram-panel))"
            stroke="var(--diagram-brass)"
            strokeWidth="1.5"
          />
          <text x="210" y="140" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-primary)">
            代打席（接手南乡）
          </text>

          {/* 喂牌暗线：亲信甲 -> 龙崎 / 亲信乙 -> 龙崎 */}
          <path
            d="M 84 68 Q 124 38 156 26"
            fill="none"
            stroke={current.feedIntact ? 'var(--diagram-accent)' : 'var(--text-muted)'}
            strokeWidth={current.feedIntact ? '2' : '1.4'}
            strokeDasharray={current.feedIntact ? '5 3' : '3 4'}
          />
          <path
            d="M 336 68 Q 296 38 264 26"
            fill="none"
            stroke={current.feedIntact ? 'var(--diagram-accent)' : 'var(--text-muted)'}
            strokeWidth={current.feedIntact ? '2' : '1.4'}
            strokeDasharray={current.feedIntact ? '5 3' : '3 4'}
          />

          {/* 喂牌状态标签 */}
          <text
            x="118"
            y="54"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={current.feedIntact ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
          >
            {current.feedIntact ? '连续喂牌' : '× 喂牌中断'}
          </text>
          <text
            x="302"
            y="54"
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={current.feedIntact ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
          >
            {current.feedIntact ? '夹击压制' : '× 节奏错乱'}
          </text>

          {/* 桌面中央：当前关键舍牌 */}
          <g transform="translate(210, 77)">
            <rect
              x="-24"
              y="-18"
              width="48"
              height="36"
              rx="5"
              fill="var(--diagram-surface)"
              stroke={current.feedIntact ? 'var(--diagram-border)' : 'var(--diagram-brass)'}
              strokeWidth="1.8"
            />
            <text x="0" y="4" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-primary)">
              {current.discardTile}
            </text>
            <text x="0" y="31" textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
              {current.discardNote}
            </text>
          </g>
        </svg>

        {/* 残局点棒实时对比 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">代打席点棒（南乡残局）</span>
              <span
                className={`tabular-nums font-bold ${
                  current.heroPoints <= 4200
                    ? 'text-[var(--diagram-accent)]'
                    : heroLeading
                      ? 'text-[var(--diagram-brass)]'
                      : 'text-[var(--text-primary)]'
                }`}
              >
                {current.heroPoints.toLocaleString()} 点
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (current.heroPoints / maxPoints) * 100)}%` }}
                className={`h-full rounded-full transition-all ${
                  current.heroPoints <= 4200 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                }`}
              />
            </div>
          </div>

          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">龙崎点棒（组长席）</span>
              <span className="tabular-nums font-bold text-[var(--text-primary)]">
                {current.ryuzakiPoints.toLocaleString()} 点
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (current.ryuzakiPoints / maxPoints) * 100)}%` }}
                className="h-full rounded-full bg-[var(--diagram-accent)] transition-all"
              />
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[var(--text-secondary)] text-center">{current.summary}</p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        桌旁无中立裁判，龙崎与两名亲信暗中喂牌施压；只有打破敌方喂牌节奏，才能在点棒见底前实现反超。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. akagi-yagi · 矢木代打战                                                  */
/* -------------------------------------------------------------------------- */

function YagiDiagram() {
  const [catchSwap, setCatchSwap] = useState<boolean>(false);
  const [breakSignal, setBreakSignal] = useState<boolean>(false);
  const [finalPush, setFinalPush] = useState<boolean>(false);

  // 南乡前局累积欠债 + 当前落后，最后半庄需净追 48,000 点才能填平并反超
  const TARGET_DEFICIT = 48000;
  const swapDelta = catchSwap ? 24000 : -12000;
  const signalDelta = breakSignal ? 18000 : -8000;
  const pushDelta = finalPush ? (catchSwap && breakSignal ? 16000 : 6000) : 0;

  const netRecovered = Math.max(0, 12000 + swapDelta + signalDelta + pushDelta);
  const gapRemaining = TARGET_DEFICIT - netRecovered;
  const clearedDebt = gapRemaining <= 0;
  const progressPct = Math.min(100, Math.round((netRecovered / TARGET_DEFICIT) * 100));

  const reset = () => {
    setCatchSwap(false);
    setBreakSignal(false);
    setFinalPush(false);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            最后半庄追分条 · 需填平前债{' '}
            <strong className="tabular-nums text-[var(--diagram-accent)]">
              {TARGET_DEFICIT.toLocaleString()}
            </strong>{' '}
            点
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置局面
          </button>
        </div>

        {/* 点棒分差填坑进度条 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="text-[var(--text-secondary)]">
              本半庄已追回：
              <strong className="ml-1 tabular-nums text-[var(--text-primary)]">
                +{netRecovered.toLocaleString()} 点
              </strong>
            </span>
            <span
              className={`tabular-nums font-bold ${
                clearedDebt ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
              }`}
            >
              {clearedDebt
                ? `已填平前债并反超 +${Math.abs(gapRemaining).toLocaleString()} 点`
                : `尚缺 ${gapRemaining.toLocaleString()} 点填平欠款`}
            </span>
          </div>

          <div className="relative h-7 rounded-full bg-[var(--diagram-surface)] border border-[var(--diagram-border)] overflow-hidden">
            <div
              style={{ width: `${progressPct}%` }}
              className={`h-full transition-all ${
                clearedDebt
                  ? 'bg-[var(--diagram-brass)]'
                  : 'bg-[color-mix(in_srgb,var(--diagram-accent)_65%,var(--diagram-panel))]'
              }`}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-[var(--text-primary)]">
              填坑进度 {progressPct}%（{netRecovered.toLocaleString()} / {TARGET_DEFICIT.toLocaleString()} 点）
            </span>
          </div>
        </div>

        {/* 地下麻将暗招反制互动开关 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={catchSwap}
            onClick={() => setCatchSwap((v) => !v)}
            className={`rounded-lg p-3 text-left border transition-all cursor-pointer space-y-1.5 ${
              catchSwap
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                : 'border-[var(--diagram-accent)]/60 bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="flex items-center justify-between text-[12.5px] font-semibold">
              <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)]">
                <Hand className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                捉拿隐秘换牌
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  catchSwap
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                }`}
              >
                {catchSwap ? '已识破反制' : '未防备 (-12,000)'}
              </span>
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
              {catchSwap
                ? '盯住矢木理牌时的藏牌手势并反向设套，迫使对手放铳直击（+24,000 点）。'
                : '无裁判干预，对手借摸打间隙偷换听张，我方反遭截胡失血。'}
            </p>
          </button>

          <button
            type="button"
            aria-pressed={breakSignal}
            onClick={() => setBreakSignal((v) => !v)}
            className={`rounded-lg p-3 text-left border transition-all cursor-pointer space-y-1.5 ${
              breakSignal
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                : 'border-[var(--diagram-accent)]/60 bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="flex items-center justify-between text-[12.5px] font-semibold">
              <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)]">
                <Eye className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                破除桌下暗号
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  breakSignal
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                }`}
              >
                {breakSignal ? '已反向诱导' : '遭暗号泄密 (-8,000)'}
              </span>
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
              {breakSignal
                ? '识破旁观者传递手牌的暗语节奏，故意露出假听诱出高番牌（+18,000 点）。'
                : '桌外同伙暗打手势报牌，矢木精准兜牌避险，根本追不回分差。'}
            </p>
          </button>
        </div>

        {/* 南四局终盘冲刺按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5">
          <span className="text-[12px] text-[var(--text-secondary)]">
            {clearedDebt
              ? '两项暗招悉数化解，最后半庄连本带利填平巨坑！'
              : '提示：仅凭正常摸打难以填平前债，须同时反制换牌与暗号并完成终盘直击。'}
          </span>
          <button
            type="button"
            aria-pressed={finalPush}
            onClick={() => setFinalPush((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer shrink-0 transition-colors ${
              finalPush
                ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                : 'border border-[var(--diagram-brass)] text-[var(--diagram-brass)] bg-[var(--diagram-surface)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            {finalPush ? '已打出终盘直击' : '发动南四局直击'}
          </button>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        代打入座时已背负巨额前债且仅剩最后半庄，必须自行揪出偷换牌与桌下暗号，方有翻盘筹码。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. akagi-ichikawa · 市川盲牌死斗                                            */
/* -------------------------------------------------------------------------- */

function IchikawaDiagram() {
  const [tactic, setTactic] = useState<'visual' | 'acoustic'>('visual');
  const [penaltyCount, setPenaltyCount] = useState<number>(0);

  const baseScore = tactic === 'acoustic' ? 38000 : 19000;
  const penaltyLoss = penaltyCount * 12000;
  const currentScore = Math.max(0, baseScore - penaltyLoss);
  const isTrapWorking = tactic === 'acoustic' && penaltyCount === 0;

  const reset = () => {
    setTactic('visual');
    setPenaltyCount(0);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：策略切换 + 重置 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-0.5 text-[12px]">
            <button
              type="button"
              aria-pressed={tactic === 'visual'}
              onClick={() => setTactic('visual')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
                tactic === 'visual'
                  ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
              常规隐藏舍牌
            </button>
            <button
              type="button"
              aria-pressed={tactic === 'acoustic'}
              onClick={() => setTactic('acoustic')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
                tactic === 'acoustic'
                  ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              反向制造听觉假象
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

        {/* 声波与指尖触觉感知牌桌 SVG */}
        <svg
          viewBox="0 0 420 138"
          className="w-full max-w-[450px] mx-auto h-auto block select-none"
          role="img"
          aria-label="盲眼雀士靠声响与指尖摸牌判断牌势"
        >
          {/* 顶部：市川（听觉 + 指尖触觉） */}
          <rect
            x="130"
            y="8"
            width="160"
            height="32"
            rx="8"
            fill="var(--diagram-panel)"
            stroke={tactic === 'visual' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
            strokeWidth="1.6"
          />
          <text x="210" y="22" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="var(--text-primary)">
            市川（双目失明）
          </text>
          <text x="210" y="35" textAnchor="middle" fontSize="9.5" fill="var(--text-secondary)">
            指尖摸牌 · 听声辨牌山与停顿
          </text>

          {/* 声波传导弧线 */}
          <path
            d="M 150 92 Q 210 64 270 92"
            fill="none"
            stroke={tactic === 'visual' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
            strokeWidth="1.6"
            strokeDasharray={tactic === 'visual' ? 'none' : '4 3'}
          />
          <path
            d="M 168 78 Q 210 54 252 78"
            fill="none"
            stroke={tactic === 'visual' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
            strokeWidth="1.5"
            opacity="0.75"
            strokeDasharray={tactic === 'visual' ? 'none' : '4 3'}
          />
          <path
            d="M 186 64 Q 210 46 234 64"
            fill="none"
            stroke={tactic === 'visual' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
            strokeWidth="1.4"
            opacity="0.55"
          />

          {/* 左侧：声音线索 */}
          <rect
            x="14"
            y="54"
            width="114"
            height="42"
            rx="7"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="1.2"
          />
          <text x="71" y="71" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-primary)">
            {tactic === 'visual' ? '理牌清脆响声' : '刻意打乱理牌声'}
          </text>
          <text
            x="71"
            y="86"
            textAnchor="middle"
            fontSize="9.5"
            fill={tactic === 'visual' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
          >
            {tactic === 'visual' ? '暴露手牌排列位置' : '隐藏真实听牌范围'}
          </text>

          {/* 右侧：摸打节奏线索 */}
          <rect
            x="292"
            y="54"
            width="114"
            height="42"
            rx="7"
            fill="var(--diagram-panel)"
            stroke="var(--diagram-border)"
            strokeWidth="1.2"
          />
          <text x="349" y="71" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text-primary)">
            {tactic === 'visual' ? '摸打微停 0.7s' : '假意停顿切出诱张'}
          </text>
          <text
            x="349"
            y="86"
            textAnchor="middle"
            fontSize="9.5"
            fill={tactic === 'visual' ? 'var(--diagram-accent)' : 'var(--diagram-brass)'}
          >
            {tactic === 'visual' ? '被彻底听穿并兜牌' : '诱使市川误判放铳'}
          </text>

          {/* 底部：己方出牌槽 */}
          <rect
            x="126"
            y="104"
            width="168"
            height="26"
            rx="6"
            fill="color-mix(in srgb, var(--diagram-brass) 16%, var(--diagram-panel))"
            stroke="var(--diagram-brass)"
            strokeWidth="1.4"
          />
          <text x="210" y="121" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-primary)">
            {tactic === 'visual' ? '视觉假动作（对盲者无效）' : '听觉陷阱（反制听声读牌）'}
          </text>
        </svg>

        {/* 声学对抗说明 + 误鸣/错牌罚符模拟 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Ear className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              <span>当前牌桌判定</span>
            </div>
            <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
              {tactic === 'visual'
                ? '单靠表情克制与视觉隐藏毫无意义，市川仅凭洗牌、理牌与切牌声响便精准听穿了听口。'
                : '主动控制放牌力度与停顿节奏，反向输入虚假声学情报，成功把盲眼代打引入听牌陷阱。'}
            </p>
          </div>

          <div
            className={`rounded-lg p-3 border space-y-2 ${
              penaltyCount > 0
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-accent)]">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                高压罚符检验
              </span>
              <span className="tabular-nums font-bold text-[var(--text-primary)]">
                筹码 {currentScore.toLocaleString()} 点
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--text-secondary)]">
                {penaltyCount > 0
                  ? `已触发 ${penaltyCount} 次错牌罚符（-${penaltyLoss.toLocaleString()} 点）`
                  : '误鸣或错牌将立即扣除 12,000 点'}
              </span>
              <button
                type="button"
                onClick={() => setPenaltyCount((c) => Math.min(3, c + 1))}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--diagram-accent)] text-[var(--accent-fg)] hover:opacity-90 cursor-pointer shrink-0"
              >
                模拟误鸣/错牌
              </button>
            </div>
          </div>
        </div>

        <p
          className={`text-[12px] text-center font-medium ${
            penaltyCount > 0
              ? 'text-[var(--diagram-accent)]'
              : isTrapWorking
                ? 'text-[var(--diagram-brass)]'
                : 'text-[var(--text-secondary)]'
          }`}
        >
          {penaltyCount > 0
            ? '高额罚符瞬间打穿点数防线——高压盲战中容不得半次误鸣或错牌！'
            : isTrapWorking
              ? '听觉假象生效且零失误，成功反转信息劣势。'
              : '切换至「反向制造听觉假象」，看看如何反过来利用市川的听觉优势。'}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        盲眼代打不依赖视觉而是靠声响与触觉掌握全场，同时任何误鸣或错牌都会立刻招致重额罚符。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. akagi-urabe · 浦部高倍率对决                                             */
/* -------------------------------------------------------------------------- */

const URABE_HANDS = [
  { label: '3,900 点（小和）', points: 3900 },
  { label: '8,000 点（满贯）', points: 8000 },
  { label: '12,000 点（跳满）', points: 12000 },
  { label: '16,000 点（倍满）', points: 16000 },
];

function UrabeDiagram() {
  const [multiplier, setMultiplier] = useState<1 | 2 | 4>(1);
  const [handPoints, setHandPoints] = useState<number>(12000);
  const [winner, setWinner] = useState<'self' | 'urabe'>('self');

  // 接手时前段已落后 24,000 点（按初期 1x = 每 1,000 点 10 万日元，计 -240 万日元）
  const BASE_RATE_WAN = 10; // 每 1,000 点基础 10 万日元
  const INITIAL_DEBT_WAN = 240;
  const currentRateWan = BASE_RATE_WAN * multiplier;
  const handCashWan = Math.round((handPoints / 1000) * currentRateWan);
  const netCashWan = winner === 'self' ? handCashWan - INITIAL_DEBT_WAN : -(INITIAL_DEBT_WAN + handCashWan);
  const turnedAround = netCashWan > 0;

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 中途倍率翻倍器：1x -> 2x -> 4x */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Banknote className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              中途倍率加码（双方同意即可翻倍）
            </span>
            <span className="tabular-nums text-[var(--diagram-brass)] font-semibold">
              当前单价：{currentRateWan} 万日元 / 1,000 点
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 4] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={multiplier === m}
                onClick={() => setMultiplier(m)}
                className={`rounded-lg px-3 py-2.5 text-center border transition-all cursor-pointer ${
                  multiplier === m
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--text-primary)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="text-[16px] font-bold tabular-nums leading-none">{m}× 倍率</div>
                <div className="mt-1 text-[11px] tabular-nums">{BASE_RATE_WAN * m} 万 / 千点</div>
              </button>
            ))}
          </div>
        </div>

        {/* 胡牌番数与和牌方选择 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <span className="font-semibold text-[var(--text-primary)] block">选择终盘一手胡牌点数</span>
            <div className="grid grid-cols-2 gap-1.5">
              {URABE_HANDS.map((h) => (
                <button
                  key={h.points}
                  type="button"
                  aria-pressed={handPoints === h.points}
                  onClick={() => setHandPoints(h.points)}
                  className={`px-2 py-1.5 rounded-md text-[11.5px] font-medium border cursor-pointer transition-colors ${
                    handPoints === h.points
                      ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2">
            <span className="font-semibold text-[var(--text-primary)] block">选择该手直击胜方</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                aria-pressed={winner === 'self'}
                onClick={() => setWinner('self')}
                className={`px-2.5 py-2 rounded-md text-[12px] font-semibold border cursor-pointer transition-colors ${
                  winner === 'self'
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] text-[var(--text-primary)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                己方直击反攻
              </button>
              <button
                type="button"
                aria-pressed={winner === 'urabe'}
                onClick={() => setWinner('urabe')}
                className={`px-2.5 py-2 rounded-md text-[12px] font-semibold border cursor-pointer transition-colors ${
                  winner === 'urabe'
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-surface))] text-[var(--diagram-accent)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                }`}
              >
                对手再和一局
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              翻倍是双刃剑：既能一手翻盘，也会令放铳代价成倍扩大。
            </p>
          </div>
        </div>

        {/* 点棒 -> 现金实时交割结算器 */}
        <div
          className={`rounded-lg p-3.5 border space-y-2.5 ${
            turnedAround
              ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))]'
              : 'border-[var(--diagram-accent)]/70 bg-[var(--diagram-panel)]'
          }`}
        >
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-2">
              <div className="text-[10.5px] text-[var(--text-secondary)]">接手前落后债务</div>
              <div className="mt-0.5 text-[14px] font-bold tabular-nums text-[var(--diagram-accent)]">
                -{INITIAL_DEBT_WAN} 万
              </div>
            </div>
            <div className="rounded-md bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-2">
              <div className="text-[10.5px] text-[var(--text-secondary)]">本手现结波动 ({multiplier}×)</div>
              <div
                className={`mt-0.5 text-[14px] font-bold tabular-nums ${
                  winner === 'self' ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
                }`}
              >
                {winner === 'self' ? '+' : '-'}
                {handCashWan} 万
              </div>
            </div>
            <div className="rounded-md bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-2">
              <div className="text-[10.5px] text-[var(--text-secondary)]">半庄当场净结</div>
              <div
                className={`mt-0.5 text-[14px] font-bold tabular-nums ${
                  turnedAround ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'
                }`}
              >
                {netCashWan >= 0 ? `+${netCashWan}` : netCashWan} 万
              </div>
            </div>
          </div>

          <p className="text-[12px] text-center font-medium text-[var(--text-primary)]">
            {turnedAround
              ? `在 ${multiplier}× 倍率下仅凭一手 ${handPoints.toLocaleString()} 点直击，净赢 ${netCashWan} 万日元，反手令对手无力现结！`
              : winner === 'urabe'
                ? `高倍率下再被对手和牌，当场须支付 ${Math.abs(netCashWan)} 万日元现金，彻底崩盘。`
                : `当前 ${multiplier}× 倍率下仍差 ${Math.abs(netCashWan)} 万日元才能扭亏，试试把倍率翻倍至 2× 或 4×。`}
          </p>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        每半庄结束必须当场以现金或支票结清差额、不可无限赊账，中途翻倍加码让终盘一手胡牌足以改写全局。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. akagi-hirayama · 假赤木·鹫巢前哨战                                       */
/* -------------------------------------------------------------------------- */

interface GlassTile {
  id: string;
  label: string;
  transparent: boolean;
}

const HIRAYAMA_INITIAL_HAND: GlassTile[] = [
  { id: 't1', label: '三万', transparent: true },
  { id: 't2', label: '四万', transparent: true },
  { id: 't3', label: '五万', transparent: false },
  { id: 't4', label: '七筒', transparent: true },
  { id: 't5', label: '八筒', transparent: true },
  { id: 't6', label: '发', transparent: true },
  { id: 't7', label: '中', transparent: false },
  { id: 't8', label: '白', transparent: true },
];

const BOX_DRAW_POOL: GlassTile[] = [
  { id: 'd1', label: '六万', transparent: true },
  { id: 'd2', label: '九筒', transparent: true },
  { id: 'd3', label: '二索', transparent: true },
  { id: 'd4', label: '东风', transparent: false },
];

function HirayamaDiagram() {
  const [lostChunks, setLostChunks] = useState<number>(3); // 每 1 格 = 输 10,000 点 = 抽 100cc
  const [drawIndex, setDrawIndex] = useState<number>(0);

  const MAX_BLOOD = 1800;
  const SHOCK_LINE = 1200;
  const bloodCc = lostChunks * 100;
  const bloodPct = Math.min(100, Math.round((bloodCc / MAX_BLOOD) * 100));
  const shockLinePct = Math.round((SHOCK_LINE / MAX_BLOOD) * 100);
  const lastDrawn = BOX_DRAW_POOL[drawIndex % BOX_DRAW_POOL.length];

  const panicStage =
    bloodCc >= 1500
      ? '失血休克临界 · 濒临败亡'
      : bloodCc >= SHOCK_LINE
        ? '已越过休克警戒线 · 极度恐慌'
        : bloodCc >= 700
          ? '明显失血眩晕 · 压力骤增'
          : '尚能维持清醒';

  const losePoints = (chunks: number) => {
    setLostChunks((prev) => Math.min(18, prev + chunks));
  };

  const reset = () => {
    setLostChunks(3);
    setDrawIndex(0);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Box className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
            透明玻璃牌槽（3 透 + 1 黑背比例）
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置血量
          </button>
        </div>

        {/* 透明牌盒 + 立槽手牌展示 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="text-[var(--text-secondary)]">
              特制立槽（<span className="text-[var(--diagram-brass)] font-semibold">透明牌</span>对鹫巢完全公开，仅
              <span className="text-[var(--text-primary)] font-semibold">黑背牌</span>隐藏）
            </span>
            <button
              type="button"
              onClick={() => setDrawIndex((i) => i + 1)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--diagram-surface)] border border-[var(--diagram-border)] text-[11px] font-semibold text-[var(--text-primary)] hover:border-[var(--diagram-brass)] cursor-pointer"
            >
              <Hand className="w-3 h-3 text-[var(--diagram-brass)]" aria-hidden="true" />
              戴手套盲摸一牌
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-9 gap-1.5">
            {HIRAYAMA_INITIAL_HAND.map((tile) => (
              <div
                key={tile.id}
                className={`h-14 rounded-md border flex flex-col items-center justify-center text-center transition-colors ${
                  tile.transparent
                    ? 'border-[var(--diagram-brass)]/75 bg-[color-mix(in_srgb,var(--diagram-brass)_12%,transparent)] border-dashed'
                    : 'border-[var(--text-primary)]/40 bg-[var(--diagram-surface)]'
                }`}
              >
                <span className="text-[12.5px] font-bold text-[var(--text-primary)] leading-none">
                  {tile.label}
                </span>
                <span
                  className={`mt-1 text-[9.5px] ${
                    tile.transparent ? 'text-[var(--diagram-brass)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {tile.transparent ? '透明公开' : '黑背暗牌'}
                </span>
              </div>
            ))}

            {/* 刚从封闭大箱盲摸出的牌 */}
            <div
              className={`h-14 rounded-md border-2 flex flex-col items-center justify-center text-center ${
                lastDrawn.transparent
                  ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_12%,transparent)]'
                  : 'border-[var(--diagram-brass)] bg-[var(--diagram-surface)]'
              }`}
            >
              <span className="text-[12.5px] font-bold text-[var(--text-primary)] leading-none">
                {lastDrawn.label}
              </span>
              <span className="mt-1 text-[9.5px] font-semibold text-[var(--diagram-accent)]">
                {lastDrawn.transparent ? '摸出透明' : '摸出暗牌'}
              </span>
            </div>
          </div>
        </div>

        {/* 静脉抽血量表 + 休克警戒线 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Syringe className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
              静脉抽血累计：
              <strong className="tabular-nums text-[var(--diagram-accent)]">{bloodCc} cc</strong>
              <span className="text-[var(--text-secondary)] font-normal">
                （累计失点 {(lostChunks * 10000).toLocaleString()} 点）
              </span>
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11.5px] font-semibold ${
                bloodCc >= SHOCK_LINE ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
              }`}
            >
              {bloodCc >= SHOCK_LINE && <Skull className="w-3.5 h-3.5" aria-hidden="true" />}
              {panicStage}
            </span>
          </div>

          <div className="relative h-8 rounded-full bg-[var(--diagram-surface)] border border-[var(--diagram-border)] overflow-hidden">
            <div
              style={{ width: `${bloodPct}%` }}
              className="h-full bg-[var(--diagram-accent)] transition-all"
            />
            {/* 休克警戒线 */}
            <div
              style={{ left: `${shockLinePct}%` }}
              className="absolute inset-y-0 w-0.5 bg-[var(--diagram-brass)]"
            />
            <span
              style={{ left: `${shockLinePct}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[var(--diagram-panel)] border border-[var(--diagram-brass)] text-[9.5px] font-bold text-[var(--diagram-brass)] whitespace-nowrap"
            >
              1,200cc 休克警戒
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-[var(--text-secondary)]">
              对手押现金，挑战者每失 10,000 点当场抽血 100cc
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={bloodCc >= MAX_BLOOD}
                onClick={() => losePoints(1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--diagram-accent)] text-[var(--accent-fg)] text-[11.5px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
              >
                <Droplet className="w-3.5 h-3.5" aria-hidden="true" />
                输掉 10,000 点 (+100cc)
              </button>
              <button
                type="button"
                disabled={bloodCc >= MAX_BLOOD}
                onClick={() => losePoints(3)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)] text-[11.5px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
              >
                连遭直击 (+300cc)
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        戴手套从封闭大箱盲摸并摆入立槽后，约四分之三手牌对鹫巢一览无余，持续抽血会迅速将牌手推向失血休克。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. akagi-washizu · 鹫巢麻将                                                 */
/* -------------------------------------------------------------------------- */

const TILE_GROUPS = [
  { id: '5m', name: '五万', glyph: '五萬' },
  { id: 'chun', name: '红中', glyph: '中' },
  { id: 'hatsu', name: '发财', glyph: '發' },
];

function WashizuDiagram() {
  const [perspective, setPerspective] = useState<'opponent' | 'self'>('opponent');
  const [tileGroupIdx, setTileGroupIdx] = useState<number>(0);
  const [hanchan, setHanchan] = useState<number>(1); // 1..6 六回半庄
  const [bloodCc, setBloodCc] = useState<number>(400); // 赤木已抽血量（每失 10,000 点抽 100cc）
  const [washizuCashM, setWashizuCashM] = useState<number>(500); // 鹫巢现金筹码池（百万日元，起步 5 亿）

  const MAX_BLOOD = 2000;
  const activeTile = TILE_GROUPS[tileGroupIdx];
  const bloodPct = Math.min(100, Math.round((bloodCc / MAX_BLOOD) * 100));
  const lethalReached = bloodCc >= MAX_BLOOD;

  const akagiLose10k = () => {
    if (lethalReached) return;
    setBloodCc((b) => Math.min(MAX_BLOOD, b + 100));
    setWashizuCashM((c) => c + 10);
  };

  const akagiWin10k = () => {
    if (lethalReached) return;
    setWashizuCashM((c) => Math.max(0, c - 10));
  };

  const nextHanchan = () => {
    setHanchan((h) => (h >= 6 ? 1 : h + 1));
  };

  const reset = () => {
    setPerspective('opponent');
    setTileGroupIdx(0);
    setHanchan(1);
    setBloodCc(400);
    setWashizuCashM(500);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：视角切换与重置 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              aria-pressed={perspective === 'opponent'}
              onClick={() => setPerspective('opponent')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold cursor-pointer border transition-colors ${
                perspective === 'opponent'
                  ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              对手视角（透视桌面）
            </button>
            <button
              type="button"
              aria-pressed={perspective === 'self'}
              onClick={() => setPerspective('self')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold cursor-pointer border transition-colors ${
                perspective === 'self'
                  ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
              }`}
            >
              自家视角（完整牌面）
            </button>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置六回战
          </button>
        </div>

        {/* 4 张同牌机制演示：3 张透明玻璃牌 + 1 张黑背暗牌 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="font-semibold text-[var(--text-primary)]">
              同种 4 张牌配比（点击牌面可切换透视视角）
            </span>
            <div className="inline-flex items-center gap-1">
              {TILE_GROUPS.map((g, idx) => (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={tileGroupIdx === idx}
                  onClick={() => setTileGroupIdx(idx)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer border ${
                    tileGroupIdx === idx
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))] text-[var(--text-primary)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5 max-w-[380px] mx-auto">
            {[0, 1, 2, 3].map((idx) => {
              const isOpaque = idx === 3;
              const hiddenToViewer = isOpaque && perspective === 'opponent';
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPerspective((p) => (p === 'opponent' ? 'self' : 'opponent'))}
                  className={`h-[78px] rounded-lg border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isOpaque
                      ? hiddenToViewer
                        ? 'border-[var(--text-primary)]/50 bg-[var(--bg-page)] text-[var(--text-secondary)]'
                        : 'border-[var(--diagram-accent)] bg-[var(--diagram-surface)] text-[var(--text-primary)]'
                      : 'border-dashed border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_12%,transparent)] text-[var(--text-primary)]'
                  }`}
                >
                  <span
                    className={`text-[17px] font-bold leading-none ${
                      hiddenToViewer
                        ? 'text-[var(--text-muted)]'
                        : isOpaque
                          ? 'text-[var(--diagram-accent)]'
                          : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {hiddenToViewer ? '■' : activeTile.glyph}
                  </span>
                  <span
                    className={`mt-1.5 text-[10px] font-semibold ${
                      isOpaque ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'
                    }`}
                  >
                    {isOpaque ? (hiddenToViewer ? '黑背不可见' : '唯一黑背牌') : `玻璃透明 #${idx + 1}`}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11.5px] text-[var(--text-secondary)] text-center">
            {perspective === 'opponent'
              ? '对手视角：3 张玻璃牌花色点数一览无余（75% 公开），唯独第 4 张黑背牌是隐蔽听口的唯一盲区。'
              : '自家视角：所有牌面向己方可见；全桌不垒牌墙，一律戴手套伸入密闭大箱盲摸后立入特制牌槽。'}
          </p>
        </div>

        {/* 不对称赌注对比：鹫巢亿万现金 vs 赤木鲜血刻度槽 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 左：鹫巢岩现金筹码 */}
          <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-brass)]">
                <Banknote className="w-3.5 h-3.5" aria-hidden="true" />
                鹫巢岩 · 现金筹码
              </span>
              <span className="tabular-nums font-bold text-[var(--text-primary)]">
                {(washizuCashM / 100).toFixed(2)} 亿日元
              </span>
            </div>
            <div className="h-3 rounded-full bg-[var(--diagram-surface)] border border-[var(--diagram-border)] overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (washizuCashM / 600) * 100)}%` }}
                className="h-full bg-[var(--diagram-brass)] transition-all"
              />
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              只以巨额现钞作赌注，输掉点棒仅损失金钱，不承受肉体失血风险。
            </p>
          </div>

          {/* 右：赤木静脉抽血刻度槽 */}
          <div
            className={`rounded-lg p-3 border space-y-2.5 ${
              bloodCc >= 1200
                ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
            }`}
          >
            <div className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-accent)]">
                <Syringe className="w-3.5 h-3.5" aria-hidden="true" />
                赤木 · 鲜血筹码
              </span>
              <span className="tabular-nums font-bold text-[var(--diagram-accent)]">
                {bloodCc} / {MAX_BLOOD} cc
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-[var(--diagram-surface)] border border-[var(--diagram-border)] overflow-hidden">
              <div
                style={{ width: `${bloodPct}%` }}
                className="h-full bg-[var(--diagram-accent)] transition-all"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] tabular-nums text-[var(--text-muted)]">
              <span>0cc</span>
              <span>500cc</span>
              <span>1000cc</span>
              <span className="text-[var(--diagram-accent)] font-semibold">2000cc 致死</span>
            </div>
          </div>
        </div>

        {/* 六回战进度 + 实时结算推演按钮 */}
        <div className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
            <span className="font-semibold text-[var(--text-primary)]">
              六回半庄进度：第 <strong className="tabular-nums text-[var(--diagram-brass)]">{hanchan}</strong> / 6 回战
            </span>
            <div className="inline-flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={hanchan === r}
                  onClick={() => setHanchan(r)}
                  className={`w-6 h-6 rounded-full text-[11px] font-bold tabular-nums cursor-pointer border transition-colors ${
                    hanchan === r
                      ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : r < hanchan
                        ? 'border-[var(--diagram-brass)]/50 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-surface))] text-[var(--text-primary)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={lethalReached}
                onClick={akagiLose10k}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--diagram-accent)] text-[var(--accent-fg)] text-[11.5px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
              >
                <Droplet className="w-3.5 h-3.5" aria-hidden="true" />
                失 10,000 点（抽血 +100cc）
              </button>
              <button
                type="button"
                disabled={lethalReached}
                onClick={akagiWin10k}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[11.5px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer"
              >
                <Banknote className="w-3.5 h-3.5" aria-hidden="true" />
                赢 10,000 点（夺走现金）
              </button>
            </div>
            <button
              type="button"
              onClick={nextHanchan}
              className="px-3 py-1.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[11.5px] font-semibold text-[var(--text-primary)] hover:border-[var(--diagram-brass)] cursor-pointer"
            >
              {hanchan < 6 ? `进入第 ${hanchan + 1} 回战` : '回到第 1 回战'}
            </button>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        全副 136 张牌中有四分之三完全透明，双方须打满六回半庄；鹫巢押注亿万现金，赤木每输一万点便当场抽血 100cc。
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 统一导出映射表（严格覆盖全部 7 场《斗牌传说》赌局）                           */
/* -------------------------------------------------------------------------- */

export const AKAGI_DIAGRAMS: Record<string, ComponentType> = {
  'akagi-chicken-run': ChickenRunDiagram,
  'akagi-ryuzaki': RyuzakiDiagram,
  'akagi-yagi': YagiDiagram,
  'akagi-ichikawa': IchikawaDiagram,
  'akagi-urabe': UrabeDiagram,
  'akagi-hirayama': HirayamaDiagram,
  'akagi-washizu': WashizuDiagram,
};
