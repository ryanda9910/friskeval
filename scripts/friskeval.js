#!/usr/bin/env node
/**
 * friskeval.js — deterministic, zero-dependency trigger/routing eval for a
 * collection of security "frisk" skills. Ported from the Tier-2 idea in
 * addyosmani/agent-skills (run-evals.js): TF-IDF over skill descriptions,
 * cosine-similarity collision detection, and top-k trigger ranking — adapted
 * for a security-skill catalog whose descriptions are structurally similar
 * ("Frisk your X for Y before you ship") and therefore MORE collision-prone.
 *
 * Checks:
 *   1. Collision — no two descriptions may be near-duplicates (cosine > ERROR).
 *      WARN band flags catalogs drifting toward overlap.
 *   2. Trigger  — each positive prompt must rank its skill in the top-k; each
 *      negative prompt must NOT rank it #1 (over-broad description).
 *
 * Usage: node friskeval.js [skills.json] [cases.json]
 * Exit 1 on any error-level failure.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const COLLISION_WARN = 0.5;
const COLLISION_ERROR = 0.75;

const STOP = new Set([
  'a','an','and','any','are','as','at','be','before','by','for','from','in',
  'into','is','it','its','my','need','needs','of','on','or','our','so','that',
  'the','them','this','to','use','want','we','when','with','you','your','help',
  'me','i','while','say','done','ship','shipped','shipping','triggers','trigger',
  'automatically','about','report','task','coding','changed','added','diff',
]);

function stem(t) {
  for (const suf of ['ally','ing','ed','es','al']) {
    if (t.length > suf.length + 3 && t.endsWith(suf)) { t = t.slice(0, -suf.length); break; }
  }
  if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) t = t.slice(0, -1);
  if (t.length > 4 && t.endsWith('e')) t = t.slice(0, -1);
  if (t.length > 4 && t[t.length-1] === t[t.length-2] && !'aeiou'.includes(t[t.length-1])) t = t.slice(0, -1);
  if (t.length > 3 && t.endsWith('y')) t = t.slice(0, -1) + 'i';
  return t;
}
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/[\s-]+/)
    .filter((t) => t.length > 2 && !STOP.has(t)).map(stem);
}
function termFreq(tokens){ const m=new Map(); for(const t of tokens) m.set(t,(m.get(t)||0)+1); return m; }
function buildCorpus(skills){
  const docs=new Map();
  for(const s of skills){
    const nt=tokenize(s.name.replace(/-/g,' '));
    docs.set(s.name, termFreq([...nt,...nt,...tokenize(s.description)]));
  }
  const df=new Map();
  for(const tf of docs.values()) for(const t of tf.keys()) df.set(t,(df.get(t)||0)+1);
  const n=docs.size;
  const idf=(t)=>Math.log(1 + n/(1+(df.get(t)||0)));
  return {docs,idf};
}
function vec(tf,idf){ const v=new Map(); for(const [t,f] of tf) v.set(t,f*idf(t)); return v; }
function cosine(a,b){ let dot=0,na=0,nb=0;
  for(const [t,w] of a){ na+=w*w; const bw=b.get(t); if(bw) dot+=w*bw; }
  for(const w of b.values()) nb+=w*w;
  return (!na||!nb)?0:dot/(Math.sqrt(na)*Math.sqrt(nb));
}
function rank(prompt,corpus){
  const pv=vec(termFreq(tokenize(prompt)),corpus.idf);
  const s=[]; for(const [name,tf] of corpus.docs) s.push({name,score:cosine(pv,vec(tf,corpus.idf))});
  s.sort((a,b)=>b.score-a.score); return s;
}

const root = __dirname;
const skills = JSON.parse(fs.readFileSync(process.argv[2]||path.join(root,'skills.json'),'utf8'));
const casesPath = process.argv[3]||path.join(root,'cases.json');
const cases = fs.existsSync(casesPath) ? JSON.parse(fs.readFileSync(casesPath,'utf8')) : [];
const corpus = buildCorpus(skills);
let errors=0, warns=0;

console.log(`friskeval — ${skills.length} skills\n`);

// 1) COLLISION
console.log('== collision (cosine similarity between descriptions) ==');
const vecs = new Map(); for(const [n,tf] of corpus.docs) vecs.set(n,vec(tf,corpus.idf));
const names=[...corpus.docs.keys()]; const pairs=[];
for(let i=0;i<names.length;i++) for(let j=i+1;j<names.length;j++){
  const c=cosine(vecs.get(names[i]),vecs.get(names[j]));
  pairs.push([names[i],names[j],c]);
}
pairs.sort((a,b)=>b[2]-a[2]);
for(const [x,y,c] of pairs.slice(0,6)){
  const flag = c>=COLLISION_ERROR?'✗ ERROR':(c>=COLLISION_WARN?'⚠ WARN':'ok');
  if(c>=COLLISION_ERROR) errors++; else if(c>=COLLISION_WARN) warns++;
  console.log(`  ${flag.padEnd(8)} ${x} ~ ${y}  = ${c.toFixed(2)}`);
}

// 2) SCOPE OVERCLAIM (security-specific; not in Addy's Tier-2)
// A security skill should own ONE domain. Overclaim = skill A's description
// carries the discriminative vocabulary of skill B — so A silently promises to
// cover B's territory, which is how a "check my security" prompt lands on the
// wrong frisk. We compute each skill's discriminative terms (high TF-IDF, rare
// across the catalog) and flag when another skill's description contains too
// many of them.
console.log('\n== scope overclaim (does one security skill claim another\'s domain?) ==');
function discriminative(name){
  // terms that appear in this skill and are rare across the catalog (df<=2)
  const tf=corpus.docs.get(name); const out=[];
  for(const [t,f] of tf){ const w=f*corpus.idf(t); out.push([t,w]); }
  out.sort((a,b)=>b[1]-a[1]);
  return out.slice(0,8).map(x=>x[0]).filter(t=>{
    let df=0; for(const d of corpus.docs.values()) if(d.has(t)) df++; return df<=2;
  });
}
const disc=new Map(); for(const n of names) disc.set(n, new Set(discriminative(n)));
let overclaims=0;
for(const a of names){
  const aTokens=new Set(corpus.docs.get(a).keys());
  for(const b of names){ if(a===b) continue;
    const bDisc=disc.get(b); if(!bDisc.size) continue;
    const shared=[...bDisc].filter(t=>aTokens.has(t));
    const frac=shared.length/bDisc.size;
    if(frac>=0.5){ overclaims++; warns++;
      console.log(`  ⚠ ${a} carries ${Math.round(frac*100)}% of ${b}'s domain terms [${shared.join(', ')}] — may claim ${b}'s scope`);
    }
  }
}
if(!overclaims) console.log('  ok — each skill owns a distinct security domain');

// 3) TRIGGER
if(cases.length){
  console.log('\n== trigger routing ==');
  let rank1=0, pos=0;
  for(const cs of cases){
    for(const p of (cs.positive||[])){
      pos++; const r=rank(p.prompt,corpus); const idx=r.findIndex(x=>x.name===cs.skill);
      const k=p.top_k||3;
      if(idx===0) rank1++;
      if(idx<0||idx>=k){ errors++; console.log(`  ✗ ${cs.skill}: positive ranked #${idx+1} (need top ${k}) — "${p.prompt}"`); }
    }
    for(const p of (cs.negative||[])){
      const r=rank(p.prompt,corpus); const idx=r.findIndex(x=>x.name===cs.skill);
      // A #1 rank only counts as a failure if the match is REAL. A prompt that
      // shares no vocabulary with any skill scores ~0 for all of them and lands
      // on an arbitrary tie-order #1 — that is correct routing (nothing owns an
      // off-topic prompt), not an over-broad description. Require a meaningful
      // score before flagging, matching Addy's owner-must-outrank guard.
      if(idx===0 && r[0].score > 0.01){ errors++; console.log(`  ✗ ${cs.skill}: ranked #1 for NEGATIVE prompt @ ${r[0].score.toFixed(2)} — "${p.prompt}"`); }
    }
  }
  const rate = pos?Math.round(100*rank1/pos):0;
  console.log(`  trigger rank-1 rate: ${rate}% (${rank1}/${pos} positives rank their skill first)`);
}

console.log(`\n${errors?`FAIL — ${errors} error(s)`:'PASS'}${warns?`, ${warns} warning(s)`:''}`);
process.exit(errors?1:0);
