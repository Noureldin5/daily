// ---------------------------------------------------------------
// Default content. Edit freely: habits, routine, dhikr and topic
// ideas here are only the starting point. Once the app has run,
// your own edits live in the browser (Settings > Backup to save them).
// ---------------------------------------------------------------

const GROUPS = [
  { id: "fard",   name: "Prayers" },
  { id: "sunnah", name: "Sunnah prayers" },
  { id: "deen",   name: "Muslim habits" },
  { id: "body",   name: "Health" },
  { id: "code",   name: "Programmer" },
  { id: "mind",   name: "Mind" }
];

// opt: optional, not counted in the daily score
// auto: ticked automatically from another page
// since: the data version that introduced the habit. Older saves get it added once, as optional.
const DEFAULT_HABITS = [
  { id: "fajr",    g: "fard", name: "Fajr" },
  { id: "dhuhr",   g: "fard", name: "Dhuhr" },
  { id: "asr",     g: "fard", name: "Asr" },
  { id: "maghrib", g: "fard", name: "Maghrib" },
  { id: "isha",    g: "fard", name: "Isha" },

  { id: "s_fajr",    g: "sunnah", name: "2 before Fajr" },
  { id: "s_dhuhr_b", g: "sunnah", name: "4 before Dhuhr" },
  { id: "s_dhuhr_a", g: "sunnah", name: "2 after Dhuhr" },
  { id: "s_maghrib", g: "sunnah", name: "2 after Maghrib" },
  { id: "s_isha",    g: "sunnah", name: "2 after Isha" },
  { id: "witr",      g: "sunnah", name: "Witr" },
  { id: "duha",      g: "sunnah", name: "Duha", opt: true },
  { id: "qiyam",     g: "sunnah", name: "Qiyam al-layl", opt: true },

  { id: "quran",      g: "deen", name: "Read Quran (at least 1 page)" },
  { id: "adhkar_am",  g: "deen", name: "Morning adhkar" },
  { id: "adhkar_pm",  g: "deen", name: "Evening adhkar" },
  { id: "dhikr100",   g: "deen", name: "Dhikr, 100+ on the counter", auto: "dhikr" },
  { id: "adhkar_bed", g: "deen", name: "Adhkar before sleep" },
  { id: "good_deed",  g: "deen", name: "Sadaqah or a good deed", opt: true },
  { id: "kursi",      g: "deen", name: "Ayat al-Kursi after fard prayers", opt: true, since: 2 },
  { id: "mulk",       g: "deen", name: "Surah al-Mulk before sleep", opt: true, since: 2 },
  { id: "istighfar",  g: "deen", name: "Istighfar, 100 times", opt: true, since: 2 },
  { id: "dua_parents",g: "deen", name: "Du'a for my parents", opt: true, since: 2 },
  { id: "tafsir",     g: "deen", name: "Read the tafsir of one ayah", opt: true, since: 2 },

  { id: "workout", g: "body", name: "Today's training", auto: "train" },
  { id: "steps",   g: "body", name: "10k steps" },
  { id: "water",   g: "body", name: "3 L of water" },
  { id: "food",    g: "body", name: "Hit calories and 130 g protein" },
  { id: "creatine",g: "body", name: "Creatine 3–5 g" },
  { id: "sun",     g: "body", name: "Morning daylight, 10 min" },
  { id: "sleep",   g: "body", name: "Slept 8 hours" },
  { id: "breathe",    g: "body", name: "Breathing session", auto: "breathe", opt: true, since: 2 },
  { id: "sametime",   g: "body", name: "Same sleep and wake time", opt: true, since: 2 },
  { id: "veg",        g: "body", name: "Ate vegetables or fruit", opt: true, since: 2 },
  { id: "nosugar",    g: "body", name: "No sugary drinks", opt: true, since: 2 },
  { id: "stretch",    g: "body", name: "Stretched or mobility", opt: true, since: 2 },
  { id: "posture",    g: "body", name: "Posture breaks while coding (every 45–60 min)", opt: true, since: 2 },
  { id: "screenoff",  g: "body", name: "Screen off 30 min before bed", opt: true, since: 2 },

  { id: "deepwork", g: "code", name: "1 hour of focused coding" },
  { id: "learned",  g: "code", name: "Studied a topic", auto: "learn" },
  { id: "problem",  g: "code", name: "Solved a problem or wrote a test", opt: true },
  { id: "commit",   g: "code", name: "Pushed a commit", opt: true },
  { id: "review",   g: "code", name: "Reviewed what I learned yesterday", opt: true, since: 2 },
  { id: "notes",    g: "code", name: "Wrote notes", opt: true, since: 2 },
  { id: "pomodoro", g: "code", name: "Took a real break (Pomodoro)", opt: true, since: 2 },

  { id: "read",     g: "mind", name: "Read 20 minutes" },
  { id: "nophone",  g: "mind", name: "No phone first hour after waking" },
  { id: "plan",     g: "mind", name: "Planned tomorrow" }
];

