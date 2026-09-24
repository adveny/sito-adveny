import { boot, gsap, SplitText, reduceMotion } from '../core'

// ============================================================
// TEAM — avatar in linea bianca: un busto con attorno curve di livello
// (come la mappa). L'ultima card è il posto "da sbloccare": candidature.
// ============================================================
// photo: avatar futuristico generato con Higgsfield (fondo nero), altrimenti il busto disegnato
const TEAM: { name: string; role: string; photo?: string }[] = [
  { name: 'Francesco Berutti', role: 'Growth Manager e Digital Strategist', photo: '/img/team/francesco-berutti.webp' },
  { name: 'Michele Pirro', role: 'Copywriter e Business Consultant', photo: '/img/team/michele-pirro.webp' },
  { name: 'Simone Concu', role: 'Media Buyer e ADV Specialist' },
  { name: 'Matteo Sanna', role: 'Art Director e Graphic Designer' },
  { name: 'Matteo Pastorino', role: 'Fullstack Developer e Software Engineer' },
  { name: 'Andrea Loddo', role: 'UX/UI Designer e Graphic Designer' },
  { name: 'Federico Angioni', role: 'Video Director e Videomaker' },
]
// busto: spalle, collo e testa in un solo tratto (viewBox 200×250)
const BUST = 'M28 250C32 214 58 197 84 191L86 173C70 163 62 143 62 118C62 86 78 60 100 60C122 60 138 86 138 118C138 143 130 163 114 173L116 191C142 197 168 214 172 250'
// linee di scansione curve dentro la figura: la fanno sembrare un rilievo 3D
const SCAN = Array.from({ length: 27 }, (_, k) => {
  const y = 62 + k * 7
  return `<path d="M0 ${y}Q100 ${y + 9} 200 ${y}" />`
}).join('')
const avatar = (i: number, open = false) => {
  const photo = TEAM[i]?.photo
  return `
    <div class="avatar${open ? ' avatar--open' : ''}${photo ? ' avatar--photo' : ''}">
      <svg class="avatar__art" viewBox="0 0 200 250" aria-hidden="true">
        <g class="avatar__contours">
          <path d="${BUST}" transform="translate(100 150) scale(1.5) translate(-100 -150)" />
          <path d="${BUST}" transform="translate(100 150) scale(1.28) translate(-100 -150)" />
          <path d="${BUST}" transform="translate(100 150) scale(1.12) translate(-100 -150)" />
        </g>
        <clipPath id="bust-${i}"><path d="${BUST}Z" /></clipPath>
        <g class="avatar__scan" clip-path="url(#bust-${i})">${SCAN}</g>
        <path class="avatar__bust" d="${BUST}" pathLength="1" />
      </svg>
      ${photo ? `<img class="avatar__photo" src="${photo}" alt="" loading="lazy" width="900" height="1125" />` : ''}
      <span class="avatar__num">${open ? '+1' : `${String(i + 1).padStart(2, '0')}<small>/${String(TEAM.length).padStart(2, '0')}</small>`}</span>
    </div>`
}
const team = document.querySelector<HTMLElement>('[data-team]')!
team.innerHTML = TEAM.map((m, i) => `
  <article class="member glass" data-reveal data-delay="${(i % 4) * 0.08}">
    ${avatar(i)}
    <div class="member__meta">
      <h3 class="member__name">${m.name}</h3>
      <p class="member__role">${m.role}</p>
    </div>
  </article>`).join('') + `
  <article class="member member--open glass" data-reveal data-delay="0.24">
    ${avatar(TEAM.length, true)}
    <div class="member__meta">
      <h3 class="member__name">Potresti essere tu</h3>
      <p class="member__role">Candidati per lavorare con noi</p>
      <a class="btn btn--light btn--sm member__cta" href="/contatti.html?candidatura=1"><span>Candidati</span></a>
    </div>
  </article>`

// ============================================================
// TERRITORIO — la costa si disegna, poi le attività si accendono una
// dopo l'altra partendo da Cagliari; quelle già accese crescono ancora.
// Tornando su si spengono.
// ============================================================
const mapWrap = document.querySelector<HTMLElement>('[data-map-wrap]')!
const map = mapWrap.querySelector<SVGSVGElement>('[data-map]')!
const dots = Array.from(map.querySelectorAll<SVGGElement>('.dot'))
dots.forEach((d, i) => d.style.setProperty('--d', `${(i % 7) * 0.4}s`))
const clamp01 = gsap.utils.clamp(0, 1)
const renderMap = (p: number) => {
  map.style.setProperty('--draw', String(1 - clamp01(p / 0.3)))
  map.style.setProperty('--relief', String(clamp01((p - 0.15) / 0.2)))
  const from = 0.22, span = 0.68
  dots.forEach((d, i) => {
    const age = p - (from + (i / dots.length) * span)
    const on = age > 0
    d.classList.toggle('is-on', on)
    // entra piccolo, poi cresce ancora mentre si continua a scorrere
    d.style.setProperty('--s', on ? (clamp01(age / 0.05) * (0.7 + 0.5 * clamp01(age / 0.35))).toFixed(3) : '0')
  })
}

