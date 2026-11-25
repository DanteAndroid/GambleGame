import { useState } from 'react';
import { DoorOpen, Eye, EyeOff, RotateCcw, Skull, Trophy } from 'lucide-react';

interface RoomCoord {
  id: number;
  row: number;
  col: number;
  name: string;
}

const ROOMS: RoomCoord[] = [
  { id: 0, row: 0, col: 0, name: 'A 入口' },
  { id: 1, row: 0, col: 1, name: '北密室' },
  { id: 2, row: 0, col: 2, name: '出口' },
  { id: 3, row: 1, col: 0, name: '西密室' },
  { id: 4, row: 1, col: 1, name: '中庭' },
  { id: 5, row: 1, col: 2, name: '东密室' },
  { id: 6, row: 2, col: 0, name: '西南角' },
  { id: 7, row: 2, col: 1, name: '南密室' },
  { id: 8, row: 2, col: 2, name: 'B 入口' },
];

const EXIT_ID = 2;
const MINOTAUR_PATROL = [5, 4, 7, 5]; // 米诺陶洛斯按回合巡逻路线
const RIVAL_PATH = [8, 7, 4, 1]; // 对手 B 向出口推进路线

function isAdjacent(a: number, b: number) {
  const ra = ROOMS[a];
  const rb = ROOMS[b];
  return Math.abs(ra.row - rb.row) + Math.abs(ra.col - rb.col) === 1;
}

