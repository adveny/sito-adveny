import { boot, gsap, reduceMotion, getLenis } from '../core'
import { STEPS, type Question } from '../data'
import { ICONS } from '../icons'

type Answers = Record<string, string | string[] | undefined>

const main = document.querySelector<HTMLElement>('[data-pz-main]')!
const stepsNav = document.querySelector<HTMLElement>('[data-pz-steps]')!
const count = document.querySelector<HTMLElement>('[data-pz-count]')!
const bar = document.querySelector<HTMLElement>('[data-pz-bar]')!
const meter = document.querySelector<HTMLElement>('[data-pz-meter]')!
const overlay = document.querySelector<HTMLElement>('[data-pz-transition]')!

const answers: Answers = { team: 'Solo io' }
// 7 step (sezioni); dentro ogni step le domande arrivano una alla volta
let step = 0
let qi = 0
let busy = false
const TOTAL_Q = STEPS.reduce((n, s) => n + s.questions.length, 0)

// arrivo dalla home con il settore già scelto
const pre = new URLSearchParams(location.search).get('settore')
if (pre !== null && STEPS[0].questions[0].type === 'sector') {
  const s = STEPS[0].questions[0].options[Number(pre)]
  if (s) {
    answers.settore = s.label
    qi = 1 // il settore l'ha già scelto in home: si parte dalla domanda dopo
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === 'string' && v.trim().length > 0)

const current = () => STEPS[step].questions[qi]

function isComplete(q: Question = current()) {
  if (q.type === 'textarea') return !!q.optional || filled(answers[q.key])
  if (q.type === 'form') return q.fields.every((f) => filled(answers[f.key])) && answers.privacy === 'sì'
  return filled(answers[q.key])
}

function renderQuestion(q: Question) {
  const head = q.label
    ? `<p class="pz__label" id="q-${q.key}" tabindex="-1">${q.icon ? `<span class="pz__qicon">${ICONS[q.icon]}</span>` : ''}<span>${q.label}</span></p>${q.hint ? `<p class="pz__hint">${q.hint}</p>` : ''}`
    : ''
  let body = ''
  if (q.type === 'sector') {
    body = `<div class="options" role="group" aria-labelledby="q-${q.key}">${q.options.map((o) => `
      <button class="opt" type="button" data-key="${q.key}" data-val="${esc(o.label)}" data-mode="single" aria-pressed="${answers[q.key] === o.label}">
        <span class="opt__icon">${ICONS[o.icon]}</span><span class="opt__label">${o.label}</span><span class="opt__check">${ICONS.check}</span>
      </button>`).join('')}</div>`
  } else if (q.type === 'slider') {
    const i = Math.max(0, q.options.indexOf(String(answers[q.key] ?? q.options[0])))
    const fill = (i / (q.options.length - 1)) * 100
    body = `<div class="slider" data-slider="${q.key}">
      <div class="slider__labels">${q.options.map((o, j) => `<button type="button" class="${j === i ? 'is-selected' : ''}" data-slide="${j}">${o}</button>`).join('')}</div>
      <input type="range" min="0" max="${q.options.length - 1}" value="${i}" aria-label="${q.label}" style="--fill:${fill}%" />
    </div>`
  } else if (q.type === 'multi' || q.type === 'single') {
    const cur = answers[q.key]
    const full = q.type === 'multi' && q.max && Array.isArray(cur) && cur.length >= q.max
    body = `<div class="options" role="group" aria-labelledby="q-${q.key}">${q.options.map((o) => {
      const on = q.type === 'single' ? cur === o : Array.isArray(cur) && cur.includes(o)
      return `<button class="opt" type="button" data-key="${q.key}" data-val="${esc(o)}" data-mode="${q.type}" data-max="${q.type === 'multi' ? q.max ?? '' : ''}" aria-pressed="${on}" ${full && !on ? 'disabled' : ''}>
        <span class="opt__label">${o}</span><span class="opt__check">${ICONS.check}</span></button>`
    }).join('')}</div>`
  } else if (q.type === 'textarea') {
    body = `<label class="field"><textarea data-text="${q.key}" maxlength="1200" placeholder="${esc(q.placeholder)}" aria-labelledby="q-${q.key}">${esc(String(answers[q.key] ?? ''))}</textarea></label>`
  } else if (q.type === 'form') {
    body = `<div class="form__row">${q.fields.map((f) => `
      <label class="field"><input data-text="${f.key}" type="${f.type}" autocomplete="${f.autoComplete}" required placeholder=" "
        maxlength="${f.type === 'email' ? 254 : f.type === 'tel' ? 30 : 120}" value="${esc(String(answers[f.key] ?? ''))}" /><span>${f.placeholder}</span></label>`).join('')}</div>
      <label class="check pz__check">
        <input type="checkbox" data-privacy required ${answers.privacy === 'sì' ? 'checked' : ''} /><i></i>
        <span>Ho letto l’<button type="button" class="legal__link" data-legal="privacy">informativa privacy</button> e acconsento al trattamento dei miei dati per ricevere il recap via email ed essere ricontattato da un consulente. *</span>
      </label>`
  }
  return `<div class="pz__q">${head}${body}</div>`
}

function renderNav() {
  stepsNav.innerHTML = STEPS.map((s, i) => `<li class="${i < step ? 'is-done' : ''} ${i === step ? 'is-current' : ''}">${ICONS[s.icon]}<span>${s.title}</span></li>`).join('')
  count.textContent = `${step + 1}/${STEPS.length}`
  // la barra avanza a ogni domanda, non solo a ogni step
  const done = STEPS.slice(0, step).reduce((n, s) => n + s.questions.length, 0) + qi + 1
  bar.style.width = `${(done / TOTAL_Q) * 100}%`
  meter.setAttribute('aria-valuenow', String(step + 1))
}

// la parte che cambia a ogni domanda: domanda, contatore e pulsanti
function cardHTML() {
  const s = STEPS[step]
  const n = s.questions.length
  const first = step === 0 && qi === 0
  return `
    ${n > 1 ? `<div class="pz__qcount"><span>Domanda ${qi + 1} di ${n}</span><span class="pz__qdots" aria-hidden="true">${s.questions.map((_, i) => `<i class="${i <= qi ? 'is-on' : ''}"></i>`).join('')}</span></div>` : ''}
    ${renderQuestion(current())}
    <div class="pz__actions">
      ${first ? '' : `<button class="btn btn--glass btn--back" type="button" data-back><span>Indietro</span></button>`}
      <button class="btn btn--light" type="submit" data-next ${isComplete() ? '' : 'disabled'}><span>${qi === n - 1 ? s.cta ?? 'Prosegui' : 'Avanti'}</span></button>
    </div>
`
}

const animateOptions = () => {
  if (reduceMotion) return
  gsap.from(main.querySelectorAll('.opt, .slider__labels button, .field'), { y: 10, opacity: 0, duration: 0.6, stagger: 0.02, delay: 0.1, ease: 'expo.out' })
}

function renderStep(dir = 1) {
  const s = STEPS[step]
  renderNav()
  main.innerHTML = `
    <form class="pz__main" data-step novalidate>
      <div class="pz__intro">
        <div class="pz__icon glass">${ICONS[s.icon]}</div>
        <p class="eyebrow">Step ${step + 1}</p>
        <h1 class="h2" tabindex="-1" data-title>${s.title}</h1>
        <p class="lead">${s.subtitle}</p>
      </div>
      <div class="pz__card glass" data-card>${cardHTML()}</div>
    </form>`
  bind()
  getLenis()?.scrollTo(0, { immediate: true })
  if (!reduceMotion) {
    const intro = main.querySelectorAll('.pz__intro > *')
    gsap.from(intro, { x: -24 * dir, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'expo.out' })
    gsap.from(main.querySelector('.pz__card'), { y: 30, opacity: 0, duration: 0.9, ease: 'expo.out' })
    animateOptions()
  }
  main.querySelector<HTMLElement>('[data-title]')?.focus({ preventScroll: true })
}

// cambio domanda dentro lo stesso step: scorre solo la card
function showQuestion(dir: 1 | -1) {
  const card = main.querySelector<HTMLElement>('[data-card]')!
  renderNav()
  const swap = () => {
    card.innerHTML = cardHTML()
    card.querySelector<HTMLElement>('.pz__label')?.focus({ preventScroll: true })
  }
  if (reduceMotion) return swap()
  busy = true
  gsap.to(card.children, {
    x: -28 * dir, opacity: 0, duration: 0.22, ease: 'power2.in',
    onComplete: () => {
      swap()
      gsap.fromTo(card.children, { x: 28 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'expo.out', onComplete: () => void (busy = false) })
      animateOptions()
    },
  })
}

// avanti: prossima domanda dello step, oppure step successivo
function advance() {
  if (busy || !isComplete()) return
  if (qi < STEPS[step].questions.length - 1) {
    qi++
    showQuestion(1)
  } else go(1)
}
function back() {
  if (busy) return
  if (qi > 0) {
    qi--
    showQuestion(-1)
  } else if (step > 0) go(-1)
}

function refreshNext() {
  const b = main.querySelector<HTMLButtonElement>('[data-next]')
  if (b) b.disabled = !isComplete()
}

function bind() {
  const form = main.querySelector<HTMLFormElement>('[data-step]')!

  form.addEventListener('click', (e) => {
    const opt = (e.target as HTMLElement).closest<HTMLButtonElement>('.opt')
    if (opt) {
      const { key, val, mode } = opt.dataset as { key: string; val: string; mode: string }
      const value = val
      if (mode === 'single') {
        answers[key] = value
        form.querySelectorAll<HTMLButtonElement>(`.opt[data-key="${key}"]`).forEach((b) => b.setAttribute('aria-pressed', String(b === opt)))
        // una sola risposta possibile: appena scelta si passa alla domanda dopo
        const q = current()
        setTimeout(() => current() === q && answers[key] === value && advance(), 420)
      } else {
        const cur = new Set(Array.isArray(answers[key]) ? (answers[key] as string[]) : [])
        cur.has(value) ? cur.delete(value) : cur.add(value)
        answers[key] = [...cur]
        opt.setAttribute('aria-pressed', String(cur.has(value)))
        const max = Number(opt.dataset.max || 0)
        if (max) {
          form.querySelectorAll<HTMLButtonElement>(`.opt[data-key="${key}"]`).forEach((b) => {
            b.disabled = cur.size >= max && b.getAttribute('aria-pressed') !== 'true'
          })
        }
      }
      refreshNext()
      return
    }
    const slide = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-slide]')
    if (slide) setSlider(slide.closest<HTMLElement>('[data-slider]')!, Number(slide.dataset.slide))
    if ((e.target as HTMLElement).closest('[data-back]')) back()
  })

  // delegato al form: la card cambia contenuto a ogni domanda
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement
    const slider = t.closest<HTMLElement>('[data-slider]')
    if (slider && t.type === 'range') return setSlider(slider, Number(t.value))
    if (t.dataset.text) {
      answers[t.dataset.text] = t.value
      refreshNext()
    }
    if (t.hasAttribute('data-privacy')) {
      answers.privacy = t.checked ? 'sì' : ''
      refreshNext()
    }
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!isComplete() || busy) return
    const email = form.querySelector<HTMLInputElement>('input[type="email"]')
    if (email && !email.checkValidity()) {
      email.focus()
      gsap.fromTo(email, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
      return
    }
    advance()
  })
}

