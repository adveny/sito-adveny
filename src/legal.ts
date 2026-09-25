// ============================================================
// PRIVACY E COOKIE — informativa in una finestra (niente pagina dedicata),
// banner del consenso e Google Consent Mode v2 per Tag Manager
// (GA4 e Pixel Meta partono solo dopo il consenso).
// ============================================================
import { getLenis } from './core'

// ---------- dati legali ----------
// Adveny non è una società: è un collettivo di liberi professionisti, contitolari
// del trattamento (art. 26 GDPR). Niente sede legale.
// I valori tra parentesi quadre compaiono evidenziati nella finestra finché non vengono sostituiti.
export const LEGAL = {
  titolari: [
    { nome: 'Francesco Berutti', piva: '04073790927', cf: 'BRTFNC98P23B354R' },
    { nome: 'Michele Pirro', piva: '04089020921', cf: 'PRRMHL98H16B354W' },
  ],
  email: 'advenystudio@gmail.com', // provvisoria: da sostituire quando arriva quella definitiva
  hosting: 'Vercel Inc. (Stati Uniti)',
  aggiornata: '25 settembre 2026',
  gtm: '', // es. 'GTM-ABC1234': vuoto = Tag Manager non viene caricato
}

// ---------- consenso ----------
type Consent = { analytics: boolean; marketing: boolean; at: number; v: number }
const KEY = 'adveny-consent'
const VERSION = 1 // da aumentare se cambiano i servizi: il banner ricompare a tutti
const MAX_AGE = 1000 * 60 * 60 * 24 * 182 // 6 mesi, poi si richiede

const w = window as unknown as { dataLayer: unknown[] }
w.dataLayer = w.dataLayer || []
// gtag vuole l'oggetto arguments, non un array
// eslint-disable-next-line prefer-rest-params
function gtag(..._args: unknown[]) { w.dataLayer.push(arguments) }

const readConsent = (): Consent | null => {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null') as Consent | null
    return c && c.v === VERSION && Date.now() - c.at < MAX_AGE ? c : null
  } catch {
    return null
  }
}
const modeOf = (c: Pick<Consent, 'analytics' | 'marketing'>) => {
  const ads = c.marketing ? 'granted' : 'denied'
  return { analytics_storage: c.analytics ? 'granted' : 'denied', ad_storage: ads, ad_user_data: ads, ad_personalization: ads }
}
const applyConsent = (c: Pick<Consent, 'analytics' | 'marketing'>) => {
  gtag('consent', 'update', modeOf(c))
  // evento per i trigger di Tag Manager (es. il Pixel Meta)
  w.dataLayer.push({ event: 'consent_update', consent_analytics: c.analytics, consent_marketing: c.marketing })
}
const saveConsent = (analytics: boolean, marketing: boolean) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ analytics, marketing, at: Date.now(), v: VERSION }))
  } catch {
    /* storage bloccato: il consenso vale solo per questa visita */
  }
  applyConsent({ analytics, marketing })
}

