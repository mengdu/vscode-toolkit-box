const esbuild = require('esbuild')
const builtinModules = require('builtin-modules')

const isDev = process.argv.slice(2).includes('--dev')

;(async () => {
  await esbuild.build({
    entryPoints: [
      { in: 'src/main.ts', out: 'main' },
    ],
    outdir: 'dist',
    bundle: true,
    external: ['^node:', 'vscode', ...builtinModules],
    sourcemap: isDev ? 'linked' : false,
    minify: isDev ? false : true,
    platform: 'node',
    format: 'cjs',
    target: ['esnext'],
    define: {
      'process.env.NODE_ENV': isDev ? '"development"' : '"production"'
    },
    logLevel: 'debug',
    plugins: []
  })
})()
