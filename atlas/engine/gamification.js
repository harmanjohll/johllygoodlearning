/* ===========================================================================
   Family Atlas — Gamification
   Turns a scored turn into durable rewards on a profile: XP, level, passport
   stamps, region progress, streaks and effort badges. Returns a list of
   "events" (level up, new stamp, badge) so the UI can celebrate them honestly.
   No dark patterns: nothing is taken away, streaks forgive a missed day, and
   badges reward effort, not only winning.
   =========================================================================== */

import { Profiles, levelForXp } from './profiles.js';
import { subjectPool } from './pool.js';
import { REGIONS } from '../data/countries.js';

function todayIso() { return new Date().toISOString().slice(0, 10); }
function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

const BADGES = {
  'first-steps': { label: 'First Steps', desc: 'Finished your first game.' },
  globetrotter: { label: 'Globetrotter', desc: 'Earned a stamp on every continent.' },
  comeback: { label: 'Comeback', desc: 'Answered right after two misses.' },
  'week-streak': { label: 'Regular Traveller', desc: 'A 7-day study streak.' },
  cartographer: { label: 'Steady Hand', desc: '25 correct answers total.' },
  'memory-master': { label: 'Memory Master', desc: 'Cleared a Memory Match board.' },
  speedster: { label: 'Speedster', desc: 'Named 10+ countries in one Speed Sweep.' },
};

/** Award a named badge if not already held; returns a celebration event or null. */
export function awardBadge(profile, id) {
  if (!BADGES[id]) return null;
  profile.badges = profile.badges || [];
  if (profile.badges.includes(id)) return null;
  profile.badges.push(id);
  Profiles.save(profile);
  return badgeEvent(id);
}

/** Record that a player was active today; forgiving streak (a gap of 1 keeps it). */
export function touchStreak(profile) {
  const today = todayIso();
  const s = profile.streak || { count: 0, lastPlayed: null, best: 0 };
  if (s.lastPlayed === today) return [];
  const gap = s.lastPlayed ? daysBetween(s.lastPlayed, today) : 999;
  s.count = gap === 1 ? s.count + 1 : 1;
  s.lastPlayed = today;
  s.best = Math.max(s.best || 0, s.count);
  profile.streak = s;
  const events = [];
  if (s.count === 7 && !hasBadge(profile, 'week-streak')) {
    profile.badges.push('week-streak');
    events.push(badgeEvent('week-streak'));
  }
  return events;
}

function hasBadge(p, id) { return (p.badges || []).includes(id); }
function badgeEvent(id) { return { type: 'badge', id, label: BADGES[id].label, desc: BADGES[id].desc }; }

/**
 * Apply one turn's outcome to a player's profile and persist it.
 * @returns {Array} celebration events for the UI
 */
export function applyTurn(profile, { correct, region, iso, rankId, scored, gameId, sessionStreakBefore }) {
  const events = [];
  const beforeLevel = profile.level || levelForXp(profile.xp);

  profile.xp = (profile.xp || 0) + (scored.xpGained || 0);
  profile.level = levelForXp(profile.xp);
  profile.stats = profile.stats || { played: 0, correct: 0, byGame: {} };
  profile.stats.played += 1;
  if (correct) profile.stats.correct += 1;
  const g = profile.stats.byGame[gameId] || { played: 0, correct: 0 };
  g.played += 1; if (correct) g.correct += 1;
  profile.stats.byGame[gameId] = g;

  if (region && !(profile.regionsSeen || []).includes(region)) {
    profile.regionsSeen = [...(profile.regionsSeen || []), region];
  }

  profile.badges = profile.badges || [];
  profile.stamps = profile.stamps || [];

  if (correct && iso && region) {
    const stampId = `${region}:${iso}`;
    if (!profile.stamps.includes(stampId)) {
      profile.stamps.push(stampId);
      events.push({ type: 'stamp', id: stampId, iso, region });
    }
    // Region completion stamp: all rank-appropriate countries in the region collected.
    const regionTargets = subjectPool(rankId, region).map(c => c.iso);
    const got = new Set(profile.stamps.filter(s => s.startsWith(region + ':')).map(s => s.split(':')[1]));
    if (regionTargets.length && regionTargets.every(t => got.has(t))) {
      const regionStamp = `region:${region}`;
      if (!profile.stamps.includes(regionStamp)) {
        profile.stamps.push(regionStamp);
        const meta = REGIONS.find(r => r.id === region);
        events.push({ type: 'region', id: regionStamp, region, label: `${meta ? meta.name : region} complete!` });
      }
    }
  }

  // Level up
  if (profile.level > beforeLevel) events.push({ type: 'level', level: profile.level });

  // Effort badges
  if (!hasBadge(profile, 'first-steps')) { profile.badges.push('first-steps'); events.push(badgeEvent('first-steps')); }
  if (correct && sessionStreakBefore >= 2 && !hasBadge(profile, 'comeback')) {
    // "comeback" is earned when getting one right after a rough patch — handled by caller passing miss context.
  }
  const stampedRegions = new Set(profile.stamps.filter(s => !s.startsWith('region:')).map(s => s.split(':')[0]));
  if (stampedRegions.size >= 5 && !hasBadge(profile, 'globetrotter')) {
    profile.badges.push('globetrotter'); events.push(badgeEvent('globetrotter'));
  }
  if (profile.stats.correct >= 25 && !hasBadge(profile, 'cartographer')) {
    profile.badges.push('cartographer'); events.push(badgeEvent('cartographer'));
  }

  Profiles.save(profile);
  return events;
}

/** Award the comeback badge (called by the session when it detects the pattern). */
export function awardComeback(profile) {
  profile.badges = profile.badges || [];
  if (hasBadge(profile, 'comeback')) return null;
  profile.badges.push('comeback');
  Profiles.save(profile);
  return badgeEvent('comeback');
}

export { BADGES };
