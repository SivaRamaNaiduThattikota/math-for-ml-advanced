/* Math for ML — shared behaviors for every page.
   Requires assets/sessions.js loaded first (window.MFML_SESSIONS). */
(function(){
  "use strict";
  const SES = window.MFML_SESSIONS || [];
  const GROUPS = window.MFML_GROUPS || {};
  const body = document.body;
  const slug = body.getAttribute("data-slug");     // present on lesson pages
  const BASE = slug ? "../" : "";                   // lessons live one level down
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.MFML_REDUCED = reduced;

  const cur = slug ? SES.findIndex(s => s.slug === slug) : -1;

  // ── site nav bar (built once, injected at top) ──────────────────────────
  function buildNav(){
    const nav = document.createElement("nav");
    nav.id = "sitenav";
    const curLabel = cur >= 0 ? `<span class="cur">Session ${SES[cur].num}</span>` : "";
    let last = null, items = "";
    SES.forEach((s, i) => {
      if (s.group !== last){ items += `<div class="dd-group">${GROUPS[s.group]||""}</div>`; last = s.group; }
      const here = i === cur ? " here" : "";
      const cls = (s.ready ? "dd-item" : "dd-item soon") + here;
      const href = s.ready ? BASE + s.slug + "/theory.html" : null;
      const open = href ? `<a class="${cls}" href="${href}" role="menuitem">` : `<span class="${cls}">`;
      const close = href ? "</a>" : "</span>";
      items += `${open}<b>${s.num}</b> ${s.title}${s.ready ? "" : ' <em>· soon</em>'}${close}`;
    });
    nav.innerHTML = `
      <a class="brand" href="${BASE}index.html">◆ Math for ML <span style="opacity:.6;font-weight:400">· Advanced</span></a>
      <div class="navright">
        ${curLabel}
        <div class="dd">
          <button class="ddbtn" id="ddBtn" aria-haspopup="true" aria-expanded="false">Sessions ▾</button>
          <div class="ddpanel" id="ddPanel" role="menu">${items}</div>
        </div>
        <button id="themeToggle" class="navtoggle" aria-label="Toggle theme">🌙</button>
      </div>`;
    body.insertBefore(nav, body.firstChild);
    const btn = nav.querySelector("#ddBtn"), panel = nav.querySelector("#ddPanel");
    btn.addEventListener("click", e => { e.stopPropagation();
      const open = panel.classList.toggle("open"); btn.setAttribute("aria-expanded", open); });
    document.addEventListener("click", () => { panel.classList.remove("open"); btn.setAttribute("aria-expanded","false"); });
  }
  buildNav();

  // ── theme cycle: Light → Dark → Glass (persisted, shared key) ────────────
  (function(){
    const t = document.getElementById("themeToggle"), root = document.documentElement;
    const ORDER = ["light","dark","glass"];
    const ICON = {light:"☀️", dark:"🌙", glass:"🫧"};
    const TITLE = {light:"Light — click for Dark", dark:"Dark — click for Glass", glass:"Glass — click for Light"};
    const apply = th => { if(th==="light") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", th);
                          t.textContent = ICON[th]; t.title = TITLE[th]; };
    let cur = localStorage.getItem("mfml-theme"); if(!ORDER.includes(cur)) cur = "glass";
    apply(cur);
    t.addEventListener("click", () => {
      cur = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
      apply(cur); localStorage.setItem("mfml-theme", cur);
      // iOS needs an explicit gesture-triggered permission for gyroscope specular
      if (cur === "glass" && typeof DeviceOrientationEvent !== "undefined"
          && typeof DeviceOrientationEvent.requestPermission === "function"){
        DeviceOrientationEvent.requestPermission().catch(() => {});
      }
    });
  })();

  // ── progress tracking helpers ───────────────────────────────────────────
  const doneKey = "mfml-adv-done";   // track-specific progress (theme key stays shared across sites)
  const getDone = () => { try { return JSON.parse(localStorage.getItem(doneKey)) || []; } catch(e) { return []; } };
  const setDone = arr => localStorage.setItem(doneKey, JSON.stringify([...new Set(arr)]));
  window.MFML_getDone = getDone;

  // ── lesson-only chrome: prev/next + mark-complete ───────────────────────
  if (cur >= 0){
    const prev = SES[cur-1], next = SES[cur+1];
    const link = (s, dir) => {
      if (!s) return `<span class="ln-slot"></span>`;
      const href = s.ready ? BASE + s.slug + "/theory.html" : "#";
      const cls = "ln-link ln-"+dir + (s.ready ? "" : " disabled");
      return `<a class="${cls}" href="${href}">
        <span class="ln-dir">${dir==="prev"?"← Previous":"Next →"}</span>
        <span class="ln-title">${s.num} · ${s.title}</span></a>`;
    };
    const isDone = getDone().includes(slug);
    const foot = document.createElement("nav"); foot.id = "lessonnav";
    foot.innerHTML = `
      ${link(prev,"prev")}
      <div class="ln-mid">
        <button id="markDone" class="mark ${isDone?"done":""}">${isDone?"✓ Completed":"Mark complete"}</button>
        <a class="ln-index" href="${BASE}index.html">All sessions</a>
      </div>
      ${link(next,"next")}`;
    const art = document.querySelector("article");
    (art ? art.parentNode : body).appendChild(foot);
    const mk = foot.querySelector("#markDone");
    mk.addEventListener("click", () => {
      let d = getDone();
      if (d.includes(slug)){ d = d.filter(x => x !== slug); mk.classList.remove("done"); mk.textContent="Mark complete"; }
      else { d.push(slug); mk.classList.add("done"); mk.textContent="✓ Completed"; }
      setDone(d);
    });
  }

  // ── reading progress bar ────────────────────────────────────────────────
  const bar = document.getElementById("progress");
  if (bar){
    const onScroll = () => { const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? h.scrollTop / max * 100 : 0) + "%"; };
    document.addEventListener("scroll", onScroll, {passive:true}); onScroll();
  }

  // ── TOC scrollspy ─────────────────────────────────────────────────────────
  const tocLinks = [...document.querySelectorAll("#toc a")];
  if (tocLinks.length){
    const secs = tocLinks.map(a => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
    const spy = () => { let c = secs[0] && secs[0].id, y = scrollY + 150;
      for (const s of secs) if (s.offsetTop <= y) c = s.id;
      tocLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href").slice(1) === c)); };
    document.addEventListener("scroll", spy, {passive:true}); spy();
  }

  // ── scroll up/down ─────────────────────────────────────────────────────────
  const beh = reduced ? "auto" : "smooth";
  const gt = document.getElementById("goTop"), gb = document.getElementById("goBottom");
  if (gt) gt.onclick = () => scrollTo({top:0, behavior:beh});
  if (gb) gb.onclick = () => scrollTo({top:document.documentElement.scrollHeight, behavior:beh});

  // ── copy buttons on code blocks ────────────────────────────────────────────
  document.querySelectorAll("pre.code").forEach(pre => {
    const wrap = document.createElement("div"); wrap.className = "codewrap";
    pre.parentNode.insertBefore(wrap, pre); wrap.appendChild(pre);
    const b = document.createElement("button"); b.className = "copy"; b.textContent = "copy";
    b.onclick = () => navigator.clipboard.writeText(pre.innerText).then(() => {
      b.textContent = "copied"; setTimeout(() => b.textContent = "copy", 1200); });
    wrap.appendChild(b);
  });

  // ── self-check quizzes ─────────────────────────────────────────────────────
  document.querySelectorAll(".quiz").forEach(q => {
    const ans = +q.dataset.answer, opts = [...q.querySelectorAll(".opt")], fb = q.querySelector(".fb");
    opts.forEach((o,i) => o.addEventListener("click", () => {
      opts.forEach(x => x.classList.remove("right","wrong"));
      if (i === ans){ o.classList.add("right"); fb.textContent = "✓ Correct."; }
      else { o.classList.add("wrong"); opts[ans].classList.add("right"); fb.textContent = "Not quite — the highlighted answer is right."; }
    }));
  });

  // ── keyboard shortcuts ─────────────────────────────────────────────────────
  document.addEventListener("keydown", e => {
    if (e.target.matches("input,textarea,select") || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === "t"){ document.getElementById("themeToggle").click(); }
    else if (e.key === "?"){ alert("Shortcuts\n\nt   toggle theme\nj / k   next / prev section\n← / →   prev / next session\ng / G   top / bottom"); }
    else if (cur >= 0 && k === "arrowright" && SES[cur+1] && SES[cur+1].ready){ location.href = BASE+SES[cur+1].slug+"/theory.html"; }
    else if (cur >= 0 && k === "arrowleft"  && SES[cur-1] && SES[cur-1].ready){ location.href = BASE+SES[cur-1].slug+"/theory.html"; }
    else if (e.key === "g"){ scrollTo({top:0, behavior:beh}); }
    else if (e.key === "G"){ scrollTo({top:document.documentElement.scrollHeight, behavior:beh}); }
    else if (k === "j" || k === "k"){ jumpSection(k === "j" ? 1 : -1); }
  });
  // ── scroll-reveal (fluid entrance) ──────────────────────────────────────
  if (!reduced && "IntersectionObserver" in window){
    const targets = document.querySelectorAll(
      "article > h2, article > figure, article > .callout, article > .objectives, " +
      "article > table.sum, article > .quiz, article > .ex, article > .qa, article > ol.rules, article > .next");
    if (targets.length){
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
      }, {rootMargin: "0px 0px -8% 0px", threshold: 0.06});
      targets.forEach(el => { el.classList.add("reveal"); io.observe(el); });
    }
  }

  function jumpSection(dir){
    const hs = [...document.querySelectorAll("h2[id]")]; if (!hs.length) return;
    const y = scrollY + 90; let idx = 0;
    hs.forEach((h,i) => { if (h.offsetTop <= y) idx = i; });
    const t = hs[Math.max(0, Math.min(hs.length-1, idx+dir))];
    if (t) scrollTo({top:t.offsetTop-72, behavior:beh});
  }

  // ── iOS-26 flourishes: refraction · gyro/pointer specular · gel-press · bubble nav ──
  (function(){
    // 1. SVG displacement filter for real backdrop refraction (Chromium)
    document.body.insertAdjacentHTML("beforeend",
      `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="mfml-glass">
         <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="n"/>
         <feGaussianBlur in="n" stdDeviation="1.4" result="nb"/>
         <feDisplacementMap in="SourceGraphic" in2="nb" scale="22" xChannelSelector="R" yChannelSelector="G"/>
       </filter></svg>`);
    const canRefract = window.CSS && CSS.supports &&
      (CSS.supports("backdrop-filter","url(#a) blur(2px)") || CSS.supports("-webkit-backdrop-filter","url(#a) blur(2px)"));
    if (canRefract) document.documentElement.classList.add("can-refract");

    // 2. runtime styles (shared by index + lessons — keeps it DRY)
    const st = document.createElement("style");
    st.textContent = `
      /* refraction: distort the backdrop seen through glass panels */
      html.can-refract[data-theme="glass"] #sitenav,
      html.can-refract[data-theme="glass"] .card,
      html.can-refract[data-theme="glass"] figure.fig .frame{
        -webkit-backdrop-filter:url(#mfml-glass) blur(11px) saturate(180%);
        backdrop-filter:url(#mfml-glass) blur(11px) saturate(180%);
      }
      /* moving specular sheen (pointer on desktop, gyroscope on mobile) */
      html[data-theme="glass"] .card,html[data-theme="glass"] .ringcard,html[data-theme="glass"] .spine,
      html[data-theme="glass"] .callout,html[data-theme="glass"] .objectives,html[data-theme="glass"] .next{
        position:relative; overflow:hidden;
      }
      html[data-theme="glass"] .card::after,html[data-theme="glass"] .ringcard::after,html[data-theme="glass"] .spine::after,
      html[data-theme="glass"] .callout::after,html[data-theme="glass"] .objectives::after,html[data-theme="glass"] .next::after{
        content:""; position:absolute; inset:0; pointer-events:none; z-index:3; mix-blend-mode:screen; opacity:.65;
        background:radial-gradient(180px 180px at var(--mx,50%) var(--my,25%), rgba(255,255,255,.45), transparent 60%);
      }
      /* gel-press: springy squish on tap */
      @media (prefers-reduced-motion: no-preference){
        .cardlink,.dd-item,.ln-link,.mark,.ddbtn,.navtoggle,.btn-anim,.opt,.scrollbtns button,.secnav a{
          transition:transform .18s cubic-bezier(.34,1.56,.64,1), background-color .3s, border-color .3s, box-shadow .3s; }
        .cardlink:active,.dd-item:active,.ln-link:active,.mark:active,.ddbtn:active,.navtoggle:active,
        .btn-anim:active,.opt:active,.scrollbtns button:active,.secnav a:active{ transform:scale(.94); }
      }
      /* bubble page transition */
      #mfml-bubble{position:fixed; z-index:200; border-radius:50%; pointer-events:none; transform:scale(0);
        background:radial-gradient(circle at 38% 32%, rgba(167,139,250,.97), rgba(122,92,240,.98) 52%, rgba(240,128,180,.98));
        box-shadow:0 0 80px rgba(122,92,240,.5); will-change:transform;}
      html[data-theme="glass"] #mfml-bubble{ -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px); }
    `;
    document.head.appendChild(st);

    // 3. specular light source -> CSS vars (pointer + gyroscope)
    const setLight = (px,py) => { const r = document.documentElement.style;
      r.setProperty("--mx", px.toFixed(1)+"%"); r.setProperty("--my", py.toFixed(1)+"%"); };
    if (!reduced){
      addEventListener("pointermove", e => setLight(e.clientX/innerWidth*100, e.clientY/innerHeight*100), {passive:true});
      addEventListener("deviceorientation", ev => { if (ev.gamma == null) return;
        setLight(50 + Math.max(-40,Math.min(40,ev.gamma))/40*50,
                 50 + Math.max(-40,Math.min(40,(ev.beta||45)-45))/40*50); }, true);
    }

    // 4. bubble navigation — expand from click, reveal by contracting on the next page
    function makeBubble(x,y){
      const dx = Math.max(x, innerWidth-x), dy = Math.max(y, innerHeight-y), R = Math.hypot(dx,dy);
      const b = document.createElement("div"); b.id = "mfml-bubble";
      b.style.width = b.style.height = (R*2)+"px"; b.style.left = (x-R)+"px"; b.style.top = (y-R)+"px";
      document.body.appendChild(b); return b;
    }
    // reveal on arrival
    try{
      const navRaw = sessionStorage.getItem("mfml-nav");
      if (navRaw && !reduced){
        sessionStorage.removeItem("mfml-nav");
        const {x,y,t} = JSON.parse(navRaw);
        if (Date.now()-t < 4000){
          const b = makeBubble(x,y);
          const a = b.animate([{transform:"scale(1)"},{transform:"scale(0)"}],
            {duration:520, easing:"cubic-bezier(.4,0,.2,1)", fill:"forwards"});
          a.onfinish = () => b.remove();
        }
      }
    }catch(e){}
    // expand on departure
    document.addEventListener("click", e => {
      if (reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      let url; try { url = new URL(href, location.href); } catch(_) { return; }
      if (url.origin !== location.origin || !/\.html(\?|#|$)/.test(url.pathname + url.search + url.hash)) return;
      if (url.href === location.href.split("#")[0]) return;
      e.preventDefault();
      const x = e.clientX || innerWidth/2, y = e.clientY || innerHeight/2;
      sessionStorage.setItem("mfml-nav", JSON.stringify({x, y, t: Date.now()}));
      const b = makeBubble(x,y);
      let done = false; const go = () => { if (!done){ done = true; location.href = url.href; } };
      b.animate([{transform:"scale(0)"},{transform:"scale(1)"}],
        {duration:460, easing:"cubic-bezier(.4,0,.2,1)", fill:"forwards"}).onfinish = go;
      setTimeout(go, 620); // safety
    }, true);
  })();
})();
