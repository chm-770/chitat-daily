# העלאת חת״ת יומי ל־Google Play

האפליקציה היא PWA. ל־Google Play עוטפים אותה כ־TWA (Trusted Web Activity) בעזרת PWABuilder.

## 1. אירוח בכתובת קבועה

אחת מהאפשרויות (שתיהן חינמיות ומתעדכנות מכל דחיפה ל־`main`):

**Netlify**
1. app.netlify.com → Add new site → Import an existing project → GitHub → `chm-770/chitat-daily`.
2. ההגדרות נקראות מ־`netlify.toml` (בנייה: `npm run build`, תיקייה: `dist`).

**Cloudflare Pages**
1. dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → `chm-770/chitat-daily`.
2. Framework preset: None · Build command: `npm run build` · Build output directory: `dist`.

אפשר לחבר דומיין משלך בהגדרות האתר. הכתובות של העמודים הנדרשים ל־Play:
- מדיניות פרטיות: `https://<הדומיין>/privacy.html`
- מקורות: `https://<הדומיין>/sources.html`

## 2. חשבון מפתח

play.google.com/console → הרשמה (תשלום חד־פעמי). בחשבון פרטי חדש ייתכן שנדרשת בדיקה סגורה
(בודקים במשך כמה ימים) לפני פרסום לכולם – לבדוק את הדרישה העדכנית ב־Play Console.

## 3. יצירת החבילה

1. pwabuilder.com → להזין את כתובת האתר → Package for stores → Android.
2. להוריד את החבילה. בתוכה:
   - קובץ `.aab` להעלאה ל־Play.
   - **מפתח החתימה (signing key)** – לשמור במקום בטוח. בלעדיו אי אפשר לעדכן את האפליקציה.
   - `assetlinks.json`.
3. לשים את `assetlinks.json` בתיקייה `public/.well-known/` בריפו ולדחוף ל־`main`.
   הקובץ יוגש בכתובת `https://<הדומיין>/.well-known/assetlinks.json` (הכותרות מוגדרות ב־`public/_headers`).
4. אם משתמשים ב־Play App Signing, להוסיף ל־`assetlinks.json` גם את טביעת האצבע (SHA-256)
   שמופיעה ב־Play Console → Setup → App signing.

## 4. Play Console

- **Privacy policy**: כתובת `privacy.html`.
- **Data safety**: אין איסוף או שיתוף של נתונים; מיקום משמש במכשיר בלבד; הנתונים נשמרים במכשיר.
- **Content rating**: שאלון.
- **Store listing**: שם, תיאור קצר וארוך, אייקון 512×512, תמונת feature 1024×500, צילומי מסך של טלפון.
- להעלות את ה־`.aab` ל־Internal testing / Closed testing, ואחר כך ל־Production.
