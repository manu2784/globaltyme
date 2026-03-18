"use strict";
const TZ_LIST = [
  { label: "Africa / Cairo (GMT+2)", value: "Africa/Cairo" },
  { label: "Africa / Johannesburg (GMT+2)", value: "Africa/Johannesburg" },
  { label: "Africa / Lagos (GMT+1)", value: "Africa/Lagos" },
  { label: "Africa / Nairobi (GMT+3)", value: "Africa/Nairobi" },
  { label: "America / Anchorage (AKST)", value: "America/Anchorage" },
  {
    label: "America / Buenos Aires (ART)",
    value: "America/Argentina/Buenos_Aires",
  },
  { label: "America / Bogota (COT)", value: "America/Bogota" },
  { label: "America / Chicago (CST/CDT)", value: "America/Chicago" },
  { label: "America / Denver (MST/MDT)", value: "America/Denver" },
  { label: "America / Halifax (AST)", value: "America/Halifax" },
  { label: "America / Los Angeles (PST/PDT)", value: "America/Los_Angeles" },
  { label: "America / Mexico City", value: "America/Mexico_City" },
  { label: "America / New York (EST/EDT)", value: "America/New_York" },
  { label: "America / Phoenix (MST)", value: "America/Phoenix" },
  { label: "America / Santiago", value: "America/Santiago" },
  { label: "America / Sao Paulo (BRT)", value: "America/Sao_Paulo" },
  { label: "America / Toronto (EST/EDT)", value: "America/Toronto" },
  { label: "America / Vancouver (PST/PDT)", value: "America/Vancouver" },
  { label: "Asia / Bangkok (ICT)", value: "Asia/Bangkok" },
  { label: "Asia / Dubai (GST)", value: "Asia/Dubai" },
  { label: "Asia / Hong Kong (HKT)", value: "Asia/Hong_Kong" },
  { label: "Asia / Jakarta (WIB)", value: "Asia/Jakarta" },
  { label: "Asia / Karachi (PKT)", value: "Asia/Karachi" },
  { label: "Asia / Kolkata (IST)", value: "Asia/Kolkata" },
  { label: "Asia / Kuala Lumpur (MYT)", value: "Asia/Kuala_Lumpur" },
  { label: "Asia / Manila (PHT)", value: "Asia/Manila" },
  { label: "Asia / Riyadh (AST)", value: "Asia/Riyadh" },
  { label: "Asia / Seoul (KST)", value: "Asia/Seoul" },
  { label: "Asia / Shanghai (CST)", value: "Asia/Shanghai" },
  { label: "Asia / Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Asia / Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Australia / Adelaide (ACST)", value: "Australia/Adelaide" },
  { label: "Australia / Brisbane (AEST)", value: "Australia/Brisbane" },
  { label: "Australia / Melbourne (AEDT)", value: "Australia/Melbourne" },
  { label: "Australia / Perth (AWST)", value: "Australia/Perth" },
  { label: "Australia / Sydney (AEDT)", value: "Australia/Sydney" },
  { label: "Europe / Amsterdam (CET/CEST)", value: "Europe/Amsterdam" },
  { label: "Europe / Athens (EET/EEST)", value: "Europe/Athens" },
  { label: "Europe / Berlin (CET/CEST)", value: "Europe/Berlin" },
  { label: "Europe / Brussels (CET/CEST)", value: "Europe/Brussels" },
  { label: "Europe / Copenhagen (CET/CEST)", value: "Europe/Copenhagen" },
  { label: "Europe / Dublin (GMT/IST)", value: "Europe/Dublin" },
  { label: "Europe / Helsinki (EET/EEST)", value: "Europe/Helsinki" },
  { label: "Europe / Istanbul (TRT)", value: "Europe/Istanbul" },
  { label: "Europe / Lisbon (WET/WEST)", value: "Europe/Lisbon" },
  { label: "Europe / London (GMT/BST)", value: "Europe/London" },
  { label: "Europe / Madrid (CET/CEST)", value: "Europe/Madrid" },
  { label: "Europe / Moscow (MSK)", value: "Europe/Moscow" },
  { label: "Europe / Oslo (CET/CEST)", value: "Europe/Oslo" },
  { label: "Europe / Paris (CET/CEST)", value: "Europe/Paris" },
  { label: "Europe / Rome (CET/CEST)", value: "Europe/Rome" },
  { label: "Europe / Stockholm (CET/CEST)", value: "Europe/Stockholm" },
  { label: "Europe / Vienna (CET/CEST)", value: "Europe/Vienna" },
  { label: "Europe / Warsaw (CET/CEST)", value: "Europe/Warsaw" },
  { label: "Europe / Zurich (CET/CEST)", value: "Europe/Zurich" },
  { label: "Pacific / Auckland (NZDT)", value: "Pacific/Auckland" },
  { label: "Pacific / Honolulu (HST)", value: "Pacific/Honolulu" },
  { label: "UTC", value: "UTC" },
];
const COLORS = ["#d4f244", "#44d4f2", "#f244d4", "#f2a444"];
const LABELS = ["Your Time", "Remote", "Remote 2", "Remote 3"];
const MAX = 4;
let masterEpochMs = null;
let clocks = [];
let rafId = null;
const drag = { active: !1, id: null, prevAngle: null, acc: 0 };
function epoch() {
  return masterEpochMs !== null ? masterEpochMs : Date.now();
}
function timeInTZ(tz, ms) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: !1,
  }).formatToParts(new Date(ms));
  const g = (t) => parseInt(parts.find((p) => p.type === t)?.value || "0", 10);
  let h = g("hour");
  const m = g("minute"),
    s = g("second");
  if (h === 24) h = 0;
  return { h, m, s };
}
function tzOffsetMs(tz, ms) {
  const d = new Date(ms);
  const loc = new Date(d.toLocaleString("en-US", { timeZone: tz }));
  const utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
  return loc - utc;
}
function formatUTCOffset(tz) {
  const ms = tzOffsetMs(tz, epoch());
  const sign = ms >= 0 ? "+" : "−";
  const abs = Math.abs(ms) / 60000;
  const h = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const m = (abs % 60).toString().padStart(2, "0");
  return `UTC${sign}${h}:${m}`;
}
function hmsToEpoch(h, m, s, tz) {
  const off = tzOffsetMs(tz, epoch());
  const d = new Date(epoch());
  const dateStr = d.toLocaleDateString("en-CA", { timeZone: tz });
  const [yr, mo, dy] = dateStr.split("-").map(Number);
  return Date.UTC(yr, mo - 1, dy, h, m, s) - off;
}
function isDay(h) {
  return h >= 6 && h < 18;
}
function drawSun(ctx, x, y, r) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
  g.addColorStop(0, "rgba(255,210,40,.22)");
  g.addColorStop(1, "rgba(255,210,40,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffd028";
  ctx.lineWidth = 1.1;
  ctx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * (r + 2.5), y + Math.sin(a) * (r + 2.5));
    ctx.lineTo(x + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7));
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd028";
  ctx.fill();
  ctx.restore();
}
function drawMoon(ctx, x, y, r) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  g.addColorStop(0, "rgba(130,150,255,.16)");
  g.addColorStop(1, "rgba(130,150,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#8296ff";
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x + r * 0.55, y - r * 0.1, r * 0.8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  [
    [x + r * 2.2, y - r * 0.65, 1],
    [x + r * 1.7, y + r * 1.25, 0.65],
    [x + r * 2.9, y + r * 0.4, 0.75],
  ].forEach(([sx, sy, sr]) => {
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = "#8296ff";
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}
const DPR = window.devicePixelRatio || 1;
function setupHiDPI(canvas, cssSize) {
  canvas.width = cssSize * DPR;
  canvas.height = cssSize * DPR;
  canvas.style.width = cssSize + "px";
  canvas.style.height = cssSize + "px";
  canvas.getContext("2d").scale(DPR, DPR);
}
function renderClock(inst) {
  const { canvas, color } = inst;
  const CSS = parseInt(canvas.style.width);
  const ctx = canvas.getContext("2d");
  const cx = CSS / 2,
    cy = CSS / 2,
    R = CSS / 2 - 4;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { h, m, s } = timeInTZ(inst.tz, epoch());
  const day = isDay(h);
  const isDragThis = drag.active && drag.id === inst.id;
  const fg = ctx.createRadialGradient(cx, cy - R * 0.25, 0, cx, cy, R);
  fg.addColorStop(0, day ? "#191908" : "#0c0c14");
  fg.addColorStop(1, day ? "#111108" : "#08080e");
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = fg;
  ctx.fill();
  ctx.strokeStyle = color + "55";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, R - 7, 0, Math.PI * 2);
  ctx.strokeStyle = "#1e1e2e";
  ctx.lineWidth = 1;
  ctx.stroke();
  if (day) drawSun(ctx, cx, cy + R * 0.44, 5.5);
  else drawMoon(ctx, cx, cy + R * 0.44, 5.5);
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const mn = i % 5 === 0;
    const ro = R - 8,
      len = mn ? 8 : 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (ro - len), cy + Math.sin(a) * (ro - len));
    ctx.lineTo(cx + Math.cos(a) * ro, cy + Math.sin(a) * ro);
    ctx.strokeStyle = mn ? "#40405a" : "#252535";
    ctx.lineWidth = mn ? 1.5 : 0.8;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, R - 3, -Math.PI / 2, -Math.PI / 2 + (s / 60) * Math.PI * 2);
  ctx.strokeStyle = color + "38";
  ctx.lineWidth = 2;
  ctx.stroke();
  const hA = (((h % 12) + m / 60 + s / 3600) / 12) * Math.PI * 2 - Math.PI / 2;
  hand(ctx, cx, cy, hA, R * 0.5, 3.5, "#dde0f0", !1);
  const mA = ((m + s / 60) / 60) * Math.PI * 2 - Math.PI / 2;
  hand(ctx, cx, cy, mA, R * 0.72, 2, color, !0);
  if (!isDragThis) {
    const sA = (s / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(sA) * 10, cy - Math.sin(sA) * 10);
    ctx.lineTo(cx + Math.cos(sA) * R * 0.76, cy + Math.sin(sA) * R * 0.76);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.45;
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fillStyle = "#0a0a0f";
  ctx.fill();
  const h12 = h % 12 || 12;
  inst.elHM.textContent = `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  inst.elS.textContent = `:${s.toString().padStart(2, "0")}`;
  inst.elAMPM.textContent = h >= 12 ? "PM" : "AM";
  const dateStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: inst.tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(epoch()));
  inst.elDate.textContent = dateStr;
  const off = formatUTCOffset(inst.tz);
  const tzShort = inst.tz.split("/").pop().replace(/_/g, " ");
  inst.elMeta.innerHTML = `<span class="offset">${off}</span> &mdash; ${tzShort}`;
}
function hand(ctx, cx, cy, a, len, w, color, tip) {
  const tx = cx + Math.cos(a) * len,
    ty = cy + Math.sin(a) * len;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - Math.cos(a) * (len * 0.16), cy - Math.sin(a) * (len * 0.16));
  ctx.lineTo(tx, ty);
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.stroke();
  if (tip) {
    ctx.beginPath();
    ctx.arc(tx, ty, w + 4.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}
function renderAll() {
  clocks.forEach(renderClock);
}
function loop() {
  renderAll();
  rafId = requestAnimationFrame(loop);
}
function normA(a) {
  return ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
}
function deltaA(p, c) {
  let d = normA(c) - normA(p);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
function canvasAngle(canvas, cx, cy) {
  const r = canvas.getBoundingClientRect();
  const cssW = parseInt(canvas.style.width);
  const x = (cx - r.left) * (cssW / r.width) - cssW / 2;
  const y = (cy - r.top) * (cssW / r.height) - cssW / 2;
  return Math.atan2(y, x);
}
function attachDrag(canvas, id) {
  const start = (e) => {
    e.preventDefault();
    const p = e.touches ? e.touches[0] : e;
    drag.active = !0;
    drag.id = id;
    drag.prevAngle = canvasAngle(canvas, p.clientX, p.clientY);
    drag.acc = 0;
    if (masterEpochMs === null) masterEpochMs = Date.now();
    canvas.style.cursor = "grabbing";
  };
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("touchstart", start, { passive: !1 });
  canvas.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;
    e.preventDefault();
    if (masterEpochMs === null) masterEpochMs = Date.now();
    const dir = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : -1;
    const step = e.shiftKey ? 60 : 1;
    masterEpochMs += dir * step * 60000;
    renderAll();
  });
}
window.addEventListener(
  "mousemove",
  (e) => {
    if (!drag.active) return;
    e.preventDefault();
    const inst = clocks.find((c) => c.id === drag.id);
    if (!inst) return;
    const a = canvasAngle(inst.canvas, e.clientX, e.clientY);
    const d = deltaA(drag.prevAngle, a);
    drag.prevAngle = a;
    drag.acc += (d / (Math.PI * 2)) * 60;
    const w = Math.trunc(drag.acc);
    if (w !== 0) {
      drag.acc -= w;
      masterEpochMs += w * 60000;
      renderAll();
    }
  },
  { passive: !1 },
);
window.addEventListener(
  "touchmove",
  (e) => {
    if (!drag.active) return;
    e.preventDefault();
    const inst = clocks.find((c) => c.id === drag.id);
    if (!inst) return;
    const t = e.touches[0];
    const a = canvasAngle(inst.canvas, t.clientX, t.clientY);
    const d = deltaA(drag.prevAngle, a);
    drag.prevAngle = a;
    drag.acc += (d / (Math.PI * 2)) * 60;
    const w = Math.trunc(drag.acc);
    if (w !== 0) {
      drag.acc -= w;
      masterEpochMs += w * 60000;
      renderAll();
    }
  },
  { passive: !1 },
);
function endDrag() {
  if (!drag.active) return;
  const inst = clocks.find((c) => c.id === drag.id);
  if (inst) inst.canvas.style.cursor = "grab";
  drag.active = !1;
  drag.id = null;
  drag.prevAngle = null;
  drag.acc = 0;
}
window.addEventListener("mouseup", endDrag);
window.addEventListener("touchend", endDrag);
let _uid = 0;
function makeClock(tz, isBase) {
  if (clocks.length >= MAX) return;
  const id = _uid++;
  const idx = clocks.length;
  const color = COLORS[idx % COLORS.length];
  const label = LABELS[idx] || `Remote ${idx}`;
  const CSS = 178;
  const card = document.createElement("article");
  card.className = "clock-card" + (isBase ? " is-base" : "");
  card.dataset.id = id;
  card.style.setProperty("--clr", color);
  card.setAttribute("aria-label", label + " timezone clock");
  const rmBtn = document.createElement("button");
  rmBtn.className = "btn-remove";
  rmBtn.setAttribute("aria-label", "Remove clock");
  rmBtn.innerHTML = "&times;";
  rmBtn.addEventListener("click", () => removeClock(id));
  const badge = document.createElement("div");
  badge.className = "clock-badge";
  badge.textContent = label;
  const selWrap = document.createElement("div");
  selWrap.className = "select-wrap";
  const selLbl = document.createElement("label");
  selLbl.className = "sr-only";
  selLbl.setAttribute("for", `sel-${id}`);
  selLbl.textContent = "Timezone";
  const sel = document.createElement("select");
  sel.id = `sel-${id}`;
  sel.setAttribute("aria-label", "Select timezone");
  TZ_LIST.forEach((t) => {
    const o = new Option(t.label, t.value);
    if (t.value === tz) o.selected = !0;
    sel.appendChild(o);
  });
  selWrap.append(selLbl, sel);
  const cwrap = document.createElement("div");
  cwrap.className = "canvas-wrap";
  const canvas = document.createElement("canvas");
  canvas.className = "clock-cv";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("tabindex", "0");
  canvas.setAttribute(
    "aria-label",
    "Analog clock — drag minute hand or use arrow keys",
  );
  canvas.title =
    "Drag the minute hand to adjust time. Arrow keys: ±1 min, Shift+Arrow: ±1 hr";
  setupHiDPI(canvas, CSS);
  cwrap.appendChild(canvas);
  const digi = document.createElement("div");
  digi.className = "digi";
  const elHM = document.createElement("span");
  elHM.className = "hm";
  elHM.textContent = "--:--";
  const elS = document.createElement("span");
  elS.className = "secs";
  elS.textContent = ":--";
  const elAM = document.createElement("span");
  elAM.className = "ampm";
  digi.append(elHM, elS, elAM);
  const elDate = document.createElement("p");
  elDate.className = "date-display";
  elDate.setAttribute("aria-live", "polite");
  elDate.textContent = "---";
  const elMeta = document.createElement("p");
  elMeta.className = "tz-meta";
  elMeta.setAttribute("aria-live", "polite");
  elMeta.textContent = "Loading…";
  const trow = document.createElement("div");
  trow.className = "time-row";
  const tLbl = document.createElement("label");
  tLbl.className = "sr-only";
  tLbl.setAttribute("for", `ti-${id}`);
  tLbl.textContent = "Set time manually";
  const inp = document.createElement("input");
  inp.type = "time";
  inp.step = "60";
  inp.id = `ti-${id}`;
  inp.setAttribute("aria-label", "Enter time manually");
  const setBtn = document.createElement("button");
  setBtn.className = "btn-set";
  setBtn.textContent = "Set";
  setBtn.setAttribute("aria-label", "Apply this time to all clocks");
  setBtn.addEventListener("click", () => {
    if (!inp.value) return;
    const [h, m] = inp.value.split(":").map(Number);
    masterEpochMs = hmsToEpoch(h, m, 0, sel.value);
    renderAll();
  });
  trow.append(tLbl, inp, setBtn);
  const rstBtn = document.createElement("button");
  rstBtn.className = "btn-reset";
  rstBtn.textContent = "↺ Reset to Live";
  rstBtn.setAttribute("aria-label", "Reset all clocks to live current time");
  rstBtn.addEventListener("click", () => {
    masterEpochMs = null;
    inp.value = "";
    renderAll();
  });
  const hint = document.createElement("p");
  hint.className = "drag-hint";
  hint.setAttribute("aria-hidden", "true");
  hint.textContent = "drag the minute hand";
  card.append(
    rmBtn,
    badge,
    selWrap,
    cwrap,
    digi,
    elDate,
    elMeta,
    trow,
    rstBtn,
    hint,
  );
  const inst = {
    id,
    color,
    canvas,
    elHM,
    elS,
    elAMPM: elAM,
    elDate,
    elMeta,
    selEl: sel,
    timeInput: inp,
    get tz() {
      return sel.value;
    },
  };
  clocks.push(inst);
  attachDrag(canvas, id);
  sel.addEventListener("change", renderAll);
  const grid = document.getElementById("clocks-grid");
  const addBtn = document.getElementById("btn-add");
  grid.insertBefore(card, addBtn);
  updateAddBtn();
  renderAll();
}
function removeClock(id) {
  const idx = clocks.findIndex((c) => c.id === id);
  if (idx === -1) return;
  clocks.splice(idx, 1);
  const card = document.querySelector(`.clock-card[data-id="${id}"]`);
  if (card) {
    card.style.transition = "opacity .25s, transform .25s";
    card.style.opacity = "0";
    card.style.transform = "scale(.94)";
    setTimeout(() => card.remove(), 270);
  }
  setTimeout(updateAddBtn, 280);
}
function updateAddBtn() {
  const btn = document.getElementById("btn-add");
  if (!btn) return;
  btn.disabled = clocks.length >= MAX;
  btn.setAttribute(
    "aria-label",
    clocks.length >= MAX
      ? "Maximum 4 clocks reached"
      : "Add a new timezone clock",
  );
}
(function init() {
  const addBtn = document.createElement("button");
  addBtn.id = "btn-add";
  addBtn.innerHTML =
    '<span class="plus" aria-hidden="true">+</span><span>Add Timezone</span>';
  addBtn.setAttribute("aria-label", "Add a new timezone clock");
  addBtn.addEventListener("click", () => {
    const inUse = new Set(clocks.map((c) => c.tz));
    const defaults = [
      "Europe/London",
      "America/New_York",
      "Asia/Tokyo",
      "America/Los_Angeles",
      "Europe/Berlin",
      "Australia/Sydney",
    ];
    const pick =
      defaults.find((t) => !inUse.has(t)) ||
      TZ_LIST.find((t) => !inUse.has(t.value))?.value ||
      "UTC";
    makeClock(pick, !1);
  });
  document.getElementById("clocks-grid").appendChild(addBtn);
  const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const baseTZ = TZ_LIST.find((t) => t.value === userTZ)
    ? userTZ
    : "America/New_York";
  makeClock(baseTZ, !0);
  const secondDefaults = [
    "Europe/London",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/Berlin",
    "Asia/Tokyo",
  ];
  const secondTZ = secondDefaults.find((t) => t !== baseTZ) || "UTC";
  makeClock(secondTZ, !1);
  loop();
})();
