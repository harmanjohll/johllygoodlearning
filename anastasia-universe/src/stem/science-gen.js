// ============================================================
//  SCIENCE GENERATORS — Question generators for 5 science skills
// ============================================================

function generateScienceQuestion(skillId) {
  var diff = getSkillDifficulty(skillId);
  switch (skillId) {
    case 'living':   return genLiving(diff);
    case 'material': return genMaterial(diff);
    case 'forces':   return genForces(diff);
    case 'earth':    return genEarth(diff);
    case 'body':     return genBody(diff);
    default:         return null;
  }
}

// ===================== SCIENCE DATA =====================

var SCIENCE_LIVING = [
  { q:'Which of these is a living thing?', options:['Tree','Rock','Water','Cloud'], answer:'Tree', hint:'Living things grow, eat, and reproduce.' },
  { q:'What do plants need to grow?', options:['Sunlight, water, and soil','Only water','Only sunlight','Rocks and sand'], answer:'Sunlight, water, and soil', hint:'Plants need three main things to grow.' },
  { q:'Which animal lives in water?', options:['Fish','Cat','Eagle','Rabbit'], answer:'Fish', hint:'Think about which animal has gills and fins.' },
  { q:'What is a habitat?', options:['A place where animals and plants live','A type of food','A kind of weather','A type of rock'], answer:'A place where animals and plants live', hint:'Habitats provide food, water, and shelter.' },
  { q:'Which part of a plant takes in water?', options:['Roots','Leaves','Flower','Stem'], answer:'Roots', hint:'This part grows underground.' },
  { q:'What do animals need to survive?', options:['Food, water, and shelter','Only food','Only water','Only shelter'], answer:'Food, water, and shelter', hint:'Animals have three basic needs.' },
  { q:'Which is NOT a living thing?', options:['A stone','A tree','A dog','A flower'], answer:'A stone', hint:'Living things grow and need food.' },
  { q:'What is the life cycle order for a butterfly?', options:['Egg, caterpillar, pupa, butterfly','Egg, butterfly, caterpillar, pupa','Butterfly, egg, pupa, caterpillar','Caterpillar, egg, butterfly, pupa'], answer:'Egg, caterpillar, pupa, butterfly', hint:'It starts as an egg and ends with wings!' },
  { q:'Which animal is a mammal?', options:['Dog','Frog','Fish','Lizard'], answer:'Dog', hint:'Mammals have fur and feed their babies milk.' },
  { q:'Where does a desert animal get water?', options:['From the food it eats','From the ocean','From snow','From lakes'], answer:'From the food it eats', hint:'Deserts have very little water, so animals adapt!' }
];

var SCIENCE_MATERIAL = [
  { q:'Which is a solid?', options:['Ice cube','Juice','Steam','Air'], answer:'Ice cube', hint:'Solids have a fixed shape.' },
  { q:'Which is a liquid?', options:['Water','Rock','Paper','Air'], answer:'Water', hint:'Liquids flow and take the shape of their container.' },
  { q:'What happens when you heat ice?', options:['It melts into water','It gets harder','It stays the same','It disappears'], answer:'It melts into water', hint:'Heat makes ice change state.' },
  { q:'Which material is waterproof?', options:['Plastic','Paper','Cloth','Cardboard'], answer:'Plastic', hint:'Waterproof means water cannot pass through it.' },
  { q:'Which material is magnetic?', options:['Iron nail','Wooden stick','Rubber band','Glass marble'], answer:'Iron nail', hint:'Only metals made of iron, nickel, or cobalt are magnetic.' },
  { q:'What state of matter is steam?', options:['Gas','Liquid','Solid','Plasma'], answer:'Gas', hint:'When water boils, it turns into a gas called steam.' },
  { q:'Which material is transparent?', options:['Glass','Wood','Metal','Stone'], answer:'Glass', hint:'Transparent means you can see through it.' },
  { q:'What happens when water is cooled to 0\u00B0C?', options:['It freezes into ice','It boils','It evaporates','Nothing happens'], answer:'It freezes into ice', hint:'0\u00B0C is the freezing point of water.' },
  { q:'Which material is flexible?', options:['Rubber','Glass','Brick','Stone'], answer:'Rubber', hint:'Flexible means it can bend without breaking.' },
  { q:'How can you separate sand from water?', options:['By filtering','By freezing','By heating','By shaking'], answer:'By filtering', hint:'A filter lets water pass through but traps the sand.' }
];

var SCIENCE_FORCES = [
  { q:'What force pulls things down to the ground?', options:['Gravity','Magnetism','Friction','Wind'], answer:'Gravity', hint:'This invisible force keeps us on Earth.' },
  { q:'What happens when you push a toy car?', options:['It moves forward','It flies up','It shrinks','It changes colour'], answer:'It moves forward', hint:'Pushing is a force that makes things move.' },
  { q:'What does a magnet attract?', options:['Iron','Wood','Plastic','Paper'], answer:'Iron', hint:'Magnets attract certain metals.' },
  { q:'What is friction?', options:['A force that slows things down','A force that speeds things up','A type of energy','A kind of material'], answer:'A force that slows things down', hint:'Friction happens when two surfaces rub together.' },
  { q:'Which uses electrical energy?', options:['A light bulb','A bicycle','A kite','A book'], answer:'A light bulb', hint:'It needs electricity to work.' },
  { q:'What energy comes from the sun?', options:['Light and heat','Sound','Magnetism','Gravity'], answer:'Light and heat', hint:'The sun is our biggest source of energy.' },
  { q:'Which surface has the most friction?', options:['Rough sandpaper','Smooth ice','Polished marble','Wet glass'], answer:'Rough sandpaper', hint:'Rougher surfaces create more friction.' },
  { q:'What type of energy does a drum make?', options:['Sound energy','Light energy','Heat energy','Magnetic energy'], answer:'Sound energy', hint:'When you hit a drum, it vibrates and makes noise.' },
  { q:'Which is a pulling force?', options:['A dog pulling a leash','Kicking a ball','Blowing a whistle','Clapping hands'], answer:'A dog pulling a leash', hint:'Pulling means moving something towards you.' },
  { q:'What do batteries store?', options:['Electrical energy','Light energy','Sound energy','Water'], answer:'Electrical energy', hint:'Batteries power things like torches and toys.' }
];

