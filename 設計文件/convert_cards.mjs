/**
 * 卡牌資料轉換腳本
 * 讀取 卡牌資料.xlsx → 輸出 src/phases/02_Lifetime/data/cards.json
 *
 * 使用方式：在專案根目錄執行 npm run convert-cards
 */

import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── 路徑設定 ─────────────────────────────────────────────────
const EXCEL_PATH = path.join(__dirname, '卡牌資料.xlsx')
const OUTPUT_PATH = path.join(__dirname, '../src/phases/02_Lifetime/data/cards.json')

// ─── 年齡池中英對照 ────────────────────────────────────────────
const AGE_POOL_MAP = {
  '童年': 'childhood',
  '青年': 'youth',
  '中年': 'midlife',
  '老年': 'elder',
}

// ─── 方向中英對照 ──────────────────────────────────────────────
const DIRECTION_MAP = {
  '上': 'up',
  '下': 'down',
  '左': 'left',
  '右': 'right',
}

// ─── 數值欄位對照（Excel 欄名 → 程式欄名 + 類別） ─────────────
const VALUE_FIELDS = {
  '聲望':     { key: 'Reputation',  category: 'surface' },
  '金錢':     { key: 'Money',       category: 'surface' },
  '裏生命值': { key: 'Vitality',    category: 'core' },
  '穩定':     { key: 'Stability',   category: 'core' },
  '積極':     { key: 'Drive',       category: 'core' },
  '理性':     { key: 'Logic',       category: 'core' },
  '感性':     { key: 'Emotion',     category: 'core' },
  '偽善度':   { key: 'Hypocrisy',   category: 'soulToxins' },
  '冷血度':   { key: 'Ruthlessness',category: 'soulToxins' },
  '壓抑熵':   { key: 'Entropy',     category: 'soulToxins' },
  '靈魂完整度':{ key: 'soulIntegrity', category: 'soulIntegrity' },
}

// ─── 主程式 ────────────────────────────────────────────────────
function convert() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`找不到 Excel 檔案：${EXCEL_PATH}`)
    process.exit(1)
  }

  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  const cards = {}
  let currentCardId = null
  let currentSituation = ''
  let currentAgePool = ''

  for (const row of rows) {
    const rowCardId = String(row['卡ID'] || '').trim()
    const direction = DIRECTION_MAP[String(row['方向'] || '').trim()]

    // 新卡牌的第一行：更新情境和年齡池
    if (rowCardId && rowCardId !== currentCardId) {
      currentCardId = rowCardId
      currentSituation = String(row['情境'] || '').trim()
      const agePoolZh = String(row['年齡池'] || '').trim()
      currentAgePool = AGE_POOL_MAP[agePoolZh] || 'childhood'

      if (!cards[currentCardId]) {
        cards[currentCardId] = {
          id: currentCardId,
          agePool: currentAgePool,
          situation: currentSituation,
        }
      }
    }

    // 沒有有效的 cardId（第一張牌之前的空行）或方向無效則跳過
    if (!currentCardId || !direction) continue

    // 解析效果數值
    const effects = {}

    for (const [colName, { key, category }] of Object.entries(VALUE_FIELDS)) {
      const raw = row[colName]
      if (raw === '' || raw === null || raw === undefined) continue
      const val = Number(raw)
      if (isNaN(val) || val === 0) continue

      if (category === 'soulIntegrity') {
        effects.soulIntegrity = val
      } else {
        if (!effects[category]) effects[category] = {}
        effects[category][key] = val
      }
    }

    // 解析靈魂標記
    const tagsRaw = String(row['靈魂標記'] || '').trim()
    const soulTags = tagsRaw
      ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      : undefined

    // 解析後續事件
    const nextEventRaw = String(row['後續事件'] || '').trim()
    const nextEvent = nextEventRaw
      ? { type: 'storyChain', targetId: nextEventRaw }
      : undefined

    // 組合選項
    cards[currentCardId][direction] = {
      text: String(row['選項文字'] || '').trim(),
      effects,
      ...(soulTags && soulTags.length > 0 && { soulTags }),
      ...(nextEvent && { nextEvent }),
    }
  }

  // 驗證：每張卡必須有四個方向
  let hasError = false
  for (const [id, card] of Object.entries(cards)) {
    for (const dir of ['up', 'down', 'left', 'right']) {
      if (!card[dir]) {
        console.warn(`⚠️  卡牌 ${id} 缺少方向「${dir}」的選項`)
        hasError = true
      }
    }
  }

  const output = { cards }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8')

  const count = Object.keys(cards).length
  console.log(`✅ 轉換完成：共 ${count} 張卡牌 → ${OUTPUT_PATH}`)
  if (hasError) console.log('⚠️  有部分警告，請確認上方訊息')
}

convert()
