/**
 * 階段三：雪天列車 — 開發中
 * 暫以佔位畫面顯示，之後實作 SnowTrainCard
 */

import { useGameStore } from '../../../core/store/gameStore'

export function SnowTrainScreen() {
  const { setPhase } = useGameStore()

  return (
    <div className="h-screen min-h-0 overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-4">
      <p className="text-slate-400 text-lg mb-6">雪天列車 — 開發中</p>
      <button
        onClick={() => setPhase('Autopsy')}
        className="px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium text-white transition-colors"
      >
        進入屍檢（測試用）
      </button>
    </div>
  )
}
