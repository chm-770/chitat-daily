#!/usr/bin/env python3
"""Downloads Targum Onkelos (Torat Emet edition, public domain) from Sefaria into
src/data/onkelos/<book>.json as {"chapter:verse": text}. The text is kept exactly as in the source."""
import json, os, re, sys, time, urllib.parse, urllib.request

BOOKS = {'bereishit': 'Genesis', 'shemot': 'Exodus', 'vayikra': 'Leviticus', 'bamidbar': 'Numbers', 'devarim': 'Deuteronomy'}
VERSION = 'Onkelos {book}'
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'data', 'onkelos')

def get(url):
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'chitat-daily-build'}), timeout=60) as r:
                return json.load(r)
        except Exception as e:
            print('retry', url, e, file=sys.stderr); time.sleep(3 * (attempt + 1))
    raise SystemExit('failed ' + url)

def clean(t):
    t = re.sub(r'<[^>]+>', '', t)
    return re.sub(r'\s+', ' ', t).strip()

os.makedirs(OUT, exist_ok=True)
for slug, book in BOOKS.items():
    out = {}
    ch = 1
    while True:
        ver = urllib.parse.quote(f'hebrew|{VERSION.format(book=book)}')
        d = get(f'https://www.sefaria.org/api/v3/texts/Onkelos_{book}.{ch}?version={ver}')
        vs = d.get('versions') or []
        if not vs or not vs[0].get('text'):
            break
        assert vs[0]['license'] == 'Public Domain', vs[0]['license']
        for i, t in enumerate(vs[0]['text'], 1):
            if t:
                out[f'{ch}:{i}'] = clean(t)
        nxt = d.get('next')
        ch += 1
        if not nxt or not str(nxt).startswith(f'Onkelos {book}'):
            break
        time.sleep(0.3)
    with open(os.path.join(OUT, f'{slug}.json'), 'w', encoding='utf8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(slug, ch - 1, 'chapters', len(out), 'verses')
