// ============================================================
//  VERSION — the one place the app's version is written down.
// ============================================================
//
//  The banner on the home screen used to be a hand-typed string in
//  index.html. It said "v2.1 - Garden Island + Sims + Surprises!" for
//  three and a half months and sixty-four commits, across which the whole
//  Play module, the maths drill and tricks layer, the Trachtenberg rules,
//  the adaptive difficulty ladders and the inline-feedback change all
//  shipped. It was not that versioning drifted; there was no versioning.
//  Nothing pointed at that string, so nothing ever reminded anyone.
//
//  So: one constant, rendered into the banner at runtime, and a staleness
//  guard in build.sh that shouts when src/ has moved on but this file has
//  not. That guard is the part that actually prevents a repeat - the same
//  trick already catches index.html falling out of step with build.sh.
//
//  Bumping it, when a release is worth naming:
//    1. Edit APP_VERSION below - number, name and date together.
//    2. Add the matching entry to the top of CHANGELOG.md.
//    3. Run `bash build.sh`; the guard goes quiet once the bump is
//       committed alongside the work it describes.
//
//  `number` is the version a person sees. It is not the same thing as
//  state.version in state.js, which is the localStorage schema version
//  and only ever changes when saved progress needs migrating. Those two
//  move independently and conflating them would break old save files.

var APP_VERSION = {
  number: '3.0',
  // Short enough to sit on one line on a phone. This is what she reads.
  name: 'Play, Puzzles & Sharper Maths',
  // ISO date of the release, used by the staleness guard.
  date: '2026-08-10'
};

/** "Nasworld v3.0 — Play, Puzzles & Sharper Maths" */
function appVersionLabel() {
  return 'Nasworld v' + APP_VERSION.number + ' — ' + APP_VERSION.name;
}

/**
 * Fill the home-screen banner. Called from init() rather than written
 * into the HTML so there is only one place to change.
 */
function renderVersionBanner() {
  var el = document.getElementById('version-banner');
  if (!el) return;
  el.textContent = appVersionLabel();
  el.setAttribute('title', 'Released ' + APP_VERSION.date);
}

if (typeof window !== 'undefined') {
  window.APP_VERSION = APP_VERSION;
  window.appVersionLabel = appVersionLabel;
  window.renderVersionBanner = renderVersionBanner;
}
