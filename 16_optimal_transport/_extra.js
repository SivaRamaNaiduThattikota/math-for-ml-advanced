/* Session 16 — two Gaussians separated by a shift: W1 grows linearly, JS saturates. */
(function(){
  const cv = document.getElementById('otplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 46, XLO=-6, XHI=16, N=500;
  const $ = id => document.getElementById(id);
  const sShift = $('sShift');
  const pdf = (x,mu) => Math.exp(-0.5*(x-mu)*(x-mu))/Math.sqrt(2*Math.PI);

  function draw(){
    const shift = parseFloat(sShift.value);
    const dx=(XHI-XLO)/N;
    // grids for drawing + JS
    let P=[],Q=[],xs=[],sp=0,sq=0;
    for(let i=0;i<=N;i++){const x=XLO+i*dx; xs.push(x); const a=pdf(x,0),b=pdf(x,shift); P.push(a);Q.push(b);sp+=a;sq+=b;}
    // JS on normalized grids
    let js=0;
    for(let i=0;i<=N;i++){const p=P[i]/sp, q=Q[i]/sq, m=0.5*(p+q);
      if(p>1e-12)js+=0.5*p*Math.log(p/m); if(q>1e-12)js+=0.5*q*Math.log(q/m);}
    const w1=shift;                              // exact for equal-variance Gaussians
    const px=x=>PAD+(x-XLO)/(XHI-XLO)*(W-2*PAD);
    let ymax=pdf(0,0)*1.15; const py=y=>H-PAD-y/ymax*(H-2*PAD);
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4; ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(W-PAD,H-PAD);ctx.stroke();
    ctx.fillStyle='#9C99A6'; ctx.font='11px JetBrains Mono, monospace';
    for(let g=XLO;g<=XHI;g+=2){ctx.fillText(g,px(g)-4,H-PAD+18);}
    function curve(arr,stroke,fill){
      ctx.beginPath(); ctx.moveTo(px(XLO),py(0));
      for(let i=0;i<=N;i++)ctx.lineTo(px(xs[i]),py(arr[i]));
      ctx.lineTo(px(XHI),py(0)); ctx.closePath();
      ctx.fillStyle=fill; ctx.fill(); ctx.strokeStyle=stroke; ctx.lineWidth=2.5; ctx.stroke();
    }
    curve(P,'#0E8C80','rgba(14,140,128,.12)');
    curve(Q,'#5A4FCF','rgba(90,79,207,.12)');
    ctx.fillStyle='#0E8C80'; ctx.font='600 12px Inter,sans-serif'; ctx.fillText('p', px(0)-4, py(pdf(0,0))-8);
    ctx.fillStyle='#5A4FCF'; ctx.fillText('q', px(shift)-4, py(pdf(shift,shift))-8);
    $('rW').textContent = w1.toFixed(2);
    $('rJS').textContent = js.toFixed(4);
    $('rGrad').textContent = shift>5.5 ? 'JS flat (~ln2) — only W₁ still guides' : 'both informative';
    $('rGrad').style.color = shift>5.5 ? 'var(--rose)' : 'var(--accent)';
  }
  sShift.addEventListener('input',draw); draw();
})();
