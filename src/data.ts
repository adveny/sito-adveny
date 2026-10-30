// Testi del potenziometro, identici a quelli di adveny.it/potenziometro
import { ICONS } from './icons'

type Opt = { label: string; icon: keyof typeof ICONS }
type Icon = keyof typeof ICONS
// icon: l'icona accanto alla domanda
export type Question =
  | { key: string; label: string; icon: Icon; hint?: string; type: 'sector'; options: Opt[] }
  | { key: string; label: string; icon: Icon; hint?: string; type: 'slider'; options: string[] }
  | { key: string; label: string; icon: Icon; hint?: string; type: 'multi' | 'single'; options: string[]; max?: number }
  | { key: string; label: string; icon: Icon; hint?: string; type: 'textarea'; optional?: boolean; placeholder: string }
  | { key: string; type: 'form'; label?: string; icon?: Icon; hint?: string; fields: { key: string; placeholder: string; type: string; autoComplete: string }[] }

export type Step = { title: string; subtitle: string; transition: string | null; cta?: string; icon: keyof typeof ICONS; questions: Question[] }

export const SECTORS: Opt[] = [
  { label: 'Edilizia, Impiantistica, Progettazione e Manutenzione', icon: 'build' },
  { label: 'Sanità e Professioni Mediche', icon: 'health' },
  { label: 'Servizi Professionali', icon: 'briefcase' },
  { label: 'Studio Legale e Attività di Consulenza', icon: 'scales' },
  { label: 'Commercio e Artigianato', icon: 'store' },
  { label: 'Tecnologia e Digitale', icon: 'laptop' },
  { label: 'Turismo, Ristorazione e Strutture Ricettive', icon: 'dish' },
  { label: 'Produzione Primaria', icon: 'sprout' },
  { label: 'Servizi al Cliente e Esperienze', icon: 'users' },
  { label: 'Altro', icon: 'plus' },
]

