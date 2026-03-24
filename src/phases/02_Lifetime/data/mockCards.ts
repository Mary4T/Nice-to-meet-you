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
      nextCardId: 'card_003',
    },
    down: {
      text: '裝作不知道',
      effects: { soulToxins: { Hypocrisy: 8 } },
      nextCardId: 'card_003',
    },
    left: {
      text: '保持距離專注工作',
      effects: { core: { Stability: 3 }, surface: { Reputation: 2 } },
      nextCardId: 'card_003',
    },
    right: {
      text: '找其他人訴苦',
      effects: { soulToxins: { Entropy: 5 } },
      nextCardId: 'card_003',
    },
  },
  card_003: {
    id: 'card_003',
    situation: '房東突然通知下月要漲租兩成。',
    up: {
      text: '立刻找新房',
      effects: { surface: { Money: -8 }, core: { Drive: 4 } },
      nextCardId: 'card_004',
    },
    down: {
      text: '先咬牙續租',
      effects: { soulToxins: { Hypocrisy: 3 }, surface: { Money: -5 } },
      nextCardId: 'card_004',
    },
    left: {
      text: '試著談判減幅',
      effects: { core: { Logic: 3 }, surface: { Reputation: 2 } },
      nextCardId: 'card_004',
    },
    right: {
      text: '上網發文抱怨',
      effects: { soulToxins: { Entropy: 4 }, surface: { Reputation: -2 } },
      nextCardId: 'card_004',
    },
  },
  card_004: {
    id: 'card_004',
    situation: '久未聯絡的朋友來借錢應急。',
    up: {
      text: '有多少借多少',
      effects: { surface: { Money: -15 }, core: { Emotion: 5 } },
      nextCardId: 'card_005',
    },
    down: {
      text: '婉拒並介紹資源',
      effects: { core: { Logic: 2 }, surface: { Reputation: 1 } },
      nextCardId: 'card_005',
    },
    left: {
      text: '直接拒絕',
      effects: { soulToxins: { Ruthlessness: 4 } },
      nextCardId: 'card_005',
    },
    right: {
      text: '假裝沒看到訊息',
      effects: { soulToxins: { Hypocrisy: 6 } },
      nextCardId: 'card_005',
    },
  },
  card_005: {
    id: 'card_005',
    situation: '週末被主管訊息要求臨時加班。',
    up: {
      text: '立刻回公司',
      effects: { surface: { Reputation: 4 }, core: { Drive: 3 } },
      nextCardId: 'end',
    },
    down: {
      text: '已讀不回明天再說',
      effects: { soulToxins: { Hypocrisy: 5 }, surface: { Reputation: -4 } },
      nextCardId: 'end',
    },
    left: {
      text: '電話說明無法前往',
      effects: { core: { Logic: 3 } },
      nextCardId: 'end',
    },
    right: {
      text: '答應但請調補休',
      effects: { surface: { Money: 2 }, soulToxins: { Entropy: 2 } },
      nextCardId: 'end',
    },
  },
}

export const FIRST_LIFETIME_CARD_ID = 'card_001'

/**
 * Mock 劇本預設出牌順序（含第一張主卡）。
 * 真實剩餘牌庫請用遊戲狀態 `deckRemaining`；洗牌／分支後應改寫該陣列，勿依賴此順序硬推。
 */
export const LIFETIME_PLAY_ORDER = [
  'card_001',
  'card_002',
  'card_003',
  'card_004',
  'card_005',
] as const

/** 進入階段二時：第一張主卡之後、尚未抽出的牌 id（依 LIFETIME_PLAY_ORDER） */
export function getInitialDeckRemaining(): string[] {
  return [...LIFETIME_PLAY_ORDER].slice(1)
}

/**
 * 【工具函式】僅依「每張牌的 up.next」一路往下推，列出若走主線時「當前主卡之後」會出現的 id。
 * 不代表玩家實際選擇後的牌序；實際剩餘張數與順序請以畫面上的 `deckRemaining` 狀態為準。
 */
export function getDeckQueueFromCurrent(currentCardId: string): string[] {
  const queue: string[] = []
  let id: string | undefined = currentCardId
  const seen = new Set<string>()

  while (id && !seen.has(id)) {
    seen.add(id)
    const current: LifetimeCard | undefined = MOCK_LIFETIME_CARDS[id]
    if (!current) break
    const nextId: string = current.up.nextCardId
    if (nextId === 'end' || !(nextId in MOCK_LIFETIME_CARDS)) break
    queue.push(nextId)
    id = nextId
  }
  return queue
}

/** 牌庫尚餘張數（推測用，走 up 主線）；UI 請用狀態中的 deckRemaining.length */
export function countRemainingInDeck(currentCardId: string): number {
  return getDeckQueueFromCurrent(currentCardId).length
}

/**
 * 抽到 nextId 後更新剩餘佇列：預設下一張在佇列頭則 pop；否則自該 id 截斷（支援之後分支合流）。
 */
export function consumeFromDeckQueue(queue: string[], drewId: string): string[] {
  if (queue.length === 0) return queue
  if (queue[0] === drewId) return queue.slice(1)
  const i = queue.indexOf(drewId)
  if (i >= 0) return queue.slice(i + 1)
  return queue
}
