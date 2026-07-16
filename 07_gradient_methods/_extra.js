/* Session 7 — gradient descent path on a quadratic bowl; momentum toggle. */
(function(){
  const cv = document.getElementById('gdplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, OX = W*0.5, OY = H*0.52;
  const $ = id => document.getElementById(id);
  const sK=$('sK'), sEta=$('sEta'), sBeta=$('sBeta'), btn=$('btnMom');
  let momentum = false;

  function draw(){
    const kap=parseFloat(sK.value), eta=parseFloat(sEta.value), beta=parseFloat(sBeta.value);
    // f = 1/2 (x^2 + kap y^2); scale so ellipse fits: sx px/unit for x, sy for y
    const SX = 150, SY = 150/Math.sqrt(kap)*1.6;   // squash y so high-kappa bowl is visibly narrow
    const px = (x,y) => ({x:OX + x*SX, y:OY - y*SY});
    ctx.clearRect(0,0,W,H);
    // grid
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let gx=-4;gx<=4;gx++){const q=px(gx,0);ctx.beginPath();ctx.moveTo(q.x,0);ctx.lineTo(q.x,H);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
    // contour ellipses of f: x^2 + kap y^2 = c
    ctx.strokeStyle='#E0D9F2'; ctx.lineWidth=1.5;
    [0.25,1,2.25,4].forEach(c=>{
      ctx.beginPath();
      for(let i=0;i<=120;i++){const t=i/120*2*Math.PI; const x=Math.sqrt(c)*Math.cos(t), y=Math.sqrt(c/kap)*Math.sin(t); const q=px(x,y); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
      ctx.closePath(); ctx.stroke();
    });
    // run the method from a fixed start
    let x=[2.0, 0.9], v=[0,0], steps=0, diverged=false;
    const grad = p => [p[0], kap*p[1]];
    ctx.strokeStyle='#5A4FCF'; ctx.lineWidth=2; ctx.beginPath();
    let s=px(x[0],x[1]); ctx.moveTo(s.x,s.y);
    for(let k=0;k<400;k++){
      const g=grad(x);
      if(momentum){ v=[beta*v[0]-eta*g[0], beta*v[1]-eta*g[1]]; x=[x[0]+v[0], x[1]+v[1]]; }
      else { x=[x[0]-eta*g[0], x[1]-eta*g[1]]; }
      const q=px(x[0],x[1]); ctx.lineTo(q.x,q.y);
      steps=k+1;
      const nrm=Math.hypot(x[0],x[1]);
      if(nrm>50){diverged=true;break;}
      if(nrm<1e-3) break;
    }
    ctx.stroke();
    // iterate dots
    // (redraw markers lightly)
    ctx.fillStyle='#0E8C80';
    // start marker
    const st=px(2.0,0.9); ctx.fillStyle='#26252E'; ctx.beginPath();ctx.arc(st.x,st.y,5,0,7);ctx.fill();
    const opt=px(0,0); ctx.fillStyle='#5B3FE0'; ctx.beginPath();ctx.arc(opt.x,opt.y,5,0,7);ctx.fill();
    // readout
    $('rSteps').textContent = diverged ? '— (diverged)' : (Math.hypot(x[0],x[1])<1e-3 ? steps : steps+'+ (not yet)');
    $('rStatus').textContent = diverged ? 'diverging — η too large' : (Math.hypot(x[0],x[1])<1e-3 ? 'converged' : 'still crawling');
    $('rStatus').style.color = diverged ? 'var(--rose)' : (Math.hypot(x[0],x[1])<1e-3 ? 'var(--accent)' : 'var(--muted)');
  }

  btn.addEventListener('click',()=>{ momentum=!momentum; btn.textContent='momentum: '+(momentum?'on':'off'); btn.classList.toggle('active',!momentum); draw(); });
  [sK,sEta,sBeta].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
