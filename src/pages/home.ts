import { boot, setAuraKeys, getAuraAngle, gsap, ScrollTrigger, SplitText, reduceMotion, getLenis, splitReadable, lightWords } from '../core'
import { CASES, SECTORS, type Case } from '../data'
import { ICONS } from '../icons'

renderCases()
renderSectors()

await boot('home')

// ============================================================
// HERO — tre keyword, poi l'ecosistema Adveny: il logo originale
// al centro e tre anelli concentrici, uno per keyword, che girano.
// ============================================================
const hero = document.querySelector<HTMLElement>('[data-hero]')!
const words = Array.from(hero.querySelectorAll<HTMLElement>('[data-word]'))
const we = hero.querySelector<HTMLElement>('[data-we]')!
const logo = hero.querySelector<HTMLElement>('[data-logo]')!
const svg = hero.querySelector<SVGSVGElement>('[data-rings]')!
const bars = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-progress] i'))
const hint = hero.querySelector<HTMLElement>('[data-hero-hint]')!

// anello interno → esterno; ogni anello ha una sola pillola che lo percorre.
// Le pillole partono tutte sopra il centro (270° = in alto): così le keyword
// che arrivano dopo non ci finiscono sopra.
const RINGS = [
  { r: 196, dur: 34, dir: 1, start: 232 },
  { r: 276, dur: 48, dir: -1, start: 302 },
  { r: 356, dur: 64, dir: 1, start: 264 },
]
const NS = 'http://www.w3.org/2000/svg'
// gli anelli si colorano come le luci di sfondo: chiari e viola dal lato
// delle luci, quasi spenti a metà. Il gradiente gira insieme alle luci.
const ringGrad = document.createElementNS(NS, 'linearGradient')
ringGrad.id = 'ringgrad'
ringGrad.setAttribute('x1', '1')
ringGrad.setAttribute('x2', '0')
;[
  [0, '#e2d8ff', 0.42], [0.24, '#9b3dff', 0.34], [0.5, '#ffffff', 0.05], [0.76, '#9b3dff', 0.34], [1, '#e2d8ff', 0.42],
].forEach(([o, c, a]) => {
  const st = document.createElementNS(NS, 'stop')
  st.setAttribute('offset', String(o))
  st.setAttribute('stop-color', String(c))
  st.setAttribute('stop-opacity', String(a))
  ringGrad.append(st)
})
const defs = document.createElementNS(NS, 'defs')
defs.append(ringGrad)
svg.append(defs)
let ringDeg = NaN
const tintRings = () => {
  const d = Math.round(getAuraAngle() * 4) / 4
  if (d === ringDeg) return
  ringDeg = d
  ringGrad.setAttribute('gradientTransform', `rotate(${d} 0.5 0.5)`)
}
RINGS.forEach((ring) => {
  const c = document.createElementNS(NS, 'circle')
  c.setAttribute('class', 'ring__line')
  c.setAttribute('r', String(ring.r))
  c.setAttribute('pathLength', '1')
  svg.append(c)
})

// le pillole sono HTML sopra l'svg: girano sul cerchio ma il testo resta dritto
const ecoEl = hero.querySelector<HTMLElement>('[data-eco]')!
const pills = Array.from(hero.querySelectorAll<HTMLElement>('[data-pill]'))
let heroVisible = true
const placePills = (time: number) => {
  const half = ecoEl.clientWidth / 2
  const k = half / 400 // da unità del viewBox a pixel
  pills.forEach((pill, i) => {
    const ring = RINGS[i]
    const a = ((ring.start + (ring.dir * 360 * time) / ring.dur) * Math.PI) / 180
    pill.style.transform = `translate(-50%, -50%) translate(${(Math.cos(a) * ring.r * k).toFixed(1)}px, ${(Math.sin(a) * ring.r * k).toFixed(1)}px)`
  })
}
// le pillole restano ferme finché non arrivano gli anelli, poi iniziano a girare
let orbitT = 0
placePills(0)

