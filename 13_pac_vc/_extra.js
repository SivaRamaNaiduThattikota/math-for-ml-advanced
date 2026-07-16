/* Session 13 — bias–variance: many polynomial fits (of a chosen degree) over the truth. */
(function(){
  const cv = document.getElementById('bvplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 40;
  const $ = id => document.getElementById(id);
  const sDeg = $('sDeg');
  const f = x => Math.sin(2*Math.PI*x);
  const YLO=-2.2, YHI=2.2, XLO=0, XHI=1;

  // small linear-algebra: solve A x = b (Gaussian elimination), and polyfit via normal equations
  function solve(A,b){
    const n=b.length; const M=A.map((r,i)=>r.concat([b[i]]));
    for(let c=0;c<n;c++){
      let p=c; for(let r=c+1;r<n;r++) if(Math.abs(M[r][c])>Math.abs(M[p][c])) p=r;
      [M[c],M[p]]=[M[p],M[c]];
      const piv=M[c][c]||1e-12;
      for(let r=0;r<n;r++){ if(r===c) continue; const fac=M[r][c]/piv;
        for(let k=c;k<=n;k++) M[r][k]-=fac*M[c][k]; }
    }
    return M.map((r,i)=>r[n]/(r[i]||1e-12));
  }
  function polyfit(xs,ys,deg){
    const m=deg+1, n=xs.length;
    const V=xs.map(x=>{const row=[]; let p=1; for(let j=0;j<m;j++){row.push(p); p*=x;} return row;});
    const A=Array.from({length:m},()=>new Array(m).fill(0)), b=new Array(m).fill(0);
    for(let i=0;i<m;i++){ for(let j=0;j<m;j++){ let s=0; for(let k=0;k<n;k++) s+=V[k][i]*V[k][j]; A[i][j]=s; }
      let sb=0; for(let k=0;k<n;k++) sb+=V[k][i]*ys[k]; b[i]=sb; }
    return solve(A,b);
  }
  const evalp=(c,x)=>{let y=0; for(let j=c.length-1;j>=0;j--) y=y*x+c[j]; return y;};

  // seeded PRNG + normal (deterministic per render)
  function mk(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }

  function draw(){
    const deg=parseInt(sDeg.value);
    const rand=mk(777); const nrm=()=>{const u1=Math.max(1e-9,rand()),u2=rand(); return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);};
    const px = x => PAD + (x-XLO)/(XHI-XLO)*(W-2*PAD);
    const py = y => H-PAD - (Math.max(YLO,Math.min(YHI,y))-YLO)/(YHI-YLO)*(H-2*PAD);
    ctx.clearRect(0,0,W,H);
    // grid + zero line
    ctx.strokeStyle='#EDEAE0'; ctx.lineWidth=1;
    for(let g=0;g<=10;g++){const x=px(g/10);ctx.beginPath();ctx.moveTo(x,PAD);ctx.lineTo(x,H-PAD);ctx.stroke();}
    ctx.strokeStyle='#C9C4B6'; ctx.lineWidth=1.3; ctx.beginPath();ctx.moveTo(PAD,py(0));ctx.lineTo(W-PAD,py(0));ctx.stroke();

    // fit many samples; collect predictions on a test grid
    const T=14, n=20, sigma=0.3, G=60;
    const xt=[]; for(let i=0;i<=G;i++) xt.push(i/G);
    const allPreds=[];
    ctx.strokeStyle='rgba(90,79,207,.32)'; ctx.lineWidth=1.6;
    for(let t=0;t<T;t++){
      const xs=[],ys=[]; for(let i=0;i<n;i++){const x=rand(); xs.push(x); ys.push(f(x)+sigma*nrm());}
      const c=polyfit(xs,ys,deg);
      const preds=xt.map(x=>evalp(c,x)); allPreds.push(preds);
      ctx.beginPath(); xt.forEach((x,i)=>{const q={x:px(x),y:py(preds[i])}; i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}); ctx.stroke();
    }
    // true function (teal, bold)
    ctx.strokeStyle='#0E8C80'; ctx.lineWidth=3.5; ctx.beginPath();
    for(let i=0;i<=200;i++){const x=i/200; const q={x:px(x),y:py(f(x))}; i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
    ctx.stroke();
    // bias^2 / variance on the grid
    let bias2=0, varc=0;
    for(let i=0;i<=G;i++){ let m=0; for(let t=0;t<T;t++) m+=allPreds[t][i]; m/=T;
      bias2+=(m-f(xt[i]))**2; let v=0; for(let t=0;t<T;t++) v+=(allPreds[t][i]-m)**2; varc+=v/T; }
    bias2/=(G+1); varc/=(G+1);
    $('rBias').textContent = bias2.toFixed(3);
    $('rVar').textContent = varc>99 ? varc.toExponential(1) : varc.toFixed(3);
    $('rVerd').textContent = deg<=2 ? 'underfit — high bias' : (varc>0.15 ? 'overfit — high variance' : 'balanced ✓');
    $('rVerd').style.color = (deg<=2 || varc>0.15) ? 'var(--rose)' : 'var(--accent)';
  }
  sDeg.addEventListener('input',draw); draw();
})();