function setSlider(wrap: HTMLElement, i: number) {
  const key = wrap.dataset.slider!
  const q = current()
  if (q.type !== 'slider' || q.key !== key) return
  answers[key] = q.options[i]
  const input = wrap.querySelector('input')!
  input.value = String(i)
  input.style.setProperty('--fill', `${(i / (q.options.length - 1)) * 100}%`)
  wrap.querySelectorAll('[data-slide]').forEach((b, j) => b.classList.toggle('is-selected', j === i))
  refreshNext()
}

function go(dir: 1 | -1) {
  if (busy) return
  const leaving = STEPS[step]
  if (dir === 1 && step === STEPS.length - 1) return showResult()
  const msg = dir === 1 ? leaving.transition : null
  const swap = () => {
    step += dir
    // tornando indietro si riapre l'ultima domanda dello step precedente
    qi = dir === 1 ? 0 : STEPS[step].questions.length - 1
    renderStep(dir)
  }
  if (!msg || reduceMotion) return swap()
  busy = true
  const p = overlay.querySelector('p')!
  p.textContent = msg
  overlay.classList.add('is-on')
  gsap.to(main, { opacity: 0, filter: 'blur(12px)', duration: 0.35 })
  setTimeout(() => {
    swap()
    gsap.to(main, { opacity: 1, filter: 'blur(0px)', duration: 0.5 })
    overlay.classList.remove('is-on')
    busy = false
  }, 1100)
}