var SCIENCE_EARTH = [
  { q:'What is the water cycle?', options:['Water moving between land, sea, and air','Water flowing in rivers','Rain falling from clouds','Ice melting in the sun'], answer:'Water moving between land, sea, and air', hint:'Water constantly moves in a cycle: evaporation, condensation, precipitation.' },
  { q:'What causes rain?', options:['Clouds release water droplets','The sun gets too hot','Wind pushes water up','The moon pulls water'], answer:'Clouds release water droplets', hint:'When clouds get heavy with water, it falls as rain.' },
  { q:'Which is a natural resource?', options:['Water','Plastic','Paper','Glass'], answer:'Water', hint:'Natural resources come from nature, not from factories.' },
  { q:'What is the closest star to Earth?', options:['The Sun','The Moon','Mars','A satellite'], answer:'The Sun', hint:'This star gives us light and warmth every day.' },
  { q:'What causes day and night?', options:['Earth spinning on its axis','The Moon moving','The Sun moving around Earth','Clouds blocking the Sun'], answer:'Earth spinning on its axis', hint:'Earth rotates once every 24 hours.' },
  { q:'Which weather instrument measures temperature?', options:['Thermometer','Rain gauge','Wind vane','Barometer'], answer:'Thermometer', hint:'This instrument has a temperature scale.' },
  { q:'What type of rock is formed from a volcano?', options:['Igneous rock','Sedimentary rock','Metamorphic rock','Crystal rock'], answer:'Igneous rock', hint:'Lava cools down and hardens into this type of rock.' },
  { q:'How can we reduce waste?', options:['Reduce, reuse, recycle','Throw everything away','Burn everything','Bury everything'], answer:'Reduce, reuse, recycle', hint:'The three Rs help protect our environment.' },
  { q:'What is the largest ocean on Earth?', options:['Pacific Ocean','Atlantic Ocean','Indian Ocean','Arctic Ocean'], answer:'Pacific Ocean', hint:'This ocean lies between Asia and the Americas.' },
  { q:'What season comes after winter?', options:['Spring','Summer','Autumn','Winter again'], answer:'Spring', hint:'Flowers start blooming in this season.' }
];

var SCIENCE_BODY = [
  { q:'What organ pumps blood around your body?', options:['Heart','Brain','Lungs','Stomach'], answer:'Heart', hint:'This organ beats about 100,000 times a day!' },
  { q:'What protects your brain?', options:['Skull','Ribs','Skin','Muscles'], answer:'Skull', hint:'This bone surrounds your brain like a helmet.' },
  { q:'What do lungs help us do?', options:['Breathe','Digest food','Move our legs','See things'], answer:'Breathe', hint:'Lungs take in oxygen from the air.' },
  { q:'Which food group helps build strong bones?', options:['Dairy (milk, cheese)','Candy','Chips','Soda'], answer:'Dairy (milk, cheese)', hint:'Calcium makes bones strong, and this food has lots of it.' },
  { q:'How many senses do humans have?', options:['5','3','7','10'], answer:'5', hint:'Sight, hearing, smell, taste, and touch.' },
  { q:'What should you do to stay healthy?', options:['Exercise, eat well, and sleep enough','Only eat candy','Stay up all night','Never go outside'], answer:'Exercise, eat well, and sleep enough', hint:'A healthy lifestyle has three main parts.' },
  { q:'What does the stomach do?', options:['Breaks down food','Pumps blood','Helps you breathe','Helps you think'], answer:'Breaks down food', hint:'Food goes here after you swallow it.' },
  { q:'Which part of the body helps you move?', options:['Muscles','Hair','Nails','Earlobes'], answer:'Muscles', hint:'These work with your bones to help you move.' },
  { q:'Why is sleep important?', options:['It helps your body rest and grow','It wastes time','It makes you hungry','It has no purpose'], answer:'It helps your body rest and grow', hint:'Your body repairs itself while you sleep.' },
  { q:'What carries oxygen in your blood?', options:['Red blood cells','White blood cells','Platelets','Plasma'], answer:'Red blood cells', hint:'These cells are red because of a protein called haemoglobin.' }
];

var SCIENCE_BANKS = {
  living: SCIENCE_LIVING,
  material: SCIENCE_MATERIAL,
  forces: SCIENCE_FORCES,
  earth: SCIENCE_EARTH,
  body: SCIENCE_BODY
};

// ===================== GENERATORS =====================

function genLiving(diff)   { return genScienceMCQ('living', diff); }
function genMaterial(diff)  { return genScienceMCQ('material', diff); }
function genForces(diff)    { return genScienceMCQ('forces', diff); }
function genEarth(diff)     { return genScienceMCQ('earth', diff); }
function genBody(diff)      { return genScienceMCQ('body', diff); }

function genScienceMCQ(bank, diff) {
  var items = SCIENCE_BANKS[bank];
  var item = pick(items);
  return {
    type: 'science-mcq',
    text: item.q,
    options: shuffle(item.options),
    answer: item.answer,
    hint: item.hint
  };
}
