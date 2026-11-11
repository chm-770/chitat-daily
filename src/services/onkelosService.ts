/**
 * Targum Onkelos (Metsudah / Sifsei Chachomim edition, CC-BY-NC, via Sefaria), bundled per book in
 * src/data/onkelos/ (scripts/onkelos/fetch_onkelos.py). Keys are "chapter:verse".
 */
const cache: Record<string, Record<string, string>> = {};

export async function loadOnkelos(book: string): Promise<Record<string, string>> {
  if (cache[book]) return cache[book];
  let mod: any;
  switch (book) {
    case 'שמות':
      mod = await import('../data/onkelos/shemot.json');
      break;
    case 'ויקרא':
      mod = await import('../data/onkelos/vayikra.json');
      break;
    case 'במדבר':
      mod = await import('../data/onkelos/bamidbar.json');
      break;
    case 'דברים':
      mod = await import('../data/onkelos/devarim.json');
      break;
    default:
      mod = await import('../data/onkelos/bereishit.json');
  }
  cache[book] = (mod.default || mod) as Record<string, string>;
  return cache[book];
}