export const STEPS: Step[] = [
  {
    title: 'La tua attività',
    subtitle: 'Partiamo dalle basi. Dicci in che settore operi e quanto è grande il tuo team oggi.',
    transition: 'Dato acquisito. Analizziamo i tuoi canali.',
    icon: 'compass',
    questions: [
      { key: 'settore', icon: 'layers', label: 'In quale settore opera la tua azienda o attività?', type: 'sector', options: SECTORS },
      { key: 'team', icon: 'team', label: 'Quante persone lavorano nella tua azienda?', type: 'slider', options: ['Solo io', '2–5', '6–15', '16–50', '50+'] },
    ],
  },
  {
    title: 'I tuoi clienti',
    subtitle: 'Capire da dove arrivano e cosa succede dopo il primo acquisto ci dice molto sul tuo potenziale.',
    transition: 'Acquisito. Ora vediamo cosa hai in mano.',
    icon: 'magnet',
    questions: [
      {
        key: 'acquisizione', icon: 'funnel', label: 'Come arrivano i tuoi nuovi clienti?', hint: 'Seleziona tutte le voci che ti riguardano.', type: 'multi',
        options: ['Passaparola', 'Mi trovano su Google', 'Social media', 'Pubblicità (online o offline)', 'Fiere, eventi, mercati', 'Collaborazioni con altre attività', 'Portali e piattaforme', 'Non lo so con certezza'],
      },
      {
        key: 'retention', icon: 'heartLoop', label: 'Cosa fai per mantenere il rapporto con chi ha già comprato?', hint: 'Anche qui, seleziona tutto ciò che fai.', type: 'multi',
        options: ['Li richiamo o scrivo periodicamente', 'Invio aggiornamenti via WhatsApp', 'Mando email o newsletter', 'Ho un programma fedeltà o tessera', 'Pubblico sui social e mi seguono', 'Al momento non faccio molto'],
      },
    ],
  },
  {
    title: 'I tuoi strumenti',
    subtitle: 'Mappiamo quello che hai già e quello che stai usando attivamente. Due cose diverse.',
    transition: 'Strumenti mappati. Analizziamo il tuo metodo.',
    icon: 'tools',
    questions: [
      {
        key: 'asset', icon: 'toolbox', label: 'Quali di questi strumenti hai già?', hint: 'Anche se non li usi al meglio, selezionali.', type: 'multi',
        options: ['Sito web', 'Profili social attivi', 'Scheda Google (Google Maps)', 'Sistema per raccogliere contatti', 'Un gestionale o CRM', 'E-commerce o shop online', 'Nessuno di questi'],
      },
      {
        key: 'attivita', icon: 'pulse', label: 'Quali di queste attività stai facendo oggi?', hint: 'Solo quelle che fai in modo continuativo.', type: 'multi',
        options: ['Pubblico contenuti sui social', 'Campagne sponsorizzate', 'Posizionamento su Google', 'Comunicazioni ai clienti (email, WhatsApp, SMS)', 'Promozioni e offerte periodiche', 'Collaborazioni o partnership attive', 'Non ho strategie attive', 'Non ho familiarità con queste attività'],
      },
    ],
  },
  {
    title: 'Il tuo metodo',
    subtitle: 'Il modo in cui migliori ciò che offri determina quanto velocemente puoi crescere.',
    transition: 'Metodo registrato. Ora guardiamo avanti.',
    icon: 'loop',
    questions: [
      {
        key: 'miglioramento', icon: 'trend', label: 'Come migliori il tuo prodotto o servizio?', hint: 'Seleziona tutti gli approcci che utilizzi.', type: 'multi',
        options: ['Chiedo feedback ai clienti', 'Studio cosa fanno i concorrenti', 'Investo in formazione mia o del team', 'Analizzo i dati di vendita', "Mi affido all'intuito e all'esperienza", 'Non ho un metodo preciso'],
      },
    ],
  },
  {
    title: 'La tua direzione',
    subtitle: "Sapere cosa conta davvero per te e dove vuoi arrivare cambia tutto nell'analisi.",
    transition: "Obiettivi acquisiti. Ultimi dati per completare l'analisi.",
    icon: 'target',
    questions: [
      {
        key: 'priorita', icon: 'star', label: 'Qual è la cosa più importante per te oggi?', hint: 'Scegline una sola — quella che pesa di più.', type: 'single',
        options: ['Clienti soddisfatti che tornano', 'Più margini a parità di sforzo', 'Capire i numeri e decidere con i dati', 'Far crescere il team e delegare', 'Farmi conoscere di più nella mia zona'],
      },
      {
        key: 'obiettivi', icon: 'flag', label: 'Quali obiettivi vuoi raggiungere nei prossimi 12 mesi?', hint: 'Seleziona fino a 3 obiettivi.', type: 'multi', max: 3,
        options: ['Acquisire più clienti nuovi', 'Fidelizzare i clienti che ho già', 'Aumentare il valore per cliente', 'Costruire un brand riconoscibile', 'Automatizzare i processi', 'Espandermi (sede, mercato, online)', 'Più tempo libero senza perdere fatturato'],
      },
    ],
  },
  {
    title: 'La tua dimensione',
    subtitle: 'Ogni fase di crescita ha le sue leve. Dicci dove sei oggi.',
    transition: 'Analisi quasi completa. Un ultimo passaggio.',
    icon: 'chart',
    questions: [
      {
        key: 'fase', icon: 'stairs', label: 'In che fase si trova la tua attività?', hint: "Non c'è una risposta giusta — ogni fase ha il suo potenziale.", type: 'single',
        options: ['Sto avviando (primi clienti, tutto da costruire)', "Sto costruendo (il lavoro c'è, devo strutturarmi)", 'Sto crescendo (funziona, voglio accelerare)', 'Mi sto consolidando (proteggere e ottimizzare)', 'Sto scalando (è il momento del salto)'],
      },
      {
        key: 'racconto', icon: 'chat', label: 'Raccontaci la tua azienda', hint: "Facoltativo. Ci aiuta a preparare un'analisi più precisa per te.", type: 'textarea', optional: true,
        placeholder: "Es. Abbiamo un ristorante a Cagliari aperto da 5 anni, il problema è che d'inverno il locale si svuota...",
      },
    ],
  },
  {
    title: 'Chi sei',
    subtitle: 'Inserisci i tuoi dati per ricevere il report con il tuo punteggio di potenziale.',
    transition: null,
    cta: 'Scopri il tuo potenziale',
    icon: 'user',
    questions: [
      {
        key: 'form', type: 'form',
        fields: [
          { key: 'nome_cognome', placeholder: 'Nome e cognome', type: 'text', autoComplete: 'name' },
          { key: 'azienda', placeholder: 'Nome azienda', type: 'text', autoComplete: 'organization' },
          { key: 'email', placeholder: 'Email', type: 'email', autoComplete: 'email' },
          { key: 'telefono', placeholder: 'Telefono', type: 'tel', autoComplete: 'tel' },
        ],
      },
    ],
  },
]

