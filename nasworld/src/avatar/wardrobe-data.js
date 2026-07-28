// ============================================================
//  WARDROBE DATA — Items Anastasia can earn and equip on Stasha.
//  Categories: hair, outfit, pet, background, aura.
//  Unlock kinds: tokens, streak, level, skillsMastered, threadDone,
//                achievementsCount, worldsTouched.
// ============================================================

var WARDROBE_ITEMS = [
  // ===== HAIR (head accessories) =====
  { id: 'pink-bow',       cat: 'hair',    name: 'Pink Bow',         emoji: '🎀', cost: 30,  unlock: { type: 'tokens',           value: 30 },  desc: 'A classic. Goes with everything.' },
  { id: 'yellow-bow',     cat: 'hair',    name: 'Yellow Bow',       emoji: '🎀', cost: 30,  unlock: { type: 'tokens',           value: 30 },  desc: 'Sunshine on your head.', tint: '#ffd700' },
  { id: 'flower-clip',    cat: 'hair',    name: 'Flower Clip',      emoji: '🌸', cost: 60,  unlock: { type: 'streak',           value: 2 },   desc: 'Tiny garden in your hair.' },
  { id: 'butterfly-clip', cat: 'hair',    name: 'Butterfly Clip',   emoji: '🦋', cost: 100, unlock: { type: 'tokens',           value: 100 }, desc: 'Will it fly off? Probably not.' },
  { id: 'mini-crown',     cat: 'hair',    name: 'Mini Crown',       emoji: '👑', cost: 150, unlock: { type: 'streak',           value: 5 },   desc: 'For everyday royalty.' },
  { id: 'starlit-tiara',  cat: 'hair',    name: 'Starlit Tiara',    emoji: '✨', cost: 300, unlock: { type: 'streak',           value: 10 },  desc: 'Tiny stars woven in.' },
  { id: 'unicorn-horn',   cat: 'hair',    name: 'Unicorn Horn',     emoji: '🦄', cost: 400, unlock: { type: 'worldsTouched',    value: 4 },   desc: 'For when all four worlds have met you.' },
  { id: 'fairy-circlet',  cat: 'hair',    name: 'Fairy Circlet',    emoji: '🧚', cost: 500, unlock: { type: 'skillsMastered',   value: 5 },   desc: 'You have proven yourself.' },
  { id: 'galaxy-halo',    cat: 'hair',    name: 'Galaxy Halo',      emoji: '🌌', cost: 0,   unlock: { type: 'level',            value: 4 },   desc: 'Star level unlocks this.' },
  { id: 'princess-tiara', cat: 'hair',    name: 'Princess Tiara',   emoji: '👸', cost: 0,   unlock: { type: 'level',            value: 5 },   desc: 'Supernova level. Earned, not given.' },

  // ===== OUTFIT (body) =====
  { id: 'sparkle-vest',   cat: 'outfit',  name: 'Sparkle Vest',     emoji: '✨', cost: 50,  unlock: { type: 'tokens',           value: 50 },  desc: 'Twinkly. Comfortable.' },
  { id: 'garden-apron',   cat: 'outfit',  name: 'Garden Apron',     emoji: '🌱', cost: 0,   unlock: { type: 'threadDone',       value: 'garden' },     desc: 'Earned by growing a garden.' },
  { id: 'lemonade-apron', cat: 'outfit',  name: 'Lemonade Apron',   emoji: '🍋', cost: 0,   unlock: { type: 'threadDone',       value: 'lemonade' },   desc: 'You ran a shop. Proper boss.' },
  { id: 'baju-kurung',    cat: 'outfit',  name: 'Baju Kurung',      emoji: '👘', cost: 0,   unlock: { type: 'threadDone',       value: 'hawker' },     desc: 'For when you order in Malay.' },
  { id: 'lab-coat',       cat: 'outfit',  name: 'Lab Coat',         emoji: '🥼', cost: 0,   unlock: { type: 'skillsMasteredInWorld', value: { world: 'stem', n: 3 } }, desc: 'Three STEM skills mastered.' },
  { id: 'robot-suit',     cat: 'outfit',  name: 'Robot Suit',       emoji: '🤖', cost: 0,   unlock: { type: 'threadDone',       value: 'robot' },      desc: 'Beep boop. You built one.' },
  { id: 'princess-cape',  cat: 'outfit',  name: 'Princess Cape',    emoji: '🦋', cost: 400, unlock: { type: 'tokens',           value: 400 }, desc: 'Swooshes when you walk.' },
  { id: 'bookworm-cardi', cat: 'outfit',  name: 'Bookworm Cardigan',emoji: '📚', cost: 0,   unlock: { type: 'skillsMasteredInWorld', value: { world: 'word', n: 5 } }, desc: 'Five English skills mastered.' },
  { id: 'butterfly-wings',cat: 'outfit',  name: 'Butterfly Wings',  emoji: '🦋', cost: 200, unlock: { type: 'achievementsCount',value: 5 },   desc: 'Five achievements + 200 stars.' },
  { id: 'chef-apron',     cat: 'outfit',  name: 'Chef Apron',       emoji: '👩‍🍳', cost: 250, unlock: { type: 'tokens',           value: 250 }, desc: 'Hawker centre ready.' },

  // ===== PETS (companion) =====
  { id: 'tabby-cat',      cat: 'pet',     name: 'Tabby Cat',        emoji: '🐱', cost: 80,  unlock: { type: 'tokens',           value: 80 },  desc: 'Purrs when you get answers right.' },
  { id: 'bunny',          cat: 'pet',     name: 'Bunny',            emoji: '🐰', cost: 120, unlock: { type: 'tokens',           value: 120 }, desc: 'Hops in a happy pattern.' },
  { id: 'butterfly-pet',  cat: 'pet',     name: 'Butterfly',        emoji: '🦋', cost: 0,   unlock: { type: 'skillMastered',    value: 'animals' },    desc: 'Animal life cycles mastered.' },
  { id: 'mousedeer',      cat: 'pet',     name: 'Mousedeer',        emoji: '🦌', cost: 0,   unlock: { type: 'threadDone',       value: 'stories' },    desc: 'Sang Kancil sends regards.' },
  { id: 'mini-dragon',    cat: 'pet',     name: 'Mini Dragon',      emoji: '🐲', cost: 600, unlock: { type: 'tokens',           value: 600 }, desc: 'Tiny but proud.' },
  { id: 'baby-fox',       cat: 'pet',     name: 'Baby Fox',         emoji: '🦊', cost: 200, unlock: { type: 'tokens',           value: 200 }, desc: 'Clever like you.' },
  { id: 'unicorn-pet',    cat: 'pet',     name: 'Unicorn',          emoji: '🦄', cost: 0,   unlock: { type: 'level',            value: 4 },   desc: 'Star level unlocks this loyal friend.' },
  { id: 'robo-pup',       cat: 'pet',     name: 'Robo-Pup',         emoji: '🤖', cost: 0,   unlock: { type: 'skillMastered',    value: 'cseq' },       desc: 'Loyal because you programmed it.' },

  // ===== BACKGROUNDS (scene) =====
  { id: 'bedroom',        cat: 'background', name: 'Cosy Bedroom',  emoji: '🛏️', cost: 0,   unlock: { type: 'free',             value: true }, desc: 'The default — your starting room.' },
  { id: 'garden-bg',      cat: 'background', name: 'Flower Garden', emoji: '🌷', cost: 50,  unlock: { type: 'tokens',           value: 50 },  desc: 'A meadow of pink and gold.' },
  { id: 'castle-bg',      cat: 'background', name: 'Princess Castle',emoji: '🏰', cost: 200, unlock: { type: 'tokens',           value: 200 }, desc: 'You at home in a tower.' },
  { id: 'space-bg',       cat: 'background', name: 'Starfield',     emoji: '🌌', cost: 350, unlock: { type: 'tokens',           value: 350 }, desc: 'Floating among the stars.' },
  { id: 'hawker-bg',      cat: 'background', name: 'Hawker Centre', emoji: '🍜', cost: 0,   unlock: { type: 'threadDone',       value: 'hawker' },     desc: 'Smells of nasi lemak.' },
  { id: 'library-bg',     cat: 'background', name: 'Library',       emoji: '📚', cost: 0,   unlock: { type: 'skillsMasteredInWorld', value: { world: 'word', n: 5 } }, desc: 'Where all the words live.' },
  { id: 'beach-bg',       cat: 'background', name: 'Sandy Beach',   emoji: '🏖️', cost: 500, unlock: { type: 'tokens',           value: 500 }, desc: 'Palm trees and salty air.' },
  { id: 'meadow-bg',      cat: 'background', name: 'Starlit Meadow',emoji: '✨', cost: 0,   unlock: { type: 'level',            value: 3 },   desc: 'Bloom level glows here.' },

  // ===== AURAS (effects around her) =====
  { id: 'soft-sparkle',   cat: 'aura',    name: 'Soft Sparkle',     emoji: '✨', cost: 0,   unlock: { type: 'free',             value: true }, desc: 'Gentle glow. Always nice.' },
  { id: 'pink-hearts',    cat: 'aura',    name: 'Pink Hearts',      emoji: '💖', cost: 0,   unlock: { type: 'streak',           value: 5 },   desc: 'Floating little hearts.' },
  { id: 'rainbow-aura',   cat: 'aura',    name: 'Rainbow Aura',     emoji: '🌈', cost: 0,   unlock: { type: 'streak',           value: 10 },  desc: 'A friendly band of colour.' },
  { id: 'gold-stars',     cat: 'aura',    name: 'Gold Stars',       emoji: '⭐', cost: 0,   unlock: { type: 'level',            value: 4 },   desc: 'Star level. Wear it loudly.' },
  { id: 'supernova-aura', cat: 'aura',    name: 'Supernova Burst',  emoji: '💫', cost: 0,   unlock: { type: 'level',            value: 5 },   desc: 'Pure radiance.' },
  { id: 'galaxy-aura',    cat: 'aura',    name: 'Galaxy Spiral',    emoji: '🌌', cost: 0,   unlock: { type: 'level',            value: 6 },   desc: 'You are made of stars.' }
];

var WARDROBE_CATEGORIES = [
  { id: 'hair',       label: 'Hair',        emoji: '💁' },
  { id: 'outfit',     label: 'Outfit',      emoji: '👗' },
  { id: 'pet',        label: 'Pet',         emoji: '🐾' },
  { id: 'background', label: 'Background',  emoji: '🖼️' },
  { id: 'aura',       label: 'Aura',        emoji: '✨' }
];
