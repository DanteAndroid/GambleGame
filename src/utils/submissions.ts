import type {
  GambleRecord,
  MangaSeriesId,
  MangaSeriesInfo,
  UpcomingMangaSeries,
} from '../types/gamble';

export type SubmissionType =
  | 'series-cover'
  | 'gamble-artwork'
  | 'gamble-gallery'
  | 'gamble-copy';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface GambleCopyPatch {
  title?: string;
  summary?: string;
  oneLineRule?: string;
  winCondition?: string;
  basicRules?: string[];
  extraInfo?: string[];
  ruleAnalysis?: string[];
  spoilsBreakdown?: string[];
  ending?: string;
}

export interface ContentSubmission {
  id: string;
  type: SubmissionType;
  targetId: string;
  targetLabel: string;
  submittedBy: string;
  note: string;
  createdAt: string;
  status: SubmissionStatus;
  reviewedAt?: string;
  reviewNote?: string;
  /** Server-stored safe image path (/api/uploads/<uuid>.<ext>) for image submissions */
  imageUrl?: string;
  /** Copy patch for gamble-copy submissions */
  copyPatch?: GambleCopyPatch;
}

export interface ApprovedOverrides {
  seriesCovers: Record<string, string>;
  gambleArtworks: Record<string, string>;
  gambleGalleries: Record<string, string[]>;
  gambleCopies: Record<string, GambleCopyPatch>;
}

export type AdminAuthMode = 'env' | 'claimed' | 'unclaimed';

export interface ModerationStatusResponse {
  canModerate: boolean;
  isLocalhost?: boolean;
  authMode?: AdminAuthMode;
  pendingCount: number;
}

export const EMPTY_OVERRIDES: ApprovedOverrides = {
  seriesCovers: {},
  gambleArtworks: {},
  gambleGalleries: {},
  gambleCopies: {},
};

const EDITABLE_STRING_FIELDS: readonly (keyof GambleCopyPatch)[] = [
  'title',
  'summary',
  'oneLineRule',
  'winCondition',
  'ending',
];

const EDITABLE_ARRAY_FIELDS: readonly (keyof GambleCopyPatch)[] = [
  'basicRules',
  'extraInfo',
  'ruleAnalysis',
  'spoilsBreakdown',
];

export const COPY_FIELD_LABELS: Record<keyof GambleCopyPatch, string> = {
  title: '赌局标题',
  summary: '赌局简介',
  oneLineRule: '一句话规则',
  winCondition: '胜负判定',
  basicRules: '流程',
  extraInfo: '额外信息',
  ruleAnalysis: '规则解析',
  spoilsBreakdown: '战利品清单',
  ending: '结局',
};

/**
 * Validates and sanitizes an incoming gamble copy patch.
 * Only whitelisted string and string-array fields are kept, with strict length bounds.
 */
export function sanitizeCopyPatch(raw: unknown): GambleCopyPatch | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const input = raw as Record<string, unknown>;
  const patch: GambleCopyPatch = {};
  let fieldCount = 0;

  for (const field of EDITABLE_STRING_FIELDS) {
    if (field in input && input[field] !== undefined) {
      if (typeof input[field] !== 'string') return null;
      const trimmed = input[field].trim();
      if (!trimmed || trimmed.length > 1200) return null;
      if (field === 'title' && trimmed.length > 80) return null;
      (patch as Record<string, unknown>)[field] = trimmed;
      fieldCount += 1;
    }
  }

  for (const field of EDITABLE_ARRAY_FIELDS) {
    if (field in input && input[field] !== undefined) {
      if (!Array.isArray(input[field])) return null;
      const cleaned = input[field]
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && item.length <= 600);
      if (cleaned.length === 0 || cleaned.length > 20) return null;
      (patch as Record<string, unknown>)[field] = cleaned;
      fieldCount += 1;
    }
  }

  return fieldCount > 0 ? patch : null;
}

/**
 * Ensures stored image URLs only point to safe local asset or server upload routes.
 */
export function isSafeLocalImagePath(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  return (
    /^\/api\/uploads\/[0-9a-f-]{36}\.(png|jpg|webp|gif)$/.test(url) ||
    /^\/assets\/[A-Za-z0-9/_-]+\.(png|jpg|jpeg|webp|gif)$/.test(url)
  );
}

/**
 * Detects raster image format from raw magic bytes (blocks SVG/HTML/scripts).
 */
export function detectImageFormat(
  bytes: Uint8Array
): { ext: 'png' | 'jpg' | 'webp' | 'gif'; mime: string } | null {
  if (bytes.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: 'png', mime: 'image/png' };
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }

  // GIF: GIF87a or GIF89a
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return { ext: 'gif', mime: 'image/gif' };
  }

  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }

  return null;
}

export interface LocalhostCheckInput {
  remoteAddress?: string | null;
  host?: string | null;
  forwardedFor?: string | string[] | null;
  forwarded?: string | string[] | null;
  realIp?: string | string[] | null;
  cfConnectingIp?: string | string[] | null;
  origin?: string | null;
  method?: string;
}

