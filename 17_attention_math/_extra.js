/* Session 17 — attention weight matrix: temperature (scaling) + causal mask. */
(function(){
  const cv = document.getElementById('attnplay'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, PAD = 60, NTOK = 7, D = 8;
  const $ = id => document.getElementById(id);
  const sTemp = $('sTemp'), maskBtn = $('maskBtn');
  let causal = false;

  // fixed seeded Q, K
  function mk(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296*2-1; }; }
  const r=mk(4242);
  const Q=[],K=[];
  for(let i=0;i<NTOK;i++){const q=[],k=[]; for(let j=0;j<D;j++){q.push(r());k.push(r());} Q.push(q);K.push(k);}
  const dot=(a,b)=>{let s=0;for(let j=0;j<D;j++)s+=a[j]*b[j];return s;};

  function draw(){
    const temp=parseFloat(sTemp.value);
    // scores, scaled by 1/temp, optional causal mask, softmax rows
    const A=[];
    for(let i=0;i<NTOK;i++){
      const row=[]; let mx=-Infinity;
      for(let j=0;j<NTOK;j++){ let s=(causal&&j>i)? -Infinity : dot(Q[i],K[j])/temp; row.push(s); if(s>mx)mx=s; }
      let sum=0; const e=row.map(s=> s===-Infinity?0:Math.exp(s-mx)); e.forEach(v=>sum+=v);
      A.push(e.map(v=>v/(sum||1)));
    }
    const cell=Math.min((W-2*PAD)/NTOK,(H-2*PAD)/NTOK);
    const x0=(W-cell*NTOK)/2, y0=PAD;
    ctx.clearRect(0,0,W,H);
    ctx.font='11px JetBrains Mono, monospace'; ctx.textAlign='center';
    for(let i=0;i<NTOK;i++){
      ctx.fillStyle='#9C99A6';
      ctx.fillText('t'+(i+1), x0-18, y0+i*cell+cell/2+4);   // row labels (queries)
      ctx.fillText('t'+(i+1), x0+i*cell+cell/2, y0-10);     // col labels (keys)
      for(let j=0;j<NTOK;j++){
        const w=A[i][j];
        ctx.fillStyle=`rgba(90,79,207,${0.06+0.94*w})`;
        ctx.fillRect(x0+j*cell+1, y0+i*cell+1, cell-2, cell-2);
        if(w>0.18){ ctx.fillStyle = w>0.55?'#fff':'#26252E'; ctx.fillText(w.toFixed(2), x0+j*cell+cell/2, y0+i*cell+cell/2+4); }
      }
    }
    ctx.fillStyle='#6E6C7A'; ctx.textAlign='left';
    ctx.fillText('query (row) attends to key (column) — each row sums to 1', x0, y0+cell*NTOK+26);
    $('rSum').textContent='1.00';
    $('rBeh').textContent = temp<0.55 ? 'sharp — hard lookup (near one-hot)' : temp>1.8 ? 'flat — averaging' : 'balanced';
    $('rBeh').style.color = (temp<0.55||temp>1.8)?'var(--accent)':'var(--muted)';
  }
  maskBtn.addEventListener('click',()=>{ causal=!causal; maskBtn.textContent='causal mask: '+(causal?'on':'off'); maskBtn.classList.toggle('active',causal); draw(); });
  sTemp.addEventListener('input',draw); draw();
})();
