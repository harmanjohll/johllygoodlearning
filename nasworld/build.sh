#!/bin/bash
# ============================================================
#  BUILD — Bundle all JS files into a single offline HTML file
# ============================================================
# Usage: bash build.sh
# Output: dist/bundle.html (fully self-contained, works offline)

set -e

SRCDIR="$(cd "$(dirname "$0")" && pwd)"
OUTDIR="$SRCDIR/dist"
OUTFILE="$OUTDIR/bundle.html"

mkdir -p "$OUTDIR"

echo "Building Nasworld (Anastasia's Learning Universe)..."

# Read index.html
INPUT="$SRCDIR/index.html"
if [ ! -f "$INPUT" ]; then
  echo "Error: index.html not found!"
  exit 1
fi

# Script files in dependency order (must match index.html)
SCRIPTS=(
  "src/core/utils.js"
  "src/data/encouragements.js"
  "src/data/wotd.js"
  "src/core/state.js"
  "src/core/spaced-review.js"
  "src/core/achievements.js"
  "src/core/dynamic-quests.js"
  "src/core/lumi.js"
  "src/core/adaptive.js"
  "src/core/audio.js"
  "src/core/learn-engine.js"
  "src/core/flashcard-engine.js"
  "src/math/math-tree.js"
  "src/math/math-lessons.js"
  "src/word/word-data.js"
  "src/word/word-tree.js"
  "src/word/word-lessons.js"
  "src/stem/stem-tree.js"
  "src/stem/stem-lessons.js"
  "src/math/math-gen.js"
  "src/math/word-problems.js"
  "src/math/trachtenberg.js"
  "src/math/tricks.js"
  "src/math/tricks-render.js"
  "src/math/math-drill.js"
  "src/play/play-hub.js"
  "src/play/play-jigsaw.js"
  "src/play/play-numpyramid.js"
  "src/play/play-brain.js"
  "src/play/play-words.js"
  "src/math/math-render.js"
  "src/word/word-gen.js"
  "src/word/word-render.js"
  "src/stem/science-gen.js"
  "src/stem/science-sim.js"
  "src/stem/code-engine.js"
  "src/stem/code-levels.js"
  "src/malay/malay-tree.js"
  "src/malay/malay-data.js"
  "src/malay/malay-lessons.js"
  "src/malay/malay-gen.js"
  "src/malay/malay-render.js"
  "src/data/mega-map.js"
  "src/data/threads.js"
  "src/data/iotd.js"
  "src/data/qotd.js"
  "src/data/strategies.js"
  "src/core/metacognition.js"
  "src/core/tts.js"
  "src/core/ai.js"
  "src/avatar/wardrobe-data.js"
  "src/avatar/wardrobe.js"
  "src/avatar/stasha.js"
  "src/stem-sims/sim-pushpull.js"
  "src/stem-sims/sim-plant.js"
  "src/stem-sims/sim-shadow.js"
  "src/stem-sims/sim-recycle.js"
  "src/stem-sims/sim-float.js"
  "src/stem-sims/sim-balance.js"
  "src/stem-sims/sim-magnets.js"
  "src/stem-sims/sim-living.js"
  "src/stem-sims/sim-water.js"
  "src/stem-sims/sim-hub.js"
  "src/challenges/star-trials.js"
  "src/challenges/escape-rooms.js"
  "src/core/interactive-sims.js"
  "src/core/surprise-events.js"
  "src/ui/topbar.js"
  "src/ui/feedback.js"
  "src/ui/garden.js"
  "src/ui/garden-island.js"
  "src/ui/home.js"
  "src/ui/mega-map.js"
  "src/ui/compass.js"
  "src/ui/mirror.js"
  "src/ui/pomodoro.js"
  "src/ui/parent-digest.js"
  "src/ui/settings.js"
  "src/ui/navigation.js"
)

# Verify all scripts exist
MISSING=0
for script in "${SCRIPTS[@]}"; do
  if [ ! -f "$SRCDIR/$script" ]; then
    echo "  MISSING: $script"
    MISSING=1
  fi
done
if [ $MISSING -eq 1 ]; then
  echo "Error: Some script files are missing!"
  exit 1
fi

# Build the bundled HTML
# 1. Take everything from index.html up to the first <script src=...> tag
# 2. Replace all <script src="..."> tags with a single inline <script> block
# 3. Keep everything after the last </script> tag

# Extract the part before scripts
BEFORE_SCRIPTS=$(sed -n '1,/<script src=/{ /<script src=/!p }' "$INPUT")

# Extract the part after all scripts (from the last </script> to end)
AFTER_SCRIPTS=$(sed -n '/^<script src=.*<\/script>$/{ n; }; /^<script src=/!{ /^<\/script>/!p }' "$INPUT" | sed -n '/^<script/,$ !p' | tail -n +2)

# Simpler approach: use awk to split the file
{
  # Part 1: Everything before the first <script src= line, but with the
  # <link rel="stylesheet"> tags replaced by the stylesheets inlined, so
  # the bundle stays a genuinely single self-contained file offline.
  awk '/<script src=/{exit} {print}' "$INPUT" | grep -v '<link rel="stylesheet" href="styles/'
  echo '<style>'
  for css in styles/app-1.css styles/app-2.css styles/app-3.css styles/app-4.css styles/app-5.css; do
    cat "$SRCDIR/$css"
  done
  echo '</style>'

  # Part 2: All JS concatenated into one script block
  echo '<script>'
  echo '// === BUNDLED BY build.sh ==='
  for script in "${SCRIPTS[@]}"; do
    echo ""
    echo "// --- $script ---"
    cat "$SRCDIR/$script"
  done
  echo '</script>'

  # Part 3: Everything after the last <script src= line
  awk 'BEGIN{found=0} /<script src=/{found=1; next} found && !/<script src=/{print}' "$INPUT"

} > "$OUTFILE"

# --- Drift guard -------------------------------------------------------
# index.html is what GitHub Pages actually serves; this script only makes
# the offline bundle. They have their own copies of the file list, and
# they silently diverged once already: fifteen modules (the whole STEM
# Lab, TTS, and the drill layer) were in the bundle but absent from
# index.html, so those features were dead on the live site while the
# bundle tested clean. Never again.
MISSING=""
for script in "${SCRIPTS[@]}"; do
  if ! grep -q "<script src=\"$script\"></script>" "$INPUT"; then
    MISSING="$MISSING\n  MISSING FROM index.html: $script"
  fi
done
if [ -n "$MISSING" ]; then
  echo ""
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "!!  index.html is MISSING script tags that build.sh bundles."
  echo "!!  The live site will not load these files."
  echo -e "$MISSING"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo ""
fi

# Count lines
LINES=$(wc -l < "$OUTFILE")
SIZE=$(du -h "$OUTFILE" | cut -f1)

echo ""
echo "Build complete!"
echo "  Output: $OUTFILE"
echo "  Lines:  $LINES"
echo "  Size:   $SIZE"
echo ""
echo "Open dist/bundle.html in your browser to run offline."
