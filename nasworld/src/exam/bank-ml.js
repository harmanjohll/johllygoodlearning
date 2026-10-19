// ============================================================
//  EXAM PREP — Bahasa Melayu (P1 end of year)
// ============================================================
//
//  Standard Malay as taught in Singapore schools (bahasa baku), at the
//  P1 level of the current MOE syllabus (Cita series). Sections follow
//  the format of a school Malay paper: Kosa Kata, Imbuhan, Prosedur
//  Kloz, Susun Perkataan and Kefahaman Objektif.
//
//  Accuracy rules, because a wrong form taught here is a wrong form
//  learned:
//
//    1. Every option is a real Malay word. A child never sees an invented
//       form such as "mentulis", even as a wrong answer. The spelling of
//       an affix is tested by typing it (me- + tulis = menulis) instead,
//       so no wrong form is ever put in front of her.
//    2. Distractors are wrong in context, not merely less likely. In
//       particular no passive di- form is offered where the subject could
//       be on the receiving end: "Kakak dijemput kawannya" is good Malay
//       (she was invited by her friend), so it cannot be a wrong answer.
//    3. Nothing contested is asked: not "Siapa/Apa nama kamu?", not
//       bernyanyi against menyanyi, not rama-rama against kupu-kupu, and
//       no classifier with two accepted answers (pokok, telur, roti).
//    4. Singapore usage: hari jadi, kereta, basikal, wang/duit, darjah
//       satu, kantin, waktu rehat, baharu (new) and baru (just).
//    5. Every item carries an English gloss so a parent can follow it,
//       and so the reviewer can check meaning as well as form.
//
//  Kata tanya are written in their plain forms (Apa, Di mana, Bila) in
//  Kosa Kata, which is how P1 introduces them; comprehension questions
//  use the -kah forms (Apakah, Di manakah) as school papers do. Both
//  are correct standard Malay.
//
//  The meN- rules used throughout (Tatabahasa Dewan):
//    b, f, v -> mem- (b kept)        baca  > membaca
//    p       -> mem- (p dropped)     potong > memotong
//    m, n, ny, ng, l, r, w, y -> me- masak > memasak, lukis > melukis
//    t       -> men- (t dropped)     tulis > menulis
//    c, d, j, z -> men- (kept)       cuci  > mencuci
//    s       -> meny- (s dropped)    sapu  > menyapu
//    k       -> meng- (k dropped)    kutip > mengutip
//    g, h, vowels -> meng- (kept)    gunting > menggunting, ambil > mengambil
//    one-syllable roots -> menge-    lap   > mengelap
//  and for ber-: ber- loses its r before a root starting with r
//  (renang > berenang) or whose first syllable ends in -er
//  (kerja > bekerja); ber- + ajar is the irregular belajar.
// ============================================================

var ML_ITEMS = [];

function mlAdd(section, list) {
  list.forEach(function (it) {
    ML_ITEMS.push(Object.assign({ section: section, level: 1, type: 'mcq' }, it, { id: 'ml-' + it.id }));
  });
}

// ---- KOSA KATA ----------------------------------------------------------------------

