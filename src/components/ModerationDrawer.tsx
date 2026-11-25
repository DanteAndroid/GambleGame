import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Check, ImageUp, RotateCcw, SlidersHorizontal, X, ZoomIn } from 'lucide-react';
import { GAMBLE_RECORDS, MANGA_SERIES, UPCOMING_MANGA_SHELF } from '../data/gambles';
import { compressImageFileToWebP, formatByteSize } from '../utils/imageCompress';
import { getThumbImageUrl } from '../utils/imageUrl';
import { computeTextDiff } from '../utils/textDiff';
import {
  COPY_FIELD_LABELS,
  type ApprovedOverrides,
  type ContentSubmission,
  type GambleCopyPatch,
  type SubmissionType,
} from '../utils/submissions';

interface ModerationDrawerProps {
  open: boolean;
  adminToken?: string | null;
  isLocalhost?: boolean;
  onClose: () => void;
  onLogout?: () => void;
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

function HighlightedDiffView({
  beforeText,
  afterText,
  side,
}: {
  beforeText: string;
  afterText: string;
  side: 'before' | 'after';
}) {
  const segments = useMemo(
    () => computeTextDiff(beforeText, afterText),
    [beforeText, afterText]
  );

  return (
    <p
      data-testid={`diff-${side}-text`}
      className="whitespace-pre-wrap leading-relaxed break-words"
    >
      {segments.map((seg, idx) => {
        if (side === 'before') {
          if (seg.type === 'added') return null;
          if (seg.type === 'removed') {
            return (
              <del
                key={idx}
                className="bg-[var(--accent)]/22 text-[var(--text-primary)] px-0.5 line-through decoration-[var(--accent)]"
              >
                {seg.text}
              </del>
            );
          }
          return (
            <span key={idx} className="text-[var(--text-muted)]">
              {seg.text}
            </span>
          );
        }

        if (seg.type === 'removed') return null;
        if (seg.type === 'added') {
          return (
            <ins
              key={idx}
              className="no-underline bg-emerald-500/22 text-[var(--text-primary)] px-0.5 font-medium border-b border-emerald-400/70"
            >
              {seg.text}
            </ins>
          );
        }
        return (
          <span key={idx} className="text-[var(--text-secondary)]">
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}

export function ModerationDrawer({
  open,
  adminToken = null,
  isLocalhost = false,
  onClose,
  onLogout,
  onOverridesChanged,
}: ModerationDrawerProps) {
  const [tab, setTab] = useState<'pending' | 'covers' | 'history'>('pending');
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [overrides, setOverrides] = useState<ApprovedOverrides | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coverNotice, setCoverNotice] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; label: string } | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }
    return headers;
  }, [adminToken]);

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
      const res = await fetch('/api/moderation/submissions', {
        headers: authHeaders,
      });
      const data = (await res.json()) as {
        submissions?: ContentSubmission[];
        overrides?: ApprovedOverrides;
        error?: string;
      };
      if (!res.ok) {
        setErrorMsg(data.error ?? '无权访问管理后台接口');
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
  }, [authHeaders, onOverridesChanged]);

  useEffect(() => {
    if (open) {
      fetchModerationData();
    }
  }, [open, fetchModerationData]);

