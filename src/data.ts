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

export type Case = {
  id: string
  name: string
  desc: string
  tags: string[]
  // valore finale, suffisso (%, € o niente) ed etichetta; il "+" davanti è sempre implicito
  metrics: { v: number; unit?: string; label: string }[]
  video?: string
}

export const CASES: Case[] = [
  { id: 'physiomelis', name: 'Studio PhysioMelis', desc: 'Studio di Fisioterapia e Osteopatia integrata.', tags: ['Comunicazione', 'Advertising', 'Ottimizzazione dei processi'], metrics: [{ v: 3500, label: 'Contatti' }, { v: 37, unit: '%', label: 'Di fidelizzazione' }], video: 'physiomelis' },
  { id: 'house-of-demu', name: 'House of Demu', desc: 'Private Chef, Catering e Show Cooking.', tags: ['Lancio del brand', 'Contenuti', 'Sponsorship'], metrics: [{ v: 6000, label: 'Follower il primo anno' }, { v: 52, label: 'Clienti fissi generati' }], video: 'house-of-demu' },
  { id: 'pusceddu', name: 'Pusceddu Termoidraulica', desc: 'Esperti nella consulenza e rivendita di materiale termoidraulico.', tags: ['Comunicazione', 'Sito Web', 'Consulenza Marketing'], metrics: [{ v: 12, unit: '%', label: 'Di fatturato dal quinto mese' }, { v: 210, unit: '%', label: 'Di notorietà locale' }] },
  { id: 'saltwater', name: 'Saltwater Sardinia', desc: 'Produzione di documentari e strategia di crescita per il personal brand.', tags: ['Comunicazione', 'Sponsorship', 'Documentari TV'], metrics: [{ v: 250000, label: 'Persone raggiunte ogni mese' }, { v: 2700, unit: '€', label: 'Mensili dagli sponsor' }], video: 'saltwater' },
]