const DEFAULT_ROUTINE = [
  { t: "05:30", x: "Fajr + Sunnah, Quran" },
  { t: "06:00", x: "Wake-up mobility, morning adhkar, daylight" },
  { t: "06:30", x: "Breakfast" },
  { t: "07:00", x: "Strength session (on strength days) or reading" },
  { t: "08:00", x: "Work: deep focus block" },
  { t: "12:30", x: "Dhuhr + Sunnah, lunch" },
  { t: "13:30", x: "University / study block" },
  { t: "15:30", x: "Asr, short walk" },
  { t: "16:00", x: "Programming practice" },
  { t: "17:30", x: "Push-up practice, snack" },
  { t: "18:00", x: "Maghrib + Sunnah, evening adhkar, dinner" },
  { t: "19:00", x: "BJJ class, or learn anything" },
  { t: "20:45", x: "After-class mobility, eat" },
  { t: "21:30", x: "Isha + Sunnah + Witr, read" },
  { t: "22:15", x: "Night downshift, plan tomorrow, adhkar before sleep" },
  { t: "22:30", x: "Sleep" }
];

const DEFAULT_DHIKR = [
  { id: "subhanallah", ar: "سُبْحَانَ ٱللَّٰهِ", tr: "SubhanAllah", en: "Glory be to Allah", target: 33 },
  { id: "alhamdulillah", ar: "ٱلْحَمْدُ لِلَّٰهِ", tr: "Alhamdulillah", en: "All praise is for Allah", target: 33 },
  { id: "allahuakbar", ar: "ٱللَّٰهُ أَكْبَرُ", tr: "Allahu Akbar", en: "Allah is the Greatest", target: 34 },
  { id: "tahlil", ar: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", tr: "La ilaha illallah", en: "There is no god but Allah", target: 100 },
  { id: "istighfar", ar: "أَسْتَغْفِرُ ٱللَّٰهَ", tr: "Astaghfirullah", en: "I seek Allah's forgiveness", target: 100 },
  { id: "bihamdihi", ar: "سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ", tr: "SubhanAllahi wa bihamdihi", en: "Glory and praise be to Allah", target: 100 },
  { id: "salawat", ar: "ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", tr: "Allahumma salli ala Muhammad", en: "Blessings on the Prophet", target: 10 },
  { id: "hawqala", ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ", tr: "La hawla wa la quwwata illa billah", en: "No power except with Allah", target: 10 }
];

const TRACKS = [
  { id: "study", name: "Study" },
  { id: "code",  name: "Programming" },
  { id: "any",   name: "Anything" }
];

const TOPIC_IDEAS = {
  study: [
    "Diploma project", "TinyML basics", "Machine learning fundamentals", "Statistics",
    "Linear algebra", "Computer networks", "Operating systems", "Databases theory",
    "Research paper writing", "Exam revision"
  ],
  code: [
    "Data structures + algorithms", "System design", "FastAPI advanced", "Django ORM performance",
    "PostgreSQL + SQL tuning", "Docker + Compose", "Kubernetes basics", "AWS Developer Associate",
    "Celery + Redis", "Testing with pytest", "Git deep dive", "Linux + Bash",
    "Nornir + NAPALM", "Ansible", "Grafana + observability", "TypeScript", "Vue 3", "Go"
  ],
  any: [
    "Tajweed", "Arabic", "Seerah", "Tafsir", "Russian", "English writing",
    "Personal finance", "Cooking healthy and cheap", "BJJ techniques review",
    "Nutrition science", "Public speaking", "Typing speed"
  ]
};

// ---------------- Training plan ----------------

const MOB = {
  morning:{name:"Wake up",min:7,note:"Outside or by a window for daylight.",items:[
    ["360° rib breathing, hands on lower ribs","5 breaths"],
    ["Neck + shoulder CARs","1 min"],["Elbow, wrist + finger CARs","1 min"],
    ["Hip 90/90 switches","8 each side"],["Ankle CARs + deep squat hold","1 min"],
    ["Cat-cow + open book with rib breathing","5 each"]]},
  postClass:{name:"After class",min:8,note:"Most BJJ injuries happen in sparring. Tap early.",items:[
    ["Shoulder isometric IR + ER at 70%","15s each way, each side"],
    ["Elbow eccentric extension (band)","3 each side"],
    ["Hip 90/90 + Cossack squat","30s each"],
    ["ROTATE","1 min"],
    ["Finger CARs + overhead lat stretch","1 min"],
    ["5 physiological sighs","1 min"]]},
  postStr:{name:"After strength",min:4,items:[
    ["Shoulder isometric IR + ER","1 round"],["ROTATE","1 min"],
    ["Doorway chest + lat stretch","1 min"],["5 physiological sighs","1 min"]]},
  kick:{name:"Flexibility + kicks",min:10,note:"PNF: stretch, push 8s at half effort, relax, sink deeper.",items:[
    ["Hamstring PNF","4 rounds each leg"],["Couch stretch PNF","4 rounds each leg"],
    ["Adductor PNF or pancake","4 rounds"],["Calf/ankle PNF","4 rounds"]]},
  deep:{name:"Deep joint care",min:14,items:[
    ["Shoulder IR + ER isometric, ramp to 70%","20s each way"],
    ["Band external rotation, slow lowering","6 each side"],
    ["Elbow eccentric extension + rotation","4 each side"],
    ["Copenhagen plank, short lever","3 × 20s each side"]]},
  restore:{name:"Long mobility flow",min:20,note:"Slow and easy.",items:[
    ["World's greatest stretch","5 each side"],["Couch stretch","90s each side"],
    ["Pigeon stretch","90s each side"],["Thoracic extension + chin tucks","8 each"],
    ["Jefferson curl, bodyweight only","5 slow reps"],["Turkish get-up, light","2 each side"],
    ["Body scan lying down","10 min"]]},
  night:{name:"Night downshift",min:8,note:"Phone away. Same bedtime every night.",items:[
    ["Legs up the wall, rib breathing, in 4 out 6–8","3 min"],
    ["Reverse Kegel on each inhale","10 slow reps"],
    ["Kegel: squeeze 3s, release 5–6s","10 reps"],
    ["Frog rock or butterfly","1.5 min"]]}
};
const ROTATE = {scap:"Scapular CARs or wall slides",wrist:"Loaded wrist rocks or wrist extension hold"};

// t: power | str | hyp | iso | grip | core ; opt = dropped when tired ; g = gym swap
const S = {
  A:{name:"Strength A: lower-body power",min:45,warm:"Warm-up: band lateral walks 2×12, pogo hops 2×15, 2 light sets of the first lift.",items:[
    {n:"Band-resisted squat jump",c:"Ankles, knees and hips extend together.",s:4,r:"3",t:"power",g:{n:"Hang power clean",c:"65–75% of max.",r:"2–3"}},
    {n:"Skater jump, stick the landing",c:"Weak side first.",s:3,r:"3 each",t:"power",opt:true},
    {n:"Heavy band deadlift",c:"Rest 2–3 min.",s:4,r:"5–6",t:"str",g:{n:"Trap bar deadlift",c:"Rest 2–3 min.",r:"4–5"}},
    {n:"Bulgarian split squat, 3s down",c:"Weak side first.",s:3,r:"8–10 each",t:"hyp"},
    {n:"Nordic curl",c:"No anchor? Sliding towel leg curl 8–12.",s:3,r:"4–6",t:"hyp"},
    {n:"Deep wall sit",c:"Long-length hold for knee tendons.",s:2,r:"30–45s",t:"iso"},
    {n:"Calf raise 3s down + tibialis raise",s:2,r:"15 each",t:"hyp",opt:true},
    {n:"Band woodchop, high to low",c:"Turn from the hips.",s:3,r:"8 each side",t:"core"}]},
  B:{name:"Strength B: upper-body strength",min:45,warm:"Warm-up: band pull-aparts 2×15, band IR + ER 1×15, scap push-ups 1×10.",items:[
    {n:"Plyo push-up",c:"Push the floor away fast.",s:4,r:"3–5",t:"power",g:{n:"Push press",c:"About 70%.",r:"3"}},
    {n:"Band pulldown + band floor press, superset",c:"Band over the top of a door.",s:4,r:"6–8",t:"str",g:{n:"Weighted pull-up + bench press",c:"Rest once after both.",r:"5–6"}},
    {n:"Single-arm band row, 1s pause",c:"Weak side first.",s:3,r:"10 each",t:"hyp"},
    {n:"Table inverted row",c:"Or a bedsheet knotted in a closed door.",s:3,r:"8–12",t:"hyp"},
    {n:"Band external rotation at 90°",c:"Slow lowering.",s:2,r:"12–15 each",t:"hyp"},
    {n:"Towel or backpack pinch hold",s:3,r:"20–40s",t:"grip"},
    {n:"Pallof press, 2s hold",s:2,r:"10 each side",t:"core"},
    {n:"L-sit on floor or two chairs",s:3,r:"10–20s",t:"core",opt:true}]},
  C:{name:"Strength C: lower body + rotation",min:45,warm:"Warm-up: lateral walks 2×12, hip airplanes 2×5, Turkish get-up 1×2 light.",items:[
    {n:"Explosive band pull-through",c:"Or backpack overhead back toss.",s:4,r:"6",t:"power",g:{n:"Hang high pull → hang power snatch",c:"Light and fast.",r:"2–3"}},
    {n:"Rotational band punch or backpack side toss",s:3,r:"5 each side",t:"power"},
    {n:"Zercher squat with a backpack",c:"Or band front squat.",s:3,r:"8–12",t:"hyp"},
    {n:"Single-leg RDL",s:3,r:"8–10 each",t:"hyp"},
    {n:"Single-leg hip thrust + Copenhagen plank",s:2,r:"10–12 / 20s",t:"hyp"},
    {n:"Suitcase carry or hold, one hand",c:"Stay tall.",s:3,r:"30–40s each",t:"core"},
    {n:"Cossack squat, iso-eccentric",s:2,r:"5 each side",t:"iso",opt:true}]},
  D:{name:"Strength D: upper-body muscle",min:45,warm:"Warm-up: scap push-ups 1×12, prone Y-T-W raises 2×10.",items:[
    {n:"Feet-elevated pike push-up",c:"Elbows at 45–60°.",s:3,r:"6–10",t:"hyp",g:{n:"Overhead press",c:"Strict.",r:"6–8"}},
    {n:"Band pulldown, 3s lowering",s:3,r:"8–12",t:"hyp",g:{n:"Chin-up, 3s lowering",c:"",r:"6–10"}},
    {n:"Single-arm band press",c:"Weak side first.",s:3,r:"10 each",t:"hyp"},
    {n:"Band face pull + external rotation",s:3,r:"15",t:"hyp"},
    {n:"Band lateral raise",s:2,r:"15–20",t:"hyp",opt:true},
    {n:"Band hammer curl + overhead triceps extension",s:3,r:"12–15",t:"hyp",opt:true},
    {n:"Band wrist curl + reverse wrist curl",s:2,r:"15–20",t:"grip"},
    {n:"Hollow body hold → hollow rocks",c:"Then 3 slow rib breaths.",s:3,r:"20–30s",t:"core"}]},
  L:{name:"Light session: neck, hands, balance",min:10,note:"Not right before class.",items:[
    {n:"Neck isometrics, 4 directions",c:"50–70% effort.",s:2,r:"15s each",t:"core"},
    {n:"Chin tucks against a wall",s:1,r:"10",t:"core"},
    {n:"Band finger extensions",s:2,r:"25",t:"grip"},
    {n:"Band reverse curl",s:2,r:"15",t:"grip"},
    {n:"Single-leg balance, eyes closed",s:2,r:"30s each",t:"core"},
    {n:"Side plank",s:2,r:"30s each",t:"core"}]}
};

const PUSH = [
  {v:"Regular + archer",tempo:"slow, 4s down",hard:"Archer push-ups",hr:"2 × 6–8 each side",leg:["Horse stance","2 × 45–90s"]},
  {v:"Pike",tempo:"iso-eccentric, 2–3 pauses down",hard:"Flow 1: pike → dive bomber → knee to elbow → pike",hr:"3–5 rounds"},
  {v:"Indian (dive bomber)",tempo:"fast up, controlled down",hard:"Indian push-ups",hr:"2 × 10–12",leg:["Cossack squat, slow","2 × 8 each"]},
  {v:"Regular, plus 30 finger + 30 reverse-hand",tempo:"iso holds",hard:"Bottom hold, chest 2 cm off the floor",hr:"2 × 30s",leg:["Deep split squat, 3s pause","2 × 8 each"]},
  {v:"Archer",tempo:"slow, 4s down",hard:"Archer push-ups, weak side first",hr:"2 × 6–8 each side"},
  {v:"Pike",tempo:"fast up",hard:"Flow 2: chair pike push-up → tuck → push-up → side plank reach",hr:"3 rounds",leg:["Calf raise on a step","2 × 20"]},
  null
];

const FUEL = {
  bjjstr:{k:4200,p:130,f:100,c:695},
  bjj:{k:4000,p:130,f:90,c:665},
  str:{k:3700,p:130,f:85,c:605},
  rest:{k:3700,p:130,f:85,c:605}
};

// Monday = 0
const WEEK = [
  {s:"B",cls:true,rot:"scap",extra:null},
  {s:"A",cls:false,rot:"wrist",extra:"kick"},
  {cls:true,rot:"scap",extra:"L"},
  {s:"D",cls:true,rot:"wrist",extra:null},
  {s:"C",cls:false,rot:"scap",extra:"kick"},
  {cls:true,rot:"wrist",extra:"L"},
  {rest:true}
];
