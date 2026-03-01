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

// ===================== EXPERIMENT QUESTIONS =====================

var SCIENCE_EXPERIMENTS = [
  { skill:'material', scenario:'You put an ice cube on a plate in the sun.', q:'What will happen after 30 minutes?', options:['The ice will melt into water','The ice will get bigger','The ice will turn into gas','Nothing will happen'], answer:'The ice will melt into water', hint:'Heat from the sun changes the state of ice.' },
  { skill:'material', scenario:'You mix sand into a glass of water and stir.', q:'What happens when you stop stirring?', options:['The sand sinks to the bottom','The sand disappears','The water turns into sand','The sand floats'], answer:'The sand sinks to the bottom', hint:'Sand is heavier than water and does not dissolve.' },
  { skill:'forces', scenario:'You slide a toy car on a rough carpet and then on a smooth tile floor.', q:'Where does the car travel farther?', options:['On the smooth tile floor','On the rough carpet','The same on both','Neither \u2014 the car stops immediately'], answer:'On the smooth tile floor', hint:'More friction on carpet slows the car down.' },
  { skill:'forces', scenario:'You hold a ball in the air and let go.', q:'What will happen?', options:['The ball falls to the ground','The ball floats in the air','The ball flies upward','The ball stays still'], answer:'The ball falls to the ground', hint:'Gravity pulls everything toward the ground.' },
  { skill:'living', scenario:'You water one plant but not the other. Both get the same sunlight.', q:'After 2 weeks, what happens?', options:['The watered plant grows; the dry plant wilts','Both plants grow the same','The dry plant grows better','Both plants die'], answer:'The watered plant grows; the dry plant wilts', hint:'Plants need water to survive and grow.' },
  { skill:'living', scenario:'You put a caterpillar in a jar with leaves and air holes.', q:'What might happen after a few weeks?', options:['It forms a chrysalis and becomes a butterfly','It stays a caterpillar forever','It turns into a fish','It disappears'], answer:'It forms a chrysalis and becomes a butterfly', hint:'This is part of the butterfly life cycle!' },
  { skill:'earth', scenario:'You leave a shallow dish of water on a sunny windowsill.', q:'What happens to the water after a few days?', options:['The water evaporates','The water freezes','The water turns green','Nothing happens'], answer:'The water evaporates', hint:'Heat causes water to turn into water vapour.' },
  { skill:'earth', scenario:'You breathe on a cold mirror.', q:'Why does the mirror fog up?', options:['Water vapour in your breath condenses on the cold surface','The mirror is sweating','Magic','The air is dirty'], answer:'Water vapour in your breath condenses on the cold surface', hint:'Cold surfaces cause water vapour to become liquid droplets.' },
  { skill:'body', scenario:'You run around the playground for 5 minutes.', q:'What happens to your heart rate?', options:['It beats faster','It beats slower','It stops','Nothing changes'], answer:'It beats faster', hint:'Exercise makes your heart pump more blood to your muscles.' },
  { skill:'body', scenario:'You eat a big lunch.', q:'What happens in your stomach?', options:['Acids and muscles break down the food','The food stays whole','The food turns into bones','The food goes to your lungs'], answer:'Acids and muscles break down the food', hint:'Your stomach is like a mixer that breaks food into tiny pieces.' }
];

// ===================== SORT QUESTIONS =====================

var SCIENCE_SORTS = [
  { skill:'material', text:'Sort these into Solids and Liquids', categories:['Solid','Liquid'], items:[
    {name:'Ice cube',category:'Solid'},{name:'Water',category:'Liquid'},{name:'Rock',category:'Solid'},{name:'Juice',category:'Liquid'},{name:'Brick',category:'Solid'},{name:'Milk',category:'Liquid'}
  ], hint:'Solids keep their shape. Liquids flow.' },
  { skill:'living', text:'Sort these into Living and Non-Living', categories:['Living','Non-Living'], items:[
    {name:'Dog',category:'Living'},{name:'Rock',category:'Non-Living'},{name:'Tree',category:'Living'},{name:'Chair',category:'Non-Living'},{name:'Fish',category:'Living'},{name:'Book',category:'Non-Living'}
  ], hint:'Living things grow, breathe, and need food.' },
  { skill:'material', text:'Sort these into Magnetic and Not Magnetic', categories:['Magnetic','NotMagnetic'], items:[
    {name:'Iron nail',category:'Magnetic'},{name:'Wooden stick',category:'NotMagnetic'},{name:'Steel paper clip',category:'Magnetic'},{name:'Plastic ruler',category:'NotMagnetic'},{name:'Coin',category:'Magnetic'},{name:'Rubber band',category:'NotMagnetic'}
  ], hint:'Only iron, steel, nickel, and cobalt are magnetic.' },
  { skill:'living', text:'Sort these animals by where they live', categories:['Land','Water'], items:[
    {name:'Dog',category:'Land'},{name:'Fish',category:'Water'},{name:'Cat',category:'Land'},{name:'Whale',category:'Water'},{name:'Horse',category:'Land'},{name:'Dolphin',category:'Water'}
  ], hint:'Think about whether the animal has legs or fins.' }
];

