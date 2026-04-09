/**
 * 階段二：現實生存 — 卡牌元件
 * 選項在固定位置，卡牌滑動時淡入
 * 磁吸十字軌道：思考圓內自由微移，出圓後鎖水平或垂直軸；回圓解鎖可重選
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

/** 四向選項帶寬度；略縮以讓整體較方 */
const REVEAL_ZONE = 62
/** 中間情境區：略寬、縮高，比例較接近方形 */
const CORE_WIDTH = 220
const CORE_HEIGHT = 224
/** 含四向選項區的外框寬高（供畫面排版、牌疊對齊） */
export const LIFETIME_CARD_WIDTH = CORE_WIDTH + REVEAL_ZONE * 2
export const LIFETIME_CARD_HEIGHT = CORE_HEIGHT + REVEAL_ZONE * 2

const CARD_WIDTH = LIFETIME_CARD_WIDTH
const CARD_HEIGHT = LIFETIME_CARD_HEIGHT
const THRESHOLD = 50

/** 思考圓半徑（px）：圓內自由移動，出圓後鎖軸 */
const THINKING_CIRCLE_RADIUS = 24
/** 鎖軸時，垂直於軸的分量收斂時間（約 2～3 帧） */
const AXIS_LOCK_BLEND_MS = 48

function clampDragOffset(n: number): number {
  return Math.max(-REVEAL_ZONE, Math.min(REVEAL_ZONE, n))
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

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

  const lockedAxisRef = useRef<'x' | 'y' | null>(null)
  const lockStartTimeRef = useRef<number | null>(null)
  const lockPerpAnchorRef = useRef(0)

  const upOpacity = useTransform(y, (v) => (v < 0 ? getRevealOpacity(v) : 0))
  const downOpacity = useTransform(y, (v) => (v > 0 ? getRevealOpacity(v) : 0))
  const leftOpacity = useTransform(x, (v) => (v < 0 ? getRevealOpacity(v) : 0))
  const rightOpacity = useTransform(x, (v) => (v > 0 ? getRevealOpacity(v) : 0))
  const situationOpacity = useTransform(
    [x, y],
    ([xv, yv]: number[]) => {
      const dist = Math.hypot(xv, yv)
      return 1 - Math.min(0.6, (dist / THRESHOLD) * 0.6)
    }
  )

  const handleDragStart = () => {
    lockedAxisRef.current = null
    lockStartTimeRef.current = null
    lockPerpAnchorRef.current = 0
  }

  /** 磁吸十字軌：圓內自由；出圓鎖主軸，副軸自錨點淡出；回圓解鎖 */
  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const ox = clampDragOffset(info.offset.x)
    const oy = clampDragOffset(info.offset.y)
    const dist = Math.hypot(ox, oy)
    const R = THINKING_CIRCLE_RADIUS

    if (dist <= R) {
      lockedAxisRef.current = null
      lockStartTimeRef.current = null
      x.set(ox)
      y.set(oy)
      return
    }

    if (lockedAxisRef.current === null) {
      lockedAxisRef.current = Math.abs(ox) > Math.abs(oy) ? 'x' : 'y'
      lockStartTimeRef.current = performance.now()
      lockPerpAnchorRef.current = lockedAxisRef.current === 'x' ? oy : ox
    }

    const start = lockStartTimeRef.current ?? performance.now()
    const t = Math.min(1, (performance.now() - start) / AXIS_LOCK_BLEND_MS)
    const blend = easeOutQuad(t)
    const perpFactor = 1 - blend
    const anchor = lockPerpAnchorRef.current

    if (lockedAxisRef.current === 'x') {
      x.set(ox)
      y.set(clampDragOffset(anchor * perpFactor))
    } else {
      y.set(oy)
      x.set(clampDragOffset(anchor * perpFactor))
    }
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
    if (disabled) return

    const dir = getRevealedDirection(x.get(), y.get())

    if (!dir) {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 })
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 })
      lockedAxisRef.current = null
      lockStartTimeRef.current = null
      return
    }

    onSelect(dir)
    x.set(0)
    y.set(0)
    lockedAxisRef.current = null
    lockStartTimeRef.current = null
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg"
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
        <span className="text-[11px] text-white/90 text-center">{card.down.text}</span>
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
        <span className="text-[11px] text-white/90 text-center">{card.up.text}</span>
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
        <span className="text-[11px] text-white/90 text-center">{card.right.text}</span>
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
        <span className="text-[11px] text-white/90 text-center">{card.left.text}</span>
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
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className="absolute bg-black rounded-lg shadow-2xl cursor-grab active:cursor-grabbing border-2 border-white/60 overflow-hidden z-10"
        whileTap={{ scale: 0.98 }}
      >
        {/* 情境描述：拖曳時變淡 */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-5"
          style={{ opacity: situationOpacity }}
        >
          <p className="text-[#E8E2D4] text-sm leading-relaxed text-center">
            {card.situation}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
