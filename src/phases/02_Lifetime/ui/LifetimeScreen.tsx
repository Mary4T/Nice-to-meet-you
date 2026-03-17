import { useState, useRef } from 'react'
import { motion, PanInfo, useMotionValue, animate } from 'framer-motion'
import { useGameStore } from '../../../core/store/gameStore'
import {
  MOCK_LIFETIME_CARDS,
  FIRST_LIFETIME_CARD_ID,
  type CardOptionEffect,
} from '../data/mockCards'
import type { CoreValue, SoulToxin, SurfaceValue } from '../../../core/constants/gameConfig'

type Direction = 'up' | 'down' | 'left' | 'right'

function applyCardEffects(effects: CardOptionEffect) {
  const state = useGameStore.getState()
  const { inner, surface, updateValues } = state

  const coreUpdate: Partial<Record<CoreValue, number>> = {}
  if (effects.core) {
    for (const k of Object.keys(effects.core) as CoreValue[]) {
      coreUpdate[k] = inner.core[k] + effects.core[k]!
    }
  }

  const soulToxinsUpdate: Partial<Record<SoulToxin, number>> = {}
  if (effects.soulToxins) {
    for (const k of Object.keys(effects.soulToxins) as SoulToxin[]) {
      soulToxinsUpdate[k] = inner.soulToxins[k] + effects.soulToxins[k]!
    }
  }

  const surfaceUpdate: Partial<Record<SurfaceValue, number>> = {}
  if (effects.surface) {
    for (const k of Object.keys(effects.surface) as SurfaceValue[]) {
      surfaceUpdate[k] = surface[k] + effects.surface[k]!
    }
  }

  updateValues({
    ...(Object.keys(coreUpdate).length > 0 && { core: coreUpdate }),
    ...(Object.keys(soulToxinsUpdate).length > 0 && { soulToxins: soulToxinsUpdate }),
    ...surfaceUpdate,
  })
}

function getDirectionFromPoint(
  point: { x: number; y: number },
  zoneRefs: Record<Direction, HTMLDivElement | null>
): Direction | null {
  for (const dir of ['up', 'down', 'left', 'right'] as Direction[]) {
    const el = zoneRefs[dir]
    if (el) {
      const rect = el.getBoundingClientRect()
      if (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) {
        return dir
      }
    }
  }
  return null
}

