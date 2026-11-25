export type MangaSeriesId =
  | 'usogui'
  | 'liar-game'
  | 'kaiji'
  | 'akagi'
  | 'kakegurui'
  | 'tomodachi-game'
  | 'alice-in-borderland'
  | 'gambling-emperor-zero'
  | 'one-outs'
  | 'acma-game';

export type GambleCategory =
  | '全部类型'
  | '生存逃脱'
  | '心理博弈'
  | '扑克纸牌'
  | '群体策略'
  | '极限机关';

export type GambleMotif =
  | 'building'
  | 'hangman'
  | 'maze'
  | 'tower'
  | 'submarine'
  | 'handkerchief'
  | 'ballot'
  | 'smuggle'
  | 'cards17'
  | 'chairs'
  | 'rps'
  | 'ecard'
  | 'bog'
  | 'mahjong';

export interface MangaSeriesInfo {
  id: MangaSeriesId;
  title: string;
  japaneseTitle: string;
  author: string;
  era: string;
  organization: string;
  coverUrl: string;
  signatureLine: string;
  summary: string;
}

export interface Combatant {
  epithet: string;
  name: string;
}

export interface MangaQuote {
  speaker: string;
  jp: string;
  cn: string;
}

export interface GambleRecord {
  id: string;
  archiveCode: string;
  seriesId: MangaSeriesId;
  title: string;
  japaneseTitle: string;
  mangaSfx: string;
  spreadTitleLines: [string, string];
  arcName: string;
  chapterRange: string;
  category: Exclude<GambleCategory, '全部类型'>;
  refereeRole: string;
  refereeName: string;
  winner: Combatant;
  loser: Combatant;
  spoils: string;
  spoilsBreakdown: string[];
  stakesSummary: string;
  summary: string;
  oneLineRule: string;
  basicRules: string[];
  extraInfo: string[];
  winCondition: string;
  ruleAnalysis: string[];
  ending: string;
  closingQuotes: [string, string];
  originalQuotes: MangaQuote[];
  motif: GambleMotif;
  artworkUrl: string;
  artworkCaption: string;
  galleryUrls?: string[];
  cardImagePosition?: string;
  isOriginalMangaScan?: boolean;
  referencePlateUrl?: string;
  referencePlateCaption?: string;
}

export interface UpcomingMangaSeries {
  id: string;
  title: string;
  japaneseTitle: string;
  author: string;
  coverUrl: string;
  statusLabel: string;
  signatureQuote: string;
  plannedGambles: string[];
  note: string;
  initialVotes: number;
}

export interface WorldTerm {
  term: string;
  desc: string;
}

export interface SeriesBackgroundInfo {
  premise: string;
  keyTerms: WorldTerm[];
}

export interface BackgroundCharacter {
  name: string;
  role: string;
}

export interface GambleBackgroundInfo {
  /** 无剧透的前情提要：为何走上赌桌、故事节点与赌注前提 */
  setup: string;
  /** 开局入场时的核心人物身份与动机（严禁包含胜负剧透） */
  characters: BackgroundCharacter[];
}

export interface GambleFilterState {
  seriesId: MangaSeriesId | 'all';
  category: GambleCategory;
  query: string;
}
