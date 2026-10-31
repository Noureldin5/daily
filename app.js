"use strict";
// Daily: habits, routine, training, dhikr and learning in one offline app.
// All data stays in this browser (localStorage). Use Settings > Backup to move it.

const KEY = "daily.v1";
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = n => Number(n).toLocaleString("en-US");

// ---------- storage ----------
const DB_VERSION = 2;
function seed() {
  return {
    v: DB_VERSION,
    settings: { classes: "4", push: "100", eq: "home", pin: null, salt: null, lastBackup: null,
      show: { reminder: true, quote: true, breathing: true }, quoteCats: ["discipline", "craft", "learning", "training"] },
    habits: DEFAULT_HABITS.map(h => ({ ...h })),
    routine: DEFAULT_ROUTINE.map(r => ({ ...r })),
    dhikr: DEFAULT_DHIKR.map(d => ({ ...d, total: 0 })),
    topics: [],
    favs: [],
    lifts: {},
    focus: null,
    days: {}
  };
}
const isObj = x => x && typeof x === "object" && !Array.isArray(x);

// One path for loading and importing: validate the shape, fill gaps, upgrade old versions.
// Throws if the data isn't a Daily backup. Never renames or removes anything the user made.
function migrate(d) {
  if (!isObj(d) || !Array.isArray(d.habits) || !isObj(d.days)) throw new Error("not a Daily backup");
  const s = seed();
  const out = { ...s, ...d, settings: { ...s.settings, ...(isObj(d.settings) ? d.settings : {}) } };
  out.settings.show = { ...s.settings.show, ...(isObj(out.settings.show) ? out.settings.show : {}) };
  if (!Array.isArray(out.settings.quoteCats)) out.settings.quoteCats = s.settings.quoteCats;
  out.habits = d.habits.filter(h => isObj(h) && h.id && typeof h.name === "string" && GROUPS.some(g => g.id === h.g));
  for (const k of ["routine", "dhikr", "topics", "favs"]) if (!Array.isArray(out[k])) out[k] = s[k];
  out.routine = out.routine.filter(r => isObj(r) && typeof r.t === "string" && typeof r.x === "string");
  out.dhikr = out.dhikr.filter(z => isObj(z) && z.id && z.target > 0).map(z => ({ ...z, total: +z.total || 0 }));
  out.topics = out.topics.filter(t => isObj(t) && t.id && t.name);
  if (!isObj(out.lifts)) out.lifts = {};
  for (const k of Object.keys(out.days)) {
    const x = out.days[k];
    if (!isObj(x) || !/^\d{4}-\d{2}-\d{2}$/.test(k)) { delete out.days[k]; continue; }
    for (const f of ["h", "w", "z", "l", "b"]) if (!isObj(x[f])) x[f] = {};
    if (!["green", "yellow", "red"].includes(x.r)) x.r = "green";
  }
  // Defaults added in a newer version are appended once, as optional so old scores don't change.
  if ((d.v || 1) < DB_VERSION) {
    for (const h of DEFAULT_HABITS) if (h.since > (d.v || 1) && !out.habits.some(x => x.id === h.id)) out.habits.push({ ...h, opt: true });
  }
  out.v = DB_VERSION;
  return out;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrate(JSON.parse(raw)) : seed();
  } catch (e) {
    // Unreadable data: keep a copy before the next save() replaces it
    try { const raw = localStorage.getItem(KEY); if (raw) localStorage.setItem(KEY + ".corrupt", raw); } catch (er) {}
    return seed();
  }
}
let DB = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(DB)); }
  catch (e) { toast("Couldn't save. Browser storage is full or blocked."); }
}

// ---------- dates ----------
const pad = n => String(n).padStart(2, "0");
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dateOf = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = dateOf(k); d.setDate(d.getDate() + n); return keyOf(d); };
const todayKey = () => keyOf(new Date());
const wdIdx = k => (dateOf(k).getDay() + 6) % 7; // Monday = 0
const DAYN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const peek = k => DB.days[k] || {};
const day = k => (DB.days[k] ||= { h: {}, w: {}, z: {}, l: {}, b: {}, r: "green" });

// ---------- state ----------
const st = { tab: "today", date: todayKey(), dsel: 0, track: "code", editRoutine: false, confirm: null, bumpR: 0, bumpQ: 0, bm: "calm", bn: 0, tasbih: false, busy: false, breathDone: null };
try { st.tab = sessionStorage.getItem("tab") || "today"; } catch (e) {}

// Which <details> the user opened or closed. Only differences from the default are kept.
try { st.open = JSON.parse(localStorage.getItem("daily.open") || "{}"); } catch (e) { st.open = {}; }
const isOpen = (key, dflt) => key in st.open ? st.open[key] : dflt;
const detailsAttr = (key, dflt) => `data-open="${esc(key)}" data-def="${dflt ? 1 : 0}"${isOpen(key, dflt) ? " open" : ""}`;
document.addEventListener("toggle", e => {
  const el = e.target, key = el.dataset && el.dataset.open;
  if (!key) return;
  if (el.open === (el.dataset.def === "1")) delete st.open[key]; else st.open[key] = el.open;
  try { localStorage.setItem("daily.open", JSON.stringify(st.open)); } catch (er) {}
}, true);

// ---------- training ----------
function effWeek(i) {
  const d = { ...WEEK[i] };
  if (i === 1 && DB.settings.classes === "5") { d.cls = true; d.extra = null; d.five = true; }
  return d;
}
function wTag(d) {
  if (d.rest) return "Rest";
  if (d.cls && d.s) return "Class+" + d.s;
  if (d.cls) return "Class";
  return "Str " + d.s;
}
function trainBlocks(k) {
  const i = wdIdx(k), d = effWeek(i), r = peek(k).r || "green", set = DB.settings;
  const out = [];
  const mob = (id, when) => {
    const b = MOB[id];
    out.push({ id, when, title: b.name, time: b.min + " min", note: id === "kick" && r === "red" ? "Beat up: 30–40% effort, 3 rounds each." : b.note,
      items: b.items.map(([n, v]) => ex(n === "ROTATE" ? ROTATE[d.rot] : n, v)) });
  };
  const sets = it => {
    let s = it.s;
    if (r === "yellow" && ["power", "str", "hyp", "iso"].includes(it.t)) s = Math.max(2, s - 1);
    if (set.deload) s = Math.max(1, Math.ceil(s / 2));
    return s;
  };
  const exItem = it => {
    let n = it.n, c = it.c, rr = it.r;
    if (set.eq === "gym" && it.g) { n = it.g.n; c = it.g.c; rr = it.g.r || rr; }
    return ex(n, sets(it) + "×" + rr, c);
  };

  mob("morning", "Right after waking");
  const pv = PUSH[i];
  if (pv) {
    if (r === "red") out.push({ id: "snacks", when: "Through the day", title: "Movement breaks", time: "3 × 5 min", note: "No push-ups today.", items: [ex("Easy walk or light joint circles", "3 × 5 min")] });
    else {
      let t = +set.push; if (d.s === "B" || d.s === "D") t /= 2; if (r === "yellow") t *= 0.6; if (set.deload) t *= 0.5;
      t = Math.max(20, Math.round(t / 10) * 10);
      const n = t <= 60 ? 3 : t <= 120 ? 4 : t <= 200 ? 5 : 6, per = Math.round(t / n), pull = Math.max(5, Math.round(per / 2));
      const items = [ex("Push-ups: " + pv.v, n + "×" + per, `About 60% effort, ${pv.tempo}. Stop 3+ reps before failure. ${t} total.`)];
      if (r === "green") items.push(ex("Hard set: " + pv.hard, pv.hr, "Once, when you feel fresh."));
      items.push(ex("Band row or pull-apart", n + "×" + pull, "One pull rep for every two push reps."));
      if (pv.leg) items.push(ex(pv.leg[0], pv.leg[1]));
      out.push({ id: "snacks", when: "Through the day", title: "Push-up practice", time: n + " mini-sets", note: (d.s === "B" || d.s === "D") ? "Halved today because of the upper-body session." : "Spread between work, study and meals.", items });
    }
  }
  if (d.s) {
    const s = S[d.s], when = d.cls ? "Morning, 6 h before class" : "Main session";
    if (r === "red") out.push({ id: "session", when, title: "Skip " + s.name.split(":")[0], time: "15 min", open: true, items: [ex("Easy walk, nasal breathing", "15 min"), ex("Move this session to your next free day, or skip it", "")] });
    else {
      out.push({ id: "session", when, title: s.name, time: (r === "yellow" ? s.min - 10 : s.min) + " min", open: true,
        note: s.warm + (d.five ? " Class tonight too: keep the roll technical." : ""),
        items: s.items.filter(it => !(r === "yellow" && it.opt)).map(exItem) });
      if (!d.cls) mob("postStr", "Right after");
    }
  }
  if (d.extra === "L" && r !== "red") out.push({ id: "light", when: "Afternoon", title: S.L.name, time: S.L.min + " min", note: S.L.note, items: S.L.items.map(exItem) });
  if (d.extra === "kick") mob("kick", "Evening");
  if (d.cls) {
    out.push({ id: "class", when: "Evening", title: "Class", time: "1.5 h", open: true,
      items: [ex({ green: "Train as normal. Water with a pinch of salt.", yellow: "Drill and flow roll. Skip the hardest rounds.", red: "Technique and drilling only, or rest." }[r], "")] });
    mob("postClass", "Right after");
  }
  if (d.rest) {
    out.push({ id: "walk", when: "Morning", title: "Walk", time: "30–45 min", open: true, items: [ex("Easy walk outside, nasal breathing", "30–45 min")] });
    mob("restore", "Afternoon");
    mob("deep", "Evening");
  }
  mob("night", "Before bed");
  const fk = d.rest ? "rest" : d.cls && d.s ? "bjjstr" : d.cls ? "bjj" : "str";
  return { blocks: out, d, fuel: FUEL[fk], r };
}
function ex(n, v, c) { return `<li><div class="ex"><span>${esc(n)}</span><span class="d">${esc(v)}</span></div>${c ? `<span class="cue">${esc(c)}</span>` : ""}</li>`; }
function trainProgress(k) {
  const { blocks } = trainBlocks(k), w = peek(k).w || {};
  const done = blocks.filter(b => w[b.id]).length;
  return { done, total: blocks.length };
}

