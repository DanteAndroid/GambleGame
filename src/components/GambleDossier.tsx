import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, X } from 'lucide-react';
import type { GambleRecord, MangaSeriesInfo } from '../types/gamble';
import { getCardParticipants } from '../utils/gambleFilters';

export interface DetailEditDraft {
  title: string;
  oneLineRule: string;
  winCondition: string;
  basicRulesText: string;
  extraInfoText: string;
  ruleAnalysisText: string;
  spoilsBreakdownText: string;
  ending: string;
  submittedBy: string;
  note: string;
}

export function createDetailEditDraft(gamble: GambleRecord): DetailEditDraft {
  return {
    title: gamble.title,
    oneLineRule: gamble.oneLineRule,
    winCondition: gamble.winCondition,
    basicRulesText: gamble.basicRules.join('\n'),
    extraInfoText: gamble.extraInfo.join('\n'),
    ruleAnalysisText: gamble.ruleAnalysis.join('\n'),
    spoilsBreakdownText: gamble.spoilsBreakdown.join('\n'),
    ending: gamble.ending,
    submittedBy: '',
    note: '',
  };
}

interface GambleDossierProps {
  gamble: GambleRecord;
  series: MangaSeriesInfo;
  isHidden: boolean;
  onToggleReveal: () => void;
  isEditing?: boolean;
  editDraft?: DetailEditDraft | null;
  onChangeDraft?: (patch: Partial<DetailEditDraft>) => void;
  onCancelEdit?: () => void;
  onSubmitEdit?: () => void;
  submittingEdit?: boolean;
  editError?: string | null;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  totalCount: number;
}

const inputBaseClass =
  'w-full bg-[var(--bg-input)] border border-[var(--border-strong)]/70 focus:border-[var(--brass)] focus:outline-none px-3.5 py-2.5 text-[14.5px] leading-[1.75] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors';

