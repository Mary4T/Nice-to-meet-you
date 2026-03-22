/**
 * 雪天列車 Mock 卡牌（骨架用，之後擴充為 20 張）
 * 數值為 delta（增減量）
 */

import type { CoreValue, SoulToxin, SurfaceValue } from '../../../core/constants/gameConfig'

export interface CardOptionEffect {
  core?: Partial<Record<CoreValue, number>>
  soulToxins?: Partial<Record<SoulToxin, number>>
  surface?: Partial<Record<SurfaceValue, number>>
}

export interface CardOption {
  text: string
  effects: CardOptionEffect
  nextCardId: string
}

export interface SnowTrainCard {
  id: string
  situation: string
  up: CardOption
  down: CardOption
  left: CardOption
  right: CardOption
}

export const MOCK_SNOW_TRAIN_CARDS: Record<string, SnowTrainCard> = {
  snow_001: {
    id: 'snow_001',
    situation: '車廂裡有人向你討食物，你只剩最後一口。',
    up: {
      text: '全部給他',
      effects: { core: { Vitality: -10 }, soulToxins: { Hypocrisy: -2 } },
      nextCardId: 'snow_002',
    },
    down: {
      text: '拒絕',
      effects: { soulToxins: { Ruthlessness: 5 } },
      nextCardId: 'snow_002',
    },
    left: {
      text: '分一半',
      effects: { core: { Vitality: -5 }, soulToxins: { Hypocrisy: -1 } },
      nextCardId: 'snow_002',
    },
    right: {
      text: '假裝沒聽見',
      effects: { soulToxins: { Hypocrisy: 3, Entropy: 2 } },
      nextCardId: 'snow_002',
    },
  },
  snow_002: {
    id: 'snow_002',
    situation: '有人指控你偷了物資，眾人圍了上來。',
    up: {
      text: '坦然接受搜查',
      effects: { core: { Stability: 5 } },
      nextCardId: 'end',
    },
    down: {
      text: '先發制人動手',
      effects: { soulToxins: { Ruthlessness: 10 } },
      nextCardId: 'end',
    },
    left: {
      text: '提出交換條件',
      effects: { soulToxins: { Hypocrisy: 5 } },
      nextCardId: 'end',
    },
    right: {
      text: '逃離車廂',
      effects: { soulToxins: { Entropy: 8 } },
      nextCardId: 'end',
    },
  },
}

export const FIRST_SNOW_TRAIN_CARD_ID = 'snow_001'