mlAdd('kosa', [
  // Words in sentences
  { id: 'ko-ctx-1', skill: 'perkataan', prompt: 'Ibu memasak di ___.', options: ['dapur', 'bilik air', 'padang', 'kereta'], answer: 'dapur',
    gloss: 'Mother cooks in the kitchen.', explain: '**Dapur** means kitchen, the place where we cook.' },
  { id: 'ko-ctx-2', skill: 'perkataan', prompt: 'Adik minum ___ setiap pagi.', options: ['susu', 'nasi', 'roti', 'kuih'], answer: 'susu',
    gloss: 'My younger sibling drinks milk every morning.', explain: '**Minum** means drink. We drink **susu** (milk). Nasi, roti and kuih are things we eat.' },
  { id: 'ko-ctx-3', skill: 'perkataan', prompt: 'Kami membeli sayur di ___.', options: ['pasar', 'perpustakaan', 'klinik', 'kolam renang'], answer: 'pasar',
    gloss: 'We buy vegetables at the market.', explain: 'We buy vegetables at the **pasar** (market).' },
  { id: 'ko-ctx-4', skill: 'perkataan', prompt: 'Kakak meminjam buku di ___.', options: ['perpustakaan', 'kantin', 'dapur', 'taman'], answer: 'perpustakaan',
    gloss: 'My older sister borrows books at the library.', explain: 'We borrow (**meminjam**) books at the **perpustakaan** (library).' },
  { id: 'ko-ctx-5', skill: 'perkataan', prompt: 'Ayah memandu ___ ke pejabat.', options: ['kereta', 'basikal', 'layang-layang', 'kasut'], answer: 'kereta',
    gloss: 'Father drives the car to the office.', explain: '**Memandu** means drive. We drive a **kereta** (car). A basikal (bicycle) is ridden, not driven.' },
  { id: 'ko-ctx-6', skill: 'perkataan', prompt: 'Saya menggosok gigi dengan ___.', options: ['berus gigi', 'sikat', 'sudu', 'pensel'], answer: 'berus gigi',
    gloss: 'I brush my teeth with a toothbrush.', explain: 'We brush our teeth (**menggosok gigi**) with a **berus gigi** (toothbrush).' },
  { id: 'ko-ctx-7', skill: 'perkataan', prompt: 'Hari ini hujan. Saya membawa ___.', options: ['payung', 'bola', 'layang-layang', 'aiskrim'], answer: 'payung',
    gloss: 'It is raining today. I bring an umbrella.', explain: 'When it rains (**hujan**), we bring a **payung** (umbrella).' },
  { id: 'ko-ctx-8', skill: 'perkataan', prompt: 'Kami bermain bola di ___.', options: ['padang', 'dapur', 'bilik tidur', 'perpustakaan'], answer: 'padang',
    gloss: 'We play football on the field.', explain: 'We play ball games on the **padang** (field).' },
  { id: 'ko-ctx-9', skill: 'perkataan', prompt: 'Doktor bekerja di ___.', options: ['klinik', 'pasar', 'kolam renang', 'taman'], answer: 'klinik',
    gloss: 'The doctor works at the clinic.', explain: 'A doctor works at a **klinik** (clinic).' },
  { id: 'ko-ctx-10', skill: 'perkataan', prompt: 'Kucing itu ___ ikan.', options: ['makan', 'minum', 'membaca', 'menulis'], answer: 'makan',
    gloss: 'The cat eats fish.', explain: 'A cat **makan** (eats) fish. We drink (minum) drinks, not fish.' },
  { id: 'ko-ctx-11', skill: 'perkataan', prompt: 'Saya memakai ___ di kaki.', options: ['kasut', 'topi', 'baju', 'cermin mata'], answer: 'kasut',
    gloss: 'I wear shoes on my feet.', explain: 'We wear **kasut** (shoes) on our **kaki** (feet).' },
  { id: 'ko-ctx-12', skill: 'perkataan', prompt: 'Cikgu menulis di ___.', options: ['papan putih', 'pintu', 'tingkap', 'siling'], answer: 'papan putih',
    gloss: 'The teacher writes on the whiteboard.', explain: 'A teacher writes on the **papan putih** (whiteboard).' },
  { id: 'ko-ctx-13', skill: 'perkataan', prompt: 'Kami membeli makanan di ___ semasa rehat.', options: ['kantin', 'perpustakaan', 'tandas', 'bilik darjah'], answer: 'kantin',
    gloss: 'We buy food at the canteen during recess.', explain: 'During recess (**semasa rehat**), we buy food at the **kantin** (canteen).' },
  { id: 'ko-ctx-14', skill: 'perkataan', prompt: 'Bunga itu sangat ___.', options: ['cantik', 'lapar', 'rajin', 'penat'], answer: 'cantik',
    gloss: 'The flower is very pretty.', explain: 'A flower can be **cantik** (pretty). It cannot be hungry (lapar), hardworking (rajin) or tired (penat).' },
  { id: 'ko-ctx-15', skill: 'perkataan', prompt: 'Saya ___ kerana saya tidak makan pagi tadi.', options: ['lapar', 'kenyang', 'tinggi', 'cantik'], answer: 'lapar',
    gloss: 'I am hungry because I did not eat this morning.', explain: 'If you did not eat, you are **lapar** (hungry). Kenyang means full.' },
  { id: 'ko-ctx-16', skill: 'perkataan', prompt: 'Semut itu sangat ___.', options: ['kecil', 'besar', 'tinggi', 'gemuk'], answer: 'kecil',
    gloss: 'The ant is very small.', explain: 'An ant (**semut**) is very **kecil** (small).' },
  { id: 'ko-ctx-17', skill: 'perkataan', prompt: 'Pada waktu malam, kita dapat melihat ___ di langit.', options: ['bulan', 'matahari', 'pelangi', 'payung'], answer: 'bulan',
    gloss: 'At night, we can see the moon in the sky.', explain: 'At night (**waktu malam**) we see the **bulan** (moon). The matahari (sun) shines in the day.' },
  { id: 'ko-ctx-18', skill: 'perkataan', prompt: 'Saya tidur di atas ___.', options: ['katil', 'pinggan', 'cawan', 'pensel'], answer: 'katil',
    gloss: 'I sleep on the bed.', explain: 'We sleep on a **katil** (bed).' },

  // Pictures
  { id: 'ko-pic-1', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🐱' },
    options: ['kucing', 'anjing', 'arnab', 'tikus'], answer: 'kucing', gloss: 'cat', explain: 'This is a **kucing** (cat).' },
  { id: 'ko-pic-2', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🍌' },
    options: ['pisang', 'epal', 'tembikai', 'durian'], answer: 'pisang', gloss: 'banana', explain: 'This is a **pisang** (banana).' },
  { id: 'ko-pic-3', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🐘' },
    options: ['gajah', 'harimau', 'singa', 'monyet'], answer: 'gajah', gloss: 'elephant', explain: 'This is a **gajah** (elephant).' },
  { id: 'ko-pic-4', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '☂️' },
    options: ['payung', 'beg', 'topi', 'kasut'], answer: 'payung', gloss: 'umbrella', explain: 'This is a **payung** (umbrella).' },
  { id: 'ko-pic-5', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🚲' },
    options: ['basikal', 'kereta', 'bas', 'kapal'], answer: 'basikal', gloss: 'bicycle', explain: 'This is a **basikal** (bicycle).' },
  { id: 'ko-pic-6', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🏠' },
    options: ['rumah', 'sekolah', 'kedai', 'hospital'], answer: 'rumah', gloss: 'house', explain: 'This is a **rumah** (house).' },
  { id: 'ko-pic-7', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '📖' },
    options: ['buku', 'pensel', 'pemadam', 'pembaris'], answer: 'buku', gloss: 'book', explain: 'This is a **buku** (book).' },
  { id: 'ko-pic-8', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🍉' },
    options: ['tembikai', 'nanas', 'betik', 'rambutan'], answer: 'tembikai', gloss: 'watermelon', explain: 'This is a **tembikai** (watermelon).' },
  { id: 'ko-pic-9', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🐟' },
    options: ['ikan', 'burung', 'ayam', 'itik'], answer: 'ikan', gloss: 'fish', explain: 'This is an **ikan** (fish).' },
  { id: 'ko-pic-10', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🐝' },
    options: ['lebah', 'semut', 'nyamuk', 'lalat'], answer: 'lebah', gloss: 'bee', explain: 'This is a **lebah** (bee).' },
  { id: 'ko-pic-11', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '👂' },
    options: ['telinga', 'hidung', 'mata', 'mulut'], answer: 'telinga', gloss: 'ear', explain: 'This is a **telinga** (ear).' },
  { id: 'ko-pic-12', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '👃' },
    options: ['hidung', 'telinga', 'mata', 'gigi'], answer: 'hidung', gloss: 'nose', explain: 'This is a **hidung** (nose).' },
  { id: 'ko-pic-13', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '⚽' },
    options: ['bola', 'kasut', 'beg', 'topi'], answer: 'bola', gloss: 'ball', explain: 'This is a **bola** (ball).' },
  { id: 'ko-pic-14', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🍚' },
    options: ['nasi', 'mi', 'roti', 'kuih'], answer: 'nasi', gloss: 'rice', explain: 'This is **nasi** (cooked rice).' },
  { id: 'ko-pic-15', skill: 'gambar', prompt: 'Pilih perkataan yang sesuai dengan gambar.', visual: { kind: 'emoji', text: '🚌' },
    options: ['bas', 'teksi', 'kereta api', 'kapal terbang'], answer: 'bas', gloss: 'bus', explain: 'This is a **bas** (bus).' },

  // Penjodoh bilangan: only nouns with one accepted classifier
  { id: 'ko-pb-1', skill: 'penjodoh-bilangan', prompt: 'Ayah membeli ___ kereta baharu.', options: ['sebuah', 'seekor', 'seorang', 'sehelai'], answer: 'sebuah',
    gloss: 'Father bought a new car.', explain: 'Big things like a car, a house or a bus take **buah**: **sebuah** kereta.' },
  { id: 'ko-pb-2', skill: 'penjodoh-bilangan', prompt: 'Di taman itu ada dua ___ burung.', options: ['ekor', 'orang', 'buah', 'helai'], answer: 'ekor',
    gloss: 'There are two birds in the park.', explain: 'Animals take **ekor**: dua **ekor** burung.' },
  { id: 'ko-pb-3', skill: 'penjodoh-bilangan', prompt: 'Ibu membeli ___ baju untuk saya.', options: ['sehelai', 'seekor', 'sebuah', 'sebatang'], answer: 'sehelai',
    gloss: 'Mother bought a shirt for me.', explain: 'Thin, flat things like clothes and paper take **helai**: **sehelai** baju.' },
  { id: 'ko-pb-4', skill: 'penjodoh-bilangan', prompt: 'Adik ada ___ pensel.', options: ['sebatang', 'sehelai', 'seekor', 'seorang'], answer: 'sebatang',
    gloss: 'My younger sibling has a pencil.', explain: 'Long, thin things like a pencil take **batang**: **sebatang** pensel.' },
  { id: 'ko-pb-5', skill: 'penjodoh-bilangan', prompt: '___ guru sedang mengajar di dalam kelas.', options: ['Seorang', 'Seekor', 'Sebuah', 'Sebiji'], answer: 'Seorang',
    gloss: 'A teacher is teaching in the classroom.', explain: 'People take **orang**: **seorang** guru.' },
  { id: 'ko-pb-6', skill: 'penjodoh-bilangan', prompt: 'Kakak makan ___ epal.', options: ['sebiji', 'sehelai', 'seekor', 'sebatang'], answer: 'sebiji',
    gloss: 'My older sister eats an apple.', explain: 'Small, round things like an apple or a ball take **biji**: **sebiji** epal.' },
  { id: 'ko-pb-7', skill: 'penjodoh-bilangan', prompt: 'Saya melihat tiga ___ kucing di bawah meja.', options: ['ekor', 'buah', 'orang', 'biji'], answer: 'ekor',
    gloss: 'I saw three cats under the table.', explain: 'Animals take **ekor**: tiga **ekor** kucing.' },
  { id: 'ko-pb-8', skill: 'penjodoh-bilangan', prompt: 'Ayah memberi ibu ___ bunga mawar.', options: ['sekuntum', 'seekor', 'sebuah', 'sebatang'], answer: 'sekuntum',
    gloss: 'Father gave Mother a rose.', explain: 'A flower takes **kuntum**: **sekuntum** bunga.' },
  { id: 'ko-pb-9', skill: 'penjodoh-bilangan', prompt: 'Saya memakai ___ kasut sekolah.', options: ['sepasang', 'sebuah', 'seekor', 'sehelai'], answer: 'sepasang',
    gloss: 'I wear a pair of school shoes.', explain: 'Things that come in twos, like shoes, take **pasang**: **sepasang** kasut.' },
  { id: 'ko-pb-10', skill: 'penjodoh-bilangan', prompt: 'Ali menendang ___ bola.', options: ['sebiji', 'seekor', 'sehelai', 'seorang'], answer: 'sebiji',
    gloss: 'Ali kicks a ball.', explain: 'A ball is small and round, so it takes **biji**: **sebiji** bola.' },
  { id: 'ko-pb-11', skill: 'penjodoh-bilangan', prompt: 'Di rumah saya ada dua ___ arnab.', options: ['ekor', 'buah', 'biji', 'orang'], answer: 'ekor',
    gloss: 'There are two rabbits at my house.', explain: 'Animals take **ekor**: dua **ekor** arnab.' },
  { id: 'ko-pb-12', skill: 'penjodoh-bilangan', prompt: 'Ravi menulis di atas ___ kertas.', options: ['sehelai', 'sebiji', 'seekor', 'sebatang'], answer: 'sehelai',
    gloss: 'Ravi writes on a sheet of paper.', explain: 'Paper is thin and flat, so it takes **helai**: **sehelai** kertas.' },

  // Kata tanya, with the answer that settles which question word fits
  { id: 'ko-kt-1', skill: 'kata-tanya', prompt: 'Soalan: ___ kamu pergi ke sekolah?\nJawapan: Saya pergi ke sekolah dengan bas.',
    options: ['Bagaimana', 'Siapa', 'Bila', 'Berapa'], answer: 'Bagaimana',
    gloss: 'How do you go to school? I go to school by bus.', explain: 'The answer says HOW (by bus), so we ask **Bagaimana**.' },
  { id: 'ko-kt-2', skill: 'kata-tanya', prompt: 'Soalan: ___ adik menangis?\nJawapan: Adik menangis kerana dia terjatuh.',
    options: ['Mengapa', 'Di mana', 'Siapa', 'Apa'], answer: 'Mengapa',
    gloss: 'Why is my younger sibling crying? My sibling is crying because of a fall.', explain: 'The answer gives a reason (**kerana**, because), so we ask **Mengapa** (why).' },
  { id: 'ko-kt-3', skill: 'kata-tanya', prompt: 'Soalan: ___ kamu tinggal?\nJawapan: Saya tinggal di Tampines.',
    options: ['Di mana', 'Bila', 'Siapa', 'Mengapa'], answer: 'Di mana',
    gloss: 'Where do you live? I live in Tampines.', explain: 'The answer is a place, so we ask **Di mana** (where).' },
  { id: 'ko-kt-4', skill: 'kata-tanya', prompt: 'Soalan: ___ umur kamu?\nJawapan: Umur saya tujuh tahun.',
    options: ['Berapa', 'Siapa', 'Di mana', 'Mengapa'], answer: 'Berapa',
    gloss: 'How old are you? I am seven years old.', explain: 'The answer is a number, so we ask **Berapa** (how many, how much).' },
  { id: 'ko-kt-5', skill: 'kata-tanya', prompt: 'Soalan: ___ yang memasak di dapur?\nJawapan: Ibu yang memasak di dapur.',
    options: ['Siapa', 'Apa', 'Bila', 'Di mana'], answer: 'Siapa',
    gloss: 'Who is cooking in the kitchen? Mother is cooking in the kitchen.', explain: 'The answer is a person, so we ask **Siapa** (who).' },
  { id: 'ko-kt-6', skill: 'kata-tanya', prompt: 'Soalan: ___ kamu bangun pagi?\nJawapan: Saya bangun pada pukul enam pagi.',
    options: ['Bila', 'Siapa', 'Di mana', 'Berapa'], answer: 'Bila',
    gloss: 'When do you wake up? I wake up at six in the morning.', explain: 'The answer is a time, so we ask **Bila** (when).' },
  { id: 'ko-kt-7', skill: 'kata-tanya', prompt: 'Soalan: ___ yang kamu makan?\nJawapan: Saya makan nasi lemak.',
    options: ['Apa', 'Siapa', 'Bila', 'Di mana'], answer: 'Apa',
    gloss: 'What are you eating? I am eating nasi lemak.', explain: 'The answer is a thing, so we ask **Apa** (what).' }
]);

