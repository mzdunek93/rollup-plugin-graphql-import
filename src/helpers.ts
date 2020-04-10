import { DefinitionNode, DocumentNode } from 'graphql'

const getDefName = ({ kind, ...def }: DefinitionNode) => ('name' in def ? def.name?.value : kind)

const containsDef = (acc: DefinitionNode[], def: DefinitionNode) =>
  acc.some((accDef) => accDef.kind === def.kind && getDefName(accDef) === getDefName(def))

export const mergeImportDefs = (doc: DocumentNode, imports: { [key: string]: DocumentNode }) => ({
  ...doc,
  definitions: Object.values(imports)
    .concat([doc])
    .reduce((acc, { definitions }) => [...acc, ...definitions], [] as DefinitionNode[])
    .reduce((acc, def) => (containsDef(acc, def) ? acc : [...acc, def]), [] as DefinitionNode[])
})
