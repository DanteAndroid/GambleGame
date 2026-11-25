import type { GambleRecord } from '../types/gamble';

export const MAX_RECENT_GAMBLES = 8;

interface MechanicTheme {
  id: string;
  weight: number;
  reason: string;
  keywords: readonly string[];
}

const MECHANIC_THEMES: readonly MechanicTheme[] = [
  {
    id: 'mahjong',
    weight: 30,
    reason: '同属麻将算牌对局',
    keywords: ['麻将', '牌山', '听牌', '役满', '和牌', '牌墙', '点棒', '雀'],
  },
  {
    id: 'rps-matrix',
    weight: 26,
    reason: '同为相克克制博弈',
    keywords: ['猜拳', '剪刀', '石头', '皇帝', '奴隶', '相克', '克制', '三方克制'],
  },
  {
    id: 'voting-majority',
    weight: 26,
    reason: '同样考验投票与人群心理',
    keywords: ['少数', '多数', '投票', '票数', '选美', '均值', '民主', '选举', '淘汰票'],
  },
  {
    id: 'auction-chips',
    weight: 22,
    reason: '同属筹码加注与竞拍',
    keywords: ['拍卖', '竞拍', '盲拍', '筹码', '加注', '跟注', '弃牌', '押注', '底池', '叫价', '金币', '硬币'],
  },
  {
    id: 'social-betrayal',
    weight: 22,
    reason: '都有结盟与背叛心理战',
    keywords: ['背叛', '结盟', '内鬼', '卧底', '阵营', '同伴', '信任', '红心', '狼', '债务', '团体'],
  },
  {
    id: 'poker-cards',
    weight: 20,
    reason: '同属纸牌与牌型博弈',
    keywords: ['扑克', '纸牌', '手牌', '抽鬼', '牌型', '底牌', '庄家', '同花', '顺子', '黑杰克', '21点', '鬼牌', '卡牌'],
  },
  {
    id: 'escape-timer',
    weight: 18,
    reason: '同为密室与限时生死局',
    keywords: ['密室', '倒计时', '限时', '氧气', '毒气', '迷宫', '逃脱', '轮盘', '左轮', '子弹', '炸弹', '陷阱'],
  },
  {
    id: 'hidden-deception',
    weight: 16,
    reason: '同样围绕暗牌与读心骗局',
    keywords: ['暗牌', '谎言', '真伪', '心眼', '读心', '出老千', '作弊', '隐藏', '盲猜', '透视', '心理战'],
  },
  {
    id: 'math-loophole',
    weight: 15,
    reason: '同靠数学推演与规则盲区',
    keywords: ['概率', '数学', '漏洞', '必胜', '公式', '均衡', '坐标', '数字', '倍数', '推理'],
  },
  {
    id: 'sequence-timing',
    weight: 14,
    reason: '同样聚焦先手节奏与时机',
    keywords: ['先后手', '先手', '后手', '顺序', '回合', '时钟', '时间差', '步数', '距离'],
  },
];

const CATEGORY_REASON: Record<GambleRecord['category'], string> = {
  生存逃脱: '同属生存逃脱题材',
  心理博弈: '同属纯心理博弈',
  扑克纸牌: '同属扑克纸牌对决',
  群体策略: '同属多人策略博弈',
  极限机关: '同属极限机关规则',
};

export interface CrossSeriesRecommendation {
  gamble: GambleRecord;
  reason: string;
  score: number;
}

function buildSignalHaystack(record: GambleRecord): string {
  return [
    record.title,
    record.oneLineRule,
    record.winCondition,
    record.arcName,
    ...record.basicRules,
    ...record.ruleAnalysis,
  ]
    .join(' ')
    .toLowerCase();
}

function extractThemeHits(record: GambleRecord): Map<string, number> {
  const haystack = buildSignalHaystack(record);
  const hits = new Map<string, number>();

  for (const theme of MECHANIC_THEMES) {
    let matchedCount = 0;
    for (const kw of theme.keywords) {
      if (haystack.includes(kw)) {
        matchedCount += 1;
      }
    }
    if (matchedCount > 0) {
      hits.set(theme.id, matchedCount);
    }
  }

  return hits;
}