// ---- IMBUHAN --------------------------------------------------------------------------

function mlType(id, prefix, root, answer, rule, gloss, level) {
  return { id: id, skill: 'imbuhan-' + prefix, type: 'word', level: level || 1,
    prompt: 'Tambahkan imbuhan **' + prefix + '-** pada kata dasar **' + root + '**.', answer: answer,
    explain: rule, gloss: answer + ' = ' + gloss };
}

mlAdd('imbuhan', [
  // Choosing the right form in a sentence
  { id: 'im-ber-1', skill: 'imbuhan-ber', prompt: 'Adik ___ di taman. (main)', options: ['bermain', 'permainan', 'mainan', 'memainkan'], answer: 'bermain',
    gloss: 'My younger sibling plays in the park.', explain: 'The sentence needs an action word: ber- + main = **bermain** (to play). Permainan (a game) and mainan (a toy) are things, not actions. Memainkan needs a thing after it, like memainkan piano.' },
  { id: 'im-ber-3', skill: 'imbuhan-ber', prompt: 'Abang ___ ke sekolah setiap hari. (jalan)', options: ['berjalan', 'perjalanan', 'menjalankan'], answer: 'berjalan',
    gloss: 'My older brother walks to school every day.', explain: 'The sentence needs an action word: ber- + jalan = **berjalan** (to walk). Perjalanan means a journey. Menjalankan means to carry something out, and needs a thing after it.' },
  { id: 'im-ber-5', skill: 'imbuhan-ber', prompt: 'Kakak ___ dengan kawannya. (bual)', options: ['berbual', 'perbualan', 'bualan'], answer: 'berbual',
    gloss: 'My older sister chats with her friend.', explain: 'The sentence needs an action word: ber- + bual = **berbual** (to chat). Perbualan means a conversation.' },
  { id: 'im-ber-6', skill: 'imbuhan-ber', level: 2, prompt: 'Ayah ___ di pejabat. (kerja)', options: ['bekerja', 'pekerjaan', 'mengerjakan'], answer: 'bekerja',
    gloss: 'Father works at the office.', explain: 'ber- + kerja = **bekerja** (to work). Ber- becomes be- because the first syllable of kerja ends in -er. Pekerjaan means a job. Mengerjakan needs a thing after it.' },
  { id: 'im-ber-7', skill: 'imbuhan-ber', prompt: 'Murid-murid ___ di tepi padang. (baris)', options: ['berbaris', 'barisan', 'membariskan'], answer: 'berbaris',
    gloss: 'The pupils line up at the side of the field.', explain: 'ber- + baris = **berbaris** (to line up). Barisan means a line or row. Membariskan needs an object after it.' },
  { id: 'im-ber-8', skill: 'imbuhan-ber', level: 2, prompt: 'Pada hari Ahad, kami ___ ke rumah nenek. (kunjung)', options: ['berkunjung', 'mengunjungi', 'kunjungan'], answer: 'berkunjung',
    gloss: 'On Sunday, we visit Grandmother\'s house.', explain: 'Because of the word **ke** after the gap, we need **berkunjung** (berkunjung ke, to visit). Mengunjungi is followed directly by the place, with no ke: mengunjungi rumah nenek.' },

  { id: 'im-men-1', skill: 'imbuhan-me', prompt: 'Kakak ___ buku cerita. (baca)', options: ['membaca', 'bacaan', 'dibaca'], answer: 'membaca',
    gloss: 'My older sister reads a storybook.', explain: 'Kakak is doing the action, so we need me-: baca starts with b, so me- becomes mem-: **membaca**.' },
  { id: 'im-men-2', skill: 'imbuhan-me', prompt: 'Ibu ___ lantai. (sapu)', options: ['menyapu', 'sapuan', 'disapu'], answer: 'menyapu',
    gloss: 'Mother sweeps the floor.', explain: 'Ibu is doing the action. Sapu starts with s, so me- becomes meny- and the s drops: **menyapu**.' },
  { id: 'im-men-3', skill: 'imbuhan-me', prompt: 'Ayah ___ kereta pada hari Sabtu. (cuci)', options: ['mencuci', 'cucian', 'dicuci'], answer: 'mencuci',
    gloss: 'Father washes the car on Saturday.', explain: 'Ayah is doing the action. Cuci starts with c, so me- becomes men-: **mencuci**.' },
  { id: 'im-men-4', skill: 'imbuhan-me', prompt: 'Saya ___ surat kepada nenek. (tulis)', options: ['menulis', 'tulisan', 'ditulis'], answer: 'menulis',
    gloss: 'I write a letter to Grandmother.', explain: 'Tulis starts with t, so me- becomes men- and the t drops: **menulis**. Tulisan means handwriting or a piece of writing.' },
  { id: 'im-men-5', skill: 'imbuhan-me', prompt: 'Adik ___ gambar kucing. (lukis)', options: ['melukis', 'lukisan', 'dilukis'], answer: 'melukis',
    gloss: 'My younger sibling draws a picture of a cat.', explain: 'Lukis starts with l, so we just add me-: **melukis**. A lukisan is a painting.' },
  { id: 'im-men-6', skill: 'imbuhan-me', prompt: 'Cikgu ___ kami di dalam kelas. (ajar)', options: ['mengajar', 'pelajaran', 'ajaran'], answer: 'mengajar',
    gloss: 'The teacher teaches us in class.', explain: 'Ajar starts with a vowel, so me- becomes meng-: **mengajar** (to teach). Pelajaran means a lesson.' },
  { id: 'im-men-7', skill: 'imbuhan-me', prompt: 'Ali ___ sampah di taman. (kutip)', options: ['mengutip', 'kutipan', 'dikutip'], answer: 'mengutip',
    gloss: 'Ali picks up rubbish in the park.', explain: 'Kutip starts with k, so me- becomes meng- and the k drops: **mengutip**.' },
  { id: 'im-men-8', skill: 'imbuhan-me', prompt: 'Ibu ___ nasi lemak. (masak)', options: ['memasak', 'masakan', 'dimasak'], answer: 'memasak',
    gloss: 'Mother cooks nasi lemak.', explain: 'Masak starts with m, so we just add me-: **memasak**. Masakan means cooking, the food.' },
  { id: 'im-men-9', skill: 'imbuhan-me', prompt: 'Kami ___ ikan di pasar. (beli)', options: ['membeli', 'belian', 'dibeli'], answer: 'membeli',
    gloss: 'We buy fish at the market.', explain: 'Beli starts with b, so me- becomes mem-: **membeli**.' },
  { id: 'im-men-10', skill: 'imbuhan-me', prompt: 'Adik ___ kerana mainannya rosak. (tangis)', options: ['menangis', 'tangisan', 'menangisi'], answer: 'menangis',
    gloss: 'My younger sibling cries because the toy is broken.', explain: 'Tangis starts with t, so me- becomes men- and the t drops: **menangis** (to cry). Menangisi needs a thing after it.' },
  { id: 'im-men-13', skill: 'imbuhan-me', prompt: 'Kakak ___ pokok bunga. (siram)', options: ['menyiram', 'siraman', 'disiram'], answer: 'menyiram',
    gloss: 'My older sister waters the flower plant.', explain: 'Siram starts with s, so me- becomes meny- and the s drops: **menyiram**.' },
  { id: 'im-men-14', skill: 'imbuhan-me', prompt: 'Adik ___ baju baharu. (pakai)', options: ['memakai', 'pakaian', 'pemakaian'], answer: 'memakai',
    gloss: 'My younger sibling wears new clothes.', explain: 'Pakai starts with p, so me- becomes mem- and the p drops: **memakai**. Pakaian means clothes, a thing, not an action.' },

  { id: 'im-ter-1', skill: 'imbuhan-ter', prompt: 'Adik ___ di tepi kolam. (jatuh)', options: ['terjatuh', 'menjatuhkan', 'kejatuhan'], answer: 'terjatuh',
    gloss: 'My younger sibling fell at the side of the pool.', explain: 'Falling was not done on purpose, so we use ter-: **terjatuh**. Menjatuhkan means to drop something, and needs an object.' },
  { id: 'im-ter-2', skill: 'imbuhan-ter', prompt: 'Saya ___ membawa buku latihan. (lupa)', options: ['terlupa', 'melupakan', 'dilupakan'], answer: 'terlupa',
    gloss: 'I forgot to bring my exercise book.', explain: 'Forgetting is not done on purpose, so we use ter-: **terlupa**.' },

  // Typing the form: tests the spelling rule without showing a wrong form
  mlType('im-tb-1', 'ber', 'main', 'bermain', 'ber- + main = **bermain**.', 'to play'),
  mlType('im-tb-2', 'ber', 'jalan', 'berjalan', 'ber- + jalan = **berjalan**.', 'to walk'),
  mlType('im-tb-3', 'ber', 'lari', 'berlari', 'ber- + lari = **berlari**.', 'to run'),
  mlType('im-tb-4', 'ber', 'baris', 'berbaris', 'ber- + baris = **berbaris**.', 'to line up'),
  mlType('im-tb-5', 'ber', 'gaduh', 'bergaduh', 'ber- + gaduh = **bergaduh**.', 'to quarrel'),
  mlType('im-tb-6', 'ber', 'sedih', 'bersedih', 'ber- + sedih = **bersedih**.', 'to be sad'),
  mlType('im-tb-7', 'ber', 'basikal', 'berbasikal', 'ber- + basikal = **berbasikal**.', 'to cycle'),
  mlType('im-tb-8', 'ber', 'renang', 'berenang', 'Renang starts with r, so ber- loses its r: **berenang**, not "berrenang".', 'to swim', 2),
  mlType('im-tb-9', 'ber', 'rehat', 'berehat', 'Rehat starts with r, so ber- loses its r: **berehat**.', 'to rest', 2),
  mlType('im-tb-10', 'ber', 'kerja', 'bekerja', 'The first syllable of kerja ends in -er, so ber- becomes be-: **bekerja**.', 'to work', 2),
  mlType('im-tb-11', 'ber', 'ajar', 'belajar', 'Ber- + ajar is special: it becomes **belajar**. Learn this one by heart.', 'to learn, to study', 3),

  mlType('im-tm-1', 'me', 'baca', 'membaca', 'Baca starts with b, so me- becomes mem-: **membaca**.', 'to read'),
  mlType('im-tm-2', 'me', 'tulis', 'menulis', 'Tulis starts with t, so me- becomes men- and the t drops: **menulis**.', 'to write'),
  mlType('im-tm-3', 'me', 'sapu', 'menyapu', 'Sapu starts with s, so me- becomes meny- and the s drops: **menyapu**.', 'to sweep'),
  mlType('im-tm-4', 'me', 'masak', 'memasak', 'Masak starts with m, so we just add me-: **memasak**.', 'to cook'),
  mlType('im-tm-5', 'me', 'lukis', 'melukis', 'Lukis starts with l, so we just add me-: **melukis**.', 'to draw'),
  mlType('im-tm-6', 'me', 'ambil', 'mengambil', 'Ambil starts with a vowel, so me- becomes meng-: **mengambil**.', 'to take'),
  mlType('im-tm-7', 'me', 'cuci', 'mencuci', 'Cuci starts with c, so me- becomes men-: **mencuci**.', 'to wash'),
  mlType('im-tm-8', 'me', 'potong', 'memotong', 'Potong starts with p, so me- becomes mem- and the p drops: **memotong**.', 'to cut'),
  mlType('im-tm-9', 'me', 'kutip', 'mengutip', 'Kutip starts with k, so me- becomes meng- and the k drops: **mengutip**.', 'to pick up'),
  mlType('im-tm-10', 'me', 'tolong', 'menolong', 'Tolong starts with t, so me- becomes men- and the t drops: **menolong**.', 'to help'),
  mlType('im-tm-11', 'me', 'dengar', 'mendengar', 'Dengar starts with d, so me- becomes men-: **mendengar**.', 'to listen'),
  mlType('im-tm-12', 'me', 'gunting', 'menggunting', 'Gunting starts with g, so me- becomes meng- and the g stays: **menggunting**.', 'to cut with scissors'),
  mlType('im-tm-13', 'me', 'jual', 'menjual', 'Jual starts with j, so me- becomes men-: **menjual**.', 'to sell'),
  mlType('im-tm-14', 'me', 'siram', 'menyiram', 'Siram starts with s, so me- becomes meny- and the s drops: **menyiram**.', 'to water (plants)'),
  mlType('im-tm-15', 'me', 'beli', 'membeli', 'Beli starts with b, so me- becomes mem-: **membeli**.', 'to buy'),
  mlType('im-tm-16', 'me', 'goreng', 'menggoreng', 'Goreng starts with g, so me- becomes meng- and the g stays: **menggoreng**.', 'to fry', 2),
  mlType('im-tm-17', 'me', 'tendang', 'menendang', 'Tendang starts with t, so me- becomes men- and the t drops: **menendang**.', 'to kick'),
  mlType('im-tm-18', 'me', 'jemput', 'menjemput', 'Jemput starts with j, so me- becomes men-: **menjemput**.', 'to invite', 2),

  mlType('im-tt-1', 'ter', 'jatuh', 'terjatuh', 'ter- + jatuh = **terjatuh** (fell, not on purpose).', 'to fall by accident'),
  mlType('im-tt-2', 'ter', 'tidur', 'tertidur', 'ter- + tidur = **tertidur** (fell asleep without meaning to).', 'to fall asleep'),
  mlType('im-tt-3', 'ter', 'lupa', 'terlupa', 'ter- + lupa = **terlupa** (forgot, not on purpose).', 'to forget'),
  mlType('im-tt-4', 'ter', 'tumpah', 'tertumpah', 'ter- + tumpah = **tertumpah** (spilt by accident).', 'to spill by accident', 2)
]);

