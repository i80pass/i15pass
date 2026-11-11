"use client";

// The Stateline backup module: a faithful React port of the approved
// Stateline mockup (reader board, direction switch, sample readings,
// mockup camera stills). Every number on it is a SAMPLE, labeled
// "Mockup readings" on the page itself, until the live feeds (Nevada
// 511, Caltrans, corridor speed data) connect. Nothing here claims to
// measure live traffic. Copy follows the site dash rule: no em dash or
// en dash characters anywhere.
import { useEffect, useRef, useState } from "react";
import "./stateline.css";

const BASE = {
  sb: { normal: { backup: 0, lineSpeed: 74 }, jam: { backup: 18, lineSpeed: 11 } },
  nb: { normal: { backup: 0, lineSpeed: 76 }, jam: { backup: 3, lineSpeed: 44 } },
};

function waitFromBackup(dir, b) {
  if (dir === "nb") return Math.round(b * 8.3);
  return Math.round(b * 7.2);
}

const COPY = {
  sb: {
    normal: {
      statusMain: "I-15 Open: No Backup at Stateline",
      statusSub: "Southbound Las Vegas to California is flowing freely",
      compare: "Drive to Los Angeles: 4 hr 10 min, normal for today",
      boardTop: "★ Southbound · Las Vegas to California ★",
      boardMid: "TRAFFIC FLOWING FREELY", boardMidClass: "led mid",
      backupSub: "No queue at the state line",
      speedSub: "Primm to Stateline, moving at speed",
      trend: "steady", trendSub: "Holding for the last hour",
      move: "LEAVE NOW", moveCls: "tile-value word ok", moveSub: "No reason to wait it out",
      times: [["35 MIN", "Flowing"], ["1 HR 50 MIN", "Flowing"], ["4 HR 10 MIN", "Flowing"], ["3 HR 40 MIN", "Flowing"]],
      adviceLed: "NO DELAYS TO CALIFORNIA", adviceLedClass: "led mid",
      adviceText: "Fuel up in Las Vegas or Primm, and you are clear desert driving to Barstow. Next services after Primm: Baker, 52 miles. If you are heading home on a Sunday, check back here before noon, that is when the line at Stateline starts to build.",
      otherDir: <>Other way, Northbound into Las Vegas: <b>flowing, no backup</b></>,
      faq: <>Right now: <b>no backup</b>. Southbound is flowing freely through Primm and across the line, and the full drive to Los Angeles is running its normal 4 hours 10 minutes. On the production page, the board at the top will carry the live reading.</>,
    },
    jam: {
      statusMain: "I-15 Open: {B}-Mile Backup at Stateline",
      statusSub: "Southbound is crawling from Primm into California",
      compare: "Drive to Los Angeles: 6 hr 20 min, 2 hr 10 min over the normal 4 hr 10 min",
      boardTop: "⚠ Southbound · Sunday Backup In Progress ⚠",
      boardMid: "STOP-AND-GO FROM PRIMM", boardMidClass: "led mid red",
      backupSub: "Queue back from the CA line to Primm",
      speedSub: "Primm to Stateline, crawling",
      trend: "clearing", trendSub: "Down from 22 miles at 2 PM",
      move: "WAIT ~1 HR", moveCls: "tile-value word warn", moveSub: "Or leave after 7 PM, it thins fast",
      times: [["58 MIN", "Slow"], ["3 HR 10 MIN", "Very slow"], ["6 HR 20 MIN", "Very slow"], ["5 HR 15 MIN", "Slow"]],
      adviceLed: "EXPECT 2+ HOURS EXTRA", adviceLedClass: "led mid red",
      adviceText: "The queue runs from the California line back through Primm, three lanes squeeze to two, then the agricultural checkpoint near Mountain Pass slows the rest. If you can, wait in Las Vegas and leave after 7 PM. Need to go now? Fuel and water before Primm, there is no getting out once you are in it.",
      otherDir: <>Other way, Northbound into Las Vegas: <b>flowing, no backup</b></>,
      faq: <>Right now: <b>a major backup</b> at the state line, adding about <b>2 hours 10 minutes</b>, the full drive to Los Angeles is running near 6 hours 20 minutes. If you can wait, leave after 7 PM; the production board will update as it clears.</>,
    },
  },
  nb: {
    normal: {
      statusMain: "I-15 Open: No Backup at Stateline",
      statusSub: "Northbound California to Las Vegas is flowing freely",
      compare: "Drive to Las Vegas: 4 hr 10 min, normal for today",
      boardTop: "★ Northbound · California to Las Vegas ★",
      boardMid: "TRAFFIC FLOWING FREELY", boardMidClass: "led mid",
      backupSub: "No queue at the state line",
      speedSub: "Stateline to Primm, moving at speed",
      trend: "steady", trendSub: "Holding for the last hour",
      move: "LEAVE NOW", moveCls: "tile-value word ok", moveSub: "No reason to wait it out",
      times: [["1 HR 50 MIN", "Flowing"], ["35 MIN", "Flowing"], ["4 HR 10 MIN", "Flowing"], ["3 HR 40 MIN", "Flowing"]],
      adviceLed: "NO DELAYS TO LAS VEGAS", adviceLedClass: "led mid",
      adviceText: "Fuel up in Barstow or Baker, and you are clear desert driving into Las Vegas. Heading in on a Friday? That is this direction's busy time, check back Friday afternoon.",
      otherDir: <>Other way, Southbound leaving Las Vegas: <b>flowing, no backup</b></>,
      faq: <>Right now: <b>no backup</b>. Northbound is flowing freely across the line and into Las Vegas, and the full drive from Los Angeles is running its normal 4 hours 10 minutes. On the production page, the board at the top will carry the live reading.</>,
    },
    jam: {
      statusMain: "I-15 Open: Slow Into Las Vegas",
      statusSub: "Northbound is heavy from Primm into Las Vegas",
      compare: "Drive to Las Vegas: 4 hr 35 min, 25 min over the normal 4 hr 10 min",
      boardTop: "⚠ Northbound · Heavy Into Vegas ⚠",
      boardMid: "SLOW FROM PRIMM TO SLOAN", boardMidClass: "led mid",
      backupSub: "Slowdown on the Nevada side, Primm to Sloan",
      speedSub: "Stateline to Primm, thickening",
      trend: "building", trendSub: "Friday afternoon inbound build",
      move: "GO NOW", moveCls: "tile-value word warn", moveSub: "It only gets heavier toward evening",
      times: [["2 HR 5 MIN", "Slow"], ["50 MIN", "Slow"], ["4 HR 35 MIN", "Slow"], ["4 HR 5 MIN", "Slow"]],
      adviceLed: "EXPECT ABOUT 25 MIN EXTRA", adviceLedClass: "led mid",
      adviceText: "California side is clear, the slowdown is on the Nevada side, from Primm into the valley, as Friday traffic pours into Las Vegas. No way around it on I-15; fuel up in Baker and ride it out.",
      otherDir: <>Other way, Southbound leaving Las Vegas: <b>flowing, no backup</b></>,
      faq: <>Right now: northbound is <b>slow from Primm into Las Vegas</b>, adding about <b>25 minutes</b>, the state line itself is clear; the thickening is on the Nevada side. On the production page, the board at the top will carry the live reading.</>,
    },
  },
};