// lettere delle keyword e di "We are" dentro maschere
const wordSplits = words.map((w) => SplitText.create(w, { type: 'words,chars', mask: 'words' }))
const weSplit = SplitText.create(we, { type: 'chars', mask: 'chars' })

// dove deve atterrare la keyword i per diventare la sua pillola (rispetto al centro)
const landing = (i: number) => {
  const k = ecoEl.clientWidth / 2 / 400
  const a = (RINGS[i].start * Math.PI) / 180
  const word = words[i]
  const pad = parseFloat(getComputedStyle(word).paddingLeft) * 2
  const pill = pills[i].firstElementChild as HTMLElement
  return {
    x: Math.cos(a) * RINGS[i].r * k,
    y: Math.sin(a) * RINGS[i].r * k,
    scale: (pill.offsetWidth - parseFloat(getComputedStyle(pill).paddingLeft) * 2) / Math.max(1, word.offsetWidth - pad),
  }
}

const STEP = 3 // durata di ogni keyword nella timeline
const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
pills.forEach((p) => gsap.set(p.firstElementChild, { opacity: 0 }))
wordSplits.forEach((s, i) => {
  const at = i * STEP
  const pill = pills[i].firstElementChild as HTMLElement
  heroTl.fromTo(s.chars, { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: { amount: 0.4 } }, at)
  // la keyword si rimpicciolisce e vola sul suo anello...
  heroTl.fromTo(words[i], { x: 0, y: 0, scale: 1, opacity: 1 }, {
    x: () => landing(i).x, y: () => landing(i).y, scale: () => landing(i).scale,
    duration: 1.1, ease: 'power3.inOut', immediateRender: false,
  }, at + 1.9)
  // ...e lì diventa la mini card
  heroTl.to(words[i], { opacity: 0, duration: 0.3, ease: 'none' }, at + 2.8)
  heroTl.fromTo(pill, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.45, immediateRender: false }, at + 2.75)
})
const eco = 3 * STEP
heroTl.fromTo(weSplit.chars, { yPercent: 115 }, { yPercent: 0, duration: 0.8, stagger: { amount: 0.2 } }, eco)
// il logo entra con una maschera: nel frame finale resta identico all'originale
heroTl.fromTo(logo, { clipPath: 'inset(100% 0% 0% 0%)', y: 24 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1 }, eco + 0.2)
// gli anelli si disegnano passando sotto le card già posizionate
svg.querySelectorAll('.ring__line').forEach((line, i) => {
  heroTl.fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, eco + 0.6 + i * 0.3)
})
const ORBIT_FROM = eco + 1.6
// al resize le destinazioni delle card vanno ricalcolate
addEventListener('resize', () => {
  const t = heroTl.time()
  heroTl.invalidate().time(t)
})
if (!reduceMotion) {
  gsap.ticker.add((_t, dt) => {
    if (!heroVisible) return
    // tornando indietro con lo scroll le card rientrano dolcemente al loro posto
    orbitT = heroTl.time() >= ORBIT_FROM ? orbitT + dt / 1000 : orbitT * 0.88
    placePills(orbitT)
    tintRings()
  })
}
tintRings()
heroTl.to({}, { duration: 1.2 }) // pausa sul frame finale

hero.classList.add('is-ready')
const heroEnd = heroTl.duration()
const syncBars = () => {
  const t = heroTl.time()
  bars.forEach((b, i) => b.style.setProperty('--p', String(Math.min(1, Math.max(0, (t - i * STEP) / (i < 3 ? 2.1 : 2))))))
  hint.style.opacity = t > INTRO + 0.2 ? '0' : '1'
}

// la prima keyword entra da sola al caricamento; lo scroll guida il resto
const INTRO = 1.2

