# סרטון התדמית לדף החנות

```
npm run build && cp scripts/video/stage.html dist/
npx vite preview --port 4199 &
node scripts/video/record.cjs /tmp/video     # מדפיס startAt ו־endAt בשניות
ffmpeg -ss <startAt> -to <endAt> -i /tmp/video/page@*.webm -vf "fps=30,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -movflags +faststart -an chitat-promo.mp4
```

הסרטון מצולם מהאפליקציה האמיתית (בלי מוזיקה). ב־Google Play מעלים אותו ל־YouTube ומדביקים את הקישור בדף החנות.