// Consent Mode: tutto negato finché la persona non sceglie. Va impostato prima di caricare GTM.
gtag('consent', 'default', {
  analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  functionality_storage: 'granted', security_storage: 'granted', wait_for_update: 500,
})
const stored = readConsent()
if (stored) gtag('consent', 'update', modeOf(stored))
if (LEGAL.gtm) {
  w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${LEGAL.gtm}`
  document.head.append(s)
}

// ---------- testi ----------
const f = (v: string) => (v.startsWith('[') ? `<mark class="legal__todo">${v}</mark>` : v)
const T = { ...LEGAL, email: f(LEGAL.email), hosting: f(LEGAL.hosting) }
const mail = LEGAL.email.startsWith('[') ? T.email : `<a href="mailto:${LEGAL.email}">${LEGAL.email}</a>`

const PRIVACY = `
  <p class="legal__intro">Ci teniamo a essere chiari: qui trovi quali dati raccogliamo, perché lo facciamo, per quanto li teniamo e come puoi decidere tu cosa farne. Informativa ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (“GDPR”).</p>

  <h3>1. Chi tratta i tuoi dati</h3>
  <p><strong>Adveny non è una società</strong>: è il nome con cui lavora un collettivo di liberi professionisti indipendenti, con base a Cagliari. Non esiste quindi una “Adveny S.r.l.” né una sede legale: i tuoi dati sono trattati direttamente dai professionisti del collettivo, che decidono insieme come e perché usarli e ne sono per questo <strong>contitolari</strong> (art. 26 GDPR):</p>
  <ul>
    ${LEGAL.titolari.map((t) => `<li><strong>${t.nome}</strong>, libero professionista, P.IVA ${t.piva}, C.F. ${t.cf}</li>`).join('\n    ')}
  </ul>
  <p>Tra loro c’è un accordo di contitolarità che stabilisce chi fa cosa per proteggere i tuoi dati; se vuoi, te ne mandiamo il contenuto essenziale. Puoi esercitare i tuoi diritti nei confronti di ciascuno di loro, scrivendo a un unico indirizzo: ${mail}.</p>
  <p>In questa informativa, “Adveny” e “noi” indicano il collettivo, cioè i contitolari qui sopra.</p>

  <h3>2. Quali dati raccogliamo</h3>
  <ul>
    <li><strong>Dati che ci lasci tu</strong> nel form contatti (nome e cognome, email, telefono, ragione sociale, settore, oggetto e messaggio) e nell’analisi del potenziale (nome e cognome, nome dell’azienda, email, telefono, settore e le risposte al questionario sulla tua attività).</li>
    <li><strong>Candidature</strong>: se ci scrivi per lavorare con noi, i dati che inserisci nel messaggio. Ti chiediamo di non inviare dati particolari (salute, opinioni politiche o religiose ecc.) se non strettamente necessari.</li>
    <li><strong>Dati di navigazione</strong>: indirizzo IP, tipo di browser e dispositivo, pagine visitate, raccolti dai sistemi che fanno funzionare il sito e, solo con il tuo consenso, dagli strumenti di statistica e marketing descritti nella Cookie Policy.</li>
  </ul>

  <h3>3. Perché li usiamo e su quale base</h3>
  <div class="legal__table" role="table">
    <div role="row" class="legal__th"><span role="columnheader">Finalità</span><span role="columnheader">Base giuridica</span></div>
    <div role="row"><span role="cell">Rispondere alle tue richieste, inviarti via email il recap della tua analisi del potenziale e ricontattarti (entro 48 ore) per fissare un appuntamento con un consulente</span><span role="cell">Misure precontrattuali adottate su tua richiesta (art. 6.1.b GDPR)</span></div>
    <div role="row"><span role="cell">Valutare la tua candidatura</span><span role="cell">Misure precontrattuali su tua richiesta (art. 6.1.b)</span></div>
    <div role="row"><span role="cell">Misurare in forma aggregata come viene usato il sito (Google Analytics 4)</span><span role="cell">Consenso (art. 6.1.a), revocabile quando vuoi</span></div>
    <div role="row"><span role="cell">Misurare le campagne pubblicitarie e mostrarti annunci pertinenti su Facebook e Instagram (Pixel Meta)</span><span role="cell">Consenso (art. 6.1.a), revocabile quando vuoi</span></div>
    <div role="row"><span role="cell">Rispettare obblighi di legge, contabili e fiscali</span><span role="cell">Obbligo legale (art. 6.1.c)</span></div>
    <div role="row"><span role="cell">Garantire la sicurezza del sito e difendere i nostri diritti</span><span role="cell">Legittimo interesse (art. 6.1.f)</span></div>
  </div>
  <p>Non usiamo i tuoi dati per inviarti newsletter o promozioni e non li vendiamo a nessuno.</p>

  <h3>4. Sei obbligato a darceli?</h3>
  <p>No. Però i campi segnati come obbligatori servono per risponderti: senza, non possiamo inviarti il recap né ricontattarti. Il consenso ai cookie di statistica e marketing è libero: se lo rifiuti il sito funziona allo stesso modo.</p>

  <h3>5. Il punteggio dell’analisi</h3>
  <p>Il punteggio del potenziale è una stima orientativa calcolata sulle tue risposte, utile come punto di partenza per il confronto con il consulente. Non è una decisione automatizzata e non produce alcun effetto giuridico nei tuoi confronti (art. 22 GDPR).</p>

  <h3>6. Come li trattiamo</h3>
  <p>Con strumenti informatici e misure tecniche e organizzative adeguate a proteggerli da accessi non autorizzati, perdita o uso improprio. Vi accedono solo i professionisti del collettivo indicati al punto 1: nessun altro vede i tuoi contatti.</p>

  <h3>7. A chi li affidiamo</h3>
  <p>Ci appoggiamo ad alcuni fornitori, nominati responsabili del trattamento (art. 28 GDPR), che trattano i dati solo per nostro conto:</p>
  <ul>
    <li><strong>Brevo</strong> (Sendinblue SAS, Francia): gestione dei contatti e invio dell’email di recap.</li>
    <li><strong>Google Ireland Ltd</strong>: Google Tag Manager e Google Analytics 4.</li>
    <li><strong>Meta Platforms Ireland Ltd</strong>: Pixel Meta, per le campagne su Facebook e Instagram.</li>
    <li><strong>${T.hosting}</strong>: hosting del sito.</li>
  </ul>
  <p>Oltre a questi fornitori, i dati possono essere comunicati solo alle autorità che ne facciano legittima richiesta.</p>

  <h3>8. Trasferimenti fuori dall’Unione europea</h3>
  <p>Vercel, Google e Meta possono trattare alcuni dati negli Stati Uniti. Tutte e tre aderiscono all’EU-U.S. Data Privacy Framework, riconosciuto adeguato dalla Commissione europea (decisione del 10 luglio 2023), e adottano le Clausole contrattuali standard approvate dalla Commissione.</p>

  <h3>9. Per quanto tempo li teniamo</h3>
  <ul>
    <li><strong>Richieste di contatto e analisi del potenziale</strong>: 24 mesi dall’ultimo contatto, poi li cancelliamo. Se diventi cliente di uno dei professionisti del collettivo, li conserviamo per la durata del rapporto e poi per 10 anni per gli obblighi civilistici e fiscali.</li>
    <li><strong>Candidature</strong>: 24 mesi dall’invio.</li>
    <li><strong>Statistiche (Google Analytics 4)</strong>: 14 mesi.</li>
    <li><strong>Cookie e preferenze</strong>: per le durate indicate nella Cookie Policy.</li>
  </ul>

  <h3>10. I tuoi diritti</h3>
  <p>In ogni momento puoi chiederci di accedere ai tuoi dati, correggerli, cancellarli, limitarne l’uso, riceverli in un formato leggibile (portabilità) e opporti al trattamento basato sul legittimo interesse (artt. 15–21 GDPR). Puoi revocare il consenso ai cookie quando vuoi da “Preferenze cookie” in fondo a ogni pagina, senza conseguenze sui trattamenti già fatti.</p>
  <p>Basta scrivere a ${mail}: ti rispondiamo entro 30 giorni. Se ritieni che i tuoi dati siano trattati in modo non corretto puoi presentare reclamo al <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener">Garante per la protezione dei dati personali</a>.</p>

  <h3>11. Modifiche</h3>
  <p>Potremo aggiornare questa informativa, ad esempio se aggiungiamo nuovi servizi. La versione in vigore è sempre questa, con la data di aggiornamento qui sotto.</p>
  <p class="legal__date">Ultimo aggiornamento: ${T.aggiornata}</p>`

const COOKIE = `
  <p class="legal__intro">I cookie sono piccoli file che un sito salva nel tuo browser. Alcuni servono a far funzionare il sito, altri ci aiutano a capire come viene usato o a misurare le campagne pubblicitarie. Solo i primi sono attivi senza il tuo consenso.</p>

  <h3>Come gestire le tue scelte</h3>
  <p>Alla prima visita un banner ti chiede cosa attivare: puoi accettare tutto, rifiutare tutto o scegliere per categoria. Chiudere il banner equivale a rifiutare. Puoi cambiare idea in qualsiasi momento da <button type="button" class="legal__link" data-cookie-prefs>Preferenze cookie</button>, anche in fondo a ogni pagina. Ti richiederemo il consenso dopo 6 mesi o se cambiano i servizi che usiamo.</p>

  <h3>Tecnici · sempre attivi</h3>
  <p>Necessari al funzionamento del sito, non richiedono consenso (art. 122 del Codice Privacy).</p>
  <div class="legal__table legal__table--4" role="table">
    <div role="row" class="legal__th"><span role="columnheader">Nome</span><span role="columnheader">Fornitore</span><span role="columnheader">A cosa serve</span><span role="columnheader">Durata</span></div>
    <div role="row"><span role="cell">adveny-consent</span><span role="cell">Adveny</span><span role="cell">Ricorda le tue scelte sui cookie (salvato nel browser, localStorage)</span><span role="cell">6 mesi</span></div>
  </div>

  <h3>Statistici · solo con consenso</h3>
  <p>Google Analytics 4, gestito tramite Google Tag Manager: ci dice quante persone visitano il sito e quali pagine usano, in forma aggregata. Non ci permette di sapere chi sei.</p>
  <div class="legal__table legal__table--4" role="table">
    <div role="row" class="legal__th"><span role="columnheader">Nome</span><span role="columnheader">Fornitore</span><span role="columnheader">A cosa serve</span><span role="columnheader">Durata</span></div>
    <div role="row"><span role="cell">_ga</span><span role="cell">Google</span><span role="cell">Distingue i visitatori</span><span role="cell">2 anni</span></div>
    <div role="row"><span role="cell">_ga_*</span><span role="cell">Google</span><span role="cell">Mantiene lo stato della sessione</span><span role="cell">2 anni</span></div>
  </div>

  <h3>Marketing · solo con consenso</h3>
  <p>Pixel Meta: misura l’efficacia delle nostre campagne su Facebook e Instagram e ci permette di mostrare annunci a chi ha già visitato il sito.</p>
  <div class="legal__table legal__table--4" role="table">
    <div role="row" class="legal__th"><span role="columnheader">Nome</span><span role="columnheader">Fornitore</span><span role="columnheader">A cosa serve</span><span role="columnheader">Durata</span></div>
    <div role="row"><span role="cell">_fbp</span><span role="cell">Meta</span><span role="cell">Collega le visite al sito agli annunci</span><span role="cell">3 mesi</span></div>
    <div role="row"><span role="cell">fr</span><span role="cell">Meta</span><span role="cell">Pubblicità e misurazione degli annunci</span><span role="cell">3 mesi</span></div>
  </div>

  <h3>Informative dei fornitori</h3>
  <ul>
    <li><a href="https://policies.google.com/privacy?hl=it" target="_blank" rel="noopener">Google — Privacy</a> e <a href="https://business.safety.google/privacy/" target="_blank" rel="noopener">uso dei dati nei prodotti per le aziende</a></li>
    <li><a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener">Meta — Informativa sulla privacy</a></li>
  </ul>

  <h3>Dal browser</h3>
  <p>Puoi anche cancellare o bloccare i cookie dalle impostazioni del browser: <a href="https://support.google.com/chrome/answer/95647?hl=it" target="_blank" rel="noopener">Chrome</a>, <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a>, <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noopener">Firefox</a>, <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener">Edge</a>.</p>
  <p>Per il resto (titolare, diritti, reclami) vale la <button type="button" class="legal__link" data-legal="privacy">Privacy Policy</button>.</p>
  <p class="legal__date">Ultimo aggiornamento: ${T.aggiornata}</p>`

// ---------- finestra ----------
type Tab = 'privacy' | 'cookie'
let dialog: HTMLDialogElement

function buildDialog() {
  dialog = document.createElement('dialog')
  dialog.className = 'legal'
  dialog.setAttribute('aria-labelledby', 'legal-title')
  dialog.innerHTML = `
    <div class="legal__panel glass">
      <header class="legal__head">
        <p class="eyebrow" id="legal-title">Privacy e cookie</p>
        <div class="legal__tabs" role="tablist">
          <button type="button" role="tab" data-tab="privacy" aria-controls="legal-privacy">Privacy Policy</button>
          <button type="button" role="tab" data-tab="cookie" aria-controls="legal-cookie">Cookie Policy</button>
        </div>
        <button class="modal__close legal__close" type="button" aria-label="Chiudi" data-legal-close></button>
      </header>
      <div class="legal__body" data-lenis-prevent>
        <article id="legal-privacy" role="tabpanel" data-panel="privacy"><h2 class="legal__title">Privacy Policy</h2>${PRIVACY}</article>
        <article id="legal-cookie" role="tabpanel" data-panel="cookie"><h2 class="legal__title">Cookie Policy</h2>${COOKIE}</article>
      </div>
    </div>`
  document.body.append(dialog)
  dialog.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    if (t === dialog || t.closest('[data-legal-close]')) return closeLegal()
    const tab = t.closest<HTMLElement>('[data-tab]')
    if (tab) showTab(tab.dataset.tab as Tab)
  })
  dialog.addEventListener('close', () => getLenis()?.start())
}

function showTab(tab: Tab) {
  dialog.querySelectorAll<HTMLElement>('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)))
  dialog.querySelectorAll<HTMLElement>('[data-panel]').forEach((p) => (p.hidden = p.dataset.panel !== tab))
  dialog.querySelector('.legal__body')!.scrollTop = 0
}

export function openLegal(tab: Tab = 'privacy') {
  if (!dialog) buildDialog()
  showTab(tab)
  if (!dialog.open) {
    getLenis()?.stop()
    dialog.showModal()
  }
}
function closeLegal() {
  dialog.classList.add('is-closing')
  setTimeout(() => {
    dialog.classList.remove('is-closing')
    dialog.close()
  }, 280)
}

// ---------- banner ----------
let banner: HTMLElement | null = null

function showBanner(prefs = false) {
  const cur = readConsent()
  if (!banner) {
    banner = document.createElement('section')
    banner.className = 'consent glass'
    banner.setAttribute('aria-label', 'Preferenze cookie')
    banner.innerHTML = `
      <button class="consent__x" type="button" aria-label="Chiudi e rifiuta" data-consent="none"></button>
      <p class="consent__title">Cookie, solo se vuoi.</p>
      <p class="consent__text">Usiamo cookie tecnici per far funzionare il sito e, con il tuo consenso, cookie di statistica (Google Analytics) e di marketing (Pixel Meta) per capire cosa funziona e misurare le nostre campagne. <button type="button" class="legal__link" data-legal="cookie">Cookie Policy</button></p>
      <div class="consent__prefs" data-consent-prefs hidden>
        <label class="consent__opt"><span><strong>Tecnici</strong><small>Sempre attivi</small></span><input type="checkbox" checked disabled /><i></i></label>
        <label class="consent__opt"><span><strong>Statistiche</strong><small>Google Analytics 4</small></span><input type="checkbox" data-cat="analytics" /><i></i></label>
        <label class="consent__opt"><span><strong>Marketing</strong><small>Pixel Meta</small></span><input type="checkbox" data-cat="marketing" /><i></i></label>
      </div>
      <div class="consent__actions">
        <button class="btn btn--glass btn--sm" type="button" data-consent="none"><span>Rifiuta</span></button>
        <button class="btn btn--glass btn--sm" type="button" data-consent="custom"><span>Personalizza</span></button>
        <button class="btn btn--light btn--sm" type="button" data-consent="all"><span>Accetta tutti</span></button>
      </div>`
    document.body.append(banner)
    banner.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-consent]')
      if (!b || !banner) return
      const box = banner.querySelector<HTMLElement>('[data-consent-prefs]')!
      const val = (cat: string) => banner!.querySelector<HTMLInputElement>(`[data-cat="${cat}"]`)!.checked
      const mode = b.dataset.consent
      if (mode === 'custom' && box.hidden) {
        box.hidden = false
        b.querySelector('span')!.textContent = 'Salva scelte'
        return
      }
      if (mode === 'all') saveConsent(true, true)
      else if (mode === 'none') saveConsent(false, false)
      else saveConsent(val('analytics'), val('marketing'))
      hideBanner()
    })
  }
  banner.querySelector<HTMLInputElement>('[data-cat="analytics"]')!.checked = !!cur?.analytics
  banner.querySelector<HTMLInputElement>('[data-cat="marketing"]')!.checked = !!cur?.marketing
  const box = banner.querySelector<HTMLElement>('[data-consent-prefs]')!
  box.hidden = !prefs
  banner.querySelector('[data-consent="custom"] span')!.textContent = prefs ? 'Salva scelte' : 'Personalizza'
  requestAnimationFrame(() => banner!.classList.add('is-on'))
}
function hideBanner() {
  banner?.classList.remove('is-on')
}

// ---------- avvio ----------
export function initLegal() {
  document.querySelectorAll('[data-legal-owners]').forEach((el) => {
    el.innerHTML = LEGAL.titolari.map((t) => `${t.nome} · P.IVA ${t.piva}`).join('<br />')
  })
  // link a privacy/cookie ovunque (footer, form, banner): si apre la finestra
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement
    const link = t.closest<HTMLElement>('[data-legal]')
    if (link) {
      e.preventDefault()
      openLegal(link.dataset.legal as Tab)
      return
    }
    if (t.closest('[data-cookie-prefs]')) {
      e.preventDefault()
      if (dialog?.open) closeLegal()
      showBanner(true)
    }
  })
  if (!stored) setTimeout(() => showBanner(), 900)
}
