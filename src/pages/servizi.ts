import { boot, gsap, ScrollTrigger, reduceMotion } from '../core'

await boot('servizi')

// i costi delle figure salgono come un contatore: il peso si "sente" leggendo
if (!reduceMotion) {
  document.querySelectorAll<HTMLElement>('.role').forEach((role, i) => {
    const price = role.querySelector<HTMLElement>('.role__price')!
    const node = price.firstChild as Text
    const m = node.textContent!.match(/€([\d.]+)k-([\d.]+)k/)
    if (!m) return
    const [a, b] = [parseFloat(m[1]), parseFloat(m[2])]
    const o = { t: 0 }
    const tl = gsap.timeline({ scrollTrigger: { trigger: role, start: 'top 88%', once: true }, delay: (i % 3) * 0.08 })
    tl.from(role, { y: 30, opacity: 0, duration: 1, ease: 'expo.out' })
      .to(o, {
        t: 1, duration: 1.6, ease: 'power3.out',
        onUpdate: () => (node.textContent = `€${(a * o.t).toFixed(1)}k-${(b * o.t).toFixed(1)}k`),
      }, 0.1)
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