const ROUTES = {
  sb: [["Las Vegas → Primm", "Exit 1 · Stateline · 41 miles"], ["Primm → Barstow", "Past Baker & Mountain Pass · 117 miles"], ["Las Vegas → Los Angeles", "Full drive · 270 miles"], ["Las Vegas → San Bernardino", "Via Cajon Pass · 232 miles"]],
  nb: [["Barstow → Primm", "Past Baker & Mountain Pass · 117 miles"], ["Primm → Las Vegas", "Exit 1 · Stateline · 41 miles"], ["Los Angeles → Las Vegas", "Full drive · 270 miles"], ["San Bernardino → Las Vegas", "Via Cajon Pass · 232 miles"]],
};

const STRIPS = {
  sb: {
    normal: [["Primm → Stateline", 74], ["Stateline → Mtn Pass", 71], ["Mtn Pass → Baker", 73], ["Baker → Barstow", 75]],
    jam: [["Primm → Stateline", 11], ["Stateline → Mtn Pass", 16], ["Mtn Pass → Baker", 38], ["Baker → Barstow", 72]],
  },
  nb: {
    normal: [["Barstow → Baker", 75], ["Baker → Mtn Pass", 72], ["Mtn Pass → Stateline", 74], ["Stateline → Primm", 76]],
    jam: [["Barstow → Baker", 74], ["Baker → Mtn Pass", 70], ["Mtn Pass → Stateline", 73], ["Stateline → Primm", 41]],
  },
};

function cam(key, name, mile, noteFlow, noteJam, spdFlow, spdJam) {
  return { key, name, mile, noteFlow, noteJam, spdFlow, spdJam };
}
const CAMS = {
  sb: [
    cam("sloan", "Sloan", "I-15 · MP 23", "Leaving the Las Vegas valley, moving well.", "Heavy but moving out of the valley.", 72, 48),
    cam("jean", "Jean", "I-15 · MP 12", "Open desert, light traffic both ways.", "Traffic thickening, brake lights ahead.", 75, 32),
    cam("primm", "Primm, Stateline", "I-15 · MP 1", "The squeeze point. No queue at the line.", "End of the queue is here. Crawl begins.", 74, 9),
    cam("stateline", "Stateline (CA side)", "I-15 · CA MP 196", "Two lanes into California, flowing.", "Bumper to bumper through the line.", 71, 12),
    cam("mountainpass", "Mountain Pass", "I-15 · CA MP 178", "Checkpoint clear, trucks moving.", "Checkpoint adding to the delay.", 70, 26),
    cam("baker", "Baker", "I-15 · CA MP 115", "Halfway to Barstow. Clear and hot.", "Clear once you are through, desert opens up.", 74, 73),
  ],
  nb: [
    cam("baker", "Baker", "I-15 · CA MP 115", "Starting the climb toward Nevada. Clear.", "Clear in California, the slowdown is up ahead.", 74, 73),
    cam("mountainpass", "Mountain Pass", "I-15 · CA MP 178", "Over the pass, checkpoint clear.", "Moving fine over the pass.", 72, 71),
    cam("stateline", "Stateline (CA side)", "I-15 · CA MP 196", "Crossing into Nevada, no queue this way.", "Flowing across the line into Nevada.", 74, 74),
    cam("primm", "Primm, Stateline", "I-15 · MP 1", "Welcome to Nevada. Flowing past Primm.", "Thickening on the Nevada side past Primm.", 76, 38),
    cam("jean", "Jean", "I-15 · MP 12", "Open desert, light traffic.", "Slow and heavy toward town.", 75, 29),
    cam("sloan", "Sloan", "I-15 · MP 23", "Coming into the Las Vegas valley, moving well.", "Bumper to bumper coming into the valley.", 73, 22),
  ],
};
const NB_JAM_KEYS = { primm: true, jean: true, sloan: true };

