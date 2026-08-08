#!/bin/sh
# GeoGames tests. Run from the geogames directory:  ./test/run.sh
#
# Only the geometry engine is covered here, because it is the part where a bug
# is silent: a wrong projection still draws something, it just draws it in the
# wrong place. The games and screens are checked by playing them.
set -e
cd "$(dirname "$0")/.."
node test/geo.test.mjs
