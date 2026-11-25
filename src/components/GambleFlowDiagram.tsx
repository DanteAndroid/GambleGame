import { Suspense, lazy, type ComponentType } from 'react';
import { AirPokerDiagram } from './diagrams/AirPokerDiagram';
import { ECardDiagram } from './diagrams/ECardDiagram';
import { MinorityRuleDiagram } from './diagrams/MinorityRuleDiagram';
import { MinotaurLabyrinthDiagram } from './diagrams/MinotaurLabyrinthDiagram';
import { SurpassingDiagram } from './diagrams/SurpassingDiagram';

type SeriesChunkKey =
  | 'usogui'
  | 'liar-game'
  | 'kaiji'
  | 'akagi'
  | 'kakegurui'
  | 'tomodachi'
  | 'alice'
  | 'zero'
  | 'one-outs'
  | 'acma-game';

const DIRECT_DIAGRAMS: Record<string, ComponentType> = {
  'e-card': ECardDiagram,
  'surpassing-the-leader': SurpassingDiagram,
  'air-poker': AirPokerDiagram,
  'minority-rule': MinorityRuleDiagram,
  'minotaur-labyrinth': MinotaurLabyrinthDiagram,
};

const SERIES_GAMBLE_IDS: Record<SeriesChunkKey, readonly string[]> = {
  usogui: [
    'usogui-oneshot-whip',
    'usogui-prologue-roulette',
    'abandoned-building',
    'usogui-poker-shark',
    'hangman-old-maid',
    'labyrinth-zero',
    'bulls-womb',
    'ky-declaration',
    'tower-of-karma',
    'usogui-coin-push',
    'battleship',
    'usogui-bookstore',
    'usogui-four-gods',
    'usogui-colosseum',
    'usogui-contradiction',
    'protoporos',
    'hand-chopper',
    'usogui-gonen',
  ],
  'liar-game': [
    'liar-round-one',
    'liar-downsizing',
    'contraband-game',
    'seventeen-poker',
    'liar-russian-roulette',
    'liar-pandemic',
    'musical-chairs',
    'liar-bid-poker',
    'liar-four-kingdoms',
  ],
  kaiji: [
    'restricted-rps',
    'kaiji-steel-beam',
    'kaiji-tissue-box',
    'kaiji-chinchirorin',
    'the-bog-pachinko',
    'minefield-mahjong-17-steps',
    'kaiji-salvation',
    'kaiji-one-poker',
  ],
  akagi: [
    'akagi-chicken-run',
    'akagi-ryuzaki',
    'akagi-yagi',
    'akagi-ichikawa',
    'akagi-urabe',
    'akagi-hirayama',
    'akagi-washizu',
  ],
  kakegurui: [
    'kakegurui-vote-rps',
    'kakegurui-double-concentration',
    'kakegurui-life-or-death',
    'kakegurui-indian-poker',
    'kakegurui-esp-game',
    'kakegurui-choice-poker',
    'kakegurui-finger-guillotine',
    'kakegurui-nim-type-zero',
    'kakegurui-tower-of-doors',
    'kakegurui-public-goods',
    'kakegurui-war',
    'kakegurui-auction',
  ],
  tomodachi: [
    'tomodachi-kokkuri',
    'tomodachi-badmouth-sugoroku',
    'tomodachi-hide-and-seek',
    'tomodachi-fake-game',
    'tomodachi-sin-trial',
    'tomodachi-prison-game',
    'tomodachi-blackjack',
    'tomodachi-all-bet',
    'tomodachi-zombie-island',
    'tomodachi-snow-cabin',
  ],
  alice: [
    'alice-3-clubs-dead-or-alive',
    'alice-5-spades-tag',
    'alice-7-hearts-wolf',
    'alice-4-clubs-distance',
    'alice-4-diamonds-lightbulb',
    'alice-6-diamonds-blackjack',
    'alice-10-hearts-witch-hunt',
    'alice-k-clubs-osmosis',
    'alice-j-hearts-solitary',
    'alice-j-diamonds-mahjong',
    'alice-k-diamonds-beauty-contest',
    'alice-k-spades-survival',
    'alice-q-hearts-croquet',
  ],
  zero: [
    'zero-ring-drop',
    'zero-jack-room',
    'zero-quarter-jump',
    'zero-triangle-room',
    'zero-anchor-room',
    'zero-witch-mansion',
    'zero-lost-ring',
    'zero-morning-golf',
    'zero-100-poker',
    'zero-beer-pour',
  ],
  'one-outs': [
    'oneouts-street-game',
    'oneouts-contract',
    'oneouts-takami-duel',
    'oneouts-rain-delay',
    'oneouts-substitute-trap',
    'oneouts-sign-stealing',
    'oneouts-johnson-steal',
    'oneouts-bluemars-cheat',
    'oneouts-ownership-finale',
  ],
  'acma-game': [
    'acma-true-or-false',
    'acma-shadow-step',
    'acma-five-one',
    'acma-hundred-contest',
    'acma-hide-and-see',
    'acma-pour-to-limit',
    'acma-judge-and-fire',
    'acma-basket-fruits',
    'acma-clay-dialogue',
    'acma-shiritori-drawing',
    'acma-mascot-hide-seek',
    'acma-silent-staring',
    'acma-five-spell-survival',
    'acma-word-investigation',
  ],
};

