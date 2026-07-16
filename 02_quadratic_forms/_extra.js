/* Session 2 — quadratic-form landscape q(x)=x^T A x as a heatmap, with eigen-axes. */
(function(){
  const cv = document.getElementById('qform'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, O = {x:W*0.5, y:H*0.52}, S = 46, STEP = 3;
  const $ = id => document.getElementById(id);
  const sA11=$('sA11'), sA22=$('sA22'), sA12=$('sA12');
  const px = p => ({x:O.x + p.x*S, y:O.y - p.y*S});

  function eigSym(a,b,c){
    const tr=a+c, disc=Math.sqrt(((a-c)/2)**2 + b*b);
    const l1=tr/2+disc, l2=tr/2-disc;
    let v1 = Math.abs(b)>1e-9 ? [l1-c,b] : (a>=c?[1,0]:[0,1]);
    const n=Math.hypot(v1[0],v1[1])||1; v1=[v1[0]/n, v1[1]/n];
    return {l1,l2,v1,v2:[-v1[1],v1[0]]};
  }
  function lerp(u,v,t){return [u[0]+(v[0]-u[0])*t, u[1]+(v[1]-u[1])*t, u[2]+(v[2]-u[2])*t];}
  const LIGHT=[250,248,243], WARM=[176,117,20], COOL=[14,140,128];

  function arrow(f,t,col){
    ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=3.5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(f.x,f.y); ctx.lineTo(t.x,t.y); ctx.stroke();
    const an=Math.atan2(t.y-f.y,t.x-f.x), h=12;
    ctx.beginPath(); ctx.moveTo(t.x,t.y);
    ctx.lineTo(t.x-h*Math.cos(an-0.42), t.y-h*Math.sin(an-0.42));
    ctx.lineTo(t.x-h*Math.cos(an+0.42), t.y-h*Math.sin(an+0.42));
    ctx.closePath(); ctx.fill();
  }

  function draw(){
    const a=parseFloat(sA11.value), c=parseFloat(sA22.value), b=parseFloat(sA12.value);
    // pass 1: find max |q| for normalization
    let maxAbs=1e-6;
    for(let sx=0;sx<W;sx+=STEP){ for(let sy=0;sy<H;sy+=STEP){
      const x=(sx-O.x)/S, y=(O.y-sy)/S;
      const q=a*x*x + 2*b*x*y + c*y*y;
      if(Math.abs(q)>maxAbs) maxAbs=Math.abs(q);
    }}
    // pass 2: paint
    for(let sx=0;sx<W;sx+=STEP){ for(let sy=0;sy<H;sy+=STEP){
      const x=(sx-O.x)/S, y=(O.y-sy)/S;
      const q=a*x*x + 2*b*x*y + c*y*y;
      const t=Math.max(-1,Math.min(1, q/maxAbs));
      const col = t>=0 ? lerp(LIGHT,WARM,Math.pow(t,0.7)) : lerp(LIGHT,COOL,Math.pow(-t,0.7));
      // white-ish band near zero level
      const near = Math.abs(q) < maxAbs*0.012 ? 1 : 0;
      ctx.fillStyle = near ? 'rgba(255,255,255,0.95)'
        : `rgb(${col[0]|0},${col[1]|0},${col[2]|0})`;
      ctx.fillRect(sx,sy,STEP,STEP);
    }}
    // axes
    ctx.strokeStyle='rgba(38,37,46,.25)'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,O.y);ctx.lineTo(W,O.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(O.x,0);ctx.lineTo(O.x,H);ctx.stroke();
    // eigenvectors (axes of the landscape)
    const {l1,l2,v1,v2}=eigSym(a,b,c), L=2.7;
    arrow(O, px({x:v1[0]*L, y:v1[1]*L}), '#5A4FCF');
    arrow(O, px({x:v2[0]*L, y:v2[1]*L}), '#211D33');
    // readout
    $('rA11').textContent=a.toFixed(1); $('rA22').textContent=c.toFixed(1);
    $('rA12').textContent=b.toFixed(1); $('rA12b').textContent=b.toFixed(1);
    $('rEig').textContent = l1.toFixed(2)+', '+l2.toFixed(2);
    const eps=1e-6; let shape;
    if(l1>eps && l2>eps) shape='bowl (PD)';
    else if(l1>eps && l2<-eps) shape='saddle (indefinite)';
    else if(l1<-eps && l2<-eps) shape='dome (ND)';
    else if(Math.abs(l2)<=eps && l1>eps) shape='valley (PSD)';
    else if(Math.abs(l1)<=eps && l2<-eps) shape='ridge (NSD)';
    else shape='flat';
    $('rShape').textContent=shape;
  }

  [sA11,sA22,sA12].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
