# שירות התזכורות (Cloudflare Worker)

רץ כל דקה, קורא מ־Firestore את המכשירים שהגיע זמן התזכורת שלהם (`reminders/{uid}`, `nextFireAt`)
ושולח התראה דרך Firebase Cloud Messaging. אין התראות בשבת ובחג.

## התקנה ב־Cloudflare (פעם אחת)

1. Workers & Pages → Create → Workers → Import a repository → `chm-770/chitat-daily`.
   - Root directory: `worker`
   - Deploy command: `npx wrangler deploy`
2. Firebase Console → Project settings → Service accounts → Generate new private key.
   הקובץ שירד הוא **סוד**: לא מעלים אותו לגיטהאב ולא שולחים אותו לאף אחד.
3. ב־Worker שנוצר: Settings → Variables and Secrets → Add → Type: Secret,
   Name: `FIREBASE_SERVICE_ACCOUNT`, Value: כל התוכן של הקובץ. שמירה ← Deploy.
4. אחר כך אפשר למחוק את הקובץ מהמחשב.

התזמון (כל דקה) מוגדר ב־`wrangler.toml`.

## בדיקה מקומית

```
npm install
npm test   # מדפיס את התזכורות של שבוע לדוגמה
```
