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

  // 拖曳中只更新數值，放開後才顯示選項
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value))
  }

  const handleSliderRelease = () => {
    if (!optionsShown) setOptionsShown(true)
  }

  // 點選選項後直接送出，不需額外按鈕
  const handleOptionSelect = (optId: 'A' | 'B' | 'C') => {
    setSelectedOption(optId)

    const option = question.options.find((o) => o.id === optId)!
    const sliderEffect = getSliderEffectOnStability(sliderValue)

    const coreUpdate: Partial<Record<CoreValue, number>> = {}
    const soulToxinsUpdate: Partial<Record<SoulToxin, number>> = {}

    coreUpdate.Stability = inner.core.Stability + sliderEffect + (option.effects.Stability ?? 0)

    const otherCoreKeys: CoreValue[] = ['Drive', 'Logic', 'Emotion', 'Vitality']
    for (const k of otherCoreKeys) {
      if (option.effects[k] !== undefined) {
        coreUpdate[k] = inner.core[k] + option.effects[k]!
      }
    }

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
      // 短暫延遲讓玩家看到選中狀態，再切換下一題
      setTimeout(() => {
        setCurrentIndex((i) => i + 1)
        setSliderValue(Math.floor(Math.random() * 12) + 1)
        setOptionsShown(false)
        setSelectedOption(null)
      }, 300)
    } else {
      setTimeout(() => {
        assignRandomGender()
        setPhase('Lifetime')
      }, 300)
    }
  }

  return (
    <div className="min-h-screen sm:h-screen overflow-y-auto sm:overflow-hidden bg-black flex flex-col items-center justify-start sm:justify-center pt-8 sm:pt-0 p-5">

      {/* 頂部標記 */}
      <div className="text-center mb-3 sm:mb-6 w-full max-w-lg">
        <p className="text-white/90 text-[10px] tracking-[0.4em] uppercase mb-1.5 sm:mb-2">
          轉生大廳
        </p>
        <div className="h-px bg-white/15 w-full" />
      </div>

      {/* 問卷卡片 */}
      <div className="w-full max-w-lg bg-black border-2 border-white/60 rounded-2xl overflow-hidden">

        {/* 指標標題區 */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b-2 border-white/60">
          <p className="text-white/90 text-sm">{question.indicatorSubtitle}</p>
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-5">
          {/* 情境描述 */}
          <p className="text-white/95 text-[15px] leading-relaxed whitespace-pre-line mb-3 sm:mb-6">
            {question.situation}
          </p>

          {/* 痛感滑桿 */}
          <div className="mb-3 sm:mb-5">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-white/90">幾乎無感</span>
              <span className="text-white/90 tracking-widest">── 痛感強度 ──</span>
              <span className="text-white/90">痛徹心扉</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={sliderValue}
              onChange={handleSliderChange}
              onPointerUp={handleSliderRelease}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white"
            />
            {!optionsShown && (
              <p className="text-center text-white/60 text-[11px] mt-2 tracking-wide">
                拉動滑桿，感受你內在的震盪強度
              </p>
            )}
          </div>

          {/* 三個應對選項 */}
          {optionsShown && (
            <div className="space-y-2">
              <p className="text-white/60 text-[11px] tracking-widest mb-2">── 選擇你的應對方式 ──</p>
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionSelect(opt.id)}
                  disabled={selectedOption !== null}
                  className={`w-full p-2.5 sm:p-4 rounded-xl text-left transition-all duration-150 border ${
                    selectedOption === opt.id
                      ? 'bg-white/10 border-white/60 text-white/90'
                      : 'bg-transparent border-white/30 text-white/90 hover:border-white/50 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs mr-2 font-mono text-white/50">
                    {opt.id}.
                  </span>
                  <span className="text-sm leading-relaxed">{opt.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


    </div>
  )
}