// ---------- habits ----------
function dhikrToday(k) { const z = peek(k).z || {}; return Object.values(z).reduce((a, b) => a + b, 0); }
function learnToday(k) { const l = peek(k).l || {}; return Object.values(l).reduce((a, b) => a + b, 0); }
function isDone(h, k) {
  const p = peek(k);
  if (p.h && p.h[h.id]) return true;
  if (h.auto === "dhikr") return dhikrToday(k) >= 100;
  if (h.auto === "learn") return learnToday(k) > 0;
  if (h.auto === "breathe") return ((p.b || {}).n || 0) > 0;
  if (h.auto === "train") { const t = trainProgress(k); return t.total > 0 && t.done === t.total; }
  return false;
}
function score(k) {
  const hs = DB.habits.filter(h => !h.opt);
  if (!hs.length) return 0;
  return Math.round(100 * hs.filter(h => isDone(h, k)).length / hs.length);
}
function streak(h, k) {
  let n = 0, c = isDone(h, k) ? k : addDays(k, -1);
  while (isDone(h, c) && n < 999) { n++; c = addDays(c, -1); }
  return n;
}

// ---------- content: the day's reminder and quote ----------
const dayNum = k => { const [y, m, d] = k.split("-").map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 864e5); };
const gcd = (a, b) => b ? gcd(b, a % b) : a;
// Steps through the list by a number that shares no factor with its length, so every item
// shows once before any repeats. The date is the seed: same item all day, a new one tomorrow.
function pickIndex(n, k, bump) {
  let step = Math.max(1, Math.round(n * 0.618));
  while (gcd(step, n) !== 1) step++;
  return (((dayNum(k) * step + bump) % n) + n) % n;
}
const quotePool = () => QUOTES.filter(q => DB.settings.quoteCats.includes(q.cat));
const dayReminder = k => REMINDERS[pickIndex(REMINDERS.length, k, st.bumpR)];
const dayQuote = k => { const p = quotePool(); return p.length ? p[pickIndex(p.length, k, st.bumpQ)] : null; };
const isFav = id => DB.favs.includes(id);
const findItem = id => REMINDERS.find(r => r.id === id) || QUOTES.find(q => q.id === id);

// ---------- last third of the night (no internet: sun position for PLACE) ----------
function sunEvents(ms) {
  const rad = Math.PI / 180, solar = new Date(ms + PLACE.lon * 240000);
  const y = solar.getUTCFullYear(), m = solar.getUTCMonth(), d = solar.getUTCDate(), base = Date.UTC(y, m, d);
  const doy = Math.floor((base - Date.UTC(y, 0, 1)) / 864e5) + 1, g = 2 * Math.PI / 365 * (doy - 1 + 0.0);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const noon = 720 - 4 * PLACE.lon - eq, lat = PLACE.lat * rad;
  const hourAngle = alt => Math.acos((Math.sin(alt * rad) - Math.sin(lat) * Math.sin(dec)) / (Math.cos(lat) * Math.cos(dec))) / rad;
  return { maghrib: base + (noon + 4 * hourAngle(-0.833)) * 60000, fajr: base + (noon - 4 * hourAngle(-PLACE.fajrAngle)) * 60000 };
}
function inLastThird(now) {
  const ms = now.getTime(), today = sunEvents(ms);
  const [from, to] = ms < today.fajr ? [sunEvents(ms - 864e5).maghrib, today.fajr] : [today.maghrib, sunEvents(ms + 864e5).fajr];
  return ms >= from + (to - from) * 2 / 3 && ms < to;
}
// One short nudge for right now, most specific first. Habit-linked nudges hide once that habit is done.
function activeNudge(k) {
  if (k !== todayKey()) return null;
  const now = new Date(), wd = now.getDay(), h = now.getHours(), want = [];
  if (inLastThird(now)) want.push("lastThird");
  if (wd === 5) want.push("friday");
  if (wd === 1) want.push("monday");
  if (wd === 4) want.push("thursday");
  want.push(h < 11 ? "morning" : h >= 16 ? "evening" : "");
  for (const w of want) {
    const n = NUDGES.find(x => x.when === w); if (!n) continue;
    const habit = n.habit && habitOf(n.habit);
    if (n.habit && (!habit || isDone(habit, k))) continue;
    return n;
  }
  return null;
}

// ---------- screen wake lock (breathing, tasbih) ----------
const wake = { want: false, lock: null };
async function lockScreen() { try { if ("wakeLock" in navigator) wake.lock = await navigator.wakeLock.request("screen"); } catch (e) {} }
function wakeOn() { wake.want = true; lockScreen(); }
function wakeOff() { wake.want = false; try { wake.lock && wake.lock.release(); } catch (e) {} wake.lock = null; }
// the browser drops the lock whenever the page is hidden, so ask again when it comes back
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && wake.want) lockScreen(); });

