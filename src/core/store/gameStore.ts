/**
 * 核心心跳：記錄三方角力（激素、靈魂毒素、意志）
 * 負責「切換階段」與數值管理
 */

import { create } from 'zustand'
import {
  type Phase,
  type Gender,
  type CoreValue,
  type DerivedValue,
  type SoulToxin,
  type SurfaceValue,
  type IndicatorId,
  type GrowthThreshold,
  type ChosenOption,
  type SoulGrowthStatus,
  PHASES,
  GENDERS,
  INDICATOR_IDS,
  VALUE_LIMITS,
  VITALITY_DISPLAY_ENTROPY_FACTOR,
  DEFAULT_CORE_VALUES,
  DEFAULT_DERIVED_VALUES,
  DEFAULT_SOUL_TOXINS,
  DEFAULT_SURFACE_VALUES,
  DEFAULT_SOUL_INTEGRITY,
  MENTAL_FORMULA,
  MENTAL_DAMAGE_REDUCTION_FACTOR,
  LUCK_FORMULA,
  GROWTH_THRESHOLD_COUNTS,
} from '../constants/gameConfig'

/** 後台數值（玩家不可見） */
export interface InnerValues {
  core: Record<CoreValue, number>
  derived: Record<DerivedValue, number>
  soulToxins: Record<SoulToxin, number>
}

/** 表層數值（玩家可見，除 Vitality 外直接使用） */
export interface SurfaceDisplayValues {
  Reputation: number
  Money: number
}

/** 靈魂指紋：每個指標的校準結果（階段一結束後寫入） */
export interface SoulIndicator {
  indicatorId: IndicatorId
  /** 本次隨機抽到的卦象對 ID */
  hexagramPair: string
  /** 玩家滑桿位置（1–12，對應病灶爻位） */
  sliderValue: number
  /** 玩家選擇的選項：C→低門檻 / A→中門檻 / B→高門檻 */
  chosenOption: ChosenOption
  /** 由 chosenOption 衍生：C→low, A→medium, B→high */
  growthThreshold: GrowthThreshold
}

/** 靈魂成長追蹤器：每個指標獨立記錄進度 */
export interface IndicatorGrowthTracker {
  indicatorId: IndicatorId
  /** 當前狀態 */
  status: SoulGrowthStatus
  /** 累積進步次數（退步時扣減，最小 0；達到 requiredCount 則過關） */
  progressCount: number
  /** 過關所需次數（由靈魂指紋的 growthThreshold 決定，Phase 1 後設定） */
  requiredCount: number
}

/** 晨間殘留：夢境卡結果給隔天的臨時 Buff/Debuff */
export interface MorningBuff {
  /** 影響當天所有牌效果的乘數偏移，正數 = Buff，負數 = Debuff */
  modifier: number
  /** 剩餘持續天數（每天結束 -1，歸零後清除） */
  daysRemaining: number
}

/** 表 Vitality = 裏 Vitality + (壓抑熵 × 0.5) */
function calcDisplayVitality(realVitality: number, entropy: number): number {
  return Math.round(realVitality + entropy * VITALITY_DISPLAY_ENTROPY_FACTOR)
}

/** 由核心裏數值與靈魂毒素計算衍生值（Mental、Luck） */
function computeDerived(
  core: Record<CoreValue, number>,
  toxins: Record<SoulToxin, number>,
): Record<DerivedValue, number> {
  const clamp = (v: number) => Math.max(VALUE_LIMITS.min, Math.min(VALUE_LIMITS.max, v))
  const mental = clamp(
    core.Stability * MENTAL_FORMULA.stabilityWeight +
    core.Drive    * MENTAL_FORMULA.driveWeight -
    toxins.Entropy * MENTAL_FORMULA.entropyPenaltyWeight,
  )
  const luck = clamp(
    core.Stability  * LUCK_FORMULA.stabilityWeight +
    core.Drive      * LUCK_FORMULA.driveWeight +
    core.Logic      * LUCK_FORMULA.logicWeight +
    core.Emotion    * LUCK_FORMULA.emotionWeight -
    toxins.Ruthlessness * LUCK_FORMULA.ruthlessPenaltyWeight,
  )
  return { Mental: Math.round(mental), Luck: Math.round(luck) }
}

/** 建立 8 個指標的初始成長追蹤器（未完成校準前 requiredCount 暫設 medium） */
function createInitialGrowthTrackers(): IndicatorGrowthTracker[] {
  return INDICATOR_IDS.map((id) => ({
    indicatorId: id,
    status: 'Neutral' as SoulGrowthStatus,
    progressCount: 0,
    requiredCount: GROWTH_THRESHOLD_COUNTS.medium,
  }))
}

interface GameStore {
  phase: Phase
  gender: Gender | null
  inner: InnerValues
  surface: Record<SurfaceValue, number>
  /** 靈魂完整度（0–100，初始 100） */
  soulIntegrity: number
  /** 當前天數（從 0 開始，每天結束 +1） */
  day: number
  /** 晨間殘留（夢境牌結果，null = 無效果） */
  morningBuff: MorningBuff | null
  /** 靈魂指紋（階段一完成後寫入，null = 尚未校準） */
  soulFingerprint: SoulIndicator[] | null
  /** 8 個指標各自的靈魂成長追蹤器 */
  soulGrowthTrackers: IndicatorGrowthTracker[]
  /** 裏生命值歸零時設為 true，觸發強制進入雪天列車 */
  forceSnowTrain: boolean

