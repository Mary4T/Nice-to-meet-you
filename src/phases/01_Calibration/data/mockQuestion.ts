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
  /** 考核指標標題（例：考核指標：恥 — 外在） */
  indicatorLabel: string
  /** 副標題說明 */
  indicatorSubtitle: string
  situation: string
  options: [CalibrationOption, CalibrationOption, CalibrationOption]
}

/** 滑桿 1–12 對 Stability 的影響：偏左(1–4)略降、偏右(9–12)略升 */
export function getSliderEffectOnStability(sliderValue: number): number {
  const center = 6.5
  return Math.round((sliderValue - center) * 3)
}

export const MOCK_QUESTIONS: CalibrationQuestion[] = [
  {
    id: 'calibration_001',
    indicatorLabel: '考核指標：恥（外在）',
    indicatorSubtitle: '跌倒後的修復方式',
    situation: '你在一次重要的場合說錯了話，傷了一個在乎你的人。\n事後的沉默，像一根針插在你們之間。',
    options: [
      {
        id: 'A',
        text: '那也不全是我的錯。當下情況複雜，他太敏感了。',
        effects: { Hypocrisy: 6, Entropy: 3 },
      },
      {
        id: 'B',
        text: '你連夜道歉、送禮、聯絡他身邊所有人，試圖讓那件事消失。',
        effects: { Ruthlessness: 2, Stability: -4, Emotion: 3 },
      },
      {
        id: 'C',
        text: '你找了個安靜的時間，承認自己錯了，聽他把話說完。',
        effects: { Stability: 4, Emotion: 5, Entropy: -2 },
      },
    ],
  },
  {
    id: 'calibration_002',
    indicatorLabel: '考核指標：廉（底線）',
    indicatorSubtitle: '原則的僵化與過度彈性',
    situation: '深夜，一個你不熟的人傳訊說遇到困難，需要你的幫助。\n你已經幫過他很多次，從未得到任何回應。明天你有重要的事。',
    options: [
      {
        id: 'A',
        text: '你還是回覆了。一邊幫一邊積著委屈，告訴自己這叫善良。',
        effects: { Hypocrisy: 5, Emotion: -3, Entropy: 4 },
      },
      {
        id: 'B',
        text: '封鎖他。有些人不值得你的善良，你早就知道了。',
        effects: { Ruthlessness: 6, Stability: 2, Emotion: -4 },
      },
      {
        id: 'C',
        text: '你直接說：這次我沒辦法。告訴他可以找誰，然後放下手機。',
        effects: { Stability: 4, Logic: 3, Drive: 2 },
      },
    ],
  },
]
