// ============================================================
// SEO — tag invisibili e pre-rendering statico aggiunti a ogni pagina in fase
// di build (vedi vite.config.ts): canonical, anteprime social, dati strutturati
// JSON-LD e contenuti HTML pre-renderizzati per i crawler (Casi Studio, Team,
// Potenziometro). Obiettivo: attività in Sardegna, soprattutto Cagliari.
// Nessun cambiamento visivo o estetico passa da qui.
// ============================================================
import { CASES, SECTORS, STEPS, type Case, type Question } from './src/data'
import { ICONS } from './src/icons'

export const SITE = 'https://adveny.it'
const OG_IMAGE = `${SITE}/img/og-adveny.jpg`

// Incolla qui eventuale codice di verifica di Google Search Console (es. 'abc123...')
export const GOOGLE_SITE_VERIFICATION = ''

// solo Sardegna: Cagliari, la sua area metropolitana e l'isola
const AREA = [
  { '@type': 'City', name: 'Cagliari', sameAs: 'https://www.wikidata.org/wiki/Q1897' },
  { '@type': 'AdministrativeArea', name: 'Città metropolitana di Cagliari', sameAs: 'https://www.wikidata.org/wiki/Q3622022' },
  { '@type': 'State', name: 'Sardegna', sameAs: 'https://www.wikidata.org/wiki/Q1462' },
]

export const TEAM_MEMBERS = [
  { name: 'Francesco Berutti', role: 'Growth Manager e Digital Strategist', photo: '/img/team/francesco-berutti.webp' },
  { name: 'Michele Pirro', role: 'Copywriter e Business Consultant', photo: '/img/team/michele-pirro.webp' },
  { name: 'Simone Concu', role: 'Media Buyer e ADV Specialist', photo: '/img/team/simone-concu.webp' },
  { name: 'Matteo Sanna', role: 'Art Director e Graphic Designer', photo: '/img/team/matteo-sanna.webp' },
  { name: 'Matteo Pastorino', role: 'Fullstack Developer e Software Engineer', photo: '/img/team/matteo-pastorino.webp' },
  { name: 'Andrea Loddo', role: 'UX/UI Designer e Graphic Designer', photo: '/img/team/andrea-loddo.webp' },
  { name: 'Federico Angioni', role: 'Video Director e Videomaker', photo: '/img/team/federico-angioni.webp' },
]

// i sei servizi della pagina Servizi, allineati ai testi attuali
const SERVICES = [
  ['Growth Strategy', 'Costruiamo percorsi di crescita per evolvere insieme al tuo mercato. Dalle idee ai processi, trasformiamo il potenziale in una direzione concreta.'],
  ['Brand Design e grafiche', 'Disegniamo brand che lasciano il segno. Creiamo identità che parlano con coerenza, stile e riconoscibilità.'],
  ['Comunicazione e produzioni video', 'Ogni brand ha qualcosa da dire. Noi lo trasformiamo in immagini e video capaci di catturare attenzione, costruire connessioni reali e generare più vendite.'],
  ['Web & Digital Experience', 'Progettiamo esperienze digitali intuitive, essenziali e coinvolgenti. Siti web e interfacce pensati per guidare le persone con naturalezza.'],
  ['Advertising', 'Portiamo il tuo messaggio davanti alle persone giuste, nel momento giusto. Strategie pubblicitarie costruite per generare attenzione, fiducia e risultati in ogni canale e piattaforma.'],
  ['Consulenza aziendale', 'Leggiamo numeri e processi insieme a chi vive l’azienda ogni giorno. Mettiamo in relazione informazioni spesso frammentate per far emergere domande, criticità e opportunità da cui ricavare soluzioni applicabili per la crescita.'],
]

const ORG = {
  '@type': ['ProfessionalService', 'MarketingAgency', 'Organization'],
  '@id': `${SITE}/#adveny`,
  name: 'Adveny',
  alternateName: ['Adveny Agenzia di Marketing', 'Adveny Cagliari', 'Adveny Marketing e Comunicazione'],
  description:
    'Adveny è un collettivo di professionisti del marketing e della comunicazione con base a Cagliari: strategia di crescita, brand design, contenuti e video, siti web, advertising e consulenza aziendale per le imprese della Sardegna.',
  url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/img/adveny-logo.png`, width: 512, height: 512 },
  image: OG_IMAGE,
  email: 'info@adveny.it',
  // attività senza sede aperta al pubblico: solo la città, niente indirizzo
  address: { '@type': 'PostalAddress', addressLocality: 'Cagliari', addressRegion: 'CA', addressCountry: 'IT' },
  areaServed: AREA,
  knowsLanguage: 'it-IT',
  knowsAbout: [
    'Marketing strategico',
    'Agenzia di marketing Cagliari',
    'Agenzia di comunicazione Sardegna',
    'Social media marketing',
    'Advertising Meta Ads e Google Ads',
    'Brand design e identità visiva',
    'Web design e sviluppo siti web',
    'SEO e posizionamento su Google',
    'Produzione video e content creation',
    'Consulenza aziendale e sviluppo business',
  ],
  founder: TEAM_MEMBERS.slice(0, 2).map(({ name, role }) => ({ '@type': 'Person', name, jobTitle: role })),
  member: TEAM_MEMBERS.map(({ name, role, photo }) => ({
    '@type': 'Person',
    name,
    jobTitle: role,
    image: photo ? `${SITE}${photo}` : undefined,
  })),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servizi di marketing e comunicazione',
    itemListElement: SERVICES.map(([name, description]) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name, description, areaServed: AREA, provider: { '@id': `${SITE}/#adveny` } },
    })),
  },
  // TODO: aggiungere gli URL dei profili social ufficiali appena creati
  sameAs: [] as string[],
}

