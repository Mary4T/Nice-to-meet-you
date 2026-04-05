import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat
} from 'docx';
import fs from 'fs';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const headerFill = '1F3864';
const subFill = '2E5496';
const altFill = 'EEF3FB';

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
  return new Paragraph({ children: [new TextRun({ text: label, bold: true }), new TextRun(text)] });
}
function space() { return new Paragraph({ children: [new TextRun('')] }); }
function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun(text)]
  });
}

function cell(text, opts = {}) {
  const { fill = 'FFFFFF', bold = false, color = '000000', width = 1500 } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold, color })] })]
  });
}

function headerRow(cells) {
  return new TableRow({
    children: cells.map(([text, width]) => cell(text, { fill: headerFill, bold: true, color: 'FFFFFF', width }))
  });
}
function dataRow(cells, shade = false) {
  return new TableRow({
    children: cells.map(([text, width]) => cell(text, { fill: shade ? altFill : 'FFFFFF', width }))
  });
}

// 8大指標資料
const indicators = [
  {
    dim: '【禮】邊界與自我', dimFill: '1F4E79',
    id: '指標1', name: '處理他人索求的能力', dir: '向外：邊界失守 vs. 絕對封閉',
    pairs: [
      ['小畜 vs. 履', '面對強勢', '隱忍吞聲 vs. 戰戰兢兢'],
      ['臨 vs. 觀', '面對失誤', '直升機救援 vs. 冷眼旁觀'],
      ['咸 vs. 恆', '面對情緒', '無邊界共情 vs. 絕對麻木'],
      ['家人 vs. 睽', '親疏遠近', '護短包庇 vs. 稍摩擦便決裂'],
    ]
  },
  {
    dim: '【禮】邊界與自我', dimFill: '1F4E79',
    id: '指標2', name: '處理自身特權的態度', dir: '向內：傲慢膨脹 vs. 失去自我',
    pairs: [
      ['乾 vs. 坤（錯卦）', '權力極端', '暴君式控制 vs. 討好型工具人'],
      ['同人 vs. 大有', '資源掌控', '假面平等 vs. 理所當然享特權'],
      ['謙 vs. 豫', '自我展現', '過度裝笨 vs. 仗聰明怠惰'],
      ['萃 vs. 升', '階級追求', '沉溺虛榮 vs. 極度階級焦慮'],
    ]
  },
  {
    dim: '【義】衝突決斷', dimFill: '833C00',
    id: '指標3', name: '面對摩擦的勇氣', dir: '事前：逃避退縮 vs. 無腦衝撞',
    pairs: [
      ['需 vs. 訟', '利益受損', '焦慮拖延 vs. 不擇手段爭吵'],
      ['遯 vs. 大壯', '派系鬥爭', '見光死退縮 vs. 無腦開砲'],
      ['晉 vs. 明夷', '系統腐敗', '烈士情結揭發 vs. 過度明哲保身'],
      ['夬 vs. 姤', '團隊毒瘤', '殘酷切割 vs. 無底線妥協'],
    ]
  },
  {
    dim: '【義】衝突決斷', dimFill: '833C00',
    id: '指標4', name: '面對後果的肩膀', dir: '事後：扛責 vs. 甩鍋',
    pairs: [
      ['師 vs. 比', '重大失敗', '獨自扛下 vs. 躲在群體後'],
      ['頤 vs. 大過（錯卦）', '風險控管', '過度保守 vs. 承擔超限黑鍋'],
      ['蹇 vs. 解', '災難爆發', '困境癱瘓 vs. 危機後鬆懈'],
      ['震 vs. 艮', '外界責難', '承受風暴 vs. 關機拒絕溝通'],
    ]
  },
  {
    dim: '【廉】誘惑與節制', dimFill: '375623',
    id: '指標5', name: '尋找捷徑的能力', dir: '真實解法 vs. 寄生魂逃避',
    pairs: [
      ['噬嗑 vs. 賁', '棘手任務', '處理硬骨頭 vs. 精美簡報粉飾'],
      ['漸 vs. 歸妹', '晉升管道', '循序累積戰功 vs. 走偏門/裙帶關係'],
      ['困 vs. 井', '資源枯竭', '無底線乞討掠奪 vs. 過度封閉獨立'],
      ['巽 vs. 兌', '說服他人', '真材實料 vs. 花言巧語畫大餅'],
    ]
  },
  {
    dim: '【廉】誘惑與節制', dimFill: '375623',
    id: '指標6', name: '原則的僵化與彈性', dir: '死腦筋 vs. 沒底線',
    pairs: [
      ['泰 vs. 否', '環境適應', '過度安逸/喪失危機意識 vs. 封閉拒絕新觀念'],
      ['損 vs. 益', '利益分配', '過度自損 vs. 貪得無厭'],
      ['渙 vs. 節', '團隊管理', '渙散無規矩 vs. 苛刻死板'],
      ['中孚 vs. 小過（錯卦）', '信任機制', '盲目信任（天真） vs. 鑽牛角尖防備'],
    ]
  },
  {
    dim: '【恥】覺察與修復', dimFill: '4C2C5A',
    id: '指標7', name: '面對自身陰影的態度', dir: '內在防衛機制',
    pairs: [
      ['屯 vs. 蒙', '面對未知', '怕出糗拒接觸 vs. 不懂裝懂傲慢'],
      ['剝 vs. 復', '面對惡習', '自暴自棄 vs. 痛苦戒斷易反覆'],
      ['無妄 vs. 大畜', '面對過失', '毫無濾鏡卸責 vs. 壓抑自我霸凌'],
      ['豐 vs. 旅', '面對成就', '巔峰狂妄 vs. 失去光環後焦慮'],
    ]
  },
  {
    dim: '【恥】覺察與修復', dimFill: '4C2C5A',
    id: '指標8', name: '跌倒後的修復方式', dir: '外在成長與復原力',
    pairs: [
      ['隨 vs. 蠱', '面對爛攤', '隨波逐流擺爛 vs. 獨自修復腐敗'],
      ['坎 vs. 離（錯卦）', '面對打擊', '深陷受害者黑洞 vs. 盲目依附權威'],
      ['革 vs. 鼎', '面對不滿', '無腦翻桌抱怨 vs. 奪權後分配不公'],
      ['既濟 vs. 未濟', '面對里程碑', '小成即傲慢停學 vs. 完美主義癱瘓'],
    ]
  },
];

