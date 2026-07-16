/* Session 4 — condition number as the axis ratio of the image ellipse. */
(function(){
  const cv = document.getElementById('condplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, O = {x:W*0.5, y:H*0.52}, S = 150;
  const $ = id => document.getElementById(id);
  const sSmax=$('sSmax'), sSmin=$('sSmin');

  function draw(){
    let smax=parseFloat(sSmax.value), smin=parseFloat(sSmin.value);
    const hi=Math.max(smax,smin), lo=Math.min(smax,smin);
    const kappa = hi/lo;
    ctx.clearRect(0,0,W,H);
    // grid + axes
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let x=O.x% (S/2);x<W;x+=S/2){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=O.y% (S/2);y<H;y+=S/2){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(0,O.y);ctx.lineTo(W,O.y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(O.x,0);ctx.lineTo(O.x,H);ctx.stroke();
    // faint unit circle (inputs)
    ctx.strokeStyle='#B9B4C8'; ctx.lineWidth=1.5; ctx.setLineDash([5,5]);
    ctx.beginPath();
    for(let i=0;i<=90;i++){const t=i/90*2*Math.PI; const x=O.x+Math.cos(t)*S, y=O.y-Math.sin(t)*S; i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
    // image ellipse (outputs): semi-axes smax (x), smin (y)
    ctx.beginPath();
    for(let i=0;i<=120;i++){const t=i/120*2*Math.PI; const x=O.x+smax*Math.cos(t)*S, y=O.y-smin*Math.sin(t)*S; i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.closePath();
    const bad = kappa>=1e6;
    ctx.fillStyle = bad ? 'rgba(193,58,87,.12)' : 'rgba(90,79,207,.10)';
    ctx.fill();
    ctx.strokeStyle = bad ? '#C13A57' : '#5A4FCF'; ctx.lineWidth=2.5; ctx.stroke();
    // semi-axes arrows
    function arrow(dx,dy,col){ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=3.5;ctx.lineCap='round';
      const tx=O.x+dx, ty=O.y-dy; ctx.beginPath();ctx.moveTo(O.x,O.y);ctx.lineTo(tx,ty);ctx.stroke();
      const an=Math.atan2(-dy,dx),h=11; ctx.beginPath();ctx.moveTo(tx,ty);
      ctx.lineTo(tx-h*Math.cos(an-0.42),ty-h*Math.sin(an-0.42));
      ctx.lineTo(tx-h*Math.cos(an+0.42),ty-h*Math.sin(an+0.42));ctx.closePath();ctx.fill();}
    arrow(smax*S,0,'#5A4FCF');       // long axis
    arrow(0,smin*S,'#0E8C80');       // short axis
    // readouts
    $('rKappa').textContent = kappa.toFixed(kappa<100?2:0);
    $('rDigits').textContent = Math.log10(kappa).toFixed(1);
    $('rStat').textContent = kappa<10 ? 'well-conditioned'
      : kappa<1e4 ? 'moderate' : kappa<1e8 ? 'ill-conditioned' : 'near-singular';
  }
  [sSmax,sSmin].forEach(s=>s && s.addEventListener('input',draw));
  draw();
})();