export function LifetimeScreen() {
  const [currentCardId, setCurrentCardId] = useState(FIRST_LIFETIME_CARD_ID)
  const [highlightedDir, setHighlightedDir] = useState<Direction | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const zoneRefs = useRef<Record<Direction, HTMLDivElement | null>>({
    up: null,
    down: null,
    left: null,
    right: null,
  })
  const { getDisplayVitality, surface, setPhase } = useGameStore()

  const card = MOCK_LIFETIME_CARDS[currentCardId]
  if (!card) return null

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const dir = getDirectionFromPoint(info.point, zoneRefs.current)
    setHighlightedDir(dir)
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isAnimating) return
    const dir = getDirectionFromPoint(info.point, zoneRefs.current)
    setHighlightedDir(null)

    if (!dir) {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 })
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 })
      return
    }

    const option = card[dir]
    if (!option) return

    setIsAnimating(true)
    applyCardEffects(option.effects)
    x.set(0)
    y.set(0)

    if (option.nextCardId === 'end') {
      setPhase('SnowTrain')
    } else {
      setCurrentCardId(option.nextCardId)
    }
    setTimeout(() => setIsAnimating(false), 300)
  }

  const displayVitality = getDisplayVitality()

  return (
    <div className="h-screen min-h-0 overflow-hidden bg-slate-900 flex flex-col p-4">
      {/* 表層儀表板 */}
      <div className="flex justify-between gap-4 mb-4 text-white">
        <div className="bg-slate-800 rounded-lg px-4 py-2 flex-1 text-center">
          <p className="text-slate-400 text-xs">生命物資</p>
          <p className="font-semibold text-emerald-400">{displayVitality}</p>
        </div>
        <div className="bg-slate-800 rounded-lg px-4 py-2 flex-1 text-center">
          <p className="text-slate-400 text-xs">社會聲望</p>
          <p className="font-semibold text-amber-400">{surface.Reputation}</p>
        </div>
        <div className="bg-slate-800 rounded-lg px-4 py-2 flex-1 text-center">
          <p className="text-slate-400 text-xs">金錢</p>
          <p className="font-semibold text-amber-400">{surface.Money}</p>
        </div>
      </div>

      {/* 四向選項 + 直式卡牌：牌卡固定置中，選項以牌卡邊緣為基準、固定距離生成 */}
      <div className="flex-1 flex items-center justify-center min-h-[360px]">
        <div
          className="relative"
          style={{ width: 302, height: 306 }}
        >
          {/* 牌卡：固定置中 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              key={currentCardId}
              drag
              dragConstraints={{ left: -120, right: 120, top: -120, bottom: 120 }}
              dragElastic={0}
              dragMomentum={false}
              style={{ x, y }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              className="w-[110px] h-[170px] bg-slate-800 rounded-lg shadow-xl cursor-grab active:cursor-grabbing flex flex-col items-center justify-center p-4 border border-slate-600"
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-slate-200 text-sm leading-relaxed text-center">
                {card.situation}
              </p>
            </motion.div>
          </div>

          {/* 上：牌卡上方，固定間距 16px */}
          <div
            ref={(el) => { zoneRefs.current.up = el }}
            className={`absolute left-1/2 -translate-x-1/2 w-[80px] flex items-center justify-center p-3 rounded-lg transition-colors pointer-events-none ${highlightedDir === 'up' ? 'bg-amber-600/60 text-amber-100 ring-2 ring-amber-400' : 'bg-slate-700/60 text-slate-400'}`}
            style={{ top: 0, height: 52 }}
          >
            <span className="text-sm text-center leading-tight">{card.up.text}</span>
          </div>

          {/* 下：牌卡下方，固定間距 16px */}
          <div
            ref={(el) => { zoneRefs.current.down = el }}
            className={`absolute left-1/2 -translate-x-1/2 w-[80px] flex items-center justify-center p-3 rounded-lg transition-colors pointer-events-none ${highlightedDir === 'down' ? 'bg-amber-600/60 text-amber-100 ring-2 ring-amber-400' : 'bg-slate-700/60 text-slate-400'}`}
            style={{ bottom: 0, height: 52 }}
          >
            <span className="text-sm text-center leading-tight">{card.down.text}</span>
          </div>

          {/* 左：牌卡左側，固定間距 16px */}
          <div
            ref={(el) => { zoneRefs.current.left = el }}
            className={`absolute top-1/2 -translate-y-1/2 w-[80px] min-h-[52px] flex items-center justify-center p-3 rounded-lg transition-colors pointer-events-none ${highlightedDir === 'left' ? 'bg-amber-600/60 text-amber-100 ring-2 ring-amber-400' : 'bg-slate-700/60 text-slate-400'}`}
            style={{ left: 0 }}
          >
            <span className="text-sm text-center leading-tight">{card.left.text}</span>
          </div>

          {/* 右：牌卡右側，固定間距 16px */}
          <div
            ref={(el) => { zoneRefs.current.right = el }}
            className={`absolute top-1/2 -translate-y-1/2 w-[80px] min-h-[52px] flex items-center justify-center p-3 rounded-lg transition-colors pointer-events-none ${highlightedDir === 'right' ? 'bg-amber-600/60 text-amber-100 ring-2 ring-amber-400' : 'bg-slate-700/60 text-slate-400'}`}
            style={{ right: 0 }}
          >
            <span className="text-sm text-center leading-tight">{card.right.text}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
