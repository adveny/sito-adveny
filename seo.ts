// ============================================================
// SEO — tag invisibili aggiunti a ogni pagina in fase di build (vedi vite.config.ts):
// canonical, anteprime social e dati strutturati. Obiettivo: attività in Sardegna,
// soprattutto Cagliari. Nessun testo visibile passa da qui.
// ============================================================
export const SITE = 'https://adveny.it'
const OG_IMAGE = `${SITE}/img/og-adveny.jpg`

// solo Sardegna: Cagliari, la sua area metropolitana e l'isola
const AREA = [
  { '@type': 'City', name: 'Cagliari', sameAs: 'https://www.wikidata.org/wiki/Q1897' },
  { '@type': 'AdministrativeArea', name: 'Città metropolitana di Cagliari', sameAs: 'https://www.wikidata.org/wiki/Q3622022' },
  { '@type': 'State', name: 'Sardegna', sameAs: 'https://www.wikidata.org/wiki/Q1462' },
]

const TEAM = [
  ['Francesco Berutti', 'Growth Manager e Digital Strategist'],
  ['Michele Pirro', 'Copywriter e Business Consultant'],
  ['Simone Concu', 'Media Buyer e ADV Specialist'],
  ['Matteo Sanna', 'Art Director e Graphic Designer'],
  ['Matteo Pastorino', 'Fullstack Developer e Software Engineer'],
  ['Andrea Loddo', 'UX/UI Designer e Graphic Designer'],
  ['Federico Angioni', 'Video Director e Videomaker'],
]

// i sei servizi della pagina Servizi, con le loro descrizioni (testi presi dalla pagina)
const SERVICES = [
  ['Growth Strategy', 'Costruiamo percorsi di crescita per evolvere insieme al tuo mercato. Dalle idee ai processi, trasformiamo il potenziale in una direzione concreta.'],
  ['Brand Design', 'Disegniamo brand che lasciano il segno. Creiamo identità che parlano con coerenza, stile e riconoscibilità.'],
  ['Comunicazione e contenuti', 'Ogni brand ha qualcosa da dire. Noi lo trasformiamo in immagini, video e contenuti capaci di catturare attenzione, costruire connessioni reali e più vendite.'],
  ['Web e Digital Experience', 'Progettiamo esperienze digitali intuitive, essenziali e coinvolgenti. Siti web e interfacce pensati per guidare le persone con naturalezza.'],
  ['Advertising', 'Portiamo il tuo messaggio davanti alle persone giuste, nel momento giusto. Strategie pubblicitarie costruite per generare attenzione, fiducia e risultati.'],
  ['Formazione aziendale', 'Analizziamo, individuiamo ciò che può crescere e come. Una visione strategica per prendere decisioni più solide, sostenibili e profittevoli.'],
]

const ORG = {
  '@type': ['ProfessionalService', 'Organization'],
  '@id': `${SITE}/#adveny`,
  name: 'Adveny',
  description:
    'Collettivo di professionisti del marketing e della comunicazione con base a Cagliari: strategia, brand, contenuti, siti web, advertising e formazione per le attività della Sardegna.',
  url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/img/adveny-logo.png`, width: 512, height: 512 },
  image: OG_IMAGE,
  email: 'advenystudio@gmail.com',
  // attività senza sede aperta al pubblico: solo la città, niente indirizzo
  address: { '@type': 'PostalAddress', addressLocality: 'Cagliari', addressRegion: 'CA', addressCountry: 'IT' },
  areaServed: AREA,
  knowsLanguage: 'it',
  knowsAbout: ['Marketing', 'Comunicazione', 'Social media marketing', 'Advertising', 'Brand design', 'Siti web', 'SEO', 'Video', 'Consulenza marketing'],
  founder: TEAM.slice(0, 2).map(([name]) => ({ '@type': 'Person', name })),
  member: TEAM.map(([name, jobTitle]) => ({ '@type': 'Person', name, jobTitle })),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servizi di marketing e comunicazione',
    itemListElement: SERVICES.map(([name, description]) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name, description, areaServed: AREA, provider: { '@id': `${SITE}/#adveny` } },
    })),
  },
  // TODO: aggiungere i profili social appena creati
  sameAs: [] as string[],
}

const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Adveny', inLanguage: 'it-IT', publisher: { '@id': `${SITE}/#adveny` } }

// nomi delle pagine per le briciole di pane
const CRUMB: Record<string, string> = { '/chi-siamo.html': 'Chi siamo', '/servizi.html': 'Servizi', '/contatti.html': 'Contatti', '/potenziometro.html': 'Analisi del potenziale' }
const PAGE_TYPE: Record<string, string> = { '/chi-siamo.html': 'AboutPage', '/contatti.html': 'ContactPage' }

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

export function seoTags(path: string, title: string, description: string) {
  const url = path === '/' || path === '/index.html' ? `${SITE}/` : `${SITE}${path}`
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
  return `
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="it_IT" />
    <meta property="og:site_name" content="Adveny" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${attr(title)}" />
    <meta property="og:description" content="${attr(description)}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Adveny, marketing e comunicazione a Cagliari e in Sardegna" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${attr(title)}" />
    <meta name="twitter:description" content="${attr(description)}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <script type="application/ld+json">${json}</script>`
}
