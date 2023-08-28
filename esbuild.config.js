const esbuild = require('esbuild')

const watchMode = process.argv.includes('--watch')

require('console-stamp')(console, {
  format: ':date(yyyy/mm/dd HH:MM:ss).green :watch()',
  tokens: {
    watch() {
      return watchMode ? '[WATCH]' : '\b'
    }
  }
})

console.log('build started')
esbuild
  .build({
    entryPoints: ['./src/extension.ts'],
    bundle: true,
    outfile: 'out/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    sourcemap: process.argv.includes('--sourcemap'),
    minify: process.argv.includes('--minify'),
    watch: watchMode && {
      onRebuild(error) {
        if (!error) {
          console.log('build finished')
        }
      }
    },
    loader: {
      '.ui.js': 'text'
    }
  })
  .then(() => console.log('build finished'))
  .catch(console.error)
