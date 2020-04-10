const interpolate = (regExp: RegExp, vars: object) =>
  new RegExp(
    Object.entries(vars).reduce(
      (source, [key, val]) => source.replace(new RegExp(`{${key}}`, 'g'), val.source),
      regExp.source
    )
  )

const imported = /(?:(\w+)|\w+ as \s*(\w+))/
const NAMED_IMPORT_REGEXP = interpolate(
  /^(?: (\w+)\s*,)?\s*\{\s*{imported}(?:\s*,\s*{imported})*\s*\}$/,
  { imported }
)
const GLOB_IMPORT_REGEXP = /^\*\s*as \s*(\w+)\s* $/
const DEFAULT_IMPORT_REGEXP = /^ (\w+)\s* $/
const importExps = [NAMED_IMPORT_REGEXP, GLOB_IMPORT_REGEXP, DEFAULT_IMPORT_REGEXP]
const importExp = new RegExp(
  importExps
    .map((regExp) => regExp.source.replace(/(?<!\\)\((?!\?:)/g, '(?:').slice(1, -1))
    .join('|')
)
const IMPORT_REGEXP = interpolate(/^#\s*import\s*({importExp})\s*from\s*('.+'|".+")$/, {
  importExp
})

const parseVarExp = (varExp: string) =>
  varExp
    .match(importExps.find((exp) => exp.test(varExp)) ?? DEFAULT_IMPORT_REGEXP)
    ?.slice(1)
    .map((name) => name.trim()) ?? []

export default (code: string) =>
  code
    .split(/\r\n|\r|\n/)
    .map((line) => line.match(IMPORT_REGEXP))
    .filter((matches): matches is RegExpMatchArray => matches !== null)
    .map(([, varExp, filename]) => ({
      varExp: varExp.trim(),
      filename,
      varNames: parseVarExp(varExp)
    }))
