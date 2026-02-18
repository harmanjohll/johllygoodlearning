// ============================================================
//  UTILS — Helper functions used throughout the app
// ============================================================

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatNumber(n) {
  return n.toLocaleString();
}

function generateMCQOptions(correct, min, max, count) {
  const options = new Set([correct]);
  let safety = 0;
  while (options.size < count && safety < 50) {
    const opt = rand(Math.max(0, min), max);
    if (opt !== correct) options.add(opt);
    safety++;
  }
  return shuffle([...options]);
}

function debounce(fn, ms) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}
