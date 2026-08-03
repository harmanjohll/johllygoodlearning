#!/bin/bash
# Runs every Nasworld test suite against the freshly built bundle.
cd "$(dirname "$0")/.." || exit 1
bash build.sh > /dev/null 2>&1
fail=0
for t in test/*.test.js; do
  echo "--- $t"
  node "$t" 2>/dev/null | tail -2
  node "$t" > /dev/null 2>&1 || fail=1
done
exit $fail
