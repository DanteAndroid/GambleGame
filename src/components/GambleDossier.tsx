import { useEffect, useState } from 'react';
import { BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, X } from 'lucide-react';
import type { GambleRecord, MangaSeriesInfo } from '../types/gamble';
import { SERIES_BACKGROUNDS } from '../data/seriesBackgrounds';
import { getGambleBackground } from '../data/gambleBackgrounds';
import { getCardParticipants } from '../utils/gambleFilters';
import { GambleFlowDiagramCard, hasCustomDiagram } from './GambleFlowDiagram';

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
  'w-full bg-[var(--bg-input)] border border-[var(--border-strong)]/70 focus:border-[var(--brass)] focus:outline-none px-3.5 py-2.5 text-[16px] sm:text-[14.5px] leading-[1.75] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors';

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
  const hasDiagram = hasCustomDiagram(gamble.id);
  const [showOriginalQuotes, setShowOriginalQuotes] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [showWorldGuide, setShowWorldGuide] = useState(false);
  const [showTextRules, setShowTextRules] = useState(!hasDiagram);
  const [firstSide, secondSide] = getCardParticipants(gamble, isHidden);
  const background = getGambleBackground(gamble.id);
  const world = SERIES_BACKGROUNDS[series.id];

  useEffect(() => {
    setShowOriginalQuotes(false);
    setShowBackground(false);
    setShowWorldGuide(false);
    setShowTextRules(!hasCustomDiagram(gamble.id));
  }, [gamble.id]);

  const editingActive = isEditing && editDraft !== null && Boolean(onChangeDraft);

  return (
    <article
      aria-label={`${gamble.title} 档案详情`}
      className="flex flex-col justify-between text-[var(--text-primary)]"
    >
      <div>
        {/* Archival Provenance Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-subtle)] text-[12px] sm:text-[12.5px] text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
        <dl className="mt-4 sm:mt-6 collector-card bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 sm:gap-y-5">
            <div>
              <dt className="text-[11px] tracking-[0.12em] text-[var(--brass)]">
                对决双方
              </dt>
              <dd className="mt-2 sm:mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-sans text-[14.5px] sm:text-[15.5px] font-semibold text-[var(--text-primary)]">
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
              <dd className="mt-2 sm:mt-2.5 font-sans text-[14.5px] sm:text-[15.5px] font-semibold text-[var(--text-primary)] leading-snug">
                {gamble.refereeName}
              </dd>
            </div>
          </div>

          <div className="mt-4 pt-3.5 sm:mt-5 sm:pt-4 border-t border-[var(--border-hairline)]">
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
              <dd className="mt-1.5 font-sans text-[14px] sm:text-[15px] text-[var(--text-secondary)] leading-[1.82] sm:leading-[1.85]">
                {gamble.winCondition}
              </dd>
            )}
          </div>
        </dl>

        {/* Background Knowledge Guide (Zero Ending Spoilers, Collapsed by Default) */}
        {!editingActive && background && world && (
          <section
            aria-labelledby="background-heading"
            data-testid="gamble-background-section"
            className="mt-8 sm:mt-10"
          >
            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] collector-card overflow-hidden">
              <button
                type="button"
                data-testid="toggle-background-btn"
                aria-expanded={showBackground}
                aria-controls="background-guide-body"
                onClick={() => setShowBackground((prev) => !prev)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 sm:py-4 text-left hover:bg-[var(--bg-inset)]/45 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--text-primary)]"
              >
                <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                  <BookOpen
                    className="w-4 h-4 text-[var(--brass)] shrink-0"
                    aria-hidden="true"
                  />
                  <h3
                    id="background-heading"
                    className="font-mincho font-normal text-[18px] sm:text-[20px] text-[var(--text-primary)] tracking-[0.02em]"
                  >
                    背景知识
                  </h3>
                  <span className="text-[11.5px] text-[var(--text-muted)]">
                    前情提要、关键人物与作品设定（无剧透）
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-[var(--brass)] shrink-0">
                  <span>{showBackground ? '收起' : '展开'}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showBackground ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>

              {showBackground && (
                <div
                  id="background-guide-body"
                  data-testid="background-guide-body"
                  className="border-t border-[var(--border-hairline)]"
                >
                  <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-5">
                    {/* 本局前情 */}
                    <div>
                      <h4 className="text-[11px] tracking-[0.12em] text-[var(--brass)]">
                        本局前情
                      </h4>
                      <p className="mt-1.5 font-sans text-[14.5px] sm:text-[15px] text-[var(--text-secondary)] leading-[1.82] sm:leading-[1.86]">
                        {background.setup}
                      </p>
                    </div>

                    {/* 关键人物 */}
                    <div className="pt-4 border-t border-[var(--border-hairline)]">
                      <h4 className="text-[11px] tracking-[0.12em] text-[var(--brass)]">
                        关键人物
                      </h4>
                      <dl className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {background.characters.map((character) => (
                          <div
                            key={character.name}
                            className="px-3.5 py-2.5 rounded-lg bg-[var(--bg-inset)]/55 border border-[var(--border-hairline)]"
                          >
                            <dt className="font-sans text-[13.5px] font-semibold text-[var(--text-primary)]">
                              {character.name}
                            </dt>
                            <dd className="mt-1 font-sans text-[13px] text-[var(--text-secondary)] leading-[1.65]">
                              {character.role}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>

                  {/* 作品世界观与核心术语（二级折叠） */}
                  <div className="border-t border-[var(--border-hairline)] bg-[var(--bg-inset)]/35">
                    <button
                      type="button"
                      data-testid="toggle-world-guide-btn"
                      aria-expanded={showWorldGuide}
                      aria-controls="world-guide-panel"
                      onClick={() => setShowWorldGuide((prev) => !prev)}
                      className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-3 min-h-[42px] text-left text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-inset)]/60 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--text-primary)]"
                    >
                      <span className="leading-snug">
                        {showWorldGuide
                          ? `收起《${series.title}》世界观与核心术语`
                          : `未看过《${series.title}》？展开世界观与核心术语（${world.keyTerms.length} 项）`}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[var(--brass)] shrink-0 transition-transform duration-200 ${
                          showWorldGuide ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {showWorldGuide && (
                      <div
                        id="world-guide-panel"
                        data-testid="world-guide-panel"
                        className="px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-3.5 border-t border-[var(--border-hairline)] space-y-4"
                      >
                        <div>
                          <h4 className="text-[11px] tracking-[0.12em] text-[var(--brass)]">
                            作品世界观
                          </h4>
                          <p className="mt-1.5 font-sans text-[13.5px] sm:text-[14px] text-[var(--text-secondary)] leading-[1.78]">
                            {world.premise}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[var(--border-hairline)]">
                          <h4 className="text-[11px] tracking-[0.12em] text-[var(--brass)]">
                            核心术语速查
                          </h4>
                          <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
                            {world.keyTerms.map((item) => (
                              <div key={item.term} className="text-[13px] leading-[1.68]">
                                <dt className="inline font-semibold text-[var(--text-primary)]">
                                  {item.term}：
                                </dt>
                                <dd className="inline text-[var(--text-secondary)]">
                                  {item.desc}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Objective Game Rules Section */}
        <section aria-labelledby="rules-heading" className="mt-8 sm:mt-10">
          <div className="flex items-baseline gap-3">
            <span className="tabular-nums text-[11px] tracking-[0.12em] text-[var(--brass)]">
              01
            </span>
            <h3
              id="rules-heading"
              className="font-mincho font-normal text-[20px] sm:text-[23px] text-[var(--text-primary)] tracking-[0.02em]"
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
              className="mt-3.5 sm:mt-4 px-4 py-3.5 sm:px-5 sm:py-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] font-sans text-[14.5px] sm:text-[15.5px] font-medium text-[var(--text-primary)] leading-[1.82] sm:leading-[1.88] collector-card"
            >
              {gamble.oneLineRule}
            </p>
          )}

          {!editingActive && hasDiagram && (
            <div className="mt-5 sm:mt-6">
              <GambleFlowDiagramCard key={gamble.id} gambleId={gamble.id} />
            </div>
          )}

          {/* 文字版流程（默认折叠） */}
          <div className="mt-5 sm:mt-6">
            {editingActive && editDraft && onChangeDraft ? (
              <div>
                <h4 className="text-xs font-medium tracking-[0.12em] text-[var(--brass)]">
                  文字版流程（每行一条）
                </h4>
                <textarea
                  aria-label="文字版流程"
                  data-testid="inline-edit-basicRules"
                  rows={6}
                  value={editDraft.basicRulesText}
                  onChange={(e) => onChangeDraft({ basicRulesText: e.target.value })}
                  className={`${inputBaseClass} mt-3`}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
                <button
                  type="button"
                  data-testid="toggle-text-rules-btn"
                  aria-expanded={showTextRules}
                  aria-controls="text-rules-panel"
                  onClick={() => setShowTextRules((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 text-left hover:bg-[var(--bg-inset)]/45 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--text-primary)]"
                >
                  <span className="text-xs sm:text-[13px] font-medium text-[var(--text-primary)]">
                    文字版流程（共 {gamble.basicRules.length} 步）
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--brass)] shrink-0">
                    <span>{showTextRules ? '收起' : '展开'}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showTextRules ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {showTextRules && (
                  <ol
                    id="text-rules-panel"
                    data-testid="text-rules-panel"
                    className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-[var(--border-hairline)] space-y-3 sm:space-y-3.5 font-sans"
                  >
                    {gamble.basicRules.map((rule, index) => (
                      <li
                        key={rule}
                        className="grid grid-cols-[1.75rem_1fr] sm:grid-cols-[2rem_1fr] gap-2 sm:gap-2.5 items-baseline pb-3 sm:pb-3.5 border-b border-[var(--border-hairline)] last:border-b-0 last:pb-0 text-[14.5px] sm:text-[15px] leading-[1.82] sm:leading-[1.88] text-[var(--text-secondary)]"
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
            )}
          </div>

          {/* 额外信息：作品与背景档案卡 */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-[var(--bg-inset)]/55 border border-[var(--border-hairline)]">
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
              <ul className="mt-3 sm:mt-3.5 space-y-2.5 font-sans text-[14px] sm:text-[14.5px] leading-[1.82] sm:leading-[1.85] text-[var(--text-secondary)]">
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
          className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-[var(--border-subtle)]"
        >
          <div className="flex items-baseline gap-3">
            <span className="tabular-nums text-[11px] tracking-[0.12em] text-[var(--brass)]">
              02
            </span>
            <h3
              id="analysis-heading"
              className="font-mincho font-normal text-[20px] sm:text-[23px] text-[var(--text-primary)] tracking-[0.02em]"
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
            <ul className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4 font-sans text-[14.5px] sm:text-[15px] text-[var(--text-secondary)] leading-[1.84] sm:leading-[1.88]">
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
          className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-[var(--border-subtle)]"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="tabular-nums text-[11px] tracking-[0.12em] text-[var(--brass)]">
                03
              </span>
              <h3
                id="spoils-heading"
                className="font-mincho font-normal text-[20px] sm:text-[23px] text-[var(--text-primary)] tracking-[0.02em]"
              >
                战利品与结局
              </h3>
            </div>

            {!editingActive && (
              <button
                type="button"
                onClick={onToggleReveal}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-2.5 py-1.5 -mr-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
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
            <div className="mt-4 sm:mt-5 py-9 sm:py-11 px-5 sm:px-6 bg-[var(--spoiler-bg)] border border-[var(--border-subtle)] text-[#F2F2F0] text-center">
              <p className="text-[14px] sm:text-[14.5px] text-[#C8C8CE]">
                防剧透遮罩已开启，本局战利品与结局暂不显示。
              </p>
              <button
                type="button"
                onClick={onToggleReveal}
                className="mt-5 inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 bg-[#F4F0E8] text-[#09090C] hover:opacity-90 text-xs font-semibold transition-opacity cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>显示战利品与结局</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 sm:mt-5 space-y-5 sm:space-y-6">
              <ul className="space-y-2.5 font-sans text-[14.5px] sm:text-[15px] text-[var(--text-secondary)]">
                {gamble.spoilsBreakdown.map((item) => (
                  <li
                    key={item}
                    className="grid grid-cols-[1rem_1fr] gap-2 items-baseline leading-[1.82] sm:leading-[1.85]"
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

              <div className="px-4 py-3.5 sm:p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] collector-card">
                <h4 className="font-mincho font-normal text-[16.5px] sm:text-[17px] text-[var(--text-primary)]">
                  结局
                </h4>
                <p className="mt-2 sm:mt-2.5 font-sans text-[14.5px] sm:text-[15px] leading-[1.84] sm:leading-[1.88] text-[var(--text-secondary)]">
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
            className="mt-9 sm:mt-11 py-6 sm:py-8 border-y border-[var(--border-strong)]"
          >
            <div className="flex flex-col gap-5 sm:gap-7">
              {gamble.originalQuotes.map((quote) => (
                <blockquote key={quote.jp}>
                  <p className="font-mincho text-[18px] sm:text-[21px] text-[var(--text-primary)] leading-[1.72] sm:leading-[1.75]">
                    {quote.cn}
                  </p>
                  {showOriginalQuotes && (
                    <p
                      data-testid="quote-original-jp"
                      lang="ja"
                      translate="no"
                      className="mt-2 text-[13px] text-[var(--text-muted)] font-mincho leading-relaxed"
                    >
                      {quote.jp}
                    </p>
                  )}
                  <footer className="mt-2 text-[13px] text-[var(--text-muted)] font-sans">
                    <span className="mr-1.5 text-[var(--brass)]">—</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {quote.speaker}
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                data-testid="toggle-quote-original"
                onClick={() => setShowOriginalQuotes((prev) => !prev)}
                aria-pressed={showOriginalQuotes}
                className="min-h-[36px] px-3 py-1.5 -mr-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-subtle)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
              >
                {showOriginalQuotes ? '隐藏原文' : '显示原文'}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Pagination */}
      {!editingActive && (
        <div className="mt-6 sm:mt-8 grid grid-cols-[1fr_auto_1fr] sm:flex items-center justify-between gap-3 sm:gap-4">
          <span className="col-start-2 sm:col-start-auto justify-self-center tabular-nums text-xs text-[var(--brass)] whitespace-nowrap">
            {String(currentIndex + 1).padStart(2, '0')} /{' '}
            {String(totalCount).padStart(2, '0')}
          </span>
          <div className="contents sm:flex items-center gap-2.5">
            <button
              type="button"
              onClick={onPrev}
              className="col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-4 py-2 text-[13px] sm:text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>上一局</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              className="col-start-3 row-start-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[38px] px-4 py-2 text-[13px] sm:text-xs font-medium bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:opacity-85 transition-opacity whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]"
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
