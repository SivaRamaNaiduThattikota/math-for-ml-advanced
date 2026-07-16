/* Session 21 — capstone: β sweeps the rate–distortion frontier of the ELBO. */
(function(){
  const cv = document.getElementById('capplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 62, XT=2.0;   // target mean
  const $ = id => document.getElementById(id);
  const sB = $('sB');
  // toy optimum for a given beta: mu*=2·XT/(2+beta); rate=½μ², distortion=(μ-XT)²
  const muStar = b => 2*XT/(2+b);
  const rate   = mu => 0.5*mu*mu;
  const dist   = mu => (mu-XT)*(mu-XT);

  // frontier extent (beta 0.1 .. 20 covers the curve)
  const bLo=0.05, bHi=25;
  let RMAX=0, DMAX=0;
  for(let b=bLo;b<=bHi;b*=1.04){const m=muStar(b); RMAX=Math.max(RMAX,rate(m)); DMAX=Math.max(DMAX,dist(m));}
  RMAX*=1.1; DMAX*=1.12;

  const px = r => PAD + r/RMAX*(W-2*PAD);
  const py = d => H-PAD - d/DMAX*(H-2*PAD);

  function draw(){
    const beta=parseFloat(sB.value);
    const mu=muStar(beta), r=rate(mu), d=dist(mu);
    ctx.clearRect(0,0,W,H);
    // axes
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(W-PAD,H-PAD);ctx.stroke();
    ctx.beginPath();ctx.moveTo(PAD,H-PAD);ctx.lineTo(PAD,PAD);ctx.stroke();
    ctx.fillStyle='#6E6C7A'; ctx.font='600 12px Inter,sans-serif';
    ctx.fillText('rate  = KL(q‖p)  →', W/2-60, H-PAD+34);
    ctx.save(); ctx.translate(PAD-38,H/2+70); ctx.rotate(-Math.PI/2);
    ctx.fillText('distortion = recon error  →',0,0); ctx.restore();
    // frontier curve
    ctx.beginPath(); let started=false;
    for(let b=bHi;b>=bLo;b/=1.03){const m=muStar(b); const X=px(rate(m)),Y=py(dist(m)); started?ctx.lineTo(X,Y):(ctx.moveTo(X,Y),started=true);}
    ctx.strokeStyle='#5A4FCF'; ctx.lineWidth=2.8; ctx.stroke();
    // fill under the frontier faintly
    ctx.lineTo(px(0),py(0)); ctx.closePath(); ctx.fillStyle='rgba(90,79,207,.07)'; ctx.fill();
    // current point + tangent (slope = -beta in scaled units, conceptual)
    const X=px(r), Y=py(d);
    ctx.fillStyle='#0E8C80'; ctx.beginPath(); ctx.arc(X,Y,7,0,2*Math.PI); ctx.fill();
    ctx.strokeStyle='rgba(14,140,128,.4)'; ctx.setLineDash([4,4]); ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(X,H-PAD);ctx.lineTo(X,Y);ctx.lineTo(PAD,Y);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#0E8C80'; ctx.font='600 12px Inter,sans-serif';
    ctx.fillText('β = '+beta.toFixed(1), X+11, Y-8);
    // annotate ends
    ctx.fillStyle='#9C99A6'; ctx.font='11px Inter,sans-serif';
    ctx.fillText('small β: detailed, complex', px(RMAX*0.55), py(DMAX*0.06));
    ctx.fillText('large β: simple, blurry', px(RMAX*0.02)+6, py(DMAX*0.9));
    // readouts
    $('rKL').textContent = r.toFixed(3);
    $('rDist').textContent = d.toFixed(3);
    $('rDist').style.color = 'var(--muted)';
  }
  sB.addEventListener('input',draw); draw();
})();