  useEffect(() => {
    if (!open) {
      setPreviewImage(null);
      setPreviewDimensions(null);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewImage) {
          setPreviewImage(null);
          setPreviewDimensions(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, previewImage]);

  if (!open) return null;

  const openImagePreview = (src: string, label: string) => {
    setPreviewDimensions(null);
    setPreviewImage({ src, label });
  };

  const pendingItems = submissions.filter((s) => s.status === 'pending');
  const historyItems = submissions.filter((s) => s.status !== 'pending');

  const handleDecision = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/moderation/submissions/${encodeURIComponent(id)}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
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
        headers: { 'Content-Type': 'application/json', ...authHeaders },
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

  const handleDirectSeriesCoverChange = async (
    seriesId: string,
    seriesTitle: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMsg(null);
    setCoverNotice(null);
    const busyKey = `cover:${seriesId}`;
    setBusyId(busyKey);
    try {
      const compressed = await compressImageFileToWebP(file);
      const res = await fetch('/api/moderation/series-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ seriesId, imageDataUrl: compressed.dataUrl }),
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
        const fmt = compressed.format === 'webp' ? 'WebP' : '原图';
        setCoverNotice(
          `已更新《${seriesTitle}》封面（${fmt} · ${compressed.width}×${compressed.height} · ${formatByteSize(compressed.outputBytes)}）`
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '封面更新失败');
    } finally {
      setBusyId(null);
    }
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
      className="modal-backdrop-enter fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel-enter w-full max-w-4xl max-h-[90vh] flex flex-col bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4 bg-[var(--bg-shelf)]">
          <div className="flex items-center gap-3">
            <SlidersHorizontal
              className="w-5 h-5 text-[var(--brass)] shrink-0"
              aria-hidden="true"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h2
                  id="moderation-modal-title"
                  className="font-mincho font-normal text-[20px] text-[var(--text-primary)]"
                >
                  管理后台
                </h2>
                <span className="px-2 py-0.5 text-[10.5px] tracking-wide bg-[var(--bg-inset)] text-[var(--brass)] border border-[var(--brass-muted)]">
                  {isLocalhost ? '本机 localhost' : '管理员已验证'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                审核读者提交的纠错记录，管理作品封面与已生效覆盖
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!isLocalhost && adminToken && onLogout && (
              <button
                type="button"
                data-testid="admin-logout-btn"
                onClick={onLogout}
                className="px-2.5 py-1 text-xs text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                退出管理
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭管理后台"
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 pb-3 border-b border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              data-testid="admin-tab-pending"
              onClick={() => setTab('pending')}
              className={`px-3.5 py-1.5 text-xs border transition-colors cursor-pointer ${
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
              className={`px-3.5 py-1.5 text-xs border transition-colors cursor-pointer ${
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
              className={`px-3.5 py-1.5 text-xs border transition-colors cursor-pointer ${
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
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            刷新
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
                      <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] px-3.5 py-2 border border-[var(--brass-muted)]">
                        备注：{item.note}
                      </p>
                    )}

                    {/* Image Comparison (Click Any Thumbnail to Inspect Full Size) */}
                    {item.imageUrl && (
                      <div className="flex flex-wrap items-start gap-6">
                        {currentCoverUrl && item.type !== 'gamble-gallery' && (
                          <div>
                            <p className="text-[11px] text-[var(--text-muted)] mb-1.5">
                              当前图片（点击放大）
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                openImagePreview(currentCoverUrl, `${item.targetLabel} · 当前图片`)
                              }
                              aria-label={`放大查看 ${item.targetLabel} 当前图片`}
                              className="group relative block w-28 aspect-[128/182] overflow-hidden bg-[var(--bg-img)] ring-1 ring-[var(--img-ring)] hover:ring-[var(--brass)] transition-all cursor-zoom-in"
                            >
                              <img
                                src={getThumbImageUrl(currentCoverUrl)}
                                alt="当前图片"
                                className="w-full h-full object-cover block"
                              />
                              <span
                                aria-hidden="true"
                                className="absolute right-1.5 bottom-1.5 p-1 bg-black/70 text-[#F4F0E8] opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </span>
                            </button>
                          </div>
                        )}
                        <div>
                          <p className="text-[11px] text-[var(--brass)] mb-1.5">
                            {item.type === 'gamble-gallery' ? '新增原漫配图' : '投稿新图'}（点击放大）
                          </p>
                          <button
                            type="button"
                            data-testid={`inspect-submission-img-${item.id}`}
                            onClick={() =>
                              openImagePreview(
                                item.imageUrl!,
                                `${item.targetLabel} · ${
                                  item.type === 'gamble-gallery' ? '新增原漫配图' : '投稿新图'
                                }`
                              )
                            }
                            aria-label={`放大查看 ${item.targetLabel} 投稿新图`}
                            className="group relative block w-28 aspect-[128/182] overflow-hidden bg-[var(--bg-img)] ring-2 ring-[var(--brass)] cursor-zoom-in"
                          >
                            <img
                              src={item.imageUrl}
                              alt="投稿新图"
                              className="w-full h-full object-cover block"
                            />
                            <span
                              aria-hidden="true"
                              className="absolute right-1.5 bottom-1.5 p-1 bg-black/70 text-[#F4F0E8] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Copy Diff Comparison with Character-Level Highlighting */}
                    {item.copyPatch && effectiveGamble && (
                      <div className="space-y-3">
                        {(Object.keys(item.copyPatch) as (keyof GambleCopyPatch)[]).map((field) => {
                          const beforeStr = renderFieldValue(
                            effectiveGamble[field] as string | string[] | undefined
                          );
                          const afterStr = renderFieldValue(
                            item.copyPatch?.[field] as string | string[] | undefined
                          );
                          return (
                            <div
                              key={field}
                              className="bg-[var(--bg-card)] border border-[var(--border-hairline)] p-3.5 space-y-2.5 text-xs"
                            >
                              <p className="text-[var(--brass)] font-medium">
                                {COPY_FIELD_LABELS[field]}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10.5px] text-[var(--text-muted)] mb-1">
                                    修改前
                                  </p>
                                  <HighlightedDiffView
                                    beforeText={beforeStr}
                                    afterText={afterStr}
                                    side="before"
                                  />
                                </div>
                                <div className="md:border-l md:border-[var(--border-hairline)] md:pl-4">
                                  <p className="text-[10.5px] text-emerald-400 mb-1">修改后</p>
                                  <HighlightedDiffView
                                    beforeText={beforeStr}
                                    afterText={afterStr}
                                    side="after"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                      <button
                        type="button"
                        onClick={() => openImagePreview(effectiveCover, `《${series.title}》封面`)}
                        aria-label={`放大查看《${series.title}》封面`}
                        className="group relative w-[74px] aspect-[128/182] rounded-[4px] overflow-hidden bg-[var(--bg-img)] ring-1 ring-[var(--img-ring)] hover:ring-[var(--brass)] shrink-0 cursor-zoom-in transition-all"
                      >
                        <img
                          src={getThumbImageUrl(effectiveCover)}
                          alt={`《${series.title}》封面`}
                          className="w-full h-full object-cover block"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute right-1 bottom-1 p-0.5 bg-black/70 text-[#F4F0E8] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </span>
                      </button>
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
                            <button
                              type="button"
                              onClick={() => openImagePreview(entry.imageUrl!, entry.label)}
                              aria-label={`放大查看 ${entry.label}`}
                              className="w-7 h-10 overflow-hidden shrink-0 ring-1 ring-[var(--img-ring)] hover:ring-[var(--brass)] cursor-zoom-in"
                            >
                              <img
                                src={entry.imageUrl}
                                alt=""
                                className="w-full h-full object-cover block"
                              />
                            </button>
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

      {/* Full-Resolution Image Inspector Overlay inside Admin Drawer */}
      {previewImage && (
        <div
          data-testid="moderation-image-inspector"
          role="dialog"
          aria-modal="true"
          aria-label={`原图预览：${previewImage.label}`}
          className="modal-backdrop-enter fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewImage(null);
              setPreviewDimensions(null);
            }
          }}
        >
          <div className="w-full max-w-4xl flex items-center justify-between gap-4 mb-3 text-xs text-[#E8E4DC]">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-medium truncate">{previewImage.label}</span>
              {previewDimensions && (
                <span className="tabular-nums text-[#C8A66E] shrink-0">
                  {previewDimensions.width} × {previewDimensions.height} px
                </span>
              )}
            </div>
            <button
              type="button"
              data-testid="close-image-inspector-btn"
              onClick={() => {
                setPreviewImage(null);
                setPreviewDimensions(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 border border-white/25 hover:border-white text-[#F4F0E8] cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>关闭预览</span>
            </button>
          </div>
          <div className="max-h-[82vh] max-w-[92vw] overflow-auto border border-white/15 bg-[#09090C] p-1">
            <img
              src={previewImage.src}
              alt={previewImage.label}
              referrerPolicy="no-referrer"
              onLoad={(e) => {
                const img = e.currentTarget;
                setPreviewDimensions({
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                });
              }}
              className="max-h-[80vh] w-auto object-contain block"
            />
          </div>
        </div>
      )}
    </div>
  );
}
