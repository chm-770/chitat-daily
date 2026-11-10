"""Import the Hayom Yom text, word for word, from the Chabadpedia month pages.

Sources: sources/hayomyom/*.mhtml, saved from chabadpedia.co.il
("חב"דפדיה:היום יום/<month>"). Each day is the table row of that page: the
italic customs line(s) and every paragraph, in order, with links and formatting
removed and nothing else changed.

The combined "אדר" page (regular year) is not imported: Adar I and Adar II are
taken from their own pages.

ל׳ חשון / ל׳ כסלו: the book has no entry for these days (both months had 29 days
when it was written). By the owner's rule, day 30 shows the פתגם of כ״ט: the 29th's
text without its italic customs line (e.g. "ה' דחנוכה"). The source page's own row
for ל׳ כסלו (the 29th's text plus a note) is therefore not used.

  python3 scripts/hayomYom/import_chabadpedia.py          # write the database
  python3 scripts/hayomYom/import_chabadpedia.py --check  # only compare, exit 1 on differences
"""
import email, glob, html, json, re, sys

DB = 'src/data/hayomYomDatabase.json'
MONTHS = {
    'ניסן': 1, 'אייר': 2, 'סיון': 3, 'תמוז': 4, 'מנחם אב': 5, 'אלול': 6, 'תשרי': 7,
    'חשוון': 8, 'כסלו': 9, 'טבת': 10, 'שבט': 11, "אדר א'": 12, "אדר ב'": 13,
}
MONTH_NAMES = {1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'מנחם אב', 6: 'אלול', 7: 'תשרי',
               8: 'חשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', 12: 'אדר א׳', 13: 'אדר ב׳'}
GEM = {'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10, 'כ': 20, 'ל': 30}
HEB_DAY = {1: 'א׳', 2: 'ב׳', 3: 'ג׳', 4: 'ד׳', 5: 'ה׳', 6: 'ו׳', 7: 'ז׳', 8: 'ח׳', 9: 'ט׳', 10: 'י׳',
           11: 'י״א', 12: 'י״ב', 13: 'י״ג', 14: 'י״ד', 15: 'ט״ו', 16: 'ט״ז', 17: 'י״ז', 18: 'י״ח', 19: 'י״ט',
           20: 'כ׳', 21: 'כ״א', 22: 'כ״ב', 23: 'כ״ג', 24: 'כ״ד', 25: 'כ״ה', 26: 'כ״ו', 27: 'כ״ז', 28: 'כ״ח',
           29: 'כ״ט', 30: 'ל׳'}


def page_html(path):
    msg = email.message_from_binary_file(open(path, 'rb'))
    for part in msg.walk():
        if part.get_content_type() == 'text/html':
            return part.get_payload(decode=True).decode('utf-8')
    raise ValueError(f'no HTML in {path}')


def paragraphs(cell):
    c = re.sub(r'</?(i|p|dl|dd|dt|ul|ol|li|div|blockquote)(\s[^>]*)?>', '\n\n', cell)
    c = re.sub(r'<br\s*/?>', '\n', c)
    c = re.sub(r'<[^>]+>', '', c)
    c = html.unescape(c).replace(' ', ' ')
    out = []
    for p in re.split(r'\n\s*\n', c):
        p = '\n'.join(re.sub(r'[ \t]+', ' ', l).strip() for l in p.split('\n') if l.strip())
        if not p:
            continue
        # punctuation alone (e.g. '.' right after the italic customs line) belongs to the previous block
        if out and not re.search(r'[\w֐-׿]', p):
            out[-1] += p
        else:
            out.append(p)
    return out


def read_sources():
    days = {}
    pitgam = {}  # each day's text without the italic customs line
    for path in sorted(glob.glob('sources/hayomyom/*.mhtml')):
        name = re.search(r'היום יום_(.+?) – ', path).group(1)
        if name not in MONTHS:
            continue
        month = MONTHS[name]
        rows = re.findall(r'<tr>\s*<td[^>]*><b>([^<]+)</b>\s*</td>\s*<td[^>]*>(.*?)</td>\s*<td', page_html(path), re.S)
        for date, cell in rows:
            day = sum(GEM.get(ch, 0) for ch in date.strip().split()[0])
            key = f'{day}_{month}'
            assert key not in days, key
            days[key] = paragraphs(cell)
            m = re.match(r'\s*<i>(.*?)</i>(.*)', cell, re.S)
            pitgam[key] = paragraphs(m.group(2)) if m else days[key]
    # Day 30 rule (see above)
    for month in (8, 9):
        days[f'30_{month}'] = pitgam[f'29_{month}']
    return days


def norm(ps):
    return re.sub(r'\s+', ' ', ' '.join(ps)).strip()


def main():
    src = read_sources()
    db = json.load(open(DB, encoding='utf-8'))
    if '--check' not in sys.argv:
        for key, paras in src.items():
            day, month = map(int, key.split('_'))
            entry = db.get(key) or {
                'hebrewDate': f'{HEB_DAY[day]} {MONTH_NAMES[month]}', 'monthName': MONTH_NAMES[month],
                'dayNumber': day, 'monthNumber': month,
            }
            entry['text'] = paras
            db[key] = entry
        open(DB, 'w', encoding='utf-8').write(json.dumps(db, ensure_ascii=False, indent=2))
    diffs = [k for k, p in src.items() if norm(db.get(k, {}).get('text', [])) != norm(p)]
    extra = [k for k in db if k not in src]
    print(f'checked {len(src)} dates against the source; differences: {len(diffs)} {diffs}')
    print(f'dates in the app without a source page: {extra}')
    sys.exit(1 if diffs else 0)


if __name__ == '__main__':
    main()
