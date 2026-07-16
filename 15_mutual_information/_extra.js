/* Session 15 — bivariate Gaussian: correlation rho -> mutual information. */
(function(){
  const cv = document.getElementById('miplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, OX = W*0.5, OY = H*0.52, S = 58;
  const $ = id => document.getElementById(id);
  const sRho = $('sRho');
  // fixed standard-normal pairs (Box–Muller, seeded) coloured per-frame by rho
  const Z = (function(){ let s=99991; const r=()=>{s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff;};
    const a=[]; for(let i=0;i<340;i++){const u1=Math.max(1e-9,r()),u2=r(); const R=Math.sqrt(-2*Math.log(u1));
      a.push([R*Math.cos(2*Math.PI*u2), R*Math.sin(2*Math.PI*u2)]);} return a; })();

  function draw(){
    const rho=parseFloat(sRho.value);
    const l21=rho, l22=Math.sqrt(Math.max(1e-6,1-rho*rho));
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let g=-5;g<=5;g++){ctx.beginPath();ctx.moveTo(OX+g*S,0);ctx.lineTo(OX+g*S,H);ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,OY-g*S);ctx.lineTo(W,OY-g*S);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
    // scatter x=z0, y=rho*z0 + sqrt(1-rho^2)*z1
    ctx.fillStyle='rgba(90,79,207,.5)';
    for(const z of Z){ const x=z[0], y=l21*z[0]+l22*z[1];
      ctx.beginPath(); ctx.arc(OX+x*S, OY-y*S, 3, 0, 7); ctx.fill(); }
    // readouts
    const mi = -0.5*Math.log(1-rho*rho);
    $('rMI').textContent = mi.toFixed(3);
    $('rMIb').textContent = (mi/Math.log(2)).toFixed(3);
    const a=Math.abs(rho);
    $('rDep').textContent = a<0.05?'independent (I≈0)': a<0.4?'weak': a<0.8?'moderate':'strong';
    $('rDep').style.color = a<0.05?'var(--muted)':'var(--accent)';
  }
  sRho.addEventListener('input',draw); draw();
})();
