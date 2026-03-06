import { HAND_POS } from './model-data';

export type WeaponBuilderFn = (level: number, acc: string, sf: string, id: string) => string;

// ============================================================
// SVG HELPERS (used by weapon builders)
// ============================================================

export function mkFilter(id: string, color: string, strength: number = 3): string {
  return `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="${strength}" result="blur"/>
    <feFlood flood-color="${color}" flood-opacity="0.8" result="col"/>
    <feComposite in="col" in2="blur" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;
}

export function mkRunes(x: number, y: number, w: number, h: number, color: string, count: number = 4): string {
  let r = '';
  const runeChars = ['\u16B1','\u16A0','\u16A2','\u16A6','\u16A8','\u16B2','\u16B7','\u16B9','\u16BA','\u16C1','\u16C3','\u16C7','\u16C8','\u16C9','\u16CA','\u16CF'];
  for(let i=0;i<count;i++){
    const rx = x + (i/(count-1)) * w;
    const ry = y + Math.sin(i*1.3)*3;
    const ch = runeChars[(x*3+i*7)%runeChars.length];
    r += `<text x="${rx}" y="${ry}" font-size="6" fill="${color}" opacity="0.7" text-anchor="middle" font-family="serif" style="animation:rune ${1.5+i*0.4}s ease-in-out infinite">${ch}</text>`;
  }
  return r;
}

export function mkParticles(cx: number, cy: number, color: string, n: number = 6): string {
  let p = '';
  for(let i=0;i<n;i++){
    const angle = (i/n)*Math.PI*2;
    const r = 18+Math.random()*12;
    const px = cx + Math.cos(angle)*r;
    const py = cy + Math.sin(angle)*r;
    const size = 1.5+Math.random()*2;
    p += `<circle cx="${px}" cy="${py}" r="${size}" fill="${color}" opacity="0.8" style="animation:emberDrift ${1.5+i*0.3}s ease-out infinite; animation-delay:${i*0.2}s"/>`;
  }
  return p;
}

export function mkWings(cx: number, cy: number, color: string, accent: string, level: number): string {
  const maxScale = Math.min(cx / 55, 1.0);
  const scale = Math.min(0.5 + level * 0.05, maxScale);
  const opacity = 0.45 + level * 0.04;
  return `<g transform="translate(${cx},${cy}) scale(${scale})" opacity="${opacity}">
    <path d="M0,0 Q-35,-20 -55,-5 Q-45,10 -25,8 Q-40,20 -50,35 Q-30,30 -15,15Z" fill="${color}" stroke="${accent}" stroke-width="0.8"/>
    <path d="M0,0 Q35,-20 55,-5 Q45,10 25,8 Q40,20 50,35 Q30,30 15,15Z" fill="${color}" stroke="${accent}" stroke-width="0.8"/>
    <path d="M0,0 Q-20,-10 -30,5 Q-20,12 -10,8Z" fill="${accent}" opacity="0.5"/>
    <path d="M0,0 Q20,-10 30,5 Q20,12 10,8Z" fill="${accent}" opacity="0.5"/>
  </g>`;
}

// ============================================================
// BOW CATEGORY
// ============================================================
function wepLongbow(level: number, acc: string, sf: string, id: string): string {
  const bx=96, by=20, bh=140+level*2;
  const curve=14+level;
  const sw=1.5+level*0.15;
  let s='';
  s+=`<path d="M${bx},${by} Q${bx+curve},${by+bh*0.5} ${bx},${by+bh}" stroke="${acc}" stroke-width="${sw}" fill="none"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${bx}" y1="${by}" x2="${bx}" y2="${by+bh}" stroke="${sf}" stroke-width="${0.6+level*0.08}" opacity="${0.6+level*0.04}"/>`;
  if(level>=2){
    s+=`<circle cx="${bx}" cy="${by}" r="${1+level*0.2}" fill="${acc}"/>`;
    s+=`<circle cx="${bx}" cy="${by+bh}" r="${1+level*0.2}" fill="${acc}"/>`;
  }
  if(level>=4){
    for(let i=1;i<=3;i++){
      const wy=by+bh*(i*0.25);
      const wx=bx+Math.sin(i*0.8)*curve*0.9;
      s+=`<line x1="${wx-2}" y1="${wy}" x2="${wx+2}" y2="${wy}" stroke="${sf}" stroke-width="0.8" opacity="0.5"/>`;
    }
  }
  if(level>=7){
    s+=`<path d="M${bx-3},${by-2} Q${bx},${by-6} ${bx+3},${by-2}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    s+=`<path d="M${bx-3},${by+bh+2} Q${bx},${by+bh+6} ${bx+3},${by+bh+2}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    s+=`<line x1="${bx}" y1="${by}" x2="${bx}" y2="${by+bh}" stroke="${sf}" stroke-width="${1+level*0.1}" opacity="0.4" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
    s+=`<line x1="${bx}" y1="${by+bh*0.45}" x2="${bx+20+level}" y2="${by+bh*0.45}" stroke="${sf}" stroke-width="1.2" filter="url(#gf)"/>`;
    s+=`<polygon points="${bx+20+level},${by+bh*0.45-3} ${bx+25+level},${by+bh*0.45} ${bx+20+level},${by+bh*0.45+3}" fill="${sf}" filter="url(#gf)"/>`;
    s+=mkParticles(bx+5, by+bh*0.5, sf, 4);
  }
  return s;
}

function wepShortbow(level: number, acc: string, sf: string, id: string): string {
  const bx=96, by=40, bh=100+level*2;
  const curve=12+level*0.8;
  const sw=1.6+level*0.15;
  let s='';
  s+=`<path d="M${bx+3},${by} Q${bx-4},${by+bh*0.15} ${bx+curve},${by+bh*0.5} Q${bx-4},${by+bh*0.85} ${bx+3},${by+bh}" stroke="${acc}" stroke-width="${sw}" fill="none"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${bx+3}" y1="${by}" x2="${bx+3}" y2="${by+bh}" stroke="${sf}" stroke-width="${0.6+level*0.08}" opacity="${0.5+level*0.05}"/>`;
  s+=`<rect x="${bx+curve*0.5-2}" y="${by+bh*0.45}" width="5" height="${bh*0.1}" rx="1" fill="${acc}" opacity="0.7"/>`;
  if(level>=4){
    s+=`<circle cx="${bx+curve*0.5}" cy="${by+bh*0.5}" r="${1.5}" fill="${sf}" opacity="0.6"/>`;
  }
  if(level>=7){
    s+=`<line x1="${bx+3}" y1="${by}" x2="${bx+3}" y2="${by+bh}" stroke="${sf}" stroke-width="1" opacity="0.35" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    s+=mkParticles(bx+curve*0.5, by+bh*0.5, sf, 3);
    s+=`<circle cx="${bx+3}" cy="${by}" r="${1.5+level*0.2}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    s+=`<circle cx="${bx+3}" cy="${by+bh}" r="${1.5+level*0.2}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
  }
  return s;
}

function wepCrossbow(level: number, acc: string, sf: string, id: string): string {
  const cx=90, cy=78;
  const sw=1.5+level*0.15;
  const prodW=18+level;
  const stockL=30+level*2;
  let s='';
  s+=`<line x1="${cx-prodW*0.3}" y1="${cy}" x2="${cx+prodW}" y2="${cy}" stroke="${acc}" stroke-width="${sw+1}" stroke-linecap="round"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<path d="M${cx-prodW*0.3},${cy} Q${cx+prodW*0.5},${cy-8-level} ${cx+prodW},${cy}" stroke="${acc}" stroke-width="${sw}" fill="none"/>`;
  s+=`<line x1="${cx-prodW*0.3}" y1="${cy}" x2="${cx+prodW}" y2="${cy}" stroke="${sf}" stroke-width="0.8" opacity="0.6"/>`;
  s+=`<rect x="${cx+prodW*0.35-2}" y="${cy}" width="${4+level*0.3}" height="${stockL}" rx="1.5" fill="${acc}" opacity="0.85"/>`;
  s+=`<rect x="${cx+prodW*0.35-1}" y="${cy+stockL*0.6}" width="${3}" height="${4}" rx="0.5" fill="${sf}" opacity="0.5"/>`;
  s+=`<line x1="${cx+prodW*0.35}" y1="${cy-1}" x2="${cx+prodW*0.35+18+level}" y2="${cy-1}" stroke="${sf}" stroke-width="1.2"/>`;
  s+=`<polygon points="${cx+prodW*0.35+18+level},${cy-4} ${cx+prodW*0.35+22+level},${cy-1} ${cx+prodW*0.35+18+level},${cy+2}" fill="${sf}"/>`;
  if(level>=4){
    s+=`<path d="M${cx+prodW*0.35-3},${cy+stockL} Q${cx+prodW*0.35},${cy+stockL+5} ${cx+prodW*0.35+3},${cy+stockL}" stroke="${acc}" stroke-width="1.5" fill="none"/>`;
  }
  if(level>=7){
    s+=`<circle cx="${cx+prodW*0.5}" cy="${cy-4}" r="${2+level*0.2}" fill="${sf}" filter="url(#gf)" opacity="0.6" style="animation:soulPulse 1.5s infinite"/>`;
    s+=mkParticles(cx+prodW*0.5, cy, sf, 3);
    s+=`<rect x="${cx+prodW*0.35-1}" y="${cy+stockL*0.3}" width="3" height="3" fill="${sf}" filter="url(#gf)" opacity="0.5" style="animation:soulPulse 2s infinite"/>`;
  }
  return s;
}

function wepSling(level: number, acc: string, sf: string, id: string): string {
  const sx=92, sy=82;
  const sw=1.2+level*0.1;
  let s='';
  s+=`<path d="M${sx},${sy} Q${sx+8},${sy-15-level} ${sx+18},${sy-25-level*2}" stroke="${acc}" stroke-width="${sw}" fill="none"/>`;
  s+=`<path d="M${sx+2},${sy} Q${sx+12},${sy-12-level} ${sx+18},${sy-25-level*2}" stroke="${acc}" stroke-width="${sw}" fill="none"/>`;
  s+=`<ellipse cx="${sx+18}" cy="${sy-25-level*2}" rx="${4+level*0.3}" ry="${2.5+level*0.2}" fill="${acc}" opacity="0.8"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<circle cx="${sx+18}" cy="${sy-25-level*2}" r="${2+level*0.2}" fill="${sf}" opacity="${0.6+level*0.04}"/>`;
  s+=`<circle cx="${sx+1}" cy="${sy}" r="${1.5}" fill="${acc}"/>`;
  if(level>=4){
    s+=`<ellipse cx="${sx}" cy="${sy+3}" rx="2" ry="3" stroke="${acc}" stroke-width="1" fill="none"/>`;
  }
  if(level>=7){
    s+=`<circle cx="${sx+18}" cy="${sy-25-level*2}" r="${3+level*0.3}" fill="${sf}" filter="url(#gf)" opacity="0.5" style="animation:soulPulse 1.3s infinite"/>`;
    s+=`<path d="M${sx+18},${sy-25-level*2} Q${sx+28},${sy-35-level*2} ${sx+35},${sy-40-level*2}" stroke="${sf}" stroke-width="1" fill="none" opacity="0.3" filter="url(#gf)" style="animation:soulPulse 1s infinite"/>`;
    s+=mkParticles(sx+18, sy-25-level*2, sf, 3);
  }
  return s;
}

