/* Session 8 — GD vs Adam vs Newton paths on a quadratic bowl. */
(function(){
  const cv = document.getElementById('optplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, OX = W*0.5, OY = H*0.52;
  const $ = id => document.getElementById(id);
  const sK=$('sK'), sLr=$('sLr');
  let opt = 'gd';

  function draw(){
    const kap=parseFloat(sK.value), lr=parseFloat(sLr.value);
    const SX = 150, SY = 150/Math.sqrt(kap)*1.6;
    const px = (x,y) => ({x:OX + x*SX, y:OY - y*SY});
    ctx.clearRect(0,0,W,H);
    // grid + axes
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let gx=-4;gx<=4;gx++){const q=px(gx,0);ctx.beginPath();ctx.moveTo(q.x,0);ctx.lineTo(q.x,H);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
    // contours of x^2 + kap y^2 = c
    ctx.strokeStyle='#E0D9F2'; ctx.lineWidth=1.5;
    [0.25,1,2.25,4].forEach(c=>{ctx.beginPath();
      for(let i=0;i<=120;i++){const t=i/120*2*Math.PI; const q=px(Math.sqrt(c)*Math.cos(t),Math.sqrt(c/kap)*Math.sin(t)); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);} ctx.closePath();ctx.stroke();});

    // run selected optimizer from fixed start
    let x=[2.0,0.9], m=[0,0], v=[0,0], steps=0, diverged=false, note='';
    const grad = p => [p[0], kap*p[1]];
    ctx.strokeStyle='#5A4FCF'; ctx.lineWidth=2.2; ctx.beginPath();
    let s=px(x[0],x[1]); ctx.moveTo(s.x,s.y);
    const N = opt==='newton'?6:600;
    for(let k=0;k<N;k++){
      const g=grad(x);
      if(opt==='gd'){ x=[x[0]-lr*g[0], x[1]-lr*g[1]]; }
      else if(opt==='adam'){ const b1=0.9,b2=0.999,eps=1e-8,t=k+1;
        m=[b1*m[0]+(1-b1)*g[0], b1*m[1]+(1-b1)*g[1]];
        v=[b2*v[0]+(1-b2)*g[0]*g[0], b2*v[1]+(1-b2)*g[1]*g[1]];
        const mh=[m[0]/(1-b1**t), m[1]/(1-b1**t)], vh=[v[0]/(1-b2**t), v[1]/(1-b2**t)];
        x=[x[0]-lr*mh[0]/(Math.sqrt(vh[0])+eps), x[1]-lr*mh[1]/(Math.sqrt(vh[1])+eps)]; }
      else { // Newton: H=diag(1,kap), step = -H^{-1} g = -[g0/1, g1/kap] = -[x0, y0]
        x=[x[0]-g[0]/1, x[1]-g[1]/kap]; }
      const q=px(x[0],x[1]); ctx.lineTo(q.x,q.y);
      steps=k+1; const nrm=Math.hypot(x[0],x[1]);
      if(nrm>60){diverged=true;break;}
      if(nrm<1e-3) break;
    }
    ctx.stroke();
    // markers
    const st=px(2.0,0.9); ctx.fillStyle='#26252E'; ctx.beginPath();ctx.arc(st.x,st.y,5,0,7);ctx.fill();
    const o=px(0,0); ctx.fillStyle='#5B3FE0'; ctx.beginPath();ctx.arc(o.x,o.y,5,0,7);ctx.fill();
    const conv = Math.hypot(x[0],x[1])<1e-3;
    note = opt==='newton' ? 'exact curvature → 1 leap' : opt==='adam' ? 'per-coordinate scaling' : 'zig-zags as κ grows';
    $('rSteps').textContent = diverged ? '— (diverged)' : (conv ? steps : steps+'+ (not yet)');
    $('rNote').textContent = diverged ? 'lr too large' : note;
    $('rNote').style.color = diverged ? 'var(--rose)' : 'var(--muted)';
  }

  document.querySelectorAll('.ctrl[data-opt]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.ctrl[data-opt]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); opt=btn.dataset.opt; draw();
    });
  });
  [sK,sLr].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
