import { boot, gsap, reduceMotion } from '../core'

// 6 segnaposto del team, come sul sito attuale
const team = document.querySelector<HTMLElement>('[data-team]')!
team.innerHTML = Array.from({ length: 6 }, (_, i) => `
  <article class="member glass" data-reveal data-delay="${(i % 3) * 0.08}">
    <div class="member__photo" style="--gx:${20 + ((i * 37) % 60)}%; --gy:${10 + ((i * 23) % 40)}%"></div>
    <div class="member__meta">
      <p class="member__name">Nome<br />Cognome</p>
      <p class="member__role">Ruolo</p>
    </div>
  </article>`).join('')

await boot('about')

if (!reduceMotion) {
  // pannelli in leggera parallasse
  document.querySelectorAll<HTMLElement>('[data-panes] [data-depth]').forEach((pane) => {
    const d = parseFloat(pane.dataset.depth || '0') * 0.5
    gsap.fromTo(pane, { y: d }, {
      y: -d, ease: 'none',
      scrollTrigger: { trigger: pane.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
  // le tre frasi del manifesto si scoprono da sinistra, una per volta, seguendo lo scroll
  document.querySelectorAll<HTMLElement>('[data-manifesto-kicker] span').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(-10% 100% -10% 0%)', x: -30 }, {
      clipPath: 'inset(-10% 0% -10% 0%)', x: 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 58%', scrub: true },
    })
  })
}