// ============================================================
// VISIONE — noi e i partner: i due fasci partono lontani e spenti,
// si avvicinano con lo scroll e si fondono in un'unica luce
// ============================================================
const union = document.querySelector<HTMLElement>('[data-union]')!
const [beamA, beamB] = Array.from(union.querySelectorAll<HTMLElement>('.union__beam'))

// ============================================================
// CHIUSURA — "Per chi lavora, per chi resta, per chi sogna di tornare":
// una frase alla volta, ferma a schermo; alla fine compare la CTA
// ============================================================
const words = document.querySelector<HTMLElement>('[data-words]')!
const items = Array.from(words.querySelectorAll<HTMLElement>('[data-word-item]'))
const wordsCta = words.querySelector<HTMLElement>('[data-words-cta]')!

await boot('about')

const drawIO = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return
  e.target.classList.add('is-drawn')
  drawIO.unobserve(e.target)
}), { threshold: 0.35 })
team.querySelectorAll('.member').forEach((m) => drawIO.observe(m))

if (reduceMotion) {
  renderMap(1)
  gsap.set(beamA, { xPercent: -14, yPercent: -8 })
  gsap.set(beamB, { xPercent: 14, yPercent: 8 })
  words.classList.add('is-static')
} else {
  renderMap(0)
  const mapState = { p: 0 }
  gsap.to(mapState, {
    p: 1, ease: 'none', onUpdate: () => renderMap(mapState.p),
    scrollTrigger: { trigger: mapWrap, start: 'top 85%', end: 'bottom 25%', scrub: 0.6 },
  })

  gsap.timeline({ scrollTrigger: { trigger: union, start: 'top 90%', end: 'center 40%', scrub: 0.8 } })
    .fromTo(beamA, { xPercent: -46, yPercent: -34, scale: 0.72, opacity: 0.6 }, { xPercent: -12, yPercent: -7, scale: 1, opacity: 1, ease: 'power1.inOut' }, 0)
    .fromTo(beamB, { xPercent: 46, yPercent: 34, scale: 0.72, opacity: 0.6 }, { xPercent: 12, yPercent: 7, scale: 1, opacity: 1, ease: 'power1.inOut' }, 0)

  // le frasi normali salgono lettera per lettera; quella in gradiente si scopre
  // da sinistra (dividerla in lettere le farebbe perdere il colore)
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
  items.forEach((item, i) => {
    const iri = item.querySelector<HTMLElement>('.iri')
    const chars = iri ? null : SplitText.create(item, { type: 'words,chars', mask: 'words' }).chars
    const at = i * 2
    if (chars) tl.fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: { amount: 0.35 } }, at)
    else tl.fromTo(iri, { clipPath: 'inset(-10% 100% -10% 0%)', x: -30 }, { clipPath: 'inset(-10% 0% -10% 0%)', x: 0, duration: 1.2 }, at)
    // le prime due escono verso l'alto per lasciare posto alla successiva
    if (chars && i < items.length - 1) tl.to(chars, { yPercent: -115, duration: 0.8, stagger: { amount: 0.25 }, ease: 'power3.in' }, at + 1.3)
  })
  tl.fromTo(wordsCta, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, items.length * 2 - 0.6)
  tl.to({}, { duration: 0.8 })
  gsap.to(tl, {
    progress: 1, ease: 'none',
    scrollTrigger: { trigger: words, start: 'top 60%', end: 'bottom bottom', scrub: 0.6 },
  })
  // le tre frasi del manifesto si scoprono da sinistra, una per volta, seguendo lo scroll
  document.querySelectorAll<HTMLElement>('[data-manifesto-kicker] span').forEach((el) => {
    gsap.fromTo(el, { clipPath: 'inset(-10% 100% -10% 0%)', x: -30 }, {
      clipPath: 'inset(-10% 0% -10% 0%)', x: 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 58%', scrub: true },
    })
  })
}

