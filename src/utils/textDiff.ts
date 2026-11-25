export type DiffSegmentType = 'equal' | 'removed' | 'added';

export interface DiffSegment {
  type: DiffSegmentType;
  text: string;
}

const MAX_DP_CELLS = 180_000;

function pushMerged(segments: DiffSegment[], type: DiffSegmentType, text: string): void {
  if (!text) return;
  const last = segments[segments.length - 1];
  if (last && last.type === type) {
    last.text += text;
  } else {
    segments.push({ type, text });
  }
}

/**
 * Computes a character-level diff between two strings (UTF-16 surrogate safe via Array.from).
 * Strips shared prefix/suffix first so typical single-character or clause edits run in microseconds,
 * and falls back gracefully to line-level diff if two completely rewritten long texts exceed DP budget.
 */
export function computeTextDiff(before: string, after: string): DiffSegment[] {
  if (before === after) {
    return before ? [{ type: 'equal', text: before }] : [];
  }
  if (!before) {
    return [{ type: 'added', text: after }];
  }
  if (!after) {
    return [{ type: 'removed', text: before }];
  }

  const a = Array.from(before);
  const b = Array.from(after);

  let prefixLen = 0;
  const minLen = Math.min(a.length, b.length);
  while (prefixLen < minLen && a[prefixLen] === b[prefixLen]) {
    prefixLen += 1;
  }

  let suffixLen = 0;
  while (
    suffixLen < minLen - prefixLen &&
    a[a.length - 1 - suffixLen] === b[b.length - 1 - suffixLen]
  ) {
    suffixLen += 1;
  }

  const prefixText = a.slice(0, prefixLen).join('');
  const suffixText = suffixLen > 0 ? a.slice(a.length - suffixLen).join('') : '';
  const midA = a.slice(prefixLen, a.length - suffixLen);
  const midB = b.slice(prefixLen, b.length - suffixLen);

  const result: DiffSegment[] = [];
  if (prefixText) pushMerged(result, 'equal', prefixText);

  if (midA.length === 0) {
    pushMerged(result, 'added', midB.join(''));
  } else if (midB.length === 0) {
    pushMerged(result, 'removed', midA.join(''));
  } else if (midA.length * midB.length <= MAX_DP_CELLS) {
    const m = midA.length;
    const n = midB.length;
    const stride = n + 1;
    const dp = new Uint32Array((m + 1) * stride);

    for (let i = m - 1; i >= 0; i -= 1) {
      const rowOffset = i * stride;
      const nextRowOffset = (i + 1) * stride;
      for (let j = n - 1; j >= 0; j -= 1) {
        if (midA[i] === midB[j]) {
          dp[rowOffset + j] = dp[nextRowOffset + j + 1] + 1;
        } else {
          const down = dp[nextRowOffset + j];
          const right = dp[rowOffset + j + 1];
          dp[rowOffset + j] = down >= right ? down : right;
        }
      }
    }

    let i = 0;
    let j = 0;
    while (i < m && j < n) {
      if (midA[i] === midB[j]) {
        pushMerged(result, 'equal', midA[i]);
        i += 1;
        j += 1;
      } else if (dp[(i + 1) * stride + j] >= dp[i * stride + j + 1]) {
        pushMerged(result, 'removed', midA[i]);
        i += 1;
      } else {
        pushMerged(result, 'added', midB[j]);
        j += 1;
      }
    }
    while (i < m) {
      pushMerged(result, 'removed', midA[i]);
      i += 1;
    }
    while (j < n) {
      pushMerged(result, 'added', midB[j]);
      j += 1;
    }
  } else {
    // Fallback for huge completely divergent strings
    pushMerged(result, 'removed', midA.join(''));
    pushMerged(result, 'added', midB.join(''));
  }

  if (suffixText) pushMerged(result, 'equal', suffixText);
  return result;
}