const CHARTS = {
  sb: {
    head: "The Sunday Build, Hour by Hour",
    hours: ["9A", "10A", "11A", "12P", "1P", "2P", "3P", "4P", "5P", "6P", "7P"],
    vals: [0, 1, 4, 8, 13, 18, 22, 21, 16, 9, 3],
    note: <>On a Sunday the line starts forming late morning, peaks mid-afternoon, and drains fast after 7 PM. Leaving Las Vegas <b>before 10 AM or after 7 PM</b> skips almost all of it.</>,
  },
  nb: {
    head: "The Friday Build, Hour by Hour",
    hours: ["10A", "11A", "12P", "1P", "2P", "3P", "4P", "5P", "6P", "7P", "8P"],
    vals: [0, 0, 1, 2, 4, 7, 10, 12, 11, 7, 3],
    note: <>Northbound peaks <b>Friday late afternoon</b>, as the weekend pours into Las Vegas. It is a slowdown, not a standstill, nothing like the Sunday line the other way.</>,
  },
};

const WEEK_SB = [
  { d: "Mon", pct: 22, t: "Light", col: "#15803d" }, { d: "Tue", pct: 14, t: "Lightest", col: "#15803d" },
  { d: "Wed", pct: 16, t: "Light", col: "#15803d" }, { d: "Thu", pct: 28, t: "Moderate", col: "#b45309" },
  { d: "Fri", pct: 20, t: "Light SB", col: "#15803d" }, { d: "Sat", pct: 38, t: "Steady", col: "#b45309" },
  { d: "Sun", pct: 96, t: "THE JAM", col: "#dc2626" },
];
const WEEK_NB = [
  { d: "Mon", pct: 20, t: "Light", col: "#15803d" }, { d: "Tue", pct: 14, t: "Lightest", col: "#15803d" },
  { d: "Wed", pct: 16, t: "Light", col: "#15803d" }, { d: "Thu", pct: 30, t: "Moderate", col: "#b45309" },
  { d: "Fri", pct: 88, t: "BUSY FRI", col: "#dc2626" }, { d: "Sat", pct: 40, t: "Steady", col: "#b45309" },
  { d: "Sun", pct: 30, t: "Moderate", col: "#b45309" },
];

const SVC = {
  sb: [
    ["Primm", "At the line · Exit 1", "Fuel, food, casinos, outlets, and the last easy stop before California. If the board says wait, this is where you wait it out."],
    ["Baker", "52 mi past the line", "Fuel, food, and the world's tallest thermometer. First real stop in California, and the point of no return on a jam day."],
    ["Barstow", "117 mi past the line", "Full services, food, and lodging where I-15 meets I-40. If you made it here, the desert is behind you."],
    ["Jean", "11 mi before the line", "Last Nevada fuel before Primm, on the way down from Las Vegas. Top off here and you skip the Primm lines entirely."],
    ["Sloan", "22 mi before the line", "Quick fuel stop at the edge of the Las Vegas valley, the last cheap gas heading south."],
    ["Las Vegas", "41 mi before the line", "Everything, obviously. The move on a bad Sunday: stay here an extra hour instead of sitting at Primm."],
  ],
  nb: [
    ["Primm", "At the line · Exit 1", "Welcome to Nevada: fuel, food, casinos, and outlets right at the border. First stop after the long California climb."],
    ["Jean", "11 mi past the line", "Quick fuel and a breather, 11 miles into Nevada on the way to the valley."],
    ["Las Vegas", "41 mi past the line", "The destination. Everything, and on a Friday, the traffic you're driving into."],
    ["Baker", "52 mi before the line", "Last full stop in California: fuel, food, and the thermometer. After Baker it's 100+ miles of desert to Barstow the other way."],
    ["Mountain Pass", "24 mi before the line", "No services, just the climb and the checkpoint. Fuel up in Baker; there's nothing up here."],
    ["Barstow", "117 mi before the line", "Full services where I-15 meets I-40, the last big town before the desert stretch to Stateline."],
  ],
};

function nowLabel() {
  const d = new Date();
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  const mm = (m < 10 ? "0" : "") + m;
  return {
    bar: "UPDATED " + days[d.getDay()] + " " + h + ":" + mm + " " + ap + " PT",
    log: h + ":" + mm + " " + ap,
    cam: days[d.getDay()] + " " + h + ":" + mm + " " + ap,
  };
}

function fmtWait(mins) {
  if (mins <= 0) return "+0 MIN";
  if (mins < 60) return "+" + mins + " MIN";
  const h = Math.floor(mins / 60), m = mins % 60;
  return "+" + h + " HR " + (m < 10 ? "0" : "") + m + " MIN";
}

function speedColor(mph) {
  if (mph >= 55) return "#15803d";
  if (mph >= 30) return "#b45309";
  return "#d92d20";
}