function wepAtlatl(level: number, acc: string, sf: string, id: string): string {
  const ax=90, ay=75;
  const shaftL=35+level*2;
  const sw=1.4+level*0.12;
  let s='';
  s+=`<line x1="${ax}" y1="${ay}" x2="${ax+shaftL*0.7}" y2="${ay-shaftL*0.7}" stroke="${acc}" stroke-width="${sw+1}" stroke-linecap="round"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  const hx=ax+shaftL*0.7, hy=ay-shaftL*0.7;
  s+=`<path d="M${hx},${hy} L${hx+2},${hy-4} L${hx+4},${hy-2}" stroke="${acc}" stroke-width="${sw}" fill="none"/>`;
  const dartL=40+level*2;
  s+=`<line x1="${hx-2}" y1="${hy+2}" x2="${hx+dartL*0.7}" y2="${hy-dartL*0.7}" stroke="${sf}" stroke-width="${1+level*0.1}"/>`;
  const dx=hx+dartL*0.7, dy=hy-dartL*0.7;
  s+=`<polygon points="${dx},${dy} ${dx-4},${dy+2} ${dx-3},${dy+5}" fill="${sf}"/>`;
  s+=`<path d="M${hx},${hy} L${hx-3},${hy+4} L${hx+1},${hy+3}" fill="${acc}" opacity="0.6"/>`;
  if(level>=4){
    s+=`<rect x="${ax-1}" y="${ay-2}" width="${6}" height="${5}" rx="1" fill="${acc}" opacity="0.5"/>`;
  }
  if(level>=7){
    s+=`<circle cx="${dx}" cy="${dy}" r="${2+level*0.3}" fill="${sf}" filter="url(#gf)" opacity="0.6" style="animation:soulPulse 1.4s infinite"/>`;
    s+=mkParticles(dx, dy, sf, 3);
    s+=mkRunes(ax+5, ay-10, 15, 8, sf, 2);
  }
  return s;
}

// ============================================================
// LIGHT CATEGORY
// ============================================================
function wepDaggerSpec(level: number, acc: string, sf: string, id: string): string {
  const dx=95, dy=55+level;
  const bladeL=30+level*1.5;
  const bladeW=4+level*0.4;
  let s='';
  s+=`<polygon points="${dx},${dy} ${dx+bladeW/2},${dy+bladeL} ${dx-bladeW/2},${dy+bladeL}" fill="${sf}" opacity="${0.7+level*0.03}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${dx}" y1="${dy+4}" x2="${dx}" y2="${dy+bladeL-4}" stroke="${acc}" stroke-width="0.6" opacity="0.4"/>`;
  s+=`<rect x="${dx-5}" y="${dy+bladeL}" width="10" height="${2+level*0.2}" rx="0.5" fill="${acc}"/>`;
  s+=`<rect x="${dx-2}" y="${dy+bladeL+2+level*0.2}" width="4" height="${12+level*0.5}" rx="1" fill="${acc}" opacity="0.85"/>`;
  s+=`<circle cx="${dx}" cy="${dy+bladeL+16+level*0.7}" r="${2+level*0.15}" fill="${acc}"/>`;
  if(level>=4){
    s+=`<line x1="${dx-bladeW/2+0.5}" y1="${dy+3}" x2="${dx}" y2="${dy}" stroke="${sf}" stroke-width="0.5" opacity="0.5"/>`;
    s+=`<line x1="${dx+bladeW/2-0.5}" y1="${dy+3}" x2="${dx}" y2="${dy}" stroke="${sf}" stroke-width="0.5" opacity="0.5"/>`;
  }
  if(level>=7){
    for(let i=0;i<3;i++){
      const ey=dy+8+i*(bladeL/3);
      s+=`<line x1="${dx-bladeW/2}" y1="${ey}" x2="${dx-bladeW/2-3-Math.random()*3}" y2="${ey+6+Math.random()*4}" stroke="${sf}" stroke-width="0.8" opacity="0.5" filter="url(#gf)" style="animation:soulPulse ${1.2+i*0.3}s infinite"/>`;
      s+=`<line x1="${dx+bladeW/2}" y1="${ey}" x2="${dx+bladeW/2+3+Math.random()*3}" y2="${ey+6+Math.random()*4}" stroke="${sf}" stroke-width="0.8" opacity="0.5" filter="url(#gf)" style="animation:soulPulse ${1.4+i*0.3}s infinite"/>`;
    }
    s+=mkParticles(dx, dy+bladeL*0.3, sf, 3);
  }
  return s;
}

function wepShortsword(level: number, acc: string, sf: string, id: string): string {
  const sx=95, sy=48+level*0.5;
  const bladeL=42+level*2;
  const bladeW=5+level*0.5;
  let s='';
  s+=`<polygon points="${sx},${sy} ${sx+bladeW/2},${sy+5} ${sx+bladeW/2},${sy+bladeL-5} ${sx},${sy+bladeL} ${sx-bladeW/2},${sy+bladeL-5} ${sx-bladeW/2},${sy+5}" fill="${sf}" opacity="${0.7+level*0.03}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${sx}" y1="${sy+8}" x2="${sx}" y2="${sy+bladeL-10}" stroke="${acc}" stroke-width="0.8" opacity="0.35"/>`;
  s+=`<rect x="${sx-7}" y="${sy+bladeL}" width="14" height="${2.5+level*0.2}" rx="0.8" fill="${acc}"/>`;
  s+=`<circle cx="${sx-7}" cy="${sy+bladeL+1.2}" r="1.2" fill="${acc}"/>`;
  s+=`<circle cx="${sx+7}" cy="${sy+bladeL+1.2}" r="1.2" fill="${acc}"/>`;
  s+=`<rect x="${sx-2.5}" y="${sy+bladeL+3+level*0.2}" width="5" height="${14+level*0.5}" rx="1" fill="${acc}" opacity="0.85"/>`;
  for(let i=0;i<3;i++){
    const gy=sy+bladeL+5+level*0.2+i*4;
    s+=`<line x1="${sx-2.5}" y1="${gy}" x2="${sx+2.5}" y2="${gy+2}" stroke="${sf}" stroke-width="0.5" opacity="0.3"/>`;
  }
  s+=`<ellipse cx="${sx}" cy="${sy+bladeL+19+level*0.7}" rx="${2.5+level*0.15}" ry="${2}" fill="${acc}"/>`;
  if(level>=7){
    s+=`<polygon points="${sx},${sy} ${sx+bladeW/2},${sy+5} ${sx+bladeW/2},${sy+bladeL-5} ${sx},${sy+bladeL} ${sx-bladeW/2},${sy+bladeL-5} ${sx-bladeW/2},${sy+5}" fill="${sf}" opacity="0.2" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    s+=mkParticles(sx, sy+bladeL*0.3, sf, 3);
  }
  return s;
}

function wepRapier(level: number, acc: string, sf: string, id: string): string {
  const rx=95, ry=35+level*0.5;
  const bladeL=60+level*2;
  let s='';
  s+=`<line x1="${rx}" y1="${ry}" x2="${rx}" y2="${ry+bladeL}" stroke="${sf}" stroke-width="${1.5+level*0.15}" stroke-linecap="round"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<polygon points="${rx},${ry} ${rx-1.5},${ry+5} ${rx+1.5},${ry+5}" fill="${sf}"/>`;
  const gy=ry+bladeL;
  s+=`<path d="M${rx-8},${gy} Q${rx-10},${gy+4} ${rx},${gy+6} Q${rx+10},${gy+4} ${rx+8},${gy}" stroke="${acc}" stroke-width="${1+level*0.1}" fill="none"/>`;
  s+=`<path d="M${rx-8},${gy} Q${rx-6},${gy-3} ${rx},${gy-4} Q${rx+6},${gy-3} ${rx+8},${gy}" stroke="${acc}" stroke-width="${1+level*0.1}" fill="none"/>`;
  s+=`<rect x="${rx-1}" y="${gy+6}" width="2" height="${3}" fill="${acc}"/>`;
  s+=`<rect x="${rx-2}" y="${gy+9}" width="4" height="${14+level*0.5}" rx="1" fill="${acc}" opacity="0.85"/>`;
  s+=`<circle cx="${rx}" cy="${gy+25+level*0.5}" r="${2+level*0.15}" fill="${acc}"/>`;
  if(level>=4){
    s+=`<path d="M${rx-6},${gy+1} Q${rx},${gy+8} ${rx+6},${gy+1}" stroke="${sf}" stroke-width="0.6" fill="none" opacity="0.4"/>`;
  }
  if(level>=7){
    s+=`<line x1="${rx}" y1="${ry}" x2="${rx}" y2="${ry+bladeL}" stroke="${sf}" stroke-width="0.8" opacity="0.3" filter="url(#gf)" style="animation:soulPulse 1.6s infinite"/>`;
    s+=`<circle cx="${rx}" cy="${ry}" r="${2}" fill="${sf}" filter="url(#gf)" opacity="0.5" style="animation:soulPulse 1.2s infinite"/>`;
    s+=mkParticles(rx, ry+bladeL*0.3, sf, 2);
  }
  return s;
}

function wepHandaxe(level: number, acc: string, sf: string, id: string): string {
  const hx=95, hy=58;
  const shaftL=35+level*1.5;
  const headW=12+level;
  const sw=1.3+level*0.12;
  let s='';
  s+=`<line x1="${hx}" y1="${hy+shaftL}" x2="${hx}" y2="${hy}" stroke="${acc}" stroke-width="${sw+1}" stroke-linecap="round"/>`;
  s+=`<path d="M${hx},${hy} Q${hx+headW},${hy-4} ${hx+headW},${hy+6} Q${hx+headW*0.8},${hy+12} ${hx},${hy+10}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<path d="M${hx+headW},${hy-3} Q${hx+headW+1},${hy+3} ${hx+headW*0.85},${hy+11}" stroke="${acc}" stroke-width="0.8" fill="none" opacity="0.5"/>`;
  s+=`<rect x="${hx-2}" y="${hy+shaftL-8}" width="4" height="6" rx="1" fill="${acc}" opacity="0.5"/>`;
  if(level>=7){
    s+=`<path d="M${hx},${hy} Q${hx+headW+2},${hy-5} ${hx+headW+2},${hy+6} Q${hx+headW},${hy+13} ${hx},${hy+10}" fill="${sf}" opacity="0.2" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    s+=mkParticles(hx+headW*0.5, hy+3, sf, 3);
  }
  return s;
}

function wepThrowingHammer(level: number, acc: string, sf: string, id: string): string {
  const tx=95, ty=58;
  const shaftL=35+level*1.5;
  const headW=10+level*0.8;
  const headH=8+level*0.6;
  const sw=1.3+level*0.12;
  let s='';
  s+=`<line x1="${tx}" y1="${ty+shaftL}" x2="${tx}" y2="${ty}" stroke="${acc}" stroke-width="${sw+1}" stroke-linecap="round"/>`;
  s+=`<rect x="${tx-headW*0.3}" y="${ty-headH/2}" width="${headW}" height="${headH}" rx="${1+level*0.1}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${tx+headW*0.6}" y1="${ty-headH/2+2}" x2="${tx+headW*0.6}" y2="${ty+headH/2-2}" stroke="${acc}" stroke-width="0.8" opacity="0.4"/>`;
  s+=`<rect x="${tx-2}" y="${ty+shaftL-8}" width="4" height="6" rx="1" fill="${acc}" opacity="0.5"/>`;
  s+=`<circle cx="${tx}" cy="${ty+shaftL+1}" r="${1.5}" fill="${acc}"/>`;
  if(level>=7){
    s+=`<rect x="${tx-headW*0.3-1}" y="${ty-headH/2-1}" width="${headW+2}" height="${headH+2}" rx="2" fill="${sf}" opacity="0.2" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    s+=mkParticles(tx+headW*0.3, ty, sf, 3);
  }
  return s;
}

