import { useEffect, useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  Bomb,
  Building2,
  Bus,
  CheckCircle2,
  Clock,
  Club,
  Coffee,
  Compass,
  Crosshair,
  Diamond,
  DoorOpen,
  Eye,
  EyeOff,
  Flag,
  Flame,
  Footprints,
  Heart,
  Layers,
  Lightbulb,
  LightbulbOff,
  Link2,
  Lock,
  Navigation,
  Radar,
  RotateCcw,
  Scale,
  ShieldCheck,
  Skull,
  Smartphone,
  Spade,
  ThermometerSun,
  Trophy,
  Unlock,
  Users,
  Waves,
  XCircle,
  Zap,
} from 'lucide-react';

/* ============================================================================
 * 1. alice-3-clubs-dead-or-alive · 梅花3·生或死
 * 3×3 大楼方格密室俯视图 + 外轮廓对照线 + 生/死二选一电子门
 * ========================================================================== */

interface DeadAliveDoor {
  dir: '北' | '东' | '南' | '西';
  label: '生' | '死';
  nextRoom: number | 'exit' | 'trap';
  trapNote?: string;
}

interface DeadAliveRoom {
  id: number;
  row: number;
  col: number;
  code: string;
  limitSec: number;
  doors: [DeadAliveDoor, DeadAliveDoor];
}

const DEAD_ALIVE_ROOMS: DeadAliveRoom[] = [
  {
    id: 0,
    row: 0,
    col: 0,
    code: 'A1',
    limitSec: 40,
    doors: [
      { dir: '东', label: '生', nextRoom: 'trap', trapNote: '门后激光陷阱启动' },
      { dir: '南', label: '死', nextRoom: 'trap', trapNote: '封闭死角陷阱' },
    ],
  },
  {
    id: 1,
    row: 0,
    col: 1,
    code: 'A2',
    limitSec: 60,
    doors: [
      { dir: '西', label: '生', nextRoom: 'trap', trapNote: 'A1 贴近外墙死角，门内触发激光！' },
      { dir: '东', label: '死', nextRoom: 2 },
    ],
  },
  {
    id: 2,
    row: 0,
    col: 2,
    code: 'A3',
    limitSec: 40,
    doors: [
      { dir: '东', label: '生', nextRoom: 'exit' },
      { dir: '南', label: '死', nextRoom: 'trap', trapNote: 'B3 为内侧封闭陷阱室！' },
    ],
  },
  {
    id: 3,
    row: 1,
    col: 0,
    code: 'B1',
    limitSec: 100,
    doors: [
      { dir: '北', label: '生', nextRoom: 'trap', trapNote: 'A1 位于大楼西北角盲区，触发陷阱！' },
      { dir: '东', label: '死', nextRoom: 4 },
    ],
  },
  {
    id: 4,
    row: 1,
    col: 1,
    code: 'B2',
    limitSec: 80,
    doors: [
      { dir: '北', label: '生', nextRoom: 1 },
      { dir: '南', label: '死', nextRoom: 'trap', trapNote: 'C2 门后触发火焰陷阱！' },
    ],
  },
  {
    id: 5,
    row: 1,
    col: 2,
    code: 'B3',
    limitSec: 60,
    doors: [
      { dir: '北', label: '生', nextRoom: 'trap' },
      { dir: '西', label: '死', nextRoom: 'trap' },
    ],
  },
  {
    id: 6,
    row: 2,
    col: 0,
    code: 'C1',
    limitSec: 120,
    doors: [
      { dir: '北', label: '生', nextRoom: 3 },
      { dir: '东', label: '死', nextRoom: 'trap', trapNote: 'C2 并非通向出口方向，触发致命陷阱！' },
    ],
  },
  {
    id: 7,
    row: 2,
    col: 1,
    code: 'C2',
    limitSec: 100,
    doors: [
      { dir: '北', label: '生', nextRoom: 'trap' },
      { dir: '东', label: '死', nextRoom: 'trap' },
    ],
  },
  {
    id: 8,
    row: 2,
    col: 2,
    code: 'C3',
    limitSec: 80,
    doors: [
      { dir: '北', label: '生', nextRoom: 'trap' },
      { dir: '西', label: '死', nextRoom: 'trap' },
    ],
  },
];

const DEAD_ALIVE_SAFE_PATH = [6, 3, 4, 1, 2];

