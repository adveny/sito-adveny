import { boot, gsap } from '../core'

await boot('contatti')

const form = document.querySelector<HTMLFormElement>('[data-contact]')!
// arrivo dalla card "Potresti essere tu" del team: è una candidatura
if (new URLSearchParams(location.search).has('candidatura')) {
  form.querySelector<HTMLInputElement>('[name="oggetto"]')!.value = 'Candidatura'
}
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const invalid = Array.from(form.querySelectorAll<HTMLInputElement>('[required]')).find((i) => !i.checkValidity())
  if (invalid) {
    const box = invalid.type === 'checkbox' ? invalid.closest('.check')! : invalid
    gsap.fromTo(box, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
    invalid.focus()
    return
  }
  // nessun backend collegato: il form resta dimostrativo come sul sito attuale
  form.classList.add('is-sent')
  form.querySelector<HTMLButtonElement>('[type="submit"]')!.disabled = true
})
