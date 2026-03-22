import { useState } from 'react'
import { LifetimeCard } from './LifetimeCard'
import { useGameStore } from '../../../core/store/gameStore'
import {
  MOCK_LIFETIME_CARDS,
  FIRST_LIFETIME_CARD_ID,
  type CardOptionEffect,
} from '../data/mockCards'
import type { CoreValue, SoulToxin, SurfaceValue } from '../../../core/constants/gameConfig'
import type { Direction } from './LifetimeCard'

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

export function LifetimeScreen() {
  const [currentCardId, setCurrentCardId] = useState(FIRST_LIFETIME_CARD_ID)
  const [isAnimating, setIsAnimating] = useState(false)
  const { getDisplayVitality, surface, setPhase } = useGameStore()

  const card = MOCK_LIFETIME_CARDS[currentCardId]
  if (!card) return null

  const handleSelect = (dir: Direction) => {
    if (isAnimating) return
    const option = card[dir]
    if (!option) return

    setIsAnimating(true)
    applyCardEffects(option.effects)

    if (option.nextCardId === 'end') {
      setPhase('SnowTrain')
    } else {
      setCurrentCardId(option.nextCardId)
    }
    setTimeout(() => setIsAnimating(false), 300)
  }

  const displayVitality = getDisplayVitality()

  const lifetimeCardData = {
    situation: card.situation,
    up: { text: card.up.text },
    down: { text: card.down.text },
    left: { text: card.left.text },
    right: { text: card.right.text },
  }

  return (
    <div className="h-screen min-h-0 overflow-hidden bg-slate-900 flex flex-col p-4">
      {/* 表層儀表板 */}
      <div className="flex justify-between gap-4 mb-4 text-white flex-shrink-0">
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

      {/* 現實生存卡牌 */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <LifetimeCard
          key={currentCardId}
          card={lifetimeCardData}
          onSelect={handleSelect}
          disabled={isAnimating}
        />
      </div>
    </div>
  )
}