function seedLog(dir, mode, live, t) {
  if (dir === "sb" && mode === "jam") {
    return [
      { t, x: <><b>Backup now {live.backup} miles</b>, queue tail is at Primm, Exit 1.</> },
      { t, x: <>Speed at the line: <b>{live.lineSpeed} mph</b>. Stateline to Mountain Pass running 16 mph.</> },
      { t, x: <>Peak so far today: <b>22 miles at 2 PM</b>. It has been shrinking since.</> },
      { t, x: <>Agricultural checkpoint at Mountain Pass is adding to the delay.</> },
      { t, x: <>Northbound across the line: flowing, no backup.</> },
    ];
  }
  if (dir === "nb" && mode === "jam") {
    return [
      { t, x: <><b>Northbound slow from Primm to Sloan</b>, about +25 minutes into Las Vegas.</> },
      { t, x: <>State line itself is clear both ways at the crossing.</> },
      { t, x: <>Friday build is on its usual pace, heaviest toward evening.</> },
      { t, x: <>Southbound leaving Las Vegas: flowing, no backup.</> },
    ];
  }
  if (dir === "nb") {
    return [
      { t, x: <><b>No backup at the line.</b> Northbound flowing at {live.lineSpeed} mph through Primm.</> },
      { t, x: <>Full drive Los Angeles to Las Vegas running its normal 4 hr 10 min.</> },
      { t, x: <>Next watch: Friday afternoon, this direction's busy window.</> },
    ];
  }
  return [
    { t, x: <><b>No backup at the line.</b> Southbound flowing at {live.lineSpeed} mph through Primm.</> },
    { t, x: <>Full drive Las Vegas to Los Angeles running its normal 4 hr 10 min.</> },
    { t, x: <>Next watch: Sunday late morning, when the line usually starts to form.</> },
  ];
}

export default function StatelineBoard({ embedded = false }) {
  const [dir, setDir] = useState("sb");
  const [mode, setMode] = useState("normal");
  const [live, setLive] = useState({ backup: 0, prevBackup: 0, lineSpeed: 74 });
  const [log, setLog] = useState(() => seedLog("sb", "normal", { backup: 0, lineSpeed: 74 }, ""));
  const [clock, setClock] = useState("UPDATED");
  const [camTs, setCamTs] = useState("");
  const [refreshTxt, setRefreshTxt] = useState("Mockup readings");
  const [flash, setFlash] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [alertPhone, setAlertPhone] = useState("");
  const [alertDir, setAlertDir] = useState("sb");
  const [alertMsg, setAlertMsg] = useState(null);
  const [alertBtn, setAlertBtn] = useState("Get the Free Alert");
  const camsRef = useRef(null);
  const stateRef = useRef({ dir: "sb", mode: "normal", live: { backup: 0, prevBackup: 0, lineSpeed: 74 } });

  const isJam = mode === "jam";
  const c = COPY[dir][mode];
  const wait = waitFromBackup(dir, live.backup);

  function doFlash() {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 750);
  }

  function applyState(newDir, newMode) {
    const base = BASE[newDir][newMode];
    const newLive = { backup: base.backup, prevBackup: base.backup, lineSpeed: base.lineSpeed };
    stateRef.current = { dir: newDir, mode: newMode, live: newLive };
    setDir(newDir);
    setMode(newMode);
    setLive(newLive);
    setLog(seedLog(newDir, newMode, newLive, nowLabel().log));
  }

  function liveTick(manual) {
    const s = stateRef.current;
    const lv = { ...s.live, prevBackup: s.live.backup };
    if (s.mode === "jam" && s.dir === "sb") {
      const r = Math.random();
      if (r < 0.42 && lv.backup > 12) lv.backup -= 1;
      else if (r > 0.78 && lv.backup < 24) lv.backup += 1;
      lv.lineSpeed = Math.max(8, Math.min(16, lv.lineSpeed + (Math.random() < 0.5 ? -1 : 1)));
    } else if (s.mode === "jam" && s.dir === "nb") {
      lv.backup = Math.max(2, Math.min(5, lv.backup + (Math.random() < 0.5 ? 0 : (Math.random() < 0.5 ? 1 : -1))));
      lv.lineSpeed = Math.max(38, Math.min(52, lv.lineSpeed + (Math.random() < 0.5 ? -2 : 2)));
    } else {
      lv.lineSpeed = Math.max(70, Math.min(78, lv.lineSpeed + (Math.random() < 0.5 ? -1 : 1)));
    }
    stateRef.current = { ...s, live: lv };
    setLive(lv);
    const t = nowLabel().log;
    if (lv.backup !== lv.prevBackup) {
      setLog((prev) => [{ t, x: <><b>Backup now {lv.backup} miles</b> (was {lv.prevBackup}). Added wait about {fmtWait(waitFromBackup(s.dir, lv.backup)).toLowerCase()}.</> }, ...prev].slice(0, 6));
    } else if (manual) {
      setLog((prev) => [{ t, x: <>Fresh reading checked, <b>no change</b>. Backup holds at {lv.backup} miles, line speed {lv.lineSpeed} mph.</> }, ...prev].slice(0, 6));
    }
    setRefreshTxt("Mockup readings · " + t);
    doFlash();
  }

  useEffect(() => {
    setMounted(true);
    const nl = nowLabel();
    setClock(nl.bar);
    setCamTs(nl.cam);
    setRefreshTxt("Mockup readings · " + nl.log);
    setLog(seedLog("sb", "normal", { backup: 0, lineSpeed: 74 }, nl.log));
    const clockId = window.setInterval(() => {
      const n = nowLabel();
      setClock(n.bar);
      setCamTs(n.cam);
    }, 30000);
    const tickId = window.setInterval(() => liveTick(false), 45000);
    return () => {
      window.clearInterval(clockId);
      window.clearInterval(tickId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trend = (() => {
    if (isJam && live.backup < live.prevBackup) return { word: <>CLEARING <span className="warn">↘</span></>, sub: "Shrinking, down from " + live.prevBackup + " miles" };
    if (isJam && live.backup > live.prevBackup) return { word: <>BUILDING <span className="bad">↗</span></>, sub: "Growing, up from " + live.prevBackup + " miles" };
    if (c.trend === "steady") return { word: <>STEADY <span className="ok">→</span></>, sub: c.trendSub };
    if (c.trend === "clearing") return { word: <>CLEARING <span className="warn">↘</span></>, sub: c.trendSub };
    return { word: <>BUILDING <span className="warn">↗</span></>, sub: c.trendSub };
  })();

  const chart = CHARTS[dir];
  const chartMax = Math.max(...chart.vals);
  const week = dir === "nb" ? WEEK_NB : WEEK_SB;
  const todayIdx = mounted ? (new Date().getDay() + 6) % 7 : -1;
  const TitleTag = embedded ? "div" : "h1";

  function onAlertSubmit(ev) {
    ev.preventDefault();
    const phone = alertPhone.replace(/\D/g, "");
    if (phone.length < 10) {
      setAlertMsg({ err: true, text: "Enter your full cell number, the alert is a text, so we need the number it goes to." });
      return;
    }
    const dirTxt = alertDir === "nb" ? "Los Angeles → Las Vegas" : "Las Vegas → Los Angeles";
    setAlertMsg({ err: false, text: "You're set for " + dirTxt + ". First text comes the next time the Stateline backup builds, and the all-clear when it drains." });
    setAlertBtn("Alert Set ✓");
  }

  return (
    <div className="slx">
      {/* ================= STATUS BAR ================= */}
      <div className={"statusbar" + (isJam && live.backup > 0 ? " jam" : "")}>
        <div className="statusbar-inner">
          <span className="pulse" aria-hidden="true"></span>
          <div>
            <div className="status-main">{c.statusMain.replace("{B}", live.backup)}</div>
            <div className="status-sub">{c.statusSub}</div>
            <div className="status-compare">{c.compare}</div>
          </div>
          <div className="status-updated">
            <b>{clock}</b>
            <span>Mockup readings · sample numbers</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        {/* ================= HEADER ================= */}
        <header className="site">
          <svg className="shield" viewBox="0 0 100 100" role="img" aria-label="Interstate 15 shield">
            <path d="M50 97 C30 88 12 76 8 52 L8 14 C8 9 11 6 16 6 L84 6 C89 6 92 9 92 14 L92 52 C88 76 70 88 50 97 Z" fill="#1d4ed8" stroke="#fff" strokeWidth="3.5" />
            <path d="M10.5 8.5 L89.5 8.5 L89.5 32 C70 26 30 26 10.5 32 Z" fill="#bf0d3e" />
            <text x="50" y="25" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="600" fontSize="10.5" letterSpacing="1.5" fill="#fff">INTERSTATE</text>
            <text x="50" y="76" textAnchor="middle" fontFamily="Oswald, sans-serif" fontWeight="700" fontSize="40" fill="#fff">15</text>
          </svg>
          <div style={{ minWidth: 0 }}>
            <TitleTag className="site-title">I-15 Stateline <span className="red">Traffic</span></TitleTag>
            <div className="site-kicker"><b>The backup, the wait, the cameras</b> · Primm · Year-round</div>
          </div>
          <button type="button" className="live-chip" onClick={() => liveTick(true)} title="Show a new sample reading"><i></i><span>{refreshTxt}</span> <small>· tap for a new sample</small></button>
        </header>

        {/* ================= DIRECTION ================= */}
        <div className="dirswitch">
          <div className="dirswitch-label">Which way are you driving?</div>
          <div className="dir-opts" role="group" aria-label="Driving direction">
            <button type="button" className="dir-opt" aria-pressed={dir === "sb"} onClick={() => { if (dir !== "sb") applyState("sb", mode); }}>
              <span className="dir-route">Las Vegas <span className="arr">→</span> Los Angeles</span>
              <span className="dir-desc">Southbound</span>
            </button>
            <button type="button" className="dir-opt" aria-pressed={dir === "nb"} onClick={() => { if (dir !== "nb") applyState("nb", mode); }}>
              <span className="dir-route">Los Angeles <span className="arr">→</span> Las Vegas</span>
              <span className="dir-desc">Northbound</span>
            </button>
          </div>
          <div className="dir-banner">
            {dir === "nb" ? "Northbound: Los Angeles → Las Vegas " : "Southbound: Las Vegas → Los Angeles "}
            <small>{dir === "nb" ? "Leaving California, heading into Las Vegas." : "Leaving Las Vegas, heading into California."}</small>
          </div>
          <p className="other-dir">{c.otherDir}</p>
        </div>

        {/* ================= MAIN READER BOARD ================= */}
        <div className="gantry" aria-label="Stateline backup reader board">
          <div className="gantry-posts" aria-hidden="true"><i></i><i></i></div>
          <div className={"board" + (flash ? " flash" : "")}>
            <div className="board-inner">
              <div className="led small">{c.boardTop}</div>
              <div className="led hero">
                {dir === "nb" && isJam ? "VEGAS SLOWDOWN" : "STATELINE BACKUP"}<br />
                <span className="num">{live.backup} MILES</span>
              </div>
              <div className={c.boardMidClass}>{isJam ? c.boardMid : "TRAFFIC FLOWING FREELY"}</div>
              <div className="board-divider"></div>
              <div className="led mid" style={{ fontSize: "clamp(16px,3.6vw,26px)" }}>
                ADDED WAIT: <span style={{ color: "#fff" }}>{fmtWait(wait)}</span> &nbsp;·&nbsp; {isJam ? (dir === "sb" ? "WAIT IT OUT IF YOU CAN" : "GO NOW, IT BUILDS") : "LEAVE ANYTIME"}
              </div>
            </div>
          </div>
        </div>

        {/* ================= INSTANT NUMBERS ================= */}
        <div className="tiles" aria-label="Key numbers">
          <div className="tile">
            <div className="tile-label">Backup right now</div>
            <div className="tile-value"><span>{live.backup}</span> <span className="unit">MILES</span></div>
            <div className="tile-sub">{c.backupSub}</div>
          </div>
          <div className="tile">
            <div className="tile-label">Added wait</div>
            <div className="tile-value"><span>+{wait}</span> <span className="unit">MIN</span></div>
            <div className="tile-sub">On top of a normal drive</div>
          </div>
          <div className="tile">
            <div className="tile-label">Speed at the line</div>
            <div className="tile-value"><span>{live.lineSpeed}</span> <span className="unit">MPH</span></div>
            <div className="tile-sub">{c.speedSub}</div>
          </div>
          <div className="tile">
            <div className="tile-label">Trend</div>
            <div className="tile-value word">{trend.word}</div>
            <div className="tile-sub">{trend.sub}</div>
          </div>
          <div className="tile">
            <div className="tile-label">Best move</div>
            <div className={c.moveCls}>{c.move}</div>
            <div className="tile-sub">{c.moveSub}</div>
          </div>
        </div>

        {/* ================= SPEED BY STRETCH ================= */}
        <div className="strip" aria-label="Speed by stretch of road">
          {STRIPS[dir][mode].map(([name, mph]) => (
            <div className="seg-card" key={name}>
              <div className="seg-name">{name}</div>
              <div className="seg-speed">{mph} <span className="unit">MPH AVG</span></div>
              <div className="seg-bar"><i style={{ width: Math.min(100, Math.round((mph / 80) * 100)) + "%", background: speedColor(mph) }}></i></div>
            </div>
          ))}
        </div>

        {/* ================= PREVIEW SWITCH ================= */}
        <div className="switcher">
          <span className="switcher-label">Preview the board:</span>
          <div className="seg" role="group" aria-label="Preview board state">
            <button type="button" aria-pressed={mode === "normal"} onClick={() => applyState(dir, "normal")}>Today, Flowing</button>
            <button type="button" className="jam-btn" aria-pressed={mode === "jam"} onClick={() => applyState(dir, "jam")}>Bad Sunday, Jam</button>
          </div>
          <span className="switcher-note">Preview the page's two faces. Watch it for a minute, the sample readings keep updating either way.</span>
        </div>

        {/* ================= DRIVE TIMES ================= */}
        <div className="section-head">
          <h2>{dir === "nb" ? "Drive Times, Los Angeles → Las Vegas" : "Drive Times, Las Vegas → Los Angeles"}</h2>
          <span>{dir === "nb" ? "Northbound · Mountain Pass to Primm stretch included" : "Southbound · Primm to Mountain Pass stretch included"}</span>
        </div>
        <div className="times">
          {ROUTES[dir].map(([route, sub], i) => (
            <div className="trow" key={route}>
              <div className="troute">{route}<small>{sub}</small></div>
              <div className={"tstatus " + (c.times[i][1] === "Flowing" ? "ok" : "bad")}>{c.times[i][1]}</div>
              <div className="ttime"><span className="big">{c.times[i][0]}</span><span className="norm">NORMAL {["35 MIN", "1 HR 50 MIN", "4 HR 10 MIN", "3 HR 40 MIN"][dir === "sb" ? i : [1, 0, 2, 3][i]]}</span></div>
            </div>
          ))}
        </div>

        {/* ================= CAMERAS ================= */}
        <div className="section-head">
          <h2>Cameras, In Drive Order</h2>
          <span>{(dir === "nb" ? "Baker to Sloan, the way you drive it" : "Sloan to Baker, the way you drive it") + " · mockup stills"}</span>
        </div>
        <div className="cams" ref={camsRef}>
          {CAMS[dir].map((cm) => {
            const useJam = isJam && (dir === "sb" || NB_JAM_KEYS[cm.key]);
            const spd = isJam ? cm.spdJam : cm.spdFlow;
            const spdCls = spd >= 55 ? "ok" : spd >= 30 ? "warn" : "bad";
            return (
              <article className="cam" key={cm.key}>
                <div className="cam-view">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={"/stateline-cams/cam-" + cm.key + "-" + (useJam ? "jam" : "flow") + ".jpg"} alt={"Mockup camera view, I-15 at " + cm.name + ", traffic " + (useJam ? "backed up" : "flowing")} loading="lazy" />
                  <span className="cam-live"><i></i>CAM</span>
                  <span className="cam-mile">{cm.mile}</span>
                  <span className="cam-mock">Mockup</span>
                  <span className="cam-ts">{camTs}</span>
                </div>
                <div className="cam-meta"><span className="cam-name">{cm.name}</span><span className="cam-dir">{dir === "sb" ? "Southbound" : "Northbound"}</span></div>
                <div className="cam-note">{isJam ? cm.noteJam : cm.noteFlow}</div>
                <div className="cam-foot"><span className={"cam-speed " + spdCls}>{spd} MPH</span><span className="cam-upd">Sample still · {camTs}</span></div>
              </article>
            );
          })}
        </div>
        <p className="cam-link-note">Camera stills are labeled <b>MOCKUP</b> until the live Nevada &amp; California feeds are connected, locations, order, and mileposts are the real ones.</p>

        {/* ================= BACKUP BY THE HOUR ================= */}
        <div className="section-head">
          <h2>{isJam && dir === "sb" ? "Today's Backup, Hour by Hour" : chart.head}</h2>
          <span>Backup in miles, state line</span>
        </div>
        <div className="chart-card">
          <div className="chart">
            {chart.vals.map((v, i) => {
              const col = v >= 15 ? "#dc2626" : v >= 6 ? "#d97706" : "#15803d";
              return (
                <div className="cbar" key={i}>
                  <div className="v" style={{ color: col }}>{v ? v : ""}</div>
                  <div className="col" style={{ height: Math.max(2, chartMax ? Math.round((v / chartMax) * 100) : 0) + "%", background: col }}></div>
                  <div className="h">{chart.hours[i]}</div>
                </div>
              );
            })}
          </div>
          <p className="chart-note">{chart.note}</p>
        </div>

        {/* ================= WHEN IT BACKS UP ================= */}
        <div className="section-head">
          <h2>When It Backs Up</h2>
          <span>{dir === "nb" ? "The weekly pattern, northbound" : "The weekly pattern, southbound"}</span>
        </div>
        <div className="week">
          <div className="week-grid">
            {week.map((w, i) => (
              <div className={"day" + (i === todayIdx ? " today" : "")} key={w.d}>
                <div className="d">{w.d}{i === todayIdx ? " · Today" : ""}</div>
                <div className="bar"><i style={{ width: w.pct + "%", background: w.col }}></i></div>
                <div className="t" style={{ color: w.col }}>{w.t}</div>
              </div>
            ))}
          </div>
          <p className="week-note">
            {dir === "nb" ? (
              <>Northbound's busy time is <b>Friday afternoon</b>, when California heads to Las Vegas for the weekend. The famous Stateline jam is the other direction, <b>Sunday, heading home to California</b>.</>
            ) : (
              <>The jam is a <b>Sunday and holiday-Monday</b> story: three Nevada lanes squeeze into two in California, then the agricultural checkpoint near Mountain Pass slows what's left. Reported backups run <b>12 to 26 miles</b> back from the state line. The rest of the week, and all year, this page stays up watching it.</>
            )}
          </p>
        </div>

        {/* ================= SECOND READER BOARD ================= */}
        <div className="section-head">
          <h2>{dir === "nb" ? "Before You Leave California" : "Before You Leave Las Vegas"}</h2>
        </div>
        <div className="advice">
          <div className="board">
            <div className="board-inner">
              <div className={c.adviceLedClass}>{c.adviceLed}</div>
              <p>{c.adviceText}</p>
            </div>
          </div>
        </div>

        {/* ================= READINGS LOG ================= */}
        <div className="section-head">
          <h2>Readings Log</h2>
          <span>Sample entries, how the log will read once live</span>
        </div>
        <div className="log">
          {log.slice(0, 6).map((e, i) => (
            <div className="log-row" key={i}><span className="log-time">{e.t}</span><span>{e.x}</span></div>
          ))}
        </div>

        {/* ================= WHY IT BACKS UP ================= */}
        <div className="section-head">
          <h2>Why It Backs Up</h2>
          <span>Three facts explain every Sunday</span>
        </div>
        <div className="why-grid">
          <div className="why">
            <div className="big-num">3 → 2</div>
            <h3>The Lane Drop</h3>
            <p>Southbound I-15 runs three lanes through Nevada, then squeezes to two at the California line. Every car leaving Las Vegas has to fit through that funnel at Primm, on a Sunday afternoon, they can't all fit at once.</p>
          </div>
          <div className="why">
            <div className="big-num">+1</div>
            <h3>The Checkpoint</h3>
            <p>Just past the line, near Mountain Pass, California's agricultural inspection station slows traffic again. Fruit, plants, and a wave-through for most cars, but when the queue from the lane drop reaches it, the two delays stack into one long crawl.</p>
          </div>
          <div className="why">
            <div className="big-num">0</div>
            <h3>Ways Around It</h3>
            <p>There is no shortcut. The desert detours add hours, not save them. On a bad Sunday the real choice is only this: leave before 10 AM, leave after 7 PM, or sit in it with fuel, water, and patience.</p>
          </div>
        </div>

        {/* ================= WORST BACKUPS ================= */}
        <div className="section-head">
          <h2>Worst Backups of the Year</h2>
          <span>The days this page earns its keep</span>
        </div>
        <div className="worst">
          {[["Thanksgiving Sunday", "The biggest leave-Las-Vegas day of the fall", "20-26 MI"],
            ["Labor Day Monday", "Summer's last weekend heads home at once", "18-24 MI"],
            ["July 4th Weekend Sunday", "Holiday traffic plus full summer heat", "15-22 MI"],
            ["Memorial Day Monday", "First big weekend of the season", "14-20 MI"],
            ["New Year's Return", "Everyone who rang it in on the Strip, driving home", "12-20 MI"]].map(([when, what, miles]) => (
            <div className="wrow" key={when}>
              <div><div className="when">{when}</div><div className="what">{what}</div></div>
              <div className="miles">{miles}<small>Reported range</small></div>
            </div>
          ))}
        </div>
        <p className="worst-note">Ranges are from past official and news reports of holiday backups at the state line. The production page will log every jam itself, miles, peak, and when it cleared, so next year's table is measured, not remembered.</p>

        {/* ================= STOPS & SERVICES ================= */}
        <div className="section-head">
          <h2>Stops &amp; Services</h2>
          <span>{dir === "sb" ? "Southbound from the state line" : "Northbound to the state line"}</span>
        </div>
        <div className="svc">
          {SVC[dir].map(([stop, dist, text]) => (
            <div className="svc-card" key={stop}>
              <div className="stop">{stop}</div>
              <div className="dist">{dist}</div>
              <p>{text}</p>
            </div>
          ))}
        </div>

        {/* ================= FAQ ================= */}
        <div className="section-head">
          <h2>Straight Answers</h2>
          <span>The questions drivers actually ask</span>
        </div>
        <div className="faq">
          <details open>
            <summary>How bad is the backup at Stateline right now?</summary>
            <div className="a">
              {dir === "sb" && isJam ? (
                <>Right now: <b>a {live.backup}-mile backup</b> at the state line, adding about <b>2 hours 10 minutes</b>, the full drive to Los Angeles is running near 6 hours 20 minutes. If you can wait, leave after 7 PM; the production board will update as it clears.</>
              ) : (
                c.faq
              )}
            </div>
          </details>
          <details>
            <summary>Why does I-15 back up at the Nevada to California line?</summary>
            <div className="a">Two squeezes, back to back. Southbound I-15 drops from <b>three lanes in Nevada to two in California</b> right at Primm, and a few miles later the <b>agricultural inspection station near Mountain Pass</b> slows traffic again. On Sundays and holiday Mondays, when Las Vegas empties toward California, the line can run <b>12 to 26 miles</b>.</div>
          </details>
          <details>
            <summary>When is the worst time to leave Las Vegas?</summary>
            <div className="a"><b>Sunday and holiday Monday, noon to 6 PM</b>, that is the peak of the build. Leave <b>before 10 AM</b> and you will usually sail through; leave <b>after 7 PM</b> and the line has mostly drained. The hour chart above shows the whole build.</div>
          </details>
          <details>
            <summary>How long is the drive from Las Vegas to Los Angeles today?</summary>
            <div className="a">Normally about <b>4 hours 10 minutes</b> for the 270 miles. On a bad Sunday, plan on <b>6 to 6.5 hours</b>, the production drive-times board will show the live number next to the normal one, so you can see the damage at a glance.</div>
          </details>
          <details>
            <summary>Is there a way around the Stateline backup?</summary>
            <div className="a">Honestly, no, not one that helps. The desert alternatives add hours of two-lane driving. If the board says the wait is over an hour, the fastest route is usually <b>staying in Las Vegas a little longer</b> and leaving after it clears. This page tells you when that happens.</div>
          </details>
          <details>
            <summary>What about the other way, Los Angeles to Las Vegas?</summary>
            <div className="a">Northbound rarely jams at the line. Its busy time is <b>Friday afternoon</b>, when California heads to Las Vegas for the weekend and traffic thickens from Primm into the valley. Flip the direction switch at the top and this whole page, board, times, cameras, turns around with you.</div>
          </details>
        </div>

        {/* ================= ALERT SIGNUP ================= */}
        <div className="cta">
          <h3>Stateline Backup Alert</h3>
          <p>We watch it every Sunday and holiday. Get one text when the backup builds, and one when it clears, so you leave Las Vegas at the right time, not in the middle of it.</p>
          <form onSubmit={onAlertSubmit} noValidate>
            <input type="tel" inputMode="tel" autoComplete="tel" placeholder="Cell number for text alerts" aria-label="Cell number for text alerts" value={alertPhone} onChange={(e) => setAlertPhone(e.target.value)} />
            <select aria-label="Which direction" value={alertDir} onChange={(e) => setAlertDir(e.target.value)}>
              <option value="sb">Las Vegas → Los Angeles</option>
              <option value="nb">Los Angeles → Las Vegas</option>
            </select>
            <button className="btn btn-green" type="submit">{alertBtn}</button>
          </form>
          {alertMsg && <p className={"cta-msg" + (alertMsg.err ? " err" : "")}>{alertMsg.text}</p>}
          <p className="cta-fine">Free. Two texts on a backup day at most, one when it builds, one when it clears. Reply STOP anytime.</p>
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" type="button" onClick={() => camsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>Back to the Cameras ↑</button>
          </div>
        </div>

        <footer>
          <div className="frow">
            <span className="fshield">I-15 · STATELINE</span>
            <span aria-hidden="true">·</span><span>Primm, NV, Nevada / California line</span>
            <span aria-hidden="true">·</span><span>Year-round page</span>
            <span style={{ marginLeft: "auto" }}>i15pass.com</span>
          </div>
          <p className="fnote">Mockup readings: every number on this page is a sample value showing how the page will read. On the production page, backup miles and added wait will be measured from live traffic speeds on the Primm to Mountain Pass stretch, compared against that road's normal speed, once its feeds (Nevada 511, Caltrans, and corridor speed data) are connected. Camera stills above are realistic mockups, each labeled MOCKUP, until the live feeds are connected.</p>
        </footer>
      </div>
    </div>
  );
}
