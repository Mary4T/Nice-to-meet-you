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

/** 壓抑熵觸發夢境卡的閾值 */
export const ENTROPY_DREAM_THRESHOLD = 100

/** 靈魂完整度初始值 */
export const DEFAULT_SOUL_INTEGRITY = 100

/** 年齡池切換的天數閾值（綁定天數，非年齡值） */
export const AGE_POOL_THRESHOLDS = {
  childhood: 0,   // Day 0 起
  youth: 20,      // Day 20 起進入青年池
  midlife: 50,    // Day 50 起進入中年池
  elder: 80,      // Day 80 起進入老年池
} as const
export type AgePool = keyof typeof AGE_POOL_THRESHOLDS

/** 每天預設要打的牌數（不含故事鏈內部的天數計算） */
export const DEFAULT_CARDS_PER_DAY = 3

/** 每天晨間殘留 Buff/Debuff 的持續天數（預設當天結束清除） */
export const MORNING_BUFF_DURATION_DAYS = 1

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

// ─── 精神力（Mental）衍生公式係數 ────────────────────────────
/** Mental = Stability×w + Drive×w - Entropy×w */
export const MENTAL_FORMULA = {
  stabilityWeight: 0.5,
  driveWeight: 0.3,
  entropyPenaltyWeight: 0.2,
} as const

/** 精神力對裏生命值傷害的減免係數：實際傷害 = 原始 × (1 − Mental/100 × factor) */
export const MENTAL_DAMAGE_REDUCTION_FACTOR = 0.5

// ─── 幸運值（Luck）衍生公式係數 ──────────────────────────────
/** Luck = Stability×w + Drive×w + Logic×w + Emotion×w - Ruthlessness×w */
export const LUCK_FORMULA = {
  stabilityWeight: 0.3,
  driveWeight: 0.3,
  logicWeight: 0.2,
  emotionWeight: 0.2,
  ruthlessPenaltyWeight: 1.0,
} as const

// ─── 靈魂指紋相關型別 ─────────────────────────────────────────
export const INDICATOR_IDS = [1, 2, 3, 4, 5, 6, 7, 8] as const
export type IndicatorId = (typeof INDICATOR_IDS)[number]

/** 成長門檻等級（由階段一 chosenOption 決定：C→low, A→medium, B→high） */
export type GrowthThreshold = 'low' | 'medium' | 'high'

/** 階段一的三選一選項 */
export type ChosenOption = 'A' | 'B' | 'C'

/** 靈魂成長狀態（每個指標獨立追蹤） */
export type SoulGrowthStatus = 'Progress' | 'Regress' | 'Neutral' | 'Passed'

/**
 * 各門檻等級所需的累積進步次數（TBD，待夥伴確認具體數值）
 * low=3 / medium=6 / high=10 為暫定佔位值
 */
export const GROWTH_THRESHOLD_COUNTS: Record<GrowthThreshold, number> = {
  low: 3,
  medium: 6,
  high: 10,
}