export function GambleDossier({
  gamble,
  series,
  isHidden,
  onToggleReveal,
  isEditing = false,
  editDraft = null,
  onChangeDraft,
  onCancelEdit,
  onSubmitEdit,
  submittingEdit = false,
  editError = null,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}: GambleDossierProps) {
  const [showOriginalQuotes, setShowOriginalQuotes] = useState(false);
  const [firstSide, secondSide] = getCardParticipants(gamble, isHidden);

  useEffect(() => {
    setShowOriginalQuotes(false);
  }, [gamble.id]);

  const editingActive = isEditing && editDraft !== null && Boolean(onChangeDraft);

  return (
    <article
      aria-label={`${gamble.title} 档案详情`}
      className="flex flex-col justify-between text-[var(--text-primary)]"
    >
      <div>
        {/* Archival Provenance Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--border-subtle)] text-[12.5px] text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold text-[var(--text-primary)]">
              《{series.title}》
            </span>
            <span aria-hidden="true" className="opacity-35">
              /
            </span>
            <span>{gamble.arcName}</span>
            <span aria-hidden="true" className="opacity-35">
              /
            </span>
            <span className="tabular-nums text-[var(--brass)]">{gamble.chapterRange}</span>
            <span aria-hidden="true" className="opacity-35">
              /
            </span>
            <span>{gamble.category}</span>
          </div>
        </div>

        {/* Inline Title Editor (Only Shown in 纠错 Edit Mode) */}
        {editingActive && editDraft && onChangeDraft && (
          <div className="mt-5">
            <label
              htmlFor="inline-edit-title"
              className="block text-[11.5px] tracking-[0.1em] text-[var(--brass)] mb-1.5"
            >
              赌局标题
            </label>
            <input
              id="inline-edit-title"
              data-testid="inline-edit-title"
              type="text"
              maxLength={80}
              value={editDraft.title}
              onChange={(e) => onChangeDraft({ title: e.target.value })}
              className={inputBaseClass}
            />
          </div>
        )}

        {/* Sculpted Matchup & Referee Ledger (人名保持黑体) */}
        <dl className="mt-6 collector-card bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
            <div>
              <dt className="text-[11px] tracking-[0.12em] text-[var(--brass)]">
                对决双方
              </dt>
              <dd className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-sans text-[15.5px] font-semibold text-[var(--text-primary)]">
                <span className="inline-flex items-center gap-1.5">
                  <span>{firstSide.name}</span>
                  {firstSide.outcome === 'win' && (
                    <span className="px-1.5 py-[3px] text-[10.5px] font-bold leading-none bg-[var(--win-bg)] text-[var(--win-fg)] border border-[var(--win-border)]">
                      胜
                    </span>
                  )}
                  {firstSide.outcome === 'lose' && (
                    <span className="px-1.5 py-[3px] text-[10.5px] font-medium leading-none bg-[var(--lose-bg)] text-[var(--lose-fg)] border border-[var(--lose-border)]">
                      败
                    </span>
                  )}
                </span>

                <span className="text-[11px] font-mincho font-normal text-[var(--brass)]">
                  vs
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <span>{secondSide.name}</span>
                  {secondSide.outcome === 'win' && (
                    <span className="px-1.5 py-[3px] text-[10.5px] font-bold leading-none bg-[var(--win-bg)] text-[var(--win-fg)] border border-[var(--win-border)]">
                      胜
                    </span>
                  )}
                  {secondSide.outcome === 'lose' && (
                    <span className="px-1.5 py-[3px] text-[10.5px] font-medium leading-none bg-[var(--lose-bg)] text-[var(--lose-fg)] border border-[var(--lose-border)]">
                      败
                    </span>
                  )}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-[11px] tracking-[0.12em] text-[var(--brass)]">
                {gamble.refereeRole} / 裁判方
              </dt>
              <dd className="mt-2.5 font-sans text-[15.5px] font-semibold text-[var(--text-primary)] leading-snug">
                {gamble.refereeName}
              </dd>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--border-hairline)]">
            <dt className="text-[11px] tracking-[0.12em] text-[var(--brass)]">
              胜负判定
            </dt>
            {editingActive && editDraft && onChangeDraft ? (
              <dd className="mt-2">
                <textarea
                  aria-label="胜负判定"
                  data-testid="inline-edit-winCondition"
                  rows={2}
                  value={editDraft.winCondition}
                  onChange={(e) => onChangeDraft({ winCondition: e.target.value })}
                  className={inputBaseClass}
                />
              </dd>
            ) : (
              <dd className="mt-1.5 font-sans text-[15px] text-[var(--text-secondary)] leading-[1.85]">
                {gamble.winCondition}
              </dd>
            )}
          </div>
        </dl>

        {/* Objective Game Rules Section */}
        <section aria-labelledby="rules-heading" className="mt-11">
          <div className="flex items-baseline gap-3">
            <span className="tabular-nums text-[11px] tracking-[0.12em] text-[var(--brass)]">
              01
            </span>
            <h3
              id="rules-heading"
              className="font-mincho font-normal text-[23px] text-[var(--text-primary)] tracking-[0.02em]"
            >
              游戏规则
            </h3>
          </div>

          {/* 一句话规则：黑体 */}
          {editingActive && editDraft && onChangeDraft ? (
            <div className="mt-4">
              <label
                htmlFor="inline-edit-oneLineRule"
                className="block text-[11.5px] tracking-[0.1em] text-[var(--brass)] mb-1.5"
              >
                一句话规则
              </label>
              <textarea
                id="inline-edit-oneLineRule"
                data-testid="inline-edit-oneLineRule"
                rows={2}
                value={editDraft.oneLineRule}
                onChange={(e) => onChangeDraft({ oneLineRule: e.target.value })}
                className={inputBaseClass}
              />
            </div>
          ) : (
            <p
              data-testid="dossier-one-line-rule"
              className="mt-4 px-5 py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] font-sans text-[15.5px] font-medium text-[var(--text-primary)] leading-[1.88] collector-card"
            >
              {gamble.oneLineRule}
            </p>
          )}

          {/* 流程 */}
          <div className="mt-8">
            <h4 className="text-xs font-medium tracking-[0.12em] text-[var(--brass)]">
              流程{editingActive ? '（每行一条）' : ''}
            </h4>
            {editingActive && editDraft && onChangeDraft ? (
              <textarea
                aria-label="流程"
                data-testid="inline-edit-basicRules"
                rows={6}
                value={editDraft.basicRulesText}
                onChange={(e) => onChangeDraft({ basicRulesText: e.target.value })}
                className={`${inputBaseClass} mt-3`}
              />
            ) : (
              <ol className="mt-4 space-y-3.5 font-sans">
                {gamble.basicRules.map((rule, index) => (
                  <li
                    key={rule}
                    className="grid grid-cols-[2rem_1fr] gap-2.5 items-baseline pb-3.5 border-b border-[var(--border-hairline)] last:border-b-0 last:pb-0 text-[15px] leading-[1.88] text-[var(--text-secondary)]"
                  >
                    <span className="tabular-nums text-xs font-medium text-[var(--brass)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* 额外信息：作品与背景档案卡 */}
          <div className="mt-8 p-5 bg-[var(--bg-inset)]/55 border border-[var(--border-hairline)]">
            <h4 className="text-xs font-medium tracking-[0.12em] text-[var(--text-muted)]">
              额外信息{editingActive ? '（每行一条）' : ''}
            </h4>
            {editingActive && editDraft && onChangeDraft ? (
              <textarea
                aria-label="额外信息"
                data-testid="inline-edit-extraInfo"
                rows={4}
                value={editDraft.extraInfoText}
                onChange={(e) => onChangeDraft({ extraInfoText: e.target.value })}
                className={`${inputBaseClass} mt-3`}
              />
            ) : (
              <ul className="mt-3.5 space-y-2.5 font-sans text-[14.5px] leading-[1.85] text-[var(--text-secondary)]">
                {gamble.extraInfo.map((info) => (
                  <li key={info} className="grid grid-cols-[1rem_1fr] gap-2 items-baseline">
                    <span className="text-[var(--brass)] opacity-80 select-none" aria-hidden="true">
                      ·
                    </span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Rule Analysis Section */}
        <section
          aria-labelledby="analysis-heading"
          className="mt-11 pt-8 border-t border-[var(--border-subtle)]"
        >
          <div className="flex items-baseline gap-3">
            <span className="tabular-nums text-[11px] tracking-[0.12em] text-[var(--brass)]">
              02
            </span>
            <h3
              id="analysis-heading"
              className="font-mincho font-normal text-[23px] text-[var(--text-primary)] tracking-[0.02em]"
            >
              规则解析
            </h3>
          </div>
          {editingActive && editDraft && onChangeDraft ? (
            <div className="mt-4">
              <p className="text-[11.5px] text-[var(--text-muted)] mb-2">每行一条解析要点</p>
              <textarea
                aria-label="规则解析"
                data-testid="inline-edit-ruleAnalysis"
                rows={5}
                value={editDraft.ruleAnalysisText}
                onChange={(e) => onChangeDraft({ ruleAnalysisText: e.target.value })}
                className={inputBaseClass}
              />
            </div>
          ) : (
            <ul className="mt-5 space-y-4 font-sans text-[15px] text-[var(--text-secondary)] leading-[1.88]">
              {gamble.ruleAnalysis.map((point) => (
                <li key={point} className="grid grid-cols-[1.25rem_1fr] gap-2 items-baseline">
                  <span className="text-[var(--brass)] select-none" aria-hidden="true">
                    —
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Spoils & Ending Section */}
        <section
          aria-labelledby="spoils-heading"
          className="mt-11 pt-8 border-t border-[var(--border-subtle)]"
        >
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="tabular-nums text-[11px] tracking-[0.12em] text-[var(--brass)]">
                03
              </span>
              <h3
                id="spoils-heading"
                className="font-mincho font-normal text-[23px] text-[var(--text-primary)] tracking-[0.02em]"
              >
                战利品与结局
              </h3>
            </div>

            {!editingActive && (
              <button
                type="button"
                onClick={onToggleReveal}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
              >
                {isHidden ? (
                  <>
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>显示结局</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>隐藏结局</span>
                  </>
                )}
              </button>
            )}
          </div>

          {editingActive && editDraft && onChangeDraft ? (
            <div className="mt-5 space-y-5">
              <div>
                <label
                  htmlFor="inline-edit-spoils"
                  className="block text-[11.5px] tracking-[0.1em] text-[var(--brass)] mb-1.5"
                >
                  战利品清单（每行一条）
                </label>
                <textarea
                  id="inline-edit-spoils"
                  data-testid="inline-edit-spoils"
                  rows={4}
                  value={editDraft.spoilsBreakdownText}
                  onChange={(e) => onChangeDraft({ spoilsBreakdownText: e.target.value })}
                  className={inputBaseClass}
                />
              </div>
              <div>
                <label
                  htmlFor="inline-edit-ending"
                  className="block text-[11.5px] tracking-[0.1em] text-[var(--brass)] mb-1.5"
                >
                  结局
                </label>
                <textarea
                  id="inline-edit-ending"
                  data-testid="inline-edit-ending"
                  rows={4}
                  value={editDraft.ending}
                  onChange={(e) => onChangeDraft({ ending: e.target.value })}
                  className={inputBaseClass}
                />
              </div>
            </div>
          ) : isHidden ? (
            <div className="mt-5 py-11 px-6 bg-[var(--spoiler-bg)] border border-[var(--border-subtle)] text-[#F2F2F0] text-center">
              <p className="text-[14.5px] text-[#C8C8CE]">
                防剧透遮罩已开启，本局战利品与结局暂不显示。
              </p>
              <button
                type="button"
                onClick={onToggleReveal}
                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-[#F4F0E8] text-[#09090C] hover:opacity-90 text-xs font-semibold transition-opacity cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>显示战利品与结局</span>
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              <ul className="space-y-2.5 font-sans text-[15px] text-[var(--text-secondary)]">
                {gamble.spoilsBreakdown.map((item) => (
                  <li
                    key={item}
                    className="grid grid-cols-[1rem_1fr] gap-2 items-baseline leading-[1.85]"
                  >
                    <span
                      className="text-[var(--accent)] text-[9px] select-none"
                      aria-hidden="true"
                    >
                      ■
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] collector-card">
                <h4 className="font-mincho font-normal text-[17px] text-[var(--text-primary)]">
                  结局
                </h4>
                <p className="mt-2.5 font-sans text-[15px] leading-[1.88] text-[var(--text-secondary)]">
                  {gamble.ending}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Inline Edit Submission Footer (Only Shown in 纠错 Edit Mode) */}
        {editingActive && editDraft && onChangeDraft && (
          <section
            data-testid="detail-edit-submit-panel"
            className="mt-10 p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--brass-muted)] space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-medium tracking-[0.12em] text-[var(--brass)]">
                提交纠错说明（进入本机后台待审）
              </h4>
              <span className="text-[11.5px] text-[var(--text-muted)]">
                审核通过后才会更新页面
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="inline-edit-author"
                  className="block text-[11.5px] text-[var(--text-muted)] mb-1.5"
                >
                  署名（选填）
                </label>
                <input
                  id="inline-edit-author"
                  type="text"
                  maxLength={32}
                  placeholder="匿名读者"
                  value={editDraft.submittedBy}
                  onChange={(e) => onChangeDraft({ submittedBy: e.target.value })}
                  className={inputBaseClass}
                />
              </div>
              <div>
                <label
                  htmlFor="inline-edit-note"
                  className="block text-[11.5px] text-[var(--text-muted)] mb-1.5"
                >
                  纠错备注（选填）
                </label>
                <input
                  id="inline-edit-note"
                  type="text"
                  maxLength={160}
                  placeholder="说明修改依据或参考话数"
                  value={editDraft.note}
                  onChange={(e) => onChangeDraft({ note: e.target.value })}
                  className={inputBaseClass}
                />
              </div>
            </div>

            {editError && (
              <p className="text-xs text-[var(--accent)]" role="alert">
                {editError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              {onCancelEdit && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={submittingEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>取消编辑</span>
                </button>
              )}
              {onSubmitEdit && (
                <button
                  type="button"
                  data-testid="detail-edit-submit-bottom-btn"
                  onClick={onSubmitEdit}
                  disabled={submittingEdit}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{submittingEdit ? '提交中…' : '提交至后台待审'}</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* Bottom Pull-Quotes: 汇文明朝体，默认隐藏日文原文，可按需展开 */}
        {!editingActive && (
          <section
            aria-label="原著经典台词"
            className="mt-12 py-8 border-y border-[var(--border-strong)]"
          >
            <div className="flex flex-col gap-7">
              {gamble.originalQuotes.map((quote) => (
                <blockquote key={quote.jp}>
                  <p className="font-mincho text-[19.5px] sm:text-[21px] text-[var(--text-primary)] leading-[1.75]">
                    {quote.cn}
                  </p>
                  {showOriginalQuotes && (
                    <p
                      data-testid="quote-original-jp"
                      className="mt-2 text-[13px] text-[var(--text-muted)] font-mincho leading-relaxed"
                    >
                      {quote.jp}
                    </p>
                  )}
                  <footer className="mt-2.5 text-[13px] text-[var(--text-muted)] font-sans">
                    <span className="mr-1.5 text-[var(--brass)]">—</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {quote.speaker}
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                data-testid="toggle-quote-original"
                onClick={() => setShowOriginalQuotes((prev) => !prev)}
                aria-pressed={showOriginalQuotes}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
              >
                {showOriginalQuotes ? '隐藏原文' : '显示原文'}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Pagination */}
      {!editingActive && (
        <div className="mt-8 flex items-center justify-between gap-4">
          <span className="tabular-nums text-xs text-[var(--brass)]">
            {String(currentIndex + 1).padStart(2, '0')} /{' '}
            {String(totalCount).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>上一局</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
            >
              <span>下一局</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
