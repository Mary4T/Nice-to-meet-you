import { useGameStore } from './core/store/gameStore'
import { CalibrationScreen } from './phases/01_Calibration/ui/CalibrationScreen'
import { LifetimeScreen } from './phases/02_Lifetime/ui/LifetimeScreen'

function App() {
  const { phase, nextPhase, resetGame } = useGameStore()

  if (phase === 'Calibration') {
    return <CalibrationScreen />
  }

  if (phase === 'Lifetime') {
    return <LifetimeScreen />
  }

  return (
    <div className="h-screen min-h-0 overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <h1 className="text-3xl font-bold mb-4">Nice to meet you</h1>
        <p className="text-slate-400 mb-8">雪天列車 — 骨架測試</p>

        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <p className="text-slate-400 text-sm mb-2">目前階段</p>
          <p className="text-2xl font-semibold text-amber-200">{phase}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={nextPhase}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
          >
            下一階段
          </button>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors"
          >
            重新開始
          </button>
        </div>

        <p className="text-slate-500 text-xs mt-6">
          Calibration → Lifetime → SnowTrain → Autopsy
        </p>
      </div>
    </div>
  )
}

export default App
