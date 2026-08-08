/* ===========================================================================
   GeoGames - Historical eras

   HOW TO READ THIS FILE, AND ITS HONEST LIMITS
   -------------------------------------------
   Every era paints today's country shapes in the colours of the powers that
   held that ground at that date. That is a deliberate simplification and it is
   wrong in the details: historical borders did not follow modern ones, empires
   controlled coastlines and river valleys rather than whole nations, vassals
   and tributaries were not the same as provinces, and vast regions belonged to
   peoples who kept no maps at all. A country is listed under a power when a
   substantial part of its modern territory sat under that power's control at
   that date.

   Treat these as posters, not as survey maps. Where a claim is especially
   rough, the polity's `caveat` says so, and the app shows it.

   Countries with no entry in an era are drawn in neutral grey and labelled
   "other states and peoples" - never "empty", because it never was.

   Each era:
     id, year, title, subtitle, note   - the framing shown to the player
     polities: [{ id, name, colour, iso: [...], blurb, caveat? }]
   =========================================================================== */

export const ERAS = [
  // ── 1279 ────────────────────────────────────────────────────────────────
  {
    id: 'mongol',
    year: 1279,
    title: 'The Mongol Century',
    subtitle: 'One family rules from the Pacific to the Danube',
    note: 'Within three generations of Genghis Khan, the Mongols assembled the largest contiguous land empire there has ever been. By 1279 it had split into four rival khanates that still recognised a common ancestry.',
    polities: [
      { id: 'yuan', name: 'Yuan China', colour: '#c94f4f',
        iso: ['CN', 'MN', 'KP', 'KR'],
        blurb: 'Kublai Khan completed the conquest of Song China in 1279 and ruled it as the Yuan dynasty from Khanbaliq, today Beijing.',
        caveat: 'Korea (Goryeo) was a tributary kingdom, not a province.' },
      { id: 'chagatai', name: 'Chagatai & Ilkhanate', colour: '#e08b3c',
        iso: ['UZ', 'KZ', 'KG', 'TJ', 'TM', 'AF', 'IR', 'IQ', 'AZ', 'AM', 'GE', 'TR'],
        blurb: 'Two Mongol khanates split Central Asia and Persia between them. The Ilkhans ruled from Tabriz over the ruins of Baghdad, sacked in 1258.',
        caveat: 'Anatolia was held indirectly, through the Seljuk sultanate of Rum as a vassal.' },
      { id: 'horde', name: 'The Golden Horde', colour: '#d4a03c',
        iso: ['RU', 'UA', 'BY', 'MD', 'KZ'],
        blurb: 'The Rus principalities paid tribute to the Horde for over two centuries, a period Russian historians call the Tatar yoke.',
        caveat: 'Novgorod and the western Rus lands were tributary rather than occupied.' },
      { id: 'mamluk', name: 'Mamluk Sultanate', colour: '#4f9d8c',
        iso: ['EG', 'SY', 'LB', 'JO', 'IL', 'SA'],
        blurb: 'A state ruled by former slave soldiers, and the only power to beat the Mongols in open battle, at Ain Jalut in 1260.' },
      { id: 'delhi', name: 'Delhi Sultanate', colour: '#8f6bb5',
        iso: ['IN', 'PK', 'BD'],
        blurb: 'Turkic sultans ruled northern India and held the Mongols at the Indus for a hundred years.',
        caveat: 'Southern India stayed under independent Hindu kingdoms.' },
      { id: 'hre', name: 'Holy Roman Empire', colour: '#6b8fd4',
        iso: ['DE', 'AT', 'CZ', 'CH', 'NL', 'BE', 'LU', 'SI'],
        blurb: 'Neither holy, nor Roman, nor an empire, said Voltaire later. It was a patchwork of hundreds of principalities under an elected emperor.' },
      { id: 'byz', name: 'Byzantine Empire', colour: '#b5567d',
        iso: ['GR'],
        blurb: 'The Roman Empire had never actually ended in the east. In 1261 it clawed Constantinople back from crusaders, with two centuries left to live.' },
      { id: 'mali', name: 'Mali Empire', colour: '#c9a227',
        iso: ['ML', 'SN', 'GM', 'GN', 'MR', 'BF', 'GW'],
        blurb: 'Built on gold and the Niger river. Its later king Mansa Musa gave away so much gold crossing Egypt that he crashed the regional price of it.' },
      { id: 'khmer', name: 'Khmer Empire', colour: '#5aa96b',
        iso: ['KH', 'TH', 'LA'],
        blurb: 'Angkor was the largest pre-industrial city on Earth, a hydraulic capital of perhaps three quarters of a million people.' },
      { id: 'zimbabwe', name: 'Kingdom of Zimbabwe', colour: '#a8785a',
        iso: ['ZW'],
        blurb: 'Great Zimbabwe traded gold and ivory for Chinese porcelain and Persian glass, and built in dry stone without mortar.' },
    ],
  },

  // ── 1450 ────────────────────────────────────────────────────────────────
  {
    id: 'before-1492',
    year: 1450,
    title: 'Before the Ocean Crossings',
    subtitle: 'The last generation of a world that had not met itself',
    note: 'In 1450 nobody in Cusco knew that Beijing existed. Within eighty years the oceans would be sewn together, and almost every polity on this map would be transformed or destroyed by it.',
    polities: [
      { id: 'ming', name: 'Ming China', colour: '#c94f4f',
        iso: ['CN', 'MN'],
        blurb: 'The richest state on Earth. Its treasure fleets had reached East Africa a generation earlier, then were called home and the shipyards shut.' },
      { id: 'ottoman', name: 'Ottoman Empire', colour: '#4f9d8c',
        iso: ['TR', 'GR', 'BG', 'MK', 'AL', 'RS', 'BA', 'ME'],
        blurb: 'Three years from taking Constantinople and ending the Roman Empire for good.' },
      { id: 'timurid', name: 'Timurid Empire', colour: '#e08b3c',
        iso: ['UZ', 'AF', 'IR', 'TM', 'TJ'],
        blurb: 'Samarkand under Ulugh Beg housed an observatory whose star catalogue stayed the best in the world for two hundred years.' },
      { id: 'delhi2', name: 'Sultanates of India', colour: '#8f6bb5',
        iso: ['IN', 'PK', 'BD'],
        blurb: 'The Delhi Sultanate had fractured into rival sultanates, with the Hindu empire of Vijayanagara holding the south.',
        caveat: 'A patchwork of many states, not one realm.' },
      { id: 'inca', name: 'Inca Empire', colour: '#d4a03c',
        iso: ['PE', 'EC', 'BO', 'CL'],
        blurb: 'Four thousand kilometres of Andes bound together by roads and knotted-cord records, and no writing and no wheel.' },
      { id: 'aztec', name: 'Aztec Triple Alliance', colour: '#b5567d',
        iso: ['MX'],
        blurb: 'Tenochtitlan sat on an island in a lake, fed by floating gardens, and was larger than any city in Spain.' },
      { id: 'songhai', name: 'Songhai Empire', colour: '#c9a227',
        iso: ['ML', 'NE', 'BF', 'SN', 'GM', 'GN', 'MR', 'NG'],
        blurb: 'Rising as Mali fell. Timbuktu was a university town where books were a more valuable import than salt.' },
      { id: 'ethiopia', name: 'Ethiopian Empire', colour: '#5aa96b',
        iso: ['ET', 'ER'],
        blurb: 'A Christian kingdom that had already lasted a thousand years, and would keep its independence through the age of empires.' },
      { id: 'hre2', name: 'Holy Roman Empire', colour: '#6b8fd4',
        iso: ['DE', 'AT', 'CZ', 'CH', 'NL', 'BE', 'LU', 'SI'],
        blurb: 'A German printer in Mainz was, at this moment, assembling a machine with movable type.' },
      { id: 'iberia', name: 'Castile, Aragon & Portugal', colour: '#7b6bb5',
        iso: ['ES', 'PT'],
        blurb: 'Portuguese caravels were feeling their way down the African coast. The Atlantic was about to stop being an edge and become a road.' },
      { id: 'muscovy', name: 'Grand Duchy of Moscow', colour: '#8899aa',
        iso: ['RU'],
        blurb: 'Still paying tribute to the Horde, and thirty years from refusing to.' },
    ],
  },

  // ── 1600 ────────────────────────────────────────────────────────────────
  {
    id: 'gunpowder',
    year: 1600,
    title: 'The Gunpowder Empires',
    subtitle: 'Cannon, ocean ships and silver remake the map',
    note: 'Three Muslim empires ruled a belt from the Danube to Bengal. Spain had swallowed the American silver mountains. And a joint-stock company had just been chartered in London to trade east of the Cape.',
    polities: [
      { id: 'ottoman2', name: 'Ottoman Empire', colour: '#4f9d8c',
        iso: ['TR', 'GR', 'BG', 'MK', 'AL', 'RS', 'BA', 'ME', 'HR', 'HU', 'RO', 'MD', 'SY', 'LB', 'JO', 'IL', 'IQ', 'EG', 'LY', 'TN', 'DZ', 'SA', 'YE', 'KW', 'SD'],
        blurb: 'At its height. The sultan in Istanbul ruled from Budapest to Basra and called himself the shadow of God on Earth.',
        caveat: 'North African provinces were near-autonomous; Arabian control hugged the coasts.' },
      { id: 'safavid', name: 'Safavid Persia', colour: '#e08b3c',
        iso: ['IR', 'AZ', 'AM', 'GE', 'AF', 'TM'],
        blurb: 'Shah Abbas made Isfahan into half the world, as the saying went, and made Shia Islam the state faith of Iran.' },
      { id: 'mughal', name: 'Mughal Empire', colour: '#8f6bb5',
        iso: ['IN', 'PK', 'BD', 'AF'],
        blurb: 'Akbar ruled a hundred million people and abolished the tax on non-Muslims. India produced roughly a quarter of the world economy.' },
      { id: 'ming2', name: 'Ming China', colour: '#c94f4f',
        iso: ['CN', 'MN'],
        blurb: 'Absorbing American silver by the shipload through Manila, and forty years from collapse.' },
      { id: 'tokugawa', name: 'Tokugawa Japan', colour: '#b5567d',
        iso: ['JP'],
        blurb: 'The battle of Sekigahara in 1600 ended a century of civil war and began 250 years of closed, unbroken peace.' },
      { id: 'spain', name: 'Spanish Empire', colour: '#d4a03c',
        iso: ['ES', 'PT', 'MX', 'PE', 'BO', 'CL', 'AR', 'CO', 'EC', 'VE', 'PA', 'CR', 'NI', 'HN', 'SV', 'GT', 'CU', 'DO', 'PY', 'UY', 'PH'],
        blurb: 'The first empire on which the sun never set. Potosi silver paid for it, and inflated prices from Seville to Guangzhou.',
        caveat: 'Interior South America was claimed on paper long before it was reached.' },
      { id: 'portugal', name: 'Portuguese trading empire', colour: '#5aa96b',
        iso: ['BR', 'AO', 'MZ', 'GW', 'ST', 'CV', 'TL', 'OM'],
        blurb: 'Not territory so much as a chain of forts and harbours from Brazil to Nagasaki. Under the same crown as Spain from 1580 to 1640.',
        caveat: 'Coastal footholds and trading posts, not control of the interiors.' },
      { id: 'russia2', name: 'Tsardom of Russia', colour: '#8899aa',
        iso: ['RU', 'UA', 'KZ'],
        blurb: 'Fur trappers were crossing Siberia at extraordinary speed; the Pacific was forty years away.' },
      { id: 'songhai2', name: 'Kanem-Bornu & the Sahel', colour: '#c9a227',
        iso: ['NE', 'TD', 'NG', 'CM', 'ML', 'BF'],
        blurb: 'Songhai had been broken by a Moroccan army with muskets in 1591. Kanem-Bornu carried on, trading horses and salt across the desert.' },
    ],
  },

  // ── 1815 ────────────────────────────────────────────────────────────────
  {
    id: 'after-napoleon',
    year: 1815,
    title: 'After Napoleon',
    subtitle: 'The Congress of Vienna redraws Europe',
    note: 'One man had just spent fifteen years rearranging Europe. With Waterloo, the winners met in Vienna to put it back, and Spanish America seized the moment to leave.',
    polities: [
      { id: 'britain', name: 'British Empire', colour: '#c94f4f',
        iso: ['GB', 'IE', 'CA', 'AU', 'IN', 'PK', 'BD', 'LK', 'ZA', 'MT', 'GY', 'BZ', 'JM', 'TT', 'BS', 'BB', 'MU', 'SC'],
        blurb: 'Master of the seas after Trafalgar, and about to spend a century as the workshop of the world.',
        caveat: 'India was governed by the East India Company, not the Crown, until 1858.' },
      { id: 'russia3', name: 'Russian Empire', colour: '#8899aa',
        iso: ['RU', 'UA', 'BY', 'LT', 'LV', 'EE', 'FI', 'PL', 'MD', 'GE', 'AM', 'AZ', 'KZ'],
        blurb: 'The tsar had marched to Paris. Russia now stretched from Warsaw to Alaska.' },
      { id: 'austria', name: 'Austrian Empire', colour: '#6b8fd4',
        iso: ['AT', 'HU', 'CZ', 'SK', 'SI', 'HR', 'BA', 'RO', 'IT'],
        blurb: 'Metternich hosted the Congress and spent the next thirty years trying to freeze the results.',
        caveat: 'Northern Italy only; the peninsula was still divided.' },
      { id: 'ottoman3', name: 'Ottoman Empire', colour: '#4f9d8c',
        iso: ['TR', 'GR', 'BG', 'MK', 'AL', 'RS', 'ME', 'SY', 'LB', 'JO', 'IL', 'IQ', 'EG', 'LY', 'TN', 'DZ', 'SA', 'YE', 'SD'],
        blurb: 'Still vast, and now known in European chancelleries as the sick man of Europe. Greece would revolt within six years.' },
      { id: 'qing', name: 'Qing China', colour: '#e08b3c',
        iso: ['CN', 'MN', 'VN', 'LA', 'KP', 'KR'],
        blurb: 'The largest economy on Earth and quite uninterested in European trade goods, which was about to become a problem involving opium.',
        caveat: 'Korea and the Indochinese kingdoms were tributaries, not territory.' },
      { id: 'usa', name: 'United States', colour: '#5aa96b',
        iso: ['US'],
        blurb: 'Eighteen states, and a continent bought cheap from Napoleon twelve years earlier.' },
      { id: 'newworld', name: 'The new republics', colour: '#d4a03c',
        iso: ['AR', 'CL', 'CO', 'VE', 'EC', 'PE', 'BO', 'PY', 'UY', 'MX', 'HT'],
        blurb: 'Bolivar and San Martin were dismantling the Spanish empire from both ends of South America. Haiti had already freed itself in 1804.',
        caveat: 'Independence was fought for between 1810 and 1825; 1815 caught it mid-war.' },
      { id: 'brazil', name: 'Kingdom of Brazil', colour: '#8f6bb5',
        iso: ['BR', 'PT'],
        blurb: 'The Portuguese court had fled Napoleon and moved to Rio. For a while, the colony ruled the mother country.' },
      { id: 'france', name: 'France', colour: '#b5567d',
        iso: ['FR', 'BE', 'NL', 'LU', 'ES', 'CH', 'DE', 'DK', 'NO', 'SE'],
        blurb: 'Back to its 1792 borders, with a Bourbon king again. The rest of the shading here is the Europe Napoleon had held and just lost.',
        caveat: 'Shows the reach of the Napoleonic system at its peak, not French territory in 1815.' },
    ],
  },

  // ── 1914 ────────────────────────────────────────────────────────────────
  {
    id: 'empires-1914',
    year: 1914,
    title: 'The World of Empires',
    subtitle: 'The summer before the guns',
    note: 'A handful of European capitals governed most of the human race. Four years later four of these empires no longer existed. This is the map that explains a great many of today’s borders.',
    polities: [
      { id: 'brit14', name: 'British Empire', colour: '#c94f4f',
        iso: ['GB', 'IE', 'CA', 'AU', 'NZ', 'IN', 'PK', 'BD', 'MM', 'LK', 'MY', 'SG', 'BN', 'ZA', 'EG', 'SD', 'NG', 'GH', 'KE', 'UG', 'TZ', 'ZM', 'ZW', 'MW', 'BW', 'LS', 'SZ', 'SL', 'GM', 'SO', 'CY', 'MT', 'GY', 'BZ', 'JM', 'TT', 'BS', 'BB', 'MU', 'SC', 'FJ', 'PG', 'SB', 'KI', 'TV', 'IQ', 'KW', 'BH', 'QA', 'AE', 'YE', 'AG', 'DM', 'GD', 'KN', 'LC', 'VC', 'TO'],
        blurb: 'A quarter of the land and a quarter of the people. Twenty-five thousand miles of it, and the sun genuinely never set.',
        caveat: 'Includes protectorates and Gulf treaty states, whose rulers kept internal power.' },
      { id: 'fr14', name: 'French colonial empire', colour: '#6b8fd4',
        iso: ['FR', 'DZ', 'TN', 'MA', 'ML', 'NE', 'TD', 'SN', 'GN', 'CI', 'BF', 'BJ', 'MR', 'GA', 'CG', 'CF', 'CM', 'DJ', 'MG', 'KM', 'VN', 'LA', 'KH'],
        blurb: 'Second only to Britain, and built on the idea that colonies would one day become French.' },
      { id: 'ru14', name: 'Russian Empire', colour: '#8899aa',
        iso: ['RU', 'UA', 'BY', 'LT', 'LV', 'EE', 'FI', 'PL', 'MD', 'GE', 'AM', 'AZ', 'KZ', 'UZ', 'TM', 'TJ', 'KG'],
        blurb: 'A sixth of the world’s land under one crown, with three years left on it.' },
      { id: 'de14', name: 'German Empire', colour: '#4a4a5a',
        iso: ['DE', 'PL', 'NA', 'TZ', 'CM', 'TG', 'RW', 'BI', 'PG'],
        blurb: 'Unified only in 1871, industrially the strongest state in Europe, and late to the scramble for colonies.' },
      { id: 'ah14', name: 'Austria-Hungary', colour: '#8f6bb5',
        iso: ['AT', 'HU', 'CZ', 'SK', 'SI', 'HR', 'BA', 'RO', 'PL', 'UA', 'RS'],
        blurb: 'A dozen nationalities under one elderly emperor. An assassination in Sarajevo in June would bring the whole thing down.' },
      { id: 'ot14', name: 'Ottoman Empire', colour: '#4f9d8c',
        iso: ['TR', 'SY', 'LB', 'JO', 'IL', 'IQ', 'SA', 'YE', 'LY'],
        blurb: 'Six centuries old, shrunk to its Anatolian and Arab core, and about to be carved up by secret treaty.' },
      { id: 'pt14', name: 'Portuguese Empire', colour: '#5aa96b',
        iso: ['PT', 'AO', 'MZ', 'GW', 'CV', 'ST', 'TL'],
        blurb: 'The first European seaborne empire, and very nearly the last to let go.' },
      { id: 'be14', name: 'Belgian Congo', colour: '#c9a227',
        iso: ['BE', 'CD'],
        blurb: 'Held until 1908 as the personal property of King Leopold II, whose rule there killed millions and became an international scandal.' },
      { id: 'it14', name: 'Italian Empire', colour: '#b5567d',
        iso: ['IT', 'LY', 'ER', 'SO'],
        blurb: 'A latecomer. Italy had been beaten by Ethiopia at Adwa in 1896, the first defeat of a European army by an African one in the colonial era.' },
      { id: 'nl14', name: 'Dutch East Indies', colour: '#e08b3c',
        iso: ['NL', 'ID', 'SR'],
        blurb: 'Spices had brought the Dutch east three centuries earlier. What kept them there now was rubber, tin and oil.' },
      { id: 'jp14', name: 'Empire of Japan', colour: '#d4787d',
        iso: ['JP', 'KR', 'KP', 'TW'],
        blurb: 'Fifty years from feudal isolation to beating Russia in a modern war. The only non-European power in this club.' },
      { id: 'us14', name: 'United States', colour: '#5b9e6b',
        iso: ['US', 'PH', 'CU', 'PA'],
        blurb: 'Newly an overseas power after 1898, and finishing a canal that cut the sailing distance from New York to San Francisco by half.' },
      { id: 'ind14', name: 'Independent states', colour: '#7a8fb5',
        iso: ['CN', 'TH', 'ET', 'LR', 'IR', 'AF', 'MN', 'NP', 'BT', 'MX', 'BR', 'AR', 'CL', 'CO', 'VE', 'PE', 'BO', 'EC', 'PY', 'UY', 'GT', 'HN', 'SV', 'NI', 'CR', 'DO', 'HT', 'ES', 'NO', 'SE', 'DK', 'CH', 'GR', 'BG', 'AL', 'ME', 'LU'],
        blurb: 'Not in any European empire. Ethiopia and Siam had stayed independent by force and by diplomacy; Liberia had been founded by freed American slaves.',
        caveat: 'Several of these, notably China and Persia, were heavily constrained by foreign concessions.' },
    ],
  },

  // ── 1945 ────────────────────────────────────────────────────────────────
  {
    id: 'cold-war',
    year: 1955,
    title: 'Two Worlds and a Third',
    subtitle: 'The Cold War hardens, the empires start to go',
    note: 'Ten years after the war the planet had sorted into two armed camps, while a third group of newly independent states refused to join either. The Bandung Conference of 1955 is where that third group first met.',
    polities: [
      { id: 'nato', name: 'The Western bloc', colour: '#4a72c9',
        iso: ['US', 'CA', 'GB', 'FR', 'IT', 'BE', 'NL', 'LU', 'DK', 'NO', 'IS', 'PT', 'ES', 'GR', 'TR', 'DE', 'AU', 'NZ', 'JP', 'KR', 'PH', 'TH'],
        blurb: 'NATO plus the Pacific treaty states. West Germany joined in 1955, which is precisely why the other side formed the Warsaw Pact that same year.' },
      { id: 'warsaw', name: 'The Eastern bloc', colour: '#c94f4f',
        iso: ['RU', 'UA', 'BY', 'LT', 'LV', 'EE', 'MD', 'GE', 'AM', 'AZ', 'KZ', 'UZ', 'TM', 'TJ', 'KG', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'AL', 'CN', 'MN', 'KP', 'VN'],
        blurb: 'The Soviet Union, its satellites, and the communist states of Asia. The Sino-Soviet friendship on this map had about five years left in it.',
        caveat: 'Yugoslavia was communist but non-aligned; China and the USSR were allies only briefly.' },
      { id: 'nonaligned', name: 'The non-aligned', colour: '#d4a03c',
        iso: ['IN', 'ID', 'EG', 'YU', 'RS', 'HR', 'BA', 'SI', 'ME', 'MK', 'MM', 'LK', 'AF', 'ET', 'GH', 'SY', 'IQ', 'SA', 'LY', 'SD', 'PK', 'IR', 'NP', 'KH', 'LA'],
        blurb: 'Nehru, Nasser, Sukarno and Tito argued that a newly free country should not immediately pick a new master.',
        caveat: 'Non-alignment was a movement rather than a bloc; membership shifted year to year.' },
      { id: 'colonial55', name: 'Still colonies', colour: '#8a7a6a',
        iso: ['DZ', 'MA', 'TN', 'NG', 'KE', 'UG', 'TZ', 'ZM', 'ZW', 'MW', 'MZ', 'AO', 'CD', 'CM', 'CI', 'SN', 'ML', 'NE', 'TD', 'CF', 'CG', 'GA', 'GN', 'BF', 'BJ', 'TG', 'MR', 'SL', 'GM', 'SO', 'MG', 'NA', 'BW', 'LS', 'SZ', 'RW', 'BI', 'MY', 'SG', 'CY', 'MT', 'JM', 'TT', 'GY', 'SR', 'FJ', 'PG'],
        blurb: 'Most of Africa was still ruled from Europe. Within fifteen years almost none of it would be: 1960 alone brought seventeen independent African states.' },
      { id: 'latin55', name: 'Latin America', colour: '#5aa96b',
        iso: ['MX', 'BR', 'AR', 'CL', 'CO', 'VE', 'PE', 'BO', 'EC', 'PY', 'UY', 'GT', 'HN', 'SV', 'NI', 'CR', 'PA', 'CU', 'DO', 'HT'],
        blurb: 'Independent for over a century, and firmly inside the American sphere. Cuba would break out of it in 1959.' },
    ],
  },

  // ── 1991 ────────────────────────────────────────────────────────────────
  {
    id: 'nineteen-ninety-one',
    year: 1991,
    title: 'The Year the Map Broke',
    subtitle: 'Fifteen countries where one had been',
    note: 'Between 1989 and 1992 the Soviet Union, Yugoslavia and Czechoslovakia all dissolved. More new countries appeared in three years than in the previous thirty. If you have an atlas printed in 1988, this is why it is useless.',
    polities: [
      { id: 'exussr', name: 'Successors of the USSR', colour: '#c94f4f',
        iso: ['RU', 'UA', 'BY', 'LT', 'LV', 'EE', 'MD', 'GE', 'AM', 'AZ', 'KZ', 'UZ', 'TM', 'TJ', 'KG'],
        blurb: 'Fifteen republics walked out of one state in a single year. Kazakhstan was the last to declare, on 16 December 1991.' },
      { id: 'exyugo', name: 'Successors of Yugoslavia', colour: '#e08b3c',
        iso: ['RS', 'HR', 'SI', 'BA', 'ME', 'MK', 'XK'],
        blurb: 'Slovenia and Croatia left in June 1991. What followed was the bloodiest fighting in Europe since 1945.' },
      { id: 'excz', name: 'Successors of Czechoslovakia', colour: '#8f6bb5',
        iso: ['CZ', 'SK'],
        blurb: 'The Velvet Divorce of 1993: a country split in two by negotiation, with no shots fired.' },
      { id: 'reunified', name: 'Reunified Germany', colour: '#6b8fd4',
        iso: ['DE'],
        blurb: 'The wall opened in November 1989 largely because a spokesman misread his notes at a press conference. Reunification followed within a year.' },
      { id: 'newelse', name: 'Other new states of the era', colour: '#4f9d8c',
        iso: ['NA', 'ER', 'YE', 'TL', 'SS', 'PW', 'MH', 'FM'],
        blurb: 'Namibia in 1990, a reunited Yemen the same year, Eritrea in 1993, East Timor in 2002, South Sudan in 2011.',
        caveat: 'Spans 1990 to 2011, not 1991 alone.' },
    ],
  },

  // ── today ───────────────────────────────────────────────────────────────
  {
    id: 'today',
    year: 2026,
    title: 'Today',
    subtitle: '194 states, coloured by region',
    note: 'The United Nations has 193 members; this atlas adds Vatican City, which is not one. Every border here was argued over, and a good number still are.',
    byRegion: true,
    polities: [],
  },
];

export const ERA_BY_ID = Object.fromEntries(ERAS.map(e => [e.id, e]));

/* Two ISO codes appear in the era data that are not UN member states, because
   leaving them out would misrepresent the period. They render if geometry
   exists and are skipped silently otherwise. */
export const NON_MEMBER_NOTE = {
  XK: 'Kosovo, partially recognised',
  YU: 'Yugoslavia, dissolved',
  TW: 'Taiwan, disputed status',
};
