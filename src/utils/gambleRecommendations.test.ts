import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMBLE_RECORDS } from '../data/gambles';
import {
  getCrossSeriesRecommendations,
  MAX_RECENT_GAMBLES,
  pickRandomGambleId,
  pushRecentGambleId,
  resolveRecentGambles,
} from './gambleRecommendations';

test('getCrossSeriesRecommendations returns 4 distinct-series matches for every gamble', () => {
  for (const gamble of GAMBLE_RECORDS) {
    const recs = getCrossSeriesRecommendations(gamble, GAMBLE_RECORDS, { limit: 4 });
    assert.equal(recs.length, 4, `Expected 4 recommendations for ${gamble.id}`);

    const seenSeries = new Set<string>();
    for (const rec of recs) {
      assert.notEqual(
        rec.gamble.id,
        gamble.id,
        `Recommendation should not include self (${gamble.id})`
      );
      assert.notEqual(
        rec.gamble.seriesId,
        gamble.seriesId,
        `Recommendation for ${gamble.id} must come from a different series`
      );
      assert.equal(
        seenSeries.has(rec.gamble.seriesId),
        false,
        `Expected series diversity across top 4 recommendations for ${gamble.id}`
      );
      seenSeries.add(rec.gamble.seriesId);
      assert.ok(rec.reason.trim().length > 0, `Expected non-empty reason for ${gamble.id}`);
    }
  }
});

test('getCrossSeriesRecommendations bridges domain-relevant mechanics across manga works', () => {
  const washizu = GAMBLE_RECORDS.find((g) => g.id === 'akagi-washizu');
  assert.ok(washizu);
  const washizuRecs = getCrossSeriesRecommendations(washizu, GAMBLE_RECORDS, { limit: 4 });
  assert.ok(
    washizuRecs.some((r) => r.gamble.id === 'minefield-mahjong-17-steps'),
    'Washizu Mahjong should link to 17-Step Minefield Mahjong across series'
  );

  const minority = GAMBLE_RECORDS.find((g) => g.id === 'minority-rule');
  assert.ok(minority);
  const minorityRecs = getCrossSeriesRecommendations(minority, GAMBLE_RECORDS, { limit: 4 });
  assert.ok(
    minorityRecs.some((r) => r.reason.includes('投票') || r.reason.includes('心理')),
    'Minority Rule should highlight voting/crowd psychology links across series'
  );

  // Batch rotation via offset yields a fresh distinct slice
  const eCard = GAMBLE_RECORDS.find((g) => g.id === 'e-card');
  assert.ok(eCard);
  const batch1 = getCrossSeriesRecommendations(eCard, GAMBLE_RECORDS, { limit: 4, offset: 0 });
  const batch2 = getCrossSeriesRecommendations(eCard, GAMBLE_RECORDS, { limit: 4, offset: 4 });
  const batch1Ids = new Set(batch1.map((r) => r.gamble.id));
  assert.ok(
    batch2.every((r) => !batch1Ids.has(r.gamble.id)),
    'Second recommendation batch should not repeat items from the first batch'
  );
});

test('pickRandomGambleId excludes current gamble when alternatives exist', () => {
  assert.equal(pickRandomGambleId([]), null);
  assert.equal(pickRandomGambleId([{ id: 'only-one' }], 'only-one'), 'only-one');

  const sample = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.equal(pickRandomGambleId(sample, 'a', () => 0), 'b');
  assert.equal(pickRandomGambleId(sample, 'a', () => 0.99), 'c');
  assert.equal(pickRandomGambleId(sample, null, () => 0), 'a');
});

test('pushRecentGambleId deduplicates, preserves recency order, and enforces max length', () => {
  let list: string[] = [];
  list = pushRecentGambleId(list, 'e-card');
  list = pushRecentGambleId(list, 'air-poker');
  list = pushRecentGambleId(list, 'e-card');
  assert.deepEqual(list, ['e-card', 'air-poker']);

  for (let i = 0; i < 12; i += 1) {
    list = pushRecentGambleId(list, `item-${i}`);
  }
  assert.equal(list.length, MAX_RECENT_GAMBLES);
  assert.equal(list[0], 'item-11');
});

test('resolveRecentGambles drops unknown IDs and keeps stored order', () => {
  const resolved = resolveRecentGambles(
    ['air-poker', 'non-existent-id', 'e-card', 'air-poker'],
    GAMBLE_RECORDS
  );
  assert.deepEqual(
    resolved.map((item) => item.id),
    ['air-poker', 'e-card']
  );
});