// ---- SUSUN PERKATAAN ------------------------------------------------------------------
// As on a paper, the word that starts the sentence carries the capital
// letter, and the full stop is given. Where Malay genuinely allows a
// second order, it is accepted.

function mlSusun(id, tiles, gloss, accept, level) {
  return { id: id, skill: 'susun', type: 'arrange', level: level || 1, end: '.',
    prompt: 'Susun perkataan supaya menjadi ayat yang betul.', tiles: tiles.slice(), answer: tiles.slice(),
    accept: accept || [], gloss: gloss,
    // Careful not to state a rule of Malay here: inverted sentences (ayat
    // songsang) and passives are good Malay too. This describes only how
    // these simple sentences are built.
    explain: 'The sentence is: **' + tiles.join(' ') + '.** Start with the word that has a capital letter. In a simple sentence like this one, say who first, then what they do, then the rest.' };
}

mlAdd('susun', [
  mlSusun('su-1', ['Adik', 'sedang', 'makan', 'nasi'], 'My younger sibling is eating rice.'),
  mlSusun('su-2', ['Ibu', 'memasak', 'di', 'dapur'], 'Mother cooks in the kitchen.'),
  mlSusun('su-3', ['Kami', 'bermain', 'bola', 'di', 'taman'], 'We play football in the park.'),
  mlSusun('su-4', ['Ayah', 'membaca', 'surat khabar'], 'Father reads the newspaper.'),
  mlSusun('su-5', ['Saya', 'suka', 'makan', 'nasi lemak'], 'I like to eat nasi lemak.'),
  mlSusun('su-6', ['Kakak', 'menyiram', 'pokok', 'bunga'], 'My older sister waters the flower plant.'),
  mlSusun('su-7', ['Kucing', 'itu', 'tidur', 'di atas', 'kerusi'], 'The cat sleeps on the chair.',
    [['Kucing', 'tidur', 'di atas', 'kerusi', 'itu']]),
  mlSusun('su-8', ['Adik', 'pergi', 'ke', 'sekolah', 'dengan', 'bas'], 'My younger sibling goes to school by bus.',
    [['Adik', 'pergi', 'dengan', 'bas', 'ke', 'sekolah']], 2),
  mlSusun('su-9', ['Datuk', 'membaca', 'buku', 'di', 'ruang tamu'], 'Grandfather reads a book in the living room.'),
  mlSusun('su-11', ['Ibu', 'membeli', 'sayur', 'di', 'pasar'], 'Mother buys vegetables at the market.'),
  mlSusun('su-12', ['Saya', 'menggosok', 'gigi', 'dengan', 'berus gigi'], 'I brush my teeth with a toothbrush.'),
  mlSusun('su-13', ['Nenek', 'sedang', 'menjahit', 'baju'], 'Grandmother is sewing clothes.'),
  mlSusun('su-14', ['Burung', 'itu', 'terbang', 'tinggi'], 'The bird flies high.'),
  mlSusun('su-15', ['Kami', 'berkelah', 'di', 'tepi', 'pantai'], 'We have a picnic by the beach.'),
  mlSusun('su-16', ['Adik', 'menangis', 'kerana', 'lapar'], 'My younger sibling cries because of hunger.'),
  mlSusun('su-17', ['Cikgu', 'mengajar', 'kami', 'membaca'], 'The teacher teaches us to read.'),
  mlSusun('su-18', ['Abang', 'bermain', 'badminton', 'dengan', 'ayah'], 'My older brother plays badminton with Father.',
    [['Abang', 'dengan', 'ayah', 'bermain', 'badminton']], 2),
  mlSusun('su-19', ['Saya', 'memakai', 'baju', 'merah'], 'I am wearing a red shirt.'),
  mlSusun('su-20', ['Mereka', 'makan', 'di', 'kantin'], 'They eat at the canteen.'),
  mlSusun('su-21', ['Adik', 'suka', 'bermain', 'dengan', 'kucing'], 'My younger sibling likes to play with the cat.'),
  mlSusun('su-22', ['Ibu', 'menggoreng', 'ikan', 'untuk', 'makan tengah hari'], 'Mother fries fish for lunch.', null, 2),
  mlSusun('su-23', ['Gajah', 'mempunyai', 'belalai', 'yang', 'panjang'], 'An elephant has a long trunk.', null, 2),
  mlSusun('su-24', ['Kami', 'menonton', 'televisyen', 'bersama-sama'], 'We watch television together.',
    [['Kami', 'bersama-sama', 'menonton', 'televisyen']], 2),
  mlSusun('su-25', ['Ali', 'membantu', 'ibu', 'di', 'dapur'], 'Ali helps Mother in the kitchen.')
]);

