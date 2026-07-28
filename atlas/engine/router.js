/* ===========================================================================
   Family Atlas — Tiny hash router
   Keeps the browser Back button meaningful across screens (home / setup / play
   / passport) without a framework. Screens register a render function per route.
   =========================================================================== */

export const Router = {
  routes: [],
  _current: null,

  on(pattern, handler) {
    // pattern like 'game/:id' -> regex with named params
    const keys = [];
    const rx = new RegExp('^' + pattern.replace(/:[^/]+/g, m => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
    this.routes.push({ rx, keys, handler });
    return this;
  },

  start() {
    window.addEventListener('hashchange', () => this._resolve());
    this._resolve();
  },

  go(path) {
    if (('#/' + path) === window.location.hash) this._resolve();
    else window.location.hash = '/' + path;
  },

  current() { return this._current; },

  _resolve() {
    const path = (window.location.hash || '#/home').replace(/^#\//, '');
    for (const r of this.routes) {
      const m = path.match(r.rx);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
        this._current = { path, params };
        r.handler(params);
        return;
      }
    }
    // Unknown route -> home
    if (path !== 'home') this.go('home');
  },
};
