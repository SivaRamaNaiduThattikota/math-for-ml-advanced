/* Session 1 — symmetric matrix acting on the unit circle, with live eigenvectors. */
(function(){
  const cv = document.getElementById('eigplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, O = {x:W*0.5, y:H*0.52}, S = 62;
  const $ = id => document.getElementById(id);
  const sA11=$('sA11'), sA22=$('sA22'), sA12=$('sA12');

  const px = p => ({x:O.x + p.x*S, y:O.y - p.y*S});

  function eigSym(a,b,c){
    // eigenvalues/vectors of [[a,b],[b,c]]
    const tr=a+c, disc=Math.sqrt(((a-c)/2)**2 + b*b);
    const l1=tr/2+disc, l2=tr/2-disc;         // l1 >= l2
    let v1;
    if(Math.abs(b)>1e-9)      v1=[l1-c, b];
    else if(Math.abs(a-c)>1e-9) v1=(a>=c)?[1,0]:[0,1];
    else                      v1=[1,0];        // isotropic
    const n1=Math.hypot(v1[0],v1[1]); v1=[v1[0]/n1, v1[1]/n1];
    const v2=[-v1[1], v1[0]];                  // orthogonal (symmetric ⇒ perpendicular)
    return {l1,l2,v1,v2};
  }

  function arrow(f,t,col,w){
    ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=w; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(f.x,f.y); ctx.lineTo(t.x,t.y); ctx.stroke();
    const an=Math.atan2(t.y-f.y,t.x-f.x), h=12;
    ctx.beginPath(); ctx.moveTo(t.x,t.y);
    ctx.lineTo(t.x-h*Math.cos(an-0.42), t.y-h*Math.sin(an-0.42));
    ctx.lineTo(t.x-h*Math.cos(an+0.42), t.y-h*Math.sin(an+0.42));
    ctx.closePath(); ctx.fill();
  }

  function grid(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let x=O.x%S;x<W;x+=S){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=O.y%S;y<H;y+=S){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(0,O.y);ctx.lineTo(W,O.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(O.x,0);ctx.lineTo(O.x,H);ctx.stroke();
  }

  function draw(){
    const a=parseFloat(sA11.value), c=parseFloat(sA22.value), b=parseFloat(sA12.value);
    grid();
    // faint unit circle
    ctx.strokeStyle='#B9B4C8'; ctx.lineWidth=1.5; ctx.setLineDash([5,5]);
    ctx.beginPath();
    for(let i=0;i<=90;i++){const t=i/90*2*Math.PI; const q=px({x:Math.cos(t),y:Math.sin(t)}); i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
    ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
    // transformed ellipse  q = A * (cos t, sin t)
    ctx.beginPath();
    for(let i=0;i<=120;i++){
      const t=i/120*2*Math.PI, cx=Math.cos(t), cy=Math.sin(t);
      const q=px({x:a*cx+b*cy, y:b*cx+c*cy});
      i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);
    }
    ctx.closePath();
    ctx.fillStyle='rgba(90,79,207,.10)'; ctx.fill();
    ctx.strokeStyle='#5A4FCF'; ctx.lineWidth=2.5; ctx.stroke();
    // eigenvectors as principal axes, length = |lambda|
    const {l1,l2,v1,v2}=eigSym(a,b,c);
    arrow(O, px({x:v1[0]*l1, y:v1[1]*l1}), '#5A4FCF', 3.5);
    arrow(O, px({x:v2[0]*l2, y:v2[1]*l2}), '#0E8C80', 3.5);
    // readouts
    $('rA11').textContent=a.toFixed(1); $('rA22').textContent=c.toFixed(1);
    $('rA12').textContent=b.toFixed(1); $('rA12b').textContent=b.toFixed(1);
    $('rL1').textContent=l1.toFixed(2); $('rL2').textContent=l2.toFixed(2);
    const dot=Math.abs(v1[0]*v2[0]+v1[1]*v2[1]);
    $('rOrth').textContent = dot<1e-6 ? 'yes ⟂' : 'no';
  }

  [sA11,sA22,sA12].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
