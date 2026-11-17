import { defineConfig, type Plugin } from 'vite'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  seoTags,
  renderStaticCases,
  renderStaticSectors,
  renderStaticTeam,
  renderStaticPotenziometro,
} from './seo'

// Inserisce header, footer e contenuti pre-renderizzati per la SEO in fase di build
// (<!--@footer:nocta--> senza CTA, <!--@footer:analisi--> con la CTA al potenziometro)
function partials(): Plugin {
  const read = (n: string) => readFileSync(resolve(import.meta.dirname, 'src/partials', n), 'utf8')
  return {
    name: 'adveny-partials',
    buildStart() {
      // Aggiorna automaticamente lastmod nella sitemap alla data della build
      try {
        const sitemapPath = resolve(import.meta.dirname, 'public/sitemap.xml')
        const today = new Date().toISOString().slice(0, 10)
        const xml = readFileSync(sitemapPath, 'utf8').replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`)
        writeFileSync(sitemapPath, xml, 'utf8')
      } catch {
        /* ignora se in sola lettura */
      }
    },
    transformIndexHtml(html, ctx) {
      // tag SEO (canonical, anteprime social, dati strutturati) dal titolo e dalla descrizione della pagina
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? 'Adveny'
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''
      let out = html
        .replace('<!--@head-->', read('head.html') + seoTags(ctx.path, title, description))
        .replace('<!--@nav-->', read('nav.html'))
        .replace(/<!--@footer(?::(\w+))?-->/, (_m, variant) => {
          let footer = read('footer.html').replace('data-variant=""', `data-variant="${variant ?? ''}"`)
          // variante "analisi": la CTA del footer porta al potenziometro invece che ai contatti
          if (variant === 'analisi') {
            footer = footer.replace(
              '<a class="btn btn--light" href="/contatti.html"><span>Raccontaci il tuo progetto</span></a>',
              '<a class="btn btn--light" href="/potenziometro.html"><span>Scopri il tuo potenziale</span></a>',
            )
          }
          return footer
        })

      // Pre-rendering statico dei blocchi popolati via JS (Casi Studio, Settori, Team, Potenziometro)
      if (out.includes('data-cases-track')) {
        out = out.replace('<div class="cases__track" data-cases-track></div>', `<div class="cases__track" data-cases-track>${renderStaticCases()}</div>`)
      }
      if (out.includes('data-sectors')) {
        out = out.replace('<div class="options" data-sectors></div>', `<div class="options" data-sectors>${renderStaticSectors()}</div>`)
      }
      if (out.includes('data-team')) {
        out = out.replace('<div class="team" data-team></div>', `<div class="team" data-team>${renderStaticTeam()}</div>`)
      }
      if (out.includes('data-pz-main')) {
        const { stepsNav, mainHtml } = renderStaticPotenziometro()
        out = out
          .replace('<ol class="pz__steps" data-pz-steps aria-hidden="true"></ol>', `<ol class="pz__steps" data-pz-steps aria-hidden="true">${stepsNav}</ol>`)
          .replace('<main data-pz-main></main>', `<main data-pz-main>${mainHtml}</main>`)
      }
      return out
    },
  }
}

export default defineConfig({
  plugins: [partials()],
  server: { port: 5190 },
  preview: { port: 4190, strictPort: true },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'chi-siamo.html'),
        servizi: resolve(import.meta.dirname, 'servizi.html'),
        contatti: resolve(import.meta.dirname, 'contatti.html'),
        potenziometro: resolve(import.meta.dirname, 'potenziometro.html'),
      },
    },
  },
})
