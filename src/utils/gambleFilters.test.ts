import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMBLE_RECORDS, MANGA_SERIES, UPCOMING_MANGA_SHELF } from '../data/gambles';
import { GAMBLE_BACKGROUNDS } from '../data/gambleBackgrounds';
import { SERIES_BACKGROUNDS } from '../data/seriesBackgrounds';
import { CUSTOM_DIAGRAM_IDS, hasCustomDiagram } from '../components/GambleFlowDiagram';
import {
  filterGambles,
  getAdjacentGambleIds,
  getCardParticipants,
  getSeriesCounts,
  getUpcomingVoteCount,
  isResultHidden,
  toggleRevealSet,
  toggleVoteList,
} from './gambleFilters';

test('getSeriesCounts totals match canonical dataset across all 10 series', () => {
  const counts = getSeriesCounts(GAMBLE_RECORDS);
  assert.equal(counts.usogui, 21);
  assert.equal(counts['liar-game'], 10);
  assert.equal(counts.kaiji, 9);
  assert.equal(counts.akagi, 7);
  assert.equal(counts.kakegurui, 12);
  assert.equal(counts['tomodachi-game'], 10);
  assert.equal(counts['alice-in-borderland'], 13);
  assert.equal(counts['gambling-emperor-zero'], 10);
  assert.equal(counts['one-outs'], 9);
  assert.equal(counts['acma-game'], 14);
  assert.equal(counts.all, 115);
  assert.equal(MANGA_SERIES.length, 10);
  assert.equal(UPCOMING_MANGA_SHELF.length, 0);
});

test('every gamble has a unique local original manga artworkUrl, existing gallery files, and complete fields', () => {
  const artworkUrls = GAMBLE_RECORDS.map((g) => g.artworkUrl);
  const uniqueUrls = new Set(artworkUrls);
  assert.equal(
    uniqueUrls.size,
    GAMBLE_RECORDS.length,
    'Every gamble must have its own dedicated artwork without duplicates'
  );

  for (const series of [...MANGA_SERIES, ...UPCOMING_MANGA_SHELF]) {
    assert.ok(
      series.coverUrl.startsWith('/assets/manga/'),
      `${series.id} must have a local original manga coverUrl`
    );
    const coverFile = path.join(process.cwd(), 'public', series.coverUrl);
    assert.ok(fs.existsSync(coverFile), `Missing cover file: ${coverFile}`);
  }

  for (const gamble of GAMBLE_RECORDS) {
    assert.ok(
      gamble.artworkUrl.startsWith('/assets/'),
      `${gamble.id} must use a downloaded original manga asset under /assets/`
    );
    const mainFile = path.join(process.cwd(), 'public', gamble.artworkUrl);
    assert.ok(fs.existsSync(mainFile), `Missing artwork file for ${gamble.id}: ${mainFile}`);

    const gallery = gamble.galleryUrls ?? [];
    assert.ok(gallery.length >= 1, `${gamble.id} must have at least 1 gallery image`);
    for (const url of gallery) {
      const fp = path.join(process.cwd(), 'public', url);
      assert.ok(fs.existsSync(fp), `Missing gallery file for ${gamble.id}: ${fp}`);
    }

    assert.ok(gamble.oneLineRule.trim().length > 6, `${gamble.id} should have oneLineRule`);
    assert.ok(gamble.basicRules.length >= 3, `${gamble.id} should have basicRules`);
    assert.ok(gamble.extraInfo.length >= 2, `${gamble.id} should have extraInfo`);
    assert.ok(gamble.ruleAnalysis.length >= 2, `${gamble.id} should have ruleAnalysis`);
    assert.ok(gamble.spoilsBreakdown.length >= 2, `${gamble.id} should have spoils`);
    assert.ok(gamble.ending.trim().length > 10, `${gamble.id} should have ending`);
  }
});

test('filterGambles filters by manga series accurately', () => {
  const liarGameOnly = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'liar-game',
    category: '全部类型',
    query: '',
  });
  assert.equal(liarGameOnly.length, 10);
  assert.ok(liarGameOnly.every((g) => g.seriesId === 'liar-game'));
});

test('filterGambles filters by category and search query across names and rules', () => {
  const byTitle = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '推硬币',
  });
  assert.equal(byTitle.length, 1);
  assert.equal(byTitle[0].id, 'usogui-coin-push');

  const byWhip = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '鞭刑',
  });
  assert.equal(byWhip.length, 1);
  assert.equal(byWhip[0].id, 'usogui-oneshot-whip');

  const byGonen = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '葛农',
  });
  assert.equal(byGonen.length, 1);
  assert.equal(byGonen[0].id, 'usogui-gonen');

  const byJapaneseTitle = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: 'エア・ポーカー',
  });
  assert.equal(byJapaneseTitle.length, 1);
  assert.equal(byJapaneseTitle[0].id, 'air-poker');

  const emptyResult = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '不存在的赌局名称xyz',
  });
  assert.equal(emptyResult.length, 0);
});

