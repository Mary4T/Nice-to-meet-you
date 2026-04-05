import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LifetimeCard } from './LifetimeCard'
import { LifetimeDeckPile, DECK_VISIBLE_PEEK_HEIGHT } from './LifetimeDeckPile'
import { useGameStore } from '../../../core/store/gameStore'
import {
  LIFETIME_CARDS,
  FIRST_LIFETIME_CARD_ID,
  type CardOptionEffect,
} from '../data/cards'
import {
  createInitialDeckState,
  consumeMainQueue,
  isDayOver,
  startNewDay,
  type DeckState,
} from '../logic/deckEngine'
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

/**
 * 從牌疊「最上層／露出區上緣」起跳到主卡位（短位移），避免像從整疊底下抽出。
 */
const DEAL_FROM_DECK_TOP_Y = DECK_VISIBLE_PEEK_HEIGHT + 56

export function LifetimeScreen() {
  const [currentCardId, setCurrentCardId] = useState(FIRST_LIFETIME_CARD_ID)
  const [deckState, setDeckState] = useState<DeckState>(() =>
    createInitialDeckState(
      Object.keys(LIFETIME_CARDS).filter((id) => id !== FIRST_LIFETIME_CARD_ID)
    )
  )
  const [isAnimating, setIsAnimating] = useState(false)
  /** 僅在「抽到新主卡」時為 true，觸發由下往上發牌動畫 */
  const [dealFromDeck, setDealFromDeck] = useState(false)
  const dealUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearDealUnlockTimer = useCallback(() => {
    if (dealUnlockTimerRef.current) {
      clearTimeout(dealUnlockTimerRef.current)
      dealUnlockTimerRef.current = null
    }
  }, [])

  const { getDisplayVitality, surface, setPhase, advanceDay, day } = useGameStore()

  const finishDealFromDeck = useCallback(() => {
    clearDealUnlockTimer()
    setDealFromDeck(false)
    setIsAnimating(false)
  }, [clearDealUnlockTimer])

  /** 發牌入場 spring 約 400–600ms；逾時仍解鎖避免卡住 */
  useEffect(() => {
    if (!dealFromDeck) return
    clearDealUnlockTimer()
    dealUnlockTimerRef.current = setTimeout(() => {
      finishDealFromDeck()
    }, 720)
    return () => clearDealUnlockTimer()
  }, [currentCardId, dealFromDeck, clearDealUnlockTimer, finishDealFromDeck])

  const handleSelect = useCallback(
    (dir: Direction) => {
      if (isAnimating) return
      const current = LIFETIME_CARDS[currentCardId]
      if (!current) return
      const option = current[dir]
      if (!option) return

      setIsAnimating(true)
      applyCardEffects(option.effects)

      if (option.nextCardId === 'end') {
        setPhase('SnowTrain')
        setTimeout(() => setIsAnimating(false), 280)
      } else {
        const nextId = option.nextCardId
        setDeckState((s) => {
          let next = consumeMainQueue(s, nextId)
          if (isDayOver(next)) {
            const { state: afterDay } = startNewDay(next, day + 1)
            advanceDay()
            next = afterDay
          }
          return next
        })
        setDealFromDeck(true)
        setCurrentCardId(nextId)
      }
    },
    [currentCardId, isAnimating, setPhase, day, advanceDay]
  )

  const card = LIFETIME_CARDS[currentCardId]
  if (!card) return null

  const displayVitality = getDisplayVitality()

  const lifetimeCardData = {
    situation: card.situation,
    up: { text: card.up.text },
    down: { text: card.down.text },
    left: { text: card.left.text },
    right: { text: card.right.text },
  }

  const remainingInDeck = deckState.mainQueue.length

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

      {/*
        草圖結構：主卡在上方；牌疊貼在「此區塊」最底，只露出頂上一截（其餘在畫面下）
      */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          className="flex min-h-0 flex-1 items-start justify-center overflow-visible pt-4"
          style={{ paddingBottom: DECK_VISIBLE_PEEK_HEIGHT + 40 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardId}
              className="relative"
              initial={
                dealFromDeck
                  ? {
                      y: DEAL_FROM_DECK_TOP_Y,
                      opacity: 0.96,
                      scale: 1,
                    }
                  : false
              }
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: -24,
                transition: { duration: 0.2, ease: 'easeIn' },
              }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 32,
                mass: 0.85,
              }}
            >
              <LifetimeCard
                card={lifetimeCardData}
                onSelect={handleSelect}
                disabled={isAnimating}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
          <LifetimeDeckPile remainingInDeck={remainingInDeck} />
        </div>
      </div>
    </div>
  )
}
