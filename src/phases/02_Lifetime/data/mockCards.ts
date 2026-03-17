/**
 * 現實生存 Mock 卡牌（骨架用，之後擴充為 160 張）
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

export interface LifetimeCard {
  id: string
  situation: string
  up: CardOption
  down: CardOption
  left: CardOption
  right: CardOption
}

export const MOCK_LIFETIME_CARDS: Record<string, LifetimeCard> = {
  card_001: {
    id: 'card_001',
    situation: '主管在週會上當眾批評你的報告。',
    up: {
      text: '當場反駁',
      effects: { surface: { Reputation: -5 }, soulToxins: { Ruthlessness: 3 } },
      nextCardId: 'card_002',
    },
    down: {
      text: '低頭不語',
      effects: { soulToxins: { Hypocrisy: 5, Entropy: 3 } },
      nextCardId: 'card_002',
    },
    left: {
      text: '會後私下溝通',
      effects: { surface: { Reputation: 3 }, core: { Logic: 2 } },
      nextCardId: 'card_002',
    },
    right: {
      text: '辭職',
      effects: { surface: { Money: -20 }, soulToxins: { Entropy: 8 } },
      nextCardId: 'card_002',
    },
  },
  card_002: {
    id: 'card_002',
    situation: '同事在背後說你壞話，你聽到了。',
    up: {
      text: '直接對質',
      effects: { surface: { Reputation: -3 }, soulToxins: { Ruthlessness: 5 } },
      nextCardId: 'end',
    },
    down: {
      text: '裝作不知道',
      effects: { soulToxins: { Hypocrisy: 8 } },
      nextCardId: 'end',
    },
    left: {
      text: '保持距離專注工作',
      effects: { core: { Stability: 3 }, surface: { Reputation: 2 } },
      nextCardId: 'end',
    },
    right: {
      text: '找其他人訴苦',
      effects: { soulToxins: { Entropy: 5 } },
      nextCardId: 'end',
    },
  },
}

export const FIRST_LIFETIME_CARD_ID = 'card_001'
