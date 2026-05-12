/* =========================================================
   /malay/shared/latih.js
   "Latih Mudah" — per-topic warm-up drills designed to land
   at ~85% success. Six cards per topic, instant feedback,
   no timer. Items are derived from the Common-Mistake notes
   in each Tatabahasa KB and calibrated against the Cowork
   Tatabahasa_Complete_Grammar_Reference.

   On completion the widget calls Progress.recordDrillUsed
   so the topic's mastery ring picks up the 30-point boost.

   Public API: window.MalayLatih.mount(topicId, container).
   ========================================================= */

(function (global) {
  // ── Drill data (per topic) ─────────────────────────────
  const DRILLS = {
    'imbuhan': {
      title: 'Pasang Imbuhan',
      intro: 'Pilih bentuk imbuhan yang betul. Asimilasi bunyi hidung diuji.',
      items: [
        { stem: 'meN- + sapu',  options: ['mensapu', 'menyapu', 'memsapu', 'mengsapu'], correct: 1, why: "Bunyi 's' digugurkan, diganti 'ny'." },
        { stem: 'meN- + tulis', options: ['mentulis', 'menulis', 'memtulis', 'mengtulis'], correct: 1, why: "Bunyi 't' digugurkan, diganti 'n'." },
        { stem: 'meN- + ambil', options: ['menambil', 'memambil', 'mengambil', 'menyambil'], correct: 2, why: "Sebelum vokal (a, e, i, o, u), meN- → meng-." },
        { stem: 'meN- + kira',  options: ['menkira', 'mengira', 'memkira', 'menyira'], correct: 1, why: "Bunyi 'k' digugurkan, diganti 'ng'." },
        { stem: 'peN- + tulis', options: ['pentulis', 'penulis', 'pemtulis', 'pengtulis'], correct: 1, why: "Bunyi 't' digugurkan; peN- → pen-." },
        { stem: 'ter- + jatuh', options: ['terjatuh (tidak sengaja)', 'menjatuh', 'berjatuh', 'jatuhkan'], correct: 0, why: "ter- menunjukkan tindakan tidak sengaja." },
      ],
    },

    'kata-nama': {
      title: 'Tukar Jamak',
      intro: 'Tukar bentuk tunggal kepada jamak yang betul.',
      items: [
        { stem: 'buku (jamak banyak)', options: ['sebuku', 'buku-buku', 'berbuku', 'kubuk'], correct: 1, why: 'Jamak Bahasa Melayu: kata ganda penuh — buku-buku.' },
        { stem: 'Bentuk "kanak-kanak" ialah:', options: ['kata ganda separa', 'kata ganda penuh', 'kata ganda berentak', 'kata nama khas'], correct: 1, why: 'Seluruh kata diulang → kata ganda penuh.' },
        { stem: 'lauk-___', options: ['sayur', 'pauk', 'lauk', 'pauh'], correct: 1, why: 'Kata ganda berentak yang tetap: lauk-pauk = pelbagai lauk.' },
        { stem: '"Singapura-Singapura"', options: ['Betul', 'Salah — kata nama khas tidak diganda', 'Betul tetapi tidak biasa', 'Tergantung konteks'], correct: 1, why: 'Kata nama khas tidak boleh diganda. Untuk jamak: "bandar-bandar di Singapura".' },
        { stem: 'Ibu memasak ___ untuk hari raya.', options: ['kuih', 'sekuih', 'kuih-muih', 'pengkuih'], correct: 2, why: 'Pelbagai jenis kuih → kata ganda berentak.' },
        { stem: 'Pilih kata nama mujarad:', options: ['kerusi', 'kebahagiaan', 'sungai', 'kucing'], correct: 1, why: 'Kata nama mujarad = abstrak; kebahagiaan ialah perasaan.' },
      ],
    },

    'kata-kerja': {
      title: 'Set Aspek',
      intro: 'Pilih penanda aspek yang sesuai untuk slot dalam ayat.',
      items: [
        { stem: 'Saya ___ membaca buku sekarang.', options: ['telah', 'sedang', 'akan', 'belum'], correct: 1, why: '"Sekarang" → sedang berlaku.' },
        { stem: 'Ibu ___ memasak. (sudah selesai sebelum ini)', options: ['sedang', 'akan', 'telah', 'masih'], correct: 2, why: '"Sudah selesai" → telah (formal) atau sudah.' },
        { stem: 'Kami ___ pergi ke kedai esok.', options: ['sedang', 'telah', 'belum', 'akan'], correct: 3, why: '"Esok" → masa hadapan → akan.' },
        { stem: 'Adik ___ menyiapkan kerja rumahnya. (negatif)', options: ['akan', 'sedang', 'belum', 'telah'], correct: 2, why: '"Belum" = aksi belum berlaku tetapi mungkin akan.' },
        { stem: 'Pilih ayat yang BETUL:', options: ['Saya sedang akan pergi.', 'Saya akan pergi esok.', 'Saya sudah akan pergi.', 'Saya pernah akan pergi.'], correct: 1, why: 'Penanda aspek tidak boleh distack pada garis masa yang bertentangan.' },
        { stem: 'Saya ___ membaca buku itu.', options: ['baca', 'bacai', 'membaca', 'membacakan'], correct: 2, why: 'Dalam karangan formal, meN- pada kata kerja transitif jangan digugurkan.' },
      ],
    },

    'kata-adjektif': {
      title: 'Bandingkan',
      intro: 'Pilih bentuk darjah perbandingan atau penegas yang betul.',
      items: [
        { stem: 'Kereta merah ___ laju ___ kereta biru.', options: ['lebih / daripada', 'paling / daripada', 'sama / dengan', 'sangat / daripada'], correct: 0, why: 'Bandingan dua benda: lebih X daripada Y.' },
        { stem: 'Adik saya ___ tinggi dalam keluarga kami.', options: ['lebih', 'paling', 'sama', 'kurang'], correct: 1, why: 'Penghabisan (terbaik antara semua) → paling.' },
        { stem: 'Bilik saya ___ besar ___ bilik adik.', options: ['lebih / dengan', 'sama / dengan', 'paling / daripada', 'sangat / daripada'], correct: 1, why: 'Sama X dengan Y.' },
        { stem: 'Pelajar itu ___ rajin.', options: ['sangat amat', 'sangat', 'paling sangat', 'lebih paling'], correct: 1, why: 'Penegas tidak boleh distack. Pilih SATU.' },
        { stem: '"Soalan itu ___ sukar untuk saya." (sukar yang melampau)', options: ['agak', 'lebih', 'terlalu', 'sama'], correct: 2, why: 'Terlalu = melampau (membawa nada negatif).' },
        { stem: 'Pilih ayat formal:', options: ['Aku rasa happy.', 'Saya berasa amat gembira.', 'Saya happy sangat.', 'Aku rasa gembira sangat.'], correct: 1, why: 'Saya (formal) + berasa (formal) + amat gembira (formal).' },
      ],
    },

    'kata-hubung': {
      title: 'Sambungkan Ayat',
      intro: 'Pilih kata hubung yang menerangkan hubungan antara dua idea.',
      items: [
        { stem: 'Saya rajin belajar ___ memperoleh keputusan yang baik.', options: ['tetapi', 'kerana', 'supaya', 'atau'], correct: 2, why: 'Tujuan tindakan → supaya.' },
        { stem: '___ hujan turun, kami tetap pergi.', options: ['Walaupun', 'Dan', 'Kerana', 'Justeru'], correct: 0, why: 'Pertentangan → walaupun.' },
        { stem: 'Adik gembira ___ menerima hadiah.', options: ['tetapi', 'kerana', 'walaupun', 'supaya'], correct: 1, why: 'Sebab → kerana.' },
        { stem: 'Pilih ayat BETUL:', options: ['Walaupun penat, tetapi saya teruskan.', 'Walaupun penat, saya teruskan.', 'Saya penat walaupun saya teruskan.', 'Saya penat, walaupun, saya teruskan.'], correct: 1, why: 'Walaupun + tetapi adalah pengulangan ralat. Pilih satu.' },
        { stem: 'Pendidikan penting. ___ , marilah kita rajin belajar.', options: ['Tetapi', 'Walaupun', 'Justeru', 'Iaitu'], correct: 2, why: 'Justeru = oleh itu (formal, untuk akibat/kesimpulan).' },
        { stem: '___ kakak memasak, ibu menyapu lantai.', options: ['Sebelum', 'Selepas', 'Sementara', 'Demi'], correct: 2, why: 'Dua tindakan serentak → sementara.' },
      ],
    },

    'kata-sendi': {
      title: 'Pilih Kata Sendi',
      intro: 'Lengkapkan ayat dengan kata sendi yang betul.',
      items: [
        { stem: 'Saya tinggal ___ Singapura.', options: ['di', 'ke', 'dari', 'pada'], correct: 0, why: 'Tempat tinggal (stasioner) → di.' },
        { stem: 'Adik pergi ___ sekolah.', options: ['di', 'ke', 'pada', 'untuk'], correct: 1, why: 'Pergi → arah → ke.' },
        { stem: 'Ibu memberi hadiah ___ saya.', options: ['ke', 'kepada', 'di', 'dari'], correct: 1, why: 'Penerima ialah ORANG → kepada (bukan "ke").' },
        { stem: 'Adik lebih pandai ___ saya.', options: ['dari', 'daripada', 'ke', 'pada'], correct: 1, why: 'Perbandingan → daripada.' },
        { stem: 'Buah ini diperbuat ___ tepung.', options: ['dari', 'daripada', 'di', 'ke'], correct: 1, why: 'Bahan → daripada.' },
        { stem: 'Yang manakah IMBUHAN, bukan kata sendi?', options: ['di sekolah', 'di rumah', 'dibaca', 'di Pulau Ubin'], correct: 2, why: '"Dibaca" = di- + kata kerja (tanpa jarak). Lain ialah kata sendi (dengan jarak).' },
      ],
    },

    'kata-ganti-nama': {
      title: 'Ganti Nama',
      intro: 'Pilih kata ganti nama yang sesuai dengan konteks.',
      items: [
        { stem: 'Cikgu Aminah berdedikasi. ___ telah mengajar saya selama empat tahun.', options: ['Dia', 'Beliau', 'Mereka', 'Saya'], correct: 1, why: 'Cikgu = orang dewasa dihormati → beliau (lebih hormat).' },
        { stem: 'Mari ___ belajar bersama untuk peperiksaan. (Anda termasuk.)', options: ['saya', 'kami', 'kita', 'anda'], correct: 2, why: 'Pendengar termasuk → kita.' },
        { stem: '___ pergi ke pantai. (saya + keluarga, TANPA anda)', options: ['Kami', 'Kita', 'Mereka', 'Anda'], correct: 0, why: 'Pendengar TIDAK termasuk → kami.' },
        { stem: 'Pilih ayat paling FORMAL untuk karangan:', options: ['Aku pergi ke sekolah.', 'Saya pergi ke sekolah.', 'Awak pergi ke sekolah.', 'Kau pergi ke sekolah.'], correct: 1, why: 'Saya (formal), bukan aku/awak/kau dalam karangan PSLE.' },
        { stem: '___ anda tidak hadir ke sekolah semalam?', options: ['Apakah', 'Bilakah', 'Mengapakah', 'Siapakah'], correct: 2, why: 'Mencari sebab → mengapakah.' },
        { stem: 'Para pelajar berkumpul di dewan. ___ menyanyikan lagu kebangsaan.', options: ['Dia', 'Beliau', 'Mereka', 'Kami'], correct: 2, why: 'Banyak orang = mereka.' },
      ],
    },

    'penjodoh-bilangan': {
      title: 'Padan Penjodoh',
      intro: 'Pilih penjodoh bilangan yang betul.',
      items: [
        { stem: 'Saya melihat ___ kucing di kebun.', options: ['seorang', 'seekor', 'sebuah', 'sehelai'], correct: 1, why: 'Haiwan → seekor.' },
        { stem: 'Ayah membeli ___ kereta baharu.', options: ['seorang', 'seekor', 'sebuah', 'sehelai'], correct: 2, why: 'Objek besar → sebuah.' },
        { stem: 'Ibu memberi saya ___ baju.', options: ['sebuah', 'sehelai', 'sebatang', 'sebiji'], correct: 1, why: 'Kain/nipis → sehelai.' },
        { stem: 'Adik makan ___ epal.', options: ['sebuah', 'sehelai', 'sebiji', 'sebatang'], correct: 2, why: 'Buah bulat kecil → sebiji.' },
        { stem: 'Saya menulis dengan ___ pensel.', options: ['sebuah', 'sehelai', 'sebatang', 'sebiji'], correct: 2, why: 'Panjang kurus → sebatang.' },
        { stem: 'Ibu membeli ___ kasut.', options: ['sebuah', 'seekor', 'sepasang', 'sehelai'], correct: 2, why: 'Berpasangan → sepasang.' },
      ],
    },

    'kosa-kata': {
      title: 'Pelbagaikan Kosa Kata',
      intro: 'Pilih perkataan yang PALING tepat untuk slot karangan.',
      items: [
        { stem: 'Sinonim PALING formal untuk "gembira":', options: ['happy', 'sukacita', 'okay', 'fine'], correct: 1, why: 'Sukacita = formal Malay untuk "joyful/delighted".' },
        { stem: 'Cuaca hari ini sangat ___ . Matahari menyengat kulit.', options: ['tenang', 'terik', 'lembap', 'sejuk'], correct: 1, why: 'Matahari menyengat → cuaca terik (sangat panas).' },
        { stem: 'Ali mengulang kaji ___ untuk peperiksaan akhir tahun.', options: ['malas-malasan', 'bersungguh-sungguh', 'tergesa-gesa', 'sambil lewa'], correct: 1, why: 'Konteks positif → bersungguh-sungguh (formal, vivid).' },
        { stem: 'Mendengar berita kemenangan, air matanya ___ kerana terharu.', options: ['kering', 'bergenang', 'hilang', 'meleleh'], correct: 1, why: 'Bergenang = welling up. Sesuai untuk klimaks emosi karangan.' },
        { stem: 'Pilih perkataan untuk suasana TEGANG:', options: ['mencengkam', 'meriah', 'tenang', 'biasa'], correct: 0, why: 'Suasana mencengkam = atmosfera tegang. Sesuai untuk perenggan konflik karangan.' },
        { stem: 'Suasana di pasar pada hari Sabtu sangat ___ .', options: ['sunyi sepi', 'penuh sesak', 'lapang', 'kosong'], correct: 1, why: 'Pasar hari Sabtu = ramai orang → penuh sesak.' },
      ],
    },

    'sinonim-antonim': {
      title: 'Pasangan Seerti & Berlawanan',
      intro: 'Pilih sinonim atau antonim yang BETUL.',
      items: [
        { stem: 'Sinonim untuk "pandai":', options: ['bodoh', 'cerdik', 'malas', 'sedih'], correct: 1, why: 'Cerdik = sinonim biasa untuk pandai.' },
        { stem: 'Antonim untuk "berani":', options: ['gagah', 'perkasa', 'takut', 'tinggi'], correct: 2, why: 'Berani ↔ takut (atau pengecut).' },
        { stem: 'Sinonim PALING formal untuk "cantik":', options: ['cute', 'cantik je', 'jelita', 'biasa'], correct: 2, why: 'Jelita = sinonim literari untuk cantik. Sesuai karangan deskriptif.' },
        { stem: 'Antonim langsung untuk "miskin":', options: ['kaya', 'sederhana', 'tinggi', 'sedih'], correct: 0, why: 'Miskin ↔ kaya (antonim langsung).' },
        { stem: 'Sinonim untuk "penat":', options: ['rajin', 'letih', 'gembira', 'sedih'], correct: 1, why: 'Letih / lelah / lesu = sinonim penat.' },
        { stem: 'Antonim untuk "rajin":', options: ['tekun', 'gigih', 'malas', 'pandai'], correct: 2, why: 'Rajin ↔ malas.' },
      ],
    },

    'peribahasa': {
      title: 'Pilih Peribahasa',
      intro: 'Padankan peribahasa dengan maksud atau konteksnya.',
      items: [
        { stem: '"Bagai aur dengan tebing" bermaksud:', options: ['Bermusuh', 'Saling menyokong', 'Bercerai', 'Berbohong'], correct: 1, why: 'Aur (buluh) dan tebing saling menyokong = hubungan rapat yang saling menguatkan.' },
        { stem: '"Sedikit-sedikit, lama-lama menjadi bukit" mengajarkan:', options: ['Bermalas-malasan', 'Usaha kecil yang konsisten menghasilkan kejayaan', 'Berputus asa', 'Bercerai-berai'], correct: 1, why: 'Akumulasi usaha kecil = kejayaan besar.' },
        { stem: 'Konteks: "Ali bekerja keras bertahun-tahun sehingga akhirnya berjaya membuka kedainya sendiri." Peribahasa yang sesuai:', options: ['Sudah jatuh ditimpa tangga', 'Sedikit-sedikit, lama-lama menjadi bukit', 'Ada udang di sebalik batu', 'Hangat-hangat tahi ayam'], correct: 1, why: 'Usaha konsisten bertahun-tahun → peribahasa konsistensi.' },
        { stem: '"Sudah jatuh ditimpa tangga" menggambarkan:', options: ['Pelajar yang rajin', 'Malang bertimpa-timpa', 'Kawan yang baik', 'Cuaca yang elok'], correct: 1, why: 'Kemalangan demi kemalangan (peribahasa untuk situasi malang yang berlapis).' },
        { stem: '"Bersatu teguh, bercerai roboh" menekankan kepentingan:', options: ['Berpecah', 'Perpaduan dan kerjasama', 'Berdiam diri', 'Bermusuh'], correct: 1, why: 'Bersatu = kuat (teguh); bercerai = jatuh (roboh).' },
        { stem: '"Air yang tenang jangan disangka tiada buaya" mengajar kita untuk:', options: ['Bermain air', 'Berhati-hati dengan orang yang nampak diam', 'Mencari buaya', 'Tinggal jauh dari sungai'], correct: 1, why: 'Air tenang boleh menyembunyikan bahaya. Berhati-hati terhadap orang/keadaan yang nampak aman.' },
      ],
    },

    'simpulan-bahasa': {
      title: 'Faham Simpulan Bahasa',
      intro: 'Pilih makna simpulan bahasa.',
      items: [
        { stem: '"Buah hati" bermaksud:', options: ['buah-buahan', 'jantung sebenar', 'orang yang amat disayangi', 'taman'], correct: 2, why: 'Simpulan untuk kekasih atau anak yang amat disayangi.' },
        { stem: '"Panjang tangan" bermaksud:', options: ['lengan panjang', 'suka menolong', 'suka mencuri', 'rajin'], correct: 2, why: 'Simpulan untuk sifat mencuri.' },
        { stem: '"Naik darah" bermaksud:', options: ['sihat', 'menjadi marah', 'lapar', 'sejuk'], correct: 1, why: 'Simpulan untuk berasa marah/berang.' },
        { stem: '"Tangan kanan" merujuk kepada:', options: ['tangan kanan fizikal', 'orang kepercayaan', 'kemenangan', 'pukulan'], correct: 1, why: 'Orang yang membantu dan boleh dipercayai sepenuhnya.' },
        { stem: '"Mata duitan" menggambarkan sifat:', options: ['pemurah', 'rajin', 'tamakkan wang', 'penyabar'], correct: 2, why: 'Mata yang hanya melihat wang → sifat tamak material.' },
        { stem: '"Berat tulang" menggambarkan:', options: ['badan kuat', 'sifat malas', 'tulang yang patah', 'berat badan'], correct: 1, why: 'Tulang berat → susah bergerak → simpulan untuk malas.' },
      ],
    },

    'karangan': {
      title: 'Struktur Karangan',
      intro: 'Kenal pasti komponen karangan yang baik untuk PSLE.',
      items: [
        { stem: 'Berapakah patah perkataan MINIMUM untuk karangan PSLE?', options: ['50', '100', '150', '300'], correct: 2, why: 'Minimum 150 patah perkataan. Dicadangkan 180-250.' },
        { stem: 'Pilih pengenalan TERBAIK:', options: ['Pada suatu hari saya pergi.', 'Pagi Sabtu yang cerah itu, saya menuju ke pantai dengan penuh keseronokan.', 'Hari ini hari menarik.', 'Saya pergi.'], correct: 1, why: 'Pengenalan beratmosfera: latar spesifik + watak + mood. "Pada suatu hari" = klise.' },
        { stem: 'Berapa peribahasa sesuai dalam karangan PSLE?', options: ['0', '1 sahaja', 'Sebanyak mungkin', 'Sekurang-kurangnya 5'], correct: 1, why: '1 peribahasa yang sesuai = bonus. Lebih = risiko salah konteks.' },
        { stem: 'Untuk karangan BERGAMBAR dengan 4 gambar, struktur:', options: ['1 perenggan untuk semua', '4 perenggan + pengenalan + pengakhiran', 'Tiada peraturan', '2 perenggan'], correct: 1, why: 'Satu perenggan per gambar + pengenalan + pengakhiran.' },
        { stem: 'Pilih pengakhiran TERBAIK:', options: ['Itulah hari yang tidak dapat saya lupakan.', 'Sambil mengemas barang, saya menyedari betapa berharganya keluarga.', 'Saya pulang.', 'Habis.'], correct: 1, why: 'Pengakhiran reflektif = pertumbuhan watak melalui tindakan + pengajaran konkrit.' },
        { stem: 'Format dialog yang BETUL:', options: ['"Tolong saya" jerit Aishah.', '"Tolong saya!" jerit Aishah.', 'Tolong saya jerit Aishah.', '"Tolong saya!,"jerit Aishah.'], correct: 1, why: 'Tanda seru di dalam tanda petik untuk seruan; titik penerangan SELEPAS tanda petik tutup.' },
      ],
    },

    'kefahaman': {
      title: 'Strategi Kefahaman',
      intro: 'Pilih strategi atau jawapan kefahaman yang TEPAT.',
      items: [
        { stem: 'Soalan TERSURAT adalah:', options: ['Jawapan tidak ada dalam teks', 'Jawapan terus dalam teks', 'Soalan tentang pendapat', 'Soalan kosa kata'], correct: 1, why: 'Tersurat = literal = jawapan terus daripada petikan.' },
        { stem: 'Untuk kosa kata dalam konteks, pilih definisi yang:', options: ['Umum (kamus)', 'Sesuai dengan konteks ayat', 'Mana-mana sinonim', 'Antonim'], correct: 1, why: 'Definisi mesti sesuai konteks petikan, bukan definisi am.' },
        { stem: 'Strategi TRACE bermula dengan:', options: ['Salin petikan', 'Kenal pasti jenis teks', 'Jawapan dahulu', 'Cari kamus'], correct: 1, why: 'T = Text-type. Naratif / ekspositori / persuasif / prosedural.' },
        { stem: 'Format jawapan yang DICADANGKAN:', options: ['Salin ayat penuh', 'Petik bukti + hubung + terang', 'Pendapat sahaja', 'Senarai pendek'], correct: 1, why: 'Quote → Link → Explain. Bukti dari teks + penerangan.' },
        { stem: 'Petikan: "Hujan turun lebat, Puan Rashidah tetap keluar untuk membeli ubat suaminya." Inferens: dia adalah:', options: ['Pemalas', 'Prihatin & sayang suami', 'Marah', 'Takut'], correct: 1, why: 'Sanggup keluar dalam hujan untuk suami = sifat prihatin & kasih sayang.' },
        { stem: 'Adakah kamus dibenarkan dalam Kertas 2 PSLE BM?', options: ['Ya', 'Tidak', 'Hanya elektronik', 'Hanya untuk dialog'], correct: 1, why: 'Tiada kamus dalam Kertas 2. (Kertas 1 boleh — kamus diluluskan SEAB.)' },
      ],
    },
  };

  // ── Widget mount ───────────────────────────────────────
  function mount(topicId, container) {
    if (!container) return;
    const drill = DRILLS[topicId];
    if (!drill) {
      container.innerHTML = '<p style="color:var(--muted);font-style:italic">Latihan akan ditambah dalam fasa seterusnya.</p>';
      return;
    }

    const state = { idx: 0, correct: 0, locked: false };

    function render() {
      if (state.idx >= drill.items.length) { renderResult(); return; }
      const item = drill.items[state.idx];
      state.locked = false;
      container.innerHTML = `
        <div class="latih-card">
          <div class="latih-progress">
            <span class="latih-count">Kad ${state.idx + 1} / ${drill.items.length}</span>
            <span class="latih-score">Betul: ${state.correct}</span>
          </div>
          <div class="latih-stem">${item.stem}</div>
          <div class="latih-options">
            ${item.options.map((opt, i) => `<button class="latih-option" data-i="${i}">${opt}</button>`).join('')}
          </div>
          <div class="latih-feedback" id="latih-fb"></div>
          <div class="latih-actions" id="latih-actions"></div>
        </div>
      `;
      container.querySelectorAll('.latih-option').forEach(btn => {
        btn.addEventListener('click', () => answer(parseInt(btn.dataset.i, 10)));
      });
    }

    function answer(i) {
      if (state.locked) return;
      state.locked = true;
      const item = drill.items[state.idx];
      const opts = container.querySelectorAll('.latih-option');
      opts.forEach(b => b.disabled = true);
      opts[i].classList.add(i === item.correct ? 'correct' : 'wrong');
      if (i !== item.correct && opts[item.correct]) opts[item.correct].classList.add('correct');

      const fb = container.querySelector('#latih-fb');
      if (i === item.correct) {
        state.correct++;
        fb.className = 'latih-feedback show pass';
        fb.innerHTML = `<strong>Tepat.</strong> ${item.why}`;
      } else {
        fb.className = 'latih-feedback show miss';
        fb.innerHTML = `<strong>Belum tepat.</strong> ${item.why}`;
      }

      const actions = container.querySelector('#latih-actions');
      const next = document.createElement('button');
      next.className = 'btn btn-primary';
      next.style.cssText = 'margin-top:.6rem;width:100%';
      next.textContent = state.idx + 1 < drill.items.length ? 'Seterusnya →' : 'Lihat Keputusan →';
      next.addEventListener('click', () => { state.idx++; render(); });
      actions.appendChild(next);
    }

    function renderResult() {
      const pct = Math.round((state.correct / drill.items.length) * 100);
      let line;
      if (pct >= 85)      line = 'Cemerlang. Anda sudah bersedia untuk soalan yang lebih mencabar di tab Kuiz.';
      else if (pct >= 65) line = 'Bagus. Buka semula tab Pelajaran untuk mengukuhkan poin yang terlepas.';
      else                line = 'Teruskan berlatih. Tab Pelajaran ada nota yang menerangkan setiap kesilapan.';

      if (typeof Progress !== 'undefined') Progress.recordDrillUsed(topicId);
      if (typeof Streak !== 'undefined') Streak.record();

      container.innerHTML = `
        <div class="latih-result">
          <div class="latih-result-pct">${pct}%</div>
          <div class="latih-result-score">${state.correct} / ${drill.items.length} betul</div>
          <p class="latih-result-line">${line}</p>
          <div class="latih-result-actions">
            <button class="btn btn-primary" id="latih-retry">↺ Cuba Lagi</button>
          </div>
        </div>
      `;
      document.getElementById('latih-retry').addEventListener('click', () => {
        state.idx = 0; state.correct = 0; render();
      });
    }

    // Inject Latih widget styles once
    if (!document.getElementById('malay-latih-style')) {
      const s = document.createElement('style');
      s.id = 'malay-latih-style';
      s.textContent = `
        .latih-card { padding: .25rem; }
        .latih-progress { display:flex; justify-content:space-between; align-items:center; font-size:.78rem; color:var(--muted); margin-bottom:.85rem; }
        .latih-score { color:var(--tatabahasa); font-weight:700; }
        .latih-stem { font-size:1rem; line-height:1.5; color:var(--text); font-weight:600; margin-bottom:1rem; padding:.85rem 1rem; background:var(--surface); border-radius:9px; border-left:3px solid var(--accent); }
        .latih-options { display:flex; flex-direction:column; gap:.5rem; }
        .latih-option { background:var(--card); border:1.5px solid var(--border); border-radius:8px; padding:.7rem .95rem; text-align:left; color:var(--text); cursor:pointer; font-size:.9rem; transition:all .15s; }
        .latih-option:hover:not(:disabled) { border-color:var(--accent); background:#1e2a3e; }
        .latih-option:disabled { cursor:default; opacity:.85; }
        .latih-option.correct { border-color:var(--tatabahasa); background:#063b27; color:#6ee7b7; }
        .latih-option.wrong   { border-color:#f87171; background:#3a1212; color:#fca5a5; }
        .latih-feedback { display:none; margin-top:.85rem; padding:.7rem .95rem; border-radius:8px; font-size:.85rem; line-height:1.55; }
        .latih-feedback.show { display:block; }
        .latih-feedback.pass { background:#063b27; border:1px solid var(--tatabahasa); color:#a7f3d0; }
        .latih-feedback.miss { background:#3a1212; border:1px solid #f87171; color:#fca5a5; }
        .latih-result { text-align:center; padding:2rem 1rem; }
        .latih-result-pct { font-size:3rem; font-weight:800; color:var(--tatabahasa); font-family:var(--font-mono, monospace); }
        .latih-result-score { font-size:1.1rem; color:var(--text); margin:.4rem 0 .85rem; }
        .latih-result-line { color:var(--muted); margin-bottom:1.25rem; max-width:36ch; margin-inline:auto; line-height:1.55; }
        .latih-result-actions { display:flex; gap:.6rem; justify-content:center; flex-wrap:wrap; }
      `;
      document.head.appendChild(s);
    }

    // Intro screen before drilling
    container.innerHTML = `
      <div class="latih-card">
        <div class="latih-stem" style="border-left-color:var(--tatabahasa)">${drill.title}</div>
        <p style="font-size:.9rem;color:var(--muted);line-height:1.55;margin-bottom:1.1rem">${drill.intro} 6 kad, maklum balas segera. Tiada masa, tiada tekanan.</p>
        <button class="btn btn-primary" id="latih-start" style="width:100%">Mula Latihan →</button>
      </div>
    `;
    document.getElementById('latih-start').addEventListener('click', render);
  }

  global.MalayLatih = { mount, DRILLS };
})(typeof window !== 'undefined' ? window : globalThis);
