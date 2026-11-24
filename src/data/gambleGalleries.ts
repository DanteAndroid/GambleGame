export interface GambleMediaOverride {
  artworkUrl: string;
  galleryUrls: string[];
  cardImagePosition?: string;
}

/**
 * Visually verified original manga pages for all 40 canonical gambles.
 * Priority strictly follows:
 *   1. Chinese manga gamble / verdict / rule pages (usogui_cn, liar_cn, user attachment)
 *   2. Japanese / English original manga gamble pages (extra_jp_en, usogui_en, liar_en, kaiji_en)
 *   3. Closest scene from the same chapter / arc as fallback.
 *
 * Every collected related manga frame is retained in `galleryUrls` so nothing is discarded.
 */
export const GAMBLE_MEDIA_BY_ID: Record<string, GambleMediaOverride> = {
  // ==================== 《噬谎者》全 21 场 ====================
  'usogui-oneshot-whip': {
    artworkUrl: '/assets/manga/usogui_oneshot.png',
    galleryUrls: ['/assets/manga/usogui_oneshot.png'],
    cardImagePosition: 'object-top',
  },
  'usogui-prologue-roulette': {
    artworkUrl: '/assets/manga/usogui_en/roulette_ch1_p25.png',
    galleryUrls: [
      '/assets/manga/usogui_en/roulette_ch1_p25.png',
      '/assets/manga/usogui_en/roulette_ch1_p35.png',
      '/assets/manga/usogui_en/roulette_ch1_p15.png',
      '/assets/manga/usogui_en/roulette_p04.png',
      '/assets/manga/usogui_en/roulette_p09.png',
      '/assets/manga/usogui_en/roulette_p13.png',
      '/assets/manga/usogui_en/roulette_p17.png',
      '/assets/manga/usogui_roulette.jpg',
    ],
    cardImagePosition: 'object-center',
  },
  'abandoned-building': {
    artworkUrl: '/assets/aistudio/image_e9240f42.png',
    galleryUrls: [
      '/assets/aistudio/image_e9240f42.png',
      '/assets/manga/usogui_cn/cn_04.png',
      '/assets/manga/usogui_cn/cn_02.png',
      '/assets/manga/usogui_cn/cn_03.png',
      '/assets/manga/usogui_cn/cn_05.png',
    ],
    cardImagePosition: 'object-top',
  },
  'usogui-poker-shark': {
    artworkUrl: '/assets/manga/usogui_poker_shark.png',
    galleryUrls: [
      '/assets/manga/usogui_poker_shark.png',
      '/assets/manga/usogui_cn/cn_06.png',
    ],
    cardImagePosition: 'object-top',
  },
  'hangman-old-maid': {
    artworkUrl: '/assets/manga/usogui_cn/cn_07.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_07.png',
      '/assets/manga/usogui_cn/cn_09.png',
      '/assets/manga/usogui_cn/cn_08.png',
      '/assets/manga/usogui_cn/cn_10.png',
      '/assets/manga/usogui_hangman.jpg',
    ],
    cardImagePosition: 'object-top',
  },
  'labyrinth-zero': {
    artworkUrl: '/assets/manga/usogui_cn/cn_15.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_15.png',
      '/assets/manga/usogui_cn/cn_12.png',
      '/assets/manga/usogui_cn/cn_13.png',
      '/assets/manga/usogui_cn/cn_14.png',
      '/assets/manga/usogui_cn/cn_16.png',
      '/assets/manga/usogui_paper_labyrinth.png',
    ],
    cardImagePosition: 'object-top',
  },
  'minotaur-labyrinth': {
    artworkUrl: '/assets/manga/usogui_cn/cn_24.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_24.png',
      '/assets/manga/usogui_cn/cn_20.png',
      '/assets/manga/usogui_cn/cn_21.png',
      '/assets/manga/usogui_cn/cn_17.png',
      '/assets/manga/usogui_cn/cn_18.png',
      '/assets/manga/usogui_cn/cn_19.png',
      '/assets/manga/usogui_cn/cn_22.png',
      '/assets/manga/usogui_cn/cn_23.png',
      '/assets/manga/extra_jp_en/usogui_black_path.png',
      '/assets/manga/usogui_minotaur.png',
    ],
    cardImagePosition: 'object-top',
  },
  'bulls-womb': {
    artworkUrl: '/assets/manga/usogui_cn/cn_25.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_25.png',
      '/assets/manga/usogui_cn/cn_26.png',
      '/assets/manga/usogui_cn/cn_27.png',
      '/assets/manga/usogui_cn/cn_28.png',
      '/assets/manga/usogui_bullswomb.png',
    ],
    cardImagePosition: 'object-top',
  },
  'ky-declaration': {
    artworkUrl: '/assets/manga/usogui_cn/cn_30.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_30.png',
      '/assets/manga/usogui_cn/cn_29.png',
      '/assets/manga/usogui_cn/cn_31.png',
      '/assets/manga/usogui_ky.jpg',
    ],
    cardImagePosition: 'object-top',
  },
  'tower-of-karma': {
    artworkUrl: '/assets/manga/usogui_cn/cn_32.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_32.png',
      '/assets/manga/extra_jp_en/usogui_tower_match.png',
      '/assets/manga/usogui_tower.jpg',
    ],
    cardImagePosition: 'object-top',
  },
  'usogui-coin-push': {
    artworkUrl: '/assets/manga/usogui_cn/cn_33.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_33.png',
      '/assets/manga/usogui_cn/cn_34.png',
      '/assets/manga/usogui_cn/cn_35.png',
      '/assets/manga/usogui_coin_push.png',
    ],
    cardImagePosition: 'object-top',
  },
  battleship: {
    artworkUrl: '/assets/manga/usogui_cn/cn_36.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_36.png',
      '/assets/manga/usogui_cn/cn_37.png',
      '/assets/manga/extra_jp_en/usogui_battleship_game.png',
      '/assets/manga/usogui_battleship.jpg',
    ],
    cardImagePosition: 'object-bottom',
  },
  'usogui-bookstore': {
    artworkUrl: '/assets/manga/usogui_en/bookstore_p14.png',
    galleryUrls: [
      '/assets/manga/usogui_en/bookstore_p14.png',
      '/assets/manga/usogui_en/bookstore_p18.png',
      '/assets/manga/usogui_en/bookstore_p10.png',
      '/assets/manga/usogui_en/bookstore_p05.png',
      '/assets/manga/usogui_cn/cn_38.png',
      '/assets/manga/usogui_cn/cn_39.png',
      '/assets/manga/usogui_cn/cn_40.png',
      '/assets/manga/usogui_bookstore.jpg',
    ],
    cardImagePosition: 'object-top',
  },
  'usogui-four-gods': {
    artworkUrl: '/assets/manga/usogui_en/fourgods_p09.png',
    galleryUrls: [
      '/assets/manga/usogui_en/fourgods_p09.png',
      '/assets/manga/usogui_en/fourgods_p14.png',
      '/assets/manga/usogui_en/fourgods_p04.png',
      '/assets/manga/usogui_four_gods.png',
    ],
    cardImagePosition: 'object-center',
  },
  'usogui-colosseum': {
    artworkUrl: '/assets/manga/usogui_en/colosseum_p09.png',
    galleryUrls: [
      '/assets/manga/usogui_en/colosseum_p09.png',
      '/assets/manga/usogui_en/colosseum_p04.png',
      '/assets/manga/usogui_en/colosseum_p14.png',
      '/assets/manga/usogui_en/colosseum_p18.png',
      '/assets/manga/usogui_colosseum.png',
    ],
    cardImagePosition: 'object-center',
  },
  'usogui-contradiction': {
    artworkUrl: '/assets/manga/usogui_en/contradiction_p04.png',
    galleryUrls: [
      '/assets/manga/usogui_en/contradiction_p04.png',
      '/assets/manga/usogui_en/contradiction_p09.png',
      '/assets/manga/usogui_en/contradiction_p14.png',
      '/assets/manga/usogui_contradiction.png',
    ],
    cardImagePosition: 'object-center',
  },
  protoporos: {
    artworkUrl: '/assets/manga/usogui_cn/cn_41.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_41.png',
      '/assets/manga/usogui_protoporos.jpg',
    ],
    cardImagePosition: 'object-center',
  },
  'hand-chopper': {
    artworkUrl: '/assets/manga/usogui_en/hc427_p05.png',
    galleryUrls: [
      '/assets/manga/usogui_en/hc427_p05.png',
      '/assets/manga/usogui_en/hc427_p10.png',
      '/assets/manga/usogui_en/hc427_p15.png',
      '/assets/manga/usogui_en/hc426_p05.png',
      '/assets/manga/usogui_en/hc426_p10.png',
      '/assets/manga/usogui_en/hc426_p15.png',
      '/assets/manga/usogui_en/handchopper_417_p04.png',
      '/assets/manga/usogui_en/handchopper_424_p04.png',
      '/assets/manga/usogui_en/handchopper_p09.png',
      '/assets/manga/usogui_hand_chopper.png',
    ],
    cardImagePosition: 'object-top',
  },
  'air-poker': {
    artworkUrl: '/assets/manga/usogui_cn/cn_42.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_42.png',
      '/assets/manga/usogui_cn/cn_43.png',
      '/assets/manga/usogui_cn/cn_45.png',
      '/assets/manga/usogui_cn/cn_44.png',
      '/assets/manga/usogui_air_poker.jpg',
    ],
    cardImagePosition: 'object-bottom',
  },
  'surpassing-the-leader': {
    artworkUrl: '/assets/manga/usogui_cn/cn_55.png',
    galleryUrls: [
      '/assets/manga/usogui_cn/cn_55.png',
      '/assets/manga/usogui_cn/cn_48.png',
      '/assets/manga/usogui_cn/cn_51.png',
      '/assets/manga/usogui_cn/cn_50.png',
      '/assets/manga/usogui_cn/cn_53.png',
      '/assets/manga/usogui_cn/cn_54.png',
      '/assets/manga/usogui_cn/cn_46.png',
      '/assets/manga/usogui_cn/cn_47.png',
      '/assets/manga/usogui_cn/cn_49.png',
      '/assets/manga/usogui_cn/cn_52.png',
      '/assets/manga/extra_jp_en/usogui_dth_rules_jp.jpg',
      '/assets/manga/usogui_stl.png',
    ],
    cardImagePosition: 'object-center',
  },
  'usogui-gonen': {
    artworkUrl: '/assets/manga/usogui_en/gonen_539_end_p07.png',
    galleryUrls: [
      '/assets/manga/usogui_en/gonen_539_end_p07.png',
      '/assets/manga/usogui_en/gonen_p15.png',
      '/assets/manga/usogui_en/gonen539_p11.png',
      '/assets/manga/usogui_en/gonen539_p05.png',
      '/assets/manga/usogui_en/gonen539_p16.png',
      '/assets/manga/usogui_en/gonen_539_end_p02.png',
      '/assets/manga/usogui_en/gonen_539_end_p13.png',
      '/assets/manga/usogui_en/gonen_539_end_p17.png',
      '/assets/manga/extra_jp_en/usogui_gonen_panel.png',
      '/assets/manga/usogui_cn/cn_56.png',
      '/assets/manga/usogui_cn/cn_57.png',
      '/assets/manga/usogui_cn/cn_58.png',
      '/assets/manga/usogui_cn/cn_59.png',
      '/assets/manga/usogui_cn/cn_60.png',
      '/assets/manga/usogui_gonen.jpg',
    ],
    cardImagePosition: 'object-top',
  },

  // ==================== 《欺诈游戏》全 10 场 ====================
  'liar-round-one': {
    artworkUrl: '/assets/manga/liar_cn/r1_p010.webp',
    galleryUrls: [
      '/assets/manga/liar_cn/r1_p010.webp',
      '/assets/manga/liar_cn/r1_p022.webp',
      '/assets/manga/liar_cn/r1_p014.webp',
      '/assets/manga/liar_cn/r1_p018.webp',
      '/assets/manga/liar_cn/r1_p030.webp',
      '/assets/manga/liar_cn/r1_p050.webp',
      '/assets/manga/extra_jp_en/liar_r1_results_en.png',
      '/assets/manga/liar_round1.png',
    ],
    cardImagePosition: 'object-top',
  },
  'minority-rule': {
    artworkUrl: '/assets/manga/liar_cn/minority_p024.webp',
    galleryUrls: [
      '/assets/manga/liar_cn/minority_p024.webp',
      '/assets/manga/liar_cn/minority_p030.webp',
      '/assets/manga/liar_cn/minority_p036.webp',
      '/assets/manga/liar_cn/minority_p018.webp',
      '/assets/manga/liar_cn/minority_p012.webp',
      '/assets/manga/liar_cn/minority_p044.webp',
    ],
    cardImagePosition: 'object-center',
  },
  'liar-downsizing': {
    artworkUrl: '/assets/manga/liar_cn/downsizing_p088.webp',
    galleryUrls: [
      '/assets/manga/liar_cn/downsizing_p088.webp',
      '/assets/manga/liar_cn/downsizing_p082.webp',
      '/assets/manga/liar_cn/downsizing_p094.webp',
      '/assets/manga/liar_cn/downsizing_p100.webp',
      '/assets/manga/liar_cn/downsizing_p108.webp',
      '/assets/manga/liar_cn/downsizing_p118.webp',
    ],
    cardImagePosition: 'object-top',
  },
  'contraband-game': {
    artworkUrl: '/assets/manga/liar_cn/contraband_p112.webp',
    galleryUrls: [
      '/assets/manga/liar_cn/contraband_p112.webp',
      '/assets/manga/liar_cn/contraband_p090.webp',
      '/assets/manga/liar_cn/contraband_p096.webp',
      '/assets/manga/liar_cn/contraband_p104.webp',
      '/assets/manga/liar_cn/contraband_p080.webp',
      '/assets/manga/liar_cn/contraband_p125.webp',
    ],
    cardImagePosition: 'object-center',
  },
  'seventeen-poker': {
    artworkUrl: '/assets/manga/liar_cn/poker17_p120.webp',
    galleryUrls: [
      '/assets/manga/liar_cn/poker17_p120.webp',
      '/assets/manga/liar_cn/poker17_p138.webp',
      '/assets/manga/liar_cn/poker17_p128.webp',
      '/assets/manga/liar_cn/poker17_p150.webp',
      '/assets/manga/liar_cn/poker17_p105.webp',
      '/assets/manga/liar_cn/poker17_p112.webp',
    ],
    cardImagePosition: 'object-top',
  },
  'liar-russian-roulette': {
    artworkUrl: '/assets/manga/liar_cn/roulette_p126.webp',
    galleryUrls: [
      '/assets/manga/liar_cn/roulette_p126.webp',
      '/assets/manga/liar_cn/roulette_p145.webp',
      '/assets/manga/liar_cn/roulette_p134.webp',
      '/assets/manga/liar_cn/roulette_p110.webp',
      '/assets/manga/liar_cn/roulette_p118.webp',
      '/assets/manga/liar_cn/roulette_p160.webp',
      '/assets/manga/extra_jp_en/liar_24shot_en.png',
    ],
    cardImagePosition: 'object-bottom',
  },
  'liar-pandemic': {
    artworkUrl: '/assets/manga/liar_cn/pandemic_p138.webp',
    galleryUrls: [
      '/assets/manga/liar_cn/pandemic_p138.webp',
      '/assets/manga/liar_cn/pandemic_p120.webp',
      '/assets/manga/liar_cn/pandemic_p130.webp',
      '/assets/manga/liar_cn/pandemic_p146.webp',
      '/assets/manga/liar_cn/pandemic_p155.webp',
      '/assets/manga/liar_cn/pandemic_p165.webp',
    ],
    cardImagePosition: 'object-top',
  },
  'musical-chairs': {
    artworkUrl: '/assets/manga/liar_cn/chairs_p056.webp',
    galleryUrls: [
      '/assets/manga/liar_cn/chairs_p056.webp',
      '/assets/manga/liar_cn/chairs_p040.webp',
      '/assets/manga/liar_cn/chairs_p048.webp',
      '/assets/manga/liar_cn/chairs_p066.webp',
      '/assets/manga/liar_cn/chairs_p076.webp',
      '/assets/manga/liar_cn/chairs_p090.webp',
    ],
    cardImagePosition: 'object-center',
  },
  'liar-bid-poker': {
    artworkUrl: '/assets/manga/liar_cn/bidpoker_p018.webp',
    galleryUrls: [
      '/assets/manga/liar_cn/bidpoker_p018.webp',
      '/assets/manga/liar_cn/bidpoker_p048.webp',
      '/assets/manga/liar_cn/bidpoker_p010.webp',
      '/assets/manga/liar_cn/bidpoker_p026.webp',
      '/assets/manga/liar_cn/bidpoker_p036.webp',
      '/assets/manga/liar_cn/bidpoker_p060.webp',
    ],
    cardImagePosition: 'object-top',
  },
  'liar-four-kingdoms': {
    artworkUrl: '/assets/manga/liar_en/kingdoms183_p15.png',
    galleryUrls: [
      '/assets/manga/liar_en/kingdoms183_p15.png',
      '/assets/manga/liar_en/kingdoms184_p05.png',
      '/assets/manga/liar_en/kingdoms184_p13.png',
      '/assets/manga/liar_en/kingdoms182_p03.png',
      '/assets/manga/liar_en/kingdoms182_p07.png',
      '/assets/manga/liar_en/kingdoms182_p11.png',
      '/assets/manga/liar_en/kingdoms182_p15.png',
      '/assets/manga/liar_en/kingdoms183_p03.png',
      '/assets/manga/liar_en/kingdoms183_p07.png',
      '/assets/manga/liar_en/kingdoms183_p11.png',
      '/assets/manga/liar_en/kingdoms184_p09.png',
    ],
    cardImagePosition: 'object-center',
  },

  // ==================== 《赌博默示录》全 9 场 ====================
  'restricted-rps': {
    artworkUrl: '/assets/manga/kaiji_en/rps_v1_p131.png',
    galleryUrls: [
      '/assets/manga/kaiji_en/rps_v1_p131.png',
      '/assets/manga/kaiji_en/rps_v1_p149.png',
      '/assets/manga/kaiji_en/rps_v1_p116.png',
      '/assets/manga/kaiji_rps.jpg',
    ],
    cardImagePosition: 'object-top',
  },
  'kaiji-steel-beam': {
    artworkUrl: '/assets/manga/kaiji_steel_beam.jpg',
    galleryUrls: ['/assets/manga/kaiji_steel_beam.jpg'],
    cardImagePosition: 'object-center',
  },
  'e-card': {
    artworkUrl: '/assets/manga/kaiji_en/rps10_p15.png',
    galleryUrls: [
      '/assets/manga/kaiji_en/rps10_p15.png',
      '/assets/manga/kaiji_en/rps10_p19.png',
      '/assets/manga/kaiji_en/rps10_p10.png',
      '/assets/manga/kaiji_en/rps10_p05.png',
      '/assets/manga/kaiji_en/ecard_v7_p096.png',
      '/assets/manga/kaiji_en/ecard_v7_p116.png',
      '/assets/manga/kaiji_en/ecard_v7_p139.png',
      '/assets/manga/kaiji_ecard.jpg',
    ],
    cardImagePosition: 'object-center',
  },
  'kaiji-tissue-box': {
    artworkUrl: '/assets/manga/kaiji_en/tissue_v12_p056.png',
    galleryUrls: [
      '/assets/manga/kaiji_en/tissue_v12_p056.png',
      '/assets/manga/kaiji_en/tissue_v12_p081.png',
      '/assets/manga/kaiji_tissue.jpg',
    ],
    cardImagePosition: 'object-bottom',
  },
  'kaiji-chinchirorin': {
    artworkUrl: '/assets/manga/kaiji_en/chinchi_p011.png',
    galleryUrls: [
      '/assets/manga/kaiji_en/chinchi_p011.png',
      '/assets/manga/kaiji_en/chinchi_p017.png',
      '/assets/manga/kaiji_en/chinchi_p005.png',
      '/assets/manga/kaiji_chinchiro.png',
    ],
    cardImagePosition: 'object-center',
  },
  'the-bog-pachinko': {
    artworkUrl: '/assets/manga/kaiji_en/bog_p005.png',
    galleryUrls: [
      '/assets/manga/kaiji_en/bog_p005.png',
      '/assets/manga/kaiji_en/bog_p011.png',
      '/assets/manga/kaiji_en/bog_p017.png',
      '/assets/manga/kaiji_bog.jpg',
    ],
    cardImagePosition: 'object-top',
  },
  'minefield-mahjong-17-steps': {
    artworkUrl: '/assets/manga/kaiji_17steps.jpg',
    galleryUrls: ['/assets/manga/kaiji_17steps.jpg'],
    cardImagePosition: 'object-center',
  },
  'kaiji-salvation': {
    artworkUrl: '/assets/manga/kaiji_salvation.jpg',
    galleryUrls: ['/assets/manga/kaiji_salvation.jpg'],
    cardImagePosition: 'object-center',
  },
  'kaiji-one-poker': {
    artworkUrl: '/assets/manga/kaiji_one_poker.jpg',
    galleryUrls: ['/assets/manga/kaiji_one_poker.jpg'],
    cardImagePosition: 'object-center',
  },
};
