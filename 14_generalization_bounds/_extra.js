/* Session 14 — Rademacher complexity ~ sqrt(d/n): falls with data, rises with capacity. */
(function(){
  const cv = document.getElementById('radplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 48, NLO=5, NHI=400;
  const $ = id => document.getElementById(id);
  const sN=$('sN'), sD=$('sD');
  const R = (n,d) => Math.sqrt(d/n);         // Rademacher of bounded-norm linear (verified ≈ empirical)

  function draw(){
    const n=parseInt(sN.value), d=parseInt(sD.value);
    const px = nn => PAD + (nn-NLO)/(NHI-NLO)*(W-2*PAD);
    const YHI = Math.max(1.0, R(NLO,d)*1.05);
    const py = r => H-PAD - Math.min(r,YHI)/YHI*(H-2*PAD);
    ctx.clearRect(0,0,W,H);
    // axes + gridlines
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let g=0;g<=4;g++){const y=PAD+g/4*(H-2*PAD);ctx.beginPath();ctx.moveTo(PAD,y);ctx.lineTo(W-PAD,y);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(W-PAD,H-PAD);ctx.stroke();
    ctx.beginPath();ctx.moveTo(PAD,PAD);ctx.lineTo(PAD,H-PAD);ctx.stroke();
    ctx.fillStyle='#9C99A6'; ctx.font='11px JetBrains Mono, monospace';
    ctx.fillText('n →', W-PAD-20, H-PAD+20); ctx.fillText('R̂', PAD-30, PAD+6);
    for(let g=0;g<=4;g++){ctx.fillText((YHI*(1-g/4)).toFixed(2), 6, PAD+g/4*(H-2*PAD)+4);}
    // R(n) curve for current d
    ctx.strokeStyle='#5A4FCF'; ctx.lineWidth=3; ctx.beginPath();
    for(let nn=NLO;nn<=NHI;nn++){const q={x:px(nn),y:py(R(nn,d))}; nn===NLO?ctx.moveTo(q.x,q.y):ctx.lineTo(q.x,q.y);}
    ctx.stroke();
    // faint curves for other d (context)
    ctx.strokeStyle='#E0D9F2'; ctx.lineWidth=1.4;
    [1,5,10,20].forEach(dd=>{ if(dd===d) return; ctx.beginPath();
      for(let nn=NLO;nn<=NHI;nn++){const q={x:px(nn),y:py(R(nn,dd))}; nn===NLO?ctx.moveTo(q.x,q.y):ctx.lineTo(q.x,q.y);} ctx.stroke();});
    // redraw main on top
    ctx.strokeStyle='#5A4FCF'; ctx.lineWidth=3; ctx.beginPath();
    for(let nn=NLO;nn<=NHI;nn++){const q={x:px(nn),y:py(R(nn,d))}; nn===NLO?ctx.moveTo(q.x,q.y):ctx.lineTo(q.x,q.y);}
    ctx.stroke();
    // marker at current n
    const rv=R(n,d), m=px(n), my=py(rv);
    ctx.strokeStyle='#0E8C80'; ctx.setLineDash([4,4]); ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(m,H-PAD);ctx.lineTo(m,my);ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#5B3FE0'; ctx.beginPath();ctx.arc(m,my,6,0,7);ctx.fill();
    ctx.fillStyle='#26252E'; ctx.font='600 12px Inter, sans-serif'; ctx.fillText('n='+n+', d='+d, m+10, my-8);
    // readout
    $('rR').textContent = rv.toFixed(3);
    $('rGap').textContent = (2*rv).toFixed(3);
  }
  [sN,sD].forEach(s=>s && s.addEventListener('input',draw)); draw();
})();
