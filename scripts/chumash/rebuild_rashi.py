"""Rebuild the Rashi of every verse in src/data/parashiyot/*.json from Sefaria, aligned by
chapter and verse (an earlier import had shifted Rashi by one verse in many places).

Source: Sefaria, "Pentateuch with Rashi's commentary by M. Rosenbaum and A.M. Silbermann,
1929-1934" (public domain). Each comment keeps its <b>heading</b>; other HTML is removed.

  python3 scripts/chumash/rebuild_rashi.py
"""
import json, re, sys, time, urllib.request

BOOKS = {'bereishit': 'Genesis', 'shemot': 'Exodus', 'vayikra': 'Leviticus', 'bamidbar': 'Numbers', 'devarim': 'Deuteronomy'}
UA = 'ChitatDaily/1.0 (https://github.com/chm-770/chitat-daily)'


def fetch(ref):
    for attempt in range(4):
        try:
            req = urllib.request.Request(f'https://www.sefaria.org/api/v3/texts/{ref}', headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                d = json.load(r)
            v = [x for x in d['versions'] if x['language'] == 'he'][0]
            assert v['versionTitle'].startswith('Pentateuch with Rashi'), v['versionTitle']
            return v['text']
        except Exception as e:
            print('retry', ref, e, file=sys.stderr)
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(ref)


def clean(c):
    c = re.sub(r'<(?!/?b\b)[^>]+>', '', c)
    c = c.replace('&nbsp;', ' ').replace('&thinsp;', ' ').replace('ﬠ', 'ע')
    c = re.sub(r'([֑-ׇ])\1+', r'\1', c)  # doubled vowel marks
    return re.sub(r'\s+', ' ', c).strip()


def main():
    changed = 0
    for fname, en in BOOKS.items():
        path = f'src/data/parashiyot/{fname}.json'
        data = json.load(open(path, encoding='utf-8'))
        chapters = sorted({v['chapter'] for p in data.values() for a in p['aliyot'] for v in a['verses']})
        rashi = {}
        for ch in chapters:
            text = fetch(f'Rashi_on_{en}.{ch}')
            for vi, comments in enumerate(text):
                rashi[(ch, vi + 1)] = [clean(c) for c in comments if isinstance(c, str) and clean(c)]
            time.sleep(0.3)
        for p in data.values():
            for a in p['aliyot']:
                for v in a['verses']:
                    new = rashi.get((v['chapter'], v['verseInChapter']), [])
                    if [re.sub(r'<[^>]+>', '', x) for x in new] != [re.sub(r'<[^>]+>', '', x) for x in (v.get('rashi') or [])]:
                        changed += 1
                    v['rashi'] = new
        json.dump(data, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        print(fname, 'chapters', len(chapters))
    print('verses whose Rashi changed:', changed)


if __name__ == '__main__':
    main()
