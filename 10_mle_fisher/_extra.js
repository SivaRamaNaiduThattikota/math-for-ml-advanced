/* Session 10 — Bernoulli log-likelihood: peak = MLE, curvature = Fisher, more data = sharper. */
(function(){
  const cv = document.getElementById('fisherplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 46;
  const $ = id => document.getElementById(id);
  const sN=$('sN'), sP=$('sP');

  function draw(){
    const n=parseInt(sN.value), ptrue=parseFloat(sP.value);
    const k=Math.round(n*ptrue), phat=k/n;
    // log-likelihood ell(p) = k log p + (n-k) log(1-p), evaluated on a grid, normalized to its max
    const P0=0.001, P1=0.999, M=400;
    let ll=[], maxll=-Infinity;
    for(let i=0;i<=M;i++){const p=P0+(P1-P0)*i/M; const v=k*Math.log(p)+(n-k)*Math.log(1-p); ll.push([p,v]); if(v>maxll)maxll=v;}
    // display window: show top region of the curve
    const span = 6 + 0.5*Math.log(n);      // vertical zoom (log-lik units below the peak)
    const yTop = maxll, yBot = maxll - span;
    const px = p => PAD + p*(W-2*PAD);
    const py = v => { const t=(v-yBot)/(yTop-yBot); return H-PAD - Math.max(0,Math.min(1,t))*(H-2*PAD); };

    ctx.clearRect(0,0,W,H);
    // grid + p-axis ticks
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let g=0;g<=10;g++){const x=px(g/10);ctx.beginPath();ctx.moveTo(x,PAD-6);ctx.lineTo(x,H-PAD+6);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4; ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(W-PAD,H-PAD);ctx.stroke();
    ctx.fillStyle='#9C99A6'; ctx.font='11px JetBrains Mono, monospace';
    for(let g=0;g<=10;g+=2){ctx.fillText((g/10).toFixed(1), px(g/10)-8, H-PAD+20);}
    ctx.fillText('p', W-PAD+8, H-PAD+4);

    // normal (Laplace) approximation N(phat, phat(1-phat)/n), scaled to sit under the peak
    const s2 = phat*(1-phat)/n, sd=Math.sqrt(s2);
    ctx.strokeStyle='#5A4FCF'; ctx.lineWidth=1.6; ctx.setLineDash([5,4]); ctx.beginPath();
    for(let i=0;i<=M;i++){const p=P0+(P1-P0)*i/M; const g = -0.5*((p-phat)**2)/s2; // log of gaussian (unnormalized), peak 0
      const q={x:px(p), y:py(maxll+g)}; i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
    ctx.stroke(); ctx.setLineDash([]);

    // log-likelihood curve (teal)
    ctx.strokeStyle='#0E8C80'; ctx.lineWidth=3; ctx.beginPath();
    ll.forEach(([p,v],i)=>{const q={x:px(p),y:py(v)}; i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});
    ctx.stroke();

    // MLE marker
    const mx=px(phat);
    ctx.strokeStyle='#5B3FE0'; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(mx,py(maxll));ctx.lineTo(mx,H-PAD);ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#5B3FE0'; ctx.beginPath();ctx.arc(mx,py(maxll),6,0,7);ctx.fill();
    ctx.font='600 13px Inter, sans-serif'; ctx.fillText('MLE p̂='+phat.toFixed(3), mx+10, py(maxll)+4);

    // readouts
    $('rMLE').textContent = phat.toFixed(3)+`  (${k}/${n})`;
    $('rFish').textContent = (n/(phat*(1-phat))).toFixed(0);
    $('rCRB').textContent = sd.toFixed(4);
  }
  [sN,sP].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