// luci di sfondo: durante le keyword restano ai bordi e si avvicinano a ogni
// parola; quando entra il logo si fermano nella composizione del brand
setAuraKeys(() => {
  const top = hero.offsetTop
  const range = hero.offsetHeight - innerHeight
  const at = (t: number) => top + ((t - INTRO) / (heroEnd - INTRO)) * range
  return [
    { at: 0, spread: 1.16, turn: -40 },
    { at: at(eco + 1.4), spread: 1, turn: 0 },
    { at: top + range, spread: 1, turn: 4 },
    { at: top + range + innerHeight, spread: 1.28, turn: 14 },
  ]
})
if (reduceMotion) {
  hero.classList.add('is-static')
  heroTl.progress(1)
  syncBars()
} else {
  heroTl.tweenFromTo(0, INTRO, { delay: 0.3, onUpdate: syncBars })
  const proxy = { t: INTRO }
  gsap.to(proxy, {
    t: heroEnd, ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    onUpdate: () => {
      // non interrompere l'intro se l'utente non ha ancora scrollato
      if (proxy.t <= INTRO + 0.001 && heroTl.time() < INTRO) return
      heroTl.time(proxy.t)
      syncBars()
    },
  })
}
// passando col mouse sulla hero si accende un fascio di luce come quelle di
// sfondo; sta sotto keyword e logo, che sopra la luce si invertono (difference)
const stage = hero.querySelector<HTMLElement>('.hero__stage')!
const lightEl = (cls: string) => {
  const el = document.createElement('i')
  el.className = cls
  el.setAttribute('aria-hidden', 'true')
  el.append(document.createElement('b'))
  return el
}
const cursorLight = [lightEl('hero__light'), lightEl('hero__tint')]
stage.prepend(cursorLight[0])
ecoEl.after(cursorLight[1])
const setLight = (on: boolean) => cursorLight.forEach((el) => el.classList.toggle('is-on', on))
if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const ease = reduceMotion ? 0.01 : 0.9
  const xTo = gsap.quickTo(cursorLight, 'x', { duration: ease, ease: 'power3' })
  const yTo = gsap.quickTo(cursorLight, 'y', { duration: ease, ease: 'power3' })
  stage.addEventListener('pointerenter', (e) => {
    // se era spento nasce sotto il puntatore, altrimenti continua a seguirlo
    if (!cursorLight[0].classList.contains('is-on')) {
      xTo(e.clientX, e.clientX)
      yTo(e.clientY, e.clientY)
    }
    setLight(true)
  })
  stage.addEventListener('pointermove', (e) => {
    xTo(e.clientX)
    yTo(e.clientY)
  })
  stage.addEventListener('pointerleave', () => setLight(false))
  // effetto liquido: la luce si allunga nella direzione in cui si muove
  if (!reduceMotion) {
    let px = 0, py = 0, stretch = 0, angle = 0
    gsap.ticker.add(() => {
      if (!heroVisible) return
      const x = gsap.getProperty(cursorLight[0], 'x') as number
      const y = gsap.getProperty(cursorLight[0], 'y') as number
      const dx = x - px, dy = y - py
      px = x
      py = y
      const speed = Math.hypot(dx, dy)
      // la forma è simmetrica: basta ruotare di al massimo 90° verso la nuova direzione
      if (speed > 0.5) {
        const target = (Math.atan2(dy, dx) * 180) / Math.PI
        const diff = ((((target - angle) % 180) + 270) % 180) - 90
        angle += diff * 0.15
      }
      stretch += (Math.min(speed / 40, 0.45) - stretch) * 0.12
      gsap.set(cursorLight, { rotation: angle, scaleX: 1 + stretch, scaleY: 1 - stretch * 0.45 })
    })
  }
}

// gli anelli girano solo quando la hero è visibile
new IntersectionObserver(([e]) => {
  heroVisible = e.isIntersecting
  if (!e.isIntersecting) setLight(false)
}).observe(hero)

