/**
 * Cloudflare Worker per gestire l'invio dei dati del Potenziometro Adveny a Brevo.
 * 
 * Variabili d'ambiente richieste (da impostare nei Secret di Cloudflare):
 * - BREVO_API_KEY: la tua chiave API v3 (xkeysib-...)
 * - SENDER_EMAIL: l'email mittente verificata su Brevo (es. advenystudio@gmail.com o info@adveny.it)
 * - SENDER_NAME: nome visualizzato del mittente (default: "Adveny")
 * - NOTIFY_EMAIL: email a cui inviare la notifica interna del lead (default: advenystudio@gmail.com)
 * - BREVO_LIST_ID: (opzionale) ID numerico della lista contatti su Brevo
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
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function formatValue(val: unknown): string {
  if (!val) return 'Non specificato'
  if (Array.isArray(val)) {
    return val.length > 0 ? val.join(', ') : 'Nessuna selezione'
  }
  return String(val)
}

function generateCustomerEmailHtml(data: AnswersPayload): string {
  const nome = (data.nome_cognome || 'Gentile cliente').trim()
  const azienda = (data.azienda || '').trim()

  const rows = [
    { label: 'Settore di attività', value: formatValue(data.settore) },
    { label: 'Dimensione del team', value: formatValue(data.team) },
    { label: 'Canali di acquisizione clienti', value: formatValue(data.acquisizione) },
    { label: 'Fidelizzazione clienti', value: formatValue(data.retention) },
    { label: 'Strumenti già in uso', value: formatValue(data.asset) },
    { label: 'Attività attive oggi', value: formatValue(data.attivita) },
    { label: 'Metodo di miglioramento', value: formatValue(data.miglioramento) },
    { label: 'Priorità principale', value: formatValue(data.priorita) },
    { label: 'Obiettivi a 12 mesi', value: formatValue(data.obiettivi) },
    { label: 'Fase di crescita', value: formatValue(data.fase) },
  ]

  if (data.racconto && data.racconto.trim().length > 0) {
    rows.push({ label: 'Racconto dell’azienda', value: data.racconto.trim() })
  }

  const tableRows = rows
    .map(
      (r, i) => `
      <tr style="background-color: ${i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};">
        <td style="padding: 12px 16px; color: #b596ff; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; width: 38%; vertical-align: top; border-bottom: 1px solid rgba(255,255,255,0.06);">
          ${r.label}
        </td>
        <td style="padding: 12px 16px; color: #f4f2f8; font-size: 14px; line-height: 1.5; border-bottom: 1px solid rgba(255,255,255,0.06);">
          ${r.value}
        </td>
      </tr>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Riepilogo della tua Analisi di Potenziale | Adveny</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0914; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f2f8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0914; min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #131021; border-radius: 20px; border: 1px solid rgba(139, 77, 255, 0.25); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
          
          <!-- HEADER CON LOGO -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(180deg, rgba(139, 77, 255, 0.12) 0%, rgba(19, 16, 33, 0) 100%);">
              <span style="font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">ADVENY</span>
              <div style="margin-top: 6px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #b596ff; font-weight: 600;">Marketing &amp; Ecosistema di Crescita</div>
            </td>
          </tr>

          <!-- CONTENUTO PRINCIPALE -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Ciao ${nome}, abbiamo ricevuto la tua analisi${azienda ? ` per <span style="color: #b596ff;">${azienda}</span>` : ''}!
              </h1>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #c4bfdb;">
                Grazie per aver completato il potenziometro di <strong>Adveny</strong>. Di seguito trovi il riepilogo dettagliato delle risposte fornite durante la valutazione.
              </p>

              <!-- BOX IN EVIDENZA 48 ORE -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px; background: rgba(139, 77, 255, 0.1); border-left: 4px solid #8b4dff; border-radius: 8px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 6px;">
                      ✦ I prossimi passi della tua analisi
                    </div>
                    <div style="font-size: 14px; line-height: 1.6; color: #e4dbff;">
                      Analizzeremo nel dettaglio le risposte fornite e <strong>un nostro consulente ti ricontatterà entro 48 ore</strong> per illustrarti il potenziale emerso e le strategie più efficaci per la tua attività.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- SEZIONE RISPOSTE -->
              <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #ffffff;">
                Riepilogo delle tue risposte
              </h2>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 28px; background-color: #171428;">
                ${tableRows}
              </table>

              <!-- DATI CONTATTO -->
              <div style="background-color: rgba(255,255,255,0.03); border-radius: 12px; padding: 18px 20px; margin-bottom: 28px; border: 1px solid rgba(255,255,255,0.06);">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #b596ff; margin-bottom: 8px;">
                  I tuoi dati di contatto
                </div>
                <div style="font-size: 14px; color: #f4f2f8; line-height: 1.6;">
                  <strong>Nome:</strong> ${data.nome_cognome || '-'}<br>
                  ${azienda ? `<strong>Azienda:</strong> ${azienda}<br>` : ''}
                  <strong>Email:</strong> ${data.email || '-'}<br>
                  <strong>Telefono:</strong> ${data.telefono || '-'}
                </div>
              </div>

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a19cb5;">
                A presto,<br>
                <strong style="color: #ffffff;">Il team di Adveny</strong>
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 36px; background-color: #0d0b17; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #7a7590; line-height: 1.5;">
              Adveny — Ecosistema di Crescita per Imprese e Professionisti in Sardegna.<br>
              <a href="https://adveny.it" style="color: #b596ff; text-decoration: none;">adveny.it</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function generateInternalNotificationHtml(data: AnswersPayload): string {
  const formattedHtml = generateCustomerEmailHtml(data)
  return `
    <div style="background: #ffeb3b; color: #000; padding: 10px 16px; font-weight: bold; font-family: sans-serif; text-align: center;">
      NOTIFICA NUOVO LEAD DAL POTENZIOMETRO SITO ADVENY
    </div>
    ${formattedHtml}
  `
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
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

      const senderEmail = env.SENDER_EMAIL || 'info@adveny.it'
      const senderName = env.SENDER_NAME || 'Adveny'
      const notifyEmail = env.NOTIFY_EMAIL || 'info@adveny.it'

      // 1. Aggiunta/aggiornamento del contatto in Brevo
      const contactBody: Record<string, unknown> = {
        email: payload.email.trim(),
        updateEnabled: true,
        attributes: {
          NOME: payload.nome_cognome.trim(),
          AZIENDA: payload.azienda ? payload.azienda.trim() : '',
          SMS: payload.telefono ? payload.telefono.trim() : '',
        },
      }

      if (env.BREVO_LIST_ID) {
        const listIdNum = parseInt(env.BREVO_LIST_ID, 10)
        if (!isNaN(listIdNum)) {
          contactBody.listIds = [listIdNum]
        }
      }

      // Salva contatto su Brevo (non blocchiamo l'invio se il contatto esiste già o ha campi parziali)
      try {
        await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': env.BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify(contactBody),
        })
      } catch (err) {
        console.warn('Errore durante la creazione contatto Brevo:', err)
      }

      // 2. Invio email automatica di riepilogo al cliente
      const customerEmailHtml = generateCustomerEmailHtml(payload)
      const emailPayload = {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: payload.email.trim(), name: payload.nome_cognome.trim() }],
        subject: 'Riepilogo della tua Analisi del Potenziale | Adveny',
        htmlContent: customerEmailHtml,
        replyTo: { email: senderEmail, name: senderName },
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

      // 3. Notifica interna per il team di Adveny (se l'email di notifica è diversa o per sicurezza)
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
              subject: `🔥 Nuovo lead potenziometro: ${payload.nome_cognome} (${payload.azienda || 'Senza azienda'})`,
              htmlContent: generateInternalNotificationHtml(payload),
            }),
          })
        } catch (notifyErr) {
          console.warn('Errore invio notifica interna:', notifyErr)
        }
      }

      return new Response(JSON.stringify({ success: true }), {
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
