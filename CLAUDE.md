# Sito Adveny 3D

Sito multi-pagina per l'agenzia di marketing Adveny (adveny.it), in locale. Vite + TypeScript, GSAP (ScrollTrigger, SplitText), Lenis. Nessun WebGL: stile hi-tech sobrio (nero, aloni di luce CSS, vetro sottile).

## Comandi
- `~/.bun/bin/bun run dev` → sviluppo su http://localhost:5190
- `~/.bun/bin/bun run build && ~/.bun/bin/bun run preview` → anteprima su http://localhost:4190 (la 4174 è di Q-Optics)

## Struttura
- Pagine: `index.html`, `chi-siamo.html`, `servizi.html`, `contatti.html`, `potenziometro.html`. Head, nav e footer condivisi in `src/partials/` e inseriti dal plugin in `vite.config.ts` (`<!--@nav-->`, `<!--@footer-->`, `<!--@footer:nocta-->` nasconde la CTA del footer).
- `src/core.ts`: scroll, nav, transizioni tra pagine, animazioni dei testi (`data-split="words|lines|chars"`, `data-reveal`, `data-stagger`, `data-count`).
- `src/pages/home.ts`: hero guidata dallo scroll (500vh, stage sticky). Le keyword salgono lettera per lettera in Area Extended, poi "We are" + logo originale (mai modificato) e tre anelli SVG piatti (ecosistema Adveny), uno per keyword, che girano via CSS. La prima keyword entra da sola al caricamento.
- `src/data.ts`: testi del potenziometro e casi studio. Tutti i copy sono presi da adveny.it senza modifiche.
- `src/styles/main.css`: design system (aloni `.aura`, vetro sottile, gradiente aura viola → lavanda sulla classe `.iri`).

## Note
- Font: Area **Trial** (solo 97 glifi). `scripts/build-fonts.py` costruisce accenti, apostrofo, + % € : / ecc. e genera i woff2 in `public/fonts`. Con la licenza completa si possono usare direttamente i file ufficiali. Le legature fi/fl del trial sono vuote: sono disattivate nel CSS.
- In CSS il `-webkit-backdrop-filter` va scritto PRIMA di `backdrop-filter`, altrimenti il minificatore tiene solo il prefissato.
- Il body non deve avere sfondo: coprirebbe gli aloni fissi.
- Anelli SVG: `transform-box: view-box` con `transform-origin: 0 0` (il viewBox è centrato su 0,0).
- Video dei casi studio compressi in `public/video` (900px, H.264). Pusceddu Termoidraulica usa ancora un segnaposto generico.
