import { defineConfig, type Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { seoTags } from './seo'

// Inserisce header e footer condivisi al posto di <!--@nav--> e <!--@footer-->
// (<!--@footer:nocta--> senza CTA, <!--@footer:analisi--> con la CTA al potenziometro)
function partials(): Plugin {
  const read = (n: string) => readFileSync(resolve(import.meta.dirname, 'src/partials', n), 'utf8')
  return {
    name: 'adveny-partials',
    transformIndexHtml(html, ctx) {
      // tag SEO (canonical, anteprime social, dati strutturati) dal titolo e dalla descrizione della pagina
      const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? 'Adveny'
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? ''
      return html
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
