import { useState } from 'react';
import { ArrowLeftRight, RotateCcw, Syringe } from 'lucide-react';

export function SurpassingDiagram() {
  const [round, setRound] = useState<number>(1);
  // sittingSide: 0 代表 A 坐椅子 (C)、B 丢手绢 (D)；1 则互换
  const [sittingSide, setSittingSide] = useState<0 | 1>(0);
  const [deathSec, setDeathSec] = useState<[number, number]>([18, 12]);
  const [dropAt, setDropAt] = useState<number>(16);
  const [checkAt, setCheckAt] = useState<number>(34);
  const [log, setLog] = useState<string>('拖动下方时刻并点击「结算并换边」，体验双方累加死亡秒数。');

  const isSuccess = checkAt >= dropAt;
  const roundAdded = isSuccess ? checkAt - dropAt : 0;
  const sitterName = sittingSide === 0 ? '玩家 A' : '玩家 B';
  const dropperName = sittingSide === 0 ? '玩家 B' : '玩家 A';

  const previewTarget = Math.min(60, deathSec[sittingSide] + roundAdded);
  const someoneDead = deathSec[0] >= 60 || deathSec[1] >= 60;

  const commitRound = () => {
    if (someoneDead) return;
    const next: [number, number] = [...deathSec] as [number, number];
    if (isSuccess) {
      next[sittingSide] = Math.min(60, next[sittingSide] + roundAdded);
      if (next[sittingSide] >= 60) {
        setDeathSec(next);
        setLog(`${sitterName} 累计满 60 秒！立即注射「临死药」进入假死，等待零号立会人急救。`);
        return;
      }
      setLog(
        `第 ${round} 回合：${sitterName} 检查成功，延迟 +${roundAdded} 秒（现 ${next[sittingSide]} 秒），下一回合攻守互换。`
      );
    } else {
      // 回头过早失误：C 失去检查权，D 可压线放绢造成大额延迟罚则
      const penalty = Math.max(0, 60 - dropAt);
      next[sittingSide] = Math.min(60, next[sittingSide] + penalty);
      setLog(
        `第 ${round} 回合：${sitterName} 过早回头失误！失去检查权并计入至回合末延迟 +${penalty} 秒（现 ${next[sittingSide]} 秒）。`
      );
      if (next[sittingSide] >= 60) {
        setDeathSec(next);
        return;
      }
    }
    setDeathSec(next);
    setRound((r) => r + 1);
    setSittingSide((s) => (s === 0 ? 1 : 0));
  };

  const reset = () => {
    setRound(1);
    setSittingSide(0);
    setDeathSec([18, 12]);
    setDropAt(16);
    setCheckAt(34);
    setLog('拖动下方时刻并点击「结算并换边」，体验双方累加死亡秒数。');
  };

  return (
    <div className="space-y-3.5">
      <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-3.5 sm:p-5 space-y-4">
        {/* 顶栏：回合与当前攻守 */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
          <span className="font-semibold text-[var(--text-primary)]">
            第 {round} 回合 · <span className="text-[var(--diagram-brass)]">{dropperName}（D 放绢）</span>
            <span className="mx-1.5 text-[var(--text-muted)]">vs</span>
            <span className="text-[var(--text-primary)]">{sitterName}（C 就座）</span>
          </span>
          <button
            type="button"
            data-testid="surpassing-reset-btn"
            onClick={reset}
            className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            重置
          </button>
        </div>

        {/* 场景直观 SVG */}
        <svg
          viewBox="0 0 420 96"
          className="w-full max-w-[440px] mx-auto h-auto block select-none"
          role="img"
          aria-label="丢手绢方在就座方身后伺机放手绢"
        >
          <line x1="20" y1="76" x2="400" y2="76" stroke="var(--diagram-border)" strokeWidth="1.5" />

          {/* D 站立 */}
          <g transform="translate(84, 10)">
            <circle cx="0" cy="12" r="9" fill="none" stroke="var(--diagram-brass)" strokeWidth="2" />
            <path
              d="M -10 38 C -10 24, 10 24, 10 38 L 8 64 L -8 64 Z"
              fill="color-mix(in srgb, var(--diagram-brass) 20%, var(--diagram-panel))"
              stroke="var(--diagram-brass)"
              strokeWidth="1.6"
            />
            <text x="0" y="81" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--diagram-brass)">
              {dropperName} (D)
            </text>
          </g>

          {/* 手绢状态 */}
          <g transform="translate(184, 44)">
            {isSuccess ? (
              <>
                <path
                  d="M -18 28 Q 0 20 18 28 L 12 31 L -12 31 Z"
                  fill="color-mix(in srgb, var(--diagram-accent) 34%, var(--diagram-panel))"
                  stroke="var(--diagram-accent)"
                  strokeWidth="1.6"
                />
                <text x="0" y="13" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--diagram-accent)">
                  {dropAt}s 已落地
                </text>
              </>
            ) : (
              <>
                <path
                  d="M -16 4 Q 0 -4 16 4 L 10 14 L -10 14 Z"
                  fill="color-mix(in srgb, var(--diagram-brass) 24%, var(--diagram-panel))"
                  stroke="var(--diagram-brass)"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                <text x="0" y="-7" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--diagram-brass)">
                  尚未落地（{dropAt}s 放）
                </text>
              </>
            )}
          </g>

          {/* 回头视线 */}
          <path
            d="M 278 34 Q 240 12 204 34"
            fill="none"
            stroke={isSuccess ? 'var(--diagram-accent)' : 'var(--text-secondary)'}
            strokeWidth="1.6"
            strokeDasharray="4 3"
          />
          <text x="242" y="16" textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--text-primary)">
            {checkAt}s 回头
          </text>

          {/* C 就座 */}
          <g transform="translate(322, 20)">
            <circle cx="0" cy="12" r="9" fill="none" stroke="var(--text-primary)" strokeWidth="2" />
            <path
              d="M -11 26 L 8 26 L 10 46 L -4 46 L -4 54 L -14 54 Z"
              fill="var(--diagram-panel)"
              stroke="var(--text-secondary)"
              strokeWidth="1.6"
            />
            <path d="M 10 24 L 10 54 M -4 44 L 14 44" stroke="var(--text-secondary)" strokeWidth="2" />
            <text x="0" y="71" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--text-primary)">
              {sitterName} (C)
            </text>
          </g>
        </svg>

        {/* 0-60s 刻度时间轴 */}
        <div className="space-y-3">
          <div className="relative h-9 rounded-full bg-[var(--diagram-panel)] border border-[var(--diagram-border)] overflow-hidden">
            {[0, 15, 30, 45, 60].map((sec) => (
              <span
                key={sec}
                style={
                  sec === 0
                    ? { left: '12px' }
                    : sec === 60
                      ? { right: '12px' }
                      : { left: `${(sec / 60) * 100}%` }
                }
                className={`absolute top-1/2 -translate-y-1/2 text-[11px] font-medium tabular-nums text-[var(--text-secondary)] pointer-events-none select-none z-10 ${
                  sec === 0 || sec === 60 ? '' : '-translate-x-1/2'
                }`}
              >
                {sec}s
              </span>
            ))}

            {isSuccess && roundAdded > 0 && (
              <div
                style={{
                  left: `${(dropAt / 60) * 100}%`,
                  width: `${(roundAdded / 60) * 100}%`,
                }}
                className="absolute inset-y-0 bg-[color-mix(in_srgb,var(--diagram-accent)_34%,transparent)] border-x border-[var(--diagram-accent)]"
              />
            )}
            <div style={{ left: `${(dropAt / 60) * 100}%` }} className="absolute inset-y-0 w-0.5 bg-[var(--diagram-brass)]" />
            <div style={{ left: `${(checkAt / 60) * 100}%` }} className="absolute inset-y-0 w-0.5 bg-[var(--diagram-accent)]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
            <label className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--diagram-brass)] font-semibold">D 放手绢时刻</span>
                <span className="tabular-nums font-semibold text-[var(--text-primary)]">{dropAt} 秒</span>
              </div>
              <input
                type="range"
                min={2}
                max={55}
                value={dropAt}
                disabled={someoneDead}
                data-testid="surpassing-drop-slider"
                onChange={(e) => setDropAt(Number(e.target.value))}
                className="w-full accent-[var(--diagram-brass)] cursor-pointer"
              />
            </label>

            <label className="rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3 py-2.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[var(--diagram-accent)] font-semibold">C 回头检查时刻</span>
                <span className="tabular-nums font-semibold text-[var(--text-primary)]">{checkAt} 秒</span>
              </div>
              <input
                type="range"
                min={2}
                max={58}
                value={checkAt}
                disabled={someoneDead}
                data-testid="surpassing-check-slider"
                onChange={(e) => setCheckAt(Number(e.target.value))}
                className="w-full accent-[var(--diagram-accent)] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 结算换边动作条 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg bg-[var(--diagram-panel)] border border-[var(--diagram-border)] px-3.5 py-2.5">
          <div data-testid="surpassing-preview" className="text-[12.5px] text-[var(--text-primary)]">
            {isSuccess ? (
              <>
                本轮预测：{sitterName} 延迟{' '}
                <strong className="text-[var(--diagram-accent)] tabular-nums">+{roundAdded} 秒</strong>
                <span className="text-[var(--text-secondary)]">（将达 {previewTarget}/60s）</span>
              </>
            ) : (
              <span className="text-[var(--diagram-accent)] font-medium">
                回头过早失误：失去检查权，承受至 60s 末的延迟罚则（+{60 - dropAt} 秒）
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={someoneDead}
            data-testid="surpassing-commit-btn"
            onClick={commitRound}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--diagram-brass)] text-[var(--btn-primary-fg)] text-[12px] font-semibold hover:opacity-90 disabled:opacity-45 cursor-pointer shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{someoneDead ? '已触发临死药' : '结算并换边'}</span>
          </button>
        </div>

        {/* 双方 60s 临死药进度条 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([0, 1] as const).map((idx) => {
            const sec = deathSec[idx];
            const dead = sec >= 60;
            const isSitter = sittingSide === idx;
            return (
              <div
                key={idx}
                className={`rounded-lg px-3 py-2.5 border ${
                  dead
                    ? 'border-[var(--diagram-accent)] bg-[color-mix(in_srgb,var(--diagram-accent)_14%,var(--diagram-panel))]'
                    : isSitter
                      ? 'border-[var(--diagram-brass)]/65 bg-[var(--diagram-panel)]'
                      : 'border-[var(--diagram-border)] bg-[var(--diagram-panel)]/75'
                }`}
              >
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                    <Syringe
                      className={`w-3.5 h-3.5 ${dead ? 'text-[var(--diagram-accent)]' : 'text-[var(--diagram-brass)]'}`}
                      aria-hidden="true"
                    />
                    {idx === 0 ? '玩家 A' : '玩家 B'}
                    <span className="text-[10.5px] font-normal text-[var(--text-secondary)]">
                      ({isSitter ? '当前 C' : '当前 D'})
                    </span>
                  </span>
                  <span
                    data-testid={`surpassing-death-${idx}`}
                    className={`tabular-nums font-semibold ${
                      dead ? 'text-[var(--diagram-accent)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {sec} / 60s
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--diagram-surface)] overflow-hidden">
                  <div
                    style={{ width: `${(sec / 60) * 100}%` }}
                    className={`h-full rounded-full transition-all ${
                      dead ? 'bg-[var(--diagram-accent)]' : 'bg-[var(--diagram-brass)]'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p data-testid="surpassing-status" className="text-[12px] text-[var(--text-secondary)] text-center">
          {log}
        </p>
      </div>

      <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
        满 60 秒即注射临死药，只能靠零号立会人急救复苏；无法救活便判负。
      </p>
    </div>
  );
}
