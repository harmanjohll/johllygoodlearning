/* =========================================================
   /malay/shared/malay-topic.js
   Generic topic-page renderer. Each /malay/topics/<id>/index.html
   is a thin shell that sets window.MALAY_TOPIC_ID and loads
   this script. The renderer pulls topic data from
   shared/content/tatabahasa.json (via MalayContent), then:

   - Fills in the header (title, theme + level badges, mastery)
   - Renders the Pelajaran tab (key questions, glossary, learn,
     summary, PSLE tips)
   - Mounts the Latih widget (MalayLatih.mount)
   - Wires the Kuiz container for initAIQuizToggle
   - Instantiates MalayMindMap on the Peta Minda tab

   Calls Progress.recordVisit on first load.
   ========================================================= */

(function (global) {
  // Per-topic mind-map seed templates. Each seed sets up a rich
  // skeleton (root + categories + leaf examples) so the student can
  // see structure before extending. Categories are colour-coded by
  // theme; leaf examples are concrete, exam-relevant.
  const MIND_MAP_TEMPLATES = {
    'imbuhan': {
      nodes: [
        { id: 'r', label: 'IMBUHAN', color: { border: '#34d399' } },
        // Tier 1 — categories
        { id: 'awl', label: 'Awalan' },
        { id: 'akh', label: 'Akhiran' },
        { id: 'apt', label: 'Apitan' },
        { id: 'sis', label: 'Sisipan' },
        // Awalan
        { id: 'meN', label: 'meN- (aktif)' },
        { id: 'beR', label: 'beR- (tak transitif)' },
        { id: 'peN', label: 'peN- (pelaku)' },
        { id: 'ter', label: 'ter- (tidak sengaja)' },
        { id: 'di',  label: 'di- (pasif)' },
        { id: 'keO', label: 'ke- (ordinal)' },
        // Akhiran
        { id: 'kan', label: '-kan (kausatif)' },
        { id: '-i',  label: '-i (lokatif)' },
        { id: '-an', label: '-an (kata nama)' },
        { id: 'nya', label: '-nya (milik/penekanan)' },
        // Apitan
        { id: 'kea', label: 'ke-…-an (mujarad)' },
        { id: 'pea', label: 'pe(N)-…-an (proses)' },
        { id: 'bea', label: 'beR-…-an (saling)' },
        { id: 'mkn', label: 'meN-…-kan' },
        { id: 'mei', label: 'meN-…-i' },
        { id: 'mpk', label: 'mem-per-…-kan' },
        // Sisipan
        { id: 'el',  label: '-el- (telunjuk)' },
        { id: 'er',  label: '-er- (gerigi)' },
        { id: 'em',  label: '-em- (gemuruh)' },
        // Example leaves
        { id: 'eg1', label: 'menyapu (meN- + sapu)' },
        { id: 'eg2', label: 'dibaca (di- + baca)' },
        { id: 'eg3', label: 'kebahagiaan (ke-bahagia-an)' },
        { id: 'eg4', label: 'pendidikan (pe-didik-an)' },
      ],
      edges: [
        { from: 'r', to: 'awl' }, { from: 'r', to: 'akh' }, { from: 'r', to: 'apt' }, { from: 'r', to: 'sis' },
        { from: 'awl', to: 'meN' }, { from: 'awl', to: 'beR' }, { from: 'awl', to: 'peN' },
        { from: 'awl', to: 'ter' }, { from: 'awl', to: 'di' },  { from: 'awl', to: 'keO' },
        { from: 'akh', to: 'kan' }, { from: 'akh', to: '-i' }, { from: 'akh', to: '-an' }, { from: 'akh', to: 'nya' },
        { from: 'apt', to: 'kea' }, { from: 'apt', to: 'pea' }, { from: 'apt', to: 'bea' },
        { from: 'apt', to: 'mkn' }, { from: 'apt', to: 'mei' }, { from: 'apt', to: 'mpk' },
        { from: 'sis', to: 'el' }, { from: 'sis', to: 'er' }, { from: 'sis', to: 'em' },
        { from: 'meN', to: 'eg1' }, { from: 'di', to: 'eg2' }, { from: 'kea', to: 'eg3' }, { from: 'pea', to: 'eg4' },
      ],
      required: ['Awalan', 'Akhiran', 'Apitan', 'meN-', 'di-', 'ke-…-an'],
    },

    'kata-nama': {
      nodes: [
        { id: 'r', label: 'KATA NAMA', color: { border: '#34d399' } },
        // Tier 1 — three types
        { id: 'am',  label: 'Kata Nama Am' },
        { id: 'khas',label: 'Kata Nama Khas' },
        { id: 'muj', label: 'Kata Nama Mujarad' },
        { id: 'jam', label: 'Bentuk Jamak' },
        // Examples of am
        { id: 'a1', label: 'buku' }, { id: 'a2', label: 'sekolah' }, { id: 'a3', label: 'guru' },
        // Examples of khas
        { id: 'k1', label: 'Singapura' }, { id: 'k2', label: 'Encik Rahman' }, { id: 'k3', label: 'Hari Raya' },
        // Examples of mujarad
        { id: 'm1', label: 'kebahagiaan' }, { id: 'm2', label: 'pendidikan' }, { id: 'm3', label: 'kasih sayang' },
        // Jamak types
        { id: 'gp', label: 'Ganda Penuh' },
        { id: 'gb', label: 'Ganda Berentak' },
        { id: 'gs', label: 'Ganda Separa' },
        { id: 'bp', label: 'Bilangan + Penjodoh' },
        { id: 'gp1',label: 'buku-buku' },
        { id: 'gp2',label: 'kanak-kanak' },
        { id: 'gb1',label: 'lauk-pauk' },
        { id: 'gb2',label: 'kuih-muih' },
      ],
      edges: [
        { from: 'r', to: 'am' }, { from: 'r', to: 'khas' }, { from: 'r', to: 'muj' }, { from: 'r', to: 'jam' },
        { from: 'am', to: 'a1' }, { from: 'am', to: 'a2' }, { from: 'am', to: 'a3' },
        { from: 'khas', to: 'k1' }, { from: 'khas', to: 'k2' }, { from: 'khas', to: 'k3' },
        { from: 'muj', to: 'm1' }, { from: 'muj', to: 'm2' }, { from: 'muj', to: 'm3' },
        { from: 'jam', to: 'gp' }, { from: 'jam', to: 'gb' }, { from: 'jam', to: 'gs' }, { from: 'jam', to: 'bp' },
        { from: 'gp', to: 'gp1' }, { from: 'gp', to: 'gp2' },
        { from: 'gb', to: 'gb1' }, { from: 'gb', to: 'gb2' },
      ],
      required: ['Am', 'Khas', 'Mujarad', 'Ganda Penuh', 'Ganda Berentak'],
    },

    'kata-kerja': {
      nodes: [
        { id: 'r', label: 'KATA KERJA', color: { border: '#34d399' } },
        // Categories
        { id: 'tr', label: 'Transitif' },
        { id: 'tt', label: 'Tak Transitif' },
        { id: 'as', label: 'Penanda Aspek' },
        { id: 'av', label: 'Aktif (meN-)' },
        { id: 'pv', label: 'Pasif (di-)' },
        { id: 'tk', label: 'Terbitan (imbuhan)' },
        // Aspect markers
        { id: 'sd', label: 'sedang (sekarang)' },
        { id: 'tl', label: 'telah / sudah' },
        { id: 'ak', label: 'akan (depan)' },
        { id: 'be', label: 'belum' },
        { id: 'ms', label: 'masih' },
        { id: 'pn', label: 'pernah' },
        // Examples
        { id: 'e1', label: 'membaca (transitif aktif)' },
        { id: 'e2', label: 'berlari (tak transitif)' },
        { id: 'e3', label: 'dibaca (pasif)' },
        { id: 'e4', label: 'tertidur (ter-)' },
        { id: 'e5', label: 'memajukan (meN-…-kan)' },
        { id: 'e6', label: 'menasihati (meN-…-i)' },
      ],
      edges: [
        { from: 'r', to: 'tr' }, { from: 'r', to: 'tt' }, { from: 'r', to: 'as' },
        { from: 'r', to: 'av' }, { from: 'r', to: 'pv' }, { from: 'r', to: 'tk' },
        { from: 'as', to: 'sd' }, { from: 'as', to: 'tl' }, { from: 'as', to: 'ak' },
        { from: 'as', to: 'be' }, { from: 'as', to: 'ms' }, { from: 'as', to: 'pn' },
        { from: 'tr', to: 'e1' }, { from: 'tt', to: 'e2' },
        { from: 'pv', to: 'e3' }, { from: 'tk', to: 'e4' },
        { from: 'tk', to: 'e5' }, { from: 'tk', to: 'e6' },
      ],
      required: ['Transitif', 'Tak Transitif', 'sedang', 'telah', 'akan', 'di-'],
    },

    'kata-adjektif': {
      nodes: [
        { id: 'r', label: 'KATA ADJEKTIF', color: { border: '#34d399' } },
        // Categories
        { id: 'wr', label: 'Warna' },
        { id: 'uk', label: 'Ukuran' },
        { id: 'si', label: 'Sifat' },
        { id: 'pe', label: 'Perasaan' },
        { id: 'rs', label: 'Rasa' },
        { id: 'cr', label: 'Cara' },
        // Darjah
        { id: 'dj', label: 'Darjah Perbandingan' },
        { id: 'd1', label: 'Biasa' },
        { id: 'd2', label: 'lebih … daripada' },
        { id: 'd3', label: 'paling / ter-' },
        { id: 'd4', label: 'sama … dengan' },
        { id: 'd5', label: 'sangat / amat (penegas)' },
        { id: 'd6', label: 'terlalu (penegas negatif)' },
        // Examples
        { id: 'ew', label: 'merah, hijau, kuning' },
        { id: 'eu', label: 'besar, tinggi, panjang' },
        { id: 'es', label: 'rajin, jujur, sabar' },
        { id: 'ep', label: 'gembira, sedih, marah' },
      ],
      edges: [
        { from: 'r', to: 'wr' }, { from: 'r', to: 'uk' }, { from: 'r', to: 'si' },
        { from: 'r', to: 'pe' }, { from: 'r', to: 'rs' }, { from: 'r', to: 'cr' },
        { from: 'r', to: 'dj' },
        { from: 'dj', to: 'd1' }, { from: 'dj', to: 'd2' }, { from: 'dj', to: 'd3' },
        { from: 'dj', to: 'd4' }, { from: 'dj', to: 'd5' }, { from: 'dj', to: 'd6' },
        { from: 'wr', to: 'ew' }, { from: 'uk', to: 'eu' }, { from: 'si', to: 'es' }, { from: 'pe', to: 'ep' },
      ],
      required: ['Warna', 'Sifat', 'Bandingan', 'Penghabisan', 'Penegas'],
    },

    'kata-hubung': {
      nodes: [
        { id: 'r', label: 'KATA HUBUNG', color: { border: '#34d399' } },
        { id: 'g', label: 'Gabungan' },
        { id: 'p', label: 'Pertentangan' },
        { id: 's', label: 'Sebab-Akibat' },
        { id: 'y', label: 'Syarat' },
        { id: 't', label: 'Tujuan' },
        { id: 'u', label: 'Urutan Masa' },
        { id: 'pi',label: 'Pilihan' },
        { id: 'pn',label: 'Penerangan (iaitu)' },
        // Examples
        { id: 'g1', label: 'dan, serta, lagi' },
        { id: 'g2', label: 'tambahan pula, selain itu' },
        { id: 'p1', label: 'tetapi, namun, walaupun' },
        { id: 's1', label: 'kerana, oleh itu, justeru' },
        { id: 'y1', label: 'jika, sekiranya, kalau' },
        { id: 't1', label: 'supaya, agar, demi' },
        { id: 'u1', label: 'apabila, semasa, selepas' },
        { id: 'pi1',label: 'atau, sama ada' },
      ],
      edges: [
        { from: 'r', to: 'g' }, { from: 'r', to: 'p' }, { from: 'r', to: 's' },
        { from: 'r', to: 'y' }, { from: 'r', to: 't' }, { from: 'r', to: 'u' },
        { from: 'r', to: 'pi' }, { from: 'r', to: 'pn' },
        { from: 'g', to: 'g1' }, { from: 'g', to: 'g2' },
        { from: 'p', to: 'p1' }, { from: 's', to: 's1' },
        { from: 'y', to: 'y1' }, { from: 't', to: 't1' },
        { from: 'u', to: 'u1' }, { from: 'pi', to: 'pi1' },
      ],
      required: ['Gabungan', 'Pertentangan', 'Sebab', 'Syarat', 'Tujuan', 'Urutan'],
    },

    'kata-sendi': {
      nodes: [
        { id: 'r', label: 'KATA SENDI NAMA', color: { border: '#34d399' } },
        // Most-tested pairs
        { id: 'di', label: 'di (tempat)' },
        { id: 'ke', label: 'ke (arah ke tempat)' },
        { id: 'kp', label: 'kepada (orang/abstrak)' },
        { id: 'da', label: 'dari (tempat asal)' },
        { id: 'dp', label: 'daripada (orang/bahan/banding)' },
        { id: 'pa', label: 'pada (masa)' },
        { id: 'ol', label: 'oleh (pelaku pasif)' },
        { id: 'de', label: 'dengan (alat/cara)' },
        { id: 'un', label: 'untuk / bagi' },
        // Trap zone
        { id: 'trap', label: '⚠ di (jarak) vs di- (imbuhan)' },
        // Examples
        { id: 'ed', label: 'di sekolah' },
        { id: 'ek', label: 'ke Pulau Ubin' },
        { id: 'ep', label: 'pada pukul lapan' },
        { id: 'eo', label: 'oleh Cikgu Aminah' },
      ],
      edges: [
        { from: 'r', to: 'di' }, { from: 'r', to: 'ke' }, { from: 'r', to: 'kp' },
        { from: 'r', to: 'da' }, { from: 'r', to: 'dp' }, { from: 'r', to: 'pa' },
        { from: 'r', to: 'ol' }, { from: 'r', to: 'de' }, { from: 'r', to: 'un' },
        { from: 'r', to: 'trap' },
        { from: 'di', to: 'ed' }, { from: 'ke', to: 'ek' },
        { from: 'pa', to: 'ep' }, { from: 'ol', to: 'eo' },
      ],
      required: ['di', 'ke', 'kepada', 'daripada', 'pada', 'oleh'],
    },

    'kata-ganti-nama': {
      nodes: [
        { id: 'r', label: 'KATA GANTI NAMA', color: { border: '#34d399' } },
        // Diri
        { id: 'd1', label: 'Diri Pertama' },
        { id: 'd2', label: 'Diri Kedua' },
        { id: 'd3', label: 'Diri Ketiga' },
        { id: 'tu', label: 'Tunjuk' },
        { id: 'ta', label: 'Tanya' },
        // Diri 1
        { id: 'sy', label: 'saya (formal)' },
        { id: 'kmi',label: 'kami (tanpa pendengar)' },
        { id: 'kt', label: 'kita (dengan pendengar)' },
        // Diri 2
        { id: 'an', label: 'anda (formal)' },
        { id: 'km', label: 'kamu (formal)' },
        // Diri 3
        { id: 'dia',label: 'dia (neutral)' },
        { id: 'bel',label: 'beliau (hormat)' },
        { id: 'mer',label: 'mereka (jamak)' },
        // Tunjuk
        { id: 'in', label: 'ini / itu' },
        { id: 'sn', label: 'sini / situ / sana' },
        // Tanya
        { id: 'ap', label: 'apa / siapa / mana' },
        { id: 'mg', label: 'mengapa / bagaimana / bila' },
      ],
      edges: [
        { from: 'r', to: 'd1' }, { from: 'r', to: 'd2' }, { from: 'r', to: 'd3' },
        { from: 'r', to: 'tu' }, { from: 'r', to: 'ta' },
        { from: 'd1', to: 'sy' }, { from: 'd1', to: 'kmi' }, { from: 'd1', to: 'kt' },
        { from: 'd2', to: 'an' }, { from: 'd2', to: 'km' },
        { from: 'd3', to: 'dia' }, { from: 'd3', to: 'bel' }, { from: 'd3', to: 'mer' },
        { from: 'tu', to: 'in' }, { from: 'tu', to: 'sn' },
        { from: 'ta', to: 'ap' }, { from: 'ta', to: 'mg' },
      ],
      required: ['saya', 'anda', 'beliau', 'kami', 'kita', 'mereka'],
    },

    'penjodoh-bilangan': {
      nodes: [
        { id: 'r', label: 'PENJODOH BILANGAN', color: { border: '#34d399' } },
        // Categories by shape/nature
        { id: 'ms', label: 'Manusia' },
        { id: 'hw', label: 'Haiwan' },
        { id: 'bs', label: 'Objek Besar' },
        { id: 'np', label: 'Nipis / Kain' },
        { id: 'pk', label: 'Panjang / Kurus' },
        { id: 'bk', label: 'Bulat / Kecil' },
        { id: 'ps', label: 'Berpasangan' },
        { id: 'kp', label: 'Kelompok' },
        { id: 'kc', label: 'Sedikit / Cecair' },
        // Penjodoh examples
        { id: 'or', label: 'seorang' },
        { id: 'ek', label: 'seekor' },
        { id: 'bh', label: 'sebuah' },
        { id: 'he', label: 'sehelai' },
        { id: 'kp_', label: 'sekeping' },
        { id: 'bt', label: 'sebatang' },
        { id: 'bi', label: 'sebiji' },
        { id: 'bo', label: 'sebola (sebiji bola)' },
        { id: 'pa', label: 'sepasang' },
        { id: 'kw', label: 'sekawan / sekumpulan' },
        { id: 'tt', label: 'setitis' },
        { id: 'gg', label: 'segenggam' },
      ],
      edges: [
        { from: 'r', to: 'ms' }, { from: 'r', to: 'hw' }, { from: 'r', to: 'bs' },
        { from: 'r', to: 'np' }, { from: 'r', to: 'pk' }, { from: 'r', to: 'bk' },
        { from: 'r', to: 'ps' }, { from: 'r', to: 'kp' }, { from: 'r', to: 'kc' },
        { from: 'ms', to: 'or' }, { from: 'hw', to: 'ek' },
        { from: 'bs', to: 'bh' }, { from: 'np', to: 'he' }, { from: 'np', to: 'kp_' },
        { from: 'pk', to: 'bt' }, { from: 'bk', to: 'bi' }, { from: 'bk', to: 'bo' },
        { from: 'ps', to: 'pa' }, { from: 'kp', to: 'kw' },
        { from: 'kc', to: 'tt' }, { from: 'kc', to: 'gg' },
      ],
      required: ['seorang', 'seekor', 'sebuah', 'sehelai', 'sebatang', 'sebiji', 'sepasang'],
    },

    // Phase 3 topics
    'kosa-kata': {
      nodes: [
        { id: 'r', label: 'KOSA KATA', color: { border: '#fbbf24' } },
        { id: 'em', label: 'Emosi' },
        { id: 'pr', label: 'Pergerakan' },
        { id: 'sf', label: 'Sifat Watak' },
        { id: 'ls', label: 'Latar Tempat' },
        { id: 'kl', label: 'Keluarga & Komuniti' },
        { id: 'sh', label: 'Sekolah & Pembelajaran' },
        { id: 'em+',label: 'gembira, sedih, terharu' },
        { id: 'pr+',label: 'berlari, melompat, bergegas' },
        { id: 'sf+',label: 'rajin, sabar, peramah' },
        { id: 'ls+',label: 'hujan lebat, suasana meriah' },
        { id: 'kl+',label: 'gotong-royong, jiran' },
        { id: 'sh+',label: 'cemerlang, mengulang kaji' },
      ],
      edges: [
        { from: 'r', to: 'em' }, { from: 'r', to: 'pr' }, { from: 'r', to: 'sf' },
        { from: 'r', to: 'ls' }, { from: 'r', to: 'kl' }, { from: 'r', to: 'sh' },
        { from: 'em', to: 'em+' }, { from: 'pr', to: 'pr+' }, { from: 'sf', to: 'sf+' },
        { from: 'ls', to: 'ls+' }, { from: 'kl', to: 'kl+' }, { from: 'sh', to: 'sh+' },
      ],
      required: ['Emosi', 'Pergerakan', 'Sifat', 'Komuniti'],
    },

    'sinonim-antonim': {
      nodes: [
        { id: 'r', label: 'SINONIM & ANTONIM', color: { border: '#fbbf24' } },
        { id: 'sn', label: 'Sinonim (seerti)' },
        { id: 'an', label: 'Antonim (berlawanan)' },
        { id: 's1', label: 'gembira ↔ riang, sukacita' },
        { id: 's2', label: 'pandai ↔ cerdik, bijak' },
        { id: 's3', label: 'cantik ↔ jelita, indah' },
        { id: 'a1', label: 'tinggi ↔ rendah' },
        { id: 'a2', label: 'rajin ↔ malas' },
        { id: 'a3', label: 'berani ↔ takut' },
        { id: 'a4', label: 'kaya ↔ miskin' },
      ],
      edges: [
        { from: 'r', to: 'sn' }, { from: 'r', to: 'an' },
        { from: 'sn', to: 's1' }, { from: 'sn', to: 's2' }, { from: 'sn', to: 's3' },
        { from: 'an', to: 'a1' }, { from: 'an', to: 'a2' }, { from: 'an', to: 'a3' }, { from: 'an', to: 'a4' },
      ],
      required: ['Sinonim', 'Antonim'],
    },

    'peribahasa': {
      nodes: [
        { id: 'r', label: 'PERIBAHASA', color: { border: '#e879f9' } },
        { id: 't1', label: 'Hubungan & Perpaduan' },
        { id: 't2', label: 'Usaha & Ketekunan' },
        { id: 't3', label: 'Kebijaksanaan' },
        { id: 't4', label: 'Akibat & Perbuatan' },
        { id: 't5', label: 'Kesusahan' },
        { id: 't6', label: 'Tolong-menolong' },
        { id: 'e1', label: 'Bagai aur dengan tebing' },
        { id: 'e2', label: 'Berakit-rakit ke hulu…' },
        { id: 'e3', label: 'Sedikit-sedikit, lama-lama menjadi bukit' },
        { id: 'e4', label: 'Ada udang di sebalik batu' },
        { id: 'e5', label: 'Sudah jatuh ditimpa tangga' },
        { id: 'e6', label: 'Bersatu teguh, bercerai roboh' },
      ],
      edges: [
        { from: 'r', to: 't1' }, { from: 'r', to: 't2' }, { from: 'r', to: 't3' },
        { from: 'r', to: 't4' }, { from: 'r', to: 't5' }, { from: 'r', to: 't6' },
        { from: 't1', to: 'e1' }, { from: 't2', to: 'e2' }, { from: 't2', to: 'e3' },
        { from: 't4', to: 'e4' }, { from: 't5', to: 'e5' }, { from: 't1', to: 'e6' },
      ],
      required: ['Hubungan', 'Usaha', 'Kebijaksanaan', 'Akibat'],
    },

    'simpulan-bahasa': {
      nodes: [
        { id: 'r', label: 'SIMPULAN BAHASA', color: { border: '#e879f9' } },
        { id: 't1', label: 'Sifat Watak' },
        { id: 't2', label: 'Hubungan' },
        { id: 't3', label: 'Emosi' },
        { id: 't4', label: 'Tindakan' },
        { id: 'e1', label: 'panjang tangan (suka mencuri)' },
        { id: 'e2', label: 'buah hati (kekasih)' },
        { id: 'e3', label: 'naik darah (marah)' },
        { id: 'e4', label: 'bermuka dua (tidak jujur)' },
        { id: 'e5', label: 'mata duitan (gemar wang)' },
        { id: 'e6', label: 'tangan kanan (orang kepercayaan)' },
      ],
      edges: [
        { from: 'r', to: 't1' }, { from: 'r', to: 't2' }, { from: 'r', to: 't3' }, { from: 'r', to: 't4' },
        { from: 't1', to: 'e1' }, { from: 't2', to: 'e2' }, { from: 't3', to: 'e3' },
        { from: 't1', to: 'e4' }, { from: 't1', to: 'e5' }, { from: 't2', to: 'e6' },
      ],
      required: ['Sifat', 'Hubungan', 'Emosi', 'Tindakan'],
    },
  };

  // ── Helpers ────────────────────────────────────────────
  function topicId() { return global.MALAY_TOPIC_ID || null; }

  function ringSvg(pct, color) {
    const r = 14, circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return `
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="${r}" fill="none" stroke="var(--border)" stroke-width="3"/>
        <circle cx="20" cy="20" r="${r}" fill="none" stroke="${color}" stroke-width="3"
                stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
                stroke-linecap="round"
                transform="rotate(-90 20 20)"/>
        <text x="20" y="24" text-anchor="middle" fill="${color}" font-size="9" font-weight="700">${pct}%</text>
      </svg>`;
  }

  function buildHeader(topic) {
    const el = document.getElementById('topic-header');
    if (!el) return;
    const theme = topic._theme || 'tatabahasa';
    const themeColor = `var(--${theme})`;
    const pct = (typeof Progress !== 'undefined') ? Progress.masteryPct(topicId()) : 0;
    const levels = (topic.levels || []).map(l => `<span class="badge badge-${'p' + l.slice(1).toLowerCase()}">${l}</span>`).join('');
    el.innerHTML = `
      <button class="back-link" onclick="window.location.href='../../index.html'">← Kembali ke Hub</button>
      <div class="topic-color-bar" style="background:${themeColor}"></div>
      <div class="topic-title-wrap">
        <h1>${topic.title}</h1>
        <div class="topic-meta-pills">
          <span class="badge badge-${theme}">${theme}</span>
          ${levels}
        </div>
      </div>
      <div class="topic-mastery">${ringSvg(pct, themeColor)}<span class="mastery-label">Penguasaan</span></div>
    `;
  }

  function renderPelajaran(topic) {
    const pane = document.getElementById('tab-pelajaran');
    if (!pane) return;
    const themeColor = `var(--${topic._theme || 'tatabahasa'})`;
    const keyQs = (topic.keyQuestions || []).map(q => `<li>${q}</li>`).join('');
    const gloss = (topic.glossary || []).map(g => `
      <div class="glossary-term">
        <div class="term-name">${g.term}</div>
        <div class="term-def">${g.definition}</div>
        ${g.template ? `<div class="term-template" style="font-size:.78rem;color:var(--muted);margin-top:.25rem;font-style:italic">${g.template}</div>` : ''}
      </div>
    `).join('');
    const psle = (topic.pslePrompts || []).map(p => `<li>${p}</li>`).join('');

    pane.innerHTML = `
      <section class="pel-section">
        <h3>Soalan Kunci</h3>
        <ul class="key-questions">${keyQs || '<li style="color:var(--muted)">Tiada soalan kunci.</li>'}</ul>
      </section>
      <section class="pel-section">
        <h3>Pelajaran</h3>
        <div class="learn-body">${topic.learnHTML || ''}</div>
      </section>
      <section class="pel-section">
        <h3>Glosari</h3>
        <div class="glossary">${gloss || '<p style="color:var(--muted)">Tiada istilah.</p>'}</div>
      </section>
      <section class="pel-section">
        <h3>Ringkasan</h3>
        <div class="summary-body">${topic.summaryHTML || ''}</div>
      </section>
      <section class="pel-section psle-tips-section" style="border-left:3px solid ${themeColor}">
        <h3>📝 Petua PSLE</h3>
        <ul class="psle-tips">${psle || '<li style="color:var(--muted)">Tiada petua.</li>'}</ul>
      </section>
    `;
  }

  function wireLatih(topic) {
    const container = document.getElementById('tab-latih');
    if (!container) return;
    container.innerHTML = '<div id="latih-mount"></div>';
    if (global.MalayLatih && typeof global.MalayLatih.mount === 'function') {
      global.MalayLatih.mount(topic.id, document.getElementById('latih-mount'));
    } else {
      container.innerHTML = '<p style="color:var(--muted);font-style:italic">Modul Latih tidak dimuat.</p>';
    }
  }

  function wireKuiz(topic) {
    const tab = document.getElementById('tab-kuiz');
    if (!tab) return;
    const lv = (topic.levels && topic.levels.length) ? parseInt(topic.levels[topic.levels.length - 1].slice(1), 10) || 5 : 5;
    tab.innerHTML = `
      <div id="quiz-container" data-topic-id="${topic.id}" data-topic-name="${topic.title}" data-topic-level="${lv}">
        <p style="color:var(--muted)">Memuat soalan…</p>
      </div>
    `;
    if (typeof global.initAIQuizToggle === 'function') {
      global.initAIQuizToggle(topic.questions || []);
    }
  }

  function wireMindMap(topic) {
    const tab = document.getElementById('tab-peta-minda');
    if (!tab) return;
    const template = MIND_MAP_TEMPLATES[topic.id] || { nodes: [{ id: 'r', label: topic.title, color: { border: '#34d399' } }], edges: [], required: [] };
    tab.innerHTML = `
      <div class="mm-toolbar">
        <button class="btn btn-ghost btn-sm" id="mm-add">＋ Nod</button>
        <button class="btn btn-ghost btn-sm" id="mm-link">🔗 Sambung</button>
        <button class="btn btn-ghost btn-sm" id="mm-delete">🗑 Padam</button>
        <button class="btn btn-ghost btn-sm" id="mm-physics">🌀 Susun Semula</button>
        <button class="btn btn-ghost btn-sm" id="mm-reset">↺ Set Semula</button>
        <button class="btn btn-ghost btn-sm" id="mm-load">⬇ Muat</button>
        <button class="btn btn-primary btn-sm" id="mm-save">💾 Simpan</button>
        <button class="btn btn-primary btn-sm" id="mm-check">🔍 Semak</button>
      </div>
      <div id="mindmap-container" class="mm-container"></div>
      <div id="mindmap-feedback" class="mm-feedback" style="display:none"></div>
    `;
    if (typeof global.MalayMindMap === 'function') {
      const mm = new global.MalayMindMap('mindmap-container', topic.id, template);
      document.getElementById('mm-add').addEventListener('click', () => {
        const label = prompt('Label nod baharu:');
        if (label && label.trim()) mm.addNode(label.trim());
      });
      document.getElementById('mm-link').addEventListener('click', () => mm.addEdge());
      document.getElementById('mm-delete').addEventListener('click', () => mm.deleteSelected());
      document.getElementById('mm-physics').addEventListener('click', () => mm.togglePhysics());
      document.getElementById('mm-reset').addEventListener('click', () => mm.reset());
      document.getElementById('mm-load').addEventListener('click', () => mm.load());
      document.getElementById('mm-save').addEventListener('click', () => mm.save());
      document.getElementById('mm-check').addEventListener('click', () => mm.check());
    }
  }

  function wireTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  }

  async function run() {
    const id = topicId();
    if (!id) return;

    // Record visit immediately (counts toward mastery)
    if (typeof Progress !== 'undefined') Progress.recordVisit(id);

    let topic;
    try {
      topic = global.MalayContent ? await global.MalayContent.loadTopic(id) : null;
    } catch (err) {
      console.warn('Topic load failed', err);
    }
    if (!topic) {
      const err = document.getElementById('topic-error');
      if (err) { err.style.display = 'block'; err.textContent = `Tidak dapat memuat topik "${id}".`; }
      return;
    }

    buildHeader(topic);
    renderPelajaran(topic);
    wireLatih(topic);
    wireKuiz(topic);
    wireMindMap(topic);
    wireTabs();

    document.title = `${topic.title} | PSLE Bahasa Melayu Studio`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})(typeof window !== 'undefined' ? window : globalThis);
