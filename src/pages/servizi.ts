import { boot, gsap, ScrollTrigger, reduceMotion } from '../core'

await boot('servizi')

// ============================================================
// COSTI DELLE FIGURE — la sezione si ferma e le card entrano una alla
// volta da destra fino al loro posto; il prezzo sale mentre arriva.
// Su mobile (una colonna) niente pin: ogni card scorre dentro da sola.
// ============================================================
const roles = Array.from(document.querySelectorAll<HTMLElement>('.role'))
const prices = roles.map((role) => {
  const node = role.querySelector('.role__price')!.firstChild as Text
  const m = node.textContent!.match(/€([\d.]+)k-([\d.]+)k/)!
  return { node, a: parseFloat(m[1]), b: parseFloat(m[2]) }
})
const setPrice = (i: number, t: number) => {
  const { node, a, b } = prices[i]
  node.textContent = `€${(a * t).toFixed(1)}k-${(b * t).toFixed(1)}k`
}
// una card: da destra, spenta e col prezzo a zero → al suo posto, prezzo pieno
const enterCard = (tl: gsap.core.Timeline, i: number, at: number) => {
  const o = { t: 0 }
  tl.fromTo(roles[i], { x: () => innerWidth * 0.6, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power3.out' }, at)
    .to(o, { t: 1, duration: 1, ease: 'power2.out', onUpdate: () => setPrice(i, o.t) }, at + 0.2)
}

// ============================================================
// OFFERTA — la frase appare tutta insieme, poi il sottotesto, i servizi e la CTA
// ============================================================
const offer = document.querySelector<HTMLElement>('[data-offer]')!
const q = <T extends Element = HTMLElement>(sel: string) => offer.querySelector(sel) as unknown as T
const offerA = q<HTMLElement>('[data-offer-a]')
const offerB = q<HTMLElement>('[data-offer-b]')

if (reduceMotion) {
  offer.classList.add('is-static')
} else {
  const mm = gsap.matchMedia()
  mm.add('(min-width: 861px)', () => {
    const pin = document.querySelector<HTMLElement>('.roles__pin')!
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        // se la sezione è più alta dello schermo si ferma col fondo sul bordo: le card restano visibili
        start: () => (pin.offsetHeight > innerHeight ? 'bottom bottom' : 'center center'),
        end: () => `+=${innerHeight * 2.4}`,
        pin: true, scrub: 0.6, invalidateOnRefresh: true,
      },
    })
    roles.forEach((_, i) => enterCard(tl, i, i * 0.7))
    tl.to({}, { duration: 0.4 })
  })
  mm.add('(max-width: 860px)', () => {
    roles.forEach((role, i) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: role, start: 'top 95%', end: 'top 60%', scrub: 0.6 } })
      enterCard(tl, i, 0)
    })
  })

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, paused: true })
  tl.set(offer.querySelectorAll('[data-offer-lead], [data-offer-chips] .chip, [data-offer-cta]'), { opacity: 0 })
    // 1. Titolo completo appare insieme con glow
    .fromTo([offerA, offerB], { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.08 }, 0)
    .fromTo(q('[data-offer-glow]'), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1.4 }, 0.2)
    // 2. il sottotesto, poi i servizi uno dopo l'altro e la CTA
    .fromTo(q('[data-offer-lead]'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 1.4)
    .fromTo(offer.querySelectorAll('[data-offer-chips] .chip'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, 2.0)
    .fromTo(q('[data-offer-cta]'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 2.7)
    .to({}, { duration: 0.6 })
  gsap.to(tl, {
    progress: 1, ease: 'none',
    scrollTrigger: { trigger: offer, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
  })
}

// numero grande che si sposta e cambia allineandosi alla card in lettura
const big = document.querySelector<HTMLElement>('.svc__big')!
const track = document.querySelector<HTMLElement>('[data-svc-track]')!
const svcCards = Array.from(document.querySelectorAll<HTMLElement>('[data-svc]'))
let activeSvc = 0
const syncSvc = (idx: number) => {
  activeSvc = idx
  const card = svcCards[idx]
  if (!card || !big) return
  const y = Math.max(0, card.offsetTop + (card.offsetHeight - big.offsetHeight) / 2)
  big.style.transform = `translateY(${y.toFixed(1)}px)`
  track.style.transform = `translateY(${-idx * 1.15}em)`
}
svcCards.forEach((el, i) => {
  ScrollTrigger.create({
    trigger: el, start: 'top 58%', end: 'bottom 58%',
    onToggle: (st) => {
      if (st.isActive) syncSvc(i)
    },
  })
})
syncSvc(0)
ScrollTrigger.addEventListener('refresh', () => syncSvc(activeSvc))
ScrollTrigger.refresh()
if (reduceMotion) {
  big.style.transition = 'none'
  track.style.transition = 'none'
}
