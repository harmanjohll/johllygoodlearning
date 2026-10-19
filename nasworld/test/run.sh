#!/bin/bash
# Runs every Nasworld test suite against the freshly built bundle.
#
# A suite passes only if it exits cleanly AND prints its "N passed,
# 0 failed" summary. The suites ignore "Cannot set/read property" errors
# from the DOM stub, and that same handler also swallows a real crash
# partway through: the run stops early and exits 0. Without the summary
# check, such a run counted as a pass.
cd "$(dirname "$0")/.." || exit 1
bash build.sh > /dev/null 2>&1
fail=0
for t in test/*.test.js; do
  echo "--- $t"
  out=$(node "$t" 2>/dev/null)
  code=$?
  echo "$out" | tail -2
  if [ $code -ne 0 ] || ! echo "$out" | grep -qE '[0-9]+ passed, 0 failed'; then
    echo "    ^ FAILED, or stopped before the end"
    fail=1
  fi
done
exit $fail
