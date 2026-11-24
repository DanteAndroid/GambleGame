import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMBLE_RECORDS, MANGA_SERIES, UPCOMING_MANGA_SHELF } from '../data/gambles';
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

test('getSeriesCounts totals match canonical dataset across all 9 series', () => {
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
  assert.equal(counts.all, 101);
  assert.equal(MANGA_SERIES.length, 9);
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
