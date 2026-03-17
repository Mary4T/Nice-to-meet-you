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
  PHASES,
  GENDERS,
  VALUE_LIMITS,
  VITALITY_DISPLAY_ENTROPY_FACTOR,
  DEFAULT_CORE_VALUES,
  DEFAULT_DERIVED_VALUES,
  DEFAULT_SOUL_TOXINS,
  DEFAULT_SURFACE_VALUES,
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

/** 表 Vitality = 裏 Vitality + (壓抑熵 × 0.5) */
function calcDisplayVitality(realVitality: number, entropy: number): number {
  return Math.round(realVitality + entropy * VITALITY_DISPLAY_ENTROPY_FACTOR)
}

interface GameStore {
  phase: Phase
  gender: Gender | null
  inner: InnerValues
  surface: Record<SurfaceValue, number>

  setPhase: (phase: Phase) => void
  nextPhase: () => void
  assignGender: (gender: Gender) => void
  assignRandomGender: () => void
  updateValues: (updates: Partial<InnerValues> | Partial<Record<CoreValue | SoulToxin | SurfaceValue, number>>) => void
  getDisplayVitality: () => number
  resetGame: () => void
}

const initialInner: InnerValues = {
  core: { ...DEFAULT_CORE_VALUES },
  derived: { ...DEFAULT_DERIVED_VALUES },
  soulToxins: { ...DEFAULT_SOUL_TOXINS },
}

const initialSurface = { ...DEFAULT_SURFACE_VALUES }

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'Calibration',
  gender: null,
  inner: JSON.parse(JSON.stringify(initialInner)),
  surface: { ...initialSurface },

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
    }),
}))
