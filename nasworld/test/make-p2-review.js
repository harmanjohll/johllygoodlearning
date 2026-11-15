// Builds src/malay/P2_REVIEW.md, the sheet a Malay speaker ticks through.
//
//   node test/make-p2-review.js          rewrite the sheet
//
// It reads the Primary 2 data straight out of src/malay, so the sheet
// can never drift from what the child is shown. test/malay-p2.test.js
// fails if the sheet on disk is not what this would write today.

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src/malay/P2_REVIEW.md');

const LESSON_ENGLISH = 'add becomes beat bone choose does find which word order opposite number means asks same thing who whom ' +
  'correct hand mean passage question reason sentence mem men meng';

function load() {
  const sb = {
    Math, JSON, Object, Array, String, Number,
    pick: a => a[0], shuffle: a => a.slice(), rand: () => 0
  };
  vm.createContext(sb);
  ['malay-tree.js', 'malay-data.js', 'malay-lessons.js', 'malay-gen.js'].forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, 'src/malay', f), 'utf8').replace(/^const /gm, 'var ');
    vm.runInContext(src, sb, { filename: f });
  });
  return sb;
}

const strip = s => String(s).replace(/<br\s*\/?>/g, ' / ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const cell = s => strip(s).replace(/\|/g, '/');

function table(head, rows) {
  const h = ['#'].concat(head, ['OK', 'Fix']);
  let out = '| ' + h.join(' | ') + ' |\n| ' + h.map(() => '---').join(' | ') + ' |\n';
  rows.forEach((r, i) => { out += '| ' + [i + 1].concat(r.map(cell), ['[ ]', '']).join(' | ') + ' |\n'; });
  return out + '\n';
}

function build() {
  const d = load();
  const fill = (s, w) => s.replace('____', w);
  const wrong = o => 'wrong choices: ' + o.join(', ');
  let md = '';
  const malay = [];           // every Malay string from the data, for the word list
  const lessonText = [];      // lesson screens mix Malay and English; filtered below
  let inLessons = false;
  const M = s => { (inLessons ? lessonText : malay).push(strip(s)); return s; };
  const glosses = [];         // every English gloss, to tell the two languages apart
  (function walk(v, key) {
    if (typeof v === 'string') { if (/^(en|sen|ea|eb|one|many|enNum)$/.test(key)) glosses.push(v); }
    else if (Array.isArray(v)) v.forEach(x => walk(x, key));
    else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k], k));
  })(Object.keys(d).filter(k => /^MALAY_P2_/.test(k)).map(k => d[k]), '');

  md += '# Dunia Melayu, Primary 2 layer: review sheet\n\n';
  md += '**STATUS: AWAITING HUMAN REVIEW BY A MALAY SPEAKER.** Nothing below has been checked by a person yet.\n\n';
  md += 'This sheet lists every Malay word and sentence added for the ten Primary 2 skills, each with the English ';
  md += 'meaning the child is shown after answering. It is written out from `src/malay/malay-data.js` and ';
  md += '`src/malay/malay-lessons.js` by `node test/make-p2-review.js`, so please do not edit it by hand: ';
  md += 'correct the data file, then run that command again.\n\n';
  md += '**For the reviewer.** Thank you for checking these. For each row, tick **OK** if the Malay is correct ';
  md += 'standard Bahasa Melayu as taught in Singapore primary schools, the English meaning is right, and the ';
  md += 'answer shown is the only choice that could be marked correct. Otherwise write the correction under **Fix**. ';
  md += 'Things worth a second look:\n\n';
  md += '- spelling, and any word that is Indonesian or Malaysian usage and not Singapore school usage\n';
  md += '- a wrong choice that a teacher would in fact accept (please name it, and it will be removed)\n';
  md += '- for Bina Ayat, any other order of the same words that is also a good sentence\n';
  md += '- anything too hard, or not taught, in Primary 2\n\n';
  md += 'Aligned to: Sukatan Pelajaran Bahasa Melayu Sekolah Rendah 2015 (MOE Singapore). Nothing is copied from a published book or a past paper.\n\n';

  // 1
  md += '## 1. Imbuhan awalan\n\n';
  md += '### 1a. me- forms (root, correct form, meaning, the wrong spellings that can be offered)\n\n';
  md += table(['Root', 'Correct', 'English', 'Wrong spellings offered'],
    d.MALAY_P2_MEN.map(m => [M(m.root), M(m.form), 'to ' + m.en, d.malayP2MenWrong(m).join(', ')]));
  md += 'Never offered as a wrong spelling, because each is a real word: ' + d.MALAY_P2_MEN_REAL_WORDS.join(', ') + '.\n\n';
  md += 'Rule as taught: l, m, n, r take me-; b takes mem-; p takes mem- and drops; c, d, j take men-; t takes men- and drops; ';
  md += 'vowels, g, h take meng-; k takes meng- and drops; s takes meny- and drops; one-syllable roots take menge-.\n\n';
  md += '### 1b. ber- forms\n\n';
  md += table(['Root', 'Correct', 'English', 'Wrong spellings offered'],
    d.MALAY_P2_BER.map(b => [M(b.root), M(b.form), 'to ' + b.en, d.malayP2BerWrong(b).join(', ')]));
  md += '### 1c. Choose the word for the sentence (me-, ber-, di-, ter-)\n\n';
  md += table(['Sentence with the answer in place', 'English', 'Answer and wrong choices'],
    d.MALAY_P2_IMBUHAN_AYAT.map(x => [M(fill(x.s, x.a)), x.en, x.a + '; ' + wrong(x.o)]));

  // 2
  md += '## 2. Kata ganda\n\n### 2a. Doubling for more than one\n\n';
  md += table(['Malay', 'English'], d.MALAY_P2_GANDA_PLURAL.map(x => [M(x.w + '-' + x.w), x.many + ' (' + M(x.w) + ' = ' + x.one + ')']));
  md += '### 2b. Words that are always doubled (a name, not a plural)\n\n';
  md += table(['Malay', 'English'], d.MALAY_P2_GANDA_SEMU.map(x => [M(x.w), x.en]));
  md += '### 2c. Number phrases: the noun is not doubled\n\n';
  md += table(['Correct', 'English', 'Shown as wrong'],
    d.MALAY_P2_GANDA_FRASA.map(x => [M(x.num + ' ' + x.pb + ' ' + x.n), x.en,
      x.num + ' ' + x.pb + ' ' + x.n + '-' + x.n + '; ' + x.pb + ' ' + x.num + ' ' + x.n + '-' + x.n]));
  md += '### 2d. Sentences: no doubling after a number or a quantity word\n\n';
  md += table(['Sentence with the answer in place', 'English', 'Answer and wrong choices'],
    d.MALAY_P2_GANDA_AYAT.map(x => [M(fill(x.s, x.a)), x.en, x.a + '; ' + wrong(x.o)]));
  md += '### 2e. Which whole sentence is correct\n\n';
  md += 'Each row is asked two ways. Either the first sentence is the right one, or the second is. The two in the last column are always shown as wrong.\n\n';
  md += table(['Right (no number)', 'English', 'Right (with a number)', 'English', 'Shown as wrong'],
    d.MALAY_P2_GANDA_PILIH.map(x => {
      const dd = x.n + '-' + x.n, cap = dd.charAt(0).toUpperCase() + dd.slice(1);
      return [M(cap + ' ' + x.pred + '.'), x.en, M(x.num + ' ' + x.n + ' ' + x.pred + '.'), x.enNum,
        'Semua ' + dd + ' ' + x.pred + '. / ' + x.num + ' ' + dd + ' ' + x.pred + '.'];
    }));

  // 3
  md += '## 3. Penjodoh bilangan\n\n';
  md += 'Shown as "dua ____ kucing" with any number from dua to sepuluh, or as "se____ kucing". Wrong choices come only from: ';
  md += d.MALAY_P2_PB_CORE.join(', ') + '. The last column lists classifiers that are never offered as wrong for that noun, because some speakers accept them.\n\n';
  md += table(['Penjodoh', 'Noun', 'With se-', 'English', 'Never offered as wrong'],
    d.MALAY_P2_PB.map(x => [M(x.pb), M(x.n), M('se' + x.pb + ' ' + x.n), 'one ' + x.one + ' / two ' + x.many, (x.not || []).join(', ')]));
  md += 'Numbers used: ' + Object.keys(d.MALAY_P2_NUM_EN).map(M).join(', ') + '.\n\n';
  md += '### 3b. In a sentence\n\n';
  md += table(['Sentence with the answer in place', 'English', 'Answer and wrong choices'],
    d.MALAY_P2_PB_AYAT.map(x => [M(fill(x.s, x.a)), x.en, x.a + '; ' + wrong(x.o)]));

  // 4
  md += '## 4. Kata tanya\n\n';
  md += table(['Word', 'With -kah', 'English'], d.MALAY_P2_TANYA.map(x => [M(x.w), M(x.kah), x.en]));
  md += '### 4b. Question and reply\n\nThe child sees the question with the first word missing, and the reply. Wrong choices are the other question words in the same form.\n\n';
  md += table(['Question and reply', 'English', 'Never offered as wrong'],
    d.MALAY_P2_TANYA_AYAT.map(x => {
      const t = d.MALAY_P2_TANYA.filter(k => k.w === x.w)[0];
      const word = x.bare ? t.w.charAt(0).toUpperCase() + t.w.slice(1) : t.kah;
      return [M(fill(x.q, word) + ' ' + x.r), x.en, (x.not || []).join(', ')];
    }));

  // 5
  md += '## 5. Kata adjektif, antonim dan sinonim\n\n### 5a. Antonim\n\n';
  md += table(['Word', 'Opposite', 'English', 'Never shown beside this pair'],
    d.MALAY_P2_ANTONIM.map(x => [M(x.a), M(x.b), x.ea + ' / ' + x.eb, x.avoid.join(', ')]));
  md += '### 5b. Sinonim\n\n';
  md += table(['Word', 'Same meaning', 'English', 'Wrong choices'],
    d.MALAY_P2_SINONIM.map(x => { x.o.forEach(M); return [M(x.a), M(x.b), x.en, x.o.join(', ')]; }));
  md += '### 5c. In a sentence\n\n';
  md += table(['Sentence with the answer in place', 'English', 'Answer and wrong choices'],
    d.MALAY_P2_ADJ_AYAT.map(x => [M(fill(x.s, x.a)), x.en, x.a + '; ' + wrong(x.o)]));

  // 6
  md += '## 6. Kata sendi nama\n\n';
  md += table(['Sentence with the answer in place', 'English', 'Answer and wrong choices'],
    d.MALAY_P2_SENDI.map(x => [M(fill(x.s, x.a)), x.en, x.a + '; ' + wrong(x.o)]));
  md += 'Rule notes shown to the child:\n\n' + Object.keys(d.MALAY_P2_SENDI_NOTE).map(k => '- ' + d.MALAY_P2_SENDI_NOTE[k]).join('\n') + '\n\n';

  // 7
  md += '## 7. Kata hubung\n\n';
  md += table(['Word', 'English'], d.MALAY_P2_HUBUNG_KATA.map(x => [M(x.w), x.en]));
  md += table(['Sentence with the answer in place', 'English', 'Answer and wrong choices'],
    d.MALAY_P2_HUBUNG.map(x => [M(fill(x.s, x.a)), x.en, x.a + '; ' + wrong(x.o)]));

  // 8
  md += '## 8. Peribahasa mudah (simpulan bahasa)\n\n### 8a. Meanings\n\n';
  md += table(['Simpulan bahasa', 'English meaning shown', 'Never shown beside it'],
    d.MALAY_P2_SIMPULAN.map(x => [M(x.id), x.en, x.avoid.join(', ')]));
  md += '### 8b. In a sentence\n\n';
  md += table(['Sentence with the answer in place', 'English', 'Answer and wrong choices'],
    d.MALAY_P2_SIMPULAN.filter(x => x.s).map(x => [M(fill(x.s, x.id)), x.sen, x.id + '; ' + wrong(x.o)]));

  // 9
  md += '## 9. Kefahaman\n\n';
  d.MALAY_P2_KEFAHAMAN.forEach((p, i) => {
    md += '### 9.' + (i + 1) + ' ' + M(p.title) + ' (' + p.text.split(/\s+/).length + ' words)\n\n';
    md += '> ' + M(p.text) + '\n\n> *' + p.en + '*\n\nPassage OK: [ ]  Fix:\n\n';
    md += table(['Question', 'Answer', 'Wrong choices', 'English'],
      p.qs.map(q => { q.o.forEach(M); return [M(q.q), M(q.a), q.o.join('; '), q.en]; }));
  });

  // 10
  md += '## 10. Bina ayat (susun perkataan)\n\n';
  md += 'One tile per word. The first tile keeps its capital letter and the last keeps its full stop. Please flag any sentence whose middle words can be put in another order and still be correct.\n\n';
  md += table(['Sentence', 'Words', 'English', 'Also accepted'],
    d.MALAY_P2_BINA.map(x => [M(x.s), x.s.split(' ').length, x.en, (x.also || []).map(M).join(' / ')]));

  // Lessons
  md += '## 11. Lessons (the teaching screens shown before practice)\n\n';
  inLessons = true;
  d.MALAY_P2_SKILLS.forEach(id => {
    const L = d.MALAY_LESSONS[id];
    md += '### ' + L.title + '\n\nOpening line: ' + strip(L.lumiSays) + '\n\n';
    md += table(['Shown on screen', 'Explanation or question', 'Tip, or answer'],
      L.steps.map(s => {
        if (s.visual) M(s.visual.replace(/<br\s*\/?>/g, ' . '));
        if (s.type === 'try') {
          M(s.prompt); M(s.answer);   // wrong options are often mis-spellings on purpose
          return [s.visual || '', s.prompt + ' [' + s.options.join(' / ') + ']', 'Answer: ' + s.answer + '. ' + s.successMsg];
        }
        return [s.visual || '', s.text, s.lumiTip || ''];
      }));
  });

  // Skill names
  inLessons = false;
  md += '## 12. Skill names on the map\n\n';
  md += table(['Name', 'Description shown'], d.MALAY_P2_SKILLS.map(id => [M(d.MALAY_TREE[id].name), d.MALAY_TREE[id].desc]));

  // Word list
  let reviewed = new Set();
  try { reviewed = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'exam-malay-reviewed.json'), 'utf8')).words); } catch (e) {}
  const tokens = t => (t.toLowerCase().match(/[a-z]+(?:-[a-z]+)*/g) || []).filter(w => w.length > 1);
  const words = new Set();
  malay.forEach(t => tokens(t).forEach(w => words.add(w)));
  // A lesson word counts as Malay unless it is plainly English: it turns
  // up in an English gloss, or is on the short list of lesson-only English.
  const english = new Set(LESSON_ENGLISH.split(' '));
  glosses.forEach(g => tokens(g).forEach(w => english.add(w)));
  lessonText.forEach(t => tokens(t).forEach(w => { if (!english.has(w)) words.add(w); }));
  const all = [...words].sort();
  const fresh = all.filter(w => !reviewed.has(w));
  md += '## 13. Every distinct Malay word used\n\n';
  md += all.length + ' words. The ' + fresh.length + ' in **bold** are not on the hand-reviewed list kept for the exam bank ';
  md += '(`test/exam-malay-reviewed.json`), so they have never been checked by a person. Wrong spellings that are offered on purpose ';
  md += '(section 1) are not in this list.\n\n';
  md += all.map(w => reviewed.has(w) ? w : '**' + w + '**').join(', ') + '\n\n';
  md += 'Word list OK: [ ]  Fix:\n';
  return md;
}

module.exports = { build, OUT };

if (require.main === module) {
  fs.writeFileSync(OUT, build());
  console.log('Wrote ' + OUT);
}
