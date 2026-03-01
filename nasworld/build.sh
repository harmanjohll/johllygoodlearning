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
  "src/math/math-render.js"
  "src/word/word-gen.js"
  "src/word/word-render.js"
  "src/stem/science-gen.js"
  "src/stem/science-sim.js"
  "src/stem/code-engine.js"
  "src/stem/code-levels.js"
  "src/challenges/star-trials.js"
  "src/challenges/escape-rooms.js"
  "src/ui/topbar.js"
  "src/ui/feedback.js"
  "src/ui/garden.js"
  "src/ui/home.js"
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
  # Part 1: Everything before the first <script src= line
  awk '/<script src=/{exit} {print}' "$INPUT"

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