function indicatorTable(ind) {
  const rows = [
    new TableRow({ children: [
      new TableCell({
        borders, columnSpan: 3,
        shading: { fill: ind.dimFill, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        width: { size: 9026, type: WidthType.DXA },
        children: [new Paragraph({ children: [
          new TextRun({ text: `${ind.id}：${ind.name}`, bold: true, color: 'FFFFFF', size: 24 }),
          new TextRun({ text: `　　（${ind.dir}）`, color: 'DDDDDD', size: 20 }),
        ]})]
      })
    ]}),
    headerRow([['卦象對', 3000], ['情境場景', 2000], ['光譜兩端（A端 vs. B端）', 4026]]),
    ...ind.pairs.map((p, i) => dataRow(
      [[p[0], 3000], [p[1], 2000], [p[2], 4026]], i % 2 === 1
    )),
  ];
  return new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: [3000, 2000, 4026], rows });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: '1F3864' },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '2E5496' },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022',
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1280, bottom: 1440, left: 1280 } } },
    children: [

      h1('階段一：靈魂校準系統'),
      pBold('文件性質：', '本文件為原始白皮書（v1.0）的整理與補充版，加入了開發討論中已確認的設計細節。'),
      pBold('對應原始文件：', '靈魂校準量表底層架構白皮書 v1.0'),
      space(),

      // 一、系統概述
      h1('一、系統概述'),
      p('玩家在進入階段二之前，先接受 16 道微型情境測驗（8 題 × 滑桿 + 選項），系統根據結果：'),
      bullet('生成玩家進入階段二的 5 項初始裏層數值（Stability、Drive、Logic、Emotion、hide Vitality）'),
      bullet('建立玩家的「靈魂指紋」，記錄 8 個指標各自的病灶位置與選擇傾向'),
      bullet('決定玩家在階段二中，每個靈魂標記指標的「成長門檻」（觸發靈魂成長效果所需的對齊次數）'),
      space(),
      p('底層邏輯庫：《易經》64 卦 → 32 對「互為表裡」的配對，作為痛感光譜的兩個極端。'),
      space(),

      // 二、運作流程
      h1('二、一輪測驗的完整流程'),
      p('每個指標進行一次以下流程，共 8 輪：'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA }, columnWidths: [1200, 1800, 6026],
        rows: [
          headerRow([['步驟', 1200], ['動作', 1800], ['說明', 6026]]),
          dataRow([['1', 1200], ['隨機抽卦', 1800], ['從該指標的 4 對卦象中隨機抽出 1 對', 6026]]),
          dataRow([['2', 1200], ['生成情境', 1800], ['將卦象的矛盾本質，轉譯為現代職場/生活情境題', 6026]], true),
          dataRow([['3', 1200], ['痛感滑桿', 1800], ['玩家拉動 1–12 的滑桿，系統對應出病灶爻位置\n1–6 = 光譜 A 端（退縮/逃避/討好）\n7–12 = 光譜 B 端（攻擊/傲慢/掠奪）', 6026]]),
          dataRow([['4', 1200], ['生成選項', 1800], ['根據病灶爻，生成三個應對選項（原始白皮書為三選一；現行遊戲主體為四向滑動）', 6026]], true),
          dataRow([['5', 1200], ['玩家選擇', 1800], ['選擇結果影響初始數值，並記入靈魂指紋', 6026]]),
        ]
      }),
      space(),

      // 三、選項效果
      h1('三、選項效果與成長門檻'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA }, columnWidths: [1000, 2000, 3026, 3000],
        rows: [
          headerRow([['選項', 1000], ['行為', 2000], ['即時效果', 3026], ['成長門檻（階段二）', 3000]]),
          dataRow([['A', 1000], ['順從病灶（防衛機制運作）', 2000], ['某項裏層數值崩盤（隱藏）', 3026], ['中（需多次對齊才觸發靈魂成長）', 3000]]),
          dataRow([['B', 1000], ['走向極端爻（徹底放棄/毀滅）', 2000], ['精神力（Mental）驟降', 3026], ['高（最難觸發靈魂成長效果）', 3000]], true),
          dataRow([['C', 1000], ['跨越至對立卦的對應爻（成長）', 2000], ['數值平衡獎勵', 3026], ['低（最容易觸發靈魂成長效果）✅ 已確認', 3000]]),
        ]
      }),
      space(),
      pBold('成長門檻說明（已確認）：', ''),
      p('門檻決定玩家在階段二中，針對該指標需要做幾次「靈魂對齊選擇」，才能觸發靈魂成長效果。'),
      p('校準時選 C 的玩家，在這個指標上的成長路已經開始，門檻最低；選 B 的玩家偏離最遠，門檻最高。'),
      space(),

      // 四、8大指標對照表
      h1('四、8 大指標對照表'),
      p('以下為 8 個指標各自對應的卦象對與情境說明。每個指標有 4 對卦象，測驗時隨機抽取 1 對。'),
      space(),

      ...indicators.flatMap((ind, i) => [
        indicatorTable(ind),
        space(),
        ...(i < indicators.length - 1 ? [] : []),
      ]),

      // 五、靈魂指紋資料結構
      h1('五、靈魂指紋資料結構（程式用）'),
      p('階段一結束後，系統將以下資訊存入玩家的靈魂指紋，供階段二查詢：'),
      space(),
      new Table({
        width: { size: 9026, type: WidthType.DXA }, columnWidths: [2000, 2000, 5026],
        rows: [
          headerRow([['欄位', 2000], ['類型', 2000], ['說明', 5026]]),
          dataRow([['indicatorId', 2000], ['1–8', 2000], ['指標編號', 5026]]),
          dataRow([['hexagramPair', 2000], ['字串', 2000], ['本次抽到的卦象對 ID', 5026]], true),
          dataRow([['sliderValue', 2000], ['1–12', 2000], ['玩家的滑桿位置 → 病灶爻位', 5026]]),
          dataRow([['chosenOption', 2000], ['A / B / C', 2000], ['玩家選擇的選項，需記錄（影響成長門檻計算）', 5026]], true),
          dataRow([['growthThreshold', 2000], ['low / medium / high', 2000], ['由 chosenOption 衍生：C→low、A→medium、B→high', 5026]]),
        ]
      }),
      space(),

      // 六、待確認
      h1('六、待夥伴確認事項'),
      bullet('各選項（A/B/C）造成的具體數值崩盤量（哪個數值崩多少）'),
      bullet('選項 C 的「平衡數值獎勵」具體是哪些數值、加多少'),
      bullet('成長門檻的具體次數定義（low=幾次、medium=幾次、high=幾次）'),
      bullet('靈魂指紋如何對應到靈魂標記的關鍵字清單（需與劇本設計師共同制定）'),
      bullet('校準階段目前是三選一，但主遊戲是四向滑動——校準介面是否維持三選一？'),
      space(),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('D:/APP/Nice to meet you/設計文件/階段一_靈魂校準系統.docx', buffer);
  console.log('建立完成');
});
