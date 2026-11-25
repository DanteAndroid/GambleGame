import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  PenLine,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { GAMBLE_RECORDS, MANGA_SERIES, UPCOMING_MANGA_SHELF } from './data/gambles';
import { normalizeThemePresetId, type ThemePresetId } from './data/themes';
import type {
  GambleCategory,
  GambleFilterState,
  MangaSeriesId,
} from './types/gamble';
import {
  filterGambles,
  getAdjacentGambleIds,
  getSeriesCounts,
  isResultHidden,
  toggleRevealSet,
  toggleVoteList,
} from './utils/gambleFilters';
import {
  applyOverridesToGambles,
  applyOverridesToSeries,
  EMPTY_OVERRIDES,
  type ApprovedOverrides,
  type GambleCopyPatch,
  type ModerationStatusResponse,
} from './utils/submissions';
import { SeriesCoverRail } from './components/SeriesCoverRail';
import { VerdictSpread } from './components/VerdictSpread';
import {
  createDetailEditDraft,
  GambleDossier,
  type DetailEditDraft,
} from './components/GambleDossier';
import { GambleCatalog } from './components/GambleCatalog';
import { SeriesBookSection } from './components/SeriesBookSection';
import { UpcomingShelf } from './components/UpcomingShelf';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { ModerationDrawer } from './components/ModerationDrawer';

const VOTES_STORAGE_KEY = 'dujulu_upcoming_votes_v1';
const THEME_STORAGE_KEY = 'dujulu_theme_preset_v1';

function loadInitialVotes(): string[] {
  try {
    const raw = window.localStorage.getItem(VOTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function loadInitialTheme(): ThemePresetId {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return normalizeThemePresetId(saved);
  } catch {
    return 'dark';
  }
}

function parseGambleIdFromHash(): string | null {
  try {
    const hash = window.location.hash;
    if (!hash.startsWith('#gamble/')) return null;
    const id = decodeURIComponent(hash.slice('#gamble/'.length));
    return GAMBLE_RECORDS.some((g) => g.id === id) ? id : null;
  } catch {
    return null;
  }
}

function splitNonEmptyLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, idx) => v === b[idx]);
}

