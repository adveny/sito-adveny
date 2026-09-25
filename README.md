# Adveny — sito web

Sito multi-pagina di Adveny, collettivo di professionisti del marketing e della comunicazione a Cagliari.
Vite + TypeScript, animazioni con GSAP (ScrollTrigger, SplitText) e scroll fluido con Lenis. Nessun framework, nessun backend.

## Avvio

Serve Node 20.19+ (o Bun).

```bash
npm install        # oppure: bun install
npm run dev        # sviluppo → http://localhost:5190
npm run build      # build statica in dist/
npm run preview    # anteprima della build → http://localhost:4190
```

## Pubblicazione

Pensato per **Vercel** (dominio `adveny.it`, senza www): preset Vite, comando `npm run build`, cartella `dist`.
Gli URL delle pagine restano con `.html` (`/servizi.html` ecc.): canonical e sitemap usano questa forma.

## Struttura

| Percorso | Contenuto |
|---|---|
| `index.html`, `chi-siamo.html`, `servizi.html`, `contatti.html`, `potenziometro.html` | Le 5 pagine |
| `src/partials/` | Head, nav e footer condivisi, inseriti dal plugin in `vite.config.ts` (`<!--@head-->`, `<!--@nav-->`, `<!--@footer-->`, varianti `<!--@footer:nocta-->` e `<!--@footer:analisi-->`) |
| `src/core.ts` | Scroll, luci di sfondo, nav, transizioni tra pagine, animazioni dei testi |
| `src/pages/*.ts` | Script di ogni pagina |
| `src/data.ts` | Domande del potenziometro e casi studio |
| `src/legal.ts` | Privacy e cookie policy (finestra, non pagina), banner del consenso, Google Consent Mode v2, caricamento di Tag Manager |
| `src/styles/main.css` | Tutto lo stile |
| `seo.ts` | Canonical, Open Graph e dati strutturati (JSON-LD) aggiunti a ogni pagina in build |
| `public/` | Font, immagini, video, `robots.txt`, `sitemap.xml` |
| `scripts/build-fonts.py` | Rigenera i font woff2 (Area Trial ha solo 97 glifi: accenti e simboli sono costruiti qui) |
| `CLAUDE.md` | Note dettagliate di progetto: scelte fatte, vincoli e trucchi da non rompere |

Prima di modificare hero, anelli, potenziometro o privacy leggere `CLAUDE.md`: molte scelte hanno motivi non ovvi.

## Da completare prima di andare online

- **Form non collegati**: contatti e potenziometro non inviano nulla. Vanno collegati a **Brevo** (contatto + email di recap dell'analisi). Il punteggio del potenziometro oggi è casuale.
- **Google Tag Manager**: inserire l'ID in `LEGAL.gtm` (`src/legal.ts`). In GTM i tag GA4 devono richiedere il consenso `analytics_storage`, il Pixel Meta `ad_storage`. In GA4 impostare la conservazione dei dati a 14 mesi.
- **Privacy**: email definitiva in `LEGAL.email` (ora provvisoria), accordo di contitolarità tra i titolari, revisione del testo da parte di un legale.
- **Social**: i link del footer puntano alle home di Facebook/Instagram/LinkedIn; con i profili veri aggiornare `src/partials/footer.html` e `sameAs` in `seo.ts`.
- **Font**: Area è in versione Trial; con la licenza completa sostituire i file in `public/fonts`.
- **Sitemap**: aggiornare `lastmod` in `public/sitemap.xml` quando cambiano le pagine.
- Anteprime dirette utili: `/potenziometro.html?risultato` (schermata finale), `/contatti.html?candidatura=1`.
