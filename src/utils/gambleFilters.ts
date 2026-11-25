import type {
  GambleFilterState,
  GambleRecord,
  MangaSeriesId,
} from '../types/gamble';

const SERIES_SEARCH_ALIASES: Record<MangaSeriesId, string> = {
  usogui: '噬谎者 嘘喰い usogui 迫稔雄 赌郎 斑目貘',
  'liar-game': '欺诈游戏 liar game liargame 甲斐谷忍 lgt 秋山深一 神崎直',
  kaiji: '赌博默示录 賭博黙示録カイジ kaiji 福本伸行 帝爱 破戒录 堕天录 伊藤开司',
  akagi: '斗牌传说 アカギ akagi 赤木茂 福本伸行 鹫巢麻将 麻将',
  kakegurui: '狂赌之渊 賭ケグルイ kakegurui 蛇喰梦子 河本焰 尚村透 百花王学园',
  'tomodachi-game': '朋友游戏 トモダチゲーム tomodachi game 片切友一 山口尊 佐藤友生',
  'alice-in-borderland': '弥留之国的爱丽丝 今際の国のアリス alice in borderland 麻生羽吕 有栖良平 苣屋骏太郎',
  'gambling-emperor-zero': '赌博霸王传 零 賭博覇王伝 零 zero 宇海零 福本伸行 梦想王国',
  'one-outs': '超智游戏 one outs oneouts 渡久地东亚 甲斐谷忍 棒球 彩珠',
  'acma-game': '恶魔游戏 acma game acmagame アクマゲーム meeb 惠广史 织田照朝 上杉潜夜 恶魔之钥 冈格尼尔',
};

const GAMBLE_SEARCH_ALIASES: Record<string, string> = {
  'e-card': 'e卡 ecard 皇帝奴隶 皇帝与奴隶',
  'surpassing-the-leader': '屋形越 丢手绢 以下犯上 临死药',
  'kaiji-one-poker': 'one poker onepoker 单张扑克',
  'minotaur-labyrinth': '米诺陶诺斯迷宫 米诺陶洛斯迷宫 牛头怪迷宫',
  'bulls-womb': '斗牛子宫 公牛子宫 铜牛',
  'hand-chopper': '切手台 断手台 断腕台',
  'the-bog-pachinko': '人食沼泽 食人沼泽 沼泽 弹珠机',
  'kakegurui-finger-guillotine': '指断台 断指台',
  'kakegurui-nim-type-zero': '零式尼姆 尼姆零式',
  'kakegurui-auction': '百票盲拍 百票拍卖',
  'tomodachi-snow-cabin': '雪山木屋最终战 无友游戏',
  'alice-k-diamonds-beauty-contest': '方块k天秤 方块k天平 凯恩斯选美',
  'acma-judge-and-fire': '金枪银枪 金枪与银枪 金の銃 银の銃',
  'acma-five-spell-survival': '五字战斗 5spell 万中五选 5スペル',
  'acma-word-investigation': '三词究明 猜词 三个单词',
};

function normalizeText(raw: string): string {
  return raw
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[·・\-_《》「」『』（）()【】[\]、，。,.!?！？：:\/\\]+/g, '');
}

/**
 * Check if `token` appears in `target` as an ordered subsequence within a tight span.
 * Useful for abbreviated CJK/Latin queries like "17麻将" -> "17步地雷麻将", "空扑" -> "空气扑克".
 */
function subsequenceScore(token: string, target: string): number {
  if (token.length < 2 || token.length > target.length) return 0;
  let ti = 0;
  let firstIdx = -1;
  let lastIdx = -1;

  for (let i = 0; i < target.length && ti < token.length; i += 1) {
    if (target[i] === token[ti]) {
      if (firstIdx === -1) firstIdx = i;
      lastIdx = i;
      ti += 1;
    }
  }

  if (ti !== token.length) return 0;
  const span = lastIdx - firstIdx + 1;
  // Require reasonably tight span so distant characters do not produce false positives
  if (span > Math.max(token.length * 3, token.length + 5)) return 0;

  return Math.max(10, 42 - (span - token.length) * 4);
}

/**
 * Compute bounded Levenshtein edit distance between two short strings.
 */
function editDistance(a: string, b: string, maxDist: number): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > maxDist) return maxDist + 1;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j += 1) prev[j] = j;

  for (let i = 1; i <= m; i += 1) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > maxDist) return maxDist + 1;
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[n];
}

/**
 * Sliding-window typo-tolerant fuzzy match for a single token against a compact field.
 * Allows 1 typo for tokens of length 3-7, and up to 2 typos for length >= 8.
 */
