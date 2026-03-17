/**
 * 全域常數：數值上下限、公式係數、階段定義
 */

/** 遊戲階段 */
export const PHASES = ['Calibration', 'Lifetime', 'SnowTrain', 'Autopsy'] as const
export type Phase = (typeof PHASES)[number]

/** 性別（階段一結束後隨機分配） */
export const GENDERS = ['male', 'female'] as const
export type Gender = (typeof GENDERS)[number]

/** 5 項核心數值（玩家不可見，來自校準 + 階段二選項） */
export const CORE_VALUES = ['Stability', 'Drive', 'Logic', 'Emotion', 'Vitality'] as const
export type CoreValue = (typeof CORE_VALUES)[number]

/** 2 項衍生數值（由 5 核心影響） */
export const DERIVED_VALUES = ['Mental', 'Luck'] as const
export type DerivedValue = (typeof DERIVED_VALUES)[number]

/** 3 項靈魂毒素（玩家不可見） */
export const SOUL_TOXINS = ['Hypocrisy', 'Ruthlessness', 'Entropy'] as const
export type SoulToxin = (typeof SOUL_TOXINS)[number]

/** 玩家可見的表層數值 */
export const SURFACE_VALUES = ['Reputation', 'Money'] as const
export type SurfaceValue = (typeof SURFACE_VALUES)[number]

/** 數值上下限（0–100，可依企劃調整） */
export const VALUE_LIMITS = {
  min: 0,
  max: 100,
} as const

/** 表 Vitality 公式：表 = 裏 + (壓抑熵 × 0.5) */
export const VITALITY_DISPLAY_ENTROPY_FACTOR = 0.5

/** 預設初始數值（校準前，可為 0 或中性值） */
export const DEFAULT_CORE_VALUES: Record<CoreValue, number> = {
  Stability: 50,
  Drive: 50,
  Logic: 50,
  Emotion: 50,
  Vitality: 50,
}

export const DEFAULT_DERIVED_VALUES: Record<DerivedValue, number> = {
  Mental: 50,
  Luck: 50,
}

export const DEFAULT_SOUL_TOXINS: Record<SoulToxin, number> = {
  Hypocrisy: 0,
  Ruthlessness: 0,
  Entropy: 0,
}

export const DEFAULT_SURFACE_VALUES: Record<SurfaceValue, number> = {
  Reputation: 50,
  Money: 50,
}
