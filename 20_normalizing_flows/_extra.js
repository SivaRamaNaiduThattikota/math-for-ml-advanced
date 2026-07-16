/* Session 20 — change of variables: a Gaussian warped by x=z+k·tanh(z), density exact. */
(function(){
  const cv = document.getElementById('flowplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 46, XLO=-6, XHI=6, N=1200;
  const $ = id => document.getElementById(id);
  const sK = $('sK');
  const phi = z => Math.exp(-0.5*z*z)/Math.sqrt(2*Math.PI);   // base N(0,1)

  function draw(){
    const k=parseFloat(sK.value);
    const g  = z => z + k*Math.tanh(z);                       // invertible for k>-1
    const gp = z => 1 + k*(1-Math.tanh(z)**2);                // g'(z) = 1 + k·sech²z
    // transformed density parametrically: point (g(z), phi(z)/g'(z))
    const zs=[], pts=[];
    for(let i=0;i<=N;i++){const z=-8+i*16/N; zs.push(z); pts.push([g(z), phi(z)/gp(z)]);}
    let ymax=0; for(const p of pts) ymax=Math.max(ymax,p[1]);
    ymax=Math.max(ymax, phi(0))*1.12;
    const px=x=>PAD+(x-XLO)/(XHI-XLO)*(W-2*PAD);
    const py=y=>H-PAD-y/ymax*(H-2*PAD);
    ctx.clearRect(0,0,W,H);
    // axis
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4; ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(W-PAD,H-PAD);ctx.stroke();
    ctx.fillStyle='#9C99A6'; ctx.font='11px JetBrains Mono, monospace';
    for(let g0=XLO;g0<=XHI;g0+=2){ctx.fillText(g0,px(g0)-4,H-PAD+18);}
    // base N(0,1) — faint filled
    ctx.beginPath(); ctx.moveTo(px(XLO),py(0));
    for(let i=0;i<=N;i++){const x=XLO+i*(XHI-XLO)/N; ctx.lineTo(px(x),py(phi(x)));}
    ctx.lineTo(px(XHI),py(0)); ctx.closePath();
    ctx.fillStyle='rgba(90,79,207,.08)'; ctx.fill();
    ctx.strokeStyle='rgba(90,79,207,.45)'; ctx.setLineDash([5,4]); ctx.lineWidth=1.6; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(90,79,207,.7)'; ctx.font='600 12px Inter,sans-serif'; ctx.fillText('base N(0,1)', px(-5.4), py(phi(0))-6);
    // transformed density — solid teal, filled
    ctx.beginPath();
    let started=false;
    for(const [x,d] of pts){ if(x<XLO||x>XHI) continue; const X=px(x),Y=py(d); started?ctx.lineTo(X,Y):(ctx.moveTo(X,Y),started=true);}
    ctx.strokeStyle='#0E8C80'; ctx.lineWidth=2.8; ctx.stroke();
    ctx.lineTo(px(Math.min(XHI,g(8))),py(0)); ctx.lineTo(px(Math.max(XLO,g(-8))),py(0)); ctx.closePath();
    ctx.fillStyle='rgba(14,140,128,.12)'; ctx.fill();
    ctx.fillStyle='#0E8C80'; ctx.fillText('p_x = φ(z)/g′(z)', px(2.4), py(ymax*0.72));
    // readouts
    const ld=Math.log(gp(0));                       // log g'(0) = log(1+k)
    $('rLD').textContent = ld.toFixed(3);
    $('rModes').textContent = k>1 ? 'bimodal (dip at center)' : k>0 ? 'flattening' : 'Gaussian (identity)';
    $('rModes').style.color = k>1 ? 'var(--accent)' : 'var(--muted)';
  }
  sK.addEventListener('input',draw); draw();
})();