// ---- PROSEDUR KLOZ --------------------------------------------------------------------
// Each blank has exactly one option that fits the sentence AND the story.

function mlKloz(passageId, blank, options, answer, explain, skill) {
  return { id: passageId.replace('ml-p-', 'ml-k-') + '-' + blank, skill: skill, type: 'mcq', blank: blank,
    prompt: 'Pilih jawapan untuk tempat kosong (' + blank + ').', options: options, answer: answer, explain: explain };
}

var ML_KLOZ = [
  { id: 'ml-p-pasar', section: 'kloz', kind: 'kloz', title: 'Ke Pasar',
    gloss: 'On Saturday, I went to the market with Mother. At the market, we bought vegetables and fish. Mother bought two big fish. The bag was heavy, so I carried the bag for Mother. I felt happy because I could help Mother.',
    paras: ['Pada hari Sabtu, saya pergi {1} pasar bersama ibu. Di pasar, kami membeli sayur {2} ikan. Ibu membeli dua {3} ikan yang besar. Beg itu berat, jadi saya {4} beg itu untuk ibu. Saya berasa {5} kerana dapat menolong ibu.'],
    items: [
      mlKloz('ml-p-pasar', 1, ['ke', 'di', 'pada'], 'ke', 'We say **pergi ke** (go to) a place. **Di** tells where something is, not where we go.', 'kata-sendi'),
      mlKloz('ml-p-pasar', 2, ['dan', 'tetapi', 'supaya'], 'dan', '**Dan** (and) joins the two things we bought: sayur **dan** ikan.', 'kata-hubung'),
      mlKloz('ml-p-pasar', 3, ['ekor', 'buah', 'orang'], 'ekor', 'Fish are animals, so they take **ekor**: dua **ekor** ikan.', 'penjodoh-bilangan'),
      mlKloz('ml-p-pasar', 4, ['membawa', 'bawaan', 'dibawa'], 'membawa', 'The writer is doing the action, so we need **membawa** (carried). Bawaan is a thing that is carried.', 'imbuhan'),
      mlKloz('ml-p-pasar', 5, ['gembira', 'sedih', 'marah'], 'gembira', 'The writer could help Mother, which is a good feeling: **gembira** (happy).', 'perkataan')
    ] },

  { id: 'ml-p-harijadi', section: 'kloz', kind: 'kloz', title: 'Hari Jadi Adik',
    gloss: 'Today is my younger sibling\'s birthday. Mother made a chocolate cake. My sibling\'s friends came to our house. They sang the Happy Birthday song. My sibling blew out the candles on the cake. Everyone felt happy. My sibling also got a storybook from Grandmother.',
    paras: ['Hari ini hari jadi adik. Ibu membuat sebiji {1} coklat. Kawan-kawan adik datang {2} rumah kami. Mereka menyanyikan lagu Selamat Hari Jadi. Adik {3} lilin di atas kek itu. Semua orang berasa {4}. Adik juga mendapat {5} buku cerita daripada nenek.'],
    items: [
      mlKloz('ml-p-harijadi', 1, ['kek', 'pensel', 'baju'], 'kek', '**Sebiji** goes with round things to eat, like a **kek** (cake). We do not say sebiji pensel or sebiji baju.', 'perkataan'),
      mlKloz('ml-p-harijadi', 2, ['ke', 'di', 'pada'], 'ke', 'We say **datang ke** (come to) a place.', 'kata-sendi'),
      mlKloz('ml-p-harijadi', 3, ['meniup', 'tiupan', 'ditiup'], 'meniup', 'Adik is doing the action. Tiup starts with t, so it becomes **meniup** (blew).', 'imbuhan'),
      mlKloz('ml-p-harijadi', 4, ['gembira', 'sedih', 'takut'], 'gembira', 'It is a birthday party, so everyone felt **gembira** (happy).', 'perkataan'),
      mlKloz('ml-p-harijadi', 5, ['sebuah', 'seekor', 'sehelai'], 'sebuah', 'A book takes **buah**: **sebuah** buku.', 'penjodoh-bilangan')
    ] },

  { id: 'ml-p-sekolah', section: 'kloz', kind: 'kloz', title: 'Sekolah Saya',
    gloss: 'My name is Amin. I am seven years old. I study in Primary 1. Every morning, I go to school by bus. In class, the teacher teaches us to read. At recess, I eat at the canteen. I like my school because my friends are kind.',
    paras: ['Nama saya Amin. Saya berumur tujuh tahun. Saya {1} di darjah satu. Setiap pagi, saya pergi ke sekolah {2} bas. Di dalam kelas, cikgu {3} kami membaca. Pada waktu rehat, saya makan di {4}. Saya suka sekolah saya {5} kawan-kawan saya baik.'],
    items: [
      mlKloz('ml-p-sekolah', 1, ['belajar', 'mengajar', 'pelajaran'], 'belajar', 'Amin is seven years old, so Amin is a pupil who **belajar** (studies). Mengajar means to teach.', 'imbuhan'),
      mlKloz('ml-p-sekolah', 2, ['dengan', 'di', 'ke'], 'dengan', 'We go somewhere **dengan** (by) bus.', 'kata-sendi'),
      mlKloz('ml-p-sekolah', 3, ['mengajar', 'belajar', 'ajaran'], 'mengajar', 'The teacher **mengajar** (teaches) us.', 'imbuhan'),
      mlKloz('ml-p-sekolah', 4, ['kantin', 'perpustakaan', 'tandas'], 'kantin', 'At recess we eat at the **kantin** (canteen).', 'perkataan'),
      mlKloz('ml-p-sekolah', 5, ['kerana', 'tetapi', 'atau'], 'kerana', '**Kerana** (because) gives the reason Amin likes school: the friends there are kind.', 'kata-hubung')
    ] },

  { id: 'ml-p-kucing', section: 'kloz', kind: 'kloz', title: 'Kucing Saya',
    gloss: 'I have a cat. Its name is Tompok. Tompok\'s fur is white and black. Tompok likes to lie on the sofa. At night, Tompok sleeps in my room. Tompok also likes to play with a small ball.',
    paras: ['Saya ada {1} kucing. Namanya Tompok. Bulu Tompok berwarna putih {2} hitam. Tompok suka {3} di atas sofa. Pada waktu malam, Tompok tidur {4} bilik saya. Tompok juga suka bermain {5} bola kecil.'],
    items: [
      mlKloz('ml-p-kucing', 1, ['seekor', 'sebuah', 'seorang'], 'seekor', 'A cat is an animal, so it takes **ekor**: **seekor** kucing.', 'penjodoh-bilangan'),
      mlKloz('ml-p-kucing', 2, ['dan', 'tetapi', 'supaya'], 'dan', '**Dan** (and) joins the two colours: putih **dan** hitam.', 'kata-hubung'),
      mlKloz('ml-p-kucing', 3, ['berbaring', 'membaca', 'menulis'], 'berbaring', 'A cat likes to **berbaring** (lie down) on the sofa. A cat cannot read or write.', 'perkataan'),
      mlKloz('ml-p-kucing', 4, ['di', 'ke', 'dari'], 'di', '**Di** tells us where Tompok sleeps: **di** bilik saya (in my room).', 'kata-sendi'),
      mlKloz('ml-p-kucing', 5, ['dengan', 'ke', 'di'], 'dengan', 'We play **dengan** (with) something: bermain **dengan** bola.', 'kata-sendi')
    ] },

  { id: 'ml-p-raya', section: 'kloz', kind: 'kloz', title: 'Hari Raya',
    gloss: 'Tomorrow is Hari Raya Aidilfitri. Mother cleans the house. Father puts up colourful lights outside the house. On the morning of Hari Raya, we wear new clothes. We shake hands with Grandfather and Grandmother. We also eat ketupat and rendang. My younger sibling gets a lot of duit raya.',
    paras: ['Esok Hari Raya Aidilfitri. Ibu membersihkan rumah. Ayah {1} lampu berwarna-warni di luar rumah. Pada pagi Hari Raya, kami memakai baju {2}. Kami bersalaman {3} datuk dan nenek. Kami juga makan ketupat {4} rendang. Adik mendapat {5} duit raya.'],
    items: [
      mlKloz('ml-p-raya', 1, ['memasang', 'pasangan', 'dipasang'], 'memasang', 'Ayah is doing the action. Pasang starts with p, so it becomes **memasang** (puts up).', 'imbuhan'),
      mlKloz('ml-p-raya', 2, ['baharu', 'lapar', 'sakit'], 'baharu', 'On Hari Raya we wear baju **baharu** (new clothes). Clothes cannot be hungry or ill.', 'perkataan'),
      mlKloz('ml-p-raya', 3, ['dengan', 'ke', 'di'], 'dengan', 'We shake hands **dengan** (with) someone.', 'kata-sendi'),
      mlKloz('ml-p-raya', 4, ['dan', 'tetapi', 'supaya'], 'dan', '**Dan** (and) joins the two foods: ketupat **dan** rendang.', 'kata-hubung'),
      mlKloz('ml-p-raya', 5, ['banyak', 'ramai', 'seekor'], 'banyak', 'We use **banyak** for things, like money. **Ramai** is only for people: ramai orang.', 'perkataan')
    ] },

  { id: 'ml-p-taman', section: 'kloz', kind: 'kloz', title: 'Di Taman',
    gloss: 'In the evening, Ali and Ahmad went to the park. They played football on the field. Suddenly, Ahmad fell because Ahmad\'s foot tripped on a stone. Ahmad\'s knee was bleeding. Ali felt worried. Ali helped Ahmad to get up. They went home. Ahmad\'s mother cleaned the wound with medicine.',
    paras: ['Pada waktu petang, Ali dan Ahmad pergi ke taman. Mereka {1} bola di padang. Tiba-tiba, Ahmad {2} kerana kakinya tersandung batu. Lututnya berdarah. Ali berasa {3}. Ali menolong Ahmad bangun. Mereka pulang {4} rumah. Ibu Ahmad membersihkan luka itu {5} ubat.'],
    items: [
      mlKloz('ml-p-taman', 1, ['bermain', 'permainan', 'mainan'], 'bermain', 'They are doing an action: **bermain** bola (playing football).', 'imbuhan'),
      mlKloz('ml-p-taman', 2, ['terjatuh', 'menjatuhkan', 'kejatuhan'], 'terjatuh', 'Ahmad did not fall on purpose, so we use ter-: **terjatuh**.', 'imbuhan'),
      mlKloz('ml-p-taman', 3, ['risau', 'gembira', 'bangga'], 'risau', 'A friend was hurt and bleeding, so Ali felt **risau** (worried).', 'perkataan'),
      mlKloz('ml-p-taman', 4, ['ke', 'di', 'pada'], 'ke', 'We say **pulang ke** rumah (go home).', 'kata-sendi'),
      mlKloz('ml-p-taman', 5, ['dengan', 'ke', 'di'], 'dengan', 'The wound was cleaned **dengan** (with) medicine.', 'kata-sendi')
    ] }
];

