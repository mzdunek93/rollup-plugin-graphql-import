import {
  DocumentNode,
  DefinitionNode,
  ExecutableDefinitionNode,
  TypeDefinitionNode,
  DirectiveDefinitionNode,
  TypeExtensionNode
} from 'graphql'
import gql from 'graphql-tag'
import { Plugin } from 'rollup'
import { createFilter as createFileFilter, FilterPattern } from '@rollup/pluginutils'

import parseImports from './parseImports'
import serialize from './serialize'
import template from './template.hbs'

export type Options = {
  exclude?: FilterPattern
  include?: FilterPattern
}

type ExportedDefinitionNode =
  | ExecutableDefinitionNode
  | TypeDefinitionNode
  | DirectiveDefinitionNode
  | TypeExtensionNode

const defaultOptions = {
  include: /\.(graphql|gql)$/
}

const getNamedExports = ({ definitions, loc }: DocumentNode) =>
  definitions
    .filter((def: DefinitionNode): def is ExportedDefinitionNode => 'name' in def)
    .map((def) => ({
      name: def.name?.value,
      doc: serialize({ kind: 'Document', definitions: [def], loc })
    }))

export default (options?: Options): Plugin => {
  const { include, exclude } = { ...defaultOptions, ...options }
  const fileFilter = createFileFilter(include, exclude)

  return {
    transform: async (code: string, id: string) => {
      if (!fileFilter(id)) return

      const imports = parseImports(code)

      const document = gql`
        ${code}
      `

      const namedExports = getNamedExports(document)

      return template({ document: serialize(document), imports, namedExports })
    },
    name: 'graphql-import'
  }
}
