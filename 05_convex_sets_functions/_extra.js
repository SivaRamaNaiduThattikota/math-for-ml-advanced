/* Session 5 — convexity: the chord lies above (or below) the graph. */
(function(){
  const cv = document.getElementById('cvxplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const $ = id => document.getElementById(id);
  const sA=$('sA'), sB=$('sB');
  const FUNS = { sq:x=>x*x, abs:x=>Math.abs(x), exp:x=>Math.exp(x), cube:x=>x*x*x, sin:x=>Math.sin(x) };
  let fn = 'sq';

  const XLO=-3, XHI=3, PAD=40;
  function draw(){
    const f = FUNS[fn];
    let a=parseFloat(sA.value), b=parseFloat(sB.value);
    if(a>b){const t=a;a=b;b=t;}
    // y-range over the visible domain
    let ylo=Infinity, yhi=-Infinity;
    for(let i=0;i<=200;i++){const x=XLO+(XHI-XLO)*i/200; const y=f(x); ylo=Math.min(ylo,y); yhi=Math.max(yhi,y);}
    if(yhi-ylo<1e-6){yhi=ylo+1;}
    const mx = W/(XHI-XLO), pad=(yhi-ylo)*0.12; ylo-=pad; yhi+=pad;
    const my = (H-2*PAD)/(yhi-ylo);
    const px = x => PAD + (x-XLO)*(W-2*PAD)/(XHI-XLO);
    const py = y => H-PAD - (y-ylo)*my;

    ctx.clearRect(0,0,W,H);
    // axes
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let gx=Math.ceil(XLO);gx<=XHI;gx++){ctx.beginPath();ctx.moveTo(px(gx),0);ctx.lineTo(px(gx),H);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.4;
    if(ylo<=0&&yhi>=0){ctx.beginPath();ctx.moveTo(0,py(0));ctx.lineTo(W,py(0));ctx.stroke();}
    ctx.beginPath();ctx.moveTo(px(0),0);ctx.lineTo(px(0),H);ctx.stroke();

    // function curve (teal)
    ctx.strokeStyle='#0E8C80'; ctx.lineWidth=3;
    ctx.beginPath();
    for(let i=0;i<=300;i++){const x=XLO+(XHI-XLO)*i/300; const q={x:px(x),y:py(f(x))}; i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
    ctx.stroke();

    // convexity check on [a,b]
    let convex=true;
    for(let i=1;i<20;i++){const t=i/20; const xm=t*a+(1-t)*b; const chord=t*f(a)+(1-t)*f(b);
      if(f(xm) > chord + 1e-6){convex=false;break;}}

    // chord (indigo, or rose if it dips below)
    const col = convex ? '#5A4FCF' : '#C13A57';
    ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(px(a),py(f(a))); ctx.lineTo(px(b),py(f(b))); ctx.stroke();
    // endpoints
    [[a,f(a)],[b,f(b)]].forEach(([x,y])=>{ctx.fillStyle='#fff';ctx.strokeStyle=col;ctx.lineWidth=2.5;
      ctx.beginPath();ctx.arc(px(x),py(y),6,0,7);ctx.fill();ctx.stroke();});

    $('rConv').textContent = convex ? 'yes' : 'no — chord dips below';
    $('rConv').style.color = convex ? 'var(--accent)' : 'var(--rose)';
    $('rVerdict').textContent = convex ? 'convex on [a, b]' : 'NOT convex on [a, b]';
  }

  document.querySelectorAll('.ctrl[data-fn]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.ctrl[data-fn]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); fn=btn.dataset.fn; draw();
    });
  });
  [sA,sB].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
