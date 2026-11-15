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

// ============================================================
//  PRIMARY 2 LAYER — lessons
//  AWAITING HUMAN REVIEW by a Malay speaker (see P2_REVIEW.md).
// ============================================================

function _p2V(lines, size) {
  return '<div lang="ms" style="font-size:' + (size || 22) + 'px;line-height:1.7">' + lines.join('<br>') + '</div>';
}

Object.assign(MALAY_LESSONS, {
  imbuhan: {
    title: 'Imbuhan Awalan',
    lumiSays: 'An imbuhan awalan is a little piece that sticks to the front of a word. It turns a root like baca into membaca.',
    steps: [
      { visual: _p2V(['me + <b>l</b>ukis = <b>melukis</b>', 'mem + <b>b</b>aca = <b>membaca</b>', 'men + <b>c</b>ari = <b>mencari</b>', 'meng + <b>a</b>mbil = <b>mengambil</b>']),
        text: 'The prefix <b>me-</b> changes its shape to suit the first letter of the root. Before l, m, n and r it stays <b>me-</b>. Before b it is <b>mem-</b>. Before c, d and j it is <b>men-</b>. Before a vowel, g or h it is <b>meng-</b>.',
        lumiTip: 'Say them aloud. The right one is the one that is easy to say.' },
      { visual: _p2V(['<b>p</b>ukul becomes <b>memukul</b>', '<b>t</b>ulis becomes <b>menulis</b>', '<b>k</b>ira becomes <b>mengira</b>', '<b>s</b>apu becomes <b>menyapu</b>']),
        text: 'Four letters drop out when me- arrives: <b>p, t, k and s</b>. So pukul becomes memukul, tulis becomes menulis, kira becomes mengira and sapu becomes menyapu.',
        lumiTip: 'Remember the four that disappear: p, t, k, s.' },
      { visual: _p2V(['cat becomes <b>mengecat</b>', 'lap becomes <b>mengelap</b>']),
        text: 'A very short root with only one beat takes <b>menge-</b>. Cat (paint) becomes mengecat. Lap (wipe) becomes mengelap.',
        lumiTip: 'One beat, one extra e.' },
      { visual: _p2V(['<b>ber</b>main, <b>ber</b>lari, <b>ber</b>jalan', '<b>be</b>renang, <b>be</b>kerja, <b>bel</b>ajar'], 21),
        text: '<b>ber-</b> makes a doing word: bermain (play), berlari (run). Watch three special ones: berenang has one r, bekerja has no r, and ajar becomes belajar (learn).',
        lumiTip: 'Belajar is the only one with an l.' },
      { visual: _p2V(['Ali <b>membaca</b> buku itu.', 'Buku itu <b>dibaca</b> oleh Ali.'], 20),
        text: '<b>di-</b> turns the sentence around. Ali membaca buku itu means Ali reads the book. Buku itu dibaca oleh Ali means the book is read by Ali.',
        lumiTip: 'When you see oleh (by), look for a di- word.' },
      { visual: _p2V(['Adik <b>tertidur</b> di atas sofa.', 'Nenek <b>terjatuh</b>.'], 20),
        text: '<b>ter-</b> can show something happened without planning. Tertidur is to fall asleep by accident. Terjatuh is to fall down.',
        lumiTip: 'Nobody plans to terjatuh.' },
      { type: 'try', prompt: 'Add me- to <b>tulis</b> (write).', options: ['mentulis', 'menulis', 'memulis'], answer: 'menulis', successMsg: 'Menulis. The t drops out.', explanation: 'The t drops out after men-.' },
      { type: 'try', prompt: 'Bola itu ____ oleh Ahmad.', options: ['menendang', 'ditendang', 'bertendang'], answer: 'ditendang', successMsg: 'Ditendang. The ball is kicked by Ahmad.', explanation: 'With oleh (by), the verb takes di-.' }
    ]
  },

  ganda: {
    title: 'Kata Ganda',
    lumiSays: 'In Malay you can say a word twice to show there is more than one. But there is a rule about when you must not.',
    steps: [
      { visual: _p2V(['buku = a book', '<b>buku-buku</b> = books']),
        text: 'Say a naming word twice, with a little line between, and it means more than one. Buku is a book. <b>Buku-buku</b> is books.',
        lumiTip: 'The little line is called a sempang.' },
      { visual: _p2V(['<b>dua buah buku</b> is correct', 'dua buah buku-buku is wrong'], 21),
        text: 'If a number is already there, do not double. The number tells us how many, so <b>dua buah buku</b> is enough.',
        lumiTip: 'A number and a doubled word together say the same thing twice.' },
      { visual: _p2V(['<b>semua murid</b>', '<b>banyak bunga</b>', '<b>beberapa orang guru</b>', '<b>para guru</b>'], 21),
        text: 'The same goes for words that already mean many: semua (all), banyak (many), beberapa (several), para (the group of) and setiap (every). After them the naming word is said once.',
        lumiTip: 'Semua murid. Never semua murid-murid.' },
      { visual: _p2V(['rama-rama = butterfly', 'kura-kura = tortoise', 'labah-labah = spider']),
        text: 'Some words are always said twice. They are simply names. A rama-rama is one butterfly.',
        lumiTip: 'To say three of them, use a number: tiga ekor rama-rama.' },
      { type: 'try', prompt: 'Which one is correct?', options: ['tiga ekor kucing', 'tiga ekor kucing-kucing'], answer: 'tiga ekor kucing', successMsg: 'Tiga ekor kucing. The number does the counting.', explanation: 'After a number, the naming word is said once.' },
      { type: 'try', prompt: 'What does <b>murid-murid</b> mean?', options: ['a pupil', 'pupils', 'a school'], answer: 'pupils', successMsg: 'Murid-murid means pupils.', explanation: 'Doubling shows more than one.' }
    ]
  },

  penjodoh: {
    title: 'Penjodoh Bilangan',
    lumiSays: 'In Malay a number does not sit right next to the thing it counts. A small counting word goes in between. It is called a penjodoh bilangan.',
    steps: [
      { visual: _p2V(['dua <b>orang</b> murid', 'dua <b>ekor</b> kucing', 'dua <b>buah</b> rumah']),
        text: '<b>Orang</b> is for people. <b>Ekor</b> is for animals. <b>Buah</b> is for big or solid things like houses, cars, tables and books.',
        lumiTip: 'Ekor means tail. Animals are counted by their tails.' },
      { visual: _p2V(['tiga <b>biji</b> telur', 'tiga <b>batang</b> pensel', 'tiga <b>helai</b> baju']),
        text: '<b>Biji</b> is for small round things and fruit. <b>Batang</b> is for long things. <b>Helai</b> is for thin, soft things like cloth and paper.',
        lumiTip: 'Look at the shape of the thing. The shape chooses the word.' },
      { visual: _p2V(['empat <b>keping</b> biskut', 'empat <b>kuntum</b> bunga', 'empat <b>pasang</b> kasut']),
        text: '<b>Keping</b> is for thin, flat pieces. <b>Kuntum</b> is for flowers. <b>Pasang</b> is for things that come in twos, like shoes and socks.',
        lumiTip: 'Sepasang kasut is two shoes, one pair.' },
      { visual: _p2V(['satu + ekor = <b>seekor</b> kucing', 'satu + buah = <b>sebuah</b> rumah', 'satu + orang = <b>seorang</b> guru'], 21),
        text: 'When there is only one, satu shrinks to <b>se-</b> and joins the counting word: seekor, sebuah, seorang.',
        lumiTip: 'Seekor kucing means one cat, or a cat.' },
      { type: 'try', prompt: 'lima ____ burung', options: ['orang', 'ekor', 'buah'], answer: 'ekor', successMsg: 'Lima ekor burung. Birds are animals.', explanation: 'Ekor is for animals.' },
      { type: 'try', prompt: 'dua ____ pensel', options: ['batang', 'helai', 'biji'], answer: 'batang', successMsg: 'Dua batang pensel. A pencil is long.', explanation: 'Batang is for long things.' }
    ]
  },

  tanya: {
    title: 'Kata Tanya',
    lumiSays: 'Kata tanya are question words. Each one asks for a different kind of answer.',
    steps: [
      { visual: _p2V(['<b>apa</b> = what', '<b>siapa</b> = who', '<b>di mana</b> = where']),
        text: '<b>Apa</b> asks about a thing. <b>Siapa</b> asks about a person. <b>Di mana</b> asks about a place.',
        lumiTip: 'Di mana is written as two words.' },
      { visual: _p2V(['<b>bila</b> = when', '<b>mengapa</b> = why', '<b>bagaimana</b> = how', '<b>berapa</b> = how many']),
        text: '<b>Bila</b> asks about a time. <b>Mengapa</b> asks for a reason. <b>Bagaimana</b> asks about a way. <b>Berapa</b> asks for a number.',
        lumiTip: 'The answer to mengapa usually has kerana (because) in it.' },
      { visual: _p2V(['<b>Siapakah</b> guru kamu?', '<b>Di manakah</b> kamu tinggal?'], 21),
        text: 'At the front of a written question, the question word takes <b>-kah</b>: apakah, siapakah, bilakah, di manakah. The sentence ends with a question mark.',
        lumiTip: 'The -kah is just a polite tail. The meaning stays the same.' },
      { type: 'try', prompt: '____ kamu tinggal? Saya tinggal di Tampines.', options: ['Siapakah', 'Di manakah', 'Bilakah'], answer: 'Di manakah', successMsg: 'Di manakah. The reply is a place.', explanation: 'The reply names a place, so the question asks where.' },
      { type: 'try', prompt: 'Which word asks for a number?', options: ['berapa', 'mengapa', 'siapa'], answer: 'berapa', successMsg: 'Berapa asks how many.', explanation: 'Berapa asks how many or how much.' }
    ]
  },

  adjektif: {
    title: 'Kata Adjektif',
    lumiSays: 'A kata adjektif is a describing word. It tells us what something is like. In Malay it comes after the thing it describes.',
    steps: [
      { visual: _p2V(['rumah <b>besar</b> = a big house', 'kucing <b>kecil</b> = a small cat']),
        text: 'The describing word follows the naming word. We say <b>rumah besar</b>, house big, not besar rumah.',
        lumiTip: 'Thing first, describing word second.' },
      { visual: _p2V(['besar and kecil', 'rajin and malas', 'panas and sejuk', 'bersih and kotor']),
        text: 'Words with opposite meanings are called <b>antonim</b>. Big and small, hardworking and lazy, hot and cold, clean and dirty.',
        lumiTip: 'Learn them in pairs. One helps you remember the other.' },
      { visual: _p2V(['cantik = indah', 'pandai = bijak', 'cepat = pantas']),
        text: 'Words with the same meaning are called <b>sinonim</b>. Cantik and indah both mean beautiful. Pandai and bijak both mean clever.',
        lumiTip: 'Sinonim start with s, like same.' },
      { type: 'try', prompt: 'The opposite of <b>tinggi</b> is', options: ['rendah', 'besar', 'kotor'], answer: 'rendah', successMsg: 'Tinggi is tall and rendah is short.', explanation: 'Tinggi is tall or high. Rendah is short or low.' },
      { type: 'try', prompt: 'Which word means the same as <b>cantik</b>?', options: ['malas', 'indah', 'kotor'], answer: 'indah', successMsg: 'Cantik and indah both mean beautiful.', explanation: 'Indah also means beautiful.' }
    ]
  },

  sendi: {
    title: 'Kata Sendi Nama',
    lumiSays: 'Kata sendi nama are small words like di, ke and dari. They sit in front of a place, a time or a person. Choosing the right one is a real exam skill.',
    steps: [
      { visual: _p2V(['Ibu ada <b>di</b> dapur.', 'Ayah pergi <b>ke</b> pejabat.', 'Ayah pulang <b>dari</b> pejabat.'], 21),
        text: 'For places: <b>di</b> is where something is, <b>ke</b> is where someone is going, and <b>dari</b> is where someone is coming from.',
        lumiTip: 'Di stays. Ke goes. Dari comes back.' },
      { visual: _p2V(['<b>pada</b> pukul lapan', '<b>pada</b> hari Ahad', 'Buku itu ada <b>pada</b> cikgu.'], 21),
        text: 'For a time, use <b>pada</b>, not di. We also use pada when something is with a person.',
        lumiTip: 'Di is for places only.' },
      { visual: _p2V(['pergi <b>ke</b> sekolah', 'memberi hadiah <b>kepada</b> ibu'], 21),
        text: 'Going to a place is <b>ke</b>. Giving or saying something to a person is <b>kepada</b>.',
        lumiTip: 'Place takes ke. Person takes kepada.' },
      { visual: _p2V(['datang <b>dari</b> Johor', 'hadiah <b>daripada</b> nenek', 'lebih tinggi <b>daripada</b> saya'], 21),
        text: 'From a place or a time is <b>dari</b>. From a person is <b>daripada</b>. Daripada is also used to compare, and to say what something is made of.',
        lumiTip: 'Place takes dari. Person takes daripada.' },
      { type: 'try', prompt: 'Saya memberikan bunga ____ ibu.', options: ['ke', 'kepada', 'di'], answer: 'kepada', successMsg: 'Kepada, because ibu is a person.', explanation: 'A person takes kepada.' },
      { type: 'try', prompt: 'Kami bersenam ____ waktu pagi.', options: ['di', 'pada', 'ke'], answer: 'pada', successMsg: 'Pada, because pagi is a time.', explanation: 'A time takes pada.' }
    ]
  },

  hubung: {
    title: 'Kata Hubung',
    lumiSays: 'Kata hubung are joining words. They tie two words or two short sentences into one.',
    steps: [
      { visual: _p2V(['epal <b>dan</b> pisang', 'susu <b>atau</b> teh'], 22),
        text: '<b>Dan</b> means and. It adds. <b>Atau</b> means or. It offers a choice.',
        lumiTip: 'Dan gives you both. Atau makes you pick.' },
      { visual: _p2V(['Rumah itu kecil <b>tetapi</b> cantik.', 'Adik menangis <b>kerana</b> dia terjatuh.'], 20),
        text: '<b>Tetapi</b> means but. It joins two ideas that pull opposite ways. <b>Kerana</b> means because. It gives the reason.',
        lumiTip: 'Ask why. The part that answers begins with kerana.' },
      { visual: _p2V(['Ali bangun <b>lalu</b> mandi.', 'Kakak menyapu <b>sambil</b> menyanyi.'], 20),
        text: '<b>Lalu</b> means and then. One thing happens, then the next. <b>Sambil</b> means while. One person does two things at the same time.',
        lumiTip: 'Lalu is one after another. Sambil is both at once.' },
      { type: 'try', prompt: 'Ali tidak ke sekolah ____ dia demam.', options: ['tetapi', 'kerana', 'atau'], answer: 'kerana', successMsg: 'Kerana. The fever is the reason.', explanation: 'Kerana gives the reason.' },
      { type: 'try', prompt: 'Ayah minum kopi ____ membaca surat khabar.', options: ['sambil', 'kerana', 'tetapi'], answer: 'sambil', successMsg: 'Sambil. Father does both at the same time.', explanation: 'Sambil shows two things done at once.' }
    ]
  },

  peribahasa: {
    title: 'Peribahasa Mudah',
    lumiSays: 'A simpulan bahasa is a pair of words that together mean something quite different. They make Malay colourful.',
    steps: [
      { visual: _p2V(['<b>ringan tulang</b>', 'light + bone', 'hardworking']),
        text: '<b>Ringan tulang</b> says light bones. It means hardworking. Someone whose bones are light is quick to get up and help.',
        lumiTip: 'The opposite is berat tulang, heavy bones, which means lazy.' },
      { visual: _p2V(['<b>buah tangan</b> = a gift for a visit', '<b>panjang tangan</b> = likes to steal', '<b>campur tangan</b> = to interfere'], 20),
        text: 'Many of them use parts of the body. Tangan is hand. <b>Buah tangan</b> is a gift you bring. <b>Panjang tangan</b> is someone who steals. <b>Campur tangan</b> is to interfere.',
        lumiTip: 'Picture the hand in each one.' },
      { visual: _p2V(['<b>besar hati</b> = glad and proud', '<b>kecil hati</b> = hurt', '<b>murah hati</b> = generous', '<b>buah hati</b> = dearly loved'], 20),
        text: 'Hati is where feelings live. <b>Besar hati</b> is glad and proud. <b>Kecil hati</b> is hurt. <b>Murah hati</b> is generous. <b>Buah hati</b> is someone dearly loved.',
        lumiTip: 'A big heart is happy. A small heart is hurt.' },
      { visual: _p2V(['<b>anak emas</b> = the favourite child', '<b>cahaya mata</b> = a child', '<b>kaki bangku</b> = not good at football', '<b>ulat buku</b> = loves reading'], 20),
        text: 'More to collect: <b>anak emas</b>, <b>cahaya mata</b>, <b>kaki bangku</b> and <b>ulat buku</b>.',
        lumiTip: 'An ulat buku is a bookworm, just like in English.' },
      { type: 'try', prompt: 'Siti selalu membantu ibunya. Dia seorang yang', options: ['berat tulang', 'ringan tulang', 'panjang tangan'], answer: 'ringan tulang', successMsg: 'Ringan tulang means hardworking.', explanation: 'Ringan tulang means hardworking.' },
      { type: 'try', prompt: 'What is a <b>buah tangan</b>?', options: ['a fruit', 'a gift you bring when you visit', 'a hand'], answer: 'a gift you bring when you visit', successMsg: 'A buah tangan is a gift for the people you visit.', explanation: 'It is a gift you bring when you visit.' }
    ]
  },

  kefahaman: {
    title: 'Kefahaman',
    lumiSays: 'Kefahaman means understanding. You read a short passage, then answer questions about it. The answers are always in the passage.',
    steps: [
      { visual: _p2V(['1. Read the passage.', '2. Read the question.', '3. Find the sentence.', '4. Choose.'], 21),
        text: 'Read the whole passage once, slowly. Then read the question and go back to find the sentence that talks about it.',
        lumiTip: 'Do not answer from memory. Go back and look.' },
      { visual: _p2V(['siapakah = a person', 'di manakah = a place', 'bilakah = a time', 'mengapakah = a reason'], 21),
        text: 'The question word tells you what to look for. <b>Siapakah</b> wants a person. <b>Di manakah</b> wants a place. <b>Bilakah</b> wants a time. <b>Mengapakah</b> wants a reason.',
        lumiTip: 'For mengapakah, hunt for the word kerana in the passage.' },
      { visual: _p2V(['Pada hari Sabtu, Aminah pergi ke pasar.'], 20),
        text: 'Try it. Bilakah Aminah pergi ke pasar? Bilakah wants a time, and the sentence says pada hari Sabtu.',
        lumiTip: 'The words around the answer usually match the words in the question.' },
      { type: 'try', visual: _p2V(['Ali bermain bola di padang.'], 20), prompt: 'Di manakah Ali bermain bola?', options: ['di padang', 'di rumah', 'di kelas'], answer: 'di padang', successMsg: 'Di padang. The sentence says so.', explanation: 'The sentence says di padang, on the field.' },
      { type: 'try', visual: _p2V(['Adik menangis kerana dia terjatuh.'], 20), prompt: 'Mengapakah adik menangis?', options: ['kerana dia lapar', 'kerana dia terjatuh', 'kerana dia penat'], answer: 'kerana dia terjatuh', successMsg: 'Kerana dia terjatuh. The reason follows kerana.', explanation: 'The reason follows the word kerana.' }
    ]
  },

  binaayat: {
    title: 'Bina Ayat',
    lumiSays: 'Bina ayat means build a sentence. You get the words in a jumble and put them in order.',
    steps: [
      { visual: _p2V(['<b>Ibu</b> + <b>membeli</b> + <b>sayur</b>', 'who + does what + to what'], 21),
        text: 'Most sentences start with who, then what they do, then the thing. <b>Ibu membeli sayur.</b> Mother buys vegetables.',
        lumiTip: 'Find the doer first.' },
      { visual: _p2V(['Ibu membeli sayur <b>di pasar</b>.'], 21),
        text: 'Where and when usually come at the end: <b>di pasar</b> (at the market), <b>setiap pagi</b> (every morning).',
        lumiTip: 'Small words like di, ke and pada stay glued to the word after them.' },
      { visual: _p2V(['<b>I</b>bu ... pasar<b>.</b>'], 24),
        text: 'Two clues are always there. The word with a capital letter goes first. The word with the full stop goes last.',
        lumiTip: 'Place those two, then fill the middle.' },
      { type: 'try', prompt: 'Which is in the right order?', options: ['Saya suka membaca buku.', 'Suka saya buku membaca.', 'Buku saya membaca suka.'], answer: 'Saya suka membaca buku.', successMsg: 'Saya suka membaca buku. I like reading books.', explanation: 'Who, then what they do, then the thing.' },
      { type: 'try', prompt: 'Which is in the right order?', options: ['Kami di padang bermain bola.', 'Kami bermain bola di padang.', 'Bermain kami di bola padang.'], answer: 'Kami bermain bola di padang.', successMsg: 'Kami bermain bola di padang. We play ball on the field.', explanation: 'The place comes at the end.' }
    ]
  }
});

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
        return { front: s.example || s.template, back: s.exampleGloss || s.gloss, emoji: '✍️' };
      });
    // ---- Primary 2 layer ----
    case 'imbuhan':
      return MALAY_P2_MEN.filter(function(m, i) { return i % 4 === 0; }).map(function(m) {
        return { front: 'me- + ' + m.root, back: m.form + ' = to ' + m.en };
      }).concat(MALAY_P2_BER.slice(0, 6).map(function(b) {
        return { front: 'ber- + ' + b.root, back: b.form + ' = to ' + b.en };
      }));
    case 'ganda':
      return MALAY_P2_GANDA_SEMU.map(function(g) {
        return { front: g.w, back: g.en };
      }).concat(MALAY_P2_GANDA_FRASA.slice(0, 8).map(function(g) {
        return { front: g.en, back: g.num + ' ' + g.pb + ' ' + g.n };
      }));
    case 'penjodoh': {
      var seenPb = {};
      return MALAY_P2_PB.filter(function(x) {
        seenPb[x.pb] = (seenPb[x.pb] || 0) + 1;
        return seenPb[x.pb] <= 2;
      }).map(function(x) {
        return { front: 'one ' + x.one, back: 'se' + x.pb + ' ' + x.n };
      });
    }
    case 'tanya':
      return MALAY_P2_TANYA.map(function(t) {
        return { front: t.w, back: t.en };
      });
    case 'adjektif':
      return MALAY_P2_ANTONIM.map(function(p) {
        return { front: p.a + ' (' + p.ea + ')', back: 'opposite: ' + p.b + ' (' + p.eb + ')' };
      });
    case 'sendi':
      return ['di', 'ke', 'dari', 'pada', 'kepada', 'daripada'].map(function(w) {
        return { front: w, back: MALAY_P2_SENDI_NOTE[w] };
      });
    case 'hubung':
      return MALAY_P2_HUBUNG_KATA.map(function(h) {
        return { front: h.w, back: h.en };
      });
    case 'peribahasa':
      return MALAY_P2_SIMPULAN.map(function(p) {
        return { front: p.id, back: p.en };
      });
    case 'binaayat':
      return MALAY_P2_BINA.slice(0, 12).map(function(b) {
        return { front: b.s, back: b.en };
      });
    default:
      return [];
  }
}