const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: `${SITE}/`,
  name: 'Adveny',
  alternateName: 'Adveny — Agenzia di Marketing e Comunicazione a Cagliari e in Sardegna',
  inLanguage: 'it-IT',
  publisher: { '@id': `${SITE}/#adveny` },
}

const NAV_LIST = {
  '@type': 'ItemList',
  '@id': `${SITE}/#navigation`,
  name: 'Menu principale Adveny',
  itemListElement: [
    { '@type': 'SiteNavigationElement', position: 1, name: 'Home', url: `${SITE}/` },
    { '@type': 'SiteNavigationElement', position: 2, name: 'Chi siamo', url: `${SITE}/chi-siamo.html` },
    { '@type': 'SiteNavigationElement', position: 3, name: 'Servizi', url: `${SITE}/servizi.html` },
    { '@type': 'SiteNavigationElement', position: 4, name: 'Analisi del potenziale', url: `${SITE}/potenziometro.html` },
    { '@type': 'SiteNavigationElement', position: 5, name: 'Contatti', url: `${SITE}/contatti.html` },
  ],
}

const CASES_LIST = {
  '@type': 'ItemList',
  '@id': `${SITE}/#casi-studio`,
  name: 'Casi studio e storie di successo Adveny',
  itemListElement: CASES.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'CreativeWork',
      name: `${c.name} — ${c.story?.headline ?? c.desc}`,
      description: c.desc,
      keywords: c.tags.join(', '),
      creator: { '@id': `${SITE}/#adveny` },
      ...(c.video ? { image: `${SITE}/video/${c.video}.jpg` } : {}),
    },
  })),
}

// nomi delle pagine per le briciole di pane
const CRUMB: Record<string, string> = {
  '/chi-siamo.html': 'Chi siamo',
  '/servizi.html': 'Servizi',
  '/contatti.html': 'Contatti',
  '/potenziometro.html': 'Analisi del potenziale',
}
const PAGE_TYPE: Record<string, string> = { '/chi-siamo.html': 'AboutPage', '/contatti.html': 'ContactPage' }

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

export function seoTags(path: string, title: string, description: string) {
  const isHome = path === '/' || path === '/index.html'
  const url = isHome ? `${SITE}/` : `${SITE}${path}`
  const page: Record<string, unknown> = {
    '@type': PAGE_TYPE[path] ?? 'WebPage',
    '@id': `${url}#pagina`,
    url,
    name: title,
    description,
    inLanguage: 'it-IT',
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#adveny` },
  }
  const graph: unknown[] = [ORG, WEBSITE, page]
  if (isHome) {
    graph.push(NAV_LIST, CASES_LIST)
  }
  if (CRUMB[path]) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: CRUMB[path], item: url },
      ],
    })
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')
  const verifyTag = GOOGLE_SITE_VERIFICATION
    ? `\n    <meta name="google-site-verification" content="${attr(GOOGLE_SITE_VERIFICATION)}" />`
    : ''
  return `${verifyTag}
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="author" content="Adveny" />
    <meta name="geo.region" content="IT-CA" />
    <meta name="geo.placename" content="Cagliari, Sardegna" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="it_IT" />
    <meta property="og:site_name" content="Adveny" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${attr(title)}" />
    <meta property="og:description" content="${attr(description)}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Adveny — Agenzia di marketing e comunicazione a Cagliari e in Sardegna" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${attr(title)}" />
    <meta name="twitter:description" content="${attr(description)}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <script type="application/ld+json">${json}</script>`
}

// ============================================================
// PRE-RENDERING STATICO DEI CONTENUTI DINAMICI (per Googlebot)
// ============================================================
function fmtMetric(v: number, unit = '') {
  return `+${Math.round(v).toLocaleString('it-IT')}${unit}`
}

function caseStorySEO(c: Case) {
  if (!c.story) return ''
  const { headline, subtitle, sections, quote } = c.story
  return `<div class="sr-only"><h4>${headline}</h4>${subtitle ? `<p>${subtitle}</p>` : ''}${sections
    .map((s) => `<h5>${s.title}</h5>${s.items.map((it) => `<p>${it.lead ? `<strong>${it.lead}</strong> ` : ''}${it.text}</p>`).join('')}`)
    .join('')}${quote ? `<blockquote>${quote}</blockquote>` : ''}</div>`
}

