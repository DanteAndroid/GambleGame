import assert from 'node:assert/strict';
import test from 'node:test';
import { computeTextDiff } from './textDiff';

test('computeTextDiff handles identical and empty strings', () => {
  assert.deepEqual(computeTextDiff('', ''), []);
  assert.deepEqual(computeTextDiff('规则不变', '规则不变'), [
    { type: 'equal', text: '规则不变' },
  ]);
  assert.deepEqual(computeTextDiff('', '新增条款'), [
    { type: 'added', text: '新增条款' },
  ]);
  assert.deepEqual(computeTextDiff('删除条款', ''), [
    { type: 'removed', text: '删除条款' },
  ]);
});

test('computeTextDiff isolates single-character Chinese edits accurately', () => {
  const diff = computeTextDiff('双方各持五张牌对决', '双方各持七张牌对决');
  assert.deepEqual(diff, [
    { type: 'equal', text: '双方各持' },
    { type: 'removed', text: '五' },
    { type: 'added', text: '七' },
    { type: 'equal', text: '张牌对决' },
  ]);
});

test('computeTextDiff reconstructs both original and updated multi-line strings exactly', () => {
  const before = '第一条：每人发三张牌\n第二条：不能偷看底牌\n第三条：十回合结束';
  const after = '第一条：每人发四张牌\n第二条：允许交换一次手牌\n第三条：十回合结束';
  const segments = computeTextDiff(before, after);

  const rebuiltBefore = segments
    .filter((s) => s.type !== 'added')
    .map((s) => s.text)
    .join('');
  const rebuiltAfter = segments
    .filter((s) => s.type !== 'removed')
    .map((s) => s.text)
    .join('');

  assert.equal(rebuiltBefore, before);
  assert.equal(rebuiltAfter, after);
  assert.ok(segments.some((s) => s.type === 'removed' && s.text.includes('三')));
  assert.ok(segments.some((s) => s.type === 'added' && s.text.includes('四')));
});
