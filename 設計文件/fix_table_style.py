# -*- coding: utf-8 -*-
"""
把新建的 8x5 晨間殘留表格，改成與舊表格相同的樣式：
- Header row：fill 2C3E6B，文字白色粗體
- Body rows：fill FFFFFF，文字黑色
- 所有 cell 邊框：CCCCCC，sz=1
- cell 邊距：top/bottom 80dxa，left/right 120dxa
- row 層 tblPrEx：top/bottom 0
"""
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from lxml import etree
import re

path = r'D:\APP\Nice to meet you\設計文件\補充設計決策.docx'
doc = Document(path)

def clean_xml(el):
    xml = etree.tostring(el, pretty_print=True).decode('utf-8', errors='replace')
    xml = re.sub(r' xmlns:[a-z0-9]+="[^"]+"', '', xml)
    return xml

# 找我的新表格（8x5，第一格含 '總分'）
target_table = None
for t in doc.tables:
    if len(t.rows) == 8 and len(t.columns) == 5:
        try:
            text = t.rows[0].cells[0].text
            if '總' in text or '\u7e3d' in text or len(text) > 0:
                target_table = t
                break
        except:
            pass

if target_table is None:
    print('找不到目標表格')
    exit(1)

print(f'找到表格，rows={len(target_table.rows)}, cols={len(target_table.columns)}')

def make_tc_pr(is_header, col_count):
    """建立 tcPr XML element"""
    col_width = str(9026 // col_count)  # 均分寬度

    tcPr = OxmlElement('w:tcPr')

    # 欄寬
    tcW = OxmlElement('w:tcW')
    tcW.set(qn('w:w'), col_width)
    tcW.set(qn('w:type'), 'dxa')
    tcPr.append(tcW)

    # 邊框：CCCCCC, sz=1
    tcBorders = OxmlElement('w:tcBorders')
    for side in ('top', 'left', 'bottom', 'right'):
        border = OxmlElement(f'w:{side}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '1')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), 'CCCCCC')
        tcBorders.append(border)
    tcPr.append(tcBorders)

    # 填色
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), '2C3E6B' if is_header else 'FFFFFF')
    tcPr.append(shd)

    # cell 邊距
    tcMar = OxmlElement('w:tcMar')
    for side, w in [('top', '80'), ('left', '120'), ('bottom', '80'), ('right', '120')]:
        m = OxmlElement(f'w:{side}')
        m.set(qn('w:w'), w)
        m.set(qn('w:type'), 'dxa')
        tcMar.append(m)
    tcPr.append(tcMar)

    return tcPr

def make_row_tbl_pr_ex():
    """每 row 的 tblPrEx（top/bottom margin = 0）"""
    tblPrEx = OxmlElement('w:tblPrEx')
    tblCellMar = OxmlElement('w:tblCellMar')
    for side in ('top', 'bottom'):
        m = OxmlElement(f'w:{side}')
        m.set(qn('w:w'), '0')
        m.set(qn('w:type'), 'dxa')
        tblCellMar.append(m)
    tblPrEx.append(tblCellMar)
    return tblPrEx

col_count = len(target_table.columns)

for row_idx, row in enumerate(target_table.rows):
    is_header = (row_idx == 0)
    tr = row._tr

    # 移除舊的 tblPrEx，插入新的
    old_tblPrEx = tr.find(qn('w:tblPrEx'))
    if old_tblPrEx is not None:
        tr.remove(old_tblPrEx)
    new_tblPrEx = make_row_tbl_pr_ex()
    tr.insert(0, new_tblPrEx)

    for cell in row.cells:
        tc = cell._tc

        # 移除舊 tcPr，插入新的
        old_tcPr = tc.find(qn('w:tcPr'))
        if old_tcPr is not None:
            tc.remove(old_tcPr)
        new_tcPr = make_tc_pr(is_header, col_count)
        tc.insert(0, new_tcPr)

        # 重新設定段落中的 run rPr
        for p in tc.findall(qn('w:p')):
            for r in p.findall(qn('w:r')):
                old_rPr = r.find(qn('w:rPr'))
                if old_rPr is not None:
                    r.remove(old_rPr)
                rPr = OxmlElement('w:rPr')
                if is_header:
                    b = OxmlElement('w:b')
                    bCs = OxmlElement('w:bCs')
                    rPr.append(b)
                    rPr.append(bCs)
                color = OxmlElement('w:color')
                color.set(qn('w:val'), 'FFFFFF' if is_header else '000000')
                rPr.append(color)
                r.insert(0, rPr)

doc.save(path)
print('Done — table style fixed')
