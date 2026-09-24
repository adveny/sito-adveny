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
// OFFERTA — la frase da sola, poi "al costo di un solo dipendente"
// grande e da solo, poi le due insieme, il sottotesto, i servizi e la CTA
// ============================================================
const offer = document.querySelector<HTMLElement>('[data-offer]')!
const q = <T extends Element = HTMLElement>(sel: string) => offer.querySelector(sel) as unknown as T
const offerA = q<HTMLElement>('[data-offer-a]')
const offerB = q<HTMLElement>('[data-offer-b]')
const offerStage = q<HTMLElement>('.offer__stage')
// quanto spostare un elemento per portarlo al centro dello schermo
const toCenter = (el: HTMLElement) => () => {
  const r = el.getBoundingClientRect(), st = offerStage.getBoundingClientRect()
  return st.top + st.height / 2 - (r.top + r.height / 2) - (gsap.getProperty(el, 'y') as number)
}

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
  tl.set(offerB, { opacity: 0 })
    .set(offer.querySelectorAll('[data-offer-lead], [data-offer-chips] .chip, [data-offer-cta]'), { opacity: 0 })
    // 1. "Con Adveny avrai tutto questo," da sola, al centro
    .fromTo(offerA, { y: toCenter(offerA), opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1 }, 0)
    .to(offerA, { opacity: 0, y: () => (toCenter(offerA)() as number) - 60, duration: 0.8, ease: 'power2.in' }, 1.6)
    // 2. "al costo di un solo dipendente." da solo, grande, con la luce dietro
    .fromTo(offerB, { y: toCenter(offerB), scale: 1.18, opacity: 1, clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% 0% -20% 0%)', duration: 1.2 }, 2.4)
    .fromTo(q('[data-offer-glow]'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.4 }, 2.5)
    // 3. le due frasi si ricompongono nella loro posizione
    .to(offerB, { y: 0, scale: 1, duration: 1, ease: 'power2.inOut' }, 4.4)
    .fromTo(offerA, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, immediateRender: false }, 4.8)
    // 4. il sottotesto, poi i servizi uno dopo l'altro e la CTA
    .fromTo(q('[data-offer-lead]'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 5.6)
    .fromTo(offer.querySelectorAll('[data-offer-chips] .chip'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 }, 6.4)
    .fromTo(q('[data-offer-cta]'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 7.3)
    .to({}, { duration: 0.6 })
  gsap.to(tl, {
    progress: 1, ease: 'none',
    scrollTrigger: { trigger: offer, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
  })
}

// numero grande che cambia con il servizio in lettura
const track = document.querySelector<HTMLElement>('[data-svc-track]')!
document.querySelectorAll<HTMLElement>('[data-svc]').forEach((el) => {
  ScrollTrigger.create({
    trigger: el, start: 'top 55%', end: 'bottom 55%',
    onToggle: (st) => {
      if (st.isActive) track.style.transform = `translateY(${-Number(el.dataset.svc) * 1.15}em)`
    },
  })
})
if (reduceMotion) track.style.transition = 'none'