export function MinotaurLabyrinthDiagram() {
  const [pos, setPos] = useState<number>(0);
  const [turn, setTurn] = useState<number>(0);
  const [points, setPoints] = useState<number>(8);
  const [spend, setSpend] = useState<number>(2);
  const [darkModeFog, setDarkModeFog] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('设定本回合投入点数，再点击相邻房门移动（对手与米诺陶洛斯会同步巡逻）。');

  const minotaurPos = MINOTAUR_PATROL[turn % MINOTAUR_PATROL.length];
  const rivalPos = RIVAL_PATH[Math.min(turn, RIVAL_PATH.length - 1)];

  const moveTo = (targetId: number) => {
    if (targetId === pos || !isAdjacent(pos, targetId)) return;
    if (points < spend) {
      setStatus(`剩余点数不足 ${spend} 点，请调低投入点数或重置起点。`);
      return;
    }

    const nextTurn = turn + 1;
    const nextPts = points - spend;
    const nextMinotaur = MINOTAUR_PATROL[nextTurn % MINOTAUR_PATROL.length];
    const nextRival = RIVAL_PATH[Math.min(nextTurn, RIVAL_PATH.length - 1)];

    setPos(targetId);
    setTurn(nextTurn);
    setPoints(nextPts);

    if (targetId === EXIT_ID) {
      setStatus(`投入 ${spend} 点破门冲出迷宫指定出口！率先逃出即判获胜。`);
    } else if (targetId === nextMinotaur) {
      setStatus(`第 ${nextTurn} 回合：在「${ROOMS[targetId].name}」迎面撞上巡逻中的米诺陶洛斯！触发致命袭击。`);
    } else if (targetId === nextRival) {
      const rivalSpend = 2;
      setStatus(
        spend >= rivalSpend
          ? `与对手同格相遇！我方投 ${spend} 点 ≥ 对手 ${rivalSpend} 点，对抗占优！`
          : `与对手同格相遇！我方投 ${spend} 点 < 对手 ${rivalSpend} 点，对抗落入下风！`
      );
    } else {
      const nearby =
        isAdjacent(targetId, nextMinotaur)
          ? '（听觉预警：隔壁房间传来米诺陶洛斯脚步声！）'
          : '';
      setStatus(
        `第 ${nextTurn} 回合：投 ${spend} 点进入「${ROOMS[targetId].name}」（余 ${nextPts} 点）${nearby}`
      );
    }
  };

  const reset = () => {
    setPos(0);
    setTurn(0);
    setPoints(8);
    setSpend(2);
    setStatus('设定本回合投入点数，再点击相邻房门移动（对手与米诺陶洛斯会同步巡逻）。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 控制栏：余点、投入点数、黑暗视野开关、重置 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-[12px]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[var(--text-primary)]">
              剩余点数：<strong className="text-[var(--diagram-brass)] tabular-nums text-[14px]">{points}</strong>
            </span>
            <div className="inline-flex items-center gap-1">
              <span className="text-[var(--text-secondary)]">本步投入：</span>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  data-testid={`labyrinth-spend-${n}`}
                  onClick={() => setSpend(n)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums cursor-pointer transition-colors ${
                    spend === n
                      ? 'bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)]'
                      : 'bg-[var(--diagram-panel)] text-[var(--text-secondary)] border border-[var(--diagram-border)]'
                  }`}
                >
                  {n} 点
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              data-testid="labyrinth-fog-btn"
              aria-pressed={darkModeFog}
              onClick={() => setDarkModeFog((v) => !v)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border cursor-pointer transition-colors ${
                darkModeFog
                  ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_18%,var(--diagram-panel))] text-[var(--diagram-brass)] font-semibold'
                  : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {darkModeFog ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{darkModeFog ? '黑暗视野：开' : '黑暗视野'}</span>
            </button>
            <button
              type="button"
              data-testid="labyrinth-reset-btn"
              onClick={reset}
              className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              重置
            </button>
          </div>
        </div>

        {/* 3x3 电子门连通平面图 */}
        <div className="max-w-[380px] mx-auto">
          <div className="grid grid-cols-3 gap-3">
            {ROOMS.map((room) => {
              const here = pos === room.id;
              const reachable = isAdjacent(pos, room.id) && points >= spend;
              const isExit = room.id === EXIT_ID;
              const isMinotaur = room.id === minotaurPos;
              const isRival = room.id === rivalPos;
              const hiddenByFog = darkModeFog && !here && !isExit;

              return (
                <button
                  key={room.id}
                  type="button"
                  data-testid={`labyrinth-room-${room.id}`}
                  disabled={!reachable && !here}
                  onClick={() => moveTo(room.id)}
                  className={`relative h-[74px] rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    here
                      ? 'border-[var(--diagram-brass)] bg-[color-mix(in_srgb,var(--diagram-brass)_24%,var(--diagram-panel))] ring-2 ring-[var(--diagram-brass)]/50'
                      : isExit
                        ? 'border-[var(--diagram-brass)]/80 bg-[color-mix(in_srgb,var(--diagram-brass)_13%,var(--diagram-panel))]'
                        : !hiddenByFog && isMinotaur
                          ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))]'
                          : !hiddenByFog && isRival
                            ? 'border-[var(--text-secondary)] bg-[var(--diagram-panel)]'
                            : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]'
                  } ${
                    reachable
                      ? 'cursor-pointer hover:border-[var(--diagram-brass)] hover:-translate-y-0.5'
                      : here
                        ? 'cursor-default'
                        : 'opacity-80 cursor-not-allowed'
                  }`}
                >
                  {reachable && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[9.5px] font-bold leading-none">
                      -{spend}点
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {isExit && <Trophy className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />}
                    {!hiddenByFog && isMinotaur && (
                      <Skull className="w-3.5 h-3.5 text-[var(--diagram-accent)]" aria-hidden="true" />
                    )}
                    {!isExit && (hiddenByFog || !isMinotaur) && reachable && (
                      <DoorOpen className="w-3.5 h-3.5 text-[var(--diagram-brass)]" aria-hidden="true" />
                    )}
                    <span
                      className={`text-[12px] font-semibold ${
                        !hiddenByFog && isMinotaur
                          ? 'text-[var(--diagram-accent)]'
                          : isExit || here
                            ? 'text-[var(--diagram-brass)]'
                            : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {room.name}
                    </span>
                  </div>

                  <span className="text-[10.5px] text-[var(--text-secondary)]">
                    {here
                      ? '你在这里'
                      : isExit
                        ? '逃出即胜'
                        : hiddenByFog
                          ? '视野未知'
                          : isMinotaur
                            ? '米诺陶洛斯'
                            : isRival
                              ? '对手 B'
                              : '电子门房'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 回合反馈 */}
        <p
          data-testid="labyrinth-status"
          className={`rounded-lg px-3.5 py-2.5 text-[12.5px] text-center font-medium border ${
            pos === EXIT_ID
              ? 'border-[var(--diagram-brass)]/60 bg-[color-mix(in_srgb,var(--diagram-brass)_16%,var(--diagram-panel))] text-[var(--diagram-brass)]'
              : pos === minotaurPos
                ? 'border-[var(--diagram-accent)]/60 bg-[color-mix(in_srgb,var(--diagram-accent)_16%,var(--diagram-panel))] text-[var(--diagram-accent)]'
                : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)] text-[var(--text-primary)]'
          }`}
        >
          {status}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        投入更高点数不仅能抢先开门，在同格遭遇对手时也直接决定对抗胜负；可开启「黑暗视野」感受盲探难度。
      </p>
    </div>
  );
}