test('filterGambles supports fuzzy search: multi-token, abbreviations, and typos', () => {
  // Multi-token across series name + category/keyword
  const multiToken = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '噬谎者 扑克',
  });
  assert.ok(multiToken.some((g) => g.id === 'air-poker'));
  assert.ok(multiToken.every((g) => g.seriesId === 'usogui'));

  // Abbreviated subsequence matching
  const abbrevMahjong = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '17麻将',
  });
  assert.equal(abbrevMahjong[0]?.id, 'minefield-mahjong-17-steps');

  const abbrevAirPoker = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '空扑',
  });
  assert.equal(abbrevAirPoker[0]?.id, 'air-poker');

  // 1-character typo tolerance
  const typoAirPoker = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '空气朴克',
  });
  assert.equal(typoAirPoker[0]?.id, 'air-poker');

  const typoOldMaid = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '抽鬼排',
  });
  assert.equal(typoOldMaid[0]?.id, 'hangman-old-maid');

  // Newly added series search & alias matching
  const akagiWashizu = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '鹫巢麻将',
  });
  assert.equal(akagiWashizu[0]?.id, 'akagi-washizu');

  const aliceBeauty = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '弥留 美人投票',
  });
  assert.equal(aliceBeauty[0]?.id, 'alice-k-diamonds-beauty-contest');

  const oneOutsContract = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '渡久地 5000万',
  });
  assert.ok(oneOutsContract.some((g) => g.id === 'oneouts-contract'));

  const choicePoker = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '选择扑克',
  });
  assert.equal(choicePoker[0]?.id, 'kakegurui-choice-poker');

  const zero100Poker = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '100枚扑克',
  });
  assert.equal(zero100Poker[0]?.id, 'zero-100-poker');

  const takamiDuel = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '高见树',
  });
  assert.equal(takamiDuel[0]?.id, 'oneouts-takami-duel');

  const aliceDistance = filterGambles(GAMBLE_RECORDS, {
    seriesId: 'all',
    category: '全部类型',
    query: '梅花4',
  });
  assert.equal(aliceDistance[0]?.id, 'alice-4-clubs-distance');
});

test('spoiler shield hides verdict until individually revealed', () => {
  const revealed = new Set<string>();
  assert.equal(isResultHidden(false, revealed, 'air-poker'), false);
  assert.equal(isResultHidden(true, revealed, 'air-poker'), true);

  const afterReveal = toggleRevealSet(revealed, 'air-poker');
  assert.equal(isResultHidden(true, afterReveal, 'air-poker'), false);
  assert.equal(isResultHidden(true, afterReveal, 'abandoned-building'), true);

  const afterHideAgain = toggleRevealSet(afterReveal, 'air-poker');
  assert.equal(isResultHidden(true, afterHideAgain, 'air-poker'), true);
});

test('upcoming placeholder manga voting toggles and computes counts cleanly', () => {
  let votes: string[] = [];
  assert.equal(getUpcomingVoteCount(184, votes, 'akagi'), 184);

  votes = toggleVoteList(votes, 'akagi');
  assert.deepEqual(votes, ['akagi']);
  assert.equal(getUpcomingVoteCount(184, votes, 'akagi'), 185);

  votes = toggleVoteList(votes, 'akagi');
  assert.deepEqual(votes, []);
  assert.equal(getUpcomingVoteCount(184, votes, 'akagi'), 184);
});

test('getAdjacentGambleIds wraps around first and last records', () => {
  const firstAdj = getAdjacentGambleIds(GAMBLE_RECORDS, GAMBLE_RECORDS[0].id);
  assert.equal(firstAdj.currentIndex, 0);
  assert.equal(firstAdj.prevId, GAMBLE_RECORDS[GAMBLE_RECORDS.length - 1].id);
  assert.equal(firstAdj.nextId, GAMBLE_RECORDS[1].id);

  const lastAdj = getAdjacentGambleIds(
    GAMBLE_RECORDS,
    GAMBLE_RECORDS[GAMBLE_RECORDS.length - 1].id
  );
  assert.equal(lastAdj.currentIndex, GAMBLE_RECORDS.length - 1);
  assert.equal(lastAdj.prevId, GAMBLE_RECORDS[GAMBLE_RECORDS.length - 2].id);
  assert.equal(lastAdj.nextId, GAMBLE_RECORDS[0].id);
});

test('getCardParticipants shows win/lose tags when visible and strips them when spoiler shield is active', () => {
  const sample = GAMBLE_RECORDS[0];
  const revealed = getCardParticipants(sample, false);
  assert.equal(revealed[0].name, sample.winner.name);
  assert.equal(revealed[0].outcome, 'win');
  assert.equal(revealed[1].name, sample.loser.name);
  assert.equal(revealed[1].outcome, 'lose');

  const hidden = getCardParticipants(sample, true);
  assert.equal(hidden[0].outcome, null);
  assert.equal(hidden[1].outcome, null);
  assert.deepEqual(
    new Set([hidden[0].name, hidden[1].name]),
    new Set([sample.winner.name, sample.loser.name])
  );
});