function showResult() {
  busy = true
  const p = overlay.querySelector('p')!
  p.textContent = 'Analisi in corso...'
  overlay.classList.add('is-on')
  gsap.to(main, { opacity: 0, filter: 'blur(12px)', duration: 0.35 })
  setTimeout(() => {
    overlay.classList.remove('is-on')
    step = STEPS.length - 1
    stepsNav.querySelectorAll('li').forEach((li) => { li.classList.remove('is-current'); li.classList.add('is-done') })
    bar.style.width = '100%'
    // demo: punteggio casuale, come sul sito attuale
    const score = 58 + Math.floor(Math.random() * 35)
    const C = 2 * Math.PI * 85
    main.innerHTML = `
      <section class="pz__result glass">
        <p class="eyebrow">${ICONS.check.replace('<svg', '<svg width="16" height="16" style="stroke:#fff;fill:none;stroke-width:2"')} Analisi completata</p>
        <div class="score">
          <svg viewBox="0 0 190 190" aria-hidden="true">
            <circle class="track" cx="95" cy="95" r="85" />
            <circle class="value" cx="95" cy="95" r="85" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-ring />
          </svg>
          <strong><span data-score>0</span><small>%</small></strong>
        </div>
        <h1 class="h2" tabindex="-1" data-title>Il tuo potenziale di <span class="iri">crescita</span></h1>
        <p class="lead" style="max-width: 52ch">Abbiamo analizzato la tua attività su 6 aree chiave: acquisizione, fidelizzazione, strumenti, metodo, strategia e visione.</p>
        <ol class="pz__next">
          <li>
            <span class="pz__next-icon">${ICONS.mail}</span>
            <div><strong>Controlla la tua casella</strong><p>Ti abbiamo appena inviato via mail il recap completo della tua analisi.</p></div>
          </li>
          <li>
            <span class="pz__next-icon">${ICONS.calendar}</span>
            <div><strong>Ti chiamiamo entro 48 ore</strong><p>Un nostro consulente ti contatterà per fissare un incontro e completare insieme l’analisi.</p></div>
          </li>
        </ol>
        <p class="pz__outro">Il primo passo l’hai fatto. <span class="iri">Al resto pensiamo noi.</span></p>
      </section>`
    gsap.to(main, { opacity: 1, filter: 'blur(0px)', duration: 0.5 })
    gsap.from(main.querySelector('.pz__result'), { y: 60, scale: 0.95, opacity: 0, duration: 1.2, ease: 'expo.out' })
    const ring = main.querySelector<SVGCircleElement>('[data-ring]')!
    const out = main.querySelector<HTMLElement>('[data-score]')!
    const o = { v: 0 }
    gsap.to(o, {
      v: score, duration: reduceMotion ? 0 : 1.8, delay: 0.3, ease: 'power3.out',
      onUpdate: () => {
        out.textContent = String(Math.round(o.v))
        ring.setAttribute('stroke-dashoffset', String(C - (C * o.v) / 100))
      },
    })
    main.querySelector<HTMLElement>('[data-title]')?.focus({ preventScroll: true })
    busy = false
  }, 1400)
}

await boot('potenziometro')
renderStep()
// anteprima: ?risultato apre subito la schermata finale
if (new URLSearchParams(location.search).has('risultato')) showResult()
