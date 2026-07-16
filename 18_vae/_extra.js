/* Session 18 — VAE KL term: encoder q=N(mu,sigma^2) pulled toward prior N(0,1). */
(function(){
  const cv = document.getElementById('vaeplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 46, XLO=-5, XHI=5, N=400;
  const $ = id => document.getElementById(id);
  const sMu = $('sMu'), sSig = $('sSig');
  const pdf = (x,mu,s) => Math.exp(-0.5*((x-mu)/s)**2)/(s*Math.sqrt(2*Math.PI));

  function draw(){
    const mu=parseFloat(sMu.value), s=parseFloat(sSig.value);
    const dx=(XHI-XLO)/N;
    const px=x=>PAD+(x-XLO)/(XHI-XLO)*(W-2*PAD);
    let ymax=0; for(let i=0;i<=N;i++){const x=XLO+i*dx; ymax=Math.max(ymax,pdf(x,0,1),pdf(x,mu,s));}
    ymax*=1.12; const py=y=>H-PAD-y/ymax*(H-2*PAD);
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4; ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(W-PAD,H-PAD);ctx.stroke();
    ctx.fillStyle='#9C99A6'; ctx.font='11px JetBrains Mono, monospace';
    for(let g=XLO;g<=XHI;g+=1){ctx.fillText(g,px(g)-3,H-PAD+18);}
    function curve(mu2,s2,stroke,fill,lbl,lx){
      ctx.beginPath(); ctx.moveTo(px(XLO),py(0));
      for(let i=0;i<=N;i++){const x=XLO+i*dx; ctx.lineTo(px(x),py(pdf(x,mu2,s2)));}
      ctx.lineTo(px(XHI),py(0)); ctx.closePath(); ctx.fillStyle=fill; ctx.fill();
      ctx.strokeStyle=stroke; ctx.lineWidth=2.6; ctx.stroke();
      ctx.fillStyle=stroke; ctx.font='600 12px Inter,sans-serif'; ctx.fillText(lbl, px(lx), py(pdf(lx,mu2,s2))-8);
    }
    curve(0,1,'#0E8C80','rgba(14,140,128,.10)','prior N(0,1)',0);
    curve(mu,s,'#5A4FCF','rgba(90,79,207,.14)','q(z|x)',mu);
    const kl=0.5*(s*s+mu*mu-1-Math.log(s*s));
    $('rKL').textContent = kl.toFixed(3);
    $('rPull').textContent = kl<0.02 ? 'at the prior (KL≈0)' : 'regularizer pulls q → prior';
    $('rPull').style.color = kl<0.02 ? 'var(--accent)' : 'var(--muted)';
  }
  [sMu,sSig].forEach(s=>s && s.addEventListener('input',draw)); draw();
})();
