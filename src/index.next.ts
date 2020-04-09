import fs from 'fs'
import { dirname as pathDirname, join as pathJoin } from 'path'
import {
  DocumentNode,
  DefinitionNode,
  ExecutableDefinitionNode,
  TypeDefinitionNode,
  DirectiveDefinitionNode,
  TypeExtensionNode,
  Source
} from 'graphql'
import { Location, Token } from 'graphql/language/ast'
import { createFilter as createFileFilter } from 'rollup-pluginutils'
import { loadTypedefs, parseSDL, LoadTypedefsOptions } from '@graphql-toolkit/core'
import { UrlLoader } from '@graphql-toolkit/url-loader'
import { JsonFileLoader } from '@graphql-toolkit/json-file-loader'
import { GraphQLFileLoader } from '@graphql-toolkit/graphql-file-loader'
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader'
import { PrismaLoader } from '@graphql-toolkit/prisma-loader'
import findUp from 'find-up'

import serialize from './serialize'

const defaultOptions = {
  loaders: [
    new UrlLoader(),
    new JsonFileLoader(),
    new GraphQLFileLoader(),
    new CodeFileLoader(),
    new PrismaLoader()
  ]
}

export type Options = {
  exclude?: RegExp | RegExp[] | string | string[]
  include?: RegExp | RegExp[] | string | string[]
}

type ExportedDefinitionNode =
  | ExecutableDefinitionNode
  | TypeDefinitionNode
  | DirectiveDefinitionNode
  | TypeExtensionNode

type RollupPluginContext = {
  addWatchFile: (filePath: string) => void
}

const watchGraphqlImports = async (ctx: RollupPluginContext, filePath: string) => {
  const fileDir = pathDirname(filePath)
  const file = await fs.promises.readFile(filePath, 'utf8')
  const deps = parseSDL(file)

  await Promise.all(
    deps.map(async (dep) => {
      const depFilePath = pathJoin(fileDir, dep.from)
      ctx.addWatchFile(depFilePath)
      await watchGraphqlImports(ctx, depFilePath)
    })
  )
}

const getLocation = (document: DocumentNode) => {
  const body = document.definitions.map(({ loc }) => loc?.source.body).join('\n')

  const { kind: startKind = '{', value: startValue } = document.definitions[0].loc?.startToken ?? {}
  const startEnd = (startValue ?? startKind).length
  const startToken = new Token(startKind, 0, startEnd, 1, 1, null, startValue)

  const lastDefinition = document.definitions[document.definitions.length - 1]
  const { kind: endKind = '}', value: endValue } = lastDefinition.loc?.endToken ?? {}
  const endEnd = (endValue ?? endKind).length
  const endToken = new Token(endKind, 0, endEnd, 1, 1, null, endValue)

  const source = new Source(body, 'GraphQLRequest', { line: 1, column: 1 })

  return new Location(startToken, endToken, source)
}

const getClassDefs = async () => {
  const packagePath = await findUp('package.json', { cwd: __dirname })
  const rootDir = pathDirname(packagePath ?? '')
  return fs.promises.readFile(pathJoin(rootDir, 'templates/classDefinitions.js'))
}

const getGraphqlSdl = async (
  ctx: RollupPluginContext,
  filePath: string,
  opts: LoadTypedefsOptions & Options
) => {
  await watchGraphqlImports(ctx, filePath)
  const results = await loadTypedefs(filePath, opts)
  const filtered = results.filter(
    (r): r is { document: DocumentNode } => typeof r.document !== undefined
  )
  const definitionFilter = (def: DefinitionNode): def is ExportedDefinitionNode => 'name' in def

  const classDefs = await getClassDefs()

  const namedExports = filtered
    .map(({ document: { definitions } }) => definitions)
    .reduce((definitions, acc) => [...acc, ...definitions])
    .filter(definitionFilter)
    .map(
      (def) =>
        `export const ${def.name?.value} = ${serialize({
          kind: 'Document',
          definitions: [def],
          loc: def.loc
        })}`
    )

  const reduced = filtered.reduce(
    ({ kind, definitions }, { document: { definitions: newDefs } }) => ({
      kind,
      definitions: [...definitions, ...newDefs]
    }),
    { kind: 'Document' as 'Document', definitions: [] as DefinitionNode[] }
  )

  const document: DocumentNode = { ...reduced, loc: getLocation(reduced) }

  const defaultExport = `export default ${serialize(document)}`

  return {
    code: [classDefs, ...namedExports, defaultExport].join('\n'),
    map: { mappings: '' } as { mappings: '' }
  }
}

function graphqlImport(opts?: Options) {
  const fileFilterInclude = opts?.include ?? '**/*.@(graphql|gql)'
  const fileFilter = createFileFilter(fileFilterInclude, opts?.exclude)

  return {
    load(id: string) {
      const options = { ...defaultOptions, ...opts }
      const ctx = (this as unknown) as RollupPluginContext
      if (fileFilter(id)) {
        return getGraphqlSdl(ctx, id, options)
      }

      return null
    },
    name: 'graphql-import'
  }
}

export default graphqlImport
