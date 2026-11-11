/**
 * Removes the cantillation marks (טעמי המקרא, U+0591–U+05AF), the meteg/ga'ya (U+05BD) and the
 * paseq (׀), keeping the vowel points, maqaf and sof pasuq. Many Hebrew fonts have no meteg or
 * cantillation glyphs (the letter is then drawn in another font and looks bigger), and Noto Serif
 * Hebrew draws tsere + meteg like a qamats.
 */
export function stripCantillation(text: string): string {
  return text
    .replace(/[\u0591-\u05AF\u05BD]/g, '')
    .replace(/\s*\u05C0\s*/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

const FINAL_TO_REGULAR: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

/** Consonants only (no points, punctuation or final forms), used to compare words. */
function skeleton(word: string): string {
  return word
    .replace(/[^\u05D0-\u05EA]/g, '')
    .replace(/[ךםןףץ]/g, (c) => FINAL_TO_REGULAR[c]);
}

/** Skeleton without the vowel letters ו and י (except the first letter): ויזכור ~ וַיִּזְכֹּר */
function looseSkeleton(word: string): string {
  const sk = skeleton(word);
  return sk.charAt(0) + sk.slice(1).replace(/[וי]/g, '');
}

/** The word without its first letter and that letter's points (וָבֹהוּ → בֹהוּ). */
function dropFirstLetter(word: string): string {
  return word.replace(/^[\u05D0-\u05EA][\u0591-\u05C7]*/, '');
}

/**
 * Adds the vowel points of the verse to Rashi's heading (דיבור המתחיל), which is written
 * without points: each heading word that appears in the verse gets the verse's pointed form.
 * Matching tolerates full/defective spelling (ו/י) and a one-letter prefix in the verse
 * (בהו → בֹהוּ from וָבֹהוּ). Words that are not found (e.g. וגו׳) stay as they are.
 */
export function vocalizeRashiHeading(heading: string, verseHebrew: string): string {
  const verseWords = stripCantillation(verseHebrew)
    .split(/[\s\u05BE]+/)
    .map((w) => w.replace(/[\u05C3:.,;׀]/g, ''))
    .filter(Boolean);
  const candidates: { form: string; pos: number; exact: string; loose: string }[] = [];
  verseWords.forEach((w, pos) => {
    candidates.push({ form: w, pos, exact: skeleton(w), loose: looseSkeleton(w) });
  });
  verseWords.forEach((w, pos) => {
    const d = dropFirstLetter(w);
    if (skeleton(d).length >= 2) candidates.push({ form: d, pos, exact: skeleton(d), loose: looseSkeleton(d) });
  });
  let from = 0;
  const find = (test: (c: (typeof candidates)[number]) => boolean) =>
    candidates.find((c) => c.pos >= from && test(c)) || candidates.find(test);
  return heading
    .split(/(\s+)/)
    .map((token) => {
      const m = token.match(/^([^\u05D0-\u05EA]*)([\u05D0-\u05EA\u0591-\u05C7]+)(.*)$/);
      if (!m) return token;
      const [, pre, word, post] = m;
      if (/[\u05B0-\u05BC\u05C1\u05C2\u05C7]/.test(word)) return token; // already pointed
      if (/['׳"״]/.test(post)) return token; // abbreviation such as וגו׳
      const sk = skeleton(word);
      if (!sk) return token;
      const ls = looseSkeleton(word);
      const hit = find((c) => c.exact === sk) || (sk.length >= 3 ? find((c) => c.loose === ls) : undefined);
      if (!hit) return token;
      from = hit.pos + 1;
      return pre + hit.form + post;
    })
    .join('');
}
