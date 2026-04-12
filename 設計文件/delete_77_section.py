# -*- coding: utf-8 -*-
"""
刪除錯誤放在「八」之後的 7-7 條件選項段落
（從「7-7 條件選項系統」到「8-0 系統概述」之前）
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from docx import Document

path = r'D:\APP\Nice to meet you\設計文件\補充設計決策.docx'
doc = Document(path)
body = doc.element.body
paras = list(body.iterchildren())

start_del = None
end_del = None

for i, elem in enumerate(paras):
    if elem.tag.endswith('}p'):
        text = ''.join(r.text or '' for r in elem.iter() if r.tag.endswith('}t'))
        if '7-7' in text and '條件選項' in text and start_del is None:
            start_del = i
            print(f'找到開始位置 [{i}]: {text[:40]}')
        elif start_del is not None and end_del is None and '8-0' in text:
            end_del = i
            print(f'找到結束位置 [{i}]: {text[:40]}')

print(f'刪除範圍: [{start_del} : {end_del}]')

if start_del is not None and end_del is not None:
    to_remove = paras[start_del:end_del]
    for elem in to_remove:
        body.remove(elem)
    print(f'已刪除 {len(to_remove)} 個段落')
    doc.save(path)
    print('已儲存')
else:
    print('ERROR: 未找到正確範圍，放棄刪除')
