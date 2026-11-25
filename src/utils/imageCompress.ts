export interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface CompressedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  originalBytes: number;
  outputBytes: number;
  format: 'webp' | 'jpeg' | 'original';
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

/**
 * Pure aspect-ratio-preserving bounding-box calculation.
 * Never upscales images that are already within bounds.
 */
export function calculateResizedDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= 0 || height <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    return { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
  }

  const ratio = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export function estimateDataUrlBytes(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return 0;
  const base64 = dataUrl.slice(commaIdx + 1).replace(/\s+/g, '');
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('读取图片失败，请重试'));
      }
    };
    reader.onerror = () => reject(new Error('读取图片失败，请重试'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('无法解析该图片文件'));
    img.src = src;
  });
}

/**
 * Validates an uploaded image file and automatically compresses & converts
 * static PNG/JPG/WebP images into sharp, compact WebP inside the browser before upload.
 * Animated GIFs are preserved as-is.
 */
export async function compressImageFileToWebP(
  file: File,
  options: ImageCompressOptions = {}
): Promise<CompressedImageResult> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error('仅支持 PNG、JPG、WebP 或 GIF 格式图片');
  }
  if (file.size > MAX_UPLOAD_BYTES * 3) {
    throw new Error('原图体积过大（超过 15 MB），请先适当裁剪后再上传');
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const originalBytes = file.size;

  // Keep GIF untouched so animation frames are not lost
  if (file.type === 'image/gif') {
    if (originalBytes > MAX_UPLOAD_BYTES) {
      throw new Error('GIF 图片大小不能超过 5 MB');
    }
    const img = await loadImageElement(originalDataUrl);
    return {
      dataUrl: originalDataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
      originalBytes,
      outputBytes: originalBytes,
      format: 'original',
    };
  }

  const img = await loadImageElement(originalDataUrl);
  const maxWidth = options.maxWidth ?? 1200;
  const maxHeight = options.maxHeight ?? 1800;
  const quality = options.quality ?? 0.86;

  const target = calculateResizedDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxWidth,
    maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = target.width;
  canvas.height = target.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (originalBytes > MAX_UPLOAD_BYTES) {
      throw new Error('图片大小不能超过 5 MB');
    }
    return {
      dataUrl: originalDataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
      originalBytes,
      outputBytes: originalBytes,
      format: 'original',
    };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, target.width, target.height);

  let encoded = canvas.toDataURL('image/webp', quality);
  let format: 'webp' | 'jpeg' | 'original' = 'webp';

  // Fallback to JPEG if browser cannot encode WebP
  if (!encoded.startsWith('data:image/webp')) {
    encoded = canvas.toDataURL('image/jpeg', quality);
    format = 'jpeg';
  }

  let outputBytes = estimateDataUrlBytes(encoded);

  // If image wasn't resized and original is already smaller & within limit, keep original
  const wasResized =
    target.width !== img.naturalWidth || target.height !== img.naturalHeight;
  if (!wasResized && originalBytes <= MAX_UPLOAD_BYTES && originalBytes <= outputBytes) {
    return {
      dataUrl: originalDataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
      originalBytes,
      outputBytes: originalBytes,
      format: 'original',
    };
  }

  // If still above 5 MB after first pass, step quality down cleanly
  if (outputBytes > MAX_UPLOAD_BYTES) {
    const mime = format === 'webp' ? 'image/webp' : 'image/jpeg';
    encoded = canvas.toDataURL(mime, 0.72);
    outputBytes = estimateDataUrlBytes(encoded);
  }

  if (outputBytes > MAX_UPLOAD_BYTES) {
    throw new Error('压缩后图片仍超过 5 MB，请缩小分辨率后再试');
  }

  return {
    dataUrl: encoded,
    width: target.width,
    height: target.height,
    originalBytes,
    outputBytes,
    format,
  };
}
