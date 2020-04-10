import { Source } from 'graphql'
import { Location, Token } from 'graphql/language/ast'

const addIndent = (arr: string[]) => arr.map((el) => el.replace(/\n/g, '\n  '))

const chooseTemplate = (arr: string[], o: string, c: string) =>
  arr.reduce((acc, el) => acc + el.length, 0) > 50
    ? `${o}\n  ${addIndent(arr).join(',\n  ')}\n${c}`
    : `${o}${addIndent(arr).join(',')}${c}`

const s = (literals: TemplateStringsArray, ...args: unknown[]) =>
  literals
    .slice(0, -1)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    .map((str, i) => str + serialize(args[i]))
    .join('') + literals[literals.length - 1]

const serializeSource = ({ body, name, locationOffset }: Source) =>
  s`new Source(${body},${name},${locationOffset})`

const serializeToken = ({ kind, start, end, line, column, value }: Token) =>
  s`new Token(${kind},${start},${end},${line},${column},null,${value})`

const serializeLocation = ({ startToken, endToken, start, end, source }: Location) =>
  s`new Location(${startToken || { start }},${endToken || { end }},${source})`

const serializeArray = (arr: unknown[]) =>
  // eslint-disable-next-line prettier/prettier
  chooseTemplate(arr.map((val) => s`${val}`), '[', ']')

const serializeObject = (obj: object) =>
  // eslint-disable-next-line prettier/prettier
  chooseTemplate(Object.entries(obj).map(([key, value]) => s`${key}: ${value}`), '{', '}')

const serialize = (val: unknown): string =>
  val instanceof Location
    ? serializeLocation(val)
    : val instanceof Token
    ? serializeToken(val)
    : val instanceof Source
    ? serializeSource(val)
    : Array.isArray(val)
    ? serializeArray(val)
    : typeof val === 'object' && val
    ? serializeObject(val)
    : JSON.stringify(val)

export default serialize