// ---- KEFAHAMAN OBJEKTIF ---------------------------------------------------------------

function mlQ(id, prompt, options, answer, explain, gloss, skill) {
  return { id: id, skill: skill || 'tersurat', type: 'mcq', prompt: prompt, options: options, answer: answer, explain: explain, gloss: gloss };
}

var ML_KEFAHAMAN = [
  { id: 'ml-p-keluarga', section: 'kefahaman', title: 'Keluarga Saya',
    gloss: 'My name is Nurul. I am seven years old. I live in Jurong with my family. My father is a doctor. My mother is a teacher. I have an older brother and a younger sibling. My older brother is ten years old. My younger sibling is only two years old. At the weekend, we like to have picnics at the park.',
    paras: ['Nama saya Nurul. Saya berumur tujuh tahun. Saya tinggal di Jurong bersama keluarga saya.',
            'Ayah saya seorang doktor. Ibu saya seorang guru. Saya ada seorang abang dan seorang adik. Abang saya berumur sepuluh tahun. Adik saya baru berumur dua tahun.',
            'Pada hujung minggu, kami suka berkelah di taman.'],
    items: [
      mlQ('ml-f-kel-1', 'Berapakah umur Nurul?', ['tujuh tahun', 'sepuluh tahun', 'dua tahun', 'lapan tahun'], 'tujuh tahun',
        'The passage says: "Saya berumur **tujuh tahun**." (Ten is Nurul\'s brother; two is Nurul\'s younger sibling.)', 'How old is Nurul? Seven years old.'),
      mlQ('ml-f-kel-2', 'Di manakah Nurul tinggal?', ['di Jurong', 'di Tampines', 'di Bedok', 'di Woodlands'], 'di Jurong',
        'The passage says: "Saya tinggal **di Jurong**."', 'Where does Nurul live? In Jurong.'),
      mlQ('ml-f-kel-3', 'Apakah pekerjaan ibu Nurul?', ['guru', 'doktor', 'jururawat', 'pemandu'], 'guru',
        'The passage says: "Ibu saya seorang **guru**." (The doctor is Nurul\'s father.)', 'What is Nurul\'s mother\'s job? A teacher.'),
      mlQ('ml-f-kel-4', 'Siapakah yang berumur sepuluh tahun?', ['abang Nurul', 'adik Nurul', 'Nurul', 'ibu Nurul'], 'abang Nurul',
        'The passage says: "**Abang** saya berumur sepuluh tahun."', 'Who is ten years old? Nurul\'s older brother.'),
      mlQ('ml-f-kel-5', 'Apakah yang keluarga Nurul suka lakukan pada hujung minggu?', ['berkelah di taman', 'berenang di kolam', 'membeli-belah di pasar', 'menonton wayang'], 'berkelah di taman',
        'The passage says: "Pada hujung minggu, kami suka **berkelah di taman**."', 'What does Nurul\'s family like to do at the weekend? Have a picnic at the park.')
    ] },

  { id: 'ml-p-zoo', section: 'kefahaman', title: 'Ke Zoo',
    gloss: 'On Sunday, Ravi went to the zoo with the family. They took a bus there. At the zoo, Ravi saw a big elephant. The elephant was eating bananas. Ravi also saw a monkey swinging in a tree. Ravi felt very happy. Before going home, Ravi bought a book about animals.',
    paras: ['Pada hari Ahad, Ravi dan keluarganya pergi ke zoo. Mereka menaiki bas ke sana.',
            'Di zoo, Ravi melihat seekor gajah yang besar. Gajah itu sedang makan pisang. Ravi juga melihat monyet yang sedang bergayut di pokok. Ravi berasa sangat gembira.',
            'Sebelum pulang, Ravi membeli sebuah buku tentang haiwan.'],
    items: [
      mlQ('ml-f-zoo-1', 'Bilakah Ravi pergi ke zoo?', ['pada hari Ahad', 'pada hari Sabtu', 'pada hari Isnin', 'pada hari Jumaat'], 'pada hari Ahad',
        'The passage says: "**Pada hari Ahad**, Ravi dan keluarganya pergi ke zoo."', 'When did Ravi go to the zoo? On Sunday.'),
      mlQ('ml-f-zoo-2', 'Bagaimanakah Ravi dan keluarganya pergi ke zoo?', ['dengan bas', 'dengan kereta', 'dengan teksi', 'dengan kereta api'], 'dengan bas',
        'The passage says: "Mereka **menaiki bas** ke sana."', 'How did Ravi\'s family go to the zoo? By bus.'),
      mlQ('ml-f-zoo-3', 'Apakah yang sedang dimakan oleh gajah itu?', ['pisang', 'rumput', 'epal', 'roti'], 'pisang',
        'The passage says: "Gajah itu sedang makan **pisang**."', 'What was the elephant eating? Bananas.'),
      mlQ('ml-f-zoo-4', 'Apakah yang sedang dilakukan oleh monyet itu?', ['bergayut di pokok', 'makan pisang', 'tidur', 'berenang'], 'bergayut di pokok',
        'The passage says: "Ravi juga melihat monyet yang sedang **bergayut di pokok**."', 'What was the monkey doing? Swinging in a tree.'),
      mlQ('ml-f-zoo-5', 'Apakah yang Ravi beli sebelum pulang?', ['sebuah buku tentang haiwan', 'seekor gajah', 'sebiji bola', 'sebatang pensel'], 'sebuah buku tentang haiwan',
        'The passage says: "Sebelum pulang, Ravi membeli **sebuah buku tentang haiwan**."', 'What did Ravi buy before going home? A book about animals.')
    ] },

  { id: 'ml-p-sakit', section: 'kefahaman', title: 'Adik Sakit',
    gloss: 'Yesterday, my younger sibling had a fever. My sibling\'s body was hot. Mother took my sibling to the clinic. The doctor examined my sibling and gave medicine. The doctor advised my sibling to rest and drink a lot of water. Today, my sibling is well again, and can go back to school.',
    paras: ['Semalam, adik demam. Badannya panas. Ibu membawa adik ke klinik.',
            'Doktor memeriksa adik. Doktor memberi adik ubat. Doktor menasihati adik supaya berehat dan minum banyak air.',
            'Hari ini, adik sudah sihat. Adik dapat pergi ke sekolah semula.'],
    items: [
      mlQ('ml-f-sak-1', 'Mengapakah ibu membawa adik ke klinik?', ['Adik demam.', 'Adik lapar.', 'Adik mahu bermain.', 'Adik mahu membeli ubat.'], 'Adik demam.',
        'The passage says: "Semalam, **adik demam**. Badannya panas. Ibu membawa adik ke klinik."', 'Why did Mother take my younger sibling to the clinic? My sibling had a fever.', 'tersirat'),
      mlQ('ml-f-sak-2', 'Siapakah yang memeriksa adik?', ['doktor', 'ibu', 'cikgu', 'ayah'], 'doktor',
        'The passage says: "**Doktor** memeriksa adik."', 'Who examined my younger sibling? The doctor.'),
      mlQ('ml-f-sak-3', 'Apakah nasihat doktor kepada adik?', ['berehat dan minum banyak air', 'makan banyak gula-gula', 'bermain di luar', 'menonton televisyen'], 'berehat dan minum banyak air',
        'The passage says: "Doktor menasihati adik supaya **berehat dan minum banyak air**."', 'What did the doctor advise? To rest and drink a lot of water.'),
      mlQ('ml-f-sak-4', 'Bilakah adik demam?', ['semalam', 'hari ini', 'esok', 'minggu depan'], 'semalam',
        'The passage says: "**Semalam**, adik demam."', 'When did my younger sibling have a fever? Yesterday.'),
      mlQ('ml-f-sak-5', 'Bagaimanakah keadaan adik hari ini?', ['sudah sihat', 'masih demam', 'sedang tidur', 'berasa lapar'], 'sudah sihat',
        'The passage says: "Hari ini, adik **sudah sihat**."', 'How is my younger sibling today? Already well.')
    ] },

  { id: 'ml-p-kelas', section: 'kefahaman', title: 'Membersihkan Kelas',
    gloss: 'On Friday, the Primary 1 pupils cleaned their classroom. Ali swept the floor. Mei Ling wiped the windows. Ravi and Siti arranged the books on the shelf. Cikgu Aminah praised them because they worked together. After that, their classroom became clean and beautiful.',
    paras: ['Pada hari Jumaat, murid-murid darjah satu membersihkan kelas mereka.',
            'Ali menyapu lantai. Mei Ling mengelap tingkap. Ravi dan Siti menyusun buku di atas rak.',
            'Cikgu Aminah memuji mereka kerana mereka bekerjasama. Selepas itu, kelas mereka menjadi bersih dan cantik.'],
    items: [
      mlQ('ml-f-kls-1', 'Siapakah yang menyapu lantai?', ['Ali', 'Mei Ling', 'Ravi', 'Siti'], 'Ali',
        'The passage says: "**Ali** menyapu lantai."', 'Who swept the floor? Ali.'),
      mlQ('ml-f-kls-2', 'Apakah yang dilakukan oleh Mei Ling?', ['mengelap tingkap', 'menyapu lantai', 'menyusun buku', 'membaca buku'], 'mengelap tingkap',
        'The passage says: "Mei Ling **mengelap tingkap**."', 'What did Mei Ling do? Mei Ling wiped the windows.'),
      mlQ('ml-f-kls-3', 'Di manakah Ravi dan Siti menyusun buku?', ['di atas rak', 'di bawah meja', 'di dalam beg', 'di atas lantai'], 'di atas rak',
        'The passage says: "Ravi dan Siti menyusun buku **di atas rak**."', 'Where did Ravi and Siti arrange the books? On the shelf.'),
      mlQ('ml-f-kls-4', 'Mengapakah Cikgu Aminah memuji mereka?', ['kerana mereka bekerjasama', 'kerana mereka bising', 'kerana mereka lambat', 'kerana mereka bermain'], 'kerana mereka bekerjasama',
        'The passage says: "Cikgu Aminah memuji mereka **kerana mereka bekerjasama**."', 'Why did Cikgu Aminah praise them? Because they worked together.', 'tersirat'),
      mlQ('ml-f-kls-5', 'Bagaimanakah keadaan kelas itu akhirnya?', ['bersih dan cantik', 'kotor dan bising', 'gelap dan sejuk', 'kecil dan sempit'], 'bersih dan cantik',
        'The passage says: "kelas mereka menjadi **bersih dan cantik**."', 'What was the classroom like in the end? Clean and beautiful.')
    ] },

  { id: 'ml-p-rambutan', section: 'kefahaman', title: 'Pokok Rambutan',
    gloss: 'In Grandfather\'s front yard there is a rambutan tree. The tree is very tall. When the fruit season comes, the tree bears a lot of fruit. Rambutans are red and taste sweet. My cousin and I like to pick rambutans together with Grandfather. We eat the rambutans under the tree.',
    paras: ['Di halaman rumah datuk ada sebatang pokok rambutan. Pokok itu sangat tinggi.',
            'Apabila musim buah tiba, pokok itu berbuah lebat. Buah rambutan berwarna merah dan rasanya manis.',
            'Saya dan sepupu saya suka memetik buah rambutan bersama-sama datuk. Kami makan rambutan di bawah pokok itu.'],
    items: [
      mlQ('ml-f-ram-1', 'Di manakah pokok rambutan itu?', ['di halaman rumah datuk', 'di sekolah', 'di taman', 'di pasar'], 'di halaman rumah datuk',
        'The passage says: "**Di halaman rumah datuk** ada sebatang pokok rambutan."', 'Where is the rambutan tree? In Grandfather\'s front yard.'),
      mlQ('ml-f-ram-2', 'Apakah warna buah rambutan dalam petikan itu?', ['merah', 'hijau', 'kuning', 'ungu'], 'merah',
        'The passage says: "Buah rambutan berwarna **merah**."', 'What colour are the rambutans in the passage? Red.'),
      mlQ('ml-f-ram-3', 'Bagaimanakah rasa buah rambutan itu?', ['manis', 'masam', 'pahit', 'masin'], 'manis',
        'The passage says: "rasanya **manis**."', 'How do the rambutans taste? Sweet.'),
      mlQ('ml-f-ram-4', 'Siapakah yang memetik buah rambutan bersama-sama datuk?', ['penulis dan sepupunya', 'ibu dan ayah', 'nenek', 'kawan-kawan penulis'], 'penulis dan sepupunya',
        'The passage says: "**Saya dan sepupu saya** suka memetik buah rambutan bersama-sama datuk." "Saya" is the writer (penulis).', 'Who picks rambutans with Grandfather? The writer and the writer\'s cousin.'),
      mlQ('ml-f-ram-5', 'Di manakah mereka makan rambutan?', ['di bawah pokok itu', 'di dalam rumah', 'di dapur', 'di sekolah'], 'di bawah pokok itu',
        'The passage says: "Kami makan rambutan **di bawah pokok itu**."', 'Where do they eat the rambutans? Under the tree.')
    ] },

  // National Day is 9 August, a public holiday, so schools hold their
  // celebration on a school day before it. The passage says so, because a
  // Singapore child knows it and would rightly doubt a passage that didn't.
  { id: 'ml-p-kebangsaan', section: 'kefahaman', title: 'Hari Kebangsaan',
    gloss: 'Singapore celebrates National Day on 9 August every year. Before that day, we celebrated National Day at school. All the pupils wore red and white clothes. We sang Majulah Singapura. We also waved small flags. After that, we watched a dance performance. I am proud to be Singaporean.',
    paras: ['Hari Kebangsaan Singapura disambut pada 9 Ogos setiap tahun. Sebelum hari itu, kami menyambut Hari Kebangsaan di sekolah. Semua murid memakai baju merah dan putih.',
            'Kami menyanyikan lagu Majulah Singapura. Kami juga melambai-lambaikan bendera kecil. Selepas itu, kami menonton persembahan tarian.',
            'Saya bangga menjadi rakyat Singapura.'],
    items: [
      mlQ('ml-f-keb-1', 'Bilakah Hari Kebangsaan Singapura disambut?', ['pada 9 Ogos', 'pada 1 Januari', 'pada 25 Disember', 'pada 31 Ogos'], 'pada 9 Ogos',
        'The passage says: "Hari Kebangsaan Singapura disambut **pada 9 Ogos** setiap tahun."', 'When is Singapore\'s National Day celebrated? On 9 August.'),
      mlQ('ml-f-keb-2', 'Apakah warna baju yang dipakai oleh murid-murid?', ['merah dan putih', 'biru dan kuning', 'hijau dan hitam', 'ungu dan putih'], 'merah dan putih',
        'The passage says: "Semua murid memakai baju **merah dan putih**."', 'What colour clothes did the pupils wear? Red and white.'),
      mlQ('ml-f-keb-3', 'Apakah lagu yang dinyanyikan oleh mereka?', ['Majulah Singapura', 'Selamat Hari Jadi', 'Bangau oh Bangau', 'Burung Kakak Tua'], 'Majulah Singapura',
        'The passage says: "Kami menyanyikan lagu **Majulah Singapura**."', 'What song did they sing? Majulah Singapura.'),
      mlQ('ml-f-keb-4', 'Apakah yang dilambai-lambaikan oleh murid-murid?', ['bendera kecil', 'belon', 'sapu tangan', 'buku'], 'bendera kecil',
        'The passage says: "Kami juga melambai-lambaikan **bendera kecil**."', 'What did the pupils wave? Small flags.'),
      mlQ('ml-f-keb-5', 'Bagaimanakah perasaan penulis?', ['bangga', 'takut', 'marah', 'sedih'], 'bangga',
        'The passage says: "Saya **bangga** menjadi rakyat Singapura."', 'How does the writer feel? Proud.', 'tersirat')
    ] }
];