export default function App() {
  const [activeThemeId, setActiveThemeId] = useState<ThemePresetId>(loadInitialTheme);
  const [activeGambleId, setActiveGambleId] = useState<string | null>(() =>
    parseGambleIdFromHash()
  );
  const [selectedUpcomingId, setSelectedUpcomingId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<GambleFilterState>({
    seriesId: 'all',
    category: '全部类型',
    query: '',
  });
  const [spoilerShieldEnabled, setSpoilerShieldEnabled] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());
  const [votedSeriesIds, setVotedSeriesIds] = useState<string[]>(loadInitialVotes);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Server-backed overrides & strict localhost-only moderation state
  const [approvedOverrides, setApprovedOverrides] =
    useState<ApprovedOverrides>(EMPTY_OVERRIDES);
  const [canModerate, setCanModerate] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [moderationOpen, setModerationOpen] = useState(false);

  // Detail-page inline 纠错 edit mode state
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editDraft, setEditDraft] = useState<DetailEditDraft | null>(null);
  const [draftArtworkUrl, setDraftArtworkUrl] = useState<string | null>(null);
  const [draftGalleryUrl, setDraftGalleryUrl] = useState<string | null>(null);
  const [draftSeriesCoverUrl, setDraftSeriesCoverUrl] = useState<string | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editNotice, setEditNotice] = useState<string | null>(null);

  const refreshServerState = useCallback(async () => {
    try {
      const [overridesRes, modRes] = await Promise.all([
        fetch('/api/overrides'),
        fetch('/api/moderation/status'),
      ]);
      if (overridesRes.ok) {
        const nextOverrides = (await overridesRes.json()) as ApprovedOverrides;
        setApprovedOverrides(nextOverrides);
      }
      if (modRes.ok) {
        const modData = (await modRes.json()) as ModerationStatusResponse;
        const allowed = Boolean(modData.canModerate);
        setCanModerate(allowed);
        setPendingCount(allowed ? Number(modData.pendingCount ?? 0) : 0);
        if (allowed && window.location.hash === '#admin') {
          setModerationOpen(true);
        }
      }
    } catch {
      // Keep canonical archive working cleanly if API is unreachable
    }
  }, []);

  useEffect(() => {
    refreshServerState();
  }, [refreshServerState]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeThemeId);
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        'content',
        activeThemeId === 'dark' ? '#09090c' : '#f3eee5'
      );
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, activeThemeId);
    } catch {
      // Ignore storage errors cleanly
    }
  }, [activeThemeId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votedSeriesIds));
    } catch {
      // Ignore storage quota / privacy mode errors cleanly
    }
  }, [votedSeriesIds]);

  const resetDetailEditState = useCallback(() => {
    setIsEditingDetail(false);
    setEditDraft(null);
    setDraftArtworkUrl(null);
    setDraftGalleryUrl(null);
    setDraftSeriesCoverUrl(null);
    setSubmittingEdit(false);
    setEditError(null);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin') {
        if (canModerate) {
          setModerationOpen(true);
        }
        return;
      }
      const id = parseGambleIdFromHash();
      setActiveGambleId(id);
      resetDetailEditState();
      setEditNotice(null);
      if (id) {
        setSelectedUpcomingId(null);
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [canModerate, resetDetailEditState]);

  const effectiveGambles = useMemo(
    () => applyOverridesToGambles(GAMBLE_RECORDS, approvedOverrides),
    [approvedOverrides]
  );

  const { liveSeries, upcomingSeries, liveLookup } = useMemo(
    () => applyOverridesToSeries(MANGA_SERIES, UPCOMING_MANGA_SHELF, approvedOverrides),
    [approvedOverrides]
  );

  const seriesCounts = useMemo(() => getSeriesCounts(effectiveGambles), [effectiveGambles]);

  const filteredGambles = useMemo(
    () => filterGambles(effectiveGambles, filterState),
    [effectiveGambles, filterState]
  );

  const selectedUpcoming = useMemo(
    () =>
      selectedUpcomingId
        ? upcomingSeries.find((u) => u.id === selectedUpcomingId) ?? null
        : null,
    [selectedUpcomingId, upcomingSeries]
  );

  const activeGamble = useMemo(
    () =>
      activeGambleId
        ? effectiveGambles.find((g) => g.id === activeGambleId) ?? null
        : null,
    [activeGambleId, effectiveGambles]
  );

  const activeSeries = activeGamble ? liveLookup[activeGamble.seriesId] : null;

  const activeSeriesGambles = useMemo(
    () =>
      activeGamble
        ? effectiveGambles.filter((g) => g.seriesId === activeGamble.seriesId)
        : [],
    [activeGamble, effectiveGambles]
  );

  const { prevId, nextId, currentIndex } = useMemo(
    () =>
      activeGamble
        ? getAdjacentGambleIds(activeSeriesGambles, activeGamble.id)
        : { prevId: null, nextId: null, currentIndex: -1 },
    [activeSeriesGambles, activeGamble]
  );

  const activeResultHidden = activeGamble
    ? isResultHidden(spoilerShieldEnabled, revealedIds, activeGamble.id)
    : false;

  const clearGambleHash = () => {
    if (
      window.location.hash.startsWith('#gamble/') ||
      window.location.hash === '#admin'
    ) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  const openGambleDetail = (gambleId: string) => {
    setActiveGambleId(gambleId);
    setSelectedUpcomingId(null);
    setActiveImageIndex(0);
    resetDetailEditState();
    setEditNotice(null);
    const targetHash = `#gamble/${encodeURIComponent(gambleId)}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCatalog = () => {
    window.requestAnimationFrame(() => {
      const el = document.getElementById('catalog');
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  };

  const goHome = (seriesId?: MangaSeriesId | 'all') => {
    setActiveGambleId(null);
    setSelectedUpcomingId(null);
    resetDetailEditState();
    setEditNotice(null);
    if (seriesId !== undefined) {
      setFilterState((prev) => ({ ...prev, seriesId }));
    }
    clearGambleHash();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSeriesFromRail = (seriesId: MangaSeriesId | 'all') => {
    setActiveGambleId(null);
    setSelectedUpcomingId(null);
    resetDetailEditState();
    setEditNotice(null);
    setFilterState((prev) => ({ ...prev, seriesId }));
    clearGambleHash();
    scrollToCatalog();
  };

  const handleSelectUpcomingSeries = (upcomingId: string) => {
    setActiveGambleId(null);
    resetDetailEditState();
    setSelectedUpcomingId(upcomingId);
    clearGambleHash();
    scrollToCatalog();
  };

  const handleToggleGlobalSpoiler = () => {
    setSpoilerShieldEnabled((prev) => {
      const next = !prev;
      if (next) {
        setRevealedIds(new Set());
      }
      return next;
    });
  };

  const handleToggleSingleReveal = (gambleId: string) => {
    if (!spoilerShieldEnabled) {
      const allExceptCurrent = new Set(
        GAMBLE_RECORDS.map((g) => g.id).filter((id) => id !== gambleId)
      );
      setSpoilerShieldEnabled(true);
      setRevealedIds(allExceptCurrent);
      return;
    }
    setRevealedIds((prev) => toggleRevealSet(prev, gambleId));
  };

  const handleToggleCardReveal = (gambleId: string) => {
    setRevealedIds((prev) => toggleRevealSet(prev, gambleId));
  };

  const handleCategoryFilter = (category: GambleCategory) => {
    setSelectedUpcomingId(null);
    setFilterState((prev) => ({ ...prev, category }));
  };

  const handleQueryChange = (query: string) => {
    setSelectedUpcomingId(null);
    setFilterState((prev) => ({ ...prev, query }));
  };

  const handleResetFilters = () => {
    setSelectedUpcomingId(null);
    setFilterState({ seriesId: 'all', category: '全部类型', query: '' });
  };

  const handleToggleVote = (seriesId: string) => {
    setVotedSeriesIds((prev) => toggleVoteList(prev, seriesId));
  };

  const handleOverridesChanged = useCallback(
    (nextOverrides: ApprovedOverrides, nextPendingCount: number) => {
      setApprovedOverrides(nextOverrides);
      setPendingCount(nextPendingCount);
    },
    []
  );

  // Enter inline 纠错 edit mode on the active detail page
  const handleEnterDetailEdit = () => {
    if (!activeGamble) return;
    setEditDraft(createDetailEditDraft(activeGamble));
    setDraftArtworkUrl(null);
    setDraftGalleryUrl(null);
    setDraftSeriesCoverUrl(null);
    setEditError(null);
    setEditNotice(null);
    setIsEditingDetail(true);
  };

  const handleUpdateDraft = (patch: Partial<DetailEditDraft>) => {
    setEditDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSubmitDetailEdit = async () => {
    if (!activeGamble || !editDraft || submittingEdit) return;
    setEditError(null);

    const copyPatch: GambleCopyPatch = {};
    const nextTitle = editDraft.title.trim();
    const nextOneLineRule = editDraft.oneLineRule.trim();
    const nextWinCondition = editDraft.winCondition.trim();
    const nextBasicRules = splitNonEmptyLines(editDraft.basicRulesText);
    const nextExtraInfo = splitNonEmptyLines(editDraft.extraInfoText);
    const nextRuleAnalysis = splitNonEmptyLines(editDraft.ruleAnalysisText);
    const nextSpoils = splitNonEmptyLines(editDraft.spoilsBreakdownText);
    const nextEnding = editDraft.ending.trim();

    if (!nextTitle || !nextOneLineRule || !nextWinCondition || !nextEnding) {
      setEditError('标题、一句话规则、胜负判定与结局不能为空。');
      return;
    }
    if (
      nextBasicRules.length === 0 ||
      nextExtraInfo.length === 0 ||
      nextRuleAnalysis.length === 0 ||
      nextSpoils.length === 0
    ) {
      setEditError('流程、额外信息、规则解析与战利品清单至少保留一条。');
      return;
    }

    if (nextTitle !== activeGamble.title) copyPatch.title = nextTitle;
    if (nextOneLineRule !== activeGamble.oneLineRule) copyPatch.oneLineRule = nextOneLineRule;
    if (nextWinCondition !== activeGamble.winCondition) copyPatch.winCondition = nextWinCondition;
    if (!arraysEqual(nextBasicRules, activeGamble.basicRules)) copyPatch.basicRules = nextBasicRules;
    if (!arraysEqual(nextExtraInfo, activeGamble.extraInfo)) copyPatch.extraInfo = nextExtraInfo;
    if (!arraysEqual(nextRuleAnalysis, activeGamble.ruleAnalysis))
      copyPatch.ruleAnalysis = nextRuleAnalysis;
    if (!arraysEqual(nextSpoils, activeGamble.spoilsBreakdown))
      copyPatch.spoilsBreakdown = nextSpoils;
    if (nextEnding !== activeGamble.ending) copyPatch.ending = nextEnding;

    const hasCopyChanges = Object.keys(copyPatch).length > 0;
    const hasArtworkChange = Boolean(draftArtworkUrl);
    const hasGalleryChange = Boolean(draftGalleryUrl);
    const hasSeriesCoverChange = Boolean(draftSeriesCoverUrl);

    if (
      !hasCopyChanges &&
      !hasArtworkChange &&
      !hasGalleryChange &&
      !hasSeriesCoverChange
    ) {
      setEditError('当前没有检测到修改内容，请编辑文案或上传新图片后再提交。');
      return;
    }

    setSubmittingEdit(true);
    try {
      const submittedBy = editDraft.submittedBy.trim() || '匿名读者';
      const note = editDraft.note.trim();

      const requests: Array<Record<string, unknown>> = [];
      if (hasCopyChanges) {
        requests.push({
          type: 'gamble-copy',
          targetId: activeGamble.id,
          copyPatch,
          submittedBy,
          note,
        });
      }
      if (hasArtworkChange && draftArtworkUrl) {
        requests.push({
          type: 'gamble-artwork',
          targetId: activeGamble.id,
          imageDataUrl: draftArtworkUrl,
          submittedBy,
          note: note || '详情页纠错更换主图',
        });
      }
      if (hasGalleryChange && draftGalleryUrl) {
        requests.push({
          type: 'gamble-gallery',
          targetId: activeGamble.id,
          imageDataUrl: draftGalleryUrl,
          submittedBy,
          note: note || '详情页纠错追加配图',
        });
      }
      if (hasSeriesCoverChange && draftSeriesCoverUrl) {
        requests.push({
          type: 'series-cover',
          targetId: activeGamble.seriesId,
          imageDataUrl: draftSeriesCoverUrl,
          submittedBy,
          note: note || '详情页纠错更换作品封面',
        });
      }

      for (const payload of requests) {
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          throw new Error(data.error ?? '提交失败，请检查内容后重试');
        }
      }

      await refreshServerState();
      resetDetailEditState();
      setEditNotice(
        `已提交 ${requests.length} 条纠错记录至管理后台待审，本机确认通过后即会生效。`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setEditError(err instanceof Error ? err.message : '提交失败，请稍后重试');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleCloseModeration = () => {
    setModerationOpen(false);
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const activeRailId = selectedUpcomingId ?? filterState.seriesId;

  return (
    <div className="min-h-screen atelier-canvas text-[var(--text-primary)] flex flex-col transition-colors duration-200">
      {/* Slim Brand + Utility Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-subtle)] pt-[env(safe-area-inset-top)]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Wordmark: 博弈游戏 */}
          <a
            href="#catalog"
            onClick={(e) => {
              e.preventDefault();
              goHome('all');
            }}
            className="group inline-flex items-center gap-2 sm:gap-3 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--text-primary)]"
          >
            <span
              aria-hidden="true"
              className="w-1 h-5 sm:w-1.5 sm:h-6 bg-[var(--accent)] shrink-0"
            />
            <span className="font-display font-normal text-[22px] min-[375px]:text-[25px] sm:text-[30px] leading-none tracking-[0.1em] sm:tracking-[0.12em] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              博弈游戏
            </span>
          </a>

          {/* Utility Controls: Localhost Admin Entry + Theme + Spoiler */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {canModerate && (
              <button
                type="button"
                data-testid="open-moderation-btn"
                onClick={() => setModerationOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 min-h-[38px] sm:min-h-[34px] px-2.5 sm:px-3 py-1.5 text-xs font-medium tracking-wide border border-[var(--brass-muted)] bg-[var(--bg-card)] text-[var(--brass)] hover:border-[var(--brass)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>管理</span>
                {pendingCount > 0 && (
                  <span
                    data-testid="pending-count-badge"
                    className="ml-0.5 px-1.5 py-[1px] text-[10.5px] font-semibold tabular-nums bg-[var(--accent)] text-[var(--accent-fg)] leading-tight"
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            <ThemeSwitcher
              activeThemeId={activeThemeId}
              onSelectTheme={setActiveThemeId}
            />

            <button
              type="button"
              data-testid="global-spoiler-toggle"
              onClick={handleToggleGlobalSpoiler}
              aria-pressed={spoilerShieldEnabled}
              aria-label={spoilerShieldEnabled ? '防剧透：开启，点击关闭' : '防剧透：关闭，点击开启'}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[38px] sm:min-h-[34px] px-2.5 sm:px-3 py-1.5 text-xs font-medium tracking-wide border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] ${
                spoilerShieldEnabled
                  ? 'bg-[var(--text-primary)] text-[var(--bg-page)] border-[var(--text-primary)] hover:opacity-90'
                  : 'bg-transparent text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--bg-card)]'
              }`}
            >
              {spoilerShieldEnabled ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="min-[400px]:hidden">已遮罩</span>
                  <span className="hidden min-[400px]:inline">防剧透：开</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="min-[400px]:hidden">防剧透</span>
                  <span className="hidden min-[400px]:inline">防剧透：关</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Top Manga Volume Cover Showcase — Shown ONLY on Homepage (Hidden on Detail Page) */}
      {!activeGamble && (
        <SeriesCoverRail
          selectedId={activeRailId}
          liveSeries={liveSeries}
          upcomingSeries={upcomingSeries}
          seriesCounts={seriesCounts}
          onSelectAll={() => handleSelectSeriesFromRail('all')}
          onSelectLiveSeries={(seriesId) => handleSelectSeriesFromRail(seriesId)}
          onSelectUpcomingSeries={handleSelectUpcomingSeries}
        />
      )}

      <main className="flex-1 w-full">
        {activeGamble && activeSeries ? (
          /* ==================== VIEW 2: GAMBLE DETAIL PAGE ==================== */
          <div
            key={activeGamble.id}
            data-testid="gamble-detail-view"
            className="page-reveal"
          >
            <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
              {/* Back Navigation + 纠错 Entry Strip */}
              <div className="pt-3.5 pb-3 sm:pt-5 sm:pb-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => goHome()}
                  className="group inline-flex items-center gap-1.5 sm:gap-2 py-1.5 -ml-1 px-1 min-h-[36px] text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <ArrowLeft
                    className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                  <span className="min-[380px]:hidden">返回</span>
                  <span className="hidden min-[380px]:inline">返回全部赌局</span>
                </button>

                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <p className="flex items-center gap-1 text-xs tabular-nums text-[var(--text-muted)] min-w-0">
                    <span className="max-w-[7.5rem] min-[400px]:max-w-[10rem] sm:max-w-none truncate">
                      《{activeSeries.title}》
                    </span>
                    <span aria-hidden="true" className="shrink-0">
                      ·
                    </span>
                    <span className="shrink-0 whitespace-nowrap">
                      <span className="text-[var(--brass)]">
                        {String(currentIndex + 1).padStart(2, '0')}
                      </span>{' '}
                      / {String(activeSeriesGambles.length).padStart(2, '0')}
                    </span>
                  </p>

                  {!isEditingDetail ? (
                    <button
                      type="button"
                      data-testid="detail-edit-mode-btn"
                      onClick={handleEnterDetailEdit}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-2.5 sm:px-3 py-1.5 text-xs font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <PenLine className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>纠错</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        type="button"
                        data-testid="detail-edit-cancel-btn"
                        onClick={resetDetailEditState}
                        disabled={submittingEdit}
                        className="inline-flex items-center justify-center gap-1 min-h-[36px] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>取消编辑</span>
                      </button>
                      <button
                        type="button"
                        data-testid="detail-edit-submit-btn"
                        onClick={handleSubmitDetailEdit}
                        disabled={submittingEdit}
                        className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3 sm:px-3.5 py-1.5 text-xs font-medium bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{submittingEdit ? '提交中…' : '提交审核'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Inline Edit Banner */}
              {isEditingDetail && (
                <div
                  data-testid="detail-edit-banner"
                  className="banner-reveal mt-5 px-4 py-3 bg-[var(--bg-card)] border border-[var(--brass-muted)] flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <p className="text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--brass)] mr-2">
                      纠错模式
                    </span>
                    可直接修改右侧规则文案，或在左侧更换赌局原图、追加配图及作品封面；提交后将进入待审队列。
                  </p>
                  {editError && (
                    <p className="text-[var(--accent)] font-medium" role="alert">
                      {editError}
                    </p>
                  )}
                </div>
              )}

              {/* Post-Submission Confirmation Banner */}
              {editNotice && !isEditingDetail && (
                <div
                  data-testid="detail-edit-notice"
                  role="status"
                  className="banner-reveal mt-5 px-4 py-3 bg-[var(--bg-card)] border border-[var(--brass)]/60 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <p className="text-[var(--text-primary)]">{editNotice}</p>
                  <div className="flex items-center gap-3 shrink-0">
                    {canModerate && (
                      <button
                        type="button"
                        onClick={() => setModerationOpen(true)}
                        className="text-[var(--brass)] hover:underline font-medium cursor-pointer"
                      >
                        前往后台审核
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditNotice(null)}
                      aria-label="关闭提示"
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upper Section (~70%): Current Gamble Artwork + Full Dossier */}
              <section
                id="verdict-stage"
                aria-label="当前赌局封面与规则档案"
                className="pt-5 sm:pt-8 lg:pt-10 pb-12 sm:pb-16 lg:pb-20"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-7 md:gap-8 lg:gap-11 xl:gap-14 items-start">
                  <div className="md:col-span-5 md:sticky md:top-20 lg:top-22 w-full max-w-[360px] mx-auto md:max-w-[430px] md:mx-0">
                    <VerdictSpread
                      key={activeGamble.id}
                      gamble={activeGamble}
                      seriesTitle={activeSeries.title}
                      activeImageIndex={activeImageIndex}
                      onChangeImageIndex={setActiveImageIndex}
                      isEditing={isEditingDetail}
                      titleOverride={editDraft?.title}
                      draftArtworkUrl={draftArtworkUrl}
                      draftGalleryUrl={draftGalleryUrl}
                      draftSeriesCoverUrl={draftSeriesCoverUrl}
                      onSelectDraftArtwork={setDraftArtworkUrl}
                      onSelectDraftGallery={setDraftGalleryUrl}
                      onSelectDraftSeriesCover={setDraftSeriesCoverUrl}
                      onClearDraftArtwork={() => setDraftArtworkUrl(null)}
                      onClearDraftGallery={() => setDraftGalleryUrl(null)}
                      onClearDraftSeriesCover={() => setDraftSeriesCoverUrl(null)}
                    />
                  </div>

                  <div className="md:col-span-7 min-w-0">
                    <GambleDossier
                      gamble={activeGamble}
                      series={activeSeries}
                      isHidden={activeResultHidden}
                      onToggleReveal={() => handleToggleSingleReveal(activeGamble.id)}
                      isEditing={isEditingDetail}
                      editDraft={editDraft}
                      onChangeDraft={handleUpdateDraft}
                      onCancelEdit={resetDetailEditState}
                      onSubmitEdit={handleSubmitDetailEdit}
                      submittingEdit={submittingEdit}
                      editError={editError}
                      onPrev={() => prevId && openGambleDetail(prevId)}
                      onNext={() => nextId && openGambleDetail(nextId)}
                      currentIndex={currentIndex >= 0 ? currentIndex : 0}
                      totalCount={activeSeriesGambles.length}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Bottom Section (~30%): Full-Bleed Book Colophon & Chapter Selector */}
            <SeriesBookSection
              series={activeSeries}
              seriesGambles={activeSeriesGambles}
              currentGambleId={activeGamble.id}
              onSelectGamble={openGambleDetail}
              onBrowseSeriesOnHome={(seriesId) => goHome(seriesId)}
            />
          </div>
        ) : (
          /* ==================== VIEW 1: HOMEPAGE (ALL GAMBLES) ==================== */
          <div
            key={`catalog-${activeRailId}`}
            data-testid="home-catalog-view"
            className="page-reveal max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8"
          >
            <GambleCatalog
              filteredGambles={filteredGambles}
              selectedGambleId={null}
              selectedUpcoming={selectedUpcoming}
              liveSeriesLookup={liveLookup}
              filterState={filterState}
              seriesCounts={seriesCounts}
              spoilerShieldEnabled={spoilerShieldEnabled}
              revealedIds={revealedIds}
              votedSeriesIds={votedSeriesIds}
              onSelectGamble={openGambleDetail}
              onToggleCardReveal={handleToggleCardReveal}
              onToggleVote={handleToggleVote}
              onChangeCategory={handleCategoryFilter}
              onChangeQuery={handleQueryChange}
              onResetFilters={handleResetFilters}
            />

            {!selectedUpcoming && (
              <UpcomingShelf
                upcomingSeries={upcomingSeries}
                votedSeriesIds={votedSeriesIds}
                onToggleVote={handleToggleVote}
                onSelectUpcoming={handleSelectUpcomingSeries}
              />
            )}
          </div>
        )}
      </main>

      {/* Quiet Editorial Disclaimer Footer — Adapts to Full Container Width */}
      <footer
        data-testid="site-footer"
        className="border-t border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-muted)]"
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 safe-bottom flex flex-col sm:flex-row items-start sm:items-baseline gap-3 sm:gap-6 text-xs leading-[1.85]">
          <p className="font-display font-normal text-[22px] leading-none tracking-[0.12em] text-[var(--text-primary)] shrink-0">
            博弈游戏
          </p>
          <p
            data-testid="footer-disclaimer-text"
            className="flex-1 min-w-0 text-[var(--text-muted)]"
          >
            <span className="text-[var(--text-secondary)] font-medium">免责声明：</span>
            本站仅作斗智题材漫画作品的规则梳理与设定归档之用，仅供爱好者交流参考。页面所涉漫画名称、剧情角色、台词及原图版权均归原作者与出版方所有，如有侵权请联系删除。所有赌局与博弈桥段均属虚构艺术创作，请理性看待，切勿模仿或参与任何现实赌博活动。
          </p>
        </div>
      </footer>

      {/* Localhost-Only Content Management & Moderation Drawer */}
      {canModerate && (
        <ModerationDrawer
          open={moderationOpen}
          onClose={handleCloseModeration}
          onOverridesChanged={handleOverridesChanged}
        />
      )}
    </div>
  );
}
