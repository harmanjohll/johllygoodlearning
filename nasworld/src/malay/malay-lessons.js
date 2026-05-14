// ============================================================
//  MALAY LESSONS — Visual step-by-step lessons for Bahasa Melayu
//  Aimed at lower-primary learners. Each lesson teaches before quizzing.
// ============================================================

var MALAY_LESSONS = {
  huruf: {
    title: 'Huruf & Bunyi',
    icon: '🔤',
    lumiSays: 'Bahasa Melayu has the same alphabet as English, but the sounds are sometimes different. Let me show you!',
    steps: [
      { visual: '<div style="font-size:42px;letter-spacing:8px">a e i o u</div>', text: 'These are the <b>huruf vokal</b> (vowels). Each one has one steady sound: <b>ah, eh, ee, oh, oo</b>.', lumiTip: 'In Malay you usually say letters the same way every time. Tidy!' },
      { visual: '<div style="font-size:34px">b + a = <b>ba</b></div><div style="font-size:34px">k + a = <b>ka</b></div>', text: 'Stick a consonant to a vowel and you get a <b>suku kata</b> (syllable).', lumiTip: 'Malay words are built from these little blocks.' },
      { visual: '<div style="font-size:28px"><b>ba</b> + <b>pa</b> = <b>bapa</b> 👨</div><div style="font-size:28px"><b>i</b> + <b>bu</b> = <b>ibu</b> 👩</div>', text: 'Two syllables clipped together make a word: <b>bapa</b> (father), <b>ibu</b> (mother).', lumiTip: 'Most P1 Malay words are two syllables. Watch for the pattern!' },
      { type: 'try', prompt: 'Which is a vowel?', options: ['b','o','t','k'], answer: 'o', successMsg: '“o” is a vokal — yes!' },
      { type: 'try', prompt: 'What word do these syllables make? <b>ka + ki</b>', options: ['kaki','kuku','kuca'], answer: 'kaki', successMsg: '<b>kaki</b> means foot / leg!' }
    ]
  },

  nombor: {
    title: 'Nombor 1-20',
    icon: '🔢',
    lumiSays: 'Counting in Malay is so neat once you get to ten. Let me prove it.',
    steps: [
      { visual: '<div style="font-size:24px">1 satu · 2 dua · 3 tiga · 4 empat · 5 lima</div>', text: 'Here are the first five Malay numbers. Say each one out loud!', lumiTip: 'Try counting your fingers in Malay right now.' },
      { visual: '<div style="font-size:24px">6 enam · 7 tujuh · 8 lapan · 9 sembilan · 10 sepuluh</div>', text: 'And the next five. <b>Sepuluh</b> = ten.', lumiTip: 'Once you know 1-10, the rest is easy!' },
      { visual: '<div style="font-size:22px;line-height:1.6">11 = <b>se</b>-belas<br>12 = <b>dua</b>-belas<br>13 = <b>tiga</b>-belas</div>', text: 'For 11-19, take the small number and add <b>-belas</b>. <b>Sebelas, dua belas, tiga belas...</b>', lumiTip: 'It is literally “one-teen, two-teen, three-teen”.' },
      { visual: '<div style="font-size:32px"><b>20 = dua puluh</b></div>', text: '20 is <b>dua puluh</b> — two tens. After that you keep stacking: 21 = <b>dua puluh satu</b>.', lumiTip: 'Malay numbers stay logical all the way up!' },
      { type: 'try', prompt: 'What is <b>tiga</b> in numbers?', options: ['1','3','5'], answer: '3', successMsg: 'Tiga = 3!' },
      { type: 'try', prompt: 'How do you say <b>7</b> in Malay?', options: ['lima','tujuh','lapan'], answer: 'tujuh', successMsg: 'Tujuh = 7!' }
    ]
  },

  salam: {
    title: 'Salam & Sopan',
    icon: '👋',
    lumiSays: 'Manners matter, princess! In Singapore, knowing your Malay greetings will get you smiles everywhere.',
    steps: [
      { visual: '<div style="font-size:30px">🌅 Selamat pagi!</div>', text: '<b>Selamat pagi</b> means "Good morning". Say it before noon.', lumiTip: 'It literally means "safe morning". Sweet, right?' },
      { visual: '<div style="font-size:30px">☀️ Selamat petang!</div><div style="font-size:30px">🌙 Selamat malam!</div>', text: '<b>Selamat petang</b> = good afternoon. <b>Selamat malam</b> = good night.', lumiTip: 'Notice the pattern: <b>Selamat ___</b>.' },
      { visual: '<div style="font-size:24px">😊 Apa khabar?</div><div style="font-size:24px">👍 Khabar baik!</div>', text: 'Ask <b>"Apa khabar?"</b> (how are you?). Reply <b>"Khabar baik"</b> (I am well).', lumiTip: 'Use it on Cik Guru, your neighbours, anyone!' },
      { visual: '<div style="font-size:24px">🙏 Terima kasih</div><div style="font-size:24px">🤗 Sama-sama</div>', text: 'Thank someone with <b>"Terima kasih"</b>. They will reply <b>"Sama-sama"</b> (you are welcome).', lumiTip: 'Saying terima kasih is the easiest way to make someone smile.' },
      { type: 'try', prompt: 'What do you say at night?', options: ['Selamat pagi','Selamat petang','Selamat malam'], answer: 'Selamat malam', successMsg: 'Yes — malam = night!' },
      { type: 'try', prompt: 'Someone helps you carry your bag. You say…', options: ['Maaf','Terima kasih','Tolong'], answer: 'Terima kasih', successMsg: 'Terima kasih = thank you!' }
    ]
  },

  warna: {
    title: 'Warna-warni',
    icon: '🎨',
    lumiSays: 'Colours in Malay sound like little songs. Ready?',
    steps: [
      { visual: '<div style="font-size:28px">❤️ <b>merah</b> · 💙 <b>biru</b> · 💛 <b>kuning</b></div>', text: 'Three to start: <b>merah</b> (red), <b>biru</b> (blue), <b>kuning</b> (yellow).', lumiTip: 'Try shouting them while pointing at your clothes!' },
      { visual: '<div style="font-size:28px">💚 <b>hijau</b> · 🖤 <b>hitam</b> · 🤍 <b>putih</b></div>', text: '<b>Hijau</b> = green, <b>hitam</b> = black, <b>putih</b> = white.', lumiTip: 'Hijau is the colour of leaves — daun hijau!' },
      { visual: '<div style="font-size:24px">🌸 <b>merah jambu</b> = pink<br>🧡 <b>jingga</b> = orange<br>💜 <b>ungu</b> = purple</div>', text: '"Pink" is literally <b>merah jambu</b> — the colour of a jambu fruit!', lumiTip: 'Now you know why jambu trees are sometimes pink.' },
      { type: 'try', prompt: 'What is <b>kuning</b>?', options: ['Red','Yellow','Green'], answer: 'Yellow', successMsg: 'Kuning = yellow!' },
      { type: 'try', prompt: 'Pink in Malay is…', options: ['merah jambu','merah','jingga'], answer: 'merah jambu', successMsg: 'Yes! Pink = merah jambu (jambu-fruit red).' }
    ]
  },

  keluarga: {
    title: 'Keluarga Saya',
    icon: '👪',
    lumiSays: 'Time to meet your family in Malay! Pakcik (uncle) Lumi is here too.',
    steps: [
      { visual: '<div style="font-size:28px">👩 <b>ibu</b> = mother<br>👨 <b>bapa</b> = father</div>', text: '<b>Ibu</b> and <b>bapa</b> are the two most important Malay family words.', lumiTip: 'Some kids say "mak" for mother and "ayah" for father — both are fine.' },
      { visual: '<div style="font-size:24px">👦 <b>abang</b> = older brother<br>👧 <b>kakak</b> = older sister<br>👶 <b>adik</b> = younger sibling</div>', text: 'Order matters in Malay! Older siblings have special names.', lumiTip: 'A younger sibling is always <b>adik</b>, boy or girl.' },
      { visual: '<div style="font-size:24px">👵 <b>nenek</b> = grandmother<br>👴 <b>datuk</b> = grandfather</div>', text: 'Your grandparents are <b>nenek</b> and <b>datuk</b>.', lumiTip: 'Some families say "tok" for grandpa.' },
      { type: 'try', prompt: 'Your older sister is your…', options: ['adik','kakak','nenek'], answer: 'kakak', successMsg: 'Kakak = older sister!' },
      { type: 'try', prompt: 'A younger brother is called…', options: ['abang','adik','bapa'], answer: 'adik', successMsg: 'Yes — younger siblings are all <b>adik</b>.' }
    ]
  },

  haiwan: {
    title: 'Haiwan Kesayangan',
    icon: '🐱',
    lumiSays: 'Some Malay animal names sound exactly like the noises they make. Listen for them!',
    steps: [
      { visual: '<div style="font-size:30px">🐱 <b>kucing</b> · 🐶 <b>anjing</b> · 🐟 <b>ikan</b></div>', text: 'Cat, dog, fish. <b>Kucing</b> is a fluffy P1 favourite.', lumiTip: 'My friend has a kucing called Bola — “ball”!' },
      { visual: '<div style="font-size:30px">🐔 <b>ayam</b> · 🐦 <b>burung</b> · 🐄 <b>lembu</b></div>', text: '<b>Ayam</b> = chicken, <b>burung</b> = bird, <b>lembu</b> = cow.', lumiTip: 'Ayam is also food! Nasi ayam = chicken rice. Yum.' },
      { visual: '<div style="font-size:30px">🦋 <b>kupu-kupu</b></div>', text: '<b>Kupu-kupu</b> = butterfly. Malay sometimes doubles a word to make it cute or plural.', lumiTip: 'Anak-anak = children. Bunga-bunga = flowers. Doubled = lovely.' },
      { type: 'try', prompt: 'What is a <b>kucing</b>?', options: ['Cat','Dog','Cow'], answer: 'Cat', successMsg: 'Kucing = cat!' },
      { type: 'try', prompt: 'Butterfly in Malay is…', options: ['burung','kupu-kupu','arnab'], answer: 'kupu-kupu', successMsg: 'Kupu-kupu — the prettiest doubled word!' }
    ]
  },

  badan: {
    title: 'Anggota Badan',
    icon: '👐',
    lumiSays: 'Point at your nose and your knee while you learn — it makes the words stick.',
    steps: [
      { visual: '<div style="font-size:28px">🧠 <b>kepala</b> = head<br>💇 <b>rambut</b> = hair</div>', text: '<b>Kepala</b> is your head, <b>rambut</b> is your hair.', lumiTip: 'Touch your kepala while you say it.' },
      { visual: '<div style="font-size:28px">👁️ <b>mata</b> · 👃 <b>hidung</b> · 👄 <b>mulut</b> · 👂 <b>telinga</b></div>', text: 'Eye, nose, mouth, ear. <b>Mata</b> is one of the prettiest Malay words.', lumiTip: 'Try a face song: mata, hidung, mulut, telinga!' },
      { visual: '<div style="font-size:28px">✋ <b>tangan</b> = hand · 🦶 <b>kaki</b> = leg/foot</div>', text: '<b>Tangan</b> and <b>kaki</b> are super useful.', lumiTip: 'Two tangan + two kaki = ready for anything!' },
      { type: 'try', prompt: 'What is <b>mata</b>?', options: ['Eye','Ear','Hand'], answer: 'Eye', successMsg: 'Mata = eye!' },
      { type: 'try', prompt: 'You walk with your…', options: ['tangan','telinga','kaki'], answer: 'kaki', successMsg: 'Yes! Kaki = legs/feet.' }
    ]
  },

  makanan: {
    title: 'Makanan Sedap',
    icon: '🍛',
    lumiSays: 'My favourite Malay topic! Singapore food has Malay names all over the menu.',
    steps: [
      { visual: '<div style="font-size:30px">🍚 <b>nasi</b> · 🍞 <b>roti</b> · 🍗 <b>ayam</b></div>', text: 'Rice, bread, chicken. You will see <b>nasi ayam</b>, <b>nasi lemak</b>, <b>roti prata</b> at every hawker stall!', lumiTip: 'Nasi just means rice. Whatever comes after tells you the flavour.' },
      { visual: '<div style="font-size:30px">🥦 <b>sayur</b> · 🍎 <b>buah</b> · 🐟 <b>ikan</b></div>', text: 'Vegetables, fruit, fish. Eat all three to grow strong like a kucing on a roof!', lumiTip: 'Buah-buahan = fruits (doubled = lots of fruit!).' },
      { visual: '<div style="font-size:30px">💧 <b>air</b> · 🥛 <b>susu</b></div>', text: '<b>Air</b> means water (not the air you breathe!). <b>Susu</b> means milk.', lumiTip: '“Air kosong” at hawker centres = plain water.' },
      { type: 'try', prompt: 'You order rice. The Malay word is…', options: ['roti','nasi','susu'], answer: 'nasi', successMsg: 'Nasi = rice!' },
      { type: 'try', prompt: '<b>Air</b> means…', options: ['Wind','Water','Bread'], answer: 'Water', successMsg: 'Tricky! Air in Malay = water.' }
    ]
  },

  hari: {
    title: 'Hari & Cuaca',
    icon: '☀️',
    lumiSays: 'Days of the week have Arabic roots — most of them are easy to spot once you know.',
    steps: [
      { visual: '<div style="font-size:22px">Isnin · Selasa · Rabu · Khamis · Jumaat · Sabtu · Ahad</div>', text: 'The seven hari (days), Monday to Sunday.', lumiTip: 'Try saying them while skipping. One step per day!' },
      { visual: '<div style="font-size:28px">☀️ cerah · 🌧️ hujan · ☁️ mendung</div>', text: '<b>Cerah</b> = sunny, <b>hujan</b> = rain, <b>mendung</b> = cloudy.', lumiTip: 'Singapore weather is mostly panas (hot) and hujan (rain)!' },
      { visual: '<div style="font-size:24px">🔥 <b>panas</b> = hot<br>❄️ <b>sejuk</b> = cold</div>', text: 'Hot or cold? <b>Panas</b> or <b>sejuk</b>.', lumiTip: 'Aircon room = sejuk. Outside in Singapore = panas!' },
      { type: 'try', prompt: 'What day comes after <b>Isnin</b>?', options: ['Rabu','Selasa','Sabtu'], answer: 'Selasa', successMsg: 'Yes! Isnin → Selasa.' },
      { type: 'try', prompt: 'It is pouring outside. The weather is…', options: ['cerah','hujan','panas'], answer: 'hujan', successMsg: 'Hujan = rain!' }
    ]
  },

  ayat: {
    title: 'Ayat Mudah',
    icon: '✍️',
    lumiSays: 'Time to put words together into mini-sentences! In Malay, the order is usually Subject + Verb + Object — just like English.',
    steps: [
      { visual: '<div style="font-size:24px"><b>Saya</b> + <b>suka</b> + <b>nasi</b> = <i>Saya suka nasi.</i></div>', text: '"I like rice." Easy! Swap the food word and you have a brand new sentence.', lumiTip: 'Saya = I. Suka = like. Tukar makanan = swap the food.' },
      { visual: '<div style="font-size:22px"><b>Ini</b> + <b>ialah</b> + <b>kucing</b> = <i>Ini ialah kucing.</i></div>', text: '"This is a cat." Use <b>ini ialah</b> + any noun.', lumiTip: 'Ini = this. Ialah = is.' },
      { visual: '<div style="font-size:22px"><b>Ibu</b> + <b>saya</b> + <b>baik</b> = <i>Ibu saya baik.</i></div>', text: '"My mother is kind." In Malay you say <b>ibu saya</b>, not <b>my mother</b>. The owner comes after!', lumiTip: 'Kucing saya = my cat. Sister saya? No — kakak saya!' },
      { type: 'try', prompt: 'Which sentence means "I like rice"?', options: ['Saya suka roti.','Saya suka nasi.','Nasi suka saya.'], answer: 'Saya suka nasi.', successMsg: 'Yes! Saya suka nasi.' },
      { type: 'try', prompt: 'How would you say "This is a cat"?', options: ['Kucing ini ialah.','Ini ialah kucing.','Saya ialah kucing.'], answer: 'Ini ialah kucing.', successMsg: 'Tepat sekali (exactly right)!' }
    ]
  }
};

