import { useEffect, useId, useState, type ChangeEvent } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Upload, X } from 'lucide-react';
import type { GambleRecord } from '../types/gamble';
import { compressImageFileToWebP, formatByteSize } from '../utils/imageCompress';
import { getDisplayImageUrl, getThumbImageUrl, hasLocalAsset } from '../utils/imageUrl';
import { MangaSilhouette } from './MangaSilhouette';

interface VerdictSpreadProps {
  gamble: GambleRecord;
  seriesTitle?: string;
  activeImageIndex?: number;
  onChangeImageIndex?: (index: number) => void;
  isEditing?: boolean;
  titleOverride?: string;
  draftArtworkUrl?: string | null;
  draftGalleryUrl?: string | null;
  draftSeriesCoverUrl?: string | null;
  onSelectDraftArtwork?: (dataUrl: string) => void;
  onSelectDraftGallery?: (dataUrl: string) => void;
  onSelectDraftSeriesCover?: (dataUrl: string) => void;
  onClearDraftArtwork?: () => void;
  onClearDraftGallery?: () => void;
  onClearDraftSeriesCover?: () => void;
}

export function VerdictSpread({
  gamble,
  seriesTitle,
  activeImageIndex = 0,
  onChangeImageIndex,
  isEditing = false,
  titleOverride,
  draftArtworkUrl = null,
  draftGalleryUrl = null,
  draftSeriesCoverUrl = null,
  onSelectDraftArtwork,
  onSelectDraftGallery,
  onSelectDraftSeriesCover,
  onClearDraftArtwork,
  onClearDraftGallery,
  onClearDraftSeriesCover,
}: VerdictSpreadProps) {
  const artworkInputId = useId();
  const galleryInputId = useId();
  const seriesCoverInputId = useId();
  const [imageFailed, setImageFailed] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadInfo, setUploadInfo] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const gallery =
    gamble.galleryUrls && gamble.galleryUrls.length > 0
      ? gamble.galleryUrls
      : [gamble.artworkUrl];
  const safeIndex = Math.min(Math.max(activeImageIndex, 0), gallery.length - 1);
  const baseArtUrl = gallery[safeIndex];
  const activeArtUrl = isEditing && draftArtworkUrl ? draftArtworkUrl : baseArtUrl;
  const displayTitle =
    isEditing && titleOverride && titleOverride.trim().length > 0
      ? titleOverride
      : gamble.title;

  useEffect(() => {
    setImageFailed(false);
  }, [gamble.id, activeArtUrl]);

  useEffect(() => {
    if (!isEditing) {
      setUploadError(null);
      setUploadInfo(null);
      setCompressing(false);
    }
  }, [isEditing]);

  const handleStep = (delta: number) => {
    if (!onChangeImageIndex || gallery.length <= 1) return;
    const next = (safeIndex + delta + gallery.length) % gallery.length;
    onChangeImageIndex(next);
  };

  const handleFileRead = async (
    e: ChangeEvent<HTMLInputElement>,
    onLoaded?: (dataUrl: string) => void
  ) => {
    setUploadError(null);
    setUploadInfo(null);
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !onLoaded) return;

    setCompressing(true);
    try {
      const result = await compressImageFileToWebP(file);
      onLoaded(result.dataUrl);
      const savedPct =
        result.originalBytes > result.outputBytes
          ? Math.round((1 - result.outputBytes / result.originalBytes) * 100)
          : 0;
      const fmtLabel =
        result.format === 'webp' ? 'WebP' : result.format === 'jpeg' ? 'JPG' : '原格式';
      setUploadInfo(
        `已优化为 ${fmtLabel}（${result.width}×${result.height} · ${formatByteSize(result.outputBytes)}${
          savedPct >= 5 ? `，体积减小 ${savedPct}%` : ''
        }）`
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '读取图片失败，请重试');
    } finally {
      setCompressing(false);
    }
  };

  return (
    <figure className="flex flex-col">
      {/* Top Bar: Clean Brass Archival Index Only (Aligned with Right Column Provenance Bar) */}
      <div className="flex items-center justify-between gap-4 pb-3.5 mb-5 border-b border-[var(--border-subtle)]">
        <span className="tabular-nums text-[11px] font-medium tracking-[0.16em] text-[var(--brass)]">
          {gamble.archiveCode}
        </span>

        {isEditing && (
          <span className="text-[11px] tracking-[0.08em] text-[var(--accent)] font-medium">
            纠错编辑中
          </span>
        )}
      </div>

      {/* Full-Bleed B6 Exhibition Print Plate (No Corner Brackets or Double Frame) */}
      <div
        data-testid="verdict-spread-plate"
        className="relative w-full aspect-[128/182] rounded-md overflow-hidden bg-[var(--bg-img)] ring-1 ring-[var(--img-ring)] cover-plate-shadow"
      >
        {!imageFailed && hasLocalAsset(activeArtUrl) ? (
          <img
            src={getDisplayImageUrl(activeArtUrl)}
            alt={displayTitle}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className={`w-full h-full object-cover block ${
              gamble.cardImagePosition ?? 'object-center'
            }`}
          />
        ) : (
          <div
            className="w-full h-full bg-[#09090B] flex items-center justify-center p-8"
            aria-hidden="true"
          >
            <MangaSilhouette motif={gamble.motif} className="w-60 h-auto" />
          </div>
        )}

        {isEditing && draftArtworkUrl && (
          <span className="absolute top-3 left-3 px-2 py-1 text-[11px] font-medium bg-black/82 text-[#F4F0E8] border border-[var(--brass)]/70">
            新主图预览（待审）
          </span>
        )}

        {/* Bottom Dark Gradient Mask + Oversized Display Gamble Title (平方赖江湖琅琊体) */}
        <div
          data-testid="detail-cover-title-overlay"
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/68 to-transparent pt-20 sm:pt-28 pb-4 sm:pb-6 px-4 sm:px-5"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
            <span className="w-4 sm:w-5 h-[2px] bg-[var(--accent)] shrink-0" />
            <p
              lang="ja"
              translate="no"
              className="font-mincho text-[11px] sm:text-[12px] tracking-[0.08em] text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] truncate"
            >
              {gamble.japaneseTitle}
            </p>
          </div>
          <h1 className="font-display font-normal text-[28px] min-[400px]:text-[32px] md:text-[34px] xl:text-[40px] leading-[1.12] tracking-[0.04em] text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
            {displayTitle}
          </h1>
        </div>
      </div>

      {/* Inline Artwork Upload Controls (Visible ONLY in 纠错 Edit Mode) */}
      {isEditing && (
        <div
          data-testid="detail-edit-image-controls"
          className="mt-4 p-4 bg-[var(--bg-card)] border border-[var(--brass-muted)] space-y-3"
        >
          <p className="text-[11.5px] font-medium tracking-[0.06em] text-[var(--brass)]">
            图片纠错（可选 · 审核通过后生效）
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={artworkInputId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--bg-inset)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{draftArtworkUrl ? '重新选择主图' : '替换本局主图'}</span>
            </label>
            <input
              id={artworkInputId}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => handleFileRead(e, onSelectDraftArtwork)}
              className="sr-only"
            />

            {draftArtworkUrl && onClearDraftArtwork && (
              <button
                type="button"
                onClick={onClearDraftArtwork}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] cursor-pointer"
              >
                <X className="w-3 h-3" aria-hidden="true" />
                <span>还原主图</span>
              </button>
            )}

            <label
              htmlFor={galleryInputId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--bg-inset)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{draftGalleryUrl ? '更换待追加配图' : '追加原漫配图'}</span>
            </label>
            <input
              id={galleryInputId}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => handleFileRead(e, onSelectDraftGallery)}
              className="sr-only"
            />

            {onSelectDraftSeriesCover && (
              <>
                <label
                  htmlFor={seriesCoverInputId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--bg-inset)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {draftSeriesCoverUrl
                      ? '重选作品封面'
                      : `更换${seriesTitle ? `《${seriesTitle}》` : '作品'}封面`}
                  </span>
                </label>
                <input
                  id={seriesCoverInputId}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => handleFileRead(e, onSelectDraftSeriesCover)}
                  className="sr-only"
                />
              </>
            )}
          </div>

          {draftGalleryUrl && (
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-hairline)]">
              <img
                src={draftGalleryUrl}
                alt="待追加原漫配图预览"
                className="w-12 aspect-[128/182] object-cover border border-[var(--brass)]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-primary)]">已选择 1 张追加原漫配图</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  将随本次纠错一并提交至后台待审
                </p>
              </div>
              {onClearDraftGallery && (
                <button
                  type="button"
                  onClick={onClearDraftGallery}
                  aria-label="移除待追加配图"
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {draftSeriesCoverUrl && (
            <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-hairline)]">
              <img
                src={draftSeriesCoverUrl}
                alt="待更换作品封面预览"
                className="w-12 aspect-[128/182] object-cover border border-[var(--brass)] rounded-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-primary)]">
                  已选择新的{seriesTitle ? `《${seriesTitle}》` : '作品'}封面
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  将随本次纠错一并提交至后台待审
                </p>
              </div>
              {onClearDraftSeriesCover && (
                <button
                  type="button"
                  onClick={onClearDraftSeriesCover}
                  aria-label="移除待更换作品封面"
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {compressing && (
            <p className="text-[11.5px] text-[var(--text-muted)]">正在压缩并转为 WebP…</p>
          )}

          {uploadInfo && !compressing && (
            <p className="text-[11.5px] text-[var(--brass)]" role="status">
              {uploadInfo}
            </p>
          )}

          {uploadError && (
            <p className="text-xs text-[var(--accent)]" role="alert">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Archival Contact Sheet Strip When Multiple Related Manga Pages Are Archived */}
      {gallery.length > 1 && onChangeImageIndex && (
        <div
          aria-label="本局收录的原漫相关画面"
          className="mt-5 pt-4 border-t border-[var(--border-subtle)]"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] tabular-nums text-[var(--text-muted)]">
              原漫画面{' '}
              <span className="text-[var(--brass)]">
                {String(safeIndex + 1).padStart(2, '0')}
              </span>{' '}
              / {String(gallery.length).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStep(-1)}
                aria-label="切换上一张原漫画面"
                className="p-1.5 bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleStep(1)}
                aria-label="切换下一张原漫画面"
                className="p-1.5 bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {gallery.map((imgUrl, idx) => {
              const active = idx === safeIndex;
              return (
                <button
                  key={imgUrl}
                  type="button"
                  onClick={() => onChangeImageIndex(idx)}
                  aria-label={`查看第 ${idx + 1} 张原漫画面`}
                  aria-pressed={active}
                  className={`w-12 aspect-[128/182] shrink-0 overflow-hidden bg-[var(--bg-img)] border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] ${
                    active
                      ? 'border-[var(--accent)] ring-1 ring-[var(--accent)] opacity-100'
                      : 'border-[var(--border-subtle)] opacity-55 hover:opacity-100 hover:border-[var(--border-strong)]'
                  }`}
                >
                  <img
                    src={getThumbImageUrl(imgUrl)}
                    alt={`${gamble.title} 原漫画面 ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top block"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </figure>
  );
}
