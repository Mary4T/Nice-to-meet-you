/**
 * 現實生存牌卡資料（純定義，無邏輯）
 * 數值為 delta（增減量）
 *
 * 卡牌內容由劇本人員填寫 設計文件/卡牌資料.xlsx，
 * 執行 npm run convert-cards 轉換為 cards.json，本檔從 JSON 匯入。
 */

import type { CoreValue, SoulToxin, SurfaceValue, AgePool } from '../../../core/constants/gameConfig'
import cardsData from './cards.json'

/** 靈魂標記關鍵字（例如：'放下'、'爭取'、'自我'） */
export type SoulTag = string

/** 後續事件類型 */
export type NextEventType = 'normal' | 'storyChain' | 'futureTrigger'

/**
 * 後續事件（undefined = 從年齡池正常繼續）
 * storyChain: targetId 為故事鏈 ID
 * futureTrigger: targetId 為延遲觸發排程 ID
 */
export interface NextEvent {
  type: Exclude<NextEventType, 'normal'>
  targetId: string
}

/**
 * 卡牌選項效果（除文字外皆可空）
 * 注意：精神力（Mental）與幸運值（Luck）為衍生值，不可直接加減，
 *       改為加減其來源數值（Stability / Drive / Logic / Emotion / Ruthlessness）
 */
export interface CardOptionEffect {
  /** 表數值效果（聲望、金錢） */
  surface?: Partial<Record<SurfaceValue, number>>
  /** 裏數值效果（裏生命值=Vitality、穩定、積極、理性、感性） */
  core?: Partial<Record<CoreValue, number>>
  /** 靈魂毒素（偽善度、冷血度、壓抑熵） */
  soulToxins?: Partial<Record<SoulToxin, number>>
  /** 靈魂完整度 delta（負=被侵蝕，正=驅魔回升） */
  soulIntegrity?: number
}

export interface CardOption {
  /** 顯示給玩家的選項文字 */
  text: string
  /** 數值效果 */
  effects: CardOptionEffect
  /** 靈魂標記關鍵字列表 */
  soulTags?: SoulTag[]
  /** 後續事件，undefined = 從年齡池正常繼續 */
  nextEvent?: NextEvent
}

export interface LifetimeCard {
  id: string
  /** 此卡屬於哪個年齡池 */
  agePool: AgePool
  situation: string
  up: CardOption
  down: CardOption
  left: CardOption
  right: CardOption
}

export const LIFETIME_CARDS: Record<string, LifetimeCard> =
  cardsData.cards as Record<string, LifetimeCard>

export const FIRST_LIFETIME_CARD_ID = Object.keys(LIFETIME_CARDS)[0]
