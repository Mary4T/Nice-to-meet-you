import { useState } from 'react'
import { useGameStore } from '../../../core/store/gameStore'
import {
  MOCK_QUESTIONS,
  getSliderEffectOnStability,
} from '../data/mockQuestion'
import type { CoreValue, SoulToxin } from '../../../core/constants/gameConfig'

export function CalibrationScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sliderValue, setSliderValue] = useState(() => Math.floor(Math.random() * 12) + 1)
  const [optionsShown, setOptionsShown] = useState(false)
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | null>(null)

  const { inner, updateValues, assignRandomGender, setPhase } = useGameStore()
  const question = MOCK_QUESTIONS[currentIndex]
  const isLastQuestion = currentIndex === MOCK_QUESTIONS.length - 1

  const handleSliderRelease = () => setOptionsShown(true)

  const handleSubmit = () => {
    if (selectedOption === null) return

    const option = question.options.find((o) => o.id === selectedOption)!
    const sliderEffect = getSliderEffectOnStability(sliderValue)

    const coreUpdate: Partial<Record<CoreValue, number>> = {}
    const soulToxinsUpdate: Partial<Record<SoulToxin, number>> = {}

    // Stability 同時受滑桿和選項影響
    coreUpdate.Stability = inner.core.Stability + sliderEffect + (option.effects.Stability ?? 0)

    // 其餘核心數值只受選項影響
    const otherCoreKeys: CoreValue[] = ['Drive', 'Logic', 'Emotion', 'Vitality']
    for (const k of otherCoreKeys) {
      if (option.effects[k] !== undefined) {
        coreUpdate[k] = inner.core[k] + option.effects[k]!
      }
    }

    // 靈魂毒素
    const toxinKeys: SoulToxin[] = ['Hypocrisy', 'Ruthlessness', 'Entropy']
    for (const k of toxinKeys) {
      if (option.effects[k] !== undefined) {
        soulToxinsUpdate[k] = inner.soulToxins[k] + option.effects[k]!
      }
    }

    updateValues({
      core: coreUpdate as Record<CoreValue, number>,
      ...(Object.keys(soulToxinsUpdate).length > 0 && {
        soulToxins: soulToxinsUpdate as Record<SoulToxin, number>,
      }),
    })

    if (!isLastQuestion) {
      setCurrentIndex((i) => i + 1)
      setSliderValue(Math.floor(Math.random() * 12) + 1)
      setOptionsShown(false)
      setSelectedOption(null)
    } else {
      assignRandomGender()
      setPhase('Lifetime')
    }
  }

  return (
    <div className="h-screen min-h-0 overflow-hidden bg-soul-950 flex flex-col items-center justify-center p-5">

      {/* 頂部標記 */}
      <div className="text-center mb-6 w-full max-w-lg">
        <p className="text-gold-400 text-[10px] tracking-[0.4em] uppercase mb-2">
          靈魂考核系統 ── 轉生大廳
        </p>
        <div className="divider-gold" />
      </div>

      {/* 問卷卡片 */}
      <div className="w-full max-w-lg bg-soul-800 border border-soul-600/50 rounded-2xl overflow-hidden shadow-2xl">

        {/* 指標標題區 */}
        <div className="px-6 pt-5 pb-4 border-b border-soul-600/40">
          <p className="text-gold-400 text-xs tracking-widest mb-0.5">{question.indicatorLabel}</p>
          <p className="text-soul-300 text-sm">{question.indicatorSubtitle}</p>
        </div>

        <div className="px-6 py-5">
          {/* 情境描述 */}
          <p className="text-[#E8E2D4] text-[15px] leading-relaxed whitespace-pre-line mb-6">
            {question.situation}
          </p>

          {/* 痛感滑桿 */}
          <div className="mb-5">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-soul-300">幾乎無感</span>
              <span className="text-soul-300 tracking-widest">── 痛感強度 ──</span>
              <span className="text-soul-300">痛徹心扉</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              onMouseUp={handleSliderRelease}
              onTouchEnd={handleSliderRelease}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-soul-600"
            />
            {!optionsShown && (
              <p className="text-center text-soul-400 text-[11px] mt-2 tracking-wide">
                拉動滑桿，感受你內在的震盪強度
              </p>
            )}
          </div>

          {/* 三個應對選項 */}
          {optionsShown && (
            <div className="space-y-2.5">
              <p className="text-soul-300 text-[11px] tracking-widest mb-3">── 選擇你的應對方式 ──</p>
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-150 border ${
                    selectedOption === opt.id
                      ? 'bg-soul-700 border-gold-500/70 text-[#E8E2D4]'
                      : 'bg-soul-900/60 border-soul-600/40 text-soul-200 hover:border-soul-400/60 hover:bg-soul-700/50'
                  }`}
                >
                  <span className={`text-xs mr-2 font-mono ${selectedOption === opt.id ? 'text-gold-400' : 'text-soul-400'}`}>
                    {opt.id}.
                  </span>
                  <span className="text-sm leading-relaxed">{opt.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 底部：進度 + 按鈕 */}
      <div className="w-full max-w-lg mt-5 flex flex-col items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!optionsShown || selectedOption === null}
          className="w-full py-3 rounded-xl font-medium tracking-wider text-sm transition-all duration-150
            bg-gold-600 hover:bg-gold-500 text-soul-950
            disabled:bg-soul-700 disabled:text-soul-400 disabled:cursor-not-allowed"
        >
          {isLastQuestion ? '完成校準，進入現實' : '繼續下一題'}
        </button>

        <div className="flex items-center gap-2">
          {MOCK_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i < currentIndex
                  ? 'w-6 bg-gold-500'
                  : i === currentIndex
                  ? 'w-6 bg-gold-400'
                  : 'w-3 bg-soul-600'
              }`}
            />
          ))}
          <span className="text-soul-400 text-[10px] ml-1">
            {currentIndex + 1} / {MOCK_QUESTIONS.length}
          </span>
        </div>
      </div>

    </div>
  )
}
