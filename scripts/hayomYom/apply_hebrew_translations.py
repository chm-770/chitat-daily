"""Add Hebrew translations to Yiddish Hayom Yom entries and fix incomplete days.

Source: the Hebrew Hayom Yom PDF (no longer kept in the repository; Tishrei-Av, includes
translations of the Yiddish passages). Steps:
  pdftotext sources/pdf/____-___-_____1__e451b6bd.pdf /tmp/hy_he.txt
  python3 scripts/hayomYom/parse_hebrew_pdf.py /tmp/hy_he.txt /tmp/hy_he.json
  python3 scripts/hayomYom/apply_hebrew_translations.py /tmp/hy_he.json
"""
import json, re, sys

DB = 'src/data/hayomYomDatabase.json'
YIDDISH = re.compile(r'(?<![א-ת])(איז|פון|דער|זיינען|ניט|נישט|האט|געווען|אויף|דאס|וואס|אויך|זיך|און|מען)(?![א-ת])')
TRANSLATION_MARK = 'תרגום לעברית:'

# Days that are incomplete in the database: replaced with the full source text.
REPLACE_FROM_SOURCE = ['29_8']
# The original book (5703-5704) has no entry for these days: Cheshvan 5704 and
# Kislev 5703 had 29 days. The database had invented/copied text for them.
REMOVE = ['30_8', '30_9']

src = json.load(open(sys.argv[1], encoding='utf-8'))
db = json.load(open(DB, encoding='utf-8'))

added = []
for key, entry in db.items():
    text = ' '.join(entry['text'])
    if TRANSLATION_MARK in text or key not in src:
        continue
    if YIDDISH.search(text):
        entry['text'] = entry['text'] + [TRANSLATION_MARK] + src[key]
        added.append(key)

for key in REPLACE_FROM_SOURCE:
    db[key]['text'] = src[key]
for key in REMOVE:
    db.pop(key, None)

open(DB, 'w', encoding='utf-8').write(json.dumps(db, ensure_ascii=False, indent=2))
print('translations added:', len(added), added)
