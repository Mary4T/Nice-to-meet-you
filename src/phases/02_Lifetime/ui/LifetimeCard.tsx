/**
 * 階段二：現實生存 — 卡牌元件
 * 選項在固定位置，卡牌滑動時淡入
 * 單軸拖曳、直式卡、情境文字拖曳時變淡
 */

import { useRef } from 'react'
import { motion, PanInfo, useMotionValue, animate, useTransform } from 'framer-motion'

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface LifetimeCardOption {
  text: string
}

export interface LifetimeCardData {
  situation: string
  up: LifetimeCardOption
  down: LifetimeCardOption
  left: LifetimeCardOption
  right: LifetimeCardOption
}

const REVEAL_ZONE = 70
const CARD_WIDTH = 200 + REVEAL_ZONE * 2
const CARD_HEIGHT = 280 + REVEAL_ZONE * 2
const THRESHOLD = 50
const DRAG_LOCK_THRESHOLD = 8

/** 依卡牌位移判斷露出的選項 */
function getRevealedDirection(x: number, y: number): Direction | null {
  const ax = Math.abs(x)
  const ay = Math.abs(y)
  if (ax < THRESHOLD && ay < THRESHOLD) return null
  if (ay >= ax) return y < 0 ? 'up' : 'down'
  return x < 0 ? 'left' : 'right'
}

/** 計算選項淡入程度 (0~1)，依拖曳距離 */
function getRevealOpacity(offset: number): number {
  return Math.min(1, Math.abs(offset) / THRESHOLD)
}

interface LifetimeCardProps {
  card: LifetimeCardData
  onSelect: (dir: Direction) => void
  disabled?: boolean
}

export function LifetimeCard({ card, onSelect, disabled }: LifetimeCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const lockAxisRef = useRef<'x' | 'y' | null>(null)

  const upOpacity = useTransform(y, (v) => (v < 0 ? getRevealOpacity(v) : 0))
  const downOpacity = useTransform(y, (v) => (v > 0 ? getRevealOpacity(v) : 0))
  const leftOpacity = useTransform(x, (v) => (v < 0 ? getRevealOpacity(v) : 0))
  const rightOpacity = useTransform(x, (v) => (v > 0 ? getRevealOpacity(v) : 0))
  const situationOpacity = useTransform(
    [x, y],
    ([xv, yv]: number[]) =>
      1 - Math.min(0.6, ((Math.abs(xv) + Math.abs(yv)) / THRESHOLD) * 0.6)
  )

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    let { x: ox, y: oy } = info.offset

    if (lockAxisRef.current === 'x') {
      oy = 0
    } else if (lockAxisRef.current === 'y') {
      ox = 0
    } else {
      if (Math.abs(ox) > DRAG_LOCK_THRESHOLD || Math.abs(oy) > DRAG_LOCK_THRESHOLD) {
        lockAxisRef.current = Math.abs(ox) >= Math.abs(oy) ? 'x' : 'y'
        if (lockAxisRef.current === 'x') oy = 0
        else ox = 0
      }
    }

    x.set(ox)
    y.set(oy)
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return
    lockAxisRef.current = null

    const dir = getRevealedDirection(info.offset.x, info.offset.y)

    if (!dir) {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 })
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 })
      return
    }

    onSelect(dir)
    x.set(0)
    y.set(0)
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      {/* 選項文字：固定位置，被卡牌遮住，滑動時淡入 */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-0"
        style={{
          top: 0,
          width: CARD_WIDTH,
          height: REVEAL_ZONE,
          opacity: downOpacity,
        }}
      >
        <span className="text-[11px] text-slate-200 text-center">{card.down.text}</span>
      </motion.div>
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-0"
        style={{
          bottom: 0,
          width: CARD_WIDTH,
          height: REVEAL_ZONE,
          opacity: upOpacity,
        }}
      >
        <span className="text-[11px] text-slate-200 text-center">{card.up.text}</span>
      </motion.div>
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0"
        style={{
          left: 0,
          width: REVEAL_ZONE,
          height: CARD_HEIGHT,
          opacity: rightOpacity,
        }}
      >
        <span className="text-[11px] text-slate-200 text-center">{card.right.text}</span>
      </motion.div>
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-0"
        style={{
          right: 0,
          width: REVEAL_ZONE,
          height: CARD_HEIGHT,
          opacity: leftOpacity,
        }}
      >
        <span className="text-[11px] text-slate-200 text-center">{card.left.text}</span>
      </motion.div>

      {/* 卡牌：較大，覆蓋選項，拖曳移開時露出 */}
      <motion.div
        drag={!disabled}
        dragConstraints={{
          left: -REVEAL_ZONE,
          right: REVEAL_ZONE,
          top: -REVEAL_ZONE,
          bottom: REVEAL_ZONE,
        }}
        dragElastic={0}
        dragMomentum={false}
        style={{
          x,
          y,
          left: 0,
          top: 0,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="absolute bg-slate-800 rounded-xl shadow-xl cursor-grab active:cursor-grabbing border border-slate-600 overflow-hidden z-10"
        whileTap={{ scale: 0.98 }}
      >
        {/* 情境描述：拖曳時變淡 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-5"
          style={{ opacity: situationOpacity }}
        >
          <p className="text-slate-200 text-sm leading-relaxed text-center">
            {card.situation}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
