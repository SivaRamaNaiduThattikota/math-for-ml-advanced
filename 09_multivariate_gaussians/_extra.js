/* Session 9 — bivariate Gaussian: covariance ellipse, eigen-axes, sample cloud. */
(function(){
  const cv = document.getElementById('gaussplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, OX = W*0.5, OY = H*0.52, S = 70;
  const $ = id => document.getElementById(id);
  const sS1=$('sS1'), sS2=$('sS2'), sRho=$('sRho');
  const px = (x,y) => ({x:OX + x*S, y:OY - y*S});

  // fixed standard-normal sample set (Box–Muller), coloured per-frame by L
  const rngPairs = (function(){
    let seed=12345; const rand=()=>{seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff;};
    const pts=[]; for(let i=0;i<320;i++){const u1=Math.max(1e-9,rand()),u2=rand();
      const r=Math.sqrt(-2*Math.log(u1)); pts.push([r*Math.cos(2*Math.PI*u2), r*Math.sin(2*Math.PI*u2)]);}
    return pts;
  })();

  function eigSym(a,b,c){const tr=a+c,disc=Math.sqrt(((a-c)/2)**2+b*b);const l1=tr/2+disc,l2=tr/2-disc;
    let v1=Math.abs(b)>1e-9?[l1-c,b]:(a>=c?[1,0]:[0,1]);const n=Math.hypot(v1[0],v1[1])||1;v1=[v1[0]/n,v1[1]/n];
    return {l1,l2,v1,v2:[-v1[1],v1[0]]};}

  function draw(){
    const s1=parseFloat(sS1.value), s2=parseFloat(sS2.value), rho=parseFloat(sRho.value);
    const a=s1*s1, c=s2*s2, b=rho*s1*s2;                 // Sigma = [[a,b],[b,c]]
    // Cholesky of Sigma
    const l11=Math.sqrt(a), l21=b/l11, l22=Math.sqrt(Math.max(1e-9,c-l21*l21));
    ctx.clearRect(0,0,W,H);
    // grid + axes
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let g=-5;g<=5;g++){const q=px(g,0);ctx.beginPath();ctx.moveTo(q.x,0);ctx.lineTo(q.x,H);ctx.stroke();
      const r=px(0,g);ctx.beginPath();ctx.moveTo(0,r.y);ctx.lineTo(W,r.y);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
    // sample cloud x = L z
    ctx.fillStyle='rgba(14,140,128,.55)';
    for(const z of rngPairs){const x=l11*z[0], y=l21*z[0]+l22*z[1]; const q=px(x,y);
      ctx.beginPath();ctx.arc(q.x,q.y,2.6,0,7);ctx.fill();}
    // probability contour ellipses (1σ, 2σ): points L * (k*unit circle)
    ctx.strokeStyle='#5A4FCF';
    [1,2].forEach((k,idx)=>{ctx.lineWidth=idx?1.5:2.4; ctx.beginPath();
      for(let i=0;i<=120;i++){const t=i/120*2*Math.PI; const zx=k*Math.cos(t),zy=k*Math.sin(t);
        const x=l11*zx, y=l21*zx+l22*zy; const q=px(x,y); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
      ctx.closePath();ctx.stroke();});
    // eigen-axes
    const {l1,l2,v1,v2}=eigSym(a,b,c);
    function arrow(vx,vy,col){const t=px(vx,vy);ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=3;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(OX,OY);ctx.lineTo(t.x,t.y);ctx.stroke();
      const an=Math.atan2(OY-t.y,t.x-OX),h=10;ctx.beginPath();ctx.moveTo(t.x,t.y);
      ctx.lineTo(t.x-h*Math.cos(an-0.42),t.y+h*Math.sin(an-0.42));
      ctx.lineTo(t.x-h*Math.cos(an+0.42),t.y+h*Math.sin(an+0.42));ctx.closePath();ctx.fill();}
    arrow(v1[0]*Math.sqrt(l1), v1[1]*Math.sqrt(l1), '#5B3FE0');
    arrow(v2[0]*Math.sqrt(l2), v2[1]*Math.sqrt(l2), '#B07514');
    // readouts
    $('rSig').textContent = `[[${a.toFixed(2)}, ${b.toFixed(2)}], [${b.toFixed(2)}, ${c.toFixed(2)}]]`;
    $('rEig').textContent = `${l1.toFixed(2)}, ${l2.toFixed(2)}  (ρ=${rho.toFixed(2)})`;
  }
  [sS1,sS2,sRho].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
