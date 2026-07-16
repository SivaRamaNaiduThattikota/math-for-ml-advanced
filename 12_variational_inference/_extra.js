/* Session 12 — variational inference: fit Gaussian q to a skewed target, minimize KL(q||p). */
(function(){
  const cv = document.getElementById('viplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 44, XLO=-5, XHI=5, GRID=600;
  const $ = id => document.getElementById(id);
  const sM=$('sM'), sS=$('sS');

  // skewed / bimodal target (unnormalized), normalized on the grid
  const tRaw = x => 0.65*Math.exp(-0.5*((x+1)/0.7)**2) + 0.35*Math.exp(-0.5*((x-1.9)/0.6)**2);
  const dx=(XHI-XLO)/GRID;
  let Z=0; for(let i=0;i<=GRID;i++)Z+=tRaw(XLO+i*dx)*dx;
  const p = x => tRaw(x)/Z;
  const qd = (x,m,s) => Math.exp(-0.5*((x-m)/s)**2)/(s*Math.sqrt(2*Math.PI));

  function draw(){
    const m=parseFloat(sM.value), s=parseFloat(sS.value);
    // KL(q||p) = ∫ q log(q/p)
    let kl=0;
    for(let i=0;i<=GRID;i++){const x=XLO+i*dx; const q=qd(x,m,s), pp=Math.max(p(x),1e-12);
      if(q>1e-12) kl += q*Math.log(q/pp)*dx;}
    const px = x => PAD + (x-XLO)/(XHI-XLO)*(W-2*PAD);
    let ymax=0; for(let i=0;i<=GRID;i++){ymax=Math.max(ymax,p(XLO+i*dx),qd(XLO+i*dx,m,s));}
    ymax*=1.12;
    const py = d => H-PAD - d/ymax*(H-2*PAD);

    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4; ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(W-PAD,H-PAD);ctx.stroke();
    ctx.fillStyle='#9C99A6'; ctx.font='11px JetBrains Mono, monospace';
    for(let g=XLO;g<=XHI;g+=1){ctx.fillText(g.toFixed(0),px(g)-4,H-PAD+18);}
    // target p (teal, filled)
    ctx.beginPath(); ctx.moveTo(px(XLO),py(0));
    for(let i=0;i<=GRID;i++){const x=XLO+i*dx; ctx.lineTo(px(x),py(p(x)));}
    ctx.lineTo(px(XHI),py(0)); ctx.closePath();
    ctx.fillStyle='rgba(14,140,128,.14)'; ctx.fill();
    ctx.strokeStyle='#0E8C80'; ctx.lineWidth=3; ctx.beginPath();
    for(let i=0;i<=GRID;i++){const x=XLO+i*dx; const q={x:px(x),y:py(p(x))}; i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
    ctx.stroke();
    // q (indigo)
    ctx.strokeStyle='#5A4FCF'; ctx.lineWidth=3; ctx.setLineDash([6,4]); ctx.beginPath();
    for(let i=0;i<=GRID;i++){const x=XLO+i*dx; const o={x:px(x),y:py(qd(x,m,s))}; i?ctx.lineTo(o.x,o.y):ctx.moveTo(o.x,o.y);}
    ctx.stroke(); ctx.setLineDash([]);
    // labels
    ctx.fillStyle='#0E8C80'; ctx.font='600 13px Inter, sans-serif'; ctx.fillText('target posterior p', PAD+8, PAD+6);
    ctx.fillStyle='#5A4FCF'; ctx.fillText('q = N(m, s²)', PAD+8, PAD+24);
    // readout
    $('rKL').textContent = kl.toFixed(4);
    $('rElbo').textContent = kl<0.05 ? '≈ maximized (KL≈0)' : kl<0.25 ? 'rising (lower KL)' : 'low (KL large)';
    $('rElbo').style.color = kl<0.05 ? 'var(--accent)' : 'var(--muted)';
  }
  [sM,sS].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
