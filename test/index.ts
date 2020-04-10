/* eslint-disable ava/no-ignored-test-files */
import test from 'ava'
import { basename as pathBasename } from 'path'
import { print } from 'graphql'
import { rollup } from 'rollup'
import expectedSchema from './fixtures/output/schema'
import expectedWatchFileNames from './fixtures/output/watch-file-names'
import plugin from '../'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Module = require('module')

const graphqlFilePath = require.resolve('./fixtures/input')

function requireFromString(src: string) {
  const m = new Module('')
  m._compile(src, '')
  return m.exports
}

test('default options', async (t) => {
  const { generate, watchFiles } = await rollup({
    input: graphqlFilePath,
    plugins: [plugin()]
  })

  const watchFileNames = watchFiles.sort().map((path) => pathBasename(path))

  const { output } = await generate({
    format: 'cjs',
    sourcemap: true
  })

  const { code } = output[0]

  const schema = print(requireFromString(code))

  t.deepEqual(watchFileNames, expectedWatchFileNames)
  t.is(schema, expectedSchema)
})

test('with includes option', async (t) => {
  const { generate } = await rollup({
    input: graphqlFilePath,
    plugins: [plugin({ include: '**/*.graphql' })]
  })

  const { output } = await generate({
    format: 'cjs',
    sourcemap: true
  })

  const { code } = output[0]

  const schema = print(requireFromString(code))

  t.is(schema, expectedSchema)
})
