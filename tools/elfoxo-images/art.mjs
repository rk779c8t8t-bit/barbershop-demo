// Векторные «студийные» иллюстрации детских головных уборов для демо-сайта ElFoxo.
// Каждая функция-компонент рисует вещь в локальных координатах холста 800×1000.

let uid = 0;
const nid = (p) => `${p}${++uid}`;

/* ---------- цвет ---------- */
const h2r = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const r2h = (r) => "#" + r.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
export const mix = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => v + (B[i] - v) * t)); };
export const shade = (h, t) => (t >= 0 ? mix(h, "#ffffff", t) : mix(h, "#1b140f", -t));
const lum = (h) => { const [r, g, b] = h2r(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

/* ---------- узоры ---------- */
function knit(base, s = 1.3) {
  const id = nid("k"), w = 22 * s, h = 20 * s, dark = shade(base, -0.32), hi = shade(base, 0.14);
  return { id, def: `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">
    <rect width="${w}" height="${h}" fill="${dark}"/>
    <g transform="scale(${s})">
      <ellipse cx="6.3" cy="9.6" rx="4.3" ry="8.6" transform="rotate(-33 6.3 9.6)" fill="${base}"/>
      <ellipse cx="15.7" cy="9.6" rx="4.3" ry="8.6" transform="rotate(33 15.7 9.6)" fill="${base}"/>
      <ellipse cx="5.4" cy="7.4" rx="1.5" ry="4.4" transform="rotate(-33 5.4 7.4)" fill="${hi}" opacity=".6"/>
      <ellipse cx="14.8" cy="7.4" rx="1.5" ry="4.4" transform="rotate(33 14.8 7.4)" fill="${hi}" opacity=".6"/>
    </g></pattern>` };
}
function rib(base, s = 1.25) {
  const id = nid("r"), w = 34 * s, h = 18 * s, dark = shade(base, -0.4), mid = shade(base, -0.16), hi = shade(base, 0.12);
  return { id, def: `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">
    <rect width="${w}" height="${h}" fill="${dark}"/>
    <g transform="scale(${s})">
      <ellipse cx="5.6" cy="9" rx="4.3" ry="8.6" transform="rotate(-24 5.6 9)" fill="${base}"/>
      <ellipse cx="14.4" cy="9" rx="4.3" ry="8.6" transform="rotate(24 14.4 9)" fill="${base}"/>
      <ellipse cx="5" cy="7" rx="1.4" ry="4" transform="rotate(-24 5 7)" fill="${hi}" opacity=".5"/>
      <ellipse cx="13.8" cy="7" rx="1.4" ry="4" transform="rotate(24 13.8 7)" fill="${hi}" opacity=".5"/>
      <ellipse cx="26.5" cy="4.5" rx="5.6" ry="3.4" fill="${mid}"/>
      <ellipse cx="26.5" cy="13.5" rx="5.6" ry="3.4" fill="${mid}"/>
    </g></pattern>` };
}
function twill(base) {
  const id = nid("t"), line = shade(base, -0.12), hi = shade(base, 0.08);
  return { id, def: `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
    <rect width="9" height="9" fill="${base}"/><rect width="2.2" height="9" fill="${line}" opacity=".55"/>
    <rect x="4.5" width="1.4" height="9" fill="${hi}" opacity=".5"/></pattern>` };
}
function dots(base, dot) {
  const id = nid("d"), line = shade(base, -0.1);
  return { id, def: `<pattern id="${id}" width="46" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
    <rect width="46" height="46" fill="${base}"/>
    <rect width="2" height="46" fill="${line}" opacity=".35"/><rect y="23" width="46" height="1.6" fill="${line}" opacity=".25"/>
    <circle cx="11" cy="11" r="6.2" fill="${dot}"/><circle cx="34" cy="34" r="6.2" fill="${dot}"/></pattern>` };
}
function fuzzFill(base) {
  // пушистая фактура помпона
  const id = nid("f"), dark = shade(base, -0.22), hi = shade(base, 0.25);
  let s = "";
  for (let i = 0; i < 70; i++) {
    const x = (i * 37) % 60, y = (i * 23) % 60, r = 2 + (i % 4);
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 3 ? hi : dark}" opacity="${i % 3 ? 0.45 : 0.35}"/>`;
  }
  return { id, def: `<pattern id="${id}" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="${base}"/>${s}</pattern>` };
}

/* ---------- общие фильтры (ставятся один раз на документ) ---------- */
export const baseDefs = `
  <filter id="blur18" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="blur7" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="fuzz" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="22" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0" result="g"/>
    <feComponentTransfer in="g" result="ga"><feFuncA type="linear" slope="0.09"/></feComponentTransfer>
    <feComposite in="ga" in2="SourceGraphic" operator="in" result="gc"/>
    <feBlend in="SourceGraphic" in2="gc" mode="multiply"/>
  </filter>
  <linearGradient id="vol" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".30"/>
    <stop offset=".42" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#1b120b" stop-opacity=".30"/>
  </linearGradient>
  <radialGradient id="glow" cx=".35" cy=".3" r=".8">
    <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>`;

/* ---------- деталь: тень + фактура + объём + затемнение кромки ---------- */
function piece(d, pat, { shadow = true, edge = 0.38, rule = "nonzero", vol = true, edgeColor = "#1b120b" } = {}) {
  const cid = nid("c");
  return {
    def: pat.def + `<clipPath id="${cid}"><path d="${d}" clip-rule="${rule}"/></clipPath>`,
    svg: `${shadow ? `<path d="${d}" fill-rule="${rule}" fill="#4a3220" opacity=".26" transform="translate(16 24)" filter="url(#blur18)"/>` : ""}
      <path d="${d}" fill-rule="${rule}" fill="url(#${pat.id})"/>
      <g clip-path="url(#${cid})">
        ${vol ? `<path d="${d}" fill-rule="${rule}" fill="url(#vol)"/><path d="${d}" fill-rule="${rule}" fill="url(#glow)" opacity=".5"/>` : ""}
        <path d="${d}" fill="none" stroke="${edgeColor}" stroke-width="30" opacity="${edge}" filter="url(#blur7)"/>
      </g>`
  };
}
const join = (parts) => ({ def: parts.map((p) => p.def).join(""), svg: parts.map((p) => p.svg).join("") });

/* ================= ВЕЩИ ================= */

export function foxBeanie(c) {
  const body = "M200,640 L200,360 Q200,290 228,250 L270,175 Q282,150 302,166 L352,232 Q400,222 448,232 L498,166 Q518,150 530,175 L572,250 Q600,290 600,360 L600,640 Z";
  const inner = lum(c) > 0.75 ? shade(c, -0.1) : mix(c, "#F6ECDF", 0.62);
  const earL = "M246,252 L282,192 Q290,184 296,192 L326,236 Q288,236 246,252 Z";
  const earR = "M554,252 L518,192 Q510,184 504,192 L474,236 Q512,236 554,252 Z";
  const cuff = "M180,640 Q180,604 214,602 L586,602 Q620,604 620,640 L620,716 Q620,752 586,754 L214,754 Q180,752 180,716 Z";
  return join([
    piece(body, knit(c)),
    piece(earL, knit(inner, 1), { shadow: false, edge: 0.25 }),
    piece(earR, knit(inner, 1), { shadow: false, edge: 0.25 }),
    piece(cuff, rib(shade(c, -0.05)), { edge: 0.3 })
  ]);
}

export function pompomHat(c, pom) {
  pom = pom || (lum(c) > 0.8 ? shade(c, -0.08) : shade(c, 0.45));
  const body = "M198,650 C198,420 282,322 400,322 C518,322 602,420 602,650 Z";
  const cuff = "M176,646 Q176,606 214,604 L586,604 Q624,606 624,646 L624,728 Q624,766 586,768 L214,768 Q176,766 176,728 Z";
  const ball = fuzzFill(pom);
  return join([
    piece(body, knit(c)),
    piece(cuff, rib(shade(c, -0.05)), { edge: 0.3 }),
    { def: ball.def, svg: `<circle cx="412" cy="306" r="98" fill="#4a3220" opacity=".25" filter="url(#blur18)"/>
      <g filter="url(#fuzz)"><circle cx="400" cy="290" r="96" fill="url(#${ball.id})"/>
      <circle cx="400" cy="290" r="96" fill="url(#vol)"/><circle cx="372" cy="258" r="60" fill="url(#glow)"/></g>` }
  ]);
}

export function ribBeanie(c) {
  const body = "M196,600 C196,430 282,350 400,350 C518,350 604,430 604,600 Z";
  const cuff = "M172,596 Q172,552 214,550 L586,550 Q628,552 628,596 L628,724 Q628,768 586,770 L214,770 Q172,768 172,724 Z";
  return join([
    piece(body, rib(c)),
    piece(cuff, rib(shade(c, -0.04), 1.1), { edge: 0.32 }),
    { def: "", svg: `<path d="M220,662 L580,662" stroke="${shade(c, -0.45)}" stroke-width="3" opacity=".25"/>` }
  ]);
}

export function helmet(c) {
  const outer = "M222,840 L222,430 C222,288 304,212 400,212 C496,212 578,288 578,430 L578,840 Q400,884 222,840 Z";
  const hole = "M400,342 C462,342 512,400 512,478 C512,556 462,612 400,612 C338,612 288,556 288,478 C288,400 338,342 400,342 Z";
  const neck = "M222,700 Q400,730 578,700 L578,840 Q400,884 222,840 Z";
  const ring = "M400,322 C474,322 532,392 532,478 C532,566 474,632 400,632 C326,632 268,566 268,478 C268,392 326,322 400,322 Z " + hole;
  return join([
    piece(outer + " " + hole, knit(c), { rule: "evenodd" }),
    piece(neck, rib(shade(c, -0.04)), { shadow: false, edge: 0.28 }),
    piece(ring, rib(shade(c, -0.06), 0.8), { shadow: false, rule: "evenodd", edge: 0.3 })
  ]);
}

function panamaShape(crownFill, brimFill, brimUnder, c) {
  const crown = "M262,560 L284,404 Q296,330 400,326 Q504,330 516,404 L538,560 Z";
  const brim = "M136,604 Q146,538 270,530 L530,530 Q654,538 664,604 Q664,664 400,672 Q136,664 136,604 Z";
  const under = "M140,620 Q150,670 400,686 Q650,670 660,620 Q664,664 400,676 Q136,664 140,620 Z";
  const st = shade(c, -0.35);
  const parts = [];
  if (brimUnder) parts.push(piece(under, brimUnder, { edge: 0.2 }));
  parts.push(piece(brim, brimFill, { edge: 0.3 }), piece(crown, crownFill, { edge: 0.34 }));
  parts.push({ def: "", svg: `<g fill="none" stroke="${st}" stroke-width="2.6" stroke-dasharray="9 7" opacity=".55" stroke-linecap="round">
      <path d="M170,606 Q182,560 280,554 L520,554 Q618,560 630,606 Q626,646 400,652 Q174,646 170,606 Z"/>
      <path d="M192,606 Q204,574 290,570 L510,570 Q596,574 608,606 Q600,634 400,640 Q200,634 192,606 Z"/>
      <path d="M268,520 Q400,532 532,520"/><path d="M272,494 Q400,506 528,494"/>
      <path d="M400,334 L400,520"/><path d="M332,344 Q316,430 300,522"/><path d="M468,344 Q484,430 500,522"/></g>` });
  return join(parts);
}
export function panama(c) { return panamaShape(twill(c), twill(c), null, c); }
export function panama2(c) {
  const back = mix(c, "#f4ede2", 0.7);
  return panamaShape(dots(c, back), dots(c, back), twill(back), c);
}

function capShape(c, visorC) {
  const crown = "M246,606 C236,424 326,330 440,330 C560,330 646,424 636,606 Q440,630 246,606 Z";
  const visor = "M270,590 Q196,604 128,652 Q112,676 146,682 Q306,700 466,642 Q478,614 462,596 Q370,610 270,590 Z";
  const st = shade(c, -0.38), vst = shade(visorC, -0.38);
  return join([
    piece(crown, twill(c), { edge: 0.34 }),
    { def: "", svg: `<g fill="none" stroke="${st}" stroke-linecap="round">
        <path d="M440,334 C380,400 344,500 336,612" stroke-width="3.2" opacity=".5"/>
        <path d="M440,334 C506,400 548,500 556,616" stroke-width="3.2" opacity=".5"/>
        <path d="M440,334 C430,420 434,520 446,622" stroke-width="3.2" opacity=".35"/>
        <g stroke-width="2.4" stroke-dasharray="8 6" opacity=".5">
          <path d="M432,344 C372,410 336,506 328,610"/><path d="M448,344 C514,410 556,506 564,614"/>
          <path d="M256,592 Q440,614 626,592"/></g></g>
      <g fill="${shade(c, -0.4)}" opacity=".7"><circle cx="372" cy="430" r="6"/><circle cx="512" cy="430" r="6"/></g>
      <circle cx="440" cy="336" r="16" fill="${shade(c, -0.12)}"/><circle cx="436" cy="331" r="7" fill="#fff" opacity=".25"/>` },
    piece(visor, twill(visorC), { edge: 0.3 }),
    { def: "", svg: `<path d="M168,656 Q312,672 444,624" fill="none" stroke="${vst}" stroke-width="2.4" stroke-dasharray="8 6" opacity=".55"/>
      <path d="M190,644 Q316,656 432,614" fill="none" stroke="${vst}" stroke-width="2.4" stroke-dasharray="8 6" opacity=".45"/>` }
  ]);
}
export function cap(c) { return capShape(c, c); }
export function cap2(c) { return capShape(c, lum(c) > 0.7 ? "#36445B" : "#EEE5D6"); }

export function snood(c) {
  const ring = "M400,268 C566,268 690,374 690,520 C690,670 566,774 400,774 C234,774 110,670 110,520 C110,374 234,268 400,268 Z " +
               "M400,392 C316,392 252,438 252,500 C252,566 316,612 400,612 C484,612 548,566 548,500 C548,438 484,392 400,392 Z";
  const fold = shade(c, -0.4);
  return join([
    piece(ring, knit(c, 1.15), { rule: "evenodd", edge: 0.36 }),
    { def: "", svg: `<g fill="none" stroke="${fold}" stroke-linecap="round" opacity=".28">
      <path d="M150,470 Q230,360 400,350" stroke-width="10" filter="url(#blur7)"/>
      <path d="M640,600 Q560,712 400,722" stroke-width="12" filter="url(#blur7)"/></g>` }
  ]);
}

function mittenAt(c, tx, ty, rot, flip) {
  const thumb = "M-86,-6 C-132,-14 -164,-62 -156,-104 C-148,-138 -112,-142 -96,-110 L-80,-40 Z";
  const palm = "M-92,130 L-92,-60 C-92,-172 -40,-214 8,-214 C70,-214 104,-164 104,-60 L104,130 Z";
  const cuff = "M-104,118 Q-104,100 -86,100 L98,100 Q116,100 116,118 L116,212 Q116,230 98,230 L-86,230 Q-104,230 -104,212 Z";
  const parts = [piece(thumb, knit(c)), piece(palm, knit(c)), piece(cuff, rib(shade(c, -0.05)), { edge: 0.28 })];
  const j = join(parts);
  return { def: j.def, svg: `<g transform="translate(${tx} ${ty}) rotate(${rot}) scale(${flip ? -1 : 1} 1)">${j.svg}</g>` };
}
export function mittens(c) {
  const cord = shade(c, -0.25);
  const m1 = mittenAt(c, 268, 440, -9, false), m2 = mittenAt(c, 548, 466, 8, true);
  return {
    def: m1.def + m2.def,
    svg: `<path d="M290,668 C270,900 560,930 520,700" fill="none" stroke="#4a3220" stroke-width="12" opacity=".2" filter="url(#blur7)" transform="translate(8 12)"/>
      <path d="M290,668 C270,900 560,930 520,700" fill="none" stroke="${cord}" stroke-width="9" stroke-linecap="round"/>
      <path d="M290,668 C270,900 560,930 520,700" fill="none" stroke="#fff" stroke-width="2" opacity=".25" stroke-dasharray="4 6"/>
      ${m1.svg}${m2.svg}`
  };
}

export function group(item, tx, ty, s = 1, rot = 0) {
  return { def: item.def, svg: `<g transform="translate(${tx} ${ty}) rotate(${rot}) scale(${s}) translate(-400 -500)">${item.svg}</g>` };
}
export function setSnood(c) { return join([group(snood(c), 420, 640, 0.66, 6), group(foxBeanie(c), 380, 330, 0.62, -6)]); }
export function setMitt(c) { return join([group(mittens(c), 430, 660, 0.6, 0), group(pompomHat(c), 390, 330, 0.62, -5)]); }

/* ---------- декор ---------- */
export function leaf(col, tx, ty, s, rot) {
  const d = "M0,-70 C38,-40 40,30 0,72 C-40,30 -38,-40 0,-70 Z";
  return { def: "", svg: `<g transform="translate(${tx} ${ty}) rotate(${rot}) scale(${s})">
    <path d="${d}" fill="#4a3220" opacity=".2" transform="translate(6 10)" filter="url(#blur7)"/>
    <path d="${d}" fill="${col}"/><path d="${d}" fill="url(#vol)"/>
    <path d="M0,-62 L0,96" stroke="${shade(col, -0.35)}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g stroke="${shade(col, -0.25)}" stroke-width="2" fill="none" opacity=".6"><path d="M0,-20 L18,-38"/><path d="M0,0 L-20,-20"/><path d="M0,22 L22,2"/><path d="M0,40 L-18,22"/></g></g>` };
}
export function yarn(col, tx, ty, s) {
  const id = nid("y"), dark = shade(col, -0.3), hi = shade(col, 0.2);
  let strands = "";
  [[-20, 0], [40, 1], [100, 0], [160, 1], [70, 0]].forEach(([a, k]) => {
    strands += `<g transform="rotate(${a})">`;
    for (let r = 14; r <= 112; r += 7) strands += `<ellipse rx="112" ry="${r}" fill="none" stroke="${(r / 7) % 2 ? dark : hi}" stroke-width="4.2" opacity="${k ? 0.55 : 0.7}"/>`;
    strands += `</g>`;
  });
  return { def: `<clipPath id="${id}"><circle r="110"/></clipPath>`, svg: `<g transform="translate(${tx} ${ty}) scale(${s})">
    <circle r="112" fill="#4a3220" opacity=".26" transform="translate(16 22)" filter="url(#blur18)"/>
    <circle r="110" fill="${col}"/><g clip-path="url(#${id})">${strands}<circle r="110" fill="url(#vol)"/>
    <circle r="110" fill="none" stroke="#1b120b" stroke-width="30" opacity=".3" filter="url(#blur7)"/></g>
    <path d="M90,60 C160,120 210,110 260,170" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"/></g>` };
}
export function needles(tx, ty, rot) {
  const wood = "#B88B5C";
  const one = (dx, r) => `<g transform="translate(${dx} 0) rotate(${r})">
    <rect x="-7" y="-330" width="14" height="640" rx="7" fill="#4a3220" opacity=".2" transform="translate(10 14)" filter="url(#blur7)"/>
    <path d="M-7,300 L-7,-300 L0,-336 L7,-300 L7,300 Z" fill="${wood}"/><path d="M-7,300 L-7,-300 L0,-336 L0,300 Z" fill="#fff" opacity=".18"/>
    <circle cy="304" r="18" fill="${shade(wood, -0.25)}"/><circle cy="300" r="7" fill="#fff" opacity=".25"/></g>`;
  return { def: "", svg: `<g transform="translate(${tx} ${ty}) rotate(${rot})">${one(-16, -3)}${one(16, 4)}</g>` };
}
export function swatch(col, tx, ty, s, rot) {
  const d = "M230,380 L570,380 L570,620 L230,620 Z";
  return group(piece(d, knit(col), { edge: 0.3 }), tx, ty, s, rot);
}

/* ---------- фон и сборка документа ---------- */
export function bg(w, h, c1, c2, linen = false) {
  return `<defs><linearGradient id="bgG" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <radialGradient id="bgL" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    ${linen ? `<pattern id="lin" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="none"/><rect width="6" height="1.4" fill="#5a4630" opacity=".05"/><rect width="1.4" height="6" fill="#5a4630" opacity=".05"/></pattern>` : ""}</defs>
    <rect width="${w}" height="${h}" fill="url(#bgG)"/><rect width="${w}" height="${h}" fill="url(#bgL)"/>${linen ? `<rect width="${w}" height="${h}" fill="url(#lin)"/>` : ""}`;
}
export function doc(w, h, back, item, vb) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb || `0 0 ${w} ${h}`}">
  <defs>${baseDefs}${item.def}</defs><g filter="url(#grain)">${back}${item.svg}</g></svg>`;
}
export { join };