// ============================================================
// FRASI DEL METODO — restano ferme a schermo: ogni riga entra da
// sinistra, una alla volta, e si colora parola per parola mentre si legge
// ============================================================
const statement = document.querySelector<HTMLElement>('[data-statement]')!
const lines = Array.from(statement.querySelectorAll<HTMLElement>('[data-line]'))
const lineWords = lines.map((l) => splitReadable(l))
const stBar = statement.querySelector<HTMLElement>('[data-statement-bar]')!
// ogni riga ha una finestra di scroll proporzionale alle sue parole
const REVEAL = 0.05
const total = lineWords.reduce((n, w) => n + w.length, 0)
let cursor = 0.04
const windows = lineWords.map((w) => {
  const len = (w.length / total) * 0.62
  const win = { start: cursor, end: cursor + REVEAL + len }
  cursor = win.end + 0.02
  return win
})
const renderStatement = (p: number) => {
  lines.forEach((line, i) => {
    const { start, end } = windows[i]
    const r = gsap.utils.clamp(0, 1, (p - start) / REVEAL)
    const e = 1 - Math.pow(1 - r, 3)
    line.style.clipPath = `inset(-20% ${(100 - e * 100).toFixed(2)}% -20% 0%)`
    line.style.transform = `translateX(${((1 - e) * -40).toFixed(1)}px)`
    line.style.opacity = String(Math.min(1, r * 1.5))
    lightWords(lineWords[i], gsap.utils.clamp(0, 1, (p - start - REVEAL * 0.6) / (end - start - REVEAL * 0.6)))
  })
  stBar.style.transform = `scaleX(${p.toFixed(3)})`
}
if (reduceMotion) {
  statement.style.height = 'auto'
  renderStatement(1)
} else {
  renderStatement(0)
  ScrollTrigger.create({
    trigger: statement, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: (st) => renderStatement(st.progress),
  })
}

// ---------- cosa facciamo: ogni riga si traccia e il nome scorre dentro ----------
if (!reduceMotion) {
  document.querySelectorAll<HTMLElement>('.svc-grid li').forEach((li) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 88%', once: true } })
    tl.fromTo(li, { '--l': 0 }, { '--l': 1, duration: 1.2, ease: 'power3.inOut' })
      .from(li.querySelector('small'), { opacity: 0, x: -10, duration: 0.6 }, 0.2)
      .from(li.querySelector('span'), { clipPath: 'inset(-20% 100% -20% 0%)', x: -24, duration: 1.1, ease: 'expo.out' }, 0.25)
  })
}

// ---------- metodo: il verbo si scrive da sinistra, poi il resto ----------
if (!reduceMotion) {
  document.querySelectorAll<HTMLElement>('.method__card').forEach((card) => {
    const verb = card.querySelector<HTMLElement>('.method__verb')!
    // la parola in gradiente non si divide in lettere (perderebbe il colore): si scopre da sinistra
    const iri = verb.querySelector<HTMLElement>('.iri')
    const chars = iri ? [] : SplitText.create(verb, { type: 'chars', mask: 'chars' }).chars
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 70%', once: true } })
    tl.fromTo(card.querySelector('.method__top'), { '--l': 0 }, { '--l': 1, duration: 1, ease: 'power3.inOut' })
      .from(card.querySelectorAll('.method__num, .method__kicker, .method__steps i'), { opacity: 0, y: 8, duration: 0.6, stagger: 0.06 }, 0.1)
    tl.from(verb.querySelector('.method__mark'), { opacity: 0, x: -24, duration: 0.9, ease: 'expo.out' }, 0.15)
    if (iri) tl.fromTo(iri, { clipPath: 'inset(-10% 100% -10% 0%)', x: -20 }, { clipPath: 'inset(-10% 0% -10% 0%)', x: 0, duration: 1.2, ease: 'expo.out' }, 0.2)
    else tl.from(chars, { xPercent: -100, opacity: 0, duration: 0.9, stagger: 0.035, ease: 'expo.out' }, 0.2)
    tl.from(card.querySelector('.method__text'), { opacity: 0, y: 16, duration: 1, ease: 'expo.out' }, 0.6)
  })
}