test('every series and gamble record provides spoiler-free background knowledge', () => {
  assert.equal(MANGA_SERIES.length, 10);
  for (const series of MANGA_SERIES) {
    const world = SERIES_BACKGROUNDS[series.id];
    assert.ok(world, `Missing SERIES_BACKGROUNDS for ${series.id}`);
    assert.ok(world.premise.trim().length > 10, `Empty premise for ${series.id}`);
    assert.ok(world.keyTerms.length >= 2, `Too few keyTerms for ${series.id}`);
  }

  assert.equal(GAMBLE_RECORDS.length, 115);
  for (const record of GAMBLE_RECORDS) {
    const bg = GAMBLE_BACKGROUNDS[record.id];
    assert.ok(bg, `Missing GAMBLE_BACKGROUNDS for ${record.id}`);
    assert.ok(bg.setup.trim().length > 20, `Setup too short for ${record.id}`);
    assert.ok(bg.characters.length >= 2, `Too few characters for ${record.id}`);
  }
});

test('filterGambles matches updated Chinese gamble titles and search aliases', () => {
  const byQuery = (query: string) =>
    filterGambles(GAMBLE_RECORDS, { seriesId: 'all', category: '全部类型', query }).map((g) => g.id);

  assert.ok(byQuery('以下犯上').includes('surpassing-the-leader'));
  assert.ok(byQuery('屋形越').includes('surpassing-the-leader'));
  assert.ok(byQuery('丢手绢').includes('surpassing-the-leader'));
  assert.ok(byQuery('E-Card').includes('e-card'));
  assert.ok(byQuery('E卡').includes('e-card'));
  assert.ok(byQuery('空气扑克').includes('air-poker'));
  assert.ok(byQuery('单张扑克').includes('kaiji-one-poker'));
  assert.ok(byQuery('恶魔游戏').includes('acma-true-or-false'));
  assert.ok(byQuery('ACMA:GAME').includes('acma-five-spell-survival'));
  assert.ok(byQuery('真伪心眼').includes('acma-true-or-false'));
  assert.ok(byQuery('金枪银枪').includes('acma-judge-and-fire'));
  assert.ok(byQuery('三单究明').includes('acma-word-investigation'));
});

test('custom interactive diagram registry covers all 115 canonical gambles cleanly', async () => {
  const recordIds = new Set(GAMBLE_RECORDS.map((r) => r.id));
  assert.equal(CUSTOM_DIAGRAM_IDS.length, GAMBLE_RECORDS.length);

  for (const record of GAMBLE_RECORDS) {
    assert.equal(hasCustomDiagram(record.id), true, `Missing custom diagram for ${record.id}`);
  }
  for (const id of CUSTOM_DIAGRAM_IDS) {
    assert.ok(recordIds.has(id), `Custom diagram id not in GAMBLE_RECORDS: ${id}`);
  }
  assert.equal(hasCustomDiagram('non-existent-gamble'), false);

  // Verify every lazy series module exports exact matching component entries
  const [usogui, liar, kaiji, akagi, kakegurui, tomodachi, alice, zero, oneOuts, acmaGame] =
    await Promise.all([
      import('../components/diagrams/UsoguiDiagrams').then((m) => m.USOGUI_DIAGRAMS),
      import('../components/diagrams/LiarGameDiagrams').then((m) => m.LIAR_GAME_DIAGRAMS),
      import('../components/diagrams/KaijiDiagrams').then((m) => m.KAIJI_DIAGRAMS),
      import('../components/diagrams/AkagiDiagrams').then((m) => m.AKAGI_DIAGRAMS),
      import('../components/diagrams/KakeguruiDiagrams').then((m) => m.KAKEGURUI_DIAGRAMS),
      import('../components/diagrams/TomodachiDiagrams').then((m) => m.TOMODACHI_DIAGRAMS),
      import('../components/diagrams/AliceDiagrams').then((m) => m.ALICE_DIAGRAMS),
      import('../components/diagrams/ZeroDiagrams').then((m) => m.ZERO_DIAGRAMS),
      import('../components/diagrams/OneOutsDiagrams').then((m) => m.ONE_OUTS_DIAGRAMS),
      import('../components/diagrams/AcmaGameDiagrams').then((m) => m.ACMA_GAME_DIAGRAMS),
    ]);

  const allExportedIds = new Set([
    'e-card',
    'surpassing-the-leader',
    'air-poker',
    'minority-rule',
    'minotaur-labyrinth',
    ...Object.keys(usogui),
    ...Object.keys(liar),
    ...Object.keys(kaiji),
    ...Object.keys(akagi),
    ...Object.keys(kakegurui),
    ...Object.keys(tomodachi),
    ...Object.keys(alice),
    ...Object.keys(zero),
    ...Object.keys(oneOuts),
    ...Object.keys(acmaGame),
  ]);

  assert.equal(allExportedIds.size, 115);
  for (const record of GAMBLE_RECORDS) {
    assert.ok(allExportedIds.has(record.id), `No component exported for ${record.id}`);
  }
});
