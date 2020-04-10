import typescript from '@rollup/plugin-typescript'
import handlebars from 'rollup-plugin-handlebars-plus'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [
  {
    external: ['fs', 'path', 'util', 'graphql', 'graphql/language/ast', 'graphql/language/parser'],
    input: 'src/index.ts',
    output: [
      { file: 'dist/cjs/index.js', format: 'cjs' },
      { file: 'dist/esm/index.js', format: 'esm' }
    ],
    plugins: [
      typescript({ module: 'ES2015', moduleResolution: 'node' }),
      handlebars(),
      resolve({ preferBuiltins: true }),
      commonjs()
    ]
  },
  {
    external: ['graphql'],
    input: 'src/helpers.ts',
    output: [
      { file: 'dist/helpers.js', format: 'cjs' },
      { file: 'dist/helpers.mjs', format: 'esm' }
    ],
    plugins: [typescript({ module: 'ES2015', moduleResolution: 'node' })]
  }
]