function stableTiebreaker(seedA: string, seedB: string): number {
  const combined = `${seedA}:${seedB}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i += 1) {
    hash = (hash * 31 + combined.charCodeAt(i)) % 1009;
  }
  return hash / 1009;
}

/**
 * Compute ranked cross-series gamble recommendations for the given gamble.
 * Always excludes the current gamble's own series so recommendations bridge
 * different manga works, and enforces series diversity per page slice.
 */
export function getCrossSeriesRecommendations(
  current: GambleRecord,
  records: readonly GambleRecord[],
  options?: { limit?: number; offset?: number }
): CrossSeriesRecommendation[] {
  const limit = options?.limit ?? 4;
  const offset = Math.max(0, options?.offset ?? 0);
  if (limit <= 0) return [];

  const currentHits = extractThemeHits(current);

  const scored: CrossSeriesRecommendation[] = [];

  for (const candidate of records) {
    if (candidate.id === current.id || candidate.seriesId === current.seriesId) {
      continue;
    }

    const candidateHits = extractThemeHits(candidate);
    let score = 0;
    let bestTheme: { weight: number; reason: string } | null = null;

    for (const theme of MECHANIC_THEMES) {
      const a = currentHits.get(theme.id) ?? 0;
      const b = candidateHits.get(theme.id) ?? 0;
      if (a > 0 && b > 0) {
        const contribution = theme.weight + Math.min(a, b) * 3;
        score += contribution;
        if (!bestTheme || contribution > bestTheme.weight) {
          bestTheme = { weight: contribution, reason: theme.reason };
        }
      }
    }

    if (candidate.category === current.category) {
      score += 14;
    }
    if (candidate.motif === current.motif) {
      score += 12;
    }

    const reason = bestTheme
      ? bestTheme.reason
      : candidate.category === current.category
        ? CATEGORY_REASON[candidate.category]
        : '跨作品延伸对局';

    score += stableTiebreaker(current.id, candidate.id);

    scored.push({
      gamble: candidate,
      reason,
      score,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  // Build series-diverse ranked rounds so batch 0, batch 1, batch 2... each span distinct manga works
  const diversified: CrossSeriesRecommendation[] = [];
  const remaining = [...scored];

  while (remaining.length > 0 && diversified.length < offset + limit + limit) {
    const usedSeriesInRound = new Set<string>();
    const nextRemaining: CrossSeriesRecommendation[] = [];

    for (const item of remaining) {
      if (!usedSeriesInRound.has(item.gamble.seriesId)) {
        usedSeriesInRound.add(item.gamble.seriesId);
        diversified.push(item);
      } else {
        nextRemaining.push(item);
      }
    }

    remaining.length = 0;
    remaining.push(...nextRemaining);
  }

  if (diversified.length === 0) return [];
  const normalizedOffset = offset % diversified.length;
  const result: CrossSeriesRecommendation[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < diversified.length && result.length < limit; i += 1) {
    const pick = diversified[(normalizedOffset + i) % diversified.length];
    if (!seenIds.has(pick.gamble.id)) {
      seenIds.add(pick.gamble.id);
      result.push(pick);
    }
  }

  return result;
}

/**
 * Pick a random gamble ID from `records`, avoiding `excludeId` whenever possible.
 */
export function pickRandomGambleId(
  records: readonly Pick<GambleRecord, 'id'>[],
  excludeId?: string | null,
  randomFn: () => number = Math.random
): string | null {
  if (records.length === 0) return null;
  const pool =
    excludeId && records.length > 1
      ? records.filter((item) => item.id !== excludeId)
      : records;
  const raw = randomFn();
  const clamped = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 0.9999999) : 0;
  const index = Math.floor(clamped * pool.length);
  return pool[index]?.id ?? null;
}

/**
 * Prepend a visited gamble ID to the recent list, deduplicating and capping length.
 */
export function pushRecentGambleId(
  recentIds: readonly string[],
  gambleId: string,
  maxItems: number = MAX_RECENT_GAMBLES
): string[] {
  const cleaned = gambleId.trim();
  if (!cleaned || maxItems <= 0) return [...recentIds];
  return [cleaned, ...recentIds.filter((id) => id !== cleaned)].slice(0, maxItems);
}

/**
 * Resolve stored recent IDs into valid GambleRecord items while preserving recency order.
 */
export function resolveRecentGambles(
  recentIds: readonly string[],
  records: readonly GambleRecord[]
): GambleRecord[] {
  if (recentIds.length === 0 || records.length === 0) return [];
  const byId = new Map(records.map((item) => [item.id, item]));
  const resolved: GambleRecord[] = [];
  const seen = new Set<string>();

  for (const id of recentIds) {
    if (seen.has(id)) continue;
    const found = byId.get(id);
    if (found) {
      seen.add(id);
      resolved.push(found);
    }
  }

  return resolved;
}