const ID_TO_SERIES: Record<string, SeriesChunkKey> = {};
for (const [series, ids] of Object.entries(SERIES_GAMBLE_IDS) as Array<
  [SeriesChunkKey, readonly string[]]
>) {
  for (const id of ids) {
    ID_TO_SERIES[id] = series;
  }
}

function makeLazySeriesRenderer(
  loader: () => Promise<Record<string, ComponentType>>
): ComponentType<{ gambleId: string }> {
  return lazy(async () => {
    const map = await loader();
    return {
      default: function SeriesDiagramHost({ gambleId }: { gambleId: string }) {
        const Comp = map[gambleId];
        return Comp ? <Comp /> : null;
      },
    };
  });
}

const LAZY_SERIES_HOSTS: Record<SeriesChunkKey, ComponentType<{ gambleId: string }>> = {
  usogui: makeLazySeriesRenderer(() =>
    import('./diagrams/UsoguiDiagrams').then((m) => m.USOGUI_DIAGRAMS)
  ),
  'liar-game': makeLazySeriesRenderer(() =>
    import('./diagrams/LiarGameDiagrams').then((m) => m.LIAR_GAME_DIAGRAMS)
  ),
  kaiji: makeLazySeriesRenderer(() =>
    import('./diagrams/KaijiDiagrams').then((m) => m.KAIJI_DIAGRAMS)
  ),
  akagi: makeLazySeriesRenderer(() =>
    import('./diagrams/AkagiDiagrams').then((m) => m.AKAGI_DIAGRAMS)
  ),
  kakegurui: makeLazySeriesRenderer(() =>
    import('./diagrams/KakeguruiDiagrams').then((m) => m.KAKEGURUI_DIAGRAMS)
  ),
  tomodachi: makeLazySeriesRenderer(() =>
    import('./diagrams/TomodachiDiagrams').then((m) => m.TOMODACHI_DIAGRAMS)
  ),
  alice: makeLazySeriesRenderer(() =>
    import('./diagrams/AliceDiagrams').then((m) => m.ALICE_DIAGRAMS)
  ),
  zero: makeLazySeriesRenderer(() =>
    import('./diagrams/ZeroDiagrams').then((m) => m.ZERO_DIAGRAMS)
  ),
  'one-outs': makeLazySeriesRenderer(() =>
    import('./diagrams/OneOutsDiagrams').then((m) => m.ONE_OUTS_DIAGRAMS)
  ),
  'acma-game': makeLazySeriesRenderer(() =>
    import('./diagrams/AcmaGameDiagrams').then((m) => m.ACMA_GAME_DIAGRAMS)
  ),
};

export const CUSTOM_DIAGRAM_IDS: string[] = [
  ...Object.keys(DIRECT_DIAGRAMS),
  ...Object.keys(ID_TO_SERIES),
];

export function hasCustomDiagram(gambleId: string): boolean {
  return gambleId in DIRECT_DIAGRAMS || gambleId in ID_TO_SERIES;
}

export function GambleFlowDiagramCard({ gambleId }: { gambleId: string }) {
  const DirectComp = DIRECT_DIAGRAMS[gambleId];
  const seriesKey = ID_TO_SERIES[gambleId];

  if (!DirectComp && !seriesKey) return null;

  const LazyHost = seriesKey ? LAZY_SERIES_HOSTS[seriesKey] : null;

  return (
    <section
      aria-label="规则交互图解"
      data-testid="gamble-flow-diagram"
      data-gamble-id={gambleId}
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 sm:p-5 collector-card"
    >
      {DirectComp ? (
        <DirectComp />
      ) : (
        LazyHost && (
          <Suspense
            fallback={
              <div className="rounded-xl bg-[var(--diagram-surface)] border border-[var(--diagram-border)] p-8 text-center text-[12px] text-[var(--text-secondary)]">
                加载交互图解…
              </div>
            }
          >
            <LazyHost gambleId={gambleId} />
          </Suspense>
        )
      )}
    </section>
  );
}
