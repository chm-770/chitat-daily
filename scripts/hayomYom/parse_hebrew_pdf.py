import re, json, sys
src, out = sys.argv[1], sys.argv[2]
raw = open(src, encoding='utf-8').read()
raw = re.sub('\u202a([^\u202a\u202c\n]*)\u202c', lambda m: m.group(1)[::-1] if not re.search(r'[0-9A-Za-z]', m.group(1)) else m.group(1), raw)
raw = re.sub('[\u202a\u202b\u202c\u200e\u200f\u202d\u202e]', '', raw).replace('\f', '\n')
lines = [l.strip() for l in raw.split('\n')]
# skip TOC: TOC lines contain long dashes
start = max(i for i,l in enumerate(lines) if '-----' in l) + 1
MONTHS = {'תשרי':7,'חשון':8,'מרחשון':8,'כסלו':9,'טבת':10,'שבט':11,"אדר א":12,"אדר":12,"אדר ב":13,'ניסן':1,'אייר':2,'סיון':3,'תמוז':4,'אב':5,'מנחם אב':5,'אלול':6}
L = {'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ל':30}
def gem(s):
    s = s.replace("'", '').replace('"','').replace('׳','').replace('״','').strip()
    if not s or any(c not in L for c in s): return None
    return sum(L[c] for c in s)
data = {}; month=None; day=None; buf=[]
def flush():
    if month and day:
        data.setdefault(f'{day}_{month}', []).extend(buf)
for l in lines[start:]:
    m = l.replace("'", ' ').replace('׳',' ').strip()
    m = re.sub(r'\s+',' ',m)
    if m in MONTHS and len(l) < 12:
        flush(); buf=[]; month=MONTHS[m]; day=None; continue
    dm = re.fullmatch(r"(?:ליום|יום)\s*([א-ת'׳]+)\s*", l.replace("'", "'"))
    if not dm:
        dm = re.fullmatch(r"'?(?:ליום|יום)\s*([א-ת'׳]+)'?", l)
    if not dm and len(l) <= 4 and gem(l) and month:
        dm = re.fullmatch(r"(.+)", l)
    if dm and gem(dm.group(1)) and len(l) < 12:
        flush(); buf=[]; day=gem(dm.group(1)); continue
    buf.append(l)
flush()
# build paragraphs
res = {}
for k, ls in data.items():
    paras=[]; cur=''
    for l in ls:
        if not l:
            if cur and re.search(r'[.:"\]\)!?]$', cur): paras.append(cur); cur=''
            continue
        if cur.endswith('-') and not cur.endswith(' -'): cur = cur + l
        else: cur = (cur + ' ' + l).strip()
    if cur: paras.append(cur)
    res[k] = paras
json.dump(res, open(out,'w',encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
c = Counter(int(k.split('_')[1]) for k in res)
print(len(res), sorted(c.items()))
for mo in sorted(c):
    days = sorted(int(k.split('_')[0]) for k in res if int(k.split('_')[1])==mo)
    missing=[d for d in range(1,31) if d not in days]
    print(mo, 'missing', missing)
