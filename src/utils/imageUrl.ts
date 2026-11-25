import { OPTIMIZED_ASSET_PATHS } from '../data/optimizedImages';

/**
 * Returns true if the asset can be loaded cleanly (either a dynamic/external URL
 * or a verified local static asset under /assets/).
 */
export function hasLocalAsset(url: string): boolean {
  if (!url) return false;
  if (!url.startsWith('/assets/')) return true;
  return OPTIMIZED_ASSET_PATHS.has(url);
}

/**
 * Map a local /assets/... path to its lightweight 440px WebP thumbnail.
 */
export function getThumbImageUrl(url: string): string {
  if (!OPTIMIZED_ASSET_PATHS.has(url)) return url;
  const rel = url.slice('/assets/'.length).replace(/\.[^.]+$/, '');
  return `/assets/opt/thumb/${rel}.webp`;
}

/**
 * Map a local /assets/... path to its crisp 1080px WebP detail display variant.
 */
export function getDisplayImageUrl(url: string): string {
  if (!OPTIMIZED_ASSET_PATHS.has(url)) return url;
  const rel = url.slice('/assets/'.length).replace(/\.[^.]+$/, '');
  return `/assets/opt/display/${rel}.webp`;
}