export function renderStaticCases(): string {
  return CASES.map((c, i) => {
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
    ${caseStorySEO(c)}
  </article>`
  }).join('')
}

export function renderStaticSectors(): string {
  return SECTORS.map(
    (s, i) => `<button class="opt" type="button" aria-pressed="false" data-sector="${i}">
      <span class="opt__icon">${ICONS[s.icon]}</span><span class="opt__label">${s.label}</span>
      <span class="opt__check">${ICONS.check}</span></button>`,
  ).join('')
}

const BUST =
  'M28 250C32 214 58 197 84 191L86 173C70 163 62 143 62 118C62 86 78 60 100 60C122 60 138 86 138 118C138 143 130 163 114 173L116 191C142 197 168 214 172 250'
const SCAN = Array.from({ length: 27 }, (_, k) => {
  const y = 62 + k * 7
  return `<path d="M0 ${y}Q100 ${y + 9} 200 ${y}" />`
}).join('')

function staticAvatar(i: number, open = false) {
  const photo = TEAM_MEMBERS[i]?.photo
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
      ${photo ? `<img class="avatar__photo" src="${photo}" alt="Ritratto illustrato di ${TEAM_MEMBERS[i].name}, ${TEAM_MEMBERS[i].role} di Adveny" loading="lazy" width="720" height="900" />` : ''}
      <span class="avatar__num">${open ? '+1' : `${String(i + 1).padStart(2, '0')}<small>/${String(TEAM_MEMBERS.length).padStart(2, '0')}</small>`}</span>
    </div>`
}

export function renderStaticTeam(): string {
  return (
    TEAM_MEMBERS.map(
      (m, i) => `
  <article class="member glass" data-reveal data-delay="${(i % 4) * 0.08}">
    ${staticAvatar(i)}
    <div class="member__meta">
      <h3 class="member__name">${m.name}</h3>
      <p class="member__role">${m.role}</p>
    </div>
  </article>`,
    ).join('') +
    `
  <article class="member member--open glass" data-reveal data-delay="0.24">
    ${staticAvatar(TEAM_MEMBERS.length, true)}
    <div class="member__meta">
      <h3 class="member__name">Potresti essere tu</h3>
      <p class="member__role">Candidati per lavorare con noi</p>
      <a class="btn btn--light btn--sm member__cta" href="/contatti.html?candidatura=1"><span>Candidati</span></a>
    </div>
  </article>`
  )
}

export function renderStaticPotenziometro(): { stepsNav: string; mainHtml: string } {
  const s = STEPS[0]
  const q: Question = s.questions[0]
  const n = s.questions.length
  const stepsNav = STEPS.map((st, i) => `<li class="${i === 0 ? 'is-current' : ''}">${ICONS[st.icon]}<span>${st.title}</span></li>`).join('')
  const optionsHtml =
    q.type === 'sector'
      ? `<div class="options" role="group" aria-labelledby="q-${q.key}">${q.options
          .map(
            (o) => `
      <button class="opt" type="button" data-key="${q.key}" data-val="${attr(o.label)}" data-mode="single" aria-pressed="false">
        <span class="opt__icon">${ICONS[o.icon]}</span><span class="opt__label">${o.label}</span><span class="opt__check">${ICONS.check}</span>
      </button>`,
          )
          .join('')}</div>`
      : ''
  const seoSummary = `<div class="sr-only">
    <h2>Analisi del potenziale aziendale Adveny — Agenzia di Marketing e Comunicazione a Cagliari e in Sardegna</h2>
    <p>Valuta in 7 step il potenziale di crescita della tua impresa in Sardegna e ricevi un report preliminare con consulenza dedicata entro 48 ore.</p>
    <ol>${STEPS.map((st) => `<li><strong>${st.title}:</strong> ${st.subtitle}</li>`).join('')}</ol>
  </div>`
  const mainHtml = `
    <form class="pz__main" data-step novalidate>
      <div class="pz__intro">
        <div class="pz__icon glass">${ICONS[s.icon]}</div>
        <p class="eyebrow">Step 1</p>
        <h1 class="h2" tabindex="-1" data-title>${s.title}</h1>
        <p class="lead">${s.subtitle}</p>
      </div>
      <div class="pz__card glass" data-card>
        <div class="pz__qcount"><span>Domanda 1 di ${n}</span><span class="pz__qdots" aria-hidden="true">${s.questions.map((_, i) => `<i class="${i === 0 ? 'is-on' : ''}"></i>`).join('')}</span></div>
        <div class="pz__q">
          <p class="pz__label" id="q-${q.key}" tabindex="-1">${q.icon ? `<span class="pz__qicon">${ICONS[q.icon]}</span>` : ''}<span>${q.label}</span></p>
          ${optionsHtml}
        </div>
        <div class="pz__actions">
          <button class="btn btn--light" type="submit" data-next disabled><span>Avanti</span></button>
        </div>
      </div>
    </form>${seoSummary}`
  return { stepsNav, mainHtml }
}