// ===================== SIMULATION QUESTIONS =====================

var SCIENCE_SIM_QUESTIONS = {
  earth: [
    { type:'sim-water-cycle', text:'After seeing the water cycle, what comes after evaporation?', options:['Condensation','Precipitation','Collection','Evaporation again'], answer:'Condensation', hint:'Water vapour rises and cools into clouds.' },
    { type:'sim-water-cycle', text:'What powers the water cycle?', options:['The Sun','The Moon','Wind','Gravity only'], answer:'The Sun', hint:'The Sun heats water and drives evaporation.' }
  ],
  body: [
    { type:'sim-body-explorer', text:'Which organ pumps blood?', options:['Heart','Brain','Lungs','Stomach'], answer:'Heart', hint:'Explore the organs to find out!' },
    { type:'sim-body-explorer', text:'What do the lungs do?', options:['Help you breathe','Pump blood','Digest food','Control thinking'], answer:'Help you breathe', hint:'Tap the lungs to learn their function.' }
  ],
  forces: [
    { type:'sim-magnet', text:'What happens when two North poles face each other?', options:['They repel','They attract','Nothing happens','They stick together'], answer:'They repel', hint:'Try flipping the magnets to see!' },
    { type:'sim-magnet', text:'Which poles attract each other?', options:['North and South','North and North','South and South','East and West'], answer:'North and South', hint:'Opposites attract!' },
    { type:'sim-circuit', text:'What must happen for the bulb to light up?', options:['The switch must be closed','The switch must be open','Remove the battery','Add more wire'], answer:'The switch must be closed', hint:'A complete circuit is needed for electricity to flow.' }
  ],
  living: [
    { type:'sim-plant-growth', text:'What do plants need to grow?', options:['Sunlight, water, and soil','Only water','Only sunlight','Rocks and sand'], answer:'Sunlight, water, and soil', hint:'Toggle the sun and water to see what happens!' },
    { type:'sim-plant-growth', text:'What happens if a plant has no sunlight?', options:['It cannot make food and will wilt','It grows faster','It turns blue','Nothing happens'], answer:'It cannot make food and will wilt', hint:'Plants use sunlight to make food through photosynthesis.' }
  ]
};

// ===================== EXTRA MCQ QUESTIONS =====================

var SCIENCE_LIVING_EXTRA = [
  { q:'What is photosynthesis?', options:['How plants make food using sunlight','How animals breathe','How rocks form','How water flows'], answer:'How plants make food using sunlight', hint:'Plants use sunlight, water, and carbon dioxide to make food.' },
  { q:'Which animal lays eggs?', options:['Chicken','Dog','Cat','Cow'], answer:'Chicken', hint:'Birds and reptiles lay eggs.' },
  { q:'What do herbivores eat?', options:['Only plants','Only meat','Both plants and meat','Only fish'], answer:'Only plants', hint:'Herbivores have flat teeth for grinding plants.' },
  { q:'Which is an insect?', options:['Ant','Spider','Worm','Snail'], answer:'Ant', hint:'Insects have 6 legs and 3 body parts.' },
  { q:'What do seeds need to germinate?', options:['Water, warmth, and air','Only sunlight','Only soil','Only darkness'], answer:'Water, warmth, and air', hint:'Seeds need moisture and warmth to start growing.' }
];

var SCIENCE_MATERIAL_EXTRA = [
  { q:'What happens when you mix oil and water?', options:['They separate into layers','They mix completely','The oil disappears','The water evaporates'], answer:'They separate into layers', hint:'Oil is less dense than water and floats on top.' },
  { q:'Which change is reversible?', options:['Melting ice','Burning paper','Cooking an egg','Baking a cake'], answer:'Melting ice', hint:'Reversible changes can be undone. Can you re-freeze water?' },
  { q:'What is an insulator?', options:['A material that does not conduct heat well','A material that conducts electricity','A type of metal','A liquid'], answer:'A material that does not conduct heat well', hint:'Insulators keep heat in or out, like a woolly jumper.' },
  { q:'Which material is a good conductor of heat?', options:['Metal spoon','Wooden spoon','Plastic spoon','Rubber glove'], answer:'Metal spoon', hint:'Metals transfer heat quickly.' },
  { q:'What is dissolving?', options:['When a solid mixes into a liquid and seems to disappear','When a liquid freezes','When a gas turns to liquid','When a solid breaks into pieces'], answer:'When a solid mixes into a liquid and seems to disappear', hint:'Sugar dissolves in water but sand does not.' }
];

var SCIENCE_FORCES_EXTRA = [
  { q:'What is air resistance?', options:['A force that slows things moving through air','A force that speeds things up','A type of gravity','A push force'], answer:'A force that slows things moving through air', hint:'Parachutes use air resistance to slow down.' },
  { q:'Which simple machine helps lift heavy things?', options:['A lever','A magnet','A battery','A mirror'], answer:'A lever', hint:'A seesaw is an example of a lever.' },
  { q:'What type of energy does food give us?', options:['Chemical energy','Light energy','Sound energy','Magnetic energy'], answer:'Chemical energy', hint:'Our bodies convert food into energy we can use.' },
  { q:'Which travels fastest?', options:['Light','Sound','A car','A plane'], answer:'Light', hint:'Light travels at about 300,000 km per second!' },
  { q:'What makes a shadow?', options:['An object blocking light','The wind','Gravity','Magnetism'], answer:'An object blocking light', hint:'Shadows form on the opposite side from the light source.' }
];

