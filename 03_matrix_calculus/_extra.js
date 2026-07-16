/* Session 3 — Jacobian as the best local linear map. Map g(x,y)=[x^2-y^2, 2xy]. */
(function(){
  const cv = document.getElementById('jacplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, CEN = {x:W*0.5, y:H*0.52};
  const $ = id => document.getElementById(id);
  const sCx=$('sCx'), sCy=$('sCy'), sR=$('sR');
  const N = 7;                                  // grid points per axis

  const g = (x,y) => [x*x - y*y, 2*x*y];
  const Jac = (x,y) => [[2*x, -2*y],[2*y, 2*x]];

  function draw(){
    const cx=parseFloat(sCx.value), cy=parseFloat(sCy.value), r=parseFloat(sR.value);
    const C = g(cx,cy), J = Jac(cx,cy);
    // build true images (P) and linear predictions (L) as offsets from C
    const trueP=[], linL=[];
    let maxext=1e-6;
    for(let i=0;i<N;i++){
      trueP.push([]); linL.push([]);
      for(let j=0;j<N;j++){
        const dx=-r + 2*r*i/(N-1), dy=-r + 2*r*j/(N-1);
        const p=g(cx+dx, cy+dy);
        const P=[p[0]-C[0], p[1]-C[1]];
        const L=[J[0][0]*dx + J[0][1]*dy, J[1][0]*dx + J[1][1]*dy];
        trueP[i].push(P); linL[i].push(L);
        maxext=Math.max(maxext, Math.abs(P[0]),Math.abs(P[1]),Math.abs(L[0]),Math.abs(L[1]));
      }
    }
    const S = 0.4*Math.min(W,H)/maxext;         // auto-fit zoom
    const px = v => ({x:CEN.x + v[0]*S, y:CEN.y - v[1]*S});

    ctx.clearRect(0,0,W,H);
    // axes
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,CEN.y);ctx.lineTo(W,CEN.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(CEN.x,0);ctx.lineTo(CEN.x,H);ctx.stroke();

    // linear-approx grid (indigo): connect L points along rows & columns
    ctx.strokeStyle='#5A4FCF'; ctx.lineWidth=1.6;
    for(let i=0;i<N;i++){ ctx.beginPath(); for(let j=0;j<N;j++){const q=px(linL[i][j]); j?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);} ctx.stroke(); }
    for(let j=0;j<N;j++){ ctx.beginPath(); for(let i=0;i<N;i++){const q=px(linL[i][j]); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);} ctx.stroke(); }

    // true images (teal dots)
    ctx.fillStyle='#0E8C80';
    let maxdev=0;
    for(let i=0;i<N;i++) for(let j=0;j<N;j++){
      const q=px(trueP[i][j]); ctx.beginPath(); ctx.arc(q.x,q.y,3.2,0,7); ctx.fill();
      maxdev=Math.max(maxdev, Math.hypot(trueP[i][j][0]-linL[i][j][0], trueP[i][j][1]-linL[i][j][1]));
    }
    // center g(c)
    ctx.fillStyle='#26252E'; ctx.beginPath(); ctx.arc(CEN.x,CEN.y,4.5,0,7); ctx.fill();

    // readouts
    const f=n=>n.toFixed(2);
    $('rJac').textContent = `[[${f(J[0][0])}, ${f(J[0][1])}], [${f(J[1][0])}, ${f(J[1][1])}]]`;
    const rel = maxdev/(maxext||1);
    $('rFit').textContent = rel<0.06 ? 'tight → linear fits' : rel<0.18 ? 'curvature appearing' : 'wide → nonlinearity shows';
  }
  [sCx,sCy,sR].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
