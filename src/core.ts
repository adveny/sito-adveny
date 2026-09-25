import './styles/main.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'
import { initLegal } from './legal'

gsap.registerPlugin(ScrollTrigger, SplitText)

export { gsap, ScrollTrigger, SplitText }
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null
export const getLenis = () => lenis

// ---------- scroll fluido ----------
function initScroll() {
  if (reduceMotion) return
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
  ;(window as unknown as { __lenis: Lenis }).__lenis = lenis
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis!.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

// ---------- luci di sfondo ----------
// Le due luci stanno su un'ellisse attorno allo schermo, sempre opposte.
// Scorrendo girano attorno ai contenuti; la velocità le fa gonfiare un poco.
// Una pagina può fissare dei punti chiave (scroll in px → apertura, giro):
// apertura 1 = composizione del brand, valori più alti = luci più ai bordi.
export type AuraKey = { at: number; spread: number; turn: number }
let auraKeys: () => AuraKey[] = () => [{ at: 0, spread: 1.28, turn: 0 }]
let keys: AuraKey[] = []
let auraDeg = 0
// direzione (gradi) della luce in alto a sinistra: serve a chi vuole colorarsi come le luci
export const getAuraAngle = () => auraDeg
export const setAuraKeys = (fn: () => AuraKey[]) => {
  auraKeys = fn
  keys = fn()
}
const AURA_TURN = 11 // gradi di giro per ogni schermata scorsa oltre l'ultimo punto chiave

function initAura() {
  const el = document.querySelector<HTMLElement>('[data-aura]')
  if (!el) return
  const blooms = Array.from(el.querySelectorAll<HTMLElement>('.aura__bloom'))
  keys = auraKeys()
  let bloomR = blooms[0].offsetHeight / 2
  // gradi: luce in alto a sinistra, la gemella in basso a destra, seguendo la diagonale dello schermo
  const baseAngle = () => 180 + (Math.atan2(innerHeight, innerWidth) * 180) / Math.PI * 0.68
  let base = baseAngle()
  addEventListener('resize', () => {
    keys = auraKeys()
    bloomR = blooms[0].offsetHeight / 2
    base = baseAngle()
  })
  ScrollTrigger.addEventListener('refresh', () => (keys = auraKeys()))

  const sample = (y: number) => {
    let i = 0
    while (i < keys.length - 1 && y > keys[i + 1].at) i++
    const a = keys[i], b = keys[i + 1]
    if (!b || y <= a.at) {
      const past = Math.max(0, y - a.at) / innerHeight
      return { spread: a.spread, turn: a.turn + (b ? 0 : past * AURA_TURN) }
    }
    const t = gsap.parseEase('sine.inOut')((y - a.at) / (b.at - a.at))
    return { spread: a.spread + (b.spread - a.spread) * t, turn: a.turn + (b.turn - a.turn) * t }
  }

  // entrata: le luci arrivano dai bordi
  const intro = { k: reduceMotion ? 0 : 1 }
  if (!reduceMotion) gsap.to(intro, { k: 0, duration: 2.4, delay: 0.15, ease: 'expo.out' })
  let swell = 0
  const render = () => {
    const { spread, turn } = sample(scrollY)
    const s = spread + intro.k * 0.5
    const v = lenis ? Math.abs(lenis.velocity) : 0
    swell += (Math.min(v * 0.005, 0.12) - swell) * 0.06
    // ogni luce sta appena oltre il bordo dello schermo, lungo la sua direzione:
    // così la composizione regge sia su desktop sia in verticale
    const push = bloomR * (0.02 + (s - 1) * 1.5)
    auraDeg = base + turn
    blooms.forEach((b, i) => {
      const deg = base + turn + i * 180
      const r = (deg * Math.PI) / 180
      const c = Math.cos(r), sn = Math.sin(r)
      const edge = Math.min(innerWidth / 2 / Math.max(Math.abs(c), 1e-3), innerHeight / 2 / Math.max(Math.abs(sn), 1e-3))
      const x = c * (edge + push)
      const y = sn * (edge + push)
      b.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(deg - base - 22).toFixed(2)}deg) scale(${(1 + swell).toFixed(4)})`
    })
  }
  render()
  requestAnimationFrame(() => el.classList.add('is-on'))
  if (reduceMotion) addEventListener('scroll', render, { passive: true })
  else gsap.ticker.add(render)
}

// ---------- navigazione ----------
function initNav(page: string) {
  document.querySelectorAll<HTMLAnchorElement>(`a[data-page="${page}"]`).forEach((a) => {
    a.classList.add('is-current')
    a.setAttribute('aria-current', 'page')
  })
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  const burger = document.querySelector<HTMLButtonElement>('[data-burger]')
  const menu = document.querySelector<HTMLElement>('[data-menu]')
  burger?.addEventListener('click', () => {
    const open = !document.body.classList.contains('menu-open')
    document.body.classList.toggle('menu-open', open)
    burger.setAttribute('aria-expanded', String(open))
    menu?.setAttribute('aria-hidden', String(!open))
    if (open) lenis?.stop()
    else lenis?.start()
  })
  // la nav si nasconde scendendo e riappare risalendo
  let last = scrollY
  addEventListener('scroll', () => {
    if (!nav || document.body.classList.contains('menu-open')) return
    const y = scrollY
    nav.classList.toggle('is-hidden', y > last && y > 160)
    last = y
  }, { passive: true })
}

// ---------- transizioni tra pagine ----------
function initPageTransitions() {
  requestAnimationFrame(() => document.body.classList.add('is-ready'))
  addEventListener('pageshow', (e) => {
    if (e.persisted) document.body.classList.remove('is-leaving')
  })
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return
    const url = new URL(a.href, location.href)
    if (url.origin !== location.origin) return
    if (url.pathname === location.pathname && url.hash) {
      e.preventDefault()
      const el = document.querySelector(url.hash)
      if (el) lenis ? lenis.scrollTo(el as HTMLElement, { offset: -20, duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (url.pathname === location.pathname && !url.hash) {
      e.preventDefault()
      lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    e.preventDefault()
    document.body.classList.add('is-leaving')
    setTimeout(() => (location.href = url.href), 380)
  })
}

// ---------- animazioni dei testi ----------
// data-split="words"  → parole che salgono da una maschera
// data-split="lines"  → righe che emergono una dopo l'altra
// data-split="chars"  → dissolvenza lettera per lettera (eyebrow)
// data-reveal         → blocco che entra dal basso
// data-stagger        → i figli entrano in sequenza
// data-count          → numeri che contano
export function initTextAnimations(root: ParentNode = document) {
  if (reduceMotion) return

  root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    const type = el.dataset.split
    const delay = parseFloat(el.dataset.delay || '0')
    const trigger = { trigger: el, start: 'top 88%', once: true }

    if (type === 'chars') {
      const s = SplitText.create(el, { type: 'words,chars' })
      gsap.from(s.chars, { opacity: 0, duration: 0.5, stagger: 0.018, delay, ease: 'power1.out', scrollTrigger: trigger })
      return
    }
    if (type === 'lines') {
      SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit: (s) => gsap.from(s.lines, { yPercent: 100, duration: 1, stagger: 0.08, delay, ease: 'expo.out', scrollTrigger: trigger }),
      })
      return
    }
    // words: le parole in gradiente restano intere per non spezzare il colore
    el.querySelectorAll<HTMLElement>('.iri').forEach((i) => i.classList.add('split-word'))
    SplitText.create(el, {
      type: 'words', mask: 'words', wordsClass: 'split-word', autoSplit: true, ignore: '.iri',
      onSplit: (s) => {
        const targets = [...s.words, ...el.querySelectorAll('.iri')]
        return gsap.from(targets, { yPercent: 100, duration: 1.1, stagger: 0.035, delay, ease: 'expo.out', scrollTrigger: trigger })
      },
    })
  })

  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 32, opacity: 0, duration: 1.1, delay: parseFloat(el.dataset.delay || '0'), ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    })
  })

  root.querySelectorAll<HTMLElement>('[data-stagger]').forEach((el) => {
    gsap.from(el.children, {
      y: 24, opacity: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })
}

export function initCounters(root: ParentNode = document) {
  const set = (el: HTMLElement, v: number) => (el.textContent = `${el.dataset.prefix ?? ''}${Math.round(v)}${el.dataset.suffix ?? ''}`)
  // IntersectionObserver: funziona anche per le card nello scorrimento orizzontale
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      io.unobserve(e.target)
      const el = e.target as HTMLElement
      const o = { v: 0 }
      gsap.to(o, { v: parseFloat(el.dataset.count || '0'), duration: 1.8, ease: 'power3.out', onUpdate: () => set(el, o.v) })
    })
  }, { threshold: 0.4 })
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    if (reduceMotion) return set(el, parseFloat(el.dataset.count || '0'))
    set(el, 0)
    io.observe(el)
  })
}

// ---------- lettura guidata ----------
// Divide un testo in parole: grigie finché non vengono "lette" con lo scroll.
// Le parole dentro <em> o .iri sono parole chiave e si accendono col gradiente aura.
export function splitReadable(el: HTMLElement) {
  el.querySelectorAll<HTMLElement>('.iri').forEach((i) => i.classList.add('is-split'))
  const s = SplitText.create(el, { type: 'words', wordsClass: 'rw' })
  const words = s.words as HTMLElement[]
  words.forEach((w) => {
    if (w.closest('em, .iri')) w.classList.add('k')
  })
  return words
}
export const lightWords = (words: HTMLElement[], amount: number) => {
  const n = Math.round(amount * words.length)
  words.forEach((w, i) => w.classList.toggle('is-on', i < n))
}

// data-read → il testo si colora mentre lo si legge scorrendo
function initReading(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-read]').forEach((el) => {
    const words = splitReadable(el)
    if (reduceMotion) return lightWords(words, 1)
    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      end: el.dataset.read || 'bottom 42%',
      scrub: true,
      onUpdate: (st) => lightWords(words, st.progress),
    })
  })
}

// ---------- avvio ----------
export async function boot(page: string) {
  initScroll()
  initNav(page)
  initPageTransitions()
  initAura()
  initLegal()
  // aspetta i font prima di dividere i testi, così le righe sono corrette
  await document.fonts.ready
  initTextAnimations()
  initReading()
  initCounters()
  ScrollTrigger.refresh()
}
