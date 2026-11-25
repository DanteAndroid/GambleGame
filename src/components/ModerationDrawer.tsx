import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Check, ImageUp, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { GAMBLE_RECORDS, MANGA_SERIES, UPCOMING_MANGA_SHELF } from '../data/gambles';
import { getThumbImageUrl } from '../utils/imageUrl';
import {
  COPY_FIELD_LABELS,
  type ApprovedOverrides,
  type ContentSubmission,
  type GambleCopyPatch,
  type SubmissionType,
} from '../utils/submissions';

interface ModerationDrawerProps {
  open: boolean;
  onClose: () => void;
  onOverridesChanged: (overrides: ApprovedOverrides, pendingCount: number) => void;
}

const TYPE_LABELS: Record<SubmissionType, string> = {
  'series-cover': '更换作品封面',
  'gamble-artwork': '替换赌局主图',
  'gamble-gallery': '追加原漫配图',
  'gamble-copy': '修订赌局文案',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function renderFieldValue(val: string | string[] | undefined): string {
  if (!val) return '（空）';
  return Array.isArray(val) ? val.join('\n') : val;
}

export function ModerationDrawer({
  open,
  onClose,
  onOverridesChanged,
}: ModerationDrawerProps) {
  const [tab, setTab] = useState<'pending' | 'covers' | 'history'>('pending');
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [overrides, setOverrides] = useState<ApprovedOverrides | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coverNotice, setCoverNotice] = useState<string | null>(null);

  const seriesCoverMap = useMemo(() => {
    const map = new Map<string, { title: string; coverUrl: string }>();
    for (const s of MANGA_SERIES) map.set(s.id, { title: s.title, coverUrl: s.coverUrl });
    for (const u of UPCOMING_MANGA_SHELF) map.set(u.id, { title: u.title, coverUrl: u.coverUrl });
    return map;
  }, []);

  const gambleBaseMap = useMemo(() => {
    const map = new Map<string, (typeof GAMBLE_RECORDS)[number]>();
    for (const g of GAMBLE_RECORDS) map.set(g.id, g);
    return map;
  }, []);

  const fetchModerationData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/moderation/submissions');
      const data = (await res.json()) as {
        submissions?: ContentSubmission[];
        overrides?: ApprovedOverrides;
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(data.error ?? '无权访问本机审核接口');
        return;
      }
      const list = data.submissions ?? [];
      setSubmissions(list);
      if (data.overrides) {
        setOverrides(data.overrides);
        onOverridesChanged(
          data.overrides,
          list.filter((s) => s.status === 'pending').length
        );
      }
    } catch {
      setErrorMsg('无法加载审核列表');
    } finally {
      setLoading(false);
    }
  }, [onOverridesChanged]);

  useEffect(() => {
    if (open) {
      fetchModerationData();
    }
  }, [open, fetchModerationData]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const pendingItems = submissions.filter((s) => s.status === 'pending');
  const historyItems = submissions.filter((s) => s.status !== 'pending');

  const handleDecision = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/moderation/submissions/${encodeURIComponent(id)}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = (await res.json()) as {
        submission?: ContentSubmission;
        overrides?: ApprovedOverrides;
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(data.error ?? '操作失败');
        return;
      }
      const nextList = submissions.map((s) =>
        s.id === id && data.submission ? data.submission : s
      );
      setSubmissions(nextList);
      if (data.overrides) {
        setOverrides(data.overrides);
        onOverridesChanged(
          data.overrides,
          nextList.filter((s) => s.status === 'pending').length
        );
      }
    } catch {
      setErrorMsg('网络异常，操作未完成');
    } finally {
      setBusyId(null);
    }
  };

  const handleRevert = async (
    type: SubmissionType,
    targetId: string,
    imageUrl?: string
  ) => {
    const key = `${type}:${targetId}:${imageUrl ?? ''}`;
    setBusyId(key);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/moderation/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetId, imageUrl }),
      });
      const data = (await res.json()) as {
        overrides?: ApprovedOverrides;
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(data.error ?? '还原失败');
        return;
      }
      if (data.overrides) {
        setOverrides(data.overrides);
        onOverridesChanged(data.overrides, pendingItems.length);
      }
    } catch {
      setErrorMsg('网络异常，还原失败');
    } finally {
      setBusyId(null);
    }
  };

  const handleDirectSeriesCoverChange = (
    seriesId: string,
    seriesTitle: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('仅支持 JPG、PNG 或 WebP 格式图片');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('单张封面图不能超过 5MB');
      return;
    }

    setErrorMsg(null);
    setCoverNotice(null);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      const busyKey = `cover:${seriesId}`;
      setBusyId(busyKey);
      try {
        const res = await fetch('/api/moderation/series-cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seriesId, imageDataUrl: reader.result }),
        });
        const data = (await res.json()) as {
          overrides?: ApprovedOverrides;
          error?: string;
        };
        if (!res.ok) {
          setErrorMsg(data.error ?? '封面更新失败');
          return;
        }
        if (data.overrides) {
          setOverrides(data.overrides);
          onOverridesChanged(data.overrides, pendingItems.length);
          setCoverNotice(`已更新《${seriesTitle}》封面`);
        }
      } catch {
        setErrorMsg('网络异常，封面更新失败');
      } finally {
        setBusyId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const activeOverrideEntries: Array<{
    key: string;
    type: SubmissionType;
    targetId: string;
    label: string;
    imageUrl?: string;
  }> = [];

  if (overrides) {
    for (const [seriesId, url] of Object.entries(overrides.seriesCovers)) {
      const s = seriesCoverMap.get(seriesId);
      activeOverrideEntries.push({
        key: `series-cover:${seriesId}`,
        type: 'series-cover',
        targetId: seriesId,
        label: `作品封面 · 《${s?.title ?? seriesId}》`,
        imageUrl: url,
      });
    }
    for (const [gambleId, url] of Object.entries(overrides.gambleArtworks)) {
      const g = gambleBaseMap.get(gambleId);
      activeOverrideEntries.push({
        key: `gamble-artwork:${gambleId}`,
        type: 'gamble-artwork',
        targetId: gambleId,
        label: `赌局主图 · ${g?.title ?? gambleId}`,
        imageUrl: url,
      });
    }
    for (const [gambleId, urls] of Object.entries(overrides.gambleGalleries)) {
      const g = gambleBaseMap.get(gambleId);
      for (const url of urls) {
        activeOverrideEntries.push({
          key: `gamble-gallery:${gambleId}:${url}`,
          type: 'gamble-gallery',
          targetId: gambleId,
          label: `追加配图 · ${g?.title ?? gambleId}`,
          imageUrl: url,
        });
      }
    }
    for (const gambleId of Object.keys(overrides.gambleCopies)) {
      const g = gambleBaseMap.get(gambleId);
      activeOverrideEntries.push({
        key: `gamble-copy:${gambleId}`,
        type: 'gamble-copy',
        targetId: gambleId,
        label: `文案修订 · ${g?.title ?? gambleId}`,
      });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="moderation-modal-title"
      data-testid="moderation-drawer"
      className="modal-backdrop-enter fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel-enter w-full max-w-4xl h-full sm:h-auto max-h-full sm:max-h-[90vh] flex flex-col bg-[var(--bg-card)] border-0 sm:border border-[var(--border-strong)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-3 sm:gap-4 bg-[var(--bg-shelf)]">
          <div className="flex items-center gap-3 min-w-0">
            <SlidersHorizontal
              className="w-5 h-5 text-[var(--brass)] shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="moderation-modal-title"
                  className="font-mincho font-normal text-[18px] sm:text-[20px] text-[var(--text-primary)]"
                >
                  管理后台
                </h2>
                <span className="px-2 py-0.5 text-[10.5px] tracking-wide bg-[var(--bg-inset)] text-[var(--brass)] border border-[var(--brass-muted)]">
                  仅限本机 localhost
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1 sm:line-clamp-none">
                审核读者提交的纠错记录，管理作品封面与已生效覆盖；仅限本机访问
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="关闭管理后台"
            className="w-9 h-9 inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 pt-3.5 pb-3 border-b border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="admin-tab-pending"
              onClick={() => setTab('pending')}
              className={`min-h-[36px] px-3.5 py-1.5 text-xs border transition-colors cursor-pointer ${
                tab === 'pending'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] border-[var(--btn-primary-bg)] font-semibold'
                  : 'bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              待审核（{pendingItems.length}）
            </button>
            <button
              type="button"
              data-testid="admin-tab-covers"
              onClick={() => setTab('covers')}
              className={`min-h-[36px] px-3.5 py-1.5 text-xs border transition-colors cursor-pointer ${
                tab === 'covers'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] border-[var(--btn-primary-bg)] font-semibold'
                  : 'bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              作品封面（{MANGA_SERIES.length}）
            </button>
            <button
              type="button"
              data-testid="admin-tab-history"
              onClick={() => setTab('history')}
              className={`min-h-[36px] px-3.5 py-1.5 text-xs border transition-colors cursor-pointer ${
                tab === 'history'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] border-[var(--btn-primary-bg)] font-semibold'
                  : 'bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              已生效覆盖与记录（{activeOverrideEntries.length}）
            </button>
          </div>
          <button
            type="button"
            onClick={fetchModerationData}
            className="min-h-[36px] px-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            刷新
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">
          {errorMsg && (
            <p className="px-3.5 py-2.5 text-xs bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/40">
              {errorMsg}
            </p>
          )}

          {loading ? (
            <p className="py-12 text-center text-sm text-[var(--text-muted)]">
              正在读取审核队列...
            </p>
          ) : tab === 'pending' ? (
            pendingItems.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[var(--border-subtle)]">
                <p className="font-mincho text-base text-[var(--text-primary)]">
                  当前没有待审核的投稿
                </p>
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  用户提交更换封面、上传图片或修改文案后，会实时出现在这里等待确认
                </p>
              </div>
            ) : (
              pendingItems.map((item) => {
                const currentCoverUrl =
                  item.type === 'series-cover'
                    ? overrides?.seriesCovers[item.targetId] ??
                      seriesCoverMap.get(item.targetId)?.coverUrl
                    : overrides?.gambleArtworks[item.targetId] ??
                      gambleBaseMap.get(item.targetId)?.artworkUrl;

                const baseGamble = gambleBaseMap.get(item.targetId);
                const effectiveGamble = baseGamble
                  ? { ...baseGamble, ...(overrides?.gambleCopies[item.targetId] ?? {}) }
                  : null;

                return (
                  <article
                    key={item.id}
                    data-testid={`pending-submission-${item.id}`}
                    className="bg-[var(--bg-inset)]/55 border border-[var(--border-subtle)] p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span className="px-2 py-0.5 bg-[var(--bg-card)] text-[var(--brass)] border border-[var(--border-subtle)] font-medium">
                          {TYPE_LABELS[item.type]}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)] text-sm">
                          {item.targetLabel}
                        </span>
                      </div>
                      <span className="text-[11.5px] text-[var(--text-muted)] tabular-nums">
                        {item.submittedBy} · {formatTime(item.createdAt)}
                      </span>
                    </div>

                    {item.note && (
                      <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] px-3 py-2 border-l-2 border-[var(--brass)]">
                        备注：{item.note}
                      </p>
                    )}

                    {/* Image Comparison */}
                    {item.imageUrl && (
                      <div className="flex flex-wrap items-start gap-6">
                        {currentCoverUrl && item.type !== 'gamble-gallery' && (
                          <div>
                            <p className="text-[11px] text-[var(--text-muted)] mb-1.5">当前图片</p>
                            <div className="w-28 aspect-[128/182] overflow-hidden bg-[var(--bg-img)] ring-1 ring-[var(--img-ring)]">
                              <img
                                src={getThumbImageUrl(currentCoverUrl)}
                                alt="当前图片"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover block"
                              />
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-[11px] text-[var(--brass)] mb-1.5">
                            {item.type === 'gamble-gallery' ? '新增原漫配图' : '投稿新图'}
                          </p>
                          <div className="w-28 aspect-[128/182] overflow-hidden bg-[var(--bg-img)] ring-2 ring-[var(--brass)]">
                            <img
                              src={item.imageUrl}
                              alt="投稿新图"
                              className="w-full h-full object-cover block"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Copy Diff Comparison */}
                    {item.copyPatch && effectiveGamble && (
                      <div className="space-y-3">
                        {(Object.keys(item.copyPatch) as (keyof GambleCopyPatch)[]).map((field) => (
                          <div
                            key={field}
                            className="bg-[var(--bg-card)] border border-[var(--border-hairline)] p-3 space-y-2 text-xs"
                          >
                            <p className="text-[var(--brass)] font-medium">
                              {COPY_FIELD_LABELS[field]}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-[10.5px] text-[var(--text-muted)] mb-1">修改前</p>
                                <p className="whitespace-pre-wrap text-[var(--text-muted)] leading-relaxed">
                                  {renderFieldValue(
                                    effectiveGamble[field] as string | string[] | undefined
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10.5px] text-emerald-400 mb-1">修改后</p>
                                <p className="whitespace-pre-wrap text-[var(--text-primary)] leading-relaxed">
                                  {renderFieldValue(
                                    item.copyPatch?.[field] as string | string[] | undefined
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        data-testid={`reject-btn-${item.id}`}
                        disabled={busyId === item.id}
                        onClick={() => handleDecision(item.id, 'reject')}
                        className="px-3.5 py-1.5 text-xs border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        驳回
                      </button>
                      <button
                        type="button"
                        data-testid={`approve-btn-${item.id}`}
                        disabled={busyId === item.id}
                        onClick={() => handleDecision(item.id, 'approve')}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>通过并发布</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )
          ) : tab === 'covers' ? (
            <div className="space-y-4">
              {coverNotice && (
                <p
                  role="status"
                  className="px-3.5 py-2.5 text-xs bg-[var(--bg-inset)] text-[var(--brass)] border border-[var(--brass-muted)]"
                >
                  {coverNotice}
                </p>
              )}
              <p className="text-xs text-[var(--text-muted)]">
                在此更换任意作品的顶部书架封面会立即生效；如需恢复原版单行本封面，可随时点击还原。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MANGA_SERIES.map((series) => {
                  const overrideUrl = overrides?.seriesCovers[series.id];
                  const effectiveCover = overrideUrl ?? series.coverUrl;
                  const isBusy =
                    busyId === `cover:${series.id}` ||
                    busyId === `series-cover:${series.id}:`;
                  return (
                    <div
                      key={series.id}
                      data-testid={`admin-cover-card-${series.id}`}
                      className="flex gap-3.5 p-3.5 bg-[var(--bg-inset)]/55 border border-[var(--border-subtle)]"
                    >
                      <div className="w-[74px] aspect-[128/182] rounded-[4px] overflow-hidden bg-[var(--bg-img)] ring-1 ring-[var(--img-ring)] shrink-0">
                        <img
                          src={getThumbImageUrl(effectiveCover)}
                          alt={`《${series.title}》封面`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover block"
                        />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-mincho text-sm text-[var(--text-primary)] truncate">
                            《{series.title}》
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-[var(--text-muted)] truncate">
                            {series.author}
                          </p>
                          {overrideUrl && (
                            <p className="mt-1 text-[10.5px] text-[var(--brass)]">
                              已使用自定义封面
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <label
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-colors cursor-pointer ${
                              isBusy ? 'opacity-50 pointer-events-none' : ''
                            }`}
                          >
                            <ImageUp className="w-3 h-3" aria-hidden="true" />
                            <span>{isBusy ? '上传中…' : '更换封面'}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="sr-only"
                              disabled={isBusy}
                              onChange={(e) =>
                                handleDirectSeriesCoverChange(series.id, series.title, e)
                              }
                            />
                          </label>
                          {overrideUrl && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleRevert('series-cover', series.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" aria-hidden="true" />
                              <span>还原默认</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-medium tracking-wider text-[var(--brass)] mb-3">
                  当前生效的自定义覆盖（可随时还原）
                </h3>
                {activeOverrideEntries.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] py-4">
                    暂无自定义覆盖，全部页面均展示原始档案。
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeOverrideEntries.map((entry) => (
                      <div
                        key={entry.key}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[var(--bg-inset)]/55 border border-[var(--border-subtle)] text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {entry.imageUrl && (
                            <img
                              src={entry.imageUrl}
                              alt=""
                              className="w-7 h-10 object-cover shrink-0 ring-1 ring-[var(--img-ring)]"
                            />
                          )}
                          <span className="text-[var(--text-primary)] truncate">
                            {entry.label}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={busyId === entry.key}
                          onClick={() =>
                            handleRevert(entry.type, entry.targetId, entry.imageUrl)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] border border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" aria-hidden="true" />
                          <span>还原默认</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-medium tracking-wider text-[var(--text-muted)] mb-3">
                  历史审核记录（{historyItems.length}）
                </h3>
                {historyItems.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">暂无历史记录。</p>
                ) : (
                  <div className="space-y-2">
                    {historyItems.slice(0, 20).map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[var(--bg-inset)]/35 border border-[var(--border-hairline)] text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-1.5 py-0.5 text-[10.5px] font-medium ${
                              item.status === 'approved'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-[var(--accent)]/15 text-[var(--accent)]'
                            }`}
                          >
                            {item.status === 'approved' ? '已通过' : '已驳回'}
                          </span>
                          <span className="text-[var(--text-primary)]">
                            {TYPE_LABELS[item.type]} · {item.targetLabel}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                          {item.submittedBy} · {formatTime(item.reviewedAt ?? item.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