// ---------- metodo: le carte si impilano ----------
if (!reduceMotion) {
  const cards = gsap.utils.toArray<HTMLElement>('.method__card')
  cards.forEach((card, i) => {
    const next = cards[i + 1]
    if (!next) return
    gsap.to(card, {
      scale: 0.94, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: next, start: 'top 85%', end: 'top 25%', scrub: true },
    })
  })
}

// ---------- casi studio: scorrimento orizzontale ----------
// +3500, +250.000, +37%, +2700€ (separatore delle migliaia all'italiana)
function fmtMetric(v: number, unit = '') {
  return `+${Math.round(v).toLocaleString('it-IT')}${unit}`
}
// i numeri dei risultati seguono lo scroll: crescono entrando, si fermano
// sul valore giusto e tornano a scendere se si risale
function scrubMetrics(card: HTMLElement, trigger: ScrollTrigger.Vars) {
  if (reduceMotion) return
  const els = Array.from(card.querySelectorAll<HTMLElement>('[data-metric]'))
  const p = { v: 0 }
  const draw = () => els.forEach((el) => (el.textContent = fmtMetric(parseFloat(el.dataset.metric!) * p.v, el.dataset.unit)))
  draw()
  gsap.to(p, { v: 1, ease: 'power2.out', onUpdate: draw, scrollTrigger: { ...trigger, scrub: 0.6 } })
}
function caseCard(c: Case, i: number) {
  const media = c.video
    ? `<video src="/video/${c.video}.mp4" poster="/video/${c.video}.jpg" muted loop playsinline preload="none"></video>`
    : `<div class="case__placeholder" aria-hidden="true"></div>`
  return `
  <article class="case glass" data-case="${i}">
    <div class="case__media">${media}</div>
    <div class="case__info">
      <h3 class="case__name">${c.name}</h3>
      <p class="case__desc">${c.desc}</p>
      <ul class="case__tags">${c.tags.map((t) => `<li class="chip">${t}</li>`).join('')}</ul>
      <div class="case__results">
        <p class="eyebrow">Risultati</p>
        <div class="case__metrics">
          ${c.metrics.map((m) => `<div class="metric"><div class="metric__v" data-metric="${m.v}" data-unit="${m.unit ?? ''}">${fmtMetric(m.v, m.unit)}</div><div class="metric__l">${m.label}</div></div>`).join('')}
        </div>
      </div>
      <button class="btn btn--glass btn--sm case__more" type="button" data-case-open="${i}"><span>Scopri di più</span></button>
    </div>
  </article>`
}

function renderCases() {
  const track = document.querySelector<HTMLElement>('[data-cases-track]')!
  track.innerHTML = CASES.map(caseCard).join('')
  document.querySelector('[data-case-total]')!.textContent = String(CASES.length)
}

const casesSection = document.querySelector<HTMLElement>('[data-cases]')!
const track = casesSection.querySelector<HTMLElement>('[data-cases-track]')!
const idx = casesSection.querySelector<HTMLElement>('[data-case-index]')!

// i video partono solo quando sono visibili
const vio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    const v = e.target as HTMLVideoElement
    if (e.isIntersecting) {
      v.preload = 'auto'
      v.play().catch(() => {})
    } else v.pause()
  })
}, { threshold: 0.25 })
track.querySelectorAll('video').forEach((v) => vio.observe(v))