// ---------- breathing ----------
const B = { run: null, timer: null };
const clock = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + pad(s % 60); };
const cycleSecs = m => m.steps.reduce((a, s) => a + s.secs, 0);
function breathWords(m, n) {
  const secs = n * cycleSecs(m), mins = secs / 60;
  return `${n} ${m.unit || "breaths"}, ${mins < 1.5 ? secs + " seconds" : Number.isInteger(mins) ? mins + " min" : "about " + Math.round(mins) + " min"}`;
}
function startBreath() {
  const mode = BREATH_MODES.find(x => x.id === st.bm) || BREATH_MODES[0], count = mode.lengths.includes(st.bn) ? st.bn : mode.dflt;
  B.run = { mode, count, cycle: cycleSecs(mode), total: cycleSecs(mode) * count, t0: performance.now(), phase: -1, breath: -1 };
  st.busy = true; st.breathDone = null; wakeOn();
  $("#view").innerHTML = breathSession(count); window.scrollTo(0, 0);
  breathTick(); B.timer = setInterval(breathTick, 100);
}
// Time comes from the clock, not from counting ticks, so a throttled or paused timer can't make a session run long or short.
function breathTick() {
  const r = B.run; if (!r) return;
  const el = (performance.now() - r.t0) / 1000;
  if (el >= r.total) return endBreath(true);
  const into = el % r.cycle, breath = Math.floor(el / r.cycle);
  let at = 0, i = 0;
  while (i < r.mode.steps.length - 1 && into >= at + r.mode.steps[i].secs) { at += r.mode.steps[i].secs; i++; }
  const step = r.mode.steps[i];
  if (breath !== r.breath || i !== r.phase) enterPhase(r, breath, i, step);
  $("#b-count").textContent = Math.ceil(at + step.secs - into);
  $("#b-left").textContent = clock(r.total - el);
}
function enterPhase(r, breath, i, step) {
  r.breath = breath; r.phase = i;
  const c = $("#b-circle");
  c.style.transition = `transform ${step.secs}s ease-in-out`;
  c.style.transform = `scale(${0.5 + 0.5 * step.size})`;
  $("#b-label").textContent = step.label;
  $("#b-n").textContent = breath + 1;
  $("#b-cue").textContent = step.cues ? step.cues[breath % step.cues.length] : "";
  if (DB.settings.buzz) buzz(25);
}
function stopBreath() {
  clearInterval(B.timer); B.run = null; st.busy = false; wakeOff();
}
function endBreath(completed) {
  const r = B.run; stopBreath();
  if (completed && r) {
    const b = day(todayKey()).b; b.n = (b.n || 0) + 1; b.s = (b.s || 0) + Math.round(r.total); save();
    st.breathDone = { name: r.mode.name, words: breathWords(r.mode, r.count) };
    buzz([80, 60, 80]);
  }
  render();
}
function breathSession(count) {
  return `<div class="bs" role="group" aria-label="Breathing session">
    <p class="muted small">Breath <span id="b-n">1</span> of ${count}</p>
    <div class="bwrap"><div class="bcircle" id="b-circle"></div><span class="bnum" aria-hidden="true" id="b-count"></span></div>
    <p class="blabel" id="b-label" aria-live="polite"></p>
    <p class="bcue muted" id="b-cue"></p>
    <p class="muted small">Time left <span id="b-left"></span></p>
    <button class="btn ghost" data-act="bstop">Stop</button></div>`;
}
function viewBreathe() {
  if (st.breathDone) {
    const d = st.breathDone;
    return `<header class="head"><div><h1>Done</h1><p>${esc(d.name)} · ${esc(d.words)}</p></div></header>
      <div class="empty"><b>Well done.</b>Logged to today's Breathing habit.</div>
      <div class="row" style="justify-content:center"><button class="btn" data-act="bagain">Again</button><button class="btn ghost" data-act="tab" data-tab="today">Back to Today</button></div>`;
  }
  const m = BREATH_MODES.find(x => x.id === st.bm) || BREATH_MODES[0], n = m.lengths.includes(st.bn) ? st.bn : m.dflt;
  const modes = BREATH_MODES.map(x => `<button class="mode" data-act="bmode" data-id="${x.id}" aria-pressed="${x.id === m.id}"><b>${esc(x.name)}</b><span>${esc(x.about)}</span></button>`).join("");
  const lens = m.lengths.map(v => `<button data-act="blen" data-v="${v}" aria-pressed="${v === n}">${v}</button>`).join("");
  return `<header class="head"><div><h1>Breathe</h1><p>Pick a style, then start.</p></div>
      <div class="headbtns"><button class="iconbtn" data-act="tab" data-tab="today" aria-label="Back to Today">${ICON.back}</button></div></header>
    <div class="modes" role="group" aria-label="Breathing style">${modes}</div>
    <section class="card"><div class="set">
      <div class="field"><span>How many ${m.unit || "breaths"}</span><div class="seg" role="group" aria-label="Length">${lens}</div></div>
      <p style="margin:0 0 12px"><b>${esc(breathWords(m, n))}</b></p>
      <label class="switch"><span>Gentle vibration on each breath</span><input type="checkbox" data-act="bbuzz"${DB.settings.buzz ? " checked" : ""}></label>
      <button class="btn bigbtn" data-act="bstart">Start</button>
    </div></section>`;
}

// ---------- after-prayer tasbih: 33 + 33 + 34, moving on by itself ----------
const TASBIH = ["subhanallah", "alhamdulillah", "allahuakbar"];
const tasbihReady = () => TASBIH.every(id => DB.dhikr.some(d => d.id === id));
function startTasbih() {
  const z = peek(st.date).z || {};
  const next = TASBIH.find(id => (z[id] || 0) < DB.dhikr.find(d => d.id === id).target);
  if (!next) { toast("All three are already done for this day."); return; }
  st.tasbih = true; st.dsel = DB.dhikr.findIndex(d => d.id === next); wakeOn(); render(true);
}
function stopTasbih() { st.tasbih = false; wakeOff(); }
function tasbihAdvance(d) {
  const i = TASBIH.indexOf(d.id);
  if (i < 0) return;
  if (i === TASBIH.length - 1) { stopTasbih(); toast("Tasbih complete. Alhamdulillah."); return; }
  st.dsel = DB.dhikr.findIndex(x => x.id === TASBIH[i + 1]);
  toast(`${d.target} × ${d.tr} done. Next: ${DB.dhikr[st.dsel].tr}`);
}

// ---------- rest timer (Train) ----------
const R = { end: 0, t: null, done: false };
function startRest(secs) {
  clearInterval(R.t); R.end = Date.now() + secs * 1000; R.done = false; showRest(); R.t = setInterval(showRest, 250);
}
function showRest() {
  const el = $("#rest"), left = Math.ceil((R.end - Date.now()) / 1000);
  el.hidden = false;
  if (left > 0) { el.innerHTML = `<b>${clock(left)}</b><span>rest</span><button class="btn ghost sm" data-act="restadd">+30 s</button><button class="btn sm" data-act="restoff">Skip</button>`; return; }
  if (!R.done) { R.done = true; buzz([200, 100, 200]); el.innerHTML = `<b>Go</b><span>rest is over</span><button class="btn sm" data-act="restoff">OK</button>`; }
}
function stopRest() { clearInterval(R.t); $("#rest").hidden = true; }

// ---------- training numbers ----------
const LIFTS = [{ id: "dl", name: "Deadlift" }, { id: "row", name: "Single-arm row" }, { id: "split", name: "Split squat" }];
const weekStart = k => addDays(k, -wdIdx(k));
function spark(id, wk) {
  const pts = [];
  for (let i = 7; i >= 0; i--) { const v = (DB.lifts[addDays(wk, -7 * i)] || {})[id]; pts.push(v > 0 ? v : null); }
  const vals = pts.filter(v => v !== null);
  if (vals.length < 2) return `<span class="muted small">Log two weeks to see a line</span>`;
  const lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1;
  const xy = pts.map((v, i) => v === null ? null : `${(i * 80 / 7).toFixed(1)},${(22 - (v - lo) / span * 20).toFixed(1)}`).filter(Boolean).join(" ");
  return `<svg class="spark" viewBox="0 -1 80 26" role="img" aria-label="Last 8 weeks: ${vals.join(", ")} reps"><polyline points="${xy}"/></svg>`;
}
function liftsCard(k) {
  const wk = weekStart(k), cur = DB.lifts[wk] || {};
  return `<section class="card"><div class="cardhead"><h2>Key numbers</h2><span class="count">week of ${esc(dateLabel(wk).split(" · ")[0])}</span></div><div class="set">
    <p class="muted small" style="margin:0 0 8px">Your best set of reps this week.</p>
    ${LIFTS.map(l => `<div class="lift"><label for="lf-${l.id}">${l.name}</label><input type="number" inputmode="numeric" min="0" id="lf-${l.id}" data-act="lift" data-id="${l.id}" data-wk="${wk}" value="${cur[l.id] || ""}" placeholder="reps">${spark(l.id, wk)}</div>`).join("")}
  </div></section>`;
}

// ---------- learning ----------
function weekMinutes(k) {
  const out = {};
  for (let i = 0; i < 7; i++) for (const [id, m] of Object.entries(peek(addDays(k, -i)).l || {})) {
    const t = DB.topics.find(x => x.id === id); if (t) out[t.track] = (out[t.track] || 0) + m;
  }
  return out;
}

// ---------- backup reminder ----------
function backupDue() {
  const s = DB.settings, t = todayKey();
  if (s.snooze && s.snooze > t) return false;
  if (Object.keys(DB.days).length < 3) return false;
  return !s.lastBackup || dayNum(t) - dayNum(s.lastBackup) > 14;
}

