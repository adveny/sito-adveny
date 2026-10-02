/**
 * Cloudflare Worker per gestire l'invio dei dati del Potenziometro Adveny a Brevo.
 * Conforme alle specifiche del README - MAIL THANK-YOU DEL POTENZIOMETRO ADVENY (2026-10-02).
 */

interface Env {
  BREVO_API_KEY: string
  SENDER_EMAIL?: string
  SENDER_NAME?: string
  NOTIFY_EMAIL?: string
  BREVO_LIST_ID?: string
}

interface AnswersPayload {
  nome_cognome?: string
  azienda?: string
  email?: string
  telefono?: string
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
  privacy?: string
  score?: number
  timestamp?: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function formatFirstName(fullName?: string): string {
  if (!fullName) return 'tu'
  const first = fullName.trim().split(/\s+/)[0] || ''
  if (!first) return 'tu'
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}

function formatList(val: unknown): string {
  if (!val) return '—'
  if (Array.isArray(val)) {
    return val.length > 0 ? val.join(', ') : '—'
  }
  const str = String(val).trim()
  return str.length > 0 ? str : '—'
}

function formatSms(phone?: string): string | undefined {
  if (!phone) return undefined
  let clean = phone.replace(/[\s\-\(\)\.]/g, '')
  if (clean.startsWith('+')) clean = clean.slice(1)
  if (/^3\d{9}$/.test(clean)) clean = '39' + clean
  if (/^\d{10,15}$/.test(clean)) return clean
  return undefined
}

function getFascia(score: number): { titolo: string; testo: string } {
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

function calculateScore(a: AnswersPayload): number {
  if (typeof a.score === 'number' && !isNaN(a.score)) {
    return Math.min(100, Math.max(0, Math.round(a.score)))
  }

  const toArr = (v: unknown): string[] => (Array.isArray(v) ? v : typeof v === 'string' && v.trim() ? [v] : [])
  let score = 10

  const acq = toArr(a.acquisizione)
  if (acq.includes('Non lo so con certezza') || (acq.includes('Passaparola') && acq.length <= 2)) score += 18
  else if (acq.length <= 2) score += 14
  else if (acq.length <= 4) score += 10
  else score += 6

  const ret = toArr(a.retention)
  if (ret.includes('Al momento non faccio molto') || ret.length === 0) score += 18
  else if (ret.includes('Li richiamo o scrivo periodicamente') && ret.length === 1) score += 14
  else if (ret.length <= 2) score += 11
  else score += 7

  const ass = toArr(a.asset)
  if (ass.includes('Nessuno di questi') || ass.length === 0) score += 18
  else if (ass.length === 1 && ass.includes('Profili social attivi')) score += 16
  else if (!ass.includes('Un gestionale o CRM') && !ass.includes('Sistema per raccogliere contatti')) score += 13
  else if (ass.length <= 3) score += 10
  else score += 6

  const att = toArr(a.attivita)
  if (att.includes('Non ho strategie attive') || att.includes('Non ho familiarità con queste attività') || att.length === 0) score += 18
  else if (att.length <= 2) score += 13
  else if (att.length <= 4) score += 10
  else score += 6

  const mig = toArr(a.miglioramento)
  if (mig.includes('Non ho un metodo preciso') || (mig.includes("Mi affido all'intuito e all'esperienza") && mig.length === 1)) score += 16
  else if (mig.length <= 2) score += 12
  else score += 7

  const f = a.fase || ''
  if (f.startsWith('Sto avviando') || f.startsWith('Sto costruendo')) score += 12
  else if (f.startsWith('Sto crescendo')) score += 10
  else if (f.startsWith('Mi sto consolidando')) score += 7
  else score += 5

  return Math.min(100, Math.max(0, Math.round(score)))
}

function generateCustomerPlainText(data: AnswersPayload, score: number, fascia: { titolo: string; testo: string }): string {
  const nome = formatFirstName(data.nome_cognome)
  const azienda = (data.azienda || '').trim() || 'la tua azienda'
  const settore = formatList(data.settore)
  const team = formatList(data.team)
  const fase = formatList(data.fase)
  const acquisizione = formatList(data.acquisizione)
  const retention = formatList(data.retention)
  const asset = formatList(data.asset)
  const attivita = formatList(data.attivita)
  const miglioramento = formatList(data.miglioramento)
  const priorita = formatList(data.priorita)
  const obiettivi = formatList(data.obiettivi)

  return `Ciao ${nome},

hai completato il potenziometro di Adveny. Sapere di avere margini di crescita è facile. Fermarsi a misurarli è il passo che quasi tutti rimandano. Tu l'hai fatto, ed è il primo passo verso il futuro di ${azienda}.


IL TUO SCORE DI PARTENZA: ${score}%

${fascia.titolo}
${fascia.testo}

Questo numero è uno score iniziale, non l'analisi. Nasce dalle tue risposte e indica dove guardare, non cosa fare. È una fotografia presa da fuori: utile per orientarsi, ma ancora poco per decidere.


LE TUE RISPOSTE

Settore: ${settore}
Team: ${team}
Fase dell'attività: ${fase}
Come arrivano i nuovi clienti: ${acquisizione}
Come mantieni il rapporto con loro: ${retention}
Strumenti che hai: ${asset}
Attività che porti avanti: ${attivita}
Come migliori il tuo prodotto o servizio: ${miglioramento}
Priorità di oggi: ${priorita}
Obiettivi a 12 mesi: ${obiettivi}


DA QUI PARTE L'ANALISI VERA

Entro 48 ore ti chiamerà un consulente Adveny. Partirà dalle tue risposte e scenderà nel dettaglio, area per area: acquisizione, fidelizzazione, strumenti, metodo, strategia e visione.

L'obiettivo è rispondere a due domande:
— dove ${azienda} sta perdendo margine oggi;
— quali leve possono farla crescere nei prossimi mesi.

Lo facciamo guardando insieme due fronti: il marketing, che porta e trattiene i clienti, e lo sviluppo del prodotto, che decide quanto vale quello che offri. Se lavori su uno solo dei due, finisci per spingere un'offerta che non regge oppure per costruire un'offerta che nessuno vede.

I margini che non vedi non restano fermi: si perdono ogni mese, senza che te ne accorga.

Se preferisci scegliere tu giorno e orario della chiamata, rispondi a questa email.


PERCHÉ IL TEMPO CONTA

Adveny lavora come growth partner: si prende in carico i tuoi obiettivi di crescita, non una lista di servizi. Strategia, contenuti, advertising, design, sviluppo e video lavorano sullo stesso progetto, al costo di un solo dipendente.

Per farlo con l'attenzione che serve, apriamo le nostre porte a 5 progetti nuovi ogni semestre. Per ora ne restano altri 2.

A presto,
Francesco
CEO & Growth Manager · Adveny
adveny.it · info@adveny.it

P.S. La chiamata serve anche a capire se ${azienda} può occupare uno dei 2 posti rimasti in questo semestre.
`
}

function generateCustomerEmailHtml(data: AnswersPayload, score: number, fascia: { titolo: string; testo: string }): string {
  const nome = formatFirstName(data.nome_cognome)
  const azienda = (data.azienda || '').trim() || 'la tua azienda'
  const settore = formatList(data.settore)
  const team = formatList(data.team)
  const fase = formatList(data.fase)
  const acquisizione = formatList(data.acquisizione)
  const retention = formatList(data.retention)
  const asset = formatList(data.asset)
  const attivita = formatList(data.attivita)
  const miglioramento = formatList(data.miglioramento)
  const priorita = formatList(data.priorita)
  const obiettivi = formatList(data.obiettivi)

  const previewText = 'Hai fatto il primo passo verso il futuro della tua azienda, ti contatteremo entro 48 ore.'

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${nome}, il tuo score di partenza: ${score}%</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0914; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f2f8; line-height: 1.6;">
  
  <!-- PREVIEW TEXT NASCOSTO -->
  <div style="display: none; font-size: 1px; color: #0b0914; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0914; min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #131021; border-radius: 20px; border: 1px solid rgba(139, 77, 255, 0.25); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
          
          <!-- HEADER -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(180deg, rgba(139, 77, 255, 0.12) 0%, rgba(19, 16, 33, 0) 100%);">
              <span style="font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">ADVENY</span>
              <div style="margin-top: 6px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #b596ff; font-weight: 600;">Marketing &amp; Growth Partner</div>
            </td>
          </tr>

          <!-- CORPO EMAIL -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #ffffff;">
                Ciao ${nome},
              </p>
              
              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.6; color: #d0cce3;">
                hai completato il potenziometro di Adveny. Sapere di avere margini di crescita è facile. Fermarsi a misurarli è il passo che quasi tutti rimandano. Tu l'hai fatto, ed è il primo passo verso il futuro di <strong style="color: #ffffff;">${azienda}</strong>.
              </p>

              <!-- SCORE BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background: rgba(139, 77, 255, 0.08); border: 1px solid rgba(139, 77, 255, 0.25); border-left: 4px solid #8b4dff; border-radius: 12px;">
                <tr>
                  <td style="padding: 24px;">
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #b596ff; margin-bottom: 8px;">
                      IL TUO SCORE DI PARTENZA: ${score}%
                    </div>
                    <div style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
                      ${fascia.titolo}
                    </div>
                    <div style="font-size: 14px; line-height: 1.6; color: #e4dbff;">
                      ${fascia.testo}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 32px 0; font-size: 14px; line-height: 1.6; color: #a19cb5;">
                Questo numero è uno score iniziale, non l'analisi. Nasce dalle tue risposte e indica dove guardare, non cosa fare. È una fotografia presa da fuori: utile per orientarsi, ma ancora poco per decidere.
              </p>

              <!-- SEZIONE RISPOSTE -->
              <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; margin-bottom: 32px;">
                <h2 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #b596ff;">
                  LE TUE RISPOSTE
                </h2>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.6; background-color: #18152b; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden;">
                  <tr><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); width: 45%; vertical-align: top;"><strong style="color: #ffffff;">Settore:</strong></td><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d0cce3;">${settore}</td></tr>
                  <tr><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top;"><strong style="color: #ffffff;">Team:</strong></td><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d0cce3;">${team}</td></tr>
                  <tr><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top;"><strong style="color: #ffffff;">Fase dell'attività:</strong></td><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d0cce3;">${fase}</td></tr>
                  <tr><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top;"><strong style="color: #ffffff;">Come arrivano i nuovi clienti:</strong></td><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d0cce3;">${acquisizione}</td></tr>
                  <tr><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top;"><strong style="color: #ffffff;">Come mantieni il rapporto con loro:</strong></td><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d0cce3;">${retention}</td></tr>
                  <tr><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top;"><strong style="color: #ffffff;">Strumenti che hai:</strong></td><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d0cce3;">${asset}</td></tr>
                  <tr><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top;"><strong style="color: #ffffff;">Attività che porti avanti:</strong></td><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d0cce3;">${attivita}</td></tr>
                  <tr><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top;"><strong style="color: #ffffff;">Come migliori il tuo prodotto o servizio:</strong></td><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d0cce3;">${miglioramento}</td></tr>
                  <tr><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top;"><strong style="color: #ffffff;">Priorità di oggi:</strong></td><td style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #d0cce3;">${priorita}</td></tr>
                  <tr><td style="padding: 10px 16px; vertical-align: top;"><strong style="color: #ffffff;">Obiettivi a 12 mesi:</strong></td><td style="padding: 10px 16px; color: #d0cce3;">${obiettivi}</td></tr>
                </table>
              </div>

              <!-- SEZIONE ANALISI VERA -->
              <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; margin-bottom: 32px;">
                <h2 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #b596ff;">
                  DA QUI PARTE L'ANALISI VERA
                </h2>
                
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #d0cce3;">
                  Entro 48 ore ti chiamerà un consulente Adveny. Partirà dalle tue risposte e scenderà nel dettaglio, area per area: acquisizione, fidelizzazione, strumenti, metodo, strategia e visione.
                </p>

                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #d0cce3;">
                  L'obiettivo è rispondere a due domande:<br>
                  — dove ${azienda} sta perdendo margine oggi;<br>
                  — quali leve possono farla crescere nei prossimi mesi.
                </p>

                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #d0cce3;">
                  Lo facciamo guardando insieme due fronti: il marketing, che porta e trattiene i clienti, e lo sviluppo del prodotto, che decide quanto vale quello che offri. Se lavori su uno solo dei due, finisci per spingere un'offerta che non regge oppure per costruire un'offerta che nessuno vede.
                </p>

                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #d0cce3;">
                  I margini che non vedi non restano fermi: si perdono ogni mese, senza che te ne accorga.
                </p>

                <p style="margin: 0 0 8px 0; font-size: 15px; line-height: 1.6; color: #b596ff; font-weight: 600;">
                  Se preferisci scegliere tu giorno e orario della chiamata, rispondi a questa email.
                </p>
              </div>

              <!-- SEZIONE PERCHÉ IL TEMPO CONTA -->
              <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; margin-bottom: 28px;">
                <h2 style="margin: 0 0 16px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #b596ff;">
                  PERCHÉ IL TEMPO CONTA
                </h2>

                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #d0cce3;">
                  Adveny lavora come growth partner: si prende in carico i tuoi obiettivi di crescita, non una lista di servizi. Strategia, contenuti, advertising, design, sviluppo e video lavorano sullo stesso progetto, al costo di un solo dipendente.
                </p>

                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #d0cce3;">
                  Per farlo con l'attenzione che serve, apriamo le nostre porte a 5 progetti nuovi ogni semestre. Per ora ne restano altri 2.
                </p>

                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #d0cce3;">
                  A presto,<br>
                  <strong style="color: #ffffff;">Francesco</strong><br>
                  CEO &amp; Growth Manager · Adveny<br>
                  <a href="https://adveny.it" style="color: #b596ff; text-decoration: none;">adveny.it</a> · <a href="mailto:info@adveny.it" style="color: #b596ff; text-decoration: none;">info@adveny.it</a>
                </p>

                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #9c97b2; border-left: 2px solid #8b4dff; padding-left: 12px;">
                  <strong>P.S.</strong> La chiamata serve anche a capire se ${azienda} può occupare uno dei 2 posti rimasti in questo semestre.
                </p>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 20px 36px; background-color: #0d0b17; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #7a7590; line-height: 1.5;">
              Adveny · Ecosistema di Crescita · Cagliari, Sardegna<br>
              <a href="https://adveny.it" style="color: #b596ff; text-decoration: none;">adveny.it</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function generateInternalNotificationHtml(data: AnswersPayload, score: number, fascia: { titolo: string; testo: string }, dateStr: string): string {
  const nome = (data.nome_cognome || '').trim()
  const azienda = (data.azienda || '').trim() || 'Non specificata'
  const email = (data.email || '').trim()
  const telefono = (data.telefono || '').trim()
  const racconto = (data.racconto || '').trim()

  return `<!DOCTYPE html>
<html lang="it">
<body style="font-family: -apple-system, sans-serif; background: #f5f5f7; padding: 24px; color: #1d1d1f;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 6px solid #8b4dff;">
    
    <div style="display: inline-block; background: #8b4dff; color: #fff; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px;">
      NUOVO LEAD POTENZIOMETRO (DA CHIAMARE ENTRO 48 ORE)
    </div>

    <h1 style="font-size: 22px; margin: 0 0 6px 0; color: #111;">${nome} · ${azienda}</h1>
    <p style="margin: 0 0 20px 0; color: #666; font-size: 13px;">Ricevuto il: <strong>${dateStr}</strong></p>

    <!-- SCORE -->
    <div style="background: #f0ebff; border: 1px solid #d4c2fc; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
      <div style="font-size: 12px; font-weight: bold; color: #622db8; text-transform: uppercase;">Score di partenza: ${score}%</div>
      <div style="font-size: 18px; font-weight: bold; color: #111; margin-top: 2px;">${fascia.titolo}</div>
      <div style="font-size: 13px; color: #444; margin-top: 4px;">${fascia.testo}</div>
    </div>

    <!-- CONTATTI -->
    <h3 style="font-size: 14px; text-transform: uppercase; color: #888; margin: 0 0 10px 0;">Contatti</h3>
    <table style="width: 100%; font-size: 14px; margin-bottom: 24px;" cellspacing="0" cellpadding="4">
      <tr><td style="width: 30%; color: #666;"><strong>Nome:</strong></td><td>${nome}</td></tr>
      <tr><td style="color: #666;"><strong>Azienda:</strong></td><td>${azienda}</td></tr>
      <tr><td style="color: #666;"><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="color: #666;"><strong>Telefono:</strong></td><td><a href="tel:${telefono}">${telefono}</a></td></tr>
      <tr><td style="color: #666;"><strong>Privacy / Consenso:</strong></td><td>${data.privacy || 'Sì'} (registrato il ${dateStr})</td></tr>
    </table>

    ${racconto ? `
    <!-- RACCONTO AZIENDA -->
    <div style="background: #fff8e1; border-left: 4px solid #fbc02d; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
      <strong style="color: #8d6e63; font-size: 12px; text-transform: uppercase;">Racconto dell'azienda:</strong>
      <p style="margin: 6px 0 0 0; font-size: 14px; color: #333; line-height: 1.5; white-space: pre-wrap;">${racconto}</p>
    </div>` : ''}

    <!-- RISPOSTE QUESTIONARIO -->
    <h3 style="font-size: 14px; text-transform: uppercase; color: #888; margin: 0 0 10px 0;">Risposte date</h3>
    <table style="width: 100%; font-size: 13px; border-collapse: collapse;" cellspacing="0" cellpadding="8" border="1" bordercolor="#eee">
      <tr><td style="background: #fafafa; width: 40%;"><strong>Settore</strong></td><td>${formatList(data.settore)}</td></tr>
      <tr><td style="background: #fafafa;"><strong>Team</strong></td><td>${formatList(data.team)}</td></tr>
      <tr><td style="background: #fafafa;"><strong>Fase dell'attività</strong></td><td>${formatList(data.fase)}</td></tr>
      <tr><td style="background: #fafafa;"><strong>Canali di acquisizione</strong></td><td>${formatList(data.acquisizione)}</td></tr>
      <tr><td style="background: #fafafa;"><strong>Fidelizzazione (retention)</strong></td><td>${formatList(data.retention)}</td></tr>
      <tr><td style="background: #fafafa;"><strong>Strumenti che ha</strong></td><td>${formatList(data.asset)}</td></tr>
      <tr><td style="background: #fafafa;"><strong>Attività portate avanti</strong></td><td>${formatList(data.attivita)}</td></tr>
      <tr><td style="background: #fafafa;"><strong>Metodo di miglioramento</strong></td><td>${formatList(data.miglioramento)}</td></tr>
      <tr><td style="background: #fafafa;"><strong>Priorità di oggi</strong></td><td>${formatList(data.priorita)}</td></tr>
      <tr><td style="background: #fafafa;"><strong>Obiettivi a 12 mesi</strong></td><td>${formatList(data.obiettivi)}</td></tr>
    </table>

  </div>
</body>
</html>`
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    if (request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', service: 'adveny-potenziometro-brevo' }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Metodo non consentito' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    if (!env.BREVO_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Configurazione mancante: BREVO_API_KEY non impostata nel Worker' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    try {
      const payload: AnswersPayload = await request.json()

      if (!payload.email || !payload.nome_cognome) {
        return new Response(JSON.stringify({ error: 'Email e Nome sono obbligatori' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        })
      }

      const score = calculateScore(payload)
      const fascia = getFascia(score)
      const nome = formatFirstName(payload.nome_cognome)

      const senderEmail = env.SENDER_EMAIL || 'info@adveny.it'
      const senderName = 'Francesco · Adveny'
      const replyToEmail = 'info@adveny.it'
      const notifyEmail = env.NOTIFY_EMAIL || 'info@adveny.it'

      const now = new Date()
      const dateStr = now.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })

      // 1. Aggiunta/aggiornamento del contatto in Brevo
      const nameParts = (payload.nome_cognome || '').trim().split(/\s+/)
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      const cleanSms = formatSms(payload.telefono)

      const attributes: Record<string, unknown> = {
        NOME: firstName,
        COGNOME: lastName,
        AZIENDA: payload.azienda ? payload.azienda.trim() : '',
        SCORE: score,
        FASCIA: fascia.titolo,
        DATA_CONSENSO: payload.timestamp || now.toISOString(),
      }
      if (cleanSms) {
        attributes.SMS = cleanSms
      }
      if (payload.telefono) {
        attributes.LANDLINE_NUMBER = payload.telefono.trim()
      }

      const contactBody: Record<string, unknown> = {
        email: payload.email.trim(),
        updateEnabled: true,
        attributes,
      }

      if (env.BREVO_LIST_ID) {
        const listIdNum = parseInt(env.BREVO_LIST_ID, 10)
        if (!isNaN(listIdNum)) {
          contactBody.listIds = [listIdNum]
        }
      }

      try {
        const cRes = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': env.BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify(contactBody),
        })

        if (!cRes.ok && cRes.status !== 201 && cRes.status !== 204) {
          const errText = await cRes.text()
          console.warn('Brevo contact warning:', cRes.status, errText)
          // Fallback resiliente: salva comunque il contatto e lo associa alla lista
          await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': env.BREVO_API_KEY,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              email: payload.email.trim(),
              updateEnabled: true,
              listIds: env.BREVO_LIST_ID ? [parseInt(env.BREVO_LIST_ID, 10)] : undefined,
              attributes: { NOME: firstName, COGNOME: lastName },
            }),
          })
        }
      } catch (err) {
        console.warn('Errore durante la creazione contatto Brevo:', err)
      }

      // 2. Invio email automatica al prospect (HTML + Plain text)
      const customerEmailHtml = generateCustomerEmailHtml(payload, score, fascia)
      const customerEmailPlain = generateCustomerPlainText(payload, score, fascia)

      const emailPayload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: payload.email.trim(), name: payload.nome_cognome.trim() }],
        replyTo: { name: senderName, email: replyToEmail },
        subject: `${nome}, il tuo score di partenza: ${score}%`,
        htmlContent: customerEmailHtml,
        textContent: customerEmailPlain,
      }

      const brevoEmailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': env.BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      })

      if (!brevoEmailRes.ok) {
        const errText = await brevoEmailRes.text()
        console.error('Errore invio email Brevo:', errText)
        return new Response(JSON.stringify({ error: 'Errore invio email tramite Brevo', details: errText }), {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        })
      }

      // 3. Notifica interna per il team di Adveny
      if (notifyEmail) {
        try {
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': env.BREVO_API_KEY,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              sender: { name: 'Potenziometro Adveny', email: senderEmail },
              to: [{ email: notifyEmail, name: 'Team Adveny' }],
              replyTo: { name: payload.nome_cognome.trim(), email: payload.email.trim() },
              subject: `🔥 Nuovo lead potenziometro: ${payload.nome_cognome} (${payload.azienda || 'Senza azienda'}) · Score ${score}%`,
              htmlContent: generateInternalNotificationHtml(payload, score, fascia, dateStr),
            }),
          })
        } catch (notifyErr) {
          console.warn('Errore invio notifica interna:', notifyErr)
        }
      }

      return new Response(JSON.stringify({ success: true, score, fascia: fascia.titolo }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    } catch (e: unknown) {
      console.error('Errore generale Worker:', e)
      return new Response(JSON.stringify({ error: 'Errore del server', message: String(e) }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }
  },
}