const mm = gsap.matchMedia()
mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
  const dist = () => track.scrollWidth - innerWidth
  const tween = gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: casesSection,
      start: 'top top',
      end: () => `+=${dist()}`,
      pin: casesSection.querySelector('.cases__pin'),
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (st) => (idx.textContent = String(Math.min(CASES.length, Math.floor(st.progress * CASES.length * 0.999) + 1))),
    },
  })
  // ogni card si "raddrizza" entrando e le informazioni si compongono in ordine
  track.querySelectorAll<HTMLElement>('.case').forEach((card, i) => {
    // la prima card è già a schermo quando la sezione si ferma: i suoi numeri
    // crescono mentre la sezione sale; le altre mentre scorrono da destra
    scrubMetrics(card, i === 0
      ? { trigger: casesSection, start: 'top 85%', end: 'top top' }
      : { trigger: card, containerAnimation: tween, start: 'left right', end: 'left 35%' })
    gsap.from(card.querySelectorAll('.case__name, .case__desc, .case__tags, .case__results, .case__more'), {
      y: 24, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 70%', once: true },
    })
    gsap.from(card.querySelector('.case__media'), {
      clipPath: 'inset(6% 6% 6% 6% round 16px)', ease: 'none',
      scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'left 45%', scrub: true },
    })
  })
})
mm.add('(max-width: 860px)', () => {
  track.querySelectorAll<HTMLElement>('.case').forEach((card) => {
    scrubMetrics(card, { trigger: card.querySelector('.case__metrics'), start: 'top 95%', end: 'top 50%' })
    gsap.from(card, { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
  })
})

// ---------- modale caso studio ----------
const modal = document.querySelector<HTMLElement>('[data-modal]')!
const modalMedia = modal.querySelector<HTMLElement>('[data-modal-media]')!
const modalInfo = modal.querySelector<HTMLElement>('[data-modal-info]')!
let lastFocus: HTMLElement | null = null
const openCase = (i: number) => {
  const c = CASES[i]
  const card = track.querySelector<HTMLElement>(`[data-case="${i}"]`)!
  modalMedia.innerHTML = c.video
    ? `<video src="/video/${c.video}.mp4" poster="/video/${c.video}.jpg" muted loop playsinline autoplay controls></video>`
    : `<div class="case__placeholder" aria-hidden="true"></div>`
  modalInfo.innerHTML = card.querySelector('.case__info')!.innerHTML.replace(/<button[\s\S]*<\/button>/, '')
  modalInfo.querySelector('.case__name')!.id = 'modal-title'
  modalInfo.querySelectorAll<HTMLElement>('[data-metric]').forEach((el) => (el.textContent = fmtMetric(parseFloat(el.dataset.metric!), el.dataset.unit)))
  lastFocus = document.activeElement as HTMLElement
  modal.classList.add('is-open')
  modal.setAttribute('aria-hidden', 'false')
  getLenis()?.stop()
  modal.querySelector<HTMLElement>('[data-modal-close]')!.focus()
}
const closeCase = () => {
  modal.classList.remove('is-open')
  modal.setAttribute('aria-hidden', 'true')
  getLenis()?.start()
  setTimeout(() => (modalMedia.innerHTML = ''), 500)
  lastFocus?.focus()
}
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-case-open]')
  if (b) openCase(Number(b.dataset.caseOpen))
  if ((e.target as HTMLElement).matches('[data-modal-close], [data-modal]')) closeCase()
})
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) closeCase()
})

// ---------- anteprima analisi (step 1) ----------
function renderSectors() {
  const wrap = document.querySelector<HTMLElement>('[data-sectors]')!
  // stessa icona della domanda nel potenziometro
  document.querySelector('.analysis__q')?.insertAdjacentHTML('afterbegin', `<span class="pz__qicon">${ICONS.layers}</span>`)
  wrap.innerHTML = SECTORS.map(
    (s, i) => `<button class="opt" type="button" aria-pressed="false" data-sector="${i}">
      <span class="opt__icon">${ICONS[s.icon]}</span><span class="opt__label">${s.label}</span>
      <span class="opt__check">${ICONS.check}</span></button>`,
  ).join('')
}
const form = document.querySelector<HTMLFormElement>('[data-analysis]')!
const next = form.querySelector<HTMLButtonElement>('[data-analysis-next]')!
let chosen = -1
form.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-sector]')
  if (!b) return
  chosen = Number(b.dataset.sector)
  form.querySelectorAll('[data-sector]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
  next.disabled = false
})
form.addEventListener('submit', (e) => {
  e.preventDefault()
  if (chosen < 0) return
  document.body.classList.add('is-leaving')
  setTimeout(() => (location.href = `/potenziometro.html?settore=${chosen}`), 420)
})

ScrollTrigger.refresh()