// ============================================================
// MEDIUM CATEGORY
// ============================================================
function wepLongsword(level: number, acc: string, sf: string, id: string): string {
  const lx=96, ly=30+level*0.5;
  const bladeL=65+level*2.5;
  const bladeW=6+level*0.5;
  let s='';
  s+=`<polygon points="${lx},${ly} ${lx+bladeW/2},${ly+6} ${lx+bladeW/2},${ly+bladeL-6} ${lx},${ly+bladeL} ${lx-bladeW/2},${ly+bladeL-6} ${lx-bladeW/2},${ly+6}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${lx}" y1="${ly+10}" x2="${lx}" y2="${ly+bladeL*0.6}" stroke="${acc}" stroke-width="1" opacity="0.3"/>`;
  s+=`<rect x="${lx-9}" y="${ly+bladeL}" width="18" height="${3+level*0.2}" rx="1" fill="${acc}"/>`;
  s+=`<circle cx="${lx-9}" cy="${ly+bladeL+1.5}" r="1.5" fill="${acc}"/>`;
  s+=`<circle cx="${lx+9}" cy="${ly+bladeL+1.5}" r="1.5" fill="${acc}"/>`;
  s+=`<rect x="${lx-2.5}" y="${ly+bladeL+3.5+level*0.2}" width="5" height="${16+level*0.5}" rx="1.5" fill="${acc}" opacity="0.85"/>`;
  for(let i=0;i<4;i++){
    const gy=ly+bladeL+5+level*0.2+i*3.5;
    s+=`<line x1="${lx-2.5}" y1="${gy}" x2="${lx+2.5}" y2="${gy+1.5}" stroke="${sf}" stroke-width="0.5" opacity="0.25"/>`;
  }
  s+=`<circle cx="${lx}" cy="${ly+bladeL+21+level*0.7}" r="${2.5+level*0.2}" fill="${acc}"/>`;
  if(level>=7){
    s+=`<polygon points="${lx},${ly} ${lx+bladeW/2},${ly+6} ${lx+bladeW/2},${ly+bladeL-6} ${lx},${ly+bladeL} ${lx-bladeW/2},${ly+bladeL-6} ${lx-bladeW/2},${ly+6}" fill="${sf}" opacity="0.2" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
    s+=mkRunes(lx-3, ly+15, 6, bladeL*0.4, sf, 3);
    s+=mkParticles(lx, ly+bladeL*0.3, sf, 3);
  }
  return s;
}

function wepBattleaxe(level: number, acc: string, sf: string, id: string): string {
  const bx=96, by=38;
  const shaftL=60+level*2;
  const headW=16+level*1.2;
  const headH=20+level*1.5;
  const sw=1.4+level*0.12;
  let s='';
  s+=`<line x1="${bx}" y1="${by}" x2="${bx}" y2="${by+shaftL}" stroke="${acc}" stroke-width="${sw+1.5}" stroke-linecap="round"/>`;
  s+=`<path d="M${bx},${by+4} Q${bx+headW},${by-2} ${bx+headW},${by+headH/2} Q${bx+headW},${by+headH+2} ${bx},${by+headH-4}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<path d="M${bx+headW},${by} Q${bx+headW+2},${by+headH/2} ${bx+headW},${by+headH}" stroke="${acc}" stroke-width="1" fill="none" opacity="0.4"/>`;
  s+=`<line x1="${bx-2}" y1="${by+headH+2}" x2="${bx-2}" y2="${by+headH+8}" stroke="${acc}" stroke-width="1" opacity="0.5"/>`;
  s+=`<line x1="${bx+2}" y1="${by+headH+2}" x2="${bx+2}" y2="${by+headH+8}" stroke="${acc}" stroke-width="1" opacity="0.5"/>`;
  s+=`<rect x="${bx-2.5}" y="${by+shaftL-10}" width="5" height="8" rx="1" fill="${acc}" opacity="0.5"/>`;
  s+=`<circle cx="${bx}" cy="${by+shaftL+1}" r="2" fill="${acc}"/>`;
  if(level>=7){
    s+=`<path d="M${bx},${by+4} Q${bx+headW+2},${by-3} ${bx+headW+2},${by+headH/2} Q${bx+headW+2},${by+headH+3} ${bx},${by+headH-4}" fill="${sf}" opacity="0.2" filter="url(#gf)" style="animation:soulPulse 1.6s infinite"/>`;
    s+=mkParticles(bx+headW*0.6, by+headH*0.5, sf, 3);
  }
  return s;
}

function wepWarhammer(level: number, acc: string, sf: string, id: string): string {
  const wx=96, wy=38;
  const shaftL=60+level*2;
  const headW=14+level;
  const headH=10+level*0.8;
  const sw=1.4+level*0.12;
  let s='';
  s+=`<line x1="${wx}" y1="${wy}" x2="${wx}" y2="${wy+shaftL}" stroke="${acc}" stroke-width="${sw+1.5}" stroke-linecap="round"/>`;
  s+=`<rect x="${wx}" y="${wy}" width="${headW*0.6}" height="${headH}" rx="${1}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<polygon points="${wx},${wy+headH*0.2} ${wx-headW*0.5},${wy+headH*0.5} ${wx},${wy+headH*0.8}" fill="${sf}" opacity="${0.7+level*0.025}"/>`;
  if(level>=4){
    s+=`<line x1="${wx+headW*0.55}" y1="${wy+2}" x2="${wx+headW*0.55}" y2="${wy+headH-2}" stroke="${acc}" stroke-width="0.8" opacity="0.4"/>`;
  }
  s+=`<rect x="${wx-2.5}" y="${wy+shaftL-10}" width="5" height="8" rx="1" fill="${acc}" opacity="0.5"/>`;
  s+=`<circle cx="${wx}" cy="${wy+shaftL+1}" r="2" fill="${acc}"/>`;
  if(level>=7){
    s+=`<rect x="${wx-1}" y="${wy-1}" width="${headW*0.6+2}" height="${headH+2}" rx="2" fill="${sf}" opacity="0.2" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    s+=mkParticles(wx+headW*0.3, wy+headH*0.5, sf, 3);
  }
  return s;
}

function wepClub(level: number, acc: string, sf: string, id: string): string {
  const cx=96, cy=40;
  const shaftL=55+level*2;
  const topW=8+level*0.8;
  const botW=4+level*0.3;
  let s='';
  s+=`<path d="M${cx-botW/2},${cy+shaftL} L${cx-topW/2},${cy+8} Q${cx-topW/2-2},${cy} ${cx},${cy-2} Q${cx+topW/2+2},${cy} ${cx+topW/2},${cy+8} L${cx+botW/2},${cy+shaftL}Z" fill="${acc}" opacity="${0.8+level*0.02}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${cx-1}" y1="${cy+5}" x2="${cx-2}" y2="${cy+shaftL-5}" stroke="${sf}" stroke-width="0.5" opacity="0.25"/>`;
  s+=`<line x1="${cx+1}" y1="${cy+8}" x2="${cx+1.5}" y2="${cy+shaftL-3}" stroke="${sf}" stroke-width="0.5" opacity="0.2"/>`;
  if(level>=3){
    s+=`<ellipse cx="${cx-2}" cy="${cy+shaftL*0.3}" rx="1.5" ry="1" fill="${sf}" opacity="0.3"/>`;
    s+=`<ellipse cx="${cx+1}" cy="${cy+shaftL*0.6}" rx="1" ry="1.5" fill="${sf}" opacity="0.25"/>`;
  }
  if(level>=4){
    s+=`<circle cx="${cx-topW/2+2}" cy="${cy+4}" r="1" fill="${sf}" opacity="0.6"/>`;
    s+=`<circle cx="${cx+topW/2-2}" cy="${cy+4}" r="1" fill="${sf}" opacity="0.6"/>`;
    s+=`<circle cx="${cx}" cy="${cy}" r="1" fill="${sf}" opacity="0.6"/>`;
  }
  if(level>=7){
    s+=`<rect x="${cx-topW/2-1}" y="${cy+2}" width="${topW+2}" height="3" rx="1" fill="${sf}" filter="url(#gf)" opacity="0.3" style="animation:soulPulse 2s infinite"/>`;
    s+=`<rect x="${cx-topW/2+1}" y="${cy+12}" width="${topW-2}" height="2" rx="1" fill="${sf}" filter="url(#gf)" opacity="0.25" style="animation:soulPulse 2.2s infinite"/>`;
    s+=mkParticles(cx, cy+5, sf, 2);
  }
  return s;
}

// ============================================================
// HEAVY CATEGORY
// ============================================================
function wepGreatsword(level: number, acc: string, sf: string, id: string): string {
  const gx=96, gy=15+level*0.3;
  const bladeL=90+level*3;
  const bladeW=8+level*0.7;
  let s='';
  s+=`<polygon points="${gx},${gy} ${gx+bladeW/2},${gy+8} ${gx+bladeW/2},${gy+bladeL-8} ${gx},${gy+bladeL} ${gx-bladeW/2},${gy+bladeL-8} ${gx-bladeW/2},${gy+8}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<rect x="${gx-1}" y="${gy+12}" width="2" height="${bladeL*0.5}" rx="0.5" fill="${acc}" opacity="0.25"/>`;
  if(level>=4){
    s+=`<line x1="${gx-bladeW/4}" y1="${gy+15}" x2="${gx-bladeW/4}" y2="${gy+bladeL*0.4}" stroke="${acc}" stroke-width="0.6" opacity="0.2"/>`;
    s+=`<line x1="${gx+bladeW/4}" y1="${gy+15}" x2="${gx+bladeW/4}" y2="${gy+bladeL*0.4}" stroke="${acc}" stroke-width="0.6" opacity="0.2"/>`;
  }
  s+=`<rect x="${gx-12}" y="${gy+bladeL}" width="24" height="${3.5+level*0.25}" rx="1" fill="${acc}"/>`;
  s+=`<circle cx="${gx-12}" cy="${gy+bladeL+1.7}" r="${2}" fill="${acc}"/>`;
  s+=`<circle cx="${gx+12}" cy="${gy+bladeL+1.7}" r="${2}" fill="${acc}"/>`;
  s+=`<rect x="${gx-3}" y="${gy+bladeL+4}" width="6" height="5" fill="${sf}" opacity="0.4"/>`;
  s+=`<rect x="${gx-3}" y="${gy+bladeL+9}" width="6" height="${22+level}" rx="1.5" fill="${acc}" opacity="0.85"/>`;
  for(let i=0;i<5;i++){
    const wy=gy+bladeL+11+i*4;
    s+=`<line x1="${gx-3}" y1="${wy}" x2="${gx+3}" y2="${wy+2}" stroke="${sf}" stroke-width="0.6" opacity="0.2"/>`;
  }
  s+=`<path d="M${gx-3},${gy+bladeL+32+level} Q${gx},${gy+bladeL+37+level} ${gx+3},${gy+bladeL+32+level}" fill="${acc}"/>`;
  s+=`<circle cx="${gx}" cy="${gy+bladeL+33+level}" r="${3+level*0.2}" fill="${acc}"/>`;
  if(level>=7){
    s+=`<polygon points="${gx},${gy} ${gx+bladeW/2+1},${gy+8} ${gx+bladeW/2+1},${gy+bladeL-8} ${gx},${gy+bladeL} ${gx-bladeW/2-1},${gy+bladeL-8} ${gx-bladeW/2-1},${gy+8}" fill="${sf}" opacity="0.15" filter="url(#gf)" style="animation:soulPulse 2.2s infinite"/>`;
    s+=mkRunes(gx-3, gy+20, 6, bladeL*0.35, sf, 4);
    s+=mkParticles(gx, gy+bladeL*0.25, sf, 5);
  }
  return s;
}

function wepGreataxe(level: number, acc: string, sf: string, id: string): string {
  const ax=96, ay=18;
  const shaftL=80+level*3;
  const headW=22+level*1.5;
  const headH=30+level*2;
  let s='';
  s+=`<line x1="${ax}" y1="${ay}" x2="${ax}" y2="${ay+shaftL}" stroke="${acc}" stroke-width="${2+level*0.2}" stroke-linecap="round"/>`;
  s+=`<path d="M${ax},${ay+5} Q${ax+headW},${ay-5} ${ax+headW},${ay+headH/2} Q${ax+headW},${ay+headH+5} ${ax},${ay+headH-5}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<path d="M${ax+headW},${ay-3} Q${ax+headW+3},${ay+headH/2} ${ax+headW},${ay+headH+3}" stroke="${acc}" stroke-width="1.2" fill="none" opacity="0.5"/>`;
  if(level>=4){
    s+=`<path d="M${ax+3},${ay+headH*0.3} Q${ax+headW*0.5},${ay+headH*0.3} ${ax+headW*0.7},${ay+headH*0.5}" stroke="${acc}" stroke-width="0.8" fill="none" opacity="0.3"/>`;
    s+=`<path d="M${ax+3},${ay+headH*0.7} Q${ax+headW*0.5},${ay+headH*0.7} ${ax+headW*0.7},${ay+headH*0.5}" stroke="${acc}" stroke-width="0.8" fill="none" opacity="0.3"/>`;
  }
  s+=`<line x1="${ax-2}" y1="${ay+headH}" x2="${ax-2}" y2="${ay+headH+10}" stroke="${acc}" stroke-width="1.2" opacity="0.5"/>`;
  s+=`<line x1="${ax+2}" y1="${ay+headH}" x2="${ax+2}" y2="${ay+headH+10}" stroke="${acc}" stroke-width="1.2" opacity="0.5"/>`;
  s+=`<rect x="${ax-3}" y="${ay+shaftL-14}" width="6" height="12" rx="1.5" fill="${acc}" opacity="0.5"/>`;
  s+=`<rect x="${ax-3.5}" y="${ay+shaftL}" width="7" height="3" rx="1" fill="${acc}"/>`;
  if(level>=7){
    s+=`<path d="M${ax},${ay+5} Q${ax+headW+2},${ay-6} ${ax+headW+2},${ay+headH/2} Q${ax+headW+2},${ay+headH+6} ${ax},${ay+headH-5}" fill="${sf}" opacity="0.15" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    s+=mkParticles(ax+headW*0.6, ay+headH*0.5, sf, 5);
    s+=mkRunes(ax+3, ay+5, headW*0.5, headH*0.6, sf, 2);
  }
  return s;
}

function wepMaul(level: number, acc: string, sf: string, id: string): string {
  const mx=96, my=20;
  const shaftL=80+level*3;
  const headW=18+level*1.2;
  const headH=16+level;
  let s='';
  s+=`<line x1="${mx}" y1="${my}" x2="${mx}" y2="${my+shaftL}" stroke="${acc}" stroke-width="${2.2+level*0.2}" stroke-linecap="round"/>`;
  s+=`<rect x="${mx-headW*0.3}" y="${my}" width="${headW}" height="${headH}" rx="${2+level*0.2}" fill="${sf}" opacity="${0.78+level*0.022}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${mx+headW*0.6}" y1="${my+2}" x2="${mx+headW*0.6}" y2="${my+headH-2}" stroke="${acc}" stroke-width="1" opacity="0.4"/>`;
  s+=`<line x1="${mx-headW*0.2}" y1="${my+2}" x2="${mx-headW*0.2}" y2="${my+headH-2}" stroke="${acc}" stroke-width="1" opacity="0.4"/>`;
  s+=`<rect x="${mx-headW*0.3}" y="${my+headH*0.35}" width="${headW}" height="${2}" fill="${acc}" opacity="0.3"/>`;
  if(level>=4){
    s+=`<rect x="${mx-2}" y="${my+headH+2}" width="4" height="4" fill="${acc}" opacity="0.4"/>`;
    s+=`<rect x="${mx-2}" y="${my+headH+8}" width="4" height="3" fill="${acc}" opacity="0.3"/>`;
  }
  s+=`<rect x="${mx-3}" y="${my+shaftL-14}" width="6" height="12" rx="1.5" fill="${acc}" opacity="0.5"/>`;
  s+=`<rect x="${mx-3.5}" y="${my+shaftL}" width="7" height="3" rx="1" fill="${acc}"/>`;
  if(level>=7){
    s+=`<rect x="${mx-headW*0.3-1}" y="${my-1}" width="${headW+2}" height="${headH+2}" rx="3" fill="${sf}" opacity="0.18" filter="url(#gf)" style="animation:soulPulse 1.6s infinite"/>`;
    s+=`<line x1="${mx+headW*0.65}" y1="${my+headH/2}" x2="${mx+headW*0.65+8}" y2="${my+headH/2-4}" stroke="${sf}" stroke-width="0.8" opacity="0.4" filter="url(#gf)"/>`;
    s+=`<line x1="${mx+headW*0.65}" y1="${my+headH/2}" x2="${mx+headW*0.65+7}" y2="${my+headH/2+5}" stroke="${sf}" stroke-width="0.8" opacity="0.4" filter="url(#gf)"/>`;
    s+=mkParticles(mx+headW*0.3, my+headH*0.5, sf, 4);
  }
  return s;
}

function wepMorningstar(level: number, acc: string, sf: string, id: string): string {
  const mx=96, my=45;
  const shaftL=50+level*2;
  const ballR=7+level*0.7;
  const spikeL=5+level*0.5;
  const numSpikes=6+Math.floor(level/2);
  let s='';
  s+=`<line x1="${mx}" y1="${my+ballR*2+5}" x2="${mx}" y2="${my+ballR*2+5+shaftL}" stroke="${acc}" stroke-width="${1.8+level*0.15}" stroke-linecap="round"/>`;
  s+=`<circle cx="${mx}" cy="${my+ballR}" r="${ballR}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  for(let i=0;i<numSpikes;i++){
    const angle=(i/numSpikes)*Math.PI*2;
    const sx2=mx+Math.cos(angle)*(ballR+spikeL);
    const sy2=my+ballR+Math.sin(angle)*(ballR+spikeL);
    const sx1=mx+Math.cos(angle)*ballR;
    const sy1=my+ballR+Math.sin(angle)*ballR;
    s+=`<line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="${sf}" stroke-width="${1+level*0.1}" stroke-linecap="round"/>`;
  }
  s+=`<rect x="${mx-3}" y="${my+ballR*2}" width="6" height="5" rx="1" fill="${acc}" opacity="0.7"/>`;
  s+=`<rect x="${mx-2.5}" y="${my+ballR*2+5+shaftL-10}" width="5" height="8" rx="1" fill="${acc}" opacity="0.5"/>`;
  s+=`<circle cx="${mx}" cy="${my+ballR*2+5+shaftL+1}" r="2" fill="${acc}"/>`;
  if(level>=7){
    s+=`<circle cx="${mx}" cy="${my+ballR}" r="${ballR+2}" fill="${sf}" opacity="0.15" filter="url(#gf)" style="animation:soulPulse 1.4s infinite"/>`;
    s+=mkParticles(mx, my+ballR, sf, 4);
  }
  return s;
}

// ============================================================
// POLEARM CATEGORY
// ============================================================
function wepGlaive(level: number, acc: string, sf: string, id: string): string {
  const px=96, py=10;
  const poleL=130+level*2;
  const bladeL=25+level*2;
  const bladeW=10+level;
  let s='';
  s+=`<line x1="${px}" y1="${py+bladeL}" x2="${px}" y2="${py+poleL}" stroke="${acc}" stroke-width="${2+level*0.15}" stroke-linecap="round"/>`;
  s+=`<path d="M${px},${py} Q${px+bladeW},${py+bladeL*0.3} ${px+bladeW*0.8},${py+bladeL*0.7} L${px},${py+bladeL}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${px}" y1="${py}" x2="${px}" y2="${py+bladeL}" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>`;
  s+=`<path d="M${px+1},${py} Q${px+bladeW+1},${py+bladeL*0.3} ${px+bladeW*0.8+1},${py+bladeL*0.7}" stroke="${acc}" stroke-width="0.8" fill="none" opacity="0.4"/>`;
  s+=`<rect x="${px-2.5}" y="${py+bladeL}" width="5" height="6" rx="1" fill="${acc}" opacity="0.6"/>`;
  s+=`<rect x="${px-2}" y="${py+poleL*0.5}" width="4" height="8" rx="1" fill="${acc}" opacity="0.4"/>`;
  s+=`<rect x="${px-2.5}" y="${py+poleL-2}" width="5" height="4" rx="1" fill="${acc}"/>`;
  if(level>=7){
    s+=`<path d="M${px},${py} Q${px+bladeW+2},${py+bladeL*0.3} ${px+bladeW*0.8+2},${py+bladeL*0.7} L${px},${py+bladeL}" fill="${sf}" opacity="0.15" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    s+=mkParticles(px+bladeW*0.5, py+bladeL*0.4, sf, 3);
    s+=mkRunes(px-3, py+bladeL+10, 6, 20, sf, 2);
  }
  return s;
}

function wepHalberd(level: number, acc: string, sf: string, id: string): string {
  const hx=96, hy=10;
  const poleL=130+level*2;
  const axeW=16+level*1.2;
  const axeH=22+level*1.5;
  const spikeL=12+level;
  let s='';
  s+=`<line x1="${hx}" y1="${hy}" x2="${hx}" y2="${hy+poleL}" stroke="${acc}" stroke-width="${2+level*0.15}" stroke-linecap="round"/>`;
  s+=`<polygon points="${hx},${hy-spikeL} ${hx-2},${hy} ${hx+2},${hy}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<path d="M${hx},${hy+3} Q${hx+axeW},${hy} ${hx+axeW},${hy+axeH*0.5} Q${hx+axeW},${hy+axeH} ${hx},${hy+axeH-3}" fill="${sf}" opacity="${0.72+level*0.028}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<path d="M${hx},${hy+axeH*0.3} L${hx-8-level*0.5},${hy+axeH*0.5} L${hx},${hy+axeH*0.7}" stroke="${sf}" stroke-width="${1.2+level*0.1}" fill="none"/>`;
  s+=`<rect x="${hx-2.5}" y="${hy+axeH}" width="5" height="6" rx="1" fill="${acc}" opacity="0.6"/>`;
  s+=`<line x1="${hx-2}" y1="${hy+axeH+6}" x2="${hx-2}" y2="${hy+axeH+14}" stroke="${acc}" stroke-width="1" opacity="0.4"/>`;
  s+=`<line x1="${hx+2}" y1="${hy+axeH+6}" x2="${hx+2}" y2="${hy+axeH+14}" stroke="${acc}" stroke-width="1" opacity="0.4"/>`;
  s+=`<rect x="${hx-2}" y="${hy+poleL*0.5}" width="4" height="8" rx="1" fill="${acc}" opacity="0.4"/>`;
  s+=`<polygon points="${hx},${hy+poleL+4} ${hx-1.5},${hy+poleL} ${hx+1.5},${hy+poleL}" fill="${acc}"/>`;
  if(level>=7){
    s+=`<polygon points="${hx},${hy-spikeL-2} ${hx-3},${hy+1} ${hx+3},${hy+1}" fill="${sf}" opacity="0.2" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    s+=`<path d="M${hx},${hy+3} Q${hx+axeW+2},${hy-1} ${hx+axeW+2},${hy+axeH*0.5} Q${hx+axeW+2},${hy+axeH+1} ${hx},${hy+axeH-3}" fill="${sf}" opacity="0.12" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
    s+=mkParticles(hx+axeW*0.5, hy+axeH*0.4, sf, 4);
  }
  return s;
}

function wepLongspear(level: number, acc: string, sf: string, id: string): string {
  const sx=96, sy=10;
  const poleL=130+level*2;
  const headL=16+level*1.5;
  const headW=6+level*0.5;
  let s='';
  s+=`<line x1="${sx}" y1="${sy+headL}" x2="${sx}" y2="${sy+poleL}" stroke="${acc}" stroke-width="${2+level*0.15}" stroke-linecap="round"/>`;
  s+=`<polygon points="${sx},${sy} ${sx+headW/2},${sy+headL} ${sx-headW/2},${sy+headL}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${sx}" y1="${sy+2}" x2="${sx}" y2="${sy+headL-2}" stroke="${acc}" stroke-width="0.8" opacity="0.4"/>`;
  s+=`<rect x="${sx-2.5}" y="${sy+headL}" width="5" height="5" rx="1" fill="${acc}" opacity="0.6"/>`;
  s+=`<rect x="${sx-2}" y="${sy+poleL*0.5}" width="4" height="8" rx="1" fill="${acc}" opacity="0.4"/>`;
  s+=`<rect x="${sx-2}" y="${sy+poleL*0.75}" width="4" height="6" rx="1" fill="${acc}" opacity="0.35"/>`;
  s+=`<rect x="${sx-2.5}" y="${sy+poleL-2}" width="5" height="4" rx="1" fill="${acc}"/>`;
  if(level>=4){
    s+=`<line x1="${sx-5}" y1="${sy+headL+2}" x2="${sx+5}" y2="${sy+headL+2}" stroke="${acc}" stroke-width="1.5" opacity="0.5"/>`;
  }
  if(level>=7){
    s+=`<polygon points="${sx},${sy-2} ${sx+headW/2+1},${sy+headL+1} ${sx-headW/2-1},${sy+headL+1}" fill="${sf}" opacity="0.18" filter="url(#gf)" style="animation:soulPulse 1.6s infinite"/>`;
    s+=`<circle cx="${sx}" cy="${sy}" r="${2+level*0.2}" fill="${sf}" filter="url(#gf)" opacity="0.5" style="animation:soulPulse 1.2s infinite"/>`;
    s+=mkParticles(sx, sy+headL*0.4, sf, 3);
  }
  return s;
}

function wepQuarterstaff(level: number, acc: string, sf: string, id: string): string {
  const qx=96, qy=10;
  const staffL=130+level*2;
  const sw=2.5+level*0.2;
  let s='';
  s+=`<line x1="${qx}" y1="${qy}" x2="${qx}" y2="${qy+staffL}" stroke="${acc}" stroke-width="${sw}" stroke-linecap="round"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<line x1="${qx-1}" y1="${qy+10}" x2="${qx-0.5}" y2="${qy+staffL-10}" stroke="${sf}" stroke-width="0.5" opacity="0.2"/>`;
  s+=`<rect x="${qx-sw/2-0.5}" y="${qy+staffL*0.45}" width="${sw+1}" height="12" rx="1.5" fill="${acc}" opacity="0.5"/>`;
  if(level>=4){
    s+=`<rect x="${qx-sw/2-1}" y="${qy-2}" width="${sw+2}" height="5" rx="1" fill="${sf}" opacity="0.6"/>`;
    s+=`<rect x="${qx-sw/2-1}" y="${qy+staffL-3}" width="${sw+2}" height="5" rx="1" fill="${sf}" opacity="0.6"/>`;
    s+=`<rect x="${qx-sw/2-0.5}" y="${qy+staffL*0.45-2}" width="${sw+1}" height="2" rx="0.5" fill="${sf}" opacity="0.4"/>`;
    s+=`<rect x="${qx-sw/2-0.5}" y="${qy+staffL*0.45+12}" width="${sw+1}" height="2" rx="0.5" fill="${sf}" opacity="0.4"/>`;
  }
  if(level>=7){
    s+=`<rect x="${qx-sw/2-2}" y="${qy-3}" width="${sw+4}" height="6" rx="2" fill="${sf}" filter="url(#gf)" opacity="0.3" style="animation:soulPulse 1.5s infinite"/>`;
    s+=`<rect x="${qx-sw/2-2}" y="${qy+staffL-3}" width="${sw+4}" height="6" rx="2" fill="${sf}" filter="url(#gf)" opacity="0.3" style="animation:soulPulse 1.5s infinite"/>`;
    s+=mkParticles(qx, qy+2, sf, 2);
    s+=mkParticles(qx, qy+staffL-2, sf, 2);
  }
  return s;
}

// ============================================================
// WHIP CATEGORY
// ============================================================
function wepWhipSpec(level: number, acc: string, sf: string, id: string): string {
  const wx=92, wy=80;
  const sw=1.2+level*0.12;
  let s='';
  s+=`<rect x="${wx-2}" y="${wy}" width="4" height="${14+level*0.5}" rx="1" fill="${acc}" opacity="0.85"/>`;
  s+=`<circle cx="${wx}" cy="${wy+16+level*0.5}" r="${1.5}" fill="${acc}"/>`;
  s+=`<path d="M${wx},${wy} Q${wx+15},${wy-20} ${wx+25},${wy-35} Q${wx+30},${wy-50} ${wx+20},${wy-60-level*2} Q${wx+10},${wy-70-level*2} ${wx+18},${wy-75-level*3}" stroke="${acc}" stroke-width="${sw}" fill="none" stroke-linecap="round"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  const tx=wx+18, ty=wy-75-level*3;
  s+=`<line x1="${tx}" y1="${ty}" x2="${tx+5}" y2="${ty-4}" stroke="${sf}" stroke-width="${sw*0.7}" opacity="0.7"/>`;
  if(level>=4){
    s+=`<path d="M${wx+2},${wy-5} Q${wx+8},${wy-12} ${wx+14},${wy-22}" stroke="${sf}" stroke-width="0.5" fill="none" opacity="0.3"/>`;
  }
  if(level>=7){
    s+=`<circle cx="${tx+5}" cy="${ty-4}" r="${2+level*0.3}" fill="${sf}" filter="url(#gf)" opacity="0.5" style="animation:soulPulse 1.2s infinite"/>`;
    s+=`<path d="M${wx},${wy} Q${wx+15},${wy-20} ${wx+25},${wy-35} Q${wx+30},${wy-50} ${wx+20},${wy-60-level*2}" stroke="${sf}" stroke-width="1.5" fill="none" opacity="0.2" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`;
    s+=mkParticles(tx, ty, sf, 3);
  }
  return s;
}

function wepSpikedChain(level: number, acc: string, sf: string, id: string): string {
  const cx=92, cy=80;
  const sw=1.3+level*0.12;
  const linkSize=4+level*0.3;
  let s='';
  s+=`<rect x="${cx-2}" y="${cy}" width="4" height="${10}" rx="1" fill="${acc}" opacity="0.85"/>`;
  const links=8+Math.floor(level/2);
  let px=cx, py=cy;
  for(let i=0;i<links;i++){
    const dx2=(i%2===0?6:-4)+Math.sin(i*0.7)*3;
    const dy2=-8-Math.cos(i*0.5)*2;
    const nx=px+dx2, ny=py+dy2;
    s+=`<ellipse cx="${(px+nx)/2}" cy="${(py+ny)/2}" rx="${linkSize*0.6}" ry="${linkSize*0.35}" fill="none" stroke="${acc}" stroke-width="${sw}" transform="rotate(${Math.atan2(dy2,dx2)*180/Math.PI},${(px+nx)/2},${(py+ny)/2})"`;
    if(level>=4 && i===0) s+=` filter="url(#af_${id})"`;
    s+='/>';
    px=nx; py=ny;
  }
  s+=`<circle cx="${px}" cy="${py}" r="${3+level*0.3}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  for(let i=0;i<4;i++){
    const a=(i/4)*Math.PI*2;
    const sr=3+level*0.3;
    s+=`<line x1="${px+Math.cos(a)*sr}" y1="${py+Math.sin(a)*sr}" x2="${px+Math.cos(a)*(sr+3)}" y2="${py+Math.sin(a)*(sr+3)}" stroke="${sf}" stroke-width="1" stroke-linecap="round"/>`;
  }
  if(level>=7){
    s+=`<circle cx="${px}" cy="${py}" r="${5+level*0.4}" fill="${sf}" opacity="0.15" filter="url(#gf)" style="animation:soulPulse 1.4s infinite"/>`;
    s+=mkParticles(px, py, sf, 3);
  }
  return s;
}

function wepFlail(level: number, acc: string, sf: string, id: string): string {
  const fx=95, fy=70;
  const shaftL=22+level;
  const chainL=12+level;
  const ballR=5+level*0.6;
  const spikeL=3+level*0.4;
  const numSpikes=5+Math.floor(level/3);
  let s='';
  s+=`<rect x="${fx-2}" y="${fy}" width="4" height="${shaftL}" rx="1" fill="${acc}" opacity="0.85"/>`;
  s+=`<circle cx="${fx}" cy="${fy+shaftL+1}" r="${1.8}" fill="${acc}"/>`;
  const bx=fx+8+level*0.5, by=fy-chainL-ballR;
  s+=`<path d="M${fx},${fy} Q${fx+5},${fy-chainL*0.5} ${bx},${by+ballR}" stroke="${acc}" stroke-width="${1+level*0.1}" fill="none" stroke-dasharray="${2+level*0.2} ${1.5}"/>`;
  s+=`<circle cx="${bx}" cy="${by}" r="${ballR}" fill="${sf}" opacity="${0.75+level*0.025}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  for(let i=0;i<numSpikes;i++){
    const a=(i/numSpikes)*Math.PI*2;
    s+=`<line x1="${bx+Math.cos(a)*ballR}" y1="${by+Math.sin(a)*ballR}" x2="${bx+Math.cos(a)*(ballR+spikeL)}" y2="${by+Math.sin(a)*(ballR+spikeL)}" stroke="${sf}" stroke-width="${1+level*0.08}" stroke-linecap="round"/>`;
  }
  s+=`<rect x="${fx-2.5}" y="${fy+shaftL*0.4}" width="5" height="5" rx="1" fill="${acc}" opacity="0.4"/>`;
  if(level>=7){
    s+=`<circle cx="${bx}" cy="${by}" r="${ballR+3}" fill="${sf}" opacity="0.15" filter="url(#gf)" style="animation:soulPulse 1.3s infinite"/>`;
    s+=`<path d="M${bx-ballR-4},${by} Q${bx},${by-ballR-6} ${bx+ballR+4},${by}" stroke="${sf}" stroke-width="0.8" fill="none" opacity="0.25" filter="url(#gf)" style="animation:soulPulse 1s infinite"/>`;
    s+=mkParticles(bx, by, sf, 3);
  }
  return s;
}

// ============================================================
// ENSNARING CATEGORY
// ============================================================
function wepBolas(level: number, acc: string, sf: string, id: string): string {
  const bx=95, by=65;
  const cordL=20+level*2;
  const ballR=3+level*0.4;
  let s='';
  s+=`<circle cx="${bx}" cy="${by}" r="${2+level*0.15}" fill="${acc}"/>`;
  const angles=[-Math.PI*0.7, -Math.PI*0.1, Math.PI*0.4];
  for(let i=0;i<3;i++){
    const ex=bx+Math.cos(angles[i])*cordL;
    const ey=by+Math.sin(angles[i])*cordL;
    const cpx=bx+Math.cos(angles[i])*cordL*0.5+Math.sin(angles[i])*5;
    const cpy=by+Math.sin(angles[i])*cordL*0.5-Math.cos(angles[i])*5;
    s+=`<path d="M${bx},${by} Q${cpx},${cpy} ${ex},${ey}" stroke="${acc}" stroke-width="${1+level*0.1}" fill="none"/>`;
    s+=`<circle cx="${ex}" cy="${ey}" r="${ballR}" fill="${sf}" opacity="${0.75+level*0.025}"`;
    if(level>=4) s+=` filter="url(#af_${id})"`;
    s+='/>';
    if(level>=4){
      s+=`<circle cx="${ex}" cy="${ey}" r="${ballR*0.6}" fill="none" stroke="${acc}" stroke-width="0.6" opacity="0.4"/>`;
    }
    if(level>=7){
      s+=`<circle cx="${ex}" cy="${ey}" r="${ballR+2}" fill="${sf}" opacity="0.2" filter="url(#gf)" style="animation:soulPulse ${1.3+i*0.2}s infinite"/>`;
    }
  }
  if(level>=7){
    s+=`<circle cx="${bx}" cy="${by}" r="${cordL*0.7}" fill="none" stroke="${sf}" stroke-width="0.6" opacity="0.15" filter="url(#gf)" stroke-dasharray="4 6" style="animation:soulPulse 2s infinite"/>`;
    s+=mkParticles(bx, by, sf, 2);
  }
  return s;
}

function wepNetSpec(level: number, acc: string, sf: string, id: string): string {
  const nx=88, ny=40;
  const netW=24+level*2;
  const netH=35+level*2;
  const meshSize=6+level*0.3;
  let s='';
  s+=`<path d="M${nx},${ny} Q${nx+netW*0.5},${ny-5} ${nx+netW},${ny} Q${nx+netW+3},${ny+netH*0.5} ${nx+netW*0.5},${ny+netH} Q${nx-3},${ny+netH*0.5} ${nx},${ny}" stroke="${acc}" stroke-width="${1+level*0.1}" fill="none"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  for(let row=0;row<Math.floor(netH/meshSize);row++){
    for(let col=0;col<Math.floor(netW/meshSize);col++){
      const mx2=nx+3+col*meshSize+(row%2?meshSize/2:0);
      const my2=ny+3+row*meshSize;
      if(mx2>nx && mx2<nx+netW && my2>ny && my2<ny+netH){
        s+=`<path d="M${mx2},${my2-meshSize/2} L${mx2+meshSize/2},${my2} L${mx2},${my2+meshSize/2} L${mx2-meshSize/2},${my2}Z" stroke="${acc}" stroke-width="0.5" fill="none" opacity="${0.3+level*0.03}"/>`;
      }
    }
  }
  const numWeights=4+Math.floor(level/2);
  for(let i=0;i<numWeights;i++){
    const t=i/(numWeights-1);
    const wx2=nx+t*netW;
    const wy2=ny+netH-2+Math.sin(t*Math.PI)*3;
    s+=`<circle cx="${wx2}" cy="${wy2}" r="${1.5+level*0.1}" fill="${sf}" opacity="0.6"/>`;
  }
  s+=`<line x1="${nx}" y1="${ny}" x2="${nx-5}" y2="${ny+10}" stroke="${acc}" stroke-width="${1.2+level*0.1}" stroke-linecap="round"/>`;
  if(level>=7){
    s+=`<path d="M${nx},${ny} Q${nx+netW*0.5},${ny-5} ${nx+netW},${ny} Q${nx+netW+3},${ny+netH*0.5} ${nx+netW*0.5},${ny+netH} Q${nx-3},${ny+netH*0.5} ${nx},${ny}" stroke="${sf}" stroke-width="1.5" fill="none" opacity="0.2" filter="url(#gf)" style="animation:soulPulse 2s infinite"/>`;
    s+=mkParticles(nx+netW*0.5, ny+netH*0.5, sf, 3);
  }
  return s;
}

// ============================================================
// UNARMED
// ============================================================
function wepUnarmedSpec(level: number, acc: string, sf: string, id: string): string {
  const ux=95, uy=72;
  let s='';
  for(let i=0;i<3;i++){
    const wy=uy-5+i*4;
    s+=`<rect x="${ux-4}" y="${wy}" width="8" height="2.5" rx="0.8" fill="${acc}" opacity="${0.5+level*0.04}"`;
    if(level>=4) s+=` filter="url(#af_${id})"`;
    s+='/>';
  }
  s+=`<path d="M${ux-5},${uy-7} Q${ux-6},${uy-10} ${ux-4},${uy-12} Q${ux},${uy-14} ${ux+4},${uy-12} Q${ux+6},${uy-10} ${ux+5},${uy-7}" stroke="${acc}" stroke-width="${1.2+level*0.1}" fill="none"/>`;
  if(level>=4){
    s+=`<circle cx="${ux-3}" cy="${uy-10}" r="1" fill="${sf}" opacity="0.6"/>`;
    s+=`<circle cx="${ux}" cy="${uy-12}" r="1" fill="${sf}" opacity="0.6"/>`;
    s+=`<circle cx="${ux+3}" cy="${uy-10}" r="1" fill="${sf}" opacity="0.6"/>`;
    s+=`<ellipse cx="${ux}" cy="${uy-8}" rx="${8+level}" ry="${6+level*0.5}" fill="none" stroke="${sf}" stroke-width="0.8" opacity="0.3"/>`;
  }
  if(level>=7){
    s+=`<ellipse cx="${ux}" cy="${uy-8}" rx="${12+level}" ry="${8+level}" fill="${sf}" filter="url(#gf)" opacity="0.12" style="animation:soulPulse 1.4s infinite"/>`;
    for(let i=0;i<4;i++){
      const a=(i/4)*Math.PI*2-Math.PI/4;
      const r1=8+level*0.5, r2=14+level;
      s+=`<line x1="${ux+Math.cos(a)*r1}" y1="${uy-8+Math.sin(a)*r1}" x2="${ux+Math.cos(a)*r2}" y2="${uy-8+Math.sin(a)*r2}" stroke="${sf}" stroke-width="1" opacity="0.4" filter="url(#gf)" style="animation:soulPulse ${1.2+i*0.2}s infinite"/>`;
    }
    s+=mkParticles(ux, uy-10, sf, 4);
  }
  return s;
}

function wepUnarmedWildSpec(level: number, acc: string, sf: string, id: string): string {
  const ux=95, uy=68;
  let s='';
  for(let i=0;i<3;i++){
    const cx2=ux-6+i*6;
    const clawL=18+level*2;
    s+=`<path d="M${cx2},${uy} Q${cx2+2},${uy-clawL*0.5} ${cx2+1},${uy-clawL}" stroke="${sf}" stroke-width="${1.5+level*0.15}" fill="none" stroke-linecap="round" opacity="${0.6+level*0.04}"`;
    if(level>=4) s+=` filter="url(#af_${id})"`;
    s+='/>';
    s+=`<circle cx="${cx2+1}" cy="${uy-clawL}" r="${1+level*0.15}" fill="${sf}" opacity="0.7"/>`;
  }
  if(level>=4){
    s+=`<ellipse cx="${ux}" cy="${uy-12}" rx="${10+level}" ry="${14+level}" fill="none" stroke="${sf}" stroke-width="0.8" opacity="0.25" stroke-dasharray="3 4"/>`;
    s+=`<path d="M${ux-8},${uy-5} Q${ux-12},${uy-15} ${ux-8},${uy-22}" stroke="${sf}" stroke-width="0.8" fill="none" opacity="0.3"/>`;
    s+=`<path d="M${ux+8},${uy-5} Q${ux+12},${uy-15} ${ux+8},${uy-22}" stroke="${sf}" stroke-width="0.8" fill="none" opacity="0.3"/>`;
  }
  if(level>=7){
    s+=`<ellipse cx="${ux}" cy="${uy-14}" rx="${14+level*1.5}" ry="${18+level*1.5}" fill="${sf}" filter="url(#gf)" opacity="0.1" style="animation:soulPulse 1.2s infinite"/>`;
    for(let i=0;i<3;i++){
      const cx2=ux-6+i*6;
      const clawL=18+level*2;
      s+=`<path d="M${cx2},${uy} Q${cx2+2},${uy-clawL*0.5} ${cx2+1},${uy-clawL}" stroke="${sf}" stroke-width="3" fill="none" opacity="0.15" filter="url(#gf)" style="animation:soulPulse ${1+i*0.3}s infinite"/>`;
    }
    s+=mkParticles(ux, uy-18, sf, 5);
  }
  return s;
}

// ============================================================
// STORMWIGHT SPIRIT WEAPONS
// ============================================================
function wepBorenSpirit(level: number, acc: string, sf: string, id: string): string {
  const bx=92, by=60;
  const clawL=16+level*3;
  const clawW=3+level*0.4;
  const iceBlue='#a8d8ff', iceWhite='#e8f4ff';
  let s='';
  for(let i=0;i<4;i++){
    const cx2=bx-8+i*6;
    const spread=(i-1.5)*2;
    s+=`<path d="M${cx2},${by} Q${cx2+spread},${by-clawL*0.6} ${cx2+spread*1.2},${by-clawL}" stroke="${iceBlue}" stroke-width="${clawW}" fill="none" stroke-linecap="round" opacity="${0.5+level*0.05}"`;
    if(level>=4) s+=` filter="url(#af_${id})"`;
    s+='/>';
    if(level>=3){
      s+=`<polygon points="${cx2+spread*1.2},${by-clawL} ${cx2+spread*1.2-1.5},${by-clawL+3} ${cx2+spread*1.2+1.5},${by-clawL+3}" fill="${iceWhite}" opacity="0.7"/>`;
    }
  }
  if(level>=3){
    const crystals=2+Math.floor(level/2);
    for(let i=0;i<crystals;i++){
      const angle=-Math.PI*0.8+i*(Math.PI*0.6/(crystals-1));
      const dist=clawL*0.5+i*3;
      const icx=bx+Math.cos(angle)*dist;
      const icy=by+Math.sin(angle)*dist;
      const csize=2+level*0.4;
      s+=`<polygon points="${icx},${icy-csize} ${icx+csize*0.86},${icy-csize*0.5} ${icx+csize*0.86},${icy+csize*0.5} ${icx},${icy+csize} ${icx-csize*0.86},${icy+csize*0.5} ${icx-csize*0.86},${icy-csize*0.5}" fill="${iceWhite}" opacity="${0.3+level*0.03}" stroke="${iceBlue}" stroke-width="0.5"`;
      if(level>=4) s+=` filter="url(#af_${id})"`;
      s+='/>';
    }
  }
  if(level>=5){
    s+=`<path d="M${bx-20},${by-10} Q${bx},${by-clawL-10} ${bx+20},${by-10}" stroke="${iceBlue}" stroke-width="1" fill="none" opacity="0.25" stroke-dasharray="3 5"/>`;
    s+=`<path d="M${bx-15},${by-5} Q${bx},${by-clawL-5} ${bx+15},${by-5}" stroke="${iceWhite}" stroke-width="0.8" fill="none" opacity="0.2" stroke-dasharray="2 4"/>`;
  }
  if(level>=7){
    s+=`<ellipse cx="${bx}" cy="${by-clawL*0.5}" rx="${20+level*2}" ry="${clawL*0.6+level}" fill="${iceBlue}" filter="url(#gf)" opacity="0.08" style="animation:soulPulse 2s infinite"/>`;
    for(let i=0;i<4;i++){
      const wy=by-clawL*0.2-i*8;
      s+=`<line x1="${bx-18-i*2}" y1="${wy}" x2="${bx+18+i*2}" y2="${wy-3}" stroke="${iceWhite}" stroke-width="0.6" opacity="${0.2+i*0.05}" filter="url(#gf)" style="animation:soulPulse ${1.5+i*0.3}s infinite"/>`;
    }
    for(let i=0;i<4;i++){
      const cx2=bx-8+i*6;
      const spread=(i-1.5)*2;
      s+=`<path d="M${cx2},${by} Q${cx2+spread},${by-clawL*0.6} ${cx2+spread*1.2},${by-clawL}" stroke="${iceWhite}" stroke-width="${clawW+2}" fill="none" opacity="0.12" filter="url(#gf)" style="animation:soulPulse 1.5s infinite"/>`;
    }
    s+=mkParticles(bx, by-clawL*0.5, iceBlue, 6);
    s+=mkParticles(bx-10, by-clawL*0.3, iceWhite, 3);
  }
  return s;
}

function wepCorvenSpirit(level: number, acc: string, sf: string, id: string): string {
  const cx=92, cy=60;
  const fireOrange='#ff6a00', fireRed='#ff2200', fireYellow='#ffaa00';
  let s='';
  const numFeathers=3+Math.floor(level/2);
  for(let i=0;i<numFeathers;i++){
    const angle=-Math.PI*0.5-Math.PI*0.3+i*(Math.PI*0.6/(numFeathers-1));
    const fLen=12+level*2+i*2;
    const fx=cx+Math.cos(angle)*5;
    const fy=cy+Math.sin(angle)*5;
    const ftx=fx+Math.cos(angle)*fLen;
    const fty=fy+Math.sin(angle)*fLen;
    s+=`<path d="M${fx},${fy} Q${(fx+ftx)/2+3},${(fy+fty)/2} ${ftx},${fty}" stroke="${fireOrange}" stroke-width="${1.5+level*0.15}" fill="none" opacity="${0.4+level*0.05}"`;
    if(level>=4) s+=` filter="url(#af_${id})"`;
    s+='/>';
    if(level>=3){
      const mx=(fx+ftx)/2, my=(fy+fty)/2;
      s+=`<line x1="${mx}" y1="${my}" x2="${mx+3}" y2="${my-2}" stroke="${fireRed}" stroke-width="0.6" opacity="0.4"/>`;
      s+=`<line x1="${mx}" y1="${my}" x2="${mx-2}" y2="${my+3}" stroke="${fireRed}" stroke-width="0.6" opacity="0.4"/>`;
    }
  }
  const beakL=15+level*2.5;
  s+=`<path d="M${cx},${cy-5} L${cx+beakL*0.3},${cy-beakL} L${cx-beakL*0.15},${cy-beakL*0.8} Z" fill="${fireOrange}" opacity="${0.5+level*0.04}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<path d="M${cx},${cy-5} L${cx-beakL*0.2},${cy-beakL*0.9} L${cx+beakL*0.15},${cy-beakL*0.85} Z" fill="${fireYellow}" opacity="${0.3+level*0.03}"/>`;
  if(level>=4){
    s+=`<path d="M${cx-12},${cy} Q${cx-8},${cy-20} ${cx},${cy-25} Q${cx+8},${cy-30} ${cx+12},${cy-22}" stroke="${fireRed}" stroke-width="1" fill="none" opacity="0.3" stroke-dasharray="3 3"/>`;
    s+=`<path d="M${cx+10},${cy+5} Q${cx+15},${cy-10} ${cx+10},${cy-20}" stroke="${fireOrange}" stroke-width="0.8" fill="none" opacity="0.25"/>`;
  }
  if(level>=7){
    s+=`<path d="M${cx-5},${cy} Q${cx-25},${cy-15} ${cx-30-level},${cy-25} Q${cx-20},${cy-10} ${cx-5},${cy}" fill="${fireOrange}" filter="url(#gf)" opacity="0.08" style="animation:soulPulse 2s infinite"/>`;
    s+=`<path d="M${cx+5},${cy} Q${cx+25},${cy-15} ${cx+30+level},${cy-25} Q${cx+20},${cy-10} ${cx+5},${cy}" fill="${fireOrange}" filter="url(#gf)" opacity="0.08" style="animation:soulPulse 2s infinite"/>`;
    s+=`<ellipse cx="${cx}" cy="${cy-beakL*0.4}" rx="${16+level*2}" ry="${beakL*0.5+level}" fill="${fireRed}" filter="url(#gf)" opacity="0.06" style="animation:soulPulse 1.5s infinite"/>`;
    for(let i=0;i<5;i++){
      const flx=cx-10+i*5;
      const flH=8+level+Math.random()*5;
      s+=`<path d="M${flx},${cy} Q${flx+2},${cy-flH*0.5} ${flx-1},${cy-flH}" stroke="${fireYellow}" stroke-width="1" fill="none" opacity="0.3" filter="url(#gf)" style="animation:soulPulse ${1.2+i*0.2}s infinite"/>`;
    }
    s+=mkParticles(cx, cy-beakL*0.5, fireOrange, 5);
    s+=mkParticles(cx+10, cy-10, fireRed, 3);
  }
  return s;
}

function wepRadenSpirit(level: number, acc: string, sf: string, id: string): string {
  const rx=92, ry=60;
  const corruptGreen='#4aff4a', corruptPurple='#9932cc', sicklyGreen='#88dd44';
  let s='';
  const numTendrils=3+Math.floor(level/2);
  for(let i=0;i<numTendrils;i++){
    const angle=-Math.PI*0.7+i*(Math.PI*0.5/(numTendrils-1));
    const tLen=15+level*2.5;
    const tx2=rx+Math.cos(angle)*tLen;
    const ty2=ry+Math.sin(angle)*tLen;
    const cp1x=rx+Math.cos(angle)*tLen*0.3+Math.sin(i)*6;
    const cp1y=ry+Math.sin(angle)*tLen*0.3-Math.cos(i)*4;
    const cp2x=rx+Math.cos(angle)*tLen*0.7-Math.sin(i)*5;
    const cp2y=ry+Math.sin(angle)*tLen*0.7+Math.cos(i)*3;
    s+=`<path d="M${rx},${ry} C${cp1x},${cp1y} ${cp2x},${cp2y} ${tx2},${ty2}" stroke="${corruptGreen}" stroke-width="${1.5+level*0.2}" fill="none" opacity="${0.4+level*0.04}" stroke-linecap="round"`;
    if(level>=4) s+=` filter="url(#af_${id})"`;
    s+='/>';
    if(level>=3){
      s+=`<circle cx="${tx2}" cy="${ty2}" r="${1.5+level*0.2}" fill="${sicklyGreen}" opacity="${0.4+level*0.04}"/>`;
    }
  }
  if(level>=3){
    const swarmCount=4+level;
    for(let i=0;i<swarmCount;i++){
      const sa=Math.PI*2*(i/swarmCount);
      const sd=8+level+(i%3)*4;
      const sx2=rx+Math.cos(sa)*sd;
      const sy2=ry-10+Math.sin(sa)*sd*0.6;
      const psize=0.8+level*0.1;
      s+=`<ellipse cx="${sx2}" cy="${sy2}" rx="${psize*1.3}" ry="${psize}" fill="${corruptPurple}" opacity="${0.3+level*0.02}"/>`;
      s+=`<path d="M${sx2+psize},${sy2} Q${sx2+psize+2},${sy2+1} ${sx2+psize+3},${sy2-0.5}" stroke="${corruptPurple}" stroke-width="0.4" fill="none" opacity="0.3"/>`;
    }
  }
  if(level>=4){
    s+=`<ellipse cx="${rx}" cy="${ry-8}" rx="${12+level}" ry="${10+level}" fill="none" stroke="${corruptPurple}" stroke-width="1" opacity="0.2" stroke-dasharray="4 5"/>`;
    for(let i=0;i<3;i++){
      const dx2=rx-6+i*6;
      s+=`<path d="M${dx2},${ry+5} Q${dx2+1},${ry+12} ${dx2-1},${ry+18+level}" stroke="${sicklyGreen}" stroke-width="1" fill="none" opacity="0.25"/>`;
      s+=`<circle cx="${dx2-1}" cy="${ry+18+level}" r="1" fill="${sicklyGreen}" opacity="0.4"/>`;
    }
  }
  if(level>=7){
    s+=`<ellipse cx="${rx}" cy="${ry-10}" rx="${20+level*2}" ry="${16+level*2}" fill="${corruptPurple}" filter="url(#gf)" opacity="0.07" style="animation:soulPulse 2.2s infinite"/>`;
    s+=`<ellipse cx="${rx}" cy="${ry-5}" rx="${15+level}" ry="${12+level}" fill="${corruptGreen}" filter="url(#gf)" opacity="0.05" style="animation:soulPulse 1.8s infinite"/>`;
    for(let i=0;i<numTendrils;i++){
      const angle=-Math.PI*0.7+i*(Math.PI*0.5/(numTendrils-1));
      const tLen=15+level*2.5;
      const tx2=rx+Math.cos(angle)*tLen;
      const ty2=ry+Math.sin(angle)*tLen;
      s+=`<circle cx="${tx2}" cy="${ty2}" r="${3+level*0.3}" fill="${sicklyGreen}" filter="url(#gf)" opacity="0.2" style="animation:soulPulse ${1.3+i*0.2}s infinite"/>`;
    }
    s+=mkParticles(rx, ry-12, corruptGreen, 5);
    s+=mkParticles(rx-8, ry, corruptPurple, 3);
  }
  return s;
}

function wepVukenSpirit(level: number, acc: string, sf: string, id: string): string {
  const vx=92, vy=60;
  const elecBlue='#00aaff', elecWhite='#ccffff', elecBright='#44ddff';
  let s='';
  const numArcs=2+Math.floor(level/2);
  for(let i=0;i<numArcs;i++){
    const angle=-Math.PI*0.6+i*(Math.PI*0.4/(numArcs-1||1));
    const arcL=18+level*3;
    let path=`M${vx},${vy}`;
    const segments=3+Math.floor(level/3);
    for(let j=1;j<=segments;j++){
      const t=j/segments;
      const px2=vx+Math.cos(angle)*arcL*t;
      const py2=vy+Math.sin(angle)*arcL*t;
      const jitter=(j%2===0?1:-1)*(3+level*0.5);
      path+=` L${px2+Math.sin(angle)*jitter},${py2-Math.cos(angle)*jitter}`;
    }
    s+=`<path d="${path}" stroke="${elecBlue}" stroke-width="${1.2+level*0.15}" fill="none" opacity="${0.5+level*0.05}" stroke-linecap="round"`;
    if(level>=4) s+=` filter="url(#af_${id})"`;
    s+='/>';
    if(level>=3){
      let path2=`M${vx},${vy}`;
      for(let j=1;j<=segments;j++){
        const t=j/segments;
        const px2=vx+Math.cos(angle)*arcL*t*0.9;
        const py2=vy+Math.sin(angle)*arcL*t*0.9;
        const jitter=(j%2===0?-1:1)*(2+level*0.3);
        path2+=` L${px2+Math.sin(angle)*jitter},${py2-Math.cos(angle)*jitter}`;
      }
      s+=`<path d="${path2}" stroke="${elecWhite}" stroke-width="0.6" fill="none" opacity="0.3"/>`;
    }
  }
  const fangL=10+level*1.5;
  s+=`<path d="M${vx-4},${vy-3} L${vx-5},${vy-3-fangL} L${vx-2},${vy-3-fangL*0.4} Z" fill="${elecBlue}" opacity="${0.4+level*0.05}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  s+=`<path d="M${vx+4},${vy-3} L${vx+5},${vy-3-fangL} L${vx+2},${vy-3-fangL*0.4} Z" fill="${elecBlue}" opacity="${0.4+level*0.05}"`;
  if(level>=4) s+=` filter="url(#af_${id})"`;
  s+='/>';
  if(level>=4){
    s+=`<path d="M${vx-7},${vy-1} L${vx-8},${vy-1-fangL*0.6} L${vx-5},${vy-1-fangL*0.25} Z" fill="${elecBright}" opacity="0.3"/>`;
    s+=`<path d="M${vx+7},${vy-1} L${vx+8},${vy-1-fangL*0.6} L${vx+5},${vy-1-fangL*0.25} Z" fill="${elecBright}" opacity="0.3"/>`;
  }
  if(level>=4){
    s+=`<ellipse cx="${vx}" cy="${vy-8}" rx="${10+level}" ry="${8+level}" fill="none" stroke="${elecBlue}" stroke-width="0.8" opacity="0.25" stroke-dasharray="2 3"/>`;
    for(let i=0;i<4;i++){
      const sa=Math.PI*2*(i/4)+0.3;
      const sd=8+level;
      s+=`<circle cx="${vx+Math.cos(sa)*sd}" cy="${vy-8+Math.sin(sa)*sd*0.7}" r="1" fill="${elecWhite}" opacity="0.5"/>`;
    }
  }
  if(level>=7){
    s+=`<ellipse cx="${vx}" cy="${vy-10}" rx="${18+level*2}" ry="${14+level*2}" fill="${elecBlue}" filter="url(#gf)" opacity="0.07" style="animation:soulPulse 1.6s infinite"/>`;
    for(let i=0;i<3;i++){
      const bAngle=-Math.PI*0.3+i*Math.PI*0.3;
      const bLen=25+level*2;
      let bp=`M${vx},${vy}`;
      for(let j=1;j<=4;j++){
        const t=j/4;
        const jx=(j%2===0?4:-4)*(1+level*0.2);
        bp+=` L${vx+Math.cos(bAngle)*bLen*t+Math.sin(bAngle)*jx},${vy+Math.sin(bAngle)*bLen*t-Math.cos(bAngle)*jx}`;
      }
      s+=`<path d="${bp}" stroke="${elecBright}" stroke-width="1.5" fill="none" opacity="0.25" filter="url(#gf)" style="animation:soulPulse ${1+i*0.3}s infinite"/>`;
    }
    s+=`<path d="M${vx-6},${vy-3} L${vx-5},${vy-3-fangL} L${vx+5},${vy-3-fangL} L${vx+6},${vy-3}" fill="${elecWhite}" filter="url(#gf)" opacity="0.1" style="animation:soulPulse 1.8s infinite"/>`;
    s+=mkParticles(vx, vy-fangL*0.5, elecBlue, 5);
    s+=mkParticles(vx+8, vy-5, elecBright, 3);
  }
  return s;
}

// ============================================================
// WEAPON_BUILDERS lookup
// ============================================================
export const WEAPON_BUILDERS: Record<string, WeaponBuilderFn> = {
  longbow: wepLongbow, shortbow: wepShortbow, crossbow: wepCrossbow, sling: wepSling, atlatl: wepAtlatl,
  dagger: wepDaggerSpec, shortsword: wepShortsword, rapier: wepRapier, handaxe: wepHandaxe, throwing_hammer: wepThrowingHammer,
  longsword: wepLongsword, battleaxe: wepBattleaxe, warhammer: wepWarhammer, club: wepClub,
  greatsword: wepGreatsword, greataxe: wepGreataxe, maul: wepMaul, morningstar: wepMorningstar,
  glaive: wepGlaive, halberd: wepHalberd, longspear: wepLongspear, quarterstaff: wepQuarterstaff,
  whip: wepWhipSpec, spiked_chain: wepSpikedChain, flail: wepFlail,
  bolas: wepBolas, net: wepNetSpec,
  unarmed: wepUnarmedSpec, unarmed_wild: wepUnarmedWildSpec,
  boren_spirit: wepBorenSpirit, corven_spirit: wepCorvenSpirit, raden_spirit: wepRadenSpirit, vuken_spirit: wepVukenSpirit,
};

// Weapon builders use base x=96 as reference point
export const WEP_BASE_X = 96;

// ============================================================
// getSelectedWeaponSvg -- resolve kit + weapon selection to SVG
// ============================================================
export function getSelectedWeaponSvg(
  kit: { id: string; weaponClass: string },
  selectedWeaponId: string,
  level: number,
  acc: string,
  sf: string,
  id: string,
  ancestryId: string
): string {
  // If stormwight kit, use spirit weapon
  if(kit.id === 'boren') return wepBorenSpirit(level, acc, sf, id);
  if(kit.id === 'corven') return wepCorvenSpirit(level, acc, sf, id);
  if(kit.id === 'raden') return wepRadenSpirit(level, acc, sf, id);
  if(kit.id === 'vuken') return wepVukenSpirit(level, acc, sf, id);

  // Hand position for current ancestry
  const hp = HAND_POS[ancestryId] || HAND_POS.human;
  const dx = hp.rx - WEP_BASE_X; // offset to align weapon to right hand

  let svg = '';

  // For kits with shield, add shield on LEFT hand
  if(kit.weaponClass === 'medium_shield' || kit.weaponClass === 'light_divine') {
    const shW = 16, shH = 22;
    const shx = hp.lx - shW/2, shy = hp.ly - shH * 0.6;
    svg += `<path d="M${shx},${shy} L${shx+shW},${shy} L${shx+shW},${shy+shH*0.7} Q${shx+shW},${shy+shH} ${shx+shW/2},${shy+shH} Q${shx},${shy+shH} ${shx},${shy+shH*0.7}Z" fill="${acc}" filter="url(#af_${id})" opacity="0.85"/>
    <path d="M${shx+2},${shy+2} L${shx+shW-2},${shy+2} L${shx+shW-2},${shy+shH*0.65} Q${shx+shW-2},${shy+shH-3} ${shx+shW/2},${shy+shH-3} Q${shx+2},${shy+shH-3} ${shx+2},${shy+shH*0.65}Z" fill="none" stroke="${sf}" stroke-width="${0.8+level*0.1}" opacity="0.7"/>
    ${level>=5?`<circle cx="${shx+shW/2}" cy="${shy+shH*0.4}" r="${2+level*0.2}" fill="${sf}" filter="url(#gf)" style="animation:soulPulse 1.8s infinite"/>`:'' }`;
  }

  // For dual wield, show offhand weapon on LEFT hand (mirrored)
  if(kit.weaponClass === 'dual') {
    svg += `<g opacity="0.8" transform="translate(${hp.lx},${hp.ry}) scale(-1,1) translate(${-WEP_BASE_X},${-hp.ry})">` + (WEAPON_BUILDERS['dagger'] || wepDaggerSpec)(level, acc, sf, id+'_oh') + `</g>`;
  }

  // For bow_melee (ranger), show small bow hint when melee selected
  if(kit.weaponClass === 'bow_melee' && !['longbow','shortbow','crossbow','sling','atlatl'].includes(selectedWeaponId)) {
    svg += `<path d="M${hp.rx+6},${hp.ry-60} Q${hp.rx+16},${hp.ry-10} ${hp.rx+6},${hp.ry+40}" stroke="${acc}" stroke-width="1.5" fill="none" opacity="0.25"/>`;
  }

  // For polearm_net, show net hint on left hand
  if(kit.weaponClass === 'polearm_net') {
    svg += `<path d="M${hp.lx},${hp.ly-4} Q${hp.lx+8},${hp.ly-16} ${hp.lx+4},${hp.ly-28} Q${hp.lx},${hp.ly-16} ${hp.lx-4},${hp.ly-4}Z" stroke="${acc}" stroke-width="1.2" fill="none" opacity="0.4"/>
    <line x1="${hp.lx}" y1="${hp.ly-14}" x2="${hp.lx+8}" y2="${hp.ly-14}" stroke="${acc}" stroke-width="1" opacity="0.3"/>
    <line x1="${hp.lx-2}" y1="${hp.ly-8}" x2="${hp.lx+6}" y2="${hp.ly-8}" stroke="${acc}" stroke-width="1" opacity="0.3"/>`;
  }

  // For medium_magic, add magic orb floating near off-hand
  if(kit.weaponClass === 'medium_magic') {
    svg += `<ellipse cx="${hp.lx}" cy="${hp.ly - 16}" rx="${3+level*0.3}" ry="${3+level*0.3}" fill="${sf}" filter="url(#gf)" opacity="0.6" style="animation:soulPulse 1.8s infinite"/>`;
  }

  // Main weapon -- wrap in translate group to align to ancestry hand
  const builder = WEAPON_BUILDERS[selectedWeaponId];
  if(dx !== 0) svg += `<g transform="translate(${dx},0)">`;
  if(builder) svg += builder(level, acc, sf, id);
  else svg += wepLongsword(level, acc, sf, id); // fallback
  if(dx !== 0) svg += `</g>`;

  return svg;
}