// ---------- history: last 8 weeks ----------
function heatmap(k) {
  const start = addDays(weekStart(k), -49), today = todayKey();
  let cells = "", sum = 0, n = 0;
  for (let c = 0; c < 8; c++) for (let r = 0; r < 7; r++) {
    const dk = addDays(start, c * 7 + r);
    if (dk > today) { cells += `<i class="hm-future"></i>`; continue; }
    const sc = score(dk); sum += sc; n++;
    cells += `<i class="l${Math.min(4, Math.ceil(sc / 25))}" title="${esc(dateLabel(dk))}: ${sc}%"></i>`;
  }
  return `<details class="fold" ${detailsAttr("history", false)}><summary><h2>Last 8 weeks</h2><span class="count">average ${n ? Math.round(sum / n) : 0}%</span></summary>
    <div class="set"><div class="hm" role="img" aria-label="Daily score for the last 8 weeks, average ${n ? Math.round(sum / n) : 0} percent">${cells}</div>
    <p class="muted small" style="margin:8px 0 0">Each column is a week, Monday at the top. Darker is a better day.</p></div></details>`;
}

// ---------- views ----------
const ICON = {
  prev: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  beads: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><circle cx="17" cy="7.5" r="1.6"/><circle cx="18.5" cy="13" r="1.6"/><circle cx="15.5" cy="18" r="1.6"/><circle cx="9" cy="18.5" r="1.6"/><circle cx="5.5" cy="13.5" r="1.6"/><circle cx="7" cy="8" r="1.6"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v13.5"/></svg>',
  list: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>'
};
function dateLabel(k) {
  const d = dateOf(k), t = todayKey();
  const rel = k === t ? "Today" : k === addDays(t, -1) ? "Yesterday" : k === addDays(t, 1) ? "Tomorrow" : "";
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}${rel ? " · " + rel : ""}`;
}

const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function habitRow(h, k) {
  const done = isDone(h, k), manual = !!(peek(k).h || {})[h.id], s = streak(h, k);
  let sub = "", link = "";
  if (h.auto === "train") { const t = trainProgress(k); sub = `${t.done}/${t.total} blocks ticked`; link = "train"; }
  if (h.auto === "dhikr") { sub = `${fmt(dhikrToday(k))} today`; link = "dhikr"; }
  if (h.auto === "learn") { sub = `${learnToday(k)} min today`; link = "learn"; }
  if (h.auto === "breathe") { const n = (peek(k).b || {}).n || 0; sub = n ? `${n} session${n > 1 ? "s" : ""} today` : "5 minutes is enough"; link = "breathe"; }
  return `<li><div class="hrow${done ? " done" : ""}">
    <input type="checkbox" id="h-${esc(h.id)}" data-act="habit" data-id="${esc(h.id)}"${done ? " checked" : ""}${done && !manual && h.auto ? ' title="Ticked automatically"' : ""}>
    <label class="lbl" for="h-${esc(h.id)}"><span>${esc(h.name)}</span>${h.opt ? '<span class="pill">optional</span>' : ""}${sub ? `<small>${esc(sub)}</small>` : ""}</label>
    ${link ? `<button class="go" data-act="tab" data-tab="${link}" aria-label="Open ${link} page">Open</button>` : ""}
    ${s > 1 ? `<span class="streak" title="Days in a row"><b>${s}</b>days</span>` : ""}
  </div></li>`;
}

// A group with everything counted done folds away; tap to open it again.
function groupCard(g, k) {
  const hs = DB.habits.filter(h => h.g === g.id);
  if (!hs.length) return "";
  const req = hs.filter(h => !h.opt), dn = req.filter(h => isDone(h, k)).length, complete = req.length > 0 && dn === req.length;
  // Optional habits tuck away behind one toggle (unless done today) so the page stays short.
  const must = hs.filter(h => !h.opt || isDone(h, k)), rest = hs.filter(h => !must.includes(h));
  const more = rest.length ? `<li><details class="more" ${detailsAttr("o:" + g.id, false)}><summary>${rest.length} optional</summary><ul class="list">${rest.map(h => habitRow(h, k)).join("")}</ul></details></li>` : "";
  const rows = `<ul class="list">${must.map(h => habitRow(h, k)).join("")}${more}</ul>`;
  const extra = g.id === "fard" && !complete ? `<div class="set" style="padding-top:0"><button class="btn ghost sm" data-act="tickfard">Tick all five prayers</button></div>` : "";
  if (complete) return `<details class="fold" ${detailsAttr("g:" + g.id, false)}><summary><span class="tickmark">${TICK}</span><h2>${esc(g.name)}</h2><span class="count">${dn}/${req.length}</span></summary>${rows}</details>`;
  return `<section class="card" aria-label="${esc(g.name)}"><div class="cardhead"><h2>${esc(g.name)}</h2><span class="count">${dn}/${req.length}</span></div>${rows}${extra}</section>`;
}

function weekStrip(k) {
  let week = "";
  for (let i = 6; i >= 0; i--) {
    const dk = addDays(k, -i), s = score(dk);
    week += `<button class="wd" data-act="goto" data-k="${dk}"${dk === k ? ' aria-current="date"' : ""} aria-label="${DAYN[wdIdx(dk)]} ${dateLabel(dk)}, ${s}%"><span class="bar"><i style="transform:scaleY(${s / 100})"></i></span>${DAYN[wdIdx(dk)].slice(0, 2)}</button>`;
  }
  return week;
}

function reminderCard(k) {
  const r = dayReminder(k), cite = r.kind === "ayah" ? r.surah : "Narrated by " + r.by;
  return `<section class="card remind" aria-label="Reminder of the day">
    <div class="rhead"><span class="kicker">Reminder</span><span class="ref">${esc(r.ref)}${r.grade ? " · " + esc(r.grade) : ""}</span></div>
    ${r.kind === "ayah" ? `<p class="ar rar" lang="ar" dir="rtl">${esc(r.ar)}</p>` : ""}
    <p class="rtext">${esc(r.en)}</p>
    <p class="muted small" style="margin:0">${esc(cite)}</p>
    <div class="row ractions"><button class="btn ghost sm" data-act="rnext">Another</button>
      <button class="btn ghost sm" data-act="fav" data-id="${esc(r.id)}" aria-pressed="${isFav(r.id)}">${isFav(r.id) ? "Saved" : "Save"}</button></div></section>`;
}
function quoteLine(k) {
  const q = dayQuote(k); if (!q) return "";
  return `<figure class="quote" aria-label="Quote of the day"><blockquote>“${esc(q.text)}”</blockquote>
    <figcaption>${esc(q.by)}${q.src ? ", " + esc(q.src) : ""}</figcaption>
    <span class="row"><button class="go" data-act="qnext" aria-label="Show another quote">Another</button>
    <button class="go" data-act="fav" data-id="${esc(q.id)}" aria-pressed="${isFav(q.id)}">${isFav(q.id) ? "Saved" : "Save"}</button></span></figure>`;
}
function nudgeLine(k) {
  const n = activeNudge(k); if (!n) return "";
  const c = n.cite && REMINDERS_CONTEXT.find(x => x.id === n.cite);
  return `<p class="nudge">${esc(n.text)}${c ? ` <small>${esc(c.ref)}</small>` : ""}</p>`;
}
function focusCard(k) {
  const t = DB.focus && DB.topics.find(x => x.id === DB.focus && x.status !== "done"); if (!t) return "";
  return `<section class="card focus"><div class="set" style="padding-top:var(--s3)"><span class="kicker">Today's focus</span>
    <div class="tt"><b>${esc(t.name)}</b><span class="nums muted small">${(peek(k).l || {})[t.id] || 0} min today</span></div>
    <div class="row" style="margin-top:var(--s2)"><button class="btn sm" data-act="tmin" data-id="${esc(t.id)}" data-v="15">+15 min</button><button class="btn ghost sm" data-act="tab" data-tab="learn">Open Learn</button></div></div></section>`;
}
function backupBanner() {
  if (!backupDue()) return "";
  const s = DB.settings.lastBackup, days = s ? dayNum(todayKey()) - dayNum(s) : null;
  return `<section class="card banner" role="note"><div class="set" style="padding-top:var(--s3)"><b>Back up your data</b>
    <p class="muted small" style="margin:var(--s1) 0 var(--s2)">${days ? `Your last backup was ${days} days ago.` : "You haven't made a backup yet."} Everything lives in this browser only.</p>
    <div class="row"><button class="btn sm" data-act="export">Download backup</button><button class="btn ghost sm" data-act="snooze">Later</button></div></div></section>`;
}

function viewToday() {
  const k = st.date, sc = score(k), counted = DB.habits.filter(h => !h.opt), doneN = counted.filter(h => isDone(h, k)).length, show = DB.settings.show;
  const groups = GROUPS.map(g => groupCard(g, k)).join("");
  const breathed = ((peek(k).b || {}).n || 0) > 0;
  return `
    <header class="head">
      <div><h1>${DAYN[wdIdx(k)]}</h1><p>${dateLabel(k)}</p></div>
      <div class="headbtns">
        <button class="iconbtn" data-act="shift" data-n="-1" aria-label="Previous day">${ICON.prev}</button>
        <button class="iconbtn" data-act="shift" data-n="1" aria-label="Next day">${ICON.next}</button>
        <button class="iconbtn" data-act="tab" data-tab="settings" aria-label="Settings">${ICON.gear}</button>
      </div>
    </header>
    ${nudgeLine(k)}
    ${show.reminder ? reminderCard(k) : ""}
    ${show.quote ? quoteLine(k) : ""}
    <section class="score" aria-label="Score for ${esc(dateLabel(k))}">
      <div class="scoretop"><span class="big">${sc}<sup>%</sup></span>
        <span class="scoremeta"><b>${doneN} of ${counted.length}</b>habits done${k !== todayKey() ? `<br><button class="go" data-act="goto" data-k="${todayKey()}">Back to today</button>` : ""}</span></div>
      <div class="belt" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${sc}" aria-label="Habits done"><i style="transform:scaleX(${sc / 100})"></i></div>
      <div class="week">${weekStrip(k)}</div>
    </section>
    ${focusCard(k)}
    ${show.breathing && !breathed && k === todayKey() ? `<button class="breathprompt" data-act="breathe"><span><b>Take 5 minutes to breathe</b><small>Calm, slow breathing. Ticks the Breathing habit.</small></span>${ICON.next}</button>` : ""}
    ${backupBanner()}
    ${groups || `<div class="empty">${ICON.list}<b>No habits yet</b>Add your first one in Settings.</div>`}
    ${heatmap(k)}
    <p class="muted small">Add, remove or rename habits in Settings.</p>`;
}

function viewRoutine() {
  const now = new Date(), mins = now.getHours() * 60 + now.getMinutes();
  const rs = [...DB.routine].sort((a, b) => a.t.localeCompare(b.t));
  const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  let cur = -1; rs.forEach((r, i) => { if (toMin(r.t) <= mins) cur = i; });
  let body = "";
  if (st.editRoutine) {
    body = DB.routine.map((r, i) => `<div class="rtedit">
      <input type="time" id="rt-t-${i}" value="${esc(r.t)}" data-act="rtt" data-i="${i}" aria-label="Time">
      <input type="text" id="rt-x-${i}" value="${esc(r.x)}" data-act="rtx" data-i="${i}" aria-label="Activity">
      <button class="btn ghost sm" data-act="rtdel" data-i="${i}" aria-label="Delete">✕</button></div>`).join("");
    body += `<div class="set row" style="padding-top:12px"><button class="btn sm" data-act="rtadd">Add a time block</button>
      <button class="btn ghost sm" data-act="${st.confirm === "rtreset" ? "rtreset2" : "rtreset"}">${st.confirm === "rtreset" ? "Tap again to reset" : "Reset to default"}</button></div>`;
  } else {
    body = rs.map((r, i) => `<div class="rt${i === cur && st.date === todayKey() ? " now" : i < cur ? " past" : ""}"><span class="tm">${esc(r.t)}</span><span>${esc(r.x)}</span></div>`).join("");
  }
  const d = effWeek(wdIdx(todayKey()));
  const kind = d.rest ? "a rest day" : d.cls && d.s ? `a class + Strength ${d.s} day` : d.cls ? "a class day" : `a Strength ${d.s} day`;
  return `
    <header class="head"><div><h1>Routine</h1><p>A normal day. Today is ${kind}.</p></div>
      <div class="headbtns"><button class="btn ${st.editRoutine ? "" : "ghost"} sm" data-act="rtedit">${st.editRoutine ? "Done" : "Edit"}</button></div></header>
    <section class="card">${body || `<div class="empty">${ICON.clock}<b>No time blocks yet</b>Tap Edit to add the first block of your day.</div>`}</section>
    <p class="muted small">Prayer times move through the year. Set them to Bishkek's times and the app highlights the block you're in now.</p>`;
}

function viewTrain() {
  const k = st.date, i = wdIdx(k), { blocks, d, fuel, r } = trainBlocks(k), w = peek(k).w || {};
  let pick = "";
  for (let j = 0; j < 7; j++) {
    const dk = addDays(k, j - i);
    pick += `<button data-act="goto" data-k="${dk}" aria-pressed="${j === i}" aria-label="${DAYN[j]}, ${wTag(effWeek(j))}">${DAYN[j].slice(0, 2)}<small>${wTag(effWeek(j))}</small></button>`;
  }
  let html = "", last = "";
  for (const b of blocks) {
    if (b.when !== last) { html += `<p class="when">${esc(b.when)}</p>`; last = b.when; }
    const done = !!w[b.id];
    html += `<details class="block${done ? " done" : ""}" ${detailsAttr("b:" + b.id, !!b.open && !done)}>
      <summary><h3>${esc(b.title)}</h3><span class="sumr"><span class="t">${esc(b.time)}</span>
      <label class="tick"><input type="checkbox" id="w-${b.id}" data-act="block" data-id="${b.id}"${done ? " checked" : ""} aria-label="Mark ${esc(b.title)} done"> Done</label></span></summary>
      ${b.note ? `<p class="note">${esc(b.note)}</p>` : ""}<ol>${b.items.join("")}</ol></details>`;
  }
  const t = trainProgress(k);
  const alert = r === "yellow" ? `<p class="alert">One set fewer on power, strength and muscle work. Optional exercises and the hard push-up set dropped.</p>`
    : r === "red" ? `<p class="alert red">No strength work or push-ups today. Mobility, walking and breathing only.</p>` : "";
  return `
    <header class="head"><div><h1>Train</h1><p>${dateLabel(k)} · ${t.done}/${t.total} done</p></div></header>
    <div class="daypick" aria-label="Day of the week">${pick}</div>
    <div class="row" style="margin-bottom:6px">
      <div class="seg ready" role="group" aria-label="How do you feel">
        <button data-act="ready" data-v="green" aria-pressed="${r === "green"}">Good</button>
        <button data-act="ready" data-v="yellow" aria-pressed="${r === "yellow"}">A bit tired</button>
        <button data-act="ready" data-v="red" aria-pressed="${r === "red"}">Beat up</button>
      </div>
    </div>
    <div class="row" style="margin-top:var(--s3)"><span class="muted small">Rest timer</span>
      ${[60, 90, 120].map(v => `<button class="btn ghost sm" data-act="rest" data-v="${v}" aria-label="Start ${v} second rest">${v < 120 ? v + " s" : "2 min"}</button>`).join("")}
      <button class="btn ghost sm" data-act="breathe" data-mode="sigh">Breathe after training</button></div>
    <p class="fuel"><span><b>${fmt(fuel.k)}</b> kcal</span><span>P <b>${fuel.p} g</b></span><span>F <b>${fuel.f} g</b></span><span>C <b>${fuel.c} g</b></span></p>
    ${alert}${html}
    ${liftsCard(k)}
    <p class="muted small" style="margin-top:14px">Classes, push-up level, equipment and deload week are in Settings.</p>`;
}

function viewDhikr() {
  const k = st.date, z = peek(k).z || {}, list = DB.dhikr;
  const a = list[Math.min(st.dsel, list.length - 1)];
  if (!a) return `<header class="head"><div><h1>Dhikr</h1></div></header><div class="empty">${ICON.beads}<b>No dhikr yet</b>Add your first one below.</div>${dhikrAdd()}`;
  const c = z[a.id] || 0, pct = Math.min(1, c / a.target), C = 2 * Math.PI * 54;
  const rows = list.map((d, i) => {
    const n = z[d.id] || 0;
    return `<li><div class="hrow" data-act="dsel" data-i="${i}" role="button" tabindex="0"${i === st.dsel ? ' aria-current="true"' : ""}>
      <span class="lbl dl"><span class="meta"><b>${esc(d.tr)}</b><small>${n}/${d.target} today · ${fmt(d.total)} all time</small>
      <span class="mini"><i style="transform:scaleX(${Math.min(1, n / d.target)})"></i></span></span><span class="ar" lang="ar" dir="rtl">${esc(d.ar)}</span></span></div></li>`;
  }).join("");
  return `
    <header class="head"><div><h1>Dhikr</h1><p>${fmt(dhikrToday(k))} today · ${dateLabel(k)}</p></div></header>
    ${st.tasbih ? `<p class="nudge" role="status">After-prayer tasbih: step ${Math.max(1, TASBIH.indexOf(a.id) + 1)} of 3. It moves on by itself. <button class="go" data-act="tasbihoff">Stop</button></p>`
      : tasbihReady() ? `<div class="row" style="margin-bottom:var(--s3)"><button class="btn ghost sm" data-act="tasbih">After-prayer tasbih: 33 · 33 · 34</button></div>` : ""}
    <button class="tap" data-act="count" aria-label="Count ${esc(a.tr)}, ${c} of ${a.target}">
      <span class="ar" lang="ar" dir="rtl">${esc(a.ar)}</span>
      <span class="tr">${esc(a.tr)}</span>
      <span class="en">${esc(a.en)}</span>
      <svg class="ring" viewBox="0 0 132 132" aria-hidden="true"><circle class="bg" cx="66" cy="66" r="54"/>
        <circle class="fg" cx="66" cy="66" r="54" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" transform="rotate(-90 66 66)"/>
        <text x="66" y="60">${c}</text><text class="of" x="66" y="88">of ${a.target}</text></svg>
      <span class="muted small">Tap anywhere here</span>
    </button>
    <div class="row" style="margin:10px 0 16px;justify-content:center">
      <button class="btn ghost sm" data-act="dminus">−1</button>
      <button class="btn ghost sm" data-act="${st.confirm === "dreset" ? "dreset2" : "dreset"}">${st.confirm === "dreset" ? "Tap again to reset" : "Reset this one today"}</button>
    </div>
    <section class="card"><ul class="list dlist">${rows}</ul></section>
    ${dhikrAdd()}`;
}
function dhikrAdd() {
  return `<details class="block"><summary><h3>Add your own dhikr</h3></summary><div class="set">
    <label class="field"><span>Arabic</span><input type="text" id="dk-ar" dir="rtl" lang="ar"></label>
    <label class="field"><span>Transliteration</span><input type="text" id="dk-tr"></label>
    <label class="field"><span>Meaning</span><input type="text" id="dk-en"></label>
    <label class="field"><span>Target</span><input type="text" id="dk-t" inputmode="numeric" value="33"></label>
    <button class="btn sm" data-act="dadd">Add</button></div></details>`;
}

function viewLearn() {
  const k = st.date, tr = st.track, l = peek(k).l || {};
  const mine = DB.topics.filter(t => t.track === tr);
  const order = { learning: 0, next: 1, done: 2 };
  mine.sort((a, b) => order[a.status] - order[b.status]);
  const ideas = TOPIC_IDEAS[tr].filter(n => !mine.some(t => t.name.toLowerCase() === n.toLowerCase()));
  const tabs = TRACKS.map(t => `<button data-act="track" data-v="${t.id}" aria-pressed="${t.id === tr}">${t.name}</button>`).join("");
  const rows = mine.map(t => {
    const today = l[t.id] || 0;
    return `<div class="topic">
      <div class="tt"><b>${esc(t.name)}</b><span class="nums">${today} min today · ${Math.round(t.total / 6) / 10} h total</span></div>
      <div class="row">
        <div class="seg" role="group" aria-label="Status">
          ${["next", "learning", "done"].map(s => `<button data-act="tstatus" data-id="${t.id}" data-v="${s}" aria-pressed="${t.status === s}">${{ next: "Next", learning: "Learning", done: "Done" }[s]}</button>`).join("")}
        </div>
        <button class="btn sm" data-act="tmin" data-id="${t.id}" data-v="15">+15 min</button>
        <button class="btn sm ghost" data-act="tmin" data-id="${t.id}" data-v="30">+30</button>
        <button class="btn sm ghost" data-act="focus" data-id="${t.id}" aria-pressed="${DB.focus === t.id}">${DB.focus === t.id ? "Today's focus" : "Make focus"}</button>
      </div>
      <details><summary class="muted small" style="margin-top:8px;cursor:pointer">Notes</summary>
        <textarea id="tn-${t.id}" data-act="tnote" data-id="${t.id}" aria-label="Notes for ${esc(t.name)}">${esc(t.notes || "")}</textarea>
        <div class="row" style="margin-top:6px"><button class="btn ghost sm" data-act="${st.confirm === "tdel" + t.id ? "tdel2" : "tdel"}" data-id="${t.id}">${st.confirm === "tdel" + t.id ? "Tap again to delete" : "Delete topic"}</button>
        ${today ? `<button class="btn ghost sm" data-act="tmin" data-id="${t.id}" data-v="-15">−15 min</button>` : ""}</div>
      </details></div>`;
  }).join("");
  return `
    <header class="head"><div><h1>Learn</h1><p>${learnToday(k)} min today · ${dateLabel(k)}</p></div></header>
    <div class="seg" role="group" aria-label="Track">${tabs}</div>
    <p class="muted small" style="margin:var(--s2) 0 var(--s4)">This week: ${TRACKS.map(t => `${t.name} ${weekMinutes(k)[t.id] || 0} min`).join(" · ")}</p>
    <section class="card"><div class="cardhead"><h2>My topics</h2><span class="count">${mine.filter(t => t.status !== "done").length} open</span></div>
      ${rows || `<div class="empty">${ICON.book}<b>Nothing here yet</b>Pick an idea below or add your own. Log time with +15 when you study.</div>`}
    </section>
    <section class="card"><div class="cardhead"><h2>Ideas</h2></div>
      <div class="chips">${ideas.map(n => `<button class="chip" data-act="tadd" data-v="${esc(n)}">+ ${esc(n)}</button>`).join("") || '<span class="muted small">All ideas added.</span>'}</div>
      <form class="set row" data-form="tnew"><input type="text" id="tnew" placeholder="Your own topic" aria-label="New topic" style="flex:1"><button class="btn sm" type="submit">Add</button></form>
    </section>`;
}

function savedCard() {
  const items = DB.favs.map(findItem).filter(Boolean);
  if (!items.length) return "";
  return `<section class="card"><div class="cardhead"><h2>Saved</h2><span class="count">${items.length}</span></div><ul class="list">${items.map(it => `<li><div class="hrow"><span class="lbl">${it.kind === "ayah" ? `<span class="ar" lang="ar" dir="rtl">${esc(it.ar)}</span>` : ""}<span>${esc(it.en || "“" + it.text + "”")}</span><small>${esc(it.ref || it.by)}</small></span>
    <button class="btn ghost sm" data-act="fav" data-id="${esc(it.id)}" aria-label="Remove from saved">Remove</button></div></li>`).join("")}</ul></section>`;
}
function viewSettings() {
  const s = DB.settings;
  const segBtn = (key, v, label) => `<button data-act="set" data-key="${key}" data-v="${v}" aria-pressed="${s[key] === v}">${label}</button>`;
  const hab = GROUPS.map(g => {
    const hs = DB.habits.filter(h => h.g === g.id);
    return `<h3>${esc(g.name)}</h3>` + hs.map(h => `<div class="hedit">
      <input type="text" id="he-${esc(h.id)}" value="${esc(h.name)}" data-act="hname" data-id="${esc(h.id)}" aria-label="Habit name">
      <div class="row"><button class="btn ghost sm iconsm" data-act="hmove" data-id="${esc(h.id)}" data-n="-1" aria-label="Move ${esc(h.name)} up">▲</button><button class="btn ghost sm iconsm" data-act="hmove" data-id="${esc(h.id)}" data-n="1" aria-label="Move ${esc(h.name)} down">▼</button>
      <button class="btn ghost sm" data-act="hopt" data-id="${esc(h.id)}" aria-label="${esc(h.name)}: ${h.opt ? "optional, tap to count it" : "counted, tap to make optional"}">${h.opt ? "Optional" : "Counted"}</button>
      <button class="btn ghost sm" data-act="hdel" data-id="${esc(h.id)}" aria-label="Delete ${esc(h.name)}">✕</button></div></div>`).join("");
  }).join("");
  return `
    <header class="head"><div><h1>Settings</h1><p>Saved on this device only.</p></div>
      <div class="headbtns"><button class="iconbtn" data-act="tab" data-tab="today" aria-label="Back">${ICON.back}</button></div></header>

    <section class="card"><div class="set">
      <h3>Training</h3>
      <div class="field"><span>Classes a week</span><div class="seg">${segBtn("classes", "4", "4")}${segBtn("classes", "5", "5")}</div></div>
      <div class="field"><span>Push-ups a day</span><div class="seg">${segBtn("push", "100", "100")}${segBtn("push", "200", "200")}${segBtn("push", "300", "300")}</div></div>
      <div class="field"><span>Equipment</span><div class="seg">${segBtn("eq", "home", "Home bands")}${segBtn("eq", "gym", "Gym")}</div></div>
      <label class="tick" style="font-size:.95rem;color:var(--ink)"><input type="checkbox" id="deload" data-act="deload"${s.deload ? " checked" : ""}> Deload week (half the sets)</label>
    </div></section>

    <section class="card"><div class="set">
      <h3>On the Today page</h3>
      ${[["reminder", "Reminder of the day"], ["quote", "Quote of the day"], ["breathing", "Breathing prompt"]].map(([key, label]) => `<label class="switch"><span>${label}</span><input type="checkbox" data-act="show" data-key="${key}"${s.show[key] ? " checked" : ""}></label>`).join("")}
      <h3>Quote topics</h3>
      ${QUOTE_CATS.map(c => `<label class="switch"><span>${esc(c.name)}</span><input type="checkbox" data-act="qcat" data-id="${c.id}"${s.quoteCats.includes(c.id) ? " checked" : ""}></label>`).join("")}
    </div></section>

    ${savedCard()}

    <details class="fold" ${detailsAttr("set:habits", false)}><summary><h2>Habits</h2><span class="count">${DB.habits.length}</span></summary><div class="set">
      <p class="muted small" style="margin:0">Rename by typing. Use the arrows to reorder. "Optional" habits don't count toward your daily score.</p>
      ${hab}
      <h3>Add a habit</h3>
      <form data-form="hnew" class="row"><input type="text" id="hnew" placeholder="e.g. Memorise 3 ayat" style="flex:1 1 180px" aria-label="New habit">
        <select id="hgroup" aria-label="Group" style="width:auto">${GROUPS.map(g => `<option value="${g.id}"${g.id === "deen" ? " selected" : ""}>${esc(g.name)}</option>`).join("")}</select>
        <button class="btn sm" type="submit">Add</button></form>
    </div></details>

    <section class="card"><div class="set">
      <h3>App lock</h3>
      <p class="muted small" style="margin:0 0 8px">A PIN screen for this device. It keeps people who pick up your phone out; it isn't account-level security.</p>
      ${s.pin ? `<button class="btn ghost sm" data-act="pinoff">Remove PIN</button>` :
      `<form data-form="pin" class="row"><input type="password" id="pinset" inputmode="numeric" maxlength="8" placeholder="4–8 digits" style="flex:1" aria-label="New PIN"><button class="btn sm" type="submit">Set PIN</button></form>`}
    </div></section>

    <section class="card"><div class="set">
      <h3>Backup</h3>
      <p class="muted small" style="margin:0 0 8px">Your data lives in this browser. Download a backup every week or two, and use it to move to a new phone. Last backup: ${s.lastBackup ? esc(dateLabel(s.lastBackup)) : "never"}.</p>
      <div class="row"><button class="btn sm" data-act="export">Download backup</button>
        <label class="btn ghost sm" for="importFile" style="cursor:pointer">Restore from file</label>
        <input type="file" id="importFile" accept="application/json,.json" hidden></div>
      <h3>Start over</h3>
      <button class="btn danger sm" data-act="${st.confirm === "wipe" ? "wipe2" : "wipe"}">${st.confirm === "wipe" ? "Tap again to erase everything" : "Erase all data"}</button>
    </div></section>`;
}

// ---------- render ----------
const VIEWS = { today: viewToday, routine: viewRoutine, train: viewTrain, dhikr: viewDhikr, learn: viewLearn, breathe: viewBreathe, settings: viewSettings };
function render(keepScroll) {
  if (B.run && st.tab === "breathe") return; // a session is drawing its own screen
  const y = window.scrollY;
  $("#view").innerHTML = VIEWS[st.tab]();
  document.querySelectorAll(".tabs button").forEach(b => {
    if (b.dataset.tab === st.tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  if (keepScroll) window.scrollTo(0, y);
}
function go(tab) {
  if (B.run) stopBreath();
  if (st.tasbih) stopTasbih();
  if (tab !== "breathe") st.breathDone = null;
  st.tab = tab; st.editRoutine = false; st.confirm = null;
  try { sessionStorage.setItem("tab", tab === "settings" || tab === "breathe" ? "today" : tab); } catch (e) {}
  render(); window.scrollTo(0, 0);
}
let toastT;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200);
}

// ---------- actions ----------
// Each data-act in the markup maps to one small function here. `el` is the element that was tapped.
const CONFIRM = new Set(["dreset", "dreset2", "tdel", "tdel2", "rtreset", "rtreset2", "wipe", "wipe2"]);
const dhikrNow = () => DB.dhikr[Math.min(st.dsel, DB.dhikr.length - 1)];
const topicOf = id => DB.topics.find(x => x.id === id);
const habitOf = id => DB.habits.find(x => x.id === id);
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
const ask = what => () => { st.confirm = what; render(true); };

function countDhikr() {
  const d = dhikrNow(), z = day(st.date).z;
  z[d.id] = (z[d.id] || 0) + 1; d.total++; save();
  if (z[d.id] === d.target) { buzz([60, 40, 60]); if (st.tasbih) tasbihAdvance(d); else toast(`${d.target} × ${d.tr} done`); } else buzz(8);
  render(true);
}
function uncountDhikr() {
  const d = dhikrNow(), z = day(st.date).z;
  if (z[d.id] > 0) { z[d.id]--; d.total = Math.max(0, d.total - 1); save(); render(true); }
}
function resetDhikr() {
  const d = dhikrNow(), z = day(st.date).z;
  d.total = Math.max(0, d.total - (z[d.id] || 0)); z[d.id] = 0; st.confirm = null; save(); render(true);
}
function addDhikr() {
  const ar = $("#dk-ar").value.trim(), tr = $("#dk-tr").value.trim(), en = $("#dk-en").value.trim(), t = parseInt($("#dk-t").value, 10) || 33;
  if (!ar && !tr) { toast("Write the dhikr in Arabic or transliteration first."); return; }
  DB.dhikr.push({ id: "d" + uid(), ar: ar || tr, tr: tr || ar, en, target: t, total: 0 });
  st.dsel = DB.dhikr.length - 1; save(); render(); toast("Dhikr added");
}
function logTopicMinutes(el) {
  const t = topicOf(el.dataset.id), v = +el.dataset.v, l = day(st.date).l, cur = l[t.id] || 0, next = Math.max(0, cur + v);
  t.total = Math.max(0, t.total + (next - cur)); l[t.id] = next;
  if (v > 0 && t.status === "next") t.status = "learning";
  save(); render(true);
}
function addRoutineBlock() {
  DB.routine.push({ t: "12:00", x: "" }); save(); render(true);
  $("#rt-x-" + (DB.routine.length - 1))?.focus();
}
// Swap with the nearest habit in the same group, so reordering never jumps across groups.
function moveHabit(id, dir) {
  const a = DB.habits.findIndex(h => h.id === id); if (a < 0) return;
  for (let b = a + dir; b >= 0 && b < DB.habits.length; b += dir) {
    if (DB.habits[b].g === DB.habits[a].g) { [DB.habits[a], DB.habits[b]] = [DB.habits[b], DB.habits[a]]; return; }
  }
}
function eraseAll() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  DB = seed(); st.confirm = null; save(); go("today"); toast("Everything erased");
}
// Mutate data, save, redraw. Keeps the table below to one line per action.
const edit = fn => el => { fn(el); save(); render(true); };

const ACTIONS = {
  tab: el => go(el.dataset.tab),
  shift: el => { st.date = addDays(st.date, +el.dataset.n); render(); },
  goto: el => { st.date = el.dataset.k; render(true); },
  ready: edit(el => { day(st.date).r = el.dataset.v; }),
  set: edit(el => { DB.settings[el.dataset.key] = el.dataset.v; }),
  tickfard: edit(() => { for (const h of DB.habits) if (h.g === "fard") day(st.date).h[h.id] = true; }),
  count: countDhikr,
  dminus: uncountDhikr,
  dreset: ask("dreset"), dreset2: resetDhikr,
  dsel: el => { st.dsel = +el.dataset.i; render(); window.scrollTo(0, 0); },
  dadd: addDhikr,
  track: el => { st.track = el.dataset.v; render(true); },
  tadd: el => addTopic(el.dataset.v),
  tstatus: edit(el => { topicOf(el.dataset.id).status = el.dataset.v; }),
  tmin: logTopicMinutes,
  tdel: el => { st.confirm = "tdel" + el.dataset.id; render(true); },
  tdel2: el => { DB.topics = DB.topics.filter(x => x.id !== el.dataset.id); st.confirm = null; save(); render(true); toast("Topic deleted"); },
  rtedit: () => { st.editRoutine = !st.editRoutine; st.confirm = null; render(); },
  rtadd: addRoutineBlock,
  rtdel: edit(el => { DB.routine.splice(+el.dataset.i, 1); }),
  rtreset: ask("rtreset"),
  rtreset2: () => { DB.routine = DEFAULT_ROUTINE.map(r => ({ ...r })); st.confirm = null; save(); render(true); toast("Routine reset"); },
  hopt: edit(el => { const h = habitOf(el.dataset.id); h.opt = !h.opt; }),
  hdel: el => { DB.habits = DB.habits.filter(x => x.id !== el.dataset.id); save(); render(true); toast("Habit removed"); },
  pinoff: () => { DB.settings.pin = null; DB.settings.salt = null; save(); render(true); toast("PIN removed"); },
  export: () => exportData(),
  rnext: () => { st.bumpR++; render(true); },
  qnext: () => { st.bumpQ++; render(true); },
  fav: edit(el => { const id = el.dataset.id, i = DB.favs.indexOf(id); if (i < 0) DB.favs.push(id); else DB.favs.splice(i, 1); }),
  snooze: edit(() => { DB.settings.snooze = addDays(todayKey(), 3); }),
  breathe: el => { if (el.dataset.mode) { st.bm = el.dataset.mode; st.bn = 0; } go("breathe"); },
  bmode: el => { st.bm = el.dataset.id; st.bn = 0; render(true); },
  blen: el => { st.bn = +el.dataset.v; render(true); },
  bstart: startBreath,
  bstop: () => { stopBreath(); render(); },
  bagain: () => { st.breathDone = null; render(); },
  tasbih: startTasbih,
  tasbihoff: () => { stopTasbih(); render(true); },
  rest: el => startRest(+el.dataset.v),
  restadd: () => { R.end += 30000; R.done = false; showRest(); },
  restoff: stopRest,
  focus: edit(el => { DB.focus = DB.focus === el.dataset.id ? null : el.dataset.id; }),
  hmove: edit(el => moveHabit(el.dataset.id, +el.dataset.n)),
  wipe: ask("wipe"), wipe2: eraseAll
};

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act], .tabs button");
  if (!el) return;
  if (el.matches(".tabs button")) return go(el.dataset.tab);
  if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") return; // handled on change/input
  if (!CONFIRM.has(el.dataset.act)) st.confirm = null;
  ACTIONS[el.dataset.act]?.(el);
});
document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener("change", e => {
  const el = e.target, a = el.dataset.act, k = st.date;
  if (a === "habit") {
    const h = DB.habits.find(x => x.id === el.dataset.id), hd = day(k).h;
    if (el.checked) hd[h.id] = true; else delete hd[h.id];
    if (!el.checked && isDone(h, k)) toast("Ticked automatically from " + ({ train: "Train", dhikr: "Dhikr", learn: "Learn", breathe: "Breathe" }[h.auto]));
    save(); render(true);
  } else if (a === "block") {
    const w = day(k).w; if (el.checked) w[el.dataset.id] = true; else delete w[el.dataset.id];
    save(); render(true);
  } else if (a === "deload") { DB.settings.deload = el.checked; save(); }
  else if (a === "show") { DB.settings.show[el.dataset.key] = el.checked; save(); }
  else if (a === "qcat") { const c = DB.settings.quoteCats, i = c.indexOf(el.dataset.id); if (el.checked && i < 0) c.push(el.dataset.id); if (!el.checked && i >= 0) c.splice(i, 1); save(); }
  else if (a === "bbuzz") { DB.settings.buzz = el.checked; save(); if (el.checked) buzz(40); }
  else if (a === "lift") { const w = DB.lifts[el.dataset.wk] ||= {}, v = parseInt(el.value, 10); if (v > 0) w[el.dataset.id] = v; else delete w[el.dataset.id]; save(); }
  else if (a === "rtt") { DB.routine[+el.dataset.i].t = el.value || "00:00"; save(); }
  else if (el.id === "importFile") importData(el.files[0]);
});
document.addEventListener("input", e => {
  const el = e.target, a = el.dataset.act;
  if (a === "rtx") { DB.routine[+el.dataset.i].x = el.value; save(); }
  else if (a === "hname") { const h = DB.habits.find(x => x.id === el.dataset.id); h.name = el.value; save(); }
  else if (a === "tnote") { const t = DB.topics.find(x => x.id === el.dataset.id); t.notes = el.value; save(); }
});
document.addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target.dataset.form;
  if (f === "tnew") { const v = $("#tnew").value.trim(); if (v) addTopic(v); }
  if (f === "hnew") {
    const v = $("#hnew").value.trim(); if (!v) { toast("Type a habit name first."); return; }
    DB.habits.push({ id: "h" + uid(), g: $("#hgroup").value, name: v }); save(); render(true); toast("Habit added");
  }
  if (f === "pin") {
    const v = $("#pinset").value.trim();
    if (!/^\d{4,8}$/.test(v)) { toast("Use 4 to 8 digits."); return; }
    const salt = uid() + uid(); DB.settings.salt = salt; DB.settings.pin = await hash(salt + v); save();
    try { sessionStorage.setItem("unlocked", "1"); } catch (er) {}
    render(true); toast("PIN set. You'll need it next time you open the app.");
  }
});
function addTopic(name) {
  if (DB.topics.some(t => t.track === st.track && t.name.toLowerCase() === name.toLowerCase())) { toast("Already in your topics."); return; }
  DB.topics.push({ id: "t" + uid(), track: st.track, name, status: "next", total: 0, notes: "" }); save(); render(true); toast("Added: " + name);
}

// ---------- backup ----------
function exportData() {
  DB.settings.lastBackup = todayKey(); save();
  const blob = new Blob([JSON.stringify(DB, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `daily-backup-${todayKey()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  render(true);
  toast("Backup downloaded");
}
function importData(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      DB = migrate(JSON.parse(r.result));
      save(); go("today"); toast("Backup restored");
    } catch (er) { toast("That file isn't a Daily backup."); }
  };
  r.readAsText(file);
}

