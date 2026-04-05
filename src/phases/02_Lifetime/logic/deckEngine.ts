/**
 * 牌堆引擎：管理出牌順序、年齡池切換、故事鏈、夢境卡觸發
 *
 * 設計規則：
 * - 年齡池依天數（day）切換，閾值定義在 gameConfig.AGE_POOL_THRESHOLDS
 * - 故事鏈有自己的天數計算，故事鏈內每張牌可以帶 dayAdvance（預設 0）
 * - 每天預設打 DEFAULT_CARDS_PER_DAY 張，打完進夜晚判斷
 * - Entropy 達 100 時，故事鏈外立即插入夢境卡；故事鏈內等鏈結束再觸發
 * - 夢境卡固定 3 張一組（REM_DREAM_CARD_COUNT）
 */

import { AGE_POOL_THRESHOLDS, DEFAULT_CARDS_PER_DAY, type AgePool } from '../../../core/constants/gameConfig'

export const REM_DREAM_CARD_COUNT = 3

/** 取得目前天數對應的年齡池 */
export function getAgePool(day: number): AgePool {
  if (day >= AGE_POOL_THRESHOLDS.elder) return 'elder'
  if (day >= AGE_POOL_THRESHOLDS.midlife) return 'midlife'
  if (day >= AGE_POOL_THRESHOLDS.youth) return 'youth'
  return 'childhood'
}

/** 牌堆狀態快照（由外部 store 或 component 持有） */
export interface DeckState {
  /** 主牌池中尚未出現的牌 id 列表 */
  mainQueue: string[]
  /** 故事鏈緩衝區（有值代表目前在故事鏈中） */
  storyChain: StoryChainState | null
  /** 延遲觸發排程（「N天後」或「進入某年齡池時」出現的牌） */
  futureQueue: FutureTrigger[]
  /** 今天已打的牌數（不含故事鏈內部天數計算） */
  cardsPlayedToday: number
  /** 是否需要觸發夢境卡（Entropy 達閾值時設為 true） */
  pendingDreamSequence: boolean
}

export interface StoryChainState {
  /** 故事鏈剩餘牌 id 序列 */
  remaining: string[]
  /** 故事鏈內部已過的天數（用來和主牌池 day 合計） */
  daysElapsedInChain: number
}

export interface FutureTrigger {
  cardId: string
  /** 'day' = 達到特定天數時觸發；'agePool' = 進入特定年齡池時觸發 */
  triggerType: 'day' | 'agePool'
  triggerValue: number | AgePool
}

/** 初始化牌堆狀態 */
export function createInitialDeckState(firstCardIds: string[]): DeckState {
  return {
    mainQueue: firstCardIds,
    storyChain: null,
    futureQueue: [],
    cardsPlayedToday: 0,
    pendingDreamSequence: false,
  }
}

/**
 * 進入故事鏈：把故事鏈牌序放入緩衝區
 * 故事鏈結束（remaining 空了）後，呼叫 exitStoryChain 回到主牌池
 */
export function enterStoryChain(state: DeckState, chainCardIds: string[]): DeckState {
  return {
    ...state,
    storyChain: { remaining: chainCardIds, daysElapsedInChain: 0 },
  }
}

/** 故事鏈內打完一張牌，並帶入這張牌是否推進了天數 */
export function advanceStoryChain(state: DeckState, dayAdvance: number): DeckState {
  if (!state.storyChain) return state
  const remaining = state.storyChain.remaining.slice(1)
  const daysElapsedInChain = state.storyChain.daysElapsedInChain + dayAdvance
  if (remaining.length === 0) {
    return { ...state, storyChain: null }
  }
  return {
    ...state,
    storyChain: { remaining, daysElapsedInChain },
  }
}

/** 主牌池消耗一張牌，並更新今日計數 */
export function consumeMainQueue(state: DeckState, cardId: string): DeckState {
  const idx = state.mainQueue.indexOf(cardId)
  const mainQueue = idx >= 0 ? [...state.mainQueue.slice(0, idx), ...state.mainQueue.slice(idx + 1)] : state.mainQueue
  return {
    ...state,
    mainQueue,
    cardsPlayedToday: state.cardsPlayedToday + 1,
  }
}

/** 判斷今天是否結束（達到每日預設牌數，且不在故事鏈中） */
export function isDayOver(state: DeckState): boolean {
  return state.storyChain === null && state.cardsPlayedToday >= DEFAULT_CARDS_PER_DAY
}

/** 推進到隔天：重置今日計數，並解鎖當天到期的 futureQueue */
export function startNewDay(state: DeckState, newDay: number): { state: DeckState; unlockedCards: string[] } {
  const unlockedCards: string[] = []
  const currentPool = getAgePool(newDay)
  const remainingFuture = state.futureQueue.filter((t) => {
    if (t.triggerType === 'day' && (t.triggerValue as number) <= newDay) {
      unlockedCards.push(t.cardId)
      return false
    }
    if (t.triggerType === 'agePool' && t.triggerValue === currentPool) {
      unlockedCards.push(t.cardId)
      return false
    }
    return true
  })
  return {
    state: {
      ...state,
      cardsPlayedToday: 0,
      futureQueue: remainingFuture,
      pendingDreamSequence: false,
    },
    unlockedCards,
  }
}

/** 標記需要觸發夢境牌序列 */
export function flagDreamSequence(state: DeckState): DeckState {
  return { ...state, pendingDreamSequence: true }
}

/** 排程一張牌在未來出現 */
export function scheduleFutureTrigger(state: DeckState, trigger: FutureTrigger): DeckState {
  return { ...state, futureQueue: [...state.futureQueue, trigger] }
}