function typoMatchScore(token: string, target: string): number {
  if (token.length < 3 || target.length < 2) return 0;
  const maxDist = token.length >= 8 ? 2 : 1;

  if (target.length <= token.length + maxDist) {
    const d = editDistance(token, target, maxDist);
    return d <= maxDist ? Math.max(8, 30 - d * 10) : 0;
  }

  const minWin = Math.max(2, token.length - maxDist);
  const maxWin = Math.min(target.length, token.length + maxDist);
  let bestDist = maxDist + 1;

  for (let start = 0; start <= target.length - minWin; start += 1) {
    for (let win = minWin; win <= maxWin && start + win <= target.length; win += 1) {
      const slice = target.slice(start, start + win);
      const d = editDistance(token, slice, bestDist - 1);
      if (d < bestDist) {
        bestDist = d;
        if (bestDist === 1) break;
      }
    }
    if (bestDist === 1) break;
  }

  return bestDist <= maxDist ? Math.max(8, 28 - bestDist * 10) : 0;
}

function scoreTokenAgainstRecord(
  token: string,
  item: GambleRecord,
  allowTypoFallback: boolean
): number {
  const compactToken = normalizeText(token);
  if (!compactToken) return 0;

  const primaryFields = [
    item.title,
    item.japaneseTitle,
    SERIES_SEARCH_ALIASES[item.seriesId],
    GAMBLE_SEARCH_ALIASES[item.id] ?? '',
    item.arcName,
    item.winner.name,
    item.winner.epithet,
    item.loser.name,
    item.loser.epithet,
    item.refereeName,
    item.category,
  ];

  // Tier 1a: Exact substring on primary identity fields (highest priority)
  let best = 0;
  for (let i = 0; i < primaryFields.length; i += 1) {
    const rawLower = primaryFields[i].normalize('NFKC').toLowerCase();
    const compactField = normalizeText(primaryFields[i]);
    if (rawLower.includes(token) || compactField.includes(compactToken)) {
      const weight = i === 0 ? 120 : i <= 2 ? 95 : 80;
      if (weight > best) best = weight;
    }
  }
  if (best > 0) return best;

  // Tier 1b: Exact substring on full dossier text
  const bodyHaystack = [
    item.mangaSfx,
    item.archiveCode,
    item.spoils,
    item.stakesSummary,
    item.summary,
    ...item.originalQuotes.map((q) => `${q.jp} ${q.cn} ${q.speaker}`),
    item.oneLineRule,
    ...item.basicRules,
    ...item.extraInfo,
    ...item.ruleAnalysis,
    item.ending,
  ]
    .join(' ')
    .normalize('NFKC')
    .toLowerCase();

  if (
    bodyHaystack.includes(token) ||
    normalizeText(bodyHaystack).includes(compactToken)
  ) {
    return 55;
  }

  // Tier 2: Abbreviated ordered subsequence on compact primary fields
  const compactKeyFields = [
    normalizeText(item.title),
    normalizeText(item.japaneseTitle),
    normalizeText(item.arcName),
    normalizeText(item.winner.name),
    normalizeText(item.loser.name),
    normalizeText(item.refereeName),
    normalizeText(item.category),
  ];

  for (const field of compactKeyFields) {
    const sub = subsequenceScore(compactToken, field);
    if (sub > best) best = sub;
  }
  if (best > 0 || !allowTypoFallback) return best;

  // Tier 3: Typo-tolerant edit-distance fallback on compact primary fields + one-line rule
  const typoFields = [...compactKeyFields, normalizeText(item.oneLineRule)];
  for (const field of typoFields) {
    const score = typoMatchScore(compactToken, field);
    if (score > best) best = score;
  }

  return best;
}

/**
 * Filter gamble records by manga series, category, and fuzzy multi-token query
 * across titles, series names, characters, rules, analysis, and outcomes.
 */
export function filterGambles(
  records: readonly GambleRecord[],
  filter: GambleFilterState
): GambleRecord[] {
  const tokens = filter.query
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const baseCandidates: Array<{ item: GambleRecord; index: number }> = [];
  for (let index = 0; index < records.length; index += 1) {
    const item = records[index];
    if (filter.seriesId !== 'all' && item.seriesId !== filter.seriesId) {
      continue;
    }
    if (filter.category !== '全部类型' && item.category !== filter.category) {
      continue;
    }
    baseCandidates.push({ item, index });
  }

  if (tokens.length === 0) {
    return baseCandidates.map((entry) => entry.item);
  }

  const runSearch = (allowTypoFallback: boolean) => {
    const scored: Array<{ item: GambleRecord; score: number; index: number }> = [];
    for (const { item, index } of baseCandidates) {
      let totalScore = 0;
      let allMatched = true;
      for (const token of tokens) {
        const tokenScore = scoreTokenAgainstRecord(token, item, allowTypoFallback);
        if (tokenScore <= 0) {
          allMatched = false;
          break;
        }
        totalScore += tokenScore;
      }
      if (allMatched) {
        scored.push({ item, score: totalScore, index });
      }
    }
    scored.sort((a, b) => b.score - a.score || a.index - b.index);
    return scored.map((entry) => entry.item);
  };

  // First pass: exact + abbreviated subsequence matching
  const strictMatches = runSearch(false);
  if (strictMatches.length > 0) {
    return strictMatches;
  }

  // Second pass: typo-tolerant Levenshtein fallback when user has typos
  return runSearch(true);
}