// ---------- lock ----------
async function hash(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}
function needsLock() {
  if (!DB.settings.pin) return false;
  try { return sessionStorage.getItem("unlocked") !== "1"; } catch (e) { return true; }
}
$("#lockForm").addEventListener("submit", async e => {
  e.preventDefault(); e.stopPropagation();
  const v = $("#pinIn").value;
  if (await hash(DB.settings.salt + v) === DB.settings.pin) {
    try { sessionStorage.setItem("unlocked", "1"); } catch (er) {}
    $("#lock").hidden = true; $("#pinIn").value = ""; render();
  } else { $("#lockMsg").textContent = "Wrong PIN. Try again."; $("#pinIn").select(); }
});

// ---------- start ----------
if (!VIEWS[st.tab]) st.tab = "today";
if (needsLock()) { $("#lock").hidden = false; setTimeout(() => $("#pinIn").focus(), 50); }
else render();
// A new day can start while the app is open (left running overnight, or phone asleep at midnight).
// If you were looking at "today", move to the new today; if you were on another day, stay there.
function checkNewDay() {
  const t = todayKey();
  if (t === st.lastToday) return;
  if (st.date === st.lastToday) st.date = t;
  st.lastToday = t;
  if (!needsLock() && !st.busy) render(true);
}
st.lastToday = todayKey();
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { checkNewDay(); if (!needsLock() && !st.busy) render(true); } });
setInterval(checkNewDay, 30000);
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
