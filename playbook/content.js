/* =============================================================================
   The Playbook: content
   Every word Alexey reads lives here, so the rules can be changed in one place.
   House rule for copy: no hyphens or dashes in prose. Commas, colons, full stops.
   Family defaults live in the copy itself: games 30 minutes, Downtime 9.00pm,
   feed apps revisited not before 15. Search and change them here.
   ========================================================================== */

window.PLAYBOOK = {

  family: {
    player: 'Alexey',
  },

  sections: [
    { id: 'kickoff',  num: '01', title: 'Kick off',            line: 'Who is in charge of this phone.' },
    { id: 'pitch',    num: '02', title: 'Set up your pitch',   line: 'Home screen, folders, photos, notifications.' },
    { id: 'cards',    num: '03', title: 'The Cards',           line: 'Green, yellow, red. The rules of the game.' },
    { id: 'squad',    num: '04', title: 'Your Starting XI',    line: 'Eleven apps that earn their place.' },
    { id: 'fixtures', num: '05', title: 'The Fixture List',    line: 'Own your week before it owns you.' },
    { id: 'game',     num: '06', title: 'Read the Game',       line: 'Twelve situations. Make the call.' },
    { id: 'off',      num: '07', title: 'Off the Pitch',       line: 'Sleep, move, people, eyes.' },
    { id: 'post',     num: '08', title: 'Post Match',          line: 'Three minutes a night to review the footage.' },
    { id: 'pact',     num: '09', title: 'The Pact',            line: 'Show your parents. Sign it together.' },
  ],

  kickoff: {
    headline: 'This phone works for you.',
    sub: 'Not the other way round.',
    paras: [
      'Right now, thousands of very clever engineers are paid to keep you looking at a screen for as long as possible. Endless feeds, autoplay, streaks, red badges, "just one more". None of that is an accident. Their score goes up every minute you stay.',
      'This Playbook is how you stay the one in charge. It is not a list of punishments. It is how good players train: a clear setup, clear rules, the right squad, and the habit of reviewing every match.',
      'Work through it in order. Some steps you do alone. Some you do with Mum or Dad, and they tick them off with you. At the end, you sign the Pact together.',
    ],
    verse: {
      text: '"All things are lawful for me," but not all things are helpful. "All things are lawful for me," but I will not be enslaved by anything.',
      ref: '1 Corinthians 6:12 (RSV2CE)',
    },
  },

  /* ---------------------------------------------------------------------------
     Tasks: things Alexey does on the phone. who: 'you' or 'together'.
     Every task can be ticked by Alexey and then checked by a parent.
     Menu paths are written for recent iOS. If one moves, search Settings.
     ------------------------------------------------------------------------ */
  tasks: {
    /* Set up your pitch */
    'home-one': {
      title: 'Keep one home screen only',
      who: 'you',
      why: 'Every extra page is somewhere to wander. One page means you open what you came for.',
      steps: [
        'Touch and hold an empty part of the home screen until the apps wiggle.',
        'Tap the row of dots above the dock.',
        'Untick every page except one. Tap Done.',
        'Everything else still lives in the App Library: swipe left past your last page.',
      ],
    },
    'home-dock': {
      title: 'Pick your dock of four',
      who: 'you',
      why: 'The dock is prime space. Give it to the tools that help you, not the ones that pull you in.',
      steps: [
        'Suggested dock: Phone, Messages, Calendar, myCatholicSG.',
        'Drag apps in and out of the dock while the apps wiggle.',
        'No games and no YouTube in the dock.',
      ],
    },
    'home-folders': {
      title: 'Sort apps into folders by purpose',
      who: 'you',
      why: 'Folders by job (School, Getting Around) make you think "what am I here to do?" before you tap.',
      steps: [
        'Drag one app on top of another to make a folder.',
        'Touch and hold the folder, tap Rename.',
        'Use these six: Faith, School, Getting Around, Health, Tools, Messages.',
      ],
    },
    'home-games': {
      title: 'Take games off the home screen',
      who: 'you',
      why: 'If you have to go looking for a game, you choose to play. If it stares at you, it chooses for you.',
      steps: [
        'Touch and hold the game, tap Remove App, then Remove from Home Screen.',
        'It stays in the App Library under Games.',
        'Settings › Home Screen and App Library › Newly Downloaded Apps: App Library Only. New games never land on your home screen.',
      ],
    },
    'photos-folders': {
      title: 'Build photo folders, with albums inside',
      who: 'you',
      why: 'A camera roll of 4,000 random pictures is a junk drawer. Folders let you find the good ones in seconds.',
      steps: [
        'Open Photos and go to Albums.',
        'Tap the + button and choose New Folder. Name it, for example, Football.',
        'Open the folder, tap + again, and add albums inside it, for example Matches and Training.',
        'Repeat for School, Family, Faith and Friends.',
      ],
    },
    'photos-sunday': {
      title: 'Sunday clear out: screenshots and duplicates',
      who: 'you',
      why: 'Five minutes a week keeps the phone light, and you notice what you have been saving.',
      steps: [
        'Photos › Media Types › Screenshots. Delete what you no longer need.',
        'Photos › Utilities › Duplicates. Merge them.',
        'Put the keepers into the right album.',
        'Add a weekly Sunday reminder: "Photo clear out, 5 minutes".',
      ],
    },
    'notifs': {
      title: 'Notifications: people only',
      who: 'together',
      why: 'Every buzz is an app asking for your attention. Only real people, and your own reminders, get to interrupt you.',
      steps: [
        'Settings › Notifications.',
        'Leave on: Phone, Messages, Calendar, Reminders, Find My.',
        'Turn off: games, YouTube, shopping, and anything that sends "you might like".',
        'Badges off for anything that is not a person.',
      ],
    },
    'focus': {
      title: 'Set up three Focus modes',
      who: 'together',
      why: 'A Focus is a fence around your attention. You decide the times once, and the phone holds the line for you.',
      steps: [
        'Settings › Focus › + and create: School, Homework, Sleep.',
        'School: on during school hours. Only family can reach you.',
        'Homework: only family, and only School and Tools apps on the home screen.',
        'Sleep: on from 9.00pm. Matches your Downtime.',
      ],
    },
    'grayscale': {
      title: 'Grayscale on a triple click',
      who: 'you',
      why: 'Bright colours are bait. In grey, the phone becomes boring in a useful way. Use it when you notice yourself drifting.',
      steps: [
        'Settings › Accessibility › Display and Text Size › Colour Filters. Choose Greyscale, then switch Colour Filters off again.',
        'Settings › Accessibility › Accessibility Shortcut. Tick Colour Filters.',
        'Now triple click the side button to flip grey on and off.',
      ],
    },

    /* Starting XI: protection and setup */
    'family-sharing': {
      title: 'Join the family on Family Sharing',
      who: 'together',
      why: 'This is the foundation. It lets your parents set Screen Time with you, approve apps, and share locations.',
      steps: [
        'On a parent\'s iPhone: Settings › Family.',
        'Your account should appear as a child in the family.',
        'Family Sharing also creates a shared Family calendar. You will use it in The Fixture List.',
      ],
    },
    'screen-time': {
      title: 'Screen Time, with a parent passcode',
      who: 'together',
      why: 'Screen Time is the referee. The passcode belongs to your parents so the referee cannot be bribed, even by tired you at 10pm.',
      steps: [
        'On a parent\'s iPhone: Settings › Screen Time, then tap your name under Family.',
        'Turn on Screen Time and set a Screen Time passcode only your parents know.',
        'Turn on weekly reports. You will read yours every Sunday in Post Match.',
      ],
    },
    'app-limits': {
      title: 'Games: 30 minutes a day',
      who: 'together',
      why: 'Games are built so there is never a good moment to stop. The limit makes the stopping point for you.',
      steps: [
        'Parent\'s iPhone: Screen Time › your name › App Limits › Add Limit.',
        'Choose the Games category. Set 30 minutes, every day.',
        'Tick Block at End of Limit, so "one more minute" needs a parent.',
      ],
    },
    'always-allowed': {
      title: 'Always Allowed: what works even when locked',
      who: 'together',
      why: 'Some things should never be blocked: calling family, getting home, prayer.',
      steps: [
        'Parent\'s iPhone: Screen Time › your name › Always Allowed.',
        'Allow: Phone, Messages (family contacts), Maps, myCatholicSG.',
      ],
    },
    'comm-limits': {
      title: 'Communication Limits and contact approval',
      who: 'together',
      why: 'Strangers cannot reach you if new contacts need your parents\' OK first. This is the strongest protection on the phone.',
      steps: [
        'Parent\'s iPhone: Screen Time › your name › Communication Limits.',
        'During Screen Time: Contacts Only. During Downtime: Specific Contacts, family only.',
        'Turn on contact management so new contacts need a parent\'s approval.',
      ],
    },
    'comm-safety': {
      title: 'Communication Safety on',
      who: 'together',
      why: 'If someone sends you a photo or video with nudity, the phone blurs it and gives you a way to get help. You never have to see it.',
      steps: [
        'Parent\'s iPhone: Screen Time › your name › Communication Safety.',
        'Check it is on. It is usually on by default for under 13s, but check.',
      ],
    },
    'content-limits': {
      title: 'Content and Privacy Restrictions',
      who: 'together',
      why: 'Age ratings on apps and a filter on adult websites. A seatbelt, not a cage.',
      steps: [
        'Parent\'s iPhone: Screen Time › your name › Content and Privacy Restrictions. Turn it on.',
        'App Store, Media, Web and Games › Apps: pick the age rating with your parents. Apple\'s ratings are 4+, 9+, 13+, 16+ and 18+.',
        'Web Content: Limit Adult Websites.',
        'iTunes and App Store Purchases › In App Purchases: Don\'t Allow.',
      ],
    },
    'ask-to-buy': {
      title: 'Ask to Buy on',
      who: 'together',
      why: 'Every new app, even free ones, goes past a parent first. Not because you are not trusted: because app stores are full of traps.',
      steps: [
        'Parent\'s iPhone: Settings › Family › your name › Ask to Buy. Turn it on.',
      ],
    },
    'find-my': {
      title: 'Share your location with family',
      who: 'together',
      why: 'So your parents can relax when you are out, and so you can find your phone if it goes missing.',
      steps: [
        'Settings › your name › Find My › Share My Location: on.',
        'Find My iPhone: on.',
        'In the Find My app, check your parents can see you.',
      ],
    },
    'sos': {
      title: 'Medical ID and Emergency SOS',
      who: 'together',
      why: 'In an emergency, the people helping you can see who to call and what matters, even with the phone locked.',
      steps: [
        'Health app › your picture › Medical ID › Edit. Add emergency contacts: Mum and Dad.',
        'Turn on Show When Locked.',
        'Settings › Emergency SOS. Learn it: hold the side button and a volume button.',
        'Practise saying out loud: in Singapore, Police 999, Ambulance 995.',
      ],
    },
    'scamshield': {
      title: 'Install ScamShield and switch on its filters',
      who: 'together',
      why: 'Scammers target teenagers as well as adults. ScamShield is the Singapore Government\'s app that blocks known scam calls and filters scam texts into Junk.',
      steps: [
        'Install ScamShield from the App Store (by Open Government Products).',
        'Settings › Apps › Messages › Unknown and Spam: turn on ScamShield under SMS Filtering.',
        'Settings › Apps › Phone › Call Blocking and Identification: turn on ScamShield.',
        'Open the app every week or so to refresh its list of scam numbers.',
      ],
    },
    'youtube': {
      title: 'YouTube on a supervised Google account',
      who: 'together',
      why: 'YouTube is useful for football, science and music. It is also a feed with no bottom. Supervision and a Shorts limit keep the useful part.',
      steps: [
        'Your parents create your Google account through Family Link, so it is supervised.',
        'Sign in to YouTube with that account only.',
        'Parents set the content level, and set the Shorts daily limit to zero.',
        'In YouTube: Settings › Playback › Autoplay off.',
      ],
    },
    'catholic-app': {
      title: 'Install myCatholicSG',
      who: 'you',
      why: 'The official app of the Archdiocese of Singapore: today\'s readings, reflections, Mass times. Your first open of the day.',
      steps: [
        'Install myCatholicSG from the App Store.',
        'Put it in your dock and in the Faith folder.',
        'Each morning, before Messages, read the day\'s Gospel. Two minutes.',
      ],
    },
    'messages-setup': {
      title: 'Messages: family and approved friends',
      who: 'together',
      why: 'Messaging is how you keep friendships going. Start with iMessage, where Screen Time protections reach.',
      steps: [
        'Use iMessage with family and friends your parents know.',
        'WhatsApp\'s minimum age is 13. Add it after your 13th birthday, with your parents.',
        'Settings › Apps › Messages › Unknown and Spam: turn on screening of unknown senders.',
      ],
    },

    /* Fixture list */
    'family-calendar': {
      title: 'Use the shared Family calendar',
      who: 'together',
      why: 'One calendar the whole family sees means no more "you never told me". Training, Mass, tuition, outings: all in one place.',
      steps: [
        'Open Calendar › Calendars. You should see Family (made by Family Sharing).',
        'Add family things there: matches, Mass, outings, birthdays.',
        'Ask your parents to put their plans that affect you there too.',
      ],
    },
    'my-calendars': {
      title: 'Make colour coded calendars',
      who: 'you',
      why: 'Colours let you see your week at a glance: too much red and no green means you have forgotten to rest.',
      steps: [
        'Calendar › Calendars › Add Calendar.',
        'Make: School, Homework, Football, Faith, Free.',
        'Give each one its own colour.',
      ],
    },
    'sunday-plan': {
      title: 'Sunday planning: 10 minutes with a parent',
      who: 'together',
      why: 'Ten minutes on Sunday saves hours of panic on Wednesday. Planning is the most underrated skill in school.',
      steps: [
        'Create a repeating Calendar event: Sunday, 7.30pm, "Plan the week", 10 minutes.',
        'Each Sunday: check tests and homework, add training, add one fun thing.',
        'Put the big rocks in first: sleep, school, Mass, training, family. Games go in last.',
      ],
    },
    'reminder-lists': {
      title: 'Reminders: three lists',
      who: 'you',
      why: 'Calendar is for times. Reminders is for tasks. Your head is for thinking, not for storing.',
      steps: [
        'Reminders › Add List: School, Home, Football.',
        'Add a task the moment you hear it. Give it a date.',
        'Tick it off when done. Clear the list on Sunday.',
      ],
    },

    /* Off the pitch */
    'downtime': {
      title: 'Downtime from 9.00pm to 6.30am',
      who: 'together',
      why: 'Your brain files away the day\'s learning while you sleep. Downtime protects that time from "just checking".',
      steps: [
        'Parent\'s iPhone: Screen Time › your name › Downtime.',
        'Scheduled, every day, 9.00pm to 6.30am.',
        'Tick Block at Downtime.',
      ],
    },
    'charging-spot': {
      title: 'The phone sleeps outside your bedroom',
      who: 'together',
      why: 'The single biggest thing you can do for your sleep, your mood and your grades. Not one night off.',
      steps: [
        'Pick a charging spot with your parents: kitchen or living room.',
        'Phone goes there at 9.00pm. Every night, weekends too.',
        'Use a real alarm clock in your room.',
      ],
    },
    'fitness': {
      title: 'Fitness: set a Move goal and share it',
      who: 'together',
      why: 'What gets measured gets noticed. Close your rings; better still, close them before you open a game.',
      steps: [
        'Open Fitness. Set a Move goal with a parent.',
        'Share Activity with Mum or Dad, so you can cheer each other on.',
      ],
    },
    'outside-reminder': {
      title: 'Daily reminder: out before online',
      who: 'you',
      why: 'The reminder fires before the phone gets a chance to start its pull.',
      steps: [
        'Reminders › new reminder: "Out before online".',
        'Repeat: every school day, at the time you get home.',
        'Do something that moves you first: kick a ball, cycle, walk, swim.',
      ],
    },
    'screen-distance': {
      title: 'Screen Distance on',
      who: 'together',
      why: 'Holding a screen close for long periods is linked to short sightedness, and Singapore has some of the highest rates in the world.',
      steps: [
        'Parent\'s iPhone: Screen Time › your name › Screen Distance: on.',
        'When the phone warns you, move it to arm\'s length.',
      ],
    },
    'check-in': {
      title: 'Learn Check In for going out',
      who: 'together',
      why: 'When you head home, Check In tells your parents automatically when you arrive. Freedom, with a safety net.',
      steps: [
        'In Messages, open your chat with Mum or Dad.',
        'Tap +, then Check In. Choose When I Arrive and pick home.',
        'Practise it once together.',
      ],
    },

    /* Post match */
    'journal-app': {
      title: 'Set up the Journal app, locked',
      who: 'you',
      why: 'A private place to review your day. Locked with Face ID, so it is yours.',
      steps: [
        'Open Journal (built into iPhone).',
        'Settings › Apps › Journal › Lock Journal: on.',
        'Settings › Apps › Journal › Journaling Schedule: weekdays at 8.40pm, before the phone docks.',
        'Prefer paper? Keep a notebook by your bed instead. Both work.',
      ],
    },
  },

  /* ---------------------------------------------------------------------------
     02 Set up your pitch
     ------------------------------------------------------------------------ */
  pitch: {
    intro: 'Before a match, the groundsman prepares the pitch. The way your phone is set up decides how you use it, long before willpower gets a say.',
    homeMock: {
      folders: ['Faith', 'School', 'Getting Around', 'Health', 'Tools', 'Messages'],
      dock: ['Phone', 'Messages', 'Calendar', 'myCatholicSG'],
    },
    photoTree: [
      { name: 'Football', albums: ['Matches', 'Training', 'Kit and boots'] },
      { name: 'School', albums: ['Science notes', 'Maths', 'Projects'] },
      { name: 'Family', albums: ['Outings', 'Birthdays', 'Grandparents'] },
      { name: 'Faith', albums: ['Mass and church', 'Verses I like'] },
      { name: 'Friends', albums: ['Shared with permission'] },
    ],
    groups: [
      { title: 'Home screen', tasks: ['home-one', 'home-dock', 'home-folders', 'home-games'] },
      { title: 'Photos', tasks: ['photos-folders', 'photos-sunday'] },
      { title: 'Attention', tasks: ['notifs', 'focus', 'grayscale'] },
    ],
  },

  /* ---------------------------------------------------------------------------
     03 The Cards
     ------------------------------------------------------------------------ */
  cards: {
    intro: 'Referees do not run on a list of "do" and "don\'t". They run on cards. Green is how good players play. Yellow is a warning: you are drifting, fix it now. Red means straight off: stop, and tell a parent.',
    green: {
      label: 'Green card',
      sub: 'Good plays. Every day.',
      items: [
        { rule: 'Out before online.', why: 'Move first after school. The phone can wait an hour; your body cannot.' },
        { rule: 'The phone sleeps in the kitchen.', why: 'It charges outside your room every night, from 9.00pm.' },
        { rule: 'Readings before messages.', why: 'Your first open of the day is myCatholicSG, not the group chat.' },
        { rule: 'Ask before you download.', why: 'Every app goes past a parent. Free apps often cost the most.' },
        { rule: 'Tell early.', why: 'Anything weird, scary or embarrassing, tell a parent the same day. You will not lose your phone for telling.' },
        { rule: 'Big things face to face.', why: 'Arguments, apologies and bad news happen in person or on a call, never by text.' },
        { rule: 'Homework, phone in another room.', why: 'Even a phone lying face down in sight pulls at your attention.' },
        { rule: 'Reply when you are ready.', why: 'A message is not an alarm. Nobody is owed an answer in ten seconds.' },
      ],
    },
    yellow: {
      label: 'Yellow card',
      sub: 'Warnings. Notice them, then fix it.',
      items: [
        { rule: 'You pick up the phone without deciding to.', why: 'Fix: put it in another room for an hour. Try grayscale.' },
        { rule: '"One more game" became forty minutes.', why: 'Fix: the limit is the limit. Stop when it ends, without asking for more.' },
        { rule: 'You feel worse after watching or scrolling.', why: 'Fix: notice it, put the phone down, go and do something real. Write it in Post Match.' },
        { rule: 'A group chat starts turning on one person.', why: 'Fix: do not join in. Speak up, or message that person privately. Tell an adult if it keeps going.' },
        { rule: 'Someone you only know online wants a private chat.', why: 'Fix: say no and tell a parent. Moving to private is how grooming starts.' },
        { rule: 'You are typing something you would not say to their face.', why: 'Fix: delete it. If you would not say it in front of their mum, do not send it.' },
        { rule: 'You keep asking for more time after Downtime.', why: 'Fix: that is your sleep talking. Phone to the kitchen.' },
        { rule: 'A video makes you angry and wants you to share it now.', why: 'Fix: anger plus hurry is the oldest trick. Pause. Check the source first.' },
      ],
    },
    red: {
      label: 'Red card',
      sub: 'Straight off. No exceptions. Tell a parent.',
      items: [
        { rule: 'Never share passwords, PINs or one time codes (OTPs).', why: 'Not with friends, not with "the bank", not with "Mum on a new number". Real people never need your code.' },
        { rule: 'Never send photos or videos of your body to anyone.', why: 'And never forward one you receive. Once sent, it is out of your control forever.' },
        { rule: 'Never meet someone you only know online.', why: 'Not without your parents knowing and being there. People online are not always who they say.' },
        { rule: 'Never pay, reply to, or obey a threat.', why: 'Screenshot it, block, and tell a parent straight away. It is never your fault, and it is never too late to tell.' },
        { rule: 'Never share your address, school or live location with people you have not met.', why: 'That includes the backgrounds of your photos and videos.' },
        { rule: 'Never get around Screen Time.', why: 'No secret accounts, no fake birthdays, no borrowed passcodes. Trust is the whole deal; once it is gone, freedom goes with it.' },
      ],
    },
  },

  /* ---------------------------------------------------------------------------
     04 Starting XI. Formation 4 3 3, attacking up the page.
     x, y are percentages on the pitch drawing.
     ------------------------------------------------------------------------ */
  squad: {
    intro: 'A manager does not pick every player in the country. Eleven earn their place, a few wait on the bench, and some are not in the squad yet. Your phone works the same way.',
    xi: [
      { no: 1,  pos: 'Keeper',     x: 50, y: 88, name: 'myCatholicSG', role: 'Keeps the goal', what: 'Daily readings, reflections and Mass times from the Archdiocese of Singapore. The keeper sees the whole pitch: start every day here.', tasks: ['catholic-app'] },
      { no: 2,  pos: 'Defender',   x: 84, y: 68, name: 'Find My', role: 'Knows where you are', what: 'Your family can see you are safe, and you can find a lost phone.', tasks: ['find-my'] },
      { no: 4,  pos: 'Defender',   x: 61, y: 72, name: 'Screen Time', role: 'The referee', what: 'Downtime, limits and contact rules. Built in, and the most important setting on the phone.', tasks: ['family-sharing', 'screen-time', 'comm-limits', 'comm-safety', 'content-limits', 'ask-to-buy'] },
      { no: 5,  pos: 'Defender',   x: 39, y: 72, name: 'ScamShield', role: 'Blocks scams', what: 'The Singapore Government\'s free app. Blocks scam calls, filters scam texts, checks suspicious messages.', tasks: ['scamshield'] },
      { no: 3,  pos: 'Defender',   x: 16, y: 68, name: 'Emergency SOS', role: 'Calls for help', what: 'Medical ID and Emergency SOS, built into Health and Settings. Set it up once, hope you never need it.', tasks: ['sos'] },
      { no: 6,  pos: 'Midfield',   x: 50, y: 50, name: 'Calendar', role: 'Runs the week', what: 'Where your time goes. Shared Family calendar plus your own colour coded ones.', tasks: ['family-calendar', 'my-calendars'] },
      { no: 8,  pos: 'Midfield',   x: 22, y: 45, name: 'Reminders', role: 'Never forgets', what: 'Tasks with dates, in three lists: School, Home, Football.', tasks: ['reminder-lists'] },
      { no: 10, pos: 'Midfield',   x: 78, y: 45, name: 'Fitness', role: 'Keeps you moving', what: 'Move goal, activity rings, and sharing with family. Close the rings before you open a game.', tasks: ['fitness'] },
      { no: 7,  pos: 'Forward',    x: 80, y: 20, name: 'Maps and MyTransport.SG', role: 'Gets you there', what: 'Maps for directions, MyTransport.SG (from LTA) for bus arrival times. Learn your routes home.', tasks: [] },
      { no: 9,  pos: 'Forward',    x: 50, y: 14, name: 'Messages', role: 'Keeps you connected', what: 'iMessage with family and approved friends. WhatsApp joins the squad after your 13th birthday.', tasks: ['messages-setup'] },
      { no: 11, pos: 'Forward',    x: 20, y: 20, name: 'YouTube', role: 'Learns and plays', what: 'Supervised account, Shorts off, autoplay off. For football skills, science, music. A tool, not a feed.', tasks: ['youtube'] },
    ],
    bench: {
      title: 'The Bench',
      sub: 'Allowed when a parent says yes. One at a time.',
      items: [
        { name: 'One game you really love', note: 'Chosen together. Lives in the App Library, inside the 30 minute limit.' },
        { name: 'Journal', note: 'Built in. For Post Match. Locked with Face ID.' },
        { name: 'Hallow or Laudate', note: 'Catholic prayer apps: guided prayer, the Rosary, the Examen. Hallow has paid content; ask first.' },
        { name: 'Music app', note: 'For training and homework playlists.' },
        { name: 'SimplyGo', note: 'To check your transport card.' },
        { name: 'School apps', note: 'Whatever your school asks you to use.' },
      ],
    },
    notYet: {
      title: 'Not in the squad yet',
      sub: 'Not banned forever. Revisited together, not before 15.',
      items: [
        { name: 'TikTok, Instagram, Snapchat', note: 'Built around endless feeds and likes. Hardest apps in the world to put down.' },
        { name: 'Discord and game voice chat', note: 'Strangers can reach you directly. This is where most online trouble for boys your age starts.' },
        { name: 'Roblox and games with open chat', note: 'Fine games, risky chat. If a game is allowed, chat stays off.' },
        { name: 'Any app that lets strangers message you', note: 'If you are unsure, the answer is wait and ask.' },
      ],
    },
  },

  /* ---------------------------------------------------------------------------
     05 The Fixture List
     ------------------------------------------------------------------------ */
  fixtures: {
    intro: 'Every club knows its fixtures weeks ahead. Players who know what is coming train for it. Players who do not, get caught out. Your time works the same way: plan it, or someone else will spend it for you.',
    principles: [
      { title: 'If it is not in the calendar, it is not real.', body: 'Tests, training, Mass, homework blocks. Put them in the moment you hear about them.' },
      { title: 'Big rocks first.', body: 'Fill a jar with sand first and the rocks will not fit. Put the rocks in first, and the sand slips around them. Your rocks: sleep, school, Mass, training, family. Games and YouTube are sand.' },
      { title: 'Calendar for times, Reminders for tasks.', body: '"Science test Thursday" is a calendar event. "Revise Science, chapter 4" is a reminder, due Tuesday.' },
      { title: 'When this, then that.', body: 'Plans with a trigger work about twice as often. "When I get home, I will change and go outside." "When I sit at my desk, the phone goes to the kitchen."' },
    ],
    week: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      kinds: {
        school:   { label: 'School' },
        move:     { label: 'Move' },
        homework: { label: 'Homework' },
        faith:    { label: 'Faith' },
        family:   { label: 'Family' },
        free:     { label: 'Free and games' },
      },
      blocks: [
        ['school', 'move', 'homework', 'family', 'free'],
        ['school', 'move', 'homework', 'family', 'free'],
        ['school', 'move', 'homework', 'family', 'free'],
        ['school', 'move', 'homework', 'family', 'free'],
        ['school', 'move', 'free', 'family', 'free'],
        ['move', 'homework', 'family', 'free', 'free'],
        ['faith', 'family', 'move', 'homework', 'family'],
      ],
      note: 'A sample week. Your real one depends on training and tuition. Notice: movement every day, faith and family every week, games in the gaps, not the centre.',
    },
    studio: { text: 'Planning a Science revision block? Open the Compass in Science Studio and let it pick the session for you.', href: '../studio/compass/index.html' },
    tasks: ['family-calendar', 'my-calendars', 'sunday-plan', 'reminder-lists'],
  },

  /* ---------------------------------------------------------------------------
     06 Read the Game
     ------------------------------------------------------------------------ */
  game: {
    intro: 'Great players read the game before the ball arrives. These twelve situations happen to boys your age every week. Make your call, then see why.',
    tools: [
      { id: 'pause',  name: 'Pause',            body: 'If a message makes you feel hot, cold, scared or rushed, stop. Hurry is the scammer\'s favourite weapon.' },
      { id: 'gains',  name: 'Who gains?',       body: 'If I click, share, pay or reply, who benefits? If it is not me, why are they asking?' },
      { id: 'source', name: 'Check the source', body: 'Do not use their link. Go to the real website, the real person, the official account, yourself.' },
      { id: 'tell',   name: 'Tell early',       body: 'The earlier you tell a parent, the smaller the problem. Secrets are what bullies and scammers need most.' },
    ],
    filter: {
      text: 'Whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is gracious, if there is any excellence, if there is anything worthy of praise, think about these things.',
      ref: 'Philippians 4:8 (RSV2CE)',
      test: ['Is it true?', 'Is it honourable?', 'Is it fair?', 'Is it clean?', 'Is it kind?', 'Is it worth it?'],
    },
    verdicts: {
      good: 'Good play',
      half: 'Half chance',
      yellow: 'Yellow card',
      red: 'Red card',
    },
    scenarios: [
      {
        id: 'pileon',
        title: 'The group chat laugh',
        app: 'Messages',
        chat: '6E Boys',
        msgs: [
          { from: 'Jayden', text: '[photo of Ethan asleep on the bus, mouth open]' },
          { from: 'Jayden', text: 'LOOK AT HIM 😂😂' },
          { from: 'Marcus', text: 'bro 💀' },
          { from: 'Ryan', text: 'send to the class chat' },
        ],
        ask: 'Ethan is not in this chat. What do you do?',
        choices: [
          { text: 'Send a laughing emoji so you do not look weird.', v: 'red', why: 'Joining in, even with one emoji, makes you part of it. Ethan will see who laughed.' },
          { text: 'Say nothing and mute the chat.', v: 'half', why: 'You did not join in, which matters. But silence often reads as agreement, and the photo is still going round.' },
          { text: '"Not cool, delete it." Then tell an adult if it goes to the class chat.', v: 'good', why: 'One person speaking up often stops a pile on. It takes courage. That is what a captain does.' },
        ],
        principle: 'A pile on needs an audience. Refuse to be one.',
        tool: 'tell',
      },
      {
        id: 'screenshot',
        title: '"I won\'t show anyone"',
        app: 'Messages',
        chat: 'Marcus',
        msgs: [
          { from: 'Marcus', text: 'ok be honest what do u REALLY think of Ryan' },
          { from: 'Marcus', text: 'i won\'t show anyone promise' },
        ],
        ask: 'You find Ryan annoying sometimes. How do you reply?',
        choices: [
          { text: 'Be honest. Marcus promised.', v: 'yellow', why: 'A screenshot takes one second. Promises do not survive a falling out, and friendships at your age change fast.' },
          { text: '"He\'s alright. Why?"', v: 'good', why: 'Nothing here can hurt anyone if it is shared. If something about Ryan really bothers you, say it to him, in person.' },
          { text: 'Send a voice note instead, so there is no text.', v: 'yellow', why: 'Voice notes can be forwarded and recorded too. The format does not matter; the words do.' },
        ],
        principle: 'Write every message as if it will be screenshotted and shown to the person you are talking about.',
        tool: 'pause',
      },
      {
        id: 'gamechat',
        title: 'The generous stranger',
        app: 'In game chat',
        chat: 'ProStriker_17',
        msgs: [
          { from: 'ProStriker_17', text: 'ur actually cracked at this game' },
          { from: 'ProStriker_17', text: 'i can get u free coins, add me on discord, easier to talk there' },
        ],
        ask: 'He seems friendly and he is good at the game. What do you do?',
        choices: [
          { text: 'Add him. Free coins and a new friend.', v: 'red', why: 'Flattery, a gift, then a move to a private app: this is the exact pattern groomers and scammers use. Every time.' },
          { text: 'Ignore him and keep playing.', v: 'half', why: 'Better. But he will try the next boy. Block and report him so the game can act.' },
          { text: 'Block, report, and tell a parent what he said.', v: 'good', why: 'You spotted the pattern: praise, a gift, then "let\'s talk somewhere private". Telling helps your parents keep your settings right.' },
        ],
        principle: 'Praise, a gift, then "somewhere private". That is not friendship; that is a script.',
        tool: 'gains',
      },
      {
        id: 'picrequest',
        title: '"Just for fun"',
        app: 'Messages',
        chat: 'Unknown',
        msgs: [
          { from: 'Unknown', text: 'hey its Chloe from the football camp, remember me?' },
          { from: 'Unknown', text: 'we\'ve been chatting 2 weeks now, ur so funny' },
          { from: 'Unknown', text: 'send a pic without ur shirt, just for fun, i\'ll send one back' },
        ],
        ask: 'You do not really remember a Chloe. What do you do?',
        choices: [
          { text: 'Send one. It is only your chest, it is harmless.', v: 'red', why: 'Any image of your body can be used against you. Many "girls" asking boys for pictures are adult men running a scam.' },
          { text: 'Say no, and keep chatting.', v: 'yellow', why: 'Saying no is right. But someone who asks once will ask again, and harder. This chat needs to end.' },
          { text: 'Stop replying, screenshot, block, and tell a parent.', v: 'good', why: 'Exactly right. You have done nothing wrong, and telling means an adult can report the account.' },
        ],
        principle: 'Your body is never content. Anyone who asks for it is not your friend.',
        tool: 'tell',
      },
      {
        id: 'threat',
        title: 'The threat',
        app: 'Messages',
        chat: 'Unknown',
        msgs: [
          { from: 'Unknown', text: 'i have ur pic. pay $100 in gift cards in 1 hour or i send it to ur school and ur parents' },
          { from: 'Unknown', text: 'dont tell anyone or its worse' },
        ],
        ask: 'Imagine a friend got this. What should he do?',
        choices: [
          { text: 'Pay quickly so it goes away.', v: 'red', why: 'Paying never ends it. It proves you will pay, and the demands grow.' },
          { text: 'Beg them to stop, and keep it secret.', v: 'red', why: '"Don\'t tell anyone" is the scammer\'s whole plan. Secrecy is the only power they have.' },
          { text: 'Stop replying, screenshot everything, block, and tell a parent now.', v: 'good', why: 'Parents and police deal with this. It is never the young person\'s fault, and it is never too late to tell. Your parents have promised: help first, questions later.' },
        ],
        principle: 'A threat that says "don\'t tell" is the one you tell about first.',
        tool: 'tell',
      },
      {
        id: 'otp',
        title: '"Hi, it\'s Mum, new number"',
        app: 'Messages',
        chat: '+65 8XXX XXXX',
        msgs: [
          { from: '+65 8XXX XXXX', text: 'Hi dear its Mum, my phone broke so this is my new number' },
          { from: '+65 8XXX XXXX', text: 'you will get a 6 digit code by SMS now. send it to me quickly ok, I need it for my account' },
        ],
        ask: 'A code has just arrived. What do you do?',
        choices: [
          { text: 'Send it. Mum needs help.', v: 'red', why: 'That code unlocks an account. This is one of the most common scams in Singapore. Real Mum never needs your code.' },
          { text: 'Ask "what\'s my middle name?" first.', v: 'half', why: 'Good instinct to test them, but scammers often know a lot about you. Do not stay in their chat.' },
          { text: 'Call Mum on her real number. Never send the code.', v: 'good', why: 'Check the source yourself, using the number you already have. Then report the fake number in ScamShield.' },
        ],
        principle: 'Codes are like keys to your front door. Nobody real ever asks for them.',
        tool: 'source',
      },
      {
        id: 'aifake',
        title: 'The famous footballer',
        app: 'YouTube',
        chat: 'Video ad',
        msgs: [
          { from: 'Video', text: '[A famous striker, his face and voice, smiling at the camera]' },
          { from: 'Video', text: '"I\'m giving my fans 50,000 free coins for EA FC. Tap the link and log in with your account."' },
        ],
        ask: 'It looks and sounds exactly like him. What do you do?',
        choices: [
          { text: 'Tap and log in. It is really him.', v: 'red', why: 'AI can now fake faces and voices. Video is no longer proof. Logging in hands your account to a stranger.' },
          { text: 'Check his official accounts first.', v: 'half', why: 'Better instinct. But "free coins, log in here" is a scam pattern on its own; you do not need to investigate it.' },
          { text: 'Skip it, and report the ad.', v: 'good', why: 'Free plus urgent plus "log in here" is always a scam, whoever seems to be saying it.' },
        ],
        principle: 'Seeing is no longer believing. Judge the request, not the face.',
        tool: 'gains',
      },
      {
        id: 'rabbithole',
        title: 'Fifty minutes later',
        app: 'YouTube',
        chat: 'Up next',
        msgs: [
          { from: 'YouTube', text: 'You opened one video: "Top 10 goals this season".' },
          { from: 'YouTube', text: 'It is now 50 minutes later. Up next in 5 seconds: "Craziest fails of all time".' },
        ],
        ask: 'Homework is waiting. What now?',
        choices: [
          { text: 'One more, then stop.', v: 'yellow', why: 'That is what you told yourself 49 minutes ago. The next video is designed to be just as hard to leave.' },
          { text: 'Close it now and go and kick a ball.', v: 'good', why: 'Stopping in the middle is a skill, and it gets easier each time. Moving resets your brain.' },
          { text: 'Close it now, and turn autoplay off for good.', v: 'good', why: 'Even better: you fixed the trap, not just this one moment. Smart players change the setup.' },
        ],
        principle: 'A feed has no bottom. Decide your stopping point before you start.',
        tool: 'pause',
      },
      {
        id: 'rumour',
        title: 'Forwarded many times',
        app: 'Messages',
        chat: 'Football Kakis',
        msgs: [
          { from: 'Daniel', text: '↪ Forwarded many times' },
          { from: 'Daniel', text: 'URGENT!!! MOE confirmed PSLE Science is cancelled this year. Share with everyone before they delete this!!!' },
        ],
        ask: 'Everyone would love this to be true. What do you do?',
        choices: [
          { text: 'Forward it to your class. They need to know.', v: 'yellow', why: 'If it is false, you have just spread it. Capital letters, "urgent" and "before they delete this" are warning signs.' },
          { text: 'Check the MOE website or ask a teacher.', v: 'good', why: 'Real news comes from the real source. A forward from a friend of a friend is not a source.' },
          { text: 'Ignore it.', v: 'half', why: 'Better than forwarding. Even better: reply "MOE site says nothing, don\'t forward", so the chain stops with your group.' },
        ],
        principle: 'The more a message wants you to hurry, the more it needs checking.',
        tool: 'source',
      },
      {
        id: 'peer',
        title: '"Everyone\'s on it"',
        app: 'Messages',
        chat: 'Ryan',
        msgs: [
          { from: 'Ryan', text: 'just make a tiktok, put ur birthday as 2008' },
          { from: 'Ryan', text: 'ur parents won\'t even know lol' },
        ],
        ask: 'You do feel left out sometimes. What do you do?',
        choices: [
          { text: 'Make one secretly. Just to watch.', v: 'red', why: 'A secret account breaks the whole deal, and hiding things from your parents is the first trap every online danger needs.' },
          { text: '"Can\'t, my parents said no."', v: 'half', why: 'Honest and fine. Better still to own it as your choice: you know why these apps are built the way they are.' },
          { text: '"Not yet, we review it at 15." Then tell your parents you feel left out.', v: 'good', why: 'Feeling left out is real and worth saying. Your parents can help: maybe a movie night with the guys, or watching a few videos together.' },
        ],
        principle: 'If you have to hide it, that is your answer.',
        tool: 'tell',
      },
      {
        id: 'latenight',
        title: '9.40pm',
        app: 'Messages',
        chat: 'Ethan',
        msgs: [
          { from: 'Ethan', text: 'u still up?' },
          { from: 'Ethan', text: 'i feel really bad today. like really bad' },
        ],
        ask: 'Downtime has started. Your phone is about to go to the kitchen. What do you do?',
        choices: [
          { text: 'Ask for more time and chat till midnight.', v: 'yellow', why: 'You care, which is good. But you are not a counsellor, and two tired boys at midnight rarely fix anything.' },
          { text: 'Leave it until tomorrow.', v: 'yellow', why: '"Really bad" might be serious. A friend in trouble deserves a reply and an adult who knows.' },
          { text: 'Reply "I\'m here. Tell your mum or dad tonight. Let\'s talk at recess." Then tell your parent.', v: 'good', why: 'You were kind, you pointed him to help, and you told an adult. If it sounds serious, your parent can call his parent. That is being a real friend.' },
        ],
        principle: 'Caring for a friend means getting an adult involved, not carrying it alone.',
        tool: 'tell',
      },
      {
        id: 'compare',
        title: 'Everyone else\'s highlights',
        app: 'WhatsApp Status',
        chat: 'Status updates',
        msgs: [
          { from: 'Marcus', text: '[photo: five of the guys at a birthday party]' },
          { from: 'Marcus', text: 'best day ever 🔥' },
        ],
        ask: 'You were not invited. You feel awful. What helps?',
        choices: [
          { text: 'Keep scrolling through all their photos.', v: 'yellow', why: 'You will feel worse with every one. You are comparing your whole day with their best five seconds.' },
          { text: 'Post something to look like you had a better day.', v: 'yellow', why: 'Now you are playing the same game. Everyone loses it.' },
          { text: 'Put the phone down, go and do something, and talk about it at home.', v: 'good', why: 'Feeling hurt is normal. Talking about it shrinks it. Maybe there is a reason, maybe not; either way, your worth is not decided by one party.' },
        ],
        principle: 'You see their highlights. You live your whole match.',
        tool: 'pause',
      },
    ],
  },

  /* ---------------------------------------------------------------------------
     07 Off the Pitch
     ------------------------------------------------------------------------ */
  off: {
    intro: 'Matches are won on the training ground, the dinner table and in bed. What makes a player great mostly happens away from the pitch. The same is true for school.',
    pillars: [
      {
        id: 'sleep', name: 'Sleep', stat: '9 to 12', unit: 'hours a night at 12',
        rule: 'The phone sleeps outside your room. Every night.',
        why: 'Sleep is when your brain saves what you learned today. Light from a screen and "one last check" steal the deepest part. At 13 and up you still need 8 to 10 hours.',
        tasks: ['downtime', 'charging-spot'],
      },
      {
        id: 'move', name: 'Move', stat: '60', unit: 'minutes a day',
        rule: 'Out before online.',
        why: 'An hour of moving a day, enough to get out of breath, is what young people need. It sharpens your focus for homework afterwards and lifts your mood more than any app.',
        tasks: ['fitness', 'outside-reminder'],
      },
      {
        id: 'people', name: 'People', stat: '1', unit: 'real meetup a week',
        rule: 'Real friends, in person, the right squad.',
        why: 'A good squad makes you better, is the same online and offline, and never asks you to hide things from your parents. If a group makes you feel small or asks for secrets, it is the wrong squad.',
        tasks: ['check-in', 'find-my'],
      },
      {
        id: 'eyes', name: 'Eyes and mind', stat: '20 20 20', unit: 'the eye rule',
        rule: 'Every 20 minutes, look 20 feet away for 20 seconds.',
        why: 'Time outdoors in daylight protects your eyesight. Screens held close do the opposite. And notice your mind: if the phone leaves you flat, that is a yellow card.',
        tasks: ['screen-distance', 'grayscale'],
      },
    ],
    day: [
      { t: '6.30am', what: 'Wake to a real alarm clock. Phone is still in the kitchen.' },
      { t: '6.45am', what: 'Readings first: today\'s Gospel in myCatholicSG.' },
      { t: 'School', what: 'Phone in your bag. School Focus on.' },
      { t: 'Home', what: 'Out before online: move for an hour.' },
      { t: 'Homework', what: 'Phone in another room. Homework Focus on.' },
      { t: 'Dinner', what: 'No phones at the table. Everyone, parents too.' },
      { t: 'Evening', what: 'Messages, YouTube, up to 30 minutes of games.' },
      { t: '8.40pm', what: 'Post Match: three minutes, three questions.' },
      { t: '9.00pm', what: 'Phone docks in the kitchen. Downtime begins.' },
    ],
  },

  /* ---------------------------------------------------------------------------
     08 Post Match
     ------------------------------------------------------------------------ */
  post: {
    intro: 'After every match, professional players watch the footage. Not to feel bad: to see what worked, what did not, and what to try next time. Three minutes a night does the same for your day. Catholics have done this for 500 years; Saint Ignatius called it the Examen.',
    nightly: [
      { id: 'best',   q: 'Best play today?',              hint: 'Something that went well, and what you did to make it go well.' },
      { id: 'lost',   q: 'Where did I lose the ball?',     hint: 'One moment you would replay differently. No beating yourself up, just the fix.' },
      { id: 'learnt', q: 'What did I learn, in one sentence?', hint: 'If you cannot say it simply, you have found tomorrow\'s question.' },
      { id: 'phone',  q: 'Did the phone serve me today, or did I serve it?', hint: 'Any yellow cards? When did you pick it up without deciding to?' },
      { id: 'grace',  q: 'Where did I see God today? Who do I want to thank?', hint: 'A person, a moment, a small good thing.' },
      { id: 'next',   q: 'Tomorrow\'s first move.',       hint: 'Finish this: "When ___, I will ___."' },
    ],
    weekly: {
      title: 'Sunday match report',
      intro: 'Once a week, open your Screen Time weekly report and look at it honestly. Then answer:',
      qs: [
        { id: 'total',  q: 'Screen time this week, and last week?', hint: 'Just the numbers. Up, down or the same?' },
        { id: 'top',    q: 'Which app took the most time? Was it worth it?', hint: '' },
        { id: 'proud',  q: 'What am I proud of this week?', hint: 'Effort counts as much as results.' },
        { id: 'change', q: 'One change for next week.', hint: 'Small and specific beats big and vague.' },
      ],
    },
    privacy: 'Your journal stays on this device, in this browser. Nobody else sees it unless you choose to show them.',
    tasks: ['journal-app'],
  },

  /* ---------------------------------------------------------------------------
     09 The Pact
     ------------------------------------------------------------------------ */
  pact: {
    intro: 'A pact is a two way deal. You make promises; so do your parents. Read it together, out loud, then sign.',
    player: [
      'I will play by the Cards: green every day, fix the yellows fast, never a red.',
      'I will keep the phone set up the way we agreed, and never get around Screen Time.',
      'I will put the phone in the kitchen at 9.00pm, every night.',
      'I will move before I go online, and see real friends in person.',
      'I will tell you early when something online feels wrong, even if I made a mistake.',
      'I will review my day, and my week, honestly.',
    ],
    parents: [
      'If you tell us something went wrong, we will help first and talk later. You will not lose your phone for telling us.',
      'We will keep the same table rule: no phones at meals, for us too.',
      'We will check your phone with you, not behind your back.',
      'We will ask before we post photos of you.',
      'We will review this Playbook with you, and give you more freedom as trust grows.',
    ],
    help: {
      title: 'If something feels wrong and you cannot reach a parent',
      lines: [
        { name: 'Tinkle Friend', num: '1800 2744 788', note: 'For children. Weekdays, 2.30pm to 5pm. Chat online too.' },
        { name: 'Samaritans of Singapore', num: '1767', note: '24 hours, if you or a friend feel unsafe or very low.' },
        { name: 'Police', num: '999', note: 'Danger, now.' },
      ],
    },
  },

  sources: [
    { label: 'Apple: Use Screen Time to manage your child\'s iPhone', href: 'https://support.apple.com/108806' },
    { label: 'Google: Parental controls for supervised accounts on YouTube', href: 'https://support.google.com/youtubekids/answer/13877231' },
    { label: 'ScamShield (Singapore Government)', href: 'https://www.scamshield.gov.sg/' },
    { label: 'MOH: Grow Well SG screen use guidance, January 2025', href: 'https://www.moh.gov.sg/newsroom/opening-remarks-by-mr-ong-ye-kung--minister-for-health--at-the-press-conference-on-grow-well-sg--21-january-2025/' },
    { label: 'MOE: Healthier screen use in students, November 2025', href: 'https://www.moe.gov.sg/news/press-releases/20251130-moe-to-introduce-enhanced-measures-to-promote-healthier-screen-use-in-students' },
    { label: 'myCatholicSG (Archdiocese of Singapore)', href: 'https://apps.apple.com/app/id1151027240' },
    { label: 'Tinkle Friend (Singapore Children\'s Society)', href: 'https://findahelpline.com/organizations/tinkle-friend' },
  ],
};
