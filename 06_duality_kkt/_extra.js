/* Session 6 — Lagrange multipliers as tangency of a contour to the constraint line. */
(function(){
  const cv = document.getElementById('lagplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, S = 62, OX = 210, OY = 350;   // world (0,0) -> (OX,OY)
  const $ = id => document.getElementById(id);
  const sT = $('sT');
  const C = [1,2];                       // unconstrained minimum (contour center)
  const px = p => ({x:OX + p[0]*S, y:OY - p[1]*S});
  const f = p => (p[0]-C[0])**2 + (p[1]-C[1])**2;

  function circle(r, col, w){
    ctx.strokeStyle=col; ctx.lineWidth=w; ctx.beginPath();
    for(let i=0;i<=90;i++){const t=i/90*2*Math.PI; const q=px([C[0]+r*Math.cos(t),C[1]+r*Math.sin(t)]); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
    ctx.closePath(); ctx.stroke();
  }
  function arrow(fromP,toP,col){
    const f0=px(fromP), t0=px(toP);
    ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=3.5; ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(f0.x,f0.y);ctx.lineTo(t0.x,t0.y);ctx.stroke();
    const an=Math.atan2(t0.y-f0.y,t0.x-f0.x),h=11; ctx.beginPath();ctx.moveTo(t0.x,t0.y);
    ctx.lineTo(t0.x-h*Math.cos(an-0.42),t0.y-h*Math.sin(an-0.42));
    ctx.lineTo(t0.x-h*Math.cos(an+0.42),t0.y-h*Math.sin(an+0.42));ctx.closePath();ctx.fill();
  }

  function draw(){
    const t = parseFloat(sT.value);
    const P = [t, 1-t];                  // point on constraint x1+x2=1
    ctx.clearRect(0,0,W,H);
    // grid + axes
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let gx=-3;gx<=6;gx++){const q=px([gx,0]);ctx.beginPath();ctx.moveTo(q.x,0);ctx.lineTo(q.x,H);ctx.stroke();}
    for(let gy=-2;gy<=6;gy++){const q=px([0,gy]);ctx.beginPath();ctx.moveTo(0,q.y);ctx.lineTo(W,q.y);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(0,OY);ctx.lineTo(W,OY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(OX,0);ctx.lineTo(OX,H);ctx.stroke();
    // faint contour rings
    [1,2,3].forEach(r=>circle(r,'#E0D9F2',1.5));
    // contour through the point (highlighted)
    circle(Math.sqrt(f(P)), '#0E8C80', 2);
    // constraint line x1 + x2 = 1  -> x2 = 1 - x1
    ctx.strokeStyle='#B07514'; ctx.lineWidth=2.5;
    const A=px([-3,4]), B=px([6,-5]); ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();
    // center + point
    const pc=px(C); ctx.fillStyle='#9C99A6'; ctx.beginPath();ctx.arc(pc.x,pc.y,4,0,7);ctx.fill();
    // gradient of f at P (scaled), and optimum test
    const g=[2*(P[0]-C[0]), 2*(P[1]-C[1])];
    const dir=[1/Math.SQRT2,-1/Math.SQRT2];
    const along=Math.abs(g[0]*dir[0]+g[1]*dir[1]);
    const opt = along < 0.06;
    arrow(P, [P[0]+g[0]*0.28, P[1]+g[1]*0.28], opt?'#5B3FE0':'#C13A57');
    const pp=px(P); ctx.fillStyle='#fff'; ctx.strokeStyle=opt?'#5B3FE0':'#26252E'; ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(pp.x,pp.y,7,0,7);ctx.fill();ctx.stroke();
    if(opt){ctx.fillStyle='#5B3FE0';ctx.font='600 15px Inter,sans-serif';ctx.fillText('optimum: contour tangent to line',pp.x+14,pp.y-10);}
    // readouts
    $('rPt').textContent = `[${P[0].toFixed(2)}, ${P[1].toFixed(2)}]`;
    $('rF').textContent = f(P).toFixed(3);
    $('rOpt').textContent = opt ? 'yes — ∇f ⟂ line (optimum!)' : 'no — can still slide downhill';
    $('rOpt').style.color = opt ? 'var(--accent)' : 'var(--muted)';
  }
  sT.addEventListener('input',draw); draw();
})();
