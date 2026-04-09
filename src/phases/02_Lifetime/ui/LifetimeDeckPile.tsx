/**
 * 底部牌疊：與主卡同外框尺寸；層數＝真實剩餘張數（僅牌背，不預覽文字）。
 * 僅頂端一截在視窗內可見，其餘往螢幕下延伸。
 */

import { LIFETIME_CARD_WIDTH, LIFETIME_CARD_HEIGHT } from './LifetimeCard'

export const DECK_TOP_PEEK = 14

export const DECK_VISIBLE_PEEK_HEIGHT = 52

interface LifetimeDeckPileProps {
  /** 牌庫實際剩餘張數（與遊戲狀態 deckRemaining.length 一致） */
  remainingInDeck: number
}

export function LifetimeDeckPile({ remainingInDeck }: LifetimeDeckPileProps) {
  const w = LIFETIME_CARD_WIDTH
  const h = LIFETIME_CARD_HEIGHT

  const layers = Math.max(0, remainingInDeck)

  return (
    <div
      className="pointer-events-none flex w-full justify-center select-none"
      style={{ height: DECK_VISIBLE_PEEK_HEIGHT }}
      aria-hidden={layers === 0}
    >
      {layers > 0 ? (
        <div
          className="relative overflow-hidden rounded-t-lg"
          style={{
            width: w,
            height: DECK_VISIBLE_PEEK_HEIGHT,
          }}
        >
          {Array.from({ length: layers }, (_, fromFront) => {
            const top = fromFront * DECK_TOP_PEEK
            const zIndex = layers - 1 - fromFront
            return (
              <div
                key={fromFront}
                className="absolute left-0 rounded-lg border-2 border-white/60 bg-black shadow-md"
                style={{
                  width: w,
                  height: h,
                  top,
                  zIndex,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.35)',
                }}
              />
            )
          })}
        </div>
      ) : (
        <div
          className="h-full rounded-t-lg border-x-2 border-t-2 border-white/60 bg-black"
          style={{ width: w }}
        />
      )}
    </div>
  )
}