export type CaseSection = {
  title: string
  items: { lead?: string; text: string }[]
}

export type CaseStory = {
  headline: string
  subtitle?: string
  sections: CaseSection[]
  quote?: string
}

export type Case = {
  id: string
  name: string
  desc: string
  tags: string[]
  // valore finale, suffisso (%, € o niente) ed etichetta; il "+" davanti è sempre implicito
  metrics: { v: number; unit?: string; label: string }[]
  video?: string
  story?: CaseStory
}

export const CASES: Case[] = [
  {
    id: 'physiomelis',
    name: 'Studio PhysioMelis',
    desc: 'Studio di Fisioterapia e Osteopatia integrata.',
    tags: ['Comunicazione', 'Advertising', 'Ottimizzazione dei processi'],
    metrics: [{ v: 3500, label: 'Contatti' }, { v: 37, unit: '%', label: 'Di fidelizzazione' }],
    video: 'physiomelis',
    story: {
      headline: 'Da agenda discontinua a studio fisioterapico strutturato',
      sections: [
        {
          title: 'Il punto di partenza',
          items: [
            { lead: 'Un lavoro di qualità, una crescita imprevedibile.', text: 'Davide gestiva da solo trattamenti, agenda e nuovi contatti. I pazienti arrivavano quasi solo dal passaparola: numeri impossibili da prevedere, quindi impossibile pianificare investimenti e sviluppo.' },
            { lead: 'L’obiettivo.', text: 'Non era “fare pubblicità”. Era costruire un sistema che trasformasse la qualità del lavoro di Davide in una crescita costante e sostenibile.' },
          ],
        },
        {
          title: 'Prima il prodotto',
          items: [
            { lead: 'Posizionamento.', text: 'Abbiamo concentrato comunicazione e contenuti social su poche problematiche specifiche, quelle con più domanda e più spazio per distinguersi. Così lo studio è diventato riconoscibile su una nicchia precisa.' },
            { lead: 'Offerta.', text: 'Dalla singola prestazione a percorsi strutturati per il paziente. Un’esperienza migliore per chi entra in studio, un processo di vendita più chiaro e margini da reinvestire nella crescita.' },
          ],
        },
        {
          title: 'Poi la pubblicità',
          items: [
            { lead: 'Meta Ads.', text: 'Solo a quel punto abbiamo attivato le campagne, con un sistema pensato per generare contatti profilati in modo continuo.' },
          ],
        },
        {
          title: 'Il primo anno',
          items: [
            { lead: '3.503 contatti, 773 prime visite, 441 percorsi avviati.', text: 'Con un flusso costante di richieste, l’agenda di Davide si è riempita. Sono arrivati una segretaria e nuovi fisioterapisti: da professionista che faceva tutto a studio con ruoli e processi.' },
          ],
        },
        {
          title: 'Il cambio di scenario',
          items: [
            { lead: 'Il mercato ha iniziato a copiare.', text: 'I concorrenti avevano replicato offerta e comunicazione. In più c’erano altri terapisti da riempire, e alzare il budget pubblicitario significava pagare ogni contatto sempre di più. Non bastava più farsi trovare: serviva farsi ricordare.' },
          ],
        },
        {
          title: 'Il brand',
          items: [
            { lead: 'Identità.', text: 'Un’immagine riconoscibile e una voce coerente su ogni canale, capaci di rappresentare lo studio oltre la figura del singolo professionista.' },
            { lead: 'Sito.', text: 'Progettato per presentare PhysioMelis come una struttura organizzata: professionisti, servizi e percorsi chiari, prenotazione semplice, visibilità per chi cerca attivamente un fisioterapista.' },
            { lead: 'Campagne.', text: 'Accanto alla generazione contatti abbiamo aggiunto campagne di notorietà e contenuti di fidelizzazione, per raggiungere chi doveva ancora scegliere e far tornare chi aveva già scelto.' },
          ],
        },
        {
          title: 'I risultati',
          items: [
            { lead: 'Fidelizzazione oltre +35%.', text: 'Più pazienti che tornano e completano il percorso.' },
            { lead: 'Valore del paziente +20%.', text: 'Ogni paziente acquisito genera più valore nel tempo.' },
            { lead: 'Oltre 200 recensioni', text: 'tra Google, Facebook e MioDottore. I pazienti non arrivano più solo perché li paghiamo per arrivare: arrivano perché quel nome, in quella zona, se lo ricordano.' },
          ],
        },
      ],
      quote: 'L’advertising porta contatti. Il brand li rende tuoi.',
    },
  },
  {
    id: 'house-of-demu',
    name: 'House of Demu',
    desc: 'Private Chef, Catering e Show Cooking.',
    tags: ['Lancio del brand', 'Contenuti', 'Sponsorship'],
    metrics: [{ v: 6000, label: 'Follower il primo anno' }, { v: 52, label: 'Clienti fissi generati' }],
    video: 'house-of-demu',
    story: {
      headline: 'Da pizzaiolo dipendente a imprenditore libero',
      subtitle: 'Il lancio di un nuovo brand nel private catering, senza capitale e senza pubblicità.',
      sections: [
        {
          title: 'Il punto di partenza',
          items: [
            { lead: 'Un sogno preciso.', text: 'Riccardo lavorava come pizzaiolo dipendente e voleva una cosa sola: lavorare per sé, come pizzaiolo privato. Quando ci ha raccontato il progetto, nel 2022, aveva un piccolo forno, la sua esperienza e nessun capitale da investire.' },
            { lead: 'L’obiettivo.', text: 'Lanciare un nuovo concept nel catering e nel private chef che gli permettesse di lasciare il lavoro. E mostrare ad altri pizzaioli che si può fare.' },
          ],
        },
        {
          title: 'L’idea',
          items: [
            { lead: 'Un mantra prima di un logo.', text: 'Tutto è partito da una frase: <i>portare il piacere della pizza ovunque tu voglia</i>. È diventata il filtro di ogni scelta successiva, dal servizio alla comunicazione.' },
          ],
        },
        {
          title: 'Prima il servizio',
          items: [
            { lead: 'Progettato per gli eventi.', text: 'Insieme a Riccardo abbiamo costruito un servizio capace di reggere tutte le variabili di un evento all’aperto. Prima di pensare a come venderlo, doveva funzionare ovunque.' },
            { lead: 'Un’esperienza, non solo un catering.', text: 'Lo show cooking colpisce gli ospiti sul piano scenico, la pizza su quello culinario: fatta a regola d’arte, come in pizzeria, ma a casa del cliente.' },
          ],
        },
        {
          title: 'Lanciare senza budget',
          items: [
            { lead: 'Zero euro in pubblicità.', text: 'Senza capitale non si poteva comprare visibilità. Abbiamo cercato sponsor che finanziassero le attrezzature e dessero notorietà al brand, e Gozney ha creduto nel progetto.' },
            { lead: 'Un target definito.', text: 'Famiglie, gruppi di amici e aziende. Sito, comunicazione e merchandising sono stati costruiti attorno a loro, insieme a un processo di vendita curato in ogni passaggio.' },
          ],
        },
        {
          title: 'I risultati',
          items: [
            { lead: 'Oltre 50 clienti nel primo anno.', text: 'Gli utili sono stati reinvestiti nella crescita della stagione successiva.' },
            { lead: 'Una base clienti stabile.', text: 'Ogni anno abbiamo migliorato prodotto, servizio, postazione ed esperienza del cliente, mantenendo una clientela fissa stagione dopo stagione.' },
            { lead: 'Red Valley 2025.', text: 'House of Demu è stata chiamata dal Red Valley Festival per occuparsi degli artisti.' },
          ],
        },
        {
          title: 'Il vero risultato',
          items: [
            { text: 'Oggi Riccardo vive della sua passione, con un’attività tutta sua. Il fatturato conta, ma il traguardo era questo: la libertà di fare il lavoro che ha scelto.' },
          ],
        },
      ],
      quote: 'Sito, social, merchandising: tutto è servito. La differenza però l’ha fatta il lavoro a monte, cioè una direzione chiara da seguire passo dopo passo.',
    },
  },
  {
    id: 'pusceddu',
    name: 'Pusceddu Termoidraulica',
    desc: 'Esperti nella consulenza e rivendita di materiale termoidraulico.',
    tags: ['Comunicazione', 'Sito Web', 'Consulenza Marketing'],
    metrics: [{ v: 12, unit: '%', label: 'Di fatturato dal quinto mese' }, { v: 210, unit: '%', label: 'Di notorietà locale' }],
    video: 'pusceddu',
    story: {
      headline: 'Da rivenditore di materiale a partner tecnico',
      sections: [
        {
          title: 'Il punto di partenza',
          items: [
            { lead: 'Competenza vera, percepita come magazzino.', text: 'Termoidraulica Sinnai aveva anni di lavoro alle spalle, un magazzino fisico e una competenza costruita cantiere dopo cantiere. Per il mercato, però, era un rivenditore come tanti. E quando sei percepito così, l’unica leva su cui competere è il prezzo.' },
            { lead: 'Nessun asset di comunicazione.', text: 'Né un brand riconoscibile, né contenuti, né un sito capace di raccontare il valore reale dell’azienda.' },
          ],
        },
        {
          title: 'Il mercato era cambiato',
          items: [
            { lead: 'I professionisti cercavano altro.', text: 'Normative più complesse, tecnologie nuove, cantieri più difficili da gestire. Chi lavora sugli impianti non cercava più qualcuno che gli vendesse i pezzi, ma qualcuno che lo aiutasse a non sbagliare.' },
            { lead: 'L’insight.', text: 'Quella consulenza Pusceddu la faceva già, da sempre. Non l’aveva mai comunicata.' },
          ],
        },
        {
          title: 'Il posizionamento',
          items: [
            { lead: 'Da fornitore a partner tecnico integrato.', text: 'Un partner che affianca il professionista prima del cantiere, gli segnala cosa manca prima di partire e resta presente anche dopo la fattura.' },
            { lead: 'I claim.', text: '<i>“Meno imprevisti. Più margine.”</i> per tutti i professionisti. <i>“Il tuo reparto tecnico fuori dall’azienda.”</i> per impiantisti e imprese. Il problema più sentito dal target, il cantiere fermo per un pezzo mancante, diventa la promessa del brand.' },
          ],
        },
        {
          title: 'Il rebrand',
          items: [
            { lead: 'Prima la posizione, poi il nome.', text: 'Abbiamo deciso chi era l’azienda prima di decidere come chiamarla. Da Termoidraulica Sinnai a Pusceddu Termoidraulica: stessa competenza, nuova visione.' },
            { lead: 'Identità e sito.', text: 'Nuova identità visiva e un sito costruito per target: una parte che parla la lingua dei professionisti, una che traduce tutto in chiarezza per il privato.' },
          ],
        },
        {
          title: 'La comunicazione',
          items: [
            { lead: 'Target diversi, rischi diversi.', text: 'Impiantisti, progettisti, imprese e privati temono cose diverse. Per questo abbiamo costruito messaggi distinti invece di parlare a tutti allo stesso modo.' },
            { lead: 'Meta: la competenza mostrata mentre succede.', text: 'Contenuti che partono dai problemi reali del cantiere, non dal catalogo: il pezzo che manca sempre, cosa cambia quando lavori su un’isola, come si prepara un ordine fatto bene. Niente offerte, niente sconti.' },
            { lead: 'LinkedIn: l’aggiornamento tecnico.', text: 'Articoli e post su normative e incentivi, per diventare la fonte a cui il professionista torna quando qualcosa cambia nel settore.' },
          ],
        },
        {
          title: 'L’acquisizione',
          items: [
            { lead: 'Prima dare, poi chiedere.', text: 'Un percorso di strumenti gratuiti in tre fasi: checklist di cantiere, guida agli impianti in Sardegna, configuratore di kit. Ogni fase si finanzia con i risultati della precedente.' },
            { lead: 'Campagne Meta e Google.', text: 'Portano questi strumenti davanti ai professionisti giusti e aprono conversazioni già qualificate: il commerciale non chiama a freddo, risponde a una richiesta.' },
          ],
        },
        {
          title: 'Il risultato',
          items: [
            { lead: 'Un’azienda che sa chi è e a chi parla.', text: 'I contenuti hanno smesso di essere pubblicità e sono diventati la prova di quello che Pusceddu sa fare. Nessuno deve dichiarare che è il partner tecnico di riferimento: si vede.' },
          ],
        },
      ],
    },
  },
  { id: 'saltwater', name: 'Saltwater Sardinia', desc: 'Produzione di documentari e strategia di crescita per il personal brand.', tags: ['Comunicazione', 'Sponsorship', 'Documentari TV'], metrics: [{ v: 250000, label: 'Persone raggiunte ogni mese' }, { v: 2700, unit: '€', label: 'Mensili dagli sponsor' }], video: 'saltwater' },
]