function getMalayLesson(skillId) {
  return MALAY_LESSONS[skillId] || null;
}

// Malay flashcards (simple translation deck per skill)
function getMalayFlashcards(skillId) {
  switch (skillId) {
    case 'huruf':
      return MALAY_SUKU_KATA.map(function(s) {
        return { front: s.syllable + ' + ?', back: s.word + ' = ' + s.meaning, emoji: s.emoji };
      });
    case 'nombor':
      return MALAY_NUMBERS.slice(0, 12).map(function(n) {
        return { front: String(n.n), back: n.word, emoji: '🔢' };
      });
    case 'salam':
      return MALAY_GREETINGS.map(function(g) {
        return { front: g.malay, back: g.english + ' (' + g.context + ')', emoji: g.emoji };
      });
    case 'warna':
      return MALAY_COLOURS.map(function(c) {
        return { front: c.malay, back: c.english, emoji: c.emoji };
      });
    case 'keluarga':
      return MALAY_FAMILY.map(function(f) {
        return { front: f.malay, back: f.english, emoji: f.emoji };
      });
    case 'haiwan':
      return MALAY_ANIMALS.map(function(a) {
        return { front: a.malay, back: a.english, emoji: a.emoji };
      });
    case 'badan':
      return MALAY_BODY.map(function(b) {
        return { front: b.malay, back: b.english, emoji: b.emoji };
      });
    case 'makanan':
      return MALAY_FOOD.map(function(f) {
        return { front: f.malay, back: f.english, emoji: f.emoji };
      });
    case 'hari':
      return MALAY_DAYS.map(function(d) {
        return { front: d.malay, back: d.english, emoji: '📅' };
      }).concat(MALAY_WEATHER.map(function(w) {
        return { front: w.malay, back: w.english, emoji: w.emoji };
      }));
    case 'ayat':
      return MALAY_SENTENCE_FRAMES.map(function(s) {
        return { front: s.template, back: s.gloss, emoji: '✍️' };
      });
    default:
      return [];
  }
}
