# סרטון התדמית (Remotion)

סרטון אנכי 1080×1920 לטלפון, עם אנימציות, מוזיקה ואפקטים מקוריים (נוצרים בקוד, בלי חומרים חיצוניים).

```
npm install
python3 scripts/make_audio.py      # יוצר את המוזיקה והאפקטים ב־public/audio
node capture.cjs                   # צילומי המסך מהאפליקציה (כשהיא רצה ב־localhost:4200)
npm run studio                     # עריכה ותצוגה מקדימה
npm run render                     # out/chitat-promo.mp4
```

הגופנים (Frank Ruhl Libre, Assistant – רישיון OFL) שמורים ב־public/fonts כדי שהרינדור לא יצטרך רשת.
