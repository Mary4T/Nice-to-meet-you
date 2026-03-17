import { useState } from 'react'
import { useGameStore } from '../../../core/store/gameStore'
import {
  MOCK_QUESTION,
  getSliderEffectOnStability,
} from '../data/mockQuestion'

export function CalibrationScreen() {
  const [sliderValue, setSliderValue] = useState(() => Math.floor(Math.random() * 12) + 1)
  const [optionsShown, setOptionsShown] = useState(false)
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | null>(null)
  const { updateValues, assignRandomGender, setPhase } = useGameStore()

  const handleSliderRelease = () => setOptionsShown(true)

  const handleSubmit = () => {
    if (selectedOption === null) return

    const option = MOCK_QUESTION.options.find((o) => o.id === selectedOption)!
    const sliderEffect = getSliderEffectOnStability(sliderValue)

    const coreUpdate: Record<string, number> = {
      Stability: 50 + sliderEffect + (option.effects.Stability ?? 0),
    }
    if (option.effects.Logic !== undefined) coreUpdate.Logic = 50 + option.effects.Logic

    const soulToxinsUpdate: Record<string, number> = {}
    if (option.effects.Hypocrisy !== undefined) soulToxinsUpdate.Hypocrisy = option.effects.Hypocrisy
    if (option.effects.Entropy !== undefined) soulToxinsUpdate.Entropy = option.effects.Entropy
    if (option.effects.Ruthlessness !== undefined) soulToxinsUpdate.Ruthlessness = option.effects.Ruthlessness

    updateValues({
      core: coreUpdate,
      ...(Object.keys(soulToxinsUpdate).length > 0 && { soulToxins: soulToxinsUpdate }),
    })

    assignRandomGender()
    setPhase('Lifetime')
  }

  return (
    <div className="h-screen min-h-0 overflow-hidden bg-slate-900 flex flex-col p-4">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden py-2">
      <div className="text-white max-w-lg w-full flex-shrink-0 max-h-full overflow-hidden">
        <h1 className="text-2xl font-bold mb-1">靈魂校準</h1>
        <p className="text-slate-400 text-sm mb-3">轉生大廳的壓力面試</p>

        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <p className="text-slate-300 mb-4">{MOCK_QUESTION.situation}</p>

          <div className="mb-4">
            <input
              type="range"
              min={1}
              max={12}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              onMouseUp={handleSliderRelease}
              onTouchEnd={handleSliderRelease}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {optionsShown && (
            <div className="space-y-2">
            <p className="text-slate-400 text-sm mb-2">選擇你的應對：</p>
            {MOCK_QUESTION.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selectedOption === opt.id
                    ? 'bg-amber-600 border-2 border-amber-400'
                    : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                }`}
              >
                <span className="font-medium">{opt.id}.</span> {opt.text}
              </button>
            ))}
          </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!optionsShown || selectedOption === null}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          確認並進入下一階段
         </button>
      </div>
      </div>
    </div>
  )
}