registerExamSubject({
  id: 'ml', name: 'Bahasa Melayu', icon: '🌺', lang: 'ms-MY', minutes: 40,
  sections: [
    { id: 'kosa', name: 'Kosa Kata', count: 8, practiceCount: 10, instructions: 'Pilih jawapan yang betul.',
      blurb: 'Words in sentences, pictures, penjodoh bilangan, kata tanya' },
    { id: 'imbuhan', name: 'Imbuhan', count: 6, practiceCount: 10, instructions: 'Pilih atau tulis perkataan yang betul.',
      blurb: 'ber-, me- and ter-' },
    { id: 'kloz', name: 'Prosedur Kloz', passages: 1, perPassage: 5, practicePassages: 2,
      instructions: 'Baca petikan. Pilih perkataan yang betul untuk setiap tempat kosong.', blurb: 'Fill the gaps in a short passage' },
    { id: 'susun', name: 'Susun Perkataan', count: 5, practiceCount: 8, instructions: 'Susun perkataan supaya menjadi ayat yang betul.',
      blurb: 'Put the words in the right order' },
    { id: 'kefahaman', name: 'Kefahaman Objektif', passages: 1, perPassage: 5, practicePassages: 2,
      instructions: 'Baca petikan. Kemudian, pilih jawapan yang betul.', blurb: 'Read a passage and answer the questions' }
  ],
  items: ML_ITEMS,
  passages: ML_KLOZ.concat(ML_KEFAHAMAN)
});
