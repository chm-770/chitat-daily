import fs from 'fs';
import path from 'path';

async function main() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  
  const pdf2Path = path.resolve('sources/pdf/____-___-_____1__e451b6bd.pdf');
  const pdf1Path = path.resolve('sources/pdf/Hebrewbooks_org_60799_f20589d8.pdf');

  const buf2 = new Uint8Array(fs.readFileSync(pdf2Path));
  const doc2 = await pdfjs.getDocument({ data: buf2 }).promise;
  console.log('PDF 2 pages:', doc2.numPages);

  const months = [
    { name: 'תשרי', num: 7 },
    { name: 'חשון', num: 8 },
    { name: 'מרחשון', num: 8 },
    { name: 'כסלו', num: 9 },
    { name: 'טבת', num: 10 },
    { name: 'שבט', num: 11 },
    { name: 'אדר א', num: 12 },
    { name: 'אדר ב', num: 13 },
    { name: 'ניסן', num: 1 },
    { name: 'אייר', num: 2 },
    { name: 'סיון', num: 3 },
    { name: 'תמוז', num: 4 },
    { name: 'מנחם אב', num: 5 },
    { name: 'אלול', num: 6 },
  ];

  let fullTextPDF2 = '';
  for (let p = 13; p <= doc2.numPages; p++) {
    const page = await doc2.getPage(p);
    const content = await page.getTextContent();
    const str = (content.items as any[]).map((i) => i.str).join(' ');
    fullTextPDF2 += `\n---PAGE_${p}---\n` + str;
  }

  fs.writeFileSync('temp_pdf2_text.txt', fullTextPDF2, 'utf-8');
  console.log('Saved temp_pdf2_text.txt, length:', fullTextPDF2.length);
}

main().catch(console.error);