function DeadOrAliveDiagram() {
  const [roomId, setRoomId] = useState<number>(6);
  const [visited, setVisited] = useState<number[]>([6]);
  const [showBlueprint, setShowBlueprint] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<'playing' | 'won' | 'trap' | 'timeout'>('playing');
  const [status, setStatus] = useState<string>('你身处 C1 入口室。门牌「生」「死」并不绝对可信，可开启外轮廓参照空间位置再推门。');

  const currentRoom = DEAD_ALIVE_ROOMS[roomId];

  const handleChooseDoor = (door: DeadAliveDoor) => {
    if (outcome !== 'playing') return;
    if (door.nextRoom === 'exit') {
      setOutcome('won');
      setStatus(`推开 A3 ${door.dir}侧「${door.label}」门——正对大楼外侧逃生梯，成功走出大厦出口！`);
      return;
    }
    if (door.nextRoom === 'trap') {
      setOutcome('trap');
      setStatus(`选错${door.dir}侧「${door.label}」门！${door.trapNote ?? '触发密室致命陷阱，当场丧命。'}`);
      return;
    }
    const next = DEAD_ALIVE_ROOMS[door.nextRoom];
    setRoomId(next.id);
    setVisited((prev) => (prev.includes(next.id) ? prev : [...prev, next.id]));
    setStatus(`通过${door.dir}侧「${door.label}」门安全进入 ${next.code} 室，本室倒计时缩减至 ${next.limitSec} 秒。`);
  };

  const handleTimeout = () => {
    if (outcome !== 'playing') return;
    setOutcome('timeout');
    setStatus(`${currentRoom.code} 室 ${currentRoom.limitSec} 秒倒计时归零仍未离开，房间触发全室处决！`);
  };

  const reset = () => {
    setRoomId(6);
    setVisited([6]);
    setOutcome('playing');
    setStatus('你身处 C1 入口室。门牌「生」「死」并不绝对可信，可开启外轮廓参照空间位置再推门。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)]">
              <Building2 className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              当前室：<strong className="text-[var(--diagram-brass)] tabular-nums">{outcome === 'won' ? '大厦出口' : currentRoom.code}</strong>
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
              <Clock className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
              本室限时：
              <strong className="tabular-nums text-[var(--diagram-accent)]">{outcome === 'won' ? '已解除' : `${currentRoom.limitSec}s`}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-pressed={showBlueprint}
              onClick={() => setShowBlueprint((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border cursor-pointer transition-colors ${
                showBlueprint
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{showBlueprint ? '外轮廓对照：开' : '对照大楼外轮廓'}</span>
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

        {/* 3x3 密室俯视图 */}
        <div className="max-w-[390px] mx-auto">
          <div
            className={`relative rounded-xl p-3 transition-all ${
              showBlueprint
                ? 'border-2 border-dashed border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_6%,var(--diagram-panel))]'
                : 'border border-[var(--diagram-border)] bg-[color-mix(in_srgb,var(--bg-page)_30%,transparent)]'
            }`}
          >
            {showBlueprint && (
              <div className="flex items-center justify-between text-[10.5px] text-[var(--diagram-brass)] mb-2 font-medium">
                <span>大楼外形 27m × 27m（单室 9m × 9m）</span>
                <span>右上东墙 → 外部街道出口</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2.5">
              {DEAD_ALIVE_ROOMS.map((room) => {
                const isHere = outcome !== 'won' && roomId === room.id;
                const isVisited = visited.includes(room.id);
                const isSafeNode = DEAD_ALIVE_SAFE_PATH.includes(room.id);
                const isExitRoom = room.id === 2;

                return (
                  <div
                    key={room.id}
                    className={`relative h-[66px] rounded-lg border px-2 py-1.5 flex flex-col items-center justify-center transition-all ${
                      isHere
                        ? outcome === 'trap' || outcome === 'timeout'
                          ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] ring-2 ring-[var(--diagram-accent)]/40'
                          : 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_22%,var(--diagram-panel))] ring-2 ring-[var(--diagram-brass)]/45'
                        : isVisited
                          ? 'border-[var(--diagram-brass)]/55 bg-[color-mix(in_srgb,var(--diagram-brass)_10%,var(--diagram-panel))]'
                          : showBlueprint && !isSafeNode
                            ? 'border-[var(--diagram-accent)]/45 bg-[color-mix(in_srgb,var(--diagram-accent)_8%,var(--diagram-panel))]'
                            : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {isExitRoom && showBlueprint && (
                        <Trophy className="w-3 h-3 text-[var(--diagram-brass)]" aria-hidden="true" />
                      )}
                      <span
                        className={`text-[12px] font-bold tabular-nums ${
                          isHere
                            ? 'text-[var(--diagram-brass)]'
                            : showBlueprint && !isSafeNode
                              ? 'text-[var(--diagram-accent)]'
                              : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {room.code}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 text-center leading-tight">
                      {isHere
                        ? outcome === 'playing'
                          ? '当前位置'
                          : '已淘汰'
                        : isVisited
                          ? '已通过'
                          : showBlueprint
                            ? isExitRoom
                              ? '东门出大厦'
                              : isSafeNode
                                ? '结构连通'
                                : '外墙死角/陷阱'
                            : '密闭方室'}
                    </span>
                    {isExitRoom && (
                      <span
                        className={`absolute -right-2.5 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded text-[9px] font-bold leading-none ${
                          outcome === 'won'
                            ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                            : 'bg-[var(--diagram-panel)] border border-[var(--diagram-brass)]/60 text-[var(--diagram-brass)]'
                        }`}
                      >
                        出口
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 当前密室两扇电子门 */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {currentRoom.doors.map((door) => (
            <button
              key={`${currentRoom.id}-${door.dir}`}
              type="button"
              disabled={outcome !== 'playing'}
              onClick={() => handleChooseDoor(door)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-[12.5px] font-semibold transition-all ${
                outcome !== 'playing'
                  ? 'opacity-50 cursor-not-allowed border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-muted)]'
                  : 'cursor-pointer border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)] hover:-translate-y-0.5'
              }`}
            >
              <DoorOpen
                className={`w-4 h-4 ${door.label === '生' ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'}`}
                aria-hidden="true"
              />
              <span>
                {door.dir}侧门 ·「{door.label}」
              </span>
              {showBlueprint && door.nextRoom !== 'trap' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]">
                  符合轮廓
                </span>
              )}
            </button>
          ))}
          {outcome === 'playing' && (
            <button
              type="button"
              onClick={handleTimeout}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[11.5px] text-[var(--text-secondary)] hover:border-[var(--diagram-accent)] hover:text-[var(--diagram-accent)] cursor-pointer transition-colors"
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              模拟超时
            </button>
          )}
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            outcome === 'won'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : outcome === 'trap' || outcome === 'timeout'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        单间方室面积与大楼外部尺寸严格吻合，打开「对照大楼外轮廓」即可用空间位置识破误导性的门牌。
      </p>
    </div>
  );
}

/* ============================================================================
 * 2. alice-5-spades-tag · 黑桃5·鬼抓人
 * 6 层公寓剖面 + 20 分钟炸弹倒计时 + 马面持枪鬼巡逻 + 双人同步开关拆弹
 * ========================================================================== */

const TAG_PATROL_FLOORS = [6, 5, 3, 2, 4, 5, 6, 3];
const SAFE_ROOM_FLOOR = 4;

function TagApartmentDiagram() {
  const [playerFloor, setPlayerFloor] = useState<number>(1);
  const [inSafeRoom, setInSafeRoom] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [partnerReady, setPartnerReady] = useState<boolean>(false);
  const [switchA, setSwitchA] = useState<boolean>(false);
  const [switchB, setSwitchB] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<'playing' | 'won' | 'shot' | 'exploded'>('playing');
  const [status, setStatus] = useState<string>('你在 1F 大厅。避开巡逻楼层的马面枪手，搜寻隐藏在公寓内的安全屋并拆弹。');

  const minutesLeft = Math.max(0, 20 - step * 2);
  const taggerFloor = TAG_PATROL_FLOORS[step % TAG_PATROL_FLOORS.length];

  const moveFloor = (targetFloor: number) => {
    if (outcome !== 'playing') return;
    if (Math.abs(targetFloor - playerFloor) !== 1) return;

    const nextStep = step + 1;
    const nextMinutes = Math.max(0, 20 - nextStep * 2);
    const nextTagger = TAG_PATROL_FLOORS[nextStep % TAG_PATROL_FLOORS.length];

    setStep(nextStep);
    setPlayerFloor(targetFloor);
    setInSafeRoom(false);
    setSwitchA(false);
    setSwitchB(false);

    if (nextMinutes <= 0) {
      setOutcome('exploded');
      setStatus('20 分钟倒计时归零，整栋公寓定时炸弹引爆！');
    } else if (targetFloor === nextTagger) {
      setOutcome('shot');
      setStatus(`刚踏上 ${targetFloor}F 走廊便迎面撞上巡逻的马面持枪鬼，遭火力扫射淘汰！`);
    } else if (targetFloor === SAFE_ROOM_FLOOR) {
      setStatus(`抵达 4F 走廊（马面鬼正在 ${nextTagger}F）。402 室门后传来电子提示音——发现安全屋！`);
    } else {
      setStatus(`潜行至 ${targetFloor}F 走廊（剩余 ${nextMinutes} 分钟，枪声来自 ${nextTagger}F）。继续搜索相邻楼层。`);
    }
  };

  const enterSafeRoom = () => {
    if (outcome !== 'playing' || playerFloor !== SAFE_ROOM_FLOOR) return;
    setInSafeRoom(true);
    setStatus('进入 402 安全屋！房间东西两墙各有一枚解锁开关，相距数米，单人无法同时触及。');
  };

  const pressSingleSwitch = (which: 'A' | 'B') => {
    if (outcome !== 'playing' || !inSafeRoom) return;
    if (which === 'A') {
      setSwitchA(true);
      setSwitchB(false);
    } else {
      setSwitchB(true);
      setSwitchA(false);
    }
    setStatus(`只按下开关 ${which} 无法解锁——两枚开关相距甚远，放手即弹起，必须两人同时按下！`);
  };

  const pressBothSwitches = () => {
    if (outcome !== 'playing' || !inSafeRoom) return;
    if (!partnerReady) {
      setStatus('请先呼叫同伴进入安全屋就位，再执行双人同步按压！');
      return;
    }
    setSwitchA(true);
    setSwitchB(true);
    setOutcome('won');
    setStatus(`倒计时剩 ${minutesLeft} 分钟！你与同伴同时按下 A/B 双开关，炸弹解除，全员通关！`);
  };

  const reset = () => {
    setPlayerFloor(1);
    setInSafeRoom(false);
    setStep(0);
    setPartnerReady(false);
    setSwitchA(false);
    setSwitchB(false);
    setOutcome('playing');
    setStatus('你在 1F 大厅。避开巡逻楼层的马面枪手，搜寻隐藏在公寓内的安全屋并拆弹。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[var(--text-primary)]">
              <Bomb className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
              爆炸倒计时：
              <strong className="tabular-nums text-[var(--diagram-accent)] text-[14px]">
                {String(minutesLeft).padStart(2, '0')}:00
              </strong>
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
              <Crosshair className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
              马面鬼位置：<strong className="text-[var(--text-primary)]">{taggerFloor}F</strong>
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

        {/* 6 层公寓剖面 */}
        <div className="space-y-1.5 max-w-[440px] mx-auto">
          {[6, 5, 4, 3, 2, 1].map((floor) => {
            const isPlayer = playerFloor === floor;
            const isTagger = taggerFloor === floor;
            const isAdjacentFloor = outcome === 'playing' && !inSafeRoom && Math.abs(floor - playerFloor) === 1;
            const isSafeFloor = floor === SAFE_ROOM_FLOOR;

            return (
              <div
                key={floor}
                className={`grid grid-cols-[44px_1fr_auto] items-center gap-2 rounded-lg border px-2.5 py-2 transition-all ${
                  isPlayer && isTagger
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-panel))]'
                    : isPlayer
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                      : isTagger
                        ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_10%,var(--diagram-panel))]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                }`}
              >
                <span className="text-[12px] font-bold tabular-nums text-[var(--text-secondary)]">{floor}F</span>

                <div className="flex flex-wrap items-center gap-2 text-[11.5px]">
                  {isPlayer && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] font-semibold text-[10.5px]">
                      <Footprints className="w-3 h-3" aria-hidden="true" />
                      {inSafeRoom ? '安全屋内' : '你在这里'}
                    </span>
                  )}
                  {isTagger && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-accent)_22%,var(--diagram-panel))] text-[var(--diagram-accent)] font-semibold text-[10.5px]">
                      <Crosshair className="w-3 h-3" aria-hidden="true" />
                      马面枪手巡逻
                    </span>
                  )}
                  {!isPlayer && !isTagger && (
                    <span className="text-[var(--text-muted)]">
                      {isSafeFloor ? '走廊东侧 · 402 室有微弱电子光' : '公寓住户走廊'}
                    </span>
                  )}
                </div>

                <div>
                  {isAdjacentFloor ? (
                    <button
                      type="button"
                      onClick={() => moveFloor(floor)}
                      className="px-2.5 py-1 rounded-md border border-[var(--diagram-brass)]/70 bg-[var(--diagram-surface)] text-[11px] font-semibold text-[var(--diagram-brass)] hover:bg-[var(--diagram-brass)] hover:text-[var(--btn-primary-fg)] cursor-pointer transition-colors"
                    >
                      {floor > playerFloor ? '上楼' : '下楼'}
                    </button>
                  ) : isPlayer && isSafeFloor && !inSafeRoom && outcome === 'playing' ? (
                    <button
                      type="button"
                      onClick={enterSafeRoom}
                      className="px-2.5 py-1 rounded-md bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[11px] font-semibold cursor-pointer"
                    >
                      进入 402
                    </button>
                  ) : (
                    <span className="text-[10.5px] text-[var(--text-muted)] px-1">{isSafeFloor ? '402' : `${floor}01`}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 安全屋双开关拆弹台 */}
        {inSafeRoom && (
          <div className="rounded-xl border border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_8%,var(--diagram-panel))] p-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
              <span className="font-semibold text-[var(--diagram-brass)] inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                402 安全屋 · 远距双开关拆弹装置
              </span>
              <button
                type="button"
                disabled={outcome !== 'playing'}
                aria-pressed={partnerReady}
                onClick={() => {
                  setPartnerReady((v) => !v);
                  setStatus(!partnerReady ? '同伴已就位开关 B，现在可两人同时按下拆弹！' : '同伴暂离开关 B。');
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border cursor-pointer transition-colors ${
                  partnerReady
                    ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] font-semibold'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                }`}
              >
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                {partnerReady ? '同伴已就位 B' : '呼叫同伴就位'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                disabled={outcome !== 'playing'}
                onClick={() => pressSingleSwitch('A')}
                className={`rounded-lg py-2 px-3 border text-[12px] font-semibold cursor-pointer transition-all ${
                  switchA
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
                }`}
              >
                单按开关 A（西墙）
              </button>
              <button
                type="button"
                disabled={outcome !== 'playing'}
                onClick={pressBothSwitches}
                className="rounded-lg py-2 px-3 bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-bold cursor-pointer hover:opacity-90 transition-opacity"
              >
                两人同时按 A + B
              </button>
              <button
                type="button"
                disabled={outcome !== 'playing'}
                onClick={() => pressSingleSwitch('B')}
                className={`rounded-lg py-2 px-3 border text-[12px] font-semibold cursor-pointer transition-all ${
                  switchB
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
                }`}
              >
                单按开关 B（东墙）
              </button>
            </div>
          </div>
        )}

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            outcome === 'won'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : outcome === 'shot' || outcome === 'exploded'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        单人无法跨房间同时按下相距甚远的双开关，唯有在躲避马面枪手巡逻的同时配合同伴同步解锁。
      </p>
    </div>
  );
}

/* ============================================================================
 * 3. alice-7-hearts-wolf · 红心7·躲猫猫
 * 4 人项圈（1 狼 3 羊）+ 对视互换 + 短暂冷却 + 倒计时归零结算
 * ========================================================================== */

const WOLF_PLAYERS = [
  { id: 0, name: '玩家 A' },
  { id: 1, name: '玩家 B' },
  { id: 2, name: '玩家 C' },
  { id: 3, name: '玩家 D' },
];

function WolfAndSheepDiagram() {
  const [wolfId, setWolfId] = useState<number>(0);
  const [cooldown, setCooldown] = useState<boolean>(false);
  const [swaps, setSwaps] = useState<number>(0);
  const [detonated, setDetonated] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('点击任意一名「羊」与当前「狼」对视，瞬间互换身份；归零时仅剩 1 名狼存活。');

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => {
      setCooldown(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleEyeContact = (targetId: number) => {
    if (detonated || targetId === wolfId) return;
    if (cooldown) {
      setStatus('项圈面部识别短暂冷却中（约 1 秒），暂时无法立刻回传身份！');
      return;
    }
    const prevWolf = WOLF_PLAYERS[wolfId].name;
    const nextWolf = WOLF_PLAYERS[targetId].name;
    setWolfId(targetId);
    setSwaps((n) => n + 1);
    setCooldown(true);
    setStatus(`${prevWolf} 与 ${nextWolf} 视线对上！身份瞬间互换：${nextWolf} 成为新「狼」（触发短暂冷却）。`);
  };

  const handleTimeUp = () => {
    setDetonated(true);
    setCooldown(false);
    setStatus(`15:00 倒计时归零！当前「狼」${WOLF_PLAYERS[wolfId].name} 项圈解锁唯一生还，其余 3 名「羊」项圈引爆。`);
  };

  const reset = () => {
    setWolfId(0);
    setCooldown(false);
    setSwaps(0);
    setDetonated(false);
    setStatus('点击任意一名「羊」与当前「狼」对视，瞬间互换身份；归零时仅剩 1 名狼存活。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[var(--text-primary)]">
              <Eye className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              当前狼：<strong className="text-[var(--diagram-brass)]">{WOLF_PLAYERS[wolfId].name}</strong>
            </span>
            <span className="text-[var(--text-secondary)] tabular-nums">
              已互换：<strong>{swaps}</strong> 次
            </span>
            {cooldown && !detonated && (
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]">
                视线冷却锁定中…
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={detonated}
              onClick={handleTimeUp}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                detonated
                  ? 'opacity-50 cursor-not-allowed bg-[var(--diagram-panel)] text-[var(--text-muted)] border border-[var(--diagram-border)]'
                  : 'cursor-pointer bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              模拟倒计时归零
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

        {/* 4 人爆炸项圈阵位 */}
        <div className="grid grid-cols-2 gap-3 max-w-[400px] mx-auto">
          {WOLF_PLAYERS.map((p) => {
            const isWolf = p.id === wolfId;
            return (
              <button
                key={p.id}
                type="button"
                disabled={detonated || isWolf}
                onClick={() => handleEyeContact(p.id)}
                className={`relative rounded-xl border p-3.5 flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isWolf
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] ring-2 ring-[var(--diagram-brass)]/45 cursor-default'
                    : detonated
                      ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] cursor-not-allowed'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isWolf ? (
                    <ShieldCheck className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
                  ) : detonated ? (
                    <Skull className="w-4 h-4 text-[var(--diagram-accent)]" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
                  )}
                  <span className="text-[13px] font-bold text-[var(--text-primary)]">{p.name}</span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    isWolf
                      ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                  }`}
                >
                  {isWolf ? (detonated ? '狼 · 唯一存活' : '狼 · 存活位') : detonated ? '羊 · 项圈引爆' : '羊 · 点击对视'}
                </span>
              </button>
            );
          })}
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            detonated
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        四人只能活下一个——谁握着「狼」身份便握着唯一生机，而短暂冷却阻止了瞬间反复回传。
      </p>
    </div>
  );
}

/* ============================================================================
 * 4. alice-4-clubs-distance · 梅花4·距离
 * 隧道与起点废弃巴士剖面 + 手机数字屏幕（越往前跑数字反而越大）+ 两小时泄洪
 * ========================================================================== */

function DistanceTunnelDiagram() {
  const [distance, setDistance] = useState<number>(0);
  const [floodTriggered, setFloodTriggered] = useState<boolean>(false);
  const [revealMeaning, setRevealMeaning] = useState<boolean>(false);

  const pct = Math.round((distance / 2800) * 100);
  const inBus = distance === 0;
  const survived = floodTriggered && inBus;
  const washedAway = floodTriggered && !inBus;

  const handleMove = (val: number) => {
    setFloodTriggered(false);
    setDistance(Math.max(0, Math.min(2800, val)));
  };

  const reset = () => {
    setDistance(0);
    setFloodTriggered(false);
    setRevealMeaning(false);
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 text-[var(--text-primary)] font-semibold">
              <Bus className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
              高速公路隧道剖面
            </span>
            <button
              type="button"
              aria-pressed={revealMeaning}
              onClick={() => setRevealMeaning((v) => !v)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] border cursor-pointer transition-colors ${
                revealMeaning
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
              }`}
            >
              {revealMeaning ? '已揭开数字含义' : '查看数字提示'}
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

        {/* 隧道剖面 + 手机数字屏幕 */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3 items-stretch">
          <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-3 flex flex-col justify-between gap-3 relative overflow-hidden">
            {/* 泄洪视觉层 */}
            {floodTriggered && (
              <div className="absolute inset-0 pointer-events-none bg-[color-mix(in_srgb,var(--diagram-accent)_16%,transparent)] flex items-end">
                <div className="w-full h-1/2 border-t-2 border-dashed border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_18%,transparent)]" />
              </div>
            )}

            <div className="relative flex items-center justify-between text-[10.5px] text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--diagram-brass)]">
                <Bus className="w-3.5 h-3.5" aria-hidden="true" />
                入口废弃巴士（0m）
              </span>
              <span className="text-[var(--diagram-accent)]">猛兽区 · 泄洪闸门（2800m）</span>
            </div>

            {/* 隧道轨道 */}
            <div className="relative h-12 rounded-lg border border-[var(--border-hairline)] bg-[var(--diagram-surface)] flex items-center px-3">
              {/* 起点巴士框 */}
              <div
                className={`h-8 px-2 rounded border flex items-center justify-center text-[10.5px] font-bold shrink-0 ${
                  inBus
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_22%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)]'
                }`}
              >
                {revealMeaning ? 'GOAL 巴士' : '巴士'}
              </div>

              {/* 隧道跑道线 */}
              <div className="relative flex-1 mx-2 h-1.5 rounded-full bg-[var(--border-hairline)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-[var(--diagram-accent)] transition-all"
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] flex items-center justify-center shadow transition-all"
                  style={{ left: `${pct}%` }}
                >
                  <Footprints className="w-3 h-3" aria-hidden="true" />
                </div>
              </div>

              <span className="text-[10px] text-[var(--diagram-accent)] shrink-0 font-semibold">闸门</span>
            </div>

            {/* 拖动滑块与快捷按钮 */}
            <div className="relative space-y-2">
              <input
                type="range"
                min={0}
                max={2800}
                step={200}
                value={distance}
                onChange={(e) => handleMove(Number(e.target.value))}
                aria-label="在隧道中前进或退回的距离"
                className="w-full accent-[var(--diagram-brass)] cursor-pointer"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMove(0)}
                    className="px-2.5 py-1 rounded-md border border-[var(--diagram-brass)]/70 bg-[var(--diagram-surface)] text-[11px] font-semibold text-[var(--diagram-brass)] cursor-pointer"
                  >
                    退回巴士
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(distance + 400)}
                    className="px-2.5 py-1 rounded-md border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[11px] text-[var(--text-primary)] cursor-pointer"
                  >
                    向前狂奔 +400m
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setFloodTriggered(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--diagram-accent)] text-[var(--accent-fg)] text-[11px] font-semibold cursor-pointer"
                >
                  <Waves className="w-3.5 h-3.5" aria-hidden="true" />
                  触发 2 小时泄洪
                </button>
              </div>
            </div>
          </div>

          {/* 手机屏幕 */}
          <div className="rounded-xl border-2 border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-3 flex flex-col items-center justify-between text-center">
            <div className="inline-flex items-center gap-1 text-[10.5px] text-[var(--text-secondary)]">
              <Smartphone className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              <span>配发手机</span>
            </div>
            <div className="my-2">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">DISTANCE</div>
              <div className="text-[30px] font-bold tabular-nums leading-tight text-[var(--diagram-brass)]">
                {distance}
              </div>
              <div className="text-[10.5px] text-[var(--text-secondary)] mt-0.5">
                {revealMeaning ? '离起点巴士的已走距离' : '（未标注剩余/已走）'}
              </div>
            </div>
            <span className="w-full py-1 rounded bg-[var(--diagram-surface)] border border-[var(--border-hairline)] text-[10px] text-[var(--text-muted)]">
              {inBus ? '当前读数为 0' : '越往前跑反而越大'}
            </span>
          </div>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            survived
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : washedAway
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {survived
            ? '两小时泄洪冲刷整条隧道！车身漆着「GOAL」的入口废弃巴士稳稳挡住洪流，留在车内安全通关！'
            : washedAway
              ? `洪水席卷隧道！你已跑离巴士 ${distance}m，未能返回真正的「终点」巴士而被洪流吞没！`
              : inBus
                ? '你正身处隧道入口的废弃巴士内，手机显示「0」。试试拖动人物往隧道深处跑，观察数字变化。'
                : `已深入隧道 ${distance}m——奇怪的是，手机数字不但没减少，反而增大到了 ${distance}！`}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        规则刻意隐去了数字的方向含义：往前跑得越远读数越大，恰恰暗示「终点」就在归零的起点巴士上。
      </p>
    </div>
  );
}

/* ============================================================================
 * 5. alice-4-diamonds-lightbulb · 方块4·灯泡
 * 真实三开关一灯泡谜题：关门自由拨动与通电加热 + 水位上涨 + 仅限开门 1 次
 * ========================================================================== */

type SwitchId = 'A' | 'B' | 'C';
const SWITCH_IDS: SwitchId[] = ['A', 'B', 'C'];

function LightbulbPuzzleDiagram() {
  const [trueSwitch, setTrueSwitch] = useState<SwitchId>('B');
  const [switches, setSwitches] = useState<Record<SwitchId, boolean>>({ A: false, B: false, C: false });
  const [heated, setHeated] = useState<Record<SwitchId, boolean>>({ A: false, B: false, C: false });
  const [doorOpen, setDoorOpen] = useState<boolean>(false);
  const [waterLevel, setWaterLevel] = useState<number>(20);
  const [outcome, setOutcome] = useState<'playing' | 'won' | 'lost'>('playing');
  const [status, setStatus] = useState<string>('关门时可自由拨动 A/B/C 开关；试着先通电加热一枚开关再关掉，最后仅开门查看 1 次！');

  const bulbLit = switches[trueSwitch];
  const bulbWarm = heated[trueSwitch];

  const raiseWater = (delta: number, nextMessage: string) => {
    const nextWater = Math.min(100, waterLevel + delta);
    setWaterLevel(nextWater);
    if (nextWater >= 100) {
      setOutcome('lost');
      setStatus('水位触及悬空高压电缆，主室瞬间通电，全员淘汰！');
      return true;
    }
    setStatus(nextMessage);
    return false;
  };

  const toggleSwitch = (id: SwitchId) => {
    if (outcome !== 'playing' || doorOpen) return;
    const nextVal = !switches[id];
    setSwitches((prev) => ({ ...prev, [id]: nextVal }));
    raiseWater(5, `已将开关 ${id} 拨至「${nextVal ? '开' : '关'}」。关门状态下无法看到暗室灯泡。`);
  };

  const waitAndHeat = () => {
    if (outcome !== 'playing' || doorOpen) return;
    const onIds = SWITCH_IDS.filter((id) => switches[id]);
    setHeated({ A: switches.A, B: switches.B, C: switches.C });
    raiseWater(
      25,
      onIds.length > 0
        ? `通电等待 2 分钟（水位上涨）：若控制开关在 ${onIds.join('、')} 中，白炽灯玻璃已产生明显余温！`
        : '所有开关均处于关闭状态，白炽灯玻璃保持冰凉（水位上涨）。'
    );
  };

  const openDarkRoom = () => {
    if (outcome !== 'playing' || doorOpen) return;
    setDoorOpen(true);
    const visual = bulbLit
      ? '灯泡正亮着（滚烫）'
      : bulbWarm
        ? '灯泡熄灭，但用手一摸玻璃发烫（有余温）！'
        : '灯泡熄灭，且玻璃完全冰凉。';
    raiseWater(10, `暗室门已打开（所有开关永久锁定）：${visual}请立即作答！`);
  };

  const submitAnswer = (guess: SwitchId) => {
    if (outcome !== 'playing') return;
    if (guess === trueSwitch) {
      setOutcome('won');
      setStatus(`回答「开关 ${guess}」完全正确！利用「亮灭 + 玻璃余温」三种状态区分三个开关，成功通关！`);
    } else {
      setOutcome('lost');
      setStatus(`回答「开关 ${guess}」错误（真正控制灯泡的是开关 ${trueSwitch}），触电处决启动！`);
    }
  };

  const reset = (randomize = false) => {
    const nextTarget = randomize ? SWITCH_IDS[Math.floor(Math.random() * 3)] : trueSwitch;
    setTrueSwitch(nextTarget);
    setSwitches({ A: false, B: false, C: false });
    setHeated({ A: false, B: false, C: false });
    setDoorOpen(false);
    setWaterLevel(20);
    setOutcome('playing');
    setStatus('关门时可自由拨动 A/B/C 开关；试着先通电加热一枚开关再关掉，最后仅开门查看 1 次！');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶部水位警报条 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
            <Zap className="w-4 h-4 text-[var(--diagram-accent)] shrink-0" aria-hidden="true" />
            <span className="text-[var(--text-primary)] shrink-0">
              水位 / 高压线：<strong className="tabular-nums text-[var(--diagram-accent)]">{waterLevel}%</strong>
            </span>
            <div className="flex-1 h-2 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] overflow-hidden">
              <div
                className="h-full bg-[var(--diagram-accent)] transition-all"
                style={{ width: `${waterLevel}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => reset(true)}
              className="px-2 py-0.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              随机换一题
            </button>
            <button
              type="button"
              onClick={() => reset(false)}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重置
            </button>
          </div>
        </div>

        {/* 左右双室：主室开关 vs 暗室灯泡 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 左：主室三开关 */}
          <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-3 space-y-3">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-[var(--text-primary)]">主室墙面开关</span>
              <span className="text-[var(--text-muted)]">{doorOpen ? '已锁定' : '可自由拨动'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SWITCH_IDS.map((id) => {
                const isOn = switches[id];
                const isHot = heated[id];
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={doorOpen || outcome !== 'playing'}
                    onClick={() => toggleSwitch(id)}
                    className={`rounded-lg border py-2.5 px-2 flex flex-col items-center gap-1 transition-all ${
                      doorOpen || outcome !== 'playing' ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'
                    } ${
                      isOn
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-surface))] text-[var(--diagram-brass)]'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span className="text-[14px] font-bold">{id}</span>
                    <span className="text-[11px] font-semibold">{isOn ? '开 ON' : '关 OFF'}</span>
                    {isHot && (
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-accent)_18%,var(--diagram-panel))] text-[var(--diagram-accent)]">
                        曾加热
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={doorOpen || outcome !== 'playing'}
              onClick={waitAndHeat}
              className={`w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[11.5px] font-semibold transition-colors ${
                doorOpen || outcome !== 'playing'
                  ? 'opacity-50 cursor-not-allowed border-[var(--diagram-border)] text-[var(--text-muted)]'
                  : 'cursor-pointer border-[var(--diagram-brass)]/70 bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-surface))] text-[var(--diagram-brass)]'
              }`}
            >
              <ThermometerSun className="w-3.5 h-3.5" aria-hidden="true" />
              通电等待 2 分钟（让灯丝发热 · 水位 +25%）
            </button>
          </div>

          {/* 右：暗室与单次开门 */}
          <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-3 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-[var(--text-primary)]">密闭暗室</span>
              <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                {doorOpen ? <Unlock className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" /> : <Lock className="w-3.5 h-3.5" aria-hidden="true" />}
                {doorOpen ? '门已打开' : '门已紧闭'}
              </span>
            </div>

            <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--diagram-surface)] py-4 px-3 flex flex-col items-center justify-center gap-1.5 text-center">
              {!doorOpen ? (
                <>
                  <EyeOff className="w-6 h-6 text-[var(--text-muted)]" aria-hidden="true" />
                  <span className="text-[12px] text-[var(--text-secondary)]">暗室密闭，无法观察灯泡</span>
                </>
              ) : bulbLit ? (
                <>
                  <Lightbulb className="w-7 h-7 text-[var(--diagram-brass)]" aria-hidden="true" />
                  <span className="text-[13px] font-bold text-[var(--diagram-brass)]">灯泡点亮 · 玻璃灼热</span>
                </>
              ) : bulbWarm ? (
                <>
                  <LightbulbOff className="w-7 h-7 text-[var(--diagram-accent)]" aria-hidden="true" />
                  <span className="text-[13px] font-bold text-[var(--diagram-accent)]">灯泡熄灭 · 但玻璃发烫余温！</span>
                </>
              ) : (
                <>
                  <LightbulbOff className="w-7 h-7 text-[var(--text-secondary)]" aria-hidden="true" />
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">灯泡熄灭 · 玻璃冰凉</span>
                </>
              )}
            </div>

            <button
              type="button"
              disabled={doorOpen || outcome !== 'playing'}
              onClick={openDarkRoom}
              className={`w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                doorOpen || outcome !== 'playing'
                  ? 'opacity-50 cursor-not-allowed bg-[var(--diagram-surface)] border border-[var(--diagram-border)] text-[var(--text-muted)]'
                  : 'cursor-pointer bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
              }`}
            >
              <DoorOpen className="w-3.5 h-3.5" aria-hidden="true" />
              {doorOpen ? '已耗尽开门机会' : '打开暗室门（仅限 1 次）'}
            </button>
          </div>
        </div>

        {/* 最终报号作答 */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[12px]">
          <span className="text-[var(--text-secondary)]">最终作答（仅限 1 次）：</span>
          {SWITCH_IDS.map((id) => (
            <button
              key={`ans-${id}`}
              type="button"
              disabled={outcome !== 'playing'}
              onClick={() => submitAnswer(id)}
              className={`px-3.5 py-1 rounded-full border font-semibold transition-colors ${
                outcome !== 'playing'
                  ? 'opacity-50 cursor-not-allowed border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-muted)]'
                  : 'cursor-pointer border-[var(--diagram-brass)]/70 bg-[var(--diagram-panel)] text-[var(--text-primary)] hover:bg-[var(--diagram-brass)] hover:text-[var(--btn-primary-fg)]'
              }`}
            >
              锁定开关 {id}
            </button>
          ))}
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            outcome === 'won'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : outcome === 'lost'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        白炽灯通电发热的特性创造了第三个信息维度：先开 A 加热后关掉、再开 B 后开门，靠「亮 / 灭而温 / 灭而凉」即可一次锁定唯一开关。
      </p>
    </div>
  );
}

/* ============================================================================
 * 6. alice-6-diamonds-blackjack · 方块6·二十一点
 * 套绞索 21 点记牌台：有限副牌不洗牌 + 已出高低牌计数 + 筹码归零绞索收紧线
 * ========================================================================== */

interface BJCard {
  rank: string;
  suit: '♠' | '♥' | '♦' | '♣';
  val: number;
  red?: boolean;
}

const BJ_SHOE: BJCard[] = [
  { rank: '5', suit: '♣', val: 5 },
  { rank: '6', suit: '♥', val: 6, red: true },
  { rank: '4', suit: '♠', val: 4 },
  { rank: '2', suit: '♦', val: 2, red: true },
  { rank: '3', suit: '♣', val: 3 },
  { rank: '9', suit: '♠', val: 9 },
  { rank: 'K', suit: '♥', val: 10, red: true },
  { rank: 'A', suit: '♠', val: 11 },
  { rank: '10', suit: '♦', val: 10, red: true },
  { rank: 'J', suit: '♣', val: 10 },
  { rank: 'Q', suit: '♥', val: 10, red: true },
  { rank: '6', suit: '♠', val: 6 },
  { rank: '10', suit: '♠', val: 10 },
  { rank: 'K', suit: '♦', val: 10, red: true },
  { rank: '5', suit: '♥', val: 5, red: true },
  { rank: 'A', suit: '♦', val: 11, red: true },
  { rank: '8', suit: '♣', val: 8 },
  { rank: 'Q', suit: '♠', val: 10 },
  { rank: '4', suit: '♥', val: 4, red: true },
  { rank: 'J', suit: '♦', val: 10, red: true },
  { rank: '3', suit: '♠', val: 3 },
  { rank: '9', suit: '♥', val: 9, red: true },
  { rank: 'K', suit: '♣', val: 10 },
  { rank: '7', suit: '♦', val: 7, red: true },
];

function handTotal(cards: BJCard[]): number {
  let sum = 0;
  let aces = 0;
  for (const c of cards) {
    sum += c.val;
    if (c.rank === 'A') aces += 1;
  }
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces -= 1;
  }
  return sum;
}

function BlackjackNooseDiagram() {
  const [shoeIdx, setShoeIdx] = useState<number>(0);
  const [chips, setChips] = useState<number>(400);
  const [bet, setBet] = useState<number>(100);
  const [playerHand, setPlayerHand] = useState<BJCard[]>([]);
  const [dealerHand, setDealerHand] = useState<BJCard[]>([]);
  const [inRound, setInRound] = useState<boolean>(false);
  const [seenCards, setSeenCards] = useState<BJCard[]>([]);
  const [outcome, setOutcome] = useState<'playing' | 'won' | 'hanged'>('playing');
  const [status, setStatus] = useState<string>('有限牌靴连续发牌不洗牌。前几轮多出小牌后，剩余大牌密集时加注更易逼近 21 点。');

  const highSeen = seenCards.filter((c) => c.val >= 10).length;
  const lowSeen = seenCards.filter((c) => c.val <= 6).length;
  const hiLoCount = lowSeen - highSeen;
  const remainCount = BJ_SHOE.length - shoeIdx;
  const safeTarget = 800;

  const dealRound = () => {
    if (outcome !== 'playing' || inRound) return;
    if (remainCount < 5) {
      setStatus('本靴牌已近耗尽，请重置牌靴重新体验记牌控注。');
      return;
    }
    const actualBet = Math.min(bet, chips);
    setBet(actualBet);
    const p = [BJ_SHOE[shoeIdx], BJ_SHOE[shoeIdx + 2]];
    const d = [BJ_SHOE[shoeIdx + 1], BJ_SHOE[shoeIdx + 3]];
    const nextIdx = shoeIdx + 4;
    setShoeIdx(nextIdx);
    setPlayerHand(p);
    setDealerHand(d);
    setSeenCards((prev) => [...prev, p[0], p[1], d[0]]);
    setInRound(true);

    if (handTotal(p) === 21) {
      setSeenCards((prev) => [...prev, d[1]]);
      const nextChips = chips + Math.round(actualBet * 1.5);
      setChips(nextChips);
      setInRound(false);
      if (nextChips >= safeTarget) {
        setOutcome('won');
        setStatus(`起手 21 点黑杰克！筹码涨至 ${nextChips} 越过安全线，绞索解锁通关！`);
      } else {
        setStatus(`起手黑杰克赢得 ${Math.round(actualBet * 1.5)} 筹码（当前 ${nextChips}）！`);
      }
    } else {
      setStatus(`已押注 ${actualBet} 筹码。你目前 ${handTotal(p)} 点，庄家明牌 ${d[0].rank}${d[0].suit}。`);
    }
  };

  const settle = (pCards: BJCard[], curIdx: number) => {
    const dCards = [...dealerHand];
    let idx = curIdx;
    const newlyRevealed: BJCard[] = [dCards[1]];

    while (handTotal(dCards) < 17 && idx < BJ_SHOE.length) {
      const drawn = BJ_SHOE[idx];
      dCards.push(drawn);
      newlyRevealed.push(drawn);
      idx += 1;
    }
    setShoeIdx(idx);
    setDealerHand(dCards);
    setSeenCards((prev) => [...prev, ...newlyRevealed]);
    setInRound(false);

    const pTot = handTotal(pCards);
    const dTot = handTotal(dCards);
    let nextChips = chips;
    let msg = '';

    if (pTot > 21) {
      nextChips = Math.max(0, chips - bet);
      msg = `你爆牌（${pTot} 点），损失 ${bet} 筹码！`;
    } else if (dTot > 21 || pTot > dTot) {
      nextChips = chips + bet;
      msg = `你 ${pTot} 点击败庄家 ${dTot} 点，赢得 ${bet} 筹码！`;
    } else if (pTot < dTot) {
      nextChips = Math.max(0, chips - bet);
      msg = `你 ${pTot} 点不敌庄家 ${dTot} 点，损失 ${bet} 筹码！`;
    } else {
      msg = `双方同为 ${pTot} 点和局，筹码退还。`;
    }

    setChips(nextChips);
    if (nextChips <= 0) {
      setOutcome('hanged');
      setStatus(`${msg} 筹码清零，头顶绞索瞬间收紧淘汰！`);
    } else if (nextChips >= safeTarget) {
      setOutcome('won');
      setStatus(`${msg} 筹码达到 ${nextChips} 越过安全线，熬垮同桌通关！`);
    } else {
      setStatus(`${msg}（当前剩余 ${nextChips} 筹码）`);
    }
  };

  const handleHit = () => {
    if (!inRound || outcome !== 'playing' || shoeIdx >= BJ_SHOE.length) return;
    const drawn = BJ_SHOE[shoeIdx];
    const nextP = [...playerHand, drawn];
    const nextIdx = shoeIdx + 1;
    setPlayerHand(nextP);
    setShoeIdx(nextIdx);
    setSeenCards((prev) => [...prev, drawn]);

    const tot = handTotal(nextP);
    if (tot >= 21) {
      settle(nextP, nextIdx);
    } else {
      setStatus(`补到 ${drawn.rank}${drawn.suit}，当前 ${tot} 点。可继续要牌或停牌。`);
    }
  };

  const reset = () => {
    setShoeIdx(0);
    setChips(400);
    setBet(100);
    setPlayerHand([]);
    setDealerHand([]);
    setInRound(false);
    setSeenCards([]);
    setOutcome('playing');
    setStatus('有限牌靴连续发牌不洗牌。前几轮多出小牌后，剩余大牌密集时加注更易逼近 21 点。');
  };

  const chipPct = Math.min(100, Math.round((chips / safeTarget) * 100));

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 牌靴与记牌统计 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[var(--text-primary)]">
              <Layers className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
              余牌：<strong className="tabular-nums">{remainCount}/{BJ_SHOE.length}</strong>
            </span>
            <span className="text-[var(--text-secondary)] tabular-nums">
              已出小牌(2-6)：<strong className="text-[var(--diagram-brass)]">{lowSeen}</strong>
            </span>
            <span className="text-[var(--text-secondary)] tabular-nums">
              已出高牌(10-A)：<strong className="text-[var(--diagram-accent)]">{highSeen}</strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                hiLoCount >= 2
                  ? 'bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                  : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
              }`}
            >
              真数倾向：{hiLoCount >= 0 ? `+${hiLoCount}` : hiLoCount}
              {hiLoCount >= 2 ? '（大牌密集）' : ''}
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

        {/* 筹码与绞索收紧线 */}
        <div className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-[var(--diagram-accent)] font-semibold">0 · 绞索收紧线</span>
            <span className="text-[var(--text-primary)] font-bold tabular-nums">当前筹码：{chips}</span>
            <span className="text-[var(--diagram-brass)] font-semibold">{safeTarget} · 通关安全线</span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--diagram-surface)] border border-[var(--border-hairline)] overflow-hidden">
            <div
              className={`h-full transition-all ${
                chips <= 150 ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
              }`}
              style={{ width: `${chipPct}%` }}
            />
          </div>
        </div>

        {/* 牌桌区 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-3 space-y-2">
            <div className="flex items-center justify-between text-[11.5px] text-[var(--text-secondary)]">
              <span>系统庄家</span>
              <span className="tabular-nums font-semibold text-[var(--text-primary)]">
                {dealerHand.length === 0 ? '—' : inRound ? `${dealerHand[0].val} + ?` : `${handTotal(dealerHand)} 点`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[54px] items-center">
              {dealerHand.length === 0 ? (
                <span className="text-[11.5px] text-[var(--text-muted)]">点击下方发牌开局</span>
              ) : (
                dealerHand.map((c, i) => {
                  const hidden = inRound && i === 1;
                  return (
                    <div
                      key={`d-${i}-${c.rank}${c.suit}`}
                      className="w-11 h-14 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] flex flex-col items-center justify-center"
                    >
                      {hidden ? (
                        <span className="text-[14px] font-bold text-[var(--text-muted)]">?</span>
                      ) : (
                        <>
                          <span className={`text-[13px] font-bold leading-none ${c.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'}`}>
                            {c.rank}
                          </span>
                          <span className={`text-[12px] mt-0.5 leading-none ${c.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-secondary)]'}`}>
                            {c.suit}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--diagram-brass)]/50 bg-[var(--diagram-panel)] p-3 space-y-2">
            <div className="flex items-center justify-between text-[11.5px] text-[var(--text-secondary)]">
              <span>你的手牌</span>
              <span className="tabular-nums font-semibold text-[var(--diagram-brass)]">
                {playerHand.length === 0 ? '—' : `${handTotal(playerHand)} 点`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[54px] items-center">
              {playerHand.length === 0 ? (
                <span className="text-[11.5px] text-[var(--text-muted)]">先设定押注额再发牌</span>
              ) : (
                playerHand.map((c, i) => (
                  <div
                    key={`p-${i}-${c.rank}${c.suit}`}
                    className="w-11 h-14 rounded-lg border border-[var(--diagram-brass)]/60 bg-[var(--diagram-surface)] flex flex-col items-center justify-center"
                  >
                    <span className={`text-[13px] font-bold leading-none ${c.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'}`}>
                      {c.rank}
                    </span>
                    <span className={`text-[12px] mt-0.5 leading-none ${c.red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-secondary)]'}`}>
                      {c.suit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 押注与操作 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-[11.5px]">
            <span className="text-[var(--text-secondary)]">押注：</span>
            {[100, 200, 300].map((v) => (
              <button
                key={v}
                type="button"
                disabled={inRound || outcome !== 'playing'}
                onClick={() => setBet(v)}
                className={`px-2.5 py-1 rounded-full font-semibold tabular-nums cursor-pointer transition-colors ${
                  bet === v
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!inRound ? (
              <button
                type="button"
                disabled={outcome !== 'playing'}
                onClick={dealRound}
                className="px-4 py-1.5 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-bold cursor-pointer disabled:opacity-50"
              >
                发牌开局
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleHit}
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-bold cursor-pointer"
                >
                  要牌 Hit
                </button>
                <button
                  type="button"
                  onClick={() => settle(playerHand, shoeIdx)}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)] text-[12px] font-semibold cursor-pointer"
                >
                  停牌 Stand
                </button>
              </>
            )}
          </div>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            outcome === 'won'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : outcome === 'hanged'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        牌靴连续不洗牌让算牌成为唯一破局点：小牌大量消耗后高牌占比攀升，此时加大押注可显著拉高胜率。
      </p>
    </div>
  );
}

/* ============================================================================
 * 7. alice-10-hearts-witch-hunt · 红心10·狩猎魔女
 * 海滨酒店 2 小时倒计时 + 审判之火 + 百人恐慌度 + 武斗清洗误杀 vs 物证推理
 * ========================================================================== */

const WITCH_CLUES = [
  { id: 0, title: '① 大厅门禁与动线', detail: '案发前后无外人闯入痕迹，排除远距离狙击。' },
  { id: 1, title: '② 凶器握痕与伤角', detail: '伤痕角度反常，与常规他杀博弈轨迹不符。' },
  { id: 2, title: '③ 现场残留证物', detail: '锁定真正符合「魔女」定义的唯一目标，无需盲目牵连无辜者！' },
];

function WitchHuntDiagram() {
  const [mode, setMode] = useState<'purge' | 'deduce'>('purge');
  const [minutesLeft, setMinutesLeft] = useState<number>(120);
  const [alive, setAlive] = useState<number>(100);
  const [panic, setPanic] = useState<number>(45);
  const [checkedClues, setCheckedClues] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<'playing' | 'won' | 'massacre'>('playing');
  const [status, setStatus] = useState<string>('规则不限制杀戮手段——切换「武斗清洗」与「物证推理」，对比两种策略如何左右审判之火。');

  const allCluesFound = checkedClues.length === WITCH_CLUES.length;

  const doPurge = () => {
    if (outcome !== 'playing') return;
    const nextAlive = Math.max(8, alive - 24);
    const nextMin = Math.max(0, minutesLeft - 30);
    const nextPanic = Math.min(100, panic + 20);
    setAlive(nextAlive);
    setMinutesLeft(nextMin);
    setPanic(nextPanic);

    if (nextMin <= 0 || nextAlive <= 12) {
      setOutcome('massacre');
      setStatus('酒店陷入无差别屠杀，百余人几乎殆尽却仍未投对真魔女，倒计时归零全员抹杀！');
    } else {
      setStatus(`武斗派强行将 24 名可疑者投入火海（余 ${nextAlive} 人）——审判之火并未熄灭，恐慌度飙升至 ${nextPanic}%！`);
    }
  };

  const inspectClue = (id: number) => {
    if (outcome !== 'playing' || checkedClues.includes(id)) return;
    const next = [...checkedClues, id];
    const nextMin = Math.max(15, minutesLeft - 15);
    const nextPanic = Math.max(15, panic - 10);
    setCheckedClues(next);
    setMinutesLeft(nextMin);
    setPanic(nextPanic);
    setStatus(`核查「${WITCH_CLUES[id].title}」：${WITCH_CLUES[id].detail}`);
  };

  const throwTrueWitch = () => {
    if (outcome !== 'playing' || !allCluesFound) return;
    setOutcome('won');
    setPanic(0);
    setStatus(`将查明真相后的真正「魔女」投入审判之火！火柱瞬间熄灭，激光围墙解除，剩余 ${alive} 人全员通关！`);
  };

  const reset = () => {
    setMinutesLeft(120);
    setAlive(100);
    setPanic(45);
    setCheckedClues([]);
    setOutcome('playing');
    setStatus('规则不限制杀戮手段——切换「武斗清洗」与「物证推理」，对比两种策略如何左右审判之火。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="inline-flex rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-0.5">
            <button
              type="button"
              onClick={() => setMode('purge')}
              className={`px-3 py-1 rounded-full text-[11.5px] font-semibold cursor-pointer transition-colors ${
                mode === 'purge'
                  ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              武斗清洗误杀
            </button>
            <button
              type="button"
              onClick={() => setMode('deduce')}
              className={`px-3 py-1 rounded-full text-[11.5px] font-semibold cursor-pointer transition-colors ${
                mode === 'deduce'
                  ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              物证推理寻真
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

        {/* 酒店三项实时仪表：倒计时 / 审判之火 / 百人恐慌度 */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-2.5 text-center">
            <div className="text-[10.5px] text-[var(--text-secondary)]">剩余时间</div>
            <div className="text-[17px] font-bold tabular-nums text-[var(--text-primary)] mt-0.5">
              {Math.floor(minutesLeft / 60)}:{String(minutesLeft % 60).padStart(2, '0')}
            </div>
          </div>

          <div
            className={`rounded-xl border p-2.5 text-center transition-colors ${
              outcome === 'won'
                ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                : 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_12%,var(--diagram-panel))]'
            }`}
          >
            <div className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[var(--diagram-accent)]">
              <Flame className="w-3.5 h-3.5" aria-hidden="true" />
              审判之火
            </div>
            <div className={`text-[13px] font-bold mt-1 ${outcome === 'won' ? 'text-[var(--diagram-brass)]' : 'text-[var(--diagram-accent)]'}`}>
              {outcome === 'won' ? '已熄灭 · 通关' : '烈焰焚烧中'}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-2.5 text-center">
            <div className="text-[10.5px] text-[var(--text-secondary)]">恐慌度 / 在场</div>
            <div className="text-[14px] font-bold tabular-nums text-[var(--diagram-accent)] mt-0.5">
              {panic}% · {alive}人
            </div>
          </div>
        </div>

        {/* 模式专属交互区 */}
        {mode === 'purge' ? (
          <div className="rounded-xl border border-[var(--diagram-accent)]/50 bg-[var(--diagram-panel)] p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">「把所有人都烧光总能烧到魔女」</strong>——恐慌蔓延导致武斗派无差别抓捕，但误杀平民只会加速秩序崩溃。
            </div>
            <button
              type="button"
              disabled={outcome !== 'playing'}
              onClick={doPurge}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--diagram-accent)] text-[var(--accent-fg)] text-[12px] font-bold cursor-pointer disabled:opacity-50"
            >
              <Flame className="w-4 h-4" aria-hidden="true" />
              误抓 24 人投火
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {WITCH_CLUES.map((clue) => {
                const done = checkedClues.includes(clue.id);
                return (
                  <button
                    key={clue.id}
                    type="button"
                    disabled={done || outcome !== 'playing'}
                    onClick={() => inspectClue(clue.id)}
                    className={`rounded-lg border p-2.5 text-left transition-all ${
                      done
                        ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] cursor-default'
                        : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11.5px] font-semibold text-[var(--text-primary)]">
                      <span>{clue.title}</span>
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                      {done ? clue.detail : '点击勘验现场物证'}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                disabled={!allCluesFound || outcome !== 'playing'}
                onClick={throwTrueWitch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-bold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <Flame className="w-4 h-4" aria-hidden="true" />
                {allCluesFound ? '将真正「魔女」投入审判之火' : `先完成全部 3 项物证推理（${checkedClues.length}/3）`}
              </button>
            </div>
          </div>
        )}

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            outcome === 'won'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : outcome === 'massacre'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        红心局的陷阱在于放任恐慌发酵：规则不阻止互相残杀，唯有冷静查验物证才能避免无辜者白白丧命。
      </p>
    </div>
  );
}

/* ============================================================================
 * 8. alice-k-clubs-osmosis · 梅花K·点数争夺战
 * 5v5 码头点数争夺：自由分配 10000 初始点数 + 单人碰撞 / 牵手合力 / 摸铁柱 / 碰守柱者
 * ========================================================================== */

function OsmosisDockDiagram() {
  const [alloc, setAlloc] = useState<number[]>([3500, 2500, 2000, 1500, 500]);
  const [selectedIdx, setSelectedIdx] = useState<number>(1);
  const [enemyTotal, setEnemyTotal] = useState<number>(10000);
  const [bonusDelta, setBonusDelta] = useState<number>(0);
  const [status, setStatus] = useState<string>('调整我方 5 人初始 10000 点分配（每人至少 100），再模拟码头遭遇事件观察总分逆转。');

  const ourBase = alloc.reduce((a, b) => a + b, 0);
  const ourTotal = ourBase + bonusDelta;
  const enemyPatrolPts = 2800;

  const shiftPoints = (fromIdx: number, toIdx: number, amount: number) => {
    if (alloc[fromIdx] - amount < 100) return;
    setAlloc((prev) => prev.map((v, i) => (i === fromIdx ? v - amount : i === toIdx ? v + amount : v)));
  };

  const applyPreset = (preset: number[], label: string) => {
    setAlloc(preset);
    setBonusDelta(0);
    setEnemyTotal(10000);
    setStatus(`已切换为「${label}」配置（总计 10000 点），可点击下方模拟码头对抗。`);
  };

  const simulateSoloBattle = () => {
    const mine = alloc[selectedIdx];
    if (mine > enemyPatrolPts) {
      setBonusDelta((d) => d + 500);
      setEnemyTotal((e) => Math.max(0, e - 500));
      setStatus(`单人碰撞：${selectedIdx + 1}号（${mine}点）> 敌巡逻（${enemyPatrolPts}点），成功夺走 500 点！`);
    } else if (mine < enemyPatrolPts) {
      setBonusDelta((d) => d - 500);
      setEnemyTotal((e) => e + 500);
      setStatus(`单人碰撞：${selectedIdx + 1}号（${mine}点）< 敌巡逻（${enemyPatrolPts}点），反被夺走 500 点！`);
    } else {
      setStatus(`单人碰撞：双方同为 ${mine} 点，点数持平未发生转移。`);
    }
  };

  const simulateLinkBattle = () => {
    const partnerIdx = (selectedIdx + 1) % 5;
    const combined = alloc[selectedIdx] + alloc[partnerIdx];
    if (combined > enemyPatrolPts) {
      setBonusDelta((d) => d + 500);
      setEnemyTotal((e) => Math.max(0, e - 500));
      setStatus(
        `双人牵手合力：${selectedIdx + 1}号（${alloc[selectedIdx]}）+ ${partnerIdx + 1}号（${alloc[partnerIdx]}）= ${combined} 点 > 敌巡逻（${enemyPatrolPts}），合力夺得 500 点！`
      );
    } else {
      setBonusDelta((d) => d - 500);
      setEnemyTotal((e) => e + 500);
      setStatus(`双人牵手合力（${combined}点）仍低于敌方（${enemyPatrolPts}点），被夺走 500 点。`);
    }
  };

  const simulateBaseTouch = () => {
    setBonusDelta((d) => d + 10000);
    setStatus('奇袭成功！成功触碰敌方大本营铁柱，全队瞬间狂揽 +10,000 点巨分！');
  };

  const simulateDefenderHit = () => {
    setBonusDelta((d) => d - 10000);
    setEnemyTotal((e) => e + 10000);
    setStatus('偷袭失手！在敌方基地碰上正在触柱防守的敌方守柱者，瞬间倒扣 -10,000 点！');
  };

  const reset = () => {
    setAlloc([3500, 2500, 2000, 1500, 500]);
    setSelectedIdx(1);
    setBonusDelta(0);
    setEnemyTotal(10000);
    setStatus('调整我方 5 人初始 10000 点分配（每人至少 100），再模拟码头遭遇事件观察总分逆转。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 总分比分板 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[var(--text-primary)]">
              我方总分：
              <strong className="tabular-nums text-[15px] text-[var(--diagram-brass)]">{ourTotal.toLocaleString()}</strong>
            </span>
            <span className="text-[var(--text-muted)]">vs</span>
            <span className="text-[var(--text-primary)]">
              梅花 K 队：
              <strong className="tabular-nums text-[15px] text-[var(--diagram-accent)]">{enemyTotal.toLocaleString()}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset([2000, 2000, 2000, 2000, 2000], '五人均衡')}
              className="px-2 py-0.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              均衡
            </button>
            <button
              type="button"
              onClick={() => applyPreset([6500, 1500, 1000, 500, 500], '单核主力 + 低分奇兵')}
              className="px-2 py-0.5 rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              单核奇兵
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重置
            </button>
          </div>
        </div>

        {/* 5 人手环初始点数分配 */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {alloc.map((pts, i) => {
            const selected = selectedIdx === i;
            const donor = i === 0 ? 1 : 0;
            return (
              <div
                key={i}
                onClick={() => setSelectedIdx(i)}
                className={`rounded-xl border p-2 text-center cursor-pointer transition-all ${
                  selected
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))]'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)]/60'
                }`}
              >
                <div className="text-[10.5px] text-[var(--text-secondary)]">{i + 1}号手环</div>
                <div className="text-[13px] sm:text-[14px] font-bold tabular-nums text-[var(--text-primary)] my-0.5">
                  {pts}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <button
                    type="button"
                    aria-label={`${i + 1}号减少500点`}
                    onClick={(e) => {
                      e.stopPropagation();
                      shiftPoints(i, donor, 500);
                    }}
                    className="w-5 h-5 rounded bg-[var(--diagram-surface)] border border-[var(--diagram-border)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    aria-label={`${i + 1}号增加500点`}
                    onClick={(e) => {
                      e.stopPropagation();
                      shiftPoints(donor, i, 500);
                    }}
                    className="w-5 h-5 rounded bg-[var(--diagram-surface)] border border-[var(--diagram-border)] text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 四类核心碰撞/铁柱机制 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={simulateSoloBattle}
            className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] px-3 py-2 text-left cursor-pointer transition-colors"
          >
            <div className="text-[12px] font-semibold text-[var(--text-primary)]">
              单人碰撞（{selectedIdx + 1}号 {alloc[selectedIdx]} vs 敌 {enemyPatrolPts}）
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">点数高者直接夺走低者 500 点</div>
          </button>

          <button
            type="button"
            onClick={simulateLinkBattle}
            className="rounded-lg border border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_10%,var(--diagram-panel))] hover:border-[var(--diagram-brass)] px-3 py-2 text-left cursor-pointer transition-colors"
          >
            <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--diagram-brass)]">
              <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
              双人牵手合力（{selectedIdx + 1}号 + {((selectedIdx + 1) % 5) + 1}号 = {alloc[selectedIdx] + alloc[(selectedIdx + 1) % 5]}）
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">牵手双方点数相加后再比大小</div>
          </button>

          <button
            type="button"
            onClick={simulateBaseTouch}
            className="rounded-lg border border-[var(--diagram-brass)]/60 bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] px-3 py-2 text-left cursor-pointer transition-colors"
          >
            <div className="text-[12px] font-semibold text-[var(--diagram-brass)]">摸敌方基地铁柱（+10,000 点）</div>
            <div className="text-[11px] text-[var(--text-secondary)]">趁敌方防守空虚直取大本营巨分</div>
          </button>

          <button
            type="button"
            onClick={simulateDefenderHit}
            className="rounded-lg border border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_8%,var(--diagram-panel))] hover:border-[var(--diagram-accent)] px-3 py-2 text-left cursor-pointer transition-colors"
          >
            <div className="text-[12px] font-semibold text-[var(--diagram-accent)]">碰敌方守柱者（-10,000 点）</div>
            <div className="text-[11px] text-[var(--text-secondary)]">触及手扶铁柱的敌方守卫瞬间巨额倒扣</div>
          </button>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            ourTotal > enemyTotal
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_14%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : ourTotal < enemyTotal
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        低分成员单打易丢 500 点，但只要与队友牵手即可叠加点数以弱胜强，还能化身低风险奇兵偷袭敌方铁柱。
      </p>
    </div>
  );
}

/* ============================================================================
 * 9. alice-j-hearts-solitary · 红心J·单人牢房
 * 颈后随机刷新四花色（不可自视禁照镜）+ 他人诚实/谎报 + 5 分钟单人房作答
 * ========================================================================== */

type SuitKey = 'spade' | 'heart' | 'club' | 'diamond';

const SUIT_META: Record<SuitKey, { label: string; symbol: string; red?: boolean }> = {
  spade: { label: '黑桃', symbol: '♠' },
  heart: { label: '红心', symbol: '♥', red: true },
  club: { label: '梅花', symbol: '♣' },
  diamond: { label: '方块', symbol: '♦', red: true },
};

const SUIT_ORDER: SuitKey[] = ['spade', 'heart', 'club', 'diamond'];

function SolitaryConfinementDiagram() {
  const [round, setRound] = useState<number>(1);
  const [trueSuit, setTrueSuit] = useState<SuitKey>('heart');
  const [informantMode, setInformantMode] = useState<'honest' | 'deceive'>('honest');
  const [outcome, setOutcome] = useState<'playing' | 'survived' | 'dead'>('playing');
  const [status, setStatus] = useState<string>('本轮颈后花色已刷新（自己不可看）。听取牢友告知后，进入单人牢房 5 分钟内报出花色。');

  const lieSuit = SUIT_ORDER[(SUIT_ORDER.indexOf(trueSuit) + 2) % 4];
  const toldSuit: SuitKey = informantMode === 'honest' ? trueSuit : lieSuit;

  const answerSuit = (guess: SuitKey) => {
    if (outcome !== 'playing') return;
    if (guess === trueSuit) {
      setOutcome('survived');
      setStatus(`单人房播报正确！你的颈后确为「${SUIT_META[trueSuit].symbol} ${SUIT_META[trueSuit].label}」，活过第 ${round} 轮！`);
    } else {
      setOutcome('dead');
      setStatus(
        `单人房播报错误！你报了「${SUIT_META[guess].label}」，实际颈后是「${SUIT_META[trueSuit].symbol} ${SUIT_META[trueSuit].label}」——项圈瞬间引爆！`
      );
    }
  };

  const peekMirror = () => {
    if (outcome !== 'playing') return;
    setOutcome('dead');
    setStatus('触发铁律：试图利用镜面/玻璃反光偷看颈后花色，项圈即刻引爆处决！');
  };

  const nextRound = () => {
    const nextIdx = (round * 3 + 1) % 4;
    setRound((r) => r + 1);
    setTrueSuit(SUIT_ORDER[nextIdx]);
    setOutcome('playing');
    setStatus(`第 ${round + 1} 轮开始！所有囚犯颈后花色已重新随机刷新，你依然只能靠他人告知。`);
  };

  const reset = () => {
    setRound(1);
    setTrueSuit('heart');
    setInformantMode('honest');
    setOutcome('playing');
    setStatus('本轮颈后花色已刷新（自己不可看）。听取牢友告知后，进入单人牢房 5 分钟内报出花色。');
  };

  const renderSuitIcon = (suit: SuitKey) => {
    const cls = `w-4 h-4 ${SUIT_META[suit].red ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'}`;
    if (suit === 'spade') return <Spade className={cls} aria-hidden="true" />;
    if (suit === 'heart') return <Heart className={cls} aria-hidden="true" />;
    if (suit === 'club') return <Club className={cls} aria-hidden="true" />;
    return <Diamond className={cls} aria-hidden="true" />;
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[var(--diagram-brass)] tabular-nums">第 {round} 轮 · 单人房限时 05:00</span>
            <div className="inline-flex rounded-full border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-0.5">
              <button
                type="button"
                onClick={() => setInformantMode('honest')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                  informantMode === 'honest'
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                牢友诚实告知
              </button>
              <button
                type="button"
                onClick={() => setInformantMode('deceive')}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                  informantMode === 'deceive'
                    ? 'bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                遭故意谎报
              </button>
            </div>
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

        {/* 颈后盲区 vs 他人告知 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-3 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-[11px] text-[var(--text-secondary)]">你的颈后爆炸项圈</span>
            {outcome === 'playing' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[13px] font-bold text-[var(--text-muted)]">
                <EyeOff className="w-4 h-4" aria-hidden="true" />
                盲区不可自视
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--diagram-brass)] bg-[var(--diagram-surface)] text-[14px] font-bold text-[var(--text-primary)]">
                {renderSuitIcon(trueSuit)}
                <span>真实花色：{SUIT_META[trueSuit].label}</span>
              </div>
            )}
            <button
              type="button"
              disabled={outcome !== 'playing'}
              onClick={peekMirror}
              className="text-[11px] text-[var(--diagram-accent)] underline underline-offset-2 cursor-pointer disabled:opacity-40"
            >
              试图照反光镜面偷看（违规）
            </button>
          </div>

          <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-3 flex flex-col justify-center gap-1.5">
            <span className="text-[11px] text-[var(--text-secondary)]">自由交流阶段 · 牢友低语</span>
            <div className="text-[13px] font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>「我看到你颈后是</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--diagram-surface)] border border-[var(--diagram-border)]">
                {renderSuitIcon(toldSuit)}
                {SUIT_META[toldSuit].label}
              </span>
              <span>」</span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">
              {informantMode === 'honest'
                ? '（当前模拟：可信搭档如实相告）'
                : '（当前模拟：对方暗藏杀心或受红心 J 唆使报了假花色！）'}
            </span>
          </div>
        </div>

        {/* 单人牢房四花色作答 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SUIT_ORDER.map((suit) => (
            <button
              key={suit}
              type="button"
              disabled={outcome !== 'playing'}
              onClick={() => answerSuit(suit)}
              className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] py-2.5 px-3 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-[var(--text-primary)] cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
            >
              {renderSuitIcon(suit)}
              <span>报「{SUIT_META[suit].label}」</span>
            </button>
          ))}
        </div>

        {outcome === 'survived' && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={nextRound}
              className="px-4 py-1.5 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-bold cursor-pointer"
            >
              进入第 {round + 1} 轮（刷新花色）
            </button>
          </div>
        )}

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            outcome === 'survived'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : outcome === 'dead'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        每个人把性命托付给他人双眼，信任链一旦混入一句谎报便会瞬间夺命，直至揪出隐藏的红心 J 才终止循环。
      </p>
    </div>
  );
}

/* ============================================================================
 * 10. alice-j-diamonds-mahjong · 方块J·麻将
 * 四人纯立直麻将生死点棒榜（无机关），微差读牌/进攻立直推进半庄点棒变化
 * ========================================================================== */

const MAHJONG_ROUNDS = ['东一局', '东四局', '南二局', '南四局（终局）'];

function MahjongTableDiagram() {
  const [roundIdx, setRoundIdx] = useState<number>(0);
  const [scores, setScores] = useState<{ you: number; jack: number; east: number; north: number }>({
    you: 25000,
    jack: 25000,
    east: 25000,
    north: 25000,
  });
  const [status, setStatus] = useState<string>('纯四人日本立直麻将（无额外机关）。选择打法推进半庄，终局点棒压倒方块 J 方可通关。');

  const finished = roundIdx >= MAHJONG_ROUNDS.length;
  const maxScore = Math.max(scores.you, scores.jack, scores.east, scores.north);
  const beatJack = finished && scores.you > scores.jack && scores.you > Math.min(scores.east, scores.north);

  const playHand = (tactic: 'read' | 'riichi' | 'defend') => {
    if (finished) return;
    const label = MAHJONG_ROUNDS[roundIdx];
    let deltaYou = 0;
    let deltaJack = 0;
    let deltaEast = 0;
    let deltaNorth = 0;
    let note = '';

    if (tactic === 'read') {
      deltaYou = 8000;
      deltaJack = -8000;
      note = `${label}：捕捉牌背微差与舍牌节奏，精准直击方块 J 满贯（+8,000）！`;
    } else if (tactic === 'riichi') {
      if (roundIdx % 2 === 0) {
        deltaYou = 12000;
        deltaJack = -6000;
        deltaEast = -3000;
        deltaNorth = -3000;
        note = `${label}：果断立直自摸跳满（+12,000），重创方块 J 与同桌！`;
      } else {
        deltaYou = -8000;
        deltaJack = 8000;
        note = `${label}：盲目强攻立直点炮方块 J 暗听满贯（-8,000）！`;
      }
    } else {
      deltaYou = -2000;
      deltaJack = 4000;
      deltaEast = -1000;
      deltaNorth = -1000;
      note = `${label}：保守兜牌避铳，但放任方块 J 庄家连庄收点（方块 J +4,000）。`;
    }

    const next = {
      you: scores.you + deltaYou,
      jack: scores.jack + deltaJack,
      east: scores.east + deltaEast,
      north: scores.north + deltaNorth,
    };
    const nextIdx = roundIdx + 1;
    setScores(next);
    setRoundIdx(nextIdx);

    if (nextIdx >= MAHJONG_ROUNDS.length) {
      if (next.you > next.jack) {
        setStatus(`${note} 半庄结束：你以 ${next.you.toLocaleString()} 点正面压垮方块 J（${next.jack.toLocaleString()}），收下人头牌通关！`);
      } else {
        setStatus(`${note} 半庄结束：你的点数（${next.you.toLocaleString()}）未能超越方块 J（${next.jack.toLocaleString()}），判定落败淘汰！`);
      }
    } else {
      setStatus(note);
    }
  };

  const reset = () => {
    setRoundIdx(0);
    setScores({ you: 25000, jack: 25000, east: 25000, north: 25000 });
    setStatus('纯四人日本立直麻将（无额外机关）。选择打法推进半庄，终局点棒压倒方块 J 方可通关。');
  };

  const seatList = [
    { key: 'you', name: '你（挑战者）', pts: scores.you, highlight: 'brass' as const },
    { key: 'jack', name: '方块 J（国民）', pts: scores.jack, highlight: 'accent' as const },
    { key: 'east', name: '南家玩家', pts: scores.east, highlight: 'neutral' as const },
    { key: 'north', name: '北家玩家', pts: scores.north, highlight: 'neutral' as const },
  ];

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold">
              {finished ? '半庄结算' : MAHJONG_ROUNDS[roundIdx]}
            </span>
            <span className="text-[var(--text-secondary)]">无花哨机关 · 纯点棒生死战</span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置半庄
          </button>
        </div>

        {/* 四家点棒条 */}
        <div className="space-y-2">
          {seatList.map((s) => {
            const widthPct = Math.max(8, Math.min(100, Math.round((Math.max(0, s.pts) / Math.max(45000, maxScore)) * 100)));
            return (
              <div key={s.key} className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] px-3 py-2 space-y-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span
                    className={`font-semibold ${
                      s.highlight === 'brass'
                        ? 'text-[var(--diagram-brass)]'
                        : s.highlight === 'accent'
                          ? 'text-[var(--diagram-accent)]'
                          : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {s.name}
                  </span>
                  <span className="font-bold tabular-nums text-[var(--text-primary)]">{s.pts.toLocaleString()} 点</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      s.highlight === 'brass'
                        ? 'bg-[var(--diagram-brass)]'
                        : s.highlight === 'accent'
                          ? 'bg-[var(--diagram-accent)]'
                          : 'bg-[var(--text-muted)]'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 本局决策 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            disabled={finished}
            onClick={() => playHand('read')}
            className="rounded-lg border border-[var(--diagram-brass)]/70 bg-[color-mix(in_srgb,var(--diagram-brass)_12%,var(--diagram-panel))] px-3 py-2 text-[12px] font-semibold text-[var(--diagram-brass)] cursor-pointer disabled:opacity-45"
          >
            微差读牌 · 抓听直击
          </button>
          <button
            type="button"
            disabled={finished}
            onClick={() => playHand('riichi')}
            className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-brass)] px-3 py-2 text-[12px] font-semibold text-[var(--text-primary)] cursor-pointer disabled:opacity-45"
          >
            进攻立直 · 高打点对攻
          </button>
          <button
            type="button"
            disabled={finished}
            onClick={() => playHand('defend')}
            className="rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-panel)] hover:border-[var(--diagram-accent)] px-3 py-2 text-[12px] font-semibold text-[var(--text-secondary)] cursor-pointer disabled:opacity-45"
          >
            保守兜牌 · 稳守点棒
          </button>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            beatJack
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : finished
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        方块 J 不靠机关取巧，纯粹在标准立直麻将的舍牌信息与牌背微差里决出点棒高下。
      </p>
    </div>
  );
}

/* ============================================================================
 * 11. alice-k-diamonds-beauty-contest · 方块K·天平
 * 真实可算 0–100 选数器：平均数 × 0.8 + 硫酸扣分天平(-10倾倒) + 3 条追加颠覆新规
 * ========================================================================== */

interface ScalePlayer {
  id: string;
  name: string;
  isUser?: boolean;
  isKing?: boolean;
}

const ALL_SCALE_PLAYERS: ScalePlayer[] = [
  { id: 'you', name: '你', isUser: true },
  { id: 'king', name: '方块 K', isKing: true },
  { id: 'p3', name: '玩家 3' },
  { id: 'p4', name: '玩家 4' },
  { id: 'p5', name: '玩家 5' },
];

const STAGE_AI_PICKS: Record<number, Record<string, number>> = {
  0: { king: 24, p3: 36, p4: 48, p5: 20 },
  1: { king: 18, p3: 25, p4: 25 },
  2: { king: 12, p3: 15 },
  3: { king: 0 },
};

function BeautyContestScaleDiagram() {
  const [elimCount, setElimCount] = useState<number>(0);
  const [myPick, setMyPick] = useState<number>(26);
  const [kingDualPick, setKingDualPick] = useState<number>(0);
  const [scores, setScores] = useState<Record<string, number>>({ you: 0, king: 0, p3: 0, p4: 0, p5: 0 });
  const [lastSummary, setLastSummary] = useState<string>('调整你的 0–100 选数并点击「亮牌称重」，观察「平均数 × 0.8」靶心与硫酸扣分变化。');
  const [lastRoundDetail, setLastRoundDetail] = useState<{
    picks: Record<string, number>;
    avg: number;
    target: number;
    winners: string[];
    duplicates: number[];
    exactHit: boolean;
    hundredBeatsZero: boolean;
  } | null>(null);

  const activePlayers = ALL_SCALE_PLAYERS.slice(0, 5 - elimCount);
  const ruleDupActive = elimCount >= 1;
  const ruleExactActive = elimCount >= 2;
  const ruleZeroHundredActive = elimCount >= 3;

  const evaluateRound = () => {
    const picks: Record<string, number> = {};
    for (const p of activePlayers) {
      if (p.isUser) {
        picks[p.id] = myPick;
      } else if (elimCount === 3 && p.isKing) {
        picks[p.id] = kingDualPick;
      } else {
        picks[p.id] = STAGE_AI_PICKS[elimCount][p.id] ?? 20;
      }
    }

    const values = activePlayers.map((p) => picks[p.id]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const target = avg * 0.8;

    // 规则 ①：同选相同数字无效
    const freq: Record<number, number> = {};
    for (const v of values) freq[v] = (freq[v] ?? 0) + 1;
    const duplicates = ruleDupActive
      ? Object.entries(freq)
          .filter(([, count]) => count > 1)
          .map(([num]) => Number(num))
      : [];

    // 规则 ③：仅剩两人时 100 反杀 0
    const hundredBeatsZero =
      ruleZeroHundredActive &&
      activePlayers.length === 2 &&
      values.includes(0) &&
      values.includes(100);

    let winners: string[] = [];
    let exactHit = false;

    if (hundredBeatsZero) {
      winners = activePlayers.filter((p) => picks[p.id] === 100).map((p) => p.id);
    } else {
      const validPlayers = activePlayers.filter((p) => !duplicates.includes(picks[p.id]));
      if (validPlayers.length > 0) {
        let minDiff = Infinity;
        for (const p of validPlayers) {
          const d = Math.abs(picks[p.id] - target);
          if (d < minDiff) minDiff = d;
        }
        winners = validPlayers.filter((p) => Math.abs(picks[p.id] - target) <= minDiff + 1e-9).map((p) => p.id);
        exactHit = ruleExactActive && winners.some((id) => picks[id] === Math.round(target));
      }
    }

    const penalty = exactHit ? 2 : 1;
    const nextScores = { ...scores };
    for (const p of activePlayers) {
      if (!winners.includes(p.id)) {
        nextScores[p.id] = Math.max(-10, (nextScores[p.id] ?? 0) - penalty);
      }
    }
    setScores(nextScores);
    setLastRoundDetail({ picks, avg, target, winners, duplicates, exactHit, hundredBeatsZero });

    const winnerNames = activePlayers
      .filter((p) => winners.includes(p.id))
      .map((p) => p.name)
      .join('、');

    if (hundredBeatsZero) {
      setLastSummary(`触发新规③！一方选 0 时选 100 直接反杀——${winnerNames} 获胜，对手硫酸 -${penalty} 分！`);
    } else if (winners.length === 0) {
      setLastSummary(`触发新规①！全员撞号全部无效，所有人各扣 1 分注入硫酸！`);
    } else if (exactHit) {
      setLastSummary(`触发新规②！${winnerNames} 正中四舍五入靶心 ${Math.round(target)}，其余人双倍扣 -2 分！`);
    } else {
      setLastSummary(`均数 ${avg.toFixed(1)} × 0.8 = 靶心 ${target.toFixed(1)}。${winnerNames} 最接近获胜，其余人扣 -1 分。`);
    }
  };

  const switchStage = (stage: number) => {
    setElimCount(stage);
    setLastRoundDetail(null);
    if (stage === 3) {
      setMyPick(100);
      setKingDualPick(0);
      setLastSummary('进入 2 人终局（3 条新规全开）：若方块 K 选 0，试试选 100 触发反杀，或切换他的选数博弈！');
    } else if (stage === 1) {
      setMyPick(25);
      setLastSummary('淘汰 1 人（追加规则①）：同选相同数字全员无效并扣分——试试选 25 与其他玩家撞号！');
    } else if (stage === 2) {
      setMyPick(11);
      setLastSummary('淘汰 2 人（追加规则②）：精确命中靶心整数值，其余人直接双倍扣 -2 分！');
    } else {
      setMyPick(26);
      setLastSummary('5 人基础阶段：最接近「全员平均数 × 0.8」者不扣分，其余人 -1 分注入硫酸。');
    }
  };

  const reset = () => {
    setScores({ you: 0, king: 0, p3: 0, p4: 0, p5: 0 });
    setLastRoundDetail(null);
    setLastSummary('硫酸天平已清零。调整你的 0–100 选数并亮牌称重。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 淘汰阶段与新规切换 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { n: 0, label: '5人基础' },
              { n: 1, label: '汰1人·撞号无效' },
              { n: 2, label: '汰2人·正中-2' },
              { n: 3, label: '2人·100杀0' },
            ].map((st) => (
              <button
                key={st.n}
                type="button"
                onClick={() => switchStage(st.n)}
                className={`px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-colors ${
                  elimCount === st.n
                    ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                    : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)] hover:text-[var(--text-primary)]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            清空天平
          </button>
        </div>

        {/* 选数器 */}
        <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-3 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Scale className="w-4 h-4 text-[var(--diagram-brass)]" aria-hidden="true" />
              你的选数：<strong className="text-[18px] tabular-nums text-[var(--diagram-brass)]">{myPick}</strong>
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {[0, 11, 25, 50, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMyPick(v)}
                  className={`px-2 py-0.5 rounded text-[11px] tabular-nums cursor-pointer border ${
                    myPick === v
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-surface))] text-[var(--diagram-brass)] font-bold'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={myPick}
            onChange={(e) => setMyPick(Number(e.target.value))}
            aria-label="选择 0 到 100 的整数"
            className="w-full accent-[var(--diagram-brass)] cursor-pointer"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            {elimCount === 3 ? (
              <div className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]">
                <span>模拟方块 K 出数：</span>
                {[0, 1, 100].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setKingDualPick(v)}
                    className={`px-2 py-0.5 rounded text-[11px] tabular-nums cursor-pointer border ${
                      kingDualPick === v
                        ? 'border-[var(--diagram-accent)] text-[var(--diagram-accent)] font-bold bg-[var(--diagram-surface)]'
                        : 'border-[var(--diagram-border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-[11px] text-[var(--text-muted)]">
                生效规则：均值×0.8{ruleDupActive ? ' · ①撞号无效' : ''}{ruleExactActive ? ' · ②正中-2' : ''}
              </span>
            )}

            <button
              type="button"
              onClick={evaluateRound}
              className="px-4 py-1.5 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-bold cursor-pointer"
            >
              亮牌称重
            </button>
          </div>
        </div>

        {/* 玩家出数与硫酸天平槽 */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {activePlayers.map((p) => {
            const sc = scores[p.id] ?? 0;
            const acidPct = Math.min(100, Math.abs(sc) * 10);
            const isElim = sc <= -10;
            const picked = lastRoundDetail?.picks[p.id];
            const isWin = lastRoundDetail?.winners.includes(p.id);
            const isDup = picked !== undefined && lastRoundDetail?.duplicates.includes(picked);

            return (
              <div
                key={p.id}
                className={`rounded-xl border p-2.5 flex flex-col justify-between gap-1.5 ${
                  isElim
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_20%,var(--diagram-panel))]'
                    : isWin
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${p.isUser ? 'text-[var(--diagram-brass)]' : p.isKing ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'}`}>
                    {p.name}
                  </span>
                  <span className="tabular-nums font-bold text-[var(--text-secondary)]">
                    {picked !== undefined ? picked : '?'}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-[var(--diagram-surface)] border border-[var(--border-hairline)] overflow-hidden">
                  <div className="h-full bg-[var(--diagram-accent)] transition-all" style={{ width: `${acidPct}%` }} />
                </div>

                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="tabular-nums text-[var(--diagram-accent)] font-semibold">{sc} / -10</span>
                  <span className="text-[var(--text-muted)]">
                    {isElim ? '倾倒硫酸' : isDup ? '撞号无效' : isWin ? '本轮胜' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            scores.you <= -10
              ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
              : lastRoundDetail?.winners.includes('you')
                ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {lastSummary}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        理性推演会把选数一路压向 0，但随着淘汰追加的三条新规，尤其终局「100 反杀 0」，把纯粹算术彻底翻转成了心理猜心战。
      </p>
    </div>
  );
}

/* ============================================================================
 * 12. alice-k-spades-survival · 黑桃K·全城大逃杀
 * 全城飞艇追踪雷达示意图（无倒计时、无谜题）+ 街区切换与伏击对比
 * ========================================================================== */

interface CityZone {
  id: string;
  name: string;
  x: number;
  y: number;
  terrain: string;
  frontalResult: string;
  ambushResult: string;
}

const CITY_ZONES: CityZone[] = [
  {
    id: 'shibuya',
    name: '涩谷交叉口',
    x: 24,
    y: 34,
    terrain: '开阔十字路口，毫无掩体',
    frontalResult: '在开阔地正面接战重火力雇佣兵，瞬间遭压制淘汰！',
    ambushResult: '借助地下通道与盲区撤离牵制，但开阔地仍难一击致命。',
  },
  {
    id: 'highway',
    name: '高架主干道',
    x: 68,
    y: 26,
    terrain: '废弃车阵绵延，视线纵深长',
    frontalResult: '车载重机枪沿直线封锁高架桥，强冲毫无胜算！',
    ambushResult: '利用报废车辆制造爆燃障碍，迫使黑桃 K 离开载具步战。',
  },
  {
    id: 'warehouse',
    name: '港口集装箱区',
    x: 76,
    y: 70,
    terrain: '金属货柜林立，近战死角密集',
    frontalResult: '强硬对枪仍不敌单兵重甲与枪法，正面陷入绝境！',
    ambushResult: '诱导进入狭窄货柜通道设下连锁陷阱，有效削弱其火力优势。',
  },
  {
    id: 'pharmacy',
    name: '狭窄商业暗巷',
    x: 34,
    y: 72,
    terrain: '室内狭小空间 + 易燃气体设施',
    frontalResult: '近身搏斗力量悬殊，单纯硬拼仍遭瞬间击溃！',
    ambushResult: '引诱黑桃 K 步入封闭室内触发连环伏击——彻底击毙国民本人，飞艇熄灯通关！',
  },
];

function SpadesKingRadarDiagram() {
  const [zoneId, setZoneId] = useState<string>('shibuya');
  const [tactic, setTactic] = useState<'none' | 'frontal' | 'ambush'>('none');

  const zone = CITY_ZONES.find((z) => z.id === zoneId) ?? CITY_ZONES[0];
  const cleared = zone.id === 'pharmacy' && tactic === 'ambush';

  const selectZone = (id: string) => {
    setZoneId(id);
    setTactic('none');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--diagram-accent)]">
              <Radar className="w-4 h-4" aria-hidden="true" />
              飞艇追踪：{zone.name}上空
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--text-secondary)]">
              无倒计时 · 无谜题
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setZoneId('shibuya');
              setTactic('none');
            }}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置
          </button>
        </div>

        {/* 全城飞艇雷达图 */}
        <div className="relative h-[196px] rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] overflow-hidden">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
            {/* 城市经纬网格 */}
            {[20, 40, 60, 80].map((v) => (
              <g key={v} className="text-[var(--border-hairline)]">
                <line x1={v} y1={0} x2={v} y2={100} stroke="currentColor" strokeWidth="0.4" />
                <line x1={0} y1={v} x2={100} y2={v} stroke="currentColor" strokeWidth="0.4" />
              </g>
            ))}

            {/* 飞艇警戒射程圈（跟随黑桃 K 移动） */}
            <circle
              cx={zone.x}
              cy={zone.y}
              r={cleared ? 8 : 22}
              fill="none"
              stroke={cleared ? 'var(--diagram-brass)' : 'var(--diagram-accent)'}
              strokeWidth="0.8"
              strokeDasharray="2.5 2"
            />
            <circle
              cx={zone.x}
              cy={zone.y}
              r={cleared ? 5 : 13}
              fill={cleared ? 'color-mix(in srgb, var(--diagram-brass) 16%, transparent)' : 'color-mix(in srgb, var(--diagram-accent) 16%, transparent)'}
            />
          </svg>

          {/* 街区交互点 */}
          {CITY_ZONES.map((z) => {
            const active = z.id === zone.id;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => selectZone(z.id)}
                style={{ left: `${z.x}%`, top: `${z.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-[10.5px] font-semibold border cursor-pointer transition-all whitespace-nowrap ${
                  active
                    ? cleared
                      ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] z-10'
                      : 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)] z-10'
                    : 'border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[var(--text-primary)] hover:border-[var(--diagram-brass)]'
                }`}
              >
                {active && !cleared ? '♠K 飞艇 · ' : ''}
                {z.name}
              </button>
            );
          })}
        </div>

        {/* 当前街区战术选择 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">{zone.name}</strong>：{zone.terrain}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTactic('frontal')}
              className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border cursor-pointer transition-colors ${
                tactic === 'frontal'
                  ? 'border-[var(--diagram-accent)] bg-[var(--diagram-accent)] text-[var(--accent-fg)]'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
              }`}
            >
              正面硬拼火力
            </button>
            <button
              type="button"
              onClick={() => setTactic('ambush')}
              className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border cursor-pointer transition-colors ${
                tactic === 'ambush'
                  ? 'border-[var(--diagram-brass)] bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                  : 'border-[var(--diagram-brass)]/70 bg-[var(--diagram-panel)] text-[var(--diagram-brass)]'
              }`}
            >
              借地形设伏反杀
            </button>
          </div>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            cleared
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : tactic === 'frontal'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {tactic === 'none'
            ? `黑桃 K 飞艇实时锁定在「${zone.name}」上空，落入警戒半径即强制参战。点击切换不同街区与应对方式。`
            : tactic === 'frontal'
              ? zone.frontalResult
              : zone.ambushResult}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        飞艇永远悬停在黑桃 K 头顶，既是最显眼的死亡预警，也是全城幸存者寻找并设伏终结他的唯一坐标。
      </p>
    </div>
  );
}

/* ============================================================================
 * 13. alice-q-hearts-croquet · 红心Q·槌球
 * 3 局顶楼槌球进度条（输赢无关）+ 局间喝茶催眠假说：坚持打完 vs 动摇弃权/施暴
 * ========================================================================== */

const TEA_HYPOTHESES = [
  {
    set: 1,
    hypothesis: '假说一：「你其实正身处外星高级文明的观测实验场，再打下去毫无意义。」',
    queenScore: 3,
    yourScore: 1,
  },
  {
    set: 2,
    hypothesis: '假说二：「这里只是千年后的全息虚拟游戏，立刻放弃才能登出醒来。」',
    queenScore: 6,
    yourScore: 2,
  },
  {
    set: 3,
    hypothesis: '假说三：「你一直在精神病院接受创伤治疗，我只是你的主治医师，放下球杆吧。」',
    queenScore: 9,
    yourScore: 3,
  },
];

function CroquetTeaDiagram() {
  const [completedSets, setCompletedSets] = useState<number>(0);
  const [outcome, setOutcome] = useState<'playing' | 'won' | 'quit' | 'violence'>('playing');
  const [status, setStatus] = useState<string>('顶楼空中花园 3 局槌球开始。比分输赢完全无关，只需顶住局间茶歇的心理诱导并打完 3 局。');

  const currentIdx = Math.min(completedSets, TEA_HYPOTHESES.length - 1);
  const current = TEA_HYPOTHESES[currentIdx];

  const finishCurrentSet = () => {
    if (outcome !== 'playing') return;
    const next = completedSets + 1;
    setCompletedSets(next);
    if (next >= 3) {
      setOutcome('won');
      setStatus('第 3 局最后一杆稳稳击出！尽管比分大幅落后，但你完整打完三局未曾放弃——通关红心 Q！');
    } else {
      setStatus(`无视红心 Q 的动摇，完成第 ${next} 局挥杆！进入局间茶歇，更强的心理假说接踵而至……`);
    }
  };

  const giveUp = () => {
    if (outcome !== 'playing') return;
    setOutcome('quit');
    setStatus('你在喝茶交谈时陷入动摇并放下球杆弃权——正中红心 Q 心理陷阱，判定挑战失败！');
  };

  const attackQueen = () => {
    if (outcome !== 'playing') return;
    setOutcome('violence');
    setStatus('情绪失控对红心 Q 施加暴力——触犯唯一禁令，当场判定违规出局！');
  };

  const reset = () => {
    setCompletedSets(0);
    setOutcome('playing');
    setStatus('顶楼空中花园 3 局槌球开始。比分输赢完全无关，只需顶住局间茶歇的心理诱导并打完 3 局。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：进度 + 无关紧要的比分板 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--diagram-brass)]">
              <Flag className="w-3.5 h-3.5" aria-hidden="true" />
              槌球进度：<strong className="tabular-nums">{completedSets} / 3 局</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] text-[11px] text-[var(--text-muted)] tabular-nums">
              比分 你 {current.yourScore} : {current.queenScore} 红心Q（输赢不影响通关）
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

        {/* 三局球门进度条 */}
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((setNum) => {
            const done = completedSets >= setNum;
            const active = outcome === 'playing' && completedSets + 1 === setNum;
            return (
              <div
                key={setNum}
                className={`rounded-xl border py-2.5 px-3 flex flex-col items-center justify-center gap-1 transition-all ${
                  done
                    ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_20%,var(--diagram-panel))] text-[var(--diagram-brass)]'
                    : active
                      ? 'border-[var(--diagram-brass)]/70 bg-[var(--diagram-panel)] text-[var(--text-primary)] ring-1 ring-[var(--diagram-brass)]/40'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-muted)]'
                }`}
              >
                <div className="flex items-center gap-1 text-[12px] font-bold">
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> : <Navigation className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>第 {setNum} 局</span>
                </div>
                <span className="text-[10.5px]">{done ? '已挥杆完赛' : active ? '进行中' : '待开球'}</span>
              </div>
            );
          })}
        </div>

        {/* 局间茶歇催眠对话 */}
        <div className="rounded-xl border border-[var(--diagram-border)] bg-[var(--diagram-panel)] p-3.5 space-y-3">
          <div className="flex items-start gap-2.5">
            <Coffee className="w-4 h-4 text-[var(--diagram-accent)] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-[var(--diagram-accent)]">
                局间喝茶 · 红心 Q 的真相催眠
              </div>
              <p className="text-[12.5px] text-[var(--text-primary)] leading-relaxed">
                {outcome === 'won' ? '「真遗憾呢……你居然一直坚持挥完了全部三局。」' : current.hypothesis}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={outcome !== 'playing'}
              onClick={finishCurrentSet}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-bold cursor-pointer disabled:opacity-45"
            >
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              坚持挥杆打完第 {Math.min(3, completedSets + 1)} 局
            </button>
            <button
              type="button"
              disabled={outcome !== 'playing'}
              onClick={giveUp}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[11.5px] text-[var(--text-secondary)] hover:border-[var(--diagram-accent)] hover:text-[var(--diagram-accent)] cursor-pointer disabled:opacity-45"
            >
              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
              动摇弃权
            </button>
            <button
              type="button"
              disabled={outcome !== 'playing'}
              onClick={attackQueen}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--diagram-border)] bg-[var(--diagram-surface)] text-[11.5px] text-[var(--text-secondary)] hover:border-[var(--diagram-accent)] hover:text-[var(--diagram-accent)] cursor-pointer disabled:opacity-45"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              情绪失控施暴
            </button>
          </div>
        </div>

        <p
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            outcome === 'won'
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : outcome === 'quit' || outcome === 'violence'
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        规则门槛低到荒诞——不用赢球、不用辩赢假说，只要别在茶歇催眠里亲手放弃挥杆或诉诸暴力，打完即胜。
      </p>
    </div>
  );
}

/* ============================================================================
 * 统一导出全部 13 场《弥留之国的爱丽丝》赌局图解映射表
 * ========================================================================== */

export const ALICE_DIAGRAMS: Record<string, ComponentType> = {
  'alice-3-clubs-dead-or-alive': DeadOrAliveDiagram,
  'alice-5-spades-tag': TagApartmentDiagram,
  'alice-7-hearts-wolf': WolfAndSheepDiagram,
  'alice-4-clubs-distance': DistanceTunnelDiagram,
  'alice-4-diamonds-lightbulb': LightbulbPuzzleDiagram,
  'alice-6-diamonds-blackjack': BlackjackNooseDiagram,
  'alice-10-hearts-witch-hunt': WitchHuntDiagram,
  'alice-k-clubs-osmosis': OsmosisDockDiagram,
  'alice-j-hearts-solitary': SolitaryConfinementDiagram,
  'alice-j-diamonds-mahjong': MahjongTableDiagram,
  'alice-k-diamonds-beauty-contest': BeautyContestScaleDiagram,
  'alice-k-spades-survival': SpadesKingRadarDiagram,
  'alice-q-hearts-croquet': CroquetTeaDiagram,
};
