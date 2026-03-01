// ============================================================
//  WORD OF THE DAY — 50+ entries
// ============================================================

const WOTD_BANK = [
  { word: 'magnificent', def: 'wonderful and very beautiful', sentence: 'The sunset was magnificent.', partOfSpeech: 'adjective' },
  { word: 'curious', def: 'wanting to know more about something', sentence: 'The curious cat peeked inside the box.', partOfSpeech: 'adjective' },
  { word: 'enormous', def: 'very very big', sentence: 'The elephant was enormous!', partOfSpeech: 'adjective' },
  { word: 'peculiar', def: 'strange and unusual', sentence: 'There was a peculiar sound coming from the attic.', partOfSpeech: 'adjective' },
  { word: 'brave', def: 'not afraid, showing courage', sentence: 'The brave knight faced the dragon.', partOfSpeech: 'adjective' },
  { word: 'delicious', def: 'tastes very good', sentence: 'The homemade cookies were delicious.', partOfSpeech: 'adjective' },
  { word: 'gentle', def: 'soft, kind, and careful', sentence: 'She was gentle with the baby bird.', partOfSpeech: 'adjective' },
  { word: 'ancient', def: 'very very old', sentence: 'The ancient castle stood on the hill.', partOfSpeech: 'adjective' },
  { word: 'ferocious', def: 'fierce and scary', sentence: 'The lion gave a ferocious roar.', partOfSpeech: 'adjective' },
  { word: 'luminous', def: 'glowing with light', sentence: 'The luminous stars lit up the night sky.', partOfSpeech: 'adjective' },
  { word: 'resilient', def: 'able to bounce back from hard times', sentence: 'The resilient plant grew back after the storm.', partOfSpeech: 'adjective' },
  { word: 'meticulous', def: 'very careful and precise', sentence: 'She was meticulous in her drawing.', partOfSpeech: 'adjective' },
  { word: 'vibrant', def: 'full of life and colour', sentence: 'The garden was full of vibrant flowers.', partOfSpeech: 'adjective' },
  { word: 'tranquil', def: 'calm and peaceful', sentence: 'The lake was tranquil in the morning.', partOfSpeech: 'adjective' },
  { word: 'spectacular', def: 'amazing to look at', sentence: 'The fireworks display was spectacular.', partOfSpeech: 'adjective' },
  { word: 'ingenious', def: 'very clever and creative', sentence: 'She came up with an ingenious solution.', partOfSpeech: 'adjective' },
  { word: 'persevere', def: 'to keep trying even when it is hard', sentence: 'She persevered until she solved the puzzle.', partOfSpeech: 'verb' },
  { word: 'discover', def: 'to find something for the first time', sentence: 'They discovered a hidden cave behind the waterfall.', partOfSpeech: 'verb' },
  { word: 'observe', def: 'to watch carefully', sentence: 'The scientist observed the butterflies.', partOfSpeech: 'verb' },
  { word: 'imagine', def: 'to create pictures in your mind', sentence: 'Imagine you could fly like a bird!', partOfSpeech: 'verb' },
  { word: 'collaborate', def: 'to work together with others', sentence: 'The students collaborated on a group project.', partOfSpeech: 'verb' },
  { word: 'investigate', def: 'to look into something carefully', sentence: 'The detective investigated the mystery.', partOfSpeech: 'verb' },
  { word: 'appreciate', def: 'to understand the value of something', sentence: 'I appreciate your help with my homework.', partOfSpeech: 'verb' },
  { word: 'transform', def: 'to change into something different', sentence: 'The caterpillar transforms into a butterfly.', partOfSpeech: 'verb' },
  { word: 'adventure', def: 'an exciting experience', sentence: 'They went on an adventure through the jungle.', partOfSpeech: 'noun' },
  { word: 'constellation', def: 'a group of stars forming a pattern', sentence: 'She pointed out the constellation in the night sky.', partOfSpeech: 'noun' },
  { word: 'ecosystem', def: 'a community of living things and their environment', sentence: 'The coral reef is a beautiful ecosystem.', partOfSpeech: 'noun' },
  { word: 'symmetry', def: 'when both sides look the same', sentence: 'A butterfly has perfect symmetry.', partOfSpeech: 'noun' },
  { word: 'metamorphosis', def: 'a big change in body form', sentence: 'A frog goes through metamorphosis.', partOfSpeech: 'noun' },
  { word: 'hypothesis', def: 'a smart guess you can test', sentence: 'Her hypothesis was that plants grow faster in sunlight.', partOfSpeech: 'noun' },
  { word: 'kaleidoscope', def: 'a tube with mirrors that makes colourful patterns', sentence: 'Looking through a kaleidoscope is magical.', partOfSpeech: 'noun' },
  { word: 'archipelago', def: 'a group of islands', sentence: 'Singapore is part of an archipelago.', partOfSpeech: 'noun' },
  { word: 'labyrinth', def: 'a complicated maze', sentence: 'The garden had a labyrinth made of hedges.', partOfSpeech: 'noun' },
  { word: 'harmony', def: 'things working well together', sentence: 'The choir sang in perfect harmony.', partOfSpeech: 'noun' },
  { word: 'silhouette', def: 'a dark outline against a lighter background', sentence: 'We saw the silhouette of the mountain at sunset.', partOfSpeech: 'noun' },
  { word: 'whimsical', def: 'playful and imaginative', sentence: 'The whimsical painting had flying elephants.', partOfSpeech: 'adjective' },
  { word: 'diligent', def: 'hardworking and careful', sentence: 'The diligent student finished all her work.', partOfSpeech: 'adjective' },
  { word: 'compassionate', def: 'feeling kindness toward others', sentence: 'The compassionate girl helped the lost kitten.', partOfSpeech: 'adjective' },
  { word: 'flourish', def: 'to grow and do well', sentence: 'The flowers flourished in the spring sunshine.', partOfSpeech: 'verb' },
  { word: 'illuminate', def: 'to light up or make clear', sentence: 'The lanterns illuminate the path at night.', partOfSpeech: 'verb' },
  { word: 'phenomenon', def: 'something amazing that happens', sentence: 'A rainbow is a beautiful phenomenon.', partOfSpeech: 'noun' },
  { word: 'extraordinary', def: 'very special and unusual', sentence: 'She has an extraordinary talent for music.', partOfSpeech: 'adjective' },
  { word: 'brilliant', def: 'very bright or very clever', sentence: 'The scientist had a brilliant idea.', partOfSpeech: 'adjective' },
  { word: 'fragile', def: 'easy to break or damage', sentence: 'Be careful with the fragile glass vase.', partOfSpeech: 'adjective' },
  { word: 'abundant', def: 'more than enough', sentence: 'The orchard had abundant fruit this year.', partOfSpeech: 'adjective' },
  { word: 'nocturnal', def: 'active at night', sentence: 'Owls are nocturnal animals.', partOfSpeech: 'adjective' },
  { word: 'migrate', def: 'to move from one place to another', sentence: 'Birds migrate south for the winter.', partOfSpeech: 'verb' },
  { word: 'camouflage', def: 'hiding by blending in', sentence: 'The chameleon uses camouflage to hide.', partOfSpeech: 'noun' },
  { word: 'expedition', def: 'a journey for a special purpose', sentence: 'The team went on an expedition to the Arctic.', partOfSpeech: 'noun' },
  { word: 'masterpiece', def: 'a work of art that is the best of its kind', sentence: 'Her painting was a true masterpiece.', partOfSpeech: 'noun' },
  { word: 'enchanted', def: 'under a magical spell', sentence: 'They walked through the enchanted forest.', partOfSpeech: 'adjective' },
  { word: 'miniature', def: 'very small version of something', sentence: 'She built a miniature house for her dolls.', partOfSpeech: 'adjective' }
];

function getWordOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return WOTD_BANK[dayOfYear % WOTD_BANK.length];
}
