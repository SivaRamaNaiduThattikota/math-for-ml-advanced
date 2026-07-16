/* Session 11 — Metropolis sampling a bimodal target; histogram converges as steps grow. */
(function(){
  const cv = document.getElementById('mcmcplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 44, XLO=-6, XHI=6;
  const $ = id => document.getElementById(id);
  const sProp=$('sProp'), sSteps=$('sSteps');

  // seeded PRNG (deterministic per slider state) + Box–Muller normal
  function mkRand(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
  const target = x => Math.exp(-0.5*((x+2)/0.7)**2) + Math.exp(-0.5*((x-2)/0.7)**2);  // unnormalized
  const logt = x => Math.log(target(x)+1e-300);

  function draw(){
    const prop=parseFloat(sProp.value), steps=parseInt(sSteps.value);
    const rand=mkRand(20240607);
    const nrm=()=>{const u1=Math.max(1e-9,rand()),u2=rand(); return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);};
    // run Metropolis
    const bins=70, hist=new Array(bins).fill(0);
    let x=0, acc=0, kept=0; const burn=Math.min(500, steps>>2);
    for(let i=0;i<steps+burn;i++){
      const xp=x+prop*nrm();
      if(Math.log(rand()) < logt(xp)-logt(x)){ x=xp; acc++; }
      if(i>=burn){ const b=Math.floor((x-XLO)/(XHI-XLO)*bins); if(b>=0&&b<bins){hist[b]++; kept++;} }
    }
    const px = x => PAD + (x-XLO)/(XHI-XLO)*(W-2*PAD);
    // normalize target to compare with histogram density
    let area=0; const step=(XHI-XLO)/400;
    for(let i=0;i<400;i++){area+=target(XLO+i*step)*step;}
    const binw=(XHI-XLO)/bins;
    const histDens = hist.map(c=>c/(kept*binw));
    const tgtDens = x=>target(x)/area;
    let ymax=0; for(let i=0;i<400;i++)ymax=Math.max(ymax,tgtDens(XLO+i*step));
    ymax=Math.max(ymax, ...histDens)*1.1;
    const py = d => H-PAD - d/ymax*(H-2*PAD);

    ctx.clearRect(0,0,W,H);
    // axis
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4; ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(W-PAD,H-PAD);ctx.stroke();
    ctx.fillStyle='#9C99A6'; ctx.font='11px JetBrains Mono, monospace';
    for(let g=XLO;g<=XHI;g+=2){ctx.fillText(g.toFixed(0),px(g)-4,H-PAD+18);}
    // histogram bars
    ctx.fillStyle='rgba(90,79,207,.35)';
    for(let b=0;b<bins;b++){const x0=px(XLO+b*binw), x1=px(XLO+(b+1)*binw); const y=py(histDens[b]);
      ctx.fillRect(x0, y, x1-x0-1, (H-PAD)-y);}
    // target curve
    ctx.strokeStyle='#0E8C80'; ctx.lineWidth=3; ctx.beginPath();
    for(let i=0;i<=400;i++){const xx=XLO+i*step; const q={x:px(xx),y:py(tgtDens(xx))}; i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
    ctx.stroke();
    // readout
    const ar=acc/(steps+burn);
    $('rAcc').textContent = (ar*100).toFixed(0)+'%';
    $('rMix').textContent = ar>0.85 ? 'steps too small — slow mixing' : ar<0.15 ? 'steps too large — mostly rejected' : 'good — exploring well';
    $('rMix').style.color = (ar>0.85||ar<0.15) ? 'var(--rose)' : 'var(--accent)';
  }
  [sProp,sSteps].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