var SCIENCE_EARTH_EXTRA = [
  { q:'What causes the seasons?', options:['Earth tilts on its axis as it orbits the Sun','The Sun gets hotter and cooler','The Moon changes','The wind changes direction'], answer:'Earth tilts on its axis as it orbits the Sun', hint:'The tilt means different parts of Earth get more or less sunlight.' },
  { q:'What is a fossil?', options:['The preserved remains of ancient life','A type of rock','A kind of crystal','A living organism'], answer:'The preserved remains of ancient life', hint:'Fossils can be bones, shells, or footprints from long ago.' },
  { q:'What is erosion?', options:['When wind or water wears away rock and soil','When volcanoes erupt','When earthquakes happen','When ice forms'], answer:'When wind or water wears away rock and soil', hint:'Rivers erode their banks over time.' },
  { q:'Which is a renewable energy source?', options:['Solar power','Coal','Oil','Natural gas'], answer:'Solar power', hint:'Renewable means it will not run out.' },
  { q:'What is the atmosphere?', options:['The layer of gases around Earth','The ocean floor','The centre of Earth','Space beyond Earth'], answer:'The layer of gases around Earth', hint:'The atmosphere protects us from the Sun\'s harmful rays.' }
];

var SCIENCE_BODY_EXTRA = [
  { q:'What is the largest organ in the body?', options:['Skin','Brain','Heart','Liver'], answer:'Skin', hint:'This organ covers your entire body!' },
  { q:'What does the brain do?', options:['Controls the whole body','Only helps you see','Only helps you breathe','Only helps you move'], answer:'Controls the whole body', hint:'The brain sends messages through nerves to every part of your body.' },
  { q:'How many bones does an adult have?', options:['206','100','500','50'], answer:'206', hint:'Babies have more bones that fuse together as they grow!' },
  { q:'What is the function of white blood cells?', options:['Fight germs and infections','Carry oxygen','Clot blood','Make bones'], answer:'Fight germs and infections', hint:'White blood cells are your body\'s soldiers.' },
  { q:'Why do we need to drink water?', options:['To keep our bodies hydrated and working properly','Only to wash food down','Water has no benefit','Only when we are hot'], answer:'To keep our bodies hydrated and working properly', hint:'Water helps transport nutrients and remove waste.' }
];

// Add extra questions to banks
SCIENCE_LIVING = SCIENCE_LIVING.concat(SCIENCE_LIVING_EXTRA);
SCIENCE_MATERIAL = SCIENCE_MATERIAL.concat(SCIENCE_MATERIAL_EXTRA);
SCIENCE_FORCES = SCIENCE_FORCES.concat(SCIENCE_FORCES_EXTRA);
SCIENCE_EARTH = SCIENCE_EARTH.concat(SCIENCE_EARTH_EXTRA);
SCIENCE_BODY = SCIENCE_BODY.concat(SCIENCE_BODY_EXTRA);

// ===================== GENERATORS =====================

function genLiving(diff)   { return genScienceQ('living', diff); }
function genMaterial(diff)  { return genScienceQ('material', diff); }
function genForces(diff)    { return genScienceQ('forces', diff); }
function genEarth(diff)     { return genScienceQ('earth', diff); }
function genBody(diff)      { return genScienceQ('body', diff); }

function genScienceQ(bank, diff) {
  var r = Math.random();

  // At higher levels, include simulations and experiments
  if (diff.level >= 2 && r < 0.25) {
    // Try simulation
    var sims = SCIENCE_SIM_QUESTIONS[bank];
    if (sims && sims.length > 0) {
      var sim = pick(sims);
      return {
        type: sim.type,
        text: sim.text,
        options: shuffle(sim.options),
        answer: sim.answer,
        hint: sim.hint
      };
    }
  }

  if (diff.level >= 1 && r < 0.35) {
    // Try experiment
    var exps = SCIENCE_EXPERIMENTS.filter(function(e) { return e.skill === bank; });
    if (exps.length > 0) {
      var exp = pick(exps);
      return {
        type: 'science-experiment',
        scenario: exp.scenario,
        text: exp.q,
        options: shuffle(exp.options),
        answer: exp.answer,
        hint: exp.hint
      };
    }
  }

  if (diff.level >= 1 && r < 0.45) {
    // Try sort
    var sorts = SCIENCE_SORTS.filter(function(s) { return s.skill === bank; });
    if (sorts.length > 0) {
      var sort = pick(sorts);
      return {
        type: 'science-sort',
        text: sort.text,
        categories: sort.categories,
        items: shuffle(sort.items),
        answer: '__sort__',
        hint: sort.hint
      };
    }
  }

  // Default: MCQ
  return genScienceMCQ(bank, diff);
}

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
