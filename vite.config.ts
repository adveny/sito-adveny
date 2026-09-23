import { defineConfig, type Plugin } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Inserisce header e footer condivisi al posto di <!--@nav--> e <!--@footer-->
function partials(): Plugin {
  const read = (n: string) => readFileSync(resolve(import.meta.dirname, 'src/partials', n), 'utf8')
  return {
    name: 'adveny-partials',
    transformIndexHtml(html) {
      return html
        .replace('<!--@head-->', read('head.html'))
        .replace('<!--@nav-->', read('nav.html'))
        .replace(/<!--@footer(?::(\w+))?-->/, (_m, variant) =>
          read('footer.html').replace('data-variant=""', `data-variant="${variant ?? ''}"`),
        )
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
