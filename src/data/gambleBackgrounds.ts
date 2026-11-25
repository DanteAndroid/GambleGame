import type { GambleBackgroundInfo } from '../types/gamble';
import { GAMBLE_BACKGROUNDS_ACMA } from './acmaGameBackgrounds';
import { GAMBLE_BACKGROUNDS_CORE } from './gambleBackgroundsCore';
import { GAMBLE_BACKGROUNDS_EXTRA } from './gambleBackgroundsExtra';

export const GAMBLE_BACKGROUNDS: Record<string, GambleBackgroundInfo> = {
  ...GAMBLE_BACKGROUNDS_CORE,
  ...GAMBLE_BACKGROUNDS_EXTRA,
  ...GAMBLE_BACKGROUNDS_ACMA,
};

export function getGambleBackground(gambleId: string): GambleBackgroundInfo | undefined {
  return GAMBLE_BACKGROUNDS[gambleId];
}
