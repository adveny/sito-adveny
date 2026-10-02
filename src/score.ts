/**
 * Calcolo del potenziale di crescita (Margine di crescita) per il Potenziometro Adveny.
 * Restituisce un numero intero tra 0 e 100.
 * 
 * Fasce:
 * - 80–100: Margine di crescita ampio
 * - 60–79:  Base solida, margini da liberare
 * - 0–59:   Struttura avviata, margini da cercare a fondo
 */

export interface Answers {
  settore?: string
  team?: string
  acquisizione?: string | string[]
  retention?: string | string[]
  asset?: string | string[]
  attivita?: string | string[]
  miglioramento?: string | string[]
  priorita?: string
  obiettivi?: string | string[]
  fase?: string
  racconto?: string
  nome_cognome?: string
  azienda?: string
  email?: string
  telefono?: string
  privacy?: string
  [key: string]: unknown
}

const toArray = (v: unknown): string[] => (Array.isArray(v) ? v : typeof v === 'string' && v.trim() ? [v] : [])

export function calculateScore(a: Answers): number {
  let score = 10 // base minima

  // 1. Acquisizione (max 18)
  const acq = toArray(a.acquisizione)
  if (acq.includes('Non lo so con certezza') || acq.includes('Passaparola') && acq.length <= 2) {
    score += 18
  } else if (acq.length <= 2) {
    score += 14
  } else if (acq.length <= 4) {
    score += 10
  } else {
    score += 6
  }

  // 2. Fidelizzazione / Retention (max 18)
  const ret = toArray(a.retention)
  if (ret.includes('Al momento non faccio molto') || ret.length === 0) {
    score += 18
  } else if (ret.includes('Li richiamo o scrivo periodicamente') && ret.length === 1) {
    score += 14
  } else if (ret.length <= 2) {
    score += 11
  } else {
    score += 7
  }

  // 3. Asset / Strumenti (max 18)
  const ass = toArray(a.asset)
  if (ass.includes('Nessuno di questi') || ass.length === 0) {
    score += 18
  } else if (ass.length === 1 && ass.includes('Profili social attivi')) {
    score += 16
  } else if (!ass.includes('Un gestionale o CRM') && !ass.includes('Sistema per raccogliere contatti')) {
    score += 13
  } else if (ass.length <= 3) {
    score += 10
  } else {
    score += 6
  }

  // 4. Attività svolte oggi (max 18)
  const att = toArray(a.attivita)
  if (att.includes('Non ho strategie attive') || att.includes('Non ho familiarità con queste attività') || att.length === 0) {
    score += 18
  } else if (att.length <= 2) {
    score += 13
  } else if (att.length <= 4) {
    score += 10
  } else {
    score += 6
  }

  // 5. Metodo di miglioramento (max 16)
  const mig = toArray(a.miglioramento)
  if (mig.includes('Non ho un metodo preciso') || mig.includes("Mi affido all'intuito e all'esperienza") && mig.length === 1) {
    score += 16
  } else if (mig.length <= 2) {
    score += 12
  } else {
    score += 7
  }

  // 6. Fase e dimensione (max 12)
  const f = a.fase || ''
  if (f.startsWith('Sto avviando') || f.startsWith('Sto costruendo')) {
    score += 12
  } else if (f.startsWith('Sto crescendo')) {
    score += 10
  } else if (f.startsWith('Mi sto consolidando')) {
    score += 7
  } else {
    score += 5
  }

  // Clampa tra 0 e 100
  return Math.min(100, Math.max(0, Math.round(score)))
}

export function getFascia(score: number): { titolo: string; testo: string } {
  if (score >= 80) {
    return {
      titolo: 'Margine di crescita ampio',
      testo:
        'Le tue risposte indicano molto spazio ancora da sfruttare. È il segnale più promettente, ed è anche quello che costa di più ignorare: lo spazio libero, prima o poi, lo occupa un concorrente.',
    }
  }
  if (score >= 60) {
    return {
      titolo: 'Base solida, margini da liberare',
      testo:
        'Ci sono fondamenta che funzionano e margini che si perdono per strada. Ora bisogna capire con precisione dove.',
    }
  }
  return {
    titolo: 'Struttura avviata, margini da cercare a fondo',
    testo:
      "Molte leve sono già in movimento. Quello che resta da fuori si vede poco, ed è lì che un'analisi approfondita fa la differenza.",
  }
}