function isLoopbackHostName(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return lower === 'localhost' || lower === '127.0.0.1' || lower === '[::1]' || lower === '::1';
}

function extractHostWithoutPort(hostHeader: string): string {
  const trimmed = hostHeader.trim();
  if (trimmed.startsWith('[')) {
    const closeIdx = trimmed.indexOf(']');
    return closeIdx !== -1 ? trimmed.slice(0, closeIdx + 1) : trimmed;
  }
  const colonIdx = trimmed.indexOf(':');
  return colonIdx !== -1 ? trimmed.slice(0, colonIdx) : trimmed;
}

/**
 * Strictly verifies that an HTTP request originated directly from localhost.
 * - Requires TCP socket remoteAddress to be loopback (127.0.0.1 / ::1 / ::ffff:127.0.0.1).
 * - Rejects proxied/forwarded requests (x-forwarded-for, forwarded, x-real-ip, cf-connecting-ip).
 * - Rejects non-localhost Host headers (prevents reverse proxy & DNS rebinding bypass).
 * - On mutating methods, verifies Origin (if present) is also a localhost origin (CSRF protection).
 */
export function isStrictLocalhostRequest(input: LocalhostCheckInput): boolean {
  const remote = (input.remoteAddress ?? '').trim();
  const isLoopbackSocket =
    remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
  if (!isLoopbackSocket) {
    return false;
  }

  // Any reverse-proxy header indicates the request came through an external proxy
  const hasProxyHeader = (val?: string | string[] | null): boolean => {
    if (!val) return false;
    if (Array.isArray(val)) return val.some((v) => v.trim().length > 0);
    return val.trim().length > 0;
  };

  if (
    hasProxyHeader(input.forwardedFor) ||
    hasProxyHeader(input.forwarded) ||
    hasProxyHeader(input.realIp) ||
    hasProxyHeader(input.cfConnectingIp)
  ) {
    return false;
  }

  const hostHeader = (input.host ?? '').trim();
  if (!hostHeader) {
    return false;
  }
  const hostName = extractHostWithoutPort(hostHeader);
  if (!isLoopbackHostName(hostName)) {
    return false;
  }

  const method = (input.method ?? 'GET').toUpperCase();
  if (input.origin && method !== 'GET' && method !== 'HEAD') {
    try {
      const parsed = new URL(input.origin);
      if (
        (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
        !isLoopbackHostName(parsed.hostname)
      ) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Merges approved overrides onto canonical gamble records without mutating base data.
 */
export function applyOverridesToGambles(
  baseGambles: readonly GambleRecord[],
  overrides: ApprovedOverrides
): GambleRecord[] {
  return baseGambles.map((gamble) => {
    const artworkOverride = overrides.gambleArtworks[gamble.id];
    const extraGallery = overrides.gambleGalleries[gamble.id] ?? [];
    const copyPatch = overrides.gambleCopies[gamble.id];

    const hasArtwork = isSafeLocalImagePath(artworkOverride);
    const safeExtraGallery = extraGallery.filter(isSafeLocalImagePath);

    if (!hasArtwork && safeExtraGallery.length === 0 && !copyPatch) {
      return gamble;
    }

    const baseGallery =
      gamble.galleryUrls && gamble.galleryUrls.length > 0
        ? gamble.galleryUrls
        : [gamble.artworkUrl];

    const nextArtwork = hasArtwork ? artworkOverride : gamble.artworkUrl;
    const mergedGallery: string[] = [];
    const pushUnique = (url: string) => {
      if (!mergedGallery.includes(url)) mergedGallery.push(url);
    };

    if (hasArtwork) {
      pushUnique(artworkOverride);
    }
    for (const url of baseGallery) {
      pushUnique(url);
    }
    for (const url of safeExtraGallery) {
      pushUnique(url);
    }

    return {
      ...gamble,
      ...(copyPatch ?? {}),
      artworkUrl: nextArtwork,
      galleryUrls: mergedGallery,
    };
  });
}

/**
 * Merges approved series cover overrides onto live & upcoming series metadata.
 */
export function applyOverridesToSeries(
  baseLive: readonly MangaSeriesInfo[],
  baseUpcoming: readonly UpcomingMangaSeries[],
  overrides: ApprovedOverrides
): {
  liveSeries: MangaSeriesInfo[];
  upcomingSeries: UpcomingMangaSeries[];
  liveLookup: Record<MangaSeriesId, MangaSeriesInfo>;
} {
  const liveSeries = baseLive.map((s) => {
    const customCover = overrides.seriesCovers[s.id];
    return isSafeLocalImagePath(customCover) ? { ...s, coverUrl: customCover } : s;
  });

  const upcomingSeries = baseUpcoming.map((u) => {
    const customCover = overrides.seriesCovers[u.id];
    return isSafeLocalImagePath(customCover) ? { ...u, coverUrl: customCover } : u;
  });

  const liveLookup = Object.fromEntries(
    liveSeries.map((s) => [s.id, s])
  ) as Record<MangaSeriesId, MangaSeriesInfo>;

  return { liveSeries, upcomingSeries, liveLookup };
}
