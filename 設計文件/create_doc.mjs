import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat
} from 'docx';
import fs from 'fs';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function p(text) {
  return new Paragraph({ children: [new TextRun(text)] });
}
function pBold(label, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true }),
      new TextRun(text),
    ]
  });
}
function space() {
  return new Paragraph({ children: [new TextRun('')] });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((text, i) =>
      new TableCell({
        borders,
        width: { size: Math.floor(9026 / cells.length), type: WidthType.DXA },
        shading: isHeader
          ? { fill: '2C3E6B', type: ShadingType.CLEAR }
          : { fill: 'FFFFFF', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({ text, bold: isHeader, color: isHeader ? 'FFFFFF' : '000000' })]
        })]
      })
    )
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 24 } }
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: '1F3864' },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '2E5496' },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 }
      },
    ]
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [

      // 標題
      h1('雪天列車 — 補充設計決策'),
      pBold('文件說明：', '本文件記錄對話討論中確認的設計，內容有別於原始企劃書（雪天列車.docx）。兩份文件並行，以本文件為程式實作的依據。'),
      pBold('最後更新：', '2026-04-05'),
      space(),

      // 一、時間系統
      h1('一、時間系統'),

      h2('1-1 一天的定義'),
      p('主牌池：每天預設 3 張牌（DEFAULT_CARDS_PER_DAY = 3，可調整）。'),
      p('打完第 3 張後進入夜晚判斷，決定是否觸發夢境卡。'),
      space(),

      h2('1-2 故事鏈的天數'),
      p('故事鏈有自己獨立的天數計算，與主牌池的 3 張規則無關。'),
      p('故事鏈的每張牌可標記 endsDay: true，由故事鏈設計者決定哪張牌結束一天。'),
      p('範例：一個 10 張的故事鏈，第 2、5、9 張標記 endsDay，代表整個鏈跨越 3 天。'),
      space(),

      h2('1-3 年齡池切換閾值（綁定天數）'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2256, 2257, 4513],
        rows: [
          tableRow(['年齡池', '切換天數', '備註'], true),
          tableRow(['童年 Childhood', '第 0 天', '遊戲開始']),
          tableRow(['青年 Youth', '第 20 天', '可調整']),
          tableRow(['中年 Midlife', '第 50 天', '可調整']),
          tableRow(['老年 Elder', '第 80 天', '可調整']),
        ]
      }),
      space(),
      p('注意：年齡池以天數為準，不是年齡數值。玩家若在青年池死亡，不會進入中年池。'),
      space(),

      // 二、夢境卡機制
      h1('二、夢境卡機制（REM Dream Cards）'),

      h2('2-1 觸發條件'),
      p('壓抑熵（Entropy）達到 100 時，當晚強制觸發夢境卡序列。'),
      p('注意：Entropy 的觸發閾值為 100（不是 70 或其他數值）。'),
      space(),

      h2('2-2 觸發數量'),
      p('每次觸發固定 3 張夢境卡，依序進行。'),
      space(),

      h2('2-3 夢境卡牌庫來源'),
      p('夢境卡來自獨立的固定牌庫，與主牌池（160 張）完全分開，張數由劇情設計師決定。'),
      p('每張夢境牌標記一個觸發維度，對應裏數值的某個指標（穩定/積極/理性/感性/生命）。'),
      space(),

      h2('2-4 選牌邏輯（依玩家當前裏數值動態篩選）'),
      p('系統在觸發夢境卡時，依照以下步驟選出 3 張：'),
      space(),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('步驟一：找出玩家當前裏數值最低的 1～2 個維度')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('步驟二：從固定夢境牌庫中，撈出觸發維度符合的牌')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('步驟三：從符合的牌中隨機抽取')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('步驟四（補足）：若符合條件的牌不足 3 張，從其餘維度的牌補足至 3 張')] }),
      space(),

      h2('2-5 故事鏈中的處理'),
      p('若玩家正在故事鏈中且 Entropy 達到 100，不立即觸發夢境卡。'),
      p('等故事鏈完整結束後，才插入夢境卡序列。'),
      space(),

      h2('2-6 夢境卡的選項機制'),
      p('夢境卡與一般卡相同，使用四向滑動選項。'),
      p('玩家在夢境中對恐懼與慾望的選擇，會產生晨間殘留（Morning Buff/Debuff），影響隔天。'),
      space(),

      h2('2-7 夢境卡結束後'),
      p('根據玩家在夢境卡中的選擇，Entropy 可能降低、歸零、或維持不變。'),
      space(),

      // 三、晨間殘留
      h1('三、晨間殘留（Morning Buff / Debuff）'),

      h2('3-1 機制概述'),
      p('夢境卡結束後，玩家的選擇結果會以晨間殘留的形式影響隔天所有牌的效果。'),
      p('晨間殘留持續一天，天結束後自動清除。'),
      space(),

      h2('3-2 效果設計'),
      p('晨間殘留分為 Buff（正向）和 Debuff（負向），並有程度之分（輕度 / 中度 / 重度）。'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2256, 2257, 2257, 2256],
        rows: [
          tableRow(['程度', '正面效果', '負面效果', '壓力牌'], true),
          tableRow(['輕度 Buff', '× 1.1', '× 0.9', '無']),
          tableRow(['中度 Buff', '× 1.2', '× 0.8', '無']),
          tableRow(['重度 Buff', '× 1.3', '× 0.7', '無']),
          tableRow(['輕度 Debuff', '× 0.9', '× 1.1', '低機率']),
          tableRow(['中度 Debuff', '× 0.8', '× 1.2', '中機率']),
          tableRow(['重度 Debuff', '× 0.7', '× 1.3', '高機率']),
        ]
      }),
      space(),
      p('壓力牌：Debuff 狀態下，當天有機率從牌池額外插入一張難度較高的牌。'),
      space(),

      // 四、牌堆三層架構
      h1('四、牌堆三層架構（Deck Engine）'),

      h2('4-1 架構說明'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2500, 3263, 3263],
        rows: [
          tableRow(['層級', '名稱', '說明'], true),
          tableRow(['第一層', '主牌池（Age Pool）', '按年齡分區的正常牌庫，依天數切換童年/青年/中年/老年池']),
          tableRow(['第二層', '故事鏈緩衝區（Story Chain Buffer）', '特定選擇觸發的連續事件牌，插隊執行，結束後回到主牌池']),
          tableRow(['第三層', '延遲觸發排程（Future Trigger）', '玩家的某個選擇在未來某個時間點觸發對應牌卡']),
        ]
      }),
      space(),

      // 五、延遲觸發條件
      h1('五、延遲觸發條件類型'),
      p('Future Trigger 支援以下觸發條件，可單獨或組合使用：'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2500, 2263, 4263],
        rows: [
          tableRow(['條件類型', '說明', '範例'], true),
          tableRow(['天數觸發', '到達指定天數時觸發', '「30天後出現一張職場衝突牌」']),
          tableRow(['年齡池觸發', '進入指定年齡池時觸發', '「進入中年池時，出現父母生病的牌」']),
          tableRow(['數值閾值觸發', '某數值達到指定條件時觸發', '「Entropy ≥ 80 時插入一張夢魘警告牌」']),
          tableRow(['特殊旗標觸發', '特定牌卡事件發生後觸發', '「曾選擇離婚，N年後出現子女問題牌」']),
          tableRow(['組合條件', '多個條件的 AND / OR 組合', '「進入老年池 AND 曾選擇放棄健康」']),
        ]
      }),
      space(),

      // 六、待討論
      h1('六、待討論事項'),
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [new TextRun('壓力牌的具體觸發機率數值（輕/中/重 Debuff 各對應多少 %）')]
      }),
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [new TextRun('晨間殘留的程度如何由夢境卡的選擇結果決定（幾分得幾級）')]
      }),
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [new TextRun('Entropy 在夢境卡結束後的歸零/降低規則（哪個選項對應什麼結果）')]
      }),
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [new TextRun('特殊旗標（Flag）系統的具體資料結構設計')]
      }),
      new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [new TextRun('靈魂標記完整關鍵字清單（對應 32 對卦象，由劇本設計師與遊戲設計師共同制定）')]
      }),
      space(),

      // 七、牌卡選項格式與靈魂系統
      h1('七、牌卡選項格式與靈魂系統'),

      h2('7-0 設計邏輯（為什麼這樣設計）'),
      p('這段是給所有夥伴的說明，幫助理解整個靈魂系統的核心概念。'),
      space(),
      pBold('核心概念：', '階段一輸出的不只是數值，還有玩家「這一生的靈魂課題」。'),
      space(),
      p('例如：'),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('玩家 A 的課題 → 學會放下、服務他人')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('玩家 B 的課題 → 學會爭取、忠於自己')] }),
      space(),
      p('因此，同一張牌的同一個選項，對不同玩家的靈魂意義完全不同：'),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('對玩家 A 來說 →「忍氣吞聲」是靈魂在進步（符合「學會放下」的課題）')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('對玩家 B 來說 →「忍氣吞聲」是靈魂在逃避（違背「學會爭取」的課題）')] }),
      space(),
      pBold('因此卡牌效果分為兩層：', ''),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2263, 3000, 3763],
        rows: [
          tableRow(['層', '名稱', '說明'], true),
          tableRow(['第一層', '固定效果（對所有人一樣）', '例：選擇「忍氣吞聲」→ 聲望 +2，壓抑熵 +5']),
          tableRow(['第二層', '靈魂對齊效果（因人而異）', '系統根據玩家靈魂指紋判斷，此選擇對他是進步還是退步']),
        ]
      }),
      space(),
      pBold('劇本人員的工作分工：', ''),
      p('劇本人員不需要知道每位玩家的課題，只需要標記每個選項在靈魂層面代表的方向。'),
      space(),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('選項「忍氣吞聲」→ 標記為【放下】【服從】')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('選項「當場反駁」→ 標記為【爭取】【自我】')] }),
      space(),
      p('系統自動查詢玩家的靈魂指紋，判斷這個方向對這位玩家是成長還是退縮，並計算對應的影響。'),
      p('這樣劇本人員只需專注在「這個選擇代表什麼人生態度」，不需要為不同玩家寫不同版本。'),
      space(),

      h2('7-1 靈魂指紋與階段二的連結'),
      p('階段一（靈魂校準）輸出的是玩家的「靈魂指紋」，而非固定課題清單。'),
      p('靈魂指紋記錄 8 個指標各自的病灶位置（對應具體的爻位與防衛機制方向）。'),
      p('階段二的每張牌選項可標記靈魂關鍵字，系統自動比對玩家靈魂指紋，判斷此選擇對該玩家的靈魂意義。'),
      p('同一個選項對不同玩家可能代表「成長」或「退縮」，完全取決於各自的靈魂指紋。'),
      space(),

      h2('7-2 靈魂標記系統'),
      p('劇本人員為每個選項標記關鍵字，代表該選擇在靈魂層面的方向。'),
      p('標記採「完整版」，對應 32 對卦象，精準覆蓋 8 大指標的所有面向。'),
      p('系統後台維護一張對照表（由遊戲設計師定義）：關鍵字 → 指標 + 方向（成長/防衛/極端）。'),
      p('劇本人員只需從關鍵字清單中挑選，不需要理解易經結構。'),
      p('靈魂標記可以為空（代表此選項無靈魂層面意義，純屬生活事件）。'),
      space(),

      h2('7-3 靈魂完整度與靈魂成長的獨立性'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2263, 3381, 3382],
        rows: [
          tableRow(['', '靈魂成長系統', '靈魂完整度'], true),
          tableRow(['來源', '靈魂標記 × 玩家靈魂指紋', '寄生魂陷阱 / 特定選項']),
          tableRow(['影響', '裏層數值（間接）', '靈魂完整度數值直接增減']),
          tableRow(['觸發時機', '幾乎每張牌都可能觸發', '特定陷阱牌（奇怪課程、宇宙許願等）']),
          tableRow(['是否互斥', '兩套系統完全獨立，可同時存在於同一選項', '']),
        ]
      }),
      space(),

      h2('7-4 成長門檻機制（來自階段一校準結果）'),
      p('階段一的每個指標，根據玩家當時選擇的選項（A/B/C），決定該指標在階段二的「成長門檻」。'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [1500, 2000, 5526],
        rows: [
          tableRow(['校準選項', '成長門檻', '說明'], true),
          tableRow(['選項 C（成長跨越）', '低（Low）', '玩家已踏上成長路，最容易繼續；需較少次對齊選擇即可觸發靈魂成長效果']),
          tableRow(['選項 A（防衛機制）', '中（Medium）', '玩家陷在慣性中，需要一定次數的對齊選擇才能突破']),
          tableRow(['選項 B（走向極端）', '高（High）', '玩家偏離最遠，需要最多次對齊選擇才能觸發靈魂成長效果']),
        ]
      }),
      space(),
      pBold('門檻的運作方式（已確認）：', ''),
      p('門檻 = 玩家在階段二中，針對該指標需要做幾次「靈魂對齊選擇」，才能解鎖靈魂成長效果。'),
      p('換句話說，校準時選 B 的玩家，在這個指標上需要付出更多努力才能改變靈魂走向。'),
      space(),
      pBold('待確認：', '各門檻等級的具體次數（low=幾次、medium=幾次、high=幾次）尚未定義。'),
      space(),

      h2('7-5 靈魂指紋資料結構'),
      p('階段一結束後存入 gameStore，供階段二所有靈魂標記計算查詢。'),
      p('每個指標（共 8 個）記錄以下 5 個欄位：'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2500, 1500, 5026],
        rows: [
          tableRow(['欄位名稱', '資料型態', '說明'], true),
          tableRow(['indicatorId', '1–8', '指標編號']),
          tableRow(['hexagramPair', '字串', '本次隨機抽到的卦象對 ID']),
          tableRow(['sliderValue', '1–12', '玩家的滑桿位置，對應病灶爻位']),
          tableRow(['chosenOption', 'A / B / C', '玩家選擇的選項（必須記錄，影響成長門檻）']),
          tableRow(['growthThreshold', 'low / medium / high', '由 chosenOption 衍生：C→low、A→medium、B→high']),
        ]
      }),
      space(),

      h2('7-6 最終卡牌選項格式（7 個格子）'),
      p('每張牌有四個方向選項（上/下/左/右），每個選項包含以下格子：'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2263, 2263, 4500],
        rows: [
          tableRow(['格子', '是否必填', '說明'], true),
          tableRow(['文字', '必填', '選項顯示給玩家看的文字']),
          tableRow(['表數值效果', '可空', '聲望、金錢的加減量（生命值為計算值，不直接加減）']),
          tableRow(['裏數值效果', '可空', '裏生命值、穩定、積極、理性、感性的加減量（精神力與幸運值為衍生值，不直接加減）']),
          tableRow(['靈魂毒素', '可空', '偽善度、冷血度、壓抑熵的加減量']),
          tableRow(['靈魂完整度', '可空', '正負數值，負數代表寄生魂陷阱']),
          tableRow(['靈魂標記', '可空', '關鍵字列表，空白代表此選項無靈魂意義']),
          tableRow(['後續事件', '可空', '空白=從年齡池正常繼續；或指定故事鏈/排程未來牌']),
        ]
      }),
      space(),
      p('所有格子除「文字」外皆可空白，任意組合皆合法。'),
      p('靈魂標記與靈魂完整度可同時存在於同一選項（不互斥）。'),
      space(),

      // 八、靈魂成長追蹤系統
      h1('八、靈魂成長追蹤系統'),

      h2('8-0 系統概述'),
      p('靈魂對齊選擇觸發兩個完全獨立的機制，同時運行：'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2263, 2263, 4500],
        rows: [
          tableRow(['機制', '作用對象', '說明'], true),
          tableRow(['靈魂成長進度追蹤', '每個指標個別計算', '記錄玩家在該課題的進步/退步狀態，達門檻後觸發過關']),
          tableRow(['裏數值微量累積', '穩定/積極/理性/感性/生命', '每次對齊選擇讓裏數值產生微小位移，長期積累可感知']),
        ]
      }),
      space(),
      p('注意：這兩個機制互相獨立，但都對雪天列車的牌卡生成有影響。'),
      space(),

      h2('8-1 靈魂成長進度追蹤器（Soul Growth Tracker）'),
      p('每個指標（共 8 個）各自維護一個獨立的進度追蹤器。'),
      p('每次玩家做出有靈魂標記的選擇，系統對比靈魂指紋，判斷此次選擇的方向：'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2500, 6526],
        rows: [
          tableRow(['狀態', '說明'], true),
          tableRow(['進步（Progress）', '選擇方向與該指標的成長方向相符，進度累加']),
          tableRow(['退步（Regress）', '選擇方向與成長方向相反，進度扣減']),
          tableRow(['不變（Neutral）', '此選項無靈魂標記，或標記方向與該指標無關，進度不動']),
          tableRow(['過關（Passed）', '進度累計達到成長門檻（growthThreshold），觸發過關事件']),
        ]
      }),
      space(),
      pBold('過關後的效果：', ''),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('第二階段：此課題的牌卡不再出現')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('雪天列車：不再出現與此課題相關的劇烈牌')] }),
      space(),

      h2('8-2 裏數值微量累積（Inner Value Micro-Delta）'),
      p('裏數值（穩定/積極/理性/感性/生命）對玩家完全不可見，也不設計讓玩家感知到。'),
      p('每次靈魂對齊選擇，除了更新進度追蹤器，同時對相關裏數值產生微小的加減量。'),
      p('裏數值長期積累後，會影響雪天列車的牌卡生成內容（詳見 8-4）。'),
      space(),
      pBold('設計意圖：', '測試人性本質。玩家看不到裏數值，只能感受到雪天列車帶來的結果。'),
      space(),

      h2('8-3 第二階段：課題牌的出現規則'),
      p('玩家在某個指標上若尚未「過關」，無論當前狀態是「進步」或「退步」，相同課題的牌卡都會持續出現於第二階段。'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2263, 3381, 3382],
        rows: [
          tableRow(['進度狀態', '第二階段是否繼續出現此課題牌', '說明'], true),
          tableRow(['過關（Passed）', '否', '課題完成，不再出現']),
          tableRow(['進步（Progress）', '是', '還沒過關，繼續面對同一課題']),
          tableRow(['退步（Regress）', '是', '同上，方向不影響是否繼續出現']),
        ]
      }),
      space(),
      p('這是刻意的設計：人生不會因為「走對方向了」就立刻消除挑戰，需要持續積累才能真正過關。'),
      space(),

      h2('8-4 雪天列車：牌卡生成的雙驅動邏輯'),
      p('雪天列車的牌卡由兩個維度共同決定：'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2500, 2263, 4263],
        rows: [
          tableRow(['驅動維度', '資料來源', '影響'], true),
          tableRow(['靈魂成長狀態', '成長進度追蹤器（過關/進步/退步）', '過關→不出現課題牌；進步/退步→出現更劇烈的同類牌']),
          tableRow(['裏層數值', '裏數值微量累積結果', '影響劇烈牌的具體類型與強度']),
        ]
      }),
      space(),
      pBold('劇烈牌觸發條件（已確認）：', ''),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('過關 → 後續不再出現此課題的相關牌') ] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('進步 → 雪天列車出現更劇烈的同類牌（成長的代價，更高層次的考驗）')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('退步 → 進度條後退 + 雪天列車出現更劇烈的同類牌（沒有正視課題的後果）')] }),
      space(),

      h2('8-5 MVP 範圍調整'),
      pBold('已移除功能：', '壯年/老年出現劇烈牌的特殊設定'),
      p('原本計劃在壯年和老年年齡池為部分指標引入特別激烈的牌卡，但為了控制 MVP 複雜度，此功能暫時移除。'),
      p('劇烈牌的觸發統一由上方 8-4 的雙驅動邏輯決定，不再依年齡池額外加成。'),
      space(),

      // 九、完整數值系統
      h1('九、完整數值系統'),

      h2('9-1 表數值（玩家可見，共 3 個）'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2500, 2263, 4263],
        rows: [
          tableRow(['名稱', '英文', '說明'], true),
          tableRow(['生命值', 'Vitality', '顯示給玩家的生命值，為計算值（見下方公式）']),
          tableRow(['社會聲望', 'Reputation', '外在評價與地位，可直接由卡牌加減']),
          tableRow(['金錢', 'Money', '可直接由卡牌加減']),
        ]
      }),
      space(),
      pBold('生命值公式：', '生命值 = 裏生命值 + （壓抑熵 × 0.5）'),
      p('注意：壓抑熵越高，玩家看到的生命值會虛高——但真實生命（裏生命值）可能已在流失。'),
      space(),

      h2('9-2 裏數值（玩家不可見，共 7 個）'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2000, 2000, 2263, 2763],
        rows: [
          tableRow(['名稱', '英文', '類型', '說明'], true),
          tableRow(['裏生命值', 'hide Vitality', '直接加減', '真實生命值，由卡牌選項直接影響']),
          tableRow(['穩定', 'Stability', '直接加減', '由卡牌選項直接影響']),
          tableRow(['積極', 'Drive', '直接加減', '由卡牌選項直接影響']),
          tableRow(['理性', 'Logic', '直接加減', '由卡牌選項直接影響']),
          tableRow(['感性', 'Emotion', '直接加減', '由卡牌選項直接影響']),
          tableRow(['精神力', 'Mental', '衍生值', '由公式計算，不可直接加減']),
          tableRow(['幸運值', 'Luck', '衍生值', '由公式計算，不可直接加減']),
        ]
      }),
      space(),
      pBold('精神力公式：', 'Mental = 穩定 × 0.5 + 積極 × 0.3 − 壓抑熵 × 0.2　（上下限 0–100）'),
      p('作用：當卡牌選項扣減裏生命值時，精神力提供傷害緩衝。'),
      p('實際扣血公式：實際扣血 = 原始傷害 × (1 − Mental/100 × 0.5)'),
      p('Mental = 100 時扣血減半；Mental = 0 時全額扣血。'),
      space(),
      pBold('幸運值公式：', 'Luck = 穩定 × 0.3 + 積極 × 0.3 + 理性 × 0.2 + 感性 × 0.2 − 冷血度 × 1　（上下限 0–100）'),
      p('作用：影響有利故事的觸發概率，以及困難卡牌出現化險為夷選項的機率。'),
      p('冷血度越高，幸運值越低；冷血度滿（100）時幸運值封頂在 0，無論其他數值多高。'),
      space(),

      h2('9-3 靈魂毒素（後台隱藏，共 3 個）'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2000, 2500, 4526],
        rows: [
          tableRow(['名稱', '英文', '說明'], true),
          tableRow(['偽善度', 'Hypocrisy', '影響表數值的欺騙性、引來餓鬼 NPC']),
          tableRow(['冷血度', 'Ruthlessness', '為了生存不擇手段的程度，直接打壓幸運值']),
          tableRow(['壓抑熵', 'Entropy', '累積滿 100 強制觸發夢境卡；同時讓生命值顯示虛高']),
        ]
      }),
      space(),

      h2('9-4 靈魂完整度（Soul Integrity）'),
      p('初始值：100%。所有人出生靈魂都是完整的。'),
      space(),
      p('降低靈魂完整度的原因（三種）：'),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('玩家主動賣掉靈魂（選擇寄生魂陷阱的捷徑選項）')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('被寄生魂纏上並吃掉部分靈魂（特定觸發事件）')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('被他人下咒（特定卡牌事件）')] }),
      space(),
      p('靈魂完整度回升的條件（唯一途徑）：'),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('花錢找驅魔師，並正確配合，才有【機會】回升')] }),
      new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: [new TextRun('找錯驅魔師：可能無效，也可能讓完整度進一步降低（有風險）')] }),
      p('因此卡牌選項中靈魂完整度可以是正值（驅魔成功）或負值（被侵蝕），兩者皆合法。'),
      space(),
      pBold('重要概念：', '宇宙只是一個空間，沒有靈性能量，也沒有「宇宙眷顧」這回事。隨便連結宇宙很容易連結到寄生魂。不去碰這些東西，靈魂完整度就會維持在 100%。'),
      p('靈魂完整度與靈魂成長（課題過關）是完全獨立的兩套系統——靈魂成長代表你這一生學到了什麼，靈魂完整度代表你的靈魂有沒有被侵蝕。'),
      space(),

      h2('9-5 裏生命值歸零的處理'),
      p('裏生命值歸零時，玩家強制進入階段三（雪天列車），無論當前處於第幾天或哪個年齡池。'),
      p('這代表玩家在現實階段中途死亡，提前被拉入中陰身審判。'),
      space(),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('D:/APP/Nice to meet you/設計文件/補充設計決策.docx', buffer);
  console.log('建立完成');
});