/**
 * Compute per-series record counts for navigation and filter tabs.
 */
export function getSeriesCounts(
  records: readonly GambleRecord[]
): Record<MangaSeriesId | 'all', number> {
  const counts: Record<MangaSeriesId | 'all', number> = {
    all: records.length,
    usogui: 0,
    'liar-game': 0,
    kaiji: 0,
    akagi: 0,
    kakegurui: 0,
    'tomodachi-game': 0,
    'alice-in-borderland': 0,
    'gambling-emperor-zero': 0,
    'one-outs': 0,
    'acma-game': 0,
  };

  for (const record of records) {
    counts[record.seriesId] += 1;
  }

  return counts;
}

/**
 * Determine whether a gamble's verdict (winner, loser, spoils, twist) should be hidden.
 */
export function isResultHidden(
  spoilerShieldEnabled: boolean,
  revealedIds: ReadonlySet<string>,
  gambleId: string
): boolean {
  if (!spoilerShieldEnabled) {
    return false;
  }
  return !revealedIds.has(gambleId);
}

/**
 * Return a new Set with the given gambleId toggled for individual spoiler reveal.
 */
export function toggleRevealSet(
  revealedIds: ReadonlySet<string>,
  gambleId: string
): Set<string> {
  const next = new Set(revealedIds);
  if (next.has(gambleId)) {
    next.delete(gambleId);
  } else {
    next.add(gambleId);
  }
  return next;
}

/**
 * Toggle a user's upvote on an upcoming placeholder manga series.
 */
export function toggleVoteList(
  votedIds: readonly string[],
  seriesId: string
): string[] {
  if (votedIds.includes(seriesId)) {
    return votedIds.filter((id) => id !== seriesId);
  }
  return [...votedIds, seriesId];
}

/**
 * Compute displayed vote count for an upcoming placeholder manga series.
 */
export function getUpcomingVoteCount(
  initialVotes: number,
  votedIds: readonly string[],
  seriesId: string
): number {
  return initialVotes + (votedIds.includes(seriesId) ? 1 : 0);
}

/**
 * Return previous and next gamble IDs with wrap-around navigation.
 */
export function getAdjacentGambleIds(
  records: readonly GambleRecord[],
  currentId: string
): { prevId: string | null; nextId: string | null; currentIndex: number } {
  if (records.length === 0) {
    return { prevId: null, nextId: null, currentIndex: -1 };
  }
  const idx = records.findIndex((item) => item.id === currentId);
  if (idx === -1) {
    return {
      prevId: records[records.length - 1].id,
      nextId: records[0].id,
      currentIndex: -1,
    };
  }
  const prevIdx = (idx - 1 + records.length) % records.length;
  const nextIdx = (idx + 1) % records.length;
  return {
    prevId: records[prevIdx].id,
    nextId: records[nextIdx].id,
    currentIndex: idx,
  };
}

export interface ParticipantDisplay {
  name: string;
  outcome: 'win' | 'lose' | null;
}

/**
 * Return the two competing sides for cards and dossier headers.
 * When spoiler shield is off (isHidden === false), includes win/lose labels after each name.
 * When spoiler shield is on (isHidden === true), strips labels and orders deterministically
 * by record ID so the winner does not consistently appear on the left.
 */
export function getCardParticipants(
  gamble: Pick<GambleRecord, 'id' | 'winner' | 'loser'>,
  isHidden: boolean
): [ParticipantDisplay, ParticipantDisplay] {
  if (!isHidden) {
    return [
      { name: gamble.winner.name, outcome: 'win' },
      { name: gamble.loser.name, outcome: 'lose' },
    ];
  }

  let hash = 0;
  for (let i = 0; i < gamble.id.length; i += 1) {
    hash = (hash * 31 + gamble.id.charCodeAt(i)) % 997;
  }

  const swap = hash % 2 === 1;
  return swap
    ? [
        { name: gamble.loser.name, outcome: null },
        { name: gamble.winner.name, outcome: null },
      ]
    : [
        { name: gamble.winner.name, outcome: null },
        { name: gamble.loser.name, outcome: null },
      ];
}
