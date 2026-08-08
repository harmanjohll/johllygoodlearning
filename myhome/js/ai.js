/* =============================================================================
   MyHome — AI consultant
   -----------------------------------------------------------------------------
   Two providers, both called straight from the browser with a key the user
   supplies. Nothing is proxied, nothing is stored anywhere but this browser's
   localStorage, and no plan data leaves the machine unless you press one of
   the AI buttons.

   The prompts always carry the deterministic advisor findings, so the model
   critiques a plan it has been told the real measurements of rather than
   guessing from a description.
   ========================================================================== */
window.MH = window.MH || {};

MH.AI = (function () {
  const KEY = 'myhome.ai';
  const LEGACY_GEMINI = 'jgl.geminiKey';   // shared with the rest of this repo

  const MODELS = {
    anthropic: [
      { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', note: 'Best balance of speed and judgement. Recommended.' },
      { id: 'claude-opus-5', name: 'Claude Opus 5', note: 'Slower, strongest reasoning. Use for the full scheme review.' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', note: 'Fastest and cheapest. Good for quick questions.' }
    ],
    gemini: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', note: 'Fast and inexpensive.' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', note: 'Slower, better on long reasoning.' }
    ]
  };

  function config() {
    let c = {};
    try { c = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { c = {}; }
    if (!c.geminiKey) { const legacy = localStorage.getItem(LEGACY_GEMINI); if (legacy) c.geminiKey = legacy; }
    c.provider = c.provider || (c.anthropicKey ? 'anthropic' : 'gemini');
    c.model = c.model || (c.provider === 'anthropic' ? 'claude-sonnet-5' : 'gemini-2.5-flash');
    return c;
  }
  function setConfig(patch) {
    const c = Object.assign(config(), patch);
    localStorage.setItem(KEY, JSON.stringify(c));
    if (c.geminiKey) { try { localStorage.setItem(LEGACY_GEMINI, c.geminiKey); } catch (e) {} }
    return c;
  }
  function hasKey() {
    const c = config();
    return c.provider === 'anthropic' ? !!c.anthropicKey : !!c.geminiKey;
  }

  /* --------------------------------------------------------------- CALL --- */
  async function ask({ system, messages, temperature = 0.7, maxTokens = 2000, model, provider }) {
    const c = config();
    provider = provider || c.provider;
    model = model || c.model;
    if (provider === 'anthropic') return callAnthropic({ system, messages, temperature, maxTokens, model, key: c.anthropicKey });
    return callGemini({ system, messages, temperature, maxTokens, model, key: c.geminiKey });
  }

  async function withRetry(fn) {
    let lastErr;
    for (let i = 0; i < 2; i++) {
      try { return await fn(); }
      catch (e) {
        lastErr = e;
        if (/401|403|invalid|api key/i.test(e.message)) throw e;
        await new Promise(r => setTimeout(r, 900 * (i + 1)));
      }
    }
    throw lastErr;
  }

  async function callAnthropic({ system, messages, temperature, maxTokens, model, key }) {
    if (!key) throw new Error('No Anthropic key. Open Settings and add one.');
    return withRetry(async () => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: model || 'claude-sonnet-5',
          max_tokens: maxTokens,
          temperature,
          system,
          messages: messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
        })
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(friendly(res.status, body, 'Anthropic'));
      }
      const data = await res.json();
      return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    });
  }

  async function callGemini({ system, messages, temperature, maxTokens, model, key }) {
    if (!key) throw new Error('No Gemini key. Open Settings and add one.');
    return withRetry(async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.5-flash'}:generateContent?key=${encodeURIComponent(key)}`;
      const body = {
        contents: messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { temperature, maxOutputTokens: maxTokens },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
        ]
      };
      if (system) body.systemInstruction = { parts: [{ text: system }] };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(friendly(res.status, t, 'Gemini'));
      }
      const data = await res.json();
      const cand = data.candidates && data.candidates[0];
      if (!cand) throw new Error('Gemini returned nothing. Try rephrasing.');
      if (cand.finishReason === 'SAFETY') throw new Error('That was blocked by the safety filter. Try rephrasing.');
      return (cand.content && cand.content.parts || []).map(p => p.text).filter(Boolean).join('\n').trim();
    });
  }

  function friendly(status, body, who) {
    if (status === 401 || status === 403) return `${who} rejected the key. Check it in Settings.`;
    if (status === 429) return `${who} is rate limiting. Wait a moment and try again, or shorten the request.`;
    if (status >= 500) return `${who} is having a moment (${status}). Try again shortly.`;
    let msg = '';
    try { const j = JSON.parse(body); msg = (j.error && (j.error.message || j.error.status)) || ''; } catch (e) {}
    return `${who} error ${status}${msg ? ': ' + msg.slice(0, 200) : ''}`;
  }

  /* ------------------------------------------------------------- CONTEXT --- */
  const VOICE = `You are a senior interior architect advising on a private home in Singapore.

How you write:
- Warm and professional. Specific, never generic. You are a consultant, not a salesperson.
- Give a recommendation, not a survey of options. If you are unsure, say what you would need to know.
- Use millimetres for dimensions and metres for room sizes. Singapore dollars for money, stated as ranges.
- No emoji. No em dashes or hyphens joining clauses; use commas, semicolons and colons.
- Never invent a measurement. Every number you give must either come from the plan you were sent, or be labelled as a rule of thumb.
- Be honest about trade-offs. If an idea will cost a lot for a small gain, say so.

What you know about the context:
- The home is a Singapore HDB flat. Hot and humid all year, 25 to 32 degrees, 70 to 90% relative humidity.
- Structural reinforced concrete walls and the household shelter cannot be altered. This is not negotiable and is enforced by HDB and the Civil Defence Shelter Act.
- Non structural brick and drywall partitions can be removed with an HDB permit and a registered renovation contractor.
- Ceiling height is typically 2.6 m, dropping to about 2.4 m under aircon bulkheads.
- Materials must survive humidity. Solid hardwood moves; engineered timber, porcelain, terrazzo and sintered stone do not.`;

  function planContext(state, opts) {
    opts = opts || {};
    const a = MH.Advisor.run(state);
    const st = MH.STYLES.find(s => s.id === state.style);
    const L = [];
    L.push(`PLAN: ${state.meta.name}`);
    L.push(`Type: ${state.meta.unitType}. Ceiling ${state.meta.ceiling} mm. Gross internal ${a.stats.gross.label}.`);
    L.push(`Declared style direction: ${st ? st.name + ' (' + st.tagline + ')' : 'none chosen'}`);
    L.push('');
    L.push('ROOMS (id, name, width x depth mm, area, floor finish):');
    a.stats.rooms.forEach(r => L.push(`  ${r.id} | ${r.name} | ${Math.round(r.w)} x ${Math.round(r.d)} | ${r.area.sqm} m² | ${r.floor}`));
    L.push('');
    L.push('WALLS (id, type, hackable, length mm, from -> to):');
    state.walls.forEach(w => {
      const T = MH.Store.wallType(w);
      L.push(`  ${w.id} | ${T.name} | ${T.hackable ? 'HACKABLE' : 'LOCKED'} | ${Math.round(MH.G.wallLen(w))} | (${w.x1},${w.y1}) -> (${w.x2},${w.y2})${w.demolished ? ' | MARKED FOR DEMOLITION' : ''}`);
    });
    L.push('');
    L.push('OPENINGS (type, width mm, on wall):');
    state.openings.forEach(o => L.push(`  ${o.label || o.id} | ${o.type} | ${o.w} | ${o.wallId}`));
    L.push('');
    L.push('FURNITURE now placed (room | item | w x d mm | centre x,y | rotation):');
    state.items.forEach(it => {
      const r = MH.G.roomAt(state.rooms, it.x, it.y);
      L.push(`  ${r ? r.name : 'outside'} | ${it.name} [${it.catId}] | ${it.w} x ${it.d} | ${Math.round(it.x)},${Math.round(it.y)} | ${it.rot || 0}deg`);
    });
    L.push('');
    L.push('AUTOMATED CHECKS already run on this plan:');
    a.issues.slice(0, 26).forEach(i => L.push(`  [${i.level}] ${i.title} — ${i.detail}`));
    L.push('');
    L.push(`SCORES: overall ${a.scores.overall}, circulation ${a.scores.circulation}, ergonomics ${a.scores.ergonomics}, daylight ${a.scores.daylight}, compliance ${a.scores.compliance}`);
    if (opts.budget) {
      L.push('');
      L.push(`INDICATIVE BUDGET as drawn: S$${a.budget.lo.toLocaleString()} to S$${a.budget.hi.toLocaleString()}`);
    }
    return L.join('\n');
  }

  function catalogContext(filterCats) {
    const rows = MH.CATALOG
      .filter(c => !filterCats || filterCats.includes(c.cat))
      .map(c => `${c.id} | ${c.name} | ${c.w}x${c.d}x${c.h}`);
    return 'AVAILABLE CATALOGUE ITEMS (id | name | w x d x h mm). You may only use these ids:\n' + rows.join('\n');
  }

  /* -------------------------------------------------------------- ACTIONS --- */

  async function critique(state) {
    const sys = VOICE + `

Your task: review this floor plan and layout as a consultant would at the first design meeting. Do not repeat the automated checks back verbatim; you have them so you do not waste words re-finding what is already known. Add the judgement a checklist cannot make.

Structure your reply in markdown with these headings exactly:
## What is working
## What I would change first
## The three moves with the biggest payoff
## What this costs you
## What I would need to know

Keep the whole reply under 700 words. Be concrete: name rooms, give millimetres, name the wall ids you would remove.`;
    return ask({
      system: sys, maxTokens: 2200, temperature: 0.65,
      messages: [{ role: 'user', content: planContext(state, { budget: true }) }]
    });
  }

  async function styleAdvice(state, styleId, brief) {
    const st = MH.STYLES.find(s => s.id === styleId) || MH.STYLES[0];
    const sys = VOICE + `

Your task: turn a declared style direction into a buildable specification for this specific flat. You have the house style pack below as a starting point; improve on it for this plan, do not just restate it.

Structure your reply in markdown with these headings exactly:
## The idea in one paragraph
## Palette, room by room
## Materials and where they go
## Lighting
## Three things to spend on, three to save on
## What would go wrong in Singapore

Give paint colours as a name plus an approximate hex, and say which wall gets what. Under 750 words.`;
    const pack = `STYLE PACK: ${st.name}
${st.tagline}
Origin: ${st.origin}
Palette: ${st.palette.map(p => `${p.name} ${p.hex} (${p.role}, LRV ${p.lrv})`).join('; ')}
Woods: ${st.woods.join(', ')}
Surfaces: ${st.surfaces.join(', ')}
Metals: ${st.metals.join(', ')}
Textiles: ${st.textiles.join(', ')}
Lighting: ${st.lighting.temp}, CRI ${st.lighting.cri}. ${st.lighting.notes}
Do: ${st.dos.join(' ')}
Do not: ${st.donts.join(' ')}
Singapore notes: ${st.sgNotes}`;
    return ask({
      system: sys, maxTokens: 2400, temperature: 0.75,
      messages: [{ role: 'user', content: planContext(state) + '\n\n' + pack + (brief ? '\n\nCLIENT BRIEF: ' + brief : '') }]
    });
  }

  async function roomBrief(state, roomId, brief) {
    const r = MH.Store.room(roomId);
    const sys = VOICE + `

Your task: a focused design note on one room. Cover layout, storage, lighting, materials and one idea the client will not have thought of. Give at least four specific dimensions. Under 500 words. Markdown, no top-level heading.`;
    return ask({
      system: sys, maxTokens: 1600, temperature: 0.7,
      messages: [{ role: 'user', content: planContext(state) + `\n\nFOCUS ON: ${r ? r.name + ' (' + r.id + ')' : roomId}` + (brief ? '\nCLIENT NOTE: ' + brief : '') }]
    });
  }

  async function chat(state, history, question) {
    const sys = VOICE + `

You are answering questions about the plan below. Answer the question asked, using the plan's real numbers. If the answer depends on something not in the plan, say what you would need. Keep it under 350 words unless asked for more.`;
    const msgs = [{ role: 'user', content: 'Here is the current plan for reference.\n\n' + planContext(state, { budget: true }) }];
    msgs.push({ role: 'assistant', content: 'Understood. I have the plan, the automated checks and the budget. What would you like to work through?' });
    history.slice(-8).forEach(m => msgs.push({ role: m.role, content: m.content }));
    msgs.push({ role: 'user', content: question });
    return ask({ system: sys, maxTokens: 1400, temperature: 0.7, messages: msgs });
  }

  /* Structured layout generation. Returns { add:[], remove:[], notes } already
     validated against the catalogue and clamped inside the room. */
  async function layoutRoom(state, roomId, brief) {
    const r = MH.Store.room(roomId);
    if (!r) throw new Error('Pick a room first.');
    const existing = state.items.filter(i => { const rr = MH.G.roomAt(state.rooms, i.x, i.y); return rr && rr.id === roomId; });
    const doors = state.openings.filter(o => {
      const w = MH.Store.wall(o.wallId); if (!w) return false;
      const c = MH.G.pointAlong(w, o.pos), v = MH.G.wallVec(w);
      return [1, -1].some(s => MH.G.pointInRect(c.x + v.nx * s * 400, c.y + v.ny * s * 400, r));
    });

    const sys = VOICE + `

Your task: lay out one room and return ONLY machine-readable JSON. No prose, no markdown fences, no commentary outside the JSON.

Coordinate system: millimetres, x increases to the right, y increases downwards, exactly as given. An item's x,y is its CENTRE. rot is degrees clockwise; 0 means the item faces up the page (towards smaller y), 90 means it faces right.

Rules you must obey:
- Every item must sit entirely inside the room rectangle you are given, with at least 100 mm to each wall unless the item is meant to be against a wall, in which case put its edge on the wall face.
- Leave a walking route at least 900 mm wide from every door into the room.
- Do not overlap items. Rugs may sit under furniture; nothing else may.
- Respect the clearances stated for each item in the catalogue notes.
- Use only catalogue ids from the list given.

Return exactly this shape:
{"notes":"one or two sentences on the thinking","replace":true,"add":[{"catId":"sofa3","x":4200,"y":10500,"rot":180,"why":"short reason"}]}

"replace":true means the existing items in this room should be cleared first. Set it to false if you are only adding to what is there.`;

    const ctx = `ROOM TO LAY OUT
id: ${r.id}
name: ${r.name}
rectangle: x from ${Math.min(r.x1, r.x2)} to ${Math.max(r.x1, r.x2)}, y from ${Math.min(r.y1, r.y2)} to ${Math.max(r.y1, r.y2)}
size: ${Math.abs(r.x2 - r.x1)} x ${Math.abs(r.y2 - r.y1)} mm, ${MH.U.area(MH.G.rectArea(r)).sqm} m²

DOORS AND OPENINGS INTO THIS ROOM:
${doors.length ? doors.map(o => {
      const w = MH.Store.wall(o.wallId); const c = MH.G.pointAlong(w, o.pos);
      return `  ${o.label || o.id} | ${o.type} | width ${o.w} | at (${Math.round(c.x)},${Math.round(c.y)})`;
    }).join('\n') : '  none recorded'}

WINDOWS ON THIS ROOM:
${state.openings.filter(o => o.type === 'window').map(o => {
      const w = MH.Store.wall(o.wallId); if (!w) return null;
      const c = MH.G.pointAlong(w, o.pos);
      if (!MH.G.pointInRect(c.x, c.y, { x1: r.x1 - 400, y1: r.y1 - 400, x2: r.x2 + 400, y2: r.y2 + 400 })) return null;
      return `  ${o.label || o.id} | width ${o.w} | at (${Math.round(c.x)},${Math.round(c.y)})`;
    }).filter(Boolean).join('\n') || '  none'}

CURRENTLY IN THIS ROOM:
${existing.length ? existing.map(i => `  ${i.catId} "${i.name}" ${i.w}x${i.d} at ${Math.round(i.x)},${Math.round(i.y)} rot ${i.rot || 0}`).join('\n') : '  empty'}

STYLE DIRECTION: ${(MH.STYLES.find(s => s.id === state.style) || {}).name || 'unspecified'}
${brief ? 'CLIENT BRIEF: ' + brief : ''}

${catalogContext()}`;

    const raw = await ask({ system: sys, maxTokens: 2600, temperature: 0.55, messages: [{ role: 'user', content: ctx }] });
    return parseLayout(raw, r);
  }

  function parseLayout(raw, r) {
    let txt = (raw || '').trim();
    txt = txt.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const s = txt.indexOf('{'), e = txt.lastIndexOf('}');
    if (s < 0 || e < 0) throw new Error('The model did not return usable JSON. Try again, or switch model in Settings.');
    let obj;
    try { obj = JSON.parse(txt.slice(s, e + 1)); }
    catch (err) { throw new Error('The model returned malformed JSON. Try again.'); }

    const x1 = Math.min(r.x1, r.x2), x2 = Math.max(r.x1, r.x2);
    const y1 = Math.min(r.y1, r.y2), y2 = Math.max(r.y1, r.y2);
    const add = (obj.add || []).map(a => {
      const c = MH.Store.catalogById(a.catId);
      if (!c) return null;
      const w = Number(a.w) || c.w, d = Number(a.d) || c.d;
      const rot = ((Number(a.rot) || 0) % 360 + 360) % 360;
      const swap = rot === 90 || rot === 270;
      const halfW = (swap ? d : w) / 2, halfD = (swap ? w : d) / 2;
      return {
        catId: a.catId,
        x: Math.max(x1 + halfW, Math.min(x2 - halfW, Number(a.x) || (x1 + x2) / 2)),
        y: Math.max(y1 + halfD, Math.min(y2 - halfD, Number(a.y) || (y1 + y2) / 2)),
        rot, w, d,
        note: String(a.why || '').slice(0, 200)
      };
    }).filter(Boolean);
    if (!add.length) throw new Error('The model returned no placeable items. Try a more specific brief.');
    return { notes: String(obj.notes || '').slice(0, 400), replace: obj.replace !== false, add };
  }

  /* A palette proposal the app can apply directly to rooms and items. */
  async function paletteFor(state, brief) {
    const sys = VOICE + `

Your task: propose a colour and material scheme for this flat and return ONLY JSON, no prose outside it.

Return exactly:
{"name":"scheme name","rationale":"two sentences","rooms":[{"roomId":"r-living","floor":"porcelain-lf","wall":"#F2EFE8","wallName":"Chalk"}],"accent":"#B98C6E","wood":"#C9A87C","metal":"#3A3733","soft":"#DCD5C7"}

Valid floor material ids: ${MH.MATERIALS.filter(m => m.cat === 'Floor').map(m => m.id).join(', ')}.
Use the real roomId values from the plan. Every room must appear once.`;
    const raw = await ask({
      system: sys, maxTokens: 1600, temperature: 0.8,
      messages: [{ role: 'user', content: planContext(state) + (brief ? '\n\nCLIENT BRIEF: ' + brief : '') }]
    });
    let txt = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const s = txt.indexOf('{'), e = txt.lastIndexOf('}');
    if (s < 0) throw new Error('The model did not return usable JSON.');
    const obj = JSON.parse(txt.slice(s, e + 1));
    obj.rooms = (obj.rooms || []).filter(r => MH.Store.room(r.roomId));
    return obj;
  }

  async function testKey() {
    const t = await ask({ system: 'Reply with the single word: ready', maxTokens: 20, temperature: 0, messages: [{ role: 'user', content: 'ping' }] });
    return t;
  }

  return { config, setConfig, hasKey, ask, MODELS, VOICE, planContext, critique, styleAdvice, roomBrief, chat, layoutRoom, paletteFor, testKey };
})();
