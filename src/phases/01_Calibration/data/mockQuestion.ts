/**
 * 靈魂校準 Mock 題目（骨架用，之後擴充為 16 題）
 */

import type { CoreValue, SoulToxin } from '../../../core/constants/gameConfig'

export interface CalibrationOption {
  id: 'A' | 'B' | 'C'
  text: string
  effects: Partial<Record<CoreValue | SoulToxin, number>>
}

export interface CalibrationQuestion {
  id: string
  situation: string
  options: [CalibrationOption, CalibrationOption, CalibrationOption]
}

/** 滑桿 1–12 對 Stability 的影響：偏左(1–4)略降、偏右(9–12)略升 */
export function getSliderEffectOnStability(sliderValue: number): number {
  const center = 6.5
  return Math.round((sliderValue - center) * 3)
}

export const MOCK_QUESTION: CalibrationQuestion = {
  id: 'mock_001',
  situation: '同事在會議上搶了你的功勞，眾人都在等你的反應。',
  options: [
    {
      id: 'A',
      text: '忍氣吞聲，事後再說',
      effects: { Hypocrisy: 5, Stability: -3 },
    },
    {
      id: 'B',
      text: '當場翻桌，不幹了',
      effects: { Entropy: 5, Ruthlessness: 3 },
    },
    {
      id: 'C',
      text: '冷靜指出事實，要求澄清',
      effects: { Stability: 5, Logic: 3 },
    },
  ],
}
