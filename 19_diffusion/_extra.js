/* Session 19 — forward diffusion: a bimodal data distribution dissolving into noise. */
(function(){
  const cv = document.getElementById('diffplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 46, XLO=-5, XHI=5, BINS=70, M=8000;
  const $ = id => document.getElementById(id);
  const sT = $('sT');
  // fixed base data (bimodal) + fixed noise (seeded Box–Muller)
  function mk(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
  const r=mk(7); const nrm=()=>{const u1=Math.max(1e-9,r()),u2=r();return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);};
  const x0=[],eps=[];
  for(let i=0;i<M;i++){ x0.push((i%2?2:-2)+0.5*nrm()); eps.push(nrm()); }

  function draw(){
    const t=parseFloat(sT.value);
    const ab=1-t;                                  // signal retention: 1 (data) -> 0 (noise)
    const sA=Math.sqrt(ab), sN=Math.sqrt(1-ab);
    const hist=new Array(BINS).fill(0);
    for(let i=0;i<M;i++){ const xt=sA*x0[i]+sN*eps[i];
      const b=Math.floor((xt-XLO)/(XHI-XLO)*BINS); if(b>=0&&b<BINS)hist[b]++; }
    const binw=(XHI-XLO)/BINS;
    const dens=hist.map(c=>c/(M*binw));
    const ymax=Math.max(0.45, ...dens)*1.1;
    const px=x=>PAD+(x-XLO)/(XHI-XLO)*(W-2*PAD);
    const py=d=>H-PAD-d/ymax*(H-2*PAD);
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4; ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(W-PAD,H-PAD);ctx.stroke();
    ctx.fillStyle='#9C99A6'; ctx.font='11px JetBrains Mono, monospace';
    for(let g=XLO;g<=XHI;g+=1){ctx.fillText(g,px(g)-3,H-PAD+18);}
    // histogram bars (colour shifts teal->indigo as noise grows)
    for(let b=0;b<BINS;b++){const x0p=px(XLO+b*binw),x1p=px(XLO+(b+1)*binw),y=py(dens[b]);
      ctx.fillStyle=`rgba(${Math.round(14+76*t)},${Math.round(140-61*t)},${Math.round(128+96*t)},0.55)`;
      ctx.fillRect(x0p,y,x1p-x0p-1,(H-PAD)-y);}
    // reference standard normal (dashed) to show the endpoint
    ctx.strokeStyle='#9C99A6'; ctx.setLineDash([5,4]); ctx.lineWidth=1.6; ctx.beginPath();
    for(let i=0;i<=200;i++){const x=XLO+i*(XHI-XLO)/200; const d=Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI); const q={x:px(x),y:py(d)}; i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#9C99A6'; ctx.fillText('N(0,1)', px(1.6), py(0.3));
    $('rAB').textContent = ab.toFixed(2);
    $('rState').textContent = t<0.08 ? 'data (two modes)' : t>0.92 ? '≈ pure noise N(0,1)' : 'noising…';
    $('rState').style.color = t>0.92 ? 'var(--muted)' : 'var(--accent)';
  }
  sT.addEventListener('input',draw); draw();
})();