  setPhase: (phase: Phase) => void
  nextPhase: () => void
  assignGender: (gender: Gender) => void
  assignRandomGender: () => void
  updateValues: (updates: Partial<InnerValues> | Partial<Record<CoreValue | SoulToxin | SurfaceValue, number>>) => void
  updateSoulIntegrity: (delta: number) => void
  /** 推進一天：day +1，晨間殘留倒數 -1（歸零自動清除） */
  advanceDay: () => void
  /** 設定晨間殘留（夢境卡結束後呼叫） */
  setMorningBuff: (buff: MorningBuff | null) => void
  getDisplayVitality: () => number
  /** 寫入靈魂指紋並依 growthThreshold 更新各追蹤器的 requiredCount */
  setSoulFingerprint: (fingerprint: SoulIndicator[]) => void
  /**
   * 更新指定指標的成長追蹤器
   * @param delta 'progress' | 'regress' | 'neutral'
   */
  updateSoulGrowthTracker: (indicatorId: IndicatorId, delta: 'progress' | 'regress' | 'neutral') => void
  /**
   * 對裏生命值施加傷害（經精神力減免後扣血）
   * 歸零時自動設定 forceSnowTrain = true
   */
  applyVitalityDamage: (rawDamage: number) => void
  resetGame: () => void
}

const initialInner: InnerValues = {
  core: { ...DEFAULT_CORE_VALUES },
  derived: computeDerived(DEFAULT_CORE_VALUES, DEFAULT_SOUL_TOXINS),
  soulToxins: { ...DEFAULT_SOUL_TOXINS },
}

const initialSurface = { ...DEFAULT_SURFACE_VALUES }

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'Calibration',
  gender: null,
  inner: JSON.parse(JSON.stringify(initialInner)),
  surface: { ...initialSurface },
  soulIntegrity: DEFAULT_SOUL_INTEGRITY,
  day: 0,
  morningBuff: null,
  soulFingerprint: null,
  soulGrowthTrackers: createInitialGrowthTrackers(),
  forceSnowTrain: false,

  setPhase: (phase) => set({ phase }),

  nextPhase: () => {
    const { phase } = get()
    const idx = PHASES.indexOf(phase)
    if (idx < PHASES.length - 1) {
      set({ phase: PHASES[idx + 1] })
    }
  },

  assignGender: (gender) => set({ gender }),

  assignRandomGender: () => {
    const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)]
    set({ gender })
  },

  updateValues: (updates) => {
    const clamp = (v: number) => Math.max(VALUE_LIMITS.min, Math.min(VALUE_LIMITS.max, v))
    set((state) => {
      const next = {
        ...state,
        inner: {
          core: { ...state.inner.core },
          derived: { ...state.inner.derived },
          soulToxins: { ...state.inner.soulToxins },
        },
        surface: { ...state.surface },
      }
      if ('core' in updates && updates.core) {
        for (const k of Object.keys(updates.core!) as CoreValue[]) {
          if (updates.core![k] !== undefined)
            next.inner.core[k] = clamp(updates.core![k])
        }
      }
      if ('derived' in updates && updates.derived) {
        for (const k of Object.keys(updates.derived!) as DerivedValue[]) {
          if (updates.derived![k] !== undefined)
            next.inner.derived[k] = clamp(updates.derived![k])
        }
      }
      if ('soulToxins' in updates && updates.soulToxins) {
        for (const k of Object.keys(updates.soulToxins!) as SoulToxin[]) {
          if (updates.soulToxins![k] !== undefined)
            next.inner.soulToxins[k] = clamp(updates.soulToxins![k])
        }
      }
      if ('Reputation' in updates && updates.Reputation !== undefined)
        next.surface.Reputation = clamp(updates.Reputation)
      if ('Money' in updates && updates.Money !== undefined)
        next.surface.Money = clamp(updates.Money)
      return next
    })
  },

  updateSoulIntegrity: (delta) => {
    const clamp = (v: number) => Math.max(VALUE_LIMITS.min, Math.min(VALUE_LIMITS.max, v))
    set((state) => ({ soulIntegrity: clamp(state.soulIntegrity + delta) }))
  },

  advanceDay: () => {
    set((state) => {
      const nextDay = state.day + 1
      let nextBuff = state.morningBuff
      if (nextBuff) {
        const remaining = nextBuff.daysRemaining - 1
        nextBuff = remaining > 0 ? { ...nextBuff, daysRemaining: remaining } : null
      }
      return { day: nextDay, morningBuff: nextBuff }
    })
  },

  setMorningBuff: (buff) => set({ morningBuff: buff }),

  getDisplayVitality: () => {
    const { inner } = get()
    return calcDisplayVitality(inner.core.Vitality, inner.soulToxins.Entropy)
  },

  resetGame: () =>
    set({
      phase: 'Calibration',
      gender: null,
      inner: JSON.parse(JSON.stringify(initialInner)),
      surface: { ...initialSurface },
      soulIntegrity: DEFAULT_SOUL_INTEGRITY,
      day: 0,
      morningBuff: null,
    }),
}))
