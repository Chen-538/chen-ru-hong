(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const EASE = 'cubic-bezier(.22,.61,.36,1)';

  /* 平滑捲動 */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const jump = target => lenis ? lenis.scrollTo(target, { duration: 1.4 }) : target.scrollIntoView();
  $$('[data-jump]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    jump($(a.getAttribute('href')));
  }));

  /* 天色與時鐘：依捲動位置在相鄰章節之間插值 */
  const secs = $$('[data-day]').map(el => {
    const [h, m] = el.dataset.time.split(':').map(Number);
    return { el, min: h * 60 + m, bg: el.dataset.bg, ink: el.dataset.ink, top: 0, id: el.id };
  });
  const rail = $$('.rail a');
  const clock = $('#clock');
  const sunDot = $('#sunDot');
  const measure = () => secs.forEach(s => { s.top = s.el.getBoundingClientRect().top + scrollY; });
  const fmt = v => {
    const m = Math.round(v);
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  };
  function paint() {
    const y = scrollY + innerHeight * .55;
    const band = innerHeight * .4;
    let i = 0;
    while (i < secs.length - 1 && y >= secs[i + 1].top) i++;
    const a = secs[i], b = secs[Math.min(i + 1, secs.length - 1)];
    const p = gsap.utils.clamp(0, 1, (y - (b.top - band)) / band);
    root.style.setProperty('--bg', gsap.utils.interpolate(a.bg, b.bg, p));
    root.style.setProperty('--ink', p < .5 ? a.ink : b.ink);
    let c = 0;
    while (c < secs.length - 1 && scrollY + 2 >= secs[c + 1].top) c++;
    const ca = secs[c], cb = secs[Math.min(c + 1, secs.length - 1)];
    const span = (cb.top - ca.top) || 1;
    clock.textContent = fmt(ca.min + (cb.min - ca.min) * gsap.utils.clamp(0, 1, (scrollY - ca.top) / span));
    const dayP = gsap.utils.clamp(0, 1, y / (secs[secs.length - 1].top || 1));
    sunDot.style.background = dayP > .68 ? '#E4ECF8' : '';
    const onId = '#' + a.id;
    rail.forEach(l => l.classList.toggle('on', l.getAttribute('href') === onId));
  }
  ScrollTrigger.addEventListener('refresh', () => { measure(); paint(); });
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: paint });
  addEventListener('resize', () => { measure(); paint(); });

  /* 大字逐字進場：Hero 由片頭結束時播放 */
  function splitChars(el) {
    el.setAttribute('aria-label', el.textContent.trim());
    const line = document.createElement('span');
    line.className = 'line';
    line.setAttribute('aria-hidden', 'true');
    [...el.textContent.trim()].forEach(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      line.append(s);
    });
    el.replaceChildren(line);
    return $$('.ch', line);
  }
  const heroChars = [];
  $$('[data-chars]').forEach(el => {
    const chars = splitChars(el);
    if (reduce) return;
    if (el.tagName === 'H1') { heroChars.push(...chars); gsap.set(chars, { yPercent: 110 }); return; }
    gsap.from(chars, {
      yPercent: 110, duration: .7, ease: 'power4.out', stagger: .05,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* 內文、照片進場 */
  if (!reduce) {
    $$('[data-reveal]').forEach(el => gsap.from(el, {
      opacity: 0, y: 24, duration: .85, ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    }));
    $$('[data-clip]').forEach(el => gsap.fromTo(el,
      { clipPath: 'inset(100% 0 0 0)' },
      { clipPath: 'inset(0% 0 0 0)', duration: 1.15, ease: 'expo.out', clearProps: 'clipPath',
        scrollTrigger: { trigger: el.parentElement, start: 'top 85%', once: true } }));
    gsap.to('.hero-text', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '#dawn', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* 手繪圈線 */
  $$('[data-rough]').forEach(el => {
    const type = el.dataset.rough;
    const n = RoughNotation.annotate(el, {
      type, color: type === 'highlight' ? 'rgba(240,84,30,.28)' : '#F0541E',
      strokeWidth: 2.5, padding: 3, multiline: true, animationDuration: reduce ? 0 : 800
    });
    ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => n.show() });
  });

  /* 攝影：箭頭與滑桿瀏覽相片帶，直向捲動不受影響 */
  const track = $('#lensTrack'), bar = $('#lensBar');
  const prevBtn = $('#lensPrev'), nextBtn = $('#lensNext');
  const maxX = () => track.scrollWidth - track.clientWidth;
  const syncLens = () => {
    const m = maxX();
    bar.value = m > 0 ? Math.round(track.scrollLeft / m * 1000) : 0;
    prevBtn.disabled = track.scrollLeft <= 1;
    nextBtn.disabled = track.scrollLeft >= m - 1;
  };
  const stepLens = dir => track.scrollBy({ left: dir * track.clientWidth * .6, behavior: reduce ? 'auto' : 'smooth' });
  prevBtn.addEventListener('click', () => stepLens(-1));
  nextBtn.addEventListener('click', () => stepLens(1));
  bar.addEventListener('input', () => { track.scrollLeft = bar.value / 1000 * maxX(); });
  track.addEventListener('scroll', syncLens, { passive: true });
  addEventListener('resize', syncLens);
  syncLens();

  /* 點擊回饋：木工章節噴木屑，其他地方是墨水 */
  const cv = $('#fx'), ctx = cv.getContext('2d');
  let parts = [], running = false;
  const size = () => {
    const d = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * d; cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  size(); addEventListener('resize', size);
  const rnd = (a, b) => a + Math.random() * (b - a);
  function burst(x, y, inWood) {
    if (inWood) {
      const tone = ['#C89B5E', '#A9743A', '#E3C48F', '#8A5B2C'];
      for (let i = 0; i < 26; i++) {
        const a = rnd(-Math.PI, 0), v = rnd(2, 9);
        parts.push({ k: 'dust', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, r: rnd(0, 6.28), vr: rnd(-.3, .3), w: rnd(2, 7), h: rnd(1, 3), c: tone[i % 4], life: 1, fade: rnd(.012, .022) });
      }
    } else {
      const c = getComputedStyle(root).getPropertyValue('--ink').trim();
      parts.push({ k: 'ring', x, y, rad: 2, grow: 3.4, c, life: 1, fade: .03 });
      for (let i = 0; i < 7; i++) {
        const a = rnd(0, 6.28), d = rnd(6, 34);
        parts.push({ k: 'ink', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, rad: rnd(1, 5), grow: rnd(.1, .5), c, life: 1, fade: rnd(.02, .04) });
      }
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life > 0);
    parts.forEach(p => {
      p.life -= p.fade;
      ctx.globalAlpha = Math.max(p.life, 0);
      if (p.k === 'dust') {
        p.vy += .34; p.vx *= .98; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      } else {
        p.rad += p.grow;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, 6.29);
        if (p.k === 'ring') { ctx.strokeStyle = p.c; ctx.lineWidth = 2; ctx.stroke(); } else { ctx.fillStyle = p.c; ctx.fill(); }
      }
    });
    ctx.globalAlpha = 1;
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  if (!reduce) addEventListener('pointerdown', e => burst(e.clientX, e.clientY, !!e.target.closest?.('#wood')));

  /* 23:59 星點：捲近才載入 Three.js，減少動態或沒有 WebGL 就不載 */
  const starCanvas = $('#stars');
  const hasGL = (() => { try { return !!document.createElement('canvas').getContext('webgl'); } catch { return false; } })();
  if (!reduce && hasGL) {
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      import('./stars.js?v=3')
        .then(m => m.default($('#bye'), starCanvas, gsap))
        .then(n => { starCanvas.dataset.points = n; })
        .catch(err => { console.error(err); starCanvas.remove(); });
    }, { rootMargin: '1200px 0px' });
    io.observe($('#bye'));
  } else {
    starCanvas.remove();
  }

  /* 自訂游標 */
  const cur = $('#cur'), ring = $('#ring');
  if (fine && !reduce) {
    root.classList.add('has-cursor');
    const cx = gsap.quickTo(cur, 'x', { duration: .08 }), cy = gsap.quickTo(cur, 'y', { duration: .08 });
    const rx = gsap.quickTo(ring, 'x', { duration: .3, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .3, ease: 'power3' });
    addEventListener('pointermove', e => {
      cx(e.clientX); cy(e.clientY); rx(e.clientX); ry(e.clientY);
    });
  }

  /* 看大圖的光圈轉場，圓心是點擊位置 */
  const wipe = $('#wipe');
  function cover(e, mid) {
    const tl = gsap.timeline();
    wipe.removeAttribute('style');
    wipe.style.display = 'block';
    const done = () => wipe.removeAttribute('style');
    if (reduce) { mid(); done(); return tl; }
    const x = e?.clientX ?? innerWidth / 2, y = e?.clientY ?? innerHeight / 2;
    wipe.style.background = '#FBF8F1';
    tl.fromTo(wipe, { clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)`, duration: .8, ease: 'power2.inOut' })
      .add(mid).to(wipe, { opacity: 0, duration: .25, ease: 'none' }).add(done);
    return tl;
  }

  /* 大圖檢視：可用瀏覽器上一頁關閉 */
  const view = $('#view'), body = $('#viewBody'), main = $('#main');
  let current = null, opener = null, busy = false;
  function fill(data) {
    body.replaceChildren($('#v-shot').content.cloneNode(true));
    $('#shotImg').src = data.src; $('#shotImg').alt = data.cap; $('#shotCap').textContent = data.cap;
    view.scrollTop = 0;
  }
  function show() {
    view.hidden = false;
    main.inert = true;
    lenis?.stop();
    $('#viewClose').focus({ preventScroll: true });
  }
  function hide() {
    view.hidden = true;
    main.inert = false;
    body.replaceChildren();
    lenis?.start();
    opener?.focus({ preventScroll: true });
  }
  function open(e, data) {
    if (busy || current) return;
    busy = true; opener = e?.currentTarget || null;
    current = true;
    cover(e, () => { fill(data); show(); }).eventCallback('onComplete', () => { busy = false; });
    history.pushState({ view: 'shot' }, '', location.pathname);
  }
  function close(fromPop) {
    if (busy || !current) return;
    busy = true;
    current = null;
    cover(null, hide).eventCallback('onComplete', () => { busy = false; });
    if (!fromPop) history.back();
  }
  $$('[data-shot]').forEach(b => b.addEventListener('click', e => open(e, {
    src: `assets/img/${b.dataset.shot}.webp`, cap: b.querySelector('span').textContent
  })));
  $('#viewClose').addEventListener('click', () => close(false));
  addEventListener('keydown', e => { if (e.key === 'Escape') close(false); });
  addEventListener('popstate', () => { if (current) close(true); });

  /* 片頭：05:40 走到 06:40 後拉開 */
  const intro = $('#intro');
  const playHero = () => { if (heroChars.length) gsap.to(heroChars, { yPercent: 0, duration: .9, ease: 'power4.out', stagger: .09 }); };
  if (reduce) {
    intro.remove();
    if (heroChars.length) gsap.set(heroChars, { yPercent: 0 });
  } else {
    const t = { v: 340 };
    lenis?.stop();
    gsap.timeline({ onComplete: () => { intro.remove(); lenis?.start(); } })
      .to(t, { v: 400, duration: 1, ease: 'power2.inOut', onUpdate: () => { $('#introTime').textContent = fmt(t.v); } })
      .to(intro, { yPercent: -100, duration: .75, ease: 'power3.inOut' }, '+=.1')
      .add(playHero, '-=.35');
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
  measure(); paint();
})();
